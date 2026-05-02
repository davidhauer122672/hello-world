/**
 * Master Prompt V2.1 Routes
 *
 * Routes:
 *   GET  /v1/orchestrator/dashboard    — Full V2.1 production dashboard
 *   GET  /v1/orchestrator/assets       — Marketing assets registry
 *   GET  /v1/orchestrator/avatars      — Executive Administrator avatars
 *   GET  /v1/orchestrator/gaps         — Top 1% industry gap analysis
 *   GET  /v1/orchestrator/noi-model    — NOI impact model from gap capitalization
 *   POST /v1/orchestrator/noi-model    — Calculate NOI with custom portfolio size
 *   GET  /v1/orchestrator/fleet        — Sentry/Ledger/Acquisition/Report fleet status
 *   GET  /v1/orchestrator/triggers     — TAS catalog (15 production scenarios)
 *   POST /v1/orchestrator/dispatch     — Route an event through Priority×Risk + HITL gate
 *   POST /v1/orchestrator/hitl         — Record CEO HITL decision (approve/reject/defer)
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  AVATARS, MARKETING_ASSETS, INDUSTRY_GAPS,
  AGENT_FLEET, TRIGGER_ACTION_SEQUENCES,
  calculateNOIGapImpact, getMasterPromptDashboard,
  getOrchestratorFleetStatus, routeDispatch,
} from '../engines/master-prompt-v21.js';

export function handleOrchestratorDashboard() {
  return jsonResponse(getMasterPromptDashboard());
}

export function handleOrchestratorAssets() {
  return jsonResponse({
    assets: MARKETING_ASSETS,
    count: MARKETING_ASSETS.length,
    byStatus: {
      live: MARKETING_ASSETS.filter(a => a.status === 'LIVE').length,
      scheduled: MARKETING_ASSETS.filter(a => a.status === 'SCHEDULED').length,
      running: MARKETING_ASSETS.filter(a => a.status === 'RUNNING').length,
      deployed: MARKETING_ASSETS.filter(a => a.status === 'DEPLOYED').length,
      ready: MARKETING_ASSETS.filter(a => a.status === 'READY').length,
      uploaded: MARKETING_ASSETS.filter(a => a.status === 'UPLOADED').length,
    },
  });
}

export function handleOrchestratorAvatars() {
  return jsonResponse({ avatars: AVATARS, count: Object.keys(AVATARS).length });
}

export function handleOrchestratorGaps() {
  return jsonResponse({ gaps: INDUSTRY_GAPS, count: INDUSTRY_GAPS.length, source: 'Notebook LM Research Campaign V2.1' });
}

export function handleOrchestratorNOIModel() {
  return jsonResponse(calculateNOIGapImpact(30));
}

export async function handleOrchestratorNOICalculate(request, env, ctx) {
  const body = await request.json();
  const portfolioSize = body.portfolioSize || 30;
  const result = calculateNOIGapImpact(portfolioSize);

  writeAudit(env, ctx, {
    route: '/v1/orchestrator/noi-model',
    action: 'noi_model_calculated',
    portfolioSize,
    projectedNOI: result.coastalKey.projectedNOI,
  });

  return jsonResponse(result);
}

export function handleOrchestratorFleet() {
  return jsonResponse(getOrchestratorFleetStatus());
}

export function handleOrchestratorTriggers() {
  return jsonResponse({
    sequences: TRIGGER_ACTION_SEQUENCES,
    count: TRIGGER_ACTION_SEQUENCES.length,
    source: 'docs/orchestrator/trigger-action-sequences.md',
  });
}

export async function handleOrchestratorDispatch(request, env, ctx) {
  let event;
  try {
    event = await request.json();
  } catch {
    return errorResponse('invalid_json_body', 400);
  }
  if (!event || typeof event !== 'object' || !event.action) {
    return errorResponse('action_required', 400);
  }

  const result = routeDispatch(event);

  writeAudit(env, ctx, {
    route: '/v1/orchestrator/dispatch',
    action: 'dispatch_routed',
    event_action: event.action,
    correlation_id: event.correlation_id || null,
    outcome: result.status,
    agent: result.agent,
    priority: result.priority,
    risk_class: result.risk_class,
    hitl_required: result.status === 'hitl_pending',
  });

  const status = result.status === 'errored' ? 422
    : result.status === 'quarantined' ? 409
    : result.status === 'hitl_pending' ? 202
    : 200;
  return jsonResponse(result, status);
}

export async function handleOrchestratorHITL(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('invalid_json_body', 400);
  }
  const { blocked_envelope_id, decision, approver_id, rationale } = body || {};
  if (!blocked_envelope_id || !decision || !approver_id) {
    return errorResponse('blocked_envelope_id, decision, approver_id required', 400);
  }
  if (!['approve', 'reject', 'defer'].includes(decision)) {
    return errorResponse('decision must be approve|reject|defer', 400);
  }

  const record = {
    blocked_envelope_id,
    decision,
    approver_id,
    rationale: rationale || null,
    decided_at: new Date().toISOString(),
  };

  writeAudit(env, ctx, {
    route: '/v1/orchestrator/hitl',
    action: 'hitl_decision_recorded',
    ...record,
  });

  return jsonResponse({ status: 'recorded', ...record });
}
