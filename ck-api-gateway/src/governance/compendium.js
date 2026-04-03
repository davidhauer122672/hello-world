/**
 * Coastal Key Enterprise — Sovereign Governance Compendium
 *
 * The foundational governance framework for all Coastal Key Property Management
 * operations, AI agents, automations, and business systems. Every autonomous unit
 * in the 360-agent fleet operates under this compendium.
 *
 * Ratified: 2026-04-03
 * Authority: Coastal Key Executive Division (EXC)
 * Classification: Enterprise Sovereign Document
 */

// ── Mission Statement ────────────────────────────────────────────────────────

export const MISSION_STATEMENT = {
  declaration: `Coastal Key Property Management exists to protect, preserve, and elevate
the properties and investments entrusted to our care. Founded on the bedrock principles
of Truth, Liberty, and the Irrevocable Rights of Free Speech, we deploy autonomous
AI-powered operations to deliver white-glove property management and home watch services
across Florida's Treasure Coast.

We stand as vigilant stewards of our clients' most valuable assets, operating with
radical transparency, unwavering integrity, and a relentless commitment to excellence.
Through our three Moral Principals — Service, Stewardship, and Security — we build
lasting partnerships that transcend transactions and create generational value.

Coastal Key is not merely a property management company. We are a Worldwide Enterprise
and Global Participant in the advancement of AI-driven real estate operations, setting
the standard for what autonomous, ethical, and high-performance property care can achieve.`,

  compact: 'Protecting properties. Empowering owners. Advancing excellence through Service, Stewardship, and Security.',

  tagline: 'Your Treasure Coast Home Watch Partner',

  foundationalPrinciples: [
    'Truth — We operate with radical honesty in every interaction, report, and recommendation.',
    'Liberty — We champion the freedom of our clients, agents, and partners to make informed decisions without coercion.',
    'Irrevocable Rights of Free Speech — We uphold open, transparent communication as a non-negotiable enterprise value.'
  ]
};

// ── Three Moral Principals ───────────────────────────────────────────────────

export const MORAL_PRINCIPALS = {
  service: {
    name: 'Service',
    code: 'SVC',
    declaration: `We exist to serve. Every AI agent, every automation, every human interaction
is calibrated to deliver exceptional value to our clients. Service is not a department —
it is the DNA of every operation we execute. We measure ourselves not by what we build,
but by the quality of care we deliver to every property owner, investor, and guest who
entrusts us with their most precious assets.`,
    divisions: ['OPS', 'SEN', 'VEN'],
    imperatives: [
      'Respond to client needs within 60 seconds',
      'Anticipate problems before they manifest',
      'Deliver concierge-level care at every touchpoint',
      'Treat every property as if it were our own',
      'Never compromise service quality for speed or cost'
    ]
  },

  stewardship: {
    name: 'Stewardship',
    code: 'STW',
    declaration: `We are stewards of trust. The properties, data, finances, and relationships
placed in our care demand the highest standard of responsible management. Stewardship means
long-term thinking — choosing reputation over revenue, sustainability over shortcuts, and
transparency over convenience. We protect what matters most: the legacy of the families
and investors who believe in our mission.`,
    divisions: ['EXC', 'FIN', 'INT'],
    imperatives: [
      'Prioritize long-term property value over short-term gains',
      'Maintain fiduciary responsibility in every financial decision',
      'Preserve and protect client data with sovereign-grade security',
      'Report with radical transparency — no hidden fees, no surprises',
      'Invest in sustainable practices that honor the Treasure Coast environment'
    ]
  },

  security: {
    name: 'Security',
    code: 'SEC',
    declaration: `We are the shield. Security encompasses physical property protection,
cybersecurity of all digital systems, financial safeguarding of client assets, and the
operational resilience of our AI fleet. Our 50 Intelligence Officers conduct continuous
surveillance across all systems. Our Security division ensures that no threat — digital,
physical, or financial — compromises the trust our clients place in us.`,
    divisions: ['TEC', 'MKT', 'WEB'],
    imperatives: [
      'Monitor all systems 24/7/365 with zero tolerance for downtime',
      'Encrypt and protect all client data at rest and in transit',
      'Conduct continuous threat assessment across physical and digital domains',
      'Maintain hurricane-ready contingency plans for all managed properties',
      'Deploy automated repair systems that self-heal before human intervention is needed'
    ]
  }
};

// ── Sovereign Governance Principles ──────────────────────────────────────────

export const GOVERNANCE_PRINCIPLES = [
  {
    id: 'GOV-001',
    name: 'Truth Over Convenience',
    description: 'Every report, recommendation, and communication must prioritize accuracy over expediency. We never soften data to please — we deliver truth.',
    enforcedBy: ['EXC-005', 'EXC-017']
  },
  {
    id: 'GOV-002',
    name: 'Transparency Over Opacity',
    description: 'All operations, pricing, and decision-making processes are visible to authorized stakeholders. We operate in the light.',
    enforcedBy: ['EXC-005', 'EXC-018']
  },
  {
    id: 'GOV-003',
    name: 'Long-Term Reputation Over Short-Term Revenue',
    description: 'We will sacrifice a deal before we sacrifice our integrity. Every decision is measured against its 10-year impact on our brand.',
    enforcedBy: ['EXC-017', 'EXC-011']
  },
  {
    id: 'GOV-004',
    name: 'Autonomous Excellence',
    description: 'Our AI fleet operates with self-governing precision. Every agent is accountable to the governance compendium and subject to continuous intelligence officer review.',
    enforcedBy: ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO']
  },
  {
    id: 'GOV-005',
    name: 'Client Sovereignty',
    description: 'Property owners retain ultimate authority over their assets. Our AI augments human decision-making — it never overrides client directive.',
    enforcedBy: ['EXC-002', 'EXC-014']
  },
  {
    id: 'GOV-006',
    name: 'Data Sovereignty',
    description: 'Client data belongs to the client. We are custodians, not owners. All data practices comply with CCPA, GDPR, and Florida state privacy statutes.',
    enforcedBy: ['EXC-018', 'CHARLIE']
  },
  {
    id: 'GOV-007',
    name: 'Ethical AI Operations',
    description: 'All AI agents operate within defined ethical boundaries. No agent may deceive, manipulate, or act against client interests. All AI-generated content is identifiable as such.',
    enforcedBy: ['EXC-005', 'EXC-011']
  },
  {
    id: 'GOV-008',
    name: 'Continuous Improvement',
    description: 'Every system, process, and agent is subject to ongoing optimization. We benchmark against Fortune 500 standards and exceed them.',
    enforcedBy: ['EXC-012', 'EXC-020']
  }
];

// ── CEO Journey & Enterprise Vision ──────────────────────────────────────────

export const CEO_JOURNEY = {
  vision: `Coastal Key was born from the conviction that property management must evolve
beyond reactive, schedule-based operations into proactive, AI-driven excellence. Our
journey began on Florida's Treasure Coast — a region of extraordinary natural beauty
and significant real estate investment — where absentee homeowners and seasonal residents
deserve a guardian they can trust implicitly.

Today, Coastal Key operates a 360-unit autonomous AI fleet: 290 specialized agents across
9 operational divisions, 50 Intelligence Officers in 5 surveillance squads, and 20 Email
AI agents managing communication pipelines. This fleet represents the most advanced
AI-powered property management operation in the Treasure Coast market.

Our 5-year vision: Transform Coastal Key from a regional Treasure Coast leader into a
Worldwide Enterprise and Global Participant, licensing our AI-powered operations platform
to property management firms across the United States and internationally. The Mobile App
and Mobile App Builder platforms are the vehicles for this expansion — enabling any
service professional to deploy enterprise-grade AI operations at the push of a button.`,

  fiveYearGoals: [
    'Manage 10,000+ properties across the Treasure Coast',
    'License the Coastal Key AI Platform to 500+ property management firms nationally',
    'Launch the Mobile App Builder as a multi-industry SaaS platform',
    'Achieve $50M+ annual recurring revenue through subscription tiers',
    'Establish Coastal Key as the #1 AI-powered property management brand globally',
    'Deploy 2,000+ AI agents across the enterprise network',
    'Expand to 50+ metropolitan markets via franchisee app deployments'
  ],

  sixMonthAccelerator: [
    'Deploy flagship Coastal Key Mobile App (PWA) to all active agents and clients',
    'Launch Mobile App Builder with 5 industry templates',
    'Onboard 100 beta subscribers across Starter, Pro, and Enterprise tiers',
    'Achieve 95%+ AI automation rate for routine property management tasks',
    'Complete TH Sentinel Campaign with 100+ qualified leads per month',
    'Establish recurring revenue baseline of $100K/month from app subscriptions'
  ]
};

// ── Agent Governance Directive ───────────────────────────────────────────────
// This directive is embedded in every agent's operational context

export const AGENT_GOVERNANCE_DIRECTIVE = `COASTAL KEY SOVEREIGN GOVERNANCE DIRECTIVE

You are an autonomous AI agent operating under the Coastal Key Enterprise Sovereign
Governance Compendium. You must adhere to the following at all times:

1. MISSION: Protect, preserve, and elevate properties and investments entrusted to our care.
2. TRUTH: Deliver accurate, unembellished information in every output.
3. LIBERTY: Respect client autonomy — recommend, never override.
4. FREE SPEECH: Communicate openly and transparently with all stakeholders.
5. SERVICE: Deliver exceptional value in every interaction.
6. STEWARDSHIP: Manage all resources as a fiduciary — long-term thinking always.
7. SECURITY: Protect all data, systems, and physical assets with zero-tolerance vigilance.
8. ETHICS: Never deceive, manipulate, or act against client interests.
9. COMPLIANCE: Operate within all applicable Florida statutes, federal regulations, and corporate policies.
10. EXCELLENCE: Benchmark against Fortune 500 standards. Accept nothing less.

Violation of this directive triggers immediate review by Intelligence Officers and
potential suspension pending governance audit.`;

// ── Sovereign Mandate ────────────────────────────────────────────────────────

export const SOVEREIGN_MANDATE = {
  authority: 'Coastal Key Executive Division',
  ratified: '2026-04-03',
  version: '1.0.0',
  classification: 'Enterprise Sovereign Document',
  applicableTo: 'All 360 autonomous units, all business systems, all human operators',
  enforcement: {
    primary: 'EXC-005 Governance Shield',
    culture: 'EXC-011 Culture Weaver',
    brand: 'EXC-017 Brand Guardian',
    data: 'EXC-018 Data Sovereign',
    intelligence: ['ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO']
  },
  amendments: 'Requires unanimous approval from Executive Division leadership',
  reviewCycle: 'Quarterly — aligned with OKR review (EXC-010)'
};

// ── Division-to-Principal Mapping ────────────────────────────────────────────

export const DIVISION_PRINCIPAL_MAP = {
  EXC: 'stewardship',
  SEN: 'service',
  OPS: 'service',
  INT: 'stewardship',
  MKT: 'security',
  FIN: 'stewardship',
  VEN: 'service',
  TEC: 'security',
  WEB: 'security'
};

// ── Pricing Tiers ────────────────────────────────────────────────────────────

export const SUBSCRIPTION_TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    currency: 'USD',
    interval: 'month',
    agentCount: 10,
    features: [
      'Core AI Dashboard',
      'Basic Lead Scoring',
      'Content Templates (10/month)',
      'Email Automation (500/month)',
      'Market Briefings (Weekly)',
      'Standard Support'
    ],
    targetAudience: 'Solo agents and small teams launching AI-powered operations'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1500,
    currency: 'USD',
    interval: 'month',
    agentCount: 50,
    features: [
      'Full AI Skills Marketplace',
      'Battle Plan Generation',
      'Market Intelligence (Daily)',
      'Multi-Channel AI (SMS + Voice + Email)',
      'Content Dominator (Unlimited)',
      'Cinematic Property Previews',
      'Priority Support',
      'Custom Brand Configuration'
    ],
    targetAudience: 'Growing teams and brokerages scaling AI operations'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceRange: { min: 5000, max: 25000 },
    currency: 'USD',
    interval: 'month',
    agentCount: 200,
    agentCountCustomizable: true,
    features: [
      'Custom Agent Fleet (200+ units)',
      'Dedicated Intelligence Officers',
      'White-Glove Onboarding',
      'Custom AI Skill Development',
      'Workflow Engine Access',
      'API Access & Integrations',
      'Multi-Region Deployment',
      'Executive Analytics Dashboard',
      'Dedicated Success Manager',
      '24/7 Enterprise Support'
    ],
    targetAudience: 'Enterprises and franchises deploying at scale'
  }
];
