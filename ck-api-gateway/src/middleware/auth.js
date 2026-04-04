/**
 * Auth Middleware — Bearer token validation against WORKER_AUTH_TOKEN secret.
 * Uses constant-time comparison to prevent timing attacks.
 */

import { errorResponse } from '../utils/response.js';

export function authenticate(request, env) {
  const token = env.WORKER_AUTH_TOKEN;
  if (!token) {
    return errorResponse('Server misconfiguration: auth token not set', 500);
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
 */
function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}
