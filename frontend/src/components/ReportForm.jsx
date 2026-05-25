import { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileText, AlertCircle, CheckCircle2, 
  RefreshCcw, Sparkles, X, PlusCircle, Layers
} from 'lucide-react';

const rawApiBase = import.meta.env.VITE_API_BASE_URL;
const API_BASE = rawApiBase && rawApiBase.endsWith('/') ? rawApiBase.slice(0, -1) : rawApiBase;

const PROJECT_DEFAULTS = {
  QuantumPay: {
    authors: "Alex Dev, Sarah QA",
    storyTests: 50,
    regressionTestsAutomated: 267,
    regressionTestsManual: 34,
    storyPassed: 46,
    storyFailed: 4,
    storyBugs: 6,
    arPassed: 256,
    arFailed: 11,
    arBugs: 9,
    mrPassed: 30,
    mrFailed: 4,
    mrBugs: 4
  },
  HealthSync: {
    authors: "John Doe, Emily Nurse",
    storyTests: 25,
    regressionTestsAutomated: 112,
    regressionTestsManual: 96,
    storyPassed: 24,
    storyFailed: 1,
    storyBugs: 1,
    arPassed: 109,
    arFailed: 3,
    arBugs: 2,
    mrPassed: 91,
    mrFailed: 5,
    mrBugs: 4
  },
  EduLearn: {
    authors: "Michael K., Lisa Chang",
    storyTests: 62,
    regressionTestsAutomated: 54,
    regressionTestsManual: 178,
    storyPassed: 51,
    storyFailed: 11,
    storyBugs: 13,
    arPassed: 46,
    arFailed: 8,
    arBugs: 7,
    mrPassed: 142,
    mrFailed: 36,
    mrBugs: 36
  },
  fallback: {
    authors: "QA Lead",
    storyTests: 50,
    regressionTestsAutomated: 100,
    regressionTestsManual: 100,
    storyPassed: 40,
    storyFailed: 5,
    storyBugs: 5,
    arPassed: 92,
    arFailed: 5,
    arBugs: 3,
    mrPassed: 90,
    mrFailed: 6,
    mrBugs: 4
  }
};

export default function ReportForm({ projectName, onReportAdded, onCancel }) {
  const [activeSubTab, setActiveSubTab] = useState("manual"); // manual, csv
  const [form, setForm] = useState(() => {
    const defaults = PROJECT_DEFAULTS[projectName] || PROJECT_DEFAULTS.fallback;
    return { ...defaults, createdAt: new Date().toISOString().substring(0, 10) };
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (projectName) {
      const defaults = PROJECT_DEFAULTS[projectName] || PROJECT_DEFAULTS.fallback;
      setForm({
        authors: defaults.authors,
        storyTests: defaults.storyTests,
        regressionTestsAutomated: defaults.regressionTestsAutomated,
        regressionTestsManual: defaults.regressionTestsManual,
        storyPassed: defaults.storyPassed,
        storyFailed: defaults.storyFailed,
        storyBugs: defaults.storyBugs,
        arPassed: defaults.arPassed,
        arFailed: defaults.arFailed,
        arBugs: defaults.arBugs,
        mrPassed: defaults.mrPassed,
        mrFailed: defaults.mrFailed,
        mrBugs: defaults.mrBugs,
        createdAt: new Date().toISOString().substring(0, 10)
      });
    }
  }, [projectName]);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "authors" || name === "createdAt") {
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: Math.max(0, parseInt(value) || 0) }));
    }
  };

  const handleAutofill = () => {
    const isQuantum = projectName === "QuantumPay";
    const isEdu = projectName === "EduLearn";
    
    let config = {
      storyBase: 45, arBase: 120, mrBase: 50,
      failStory: 4, failAR: 3, failMR: 5,
      bugStory: 3, bugAR: 2, bugMR: 4
    };

    if (isQuantum) {
      config = { storyBase: 60, arBase: 220, mrBase: 30, failStory: 2, failAR: 4, failMR: 2, bugStory: 2, bugAR: 3, bugMR: 1 };
    } else if (isEdu) {
      config = { storyBase: 70, arBase: 50, mrBase: 140, failStory: 12, failAR: 6, failMR: 15, bugStory: 8, bugAR: 4, bugMR: 10 };
    }

    const rand = (base, range = 5) => Math.max(5, Math.floor(base + (Math.random() * range * 2 - range)));

    const storyTests = rand(config.storyBase, 10);
    const storyFailed = rand(config.failStory, 2);
    const storyPassed = Math.max(0, storyTests - storyFailed);
    const storyBugs = rand(config.bugStory, 1);

    const arTests = rand(config.arBase, 20);
    const arFailed = rand(config.failAR, 1);
    const arPassed = Math.max(0, arTests - arFailed);
    const arBugs = rand(config.bugAR, 1);

    const mrTests = rand(config.mrBase, 15);
    const mrFailed = rand(config.failMR, 2);
    const mrPassed = Math.max(0, mrTests - mrFailed);
    const mrBugs = rand(config.bugMR, 1);

    setForm({
      authors: "Autofill Generator",
      storyTests,
      regressionTestsAutomated: arTests,
      regressionTestsManual: mrTests,
      
      storyPassed,
      storyFailed,
      storyBugs,

      arPassed,
      arFailed,
      arBugs,

      mrPassed,
      mrFailed,
      mrBugs,
      
      createdAt: new Date().toISOString().substring(0, 10)
    });

    setFeedback({ type: "info", message: "Coherent test metrics autofilled based on project profile!" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    const payload = {
      projectName,
      authors: form.authors,
      storyTests: Number(form.storyTests),
      regressionTestsAutomated: Number(form.regressionTestsAutomated),
      regressionTestsManual: Number(form.regressionTestsManual),
      totalTestsByApplication: Number(form.storyTests) + Number(form.regressionTestsAutomated) + Number(form.regressionTestsManual),
      
      storyPassed: Number(form.storyPassed),
      storyFailed: Number(form.storyFailed),
      storyBugs: Number(form.storyBugs),
      storyUnexecuted: 0,
      storyBlocked: 0,
      storySkipped: 0,
      storyCritical: 0,
      storyNew: 0,
      storyUnused: 0,
      
      arPassed: Number(form.arPassed),
      arFailed: Number(form.arFailed),
      arBugs: Number(form.arBugs),
      arUnexecuted: 0,
      arBlocked: 0,
      arSkipped: 0,
      arCritical: 0,
      arNew: 0,
      arUnused: 0,
      
      mrPassed: Number(form.mrPassed),
      mrFailed: Number(form.mrFailed),
      mrBugs: Number(form.mrBugs),
      mrUnexecuted: 0,
      mrBlocked: 0,
      mrSkipped: 0,
      mrCritical: 0,
      mrNew: 0,
      mrUnused: 0,
      
      createdAt: form.createdAt ? new Date(form.createdAt).toISOString() : new Date().toISOString()
    };

    try {
      const response = await fetch(`${API_BASE}/api/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned error code: ${response.status}`);
      }

      const newReport = await response.json();
      setFeedback({ 
        type: "success", 
        message: `Successfully logged weekly report for project: ${projectName}!` 
      });
      
      // Trigger forecast calculations to pre-warm cache
      await fetch(`${API_BASE}/api/predict/${projectName}`, { method: 'POST' });
      
      if (onReportAdded) onReportAdded(newReport);
    } catch (err) {
      setFeedback({ 
        type: "error", 
        message: `Submission failed: ${err.message}. Ensure backend is running.` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrowseFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length < 2) {
          throw new Error("CSV must contain a header row and at least one data row.");
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const dataRows = lines.slice(1);
        
        const requiredCols = [
          "storyTests", "regressionTestsAutomated", "regressionTestsManual",
          "storyPassed", "storyFailed", "storyBugs",
          "arPassed", "arFailed", "arBugs",
          "mrPassed", "mrFailed", "mrBugs"
        ];
        
        const missing = requiredCols.filter(col => !headers.includes(col));
        if (missing.length > 0) {
          throw new Error(`CSV is missing required columns: ${missing.join(', ')}`);
        }
        
        const parsedRecords = [];
        for (const row of dataRows) {
          const values = row.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
          const record = { projectName };
          
          headers.forEach((header, idx) => {
            const val = values[idx];
            if (requiredCols.includes(header)) {
              record[header] = parseInt(val) || 0;
            } else if (header === "authors") {
              record[header] = val || "CSV Import";
            } else if (header === "createdAt") {
              record[header] = val || new Date().toISOString();
            } else {
              record[header] = val;
            }
          });
          
          const optionalCols = [
            "storyUnexecuted", "storyBlocked", "storySkipped", "storyCritical", "storyNew", "storyUnused",
            "arUnexecuted", "arBlocked", "arSkipped", "arCritical", "arNew", "arUnused",
            "mrUnexecuted", "mrBlocked", "mrSkipped", "mrCritical", "mrNew", "mrUnused"
          ];
          optionalCols.forEach(col => {
            if (!(col in record)) {
              record[col] = 0;
            }
          });
          record.totalTestsByApplication = Number(record.storyTests) + Number(record.regressionTestsAutomated) + Number(record.regressionTestsManual);
          parsedRecords.push(record);
        }
        
        setIsSubmitting(true);
        let successCount = 0;
        for (const record of parsedRecords) {
          const response = await fetch(`${API_BASE}/api/reports`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
          });
          if (response.ok) {
            successCount++;
          }
        }

        // Trigger retrain/predict to pre-warm cache
        await fetch(`${API_BASE}/api/predict/${projectName}`, { method: 'POST' });
        
        setFeedback({
          type: "success",
          message: `Successfully imported ${successCount} weekly records from CSV!`
        });
        
        if (onReportAdded) onReportAdded();
      } catch (err) {
        setFeedback({
          type: "error",
          message: `CSV Import Failed: ${err.message}`
        });
      } finally {
        setIsSubmitting(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fade-in-up glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      
      {/* Dialog Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: '#FFFFFF', fontWeight: 700 }}>
            <UploadCloud size={24} style={{ color: 'var(--primary)' }} />
            Submit Weekly QA Report
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--neutral-gray)' }}>
            Add weekly report numbers to update models
          </p>
        </div>
        <button 
          type="button" 
          onClick={onCancel}
          style={{ background: 'transparent', border: 'none', color: 'var(--neutral-gray)', cursor: 'pointer', padding: '0.25rem' }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: '#090C13', padding: '0.25rem', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button 
          type="button" 
          onClick={() => { setActiveSubTab("manual"); setFeedback({ type: null, message: "" }); }}
          style={{ 
            flex: 1, 
            padding: '0.6rem', 
            border: 'none', 
            background: activeSubTab === 'manual' ? 'linear-gradient(135deg, var(--primary), var(--info))' : 'transparent', 
            color: activeSubTab === 'manual' ? '#000000' : 'var(--neutral-gray)', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          Manual Data Entry
        </button>
        <button 
          type="button" 
          onClick={() => { setActiveSubTab("csv"); setFeedback({ type: null, message: "" }); }}
          style={{ 
            flex: 1, 
            padding: '0.6rem', 
            border: 'none', 
            background: activeSubTab === 'csv' ? 'linear-gradient(135deg, var(--primary), var(--info))' : 'transparent', 
            color: activeSubTab === 'csv' ? '#000000' : 'var(--neutral-gray)', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '0.85rem'
          }}
        >
          CSV Upload Dataset
        </button>
      </div>

      {/* Feedback Messages */}
      {feedback.message && (
        <div className="glass-card" style={{ 
          padding: '1rem', 
          marginBottom: '1.5rem',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : (feedback.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
          borderColor: feedback.type === 'success' ? 'var(--success)' : (feedback.type === 'error' ? 'var(--error)' : 'var(--info)'),
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          {feedback.type === 'success' ? <CheckCircle2 size={18} style={{ color: 'var(--success)' }} /> : <AlertCircle size={18} style={{ color: feedback.type === 'error' ? 'var(--error)' : 'var(--info)' }} />}
          <span>{feedback.message}</span>
        </div>
      )}

      {activeSubTab === "manual" ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Row 1: Context & Authors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Project Context</label>
              <input 
                type="text" 
                value={projectName} 
                disabled 
                className="form-input" 
                style={{ background: '#090C13', color: '#E2E8F0', cursor: 'not-allowed', fontWeight: 600 }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--neutral-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lead Authors</label>
              <input 
                type="text" 
                name="authors" 
                className="form-input" 
                value={form.authors} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Execution Volume Section */}
          <div style={{ background: '#050608', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6366F1', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              <Layers size={16} />
              Test Execution Volume (Weekly)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--neutral-gray)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="dot story" style={{ flexShrink: 0 }}></span> Story Tests
                </label>
                <input 
                  type="number" 
                  name="storyTests" 
                  className="form-input" 
                  value={form.storyTests} 
                  onChange={handleChange} 
                  min="0" 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--neutral-gray)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="dot ar" style={{ flexShrink: 0 }}></span> AR Tests (Auto)
                </label>
                <input 
                  type="number" 
                  name="regressionTestsAutomated" 
                  className="form-input" 
                  value={form.regressionTestsAutomated} 
                  onChange={handleChange} 
                  min="0" 
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--neutral-gray)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span className="dot mr" style={{ flexShrink: 0 }}></span> MR Tests (Manual)
                </label>
                <input 
                  type="number" 
                  name="regressionTestsManual" 
                  className="form-input" 
                  value={form.regressionTestsManual} 
                  onChange={handleChange} 
                  min="0" 
                />
              </div>
            </div>
          </div>

          {/* Three columns of inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            
            {/* Story Column */}
            <div style={{ background: '#050608', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--primary)', borderRadius: '6px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>Story Tests</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Passed</label>
                  <input type="number" name="storyPassed" className="form-input" value={form.storyPassed} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Failed</label>
                  <input type="number" name="storyFailed" className="form-input" value={form.storyFailed} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Bugs Created <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>🐞</span>
                  </label>
                  <input type="number" name="storyBugs" className="form-input" value={form.storyBugs} onChange={handleChange} min="0" />
                </div>
              </div>
            </div>

            {/* Automation Column */}
            <div style={{ background: '#050608', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--secondary)', borderRadius: '6px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--secondary)', fontWeight: 600 }}>Automation (AR)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Passed</label>
                  <input type="number" name="arPassed" className="form-input" value={form.arPassed} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Failed</label>
                  <input type="number" name="arFailed" className="form-input" value={form.arFailed} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Bugs Created <span style={{ color: 'var(--warning)', fontWeight: 'bold' }}>🐞</span>
                  </label>
                  <input type="number" name="arBugs" className="form-input" value={form.arBugs} onChange={handleChange} min="0" />
                </div>
              </div>
            </div>

            {/* Manual Column */}
            <div style={{ background: '#050608', border: '1px solid var(--border-color)', borderLeft: '4px solid var(--warning)', borderRadius: '6px', padding: '1rem' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--warning)', fontWeight: 600 }}>Manual (MR)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Passed</label>
                  <input type="number" name="mrPassed" className="form-input" value={form.mrPassed} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem' }}>Failed</label>
                  <input type="number" name="mrFailed" className="form-input" value={form.mrFailed} onChange={handleChange} min="0" />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Bugs Created <span style={{ color: 'var(--info)', fontWeight: 'bold' }}>🐞</span>
                  </label>
                  <input type="number" name="mrBugs" className="form-input" value={form.mrBugs} onChange={handleChange} min="0" />
                </div>
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="action-btn" 
              onClick={handleAutofill}
              style={{ padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border-color)' }}
            >
              <Sparkles size={16} style={{ color: 'var(--primary)' }} />
              Load Sample Weekly Dataset
            </button>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="button" 
                onClick={onCancel}
                style={{ background: 'transparent', border: 'none', color: 'var(--neutral-gray)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--info))', 
                  border: 'none', 
                  padding: '0.65rem 1.5rem', 
                  borderRadius: '4px', 
                  color: '#000000', 
                  fontWeight: 700, 
                  fontSize: '0.9rem', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting ? <RefreshCcw size={16} className="spin" /> : <PlusCircle size={16} />}
                Submit & Train Model
              </button>
            </div>
          </div>

        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Dashed Import Box */}
          <div 
            onClick={handleBrowseFilesClick}
            style={{ 
              border: '2px dashed var(--border-color)', 
              borderRadius: '8px', 
              padding: '3rem 2rem', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.01)',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <FileText size={48} style={{ color: 'var(--primary)' }} />
            <div>
              <h4 style={{ margin: 0, color: '#FFFFFF', fontWeight: 700, fontSize: '1.1rem' }}>Select CSV dataset to import</h4>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--neutral-gray)' }}>Columns must match standard metrics schema</p>
            </div>
            <button 
              type="button" 
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid var(--border-color)', 
                padding: '0.5rem 1.25rem', 
                borderRadius: '4px', 
                color: '#FFFFFF', 
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Browse Files
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              style={{ display: 'none' }}
            />
          </div>

          {/* CSV Help Box */}
          <div style={{ background: '#050608', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '1.25rem 1.5rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#FFFFFF', fontWeight: 700, fontSize: '0.9rem' }}>Required CSV Format:</h4>
            <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.8rem', color: 'var(--neutral-gray)' }}>
              CSV must contain header row with at least these columns:
            </p>
            <div style={{ 
              background: '#090C13', 
              border: '1px solid var(--border-color)', 
              borderRadius: '4px', 
              padding: '0.75rem 1rem', 
              fontFamily: 'monospace', 
              fontSize: '0.8rem', 
              color: 'var(--primary)', 
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}>
              storyTests,regressionTestsAutomated,regressionTestsManual,storyPassed,storyFailed,storyBugs,arPassed,arFailed,arBugs,mrPassed,mrFailed,mrBugs
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
