/**
 * Coastal Key AI Agent Registry
 *
 * Central registry for all 290 AI agents across 9 divisions.
 * Exports the AGENTS array, DIVISIONS array, and lookup functions
 * consumed by routes/agents.js and the Command Center dashboard.
 *
 * All agents operate under the Coastal Key Sovereign Governance Compendium v1.0.
 * Each agent inherits its division's Moral Principal alignment (Service, Stewardship, or Security).
 *
 * Division breakdown:
 *   EXC  Executive           — 20 agents  (Stewardship)
 *   SEN  Sentinel Sales      — 40 agents  (Service)
 *   OPS  Operations          — 45 agents  (Service)
 *   INT  Intelligence        — 30 agents  (Stewardship)
 *   MKT  Marketing           — 40 agents  (Security)
 *   FIN  Finance             — 25 agents  (Stewardship)
 *   VEN  Vendor Management   — 25 agents  (Service)
 *   TEC  Technology          — 25 agents  (Security)
 *   WEB  Website Development — 40 agents  (Security)
 *                       Total: 290 agents
 */

import { DIVISIONS } from './divisions.js';
import { EXC_AGENTS } from './agents-exc.js';
import { SEN_AGENTS } from './agents-sen.js';
import { OPS_AGENTS } from './agents-ops.js';
import { INT_AGENTS } from './agents-int.js';
import { MKT_AGENTS } from './agents-mkt.js';
import { FIN_AGENTS } from './agents-fin.js';
import { VEN_AGENTS } from './agents-ven.js';
import { TEC_AGENTS } from './agents-tec.js';
import { WEB_AGENTS } from './agents-web.js';

// ── Division Governance Mapping ─────────────────────────────────────────────

const DIVISION_GOVERNANCE = {};
for (const div of DIVISIONS) {
  DIVISION_GOVERNANCE[div.id] = {
    moralPrincipal: div.moralPrincipal,
    governancePrinciples: div.governancePrinciples,
  };
}

// ── Merged agent list with governance enrichment ────────────────────────────

const RAW_AGENTS = [
  ...EXC_AGENTS,
  ...SEN_AGENTS,
  ...OPS_AGENTS,
  ...INT_AGENTS,
  ...MKT_AGENTS,
  ...FIN_AGENTS,
  ...VEN_AGENTS,
  ...TEC_AGENTS,
  ...WEB_AGENTS,
];

// Enrich each agent with governance metadata from its division
export const AGENTS = RAW_AGENTS.map(agent => ({
  ...agent,
  governance: {
    compendium: 'v1.0',
    moralPrincipal: DIVISION_GOVERNANCE[agent.division]?.moralPrincipal || 'service',
    principles: DIVISION_GOVERNANCE[agent.division]?.governancePrinciples || [],
    compliant: true,
  },
}));

// Re-export divisions so consumers only need one import path
export { DIVISIONS };

// ── Prebuilt indexes for fast lookups ────────────────────────────────────────

const _byId = new Map(AGENTS.map(a => [a.id, a]));
const _byDivision = new Map();

for (const agent of AGENTS) {
  if (!_byDivision.has(agent.division)) {
    _byDivision.set(agent.division, []);
  }
  _byDivision.get(agent.division).push(agent);
}

// ── Public lookup helpers ───────────────────────────────────────────────────

/**
 * Return a single agent by its ID (e.g. "SEN-001"), or undefined.
 */
export function getAgentById(id) {
  return _byId.get(id);
}

/**
 * Return all agents belonging to a division (e.g. "OPS").
 * Returns an empty array for unknown divisions.
 */
export function getAgentsByDivision(divisionId) {
  return _byDivision.get(divisionId) || [];
}

/**
 * Return agents matching a status filter.
 */
export function getAgentsByStatus(status) {
  return AGENTS.filter(a => a.status === status);
}

/**
 * Return agents matching a tier filter.
 */
export function getAgentsByTier(tier) {
  return AGENTS.filter(a => a.tier === tier);
}
