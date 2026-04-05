import React from 'react';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const usdShort = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
const pct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
const pnlClass = (v) => v >= 0 ? 'pnl-positive' : 'pnl-negative';

const HOLDINGS = [
  { symbol: 'AAPL', shares: 500, avgCost: 142.30, current: 198.45, todayPct: 1.24 },
  { symbol: 'MSFT', shares: 300, avgCost: 310.50, current: 425.12, todayPct: -0.38 },
  { symbol: 'NVDA', shares: 200, avgCost: 450.00, current: 892.30, todayPct: 2.87 },
  { symbol: 'GOOGL', shares: 400, avgCost: 140.20, current: 175.88, todayPct: 0.62 },
  { symbol: 'AMZN', shares: 350, avgCost: 155.00, current: 186.75, todayPct: -0.15 },
  { symbol: 'META', shares: 250, avgCost: 380.00, current: 512.44, todayPct: 1.43 },
  { symbol: 'JPM', shares: 600, avgCost: 165.00, current: 198.32, todayPct: 0.88 },
  { symbol: 'GS', shares: 150, avgCost: 350.00, current: 468.90, todayPct: -0.52 },
  { symbol: 'V', shares: 300, avgCost: 240.00, current: 284.56, todayPct: 0.67 },
  { symbol: 'MA', shares: 200, avgCost: 380.00, current: 478.23, todayPct: 0.54 },
  { symbol: 'BRK.B', shares: 100, avgCost: 350.00, current: 412.30, todayPct: 0.31 },
  { symbol: 'JNJ', shares: 400, avgCost: 145.00, current: 156.78, todayPct: -0.28 },
  { symbol: 'PG', shares: 350, avgCost: 148.00, current: 168.45, todayPct: 0.12 },
  { symbol: 'KO', shares: 500, avgCost: 55.00, current: 62.34, todayPct: 0.08 },
  { symbol: 'UNH', shares: 100, avgCost: 480.00, current: 542.10, todayPct: -0.61 },
  { symbol: 'VZ', shares: 800, avgCost: 38.00, current: 42.18, todayPct: -0.43 },
  { symbol: 'O', shares: 600, avgCost: 48.00, current: 56.78, todayPct: 0.15 },
  { symbol: 'SCHD', shares: 1000, avgCost: 70.00, current: 78.45, todayPct: 0.34 },
  { symbol: 'VTI', shares: 500, avgCost: 220.00, current: 262.34, todayPct: 0.72 },
  { symbol: 'BND', shares: 800, avgCost: 68.00, current: 72.45, todayPct: 0.05 },
];

const totalNav = 2847563;
const totalPnl = 147832;
const todayPnl = 12847;

const enriched = HOLDINGS.map(h => {
  const marketValue = h.shares * h.current;
  const costBasis = h.shares * h.avgCost;
  const unrealizedPnl = marketValue - costBasis;
  const weight = ((marketValue / totalNav) * 100).toFixed(1);
  return { ...h, marketValue, costBasis, unrealizedPnl, weight };
});

const ALLOCATION = [
  { label: 'US Equities', pct: 45, color: '#3b82f6' },
  { label: 'International', pct: 15, color: '#06b6d4' },
  { label: 'Fixed Income', pct: 20, color: '#eab308' },
  { label: 'Alternatives', pct: 10, color: '#a855f7' },
  { label: 'Cash', pct: 10, color: '#6b7280' },
];

const SECTORS = [
  { name: 'Technology', weight: 42, color: '#3b82f6' },
  { name: 'Financials', weight: 22, color: '#22c55e' },
  { name: 'Healthcare', weight: 8, color: '#06b6d4' },
  { name: 'Consumer', weight: 12, color: '#a855f7' },
  { name: 'Telecom', weight: 4, color: '#eab308' },
  { name: 'Real Estate', weight: 4, color: '#f59e0b' },
  { name: 'ETFs', weight: 8, color: '#6b7280' },
];

const PERF_METRICS = [
  { label: 'Sharpe Ratio', value: '2.41' },
  { label: 'Sortino Ratio', value: '3.12' },
  { label: 'Max Drawdown', value: '-8.4%' },
  { label: 'Beta', value: '1.05' },
  { label: 'Alpha', value: '+4.2%' },
  { label: 'Volatility', value: '12.3%' },
];

const TRANSACTIONS = [
  { date: '2026-04-04', type: 'BUY', symbol: 'NVDA', shares: 50, price: 889.40, total: 44470.00 },
  { date: '2026-04-04', type: 'SELL', symbol: 'VZ', shares: 200, price: 42.05, total: 8410.00 },
  { date: '2026-04-03', type: 'BUY', symbol: 'SCHD', shares: 150, price: 77.90, total: 11685.00 },
  { date: '2026-04-03', type: 'DIVIDEND', symbol: 'O', shares: 600, price: 0.26, total: 153.90 },
  { date: '2026-04-02', type: 'BUY', symbol: 'MSFT', shares: 25, price: 422.80, total: 10570.00 },
  { date: '2026-04-01', type: 'SELL', symbol: 'JNJ', shares: 100, price: 157.20, total: 15720.00 },
  { date: '2026-03-31', type: 'DIVIDEND', symbol: 'KO', shares: 500, price: 0.49, total: 242.50 },
  { date: '2026-03-28', type: 'BUY', symbol: 'AAPL', shares: 75, price: 196.30, total: 14722.50 },
  { date: '2026-03-27', type: 'SELL', symbol: 'GS', shares: 30, price: 465.10, total: 13953.00 },
  { date: '2026-03-26', type: 'BUY', symbol: 'META', shares: 40, price: 508.60, total: 20344.00 },
];

export default function Portfolio({ metrics }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Portfolio Value Header */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Portfolio Overview</span>
          <span className="badge-green">LIVE</span>
        </div>
        <div className="grid-4">
          <div className="metric">
            <span className="metric-label">Net Asset Value (NAV)</span>
            <span className="metric-value" style={{ fontSize: '24px', fontWeight: 800 }}>
              {usd.format(totalNav)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Total P&L</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '20px' }}>
              +{usd.format(totalPnl)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Today</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '20px' }}>
              +{usd.format(todayPnl)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Total Return</span>
            <span className="metric-value pnl-positive">+5.48%</span>
          </div>
        </div>
      </div>

      {/* Asset Allocation Bar */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Asset Allocation</span>
        </div>
        <div style={{
          display: 'flex',
          height: '36px',
          borderRadius: '6px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}>
          {ALLOCATION.map(a => (
            <div
              key={a.label}
              style={{
                width: `${a.pct}%`,
                backgroundColor: a.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{a.pct}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {ALLOCATION.map(a => (
            <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: a.color }} />
              <span style={{ fontSize: '12px' }}>{a.label} ({a.pct}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-header">
          <span className="card-title">Holdings ({HOLDINGS.length} Positions)</span>
          <span className="badge-green">ACTIVE</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th style={{ textAlign: 'right' }}>Shares</th>
              <th style={{ textAlign: 'right' }}>Avg Cost</th>
              <th style={{ textAlign: 'right' }}>Current</th>
              <th style={{ textAlign: 'right' }}>Market Value</th>
              <th style={{ textAlign: 'right' }}>Weight %</th>
              <th style={{ textAlign: 'right' }}>Unrealized P&L</th>
              <th style={{ textAlign: 'right' }}>Today %</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map(h => (
              <tr key={h.symbol}>
                <td style={{ fontWeight: 700 }}>{h.symbol}</td>
                <td style={{ textAlign: 'right' }}>{h.shares.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(h.avgCost)}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(h.current)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{usd.format(h.marketValue)}</td>
                <td style={{ textAlign: 'right' }}>{h.weight}%</td>
                <td style={{ textAlign: 'right' }} className={pnlClass(h.unrealizedPnl)}>
                  {h.unrealizedPnl >= 0 ? '+' : ''}{usd.format(h.unrealizedPnl)}
                </td>
                <td style={{ textAlign: 'right' }} className={pnlClass(h.todayPct)}>
                  {pct(h.todayPct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sector Exposure */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Sector Exposure</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {SECTORS.map(s => (
            <div key={s.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px' }}>{s.name}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: s.color }}>{s.weight}%</span>
              </div>
              <div style={{
                height: '8px',
                backgroundColor: '#1f2937',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${s.weight}%`,
                  height: '100%',
                  backgroundColor: s.color,
                  borderRadius: '4px',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Performance Metrics</span>
        </div>
        <div className="grid-3">
          {PERF_METRICS.map(m => (
            <div key={m.label} className="metric" style={{
              padding: '12px',
              backgroundColor: '#111827',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <span className="metric-label">{m.label}</span>
              <span className="metric-value" style={{
                fontSize: '20px',
                fontWeight: 700,
                color: m.value.startsWith('-') ? '#ef4444' : m.value.startsWith('+') ? '#22c55e' : '#f1f5f9',
              }}>
                {m.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Last 10 Transactions</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Symbol</th>
              <th style={{ textAlign: 'right' }}>Shares</th>
              <th style={{ textAlign: 'right' }}>Price</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {TRANSACTIONS.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td>
                  <span className={
                    t.type === 'BUY' ? 'badge-green'
                      : t.type === 'SELL' ? 'pnl-negative'
                        : 'pnl-positive'
                  } style={{ fontWeight: 600, fontSize: '11px' }}>
                    {t.type}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>{t.symbol}</td>
                <td style={{ textAlign: 'right' }}>{t.shares.toLocaleString()}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(t.price)}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>{usd.format(t.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
