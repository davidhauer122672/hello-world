/**
 * MCCO Routes — Sovereign Marketing & Sales Command API
 *
 *   GET  /v1/mcco/status              — MCCO system status and fleet overview
 *   GET  /v1/mcco/brand               — Brand config, values, differentiators
 *   GET  /v1/mcco/pillars             — 5 Content Pillars framework
 *   GET  /v1/mcco/pipeline            — Follower-to-buyer conversion pipeline
 *   POST /v1/mcco/audience-psychology  — Generate audience psychology breakdown
 *   POST /v1/mcco/positioning          — Generate brand positioning strategy
 *   POST /v1/mcco/content-calendar     — Generate 30-day content calendar
 *   POST /v1/mcco/social-post          — Generate high-engagement social post
 *   POST /v1/mcco/monetization         — Generate monetization strategy
 *   GET  /v1/mcco/dashboard            — Full MCCO command dashboard
 */

import { MCCO_AGENTS } from '../agents/agents-mcco.js';
import {
  generateAudiencePsychology,
  generatePositioningStrategy,
  generateContentCalendar,
  generateSocialPost,
  generateMonetizationStrategy,
  getMCCOBrandConfig,
  getContentPillars,
  getConversionPipeline,
} from '../services/mcco-strategy.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/mcco/status ─────────────────────────────────────────────────────

export function handleMCCOStatus() {
  const mcco = MCCO_AGENTS.find(a => a.id === 'SOV-001');
  const revenueCmd = MCCO_AGENTS.find(a => a.id === 'SOV-002');

  return jsonResponse({
    status: 'operational',
    governance: 'sovereign',
    commander: {
      id: mcco.id,
      name: mcco.name,
      role: mcco.role,
      status: mcco.status,
      directReports: mcco.directReports,
      commandScope: mcco.commandScope,
      capabilityCount: Object.keys(mcco.capabilities).length,
    },
    chiefStrategist: {
      id: revenueCmd.id,
      name: revenueCmd.name,
      role: revenueCmd.role,
      status: revenueCmd.status,
    },
    fleetSize: MCCO_AGENTS.length,
    capabilities: Object.keys(mcco.capabilities),
    contentPillars: mcco.capabilities.contentPillars.pillars.map(p => p.name),
    revenueStreams: mcco.capabilities.monetizationStrategy.revenueStreams.length,
    audienceSegments: revenueCmd.capabilities.audienceTargeting.segments.map(s => s.name),
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/mcco/brand ──────────────────────────────────────────────────────

export function handleMCCOBrand() {
  return jsonResponse({
    brand: getMCCOBrandConfig(),
    governance: 'sovereign',
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/mcco/pillars ────────────────────────────────────────────────────

export function handleMCCOPillars() {
  return jsonResponse({
    ...getContentPillars(),
    governance: 'sovereign',
    generatedBy: 'SOV-001',
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/mcco/pipeline ───────────────────────────────────────────────────

export function handleMCCOPipeline() {
  return jsonResponse({
    ...getConversionPipeline(),
    governance: 'sovereign',
    generatedBy: 'SOV-001',
    timestamp: new Date().toISOString(),
  });
}

// ── POST /v1/mcco/audience-psychology ───────────────────────────────────────

export async function handleAudiencePsychology(request, env, ctx) {
  try {
    let segment = 'Absentee Luxury Homeowners';
    try {
      const body = await request.json();
      if (body.segment) segment = body.segment;
    } catch {
      // Use default segment
    }

    writeAudit(env, ctx, {
      route: '/v1/mcco/audience-psychology',
      action: 'generate',
      agent: 'SOV-001',
      segment,
    });

    const result = await generateAudiencePsychology(env, segment);

    return jsonResponse({
      segment,
      analysis: result,
      governance: 'sovereign',
      generatedBy: 'SOV-001',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('MCCO audience-psychology error:', err);
    return errorResponse(`MCCO audience psychology generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/positioning ───────────────────────────────────────────────

export async function handlePositioning(request, env, ctx) {
  try {
    writeAudit(env, ctx, {
      route: '/v1/mcco/positioning',
      action: 'generate',
      agent: 'SOV-001',
    });

    const result = await generatePositioningStrategy(env);

    return jsonResponse({
      strategy: result,
      governance: 'sovereign',
      generatedBy: 'SOV-001',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('MCCO positioning error:', err);
    return errorResponse(`MCCO positioning strategy generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/content-calendar ──────────────────────────────────────────

export async function handleContentCalendar(request, env, ctx) {
  try {
    let month = null;
    let year = null;
    try {
      const body = await request.json();
      month = body.month || null;
      year = body.year || null;
    } catch {
      // Use defaults
    }

    writeAudit(env, ctx, {
      route: '/v1/mcco/content-calendar',
      action: 'generate',
      agent: 'SOV-001',
      month,
      year,
    });

    const result = await generateContentCalendar(env, month, year);

    return jsonResponse({
      calendar: result,
      month: month || new Date().toLocaleString('en-US', { month: 'long' }),
      year: year || new Date().getFullYear(),
      deliveredTo: 'MKT-041 (CMO)',
      governance: 'sovereign',
      generatedBy: 'SOV-001',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('MCCO content-calendar error:', err);
    return errorResponse(`MCCO content calendar generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/social-post ───────────────────────────────────────────────

export async function handleSocialPost(request, env, ctx) {
  try {
    let topic = 'Coastal Key AI-Powered Property Management';
    let platform = 'Instagram';
    let goal = 'engagement';
    try {
      const body = await request.json();
      if (body.topic) topic = body.topic;
      if (body.platform) platform = body.platform;
      if (body.goal) goal = body.goal;
    } catch {
      // Use defaults
    }

    const validPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)', 'YouTube', 'TikTok'];
    if (!validPlatforms.includes(platform)) {
      return errorResponse(`Invalid platform "${platform}". Valid: ${validPlatforms.join(', ')}`, 400);
    }

    const validGoals = ['reach', 'trust-building', 'lead-generation', 'conversion', 'engagement'];
    if (!validGoals.includes(goal)) {
      return errorResponse(`Invalid goal "${goal}". Valid: ${validGoals.join(', ')}`, 400);
    }

    writeAudit(env, ctx, {
      route: '/v1/mcco/social-post',
      action: 'generate',
      agent: 'SOV-001',
      topic,
      platform,
      goal,
    });

    const result = await generateSocialPost(env, topic, platform, goal);

    return jsonResponse({
      post: result,
      topic,
      platform,
      goal,
      governance: 'sovereign',
      generatedBy: 'SOV-001',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('MCCO social-post error:', err);
    return errorResponse(`MCCO social post generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/monetization ──────────────────────────────────────────────

export async function handleMonetization(request, env, ctx) {
  try {
    writeAudit(env, ctx, {
      route: '/v1/mcco/monetization',
      action: 'generate',
      agent: 'SOV-001',
    });

    const result = await generateMonetizationStrategy(env);

    return jsonResponse({
      strategy: result,
      governance: 'sovereign',
      generatedBy: 'SOV-001',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('MCCO monetization error:', err);
    return errorResponse(`MCCO monetization strategy generation failed: ${err.message}`, 500);
  }
}

// ── GET /v1/mcco/dashboard ──────────────────────────────────────────────────

export function handleMCCODashboard() {
  const mcco = MCCO_AGENTS.find(a => a.id === 'SOV-001');
  const revenueCmd = MCCO_AGENTS.find(a => a.id === 'SOV-002');

  return jsonResponse({
    governance: 'sovereign',
    commander: {
      id: mcco.id,
      name: mcco.name,
      role: mcco.role,
      status: mcco.status,
      tier: mcco.tier,
    },
    chiefStrategist: {
      id: revenueCmd.id,
      name: revenueCmd.name,
      role: revenueCmd.role,
      status: revenueCmd.status,
      tier: revenueCmd.tier,
    },
    chainOfCommand: {
      level1: 'MCCO Sovereign (SOV-001) — Master Chief Commanding Officer',
      level2a: 'CMO (MKT-041) — Chief Marketing Officer, reports to MCCO',
      level2b: 'Revenue Commander (SOV-002) — Chief Sales Strategist, reports to MCCO',
      level3a: 'MKT Division — 40 Marketing Agents, commanded by CMO',
      level3b: 'SEN Division — 40 Sentinel Sales Agents, commanded by Revenue Commander',
    },
    capabilities: {
      audiencePsychology: 'POST /v1/mcco/audience-psychology',
      brandPositioning: 'POST /v1/mcco/positioning',
      contentCalendar: 'POST /v1/mcco/content-calendar',
      socialPostGenerator: 'POST /v1/mcco/social-post',
      monetizationStrategy: 'POST /v1/mcco/monetization',
      brandConfig: 'GET /v1/mcco/brand',
      contentPillars: 'GET /v1/mcco/pillars',
      conversionPipeline: 'GET /v1/mcco/pipeline',
    },
    contentPillars: getContentPillars().pillars.map(p => ({ id: p.id, name: p.name, frequency: p.frequency })),
    conversionPipeline: getConversionPipeline().pipeline.map(s => ({ stage: s.stage, name: s.name, targetConversion: s.targetConversion })),
    revenueStreams: mcco.capabilities.monetizationStrategy.revenueStreams.map(r => ({ name: r.name, type: r.type, priceRange: r.priceRange })),
    audienceSegments: revenueCmd.capabilities.audienceTargeting.segments.map(s => ({ name: s.name, demographics: s.demographics })),
    competitorAnalysis: revenueCmd.capabilities.competitorIntelligence.competitors,
    growthPhases: revenueCmd.capabilities.growthStrategy.phases,
    kpis: [...mcco.kpis, ...revenueCmd.kpis],
    timestamp: new Date().toISOString(),
  });
}
