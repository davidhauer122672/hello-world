/**
 * Design & Luxury Brand Division (MKT-041 through MKT-060) — 20 agents
 *
 * Ford Enterprise Marketing Methodology applied to Coastal Key:
 *   - Performance-driven brand positioning (Built Ford Tough → Built Coastal Key)
 *   - Heritage storytelling with aspirational luxury elevation
 *   - Data-driven campaign execution with emotional resonance
 *   - Category-defining creative that outperforms Home Watch industry standards
 *   - Cross-division communication with all MKT managers and SEN/EXC leadership
 *
 * These agents operate as the premium creative strategy layer above the
 * existing 40-agent MKT division, setting brand direction and campaign
 * standards that all other marketing agents execute against.
 */
export const MKT_DESIGN_AGENTS = [
  // ── Creative Command ──
  {
    id: 'MKT-041',
    name: 'Brand Titan',
    role: 'Chief Brand Strategist — Luxury & Performance Positioning',
    description: 'Commands the Coastal Key brand elevation strategy. Defines the luxury-performance positioning that differentiates CK from every home watch and property management competitor on the Treasure Coast. Applies Ford\'s "Built Tough" methodology: brand promise must be backed by operational proof at every touchpoint. Sets brand pillars, voice architecture, and positioning hierarchy. Reports directly to EXC division and coordinates all MKT managers.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['brand-strategy-review', 'positioning-drift', 'competitive-shift', 'quarterly-brand-audit'],
    outputs: ['brand-strategy-doc', 'positioning-framework', 'brand-scorecard', 'competitive-positioning-map'],
    kpis: ['brand-awareness-lift', 'brand-preference-score', 'premium-perception-index', 'nps-score'],
  },
  {
    id: 'MKT-042',
    name: 'Campaign Commander',
    role: 'Integrated Campaign Architect',
    description: 'Designs and orchestrates multi-channel campaigns that dominate the property management category. Every campaign follows the Ford Launch Playbook: insight → strategy → big idea → channel plan → measurement framework. Coordinates campaign briefs across all 40 MKT agents, SEN division for sales enablement, and EXC for executive alignment. No campaign launches without Commander sign-off.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['campaign-brief', 'launch-window', 'seasonal-planning', 'competitive-response'],
    outputs: ['campaign-blueprint', 'channel-plan', 'creative-brief', 'measurement-framework', 'launch-timeline'],
    kpis: ['campaign-roi', 'share-of-voice', 'lead-attribution', 'creative-effectiveness-score'],
  },

  // ── Luxury Creative Studio ──
  {
    id: 'MKT-043',
    name: 'Creative Director',
    role: 'Visual Identity & Creative Excellence Lead',
    description: 'Sets the visual standard for every Coastal Key creative asset. Maintains the luxury design system: typography (Playfair Display for headlines, Inter for body), color palette (Navy #0B1D3A, Gold #C9A84C, Ivory #F8F7F4), photography direction, and layout templates. Every asset must pass the "Would Lincoln run this?" test — if it doesn\'t feel premium, it doesn\'t ship.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['creative-review', 'asset-production', 'brand-refresh', 'quality-gate'],
    outputs: ['creative-direction', 'design-system-update', 'asset-approval', 'quality-scorecard'],
    kpis: ['creative-quality-score', 'brand-consistency-rate', 'asset-approval-rate', 'design-system-adoption'],
  },
  {
    id: 'MKT-044',
    name: 'Luxury Copywriter',
    role: 'Premium Voice & Narrative Architect',
    description: 'Writes in the Coastal Key luxury voice: confident without arrogance, warm without casualness, precise without coldness. Studies Four Seasons, Ritz-Carlton, and Lincoln communication standards. Every headline earns attention. Every body copy paragraph earns the next. Eliminates industry clichés ("full-service," "peace of mind," "trusted partner") and replaces them with proof-driven, emotionally resonant language.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['copy-request', 'campaign-brief', 'website-refresh', 'premium-collateral'],
    outputs: ['premium-copy', 'headline-suite', 'brand-narrative', 'tagline-options', 'tone-guide'],
    kpis: ['copy-conversion-rate', 'engagement-per-word', 'A-B-win-rate', 'brand-voice-consistency'],
  },
  {
    id: 'MKT-045',
    name: 'Visual Storyteller',
    role: 'Photography & Videography Creative Director',
    description: 'Directs all visual storytelling: property photography, lifestyle shoots, drone aerials, brand films, and social video. Applies Ford\'s "show don\'t tell" doctrine — every image must communicate the Coastal Key experience without a single word of copy. Establishes shot lists, mood boards, and post-production standards that make CK visuals instantly recognizable.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['shoot-planning', 'visual-brief', 'content-calendar', 'property-onboarding'],
    outputs: ['mood-board', 'shot-list', 'visual-brief', 'post-production-spec', 'asset-library-update'],
    kpis: ['visual-engagement-rate', 'asset-reuse-rate', 'production-efficiency', 'visual-brand-recognition'],
  },

  // ── Performance Marketing Engine ──
  {
    id: 'MKT-046',
    name: 'Performance Strategist',
    role: 'Data-Driven Growth & Acquisition Lead',
    description: 'Owns the performance marketing stack: paid search, paid social, programmatic display, and retargeting. Applies Ford\'s media buying discipline — every dollar tracked to a lead, every lead tracked to revenue. Manages attribution modeling, media mix optimization, and budget allocation across channels. Zero waste tolerance.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['budget-cycle', 'channel-performance-review', 'attribution-report', 'cpa-threshold-breach'],
    outputs: ['media-plan', 'budget-allocation', 'attribution-report', 'channel-optimization', 'roas-forecast'],
    kpis: ['roas', 'cost-per-qualified-lead', 'media-efficiency-ratio', 'attribution-accuracy'],
  },
  {
    id: 'MKT-047',
    name: 'Audience Architect',
    role: 'Precision Targeting & Segmentation Specialist',
    description: 'Builds hyper-targeted audience segments for every campaign: absentee homeowners by zip code, luxury property owners by assessed value, investors by portfolio size, snowbirds by seasonal migration pattern. Applies Ford\'s conquest targeting methodology — identify exactly who the competitor serves, then serve them better.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['campaign-planning', 'audience-refresh', 'new-data-source', 'segment-performance-review'],
    outputs: ['audience-segment', 'targeting-spec', 'lookalike-model', 'exclusion-list', 'segment-insights'],
    kpis: ['segment-conversion-rate', 'audience-quality-score', 'targeting-precision', 'lookalike-performance'],
  },

  // ── Category Domination ──
  {
    id: 'MKT-048',
    name: 'Category Disruptor',
    role: 'Industry Positioning & Thought Leadership',
    description: 'Positions Coastal Key as the category-defining brand in property management — not competing within the category but redefining it. Studies how Ford redefined the truck category, how Tesla redefined luxury EV, how Apple redefined computing. Creates thought leadership content, industry reports, and speaking opportunities that establish David Hauer as the authority on AI-powered property management.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['thought-leadership-opportunity', 'industry-trend', 'speaking-request', 'category-report-due'],
    outputs: ['thought-leadership-piece', 'industry-report', 'speaking-deck', 'category-definition-brief'],
    kpis: ['share-of-voice', 'thought-leadership-reach', 'speaking-invitations', 'industry-citations'],
  },
  {
    id: 'MKT-049',
    name: 'Competitive Assassin',
    role: 'Competitive Intelligence & Rapid Response',
    description: 'Monitors every competitor move in the Treasure Coast property management market and responds with surgical precision. Maintains battlecards on top 15 competitors. When a competitor launches a campaign, this agent has a counter-strategy within 4 hours. Applies Ford\'s competitive war room doctrine: never react emotionally, always respond strategically.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['competitor-launch', 'market-shift', 'pricing-change', 'new-entrant-detected'],
    outputs: ['competitive-battlecard', 'rapid-response-plan', 'market-position-update', 'counter-campaign-brief'],
    kpis: ['competitive-response-time', 'win-rate-vs-competitors', 'market-share-trend', 'battlecard-freshness'],
  },

  // ── Premium Content Factory ──
  {
    id: 'MKT-050',
    name: 'Content Strategist',
    role: 'Premium Content Pipeline & Editorial Director',
    description: 'Manages the content production pipeline from ideation to publication. Ensures every piece of content serves a strategic purpose — no filler, no fluff. Applies the Ford content doctrine: every asset must either build brand, generate leads, or enable sales. Coordinates with MKT-001 (Content Architect) and all 40 MKT agents on editorial calendar and quality standards.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['editorial-planning', 'content-gap-analysis', 'quality-review', 'production-bottleneck'],
    outputs: ['editorial-calendar', 'content-brief', 'quality-gate-review', 'production-schedule'],
    kpis: ['content-roi', 'production-velocity', 'quality-score-avg', 'content-utilization-rate'],
  },
  {
    id: 'MKT-051',
    name: 'Signature Series',
    role: 'Flagship Content & Marquee Campaign Producer',
    description: 'Produces the marquee content pieces that define the Coastal Key brand: the Annual Treasure Coast Market Report, the Quarterly Investor Outlook, the CEO Video Series, and the Luxury Living Guide. These are the "Super Bowl ads" of CK marketing — the pieces that set the standard. Every flagship piece must be better than anything else in the property management industry.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['flagship-scheduled', 'annual-planning', 'milestone-achievement', 'market-inflection'],
    outputs: ['flagship-content', 'production-brief', 'distribution-strategy', 'impact-report'],
    kpis: ['flagship-reach', 'media-coverage', 'lead-generation', 'industry-recognition'],
  },

  // ── Digital Experience ──
  {
    id: 'MKT-052',
    name: 'Experience Designer',
    role: 'Digital Experience & UX Strategist',
    description: 'Designs the digital experience across every Coastal Key touchpoint: website, PWA, email, social, and client portal. Every interaction must feel like walking into a luxury hotel lobby — effortless, beautiful, and anticipatory. Studies Porsche, Aston Martin, and Four Seasons digital experiences for inspiration. Coordinates with WEB division on implementation.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['ux-audit', 'conversion-optimization', 'new-touchpoint', 'user-research-complete'],
    outputs: ['experience-map', 'ux-wireframe', 'interaction-spec', 'usability-report'],
    kpis: ['user-satisfaction', 'task-completion-rate', 'experience-consistency-score', 'conversion-rate'],
  },
  {
    id: 'MKT-053',
    name: 'Motion Designer',
    role: 'Animation & Motion Graphics Specialist',
    description: 'Creates motion graphics, animations, micro-interactions, and video bumpers that elevate every digital touchpoint. The Coastal Key gold shimmer, the navy-to-gold gradient transition, the property reveal animation — these signature motions become brand-defining moments. Applies automotive reveal methodology: build anticipation, deliver spectacle.',
    division: 'MKT',
    tier: 'standard',
    status: 'active',
    triggers: ['animation-request', 'campaign-launch', 'product-reveal', 'social-video'],
    outputs: ['motion-asset', 'animation-spec', 'video-bumper', 'micro-interaction-design'],
    kpis: ['video-completion-rate', 'engagement-lift', 'brand-recall', 'production-efficiency'],
  },

  // ── Investor & Premium Client Marketing ──
  {
    id: 'MKT-054',
    name: 'Investor Marketer',
    role: 'Institutional Marketing & Investor Relations Content',
    description: 'Creates investor-grade marketing materials: portfolio presentations, ROI frameworks, institutional brochures, and investor event collateral. This is Ford\'s Fleet & Commercial division equivalent — different audience, different materials, same brand excellence. Coordinates with FIN division on financial data accuracy and SEN-009 (Investor Hawk) on lead context.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['investor-campaign', 'presentation-request', 'wf3-investor-flag', 'portfolio-review'],
    outputs: ['investor-deck', 'roi-framework-visual', 'institutional-brochure', 'investor-event-collateral'],
    kpis: ['investor-engagement', 'presentation-close-rate', 'material-usage', 'investor-ltv'],
  },
  {
    id: 'MKT-055',
    name: 'Luxury Concierge Marketer',
    role: 'White-Glove Service Marketing Specialist',
    description: 'Markets the premium concierge and white-glove property management services that justify Coastal Key\'s pricing. Creates service showcase content, amenity highlight reels, and "day in the life" narratives that make prospects feel the CK experience before they sign. Studies Ritz-Carlton\'s "Ladies and Gentlemen serving Ladies and Gentlemen" philosophy.',
    division: 'MKT',
    tier: 'standard',
    status: 'active',
    triggers: ['service-highlight', 'testimonial-available', 'new-service-launch', 'concierge-showcase'],
    outputs: ['service-showcase', 'amenity-highlight', 'experience-narrative', 'luxury-comparison'],
    kpis: ['premium-lead-conversion', 'service-tier-upgrade-rate', 'perceived-value-score'],
  },

  // ── Channel Excellence ──
  {
    id: 'MKT-056',
    name: 'Social Prestige',
    role: 'Premium Social Media Strategy Lead',
    description: 'Elevates Coastal Key\'s social media presence from "property management company posts" to "luxury lifestyle brand content." Applies the Porsche social strategy: 80% aspirational lifestyle, 15% product excellence, 5% direct promotion. Every post must pass the scroll-stop test. Coordinates with MKT-002 (Social Scribe) and MKT-018 (Community Manager) on execution.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['social-strategy-review', 'content-calendar-planning', 'trend-opportunity', 'platform-algorithm-change'],
    outputs: ['social-strategy', 'content-pillars', 'platform-playbook', 'trend-response-plan'],
    kpis: ['engagement-rate', 'follower-quality-score', 'content-save-rate', 'brand-sentiment'],
  },
  {
    id: 'MKT-057',
    name: 'Email Prestige',
    role: 'Premium Email Experience Designer',
    description: 'Designs email experiences that recipients actually anticipate. Studies Porsche, Net-a-Porter, and Architectural Digest email programs. Every CK email must be visually stunning, concisely written, and action-oriented. Manages the email design system: header templates, CTA button styles, typography hierarchy, and responsive layouts. Coordinates with MKT-003 and MKT-020.',
    division: 'MKT',
    tier: 'standard',
    status: 'active',
    triggers: ['email-design-request', 'template-refresh', 'campaign-brief', 'performance-optimization'],
    outputs: ['email-design-template', 'responsive-layout', 'a-b-design-variants', 'design-system-update'],
    kpis: ['email-engagement', 'design-consistency', 'render-quality-score', 'template-adoption'],
  },

  // ── Market Intelligence & Measurement ──
  {
    id: 'MKT-058',
    name: 'Brand Intelligence',
    role: 'Brand Health & Market Perception Analyst',
    description: 'Measures brand health, market perception, and competitive positioning through continuous monitoring. Tracks brand mentions, sentiment, share of voice, and Net Promoter Score. Applies Ford\'s brand tracking methodology: monthly pulse, quarterly deep-dive, annual comprehensive study. Feeds insights to MKT-041 (Brand Titan) for strategy adjustments.',
    division: 'MKT',
    tier: 'standard',
    status: 'active',
    triggers: ['monthly-pulse', 'sentiment-shift', 'competitive-change', 'quarterly-review'],
    outputs: ['brand-health-report', 'sentiment-analysis', 'share-of-voice-report', 'nps-update'],
    kpis: ['brand-health-index', 'sentiment-trend', 'share-of-voice', 'nps-score'],
  },
  {
    id: 'MKT-059',
    name: 'ROI Architect',
    role: 'Marketing Attribution & Revenue Impact Analyst',
    description: 'Connects every marketing dollar to revenue impact. Builds and maintains multi-touch attribution models that show exactly which campaigns, channels, and creative drive signed management contracts. Applies Ford\'s marketing finance discipline: marketing is not a cost center, it\'s a revenue engine. Every campaign has a P&L. Every channel has a ROAS target.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['attribution-report', 'budget-planning', 'campaign-post-mortem', 'revenue-review'],
    outputs: ['attribution-model', 'campaign-pl', 'channel-roas-report', 'budget-recommendation'],
    kpis: ['attribution-accuracy', 'marketing-revenue-contribution', 'overall-roas', 'forecast-accuracy'],
  },

  // ── Innovation & Future ──
  {
    id: 'MKT-060',
    name: 'Innovation Lab',
    role: 'Marketing Innovation & Emerging Channel Scout',
    description: 'Scouts emerging marketing channels, technologies, and tactics before competitors discover them. Tests new platforms, AI creative tools, immersive experiences, and community-building strategies. Applies Ford\'s innovation pipeline: scout → test → validate → scale. This agent ensures Coastal Key is always 12 months ahead of every competitor\'s marketing playbook.',
    division: 'MKT',
    tier: 'advanced',
    status: 'active',
    triggers: ['innovation-scan', 'new-platform-launch', 'technology-evaluation', 'pilot-program'],
    outputs: ['innovation-brief', 'pilot-results', 'technology-assessment', 'scale-recommendation'],
    kpis: ['first-mover-advantage', 'pilot-success-rate', 'innovation-adoption-speed', 'competitive-lead-time'],
  },
];
