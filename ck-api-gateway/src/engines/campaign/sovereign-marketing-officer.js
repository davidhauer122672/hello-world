/**
 * Sovereign Marketing Officer (SMO) — AI Agent
 *
 * Agent ID: SMO-001
 * Reports to: MCCO-000 (Sovereign)
 * Division: MCCO Command
 *
 * Responsibilities:
 *   1. Market analysis — TAM/SAM/SOM, demand trends, capital flow
 *   2. Problem identification — Top 10 industry problems scored
 *   3. Offer architecture — High-converting landing page offers
 *   4. Distribution planning — 30-day cross-platform campaigns
 *   5. Competitive intelligence — Data-backed market positioning
 *
 * This agent operates in parallel with the Peak-Time Intelligence Engine,
 * feeding strategic intelligence into every content decision.
 */

// ── Agent Definition ───────────────────────────────────────────────────────

export const SMO_AGENT = {
  id: 'SMO-001',
  name: 'Sovereign Marketing Officer',
  role: 'Enterprise Market Intelligence & Campaign Strategist',
  division: 'MCCO',
  tier: 'advanced',
  status: 'active',
  reportsTo: 'MCCO-000',
  description: 'Sovereign-level marketing intelligence officer. Conducts data-backed market analysis, identifies underserved opportunities, architects high-converting offers, and builds distribution plans across all target segments. Operates in parallel with Peak-Time Intelligence Engine to ensure every campaign is strategically grounded.',
  triggers: [
    'campaign-launch',
    'market-analysis-request',
    'offer-creation',
    'distribution-planning',
    'competitive-intelligence',
    'quarterly-review',
  ],
  outputs: [
    'market-sizing-report',
    'demand-trend-analysis',
    'opportunity-map',
    'capital-flow-report',
    'problem-scoring-matrix',
    'offer-architecture',
    'distribution-plan',
    'competitive-brief',
  ],
  kpis: [
    'market-coverage-accuracy',
    'offer-conversion-rate',
    'campaign-roi',
    'lead-quality-score',
    'distribution-reach',
  ],
  capabilities: {
    marketSizing: true,
    demandTrends: true,
    competitiveIntel: true,
    offerArchitecture: true,
    distributionPlanning: true,
    problemScoring: true,
    capitalFlowTracking: true,
  },
};

// ── Target Audience Segments ───────────────────────────────────────────────

export const TARGET_SEGMENTS = [
  { id: 'SEG-001', name: 'Seasonal Home Owners', priority: 'primary', estimatedSize: '4.2M households', avgPropertyValue: '$450K-$2M' },
  { id: 'SEG-002', name: 'Absentee Investors', priority: 'primary', estimatedSize: '2.8M individuals', avgPropertyValue: '$500K-$5M' },
  { id: 'SEG-003', name: 'Home Watch & Property Management Seekers', priority: 'primary', estimatedSize: '1.5M active searchers/yr', avgPropertyValue: '$350K-$1.5M' },
  { id: 'SEG-004', name: 'Large Real Estate Brokers (AI Software)', priority: 'primary', estimatedSize: '86,000 brokerages', avgDealSize: '$25K-$150K ARR' },
  { id: 'SEG-005', name: 'AirBnB Owners', priority: 'secondary', estimatedSize: '1.1M US hosts', avgPropertyValue: '$300K-$1.2M' },
  { id: 'SEG-006', name: 'Zillow End Users', priority: 'secondary', estimatedSize: '36M monthly visitors', avgPropertyValue: '$250K-$800K' },
  { id: 'SEG-007', name: 'Real Estate Professionals', priority: 'secondary', estimatedSize: '1.5M licensed agents', avgDealSize: '$5K-$50K' },
  { id: 'SEG-008', name: 'International Property Owners', priority: 'tertiary', estimatedSize: '3.4M foreign-owned US properties', avgPropertyValue: '$500K-$10M' },
  { id: 'SEG-009', name: 'Executive-Level Business Conglomerates', priority: 'tertiary', estimatedSize: '12,000 firms', avgDealSize: '$100K-$500K ARR' },
  { id: 'SEG-010', name: 'Land Trusts', priority: 'tertiary', estimatedSize: '1,700+ land trusts US', avgHolding: '$5M-$50M AUM' },
  { id: 'SEG-011', name: 'COOP Trust Trustees', priority: 'tertiary', estimatedSize: '85,000 cooperatives', avgPropertyValue: '$1M-$20M' },
  { id: 'SEG-012', name: 'Irrevocable Trust Trustees', priority: 'secondary', estimatedSize: '2.1M active trusts', avgAUM: '$1M-$25M' },
  { id: 'SEG-013', name: 'Revocable Trust Trustees', priority: 'secondary', estimatedSize: '18M living trusts', avgAUM: '$500K-$5M' },
  { id: 'SEG-014', name: 'Estate Executors', priority: 'secondary', estimatedSize: '2.6M estates/yr', avgPropertyValue: '$400K-$3M' },
  { id: 'SEG-015', name: 'Condominium Associations', priority: 'primary', estimatedSize: '370,000 associations', avgBudget: '$50K-$500K/yr' },
  { id: 'SEG-016', name: 'HOAs', priority: 'primary', estimatedSize: '365,000 HOAs', avgBudget: '$100K-$2M/yr' },
  { id: 'SEG-017', name: 'Realtors & Residential Agents', priority: 'secondary', estimatedSize: '1.5M licensed', avgReferralValue: '$2K-$15K' },
  { id: 'SEG-018', name: 'Commercial Real Estate Agents', priority: 'secondary', estimatedSize: '125,000 CRE agents', avgDealSize: '$10K-$100K' },
  { id: 'SEG-019', name: 'Real Estate Brokers', priority: 'primary', estimatedSize: '86,000 brokerages', avgDealSize: '$25K-$250K' },
  { id: 'SEG-020', name: 'General Contractors', priority: 'tertiary', estimatedSize: '780,000 GCs', avgProjectValue: '$50K-$500K' },
  { id: 'SEG-021', name: 'City Government Officials', priority: 'tertiary', estimatedSize: '19,500 municipalities', avgContractValue: '$100K-$1M' },
  { id: 'SEG-022', name: 'International Business Partners', priority: 'tertiary', estimatedSize: '5,000+ potential', avgDealSize: '$50K-$500K ARR' },
  { id: 'SEG-023', name: 'Global Property Management Enterprises', priority: 'primary', estimatedSize: '340 enterprise firms', avgContractValue: '$250K-$2M ARR' },
  { id: 'SEG-024', name: 'National Home Watch Professionals', priority: 'primary', estimatedSize: '12,000 operators', avgRevenue: '$75K-$500K/yr' },
  { id: 'SEG-025', name: 'Global Vacation Rental Enterprises', priority: 'secondary', estimatedSize: '4,500 operators', avgPortfolio: '50-5000 units' },
  { id: 'SEG-026', name: 'Time Share Owners', priority: 'tertiary', estimatedSize: '9.9M owners', avgMaintenance: '$1K-$3K/yr' },
  { id: 'SEG-027', name: 'Time Share Operators', priority: 'tertiary', estimatedSize: '1,500 operators', avgPortfolio: '$10M-$500M' },
  { id: 'SEG-028', name: 'Vacation Home Owners', priority: 'primary', estimatedSize: '7.4M households', avgPropertyValue: '$350K-$2.5M' },
  { id: 'SEG-029', name: 'AirBnB Homeowners', priority: 'secondary', estimatedSize: '1.1M US hosts', avgRevenue: '$25K-$150K/yr' },
  { id: 'SEG-030', name: 'Homes.com End Users', priority: 'tertiary', estimatedSize: '15M monthly visitors', avgPropertyValue: '$250K-$600K' },
  { id: 'SEG-031', name: 'Trulia.com End Users', priority: 'tertiary', estimatedSize: '28M monthly visitors', avgPropertyValue: '$300K-$700K' },
  { id: 'SEG-032', name: 'County Real Estate Boards', priority: 'tertiary', estimatedSize: '1,100 boards', avgMembership: '500-15,000 agents' },
  { id: 'SEG-033', name: 'Property Portfolio Owners', priority: 'primary', estimatedSize: '2.3M multi-property owners', avgPortfolioValue: '$1M-$50M' },
  { id: 'SEG-034', name: 'Traveling Executives', priority: 'secondary', estimatedSize: '4.8M frequent travelers', avgPropertyValue: '$500K-$3M' },
  { id: 'SEG-035', name: 'Frequent Flyers', priority: 'tertiary', estimatedSize: '6.2M elite status holders', avgIncome: '$200K+' },
  { id: 'SEG-036', name: 'Estate Owners', priority: 'primary', estimatedSize: '1.8M estates >$1M value', avgPropertyValue: '$1M-$25M' },
  { id: 'SEG-037', name: 'Vacation Travelers', priority: 'tertiary', estimatedSize: '180M domestic travelers', avgTripSpend: '$1,500-$5,000' },
  { id: 'SEG-038', name: 'Live-Aboard Boat Homeowners', priority: 'tertiary', estimatedSize: '120,000 live-aboards', avgVesselValue: '$200K-$2M' },
  { id: 'SEG-039', name: 'Hotel Owners', priority: 'tertiary', estimatedSize: '55,000 hotel properties', avgPropertyValue: '$2M-$100M' },
  { id: 'SEG-040', name: 'Board of Directors', priority: 'secondary', estimatedSize: '450,000 board seats', avgInfluence: 'Enterprise-level' },
];

// ── Business Types ─────────────────────────────────────────────────────────

export const BUSINESS_TYPES = [
  {
    id: 'BT-001',
    name: 'Coastal Key Estate Management',
    description: 'AI-powered home watch and full-service property management for the Treasure Coast of Florida',
    primarySegments: ['SEG-001', 'SEG-002', 'SEG-003', 'SEG-005', 'SEG-028', 'SEG-033', 'SEG-036'],
    revenueModel: 'Monthly recurring + setup fees + concierge add-ons',
  },
  {
    id: 'BT-002',
    name: 'Coastal Key Property Management Software',
    description: 'Enterprise SaaS platform for property managers, brokers, and HOAs to leverage AI automation',
    primarySegments: ['SEG-004', 'SEG-015', 'SEG-016', 'SEG-019', 'SEG-023', 'SEG-024'],
    revenueModel: 'SaaS subscription (monthly/annual) + implementation + API access fees',
  },
  {
    id: 'BT-003',
    name: 'Coastal Key Software Development',
    description: 'Custom AI-powered software solutions for real estate enterprises, government, and international partners',
    primarySegments: ['SEG-009', 'SEG-021', 'SEG-022', 'SEG-023', 'SEG-039'],
    revenueModel: 'Project-based + retainer + licensing + revenue share',
  },
];

/**
 * Generate the AI prompt for the Sovereign Marketing Officer
 * to produce comprehensive market analysis via Claude API.
 */
export function generateSMOAnalysisPrompt(businessType = 'all') {
  const bt = businessType === 'all'
    ? BUSINESS_TYPES.map(b => `- ${b.name}: ${b.description}`).join('\n')
    : BUSINESS_TYPES.find(b => b.id === businessType || b.name.toLowerCase().includes(businessType.toLowerCase()))?.description || 'Coastal Key Enterprise';

  return `You are SMO-001 "Sovereign Marketing Officer" — the Enterprise Market Intelligence & Campaign Strategist for Coastal Key, operating at Ferrari-Standard execution under Sovereign governance.

Business context:
${bt}

Target demographic: 45-65 year old high-net-worth individuals — absentee property owners, investors, family office managers, trust trustees, estate executors, HOA/condo association boards, real estate brokers, and international property holders.

Execute the following analysis with ZERO generic statements. Every data point must be specific, defensible, and actionable.

## SECTION 1: Market Sizing (TAM, SAM, SOM)

Provide estimated dollar values and state your assumptions clearly:
- **TAM** (Total Addressable Market): The entire home watch, property management, and PropTech software market
- **SAM** (Serviceable Addressable Market): The segment Coastal Key can realistically reach with current business model and geography
- **SOM** (Serviceable Obtainable Market): What Coastal Key can capture in 12-24 months with current resources

## SECTION 2: Top 5 Demand Trends

Each as a one-line headline plus two-sentence explanation. Must be specific to home watch and property management, not generic real estate trends.

## SECTION 3: Top 5 Underserved Opportunities

Specific gaps — not broad categories. Name the exact unmet need, who has it, and why no one is serving it well.

## SECTION 4: Follow the Money

3-5 areas where VC, PE, or acquirer capital is actively flowing in property management, PropTech, and home services. Name specific deal types, valuations, or investment thesis patterns.

Format each section with a bold heading, then concise bullet points. Total output: under 600 words.

Return as structured JSON with sections as keys.`;
}

/**
 * Get the full SMO agent status and capabilities.
 */
export function getSMOStatus() {
  return {
    agent: SMO_AGENT,
    targetSegments: {
      total: TARGET_SEGMENTS.length,
      primary: TARGET_SEGMENTS.filter(s => s.priority === 'primary').length,
      secondary: TARGET_SEGMENTS.filter(s => s.priority === 'secondary').length,
      tertiary: TARGET_SEGMENTS.filter(s => s.priority === 'tertiary').length,
    },
    businessTypes: BUSINESS_TYPES,
    operationalStatus: 'ACTIVE — Parallel execution with Peak-Time Intelligence Engine',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    timestamp: new Date().toISOString(),
  };
}
