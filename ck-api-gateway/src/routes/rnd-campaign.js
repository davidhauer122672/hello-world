/**
 * R&D Campaign Routes — 7-Day Campaign Plan API handlers.
 *
 * Endpoints:
 *   GET  /v1/rnd/campaign                — Full 7-day campaign plan
 *   GET  /v1/rnd/campaign/status         — Live campaign status
 *   GET  /v1/rnd/campaign/day/:day       — Single day's plan
 *   GET  /v1/rnd/campaign/competitors    — Competitor analysis matrix
 *   GET  /v1/rnd/campaign/systems        — Unincorporated systems to adopt
 */

import { getCampaignPlan, getCampaignDay, getCampaignStatus, getCompetitorMatrix, getUnincorporatedSystems } from '../services/campaign-plan.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleRndCampaignPlan() {
  return jsonResponse(getCampaignPlan());
}

export function handleRndCampaignStatus() {
  return jsonResponse(getCampaignStatus());
}

export function handleRndCampaignDay(dayNumber) {
  const num = parseInt(dayNumber, 10);
  if (isNaN(num) || num < 1 || num > 7) {
    return errorResponse('Day must be between 1 and 7', 400);
  }
  const day = getCampaignDay(num);
  if (!day) {
    return errorResponse(`Day ${num} not found`, 404);
  }
  return jsonResponse(day);
}

export function handleRndCompetitors() {
  return jsonResponse(getCompetitorMatrix());
}

export function handleRndSystems() {
  return jsonResponse(getUnincorporatedSystems());
}
