/**
 * Retell Tuning Route — AI-driven prompt optimization for Retell voice agents.
 *
 *   POST /v1/retell/tune        — Analyze recent call data and generate an optimized Retell agent prompt
 *   GET  /v1/retell/performance  — Return call performance metrics from Leads + Missed/Failed Calls
 *
 * Pulls call records from Airtable, runs them through Claude for pattern
 * analysis, and returns an optimized prompt with supporting metrics.
 * Designed for Coastal Key Property Management's Treasure Coast market.
 */

import { inference } from '../services/anthropic.js';
import { listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Valid agent types for tuning ──
const VALID_AGENT_TYPES = new Set(['inbound', 'outbound']);

// ── Default sample size for call analysis ──
const DEFAULT_SAMPLE_SIZE = 20;
const MAX_SAMPLE_SIZE = 100;

/**
 * POST /v1/retell/tune — Analyze recent call data and generate an optimized Retell agent prompt.
 *
 * Request body:
 *   agentType  (string, required) — "inbound" | "outbound"
 *   sampleSize (number, optional) — Number of recent calls to analyze (default 20, max 100)
 *
 * @param {Request} request
 * @param {object} env — Worker env bindings
 * @param {object} ctx — Execution context (for waitUntil)
 * @returns {Response} — Optimized prompt and performance analysis
 */
export async function handleRetellTune(request, env, ctx) {
  const body = await request.json();

  // ── Validate agentType ──
  const agentType = body.agentType;
  if (!agentType || !VALID_AGENT_TYPES.has(agentType)) {
    return errorResponse(
      '"agentType" is required and must be "inbound" or "outbound".',
      400,
    );
  }

  const sampleSize = Math.min(
    Math.max(1, Number(body.sampleSize) || DEFAULT_SAMPLE_SIZE),
    MAX_SAMPLE_SIZE,
  );

  // ── Fetch recent leads (engaged calls) ──
  const leads = await listRecords(env, TABLES.LEADS, {
    maxRecords: sampleSize,
    sort: 'Date Captured',
    fields: [
      'Lead Name',
      'Phone Number',
      'Call Disposition',
      'Sentinel Segment',
      'Service Zone',
      'Inquiry Notes',
      'Sequence Step',
      'Lead Source',
      'Date Captured',
      'Status',
    ],
  });

  // ── Fetch recent missed/failed calls ──
  const failedCalls = await listRecords(env, TABLES.MISSED_FAILED_CALLS, {
    maxRecords: sampleSize,
    sort: 'Call Timestamp',
    fields: [
      'Call Reference',
      'Phone Number',
      'Failure Reason',
      'Call Duration (seconds)',
      'Transcript',
      'Call Direction',
      'Sentinel Segment',
      'Service Zone',
      'QA Status',
    ],
  });

  // ── Build call data summary for Claude ──
  const engagedSummaries = leads.map((r) => {
    const f = r.fields;
    return [
      `- Disposition: ${extractName(f['Call Disposition'])}`,
      `  Segment: ${extractName(f['Sentinel Segment'])}`,
      `  Zone: ${extractName(f['Service Zone']) || 'Unknown'}`,
      `  Status: ${extractName(f['Status'])}`,
      `  Transcript excerpt: ${(f['Inquiry Notes'] || '').slice(0, 600)}`,
    ].join('\n');
  });

  const failedSummaries = failedCalls.map((r) => {
    const f = r.fields;
    return [
      `- Failure Reason: ${extractName(f['Failure Reason'])}`,
      `  Duration: ${f['Call Duration (seconds)'] || 0}s`,
      `  Direction: ${extractName(f['Call Direction'])}`,
      `  Segment: ${extractName(f['Sentinel Segment'])}`,
      `  Zone: ${extractName(f['Service Zone']) || 'Unknown'}`,
      `  Transcript excerpt: ${(f['Transcript'] || '').slice(0, 600)}`,
    ].join('\n');
  });

  const callDataBlock = [
    `=== ENGAGED CALLS (${leads.length} records) ===`,
    engagedSummaries.join('\n\n') || '(No engaged call records found)',
    '',
    `=== FAILED/MISSED CALLS (${failedCalls.length} records) ===`,
    failedSummaries.join('\n\n') || '(No failed call records found)',
  ].join('\n');

  // ── Claude analysis prompt ──
  const system = buildTuningSystemPrompt(agentType);
  const prompt = buildTuningUserPrompt(agentType, callDataBlock, leads.length, failedCalls.length);

  const result = await inference(env, {
    system,
    prompt,
    tier: 'advanced',
    maxTokens: 4096,
    cacheKey: `retell-tune:${agentType}:${sampleSize}:${Date.now().toString(36).slice(0, -3)}`,
    cacheTtl: 1800,
  });

  // ── Audit ──
  writeAudit(env, ctx, {
    route: '/v1/retell/tune',
    agentType,
    sampleSize,
    engagedCount: leads.length,
    failedCount: failedCalls.length,
    model: result.model,
    cached: result.cached,
  });

  return jsonResponse({
    agentType,
    optimizedPrompt: result.content,
    analysis: {
      engagedCallsAnalyzed: leads.length,
      failedCallsAnalyzed: failedCalls.length,
      sampleSize,
    },
    model: result.model,
    cached: result.cached,
    usage: result.usage,
    generatedAt: new Date().toISOString(),
  });
}

/**
 * GET /v1/retell/performance — Return call performance metrics.
 *
 * Aggregates data from the Leads table and Missed/Failed Calls table
 * to produce structured performance metrics.
 *
 * @param {Request} _request
 * @param {object} env — Worker env bindings
 * @param {object} ctx — Execution context
 * @returns {Response} — Structured performance metrics JSON
 */
export async function handleRetellPerformance(_request, env, ctx) {
  // ── Fetch leads and failed calls in parallel ──
  const [leads, failedCalls] = await Promise.all([
    listRecords(env, TABLES.LEADS, {
      maxRecords: 100,
      sort: 'Date Captured',
      fields: [
        'Call Disposition',
        'Sentinel Segment',
        'Service Zone',
        'Inquiry Notes',
        'Date Captured',
        'Lead Source',
        'Status',
      ],
    }),
    listRecords(env, TABLES.MISSED_FAILED_CALLS, {
      maxRecords: 100,
      sort: 'Call Timestamp',
      fields: [
        'Failure Reason',
        'Call Duration (seconds)',
        'Call Direction',
        'Sentinel Segment',
        'Service Zone',
        'Transcript',
      ],
    }),
  ]);

  // ── Calculate metrics ──
  const totalEngaged = leads.length;
  const totalFailed = failedCalls.length;
  const totalCalls = totalEngaged + totalFailed;

  // Booking rate: leads with "Booked" disposition / total engaged
  const bookedCount = leads.filter(
    (r) => extractName(r.fields['Call Disposition']) === 'Booked',
  ).length;
  const bookingRate = totalEngaged > 0 ? bookedCount / totalEngaged : 0;

  // Average duration from failed calls (where we have explicit seconds)
  const durations = failedCalls
    .map((r) => r.fields['Call Duration (seconds)'])
    .filter((d) => typeof d === 'number' && d > 0);
  const avgDuration =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

  // Top objections: extract failure reasons and count
  const objectionCounts = {};
  failedCalls.forEach((r) => {
    const reason = extractName(r.fields['Failure Reason']);
    if (reason) {
      objectionCounts[reason] = (objectionCounts[reason] || 0) + 1;
    }
  });
  const topObjections = Object.entries(objectionCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([reason, count]) => ({ reason, count }));

  // Best performing zones: zones with highest booking rates
  const zoneStats = {};
  leads.forEach((r) => {
    const zone = extractName(r.fields['Service Zone']);
    if (!zone) return;
    if (!zoneStats[zone]) zoneStats[zone] = { total: 0, booked: 0 };
    zoneStats[zone].total += 1;
    if (extractName(r.fields['Call Disposition']) === 'Booked') {
      zoneStats[zone].booked += 1;
    }
  });
  const bestPerformingZones = Object.entries(zoneStats)
    .map(([zone, stats]) => ({
      zone,
      totalCalls: stats.total,
      booked: stats.booked,
      bookingRate: stats.total > 0 ? +(stats.booked / stats.total).toFixed(3) : 0,
    }))
    .sort((a, b) => b.bookingRate - a.bookingRate);

  // Disposition breakdown
  const dispositionCounts = {};
  leads.forEach((r) => {
    const disp = extractName(r.fields['Call Disposition']) || 'Unknown';
    dispositionCounts[disp] = (dispositionCounts[disp] || 0) + 1;
  });

  // Segment breakdown
  const segmentCounts = {};
  leads.forEach((r) => {
    const seg = extractName(r.fields['Sentinel Segment']) || 'Unclassified';
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  });

  const metrics = {
    summary: {
      totalCalls,
      totalEngaged,
      totalFailed,
      bookingRate: +bookingRate.toFixed(3),
      bookedCount,
      avgFailedCallDuration: avgDuration,
    },
    topObjections,
    bestPerformingZones,
    dispositionBreakdown: dispositionCounts,
    segmentBreakdown: segmentCounts,
    generatedAt: new Date().toISOString(),
  };

  // ── Audit ──
  writeAudit(env, ctx, {
    route: '/v1/retell/performance',
    totalCalls,
    bookingRate: +bookingRate.toFixed(3),
  });

  return jsonResponse(metrics);
}

// ── Internal helpers ────────────────────────────────────────────────

/**
 * Safely extract a name value from a field that may be a string or { name: string }.
 * @param {string|object|undefined} field
 * @returns {string}
 */
function extractName(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field.name) return field.name;
  return '';
}

/**
 * Build the system prompt for the Retell tuning analysis.
 * @param {"inbound"|"outbound"} agentType
 * @returns {string}
 */
function buildTuningSystemPrompt(agentType) {
  const agentContext =
    agentType === 'inbound'
      ? `You are optimizing the INBOUND Retell voice agent for Coastal Key Property Management. This agent handles incoming calls from prospective property owners on Florida's Treasure Coast who are inquiring about professional property management services. The agent must qualify leads, answer questions about Coastal Key's management packages, and book consultations. Callers range from absentee homeowners and snowbirds to luxury property investors and short-term rental owners.`
      : `You are optimizing the OUTBOUND Retell voice agent (Sentinel cold-caller) for Coastal Key Property Management. This agent makes proactive calls to property owners on Florida's Treasure Coast — specifically Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie, Jensen Beach, Palm City, Stuart, Hobe Sound, Jupiter, and North Palm Beach. The agent must open with a compelling hook, overcome objections about switching property managers, and secure a callback or consultation booking.`;

  return [
    `You are the Retell Prompt Tuning Architect for Coastal Key Property Management, a premium property management company serving Florida's Treasure Coast region.`,
    '',
    agentContext,
    '',
    `Your task is to analyze real call performance data and produce an optimized Retell agent prompt that directly addresses the patterns you find. Your output must be production-ready — it should be a complete Retell system prompt that can be copy-pasted into the Retell agent configuration.`,
    '',
    `Key context about the Treasure Coast property management market:`,
    `- Primary segments: Absentee Homeowners, Luxury Property ($1M+), Investors/Family Offices, Seasonal/Snowbirds, STR/Vacation Rentals`,
    `- Common objections: "I already have a manager", "Your fees are too high", "I can manage it myself", "I need to think about it", "Send me information first"`,
    `- Coastal Key differentiators: Full-service concierge, 24/7 maintenance response, local Treasure Coast expertise, transparent owner portal, investor-grade reporting`,
    `- Peak seasons: October-April (snowbird season), summer vacation rental bookings`,
  ].join('\n');
}

/**
 * Build the user prompt for the tuning analysis request.
 * @param {"inbound"|"outbound"} agentType
 * @param {string} callDataBlock
 * @param {number} engagedCount
 * @param {number} failedCount
 * @returns {string}
 */
function buildTuningUserPrompt(agentType, callDataBlock, engagedCount, failedCount) {
  const agentLabel = agentType === 'inbound' ? 'Inbound Inquiry' : 'Outbound Sentinel';

  return [
    `Analyze the following ${agentLabel} call data (${engagedCount} engaged calls, ${failedCount} failed/missed calls) and produce:`,
    '',
    `## ANALYSIS (Section 1)`,
    `1. **Objection Patterns** — What objections or resistance points appear most frequently? Rank them by frequency.`,
    `2. **Drop-off Points** — Where in the conversation flow do prospects disengage? Identify the stages (greeting, qualification, pitch, close) where calls fail.`,
    `3. **Winning Hooks** — What opening lines, value propositions, or responses correlate with successful bookings? Identify the specific language patterns that work.`,
    `4. **Segment Performance** — Which property owner segments convert best? Which need different approaches?`,
    `5. **Zone Insights** — Any geographic patterns in call success? Are certain Treasure Coast zones more responsive?`,
    '',
    `## OPTIMIZED RETELL PROMPT (Section 2)`,
    `Produce a complete, production-ready Retell voice agent system prompt for the ${agentLabel} agent that:`,
    `- Incorporates the winning hooks and language patterns you identified`,
    `- Includes specific objection-handling scripts for the top 5 objections found in the data`,
    `- Addresses the drop-off points with re-engagement techniques`,
    `- Adapts tone and pitch based on the caller's segment (if detectable)`,
    `- References Coastal Key's Treasure Coast service areas naturally`,
    `- Maintains a warm, professional, knowledgeable tone appropriate for luxury property management`,
    `- Includes clear booking/escalation triggers`,
    '',
    `## CALL DATA`,
    callDataBlock,
  ].join('\n');
}
