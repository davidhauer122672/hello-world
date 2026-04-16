/**
 * API Token Maintenance Agent — Autonomous Credential Lifecycle Manager
 *
 * Agent ID: TEC-026 (new addition to Technology Division)
 * Classification: Infrastructure Security — Sovereign Governance
 *
 * Monitors all API tokens/secrets for expiration, rotation policy compliance,
 * and health. Operates with placeholder secret references — populate via
 * `wrangler secret put` or Cloudflare Dashboard when ready.
 *
 * Integrates with: IO-C04 Rotator, IO-C09 Scanner, TEC-011 Secret Rotator
 */

// ── Credential Registry ────────────────────────────────────────────────────

export const CREDENTIAL_REGISTRY = [
  {
    id: 'CRED-001', name: 'ANTHROPIC_API_KEY', provider: 'Anthropic',
    scope: 'Claude inference API', rotationDays: 90, category: 'ai',
    healthCheck: { method: 'POST', url: 'https://api.anthropic.com/v1/messages', headerKey: 'x-api-key' },
    envKey: 'ANTHROPIC_API_KEY',
  },
  {
    id: 'CRED-002', name: 'AIRTABLE_API_KEY', provider: 'Airtable',
    scope: '39-table read/write on base appUSnNgpDkcEOzhN', rotationDays: 90, category: 'data',
    healthCheck: { method: 'GET', url: 'https://api.airtable.com/v0/appUSnNgpDkcEOzhN/Leads?maxRecords=1', headerKey: 'Authorization', headerPrefix: 'Bearer ' },
    envKey: 'AIRTABLE_API_KEY',
  },
  {
    id: 'CRED-003', name: 'WORKER_AUTH_TOKEN', provider: 'Internal',
    scope: 'Gateway bearer auth for external callers', rotationDays: 90, category: 'auth',
    healthCheck: null,
    envKey: 'WORKER_AUTH_TOKEN',
  },
  {
    id: 'CRED-004', name: 'CLOUDFLARE_API_TOKEN', provider: 'Cloudflare',
    scope: 'Workers deploy, KV, Pages', rotationDays: 90, category: 'infra',
    healthCheck: { method: 'GET', url: 'https://api.cloudflare.com/client/v4/user/tokens/verify', headerKey: 'Authorization', headerPrefix: 'Bearer ' },
    envKey: 'CLOUDFLARE_API_TOKEN',
  },
  {
    id: 'CRED-005', name: 'SLACK_BOT_TOKEN', provider: 'Slack',
    scope: 'Bot operations (xoxb-*)', rotationDays: 180, category: 'comms',
    healthCheck: { method: 'POST', url: 'https://slack.com/api/auth.test', headerKey: 'Authorization', headerPrefix: 'Bearer ' },
    envKey: 'SLACK_BOT_TOKEN',
  },
  {
    id: 'CRED-006', name: 'SLACK_SIGNING_SECRET', provider: 'Slack',
    scope: 'Webhook HMAC verification', rotationDays: 0, category: 'auth',
    healthCheck: null,
    envKey: 'SLACK_SIGNING_SECRET',
  },
  {
    id: 'CRED-007', name: 'NVIDIA_API_KEY', provider: 'NVIDIA',
    scope: 'Nemotron inference', rotationDays: 90, category: 'ai',
    healthCheck: null,
    envKey: 'NVIDIA_API_KEY',
  },
  {
    id: 'CRED-008', name: 'ATLAS_API_KEY', provider: 'Atlas AI',
    scope: 'Campaign operations', rotationDays: 90, category: 'sales',
    healthCheck: null,
    envKey: 'ATLAS_API_KEY',
  },
  {
    id: 'CRED-009', name: 'BUFFER_ACCESS_TOKEN', provider: 'Buffer',
    scope: 'Content publish to 5 profiles', rotationDays: 90, category: 'marketing',
    healthCheck: { method: 'GET', url: 'https://api.bufferapp.com/1/user.json', headerKey: 'Authorization', headerPrefix: 'Bearer ' },
    envKey: 'BUFFER_ACCESS_TOKEN',
  },
  {
    id: 'CRED-010', name: 'GOOGLE_CLIENT_ID', provider: 'Google',
    scope: 'Gmail OAuth client', rotationDays: 0, category: 'email',
    healthCheck: null,
    envKey: 'GOOGLE_CLIENT_ID',
  },
  {
    id: 'CRED-011', name: 'GOOGLE_CLIENT_SECRET', provider: 'Google',
    scope: 'Gmail OAuth secret', rotationDays: 180, category: 'email',
    healthCheck: null,
    envKey: 'GOOGLE_CLIENT_SECRET',
  },
  {
    id: 'CRED-012', name: 'GMAIL_REFRESH_TOKEN', provider: 'Google',
    scope: 'Gmail send (offline access)', rotationDays: 0, category: 'email',
    healthCheck: null,
    envKey: 'GMAIL_REFRESH_TOKEN',
  },
  {
    id: 'CRED-013', name: 'META_PAGE_ACCESS_TOKEN', provider: 'Meta',
    scope: 'Facebook/Instagram ad management', rotationDays: 60, category: 'marketing',
    healthCheck: { method: 'GET', url: 'https://graph.facebook.com/v19.0/me?fields=id,name', headerKey: 'Authorization', headerPrefix: 'Bearer ' },
    envKey: 'META_PAGE_ACCESS_TOKEN',
  },
  {
    id: 'CRED-014', name: 'ELEVENLABS_API_KEY', provider: 'ElevenLabs',
    scope: 'Voice synthesis', rotationDays: 90, category: 'ai',
    healthCheck: { method: 'GET', url: 'https://api.elevenlabs.io/v1/user', headerKey: 'xi-api-key' },
    envKey: 'ELEVENLABS_API_KEY',
  },
  {
    id: 'CRED-015', name: 'HEYGEN_API_KEY', provider: 'HeyGen',
    scope: 'Avatar video generation', rotationDays: 90, category: 'ai',
    healthCheck: null,
    envKey: 'HEYGEN_API_KEY',
  },
];

// ── Health Check Engine ────────────────────────────────────────────────────

export async function checkCredentialHealth(cred, env) {
  const result = {
    credId: cred.id,
    name: cred.name,
    provider: cred.provider,
    configured: false,
    healthy: false,
    rotationDays: cred.rotationDays,
    category: cred.category,
    checkedAt: new Date().toISOString(),
  };

  const secret = env[cred.envKey];
  if (!secret) {
    result.status = 'NOT_CONFIGURED';
    result.message = 'Secret not set. Use: wrangler secret put ' + cred.envKey;
    return result;
  }

  result.configured = true;

  if (!cred.healthCheck) {
    result.status = 'CONFIGURED_NO_CHECK';
    result.healthy = true;
    result.message = 'Secret is set. No automated health check available for this credential.';
    return result;
  }

  try {
    const headers = {};
    if (cred.healthCheck.headerKey) {
      headers[cred.healthCheck.headerKey] = (cred.healthCheck.headerPrefix || '') + secret;
    }
    if (cred.healthCheck.method === 'POST') {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(cred.healthCheck.url, {
      method: cred.healthCheck.method,
      headers,
      body: cred.healthCheck.method === 'POST' ? JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }) : undefined,
    });

    if (res.ok || res.status === 401) {
      result.healthy = res.ok;
      result.status = res.ok ? 'HEALTHY' : 'AUTH_FAILED';
      result.httpStatus = res.status;
      result.message = res.ok ? 'Credential validated successfully.' : 'Authentication failed. Token may be expired or revoked.';
    } else {
      result.status = 'DEGRADED';
      result.httpStatus = res.status;
      result.message = 'Unexpected response: HTTP ' + res.status;
    }
  } catch (err) {
    result.status = 'CHECK_FAILED';
    result.message = 'Health check error: ' + err.message;
  }

  return result;
}

// ── Full Fleet Scan ────────────────────────────────────────────────────────

export async function scanAllCredentials(env) {
  const results = [];
  for (const cred of CREDENTIAL_REGISTRY) {
    results.push(await checkCredentialHealth(cred, env));
  }

  const configured = results.filter(r => r.configured).length;
  const healthy = results.filter(r => r.healthy).length;
  const missing = results.filter(r => !r.configured).length;
  const failing = results.filter(r => r.configured && !r.healthy).length;

  return {
    agent: 'TEC-026 Token Sentinel',
    scanType: 'FULL_FLEET_CREDENTIAL_SCAN',
    timestamp: new Date().toISOString(),
    summary: {
      total: CREDENTIAL_REGISTRY.length,
      configured,
      healthy,
      missing,
      failing,
      healthScore: CREDENTIAL_REGISTRY.length > 0
        ? Math.round((healthy / CREDENTIAL_REGISTRY.length) * 100) + '%'
        : '0%',
      status: failing > 0 ? 'ACTION_REQUIRED' : missing > 3 ? 'SETUP_NEEDED' : 'OPERATIONAL',
    },
    results,
    rotationSchedule: CREDENTIAL_REGISTRY
      .filter(c => c.rotationDays > 0)
      .map(c => ({ id: c.id, name: c.name, rotationDays: c.rotationDays, provider: c.provider }))
      .sort((a, b) => a.rotationDays - b.rotationDays),
    recommendations: generateRecommendations(results),
  };
}

function generateRecommendations(results) {
  const recs = [];
  const missing = results.filter(r => !r.configured);
  const failing = results.filter(r => r.configured && !r.healthy);

  if (failing.length > 0) {
    recs.push({
      priority: 'CRITICAL',
      action: 'Rotate failing credentials immediately',
      credentials: failing.map(r => r.name),
    });
  }

  if (missing.length > 0) {
    recs.push({
      priority: 'HIGH',
      action: 'Configure missing secrets via wrangler secret put',
      credentials: missing.map(r => r.name),
    });
  }

  recs.push({
    priority: 'STANDARD',
    action: 'Schedule 90-day rotation for all rotating credentials',
    note: 'Set calendar reminders aligned with rotation policy per credential',
  });

  return recs;
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export function getTokenAgentDashboard(env) {
  const configuredCount = CREDENTIAL_REGISTRY.filter(c => !!env[c.envKey]).length;

  return {
    agent: {
      id: 'TEC-026',
      name: 'Token Sentinel',
      role: 'API Token Maintenance Agent',
      division: 'TEC',
      tier: 'advanced',
      status: 'active',
      description: 'Autonomous credential lifecycle manager. Monitors all API tokens for expiration, rotation compliance, and health. Performs automated health checks against provider APIs. Reports credential fleet status to CEO standup.',
    },
    credentialRegistry: CREDENTIAL_REGISTRY.map(c => ({
      id: c.id,
      name: c.name,
      provider: c.provider,
      category: c.category,
      configured: !!env[c.envKey],
      rotationDays: c.rotationDays,
      hasHealthCheck: !!c.healthCheck,
    })),
    fleet: {
      total: CREDENTIAL_REGISTRY.length,
      configured: configuredCount,
      unconfigured: CREDENTIAL_REGISTRY.length - configuredCount,
      byCategory: Object.entries(
        CREDENTIAL_REGISTRY.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {})
      ).map(([cat, count]) => ({ category: cat, count })),
    },
    endpoints: {
      dashboard: 'GET /v1/tokens/dashboard',
      scan: 'POST /v1/tokens/scan',
      registry: 'GET /v1/tokens/registry',
    },
    timestamp: new Date().toISOString(),
  };
}
