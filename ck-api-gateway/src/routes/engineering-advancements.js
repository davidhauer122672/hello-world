/**
 * Engineering Advancements Routes — ENR-grade implementation API handlers.
 *
 * Endpoints:
 *   GET  /v1/engineering/framework       — Full engineering framework overview
 *   GET  /v1/engineering/pillars         — All 5 ENR engineering pillars
 *   GET  /v1/engineering/pillars/:id     — Single pillar detail
 *   GET  /v1/engineering/orchestrator    — Orchestrator integration map
 *   GET  /v1/engineering/positioning     — Industry positioning & standards
 *   GET  /v1/engineering/status          — Implementation deployment status
 */

import {
  getEngineeringFramework, getEngineeringPillars, getEngineeringPillar,
  getOrchestratorIntegration, getIndustryPositioning, getImplementationStatus,
} from '../services/engineering-advancements.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleEngineeringFramework() {
  return jsonResponse(getEngineeringFramework());
}

export function handleEngineeringPillars() {
  return jsonResponse(getEngineeringPillars());
}

export function handleEngineeringPillar(pillarId) {
  const pillar = getEngineeringPillar(pillarId);
  if (!pillar) {
    return errorResponse(`Pillar "${pillarId}" not found. Valid IDs: ENR-P1 through ENR-P5`, 404);
  }
  return jsonResponse({ pillar });
}

export function handleOrchestratorIntegration() {
  return jsonResponse(getOrchestratorIntegration());
}

export function handleIndustryPositioning() {
  return jsonResponse(getIndustryPositioning());
}

export function handleImplementationStatus() {
  return jsonResponse(getImplementationStatus());
}
