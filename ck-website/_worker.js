// Coastal Key Property Management — Edge Worker
// Serves static site with MCP endpoint, API routes, and clean URL routing.

const CANONICAL_ORIGIN = 'https://coastalkey-pm.com';
const SERVICES_DATA = [
  {
    id: 'standard_watch',
    name: 'Standard Watch',
    cadence: 'bi-weekly',
    response_window_hours: 24,
    price: { min_cents: 15000, max_cents: 25000, currency: 'USD', interval: 'month' },
    includes: ['interior_inspection', 'exterior_perimeter', 'photo_report', 'owner_portal_access'],
    url: `${CANONICAL_ORIGIN}/services/standard-watch`,
  },
  {
    id: 'premium_concierge',
    name: 'Premium Concierge',
    cadence: 'weekly',
    response_window_hours: 24,
    price: { min_cents: 35000, max_cents: 50000, currency: 'USD', interval: 'month' },
    includes: ['weekly_inspection', 'vendor_coordination', 'key_holding', 'emergency_response_24h'],
    url: `${CANONICAL_ORIGIN}/services/premium-concierge`,
  },
  {
    id: 'full_asset_management',
    name: 'Full Asset Management',
    cadence: 'bespoke',
    response_window_hours: 4,
    price: { min_cents: 50000, max_cents: 100000, currency: 'USD', interval: 'month' },
    includes: ['bespoke_schedule', 'full_vendor_management', 'family_office_liaison', 'monthly_statements', 'annual_review'],
    url: `${CANONICAL_ORIGIN}/services/full-asset-management`,
  },
];

const SERVICE_AREAS = [
  { county: 'Martin County', state: 'FL', cities: ['Stuart', "Sewall's Point", 'Jupiter Island', 'Hobe Sound', 'Palm City'] },
  { county: 'St. Lucie County', state: 'FL', cities: ['Port St. Lucie', 'Fort Pierce', 'Hutchinson Island'] },
  { county: 'Indian River County', state: 'FL', cities: ['Vero Beach', 'Sebastian', 'Indian River Shores'] },
];

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': status === 200 ? 'public, max-age=300' : 'no-store',
    },
  });
}

function handleMCP(request) {
  if (request.method === 'GET') {
    return json({
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2025-11-25',
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'coastal-key-mcp', version: '1.0.0' },
      },
    });
  }
  return json({ error: 'MCP endpoint ready. Use Streamable HTTP to connect.' }, 200);
}

function handleAPI(pathname) {
  if (pathname === '/api/v1/services') {
    return json({ data: SERVICES_DATA });
  }

  if (pathname === '/api/v1/health') {
    return json({
      ok: true,
      version: '1.0.0',
      last_deploy: new Date().toISOString(),
      environment: 'production',
    });
  }

  if (pathname === '/api/v1/service-area') {
    return json({ data: SERVICE_AREAS });
  }

  return json({ error: 'Not found', endpoint: pathname }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (pathname === '/mcp') return handleMCP(request);

    if (pathname.startsWith('/api/v1/')) return handleAPI(pathname);

    if (pathname === '/portal') {
      return Response.redirect('https://portal.coastalkey-pm.com/', 302);
    }

    // Serve static assets with clean URL routing
    let response = await env.ASSETS.fetch(request);

    // Clean URL: /services -> /services/index.html
    if (response.status === 404 && !pathname.includes('.') && pathname !== '/') {
      const cleanPath = pathname.replace(/\/$/, '') + '/index.html';
      const cleanUrl = new URL(request.url);
      cleanUrl.pathname = cleanPath;
      response = await env.ASSETS.fetch(new Request(cleanUrl.toString(), request));
    }

    return response;
  },
};
