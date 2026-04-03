/**
 * Coastal Key Mobile App Builder — Industry Templates
 * Pre-built templates for occupation-based app generation.
 * Each template defines modules, KPIs, AI skills, and dashboard configuration.
 */

export const INDUSTRY_TEMPLATES = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    icon: '\uD83C\uDFE0',
    description: 'Property management, luxury listings, investor relations, and AI-powered home watch services.',
    isDefault: true,
    modules: {
      leadEngine: { enabled: true, label: 'Lead Engine', kpis: ['conversion-rate', 'pipeline-velocity', 'lead-score-accuracy'] },
      content: { enabled: true, label: 'Content Dominator', kpis: ['engagement-rate', 'reach', 'posts-published'] },
      market: { enabled: true, label: 'Market Intelligence', kpis: ['price-accuracy', 'trend-detection', 'zone-coverage'] },
      aiSkills: { enabled: true, label: 'AI Skills', kpis: ['skill-executions', 'success-rate', 'automation-rate'] },
      finance: { enabled: true, label: 'Revenue Tracking', kpis: ['mrr', 'arpu', 'churn-rate'] },
      operations: { enabled: true, label: 'Property Operations', kpis: ['inspection-rate', 'maintenance-response', 'vendor-compliance'] }
    },
    dashboardWidgets: ['revenue-counter', 'lead-heat-map', 'ai-suggestions', 'fleet-status', 'market-brief'],
    aiSkillCategories: ['Lead Conversion', 'Content Generation', 'Market Intel', 'Investor Outreach', 'Property Operations'],
    branding: { primaryColor: '#c4a35a', accentColor: '#d4b96a', background: '#0a0a0a' }
  },
  {
    id: 'dental',
    name: 'Dentist',
    icon: '\uD83E\uDDB7',
    description: 'Patient acquisition, appointment scheduling, treatment plan AI, and practice growth analytics.',
    modules: {
      leadEngine: { enabled: true, label: 'Patient Acquisition', kpis: ['new-patients', 'booking-rate', 'referral-score'] },
      content: { enabled: true, label: 'Content Studio', kpis: ['social-engagement', 'review-velocity', 'brand-mentions'] },
      market: { enabled: true, label: 'Practice Intelligence', kpis: ['market-share', 'competitor-pricing', 'demand-trends'] },
      aiSkills: { enabled: true, label: 'AI Skills', kpis: ['skill-executions', 'success-rate', 'automation-rate'] },
      finance: { enabled: true, label: 'Revenue Tracking', kpis: ['production-per-visit', 'collections-rate', 'overhead-ratio'] },
      operations: { enabled: false, label: 'Clinical Operations', kpis: ['chair-utilization', 'treatment-acceptance', 'recall-rate'] }
    },
    dashboardWidgets: ['revenue-counter', 'patient-pipeline', 'ai-suggestions', 'appointment-calendar', 'review-tracker'],
    aiSkillCategories: ['Patient Acquisition', 'Content Generation', 'Treatment Plans', 'Review Management', 'Schedule Optimization'],
    branding: { primaryColor: '#38bdf8', accentColor: '#7dd3fc', background: '#0a0a0a' }
  },
  {
    id: 'contractor',
    name: 'Contractor',
    icon: '\uD83D\uDD28',
    description: 'Job estimation, project management, client acquisition, subcontractor coordination, and invoice automation.',
    modules: {
      leadEngine: { enabled: true, label: 'Lead Engine', kpis: ['estimate-conversion', 'pipeline-value', 'lead-response-time'] },
      content: { enabled: true, label: 'Content Studio', kpis: ['portfolio-views', 'review-score', 'social-reach'] },
      market: { enabled: true, label: 'Market Intelligence', kpis: ['material-pricing', 'labor-rates', 'permit-trends'] },
      aiSkills: { enabled: true, label: 'AI Skills', kpis: ['skill-executions', 'estimation-accuracy', 'automation-rate'] },
      finance: { enabled: true, label: 'Job Financials', kpis: ['gross-margin', 'invoice-aging', 'cash-flow'] },
      operations: { enabled: true, label: 'Project Management', kpis: ['on-time-completion', 'change-order-rate', 'safety-incidents'] }
    },
    dashboardWidgets: ['revenue-counter', 'job-pipeline', 'ai-suggestions', 'project-timeline', 'material-tracker'],
    aiSkillCategories: ['Estimation AI', 'Content Generation', 'Client Communication', 'Subcontractor Matching', 'Invoice Automation'],
    branding: { primaryColor: '#f59e0b', accentColor: '#fbbf24', background: '#0a0a0a' }
  },
  {
    id: 'lawyer',
    name: 'Lawyer',
    icon: '\u2696\uFE0F',
    description: 'Client intake, case management, document automation, billing optimization, and practice development.',
    modules: {
      leadEngine: { enabled: true, label: 'Client Intake', kpis: ['intake-conversion', 'case-value', 'referral-rate'] },
      content: { enabled: true, label: 'Content & Thought Leadership', kpis: ['article-reach', 'speaking-engagements', 'media-mentions'] },
      market: { enabled: true, label: 'Legal Intelligence', kpis: ['case-law-updates', 'competitor-rates', 'market-demand'] },
      aiSkills: { enabled: true, label: 'AI Skills', kpis: ['document-automation', 'research-speed', 'billing-accuracy'] },
      finance: { enabled: true, label: 'Billing & Revenue', kpis: ['billable-hours', 'realization-rate', 'collections-rate'] },
      operations: { enabled: false, label: 'Case Management', kpis: ['case-throughput', 'deadline-compliance', 'client-satisfaction'] }
    },
    dashboardWidgets: ['revenue-counter', 'case-pipeline', 'ai-suggestions', 'deadline-calendar', 'billing-tracker'],
    aiSkillCategories: ['Client Intake', 'Document Automation', 'Legal Research', 'Billing Optimization', 'Case Strategy'],
    branding: { primaryColor: '#6366f1', accentColor: '#818cf8', background: '#0a0a0a' }
  },
  {
    id: 'insurance',
    name: 'Insurance Agent',
    icon: '\uD83D\uDEE1\uFE0F',
    description: 'Policy sales, claims processing, client retention, cross-sell optimization, and compliance monitoring.',
    modules: {
      leadEngine: { enabled: true, label: 'Prospect Engine', kpis: ['quote-conversion', 'policy-value', 'referral-rate'] },
      content: { enabled: true, label: 'Content Studio', kpis: ['educational-reach', 'email-open-rate', 'social-engagement'] },
      market: { enabled: true, label: 'Market Intelligence', kpis: ['rate-competitiveness', 'carrier-updates', 'regulatory-changes'] },
      aiSkills: { enabled: true, label: 'AI Skills', kpis: ['skill-executions', 'quote-accuracy', 'automation-rate'] },
      finance: { enabled: true, label: 'Commission Tracking', kpis: ['commission-revenue', 'retention-rate', 'lifetime-value'] },
      operations: { enabled: false, label: 'Policy Administration', kpis: ['renewal-rate', 'claims-response', 'compliance-score'] }
    },
    dashboardWidgets: ['revenue-counter', 'prospect-pipeline', 'ai-suggestions', 'renewal-calendar', 'compliance-tracker'],
    aiSkillCategories: ['Prospect Qualification', 'Quote Generation', 'Cross-Sell AI', 'Claims Support', 'Retention Campaigns'],
    branding: { primaryColor: '#10b981', accentColor: '#34d399', background: '#0a0a0a' }
  }
];

export function getTemplate(occupationId) {
  return INDUSTRY_TEMPLATES.find((t) => t.id === occupationId) || INDUSTRY_TEMPLATES[0];
}

export function getTemplateModules(occupationId) {
  const template = getTemplate(occupationId);
  return Object.entries(template.modules).map(([key, mod]) => ({ id: key, ...mod }));
}
