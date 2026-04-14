/**
 * Operations Flowchart Routes — Ops workflow logic tree API handlers.
 *
 * Endpoints:
 *   GET  /v1/ops/flowchart              — Full flowchart overview
 *   GET  /v1/ops/stages                 — All 7 workflow stages
 *   GET  /v1/ops/stages/:id             — Single stage detail
 *   GET  /v1/ops/raci                   — RACI responsibility matrix
 *   GET  /v1/ops/kpis                   — All stage KPIs + bottleneck flags
 */

import { getOpsFlowchart, getOpsStages, getOpsStage, getOpsRACI, getOpsKPIs } from '../services/operations-flowchart.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleOpsFlowchart() {
  return jsonResponse(getOpsFlowchart());
}

export function handleOpsStages() {
  return jsonResponse(getOpsStages());
}

export function handleOpsStage(stageId) {
  const stage = getOpsStage(stageId);
  if (!stage) {
    return errorResponse(`Stage "${stageId}" not found. Valid IDs: STAGE-01 through STAGE-07`, 404);
  }
  return jsonResponse({ stage });
}

export function handleOpsRACI() {
  return jsonResponse(getOpsRACI());
}

export function handleOpsKPIs() {
  return jsonResponse(getOpsKPIs());
}
