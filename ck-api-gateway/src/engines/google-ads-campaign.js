/**
 * Google Ads Campaign Engine — Treasure Coast Homeowner Targeting
 *
 * AI-powered campaign configuration for Google Ads targeting
 * absentee homeowners, seasonal residents, and property investors
 * across the Treasure Coast (Indian River, St. Lucie, Martin counties).
 *
 * Integrates with: MKT-008 Ad Manager, SEN-001 Sentinel Alpha,
 * INT-005 Lead Source Analyst, IO-D02 Campaign KPI Monitor
 */

export const GOOGLE_ADS_CAMPAIGNS = {
  // ── Campaign 1: Home Watch Services ──────────────────────────────────────
  homeWatch: {
    name: 'CK | Home Watch | Treasure Coast',
    type: 'SEARCH',
    status: 'READY_TO_ACTIVATE',
    budget: { daily: 50, monthly: 1500 },
    bidStrategy: 'MAXIMIZE_CONVERSIONS',
    locations: [
      { name: 'Vero Beach, FL', radius: '15mi' },
      { name: 'Sebastian, FL', radius: '10mi' },
      { name: 'Stuart, FL', radius: '15mi' },
      { name: 'Port St. Lucie, FL', radius: '15mi' },
      { name: 'Jensen Beach, FL', radius: '10mi' },
      { name: 'Hobe Sound, FL', radius: '10mi' },
      { name: 'Jupiter, FL', radius: '10mi' },
    ],
    adGroups: [
      {
        name: 'Home Watch Services',
        keywords: [
          'home watch services near me', 'home watch vero beach',
          'home watch stuart fl', 'home watch port st lucie',
          'property check service florida', 'vacant home monitoring',
          'snowbird home watch', 'seasonal home care florida',
          'house sitter service treasure coast', 'home watch company near me',
        ],
        negativeKeywords: ['DIY', 'free', 'jobs', 'salary', 'career'],
        ads: [
          {
            headlines: [
              'AI-Powered Home Watch', 'Treasure Coast Home Watch',
              'Protect Your Property 24/7', 'Starting at $195/Month',
              'Zero Preventable Incidents', 'Weekly Property Inspections',
            ],
            descriptions: [
              'AI-powered predictive home watch for Treasure Coast properties. Weekly inspections, real-time alerts, total peace of mind. Book a free consultation.',
              'Coastal Key protects your home while you\'re away. Professional inspections, hurricane prep, vendor coordination. Serving Vero Beach to Jupiter.',
            ],
            finalUrl: 'https://coastalkey-pm.com/home-watch',
            callToAction: 'Book Free Consultation',
          },
        ],
      },
      {
        name: 'Absentee Owner',
        keywords: [
          'absentee homeowner services', 'out of state home management',
          'remote property monitoring', 'second home management florida',
          'vacation home care service', 'property oversight service',
        ],
        ads: [
          {
            headlines: [
              'Own a Home in Florida?', 'Remote Property Protection',
              'AI Monitors Your Home', 'Never Worry About Your Property',
            ],
            descriptions: [
              'Own a Treasure Coast property but live elsewhere? Coastal Key\'s AI-powered home watch keeps your investment protected. Real-time alerts, weekly visits.',
            ],
            finalUrl: 'https://coastalkey-pm.com/absentee-owners',
          },
        ],
      },
    ],
    extensions: {
      callExtension: { phone: '+17725551234', hours: '8am-8pm EST' },
      sitelinks: [
        { text: 'Pricing', url: '/pricing' },
        { text: 'Service Areas', url: '/service-areas' },
        { text: 'About Us', url: '/about' },
        { text: 'Book Consultation', url: '/contact' },
      ],
      callouts: ['Licensed & Insured', 'AI-Powered Monitoring', 'NHWA Certified', 'Serving Since 2024'],
    },
    conversionTracking: {
      primaryGoal: 'consultation_booked',
      secondaryGoals: ['phone_call', 'form_submission', 'chat_initiated'],
      value: 295,
    },
  },

  // ── Campaign 2: Property Management ──────────────────────────────────────
  propertyManagement: {
    name: 'CK | Property Management | Treasure Coast',
    type: 'SEARCH',
    status: 'READY_TO_ACTIVATE',
    budget: { daily: 75, monthly: 2250 },
    bidStrategy: 'TARGET_CPA',
    targetCpa: 50,
    adGroups: [
      {
        name: 'Property Management General',
        keywords: [
          'property management vero beach', 'property management stuart fl',
          'property management port st lucie', 'treasure coast property management',
          'rental property management florida', 'property manager near me',
          'best property management company', 'luxury property management florida',
        ],
        ads: [
          {
            headlines: [
              'Coastal Key Property Mgmt', 'AI-Powered Management',
              'From $195/Month', 'Treasure Coast Experts',
              '383-Agent AI Fleet', 'Maximize Your ROI',
            ],
            descriptions: [
              'Full-service property management powered by 383 AI agents. Home watch, tenant management, vendor coordination, financial reporting. Treasure Coast specialists.',
              'The future of property management is here. AI-predictive maintenance, real-time reporting, zero preventable incidents. Select, Premier, or Platinum tiers.',
            ],
            finalUrl: 'https://coastalkey-pm.com',
          },
        ],
      },
    ],
  },

  // ── Campaign 3: Remarketing ──────────────────────────────────────────────
  remarketing: {
    name: 'CK | Remarketing | Website Visitors',
    type: 'DISPLAY',
    status: 'READY_TO_ACTIVATE',
    budget: { daily: 25, monthly: 750 },
    audiences: [
      'Website visitors (last 30 days)',
      'Consultation page visitors (not converted)',
      'Pricing page visitors',
    ],
    ads: [
      {
        type: 'responsive_display',
        headlines: ['Still Thinking About Home Watch?', 'Your Property Deserves Protection'],
        descriptions: ['Coastal Key AI-powered home watch starts at $195/mo. Book your free consultation today.'],
        images: ['hero-property.jpg', 'ai-dashboard.jpg', 'treasure-coast.jpg'],
      },
    ],
  },
};

// ── Campaign Activation Checklist ──────────────────────────────────────────

export const ACTIVATION_CHECKLIST = {
  prerequisites: [
    { task: 'Google Ads account created and verified', status: 'required' },
    { task: 'Billing method added to Google Ads', status: 'required' },
    { task: 'Conversion tracking pixel installed on coastalkey-pm.com', status: 'required' },
    { task: 'Google Analytics 4 linked to Google Ads', status: 'required' },
    { task: 'Phone number verified for call extensions', status: 'required' },
  ],
  launchSequence: [
    '1. Create campaigns in Google Ads dashboard using specs above',
    '2. Upload ad copy and configure extensions',
    '3. Set location targeting to Treasure Coast service zones',
    '4. Enable conversion tracking on consultation booking page',
    '5. Set daily budgets and bid strategies',
    '6. Review and launch — monitor first 72 hours closely',
    '7. IO-D02 Campaign monitor tracks KPIs automatically',
  ],
  kpiTargets: {
    clickThroughRate: '> 3.5%',
    costPerClick: '< $8.00',
    costPerConversion: '< $50.00',
    conversionRate: '> 5%',
    impressionShare: '> 60%',
    qualityScore: '> 7/10',
  },
  monthlyBudgetTotal: '$4,500 across 3 campaigns',
  projectedLeadsPerMonth: '90-150 at $30-50 CPA',
  agentIntegrations: {
    adManager: 'MKT-008 — manages campaign optimization',
    leadScorer: 'SEN-004 — scores incoming Google Ads leads',
    campaignKPI: 'IO-D02 — monitors against targets',
    attribution: 'IO-D10 — maps revenue back to Google Ads channel',
    retargeting: 'MKT-023 — manages remarketing audiences',
  },
};

export function getGoogleAdsDashboard() {
  return {
    system: 'Coastal Key Google Ads Campaign Engine',
    status: 'CAMPAIGNS_CONFIGURED — READY TO ACTIVATE',
    campaigns: Object.entries(GOOGLE_ADS_CAMPAIGNS).map(([key, c]) => ({
      id: key,
      name: c.name,
      type: c.type,
      status: c.status,
      budget: c.budget,
    })),
    totalMonthlyBudget: '$4,500',
    projectedLeads: '90-150/month',
    targetCPA: '$30-50',
    activationChecklist: ACTIVATION_CHECKLIST,
    timestamp: new Date().toISOString(),
  };
}
