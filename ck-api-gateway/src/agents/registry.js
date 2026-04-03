/**
 * Coastal Key AI Agent Registry
 *
 * Central registry for all 335 AI agents across 10 divisions.
 * Exports the AGENTS array, DIVISIONS array, and lookup functions
 * consumed by routes/agents.js and the Command Center dashboard.
 *
 * Division breakdown:
 *   EXC  Executive           — 20 agents
 *   SEN  Sentinel Sales      — 40 agents
 *   OPS  Operations          — 45 agents
 *   INT  Intelligence        — 30 agents
 *   MKT  Marketing           — 60 agents (40 core + 20 Design & Luxury Brand)
 *   FIN  Finance             — 25 agents
 *   VEN  Vendor Management   — 25 agents
 *   TEC  Technology          — 25 agents
 *   WEB  Website Development — 40 agents
 *   SEC  Sovereign Shield   — 25 agents
 *                       Total: 335 agents
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
import { SEC_AGENTS } from './agents-sec.js';
import { MKT_DESIGN_AGENTS } from './agents-mkt-design.js';

// ── Merged agent list ───────────────────────────────────────────────────────

export const AGENTS = [
  ...EXC_AGENTS,
  ...SEN_AGENTS,
  ...OPS_AGENTS,
  ...INT_AGENTS,
  ...MKT_AGENTS,
  ...MKT_DESIGN_AGENTS,
  ...FIN_AGENTS,
  ...VEN_AGENTS,
  ...TEC_AGENTS,
  ...WEB_AGENTS,
  ...SEC_AGENTS,
];

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
