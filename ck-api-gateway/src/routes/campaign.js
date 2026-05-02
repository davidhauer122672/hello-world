/**
 * Campaign Routes — Peak-Time Intelligence Engine API
 *
 * Enterprise Mass Production Campaign #1
 *
 *   GET  /v1/campaign/peak-time/dashboard      — Campaign engine dashboard
 *   GET  /v1/campaign/peak-time/schedule        — Generate posting schedule
 *   GET  /v1/campaign/peak-time/next-slots      — Next posting slots per platform
 *   GET  /v1/campaign/peak-time/matrix          — Platform scheduling matrix
 *   GET  /v1/campaign/peak-time/dst             — DST status and transitions
 *   GET  /v1/campaign/peak-time/bulletin        — All Points Bulletin
 *   GET  /v1/campaign/peak-time/publish-status   — Claude AI publishing status
 *   POST /v1/campaign/peak-time/schedule-post   — Schedule single post via Claude AI
 *   POST /v1/campaign/peak-time/schedule-batch  — Schedule batch of posts
 *   GET  /v1/campaign/peak-time/smo             — Sovereign Marketing Officer status
 *   GET  /v1/campaign/peak-time/market-analysis — Full market analysis
 *   GET  /v1/campaign/peak-time/problems        — Top 10 problems table
 *   GET  /v1/campaign/peak-time/offers          — Landing page offers
 *   GET  /v1/campaign/peak-time/distribution    — 30-day distribution plan
 *   POST /v1/campaign/peak-time/smo/analyze     — AI market analysis via Claude
 *   GET  /v1/campaign/peak-time/division/:code  — Division-specific schedule
 *   POST /v1/campaign/peak-time/validate-slot   — Validate a posting slot
 *   GET  /v1/campaign/peak-time/weekly-counts   — Weekly post counts per platform
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';
import {
  getCampaignDashboard,
  generateScheduleSlots, getAllNextSlots, getWeeklyPostCounts, validateSlot,
  PLATFORMS, getDSTTransitions, isEDT, getTimezoneLabel,
  getPublishConfigStatus, schedulePost, scheduleBatch,
  getSMOStatus, generateSMOAnalysisPrompt,
  getMarketAnalysis, getProblemsAnalysis, getLandingPageOffers, getDistributionPlan,
} from '../engines/campaign/index.js';
import { generateSchedule, getDivisionSchedule, generateAllPointsBulletin, TARGET_DEMOGRAPHIC } from '../engines/peak-time-intelligence.js';

// ── GET /v1/campaign/peak-time/dashboard ───────────────────────────────────

export function handleCampaignPeakTimeDashboard() {
  return jsonResponse(getCampaignDashboard());
}

// ── GET /v1/campaign/peak-time/schedule ────────────────────────────────────

export function handleCampaignSchedule(url) {
  const params = url.searchParams;
  const startDate = params.get('start') || new Date().toISOString().split('T')[0];
  const days = parseInt(params.get('days') || '30', 10);
  const platformsParam = params.get('platforms');
  const platforms = platformsParam ? platformsParam.split(',') : null;

  const slots = generateScheduleSlots(startDate, Math.min(days, 90), platforms);

  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine',
    startDate,
    days: Math.min(days, 90),
    platforms: platforms || Object.keys(PLATFORMS),
    totalPosts: slots.length,
    schedule: slots,
    targetDemographic: TARGET_DEMOGRAPHIC,
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/campaign/peak-time/next-slots ──────────────────────────────────

export function handleCampaignNextSlots() {
  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine',
    nextSlots: getAllNextSlots(),
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/campaign/peak-time/matrix ──────────────────────────────────────

export function handleCampaignMatrix() {
  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine',
    targetDemographic: TARGET_DEMOGRAPHIC,
    platforms: PLATFORMS,
    weeklyPostCounts: getWeeklyPostCounts(),
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/campaign/peak-time/dst ─────────────────────────────────────────

export function handleCampaignDST(url) {
  const year = parseInt(url.searchParams.get('year') || new Date().getFullYear(), 10);
  const now = new Date();

  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine — DST Handler',
    current: {
      isEDT: isEDT(now),
      timezone: getTimezoneLabel(now),
      utcNow: now.toISOString(),
    },
    transitions: getDSTTransitions(year),
    rule: 'April through October → EDT (UTC-4). November through March → EST (UTC-5). Auto-applied to every post timestamp.',
    timestamp: now.toISOString(),
  });
}

// ── GET /v1/campaign/peak-time/bulletin ────────────────────────────────────

export function handleCampaignBulletin(env, ctx) {
  const bulletin = generateAllPointsBulletin();

  writeAudit(env, ctx, {
    route: '/v1/campaign/peak-time/bulletin',
    action: 'all-points-bulletin-generated',
    bulletinId: bulletin.bulletinId,
  });

  return jsonResponse(bulletin);
}

// ── GET /v1/campaign/peak-time/publish-status ──────────────────────────────

export function handleCampaignPublishStatus(env) {
  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine — Claude AI Publishing',
    ...getPublishConfigStatus(env),
    timestamp: new Date().toISOString(),
  });
}

// ── POST /v1/campaign/peak-time/schedule-post ──────────────────────────────

export async function handleCampaignSchedulePost(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { platform, text, scheduledAt, mediaUrl, link } = body;
  if (!platform || !text || !scheduledAt) {
    return errorResponse('Fields "platform", "text", and "scheduledAt" are required.', 400);
  }

  const result = await schedulePost(env, {
    platform,
    text,
    scheduledAt: new Date(scheduledAt),
    mediaUrl,
    link,
  });

  writeAudit(env, ctx, {
    route: '/v1/campaign/peak-time/schedule-post',
    action: 'post-scheduled',
    platform,
    success: result.success,
    mode: result.mode,
  });

  return jsonResponse(result);
}

// ── POST /v1/campaign/peak-time/schedule-batch ─────────────────────────────

export async function handleCampaignScheduleBatch(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { posts } = body;
  if (!Array.isArray(posts) || posts.length === 0) {
    return errorResponse('Field "posts" must be a non-empty array.', 400);
  }

  const formattedPosts = posts.map(p => ({
    ...p,
    scheduledAt: new Date(p.scheduledAt),
  }));

  const result = await scheduleBatch(env, formattedPosts);

  writeAudit(env, ctx, {
    route: '/v1/campaign/peak-time/schedule-batch',
    action: 'batch-scheduled',
    totalPosts: result.totalPosts,
    scheduled: result.scheduled,
    errors: result.errors,
  });

  return jsonResponse(result);
}

// ── GET /v1/campaign/peak-time/smo ─────────────────────────────────────────

export function handleCampaignSMO() {
  return jsonResponse(getSMOStatus());
}

// ── POST /v1/campaign/peak-time/smo/analyze ────────────────────────────────

export async function handleCampaignSMOAnalyze(request, env, ctx) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    // Use defaults
  }

  const { businessType = 'all' } = body;
  const prompt = generateSMOAnalysisPrompt(businessType);

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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/campaign/peak-time/smo/analyze',
      action: 'smo-analysis-generated',
      agent: 'SMO-001',
      businessType,
    });

    return jsonResponse({
      generatedBy: 'SMO-001 — Sovereign Marketing Officer',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      businessType,
      analysis: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`SMO analysis failed: ${err.message}`, 500);
  }
}

// ── GET /v1/campaign/peak-time/market-analysis ─────────────────────────────

export function handleCampaignMarketAnalysis() {
  return jsonResponse(getMarketAnalysis());
}

// ── GET /v1/campaign/peak-time/problems ────────────────────────────────────

export function handleCampaignProblems() {
  return jsonResponse(getProblemsAnalysis());
}

// ── GET /v1/campaign/peak-time/offers ──────────────────────────────────────

export function handleCampaignOffers() {
  return jsonResponse(getLandingPageOffers());
}

// ── GET /v1/campaign/peak-time/distribution ────────────────────────────────

export function handleCampaignDistribution(url) {
  const startDate = url.searchParams.get('start') || new Date().toISOString().split('T')[0];
  return jsonResponse(getDistributionPlan(startDate));
}

// ── GET /v1/campaign/peak-time/division/:code ──────────────────────────────

export function handleCampaignDivisionSchedule(divisionCode, url) {
  const params = url.searchParams;
  const startDate = params.get('start') || new Date().toISOString().split('T')[0];
  const days = parseInt(params.get('days') || '30', 10);

  const schedule = getDivisionSchedule(divisionCode.toUpperCase(), {
    startDate,
    days: Math.min(days, 90),
    campaignId: 'CAMPAIGN-001',
  });

  return jsonResponse(schedule);
}

// ── POST /v1/campaign/peak-time/validate-slot ──────────────────────────────

export async function handleCampaignValidateSlot(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { platform, date, hour, minute } = body;
  if (!platform || !date || hour === undefined) {
    return errorResponse('Fields "platform", "date", and "hour" are required.', 400);
  }

  const result = validateSlot(platform, date, hour, minute || 0);
  return jsonResponse(result);
}

// ── GET /v1/campaign/peak-time/weekly-counts ───────────────────────────────

export function handleCampaignWeeklyCounts() {
  return jsonResponse({
    engine: 'Peak-Time Intelligence Engine',
    ...getWeeklyPostCounts(),
    timestamp: new Date().toISOString(),
  });
}
