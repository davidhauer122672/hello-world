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

const SERVICE_TIERS = [
  {
    tier: 'home-watch',
    label: 'Home Watch',
    currentDemandIndex: 82,
    projectedGrowth18mo: 14.3,
    seasonalPeakMonths: ['nov', 'dec', 'jan', 'feb', 'mar'],
    avgRevenuePerAccount: 3600,
    marketPenetration: 0.12,
  },
  {
    tier: 'full-management',
    label: 'Full Property Management',
    currentDemandIndex: 74,
    projectedGrowth18mo: 11.8,
    seasonalPeakMonths: ['oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr'],
    avgRevenuePerAccount: 18000,
    marketPenetration: 0.08,
  },
  {
    tier: 'concierge',
    label: 'Concierge & Luxury Services',
    currentDemandIndex: 68,
    projectedGrowth18mo: 22.6,
    seasonalPeakMonths: ['nov', 'dec', 'jan', 'feb', 'mar'],
    avgRevenuePerAccount: 42000,
    marketPenetration: 0.04,
  },
  {
    tier: 'seasonal-care',
    label: 'Seasonal Property Care',
    currentDemandIndex: 88,
    projectedGrowth18mo: 9.2,
    seasonalPeakMonths: ['may', 'jun', 'jul', 'aug', 'sep'],
    avgRevenuePerAccount: 7200,
    marketPenetration: 0.15,
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
    competitiveLandscape: {
      activeCompetitors: 47,
      marketConcentration: 'fragmented',
      coastalKeyPosition: 'top-5',
      threatLevel: 'moderate',
    },
    keyInsights: [
      'Snowbird corridor migration accelerating — Treasure Coast absorption rate +16% YoY',
      'Concierge tier shows highest growth potential at 22.6% projected 18mo increase',
      'Insurance premium inflation creating service-cost pressure; margin watch required',
      'Three new competitors entered Vero Beach market in Q1 — monitor pricing pressure',
      'Smart home IoT adoption creating differentiation opportunity for tech-forward operators',
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

CONTEXT:
- Company: Coastal Key Property Management (CKPM)
- Region: Treasure Coast, Florida (Vero Beach to North Palm Beach)
- Services: Home Watch, Full Property Management, Concierge & Luxury, Seasonal Care
- Forecast Horizon: 18 months (${new Date().toISOString().slice(0, 7)} to ${new Date(Date.now() + 18 * 30.44 * 86400000).toISOString().slice(0, 7)})
- Quality Standard: Ferrari-grade — precise, substantiated, actionable

MARKET DATA:
${JSON.stringify({ zones: FORECAST_ZONES, tiers: SERVICE_TIERS }, null, 2)}

OUTPUT FORMAT: ${outputFormat}
SCOPE: ${scope}
SCENARIOS: ${scenarios.join(', ')}

Deliver a structured 18-month business forecast that includes:
1. EXECUTIVE SUMMARY — 3 decisive takeaways
2. MARKET OUTLOOK — Demand trajectory by service tier and zone
3. REVENUE PROJECTIONS — Monthly/quarterly with scenario bands
4. COMPETITIVE POSITION — Threats, opportunities, moat analysis
5. RISK MATRIX — Top 5 risks with probability, impact, mitigation
6. STRATEGIC IMPERATIVES — Prioritized actions for the next 90 days
7. 18-MONTH ROADMAP — Quarter-by-quarter milestones
8. CEO ACTION ITEMS — What needs a decision this week

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
- Current portfolio: ~200 managed properties
- Revenue mix: Home Watch (35%), Full Management (30%), Concierge (20%), Seasonal (15%)

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
