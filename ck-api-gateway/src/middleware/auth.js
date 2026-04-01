/**
 * Auth Middleware — Bearer token validation against WORKER_AUTH_TOKEN secret.
 * Uses constant-time comparison to prevent timing attacks.
 */

import { errorResponse } from '../utils/response.js';

export function authenticate(request, env) {
  const token = env.WORKER_AUTH_TOKEN;
  if (!token) {
    return errorResponse('Authentication service unavailable', 500);
  }

  const authHeader = request.headers.get('Authorization') || '';
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return errorResponse('Missing or malformed Authorization header. Use: Bearer <token>', 401);
  }

  const provided = match[1];
  if (!timingSafeEqual(provided, token)) {
    return errorResponse('Invalid bearer token', 403);
  }

  return null; // Auth passed
}

/**
 * Constant-time string comparison to prevent timing-based token extraction.
 * Pads shorter input to expected length so length differences don't leak via timing.
 */
function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  const maxLen = Math.max(bufA.length, bufB.length);
  let result = bufA.length ^ bufB.length; // non-zero if lengths differ
  for (let i = 0; i < maxLen; i++) {
    result |= (bufA[i] || 0) ^ (bufB[i] || 0);
  }
  return result === 0;
}
