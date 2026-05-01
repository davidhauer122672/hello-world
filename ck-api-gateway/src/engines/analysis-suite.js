/**
 * Analysis Suite — Comprehensive Analytics Engine
 *
 * Fleet-wide performance analytics, market intelligence, and operational
 * reporting for the 404-agent Coastal Key Enterprise platform.
 *
 * Covers agent scoring, fleet aggregation, Treasure Coast market trends,
 * competitive intel, lead pipeline health, division reports, property
 * health scoring, and tenant churn prediction.
 */

import { SERVICE_ZONES } from '../agents/constants.js';

// ── Analysis Templates ───────────────────────────────────────────────────────

export const ANALYSIS_TEMPLATES = {
  'weekly-flash': {
    id: 'weekly-flash',
    name: 'Weekly Flash Report',
    cadence: 'weekly',
    sections: ['fleet-health', 'pipeline-snapshot', 'revenue-highlights', 'action-items'],
    description: 'Quick-hit weekly overview for leadership — KPIs, pipeline movement, and blockers.',
    maxPages: 2,
  },
  'monthly-deep-dive': {
    id: 'monthly-deep-dive',
    name: 'Monthly Deep Dive',
    cadence: 'monthly',
    sections: [
      'executive-summary', 'fleet-performance', 'market-analysis', 'pipeline-health',
      'competitive-landscape', 'property-portfolio', 'division-scorecards', 'recommendations',
    ],
    description: 'Comprehensive monthly review with division-level scorecards and trend analysis.',
    maxPages: 15,
  },
  'quarterly-board': {
    id: 'quarterly-board',
    name: 'Quarterly Board Report',
    cadence: 'quarterly',
    sections: [
      'executive-summary', 'financial-overview', 'market-position', 'fleet-roi',
      'competitive-intel', 'risk-assessment', 'strategic-initiatives', 'forward-outlook',
    ],
    description: 'Board-ready quarterly report with financial performance, market position, and strategic outlook.',
    maxPages: 25,
  },
  'annual-review': {
    id: 'annual-review',
    name: 'Annual Review',
    cadence: 'annual',
    sections: [
      'year-in-review', 'financial-performance', 'market-evolution', 'fleet-growth',
      'technology-roadmap', 'competitive-analysis', 'portfolio-performance',
      'client-satisfaction', 'operational-efficiency', 'strategic-plan',
    ],
    description: 'Full-year retrospective and forward strategy — investor and board presentation ready.',
    maxPages: 50,
  },
};

// ── Performance Rating Thresholds ────────────────────────────────────────────

const RATING_THRESHOLDS = {
  'Ferrari-Standard': 90,
  'Operational': 60,
  'Needs-Improvement': 0,
};

// ── Agent Performance Analysis ───────────────────────────────────────────────

/**
 * Score an individual agent's performance across KPIs.
 *
 * @param {string} agentId — Agent identifier (e.g. 'MKT-012', 'IO-A01')
 * @param {object} metrics — Raw metric values
 * @param {number} [metrics.responseTimeMs] — Average response time in ms
 * @param {number} [metrics.taskCompletionRate] — 0-1 task completion ratio
 * @param {number} [metrics.conversionRate] — 0-1 conversion ratio
 * @param {number} [metrics.uptimePercent] — 0-100 uptime percentage
 * @param {number} [metrics.qualityScore] — 0-100 output quality score
 * @param {number} [metrics.errorRate] — 0-1 error ratio
 * @returns {object} Performance analysis with composite score and rating
 */
export function analyzeAgentPerformance(agentId, metrics = {}) {
  const scores = {};

  // Response time score — under 200ms = 100, over 2000ms = 0
  if (metrics.responseTimeMs != null) {
    scores.responseTime = Math.max(0, Math.min(100, 100 - ((metrics.responseTimeMs - 200) / 18)));
  }

  // Task completion — direct percentage
  if (metrics.taskCompletionRate != null) {
    scores.taskCompletion = Math.min(100, metrics.taskCompletionRate * 100);
  }

  // Conversion rate — benchmarked against 20% target
  if (metrics.conversionRate != null) {
    scores.conversion = Math.min(100, (metrics.conversionRate / 0.20) * 100);
  }

  // Uptime — direct percentage
  if (metrics.uptimePercent != null) {
    scores.uptime = Math.min(100, metrics.uptimePercent);
  }

  // Quality — direct score
  if (metrics.qualityScore != null) {
    scores.quality = Math.min(100, metrics.qualityScore);
  }

  // Error rate — inverted (0% errors = 100 score)
  if (metrics.errorRate != null) {
    scores.errorRate = Math.max(0, 100 - (metrics.errorRate * 100));
  }

  const scoreValues = Object.values(scores);
  const compositeScore = scoreValues.length > 0
    ? Math.round(scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length)
    : 0;

  let rating = 'Needs-Improvement';
  if (compositeScore >= RATING_THRESHOLDS['Ferrari-Standard']) rating = 'Ferrari-Standard';
  else if (compositeScore >= RATING_THRESHOLDS['Operational']) rating = 'Operational';

  return {
    agentId,
    compositeScore,
    rating,
    breakdown: scores,
    kpiCount: scoreValues.length,
    timestamp: new Date().toISOString(),
  };
}

// ── Fleet Analytics ──────────────────────────────────────────────────────────

/**
 * Aggregate fleet-wide performance metrics.
 *
 * @param {Array<object>} agents — Array of agent objects with metrics
 * @returns {object} Fleet-level analytics summary
 */
export function generateFleetAnalytics(agents = []) {
  if (agents.length === 0) {
    return {
      fleetSize: 0,
      overallHealth: 'NO_DATA',
      metrics: {},
      divisionBreakdown: {},
      timestamp: new Date().toISOString(),
    };
  }

  const responseTimes = [];
  const conversionRates = [];
  const taskCompletionRates = [];
  const uptimes = [];

  for (const agent of agents) {
    const m = agent.metrics || {};
    if (m.responseTimeMs != null) responseTimes.push(m.responseTimeMs);
    if (m.conversionRate != null) conversionRates.push(m.conversionRate);
    if (m.taskCompletionRate != null) taskCompletionRates.push(m.taskCompletionRate);
    if (m.uptimePercent != null) uptimes.push(m.uptimePercent);
  }

  const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
  const p95 = (arr) => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * 0.95)];
  };

  // Division breakdown
  const divisionBreakdown = {};
  for (const agent of agents) {
    const div = agent.division || 'UNASSIGNED';
    if (!divisionBreakdown[div]) {
      divisionBreakdown[div] = { count: 0, active: 0, idle: 0 };
    }
    divisionBreakdown[div].count++;
    if (agent.status === 'active') divisionBreakdown[div].active++;
    else divisionBreakdown[div].idle++;
  }

  const avgUptime = avg(uptimes);
  const overallHealth = avgUptime == null ? 'NO_DATA'
    : avgUptime >= 99 ? 'FERRARI_STANDARD'
    : avgUptime >= 95 ? 'OPERATIONAL'
    : 'DEGRADED';

  return {
    fleetSize: agents.length,
    overallHealth,
    metrics: {
      responseTime: {
        avg: responseTimes.length > 0 ? Math.round(avg(responseTimes)) : null,
        p95: responseTimes.length > 0 ? Math.round(p95(responseTimes)) : null,
        unit: 'ms',
      },
      conversionRate: {
        avg: conversionRates.length > 0 ? +(avg(conversionRates) * 100).toFixed(2) : null,
        unit: '%',
      },
      taskCompletion: {
        avg: taskCompletionRates.length > 0 ? +(avg(taskCompletionRates) * 100).toFixed(2) : null,
        unit: '%',
      },
      uptime: {
        avg: uptimes.length > 0 ? +avg(uptimes).toFixed(3) : null,
        min: uptimes.length > 0 ? Math.min(...uptimes) : null,
        unit: '%',
      },
    },
    divisionBreakdown,
    timestamp: new Date().toISOString(),
  };
}

// ── Market Trend Analysis ────────────────────────────────────────────────────

/**
 * Analyze real estate market trends for a Treasure Coast zone.
 *
 * @param {string} zone — SERVICE_ZONES id (e.g. 'vero_beach', 'stuart')
 * @param {string} [timeframe='30d'] — Analysis window: '7d', '30d', '90d', '1y'
 * @returns {object} Market trend analysis framework
 */
export function analyzeMarketTrends(zone, timeframe = '30d') {
  const zoneInfo = SERVICE_ZONES.find(z => z.id === zone);
  if (!zoneInfo) {
    return { error: `Unknown zone: ${zone}. Valid zones: ${SERVICE_ZONES.map(z => z.id).join(', ')}` };
  }

  const timeframeDays = { '7d': 7, '30d': 30, '90d': 90, '1y': 365 }[timeframe] || 30;

  return {
    zone: zoneInfo,
    timeframe: { code: timeframe, days: timeframeDays },
    analysisFramework: {
      priceTrends: {
        metric: 'Median sale price and price per square foot',
        dataPoints: ['medianSalePrice', 'avgPricePerSqft', 'priceChangePercent'],
        benchmarkSource: 'MLS / Airtable Property Intelligence',
      },
      inventoryLevels: {
        metric: 'Active listings and months of supply',
        dataPoints: ['activeListings', 'newListings', 'monthsOfSupply'],
        thresholds: { buyersMarket: 6, balanced: [4, 6], sellersMarket: 4 },
      },
      daysOnMarket: {
        metric: 'Average and median DOM',
        dataPoints: ['avgDOM', 'medianDOM', 'domTrend'],
        benchmarks: { fast: 30, normal: [30, 90], slow: 90 },
      },
      absorptionRate: {
        metric: 'Rate at which available homes are sold',
        dataPoints: ['monthlySales', 'activeInventory', 'absorptionPercent'],
        interpretation: 'Higher absorption = stronger seller position',
      },
    },
    county: zoneInfo.county,
    generatedAt: new Date().toISOString(),
  };
}

// ── Competitive Intelligence ─────────────────────────────────────────────────

/**
 * Generate competitive intelligence analysis (SWOT).
 *
 * @param {Array<object>} competitors — Competitor profiles
 * @param {string} competitors[].name — Company name
 * @param {number} [competitors[].marketShare] — Estimated market share 0-1
 * @param {string} [competitors[].focus] — Primary focus area
 * @returns {object} Competitive intel report
 */
export function generateCompetitiveIntel(competitors = []) {
  const analysis = competitors.map(comp => ({
    name: comp.name,
    marketShareEstimate: comp.marketShare != null ? +(comp.marketShare * 100).toFixed(1) + '%' : 'Unknown',
    focus: comp.focus || 'General property management',
    swot: {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: [],
    },
    pricingComparison: {
      managementFeeRange: comp.managementFeeRange || null,
      leaseUpFee: comp.leaseUpFee || null,
      maintenanceMarkup: comp.maintenanceMarkup || null,
    },
  }));

  return {
    competitorCount: competitors.length,
    analysis,
    coastalKeyPosition: {
      differentiators: [
        '404-agent autonomous AI fleet',
        'Ferrari-Standard service execution',
        'Treasure Coast market specialization',
        'Retell AI-powered lead qualification',
        'Real-time intelligence monitoring (50 IO officers)',
      ],
      marketAdvantage: 'AI-first property management with autonomous operations at scale',
    },
    generatedAt: new Date().toISOString(),
  };
}

// ── Lead Pipeline Analysis ───────────────────────────────────────────────────

/**
 * Analyze lead pipeline health.
 *
 * @param {Array<object>} leads — Lead records
 * @param {string} leads[].stage — Pipeline stage
 * @param {string} [leads[].createdAt] — ISO date string
 * @param {string} [leads[].segment] — Lead segment
 * @param {boolean} [leads[].converted] — Whether lead converted
 * @returns {object} Pipeline health analysis
 */
export function analyzeLeadPipeline(leads = []) {
  const stageDistribution = {};
  const segmentDistribution = {};
  let convertedCount = 0;
  let totalAgeMs = 0;
  let leadsWithAge = 0;

  const now = Date.now();

  for (const lead of leads) {
    // Stage distribution
    const stage = lead.stage || 'unknown';
    stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;

    // Segment distribution
    const segment = lead.segment || 'unclassified';
    segmentDistribution[segment] = (segmentDistribution[segment] || 0) + 1;

    // Conversion tracking
    if (lead.converted) convertedCount++;

    // Pipeline velocity (age)
    if (lead.createdAt) {
      const created = new Date(lead.createdAt).getTime();
      if (!isNaN(created)) {
        totalAgeMs += now - created;
        leadsWithAge++;
      }
    }
  }

  const totalLeads = leads.length;
  const conversionRate = totalLeads > 0 ? +(convertedCount / totalLeads).toFixed(4) : 0;
  const avgAgeDays = leadsWithAge > 0 ? Math.round((totalAgeMs / leadsWithAge) / 86_400_000) : null;

  // Identify stuck leads (in pipeline > 14 days without conversion)
  const stuckLeads = leads.filter(l => {
    if (l.converted) return false;
    if (!l.createdAt) return false;
    const age = now - new Date(l.createdAt).getTime();
    return age > 14 * 86_400_000;
  }).length;

  // Health rating
  let health = 'HEALTHY';
  if (conversionRate < 0.03) health = 'CRITICAL';
  else if (conversionRate < 0.08) health = 'AT_RISK';
  else if (stuckLeads > totalLeads * 0.3) health = 'SLUGGISH';

  return {
    totalLeads,
    health,
    stageDistribution,
    segmentDistribution,
    conversionRate: +(conversionRate * 100).toFixed(2) + '%',
    velocity: {
      avgAgeDays,
      stuckLeads,
      stuckPercent: totalLeads > 0 ? +((stuckLeads / totalLeads) * 100).toFixed(1) + '%' : '0%',
    },
    predictedCloseRate: {
      optimistic: +(conversionRate * 1.2 * 100).toFixed(2) + '%',
      realistic: +(conversionRate * 100).toFixed(2) + '%',
      conservative: +(conversionRate * 0.8 * 100).toFixed(2) + '%',
    },
    generatedAt: new Date().toISOString(),
  };
}

// ── Operational Division Report ──────────────────────────────────────────────

const DIVISIONS = {
  EXC: 'Executive',
  SEN: 'Sentinel',
  OPS: 'Operations',
  INT: 'Intelligence',
  MKT: 'Marketing',
  FIN: 'Finance',
  VEN: 'Vendor',
  TEC: 'Technology',
  WEB: 'Web',
};

/**
 * Generate an operational report for a division.
 *
 * @param {string} division — Division code (EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB)
 * @param {string} [period='monthly'] — Reporting period: 'weekly', 'monthly', 'quarterly'
 * @returns {object} Division performance report
 */
export function generateOperationalReport(division, period = 'monthly') {
  const divisionName = DIVISIONS[division?.toUpperCase()];
  if (!divisionName) {
    return { error: `Unknown division: ${division}. Valid: ${Object.keys(DIVISIONS).join(', ')}` };
  }

  const periodConfig = {
    weekly: { label: 'Weekly', days: 7 },
    monthly: { label: 'Monthly', days: 30 },
    quarterly: { label: 'Quarterly', days: 90 },
  }[period] || { label: 'Monthly', days: 30 };

  return {
    division: { code: division.toUpperCase(), name: divisionName },
    period: periodConfig,
    reportFramework: {
      kpis: [
        { name: 'Agent Utilization Rate', target: '85%', unit: '%' },
        { name: 'Task Completion Rate', target: '95%', unit: '%' },
        { name: 'Average Response Time', target: '<500ms', unit: 'ms' },
        { name: 'Error Rate', target: '<1%', unit: '%' },
        { name: 'Quality Score', target: '>90', unit: 'points' },
      ],
      trendAnalysis: {
        compareWith: 'previous_period',
        metrics: ['throughput', 'quality', 'efficiency', 'cost_per_task'],
      },
      recommendations: {
        categories: ['performance', 'resource-allocation', 'process-improvement', 'training'],
        priorityLevels: ['critical', 'high', 'medium', 'low'],
      },
    },
    generatedAt: new Date().toISOString(),
  };
}

// ── Property Health Scoring ──────────────────────────────────────────────────

/**
 * Score the overall health of a managed property.
 *
 * @param {object} property — Property record
 * @param {number} [property.occupancyRate] — 0-1 occupancy ratio
 * @param {number} [property.maintenanceBacklog] — Number of outstanding requests
 * @param {number} [property.tenantSatisfaction] — 0-100 satisfaction score
 * @param {number} [property.monthlyRevenue] — Current monthly revenue
 * @param {number} [property.monthlyExpenses] — Current monthly expenses
 * @param {number} [property.daysVacant] — Days unit has been vacant (0 if occupied)
 * @returns {object} Property health score and breakdown
 */
export function scorePropertyHealth(property = {}) {
  const scores = {};

  // Occupancy — 100% = 100, below 80% starts degrading
  if (property.occupancyRate != null) {
    scores.occupancy = Math.min(100, Math.round(property.occupancyRate * 100));
  }

  // Maintenance backlog — 0 items = 100, 10+ items = 0
  if (property.maintenanceBacklog != null) {
    scores.maintenance = Math.max(0, Math.round(100 - (property.maintenanceBacklog * 10)));
  }

  // Tenant satisfaction — direct score
  if (property.tenantSatisfaction != null) {
    scores.tenantSatisfaction = Math.min(100, Math.round(property.tenantSatisfaction));
  }

  // Financial performance — NOI margin
  if (property.monthlyRevenue != null && property.monthlyExpenses != null && property.monthlyRevenue > 0) {
    const noiMargin = (property.monthlyRevenue - property.monthlyExpenses) / property.monthlyRevenue;
    scores.financial = Math.max(0, Math.min(100, Math.round(noiMargin * 200))); // 50% margin = 100
  }

  // Vacancy penalty
  if (property.daysVacant != null) {
    scores.vacancy = Math.max(0, Math.round(100 - (property.daysVacant * 3.33))); // 30+ days = 0
  }

  const scoreValues = Object.values(scores);
  const compositeScore = scoreValues.length > 0
    ? Math.round(scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length)
    : 0;

  let healthRating;
  if (compositeScore >= 90) healthRating = 'EXCELLENT';
  else if (compositeScore >= 75) healthRating = 'GOOD';
  else if (compositeScore >= 60) healthRating = 'FAIR';
  else if (compositeScore >= 40) healthRating = 'AT_RISK';
  else healthRating = 'CRITICAL';

  return {
    propertyId: property.id || null,
    compositeScore,
    healthRating,
    breakdown: scores,
    flags: [
      ...(scores.occupancy != null && scores.occupancy < 80 ? ['LOW_OCCUPANCY'] : []),
      ...(scores.maintenance != null && scores.maintenance < 50 ? ['HIGH_MAINTENANCE_BACKLOG'] : []),
      ...(scores.tenantSatisfaction != null && scores.tenantSatisfaction < 60 ? ['LOW_TENANT_SATISFACTION'] : []),
      ...(scores.financial != null && scores.financial < 40 ? ['POOR_FINANCIAL_PERFORMANCE'] : []),
      ...(scores.vacancy != null && scores.vacancy < 30 ? ['EXTENDED_VACANCY'] : []),
    ],
    generatedAt: new Date().toISOString(),
  };
}

// ── Tenant Churn Prediction ──────────────────────────────────────────────────

/**
 * Predict tenant churn risk based on behavioral and transactional signals.
 *
 * @param {Array<object>} tenants — Tenant profiles
 * @param {number} [tenants[].leaseRemainingDays] — Days until lease expires
 * @param {number} [tenants[].latePayments] — Count of late payments in last 12 months
 * @param {number} [tenants[].maintenanceRequests] — Maintenance requests in last 12 months
 * @param {number} [tenants[].satisfactionScore] — 0-100 satisfaction score
 * @param {number} [tenants[].yearsAsTenant] — Tenure in years
 * @returns {object} Churn prediction analysis
 */
export function predictChurn(tenants = []) {
  const predictions = tenants.map(tenant => {
    let riskScore = 50; // Start neutral

    // Lease proximity — closer to expiry = higher risk
    if (tenant.leaseRemainingDays != null) {
      if (tenant.leaseRemainingDays <= 30) riskScore += 25;
      else if (tenant.leaseRemainingDays <= 60) riskScore += 15;
      else if (tenant.leaseRemainingDays <= 90) riskScore += 8;
      else riskScore -= 10;
    }

    // Late payments — each one increases risk
    if (tenant.latePayments != null) {
      riskScore += Math.min(25, tenant.latePayments * 8);
    }

    // Maintenance requests — high volume signals dissatisfaction
    if (tenant.maintenanceRequests != null) {
      if (tenant.maintenanceRequests > 6) riskScore += 15;
      else if (tenant.maintenanceRequests > 3) riskScore += 8;
    }

    // Satisfaction — strong retention signal
    if (tenant.satisfactionScore != null) {
      if (tenant.satisfactionScore >= 80) riskScore -= 20;
      else if (tenant.satisfactionScore >= 60) riskScore -= 5;
      else if (tenant.satisfactionScore < 40) riskScore += 20;
    }

    // Tenure — longer tenants are more stable
    if (tenant.yearsAsTenant != null) {
      if (tenant.yearsAsTenant >= 3) riskScore -= 15;
      else if (tenant.yearsAsTenant >= 1) riskScore -= 5;
    }

    riskScore = Math.max(0, Math.min(100, riskScore));

    let riskLevel;
    if (riskScore >= 75) riskLevel = 'HIGH';
    else if (riskScore >= 50) riskLevel = 'MEDIUM';
    else if (riskScore >= 25) riskLevel = 'LOW';
    else riskLevel = 'MINIMAL';

    const retentionActions = [];
    if (riskScore >= 60 && tenant.leaseRemainingDays != null && tenant.leaseRemainingDays <= 60) {
      retentionActions.push('INITIATE_EARLY_RENEWAL_OFFER');
    }
    if (riskScore >= 50 && tenant.satisfactionScore != null && tenant.satisfactionScore < 60) {
      retentionActions.push('SCHEDULE_SATISFACTION_REVIEW');
    }
    if (tenant.maintenanceRequests != null && tenant.maintenanceRequests > 5) {
      retentionActions.push('PRIORITIZE_MAINTENANCE_RESOLUTION');
    }
    if (riskScore >= 70) {
      retentionActions.push('ASSIGN_RETENTION_SPECIALIST');
    }

    return {
      tenantId: tenant.id || null,
      riskScore,
      riskLevel,
      retentionActions,
      factors: {
        leaseProximity: tenant.leaseRemainingDays != null ? `${tenant.leaseRemainingDays} days remaining` : 'N/A',
        paymentHistory: tenant.latePayments != null ? `${tenant.latePayments} late payments (12mo)` : 'N/A',
        maintenanceLoad: tenant.maintenanceRequests != null ? `${tenant.maintenanceRequests} requests (12mo)` : 'N/A',
        satisfaction: tenant.satisfactionScore != null ? `${tenant.satisfactionScore}/100` : 'N/A',
        tenure: tenant.yearsAsTenant != null ? `${tenant.yearsAsTenant} years` : 'N/A',
      },
    };
  });

  const highRisk = predictions.filter(p => p.riskLevel === 'HIGH').length;
  const mediumRisk = predictions.filter(p => p.riskLevel === 'MEDIUM').length;

  return {
    totalTenants: tenants.length,
    summary: {
      highRisk,
      mediumRisk,
      lowRisk: predictions.filter(p => p.riskLevel === 'LOW').length,
      minimal: predictions.filter(p => p.riskLevel === 'MINIMAL').length,
    },
    overallChurnRisk: tenants.length > 0
      ? (highRisk / tenants.length >= 0.2 ? 'ELEVATED' : mediumRisk / tenants.length >= 0.4 ? 'MODERATE' : 'STABLE')
      : 'NO_DATA',
    predictions,
    generatedAt: new Date().toISOString(),
  };
}
