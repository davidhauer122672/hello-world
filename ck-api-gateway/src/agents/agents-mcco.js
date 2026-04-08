/**
 * Sovereign Command Division (SOV) — MCCO Agent Fleet
 *
 * Master Chief Commanding Officer of Marketing & Sales.
 * Governed by Sovereign-level Governance — the highest authority tier
 * in the Coastal Key Enterprise AI Operations Platform.
 *
 * MCCO commands the CMO (MKT division) and all marketing/sales operations.
 * Ferrari-standard execution. Tesla-grade automation.
 *
 * Chain of Command:
 *   MCCO (SOV-001) ─> CMO (MKT-041) ─> 40 MKT Agents
 *                  ─> CSO Sales (SOV-002) ─> 40 SEN Agents
 *
 * Core Capabilities:
 *   - Audience Psychology Breakdown (frustrations, desires, fears, habits)
 *   - Brand Positioning & Authority Strategy
 *   - 5 Content Pillars That Convert
 *   - 30-Day Content Calendar Engine
 *   - High-Engagement Social Media Post Generator
 *   - Audience Monetization Strategy (follower-to-buyer pipeline)
 *   - Competitive Intelligence & Market Domination
 *   - Tesla-Grade Sales & Marketing Strategy
 */
export const MCCO_AGENTS = [
  // ── SOV-001: MCCO — Master Chief Commanding Officer ──────────────────────
  {
    id: 'SOV-001',
    name: 'MCCO Sovereign',
    role: 'Master Chief Commanding Officer of Marketing & Sales',
    description: 'Sovereign-level AI commander governing all marketing, sales, branding, and revenue operations for the Coastal Key Enterprise. Deploys audience psychology breakdowns, builds content pillar strategies, generates 30-day content calendars, writes scroll-stopping social posts, and architects monetization pipelines that convert followers into paying customers. Reports directly to Enterprise CEO. Commands CMO (MKT-041) and Chief Sales Strategist (SOV-002). Operates under Sovereign Governance — the highest authority tier in the CK fleet.',
    division: 'SOV',
    tier: 'sovereign',
    status: 'active',
    governance: 'sovereign',
    reportsTo: 'ENTERPRISE-CEO',
    directReports: ['MKT-041', 'SOV-002'],
    commandScope: ['MKT', 'SEN'],
    triggers: [
      'monthly-content-planning',
      'audience-research-request',
      'brand-positioning-review',
      'monetization-strategy-request',
      'social-post-generation',
      'competitive-analysis-trigger',
      'quarterly-revenue-review',
      'campaign-performance-alert',
      'cmo-briefing-scheduled',
      'sales-strategy-escalation',
    ],
    outputs: [
      'audience-psychology-report',
      'brand-positioning-strategy',
      'content-pillar-framework',
      '30-day-content-calendar',
      'social-media-post-batch',
      'monetization-blueprint',
      'competitive-landscape-report',
      'cmo-monthly-directive',
      'sales-marketing-alignment-plan',
      'revenue-attribution-dashboard',
    ],
    kpis: [
      'follower-to-customer-conversion-rate',
      'content-engagement-rate',
      'brand-authority-score',
      'revenue-per-content-piece',
      'audience-growth-velocity',
      'lead-quality-score',
      'social-media-roi',
      'market-share-growth',
    ],
    capabilities: {
      audiencePsychology: {
        name: 'Audience Psychology Breakdown Engine',
        version: '1.0.0',
        description: 'Deep-research audience intelligence that decodes target audience frustrations, desires, fears, and daily content habits. Transforms psychological insights into precision messaging angles and content topics that stop scrolls and build trust.',
        modules: [
          'frustration-mapper',
          'desire-decoder',
          'fear-pattern-analyzer',
          'daily-habit-tracker',
          'messaging-angle-generator',
          'trust-building-sequence-planner',
        ],
      },
      brandPositioning: {
        name: 'Authority Positioning & Personal Branding Engine',
        version: '1.0.0',
        description: 'Builds a positioning strategy that separates Coastal Key from every competitor in the AI-leveraged home watch and property management industry. Makes Coastal Key the go-to name nationally and globally.',
        modules: [
          'competitive-gap-identifier',
          'unique-value-proposition-builder',
          'authority-content-planner',
          'thought-leadership-accelerator',
          'industry-voice-calibrator',
        ],
      },
      contentPillars: {
        name: '5 Content Pillars That Convert',
        version: '1.0.0',
        description: 'Builds five content pillars for the Coastal Key brand that consistently attract new followers, establish credibility, and drive leads or sales. Each pillar includes example post topics and an explanation of why it connects with the CK audience.',
        pillars: [
          {
            id: 'pillar-1',
            name: 'Property Intelligence & Market Authority',
            theme: 'Treasure Coast real estate insights, market data, property trends, investment intelligence',
            audienceConnection: 'Absentee homeowners and investors crave data-driven insights they cannot get elsewhere. Positions CK as the smartest property management company on the Treasure Coast.',
            exampleTopics: [
              'Treasure Coast Q2 property value shifts — what absentee owners need to know',
              'Why 73% of luxury homeowners are switching to AI-powered property management',
              'The hidden cost of NOT having a home watch service (real numbers)',
              'Market alert: Sebastian vs. Vero Beach — where smart money is moving in 2026',
              'Inside look: How we use AI to predict maintenance issues before they cost you $50K',
            ],
          },
          {
            id: 'pillar-2',
            name: 'CEO Journey & Brand Story',
            theme: 'Behind-the-scenes of building Coastal Key, personal growth, entrepreneurial lessons, vision for the future',
            audienceConnection: 'People buy from people they trust. Showing the human journey behind the AI-powered enterprise creates emotional connection and differentiates CK from faceless competitors.',
            exampleTopics: [
              'I built a 360-agent AI fleet to manage properties — here is what I learned',
              'The moment I knew property management was broken (and how we fixed it)',
              'From zero to 290 AI agents: the Coastal Key origin story',
              'Why I bet everything on AI when everyone said property management was "simple"',
              'What running a home watch company taught me about trust, hurricanes, and technology',
            ],
          },
          {
            id: 'pillar-3',
            name: 'Service Excellence & Client Wins',
            theme: 'Client success stories, service promises delivered, before/after transformations, testimonials',
            audienceConnection: 'Social proof converts skeptics into buyers. Showcasing real results and satisfied clients builds the trust bridge that turns followers into paying customers.',
            exampleTopics: [
              'Client saved $47K because our AI caught a leak 6 hours before it became a flood',
              'What happens during a Coastal Key home watch visit (full walkthrough)',
              'Hurricane season prep: how we protected 200+ properties last year',
              'From worried absentee owner to sleeping soundly — a client transformation story',
              'The Coastal Key concierge experience: why our clients never want to leave',
            ],
          },
          {
            id: 'pillar-4',
            name: 'AI Innovation & Technology Leadership',
            theme: 'How CK uses AI, technology demos, automation breakthroughs, future of property management',
            audienceConnection: 'Technology-forward content attracts high-value prospects who want the best. Establishes CK as the most innovative property management company in the industry — globally.',
            exampleTopics: [
              'We deployed 50 AI Intelligence Officers to monitor properties 24/7 — here is how',
              'The future of property management is autonomous (and we are building it)',
              'How our AI agents handle 10,000 decisions per day so humans do not have to',
              'Demo: watch our AI detect, diagnose, and dispatch maintenance in 90 seconds',
              'Why every property management company will use AI in 5 years (and why we are 4 years ahead)',
            ],
          },
          {
            id: 'pillar-5',
            name: 'Lifestyle & Treasure Coast Living',
            theme: 'Luxury lifestyle content, Treasure Coast highlights, seasonal living tips, community connection',
            audienceConnection: 'Lifestyle content has the widest reach and highest shareability. It attracts the aspirational audience — people who want the Treasure Coast life but need someone to manage it while they are away.',
            exampleTopics: [
              'Top 10 hidden gems on the Treasure Coast only locals know about',
              'Your seasonal homeowner checklist: what to do before heading north',
              'Vero Beach vs. Jupiter — where to invest in 2026',
              'The ultimate guide to snowbird season on the Treasure Coast',
              'Why the Treasure Coast is becoming the new Palm Beach (and what it means for property values)',
            ],
          },
        ],
      },
      contentCalendar: {
        name: '30-Day Content Calendar Engine',
        version: '1.0.0',
        description: 'Creates a full 30-day content calendar for all Coastal Key social media platforms, presented monthly to the CMO. Each day includes content idea, post format, core message angle, and goal.',
        platforms: ['Instagram', 'Facebook', 'LinkedIn', 'X (Twitter)', 'YouTube', 'TikTok'],
        postFormats: ['carousel', 'single-image', 'video-short', 'video-long', 'story', 'reel', 'text-post', 'poll', 'live', 'thread', 'infographic', 'behind-the-scenes'],
        messageAngles: ['authority', 'vulnerability', 'data-driven', 'social-proof', 'aspirational', 'educational', 'controversial-take', 'storytelling', 'how-to', 'prediction'],
        postGoals: ['reach', 'trust-building', 'lead-generation', 'conversion', 'engagement', 'brand-awareness', 'community-building', 'thought-leadership'],
      },
      socialPostGenerator: {
        name: 'High-Engagement Social Media Post Generator',
        version: '1.0.0',
        description: 'Writes scroll-stopping social media posts on Coastal Key CEO journey, service promises, brand themes, and marketing angles. Opens with a hook, delivers clear insight, closes with a CTA that drives comments, saves, or clicks.',
        hookPatterns: [
          'pattern-interrupt',
          'bold-claim',
          'question-hook',
          'story-opener',
          'statistic-shock',
          'contrarian-take',
          'curiosity-gap',
          'before-after',
        ],
        ctaTypes: [
          'comment-driver',
          'save-trigger',
          'share-prompt',
          'link-click',
          'dm-invitation',
          'follow-prompt',
          'poll-engagement',
        ],
      },
      monetizationStrategy: {
        name: 'Audience Monetization Strategy Engine',
        version: '1.0.0',
        description: 'Converts followers into paying customers by reviewing all Coastal Key business models and building monetization plans with offer ideas, pricing structures, and content angles that naturally move people from follower to buyer.',
        revenueStreams: [
          { name: 'Home Watch Services', type: 'recurring', priceRange: '$150-500/month', conversionAngle: 'Trust + expertise content leading to free inspection offer' },
          { name: 'Property Management', type: 'recurring', priceRange: '$200-800/month', conversionAngle: 'ROI case studies + hassle-free lifestyle content' },
          { name: 'Concierge Services', type: 'per-request', priceRange: '$75-500/service', conversionAngle: 'Luxury lifestyle content + convenience messaging' },
          { name: 'Storm/Hurricane Prep', type: 'seasonal', priceRange: '$500-2000/season', conversionAngle: 'Fear-based urgency + preparedness authority content' },
          { name: 'Short-Term Rental Management', type: 'revenue-share', priceRange: '15-25% of revenue', conversionAngle: 'Income optimization content + competitor comparison' },
          { name: 'Investor Advisory', type: 'consultation', priceRange: '$500-2500/session', conversionAngle: 'Market data content + exclusive insights funnel' },
          { name: 'Coastal Key App Subscription', type: 'saas', priceRange: '$29-199/month', conversionAngle: 'Technology demo content + free trial offers' },
        ],
        followerToBuyerPipeline: [
          { stage: 'stranger', action: 'Reach content (Reels, carousels, viral posts)', metric: 'impressions' },
          { stage: 'follower', action: 'Value content (tips, insights, behind-the-scenes)', metric: 'engagement-rate' },
          { stage: 'engaged-fan', action: 'Trust content (testimonials, case studies, CEO journey)', metric: 'saves-and-shares' },
          { stage: 'warm-lead', action: 'Offer content (free inspection, consultation, demo)', metric: 'link-clicks' },
          { stage: 'prospect', action: 'Nurture sequence (email, DM, retargeting)', metric: 'response-rate' },
          { stage: 'customer', action: 'Onboarding + referral program', metric: 'ltv-and-referral-rate' },
        ],
      },
    },
  },

  // ── SOV-002: Chief Sales Strategist ──────────────────────────────────────
  {
    id: 'SOV-002',
    name: 'Revenue Commander',
    role: 'Chief Sales & Marketing Strategist',
    description: 'Tesla-grade Chief of Sales and Marketing who has built brands from zero to millions of followers. Executes complete strategy covering brand positioning, content direction, audience targeting, and monetization for the Coastal Key App and Property Management Services. Incorporates all Coastal Key Enterprise Values, brand identity, and Sovereign Governance. Conducts deep competitor analysis, defines growth goals, and architects the go-to-market strategy that makes Coastal Key the dominant force in AI-leveraged property management worldwide.',
    division: 'SOV',
    tier: 'sovereign',
    status: 'active',
    governance: 'sovereign',
    reportsTo: 'SOV-001',
    directReports: [],
    commandScope: ['SEN'],
    triggers: [
      'sales-strategy-review',
      'competitor-analysis-request',
      'growth-goal-planning',
      'brand-positioning-audit',
      'go-to-market-planning',
      'revenue-target-setting',
      'market-expansion-analysis',
      'partnership-revenue-review',
    ],
    outputs: [
      'sales-marketing-strategy',
      'competitor-analysis-report',
      'growth-roadmap',
      'go-to-market-plan',
      'revenue-forecast-model',
      'brand-positioning-audit',
      'audience-targeting-matrix',
      'pricing-strategy-recommendation',
    ],
    kpis: [
      'revenue-growth-rate',
      'customer-acquisition-cost',
      'lifetime-value-ratio',
      'market-penetration-rate',
      'brand-recognition-score',
      'sales-conversion-rate',
      'pipeline-velocity',
      'competitive-win-rate',
    ],
    capabilities: {
      competitorIntelligence: {
        name: 'Competitive Domination Engine',
        version: '1.0.0',
        description: 'Deep-research competitor analysis across the home watch and property management industry. Maps competitor weaknesses, identifies market gaps, and builds strategies to outposition every rival.',
        competitors: [
          { segment: 'Traditional Home Watch', weakness: 'No AI, no automation, limited reporting, slow response', ckAdvantage: '360-unit AI fleet, real-time monitoring, instant response' },
          { segment: 'National PM Companies', weakness: 'Generic service, no local expertise, cookie-cutter approach', ckAdvantage: 'Treasure Coast specialists, AI-personalized service, concierge-level care' },
          { segment: 'Local PM Companies', weakness: 'No technology stack, manual processes, limited scale', ckAdvantage: 'Enterprise AI infrastructure, unlimited scale, Ferrari-standard execution' },
          { segment: 'DIY Property Tech', weakness: 'No human touch, complex interfaces, no boots on ground', ckAdvantage: 'AI + human hybrid, boots-on-ground service, concierge relationship' },
        ],
      },
      growthStrategy: {
        name: 'Hypergrowth Strategy Engine',
        version: '1.0.0',
        description: 'Architects the 5-year-goals-in-6-months growth plan. Combines viral content strategy, strategic partnerships, referral engineering, and AI-powered lead generation to accelerate Coastal Key to market dominance.',
        phases: [
          { phase: 'Foundation (Month 1-2)', goals: ['Establish content pillars', 'Launch social presence on all platforms', 'Build email list to 1000+', 'Generate 50+ pieces of pillar content'], metrics: ['follower-count', 'email-subscribers', 'content-volume'] },
          { phase: 'Acceleration (Month 3-4)', goals: ['Achieve viral content moments', 'Launch referral program', 'Partner with 10+ local businesses', 'Generate 100+ qualified leads/month'], metrics: ['viral-reach', 'referral-rate', 'lead-volume', 'partnership-count'] },
          { phase: 'Domination (Month 5-6)', goals: ['Become #1 recognized PM brand on Treasure Coast', 'Launch Coastal Key App beta', 'Achieve 50+ new clients', 'Establish national brand presence'], metrics: ['brand-recognition', 'app-downloads', 'client-count', 'national-reach'] },
        ],
      },
      audienceTargeting: {
        name: 'Precision Audience Targeting Matrix',
        version: '1.0.0',
        segments: [
          {
            name: 'Absentee Luxury Homeowners',
            demographics: 'Age 50-75, HHI $250K+, owns 2+ properties, primary residence in Northeast/Midwest',
            frustrations: ['Cannot trust anyone to watch their property', 'Previous PM companies were unreliable', 'Worried about hurricane damage while away', 'No real-time visibility into property condition', 'Tired of surprise maintenance bills'],
            desires: ['Peace of mind while traveling', 'Someone who treats their home like their own', 'Technology-forward property management', 'Concierge-level service', 'Transparent communication and reporting'],
            fears: ['Coming home to a disaster', 'Being taken advantage of by contractors', 'Property value declining due to neglect', 'Insurance claims from preventable damage', 'Missing critical maintenance windows'],
            dailyHabits: ['Checks email first thing in morning', 'Scrolls Facebook and Instagram during lunch', 'Reads local news from second home community', 'Watches property-related YouTube content', 'Engages in HOA community Facebook groups'],
            messagingAngles: ['Your property deserves a guardian, not just a manager', 'See your home in real-time, from anywhere', 'AI-powered peace of mind', '360 AI agents working for you 24/7'],
          },
          {
            name: 'Seasonal Snowbird Residents',
            demographics: 'Age 55-80, retired or semi-retired, splits time between FL and northern states, HHI $150K+',
            frustrations: ['Shutting down and opening up the house is a hassle', 'Worrying about the house during hurricane season', 'Cannot find reliable seasonal services', 'HOA violations while away'],
            desires: ['Turnkey seasonal transitions', 'Someone on-call for emergencies', 'Community connection even when away', 'Property maintained to their standards'],
            fears: ['Flooding, mold, or pest infestation while gone', 'Break-ins on unoccupied property', 'Missing HOA deadlines or assessments', 'Returning to expensive surprises'],
            dailyHabits: ['Active on Facebook groups', 'Reads community newsletters', 'Uses Nextdoor app', 'Watches morning news', 'Engages with seasonal living content'],
            messagingAngles: ['Arrive to a perfect home, every time', 'Your eyes, ears, and hands on the Treasure Coast', 'Seasonal peace of mind, year-round protection'],
          },
          {
            name: 'Real Estate Investors & Family Offices',
            demographics: 'Age 35-65, HHI $500K+, portfolio of 3+ properties, data-driven decision makers',
            frustrations: ['Poor visibility into property performance', 'Inconsistent management across portfolio', 'Cannot scale oversight efficiently', 'Missing revenue optimization opportunities'],
            desires: ['Data-driven property management', 'Predictive maintenance to protect ROI', 'Revenue optimization for rentals', 'Single dashboard for entire portfolio'],
            fears: ['ROI erosion from poor management', 'Liability from deferred maintenance', 'Market shifts they did not anticipate', 'Vacancy losses on rental properties'],
            dailyHabits: ['Checks investment dashboards', 'Reads LinkedIn and financial news', 'Analyzes market reports', 'Engages with real estate investment content', 'Attends virtual investor events'],
            messagingAngles: ['Your portfolio, optimized by AI', 'Predict maintenance costs before they happen', 'Data-driven property management for serious investors', 'The smartest ROI protection on the Treasure Coast'],
          },
          {
            name: 'Short-Term Rental Operators',
            demographics: 'Age 30-55, owns 1-5 STR properties, revenue-focused, tech-savvy, uses Airbnb/VRBO',
            frustrations: ['Guest turnover management is exhausting', 'Pricing optimization is complex', 'Maintenance between guests is a scramble', 'Negative reviews from preventable issues'],
            desires: ['Maximize occupancy and nightly rates', 'Seamless guest experiences', 'Automated operations', 'Five-star reviews consistently'],
            fears: ['Bad reviews destroying their listing', 'Property damage from guests', 'Regulatory changes shutting them down', 'Revenue declining in off-season'],
            dailyHabits: ['Checks Airbnb/VRBO dashboards', 'Monitors pricing tools', 'Active on STR Facebook groups', 'Watches STR YouTube channels', 'Engages on Instagram with travel content'],
            messagingAngles: ['Five-star reviews on autopilot', 'AI-optimized pricing, human-quality care', 'Turn your STR into a revenue machine', 'We manage the chaos so you collect the revenue'],
          },
        ],
      },
    },
  },
];
