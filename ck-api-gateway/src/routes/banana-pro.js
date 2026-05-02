/**
 * Banana Pro AI Routes
 *
 *   POST /v1/banana/generate     — Generate content via Banana Pro AI
 *   POST /v1/banana/score-lead   — AI lead scoring
 *   POST /v1/banana/property-desc — Generate property description
 *   POST /v1/banana/forecast     — Market forecast
 *   POST /v1/banana/batch        — Batch content generation
 *   GET  /v1/banana/health       — Banana Pro connection status
 */

import { generateSocialContent, scoreLeadAI, generatePropertyDescription, marketForecast, batchGenerateContent, bananProInference } from '../services/banana-pro.js';
import { createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * POST /v1/banana/generate — Generate social/marketing content via Banana Pro AI.
 */
export async function handleBananaGenerate(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { topic, platform, tone, propertyData } = body;
  if (!topic) return errorResponse('"topic" is required.', 400);
  if (!platform) return errorResponse('"platform" is required.', 400);

  const result = await generateSocialContent(env, { topic, platform, tone, propertyData });

  // Log to AI Log
  ctx.waitUntil(
    createRecord(env, TABLES.AI_LOG, {
      'Log Entry': `BananaPro: content_gen — ${platform} — ${topic.slice(0, 50)}`,
      'Module': { name: 'BananaPro' },
      'Request Type': { name: 'content_generation' },
      'Input Brief': JSON.stringify({ topic, platform, tone }).slice(0, 10000),
      'Output Text': JSON.stringify(result.output).slice(0, 10000),
      'Model Used': { name: result.modelId },
      'Timestamp': new Date().toISOString(),
      'Status': { name: 'Completed' },
    }).catch(err => console.error('AI Log creation failed:', err))
  );

  writeAudit(env, ctx, { route: '/v1/banana/generate', action: 'content_gen', platform, model: result.modelId, cached: result.cached });

  return jsonResponse({ content: result.output, model: result.modelId, latencyMs: result.latencyMs, cached: result.cached });
}

/**
 * POST /v1/banana/score-lead — AI-powered lead scoring.
 */
export async function handleBananaScoreLead(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!body.leadData) return errorResponse('"leadData" object is required.', 400);

  const result = await scoreLeadAI(env, body.leadData);

  writeAudit(env, ctx, { route: '/v1/banana/score-lead', action: 'lead_score', model: result.modelId });

  return jsonResponse({ score: result.output, model: result.modelId, latencyMs: result.latencyMs });
}

/**
 * POST /v1/banana/property-desc — Generate AI property description.
 */
export async function handleBananaPropertyDesc(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { address, zone, value, features } = body;
  if (!address) return errorResponse('"address" is required.', 400);

  const result = await generatePropertyDescription(env, { address, zone, value, features });

  writeAudit(env, ctx, { route: '/v1/banana/property-desc', action: 'property_desc', model: result.modelId });

  return jsonResponse({ description: result.output, model: result.modelId, latencyMs: result.latencyMs });
}

/**
 * POST /v1/banana/forecast — Market forecast via predictive analytics.
 */
export async function handleBananaForecast(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  const { zone, timeframe, metrics } = body;
  if (!zone) return errorResponse('"zone" is required.', 400);

  const result = await marketForecast(env, { zone, timeframe, metrics });

  writeAudit(env, ctx, { route: '/v1/banana/forecast', action: 'market_forecast', zone, model: result.modelId });

  return jsonResponse({ forecast: result.output, model: result.modelId, latencyMs: result.latencyMs });
}

/**
 * POST /v1/banana/batch — Batch content generation for content calendar.
 */
export async function handleBananaBatch(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!Array.isArray(body.entries) || body.entries.length === 0) {
    return errorResponse('"entries" array is required.', 400);
  }

  if (body.entries.length > 50) {
    return errorResponse('Maximum 50 entries per batch.', 400);
  }

  const results = await batchGenerateContent(env, body.entries);

  writeAudit(env, ctx, { route: '/v1/banana/batch', action: 'batch_content', count: body.entries.length });

  return jsonResponse({ results, count: results.length });
}

/**
 * GET /v1/banana/health — Banana Pro connection health check.
 */
export async function handleBananaHealth(env) {
  const status = {
    service: 'banana-pro-ai',
    configured: !!env.BANANA_PRO_API_KEY,
    models: {
      contentGen: env.BANANA_PRO_MODEL_CONTENT || 'ck-content-gen-v2',
      imageAnalysis: env.BANANA_PRO_MODEL_IMAGE || 'ck-image-analysis-v1',
      leadScore: env.BANANA_PRO_MODEL_SCORING || 'ck-lead-score-v3',
      marketForecast: env.BANANA_PRO_MODEL_FORECAST || 'ck-market-forecast-v1',
      propertyDesc: env.BANANA_PRO_MODEL_PROPERTY || 'ck-property-desc-v2',
      socialContent: env.BANANA_PRO_MODEL_SOCIAL || 'ck-social-content-v1',
    },
    timestamp: new Date().toISOString(),
  };

  // Connectivity test
  if (env.BANANA_PRO_API_KEY) {
    try {
      const testResult = await bananProInference(env, {
        model: 'content-gen',
        input: { prompt: 'health check ping', maxTokens: 5 },
      });
      status.connectivity = 'operational';
      status.latencyMs = testResult.latencyMs;
    } catch (err) {
      status.connectivity = 'error';
      status.error = err.message;
    }
  } else {
    status.connectivity = 'not_configured';
  }

  return jsonResponse(status);
}
