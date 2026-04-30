/**
 * Coastal Key Profit Metrics Engine
 *
 * Core profit-gauging metrics aligned with the Sovereign Governance Framework.
 * Tracks only what matters — no vanity metrics.
 *
 * 7 Core Metrics:
 *   1. Net Operating Income (NOI)
 *   2. Gross Margin (target: 40%+ by Month 12)
 *   3. Revenue per Property
 *   4. Operating Expense Ratio (OER)
 *   5. Automation % & Labor Efficiency
 *   6. CAC vs LTV
 *   7. Zero Preventable Incidents Rate
 *
 * 4 Supporting Metrics:
 *   1. Occupancy/Utilization Rate
 *   2. Client Retention/Churn & NPS
 *   3. Maintenance/Response Efficiency
 *   4. Cash Flow per Property
 */

// ── Targets (from Sovereign Governance Framework) ───────────────────────────

export const TARGETS = {
  grossMargin: { target: 0.40, label: '40%+ by Month 12', unit: '%' },
  oer: { target: 0.40, label: '<40% (industry benchmark)', unit: '%' },
  automationRate: { target: 0.75, label: '≥75% fully AI-automated', unit: '%' },
  preventableIncidents: { target: 0, label: 'Zero preventable incidents', unit: 'count' },
  nps: { target: 4.8, label: '≥4.8/5.0', unit: 'score' },
  breakEven: { target: 6, label: 'Break-even in 6 months', unit: 'months' },
  ltvCacRatio: { target: 3.0, label: '≥3:1 LTV:CAC ratio', unit: 'ratio' },
};

// ── Revenue Line Items ──────────────────────────────────────────────────────

export const REVENUE_LINES = {
  managementFees: { label: 'Management Fees', category: 'recurring', description: 'Monthly % of collected rent per property' },
  homeWatchFees: { label: 'Home Watch Services', category: 'recurring', description: 'Scheduled visits for absent/seasonal owners' },
  conciergeAddOns: { label: 'Concierge Add-Ons', category: 'recurring', description: 'Premium services for luxury/STR properties' },
  leasingFees: { label: 'Leasing/Placement Fees', category: 'one-time', description: 'Tenant placement commissions' },
  maintenanceMarkup: { label: 'Maintenance Markup', category: 'variable', description: '10-15% markup on vendor invoices' },
  retailCrossSell: { label: 'Retail Cross-Sell', category: 'variable', description: 'Insurance, smart home, partner referrals' },
};

// ── Operating Expense Categories ────────────────────────────────────────────

export const EXPENSE_CATEGORIES = {
  technology: { label: 'Technology & AI', items: ['Grok SuperGrok ($3.99/mo)', 'Portal hosting (<$20/mo)', 'IoT sensors', 'API costs'], budgetRange: [50, 200] },
  labor: { label: 'Labor (Ops Managers)', items: ['Part-time ops coordinators', 'Emergency response coverage'], budgetRange: [0, 3000] },
  insurance: { label: 'Insurance & Compliance', items: ['E&O insurance', 'GL insurance', 'Workers comp'], budgetRange: [200, 500] },
  marketing: { label: 'Marketing & Acquisition', items: ['AI-generated content', 'Referral incentives', 'Realtor partnerships'], budgetRange: [100, 500] },
  vendors: { label: 'Vendor Coordination', items: ['Maintenance dispatch', 'Emergency vendor fees'], budgetRange: [0, 1000] },
  overhead: { label: 'Overhead', items: ['Phone/communications', 'Vehicle/fuel', 'Office/supplies'], budgetRange: [100, 400] },
};

// ── Core Metric Calculators ─────────────────────────────────────────────────

export function calculateNOI(revenue, operatingExpenses) {
  const totalRevenue = Object.values(revenue).reduce((s, v) => s + (v || 0), 0);
  const totalExpenses = Object.values(operatingExpenses).reduce((s, v) => s + (v || 0), 0);
  const noi = totalRevenue - totalExpenses;
  return {
    metric: 'Net Operating Income (NOI)',
    value: noi,
    totalRevenue,
    totalExpenses,
    margin: totalRevenue > 0 ? (noi / totalRevenue * 100).toFixed(1) + '%' : '0%',
    status: noi > 0 ? 'PROFITABLE' : 'OPERATING_LOSS',
    description: 'Primary profitability scorecard. Revenue minus operating expenses, excluding debt service, taxes, and capex.',
  };
}

export function calculateGrossMargin(revenue, costOfServices) {
  const totalRevenue = typeof revenue === 'number' ? revenue : Object.values(revenue).reduce((s, v) => s + (v || 0), 0);
  const totalCost = typeof costOfServices === 'number' ? costOfServices : Object.values(costOfServices).reduce((s, v) => s + (v || 0), 0);
  const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) : 0;
  return {
    metric: 'Gross Margin',
    value: (margin * 100).toFixed(1) + '%',
    raw: margin,
    target: TARGETS.grossMargin.target * 100 + '%',
    onTarget: margin >= TARGETS.grossMargin.target,
    gap: margin >= TARGETS.grossMargin.target ? 0 : ((TARGETS.grossMargin.target - margin) * 100).toFixed(1) + '% below target',
    description: 'Directly measures efficiency of the AI-heavy model. High margin validates low-cost capitalization.',
  };
}

export function calculateRevenuePerProperty(totalRevenue, propertyCount) {
  const rpp = propertyCount > 0 ? totalRevenue / propertyCount : 0;
  return {
    metric: 'Revenue per Property',
    value: rpp.toFixed(2),
    totalRevenue,
    propertyCount,
    monthlyAvg: (rpp / 12).toFixed(2),
    description: 'Reveals scalability and pricing power in the Treasure Coast seasonal market.',
  };
}

export function calculateOER(operatingExpenses, grossRevenue) {
  const ratio = grossRevenue > 0 ? (operatingExpenses / grossRevenue) : 0;
  return {
    metric: 'Operating Expense Ratio (OER)',
    value: (ratio * 100).toFixed(1) + '%',
    raw: ratio,
    target: '<' + (TARGETS.oer.target * 100) + '%',
    onTarget: ratio <= TARGETS.oer.target,
    status: ratio <= 0.35 ? 'EXCELLENT' : ratio <= 0.40 ? 'ON_TARGET' : ratio <= 0.50 ? 'CAUTION' : 'ACTION_REQUIRED',
    description: 'Controls costs that eat into profits. AI predictive risk mitigation keeps this tight.',
  };
}

export function calculateAutomationRate(automatedTasks, totalTasks) {
  const rate = totalTasks > 0 ? automatedTasks / totalTasks : 0;
  return {
    metric: 'Automation % & Labor Efficiency',
    value: (rate * 100).toFixed(1) + '%',
    raw: rate,
    automatedTasks,
    totalTasks,
    humanTasks: totalTasks - automatedTasks,
    target: TARGETS.automationRate.target * 100 + '%',
    onTarget: rate >= TARGETS.automationRate.target,
    description: 'Labor is a major expense in traditional home watch. High automation directly boosts margins.',
  };
}

export function calculateCACvsLTV(acquisitionCosts, totalNewClients, avgContractValue, avgRetentionMonths) {
  const cac = totalNewClients > 0 ? acquisitionCosts / totalNewClients : 0;
  const ltv = avgContractValue * avgRetentionMonths;
  const ratio = cac > 0 ? ltv / cac : 0;
  return {
    metric: 'CAC vs LTV',
    cac: cac.toFixed(2),
    ltv: ltv.toFixed(2),
    ratio: ratio.toFixed(1) + ':1',
    rawRatio: ratio,
    target: TARGETS.ltvCacRatio.target + ':1',
    onTarget: ratio >= TARGETS.ltvCacRatio.target,
    status: ratio >= 5 ? 'EXCELLENT' : ratio >= 3 ? 'HEALTHY' : ratio >= 1 ? 'MARGINAL' : 'UNSUSTAINABLE',
    description: 'Ensures profitable growth. Low CAC via AI marketing + high LTV from recurring contracts.',
  };
}

export function calculatePreventableIncidents(incidents) {
  const count = Array.isArray(incidents) ? incidents.length : (incidents || 0);
  return {
    metric: 'Zero Preventable Incidents Rate',
    value: count,
    target: TARGETS.preventableIncidents.target,
    onTarget: count === 0,
    status: count === 0 ? 'ZERO_INCIDENTS' : count <= 2 ? 'NEAR_ZERO' : 'ACTION_REQUIRED',
    categories: {
      waterDamage: 0,
      pestOutbreak: 0,
      securityBreach: 0,
      insuranceDenial: 0,
      hvacFailure: 0,
    },
    description: 'Major incidents are profit killers in Florida\'s high-risk climate. AI predicts and logs every risk event.',
  };
}

// ── Supporting Metric Calculators ────────────────────────────────────────────

export function calculateOccupancy(occupiedDays, totalDays) {
  const rate = totalDays > 0 ? occupiedDays / totalDays : 0;
  return {
    metric: 'Occupancy/Utilization Rate',
    value: (rate * 100).toFixed(1) + '%',
    raw: rate,
    occupiedDays,
    totalDays,
    description: 'Percentage of time properties are occupied/monitored effectively.',
  };
}

export function calculateRetention(activeClients, startOfPeriodClients, newClients, npsScore) {
  const churned = (startOfPeriodClients + newClients) - activeClients;
  const churnRate = startOfPeriodClients > 0 ? churned / startOfPeriodClients : 0;
  const retentionRate = 1 - churnRate;
  return {
    metric: 'Client Retention & NPS',
    retentionRate: (retentionRate * 100).toFixed(1) + '%',
    churnRate: (churnRate * 100).toFixed(1) + '%',
    nps: npsScore || 0,
    npsTarget: TARGETS.nps.target,
    npsOnTarget: (npsScore || 0) >= TARGETS.nps.target,
    description: 'Retention is far cheaper than acquisition. Predictive AI drives renewals and referrals.',
  };
}

export function calculateMaintenanceEfficiency(totalWorkOrders, totalCost, avgResponseMinutes) {
  const costPerOrder = totalWorkOrders > 0 ? totalCost / totalWorkOrders : 0;
  return {
    metric: 'Maintenance/Response Efficiency',
    costPerWorkOrder: costPerOrder.toFixed(2),
    totalWorkOrders,
    totalCost,
    avgResponseMinutes,
    status: avgResponseMinutes <= 30 ? 'EXCELLENT' : avgResponseMinutes <= 60 ? 'GOOD' : 'NEEDS_IMPROVEMENT',
    description: 'Cost per work order and response time — kept low via AI coordination to protect NOI.',
  };
}

export function calculateCashFlowPerProperty(netCashFlow, propertyCount) {
  const cfpp = propertyCount > 0 ? netCashFlow / propertyCount : 0;
  return {
    metric: 'Cash Flow per Property',
    value: cfpp.toFixed(2),
    netCashFlow,
    propertyCount,
    status: cfpp > 0 ? 'POSITIVE' : 'NEGATIVE',
    description: 'Ensures liquidity and break-even progress.',
  };
}

// ── Full Dashboard Generator ────────────────────────────────────────────────

export function generateProfitDashboard(data = {}) {
  const {
    revenue = {},
    costOfServices = {},
    operatingExpenses = {},
    propertyCount = 0,
    automatedTasks = 0,
    totalTasks = 0,
    acquisitionCosts = 0,
    newClients = 0,
    avgContractValue = 0,
    avgRetentionMonths = 0,
    incidents = 0,
    occupiedDays = 0,
    totalDays = 0,
    activeClients = 0,
    startOfPeriodClients = 0,
    npsScore = 0,
    workOrders = 0,
    maintenanceCost = 0,
    avgResponseMinutes = 0,
    netCashFlow = 0,
  } = data;

  const totalRevenue = Object.values(revenue).reduce((s, v) => s + (v || 0), 0);
  const totalExpenses = Object.values(operatingExpenses).reduce((s, v) => s + (v || 0), 0);
  const totalCost = Object.values(costOfServices).reduce((s, v) => s + (v || 0), 0);

  return {
    dashboard: 'Coastal Key Profit Metrics',
    framework: 'Sovereign Governance',
    mission: 'AI-powered, predictive home watch and property management that eliminates risk and creates total peace of mind for Treasure Coast property owners at a fraction of traditional cost with zero preventable incidents.',
    generatedAt: new Date().toISOString(),

    coreMetrics: {
      noi: calculateNOI(revenue, operatingExpenses),
      grossMargin: calculateGrossMargin(totalRevenue, totalCost),
      revenuePerProperty: calculateRevenuePerProperty(totalRevenue, propertyCount),
      oer: calculateOER(totalExpenses, totalRevenue),
      automationRate: calculateAutomationRate(automatedTasks, totalTasks),
      cacVsLtv: calculateCACvsLTV(acquisitionCosts, newClients, avgContractValue, avgRetentionMonths),
      preventableIncidents: calculatePreventableIncidents(incidents),
    },

    supportingMetrics: {
      occupancy: calculateOccupancy(occupiedDays, totalDays),
      retention: calculateRetention(activeClients, startOfPeriodClients, newClients, npsScore),
      maintenanceEfficiency: calculateMaintenanceEfficiency(workOrders, maintenanceCost, avgResponseMinutes),
      cashFlowPerProperty: calculateCashFlowPerProperty(netCashFlow, propertyCount),
    },

    targets: TARGETS,
    revenueLines: REVENUE_LINES,
    expenseCategories: EXPENSE_CATEGORIES,

    governanceNote: 'Any metric missing targets triggers immediate governance review (Iterate or Die). AI suggests pivots for margin lift.',
  };
}
