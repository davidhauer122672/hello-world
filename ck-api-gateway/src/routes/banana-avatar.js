/**
 * Banana Pro AI Avatar Routes
 *
 * Routes:
 *   GET  /v1/avatar/dashboard        — Engine status and available builds
 *   POST /v1/avatar/generate         — Generate avatar video
 *   GET  /v1/avatar/status/:jobId    — Check generation status
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import { generateAvatar, checkAvatarStatus, getBananaDashboard } from '../engines/banana-avatar.js';

export function handleAvatarDashboard(env) {
  return jsonResponse(getBananaDashboard(env));
}

export async function handleAvatarGenerate(request, env, ctx) {
  const body = await request.json();
  const buildId = body.build || body.buildId;
  const customPrompt = body.prompt || null;

  if (!buildId && !customPrompt) {
    return errorResponse('build or prompt is required. Builds: build1_stephanie, build2_twin, build3_dual', 400);
  }

  const result = await generateAvatar(env, buildId, customPrompt);

  writeAudit(env, ctx, '/v1/avatar/generate', {
    action: 'avatar_generation_requested',
    build: buildId || 'custom',
    status: result.status || 'error',
  });

  return jsonResponse(result, result.error ? 400 : 200);
}

export async function handleAvatarStatus(request, env) {
  const url = new URL(request.url);
  const jobId = url.pathname.split('/v1/avatar/status/')[1];

  if (!jobId) {
    return errorResponse('jobId is required in URL path', 400);
  }

  const result = await checkAvatarStatus(env, jobId);
  return jsonResponse(result, result.error ? 400 : 200);
}
