/**
 * Enterprise Reinforcement Routes — Perpetual structural operations.
 *
 *   GET  /v1/reinforcement/dashboard  — Reinforcement engine dashboard
 *   POST /v1/reinforcement/scan       — Full 10-pillar enterprise scan
 *   POST /v1/reinforcement/pillar     — Execute specific pillar action
 *   POST /v1/reinforcement/cycle      — Generate next goal cycle
 *   GET  /v1/reinforcement/agents     — List all 20 ENF agents
 *   GET  /v1/reinforcement/agents/:id — Get single ENF agent
 *   GET  /v1/reinforcement/pillars    — List all 10 pillars
 *
 * Perpetual mandate. No end date. No completion state.
 */

import { ENF_AGENTS } from '../agents/agents-enf.js';
import {
  runReinforcementScan,
  executePillarAction,
  generateNextGoalCycle,
  getReinforcementDashboard,
  PILLARS,
} from '../services/reinforcement-engine.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/reinforcement/dashboard ──

export function handleReinforcementDashboard() {
  const dashboard = getReinforcementDashboard();
  return jsonResponse({
    ...dashboard,
    agents: ENF_AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      pillar: a.pillar,
      perpetual: a.perpetual,
    })),
  });
}

// ── POST /v1/reinforcement/scan ──

export async function handleReinforcementScan(request, env, ctx) {
  try {
    const result = await runReinforcementScan(env, ctx);

    writeAudit(env, ctx, {
      route: '/v1/reinforcement/scan',
      action: 'reinforcement_scan',
      model: result.model,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Reinforcement scan failed: ${err.message}`, 502);
  }
}

// ── POST /v1/reinforcement/pillar ──

export async function handleReinforcementPillar(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.pillarId || !body.agentId || !body.action) {
    return errorResponse('"pillarId" (1-10), "agentId" (ENF-XXX), and "action" are required.', 400);
  }

  try {
    const result = await executePillarAction(env, ctx, {
      pillarId: body.pillarId,
      agentId: body.agentId,
      action: body.action,
      context: body.context || '',
    });

    if (result.error) {
      return errorResponse(result.error, 404);
    }

    writeAudit(env, ctx, {
      route: '/v1/reinforcement/pillar',
      action: `pillar_${body.pillarId}_execute`,
      agentId: body.agentId,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Pillar action failed: ${err.message}`, 502);
  }
}

// ── POST /v1/reinforcement/cycle ──

export async function handleReinforcementCycle(request, env, ctx) {
  try {
    const result = await generateNextGoalCycle(env, ctx);

    writeAudit(env, ctx, {
      route: '/v1/reinforcement/cycle',
      action: 'goal_cycle_regeneration',
      model: result.model,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Goal cycle generation failed: ${err.message}`, 502);
  }
}

// ── GET /v1/reinforcement/agents ──

export function handleListReinforcementAgents(url) {
  let agents = ENF_AGENTS;

  const pillar = url.searchParams.get('pillar');
  if (pillar) agents = agents.filter(a => a.pillar === pillar || a.pillar === 'All');

  const status = url.searchParams.get('status');
  if (status) agents = agents.filter(a => a.status === status);

  return jsonResponse({
    division: 'ENF',
    perpetual: true,
    badgeClearance: 'Enterprise Full Access — Structural Authority',
    count: agents.length,
    agents,
  });
}

// ── GET /v1/reinforcement/agents/:id ──

export function handleGetReinforcementAgent(agentId) {
  const agent = ENF_AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return errorResponse(`Reinforcement agent "${agentId}" not found. Valid: ENF-001 through ENF-020.`, 404);
  }
  return jsonResponse({ ...agent, badgeClearance: 'Enterprise Full Access — Structural Authority' });
}

// ── GET /v1/reinforcement/pillars ──

export function handleReinforcementPillars() {
  return jsonResponse({
    engine: 'Enterprise Reinforcement Engine',
    count: PILLARS.length,
    pillars: PILLARS,
    timestamp: new Date().toISOString(),
  });
}
