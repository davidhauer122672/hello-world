/**
 * Capital Engine Routes — Revenue architecture API handlers.
 *
 * Endpoints:
 *   GET  /v1/capital/engine              — Full Capital Engine overview
 *   GET  /v1/capital/pillars/:id         — Single revenue pillar detail
 *   GET  /v1/capital/drip-matrix         — DRIP Matrix delegation framework
 *   GET  /v1/capital/business-model      — Integrated business model
 *   GET  /v1/capital/metrics             — Revenue projections and KPIs
 */

import { getCapitalEngine, getCapitalPillar, getDRIPMatrix, getBusinessModel, getCapitalMetrics } from '../services/capital-engine.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleCapitalEngine() {
  return jsonResponse(getCapitalEngine());
}

export function handleCapitalPillar(pillarId) {
  const pillar = getCapitalPillar(pillarId);
  if (!pillar) {
    return errorResponse(`Pillar "${pillarId}" not found. Valid IDs: CE-P1, CE-P2, CE-P3`, 404);
  }
  return jsonResponse({ pillar });
}

export function handleDRIPMatrix() {
  return jsonResponse(getDRIPMatrix());
}

export function handleBusinessModel() {
  return jsonResponse(getBusinessModel());
}

export function handleCapitalMetrics() {
  return jsonResponse(getCapitalMetrics());
}
