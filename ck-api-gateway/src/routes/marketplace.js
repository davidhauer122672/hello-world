/**
 * API Marketplace with Usage Metering — Phase 5
 *
 *   GET  /v1/marketplace/catalog        — List available API products
 *   POST /v1/marketplace/usage          — Record an API usage event
 *   GET  /v1/marketplace/usage/:apiKey  — Get usage stats for an API key
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

const BILLING_PERIOD_TTL = 30 * 24 * 60 * 60;

const API_PRODUCTS = [
  {
    id: 'lead_enrichment', name: 'Lead Enrichment API',
    description: 'AI-powered lead enrichment with battle plan generation, segment analysis, and investor profiling. Uses Coastal Key\'s SCAA-1 Sentinel engine.',
    tier: 'pro', rateLimit: { requestsPerMinute: 30, requestsPerDay: 1000 }, pricePerCall: 0.15,
    endpoints: [
      { method: 'POST', path: '/v1/leads/enrich', description: 'Enrich a lead with AI-generated battle plan or analysis' },
      { method: 'POST', path: '/v1/workflows/scaa1', description: 'Run the full SCAA-1 Battle Plan Pipeline' },
      { method: 'POST', path: '/v1/workflows/wf3', description: 'Trigger WF-3 Investor Escalation workflow' },
      { method: 'POST', path: '/v1/workflows/wf4', description: 'Trigger WF-4 Long-Tail Nurture enrollment' },
    ],
  },
  {
    id: 'battle_plan', name: 'Battle Plan Generator',
    description: 'Standalone access to the SCAA-1 Battle Plan engine. Generates personalized outbound sales battle plans.',
    tier: 'pro', rateLimit: { requestsPerMinute: 20, requestsPerDay: 500 }, pricePerCall: 0.25,
    endpoints: [{ method: 'POST', path: '/v1/workflows/scaa1', description: 'Generate a full SCAA-1 Battle Plan for a lead' }],
  },
  {
    id: 'pricing_engine', name: 'Dynamic Pricing Engine',
    description: 'AI-driven pricing recommendations for property management fees across Florida zones.',
    tier: 'pro', rateLimit: { requestsPerMinute: 60, requestsPerDay: 5000 }, pricePerCall: 0.08,
    endpoints: [
      { method: 'POST', path: '/v1/pricing/recommend', description: 'Generate dynamic pricing recommendation' },
      { method: 'GET', path: '/v1/pricing/zones', description: 'Get zone-level pricing benchmarks' },
    ],
  },
  {
    id: 'content_generation', name: 'Content Generation API',
    description: 'Generate property management marketing content including social media posts, email sequences, and video scripts.',
    tier: 'enterprise', rateLimit: { requestsPerMinute: 15, requestsPerDay: 300 }, pricePerCall: 0.35,
    endpoints: [{ method: 'POST', path: '/v1/content/generate', description: 'Generate social posts, emails, video scripts' }],
  },
  {
    id: 'call_analytics', name: 'Call Analytics API',
    description: 'Retell-powered voice agent analytics and call management.',
    tier: 'enterprise', rateLimit: { requestsPerMinute: 30, requestsPerDay: 2000 }, pricePerCall: 0.12,
    endpoints: [
      { method: 'POST', path: '/v1/retell/webhook', description: 'Receive Retell call event webhooks' },
      { method: 'GET', path: '/v1/agents', description: 'List voice agents and their statuses' },
    ],
  },
  {
    id: 'franchise_api', name: 'Franchise Management API',
    description: 'White-label franchise configuration and territory management.',
    tier: 'enterprise', rateLimit: { requestsPerMinute: 10, requestsPerDay: 100 }, pricePerCall: 0.50,
    endpoints: [
      { method: 'GET', path: '/v1/franchise/config', description: 'Get franchise configuration template' },
      { method: 'POST', path: '/v1/franchise/provision', description: 'Provision a new franchise territory' },
      { method: 'GET', path: '/v1/franchise/territories', description: 'List all franchise territories' },
    ],
  },
];

export function handleMarketplaceCatalog(url, env, ctx) {
  const tierFilter = url.searchParams.get('tier');
  const validTiers = ['free', 'pro', 'enterprise'];
  if (tierFilter && !validTiers.includes(tierFilter)) {
    return errorResponse(`Invalid tier filter "${tierFilter}".`, 400);
  }
  let products = [...API_PRODUCTS];
  if (tierFilter) products = products.filter(p => p.tier === tierFilter);
  writeAudit(env, ctx, { route: '/v1/marketplace/catalog', action: 'catalog_viewed', tierFilter: tierFilter || 'all' });
  return jsonResponse({
    products, count: products.length, tiers: validTiers,
    billing: { periodDays: 30, currency: 'USD', invoiceSchedule: 'monthly', paymentTerms: 'Net 15' },
  });
}

export async function handleMarketplaceUsage(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }
  const { apiKey, product, endpoint, responseTime, status } = body;
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) return errorResponse('"apiKey" required (min 8 chars).', 400);
  if (!product || typeof product !== 'string') return errorResponse('"product" is required.', 400);
  const productDef = API_PRODUCTS.find(p => p.id === product);
  if (!productDef) return errorResponse(`Unknown product "${product}".`, 400);
  if (!endpoint || typeof endpoint !== 'string') return errorResponse('"endpoint" is required.', 400);
  if (typeof responseTime !== 'number' || responseTime < 0) return errorResponse('"responseTime" must be non-negative.', 400);
  if (typeof status !== 'number' || status < 100 || status > 599) return errorResponse('"status" must be 100-599.', 400);
  if (!env.AUDIT_LOG) return errorResponse('Usage metering unavailable. KV not configured.', 503);

  const now = Date.now();
  const timestamp = new Date(now).toISOString();
  const sanitizedKey = apiKey.trim();
  const eventKey = `usage:${sanitizedKey}:${product}:${now}:${Math.random().toString(36).slice(2, 8)}`;
  const event = {
    apiKey: sanitizedKey, product, endpoint, responseTime, status, timestamp,
    billed: status >= 200 && status < 500,
    cost: status >= 200 && status < 500 ? productDef.pricePerCall : 0,
  };
  ctx.waitUntil(env.AUDIT_LOG.put(eventKey, JSON.stringify(event), { expirationTtl: BILLING_PERIOD_TTL }));

  const counterKey = `usage_counter:${sanitizedKey}:${product}`;
  let counter;
  try {
    const existing = await env.AUDIT_LOG.get(counterKey);
    counter = existing ? JSON.parse(existing) : {
      apiKey: sanitizedKey, product, periodStart: timestamp, totalCalls: 0,
      billedCalls: 0, totalCost: 0, totalResponseTime: 0, errorCount: 0, endpointCounts: {},
    };
  } catch {
    counter = { apiKey: sanitizedKey, product, periodStart: timestamp, totalCalls: 0, billedCalls: 0, totalCost: 0, totalResponseTime: 0, errorCount: 0, endpointCounts: {} };
  }
  counter.totalCalls += 1;
  counter.totalResponseTime += responseTime;
  counter.endpointCounts[endpoint] = (counter.endpointCounts[endpoint] || 0) + 1;
  counter.lastCallAt = timestamp;
  if (event.billed) {
    counter.billedCalls += 1;
    counter.totalCost = Math.round((counter.totalCost + event.cost) * 100) / 100;
  }
  if (status >= 400) counter.errorCount += 1;
  ctx.waitUntil(env.AUDIT_LOG.put(counterKey, JSON.stringify(counter), { expirationTtl: BILLING_PERIOD_TTL }));

  const rateLimitRemaining = {
    perDay: Math.max(0, productDef.rateLimit.requestsPerDay - counter.totalCalls),
    perMinute: productDef.rateLimit.requestsPerMinute,
  };
  writeAudit(env, ctx, { route: '/v1/marketplace/usage', action: 'usage_recorded', apiKey: `${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`, product, endpoint, status, responseTime });
  return jsonResponse({
    recorded: true,
    event: { product, endpoint, status, responseTime, billed: event.billed, cost: event.cost, timestamp },
    periodStats: { totalCalls: counter.totalCalls, billedCalls: counter.billedCalls, totalCost: counter.totalCost, rateLimitRemaining },
  });
}

export async function handleMarketplaceUsageStats(apiKey, env, ctx) {
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 8) return errorResponse('Invalid API key (min 8 chars).', 400);
  if (!env.AUDIT_LOG) return errorResponse('Usage metering unavailable.', 503);
  const sanitizedKey = apiKey.trim();
  const productStats = [];
  let aggregateCalls = 0, aggregateBilled = 0, aggregateCost = 0, aggregateErrors = 0;
  const allEndpointCounts = {};

  for (const product of API_PRODUCTS) {
    const counterKey = `usage_counter:${sanitizedKey}:${product.id}`;
    let counter;
    try {
      const raw = await env.AUDIT_LOG.get(counterKey);
      if (!raw) continue;
      counter = JSON.parse(raw);
    } catch { continue; }
    const avgResponseTime = counter.totalCalls > 0 ? Math.round(counter.totalResponseTime / counter.totalCalls) : 0;
    const rateLimitRemaining = {
      perDay: Math.max(0, product.rateLimit.requestsPerDay - counter.totalCalls),
      perMinute: product.rateLimit.requestsPerMinute,
    };
    const topEndpoints = Object.entries(counter.endpointCounts || {}).sort(([, a], [, b]) => b - a).map(([ep, count]) => ({ endpoint: ep, calls: count }));
    for (const [ep, count] of Object.entries(counter.endpointCounts || {})) {
      allEndpointCounts[ep] = (allEndpointCounts[ep] || 0) + count;
    }
    productStats.push({
      product: product.id, productName: product.name, tier: product.tier,
      totalCalls: counter.totalCalls, billedCalls: counter.billedCalls, totalCost: counter.totalCost,
      errorCount: counter.errorCount, avgResponseTime, rateLimitRemaining, topEndpoints,
      periodStart: counter.periodStart, lastCallAt: counter.lastCallAt || null,
    });
    aggregateCalls += counter.totalCalls;
    aggregateBilled += counter.billedCalls;
    aggregateCost = Math.round((aggregateCost + counter.totalCost) * 100) / 100;
    aggregateErrors += counter.errorCount;
  }
  const topEndpointsGlobal = Object.entries(allEndpointCounts).sort(([, a], [, b]) => b - a).slice(0, 10).map(([ep, count]) => ({ endpoint: ep, calls: count }));
  writeAudit(env, ctx, { route: '/v1/marketplace/usage/:apiKey', action: 'usage_stats_viewed', apiKey: `${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`, productsWithUsage: productStats.length });
  return jsonResponse({
    apiKey: `${sanitizedKey.slice(0, 4)}...${sanitizedKey.slice(-4)}`,
    billingPeriod: { durationDays: 30, currency: 'USD' },
    aggregate: { totalCalls: aggregateCalls, billedCalls: aggregateBilled, totalCost: aggregateCost, errorCount: aggregateErrors, productsUsed: productStats.length },
    topEndpoints: topEndpointsGlobal,
    products: productStats,
  });
}
