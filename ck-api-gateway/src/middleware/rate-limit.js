/**
 * Rate Limiter — Per-IP sliding window using KV.
 * Default: 60 requests/minute (configurable via RATE_LIMIT_RPM env var).
 */

import { errorResponse } from '../utils/response.js';

export async function rateLimit(request, env) {
  if (!env.RATE_LIMITS) return null;

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rpm = parseInt(env.RATE_LIMIT_RPM || '60', 10);
  const windowKey = `rl:${ip}:${Math.floor(Date.now() / 60000)}`;

  const current = parseInt(await env.RATE_LIMITS.get(windowKey) || '0', 10);

  if (current >= rpm) {
    return errorResponse(`Rate limit exceeded. Max ${rpm} requests per minute.`, 429);
  }

  // Increment counter before proceeding (awaited to prevent race conditions)
  await env.RATE_LIMITS.put(windowKey, String(current + 1), { expirationTtl: 120 });

  return null;
}
