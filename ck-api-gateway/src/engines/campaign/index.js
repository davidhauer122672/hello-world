/**
 * Campaign Engine Index — Peak-Time Intelligence Engine
 *
 * Enterprise Mass Production Campaign #1
 * Wires together all campaign sub-modules and exports a unified API.
 */

// ── Sub-modules ────────────────────────────────────────────────────────────

export { EDT_OFFSET, EST_OFFSET, isEDT, getUTCOffset, getTimezoneLabel, getTimezoneAbbr, easternToUTC, utcToEastern, toBufferTimestamp, getDSTTransitions, getSpringForwardUTC, getFallBackUTC } from './dst-handler.js';

export { PLATFORMS, DAYS, generateScheduleSlots, getWeeklyPostCounts, getNextSlot, getAllNextSlots, validateSlot } from './scheduling-matrix.js';

export { schedulePost, scheduleBatch, checkPostStatus, getBufferConfigStatus } from './buffer-integration.js';

export { SMO_AGENT, TARGET_SEGMENTS, BUSINESS_TYPES, generateSMOAnalysisPrompt, getSMOStatus } from './sovereign-marketing-officer.js';

export { MARKET_SIZING, DEMAND_TRENDS, UNDERSERVED_OPPORTUNITIES, CAPITAL_FLOW, getMarketAnalysis } from './market-analysis.js';

export { PROBLEMS_TABLE, getProblemsAnalysis } from './problems-analysis.js';

export { OFFER_ESTATE_MANAGEMENT, OFFER_PM_SOFTWARE, OFFER_SOFTWARE_DEV, ALL_OFFERS, getLandingPageOffers } from './landing-page-offer.js';

export { WEEKLY_THEMES, DISTRIBUTION_CHANNELS, generate30DayPlan, getSegmentPrioritization, getDistributionPlan } from './distribution-plan.js';

// ── Re-export from parent peak-time engine ─────────────────────────────────

export {
  ENGINE_VERSION, ENGINE_ID, ENGINE_NAME, PLATFORM_MATRIX, TARGET_DEMOGRAPHIC,
  generateSchedule, getNextSlot as getNextSlotLegacy, getAllNextSlots as getAllNextSlotsLegacy,
  getDivisionSchedule, generateAllPointsBulletin,
} from '../peak-time-intelligence.js';

// ── Unified Campaign Dashboard ─────────────────────────────────────────────

/**
 * Get the full campaign status across all sub-engines.
 */
export function getCampaignDashboard() {
  return {
    campaign: {
      id: 'CAMPAIGN-001',
      name: 'Enterprise Mass Production Campaign #1: The Peak-Time Intelligence Engine',
      status: 'ACTIVE',
      governance: 'sovereign',
      executionStandard: 'ferrari',
    },
    engines: [
      { id: 'DST-HANDLER', name: 'DST Handler', status: 'operational', module: 'dst-handler.js' },
      { id: 'SCHEDULING-MATRIX', name: 'Platform Scheduling Matrix', status: 'operational', module: 'scheduling-matrix.js' },
      { id: 'BUFFER-INTEGRATION', name: 'Buffer Integration', status: 'operational', module: 'buffer-integration.js' },
      { id: 'SMO-001', name: 'Sovereign Marketing Officer', status: 'operational', module: 'sovereign-marketing-officer.js' },
      { id: 'MARKET-ANALYSIS', name: 'Market Analysis Engine', status: 'operational', module: 'market-analysis.js' },
      { id: 'PROBLEMS-ANALYSIS', name: 'Problems Analysis Engine', status: 'operational', module: 'problems-analysis.js' },
      { id: 'LANDING-PAGE-OFFER', name: 'Landing Page Offer Engine', status: 'operational', module: 'landing-page-offer.js' },
      { id: 'DISTRIBUTION-PLAN', name: '30-Day Distribution Plan', status: 'operational', module: 'distribution-plan.js' },
      { id: 'PEAK-TIME-INTEL', name: 'Peak-Time Intelligence Engine', status: 'operational', module: 'peak-time-intelligence.js' },
    ],
    totalEngines: 9,
    operationalEngines: 9,
    timestamp: new Date().toISOString(),
  };
}
