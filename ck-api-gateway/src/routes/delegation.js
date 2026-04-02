/**
 * Delegation Routes — AI Delegation Agent fleet operations.
 *
 *   GET  /v1/delegation/fleet        — Fleet status dashboard
 *   POST /v1/delegation/scan         — Run agent scan (body: { agentId, options? })
 *   POST /v1/delegation/dispatch     — Dispatch task to agent
 *   POST /v1/delegation/handoff      — Inter-agent handoff
 *   POST /v1/delegation/briefing     — Process CEO briefing
 *   GET  /v1/delegation/agents       — List all 20 DEL agents
 *   GET  /v1/delegation/agents/:id   — Get single DEL agent
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 * Badge: Enterprise Full Access for all DEL operations
 */

import { DEL_AGENTS } from '../agents/agents-del.js';
import {
  runAgentScan,
  dispatchTask,
  executeHandoff,
  processCEOBriefing,
  getFleetStatus,
} from '../services/delegation-engine.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/delegation/fleet ──

export async function handleDelegationFleet(env) {
  const status = await getFleetStatus(env);

  return jsonResponse({
    division: 'DEL',
    divisionName: 'AI Delegation',
    agentCount: 20,
    badgeClearance: 'Enterprise Full Access',
    cooperatesWith: ['All Chiefs of Staff', 'All Division Leads', 'CEO', 'CMO', 'CTO', 'CFO'],
    fleet: status,
    agents: DEL_AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      tier: a.tier,
    })),
    timestamp: new Date().toISOString(),
  });
}

// ── POST /v1/delegation/scan ──

export async function handleDelegationScan(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.agentId) {
    return errorResponse('"agentId" is required (e.g. "DEL-002").', 400);
  }

  const agent = DEL_AGENTS.find(a => a.id === body.agentId);
  if (!agent) {
    return errorResponse(`Unknown delegation agent: ${body.agentId}. Valid: DEL-001 through DEL-020.`, 404);
  }

  try {
    const result = await runAgentScan(env, body.agentId, body.options || {});

    writeAudit(env, ctx, {
      route: '/v1/delegation/scan',
      action: 'agent_scan',
      agentId: body.agentId,
      agentName: agent.name,
      recordsAnalyzed: result.recordsAnalyzed,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Scan failed: ${err.message}`, 502);
  }
}

// ── POST /v1/delegation/dispatch ──

export async function handleDelegationDispatch(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const required = ['agentId', 'taskName', 'taskContext'];
  for (const field of required) {
    if (!body[field]) {
      return errorResponse(`"${field}" is required.`, 400);
    }
  }

  const agent = DEL_AGENTS.find(a => a.id === body.agentId);
  if (!agent) {
    return errorResponse(`Unknown delegation agent: ${body.agentId}.`, 404);
  }

  try {
    const result = await dispatchTask(env, ctx, {
      agentId: body.agentId,
      agentName: agent.name,
      taskName: body.taskName,
      category: body.category,
      priority: body.priority,
      sourceDivision: body.sourceDivision,
      targetDivision: body.targetDivision,
      taskContext: body.taskContext,
      executeNow: body.executeNow !== false,
    });

    writeAudit(env, ctx, {
      route: '/v1/delegation/dispatch',
      action: 'task_dispatch',
      agentId: body.agentId,
      taskName: body.taskName,
      status: result.status,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Dispatch failed: ${err.message}`, 502);
  }
}

// ── POST /v1/delegation/handoff ──

export async function handleDelegationHandoff(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  const required = ['fromAgentId', 'toAgentId', 'handoffInstructions'];
  for (const field of required) {
    if (!body[field]) {
      return errorResponse(`"${field}" is required.`, 400);
    }
  }

  const toAgent = DEL_AGENTS.find(a => a.id === body.toAgentId);
  if (!toAgent) {
    return errorResponse(`Unknown target agent: ${body.toAgentId}.`, 404);
  }

  try {
    const result = await executeHandoff(env, ctx, {
      fromAgentId: body.fromAgentId,
      toAgentId: body.toAgentId,
      toAgentName: toAgent.name,
      taskId: body.taskId || null,
      taskContext: body.taskContext || '',
      handoffInstructions: body.handoffInstructions,
    });

    writeAudit(env, ctx, {
      route: '/v1/delegation/handoff',
      action: 'inter_agent_handoff',
      from: body.fromAgentId,
      to: body.toAgentId,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Handoff failed: ${err.message}`, 502);
  }
}

// ── POST /v1/delegation/briefing ──

export async function handleDelegationBriefing(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.briefing) {
    return errorResponse('"briefing" content is required.', 400);
  }

  try {
    const result = await processCEOBriefing(env, ctx, body.briefing);

    writeAudit(env, ctx, {
      route: '/v1/delegation/briefing',
      action: 'ceo_briefing_processed',
      briefingId: result.briefingId,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Briefing processing failed: ${err.message}`, 502);
  }
}

// ── GET /v1/delegation/agents ──

export function handleListDelegationAgents(url) {
  let agents = DEL_AGENTS;

  const status = url.searchParams.get('status');
  if (status) agents = agents.filter(a => a.status === status);

  const tier = url.searchParams.get('tier');
  if (tier) agents = agents.filter(a => a.tier === tier);

  return jsonResponse({
    division: 'DEL',
    badgeClearance: 'Enterprise Full Access',
    count: agents.length,
    agents,
  });
}

// ── GET /v1/delegation/agents/:id ──

export function handleGetDelegationAgent(agentId) {
  const agent = DEL_AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return errorResponse(`Delegation agent "${agentId}" not found.`, 404);
  }
  return jsonResponse({ ...agent, badgeClearance: 'Enterprise Full Access' });
}
