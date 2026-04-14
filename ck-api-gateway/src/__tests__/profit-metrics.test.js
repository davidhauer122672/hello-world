/**
 * Profit Metrics Engine + Route Handler Tests
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Engine Tests ────────────────────────────────────────────────────────────

describe('Profit Metrics Engine — Core Calculations', async () => {
  const {
    calculateNOI, calculateGrossMargin, calculateRevenuePerProperty,
    calculateOER, calculateAutomationRate, calculateCACvsLTV,
    calculatePreventableIncidents, calculateOccupancy, calculateRetention,
    calculateMaintenanceEfficiency, calculateCashFlowPerProperty,
    generateProfitDashboard, TARGETS, REVENUE_LINES, EXPENSE_CATEGORIES,
  } = await import('../engines/profit-metrics.js');

  it('calculates NOI correctly', () => {
    const result = calculateNOI(
      { managementFees: 10000, homeWatch: 5000 },
      { labor: 3000, technology: 200, marketing: 500 }
    );
    assert.equal(result.value, 11300);
    assert.equal(result.totalRevenue, 15000);
    assert.equal(result.totalExpenses, 3700);
    assert.equal(result.status, 'PROFITABLE');
  });

  it('flags operating loss when expenses exceed revenue', () => {
    const result = calculateNOI({ fees: 1000 }, { labor: 5000 });
    assert.equal(result.status, 'OPERATING_LOSS');
    assert.ok(result.value < 0);
  });

  it('calculates gross margin at 40% target', () => {
    const result = calculateGrossMargin(10000, 6000);
    assert.equal(result.value, '40.0%');
    assert.equal(result.onTarget, true);
  });

  it('flags gross margin below target', () => {
    const result = calculateGrossMargin(10000, 7000);
    assert.equal(result.value, '30.0%');
    assert.equal(result.onTarget, false);
    assert.ok(result.gap.includes('below target'));
  });

  it('calculates revenue per property', () => {
    const result = calculateRevenuePerProperty(120000, 10);
    assert.equal(result.value, '12000.00');
    assert.equal(result.monthlyAvg, '1000.00');
  });

  it('handles zero properties', () => {
    const result = calculateRevenuePerProperty(50000, 0);
    assert.equal(result.value, '0.00');
  });

  it('calculates OER within target', () => {
    const result = calculateOER(3500, 10000);
    assert.equal(result.value, '35.0%');
    assert.equal(result.onTarget, true);
    assert.equal(result.status, 'EXCELLENT');
  });

  it('flags OER above target', () => {
    const result = calculateOER(5500, 10000);
    assert.equal(result.onTarget, false);
    assert.equal(result.status, 'ACTION_REQUIRED');
  });

  it('calculates automation rate at target', () => {
    const result = calculateAutomationRate(80, 100);
    assert.equal(result.value, '80.0%');
    assert.equal(result.onTarget, true);
    assert.equal(result.humanTasks, 20);
  });

  it('flags automation rate below target', () => {
    const result = calculateAutomationRate(50, 100);
    assert.equal(result.onTarget, false);
  });

  it('calculates healthy CAC vs LTV ratio', () => {
    const result = calculateCACvsLTV(1000, 10, 200, 24);
    assert.equal(result.cac, '100.00');
    assert.equal(result.ltv, '4800.00');
    assert.equal(result.ratio, '48.0:1');
    assert.equal(result.status, 'EXCELLENT');
    assert.equal(result.onTarget, true);
  });

  it('flags unsustainable CAC vs LTV', () => {
    const result = calculateCACvsLTV(5000, 10, 50, 6);
    assert.equal(result.status, 'UNSUSTAINABLE');
    assert.equal(result.onTarget, false);
  });

  it('reports zero preventable incidents', () => {
    const result = calculatePreventableIncidents(0);
    assert.equal(result.value, 0);
    assert.equal(result.onTarget, true);
    assert.equal(result.status, 'ZERO_INCIDENTS');
  });

  it('flags non-zero incidents', () => {
    const result = calculatePreventableIncidents(3);
    assert.equal(result.onTarget, false);
    assert.equal(result.status, 'ACTION_REQUIRED');
  });

  it('calculates occupancy rate', () => {
    const result = calculateOccupancy(270, 365);
    assert.equal(result.value, '74.0%');
  });

  it('calculates client retention', () => {
    const result = calculateRetention(95, 100, 5, 4.9);
    assert.equal(result.retentionRate, '90.0%');
    assert.equal(result.churnRate, '10.0%');
    assert.equal(result.npsOnTarget, true);
  });

  it('calculates maintenance efficiency', () => {
    const result = calculateMaintenanceEfficiency(50, 5000, 25);
    assert.equal(result.costPerWorkOrder, '100.00');
    assert.equal(result.status, 'EXCELLENT');
  });

  it('calculates cash flow per property', () => {
    const result = calculateCashFlowPerProperty(24000, 8);
    assert.equal(result.value, '3000.00');
    assert.equal(result.status, 'POSITIVE');
  });

  it('generates full dashboard with all metrics', () => {
    const dashboard = generateProfitDashboard({
      revenue: { managementFees: 8000, homeWatch: 4000 },
      costOfServices: { labor: 2000, tech: 500 },
      operatingExpenses: { labor: 3000, tech: 500 },
      propertyCount: 15,
      automatedTasks: 80,
      totalTasks: 100,
      acquisitionCosts: 500,
      newClients: 5,
      avgContractValue: 300,
      avgRetentionMonths: 24,
      incidents: 0,
      npsScore: 4.9,
    });
    assert.ok(dashboard.coreMetrics.noi);
    assert.ok(dashboard.coreMetrics.grossMargin);
    assert.ok(dashboard.coreMetrics.revenuePerProperty);
    assert.ok(dashboard.coreMetrics.oer);
    assert.ok(dashboard.coreMetrics.automationRate);
    assert.ok(dashboard.coreMetrics.cacVsLtv);
    assert.ok(dashboard.coreMetrics.preventableIncidents);
    assert.ok(dashboard.supportingMetrics.occupancy);
    assert.ok(dashboard.supportingMetrics.retention);
    assert.ok(dashboard.supportingMetrics.maintenanceEfficiency);
    assert.ok(dashboard.supportingMetrics.cashFlowPerProperty);
    assert.ok(dashboard.targets);
    assert.ok(dashboard.revenueLines);
    assert.equal(dashboard.framework, 'Sovereign Governance');
  });

  it('has correct governance targets', () => {
    assert.equal(TARGETS.grossMargin.target, 0.40);
    assert.equal(TARGETS.oer.target, 0.40);
    assert.equal(TARGETS.automationRate.target, 0.75);
    assert.equal(TARGETS.preventableIncidents.target, 0);
    assert.equal(TARGETS.nps.target, 4.8);
    assert.equal(TARGETS.breakEven.target, 6);
    assert.equal(TARGETS.ltvCacRatio.target, 3.0);
  });

  it('defines 6 revenue lines', () => {
    assert.equal(Object.keys(REVENUE_LINES).length, 6);
    assert.ok(REVENUE_LINES.managementFees);
    assert.ok(REVENUE_LINES.homeWatchFees);
    assert.ok(REVENUE_LINES.conciergeAddOns);
  });

  it('defines 6 expense categories', () => {
    assert.equal(Object.keys(EXPENSE_CATEGORIES).length, 6);
    assert.ok(EXPENSE_CATEGORIES.technology);
    assert.ok(EXPENSE_CATEGORIES.labor);
  });
});

// ── Route Handler Tests ─────────────────────────────────────────────────────

function makeURL(path) { return new URL(`https://test.workers.dev${path}`); }
async function body(res) { return JSON.parse(await res.text()); }

describe('Profit Metrics Routes', async () => {
  const {
    handleMetricsDashboard, handleMetricsTargets,
    handleRevenueLines, handleExpenseCategories,
  } = await import('../routes/profit-metrics.js');

  it('GET /v1/metrics/dashboard returns full framework', async () => {
    const res = handleMetricsDashboard();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(b.coreMetrics);
    assert.ok(b.supportingMetrics);
    assert.ok(b.targets);
    assert.equal(b.framework, 'Sovereign Governance');
  });

  it('GET /v1/metrics/targets returns governance goals', async () => {
    const res = handleMetricsTargets();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(b.targets);
    assert.ok(b.coreGoals);
    assert.ok(b.mission.includes('zero preventable incidents'));
  });

  it('GET /v1/metrics/revenue-lines returns 6 lines', async () => {
    const res = handleRevenueLines();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.count, 6);
    assert.ok(b.categories.recurring.length > 0);
  });

  it('GET /v1/metrics/expenses returns 6 categories with budget ranges', async () => {
    const res = handleExpenseCategories();
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.count, 6);
    assert.ok(b.totalBudgetRange.min > 0);
    assert.ok(b.totalBudgetRange.max > b.totalBudgetRange.min);
    assert.ok(b.aiCost.includes('$3.99'));
  });
});
