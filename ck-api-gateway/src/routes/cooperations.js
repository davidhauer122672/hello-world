/**
 * Cooperations Committee Routes — CEO External Engagement Coordination
 *
 *   GET  /v1/coop/committee      — Committee charter, squads, and KPI dashboard
 *   GET  /v1/coop/agents         — List all 10 COOP agents
 *   GET  /v1/coop/agents/:id     — Get single COOP agent
 *   POST /v1/coop/brief          — Generate CEO cooperation brief (meeting prep, contact profiles)
 *   POST /v1/coop/outreach       — Draft outreach message for a target contact
 *   POST /v1/coop/network-map    — Generate relationship network analysis
 *   GET  /v1/coop/targets        — List target contact categories and priorities
 *   POST /v1/coop/schedule       — Propose a meeting for CEO calendar
 */

import { COOP_AGENTS, COOPERATIONS_COMMITTEE } from '../agents/agents-coop.js';
import { inference } from '../services/anthropic.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const _coopById = new Map(COOP_AGENTS.map(a => [a.id, a]));

// ── GET /v1/coop/committee ─────────────────────────────────────────────────

export function handleCoopCommittee() {
  return jsonResponse({
    committee: COOPERATIONS_COMMITTEE,
    agents: COOP_AGENTS.length,
    squads: Object.keys(COOPERATIONS_COMMITTEE.squads).length,
    status: 'operational',
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/coop/agents ────────────────────────────────────────────────────

export function handleListCoopAgents(url) {
  let agents = [...COOP_AGENTS];

  const squad = url.searchParams.get('squad');
  if (squad) {
    agents = agents.filter(a => a.squad.toLowerCase() === squad.toLowerCase());
  }

  return jsonResponse({ agents, count: agents.length });
}

// ── GET /v1/coop/agents/:id ────────────────────────────────────────────────

export function handleGetCoopAgent(agentId) {
  const agent = _coopById.get(agentId.toUpperCase());
  if (!agent) return errorResponse(`COOP agent "${agentId}" not found.`, 404);
  return jsonResponse(agent);
}

// ── POST /v1/coop/brief ────────────────────────────────────────────────────

export async function handleCoopBrief(request, env, ctx) {
  const body = await request.json();
  const { contactName, contactRole, company, meetingType, context } = body;

  if (!contactName) return errorResponse('"contactName" is required.', 400);

  const prompt = `Generate a CEO preparation brief for David Hauer, Founder and CEO of Coastal Key Property Management, for an upcoming ${meetingType || 'meeting'} with:

Contact: ${contactName}
Role: ${contactRole || 'Not specified'}
Company: ${company || 'Not specified'}
Context: ${context || 'General business development'}

Coastal Key is an AI-powered property management enterprise on Florida's Treasure Coast. David manages 383 AI agents, a 149-endpoint API gateway, and is building the dominant AI property management platform nationally.

Provide:
1. Three conversation opening hooks (warm, specific, non-generic)
2. Key talking points about Coastal Key that would resonate with this contact
3. Questions to ask the contact that demonstrate genuine interest
4. Potential collaboration or mutual benefit opportunities
5. Follow-up action items to propose during the meeting
6. One sentence that positions David as the AI property management thought leader

Keep it concise and actionable. CEO reads this 2 hours before the meeting.`;

  const result = await inference(env, {
    system: 'You are the Coastal Key CEO Briefer (COOP-010). You prepare concise, high-impact meeting preparation briefs for the CEO. Your tone is strategic, direct, and actionable. No filler. Every sentence earns its place.',
    prompt,
    tier: 'standard',
    maxTokens: 2000,
  });

  writeAudit(env, ctx, {
    route: '/v1/coop/brief',
    agent: 'COOP-010',
    contactName,
    company,
  });

  return jsonResponse({
    agent: 'COOP-010 (CEO Briefer)',
    contact: contactName,
    company,
    meetingType: meetingType || 'meeting',
    brief: result.content,
    model: result.model,
    generated: new Date().toISOString(),
  });
}

// ── POST /v1/coop/outreach ─────────────────────────────────────────────────

export async function handleCoopOutreach(request, env, ctx) {
  const body = await request.json();
  const { contactName, contactRole, company, channel, purpose, mutualConnection } = body;

  if (!contactName || !purpose) {
    return errorResponse('"contactName" and "purpose" are required.', 400);
  }

  const prompt = `Draft a warm outreach message from David Hauer, Founder and CEO of Coastal Key Property Management, to:

Contact: ${contactName}
Role: ${contactRole || 'Not specified'}
Company: ${company || 'Not specified'}
Channel: ${channel || 'email'}
Purpose: ${purpose}
${mutualConnection ? `Mutual Connection: ${mutualConnection}` : ''}

Coastal Key operates a 383-agent AI fleet managing properties on Florida's Treasure Coast. David is building the dominant AI-powered property management platform nationally.

Rules:
- Warm, not cold. Reference shared context or mutual connections if available.
- Under 150 words for email, under 80 words for LinkedIn.
- One clear ask or proposed next step.
- No sales pitch. Position as peer conversation.
- Signature: David Hauer | Founder & CEO | Coastal Key Property Management | coastalkey-pm.com`;

  const result = await inference(env, {
    system: 'You are Bridge Builder (COOP-002). You craft warm, personalized outreach messages for the CEO. Your messages feel like they came from a human who did their homework. Never generic. Always specific.',
    prompt,
    tier: 'standard',
    maxTokens: 800,
  });

  writeAudit(env, ctx, {
    route: '/v1/coop/outreach',
    agent: 'COOP-002',
    contactName,
    channel: channel || 'email',
    purpose,
  });

  return jsonResponse({
    agent: 'COOP-002 (Bridge Builder)',
    contact: contactName,
    channel: channel || 'email',
    purpose,
    message: result.content,
    model: result.model,
    generated: new Date().toISOString(),
  });
}

// ── POST /v1/coop/network-map ──────────────────────────────────────────────

export async function handleCoopNetworkMap(request, env, ctx) {
  const body = await request.json();
  const { contacts, focusArea } = body;

  if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
    return errorResponse('"contacts" array is required with at least one entry.', 400);
  }

  const contactList = contacts.map((c, i) =>
    `${i + 1}. ${c.name} — ${c.role || 'Unknown role'} at ${c.company || 'Unknown'} (${c.relationship || 'new'})`
  ).join('\n');

  const prompt = `Analyze the following CEO relationship network for David Hauer, CEO of Coastal Key Property Management:

${contactList}

${focusArea ? `Focus Area: ${focusArea}` : 'Analyze across all strategic categories.'}

Provide:
1. Network strength assessment (strong/moderate/weak per category)
2. Critical gaps — which categories of contacts are missing?
3. Top 3 relationships to deepen (highest strategic value)
4. Top 3 new relationship types to pursue (fill the biggest gaps)
5. Cross-connection opportunities (which existing contacts can introduce new ones)
6. Quarterly action plan for network strengthening

Categories to assess: Acquisition Targets, Referral Partners, Technology Partners, Investors, Municipal Leaders, Industry Associations, Media/Influencers, Vendor Network.`;

  const result = await inference(env, {
    system: 'You are Network Mapper (COOP-008). You analyze relationship networks with the precision of a venture capital firm mapping founder networks. Every recommendation is actionable and tied to revenue or strategic outcomes.',
    prompt,
    tier: 'advanced',
    maxTokens: 3000,
  });

  writeAudit(env, ctx, {
    route: '/v1/coop/network-map',
    agent: 'COOP-008',
    contactCount: contacts.length,
    focusArea,
  });

  return jsonResponse({
    agent: 'COOP-008 (Network Mapper)',
    contactsAnalyzed: contacts.length,
    focusArea: focusArea || 'all categories',
    analysis: result.content,
    model: result.model,
    generated: new Date().toISOString(),
  });
}

// ── GET /v1/coop/targets ───────────────────────────────────────────────────

export function handleCoopTargets() {
  return jsonResponse({
    targetCategories: COOPERATIONS_COMMITTEE.targetCategories,
    operatingPrinciples: COOPERATIONS_COMMITTEE.operatingPrinciples,
    ceoTimeConstraints: {
      maxHoursPerWeek: 8,
      maxMeetingsPerWeek: 6,
      preferredTimes: ['10:00-12:00 ET', '14:00-16:00 ET'],
      blackoutDays: ['Sunday'],
      bufferBetweenMeetings: '30 minutes',
    },
  });
}

// ── POST /v1/coop/schedule ─────────────────────────────────────────────────

export function handleCoopSchedule(request) {
  return request.json().then(body => {
    const { contactName, date, time, duration, location, purpose } = body;

    if (!contactName || !date || !purpose) {
      return errorResponse('"contactName", "date", and "purpose" are required.', 400);
    }

    // Validate against CEO time constraints
    const meetingDay = new Date(date).getDay();
    if (meetingDay === 0) {
      return errorResponse('Sunday is a blackout day. No meetings scheduled on Sundays.', 400);
    }

    return jsonResponse({
      agent: 'COOP-005 (Calendar Command)',
      status: 'proposed',
      meeting: {
        contact: contactName,
        date,
        time: time || '10:00 AM ET',
        duration: duration || '30 minutes',
        location: location || 'Virtual / Zoom',
        purpose,
      },
      nextSteps: [
        'Meeting proposal logged',
        'CEO approval required via Agent-6 (CEO Gate)',
        'Upon approval: calendar invite sent, pre-meeting brief generated 2 hours before',
        'Post-meeting: follow-up drafted by COOP-007 within 24 hours',
      ],
      timestamp: new Date().toISOString(),
    });
  });
}
