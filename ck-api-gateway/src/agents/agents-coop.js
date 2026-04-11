/**
 * Coastal Key Cooperations Committee — Agent Definitions
 *
 * The Cooperations Committee (COOP) is a specialized cross-division unit
 * responsible for coordinating the CEO/Founder's real-time connections,
 * social engagements, and strategic relationship building with external
 * human entities for the advancement of Coastal Key Property Management LLC.
 *
 * Structure: 10 agents organized into 3 operational squads
 *   OUTREACH Squad (4): Identify, qualify, and initiate external relationships
 *   ENGAGEMENT Squad (3): Coordinate meetings, events, and social touchpoints
 *   INTELLIGENCE Squad (3): Track relationship ROI, map networks, and brief CEO
 *
 * Reporting: COOP reports directly to CEO via Agent-7 (Executive Dashboard)
 * Authority: Cross-division coordination power — can task EXC, MKT, SEN agents
 */

export const COOP_AGENTS = [
  // ── OUTREACH Squad ────────────────────────────────────────────────────────

  {
    id: 'COOP-001',
    name: 'Nexus Hunter',
    role: 'Strategic Contact Identifier',
    squad: 'OUTREACH',
    description: 'Scans industry events, conferences, real estate associations, and business networks to identify high-value connection targets for the CEO. Prioritizes by strategic alignment with Coastal Key goals: property management firms for acquisition, technology partners for platform integration, investors for capital, and municipal leaders for workforce housing initiatives.',
    division: 'COOP',
    tier: 'advanced',
    status: 'active',
    triggers: ['weekly-scan', 'event-calendar-update', 'expansion-target-identified'],
    outputs: ['target-contact-list', 'contact-profile-brief', 'connection-priority-score'],
    kpis: ['contacts-identified-per-week', 'target-accuracy-rate'],
    tools: ['gmail', 'linkedin-scan', 'airtable', 'slack'],
  },
  {
    id: 'COOP-002',
    name: 'Bridge Builder',
    role: 'Introduction and Warm Outreach Coordinator',
    squad: 'OUTREACH',
    description: 'Crafts personalized outreach messages for CEO-to-target introductions. Leverages mutual connections, shared interests, and strategic alignment to create warm introductions rather than cold contacts. Drafts emails, LinkedIn messages, and event-specific talking points.',
    division: 'COOP',
    tier: 'advanced',
    status: 'active',
    triggers: ['target-approved-by-ceo', 'mutual-connection-found', 'event-approaching'],
    outputs: ['outreach-draft', 'talking-points', 'introduction-request'],
    kpis: ['response-rate', 'meeting-conversion-rate'],
    tools: ['gmail', 'airtable', 'claude-inference'],
  },
  {
    id: 'COOP-003',
    name: 'Event Radar',
    role: 'Conference and Event Intelligence Officer',
    squad: 'OUTREACH',
    description: 'Monitors industry conferences, local chamber events, real estate investor meetups, NARPM conventions, proptech summits, and municipal housing forums. Recommends which events the CEO should attend based on target contact density, speaking opportunity potential, and strategic ROI.',
    division: 'COOP',
    tier: 'standard',
    status: 'active',
    triggers: ['monthly-event-scan', 'target-event-announced', 'speaking-opportunity'],
    outputs: ['event-calendar', 'attendance-recommendation', 'event-prep-brief'],
    kpis: ['events-identified-per-month', 'ceo-attendance-roi'],
    tools: ['web-search', 'gmail', 'airtable', 'slack'],
  },
  {
    id: 'COOP-004',
    name: 'Alliance Scout',
    role: 'Partnership and Alliance Prospector',
    squad: 'OUTREACH',
    description: 'Identifies potential strategic alliances: real estate brokerages for referral pipelines, insurance companies for bundled services, technology vendors for platform integration, and community organizations for workforce housing partnerships. Coordinates with EXC-006 (Partnership Forge) for formal deal structuring.',
    division: 'COOP',
    tier: 'standard',
    status: 'active',
    triggers: ['alliance-opportunity', 'vendor-inquiry', 'referral-partner-identified'],
    outputs: ['alliance-scorecard', 'partner-brief', 'referral-terms-draft'],
    kpis: ['alliances-proposed-per-quarter', 'partner-conversion-rate'],
    tools: ['airtable', 'slack', 'gmail'],
  },

  // ── ENGAGEMENT Squad ──────────────────────────────────────────────────────

  {
    id: 'COOP-005',
    name: 'Calendar Command',
    role: 'CEO Social Calendar Manager',
    squad: 'ENGAGEMENT',
    description: 'Manages the CEO external engagement calendar. Schedules meetings, lunches, coffee conversations, and site visits with strategic contacts. Ensures no scheduling conflicts, prepares pre-meeting briefs, and coordinates logistics. Limits CEO external time to 5-8 hours per week maximum to preserve the 1% operating model.',
    division: 'COOP',
    tier: 'advanced',
    status: 'active',
    triggers: ['meeting-request', 'event-confirmed', 'weekly-calendar-review'],
    outputs: ['calendar-block', 'pre-meeting-brief', 'logistics-confirmation'],
    kpis: ['meetings-per-week', 'ceo-time-utilization', 'no-show-rate'],
    tools: ['google-calendar', 'gmail', 'airtable', 'slack'],
    constraints: {
      maxMeetingsPerWeek: 6,
      maxHoursPerWeek: 8,
      blackoutDays: ['Sunday'],
      preferredTimes: ['10:00-12:00', '14:00-16:00'],
      bufferMinutes: 30,
    },
  },
  {
    id: 'COOP-006',
    name: 'Presence Architect',
    role: 'CEO Public Presence and Speaking Coordinator',
    squad: 'ENGAGEMENT',
    description: 'Coordinates CEO speaking engagements, podcast appearances, panel participations, and media interviews. Prepares talking points, bio variations, and presentation materials. Positions David Hauer as the thought leader in AI-powered property management and the Florida workforce housing movement.',
    division: 'COOP',
    tier: 'advanced',
    status: 'active',
    triggers: ['speaking-invitation', 'podcast-request', 'media-inquiry'],
    outputs: ['speaking-prep-kit', 'talking-points', 'bio-variation', 'presentation-deck'],
    kpis: ['appearances-per-month', 'audience-reach', 'media-mentions'],
    tools: ['claude-inference', 'airtable', 'slack', 'gmail'],
  },
  {
    id: 'COOP-007',
    name: 'Follow Through',
    role: 'Post-Meeting Action and Relationship Nurture',
    squad: 'ENGAGEMENT',
    description: 'Executes post-meeting follow-ups within 24 hours. Sends thank-you notes, shares promised materials, creates Airtable records for new contacts, and schedules follow-up touchpoints. Maintains a 30/60/90-day nurture cadence for strategic relationships.',
    division: 'COOP',
    tier: 'standard',
    status: 'active',
    triggers: ['meeting-completed', 'follow-up-due', 'nurture-touchpoint'],
    outputs: ['follow-up-email', 'airtable-contact-record', 'nurture-schedule'],
    kpis: ['follow-up-within-24h-rate', 'relationship-retention-rate'],
    tools: ['gmail', 'airtable', 'slack'],
  },

  // ── INTELLIGENCE Squad ────────────────────────────────────────────────────

  {
    id: 'COOP-008',
    name: 'Network Mapper',
    role: 'Relationship Network Analyst',
    squad: 'INTELLIGENCE',
    description: 'Maps the CEO relationship network: who knows who, influence scores, mutual connections, and strategic value of each relationship. Identifies network gaps and recommends targeted introductions to fill them. Maintains the master relationship database in Airtable.',
    division: 'COOP',
    tier: 'advanced',
    status: 'active',
    triggers: ['new-contact-added', 'quarterly-network-review', 'gap-analysis-request'],
    outputs: ['network-map', 'influence-ranking', 'gap-report', 'introduction-recommendations'],
    kpis: ['network-size', 'network-density', 'strategic-coverage-score'],
    tools: ['airtable', 'claude-inference', 'slack'],
  },
  {
    id: 'COOP-009',
    name: 'ROI Tracker',
    role: 'Relationship Return-on-Investment Analyst',
    squad: 'INTELLIGENCE',
    description: 'Tracks the business outcomes generated from CEO relationships: referrals received, deals sourced, partnerships formed, speaking invitations, media coverage, and investor introductions. Attributes revenue to specific relationships and calculates relationship ROI.',
    division: 'COOP',
    tier: 'standard',
    status: 'active',
    triggers: ['deal-closed', 'referral-received', 'quarterly-roi-review'],
    outputs: ['relationship-roi-report', 'top-relationships-ranking', 'attribution-analysis'],
    kpis: ['revenue-attributed-to-relationships', 'referral-rate', 'roi-per-hour-invested'],
    tools: ['airtable', 'slack'],
  },
  {
    id: 'COOP-010',
    name: 'CEO Briefer',
    role: 'Daily CEO Intelligence and Preparation Brief',
    squad: 'INTELLIGENCE',
    description: 'Delivers the daily CEO cooperation brief: upcoming meetings with contact profiles, relationship context, strategic talking points, and action items from previous engagements. Posted to Slack #ceo-dashboard at 7:00 AM ET daily. This is the CEO preparation layer before any external interaction.',
    division: 'COOP',
    tier: 'advanced',
    status: 'active',
    triggers: ['daily-7am-et', 'meeting-in-2-hours', 'urgent-contact-update'],
    outputs: ['daily-coop-brief', 'contact-profile-card', 'meeting-prep-notes'],
    kpis: ['brief-delivery-on-time', 'ceo-preparedness-score'],
    tools: ['airtable', 'slack', 'gmail', 'google-calendar'],
  },
];

// ── Committee Structure ─────────────────────────────────────────────────────

export const COOPERATIONS_COMMITTEE = {
  id: 'COOP',
  name: 'Coastal Key Cooperations Committee',
  charter: 'Coordinate the CEO/Founder toward real-time connections and social engagements with human entities for the advancement and accomplishment of Coastal Key Property Management LLC.',
  agentCount: 10,
  reportingTo: 'CEO (direct) via Agent-7 Executive Dashboard',
  crossDivisionAuthority: ['EXC', 'MKT', 'SEN', 'INT'],

  squads: {
    OUTREACH: {
      name: 'Outreach Squad',
      agents: ['COOP-001', 'COOP-002', 'COOP-003', 'COOP-004'],
      mission: 'Identify, qualify, and initiate strategic external relationships',
      cadence: 'Weekly target list generation, daily outreach execution',
    },
    ENGAGEMENT: {
      name: 'Engagement Squad',
      agents: ['COOP-005', 'COOP-006', 'COOP-007'],
      mission: 'Coordinate meetings, events, speaking engagements, and follow-through',
      cadence: 'Real-time calendar management, 24-hour follow-up SLA',
    },
    INTELLIGENCE: {
      name: 'Intelligence Squad',
      agents: ['COOP-008', 'COOP-009', 'COOP-010'],
      mission: 'Track relationship ROI, map networks, and prepare CEO intelligence briefs',
      cadence: 'Daily brief at 7:00 AM ET, quarterly network review',
    },
  },

  operatingPrinciples: [
    'CEO external time is capped at 8 hours per week. Every minute must have strategic ROI.',
    'No cold outreach. Every contact is warm-introduced or context-rich.',
    'Follow-up within 24 hours. No relationship dies from neglect.',
    'Every relationship is tracked in Airtable. No unrecorded contacts.',
    'Quarterly network audit: prune low-value, double down on high-value.',
    'CEO never walks into a meeting unprepared. Brief delivered minimum 2 hours before.',
    'All engagements serve at least one Coastal Key strategic goal.',
  ],

  targetCategories: [
    { category: 'Acquisition Targets', description: 'PM firms with 50-500 units for potential acquisition', priority: 'P1' },
    { category: 'Referral Partners', description: 'Real estate brokerages, insurance agents, mortgage lenders', priority: 'P1' },
    { category: 'Technology Partners', description: 'PropTech vendors, AI companies, smart home platforms', priority: 'P2' },
    { category: 'Investors', description: 'PE firms, family offices, angel investors in real estate', priority: 'P1' },
    { category: 'Municipal Leaders', description: 'County commissioners, housing authority directors, CLT boards', priority: 'P2' },
    { category: 'Industry Associations', description: 'NARPM, NAR, CAI, Florida Realtors, local chambers', priority: 'P2' },
    { category: 'Media and Influencers', description: 'RE podcasts, industry publications, local media', priority: 'P3' },
    { category: 'Vendor Network', description: 'HVAC, plumbing, landscaping, cleaning, insurance providers', priority: 'P2' },
  ],

  kpiDashboard: {
    weekly: [
      'New strategic contacts identified',
      'Outreach messages sent',
      'Meetings scheduled for CEO',
      'Follow-ups completed within 24h SLA',
    ],
    monthly: [
      'Total active relationships',
      'Referrals received from network',
      'Revenue attributed to relationships',
      'CEO time invested vs ROI generated',
      'Speaking engagements completed',
      'Events attended',
    ],
    quarterly: [
      'Network growth rate',
      'Relationship ROI ranking',
      'Network gap analysis',
      'Strategic coverage score across all 8 target categories',
    ],
  },
};
