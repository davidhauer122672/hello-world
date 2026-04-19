/**
 * Banana Pro AI — Avatar Video Generation Engine
 *
 * Configurable API client for generating VFX avatar videos.
 * All API details are read from environment variables so the real
 * values are swapped in via `wrangler secret put` without code changes.
 *
 * Environment variables (set via wrangler secret put):
 *   BANANA_API_KEY       — API key for authentication
 *   BANANA_BASE_URL      — API base URL (default: https://api.bananapro.ai/v1)
 *   BANANA_AUTH_HEADER    — Header name (default: Authorization)
 *   BANANA_AUTH_PREFIX    — Prefix (default: Bearer )
 *
 * Integrates with: VFX Avatar Prompt Packages (3 builds),
 * Eliza AI Engine, Master Orchestrator V2.1
 */

// ── Default API Configuration (overridable via env) ────────────────────────

const DEFAULTS = {
  baseUrl: 'https://api.bananapro.ai/v1',
  authHeader: 'Authorization',
  authPrefix: 'Bearer ',
  generatePath: '/generate',
  statusPath: '/status',
  promptField: 'prompt',
  jobIdField: 'id',
  outputField: 'output_url',
  statusField: 'status',
};

function getConfig(env) {
  return {
    baseUrl: env.BANANA_BASE_URL || DEFAULTS.baseUrl,
    apiKey: env.BANANA_API_KEY || null,
    authHeader: env.BANANA_AUTH_HEADER || DEFAULTS.authHeader,
    authPrefix: env.BANANA_AUTH_PREFIX || DEFAULTS.authPrefix,
    generatePath: DEFAULTS.generatePath,
    statusPath: DEFAULTS.statusPath,
  };
}

// ── Pre-Built Avatar Prompts (from VFX Avatar Prompt Packages) ─────────────

export const AVATAR_BUILDS = {
  build1_stephanie: {
    id: 'VFX-001',
    name: 'Stephanie Gilmore (Athletic Surf)',
    specs: { width: 1179, height: 2556, fps: 60, format: 'mov', duration: '3-5s', colorSpace: 'Display P3, HDR10' },
    promptFile: 'coastal-key-vfx-avatar-prompts.md — BUILD 1',
  },
  build2_twin: {
    id: 'VFX-002',
    name: 'Identical Twin (Luxury Resort)',
    specs: { width: 1179, height: 2556, fps: 60, format: 'mov', duration: '3-5s', colorSpace: 'Display P3, HDR10' },
    promptFile: 'coastal-key-vfx-avatar-prompts.md — BUILD 2',
  },
  build3_dual: {
    id: 'VFX-003',
    name: 'Dual Character (Talking Avatars)',
    specs: { width: 1179, height: 2556, fps: 60, format: 'mov', duration: 'conversational', colorSpace: 'Display P3, HDR10' },
    promptFile: 'coastal-key-vfx-avatar-prompts.md — BUILD 3',
  },
};

// ── Generate Avatar Video ──────────────────────────────────────────────────

export async function generateAvatar(env, buildId, customPrompt = null) {
  const config = getConfig(env);

  if (!config.apiKey) {
    return {
      status: 'NOT_CONFIGURED',
      message: 'BANANA_API_KEY not set. Run: wrangler secret put BANANA_API_KEY',
      build: AVATAR_BUILDS[buildId] || null,
      setupSteps: [
        '1. Get API key from Banana Pro AI account settings',
        '2. Run: wrangler secret put BANANA_API_KEY',
        '3. Optionally set BANANA_BASE_URL if different from default',
        '4. Call this endpoint again to generate',
      ],
    };
  }

  const build = AVATAR_BUILDS[buildId];
  if (!build && !customPrompt) {
    return { error: 'Unknown build: ' + buildId + '. Valid: ' + Object.keys(AVATAR_BUILDS).join(', ') + ', or provide customPrompt.' };
  }

  const prompt = customPrompt || 'Generate VFX avatar per spec: ' + (build?.name || buildId);

  try {
    const res = await fetch(config.baseUrl + config.generatePath, {
      method: 'POST',
      headers: {
        [config.authHeader]: config.authPrefix + config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        [DEFAULTS.promptField]: prompt,
        width: build?.specs?.width || 1179,
        height: build?.specs?.height || 2556,
        fps: build?.specs?.fps || 60,
        format: build?.specs?.format || 'mov',
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: 'API error: ' + (data.message || data.error || res.status), httpStatus: res.status };
    }

    return {
      status: 'GENERATING',
      jobId: data[DEFAULTS.jobIdField] || data.job_id || data.task_id || null,
      build: build || { custom: true },
      checkStatusAt: config.baseUrl + config.statusPath + '/' + (data[DEFAULTS.jobIdField] || ''),
      estimatedTime: '2-5 minutes',
      submittedAt: new Date().toISOString(),
    };
  } catch (err) {
    return { error: 'Request failed: ' + err.message };
  }
}

// ── Check Generation Status ────────────────────────────────────────────────

export async function checkAvatarStatus(env, jobId) {
  const config = getConfig(env);

  if (!config.apiKey) {
    return { status: 'NOT_CONFIGURED', message: 'BANANA_API_KEY not set.' };
  }

  if (!jobId) {
    return { error: 'jobId is required' };
  }

  try {
    const res = await fetch(config.baseUrl + config.statusPath + '/' + jobId, {
      method: 'GET',
      headers: {
        [config.authHeader]: config.authPrefix + config.apiKey,
      },
    });

    const data = await res.json();

    return {
      jobId,
      status: data[DEFAULTS.statusField] || data.status || 'unknown',
      outputUrl: data[DEFAULTS.outputField] || data.result?.url || data.video_url || null,
      progress: data.progress || null,
      raw: data,
      checkedAt: new Date().toISOString(),
    };
  } catch (err) {
    return { error: 'Status check failed: ' + err.message, jobId };
  }
}

// ── Dashboard ──────────────────────────────────────────────────────────────

export function getBananaDashboard(env) {
  const config = getConfig(env);
  return {
    engine: 'Banana Pro AI — Avatar Video Generation',
    status: config.apiKey ? 'CONFIGURED' : 'AWAITING_API_KEY',
    baseUrl: config.baseUrl,
    builds: Object.entries(AVATAR_BUILDS).map(([key, b]) => ({ key, ...b })),
    endpoints: {
      dashboard: 'GET /v1/avatar/dashboard',
      generate: 'POST /v1/avatar/generate',
      status: 'GET /v1/avatar/status/:jobId',
    },
    secrets: {
      BANANA_API_KEY: config.apiKey ? 'SET' : 'NOT SET — run: wrangler secret put BANANA_API_KEY',
      BANANA_BASE_URL: config.baseUrl,
    },
    timestamp: new Date().toISOString(),
  };
}
