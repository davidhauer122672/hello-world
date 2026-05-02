/**
 * Coastal Key Agent Registry.
 */

export { salesAgent, ClientSalesAgent } from './client-sales-agent';
export { clientBuildingAgent, ClientBuildingAgent } from './client-building-agent';

export type AgentType = 'sales' | 'client';

export function getAgent(type: AgentType) {
  const { salesAgent } = require('./client-sales-agent');
  const { clientBuildingAgent } = require('./client-building-agent');
  return type === 'sales' ? salesAgent : clientBuildingAgent;
}
