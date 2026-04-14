/**
 * ReTell Config Routes — Voice agent function framework API handlers.
 *
 * Endpoints:
 *   GET  /v1/retell/framework            — Framework overview
 *   GET  /v1/retell/functions            — All 8 custom functions
 *   GET  /v1/retell/functions/:id        — Single function detail
 *   GET  /v1/retell/tests                — All 12 test scenarios
 *   GET  /v1/retell/pipeline             — Deployment pipeline
 */

import { getRetellFramework, getRetellFunctions, getRetellFunction, getRetellTests, getRetellPipeline } from '../services/retell-config.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export function handleRetellFramework() {
  return jsonResponse(getRetellFramework());
}

export function handleRetellFunctions() {
  return jsonResponse(getRetellFunctions());
}

export function handleRetellFunction(functionId) {
  const fn = getRetellFunction(functionId);
  if (!fn) {
    return errorResponse(`Function "${functionId}" not found. Valid IDs: FN-001 through FN-008`, 404);
  }
  return jsonResponse({ function: fn });
}

export function handleRetellTests() {
  return jsonResponse(getRetellTests());
}

export function handleRetellPipeline() {
  return jsonResponse(getRetellPipeline());
}
