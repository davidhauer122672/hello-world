/**
 * CK API Gateway — Coastal Key Central Inference Router
 *
 * Routes:
 *   POST /v1/inference          — Claude inference with KV caching + audit logging
 *   POST /v1/leads              — Create lead in Airtable Leads table
 *   POST /v1/leads/enrich       — AI-enrich an existing lead (battle plan, segment analysis)
 *   GET  /v1/leads/:id          — Fetch lead by record ID
 *   POST /v1/webhook/retell     — Retell call_analyzed → Lead + Slack
 *   POST /v1/content/generate   — Generate content (social, email, script) via Claude
 *   GET  /v1/health             — Health check
 *   GET  /v1/audit              — Retrieve recent audit log entries
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 */

import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { handleInference } from './routes/inference.js';
import { handleCreateLead, handleGetLead, handleEnrichLead } from './routes/leads.js';
import { handleRetellWebhook } from './routes/retell.js';
import { handleContentGenerate } from './routes/content.js';
import { handleAuditLog } from './routes/audit.js';
import { jsonResponse, errorResponse, corsHeaders } from './utils/response.js';

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── Health (no auth) ──
    if (path === '/v1/health' && method === 'GET') {
      return jsonResponse({
        status: 'operational',
        service: 'ck-api-gateway',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    }

    // ── Auth gate ──
    const authError = authenticate(request, env);
    if (authError) return authError;

    // ── Rate limit ──
    const rateLimitError = await rateLimit(request, env);
    if (rateLimitError) return rateLimitError;

    try {
      // ── Route dispatch ──
      if (path === '/v1/inference' && method === 'POST') {
        return await handleInference(request, env, ctx);
      }

      if (path === '/v1/leads' && method === 'POST') {
        return await handleCreateLead(request, env, ctx);
      }

      if (path === '/v1/leads/enrich' && method === 'POST') {
        return await handleEnrichLead(request, env, ctx);
      }

      if (path.startsWith('/v1/leads/') && method === 'GET') {
        const recordId = path.split('/v1/leads/')[1];
        return await handleGetLead(recordId, env);
      }

      if (path === '/v1/webhook/retell' && method === 'POST') {
        return await handleRetellWebhook(request, env, ctx);
      }

      if (path === '/v1/content/generate' && method === 'POST') {
        return await handleContentGenerate(request, env, ctx);
      }

      if (path === '/v1/audit' && method === 'GET') {
        return await handleAuditLog(url, env);
      }

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error(`[CK Gateway Error] ${path}:`, err);

      // Log errors to audit KV
      if (env.AUDIT_LOG) {
        const key = `error:${Date.now()}`;
        ctx.waitUntil(
          env.AUDIT_LOG.put(key, JSON.stringify({
            path,
            method,
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
          }), { expirationTtl: 86400 * 30 })
        );
      }

      return errorResponse(`Internal error: ${err.message}`, 500);
    }
  },
};
