/**
 * Capital Engine — Three-pillar revenue architecture.
 *
 * Pillar 1: Productized Retainers (Boring Niches)
 * Pillar 2: Enterprise AIOS Implementation
 * Pillar 3: Proprietary IP Licensing
 */

const PILLARS = [
  {
    id: 'CE-P1',
    name: 'Productized Retainers',
    codename: 'Boring Niches',
    description: 'Standardized automation systems for data reporting, CRM management, HR, and ad management.',
    priceRange: { min: 2500, max: 5000, currency: 'USD', period: 'month' },
    characteristics: ['High margin', 'Low churn', 'Minimal custom engineering', 'Recurring revenue'],
    targetMarket: 'Mid-market companies ($5M-$50M revenue)',
    deliverables: [
      'Automated CRM reporting dashboard',
      'Data pipeline orchestration (N8N)',
      'Ad spend optimization agent',
      'HR onboarding automation',
      'Financial reporting agent team (5 agents)',
    ],
    margin: '75-85%',
    churnTarget: '<5% monthly',
    scalingModel: 'Forward Deployed Engineer — centralized core, AI-customized last 20%',
  },
  {
    id: 'CE-P2',
    name: 'Enterprise AIOS Implementation',
    codename: 'Operating System Install',
    description: 'High-ticket, outcome-based engagement. Install the core Enterprise AI Operating System and customize using Forward Deployed Engineer model.',
    priceRange: { min: 50000, max: 250000, currency: 'USD', period: 'engagement' },
    characteristics: ['Outcome-based pricing', 'Guaranteed ROI metric', 'White-glove delivery', 'Strategic partnership'],
    targetMarket: 'Enterprise companies ($50M+ revenue)',
    deliverables: [
      'Full Enterprise AIOS architecture design',
      'Multi-agent team deployment (15-20 agents per department)',
      'Custom agent training on company data',
      'Integration with existing tech stack',
      'CEO delegation framework (DRIP Matrix)',
      '90-day optimization and support',
    ],
    guaranteedOutcome: '40% reduction in operational overhead',
    margin: '60-70%',
    salesCycle: '30-90 days',
    scalingModel: 'Standardized core + modular customization layers',
  },
  {
    id: 'CE-P3',
    name: 'Proprietary IP Licensing',
    codename: 'IP Revenue Engine',
    description: 'Recurring subscription access to Coastal Key trademarked Master Prompt library and specialized agent templates.',
    priceRange: { min: 500, max: 2000, currency: 'USD', period: 'month' },
    characteristics: ['Pure recurring revenue', 'Near-zero marginal cost', 'Self-serve delivery', 'Brand authority builder'],
    targetMarket: 'Mid-market companies, AI agencies, consultants',
    deliverables: [
      'Master Prompt library (100+ verified prompts)',
      'Agent templates (15 department-specific templates)',
      'System Prompt architecture blueprints',
      'Monthly new prompt drops',
      'Community access and support',
    ],
    margin: '90-95%',
    churnTarget: '<8% monthly',
    scalingModel: 'Digital product — create once, distribute infinitely',
  },
];

const DRIP_MATRIX = {
  name: 'DRIP Matrix',
  origin: 'Dan Martell — Buy Back Your Time',
  description: 'CEO delegation framework. Tasks classified into four quadrants; CEO operates exclusively in Produce.',
  quadrants: [
    {
      id: 'D',
      name: 'Delegate',
      description: 'Low energy, low skill required. Fully delegate to AI agents or team.',
      action: 'Automate or assign immediately',
      examples: ['Email triage', 'Calendar management', 'Data entry', 'Report formatting'],
      agentAssignment: 'Email AI Squad (INTAKE + MONITOR)',
    },
    {
      id: 'R',
      name: 'Replace',
      description: 'High energy drain, low skill. Replace with systems or AI.',
      action: 'Build automation or hire',
      examples: ['Social media posting', 'Invoice processing', 'Client follow-ups', 'Meeting scheduling'],
      agentAssignment: 'MKT Division + OPS Division agents',
    },
    {
      id: 'I',
      name: 'Invest',
      description: 'Low energy, high skill. Invest in training others or building templates.',
      action: 'Create SOPs and train agents',
      examples: ['Sales presentations', 'Technical documentation', 'Client onboarding', 'Content strategy'],
      agentAssignment: 'SEN Division + MCCO Agents',
    },
    {
      id: 'P',
      name: 'Produce',
      description: 'High energy, high skill. CEO genius zone. Only tasks CEO should do.',
      action: 'CEO focus — protect this time',
      examples: ['Vision and strategy', 'Key partnerships', 'Capital allocation', 'Thought leadership'],
      agentAssignment: 'CEO direct — supported by EXC Division',
    },
  ],
  replacementLadder: {
    name: 'Replacement Ladder',
    origin: 'Dan Martell (verified)',
    steps: ['Admin', 'Delivery', 'Marketing', 'Sales', 'Leadership'],
    description: 'Sequential delegation path. Replace yourself in each role before moving to the next.',
  },
};

const BUSINESS_MODEL = {
  foundation: {
    source: 'Ben AI & Liam Ottley',
    description: 'Robust technical infrastructure built on Claude, Relevance AI, and N8N, organized into multi-agent teams and positioned as an Enterprise AIOS.',
  },
  operations: {
    source: 'Dan Martell',
    description: 'Internal operations governed by Buy Back Your Time framework. CEO in Genius Zone while AI agents handle delivery and support.',
  },
  marketing: {
    source: 'Jeff Su & AI Edge',
    description: 'Polished, high-volume content engine using free, high-value templates to capture leads and build an owned audience.',
  },
  leadership: {
    source: 'The MIT Monk & Dan Martell',
    description: 'CEO positioned as elite strategic advisor, using narrative and authority to attract enterprise clients and capital partners.',
  },
};

// ── Public API ──

export function getCapitalEngine() {
  const totalRevenueMin = PILLARS.reduce((sum, p) => sum + p.priceRange.min, 0);
  const totalRevenueMax = PILLARS.reduce((sum, p) => sum + p.priceRange.max, 0);

  return {
    engine: 'Coastal Key Capital Engine',
    version: '1.0.0',
    pillars: PILLARS,
    totalPillars: PILLARS.length,
    revenueRange: {
      minimum: `$${totalRevenueMin.toLocaleString()}/mo baseline`,
      maximum: `$${totalRevenueMax.toLocaleString()}+ per engagement cycle`,
    },
    businessModel: BUSINESS_MODEL,
    dripMatrix: DRIP_MATRIX,
    status: 'operational',
  };
}

export function getCapitalPillar(pillarId) {
  return PILLARS.find(p => p.id === pillarId) || null;
}

export function getDRIPMatrix() {
  return {
    ...DRIP_MATRIX,
    status: 'active',
    ceoQuadrant: 'Produce',
    automationCoverage: {
      delegate: '100% — fully automated',
      replace: '85% — systems in place',
      invest: '60% — SOPs in progress',
      produce: '0% — CEO only',
    },
  };
}

export function getBusinessModel() {
  return {
    model: 'Coastal Key Enterprise Integrated Business Model',
    ...BUSINESS_MODEL,
    positioning: 'Enterprise AI Operating System Provider',
    differentiator: 'Only platform combining 404-agent fleet with productized enterprise AIOS delivery.',
    competitiveAdvantage: [
      'Largest privately deployed AI agent fleet (404 units)',
      'Full-stack infrastructure (API Gateway + Workers + Pages)',
      'Verified MCCO sovereign governance model',
      'Integrated compliance engine (TCPA/DNC)',
      'Multi-division operational coverage (12 divisions)',
    ],
  };
}

export function getCapitalMetrics() {
  return {
    pillars: PILLARS.map(p => ({
      id: p.id,
      name: p.name,
      priceRange: p.priceRange,
      margin: p.margin,
      targetMarket: p.targetMarket,
    })),
    projections: {
      month3: { retainers: 5, aiosDeals: 1, ipLicenses: 20, projectedMRR: '$27,500' },
      month6: { retainers: 15, aiosDeals: 3, ipLicenses: 75, projectedMRR: '$112,500' },
      month12: { retainers: 40, aiosDeals: 8, ipLicenses: 200, projectedMRR: '$450,000' },
    },
    note: 'Projections are modeled estimates based on comparable agency growth curves. Not guaranteed.',
  };
}
