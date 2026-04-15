/**
 * Eliza AI Routes — CEO Digital Avatar & Conversational AI
 *
 * Routes:
 *   GET  /v1/eliza/dashboard     — System status and deployment checklist
 *   GET  /v1/eliza/voice-config  — ElevenLabs voice configuration
 *   GET  /v1/eliza/avatar-config — HeyGen avatar configuration
 *   GET  /v1/eliza/retell-config — Retell agent configuration
 *   GET  /v1/eliza/atlas-config  — Atlas AI campaign configuration
 *   POST /v1/eliza/video-brief   — Generate video briefing request
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  VOICE_CONFIG, AVATAR_CONFIG, RETELL_CONFIG, ATLAS_CONFIG,
  getElizaDashboard, generateVideoBriefingRequest,
} from '../engines/eliza-ai.js';

export function handleElizaDashboard() {
  return jsonResponse(getElizaDashboard());
}

export function handleElizaVoiceConfig() {
  return jsonResponse({
    voice: VOICE_CONFIG,
    note: 'Paste the voiceDescription into ElevenLabs voice creation. Upload 30+ min of CEO audio for professional clone.',
  });
}

export function handleElizaAvatarConfig() {
  return jsonResponse({
    avatar: AVATAR_CONFIG,
    note: 'Requires ElevenLabs Voice ID first. Upload high-res CEO headshot to HeyGen.',
  });
}

export function handleElizaRetellConfig() {
  return jsonResponse({
    retell: RETELL_CONFIG,
    note: 'System prompt is ready. Connect ElevenLabs voice and configure webhook URL.',
  });
}

export function handleElizaAtlasConfig() {
  return jsonResponse({
    atlas: ATLAS_CONFIG,
    note: 'Three campaigns defined. Activate in Atlas dashboard and store campaign IDs as secrets.',
  });
}

export async function handleElizaVideoBrief(request, env, ctx) {
  const body = await request.json();
  if (!body.text) {
    return errorResponse('text is required for video briefing', 400);
  }

  const briefing = generateVideoBriefingRequest(body.text, body.options || {});

  writeAudit(env, ctx, '/v1/eliza/video-brief', {
    action: 'video_briefing_generated',
    textLength: body.text.length,
    purpose: briefing.metadata.purpose,
  });

  return jsonResponse(briefing);
}
