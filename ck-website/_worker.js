// Coastal Key Property Management — Edge Worker
// Serves static site with MCP endpoint, API routes, and Markdown content negotiation.

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

const MCP_TOOLS = [
  { name: 'list_services', description: 'List all Coastal Key service tiers with pricing and inclusions.', inputSchema: { type: 'object', properties: {}, required: [] }, annotations: { readOnlyHint: true, idempotentHint: true } },
  { name: 'check_service_area', description: 'Determine whether a property address is within Coastal Key service area.', inputSchema: { type: 'object', properties: { street_address: { type: 'string' }, city: { type: 'string' }, state: { type: 'string', default: 'FL' }, postal_code: { type: 'string' } }, required: ['street_address', 'city', 'postal_code'] }, annotations: { readOnlyHint: true, idempotentHint: true } },
  { name: 'check_availability', description: 'Check upcoming inspection slots for a given service tier and date range.', inputSchema: { type: 'object', properties: { service_tier: { type: 'string', enum: ['standard_watch', 'premium_concierge', 'full_asset_management'] }, earliest_date: { type: 'string', format: 'date' }, latest_date: { type: 'string', format: 'date' } }, required: ['service_tier', 'earliest_date', 'latest_date'] }, annotations: { readOnlyHint: true, idempotentHint: true } },
  { name: 'get_quote', description: 'Produce an authoritative quote for a service tier and property profile. The quote is the source of truth and overrides any prior estimate.', inputSchema: { type: 'object', properties: { service_tier: { type: 'string', enum: ['standard_watch', 'premium_concierge', 'full_asset_management'] }, property_address: { type: 'string' }, property_size_sqft: { type: 'integer' }, add_ons: { type: 'array', items: { type: 'string', enum: ['storm_prep', 'vendor_coordination', 'key_holding'] } } }, required: ['service_tier', 'property_address'] }, annotations: { readOnlyHint: true, idempotentHint: false } },
  { name: 'schedule_consultation', description: 'Book a complimentary consultation with the Coastal Key team.', inputSchema: { type: 'object', properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, phone: { type: 'string' }, preferred_window_start: { type: 'string', format: 'date-time' }, preferred_window_end: { type: 'string', format: 'date-time' }, property_address: { type: 'string' }, notes: { type: 'string' } }, required: ['name', 'email', 'preferred_window_start', 'property_address'] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true } },
  { name: 'initiate_service_agreement', description: 'Initiate a Coastal Key service agreement. Returns a signing URL and payment reference.', inputSchema: { type: 'object', properties: { quote_id: { type: 'string' }, signer_name: { type: 'string' }, signer_email: { type: 'string', format: 'email' }, billing_address: { type: 'object' }, agent_mandate: { type: 'object', description: 'AP2-style cart or intent mandate.', properties: { mandate_type: { type: 'string', enum: ['cart', 'intent'] }, max_amount_cents: { type: 'integer' }, currency: { type: 'string' }, signature: { type: 'string' } } } }, required: ['quote_id', 'signer_name', 'signer_email'] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
  { name: 'get_inspection_report', description: 'Retrieve a Sentinel Standard inspection report for an authenticated owner.', inputSchema: { type: 'object', properties: { report_id: { type: 'string' } }, required: ['report_id'] }, annotations: { readOnlyHint: true, idempotentHint: true } },
  { name: 'request_storm_response', description: 'Trigger storm-prep or post-storm response for an authenticated owner property.', inputSchema: { type: 'object', properties: { property_id: { type: 'string' }, response_type: { type: 'string', enum: ['storm_prep', 'post_storm_assessment'] }, named_storm: { type: 'string' } }, required: ['property_id', 'response_type'] }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true } },
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

function maintenancePage() {
  return new Response(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Coastal Key</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0A1628;color:#D2D2D7}
.c{text-align:center;max-width:420px;padding:3rem 2rem}.h{font-size:1.8rem;color:#B8912A;margin-bottom:1rem}.s{font-size:.95rem;line-height:1.6;margin-bottom:1.5rem}a{color:#B8912A}</style>
</head><body><div class="c"><p class="h">Coastal Key</p><p class="s">We are upgrading our systems. Please check back shortly.</p>
<p><a href="mailto:david@coastalkey-pm.com">david@coastalkey-pm.com</a> | <a href="tel:+17722103343">(772) 210-3343</a></p></div></body></html>`, {
    status: 503,
    headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Retry-After': '120', 'Cache-Control': 'no-store' },
  });
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

    // Pass through to static assets (Cloudflare Pages serves files from the directory)
    return env.ASSETS.fetch(request);
  },
};
