/**
 * Response utilities — JSON responses with CORS headers.
 */

export function jsonResponse(data, status = 200, requestOrigin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(requestOrigin) },
  });
}

export function errorResponse(message, status = 500, requestOrigin) {
  return jsonResponse({ error: message, status }, status, requestOrigin);
}

/**
 * CORS headers — restrict to known origins in production.
 * Falls back to wildcard only for local dev (localhost).
 */
const ALLOWED_ORIGINS = [
  'https://coastalkey-pm.com',
  'https://www.coastalkey-pm.com',
  'https://ck-command-center.pages.dev',
];

export function corsHeaders(requestOrigin) {
  const origin = ALLOWED_ORIGINS.includes(requestOrigin)
    ? requestOrigin
    : (requestOrigin && requestOrigin.startsWith('http://localhost') ? requestOrigin : ALLOWED_ORIGINS[0]);

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}
