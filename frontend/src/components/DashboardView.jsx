import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, BarChart2, Layers, AlertOctagon 
} from 'lucide-react';

// Format date utility
const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Custom tooltips for clean dark-crypto style
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#0C0F16',
        border: '1px solid #1E2530',
        padding: '0.75rem 1rem',
        borderRadius: '4px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.7)'
      }}>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#8F9CAE', fontWeight: 600 }}>{formatDate(label)}</p>
        {payload.map((p, idx) => (
          <p key={idx} style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: p.color === 'var(--secondary)' ? '#FFFFFF' : p.color, fontWeight: 700 }}>
            <span style={{ textTransform: 'capitalize' }}>{p.name}:</span> {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardView({ reports, historicalData }) {
  if (!reports || reports.length === 0) {
    return (
      <div className="glass-card empty-state">
        <Layers size={48} className="empty-state-icon" />
        <h3>No historical records found</h3>
        <p>Seed the database or submit a weekly test report to populate this dashboard.</p>
      </div>
    );
  }

  // Get the most recent report (last in chronological order)
  const latestReport = reports[reports.length - 1];
  
  // Calculate average pass rate across all reports
  const totalStories = reports.reduce((acc, r) => acc + r.storyTests, 0);
  const passedStories = reports.reduce((acc, r) => acc + r.storyPassed, 0);
  const storyPassRate = totalStories > 0 ? (passedStories / totalStories) * 100 : 0;

  const totalAR = reports.reduce((acc, r) => acc + r.regressionTestsAutomated, 0);
  const passedAR = reports.reduce((acc, r) => acc + r.arPassed, 0);
  const arPassRate = totalAR > 0 ? (passedAR / totalAR) * 100 : 0;

  const totalMR = reports.reduce((acc, r) => acc + r.regressionTestsManual, 0);
  const passedMR = reports.reduce((acc, r) => acc + r.mrPassed, 0);
  const mrPassRate = totalMR > 0 ? (passedMR / totalMR) * 100 : 0;

  return (
    <div className="fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <div className="glass-card metric-card" style={{ '--accent': 'var(--primary)' }}>
          <div className="metric-header">
            <span>Story Test Suite</span>
            <Layers size={18} />
          </div>
          <div className="metric-value">{latestReport.storyTests}</div>
          <div className="metric-footer neutral">
            <span>Pass Rate: </span>
            <span className="trend-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              {storyPassRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ '--accent': 'var(--secondary)' }}>
          <div className="metric-header">
            <span>Automated Regression</span>
            <BarChart2 size={18} />
          </div>
          <div className="metric-value">{latestReport.regressionTestsAutomated}</div>
          <div className="metric-footer neutral">
            <span>Pass Rate: </span>
            <span className="trend-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              {arPassRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ '--accent': 'var(--warning)' }}>
          <div className="metric-header">
            <span>Manual Regression</span>
            <TrendingUp size={18} />
          </div>
          <div className="metric-value">{latestReport.regressionTestsManual}</div>
          <div className="metric-footer neutral">
            <span>Pass Rate: </span>
            <span className="trend-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)' }}>
              {mrPassRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="glass-card metric-card" style={{ '--accent': 'var(--error)' }}>
          <div className="metric-header">
            <span>Latest Weekly Bugs</span>
            <AlertOctagon size={18} />
          </div>
          <div className="metric-value">
            {latestReport.storyBugs + latestReport.arBugs + latestReport.mrBugs}
          </div>
          <div className="metric-footer negative">
            <span>Story: {latestReport.storyBugs} • Auto: {latestReport.arBugs} • Man: {latestReport.mrBugs}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="dashboard-layout">
        
        {/* Test Volume Stacked Area Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Test Executions Trend</h3>
              <p className="card-subtitle">Volume of test runs executed week-over-week</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span className="status-pill primary"><span className="dot story"></span> Story</span>
              <span className="status-pill secondary"><span className="dot ar"></span> Auto</span>
              <span className="status-pill warning"><span className="dot mr"></span> Manual</span>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMR" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--warning)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--warning)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickFormatter={(v) => v.substring(5)} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="storyTests" name="Story Tests" stroke="var(--primary)" fillOpacity={1} fill="url(#colorStory)" />
                <Area type="monotone" dataKey="regressionTestsAutomated" name="Automated Regression" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorAR)" />
                <Area type="monotone" dataKey="regressionTestsManual" name="Manual Regression" stroke="var(--warning)" fillOpacity={1} fill="url(#colorMR)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bug Breakdown Line Chart */}
        <div className="glass-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Defect Tracing</h3>
              <p className="card-subtitle">Identified issues across test pipelines</p>
            </div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickFormatter={(v) => v.substring(5)} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="storyBugs" name="Story Bugs" stroke="var(--error)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="arBugs" name="Automation Bugs" stroke="var(--warning)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="mrBugs" name="Manual Bugs" stroke="var(--info)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
