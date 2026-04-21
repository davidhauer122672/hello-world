/**
 * Coastal Key API Gateway — Agent Registry
 * Sources the canonical 40-agent registry from the Agent OS.
 * Provides the AGENTS, DIVISIONS, and lookup helpers consumed by gateway routes.
 */

import masterRegistry from '../../../ck-agent-os/config/agent-registry.json';

export const AGENTS = masterRegistry.agents.map(agent => ({
  id: agent.id,
  name: agent.codename,
  fullName: agent.name,
  division: agent.division,
  divisionName: agent.division_name,
  tier: agent.tier,
  role: agent.role,
  description: agent.mission,
  status: agent.status || 'active',
  capabilities: agent.capabilities,
  triggers: agent.triggers,
  outputs: agent.outputs,
  kpis: agent.kpis,
  riskLevel: agent.risk_level,
  integrations: agent.integrations,
  governanceRules: agent.governance_rules,
  dependencies: agent.dependencies
}));

const DIVISION_META = {
  EXC: { name: 'Executive Command', color: '#9B59B6' },
  SEN: { name: 'Sentinel Operations', color: '#E74C3C' },
  OPS: { name: 'Operations', color: '#3498DB' },
  INT: { name: 'Intelligence', color: '#1ABC9C' },
  MKT: { name: 'Marketing', color: '#2ECC71' },
  FIN: { name: 'Finance', color: '#F1C40F' },
  VEN: { name: 'Vendor & Partnerships', color: '#95A5A6' },
  TEC: { name: 'Technology', color: '#2980B9' }
};

export const DIVISIONS = Object.entries(masterRegistry.divisions).map(([id, count]) => ({
  id,
  name: DIVISION_META[id]?.name || id,
  color: DIVISION_META[id]?.color || '#666',
  agentCount: count
}));

export function getAgentsByDivision(divisionId) {
  return AGENTS.filter(a => a.division === divisionId.toUpperCase());
}

export function getAgentById(agentId) {
  return AGENTS.find(a => a.id === agentId || a.name.toLowerCase() === agentId.toLowerCase());
}
