/**
 * Upgrade Routes — Systems Upgrade Agent fleet operations.
 *
 *   GET  /v1/upgrade/sprint          — Sprint dashboard with daily milestones
 *   GET  /v1/upgrade/agents          — List all 20 UPG agents
 *   GET  /v1/upgrade/agents/:id      — Get single UPG agent
 *   POST /v1/upgrade/execute         — Execute an integration upgrade action
 *   POST /v1/upgrade/publish         — Cross-platform publish from Content Calendar
 *   POST /v1/upgrade/content         — Auto-generate content for platform gaps
 *   POST /v1/upgrade/enroll          — Enroll contact in Constant Contact sequence
 *   GET  /v1/upgrade/integrations    — Integration status for all 10+ platforms
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 * Badge: Enterprise Full Access — Systems Upgrade Authority
 */

import { UPG_AGENTS } from '../agents/agents-upg.js';
import { executeUpgrade, getSprintDashboard } from '../services/upgrade-engine.js';
import {
  bufferPublish,
  twitterPost,
  constantContactEnroll,
  autoGenerateContent,
  crossPlatformPublish,
  sendDelegationSlack,
} from '../services/integrations.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── GET /v1/upgrade/sprint ──

export function handleUpgradeSprint() {
  const dashboard = getSprintDashboard();
  return jsonResponse({
    division: 'UPG',
    divisionName: 'Systems Upgrade',
    badgeClearance: 'Enterprise Full Access — Systems Upgrade Authority',
    ...dashboard,
    agents: UPG_AGENTS.map(a => ({
      id: a.id,
      name: a.name,
      role: a.role,
      status: a.status,
      sprintDay: a.sprintDay,
      integration: a.integration || null,
    })),
    timestamp: new Date().toISOString(),
  });
}

// ── GET /v1/upgrade/agents ──

export function handleListUpgradeAgents(url) {
  let agents = UPG_AGENTS;

  const status = url.searchParams.get('status');
  if (status) agents = agents.filter(a => a.status === status);

  const day = url.searchParams.get('day');
  if (day) agents = agents.filter(a => a.sprintDay === `Day ${day}` || a.sprintDay === 'All');

  const integration = url.searchParams.get('integration');
  if (integration) agents = agents.filter(a => a.integration && a.integration.toLowerCase().includes(integration.toLowerCase()));

  return jsonResponse({
    division: 'UPG',
    badgeClearance: 'Enterprise Full Access — Systems Upgrade Authority',
    count: agents.length,
    agents,
  });
}

// ── GET /v1/upgrade/agents/:id ──

export function handleGetUpgradeAgent(agentId) {
  const agent = UPG_AGENTS.find(a => a.id === agentId);
  if (!agent) {
    return errorResponse(`Upgrade agent "${agentId}" not found. Valid: UPG-001 through UPG-020.`, 404);
  }
  return jsonResponse({ ...agent, badgeClearance: 'Enterprise Full Access — Systems Upgrade Authority' });
}

// ── POST /v1/upgrade/execute ──

export async function handleUpgradeExecute(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.agentId || !body.action) {
    return errorResponse('"agentId" and "action" are required.', 400);
  }

  const validActions = [
    'buffer_publish', 'twitter_post', 'constant_contact_enroll',
    'auto_generate_content', 'cross_platform_publish',
    'content_scan', 'gap_alert', 'pipeline_tracker', 'empty_cleanup',
  ];

  if (!validActions.includes(body.action)) {
    return errorResponse(`Invalid action. Valid: ${validActions.join(', ')}`, 400);
  }

  try {
    const result = await executeUpgrade(env, ctx, {
      agentId: body.agentId,
      action: body.action,
      params: body.params || {},
    });

    writeAudit(env, ctx, {
      route: '/v1/upgrade/execute',
      action: body.action,
      agentId: body.agentId,
      status: result.result?.error ? 'error' : 'success',
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Upgrade execution failed: ${err.message}`, 502);
  }
}

// ── POST /v1/upgrade/publish ──

export async function handleUpgradePublish(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.platforms || !Array.isArray(body.platforms)) {
    return errorResponse('"platforms" array is required (e.g. ["twitter","instagram","linkedin"]).', 400);
  }

  try {
    const result = await crossPlatformPublish(env, ctx, {
      contentRecordId: body.contentRecordId || null,
      platforms: body.platforms,
    });

    writeAudit(env, ctx, {
      route: '/v1/upgrade/publish',
      action: 'cross_platform_publish',
      platforms: body.platforms.join(','),
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Publish failed: ${err.message}`, 502);
  }
}

// ── POST /v1/upgrade/content ──

export async function handleUpgradeContent(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.platform || !body.brief) {
    return errorResponse('"platform" and "brief" are required.', 400);
  }

  try {
    const result = await autoGenerateContent(env, ctx, {
      platform: body.platform,
      pillar: body.pillar || 'Brand',
      postType: body.postType || 'Text Post',
      brief: body.brief,
    });

    writeAudit(env, ctx, {
      route: '/v1/upgrade/content',
      action: 'auto_generate_content',
      platform: body.platform,
      recordId: result.airtableRecordId,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Content generation failed: ${err.message}`, 502);
  }
}

// ── POST /v1/upgrade/enroll ──

export async function handleUpgradeEnroll(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  if (!body.email) {
    return errorResponse('"email" is required.', 400);
  }

  try {
    const result = await constantContactEnroll(env, {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      listName: body.listName,
      tags: body.tags,
    });

    sendDelegationSlack(env, ctx, {
      agentId: 'UPG-004',
      agentName: 'Nurture Engine',
      action: 'Constant Contact Enrollment',
      details: `${body.email} enrolled in ${body.listName || 'Sentinel Long-Tail Nurture'}`,
      priority: 'Medium',
    });

    writeAudit(env, ctx, {
      route: '/v1/upgrade/enroll',
      action: 'constant_contact_enroll',
      email: body.email,
    });

    return jsonResponse(result);
  } catch (err) {
    return errorResponse(`Enrollment failed: ${err.message}`, 502);
  }
}

// ── GET /v1/upgrade/integrations ──

export function handleUpgradeIntegrations(env) {
  return jsonResponse({
    integrations: [
      {
        name: 'Buffer API',
        agent: 'UPG-002',
        status: env.BUFFER_ACCESS_TOKEN ? 'live' : 'ready — set BUFFER_ACCESS_TOKEN',
        endpoints: ['POST /v1/upgrade/publish'],
        capabilities: ['Cross-platform publish', 'Schedule posts', 'Profile management'],
      },
      {
        name: 'Twitter/X API v2',
        agent: 'UPG-003',
        status: env.TWITTER_BEARER_TOKEN ? 'live' : 'ready — set TWITTER_BEARER_TOKEN',
        endpoints: ['POST /v1/upgrade/execute (action: twitter_post)'],
        capabilities: ['Tweet posting', 'Thread creation', 'Engagement tracking'],
      },
      {
        name: 'Constant Contact',
        agent: 'UPG-004',
        status: env.CONSTANT_CONTACT_API_KEY ? 'live' : 'ready — set CONSTANT_CONTACT_API_KEY',
        endpoints: ['POST /v1/upgrade/enroll'],
        capabilities: ['Contact enrollment', 'List management', 'Drip sequences'],
      },
      {
        name: 'Google Calendar',
        agent: 'UPG-005',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: calendar_event)'],
        capabilities: ['Event creation', 'Availability check', 'Meeting scheduling'],
      },
      {
        name: 'Gmail',
        agent: 'UPG-006',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: gmail_draft)'],
        capabilities: ['Draft creation', 'Investor emails', 'Template management'],
      },
      {
        name: 'Canva',
        agent: 'UPG-007',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: canva_design)'],
        capabilities: ['Design generation', 'Brand kit application', 'Export to publish'],
      },
      {
        name: 'Gamma',
        agent: 'UPG-008',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: gamma_deck)'],
        capabilities: ['Presentation generation', 'Investor decks', 'Board reports'],
      },
      {
        name: 'Zapier Tables',
        agent: 'UPG-009',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: zapier_sync)'],
        capabilities: ['Cross-platform task tracking', 'Status sync', 'Workflow bridging'],
      },
      {
        name: 'Google Sheets',
        agent: 'UPG-010',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: sheets_update)'],
        capabilities: ['Financial dashboards', 'Revenue tracking', 'Portfolio analysis'],
      },
      {
        name: 'Manus AI',
        agent: 'UPG-011',
        status: 'deployed — MCP relay active',
        endpoints: ['POST /v1/upgrade/execute (action: manus_task)'],
        capabilities: ['Complex multi-step tasks', 'Extended research', 'Chain delegation'],
      },
      {
        name: 'Slack #delegation-ops',
        agent: 'UPG-012',
        status: env.SLACK_WEBHOOK_URL ? 'live' : 'ready — set SLACK_WEBHOOK_URL',
        endpoints: ['All delegation/upgrade actions auto-notify'],
        capabilities: ['Real-time alerts', 'Dispatch notifications', 'Escalation routing'],
      },
      {
        name: 'Cloudflare Cron Triggers',
        agent: 'UPG-013',
        status: 'deployed',
        endpoints: ['Cron: */60 * * * * (hourly)'],
        capabilities: ['DEL-002 content scan 6PM ET', 'Gap alerts daily', 'Pipeline tracker Wed/Fri', 'Cleanup Sunday'],
      },
      {
        name: 'Content Auto-Generation',
        agent: 'UPG-015',
        status: 'live',
        endpoints: ['POST /v1/upgrade/content'],
        capabilities: ['Gap remediation', 'Platform activation', 'Pillar rebalancing'],
      },
    ],
    timestamp: new Date().toISOString(),
  });
}
