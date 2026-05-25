import { useState } from 'react';
import { 
  HelpCircle, Cpu, Layers, LineChart, ShieldCheck, 
  Database, UploadCloud, Settings, Download, ArrowRight, Play
} from 'lucide-react';

export default function HowItWorksView() {
  const [activeSubTab, setActiveSubTab] = useState("workflow"); // workflow, technical

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Introduction Card */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(0, 230, 118, 0.05) 0%, rgba(0, 176, 255, 0.05) 100%)',
        border: '1px solid rgba(0, 230, 118, 0.2)'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="logo-icon" style={{ background: 'linear-gradient(135deg, var(--primary), var(--info))' }}>
            <HelpCircle size={22} style={{ color: '#FFFFFF' }} />
          </div>
          <div>
            <h3 className="card-title" style={{ fontSize: '1.25rem', margin: 0 }}>How TestForce.ai Works</h3>
            <p className="card-subtitle" style={{ margin: '0.25rem 0 0 0' }}>Under the hood of our AI-driven software quality predictive forecasting engine</p>
          </div>
        </div>
      </div>

      {/* Sub-navigation Switcher */}
      <div style={{ display: 'flex', background: '#090C13', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
        <button 
          type="button" 
          onClick={() => setActiveSubTab("workflow")}
          style={{ 
            padding: '0.5rem 1.25rem', 
            border: 'none', 
            background: activeSubTab === 'workflow' ? 'linear-gradient(135deg, var(--primary), var(--info))' : 'transparent', 
            color: activeSubTab === 'workflow' ? '#000000' : 'var(--neutral-gray)', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Play size={14} /> Application Workflow
        </button>
        <button 
          type="button" 
          onClick={() => setActiveSubTab("technical")}
          style={{ 
            padding: '0.5rem 1.25rem', 
            border: 'none', 
            background: activeSubTab === 'technical' ? 'linear-gradient(135deg, var(--primary), var(--info))' : 'transparent', 
            color: activeSubTab === 'technical' ? '#000000' : 'var(--neutral-gray)', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Cpu size={14} /> AI Predictive Pipeline
        </button>
      </div>

      {/* Workflow Timeline Section */}
      {activeSubTab === "workflow" ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 1.5rem 0', fontSize: '1.1rem', fontWeight: 700 }}>Interactive User Workflow</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
              
              {/* Vertical timeline line */}
              <div style={{ 
                position: 'absolute', 
                left: '20px', 
                top: '25px', 
                bottom: '25px', 
                width: '2px', 
                background: 'linear-gradient(180deg, var(--primary) 0%, var(--warning) 33%, var(--info) 66%, var(--secondary) 100%)',
                zIndex: 0
              }}></div>

              {/* Step 1 */}
              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  background: '#090C13', 
                  border: '2px solid var(--primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  boxShadow: '0 0 12px rgba(0, 230, 118, 0.2)',
                  flexShrink: 0
                }}>
                  <Database size={18} />
                </div>
                <div style={{ paddingTop: '0.3rem' }}>
                  <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>Step 1: Select or Seed Project</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: 1.5 }}>
                    Select an active software context (e.g. <strong>QuantumPay</strong>) from the header dropdown. If launching the app for the first time, click <strong>Seed Sample Data</strong> to reset the SQLite database tables and write 52 weeks of structured historical logs.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  background: '#090C13', 
                  border: '2px solid var(--warning)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--warning)',
                  boxShadow: '0 0 12px rgba(255, 179, 0, 0.2)',
                  flexShrink: 0
                }}>
                  <UploadCloud size={18} />
                </div>
                <div style={{ paddingTop: '0.3rem' }}>
                  <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>Step 2: Log Weekly Metrics</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: 1.5 }}>
                    Navigate to the <strong>Add Weekly Data</strong> tab to enter weekly QA results. Use the <strong>Manual Data Entry</strong> panel featuring side-by-side color columns matching the dashboard, or upload bulk logs via the <strong>CSV Upload</strong> interface.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  background: '#090C13', 
                  border: '2px solid var(--info)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--info)',
                  boxShadow: '0 0 12px rgba(0, 229, 255, 0.2)',
                  flexShrink: 0
                }}>
                  <Settings size={18} />
                </div>
                <div style={{ paddingTop: '0.3rem' }}>
                  <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>Step 3: Auto-Training & Forecast Updates</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: 1.5 }}>
                    Once a weekly log is submitted, the API database cache is automatically invalidated. The backend instantly retrains localized regression models, recalculates future trends, and updates analytics visuals across all panels.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div style={{ display: 'flex', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '50%', 
                  background: '#090C13', 
                  border: '2px solid var(--secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'var(--secondary)',
                  boxShadow: '0 0 12px rgba(255, 255, 255, 0.15)',
                  flexShrink: 0
                }}>
                  <Download size={18} />
                </div>
                <div style={{ paddingTop: '0.3rem' }}>
                  <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#FFFFFF', fontWeight: 700 }}>Step 4: Explore & Export Forecasts</h5>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: 1.5 }}>
                    Review predicted monthly averages, MoM changes, and 4-week projections in the <strong>AI Forecast</strong> tab. Click <strong>Download Report</strong> in the header controls to export predictions as an audit-ready CSV spreadsheet.
                  </p>
                </div>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
          
          {/* Step 1 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
              <Layers size={20} />
              <h4 style={{ margin: 0, fontWeight: 700 }}>1. Data Pipeline & Sequences</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: '1.5' }}>
              The engine ingests weekly QA report metrics including story tests, automated regression runs, manual regression runs, and their respective pass/fail/bug outcomes. It formats this data into a chronologically ordered sequence spanning up to 52 weeks.
            </p>
          </div>

          {/* Step 2 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
              <LineChart size={20} />
              <h4 style={{ margin: 0, fontWeight: 700 }}>2. Feature Engineering (Lags & Trends)</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: '1.5' }}>
              For each metric, the engine constructs lagged features (values from previous weeks), moving averages (steady-state 4-week window), and local velocities (regression slope over the last 4 weeks) to capture momentum and project trends.
            </p>
          </div>

          {/* Step 3 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
              <Cpu size={20} />
              <h4 style={{ margin: 0, fontWeight: 700 }}>3. Ensemble Forecasting Models</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: '1.5' }}>
              A machine learning model pipeline combines **Random Forest Regressors** (to capture non-linearities and threshold rules) and **Ridge Regression** (to isolate linear momentum). The models predict values for a 4-week future horizon.
            </p>
          </div>

          {/* Step 4 */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--info)' }}>
              <ShieldCheck size={20} />
              <h4 style={{ margin: 0, fontWeight: 700 }}>4. Local Feature Attribution (SHAP-like)</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--neutral-gray)', lineHeight: '1.5' }}>
              To explain predictions, a perturbation explainer measures the difference in outputs when each input feature is set to its historical average. This determines the exact magnitude and direction (+/-) each feature pulled the final forecast.
            </p>
          </div>

        </div>
      )}

      {/* Speed & Caching Card */}
      <div className="glass-card" style={{
        background: 'rgba(16, 185, 129, 0.02)',
        border: '1px solid rgba(16, 185, 129, 0.15)'
      }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <ShieldCheck size={18} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#FFFFFF', fontWeight: 600 }}>Optimized Caching & Pre-warmed Lifespans</h4>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--neutral-gray)', lineHeight: '1.4' }}>
              To ensure instant page loading and smooth transitions, the API employs a pre-warmed memory cache. Predictions are fully pre-computed on server startup and dynamically refreshed only when database data is altered.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
