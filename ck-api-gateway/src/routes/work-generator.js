/**
 * Work Generator Routes — Continuous Enterprise Task Engine
 *
 *   POST /v1/workgen/cycle     — Run work generation cycle (3-5 tasks)
 *   POST /v1/workgen/build     — Build a complete system
 *   POST /v1/workgen/diagnose  — Diagnose/repair existing system
 *   GET  /v1/workgen/dashboard — Engine status, fleet, capabilities
 *   GET  /v1/workgen/goals     — 4 Core Goals with metrics
 *   GET  /v1/workgen/fleet     — Fleet division breakdown
 */

import {
  runCycle,
  buildSystem,
  diagnoseSystem,
  getDashboard,
  CORE_GOALS,
  FLEET_DIVISIONS,
} from '../services/work-generator.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── POST /v1/workgen/cycle ─────────────────────────────────────────────────

export async function handleWorkgenCycle(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const result = await runCycle(env, {
      focus: body.focus || null,
      phase: body.phase || null,
      taskCount: body.task_count || 5,
    });

    writeAudit(env, ctx, {
      route: '/v1/workgen/cycle',
      action: 'work_cycle_generated',
      focus: body.focus || 'general',
      cached: result.cached,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Work cycle failed: ${err.message}`, 500);
  }
}

// ── POST /v1/workgen/build ─────────────────────────────────────────────────

export async function handleWorkgenBuild(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.system_type) {
    return errorResponse('Missing required field: "system_type".', 400);
  }

  try {
    const result = await buildSystem(env, body.system_type, body.requirements || '');

    writeAudit(env, ctx, {
      route: '/v1/workgen/build',
      action: 'system_build',
      systemType: body.system_type,
      cached: result.cached,
    });

    return jsonResponse(result);
  } catch (err) {
    if (err.message.startsWith('Invalid system type')) {
      return errorResponse(err.message, 400);
    }
    return errorResponse(`System build failed: ${err.message}`, 500);
  }
}

// ── POST /v1/workgen/diagnose ──────────────────────────────────────────────

export async function handleWorkgenDiagnose(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.system_name) {
    return errorResponse('Missing required field: "system_name".', 400);
  }

  try {
    const result = await diagnoseSystem(env, body.system_name, body.symptoms || '');

    writeAudit(env, ctx, {
      route: '/v1/workgen/diagnose',
      action: 'system_diagnosis',
      systemName: body.system_name,
      cached: result.cached,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Diagnosis failed: ${err.message}`, 500);
  }
}

// ── GET /v1/workgen/dashboard ──────────────────────────────────────────────

export function handleWorkgenDashboard() {
  return jsonResponse(getDashboard());
}

// ── GET /v1/workgen/goals ──────────────────────────────────────────────────

export function handleWorkgenGoals() {
  return jsonResponse({
    coreGoals: CORE_GOALS,
    count: CORE_GOALS.length,
    governance: 'sovereign',
  });
}

// ── GET /v1/workgen/fleet ──────────────────────────────────────────────────

export function handleWorkgenFleet() {
  return jsonResponse({
    total: 383,
    divisions: FLEET_DIVISIONS,
    divisionCount: Object.keys(FLEET_DIVISIONS).length,
    governance: 'sovereign',
  });
}
