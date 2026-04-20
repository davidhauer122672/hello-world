/**
 * Field Inspection Routes — Property Inspection Management
 *
 * Routes:
 *   GET  /v1/inspections/dashboard    — Inspection system overview and SOPs
 *   GET  /v1/inspections/types        — Available inspection types and checklists
 *   POST /v1/inspections/create       — Create a new inspection
 *   POST /v1/inspections/complete     — Complete an inspection with results
 *   GET  /v1/inspections/inspectors   — List active inspectors
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  INSPECTION_TYPES, SEVERITY_LEVELS, INSPECTORS,
  createInspection, completeInspection, getInspectionDashboard,
} from '../engines/field-inspection.js';

// ── GET /v1/inspections/dashboard ──────────────────────────────────────────

export function handleInspectionDashboard() {
  return jsonResponse(getInspectionDashboard());
}

// ── GET /v1/inspections/types ──────────────────────────────────────────────

export function handleInspectionTypes() {
  return jsonResponse({
    types: INSPECTION_TYPES,
    count: Object.keys(INSPECTION_TYPES).length,
    severityLevels: SEVERITY_LEVELS,
  });
}

// ── POST /v1/inspections/create ────────────────────────────────────────────

export async function handleCreateInspection(request, env, ctx) {
  const body = await request.json();
  if (!body.propertyAddress) {
    return errorResponse('propertyAddress is required', 400);
  }

  const inspection = createInspection(body);
  if (inspection.error) {
    return errorResponse(inspection.error, 400);
  }

  writeAudit(env, ctx, '/v1/inspections/create', {
    action: 'inspection_created',
    inspectionId: inspection.inspectionId,
    type: inspection.type,
    property: inspection.propertyAddress,
    inspector: inspection.inspector.id,
  });

  return jsonResponse(inspection, 201);
}

// ── POST /v1/inspections/complete ──────────────────────────────────────────

export async function handleCompleteInspection(request, env, ctx) {
  const body = await request.json();
  if (!body.inspection) {
    return errorResponse('inspection object is required', 400);
  }

  const completed = completeInspection(body.inspection, body.results || {});

  writeAudit(env, ctx, '/v1/inspections/complete', {
    action: 'inspection_completed',
    inspectionId: completed.inspectionId,
    deficiencyCount: completed.summary.deficiencyCount,
    criticalCount: completed.summary.criticalCount,
    passRate: completed.summary.passRate,
  });

  return jsonResponse(completed);
}

// ── GET /v1/inspections/inspectors ─────────────────────────────────────────

export function handleListInspectors() {
  return jsonResponse({
    inspectors: INSPECTORS,
    count: INSPECTORS.length,
    coverage: {
      zones: [...new Set(INSPECTORS.map(i => i.zone))],
      activeCount: INSPECTORS.filter(i => i.status === 'active').length,
      onCallCount: INSPECTORS.filter(i => i.status === 'on-call').length,
    },
  });
}
