/**
 * Governance Routes — Sovereign Governance Framework API handlers.
 *
 * Endpoints:
 *   GET  /v1/governance/framework       — Full governance framework
 *   GET  /v1/governance/mission         — Mission statement
 *   GET  /v1/governance/goals           — All core goals
 *   GET  /v1/governance/goals/:id       — Single goal detail
 *   GET  /v1/governance/decision-filter — Sovereign decision filter + principles
 *   GET  /v1/governance/alignment       — Strategic alignment map
 */

import { getGovernanceFramework, getMission, getGoals, getGoal, getDecisionFilter, getAlignmentMap } from '../services/governance.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleGovernanceFramework() {
  return jsonResponse(getGovernanceFramework());
}

export function handleMission() {
  return jsonResponse(getMission());
}

export function handleGoals() {
  return jsonResponse(getGoals());
}

export function handleGoal(goalId) {
  const goal = getGoal(goalId);
  if (!goal) {
    return errorResponse(`Goal "${goalId}" not found. Valid IDs: GOAL-01 through GOAL-05`, 404);
  }
  return jsonResponse({ goal });
}

export function handleDecisionFilter() {
  return jsonResponse(getDecisionFilter());
}

export function handleAlignmentMap() {
  return jsonResponse(getAlignmentMap());
}
