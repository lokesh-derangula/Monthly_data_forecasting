import { Calendar, User, FileText } from 'lucide-react';

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function WeeklyReportsView({ reports }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="glass-card empty-state">
        <FileText size={48} className="empty-state-icon" />
        <h3>No historical records found</h3>
        <p>Seed the database or submit a weekly test report to view weekly reports.</p>
      </div>
    );
  }

  return (
    <div className="fade-in-up glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-header">
        <div>
          <h3 className="card-title"><FileText size={18} /> Historical Weekly Reports</h3>
          <p className="card-subtitle">Raw weekly test tracking audit trail</p>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Week Commencing</th>
              <th>Author(s)</th>
              <th>Story Tests (P/F/B)</th>
              <th>Auto Regression (P/F/B)</th>
              <th>Manual Regression (P/F/B)</th>
              <th>Total Tests</th>
            </tr>
          </thead>
          <tbody>
            {[...reports].reverse().map((r) => (
              <tr key={r.id}>
                <td style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={14} className="text-secondary" /> {formatDate(r.createdAt)}
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' }}>
                    <User size={13} style={{ color: 'var(--primary)' }} />
                    {r.authors || 'N/A'}
                  </div>
                </td>
                <td>
                  <span className="status-pill primary">{r.storyTests} Runs</span>
                  <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--neutral-gray)' }}>
                    {r.storyPassed}/{r.storyFailed} <span style={{ color: 'var(--error)' }}>({r.storyBugs}🐞)</span>
                  </span>
                </td>
                <td>
                  <span className="status-pill secondary">{r.regressionTestsAutomated} Runs</span>
                  <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--neutral-gray)' }}>
                    {r.arPassed}/{r.arFailed} <span style={{ color: 'var(--error)' }}>({r.arBugs}🐞)</span>
                  </span>
                </td>
                <td>
                  <span className="status-pill warning">{r.regressionTestsManual} Runs</span>
                  <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--neutral-gray)' }}>
                    {r.mrPassed}/{r.mrFailed} <span style={{ color: 'var(--error)' }}>({r.mrBugs}🐞)</span>
                  </span>
                </td>
                <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{r.totalTestsByApplication}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
