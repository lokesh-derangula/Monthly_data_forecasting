import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import Ridge
from models import TestReport

# The list of numerical metrics we want to predict (optimized to only include UI visible metrics)
METRICS_TO_FORECAST = [
    "totalTestsByApplication", "storyTests", "regressionTestsAutomated", "regressionTestsManual",
    "storyPassed", "storyFailed", "storyBugs",
    "arPassed", "arFailed", "arBugs",
    "mrPassed", "mrFailed", "mrBugs"
]

# In-memory prediction cache to support instant loading
_forecast_cache = {}

def get_forecast_cache_key(project_name: str, reports: list) -> tuple:
    if not reports:
        return (project_name, 0, None)
    last_report = reports[-1]
    return (
        project_name,
        len(reports),
        getattr(last_report, "id", None),
        last_report.createdAt.timestamp() if getattr(last_report, "createdAt", None) else None
    )

def get_cached_forecast(project_name: str, reports: list) -> dict | None:
    key = get_forecast_cache_key(project_name, reports)
    return _forecast_cache.get(key)

def set_cached_forecast(project_name: str, reports: list, payload: dict):
    key = get_forecast_cache_key(project_name, reports)
    _forecast_cache[key] = payload

def clear_forecast_cache():
    _forecast_cache.clear()

def get_volume_metric_for(metric_name: str) -> str:
    """Helper to return the base test volume metric corresponding to a result metric."""
    if metric_name.startswith("story"):
        return "storyTests"
    elif metric_name.startswith("ar"):
        return "regressionTestsAutomated"
    elif metric_name.startswith("mr"):
        return "regressionTestsManual"
    return "totalTestsByApplication"

def calculate_slope(y: np.ndarray) -> float:
    """Calculates the slope of a simple linear trend for the given data points."""
    if len(y) < 2:
        return 0.0
    x = np.arange(len(y))
    # Simple linear regression slope
    x_mean = np.mean(x)
    y_mean = np.mean(y)
    numerator = np.sum((x - x_mean) * (y - y_mean))
    denominator = np.sum((x - x_mean) ** 2)
    if denominator == 0:
        return 0.0
    return float(numerator / denominator)

def preprocess_and_engineer_features(df: pd.DataFrame, target_metric: str) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Builds lag features, moving averages, and trend indicators for a target metric.
    Returns:
        X: Feature DataFrame
        y: Target DataFrame (next 4 weeks of target_metric)
    """
    df = df.sort_values("createdAt").reset_index(drop=True)
    n_samples = len(df)
    
    features = []
    targets = []
    
    # We need at least 4 past weeks to create features, and 4 future weeks to create targets.
    # So index ranges from 3 (4th week) to n_samples - 5
    for i in range(3, n_samples - 4):
        # 1. Self Lags
        lag_1 = df.loc[i, target_metric]
        lag_2 = df.loc[i-1, target_metric]
        lag_3 = df.loc[i-2, target_metric]
        lag_4 = df.loc[i-3, target_metric]
        
        # 2. Moving Average (4 weeks)
        ma_4 = np.mean([lag_1, lag_2, lag_3, lag_4])
        
        # 3. Trend (Slope of last 4 weeks)
        trend = calculate_slope(np.array([lag_4, lag_3, lag_2, lag_1]))
        
        # 4. Input Volume Context (Lag 1 of the volume metric, e.g., total story tests)
        vol_metric = get_volume_metric_for(target_metric)
        vol_lag_1 = df.loc[i, vol_metric] if vol_metric in df.columns else lag_1
        
        row_features = {
            "lag_1": lag_1,
            "lag_2": lag_2,
            "lag_3": lag_3,
            "ma_4": ma_4,
            "trend": trend,
            "volume_lag_1": vol_lag_1
        }
        
        # Target: Next 4 weeks
        row_targets = {
            "t_1": df.loc[i+1, target_metric],
            "t_2": df.loc[i+2, target_metric],
            "t_3": df.loc[i+3, target_metric],
            "t_4": df.loc[i+4, target_metric]
        }
        
        features.append(row_features)
        targets.append(row_targets)
        
    return pd.DataFrame(features).astype(float), pd.DataFrame(targets).astype(float)

def train_and_forecast_metric(
    df: pd.DataFrame, 
    target_metric: str
) -> Tuple[np.ndarray, Dict[str, float], List[Dict[str, Any]]]:
    """
    Trains a model for target_metric, predicts the next 4 weeks, and calculates feature contributions.
    Returns:
        forecast: 4 predicted weekly values (list/array)
        metadata: averages and percentage change
        explanations: contribution of each feature to the forecast
    """
    # 1. Check if we have enough data (minimum 8 reports to train, otherwise fallback)
    n_records = len(df)
    
    # Calculate historical averages for fallback and explanation comparison
    historical_avg = float(df[target_metric].mean())
    recent_avg = float(df[target_metric].tail(4).mean())
    
    if n_records < 8:
        # Fallback to simple extrapolation / historical average
        latest_val = float(df[target_metric].iloc[-1])
        trend = calculate_slope(df[target_metric].values)
        
        # Forecast 4 weeks using simple linear trend
        forecast = np.array([latest_val + trend * (w + 1) for w in range(4)])
        # Ensure values don't drop below 0
        forecast = np.clip(forecast, 0, None)
        
        predicted_sum = float(np.sum(forecast))
        prev_month_sum = float(df[target_metric].tail(4).sum())
        pct_change = ((predicted_sum - prev_month_sum) / max(1.0, prev_month_sum)) * 100
        
        explanations = [
            {"feature": "Historical Baseline", "contribution": historical_avg, "description": "Baseline average of all records"},
            {"feature": "Recent Trend", "contribution": trend * 2.5, "description": "Extrapolated trend due to insufficient data"}
        ]
        
        return forecast, {
            "predicted_sum": predicted_sum,
            "current_average": recent_avg,
            "percentage_change": pct_change
        }, explanations

    # 2. Build feature matrix and target matrix
    X, y = preprocess_and_engineer_features(df, target_metric)
    
    if len(X) == 0:
        # Fallback if preprocessing yields empty rows
        forecast = np.array([recent_avg] * 4)
        return forecast, {"predicted_sum": recent_avg * 4, "current_average": recent_avg, "percentage_change": 0.0}, []
        
    # 3. Train multi-output model (Ensemble of Ridge and RandomForest for robustness)
    # Ridge is great for stable trends; RandomForest captures non-linear relationships.
    # Set n_estimators=20 for faster fitting on small datasets without accuracy degradation.
    model_rf = RandomForestRegressor(n_estimators=20, random_state=42, max_depth=5)
    model_ridge = Ridge(alpha=1.0)
    
    model_rf.fit(X, y)
    model_ridge.fit(X, y)
    
    # 4. Prepare latest features to predict the future (from the very end of our dataset)
    latest_idx = len(df) - 1
    lag_1 = df.loc[latest_idx, target_metric]
    lag_2 = df.loc[latest_idx-1, target_metric]
    lag_3 = df.loc[latest_idx-2, target_metric]
    lag_4 = df.loc[latest_idx-3, target_metric]
    ma_4 = np.mean([lag_1, lag_2, lag_3, lag_4])
    trend = calculate_slope(np.array([lag_4, lag_3, lag_2, lag_1]))
    
    vol_metric = get_volume_metric_for(target_metric)
    vol_lag_1 = df.loc[latest_idx, vol_metric] if vol_metric in df.columns else lag_1
    
    X_latest = pd.DataFrame([{
        "lag_1": lag_1,
        "lag_2": lag_2,
        "lag_3": lag_3,
        "ma_4": ma_4,
        "trend": trend,
        "volume_lag_1": vol_lag_1
    }]).astype(float)
    
    # 5. Predict
    pred_rf = model_rf.predict(X_latest)[0]
    pred_ridge = model_ridge.predict(X_latest)[0]
    
    # Average the models for robust prediction
    forecast = (pred_rf + pred_ridge) / 2
    forecast = np.clip(forecast, 0, None)  # No negative testing counts
    
    predicted_sum = float(np.sum(forecast))
    prev_month_sum = float(df[target_metric].tail(4).sum())
    pct_change = ((predicted_sum - prev_month_sum) / max(1.0, prev_month_sum)) * 100
    
    # 6. Explainability: Perturbation Method (Local Feature Contribution)
    # This measures how much the latest forecast changes when a feature is set to its historical average.
    feature_columns = X.columns
    explanations = []
    
    # Base prediction for comparison
    base_pred_sum = float(np.sum((model_rf.predict(X_latest)[0] + model_ridge.predict(X_latest)[0]) / 2))
    
    feature_nice_names = {
        "lag_1": "Last Week's Value",
        "lag_2": "Two Weeks Ago Value",
        "lag_3": "Three Weeks Ago Value",
        "ma_4": "4-Week Moving Average",
        "trend": "Recent 4-Week Trend",
        "volume_lag_1": f"Base Test Volume ({vol_metric})"
    }
    
    feature_descriptions = {
        "lag_1": "Compares last week's performance directly with long-term baseline",
        "lag_2": "Measures inertia from testing metrics two weeks back",
        "lag_3": "Measures inertia from testing metrics three weeks back",
        "ma_4": "Represents the steady-state average of the past month",
        "trend": "Captures whether testing velocity is accelerating or decelerating",
        "volume_lag_1": "Accounts for changes in overall test suite size or allocations"
    }
    
    for col in feature_columns:
        # Calculate historical average for this feature
        col_mean = X[col].mean()
        
        # Perturb
        X_perturbed = X_latest.copy()
        X_perturbed.loc[0, col] = col_mean
        
        # Run prediction
        pred_rf_p = model_rf.predict(X_perturbed)[0]
        pred_ridge_p = model_ridge.predict(X_perturbed)[0]
        perturbed_pred_sum = float(np.sum((pred_rf_p + pred_ridge_p) / 2))
        
        # Contribution: how much the actual value pulled it up/down compared to the mean value
        contribution = base_pred_sum - perturbed_pred_sum
        
        explanations.append({
            "feature": feature_nice_names.get(col, col),
            "contribution": float(round(contribution, 2)),
            "description": feature_descriptions.get(col, "")
        })
        
    # Re-normalize explanations to sum up to difference from baseline (for clean waterfall chart)
    # A base intercept/baseline explanation is added:
    baseline_pred = float(np.sum((model_rf.predict(pd.DataFrame([X.mean()]))[0] + model_ridge.predict(pd.DataFrame([X.mean()]))[0]) / 2))
    
    explanations.append({
        "feature": "Baseline (Historical Mean)",
        "contribution": float(round(baseline_pred, 2)),
        "description": "The expected value if all metrics matched their historical average"
    })
    
    return forecast, {
        "predicted_sum": predicted_sum,
        "current_average": recent_avg,
        "percentage_change": pct_change
    }, explanations

def generate_forecast_response(
    reports: List[TestReport]
) -> Dict[str, Any]:
    """
    Main entrypoint: parses reports database objects, builds dataframes, trains forecasting model,
    and formats JSON response.
    """
    # 1. Convert report models to dictionary list
    data = []
    for r in reports:
        d = r.model_dump()
        # Convert datetime to ISO string
        d["createdAt"] = d["createdAt"].isoformat()
        data.append(d)
        
    df = pd.DataFrame(data)
    
    # 2. Sort by date
    df["createdAt"] = pd.to_datetime(df["createdAt"], format='mixed')
    df = df.sort_values("createdAt").reset_index(drop=True)
    
    # 3. Forecast each metric
    forecast_results = {}
    
    # We will also format historical weekly points for visual comparison on the frontend
    # Limit historical graph data to the last 12 weeks to keep UI charts clean and focused
    historical_data_slice = df.tail(12)
    formatted_historical = []
    for _, row in historical_data_slice.iterrows():
        item = {}
        for col in METRICS_TO_FORECAST:
            val = row[col]
            item[col] = val.item() if hasattr(val, "item") else val
        item["date"] = row["createdAt"].strftime("%Y-%m-%d")
        formatted_historical.append(item)
        
    for metric in METRICS_TO_FORECAST:
        weekly_predictions, meta, explainability = train_and_forecast_metric(df, metric)
        
        # Build predictions array with simulated future dates
        last_date = df["createdAt"].iloc[-1]
        future_weeks = []
        for w in range(4):
            f_date = (last_date + timedelta(weeks=w+1)).strftime("%Y-%m-%d")
            future_weeks.append({
                "date": f_date,
                "value": float(round(weekly_predictions[w], 2))
            })
            
        forecast_results[metric] = {
            "metric": metric,
            "predicted_value": float(round(meta["predicted_sum"], 2)),
            "current_average": float(round(meta["current_average"] * 4, 2)), # Multiply by 4 to compare month-to-month
            "percentage_change": float(round(meta["percentage_change"], 2)),
            "weekly_forecast": future_weeks,
            "explainability": explainability
        }
        
    return {
        "projectName": df["projectName"].iloc[0] if len(df) > 0 else "Unknown",
        "historical_weeks_count": len(df),
        "forecast": forecast_results,
        "historical_data": formatted_historical
    }
