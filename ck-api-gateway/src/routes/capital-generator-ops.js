/**
 * Capital Generator Ops Routes — Revenue machine API handlers.
 *
 * Endpoints:
 *   GET  /v1/capgen/overview             — Capital Generator ops overview
 *   GET  /v1/capgen/campaigns            — All outbound campaigns
 *   GET  /v1/capgen/campaigns/:id        — Single campaign detail
 *   GET  /v1/capgen/pipeline             — Lead pipeline stages + routing
 *   GET  /v1/capgen/orchestrator         — Master Orchestrator routing rules
 *   GET  /v1/capgen/revenue              — Revenue projections (goal-aligned)
 *   GET  /v1/capgen/dashboard            — Combined campaign dashboard
 */

import {
  getCapitalGeneratorOps, getCampaigns, getCampaign,
  getLeadPipeline, getOrchestrator, getRevenueProjections,
  getCampaignDashboard,
} from '../services/capital-generator-ops.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleCapGenOverview() {
  return jsonResponse(getCapitalGeneratorOps());
}

export function handleCapGenCampaigns() {
  return jsonResponse(getCampaigns());
}

export function handleCapGenCampaign(campaignId) {
  const campaign = getCampaign(campaignId);
  if (!campaign) {
    return errorResponse(`Campaign "${campaignId}" not found. Valid IDs: CAMP-01 through CAMP-05`, 404);
  }
  return jsonResponse({ campaign });
}

export function handleCapGenPipeline() {
  return jsonResponse(getLeadPipeline());
}

export function handleCapGenOrchestrator() {
  return jsonResponse(getOrchestrator());
}

export function handleCapGenRevenue() {
  return jsonResponse(getRevenueProjections());
}

export function handleCapGenDashboard() {
  return jsonResponse(getCampaignDashboard());
}
