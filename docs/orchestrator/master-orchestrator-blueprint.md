# Coastal Key Master Orchestrator — Operational Blueprint

**Version**: 1.0.0
**Effective**: 2026-04-17
**Classification**: Production Deployment Blueprint
**Authority**: Coastal Key AI CEO (per `CLAUDE.md`) routed through Master Orchestrator (per `ORCHESTRATOR.md` v2.1.0)
**Target Market**: Luxury Home Watch & Property Management — Martin, St. Lucie, Indian River Counties (Treasure Coast, FL)
**Operating Model**: Founder-Invisible, Zero-Intervention for operations under risk thresholds

---

## 1. Mission & Market Thesis

Capitalize on the 2026 Treasure Coast gap in high-end Home Watch and Predictive Property Management by operating an autonomous agent fleet that monitors, maintains, acquires, and reports — executing at Ferrari precision with zero preventable incidents and sub-$20/month tooling wherever automation is viable.

**Market Gap Signals (2026)**:
- Stabilizing home prices ($383K–$430K) with rising insurance carrier scrutiny
- Absentee owners and snowbirds demanding predictive (not reactive) home watch
- Incumbent property managers still reliant on manual 47-point inspections
- IoT telemetry + agentic AI narrows inspection cadence from weekly to continuous

**Core Constraint**: No action may exceed financial or reputational risk thresholds without Human-in-the-Loop (HITL) approval. See Section 6.

---

## 2. Master Orchestrator — Logic Flow

### 2.1 Role
The Master Orchestrator is the sovereign task router. It accepts inbound events from every channel (sensors, CRM, email, RPC, schedulers), classifies each by **Priority** and **Risk**, and dispatches to the correct sub-agent with a signed directive envelope.

### 2.2 Priority × Risk Matrix

| Priority | Risk Class | Routing Behavior |
|----------|------------|------------------|
| P0 — Critical | R3 — Existential | Sentry-Agent immediate dispatch + HITL page + Slack `#security-alerts` |
| P1 — High | R2 — Material | Sentry or Ledger dispatch; HITL required if financial >$5K |
| P2 — Standard | R1 — Bounded | Autonomous execution; daily audit log only |
| P3 — Opportunistic | R0 — Negligible | Acquisition-Agent queue; weekly review |

### 2.3 Decision Tree (Pseudo)

```text
on_event(e):
  e.classify(priority, risk)
  validate_against_governance(e)          # 4 Core Goals filter
  if e.risk >= R2 and e.financial_value > 5000:
    require_HITL_approval(e)               # blocks until approval
  agent = route(e.domain)                  # Sentry | Ledger | Acquisition | Report
  rate_limit.check(agent, e)               # token bucket per Section 5
  envelope = sign(e, ORCHESTRATOR_KEY)
  dispatch(agent, envelope)
  audit.log(e, agent, outcome)
```

### 2.4 Governance Validation (Every Dispatch)

Every event is checked against the 4 Core Goals (`ORCHESTRATOR.md`):
1. Launch & Scale Automation (75%+ automated)
2. Risk Mitigation Supremacy (Zero preventable incidents)
3. Financial Engine (40%+ gross margin by Month 12)
4. Market Gap Domination (8% Treasure Coast seasonal by EOY 2027)

A dispatch that fails any goal validation is quarantined to `orchestrator.quarantine` and surfaced in the CEO Daily Standup.

---

## 3. Agent Suite (Coastal Key Fleet — Blueprint Layer)

### 3.1 Orchestrator Dashboard (UI)
Central operator view consuming `/v1/orchestrator/*` endpoints. Surfaces: fleet status, active directives, risk queue, HITL pending, NOI trend, gap-capture rate.

**Technology**: Cloudflare Pages (existing `ck-command-center`). New route `/orchestrator` renders live dashboard from the engine in `ck-api-gateway/src/engines/master-prompt-v21.js`.

### 3.2 Sentry-Agent — Property Guardian
**Domain**: Real-time telemetry + autonomous maintenance dispatch.
**Inputs**: IoT sensors (water, humidity, temperature, door/window contact, power), weather API, Retell call escalations.
**Outputs**: Work orders to vetted vendors, owner notifications, insurance documentation packets.
**Kill Switch**: Any dispatch >$5,000 or involving structural/electrical work → HITL.

### 3.3 Ledger-Agent — Financial Compliance
**Domain**: Bill-pay, multi-LLC accounting, tax compliance, receipt capture.
**Inputs**: Stripe webhooks, vendor invoices (via email ingestion), bank feeds, Airtable FIN table.
**Outputs**: Paid invoices, general-ledger entries, quarterly tax provisions, LLC-segregated P&L.
**Kill Switch**: Any outbound transfer >$5,000, any inter-LLC transfer, any new vendor without prior onboarding → HITL.

### 3.4 Acquisition-Agent — HNW Lead Generation
**Domain**: Scraping and enrichment of high-net-worth Treasure Coast property data; outbound sequencing.
**Inputs**: Public property records, MLS feeds, luxury listing portals, PropStream/BatchLeads compatible sources.
**Outputs**: Enriched lead records to Airtable `leads`, nurture enrollment into Drip Engine, SEN division queue.
**Kill Switch**: >100 outbound contacts/day or any unverified source → HITL. Respects robots.txt, rate limits, and CAN-SPAM.

### 3.5 Report-Agent — Owner Storytelling
**Domain**: Weekly AI-narrated video + PDF updates per property.
**Inputs**: Sentry telemetry deltas, completed work orders, photo/video evidence, market data.
**Outputs**: Delivered to owner via email + SMS + portal; archived to insurance-grade evidence vault.
**Kill Switch**: Any unresolved P0 event on the property blocks report send until resolved or HITL-overridden.

---

## 4. Project Folder Structure (Claude-Compatible)

```
coastal-key-enterprise/
├── CLAUDE.md                              # AI CEO Operating Authority (existing)
├── ORCHESTRATOR.md                        # Master System Prompt v2.1 (existing)
├── systems-manifest.json                  # Canonical system inventory (existing)
├── docs/
│   ├── orchestrator/
│   │   ├── master-orchestrator-blueprint.md       # THIS FILE
│   │   ├── agent-communication-schemas.json       # Cross-agent JSON schemas
│   │   └── trigger-action-sequences.md            # Property-management playbooks
│   ├── governance-metrics-tracker.md
│   ├── ops-flowchart-raci.md
│   ├── retail-blueprint.md
│   └── phase-status-dashboard.md
├── ck-api-gateway/                        # 147-endpoint central API (existing)
│   └── src/engines/master-prompt-v21.js   # Runtime engine
├── ck-command-center/                     # Dashboard UI (existing)
├── sentinel-webhook/                      # Retell call pipeline (existing)
└── th-sentinel-campaign/                  # Retell prompts + Airtable ref (existing)
```

Documents in `docs/orchestrator/` are the **blueprint layer** — read by Claude sessions to activate the Master Orchestrator persona and load cross-agent contracts. Runtime code lives in `ck-api-gateway`.

---

## 5. API Rate Limits & Throttling

Rate limits are enforced at the gateway KV layer (`RATE_LIMITS` namespace, sliding window). Per-agent budgets below.

| Agent | Outbound RPM | Daily Ceiling | Burst | Throttle Policy |
|-------|--------------|---------------|-------|-----------------|
| Sentry-Agent | 60 | 2,000 | 10 | Shed non-critical telemetry; P0 always passes |
| Ledger-Agent | 20 | 500 | 5 | Queue to next minute; never drop |
| Acquisition-Agent | 30 | 100 outbound contacts | 5 | Hard stop at ceiling; email CEO |
| Report-Agent | 10 | 50 renders | 3 | Queue to off-peak window (02:00–05:00 UTC) |
| Orchestrator (control plane) | 600 | unbounded | 60 | Never throttled internally; external callers limited |

**Global Safeguard**: `429 Too Many Requests` response honors the existing gateway policy (100 req/15min per IP per `systems-manifest.json`). Outbound third-party calls use exponential backoff (2s, 4s, 8s, 16s) with a 4-retry cap.

---

## 6. Human-in-the-Loop (HITL) Triggers

HITL is required for any of the following. The Orchestrator halts dispatch and pages the CEO via SMS + Slack `#exec-briefing` with a signed approval link (10-minute TTL).

| Trigger | Agent | Notification Channels |
|---------|-------|-----------------------|
| Financial transfer > $5,000 (single or aggregate 24h window) | Ledger-Agent | SMS + Slack + Email |
| New vendor onboarding or contract > $2,500 | Ledger / Sentry | Slack + Email |
| Structural, electrical, or roofing work order | Sentry-Agent | SMS + Slack |
| Any P0 event (water intrusion, security breach, fire, flood sensor) | Sentry-Agent | SMS + Slack + Phone |
| Outbound acquisition contacts > 100/day | Acquisition-Agent | Slack + Email |
| Use of any unverified or non-allowlisted data source | Acquisition-Agent | Slack |
| Insurance claim initiation or carrier correspondence | Sentry / Ledger | SMS + Slack + Email |
| Inter-LLC fund movement (any amount) | Ledger-Agent | SMS + Slack |
| Report containing negative narrative (damage, delay, owner complaint) | Report-Agent | Slack |
| Any action failing Core Goals validation | Orchestrator | Slack `#exec-briefing` |

HITL approval is recorded to the audit log with approver identity, timestamp, and decision rationale. No retroactive approval permitted.

---

## 7. Deployment Mandate

Per `ORCHESTRATOR.md` Section "Deployment Mandate":
1. Build phase — extend `ck-api-gateway` with `/v1/orchestrator/dispatch` (new) wired to this blueprint's routing table.
2. Schema phase — ship `agent-communication-schemas.json` to `docs/orchestrator/` (done in this commit).
3. Trigger phase — ship `trigger-action-sequences.md` (done in this commit).
4. Runtime phase — extend `master-prompt-v21.js` to expose orchestrator agent roster (next iteration).
5. UI phase — add `/orchestrator` page to `ck-command-center` (next iteration).
6. Test phase — extend `ck-api-gateway/src/__tests__/` with routing and HITL gate tests (next iteration).
7. Deploy phase — CI/CD via existing GitHub Actions on `main`.

13-step cadence: Create → Plan → Build → Test → Reconfigure → Deploy → Test → Reconfigure → Push → Test → Reconfigure → Pull → Live.

---

## 8. Success Criteria

| Metric | Target | Window |
|--------|--------|--------|
| Autonomous resolution rate | 85%+ of events closed without HITL | Month 1 steady state |
| P0 false-positive rate | <2% | Month 1 |
| HITL response time (CEO) | <15 minutes median | Continuous |
| Acquisition-Agent → qualified lead conversion | 8%+ | Month 3 |
| Report-Agent owner NPS | 4.8+ | Month 3 |
| Zero preventable incidents | 100% | Continuous |
| Orchestrator control-plane uptime | 99.9% | Continuous |

---

## 9. Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-17 | Initial Master Orchestrator operational blueprint. Fleet of 4 sub-agents + Dashboard. Priority×Risk matrix, HITL thresholds, rate limits, 4 Core Goals validation. |

---

*Routed through the Coastal Key Master Orchestrator. Ferrari Precision. Red Bull Speed. SpaceX Ambition. Founder-Invisible.*
