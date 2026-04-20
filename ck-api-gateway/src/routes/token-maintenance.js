/**
 * Token Maintenance Routes — Credential Lifecycle Management
 *
 * Routes:
 *   GET  /v1/tokens/dashboard  — Agent status and credential fleet overview
 *   POST /v1/tokens/scan       — Run health checks on all credentials
 *   GET  /v1/tokens/registry   — Credential registry (no secrets exposed)
 */

import { jsonResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  CREDENTIAL_REGISTRY,
  scanAllCredentials,
  getTokenAgentDashboard,
} from '../engines/token-maintenance.js';

export function handleTokenDashboard(env) {
  return jsonResponse(getTokenAgentDashboard(env));
}

export async function handleTokenScan(env, ctx) {
  const results = await scanAllCredentials(env);

  writeAudit(env, ctx, '/v1/tokens/scan', {
    action: 'credential_fleet_scan',
    total: results.summary.total,
    configured: results.summary.configured,
    healthy: results.summary.healthy,
    failing: results.summary.failing,
    status: results.summary.status,
  });

  return jsonResponse(results);
}

export function handleTokenRegistry() {
  return jsonResponse({
    registry: CREDENTIAL_REGISTRY.map(c => ({
      id: c.id,
      name: c.name,
      provider: c.provider,
      scope: c.scope,
      category: c.category,
      rotationDays: c.rotationDays,
      hasHealthCheck: !!c.healthCheck,
    })),
    count: CREDENTIAL_REGISTRY.length,
    rotationPolicy: {
      standard: '90 days for API keys',
      extended: '180 days for OAuth secrets',
      static: 'No rotation for signing secrets and client IDs',
      shortCycle: '60 days for Meta tokens',
    },
  });
}
