import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './styles/theme.css';

// ─── Module Views ────────────────────────────────────────────────
import Dashboard from './pages/Dashboard.jsx';
import TradingDesk from './pages/TradingDesk.jsx';
import AnalysisSuite from './pages/AnalysisSuite.jsx';
import AgentFleet from './pages/AgentFleet.jsx';
import Portfolio from './pages/Portfolio.jsx';
import CashFlow from './pages/CashFlow.jsx';

// ─── Navigation Configuration ────────────────────────────────────
const NAV_SECTIONS = [
  {
    title: 'Command Center',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: '◆' },
      { id: 'trading', label: 'Trading Desk', icon: '⚡' },
      { id: 'portfolio', label: 'Portfolio', icon: '◈' },
      { id: 'cashflow', label: 'Cash Flow', icon: '◉' },
    ],
  },
  {
    title: 'Analysis Suite',
    items: [
      { id: 'analysis-gs', label: 'Stock Screener', icon: '▸', module: 'goldman-sachs' },
      { id: 'analysis-ms', label: 'DCF Valuation', icon: '▸', module: 'morgan-stanley' },
      { id: 'analysis-bw', label: 'Risk Analysis', icon: '▸', module: 'bridgewater' },
      { id: 'analysis-jpm', label: 'Earnings', icon: '▸', module: 'jpmorgan' },
      { id: 'analysis-br', label: 'Portfolio Build', icon: '▸', module: 'blackrock' },
      { id: 'analysis-ct', label: 'Technical', icon: '▸', module: 'citadel' },
      { id: 'analysis-he', label: 'Dividends', icon: '▸', module: 'harvard' },
      { id: 'analysis-bn', label: 'Competitive', icon: '▸', module: 'bain' },
      { id: 'analysis-rt', label: 'Patterns', icon: '▸', module: 'renaissance' },
      { id: 'analysis-mk', label: 'Macro', icon: '▸', module: 'mckinsey' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { id: 'agents', label: 'Agent Fleet', icon: '◇' },
    ],
  },
];

// ─── System Clock ────────────────────────────────────────────────
function useSystemClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// ─── Market Status ───────────────────────────────────────────────
function getMarketStatus(now) {
  const hour = now.getUTCHours();
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return { status: 'CLOSED', color: 'var(--red)' };
  if (hour >= 13.5 && hour < 20) return { status: 'OPEN', color: 'var(--green)' };
  if (hour >= 8 && hour < 13.5) return { status: 'PRE-MKT', color: 'var(--yellow)' };
  if (hour >= 20 && hour < 24) return { status: 'AFTER-HRS', color: 'var(--yellow)' };
  return { status: 'CLOSED', color: 'var(--red)' };
}

// ─── Simulated Live Metrics ──────────────────────────────────────
function useLiveMetrics() {
  const [metrics, setMetrics] = useState({
    totalPnL: 147832.56,
    dailyPnL: 12847.33,
    totalPositions: 47,
    activeAgents: 97,
    portfolioValue: 2847563.12,
    cashFlowMonthly: 18432.67,
    winRate: 73.2,
    sharpeRatio: 2.41,
    tradesToday: 156,
    alertsActive: 3,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        totalPnL: prev.totalPnL + (Math.random() - 0.42) * 500,
        dailyPnL: prev.dailyPnL + (Math.random() - 0.45) * 200,
        portfolioValue: prev.portfolioValue + (Math.random() - 0.4) * 1000,
        tradesToday: prev.tradesToday + (Math.random() > 0.7 ? 1 : 0),
        cashFlowMonthly: prev.cashFlowMonthly + (Math.random() - 0.48) * 50,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// ─── Header Component ────────────────────────────────────────────
function Header({ systemTime, market, metrics }) {
  const formatTime = (d) => d.toLocaleTimeString('en-US', { hour12: false });
  const formatDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  return (
    <div className="app-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ color: 'var(--gold)', fontWeight: 800, fontSize: '14px', letterSpacing: '2px' }}>CK</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '1px' }}>TRADING DESK</span>
        <span className="badge badge-gold">ENTERPRISE</span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Live Ticker */}
      <div style={{ display: 'flex', gap: '20px', fontSize: '11px', WebkitAppRegion: 'no-drag' }}>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>P&L </span>
          <span className={metrics.dailyPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}>
            {metrics.dailyPnL >= 0 ? '+' : ''}{formatCurrency(metrics.dailyPnL)}
          </span>
        </span>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>NAV </span>
          <span>{formatCurrency(metrics.portfolioValue)}</span>
        </span>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>AGENTS </span>
          <span style={{ color: 'var(--green)' }}>{metrics.activeAgents}/97</span>
        </span>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>TRADES </span>
          <span>{metrics.tradesToday}</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', WebkitAppRegion: 'no-drag' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className={`status-dot ${market.status === 'OPEN' ? 'active' : market.status === 'CLOSED' ? 'error' : 'warning'}`} />
          <span style={{ color: market.color, fontWeight: 600 }}>{market.status}</span>
        </div>
        <span style={{ color: 'var(--text-muted)' }}>{formatDate(systemTime)}</span>
        <span style={{ color: 'var(--cyan)', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatTime(systemTime)}</span>
      </div>
    </div>
  );
}

// ─── Sidebar Navigation ─────────────────────────────────────────
function Sidebar({ activeView, onNavigate }) {
  return (
    <div className="app-sidebar">
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          Coastal Key Enterprise
        </div>
        <div style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: 700, marginTop: '4px' }}>
          Autonomous Trading Platform
        </div>
      </div>

      {NAV_SECTIONS.map(section => (
        <div className="nav-section" key={section.title}>
          <div className="nav-section-title">{section.title}</div>
          {section.items.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id, item.module)}
            >
              <span style={{ fontSize: '10px', width: '14px', textAlign: 'center' }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      ))}

      {/* System Status Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="status-dot active" />
          <span style={{ fontSize: '10px', color: 'var(--green)', letterSpacing: '1px' }}>ALL SYSTEMS OPERATIONAL</span>
        </div>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          97 agents | 10 engines | 24/7
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel — Live Activity ─────────────────────────────────
function ActivityPanel({ metrics }) {
  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const recentTrades = [
    { time: '14:32:01', symbol: 'AAPL', side: 'BUY', qty: 150, price: 198.45, pnl: 234.50 },
    { time: '14:31:44', symbol: 'MSFT', side: 'SELL', qty: 80, price: 425.12, pnl: 1847.20 },
    { time: '14:31:12', symbol: 'NVDA', side: 'BUY', qty: 50, price: 892.30, pnl: -156.00 },
    { time: '14:30:55', symbol: 'GOOGL', side: 'BUY', qty: 100, price: 175.88, pnl: 445.00 },
    { time: '14:30:22', symbol: 'AMZN', side: 'SELL', qty: 60, price: 186.75, pnl: 923.40 },
    { time: '14:29:48', symbol: 'META', side: 'BUY', qty: 120, price: 512.44, pnl: 678.90 },
    { time: '14:29:15', symbol: 'JPM', side: 'BUY', qty: 200, price: 198.32, pnl: 1102.00 },
    { time: '14:28:50', symbol: 'V', side: 'SELL', qty: 75, price: 284.56, pnl: 567.30 },
  ];

  const activeStrategies = [
    { name: 'Momentum Alpha', status: 'active', pnl: 4832.50 },
    { name: 'Mean Reversion', status: 'active', pnl: 2147.80 },
    { name: 'Stat Arb Pairs', status: 'active', pnl: 1563.20 },
    { name: 'Dividend Capture', status: 'active', pnl: 892.40 },
    { name: 'Sector Rotation', status: 'active', pnl: 3411.63 },
    { name: 'Vol Crusher', status: 'active', pnl: 1200.00 },
  ];

  return (
    <div className="app-panel" style={{ padding: '12px' }}>
      {/* Performance Summary */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">
          <span className="card-title">Performance</span>
          <span className="badge badge-green">LIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="metric">
            <span className="metric-label">Win Rate</span>
            <span className="metric-value positive" style={{ fontSize: '18px' }}>{metrics.winRate.toFixed(1)}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Sharpe</span>
            <span className="metric-value" style={{ fontSize: '18px', color: 'var(--cyan)' }}>{metrics.sharpeRatio.toFixed(2)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Monthly Flow</span>
            <span className="metric-value positive" style={{ fontSize: '18px' }}>{formatCurrency(metrics.cashFlowMonthly)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Positions</span>
            <span className="metric-value" style={{ fontSize: '18px' }}>{metrics.totalPositions}</span>
          </div>
        </div>
      </div>

      {/* Active Strategies */}
      <div className="card" style={{ marginBottom: '12px' }}>
        <div className="card-header">
          <span className="card-title">Active Strategies</span>
          <span style={{ fontSize: '10px', color: 'var(--green)' }}>{activeStrategies.length} RUNNING</span>
        </div>
        {activeStrategies.map((s, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < activeStrategies.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="status-dot active" />
              <span style={{ fontSize: '11px' }}>{s.name}</span>
            </div>
            <span className="pnl-positive" style={{ fontSize: '11px', fontWeight: 600 }}>+{formatCurrency(s.pnl)}</span>
          </div>
        ))}
      </div>

      {/* Recent Trades */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Trades</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>LIVE FEED</span>
        </div>
        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
          {recentTrades.map((t, i) => (
            <div key={i} className="fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '11px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', marginRight: '8px' }}>{t.time}</span>
                <span style={{ color: t.side === 'BUY' ? 'var(--green)' : 'var(--red)', fontWeight: 600, marginRight: '6px' }}>{t.side}</span>
                <span style={{ color: 'var(--text-primary)' }}>{t.symbol}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>x{t.qty}</span>
              </div>
              <span className={t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'} style={{ fontWeight: 600 }}>
                {t.pnl >= 0 ? '+' : ''}{formatCurrency(t.pnl)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Footer Status Bar ───────────────────────────────────────────
function Footer({ metrics }) {
  return (
    <div className="app-footer">
      <span>CK TRADING DESK v1.0.0</span>
      <span style={{ color: 'var(--green)' }}>● CONNECTED</span>
      <span>GATEWAY: ck-api-gateway.david-e59.workers.dev</span>
      <span>AIRTABLE: appUSnNgpDkcEOzhN</span>
      <div style={{ flex: 1 }} />
      <span>ENGINES: 10/10 ●</span>
      <span>AGENTS: 97/97 ●</span>
      <span style={{ color: 'var(--gold)', fontWeight: 600 }}>COASTAL KEY ENTERPRISE</span>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────
export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [activeModule, setActiveModule] = useState(null);
  const systemTime = useSystemClock();
  const market = getMarketStatus(systemTime);
  const metrics = useLiveMetrics();

  const handleNavigate = useCallback((viewId, module) => {
    setActiveView(viewId);
    setActiveModule(module || null);
  }, []);

  const renderView = useMemo(() => {
    if (activeView === 'dashboard') return <Dashboard metrics={metrics} />;
    if (activeView === 'trading') return <TradingDesk metrics={metrics} />;
    if (activeView === 'portfolio') return <Portfolio metrics={metrics} />;
    if (activeView === 'cashflow') return <CashFlow metrics={metrics} />;
    if (activeView === 'agents') return <AgentFleet />;
    if (activeView.startsWith('analysis-')) return <AnalysisSuite module={activeModule} />;
    return <Dashboard metrics={metrics} />;
  }, [activeView, activeModule, metrics]);

  return (
    <div className="app-layout">
      <Header systemTime={systemTime} market={market} metrics={metrics} />
      <Sidebar activeView={activeView} onNavigate={handleNavigate} />
      <div className="app-main fade-in">{renderView}</div>
      <ActivityPanel metrics={metrics} />
      <Footer metrics={metrics} />
    </div>
  );
}
