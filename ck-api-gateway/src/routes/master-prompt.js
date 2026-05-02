/**
 * Master Prompt V2.1 Routes
 *
 * Routes:
 *   GET  /v1/orchestrator/dashboard       - Full V2.1 production dashboard (auth required)
 *   GET  /v1/orchestrator/public-status   - Public structural status (no auth, smoke-test target)
 *   GET  /v1/orchestrator/assets          - Marketing assets registry (auth required)
 *   GET  /v1/orchestrator/avatars         - Executive Administrator avatars (auth required)
 *   GET  /v1/orchestrator/gaps            - Top 1% industry gap analysis (auth required)
 *   GET  /v1/orchestrator/noi-model       - NOI impact model from gap capitalization (auth required)
 *   POST /v1/orchestrator/noi-model       - Calculate NOI with custom portfolio size (auth required)
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

/**
 * Public structural status. Returns identity and registration metadata only.
 * No financial figures, no audit trail, no agent assignments. Designed for
 * unauthenticated smoke tests, status pages, and external dashboards.
 */
export function handleOrchestratorPublicStatus() {
  const d = getMasterPromptDashboard();
  return jsonResponse({
    system: d.system,
    status: d.status,
    governance: d.governance,
    avatars: {
      count: d.avatars.length,
      ids: d.avatars.map(a => a.id),
    },
    marketingAssets: {
      count: d.marketingAssets.count,
      live: d.marketingAssets.live,
    },
    researchGaps: { count: d.researchGaps.length },
    collectionsAgent: d.collectionsAgent ? {
      id: d.collectionsAgent.id,
      status: d.collectionsAgent.status,
      complianceControls: d.collectionsAgent.complianceControls,
      endpoints: d.collectionsAgent.endpoints,
      reportsTo: d.collectionsAgent.reportsTo,
    } : null,
    timestamp: d.timestamp,
  });
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
