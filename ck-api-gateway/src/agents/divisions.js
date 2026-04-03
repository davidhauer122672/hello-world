/**
 * Coastal Key AI Division Definitions
 *
 * 10 operational divisions that map to the org chart.
 * Each division has a color, icon, and description used by the Command Center UI.
 */

export const DIVISIONS = [
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
    description: 'Content creation, social media, email campaigns, brand management, SEO, and the Design & Luxury Brand creative strategy team (MKT-041 through MKT-060).',
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
    id: 'SEC',
    name: 'Sovereign Shield',
    color: '#dc2626',
    icon: 'shield-check',
    description: 'Enterprise security operations: API protection, middleware hardening, cloud governance, threat detection, compliance, and incident response.',
  },
];
