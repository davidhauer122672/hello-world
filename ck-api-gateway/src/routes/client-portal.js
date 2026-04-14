/**
 * Client Portal Routes — Seasonal owner automation API handlers.
 *
 * Endpoints:
 *   GET  /v1/portal/overview           — Portal engine overview
 *   GET  /v1/portal/workflows          — All automation workflows
 *   GET  /v1/portal/workflows/:id      — Single workflow detail
 *   GET  /v1/portal/dashboard          — Dashboard module configuration
 *   GET  /v1/portal/owner-profile      — Seasonal owner profile & value prop
 *   GET  /v1/portal/metrics            — Portal KPIs & projections
 */

import { getPortalOverview, getPortalWorkflows, getPortalWorkflow, getPortalDashboard, getSeasonalOwnerProfile, getPortalMetrics } from '../services/client-portal.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handlePortalOverview() {
  return jsonResponse(getPortalOverview());
}

export function handlePortalWorkflows() {
  return jsonResponse(getPortalWorkflows());
}

export function handlePortalWorkflow(workflowId) {
  const workflow = getPortalWorkflow(workflowId);
  if (!workflow) {
    return errorResponse(`Workflow "${workflowId}" not found. Valid IDs: WF-CP-001 through WF-CP-005`, 404);
  }
  return jsonResponse({ workflow });
}

export function handlePortalDashboard() {
  return jsonResponse(getPortalDashboard());
}

export function handleOwnerProfile() {
  return jsonResponse(getSeasonalOwnerProfile());
}

export function handlePortalMetrics() {
  return jsonResponse(getPortalMetrics());
}
