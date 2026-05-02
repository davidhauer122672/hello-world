/**
 * Phase 5 Route Dispatcher
 *
 * Single entry point for franchise system, API marketplace, and Retell tuning routes.
 * Returns a Response if the path matches, or null if it should fall through to the
 * main router.
 *
 * Usage in ck-api-gateway/src/index.js:
 *
 *   import { dispatchPhase5 } from './routes/phase5-router.js';
 *
 *   // inside fetch handler, after auth + rate-limit, before the existing route table:
 *   const phase5 = await dispatchPhase5(path, method, request, env, ctx, url);
 *   if (phase5) return phase5;
 */

import { handleRetellTune, handleRetellPerformance } from './retell-tuning.js';
import { handleFranchiseConfig, handleFranchiseProvision, handleFranchiseTerritories } from './franchise.js';
import { handleMarketplaceCatalog, handleMarketplaceUsage, handleMarketplaceUsageStats } from './marketplace.js';

/**
 * Dispatch Phase 5 routes.
 *
 * @param {string} path - URL pathname
 * @param {string} method - HTTP method
 * @param {Request} request
 * @param {object} env - Cloudflare Worker env bindings
 * @param {object} ctx - Execution context
 * @param {URL} url - Parsed URL
 * @returns {Promise<Response|null>} - Response if matched, null otherwise
 */
export async function dispatchPhase5(path, method, request, env, ctx, url) {
  // ── Retell Tuning ──
  if (path === '/v1/retell/tune' && method === 'POST') {
    return await handleRetellTune(request, env, ctx);
  }
  if (path === '/v1/retell/performance' && method === 'GET') {
    return await handleRetellPerformance(request, env, ctx);
  }

  // ── Franchise System ──
  if (path === '/v1/franchise/config' && method === 'GET') {
    return handleFranchiseConfig(request, env, ctx);
  }
  if (path === '/v1/franchise/provision' && method === 'POST') {
    return await handleFranchiseProvision(request, env, ctx);
  }
  if (path === '/v1/franchise/territories' && method === 'GET') {
    return handleFranchiseTerritories(request, env, ctx);
  }

  // ── API Marketplace ──
  if (path === '/v1/marketplace/catalog' && method === 'GET') {
    return handleMarketplaceCatalog(url, env, ctx);
  }
  if (path === '/v1/marketplace/usage' && method === 'POST') {
    return await handleMarketplaceUsage(request, env, ctx);
  }
  if (path.startsWith('/v1/marketplace/usage/') && method === 'GET') {
    const apiKey = path.split('/v1/marketplace/usage/')[1];
    return await handleMarketplaceUsageStats(apiKey, env, ctx);
  }

  return null;
}
