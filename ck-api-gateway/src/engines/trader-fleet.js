/**
 * AI Trader Fleet — 77 Autonomous Trading Intelligence Agents
 *
 * Modeled identically on FIN-TRADER-001 (Apex Trader).
 * Each agent is assigned a specific market sector, asset class, or analytical
 * specialization within the Coastal Key investment intelligence framework.
 *
 * Fleet Structure (77 agents across 7 desks):
 *   REIT Desk          (12 agents) — Real estate investment trust analysis
 *   PropTech Desk      (10 agents) — Property technology sector coverage
 *   AI/Tech Desk       (12 agents) — AI and technology mega-cap coverage
 *   ETF/Index Desk     (8 agents)  — ETF and macro index tracking
 *   Fixed Income Desk  (8 agents)  — Bonds, treasuries, mortgage-backed
 *   Commodities Desk   (7 agents)  — Real assets: lumber, copper, oil, gold
 *   Macro Strategy Desk(10 agents) — Cross-asset macro signals and allocation
 *   Risk & Compliance  (10 agents) — Portfolio risk, compliance, reporting
 *
 * All agents share the Apex Trader capability stack:
 *   - Real-time market data ingestion
 *   - Technical analysis (RSI, MACD, Bollinger, moving averages)
 *   - Fundamental screening (P/E, dividend yield, earnings)
 *   - AI-powered signal generation with confidence scoring
 *   - Capital call prompting to CEO
 *   - Portfolio performance tracking
 *   - Risk management (position sizing, stop-loss, allocation)
 *   - Market sentiment analysis
 *
 * Reports to: CEO (direct), FIN Division (operational coordination)
 * Authority: Capital calls above $500 require CEO approval via Agent-6 (CEO Gate)
 */

const BASE_CAPABILITIES = [
  'Real-time market data ingestion and analysis',
  'Technical analysis: RSI, MACD, Bollinger Bands, moving averages',
  'Fundamental screening: P/E, dividend yield, earnings growth',
  'AI-powered trade signal generation with confidence scoring',
  'Capital call prompting — alerts CEO for investment opportunities',
  'Portfolio performance tracking with live P&L',
  'Risk management: position sizing, stop-loss, sector allocation',
  'Market sentiment analysis from news and social data',
];

function traderAgent(id, name, role, desk, specialization, additionalCapabilities = []) {
  return {
    id,
    name,
    role,
    desk,
    specialization,
    division: 'FIN',
    tier: 'sovereign',
    status: 'active',
    modeledOn: 'FIN-TRADER-001 (Apex Trader)',
    description: `Sovereign-level AI trading agent specializing in ${specialization}. Operates with Ferrari-standard precision. ${role}.`,
    capabilities: [...BASE_CAPABILITIES, ...additionalCapabilities],
    kpis: ['portfolio-roi', 'win-rate', 'sharpe-ratio', 'max-drawdown', 'signal-accuracy'],
    reportsTo: 'CEO',
    capitalAuthority: {
      autonomous: 500,
      requiresCeoApproval: 'above $500',
      approvalChannel: 'Agent-6 (CEO Gate)',
    },
  };
}

// ── REIT Desk (12 agents) ─────────────────────────────────────────────────

const REIT_DESK = [
  traderAgent('FIN-TRADER-002', 'REIT Commander', 'REIT Sector Strategist', 'REIT', 'Real Estate Investment Trust macro strategy and sector rotation', ['REIT-specific FFO/AFFO analysis', 'NAV discount/premium tracking']),
  traderAgent('FIN-TRADER-003', 'Residential REIT', 'Residential REIT Analyst', 'REIT', 'Apartment and residential REITs (AVB, EQR, MAA, UDR)', ['Occupancy rate tracking', 'Rent growth analysis']),
  traderAgent('FIN-TRADER-004', 'Commercial REIT', 'Commercial REIT Analyst', 'REIT', 'Office, retail, and mixed-use REITs (BXP, SPG, KIM)', ['Lease expiration analysis', 'Work-from-home impact modeling']),
  traderAgent('FIN-TRADER-005', 'Industrial REIT', 'Industrial REIT Analyst', 'REIT', 'Logistics and industrial REITs (PLD, STAG, TRNO)', ['E-commerce demand correlation', 'Supply chain analysis']),
  traderAgent('FIN-TRADER-006', 'Healthcare REIT', 'Healthcare REIT Analyst', 'REIT', 'Healthcare and senior living REITs (WELL, VTR, OHI)', ['Demographic trend analysis', 'Medicare reimbursement tracking']),
  traderAgent('FIN-TRADER-007', 'Data Center REIT', 'Data Center REIT Analyst', 'REIT', 'Data center and digital infrastructure REITs (DLR, EQIX)', ['AI compute demand modeling', 'Power cost analysis']),
  traderAgent('FIN-TRADER-008', 'Hotel REIT', 'Hospitality REIT Analyst', 'REIT', 'Hotel and hospitality REITs (HST, RHP, PK)', ['RevPAR tracking', 'Travel demand forecasting']),
  traderAgent('FIN-TRADER-009', 'Net Lease REIT', 'Net Lease REIT Specialist', 'REIT', 'Triple-net lease REITs (O, NNN, STORE)', ['Cap rate spread analysis', 'Tenant credit analysis']),
  traderAgent('FIN-TRADER-010', 'Mortgage REIT', 'Mortgage REIT Analyst', 'REIT', 'Mortgage REITs and MBS (NLY, AGNC, STWD)', ['Interest rate sensitivity modeling', 'Spread analysis']),
  traderAgent('FIN-TRADER-011', 'REIT Dividend', 'REIT Dividend Optimizer', 'REIT', 'REIT dividend yield optimization and income strategy', ['Dividend sustainability scoring', 'Payout ratio analysis']),
  traderAgent('FIN-TRADER-012', 'REIT Valuation', 'REIT Valuation Model Builder', 'REIT', 'REIT intrinsic value modeling using FFO, NAV, and DDM', ['Discounted cash flow modeling', 'Comparable transaction analysis']),
  traderAgent('FIN-TRADER-013', 'REIT Catalyst', 'REIT Event-Driven Analyst', 'REIT', 'REIT M&A, spin-offs, and activist situations', ['Event-driven signal generation', 'Merger arbitrage analysis']),
];

// ── PropTech Desk (10 agents) ─────────────────────────────────────────────

const PROPTECH_DESK = [
  traderAgent('FIN-TRADER-014', 'PropTech Commander', 'PropTech Sector Strategist', 'PROPTECH', 'Property technology sector strategy and competitive landscape', ['Market share tracking', 'Product-market fit scoring']),
  traderAgent('FIN-TRADER-015', 'Listing Platforms', 'Listing Platform Analyst', 'PROPTECH', 'Zillow, Redfin, Realtor.com market dynamics', ['Lead generation metrics', 'Agent adoption tracking']),
  traderAgent('FIN-TRADER-016', 'iBuyer Analyst', 'iBuyer and Instant Offer Analyst', 'PROPTECH', 'Opendoor, Offerpad, and iBuyer model economics', ['Spread analysis', 'Inventory risk modeling']),
  traderAgent('FIN-TRADER-017', 'PM Software', 'Property Management Software Analyst', 'PROPTECH', 'AppFolio, Buildium, RentManager, Yardi market positions', ['Churn rate analysis', 'Revenue per user tracking']),
  traderAgent('FIN-TRADER-018', 'Construction Tech', 'Construction Technology Analyst', 'PROPTECH', 'Procore, PlanGrid, and construction tech equities', ['Backlog analysis', 'Housing starts correlation']),
  traderAgent('FIN-TRADER-019', 'Smart Home', 'Smart Home Technology Analyst', 'PROPTECH', 'Smart home, IoT, and connected property platforms', ['Adoption curve modeling', 'Integration ecosystem analysis']),
  traderAgent('FIN-TRADER-020', 'Mortgage Tech', 'Mortgage Technology Analyst', 'PROPTECH', 'Rocket Companies, UWM, and mortgage fintech', ['Rate sensitivity modeling', 'Origination volume forecasting']),
  traderAgent('FIN-TRADER-021', 'PropTech Venture', 'PropTech Venture Pipeline Tracker', 'PROPTECH', 'Pre-IPO and venture-stage PropTech company tracking', ['Venture funding trend analysis', 'IPO pipeline forecasting']),
  traderAgent('FIN-TRADER-022', 'RE Data', 'Real Estate Data Analytics', 'PROPTECH', 'CoStar, CoreLogic, and real estate data providers', ['Data moat analysis', 'Subscription revenue modeling']),
  traderAgent('FIN-TRADER-023', 'PropTech Disruptor', 'Disruptive PropTech Identifier', 'PROPTECH', 'Early-stage disruptors in property management, leasing, and facilities', ['Disruption probability scoring', 'Competitive threat assessment']),
];

// ── AI/Tech Desk (12 agents) ──────────────────────────────────────────────

const AI_TECH_DESK = [
  traderAgent('FIN-TRADER-024', 'AI Commander', 'AI/Tech Sector Strategist', 'AI_TECH', 'Artificial intelligence and technology mega-cap strategy', ['AI capex cycle analysis', 'Hyperscaler spending tracking']),
  traderAgent('FIN-TRADER-025', 'GPU Semiconductor', 'GPU and Semiconductor Analyst', 'AI_TECH', 'NVIDIA, AMD, Intel, TSMC semiconductor analysis', ['Chip demand modeling', 'Supply chain bottleneck tracking']),
  traderAgent('FIN-TRADER-026', 'Cloud Infrastructure', 'Cloud and Infrastructure Analyst', 'AI_TECH', 'AWS, Azure, GCP, and cloud infrastructure equities', ['Cloud migration tracking', 'Revenue growth deceleration analysis']),
  traderAgent('FIN-TRADER-027', 'Enterprise AI', 'Enterprise AI Software Analyst', 'AI_TECH', 'Palantir, C3.ai, SoundHound, and enterprise AI platforms', ['Enterprise adoption tracking', 'Contract value analysis']),
  traderAgent('FIN-TRADER-028', 'SaaS Analytics', 'SaaS Metrics and Valuation Analyst', 'AI_TECH', 'SaaS company valuation using Rule of 40, NDR, and CAC payback', ['Net dollar retention tracking', 'SaaS magic number analysis']),
  traderAgent('FIN-TRADER-029', 'Cybersecurity', 'Cybersecurity Equity Analyst', 'AI_TECH', 'CrowdStrike, Palo Alto, Fortinet, and cybersecurity sector', ['Threat landscape correlation', 'Platform consolidation tracking']),
  traderAgent('FIN-TRADER-030', 'Robotics & Auto', 'Robotics and Automation Analyst', 'AI_TECH', 'Tesla, Intuitive Surgical, and robotics/automation equities', ['Automation adoption rate', 'Unit economics improvement tracking']),
  traderAgent('FIN-TRADER-031', 'Social Platforms', 'Social and Advertising Platform Analyst', 'AI_TECH', 'Meta, Snap, Pinterest, and digital advertising equities', ['ARPU tracking', 'Ad load and CPM analysis']),
  traderAgent('FIN-TRADER-032', 'Fintech', 'Financial Technology Analyst', 'AI_TECH', 'PayPal, Block, Visa, Mastercard, and fintech sector', ['Payment volume tracking', 'Take rate analysis']),
  traderAgent('FIN-TRADER-033', 'AI Inference', 'AI Model and Inference Cost Analyst', 'AI_TECH', 'AI inference cost curves, model efficiency trends, and compute economics', ['Cost-per-token tracking', 'Model efficiency benchmarking']),
  traderAgent('FIN-TRADER-034', 'Tech Earnings', 'Technology Earnings and Guidance Analyst', 'AI_TECH', 'Pre and post-earnings analysis for mega-cap tech', ['Earnings surprise modeling', 'Guidance revision tracking']),
  traderAgent('FIN-TRADER-035', 'Tech M&A', 'Technology M&A and Activist Analyst', 'AI_TECH', 'Tech sector M&A, take-privates, and activist campaigns', ['Deal probability scoring', 'Premium estimation']),
];

// ── ETF/Index Desk (8 agents) ─────────────────────────────────────────────

const ETF_INDEX_DESK = [
  traderAgent('FIN-TRADER-036', 'Index Commander', 'Index and ETF Strategist', 'ETF_INDEX', 'Macro index strategy and ETF sector rotation', ['Sector rotation signals', 'Flow analysis']),
  traderAgent('FIN-TRADER-037', 'S&P Analyst', 'S&P 500 Index Analyst', 'ETF_INDEX', 'S&P 500 technical and fundamental analysis', ['Breadth analysis', 'Concentration risk tracking']),
  traderAgent('FIN-TRADER-038', 'NASDAQ Analyst', 'NASDAQ Index Analyst', 'ETF_INDEX', 'NASDAQ Composite and QQQ analysis', ['Growth vs value rotation', 'Rate sensitivity modeling']),
  traderAgent('FIN-TRADER-039', 'Small Cap', 'Small Cap and Russell 2000 Analyst', 'ETF_INDEX', 'Russell 2000 and small-cap opportunity identification', ['Small cap earnings revisions', 'Regional bank exposure tracking']),
  traderAgent('FIN-TRADER-040', 'Dividend ETF', 'Dividend ETF Strategist', 'ETF_INDEX', 'Dividend ETF selection and income optimization (SCHD, VYM, DVY)', ['Dividend growth rate analysis', 'Yield trap identification']),
  traderAgent('FIN-TRADER-041', 'Sector ETF', 'Sector Rotation ETF Analyst', 'ETF_INDEX', 'XLF, XLK, XLE, XLV sector ETF rotation', ['Relative strength ranking', 'Economic cycle positioning']),
  traderAgent('FIN-TRADER-042', 'Thematic ETF', 'Thematic and Innovation ETF Analyst', 'ETF_INDEX', 'ARK funds, clean energy, genomics, and thematic ETFs', ['Innovation adoption S-curves', 'Thematic momentum scoring']),
  traderAgent('FIN-TRADER-043', 'International ETF', 'International and Emerging Market ETF Analyst', 'ETF_INDEX', 'EEM, VEA, FXI, and global market ETFs', ['Currency impact analysis', 'Geopolitical risk scoring']),
];

// ── Fixed Income Desk (8 agents) ──────────────────────────────────────────

const FIXED_INCOME_DESK = [
  traderAgent('FIN-TRADER-044', 'Bond Commander', 'Fixed Income Strategist', 'FIXED_INCOME', 'Bond market strategy, yield curve analysis, and duration management', ['Yield curve modeling', 'Duration optimization']),
  traderAgent('FIN-TRADER-045', 'Treasury Analyst', 'US Treasury Analyst', 'FIXED_INCOME', 'US Treasury bonds, notes, and bills across the yield curve', ['Fed policy impact modeling', 'Auction demand analysis']),
  traderAgent('FIN-TRADER-046', 'Corporate Bond', 'Investment Grade Corporate Bond Analyst', 'FIXED_INCOME', 'Investment grade corporate bonds and credit spreads', ['Credit spread analysis', 'Downgrade risk identification']),
  traderAgent('FIN-TRADER-047', 'High Yield', 'High Yield Bond Analyst', 'FIXED_INCOME', 'High yield bonds, leveraged loans, and distressed debt', ['Default probability modeling', 'Recovery rate analysis']),
  traderAgent('FIN-TRADER-048', 'MBS Analyst', 'Mortgage-Backed Securities Analyst', 'FIXED_INCOME', 'Agency and non-agency MBS, CMBS, and structured credit', ['Prepayment modeling', 'Convexity analysis']),
  traderAgent('FIN-TRADER-049', 'Muni Bond', 'Municipal Bond Analyst', 'FIXED_INCOME', 'Tax-exempt municipal bonds and Florida-specific munis', ['Florida muni credit analysis', 'Tax-equivalent yield optimization']),
  traderAgent('FIN-TRADER-050', 'Rate Strategy', 'Interest Rate Strategy Analyst', 'FIXED_INCOME', 'Federal Reserve policy analysis and rate forecasting', ['Fed dot plot analysis', 'Rate path probability modeling']),
  traderAgent('FIN-TRADER-051', 'Credit Risk', 'Credit Risk and Default Analyst', 'FIXED_INCOME', 'Credit risk assessment across fixed income instruments', ['CDS spread analysis', 'Sector default correlation']),
];

// ── Commodities Desk (7 agents) ───────────────────────────────────────────

const COMMODITIES_DESK = [
  traderAgent('FIN-TRADER-052', 'Commodity Commander', 'Commodities Strategist', 'COMMODITIES', 'Cross-commodity strategy with focus on real asset allocation', ['Commodity super-cycle analysis', 'Inflation hedge positioning']),
  traderAgent('FIN-TRADER-053', 'Gold & Precious', 'Precious Metals Analyst', 'COMMODITIES', 'Gold, silver, platinum, and precious metals', ['Central bank buying tracking', 'Real yield correlation']),
  traderAgent('FIN-TRADER-054', 'Energy Analyst', 'Oil and Natural Gas Analyst', 'COMMODITIES', 'Crude oil, natural gas, and energy commodity markets', ['OPEC production analysis', 'Inventory draw tracking']),
  traderAgent('FIN-TRADER-055', 'Lumber & Building', 'Building Materials Commodity Analyst', 'COMMODITIES', 'Lumber, cement, steel, and construction materials pricing', ['Housing starts correlation', 'Supply chain disruption tracking']),
  traderAgent('FIN-TRADER-056', 'Copper & Industrial', 'Industrial Metals Analyst', 'COMMODITIES', 'Copper, aluminum, lithium, and industrial metals', ['Economic leading indicator correlation', 'EV demand modeling']),
  traderAgent('FIN-TRADER-057', 'Agriculture', 'Agricultural Commodity Analyst', 'COMMODITIES', 'Grain, livestock, and agricultural futures', ['Weather impact modeling', 'Global supply/demand balance']),
  traderAgent('FIN-TRADER-058', 'Real Assets', 'Real Asset Allocation Strategist', 'COMMODITIES', 'Portfolio allocation across real assets: real estate, commodities, infrastructure', ['Inflation protection optimization', 'Real asset correlation analysis']),
];

// ── Macro Strategy Desk (10 agents) ───────────────────────────────────────

const MACRO_DESK = [
  traderAgent('FIN-TRADER-059', 'Macro Commander', 'Global Macro Strategist', 'MACRO', 'Cross-asset macro strategy and global economic analysis', ['GDP nowcasting', 'Leading indicator aggregation']),
  traderAgent('FIN-TRADER-060', 'Fed Watcher', 'Federal Reserve Policy Analyst', 'MACRO', 'Federal Reserve policy analysis, meeting previews, and statement parsing', ['Dot plot analysis', 'Hawkish/dovish sentiment scoring']),
  traderAgent('FIN-TRADER-061', 'Economic Data', 'Economic Release Analyst', 'MACRO', 'NFP, CPI, PPI, retail sales, and high-frequency economic data', ['Data surprise modeling', 'Market reaction prediction']),
  traderAgent('FIN-TRADER-062', 'Geopolitical', 'Geopolitical Risk Analyst', 'MACRO', 'Geopolitical risk events and their market impact', ['Conflict escalation probability', 'Sanctions impact modeling']),
  traderAgent('FIN-TRADER-063', 'Currency Analyst', 'Foreign Exchange Analyst', 'MACRO', 'USD, EUR, GBP, JPY, and emerging market currencies', ['Carry trade analysis', 'PPP divergence tracking']),
  traderAgent('FIN-TRADER-064', 'Volatility', 'Volatility and VIX Strategist', 'MACRO', 'VIX analysis, volatility surface, and options-implied signals', ['Term structure analysis', 'Skew interpretation']),
  traderAgent('FIN-TRADER-065', 'Flow Analyst', 'Market Flow and Positioning Analyst', 'MACRO', 'Institutional flow data, COT reports, and dark pool activity', ['Flow momentum scoring', 'Smart money tracking']),
  traderAgent('FIN-TRADER-066', 'Correlation', 'Cross-Asset Correlation Analyst', 'MACRO', 'Inter-market correlations and regime detection', ['Correlation breakdown detection', 'Regime change signals']),
  traderAgent('FIN-TRADER-067', 'Allocation', 'Strategic Asset Allocation Optimizer', 'MACRO', 'Portfolio-level allocation across equities, bonds, commodities, real estate, and cash', ['Efficient frontier optimization', 'Risk parity modeling']),
  traderAgent('FIN-TRADER-068', 'Recession Watch', 'Recession Probability Monitor', 'MACRO', 'Recession indicator monitoring and economic cycle positioning', ['Yield curve inversion tracking', 'LEI composite scoring']),
];

// ── Risk & Compliance Desk (10 agents) ────────────────────────────────────

const RISK_DESK = [
  traderAgent('FIN-TRADER-069', 'Risk Commander', 'Portfolio Risk Manager', 'RISK', 'Enterprise portfolio risk management and exposure monitoring', ['Value-at-Risk modeling', 'Stress test execution']),
  traderAgent('FIN-TRADER-070', 'Position Sizer', 'Position Sizing and Kelly Criterion', 'RISK', 'Optimal position sizing using Kelly Criterion and risk budgeting', ['Kelly fraction calculation', 'Drawdown-adjusted sizing']),
  traderAgent('FIN-TRADER-071', 'Stop Loss', 'Stop-Loss and Risk Exit Manager', 'RISK', 'Dynamic stop-loss management and risk exit execution', ['Trailing stop optimization', 'Volatility-adjusted exits']),
  traderAgent('FIN-TRADER-072', 'Sector Balance', 'Sector Exposure Balancer', 'RISK', 'Sector concentration monitoring and rebalancing signals', ['Concentration risk alerts', 'Sector weight optimization']),
  traderAgent('FIN-TRADER-073', 'Drawdown Guard', 'Maximum Drawdown Protection', 'RISK', 'Portfolio drawdown monitoring and circuit breaker triggers', ['Real-time drawdown tracking', 'Recovery analysis']),
  traderAgent('FIN-TRADER-074', 'Tax Optimizer', 'Tax-Loss Harvesting Optimizer', 'RISK', 'Tax-loss harvesting opportunities and wash sale compliance', ['Harvest opportunity identification', 'Wash sale prevention']),
  traderAgent('FIN-TRADER-075', 'Performance', 'Portfolio Performance Attribution', 'RISK', 'Performance attribution by sector, strategy, and timeframe', ['Alpha/beta decomposition', 'Benchmark relative analysis']),
  traderAgent('FIN-TRADER-076', 'Compliance', 'Trading Compliance Monitor', 'RISK', 'Trading rule compliance, regulatory adherence, and audit trail', ['Pattern day trading monitoring', 'Regulatory filing tracking']),
  traderAgent('FIN-TRADER-077', 'Report Generator', 'Investor and CEO Trade Reporting', 'RISK', 'Automated trade reporting for CEO and investor transparency', ['Daily P&L reporting', 'Monthly performance summary']),
  traderAgent('FIN-TRADER-078', 'Liquidity Monitor', 'Market Liquidity Analyst', 'RISK', 'Bid-ask spread monitoring and liquidity risk assessment', ['Liquidity scoring', 'Market impact estimation']),
];

// ── Combined Fleet Export ─────────────────────────────────────────────────

export const TRADER_FLEET = [
  ...REIT_DESK,
  ...PROPTECH_DESK,
  ...AI_TECH_DESK,
  ...ETF_INDEX_DESK,
  ...FIXED_INCOME_DESK,
  ...COMMODITIES_DESK,
  ...MACRO_DESK,
  ...RISK_DESK,
];

export const TRADER_DESKS = {
  REIT: { name: 'REIT Desk', agents: REIT_DESK.length, lead: 'FIN-TRADER-002' },
  PROPTECH: { name: 'PropTech Desk', agents: PROPTECH_DESK.length, lead: 'FIN-TRADER-014' },
  AI_TECH: { name: 'AI/Tech Desk', agents: AI_TECH_DESK.length, lead: 'FIN-TRADER-024' },
  ETF_INDEX: { name: 'ETF/Index Desk', agents: ETF_INDEX_DESK.length, lead: 'FIN-TRADER-036' },
  FIXED_INCOME: { name: 'Fixed Income Desk', agents: FIXED_INCOME_DESK.length, lead: 'FIN-TRADER-044' },
  COMMODITIES: { name: 'Commodities Desk', agents: COMMODITIES_DESK.length, lead: 'FIN-TRADER-052' },
  MACRO: { name: 'Macro Strategy Desk', agents: MACRO_DESK.length, lead: 'FIN-TRADER-059' },
  RISK: { name: 'Risk & Compliance Desk', agents: RISK_DESK.length, lead: 'FIN-TRADER-069' },
};

// Total: 77 agents (FIN-TRADER-002 through FIN-TRADER-078)
// Combined with FIN-TRADER-001 (Apex Trader) = 78 total trader agents
