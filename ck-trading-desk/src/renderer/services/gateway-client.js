/**
 * CK Trading Desk — Gateway Client
 * Connects to the Coastal Key API Gateway (ck-api-gateway.david-e59.workers.dev)
 * Integrates with the existing 382-agent fleet, Airtable, and all CK systems.
 * This client never sleeps — always connected, always generating.
 */

const GATEWAY_URL = 'https://ck-api-gateway.david-e59.workers.dev';
const AIRTABLE_BASE_ID = 'appUSnNgpDkcEOzhN';

export class GatewayClient {
  constructor(authToken) {
    this.baseUrl = GATEWAY_URL;
    this.authToken = authToken;
    this.connected = false;
    this.retryCount = 0;
    this.maxRetries = 4;
    this.retryDelays = [2000, 4000, 8000, 16000];
  }

  async request(method, path, body = null) {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      'Authorization': `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(url, options);
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Gateway ${response.status}: ${error}`);
        }

        this.connected = true;
        this.retryCount = 0;
        return await response.json();
      } catch (err) {
        if (attempt < this.maxRetries && err.message.includes('fetch')) {
          await new Promise(r => setTimeout(r, this.retryDelays[attempt]));
          continue;
        }
        throw err;
      }
    }
  }

  // ─── Health & Status ─────────────────────────────────────────
  async healthCheck() { return this.request('GET', '/v1/health?deep=true'); }
  async getAuditLog() { return this.request('GET', '/v1/audit'); }

  // ─── Agent Fleet Integration ─────────────────────────────────
  async listAgents() { return this.request('GET', '/v1/agents'); }
  async getAgent(id) { return this.request('GET', `/v1/agents/${id}`); }
  async getAgentMetrics() { return this.request('GET', '/v1/agents/metrics'); }
  async agentAction(id, action) { return this.request('POST', `/v1/agents/${id}/action`, { action }); }

  // ─── Inference (Claude AI) ───────────────────────────────────
  async runInference(prompt, options = {}) {
    return this.request('POST', '/v1/inference', {
      prompt,
      model: options.model || 'claude-sonnet-4-6',
      max_tokens: options.maxTokens || 4096,
      system: options.system || 'You are a senior Wall Street financial analyst at CK Trading Desk.',
      ...options,
    });
  }

  // ─── Financial Analysis via AI ───────────────────────────────
  async analyzeStock(symbol, analysisType) {
    const prompts = {
      'goldman-sachs': `Perform a comprehensive Goldman Sachs-level stock screening analysis for ${symbol}. Include P/E ratio analysis vs sector, revenue growth trends (5Y), debt-to-equity health check, dividend yield and sustainability, competitive moat rating (weak/moderate/strong), bull and bear case price targets (12 months), risk rating (1-10), and entry price zones with stop-loss suggestions. Format as structured JSON.`,
      'morgan-stanley': `Build a Morgan Stanley-style DCF valuation model for ${symbol}. Include 5-year revenue projection with growth assumptions, operating margin estimates, free cash flow calculations year by year, WACC estimate, terminal value (both exit multiple and perpetuity growth), sensitivity table at different discount rates, comparison of DCF value vs current market price, and a clear verdict (undervalued/fairly valued/overvalued). Format as structured JSON.`,
      'bridgewater': `Perform a Bridgewater Associates-style risk assessment for a portfolio containing ${symbol}. Include correlation analysis, sector concentration risk, geographic exposure, interest rate sensitivity, recession stress test with estimated drawdown, liquidity risk rating, position sizing recommendation, tail risk scenarios with probability estimates, hedging strategies, and rebalancing suggestions. Format as structured JSON.`,
      'jpmorgan': `Create a JPMorgan Chase-level earnings analysis for ${symbol}. Include last 4 quarters earnings vs estimates, revenue and EPS consensus for upcoming quarter, key metrics Wall Street watches, segment-by-segment revenue breakdown, management guidance summary, options market implied move, historical post-earnings price reactions, bull/bear/base scenarios with price impact, and recommended play (buy before/sell before/wait). Format as structured JSON.`,
      'blackrock': `Design a BlackRock-style portfolio construction model incorporating ${symbol}. Include exact asset allocation percentages, specific ETF recommendations with tickers, core vs satellite labels, expected annual return range, maximum drawdown estimate, rebalancing rules, tax efficiency strategy, dollar cost averaging plan, and benchmark selection. Format as structured JSON.`,
      'citadel': `Perform a Citadel-grade technical analysis of ${symbol}. Include current trend direction (daily/weekly/monthly), key support and resistance levels, moving average analysis (50/100/200 day) with crossover signals, RSI/MACD/Bollinger Band readings with interpretation, volume trend analysis, chart pattern identification, Fibonacci retracement levels, ideal entry/stop-loss/target, risk-to-reward ratio, and confidence rating (strong buy/buy/neutral/sell/strong sell). Format as structured JSON.`,
      'harvard': `Build a Harvard Endowment-inspired dividend analysis for ${symbol}. Include dividend safety score (1-10), consecutive years of growth, payout ratio analysis, monthly income projection, sector diversification assessment, dividend growth rate estimate (5Y), DRIP reinvestment projection (10Y), tax implications, and risk ranking (safest to most aggressive). Format as structured JSON.`,
      'bain': `Conduct a Bain & Company competitive advantage analysis for ${symbol}'s sector. Include top 5-7 competitors with market cap comparison, revenue and profit margin comparison, competitive moat analysis (brand/cost/network/switching), market share trends (3Y), management quality rating, R&D spending comparison, sector threats, SWOT analysis for top 2, best stock pick with rationale, and upcoming catalysts. Format as structured JSON.`,
      'renaissance': `Perform a Renaissance Technologies-style quantitative pattern analysis for ${symbol}. Include seasonal patterns (best/worst months), day-of-week effects, correlation with market events (Fed/CPI), insider buying/selling patterns, institutional ownership trends, short interest and squeeze potential, unusual options activity, earnings price behavior patterns, sector rotation signals, and statistical edge summary. Format as structured JSON.`,
      'mckinsey': `Create a McKinsey Global Institute macro impact assessment for ${symbol}. Include interest rate environment impact on this stock, inflation trend analysis, GDP growth forecast implications, US dollar strength impact, employment data implications, Federal Reserve policy outlook (6-12 months), global risk factors, sector rotation recommendation, specific portfolio adjustments, and timeline for when macro factors impact this stock. Format as structured JSON.`,
    };

    const prompt = prompts[analysisType];
    if (!prompt) throw new Error(`Unknown analysis type: ${analysisType}`);

    return this.runInference(prompt, {
      system: `You are operating as part of the CK Trading Desk autonomous financial analysis platform. You are the ${analysisType} analysis engine. Provide institutional-grade analysis. Return ONLY valid JSON. Be precise with numbers. This analysis drives automated trading decisions.`,
      maxTokens: 8192,
    });
  }

  // ─── MCCO Sovereign Command ──────────────────────────────────
  async getMCCOCommand() { return this.request('GET', '/v1/mcco/command'); }
  async getMCCOAgents() { return this.request('GET', '/v1/mcco/agents'); }
  async issueMCCODirective(directive) { return this.request('POST', '/v1/mcco/directive', directive); }
  async getFleetStatus() { return this.request('GET', '/v1/mcco/fleet-status'); }

  // ─── Intelligence Officers ───────────────────────────────────
  async getIntelOfficers() { return this.request('GET', '/v1/intel/officers'); }
  async getIntelDashboard() { return this.request('GET', '/v1/intel/dashboard'); }
  async runIntelScan(officerId) { return this.request('POST', `/v1/intel/officers/${officerId}/scan`); }
  async runFleetScan() { return this.request('POST', '/v1/intel/fleet-scan'); }

  // ─── Pricing Intelligence ────────────────────────────────────
  async getPricingRecommendation(data) { return this.request('POST', '/v1/pricing/recommend', data); }
  async getPricingZones() { return this.request('GET', '/v1/pricing/zones'); }

  // ─── Content Generation (for reports) ────────────────────────
  async generateContent(type, params) {
    return this.request('POST', '/v1/content/generate', { type, ...params });
  }

  // ─── Campaign Analytics ──────────────────────────────────────
  async getCampaignDashboard() { return this.request('GET', '/v1/campaign/dashboard'); }
  async getCampaignAnalytics() { return this.request('GET', '/v1/campaign/analytics'); }

  // ─── Frameworks ──────────────────────────────────────────────
  async getFrameworks() { return this.request('GET', '/v1/frameworks'); }
  async applyFramework(framework, context) {
    return this.request('POST', '/v1/frameworks/apply', { framework, context });
  }

  // ─── Email Agents ────────────────────────────────────────────
  async getEmailDashboard() { return this.request('GET', '/v1/email/dashboard'); }
  async composeEmail(params) { return this.request('POST', '/v1/email/compose', params); }

  // ─── Connection Status ───────────────────────────────────────
  getStatus() {
    return {
      connected: this.connected,
      gateway: this.baseUrl,
      airtableBase: AIRTABLE_BASE_ID,
      retryCount: this.retryCount,
    };
  }
}

/**
 * AirtableConnector — Direct Airtable integration for trading data persistence
 * Pushes trading metrics, P&L, agent performance to Airtable
 */
export class AirtableConnector {
  constructor(apiKey, baseId = AIRTABLE_BASE_ID) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.baseUrl = `https://api.airtable.com/v0/${baseId}`;
  }

  async request(method, table, body = null) {
    const url = `${this.baseUrl}/${encodeURIComponent(table)}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };

    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Airtable ${response.status}`);
    return response.json();
  }

  // Push daily P&L to Airtable
  async pushDailyPnL(data) {
    return this.request('POST', 'Trading Desk P&L', {
      records: [{
        fields: {
          'Date': data.date,
          'Total P&L': data.totalPnL,
          'Realized P&L': data.realizedPnL,
          'Unrealized P&L': data.unrealizedPnL,
          'Win Rate': data.winRate,
          'Total Trades': data.totalTrades,
          'Portfolio NAV': data.portfolioNAV,
          'Sharpe Ratio': data.sharpeRatio,
          'Max Drawdown': data.maxDrawdown,
          'Active Agents': data.activeAgents,
          'Active Strategies': data.activeStrategies,
        },
      }],
    });
  }

  // Push agent performance metrics
  async pushAgentPerformance(agents) {
    const records = agents.map(agent => ({
      fields: {
        'Agent ID': agent.id,
        'Codename': agent.codename,
        'Division': agent.division,
        'Tier': agent.tier,
        'Status': 'ACTIVE',
        'Trades Executed': agent.tradesExecuted,
        'P&L Generated': agent.pnlGenerated,
        'Win Rate': agent.winRate,
        'Last Active': new Date().toISOString(),
      },
    }));

    return this.request('POST', 'Agent Performance', { records });
  }

  // Push trade log
  async pushTrade(trade) {
    return this.request('POST', 'Trade Log', {
      records: [{
        fields: {
          'Trade ID': trade.id,
          'Timestamp': trade.timestamp,
          'Symbol': trade.symbol,
          'Side': trade.side,
          'Quantity': trade.quantity,
          'Price': trade.price,
          'Strategy': trade.strategy,
          'Agent': trade.agentId,
          'P&L': trade.pnl,
          'Status': trade.status,
        },
      }],
    });
  }

  // Push cash flow data
  async pushCashFlow(data) {
    return this.request('POST', 'Cash Flow', {
      records: [{
        fields: {
          'Date': data.date,
          'Dividend Income': data.dividendIncome,
          'Options Premium': data.optionsPremium,
          'Bond Income': data.bondIncome,
          'Total Income': data.totalIncome,
          'Cumulative': data.cumulative,
        },
      }],
    });
  }
}

/**
 * NemotronClient — Integration with CK Nemotron Worker for NVIDIA inference
 * Used for high-speed quantitative computations
 */
export class NemotronClient {
  constructor(authToken) {
    this.baseUrl = 'https://ck-nemotron-worker.david-e59.workers.dev';
    this.authToken = authToken;
  }

  async runInference(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/v1/inference`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.1,
      }),
    });

    if (!response.ok) throw new Error(`Nemotron ${response.status}`);
    return response.json();
  }

  // Fast quantitative analysis
  async quantAnalysis(data) {
    return this.runInference(
      `Analyze this market data and identify statistical edges: ${JSON.stringify(data)}. Return JSON with: patterns, confidence_scores, recommended_actions, risk_metrics.`,
      { temperature: 0.05 }
    );
  }
}

// ─── Singleton Instances ─────────────────────────────────────────
let gatewayInstance = null;
let airtableInstance = null;
let nemotronInstance = null;

export function initializeClients(config) {
  gatewayInstance = new GatewayClient(config.authToken);
  if (config.airtableKey) {
    airtableInstance = new AirtableConnector(config.airtableKey);
  }
  nemotronInstance = new NemotronClient(config.authToken);
  return { gateway: gatewayInstance, airtable: airtableInstance, nemotron: nemotronInstance };
}

export function getGateway() { return gatewayInstance; }
export function getAirtable() { return airtableInstance; }
export function getNemotron() { return nemotronInstance; }
