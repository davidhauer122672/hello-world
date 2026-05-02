/**
 * Coastal Key Content Domination Squad — Agent Definitions
 *
 * The Content Domination Squad (CDX) is a specialized 10-agent unit
 * purpose-built for continuous market research, competitive intelligence
 * scanning, data integrity enforcement, and end-to-end system operations.
 *
 * Structure: 10 agents organized into 3 operational squads
 *   RESEARCH Squad (4): Pull research, collect data, scan YouTube/web continuously
 *   SCAN Squad (3): Scrub channels, detect gaps, monitor competitors
 *   INTEGRITY Squad (3): Detect/repair damaged data, validate system health
 *
 * Reporting: CDX reports to MCCO-000 Sovereign via CDX-001 Squad Leader
 * Authority: Read access to all divisions, write access to content pipeline
 */

export const CDX_AGENTS = [
  // ── RESEARCH Squad ─────────────────────────────────────────────────────────

  {
    id: 'CDX-001',
    name: 'Market Pulse',
    role: 'Research Squad Leader & Market Data Collector',
    squad: 'RESEARCH',
    description: 'Continuously pulls market data from MLS feeds, county property appraiser databases, and real estate analytics platforms across Martin, St. Lucie, and Indian River counties. Aggregates pricing trends, days-on-market, inventory levels, and absorption rates. Feeds data to INT division and content pipeline.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['daily-market-scan', 'mls-data-refresh', 'county-records-update'],
    outputs: ['market-report', 'pricing-trend-data', 'inventory-snapshot'],
    reportsTo: 'MCCO-000',
    kpis: ['data_freshness_hours', 'markets_covered', 'reports_generated_weekly'],
  },

  {
    id: 'CDX-002',
    name: 'Channel Scanner',
    role: 'YouTube & Video Platform Intelligence Analyst',
    squad: 'RESEARCH',
    description: 'Scrubs and scans YouTube channels in the home watch, property management, and real estate software development industries. Tracks competitor content strategies, engagement metrics, trending topics, and content gaps. Identifies high-performing formats and hooks for Coastal Key content replication.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['daily-channel-scan', 'competitor-upload-detected', 'trending-topic-alert'],
    outputs: ['channel-analysis-report', 'content-gap-map', 'competitor-engagement-metrics'],
    reportsTo: 'CDX-001',
    kpis: ['channels_monitored', 'gaps_identified_weekly', 'trend_detection_accuracy'],
  },

  {
    id: 'CDX-003',
    name: 'Web Sentinel',
    role: 'Website & Digital Presence Scanner',
    squad: 'RESEARCH',
    description: 'Continuously scans competitor websites, proptech platforms, home watch industry portals, and real estate SaaS products. Tracks feature releases, pricing changes, service expansions, and technology adoption. Maps the competitive landscape for Coastal Key strategic positioning.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['daily-web-scan', 'competitor-site-change', 'new-entrant-detected'],
    outputs: ['competitive-landscape-report', 'feature-comparison-matrix', 'pricing-benchmark'],
    reportsTo: 'CDX-001',
    kpis: ['sites_monitored', 'changes_detected_weekly', 'intelligence_reports_generated'],
  },

  {
    id: 'CDX-004',
    name: 'Data Harvester',
    role: 'Multi-Source Data Collection Specialist',
    squad: 'RESEARCH',
    description: 'Pulls structured data from public APIs, government databases, ArcGIS parcel data, census records, permit databases, and industry reports. Normalizes and stages data for analysis by INT division agents. Maintains data freshness SLA of 24 hours for critical sources.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['scheduled-harvest', 'source-update-detected', 'manual-harvest-request'],
    outputs: ['structured-dataset', 'source-freshness-report', 'data-quality-score'],
    reportsTo: 'CDX-001',
    kpis: ['sources_active', 'records_harvested_daily', 'data_freshness_sla_met'],
  },

  // ── SCAN Squad ─────────────────────────────────────────────────────────────

  {
    id: 'CDX-005',
    name: 'Gap Detector',
    role: 'Market Gap & Content Opportunity Identifier',
    squad: 'SCAN',
    description: 'Analyzes collected research data to identify gaps in the property management and home services market that Coastal Key can fill. Cross-references competitor offerings against Coastal Key capabilities to surface unmet demand. Generates content briefs targeting identified gaps.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['research-data-updated', 'weekly-gap-analysis', 'competitor-weakness-detected'],
    outputs: ['gap-analysis-report', 'content-brief', 'opportunity-score-card'],
    reportsTo: 'CDX-001',
    kpis: ['gaps_identified_monthly', 'content_briefs_generated', 'opportunity_conversion_rate'],
  },

  {
    id: 'CDX-006',
    name: 'Trend Tracker',
    role: 'Industry Trend & Emerging Technology Monitor',
    squad: 'SCAN',
    description: 'Monitors proptech innovation, AI adoption in property management, smart home technology, regulatory changes, and insurance industry shifts. Scans industry publications, patent filings, VC funding rounds, and conference agendas. Provides early-warning intelligence on market shifts.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['daily-trend-scan', 'funding-round-detected', 'regulation-change-alert'],
    outputs: ['trend-briefing', 'technology-radar', 'regulatory-impact-assessment'],
    reportsTo: 'CDX-001',
    kpis: ['trends_tracked', 'early_warnings_issued', 'briefings_delivered_weekly'],
  },

  {
    id: 'CDX-007',
    name: 'SEO Recon',
    role: 'Search Engine & Keyword Intelligence Operative',
    squad: 'SCAN',
    description: 'Scans search engine rankings, keyword opportunities, and content performance across property management, home watch, and Treasure Coast real estate verticals. Identifies high-intent keywords with low competition. Feeds SEO intelligence to MKT division content pipeline.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['weekly-seo-scan', 'ranking-change-detected', 'new-keyword-opportunity'],
    outputs: ['keyword-opportunity-report', 'ranking-tracker', 'content-optimization-brief'],
    reportsTo: 'CDX-001',
    kpis: ['keywords_tracked', 'opportunities_surfaced_weekly', 'ranking_improvements'],
  },

  // ── INTEGRITY Squad ────────────────────────────────────────────────────────

  {
    id: 'CDX-008',
    name: 'Data Doctor',
    role: 'Data Integrity & Corruption Detection Specialist',
    squad: 'INTEGRITY',
    description: 'Continuously scans all Airtable tables, JSON data stores, and KV namespaces for corrupted, incomplete, or inconsistent records. Detects schema drift, orphaned records, broken relationships, and data type mismatches. Auto-repairs where safe, flags for human review when ambiguous.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['hourly-integrity-scan', 'write-operation-complete', 'anomaly-detected'],
    outputs: ['integrity-report', 'repair-log', 'anomaly-alert'],
    reportsTo: 'CDX-001',
    kpis: ['tables_scanned_daily', 'corruptions_detected', 'auto_repairs_successful'],
  },

  {
    id: 'CDX-009',
    name: 'Pipeline Guardian',
    role: 'End-to-End System Health Validator',
    squad: 'INTEGRITY',
    description: 'Validates the complete data pipeline from lead capture through content delivery. Tests every integration point: Airtable CRUD, Slack notifications, Retell AI campaigns, Claude AI publishing, Stripe payments, and email delivery. Runs synthetic transactions to verify end-to-end flow.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['scheduled-health-check', 'integration-error-detected', 'deploy-complete'],
    outputs: ['pipeline-health-report', 'integration-status-matrix', 'synthetic-test-results'],
    reportsTo: 'CDX-001',
    kpis: ['pipelines_validated_daily', 'uptime_percentage', 'mean_time_to_detect'],
  },

  {
    id: 'CDX-010',
    name: 'System Forge',
    role: 'System Build & Deployment Integrity Officer',
    squad: 'INTEGRITY',
    description: 'Monitors CI/CD pipeline health, deployment success rates, test suite coverage, and build artifact integrity. Validates that every push to main produces a clean, fully operational deployment across all 6 services. Tracks configuration drift between environments.',
    division: 'CDX',
    tier: 'advanced',
    status: 'active',
    triggers: ['deploy-triggered', 'test-failure-detected', 'config-drift-alert'],
    outputs: ['deployment-audit', 'test-coverage-report', 'config-drift-analysis'],
    reportsTo: 'CDX-001',
    kpis: ['deploy_success_rate', 'test_pass_rate', 'config_drift_incidents'],
  },
];
