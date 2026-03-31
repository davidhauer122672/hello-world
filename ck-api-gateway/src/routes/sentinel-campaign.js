/**
 * TH Sentinel Campaign Routes — Read-only access to campaign Airtable tables.
 *
 *   GET /v1/campaign/calls      — Recent calls from Call Log
 *   GET /v1/campaign/agents     — Agent performance records
 *   GET /v1/campaign/analytics  — Campaign analytics records
 *   GET /v1/campaign/contacts   — Lead contacts
 *   GET /v1/campaign/dashboard  — Combined campaign dashboard
 */

import { listRecords, TABLES } from '../services/airtable.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/campaign/calls ─────────────────────────────────────────────────

export async function handleCampaignCallLog(url, env) {
  try {
    const params = url.searchParams;
    const limitParam = parseInt(params.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, limitParam), 200);
    const agentId = params.get('agentId');
    const outcome = params.get('outcome');

    const options = { maxRecords: limit };

    // Build filter formula
    const filters = [];
    if (agentId) filters.push(`{Agent ID} = "${agentId}"`);
    if (outcome) filters.push(`{Outcome} = "${outcome}"`);

    if (filters.length === 1) {
      options.filterByFormula = filters[0];
    } else if (filters.length > 1) {
      options.filterByFormula = `AND(${filters.join(', ')})`;
    }

    const records = await listRecords(env, TABLES.TH_CALL_LOG, options);

    return jsonResponse({
      records,
      count: records.length,
    });
  } catch (err) {
    console.error('handleCampaignCallLog error:', err);
    return errorResponse(`Failed to fetch call log: ${err.message}`, 500);
  }
}

// ── GET /v1/campaign/agents ────────────────────────────────────────────────

export async function handleCampaignAgentPerformance(url, env) {
  try {
    const records = await listRecords(env, TABLES.TH_AGENT_PERFORMANCE, {
      maxRecords: 100,
    });

    return jsonResponse({
      records,
      count: records.length,
    });
  } catch (err) {
    console.error('handleCampaignAgentPerformance error:', err);
    return errorResponse(`Failed to fetch agent performance: ${err.message}`, 500);
  }
}

// ── GET /v1/campaign/analytics ─────────────────────────────────────────────

export async function handleCampaignAnalytics(url, env) {
  try {
    const params = url.searchParams;
    const week = params.get('week');

    const options = { maxRecords: 100 };

    if (week) {
      options.filterByFormula = `{Week} = "${week}"`;
    }

    const records = await listRecords(env, TABLES.TH_CAMPAIGN_ANALYTICS, options);

    return jsonResponse({
      records,
      count: records.length,
    });
  } catch (err) {
    console.error('handleCampaignAnalytics error:', err);
    return errorResponse(`Failed to fetch campaign analytics: ${err.message}`, 500);
  }
}

// ── GET /v1/campaign/contacts ──────────────────────────────────────────────

export async function handleCampaignLeadContacts(url, env) {
  try {
    const params = url.searchParams;
    const limitParam = parseInt(params.get('limit') || '50', 10);
    const limit = Math.min(Math.max(1, limitParam), 200);
    const status = params.get('status');
    const leadType = params.get('leadType');

    const options = { maxRecords: limit };

    const filters = [];
    if (status) filters.push(`{Status} = "${status}"`);
    if (leadType) filters.push(`{Lead Type} = "${leadType}"`);

    if (filters.length === 1) {
      options.filterByFormula = filters[0];
    } else if (filters.length > 1) {
      options.filterByFormula = `AND(${filters.join(', ')})`;
    }

    const records = await listRecords(env, TABLES.TH_LEAD_CONTACTS, options);

    return jsonResponse({
      records,
      count: records.length,
    });
  } catch (err) {
    console.error('handleCampaignLeadContacts error:', err);
    return errorResponse(`Failed to fetch lead contacts: ${err.message}`, 500);
  }
}

// ── GET /v1/campaign/dashboard ─────────────────────────────────────────────

export async function handleCampaignDashboard(env) {
  try {
    // Fetch all three data sources in parallel
    const [agentRecords, analyticsRecords, callRecords] = await Promise.all([
      listRecords(env, TABLES.TH_AGENT_PERFORMANCE, { maxRecords: 100 }),
      listRecords(env, TABLES.TH_CAMPAIGN_ANALYTICS, { maxRecords: 1, sort: 'Date' }),
      listRecords(env, TABLES.TH_CALL_LOG, { maxRecords: 200 }),
    ]);

    // Summarise agent performance metrics
    const agentSummary = {
      totalAgents: agentRecords.length,
      records: agentRecords,
    };

    // Latest analytics record
    const latestAnalytics = analyticsRecords.length > 0 ? analyticsRecords[0] : null;

    // Recent calls count
    const recentCallsCount = callRecords.length;

    return jsonResponse({
      agentPerformance: agentSummary,
      latestAnalytics,
      recentCallsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('handleCampaignDashboard error:', err);
    return errorResponse(`Failed to load campaign dashboard: ${err.message}`, 500);
  }
}
