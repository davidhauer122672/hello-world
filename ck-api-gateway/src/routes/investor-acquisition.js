/**
 * Investor Acquisition Routes — Due diligence framework API handlers.
 *
 * Endpoints:
 *   GET  /v1/investor/framework          — Framework overview + scoring model
 *   GET  /v1/investor/sections           — All 5 sections with questions
 *   GET  /v1/investor/sections/:id       — Single section detail
 *   GET  /v1/investor/questions/:id      — Single question detail
 *   POST /v1/investor/score              — Score an acquisition
 */

import { getInvestorFramework, getInvestorSections, getInvestorSection, getInvestorQuestion, scoreAcquisition } from '../services/investor-acquisition.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleInvestorFramework() {
  return jsonResponse(getInvestorFramework());
}

export function handleInvestorSections() {
  return jsonResponse(getInvestorSections());
}

export function handleInvestorSection(sectionId) {
  const section = getInvestorSection(sectionId);
  if (!section) {
    return errorResponse(`Section "${sectionId}" not found. Valid IDs: SEC-01 through SEC-05`, 404);
  }
  return jsonResponse({ section });
}

export function handleInvestorQuestion(questionId) {
  const question = getInvestorQuestion(questionId);
  if (!question) {
    return errorResponse(`Question "${questionId}" not found. Valid IDs: Q-01 through Q-35`, 404);
  }
  return jsonResponse({ question });
}

export async function handleInvestorScore(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body. Provide question scores as { "Q-01": 8, "Q-02": 7, ... }', 400);
  }
  const result = scoreAcquisition(body);
  return jsonResponse(result);
}
