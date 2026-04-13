/**
 * Meta Ads Routes — Coastal Key Meta Ads Integration
 *
 * Endpoints:
 *   GET  /v1/meta-ads/status  — Check Meta Ads connector health & token validity
 *   POST /v1/meta-ads/boost   — Boost a high-engagement post via Meta Ads Manager
 *
 * Secrets required:
 *   META_PAGE_ACCESS_TOKEN   — Facebook Page access token (long-lived)
 *   META_AD_ACCOUNT_ID       — Meta Ads account ID (act_XXXXXXX)
 *   META_PAGE_ID             — Facebook Page ID
 *
 * Prerequisites:
 *   Meta Ads Manager connector must be authorized via OAuth flow.
 *   See operational_execution_guide.md Directive 1 for restoration steps.
 */

import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

const META_GRAPH_API = 'https://graph.facebook.com/v19.0';

/**
 * GET /v1/meta-ads/status — Check connector health
 *
 * Validates that Meta secrets are configured and the access token
 * can successfully query the ad account. Returns diagnostic info
 * for troubleshooting broken connections.
 */
export async function handleMetaAdsStatus(request, env, ctx) {
  const diagnostics = {
    connector: 'meta-ads',
    timestamp: new Date().toISOString(),
    secrets: {
      META_PAGE_ACCESS_TOKEN: !!env.META_PAGE_ACCESS_TOKEN,
      META_AD_ACCOUNT_ID: !!env.META_AD_ACCOUNT_ID,
      META_PAGE_ID: !!env.META_PAGE_ID,
    },
    token_valid: false,
    ad_account: null,
    page: null,
    status: 'disconnected',
    restoration_steps: null,
  };

  // If no token configured, return restoration instructions
  if (!env.META_PAGE_ACCESS_TOKEN) {
    diagnostics.status = 'not_configured';
    diagnostics.restoration_steps = [
      '1. Navigate to Meta Business Suite: https://business.facebook.com/settings',
      '2. Go to Integrations → Connected Apps',
      '3. Locate or add the Coastal Key connector',
      '4. Click Configure under Manage',
      '5. Complete OAuth 2.0 flow granting ads_management, ads_read, pages_manage_posts, pages_read_engagement',
      '6. Copy the generated Page Access Token',
      '7. Set META_PAGE_ACCESS_TOKEN as a Cloudflare Worker secret: wrangler secret put META_PAGE_ACCESS_TOKEN',
      '8. Set META_AD_ACCOUNT_ID (format: act_XXXXXXX): wrangler secret put META_AD_ACCOUNT_ID',
      '9. Set META_PAGE_ID: wrangler secret put META_PAGE_ID',
    ];

    writeAudit(env, ctx, { route: '/v1/meta-ads/status', status: 'not_configured' });
    return jsonResponse(diagnostics);
  }

  // Validate token by querying ad account
  try {
    const adAccountRes = await fetch(
      `${META_GRAPH_API}/me/adaccounts?fields=id,name,account_status&access_token=${env.META_PAGE_ACCESS_TOKEN}`,
    );
    const adAccountData = await adAccountRes.json();

    if (adAccountData.error) {
      diagnostics.status = 'token_expired';
      diagnostics.error = adAccountData.error.message;
      diagnostics.restoration_steps = [
        'The access token has expired or been revoked.',
        '1. Re-authorize via Meta Business Suite OAuth flow',
        '2. Generate a new long-lived Page Access Token',
        '3. Update the Cloudflare Worker secret: wrangler secret put META_PAGE_ACCESS_TOKEN',
      ];
    } else {
      diagnostics.token_valid = true;
      diagnostics.ad_account = adAccountData.data?.[0] || null;
      diagnostics.status = 'connected';
    }
  } catch (err) {
    diagnostics.status = 'error';
    diagnostics.error = err.message;
  }

  // Check page access if token is valid
  if (diagnostics.token_valid && env.META_PAGE_ID) {
    try {
      const pageRes = await fetch(
        `${META_GRAPH_API}/${env.META_PAGE_ID}?fields=id,name,followers_count&access_token=${env.META_PAGE_ACCESS_TOKEN}`,
      );
      const pageData = await pageRes.json();

      if (!pageData.error) {
        diagnostics.page = {
          id: pageData.id,
          name: pageData.name,
          followers: pageData.followers_count,
        };
      }
    } catch (err) {
      diagnostics.page = { error: err.message };
    }
  }

  writeAudit(env, ctx, {
    route: '/v1/meta-ads/status',
    status: diagnostics.status,
    token_valid: diagnostics.token_valid,
  });

  return jsonResponse(diagnostics);
}

/**
 * POST /v1/meta-ads/boost — Boost a high-engagement post
 *
 * Creates a promoted post (boosted post) via the Meta Marketing API.
 * Used by the META_ADS_BOOST automation trigger when a published post
 * exceeds 3x the rolling engagement average.
 *
 * Request body:
 *   recordId       (string, required) — Content Calendar record ID
 *   platform       (string, required) — Platform (facebook or instagram)
 *   postUrl        (string, optional) — URL of the published post
 *   budget         (number, optional) — Daily budget in USD (default: 25)
 *   duration_days  (number, optional) — Campaign duration (default: 3)
 *   targeting      (object, optional) — Custom targeting overrides
 */
export async function handleMetaAdsBoost(request, env, ctx) {
  // Validate Meta Ads configuration
  if (!env.META_PAGE_ACCESS_TOKEN) {
    return errorResponse(
      'Meta Ads connector not configured. Complete OAuth re-authorization first. See GET /v1/meta-ads/status for instructions.',
      503,
    );
  }

  if (!env.META_AD_ACCOUNT_ID) {
    return errorResponse('META_AD_ACCOUNT_ID not configured.', 503);
  }

  const body = await request.json();

  if (!body.recordId) {
    return errorResponse('"recordId" is required.', 400);
  }

  if (!body.platform || !['facebook', 'instagram'].includes(body.platform.toLowerCase())) {
    return errorResponse('"platform" must be "facebook" or "instagram".', 400);
  }

  const dailyBudget = Math.min(body.budget || 25, 100); // Cap at $100/day
  const durationDays = Math.min(body.duration_days || 3, 7); // Cap at 7 days
  const totalBudget = dailyBudget * durationDays * 100; // Convert to cents

  // Default Treasure Coast targeting
  const targeting = body.targeting || {
    geo_locations: {
      cities: [
        { key: '2421836', name: 'Stuart', region: 'Florida' },
        { key: '2467204', name: 'Port St. Lucie', region: 'Florida' },
        { key: '2518948', name: 'Vero Beach', region: 'Florida' },
        { key: '2428164', name: 'Jupiter', region: 'Florida' },
        { key: '2513938', name: 'Palm City', region: 'Florida' },
      ],
    },
    age_min: 30,
    age_max: 65,
    interests: [
      { id: '6003139266461', name: 'Real estate investing' },
      { id: '6002964301661', name: 'Property management' },
      { id: '6003020834693', name: 'Luxury real estate' },
    ],
  };

  // Calculate campaign dates
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 1); // Start tomorrow
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);

  try {
    // Create ad campaign
    const campaignParams = new URLSearchParams({
      access_token: env.META_PAGE_ACCESS_TOKEN,
      name: `CK Auto-Boost: ${body.recordId.substring(0, 8)} — ${new Date().toISOString().split('T')[0]}`,
      objective: 'OUTCOME_ENGAGEMENT',
      status: 'PAUSED', // Start paused for safety — CEO activates
      special_ad_categories: '[]',
    });

    const campaignRes = await fetch(
      `${META_GRAPH_API}/${env.META_AD_ACCOUNT_ID}/campaigns`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: campaignParams.toString(),
      },
    );

    const campaignData = await campaignRes.json();

    if (campaignData.error) {
      writeAudit(env, ctx, {
        route: '/v1/meta-ads/boost',
        recordId: body.recordId,
        error: campaignData.error.message,
      });

      return errorResponse(`Meta Ads API error: ${campaignData.error.message}`, 502);
    }

    const result = {
      boost_created: true,
      campaign_id: campaignData.id,
      record_id: body.recordId,
      platform: body.platform,
      daily_budget_usd: dailyBudget,
      duration_days: durationDays,
      total_budget_usd: dailyBudget * durationDays,
      targeting_summary: {
        locations: targeting.geo_locations.cities.map(c => c.name).join(', '),
        age_range: `${targeting.age_min}-${targeting.age_max}`,
        interests: targeting.interests.map(i => i.name).join(', '),
      },
      status: 'PAUSED',
      note: 'Campaign created in PAUSED state. CEO must activate in Meta Ads Manager.',
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    };

    writeAudit(env, ctx, {
      route: '/v1/meta-ads/boost',
      recordId: body.recordId,
      campaignId: campaignData.id,
      budget: dailyBudget * durationDays,
      status: 'created_paused',
    });

    return jsonResponse(result);
  } catch (err) {
    writeAudit(env, ctx, {
      route: '/v1/meta-ads/boost',
      recordId: body.recordId,
      error: err.message,
    });

    return errorResponse(`Meta Ads boost failed: ${err.message}`, 500);
  }
}

/**
 * GET /v1/meta-ads/campaigns — List active Meta Ads campaigns
 */
export async function handleMetaAdsCampaigns(env) {
  const token = env.META_PAGE_ACCESS_TOKEN;
  const adAccountId = env.META_AD_ACCOUNT_ID;

  if (!token || !adAccountId) {
    return errorResponse('Meta Ads not configured. Set META_PAGE_ACCESS_TOKEN and META_AD_ACCOUNT_ID secrets.', 503);
  }

  try {
    const res = await fetch(
      `${META_GRAPH_API}/${adAccountId}/campaigns?fields=id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time&access_token=${encodeURIComponent(token)}&limit=25`
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
