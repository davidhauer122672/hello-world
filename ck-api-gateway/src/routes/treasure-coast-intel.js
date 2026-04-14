/**
 * Treasure Coast Intel Routes — Market intelligence API handlers.
 *
 * Endpoints:
 *   GET  /v1/tc-intel/overview            — Market overview & positioning
 *   GET  /v1/tc-intel/competitors         — Full competitor analysis
 *   GET  /v1/tc-intel/competitors/:id     — Single competitor detail
 *   GET  /v1/tc-intel/automation-gaps     — Automation gap analysis
 *   GET  /v1/tc-intel/metrics             — TAM/SAM/SOM & market metrics
 */

import { getMarketOverview, getCompetitors, getCompetitor, getAutomationGaps, getMarketMetrics } from '../services/treasure-coast-intel.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleTCIntelOverview() {
  return jsonResponse(getMarketOverview());
}

export function handleTCIntelCompetitors() {
  return jsonResponse(getCompetitors());
}

export function handleTCIntelCompetitor(competitorId) {
  const competitor = getCompetitor(competitorId);
  if (!competitor) {
    return errorResponse(`Competitor "${competitorId}" not found. Valid IDs: COMP-001 through COMP-007`, 404);
  }
  return jsonResponse({ competitor });
}

export function handleTCIntelAutomationGaps() {
  return jsonResponse(getAutomationGaps());
}

export function handleTCIntelMetrics() {
  return jsonResponse(getMarketMetrics());
}
