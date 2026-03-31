/**
 * Response utilities — JSON responses with CORS headers.
 */

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message, status }, status);
}

const ALLOWED_ORIGINS = [
  'https://coastalkey-pm.com',
  'https://www.coastalkey-pm.com',
];

export function corsHeaders(request) {
  const origin = request?.headers?.get?.('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}
