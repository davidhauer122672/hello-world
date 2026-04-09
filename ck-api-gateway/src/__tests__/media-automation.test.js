/**
 * Media Automation Pipeline — Integration Tests
 *
 * Validates the WF-2 content publish pipeline, Meta Ads connector status,
 * and automation trigger configurations for the media automation engine.
 *
 * Run: node --test ck-api-gateway/src/__tests__/media-automation.test.js
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── Import automation triggers ──
import {
  WF2_CONTENT_PUBLISH,
  META_ADS_BOOST,
  WF3_INVESTOR_ESCALATION,
  WF4_LONG_TAIL_NURTURE,
  SCAA1_BATTLE_PLAN,
  SLACK_CHANNELS,
} from '../automations/triggers.js';

// ── Import content publish handler ──
import { handleContentPublish } from '../routes/content-publish.js';

// ── Import Meta Ads handlers ──
import { handleMetaAdsStatus, handleMetaAdsBoost } from '../routes/meta-ads.js';

// ─────────────────────────────────────────────────────────────────
// WF-2 Automation Trigger Configuration Tests
// ─────────────────────────────────────────────────────────────────

describe('WF-2 Content Publish Trigger Config', () => {
  it('should have correct trigger ID', () => {
    assert.equal(WF2_CONTENT_PUBLISH.id, 'wf2-content-publish');
  });

  it('should trigger on Content Calendar Status field change', () => {
    assert.equal(WF2_CONTENT_PUBLISH.trigger.type, 'fieldChange');
    assert.equal(WF2_CONTENT_PUBLISH.trigger.table, 'Content Calendar');
    assert.equal(WF2_CONTENT_PUBLISH.trigger.field, 'Status');
  });

  it('should require Status = Approved', () => {
    assert.equal(WF2_CONTENT_PUBLISH.conditions.status.equals, 'Approved');
  });

  it('should POST to /v1/content/publish', () => {
    assert.equal(WF2_CONTENT_PUBLISH.action.method, 'POST');
    assert.equal(WF2_CONTENT_PUBLISH.action.endpoint, '/v1/content/publish');
  });

  it('should include recordId in payload', () => {
    assert.ok(WF2_CONTENT_PUBLISH.action.payload.recordId);
  });

  it('should require Caption and Platform fields', () => {
    assert.deepEqual(WF2_CONTENT_PUBLISH.conditions.requiredFields, ['Caption', 'Platform']);
  });

  it('should target all 4 social platforms', () => {
    assert.deepEqual(WF2_CONTENT_PUBLISH.platforms, ['instagram', 'facebook', 'linkedin', 'x']);
  });

  it('should reference correct Airtable table ID', () => {
    assert.equal(WF2_CONTENT_PUBLISH.airtable_table_id, 'tblEPr4f2lMz6ruxF');
  });

  it('should have Airtable setup instructions', () => {
    assert.ok(Array.isArray(WF2_CONTENT_PUBLISH.airtable_setup_instructions));
    assert.ok(WF2_CONTENT_PUBLISH.airtable_setup_instructions.length >= 10);
  });

  it('should have manual fallback mode', () => {
    assert.equal(WF2_CONTENT_PUBLISH.fallback.mode, 'manual');
  });

  it('should notify #marketing-ops Slack channel', () => {
    assert.equal(WF2_CONTENT_PUBLISH.slack_channel, '#marketing-ops');
  });
});

// ─────────────────────────────────────────────────────────────────
// Meta Ads Boost Trigger Configuration Tests
// ─────────────────────────────────────────────────────────────────

describe('Meta Ads Boost Trigger Config', () => {
  it('should have correct trigger ID', () => {
    assert.equal(META_ADS_BOOST.id, 'meta-ads-boost');
  });

  it('should trigger on Engagement Rate field change', () => {
    assert.equal(META_ADS_BOOST.trigger.type, 'fieldChange');
    assert.equal(META_ADS_BOOST.trigger.table, 'Content Calendar');
    assert.equal(META_ADS_BOOST.trigger.field, 'Engagement Rate');
  });

  it('should require post Status = Published', () => {
    assert.equal(META_ADS_BOOST.conditions.status.equals, 'Published');
  });

  it('should use 3x engagement threshold', () => {
    assert.equal(META_ADS_BOOST.conditions.engagementThreshold.multiplier, 3);
  });

  it('should POST to /v1/meta-ads/boost', () => {
    assert.equal(META_ADS_BOOST.action.method, 'POST');
    assert.equal(META_ADS_BOOST.action.endpoint, '/v1/meta-ads/boost');
  });

  it('should have budget constraints', () => {
    assert.equal(META_ADS_BOOST.budget.default_daily, 25);
    assert.equal(META_ADS_BOOST.budget.max_daily, 100);
    assert.equal(META_ADS_BOOST.budget.duration_days, 3);
    assert.equal(META_ADS_BOOST.budget.currency, 'USD');
  });

  it('should document Meta Ads prerequisites', () => {
    assert.ok(META_ADS_BOOST.prerequisites.metaAdsConnector);
    assert.ok(META_ADS_BOOST.prerequisites.adAccountId);
    assert.ok(META_ADS_BOOST.prerequisites.pageAccessToken);
  });
});

// ─────────────────────────────────────────────────────────────────
// Content Publish Route — Input Validation Tests
// ─────────────────────────────────────────────────────────────────

describe('Content Publish Route — handleContentPublish', () => {
  const mockEnv = {
    AIRTABLE_API_KEY: 'test_key',
    AIRTABLE_BASE_ID: 'appUSnNgpDkcEOzhN',
    RATE_LIMITS: { get: async () => null, put: async () => {} },
    AUDIT_LOG: { put: async () => {} },
  };

  const mockCtx = {
    waitUntil: (promise) => promise.catch(() => {}),
  };

  it('should reject request without recordId', async () => {
    const request = new Request('https://test.dev/v1/content/publish', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await handleContentPublish(request, mockEnv, mockCtx);
    assert.equal(response.status, 400);

    const body = await response.json();
    assert.ok(body.error.includes('recordId'));
  });
});

// ─────────────────────────────────────────────────────────────────
// Meta Ads Status Route — Input Validation Tests
// ─────────────────────────────────────────────────────────────────

describe('Meta Ads Status Route — handleMetaAdsStatus', () => {
  it('should return not_configured when no token set', async () => {
    const request = new Request('https://test.dev/v1/meta-ads/status', {
      method: 'GET',
    });

    const env = {
      AUDIT_LOG: { put: async () => {} },
    };
    const ctx = { waitUntil: (p) => p.catch(() => {}) };

    const response = await handleMetaAdsStatus(request, env, ctx);
    assert.equal(response.status, 200);

    const body = await response.json();
    assert.equal(body.status, 'not_configured');
    assert.equal(body.secrets.META_PAGE_ACCESS_TOKEN, false);
    assert.ok(Array.isArray(body.restoration_steps));
    assert.ok(body.restoration_steps.length > 0);
  });
});

describe('Meta Ads Boost Route — handleMetaAdsBoost', () => {
  const mockCtx = { waitUntil: (p) => p.catch(() => {}) };

  it('should return 503 when Meta Ads not configured', async () => {
    const request = new Request('https://test.dev/v1/meta-ads/boost', {
      method: 'POST',
      body: JSON.stringify({ recordId: 'rec123', platform: 'facebook' }),
    });

    const env = { AUDIT_LOG: { put: async () => {} } };
    const response = await handleMetaAdsBoost(request, env, mockCtx);
    assert.equal(response.status, 503);
  });

  it('should require recordId', async () => {
    const request = new Request('https://test.dev/v1/meta-ads/boost', {
      method: 'POST',
      body: JSON.stringify({ platform: 'facebook' }),
    });

    const env = {
      META_PAGE_ACCESS_TOKEN: 'test',
      META_AD_ACCOUNT_ID: 'act_123',
      AUDIT_LOG: { put: async () => {} },
    };

    const response = await handleMetaAdsBoost(request, env, mockCtx);
    assert.equal(response.status, 400);
  });

  it('should validate platform is facebook or instagram', async () => {
    const request = new Request('https://test.dev/v1/meta-ads/boost', {
      method: 'POST',
      body: JSON.stringify({ recordId: 'rec123', platform: 'tiktok' }),
    });

    const env = {
      META_PAGE_ACCESS_TOKEN: 'test',
      META_AD_ACCOUNT_ID: 'act_123',
      AUDIT_LOG: { put: async () => {} },
    };

    const response = await handleMetaAdsBoost(request, env, mockCtx);
    assert.equal(response.status, 400);
  });
});

// ─────────────────────────────────────────────────────────────────
// Existing Triggers — Regression Tests
// ─────────────────────────────────────────────────────────────────

describe('Existing Automation Triggers — Regression', () => {
  it('WF3 Investor Escalation should be unchanged', () => {
    assert.equal(WF3_INVESTOR_ESCALATION.id, 'wf3-investor-escalation');
    assert.equal(WF3_INVESTOR_ESCALATION.trigger.table, 'Leads');
    assert.equal(WF3_INVESTOR_ESCALATION.action.endpoint, '/v1/workflows/wf3');
  });

  it('WF4 Long Tail Nurture should be unchanged', () => {
    assert.equal(WF4_LONG_TAIL_NURTURE.id, 'wf4-long-tail-nurture');
    assert.equal(WF4_LONG_TAIL_NURTURE.trigger.table, 'Leads');
    assert.equal(WF4_LONG_TAIL_NURTURE.action.endpoint, '/v1/workflows/wf4');
  });

  it('SCAA1 Battle Plan should be unchanged', () => {
    assert.equal(SCAA1_BATTLE_PLAN.id, 'scaa1-battle-plan');
    assert.equal(SCAA1_BATTLE_PLAN.trigger.table, 'Leads');
    assert.equal(SCAA1_BATTLE_PLAN.action.endpoint, '/v1/workflows/scaa1');
  });

  it('Slack channels should be defined', () => {
    assert.ok(SLACK_CHANNELS.SALES_ALERTS);
    assert.ok(SLACK_CHANNELS.OPS_ALERTS);
    assert.ok(SLACK_CHANNELS.INVESTOR_ESCALATIONS);
    assert.ok(SLACK_CHANNELS.GENERAL);
  });
});
