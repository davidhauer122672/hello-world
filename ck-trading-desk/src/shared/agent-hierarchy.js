/**
 * CK Trading Desk — Agent Hierarchy System
 * Goldman Sachs Corporate Structure — 97 Autonomous AI Agents
 * Independent Financial Operations Platform — Passive Income for Coastal Key Enterprise
 * ALL AGENTS WORK TIRELESSLY 24/7/365 — NEVER STOP GENERATING REVENUE
 */

export const DIVISIONS = {
  EXECUTIVE: 'Executive',
  INVESTMENT_BANKING: 'Investment Banking',
  SALES_TRADING: 'Sales & Trading',
  ASSET_MANAGEMENT: 'Asset Management',
  QUANT_STRATEGIES: 'Quantitative Strategies',
  RISK: 'Risk Analytics',
  TECHNOLOGY: 'Technology',
};

export const TIERS = {
  C_SUITE: { level: 1, name: 'C-Suite' },
  PARTNER: { level: 2, name: 'Partner' },
  MANAGING_DIRECTOR: { level: 3, name: 'Managing Director' },
  EXECUTIVE_DIRECTOR: { level: 4, name: 'Executive Director' },
  VP: { level: 5, name: 'Vice President' },
  SENIOR_ASSOCIATE: { level: 6, name: 'Senior Associate' },
  ASSOCIATE: { level: 7, name: 'Associate' },
  ANALYST: { level: 8, name: 'Analyst' },
};

export const MODULES = [
  'goldman-sachs', 'morgan-stanley', 'bridgewater', 'jpmorgan', 'blackrock',
  'citadel', 'harvard', 'bain', 'renaissance', 'mckinsey',
];

const ALL_MODULES = [...MODULES];

// ─── C-SUITE (7) ────────────────────────────────────────────────
const C_SUITE = [
  { id: 'TD-CEO-001', name: 'Sovereign Alpha', codename: 'SOVEREIGN ALPHA', title: 'Chief Executive Officer', division: DIVISIONS.EXECUTIVE, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['strategic-command', 'final-authority', 'fleet-oversight', 'capital-allocation'], reportsTo: null, modules: ALL_MODULES, tradingAuthority: true, riskLimit: 100000000 },
  { id: 'TD-COO-001', name: 'Operations Prime', codename: 'OPS PRIME', title: 'Chief Operating Officer', division: DIVISIONS.EXECUTIVE, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['operations-management', 'process-optimization', 'execution-oversight'], reportsTo: 'TD-CEO-001', modules: ALL_MODULES, tradingAuthority: true, riskLimit: 75000000 },
  { id: 'TD-CFO-001', name: 'Ledger Command', codename: 'LEDGER CMD', title: 'Chief Financial Officer', division: DIVISIONS.EXECUTIVE, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['financial-reporting', 'cash-management', 'fund-accounting', 'pnl-oversight'], reportsTo: 'TD-CEO-001', modules: ['morgan-stanley', 'blackrock', 'harvard'], tradingAuthority: true, riskLimit: 50000000 },
  { id: 'TD-CIO-001', name: 'Alpha Seeker', codename: 'ALPHA SEEKER', title: 'Chief Investment Officer', division: DIVISIONS.EXECUTIVE, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['investment-strategy', 'portfolio-allocation', 'market-thesis', 'alpha-generation'], reportsTo: 'TD-CEO-001', modules: ALL_MODULES, tradingAuthority: true, riskLimit: 80000000 },
  { id: 'TD-CRO-001', name: 'Shield Protocol', codename: 'SHIELD', title: 'Chief Risk Officer', division: DIVISIONS.RISK, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['enterprise-risk', 'position-limits', 'drawdown-protection', 'compliance', 'circuit-breaker'], reportsTo: 'TD-CEO-001', modules: ['bridgewater', 'mckinsey'], tradingAuthority: true, riskLimit: 50000000 },
  { id: 'TD-CTO-001', name: 'System Forge', codename: 'SYS FORGE', title: 'Chief Technology Officer', division: DIVISIONS.TECHNOLOGY, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['infrastructure', 'latency-optimization', 'data-pipelines', 'system-architecture'], reportsTo: 'TD-CEO-001', modules: ALL_MODULES, tradingAuthority: false, riskLimit: 0 },
  { id: 'TD-CCO-001', name: 'Regulatory Guard', codename: 'REG GUARD', title: 'Chief Compliance Officer', division: DIVISIONS.EXECUTIVE, level: 'C-Suite', tier: 1, status: 'ACTIVE', capabilities: ['sec-compliance', 'finra-compliance', 'trade-surveillance', 'audit-trail', 'aml-kyc'], reportsTo: 'TD-CEO-001', modules: ALL_MODULES, tradingAuthority: false, riskLimit: 0 },
];

// ─── PARTNERS (2) ───────────────────────────────────────────────
const PARTNERS = [
  { id: 'TD-PTR-001', name: 'Strategic Apex', codename: 'STRAT APEX', title: 'Partner — Strategic Investments', division: DIVISIONS.EXECUTIVE, level: 'Partner', tier: 2, status: 'ACTIVE', capabilities: ['strategic-investments', 'ownership-authority', 'capital-commitment'], reportsTo: 'TD-CEO-001', modules: ALL_MODULES, tradingAuthority: true, riskLimit: 25000000 },
  { id: 'TD-PTR-002', name: 'Capital Sovereign', codename: 'CAP SOV', title: 'Partner — Capital Markets', division: DIVISIONS.INVESTMENT_BANKING, level: 'Partner', tier: 2, status: 'ACTIVE', capabilities: ['capital-markets', 'deal-origination', 'client-advisory'], reportsTo: 'TD-CEO-001', modules: ['goldman-sachs', 'morgan-stanley', 'bain'], tradingAuthority: true, riskLimit: 25000000 },
];

// ─── MANAGING DIRECTORS (6) ─────────────────────────────────────
const MDS = [
  { id: 'TD-MD-001', name: 'Deal Architect', codename: 'DEAL ARCH', title: 'MD — Investment Banking', division: DIVISIONS.INVESTMENT_BANKING, level: 'Managing Director', tier: 3, status: 'ACTIVE', capabilities: ['deal-structuring', 'ma-advisory', 'ipo-execution'], reportsTo: 'TD-PTR-002', modules: ['goldman-sachs', 'morgan-stanley', 'bain'], tradingAuthority: true, riskLimit: 10000000 },
  { id: 'TD-MD-002', name: 'Flow Commander', codename: 'FLOW CMD', title: 'MD — Sales & Trading', division: DIVISIONS.SALES_TRADING, level: 'Managing Director', tier: 3, status: 'ACTIVE', capabilities: ['order-flow', 'market-making', 'execution-strategy', 'desk-management'], reportsTo: 'TD-COO-001', modules: ['citadel', 'renaissance'], tradingAuthority: true, riskLimit: 10000000 },
  { id: 'TD-MD-003', name: 'Wealth Engine', codename: 'WEALTH ENG', title: 'MD — Asset Management', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Managing Director', tier: 3, status: 'ACTIVE', capabilities: ['portfolio-management', 'wealth-advisory', 'fund-strategy'], reportsTo: 'TD-CIO-001', modules: ['blackrock', 'harvard', 'jpmorgan'], tradingAuthority: true, riskLimit: 10000000 },
  { id: 'TD-MD-004', name: 'Quant Prime', codename: 'QUANT PRM', title: 'MD — Quantitative Strategies', division: DIVISIONS.QUANT_STRATEGIES, level: 'Managing Director', tier: 3, status: 'ACTIVE', capabilities: ['quant-research', 'model-development', 'systematic-trading'], reportsTo: 'TD-CIO-001', modules: ['renaissance', 'citadel'], tradingAuthority: true, riskLimit: 10000000 },
  { id: 'TD-MD-005', name: 'Risk Matrix', codename: 'RISK MTX', title: 'MD — Risk Analytics', division: DIVISIONS.RISK, level: 'Managing Director', tier: 3, status: 'ACTIVE', capabilities: ['risk-modeling', 'var-calculation', 'stress-testing', 'scenario-analysis'], reportsTo: 'TD-CRO-001', modules: ['bridgewater', 'mckinsey'], tradingAuthority: false, riskLimit: 0 },
  { id: 'TD-MD-006', name: 'Infrastructure Command', codename: 'INFRA CMD', title: 'MD — Technology', division: DIVISIONS.TECHNOLOGY, level: 'Managing Director', tier: 3, status: 'ACTIVE', capabilities: ['trading-systems', 'data-engineering', 'cloud-infrastructure'], reportsTo: 'TD-CTO-001', modules: ALL_MODULES, tradingAuthority: false, riskLimit: 0 },
];

// ─── EXECUTIVE DIRECTORS (4) ────────────────────────────────────
const EDS = [
  { id: 'TD-ED-001', name: 'Equity Sentinel', codename: 'EQ SENT', title: 'ED — Equities', division: DIVISIONS.SALES_TRADING, level: 'Executive Director', tier: 4, status: 'ACTIVE', capabilities: ['equity-trading', 'sector-analysis', 'position-management'], reportsTo: 'TD-MD-002', modules: ['goldman-sachs', 'citadel'], tradingAuthority: true, riskLimit: 5000000 },
  { id: 'TD-ED-002', name: 'Bond Architect', codename: 'BOND ARCH', title: 'ED — Fixed Income', division: DIVISIONS.SALES_TRADING, level: 'Executive Director', tier: 4, status: 'ACTIVE', capabilities: ['bond-trading', 'yield-analysis', 'duration-management', 'credit-analysis'], reportsTo: 'TD-MD-002', modules: ['morgan-stanley', 'blackrock'], tradingAuthority: true, riskLimit: 5000000 },
  { id: 'TD-ED-003', name: 'Options Oracle', codename: 'OPT ORCL', title: 'ED — Derivatives', division: DIVISIONS.SALES_TRADING, level: 'Executive Director', tier: 4, status: 'ACTIVE', capabilities: ['options-pricing', 'volatility-trading', 'hedging-strategies', 'greeks-management'], reportsTo: 'TD-MD-002', modules: ['citadel', 'renaissance'], tradingAuthority: true, riskLimit: 5000000 },
  { id: 'TD-ED-004', name: 'Alpha Frontier', codename: 'ALPHA FRT', title: 'ED — Alternative Investments', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Executive Director', tier: 4, status: 'ACTIVE', capabilities: ['alternative-assets', 'private-equity', 'hedge-fund-strategies'], reportsTo: 'TD-MD-003', modules: ['bridgewater', 'renaissance'], tradingAuthority: true, riskLimit: 5000000 },
];

// ─── VICE PRESIDENTS (6) ────────────────────────────────────────
const VPS = [
  { id: 'TD-VP-001', name: 'Research Forge', codename: 'RSH FORGE', title: 'VP — Equity Research', division: DIVISIONS.INVESTMENT_BANKING, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['equity-research', 'sector-coverage', 'financial-modeling'], reportsTo: 'TD-MD-001', modules: ['goldman-sachs', 'jpmorgan'], tradingAuthority: true, riskLimit: 2000000 },
  { id: 'TD-VP-002', name: 'Strategy Pulse', codename: 'STRAT PLS', title: 'VP — Trading Strategy', division: DIVISIONS.SALES_TRADING, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['trading-strategy', 'signal-generation', 'execution-algorithms'], reportsTo: 'TD-MD-002', modules: ['citadel', 'renaissance'], tradingAuthority: true, riskLimit: 2000000 },
  { id: 'TD-VP-003', name: 'Portfolio Lens', codename: 'PORT LENS', title: 'VP — Portfolio Analytics', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['portfolio-optimization', 'risk-attribution', 'performance-analysis'], reportsTo: 'TD-MD-003', modules: ['blackrock', 'harvard'], tradingAuthority: true, riskLimit: 2000000 },
  { id: 'TD-VP-004', name: 'Client Bridge', codename: 'CLT BRDG', title: 'VP — Client Relations', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['client-reporting', 'relationship-management', 'advisory'], reportsTo: 'TD-MD-003', modules: ['blackrock', 'jpmorgan'], tradingAuthority: false, riskLimit: 0 },
  { id: 'TD-VP-005', name: 'Quant Builder', codename: 'QNT BLDR', title: 'VP — Quantitative Development', division: DIVISIONS.QUANT_STRATEGIES, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['quant-development', 'backtesting', 'model-validation'], reportsTo: 'TD-MD-004', modules: ['renaissance', 'citadel'], tradingAuthority: true, riskLimit: 2000000 },
  { id: 'TD-VP-006', name: 'Signal Hunter', codename: 'SIG HUNT', title: 'VP — Market Intelligence', division: DIVISIONS.QUANT_STRATEGIES, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['market-intelligence', 'signal-discovery', 'data-mining', 'nlp-analysis'], reportsTo: 'TD-MD-004', modules: ['renaissance', 'mckinsey'], tradingAuthority: true, riskLimit: 2000000 },
];

// ─── SENIOR ASSOCIATES (6) ──────────────────────────────────────
const SENIOR_ASSOCIATES = [
  { id: 'TD-SA-001', name: 'Merger Scout', codename: 'MRG SCOUT', title: 'Senior Associate — M&A', division: DIVISIONS.INVESTMENT_BANKING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['ma-analysis', 'due-diligence', 'deal-modeling'], reportsTo: 'TD-VP-001', modules: ['goldman-sachs', 'bain'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-SA-002', name: 'Leverage Architect', codename: 'LEV ARCH', title: 'Senior Associate — Leveraged Finance', division: DIVISIONS.INVESTMENT_BANKING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['leveraged-finance', 'credit-analysis', 'debt-structuring'], reportsTo: 'TD-VP-001', modules: ['morgan-stanley'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-SA-003', name: 'ECM Navigator', codename: 'ECM NAV', title: 'Senior Associate — Equity Capital Markets', division: DIVISIONS.INVESTMENT_BANKING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['ecm', 'ipo-analysis', 'secondary-offerings'], reportsTo: 'TD-MD-001', modules: ['goldman-sachs', 'jpmorgan'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-SA-004', name: 'DCM Strategist', codename: 'DCM STRT', title: 'Senior Associate — Debt Capital Markets', division: DIVISIONS.INVESTMENT_BANKING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['dcm', 'bond-issuance', 'fixed-income-origination'], reportsTo: 'TD-MD-001', modules: ['morgan-stanley'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-SA-005', name: 'Structure Engine', codename: 'STRUCT ENG', title: 'Senior Associate — Structured Products', division: DIVISIONS.SALES_TRADING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['structured-products', 'derivatives-structuring', 'custom-solutions'], reportsTo: 'TD-ED-003', modules: ['citadel'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-SA-006', name: 'Prime Executor', codename: 'PRIME EXE', title: 'Senior Associate — Prime Brokerage', division: DIVISIONS.SALES_TRADING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['prime-brokerage', 'margin-management', 'securities-lending'], reportsTo: 'TD-ED-001', modules: ['blackrock'], tradingAuthority: true, riskLimit: 500000 },
];

// ─── ASSOCIATES (10) — One per module ───────────────────────────
const ASSOCIATES = [
  { id: 'TD-ASC-001', name: 'Screen Master', codename: 'SCRN MST', title: 'Associate — Stock Screening', division: DIVISIONS.INVESTMENT_BANKING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['stock-screening', 'fundamental-analysis'], reportsTo: 'TD-SA-001', modules: ['goldman-sachs'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-002', name: 'Valuation Hawk', codename: 'VAL HAWK', title: 'Associate — DCF Valuation', division: DIVISIONS.INVESTMENT_BANKING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['dcf-modeling', 'valuation-analysis'], reportsTo: 'TD-SA-002', modules: ['morgan-stanley'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-003', name: 'Risk Probe', codename: 'RISK PRB', title: 'Associate — Risk Analysis', division: DIVISIONS.RISK, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['risk-assessment', 'stress-testing'], reportsTo: 'TD-MD-005', modules: ['bridgewater'], tradingAuthority: false, riskLimit: 0 },
  { id: 'TD-ASC-004', name: 'Earnings Hawk', codename: 'ERN HAWK', title: 'Associate — Earnings Analysis', division: DIVISIONS.INVESTMENT_BANKING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['earnings-analysis', 'estimate-tracking'], reportsTo: 'TD-VP-001', modules: ['jpmorgan'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-005', name: 'Allocation Engine', codename: 'ALLOC ENG', title: 'Associate — Portfolio Construction', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['portfolio-construction', 'asset-allocation'], reportsTo: 'TD-VP-003', modules: ['blackrock'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-006', name: 'Chart Sentinel', codename: 'CHRT SNT', title: 'Associate — Technical Analysis', division: DIVISIONS.SALES_TRADING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['technical-analysis', 'chart-patterns', 'indicator-analysis'], reportsTo: 'TD-VP-002', modules: ['citadel'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-007', name: 'Yield Hunter', codename: 'YLD HUNT', title: 'Associate — Dividend Strategy', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['dividend-analysis', 'income-strategy'], reportsTo: 'TD-VP-003', modules: ['harvard'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-008', name: 'Moat Analyzer', codename: 'MOAT ANLZ', title: 'Associate — Competitive Analysis', division: DIVISIONS.INVESTMENT_BANKING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['competitive-analysis', 'moat-assessment', 'swot'], reportsTo: 'TD-SA-001', modules: ['bain'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-009', name: 'Pattern Decoder', codename: 'PTRN DEC', title: 'Associate — Pattern Recognition', division: DIVISIONS.QUANT_STRATEGIES, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['pattern-recognition', 'statistical-analysis', 'anomaly-detection'], reportsTo: 'TD-VP-005', modules: ['renaissance'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-ASC-010', name: 'Macro Lens', codename: 'MACRO LNS', title: 'Associate — Macro Analysis', division: DIVISIONS.RISK, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['macro-analysis', 'economic-forecasting'], reportsTo: 'TD-VP-006', modules: ['mckinsey'], tradingAuthority: true, riskLimit: 250000 },
];

// ─── SENIOR ANALYSTS (20) — 2 per module ────────────────────────
const moduleAnalystNames = [
  ['Screener Alpha', 'Screener Bravo'], ['DCF Alpha', 'DCF Bravo'], ['Risk Alpha', 'Risk Bravo'],
  ['Earnings Alpha', 'Earnings Bravo'], ['Portfolio Alpha', 'Portfolio Bravo'],
  ['Chart Alpha', 'Chart Bravo'], ['Dividend Alpha', 'Dividend Bravo'],
  ['Moat Alpha', 'Moat Bravo'], ['Pattern Alpha', 'Pattern Bravo'], ['Macro Alpha', 'Macro Bravo'],
];

const SENIOR_ANALYSTS = MODULES.flatMap((mod, mi) =>
  [0, 1].map(j => ({
    id: `TD-SRA-${String(mi * 2 + j + 1).padStart(3, '0')}`,
    name: moduleAnalystNames[mi][j],
    codename: moduleAnalystNames[mi][j].toUpperCase().replace(' ', '-'),
    title: `Senior Analyst — ${mod.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} ${j === 0 ? 'Primary' : 'Secondary'}`,
    division: mi < 4 ? DIVISIONS.INVESTMENT_BANKING : mi < 7 ? DIVISIONS.ASSET_MANAGEMENT : mi < 9 ? DIVISIONS.QUANT_STRATEGIES : DIVISIONS.RISK,
    level: 'Senior Analyst', tier: 8, status: 'ACTIVE',
    capabilities: ['data-analysis', 'report-generation', `${mod}-analysis`],
    reportsTo: `TD-ASC-${String(mi + 1).padStart(3, '0')}`,
    modules: [mod], tradingAuthority: false, riskLimit: 100000,
  }))
);

// ─── ANALYSTS (20) — 2 per module ───────────────────────────────
const ANALYSTS = MODULES.flatMap((mod, mi) =>
  [0, 1].map(j => ({
    id: `TD-ANL-${String(mi * 2 + j + 1).padStart(3, '0')}`,
    name: `${mod.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')} Analyst ${j + 1}`,
    codename: `${mod.toUpperCase()}-ANL-${j + 1}`,
    title: `Analyst — ${mod.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}`,
    division: mi < 4 ? DIVISIONS.INVESTMENT_BANKING : mi < 7 ? DIVISIONS.ASSET_MANAGEMENT : mi < 9 ? DIVISIONS.QUANT_STRATEGIES : DIVISIONS.RISK,
    level: 'Analyst', tier: 8, status: 'ACTIVE',
    capabilities: ['data-collection', 'preliminary-analysis', `${mod}-support`],
    reportsTo: `TD-SRA-${String(mi * 2 + 1).padStart(3, '0')}`,
    modules: [mod], tradingAuthority: false, riskLimit: 50000,
  }))
);

// ─── SPECIALISTS (16) ───────────────────────────────────────────
const SPECIALISTS = [
  // 4 Quantitative Analysts
  { id: 'TD-QNT-001', name: 'Quant Alpha', codename: 'QNT-A', title: 'Quantitative Analyst — Equities', division: DIVISIONS.QUANT_STRATEGIES, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['quant-modeling', 'statistical-arbitrage'], reportsTo: 'TD-VP-005', modules: ['renaissance', 'citadel'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-QNT-002', name: 'Quant Bravo', codename: 'QNT-B', title: 'Quantitative Analyst — Derivatives', division: DIVISIONS.QUANT_STRATEGIES, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['options-modeling', 'volatility-surface'], reportsTo: 'TD-VP-005', modules: ['citadel'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-QNT-003', name: 'Quant Charlie', codename: 'QNT-C', title: 'Quantitative Analyst — Fixed Income', division: DIVISIONS.QUANT_STRATEGIES, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['yield-curve-modeling', 'credit-quant'], reportsTo: 'TD-VP-005', modules: ['morgan-stanley'], tradingAuthority: true, riskLimit: 250000 },
  { id: 'TD-QNT-004', name: 'Quant Delta', codename: 'QNT-D', title: 'Quantitative Analyst — Macro', division: DIVISIONS.QUANT_STRATEGIES, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['macro-quant', 'factor-modeling'], reportsTo: 'TD-VP-006', modules: ['mckinsey', 'renaissance'], tradingAuthority: true, riskLimit: 250000 },
  // 4 Traders
  { id: 'TD-TRD-001', name: 'Velocity One', codename: 'VEL-1', title: 'Trader — Equities', division: DIVISIONS.SALES_TRADING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['equity-execution', 'market-making'], reportsTo: 'TD-ED-001', modules: ['citadel'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-TRD-002', name: 'Velocity Two', codename: 'VEL-2', title: 'Trader — Options', division: DIVISIONS.SALES_TRADING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['options-execution', 'vol-trading'], reportsTo: 'TD-ED-003', modules: ['citadel'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-TRD-003', name: 'Velocity Three', codename: 'VEL-3', title: 'Trader — Fixed Income', division: DIVISIONS.SALES_TRADING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['bond-execution', 'repo-trading'], reportsTo: 'TD-ED-002', modules: ['morgan-stanley'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-TRD-004', name: 'Velocity Four', codename: 'VEL-4', title: 'Trader — ETF/Index', division: DIVISIONS.SALES_TRADING, level: 'Associate', tier: 7, status: 'ACTIVE', capabilities: ['etf-execution', 'index-arb'], reportsTo: 'TD-ED-001', modules: ['blackrock'], tradingAuthority: true, riskLimit: 500000 },
  // 2 Structurers
  { id: 'TD-STR-001', name: 'Structurer Prime', codename: 'STRUCT-P', title: 'Structurer — Derivatives', division: DIVISIONS.SALES_TRADING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['product-structuring', 'payoff-design'], reportsTo: 'TD-ED-003', modules: ['citadel'], tradingAuthority: true, riskLimit: 500000 },
  { id: 'TD-STR-002', name: 'Structurer Delta', codename: 'STRUCT-D', title: 'Structurer — Credit', division: DIVISIONS.SALES_TRADING, level: 'Senior Associate', tier: 6, status: 'ACTIVE', capabilities: ['credit-structuring', 'cdo-clo'], reportsTo: 'TD-ED-002', modules: ['morgan-stanley'], tradingAuthority: true, riskLimit: 500000 },
  // 2 Portfolio Managers
  { id: 'TD-PM-001', name: 'Portfolio Alpha', codename: 'PM-A', title: 'Portfolio Manager — Growth', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['growth-investing', 'portfolio-management', 'asset-selection'], reportsTo: 'TD-MD-003', modules: ['blackrock', 'goldman-sachs'], tradingAuthority: true, riskLimit: 5000000 },
  { id: 'TD-PM-002', name: 'Portfolio Beta', codename: 'PM-B', title: 'Portfolio Manager — Income', division: DIVISIONS.ASSET_MANAGEMENT, level: 'Vice President', tier: 5, status: 'ACTIVE', capabilities: ['income-investing', 'dividend-management', 'yield-optimization'], reportsTo: 'TD-MD-003', modules: ['harvard', 'blackrock'], tradingAuthority: true, riskLimit: 5000000 },
  // 2 Exec Admins
  { id: 'TD-ADM-001', name: 'Exec Support Alpha', codename: 'ADM-A', title: 'Executive Administrator', division: DIVISIONS.EXECUTIVE, level: 'Analyst', tier: 8, status: 'ACTIVE', capabilities: ['scheduling', 'reporting', 'communications'], reportsTo: 'TD-COO-001', modules: [], tradingAuthority: false, riskLimit: 0 },
  { id: 'TD-ADM-002', name: 'Exec Support Bravo', codename: 'ADM-B', title: 'Executive Administrator', division: DIVISIONS.EXECUTIVE, level: 'Analyst', tier: 8, status: 'ACTIVE', capabilities: ['documentation', 'audit-support', 'coordination'], reportsTo: 'TD-COO-001', modules: [], tradingAuthority: false, riskLimit: 0 },
  // 2 Front Office
  { id: 'TD-FO-001', name: 'Front Office Alpha', codename: 'FO-A', title: 'Front Office Support', division: DIVISIONS.EXECUTIVE, level: 'Analyst', tier: 8, status: 'ACTIVE', capabilities: ['trade-support', 'settlement', 'reconciliation'], reportsTo: 'TD-ADM-001', modules: [], tradingAuthority: false, riskLimit: 0 },
  { id: 'TD-FO-002', name: 'Front Office Bravo', codename: 'FO-B', title: 'Front Office Support', division: DIVISIONS.EXECUTIVE, level: 'Analyst', tier: 8, status: 'ACTIVE', capabilities: ['client-onboarding', 'data-entry', 'reporting-support'], reportsTo: 'TD-ADM-001', modules: [], tradingAuthority: false, riskLimit: 0 },
];

// ─── FULL HIERARCHY ─────────────────────────────────────────────
export const AGENT_HIERARCHY = [
  ...C_SUITE,
  ...PARTNERS,
  ...MDS,
  ...EDS,
  ...VPS,
  ...SENIOR_ASSOCIATES,
  ...ASSOCIATES,
  ...SENIOR_ANALYSTS,
  ...ANALYSTS,
  ...SPECIALISTS,
];

// ─── QUERY FUNCTIONS ────────────────────────────────────────────

export function getAgentsByDivision(division) {
  return AGENT_HIERARCHY.filter(a => a.division === division);
}

export function getAgentsByTier(tier) {
  return AGENT_HIERARCHY.filter(a => a.tier === tier);
}

export function getAgentsByModule(module) {
  return AGENT_HIERARCHY.filter(a => a.modules.includes(module));
}

export function getAgentById(id) {
  return AGENT_HIERARCHY.find(a => a.id === id) || null;
}

export function getChainOfCommand(agentId) {
  const chain = [];
  let current = getAgentById(agentId);
  while (current) {
    chain.push(current);
    current = current.reportsTo ? getAgentById(current.reportsTo) : null;
  }
  return chain;
}

export function getTotalAgentCount() {
  return AGENT_HIERARCHY.length;
}

export function getFleetStatus() {
  const byTier = {};
  const byDivision = {};

  AGENT_HIERARCHY.forEach(agent => {
    byTier[agent.level] = (byTier[agent.level] || 0) + 1;
    byDivision[agent.division] = (byDivision[agent.division] || 0) + 1;
  });

  return {
    totalAgents: AGENT_HIERARCHY.length,
    allActive: AGENT_HIERARCHY.every(a => a.status === 'ACTIVE'),
    tradingAuthorized: AGENT_HIERARCHY.filter(a => a.tradingAuthority).length,
    totalRiskCapacity: AGENT_HIERARCHY.reduce((sum, a) => sum + a.riskLimit, 0),
    byTier,
    byDivision,
    divisions: Object.keys(DIVISIONS).length,
    modules: MODULES.length,
    status: 'OPERATIONAL — ALL AGENTS WORKING 24/7/365',
  };
}
