/**
 * Sales & Client Acquisition Routes
 *
 * Routes:
 *   GET  /v1/sales/dashboard   — Acquisition engine overview
 *   POST /v1/sales/score       — Score a lead
 *   GET  /v1/sales/pipeline    — Pipeline stages and SLAs
 *   GET  /v1/sales/channels    — Acquisition channel registry
 *   GET  /v1/sales/playbooks   — Conversion playbooks (SCAA-1, WF-3, WF-4)
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  PIPELINE_STAGES, ACQUISITION_CHANNELS, CONVERSION_PLAYBOOK,
  scoreLead, getSalesAcquisitionDashboard,
} from '../engines/sales-acquisition.js';

export function handleSalesDashboard() {
  return jsonResponse(getSalesAcquisitionDashboard());
}

export async function handleScoreLead(request, env, ctx) {
  const body = await request.json();
  const result = scoreLead(body);

  writeAudit(env, ctx, '/v1/sales/score', {
    action: 'lead_scored',
    score: result.totalScore,
    grade: result.grade,
    priority: result.priority,
    segment: body.segment,
  });

  return jsonResponse(result);
}

export function handleSalesPipeline() {
  return jsonResponse({ stages: PIPELINE_STAGES, count: PIPELINE_STAGES.length });
}

export function handleSalesChannels() {
  return jsonResponse({
    channels: ACQUISITION_CHANNELS,
    count: ACQUISITION_CHANNELS.length,
    active: ACQUISITION_CHANNELS.filter(c => c.status === 'active').length,
  });
}

export function handleSalesPlaybooks() {
  return jsonResponse({ playbooks: CONVERSION_PLAYBOOK, count: Object.keys(CONVERSION_PLAYBOOK).length });
}
