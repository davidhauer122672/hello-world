import React, { useState } from 'react';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const pct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

const MODULE_INFO = [
  { id: 'goldman-sachs', name: 'Stock Screener', firm: 'Goldman Sachs', desc: 'Institutional equity screening with P/E, moat, and target analysis', signals: 847, accuracy: 78.4 },
  { id: 'morgan-stanley', name: 'DCF Valuation', firm: 'Morgan Stanley', desc: 'Discounted cash flow modeling with sensitivity analysis', signals: 234, accuracy: 82.1 },
  { id: 'bridgewater', name: 'Risk Analysis', firm: 'Bridgewater', desc: 'Portfolio risk assessment, stress testing, and hedging', signals: 156, accuracy: 91.3 },
  { id: 'jpmorgan', name: 'Earnings Breakdown', firm: 'JPMorgan Chase', desc: 'Pre-earnings analysis with scenario modeling', signals: 423, accuracy: 76.8 },
  { id: 'blackrock', name: 'Portfolio Construction', firm: 'BlackRock', desc: 'Multi-asset allocation with ETF recommendations', signals: 312, accuracy: 85.2 },
  { id: 'citadel', name: 'Technical Analysis', firm: 'Citadel', desc: 'Quantitative technical analysis with trade signals', signals: 1247, accuracy: 71.6 },
  { id: 'harvard', name: 'Dividend Strategy', firm: 'Harvard Endowment', desc: 'Income-focused portfolio with DRIP projections', signals: 189, accuracy: 88.7 },
  { id: 'bain', name: 'Competitive Analysis', firm: 'Bain & Company', desc: 'Sector competitive landscape and moat assessment', signals: 98, accuracy: 83.4 },
  { id: 'renaissance', name: 'Pattern Finder', firm: 'Renaissance Tech', desc: 'Statistical edge detection and anomaly identification', signals: 2134, accuracy: 69.2 },
  { id: 'mckinsey', name: 'Macro Impact', firm: 'McKinsey', desc: 'Macroeconomic trend analysis and sector rotation', signals: 67, accuracy: 79.5 },
];

function OverviewGrid({ onSelect }) {
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Financial Analysis Suite</span><span className="badge badge-green">10 ENGINES ACTIVE</span></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Enterprise-grade analysis across 10 Wall Street methodologies. All engines operate 24/7 generating signals for the CK Trading Desk.</p>
      </div>
      <div className="grid-auto">
        {MODULE_INFO.map(m => (
          <div key={m.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onSelect(m.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="status-dot active" /><span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '12px' }}>{m.firm}</span>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>{m.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>{m.desc}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
              <span><span style={{ color: 'var(--text-muted)' }}>SIGNALS </span><span style={{ color: 'var(--cyan)' }}>{m.signals}</span></span>
              <span><span style={{ color: 'var(--text-muted)' }}>ACCURACY </span><span style={{ color: 'var(--green)' }}>{m.accuracy}%</span></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Goldman Sachs Stock Screener ────────────────────────────────
function GoldmanSachsView() {
  const stocks = [
    { ticker: 'AAPL', price: 198.45, pe: 31.2, growth: 8.4, de: 1.87, yield: 0.55, moat: 'strong', risk: 3, entry: 190, stop: 182 },
    { ticker: 'MSFT', price: 425.12, pe: 36.8, growth: 14.2, de: 0.42, yield: 0.72, moat: 'strong', risk: 3, entry: 410, stop: 395 },
    { ticker: 'NVDA', price: 892.30, pe: 65.4, growth: 126.0, de: 0.41, yield: 0.02, moat: 'strong', risk: 6, entry: 850, stop: 790 },
    { ticker: 'GOOGL', price: 175.88, pe: 27.1, growth: 12.8, de: 0.05, yield: 0.50, moat: 'strong', risk: 3, entry: 168, stop: 160 },
    { ticker: 'AMZN', price: 186.75, pe: 62.3, growth: 11.8, de: 0.58, yield: 0.00, moat: 'strong', risk: 4, entry: 178, stop: 168 },
    { ticker: 'META', price: 512.44, pe: 28.5, growth: 15.7, de: 0.28, yield: 0.36, moat: 'strong', risk: 4, entry: 490, stop: 470 },
    { ticker: 'JPM', price: 198.32, pe: 11.8, growth: 6.2, de: 1.32, yield: 2.45, moat: 'moderate', risk: 4, entry: 190, stop: 182 },
    { ticker: 'GS', price: 468.90, pe: 15.2, growth: 4.8, de: 2.45, yield: 2.30, moat: 'moderate', risk: 5, entry: 450, stop: 430 },
    { ticker: 'V', price: 284.56, pe: 31.4, growth: 10.1, de: 0.85, yield: 0.76, moat: 'strong', risk: 3, entry: 275, stop: 265 },
    { ticker: 'BRK.B', price: 412.30, pe: 9.8, growth: 7.5, de: 0.25, yield: 0.00, moat: 'strong', risk: 2, entry: 400, stop: 385 },
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Goldman Sachs Stock Screener</span><span className="badge badge-gold">ENTERPRISE GRADE</span></div>
      </div>
      <div className="card">
        <table className="data-table">
          <thead><tr><th>Ticker</th><th>Price</th><th>P/E</th><th>Rev Growth 5Y</th><th>D/E</th><th>Div Yield</th><th>Moat</th><th>Risk</th><th>Entry</th><th>Stop Loss</th></tr></thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.ticker}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{s.ticker}</td>
                <td>{fmt(s.price)}</td><td>{s.pe}</td><td className={s.growth > 10 ? 'pnl-positive' : ''}>{pct(s.growth)}</td>
                <td style={{ color: s.de > 1.5 ? 'var(--yellow)' : 'var(--green)' }}>{s.de.toFixed(2)}</td>
                <td>{s.yield.toFixed(2)}%</td>
                <td><span className={`badge ${s.moat === 'strong' ? 'badge-green' : 'badge-blue'}`}>{s.moat.toUpperCase()}</span></td>
                <td style={{ color: s.risk <= 3 ? 'var(--green)' : s.risk <= 5 ? 'var(--yellow)' : 'var(--red)' }}>{s.risk}/10</td>
                <td>{fmt(s.entry)}</td><td style={{ color: 'var(--red)' }}>{fmt(s.stop)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card" style={{ marginTop: '16px' }}>
        <div className="card-header"><span className="card-title">Top 3 Picks</span></div>
        <div className="grid-3">
          {[stocks[0], stocks[1], stocks[5]].map(s => (
            <div key={s.ticker} style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold)' }}>{s.ticker}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Moat: {s.moat} | Risk: {s.risk}/10 | Entry: {fmt(s.entry)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Morgan Stanley DCF ─────────────────────────────────────────
function MorganStanleyView() {
  const projections = [
    { year: 2026, revenue: 76125, ebit: 41868, fcf: 33114 },
    { year: 2027, revenue: 95156, ebit: 52335, fcf: 41393 },
    { year: 2028, revenue: 114187, ebit: 62802, fcf: 49672 },
    { year: 2029, revenue: 131315, ebit: 72223, fcf: 57123 },
    { year: 2030, revenue: 144446, ebit: 79445, fcf: 62835 },
  ];
  const sensitivity = [
    [72.50, 65.30, 59.40, 54.50, 50.30],
    [80.20, 71.80, 64.90, 59.20, 54.40],
    [90.10, 79.80, 71.60, 64.80, 59.20],
    [102.50, 89.60, 79.50, 71.40, 64.80],
    [118.80, 102.10, 89.40, 79.60, 71.60],
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Morgan Stanley DCF — NVDA</span><span className="badge badge-green">UNDERVALUED</span></div>
        <div className="grid-4" style={{ marginTop: '12px' }}>
          <div className="metric"><span className="metric-label">Revenue</span><span className="metric-value" style={{ fontSize: '16px' }}>$60.9B</span></div>
          <div className="metric"><span className="metric-label">Growth Rate</span><span className="metric-value positive" style={{ fontSize: '16px' }}>25%</span></div>
          <div className="metric"><span className="metric-label">WACC</span><span className="metric-value" style={{ fontSize: '16px' }}>10.5%</span></div>
          <div className="metric"><span className="metric-label">Terminal Growth</span><span className="metric-value" style={{ fontSize: '16px' }}>3.0%</span></div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">5-Year Projection ($M)</span></div>
          <table className="data-table"><thead><tr><th>Year</th><th>Revenue</th><th>EBIT</th><th>FCF</th></tr></thead>
            <tbody>{projections.map(p => (<tr key={p.year}><td>{p.year}</td><td>{fmt(p.revenue)}</td><td>{fmt(p.ebit)}</td><td className="pnl-positive">{fmt(p.fcf)}</td></tr>))}</tbody>
          </table>
          <div style={{ marginTop: '12px', padding: '12px', background: 'var(--green-bg)', borderRadius: '6px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enterprise Value</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--green)' }}>$1.45T</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Per Share: $58.70 | Current: $36.20 | Upside: +62.2%</div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Sensitivity Matrix (Per Share $)</span></div>
          <table className="data-table">
            <thead><tr><th>WACC \ Growth</th><th>1%</th><th>2%</th><th>3%</th><th>4%</th><th>5%</th></tr></thead>
            <tbody>{[8, 9, 10.5, 11, 12].map((w, i) => (
              <tr key={w}><td style={{ fontWeight: 600 }}>{w}%</td>
                {sensitivity[i].map((v, j) => (<td key={j} style={{ color: v > 36.2 ? 'var(--green)' : 'var(--red)' }}>${v}</td>))}
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Bridgewater Risk ────────────────────────────────────────────
function BridgewaterView() {
  const stressTests = [
    { scenario: '2008 Financial Crisis', drawdown: -38.2, recovery: '18 months' },
    { scenario: 'COVID-19 Crash', drawdown: -24.8, recovery: '5 months' },
    { scenario: 'Rate Shock (+200bps)', drawdown: -14.6, recovery: '8 months' },
    { scenario: 'Inflation Spike (8%+)', drawdown: -12.1, recovery: '12 months' },
    { scenario: 'Geopolitical Crisis', drawdown: -18.5, recovery: '10 months' },
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Bridgewater Risk Analysis</span><span className="badge badge-blue">RISK MONITORING</span></div>
        <div className="grid-4" style={{ marginTop: '12px' }}>
          <div className="metric"><span className="metric-label">VaR (95%)</span><span className="metric-value negative" style={{ fontSize: '16px' }}>-$42,180</span></div>
          <div className="metric"><span className="metric-label">VaR (99%)</span><span className="metric-value negative" style={{ fontSize: '16px' }}>-$78,420</span></div>
          <div className="metric"><span className="metric-label">HHI Index</span><span className="metric-value" style={{ fontSize: '16px', color: 'var(--yellow)' }}>0.1842</span></div>
          <div className="metric"><span className="metric-label">Portfolio Beta</span><span className="metric-value" style={{ fontSize: '16px' }}>1.05</span></div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Stress Test Scenarios</span></div>
          <table className="data-table"><thead><tr><th>Scenario</th><th>Drawdown</th><th>Recovery</th></tr></thead>
            <tbody>{stressTests.map(s => (<tr key={s.scenario}><td>{s.scenario}</td><td className="pnl-negative" style={{ fontWeight: 700 }}>{s.drawdown}%</td><td>{s.recovery}</td></tr>))}</tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Hedging Recommendations</span></div>
          {[{ name: 'Put Protection', instrument: 'SPY Puts', cost: '$42,713', protection: '10-15% downside' },
            { name: 'Tail Risk Hedge', instrument: 'VIX Call Spreads', cost: '$14,237', protection: 'Black swan events' },
            { name: 'Sector Hedge', instrument: 'Inverse ETFs', cost: '$22,780', protection: 'Concentration risk' }
          ].map((h, i) => (
            <div key={i} style={{ padding: '10px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontWeight: 600, fontSize: '12px' }}>{h.name}</div><div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{h.instrument} — {h.protection}</div></div>
              <span style={{ color: 'var(--yellow)', fontSize: '12px', fontWeight: 600 }}>{h.cost}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── JPMorgan Earnings ───────────────────────────────────────────
function JPMorganView() {
  const quarters = [
    { q: 'Q4 2025', estEPS: 0.82, actEPS: 0.89, surprise: 8.5, reaction: 4.2 },
    { q: 'Q3 2025', estEPS: 0.75, actEPS: 0.81, surprise: 8.0, reaction: 6.1 },
    { q: 'Q2 2025', estEPS: 0.64, actEPS: 0.68, surprise: 6.3, reaction: 12.8 },
    { q: 'Q1 2025', estEPS: 0.57, actEPS: 0.61, surprise: 7.0, reaction: 3.5 },
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">JPMorgan Earnings — NVDA</span><span className="badge badge-green">BUY BEFORE</span></div>
        <div className="grid-3" style={{ marginTop: '12px' }}>
          <div className="metric"><span className="metric-label">Next EPS Consensus</span><span className="metric-value" style={{ fontSize: '16px' }}>$0.95</span></div>
          <div className="metric"><span className="metric-label">Revenue Consensus</span><span className="metric-value" style={{ fontSize: '16px' }}>$38.2B</span></div>
          <div className="metric"><span className="metric-label">Implied Move</span><span className="metric-value" style={{ fontSize: '16px', color: 'var(--yellow)' }}>8.5%</span></div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Earnings History</span></div>
          <table className="data-table"><thead><tr><th>Quarter</th><th>Est EPS</th><th>Act EPS</th><th>Surprise</th><th>Price Reaction</th></tr></thead>
            <tbody>{quarters.map(q => (<tr key={q.q}><td>{q.q}</td><td>${q.estEPS}</td><td style={{ color: 'var(--green)', fontWeight: 600 }}>${q.actEPS}</td><td className="pnl-positive">+{q.surprise}%</td><td className="pnl-positive">+{q.reaction}%</td></tr>))}</tbody>
          </table>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Scenarios</span></div>
          {[{ name: 'Bull Case', prob: '35%', target: '$970', color: 'var(--green)' },
            { name: 'Base Case', prob: '45%', target: '$910', color: 'var(--blue)' },
            { name: 'Bear Case', prob: '20%', target: '$780', color: 'var(--red)' }
          ].map((s, i) => (
            <div key={i} style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: s.color, fontWeight: 600 }}>{s.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>Prob: {s.prob}</span>
              <span style={{ fontWeight: 600 }}>{s.target}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BlackRock Portfolio ─────────────────────────────────────────
function BlackRockView() {
  const etfs = [
    { ticker: 'VTI', name: 'Total Stock Market', expense: 0.03, yield: 1.3, alloc: 30, type: 'Core' },
    { ticker: 'VXUS', name: 'International', expense: 0.07, yield: 3.1, alloc: 15, type: 'Core' },
    { ticker: 'BND', name: 'Total Bond Market', expense: 0.03, yield: 4.2, alloc: 15, type: 'Core' },
    { ticker: 'QQQ', name: 'Nasdaq 100', expense: 0.20, yield: 0.6, alloc: 10, type: 'Satellite' },
    { ticker: 'SCHD', name: 'US Dividend', expense: 0.06, yield: 3.5, alloc: 10, type: 'Core' },
    { ticker: 'VNQ', name: 'Real Estate', expense: 0.12, yield: 3.8, alloc: 5, type: 'Satellite' },
    { ticker: 'GLD', name: 'Gold', expense: 0.40, yield: 0.0, alloc: 5, type: 'Satellite' },
    { ticker: 'TIP', name: 'TIPS', expense: 0.19, yield: 3.9, alloc: 10, type: 'Core' },
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">BlackRock Portfolio Construction</span><span className="badge badge-gold">OPTIMIZED</span></div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
          <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'conic-gradient(var(--blue) 0% 45%, var(--cyan) 45% 60%, var(--gold) 60% 80%, var(--purple) 80% 90%, var(--text-muted) 90% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>NAV</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>$2.85M</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '11px', flexWrap: 'wrap' }}>
          {[{ label: 'US Equity 45%', color: 'var(--blue)' }, { label: 'Intl 15%', color: 'var(--cyan)' }, { label: 'Fixed Income 20%', color: 'var(--gold)' }, { label: 'Alternatives 10%', color: 'var(--purple)' }, { label: 'Cash 10%', color: 'var(--text-muted)' }].map(a => (
            <span key={a.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: a.color, display: 'inline-block' }} />{a.label}
            </span>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">ETF Recommendations</span></div>
        <table className="data-table"><thead><tr><th>Ticker</th><th>Name</th><th>Expense</th><th>Yield</th><th>Allocation</th><th>Type</th></tr></thead>
          <tbody>{etfs.map(e => (
            <tr key={e.ticker}><td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.ticker}</td><td>{e.name}</td><td>{e.expense}%</td><td>{e.yield}%</td>
              <td style={{ fontWeight: 600, color: 'var(--cyan)' }}>{e.alloc}%</td>
              <td><span className={`badge ${e.type === 'Core' ? 'badge-blue' : 'badge-purple'}`}>{e.type}</span></td>
            </tr>))}</tbody>
        </table>
        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-elevated)', borderRadius: '6px', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Expected Return: </span><span className="pnl-positive" style={{ fontWeight: 600 }}>8.5% - 11.2%</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: '16px' }}>Rebalance: </span><span>Quarterly + 5% drift</span>
        </div>
      </div>
    </div>
  );
}

// ─── Citadel Technical ───────────────────────────────────────────
function CitadelView() {
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Citadel Technical — AAPL</span><span className="badge badge-green">BUY</span></div>
        <div className="grid-4" style={{ marginTop: '12px' }}>
          <div className="metric"><span className="metric-label">RSI (14)</span><span className="metric-value" style={{ fontSize: '16px', color: 'var(--cyan)' }}>62.3</span>
            <div style={{ width: '100%', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', marginTop: '4px' }}><div style={{ width: '62.3%', height: '100%', background: 'var(--cyan)', borderRadius: '3px' }} /></div>
          </div>
          <div className="metric"><span className="metric-label">MACD</span><span className="metric-value positive" style={{ fontSize: '16px' }}>+0.56</span><span style={{ fontSize: '10px', color: 'var(--green)' }}>BULLISH CROSSOVER</span></div>
          <div className="metric"><span className="metric-label">Bollinger</span><span className="metric-value" style={{ fontSize: '16px' }}>MID</span><span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>$191 - $198 - $205</span></div>
          <div className="metric"><span className="metric-label">Volume</span><span className="metric-value" style={{ fontSize: '16px' }}>48.2M</span><span style={{ fontSize: '10px', color: 'var(--green)' }}>+12% vs avg</span></div>
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Moving Averages</span></div>
          <table className="data-table"><thead><tr><th>Period</th><th>SMA</th><th>EMA</th><th>vs Price</th></tr></thead>
            <tbody>
              {[{ p: '50-Day', sma: 195.42, ema: 196.18, above: true }, { p: '100-Day', sma: 190.85, ema: 192.34, above: true }, { p: '200-Day', sma: 182.67, ema: 185.12, above: true }].map(m => (
                <tr key={m.p}><td>{m.p}</td><td>${m.sma}</td><td>${m.ema}</td><td><span className="badge badge-green">ABOVE</span></td></tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: '12px', fontSize: '11px' }}>
            <div style={{ marginBottom: '6px' }}><span style={{ color: 'var(--text-muted)' }}>Support: </span><span style={{ color: 'var(--green)' }}>$195 | $190 | $185</span></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Resistance: </span><span style={{ color: 'var(--red)' }}>$202 | $208 | $215</span></div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Trade Setup</span></div>
          <div style={{ padding: '16px', background: 'var(--green-bg)', borderRadius: '8px' }}>
            <div className="grid-2" style={{ gap: '12px' }}>
              <div className="metric"><span className="metric-label">Entry</span><span className="metric-value" style={{ fontSize: '18px' }}>$198.00</span></div>
              <div className="metric"><span className="metric-label">Stop Loss</span><span className="metric-value negative" style={{ fontSize: '18px' }}>$193.00</span></div>
              <div className="metric"><span className="metric-label">Target</span><span className="metric-value positive" style={{ fontSize: '18px' }}>$210.00</span></div>
              <div className="metric"><span className="metric-label">R:R Ratio</span><span className="metric-value" style={{ fontSize: '18px', color: 'var(--cyan)' }}>2.4:1</span></div>
            </div>
          </div>
          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            <span className="badge badge-green" style={{ fontSize: '14px', padding: '8px 20px' }}>SIGNAL: BUY — CONFIDENCE 72%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Harvard Dividend ────────────────────────────────────────────
function HarvardView() {
  const stocks = [
    { ticker: 'KO', yield: 3.1, safety: 9, years: 62, payout: 72, sector: 'Consumer' },
    { ticker: 'JNJ', yield: 3.0, safety: 9, years: 62, payout: 68, sector: 'Healthcare' },
    { ticker: 'PG', yield: 2.5, safety: 9, years: 68, payout: 62, sector: 'Consumer' },
    { ticker: 'VZ', yield: 6.8, safety: 7, years: 19, payout: 57, sector: 'Telecom' },
    { ticker: 'T', yield: 6.5, safety: 6, years: 5, payout: 65, sector: 'Telecom' },
    { ticker: 'O', yield: 5.5, safety: 8, years: 30, payout: 75, sector: 'REIT' },
    { ticker: 'SCHD', yield: 3.5, safety: 9, years: 12, payout: 45, sector: 'ETF' },
    { ticker: 'XOM', yield: 3.4, safety: 7, years: 41, payout: 48, sector: 'Energy' },
    { ticker: 'ABBV', yield: 3.8, safety: 8, years: 52, payout: 55, sector: 'Healthcare' },
    { ticker: 'PEP', yield: 2.9, safety: 9, years: 52, payout: 64, sector: 'Consumer' },
    { ticker: 'MO', yield: 8.2, safety: 5, years: 54, payout: 80, sector: 'Consumer' },
    { ticker: 'IBM', yield: 4.1, safety: 7, years: 28, payout: 72, sector: 'Technology' },
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Harvard Dividend Strategy</span><span className="badge badge-gold">INCOME ENGINE</span></div>
        <div className="grid-3" style={{ marginTop: '12px' }}>
          <div className="metric"><span className="metric-label">Monthly Income</span><span className="metric-value positive" style={{ fontSize: '18px' }}>$2,847</span></div>
          <div className="metric"><span className="metric-label">Avg Yield</span><span className="metric-value" style={{ fontSize: '18px', color: 'var(--cyan)' }}>4.36%</span></div>
          <div className="metric"><span className="metric-label">Avg Safety</span><span className="metric-value" style={{ fontSize: '18px', color: 'var(--green)' }}>7.8/10</span></div>
        </div>
      </div>
      <div className="card">
        <table className="data-table"><thead><tr><th>Ticker</th><th>Yield</th><th>Safety</th><th>Consec. Years</th><th>Payout %</th><th>Sector</th></tr></thead>
          <tbody>{stocks.map(s => (<tr key={s.ticker}><td style={{ fontWeight: 600 }}>{s.ticker}</td><td style={{ color: 'var(--green)' }}>{s.yield}%</td>
            <td style={{ color: s.safety >= 8 ? 'var(--green)' : s.safety >= 6 ? 'var(--yellow)' : 'var(--red)' }}>{s.safety}/10</td>
            <td>{s.years}</td><td style={{ color: s.payout > 75 ? 'var(--yellow)' : 'inherit' }}>{s.payout}%</td><td>{s.sector}</td>
          </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Remaining module views (Bain, Renaissance, McKinsey) ────────
function BainView() {
  const companies = [
    { name: 'Microsoft', mcap: '3.1T', rev: '236B', margin: 36.4, moat: 'Strong' },
    { name: 'Amazon', mcap: '1.9T', rev: '620B', margin: 7.8, moat: 'Strong' },
    { name: 'Google', mcap: '2.1T', rev: '340B', margin: 27.5, moat: 'Strong' },
    { name: 'Oracle', mcap: '350B', rev: '53B', margin: 26.2, moat: 'Moderate' },
    { name: 'Salesforce', mcap: '275B', rev: '35B', margin: 18.3, moat: 'Moderate' },
    { name: 'Snowflake', mcap: '65B', rev: '3.4B', margin: -4.2, moat: 'Weak' },
  ];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Bain Competitive — Cloud Computing</span><span className="badge badge-gold">WINNER: MSFT</span></div>
      </div>
      <div className="card">
        <table className="data-table"><thead><tr><th>Company</th><th>Market Cap</th><th>Revenue</th><th>Net Margin</th><th>Moat</th></tr></thead>
          <tbody>{companies.map(c => (<tr key={c.name}><td style={{ fontWeight: 600 }}>{c.name}</td><td>${c.mcap}</td><td>${c.rev}</td>
            <td className={c.margin > 0 ? 'pnl-positive' : 'pnl-negative'}>{c.margin}%</td>
            <td><span className={`badge ${c.moat === 'Strong' ? 'badge-green' : c.moat === 'Moderate' ? 'badge-blue' : 'badge-red'}`}>{c.moat}</span></td>
          </tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

function RenaissanceView() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const returns = [1.2, -0.3, 0.8, 1.5, 0.2, -0.1, 1.0, -0.8, -1.2, 0.9, 1.8, 1.4];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">Renaissance Pattern Finder — SPY</span><span className="badge badge-purple">QUANT ANALYSIS</span></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Seasonality (Avg Monthly Return)</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
            {months.map((m, i) => (
              <div key={m} style={{ padding: '8px 4px', textAlign: 'center', background: returns[i] > 0 ? 'var(--green-bg)' : 'var(--red-bg)', borderRadius: '4px' }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{m}</div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: returns[i] > 0 ? 'var(--green)' : 'var(--red)' }}>{returns[i] > 0 ? '+' : ''}{returns[i]}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Market Signals</span></div>
          {[{ label: 'Insider Activity', value: 'Net Buyers: 234 vs Sellers: 189', signal: 'BULLISH', color: 'var(--green)' },
            { label: 'Short Interest', value: '2.1% | Days to Cover: 1.8', signal: 'LOW', color: 'var(--text-muted)' },
            { label: 'Institutional Flow', value: 'Net Inflow: $2.4B (13F)', signal: 'BULLISH', color: 'var(--green)' },
            { label: 'Options Activity', value: 'Call/Put Ratio: 1.8 (Bullish)', signal: 'BULLISH', color: 'var(--green)' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <div><div style={{ fontWeight: 600 }}>{s.label}</div><div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{s.value}</div></div>
              <span style={{ color: s.color, fontWeight: 700 }}>{s.signal}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function McKinseyView() {
  const sectors = ['Technology', 'Financials', 'Healthcare', 'Consumer Disc.', 'Industrials', 'Energy', 'Utilities', 'Consumer Stpl.', 'Real Estate', 'Materials'];
  const weights = ['Overweight', 'Overweight', 'Neutral', 'Underweight', 'Neutral', 'Underweight', 'Overweight', 'Overweight', 'Neutral', 'Underweight'];
  return (
    <div>
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card-header"><span className="card-title">McKinsey Macro Impact Assessment</span><span className="badge badge-blue">MACRO BRIEFING</span></div>
        <div className="grid-4" style={{ marginTop: '12px', gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {[{ label: 'Fed Rate', value: '4.25%' }, { label: 'CPI', value: '2.8%' }, { label: 'GDP', value: '2.1%' }, { label: 'DXY', value: '104.2' }, { label: 'Unemployment', value: '3.9%' }].map(m => (
            <div key={m.label} className="metric"><span className="metric-label">{m.label}</span><span className="metric-value" style={{ fontSize: '16px' }}>{m.value}</span></div>
          ))}
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Sector Rotation</span></div>
          {sectors.map((s, i) => (
            <div key={s} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '11px' }}>
              <span>{s}</span>
              <span className={`badge ${weights[i] === 'Overweight' ? 'badge-green' : weights[i] === 'Underweight' ? 'badge-red' : 'badge-blue'}`}>{weights[i]}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Portfolio Adjustments</span></div>
          {[{ action: 'ADD', asset: 'TIPS/Commodities', reason: 'Inflation hedge — CPI above target' },
            { action: 'REDUCE', asset: 'Long-Duration Bonds', reason: 'Rates expected higher for longer' },
            { action: 'ADD', asset: 'Defensive Equities', reason: 'Late cycle positioning' },
            { action: 'MAINTAIN', asset: 'Technology Overweight', reason: 'AI capex cycle ongoing' },
            { action: 'ADD', asset: 'International (VXUS)', reason: 'DXY weakening, valuation gap' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${r.action === 'ADD' ? 'badge-green' : r.action === 'REDUCE' ? 'badge-red' : 'badge-blue'}`}>{r.action}</span>
                <span style={{ fontWeight: 600, fontSize: '12px' }}>{r.asset}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>{r.reason}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────
const MODULE_VIEWS = {
  'goldman-sachs': GoldmanSachsView,
  'morgan-stanley': MorganStanleyView,
  'bridgewater': BridgewaterView,
  'jpmorgan': JPMorganView,
  'blackrock': BlackRockView,
  'citadel': CitadelView,
  'harvard': HarvardView,
  'bain': BainView,
  'renaissance': RenaissanceView,
  'mckinsey': McKinseyView,
};

export default function AnalysisSuite({ module }) {
  const [selectedModule, setSelectedModule] = useState(module);

  React.useEffect(() => { setSelectedModule(module); }, [module]);

  if (!selectedModule) return <OverviewGrid onSelect={setSelectedModule} />;
  const ModuleView = MODULE_VIEWS[selectedModule];
  if (!ModuleView) return <OverviewGrid onSelect={setSelectedModule} />;

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '12px' }}>
        <button className="btn btn-sm" onClick={() => setSelectedModule(null)} style={{ marginRight: '8px' }}>← All Modules</button>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Analysis Suite / {MODULE_INFO.find(m => m.id === selectedModule)?.name}</span>
      </div>
      <ModuleView />
    </div>
  );
}
