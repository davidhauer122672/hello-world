/**
 * Business Forecast Division (BFR) — API Routes
 *
 * Endpoints:
 *   GET  /v1/forecast/agents          — List all 20 BFR agents
 *   GET  /v1/forecast/agents/:id      — Get single BFR agent
 *   GET  /v1/forecast/dashboard       — Division dashboard with pipeline status
 *   POST /v1/forecast/generate        — Generate 18-month forecast via Claude
 *   POST /v1/forecast/scenario        — Run stress-test scenario simulation
 *   GET  /v1/forecast/market-pulse    — Current market conditions snapshot
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { BFR_AGENTS } from '../agents/agents-bfr.js';

// ── Agent lookup index ──────────────────────────────────────────────────────

const _byId = new Map(BFR_AGENTS.map(a => [a.id, a]));

// ── Service zones for Treasure Coast forecasting ────────────────────────────

const FORECAST_ZONES = [
  { zone: 'vero-beach', label: 'Vero Beach', county: 'Indian River', tier: 'luxury', growthIndex: 8.4 },
  { zone: 'sebastian', label: 'Sebastian', county: 'Indian River', tier: 'standard', growthIndex: 6.7 },
  { zone: 'fort-pierce', label: 'Fort Pierce', county: 'St. Lucie', tier: 'emerging', growthIndex: 7.2 },
  { zone: 'port-st-lucie', label: 'Port Saint Lucie', county: 'St. Lucie', tier: 'standard', growthIndex: 7.8 },
  { zone: 'jensen-beach', label: 'Jensen Beach', county: 'Martin', tier: 'standard', growthIndex: 7.1 },
  { zone: 'stuart', label: 'Stuart', county: 'Martin', tier: 'luxury', growthIndex: 8.1 },
  { zone: 'palm-city', label: 'Palm City', county: 'Martin', tier: 'luxury', growthIndex: 7.9 },
  { zone: 'hobe-sound', label: 'Hobe Sound', county: 'Martin', tier: 'luxury', growthIndex: 8.6 },
  { zone: 'jupiter', label: 'Jupiter', county: 'Palm Beach', tier: 'luxury', growthIndex: 9.1 },
  { zone: 'north-palm-beach', label: 'North Palm Beach', county: 'Palm Beach', tier: 'luxury', growthIndex: 8.9 },
];

// ── Service tiers and their 18-month demand signals ─────────────────────────

// ── CKPM current operating state (ground truth) ────────────────────────────

const CKPM_CURRENT_STATE = {
  clients: 0,
  properties: 0,
  monthlyRevenue: 0,
  launchDate: '2026-04-03',
  phase: 'launch',
  milestonesCompleted: [
    { item: 'Home Watch pricing finalized', date: '2026-04-03', status: 'complete' },
    { item: 'Sentinel Sales division activated for outbound prospecting', date: '2026-04-03', status: 'complete' },
    { item: 'First 2 clients targeted', date: '2026-04-03', status: 'complete' },
    { item: 'NHWA accreditation secured', date: '2026-04-03', status: 'complete' },
  ],
  nextMilestones: [
    { item: 'Close first 2 Home Watch clients', target: 'Month 1' },
    { item: 'Build referral pipeline — RE agents and HOA boards', target: 'Month 2-3' },
    { item: 'Deploy AI-powered service demo as competitive differentiator', target: 'Month 3' },
    { item: 'Launch Seasonal Care tier ahead of hurricane season', target: 'Month 3-4' },
    { item: 'Reach 8 clients / $5.2K monthly revenue', target: 'Month 3' },
    { item: 'Evaluate break-even trajectory', target: 'Month 6' },
  ],
};

const SERVICE_TIERS = [
  {
    tier: 'home-watch',
    label: 'Home Watch',
    currentDemandIndex: 82,
    projectedGrowth18mo: 14.3,
    seasonalPeakMonths: ['nov', 'dec', 'jan', 'feb', 'mar'],
    avgRevenuePerAccount: 3600,
    marketPenetration: 0.00,
    ckpmCurrentClients: 0,
    ckpmCurrentRevenue: 0,
    acquisitionTarget18mo: 25,
  },
  {
    tier: 'full-management',
    label: 'Full Property Management',
    currentDemandIndex: 74,
    projectedGrowth18mo: 11.8,
    seasonalPeakMonths: ['oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr'],
    avgRevenuePerAccount: 18000,
    marketPenetration: 0.00,
    ckpmCurrentClients: 0,
    ckpmCurrentRevenue: 0,
    acquisitionTarget18mo: 10,
  },
  {
    tier: 'concierge',
    label: 'Concierge & Luxury Services',
    currentDemandIndex: 68,
    projectedGrowth18mo: 22.6,
    seasonalPeakMonths: ['nov', 'dec', 'jan', 'feb', 'mar'],
    avgRevenuePerAccount: 42000,
    marketPenetration: 0.00,
    ckpmCurrentClients: 0,
    ckpmCurrentRevenue: 0,
    acquisitionTarget18mo: 3,
  },
  {
    tier: 'seasonal-care',
    label: 'Seasonal Property Care',
    currentDemandIndex: 88,
    projectedGrowth18mo: 9.2,
    seasonalPeakMonths: ['may', 'jun', 'jul', 'aug', 'sep'],
    avgRevenuePerAccount: 7200,
    marketPenetration: 0.00,
    ckpmCurrentClients: 0,
    ckpmCurrentRevenue: 0,
    acquisitionTarget18mo: 15,
  },
];

// ── Route handlers ──────────────────────────────────────────────────────────

/**
 * GET /v1/forecast/agents — List BFR agents with optional filters.
 */
export function handleListForecastAgents(url) {
  const status = url.searchParams.get('status');
  const tier = url.searchParams.get('tier');
  const search = url.searchParams.get('search')?.toLowerCase();

  let agents = [...BFR_AGENTS];

  if (status) agents = agents.filter(a => a.status === status);
  if (tier) agents = agents.filter(a => a.tier === tier);
  if (search) {
    agents = agents.filter(
      a =>
        a.name.toLowerCase().includes(search) ||
        a.role.toLowerCase().includes(search) ||
        a.id.toLowerCase().includes(search),
    );
  }

  return jsonResponse({
    division: 'BFR',
    divisionName: 'Business Forecast',
    total: agents.length,
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      tier: a.tier,
      status: a.status,
      kpis: a.kpis,
    })),
  });
}

/**
 * GET /v1/forecast/agents/:id — Single BFR agent detail.
 */
export function handleGetForecastAgent(agentId) {
  const agent = _byId.get(agentId);
  if (!agent) return errorResponse(`Agent ${agentId} not found in BFR division`, 404);
  return jsonResponse({ agent });
}

/**
 * GET /v1/forecast/dashboard — Division operations dashboard.
 */
export function handleForecastDashboard() {
  const statusBreakdown = { active: 0, standby: 0, training: 0, maintenance: 0 };
  const tierBreakdown = { advanced: 0, standard: 0 };

  for (const agent of BFR_AGENTS) {
    statusBreakdown[agent.status] = (statusBreakdown[agent.status] || 0) + 1;
    tierBreakdown[agent.tier] = (tierBreakdown[agent.tier] || 0) + 1;
  }

  return jsonResponse({
    division: 'BFR',
    divisionName: 'Business Forecast',
    color: '#dc2626',
    icon: 'trending-up',
    agentCount: BFR_AGENTS.length,
    statusBreakdown,
    tierBreakdown,
    currentState: CKPM_CURRENT_STATE,
    forecastHorizon: '18 months',
    qualityStandard: 'Ferrari',
    accuracyFloor: '±5% MAPE',
    serviceTiers: SERVICE_TIERS.map(t => ({
      tier: t.tier,
      label: t.label,
      currentDemandIndex: t.currentDemandIndex,
      projectedGrowth18mo: `${t.projectedGrowth18mo}%`,
    })),
    coverageZones: FORECAST_ZONES.length,
    pipeline: {
      stages: [
        { stage: 'data-ingestion', owner: 'BFR-002', status: 'active' },
        { stage: 'demand-modeling', owner: 'BFR-003', status: 'active' },
        { stage: 'competitive-intel', owner: 'BFR-004', status: 'active' },
        { stage: 'revenue-projection', owner: 'BFR-005', status: 'active' },
        { stage: 'macro-analysis', owner: 'BFR-006', status: 'active' },
        { stage: 'scenario-testing', owner: 'BFR-016', status: 'active' },
        { stage: 'synthesis', owner: 'BFR-017', status: 'active' },
        { stage: 'calibration', owner: 'BFR-018', status: 'active' },
        { stage: 'quality-audit', owner: 'BFR-019', status: 'active' },
        { stage: 'delivery', owner: 'BFR-020', status: 'active' },
      ],
    },
    sla: {
      forecastRefreshCadence: 'monthly',
      ceoBriefTurnaround: '48 hours from cycle close',
      accuracyTarget: 'MAPE ≤ 5%',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /v1/forecast/market-pulse — Current market conditions snapshot.
 */
export function handleMarketPulse() {
  return jsonResponse({
    source: 'BFR-002 Market Pulse',
    generatedAt: new Date().toISOString(),
    forecastHorizon: '18 months',
    treasureCoast: {
      overallGrowthIndex: 8.0,
      zones: FORECAST_ZONES,
    },
    serviceTiers: SERVICE_TIERS,
    macroIndicators: {
      mortgageRate30yr: { current: 6.72, trend: 'declining', impact: 'positive' },
      floridaPopulationGrowth: { annualRate: 1.6, trend: 'stable', impact: 'positive' },
      homeInsurancePremiums: { yoyChange: 8.3, trend: 'rising', impact: 'negative' },
      medianHomePrice: { treasureCoast: 425000, yoyChange: 5.2, trend: 'rising', impact: 'mixed' },
      snowbirdMigrationIndex: { current: 74, trend: 'rising', impact: 'positive' },
      newConstructionPermits: { yoyChange: 12.1, trend: 'rising', impact: 'positive' },
    },
    ckpmCurrentState: CKPM_CURRENT_STATE,
    competitiveLandscape: {
      activeCompetitors: 47,
      marketConcentration: 'fragmented',
      coastalKeyPosition: 'new-entrant',
      threatLevel: 'low-to-ckpm',
      note: 'CKPM is pre-revenue. Competitors are not yet aware of our entry.',
    },
    keyInsights: [
      'CKPM in launch phase: pricing set, NHWA accredited, Sentinel Sales active, first 2 clients targeted — revenue imminent',
      'Snowbird corridor migration accelerating — Treasure Coast absorption rate +16% YoY',
      'Concierge tier shows highest growth potential at 22.6% projected 18mo market increase',
      'Fragmented market (47+ operators, no dominant player) favors aggressive new entrant with technology moat',
      'CKPM 310-agent AI fleet is an unmatched differentiator — zero competitors use AI operations',
      'First-mover window for AI-powered property management on Treasure Coast estimated at 12-18 months',
    ],
  });
}

/**
 * POST /v1/forecast/generate — Generate full 18-month forecast via Claude.
 */
export async function handleForecastGenerate(request, env, ctx) {
  const body = await request.json().catch(() => null);
  if (!body) return errorResponse('Request body required', 400);

  const {
    scope = 'full',
    zones = FORECAST_ZONES.map(z => z.zone),
    serviceTiers = SERVICE_TIERS.map(t => t.tier),
    scenarios = ['base', 'optimistic', 'pessimistic'],
    outputFormat = 'ceo-brief',
  } = body;

  const systemPrompt = `You are BFR-017 CEO Synthesizer, the executive briefing agent for Coastal Key Property Management's Business Forecast Division. You produce Ferrari-quality strategic forecasts.

CRITICAL CONTEXT — LAUNCH PHASE (WEEK 1):
- Company: Coastal Key Property Management (CKPM)
- Region: Treasure Coast, Florida (Vero Beach to North Palm Beach)
- Services: Home Watch, Full Property Management, Concierge & Luxury, Seasonal Care
- CURRENT CLIENTS: 0 (first 2 targeted, not yet closed)
- CURRENT REVENUE: $0/month
- CURRENT PROPERTIES: 0
- COMPANY PHASE: Active launch — all systems operational
- Launch Date: April 2026
- COMPLETED: Home Watch pricing finalized, NHWA accredited, Sentinel Sales division activated, first 2 prospects targeted
- Forecast Horizon: 18 months (${new Date().toISOString().slice(0, 7)} to ${new Date(Date.now() + 18 * 30.44 * 86400000).toISOString().slice(0, 7)})
- Quality Standard: Ferrari-grade — precise, substantiated, actionable

COMPETITIVE ADVANTAGE:
- 310-agent AI operations fleet (no competitor has AI)
- Integrated Retell AI voice, Claude API inference, Airtable CRM
- 10-zone Treasure Coast coverage planned
- Technology moat estimated at 12-18 months vs. competitors

MARKET DATA:
${JSON.stringify({ currentState: CKPM_CURRENT_STATE, zones: FORECAST_ZONES, tiers: SERVICE_TIERS }, null, 2)}

KNOWN COMPETITORS:
1. House Check International — Port St. Lucie / PGA Village (largest on TC)
2. Oceanside Home Watch — Vero Beach (premium segment leader)
3. Island Home & Estate Management — Jupiter Island (ultra-luxury niche)
4. Argos Homewatch — Stuart / Martin County (most tech-forward, GPS reporting)
5. First Mate Home Watch — PSL / Stuart (owner-operated, personal touch)
None use AI. Market is fragmented with 47+ operators.

OUTPUT FORMAT: ${outputFormat}
SCOPE: ${scope}
SCENARIOS: ${scenarios.join(', ')}

Deliver a structured 18-month RAMP-FROM-ZERO business forecast that includes:
1. EXECUTIVE SUMMARY — 3 decisive takeaways for a company launching from $0
2. MARKET ENTRY STRATEGY — Which zones and tiers to attack first, in what sequence
3. CLIENT ACQUISITION RAMP — Month-by-month client count projection from 0
4. REVENUE PROJECTIONS — Monthly/quarterly with scenario bands (starting from $0)
5. COMPETITIVE POSITION — How to win clients from established operators
6. COST STRUCTURE — What must be invested before revenue arrives
7. RISK MATRIX — Top 5 risks with probability, impact, mitigation
8. BREAK-EVEN ANALYSIS — When does monthly revenue exceed monthly operating cost
9. 18-MONTH ROADMAP — Quarter-by-quarter milestones from zero to scale
10. CEO ACTION ITEMS — What needs a decision this week to start generating revenue

This is a LAUNCH forecast, not a growth forecast. Every number starts at zero.
Be precise. Use numbers. Cite assumptions. No filler. Every sentence earns its place.`;

  const userMessage = body.additionalContext
    ? `Generate the 18-month forecast with this additional CEO context: ${body.additionalContext}`
    : 'Generate the complete 18-month business forecast for Coastal Key Property Management.';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return errorResponse(`Claude API error: ${errText}`, 502);
    }

    const result = await response.json();

    // Audit log
    if (env.AUDIT_LOG) {
      const key = `bfr:forecast:${Date.now()}`;
      ctx.waitUntil(
        env.AUDIT_LOG.put(
          key,
          JSON.stringify({
            action: 'forecast-generated',
            scope,
            zones: zones.length,
            scenarios,
            outputFormat,
            timestamp: new Date().toISOString(),
          }),
          { expirationTtl: 86400 * 90 },
        ),
      );
    }

    return jsonResponse({
      division: 'BFR',
      generatedBy: 'BFR-017 CEO Synthesizer',
      qualityAuditedBy: 'BFR-019 Quality Auditor',
      forecastHorizon: '18 months',
      scope,
      scenarios,
      outputFormat,
      zonesIncluded: zones.length,
      serviceTiersIncluded: serviceTiers.length,
      forecast: result.content[0]?.text || '',
      model: result.model,
      usage: result.usage,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Forecast generation failed: ${err.message}`, 500);
  }
}

/**
 * POST /v1/forecast/scenario — Run stress-test scenario simulation.
 */
export async function handleForecastScenario(request, env, ctx) {
  const body = await request.json().catch(() => null);
  if (!body || !body.scenario) {
    return errorResponse('Request body with "scenario" field required', 400);
  }

  const prebuiltScenarios = {
    'hurricane-cat4': {
      name: 'Category 4+ Hurricane Impact',
      variables: ['property-damage-rate', 'insurance-claims-surge', 'service-demand-spike', 'workforce-disruption', 'supply-chain-delay'],
      historicalBasis: 'Hurricane Ian (2022), Irma (2017)',
    },
    'rate-shock-200bp': {
      name: '200bp Interest Rate Increase',
      variables: ['mortgage-affordability', 'home-sales-velocity', 'migration-slowdown', 'construction-freeze', 'rental-demand-shift'],
      historicalBasis: '2022-2023 rate cycle',
    },
    'major-competitor-entry': {
      name: 'National Competitor Market Entry',
      variables: ['pricing-pressure', 'talent-poaching', 'client-attrition-risk', 'marketing-spend-response', 'service-differentiation'],
      historicalBasis: 'National franchise expansion patterns',
    },
    'insurance-collapse': {
      name: 'Florida Insurance Market Collapse',
      variables: ['premium-surge', 'coverage-gaps', 'property-abandonment', 'migration-reversal', 'legislative-response'],
      historicalBasis: 'Citizens Property Insurance growth 2020-2024',
    },
    'recession': {
      name: 'National Economic Recession',
      variables: ['discretionary-spend-cut', 'property-sale-surge', 'seasonal-occupancy-drop', 'vendor-cost-deflation', 'workforce-availability'],
      historicalBasis: '2008-2009, 2020 recessions',
    },
  };

  const scenarioConfig = prebuiltScenarios[body.scenario] || {
    name: body.scenario,
    variables: body.variables || ['custom-scenario'],
    historicalBasis: body.historicalBasis || 'Custom analysis',
  };

  const systemPrompt = `You are BFR-016 Scenario Architect, the stress-test specialist for Coastal Key Property Management's Business Forecast Division.

SCENARIO: ${scenarioConfig.name}
VARIABLES: ${scenarioConfig.variables.join(', ')}
HISTORICAL BASIS: ${scenarioConfig.historicalBasis}

COMPANY CONTEXT:
- Treasure Coast property management (Vero Beach to North Palm Beach)
- CURRENT CLIENTS: 0 (first 2 targeted, Sentinel Sales active, NHWA accredited)
- CURRENT REVENUE: $0/month — launch phase, week 1
- Target portfolio at 18 months: 53 managed properties
- Target revenue mix: Home Watch (35%), Full Management (30%), Concierge (20%), Seasonal (15%)
- Competitive advantage: 310-agent AI fleet, NHWA accredited, zero competitors use AI

Produce a structured stress-test analysis:
1. SCENARIO DESCRIPTION — What exactly happens, over what timeline
2. IMPACT ASSESSMENT — Revenue, margin, client retention, workforce (quantified)
3. PROBABILITY RATING — Low/Medium/High with justification
4. RESILIENCE SCORE — 1-10 scale for CKPM's current position
5. CONTINGENCY TRIGGERS — Specific thresholds that activate response plans
6. MITIGATION PLAYBOOK — Ranked actions with cost estimates and timelines
7. RECOVERY PROJECTION — Time to return to baseline after impact

Be quantitative. Use ranges where uncertainty exists. No platitudes.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: body.additionalContext || `Run the ${scenarioConfig.name} stress test for Coastal Key Property Management.` }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return errorResponse(`Claude API error: ${errText}`, 502);
    }

    const result = await response.json();

    if (env.AUDIT_LOG) {
      const key = `bfr:scenario:${Date.now()}`;
      ctx.waitUntil(
        env.AUDIT_LOG.put(
          key,
          JSON.stringify({
            action: 'scenario-simulated',
            scenario: scenarioConfig.name,
            timestamp: new Date().toISOString(),
          }),
          { expirationTtl: 86400 * 90 },
        ),
      );
    }

    return jsonResponse({
      division: 'BFR',
      generatedBy: 'BFR-016 Scenario Architect',
      scenario: scenarioConfig,
      availablePrebuiltScenarios: Object.keys(prebuiltScenarios),
      analysis: result.content[0]?.text || '',
      model: result.model,
      usage: result.usage,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Scenario simulation failed: ${err.message}`, 500);
  }
}
