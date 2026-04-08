/**
 * CK Trading Desk — Utility Formatters
 * Standardized formatting for the Wall Street dashboard
 */

export const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

export const fmtCompact = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n);

export const fmtNum = (n, decimals = 2) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(n);

export const pct = (n) => (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export const fmtTime = (d) =>
  new Date(d).toLocaleTimeString('en-US', { hour12: false });

export const fmtLargeNum = (n) => {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
};

export const pnlClass = (n) => n >= 0 ? 'pnl-positive' : 'pnl-negative';
export const pnlSign = (n) => n >= 0 ? '+' : '';
