/**
 * Coastal Key Agent OS — Authentication Middleware
 * Bearer token validation with timing-safe comparison.
 */

export function authenticate(request, env) {
  const header = request.headers.get('Authorization');
  if (!header || !header.startsWith('Bearer ')) return false;

  const token = header.slice(7);
  const expected = env.WORKER_AUTH_TOKEN;
  if (!expected || token.length !== expected.length) return false;

  let match = 0;
  for (let i = 0; i < token.length; i++) {
    match |= token.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return match === 0;
}
