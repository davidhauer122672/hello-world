/**
 * Master Orchestrator Routes
 *
 *   GET  /v1/orchestrator/dashboard    — CEO Administration Dashboard
 *   POST /v1/orchestrator/health       — Enterprise health scan (9 systems)
 *   POST /v1/orchestrator/escalation   — Process escalation (S1-S4)
 *   POST /v1/orchestrator/system       — Execute a prompting system
 *   GET  /v1/orchestrator/hierarchy    — Command hierarchy map
 *   GET  /v1/orchestrator/systems      — List integrated prompting systems
 *
 * Department 1. Reports to David Hauer, CEO.
 * Voice: Authoritative, precise, institutional.
 */

import {
  getCEODashboard,
  runEnterpriseHealthScan,
  processEscalation,
  executePromptingSystem,
  COMMAND_HIERARCHY,
  PROMPTING_SYSTEMS,
  SEVERITY,
} from '../services/master-orchestrator.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/orchestrator/dashboard ──

export function handleOrchestratorDashboard() {
  return jsonResponse(getCEODashboard());
}

// ── POST /v1/orchestrator/health ──

export async function handleOrchestratorHealth(request, env, ctx) {
  try {
    const result = await runEnterpriseHealthScan(env, ctx);

    writeAudit(env, ctx, {
      route: '/v1/orchestrator/health',
      action: 'enterprise_health_scan',
      model: result.model,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Enterprise health scan failed: ${err.message}`, 502);
  }
}

// ── POST /v1/orchestrator/escalation ──

export async function handleOrchestratorEscalation(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.severity || !body.subject) {
    return errorResponse('"severity" (S1/S2/S3/S4) and "subject" are required.', 400);
  }

  const validSeverities = ['S1', 'S2', 'S3', 'S4'];
  if (!validSeverities.includes(body.severity)) {
    return errorResponse(`Invalid severity. Valid: ${validSeverities.join(', ')}`, 400);
  }

  try {
    const result = await processEscalation(env, ctx, {
      severity: body.severity,
      source: body.source || 'API',
      subject: body.subject,
      details: body.details || '',
      affectedDivisions: body.affectedDivisions || [],
    });

    writeAudit(env, ctx, {
      route: '/v1/orchestrator/escalation',
      action: `escalation_${body.severity}`,
      subject: body.subject,
      taskCreated: result.taskCreated,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Escalation processing failed: ${err.message}`, 502);
  }
}

// ── POST /v1/orchestrator/system ──

export async function handleOrchestratorSystem(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.systemId || !body.input) {
    return errorResponse('"systemId" and "input" are required. Valid systems: SCAA-1, CSD-AI, MEDIA-5, EAP, DTD, AIGOV', 400);
  }

  try {
    const result = await executePromptingSystem(env, ctx, {
      systemId: body.systemId,
      input: body.input,
      context: body.context || '',
    });

    if (result.error) {
      return errorResponse(result.error, 404);
    }

    writeAudit(env, ctx, {
      route: '/v1/orchestrator/system',
      action: `system_execute_${body.systemId}`,
      model: result.model,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`System execution failed: ${err.message}`, 502);
  }
}

// ── GET /v1/orchestrator/hierarchy ──

export function handleOrchestratorHierarchy() {
  return jsonResponse({
    orchestrator: 'Master Orchestrator (Department 1)',
    reportTo: 'David Hauer, Founder & CEO',
    hierarchy: COMMAND_HIERARCHY,
    escalationProtocol: Object.values(SEVERITY),
    totalAgents: 330,
    totalDivisions: 11,
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/orchestrator/systems ──

export function handleOrchestratorSystems() {
  return jsonResponse({
    orchestrator: 'Master Orchestrator (Department 1)',
    systems: PROMPTING_SYSTEMS,
    count: PROMPTING_SYSTEMS.length,
    timestamp: new Date().toISOString(),
  });
}
