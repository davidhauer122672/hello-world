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

const VALID_AGENT_TYPES = new Set(['inbound', 'outbound']);
const DEFAULT_SAMPLE_SIZE = 20;
const MAX_SAMPLE_SIZE = 100;

export async function handleRetellTune(request, env, ctx) {
  const body = await request.json();
  const agentType = body.agentType;
  if (!agentType || !VALID_AGENT_TYPES.has(agentType)) {
    return errorResponse('"agentType" required: "inbound" or "outbound".', 400);
  }
  const sampleSize = Math.min(Math.max(1, Number(body.sampleSize) || DEFAULT_SAMPLE_SIZE), MAX_SAMPLE_SIZE);

  const leads = await listRecords(env, TABLES.LEADS, {
    maxRecords: sampleSize, sort: 'Date Captured',
    fields: ['Lead Name', 'Phone Number', 'Call Disposition', 'Sentinel Segment', 'Service Zone', 'Inquiry Notes', 'Sequence Step', 'Lead Source', 'Date Captured', 'Status'],
  });
  const failedCalls = await listRecords(env, TABLES.MISSED_FAILED_CALLS, {
    maxRecords: sampleSize, sort: 'Call Timestamp',
    fields: ['Call Reference', 'Phone Number', 'Failure Reason', 'Call Duration (seconds)', 'Transcript', 'Call Direction', 'Sentinel Segment', 'Service Zone', 'QA Status'],
  });

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

  const system = buildTuningSystemPrompt(agentType);
  const prompt = buildTuningUserPrompt(agentType, callDataBlock, leads.length, failedCalls.length);

  const result = await inference(env, {
    system, prompt, tier: 'advanced', maxTokens: 4096,
    cacheKey: `retell-tune:${agentType}:${sampleSize}:${Date.now().toString(36).slice(0, -3)}`,
    cacheTtl: 1800,
  });

  writeAudit(env, ctx, { route: '/v1/retell/tune', agentType, sampleSize, engagedCount: leads.length, failedCount: failedCalls.length, model: result.model, cached: result.cached });

  return jsonResponse({
    agentType, optimizedPrompt: result.content,
    analysis: { engagedCallsAnalyzed: leads.length, failedCallsAnalyzed: failedCalls.length, sampleSize },
    model: result.model, cached: result.cached, usage: result.usage,
    generatedAt: new Date().toISOString(),
  });
}

export async function handleRetellPerformance(_request, env, ctx) {
  const [leads, failedCalls] = await Promise.all([
    listRecords(env, TABLES.LEADS, {
      maxRecords: 100, sort: 'Date Captured',
      fields: ['Call Disposition', 'Sentinel Segment', 'Service Zone', 'Inquiry Notes', 'Date Captured', 'Lead Source', 'Status'],
    }),
    listRecords(env, TABLES.MISSED_FAILED_CALLS, {
      maxRecords: 100, sort: 'Call Timestamp',
      fields: ['Failure Reason', 'Call Duration (seconds)', 'Call Direction', 'Sentinel Segment', 'Service Zone', 'Transcript'],
    }),
  ]);

  const totalEngaged = leads.length;
  const totalFailed = failedCalls.length;
  const totalCalls = totalEngaged + totalFailed;
  const bookedCount = leads.filter((r) => extractName(r.fields['Call Disposition']) === 'Booked').length;
  const bookingRate = totalEngaged > 0 ? bookedCount / totalEngaged : 0;

  const durations = failedCalls.map((r) => r.fields['Call Duration (seconds)']).filter((d) => typeof d === 'number' && d > 0);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

  const objectionCounts = {};
  failedCalls.forEach((r) => {
    const reason = extractName(r.fields['Failure Reason']);
    if (reason) objectionCounts[reason] = (objectionCounts[reason] || 0) + 1;
  });
  const topObjections = Object.entries(objectionCounts).sort((a, b) => b[1] - a[1]).map(([reason, count]) => ({ reason, count }));

  const zoneStats = {};
  leads.forEach((r) => {
    const zone = extractName(r.fields['Service Zone']);
    if (!zone) return;
    if (!zoneStats[zone]) zoneStats[zone] = { total: 0, booked: 0 };
    zoneStats[zone].total += 1;
    if (extractName(r.fields['Call Disposition']) === 'Booked') zoneStats[zone].booked += 1;
  });
  const bestPerformingZones = Object.entries(zoneStats).map(([zone, stats]) => ({
    zone, totalCalls: stats.total, booked: stats.booked,
    bookingRate: stats.total > 0 ? +(stats.booked / stats.total).toFixed(3) : 0,
  })).sort((a, b) => b.bookingRate - a.bookingRate);

  const dispositionCounts = {};
  leads.forEach((r) => {
    const disp = extractName(r.fields['Call Disposition']) || 'Unknown';
    dispositionCounts[disp] = (dispositionCounts[disp] || 0) + 1;
  });
  const segmentCounts = {};
  leads.forEach((r) => {
    const seg = extractName(r.fields['Sentinel Segment']) || 'Unclassified';
    segmentCounts[seg] = (segmentCounts[seg] || 0) + 1;
  });

  const metrics = {
    summary: {
      totalCalls, totalEngaged, totalFailed,
      bookingRate: +bookingRate.toFixed(3), bookedCount,
      avgFailedCallDuration: avgDuration,
    },
    topObjections, bestPerformingZones,
    dispositionBreakdown: dispositionCounts,
    segmentBreakdown: segmentCounts,
    generatedAt: new Date().toISOString(),
  };

  writeAudit(env, ctx, { route: '/v1/retell/performance', totalCalls, bookingRate: +bookingRate.toFixed(3) });
  return jsonResponse(metrics);
}

function extractName(field) {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'object' && field.name) return field.name;
  return '';
}

function buildTuningSystemPrompt(agentType) {
  const agentContext = agentType === 'inbound'
    ? `You are optimizing the INBOUND Retell voice agent for Coastal Key Property Management. This agent handles incoming calls from prospective property owners on Florida's Treasure Coast who are inquiring about professional property management services.`
    : `You are optimizing the OUTBOUND Retell voice agent (Sentinel cold-caller) for Coastal Key Property Management. This agent makes proactive calls to property owners on Florida's Treasure Coast — Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie, Jensen Beach, Palm City, Stuart, Hobe Sound, Jupiter, and North Palm Beach.`;

  return [
    `You are the Retell Prompt Tuning Architect for Coastal Key Property Management.`,
    '', agentContext, '',
    `Your task is to analyze real call performance data and produce an optimized Retell agent prompt. Output must be production-ready.`,
    '',
    `Treasure Coast property management market context:`,
    `- Primary segments: Absentee Homeowners, Luxury Property ($1M+), Investors/Family Offices, Seasonal/Snowbirds, STR/Vacation Rentals`,
    `- Common objections: "I already have a manager", "Your fees are too high", "I can manage it myself", "Send info first"`,
    `- Coastal Key differentiators: Full-service concierge, 24/7 maintenance response, local Treasure Coast expertise, transparent owner portal, investor-grade reporting`,
    `- Peak seasons: October-April (snowbird season), summer vacation rental bookings`,
  ].join('\n');
}

function buildTuningUserPrompt(agentType, callDataBlock, engagedCount, failedCount) {
  const agentLabel = agentType === 'inbound' ? 'Inbound Inquiry' : 'Outbound Sentinel';
  return [
    `Analyze the following ${agentLabel} call data (${engagedCount} engaged, ${failedCount} failed) and produce:`,
    '',
    `## ANALYSIS`,
    `1. Objection Patterns — rank by frequency`,
    `2. Drop-off Points — where prospects disengage`,
    `3. Winning Hooks — language patterns that lead to bookings`,
    `4. Segment Performance — which segments convert best`,
    `5. Zone Insights — geographic patterns in success`,
    '',
    `## OPTIMIZED RETELL PROMPT`,
    `Produce a complete, production-ready Retell voice agent system prompt for the ${agentLabel} agent.`,
    '',
    `## CALL DATA`,
    callDataBlock,
  ].join('\n');
}
