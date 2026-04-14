/**
 * Risk Mitigation Routes — Predictive AI risk engine API handlers.
 *
 * Endpoints:
 *   GET  /v1/risk/engine                — Risk engine overview
 *   GET  /v1/risk/domains               — All risk domains
 *   GET  /v1/risk/domains/:id           — Single risk domain detail
 *   GET  /v1/risk/sensors               — Sensor integration specs
 *   POST /v1/risk/assess                — AI risk assessment for property
 *   GET  /v1/risk/metrics               — Risk engine KPIs & projections
 */

import { getRiskEngine, getRiskDomains, getRiskDomain, getSensorIntegration, getRiskAssessment, getRiskMetrics } from '../services/risk-mitigation.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleRiskEngine() {
  return jsonResponse(getRiskEngine());
}

export function handleRiskDomains() {
  return jsonResponse(getRiskDomains());
}

export function handleRiskDomain(domainId) {
  const domain = getRiskDomain(domainId);
  if (!domain) {
    return errorResponse(`Risk domain "${domainId}" not found. Valid IDs: RISK-WATER, RISK-PEST, RISK-SECURITY, RISK-INSURANCE`, 404);
  }
  return jsonResponse({ domain });
}

export function handleSensorIntegration() {
  return jsonResponse(getSensorIntegration());
}

export async function handleRiskAssessment(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body. Provide propertyAge, vacantMonths, roofAge, floodZone.', 400);
  }
  const assessment = getRiskAssessment(body);
  return jsonResponse(assessment);
}

export function handleRiskMetrics() {
  return jsonResponse(getRiskMetrics());
}
