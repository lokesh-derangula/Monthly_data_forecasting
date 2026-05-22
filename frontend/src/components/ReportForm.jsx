import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, Sparkles, AlertCircle, CheckCircle2, RefreshCcw, BookOpen, Cpu, ShieldCheck 
} from 'lucide-react';

const INITIAL_FORM_STATE = {
  authors: "Alex QA, Sarah Dev",
  
  // Story Results
  storyPassed: 28,
  storyFailed: 2,
  storyUnexecuted: 1,
  storyBlocked: 1,
  storySkipped: 1,
  storyCritical: 1,
  storyNew: 6,
  storyUnused: 0,
  storyBugs: 3,

  // AR Results
  arPassed: 135,
  arFailed: 5,
  arUnexecuted: 0,
  arBlocked: 1,
  arSkipped: 0,
  arCritical: 2,
  arNew: 12,
  arUnused: 1,
  arBugs: 4,

  // MR Results
  mrPassed: 42,
  mrFailed: 3,
  mrUnexecuted: 2,
  mrBlocked: 1,
  mrSkipped: 2,
  mrCritical: 1,
  mrNew: 4,
  mrUnused: 0,
  mrBugs: 3,
  
  createdAt: new Date().toISOString().substring(0, 10)
};

export default function ReportForm({ projectName, onReportAdded }) {
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  
  // Dynamically computed totals
  const [totals, setTotals] = useState({
    storyTests: 0,
    regressionTestsAutomated: 0,
    regressionTestsManual: 0,
    totalTestsByApplication: 0
  });

  // Calculate totals whenever inputs change
  useEffect(() => {
    const storyTests = 
      Number(form.storyPassed) + 
      Number(form.storyFailed) + 
      Number(form.storyUnexecuted) + 
      Number(form.storyBlocked) + 
      Number(form.storySkipped);

    const regressionTestsAutomated = 
      Number(form.arPassed) + 
      Number(form.arFailed) + 
      Number(form.arUnexecuted) + 
      Number(form.arBlocked) + 
      Number(form.arSkipped);

    const regressionTestsManual = 
      Number(form.mrPassed) + 
      Number(form.mrFailed) + 
      Number(form.mrUnexecuted) + 
      Number(form.mrBlocked) + 
      Number(form.mrSkipped);

    const totalTestsByApplication = storyTests + regressionTestsAutomated + regressionTestsManual;

    setTotals({
      storyTests,
      regressionTestsAutomated,
      regressionTestsManual,
      totalTestsByApplication
    });
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Maintain text for authors/date, parse integer for others
    if (name === "authors" || name === "createdAt") {
      setForm(prev => ({ ...prev, [name]: value }));
    } else {
      setForm(prev => ({ ...prev, [name]: Math.max(0, parseInt(value) || 0) }));
    }
  };

  const handleAutofill = () => {
    // Generate randomized but realistic and coherent data depending on project characteristics
    const isQuantum = projectName === "QuantumPay";
    const isEdu = projectName === "EduLearn";
    
    let config = {
      storyBase: 35, arBase: 150, mrBase: 35,
      failRatioStory: 0.05, failRatioAR: 0.03, failRatioMR: 0.08,
      bugRate: 0.06
    };

    if (isQuantum) {
      config = { storyBase: 45, arBase: 250, mrBase: 25, failRatioStory: 0.03, failRatioAR: 0.02, failRatioMR: 0.06, bugRate: 0.04 };
    } else if (isEdu) {
      config = { storyBase: 65, arBase: 60, mrBase: 160, failRatioStory: 0.18, failRatioAR: 0.12, failRatioMR: 0.20, bugRate: 0.14 };
    }

    const rand = (base, range = 5) => Math.max(2, Math.floor(base + (Math.random() * range * 2 - range)));

    const st = rand(config.storyBase, 8);
    const stFailed = Math.floor(st * config.failRatioStory);
    const stPassed = st - stFailed;
    const stBugs = Math.floor(stFailed * 1.2 + Math.random() * 2);

    const ar = rand(config.arBase, 20);
    const arFailed = Math.floor(ar * config.failRatioAR);
    const arPassed = ar - arFailed;
    const arBugs = Math.floor(arFailed * 0.8 + Math.random() * 2);

    const mr = rand(config.mrBase, 15);
    const mrFailed = Math.floor(mr * config.failRatioMR);
    const mrPassed = mr - mrFailed;
    const mrBugs = Math.floor(mrFailed * 1.0 + Math.random() * 2);

    setForm({
      authors: "Autofill Generator",
      storyPassed: stPassed,
      storyFailed: stFailed,
      storyUnexecuted: Math.floor(stFailed * 0.2),
      storyBlocked: Math.floor(stFailed * 0.2),
      storySkipped: Math.floor(st * 0.02),
      storyCritical: Math.floor(stFailed * 0.3),
      storyNew: Math.floor(st * 0.15),
      storyUnused: 0,
      storyBugs: stBugs,

      arPassed: arPassed,
      arFailed: arFailed,
      arUnexecuted: Math.floor(arFailed * 0.1),
      arBlocked: Math.floor(arFailed * 0.1),
      arSkipped: Math.floor(ar * 0.01),
      arCritical: Math.floor(arFailed * 0.2),
      arNew: Math.floor(ar * 0.1),
      arUnused: 0,
      arBugs: arBugs,

      mrPassed: mrPassed,
      mrFailed: mrFailed,
      mrUnexecuted: Math.floor(mrFailed * 0.15),
      mrBlocked: Math.floor(mrFailed * 0.15),
      mrSkipped: Math.floor(mr * 0.03),
      mrCritical: Math.floor(mrFailed * 0.25),
      mrNew: Math.floor(mr * 0.08),
      mrUnused: 0,
      mrBugs: mrBugs,
      
      createdAt: new Date().toISOString().substring(0, 10)
    });

    setFeedback({ type: "info", message: "Coherent test metrics autofilled based on project profile!" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: null, message: "" });

    // Merging form state with computed totals and selected project name
    const payload = {
      projectName,
      ...form,
      ...totals
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/reports", {
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
      
      // Notify parent component to reload datasets
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

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Dynamic Summary bar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 className="card-title"><BookOpen size={18} style={{ color: 'var(--primary)' }} /> Logging Report for: {projectName}</h3>
          <p className="card-subtitle">Values entered below will automatically aggregate to compile dashboard reports</p>
        </div>
        <button type="button" className="action-btn" onClick={handleAutofill}>
          <Sparkles size={16} style={{ color: 'var(--secondary)' }} /> Autofill Realistic Mock Data
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Row 1: Meta Infos & Calculations */}
        <div className="dashboard-layout">
          
          {/* Metadata Inputs */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} style={{ color: 'var(--secondary)' }} /> Metadata Details
            </h4>
            <div className="form-group">
              <label>Author(s) (comma-separated)</label>
              <input 
                type="text" 
                name="authors" 
                className="form-input" 
                value={form.authors} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Week Commencing Date</label>
              <input 
                type="date" 
                name="createdAt" 
                className="form-input" 
                value={form.createdAt} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Computed Totals Preview (Displays attention to detail) */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0, 230, 118, 0.03)' }}>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={16} style={{ color: 'var(--primary)' }} /> Real-time Computed Totals
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--neutral-gray)' }}>Story Tests:</span>
                <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{totals.storyTests} Runs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--neutral-gray)' }}>Automated Regression:</span>
                <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>{totals.regressionTestsAutomated} Runs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dotted rgba(255,255,255,0.05)', paddingBottom: '0.25rem' }}>
                <span style={{ color: 'var(--neutral-gray)' }}>Manual Regression:</span>
                <span style={{ fontWeight: 700, color: 'var(--warning)' }}>{totals.regressionTestsManual} Runs</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.25rem', fontSize: '1.05rem' }}>
                <span style={{ fontWeight: 600 }}>Total Executions:</span>
                <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{totals.totalTestsByApplication} Runs</span>
              </div>
            </div>
          </div>

        </div>

        {/* Dynamic Groups Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* 1. Story Test Results */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Story Test Results
            </h4>
            <div className="form-grid">
              <div className="form-group"><label>Passed</label><input type="number" name="storyPassed" className="form-input" value={form.storyPassed} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Failed</label><input type="number" name="storyFailed" className="form-input" value={form.storyFailed} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Unexecuted</label><input type="number" name="storyUnexecuted" className="form-input" value={form.storyUnexecuted} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Blocked</label><input type="number" name="storyBlocked" className="form-input" value={form.storyBlocked} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Skipped</label><input type="number" name="storySkipped" className="form-input" value={form.storySkipped} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Critical</label><input type="number" name="storyCritical" className="form-input" value={form.storyCritical} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>New</label><input type="number" name="storyNew" className="form-input" value={form.storyNew} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Unused</label><input type="number" name="storyUnused" className="form-input" value={form.storyUnused} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label style={{ color: 'var(--error)' }}>Bugs Identified</label><input type="number" name="storyBugs" className="form-input" value={form.storyBugs} onChange={handleChange} min="0" /></div>
            </div>
          </div>

          {/* 2. Automated Regression Results */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--secondary)' }}>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Automation Test Results (AR)
            </h4>
            <div className="form-grid">
              <div className="form-group"><label>Passed</label><input type="number" name="arPassed" className="form-input" value={form.arPassed} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Failed</label><input type="number" name="arFailed" className="form-input" value={form.arFailed} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Unexecuted</label><input type="number" name="arUnexecuted" className="form-input" value={form.arUnexecuted} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Blocked</label><input type="number" name="arBlocked" className="form-input" value={form.arBlocked} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Skipped</label><input type="number" name="arSkipped" className="form-input" value={form.arSkipped} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Critical</label><input type="number" name="arCritical" className="form-input" value={form.arCritical} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>New</label><input type="number" name="arNew" className="form-input" value={form.arNew} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Unused</label><input type="number" name="arUnused" className="form-input" value={form.arUnused} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label style={{ color: 'var(--error)' }}>Bugs Identified</label><input type="number" name="arBugs" className="form-input" value={form.arBugs} onChange={handleChange} min="0" /></div>
            </div>
          </div>

          {/* 3. Manual Regression Results */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--warning)' }}>
            <h4 style={{ fontSize: '1rem', color: '#FFFFFF', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Manual Regression Test Results (MR)
            </h4>
            <div className="form-grid">
              <div className="form-group"><label>Passed</label><input type="number" name="mrPassed" className="form-input" value={form.mrPassed} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Failed</label><input type="number" name="mrFailed" className="form-input" value={form.mrFailed} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Unexecuted</label><input type="number" name="mrUnexecuted" className="form-input" value={form.mrUnexecuted} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Blocked</label><input type="number" name="mrBlocked" className="form-input" value={form.mrBlocked} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Skipped</label><input type="number" name="mrSkipped" className="form-input" value={form.mrSkipped} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Critical</label><input type="number" name="mrCritical" className="form-input" value={form.mrCritical} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>New</label><input type="number" name="mrNew" className="form-input" value={form.mrNew} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label>Unused</label><input type="number" name="mrUnused" className="form-input" value={form.mrUnused} onChange={handleChange} min="0" /></div>
              <div className="form-group"><label style={{ color: 'var(--error)' }}>Bugs Identified</label><input type="number" name="mrBugs" className="form-input" value={form.mrBugs} onChange={handleChange} min="0" /></div>
            </div>
          </div>

        </div>

        {/* Feedback Messages */}
        {feedback.message && (
          <div className="glass-card" style={{ 
            padding: '1rem', 
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

        {/* Submit */}
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={isSubmitting}
        >
          {isSubmitting ? <RefreshCcw size={16} className="spin" /> : <PlusCircle size={16} />}
          {isSubmitting ? "Submitting Report..." : "Log Weekly Test Report"}
        </button>

      </form>
    </div>
  );
}
