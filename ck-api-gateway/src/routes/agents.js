/**
 * Agent Management Routes — CRUD and operational control for CK agents.
 *
 *   GET  /v1/agents          — List agents with filtering
 *   GET  /v1/agents/:id      — Get a single agent by ID
 *   POST /v1/agents/:id/action — Execute an operational action on an agent
 *   GET  /v1/agents/metrics  — Aggregate agent metrics
 *   GET  /v1/dashboard       — Combined dashboard view
 */

import { AGENTS, DIVISIONS, getAgentsByDivision, getAgentById } from '../agents/registry.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Valid actions and their resulting statuses ────────────────────────────────

const ACTION_STATUS_MAP = {
  activate: 'active',
  pause: 'standby',
  restart: 'active',
  train: 'training',
};

const VALID_ACTIONS = Object.keys(ACTION_STATUS_MAP);
const VALID_STATUSES = ['active', 'standby', 'training', 'maintenance'];

// ── GET /v1/agents ───────────────────────────────────────────────────────────

export function handleListAgents(url, env) {
  try {
    const params = url.searchParams;
    const divisionFilter = params.get('division');
    const statusFilter = params.get('status');
    const tierFilter = params.get('tier');
    const searchQuery = params.get('search');

    let agents = [...AGENTS];

    // Filter by division
    if (divisionFilter) {
      const divisionAgents = getAgentsByDivision(divisionFilter);
      if (divisionAgents.length === 0 && !DIVISIONS.some(d => d.id === divisionFilter)) {
        return errorResponse(`Unknown division: "${divisionFilter}".`, 400);
      }
      agents = divisionAgents;
    }

    // Filter by status
    if (statusFilter) {
      if (!VALID_STATUSES.includes(statusFilter)) {
        return errorResponse(
          `Invalid status "${statusFilter}". Valid values: ${VALID_STATUSES.join(', ')}.`,
          400,
        );
      }
      agents = agents.filter(a => a.status === statusFilter);
    }

    // Filter by tier
    if (tierFilter) {
      agents = agents.filter(a => a.tier === tierFilter);
    }

    // Text search across name and description
    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      agents = agents.filter(
        a =>
          (a.name && a.name.toLowerCase().includes(lower)) ||
          (a.description && a.description.toLowerCase().includes(lower)),
      );
    }

    return jsonResponse({
      agents,
      count: agents.length,
      divisions: DIVISIONS,
    });
  } catch (err) {
    console.error('handleListAgents error:', err);
    return errorResponse('Failed to list agents.', 500);
  }
}

// ── GET /v1/agents/:id ──────────────────────────────────────────────────────

export function handleGetAgent(agentId, env) {
  try {
    if (!agentId || typeof agentId !== 'string') {
      return errorResponse('Agent ID is required.', 400);
    }

    const agent = getAgentById(agentId);
    if (!agent) {
      return errorResponse(`Agent "${agentId}" not found.`, 404);
    }

    return jsonResponse({ agent });
  } catch (err) {
    console.error('handleGetAgent error:', err);
    return errorResponse('Failed to retrieve agent.', 500);
  }
}

// ── POST /v1/agents/:id/action ──────────────────────────────────────────────

export async function handleAgentAction(request, env, ctx) {
  try {
    // Parse and validate the request body
    let body;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Request body must be valid JSON.', 400);
    }

    const { action, params: actionParams = {} } = body;

    if (!action) {
      return errorResponse('Field "action" is required.', 400);
    }

    if (!VALID_ACTIONS.includes(action)) {
      return errorResponse(
        `Invalid action "${action}". Valid actions: ${VALID_ACTIONS.join(', ')}.`,
        400,
      );
    }

    // Extract agentId from the URL
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    // Expected pattern: /v1/agents/:id/action
    const agentIdIndex = segments.indexOf('agents') + 1;
    const agentId = segments[agentIdIndex];

    if (!agentId) {
      return errorResponse('Agent ID is required in the URL path.', 400);
    }

    const agent = getAgentById(agentId);
    if (!agent) {
      return errorResponse(`Agent "${agentId}" not found.`, 404);
    }

    const previousStatus = agent.status;
    const newStatus = ACTION_STATUS_MAP[action];
    const timestamp = new Date().toISOString();

    // Persist status change to SESSIONS KV
    if (env.SESSIONS) {
      const statusKey = `agent:${agentId}:status`;
      await env.SESSIONS.put(
        statusKey,
        JSON.stringify({
          agentId,
          status: newStatus,
          previousStatus,
          action,
          params: actionParams,
          updatedAt: timestamp,
        }),
      );
    }

    // Write to AUDIT_LOG KV
    writeAudit(env, ctx, {
      route: `/v1/agents/${agentId}/action`,
      action,
      agentId,
      agentName: agent.name,
      previousStatus,
      newStatus,
      params: actionParams,
    });

    // Return the updated agent snapshot with the new status
    const updatedAgent = { ...agent, status: newStatus };

    return jsonResponse({
      agent: updatedAgent,
      action,
      previousStatus,
      newStatus,
      timestamp,
    });
  } catch (err) {
    console.error('handleAgentAction error:', err);
    return errorResponse('Failed to execute agent action.', 500);
  }
}

// ── GET /v1/agents/metrics ──────────────────────────────────────────────────

export function handleAgentMetrics(url, env) {
  try {
    const agents = AGENTS;
    const totalAgents = agents.length;

    // Counts by status
    const byStatus = {
      active: 0,
      standby: 0,
      training: 0,
      maintenance: 0,
    };
    for (const agent of agents) {
      if (agent.status in byStatus) {
        byStatus[agent.status]++;
      }
    }

    // Counts by division
    const divisionCounts = {};
    for (const agent of agents) {
      const div = agent.division || 'unassigned';
      divisionCounts[div] = (divisionCounts[div] || 0) + 1;
    }
    const byDivision = DIVISIONS.map(d => ({
      id: d.id,
      name: d.name,
      agentCount: divisionCounts[d.id] || 0,
    }));

    // Counts by tier
    const byTier = {};
    for (const agent of agents) {
      const tier = agent.tier || 'unknown';
      byTier[tier] = (byTier[tier] || 0) + 1;
    }

    return jsonResponse({
      totalAgents,
      byStatus,
      byDivision,
      byTier,
    });
  } catch (err) {
    console.error('handleAgentMetrics error:', err);
    return errorResponse('Failed to compute agent metrics.', 500);
  }
}

// ── GET /v1/dashboard ───────────────────────────────────────────────────────

export async function handleDashboard(env) {
  try {
    const agents = AGENTS;
    const totalAgents = agents.length;

    // Agent status breakdown
    const statusCounts = {
      active: 0,
      standby: 0,
      training: 0,
      maintenance: 0,
    };
    for (const agent of agents) {
      if (agent.status in statusCounts) {
        statusCounts[agent.status]++;
      }
    }

    // Division summary
    const divisionSummary = DIVISIONS.map(d => {
      const divAgents = getAgentsByDivision(d.id);
      return {
        id: d.id,
        name: d.name,
        agentCount: divAgents.length,
        activeCount: divAgents.filter(a => a.status === 'active').length,
      };
    });

    // Recent audit entries (last 50, best-effort)
    let recentAudit = [];
    if (env.AUDIT_LOG) {
      try {
        const auditKeys = await env.AUDIT_LOG.list({ prefix: 'audit:', limit: 50 });
        const entries = await Promise.all(
          auditKeys.keys.map(async (key) => {
            try {
              const raw = await env.AUDIT_LOG.get(key.name);
              return raw ? JSON.parse(raw) : null;
            } catch {
              return null;
            }
          }),
        );
        recentAudit = entries.filter(Boolean);
      } catch (err) {
        console.error('Dashboard audit fetch error:', err);
        // Non-fatal — continue building the dashboard
      }
    }

    // System health (simple heuristic: active ratio)
    const activeRatio = totalAgents > 0 ? statusCounts.active / totalAgents : 0;
    let healthStatus;
    if (activeRatio >= 0.7) {
      healthStatus = 'healthy';
    } else if (activeRatio >= 0.4) {
      healthStatus = 'degraded';
    } else {
      healthStatus = 'critical';
    }

    return jsonResponse({
      agents: {
        total: totalAgents,
        byStatus: statusCounts,
      },
      divisions: divisionSummary,
      recentAudit,
      systemHealth: {
        status: healthStatus,
        activeRatio: Math.round(activeRatio * 100) / 100,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('handleDashboard error:', err);
    return errorResponse('Failed to load dashboard.', 500);
  }
}
