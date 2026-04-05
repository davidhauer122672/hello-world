/**
 * CK API Gateway — Coastal Key Central Inference Router
 *
 * Routes:
 *   POST /v1/inference          — Claude inference with KV caching + audit logging
 *   POST /v1/leads              — Create lead in Airtable Leads table
 *   POST /v1/leads/public       — Public website contact form → Lead (no auth)
 *   POST /v1/leads/enrich       — AI-enrich an existing lead (battle plan, segment analysis)
 *   GET  /v1/leads/:id          — Fetch lead by record ID
 *   POST /v1/webhook/retell     — Retell call_analyzed → Lead + Slack
 *   POST /v1/content/generate   — Generate content (social, email, script, youtube_*) via Claude
 *   GET  /v1/agents             — List/search agents with filtering
 *   GET  /v1/agents/metrics     — Aggregate agent metrics
 *   GET  /v1/agents/:id         — Get single agent details
 *   POST /v1/agents/:id/action  — Execute agent action (activate/pause/restart/train)
 *   GET  /v1/dashboard          — Combined dashboard data
 *   POST /v1/workflows/scaa1   — SCAA-1 Battle Plan Pipeline
 *   POST /v1/workflows/wf3     — WF-3 Investor Escalation
 *   POST /v1/workflows/wf4     — WF-4 Long-Tail Nurture
 *   POST /v1/pricing/recommend   — Dynamic pricing recommendation
 *   GET  /v1/pricing/zones      — Zone-level pricing benchmarks
 *   GET  /v1/health             — Health check
 *   GET  /v1/property-intel/search — Search ArcGIS for Saint Lucie commercial parcels
 *   POST /v1/property-intel/import — Fetch + import parcels to Airtable
 *   GET  /v1/property-intel/stats  — Property Intelligence summary stats
 *   GET  /v1/audit              — Retrieve recent audit log entries
 *   GET  /v1/campaign/calls     — TH Sentinel campaign call log
 *   GET  /v1/campaign/agents    — TH Sentinel agent performance
 *   GET  /v1/campaign/analytics — TH Sentinel campaign analytics
 *   GET  /v1/campaign/contacts  — TH Sentinel lead contacts
 *   GET  /v1/campaign/dashboard — TH Sentinel combined campaign dashboard
 *   GET  /v1/intel/officers    — List all 50 Intelligence Officers
 *   GET  /v1/intel/officers/:id — Get single Intelligence Officer
 *   POST /v1/intel/officers/:id/scan — Trigger officer scan
 *   GET  /v1/intel/dashboard   — Intelligence Officer fleet dashboard
 *   POST /v1/intel/fleet-scan  — Scan all critical-severity officers
 *   GET  /v1/email/agents      — List all 20 email agents
 *   GET  /v1/email/agents/:id  — Get single email agent
 *   POST /v1/email/compose     — AI-compose email via Claude
 *   POST /v1/email/classify    — Classify/score inbound email
 *   GET  /v1/email/dashboard   — Email operations dashboard
 *   GET  /v1/mcco/command        — MCCO Sovereign command dashboard
 *   GET  /v1/mcco/agents         — List all 15 MCCO agents
 *   GET  /v1/mcco/agents/:id     — Get single MCCO agent
 *   POST /v1/mcco/directive      — Issue sovereign directive to MKT/SEN
 *   GET  /v1/mcco/fleet-status   — Fleet inspection across governed divisions
 *   POST /v1/mcco/content-calendar — Generate 30-day content calendar
 *   POST /v1/mcco/audience-profile — Generate audience psychology profile
 *   POST /v1/mcco/positioning    — Generate authority positioning strategy
 *   POST /v1/mcco/monetization   — Generate audience monetization plan
 *   POST /v1/mcco/post           — Generate high-engagement social media post
 *   GET  /v1/atlas/campaigns              — List Atlas AI campaigns (youratlas.com)
 *   GET  /v1/atlas/campaigns/:id          — Get single Atlas campaign
 *   PUT  /v1/atlas/campaigns/:id/status   — Set campaign status
 *   GET  /v1/atlas/statistics              — Overview stats across campaigns
 *   GET  /v1/atlas/campaigns/:id/stats    — Stats for specific campaign
 *   GET  /v1/atlas/campaigns/:id/calls    — Call records for campaign
 *   GET  /v1/atlas/campaigns/:id/calls/:callId — Single call record detail
 *   POST /v1/atlas/campaigns/:id/schedule — Schedule a new call
 *   GET  /v1/atlas/campaigns/:id/bookings — Bookings for campaign
 *   GET  /v1/atlas/kb/files               — List knowledge base files
 *   POST /v1/atlas/speed-to-lead          — Trigger speed-to-lead call
 *   POST /v1/atlas/campaigns              — Create a new Atlas campaign
 *   GET  /v1/atlas/audit                  — Audit required CKPM campaigns
 *   GET  /v1/atlas/health                 — Atlas AI connectivity check
 *   GET  /v1/frameworks                   — List all Peak Performance Frameworks
 *   GET  /v1/frameworks/category/:cat     — Get frameworks by category
 *   GET  /v1/frameworks/:id               — Get single framework
 *   POST /v1/frameworks/apply             — AI-apply framework to business scenario
 *   POST /v1/frameworks/content           — Generate content using framework principles
 *   POST /v1/frameworks/sales-playbook    — Generate sales playbook from framework rules
 *   POST /v1/frameworks/productivity-plan — Generate agent/team productivity plan
 *   GET  /v1/financial/models            — Revenue models, expense categories, benchmarks
 *   POST /v1/financial/management-fee    — Calculate management fee
 *   POST /v1/financial/rent-estimate     — Estimate optimal rent for property
 *   POST /v1/financial/roi              — Analyze property ROI (cap rate, cash-on-cash, IRR)
 *   POST /v1/financial/forecast         — Generate 12-month financial forecast
 *   POST /v1/financial/pricing-strategy — Dynamic pricing strategy for zone
 *   POST /v1/financial/budget           — Generate annual property budget
 *   POST /v1/analysis/agent             — Analyze agent performance
 *   POST /v1/analysis/fleet             — Generate fleet analytics
 *   POST /v1/analysis/market-trends     — Analyze market trends by zone
 *   POST /v1/analysis/competitive-intel — Generate competitive intelligence
 *   POST /v1/analysis/lead-pipeline     — Analyze lead pipeline health
 *   POST /v1/analysis/operational-report — Generate division operational report
 *   GET  /v1/analysis/templates         — List analysis report templates
 *   POST /v1/analysis/property-health   — Score property health
 *   POST /v1/analysis/churn-prediction  — Predict tenant churn
 *   GET  /v1/deals/stages               — Deal pipeline stages & scoring weights
 *   POST /v1/deals/score                — Score a potential deal
 *   POST /v1/deals/strategy             — Generate deal strategy
 *   POST /v1/deals/comparables          — Analyze comparable properties
 *   POST /v1/deals/closing-costs        — Calculate FL closing costs
 *   POST /v1/deals/investor-package     — Generate investor package
 *   POST /v1/deals/portfolio            — Evaluate property portfolio
 *   GET  /v1/hierarchy/command-chain     — Full org command chain & escalation matrix
 *   GET  /v1/hierarchy/fleet-status      — 382-agent fleet status summary
 *   GET  /v1/hierarchy/chain/:agentId    — Chain of command for specific agent
 *   GET  /v1/hierarchy/reports/:agentId  — Direct reports for specific agent
 *   GET  /v1/hierarchy/division/:code    — Division hierarchy tree
 *   GET  /v1/trader/dashboard            — AI Trader market overview + signals + capital calls
 *   GET  /v1/trader/agent                — AI Trader Agent details
 *   GET  /v1/trader/watchlist            — All watchlist categories and symbols
 *   POST /v1/trader/quote                — Get live quote(s) for symbol(s)
 *   POST /v1/trader/signal               — Generate trading signal for symbol
 *   POST /v1/trader/capital-call         — Generate capital call prompt
 *   POST /v1/trader/portfolio            — Calculate portfolio metrics
 *   GET  /v1/trader/news                 — Market news with sentiment
 *   POST /v1/trader/trade                — Log a trade execution
 *   GET  /v1/trader/history              — Trade execution history
 *   GET  /v1/trader/capital-tiers        — Capital investment tier definitions
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret
 */

import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { handleInference } from './routes/inference.js';
import { handleCreateLead, handleGetLead, handleEnrichLead, handlePublicLead } from './routes/leads.js';
import { handleRetellWebhook } from './routes/retell.js';
import { handleContentGenerate } from './routes/content.js';
import { handleAuditLog } from './routes/audit.js';
import { handleListAgents, handleGetAgent, handleAgentAction, handleAgentMetrics, handleDashboard } from './routes/agents.js';
import { handleScaa1BattlePlan, handleWf3InvestorEscalation, handleWf4LongTailNurture } from './routes/workflows.js';
import { handlePropertySearch, handlePropertyImport, handlePropertyStats } from './routes/property-intel.js';
import { handleCampaignCallLog, handleCampaignAgentPerformance, handleCampaignAnalytics, handleCampaignLeadContacts, handleCampaignDashboard } from './routes/sentinel-campaign.js';
import { handlePricingRecommend, handlePricingZones } from './routes/pricing.js';
import { handleListOfficers, handleGetOfficer, handleOfficerScan, handleOfficerDashboard, handleFleetScan } from './routes/intelligence-officers.js';
import { handleListEmailAgents, handleGetEmailAgent, handleEmailCompose, handleEmailClassify, handleEmailDashboard } from './routes/email-agents.js';
import { handleListMCCOAgents, handleGetMCCOAgent, handleMCCOCommand, handleMCCOFleetStatus, handleMCCODirective, handleMCCOContentCalendar, handleMCCOAudienceProfile, handleMCCOPositioning, handleMCCOMonetization, handleMCCOPost } from './routes/mcco.js';
import { handleListFrameworks, handleGetFramework, handleGetFrameworksByCategory, handleFrameworkApply, handleFrameworkContent, handleFrameworkSalesPlaybook, handleFrameworkProductivityPlan } from './routes/frameworks.js';
import {
  handleTraderDashboard, handleTraderAgent, handleWatchlist, handleQuote, handleSignal,
  handleCapitalCall, handlePortfolio as handleTraderPortfolio, handleTraderNews,
  handleLogTrade, handleTradeHistory, handleCapitalTiers,
} from './routes/trader.js';
import {
  handleFinancialModels, handleManagementFee, handleRentEstimate, handlePropertyROI,
  handleFinancialForecast, handleDynamicPricing, handleBudget,
  handleAgentAnalysis, handleFleetAnalytics, handleMarketTrends, handleCompetitiveIntel,
  handleLeadPipeline, handleOperationalReport, handleAnalysisTemplates, handlePropertyHealth, handleChurnPrediction,
  handleDealStages, handleScoreDeal, handleDealStrategy, handleComparables, handleClosingCosts, handleInvestorPackage, handlePortfolioEvaluation,
  handleCommandChain, handleFleetStatusEndpoint, handleChainOfCommand, handleDirectReports, handleDivisionHierarchyEndpoint,
} from './routes/engines.js';
import { handleAtlasCampaigns, handleAtlasCampaignById, handleAtlasCampaignStatus, handleAtlasOverviewStats, handleAtlasCampaignStatsById, handleAtlasCallRecords, handleAtlasCallRecordDetail, handleAtlasScheduleCall, handleAtlasCampaignBookings, handleAtlasKBFiles, handleAtlasSpeedToLead, handleAtlasCreateCampaign, handleAtlasSetupRevival, handleAtlasAudit, handleAtlasHealth } from './routes/atlas.js';
import { jsonResponse, errorResponse, corsHeaders } from './utils/response.js';

export default {
  async fetch(request, env, ctx) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── Health (no auth) ──
    if (path === '/v1/health' && method === 'GET') {
      const deep = url.searchParams.get('deep') === 'true';

      if (!deep) {
        return jsonResponse({
          status: 'operational',
          service: 'ck-api-gateway',
          version: '2.0.0',
          agents: 382,
          divisions: 10,
          timestamp: new Date().toISOString(),
        });
      }

      // Deep health check — verify external dependencies
      const checks = {};

      // Airtable connectivity
      try {
        const atRes = await fetch(
          `https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/tblpNasm0AxreRqLW?maxRecords=1&fields%5B%5D=Lead%20Name`,
          { headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` } },
        );
        checks.airtable = { status: atRes.ok ? 'ok' : 'error', code: atRes.status };
      } catch (err) {
        checks.airtable = { status: 'error', message: err.message };
      }

      // Anthropic connectivity
      try {
        const anRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-6',
            max_tokens: 5,
            messages: [{ role: 'user', content: 'ping' }],
          }),
        });
        checks.anthropic = { status: anRes.ok ? 'ok' : 'error', code: anRes.status };
      } catch (err) {
        checks.anthropic = { status: 'error', message: err.message };
      }

      // Atlas AI (youratlas.com) connectivity
      if (env.ATLAS_API_KEY) {
        try {
          const { listCampaigns } = await import('./services/atlas.js');
          const campaigns = await listCampaigns(env);
          const count = Array.isArray(campaigns) ? campaigns.length : (campaigns?.data?.length || 0);
          checks.atlas = { status: 'ok', platform: 'youratlas.com', campaigns: count };
        } catch (err) {
          checks.atlas = { status: 'error', platform: 'youratlas.com', message: err.message };
        }
      } else {
        checks.atlas = { status: 'not_configured', platform: 'youratlas.com' };
      }

      // KV stores
      checks.kv = {
        cache: env.CACHE ? 'available' : 'missing',
        sessions: env.SESSIONS ? 'available' : 'missing',
        rateLimits: env.RATE_LIMITS ? 'available' : 'missing',
        auditLog: env.AUDIT_LOG ? 'available' : 'missing',
      };

      const allOk = checks.airtable?.status === 'ok' &&
                     checks.anthropic?.status === 'ok' &&
                     checks.kv.cache === 'available';

      return jsonResponse({
        status: allOk ? 'operational' : 'degraded',
        service: 'ck-api-gateway',
        version: '2.0.0',
        agents: 312,
        divisions: 10,
        checks,
        timestamp: new Date().toISOString(),
      });
    }

    // ── Public routes (no auth) ──
    if (path === '/v1/leads/public' && method === 'POST') {
      return await handlePublicLead(request, env, ctx);
    }

    // ── Auth gate ──
    const authError = authenticate(request, env);
    if (authError) return authError;

    // ── Rate limit ──
    const rateLimitError = await rateLimit(request, env);
    if (rateLimitError) return rateLimitError;

    try {
      // ── Route dispatch ──
      if (path === '/v1/inference' && method === 'POST') {
        return await handleInference(request, env, ctx);
      }

      if (path === '/v1/leads' && method === 'POST') {
        return await handleCreateLead(request, env, ctx);
      }

      if (path === '/v1/leads/enrich' && method === 'POST') {
        return await handleEnrichLead(request, env, ctx);
      }

      if (path.startsWith('/v1/leads/') && method === 'GET') {
        const recordId = path.split('/v1/leads/')[1];
        return await handleGetLead(recordId, env);
      }

      if (path === '/v1/webhook/retell' && method === 'POST') {
        return await handleRetellWebhook(request, env, ctx);
      }

      if (path === '/v1/content/generate' && method === 'POST') {
        return await handleContentGenerate(request, env, ctx);
      }

      if (path === '/v1/agents' && method === 'GET') {
        return handleListAgents(url, env);
      }

      if (path === '/v1/agents/metrics' && method === 'GET') {
        return handleAgentMetrics(url, env);
      }

      if (path === '/v1/dashboard' && method === 'GET') {
        return await handleDashboard(env);
      }

      if (path.match(/^\/v1\/agents\/[^/]+\/action$/) && method === 'POST') {
        return await handleAgentAction(request, env, ctx);
      }

      if (path.match(/^\/v1\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/agents/')[1];
        return handleGetAgent(agentId, env);
      }

      // ── Workflow Pipelines ──
      if (path === '/v1/workflows/scaa1' && method === 'POST') {
        return await handleScaa1BattlePlan(request, env, ctx);
      }

      if (path === '/v1/workflows/wf3' && method === 'POST') {
        return await handleWf3InvestorEscalation(request, env, ctx);
      }

      if (path === '/v1/workflows/wf4' && method === 'POST') {
        return await handleWf4LongTailNurture(request, env, ctx);
      }

      // ── Property Intelligence ──
      if (path === '/v1/property-intel/search' && method === 'GET') {
        return await handlePropertySearch(url, env);
      }

      if (path === '/v1/property-intel/import' && method === 'POST') {
        return await handlePropertyImport(request, env, ctx);
      }

      if (path === '/v1/property-intel/stats' && method === 'GET') {
        return await handlePropertyStats(env);
      }

      // ── TH Sentinel Campaign ──
      if (path === '/v1/campaign/calls' && method === 'GET') {
        return await handleCampaignCallLog(url, env);
      }

      if (path === '/v1/campaign/agents' && method === 'GET') {
        return await handleCampaignAgentPerformance(url, env);
      }

      if (path === '/v1/campaign/analytics' && method === 'GET') {
        return await handleCampaignAnalytics(url, env);
      }

      if (path === '/v1/campaign/contacts' && method === 'GET') {
        return await handleCampaignLeadContacts(url, env);
      }

      if (path === '/v1/campaign/dashboard' && method === 'GET') {
        return await handleCampaignDashboard(env);
      }

      // ── Pricing Engine ──
      if (path === '/v1/pricing/recommend' && method === 'POST') {
        return await handlePricingRecommend(request, env, ctx);
      }

      if (path === '/v1/pricing/zones' && method === 'GET') {
        return handlePricingZones();
      }

      // ── Intelligence Officers ──
      if (path === '/v1/intel/officers' && method === 'GET') {
        return handleListOfficers(url);
      }

      if (path === '/v1/intel/dashboard' && method === 'GET') {
        return await handleOfficerDashboard(env);
      }

      if (path === '/v1/intel/fleet-scan' && method === 'POST') {
        return await handleFleetScan(env, ctx);
      }

      if (path.match(/^\/v1\/intel\/officers\/[^/]+\/scan$/) && method === 'POST') {
        return await handleOfficerScan(request, env, ctx);
      }

      if (path.match(/^\/v1\/intel\/officers\/[^/]+$/) && method === 'GET') {
        const officerId = path.split('/v1/intel/officers/')[1];
        return handleGetOfficer(officerId);
      }

      // ── Email Agents ──
      if (path === '/v1/email/agents' && method === 'GET') {
        return handleListEmailAgents(url);
      }

      if (path === '/v1/email/dashboard' && method === 'GET') {
        return handleEmailDashboard();
      }

      if (path === '/v1/email/compose' && method === 'POST') {
        return await handleEmailCompose(request, env, ctx);
      }

      if (path === '/v1/email/classify' && method === 'POST') {
        return await handleEmailClassify(request, env, ctx);
      }

      if (path.match(/^\/v1\/email\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/email/agents/')[1];
        return handleGetEmailAgent(agentId);
      }

      if (path === '/v1/audit' && method === 'GET') {
        return await handleAuditLog(url, env);
      }

      // ── MCCO — Master Chief Commanding Officer (Sovereign Governance) ──
      if (path === '/v1/mcco/command' && method === 'GET') {
        return handleMCCOCommand();
      }

      if (path === '/v1/mcco/agents' && method === 'GET') {
        return handleListMCCOAgents(url);
      }

      if (path === '/v1/mcco/fleet-status' && method === 'GET') {
        return handleMCCOFleetStatus();
      }

      if (path === '/v1/mcco/directive' && method === 'POST') {
        return await handleMCCODirective(request, env, ctx);
      }

      if (path === '/v1/mcco/content-calendar' && method === 'POST') {
        return await handleMCCOContentCalendar(request, env, ctx);
      }

      if (path === '/v1/mcco/audience-profile' && method === 'POST') {
        return await handleMCCOAudienceProfile(request, env, ctx);
      }

      if (path === '/v1/mcco/positioning' && method === 'POST') {
        return await handleMCCOPositioning(request, env, ctx);
      }

      if (path === '/v1/mcco/monetization' && method === 'POST') {
        return await handleMCCOMonetization(request, env, ctx);
      }

      if (path === '/v1/mcco/post' && method === 'POST') {
        return await handleMCCOPost(request, env, ctx);
      }

      if (path.match(/^\/v1\/mcco\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/mcco/agents/')[1];
        return handleGetMCCOAgent(agentId);
      }

      // ── Atlas AI Campaign Platform (youratlas.com) ──
      if (path === '/v1/atlas/health' && method === 'GET') {
        return await handleAtlasHealth(env);
      }

      if (path === '/v1/atlas/campaigns' && method === 'GET') {
        return await handleAtlasCampaigns(env);
      }

      if (path === '/v1/atlas/campaigns' && method === 'POST') {
        return await handleAtlasCreateCampaign(request, env, ctx);
      }

      if (path === '/v1/atlas/audit' && method === 'GET') {
        return await handleAtlasAudit(env);
      }

      if (path === '/v1/atlas/statistics' && method === 'GET') {
        return await handleAtlasOverviewStats(env);
      }

      if (path === '/v1/atlas/speed-to-lead' && method === 'POST') {
        return await handleAtlasSpeedToLead(request, env, ctx);
      }

      if (path === '/v1/atlas/kb/files' && method === 'GET') {
        return await handleAtlasKBFiles(env);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/status$/) && method === 'PUT') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/status', '');
        return await handleAtlasCampaignStatus(request, campaignId, env, ctx);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/setup-revival$/) && method === 'POST') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/setup-revival', '');
        return await handleAtlasSetupRevival(campaignId, env, ctx);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/stats$/) && method === 'GET') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/stats', '');
        return await handleAtlasCampaignStatsById(campaignId, env);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/calls\/[^/]+$/) && method === 'GET') {
        const parts = path.match(/^\/v1\/atlas\/campaigns\/([^/]+)\/calls\/([^/]+)$/);
        return await handleAtlasCallRecordDetail(parts[1], parts[2], env);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/calls$/) && method === 'GET') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/calls', '');
        return await handleAtlasCallRecords(campaignId, url, env);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/schedule$/) && method === 'POST') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/schedule', '');
        return await handleAtlasScheduleCall(request, campaignId, env, ctx);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/bookings$/) && method === 'GET') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/bookings', '');
        return await handleAtlasCampaignBookings(campaignId, env);
      }

      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+$/) && method === 'GET') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1];
        return await handleAtlasCampaignById(campaignId, env);
      }

      // ── Peak Performance Frameworks ──
      if (path === '/v1/frameworks' && method === 'GET') {
        return handleListFrameworks(url);
      }

      if (path === '/v1/frameworks/apply' && method === 'POST') {
        return await handleFrameworkApply(request, env, ctx);
      }

      if (path === '/v1/frameworks/content' && method === 'POST') {
        return await handleFrameworkContent(request, env, ctx);
      }

      if (path === '/v1/frameworks/sales-playbook' && method === 'POST') {
        return await handleFrameworkSalesPlaybook(request, env, ctx);
      }

      if (path === '/v1/frameworks/productivity-plan' && method === 'POST') {
        return await handleFrameworkProductivityPlan(request, env, ctx);
      }

      if (path.match(/^\/v1\/frameworks\/category\/[^/]+$/) && method === 'GET') {
        const category = path.split('/v1/frameworks/category/')[1];
        return handleGetFrameworksByCategory(category);
      }

      if (path.match(/^\/v1\/frameworks\/[^/]+$/) && method === 'GET') {
        const frameworkId = path.split('/v1/frameworks/')[1];
        return handleGetFramework(frameworkId);
      }

      // ── Financial Engine ──
      if (path === '/v1/financial/models' && method === 'GET') {
        return handleFinancialModels();
      }
      if (path === '/v1/financial/management-fee' && method === 'POST') {
        return await handleManagementFee(request);
      }
      if (path === '/v1/financial/rent-estimate' && method === 'POST') {
        return await handleRentEstimate(request);
      }
      if (path === '/v1/financial/roi' && method === 'POST') {
        return await handlePropertyROI(request);
      }
      if (path === '/v1/financial/forecast' && method === 'POST') {
        return await handleFinancialForecast(request);
      }
      if (path === '/v1/financial/pricing-strategy' && method === 'POST') {
        return await handleDynamicPricing(request);
      }
      if (path === '/v1/financial/budget' && method === 'POST') {
        return await handleBudget(request);
      }

      // ── Analysis Suite ──
      if (path === '/v1/analysis/agent' && method === 'POST') {
        return await handleAgentAnalysis(request);
      }
      if (path === '/v1/analysis/fleet' && method === 'POST') {
        return await handleFleetAnalytics(request);
      }
      if (path === '/v1/analysis/market-trends' && method === 'POST') {
        return await handleMarketTrends(request);
      }
      if (path === '/v1/analysis/competitive-intel' && method === 'POST') {
        return await handleCompetitiveIntel(request);
      }
      if (path === '/v1/analysis/lead-pipeline' && method === 'POST') {
        return await handleLeadPipeline(request);
      }
      if (path === '/v1/analysis/operational-report' && method === 'POST') {
        return await handleOperationalReport(request);
      }
      if (path === '/v1/analysis/templates' && method === 'GET') {
        return handleAnalysisTemplates();
      }
      if (path === '/v1/analysis/property-health' && method === 'POST') {
        return await handlePropertyHealth(request);
      }
      if (path === '/v1/analysis/churn-prediction' && method === 'POST') {
        return await handleChurnPrediction(request);
      }

      // ── Trading / Deal Engine ──
      if (path === '/v1/deals/stages' && method === 'GET') {
        return handleDealStages();
      }
      if (path === '/v1/deals/score' && method === 'POST') {
        return await handleScoreDeal(request);
      }
      if (path === '/v1/deals/strategy' && method === 'POST') {
        return await handleDealStrategy(request);
      }
      if (path === '/v1/deals/comparables' && method === 'POST') {
        return await handleComparables(request);
      }
      if (path === '/v1/deals/closing-costs' && method === 'POST') {
        return await handleClosingCosts(request);
      }
      if (path === '/v1/deals/investor-package' && method === 'POST') {
        return await handleInvestorPackage(request);
      }
      if (path === '/v1/deals/portfolio' && method === 'POST') {
        return await handlePortfolioEvaluation(request);
      }

      // ── AI Trader Agent ──
      if (path === '/v1/trader/dashboard' && method === 'GET') {
        return await handleTraderDashboard(env);
      }
      if (path === '/v1/trader/agent' && method === 'GET') {
        return handleTraderAgent();
      }
      if (path === '/v1/trader/watchlist' && method === 'GET') {
        return handleWatchlist();
      }
      if (path === '/v1/trader/quote' && method === 'POST') {
        return await handleQuote(request, env);
      }
      if (path === '/v1/trader/signal' && method === 'POST') {
        return await handleSignal(request, env);
      }
      if (path === '/v1/trader/capital-call' && method === 'POST') {
        return await handleCapitalCall(request, env);
      }
      if (path === '/v1/trader/portfolio' && method === 'POST') {
        return await handleTraderPortfolio(request, env);
      }
      if (path === '/v1/trader/news' && method === 'GET') {
        return await handleTraderNews(env);
      }
      if (path === '/v1/trader/trade' && method === 'POST') {
        return await handleLogTrade(request, env);
      }
      if (path === '/v1/trader/history' && method === 'GET') {
        return await handleTradeHistory(url, env);
      }
      if (path === '/v1/trader/capital-tiers' && method === 'GET') {
        return handleCapitalTiers();
      }

      // ── Agent Hierarchy & Command Structure ──
      if (path === '/v1/hierarchy/command-chain' && method === 'GET') {
        return handleCommandChain();
      }
      if (path === '/v1/hierarchy/fleet-status' && method === 'GET') {
        return handleFleetStatusEndpoint();
      }
      if (path.match(/^\/v1\/hierarchy\/chain\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/hierarchy/chain/')[1];
        return handleChainOfCommand(agentId);
      }
      if (path.match(/^\/v1\/hierarchy\/reports\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/hierarchy/reports/')[1];
        return handleDirectReports(agentId);
      }
      if (path.match(/^\/v1\/hierarchy\/division\/[^/]+$/) && method === 'GET') {
        const divisionCode = path.split('/v1/hierarchy/division/')[1];
        return handleDivisionHierarchyEndpoint(divisionCode);
      }

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error(`[CK Gateway Error] ${path}:`, err);

      // Log errors to audit KV
      if (env.AUDIT_LOG) {
        const key = `error:${Date.now()}`;
        ctx.waitUntil(
          env.AUDIT_LOG.put(key, JSON.stringify({
            path,
            method,
            error: err.message,
            stack: err.stack,
            timestamp: new Date().toISOString(),
          }), { expirationTtl: 86400 * 30 })
        );
      }

      return errorResponse(`Internal error: ${err.message}`, 500);
    }
  },
};
