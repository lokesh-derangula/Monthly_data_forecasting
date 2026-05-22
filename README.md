# TestForce.ai - AI Prediction API & Analytics Dashboard

TestForce.ai is a full-stack predictive quality intelligence platform designed for software testing analytics. It ingests weekly test reports, trains machine learning models on project trends, and forecasts monthly quality metrics. It features **lightweight model explainability** (local feature attributions similar to SHAP/LIME) to justify its predictions.

---

## 🚀 Key Features

1. **AI-Powered Monthly Forecasting:** Extrapolates 4 weeks into the future using an ensemble of Random Forest and Ridge Regression models based on lagged features, moving averages, and local velocities.
2. **Interactive Explainability Dashboard:** Simulates SHAP waterfall plots via local feature perturbation, illustrating exactly how each metric (e.g., recent bug rates, moving averages) influenced the prediction.
3. **Glassmorphic Analytics UI:** A stunning, responsive UI built with React, Recharts, and Vanilla CSS, utilizing premium dark-theme neon gradients.
4. **Live Data Injection & Real-Time Totals:** A smart weekly report logger that automatically aggregates sub-categories and provides a one-click "Realistic Mock Data Autofill" customized to specific project risk profiles.
5. **Comprehensive Integration Testing:** Includes a fully configured `pytest` suite verifying endpoint responses, model integrity, and edge cases.

---

## 🛠️ Tech Stack

*   **Backend:** FastAPI (Async API), SQLModel (ORM integrating SQLAlchemy & Pydantic), SQLite (Local Database).
*   **Machine Learning:** scikit-learn (RandomForestRegressor, Ridge), Pandas, NumPy.
*   **Frontend:** React.js, Vite, Recharts (Responsive charts), Lucide-React (Icons), Vanilla CSS.
*   **Testing:** PyTest, HTTPX.

---

## 📂 Project Directory Structure

```text
ai-test-forecaster/
├── backend/
│   ├── main.py          # FastAPI server and async endpoints
│   ├── models.py        # SQLModel schemas and API request validators
│   ├── database.py      # SQLite database configuration and session manager
│   ├── forecaster.py    # Feature engineering, ML training, & SHAP-like explanations
│   ├── seed.py          # Generates 1 year of historical logs for 3 project types
│   ├── test_api.py      # Automated integration test suite
│   ├── requirements.txt # Python dependency file
│   └── forecaster.db    # Auto-generated SQLite database
└── frontend/
    ├── index.html       # Entry HTML with SEO meta tags
    ├── package.json     # Node.js dependencies (React, Recharts, Lucide)
    └── src/
        ├── main.jsx     # Vite React mount
        ├── App.jsx      # Core UI controller & state hub
        ├── App.css      # Custom dark-theme glassmorphism CSS
        └── components/
            ├── DashboardView.jsx  # Historical area/line charts & table
            ├── ForecastView.jsx   # Predictor dashboard & waterfall attributions
            └── ReportForm.jsx     # Dynamic form with mock data generator
```

---

## 🏁 Setup & Execution

### 1. Run Backend Server
Ensure Python (3.9+) is installed. Open a terminal in the `backend/` folder and execute:
```bash
# Install dependencies
pip install -r requirements.txt

# Run integration tests to verify compile checks
pytest test_api.py

# Start FastAPI server (CORS is configured for localhost)
python main.py
```
The backend starts at: `http://127.0.0.1:8000`. You can visit `http://127.0.0.1:8000/docs` to interact with the FastAPI Swagger UI.

### 2. Run Frontend Dashboard
Open a separate terminal in the `frontend/` folder and execute:
```bash
# Install Node modules
npm install

# Start Vite React server
npm run dev
```
The application will open at: `http://localhost:5173`.

---


