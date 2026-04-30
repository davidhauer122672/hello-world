/**
 * Email Operations — 20 AI Email Agents
 *
 * 4 Squads × 5 Agents:
 *   INTAKE   — Inbound email classification, routing, priority scoring
 *   COMPOSE  — Outbound email drafting, templates, personalization
 *   NURTURE  — Drip sequences, follow-ups, re-engagement
 *   MONITOR  — Deliverability, bounce tracking, compliance
 *
 * Routes:
 *   GET  /v1/email/agents         — List all 20 email agents
 *   GET  /v1/email/agents/:id     — Get single email agent
 *   POST /v1/email/compose        — AI-compose an email via Claude
 *   POST /v1/email/classify       — Classify/score inbound email
 *   GET  /v1/email/dashboard      — Email operations dashboard
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

const EMAIL_SQUADS = {
  INTAKE:  { name: 'Inbound Processing', color: '#4f8fff', mission: 'Classify, route, and prioritize all inbound email for the enterprise.' },
  COMPOSE: { name: 'Outbound Composition', color: '#22c55e', mission: 'Draft, personalize, and optimize outbound email across all divisions.' },
  NURTURE: { name: 'Sequence Automation', color: '#eab308', mission: 'Manage drip campaigns, follow-up sequences, and re-engagement flows.' },
  MONITOR: { name: 'Deliverability & Compliance', color: '#ef4444', mission: 'Monitor deliverability, bounce rates, spam scores, and CAN-SPAM/TCPA compliance.' },
};

const EMAIL_AGENTS = [
  // ── INTAKE SQUAD (5) ──
  { id: 'EM-I01', name: 'Classifier', squad: 'INTAKE', role: 'Email Classification Engine', description: 'Classifies inbound emails into categories: lead inquiry, client request, vendor communication, financial, legal, spam. Routes to appropriate division.', status: 'active', triggers: ['New inbound email'], outputs: ['Classification label', 'Priority score', 'Routing recommendation'] },
  { id: 'EM-I02', name: 'Priority', squad: 'INTAKE', role: 'Priority Scoring', description: 'Scores inbound email urgency 1-10 based on sender reputation, subject keywords, client status, and time sensitivity.', status: 'active', triggers: ['Email classified'], outputs: ['Priority score 1-10', 'SLA assignment'] },
  { id: 'EM-I03', name: 'Extractor', squad: 'INTAKE', role: 'Entity Extraction', description: 'Extracts structured data from emails: names, phone numbers, property addresses, dollar amounts, dates, action items.', status: 'active', triggers: ['Email classified'], outputs: ['Extracted entities JSON', 'Airtable field mapping'] },
  { id: 'EM-I04', name: 'Responder', squad: 'INTAKE', role: 'Auto-Response Generator', description: 'Generates immediate acknowledgment responses for high-priority inbound emails. Confirms receipt and sets expectations.', status: 'active', triggers: ['Priority >= 7'], outputs: ['Draft auto-response', 'Send confirmation'] },
  { id: 'EM-I05', name: 'Sentinel Link', squad: 'INTAKE', role: 'Lead Intake Bridge', description: 'Bridges email inquiries to the Sentinel lead pipeline. Creates Airtable lead records from qualifying email contacts.', status: 'active', triggers: ['Classification: lead inquiry'], outputs: ['New lead record', 'Audit trail entry'] },

  // ── COMPOSE SQUAD (5) ──
  { id: 'EM-C01', name: 'Architect', squad: 'COMPOSE', role: 'Email Template Architect', description: 'Maintains and generates email templates for all divisions: sales, onboarding, maintenance, investor relations, marketing.', status: 'active', triggers: ['Template request'], outputs: ['HTML email template', 'Plain text fallback'] },
  { id: 'EM-C02', name: 'Wordsmith', squad: 'COMPOSE', role: 'AI Copywriter', description: 'Drafts email body copy via Claude inference. Adapts tone for segment: luxury, investor, residential, commercial.', status: 'active', triggers: ['Compose request'], outputs: ['Email draft', 'Subject line variants', 'AI Log entry'] },
  { id: 'EM-C03', name: 'Personalizer', squad: 'COMPOSE', role: 'Dynamic Personalization', description: 'Injects recipient-specific data into templates: name, property address, service zone, account status, recent interactions.', status: 'active', triggers: ['Template + recipient data'], outputs: ['Personalized email', 'Merge field report'] },
  { id: 'EM-C04', name: 'Subject Line', squad: 'COMPOSE', role: 'Subject Line Optimizer', description: 'Generates and A/B tests subject lines. Optimizes for open rates using historical performance data.', status: 'active', triggers: ['Email draft ready'], outputs: ['3 subject line variants', 'Predicted open rates'] },
  { id: 'EM-C05', name: 'Compliance Check', squad: 'COMPOSE', role: 'Pre-Send Compliance', description: 'Validates outbound emails against CAN-SPAM, TCPA, and fair housing regulations before sending.', status: 'active', triggers: ['Email queued for send'], outputs: ['Compliance pass/fail', 'Required modifications'] },

  // ── NURTURE SQUAD (5) ──
  { id: 'EM-N01', name: 'Sequencer', squad: 'NURTURE', role: 'Drip Sequence Manager', description: 'Manages multi-touch email sequences: 6-touch Retell outbound, 14-day nurture, investor escalation, onboarding.', status: 'active', triggers: ['Lead enters sequence'], outputs: ['Next touch scheduled', 'Sequence step updated'] },
  { id: 'EM-N02', name: 'Follow-Up', squad: 'NURTURE', role: 'Intelligent Follow-Up', description: 'Detects stale leads and generates contextual follow-up emails based on last interaction and lead score.', status: 'active', triggers: ['No response 72h', 'Task overdue'], outputs: ['Follow-up draft', 'Escalation alert'] },
  { id: 'EM-N03', name: 'Re-Engage', squad: 'NURTURE', role: 'Re-Engagement Campaigns', description: 'Targets cold leads (90+ days inactive) with personalized re-engagement content based on original inquiry.', status: 'active', triggers: ['Lead inactive 90d'], outputs: ['Re-engagement email', 'Win-back offer'] },
  { id: 'EM-N04', name: 'Milestone', squad: 'NURTURE', role: 'Milestone Triggers', description: 'Sends automated emails at client milestones: welcome, 30-day check-in, quarterly review, anniversary, inspection complete.', status: 'active', triggers: ['Milestone date reached'], outputs: ['Milestone email', 'Client satisfaction check'] },
  { id: 'EM-N05', name: 'Scheduler', squad: 'NURTURE', role: 'Send-Time Optimizer', description: 'Determines optimal send times per recipient based on timezone, historical open patterns, and day-of-week analysis.', status: 'active', triggers: ['Email queued'], outputs: ['Optimal send time', 'Timezone adjustment'] },

  // ── MONITOR SQUAD (5) ──
  { id: 'EM-M01', name: 'Deliverability', squad: 'MONITOR', role: 'Deliverability Monitor', description: 'Tracks inbox placement rates, SPF/DKIM/DMARC status, and sender reputation for coastalkey-pm.com domain.', status: 'active', triggers: ['Hourly scan'], outputs: ['Deliverability score', 'Authentication status'] },
  { id: 'EM-M02', name: 'Bounce Handler', squad: 'MONITOR', role: 'Bounce Processing', description: 'Processes hard and soft bounces. Updates contact records, flags invalid emails, manages suppression list.', status: 'active', triggers: ['Bounce notification'], outputs: ['Contact status update', 'Suppression list update'] },
  { id: 'EM-M03', name: 'Spam Guard', squad: 'MONITOR', role: 'Spam Score Analyzer', description: 'Pre-scans outbound emails for spam triggers: keyword density, link ratios, image-to-text ratio, authentication headers.', status: 'active', triggers: ['Pre-send check'], outputs: ['Spam score 0-10', 'Improvement suggestions'] },
  { id: 'EM-M04', name: 'Analytics', squad: 'MONITOR', role: 'Email Analytics Engine', description: 'Aggregates email performance metrics: open rates, click rates, reply rates, conversion rates by campaign and segment.', status: 'active', triggers: ['Daily rollup'], outputs: ['Performance dashboard', 'Trend analysis'] },
  { id: 'EM-M05', name: 'Unsubscribe', squad: 'MONITOR', role: 'Unsubscribe & Compliance', description: 'Processes unsubscribe requests within 24 hours. Maintains suppression lists. Ensures CAN-SPAM footer compliance.', status: 'active', triggers: ['Unsubscribe request'], outputs: ['Suppression update', 'Compliance confirmation'] },
];

// ── Route Handlers ──

export function handleListEmailAgents(url) {
  let agents = [...EMAIL_AGENTS];
  const squad = url.searchParams.get('squad');
  const status = url.searchParams.get('status');

  if (squad) agents = agents.filter(a => a.squad === squad.toUpperCase());
  if (status) agents = agents.filter(a => a.status === status);

  return jsonResponse({
    totalAgents: EMAIL_AGENTS.length,
    filtered: agents.length,
    squads: Object.entries(EMAIL_SQUADS).map(([id, s]) => ({
      id, ...s, count: EMAIL_AGENTS.filter(a => a.squad === id).length,
    })),
    agents,
  });
}

export function handleGetEmailAgent(agentId) {
  const agent = EMAIL_AGENTS.find(a => a.id === agentId.toUpperCase());
  if (!agent) return errorResponse(`Email Agent ${agentId} not found`, 404);
  return jsonResponse({ ...agent, squad: { id: agent.squad, ...EMAIL_SQUADS[agent.squad] } });
}

export async function handleEmailCompose(request, env, ctx) {
  const body = await request.json();
  const { to, subject, brief, tone = 'professional', segment = 'general', template = null } = body;

  if (!brief) return errorResponse('brief is required', 400);

  const systemPrompt = `You are the Coastal Key Property Management email composition engine. Write a professional business email.
Tone: ${tone}. Segment: ${segment}. ${template ? `Template style: ${template}.` : ''}
Write ONLY the email body (no subject line, no greeting prefix). Use proper paragraph breaks.
Sign off as "Coastal Key Property Management" unless otherwise specified.`;

  // Use Claude inference via the anthropic service
  const { inference } = await import('../services/anthropic.js');
  const result = await inference(env, {
    system: systemPrompt,
    prompt: `Compose an email for: ${brief}${to ? `\nRecipient context: ${to}` : ''}${subject ? `\nSubject: ${subject}` : ''}`,
    tier: 'standard',
    maxTokens: 1500,
    cacheKey: null,
  });

  writeAudit(env, ctx, '/v1/email/compose', {
    action: 'email_compose',
    segment,
    tone,
    brief: brief.substring(0, 200),
  });

  return jsonResponse({
    draft: {
      to: to || null,
      subject: subject || `Re: ${brief.substring(0, 60)}`,
      body: result.content,
      tone,
      segment,
    },
    model: result.model,
    agent: 'EM-C02 Wordsmith',
  });
}

export async function handleEmailClassify(request, env, ctx) {
  const body = await request.json();
  const { from, subject, bodyText } = body;

  if (!subject && !bodyText) return errorResponse('subject or bodyText required', 400);

  const { inference } = await import('../services/anthropic.js');
  const result = await inference(env, {
    system: `You are an email classification engine for Coastal Key Property Management. Classify the email and return JSON only:
{"category":"lead_inquiry|client_request|vendor|financial|legal|marketing|internal|spam","priority":1-10,"division":"EXC|SEN|OPS|INT|MKT|FIN|VEN|TEC","summary":"one sentence","entities":{"names":[],"phones":[],"addresses":[],"amounts":[],"dates":[]},"suggestedAction":"brief action recommendation"}`,
    prompt: `From: ${from || 'unknown'}\nSubject: ${subject || 'none'}\nBody: ${(bodyText || '').substring(0, 2000)}`,
    tier: 'fast',
    maxTokens: 500,
    cacheKey: null,
  });

  let classification;
  try {
    classification = JSON.parse(result.content);
  } catch {
    classification = { raw: result.content, parseError: true };
  }

  writeAudit(env, ctx, '/v1/email/classify', {
    action: 'email_classify',
    from,
    subject,
    category: classification.category,
    priority: classification.priority,
  });

  return jsonResponse({
    classification,
    agent: 'EM-I01 Classifier',
    model: result.model,
  });
}

export function handleEmailDashboard() {
  const bySquad = {};
  const byStatus = { active: 0, standby: 0 };

  for (const a of EMAIL_AGENTS) {
    bySquad[a.squad] = (bySquad[a.squad] || 0) + 1;
    byStatus[a.status] = (byStatus[a.status] || 0) + 1;
  }

  return jsonResponse({
    fleetSize: EMAIL_AGENTS.length,
    squads: Object.entries(EMAIL_SQUADS).map(([id, s]) => ({
      id,
      name: s.name,
      mission: s.mission,
      agentCount: EMAIL_AGENTS.filter(a => a.squad === id).length,
    })),
    byStatus,
    capabilities: [
      'Inbound classification & routing',
      'AI-powered email composition via Claude',
      'Dynamic personalization & merge fields',
      'Multi-touch drip sequences',
      'Deliverability monitoring',
      'CAN-SPAM/TCPA compliance enforcement',
      'Bounce handling & suppression management',
      'Send-time optimization',
      'Subject line A/B testing',
      'Email analytics & performance tracking',
    ],
    timestamp: new Date().toISOString(),
  });
}
