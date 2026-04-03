/**
 * Atlas Routes — MongoDB Atlas Data API endpoints
 *
 * Routes:
 *   GET  /v1/atlas/transcripts         — Search call transcripts
 *   GET  /v1/atlas/transcripts/:callId — Get single transcript
 *   GET  /v1/atlas/analytics           — Get call analytics for date range
 *   POST /v1/atlas/analytics           — Store daily analytics snapshot
 *   GET  /v1/atlas/agents/:id/history  — Get agent performance history
 *   POST /v1/atlas/prompts             — Store new prompt version
 *   GET  /v1/atlas/prompts/active      — Get active prompt version
 *   GET  /v1/atlas/properties          — Search property intelligence
 *   GET  /v1/atlas/health              — Atlas connectivity check
 */

import {
  searchTranscripts,
  getTranscript,
  getAnalytics,
  storeDailyAnalytics,
  storeAgentSnapshot,
  storePromptVersion,
  getActivePrompt,
  searchProperties,
  atlasRequest,
  DATABASES,
  COLLECTIONS,
} from '../services/atlas.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

export async function handleAtlasTranscripts(url, env) {
  const filters = {
    agent_id: url.searchParams.get('agent_id'),
    campaign: url.searchParams.get('campaign'),
    disposition: url.searchParams.get('disposition'),
    service_zone: url.searchParams.get('service_zone'),
    since: url.searchParams.get('since'),
  };

  // Remove null filters
  Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k]; });

  const limit = parseInt(url.searchParams.get('limit') || '50', 10);
  const result = await searchTranscripts(env, filters, limit);

  return jsonResponse({
    success: true,
    count: result.documents?.length || 0,
    transcripts: result.documents || [],
  });
}

export async function handleAtlasTranscriptById(callId, env) {
  const result = await getTranscript(env, callId);

  if (!result.document) {
    return errorResponse(`Transcript not found for call_id: ${callId}`, 404);
  }

  return jsonResponse({
    success: true,
    transcript: result.document,
  });
}

export async function handleAtlasAnalyticsGet(url, env) {
  const startDate = url.searchParams.get('start') || new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const endDate = url.searchParams.get('end') || new Date().toISOString().split('T')[0];
  const campaign = url.searchParams.get('campaign') || 'th-sentinel';

  const result = await getAnalytics(env, startDate, endDate, campaign);

  return jsonResponse({
    success: true,
    period: { start: startDate, end: endDate },
    campaign,
    count: result.documents?.length || 0,
    analytics: result.documents || [],
  });
}

export async function handleAtlasAnalyticsStore(request, env, ctx) {
  const body = await request.json();
  const result = await storeDailyAnalytics(env, body);

  writeAudit(env, ctx, { route: '/v1/atlas/analytics', action: 'store_analytics', date: body.date });

  return jsonResponse({ success: true, inserted_id: result.insertedId });
}

export async function handleAtlasAgentHistory(agentId, url, env) {
  const since = url.searchParams.get('since') || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

  const result = await atlasRequest(env, 'find', DATABASES.OPERATIONS, COLLECTIONS.AGENT_PERFORMANCE_HISTORY, {
    filter: {
      agent_id: agentId,
      date: { $gte: { $date: new Date(since).toISOString() } },
    },
    sort: { date: -1 },
    limit: 90,
  });

  return jsonResponse({
    success: true,
    agent_id: agentId,
    since,
    count: result.documents?.length || 0,
    history: result.documents || [],
  });
}

export async function handleAtlasPromptStore(request, env, ctx) {
  const body = await request.json();

  if (!body.version || !body.prompt_text) {
    return errorResponse('version and prompt_text are required', 400);
  }

  const result = await storePromptVersion(env, body);

  writeAudit(env, ctx, { route: '/v1/atlas/prompts', action: 'store_prompt', version: body.version });

  return jsonResponse({ success: true, inserted_id: result.insertedId });
}

export async function handleAtlasActivePrompt(url, env) {
  const campaign = url.searchParams.get('campaign') || 'th-sentinel';
  const result = await getActivePrompt(env, campaign);

  return jsonResponse({
    success: true,
    campaign,
    prompt: result.document || null,
  });
}

export async function handleAtlasProperties(url, env) {
  const filters = {
    service_zone: url.searchParams.get('zone'),
    property_type: url.searchParams.get('type'),
    is_absentee: url.searchParams.get('absentee') === 'true' ? true : undefined,
    min_value: url.searchParams.get('min_value') ? parseInt(url.searchParams.get('min_value'), 10) : undefined,
    city: url.searchParams.get('city'),
  };

  Object.keys(filters).forEach(k => { if (filters[k] === undefined) delete filters[k]; });

  const limit = parseInt(url.searchParams.get('limit') || '100', 10);
  const result = await searchProperties(env, filters, limit);

  return jsonResponse({
    success: true,
    count: result.documents?.length || 0,
    properties: result.documents || [],
  });
}

export async function handleAtlasHealth(env) {
  if (!env.ATLAS_DATA_API_URL || !env.ATLAS_DATA_API_KEY) {
    return jsonResponse({
      status: 'not_configured',
      message: 'Atlas Data API credentials not set. Configure ATLAS_DATA_API_URL and ATLAS_DATA_API_KEY.',
    });
  }

  try {
    // Lightweight connectivity test
    await atlasRequest(env, 'find', DATABASES.AI_OPS, COLLECTIONS.AUDIT_TRAIL, {
      filter: {},
      limit: 1,
    });

    return jsonResponse({
      status: 'operational',
      cluster: env.ATLAS_CLUSTER_NAME || 'ckpm-production',
      databases: ['ckpm_operations', 'ckpm_property_intel', 'ckpm_ai_ops'],
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return jsonResponse({
      status: 'error',
      message: err.message,
      timestamp: new Date().toISOString(),
    }, 503);
  }
}
