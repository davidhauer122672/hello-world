/**
 * Social Campaign Marketing Division (SCM) — API Routes
 *
 * Revenue-generating social media operations. Every endpoint exists to
 * move the needle from content → engagement → leads → signed clients.
 *
 * Endpoints:
 *   GET  /v1/social/agents          — List all 20 SCM agents
 *   GET  /v1/social/agents/:id      — Get single SCM agent
 *   GET  /v1/social/dashboard       — Division dashboard with pipeline metrics
 *   POST /v1/social/generate        — Generate social content via Claude
 *   POST /v1/social/campaign        — Generate full campaign brief via Claude
 *   GET  /v1/social/calendar        — Content calendar with posting schedule
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { SCM_AGENTS } from '../agents/agents-scm.js';

// ── Agent lookup index ──────────────────────────────────────────────────────

const _byId = new Map(SCM_AGENTS.map(a => [a.id, a]));

// ── Content pillars mapped to buyer journey ─────────────────────────────────

const CONTENT_PILLARS = [
  {
    pillar: 'authority',
    label: 'Industry Authority & Expertise',
    buyerStage: 'awareness',
    contentTypes: ['market insights', 'home watch tips', 'hurricane prep guides', 'property management myths debunked'],
    postingCadence: '3x/week',
    platforms: ['linkedin', 'facebook', 'youtube'],
    objective: 'Position CKPM as the most knowledgeable operator on the Treasure Coast',
  },
  {
    pillar: 'ceo-journey',
    label: 'CEO Journey & Brand Story',
    buyerStage: 'awareness-to-interest',
    contentTypes: ['founder story', 'behind-the-scenes', 'vision posts', 'milestone celebrations', 'day-in-the-life'],
    postingCadence: '2x/week',
    platforms: ['instagram', 'facebook', 'linkedin', 'tiktok'],
    objective: 'Build personal trust and emotional connection with the human behind CKPM',
  },
  {
    pillar: 'social-proof',
    label: 'Client Results & Social Proof',
    buyerStage: 'consideration',
    contentTypes: ['client testimonials', 'before/after reveals', 'review screenshots', 'case studies', 'inspection reports'],
    postingCadence: '2x/week',
    platforms: ['instagram', 'facebook', 'google-business'],
    objective: 'Prove CKPM delivers results — let clients sell for us',
  },
  {
    pillar: 'lifestyle',
    label: 'Treasure Coast Lifestyle & Community',
    buyerStage: 'interest',
    contentTypes: ['local events', 'community spotlights', 'seasonal beauty', 'real estate market updates', 'neighborhood guides'],
    postingCadence: '2x/week',
    platforms: ['instagram', 'facebook', 'tiktok', 'nextdoor'],
    objective: 'Show CKPM is embedded in the Treasure Coast community — local, not corporate',
  },
  {
    pillar: 'conversion',
    label: 'Direct Response & Lead Generation',
    buyerStage: 'decision',
    contentTypes: ['free consultation CTAs', 'lead magnet offers', 'limited-time promotions', 'pain-point posts', 'cost calculators'],
    postingCadence: '2x/week',
    platforms: ['facebook', 'instagram', 'google-business'],
    objective: 'Drive DMs, website clicks, and consultation bookings — this is where revenue happens',
  },
];

// ── Platform strategy matrix ────────────────────────────────────────────────

const PLATFORM_STRATEGY = [
  {
    platform: 'instagram',
    handle: '@coastalkey.pm',
    primaryFormats: ['reels', 'carousels', 'stories'],
    audience: 'Luxury homeowners 35-65, snowbirds, lifestyle-oriented buyers',
    postingCadence: '1-2x/day',
    bestTimes: ['7:00 AM', '12:00 PM', '7:00 PM'],
    priority: 'high',
    revenueRole: 'Visual authority + DM conversions',
  },
  {
    platform: 'facebook',
    handle: 'Coastal Key Property Management',
    primaryFormats: ['posts', 'reels', 'group-engagement', 'marketplace'],
    audience: 'Homeowners 50+, snowbirds, local community, HOA boards',
    postingCadence: '1-2x/day',
    bestTimes: ['7:00 AM', '10:00 AM', '1:00 PM'],
    priority: 'high',
    revenueRole: 'Community trust + local lead generation',
  },
  {
    platform: 'linkedin',
    handle: 'Coastal Key Property Management',
    primaryFormats: ['articles', 'posts', 'document-carousels'],
    audience: 'Investors, family offices, corporate property owners, B2B partners',
    postingCadence: '3-4x/week',
    bestTimes: ['8:00 AM', '12:00 PM'],
    priority: 'medium',
    revenueRole: 'B2B partnerships + investor leads',
  },
  {
    platform: 'youtube',
    handle: 'Coastal Key PM',
    primaryFormats: ['shorts', 'long-form-guides', 'property-walkthroughs'],
    audience: 'Research-stage homeowners, absentee owners, property investors',
    postingCadence: '2x/week',
    bestTimes: ['9:00 AM', '5:00 PM'],
    priority: 'medium',
    revenueRole: 'Long-form authority + SEO backlinks',
  },
  {
    platform: 'tiktok',
    handle: '@coastalkeypm',
    primaryFormats: ['short-form-video', 'trending-sounds', 'duets'],
    audience: 'Younger property investors 25-45, viral reach amplification',
    postingCadence: '1x/day',
    bestTimes: ['12:00 PM', '7:00 PM', '10:00 PM'],
    priority: 'medium',
    revenueRole: 'Viral reach + brand awareness for next-gen homeowners',
  },
  {
    platform: 'google-business',
    handle: 'Coastal Key Property Management',
    primaryFormats: ['posts', 'photos', 'q-and-a', 'reviews'],
    audience: 'Local searchers — "home watch near me" intent',
    postingCadence: '3x/week',
    bestTimes: ['9:00 AM'],
    priority: 'critical',
    revenueRole: 'Local search dominance — highest intent traffic',
  },
  {
    platform: 'nextdoor',
    handle: 'Coastal Key Property Management',
    primaryFormats: ['business-posts', 'recommendations', 'community-replies'],
    audience: 'Hyper-local homeowners in service zones',
    postingCadence: '2x/week',
    bestTimes: ['8:00 AM', '6:00 PM'],
    priority: 'high',
    revenueRole: 'Neighbor trust — highest conversion rate per impression',
  },
];

// ── Route handlers ──────────────────────────────────────────────────────────

/**
 * GET /v1/social/agents — List SCM agents with optional filters.
 */
export function handleListSocialAgents(url) {
  const status = url.searchParams.get('status');
  const tier = url.searchParams.get('tier');
  const search = url.searchParams.get('search')?.toLowerCase();

  let agents = [...SCM_AGENTS];

  if (status) agents = agents.filter(a => a.status === status);
  if (tier) agents = agents.filter(a => a.tier === tier);
  if (search) {
    agents = agents.filter(
      a =>
        a.name.toLowerCase().includes(search) ||
        a.role.toLowerCase().includes(search) ||
        a.id.toLowerCase().includes(search),
    );
  }

  return jsonResponse({
    division: 'SCM',
    divisionName: 'Social Campaign Marketing',
    total: agents.length,
    agents: agents.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      tier: a.tier,
      status: a.status,
      kpis: a.kpis,
    })),
  });
}

/**
 * GET /v1/social/agents/:id — Single SCM agent detail.
 */
export function handleGetSocialAgent(agentId) {
  const agent = _byId.get(agentId);
  if (!agent) return errorResponse(`Agent ${agentId} not found in SCM division`, 404);
  return jsonResponse({ agent });
}

/**
 * GET /v1/social/dashboard — Division operations dashboard.
 */
export function handleSocialDashboard() {
  const statusBreakdown = { active: 0, standby: 0, training: 0, maintenance: 0 };
  const tierBreakdown = { advanced: 0, standard: 0 };

  for (const agent of SCM_AGENTS) {
    statusBreakdown[agent.status] = (statusBreakdown[agent.status] || 0) + 1;
    tierBreakdown[agent.tier] = (tierBreakdown[agent.tier] || 0) + 1;
  }

  return jsonResponse({
    division: 'SCM',
    divisionName: 'Social Campaign Marketing',
    color: '#e11d48',
    icon: 'fire',
    mission: 'Convert social media presence into signed property management clients',
    agentCount: SCM_AGENTS.length,
    statusBreakdown,
    tierBreakdown,
    revenuePipeline: {
      stages: [
        { stage: 'strategy', agents: ['SCM-001', 'SCM-003', 'SCM-004'], status: 'active' },
        { stage: 'content-creation', agents: ['SCM-002', 'SCM-005', 'SCM-006', 'SCM-007', 'SCM-008'], status: 'active' },
        { stage: 'distribution', agents: ['SCM-009', 'SCM-012', 'SCM-018'], status: 'active' },
        { stage: 'engagement', agents: ['SCM-010', 'SCM-013', 'SCM-016'], status: 'active' },
        { stage: 'conversion', agents: ['SCM-011', 'SCM-019'], status: 'active' },
        { stage: 'revenue-tracking', agents: ['SCM-014', 'SCM-015', 'SCM-017', 'SCM-020'], status: 'active' },
      ],
    },
    contentPillars: CONTENT_PILLARS.map(p => ({
      pillar: p.pillar,
      label: p.label,
      buyerStage: p.buyerStage,
      cadence: p.postingCadence,
    })),
    platformCount: PLATFORM_STRATEGY.length,
    minimumPostingCadence: '2x/day across all platforms combined',
    operatingTempo: 'attack',
    sla: {
      commentResponseTime: '60 minutes',
      dmResponseTime: '30 minutes',
      contentProductionCycle: '24 hours from brief to publish',
      weeklyRevenueReport: 'Every Friday by 5 PM',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /v1/social/calendar — Content calendar with posting schedule.
 */
export function handleSocialCalendar(url) {
  const days = parseInt(url.searchParams.get('days') || '7', 10);
  const platform = url.searchParams.get('platform');

  const calendar = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().slice(0, 10);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });

    const daySlots = [];

    for (const pillar of CONTENT_PILLARS) {
      daySlots.push({
        date: dateStr,
        dayOfWeek,
        pillar: pillar.pillar,
        buyerStage: pillar.buyerStage,
        platforms: platform ? pillar.platforms.filter(p => p === platform) : pillar.platforms,
        contentTypes: pillar.contentTypes,
        status: 'scheduled',
        assignedAgents: {
          strategy: 'SCM-003',
          copy: 'SCM-007',
          visual: pillar.pillar === 'ceo-journey' ? 'SCM-006' : 'SCM-005',
          discovery: 'SCM-008',
          publishing: 'SCM-009',
        },
      });
    }

    calendar.push({
      date: dateStr,
      dayOfWeek,
      totalPosts: daySlots.length,
      slots: daySlots,
    });
  }

  return jsonResponse({
    division: 'SCM',
    generatedBy: 'SCM-009 Cadence Controller',
    calendarDays: days,
    platformFilter: platform || 'all',
    totalScheduledPosts: calendar.reduce((sum, day) => sum + day.totalPosts, 0),
    calendar,
  });
}

/**
 * POST /v1/social/generate — Generate social content via Claude.
 */
export async function handleSocialGenerate(request, env, ctx) {
  const body = await request.json().catch(() => null);
  if (!body) return errorResponse('Request body required', 400);

  const {
    pillar = 'authority',
    platform = 'instagram',
    contentType = 'post',
    topic = '',
    tone = 'professional-but-approachable',
    count = 1,
  } = body;

  const pillarConfig = CONTENT_PILLARS.find(p => p.pillar === pillar) || CONTENT_PILLARS[0];
  const platformConfig = PLATFORM_STRATEGY.find(p => p.platform === platform) || PLATFORM_STRATEGY[0];

  const systemPrompt = `You are SCM-007 Copy Chief for Coastal Key Property Management (CKPM), an AI-powered home watch and property management company on Florida's Treasure Coast (Vero Beach to North Palm Beach).

COMPANY STATE: Launch phase. 0 clients. NHWA accredited. First 2 prospects targeted. AI-powered operations (330 agents) is our unmatched competitive moat.

BRAND VOICE: Professional but approachable. Luxury without pretension. Local expertise with enterprise capability. Confident without arrogance. The neighbor who happens to run the most technologically advanced property management firm on the Treasure Coast.

CONTENT PILLAR: ${pillarConfig.label}
BUYER STAGE: ${pillarConfig.buyerStage}
OBJECTIVE: ${pillarConfig.objective}

PLATFORM: ${platformConfig.platform}
FORMATS: ${platformConfig.primaryFormats.join(', ')}
AUDIENCE: ${platformConfig.audience}

CONTENT TYPE: ${contentType}
TONE: ${tone}
COUNT: ${count} piece(s)

CEO JOURNEY CONTEXT:
- Founder launched CKPM with a vision to bring enterprise-grade AI to Treasure Coast property management
- Building a 330-agent AI fleet — the first of its kind in the home watch industry
- Personal commitment to the Treasure Coast community
- NHWA accredited — meeting the highest industry standards
- Mission: give absentee homeowners complete peace of mind through technology + personal care

COMPETITORS (never mention by name, only position against):
- House Check International (Port St. Lucie), Oceanside Home Watch (Vero Beach),
  Island Home & Estate Management (Jupiter Island), Argos Homewatch (Stuart),
  First Mate Home Watch (PSL/Stuart)
- None use AI. Market is fragmented. CKPM is the technology disruptor.

RULES:
1. Every post must have a scroll-stopping hook (first line/3 seconds)
2. Every post must include a clear CTA (DM us, link in bio, comment below, call now)
3. Never use generic filler — every sentence earns its place
4. Write for the platform's native style and format constraints
5. Include hashtag recommendations (5-15 per post, mix of branded + community + reach)
6. For video scripts: include hook, body, CTA, and suggested visual direction
7. For carousels: outline each slide with text + visual direction
8. Treasure Coast specific — reference actual neighborhoods, landmarks, and seasonal patterns`;

  const userMessage = topic
    ? `Create ${count} ${contentType}(s) for ${platform} about: ${topic}`
    : `Create ${count} ${contentType}(s) for ${platform} using the ${pillar} content pillar. Choose the most impactful topic for generating leads right now.`;

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
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return errorResponse(`Claude API error: ${errText}`, 502);
    }

    const result = await response.json();

    if (env.AUDIT_LOG) {
      const key = `scm:content:${Date.now()}`;
      ctx.waitUntil(
        env.AUDIT_LOG.put(
          key,
          JSON.stringify({
            action: 'social-content-generated',
            pillar,
            platform,
            contentType,
            count,
            timestamp: new Date().toISOString(),
          }),
          { expirationTtl: 86400 * 90 },
        ),
      );
    }

    return jsonResponse({
      division: 'SCM',
      generatedBy: 'SCM-007 Copy Chief',
      reviewedBy: 'SCM-003 Content Strategist',
      pillar: pillarConfig.label,
      platform: platformConfig.platform,
      contentType,
      count,
      content: result.content[0]?.text || '',
      model: result.model,
      usage: result.usage,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Content generation failed: ${err.message}`, 500);
  }
}

/**
 * POST /v1/social/campaign — Generate a full campaign brief via Claude.
 */
export async function handleSocialCampaign(request, env, ctx) {
  const body = await request.json().catch(() => null);
  if (!body || !body.objective) {
    return errorResponse('Request body with "objective" field required', 400);
  }

  const {
    objective,
    duration = '7 days',
    budget = 'organic-only',
    targetAudience = 'Treasure Coast absentee homeowners',
    platforms = PLATFORM_STRATEGY.map(p => p.platform),
  } = body;

  const systemPrompt = `You are SCM-001 Campaign Commander for Coastal Key Property Management (CKPM).

COMPANY STATE: Launch phase. 0 current clients. NHWA accredited. AI-powered (330 agents). First 2 prospects targeted. Revenue = $0. Every campaign must generate leads that become paying clients.

You design aggressive, revenue-focused social media campaigns. You do not create campaigns for brand awareness alone — every campaign must have a clear path to signed clients.

AVAILABLE PLATFORMS: ${platforms.join(', ')}
CONTENT PILLARS: Authority, CEO Journey, Social Proof, Lifestyle, Conversion
POSTING CADENCE: Minimum 2x/day across all platforms combined

COMPETITIVE LANDSCAPE:
5 known competitors on Treasure Coast — none use AI. Market is fragmented (47+ operators). CKPM enters as technology disruptor.

CAMPAIGN PARAMETERS:
- Objective: ${objective}
- Duration: ${duration}
- Budget: ${budget}
- Target audience: ${targetAudience}

Produce a battle-ready campaign brief:
1. CAMPAIGN NAME — Memorable, internal codename
2. OBJECTIVE & KPI TARGET — One number that defines success
3. TARGET AUDIENCE PROFILE — Psychographics, not just demographics
4. CONTENT CALENDAR — Day-by-day posting plan with platform, format, pillar, topic, and CTA
5. HOOK BANK — 10 scroll-stopping hooks for this campaign
6. CTA STRATEGY — Primary and secondary CTAs, where they lead
7. LEAD CAPTURE MECHANISM — How engagement converts to contact info
8. PAID AMPLIFICATION PLAN — Even if organic-only, note what to boost if budget opens
9. A/B TEST PLAN — What to test during this campaign
10. SUCCESS METRICS — Daily tracking dashboard
11. CONTINGENCY — What to do if engagement is below target by day 3

Be specific. Use actual platform features. Reference Treasure Coast geography. No generic marketing advice.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-6',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: body.additionalContext
          ? `Design a campaign for: ${objective}. Additional context: ${body.additionalContext}`
          : `Design a complete social media campaign for: ${objective}`
        }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return errorResponse(`Claude API error: ${errText}`, 502);
    }

    const result = await response.json();

    if (env.AUDIT_LOG) {
      const key = `scm:campaign:${Date.now()}`;
      ctx.waitUntil(
        env.AUDIT_LOG.put(
          key,
          JSON.stringify({
            action: 'campaign-brief-generated',
            objective,
            duration,
            budget,
            platforms: platforms.length,
            timestamp: new Date().toISOString(),
          }),
          { expirationTtl: 86400 * 90 },
        ),
      );
    }

    return jsonResponse({
      division: 'SCM',
      generatedBy: 'SCM-001 Campaign Commander',
      objective,
      duration,
      budget,
      targetAudience,
      platforms,
      campaignBrief: result.content[0]?.text || '',
      model: result.model,
      usage: result.usage,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Campaign generation failed: ${err.message}`, 500);
  }
}
