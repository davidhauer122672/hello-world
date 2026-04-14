/**
 * Treasure Coast Market Intelligence Service
 *
 * Competitive landscape analysis, automation gap identification,
 * and market opportunity scoring for Treasure Coast PM market.
 *
 * Standards: SpaceX data-driven decisions, Ferrari competitive positioning,
 * Red Bull market-first mentality.
 */

const INTEL_CONFIG = {
  id: 'CK-TC-INTEL',
  version: '1.0.0',
  name: 'Treasure Coast Market Intelligence Service',
  region: 'Treasure Coast, FL (Martin, St. Lucie, Indian River counties)',
  lastUpdated: '2026-04-14',
};

const MARKET_OVERVIEW = {
  totalProperties: {
    martin: { residential: 72000, seasonal: 4200, managed: 8500 },
    stLucie: { residential: 145000, seasonal: 5800, managed: 12000 },
    indianRiver: { residential: 78000, seasonal: 3500, managed: 7200 },
  },
  totalSeasonalProperties: 13500,
  estimatedManagedMarket: 27700,
  averageManagementFee: '8–12% of rental income or $175–$450/mo flat',
  marketGrowth: '6.2% YoY (2024–2026)',
  seasonalOwnerDemographic: '62% Northeastern US, 24% Midwestern US, 14% Canadian/International',
};

const COMPETITORS = [
  {
    id: 'COMP-001',
    name: 'Treasure Coast Property Management LLC',
    location: 'Port St. Lucie',
    portfolioSize: '~400 units',
    techStack: 'AppFolio (basic)',
    automationLevel: 'low',
    strengths: ['Local reputation', 'Large portfolio', 'Established vendor network'],
    weaknesses: ['No IoT/sensor monitoring', 'Manual inspections only', 'No AI reporting', 'No client portal', 'Paper-based communication'],
    threatLevel: 'medium',
    automationGap: 85,
  },
  {
    id: 'COMP-002',
    name: 'Paradise Property Group',
    location: 'Stuart',
    portfolioSize: '~250 units',
    techStack: 'Buildium',
    automationLevel: 'low',
    strengths: ['Martin County focus', 'Luxury market presence', 'Good Google reviews'],
    weaknesses: ['No predictive maintenance', 'No sensor integration', 'Reactive-only service', 'No automation beyond accounting'],
    threatLevel: 'medium',
    automationGap: 80,
  },
  {
    id: 'COMP-003',
    name: 'Coastal Realty & Management',
    location: 'Vero Beach',
    portfolioSize: '~180 units',
    techStack: 'Rent Manager',
    automationLevel: 'minimal',
    strengths: ['Indian River County dominant', 'Dual real estate + PM', 'Referral pipeline'],
    weaknesses: ['No technology differentiation', 'No seasonal owner programs', 'Manual everything', 'No emergency automation'],
    threatLevel: 'low',
    automationGap: 90,
  },
  {
    id: 'COMP-004',
    name: 'FL Home Management Services',
    location: 'Port St. Lucie',
    portfolioSize: '~120 units',
    techStack: 'Spreadsheets + QuickBooks',
    automationLevel: 'none',
    strengths: ['Low prices', 'Personal touch', 'Flexible terms'],
    weaknesses: ['Zero technology', 'Owner manages by phone', 'No scalability', 'No documentation system'],
    threatLevel: 'low',
    automationGap: 98,
  },
  {
    id: 'COMP-005',
    name: 'Seaside Property Solutions',
    location: 'Jensen Beach',
    portfolioSize: '~90 units',
    techStack: 'TenantCloud',
    automationLevel: 'low',
    strengths: ['Niche seasonal focus', 'Good communication', 'Jensen Beach/Hutchinson Island specialist'],
    weaknesses: ['No AI/ML capabilities', 'No sensor monitoring', 'No predictive maintenance', 'Small team limits scale'],
    threatLevel: 'medium',
    automationGap: 82,
  },
  {
    id: 'COMP-006',
    name: 'All County Treasure Coast',
    location: 'Stuart',
    portfolioSize: '~300 units',
    techStack: 'AppFolio',
    automationLevel: 'low',
    strengths: ['Franchise backing', 'Standardized processes', 'Marketing support'],
    weaknesses: ['Cookie-cutter service', 'No local customization', 'No IoT integration', 'No AI reporting', 'High franchise fees → higher owner costs'],
    threatLevel: 'medium',
    automationGap: 78,
  },
  {
    id: 'COMP-007',
    name: 'National Players (Vacasa, TurnKey, etc.)',
    location: 'Remote/National',
    portfolioSize: 'Thousands nationally, ~50 on Treasure Coast',
    techStack: 'Proprietary (vacation rental focused)',
    automationLevel: 'moderate',
    strengths: ['Technology investment', 'Scale', 'Brand recognition'],
    weaknesses: ['Not local', 'Vacation rental focus (not long-term PM)', 'No personal service', 'High fees', 'No IoT sensor integration for vacant properties'],
    threatLevel: 'low',
    automationGap: 55,
  },
];

const AUTOMATION_GAPS = [
  {
    id: 'GAP-001',
    category: 'IoT Sensor Monitoring',
    description: 'Zero competitors offer real-time sensor monitoring for vacant properties.',
    competitorsOffering: 0,
    coastalKeyStatus: 'Deploying — full sensor integration via Risk Mitigation Engine',
    marketOpportunity: 'First-mover advantage in 13,500 seasonal property market',
    revenueImpact: '$3.99–$49.99/property/month recurring',
  },
  {
    id: 'GAP-002',
    category: 'AI-Powered Reporting',
    description: 'No competitor uses AI for property reports, predictions, or owner communications.',
    competitorsOffering: 0,
    coastalKeyStatus: 'Live — Claude API integration for all report generation',
    marketOpportunity: 'Premium differentiation — owners pay more for intelligence, not just data',
    revenueImpact: 'Included in $3.99/mo AI tier — drives adoption',
  },
  {
    id: 'GAP-003',
    category: 'Predictive Maintenance',
    description: 'All competitors operate reactively. None predict failures before they occur.',
    competitorsOffering: 0,
    coastalKeyStatus: 'Deploying — AI analyzes sensor data + property age + seasonal patterns',
    marketOpportunity: 'Prevents average $12,000 water damage claim per property per incident',
    revenueImpact: 'Value justification for premium pricing',
  },
  {
    id: 'GAP-004',
    category: 'Client Self-Service Portal',
    description: 'Most competitors communicate via phone/email only. No real-time dashboard.',
    competitorsOffering: 1,
    coastalKeyStatus: 'Deploying — full portal with 6 dashboard modules',
    marketOpportunity: 'Seasonal owners want visibility, not phone tag',
    revenueImpact: 'Reduces churn 40% — transparency builds trust',
  },
  {
    id: 'GAP-005',
    category: 'Automated Emergency Response',
    description: 'No competitor auto-dispatches vendors on sensor alerts. All require manual call chains.',
    competitorsOffering: 0,
    coastalKeyStatus: 'Deploying — severity-based auto-dispatch via workflow engine',
    marketOpportunity: '< 45 min response vs. industry average 4–24 hours',
    revenueImpact: 'Insurance claim prevention = $8K–$45K saved per incident',
  },
  {
    id: 'GAP-006',
    category: 'Insurance Documentation Automation',
    description: 'No competitor auto-compiles insurance-ready documentation packages.',
    competitorsOffering: 0,
    coastalKeyStatus: 'Deploying — quarterly auto-photo, sensor logs, maintenance records',
    marketOpportunity: 'FL insurance crisis = owners desperate for compliance help',
    revenueImpact: 'Premium discount potential: 5–15% for owners with documentation',
  },
  {
    id: 'GAP-007',
    category: 'Seasonal Activation/Deactivation Workflow',
    description: 'No competitor offers structured property activation/deactivation for snowbirds.',
    competitorsOffering: 0,
    coastalKeyStatus: 'Deploying — automated 8-step activation + 8-step deactivation',
    marketOpportunity: 'Direct pain point for 13,500 seasonal owners',
    revenueImpact: '$150–$250 per activation event × 2/year = $300–$500/owner/year',
  },
];

// ── Public API ──

export function getMarketOverview() {
  return {
    ...INTEL_CONFIG,
    market: MARKET_OVERVIEW,
    competitorCount: COMPETITORS.length,
    automationGapCount: AUTOMATION_GAPS.length,
    averageCompetitorAutomationGap: Math.round(
      COMPETITORS.reduce((sum, c) => sum + c.automationGap, 0) / COMPETITORS.length
    ) + '%',
    coastalKeyAdvantage: 'Only AI-first, sensor-integrated PM company on the Treasure Coast',
    status: 'operational',
  };
}

export function getCompetitors() {
  return {
    engine: INTEL_CONFIG.name,
    region: INTEL_CONFIG.region,
    totalAnalyzed: COMPETITORS.length,
    competitors: COMPETITORS,
    byThreat: {
      high: COMPETITORS.filter(c => c.threatLevel === 'high').length,
      medium: COMPETITORS.filter(c => c.threatLevel === 'medium').length,
      low: COMPETITORS.filter(c => c.threatLevel === 'low').length,
    },
    insight: 'No competitor exceeds "moderate" automation. Average automation gap: 81%. Coastal Key enters with 95%+ automation from day one.',
  };
}

export function getCompetitor(competitorId) {
  return COMPETITORS.find(c => c.id === competitorId) || null;
}

export function getAutomationGaps() {
  return {
    engine: INTEL_CONFIG.name,
    totalGaps: AUTOMATION_GAPS.length,
    gaps: AUTOMATION_GAPS,
    zeroCompetitorGaps: AUTOMATION_GAPS.filter(g => g.competitorsOffering === 0).length,
    coastalKeyDeploying: AUTOMATION_GAPS.filter(g => g.coastalKeyStatus.startsWith('Deploying')).length,
    coastalKeyLive: AUTOMATION_GAPS.filter(g => g.coastalKeyStatus.startsWith('Live')).length,
    summary: `${AUTOMATION_GAPS.filter(g => g.competitorsOffering === 0).length} of ${AUTOMATION_GAPS.length} gaps have ZERO competitors addressing them. Coastal Key owns the whitespace.`,
  };
}

export function getMarketMetrics() {
  return {
    engine: INTEL_CONFIG.id,
    tam: {
      seasonalProperties: MARKET_OVERVIEW.totalSeasonalProperties,
      avgRevenuePerProperty: '$3,600/year',
      totalAddressableMarket: `$${(MARKET_OVERVIEW.totalSeasonalProperties * 3600).toLocaleString()}/year`,
    },
    sam: {
      reachableProperties: Math.round(MARKET_OVERVIEW.totalSeasonalProperties * 0.3),
      avgRevenuePerProperty: '$4,200/year',
      serviceableMarket: `$${(Math.round(MARKET_OVERVIEW.totalSeasonalProperties * 0.3) * 4200).toLocaleString()}/year`,
    },
    som: {
      year1Target: 120,
      avgRevenuePerProperty: '$4,800/year',
      obtainableRevenue: `$${(120 * 4800).toLocaleString()}/year`,
    },
    penetrationStrategy: [
      'Phase 1 (M1–3): 15 properties — referral + Google Ads + direct outreach',
      'Phase 2 (M4–6): 45 properties — content marketing + realtor partnerships',
      'Phase 3 (M7–12): 120 properties — brand recognition + word-of-mouth + insurance agent referrals',
    ],
    competitivePosition: 'Blue ocean — no competitor in the AI + IoT + PM intersection on Treasure Coast',
  };
}
