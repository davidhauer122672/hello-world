/**
 * Profit Metrics Routes — Sovereign Governance Financial Intelligence
 *
 * Routes:
 *   GET  /v1/metrics/dashboard     — Full profit dashboard (7 core + 4 supporting)
 *   GET  /v1/metrics/targets       — Governance targets and thresholds
 *   POST /v1/metrics/calculate     — Calculate metrics from supplied data
 *   GET  /v1/metrics/revenue-lines — Revenue line item definitions
 *   GET  /v1/metrics/expenses      — Operating expense category breakdown
 *   POST /v1/metrics/noi           — Calculate NOI from revenue + expenses
 *   POST /v1/metrics/gross-margin  — Calculate gross margin
 *   POST /v1/metrics/cac-ltv       — Calculate CAC vs LTV ratio
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  TARGETS,
  REVENUE_LINES,
  EXPENSE_CATEGORIES,
  calculateNOI,
  calculateGrossMargin,
  calculateRevenuePerProperty,
  calculateOER,
  calculateAutomationRate,
  calculateCACvsLTV,
  calculatePreventableIncidents,
  calculateOccupancy,
  calculateRetention,
  calculateMaintenanceEfficiency,
  calculateCashFlowPerProperty,
  generateProfitDashboard,
} from '../engines/profit-metrics.js';

// ── GET /v1/metrics/dashboard ───────────────────────────────────────────────

export function handleMetricsDashboard() {
  const dashboard = generateProfitDashboard({});
  return jsonResponse({
    ...dashboard,
    note: 'Supply POST /v1/metrics/calculate with actual financial data to populate live values. This endpoint returns the framework with zero-state defaults.',
  });
}

// ── GET /v1/metrics/targets ─────────────────────────────────────────────────

export function handleMetricsTargets() {
  return jsonResponse({
    targets: TARGETS,
    framework: 'Sovereign Governance',
    coreGoals: {
      goal1: 'Automation Scale — ≥75% of inspections, reports, alerts, scheduling fully AI-automated',
      goal2: 'Risk Supremacy — Zero preventable incidents (water, pest, security, insurance)',
      goal3: 'Financial Engine — Break-even in 6 months, 40%+ gross margin by Month 12',
      goal4: 'Market Gap Domination — AI-powered predictive home watch at fraction of traditional cost',
    },
    mission: 'AI-powered, predictive home watch and property management that eliminates risk and creates total peace of mind for Treasure Coast property owners at a fraction of traditional cost with zero preventable incidents.',
  });
}

// ── POST /v1/metrics/calculate ──────────────────────────────────────────────

export async function handleMetricsCalculate(request, env, ctx) {
  const body = await request.json();
  const dashboard = generateProfitDashboard(body);

  writeAudit(env, ctx, '/v1/metrics/calculate', {
    action: 'profit_metrics_calculate',
    propertyCount: body.propertyCount || 0,
    hasRevenue: !!body.revenue,
  });

  return jsonResponse(dashboard);
}

// ── GET /v1/metrics/revenue-lines ───────────────────────────────────────────

export function handleRevenueLines() {
  return jsonResponse({
    revenueLines: REVENUE_LINES,
    count: Object.keys(REVENUE_LINES).length,
    categories: {
      recurring: Object.entries(REVENUE_LINES).filter(([, v]) => v.category === 'recurring').map(([k]) => k),
      oneTime: Object.entries(REVENUE_LINES).filter(([, v]) => v.category === 'one-time').map(([k]) => k),
      variable: Object.entries(REVENUE_LINES).filter(([, v]) => v.category === 'variable').map(([k]) => k),
    },
  });
}

// ── GET /v1/metrics/expenses ────────────────────────────────────────────────

export function handleExpenseCategories() {
  return jsonResponse({
    expenseCategories: EXPENSE_CATEGORIES,
    count: Object.keys(EXPENSE_CATEGORIES).length,
    totalBudgetRange: {
      min: Object.values(EXPENSE_CATEGORIES).reduce((s, c) => s + c.budgetRange[0], 0),
      max: Object.values(EXPENSE_CATEGORIES).reduce((s, c) => s + c.budgetRange[1], 0),
    },
    lowCostToolTarget: '$20/mo or less for SaaS tools',
    aiCost: '$3.99/mo Grok SuperGrok agent',
  });
}

// ── POST /v1/metrics/noi ────────────────────────────────────────────────────

export async function handleCalculateNOI(request) {
  const body = await request.json();
  if (!body.revenue || !body.operatingExpenses) {
    return errorResponse('revenue and operatingExpenses objects are required', 400);
  }
  return jsonResponse(calculateNOI(body.revenue, body.operatingExpenses));
}

// ── POST /v1/metrics/gross-margin ───────────────────────────────────────────

export async function handleCalculateGrossMargin(request) {
  const body = await request.json();
  if (body.revenue === undefined || body.costOfServices === undefined) {
    return errorResponse('revenue and costOfServices are required', 400);
  }
  return jsonResponse(calculateGrossMargin(body.revenue, body.costOfServices));
}

// ── POST /v1/metrics/cac-ltv ────────────────────────────────────────────────

export async function handleCalculateCACLTV(request) {
  const body = await request.json();
  const { acquisitionCosts, totalNewClients, avgContractValue, avgRetentionMonths } = body;
  if (!acquisitionCosts && !totalNewClients) {
    return errorResponse('acquisitionCosts and totalNewClients are required', 400);
  }
  return jsonResponse(calculateCACvsLTV(
    acquisitionCosts || 0,
    totalNewClients || 0,
    avgContractValue || 0,
    avgRetentionMonths || 12,
  ));
}
