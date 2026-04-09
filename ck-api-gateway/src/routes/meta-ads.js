/**
 * Meta Ads Routes — Facebook/Instagram Paid Amplification
 *
 * Routes:
 *   GET  /v1/meta-ads/status    — Connection status and configuration check
 *   POST /v1/meta-ads/boost     — Boost a high-engagement post
 *   GET  /v1/meta-ads/campaigns — List active ad campaigns
 *
 * Secrets required:
 *   META_PAGE_ACCESS_TOKEN  — Long-lived Page Access Token from Meta Business Suite
 *   META_AD_ACCOUNT_ID      — Ad account ID (format: act_XXXXXXXXX)
 *   META_PAGE_ID             — Facebook Page ID for post boosting
 */

import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

/**
 * GET /v1/meta-ads/status — Check Meta Ads connector health.
 */
export function handleMetaAdsStatus(env) {
  const token = env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID;
  const pageId = env.META_PAGE_ID;

  const configured = !!(token && adAccountId && pageId);
  const missing = [];
  if (!token) missing.push('META_PAGE_ACCESS_TOKEN');
  if (!adAccountId) missing.push('META_AD_ACCOUNT_ID');
  if (!pageId) missing.push('META_PAGE_ID');

  return jsonResponse({
    service: 'meta-ads',
    status: configured ? 'configured' : 'not_configured',
    configured,
    missing,
    capabilities: configured
      ? ['post_boost', 'campaign_create', 'campaign_list', 'audience_targeting']
      : [],
    setup_instructions: configured ? null : {
      step_1: 'Go to Meta Business Suite → Settings → Integrations → API',
      step_2: 'Generate a long-lived Page Access Token with ads_management and pages_read_engagement permissions',
      step_3: 'Set 3 Worker secrets via `wrangler secret put`: META_PAGE_ACCESS_TOKEN, META_AD_ACCOUNT_ID, META_PAGE_ID',
      step_4: 'Verify with GET /v1/meta-ads/status',
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /v1/meta-ads/boost — Boost a post for paid amplification.
 *
 * Request body:
 *   postId       (string, required) — Facebook post ID to boost
 *   budget       (number, required) — Daily budget in cents (e.g. 500 = $5.00)
 *   duration     (number, optional) — Campaign duration in days (default: 3)
 *   targeting    (object, optional) — Custom audience targeting
 */
export async function handleMetaAdsBoost(request, env, ctx) {
  const token = env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID;

  if (!token || !adAccountId) {
    return errorResponse('Meta Ads not configured. Set META_PAGE_ACCESS_TOKEN and META_AD_ACCOUNT_ID secrets.', 503);
  }

  const body = await request.json();

  if (!body.postId) {
    return errorResponse('"postId" is required.', 400);
  }
  if (!body.budget || typeof body.budget !== 'number' || body.budget < 100) {
    return errorResponse('"budget" is required and must be at least 100 cents ($1.00).', 400);
  }

  const duration = body.duration || 3;
  const endTime = Math.floor(Date.now() / 1000) + (duration * 86400);

  // Default targeting: Treasure Coast FL property owners 35-65
  const targeting = body.targeting || {
    geo_locations: {
      cities: [
        { key: '2421836', name: 'Stuart', region: 'Florida' },
        { key: '2428965', name: 'Port Saint Lucie', region: 'Florida' },
        { key: '2424731', name: 'Vero Beach', region: 'Florida' },
      ],
      location_types: ['home'],
    },
    age_min: 35,
    age_max: 65,
    interests: [
      { id: '6003020834693', name: 'Real estate' },
      { id: '6003384248805', name: 'Property management' },
    ],
  };

  try {
    // Create ad campaign via Meta Marketing API
    const campaignRes = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          name: `CK Boost — ${body.postId} — ${new Date().toISOString().split('T')[0]}`,
          objective: 'OUTCOME_ENGAGEMENT',
          status: 'PAUSED',
          special_ad_categories: ['HOUSING'],
        }),
      }
    );

    const campaign = await campaignRes.json();

    if (campaign.error) {
      writeAudit(env, ctx, {
        route: '/v1/meta-ads/boost',
        postId: body.postId,
        status: 'error',
        error: campaign.error.message,
      });
      return errorResponse(`Meta API error: ${campaign.error.message}`, 502);
    }

    // Create ad set with budget and targeting
    const adSetRes = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/adsets`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          campaign_id: campaign.id,
          name: `CK Boost AdSet — ${body.postId}`,
          daily_budget: body.budget,
          billing_event: 'IMPRESSIONS',
          optimization_goal: 'POST_ENGAGEMENT',
          targeting,
          end_time: endTime,
          status: 'PAUSED',
        }),
      }
    );

    const adSet = await adSetRes.json();

    if (adSet.error) {
      writeAudit(env, ctx, {
        route: '/v1/meta-ads/boost',
        postId: body.postId,
        campaignId: campaign.id,
        status: 'partial_error',
        error: adSet.error.message,
      });
      return errorResponse(`Meta API error creating ad set: ${adSet.error.message}`, 502);
    }

    // Create ad creative from existing post
    const adRes = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/ads`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          adset_id: adSet.id,
          name: `CK Boost Ad — ${body.postId}`,
          creative: { object_story_id: body.postId },
          status: 'PAUSED',
        }),
      }
    );

    const ad = await adRes.json();

    writeAudit(env, ctx, {
      route: '/v1/meta-ads/boost',
      postId: body.postId,
      campaignId: campaign.id,
      adSetId: adSet.id,
      adId: ad.id || null,
      budget: body.budget,
      duration,
      status: ad.error ? 'partial' : 'created',
    });

    return jsonResponse({
      status: ad.error ? 'partial' : 'created',
      message: ad.error
        ? `Campaign and ad set created but ad creation failed: ${ad.error.message}`
        : 'Boost campaign created in PAUSED state. Review in Meta Ads Manager to activate.',
      campaign_id: campaign.id,
      ad_set_id: adSet.id,
      ad_id: ad.id || null,
      budget_daily_cents: body.budget,
      duration_days: duration,
      targeting_summary: `Treasure Coast FL, ages ${targeting.age_min}-${targeting.age_max}`,
      activation: 'Set campaign status to ACTIVE in Meta Ads Manager or via PUT /v1/meta-ads/campaigns/:id/status',
    });
  } catch (err) {
    writeAudit(env, ctx, {
      route: '/v1/meta-ads/boost',
      postId: body.postId,
      status: 'error',
      error: err.message,
    });
    return errorResponse(`Meta Ads boost failed: ${err.message}`, 502);
  }
}

/**
 * GET /v1/meta-ads/campaigns — List active Meta ad campaigns.
 */
export async function handleMetaAdsCampaigns(env) {
  const token = env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID;

  if (!token || !adAccountId) {
    return errorResponse('Meta Ads not configured. Set META_PAGE_ACCESS_TOKEN and META_AD_ACCOUNT_ID secrets.', 503);
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${encodeURIComponent(token)}&limit=25`
    );

    const data = await res.json();

    if (data.error) {
      return errorResponse(`Meta API error: ${data.error.message}`, 502);
    }

    return jsonResponse({
      service: 'meta-ads',
      ad_account: adAccountId,
      campaigns: data.data || [],
      total: (data.data || []).length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return errorResponse(`Failed to fetch campaigns: ${err.message}`, 502);
  }
}
