/**
 * Coastal Key AI Division Definitions
 *
 * 11 operational divisions that map to the org chart.
 * Each division has a color, icon, and description used by the Command Center UI.
 *
 * MCCO (Sovereign Governance) sits above MKT and SEN in the org hierarchy.
 */

export const DIVISIONS = [
  {
    id: 'MCCO',
    name: 'MCCO Command',
    color: '#d4af37',
    icon: 'shield-star',
    description: 'Master Chief Commanding Officer — Sovereign-level governance over all Marketing & Sales operations. Ferrari-Standard execution. Commands MKT (47 agents) and SEN (40 agents) divisions. CMO reports directly to MCCO.',
  },
  {
    id: 'EXC',
    name: 'Executive',
    color: '#6366f1',
    icon: 'crown',
    description: 'C-suite strategy, board reporting, and enterprise decision-making agents.',
  },
  {
    id: 'SEN',
    name: 'Sentinel Sales',
    color: '#ef4444',
    icon: 'phone',
    description: 'Inbound/outbound sales call agents, lead qualification, and conversion pipeline.',
  },
  {
    id: 'OPS',
    name: 'Operations',
    color: '#f59e0b',
    icon: 'cog',
    description: 'Property management, maintenance, inspections, concierge, and guest services.',
  },
  {
    id: 'INT',
    name: 'Intelligence',
    color: '#10b981',
    icon: 'chart-bar',
    description: 'Market research, competitive intel, data analysis, and predictive modeling.',
  },
  {
    id: 'MKT',
    name: 'Marketing',
    color: '#8b5cf6',
    icon: 'megaphone',
    description: 'Content creation, social media, email campaigns, brand management, and SEO.',
  },
  {
    id: 'FIN',
    name: 'Finance',
    color: '#06b6d4',
    icon: 'currency-dollar',
    description: 'Revenue tracking, investor relations, budgeting, forecasting, and compliance.',
  },
  {
    id: 'VEN',
    name: 'Vendor Management',
    color: '#f97316',
    icon: 'truck',
    description: 'Vendor compliance, procurement, contract management, and service quality.',
  },
  {
    id: 'TEC',
    name: 'Technology',
    color: '#64748b',
    icon: 'code',
    description: 'Platform ops, API integrations, monitoring, CI/CD, and infrastructure.',
  },
  {
    id: 'WEB',
    name: 'Website Development',
    color: '#0ea5e9',
    icon: 'globe',
    description: 'Website architecture, frontend development, deployment, and domain consolidation for coastalkey-pm.com.',
  },
  {
    id: 'COOP',
    name: 'Cooperations Committee',
    color: '#ec4899',
    icon: 'handshake',
    description: 'CEO external engagement coordination — strategic contacts, meeting preparation, outreach drafting, relationship network analysis, and social calendar management. 3 squads: Outreach (4 agents), Engagement (3 agents), Intelligence (3 agents). Reports directly to CEO.',
  },
  {
    id: 'CDX',
    name: 'Content Domination',
    color: '#dc2626',
    icon: 'target',
    description: 'Continuous market research, competitive intelligence, YouTube/web channel scanning, data integrity enforcement, and end-to-end system validation. 3 squads: Research (4 agents), Scan (3 agents), Integrity (3 agents). Reports to MCCO-000 Sovereign.',
  },
  {
    id: 'BFR',
    name: 'Business Forecast',
    color: '#dc2626',
    icon: 'trending-up',
    description: 'Ferrari-grade 18-month market forecasting, demand modeling, competitive intelligence, and CEO-ready strategic deliverables for home watch and property management.',
  },
  {
    id: 'SCM',
    name: 'Social Campaign Marketing',
    color: '#e11d48',
    icon: 'fire',
    description: 'Revenue-generating social media operations. Campaign-driven, aggressive, content-savvy. Converts social presence into signed property management clients through the Coastal Key business framework and CEO journey narrative.',
  },
];
