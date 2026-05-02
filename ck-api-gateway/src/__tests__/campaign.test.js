/**
 * Campaign Route & Engine Tests — Peak-Time Intelligence Engine
 *
 * Tests for the 19 campaign endpoints and underlying DST handler,
 * scheduling matrix, and campaign sub-engines.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

function makeURL(path, params = {}) {
  const url = new URL(`https://test.workers.dev${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url;
}

function makeRequest(body) {
  return {
    json: async () => body,
  };
}

async function body(res) {
  return JSON.parse(await res.text());
}

const mockEnv = {
  ANTHROPIC_API_KEY: 'test-key',
  AUDIT_LOG: { put: async () => {} },
};

const mockCtx = { waitUntil: () => {} };

// ── DST Handler ────────────────────────────────────────────────────────────

describe('DST Handler', async () => {
  const {
    EDT_OFFSET, EST_OFFSET, isEDT, getUTCOffset, getTimezoneLabel,
    getTimezoneAbbr, easternToUTC, utcToEastern, toPublishTimestamp,
    getDSTTransitions, getSpringForwardUTC, getFallBackUTC,
  } = await import('../engines/campaign/dst-handler.js');

  it('exports correct EDT/EST offset constants', () => {
    assert.equal(EDT_OFFSET, -4);
    assert.equal(EST_OFFSET, -5);
  });

  it('correctly identifies EDT during summer months', () => {
    // July 15, 2026 12:00 UTC — clearly EDT
    const summer = new Date('2026-07-15T12:00:00Z');
    assert.equal(isEDT(summer), true);
    assert.equal(getTimezoneLabel(summer), 'EDT (UTC-4)');
    assert.equal(getTimezoneAbbr(summer), 'EDT');
    assert.equal(getUTCOffset(summer), -4);
  });

  it('correctly identifies EST during winter months', () => {
    // January 15, 2026 12:00 UTC — clearly EST
    const winter = new Date('2026-01-15T12:00:00Z');
    assert.equal(isEDT(winter), false);
    assert.equal(getTimezoneLabel(winter), 'EST (UTC-5)');
    assert.equal(getTimezoneAbbr(winter), 'EST');
    assert.equal(getUTCOffset(winter), -5);
  });

  it('converts Eastern 9AM to correct UTC in EDT', () => {
    // During EDT: 9AM ET = 1PM UTC (9 + 4 = 13)
    const utc = easternToUTC('2026-07-15', 9, 0);
    assert.equal(utc.getUTCHours(), 13);
    assert.equal(utc.getUTCMinutes(), 0);
  });

  it('converts Eastern 9AM to correct UTC in EST', () => {
    // During EST: 9AM ET = 2PM UTC (9 + 5 = 14)
    const utc = easternToUTC('2026-01-15', 9, 0);
    assert.equal(utc.getUTCHours(), 14);
    assert.equal(utc.getUTCMinutes(), 0);
  });

  it('converts UTC back to Eastern correctly', () => {
    const utc = new Date('2026-07-15T13:00:00Z');
    const eastern = utcToEastern(utc);
    assert.equal(eastern.hour, 9);
  });

  it('formats publish timestamps as clean ISO strings', () => {
    const date = new Date('2026-07-15T13:00:00.123Z');
    const ts = toPublishTimestamp(date);
    assert.equal(ts, '2026-07-15T13:00:00Z');
    assert.ok(!ts.includes('.'));
  });

  it('calculates spring forward transition for 2026', () => {
    const sf = getSpringForwardUTC(2026);
    // 2nd Sunday of March 2026 = March 8. Spring forward at 2AM EST = 7AM UTC
    assert.equal(sf.getUTCMonth(), 2); // March = 2
    assert.equal(sf.getUTCHours(), 7);
    assert.ok(sf.getUTCDate() >= 8 && sf.getUTCDate() <= 14);
  });

  it('calculates fall back transition for 2026', () => {
    const fb = getFallBackUTC(2026);
    // 1st Sunday of November 2026 = Nov 1. Fall back at 2AM EDT = 6AM UTC
    assert.equal(fb.getUTCMonth(), 10); // November = 10
    assert.equal(fb.getUTCHours(), 6);
    assert.ok(fb.getUTCDate() >= 1 && fb.getUTCDate() <= 7);
  });

  it('returns full DST transition data for a year', () => {
    const t = getDSTTransitions(2026);
    assert.equal(t.year, 2026);
    assert.ok(t.springForward);
    assert.ok(t.fallBack);
    assert.ok(t.springForwardLocal);
    assert.ok(t.fallBackLocal);
    assert.ok(t.edtMonths.includes('March'));
    assert.ok(t.estMonths.includes('November'));
  });

  it('handles EDT/EST boundary: day before spring forward is EST', () => {
    const sf = getSpringForwardUTC(2026);
    const dayBefore = new Date(sf);
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);
    dayBefore.setUTCHours(12, 0, 0, 0);
    assert.equal(isEDT(dayBefore), false);
  });

  it('handles EDT/EST boundary: day after spring forward is EDT', () => {
    const sf = getSpringForwardUTC(2026);
    const dayAfter = new Date(sf);
    dayAfter.setUTCDate(dayAfter.getUTCDate() + 1);
    dayAfter.setUTCHours(12, 0, 0, 0);
    assert.equal(isEDT(dayAfter), true);
  });
});

// ── Scheduling Matrix ──────────────────────────────────────────────────────

describe('Scheduling Matrix', async () => {
  const {
    PLATFORMS, DAYS, generateScheduleSlots, getWeeklyPostCounts,
    getNextSlot, getAllNextSlots, validateSlot,
  } = await import('../engines/campaign/scheduling-matrix.js');

  it('defines 5 platforms', () => {
    const keys = Object.keys(PLATFORMS);
    assert.equal(keys.length, 5);
    assert.ok(keys.includes('instagram'));
    assert.ok(keys.includes('facebook'));
    assert.ok(keys.includes('linkedin'));
    assert.ok(keys.includes('x'));
    assert.ok(keys.includes('threads'));
  });

  it('every platform has claude-ai publish engine', () => {
    for (const [, p] of Object.entries(PLATFORMS)) {
      assert.equal(p.publishEngine, 'claude-ai');
    }
  });

  it('generates schedule slots for 7 days', () => {
    const slots = generateScheduleSlots('2026-04-13', 7);
    assert.ok(Array.isArray(slots));
    assert.ok(slots.length > 0);
    for (const slot of slots) {
      assert.ok(slot.platform);
      assert.ok(slot.publishTimestamp);
      assert.ok(slot.timezone);
    }
  });

  it('filters schedule by platform', () => {
    const slots = generateScheduleSlots('2026-04-13', 7, ['instagram']);
    assert.ok(slots.every(s => s.platform === 'instagram'));
  });

  it('returns weekly post counts per platform', () => {
    const counts = getWeeklyPostCounts();
    assert.ok(counts.platforms);
    assert.ok(counts.totalPerWeek > 0);
    for (const [, data] of Object.entries(counts.platforms)) {
      assert.ok(data.postsPerWeek >= 0);
    }
  });

  it('gets next slot for each platform', () => {
    const allSlots = getAllNextSlots();
    assert.equal(typeof allSlots, 'object');
    assert.equal(Object.keys(allSlots).length, 5);
  });

  it('validates a correct slot', () => {
    // Tuesday 9AM on Instagram should be valid
    const result = validateSlot('instagram', '2026-04-14', 9, 0);
    assert.equal(result.valid, true);
  });
});

// ── Campaign Routes ────────────────────────────────────────────────────────

describe('Campaign Routes — Dashboard & Schedule', async () => {
  const {
    handleCampaignPeakTimeDashboard,
    handleCampaignSchedule,
    handleCampaignNextSlots,
    handleCampaignMatrix,
    handleCampaignDST,
    handleCampaignBulletin,
    handleCampaignPublishStatus,
    handleCampaignWeeklyCounts,
  } = await import('../routes/campaign.js');

  it('GET dashboard returns 9 operational engines', async () => {
    const b = await body(handleCampaignPeakTimeDashboard());
    assert.equal(b.campaign.id, 'CAMPAIGN-001');
    assert.equal(b.campaign.status, 'ACTIVE');
    assert.equal(b.totalEngines, 9);
    assert.equal(b.operationalEngines, 9);
    assert.ok(Array.isArray(b.engines));
  });

  it('GET schedule returns posting slots with timestamps', async () => {
    const res = handleCampaignSchedule(makeURL('/v1/campaign/peak-time/schedule', { days: '7' }));
    const b = await body(res);
    assert.ok(b.engine.includes('Peak-Time'));
    assert.ok(Array.isArray(b.schedule));
    assert.ok(b.totalPosts > 0);
    assert.ok(b.targetDemographic);
  });

  it('GET schedule limits to 90 days max', async () => {
    const b = await body(handleCampaignSchedule(makeURL('/schedule', { days: '365' })));
    assert.equal(b.days, 90);
  });

  it('GET next-slots returns slots for all platforms', async () => {
    const b = await body(handleCampaignNextSlots());
    assert.ok(b.nextSlots);
    assert.equal(Object.keys(b.nextSlots).length, 5);
    assert.ok(b.engine.includes('Peak-Time'));
  });

  it('GET matrix returns all 5 platforms with demographic', async () => {
    const b = await body(handleCampaignMatrix());
    assert.ok(b.platforms);
    assert.equal(Object.keys(b.platforms).length, 5);
    assert.ok(b.targetDemographic);
    assert.ok(b.weeklyPostCounts);
  });

  it('GET dst returns current timezone and transitions', async () => {
    const b = await body(handleCampaignDST(makeURL('/dst', { year: '2026' })));
    assert.ok(b.current);
    assert.ok(typeof b.current.isEDT === 'boolean');
    assert.ok(b.transitions);
    assert.equal(b.transitions.year, 2026);
  });

  it('GET bulletin returns All Points Bulletin', async () => {
    const b = await body(handleCampaignBulletin(mockEnv, mockCtx));
    assert.ok(b.bulletinId);
    assert.ok(b.directive.title);
    assert.ok(b.classification === 'ALL POINTS BULLETIN');
  });

  it('GET publish-status returns claude-ai mode', async () => {
    const b = await body(handleCampaignPublishStatus(mockEnv));
    assert.equal(b.mode, 'claude-ai');
    assert.ok(b.profiles);
    assert.equal(b.claudeApiConfigured, true);
  });

  it('GET weekly-counts returns per-platform post counts', async () => {
    const b = await body(handleCampaignWeeklyCounts());
    assert.ok(b.platforms);
    assert.ok(b.totalPerWeek > 0);
  });
});

describe('Campaign Routes — SMO & Market Analysis', async () => {
  const {
    handleCampaignSMO,
    handleCampaignMarketAnalysis,
    handleCampaignProblems,
    handleCampaignOffers,
    handleCampaignDistribution,
  } = await import('../routes/campaign.js');

  it('GET smo returns Sovereign Marketing Officer status', async () => {
    const b = await body(handleCampaignSMO());
    assert.equal(b.agent.id, 'SMO-001');
    assert.ok(b.targetSegments);
    assert.ok(b.businessTypes);
    assert.equal(b.governance, 'sovereign');
  });

  it('GET market-analysis returns TAM/SAM/SOM with trends', async () => {
    const b = await body(handleCampaignMarketAnalysis());
    assert.ok(b.sections.marketSizing);
    assert.ok(b.sections.demandTrends);
    assert.ok(b.sections.underservedOpportunities);
    assert.ok(b.sections.capitalFlow);
    assert.ok(b.sections.marketSizing.TAM);
    assert.ok(b.sections.marketSizing.SAM);
    assert.ok(b.sections.marketSizing.SOM);
  });

  it('GET problems returns scored problems table', async () => {
    const b = await body(handleCampaignProblems());
    assert.ok(Array.isArray(b.problems));
    assert.equal(b.problems.length, 10);
    // First problem should have highest score
    assert.ok(b.problems[0].combinedScore >= b.problems[9].combinedScore);
    assert.ok(b.scoringMethodology);
  });

  it('GET offers returns 3 landing page offers', async () => {
    const b = await body(handleCampaignOffers());
    assert.ok(Array.isArray(b.offers));
    assert.equal(b.offers.length, 3);
    for (const offer of b.offers) {
      assert.ok(offer.sections.headline);
      assert.ok(offer.sections.icp);
      assert.ok(offer.sections.offerComponents);
    }
  });

  it('GET distribution returns 30-day plan with channels', async () => {
    const b = await body(handleCampaignDistribution(makeURL('/distribution')));
    assert.ok(b.calendar);
    assert.equal(b.calendar.length, 30);
    assert.ok(b.channels);
    assert.ok(b.channels.organic);
    assert.ok(b.channels.paid);
    assert.ok(b.segmentPrioritization);
    assert.ok(b.weeklyThemes);
    assert.equal(b.weeklyThemes.length, 4);
  });
});

describe('Campaign Routes — POST Endpoints', async () => {
  const {
    handleCampaignSchedulePost,
    handleCampaignScheduleBatch,
    handleCampaignValidateSlot,
    handleCampaignDivisionSchedule,
  } = await import('../routes/campaign.js');

  it('POST schedule-post rejects missing fields', async () => {
    const res = await handleCampaignSchedulePost(makeRequest({}), mockEnv, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST schedule-post rejects invalid JSON', async () => {
    const res = await handleCampaignSchedulePost({ json: async () => { throw new Error(); } }, mockEnv, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST schedule-batch rejects empty posts array', async () => {
    const res = await handleCampaignScheduleBatch(makeRequest({ posts: [] }), mockEnv, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST schedule-batch rejects non-array', async () => {
    const res = await handleCampaignScheduleBatch(makeRequest({ posts: 'not-array' }), mockEnv, mockCtx);
    assert.equal(res.status, 400);
  });

  it('POST validate-slot rejects missing fields', async () => {
    const res = await handleCampaignValidateSlot(makeRequest({}));
    assert.equal(res.status, 400);
  });

  it('POST validate-slot accepts valid slot data', async () => {
    const res = await handleCampaignValidateSlot(makeRequest({
      platform: 'instagram',
      date: '2026-04-14',
      hour: 9,
      minute: 0,
    }));
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.equal(b.valid, true);
  });

  it('GET division/:code returns division schedule', async () => {
    const res = handleCampaignDivisionSchedule('MKT', makeURL('/division/MKT', { days: '7' }));
    assert.equal(res.status, 200);
    const b = await body(res);
    assert.ok(b);
  });
});

// ── Claude AI Publisher ────────────────────────────────────────────────────

describe('Claude AI Publisher', async () => {
  const {
    schedulePost, scheduleBatch, checkPostStatus, getPublishConfigStatus,
  } = await import('../engines/campaign/claude-ai-publisher.js');

  it('rejects unknown platform', async () => {
    const result = await schedulePost(mockEnv, { platform: 'myspace', text: 'test', scheduledAt: new Date() });
    assert.equal(result.success, false);
    assert.ok(result.reason.includes('Unknown platform'));
  });

  it('rejects empty text', async () => {
    const result = await schedulePost(mockEnv, { platform: 'instagram', text: '', scheduledAt: new Date() });
    assert.equal(result.success, false);
    assert.ok(result.reason.includes('required'));
  });

  it('checkPostStatus returns claude-ai mode', () => {
    const result = checkPostStatus(mockEnv, 'PUB-123');
    assert.equal(result.mode, 'claude-ai');
    assert.equal(result.publishId, 'PUB-123');
    assert.equal(result.status, 'ready');
  });

  it('getPublishConfigStatus returns per-platform config', () => {
    const result = getPublishConfigStatus(mockEnv);
    assert.equal(result.mode, 'claude-ai');
    assert.equal(result.claudeApiConfigured, true);
    assert.ok(result.profiles);
    assert.ok(result.profiles.instagram);
    assert.equal(result.profiles.instagram.engine, 'claude-ai');
  });

  it('getPublishConfigStatus reflects missing API key', () => {
    const result = getPublishConfigStatus({});
    assert.equal(result.claudeApiConfigured, false);
    assert.equal(result.configuredPlatforms, 0);
  });
});

// ── Distribution Plan ──────────────────────────────────────────────────────

describe('Distribution Plan Engine', async () => {
  const {
    WEEKLY_THEMES, DISTRIBUTION_CHANNELS,
    generate30DayPlan, getSegmentPrioritization, getDistributionPlan,
  } = await import('../engines/campaign/distribution-plan.js');

  it('defines 4 weekly themes', () => {
    assert.equal(WEEKLY_THEMES.length, 4);
    for (const theme of WEEKLY_THEMES) {
      assert.ok(theme.theme);
      assert.ok(theme.objective);
      assert.ok(Array.isArray(theme.contentFocus));
    }
  });

  it('defines organic, paid, and direct outreach channels', () => {
    assert.ok(DISTRIBUTION_CHANNELS.organic);
    assert.ok(DISTRIBUTION_CHANNELS.paid);
    assert.ok(DISTRIBUTION_CHANNELS.directOutreach);
  });

  it('generates exactly 30 days of plan', () => {
    const plan = generate30DayPlan('2026-04-14');
    assert.equal(plan.length, 30);
    assert.equal(plan[0].day, 1);
    assert.equal(plan[29].day, 30);
    assert.equal(plan[0].date, '2026-04-14');
  });

  it('segment prioritization returns 3 tiers', () => {
    const result = getSegmentPrioritization();
    assert.ok(result.tier1_immediate);
    assert.ok(result.tier2_accelerate);
    assert.ok(result.tier3_cultivate);
  });

  it('full distribution plan includes all sections', () => {
    const plan = getDistributionPlan('2026-04-14');
    assert.equal(plan.governance, 'sovereign');
    assert.equal(plan.executionStandard, 'ferrari');
    assert.ok(plan.calendar.length === 30);
    assert.ok(plan.channels);
    assert.ok(plan.volumeMetrics);
    assert.ok(plan.segmentPrioritization);
  });
});

// ── SMO Agent ──────────────────────────────────────────────────────────────

describe('Sovereign Marketing Officer', async () => {
  const {
    SMO_AGENT, TARGET_SEGMENTS, BUSINESS_TYPES,
    generateSMOAnalysisPrompt, getSMOStatus,
  } = await import('../engines/campaign/sovereign-marketing-officer.js');

  it('SMO agent has correct ID and division', () => {
    assert.equal(SMO_AGENT.id, 'SMO-001');
    assert.equal(SMO_AGENT.division, 'MCCO');
    assert.equal(SMO_AGENT.status, 'active');
  });

  it('defines 40+ target segments', () => {
    assert.ok(TARGET_SEGMENTS.length >= 40);
    for (const seg of TARGET_SEGMENTS) {
      assert.ok(seg.id);
      assert.ok(seg.name);
      assert.ok(seg.priority);
    }
  });

  it('defines 3 business types', () => {
    assert.equal(BUSINESS_TYPES.length, 3);
  });

  it('generates analysis prompt for Claude API', () => {
    const prompt = generateSMOAnalysisPrompt('all');
    assert.ok(prompt.includes('Sovereign Marketing Officer'));
    assert.ok(prompt.length > 100);
  });

  it('getSMOStatus returns agent with segments and types', () => {
    const status = getSMOStatus();
    assert.equal(status.agent.id, 'SMO-001');
    assert.ok(status.targetSegments);
    assert.ok(status.businessTypes);
  });
});

// ── Market Analysis ────────────────────────────────────────────────────────

describe('Market Analysis Engine', async () => {
  const {
    MARKET_SIZING, DEMAND_TRENDS, UNDERSERVED_OPPORTUNITIES,
    CAPITAL_FLOW, getMarketAnalysis,
  } = await import('../engines/campaign/market-analysis.js');

  it('defines TAM, SAM, and SOM', () => {
    assert.ok(MARKET_SIZING.TAM);
    assert.ok(MARKET_SIZING.SAM);
    assert.ok(MARKET_SIZING.SOM);
  });

  it('defines 5 demand trends', () => {
    assert.equal(DEMAND_TRENDS.length, 5);
  });

  it('defines 5 underserved opportunities', () => {
    assert.equal(UNDERSERVED_OPPORTUNITIES.length, 5);
  });

  it('defines 5 capital flow areas', () => {
    assert.equal(CAPITAL_FLOW.length, 5);
  });

  it('getMarketAnalysis aggregates all data', () => {
    const analysis = getMarketAnalysis();
    assert.ok(analysis.sections.marketSizing);
    assert.ok(analysis.sections.demandTrends);
    assert.ok(analysis.sections.underservedOpportunities);
    assert.ok(analysis.sections.capitalFlow);
    assert.ok(analysis.timestamp);
  });
});

// ── Problems Analysis ──────────────────────────────────────────────────────

describe('Problems Analysis Engine', async () => {
  const { PROBLEMS_TABLE, getProblemsAnalysis } = await import('../engines/campaign/problems-analysis.js');

  it('defines 10 scored problems', () => {
    assert.equal(PROBLEMS_TABLE.length, 10);
    for (const problem of PROBLEMS_TABLE) {
      assert.ok(problem.rank);
      assert.ok(problem.problem);
      assert.ok(problem.combinedScore >= 1 && problem.combinedScore <= 20);
    }
  });

  it('problems are sorted by rank', () => {
    for (let i = 0; i < PROBLEMS_TABLE.length - 1; i++) {
      assert.ok(PROBLEMS_TABLE[i].rank <= PROBLEMS_TABLE[i + 1].rank);
    }
  });

  it('getProblemsAnalysis returns analysis with methodology', () => {
    const analysis = getProblemsAnalysis();
    assert.ok(analysis.problems);
    assert.equal(analysis.problems.length, 10);
    assert.ok(analysis.scoringMethodology);
  });
});

// ── Landing Page Offers ────────────────────────────────────────────────────

describe('Landing Page Offer Engine', async () => {
  const {
    OFFER_ESTATE_MANAGEMENT, OFFER_PM_SOFTWARE, OFFER_SOFTWARE_DEV,
    ALL_OFFERS, getLandingPageOffers,
  } = await import('../engines/campaign/landing-page-offer.js');

  it('defines 3 distinct offers', () => {
    assert.equal(ALL_OFFERS.length, 3);
    assert.ok(OFFER_ESTATE_MANAGEMENT.sections.headline);
    assert.ok(OFFER_PM_SOFTWARE.sections.headline);
    assert.ok(OFFER_SOFTWARE_DEV.sections.headline);
  });

  it('each offer has required sections', () => {
    for (const offer of ALL_OFFERS) {
      assert.ok(offer.sections.headline);
      assert.ok(offer.sections.icp);
      assert.ok(offer.sections.offerComponents);
      assert.ok(offer.sections.guarantee);
    }
  });

  it('getLandingPageOffers returns all 3 offers', () => {
    const result = getLandingPageOffers();
    assert.ok(result.offers);
    assert.equal(result.offers.length, 3);
  });
});
