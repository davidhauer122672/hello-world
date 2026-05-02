import React from 'react';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const usdShort = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });

const MONTHLY_INCOME = 18432;
const ANNUAL_INCOME = 221184;
const DAILY_AVG = 605;
const YIELD_ON_COST = 8.2;

const TOP_DIVIDEND_STOCKS = [
  { ticker: 'KO', monthly: 156 },
  { ticker: 'VZ', monthly: 134 },
  { ticker: 'T', monthly: 128 },
  { ticker: 'O', monthly: 189 },
  { ticker: 'SCHD', monthly: 245 },
];

const COVERED_CALL_TICKERS = ['AAPL', 'MSFT', 'NVDA', 'META', 'GOOGL'];

const MONTHLY_PROJECTIONS = (() => {
  const months = [
    'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026',
    'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026',
    'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027',
  ];
  const divAmounts = [8432, 8650, 9100, 8800, 8550, 9200, 8900, 8700, 10200, 8400, 8300, 9500];
  const optAmounts = [6200, 5800, 6400, 6100, 5900, 6500, 6300, 5700, 6800, 6000, 5600, 6600];
  const bondAmount = 3800;
  let cumulative = 0;

  return months.map((month, i) => {
    const dividends = divAmounts[i];
    const options = optAmounts[i];
    const fixedIncome = bondAmount;
    const total = dividends + options + fixedIncome;
    cumulative += total;
    return { month, dividends, options, fixedIncome, total, cumulative };
  });
})();

const DRIP_TABLE = (() => {
  const rows = [];
  let balance = 2800000;
  const yieldRate = 0.08;

  for (let year = 1; year <= 10; year++) {
    const startingBalance = balance;
    const annualIncome = balance * yieldRate;
    const reinvested = annualIncome;
    const endingBalance = startingBalance + reinvested;
    balance = endingBalance;
    rows.push({ year, startingBalance, annualIncome, reinvested, endingBalance });
  }
  return rows;
})();

const DIVIDEND_HOLDINGS = [
  { ticker: 'KO', yieldPct: 3.12, annDivShare: 1.94, shares: 500, annualIncome: 970, safety: 9, exDate: '2026-06-13' },
  { ticker: 'VZ', yieldPct: 6.48, annDivShare: 2.73, shares: 800, annualIncome: 2184, safety: 7, exDate: '2026-04-09' },
  { ticker: 'O', yieldPct: 5.42, annDivShare: 3.08, shares: 600, annualIncome: 1848, safety: 8, exDate: '2026-04-28' },
  { ticker: 'SCHD', yieldPct: 3.58, annDivShare: 2.81, shares: 1000, annualIncome: 2810, safety: 9, exDate: '2026-06-18' },
  { ticker: 'JPM', yieldPct: 2.42, annDivShare: 4.80, shares: 600, annualIncome: 2880, safety: 8, exDate: '2026-04-07' },
  { ticker: 'JNJ', yieldPct: 3.19, annDivShare: 5.00, shares: 400, annualIncome: 2000, safety: 9, exDate: '2026-05-20' },
  { ticker: 'PG', yieldPct: 2.47, annDivShare: 4.16, shares: 350, annualIncome: 1456, safety: 9, exDate: '2026-04-17' },
  { ticker: 'BND', yieldPct: 4.34, annDivShare: 3.16, shares: 800, annualIncome: 2528, safety: 10, exDate: '2026-05-01' },
  { ticker: 'VTI', yieldPct: 1.42, annDivShare: 3.72, shares: 500, annualIncome: 1860, safety: 10, exDate: '2026-06-23' },
  { ticker: 'UNH', yieldPct: 1.38, annDivShare: 7.52, shares: 100, annualIncome: 752, safety: 8, exDate: '2026-06-10' },
];

const COVERED_CALLS = [
  { symbol: 'AAPL', strike: 210, expiry: '2026-04-18', premium: 1420, maxProfit: 7195 },
  { symbol: 'MSFT', strike: 450, expiry: '2026-04-18', premium: 1860, maxProfit: 9324 },
  { symbol: 'NVDA', strike: 950, expiry: '2026-05-16', premium: 3200, maxProfit: 14740 },
  { symbol: 'META', strike: 540, expiry: '2026-04-18', premium: 2100, maxProfit: 8990 },
  { symbol: 'GOOGL', strike: 185, expiry: '2026-05-16', premium: 980, maxProfit: 4632 },
];

export default function CashFlow({ metrics }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Metrics */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">CK Passive Income Engine</span>
          <span className="badge-green">GENERATING</span>
        </div>
        <div className="grid-4">
          <div className="metric">
            <span className="metric-label">Monthly Income</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '22px' }}>
              {usd.format(MONTHLY_INCOME)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Annual Income</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '22px' }}>
              {usd.format(ANNUAL_INCOME)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Daily Average</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '22px' }}>
              {usd.format(DAILY_AVG)}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Yield on Cost</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '22px' }}>
              {YIELD_ON_COST}%
            </span>
          </div>
        </div>
      </div>

      {/* Income Sources */}
      <div className="grid-3">
        {/* Dividends Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Dividends</span>
          </div>
          <div className="metric" style={{ marginBottom: '12px' }}>
            <span className="metric-label">Monthly from 15 stocks</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '20px' }}>
              {usd.format(8432)}
            </span>
          </div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Top 5 Contributors:</div>
            {TOP_DIVIDEND_STOCKS.map(s => (
              <div key={s.ticker} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                <span style={{ fontWeight: 600 }}>{s.ticker}</span>
                <span className="pnl-positive">{usd.format(s.monthly)}/mo</span>
              </div>
            ))}
          </div>
        </div>

        {/* Options Premium Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Options Premium</span>
          </div>
          <div className="metric" style={{ marginBottom: '12px' }}>
            <span className="metric-label">Monthly covered calls</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '20px' }}>
              {usd.format(6200)}
            </span>
          </div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Covered Calls On:</div>
            {COVERED_CALL_TICKERS.map(t => (
              <div key={t} style={{ padding: '3px 0' }}>
                <span style={{ fontWeight: 600 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Income Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Fixed Income</span>
          </div>
          <div className="metric" style={{ marginBottom: '12px' }}>
            <span className="metric-label">BND position + Treasury holdings</span>
            <span className="metric-value pnl-positive" style={{ fontSize: '20px' }}>
              {usd.format(3800)}
            </span>
          </div>
          <div style={{ fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>BND (800 shares)</span>
              <span className="pnl-positive">{usd.format(2528)}/yr</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
              <span>Treasury Holdings</span>
              <span className="pnl-positive">{usd.format(1272)}/yr</span>
            </div>
          </div>
        </div>
      </div>

      {/* 12-Month Projection Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-header">
          <span className="card-title">12-Month Income Projection</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Month</th>
              <th style={{ textAlign: 'right' }}>Dividends</th>
              <th style={{ textAlign: 'right' }}>Options</th>
              <th style={{ textAlign: 'right' }}>Fixed Income</th>
              <th style={{ textAlign: 'right' }}>Total</th>
              <th style={{ textAlign: 'right' }}>Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {MONTHLY_PROJECTIONS.map((row, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 600 }}>{row.month}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(row.dividends)}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(row.options)}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(row.fixedIncome)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{usd.format(row.total)}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }} className="pnl-positive">
                  {usd.format(row.cumulative)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRIP Compounding Table */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-header">
          <span className="card-title">DRIP Compounding (10-Year Projection)</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Year</th>
              <th style={{ textAlign: 'right' }}>Starting Balance</th>
              <th style={{ textAlign: 'right' }}>Annual Income</th>
              <th style={{ textAlign: 'right' }}>Reinvested</th>
              <th style={{ textAlign: 'right' }}>Ending Balance</th>
            </tr>
          </thead>
          <tbody>
            {DRIP_TABLE.map((row, i) => {
              const isLast = i === DRIP_TABLE.length - 1;
              return (
                <tr key={row.year} style={isLast ? { fontWeight: 800 } : {}}>
                  <td style={{ fontWeight: 600 }}>Year {row.year}</td>
                  <td style={{ textAlign: 'right' }}>{usdShort.format(row.startingBalance)}</td>
                  <td style={{ textAlign: 'right' }} className="pnl-positive">
                    {usdShort.format(row.annualIncome)}
                  </td>
                  <td style={{ textAlign: 'right' }} className="pnl-positive">
                    {usdShort.format(row.reinvested)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>
                    {usdShort.format(row.endingBalance)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Top 10 Dividend Holdings */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-header">
          <span className="card-title">Top 10 Dividend Holdings</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th style={{ textAlign: 'right' }}>Yield %</th>
              <th style={{ textAlign: 'right' }}>Annual Div/Share</th>
              <th style={{ textAlign: 'right' }}>Shares</th>
              <th style={{ textAlign: 'right' }}>Annual Income</th>
              <th style={{ textAlign: 'center' }}>Safety Score</th>
              <th>Ex-Date</th>
            </tr>
          </thead>
          <tbody>
            {DIVIDEND_HOLDINGS.map(h => (
              <tr key={h.ticker}>
                <td style={{ fontWeight: 700 }}>{h.ticker}</td>
                <td style={{ textAlign: 'right' }}>{h.yieldPct.toFixed(2)}%</td>
                <td style={{ textAlign: 'right' }}>{usd.format(h.annDivShare)}</td>
                <td style={{ textAlign: 'right' }}>{h.shares.toLocaleString()}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }} className="pnl-positive">
                  {usd.format(h.annualIncome)}
                </td>
                <td style={{ textAlign: 'center', fontWeight: 700 }}>
                  <span style={{
                    color: h.safety >= 9 ? '#22c55e' : h.safety >= 7 ? '#eab308' : '#ef4444',
                  }}>
                    {h.safety}/10
                  </span>
                </td>
                <td>{h.exDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Covered Call Positions */}
      <div className="card" style={{ overflowX: 'auto' }}>
        <div className="card-header">
          <span className="card-title">Covered Call Positions</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th style={{ textAlign: 'right' }}>Strike</th>
              <th>Expiry</th>
              <th style={{ textAlign: 'right' }}>Premium</th>
              <th style={{ textAlign: 'right' }}>Max Profit</th>
            </tr>
          </thead>
          <tbody>
            {COVERED_CALLS.map((cc, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 700 }}>{cc.symbol}</td>
                <td style={{ textAlign: 'right' }}>{usd.format(cc.strike)}</td>
                <td>{cc.expiry}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }} className="pnl-positive">
                  {usd.format(cc.premium)}
                </td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>
                  {usd.format(cc.maxProfit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Banner */}
      <div className="card" style={{
        textAlign: 'center',
        padding: '24px',
        border: '2px solid #22c55e',
      }}>
        <p style={{
          fontSize: '18px',
          fontWeight: 900,
          letterSpacing: '1px',
          margin: 0,
        }}>
          The CK Cash Flow Generator works 24/7/365 — Revenue never stops
        </p>
      </div>
    </div>
  );
}
