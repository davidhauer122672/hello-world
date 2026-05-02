/**
 * Market Intelligence Routes
 *
 *   GET  /v1/market/quote/:symbol  — Get stock quote
 *   GET  /v1/market/scan           — Full market scan (all sectors)
 *   GET  /v1/market/report         — AI-generated market intelligence report
 *   POST /v1/market/portfolio      — Monitor portfolio positions
 *   GET  /v1/market/indicators     — Economic indicators dashboard
 *   GET  /v1/market/watchlist      — Current watchlist configuration
 */

import { getStockQuote, getEconomicIndicator, fullMarketScan, generateMarketReport, logMarketData, monitorPortfolio, WATCHLIST } from '../services/market-intel.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

/**
 * GET /v1/market/quote/:symbol — Get real-time stock quote.
 */
export async function handleMarketQuote(symbol, env) {
  if (!symbol || symbol.length > 10) return errorResponse('Valid stock symbol required.', 400);

  const quote = await getStockQuote(env, symbol.toUpperCase());
  return jsonResponse(quote);
}

/**
 * GET /v1/market/scan — Run full market scan across all watchlist sectors.
 */
export async function handleMarketScan(env, ctx) {
  const results = await fullMarketScan(env);

  writeAudit(env, ctx, {
    route: '/v1/market/scan',
    action: 'full_market_scan',
    sectorCount: Object.keys(results.sectors).length,
  });

  return jsonResponse(results);
}

/**
 * GET /v1/market/report — Generate AI-powered market intelligence report.
 */
export async function handleMarketReport(env, ctx) {
  const scanResults = await fullMarketScan(env);
  const report = await generateMarketReport(env, scanResults);

  // Log to Airtable
  ctx.waitUntil(
    logMarketData(env, report).catch(err => console.error('Market data log failed:', err))
  );

  writeAudit(env, ctx, {
    route: '/v1/market/report',
    action: 'market_report',
    model: report.model,
  });

  return jsonResponse(report);
}

/**
 * POST /v1/market/portfolio — Monitor portfolio positions and generate alerts.
 */
export async function handleMarketPortfolio(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON body.', 400); }

  if (!Array.isArray(body.positions) || body.positions.length === 0) {
    return errorResponse('"positions" array is required.', 400);
  }

  const result = await monitorPortfolio(env, {
    positions: body.positions,
    alertThreshold: body.alertThreshold || 5,
  });

  writeAudit(env, ctx, {
    route: '/v1/market/portfolio',
    action: 'portfolio_monitor',
    positionCount: result.summary.positionCount,
    alertCount: result.summary.alertCount,
  });

  return jsonResponse(result);
}

/**
 * GET /v1/market/indicators — Economic indicators dashboard.
 */
export async function handleMarketIndicators(env) {
  const indicators = {};

  for (const [name, seriesId] of Object.entries(WATCHLIST.ECONOMIC_INDICATORS)) {
    try {
      indicators[name] = await getEconomicIndicator(env, seriesId, 5);
    } catch (err) {
      indicators[name] = { error: err.message, seriesId };
    }
  }

  return jsonResponse({
    indicators,
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /v1/market/watchlist — Current watchlist configuration.
 */
export function handleMarketWatchlist() {
  return jsonResponse({
    watchlist: WATCHLIST,
    sectorCount: Object.keys(WATCHLIST).length - 1, // Exclude ECONOMIC_INDICATORS
    totalSymbols: Object.values(WATCHLIST)
      .filter(v => Array.isArray(v))
      .reduce((sum, arr) => sum + arr.length, 0),
    indicatorCount: Object.keys(WATCHLIST.ECONOMIC_INDICATORS).length,
  });
}
