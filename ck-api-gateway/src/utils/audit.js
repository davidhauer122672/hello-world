/**
 * Audit — Writes structured entries to the AUDIT_LOG KV namespace.
 * 30-day TTL. Entries are keyed by timestamp for chronological retrieval.
 */

export function writeAudit(env, ctx, entry) {
  if (!env.AUDIT_LOG) return;

  const key = `audit:${entry.route || 'unknown'}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const record = {
    ...entry,
    timestamp: new Date().toISOString(),
    service: 'ck-api-gateway',
  };

  ctx.waitUntil(
    env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: 86400 * 30 })
  );
}
