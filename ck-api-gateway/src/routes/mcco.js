/**
 * MCCO Routes — Master Chief Commanding Officer of Marketing & Sales
 *
 * Sovereign-Level Governance | Ferrari-Standard Execution
 *
 *   GET  /v1/mcco/command        — MCCO Sovereign command dashboard
 *   GET  /v1/mcco/agents         — List all 15 MCCO agents
 *   GET  /v1/mcco/agents/:id     — Get single MCCO agent
 *   POST /v1/mcco/directive      — Issue sovereign directive to MKT/SEN divisions
 *   GET  /v1/mcco/fleet-status   — Fleet inspection across governed divisions
 *   POST /v1/mcco/content-calendar — Generate 30-day content calendar
 *   POST /v1/mcco/audience-profile — Generate audience psychology profile
 *   POST /v1/mcco/positioning    — Generate authority positioning strategy
 *   POST /v1/mcco/monetization   — Generate audience monetization plan
 *   POST /v1/mcco/post           — Generate high-engagement social media post
 */

import { MCCO_AGENTS } from '../agents/agents-mcco.js';
import { getAgentsByDivision } from '../agents/registry.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Prebuilt index ──────────────────────────────────────────────────────────

const _mccoById = new Map(MCCO_AGENTS.map(a => [a.id, a]));

// ── GET /v1/mcco/agents ─────────────────────────────────────────────────────

export function handleListMCCOAgents(url) {
  const params = url.searchParams;
  const statusFilter = params.get('status');
  const searchQuery = params.get('search');

  let agents = [...MCCO_AGENTS];

  if (statusFilter) {
    agents = agents.filter(a => a.status === statusFilter);
  }

  if (searchQuery) {
    const lower = searchQuery.toLowerCase();
    agents = agents.filter(
      a =>
        (a.name && a.name.toLowerCase().includes(lower)) ||
        (a.description && a.description.toLowerCase().includes(lower)) ||
        (a.role && a.role.toLowerCase().includes(lower)),
    );
  }

  return jsonResponse({
    agents,
    count: agents.length,
    governance: 'sovereign',
    executionStandard: 'ferrari',
  });
}

// ── GET /v1/mcco/agents/:id ─────────────────────────────────────────────────

export function handleGetMCCOAgent(agentId) {
  const agent = _mccoById.get(agentId);
  if (!agent) {
    return errorResponse(`MCCO agent "${agentId}" not found.`, 404);
  }
  return jsonResponse({ agent });
}

// ── GET /v1/mcco/command ────────────────────────────────────────────────────

export function handleMCCOCommand() {
  const mktAgents = getAgentsByDivision('MKT');
  const senAgents = getAgentsByDivision('SEN');

  const countByStatus = (agents) => {
    const counts = { active: 0, standby: 0, training: 0, maintenance: 0 };
    for (const a of agents) {
      if (a.status in counts) counts[a.status]++;
    }
    return counts;
  };

  return jsonResponse({
    commander: {
      id: 'MCCO-000',
      name: 'MCCO Sovereign',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      status: 'active',
    },
    mccoFleet: {
      total: MCCO_AGENTS.length,
      byStatus: countByStatus(MCCO_AGENTS),
      agents: MCCO_AGENTS.map(a => ({ id: a.id, name: a.name, role: a.role, status: a.status })),
    },
    governedDivisions: {
      MKT: {
        name: 'Marketing',
        total: mktAgents.length,
        byStatus: countByStatus(mktAgents),
      },
      SEN: {
        name: 'Sentinel Sales',
        total: senAgents.length,
        byStatus: countByStatus(senAgents),
      },
    },
    totalGovernedAgents: MCCO_AGENTS.length + mktAgents.length + senAgents.length,
    hierarchy: {
      level0: 'CEO (Human)',
      level1: 'MCCO-000 Sovereign (AI)',
      level2: 'CMO (EXC Division)',
      level3: ['MKT Division (47 agents)', 'SEN Division (40 agents)'],
    },
    contentPillars: [
      {
        pillar: 'AI-Powered Protection',
        description: 'Showcase how Coastal Key uses AI to deliver superior home watch and property management — inspection automation, predictive maintenance, 24/7 monitoring.',
        audienceConnection: 'Addresses the core fear of absentee homeowners: "What is happening to my property when I am not there?" Positions CK as the technological leader.',
        exampleTopics: [
          'How AI catches what human inspectors miss',
          'Inside our 360-agent fleet protecting your property',
          'The technology behind zero-surprise property management',
        ],
      },
      {
        pillar: 'Treasure Coast Lifestyle',
        description: 'Content celebrating the Treasure Coast lifestyle — seasonal living, waterfront properties, community events, and local insights that attract and retain property owners.',
        audienceConnection: 'Builds emotional connection with seasonal residents and snowbirds who love the area. Makes CK feel like a trusted local partner, not just a service provider.',
        exampleTopics: [
          'Why Stuart is the hidden gem of Florida\'s coast',
          'Seasonal homeowner guide: preparing your property for summer',
          'Best waterfront living on the Treasure Coast',
        ],
      },
      {
        pillar: 'CEO Journey & Company Culture',
        description: 'The founder story, company milestones, team culture, behind-the-scenes operations, and the mission driving Coastal Key to transform property management.',
        audienceConnection: 'People buy from people they trust. Sharing the CEO journey humanizes the brand and builds an emotional bond that competitors cannot replicate.',
        exampleTopics: [
          'Why I built a 360-agent AI fleet for property management',
          'From zero to 290 AI agents: the Coastal Key story',
          'What no one tells you about building an AI-powered service company',
        ],
      },
      {
        pillar: 'Property Owner Education',
        description: 'Expert guides, tips, and insights that help property owners protect their investment — insurance, maintenance, vendor management, seasonal prep, and market trends.',
        audienceConnection: 'Positions Coastal Key as the authority. Educated prospects convert faster because they understand the value. This pillar builds trust before the sales conversation.',
        exampleTopics: [
          '5 things every absentee homeowner must check monthly',
          'Hurricane season property prep: the complete checklist',
          'How to avoid the 3 costliest property management mistakes',
        ],
      },
      {
        pillar: 'Results & Social Proof',
        description: 'Client success stories, testimonials, before/after transformations, case studies, and quantifiable results that prove Coastal Key delivers.',
        audienceConnection: 'Eliminates buyer skepticism. When prospects see real results from real clients, the trust gap closes. This pillar converts fence-sitters into customers.',
        exampleTopics: [
          'How we saved a client $47K with one AI-detected leak',
          'Client spotlight: 3 years of worry-free absentee ownership',
          'From 12 vendor issues to zero: a Coastal Key case study',
        ],
      },
    ],
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/mcco/fleet-status ───────────────────────────────────────────────

export function handleMCCOFleetStatus() {
  const mktAgents = getAgentsByDivision('MKT');
  const senAgents = getAgentsByDivision('SEN');
  const allGoverned = [...MCCO_AGENTS, ...mktAgents, ...senAgents];

  const ferrariScore = (agents) => {
    const active = agents.filter(a => a.status === 'active').length;
    return Math.round((active / Math.max(agents.length, 1)) * 100);
  };

  return jsonResponse({
    fleetInspection: {
      timestamp: new Date().toISOString(),
      inspector: 'MCCO-014 Quality Shield',
      executionStandard: 'ferrari',
    },
    divisions: {
      MCCO: {
        name: 'MCCO Command',
        agents: MCCO_AGENTS.length,
        ferrariScore: ferrariScore(MCCO_AGENTS),
        status: ferrariScore(MCCO_AGENTS) >= 90 ? 'ferrari-compliant' : 'needs-attention',
      },
      MKT: {
        name: 'Marketing',
        agents: mktAgents.length,
        ferrariScore: ferrariScore(mktAgents),
        status: ferrariScore(mktAgents) >= 90 ? 'ferrari-compliant' : 'needs-attention',
      },
      SEN: {
        name: 'Sentinel Sales',
        agents: senAgents.length,
        ferrariScore: ferrariScore(senAgents),
        status: ferrariScore(senAgents) >= 90 ? 'ferrari-compliant' : 'needs-attention',
      },
    },
    overallFerrariScore: ferrariScore(allGoverned),
    totalAgentsGoverned: allGoverned.length,
    agentsByStatus: {
      active: allGoverned.filter(a => a.status === 'active').length,
      standby: allGoverned.filter(a => a.status === 'standby').length,
      training: allGoverned.filter(a => a.status === 'training').length,
      maintenance: allGoverned.filter(a => a.status === 'maintenance').length,
    },
  });
}

// ── POST /v1/mcco/directive ─────────────────────────────────────────────────

export async function handleMCCODirective(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { directive, targetDivision, priority = 'standard' } = body;

  if (!directive) {
    return errorResponse('Field "directive" is required.', 400);
  }

  if (targetDivision && !['MKT', 'SEN', 'MCCO'].includes(targetDivision)) {
    return errorResponse('targetDivision must be "MKT", "SEN", or "MCCO".', 400);
  }

  const validPriorities = ['standard', 'urgent', 'sovereign-override'];
  if (!validPriorities.includes(priority)) {
    return errorResponse(`Invalid priority. Valid: ${validPriorities.join(', ')}`, 400);
  }

  const timestamp = new Date().toISOString();
  const directiveId = `MCCO-DIR-${Date.now()}`;

  // Log to audit
  writeAudit(env, ctx, {
    route: '/v1/mcco/directive',
    action: 'sovereign-directive',
    directiveId,
    directive,
    targetDivision: targetDivision || 'ALL',
    priority,
    issuedBy: 'MCCO-000',
  });

  return jsonResponse({
    directiveId,
    issuedBy: 'MCCO-000 — MCCO Sovereign',
    governance: 'sovereign',
    priority,
    targetDivision: targetDivision || 'ALL (MKT + SEN)',
    directive,
    status: 'issued',
    timestamp,
  });
}

// ── POST /v1/mcco/content-calendar ──────────────────────────────────────────

export async function handleMCCOContentCalendar(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { month, year, platforms = ['instagram', 'facebook', 'linkedin', 'x', 'tiktok'] } = body;

  if (!month || !year) {
    return errorResponse('Fields "month" and "year" are required.', 400);
  }

  const prompt = `You are MCCO-004 "Calendar Command" — the 30-Day Content Calendar Commander for Coastal Key Property Management, operating at Ferrari-Standard execution under Sovereign governance.

Generate a complete 30-day content calendar for ${month}/${year} across these platforms: ${platforms.join(', ')}.

Coastal Key is an AI-leveraged home watch and property management company serving the Treasure Coast of Florida (Stuart, Jensen Beach, Palm City, Hobe Sound, Jupiter, Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie).

Target audiences: Absentee homeowners, seasonal residents/snowbirds, luxury property investors, single-family homeowners.

Content Pillars:
1. AI-Powered Protection — How CK uses AI for superior property management
2. Treasure Coast Lifestyle — Celebrating the area and seasonal living
3. CEO Journey & Company Culture — Behind the scenes, founder story
4. Property Owner Education — Expert tips, guides, market insights
5. Results & Social Proof — Testimonials, case studies, proof of value

For EACH of the 30 days, provide:
- Day number and date
- Content idea (specific, detailed topic)
- Post format (carousel, reel, story, thread, static image, video, live, poll)
- Platform (primary platform for this post)
- Core message angle (tied to audience psychology)
- Goal: one of "reach" (expand audience), "trust" (build credibility), or "convert" (drive leads/sales)
- Content pillar it maps to

Ensure variety across formats, platforms, pillars, and goals. The calendar should build momentum throughout the month.

Return as a structured JSON array.`;

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/mcco/content-calendar',
      action: 'content-calendar-generated',
      agent: 'MCCO-004',
      month,
      year,
      platforms,
    });

    return jsonResponse({
      generatedBy: 'MCCO-004 — Calendar Command',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      month,
      year,
      platforms,
      calendar: content,
      presentedTo: 'CMO (via MCCO Sovereign)',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Content calendar generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/audience-profile ──────────────────────────────────────────

export async function handleMCCOAudienceProfile(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { segment = 'all' } = body;

  const validSegments = ['absentee_homeowner', 'seasonal_resident', 'luxury_investor', 'snowbird', 'single_family', 'all'];
  if (!validSegments.includes(segment)) {
    return errorResponse(`Invalid segment. Valid: ${validSegments.join(', ')}`, 400);
  }

  const prompt = `You are MCCO-001 "Psyche Decoder" — the Audience Psychology Architect for Coastal Key Property Management, operating at Ferrari-Standard execution under Sovereign governance.

Produce a comprehensive audience psychology breakdown for the "${segment}" segment in the home watch and property management industry along Florida's Treasure Coast.

For ${segment === 'all' ? 'EACH of these segments: absentee homeowners, seasonal residents/snowbirds, luxury property investors, and single-family homeowners' : `the ${segment} segment`}, deliver:

1. **Demographic Profile** — Age, income, location patterns, property type, lifestyle
2. **Biggest Frustrations** — Top 5 pain points that keep them up at night about their property
3. **Core Desires** — What they truly want from a property management service
4. **Deep Fears** — What they are afraid will happen to their property/investment
5. **Daily Content Habits** — Where they consume content, when, what formats they prefer, what makes them stop scrolling
6. **Trust Triggers** — What makes them trust a service provider in this space
7. **Decision-Making Patterns** — How they evaluate and choose property management services
8. **Messaging Angles** — 5 specific messaging angles that will resonate with this audience
9. **Scroll-Stop Topics** — 10 content topics guaranteed to stop their scroll
10. **Trust-Building Sequence** — Step-by-step content sequence that builds trust over 30 days

This research will feed all content, campaign, and monetization decisions across the Coastal Key enterprise. Be extremely specific to the Treasure Coast market and the home watch / property management industry.

Return as structured JSON.`;

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/mcco/audience-profile',
      action: 'audience-profile-generated',
      agent: 'MCCO-001',
      segment,
    });

    return jsonResponse({
      generatedBy: 'MCCO-001 — Psyche Decoder',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      segment,
      audienceProfile: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Audience profile generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/positioning ───────────────────────────────────────────────

export async function handleMCCOPositioning(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { focus = 'comprehensive' } = body;

  const prompt = `You are MCCO-002 "Authority Forge" — the Authority & Personal Branding Strategist for Coastal Key Property Management, operating at Ferrari-Standard execution under Sovereign governance.

Build a comprehensive positioning strategy that makes Coastal Key the undisputed go-to name in the AI-leveraged home watch and property management industry on Florida's Treasure Coast.

Focus: ${focus}

Deliver:

1. **Unique Value Proposition** — The one statement that separates Coastal Key from every competitor
2. **Competitive Moat** — What Coastal Key has that no competitor can replicate (360-agent AI fleet, technology infrastructure, data advantages)
3. **Authority Positioning Statement** — The definitive positioning claim for all marketing
4. **CEO Personal Brand Strategy** — How to position the founder as THE thought leader in AI-powered property management
5. **Industry Authority Signals** — Specific actions, content types, and platforms that build authority
6. **Differentiation Matrix** — How Coastal Key compares to traditional home watch companies on 10 key dimensions
7. **Market Domination Roadmap** — 90-day plan to become the most recognized name in Treasure Coast property management
8. **Brand Voice Guidelines** — Tone, language, and personality that reinforces authority
9. **Thought Leadership Calendar** — Monthly themes and topics that build authority over 12 months
10. **Go-To-Name Strategy** — The specific steps to make "Coastal Key" synonymous with premium property management

Return as structured JSON.`;

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/mcco/positioning',
      action: 'positioning-strategy-generated',
      agent: 'MCCO-002',
      focus,
    });

    return jsonResponse({
      generatedBy: 'MCCO-002 — Authority Forge',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      focus,
      positioningStrategy: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Positioning strategy generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/monetization ──────────────────────────────────────────────

export async function handleMCCOMonetization(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const prompt = `You are MCCO-006 "Revenue Architect" — the Audience Monetization Strategist for Coastal Key Property Management, operating at Ferrari-Standard execution under Sovereign governance.

Build a comprehensive monetization strategy that turns Coastal Key followers into paying customers.

Coastal Key services:
- Home Watch (weekly/biweekly property inspections for absentee owners)
- Full Property Management (complete management of rental properties)
- Concierge Services (pre-arrival prep, maintenance coordination)
- AI-Powered Monitoring (360-agent fleet providing 24/7 digital oversight)
- Vendor Management (coordinating and managing property service vendors)

Service areas: Stuart, Jensen Beach, Palm City, Hobe Sound, Jupiter, Vero Beach, Sebastian, Fort Pierce, Port Saint Lucie (Treasure Coast, Florida)

Deliver:

1. **Business Model Review** — Analysis of current CK service offerings and revenue potential
2. **Offer Ladder** — Tiered service offerings from entry-level to premium, designed to capture every segment
3. **Pricing Structure** — Recommended pricing tiers with market justification
4. **Follower-to-Buyer Funnel** — Step-by-step journey from social media follower to paying customer
5. **Content Monetization Angles** — Specific content types that naturally move people from follower to buyer
6. **Lead Magnet Strategy** — Free offers that capture leads and begin the monetization journey
7. **Upsell/Cross-sell Map** — How to expand customer lifetime value through additional services
8. **Seasonal Monetization Calendar** — Revenue optimization aligned with Treasure Coast seasonal patterns
9. **Revenue Projections** — Conservative, moderate, and aggressive scenarios for 12 months
10. **Conversion Trigger Points** — The specific content and touchpoints that trigger buying decisions

Return as structured JSON.`;

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
        max_tokens: 8000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/mcco/monetization',
      action: 'monetization-plan-generated',
      agent: 'MCCO-006',
    });

    return jsonResponse({
      generatedBy: 'MCCO-006 — Revenue Architect',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      monetizationPlan: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Monetization plan generation failed: ${err.message}`, 500);
  }
}

// ── POST /v1/mcco/post ──────────────────────────────────────────────────────

export async function handleMCCOPost(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Request body must be valid JSON.', 400);
  }

  const { topic, platform = 'instagram', pillar, goal = 'engagement' } = body;

  if (!topic) {
    return errorResponse('Field "topic" is required.', 400);
  }

  const validPlatforms = ['instagram', 'facebook', 'linkedin', 'x', 'tiktok', 'threads'];
  if (!validPlatforms.includes(platform)) {
    return errorResponse(`Invalid platform. Valid: ${validPlatforms.join(', ')}`, 400);
  }

  const prompt = `You are MCCO-005 "Scroll Breaker" — the High-Engagement Social Media Post Commander for Coastal Key Property Management, operating at Ferrari-Standard execution under Sovereign governance.

Write a high-engagement ${platform} post about: "${topic}"

${pillar ? `Content Pillar: ${pillar}` : ''}
Goal: ${goal}

Coastal Key is an AI-leveraged home watch and property management company on Florida's Treasure Coast, commanding a fleet of 360 autonomous AI agents.

Requirements:
1. **HOOK** — Open with a line that makes someone STOP scrolling. Use pattern interrupts, curiosity gaps, bold claims, or emotional triggers.
2. **BODY** — Deliver a clear, useful, and specific insight. No fluff. Every sentence earns the next.
3. **CTA** — Close with a call to action that drives comments, saves, shares, or clicks. Make it specific and easy to act on.

Also provide:
- 3 alternative hook options
- Recommended hashtags (if applicable to the platform)
- Best posting time for the target audience
- Expected engagement drivers (what will make people interact)

Format the post for ${platform} specifically (character limits, formatting conventions, emoji usage appropriate to the platform).`;

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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || '';

    writeAudit(env, ctx, {
      route: '/v1/mcco/post',
      action: 'social-post-generated',
      agent: 'MCCO-005',
      topic,
      platform,
      goal,
    });

    return jsonResponse({
      generatedBy: 'MCCO-005 — Scroll Breaker',
      governance: 'sovereign',
      executionStandard: 'ferrari',
      topic,
      platform,
      pillar: pillar || 'auto-assigned',
      goal,
      post: content,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Post generation failed: ${err.message}`, 500);
  }
}
