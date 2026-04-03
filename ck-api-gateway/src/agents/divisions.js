/**
 * Coastal Key AI Division Definitions
 *
 * 9 operational divisions that map to the org chart.
 * Each division has a color, icon, description, and governance alignment
 * linking it to one of the three Moral Principals: Service, Stewardship, Security.
 *
 * Governed by: Coastal Key Sovereign Governance Compendium v1.0
 */

export const DIVISIONS = [
  {
    id: 'EXC',
    name: 'Executive',
    color: '#6366f1',
    icon: 'crown',
    description: 'C-suite strategy, board reporting, and enterprise decision-making agents.',
    moralPrincipal: 'stewardship',
    governancePrinciples: ['GOV-001', 'GOV-003', 'GOV-004', 'GOV-008'],
  },
  {
    id: 'SEN',
    name: 'Sentinel Sales',
    color: '#ef4444',
    icon: 'phone',
    description: 'Inbound/outbound sales call agents, lead qualification, and conversion pipeline.',
    moralPrincipal: 'service',
    governancePrinciples: ['GOV-001', 'GOV-005', 'GOV-007'],
  },
  {
    id: 'OPS',
    name: 'Operations',
    color: '#f59e0b',
    icon: 'cog',
    description: 'Property management, maintenance, inspections, concierge, and guest services.',
    moralPrincipal: 'service',
    governancePrinciples: ['GOV-002', 'GOV-005', 'GOV-008'],
  },
  {
    id: 'INT',
    name: 'Intelligence',
    color: '#10b981',
    icon: 'chart-bar',
    description: 'Market research, competitive intel, data analysis, and predictive modeling.',
    moralPrincipal: 'stewardship',
    governancePrinciples: ['GOV-001', 'GOV-002', 'GOV-004'],
  },
  {
    id: 'MKT',
    name: 'Marketing',
    color: '#8b5cf6',
    icon: 'megaphone',
    description: 'Content creation, social media, email campaigns, brand management, and SEO.',
    moralPrincipal: 'security',
    governancePrinciples: ['GOV-003', 'GOV-007', 'GOV-008'],
  },
  {
    id: 'FIN',
    name: 'Finance',
    color: '#06b6d4',
    icon: 'currency-dollar',
    description: 'Revenue tracking, investor relations, budgeting, forecasting, and compliance.',
    moralPrincipal: 'stewardship',
    governancePrinciples: ['GOV-001', 'GOV-002', 'GOV-003'],
  },
  {
    id: 'VEN',
    name: 'Vendor Management',
    color: '#f97316',
    icon: 'truck',
    description: 'Vendor compliance, procurement, contract management, and service quality.',
    moralPrincipal: 'service',
    governancePrinciples: ['GOV-002', 'GOV-005', 'GOV-008'],
  },
  {
    id: 'TEC',
    name: 'Technology',
    color: '#64748b',
    icon: 'code',
    description: 'Platform ops, API integrations, monitoring, CI/CD, and infrastructure.',
    moralPrincipal: 'security',
    governancePrinciples: ['GOV-004', 'GOV-006', 'GOV-008'],
  },
  {
    id: 'WEB',
    name: 'Website Development',
    color: '#0ea5e9',
    icon: 'globe',
    description: 'Website architecture, frontend development, deployment, and domain consolidation for coastalkey-pm.com.',
    moralPrincipal: 'security',
    governancePrinciples: ['GOV-004', 'GOV-006', 'GOV-008'],
  },
];
