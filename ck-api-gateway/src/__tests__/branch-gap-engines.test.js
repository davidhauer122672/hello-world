import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ENGINE_VERSION, ENGINE_ID, ENGINE_NAME, PLATFORM_MATRIX, TARGET_DEMOGRAPHIC, isEDT, generateSchedule, getNextSlot, getAllNextSlots } from '../engines/peak-time-intelligence.js';
import { CERTIFICATION_TRACKS, RECRUITMENT_PIPELINE, REFERRAL_TIERS, getGrowthDashboard } from '../engines/growth-platform.js';

describe('Peak-Time Intelligence Engine', () => {
  it('exports correct engine metadata', () => {
    assert.equal(ENGINE_VERSION, '1.0.0');
    assert.equal(ENGINE_ID, 'PEAK-TIME-INTEL-001');
    assert.equal(ENGINE_NAME, 'Peak-Time Intelligence Engine');
  });

  it('has 5 platforms in the scheduling matrix', () => {
    const platforms = Object.keys(PLATFORM_MATRIX);
    assert.equal(platforms.length, 5);
    assert.deepEqual(platforms.sort(), ['facebook', 'instagram', 'linkedin', 'threads', 'x']);
  });

  it('each platform has at least one slot with days and hour', () => {
    for (const [name, platform] of Object.entries(PLATFORM_MATRIX)) {
      assert.ok(platform.label, `${name} missing label`);
      assert.ok(platform.slots.length > 0, `${name} has no slots`);
      for (const slot of platform.slots) {
        assert.ok(Array.isArray(slot.days), `${name} slot missing days`);
        assert.ok(typeof slot.hour === 'number', `${name} slot missing hour`);
      }
    }
  });

  it('TARGET_DEMOGRAPHIC defines age range 45-65', () => {
    assert.equal(TARGET_DEMOGRAPHIC.ageRange, '45-65');
    assert.ok(TARGET_DEMOGRAPHIC.segments.length > 0);
  });

  it('isEDT correctly identifies summer as EDT', () => {
    const july = new Date('2026-07-15T12:00:00Z');
    assert.equal(isEDT(july), true);
  });

  it('isEDT correctly identifies winter as EST', () => {
    const jan = new Date('2026-01-15T12:00:00Z');
    assert.equal(isEDT(jan), false);
  });

  it('generateSchedule returns payload with schedule array', () => {
    const result = generateSchedule({ weeksAhead: 1 });
    assert.equal(result.engine, 'Peak-Time Intelligence Engine');
    assert.ok(Array.isArray(result.schedule));
    assert.ok(result.schedule.length > 0);
    for (const item of result.schedule.slice(0, 3)) {
      assert.ok(item.platform);
      assert.ok(item.utcTimestamp);
      assert.ok(item.easternTime);
    }
  });

  it('getNextSlot returns a valid next slot for instagram', () => {
    const slot = getNextSlot('instagram');
    assert.ok(slot);
    assert.ok(slot.utcTimestamp);
    assert.ok(slot.easternTime);
    assert.equal(slot.platform, 'instagram');
  });

  it('getAllNextSlots returns one entry per platform', () => {
    const slots = getAllNextSlots();
    assert.equal(Object.keys(slots).length, 5);
    assert.ok(slots.instagram);
    assert.ok(slots.facebook);
    assert.ok(slots.linkedin);
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
