# Coastal Key Enterprise — Technical Strategy & 6-Month Execution Plan

**Document:** CK-STRAT-2026-Q2
**Classification:** Executive — CTO Office
**Effective Date:** 2026-04-03
**Last Updated:** 2026-04-08
**Review Cycle:** Monthly

---

## Vision

Coastal Key Property Management operates the most technically advanced AI-powered property management platform on Florida's Treasure Coast. Every manual process is automated. Every client interaction is intelligent. Every decision is data-driven. Within 6 months, CKPM achieves operational capability that competitors will not replicate in 5 years.

---

## Current Platform State (Audit: 2026-04-03)

### Infrastructure Deployed

| System | Stack | Status | Routes/Endpoints |
|---|---|---|---|
| API Gateway | Cloudflare Worker | Production | 47 routes under `/v1/` |
| Sentinel Webhook | Cloudflare Worker | Production | Retell → Airtable → Slack |
| Command Center | Cloudflare Pages | Production | 290-agent fleet dashboard |
| Website | Cloudflare Pages | Production | coastalkey-pm.com |
| CI/CD | GitHub Actions | Hardened (npm ci, lockfile, cache) | Test → Deploy (3 services) |

### AI Agent Fleet: 290 Agents, 9 Divisions

| Division | Code | Agents | Function |
|---|---|---|---|
| Executive | EXC | 30 | C-suite strategy, board reporting |
| Sentinel Sales | SEN | 40 | Retell AI outbound call center |
| Operations | OPS | 30 | Property management, maintenance |
| Intelligence | INT | 50 | Market research, competitive intel |
| Marketing | MKT | 30 | Content, social, email, SEO |
| Finance | FIN | 30 | Revenue, investor relations |
| Vendor Mgmt | VEN | 20 | Compliance, procurement |
| Technology | TEC | 20 | Platform ops, API, monitoring |
| Web Dev | WEB | 40 | Frontend, architecture |

### Workflow Pipeline Status

| Workflow | Name | Status | Automation Level |
|---|---|---|---|
| SCAA-1 | Battle Plan Pipeline | Live | Full (AI inference → Airtable → Slack) |
| WF-2 | Social Approval → Buffer | Code complete, CI/CD hardened, PR created, test record primed (Approved), Canva asset attached, Deployment Tracker Complete. Pending: Buffer account + `BUFFER_ACCESS_TOKEN` secret. | Full (4-channel: IG, FB, LI, X) |
| WF-3 | Investor Escalation | Live | Full (AI → presentation → task → email payload) |
| WF-4 | Long-Tail Nurture | Live | Partial (Constant Contact payload prepared, not sent) |
| WF-1 | Not built | Gap | — |
| WF-5+ | Not built | Gap | — |

### Airtable Schema: 43 Tables

Fully wired across Sales, Operations, Intelligence, Content, Campaign, and Financial domains. All table IDs verified against live schema.

---

## 6-Month Execution Plan (April — September 2026)

### Month 1: Foundation Lock (April)

**Objective:** Complete WF-2 deployment, close all open gaps, establish velocity baseline.

| # | Action | Owner | Dependency | Target |
|---|---|---|---|---|
| 1.1 | Create Buffer account + connect 4 channels | CEO | None | Week 1 |
| 1.2 | Set BUFFER_ACCESS_TOKEN secret | TEC | 1.1 | Week 1 |
| 1.3 | Deploy ck-api-gateway with WF-2 | TEC | 1.2 | Week 1 |
| 1.4 | Build WF-2 Zap in Zapier | TEC | 1.1 | Week 1 |
| 1.5 | E2E test WF-2 pipeline (rechVm1hmggAvfvXp) | TEC | 1.3, 1.4 | Week 1 |
| 1.6 | Merge PR #5 to main | TEC | 1.5 | Week 1 |
| 1.7 | Build WF-1: New Lead → Onboarding Sequence | TEC | None | Week 2 |
| 1.8 | Build WF-5: Content Calendar Auto-Generation | TEC/MKT | None | Week 3 |
| 1.9 | Activate Constant Contact send in WF-4 | TEC | CC API key | Week 3 |
| 1.10 | Decommission ck-nemotron-worker stale build | TEC | None | Week 1 |

### Month 2: Revenue Engine (May)

**Objective:** Automate pricing intelligence and investor pipeline to close deals faster.

| # | Action | Owner | Target |
|---|---|---|---|
| 2.1 | Dynamic pricing engine v2: real-time comp data feeds | TEC/INT | Week 5 |
| 2.2 | Automated investor deck generation (PDF via Claude) | TEC/FIN | Week 6 |
| 2.3 | WF-6: Lease renewal prediction + auto-outreach | TEC/OPS | Week 7 |
| 2.4 | Retell campaign optimization: A/B test agent prompts | SEN | Week 6-8 |
| 2.5 | Property valuation API integration (Zillow/Redfin) | INT | Week 7 |

### Month 3: Operations Automation (June)

**Objective:** Zero-touch maintenance dispatch and guest experience.

| # | Action | Owner | Target |
|---|---|---|---|
| 3.1 | WF-7: Maintenance request → vendor auto-dispatch | TEC/OPS | Week 9 |
| 3.2 | Guest check-in/check-out automation (SMS + email) | TEC/OPS | Week 10 |
| 3.3 | Inspection scheduling + photo documentation pipeline | TEC/OPS | Week 11 |
| 3.4 | Storm protocol automation (FEMA alerts → property lockdown) | TEC/OPS | Week 12 |
| 3.5 | Vendor compliance scoring + auto-renewal/termination | TEC/VEN | Week 11 |

### Month 4: Intelligence Dominance (July)

**Objective:** Market intelligence that outpaces every competitor on the Treasure Coast.

| # | Action | Owner | Target |
|---|---|---|---|
| 4.1 | Intelligence Officer fleet activation (50 officers scanning) | INT | Week 13 |
| 4.2 | Competitive intel dashboard with real-time market data | INT/TEC | Week 14 |
| 4.3 | Property intelligence: ArcGIS parcel import automation | INT/TEC | Week 15 |
| 4.4 | Predictive analytics: occupancy forecasting model | INT/FIN | Week 16 |
| 4.5 | SEO competitor analysis + content gap automation | MKT/INT | Week 15 |

### Month 5: Scale & Integration (August)

**Objective:** Multi-property portfolio management at institutional scale.

| # | Action | Owner | Target |
|---|---|---|---|
| 5.1 | Portfolio dashboard: unified view across all properties | TEC | Week 17 |
| 5.2 | Owner portal: real-time property status + financials | TEC/WEB | Week 18 |
| 5.3 | Multi-channel notification hub (SMS, email, Slack, push) | TEC | Week 19 |
| 5.4 | Financial reporting automation (P&L, cash flow per property) | FIN/TEC | Week 20 |
| 5.5 | API gateway rate limiting + tenant isolation for multi-org | TEC | Week 19 |

### Month 6: Market Leadership (September)

**Objective:** Public-facing AI capabilities that establish CKPM as the industry benchmark.

| # | Action | Owner | Target |
|---|---|---|---|
| 6.1 | AI-powered property assessment tool (public-facing) | TEC/MKT | Week 21 |
| 6.2 | Automated quarterly investor reports | FIN/TEC | Week 22 |
| 6.3 | Podcast production pipeline: auto-outline → record → publish | MKT/TEC | Week 22 |
| 6.4 | Video production pipeline: script → B-roll list → schedule | MKT/TEC | Week 23 |
| 6.5 | Platform security audit + SOC 2 preparation | TEC | Week 24 |
| 6.6 | TH Sentinel campaign retrospective + next campaign launch | SEN/EXC | Week 24 |

---

## Architecture Principles

1. **Workers-first** — Every automation runs on Cloudflare Workers at the edge. Sub-50ms response times. Zero cold starts. Zero server management.

2. **Airtable as system of record** — All business data flows through Airtable. 43 tables, verified field IDs, typecast-enabled writes. Single source of truth.

3. **Claude as inference engine** — All AI-generated content (battle plans, investor decks, email copy, social posts, pricing recommendations) flows through the `/v1/inference` endpoint with KV caching.

4. **Buffer as social distribution** — Four-channel automated publishing (Instagram, Facebook, LinkedIn, X). Content Calendar Status field drives the entire pipeline.

5. **Slack as command channel** — Every workflow fires Slack notifications. Human-in-the-loop for high-stakes decisions. AI-in-the-loop for everything else.

6. **Test everything, deploy automatically** — Node.js built-in test runner. GitHub Actions CI/CD. `npm ci` with lockfile. Every push to main deploys all three services.

---

## Key Metrics (6-Month Targets)

| Metric | Current | Month 6 Target |
|---|---|---|
| Automated workflows | 4 (SCAA-1, WF-2, WF-3, WF-4) | 12+ |
| Social posts published/month | 0 (manual) | 60+ (automated) |
| Lead response time | Hours | < 5 minutes |
| Properties under AI management | Pilot | 50+ |
| Maintenance dispatch automation | 0% | 90% |
| Investor deck generation | Manual | Fully automated |
| Test coverage (gateway) | 35 tests | 100+ tests |
| API endpoints | 47 | 80+ |
| Monthly Retell calls (TH Sentinel) | 57,600 | 57,600 (maintained) |

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Buffer API rate limits on high-volume posting | Medium | Medium | Implement queue with backoff; schedule posts in advance |
| Airtable record limits (50K/base) | Low | High | Archive strategy; split historical data to secondary base |
| Retell campaign cost overrun | Medium | Medium | Daily KPI monitoring via campaign dashboard |
| Cloudflare Workers CPU time limits | Low | High | Optimize inference caching; offload heavy computation |
| Key person dependency (single developer) | High | Critical | Comprehensive documentation; CLAUDE.md as living spec |

---

## Governance

- **Weekly sprint review:** TEC division reports to CTO on velocity, blockers, deploys
- **Monthly strategic review:** All division heads align on 6-month plan progress
- **Deployment Tracker:** Airtable `tblGkLHXDiUkKttXq` — every build tracked with spec, status, dependencies
- **Audit trail:** Every AI inference, workflow execution, and system event logged to KV + Airtable AI_LOG
- **Branch strategy:** Feature branches → PR with CI → merge to main → auto-deploy
