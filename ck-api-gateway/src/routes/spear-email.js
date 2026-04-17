/**
 * SPEAR-Email Funnel System — TCPA-Safe Email Outbound
 *
 * SPEAR methodology (Short, Personal, Expect A Reply) adapted to email.
 * Not subject to TCPA — governed by CAN-SPAM Act only.
 *
 * Why Email Variant:
 *   The SMS SPEAR funnel (routes/spear.js) is TCPA-regulated. Until the
 *   TCPA Clearance Memo (TCPA-CLEAR-2026-04-16-001) has fully propagated
 *   and the compliance gate is verified live for 72 hours, email is the
 *   legally cleared channel for cold outbound.
 *
 * 4-Step Funnel (mirrors SMS SPEAR):
 *   Step 1 (SPEAR):   Short personal email from David Hauer (subject ≤ 6 words)
 *   Step 2 (FACTS):   On reply expressing interest → Quick Facts attachment
 *   Step 3 (EXPERT):  Follow-up if no reply within 72 hours
 *   Step 4 (ACTION):  On second interest signal → consultation booking link
 *
 * Routes:
 *   POST /v1/spear-email/trigger          — Initiate email funnel for a lead
 *   POST /v1/spear-email/reply            — Process inbound reply
 *   GET  /v1/spear-email/status/:leadId   — Get funnel position
 *   GET  /v1/spear-email/dashboard        — Metrics and configuration
 *   POST /v1/spear-email/generate         — AI-generate personalized email
 *
 * Compliance:
 *   - CAN-SPAM: includes physical address in footer, clear unsubscribe
 *   - No TCPA gate required (email is out of TCPA scope)
 *   - Every send audit-logged via writeAudit()
 *
 * Owner: SEN Division (Sentinel Sales) with MKT support
 * Auth:  Bearer token (WORKER_AUTH_TOKEN)
 */

import { sendEmail } from '../services/gmail-oauth.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Configuration ───────────────────────────────────────────────────────────

const UNSUBSCRIBE_FOOTER = `

—
David Hauer | Coastal Key Property Management
Stuart, FL 34994
To stop receiving these messages, reply with "unsubscribe".`;

const TIER_QUICK_FACTS = {
  partner: {
    subject: 'Quick Facts — Coastal Key Partnership',
    body: `Thanks for the reply. Here are the basics:

• Coastal Key manages home watch and full property management on the Treasure Coast
• Licensed, insured, NHWA-accredited
• AI-operated — 383-agent fleet runs inspections, reporting, and dispatch 24/7
• Starting at $195/month; luxury tier $500+

Our partnership program pays a flat $250 referral on any client that closes from your book. No paperwork, just an intro.

Happy to get on a 15-minute call this week. Here's my calendar: https://coastalkey-pm.com/book`,
  },
  middle_class: {
    subject: 'Quick Facts — Property Protection',
    body: `Here's what we do:

• Weekly property inspections with photo reports delivered to your phone
• Storm prep and post-storm damage assessment included
• Vendor coordination (HVAC, pest, pool, landscaping)
• Starting at $195/month

Reply "I'm in" and I'll send a secure enrollment link. Or book a 15-min call: https://coastalkey-pm.com/book`,
  },
  high_class: {
    subject: 'Quick Facts — Luxury Property Management',
    body: `White-glove management for homes $750K+:

• Dedicated property manager, bi-weekly inspections
• Full vendor coordination — HVAC, landscaping, pool, pest, emergency response
• Command Center dashboard with AI-powered health scoring
• Led by Tracey Merritt Hunter — Top 100 RE/MAX Florida

Reply "I'm in" to schedule a complimentary consultation, or book direct: https://coastalkey-pm.com/book`,
  },
  elite: {
    subject: 'Quick Facts — Private Estate Services',
    body: `Private estate management for ultra-high-net-worth coastal portfolios:

• Institutional reporting: cap rate, ROI, market intel
• Dedicated Intelligence Officer
• Acquisition analysis and market timing advisory
• Sovereign AI operations — 147 API endpoints, 39-table CRM

Reply "I'm in" for a private consultation with the CEO.`,
  },
};

const EXPERT_FOLLOWUP = {
  subject: 'Quick follow-up',
  body: `Wanted to make sure you saw my last note. No pressure — if now isn't the right time, just reply "not now" and I'll circle back in the fall.

—DH`,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function classifyTier(propertyValue, isPartner) {
  if (isPartner) return 'partner';
  if (!propertyValue) return 'middle_class';
  const val = Number(propertyValue);
  if (val >= 2000000) return 'elite';
  if (val >= 750000) return 'high_class';
  return 'middle_class';
}

function isOptInReply(reply) {
  const normalized = (reply || '').trim().toLowerCase();
  return /\b(i['']?m in|im in|i am in|yes|interested|tell me more|send it|let['']?s talk)\b/.test(normalized);
}

function isUnsubReply(reply) {
  const normalized = (reply || '').trim().toLowerCase();
  return /\b(unsubscribe|remove me|stop|opt.?out|take me off)\b/.test(normalized);
}

function composeBody(opener, closer = '—DH') {
  return `${opener}\n\n${closer}${UNSUBSCRIBE_FOOTER}`;
}

// ── Route Handlers ──────────────────────────────────────────────────────────

/**
 * POST /v1/spear-email/trigger — Initiate SPEAR-Email funnel for a lead
 * Body: { leadId, firstName, lastName?, email, propertyValue?, isPartner?, opener?, subject? }
 */
export async function handleSpearEmailTrigger(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { leadId, firstName, email, opener, subject } = body;

  if (!leadId || !firstName || !email) {
    return errorResponse('Fields "leadId", "firstName", and "email" are required.', 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return errorResponse('Invalid email address format.', 400);
  }

  const tier = body.tier || classifyTier(body.propertyValue, body.isPartner);

  const defaultOpener = body.isPartner
    ? `${firstName} — quick note. Coastal Key is building a partner referral program for Treasure Coast property owners. Short call this week?`
    : `${firstName} — still thinking about property protection on the Treasure Coast? 90 seconds and I can show you what we do differently.`;

  const finalSubject = subject || (body.isPartner ? 'Quick partner intro' : 'Quick question');
  const finalOpener = opener || defaultOpener;

  const funnelState = {
    leadId,
    firstName,
    lastName: body.lastName || '',
    email,
    tier,
    isPartner: !!body.isPartner,
    stage: 1,
    stageName: 'SPEAR',
    subject: finalSubject,
    opener: finalOpener,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    conversions: [],
    emailsSent: [],
  };

  // Send the email
  try {
    const sendResult = await sendEmail(env, {
      to: email,
      subject: finalSubject,
      body: composeBody(finalOpener),
      isHtml: false,
    });

    funnelState.emailsSent.push({
      stage: 1,
      messageId: sendResult.id,
      threadId: sendResult.threadId,
      at: new Date().toISOString(),
    });

    if (env.SESSIONS) {
      await env.SESSIONS.put(
        `spear-email:${leadId}`,
        JSON.stringify(funnelState),
        { expirationTtl: 86400 * 90 }
      );
    }

    writeAudit(env, ctx, {
      route: '/v1/spear-email/trigger',
      action: 'spear-email.triggered',
      leadId,
      tier,
      stage: 1,
      messageId: sendResult.id,
    });

    return jsonResponse({
      success: true,
      funnel: funnelState,
      action: {
        type: 'email_sent',
        to: email,
        subject: finalSubject,
        messageId: sendResult.id,
        threadId: sendResult.threadId,
      },
    });
  } catch (err) {
    writeAudit(env, ctx, {
      route: '/v1/spear-email/trigger',
      action: 'spear-email.send-failed',
      leadId,
      error: err.message,
    });
    return errorResponse(`Email send failed: ${err.message}`, 500);
  }
}

/**
 * POST /v1/spear-email/reply — Process inbound email reply
 * Body: { leadId, reply, threadId? }
 */
export async function handleSpearEmailReply(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { leadId, reply } = body;
  if (!leadId) {
    return errorResponse('Missing required field: leadId', 400);
  }

  let funnelState = null;
  if (env.SESSIONS) {
    const stored = await env.SESSIONS.get(`spear-email:${leadId}`);
    if (stored) funnelState = JSON.parse(stored);
  }

  if (!funnelState) {
    return errorResponse('No active SPEAR-Email funnel for this lead', 404);
  }

  // Handle unsubscribe immediately at any stage
  if (isUnsubReply(reply)) {
    funnelState.stage = -1;
    funnelState.stageName = 'UNSUBSCRIBED';
    funnelState.unsubscribedAt = new Date().toISOString();
    funnelState.updatedAt = new Date().toISOString();

    if (env.SESSIONS) {
      await env.SESSIONS.put(
        `spear-email:${leadId}`,
        JSON.stringify(funnelState),
        { expirationTtl: 86400 * 365 }
      );
    }

    writeAudit(env, ctx, {
      route: '/v1/spear-email/reply',
      action: 'spear-email.unsubscribed',
      leadId,
    });

    return jsonResponse({
      success: true,
      funnel: funnelState,
      action: { type: 'unsubscribed', reason: 'User opted out' },
    });
  }

  const optedIn = isOptInReply(reply);
  const currentStage = funnelState.stage;
  let nextAction = { type: 'no_action', reason: 'Reply did not trigger stage advancement' };

  if (currentStage === 1 && optedIn) {
    // Stage 1 → 2: Send Quick Facts
    const facts = TIER_QUICK_FACTS[funnelState.tier] || TIER_QUICK_FACTS.middle_class;

    try {
      const sendResult = await sendEmail(env, {
        to: funnelState.email,
        subject: facts.subject,
        body: composeBody(facts.body),
        isHtml: false,
      });

      funnelState.stage = 2;
      funnelState.stageName = 'FACTS';
      funnelState.conversions.push({ stage: 1, reply, at: new Date().toISOString() });
      funnelState.emailsSent.push({
        stage: 2,
        messageId: sendResult.id,
        threadId: sendResult.threadId,
        at: new Date().toISOString(),
      });

      nextAction = {
        type: 'facts_sent',
        messageId: sendResult.id,
        subject: facts.subject,
      };
    } catch (err) {
      return errorResponse(`Facts send failed: ${err.message}`, 500);
    }

  } else if (currentStage === 2 && optedIn) {
    // Stage 2 → 4 (skip expert when reply is already positive): Send Action link
    try {
      const actionBody = `Great. Here's my calendar — pick any 15-minute slot that works for you:

https://coastalkey-pm.com/book

If a phone call is easier than a calendar, reply with a time that works and I'll call you.`;

      const sendResult = await sendEmail(env, {
        to: funnelState.email,
        subject: 'Booking link',
        body: composeBody(actionBody),
        isHtml: false,
      });

      funnelState.stage = 4;
      funnelState.stageName = 'ACTION';
      funnelState.conversions.push({ stage: 2, reply, at: new Date().toISOString() });
      funnelState.completed = true;
      funnelState.completedAt = new Date().toISOString();
      funnelState.emailsSent.push({
        stage: 4,
        messageId: sendResult.id,
        threadId: sendResult.threadId,
        at: new Date().toISOString(),
      });

      nextAction = {
        type: 'booking_link_sent',
        messageId: sendResult.id,
      };
    } catch (err) {
      return errorResponse(`Booking send failed: ${err.message}`, 500);
    }
  }

  funnelState.updatedAt = new Date().toISOString();

  if (env.SESSIONS) {
    await env.SESSIONS.put(
      `spear-email:${leadId}`,
      JSON.stringify(funnelState),
      { expirationTtl: 86400 * 90 }
    );
  }

  writeAudit(env, ctx, {
    route: '/v1/spear-email/reply',
    action: 'spear-email.reply-processed',
    leadId,
    stage: funnelState.stage,
    optedIn,
  });

  return jsonResponse({
    success: true,
    funnel: funnelState,
    action: nextAction,
  });
}

/**
 * GET /v1/spear-email/status/:leadId
 */
export async function handleSpearEmailStatus(leadId, env) {
  if (!env.SESSIONS) {
    return errorResponse('Sessions KV not available', 503);
  }

  const stored = await env.SESSIONS.get(`spear-email:${leadId}`);
  if (!stored) {
    return errorResponse('No active SPEAR-Email funnel for this lead', 404);
  }

  return jsonResponse(JSON.parse(stored));
}

/**
 * GET /v1/spear-email/dashboard
 */
export function handleSpearEmailDashboard() {
  return jsonResponse({
    system: 'SPEAR-Email Funnel',
    version: '1.0',
    owner: 'SEN Division',
    channel: 'email',
    tcpa: 'not-applicable (email is out of TCPA scope)',
    canSpam: 'compliant (physical address + unsubscribe footer)',
    tiers: Object.keys(TIER_QUICK_FACTS),
    provider: 'Gmail API (OAuth 2.0)',
    stages: [
      { id: 1, name: 'SPEAR', description: 'Short personal email' },
      { id: 2, name: 'FACTS', description: 'Quick Facts on interest reply' },
      { id: 3, name: 'EXPERT', description: '72-hour no-reply follow-up' },
      { id: 4, name: 'ACTION', description: 'Booking link on second interest signal' },
    ],
  });
}
