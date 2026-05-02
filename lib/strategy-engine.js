/**
 * Coastal Key — Chief Strategy Architect Engine
 * Enterprise Transformation Blueprint v5.0 — Board of Record
 *
 * Encodes the full Blueprint as executable infrastructure:
 *   - 5-pillar maturity scoring (benchmarked against Fortune 500)
 *   - 15 prioritized transformation initiatives across 3 horizons
 *   - 20 Board-level KPIs with targets and review cadence
 *   - Top-10 enterprise risk register with owners and mitigations
 *   - 10 CEO 90-day execution commitments with evidence gates
 *   - 47-task automated operating cadence (hourly → annual)
 *   - Capital allocation framework with 6 categories
 *
 * Authority: Office of the CEO, David Hauer
 * Classification: Board and Executive Council Only
 * Benchmarked: McKinsey, Bain, BCG, Fortune 500 specialty-services
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const STRATEGY_LOG = path.join(DATA_DIR, 'strategy-log.json');

const MATURITY_PILLARS = [
  { id: 'governance', name: 'Governance and Risk', current: 2.0, target: 4.5, gap: 'No independent Board, no formal risk register, no SOC-equivalent controls, key-person dependency', initiatives: [1, 2, 13] },
  { id: 'operations', name: 'Operational Excellence', current: 2.5, target: 4.5, gap: 'Manual dispatch, no enforced SLA framework, no closed-loop QA, no route density optimization', initiatives: [5, 6, 8] },
  { id: 'revenue', name: 'Revenue and Client Economics', current: 2.5, target: 4.5, gap: 'Concentrated client base, cost-plus pricing, no formal cross-sell motion, NRR not measured', initiatives: [4, 7, 11] },
  { id: 'innovation', name: 'Innovation and Technology', current: 2.0, target: 4.5, gap: 'No unified data platform, no predictive analytics, Sentinel IP not yet productized at scale', initiatives: [2, 3, 8, 15] },
  { id: 'brand', name: 'Brand and Market Leadership', current: 3.0, target: 4.5, gap: 'Regional recognition only, no thought-leadership engine, no earned-media cadence', initiatives: [9, 12] },
];

function getMaturityScore() {
  const composite = MATURITY_PILLARS.reduce((sum, p) => sum + p.current, 0) / MATURITY_PILLARS.length;
  const targetComposite = MATURITY_PILLARS.reduce((sum, p) => sum + p.target, 0) / MATURITY_PILLARS.length;
  return { pillars: MATURITY_PILLARS, composite: Math.round(composite * 10) / 10, target: Math.round(targetComposite * 10) / 10, delta: Math.round((targetComposite - composite) * 10) / 10, benchmark: 'Fortune 500 top-decile specialty-services' };
}

const INITIATIVES = [
  { id: 1, horizon: 1, name: 'Governance Charter and Advisory Board', milestone: 'Charter ratified, three advisors seated, DOA matrix published', impact: 'high', effort: 'low', status: 'not_started', pillar: 'governance' },
  { id: 2, horizon: 1, name: 'Sovereign Data Platform v1', milestone: 'Warehouse with daily refresh from CRM, QB, inspection, vendor', impact: 'very_high', effort: 'medium', status: 'not_started', pillar: 'innovation' },
  { id: 3, horizon: 1, name: 'Sentinel Standard IP Protection', milestone: 'Trademark filings, methodology manual v1, copyright registrations', impact: 'very_high', effort: 'low', status: 'not_started', pillar: 'innovation' },
  { id: 4, horizon: 1, name: 'Tiered Pricing Architecture', milestone: 'Three-tier grid published, migration plan, objection playbook', impact: 'high', effort: 'low', status: 'not_started', pillar: 'revenue' },
  { id: 5, horizon: 1, name: 'SLA Framework and Escalation', milestone: 'SLA clocks live, breach alerts routed, weekly scorecard', impact: 'high', effort: 'medium', status: 'not_started', pillar: 'operations' },
  { id: 6, horizon: 2, name: 'Closed-Loop Quality System', milestone: '10% sampled audits, RCA log, FTF rate above 95%', impact: 'high', effort: 'medium', status: 'not_started', pillar: 'operations' },
  { id: 7, horizon: 2, name: 'Cross-Sell and Attach Program', milestone: 'Five services live, playbook deployed, 1.5 attach by M12', impact: 'high', effort: 'medium', status: 'not_started', pillar: 'revenue' },
  { id: 8, horizon: 2, name: 'Predictive Risk Intelligence', milestone: 'Storm, claim, churn models with quarterly backtest', impact: 'high', effort: 'high', status: 'not_started', pillar: 'innovation' },
  { id: 9, horizon: 2, name: 'Coastal Key Institute', milestone: 'Two reports published, one earned media per quarter', impact: 'medium', effort: 'medium', status: 'not_started', pillar: 'brand' },
  { id: 10, horizon: 2, name: 'Cybersecurity and SOC 2 Readiness', milestone: 'Baseline scan, MFA universal, gap remediation in flight', impact: 'medium', effort: 'medium', status: 'not_started', pillar: 'governance' },
  { id: 11, horizon: 3, name: 'Acquisition Readiness', milestone: 'QoE, audited financials, data room, 85% diligence readiness', impact: 'very_high', effort: 'high', status: 'not_started', pillar: 'revenue' },
  { id: 12, horizon: 3, name: 'Geographic Expansion Playbook', milestone: 'Documented model, one adjacent FL market piloted by M24', impact: 'high', effort: 'high', status: 'not_started', pillar: 'brand' },
  { id: 13, horizon: 3, name: 'Enterprise Risk Management Program', milestone: 'Quarterly register, tabletop exercises for storm, cyber, key-person', impact: 'high', effort: 'medium', status: 'not_started', pillar: 'governance' },
  { id: 14, horizon: 3, name: 'Talent and Succession Architecture', milestone: 'Scorecards every role, two successors per critical role', impact: 'high', effort: 'medium', status: 'not_started', pillar: 'governance' },
  { id: 15, horizon: 3, name: 'Sentinel Certification and Licensing', milestone: 'Ten certified operators, licensing revenue, annual audit', impact: 'very_high', effort: 'high', status: 'not_started', pillar: 'innovation' },
];

const KPI_COCKPIT = [
  { category: 'financial', kpi: 'EBITDA Margin', current: '18-24%', target: '32%', cadence: 'monthly' },
  { category: 'financial', kpi: 'Recurring Revenue Share', current: '60-70%', target: '85%', cadence: 'monthly' },
  { category: 'financial', kpi: 'Net Revenue Retention', current: 'Not measured', target: '110%', cadence: 'quarterly' },
  { category: 'financial', kpi: 'Days Sales Outstanding', current: 'Unknown', target: '<30 days', cadence: 'monthly' },
  { category: 'financial', kpi: 'Gross Margin by Service Line', current: 'Unknown', target: '>55%', cadence: 'quarterly' },
  { category: 'client', kpi: 'Logo Retention', current: '~88%', target: '95%', cadence: 'quarterly' },
  { category: 'client', kpi: 'Net Promoter Score', current: 'Not measured', target: '70+', cadence: 'quarterly' },
  { category: 'client', kpi: 'Attach Rate per Account', current: '<1.0', target: '2.0+', cadence: 'quarterly' },
  { category: 'operations', kpi: 'First-Time-Fix Rate', current: '~85%', target: '95%', cadence: 'weekly' },
  { category: 'operations', kpi: 'Inspection SLA Compliance', current: 'Not measured', target: '98%', cadence: 'weekly' },
  { category: 'operations', kpi: 'Vendor Reliability Score', current: 'Not measured', target: '95%', cadence: 'monthly' },
  { category: 'operations', kpi: 'Avg Drive Time per Inspection', current: 'Unknown', target: '<18 min', cadence: 'weekly' },
  { category: 'risk', kpi: 'Top-10 Risks with Owners', current: '0', target: '10', cadence: 'quarterly' },
  { category: 'risk', kpi: 'Insurance Dispute Rate', current: 'Unknown', target: '<2%', cadence: 'quarterly' },
  { category: 'risk', kpi: 'MFA Coverage', current: 'Partial', target: '100%', cadence: 'monthly' },
  { category: 'brand', kpi: 'Share of Voice (Regional)', current: 'Unknown', target: 'Top 3', cadence: 'quarterly' },
  { category: 'brand', kpi: 'Earned Media Placements', current: 'Unknown', target: '12/year', cadence: 'quarterly' },
  { category: 'innovation', kpi: 'Sentinel Certified Operators', current: '0', target: '10 by M18', cadence: 'quarterly' },
  { category: 'innovation', kpi: 'Data Quality Score', current: 'Unknown', target: '>98%', cadence: 'monthly' },
  { category: 'people', kpi: 'Critical Roles with 2 Successors', current: '0%', target: '100%', cadence: 'quarterly' },
];

const RISK_REGISTER = [
  { id: 'R1', risk: 'Major named storm landfall during season', likelihood: 'high', impact: 'high', mitigation: 'Pre-season hardening, post-storm SLA runbook, insurance rebid, weather feed automation' },
  { id: 'R2', risk: 'Key-person dependency on CEO', likelihood: 'high', impact: 'very_high', mitigation: 'DOA matrix, Advisory Board, COO hire path, documented SOPs, two-deep successors' },
  { id: 'R3', risk: 'Sentinel Standard IP leakage or imitation', likelihood: 'medium', impact: 'high', mitigation: 'Trademark filings, NDAs, IP watch automation, certification program' },
  { id: 'R4', risk: 'Client concentration in top accounts', likelihood: 'medium', impact: 'high', mitigation: 'Cross-sell attach, tiered pricing, active mid-market pipeline' },
  { id: 'R5', risk: 'Regulatory or licensing lapse', likelihood: 'low', impact: 'high', mitigation: 'Monthly compliance automation, calendar alerts, insurance register' },
  { id: 'R6', risk: 'Cyber incident or ransomware', likelihood: 'medium', impact: 'high', mitigation: 'MFA, backups, SOC 2 roadmap, tabletop exercises' },
  { id: 'R7', risk: 'Vendor reliability failure on high-stakes asset', likelihood: 'medium', impact: 'medium', mitigation: 'Vendor scorecard, monthly reviews, dual-source critical trades' },
  { id: 'R8', risk: 'Insurance dispute escalating to litigation', likelihood: 'low', impact: 'high', mitigation: 'Sentinel documentation, counsel review, early-engagement protocol' },
  { id: 'R9', risk: 'Data quality drift in sovereign warehouse', likelihood: 'medium', impact: 'medium', mitigation: 'Monthly data quality score, pipeline monitors, owner accountability' },
  { id: 'R10', risk: 'Macroeconomic downturn impacting luxury owners', likelihood: 'medium', impact: 'medium', mitigation: 'Recurring revenue focus, scenario cash forecasting, reserve policy' },
];

const EXECUTION_COMMITMENTS = [
  { day: 15, commitment: 'Ratify Governance Charter draft', deliverable: 'Charter v1 and DOA matrix', owner: 'CEO + Counsel', evidence: 'Signed charter on file' },
  { day: 30, commitment: 'Seat Advisory Board', deliverable: 'Three advisors with engagement letters', owner: 'CEO', evidence: 'Signed engagement letters' },
  { day: 30, commitment: 'Stand up Sovereign Data Platform v1', deliverable: 'Warehouse with daily refresh', owner: 'CEO + Data Lead', evidence: 'Refresh log evidence' },
  { day: 45, commitment: 'File Sentinel trademark applications', deliverable: 'USPTO filings submitted', owner: 'CEO + IP Counsel', evidence: 'Filing receipts' },
  { day: 60, commitment: 'Publish tiered pricing grid', deliverable: 'Three-tier pricing document', owner: 'CEO + Revenue Lead', evidence: 'Published grid' },
  { day: 60, commitment: 'Deploy SLA framework and breach alerts', deliverable: 'Live breach alerting', owner: 'Ops Lead', evidence: 'Alert logs' },
  { day: 75, commitment: 'Launch closed-loop QA pilot', deliverable: '10% sampling live', owner: 'Ops Lead + QA', evidence: 'RCA log' },
  { day: 90, commitment: 'First Advisory Board meeting held', deliverable: 'Board pack and minutes', owner: 'CEO + Chair', evidence: 'Signed minutes' },
  { day: 90, commitment: 'Launch Coastal Key Institute charter', deliverable: 'Research calendar v1', owner: 'CEO + Brand Lead', evidence: 'Published charter' },
  { day: 90, commitment: 'First monthly close with Board pack', deliverable: 'Audit-ready pack', owner: 'CFO function', evidence: 'Pack delivered BD10' },
];

const OPERATING_CADENCE = {
  hourly: [
    { id: 1, task: 'Sentinel Inspection Ingestion Watcher', system: 'Retell, Airtable, Slack', metric: 'Zero backlog over 4h' },
    { id: 2, task: 'Weather and Storm Feed Monitor', system: 'Cloudflare Worker, Slack', metric: 'Alert within 15m of watch' },
    { id: 3, task: 'Critical Alert Email and SMS Triage', system: 'Gmail, Slack, CRM', metric: '100% Tier-1 ack under 60m' },
    { id: 4, task: 'Gateway Health Heartbeat', system: 'Cloudflare Worker', metric: 'Uptime above 99.9%' },
    { id: 5, task: 'Inbound Lead Router', system: 'CRM, AI Router', metric: 'Response SLA under 60m' },
  ],
  daily: [
    { id: 6, task: '0630 ET Executive Briefing', system: 'QB, CRM, Inspection DB', metric: 'Delivered on time 99%' },
    { id: 7, task: '0500 ET Route Optimization Pass', system: 'Route Engine', metric: 'Drive time under 18m' },
    { id: 8, task: 'Cash and AR Aging Sync', system: 'QuickBooks', metric: 'DSO under 30 days' },
    { id: 9, task: 'Inspection QA Sampling', system: 'Inspection DB', metric: '100% sample rate' },
    { id: 10, task: 'Vendor Work Order SLA Sweep', system: 'CRM, Slack', metric: 'Zero unescalated breaches' },
    { id: 11, task: 'Security and Access Review', system: 'IdP, Logs', metric: 'Zero unreviewed anomalies' },
    { id: 12, task: 'Social Listening Brief', system: 'Listening Stack', metric: 'Sub-4-star plan under 12h' },
    { id: 13, task: 'Daily Skills Marketplace Health', system: 'Skills Marketplace', metric: '100% healthy' },
    { id: 14, task: 'Daily Slack Operations Digest', system: 'Slack, Ops Warehouse', metric: 'Posted on time 99%' },
    { id: 15, task: 'Daily Client Communications Audit', system: 'CRM, Gmail', metric: 'Zero orphan threads' },
  ],
  weekly: [
    { id: 16, task: 'Monday Pipeline and Revenue Pack', system: 'CRM, QB', metric: 'Delivered by 0800 Monday' },
    { id: 17, task: 'Friday Operations Scorecard', system: 'Ops Warehouse', metric: 'All KPIs RAG-coded' },
    { id: 18, task: 'Weekly Risk Register Delta', system: 'ERM System', metric: 'Zero red-tier items 2w' },
    { id: 19, task: 'Weekly Brand and Content Audit', system: 'CMS, Listening', metric: 'One artifact per week' },
    { id: 20, task: 'Competitive Intelligence Sweep', system: 'CI Automation', metric: 'One-pager with flags' },
    { id: 21, task: '13-Week Rolling Cash Forecast', system: 'QB, Contracts', metric: 'Variance under 5% 4w' },
    { id: 22, task: 'Weekly Sentinel IP Watch', system: 'IP Watch Tool', metric: 'Zero unaddressed hits' },
    { id: 23, task: 'Weekly Insurance Claims Watch', system: 'Policy Register', metric: 'Zero stale claims 14d' },
    { id: 24, task: 'Weekly Learning and Enablement Push', system: 'LMS', metric: 'Completion above 95%' },
  ],
  monthly: [
    { id: 25, task: 'Monthly Financial Close and Board Pack', system: 'QB, BI', metric: 'Close BD7, pack BD10' },
    { id: 26, task: 'Monthly Compliance and License Review', system: 'Compliance DB', metric: 'Zero expired items' },
    { id: 27, task: 'Monthly Contract Drift Review', system: 'CLM', metric: '100% on template 30d' },
    { id: 28, task: 'Monthly Client Health Scorecard', system: 'CRM, QB, Inspection', metric: 'No Tier-1 red 30d+' },
    { id: 29, task: 'Monthly Talent and Performance Review', system: 'HRIS, Inspection DB', metric: 'Written feedback logged' },
    { id: 30, task: 'Monthly Cybersecurity Posture', system: 'Security Stack', metric: '100% MFA, verified backup' },
    { id: 31, task: 'Monthly NRR and Attach Analysis', system: 'CRM, QB', metric: 'NRR trending to 110%' },
    { id: 32, task: 'Monthly Vendor Performance Review', system: 'CRM, Vendor DB', metric: 'Reliability above 95%' },
    { id: 33, task: 'Monthly Brand Equity Report', system: 'Listening Stack', metric: 'Regional top-three trend' },
  ],
  quarterly: [
    { id: 34, task: 'Quarterly Advisory Board Pack', system: 'Board Pack Builder', metric: 'Delivered 10 BD pre-meeting' },
    { id: 35, task: 'Quarterly Enterprise Risk Refresh', system: 'ERM System', metric: 'Top-10 revalidated' },
    { id: 36, task: 'Quarterly Pricing and Margin Review', system: 'QB, CRM', metric: 'Gross margin above 55%' },
    { id: 37, task: 'Quarterly Insurance and Legal Review', system: 'Policy Register, CLM', metric: 'Zero material gaps' },
    { id: 38, task: 'Quarterly Coastal Key Institute Release', system: 'CMS, Institute', metric: 'Within 5 BD of quarter close' },
    { id: 39, task: 'Quarterly Predictive Model Backtest', system: 'Data Platform', metric: 'Precision/recall above target' },
    { id: 40, task: 'Quarterly Talent Depth Review', system: 'HRIS', metric: '100% coverage' },
  ],
  annual: [
    { id: 41, task: 'Annual Strategic Plan Refresh', system: 'Strategy Tracker', metric: 'Ratified within 90d of FYE' },
    { id: 42, task: 'Annual Sentinel Methodology Audit', system: 'Institute, CLM', metric: 'Versioned Board-ratified doc' },
    { id: 43, task: 'Annual Business Continuity Tabletop', system: 'ERM System', metric: 'AAR with 60d closure' },
    { id: 44, task: 'Annual Cybersecurity Audit (SOC 2)', system: 'Security Stack', metric: 'Clean audit opinion' },
    { id: 45, task: 'Annual Compensation and Equity Review', system: 'HRIS', metric: 'Bands refreshed' },
    { id: 46, task: 'Annual Insurance Program Rebid', system: 'Broker, Policy Register', metric: 'Coverage maintained, premium flat/down' },
    { id: 47, task: 'Annual Client Voice Program', system: 'CX Stack', metric: 'NPS above 70' },
  ],
};

const CAPITAL_ALLOCATION = [
  { category: 'Sovereign Data Platform and Automation', share: 30, rationale: 'Compounding operating leverage; foundation for every other initiative' },
  { category: 'Sentinel IP, Institute, and Certification', share: 20, rationale: 'Deepens moat; converts service into licensable standard' },
  { category: 'Quality, Safety, and Cybersecurity', share: 15, rationale: 'Reduces downside; required for SOC 2 and insurer trust' },
  { category: 'Sales and Cross-Sell Enablement', share: 15, rationale: 'Drives NRR to 110% and recurring share to 85%' },
  { category: 'Talent, Succession, and Leadership', share: 10, rationale: 'Eliminates key-person risk; enables growth' },
  { category: 'Strategic Reserve and M&A Optionality', share: 10, rationale: 'Preserves dry powder for adjacent-market entry or tuck-ins' },
];

const VALUE_CREATION = {
  timeframe: '24 months',
  targets: { recurringRevenue: '85%+', ebitdaMargin: '32%', netRevenueRetention: '110%+', soc2: 'Type II attestation on file', succession: 'Two successors per critical role', sentinelCertified: '10 operators', geoExpansion: 'One adjacent FL market piloted' },
  multipleExpansion: '7x-9x EBITDA on specialty-services comparables',
  hypothesis: 'Double enterprise value within 24 months through margin expansion, mix shift to recurring, and Sentinel licensing option',
};

function groupBy(arr, key) { return arr.reduce((acc, item) => { const g = item[key]; if (!acc[g]) acc[g] = []; acc[g].push(item); return acc; }, {}); }

function getBlueprint() {
  return {
    version: '5.0', classification: 'Board and Executive Council Only', sponsor: 'Office of the CEO, David Hauer', dateOfRecord: '2026-04-22',
    benchmarks: ['McKinsey', 'Bain', 'BCG', 'Fortune 500 specialty-services'],
    maturity: getMaturityScore(),
    initiatives: { total: INITIATIVES.length, byHorizon: { h1: INITIATIVES.filter(i => i.horizon === 1), h2: INITIATIVES.filter(i => i.horizon === 2), h3: INITIATIVES.filter(i => i.horizon === 3) }, all: INITIATIVES },
    kpiCockpit: { total: KPI_COCKPIT.length, byCategory: groupBy(KPI_COCKPIT, 'category'), all: KPI_COCKPIT },
    riskRegister: { total: RISK_REGISTER.length, topRisks: RISK_REGISTER },
    executionCommitments: { total: EXECUTION_COMMITMENTS.length, commitments: EXECUTION_COMMITMENTS },
    operatingCadence: { totalTasks: Object.values(OPERATING_CADENCE).flat().length, cadence: OPERATING_CADENCE },
    capitalAllocation: CAPITAL_ALLOCATION, valueCreation: VALUE_CREATION,
  };
}

function getInitiatives(horizon) { return horizon ? INITIATIVES.filter(i => i.horizon === Number(horizon)) : INITIATIVES; }
function getRiskRegister() { return RISK_REGISTER; }
function getKPICockpit(category) { return category ? KPI_COCKPIT.filter(k => k.category === category) : KPI_COCKPIT; }
function getOperatingCadence(frequency) { return (frequency && OPERATING_CADENCE[frequency]) ? OPERATING_CADENCE[frequency] : OPERATING_CADENCE; }

function getExecutionTracker() {
  const today = new Date();
  const startDate = new Date('2026-04-22');
  const daysSinceStart = Math.max(0, Math.floor((today - startDate) / (24 * 60 * 60 * 1000)));
  return EXECUTION_COMMITMENTS.map(c => ({
    ...c,
    dueDate: new Date(startDate.getTime() + c.day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: daysSinceStart >= c.day ? 'due' : 'upcoming',
    daysRemaining: Math.max(0, c.day - daysSinceStart),
  }));
}

function getBoardBriefing() {
  const maturity = getMaturityScore();
  const tracker = getExecutionTracker();
  const dueItems = tracker.filter(t => t.status === 'due');
  const upcomingItems = tracker.filter(t => t.status === 'upcoming').slice(0, 3);
  return {
    generatedAt: new Date().toISOString(), type: 'BOARD_BRIEFING', classification: 'Board and Executive Council Only',
    maturityComposite: maturity.composite, maturityTarget: maturity.target, maturityDelta: maturity.delta,
    initiativeCount: INITIATIVES.length, horizonOneComplete: INITIATIVES.filter(i => i.horizon === 1 && i.status === 'complete').length, horizonOneTotal: INITIATIVES.filter(i => i.horizon === 1).length,
    kpiCount: KPI_COCKPIT.length, riskCount: RISK_REGISTER.length, cadenceTaskCount: Object.values(OPERATING_CADENCE).flat().length,
    executionCommitments: { due: dueItems.length, upcoming: upcomingItems.length, total: EXECUTION_COMMITMENTS.length },
    capitalAllocation: CAPITAL_ALLOCATION, valueCreation: VALUE_CREATION,
    nextActions: dueItems.concat(upcomingItems).map(t => `[D${t.day}] ${t.commitment}`),
  };
}

module.exports = { getBlueprint, getMaturityScore, getInitiatives, getRiskRegister, getKPICockpit, getOperatingCadence, getExecutionTracker, getBoardBriefing, MATURITY_PILLARS, INITIATIVES, KPI_COCKPIT, RISK_REGISTER, EXECUTION_COMMITMENTS, OPERATING_CADENCE, CAPITAL_ALLOCATION, VALUE_CREATION };
