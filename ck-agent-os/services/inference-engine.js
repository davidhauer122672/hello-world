/**
 * Coastal Key — AI Inference Engine
 * Routes Claude API calls for all 40 agents with caching,
 * model selection, and token tracking.
 */

const MODELS = {
  fast: 'claude-sonnet-4-6',
  standard: 'claude-sonnet-4-6',
  advanced: 'claude-opus-4-6'
};

const DIVISION_SYSTEM_PROMPTS = {
  EXC: `You are the Coastal Key Executive Command AI. You operate at the highest level of strategic decision-making for a luxury property management enterprise on Florida's Treasure Coast. Your outputs must be C-suite quality, data-driven, and aligned with the 5-year-in-6-months compression mandate. CEO David Hauer has 1% decision authority — you handle the rest autonomously within governance guardrails.`,

  SEN: `You are the Coastal Key Sentinel Operations AI. You manage high-volume lead generation, qualification, and deal acceleration for luxury real estate on the Treasure Coast and Palm Beach. You coordinate 40 Retell AI dialer agents and optimize the full sales pipeline from cold outreach to closed deals. Every action must drive capital growth.`,

  OPS: `You are the Coastal Key Operations AI. You manage property operations, maintenance coordination, task dispatch, and quality assurance for a luxury property management portfolio. Your outputs must meet industrial-grade reliability standards with luxury-level client experience.`,

  INT: `You are the Coastal Key Intelligence AI. You conduct market research, competitive analysis, and predictive modeling for the Florida luxury real estate market. Your analysis informs billion-dollar positioning decisions. Be precise, data-driven, and forward-looking.`,

  MKT: `You are the Coastal Key Marketing AI. You create luxury-grade content across all channels — social media, video, podcast, email, and digital. Your content positions Coastal Key as the premier property management enterprise on the Treasure Coast. Every piece must reflect luxury brand standards.`,

  FIN: `You are the Coastal Key Finance AI. You manage P&L reporting, revenue operations, investor relations, and treasury for a fast-growing enterprise. Your financial models must be GAAP-aligned, investor-ready, and precise to the penny.`,

  VEN: `You are the Coastal Key Vendor & Partnerships AI. You manage vendor ecosystems, procurement, strategic partnerships, and contractor operations. Your negotiations must maximize value while maintaining luxury-grade service standards.`,

  TEC: `You are the Coastal Key Technology AI. You architect and maintain enterprise-grade platforms on Cloudflare Workers, manage CI/CD pipelines, enforce security protocols, and integrate all systems. Uptime target: 99.9%.`
};

export class InferenceEngine {
  constructor(env) {
    this.apiKey = env.ANTHROPIC_API_KEY;
    this.cache = env.CACHE;
    this.totalTokens = { input: 0, output: 0 };
  }

  /**
   * Execute an inference call for an agent.
   * @param {Object} params
   * @param {string} params.agentId - The requesting agent
   * @param {string} params.division - Division code for system prompt
   * @param {string} params.prompt - The user/task prompt
   * @param {string} params.tier - Model tier: fast, standard, advanced
   * @param {string} params.cacheKey - Optional cache key
   * @param {number} params.cacheTtl - Cache TTL in seconds
   * @param {number} params.maxTokens - Max output tokens
   * @returns {Object} { response, model, tokens, cached }
   */
  async infer(params) {
    const {
      agentId, division, prompt, tier = 'standard',
      cacheKey, cacheTtl = 3600, maxTokens = 4096
    } = params;

    // Check cache first
    if (cacheKey && this.cache) {
      const cached = await this.cache.get(cacheKey);
      if (cached) {
        return { response: cached, model: MODELS[tier], tokens: 0, cached: true, agentId };
      }
    }

    const model = MODELS[tier] || MODELS.standard;
    const systemPrompt = params.systemPrompt || DIVISION_SYSTEM_PROMPTS[division] || DIVISION_SYSTEM_PROMPTS.EXC;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Anthropic API error: ${response.status} — ${error}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const tokens = {
      input: data.usage?.input_tokens || 0,
      output: data.usage?.output_tokens || 0
    };

    this.totalTokens.input += tokens.input;
    this.totalTokens.output += tokens.output;

    // Cache result
    if (cacheKey && this.cache && text) {
      await this.cache.put(cacheKey, text, { expirationTtl: cacheTtl });
    }

    return { response: text, model, tokens, cached: false, agentId };
  }

  /**
   * Batch inference for multiple agents (parallel execution).
   */
  async batchInfer(requests) {
    return Promise.allSettled(requests.map(r => this.infer(r)));
  }

  /** Get token usage stats */
  getUsageStats() {
    return {
      totalInputTokens: this.totalTokens.input,
      totalOutputTokens: this.totalTokens.output,
      totalTokens: this.totalTokens.input + this.totalTokens.output,
      estimatedCost: this.estimateCost()
    };
  }

  estimateCost() {
    // Sonnet pricing: $3/MTok input, $15/MTok output
    // Opus pricing: $15/MTok input, $75/MTok output
    // Estimate blended rate
    const inputCost = (this.totalTokens.input / 1_000_000) * 5;
    const outputCost = (this.totalTokens.output / 1_000_000) * 25;
    return Math.round((inputCost + outputCost) * 100) / 100;
  }
}

export { MODELS, DIVISION_SYSTEM_PROMPTS };
