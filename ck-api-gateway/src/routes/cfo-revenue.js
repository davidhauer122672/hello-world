/**
 * CFO Revenue Platform Routes
 *
 *   GET  /v1/cfo/dashboard          — CFO revenue platform dashboard
 *   GET  /v1/cfo/channels           — Revenue channel breakdown
 *   GET  /v1/cfo/products           — Digital product catalog
 *   GET  /v1/cfo/brand              — Brand positioning framework
 *   GET  /v1/cfo/acquisition        — Client acquisition strategies + templates
 *   GET  /v1/cfo/content-plan       — 90-day content deployment plan + hooks
 *   GET  /v1/cfo/lead-magnets       — Lead magnet & funnel architecture
 *   GET  /v1/cfo/investor           — Investor positioning & valuation
 *   POST /v1/cfo/projection         — Generate revenue projection for month N
 *   POST /v1/cfo/valuation          — Calculate enterprise valuation
 *   GET  /v1/cfo/checklist          — Deployment checklist status
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  REVENUE_CHANNELS, TOTAL_ADDRESSABLE_REVENUE, DIGITAL_PRODUCTS,
  BRAND_POSITIONING, ACQUISITION_STRATEGIES, OUTREACH_TEMPLATES,
  CONTENT_SCHEDULE, CONTENT_HOOKS, LEAD_MAGNETS, FUNNEL_FLOW,
  INVESTOR_POSITIONING, PROJECTIONS, DEPLOYMENT_CHECKLIST,
  generateRevenueProjection, calculateValuation, getChannelBreakdown, getDashboard,
} from '../engines/cfo-revenue-engine.js';

export function handleCFODashboard() {
  return jsonResponse(getDashboard());
}

export function handleCFOChannels() {
  return jsonResponse({
    channels: getChannelBreakdown(),
    totalAddressableRevenue: TOTAL_ADDRESSABLE_REVENUE,
    count: REVENUE_CHANNELS.length,
  });
}

export function handleCFOProducts() {
  const allProducts = Object.values(DIGITAL_PRODUCTS).flat();
  return jsonResponse({
    products: DIGITAL_PRODUCTS,
    catalog: allProducts.map(p => ({ id: p.id, name: p.name, price: p.price, tier: p.tier, format: p.format })),
    count: allProducts.length,
  });
}

export function handleCFOBrand() {
  return jsonResponse(BRAND_POSITIONING);
}

export function handleCFOAcquisition() {
  return jsonResponse({
    strategies: ACQUISITION_STRATEGIES,
    outreachTemplates: OUTREACH_TEMPLATES,
    strategyCount: ACQUISITION_STRATEGIES.length,
    templateCount: Object.keys(OUTREACH_TEMPLATES).length,
  });
}

export function handleCFOContentPlan() {
  return jsonResponse({
    weeklySchedule: CONTENT_SCHEDULE,
    hooks: CONTENT_HOOKS,
    hookCount: Object.values(CONTENT_HOOKS).flat().length,
    pillars: ['CEO Journey', 'Brand', 'Myth vs. Reality'],
    deploymentWindow: '90 days',
  });
}

export function handleCFOLeadMagnets() {
  return jsonResponse({
    leadMagnets: LEAD_MAGNETS,
    funnelFlow: FUNNEL_FLOW,
    count: LEAD_MAGNETS.length,
  });
}

export function handleCFOInvestor() {
  return jsonResponse(INVESTOR_POSITIONING);
}

export async function handleCFOProjection(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const month = body.month;
  if (!month || typeof month !== 'number') return errorResponse('"month" (1-18) is required.', 400);

  const projection = generateRevenueProjection(month);
  if (projection.error) return errorResponse(projection.error, 400);

  writeAudit(env, ctx, { route: '/v1/cfo/projection', action: 'revenue_projection', month });

  return jsonResponse(projection);
}

export async function handleCFOValuation(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const arr = body.arr || PROJECTIONS.month18.totalMRR * 12;
  const multiple = body.multiple || 6;

  const result = calculateValuation(arr, multiple);

  writeAudit(env, ctx, { route: '/v1/cfo/valuation', action: 'valuation_calc', arr, multiple });

  return jsonResponse(result);
}

export function handleCFOChecklist() {
  const blockers = DEPLOYMENT_CHECKLIST.filter(d => d.status === 'BLOCKER');
  const ready = DEPLOYMENT_CHECKLIST.filter(d => d.status === 'Ready');
  const pending = DEPLOYMENT_CHECKLIST.filter(d => d.status === 'Pending' || d.status === 'In Progress');
  return jsonResponse({
    checklist: DEPLOYMENT_CHECKLIST,
    summary: { total: DEPLOYMENT_CHECKLIST.length, blockers: blockers.length, ready: ready.length, pending: pending.length },
    blockers,
  });
}
