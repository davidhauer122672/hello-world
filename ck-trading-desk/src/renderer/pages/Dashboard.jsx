import React, { useState, useMemo } from 'react';

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const pct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
const fmtNum = (n) => new Intl.NumberFormat('en-US').format(n);

// ---------- Static Data ----------

const DIVISIONS = [
  { name: 'Investment Banking', revenue: 48750000, pnl: 12340000, trades: 1847, winRate: 73.2 },
  { name: 'Sales & Trading', revenue: 62100000, pnl: 18920000, trades: 14203, winRate: 68.7 },
  { name: 'Asset Management', revenue: 31450000, pnl: 8760000, trades: 892, winRate: 81.4 },
  { name: 'Quantitative Strategies', revenue: 27800000, pnl: 15430000, trades: 38412, winRate: 64.1 },
  { name: 'Risk Analytics', revenue: 14200000, pnl: 5670000, trades: 2105, winRate: 76.9 },
  { name: 'Technology', revenue: 9850000, pnl: 3210000, trades: 0, winRate: 0 },
];

const POSITIONS = [
  { symbol: 'AAPL', side: 'LONG', qty: 15000, entry: 189.42, current: 197.83, agent: 'TD-SA-001' },
  { symbol: 'MSFT', side: 'LONG', qty: 12000, entry: 374.50, current: 401.22, agent: 'TD-MD-002' },
  { symbol: 'NVDA', side: 'LONG', qty: 8500, entry: 721.30, current: 876.45, agent: 'TD-VP-003' },
  { symbol: 'GOOGL', side: 'LONG', qty: 9200, entry: 141.80, current: 157.62, agent: 'TD-SA-004' },
  { symbol: 'AMZN', side: 'LONG', qty: 11000, entry: 178.25, current: 192.10, agent: 'TD-ED-001' },
  { symbol: 'META', side: 'LONG', qty: 7800, entry: 484.00, current: 521.37, agent: 'TD-VP-005' },
  { symbol: 'JPM', side: 'LONG', qty: 18000, entry: 196.40, current: 207.85, agent: 'TD-MD-001' },
  { symbol: 'GS', side: 'LONG', qty: 5500, entry: 452.70, current: 478.90, agent: 'TD-PT-001' },
  { symbol: 'V', side: 'LONG', qty: 10500, entry: 275.30, current: 289.14, agent: 'TD-SA-007' },
  { symbol: 'MA', side: 'LONG', qty: 8200, entry: 458.60, current: 471.25, agent: 'TD-SA-008' },
  { symbol: 'TSLA', side: 'SHORT', qty: 4200, entry: 248.90, current: 231.47, agent: 'TD-VP-002' },
  { symbol: 'BRK.B', side: 'LONG', qty: 6800, entry: 412.50, current: 428.70, agent: 'TD-MD-004' },
  { symbol: 'UNH', side: 'LONG', qty: 3500, entry: 527.80, current: 548.92, agent: 'TD-ED-003' },
  { symbol: 'XOM', side: 'SHORT', qty: 7000, entry: 118.40, current: 112.65, agent: 'TD-SA-012' },
  { symbol: 'LLY', side: 'LONG', qty: 2800, entry: 742.10, current: 801.35, agent: 'TD-MD-006' },
];

const ENGINES = [
  { name: 'Goldman Sachs Screener', code: 'GS-SCR', lastScan: '14:32:07', signals: 247, accuracy: 87.3 },
  { name: 'Morgan Stanley DCF', code: 'MS-DCF', lastScan: '14:31:52', signals: 183, accuracy: 91.2 },
  { name: 'Bridgewater Risk', code: 'BW-RSK', lastScan: '14:32:01', signals: 412, accuracy: 84.7 },
  { name: 'JPMorgan Earnings', code: 'JPM-ERN', lastScan: '14:30:45', signals: 156, accuracy: 89.1 },
  { name: 'BlackRock Portfolio', code: 'BLK-PRT', lastScan: '14:31:38', signals: 298, accuracy: 86.4 },
  { name: 'Citadel Technical', code: 'CTD-TEC', lastScan: '14:32:11', signals: 534, accuracy: 72.8 },
  { name: 'Harvard Dividend', code: 'HVD-DIV', lastScan: '14:29:55', signals: 89, accuracy: 93.6 },
  { name: 'Bain Competitive', code: 'BN-CMP', lastScan: '14:31:22', signals: 127, accuracy: 88.0 },
  { name: 'Renaissance Patterns', code: 'REN-PAT', lastScan: '14:32:09', signals: 671, accuracy: 76.2 },
  { name: 'McKinsey Macro', code: 'MCK-MAC', lastScan: '14:30:18', signals: 204, accuracy: 85.9 },
];

const AGENT_TIERS = [
  { tier: 'C-Suite', count: 7 },
  { tier: 'Managing Directors', count: 6 },
  { tier: 'Partners', count: 2 },
  { tier: 'Executive Directors', count: 4 },
  { tier: 'Vice Presidents', count: 6 },
  { tier: 'Senior Associates', count: 6 },
  { tier: 'Associates', count: 10 },
  { tier: 'Senior Analysts', count: 20 },
  { tier: 'Analysts', count: 20 },
  { tier: 'Specialists', count: 16 },
];

// Generate equity curve sample data (252 trading days)
function generateEquityCurve() {
  const points = [];
  let value = 100000000; // $100M starting NAV
  for (let i = 0; i < 252; i++) {
    const dailyReturn = (Math.random() - 0.42) * 0.015; // slight upward bias
    value *= (1 + dailyReturn);
    points.push({ day: i, value });
  }
  return points;
}

// ---------- Sub-components ----------

function KPICard({ label, value, subtext, positive }) {
  const colorClass = positive === undefined ? '' : positive ? 'metric-positive' : 'metric-negative';
  return (
    <div className="card kpi-card">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${colorClass}`}>{value}</div>
      {subtext && <div className="kpi-subtext">{subtext}</div>}
    </div>
  );
}

function EquityCurveChart({ data }) {
  const width = 800;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 80 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values) * 0.98;
  const maxVal = Math.max(...values) * 1.02;

  const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartW;
  const scaleY = (v) => padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

  const polylinePoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.value)}`).join(' ');

  const startVal = data[0].value;
  const endVal = data[data.length - 1].value;
  const curveColor = endVal >= startVal ? '#00c853' : '#ff1744';

  // Y-axis labels
  const yTicks = 5;
  const yLabels = [];
  for (let i = 0; i <= yTicks; i++) {
    const val = minVal + ((maxVal - minVal) / yTicks) * i;
    yLabels.push({ val, y: scaleY(val) });
  }

  return (
    <div className="card">
      <div className="card-header">Portfolio Equity Curve (YTD)</div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        {/* Grid lines */}
        {yLabels.map((tick, i) => (
          <g key={i}>
            <line
              x1={padding.left} y1={tick.y}
              x2={width - padding.right} y2={tick.y}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1"
            />
            <text
              x={padding.left - 8} y={tick.y + 4}
              textAnchor="end" fill="rgba(255,255,255,0.5)" fontSize="10"
            >
              {fmt(tick.val / 1000000).replace('.00', '') + 'M'}
            </text>
          </g>
        ))}

        {/* Area fill */}
        <polygon
          points={`${scaleX(0)},${scaleY(minVal)} ${polylinePoints} ${scaleX(data.length - 1)},${scaleY(minVal)}`}
          fill={curveColor} fillOpacity="0.08"
        />

        {/* Line */}
        <polyline
          points={polylinePoints}
          fill="none" stroke={curveColor} strokeWidth="2"
        />

        {/* Current value dot */}
        <circle
          cx={scaleX(data.length - 1)}
          cy={scaleY(endVal)}
          r="4" fill={curveColor}
        />
      </svg>
    </div>
  );
}

function DivisionTable() {
  const totalRevenue = DIVISIONS.reduce((s, d) => s + d.revenue, 0);
  const totalPnl = DIVISIONS.reduce((s, d) => s + d.pnl, 0);
  const totalTrades = DIVISIONS.reduce((s, d) => s + d.trades, 0);

  return (
    <div className="card">
      <div className="card-header">Division P&L Breakdown</div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Division</th>
            <th style={{ textAlign: 'right' }}>Revenue</th>
            <th style={{ textAlign: 'right' }}>P&L</th>
            <th style={{ textAlign: 'right' }}>Trades</th>
            <th style={{ textAlign: 'right' }}>Win Rate</th>
          </tr>
        </thead>
        <tbody>
          {DIVISIONS.map((div) => (
            <tr key={div.name}>
              <td>{div.name}</td>
              <td style={{ textAlign: 'right' }}>{fmt(div.revenue)}</td>
              <td style={{ textAlign: 'right' }} className={div.pnl >= 0 ? 'metric-positive' : 'metric-negative'}>
                {fmt(div.pnl)}
              </td>
              <td style={{ textAlign: 'right' }}>{fmtNum(div.trades)}</td>
              <td style={{ textAlign: 'right' }}>
                {div.winRate > 0 ? <span className="badge-green">{div.winRate}%</span> : <span className="badge-muted">N/A</span>}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="total-row">
            <td><strong>TOTAL</strong></td>
            <td style={{ textAlign: 'right' }}><strong>{fmt(totalRevenue)}</strong></td>
            <td style={{ textAlign: 'right' }} className={totalPnl >= 0 ? 'metric-positive' : 'metric-negative'}>
              <strong>{fmt(totalPnl)}</strong>
            </td>
            <td style={{ textAlign: 'right' }}><strong>{fmtNum(totalTrades)}</strong></td>
            <td style={{ textAlign: 'right' }}><strong>--</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function PositionsTable() {
  const enriched = POSITIONS.map((pos) => {
    const pnlPerShare = pos.side === 'LONG'
      ? pos.current - pos.entry
      : pos.entry - pos.current;
    const totalPnl = pnlPerShare * pos.qty;
    const pctChange = (pnlPerShare / pos.entry) * 100;
    return { ...pos, pnl: totalPnl, pctChange };
  });

  return (
    <div className="card">
      <div className="card-header">Active Positions ({POSITIONS.length})</div>
      <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Side</th>
              <th style={{ textAlign: 'right' }}>Qty</th>
              <th style={{ textAlign: 'right' }}>Entry</th>
              <th style={{ textAlign: 'right' }}>Current</th>
              <th style={{ textAlign: 'right' }}>P&L</th>
              <th style={{ textAlign: 'right' }}>% Chg</th>
              <th>Agent</th>
            </tr>
          </thead>
          <tbody>
            {enriched.map((pos) => (
              <tr key={pos.symbol}>
                <td><strong>{pos.symbol}</strong></td>
                <td>
                  <span className={pos.side === 'LONG' ? 'badge-green' : 'badge-red'}>
                    {pos.side}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>{fmtNum(pos.qty)}</td>
                <td style={{ textAlign: 'right' }}>{fmt(pos.entry)}</td>
                <td style={{ textAlign: 'right' }}>{fmt(pos.current)}</td>
                <td style={{ textAlign: 'right' }} className={pos.pnl >= 0 ? 'metric-positive' : 'metric-negative'}>
                  {fmt(pos.pnl)}
                </td>
                <td style={{ textAlign: 'right' }} className={pos.pctChange >= 0 ? 'metric-positive' : 'metric-negative'}>
                  {pct(pos.pctChange)}
                </td>
                <td className="monospace">{pos.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EngineStatusGrid() {
  return (
    <div className="card">
      <div className="card-header">Financial Engine Status</div>
      <div className="grid-5">
        {ENGINES.map((engine) => (
          <div className="card engine-card" key={engine.code}>
            <div className="engine-header">
              <span className="engine-name">{engine.name}</span>
              <span className="badge-green">ACTIVE</span>
            </div>
            <div className="engine-meta">
              <div className="engine-stat">
                <span className="engine-stat-label">Last Scan</span>
                <span className="monospace">{engine.lastScan}</span>
              </div>
              <div className="engine-stat">
                <span className="engine-stat-label">Signals</span>
                <span>{fmtNum(engine.signals)}</span>
              </div>
              <div className="engine-stat">
                <span className="engine-stat-label">Accuracy</span>
                <span className={engine.accuracy >= 85 ? 'metric-positive' : 'metric-warn'}>
                  {engine.accuracy}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentFleetSummary() {
  const totalAgents = AGENT_TIERS.reduce((s, t) => s + t.count, 0);

  return (
    <div className="card">
      <div className="card-header">
        Agent Fleet Summary
        <span className="badge-green" style={{ marginLeft: '12px' }}>
          {totalAgents} AGENTS ACTIVE
        </span>
      </div>
      <div className="grid-5">
        {AGENT_TIERS.map((t) => (
          <div className="card tier-card" key={t.tier}>
            <div className="tier-name">{t.tier}</div>
            <div className="tier-count">{t.count}</div>
            <span className="badge-green">ACTIVE</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CashFlowGenerator() {
  const dividendAnnual = 4280000;
  const optionsPremiumAnnual = 7650000;
  const totalAnnual = dividendAnnual + optionsPremiumAnnual;
  const monthly = totalAnnual / 12;
  const daily = totalAnnual / 252; // trading days

  return (
    <div className="card">
      <div className="card-header">Cash Flow Generator Status</div>
      <div className="grid-3">
        <div className="card cashflow-card">
          <div className="cashflow-label">Dividend Income (Projected Annual)</div>
          <div className="cashflow-value metric-positive">{fmt(dividendAnnual)}</div>
          <div className="cashflow-sub">{fmt(dividendAnnual / 12)}/mo</div>
        </div>
        <div className="card cashflow-card">
          <div className="cashflow-label">Options Premium Income (Annual)</div>
          <div className="cashflow-value metric-positive">{fmt(optionsPremiumAnnual)}</div>
          <div className="cashflow-sub">{fmt(optionsPremiumAnnual / 12)}/mo</div>
        </div>
        <div className="card cashflow-card">
          <div className="cashflow-label">Total Passive Income</div>
          <div className="cashflow-value metric-positive">{fmt(totalAnnual)}</div>
          <div className="cashflow-breakdown">
            <span>{fmt(monthly)}/mo</span>
            <span className="separator">|</span>
            <span>{fmt(daily)}/day</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Main Dashboard ----------

function Dashboard({ metrics = {} }) {
  const equityCurveData = useMemo(() => generateEquityCurve(), []);

  const totalPnl = metrics.totalPnl ?? 64330000;
  const portfolioNav = metrics.portfolioNav ?? 247850000;
  const dailyPnl = metrics.dailyPnl ?? 1842000;
  const dailyPnlPct = metrics.dailyPnlPct ?? 0.74;
  const monthlyCashFlow = metrics.monthlyCashFlow ?? 993750;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">CK TRADING DESK</h1>
        <div className="dashboard-subtitle">Coastal Key Enterprise | Real-Time Portfolio Command</div>
      </div>

      {/* KPI Row */}
      <div className="grid-4">
        <KPICard
          label="Total P&L (YTD)"
          value={fmt(totalPnl)}
          subtext="Unrealized + Realized"
          positive={totalPnl >= 0}
        />
        <KPICard
          label="Portfolio NAV"
          value={fmt(portfolioNav)}
          subtext="Net Asset Value"
        />
        <KPICard
          label="Daily P&L"
          value={fmt(dailyPnl)}
          subtext={pct(dailyPnlPct)}
          positive={dailyPnl >= 0}
        />
        <KPICard
          label="Monthly Cash Flow"
          value={fmt(monthlyCashFlow)}
          subtext="Generated this month"
          positive={monthlyCashFlow >= 0}
        />
      </div>

      {/* Equity Curve */}
      <EquityCurveChart data={equityCurveData} />

      {/* Division P&L */}
      <DivisionTable />

      {/* Active Positions */}
      <PositionsTable />

      {/* Engine Status */}
      <EngineStatusGrid />

      {/* Agent Fleet */}
      <AgentFleetSummary />

      {/* Cash Flow Generator */}
      <CashFlowGenerator />
    </div>
  );
}

export default Dashboard;
