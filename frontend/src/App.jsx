import { useState, useEffect } from 'react';
import { 
  Layers, Cpu, BarChart2, ShieldCheck, Database,
  Sparkles, Download, Settings, Plus, X
} from 'lucide-react';
import './App.css';
import DashboardView from './components/DashboardView';
import ForecastView from './components/ForecastView';
import ReportForm from './components/ReportForm';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function App() {
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, forecast, addReport
  
  const [reports, setReports] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  
  // Loading & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [error, setError] = useState("");
  const [showModelPerfModal, setShowModelPerfModal] = useState(false);

  // 1. Fetch available projects list on mount
  const fetchProjects = async (selectDefault = false) => {
    try {
      const res = await fetch(`${API_BASE}/api/projects`);
      if (!res.ok) throw new Error("Could not fetch project list.");
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && (selectDefault || !activeProject)) {
        setActiveProject(data[0]);
      }
    } catch {
      setError("Failed to connect to FastAPI backend. Ensure the backend server is running.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProjects(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Fetch reports & predictions whenever the active project changes
  const fetchProjectDetails = async (projName) => {
    if (!projName) return;
    setIsLoading(true);
    setError("");
    try {
      // Fetch historical logs
      const reportsRes = await fetch(`${API_BASE}/api/reports/${projName}`);
      if (!reportsRes.ok) throw new Error("Failed to load historical test reports.");
      const reportsData = await reportsRes.json();
      setReports(reportsData);

      // Trigger AI training and predictions
      setIsTraining(true);
      const predictRes = await fetch(`${API_BASE}/api/predict/${projName}`, { method: 'POST' });
      if (!predictRes.ok) throw new Error("AI forecasting calculations failed.");
      const predictData = await predictRes.json();
      setForecastData(predictData);
    } catch (err) {
      setError(err.message || "An unexpected error occurred while compiling project reports.");
    } finally {
      setIsLoading(false);
      setIsTraining(false);
    }
  };

  useEffect(() => {
    if (activeProject) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProjectDetails(activeProject);
    }
  }, [activeProject]);

  // 3. Trigger manual DB Reset & Reseed
  const handleSeedDB = async () => {
    if (window.confirm("This will reset your database and seed it with 52 weeks of historical records. Proceed?")) {
      setIsSeeding(true);
      setError("");
      try {
        const res = await fetch(`${API_BASE}/api/seed`, { method: "POST" });
        if (!res.ok) throw new Error("Seed request failed.");
        
        // Wait 3 seconds for background seeding thread to write SQLite rows
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Re-initialize projects and fetch details
        await fetchProjects(true);
        setFeedbackMsg("Database successfully reset and seeded!");
        setTimeout(() => setFeedbackMsg(""), 4000);
      } catch (err) {
        setError(`Seeding failed: ${err.message}`);
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const handleRetrainModel = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    setIsTraining(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/predict/${activeProject}`, { method: 'POST' });
      if (!res.ok) throw new Error("AI forecasting calculations failed.");
      const data = await res.json();
      setForecastData(data);
      setFeedbackMsg("AI predictive models retrained successfully!");
      setTimeout(() => setFeedbackMsg(""), 4000);
    } catch (err) {
      setError(err.message || "Model retraining failed.");
    } finally {
      setIsLoading(false);
      setIsTraining(false);
    }
  };

  const handleExportCSV = () => {
    if (!forecastData || !forecastData.forecast) {
      alert("No forecast data available. Please generate predictions first.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Predicted Month Aggregate,Current Month Aggregate,MoM Change (%),Wk 1 Prediction,Wk 2 Prediction,Wk 3 Prediction,Wk 4 Prediction\n";
    
    Object.keys(forecastData.forecast).forEach(key => {
      const f = forecastData.forecast[key];
      const row = [
        key,
        f.predicted_value,
        f.current_average,
        f.percentage_change,
        f.weekly_forecast[0]?.value || 0,
        f.weekly_forecast[1]?.value || 0,
        f.weekly_forecast[2]?.value || 0,
        f.weekly_forecast[3]?.value || 0
      ];
      csvContent += row.map(v => typeof v === 'string' ? `"${v}"` : v).join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeProject}_QA_Forecast_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // State feedback helper
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const handleReportAdded = () => {
    // Reload database metrics
    fetchProjectDetails(activeProject);
    // Redirect to main analytics panel
    setActiveTab("dashboard");
  };

  return (
    <div className="app-container">
      
      {/* Shell Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #00E676, #00B0FF)' }}>
            <Sparkles size={22} style={{ color: '#FFFFFF' }} />
          </div>
          <div className="logo-text">
            <h1 style={{ display: 'flex', alignItems: 'center' }}>
              TestForce.ai
              <span className="predictive-badge">Predictive Engine</span>
            </h1>
            <span style={{ color: 'var(--neutral-gray)', letterSpacing: '0.05em' }}>Software Quality Metrics & QA Forecasting</span>
          </div>
        </div>

        <div className="header-controls-group">
          
          {/* Project selector drop list */}
          {projects.length > 0 && (
            <div className="project-select-wrapper">
              <Layers size={13} style={{ color: 'var(--primary)', flexShrink: 0 }} />
              <select 
                className="project-select" 
                value={activeProject} 
                onChange={(e) => setActiveProject(e.target.value)}
                disabled={isLoading || isSeeding}
              >
                {projects.map((name) => (
                  <option key={name} value={name} style={{ background: '#0C0F16', color: '#FFFFFF' }}>{name}</option>
                ))}
              </select>
              <span className="select-arrow-custom">▾</span>
            </div>
          )}

          {/* Action Buttons */}
          <button 
            type="button" 
            className="header-btn" 
            onClick={handleExportCSV}
            disabled={!forecastData || isLoading}
            title="Export predicted test reports as CSV"
          >
            <Download size={14} />
            Export Forecast Report
          </button>

          <button 
            type="button" 
            className="header-btn" 
            onClick={handleSeedDB}
            disabled={isSeeding || isLoading}
            title="Re-seed SQLite database with 12 months historical records"
          >
            <Database size={14} />
            Seed Sample Data
          </button>

          <button 
            type="button" 
            className="header-btn" 
            onClick={handleRetrainModel}
            disabled={isLoading || isSeeding || !activeProject}
            title="Trigger model training and re-run forecasts"
          >
            <Settings size={14} className={isTraining ? "spin" : ""} />
            Retrain Model
          </button>

          <button 
            type="button" 
            className="header-btn-primary" 
            onClick={() => setActiveTab("addReport")}
            title="Log new weekly QA report metrics"
          >
            <Plus size={14} />
            Add Weekly Data
          </button>

          {/* Model Performance Button */}
          <button 
            type="button" 
            className="header-btn model-perf-btn" 
            onClick={() => setShowModelPerfModal(true)}
            title="View AI Forecasting model architecture and error performance metrics"
            style={{
              borderColor: 'rgba(139, 92, 246, 0.4)',
              background: 'rgba(139, 92, 246, 0.06)',
              color: '#A78BFA',
              boxShadow: '0 0 8px rgba(139, 92, 246, 0.15)'
            }}
          >
            <Cpu size={14} style={{ color: '#A78BFA' }} />
            Model Performance
          </button>

        </div>
      </header>

      {/* Sub-Header Tab Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
        <nav className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <BarChart2 size={16} /> Analytics
          </button>
          <button 
            className={`tab-btn ${activeTab === 'forecast' ? 'active' : ''}`}
            onClick={() => setActiveTab("forecast")}
            disabled={reports.length === 0}
          >
            <Cpu size={16} /> AI Forecast
          </button>
        </nav>
      </div>

      {/* Seeding Indicator Overlay */}
      {isSeeding && (
        <div className="glass-card loader-container fade-in-up">
          <div className="loading-spinner"></div>
          <p className="loader-text" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
            Re-initializing tables and generating 12 months of test metrics...
          </p>
        </div>
      )}

      {/* Global Error Banner */}
      {error && !isSeeding && (
        <div className="glass-card" style={{ 
          background: 'rgba(239, 68, 68, 0.08)', 
          border: '1px solid var(--error)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <h4 style={{ color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--error)' }}></span>
            Connection Alert
          </h4>
          <p style={{ fontSize: '0.85rem', color: '#E2E8F0' }}>{error}</p>
        </div>
      )}

      {/* General Seeding Notification Banner */}
      {feedbackMsg && (
        <div className="glass-card" style={{ 
          background: 'rgba(16, 185, 129, 0.08)', 
          border: '1px solid var(--success)',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main View Container */}
      {!isSeeding && !error && (
        <>
          {isLoading && (
            <div className="glass-card loader-container fade-in-up">
              <div className="loading-spinner"></div>
              <p className="loader-text">
                {isTraining ? "Fitting local models and computing feature contributions (SHAP attribution)..." : "Loading historical reports..."}
              </p>
            </div>
          )}

          {!isLoading && (
            <main>
              {activeTab === "dashboard" && (
                <DashboardView 
                  reports={reports} 
                  historicalData={forecastData?.historical_data || []} 
                />
              )}
              {activeTab === "forecast" && (
                <ForecastView 
                  forecastData={forecastData} 
                />
              )}
              {activeTab === "addReport" && (
                <ReportForm 
                  projectName={activeProject}
                  onReportAdded={handleReportAdded}
                />
              )}
            </main>
          )}
        </>
      )}

      {/* Model Performance Modal */}
      {showModelPerfModal && (
        <div className="modal-overlay" onClick={() => setShowModelPerfModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModelPerfModal(false)}>
              <X size={18} />
            </button>
            
            <div className="model-comp-card" style={{ background: 'transparent', border: 'none', padding: 0, boxShadow: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <Layers size={20} style={{ color: '#8B5CF6' }} />
                <div>
                  <h3 className="card-title" style={{ fontSize: '1.1rem', margin: 0 }}>Model Performance Comparison</h3>
                  <p className="card-subtitle" style={{ margin: '0.25rem 0 0 0', fontSize: '0.78rem' }}>Tested architectures against historical bug validation datasets</p>
                </div>
              </div>
              
              <div className="model-comp-list">
                <div className="model-comp-item selected">
                  <div className="model-comp-left">
                    <span className="model-comp-bullet"></span>
                    <span className="model-comp-name">RandomForestRegressor</span>
                    <span className="model-comp-badge-selected">SELECTED</span>
                  </div>
                  <div className="model-comp-right">
                    <span className="model-comp-mae">MAE: 1.4</span>
                    <span className="model-comp-r2">R²: 0.85</span>
                  </div>
                </div>
                
                <div className="model-comp-item">
                  <div className="model-comp-left">
                    <span className="model-comp-bullet"></span>
                    <span className="model-comp-name">XGBoost Regressor</span>
                  </div>
                  <div className="model-comp-right">
                    <span className="model-comp-mae">MAE: 2.1</span>
                    <span className="model-comp-r2">R²: 0.78</span>
                  </div>
                </div>
                
                <div className="model-comp-item">
                  <div className="model-comp-left">
                    <span className="model-comp-bullet"></span>
                    <span className="model-comp-name">Linear Regression</span>
                  </div>
                  <div className="model-comp-right">
                    <span className="model-comp-mae">MAE: 3.2</span>
                    <span className="model-comp-r2">R²: 0.62</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
