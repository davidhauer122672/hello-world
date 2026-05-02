import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_WINDOWS, SEASONAL_ADJUSTMENTS, BLACKOUT_DATES, getOptimalTime, getPeakTimeDashboard } from '../engines/peak-time-intelligence.js';
import { CERTIFICATION_TRACKS, RECRUITMENT_PIPELINE, REFERRAL_TIERS, getGrowthDashboard } from '../engines/growth-platform.js';

describe('Peak-Time Intelligence Engine', () => {
  it('has 4 channels with contact windows', () => {
    const channels = Object.keys(CONTACT_WINDOWS);
    assert.equal(channels.length, 4);
    assert.deepEqual(channels.sort(), ['email', 'sms', 'social', 'voice']);
  });

  it('has 2 seasonal adjustments', () => {
    assert.ok(SEASONAL_ADJUSTMENTS.snowbird);
    assert.ok(SEASONAL_ADJUSTMENTS.summer);
    assert.ok(SEASONAL_ADJUSTMENTS.snowbird.multiplier > 1);
    assert.ok(SEASONAL_ADJUSTMENTS.summer.multiplier < 1);
  });

  it('has blackout dates', () => {
    assert.ok(BLACKOUT_DATES.length >= 10);
    assert.ok(BLACKOUT_DATES.every((d) => d.date && d.name));
  });

  it('getOptimalTime returns valid window for Tuesday voice', () => {
    const result = getOptimalTime('voice', '2026-01-06');
    assert.equal(result.channel, 'voice');
    assert.ok(result.window);
    assert.ok(result.engagementScore > 0);
    assert.ok(result.recommendation);
  });

  it('getOptimalTime returns blackout for Christmas', () => {
    const result = getOptimalTime('voice', '2026-12-25');
    assert.equal(result.blackout, true);
    assert.equal(result.holiday, 'Christmas Day');
  });

  it('getOptimalTime returns unavailable for Sunday voice', () => {
    const result = getOptimalTime('voice', '2026-01-04');
    assert.equal(result.available, false);
  });

  it('getPeakTimeDashboard returns full structure', () => {
    const d = getPeakTimeDashboard();
    assert.equal(d.engine, 'Peak-Time Intelligence');
    assert.ok(d.channels.length === 4);
    assert.ok(d.totalWindows > 0);
    assert.ok(d.currentSeason);
    assert.ok(d.timestamp);
  });
});

describe('Growth Platform Engine', () => {
  it('has 5 certification tracks', () => {
    assert.equal(CERTIFICATION_TRACKS.length, 5);
    assert.ok(CERTIFICATION_TRACKS.every((t) => t.id && t.name && t.modules > 0));
  });

  it('recruitment pipeline has 6 stages', () => {
    assert.equal(RECRUITMENT_PIPELINE.stages.length, 6);
  });

  it('recruitment has 5 division needs', () => {
    assert.equal(Object.keys(RECRUITMENT_PIPELINE.divisionNeeds).length, 5);
    assert.ok(RECRUITMENT_PIPELINE.capacityModel.currentHeadcount > 0);
  });

  it('has 4 referral tiers in ascending order', () => {
    assert.equal(REFERRAL_TIERS.length, 4);
    for (let i = 1; i < REFERRAL_TIERS.length; i++) {
      assert.ok(REFERRAL_TIERS[i].threshold > REFERRAL_TIERS[i - 1].threshold);
      assert.ok(REFERRAL_TIERS[i].reward > REFERRAL_TIERS[i - 1].reward);
    }
  });

  it('getGrowthDashboard returns complete structure', () => {
    const d = getGrowthDashboard();
    assert.equal(d.platform, 'Coastal Key Growth Platform');
    assert.ok(d.learning.tracks === 5);
    assert.ok(d.learning.totalModules > 0);
    assert.ok(d.learning.totalHours > 0);
    assert.ok(d.recruitment.openRoles > 0);
    assert.ok(d.referral.tiers === 4);
    assert.ok(d.timestamp);
  });
});
