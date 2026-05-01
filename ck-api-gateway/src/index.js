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
 *   GET  /v1/coop/committee      — Cooperations Committee charter and dashboard
 *   GET  /v1/coop/agents         — List all 10 COOP agents
 *   GET  /v1/coop/agents/:id     — Get single COOP agent
 *   POST /v1/coop/brief          — Generate CEO meeting preparation brief
 *   POST /v1/coop/outreach       — Draft warm outreach message for target contact
 *   POST /v1/coop/network-map    — Analyze CEO relationship network
 *   GET  /v1/coop/targets        — Target contact categories and priorities
 *   POST /v1/coop/schedule       — Propose CEO meeting for calendar
 *   GET  /v1/meta-ads/status    — Meta Ads connector health check & diagnostics
 *   POST /v1/meta-ads/boost     — Boost high-engagement post via Meta Ads Manager
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
 *   GET  /v1/frameworks                   — List all Peak Performance Frameworks
 *   GET  /v1/frameworks/category/:cat     — Get frameworks by category
 *   GET  /v1/frameworks/:id               — Get single framework
 *   POST /v1/frameworks/apply             — AI-apply framework to business scenario
 *   POST /v1/frameworks/content           — Generate content using framework principles
 *   POST /v1/frameworks/sales-playbook    — Generate sales playbook from framework rules
 *   POST /v1/frameworks/productivity-plan — Generate agent/team productivity plan
 *   POST /v1/frameworks/vpas/evaluate    — Evaluate task/project against V+P+A=S equation
 *   POST /v1/frameworks/vpas/audit       — Audit division/fleet V+P+A=S compliance
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
 *   POST /v1/slack/commands    — Slack slash command dispatcher (10 commands)
 *   POST /v1/slack/interactions — Slack interactive component callbacks
 *   POST /v1/slack/events      — Slack event subscription handler
 *   GET  /v1/slack/channels    — Slack channel architecture
 *   GET  /v1/slack/apps        — Slack app registry
 *   GET  /v1/slack/audit       — Slack platform audit record
 *   POST /v1/email/send              — Send email via Gmail API (OAuth 2.0)
 *   POST /v1/email/draft             — Create email draft via Gmail API
 *   GET  /v1/email/oauth/health      — Gmail OAuth connectivity check
 *   POST /v1/compliance/dnc/add        — Add phone to DNC registry
 *   POST /v1/compliance/dnc/check      — Check phone against DNC list
 *   POST /v1/compliance/dnc/bulk-check — Bulk scrub phone list against DNC
 *   POST /v1/compliance/dnc/remove     — Remove phone from DNC
 *   POST /v1/compliance/consent/record — Record PEWC for contact
 *   POST /v1/compliance/consent/check  — Check consent status
 *   GET  /v1/compliance/calling-window — Check calling window status
 *   POST /v1/compliance/pre-call-check — Full pre-call compliance gate
 *   GET  /v1/compliance/audit          — Generate TCPA/DNC audit report
 *   GET  /v1/rnd/campaign              — Full 7-day R&D campaign plan
 *   GET  /v1/rnd/campaign/status       — Live campaign status
 *   GET  /v1/rnd/campaign/day/:day     — Single day's plan (1-7)
 *   GET  /v1/rnd/campaign/competitors  — Verified competitor analysis matrix
 *   GET  /v1/rnd/campaign/systems      — Unincorporated systems to adopt
 *   GET  /v1/capital/engine            — Full Capital Engine overview
 *   GET  /v1/capital/pillars/:id       — Single revenue pillar (CE-P1, CE-P2, CE-P3)
 *   GET  /v1/capital/drip-matrix       — DRIP Matrix delegation framework
 *   GET  /v1/capital/business-model    — Integrated business model
 *   GET  /v1/capital/metrics           — Revenue projections and KPIs
 *   GET  /v1/metrics/dashboard         — Profit dashboard (7 core + 4 supporting metrics)
 *   GET  /v1/metrics/targets           — Governance targets and thresholds
 *   POST /v1/metrics/calculate         — Calculate all metrics from supplied data
 *   GET  /v1/metrics/revenue-lines     — Revenue line item definitions
 *   GET  /v1/metrics/expenses          — Operating expense categories
 *   POST /v1/metrics/noi              — Calculate Net Operating Income
 *   POST /v1/metrics/gross-margin     — Calculate Gross Margin
 *   POST /v1/metrics/cac-ltv          — Calculate CAC vs LTV ratio
 *   GET  /v1/thinking/frameworks       — List all 7 expert thinking frameworks
 *   GET  /v1/thinking/frameworks/:id   — Get single thinking framework
 *   POST /v1/thinking/session          — Run thinking session (single framework)
 *   POST /v1/thinking/multi            — Multi-framework analysis with synthesis
 *   POST /v1/thinking/learning-blueprint — 90-day neuro-optimized learning blueprint
 *   POST /v1/thinking/daily-models     — CEO daily mental models briefing
 *   POST /v1/thinking/pm-mastery       — Property management mastery training
 *   POST /v1/thinking/cognitive-os     — Cognitive OS audit & rewrite
 *   POST /v1/thinking/life-architecture — High-performance life architecture
 *   POST /v1/thinking/time-leverage    — Time leverage strategy (1yr = 10yr)
 *   POST /v1/thinking/reprogram        — Psychological identity reprogrammer
 *   GET  /v1/thinking/dashboard        — Thinking Coach operational dashboard
 *   POST /v1/ceo/directive             — Issue CEO directive (optimize/architect/execute/diagnose/integrate)
 *   POST /v1/ceo/operations-review     — Full operations review (5 directives + synthesis)
 *   GET  /v1/ceo/operating-state       — Enterprise operating state
 *   GET  /v1/ceo/dashboard             — CEO sovereign command dashboard
 *   GET  /v1/itam/dashboard            — ITAM KPI engine overview
 *   GET  /v1/itam/kpis                 — All 26 KPIs across 5 categories
 *   GET  /v1/itam/kpis/:category       — KPIs by category
 *   POST /v1/itam/score                — Score a KPI against thresholds
 *   POST /v1/itam/tco                  — Calculate Total Cost of Ownership
 *   GET  /v1/itam/health               — Composite health score (weighted)
 *   GET  /v1/itam/strategic            — 3 strategic themes
 *
 * Auth: Bearer token via WORKER_AUTH_TOKEN secret (Slack routes use signature verification)
 * Total: 144 route handlers | 383 agents | 10 divisions | 7 thinking frameworks | 5 CEO directive types
 */
