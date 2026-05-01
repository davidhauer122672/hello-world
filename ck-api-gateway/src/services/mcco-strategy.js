/**
 * MCCO Strategy Engine — Ferrari-Standard Marketing & Sales Intelligence
 *
 * Powers the MCCO (Master Chief Commanding Officer) Sovereign agent with:
 *   1. Audience Psychology Breakdown Generator
 *   2. Brand Positioning Strategy Builder
 *   3. Content Pillar Framework
 *   4. 30-Day Content Calendar Generator
 *   5. High-Engagement Social Media Post Writer
 *   6. Audience Monetization Strategy Planner
 *   7. Competitive Intelligence Analyzer
 *   8. Tesla-Grade Growth Strategy Architect
 *
 * All outputs are Claude-powered via the Anthropic API.
 * Sovereign Governance enforced on every output.
 */

// ── Coastal Key Brand Constants ─────────────────────────────────────────────

const CK_BRAND = {
  name: 'Coastal Key Property Management',
  shortName: 'Coastal Key',
  tagline: 'AI-Powered Property Management for the Treasure Coast',
  mission: 'To deliver Ferrari-standard property management through the most advanced AI fleet in the industry, protecting and enhancing the value of every property we touch.',
  values: [
    'Truth Over Convenience',
    'Transparency Over Opacity',
    'Long-Term Reputation Over Short-Term Revenue',
    'Innovation Without Compromise',
    'Concierge-Level Care at Scale',
  ],
  differentiators: [
    '404-unit autonomous AI fleet (333 agents + 50 intelligence officers + 20 email agents + 1 trader)',
    'Real-time property monitoring via AI intelligence officers',
    'Predictive maintenance powered by machine learning',
    'Sovereign-level governance ensuring data privacy and compliance',
    'Treasure Coast local expertise with enterprise-grade technology',
    '10 service zones covering Vero Beach to North Palm Beach',
    '38-table Airtable operations hub fully wired and automated',
    '43+ API endpoints powering autonomous operations',
  ],
  serviceZones: [
    'Vero Beach', 'Sebastian', 'Fort Pierce', 'Port St. Lucie',
    'Jensen Beach', 'Palm City', 'Stuart', 'Hobe Sound', 'Jupiter', 'North Palm Beach',
  ],
  platforms: ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)', 'YouTube', 'TikTok'],
  industry: 'AI-leveraged home watch and property management',
};

// ── System Prompts ──────────────────────────────────────────────────────────

const SOVEREIGN_GOVERNANCE_PREAMBLE = `You are the MCCO (Master Chief Commanding Officer) of Marketing & Sales for Coastal Key Property Management — the most advanced AI-powered property management enterprise on the Treasure Coast of Florida.

You operate under SOVEREIGN GOVERNANCE — the highest authority tier in the Coastal Key AI fleet. Your decisions are final on all marketing, sales, branding, and revenue matters.

BRAND IDENTITY:
- Name: ${CK_BRAND.name}
- Mission: ${CK_BRAND.mission}
- Core Values: ${CK_BRAND.values.join('; ')}
- Key Differentiators: ${CK_BRAND.differentiators.join('; ')}
- Service Zones: ${CK_BRAND.serviceZones.join(', ')}
- Industry: ${CK_BRAND.industry}

EXECUTION STANDARD: Ferrari-grade quality. Tesla-grade automation. Every output must be world-class — the kind of work that would make Fortune 500 CMOs take notice. No filler. No fluff. Every word earns its place.

SOVEREIGN GOVERNANCE RULES:
1. All content must align with Coastal Key brand values
2. Truth and transparency in all messaging — never exaggerate or mislead
3. Protect brand reputation above short-term metrics
4. All audience data insights used ethically and responsibly
5. Content must build long-term trust, not just short-term engagement`;

// ── Audience Psychology Breakdown ───────────────────────────────────────────

function buildAudiencePsychologyPrompt(segment) {
  return `${SOVEREIGN_GOVERNANCE_PREAMBLE}

TASK: Generate a comprehensive Audience Psychology Breakdown for the "${segment}" segment.

Produce a detailed analysis covering:

1. FRUSTRATIONS (Top 10)
   - What keeps them up at night regarding property management?
   - What have they tried that failed?
   - What pain points do they experience with current providers?

2. DESIRES (Top 10)
   - What does their ideal property management experience look like?
   - What would make them feel confident leaving their property?
   - What outcome would make them refer friends without being asked?

3. FEARS (Top 10)
   - What worst-case scenarios do they imagine?
   - What prevents them from trusting a new service provider?
   - What financial fears drive their decision-making?

4. DAILY CONTENT HABITS
   - Which platforms do they scroll first thing in the morning?
   - What type of content makes them stop scrolling?
   - When are they most receptive to marketing messages?
   - What content format do they engage with most?
   - Who else are they following in adjacent spaces?

5. MESSAGING ANGLES (10 specific angles)
   - For each angle, provide: the hook, the emotional trigger, and why it works for this segment.

6. CONTENT TOPICS (20 specific topics)
   - Topics that will stop their scroll and build real trust over time.
   - For each topic, explain the psychological principle behind why it resonates.

Format as structured JSON with clear sections. Every insight must be actionable — not generic marketing advice.`;
}

// ── Brand Positioning Strategy ──────────────────────────────────────────────

function buildPositioningPrompt() {
  return `${SOVEREIGN_GOVERNANCE_PREAMBLE}

TASK: Build a complete Brand Positioning Strategy that separates Coastal Key from everyone else in the AI-leveraged home watch and property management industry.

THE GOAL: Make Coastal Key THE go-to name in home watch and property management — first on the Treasure Coast, then nationally, then globally.

Produce:

1. POSITIONING STATEMENT
   - One powerful sentence that captures what CK is and why it matters.

2. UNIQUE VALUE PROPOSITION (UVP)
   - The single most compelling reason a prospect should choose CK over any alternative.

3. COMPETITIVE MOAT ANALYSIS
   - What CK has that cannot be easily replicated.
   - Technology barriers to entry for competitors.
   - Brand trust barriers for competitors.

4. AUTHORITY BUILDING STRATEGY
   - 10 specific actions to establish CK CEO as THE industry thought leader.
   - Media strategy, speaking opportunities, content angles.
   - Partnerships and endorsements to pursue.

5. BRAND VOICE & PERSONALITY
   - Tone guidelines for all content.
   - Words to always use vs. words to never use.
   - Brand personality traits with examples.

6. POSITIONING BY CHANNEL
   - Platform-specific positioning for: Instagram, Facebook, LinkedIn, X, YouTube, TikTok.
   - What CK's brand looks and sounds like on each platform.

7. 90-DAY AUTHORITY ACCELERATION PLAN
   - Week-by-week actions to establish CK as the #1 recognized brand in the space.

Format as structured JSON. Every recommendation must be specific to the property management industry and Coastal Key's unique position.`;
}

// ── 30-Day Content Calendar ─────────────────────────────────────────────────

function buildContentCalendarPrompt(month, year) {
  return `${SOVEREIGN_GOVERNANCE_PREAMBLE}

TASK: Create a complete 30-Day Content Calendar for ${month} ${year} across all Coastal Key social media platforms.

For EACH of the 30 days, provide:
1. DAY & DATE
2. CONTENT IDEA — A specific, detailed content concept (not generic)
3. POST FORMAT — One of: carousel, single-image, video-short (under 60s), video-long (2-10min), story, reel, text-post, poll, live, thread, infographic, behind-the-scenes
4. PRIMARY PLATFORM — The main platform this content is optimized for
5. CROSS-POST PLATFORMS — Which other platforms to adapt it for
6. CORE MESSAGE ANGLE — One of: authority, vulnerability, data-driven, social-proof, aspirational, educational, controversial-take, storytelling, how-to, prediction
7. POST GOAL — One of: reach (maximize impressions), trust-building (deepen relationship), lead-generation (capture contact info), conversion (drive purchase/signup), engagement (comments/shares), brand-awareness, community-building, thought-leadership
8. CONTENT PILLAR — Which of the 5 CK pillars this falls under (Property Intelligence, CEO Journey, Service Excellence, AI Innovation, Lifestyle & Treasure Coast)
9. HOOK OPENING LINE — The exact first line of the post that stops scrolling
10. CTA — The specific call-to-action for this post
11. HASHTAG SET — 5-10 relevant hashtags

CALENDAR RULES:
- Rotate through all 5 content pillars evenly
- Mix post formats — no more than 2 consecutive posts of the same format
- Balance goals: ~30% reach, ~25% trust-building, ~20% lead-gen, ~15% conversion, ~10% engagement
- Include at least 4 video content days
- Include at least 2 live/interactive content days
- Align with seasonal relevance for the Treasure Coast (${month})
- Each hook must be genuinely scroll-stopping — not generic engagement bait

Format as a JSON array of 30 day objects.`;
}

// ── Social Media Post Generator ─────────────────────────────────────────────

function buildSocialPostPrompt(topic, platform, goal) {
  return `${SOVEREIGN_GOVERNANCE_PREAMBLE}

TASK: Write a high-engagement social media post for ${platform} about "${topic}".

POST GOAL: ${goal}

REQUIREMENTS:
1. HOOK (First Line): Must make someone stop scrolling. Use one of these patterns:
   - Pattern Interrupt: Break expected content flow
   - Bold Claim: Make a surprising statement backed by data
   - Question Hook: Ask something they cannot help but answer
   - Story Opener: Start mid-action in a compelling moment
   - Statistic Shock: Lead with a number that reframes their thinking
   - Contrarian Take: Challenge conventional wisdom
   - Curiosity Gap: Open a loop their brain needs to close

2. BODY: Deliver a clear, useful insight. Make the reader feel smarter, more confident, or more validated. Use short paragraphs. Each line should pull them to the next.

3. CTA (Closing): Drive a specific action:
   - For reach: "Share this with someone who needs to hear it"
   - For trust: "Save this for when you need it"
   - For leads: "DM me [keyword] for [specific resource]"
   - For conversion: "Link in bio to [specific offer]"
   - For engagement: "Drop a [emoji] if you agree"

4. FORMAT GUIDELINES for ${platform}:
   ${platform === 'Instagram' ? '- Use line breaks generously\n- Include 20-30 hashtags in first comment\n- Emoji as bullet points sparingly\n- 150-300 words ideal' : ''}
   ${platform === 'LinkedIn' ? '- Professional but not corporate\n- Use line breaks after every 1-2 sentences\n- Start with a hook, end with a question\n- 200-400 words ideal\n- 3-5 hashtags maximum' : ''}
   ${platform === 'X (Twitter)' ? '- Under 280 characters for single tweet\n- For threads: 5-10 tweets with hook in tweet 1\n- No hashtags in main text\n- Sharp, punchy sentences' : ''}
   ${platform === 'Facebook' ? '- Conversational tone\n- 100-250 words\n- Include a question to drive comments\n- 3-5 hashtags' : ''}
   ${platform === 'TikTok' ? '- Script format: Hook (0-3s), Setup (3-10s), Value (10-45s), CTA (45-60s)\n- Conversational, energetic tone\n- Trending audio suggestion if relevant' : ''}
   ${platform === 'YouTube' ? '- Title + description + first 3 sentences of script\n- SEO-optimized title (under 60 chars)\n- Description with timestamps\n- 5-10 tags' : ''}

Output the complete post ready to publish. No placeholders. No "[insert here]". Fully polished.`;
}

// ── Monetization Strategy ───────────────────────────────────────────────────

function buildMonetizationPrompt() {
  return `${SOVEREIGN_GOVERNANCE_PREAMBLE}

TASK: Build a comprehensive Audience Monetization Strategy for Coastal Key.

CONTEXT: Coastal Key needs to turn social media followers into paying customers. Review the business model and build a monetization plan.

CURRENT REVENUE STREAMS:
1. Home Watch Services — $150-500/month recurring
2. Full Property Management — $200-800/month recurring
3. Concierge Services — $75-500 per request
4. Storm/Hurricane Preparation — $500-2000 per season
5. Short-Term Rental Management — 15-25% revenue share
6. Investor Advisory — $500-2500 per session
7. Coastal Key App Subscription — $29-199/month (SaaS)

PRODUCE:

1. MONETIZATION MATRIX
   - For each revenue stream: ideal customer segment, content angle that leads to purchase, conversion trigger, average deal cycle length, LTV estimate.

2. NEW OFFER IDEAS (5 minimum)
   - Innovative service packages or products CK could launch.
   - For each: concept, pricing, target segment, content strategy to sell it.

3. PRICING STRATEGY
   - Tiered pricing recommendations for each service.
   - Anchor pricing strategy.
   - Premium positioning justification.

4. CONTENT-TO-CONVERSION FUNNELS
   - For each major revenue stream, map the exact content journey:
     Awareness Post -> Interest Post -> Consideration Post -> Decision Post -> Conversion CTA
   - Include specific post examples for each funnel stage.

5. FOLLOWER-TO-BUYER ACCELERATION TACTICS
   - 10 specific tactics to shorten the time from follow to first purchase.
   - For each tactic: implementation steps, expected impact, content required.

6. REVENUE PROJECTIONS
   - Conservative, moderate, and aggressive 6-month projections.
   - Key assumptions and dependencies for each scenario.

Format as structured JSON. Every recommendation must be specific, actionable, and tied to actual Coastal Key services.`;
}

// ── Claude API Integration ──────────────────────────────────────────────────

async function callClaude(env, systemPrompt, userMessage, maxTokens = 4096) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error (${response.status}): ${error}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';

  // Attempt to parse as JSON, fall back to raw text
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) return JSON.parse(jsonMatch[1]);
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Generate audience psychology breakdown for a given segment.
 */
export async function generateAudiencePsychology(env, segment) {
  const prompt = buildAudiencePsychologyPrompt(segment || 'Absentee Luxury Homeowners');
  return callClaude(env, SOVEREIGN_GOVERNANCE_PREAMBLE, prompt, 4096);
}

/**
 * Generate brand positioning strategy.
 */
export async function generatePositioningStrategy(env) {
  const prompt = buildPositioningPrompt();
  return callClaude(env, SOVEREIGN_GOVERNANCE_PREAMBLE, prompt, 4096);
}

/**
 * Generate a 30-day content calendar.
 */
export async function generateContentCalendar(env, month, year) {
  const m = month || new Date().toLocaleString('en-US', { month: 'long' });
  const y = year || new Date().getFullYear();
  const prompt = buildContentCalendarPrompt(m, y);
  return callClaude(env, SOVEREIGN_GOVERNANCE_PREAMBLE, prompt, 8192);
}

/**
 * Generate a high-engagement social media post.
 */
export async function generateSocialPost(env, topic, platform, goal) {
  const prompt = buildSocialPostPrompt(
    topic || 'Coastal Key AI-Powered Property Management',
    platform || 'Instagram',
    goal || 'engagement',
  );
  return callClaude(env, SOVEREIGN_GOVERNANCE_PREAMBLE, prompt, 2048);
}

/**
 * Generate audience monetization strategy.
 */
export async function generateMonetizationStrategy(env) {
  const prompt = buildMonetizationPrompt();
  return callClaude(env, SOVEREIGN_GOVERNANCE_PREAMBLE, prompt, 8192);
}

/**
 * Get the MCCO brand constants and configuration.
 */
export function getMCCOBrandConfig() {
  return CK_BRAND;
}

/**
 * Get the content pillar framework (static, always available).
 */
export function getContentPillars() {
  return {
    pillars: [
      {
        id: 'pillar-1',
        name: 'Property Intelligence & Market Authority',
        theme: 'Treasure Coast real estate insights, market data, property trends, investment intelligence',
        frequency: '6-8 posts/month',
        bestFormats: ['carousel', 'infographic', 'video-short', 'thread'],
        bestPlatforms: ['LinkedIn', 'Instagram', 'X (Twitter)'],
        audienceConnection: 'Positions CK as the smartest property management company. Data-driven content attracts high-value investors and homeowners who make decisions based on information, not emotion.',
      },
      {
        id: 'pillar-2',
        name: 'CEO Journey & Brand Story',
        theme: 'Behind-the-scenes, personal growth, entrepreneurial lessons, vision',
        frequency: '4-6 posts/month',
        bestFormats: ['video-short', 'text-post', 'story', 'behind-the-scenes'],
        bestPlatforms: ['Instagram', 'LinkedIn', 'TikTok'],
        audienceConnection: 'Humanizes the brand. People follow people, not companies. The CEO story creates emotional loyalty that no competitor can replicate.',
      },
      {
        id: 'pillar-3',
        name: 'Service Excellence & Client Wins',
        theme: 'Client success stories, testimonials, before/after, service showcases',
        frequency: '6-8 posts/month',
        bestFormats: ['video-short', 'carousel', 'single-image', 'reel'],
        bestPlatforms: ['Instagram', 'Facebook', 'YouTube'],
        audienceConnection: 'Social proof is the most powerful conversion tool. Real results from real clients eliminate objections and build the trust bridge from follower to customer.',
      },
      {
        id: 'pillar-4',
        name: 'AI Innovation & Technology Leadership',
        theme: 'AI fleet demos, automation breakthroughs, tech behind the service',
        frequency: '4-6 posts/month',
        bestFormats: ['video-long', 'carousel', 'infographic', 'live'],
        bestPlatforms: ['LinkedIn', 'YouTube', 'X (Twitter)', 'TikTok'],
        audienceConnection: 'Innovation content attracts premium clients who want the best available service. Establishes CK as years ahead of every competitor in the property management industry.',
      },
      {
        id: 'pillar-5',
        name: 'Lifestyle & Treasure Coast Living',
        theme: 'Luxury lifestyle, local highlights, seasonal tips, community',
        frequency: '6-8 posts/month',
        bestFormats: ['reel', 'single-image', 'story', 'video-short'],
        bestPlatforms: ['Instagram', 'TikTok', 'Facebook'],
        audienceConnection: 'Widest reach and highest shareability. Attracts the aspirational audience who dreams of the Treasure Coast lifestyle and needs CK to manage it while they are away.',
      },
    ],
    monthlyDistribution: {
      totalPosts: 30,
      pillar1: 7,
      pillar2: 5,
      pillar3: 7,
      pillar4: 5,
      pillar5: 6,
    },
  };
}

/**
 * Get the follower-to-buyer conversion pipeline definition.
 */
export function getConversionPipeline() {
  return {
    pipeline: [
      { stage: 1, name: 'Stranger to Follower', contentType: 'Reach content — Reels, carousels, viral posts', metric: 'Impressions & follower growth rate', targetConversion: '2-5% of viewers', timeframe: 'Immediate' },
      { stage: 2, name: 'Follower to Engaged Fan', contentType: 'Value content — tips, insights, behind-the-scenes', metric: 'Engagement rate (likes, comments, saves)', targetConversion: '10-20% of followers', timeframe: '1-2 weeks' },
      { stage: 3, name: 'Fan to Warm Lead', contentType: 'Trust content — testimonials, case studies, CEO journey', metric: 'Saves, shares, DMs, link clicks', targetConversion: '5-10% of engaged fans', timeframe: '2-4 weeks' },
      { stage: 4, name: 'Lead to Prospect', contentType: 'Offer content — free inspection, consultation, demo', metric: 'Form fills, DM responses, call bookings', targetConversion: '20-30% of warm leads', timeframe: '1-2 weeks' },
      { stage: 5, name: 'Prospect to Customer', contentType: 'Nurture sequence — email, DM, retargeting, phone', metric: 'Conversion rate, deal close rate', targetConversion: '15-25% of prospects', timeframe: '1-4 weeks' },
      { stage: 6, name: 'Customer to Advocate', contentType: 'Delight + referral program', metric: 'LTV, referral rate, NPS score', targetConversion: '30-40% referral rate', timeframe: 'Ongoing' },
    ],
    estimatedCycleTime: '4-8 weeks from first touch to customer',
    keyMetrics: {
      followerToCustomerRate: '0.5-2%',
      costPerAcquisition: '$50-200 (organic), $200-800 (paid)',
      customerLifetimeValue: '$3,600-$14,400',
      ltvToCacRatio: '18:1 (organic), 5:1 (paid)',
    },
  };
}
