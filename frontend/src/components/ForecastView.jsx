import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, HelpCircle, Cpu, Info, ShieldAlert 
} from 'lucide-react';

const CATEGORIZED_METRICS = [
  {
    category: "General Volume",
    metrics: [
      { id: "totalTestsByApplication", label: "Total Tests Run" },
      { id: "storyTests", label: "Story Tests" },
      { id: "regressionTestsAutomated", label: "Automated Regression" },
      { id: "regressionTestsManual", label: "Manual Regression" }
    ]
  },
  {
    category: "Story Results",
    metrics: [
      { id: "storyPassed", label: "Stories Passed" },
      { id: "storyFailed", label: "Stories Failed" },
      { id: "storyBugs", label: "Story Bugs Found" }
    ]
  },
  {
    category: "Automation Results",
    metrics: [
      { id: "arPassed", label: "Auto Passes" },
      { id: "arFailed", label: "Auto Fails" },
      { id: "arBugs", label: "Auto Bugs Found" }
    ]
  },
  {
    category: "Manual Results",
    metrics: [
      { id: "mrPassed", label: "Manual Passes" },
      { id: "mrFailed", label: "Manual Fails" },
      { id: "mrBugs", label: "Manual Bugs Found" }
    ]
  }
];

export default function ForecastView({ forecastData }) {
  const [selectedMetric, setSelectedMetric] = useState("totalTestsByApplication");
  const [hoveredFeature, setHoveredFeature] = useState(null);

  if (!forecastData || !forecastData.forecast) {
    return (
      <div className="glass-card empty-state">
        <Cpu size={48} className="empty-state-icon" />
        <h3>Prediction data unavailable</h3>
        <p>Ensure historical reports are loaded and train request has completed.</p>
      </div>
    );
  }

  const activeForecast = forecastData.forecast[selectedMetric];
  const historicalPoints = forecastData.historical_data || [];
  
  if (!activeForecast) return null;

  // Prepare unified dataset for history + forecast (connecting them cleanly)
  const chartData = [];
  
  // 1. Add historical actuals
  historicalPoints.forEach(pt => {
    chartData.push({
      date: pt.date,
      actual: pt[selectedMetric],
      predicted: null
    });
  });

  // 2. Insert connection point (last actual matches first prediction coordinates)
  if (chartData.length > 0 && activeForecast.weekly_forecast.length > 0) {
    const lastHist = chartData[chartData.length - 1];
    lastHist.predicted = lastHist.actual;
    
    // 3. Add future predictions
    activeForecast.weekly_forecast.forEach(pred => {
      chartData.push({
        date: pred.date,
        actual: null,
        predicted: pred.value
      });
    });
  }

  const formatLabel = (metricId) => {
    for (const cat of CATEGORIZED_METRICS) {
      const found = cat.metrics.find(m => m.id === metricId);
      if (found) return found.label;
    }
    return metricId;
  };

  // Determine if a positive change is good or bad (e.g. bugs going down is positive/good, passes going up is positive/good)
  const isGoodOutcome = (metricId, pctChange) => {
    const isDefect = metricId.toLowerCase().includes("failed") || metricId.toLowerCase().includes("bugs") || metricId.toLowerCase().includes("blocked");
    if (isDefect) {
      return pctChange <= 0; // Bugs decreasing is good
    }
    return pctChange >= 0; // Passes/executions increasing is good
  };

  const pct = activeForecast.percentage_change;
  const isGood = isGoodOutcome(selectedMetric, pct);

  // Sorting explanations: Put baseline first, then sort contributions by absolute value descending
  const explanations = [...activeForecast.explainability];
  const baselineItem = explanations.find(item => item.feature.includes("Baseline"));
  const otherExplanations = explanations
    .filter(item => !item.feature.includes("Baseline"))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  const sortedExplanations = baselineItem ? [baselineItem, ...otherExplanations] : otherExplanations;

  // Max contribution to scale progress bars
  const maxContrib = Math.max(...otherExplanations.map(e => Math.abs(e.contribution)), 1);

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Metric Selector Group */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem' }}>
        <h4 style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)', marginBottom: '0.5rem', fontWeight: 600 }}>
          Select Target Metric to Forecast:
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {CATEGORIZED_METRICS.map((cat, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, width: '120px', color: 'var(--neutral-gray)' }}>
                {cat.category}:
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flex: 1 }}>
                {cat.metrics.map(m => (
                  <button
                    key={m.id}
                    className={`forecast-metric-tab ${selectedMetric === m.id ? 'active' : ''}`}
                    onClick={() => setSelectedMetric(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Forecast Layout */}
      <div className="dashboard-layout">
        
        {/* Left Column: Forecast Metrics & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Metrics Comparative Panel */}
          <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            
            <div className="glass-card metric-card" style={{ '--accent': 'var(--neutral-gray)' }}>
              <div className="metric-header">
                <span>Last Month Sum</span>
                <Info size={16} />
              </div>
              <div className="metric-value">{activeForecast.current_average.toFixed(1)}</div>
              <div className="metric-footer neutral">
                <span>Based on recent 4 weeks actuals</span>
              </div>
            </div>

            <div className="glass-card metric-card" style={{ '--accent': 'var(--primary)' }}>
              <div className="metric-header">
                <span>Predicted Next Month</span>
                <Cpu size={16} />
              </div>
              <div className="metric-value">{activeForecast.predicted_value.toFixed(1)}</div>
              <div className="metric-footer neutral">
                <span>Aggregated next 4 weeks projection</span>
              </div>
            </div>

            <div className="glass-card metric-card" style={{ '--accent': isGood ? 'var(--success)' : 'var(--error)' }}>
              <div className="metric-header">
                <span>Month-over-Month Change</span>
                {isGood ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              </div>
              <div className="metric-value" style={{ color: isGood ? 'var(--success)' : 'var(--error)' }}>
                {pct >= 0 ? '+' : ''}{pct.toFixed(1)}%
              </div>
              <div className={`metric-footer ${isGood ? 'positive' : 'negative'}`}>
                <span>{isGood ? 'Favorable forecast trend' : 'Needs attention - unfavorable trend'}</span>
              </div>
            </div>

          </div>

          {/* Time Series Chart */}
          <div className="glass-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">4-Week Extrapolated Forecast</h3>
                <p className="card-subtitle">
                  The model consumes weekly QA reports and predicts the next monthly testing outcomes (4-week aggregate forecast) for <strong>{formatLabel(selectedMetric)}</strong>.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span className="status-pill secondary">Actual History</span>
                <span className="status-pill primary" style={{ borderStyle: 'dashed' }}>AI Forecast</span>
              </div>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip 
                    contentStyle={{
                      background: '#0C0F16',
                      border: '1px solid #1E2530',
                      borderRadius: '4px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.7)'
                    }}
                    labelFormatter={(label) => `Week ending ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    name="Actual Value" 
                    stroke="var(--secondary)" 
                    strokeWidth={3} 
                    dot={{ r: 4, stroke: 'var(--secondary)', strokeWidth: 1, fill: '#030406' }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    name="Forecasted Value" 
                    stroke="var(--primary)" 
                    strokeWidth={3} 
                    strokeDasharray="5 5" 
                    dot={{ r: 4, stroke: 'var(--primary)', strokeWidth: 1, fill: '#030406' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Model Explainability Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Model Explainability</h3>
              <p className="card-subtitle">Local feature contributions to prediction</p>
            </div>
            <HelpCircle 
              size={18} 
              style={{ color: 'var(--neutral-gray)', cursor: 'pointer' }}
              title="Peturbation method showing how each weekly metric pulled the prediction away from the baseline."
            />
          </div>
          
          <div style={{ background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '10px', padding: '0.85rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <Cpu size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '0.1rem' }} />
              <p style={{ fontSize: '0.78rem', color: '#E2E8F0', lineHeight: 1.4 }}>
                <strong>Predictive Explainability Report:</strong> The ML model established a baseline prediction of <strong>{baselineItem?.contribution.toFixed(1)}</strong>. 
                Recent performance metrics and trends pulled the prediction to its final forecast of <strong>{activeForecast.predicted_value.toFixed(1)}</strong>.
              </p>
            </div>
          </div>

          <div className="explain-container" style={{ flex: 1 }}>
            {sortedExplanations.map((item, idx) => {
              const isBaseline = item.feature.includes("Baseline");
              const val = item.contribution;
              const isPositive = val > 0;
              const absVal = Math.abs(val);
              
              // Percentage width relative to max contribution
              const barWidth = isBaseline ? 100 : (absVal / maxContrib) * 100;
              
              return (
                <div 
                  key={idx} 
                  className="explain-item"
                  onMouseEnter={() => setHoveredFeature(item)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{
                    borderWidth: hoveredFeature?.feature === item.feature ? '1px' : '1px',
                    borderColor: hoveredFeature?.feature === item.feature ? 'var(--primary-glow)' : 'var(--border-color)',
                    background: hoveredFeature?.feature === item.feature ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="explain-item-header">
                    <span className="explain-name" style={{ color: isBaseline ? 'var(--secondary)' : '#FFFFFF' }}>{item.feature}</span>
                    <span className={`explain-val ${isBaseline ? 'neutral' : (isPositive ? 'positive' : 'negative')}`}>
                      {!isBaseline && (isPositive ? '+' : '')}
                      {val.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="explain-progress-bar">
                    <div 
                      className={`explain-fill ${isBaseline ? 'neutral' : (isPositive ? 'positive' : 'negative')}`}
                      style={{ 
                        width: `${barWidth}%`, 
                        float: isBaseline ? 'none' : (isPositive ? 'left' : 'right'),
                        marginLeft: !isBaseline && !isPositive ? 'auto' : '0'
                      }}
                    />
                  </div>
                  <span className="explain-desc">{item.description}</span>
                </div>
              );
            })}
          </div>

          {hoveredFeature && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <ShieldAlert size={14} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--neutral-gray)', fontWeight: 700, textTransform: 'uppercase' }}>Details</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '0.25rem' }}>
                {hoveredFeature.description || 'No further explanation available.'}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
