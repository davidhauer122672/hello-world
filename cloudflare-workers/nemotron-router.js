const BRAND_RULES = {
  prohibited_punctuation: ['!', '—'],
  prohibited_phrases: [
    'it is important to note',
    'in conclusion',
    'furthermore',
    'as a matter of fact',
    'it goes without saying',
    'needless to say'
  ]
};

const PRICING = {
  valid_amounts: [0, 95, 195, 295, 395, 500],
  valid_percentages: [10],
  services: {
    'weekly_home_watch': { amount: 395, unit: 'month' },
    'biweekly_home_watch': { amount: 295, unit: 'month' },
    'monthly_home_watch': { amount: 195, unit: 'month' },
    'property_mgmt_oversight': { amount: 95, unit: 'month' },
    'str_oversight': { percentage: 10, basis: 'gross rental income' },
    'pre_storm': { amount: 295, unit: 'event' },
    'post_storm': { amount: 500, unit: 'event' },
    'first_inspection': { amount: 0, display: 'Complimentary' }
  }
};

const ZONES = [
  'Vero Beach', 'Sebastian', 'Fort Pierce', 'Port Saint Lucie',
  'Jensen Beach', 'Palm City', 'Stuart', 'Hobe Sound',
  'Jupiter', 'North Palm Beach'
];

const SYSTEM_PROMPT = `You are the AI Operations Agent for Coastal Key Treasure Coast Asset Management.
Owner: David Hauer, Founder and CEO.
Location: Stuart, FL 34997. Phone: (772) 262-8341. Web: coastalkey-pm.com

IDENTITY:
You produce content, scripts, and structured outputs for three modules:
  MODULE_A: Project Sentinel - outbound sales scripts and objection handling
  MODULE_B: Social Automation - captions, posts, platform-specific copy
  MODULE_C: Content Production - video scripts, podcasts, repurposed assets

BRAND VOICE RULES (apply to all modules):
  - Tone: institutional, authoritative, concise, risk-first
  - Reading level: 9th grade maximum
  - Never use exclamation points or em dashes
  - Never use filler phrases
  - Get to the point in the first sentence
  - Close every piece with a risk frame or consequence statement

PRICING REFERENCE (never deviate):
  Weekly Home Watch: $395/month
  Biweekly Home Watch: $295/month
  Monthly Home Watch: $195/month
  Property Mgmt Oversight: from $95/month
  STR Oversight: 10% of gross rental income
  Pre-Storm: $295/event | Post-Storm: $500/event
  First Inspection: Complimentary (use as close tool)

SERVICE ZONES:
  Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie, Jensen Beach,
  Palm City, Stuart, Hobe Sound, Jupiter, North Palm Beach

OUTPUT FORMAT RULES:
  - Return only the requested output. No preamble. No explanation.
  - MODULE_A: return labeled sections (OPENER, BODY, CLOSE, OBJECTION)
  - MODULE_B: return platform label followed by caption text
  - MODULE_C: return labeled sections per content type spec
  - Never add suggestions or alternatives unless explicitly requested
  - Never hallucinate pricing, zone names, or service descriptions
  - Flag any request outside defined modules with: MODULE_UNDEFINED`;

const AIRTABLE_BASE_URL = 'https://api.airtable.com/v0';

async function logToAirtable(env, moduleTag, inputBrief, outputText, model) {
  const record = {
    fields: {
      'Module': moduleTag,
      'Input Brief': inputBrief,
      'Output Text': outputText,
      'Model ID': model,
      'Timestamp': new Date().toISOString()
    }
  };

  await fetch(`${AIRTABLE_BASE_URL}/${env.AIRTABLE_BASE_ID}/AI%20Log`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(record)
  });
}

async function notifySlack(env, channel, message) {
  await fetch(env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channel, text: message })
  });
}

function classifyModule(input) {
  const lower = input.toLowerCase();
  if (lower.includes('sentinel') || lower.includes('outbound') || lower.includes('objection') || lower.includes('sales script') || lower.includes('hook generation')) {
    return 'MODULE_A';
  }
  if (lower.includes('social') || lower.includes('caption') || lower.includes('instagram') || lower.includes('facebook') || lower.includes('linkedin') || lower.includes('alignable') || lower.includes('buffer')) {
    return 'MODULE_B';
  }
  if (lower.includes('video') || lower.includes('podcast') || lower.includes('youtube') || lower.includes('repurpos') || lower.includes('script') || lower.includes('thumbnail')) {
    return 'MODULE_C';
  }
  return 'MODULE_UNDEFINED';
}

const RATE_LIMIT = {
  max_requests_per_minute: 30,
  window_ms: 60000,
  requests: []
};

function checkRateLimit() {
  const now = Date.now();
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(t => now - t < RATE_LIMIT.window_ms);
  if (RATE_LIMIT.requests.length >= RATE_LIMIT.max_requests_per_minute) {
    return false;
  }
  RATE_LIMIT.requests.push(now);
  return true;
}

export default {
  async fetch(request, env) {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'POST required' }), { status: 405 });
    }

    if (!checkRateLimit()) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }

    const body = await request.json();
    const { prompt, module_override } = body;

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt required' }), { status: 400 });
    }

    const moduleTag = module_override || classifyModule(prompt);

    let result;
    let modelUsed = '@cf/nvidia/nemotron-3-120b-a12b';

    try {
      const aiResponse = await env.AI.run('@cf/nvidia/nemotron-3-120b-a12b', {
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `[${moduleTag}] ${prompt}` }
        ],
        max_tokens: 2048,
        temperature: 0.7
      });
      result = aiResponse.response;
    } catch (primaryError) {
      modelUsed = 'claude-sonnet-4-20250514';
      const fallbackResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2048,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: `[${moduleTag}] ${prompt}` }]
        })
      });
      const fallbackData = await fallbackResponse.json();
      result = fallbackData.content[0].text;
    }

    await logToAirtable(env, moduleTag, prompt, result, modelUsed);

    return new Response(JSON.stringify({
      module: moduleTag,
      model: modelUsed,
      output: result,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
