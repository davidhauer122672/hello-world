/**
 * Market Intelligence & Financial Automation Service
 *
 * Real-time market data analysis, stock market monitoring, and financial
 * automation for Coastal Key Enterprise investment operations.
 *
 * Market Interpretations:
 *  - Real estate market trends (Treasure Coast FL focus)
 *  - Stock market sector analysis (REITs, property tech, hospitality)
 *  - Competitive pricing intelligence
 *  - Economic indicator tracking (interest rates, employment, tourism)
 *  - Portfolio performance analytics
 */

import { inference } from './anthropic.js';
import { createRecord, listRecords, updateRecord, TABLES } from './airtable.js';

// ── Market Data Sources ──

const ALPHA_VANTAGE_API = 'https://www.alphavantage.co/query';
const FRED_API = 'https://api.stlouisfed.org/fred/series/observations';

/**
 * Fetch stock quote data.
 * @param {object} env
 * @param {string} symbol - Stock ticker symbol
 * @returns {Promise<object>}
 */
export async function getStockQuote(env, symbol) {
  const cacheKey = `stock:${symbol}:${new Date().toISOString().split('T')[0]}`;
  if (env.CACHE) {
    const cached = await env.CACHE.get(cacheKey);
    if (cached) return { ...JSON.parse(cached), cached: true };
  }

  const url = `${ALPHA_VANTAGE_API}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${env.ALPHA_VANTAGE_KEY || 'demo'}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`Stock API error (${response.status})`);

  const data = await response.json();
  const quote = data['Global Quote'] || {};

  const result = {
    symbol: quote['01. symbol'] || symbol,
    price: parseFloat(quote['05. price']) || 0,
    change: parseFloat(quote['09. change']) || 0,
    changePercent: quote['10. change percent'] || '0%',
    volume: parseInt(quote['06. volume']) || 0,
    high: parseFloat(quote['03. high']) || 0,
    low: parseFloat(quote['04. low']) || 0,
    previousClose: parseFloat(quote['08. previous close']) || 0,
    timestamp: new Date().toISOString(),
    cached: false,
  };

  if (env.CACHE) {
    await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 300 }); // 5min cache
  }

  return result;
}

/**
 * Get FRED economic indicator data.
 * @param {object} env
 * @param {string} seriesId - FRED series ID
 * @param {number} [limit=10]
 * @returns {Promise<object>}
 */
export async function getEconomicIndicator(env, seriesId, limit = 10) {
  const cacheKey = `fred:${seriesId}`;
  if (env.CACHE) {
    const cached = await env.CACHE.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const url = `${FRED_API}?series_id=${seriesId}&api_key=${env.FRED_API_KEY || 'demo'}&file_type=json&sort_order=desc&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) throw new Error(`FRED API error (${response.status})`);

  const data = await response.json();
  const result = {
    seriesId,
    observations: (data.observations || []).map(obs => ({
      date: obs.date,
      value: parseFloat(obs.value) || 0,
    })),
    timestamp: new Date().toISOString(),
  };

  if (env.CACHE) {
    await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
  }

  return result;
}

// ── Watchlist: Key tickers for Coastal Key investment operations ──

export const WATCHLIST = {
  REITS: ['O', 'AMT', 'PLD', 'EQIX', 'SPG', 'DLR', 'WELL', 'AVB', 'EQR', 'VTR'],
  PROPERTY_TECH: ['RDFN', 'ZG', 'OPEN', 'EXPI', 'COMP'],
  HOSPITALITY: ['MAR', 'HLT', 'H', 'ABNB', 'BKNG'],
  FINANCIALS: ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
  FLORIDA_FOCUS: ['FRT', 'SUI', 'ELS', 'NXRT', 'AIV'],
  ECONOMIC_INDICATORS: {
    MORTGAGE_RATE: 'MORTGAGE30US',
    UNEMPLOYMENT: 'UNRATE',
    CPI: 'CPIAUCSL',
    GDP: 'GDP',
    HOUSING_STARTS: 'HOUST',
    CONSUMER_CONFIDENCE: 'UMCSENT',
  },
};

/**
 * Run full market scan across all watchlist sectors.
 * @param {object} env
 * @returns {Promise<object>}
 */
export async function fullMarketScan(env) {
  const results = { sectors: {}, indicators: {}, timestamp: new Date().toISOString() };

  // Scan each sector
  for (const [sector, symbols] of Object.entries(WATCHLIST)) {
    if (sector === 'ECONOMIC_INDICATORS') continue;

    results.sectors[sector] = {
      quotes: [],
      sectorAvgChange: 0,
      topMover: null,
      bottomMover: null,
    };

    const quotes = await Promise.all(
      symbols.map(async (sym) => {
        try {
          return await getStockQuote(env, sym);
        } catch {
          return { symbol: sym, error: true, price: 0, change: 0 };
        }
      })
    );

    results.sectors[sector].quotes = quotes;

    const validQuotes = quotes.filter(q => !q.error);
    if (validQuotes.length > 0) {
      results.sectors[sector].sectorAvgChange =
        validQuotes.reduce((sum, q) => sum + q.change, 0) / validQuotes.length;
      results.sectors[sector].topMover =
        validQuotes.reduce((best, q) => q.change > best.change ? q : best);
      results.sectors[sector].bottomMover =
        validQuotes.reduce((worst, q) => q.change < worst.change ? q : worst);
    }
  }

  // Scan economic indicators
  for (const [name, seriesId] of Object.entries(WATCHLIST.ECONOMIC_INDICATORS)) {
    try {
      results.indicators[name] = await getEconomicIndicator(env, seriesId, 3);
    } catch {
      results.indicators[name] = { error: true, seriesId };
    }
  }

  return results;
}

/**
 * Generate AI-powered market analysis report.
 * @param {object} env
 * @param {object} scanResults - Output from fullMarketScan
 * @returns {Promise<object>}
 */
export async function generateMarketReport(env, scanResults) {
  const sectorSummaries = Object.entries(scanResults.sectors).map(([sector, data]) => {
    const topSymbol = data.topMover?.symbol || 'N/A';
    const bottomSymbol = data.bottomMover?.symbol || 'N/A';
    return `${sector}: Avg Change ${data.sectorAvgChange?.toFixed(2) || 0}% | Top: ${topSymbol} | Bottom: ${bottomSymbol}`;
  }).join('\n');

  const indicatorSummaries = Object.entries(scanResults.indicators)
    .filter(([, data]) => !data.error)
    .map(([name, data]) => {
      const latest = data.observations?.[0];
      return `${name}: ${latest?.value || 'N/A'} (${latest?.date || 'N/A'})`;
    }).join('\n');

  const aiResult = await inference(env, {
    system: `You are the Coastal Key Market Intelligence AI. You analyze financial markets with a focus on real estate, REITs, property management, and the Florida Treasure Coast economy. Provide actionable insights for investment decisions and business strategy. Be data-driven, precise, and forward-looking.`,
    prompt: `Generate a comprehensive market intelligence briefing based on this live data:

SECTOR PERFORMANCE:
${sectorSummaries}

ECONOMIC INDICATORS:
${indicatorSummaries}

Include:
1. Executive Summary (3 bullet points)
2. REIT & Real Estate Sector Analysis
3. Treasure Coast Impact Assessment
4. Risk Factors & Opportunities
5. Recommended Actions for Coastal Key
6. 30/60/90 Day Outlook`,
    tier: 'advanced',
    maxTokens: 4000,
    cacheKey: `market-report:${new Date().toISOString().split('T')[0]}`,
    cacheTtl: 3600,
  });

  return {
    report: aiResult.content,
    model: aiResult.model,
    scanTimestamp: scanResults.timestamp,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Log market data to Airtable MARKET_DATA table.
 * @param {object} env
 * @param {object} marketData
 * @returns {Promise<object>}
 */
export async function logMarketData(env, marketData) {
  return createRecord(env, TABLES.MARKET_DATA, {
    'Report Date': new Date().toISOString().split('T')[0],
    'Report Type': 'Daily Market Scan',
    'Summary': marketData.report?.slice(0, 10000) || JSON.stringify(marketData).slice(0, 10000),
    'Status': { name: 'Active' },
  });
}

/**
 * Monitor portfolio positions and generate alerts.
 * @param {object} env
 * @param {object} params
 * @param {object[]} params.positions - Array of { symbol, shares, costBasis }
 * @param {number} [params.alertThreshold=5] - Percent change threshold for alerts
 * @returns {Promise<object>}
 */
export async function monitorPortfolio(env, { positions, alertThreshold = 5 }) {
  const results = [];
  const alerts = [];

  for (const pos of positions) {
    try {
      const quote = await getStockQuote(env, pos.symbol);
      const currentValue = quote.price * pos.shares;
      const costValue = pos.costBasis * pos.shares;
      const pnl = currentValue - costValue;
      const pnlPercent = costValue > 0 ? (pnl / costValue * 100) : 0;

      const entry = {
        ...pos,
        currentPrice: quote.price,
        currentValue,
        pnl,
        pnlPercent: pnlPercent.toFixed(2),
        dailyChange: quote.changePercent,
      };

      results.push(entry);

      if (Math.abs(parseFloat(quote.changePercent)) >= alertThreshold) {
        alerts.push({
          symbol: pos.symbol,
          type: parseFloat(quote.changePercent) > 0 ? 'SURGE' : 'DROP',
          change: quote.changePercent,
          price: quote.price,
          impact: pnl.toFixed(2),
        });
      }
    } catch (err) {
      results.push({ ...pos, error: err.message });
    }
  }

  const totalValue = results.reduce((sum, r) => sum + (r.currentValue || 0), 0);
  const totalPnl = results.reduce((sum, r) => sum + (r.pnl || 0), 0);

  return {
    positions: results,
    alerts,
    summary: {
      totalValue: totalValue.toFixed(2),
      totalPnl: totalPnl.toFixed(2),
      positionCount: results.length,
      alertCount: alerts.length,
    },
    timestamp: new Date().toISOString(),
  };
}
