/**
 * Cash Flow Production Engine — Enterprise Revenue Operations
 *
 * The CFP division drives cash flow velocity across every revenue stream.
 * 9 squads. 46 agents. One mandate: financial dominance.
 *
 * Squads:
 *   1. Revenue Intelligence
 *   2. Lead Conversion
 *   3. Client Growth
 *   4. Property Revenue
 *   5. Booking Optimization
 *   6. Campaign Monetization
 *   7. Investor Relations
 *   8. Cost Control
 *   9. Financial Reporting
 */

import { inference } from './anthropic.js';
import { createRecord, listRecords, TABLES } from './airtable.js';
import { sendDelegationSlack } from './integrations.js';

// ── Squad Configuration ──

const SQUADS = [
  { id: 1, name: 'Revenue Intelligence', agents: ['CFP-001', 'CFP-002', 'CFP-003', 'CFP-004', 'CFP-005'], focus: 'Pipeline analysis, revenue forecasting, market pricing signals' },
  { id: 2, name: 'Lead Conversion', agents: ['CFP-006', 'CFP-007', 'CFP-008', 'CFP-009', 'CFP-010'], focus: 'Lead qualification, conversion acceleration, follow-up automation' },
  { id: 3, name: 'Client Growth', agents: ['CFP-011', 'CFP-012', 'CFP-013', 'CFP-014', 'CFP-015'], focus: 'Upsell identification, retention strategy, lifetime value expansion' },
  { id: 4, name: 'Property Revenue', agents: ['CFP-016', 'CFP-017', 'CFP-018', 'CFP-019', 'CFP-020'], focus: 'Vacancy elimination, rate optimization, ancillary revenue' },
  { id: 5, name: 'Booking Optimization', agents: ['CFP-021', 'CFP-022', 'CFP-023', 'CFP-024', 'CFP-025'], focus: 'Occupancy maximization, dynamic pricing, gap filling' },
  { id: 6, name: 'Campaign Monetization', agents: ['CFP-026', 'CFP-027', 'CFP-028', 'CFP-029', 'CFP-030'], focus: 'Campaign ROI, ad spend optimization, conversion tracking' },
  { id: 7, name: 'Investor Relations', agents: ['CFP-031', 'CFP-032', 'CFP-033', 'CFP-034', 'CFP-035'], focus: 'Investor pipeline, presentation ROI, capital deployment' },
  { id: 8, name: 'Cost Control', agents: ['CFP-036', 'CFP-037', 'CFP-038', 'CFP-039', 'CFP-040'], focus: 'Expense reduction, vendor negotiation, margin protection' },
  { id: 9, name: 'Financial Reporting', agents: ['CFP-041', 'CFP-042', 'CFP-043', 'CFP-044', 'CFP-045', 'CFP-046'], focus: 'P&L dashboards, cash flow statements, KPI tracking' },
];

const CASHFLOW_SYSTEM = `You are the Cash Flow Production Engine for Coastal Key Treasure Coast Asset Management. You report to David Hauer, Founder and CEO. You think and operate like a Fortune 500 CFO.

YOUR MANDATE: Revenue generation. Cash flow velocity. Financial dominance. Every dollar tracked. Every leak sealed. Every opportunity quantified.

OPERATING PRINCIPLES:
1. Revenue is oxygen. Without it, nothing else matters.
2. Cash conversion cycle must shrink every quarter.
3. Every lead has a dollar value. Every vacancy has a cost.
4. Client lifetime value compounds. Protect and expand it.
5. Cost per acquisition must decrease while close rate increases.
6. Occupancy rate is the single most important operational metric.
7. Maintenance response time directly impacts retention revenue.
8. Campaign ROI must be measured in dollars, not impressions.
9. Agent fleet utilization drives operational leverage.
10. Monthly recurring revenue is the foundation of enterprise value.

VOICE: Authoritative. Precise. Institutional. 9th-grade English. Short sentences. No em dashes. No exclamation points. No cheesy quotes. Truth over convenience. Numbers over narratives.`;

const SQUAD_PROMPTS = {
  1: 'You are Squad 1: Revenue Intelligence. Analyze pipeline data, forecast revenue, and identify pricing signals. Produce quantified intelligence with dollar amounts.',
  2: 'You are Squad 2: Lead Conversion. Evaluate lead quality, conversion bottlenecks, and follow-up gaps. Every unconverted lead is lost revenue. Quantify it.',
  3: 'You are Squad 3: Client Growth. Identify upsell opportunities, retention risks, and lifetime value expansion paths. Existing clients are the cheapest revenue.',
  4: 'You are Squad 4: Property Revenue. Eliminate vacancy, optimize rates, and identify ancillary revenue streams. Every empty unit is burning cash.',
  5: 'You are Squad 5: Booking Optimization. Maximize occupancy, deploy dynamic pricing, and fill calendar gaps. Revenue per available night is the metric.',
  6: 'You are Squad 6: Campaign Monetization. Measure campaign ROI in dollars. Cut underperformers. Scale winners. Ad spend without conversion data is waste.',
  7: 'You are Squad 7: Investor Relations. Strengthen investor pipeline, optimize presentation impact, and accelerate capital deployment. Capital is fuel.',
  8: 'You are Squad 8: Cost Control. Reduce expenses, negotiate vendor terms, and protect margins. Revenue means nothing if costs consume it.',
  9: 'You are Squad 9: Financial Reporting. Produce P&L clarity, cash flow statements, and KPI dashboards. What gets measured gets managed.',
};

// ── Mandatory Enterprise Metrics ──

const ENTERPRISE_METRICS = [
  { id: 'rpm', name: 'Revenue Pipeline Value', unit: 'USD', source: 'LEADS', description: 'Total estimated value of all active leads in pipeline' },
  { id: 'ccc', name: 'Cash Conversion Cycle', unit: 'days', source: 'BOOKINGS', description: 'Average days from lead capture to first revenue receipt' },
  { id: 'clv', name: 'Client Lifetime Value', unit: 'USD', source: 'CLIENTS', description: 'Average total revenue per client over relationship lifetime' },
  { id: 'cpa', name: 'Cost Per Acquisition', unit: 'USD', source: 'SALES_CAMPAIGNS', description: 'Average marketing and sales cost to acquire one client' },
  { id: 'mrr', name: 'Monthly Recurring Revenue', unit: 'USD', source: 'CLIENTS', description: 'Predictable monthly revenue from active management contracts' },
  { id: 'occ', name: 'Occupancy Rate', unit: '%', source: 'PROPERTIES', description: 'Percentage of available units currently occupied or booked' },
  { id: 'mrt', name: 'Maintenance Response Time', unit: 'hours', source: 'MAINTENANCE_REQUESTS', description: 'Average time from maintenance request to resolution' },
  { id: 'ltc', name: 'Lead-to-Close Ratio', unit: '%', source: 'LEADS', description: 'Percentage of leads that convert to paying clients' },
  { id: 'afu', name: 'Agent Fleet Utilization', unit: '%', source: 'TASKS', description: 'Percentage of agent capacity currently deployed on active tasks' },
  { id: 'croi', name: 'Campaign ROI', unit: 'x', source: 'SALES_CAMPAIGNS', description: 'Revenue generated per dollar spent on campaigns' },
];

/**
 * Run a full cash flow health scan across all revenue-related tables.
 * Produces a comprehensive cash flow health report via Claude inference.
 */
export async function runCashFlowScan(env, ctx) {
  const timestamp = new Date().toISOString();

  const tablesToScan = [
    { key: 'leads', table: TABLES.LEADS },
    { key: 'clients', table: TABLES.CLIENTS },
    { key: 'properties', table: TABLES.PROPERTIES },
    { key: 'bookings', table: TABLES.BOOKINGS },
    { key: 'salesCampaigns', table: TABLES.SALES_CAMPAIGNS },
    { key: 'investorPresentations', table: TABLES.INVESTOR_PRESENTATIONS },
    { key: 'maintenanceRequests', table: TABLES.MAINTENANCE_REQUESTS },
    { key: 'tasks', table: TABLES.TASKS },
  ];

  const tableSamples = {};
  for (const { key, table } of tablesToScan) {
    try {
      const records = await listRecords(env, table, { maxRecords: 10 });
      tableSamples[key] = { count: records.length, status: records.length > 0 ? 'active' : 'empty' };
    } catch (err) {
      tableSamples[key] = { count: 0, status: 'error', error: err.message };
    }
  }

  const dataSummary = Object.entries(tableSamples)
    .map(([k, v]) => `${k}: ${v.count} records (${v.status})`)
    .join('\n');

  const aiResult = await inference(env, {
    system: CASHFLOW_SYSTEM,
    prompt: `CASH FLOW HEALTH SCAN at ${timestamp}

ENTERPRISE REVENUE DATA:
${dataSummary}

FLEET: 46 agents across 9 squads (Revenue Intelligence, Lead Conversion, Client Growth, Property Revenue, Booking Optimization, Campaign Monetization, Investor Relations, Cost Control, Financial Reporting)
INTEGRATIONS: Airtable (38 tables), Cloudflare Workers, Claude API, Retell AI, Slack

Analyze each revenue stream and produce:

1. REVENUE PIPELINE HEALTH: Score 1-10 with justification for each table scanned.
2. CASH FLOW VELOCITY: Where is money moving fast? Where is it stalled?
3. REVENUE LEAKS: Identify every point where revenue is being lost or left on the table.
4. GROWTH OPPORTUNITIES: Quantify each opportunity with estimated dollar impact.
5. SQUAD ASSIGNMENTS: Which squad owns which corrective action.
6. MANDATORY KPIs: Estimate current values for all 10 enterprise metrics.
7. 90-DAY REVENUE FORECAST: Based on current pipeline and conversion patterns.
8. TOP 5 PRIORITY ACTIONS: Ranked by financial impact. Numbered steps.`,
    tier: 'advanced',
    maxTokens: 4000,
    cacheKey: `cfp:scan:${Date.now() - (Date.now() % 3600000)}`,
    cacheTtl: 3600,
  });

  // Record to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `CFP: cashflow_scan - ${timestamp}`,
      'Module': { name: 'Cash Flow Production' },
      'Request Type': { name: 'cashflow_scan' },
      'Input Brief': dataSummary.slice(0, 10000),
      'Output Text': aiResult.content.slice(0, 10000),
      'Model Used': { name: aiResult.model },
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log write failed:', err))
  );

  // Record to Delegation Ops
  ctx.waitUntil(
    createRecord(env, TABLES.DELEGATION_OPS, {
      'Task Name': `CFP: Cash Flow Health Scan - ${timestamp}`,
      'Agent ID': 'CFP-001',
      'Agent Name': 'Revenue Commander',
      'Status': { name: 'Completed' },
      'Priority': { name: 'High' },
      'Category': { name: 'Cash Flow Production' },
      'Source Division': 'CFP',
      'Target Division': 'CFP',
      'Scan Results': aiResult.content.slice(0, 100000),
      'Created At': timestamp,
      'Resolved At': new Date().toISOString(),
      'Badge Clearance': { name: 'Enterprise Full Access' },
    }).catch(err => console.error('Delegation ops write failed:', err))
  );

  sendDelegationSlack(env, ctx, {
    agentId: 'CFP-001',
    agentName: 'Revenue Commander',
    action: 'Cash Flow Health Scan Complete',
    details: `${Object.keys(tableSamples).length} revenue tables scanned. Health report generated.`,
    priority: 'High',
  });

  return {
    engine: 'Cash Flow Production Engine',
    division: 'CFP',
    agentCount: 46,
    squads: SQUADS,
    tableSamples,
    cashFlowReport: aiResult.content,
    model: aiResult.model,
    cached: aiResult.cached,
    timestamp,
  };
}

/**
 * Execute a specific squad action.
 * Routes to Claude inference with squad-specific system prompts.
 */
export async function executeSquadAction(env, ctx, { squadId, agentId, action, context }) {
  const squad = SQUADS.find(s => s.id === squadId);
  if (!squad) {
    return { error: `Unknown squad: ${squadId}. Valid: 1-9.` };
  }

  const squadPrompt = SQUAD_PROMPTS[squadId];
  if (!squadPrompt) {
    return { error: `No prompt configured for squad ${squadId}.` };
  }

  const timestamp = new Date().toISOString();

  const aiResult = await inference(env, {
    system: `${CASHFLOW_SYSTEM}\n\n${squadPrompt}\nYou are operating as ${agentId} within Squad ${squad.id}: ${squad.name}.\nExecute with precision. Produce a deployable outcome, not a plan.`,
    prompt: `SQUAD: ${squad.name}
AGENT: ${agentId}
ACTION: ${action}
CONTEXT: ${context || 'Execute standard cash flow protocol.'}

Produce:
1. EXECUTED OUTCOME (not a plan, an outcome)
2. FINANCIAL IMPACT (quantified in dollars)
3. MEASURABLE PROOF of completion
4. NEXT ACTION in the revenue chain`,
    tier: 'advanced',
    maxTokens: 2500,
  });

  ctx.waitUntil(
    createRecord(env, TABLES.DELEGATION_OPS, {
      'Task Name': `CFP: Squad ${squad.id} - ${action}`,
      'Agent ID': agentId,
      'Agent Name': `CFP Squad ${squad.id}`,
      'Status': { name: 'Completed' },
      'Priority': { name: 'High' },
      'Category': { name: 'Cash Flow Production' },
      'Source Division': 'CFP',
      'Scan Results': aiResult.content.slice(0, 100000),
      'Created At': timestamp,
      'Resolved At': new Date().toISOString(),
      'Badge Clearance': { name: 'Enterprise Full Access' },
    }).catch(err => console.error('CFP ops write failed:', err))
  );

  return {
    squad: squad.name,
    squadId: squad.id,
    agentId,
    action,
    output: aiResult.content,
    model: aiResult.model,
    timestamp,
  };
}

/**
 * Scan for revenue opportunities across leads, clients, properties, and bookings.
 * Quantifies each opportunity with dollar estimates.
 */
export async function runRevenueOpportunityScan(env, ctx) {
  const timestamp = new Date().toISOString();

  const scans = {};

  // Unconverted leads
  try {
    scans.unconvertedLeads = await listRecords(env, TABLES.LEADS, {
      maxRecords: 50,
      filterByFormula: `{Status} != 'Converted'`,
    });
  } catch (err) {
    scans.unconvertedLeads = [];
  }

  // Client upsell opportunities
  try {
    scans.clients = await listRecords(env, TABLES.CLIENTS, { maxRecords: 50 });
  } catch (err) {
    scans.clients = [];
  }

  // Property vacancies
  try {
    scans.properties = await listRecords(env, TABLES.PROPERTIES, { maxRecords: 50 });
  } catch (err) {
    scans.properties = [];
  }

  // Booking gaps
  try {
    scans.bookings = await listRecords(env, TABLES.BOOKINGS, { maxRecords: 50 });
  } catch (err) {
    scans.bookings = [];
  }

  const scanSummary = [
    `Unconverted Leads: ${scans.unconvertedLeads.length} records`,
    `Clients (upsell scan): ${scans.clients.length} records`,
    `Properties (vacancy scan): ${scans.properties.length} records`,
    `Bookings (gap scan): ${scans.bookings.length} records`,
  ].join('\n');

  const aiResult = await inference(env, {
    system: CASHFLOW_SYSTEM,
    prompt: `REVENUE OPPORTUNITY SCAN at ${timestamp}

DATA:
${scanSummary}

For each category, produce:
1. OPPORTUNITY COUNT: How many actionable opportunities exist.
2. ESTIMATED DOLLAR VALUE: Conservative, realistic, and aggressive estimates.
3. CONVERSION PROBABILITY: Percentage likelihood of capture.
4. PRIORITY RANKING: Which opportunities to pursue first.
5. SQUAD ASSIGNMENT: Which CFP squad owns this opportunity.
6. ACTION PLAN: Numbered steps to capture the revenue.

Categories:
- LEADS: Unconverted leads sitting in pipeline. What is each worth? What is blocking conversion?
- CLIENTS: Which existing clients can be upsold? Additional properties, premium services, referral programs.
- PROPERTIES: Which properties have vacancy? What is the daily cost of each empty unit?
- BOOKINGS: Where are the calendar gaps? What is the revenue lost per gap night?

Produce a total REVENUE OPPORTUNITY VALUE summing all categories.`,
    tier: 'advanced',
    maxTokens: 3500,
  });

  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `CFP: revenue_opportunity_scan - ${timestamp}`,
      'Module': { name: 'Cash Flow Production' },
      'Request Type': { name: 'revenue_opportunity_scan' },
      'Input Brief': scanSummary.slice(0, 10000),
      'Output Text': aiResult.content.slice(0, 10000),
      'Model Used': { name: aiResult.model },
      'Timestamp': timestamp,
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log write failed:', err))
  );

  ctx.waitUntil(
    createRecord(env, TABLES.DELEGATION_OPS, {
      'Task Name': `CFP: Revenue Opportunity Scan - ${timestamp}`,
      'Agent ID': 'CFP-002',
      'Agent Name': 'Pipeline Analyst',
      'Status': { name: 'Completed' },
      'Priority': { name: 'High' },
      'Category': { name: 'Cash Flow Production' },
      'Source Division': 'CFP',
      'Target Division': 'CFP',
      'Scan Results': aiResult.content.slice(0, 100000),
      'Created At': timestamp,
      'Resolved At': new Date().toISOString(),
      'Badge Clearance': { name: 'Enterprise Full Access' },
    }).catch(err => console.error('Revenue ops write failed:', err))
  );

  sendDelegationSlack(env, ctx, {
    agentId: 'CFP-002',
    agentName: 'Pipeline Analyst',
    action: 'Revenue Opportunity Scan Complete',
    details: `${scans.unconvertedLeads.length} leads, ${scans.clients.length} clients, ${scans.properties.length} properties, ${scans.bookings.length} bookings scanned.`,
    priority: 'High',
  });

  return {
    engine: 'Cash Flow Production Engine',
    scan: 'Revenue Opportunity',
    dataSummary: {
      unconvertedLeads: scans.unconvertedLeads.length,
      clients: scans.clients.length,
      properties: scans.properties.length,
      bookings: scans.bookings.length,
    },
    revenueOpportunities: aiResult.content,
    model: aiResult.model,
    timestamp,
  };
}

/**
 * Pull counts from key tables and return enterprise health metrics.
 */
export async function getEnterpriseMetrics(env) {
  const metricTables = [
    { key: 'leads', table: TABLES.LEADS },
    { key: 'clients', table: TABLES.CLIENTS },
    { key: 'properties', table: TABLES.PROPERTIES },
    { key: 'bookings', table: TABLES.BOOKINGS },
    { key: 'tasks', table: TABLES.TASKS },
    { key: 'salesCampaigns', table: TABLES.SALES_CAMPAIGNS },
    { key: 'maintenanceRequests', table: TABLES.MAINTENANCE_REQUESTS },
    { key: 'investorPresentations', table: TABLES.INVESTOR_PRESENTATIONS },
  ];

  const counts = {};
  for (const { key, table } of metricTables) {
    try {
      const records = await listRecords(env, table, { maxRecords: 100 });
      counts[key] = records.length;
    } catch (err) {
      counts[key] = 0;
    }
  }

  const completedTasks = counts.tasks; // Approximation from sample

  return {
    engine: 'Cash Flow Production Engine',
    division: 'CFP',
    tableCounts: counts,
    metrics: {
      leadPipelineValue: { label: 'Revenue Pipeline Value', count: counts.leads, unit: 'leads in pipeline' },
      clientCount: { label: 'Active Clients', count: counts.clients, unit: 'clients' },
      propertyCount: { label: 'Managed Properties', count: counts.properties, unit: 'properties' },
      bookingRate: { label: 'Active Bookings', count: counts.bookings, unit: 'bookings' },
      taskCompletionRate: { label: 'Task Volume', count: counts.tasks, unit: 'tasks tracked' },
      campaignCount: { label: 'Sales Campaigns', count: counts.salesCampaigns, unit: 'campaigns' },
      maintenanceVolume: { label: 'Maintenance Requests', count: counts.maintenanceRequests, unit: 'requests' },
      investorPresentations: { label: 'Investor Presentations', count: counts.investorPresentations, unit: 'presentations' },
    },
    mandatoryKPIs: ENTERPRISE_METRICS,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Return static dashboard structure with all 9 squads, 46 agents,
 * enterprise metrics definitions, and mandatory KPIs.
 */
export function getCashFlowDashboard() {
  return {
    engine: 'Cash Flow Production Engine',
    division: 'CFP',
    divisionName: 'Cash Flow Production',
    agentCount: 46,
    squadCount: 9,
    mandate: 'Revenue generation. Cash flow velocity. Financial dominance. Every dollar tracked. Every leak sealed. Every opportunity quantified.',
    squads: SQUADS,
    mandatoryKPIs: ENTERPRISE_METRICS,
    doctrine: {
      voice: 'Fortune 500 CFO',
      speed: 'Ferrari-level',
      standard: 'Numbers over narratives. Dollars over impressions.',
      quality: 'Every metric quantified. Every opportunity priced.',
      iteration: 'Continuous revenue optimization. No quarter without growth.',
    },
    operatingPrinciples: [
      'Revenue is oxygen. Without it, nothing else matters.',
      'Cash conversion cycle must shrink every quarter.',
      'Every lead has a dollar value. Every vacancy has a cost.',
      'Client lifetime value compounds. Protect and expand it.',
      'Cost per acquisition must decrease while close rate increases.',
      'Occupancy rate is the single most important operational metric.',
      'Maintenance response time directly impacts retention revenue.',
      'Campaign ROI must be measured in dollars, not impressions.',
      'Agent fleet utilization drives operational leverage.',
      'Monthly recurring revenue is the foundation of enterprise value.',
    ],
    timestamp: new Date().toISOString(),
  };
}

export { SQUADS, SQUAD_PROMPTS, ENTERPRISE_METRICS, CASHFLOW_SYSTEM };
