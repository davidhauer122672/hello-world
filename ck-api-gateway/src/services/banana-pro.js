/**
 * Banana Pro AI Integration Service
 *
 * Connects Banana Pro AI inference capabilities to the Coastal Key Enterprise.
 * Banana Pro provides GPU-accelerated model hosting for real-time content generation,
 * image processing, and predictive analytics pipelines.
 *
 * Capabilities:
 *  - Content generation (social posts, property descriptions, market reports)
 *  - Image analysis (property photos, inspection images, marketing assets)
 *  - Predictive scoring (lead scoring, market trend forecasting)
 *  - Batch processing (bulk content calendar population, mass outreach personalization)
 */

const BANANA_PRO_API = 'https://api.banana.dev/v1';

/**
 * Execute a Banana Pro AI model inference.
 * @param {object} env - Worker environment bindings
 * @param {object} params
 * @param {string} params.model - Model key (e.g., 'content-gen', 'image-analysis', 'lead-score')
 * @param {object} params.input - Model input payload
 * @param {string} [params.webhook] - Optional webhook URL for async results
 * @returns {Promise<object>} - { output, modelId, latencyMs, cached }
 */
export async function bananProInference(env, { model, input, webhook }) {
  if (!env.BANANA_PRO_API_KEY) throw new Error('BANANA_PRO_API_KEY secret is not configured.');

  const modelMap = {
    'content-gen': env.BANANA_PRO_MODEL_CONTENT || 'ck-content-gen-v2',
    'image-analysis': env.BANANA_PRO_MODEL_IMAGE || 'ck-image-analysis-v1',
    'lead-score': env.BANANA_PRO_MODEL_SCORING || 'ck-lead-score-v3',
    'market-forecast': env.BANANA_PRO_MODEL_FORECAST || 'ck-market-forecast-v1',
    'property-desc': env.BANANA_PRO_MODEL_PROPERTY || 'ck-property-desc-v2',
    'social-content': env.BANANA_PRO_MODEL_SOCIAL || 'ck-social-content-v1',
  };

  const modelId = modelMap[model] || model;

  // Check KV cache first
  const cacheKey = `banana:${model}:${JSON.stringify(input).slice(0, 200)}`;
  if (env.CACHE) {
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      return { ...JSON.parse(cached), cached: true };
    }
  }

  const startTime = Date.now();

  const response = await fetch(`${BANANA_PRO_API}/run`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.BANANA_PRO_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      modelKey: modelId,
      modelInputs: input,
      ...(webhook ? { callbackUrl: webhook } : {}),
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Banana Pro inference error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const latencyMs = Date.now() - startTime;

  const result = {
    output: data.modelOutputs?.[0] || data.output || data,
    modelId,
    latencyMs,
    cached: false,
    callId: data.id || null,
  };

  // Cache result for 1 hour
  if (env.CACHE) {
    await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 3600 });
  }

  return result;
}

/**
 * Generate social media content via Banana Pro AI.
 * @param {object} env
 * @param {object} params
 * @param {string} params.topic - Content topic
 * @param {string} params.platform - Target platform (instagram, facebook, linkedin, twitter)
 * @param {string} [params.tone] - Content tone (professional, casual, luxury)
 * @param {string} [params.propertyData] - Optional property context
 * @returns {Promise<object>}
 */
export async function generateSocialContent(env, { topic, platform, tone, propertyData }) {
  return bananProInference(env, {
    model: 'social-content',
    input: {
      topic,
      platform,
      tone: tone || 'professional',
      propertyContext: propertyData || null,
      brand: 'Coastal Key Property Management',
      region: 'Treasure Coast, FL',
      guidelines: {
        maxLength: platform === 'twitter' ? 280 : 2200,
        includeHashtags: true,
        includeCTA: true,
        brandVoice: 'luxury-professional',
      },
    },
  });
}

/**
 * Score a lead using Banana Pro predictive model.
 * @param {object} env
 * @param {object} leadData - Lead fields from Airtable
 * @returns {Promise<object>} - { score, tier, factors, recommended_action }
 */
export async function scoreLeadAI(env, leadData) {
  return bananProInference(env, {
    model: 'lead-score',
    input: {
      name: leadData['Lead Name'],
      segment: leadData['Sentinel Segment'],
      propertyValue: leadData['Property Value'],
      serviceZone: leadData['Service Zone'],
      source: leadData['Lead Source'],
      disposition: leadData['Call Disposition'],
      sequenceStep: leadData['Sequence Step'],
      daysSinceContact: leadData._daysSinceContact || 0,
    },
  });
}

/**
 * Generate property description via Banana Pro AI.
 * @param {object} env
 * @param {object} params
 * @param {string} params.address
 * @param {string} params.zone
 * @param {number} params.value
 * @param {string} [params.features]
 * @returns {Promise<object>}
 */
export async function generatePropertyDescription(env, { address, zone, value, features }) {
  return bananProInference(env, {
    model: 'property-desc',
    input: {
      address,
      serviceZone: zone,
      estimatedValue: value,
      features: features || '',
      style: 'luxury-marketing',
      includeMarketContext: true,
    },
  });
}

/**
 * Run market forecast via Banana Pro predictive analytics.
 * @param {object} env
 * @param {object} params
 * @param {string} params.zone - Service zone
 * @param {string} params.timeframe - Forecast period (30d, 90d, 1y)
 * @param {string[]} [params.metrics] - Metrics to forecast
 * @returns {Promise<object>}
 */
export async function marketForecast(env, { zone, timeframe, metrics }) {
  return bananProInference(env, {
    model: 'market-forecast',
    input: {
      serviceZone: zone,
      timeframe: timeframe || '90d',
      metrics: metrics || ['occupancy_rate', 'avg_rent', 'demand_index', 'competition_score'],
      region: 'Treasure Coast, FL',
      includeConfidenceIntervals: true,
    },
  });
}

/**
 * Batch process content calendar entries.
 * @param {object} env
 * @param {object[]} entries - Array of { topic, platform, scheduledDate }
 * @returns {Promise<object[]>}
 */
export async function batchGenerateContent(env, entries) {
  const results = [];
  // Process in batches of 5 to respect rate limits
  for (let i = 0; i < entries.length; i += 5) {
    const batch = entries.slice(i, i + 5);
    const batchResults = await Promise.all(
      batch.map(entry => generateSocialContent(env, {
        topic: entry.topic,
        platform: entry.platform,
        tone: entry.tone || 'professional',
        propertyData: entry.propertyData || null,
      }))
    );
    results.push(...batchResults);
  }
  return results;
}
