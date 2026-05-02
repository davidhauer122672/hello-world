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
 * Pads to equal length and folds the length difference into the result
 * so that differing lengths don't cause an early return (which would leak
 * the expected token length via timing analysis).
 */
function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const maxLen = Math.max(a.length, b.length);
  const bufA = encoder.encode(a.padEnd(maxLen, '\0'));
  const bufB = encoder.encode(b.padEnd(maxLen, '\0'));
  let result = a.length ^ b.length; // length mismatch → nonzero
  for (let i = 0; i < maxLen; i++) {
    result |= bufA[i] ^ bufB[i];
  }
  return result === 0;
}
