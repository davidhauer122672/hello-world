/**
 * Transformation Route Dispatcher
 *
 * Wires the Enterprise Transformation Roadmap (CK-STRAT-WCT-V1.0) endpoints
 * into the gateway. Returns a Response if matched, null otherwise.
 */

import {
  handleTransformationSchedule,
  handleTransformationKPIs,
  handleTransformationRisks,
  handleTransformationAlert,
} from './transformation.js';

export async function dispatchTransformation(path, method, request, env, ctx) {
  if (path === '/v1/transformation/schedule' && method === 'GET') {
    return handleTransformationSchedule(request, env, ctx);
  }
  if (path === '/v1/transformation/kpis' && method === 'GET') {
    return await handleTransformationKPIs(request, env, ctx);
  }
  if (path === '/v1/transformation/risks' && method === 'GET') {
    return await handleTransformationRisks(request, env, ctx);
  }
  if (path === '/v1/transformation/alert' && method === 'POST') {
    return await handleTransformationAlert(request, env, ctx);
  }
  return null;
}
