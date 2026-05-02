/**
 * ITAM KPI Engine — IT Asset Management Key Performance Indicators
 *
 * Measures asset utilization, license compliance, and TCO to ensure
 * cost savings, compliance, and reduced risk across the Coastal Key
 * enterprise platform.
 *
 * 5 KPI Categories, 25 Metrics:
 *   1. Client Trust & Retention (most critical)
 *   2. Operational Precision & Safety
 *   3. Financial & Growth
 *   4. Employee/Operator Performance
 *   5. Asset Management Core (lifecycle, downtime, warranty, reclamation)
 *
 * Strategic Themes: Service-to-Cash Cycle, Aged AR, Brand Sentiment
 */

// ── KPI Category 1: Client Trust & Retention (Most Critical) ───────────────

export const CLIENT_TRUST_KPIS = {
  clientRetentionRate: {
    id: 'CTR-001',
    name: 'Client Retention Rate',
    description: 'Percentage of clients retained period-over-period',
    formula: '(clients_end - clients_new) / clients_start * 100',
    target: 95,
    unit: '%',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Revenue loss, brand damage, referral pipeline collapse',
    threshold: { green: 95, yellow: 85, red: 75 },
  },
  netPromoterScore: {
    id: 'CTR-002',
    name: 'Net Promoter Score (NPS)',
    description: 'Client likelihood to recommend Coastal Key',
    formula: '% promoters (9-10) - % detractors (0-6)',
    target: 70,
    unit: 'score',
    frequency: 'quarterly',
    priority: 'P0',
    riskImpact: 'Brand erosion, organic growth stall',
    threshold: { green: 70, yellow: 50, red: 30 },
  },
  clientSatisfactionScore: {
    id: 'CTR-003',
    name: 'Client Satisfaction Score (CSAT)',
    description: 'Post-service satisfaction rating',
    formula: 'sum(satisfied_responses) / total_responses * 100',
    target: 4.8,
    unit: 'out of 5.0',
    frequency: 'per-interaction',
    priority: 'P0',
    riskImpact: 'Churn acceleration, negative reviews',
    threshold: { green: 4.8, yellow: 4.2, red: 3.5 },
  },
  contractRenewalRate: {
    id: 'CTR-004',
    name: 'Contract Renewal Rate',
    description: 'Percentage of contracts renewed at term',
    formula: 'contracts_renewed / contracts_expiring * 100',
    target: 90,
    unit: '%',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Revenue churn, pipeline pressure',
    threshold: { green: 90, yellow: 80, red: 70 },
  },
  clientEscalationRate: {
    id: 'CTR-005',
    name: 'Client Escalation Rate',
    description: 'Percentage of interactions requiring escalation',
    formula: 'escalated_interactions / total_interactions * 100',
    target: 5,
    unit: '%',
    frequency: 'weekly',
    priority: 'P1',
    riskImpact: 'Operational bottleneck, CEO time drain',
    threshold: { green: 5, yellow: 10, red: 20 },
    invertThreshold: true,
  },
};

// ── KPI Category 2: Operational Precision & Safety ─────────────────────────

export const OPERATIONAL_KPIS = {
  firstTimeFixRate: {
    id: 'OPS-KPI-001',
    name: 'First Time Fix Rate',
    description: 'Percentage of maintenance issues resolved on first visit',
    formula: 'first_visit_resolved / total_dispatches * 100',
    target: 85,
    unit: '%',
    frequency: 'weekly',
    priority: 'P0',
    riskImpact: 'Repeat dispatches, vendor cost inflation, client frustration',
    threshold: { green: 85, yellow: 70, red: 55 },
  },
  inspectionAccuracyRate: {
    id: 'OPS-KPI-002',
    name: 'Inspection Accuracy Rate',
    description: 'Percentage of inspections with zero reporting errors or omissions',
    formula: 'accurate_inspections / total_inspections * 100',
    target: 98,
    unit: '%',
    frequency: 'weekly',
    priority: 'P0',
    riskImpact: 'Liability exposure, missed deficiencies, insurance claims',
    threshold: { green: 98, yellow: 92, red: 85 },
  },
  missedInspectionRate: {
    id: 'OPS-KPI-003',
    name: 'Missed Inspection Rate',
    description: 'Percentage of scheduled inspections not completed on time',
    formula: 'missed_inspections / scheduled_inspections * 100',
    target: 0,
    unit: '%',
    frequency: 'weekly',
    priority: 'P0',
    riskImpact: 'Contract breach, property damage escalation, client trust loss',
    threshold: { green: 1, yellow: 5, red: 10 },
    invertThreshold: true,
  },
  meanTimeToDetect: {
    id: 'OPS-KPI-004',
    name: 'Mean Time to Detect (MTTD)',
    description: 'Average time from issue occurrence to detection',
    formula: 'sum(detection_time - occurrence_time) / total_issues',
    target: 4,
    unit: 'hours',
    frequency: 'weekly',
    priority: 'P1',
    riskImpact: 'Water damage escalation, mold, structural degradation',
    threshold: { green: 4, yellow: 12, red: 24 },
    invertThreshold: true,
  },
  meanTimeToResolve: {
    id: 'OPS-KPI-005',
    name: 'Mean Time to Resolve (MTTR)',
    description: 'Average time from detection to resolution',
    formula: 'sum(resolution_time - detection_time) / total_issues',
    target: 24,
    unit: 'hours',
    frequency: 'weekly',
    priority: 'P1',
    riskImpact: 'Extended property exposure, client dissatisfaction',
    threshold: { green: 24, yellow: 48, red: 72 },
    invertThreshold: true,
  },
};

// ── KPI Category 3: Financial & Growth ─────────────────────────────────────

export const FINANCIAL_KPIS = {
  grossMarginPercentage: {
    id: 'FIN-KPI-001',
    name: 'Gross Margin Percentage',
    description: 'Revenue minus direct costs as percentage of revenue',
    formula: '(revenue - cogs) / revenue * 100',
    target: 40,
    unit: '%',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Unsustainable operations, inability to reinvest',
    threshold: { green: 40, yellow: 30, red: 20 },
  },
  averageRevenuePerUnit: {
    id: 'FIN-KPI-002',
    name: 'Average Revenue Per Unit (ARPU)',
    description: 'Average monthly revenue per managed property',
    formula: 'total_revenue / total_managed_properties',
    target: 250,
    unit: '$/property/month',
    frequency: 'monthly',
    priority: 'P1',
    riskImpact: 'Revenue density too low for operational viability',
    threshold: { green: 250, yellow: 180, red: 120 },
  },
  customerLifetimeValue: {
    id: 'FIN-KPI-003',
    name: 'Customer Lifetime Value (CLV)',
    description: 'Total revenue expected from a client over the relationship',
    formula: 'arpu * avg_client_lifespan_months * gross_margin',
    target: 15000,
    unit: '$',
    frequency: 'quarterly',
    priority: 'P1',
    riskImpact: 'Acquisition spend exceeds return, negative ROI',
    threshold: { green: 15000, yellow: 8000, red: 4000 },
  },
  customerAcquisitionCost: {
    id: 'FIN-KPI-004',
    name: 'Customer Acquisition Cost (CAC)',
    description: 'Total cost to acquire a new client',
    formula: '(marketing_spend + sales_spend) / new_clients_acquired',
    target: 500,
    unit: '$',
    frequency: 'monthly',
    priority: 'P1',
    riskImpact: 'Unsustainable growth, cash burn',
    threshold: { green: 500, yellow: 1000, red: 2000 },
    invertThreshold: true,
  },
  ltvCacRatio: {
    id: 'FIN-KPI-005',
    name: 'LTV:CAC Ratio',
    description: 'Customer lifetime value relative to acquisition cost',
    formula: 'clv / cac',
    target: 3.0,
    unit: 'ratio',
    frequency: 'quarterly',
    priority: 'P0',
    riskImpact: 'Negative unit economics, cash drain on growth',
    threshold: { green: 3.0, yellow: 2.0, red: 1.0 },
  },
  serviceMixRevenueShare: {
    id: 'FIN-KPI-006',
    name: 'Service Mix Revenue Share',
    description: 'Revenue distribution across service lines',
    formula: 'revenue_per_service / total_revenue * 100',
    target: null,
    unit: '%',
    frequency: 'monthly',
    priority: 'P2',
    riskImpact: 'Over-reliance on single revenue stream',
    breakdown: {
      managementFees: { target: 50, label: 'Management Fees (recurring)' },
      homeWatch: { target: 20, label: 'Home Watch (recurring)' },
      leasing: { target: 10, label: 'Leasing Fees (transactional)' },
      maintenance: { target: 10, label: 'Maintenance Markup (variable)' },
      concierge: { target: 5, label: 'Concierge Add-Ons (recurring)' },
      other: { target: 5, label: 'Other (referrals, commissions)' },
    },
  },
};

// ── KPI Category 4: Employee/Operator Performance ──────────────────────────

export const EMPLOYEE_KPIS = {
  technicianUtilizationRate: {
    id: 'EMP-KPI-001',
    name: 'Technician Utilization Rate',
    description: 'Percentage of scheduled hours spent on billable/productive work',
    formula: 'productive_hours / available_hours * 100',
    target: 80,
    unit: '%',
    frequency: 'weekly',
    priority: 'P1',
    riskImpact: 'Labor cost inflation, margin compression',
    threshold: { green: 80, yellow: 65, red: 50 },
  },
  averageInspectionTime: {
    id: 'EMP-KPI-002',
    name: 'Average Inspection Time',
    description: 'Mean duration per completed inspection',
    formula: 'sum(inspection_durations) / total_inspections',
    target: 45,
    unit: 'minutes',
    frequency: 'weekly',
    priority: 'P2',
    riskImpact: 'Scheduling bottleneck, reduced daily capacity',
    threshold: { green: 45, yellow: 60, red: 90 },
    invertThreshold: true,
  },
  inspectionsPerDay: {
    id: 'EMP-KPI-003',
    name: 'Inspections Per Day',
    description: 'Average number of inspections completed per operator per day',
    formula: 'total_inspections / (operator_count * working_days)',
    target: 8,
    unit: 'inspections',
    frequency: 'weekly',
    priority: 'P2',
    riskImpact: 'Capacity constraint, growth bottleneck',
    threshold: { green: 8, yellow: 5, red: 3 },
  },
};

// ── KPI Category 5: Asset Management Core ──────────────────────────────────

export const ASSET_KPIS = {
  lifecycleCost: {
    id: 'AST-KPI-001',
    name: 'Total Cost of Ownership (TCO)',
    description: 'Full lifecycle cost per asset: acquisition + operation + maintenance + disposal',
    formula: 'acquisition_cost + cumulative_maintenance + operational_cost + disposal_cost',
    target: null,
    unit: '$',
    frequency: 'quarterly',
    priority: 'P1',
    riskImpact: 'Hidden cost overruns, poor capital allocation',
    components: {
      acquisition: 'Purchase price, installation, configuration',
      operation: 'Energy, hosting, licensing, subscription fees',
      maintenance: 'Preventive, corrective, emergency repairs',
      disposal: 'Decommission, data wipe, recycling, replacement',
    },
  },
  downtimeFrequency: {
    id: 'AST-KPI-002',
    name: 'Downtime Frequency',
    description: 'Number of unplanned downtime events per asset per period',
    formula: 'unplanned_downtime_events / asset_count',
    target: 0.5,
    unit: 'events/asset/month',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Service disruption, SLA breach, client impact',
    threshold: { green: 0.5, yellow: 1.5, red: 3.0 },
    invertThreshold: true,
  },
  assetUptime: {
    id: 'AST-KPI-003',
    name: 'Asset Uptime Rate',
    description: 'Percentage of time assets are operational and available',
    formula: '(total_hours - downtime_hours) / total_hours * 100',
    target: 99.5,
    unit: '%',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Operational disruption, revenue loss',
    threshold: { green: 99.5, yellow: 98, red: 95 },
  },
  warrantyStatus: {
    id: 'AST-KPI-004',
    name: 'Warranty Coverage Rate',
    description: 'Percentage of active assets currently under warranty',
    formula: 'assets_under_warranty / total_active_assets * 100',
    target: 80,
    unit: '%',
    frequency: 'monthly',
    priority: 'P1',
    riskImpact: 'Unbudgeted repair costs, capital exposure',
    threshold: { green: 80, yellow: 60, red: 40 },
  },
  softwareReclamationRate: {
    id: 'AST-KPI-005',
    name: 'Software Reclamation Rate',
    description: 'Percentage of unused software licenses reclaimed and reallocated',
    formula: 'licenses_reclaimed / total_unused_licenses * 100',
    target: 90,
    unit: '%',
    frequency: 'quarterly',
    priority: 'P1',
    riskImpact: 'Wasted licensing spend, compliance risk',
    threshold: { green: 90, yellow: 70, red: 50 },
  },
  licenseComplianceRate: {
    id: 'AST-KPI-006',
    name: 'License Compliance Rate',
    description: 'Percentage of software installations with valid licenses',
    formula: 'compliant_installations / total_installations * 100',
    target: 100,
    unit: '%',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Audit penalties, legal exposure, vendor contract breach',
    threshold: { green: 100, yellow: 95, red: 90 },
  },
  assetUtilizationRate: {
    id: 'AST-KPI-007',
    name: 'Asset Utilization Rate',
    description: 'Percentage of deployed assets actively generating value',
    formula: 'actively_used_assets / total_deployed_assets * 100',
    target: 85,
    unit: '%',
    frequency: 'monthly',
    priority: 'P1',
    riskImpact: 'Capital tied up in idle assets, ROI degradation',
    threshold: { green: 85, yellow: 70, red: 55 },
  },
};

// ── Strategic Themes ───────────────────────────────────────────────────────

export const STRATEGIC_THEMES = {
  serviceToCashCycle: {
    id: 'STR-001',
    name: 'Service-to-Cash Cycle',
    description: 'Days from service delivery to payment collection',
    formula: 'avg(payment_date - service_date)',
    target: 15,
    unit: 'days',
    frequency: 'monthly',
    priority: 'P0',
    riskImpact: 'Cash flow strain, working capital pressure',
    threshold: { green: 15, yellow: 30, red: 45 },
    invertThreshold: true,
  },
  agedAccountsReceivable: {
    id: 'STR-002',
    name: 'Aged Accounts Receivable',
    description: 'Percentage of receivables past 30 days',
    formula: 'ar_over_30_days / total_ar * 100',
    target: 10,
    unit: '%',
    frequency: 'weekly',
    priority: 'P0',
    riskImpact: 'Cash flow disruption, bad debt write-offs',
    threshold: { green: 10, yellow: 20, red: 35 },
    invertThreshold: true,
    agingBuckets: {
      current: '0-30 days',
      aging30: '31-60 days',
      aging60: '61-90 days',
      aging90: '90+ days (collections trigger)',
    },
  },
  brandSentiment: {
    id: 'STR-003',
    name: 'Brand Sentiment Score',
    description: 'Aggregate sentiment from reviews, social mentions, and surveys',
    formula: '(positive_mentions - negative_mentions) / total_mentions * 100',
    target: 80,
    unit: 'score (0-100)',
    frequency: 'monthly',
    priority: 'P1',
    riskImpact: 'Reputation damage, organic lead decline',
    threshold: { green: 80, yellow: 60, red: 40 },
    sources: ['Google Reviews', 'Yelp', 'Alignable', 'Facebook', 'NPS surveys', 'Slack feedback'],
  },
};

// ── KPI Scoring Engine ─────────────────────────────────────────────────────

export function scoreKpi(kpi, actual) {
  if (actual === null || actual === undefined) {
    return { status: 'NO_DATA', color: '#6b7280', score: 0 };
  }

  const t = kpi.threshold;
  if (!t) return { status: 'TRACKED', color: '#3b82f6', score: null };

  const invert = kpi.invertThreshold;

  if (invert) {
    if (actual <= t.green) return { status: 'GREEN', color: '#22c55e', score: 100 };
    if (actual <= t.yellow) return { status: 'YELLOW', color: '#eab308', score: 60 };
    return { status: 'RED', color: '#ef4444', score: 20 };
  }

  if (actual >= t.green) return { status: 'GREEN', color: '#22c55e', score: 100 };
  if (actual >= t.yellow) return { status: 'YELLOW', color: '#eab308', score: 60 };
  return { status: 'RED', color: '#ef4444', score: 20 };
}

// ── TCO Calculator ─────────────────────────────────────────────────────────

export function calculateTCO(asset) {
  const acquisition = asset.purchasePrice + (asset.installationCost || 0) + (asset.configurationCost || 0);
  const annualOps = (asset.annualLicensing || 0) + (asset.annualHosting || 0) + (asset.annualEnergy || 0);
  const yearsOwned = asset.yearsOwned || 1;
  const totalMaintenance = asset.totalMaintenanceCost || 0;
  const disposal = asset.estimatedDisposalCost || 0;

  const totalTCO = acquisition + (annualOps * yearsOwned) + totalMaintenance + disposal;
  const annualizedTCO = totalTCO / yearsOwned;
  const monthlyTCO = annualizedTCO / 12;

  return {
    assetId: asset.id,
    assetName: asset.name,
    breakdown: {
      acquisition,
      operations: annualOps * yearsOwned,
      maintenance: totalMaintenance,
      disposal,
    },
    totalTCO,
    annualizedTCO: Math.round(annualizedTCO),
    monthlyTCO: Math.round(monthlyTCO),
    costPerDay: Math.round(annualizedTCO / 365),
    yearsOwned,
    roiBreakeven: acquisition / (asset.annualValueGenerated || 1),
  };
}

// ── Composite Health Score ─────────────────────────────────────────────────

export function calculateHealthScore(metrics) {
  const weights = {
    clientTrust: 0.30,
    operational: 0.25,
    financial: 0.20,
    asset: 0.15,
    employee: 0.10,
  };

  const categoryScores = {};
  let weightedTotal = 0;

  for (const [category, weight] of Object.entries(weights)) {
    const categoryMetrics = metrics[category] || [];
    if (categoryMetrics.length === 0) {
      categoryScores[category] = { score: 0, weight, weighted: 0, count: 0 };
      continue;
    }

    const avgScore = categoryMetrics.reduce((sum, m) => sum + (m.score || 0), 0) / categoryMetrics.length;
    const weighted = avgScore * weight;
    weightedTotal += weighted;

    categoryScores[category] = {
      score: Math.round(avgScore),
      weight,
      weighted: Math.round(weighted),
      count: categoryMetrics.length,
    };
  }

  const overallScore = Math.round(weightedTotal);
  let grade;
  if (overallScore >= 90) grade = 'A';
  else if (overallScore >= 80) grade = 'B';
  else if (overallScore >= 70) grade = 'C';
  else if (overallScore >= 60) grade = 'D';
  else grade = 'F';

  return {
    overallScore,
    grade,
    status: overallScore >= 80 ? 'HEALTHY' : overallScore >= 60 ? 'AT_RISK' : 'CRITICAL',
    categories: categoryScores,
    timestamp: new Date().toISOString(),
  };
}

// ── Dashboard Generator ────────────────────────────────────────────────────

export function getITAMDashboard() {
  const allKpis = {
    clientTrust: CLIENT_TRUST_KPIS,
    operational: OPERATIONAL_KPIS,
    financial: FINANCIAL_KPIS,
    employee: EMPLOYEE_KPIS,
    asset: ASSET_KPIS,
  };

  const totalKpis = Object.values(allKpis).reduce((sum, cat) => sum + Object.keys(cat).length, 0);

  return {
    engine: 'ITAM KPI Engine',
    version: '1.0.0',
    description: 'IT Asset Management KPIs — asset utilization, license compliance, TCO, operational precision, and client trust metrics',
    governance: 'Sovereign Governance Framework — Ferrari Precision, Zero Defect Tolerance',
    categories: {
      clientTrust: {
        label: 'Client Trust & Retention',
        priority: 'MOST CRITICAL',
        weight: '30%',
        count: Object.keys(CLIENT_TRUST_KPIS).length,
        kpis: Object.values(CLIENT_TRUST_KPIS),
      },
      operational: {
        label: 'Operational Precision & Safety',
        weight: '25%',
        count: Object.keys(OPERATIONAL_KPIS).length,
        kpis: Object.values(OPERATIONAL_KPIS),
      },
      financial: {
        label: 'Financial & Growth',
        weight: '20%',
        count: Object.keys(FINANCIAL_KPIS).length,
        kpis: Object.values(FINANCIAL_KPIS),
      },
      asset: {
        label: 'Asset Management Core',
        weight: '15%',
        count: Object.keys(ASSET_KPIS).length,
        kpis: Object.values(ASSET_KPIS),
      },
      employee: {
        label: 'Employee/Operator Performance',
        weight: '10%',
        count: Object.keys(EMPLOYEE_KPIS).length,
        kpis: Object.values(EMPLOYEE_KPIS),
      },
    },
    strategicThemes: Object.values(STRATEGIC_THEMES),
    totalKpis,
    totalWithStrategic: totalKpis + Object.keys(STRATEGIC_THEMES).length,
    endpoints: {
      dashboard: 'GET /v1/itam/dashboard',
      kpis: 'GET /v1/itam/kpis',
      category: 'GET /v1/itam/kpis/:category',
      score: 'POST /v1/itam/score',
      tco: 'POST /v1/itam/tco',
      health: 'GET /v1/itam/health',
      strategic: 'GET /v1/itam/strategic',
    },
    timestamp: new Date().toISOString(),
  };
}
