/**
 * Coastal Key Foundation — Configuration
 *
 * Defines the foundation entity, fundraising campaigns,
 * donation tiers, and the CEO RISE Campaign structure.
 */

export const FOUNDATION = {
  name: 'Coastal Key Foundation',
  legalEntity: 'Coastal Key Property Management LLC',
  owner: 'David Hauer',
  mission: 'Supporting enterprise growth, international business development, and angel investor outreach for Coastal Key Property Management through community-powered fundraising.',
  website: 'https://coastalkey-pm.com/foundation',
  contactEmail: 'foundation@coastalkey-pm.com',

  // ── Social Media ──
  social: {
    instagram: '@coastalkeypm',
    facebook: 'CoastalKeyPropertyManagement',
    linkedin: 'coastal-key-property-management-llc',
  },

  // ── Airtable Integration ──
  airtable: {
    baseId: 'appUSnNgpDkcEOzhN',
    tables: {
      donors: 'Foundation Donors',
      campaigns: 'Foundation Campaigns',
      donations: 'Foundation Donations',
      events: 'Foundation Events',
    },
  },
};

// ── CEO RISE Campaign ───────────────────────────────────────────────────────

export const CEO_RISE_CAMPAIGN = {
  id: 'RISE-001',
  name: 'CEO RISE Campaign',
  fullName: 'CEO Rapid International Strategy & Expansion Campaign',
  status: 'active',
  owner: 'David Hauer',
  company: 'Coastal Key Property Management LLC',
  description: 'Fundraising campaign to support David Hauer, owner of Coastal Key Property Management LLC, in establishing international business relationships, attending global real estate conferences, and securing angel investor partnerships to scale enterprise operations.',

  // ── Financial Targets ──
  targets: {
    phase1: { label: 'Launch & Domestic Expansion', goal: 15000, currency: 'USD' },
    phase2: { label: 'International Travel & Conferences', goal: 35000, currency: 'USD' },
    phase3: { label: 'Angel Investor Summit Circuit', goal: 75000, currency: 'USD' },
    stretch: { label: 'Global Partnership Fund', goal: 150000, currency: 'USD' },
  },

  // ── Travel Categories ──
  travelCategories: [
    { id: 'domestic_conferences', label: 'Domestic Real Estate Conferences', priority: 'high' },
    { id: 'international_meetings', label: 'International Business Meetings', priority: 'high' },
    { id: 'investor_summits', label: 'Angel Investor Summits', priority: 'critical' },
    { id: 'partnership_visits', label: 'Strategic Partnership Visits', priority: 'medium' },
    { id: 'market_research', label: 'International Market Research', priority: 'medium' },
  ],

  // ── Campaign Channels ──
  channels: [
    { platform: 'gofundme', status: 'pending_setup', url: null },
    { platform: 'website', status: 'active', url: 'https://coastalkey-pm.com/foundation/rise' },
    { platform: 'instagram', status: 'active', handle: '@coastalkeypm' },
    { platform: 'facebook', status: 'active', page: 'CoastalKeyPropertyManagement' },
    { platform: 'linkedin', status: 'active', page: 'coastal-key-property-management-llc' },
    { platform: 'email', status: 'active', list: 'CEO RISE Campaign Supporters' },
  ],

  // ── Donor Tiers ──
  donorTiers: [
    { name: 'Supporter', minAmount: 1, maxAmount: 49, perks: ['Thank-you email', 'Foundation newsletter'] },
    { name: 'Advocate', minAmount: 50, maxAmount: 249, perks: ['Supporter perks', 'Quarterly impact report', 'Social media shoutout'] },
    { name: 'Champion', minAmount: 250, maxAmount: 999, perks: ['Advocate perks', 'Personalized video thank-you', 'Name on Foundation wall'] },
    { name: 'Visionary', minAmount: 1000, maxAmount: 4999, perks: ['Champion perks', 'Invitation to annual gala', 'Quarterly investor briefing'] },
    { name: 'Angel Partner', minAmount: 5000, maxAmount: null, perks: ['Visionary perks', 'Private meeting with CEO', 'Advisory board invitation', 'Co-investment opportunity access'] },
  ],

  // ── Milestones ──
  milestones: [
    { percent: 10, label: 'Ignition', action: 'Announce publicly + first social media push' },
    { percent: 25, label: 'Momentum', action: 'Launch peer-to-peer fundraising + email blast' },
    { percent: 50, label: 'Halfway', action: 'Celebration video + press release + stretch goal reveal' },
    { percent: 75, label: 'Final Push', action: 'Urgency campaign + ambassador activation' },
    { percent: 100, label: 'Goal Reached', action: 'Thank-you gala + impact report + next phase announcement' },
  ],
};

// ── Donation Source Types ────────────────────────────────────────────────────

export const DONATION_SOURCES = [
  'gofundme',
  'website_form',
  'direct_transfer',
  'event_ticket',
  'corporate_sponsor',
  'peer_to_peer',
  'email_campaign',
  'social_media',
  'manual_entry',
];

// ── Fundraising Campaign Templates ──────────────────────────────────────────

export const CAMPAIGN_TEMPLATES = [
  {
    id: 'ceo-rise',
    name: 'CEO RISE Campaign',
    type: 'travel_funding',
    template: 'rise',
  },
  {
    id: 'angel-outreach',
    name: 'Angel Investor Outreach Fund',
    type: 'investor_relations',
    template: 'investor',
  },
  {
    id: 'community-growth',
    name: 'Community Growth Initiative',
    type: 'community',
    template: 'community',
  },
  {
    id: 'tech-innovation',
    name: 'Technology Innovation Fund',
    type: 'technology',
    template: 'innovation',
  },
  {
    id: 'international-expansion',
    name: 'International Expansion Fund',
    type: 'expansion',
    template: 'global',
  },
];

export default FOUNDATION;
