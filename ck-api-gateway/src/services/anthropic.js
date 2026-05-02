/**
 * Anthropic Service — Claude inference with KV caching and structured output.
 *
 * Uses Claude claude-sonnet-4-6 for cost-efficient operations and Claude claude-opus-4-6 for
 * complex analysis (battle plans, investor presentations).
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

// Model routing by task complexity
const MODEL_MAP = {
  fast: 'claude-sonnet-4-6',
  standard: 'claude-sonnet-4-6',
  advanced: 'claude-opus-4-6',
};

/**
 * Run a Claude inference call with optional KV caching.
 *
 * @param {object} env — Worker env bindings
 * @param {object} options
 * @param {string} options.system — System prompt
 * @param {string} options.prompt — User message
 * @param {string} [options.tier='standard'] — Model tier: fast, standard, advanced
 * @param {number} [options.maxTokens=2048] — Max response tokens
 * @param {string} [options.cacheKey] — Optional KV cache key (skips API call if cached)
 * @param {number} [options.cacheTtl=3600] — Cache TTL in seconds
 * @returns {object} — { content, model, cached, usage }
 */
export async function inference(env, options) {
  const {
    system,
    prompt,
    tier = 'standard',
    maxTokens = 2048,
    cacheKey,
    cacheTtl = 3600,
  } = options;

  // ── Check KV cache ──
  if (cacheKey && env.CACHE) {
    const cached = await env.CACHE.get(cacheKey, 'json');
    if (cached) {
      return { ...cached, cached: true };
    }
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY secret is not configured.');

  const model = MODEL_MAP[tier] || MODEL_MAP.standard;

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || '';

  const result = {
    content,
    model: data.model,
    cached: false,
    usage: data.usage,
  };

  // ── Write to KV cache ──
  if (cacheKey && env.CACHE) {
    await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: cacheTtl });
  }

  return result;
}
