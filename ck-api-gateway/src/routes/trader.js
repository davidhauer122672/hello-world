/**
 * AI Trader Routes — Stock Market Intelligence & Capital Investment API
 *
 * Endpoints:
 *   GET  /v1/trader/dashboard     — Full market overview + signals + capital calls
 *   GET  /v1/trader/agent         — AI Trader Agent details
 *   GET  /v1/trader/watchlist     — All watchlist categories and symbols
 *   POST /v1/trader/quote         — Get live quote(s) for symbol(s)
 *   POST /v1/trader/signal        — Generate trading signal for symbol
 *   POST /v1/trader/capital-call  — Generate capital call prompt for opportunity
 *   POST /v1/trader/portfolio     — Calculate portfolio metrics from positions
 *   GET  /v1/trader/news          — Market news with sentiment
 *   POST /v1/trader/trade         — Log a trade execution
 *   GET  /v1/trader/history       — Trade execution history
 *   GET  /v1/trader/capital-tiers — Capital investment tier definitions
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import {
  AI_TRADER_AGENT, WATCHLIST, CAPITAL_TIERS, SIGNAL_TYPES,
  fetchMarketData, fetchMarketNews, generateTechnicalSignal,
  generateCapitalCallPrompt, calculatePortfolioMetrics,
  getMarketOverview, logTrade, getTradeHistory,
} from '../engines/ai-trader.js';

export async function handleTraderDashboard(env) {
  const overview = await getMarketOverview(env);
  return jsonResponse(overview);
}

export function handleTraderAgent() {
  return jsonResponse({ agent: AI_TRADER_AGENT });
}

export function handleWatchlist() {
  return jsonResponse({
    watchlist: WATCHLIST,
    totalSymbols: Object.values(WATCHLIST).flat().length,
    categories: Object.keys(WATCHLIST),
  });
}

export async function handleQuote(request, env) {
  const body = await request.json();
  const symbols = Array.isArray(body.symbols) ? body.symbols : [body.symbol];
  if (!symbols.length || !symbols[0]) return errorResponse('symbol or symbols[] required', 400);

  const quotes = await fetchMarketData(symbols, env);
  return jsonResponse({ quotes });
}

export async function handleSignal(request, env) {
  const body = await request.json();
  if (!body.symbol) return errorResponse('symbol required', 400);

  const quotes = await fetchMarketData([body.symbol], env);
  const quote = quotes[body.symbol];
  if (!quote) return errorResponse(`No data for ${body.symbol}`, 404);

  const signal = generateTechnicalSignal(quote);
  return jsonResponse({ symbol: body.symbol, quote, signal });
}

export async function handleCapitalCall(request, env) {
  const body = await request.json();
  if (!body.symbol) return errorResponse('symbol required', 400);

  const quotes = await fetchMarketData([body.symbol], env);
  const quote = quotes[body.symbol];
  if (!quote) return errorResponse(`No data for ${body.symbol}`, 404);

  const signal = generateTechnicalSignal(quote);
  const capitalCall = generateCapitalCallPrompt(body.symbol, quote, signal, body.portfolio);

  if (!capitalCall) {
    return jsonResponse({
      symbol: body.symbol,
      signal: signal.signal,
      message: `No capital call generated. Current signal: ${signal.label} (${signal.confidence}% confidence). Capital calls are only generated for BUY/STRONG_BUY signals.`,
    });
  }

  return jsonResponse(capitalCall);
}

export async function handlePortfolio(request, env) {
  const body = await request.json();
  const positions = body.positions || [];
  if (!positions.length) return errorResponse('positions[] required', 400);

  const symbols = positions.map(p => p.symbol);
  const quotes = await fetchMarketData(symbols, env);
  const metrics = calculatePortfolioMetrics(positions, quotes);

  return jsonResponse(metrics);
}

export async function handleTraderNews(env) {
  const news = await fetchMarketNews(env);
  return jsonResponse({ news, count: news.length });
}

export async function handleLogTrade(request, env) {
  const body = await request.json();
  if (!body.symbol || !body.action || !body.shares || !body.price) {
    return errorResponse('symbol, action (buy/sell), shares, and price required', 400);
  }

  const trade = {
    symbol: body.symbol,
    action: body.action,
    shares: body.shares,
    price: body.price,
    total: Math.round(body.shares * body.price * 100) / 100,
    reason: body.reason || '',
    tier: body.tier || 'tactical',
  };

  await logTrade(env, trade);
  return jsonResponse({ status: 'logged', trade });
}

export async function handleTradeHistory(url, env) {
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const trades = await getTradeHistory(env, limit);
  return jsonResponse({ trades, count: trades.length });
}

export function handleCapitalTiers() {
  return jsonResponse({
    tiers: CAPITAL_TIERS,
    signalTypes: SIGNAL_TYPES,
  });
}
