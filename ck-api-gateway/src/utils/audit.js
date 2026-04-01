/**
 * Audit — Writes structured entries to the AUDIT_LOG KV namespace.
 * 30-day TTL. Entries are keyed by timestamp for chronological retrieval.
 */

export function writeAudit(env, ctx, entry) {
  if (!env.AUDIT_LOG) {
    console.warn('[Audit] AUDIT_LOG KV binding not configured — audit entry skipped');
    return;
  }

  const rand = crypto.getRandomValues(new Uint8Array(4));
  const suffix = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');
  const key = `audit:${entry.route || 'unknown'}:${Date.now()}:${suffix}`;
  const record = {
    ...entry,
    timestamp: new Date().toISOString(),
    service: 'ck-api-gateway',
  };

  ctx.waitUntil(
    env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: 86400 * 30 })
      .catch(err => console.error('[Audit] KV write failed:', err.message))
  );
}
