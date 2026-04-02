/**
 * Cash Flow Production Routes — Enterprise revenue operations.
 *
 *   GET  /v1/cashflow/dashboard     — Cash flow dashboard with all squads and metrics
 *   POST /v1/cashflow/scan          — Full cash flow health scan
 *   POST /v1/cashflow/squad         — Execute squad-specific action
 *   POST /v1/cashflow/revenue       — Revenue opportunity scan
 *   GET  /v1/cashflow/metrics       — Enterprise metrics summary
 *   GET  /v1/cashflow/agents        — List all 46 CFP agents (with squad filter)
 *   GET  /v1/cashflow/agents/:id    — Get single CFP agent
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 * Badge: Enterprise Full Access for all CFP operations
 */

import { CFP_AGENTS } from '../agents/agents-cfp.js';
import {
  runCashFlowScan,
  executeSquadAction,
  runRevenueOpportunityScan,
  getEnterpriseMetrics,
  getCashFlowDashboard,
} from '../services/cashflow-engine.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/cashflow/dashboard ──

export function handleCashFlowDashboard() {
  const dashboard = getCashFlowDashboard();
  return jsonResponse({
    ...dashboard,
    agents: CFP_AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      squad: a.squad,
    })),
  });
}

// ── POST /v1/cashflow/scan ──

export async function handleCashFlowScan(request, env, ctx) {
  try {
    const result = await runCashFlowScan(env, ctx);

    writeAudit(env, ctx, {
      route: '/v1/cashflow/scan',
      action: 'cashflow_scan',
      model: result.model,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Cash flow scan failed: ${err.message}`, 502);
  }
}

// ── POST /v1/cashflow/squad ──

export async function handleCashFlowSquad(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.squadId || !body.agentId || !body.action) {
    return errorResponse('"squadId" (1-9), "agentId" (CFP-XXX), and "action" are required.', 400);
  }

  try {
    const result = await executeSquadAction(env, ctx, {
      squadId: body.squadId,
      agentId: body.agentId,
      action: body.action,
      context: body.context || '',
    });

    if (result.error) {
      return errorResponse(result.error, 404);
    }

    writeAudit(env, ctx, {
      route: '/v1/cashflow/squad',
      action: `squad_${body.squadId}_execute`,
      agentId: body.agentId,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Squad action failed: ${err.message}`, 502);
  }
}

// ── POST /v1/cashflow/revenue ──

export async function handleCashFlowRevenue(request, env, ctx) {
  try {
    const result = await runRevenueOpportunityScan(env, ctx);

    writeAudit(env, ctx, {
      route: '/v1/cashflow/revenue',
      action: 'revenue_opportunity_scan',
      model: result.model,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Revenue scan failed: ${err.message}`, 502);
  }
}

// ── GET /v1/cashflow/metrics ──

export async function handleCashFlowMetrics(env) {
  try {
    const metrics = await getEnterpriseMetrics(env);
    return jsonResponse(metrics);
  } catch (err) {
    return errorResponse(`Metrics fetch failed: ${err.message}`, 502);
  }
}

// ── GET /v1/cashflow/agents ──

export function handleListCashFlowAgents(url) {
  let agents = CFP_AGENTS;

  const squad = url.searchParams.get('squad');
  if (squad) agents = agents.filter(a => a.squad === squad || a.squad === parseInt(squad, 10));

  const status = url.searchParams.get('status');
  if (status) agents = agents.filter(a => a.status === status);

  return jsonResponse({
    division: 'CFP',
    divisionName: 'Cash Flow Production',
    badgeClearance: 'Enterprise Full Access',
    count: agents.length,
    agents,
  });
}

// ── GET /v1/cashflow/agents/:id ──

export function handleGetCashFlowAgent(agentId) {
  const agent = CFP_AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return errorResponse(`Cash flow agent "${agentId}" not found. Valid: CFP-001 through CFP-046.`, 404);
  }
  return jsonResponse({ ...agent, badgeClearance: 'Enterprise Full Access' });
}
