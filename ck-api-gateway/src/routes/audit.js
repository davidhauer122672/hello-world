/**
 * Audit Route — GET /v1/audit
 *
 * Returns recent audit log entries from the AUDIT_LOG KV namespace.
 *
 * Query params:
 *   prefix (string, optional) — Filter by key prefix (e.g., "audit:/v1/leads")
 *   limit  (number, optional) — Max entries to return (default 50, max 200)
 */

import { jsonResponse, errorResponse } from '../utils/response.js';

export async function handleAuditLog(url, env) {
  if (!env.AUDIT_LOG) {
    return errorResponse('Audit log KV namespace not configured.', 503);
  }

  const prefix = url.searchParams.get('prefix') || 'audit:';
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);

  const keys = await env.AUDIT_LOG.list({ prefix, limit });
  const entries = [];

  for (const key of keys.keys) {
    const value = await env.AUDIT_LOG.get(key.name, 'json');
    if (value) {
      entries.push({ key: key.name, ...value });
    }
  }

  return jsonResponse({
    entries,
    count: entries.length,
    cursor: keys.cursor || null,
  });
}
