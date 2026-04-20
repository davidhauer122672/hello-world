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
 */

import { jsonResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  AVATARS, MARKETING_ASSETS, INDUSTRY_GAPS,
  calculateNOIGapImpact, getMasterPromptDashboard,
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

  writeAudit(env, ctx, '/v1/orchestrator/noi-model', {
    action: 'noi_model_calculated',
    portfolioSize,
    projectedNOI: result.coastalKey.projectedNOI,
  });

  return jsonResponse(result);
}
