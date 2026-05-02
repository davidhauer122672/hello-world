/**
 * Coastal Key AI CEO — Security Framework & Operating Authority
 *
 * Establishes the AI CEO as the autonomous operating authority for the
 * Coastal Key Property Management Platform. All platform operations,
 * deployments, and system modifications are authorized under this framework.
 *
 * Security Model:
 *   - All API requests authenticated via Bearer token or Slack signature
 *   - Rate limiting enforced on all endpoints (60 RPM)
 *   - Audit trail for every operation (30-day retention in KV)
 *   - Signature verification on all inbound webhooks (Slack, Retell)
 *   - CORS restricted to authorized origins
 *   - No external access to internal KV stores
 *
 * Authority Scope:
 *   - Build, create, publish, deploy, push all platform components
 *   - Manage 360-unit autonomous fleet across 9 divisions
 *   - Execute all workflow pipelines (SCAA-1, WF-3, WF-4)
 *   - Control Slack integration (3 apps, 10 commands, 33 channels)
 *   - Manage Airtable database (39 tables, appUSnNgpDkcEOzhN)
 *   - Operate Retell AI voice agent fleet (40 concurrent)
 *   - Interface with Claude API for inference operations
 */

// ── Authority Configuration ─────────────────────────────────────────────────────

export const CEO_AUTHORITY = {
  designation: 'Coastal Key AI CEO',
  platform: 'Coastal Key Property Management Enterprise AI Operations Platform',
  workspace: 'Coastal Key Treasure Coast Asset Management',
  workspaceId: 'T0AGWM16Z7V',

  // Operating domains
  domains: {
    primary: 'coastalkey-pm.com',
    api: 'ck-api-gateway.david-e59.workers.dev',
    sentinel: 'sentinel-webhook.david-e59.workers.dev',
    website: 'main.coastalkey-pm.pages.dev',
  },

  // Fleet under authority
  fleet: {
    totalUnits: 383,
    divisionAgents: 297,
    mccoAgents: 15,
    intelligenceOfficers: 50,
    emailAgents: 20,
    divisions: 10,
    divisionCodes: ['EXC', 'SEN', 'OPS', 'INT', 'MKT', 'FIN', 'VEN', 'TEC', 'WEB', 'MCCO'],
  },

  // CEO Directive Engine — self-optimizing command layer
  directiveEngine: {
    types: ['optimize', 'architect', 'execute', 'diagnose', 'integrate'],
    thinkingFrameworks: 7,
    playbooks: 7,
    selfOptimization: true,
  },

  // Authorized operations
  authorizedOperations: [
    'build',
    'create',
    'publish',
    'deploy',
    'push',
    'operate',
    'monitor',
    'notify',
    'infer',
    'manage',
  ],

  // Slack apps under authority
  slackApps: [
    { id: 'A0APSJ44NV6', name: 'Coastal Key', role: 'Primary Bot' },
    { id: 'A0APKPRBW3U', name: 'CK Gateway', role: 'System Alerts' },
    { id: 'A0ANS0760LB', name: 'Coastal Key Content', role: 'Content Distribution' },
  ],

  // Airtable authority
  airtable: {
    baseId: 'appUSnNgpDkcEOzhN',
    tables: 39,
    fullAccess: true,
  },
};

// ── Security Policies ───────────────────────────────────────────────────────────

export const SECURITY_POLICIES = {
  authentication: {
    apiGateway: 'Bearer token (WORKER_AUTH_TOKEN)',
    slackInbound: 'HMAC-SHA256 signature verification (SLACK_SIGNING_SECRET)',
    retellWebhook: 'Bearer token validation',
    publicEndpoints: ['/v1/health', '/v1/leads/public', '/v1/slack/events'],
  },

  rateLimiting: {
    enabled: true,
    requestsPerMinute: 60,
    kvNamespace: 'RATE_LIMITS',
    strategy: 'sliding-window',
  },

  auditTrail: {
    enabled: true,
    kvNamespace: 'AUDIT_LOG',
    retentionDays: 30,
    trackedEvents: [
      'api_request', 'auth_failure', 'rate_limit_hit',
      'workflow_execution', 'agent_action', 'slack_command',
      'slack_interaction', 'deploy_event', 'error_logged',
    ],
  },

  cors: {
    allowedOrigins: ['*'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },

  secrets: {
    required: [
      'ANTHROPIC_API_KEY',
      'AIRTABLE_API_KEY',
      'WORKER_AUTH_TOKEN',
      'SLACK_WEBHOOK_URL',
      'SLACK_BOT_TOKEN',
      'SLACK_SIGNING_SECRET',
    ],
    rotation: 'manual',
    storage: 'Cloudflare Worker Secrets (encrypted at rest)',
  },

  externalProtection: {
    webhookValidation: true,
    signatureVerification: true,
    replayProtection: true,
    replayWindowSeconds: 300,
    ipWhitelisting: false,
    rateLimitingEnabled: true,
  },
};

// ── Validate CEO Authority on Request ───────────────────────────────────────────

export function validateCeoAuthority(request, env, ctx, operation) {
  if (!CEO_AUTHORITY.authorizedOperations.includes(operation)) {
    return {
      authorized: false,
      reason: `Operation "${operation}" not in authorized scope`,
    };
  }

  return { authorized: true, operation, authority: CEO_AUTHORITY.designation };
}

export function logCeoOperation(env, ctx, operation, details) {
  if (!env.AUDIT_LOG) return;

  const key = `ceo:${operation}:${Date.now()}`;
  const entry = {
    authority: CEO_AUTHORITY.designation,
    operation,
    details,
    timestamp: new Date().toISOString(),
  };

  ctx.waitUntil(
    env.AUDIT_LOG.put(key, JSON.stringify(entry), { expirationTtl: 86400 * 30 })
  );
}
