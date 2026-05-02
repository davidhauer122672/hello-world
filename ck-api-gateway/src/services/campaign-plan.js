/**
 * 7-Day R&D Campaign Plan — Structured Data Module
 *
 * Source: Verified Edition synthesizing R&D Agents 1, 2, and 3.
 * Classification: Executive Strategy & Operations Directive.
 */

const CAMPAIGN_META = {
  id: 'CK-CAMPAIGN-7DAY-2026Q2',
  title: 'Coastal Key Enterprise 7-Day R&D Campaign',
  preparedFor: 'CEO Danny, Coastal Key Enterprise',
  classification: 'Executive Strategy & Operations Directive',
  startDate: '2026-04-14',
  endDate: '2026-04-20',
  status: 'active',
  version: '1.0.0',
};

const COMPETITOR_MATRIX = [
  {
    influencer: 'Dan Martell',
    subscribers: '2.53M',
    subscribersVerified: true,
    contentStrategy: 'Hook-heavy, SaaS scaling, mindset',
    keyTools: ['ChatGPT', 'Zapier', 'Manus AI', 'n8n'],
    businessModel: 'SaaS Academy, Ventures, Books',
    frameworks: ['Buy Back Your Time', 'DRIP Matrix', 'Replacement Ladder'],
    relevance: 'high',
    relevanceNote: 'Blueprint for scaling, delegation, and executive positioning.',
  },
  {
    influencer: 'Jeff Su',
    subscribers: '1.67M',
    subscribersVerified: true,
    contentStrategy: 'Polished, time-bound productivity',
    keyTools: ['ChatGPT', 'Notion', 'Gemini'],
    businessModel: 'Ad revenue, sponsorships, courses',
    frameworks: ['Micro-automations', 'Answer Leveling'],
    relevance: 'medium',
    relevanceNote: 'Standard for content production quality and proprietary IP.',
    corrections: ['Sora 2 recommendation INVALID — OpenAI discontinued March 2026'],
  },
  {
    influencer: 'Varun Mayya',
    subscribers: '1.09M',
    subscribersVerified: true,
    contentStrategy: 'Episodic (KATA), tech ecosystem',
    keyTools: ['N8N', 'Claude', 'Cursor', 'v0.app'],
    businessModel: '100x Engineers cohort, consulting',
    frameworks: ['VibeCoding', 'RAG agents'],
    relevance: 'medium',
    relevanceNote: 'Rapid prototyping and structured educational funnels.',
    corrections: ['Meta partnership claim UNVERIFIABLE'],
  },
  {
    influencer: 'The MIT Monk',
    subscribers: '823K',
    subscribersVerified: true,
    contentStrategy: 'Executive strategy, aspirational',
    keyTools: ['ChatGPT'],
    businessModel: 'Advisory, consulting, ad revenue',
    frameworks: ['Systems Thinking', 'CEO Time Management'],
    relevance: 'high',
    relevanceNote: 'Model for CEO personal brand and enterprise authority.',
    corrections: ['Multi-millionaire and $40B value claims are SELF-REPORTED'],
  },
  {
    influencer: 'Liam Ottley',
    subscribers: '759K',
    subscribersVerified: true,
    contentStrategy: 'Ultra-long masterclasses, agency',
    keyTools: ['Claude Code', 'n8n', 'Retell'],
    businessModel: 'AAA Accelerator ($11M+ self-reported), Agency',
    frameworks: ['AIOS (self-reported)', 'Forward Deployed Engineer (Palantir-originated)'],
    relevance: 'high',
    relevanceNote: 'Framework for packaging AI as an Operating System.',
    corrections: [
      'Revenue revised to $11M+ (official site) from $18M+ claim',
      'Claude Code 70% automation claim is UNVERIFIED influencer hyperbole',
      'AIOS 5-layer structure is SELF-REPORTED, unverified in public sources',
      'Forward Deployed Engineer originated at Palantir, not Ottley',
    ],
  },
  {
    influencer: 'Ben AI',
    subscribers: '136K',
    subscribersVerified: true,
    contentStrategy: 'Deep technical tutorials, early-mover',
    keyTools: ['Claude Cowork', 'Relevance AI', 'N8N'],
    businessModel: 'Accelerator, High-ticket Agency',
    frameworks: ['20+ Agent Teams', 'Boring Niches'],
    relevance: 'critical',
    relevanceNote: 'Exact technical and operational model Coastal Key should adopt.',
    corrections: [
      '$110K+/month and $127K LinkedIn revenue are SELF-REPORTED only',
      'Founder status: 2-time (per Microsoft Learn), not 3-time as claimed',
      'Claude Cowork currently in research preview, not fully mature',
    ],
  },
  {
    influencer: 'AI Edge',
    subscribers: '31.4K',
    subscribersVerified: true,
    contentStrategy: 'Beginner guides, trend surfing',
    keyTools: ['Claude', 'OpenClaw'],
    businessModel: 'Affiliate, Lead Gen, Ad revenue',
    frameworks: ['Life Gamification', 'Rapid Deployment'],
    relevance: 'low',
    relevanceNote: 'Useful for top-of-funnel audience capture tactics.',
    corrections: ['OpenClaw formerly known as Clawdbot/Moltbot (rebranded)'],
  },
];

const UNINCORPORATED_SYSTEMS = [
  {
    id: 'UIS-001',
    name: 'Enterprise AI Operating System (AIOS) Positioning',
    priority: 'critical',
    description: 'Shift marketing from "we build AI tools" to "we install a proprietary AIOS for your business."',
    source: 'Liam Ottley, Ben AI',
  },
  {
    id: 'UIS-002',
    name: 'Multi-Agent Team Architectures',
    priority: 'critical',
    description: 'Deploy standardized 15-20 agent teams for specific departmental functions (Marketing, Sales, Ops).',
    source: 'Ben AI',
  },
  {
    id: 'UIS-003',
    name: 'Productization of Boring Niches',
    priority: 'high',
    description: 'Package backend automations (CRM, data reporting, ad management) into standardized $2,500-$5,000/mo retainers.',
    source: 'Ben AI',
  },
  {
    id: 'UIS-004',
    name: 'Buy Back Your Time DRIP Matrix',
    priority: 'high',
    description: 'CEO operates only in the "Produce" quadrant, delegating all other tasks to AI agents.',
    source: 'Dan Martell',
  },
  {
    id: 'UIS-005',
    name: 'Proprietary Prompt Architecture',
    priority: 'high',
    description: 'Develop and trademark a library of Master Prompts and System Prompts as core IP.',
    source: 'Jeff Su, Ben AI',
  },
  {
    id: 'UIS-006',
    name: 'Executive Thought Leadership Engine',
    priority: 'high',
    description: 'Launch a high-volume content series featuring CEO Danny on AI capital strategy and enterprise infrastructure.',
    source: 'The MIT Monk, Dan Martell',
  },
  {
    id: 'UIS-007',
    name: 'Free Template Funnel',
    priority: 'medium',
    description: 'Create a "Coastal Key Enterprise AI Playbook" as a high-value lead magnet for enterprise email capture.',
    source: 'Varun Mayya, Liam Ottley',
  },
  {
    id: 'UIS-008',
    name: 'Forward Deployed Engineer Scaling',
    priority: 'medium',
    description: 'Centralize core development while using AI agents to customize the final 20% of client deployments.',
    source: 'Palantir (via Liam Ottley)',
  },
];

const DAILY_PLAN = [
  {
    day: 1,
    date: '2026-04-14',
    phase: 'Strategic Alignment & Infrastructure Audit',
    tasks: [
      { division: 'CEO', action: 'Review DRIP Matrix. Identify tasks outside the Produce quadrant. Assign to Technology Division. Finalize Enterprise AIOS positioning.' },
      { division: 'TEC', action: 'Audit tech stack against Ben AI model (Claude Cowork + Relevance AI + N8N). Draft architecture for first standardized 15-agent team.' },
      { division: 'MKT', action: 'Design the Coastal Key Enterprise AI Playbook lead magnet. Outline first four episodes of CEO executive content series.' },
      { division: 'SMA', action: 'Analyze Jeff Su and Dan Martell hook structures and thumbnail designs. Generate 20 short-form content scripts.' },
    ],
  },
  {
    day: 2,
    date: '2026-04-15',
    phase: 'Strategic Alignment & Infrastructure Audit',
    tasks: [
      { division: 'CEO', action: 'Complete DRIP Matrix delegation assignments. Review AIOS positioning draft with CMO.' },
      { division: 'TEC', action: 'Complete tech stack audit report. Begin first agent team prototype.' },
      { division: 'MKT', action: 'Finalize Playbook outline and design brief. Complete content series storyboarding.' },
      { division: 'SMA', action: 'Finalize 20 content scripts. Begin thumbnail generation pipeline.' },
    ],
  },
  {
    day: 3,
    date: '2026-04-16',
    phase: 'Implementation of Priority Frameworks',
    tasks: [
      { division: 'CEO', action: 'Record first two executive thought leadership videos: AIOS concept and Buy Back Your Time for enterprises.' },
      { division: 'TEC', action: 'Deploy first Boring Niche productized system (automated CRM reporting). Establish proprietary Master Prompt library.' },
      { division: 'MKT', action: 'Launch free template funnel landing page. Begin integrating prompt architecture into marketing materials.' },
      { division: 'OPS', action: 'Implement Camcorder Method: record all manual internal processes to generate AI training data.' },
    ],
  },
  {
    day: 4,
    date: '2026-04-17',
    phase: 'Implementation of Priority Frameworks',
    tasks: [
      { division: 'CEO', action: 'Review and approve first productized system. Record episodes 3-4 of content series.' },
      { division: 'TEC', action: 'Finalize Master Prompt library v1.0. Complete multi-agent team architecture internal testing.' },
      { division: 'MKT', action: 'Complete funnel landing page QA. Draft email capture sequence for Playbook.' },
      { division: 'OPS', action: 'Complete process recording. Begin documentation audit for Forward Deployed Engineer protocol.' },
    ],
  },
  {
    day: 5,
    date: '2026-04-18',
    phase: 'Execution of Content & Acquisition Strategies',
    tasks: [
      { division: 'CEO', action: 'High-leverage partnership outreach targeting complementary enterprise software providers.' },
      { division: 'TEC', action: 'Finalize Forward Deployed Engineer protocol for client customization. Internal stress-test of multi-agent team.' },
      { division: 'MKT', action: 'Distribute CEO content across YouTube and LinkedIn. Activate email capture sequence.' },
      { division: 'SMA', action: 'Deploy 20 short-form videos across TikTok, Reels, and Shorts. Test hook viability.' },
    ],
  },
  {
    day: 6,
    date: '2026-04-19',
    phase: 'Execution of Content & Acquisition Strategies',
    tasks: [
      { division: 'CEO', action: 'Follow up on partnership outreach. Review initial content engagement metrics.' },
      { division: 'TEC', action: 'Resolve any issues from internal stress-test. Prepare deployment package for productized services.' },
      { division: 'MKT', action: 'Monitor funnel conversions. A/B test email subject lines. Optimize landing page.' },
      { division: 'SMA', action: 'Analyze short-form performance metrics. Double down on top-performing hooks.' },
    ],
  },
  {
    day: 7,
    date: '2026-04-20',
    phase: 'Integration Review & Capital Engine Assessment',
    tasks: [
      { division: 'ALL', action: 'Comprehensive campaign review across all divisions.' },
      { division: 'CEO', action: 'Assess: lead magnet conversion rate, internal hours saved, engagement metrics, technical stability.' },
      { division: 'TEC', action: 'Finalize pricing model for productized services. Prepare full market launch package.' },
      { division: 'MKT', action: 'Compile campaign analytics report. Recommend Phase 2 content calendar.' },
    ],
  },
];

const EXPECTED_OUTCOMES = [
  { id: 'EO-001', outcome: 'Operational Efficiency', target: '30% reduction in manual internal tasks via DRIP Matrix and new agent teams.' },
  { id: 'EO-002', outcome: 'Market Positioning', target: 'Complete rebrand from custom AI development to proprietary Enterprise AI Operating System.' },
  { id: 'EO-003', outcome: 'Financial Infrastructure', target: 'Capital Engine established with productized, high-margin recurring revenue streams.' },
  { id: 'EO-004', outcome: 'Brand Authority', target: 'CEO executive thought leadership channel launched with predictable inbound growth engine.' },
  { id: 'EO-005', outcome: 'Technical Supremacy', target: 'Multi-agent architectures (Claude Cowork + Relevance AI) integrated as standard deployment model.' },
];

const COMMS_PROTOCOL = {
  channels: [
    { from: 'R&D Agents', to: 'Social Media Agents', format: 'JSON briefs', frequency: 'daily', content: 'Trending hooks, thumbnail concepts, competitor data points.' },
    { from: 'R&D Agents', to: 'CMO', format: 'Market Intelligence Summary', frequency: 'daily', content: 'Competitor messaging shifts, new tool adoption.' },
    { from: 'R&D Agents', to: 'CTO', format: 'Immediate alerts', frequency: 'real-time', content: 'New technical frameworks, competitor agent architectures.' },
    { from: 'Division Heads', to: 'CEO Dashboard', format: 'Synthesized data', frequency: 'continuous', content: 'Unified campaign progress overview.' },
  ],
};

// ── Public API ──

export function getCampaignPlan() {
  return {
    ...CAMPAIGN_META,
    dailyPlan: DAILY_PLAN,
    unincorporatedSystems: UNINCORPORATED_SYSTEMS,
    competitorMatrix: COMPETITOR_MATRIX,
    expectedOutcomes: EXPECTED_OUTCOMES,
    communicationsProtocol: COMMS_PROTOCOL,
    totalDays: 7,
    totalPhases: 4,
    divisionsEngaged: ['CEO', 'TEC', 'MKT', 'OPS', 'SMA'],
  };
}

export function getCampaignDay(dayNumber) {
  const day = DAILY_PLAN.find(d => d.day === dayNumber);
  if (!day) return null;
  return {
    ...CAMPAIGN_META,
    day,
    progress: `Day ${dayNumber} of 7`,
    percentComplete: Math.round((dayNumber / 7) * 100),
  };
}

export function getCampaignStatus() {
  const now = new Date();
  const start = new Date(CAMPAIGN_META.startDate);
  const end = new Date(CAMPAIGN_META.endDate);
  const currentDay = Math.min(7, Math.max(1, Math.ceil((now - start) / (1000 * 60 * 60 * 24)) + 1));
  const isActive = now >= start && now <= end;

  return {
    campaignId: CAMPAIGN_META.id,
    status: isActive ? 'active' : now < start ? 'scheduled' : 'completed',
    currentDay: isActive ? currentDay : null,
    phase: isActive && currentDay <= 7 ? DAILY_PLAN[Math.min(currentDay - 1, 6)].phase : null,
    startDate: CAMPAIGN_META.startDate,
    endDate: CAMPAIGN_META.endDate,
    percentComplete: isActive ? Math.round((currentDay / 7) * 100) : now >= end ? 100 : 0,
    outcomesTracked: EXPECTED_OUTCOMES.length,
    systemsToIntegrate: UNINCORPORATED_SYSTEMS.length,
    competitorsAnalyzed: COMPETITOR_MATRIX.length,
  };
}

export function getCompetitorMatrix() {
  return {
    campaignId: CAMPAIGN_META.id,
    competitors: COMPETITOR_MATRIX,
    totalAnalyzed: COMPETITOR_MATRIX.length,
    byRelevance: {
      critical: COMPETITOR_MATRIX.filter(c => c.relevance === 'critical').length,
      high: COMPETITOR_MATRIX.filter(c => c.relevance === 'high').length,
      medium: COMPETITOR_MATRIX.filter(c => c.relevance === 'medium').length,
      low: COMPETITOR_MATRIX.filter(c => c.relevance === 'low').length,
    },
    verificationStatus: 'All subscriber counts independently verified. Revenue claims annotated with verification level.',
  };
}

export function getUnincorporatedSystems() {
  return {
    campaignId: CAMPAIGN_META.id,
    systems: UNINCORPORATED_SYSTEMS,
    total: UNINCORPORATED_SYSTEMS.length,
    byPriority: {
      critical: UNINCORPORATED_SYSTEMS.filter(s => s.priority === 'critical').length,
      high: UNINCORPORATED_SYSTEMS.filter(s => s.priority === 'high').length,
      medium: UNINCORPORATED_SYSTEMS.filter(s => s.priority === 'medium').length,
    },
  };
}
