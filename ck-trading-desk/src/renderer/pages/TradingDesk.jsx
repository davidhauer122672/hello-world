import React, { useState, useMemo } from 'react';

// ─── Simulated Data ─────────────────────────────────────────────

const STRATEGIES = [
  { id: 'momentum-alpha', name: 'Momentum Alpha', pnl: 48321.50, winRate: 78.4, tradesToday: 34, sharpe: 2.87, maxDrawdown: -3.2, status: 'ACTIVE' },
  { id: 'mean-reversion', name: 'Mean Reversion', pnl: 21478.00, winRate: 71.2, tradesToday: 28, sharpe: 2.14, maxDrawdown: -4.1, status: 'ACTIVE' },
  { id: 'stat-arb', name: 'Stat Arb', pnl: 15632.20, winRate: 66.8, tradesToday: 52, sharpe: 1.93, maxDrawdown: -2.8, status: 'ACTIVE' },
  { id: 'event-driven', name: 'Event Driven', pnl: -4215.80, winRate: 58.3, tradesToday: 11, sharpe: 1.12, maxDrawdown: -6.7, status: 'ACTIVE' },
  { id: 'dividend-capture', name: 'Dividend Capture', pnl: 8924.00, winRate: 82.1, tradesToday: 8, sharpe: 1.76, maxDrawdown: -1.9, status: 'ACTIVE' },
  { id: 'sector-rotation', name: 'Sector Rotation', pnl: 34116.30, winRate: 74.6, tradesToday: 19, sharpe: 2.53, maxDrawdown: -3.5, status: 'ACTIVE' },
  { id: 'vol-crusher', name: 'Vol Crusher', pnl: 12004.40, winRate: 69.9, tradesToday: 41, sharpe: 2.08, maxDrawdown: -5.3, status: 'ACTIVE' },
];

const OPEN_ORDERS = [
  { id: 'ORD-88412', time: '14:32:01', symbol: 'AAPL', side: 'BUY', type: 'LIMIT', qty: 200, price: 196.50, status: 'WORKING', agent: 'AGT-012' },
  { id: 'ORD-88413', time: '14:31:44', symbol: 'TSLA', side: 'SELL', type: 'STOP', qty: 50, price: 248.00, status: 'PENDING', agent: 'AGT-034' },
  { id: 'ORD-88414', time: '14:31:12', symbol: 'NVDA', side: 'BUY', type: 'LIMIT', qty: 100, price: 885.25, status: 'PARTIAL', agent: 'AGT-007' },
  { id: 'ORD-88415', time: '14:30:55', symbol: 'GOOGL', side: 'BUY', type: 'MARKET', qty: 150, price: null, status: 'WORKING', agent: 'AGT-021' },
  { id: 'ORD-88416', time: '14:30:22', symbol: 'AMZN', side: 'SELL', type: 'LIMIT', qty: 80, price: 189.40, status: 'PENDING', agent: 'AGT-045' },
  { id: 'ORD-88417', time: '14:29:48', symbol: 'JPM', side: 'BUY', type: 'LIMIT', qty: 300, price: 196.80, status: 'WORKING', agent: 'AGT-019' },
  { id: 'ORD-88418', time: '14:29:15', symbol: 'META', side: 'SELL', type: 'STOP', qty: 60, price: 505.00, status: 'PENDING', agent: 'AGT-052' },
  { id: 'ORD-88419', time: '14:28:50', symbol: 'V', side: 'BUY', type: 'LIMIT', qty: 120, price: 282.10, status: 'PARTIAL', agent: 'AGT-038' },
];

const POSITIONS = [
  { symbol: 'AAPL', side: 'LONG', qty: 500, avgEntry: 192.34, current: 198.45, stopLoss: 188.00, takeProfit: 210.00, strategy: 'Momentum Alpha', agent: 'AGT-012' },
  { symbol: 'MSFT', side: 'LONG', qty: 300, avgEntry: 418.50, current: 425.12, stopLoss: 410.00, takeProfit: 445.00, strategy: 'Sector Rotation', agent: 'AGT-021' },
  { symbol: 'NVDA', side: 'LONG', qty: 150, avgEntry: 878.20, current: 892.30, stopLoss: 860.00, takeProfit: 950.00, strategy: 'Momentum Alpha', agent: 'AGT-007' },
  { symbol: 'GOOGL', side: 'LONG', qty: 400, avgEntry: 172.45, current: 175.88, stopLoss: 168.00, takeProfit: 185.00, strategy: 'Mean Reversion', agent: 'AGT-034' },
  { symbol: 'TSLA', side: 'SHORT', qty: 200, avgEntry: 258.90, current: 252.15, stopLoss: 270.00, takeProfit: 235.00, strategy: 'Stat Arb', agent: 'AGT-045' },
  { symbol: 'AMZN', side: 'LONG', qty: 250, avgEntry: 184.20, current: 186.75, stopLoss: 180.00, takeProfit: 195.00, strategy: 'Event Driven', agent: 'AGT-019' },
  { symbol: 'META', side: 'LONG', qty: 180, avgEntry: 505.60, current: 512.44, stopLoss: 495.00, takeProfit: 535.00, strategy: 'Momentum Alpha', agent: 'AGT-052' },
  { symbol: 'JPM', side: 'LONG', qty: 600, avgEntry: 195.80, current: 198.32, stopLoss: 190.00, takeProfit: 210.00, strategy: 'Dividend Capture', agent: 'AGT-038' },
  { symbol: 'V', side: 'SHORT', qty: 100, avgEntry: 280.10, current: 284.56, stopLoss: 290.00, takeProfit: 265.00, strategy: 'Mean Reversion', agent: 'AGT-061' },
  { symbol: 'XOM', side: 'LONG', qty: 350, avgEntry: 108.45, current: 105.20, stopLoss: 102.00, takeProfit: 118.00, strategy: 'Sector Rotation', agent: 'AGT-073' },
  { symbol: 'UNH', side: 'LONG', qty: 80, avgEntry: 532.10, current: 541.88, stopLoss: 520.00, takeProfit: 560.00, strategy: 'Vol Crusher', agent: 'AGT-028' },
  { symbol: 'HD', side: 'SHORT', qty: 150, avgEntry: 362.75, current: 358.40, stopLoss: 375.00, takeProfit: 340.00, strategy: 'Stat Arb', agent: 'AGT-014' },
];

const LEVEL2_BIDS = [
  { price: 198.42, size: 1200 },
  { price: 198.40, size: 3400 },
  { price: 198.38, size: 800 },
  { price: 198.35, size: 5600 },
  { price: 198.30, size: 2100 },
];

const LEVEL2_ASKS = [
  { price: 198.45, size: 900 },
  { price: 198.48, size: 2800 },
  { price: 198.50, size: 4200 },
  { price: 198.53, size: 1500 },
  { price: 198.58, size: 3700 },
];

const SECTOR_EXPOSURE = [
  { name: 'Technology', pct: 38.2, color: 'var(--blue)' },
  { name: 'Financials', pct: 18.5, color: 'var(--gold)' },
  { name: 'Healthcare', pct: 12.8, color: 'var(--green)' },
  { name: 'Energy', pct: 8.4, color: 'var(--yellow)' },
  { name: 'Consumer Disc', pct: 7.9, color: 'var(--purple)' },
  { name: 'Industrials', pct: 6.1, color: 'var(--cyan)' },
  { name: 'Other', pct: 8.1, color: 'var(--text-muted)' },
];

// ─── Helpers ────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
const fmtPct = (n) => `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
const fmtPnl = (n) => `${n >= 0 ? '+' : ''}${fmt(n)}`;

function computePosition(p) {
  const multiplier = p.side === 'SHORT' ? -1 : 1;
  const unrealizedPnl = (p.current - p.avgEntry) * p.qty * multiplier;
  const pctChange = ((p.current - p.avgEntry) / p.avgEntry) * 100 * multiplier;
  return { ...p, unrealizedPnl, pctChange };
}

// ─── Order Entry Panel ──────────────────────────────────────────

function OrderEntryPanel() {
  const [symbol, setSymbol] = useState('AAPL');
  const [side, setSide] = useState('BUY');
  const [orderType, setOrderType] = useState('LIMIT');
  const [qty, setQty] = useState('100');
  const [price, setPrice] = useState('198.45');
  const [tif, setTif] = useState('DAY');
  const [strategy, setStrategy] = useState('momentum-alpha');

  const showPrice = orderType === 'LIMIT' || orderType === 'STOP';

  return (
    <div className="card" style={{ marginBottom: 'var(--gap-md)' }}>
      <div className="card-header">
        <span className="card-title">Order Entry</span>
        <span className="badge badge-green">READY</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-sm)' }}>
        {/* Symbol */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            style={inputStyle}
            placeholder="AAPL"
          />
        </div>

        {/* Side Buttons */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Side</label>
          <div style={{ display: 'flex', gap: 'var(--gap-xs)' }}>
            <button
              className={side === 'BUY' ? 'btn btn-primary' : 'btn'}
              style={{ flex: 1 }}
              onClick={() => setSide('BUY')}
            >
              BUY
            </button>
            <button
              className={side === 'SELL' ? 'btn btn-danger' : 'btn'}
              style={{ flex: 1 }}
              onClick={() => setSide('SELL')}
            >
              SELL
            </button>
          </div>
        </div>

        {/* Order Type */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Order Type</label>
          <div style={{ display: 'flex', gap: 'var(--gap-xs)' }}>
            {['MARKET', 'LIMIT', 'STOP'].map((t) => (
              <button
                key={t}
                className={orderType === t ? 'btn btn-gold' : 'btn'}
                style={{ flex: 1, fontSize: '10px' }}
                onClick={() => setOrderType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div>
          <label style={labelStyle}>Quantity</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            style={inputStyle}
            min="1"
          />
        </div>

        {/* Price */}
        <div>
          <label style={labelStyle}>Price {!showPrice && '(N/A)'}</label>
          <input
            type="number"
            value={showPrice ? price : ''}
            onChange={(e) => setPrice(e.target.value)}
            style={{ ...inputStyle, opacity: showPrice ? 1 : 0.3 }}
            disabled={!showPrice}
            step="0.01"
          />
        </div>

        {/* Time in Force */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Time in Force</label>
          <div style={{ display: 'flex', gap: 'var(--gap-xs)' }}>
            {['DAY', 'GTC', 'IOC', 'FOK'].map((t) => (
              <button
                key={t}
                className={tif === t ? 'btn btn-gold' : 'btn'}
                style={{ flex: 1, fontSize: '10px' }}
                onClick={() => setTif(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Strategy */}
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>Strategy Assignment</label>
          <select
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            style={inputStyle}
          >
            {STRATEGIES.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Risk Check */}
        <div style={{ gridColumn: 'span 2', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', padding: 'var(--gap-sm)' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Risk Check</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Position Limit</span>
            <span style={{ color: 'var(--green)' }}>47 / 60</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Buying Power</span>
            <span style={{ color: 'var(--green)' }}>{fmt(412850.44)}</span>
          </div>
        </div>

        {/* Submit */}
        <div style={{ gridColumn: 'span 2', marginTop: 'var(--gap-sm)' }}>
          <button
            className={side === 'BUY' ? 'btn btn-primary' : 'btn btn-danger'}
            style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 800 }}
          >
            {side === 'BUY' ? 'SUBMIT BUY ORDER' : 'SUBMIT SELL ORDER'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Open Orders Table ──────────────────────────────────────────

function OpenOrdersTable() {
  const statusBadge = (status) => {
    const map = { PENDING: 'badge-blue', PARTIAL: 'badge-gold', WORKING: 'badge-green' };
    return <span className={`badge ${map[status] || 'badge-blue'}`}>{status}</span>;
  };

  return (
    <div className="card" style={{ marginBottom: 'var(--gap-md)' }}>
      <div className="card-header">
        <span className="card-title">Open Orders</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{OPEN_ORDERS.length} ACTIVE</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Time</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Type</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Status</th>
              <th>Agent</th>
            </tr>
          </thead>
          <tbody>
            {OPEN_ORDERS.map((o) => (
              <tr key={o.id}>
                <td style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{o.id}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{o.time}</td>
                <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{o.symbol}</td>
                <td style={{ color: o.side === 'BUY' ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>{o.side}</td>
                <td>{o.type}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{o.qty.toLocaleString()}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{o.price ? `$${o.price.toFixed(2)}` : 'MKT'}</td>
                <td>{statusBadge(o.status)}</td>
                <td style={{ color: 'var(--cyan)', fontSize: '10px' }}>{o.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Position Book ──────────────────────────────────────────────

function PositionBook() {
  const [sortCol, setSortCol] = useState('unrealizedPnl');
  const [sortDir, setSortDir] = useState('desc');

  const positions = useMemo(() => {
    const computed = POSITIONS.map(computePosition);
    return computed.sort((a, b) => {
      const valA = a[sortCol];
      const valB = b[sortCol];
      if (typeof valA === 'string') return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  }, [sortCol, sortDir]);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const sortIcon = (col) => {
    if (sortCol !== col) return ' \u2195';
    return sortDir === 'asc' ? ' \u2191' : ' \u2193';
  };

  const thStyle = { cursor: 'pointer', userSelect: 'none' };

  return (
    <div className="card" style={{ marginBottom: 'var(--gap-md)' }}>
      <div className="card-header">
        <span className="card-title">Position Book</span>
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{positions.length} ACTIVE</span>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={thStyle} onClick={() => handleSort('symbol')}>Symbol{sortIcon('symbol')}</th>
              <th style={thStyle} onClick={() => handleSort('side')}>Side{sortIcon('side')}</th>
              <th style={thStyle} onClick={() => handleSort('qty')}>Qty{sortIcon('qty')}</th>
              <th style={thStyle} onClick={() => handleSort('avgEntry')}>Avg Entry{sortIcon('avgEntry')}</th>
              <th style={thStyle} onClick={() => handleSort('current')}>Current{sortIcon('current')}</th>
              <th style={thStyle} onClick={() => handleSort('unrealizedPnl')}>Unrealized P&L{sortIcon('unrealizedPnl')}</th>
              <th style={thStyle} onClick={() => handleSort('pctChange')}>% Change{sortIcon('pctChange')}</th>
              <th>Stop Loss</th>
              <th>Take Profit</th>
              <th style={thStyle} onClick={() => handleSort('strategy')}>Strategy{sortIcon('strategy')}</th>
              <th>Agent</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.symbol}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.symbol}</td>
                <td style={{ color: p.side === 'LONG' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{p.side}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{p.qty.toLocaleString()}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(p.avgEntry)}</td>
                <td style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(p.current)}</td>
                <td style={{ color: p.unrealizedPnl >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtPnl(p.unrealizedPnl)}
                </td>
                <td style={{ color: p.pctChange >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                  {fmtPct(p.pctChange)}
                </td>
                <td style={{ color: 'var(--red-dim)', fontVariantNumeric: 'tabular-nums' }}>{fmt(p.stopLoss)}</td>
                <td style={{ color: 'var(--green-dim)', fontVariantNumeric: 'tabular-nums' }}>{fmt(p.takeProfit)}</td>
                <td style={{ fontSize: '10px' }}>{p.strategy}</td>
                <td style={{ color: 'var(--cyan)', fontSize: '10px' }}>{p.agent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Strategy Monitor ───────────────────────────────────────────

function StrategyMonitor() {
  return (
    <div className="card" style={{ marginBottom: 'var(--gap-md)' }}>
      <div className="card-header">
        <span className="card-title">Strategy Monitor</span>
        <span className="badge badge-green">{STRATEGIES.length} ACTIVE</span>
      </div>
      <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
        {STRATEGIES.map((s) => (
          <div key={s.id} style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--gap-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--gap-sm)' }}>
              <span className="status-dot active" />
              <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{s.name}</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: s.pnl >= 0 ? 'var(--green)' : 'var(--red)', marginBottom: 'var(--gap-sm)' }}>
              {fmtPnl(s.pnl)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '10px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Win Rate</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px' }}>{s.winRate}%</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trades</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '12px' }}>{s.tradesToday}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sharpe</span>
                <div style={{ color: 'var(--cyan)', fontWeight: 600, fontSize: '12px' }}>{s.sharpe.toFixed(2)}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Max DD</span>
                <div style={{ color: 'var(--red)', fontWeight: 600, fontSize: '12px' }}>{s.maxDrawdown.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Risk Dashboard ─────────────────────────────────────────────

function RiskDashboard() {
  return (
    <div className="card" style={{ marginBottom: 'var(--gap-md)' }}>
      <div className="card-header">
        <span className="card-title">Risk Dashboard</span>
        <span className="badge badge-blue">MONITORING</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
        {/* Risk Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
          <div className="metric">
            <span className="metric-label">VaR (95%)</span>
            <span className="metric-value negative" style={{ fontSize: '16px' }}>-{fmt(34218)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">VaR (99%)</span>
            <span className="metric-value negative" style={{ fontSize: '16px' }}>-{fmt(52847)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Current Drawdown</span>
            <span className="metric-value negative" style={{ fontSize: '16px' }}>-1.84%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Gross Exposure</span>
            <span className="metric-value" style={{ fontSize: '16px' }}>{fmt(2847563)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Net Exposure</span>
            <span className="metric-value" style={{ fontSize: '16px' }}>{fmt(2142870)}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Beta to SPY</span>
            <span className="metric-value" style={{ fontSize: '16px', color: 'var(--cyan)' }}>0.87</span>
          </div>
        </div>

        {/* Sector Concentration Heatmap */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 'var(--gap-sm)' }}>
            Sector Concentration
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {SECTOR_EXPOSURE.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                <span style={{ minWidth: '90px', color: 'var(--text-secondary)' }}>{s.name}</span>
                <div style={{ flex: 1, height: '14px', background: 'var(--bg-primary)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${s.pct}%`,
                    height: '100%',
                    background: s.color,
                    opacity: 0.7,
                    borderRadius: '2px',
                  }} />
                </div>
                <span style={{ minWidth: '40px', textAlign: 'right', fontWeight: 600, color: s.color, fontVariantNumeric: 'tabular-nums' }}>
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Market Depth / Level 2 ─────────────────────────────────────

function MarketDepth() {
  const maxSize = Math.max(
    ...LEVEL2_BIDS.map((b) => b.size),
    ...LEVEL2_ASKS.map((a) => a.size),
  );

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Market Depth / Level 2</span>
        <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 700 }}>AAPL</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--gap-md)' }}>
        {/* Bids */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600 }}>
            Bids
          </div>
          {LEVEL2_BIDS.map((b, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 8px', marginBottom: '2px', fontSize: '11px' }}>
              <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: `${(b.size / maxSize) * 100}%`,
                background: 'var(--green-bg)',
                borderRadius: '2px',
              }} />
              <span style={{ position: 'relative', fontWeight: 600, color: 'var(--green)', fontVariantNumeric: 'tabular-nums' }}>
                ${b.price.toFixed(2)}
              </span>
              <span style={{ position: 'relative', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {b.size.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Asks */}
        <div>
          <div style={{ fontSize: '10px', color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 600 }}>
            Asks
          </div>
          {LEVEL2_ASKS.map((a, i) => (
            <div key={i} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '4px 8px', marginBottom: '2px', fontSize: '11px' }}>
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: `${(a.size / maxSize) * 100}%`,
                background: 'var(--red-bg)',
                borderRadius: '2px',
              }} />
              <span style={{ position: 'relative', fontWeight: 600, color: 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                ${a.price.toFixed(2)}
              </span>
              <span style={{ position: 'relative', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {a.size.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Spread */}
      <div style={{
        marginTop: 'var(--gap-sm)',
        padding: 'var(--gap-sm)',
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--gap-lg)',
        fontSize: '11px',
      }}>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>Spread: </span>
          <span style={{ color: 'var(--yellow)', fontWeight: 600 }}>
            ${(LEVEL2_ASKS[0].price - LEVEL2_BIDS[0].price).toFixed(2)}
          </span>
        </span>
        <span>
          <span style={{ color: 'var(--text-muted)' }}>Mid: </span>
          <span style={{ fontWeight: 600 }}>
            ${((LEVEL2_ASKS[0].price + LEVEL2_BIDS[0].price) / 2).toFixed(3)}
          </span>
        </span>
      </div>
    </div>
  );
}

// ─── Shared Styles ──────────────────────────────────────────────

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: 'var(--text-muted)',
  marginBottom: '4px',
};

const inputStyle = {
  width: '100%',
  padding: '8px 10px',
  background: 'var(--bg-primary)',
  border: '1px solid var(--border-default)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '12px',
  outline: 'none',
};

// ─── Main Component ─────────────────────────────────────────────

export default function TradingDesk({ metrics }) {
  return (
    <div className="fade-in" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'var(--gap-md)' }}>
      {/* Left Column: Order Entry + Level 2 */}
      <div>
        <OrderEntryPanel />
        <MarketDepth />
      </div>

      {/* Right Column: Main Content */}
      <div>
        <OpenOrdersTable />
        <PositionBook />
        <StrategyMonitor />
        <RiskDashboard />
      </div>
    </div>
  );
}
