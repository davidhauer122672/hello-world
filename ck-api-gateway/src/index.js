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
 *   POST /v1/content/publish    — Publish Content Calendar record to Buffer (WF-2 replacement)
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret (Slack routes use signature verification)
 * Total: 147+ route handlers | 383 agents | 10 divisions
 */

import { authenticate } from './middleware/auth.js';
import { rateLimit } from './middleware/rate-limit.js';
import { handleInference } from './routes/inference.js';
import { handleCreateLead, handleGetLead, handleEnrichLead, handlePublicLead } from './routes/leads.js';
import { handleRetellWebhook } from './routes/retell.js';
import { handleContentGenerate } from './routes/content.js';
import { handleContentPublish } from './routes/content-publish.js';
import { handleAuditLog } from './routes/audit.js';
import { handleListAgents, handleGetAgent, handleAgentAction, handleAgentMetrics, handleDashboard } from './routes/agents.js';
import { handleScaa1BattlePlan, handleWf3InvestorEscalation, handleWf4LongTailNurture } from './routes/workflows.js';
import { handlePropertySearch, handlePropertyImport, handlePropertyStats } from './routes/property-intel.js';
import { handleCampaignCallLog, handleCampaignAgentPerformance, handleCampaignAnalytics, handleCampaignLeadContacts, handleCampaignDashboard } from './routes/sentinel-campaign.js';
import { handlePricingRecommend, handlePricingZones } from './routes/pricing.js';
import { handleListOfficers, handleGetOfficer, handleOfficerScan, handleOfficerDashboard, handleFleetScan } from './routes/intelligence-officers.js';
import { handleListEmailAgents, handleGetEmailAgent, handleEmailCompose, handleEmailClassify, handleEmailDashboard } from './routes/email-agents.js';
import { handleListMCCOAgents, handleGetMCCOAgent, handleMCCOCommand, handleMCCOFleetStatus, handleMCCODirective, handleMCCOContentCalendar, handleMCCOAudienceProfile, handleMCCOPositioning, handleMCCOMonetization, handleMCCOPost, handleMasterPlan, handleMasterPlanPhase, handleDivisionPlan, handleSovereignDirectiveIssue, handleActivationStatus } from './routes/mcco.js';
import { handleListFrameworks, handleGetFramework, handleGetFrameworksByCategory, handleFrameworkApply, handleFrameworkContent, handleFrameworkSalesPlaybook, handleFrameworkProductivityPlan, handleVPASEvaluate, handleVPASAudit } from './routes/frameworks.js';
import {
  handleTraderDashboard, handleTraderAgent, handleTraderFleet, handleGetTraderById,
  handleWatchlist, handleQuote, handleSignal,
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
import { handleSlackCommand, handleSlackInteraction, handleSlackEvent, handleSlackChannels, handleSlackApps, handleSlackAudit } from './routes/slack.js';
import { handleMetaAdsStatus, handleMetaAdsBoost, handleMetaAdsCampaigns } from './routes/meta-ads.js';
import { handleListThinkingFrameworks, handleGetThinkingFramework, handleThinkingSession, handleMultiFramework, handleLearningBlueprint, handleDailyModels, handlePMMastery, handleCognitiveOS, handleLifeArchitecture, handleTimeLeverage, handleReprogram, handleThinkingDashboard } from './routes/thinking-coach.js';
import { handleCeoDirective, handleOperationsReview, handleOperatingState, handleCeoDashboard } from './routes/ceo-directives.js';
import { handleEmailSend, handleEmailDraft, handleEmailOAuthHealth } from './routes/email-operations.js';
import { handleDNCAdd, handleDNCCheck, handleDNCBulkCheck, handleDNCRemove, handleConsentRecord, handleConsentCheck, handleCallingWindow, handlePreCallCheck, handleComplianceAudit } from './routes/compliance.js';
import { handleRndCampaignPlan, handleRndCampaignStatus, handleRndCampaignDay, handleRndCompetitors, handleRndSystems } from './routes/rnd-campaign.js';
import { handleCapitalEngine, handleCapitalPillar, handleDRIPMatrix, handleBusinessModel, handleCapitalMetrics } from './routes/capital-engine.js';
import { handleMetricsDashboard, handleMetricsTargets, handleMetricsCalculate, handleRevenueLines, handleExpenseCategories, handleCalculateNOI, handleCalculateGrossMargin, handleCalculateCACLTV } from './routes/profit-metrics.js';
import { handleCoopCommittee, handleListCoopAgents, handleGetCoopAgent, handleCoopBrief, handleCoopOutreach, handleCoopNetworkMap, handleCoopTargets, handleCoopSchedule } from './routes/cooperations.js';
import { getFullManifest, getManifestSummary } from './agents/agent-manifest.js';
import { handleOrchestratorLaunch, handleOrchestratorStatus, handleOrchestratorFleet, handleDivisionActivate } from './routes/orchestrator.js';
import { jsonResponse, errorResponse, corsHeaders } from './utils/response.js';

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // ── Health (no auth) ──
    if (path === '/v1/health' && method === 'GET') {
      return jsonResponse({
        status: 'operational',
        service: 'ck-api-gateway',
        version: '2.0.0',
        agents: 383,
        divisions: 10,
        timestamp: new Date().toISOString(),
      });
    }

    // ── Public routes (no auth) ──
    if (path === '/v1/leads/public' && method === 'POST') {
      return await handlePublicLead(request, env, ctx);
    }

    // ── Slack routes (signature verification) ��─
    if (path === '/v1/slack/commands' && method === 'POST') {
      return await handleSlackCommand(request, env, ctx);
    }
    if (path === '/v1/slack/interactions' && method === 'POST') {
      return await handleSlackInteraction(request, env, ctx);
    }
    if (path === '/v1/slack/events' && method === 'POST') {
      return await handleSlackEvent(request, env, ctx);
    }

    // ── Auth gate ──
    const authError = authenticate(request, env);
    if (authError) return authError;

    // ── Rate limit ──
    const rateLimitError = await rateLimit(request, env);
    if (rateLimitError) return rateLimitError;

    try {
      // ── Core ──
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
      if (path === '/v1/content/publish' && method === 'POST') {
        return await handleContentPublish(request, env, ctx);
      }

      // ── Agents ──
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

      // ─�� Workflows ──
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

      // ── Pricing ──
      if (path === '/v1/pricing/recommend' && method === 'POST') {
        return await handlePricingRecommend(request, env, ctx);
      }
      if (path === '/v1/pricing/zones' && method === 'GET') {
        return handlePricingZones();
      }

      // ── Campaign ──
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

      // ── Intel Officers ──
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
      if (path === '/v1/email/send' && method === 'POST') {
        return await handleEmailSend(request, env, ctx);
      }
      if (path === '/v1/email/draft' && method === 'POST') {
        return await handleEmailDraft(request, env, ctx);
      }
      if (path === '/v1/email/oauth/health' && method === 'GET') {
        return await handleEmailOAuthHealth(env);
      }

      if (path === '/v1/audit' && method === 'GET') {
        return await handleAuditLog(url, env);
      }

      // ── MCCO ──
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
      if (path === '/v1/mcco/master-plan' && method === 'GET') {
        return handleMasterPlan();
      }
      if (path.match(/^\/v1\/mcco\/master-plan\/phase\/[^/]+$/) && method === 'GET') {
        const phaseId = path.split('/v1/mcco/master-plan/phase/')[1];
        return handleMasterPlanPhase(phaseId);
      }
      if (path.match(/^\/v1\/mcco\/master-plan\/division\/[^/]+$/) && method === 'GET') {
        const divisionId = path.split('/v1/mcco/master-plan/division/')[1];
        return handleDivisionPlan(divisionId);
      }
      if (path === '/v1/mcco/sovereign-directive' && method === 'POST') {
        return await handleSovereignDirectiveIssue(request, env, ctx);
      }
      if (path === '/v1/mcco/activation-status' && method === 'GET') {
        return handleActivationStatus();
      }

      // ── Atlas AI ──
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
      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/calls$/) && method === 'GET') {
        const campaignId = path.split('/v1/atlas/campaigns/')[1].replace('/calls', '');
        return await handleAtlasCallRecords(campaignId, url, env);
      }
      if (path.match(/^\/v1\/atlas\/campaigns\/[^/]+\/calls\/[^/]+$/) && method === 'GET') {
        const parts = path.split('/');
        const campaignId = parts[4];
        const callId = parts[6];
        return await handleAtlasCallRecordDetail(campaignId, callId, env);
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

      // ── Master Orchestrator Fleet Launch ──
      if (path === '/v1/orchestrator/launch' && method === 'POST') {
        return await handleOrchestratorLaunch(request, env, ctx);
      }
      if (path === '/v1/orchestrator/status' && method === 'GET') {
        return handleOrchestratorStatus(env);
      }
      if (path === '/v1/orchestrator/fleet' && method === 'GET') {
        return handleOrchestratorFleet();
      }
      if (path.match(/^\/v1\/orchestrator\/division\/[^/]+\/activate$/) && method === 'POST') {
        const divCode = path.split('/v1/orchestrator/division/')[1].replace('/activate', '');
        return await handleDivisionActivate(divCode, env, ctx);
      }

      // ── Frameworks ─���
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
      if (path === '/v1/frameworks/vpas/evaluate' && method === 'POST') {
        return await handleVPASEvaluate(request, env, ctx);
      }
      if (path === '/v1/frameworks/vpas/audit' && method === 'POST') {
        return await handleVPASAudit(request, env, ctx);
      }
      if (path.match(/^\/v1\/frameworks\/category\/[^/]+$/) && method === 'GET') {
        const cat = path.split('/v1/frameworks/category/')[1];
        return handleGetFrameworksByCategory(cat);
      }
      if (path.match(/^\/v1\/frameworks\/[^/]+$/) && method === 'GET') {
        const fwId = path.split('/v1/frameworks/')[1];
        return handleGetFramework(fwId);
      }

      // ── Trader ──
      if (path === '/v1/trader/dashboard' && method === 'GET') {
        return handleTraderDashboard();
      }
      if (path === '/v1/trader/agent' && method === 'GET') {
        return handleTraderAgent();
      }
      if (path === '/v1/trader/watchlist' && method === 'GET') {
        return handleWatchlist();
      }
      if (path === '/v1/trader/quote' && method === 'POST') {
        return await handleQuote(request, env, ctx);
      }
      if (path === '/v1/trader/signal' && method === 'POST') {
        return await handleSignal(request, env, ctx);
      }
      if (path === '/v1/trader/capital-call' && method === 'POST') {
        return await handleCapitalCall(request, env, ctx);
      }
      if (path === '/v1/trader/portfolio' && method === 'POST') {
        return await handleTraderPortfolio(request, env, ctx);
      }
      if (path === '/v1/trader/news' && method === 'GET') {
        return handleTraderNews();
      }
      if (path === '/v1/trader/trade' && method === 'POST') {
        return await handleLogTrade(request, env, ctx);
      }
      if (path === '/v1/trader/history' && method === 'GET') {
        return handleTradeHistory(url);
      }
      if (path === '/v1/trader/capital-tiers' && method === 'GET') {
        return handleCapitalTiers();
      }
      if (path === '/v1/trader/fleet' && method === 'GET') {
        return handleTraderFleet();
      }
      if (path.match(/^\/v1\/trader\/agents\/[^/]+$/) && method === 'GET') {
        const traderId = path.split('/v1/trader/agents/')[1];
        return handleGetTraderById(traderId);
      }

      // ── Slack ──
      if (path === '/v1/slack/channels' && method === 'GET') {
        return handleSlackChannels();
      }
      if (path === '/v1/slack/apps' && method === 'GET') {
        return handleSlackApps();
      }
      if (path === '/v1/slack/audit' && method === 'GET') {
        return handleSlackAudit();
      }

      // ── Meta Ads ──
      if (path === '/v1/meta-ads/status' && method === 'GET') {
        return handleMetaAdsStatus(env);
      }
      if (path === '/v1/meta-ads/boost' && method === 'POST') {
        return await handleMetaAdsBoost(request, env, ctx);
      }
      if (path === '/v1/meta-ads/campaigns' && method === 'GET') {
        return await handleMetaAdsCampaigns(env);
      }

      // ── Cooperations ──
      if (path === '/v1/coop/committee' && method === 'GET') {
        return handleCoopCommittee();
      }
      if (path === '/v1/coop/agents' && method === 'GET') {
        return handleListCoopAgents(url);
      }
      if (path === '/v1/coop/brief' && method === 'POST') {
        return await handleCoopBrief(request, env, ctx);
      }
      if (path === '/v1/coop/outreach' && method === 'POST') {
        return await handleCoopOutreach(request, env, ctx);
      }
      if (path === '/v1/coop/network-map' && method === 'POST') {
        return await handleCoopNetworkMap(request, env, ctx);
      }
      if (path === '/v1/coop/targets' && method === 'GET') {
        return handleCoopTargets();
      }
      if (path === '/v1/coop/schedule' && method === 'POST') {
        return await handleCoopSchedule(request, env, ctx);
      }
      if (path.match(/^\/v1\/coop\/agents\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/coop/agents/')[1];
        return handleGetCoopAgent(agentId);
      }

      // ── Compliance ──
      if (path === '/v1/compliance/dnc/add' && method === 'POST') {
        return await handleDNCAdd(request, env, ctx);
      }
      if (path === '/v1/compliance/dnc/check' && method === 'POST') {
        return await handleDNCCheck(request, env, ctx);
      }
      if (path === '/v1/compliance/dnc/bulk-check' && method === 'POST') {
        return await handleDNCBulkCheck(request, env, ctx);
      }
      if (path === '/v1/compliance/dnc/remove' && method === 'POST') {
        return await handleDNCRemove(request, env, ctx);
      }
      if (path === '/v1/compliance/consent/record' && method === 'POST') {
        return await handleConsentRecord(request, env, ctx);
      }
      if (path === '/v1/compliance/consent/check' && method === 'POST') {
        return await handleConsentCheck(request, env, ctx);
      }
      if (path === '/v1/compliance/calling-window' && method === 'GET') {
        return handleCallingWindow(url);
      }
      if (path === '/v1/compliance/pre-call-check' && method === 'POST') {
        return await handlePreCallCheck(request, env, ctx);
      }
      if (path === '/v1/compliance/audit' && method === 'GET') {
        return await handleComplianceAudit(env);
      }

      // ── Thinking Coach ──
      if (path === '/v1/thinking/frameworks' && method === 'GET') {
        return handleListThinkingFrameworks(url);
      }
      if (path === '/v1/thinking/session' && method === 'POST') {
        return await handleThinkingSession(request, env, ctx);
      }
      if (path === '/v1/thinking/multi' && method === 'POST') {
        return await handleMultiFramework(request, env, ctx);
      }
      if (path === '/v1/thinking/learning-blueprint' && method === 'POST') {
        return await handleLearningBlueprint(request, env, ctx);
      }
      if (path === '/v1/thinking/daily-models' && method === 'POST') {
        return await handleDailyModels(request, env, ctx);
      }
      if (path === '/v1/thinking/pm-mastery' && method === 'POST') {
        return await handlePMMastery(request, env, ctx);
      }
      if (path === '/v1/thinking/cognitive-os' && method === 'POST') {
        return await handleCognitiveOS(request, env, ctx);
      }
      if (path === '/v1/thinking/life-architecture' && method === 'POST') {
        return await handleLifeArchitecture(request, env, ctx);
      }
      if (path === '/v1/thinking/time-leverage' && method === 'POST') {
        return await handleTimeLeverage(request, env, ctx);
      }
      if (path === '/v1/thinking/reprogram' && method === 'POST') {
        return await handleReprogram(request, env, ctx);
      }
      if (path === '/v1/thinking/dashboard' && method === 'GET') {
        return handleThinkingDashboard();
      }
      if (path.match(/^\/v1\/thinking\/frameworks\/[^/]+$/) && method === 'GET') {
        const fwId = path.split('/v1/thinking/frameworks/')[1];
        return handleGetThinkingFramework(fwId);
      }

      // ── CEO Directives ──
      if (path === '/v1/ceo/directive' && method === 'POST') {
        return await handleCeoDirective(request, env, ctx);
      }
      if (path === '/v1/ceo/operations-review' && method === 'POST') {
        return await handleOperationsReview(request, env, ctx);
      }
      if (path === '/v1/ceo/operating-state' && method === 'GET') {
        return handleOperatingState();
      }
      if (path === '/v1/ceo/dashboard' && method === 'GET') {
        return handleCeoDashboard();
      }

      // ── Engines ──
      if (path === '/v1/financial/models' && method === 'GET') { return handleFinancialModels(); }
      if (path === '/v1/financial/management-fee' && method === 'POST') { return await handleManagementFee(request); }
      if (path === '/v1/financial/rent-estimate' && method === 'POST') { return await handleRentEstimate(request); }
      if (path === '/v1/financial/roi' && method === 'POST') { return await handlePropertyROI(request); }
      if (path === '/v1/financial/forecast' && method === 'POST') { return await handleFinancialForecast(request, env, ctx); }
      if (path === '/v1/financial/pricing-strategy' && method === 'POST') { return await handleDynamicPricing(request, env, ctx); }
      if (path === '/v1/financial/budget' && method === 'POST') { return await handleBudget(request, env, ctx); }
      if (path === '/v1/analysis/agent' && method === 'POST') { return await handleAgentAnalysis(request, env, ctx); }
      if (path === '/v1/analysis/fleet' && method === 'POST') { return await handleFleetAnalytics(request, env, ctx); }
      if (path === '/v1/analysis/market-trends' && method === 'POST') { return await handleMarketTrends(request, env, ctx); }
      if (path === '/v1/analysis/competitive-intel' && method === 'POST') { return await handleCompetitiveIntel(request, env, ctx); }
      if (path === '/v1/analysis/lead-pipeline' && method === 'POST') { return await handleLeadPipeline(request, env, ctx); }
      if (path === '/v1/analysis/operational-report' && method === 'POST') { return await handleOperationalReport(request, env, ctx); }
      if (path === '/v1/analysis/templates' && method === 'GET') { return handleAnalysisTemplates(); }
      if (path === '/v1/analysis/property-health' && method === 'POST') { return await handlePropertyHealth(request, env, ctx); }
      if (path === '/v1/analysis/churn-prediction' && method === 'POST') { return await handleChurnPrediction(request, env, ctx); }
      if (path === '/v1/deals/stages' && method === 'GET') { return handleDealStages(); }
      if (path === '/v1/deals/score' && method === 'POST') { return await handleScoreDeal(request, env, ctx); }
      if (path === '/v1/deals/strategy' && method === 'POST') { return await handleDealStrategy(request, env, ctx); }
      if (path === '/v1/deals/comparables' && method === 'POST') { return await handleComparables(request, env, ctx); }
      if (path === '/v1/deals/closing-costs' && method === 'POST') { return await handleClosingCosts(request); }
      if (path === '/v1/deals/investor-package' && method === 'POST') { return await handleInvestorPackage(request, env, ctx); }
      if (path === '/v1/deals/portfolio' && method === 'POST') { return await handlePortfolioEvaluation(request, env, ctx); }
      if (path === '/v1/hierarchy/command-chain' && method === 'GET') { return handleCommandChain(); }
      if (path === '/v1/hierarchy/fleet-status' && method === 'GET') { return handleFleetStatusEndpoint(); }
      if (path.match(/^\/v1\/hierarchy\/chain\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/hierarchy/chain/')[1];
        return handleChainOfCommand(agentId);
      }
      if (path.match(/^\/v1\/hierarchy\/reports\/[^/]+$/) && method === 'GET') {
        const agentId = path.split('/v1/hierarchy/reports/')[1];
        return handleDirectReports(agentId);
      }
      if (path.match(/^\/v1\/hierarchy\/division\/[^/]+$/) && method === 'GET') {
        const code = path.split('/v1/hierarchy/division/')[1];
        return handleDivisionHierarchyEndpoint(code);
      }

      // ── R&D Campaign ──
      if (path === '/v1/rnd/campaign' && method === 'GET') { return handleRndCampaignPlan(); }
      if (path === '/v1/rnd/campaign/status' && method === 'GET') { return handleRndCampaignStatus(); }
      if (path === '/v1/rnd/campaign/competitors' && method === 'GET') { return handleRndCompetitors(); }
      if (path === '/v1/rnd/campaign/systems' && method === 'GET') { return handleRndSystems(); }
      if (path.match(/^\/v1\/rnd\/campaign\/day\/[^/]+$/) && method === 'GET') {
        const day = parseInt(path.split('/v1/rnd/campaign/day/')[1]);
        return handleRndCampaignDay(day);
      }

      // ── Capital Engine ──
      if (path === '/v1/capital/engine' && method === 'GET') { return handleCapitalEngine(); }
      if (path === '/v1/capital/drip-matrix' && method === 'GET') { return handleDRIPMatrix(); }
      if (path === '/v1/capital/business-model' && method === 'GET') { return handleBusinessModel(); }
      if (path === '/v1/capital/metrics' && method === 'GET') { return handleCapitalMetrics(); }
      if (path.match(/^\/v1\/capital\/pillars\/[^/]+$/) && method === 'GET') {
        const pillarId = path.split('/v1/capital/pillars/')[1];
        return handleCapitalPillar(pillarId);
      }

      // ── Profit Metrics ──
      if (path === '/v1/metrics/dashboard' && method === 'GET') { return handleMetricsDashboard(); }
      if (path === '/v1/metrics/targets' && method === 'GET') { return handleMetricsTargets(); }
      if (path === '/v1/metrics/calculate' && method === 'POST') { return handleMetricsCalculate(request); }
      if (path === '/v1/metrics/revenue-lines' && method === 'GET') { return handleRevenueLines(); }
      if (path === '/v1/metrics/expenses' && method === 'GET') { return handleExpenseCategories(); }
      if (path === '/v1/metrics/noi' && method === 'POST') { return handleCalculateNOI(request); }
      if (path === '/v1/metrics/gross-margin' && method === 'POST') { return handleCalculateGrossMargin(request); }
      if (path === '/v1/metrics/cac-ltv' && method === 'POST') { return handleCalculateCACLTV(request); }

      // ── Manifest ──
      if (path === '/v1/manifest' && method === 'GET') {
        const summary = url.searchParams.get('summary') === 'true';
        return jsonResponse(summary ? getManifestSummary() : getFullManifest());
      }

      return errorResponse('Not found', 404);
    } catch (err) {
      console.error(`[CK Gateway Error] ${path}:`, err);
      if (env.AUDIT_LOG) {
        const key = `error:${Date.now()}`;
        ctx.waitUntil(
          env.AUDIT_LOG.put(key, JSON.stringify({
            path, method, error: err.message, stack: err.stack, timestamp: new Date().toISOString(),
          }), { expirationTtl: 86400 * 30 })
        );
      }
      return errorResponse(`Internal error: ${err.message}`, 500);
    }
  },
};
