# Coastal Key Orchestrator — Trigger-Action Sequences

**Version**: 1.0.0
**Effective**: 2026-04-17
**Scope**: Every recurring property-management scenario the fleet must handle autonomously.
**Companion documents**: `master-orchestrator-blueprint.md`, `agent-communication-schemas.json`.

Each sequence below follows the pattern: **Trigger → Classification → Agent Chain → Actions → HITL Gate (if any) → Audit**. All envelopes conform to `agent-communication-schemas.json`.

---

## Legend

- **P0/P1/P2/P3** — Priority class
- **R0/R1/R2/R3** — Risk class
- **HITL** — Human-in-the-Loop gate required
- **⟶** — Envelope dispatch
- **⟲** — Self-loop / queue

---

## TAS-001 — Water Intrusion Detected

- **Trigger**: Sentry water sensor reading > 50 (1=dry, 100=wet) OR flood sensor binary-on.
- **Classification**: P0 / R3
- **Chain**: `sensor ⟶ orchestrator ⟶ sentry-agent ⟶ ledger-agent (hold)`
- **Actions**:
  1. Sentry pings 3 adjacent sensors to confirm non-false-positive.
  2. If confirmed: shut-off valve triggered via smart shutoff (if provisioned).
  3. Owner notified (SMS + email + portal).
  4. HITL page to CEO with decision URL, 10-minute TTL.
  5. Work order drafted (`SentryDispatchWorkOrder`, trade: plumbing, urgency: emergency).
  6. Insurance evidence packet auto-assembled (GPS-stamped photos, sensor timeline).
- **HITL Gate**: Mandatory before vendor dispatch if estimated cost > $5,000 OR structural damage indicated.
- **Audit**: P0 event logged with 365-day retention (override of 30-day default).

---

## TAS-002 — HVAC Humidity Anomaly (Mold Risk)

- **Trigger**: Humidity > 65% sustained for 6 hours.
- **Classification**: P1 / R2
- **Chain**: `sensor ⟶ orchestrator ⟶ sentry-agent`
- **Actions**:
  1. Sentry issues HVAC diagnostic via smart thermostat API.
  2. If remediable remotely (setpoint adjustment): execute autonomously.
  3. If not: dispatch HVAC vendor (scheduled urgency) up to $1,500.
  4. Owner notified on next weekly Report-Agent cycle (not urgent).
- **HITL Gate**: None unless work order > $5,000.
- **Audit**: Standard 30-day retention.

---

## TAS-003 — Security Breach (Door/Window Open While Armed)

- **Trigger**: Contact sensor open while system in ARMED state, owner geofence != on-premise.
- **Classification**: P0 / R3
- **Chain**: `sensor ⟶ orchestrator ⟶ sentry-agent ⟶ acquisition-agent (suppress)`
- **Actions**:
  1. Sentry triggers verified alarm (not siren-first; video check via smart doorbell/camera).
  2. Owner called (Retell voice) within 60 seconds.
  3. If no owner response: local security/police dispatched per property contract.
  4. Acquisition-Agent suppresses any outbound marketing on adjacent properties for 48h to avoid incident-adjacent optics.
- **HITL Gate**: Mandatory if third-party security dispatched. Insurance carrier notified.
- **Audit**: P0 event logged with 365-day retention.

---

## TAS-004 — Vendor Invoice Received

- **Trigger**: Inbound email to `ap@coastalkey-pm.com` with PDF attachment.
- **Classification**: P2 / R1 (≤$5,000), P1 / R2 (>$5,000)
- **Chain**: `email ingest ⟶ orchestrator ⟶ ledger-agent`
- **Actions**:
  1. OCR parses invoice; matches to open work order by vendor + property + amount ± 5%.
  2. If match and amount ≤ $5,000: `LedgerBillPay` envelope dispatched; payment scheduled for due date.
  3. If no match OR amount > $5,000: queue for HITL.
  4. GL entry posted to correct LLC entity and expense category.
- **HITL Gate**: Any invoice > $5,000 OR any unmatched invoice.
- **Audit**: Standard + retained in evidence vault for 7 years (tax compliance).

---

## TAS-005 — New Acquisition Lead (MLS Scrape Hit)

- **Trigger**: Nightly MLS/public-records scan identifies property meeting criteria (absentee owner, $1M+, Treasure Coast county).
- **Classification**: P3 / R0
- **Chain**: `acquisition-agent ⟶ orchestrator ⟶ drip-engine`
- **Actions**:
  1. Acquisition enriches: owner identity, contact, net-worth band, do-not-contact check.
  2. Confidence score computed (≥0.7 to advance).
  3. `AcquisitionLeadEnriched` envelope dispatched.
  4. Lead enrolled in `drip_90d_risk_first` or `drip_90d_luxury` sequence.
  5. SEN division queue notified via `#pipeline-updates` Slack channel.
- **HITL Gate**: Daily outbound count >100 triggers hard stop + CEO notification.
- **Audit**: Standard.

---

## TAS-006 — Weekly Owner Report Cycle

- **Trigger**: Monday 07:00 EST cron per active property.
- **Classification**: P2 / R1
- **Chain**: `scheduler ⟶ orchestrator ⟶ report-agent`
- **Actions**:
  1. Report-Agent pulls telemetry deltas, completed work orders, photos from last 7 days.
  2. AI narrates summary (Claude); renders PDF + MP4 video (ElevenLabs voice).
  3. Publish to owner email + SMS link + portal.
  4. Block send if any unresolved P0 on property; escalate to CEO.
- **HITL Gate**: Only if unresolved P0 OR negative narrative detected (damage, delay, complaint).
- **Audit**: Standard; artifacts retained 2 years.

---

## TAS-007 — Insurance Claim Initiation

- **Trigger**: Sentry confirmed P0 with financial exposure ≥ $10,000 OR owner-initiated claim.
- **Classification**: P0 / R3
- **Chain**: `sentry-agent ⟶ orchestrator ⟶ ledger-agent ⟶ CEO`
- **Actions**:
  1. Evidence packet assembled (photos, sensor timeline, work-order chain, vendor assessments).
  2. Carrier API call drafted (not sent).
  3. HITL approval required before any carrier correspondence.
  4. On approval: Ledger books loss reserve; Sentry continues mitigation.
- **HITL Gate**: Mandatory, always.
- **Audit**: 7-year retention; tagged for legal hold.

---

## TAS-008 — Quarterly Tax Provision

- **Trigger**: First business day of Jan/Apr/Jul/Oct.
- **Classification**: P1 / R2
- **Chain**: `scheduler ⟶ orchestrator ⟶ ledger-agent`
- **Actions**:
  1. Ledger pulls QTD P&L per LLC entity.
  2. Computes estimated federal + FL franchise tax.
  3. Generates payment voucher and calendar reminder.
  4. `LedgerTaxProvision` envelope dispatched to CEO briefing.
- **HITL Gate**: Mandatory for any payment > $5,000 (and always for estimated payment submission).
- **Audit**: 7-year retention.

---

## TAS-009 — Sensor Battery Low

- **Trigger**: Any sensor reports `battery_pct` < 20%.
- **Classification**: P2 / R1
- **Chain**: `sensor ⟶ orchestrator ⟶ sentry-agent`
- **Actions**:
  1. Sentry queues battery replacement in next scheduled inspection window.
  2. If battery_pct < 10%: escalates to same-day dispatch (trade: general, estimated ≤ $150).
- **HITL Gate**: None.
- **Audit**: Standard.

---

## TAS-010 — Storm Protocol (Named System within 72h of Treasure Coast)

- **Trigger**: NWS/NHC advisory indicates named system with projected path intersecting Martin/St. Lucie/Indian River within 72h.
- **Classification**: P0 / R3
- **Chain**: `weather-feed ⟶ orchestrator ⟶ sentry-agent ⟶ all downstream`
- **Actions**:
  1. Sentry executes pre-storm checklist per property (shutters, shutoffs, inventory photos).
  2. Owner communications: storm advisory email + SMS with action checklist.
  3. Acquisition-Agent suppresses outbound for 72h (tone risk).
  4. Report-Agent promises post-storm assessment within 24h of all-clear.
  5. Ledger pre-authorizes emergency vendor pool (pre-approved list only).
- **HITL Gate**: Mandatory before any pre-storm vendor dispatch > $1,000 per property.
- **Audit**: Storm-tagged; 365-day retention.

---

## TAS-011 — New Client Onboarding

- **Trigger**: SEN division marks contract signed in Airtable `leads` table.
- **Classification**: P1 / R1
- **Chain**: `airtable-webhook ⟶ orchestrator ⟶ sentry-agent ⟶ ledger-agent ⟶ report-agent`
- **Actions**:
  1. Sentry schedules 47-point initial inspection + sensor deployment.
  2. Ledger creates Stripe customer, invoice, and LLC-segregated revenue tracking.
  3. Report-Agent provisions owner portal + welcome report.
  4. Property record provisioned in Airtable with all integrations.
- **HITL Gate**: Any onboarding with annual contract value > $15,000 requires CEO sign-off.
- **Audit**: Standard; contract retained 7 years.

---

## TAS-012 — Owner Complaint Received (Email, SMS, Portal)

- **Trigger**: NLP classifier flags inbound message as "complaint" with confidence ≥ 0.75.
- **Classification**: P1 / R2
- **Chain**: `inbound ⟶ orchestrator ⟶ CEO`
- **Actions**:
  1. Orchestrator drafts acknowledgement (≤5-minute SLA).
  2. Auto-acknowledgement sent.
  3. CEO paged with full context, prior history, suggested resolution.
  4. Report-Agent suppresses next weekly send until resolution.
- **HITL Gate**: Mandatory resolution approval.
- **Audit**: Retained until resolution + 2 years.

---

## TAS-013 — Monthly NOI & Financial Engine Checkpoint

- **Trigger**: Last business day of month, 23:00 EST.
- **Classification**: P2 / R1
- **Chain**: `scheduler ⟶ orchestrator ⟶ ledger-agent ⟶ dashboard`
- **Actions**:
  1. Ledger computes NOI per property and portfolio-wide.
  2. Calls `GET /v1/orchestrator/noi-model` with live portfolio size.
  3. Compares vs 40%+ gross margin Goal 3 target.
  4. Dashboard tile updated; variance >5% triggers CEO Slack note.
- **HITL Gate**: None.
- **Audit**: Standard; financial artifacts retained 7 years.

---

## TAS-014 — Vendor Performance Review

- **Trigger**: Rolling 30-day completion of ≥3 work orders with same vendor.
- **Classification**: P3 / R1
- **Chain**: `ledger-agent ⟶ orchestrator ⟶ sentry-agent`
- **Actions**:
  1. Performance score computed (on-time %, rework rate, cost variance vs estimate, owner feedback).
  2. Vendor tier adjusted (Gold/Silver/Bronze/Probation).
  3. Probation tier excluded from autonomous dispatch; Gold tier prioritized.
- **HITL Gate**: None for tier adjustment. Mandatory for vendor termination.
- **Audit**: Standard.

---

## TAS-015 — CEO Daily Standup Ingestion

- **Trigger**: 06:00 EST daily (already defined in `CLAUDE.md`).
- **Classification**: P2 / R1
- **Chain**: `scheduler ⟶ orchestrator ⟶ all agents ⟶ standup compiler`
- **Actions**:
  1. Each agent reports 24h accomplishments, open items, incidents.
  2. Orchestrator validates 4 Core Goals alignment across the day.
  3. Standup briefing posted per existing `GET /api/standup` contract.
  4. HITL queue summarized at top of briefing.
- **HITL Gate**: None (briefing itself); HITL items surfaced within.
- **Audit**: Standard; standup archives 90 days per existing spec.

---

## Failure Modes & Recovery

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Sensor offline > 24h | Heartbeat miss | TAS-009 escalation path |
| Agent unresponsive > 5 min | Orchestrator health probe | Restart + CEO Slack |
| HITL unanswered past TTL | TTL timer | Re-page via backup channel; auto-defer if still unanswered; CEO emergency SMS |
| Third-party API down | Response error 5xx | Exponential backoff 2s/4s/8s/16s; circuit-breaker opens after 5 failures |
| Audit log write failure | Return-code check | Dual-write to disk; reconcile on recovery |
| Goal validation failure | Goal-alignment check | Quarantine envelope; CEO reviews in standup |

---

## Version History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-04-17 | Initial 15 Trigger-Action sequences + failure-mode matrix. |

---

*Trigger-Action Sequences are the operational contract between the Orchestrator and the fleet. Changes here require matching updates to `agent-communication-schemas.json` and `master-orchestrator-blueprint.md` in the same commit.*
