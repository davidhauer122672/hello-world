/**
 * CFO Revenue Platform Engine
 *
 * Ten-channel revenue architecture, digital product suite,
 * brand positioning, client acquisition, content deployment,
 * lead magnets, investor positioning, and 18-month projections.
 *
 * Revenue target: $2.4M ARR within 18 months.
 */

// ── Revenue Channels (10) ──────────────────────────────────────────────────

export const REVENUE_CHANNELS = [
  { id: 'home_watch',       name: 'Home Watch Contracts',       model: 'Recurring',   arrTarget: 708000,   timeline: 'Active. Scaling.',    rank: 1 },
  { id: 'storm_protocol',   name: 'Storm Protocol Services',    model: 'Seasonal',    arrTarget: 84750,    timeline: 'Active. June-Nov.',   rank: 2, note: 'per season' },
  { id: 'str_oversight',    name: 'STR Oversight (10% gross)',  model: 'Recurring',   arrTarget: 180000,   timeline: 'Q2 2026 launch',      rank: 3 },
  { id: 'investor_mgmt',    name: 'Investor Portfolio Mgmt',    model: 'Recurring+',  arrTarget: 237000,   timeline: 'Sentinel-driven',     rank: 4 },
  { id: 'saas_licensing',   name: 'SaaS Licensing (CK OS)',     model: 'SaaS MRR',    arrTarget: 596400,   timeline: 'Q4 2026 beta',        rank: 5 },
  { id: 'ai_mastery',       name: 'AI Mastery Course',          model: 'Digital Product', arrTarget: 498500, timeline: 'Q3 2026 launch',    rank: 6 },
  { id: 'template_packs',   name: 'Template Packs',             model: 'Digital Product', arrTarget: 197000, timeline: 'Q2 2026 launch',    rank: 7 },
  { id: 'consulting',       name: 'Consulting & Implementation', model: 'Service',    arrTarget: 360000,   timeline: 'On demand',           rank: 8 },
  { id: 'affiliate',        name: 'Affiliate & Referral',       model: 'Passive',     arrTarget: 96000,    timeline: 'Q2 2026',             rank: 9 },
  { id: 'content_monetize', name: 'Content Monetization',       model: 'Mixed',       arrTarget: 216000,   timeline: 'Ongoing build',       rank: 10 },
];

export const TOTAL_ADDRESSABLE_REVENUE = 3173650;

// ── Digital Product Suite ──────────────────────────────────────────────────

export const DIGITAL_PRODUCTS = {
  tier1_entry: [
    {
      id: 'home_watch_kit', name: 'Home Watch Startup Kit', price: 47,
      format: 'PDF bundle', tier: 'Entry ($47-$97)',
      contents: ['Property inspection checklists', 'Client onboarding forms', 'Insurance documentation guide', 'Service agreement template', '30-day launch plan'],
      conversion: 'Lead magnet-to-paid. Buyers tagged in Airtable, entered into email sequence promoting AI Mastery Course.',
    },
  ],
  tier2_mid: [
    {
      id: 'ai_playbook', name: 'AI Automation Playbook for Property Managers', price: 197,
      format: 'PDF + video walkthrough', tier: 'Mid-Market ($197)',
      contents: ['AI-powered inspection workflows', 'Client communication automation', 'Storm protocol triggers', 'Reporting dashboards', 'SOPs for Airtable-Slack-Buffer stack'],
      positioning: 'The operational manual that took Coastal Key from zero to enterprise-grade in six months.',
    },
    {
      id: 'inspection_templates', name: 'Inspection Report Template Pack', price: 197,
      format: '12 DOCX + PDF templates', tier: 'Mid-Market ($197)',
      contents: ['12 branded institutional-grade inspection reports', 'Photo placeholders', 'Risk scoring matrices', 'Insurer-ready documentation formatting'],
      audience: 'Independent home watch operators.',
    },
  ],
  tier3_premium: [
    {
      id: 'mastery_course', name: 'AI-Powered Property Management Mastery Course', price: 997,
      format: '12-module video course', tier: 'Premium ($997+)',
      membership: { monthly: 97, oneTime: 997 },
      modules: ['AI infrastructure setup', 'Airtable as operational backbone', 'Automated client workflows', 'Storm protocol design', 'Investor reporting', 'Content automation', 'SaaS positioning strategy'],
      includes: ['Private community access', 'Monthly live Q&A'],
    },
    {
      id: 'ck_os_license', name: 'Coastal Key OS License', price: null,
      format: 'SaaS platform', tier: 'Premium ($997+)',
      tiers: [
        { name: 'Starter', monthly: 197 },
        { name: 'Professional', monthly: 497 },
        { name: 'Enterprise', monthly: 997, whiteLabel: true },
      ],
      features: ['AI-powered inspection workflow engine', 'Automated client communication', 'Storm protocol activation', 'Investor-grade reporting dashboard', 'Content calendar automation', 'Lead routing'],
    },
  ],
};

// ── Brand Positioning Framework ────────────────────────────────────────────

export const BRAND_POSITIONING = {
  statement: 'Coastal Key helps absentee homeowners, seasonal residents, luxury property owners, real estate investors, and property management operators protect their assets and scale their operations through institutional-grade, AI-powered oversight. We eliminate the risk of undetected property damage and the operational drag of manual management. We are not a home watch company. We are an asset protection platform.',
  voice: {
    tone: 'Institutional. Authoritative. Risk-aware. Direct. Never casual. Never enthusiastic.',
    personality: 'The calm, precise voice of a fiduciary. Think lender reviewing DSCR, not salesperson pitching features.',
    vocabulary: ['Risk transfer', 'Documented oversight', 'Institutional-grade', 'Asset protection', 'Compliance position'],
    closingFrame: 'Every piece of content closes with a risk consequence or cost-of-inaction statement.',
    readingLevel: '9th grade maximum. Short sentences. No filler.',
  },
  taglines: [
    'Your property does not pause. Neither do we.',
    'Institutional oversight. Personal accountability.',
    'The cost of not knowing is always higher.',
    'We document what others overlook.',
    'Asset protection is not optional. It is operational.',
    'Your insurer will ask for proof. We provide it.',
    'Every visit. Every photo. Every risk. Documented.',
    'The gap between visits is where damage lives.',
    'AI-powered. Human-accountable. Investor-grade.',
    'Risk does not wait for you to check in.',
  ],
  bio: 'David Hauer is the Founder and CEO of Coastal Key Property Management, the first AI-native asset management platform on Florida\'s Treasure Coast. He built a 100-agent autonomous AI enterprise in six months with zero employees. Coastal Key provides institutional-grade property oversight for absentee homeowners, luxury property owners, real estate investors, and seasonal residents across 10 service zones from Vero Beach to North Palm Beach.',
};

// ── Client Acquisition Engine ──────────────────────────────────────────────

export const ACQUISITION_STRATEGIES = [
  {
    id: 'county_records', name: 'County Record Data Mining',
    description: 'Pull absentee owner data from Martin, St. Lucie, Indian River, and Palm Beach county appraisal records.',
    filter: 'Property in service area ZIP, mailing address out-of-area, assessed value above $500K.',
    cost: 0, volumePerQuarter: 5000, feed: 'Project Sentinel outbound campaigns',
  },
  {
    id: 'insurance_partners', name: 'Insurance Carrier Partnerships',
    description: 'Co-marketing proposal to regional carriers: policyholders receive complimentary baseline inspection.',
    carrierBenefit: 'Reduced claim frequency and documented property condition records.',
    target: '3 carrier partnerships within 6 months',
  },
  {
    id: 'attorney_cpa', name: 'Attorney & CPA Referral Network',
    description: 'Referral agreements with estate planning attorneys, real estate attorneys, and CPAs.',
    referralFee: 0.10, target: '15 active referral partners',
  },
  {
    id: 'hoa_boards', name: 'HOA Board Presentations',
    description: 'Present to HOA and condo association boards in 10 service zones.',
    target: '2 board presentations per month', offer: 'Community rate for bulk sign-ups',
  },
  {
    id: 'linkedin_funnel', name: 'LinkedIn Authority Funnel',
    description: 'Three LinkedIn articles per week under the CEO Journey pillar.',
    target: '5,000 LinkedIn followers and 50 inbound leads per month within 6 months',
    cta: 'Every article ends with CTA to lead magnet.',
  },
];

export const OUTREACH_TEMPLATES = {
  absentee_owner: {
    channel: 'email', subject: 'Your property at [Address] - one question',
    body: 'Hi [Name], My name is David Hauer. I run Coastal Key Property Management on the Treasure Coast. I have one question for you: if something went wrong at your property at [Address] tomorrow morning, how would you find out? We provide documented, institutional-grade property inspections for absentee owners like you. Every visit includes photos, a written report, and direct communication to you. The first inspection is complimentary. I would like to schedule 20 minutes to walk your property and put a complete risk assessment in your hands. What day works best this week?',
  },
  pm_operator: {
    channel: 'linkedin_dm', subject: null,
    body: 'Hi [Name], I built an AI-powered property management platform that handles inspection workflows, client communication, storm protocols, and investor reporting without adding headcount. We went from zero to enterprise-grade operations in six months. I put the entire system into a playbook. Would it be useful if I sent it your way?',
  },
  investor_family_office: {
    channel: 'email', subject: 'Institutional-grade oversight for your Treasure Coast portfolio',
    body: 'Hi [Name], My name is David Hauer, Founder and CEO of Coastal Key Property Management. We provide documented property oversight for multi-property portfolios on Florida\'s Treasure Coast. Our inspection reports are designed to hold up under lender, insurer, and investor scrutiny. We currently serve portfolios ranging from 3 to 25 properties. I would welcome 15 minutes to discuss how we can provide the same level of institutional documentation for your holdings.',
  },
};

// ── 90-Day Content Deployment Plan ─────────────────────────────────────────

export const CONTENT_SCHEDULE = [
  { day: 'Monday',    platform: 'LinkedIn + Facebook', pillar: 'CEO Journey', format: 'Authority article (500 words)' },
  { day: 'Tuesday',   platform: 'Instagram + Facebook', pillar: 'Brand',      format: 'Property risk carousel' },
  { day: 'Wednesday', platform: 'LinkedIn',             pillar: 'CEO Journey', format: 'Myth vs. reality post' },
  { day: 'Thursday',  platform: 'Instagram + YouTube Shorts', pillar: 'Brand', format: '60-sec video' },
  { day: 'Friday',    platform: 'All platforms',        pillar: 'Brand',       format: 'Case study / testimonial' },
];

export const CONTENT_HOOKS = {
  property_risk: [
    'Your property sat empty for 4 months. Here is what we found on the first inspection.',
    'This $2.1M home had 3 active leaks and the owner had no idea.',
    'The most expensive repair we have ever documented started with a $12 part.',
    'Your neighbor is not an inspection report. Here is why that matters to your insurer.',
    'We walked a property last Tuesday that had not been checked in 11 months. This is what $47,000 in damage looks like.',
    'Every insurance adjuster asks the same question. Most homeowners cannot answer it.',
    'A burst pipe in an empty home runs for an average of 14 days before anyone notices.',
    'Hurricane season is 53 days away. Here is the one thing 90% of absentee owners forget.',
    'This is what happens to an AC system in Florida humidity when no one checks it for 6 months.',
    'We documented 217 property deficiencies last quarter. 83% were invisible from the street.',
  ],
  ceo_journey: [
    'I built a 100-agent AI enterprise in 6 months with zero employees. Here is the architecture.',
    'Every property management company in America is running the same broken model. We replaced it.',
    'The single decision that compressed 3 years of business growth into 6 months.',
    'I removed Zapier from our entire tech stack in one weekend. Here is why and what replaced it.',
    'Most CEOs outsource their thinking to software. I built software that thinks like a CEO.',
    'The difference between a home watch company and an asset protection platform is one word: documentation.',
    'We log every AI inference call to an audit trail. Here is why that matters for investor due diligence.',
    'I spent $0 on advertising. Every client came from one of these five systems.',
    'The property management industry has a $4.2B documentation gap. We are closing it.',
    'Here is the exact Airtable schema that runs a 100-agent AI operation.',
  ],
  myth_vs_reality: [
    'Myth: A good neighbor can watch your property. Reality: Your insurer disagrees.',
    'Myth: Home watch is a luxury. Reality: A single undetected leak costs 15x the annual service fee.',
    'Myth: Property management companies handle oversight. Reality: They handle rent collection.',
    'Myth: You only need home watch during hurricane season. Reality: Mold grows in 48 hours.',
    'Myth: AI cannot run a property management company. Reality: It runs ours. 24/7. With audit trails.',
    'Myth: Your security cameras monitor your property. Reality: They record. They do not inspect.',
    'Myth: Monthly inspections are enough. Reality: In Florida humidity, a lot changes in 30 days.',
    'Myth: Your property is fine because nothing has happened yet. Reality: Survivorship bias.',
    'Myth: Small properties do not need oversight. Reality: Damage does not check square footage.',
    'Myth: AI is replacing property managers. Reality: AI is replacing the ones who do not use it.',
  ],
};

// ── Lead Magnets & Funnel Architecture ─────────────────────────────────────

export const LEAD_MAGNETS = [
  {
    id: 'risk_calculator', name: 'Absentee Owner Risk Calculator',
    type: 'Interactive web tool', inputs: ['property value', 'months unoccupied', 'oversight level'],
    output: 'Estimated annual risk exposure in dollars',
    exitGate: 'Email capture for full risk report PDF',
    conversion: 'Risk report email sequence to complimentary inspection booking.',
  },
  {
    id: 'insurance_checklist', name: 'Florida Property Owner Insurance Checklist',
    type: 'PDF', contents: '7 documentation requirements Florida insurers increasingly demand for claim approval.',
    conversion: 'Email sequence to consultation booking.',
  },
  {
    id: 'startup_guide', name: 'Home Watch Operator Startup Guide',
    type: 'PDF', audience: 'Aspiring home watch company owners',
    contents: 'Licensing, insurance, pricing, inspection protocols.',
    conversion: 'Email sequence to AI Automation Playbook ($197) to Mastery Course ($997).',
  },
  {
    id: 'storm_blueprint', name: 'Storm Season Preparation Blueprint',
    type: 'PDF', releaseWindow: 'April/May for seasonal relevance',
    contents: 'Pre-storm, during-storm, post-storm property protection protocols.',
    conversion: 'Email sequence to pre-storm service booking ($295/event).',
  },
  {
    id: 'ai_case_study', name: 'AI Operations Case Study',
    type: 'PDF', audience: 'PM operators and tech-forward investors',
    contents: 'Documents the 6-month build from zero to enterprise AI operations.',
    conversion: 'Email sequence to consulting ($15,000) or SaaS licensing ($497/mo).',
  },
];

export const FUNNEL_FLOW = {
  stages: ['Social content (hooks)', 'Lead magnet capture', 'Email segmentation', '7-email nurture sequence', 'Final CTA'],
  segments: ['property_owner', 'operator', 'investor'],
  ctas: {
    property_owner: 'Book complimentary inspection',
    operator: 'Purchase digital product',
    investor: 'Schedule consultation',
  },
  deliveryEngine: 'SOE email worker (pending Gmail OAuth)',
};

// ── Investor Positioning ───────────────────────────────────────────────────

export const INVESTOR_POSITIONING = {
  thesis: 'Coastal Key is the first vertically integrated, AI-native property management platform. The company combines recurring service revenue with a scalable technology asset. The AI operations layer (SOE, 100-agent architecture, autonomous workflows) represents intellectual property with standalone enterprise value independent of the service business.',
  metrics: {
    mrrTarget: 200000,
    arrTarget: 2400000,
    activeContracts: 200,
    saasLicensees: 50,
    grossMarginService: { min: 0.65, max: 0.70 },
    grossMarginDigital: { min: 0.85, max: 0.92 },
    clientAcquisitionCost: 150,
    lifetimeValue3yr: 10620,
    ltvCacRatio: 70,
  },
  moat: [
    'Proprietary SOE with 100-agent architecture not replicable by traditional competitors.',
    'First-mover advantage in AI-native property management on the Treasure Coast.',
    'Institutional documentation standard creates switching cost.',
    'SaaS licensing creates network effect.',
    'CEO Journey content builds personal brand moat that compounds over time.',
  ],
  valuation: {
    conservative: { multiple: 6, arrBase: 2800000, value: 16800000 },
    premium:      { multiple: 8, arrBase: 2800000, value: 22400000, justification: 'Technology asset premium + SaaS margin profile' },
    saasStandalone: { multiple: 10, arrBase: 596400, value: 5964000 },
  },
};

// ── 18-Month Financial Projections ─────────────────────────────────────────

export const PROJECTIONS = {
  month6:  { serviceContracts: 29500, stormServices: 14000, digitalProducts: 8000, saasLicensing: 0,     consulting: 5000,  affiliateContent: 2000,  totalMRR: 58500 },
  month12: { serviceContracts: 59000, stormServices: 14000, digitalProducts: 22000, saasLicensing: 9940,  consulting: 15000, affiliateContent: 8000,  totalMRR: 127940 },
  month18: { serviceContracts: 98000, stormServices: 18000, digitalProducts: 41000, saasLicensing: 29820, consulting: 30000, affiliateContent: 18000, totalMRR: 234820 },
};

export const DEPLOYMENT_CHECKLIST = [
  { id: 1,  action: 'Activate Gmail OAuth for SOE email worker',          owner: 'CEO',          status: 'BLOCKER' },
  { id: 2,  action: 'Rotate Airtable + Anthropic API keys in CF Secrets', owner: 'CEO',          status: 'BLOCKER' },
  { id: 3,  action: 'Patch index.html + redeploy coastalkey-pm.com',      owner: 'SOE',          status: 'Ready' },
  { id: 4,  action: 'Publish 30 hooks to Content Calendar (Airtable)',    owner: 'SOE',          status: 'Ready' },
  { id: 5,  action: 'Build Risk Calculator lead magnet (React)',          owner: 'Claude',       status: 'Ready' },
  { id: 6,  action: 'Create Insurance Checklist PDF',                     owner: 'Claude',       status: 'Ready' },
  { id: 7,  action: 'Build Home Watch Startup Kit ($47 product)',         owner: 'Claude + CEO', status: 'Q2 2026' },
  { id: 8,  action: 'Draft AI Mastery Course (12 modules)',               owner: 'Claude',       status: 'Ready' },
  { id: 9,  action: 'TCPA/DNC clearance for Sentinel',                   owner: 'L-01 CLIO',    status: 'Pending' },
  { id: 10, action: 'Complete SOE rebuild WF-1 through WF-13',           owner: 'SOE Worker',   status: 'In Progress' },
];

// ── Projection Calculator ──────────────────────────────────────────────────

export function generateRevenueProjection(month) {
  if (month < 1 || month > 18) return { error: 'Month must be between 1 and 18' };

  const lerp = (a, b, t) => a + (b - a) * t;

  let data;
  if (month <= 6) {
    const t = month / 6;
    data = {
      serviceContracts: Math.round(lerp(0, PROJECTIONS.month6.serviceContracts, t)),
      stormServices:    Math.round(lerp(0, PROJECTIONS.month6.stormServices, t)),
      digitalProducts:  Math.round(lerp(0, PROJECTIONS.month6.digitalProducts, t)),
      saasLicensing:    0,
      consulting:       Math.round(lerp(0, PROJECTIONS.month6.consulting, t)),
      affiliateContent: Math.round(lerp(0, PROJECTIONS.month6.affiliateContent, t)),
    };
  } else if (month <= 12) {
    const t = (month - 6) / 6;
    data = {
      serviceContracts: Math.round(lerp(PROJECTIONS.month6.serviceContracts, PROJECTIONS.month12.serviceContracts, t)),
      stormServices:    Math.round(lerp(PROJECTIONS.month6.stormServices, PROJECTIONS.month12.stormServices, t)),
      digitalProducts:  Math.round(lerp(PROJECTIONS.month6.digitalProducts, PROJECTIONS.month12.digitalProducts, t)),
      saasLicensing:    Math.round(lerp(0, PROJECTIONS.month12.saasLicensing, t)),
      consulting:       Math.round(lerp(PROJECTIONS.month6.consulting, PROJECTIONS.month12.consulting, t)),
      affiliateContent: Math.round(lerp(PROJECTIONS.month6.affiliateContent, PROJECTIONS.month12.affiliateContent, t)),
    };
  } else {
    const t = (month - 12) / 6;
    data = {
      serviceContracts: Math.round(lerp(PROJECTIONS.month12.serviceContracts, PROJECTIONS.month18.serviceContracts, t)),
      stormServices:    Math.round(lerp(PROJECTIONS.month12.stormServices, PROJECTIONS.month18.stormServices, t)),
      digitalProducts:  Math.round(lerp(PROJECTIONS.month12.digitalProducts, PROJECTIONS.month18.digitalProducts, t)),
      saasLicensing:    Math.round(lerp(PROJECTIONS.month12.saasLicensing, PROJECTIONS.month18.saasLicensing, t)),
      consulting:       Math.round(lerp(PROJECTIONS.month12.consulting, PROJECTIONS.month18.consulting, t)),
      affiliateContent: Math.round(lerp(PROJECTIONS.month12.affiliateContent, PROJECTIONS.month18.affiliateContent, t)),
    };
  }

  data.totalMRR = Object.values(data).reduce((s, v) => s + v, 0);
  data.totalARR = data.totalMRR * 12;
  data.month = month;
  data.blendedGrossMargin = 0.72;
  data.grossProfit = Math.round(data.totalARR * data.blendedGrossMargin);

  return data;
}

export function calculateValuation(arr, multiple = 6) {
  return {
    arr,
    multiple,
    enterpriseValue: arr * multiple,
    saasComponent: {
      arr: PROJECTIONS.month18.saasLicensing * 12,
      multiple: 10,
      value: PROJECTIONS.month18.saasLicensing * 12 * 10,
    },
  };
}

export function getChannelBreakdown() {
  const total = REVENUE_CHANNELS.reduce((s, c) => s + c.arrTarget, 0);
  return REVENUE_CHANNELS.map(c => ({
    ...c,
    percentOfTotal: Math.round((c.arrTarget / total) * 10000) / 100,
    monthlyTarget: Math.round(c.arrTarget / 12),
  }));
}

export function getDashboard() {
  const m18 = PROJECTIONS.month18;
  return {
    platform: 'CFO Revenue Platform',
    version: '1.0.0',
    totalAddressableRevenue: TOTAL_ADDRESSABLE_REVENUE,
    arrTarget: m18.totalMRR * 12,
    mrrMonth18: m18.totalMRR,
    revenueChannels: REVENUE_CHANNELS.length,
    digitalProducts: Object.values(DIGITAL_PRODUCTS).flat().length,
    leadMagnets: LEAD_MAGNETS.length,
    acquisitionStrategies: ACQUISITION_STRATEGIES.length,
    contentHooks: Object.values(CONTENT_HOOKS).flat().length,
    deploymentChecklist: {
      total: DEPLOYMENT_CHECKLIST.length,
      blockers: DEPLOYMENT_CHECKLIST.filter(d => d.status === 'BLOCKER').length,
      ready: DEPLOYMENT_CHECKLIST.filter(d => d.status === 'Ready').length,
    },
    valuation: INVESTOR_POSITIONING.valuation,
    metrics: INVESTOR_POSITIONING.metrics,
  };
}
