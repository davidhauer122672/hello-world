/**
 * AI Agent SOPs — Standard Operating Procedures for all 290+ agents.
 *
 * Each division has codified instructions, fiduciary accountability standards,
 * performance KPIs, and nonstop production mandates. SOPs are enforced at runtime
 * via the gateway and logged to the AI Log table.
 *
 * Divisions: EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB
 */

// ── Division SOP Definitions ──

export const DIVISION_SOPS = {
  EXC: {
    division: 'Executive Command',
    code: 'EXC',
    mandate: 'Strategic oversight, decision orchestration, and enterprise governance.',
    sops: [
      {
        id: 'EXC-SOP-001',
        title: 'Executive Decision Pipeline',
        instructions: [
          'Monitor all division dashboards every 15 minutes for anomalies.',
          'Escalate any revenue-impacting issue within 5 minutes of detection.',
          'Generate daily executive briefing by 0600 EST from all division reports.',
          'Approve or flag all expenditures exceeding $500 threshold.',
          'Maintain real-time P&L awareness across all business units.',
        ],
        kpis: ['Decision latency < 5min', 'Briefing accuracy > 99%', 'Escalation response < 2min'],
        fiduciary: 'Full fiduciary accountability for enterprise resource allocation. All decisions must maximize ROI and minimize risk exposure. Zero tolerance for uninformed decisions.',
        production: '24/7 monitoring. No downtime. Failover to backup executive agent within 30 seconds.',
      },
      {
        id: 'EXC-SOP-002',
        title: 'Cross-Division Coordination',
        instructions: [
          'Synchronize all division outputs into unified enterprise view.',
          'Resolve inter-division conflicts within 10 minutes.',
          'Ensure all agents are operating at peak capacity — flag underperformers.',
          'Conduct hourly fleet health checks across all 290 agents.',
        ],
        kpis: ['Fleet uptime > 99.9%', 'Conflict resolution < 10min', 'Agent utilization > 85%'],
        fiduciary: 'Accountable for total enterprise productivity. Any agent downtime directly impacts revenue.',
        production: 'Continuous coordination loop. Never idle.',
      },
    ],
  },

  SEN: {
    division: 'Sentinel Sales',
    code: 'SEN',
    mandate: 'Lead acquisition, qualification, conversion, and revenue generation.',
    sops: [
      {
        id: 'SEN-SOP-001',
        title: 'Lead Processing Pipeline',
        instructions: [
          'Process every new lead within 60 seconds of creation in Airtable.',
          'Run SCAA-1 Battle Plan for all Retell and Website leads automatically.',
          'Score every lead using AI predictive model — assign tier (Hot/Warm/Cold).',
          'Route Hot leads to human closer with full battle plan within 5 minutes.',
          'Enroll Cold leads in WF-4 Long-Tail Nurture automatically.',
          'Flag Investor leads for WF-3 Investor Escalation immediately.',
        ],
        kpis: ['Lead response time < 60s', 'Conversion rate > 15%', 'Battle plan generation < 30s', 'Zero leads unprocessed > 5min'],
        fiduciary: 'Every lead represents revenue. Missed leads = lost revenue. Accountable for pipeline value.',
        production: '24/7 lead intake. Zero queue backlog. Process during peak hours at 3x normal throughput.',
      },
      {
        id: 'SEN-SOP-002',
        title: 'Outbound Campaign Execution',
        instructions: [
          'Execute TH Sentinel campaign sequences on schedule — no delays.',
          'Personalize every outreach using lead data + AI content generation.',
          'Track call dispositions and adjust strategy in real-time.',
          'Report campaign analytics to EXC division every 4 hours.',
          'A/B test messaging variants and promote winners automatically.',
        ],
        kpis: ['Contact rate > 40%', 'Meeting set rate > 8%', 'Campaign ROI > 300%'],
        fiduciary: 'Campaign budget accountability. Every dollar spent must generate measurable pipeline.',
        production: 'Continuous outreach during business hours. Nurture sequences run 24/7.',
      },
    ],
  },

  OPS: {
    division: 'Operations',
    code: 'OPS',
    mandate: 'Property operations, maintenance, guest services, and vendor management.',
    sops: [
      {
        id: 'OPS-SOP-001',
        title: 'Property Operations Automation',
        instructions: [
          'Monitor all maintenance requests — auto-assign to nearest qualified vendor.',
          'Track inspection schedules — generate reminders 48 hours in advance.',
          'Process guest feedback within 2 hours — escalate negative reviews immediately.',
          'Maintain vendor compliance records — flag expired licenses/insurance.',
          'Generate weekly property condition reports for each managed unit.',
        ],
        kpis: ['Maintenance response < 4hrs', 'Guest satisfaction > 4.5/5', 'Vendor compliance 100%', 'Inspection completion rate 100%'],
        fiduciary: 'Property value preservation is paramount. Deferred maintenance = depreciation = fiduciary breach.',
        production: 'Maintenance intake 24/7. Inspections scheduled 7 days/week. Never defer critical repairs.',
      },
      {
        id: 'OPS-SOP-002',
        title: 'Concierge & Guest Experience',
        instructions: [
          'Respond to all concierge requests within 15 minutes.',
          'Pre-stage welcome packages 24 hours before guest arrival.',
          'Coordinate with local service providers for premium experiences.',
          'Track and fulfill special requests with confirmation to guest.',
          'Post-stay follow-up within 24 hours of checkout.',
        ],
        kpis: ['Response time < 15min', 'Request fulfillment rate > 95%', 'Repeat booking rate > 30%'],
        fiduciary: 'Guest experience directly impacts revenue through reviews and repeat bookings.',
        production: 'Concierge available 24/7. Premium service standard at all times.',
      },
    ],
  },

  INT: {
    division: 'Intelligence',
    code: 'INT',
    mandate: 'Market intelligence, competitive analysis, data collection, and strategic insights.',
    sops: [
      {
        id: 'INT-SOP-001',
        title: 'Market Intelligence Operations',
        instructions: [
          'Scan competitive landscape every 6 hours — track pricing, listings, reviews.',
          'Monitor Treasure Coast real estate market indicators daily.',
          'Generate competitive intelligence briefs for EXC division weekly.',
          'Track regulatory changes (FEMA, building codes, HOA) affecting operations.',
          'Identify acquisition opportunities based on market distress signals.',
          'Feed market data to MKT division for content generation.',
        ],
        kpis: ['Intel freshness < 6hrs', 'Competitive coverage > 95%', 'Threat detection < 1hr'],
        fiduciary: 'Information asymmetry is competitive advantage. Stale intelligence = strategic risk.',
        production: 'Continuous scanning. All 50 Intelligence Officers operating in parallel.',
      },
      {
        id: 'INT-SOP-002',
        title: 'Financial Market Monitoring',
        instructions: [
          'Monitor REIT sector, property tech, and hospitality stocks continuously.',
          'Track economic indicators: mortgage rates, unemployment, CPI, housing starts.',
          'Generate market alerts when watchlist stocks move > 5% intraday.',
          'Produce daily market intelligence report by 0700 EST.',
          'Correlate market movements with local real estate conditions.',
        ],
        kpis: ['Market data latency < 5min', 'Alert delivery < 30s', 'Report accuracy > 98%'],
        fiduciary: 'Investment decisions depend on accurate, timely market data. Errors have financial consequences.',
        production: 'Market hours: continuous monitoring. After hours: scan for overnight developments.',
      },
    ],
  },

  MKT: {
    division: 'Marketing',
    code: 'MKT',
    mandate: 'Content creation, social media, brand management, and demand generation.',
    sops: [
      {
        id: 'MKT-SOP-001',
        title: 'Content Pipeline Operations',
        instructions: [
          'Execute WF-2 Content Engagement Pipeline for all scheduled content.',
          'Generate AI content via Claude + Banana Pro for every Content Calendar entry.',
          'Schedule all content to Buffer for multi-platform publishing.',
          'Maintain content calendar 30 days in advance at all times.',
          'A/B test headlines and CTAs — promote top performers.',
          'Sync Buffer analytics back to Airtable every 6 hours.',
          'Ensure brand consistency across all platforms — luxury-professional tone.',
        ],
        kpis: ['Content calendar fill rate > 95%', 'Engagement rate > 3%', 'Content production 5+ posts/day', 'Brand compliance 100%'],
        fiduciary: 'Marketing spend must generate measurable pipeline. Track CAC and ROAS for every campaign.',
        production: 'Content pipeline runs 24/7. Social scheduling runs on optimal posting times.',
      },
      {
        id: 'MKT-SOP-002',
        title: 'Community & Alignable Engagement',
        instructions: [
          'Execute WF-4 Alignable branch for all leads matching local businesses.',
          'Maintain active presence on Alignable — 3+ community interactions daily.',
          'Generate local business partnership opportunities weekly.',
          'Track community engagement metrics and report to EXC.',
          'Coordinate with SEN division on community-sourced leads.',
        ],
        kpis: ['Community interactions > 3/day', 'Partnership leads > 2/week', 'Alignable response rate > 80%'],
        fiduciary: 'Community engagement is long-term brand equity investment.',
        production: 'Daily community engagement. Weekly partnership outreach.',
      },
    ],
  },

  FIN: {
    division: 'Finance',
    code: 'FIN',
    mandate: 'Financial operations, accounting, portfolio management, and compliance.',
    sops: [
      {
        id: 'FIN-SOP-001',
        title: 'Financial Operations Automation',
        instructions: [
          'Process all invoices within 24 hours of receipt.',
          'Reconcile accounts daily — flag discrepancies immediately.',
          'Generate owner statements by the 5th of each month.',
          'Track portfolio performance metrics: NOI, cap rate, cash-on-cash.',
          'Maintain trust account compliance — zero commingling tolerance.',
          'Forecast cash flow 90 days out with weekly updates.',
        ],
        kpis: ['Invoice processing < 24hrs', 'Reconciliation accuracy 100%', 'Statement delivery by 5th', 'Forecast accuracy > 90%'],
        fiduciary: 'ABSOLUTE fiduciary accountability. Trust account compliance is non-negotiable. Any violation triggers immediate alert to EXC.',
        production: 'Financial processing runs continuously. Month-end close within 3 business days.',
      },
      {
        id: 'FIN-SOP-002',
        title: 'Investment & Market Operations',
        instructions: [
          'Monitor portfolio positions using market intelligence feeds.',
          'Generate portfolio alerts when positions breach defined thresholds.',
          'Calculate and report investment performance metrics daily.',
          'Coordinate with INT division on market-driven investment decisions.',
          'Maintain compliance with all regulatory reporting requirements.',
        ],
        kpis: ['Portfolio monitoring 24/7', 'Alert delivery < 1min', 'Regulatory compliance 100%'],
        fiduciary: 'Investment decisions carry direct financial liability. All actions must be documented and auditable.',
        production: 'Market hours: active monitoring. After hours: position risk assessment.',
      },
    ],
  },

  VEN: {
    division: 'Ventures',
    code: 'VEN',
    mandate: 'Business development, partnerships, acquisitions, and growth initiatives.',
    sops: [
      {
        id: 'VEN-SOP-001',
        title: 'Business Development Pipeline',
        instructions: [
          'Identify and qualify acquisition targets using INT division data.',
          'Generate partnership proposals via AI — personalized to prospect.',
          'Track deal pipeline from initial contact through close.',
          'Coordinate with FIN on due diligence and financial modeling.',
          'Present opportunities to EXC with full ROI analysis.',
        ],
        kpis: ['Pipeline value > $1M', 'Deal velocity < 90 days', 'Qualification accuracy > 80%'],
        fiduciary: 'Every venture must clear financial hurdle rate. No speculative investments without EXC approval.',
        production: 'Continuous deal sourcing. Weekly pipeline reviews.',
      },
    ],
  },

  TEC: {
    division: 'Technology',
    code: 'TEC',
    mandate: 'Platform engineering, system reliability, AI infrastructure, and cybersecurity.',
    sops: [
      {
        id: 'TEC-SOP-001',
        title: 'Platform Reliability Operations',
        instructions: [
          'Monitor all Cloudflare Workers — target 99.99% uptime.',
          'Run system diagnostics every 30 minutes.',
          'Auto-heal degraded services within 60 seconds.',
          'Deploy updates with zero-downtime rolling deployments.',
          'Maintain KV store health — garbage collect expired keys weekly.',
          'Monitor API latency — alert if p95 exceeds 500ms.',
        ],
        kpis: ['Uptime > 99.99%', 'p95 latency < 500ms', 'Auto-heal success > 95%', 'Deploy success rate 100%'],
        fiduciary: 'Platform downtime = revenue loss. Every minute of downtime is accountable.',
        production: '24/7 monitoring. Zero tolerance for unplanned outages.',
      },
      {
        id: 'TEC-SOP-002',
        title: 'AI Infrastructure Management',
        instructions: [
          'Manage Claude API integration — optimize token usage and caching.',
          'Manage Banana Pro AI models — monitor inference latency and quality.',
          'Maintain Buffer API integration health.',
          'Ensure all API keys and secrets are rotated per security policy.',
          'Monitor rate limits across all external APIs — preemptive throttling.',
        ],
        kpis: ['API success rate > 99.5%', 'Cache hit rate > 60%', 'Secret rotation compliance 100%'],
        fiduciary: 'AI infrastructure costs are variable. Optimize spend while maintaining quality.',
        production: 'All AI services monitored continuously. Failover enabled.',
      },
    ],
  },

  WEB: {
    division: 'Web Development',
    code: 'WEB',
    mandate: 'Website development, UI/UX, digital presence, and conversion optimization.',
    sops: [
      {
        id: 'WEB-SOP-001',
        title: 'Digital Presence Operations',
        instructions: [
          'Monitor website uptime and performance — Core Web Vitals compliance.',
          'A/B test landing pages — optimize conversion rate continuously.',
          'Ensure mobile responsiveness across all pages.',
          'Update property listings within 1 hour of Airtable changes.',
          'Maintain SEO optimization — track keyword rankings weekly.',
        ],
        kpis: ['Page load < 2s', 'Conversion rate > 5%', 'Mobile score > 90', 'SEO ranking improvements monthly'],
        fiduciary: 'Website is primary lead generation channel. Performance directly impacts revenue.',
        production: 'Continuous optimization. Weekly deployment cycles.',
      },
    ],
  },
};

/**
 * Get SOP for a specific division.
 * @param {string} divisionCode
 * @returns {object|null}
 */
export function getDivisionSOP(divisionCode) {
  return DIVISION_SOPS[divisionCode.toUpperCase()] || null;
}

/**
 * Get all SOPs across all divisions.
 * @returns {object[]}
 */
export function getAllSOPs() {
  return Object.values(DIVISION_SOPS);
}

/**
 * Get specific SOP by ID (e.g., 'SEN-SOP-001').
 * @param {string} sopId
 * @returns {object|null}
 */
export function getSOPById(sopId) {
  for (const division of Object.values(DIVISION_SOPS)) {
    const sop = division.sops.find(s => s.id === sopId);
    if (sop) return { division: division.division, code: division.code, ...sop };
  }
  return null;
}

/**
 * Get fleet-wide production summary.
 * @returns {object}
 */
export function getFleetProductionMandate() {
  const totalSOPs = Object.values(DIVISION_SOPS).reduce((sum, d) => sum + d.sops.length, 0);
  const totalKPIs = Object.values(DIVISION_SOPS).reduce(
    (sum, d) => sum + d.sops.reduce((s2, sop) => s2 + sop.kpis.length, 0), 0
  );

  return {
    divisions: Object.keys(DIVISION_SOPS).length,
    totalSOPs,
    totalKPIs,
    mandate: 'Nonstop production. Zero idle agents. Every agent accountable to its division SOP. Fiduciary responsibility enforced at every level. Ferrari-standard precision across all operations.',
    standards: {
      uptime: '99.99%',
      responseTime: '< 60 seconds for all automated processes',
      fiduciary: 'Full accountability — every decision auditable',
      production: '24/7/365 — no downtime, no excuses',
    },
  };
}
