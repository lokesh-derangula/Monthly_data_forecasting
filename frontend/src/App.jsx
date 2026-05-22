import React, { useState, useEffect } from 'react';
import { 
  Layers, Cpu, PlusCircle, RefreshCw, BarChart2, ShieldCheck, Database 
} from 'lucide-react';
import './App.css';
import DashboardView from './components/DashboardView';
import ForecastView from './components/ForecastView';
import ReportForm from './components/ReportForm';

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

  const backendUrl = "http://127.0.0.1:8000";

  // 1. Fetch available projects list on mount
  const fetchProjects = async (selectDefault = false) => {
    try {
      const res = await fetch(`${backendUrl}/api/projects`);
      if (!res.ok) throw new Error("Could not fetch project list.");
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && (selectDefault || !activeProject)) {
        setActiveProject(data[0]);
      }
    } catch (err) {
      setError("Failed to connect to FastAPI backend. Ensure uvicorn server is running on localhost:8000.");
    }
  };

  useEffect(() => {
    fetchProjects(true);
  }, []);

  // 2. Fetch reports & predictions whenever the active project changes
  const fetchProjectDetails = async (projName) => {
    if (!projName) return;
    setIsLoading(true);
    setError("");
    try {
      // Fetch historical logs
      const reportsRes = await fetch(`${backendUrl}/api/reports/${projName}`);
      if (!reportsRes.ok) throw new Error("Failed to load historical test reports.");
      const reportsData = await reportsRes.json();
      setReports(reportsData);

      // Trigger AI training and predictions
      setIsTraining(true);
      const predictRes = await fetch(`${backendUrl}/api/predict/${projName}`, { method: 'POST' });
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
      fetchProjectDetails(activeProject);
    }
  }, [activeProject]);

  // 3. Trigger manual DB Reset & Reseed
  const handleSeedDB = async () => {
    if (window.confirm("This will reset your database and seed it with 52 weeks of historical records. Proceed?")) {
      setIsSeeding(true);
      setError("");
      try {
        const res = await fetch(`${backendUrl}/api/seed`, { method: "POST" });
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
          <div className="logo-icon">
            <Cpu size={24} style={{ color: '#FFFFFF' }} />
          </div>
          <div className="logo-text">
            <h1>TestForce.ai</h1>
            <span>Predictive Quality Analytics Dashboard</span>
          </div>
        </div>

        <div className="header-controls">
          
          {/* Project selector drop list */}
          {projects.length > 0 && (
            <div className="project-select-wrapper">
              <select 
                className="project-select" 
                value={activeProject} 
                onChange={(e) => setActiveProject(e.target.value)}
                disabled={isLoading || isSeeding}
              >
                {projects.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className="select-arrow">
                <Layers size={16} />
              </div>
            </div>
          )}

          {/* Navigation Controls */}
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
            <button 
              className={`tab-btn ${activeTab === 'addReport' ? 'active' : ''}`}
              onClick={() => setActiveTab("addReport")}
            >
              <PlusCircle size={16} /> Log Report
            </button>
          </nav>

          {/* DB utility button */}
          <button 
            type="button" 
            className="action-btn" 
            onClick={handleSeedDB}
            disabled={isSeeding || isLoading}
            style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}
            title="Reset SQLite database and generate fresh time-series mockups"
          >
            {isSeeding ? <RefreshCw size={14} className="spin" /> : <Database size={14} style={{ color: 'var(--error)' }} />}
            Reset & Seed
          </button>

        </div>
      </header>

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

    </div>
  );
}
