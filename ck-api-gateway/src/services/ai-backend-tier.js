/**
 * Low-Cost AI Backend Service — $3.99/month Tier
 *
 * Scalable entry point for seasonal property owners.
 * AI-generated reports, predictions, and alerts at near-zero marginal cost.
 * Runs on Cloudflare Workers + Claude API — no infrastructure overhead.
 *
 * Standards: SpaceX cost optimization, Red Bull mass-market reach, Ferrari quality at scale.
 */

const TIER_CONFIG = {
  id: 'CK-AI-TIER',
  version: '1.0.0',
  name: 'Coastal Key AI Assistant — $3.99 Plan',
  price: { amount: 3.99, currency: 'USD', period: 'month' },
  costStructure: {
    claudeApiPerReport: '$0.003–$0.01',
    cloudflareWorkerPerRequest: '$0.000001',
    storagePerOwnerPerMonth: '$0.02',
    totalCostPerOwner: '$0.15–$0.40/month',
    margin: '90–96%',
  },
  targetMarket: 'Seasonal property owners wanting visibility without full management',
  positioning: 'The cheapest smart property monitoring in America',
};

const SERVICE_TIERS = [
  {
    id: 'TIER-FREE',
    name: 'Coastal Key Free',
    price: '$0/month',
    features: [
      'Property profile setup',
      'Monthly market update email',
      'Access to Coastal Key blog and guides',
      'Emergency contact directory',
    ],
    limits: { reportsPerMonth: 0, alertsPerMonth: 0, predictions: false },
    purpose: 'Lead capture — move to $3.99 tier',
    conversionTarget: '40% → $3.99 within 30 days',
  },
  {
    id: 'TIER-AI-399',
    name: 'Coastal Key AI Assistant',
    price: '$3.99/month',
    features: [
      'AI-generated monthly property report (condition, risks, recommendations)',
      'Predictive maintenance alerts (based on property age, location, season)',
      'Weekly market intelligence digest (local sales, rentals, trends)',
      'Hurricane season preparedness checklist (personalized to property)',
      'Insurance renewal reminder with documentation checklist',
      'AI chatbot for property questions (10 queries/month)',
      'Seasonal activation/deactivation checklists',
      'Vendor recommendation engine (vetted local contractors)',
    ],
    limits: { reportsPerMonth: 4, alertsPerMonth: 20, predictions: true, chatQueries: 10 },
    purpose: 'Value demonstration — prove AI saves money',
    conversionTarget: '25% → managed services within 90 days',
    costToDeliver: '$0.15–$0.40/month per subscriber',
  },
  {
    id: 'TIER-MONITOR-2999',
    name: 'Coastal Key Smart Monitor',
    price: '$29.99/month',
    features: [
      'Everything in AI Assistant tier',
      'IoT sensor monitoring (water, humidity, temperature)',
      'Real-time alerts via SMS + email + portal',
      'Bi-weekly AI property condition report',
      'Automated vendor dispatch for severity 3+ alerts',
      'Insurance documentation package (quarterly)',
      'Unlimited AI chatbot queries',
      'Priority support line',
    ],
    limits: { reportsPerMonth: 8, alertsPerMonth: 'unlimited', predictions: true, chatQueries: 'unlimited' },
    sensorKit: 'Basic ($149 one-time) included in first-year signup',
    purpose: 'Sensor revenue + upsell to full management',
    conversionTarget: '35% → full management within 6 months',
    costToDeliver: '$3.50–$8.00/month per subscriber',
  },
  {
    id: 'TIER-MANAGED-199',
    name: 'Coastal Key Full Management',
    price: '$199–$399/month (or 8–10% of rental income)',
    features: [
      'Everything in Smart Monitor tier',
      'Full property management services',
      'Vendor management and dispatch',
      'Tenant/rental management (if applicable)',
      'Monthly financial reporting',
      'Annual property condition report with photos',
      'Seasonal activation/deactivation service',
      'Emergency response with guaranteed SLA',
      'Dedicated property manager',
    ],
    limits: { reportsPerMonth: 'unlimited', alertsPerMonth: 'unlimited', predictions: true, chatQueries: 'unlimited' },
    purpose: 'Full-service revenue — core business',
    costToDeliver: '$80–$150/month per property',
  },
];

const AI_REPORT_TEMPLATES = [
  {
    id: 'RPT-001',
    name: 'Monthly Property Condition Report',
    frequency: 'Monthly',
    tier: 'TIER-AI-399',
    sections: ['Property overview', 'Risk assessment', 'Maintenance recommendations', 'Market context', 'Cost projections'],
    aiModel: 'claude-haiku-4-5-20251001',
    estimatedTokens: 800,
    costPerReport: '$0.003',
  },
  {
    id: 'RPT-002',
    name: 'Predictive Maintenance Alert',
    frequency: 'As-needed (AI-triggered)',
    tier: 'TIER-AI-399',
    sections: ['Risk identified', 'Severity score', 'Recommended action', 'Estimated cost if unaddressed', 'Vendor recommendation'],
    aiModel: 'claude-haiku-4-5-20251001',
    estimatedTokens: 400,
    costPerReport: '$0.001',
  },
  {
    id: 'RPT-003',
    name: 'Weekly Market Intelligence Digest',
    frequency: 'Weekly',
    tier: 'TIER-AI-399',
    sections: ['Local sales activity', 'Rental market trends', 'Property value estimate', 'Neighborhood changes', 'Insurance market update'],
    aiModel: 'claude-haiku-4-5-20251001',
    estimatedTokens: 600,
    costPerReport: '$0.002',
  },
  {
    id: 'RPT-004',
    name: 'Hurricane Preparedness Report',
    frequency: 'Monthly (Jun–Nov)',
    tier: 'TIER-AI-399',
    sections: ['Current forecast', 'Property vulnerability assessment', 'Preparation checklist', 'Emergency contacts', 'Insurance review'],
    aiModel: 'claude-haiku-4-5-20251001',
    estimatedTokens: 500,
    costPerReport: '$0.002',
  },
  {
    id: 'RPT-005',
    name: 'Insurance Renewal Package',
    frequency: 'Annual (60 days before renewal)',
    tier: 'TIER-AI-399',
    sections: ['Property condition summary', 'Maintenance history', 'Risk mitigation measures', 'Photo documentation index', 'Recommended coverage changes'],
    aiModel: 'claude-sonnet-4-6',
    estimatedTokens: 1200,
    costPerReport: '$0.01',
  },
];

const LOW_COST_INTEGRATIONS = [
  { name: 'Cloudflare Workers', cost: '$5/month (10M requests)', role: 'API Gateway + AI orchestration' },
  { name: 'Cloudflare KV', cost: '$5/month (10M reads)', role: 'Caching + session storage' },
  { name: 'Cloudflare R2', cost: '$0.015/GB/month', role: 'Photo/document storage' },
  { name: 'Claude API (Haiku)', cost: '$0.25/MTok input, $1.25/MTok output', role: 'AI report generation' },
  { name: 'Airtable (Team)', cost: '$20/month', role: 'Property database + CRM' },
  { name: 'Twilio SMS', cost: '$0.0079/message', role: 'Alert delivery' },
  { name: 'SendGrid', cost: '$0 (100/day free)', role: 'Email delivery' },
  { name: 'Stripe', cost: '2.9% + $0.30/transaction', role: 'Payment processing' },
];

// ── Public API ──

export function getServiceTiers() {
  return {
    engine: TIER_CONFIG.name,
    totalTiers: SERVICE_TIERS.length,
    tiers: SERVICE_TIERS,
    entryPoint: SERVICE_TIERS[1].price,
    fullService: SERVICE_TIERS[3].price,
    conversionFunnel: 'Free → $3.99 AI → $29.99 Monitor → $199+ Managed',
    philosophy: 'Land with $3.99, expand with value',
  };
}

export function getServiceTier(tierId) {
  return SERVICE_TIERS.find(t => t.id === tierId) || null;
}

export function getAIReportTemplates() {
  return {
    engine: TIER_CONFIG.name,
    totalTemplates: AI_REPORT_TEMPLATES.length,
    templates: AI_REPORT_TEMPLATES,
    totalMonthlyCostPer399Sub: '$0.01–$0.03',
    marginAt399: '92–96%',
  };
}

export function getCostStructure() {
  return {
    engine: TIER_CONFIG.id,
    priceToOwner: TIER_CONFIG.price,
    costToDeliver: TIER_CONFIG.costStructure,
    integrations: LOW_COST_INTEGRATIONS,
    totalMonthlyInfra: {
      at50Subscribers: '$12/month infrastructure + $2 AI = $14/month',
      at500Subscribers: '$15/month infrastructure + $20 AI = $35/month',
      at5000Subscribers: '$25/month infrastructure + $200 AI = $225/month',
    },
    scalingNote: 'Near-zero marginal cost per subscriber. AI costs scale linearly at $0.003–$0.01 per report.',
    breakeven: '4 subscribers at $3.99 = $15.96/mo — covers infrastructure',
  };
}

export function getAIBackendMetrics() {
  return {
    engine: TIER_CONFIG.id,
    tiers: SERVICE_TIERS.map(t => ({
      id: t.id,
      name: t.name,
      price: t.price,
      purpose: t.purpose,
    })),
    reportTemplates: AI_REPORT_TEMPLATES.length,
    costStructure: TIER_CONFIG.costStructure,
    projections: {
      month3: { freeUsers: 100, aiTier: 30, monitorTier: 5, managedTier: 2, mrr: '$269' },
      month6: { freeUsers: 400, aiTier: 120, monitorTier: 25, managedTier: 8, mrr: '$2,977' },
      month12: { freeUsers: 1200, aiTier: 450, monitorTier: 80, managedTier: 25, mrr: '$12,595' },
    },
    unitEconomics: {
      aiTierLTV: '$3.99 × 18 months avg retention = $71.82',
      monitorTierLTV: '$29.99 × 24 months avg retention = $719.76',
      managedTierLTV: '$299 × 36 months avg retention = $10,764',
      blendedCAC: '$25–$50 per customer',
      ltcRatio: '14:1 to 215:1 depending on tier',
    },
    note: 'Unit economics assume Treasure Coast seasonal owner market. Retention higher than national PM average due to absentee owner dependency.',
  };
}
