/**
 * AI Backend Tier Routes — Low-cost AI service API handlers.
 *
 * Endpoints:
 *   GET  /v1/ai-tier/plans              — All service tiers (Free → Managed)
 *   GET  /v1/ai-tier/plans/:id          — Single tier detail
 *   GET  /v1/ai-tier/reports            — AI report templates
 *   GET  /v1/ai-tier/cost-structure     — Infrastructure cost breakdown
 *   GET  /v1/ai-tier/metrics            — Unit economics & projections
 */

import { getServiceTiers, getServiceTier, getAIReportTemplates, getCostStructure, getAIBackendMetrics } from '../services/ai-backend-tier.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleAITierPlans() {
  return jsonResponse(getServiceTiers());
}

export function handleAITierPlan(tierId) {
  const tier = getServiceTier(tierId);
  if (!tier) {
    return errorResponse(`Tier "${tierId}" not found. Valid IDs: TIER-FREE, TIER-AI-399, TIER-MONITOR-2999, TIER-MANAGED-199`, 404);
  }
  return jsonResponse({ tier });
}

export function handleAITierReports() {
  return jsonResponse(getAIReportTemplates());
}

export function handleAITierCostStructure() {
  return jsonResponse(getCostStructure());
}

export function handleAITierMetrics() {
  return jsonResponse(getAIBackendMetrics());
}
