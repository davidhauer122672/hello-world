/**
 * API Marketplace with Usage Metering — Phase 5
 *
 *   GET  /v1/marketplace/catalog        — List available API products
 *   POST /v1/marketplace/usage          — Record an API usage event
 *   GET  /v1/marketplace/usage/:apiKey  — Get usage stats for an API key
 *
 * Exposes Coastal Key's internal capabilities as metered API products
 * that franchise operators and third-party integrators can consume.
 * Usage events are written to KV (AUDIT_LOG) with TTL-based retention
 * for billing period aggregation.
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

// ── Billing period configuration ────────────────────────────────────────────

/** Billing period duration in seconds (30 days). */
const BILLING_PERIOD_TTL = 30 * 24 * 60 * 60;

/** Maximum usage events stored per API key before rotation. */
const MAX_EVENTS_PER_KEY = 10000;

// ── API product catalog ─────────────────────────────────────────────────────

const API_PRODUCTS = [
  {
    id: 'lead_enrichment',
    name: 'Lead Enrichment API',
    description:
      'AI-powered lead enrichment with battle plan generation, segment analysis, ' +
      'and investor profiling. Uses Coastal Key\'s SCAA-1 Sentinel engine to produce ' +
      'hyper-personalized outreach strategies for property management leads.',
    tier: 'pro',
    rateLimit: { requestsPerMinute: 30, requestsPerDay: 1000 },
    pricePerCall: 0.15,
    endpoints: [
      { method: 'POST', path: '/v1/leads/enrich', description: 'Enrich a lead with AI-generated battle plan or analysis' },
      { method: 'POST', path: '/v1/workflows/scaa1', description: 'Run the full SCAA-1 Battle Plan Pipeline' },
      { method: 'POST', path: '/v1/workflows/wf3', description: 'Trigger WF-3 Investor Escalation workflow' },
      { method: 'POST', path: '/v1/workflows/wf4', description: 'Trigger WF-4 Long-Tail Nurture enrollment' },
    ],
  },
  {
    id: 'battle_plan',
    name: 'Battle Plan Generator',
    description:
      'Standalone access to the SCAA-1 Battle Plan engine. Generates personalized ' +
      'outbound sales battle plans with opening hooks, value propositions, objection ' +
      'handling, and follow-up email drafts tailored to Florida property management.',
    tier: 'pro',
    rateLimit: { requestsPerMinute: 20, requestsPerDay: 500 },
    pricePerCall: 0.25,
    endpoints: [
      { method: 'POST', path: '/v1/workflows/scaa1', description: 'Generate a full SCAA-1 Battle Plan for a lead' },
    ],
  },
  {
    id: 'pricing_engine',
    name: 'Dynamic Pricing Engine',
    description:
      'AI-driven pricing recommendations for property management fees. Analyzes ' +
      'property attributes, zone benchmarks, rental type premiums, and competitive ' +
      'positioning to recommend optimal management fee structures across Florida zones.',
    tier: 'pro',
    rateLimit: { requestsPerMinute: 60, requestsPerDay: 5000 },
    pricePerCall: 0.08,
    endpoints: [
      { method: 'POST', path: '/v1/pricing/recommend', description: 'Generate dynamic pricing recommendation for a property' },
      { method: 'GET', path: '/v1/pricing/zones', description: 'Get zone-level pricing benchmarks' },
    ],
  },
  {
    id: 'content_generation',
    name: 'Content Generation API',
    description:
      'Generate property management marketing content including social media posts, ' +
      'email sequences, video scripts, and podcast outlines. All content is optimized ' +
      'for the luxury property management market with platform-specific formatting.',
    tier: 'enterprise',
    rateLimit: { requestsPerMinute: 15, requestsPerDay: 300 },
    pricePerCall: 0.35,
    endpoints: [
      { method: 'POST', path: '/v1/content/generate', description: 'Generate social posts, emails, video scripts, or podcast outlines' },
    ],
  },
  {
    id: 'call_analytics',
    name: 'Call Analytics API',
    description:
      'Retell-powered voice agent analytics and call management. Access call ' +
      'transcripts, disposition summaries, sentiment analysis, and performance ' +
      'metrics for AI-driven phone outreach campaigns.',
    tier: 'enterprise',
    rateLimit: { requestsPerMinute: 30, requestsPerDay: 2000 },
    pricePerCall: 0.12,
    endpoints: [
      { method: 'POST', path: '/v1/retell/webhook', description: 'Receive Retell call event webhooks' },
      { method: 'GET', path: '/v1/agents', description: 'List voice agents and their statuses' },
      { method: 'GET', path: '/v1/agents/:id', description: 'Get a specific voice agent configuration' },
    ],
  },
  {
    id: 'franchise_api',
    name: 'Franchise Management API',
    description:
      'White-label franchise configuration and territory management. Provision ' +
      'new franchise territories, manage brand settings, and monitor franchise ' +
      'operations across Florida markets.',
    tier: 'enterprise',
    rateLimit: { requestsPerMinute: 10, requestsPerDay: 100 },
    pricePerCall: 0.50,
    endpoints: [
      { method: 'GET', path: '/v1/franchise/config', description: 'Get franchise configuration template' },
      { method: 'POST', path: '/v1/franchise/provision', description: 'Provision a new franchise territory' },
      { method: 'GET', path: '/v1/franchise/territories', description: 'List all franchise territories' },
    ],
  },
];

// ── GET /v1/marketplace/catalog ─────────────────────────────────────────────

/**
 * List all available API products in the marketplace.
 *
 * Returns the full catalog of metered API products with descriptions,
 * tier requirements, rate limits, pricing, and available endpoints.
 * Supports optional filtering by tier via query parameter.
 *
 * @param {URL} url — Parsed request URL (for query params)
 * @param {object} env — Cloudflare Worker environment bindings
 * @param {object} ctx — Execution context (waitUntil)
 * @returns {Response} JSON response with product catalog
 */
export function handleMarketplaceCatalog(url, env, ctx) {
  const tierFilter = url.searchParams.get('tier');
  const validTiers = ['free', 'pro', 'enterprise'];

  if (tierFilter && !validTiers.includes(tierFilter)) {
    return errorResponse(
      `Invalid tier filter "${tierFilter}". Valid tiers: ${validTiers.join(', ')}.`,
      400,
    );
  }

  let products = [...API_PRODUCTS];

  if (tierFilter) {
    products = products.filter(p => p.tier === tierFilter);
  }

  writeAudit(env, ctx, {
    route: '/v1/marketplace/catalog',
    action: 'catalog_viewed',
    tierFilter: tierFilter || 'all',
  });

  return jsonResponse({
    products,
    count: products.length,
    tiers: validTiers,
    billing: {
      periodDays: 30,
      currency: 'USD',
      invoiceSchedule: 'monthly',
      paymentTerms: 'Net 15',
    },
  });
}

// ── POST /v1/marketplace/usage ──────────────────────────────────────────────

/**
 * Record an API usage event for metering and billing.
 *
 * Writes the usage event to KV (AUDIT_LOG) with a TTL matching the
 * billing period. Increments the running usage counter for the API key
 * and returns current period statistics.
 *
 * Body:
 *   apiKey       (string, required) — The API key that made the call
 *   product      (string, required) — Product ID from the catalog
 *   endpoint     (string, required) — The endpoint path that was called
 *   responseTime (number, required) — Response time in milliseconds
 *   status       (number, required) — HTTP status code of the response
 *
 * @param {Request} request
 * @param {object} env — Cloudflare Worker environment bindings
 * @param {object} ctx — Execution context (waitUntil)
 * @returns {Response} JSON response with usage confirmation and period stats
 */
export async function handleMarketplaceUsage(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  // ── Validate required fields ──

  const { apiKey, product, endpoint, responseTime, status } = body;

  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
    return errorResponse('"apiKey" is required and must be at least 8 characters.', 400);
  }

  if (!product || typeof product !== 'string') {
    return errorResponse('"product" is required.', 400);
  }

  const productDef = API_PRODUCTS.find(p => p.id === product);
  if (!productDef) {
    const validProducts = API_PRODUCTS.map(p => p.id);
    return errorResponse(
      `Unknown product "${product}". Valid products: ${validProducts.join(', ')}.`,
      400,
    );
  }

  if (!endpoint || typeof endpoint !== 'string') {
    return errorResponse('"endpoint" is required.', 400);
  }

  if (typeof responseTime !== 'number' || responseTime < 0) {
    return errorResponse('"responseTime" must be a non-negative number (milliseconds).', 400);
  }

  if (typeof status !== 'number' || status < 100 || status > 599) {
    return errorResponse('"status" must be a valid HTTP status code (100-599).', 400);
  }

  // ── Check AUDIT_LOG KV availability ──

  if (!env.AUDIT_LOG) {
    return errorResponse('Usage metering is unavailable. KV namespace not configured.', 503);
  }

  const now = Date.now();
  const timestamp = new Date(now).toISOString();
  const sanitizedKey = apiKey.trim();

  // ── Write usage event to KV ──

  const eventKey = `usage:${sanitizedKey}:${product}:${now}:${Math.random().toString(36).slice(2, 8)}`;
  const event = {
    apiKey: sanitizedKey,
    product,
    endpoint,
    responseTime,
    status,
    timestamp,
    billed: status >= 200 && status < 500,
    cost: status >= 200 && status < 500 ? productDef.pricePerCall : 0,
  };

  ctx.waitUntil(
    env.AUDIT_LOG.put(eventKey, JSON.stringify(event), {
      expirationTtl: BILLING_PERIOD_TTL,
    })
  );

  // ── Update running counter for this API key + product ──

  const counterKey = `usage_counter:${sanitizedKey}:${product}`;
  let counter;
  try {
    const existing = await env.AUDIT_LOG.get(counterKey);
    counter = existing ? JSON.parse(existing) : {
      apiKey: sanitizedKey,
      product,
      periodStart: timestamp,
      totalCalls: 0,
      billedCalls: 0,
      totalCost: 0,
      totalResponseTime: 0,
      errorCount: 0,
      endpointCounts: {},
    };
  } catch {
    counter = {
      apiKey: sanitizedKey,
      product,
      periodStart: timestamp,
      totalCalls: 0,
      billedCalls: 0,
      totalCost: 0,
      totalResponseTime: 0,
      errorCount: 0,
      endpointCounts: {},
    };
  }

  counter.totalCalls += 1;
  counter.totalResponseTime += responseTime;
  counter.endpointCounts[endpoint] = (counter.endpointCounts[endpoint] || 0) + 1;
  counter.lastCallAt = timestamp;

  if (event.billed) {
    counter.billedCalls += 1;
    counter.totalCost = Math.round((counter.totalCost + event.cost) * 100) / 100;
  }

  if (status >= 400) {
    counter.errorCount += 1;
  }

  ctx.waitUntil(
    env.AUDIT_LOG.put(counterKey, JSON.stringify(counter), {
      expirationTtl: BILLING_PERIOD_TTL,
    })
  );

  // ── Compute rate limit status ──

  const rateLimitRemaining = {
    perDay: Math.max(0, productDef.rateLimit.requestsPerDay - counter.totalCalls),
    perMinute: productDef.rateLimit.requestsPerMinute, // approximate — no sliding window in KV
  };

  writeAudit(env, ctx, {
    route: '/v1/marketplace/usage',
    action: 'usage_recorded',
    apiKey: `${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`,
    product,
    endpoint,
    status,
    responseTime,
  });

  return jsonResponse({
    recorded: true,
    event: {
      product,
      endpoint,
      status,
      responseTime,
      billed: event.billed,
      cost: event.cost,
      timestamp,
    },
    periodStats: {
      totalCalls: counter.totalCalls,
      billedCalls: counter.billedCalls,
      totalCost: counter.totalCost,
      rateLimitRemaining,
    },
  });
}

// ── GET /v1/marketplace/usage/:apiKey ───────────────────────────────────────

/**
 * Get usage statistics for a specific API key.
 *
 * Aggregates usage counters across all products for the given API key,
 * returning per-product breakdowns with call counts, cost estimates,
 * rate limit status, and top endpoints.
 *
 * @param {string} apiKey — The API key to look up
 * @param {object} env — Cloudflare Worker environment bindings
 * @param {object} ctx — Execution context (waitUntil)
 * @returns {Response} JSON response with usage statistics
 */
export async function handleMarketplaceUsageStats(apiKey, env, ctx) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) {
    return errorResponse('Invalid API key. Must be at least 8 characters.', 400);
  }

  if (!env.AUDIT_LOG) {
    return errorResponse('Usage metering is unavailable. KV namespace not configured.', 503);
  }

  const sanitizedKey = apiKey.trim();

  // ── Fetch usage counters for all products ──

  const productStats = [];
  let aggregateCalls = 0;
  let aggregateBilled = 0;
  let aggregateCost = 0;
  let aggregateErrors = 0;
  const allEndpointCounts = {};

  for (const product of API_PRODUCTS) {
    const counterKey = `usage_counter:${sanitizedKey}:${product.id}`;
    let counter;

    try {
      const raw = await env.AUDIT_LOG.get(counterKey);
      if (!raw) continue;
      counter = JSON.parse(raw);
    } catch {
      continue;
    }

    const avgResponseTime = counter.totalCalls > 0
      ? Math.round(counter.totalResponseTime / counter.totalCalls)
      : 0;

    const rateLimitRemaining = {
      perDay: Math.max(0, product.rateLimit.requestsPerDay - counter.totalCalls),
      perMinute: product.rateLimit.requestsPerMinute,
    };

    // Sort endpoints by call count descending
    const topEndpoints = Object.entries(counter.endpointCounts || {})
      .sort(([, a], [, b]) => b - a)
      .map(([ep, count]) => ({ endpoint: ep, calls: count }));

    // Merge into global endpoint counts
    for (const [ep, count] of Object.entries(counter.endpointCounts || {})) {
      allEndpointCounts[ep] = (allEndpointCounts[ep] || 0) + count;
    }

    productStats.push({
      product: product.id,
      productName: product.name,
      tier: product.tier,
      totalCalls: counter.totalCalls,
      billedCalls: counter.billedCalls,
      totalCost: counter.totalCost,
      errorCount: counter.errorCount,
      avgResponseTime,
      rateLimitRemaining,
      topEndpoints,
      periodStart: counter.periodStart,
      lastCallAt: counter.lastCallAt || null,
    });

    aggregateCalls += counter.totalCalls;
    aggregateBilled += counter.billedCalls;
    aggregateCost = Math.round((aggregateCost + counter.totalCost) * 100) / 100;
    aggregateErrors += counter.errorCount;
  }

  // ── Build top endpoints across all products ──

  const topEndpointsGlobal = Object.entries(allEndpointCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([ep, count]) => ({ endpoint: ep, calls: count }));

  writeAudit(env, ctx, {
    route: '/v1/marketplace/usage/:apiKey',
    action: 'usage_stats_viewed',
    apiKey: `${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`,
    productsWithUsage: productStats.length,
  });

  return jsonResponse({
    apiKey: `${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`,
    billingPeriod: {
      durationDays: 30,
      currency: 'USD',
    },
    aggregate: {
      totalCalls: aggregateCalls,
      billedCalls: aggregateBilled,
      totalCost: aggregateCost,
      errorCount: aggregateErrors,
      productsUsed: productStats.length,
    },
    topEndpoints: topEndpointsGlobal,
    products: productStats,
  });
}
