/**
 * Governance API Routes
 * Serves the Sovereign Governance Compendium and Mission Statement via API.
 */

import {
  MISSION_STATEMENT,
  MORAL_PRINCIPALS,
  GOVERNANCE_PRINCIPLES,
  CEO_JOURNEY,
  AGENT_GOVERNANCE_DIRECTIVE,
  SOVEREIGN_MANDATE,
  DIVISION_PRINCIPAL_MAP,
  SUBSCRIPTION_TIERS
} from '../governance/compendium.js';
import { jsonResponse } from '../utils/response.js';

export function handleGovernanceCompendium() {
  return jsonResponse({
    mandate: SOVEREIGN_MANDATE,
    mission: MISSION_STATEMENT,
    moralPrincipals: MORAL_PRINCIPALS,
    principles: GOVERNANCE_PRINCIPLES,
    ceoJourney: CEO_JOURNEY,
    divisionMapping: DIVISION_PRINCIPAL_MAP,
    agentDirective: AGENT_GOVERNANCE_DIRECTIVE
  });
}

export function handleGovernanceMission() {
  return jsonResponse({
    mission: MISSION_STATEMENT,
    moralPrincipals: {
      service: MORAL_PRINCIPALS.service.declaration,
      stewardship: MORAL_PRINCIPALS.stewardship.declaration,
      security: MORAL_PRINCIPALS.security.declaration
    },
    foundationalPrinciples: MISSION_STATEMENT.foundationalPrinciples,
    tagline: MISSION_STATEMENT.tagline,
    compact: MISSION_STATEMENT.compact
  });
}

export function handleSubscriptionTiers() {
  return jsonResponse({ tiers: SUBSCRIPTION_TIERS });
}
