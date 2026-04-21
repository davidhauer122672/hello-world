/**
 * Response utilities — JSON responses with CORS headers.
 * CORS restricted to known Coastal Key domains.
 */

const ALLOWED_ORIGINS = [
  'https://coastalkey-pm.com',
  'https://www.coastalkey-pm.com',
  'https://app.traceyhuntergroup.com',
  'https://thg-app.pages.dev',
  'https://command.coastalkey-pm.com',
];

let _currentRequest = null;

export function setRequestContext(request) {
  _currentRequest = request;
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}

export function errorResponse(message, status = 500) {
  return jsonResponse({ error: message, status }, status);
}

export function corsHeaders() {
  const origin = _currentRequest?.headers?.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}
