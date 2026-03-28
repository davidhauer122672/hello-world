/**
 * Inference Route — POST /v1/inference
 *
 * General-purpose Claude inference endpoint with KV caching.
 * Used by all CK systems that need AI-generated text.
 *
 * Request body:
 *   system   (string, required) — System prompt
 *   prompt   (string, required) — User message
 *   tier     (string, optional) — "fast" | "standard" | "advanced"
 *   maxTokens (number, optional) — Max response tokens (default 2048)
 *   cacheKey (string, optional) — KV cache key (skip API if cached)
 *   cacheTtl (number, optional) — Cache TTL in seconds (default 3600)
 */

import { inference } from '../services/anthropic.js';
import { createRecord, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

export async function handleInference(request, env, ctx) {
  const body = await request.json();

  if (!body.system || !body.prompt) {
    return errorResponse('Both "system" and "prompt" are required.', 400);
  }

  const result = await inference(env, {
    system: body.system,
    prompt: body.prompt,
    tier: body.tier || 'standard',
    maxTokens: body.maxTokens || 2048,
    cacheKey: body.cacheKey,
    cacheTtl: body.cacheTtl,
  });

  // ── Log to AI Log table ──
  if (body.logToAirtable !== false) {
    const moduleTag = body.module || 'Gateway';
    const requestType = body.requestType || 'inference';

    ctx.waitUntil(
      createRecord(env, TABLES.AI_LOG, {
        'Log Entry': `${moduleTag}: ${requestType} — ${new Date().toISOString()}`,
        'Module': { name: moduleTag },
        'Request Type': { name: requestType },
        'Input Brief': truncate(body.prompt, 10000),
        'Output Text': truncate(result.content, 10000),
        'Model Used': { name: result.model },
        'Timestamp': new Date().toISOString(),
        'Status': { name: 'Completed' },
      }).catch(err => console.error('AI Log write failed:', err))
    );
  }

  // ── Audit log ──
  writeAudit(env, ctx, {
    route: '/v1/inference',
    tier: body.tier || 'standard',
    model: result.model,
    cached: result.cached,
    inputTokens: result.usage?.input_tokens,
    outputTokens: result.usage?.output_tokens,
  });

  return jsonResponse({
    content: result.content,
    model: result.model,
    cached: result.cached,
    usage: result.usage,
  });
}

function truncate(str, max) {
  if (!str) return '';
  return str.length <= max ? str : str.slice(0, max - 15) + '\n[TRUNCATED]';
}
