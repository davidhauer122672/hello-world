/**
 * SPEAR Funnel System — Coastal Key Automated Sales Pipeline
 *
 * SPEAR: Short, Personal, Expect A Reply
 *
 * 4-Step Automated Funnel:
 *   Step 1 (SPEAR):   Send 9-word-or-shorter personal text from David Hauer
 *   Step 2 (FACTS):   On "I'm in" reply → deliver Quick Facts document
 *   Step 3 (EXPERT):  Follow-up: "Just wanted to make sure you saw this"
 *   Step 4 (ACTION):  On "I'm in" reply → send secure payment link
 *
 * Routes:
 *   POST /v1/spear/trigger         — Initiate SPEAR sequence for a lead
 *   POST /v1/spear/reply           — Process inbound "I'm in" reply
 *   GET  /v1/spear/status/:leadId  — Get funnel position for a lead
 *   GET  /v1/spear/dashboard       — Funnel metrics and conversion data
 *   POST /v1/spear/generate        — AI-generate a 9-word SPEAR message
 *
 * Owner: MKT Division (Marketing)
 * Auth: Bearer token (WORKER_AUTH_TOKEN)
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

// ── SPEAR Funnel Stage Definitions ──────────────────────────────────────────

const STAGES = {
  SPEAR: {
    id: 1,
    name: 'SPEAR',
    description: 'Send 9-word personal text from David Hauer, CEO',
    maxWords: 9,
  },
  FACTS: {
    id: 2,
    name: 'FACTS',
    description: 'Deliver Quick Facts document on "I\'m in" reply',
    trigger: "I'm in",
  },
  EXPERT: {
    id: 3,
    name: 'EXPERT',
    description: 'Follow-up: "Just wanted to make sure you saw this"',
    followUpMessage: 'Just wanted to make sure you saw this.',
  },
  ACTION: {
    id: 4,
    name: 'ACTION',
    description: 'Send secure payment link on "I\'m in" reply',
    trigger: "I'm in",
  },
};

// ── Quick Facts Document Templates (by audience tier) ───────────────────────

const QUICK_FACTS = {
  middle_class: {
    title: 'Coastal Key Property Protection — Quick Facts',
    facts: [
      'Licensed and insured home watch professionals covering Florida\'s Treasure Coast',
      'Weekly property inspections with photo-documented reports delivered to your phone',
      'Storm preparation and post-storm damage assessment included in every plan',
      'Starting at $195/month for comprehensive property protection',
      'AI-powered 24/7 monitoring with 404-agent fleet backing every property',
    ],
    cta: 'Reply "I\'m in" to secure your property protection plan.',
  },
  high_class: {
    title: 'Coastal Key Luxury Property Management — Quick Facts',
    facts: [
      'White-glove property management for homes valued $750K and above',
      'Dedicated property manager with bi-weekly inspections and concierge coordination',
      'Full vendor management: HVAC, landscaping, pool, pest, and emergency response',
      'Real-time Command Center dashboard with AI-powered property health scoring',
      'Led by Tracey Merritt Hunter — Top 100 RE/MAX Florida, $18M annual production',
    ],
    cta: 'Reply "I\'m in" to schedule your complimentary property consultation.',
  },
  elite: {
    title: 'Coastal Key Private Estate Services — Quick Facts',
    facts: [
      'Private estate management for ultra-high-net-worth coastal portfolios',
      'Institutional-grade reporting: cap rate analysis, ROI tracking, market intelligence',
      'Multi-property portfolio oversight with dedicated Intelligence Officer assigned',
      'Exclusive investor advisory: acquisition analysis, pricing strategy, market timing',
      'Sovereign-level AI operations: 404-unit fleet, 147 API endpoints, 39-table CRM',
    ],
    cta: 'Reply "I\'m in" for a private portfolio consultation with our CEO.',
  },
};

// ── SPEAR Message Templates (David Hauer voice) ────────────────────────────

const SPEAR_TEMPLATES = [
  '{firstName}, are you still thinking about property protection? —DH',
  '{firstName}, quick question about your coastal property. —DH',
  '{firstName}, are you still looking for property management? —DH',
  '{firstName}, wanted to share something about your property. —DH',
  '{firstName}, have a minute to talk about your home? —DH',
  '{firstName}, still considering protection for your property? —DH',
  '{firstName}, thought of you regarding coastal property care. —DH',
  '{firstName}, are you still interested in home watch? —DH',
];

function generateSpearMessage(firstName) {
  const template = SPEAR_TEMPLATES[Math.floor(Math.random() * SPEAR_TEMPLATES.length)];
  return template.replace('{firstName}', firstName);
}

function classifyTier(propertyValue) {
  if (!propertyValue) return 'middle_class';
  const val = Number(propertyValue);
  if (val >= 2000000) return 'elite';
  if (val >= 750000) return 'high_class';
  return 'middle_class';
}

// ── Route Handlers ──────────────────────────────────────────────────────────

/**
 * POST /v1/spear/trigger — Initiate SPEAR sequence for a lead
 * Body: { leadId, firstName, lastName, phone, email, propertyValue?, tier? }
 */
export async function handleSpearTrigger(request, env, ctx) {
  const body = await request.json();
  const { leadId, firstName, phone } = body;

  if (!leadId || !firstName || !phone) {
    return errorResponse('Missing required fields: leadId, firstName, phone', 400);
  }

  const tier = body.tier || classifyTier(body.propertyValue);
  const spearMessage = generateSpearMessage(firstName);

  const funnelState = {
    leadId,
    firstName: body.firstName,
    lastName: body.lastName || '',
    phone,
    email: body.email || '',
    tier,
    stage: 1,
    stageName: 'SPEAR',
    spearMessage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    conversions: [],
  };

  // Store funnel state in KV
  if (env.SESSIONS) {
    await env.SESSIONS.put(
      `spear:${leadId}`,
      JSON.stringify(funnelState),
      { expirationTtl: 86400 * 90 }
    );
  }

  writeAudit(env, ctx, 'spear.triggered', { leadId, tier, stage: 1 });

  return jsonResponse({
    success: true,
    funnel: funnelState,
    action: {
      type: 'send_sms',
      to: phone,
      message: spearMessage,
      wordCount: spearMessage.split(/\s+/).length,
    },
  });
}

/**
 * POST /v1/spear/reply — Process inbound reply (triggers next stage)
 * Body: { leadId, reply }
 */
export async function handleSpearReply(request, env, ctx) {
  const body = await request.json();
  const { leadId, reply } = body;

  if (!leadId) {
    return errorResponse('Missing required field: leadId', 400);
  }

  // Retrieve funnel state
  let funnelState = null;
  if (env.SESSIONS) {
    const stored = await env.SESSIONS.get(`spear:${leadId}`);
    if (stored) funnelState = JSON.parse(stored);
  }

  if (!funnelState) {
    return errorResponse('No active SPEAR funnel for this lead', 404);
  }

  const replyNormalized = (reply || '').trim().toLowerCase();
  const isOptIn = replyNormalized.includes("i'm in") || replyNormalized.includes('im in') || replyNormalized.includes('i am in');

  const currentStage = funnelState.stage;
  let nextAction = null;

  if (currentStage === 1 && isOptIn) {
    // Stage 1 → 2: Send Quick Facts
    funnelState.stage = 2;
    funnelState.stageName = 'FACTS';
    funnelState.conversions.push({ stage: 1, reply, at: new Date().toISOString() });

    const facts = QUICK_FACTS[funnelState.tier] || QUICK_FACTS.middle_class;
    nextAction = {
      type: 'send_document',
      to: funnelState.phone,
      document: facts,
    };

  } else if (currentStage === 2) {
    // Stage 2 → 3: Send Expert Follow-up
    funnelState.stage = 3;
    funnelState.stageName = 'EXPERT';

    nextAction = {
      type: 'send_sms',
      to: funnelState.phone,
      message: STAGES.EXPERT.followUpMessage,
    };

  } else if ((currentStage === 3 || currentStage === 2) && isOptIn) {
    // Stage 3 → 4: Send Payment Link
    funnelState.stage = 4;
    funnelState.stageName = 'ACTION';
    funnelState.conversions.push({ stage: currentStage, reply, at: new Date().toISOString() });
    funnelState.completed = true;
    funnelState.completedAt = new Date().toISOString();

    const paymentUrl = env.PAYMENT_URL || 'https://coastalkey-pm.com/portal';
    nextAction = {
      type: 'send_payment_link',
      to: funnelState.phone,
      email: funnelState.email,
      paymentUrl,
      message: `Here's your secure enrollment link: ${paymentUrl}`,
    };

  } else {
    // No stage transition — acknowledge reply
    nextAction = {
      type: 'no_action',
      reason: isOptIn ? 'Already at final stage' : 'Reply did not trigger stage advancement',
      currentStage: funnelState.stageName,
    };
  }

  funnelState.updatedAt = new Date().toISOString();

  if (env.SESSIONS) {
    await env.SESSIONS.put(
      `spear:${leadId}`,
      JSON.stringify(funnelState),
      { expirationTtl: 86400 * 90 }
    );
  }

  writeAudit(env, ctx, 'spear.reply', { leadId, stage: funnelState.stage, isOptIn });

  return jsonResponse({
    success: true,
    funnel: funnelState,
    action: nextAction,
  });
}

/**
 * GET /v1/spear/status/:leadId — Get funnel position for a lead
 */
export async function handleSpearStatus(leadId, env) {
  if (!env.SESSIONS) {
    return errorResponse('Sessions KV not available', 503);
  }

  const stored = await env.SESSIONS.get(`spear:${leadId}`);
  if (!stored) {
    return errorResponse('No active SPEAR funnel for this lead', 404);
  }

  return jsonResponse(JSON.parse(stored));
}

/**
 * GET /v1/spear/dashboard — Funnel metrics overview
 */
export function handleSpearDashboard() {
  return jsonResponse({
    system: 'SPEAR Funnel System',
    version: '2.1',
    owner: 'MKT Division',
    stages: STAGES,
    tiers: Object.keys(QUICK_FACTS),
    templates: SPEAR_TEMPLATES.length,
    description: 'Short, Personal, Expect A Reply — 4-step automated sales funnel',
    triggerKeyword: "I'm in",
    voice: 'David Hauer, CEO — Coastal Key Property Management',
  });
}

/**
 * POST /v1/spear/generate — AI-generate a personalized 9-word SPEAR message
 * Body: { firstName, context?, propertyType? }
 */
export async function handleSpearGenerate(request, env, ctx) {
  const body = await request.json();
  const { firstName } = body;

  if (!firstName) {
    return errorResponse('Missing required field: firstName', 400);
  }

  if (!env.ANTHROPIC_API_KEY) {
    const fallback = generateSpearMessage(firstName);
    return jsonResponse({ message: fallback, source: 'template', wordCount: fallback.split(/\s+/).length });
  }

  const prompt = `Generate a single SMS message from David Hauer, CEO of Coastal Key Property Management. Rules:
- Maximum 9 words
- Must sound personal, warm, and direct
- Must end with "—DH"
- Must include the recipient's first name: ${firstName}
- Topic: home watch or property management services on Florida's Treasure Coast
- Tone: confident neighbor, not salesperson
- No exclamation points
Return ONLY the message text, nothing else.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 50,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const result = await response.json();
    const message = result.content?.[0]?.text?.trim() || generateSpearMessage(firstName);

    writeAudit(env, ctx, 'spear.generate', { firstName, message });

    return jsonResponse({
      message,
      source: 'claude',
      wordCount: message.split(/\s+/).length,
    });
  } catch (err) {
    const fallback = generateSpearMessage(firstName);
    return jsonResponse({ message: fallback, source: 'template_fallback', wordCount: fallback.split(/\s+/).length });
  }
}
