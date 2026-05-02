/**
 * Landing Page Offer Engine — High-Converting Offer Architecture
 *
 * Three offer variants for three business types:
 *   1. Coastal Key Estate Management (Home Watch & PM)
 *   2. Coastal Key Property Management Software (SaaS)
 *   3. Coastal Key Software Development (Enterprise Custom)
 *
 * Each offer contains 7 labeled sections structured for direct
 * landing page deployment:
 *   1. Headline
 *   2. Bold benefit-driven statement
 *   3. ICP (Ideal Customer Profile)
 *   4. Value proposition
 *   5. Offer components
 *   6. Guarantee
 *   7. Competitive edge
 */

// ── Offer 1: Estate Management ─────────────────────────────────────────────

export const OFFER_ESTATE_MANAGEMENT = {
  offerId: 'OFFER-EM-001',
  businessType: 'Coastal Key Estate Management',
  sections: {
    headline: 'Your Property Is Being Watched by 360 AI Agents — Even When You Are 1,000 Miles Away',

    benefitStatement: 'Coastal Key combines weekly boots-on-ground inspections with a 360-agent AI fleet that monitors your property 24/7 — so you never wonder what is happening to your most valuable asset while you are not there.',

    icp: {
      label: 'Who This Is For',
      age: '45-65',
      role: 'Absentee homeowners, seasonal residents, snowbirds, vacation property owners, trust trustees, estate executors',
      situation: 'Owns a property on Florida\'s Treasure Coast (Stuart, Jensen Beach, Palm City, Hobe Sound, Jupiter, Port Saint Lucie) that sits vacant for 30+ days per year',
      painLevel: 'High — worries about water damage, break-ins, insurance compliance, vendor overcharging, and the general anxiety of owning a property you cannot physically check',
    },

    valueProposition: 'We turn absentee ownership from a source of constant worry into a source of confidence — by combining AI-powered monitoring with professional inspections, so nothing happens to your property without you knowing first.',

    offerComponents: {
      label: 'What You Get',
      deliverables: [
        'Weekly or biweekly professional property inspection with 40-point photographic documentation',
        'AI-powered 24/7 digital property monitoring via the 360-agent Coastal Key fleet',
        'Real-time alert system — water, humidity, temperature, security anomalies',
        'Hurricane and storm preparation protocol with pre-authorized vendor activation',
        'Insurance compliance documentation package — accepted by all major FL carriers',
        'Dedicated Coastal Key concierge for pre-arrival property preparation',
        'Monthly property health scorecard delivered to your dashboard and email',
        'Vendor management with cost benchmarking — never overpay again',
      ],
      bonuses: [
        'FREE first-month property onboarding assessment (valued at $495)',
        'FREE insurance documentation package for your carrier (valued at $250)',
        'Priority hurricane response — your property is in the first activation wave',
      ],
      format: 'Monthly recurring service with no long-term contract required',
    },

    guarantee: {
      label: 'The Coastal Key Promise',
      text: 'If we miss anything on an inspection that later causes documented damage, we cover the first $5,000 of remediation costs. No questions, no fine print, no runaround. We put our money where our inspections are because our AI catches what others miss.',
    },

    competitiveEdge: {
      label: 'Why Coastal Key Beats the Alternatives',
      reasons: [
        {
          reason: '360 AI agents vs. one person with a clipboard',
          detail: 'Traditional home watch companies send a single inspector who spends 15 minutes walking through your property. Coastal Key deploys a fleet of 360 autonomous AI agents providing continuous digital oversight between physical inspections — catching issues before they become catastrophes.',
        },
        {
          reason: 'Insurance-grade documentation that saves you money',
          detail: 'Our timestamped, photographic inspection reports are accepted by every major Florida insurance carrier for vacancy compliance. Clients report 5-15% premium reductions when they present Coastal Key documentation — the service often pays for itself.',
        },
        {
          reason: 'Vendor cost transparency — not vendor kickback schemes',
          detail: 'Most PM companies mark up vendor costs 15-30% without telling you. Coastal Key provides full cost benchmarking against market rates so you see exactly what you are paying and whether it is fair. We earn your trust, not hidden commissions.',
        },
      ],
    },
  },
};

// ── Offer 2: Property Management Software ──────────────────────────────────

export const OFFER_PM_SOFTWARE = {
  offerId: 'OFFER-SW-001',
  businessType: 'Coastal Key Property Management Software',
  sections: {
    headline: 'Run 500 Properties With the Same Team That Struggles With 50 — Our AI Does the Other 90%',

    benefitStatement: 'Coastal Key\'s AI-powered property management platform automates inspections, tenant communication, maintenance triage, vendor coordination, and compliance reporting — letting your team focus on growth instead of firefighting.',

    icp: {
      label: 'Who This Is For',
      age: '35-65',
      role: 'Property management operators, real estate brokers, HOA/condo association managers, home watch company owners, vacation rental operators',
      situation: 'Managing 10-500+ units with a lean team, drowning in manual processes, losing deals because they cannot scale operations to match growth',
      painLevel: 'Critical — spending 60%+ of labor hours on tasks AI can handle, watching competitors adopt technology while margins compress',
    },

    valueProposition: 'We give property management operators an AI co-pilot that handles the operational work — so one property manager can deliver five-star service across 5x more properties without burning out.',

    offerComponents: {
      label: 'What You Get',
      deliverables: [
        'Full-stack AI property management platform with unlimited user seats',
        'AI-powered inspection scheduling and 40-point documentation system',
        'Automated tenant/owner communication engine (email, SMS, portal)',
        'Intelligent maintenance triage — AI routes work orders to the right vendor at fair market price',
        'Owner portal with real-time property health dashboards',
        'Financial reporting suite — revenue tracking, expense categorization, owner statements',
        'Insurance compliance module — auto-generates carrier-ready documentation',
        'API access for custom integrations with your existing tools',
      ],
      bonuses: [
        'FREE white-glove onboarding and data migration (valued at $5,000)',
        'FREE 90-day dedicated success manager',
        'FREE access to Coastal Key AI agent fleet for your managed properties during trial',
      ],
      format: 'SaaS subscription — monthly or annual (save 20% annual). No per-unit fees until 100+ properties.',
    },

    guarantee: {
      label: 'The 90-Day ROI Guarantee',
      text: 'If our platform does not save your team at least 20 hours per week within 90 days of full deployment, we refund your first three months — no questions asked. We track your time savings in the dashboard so the proof is built into the product.',
    },

    competitiveEdge: {
      label: 'Why Coastal Key Software Beats the Alternatives',
      reasons: [
        {
          reason: 'AI-native, not AI-bolted-on',
          detail: 'Buildium and AppFolio added AI features to 15-year-old architectures. Coastal Key was built AI-first — every workflow, every automation, every decision point has AI at the core. The difference is like comparing a Tesla to a gas car with an electric motor strapped on.',
        },
        {
          reason: 'No per-door pricing that punishes growth',
          detail: 'Competitors charge $1-$3 per unit per month, creating a scaling tax that eats your margins as you grow. Coastal Key uses flat-tier pricing — grow from 50 to 200 units and your software cost stays the same.',
        },
        {
          reason: 'Built by operators, not just engineers',
          detail: 'Coastal Key runs an actual property management operation on this platform. Every feature exists because we needed it ourselves — not because a product manager read a survey. You get software shaped by 10,000+ real property inspections, not focus groups.',
        },
      ],
    },
  },
};

// ── Offer 3: Software Development ──────────────────────────────────────────

export const OFFER_SOFTWARE_DEV = {
  offerId: 'OFFER-SD-001',
  businessType: 'Coastal Key Software Development',
  sections: {
    headline: 'We Build the AI Systems That Property Empires Run On',

    benefitStatement: 'Coastal Key\'s development team builds custom AI-powered platforms for real estate enterprises, government agencies, and global operators who need technology that does not exist off the shelf — delivered by the team that built a 360-agent AI fleet from scratch.',

    icp: {
      label: 'Who This Is For',
      age: '40-65',
      role: 'Enterprise real estate operators, government housing authorities, international property management firms, large brokerage executives, hotel group CIOs',
      situation: 'Needs custom AI technology for property operations but cannot find a development partner who understands both real estate operations and modern AI architecture',
      painLevel: 'Strategic — losing competitive advantage to technology-forward competitors, spending $500K+ annually on manual processes that AI could eliminate',
    },

    valueProposition: 'We are the only development team that has built and deployed AI property management technology at production scale — which means your project starts from proven architecture, not a blank whiteboard.',

    offerComponents: {
      label: 'What You Get',
      deliverables: [
        'Custom AI platform architecture designed for your specific property operations',
        'Full-stack development — Cloudflare Workers, React, AI/ML pipelines, API integrations',
        'Dedicated project team with property management domain expertise',
        'AI agent design and deployment — custom agent fleets for your operational needs',
        'Integration engineering — Airtable, Salesforce, Yardi, AppFolio, custom ERPs',
        'Production deployment on enterprise-grade infrastructure (Cloudflare global network)',
        'Source code ownership — you own everything we build',
        '12-month post-launch support and optimization',
      ],
      bonuses: [
        'FREE architectural assessment and feasibility analysis (valued at $15,000)',
        'FREE access to Coastal Key AI agent templates and proven patterns',
        'Priority access to Coastal Key R&D innovations for 24 months post-launch',
      ],
      format: 'Project-based engagement with milestone-based billing. Retainer options for ongoing development.',
    },

    guarantee: {
      label: 'The Delivery Guarantee',
      text: 'Every milestone has a defined deliverable and acceptance criteria agreed before work begins. If we miss a milestone deadline by more than 5 business days for any reason within our control, that milestone is delivered at 50% cost. We build schedules we can keep because our reputation depends on it.',
    },

    competitiveEdge: {
      label: 'Why Coastal Key Development Beats the Alternatives',
      reasons: [
        {
          reason: 'We built it for ourselves first — then productized the architecture',
          detail: 'Coastal Key\'s 360-agent AI fleet, 147-endpoint API gateway, and real-time property monitoring platform are not demos — they are production systems processing real operations daily. Your project inherits proven patterns, not theoretical designs.',
        },
        {
          reason: 'Domain expertise that generic dev shops cannot match',
          detail: 'Hiring a general software agency to build PropTech means paying them to learn your industry on your dime. Coastal Key\'s team lives property management — we know the compliance requirements, the operational workflows, and the failure modes before the first line of code.',
        },
        {
          reason: 'AI-native architecture from day one',
          detail: 'We do not bolt AI onto legacy patterns. Every system we build uses modern AI architecture — autonomous agents, inference pipelines, intelligent routing — because we have been building this way since the beginning. The result is technology that gets smarter over time, not just faster.',
        },
      ],
    },
  },
};

// ── Aggregated Output ──────────────────────────────────────────────────────

export const ALL_OFFERS = [OFFER_ESTATE_MANAGEMENT, OFFER_PM_SOFTWARE, OFFER_SOFTWARE_DEV];

export function getLandingPageOffers() {
  return {
    generatedBy: 'SMO-001 — Sovereign Marketing Officer',
    governance: 'sovereign',
    executionStandard: 'ferrari',
    totalOffers: ALL_OFFERS.length,
    offers: ALL_OFFERS,
    deploymentNotes: {
      format: 'Each offer is structured with 7 labeled sections ready for direct landing page deployment',
      sections: ['Headline', 'Bold Benefit Statement', 'ICP', 'Value Proposition', 'Offer Components', 'Guarantee', 'Competitive Edge'],
      instruction: 'Copy each section directly into landing page builder. No filler added — every line is conversion-oriented.',
    },
    timestamp: new Date().toISOString(),
  };
}
