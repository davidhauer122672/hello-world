# TCPA CLEARANCE MEMO — PROJECT SENTINEL

**Classification:** Irreversible Decision Record — Written per CEO Operating Discipline v2.0
**Memo ID:** TCPA-CLEAR-2026-04-16-001
**Date:** April 16, 2026
**Authority:** David Hauer, CEO — Sole Signatory
**Subject:** Conditional Clearance to Operate Sentinel SMS & Voice Outbound
**Supersedes:** CEO Override of April 11, 2026 (documented risk acknowledgment)

---

## I. DECISION

**Project Sentinel (SMS + Voice outbound) is conditionally cleared to operate effective April 16, 2026,** subject to the mandatory compliance gate defined in Section III. The gate is non-discretionary and machine-enforced.

This memo is the written record required by CEO Operating Discipline v2.0, Quality Gate G1 and the Decision Discipline rule: "Irreversible: decide only after a written memo. No verbal irreversible decisions, even yours."

---

## II. CONTEXT

The Coastal Key AI operates a 40-agent Sentinel voice fleet and an SMS-based SPEAR funnel. Both surfaces are governed by the Telephone Consumer Protection Act (TCPA) and, following the FCC's February 2024 ruling on AI voice systems, both are subject to prior express written consent (PEWC) requirements for prospecting contact.

As of April 16, 2026 (Airtable verified):
- **0 calls placed** via Sentinel
- **0 SMS sent** via SPEAR
- **L-01 CLIO clearance:** pending formal legal sign-off despite CEO authorization of April 11
- **Financial exposure if non-compliant:** $500–$1,500 per infraction under TCPA statutory damages

The company has a full TCPA compliance stack already built at the API Gateway (`ck-api-gateway/src/routes/compliance.js` + `services/tcpa-compliance.js`), exposing nine endpoints:

1. `POST /v1/compliance/dnc/add` — Add to DNC registry
2. `POST /v1/compliance/dnc/check` — Single DNC check
3. `POST /v1/compliance/dnc/bulk-check` — Bulk DNC scrub (up to 100 per request)
4. `POST /v1/compliance/dnc/remove` — Remove from DNC (on consent re-obtained)
5. `POST /v1/compliance/consent/record` — Record PEWC
6. `POST /v1/compliance/consent/check` — Check consent status
7. `GET  /v1/compliance/calling-window` — Time-of-day enforcement (8am–9pm recipient local)
8. `POST /v1/compliance/pre-call-check` — Full pre-dial gate (DNC + consent + window)
9. `GET  /v1/compliance/audit` — Generate compliance audit report

Every call and SMS is audit-logged to KV with 30-day retention. Every operation is traceable to the originating agent ID.

---

## III. MANDATORY COMPLIANCE GATE (NON-DISCRETIONARY)

No outbound call or SMS shall be initiated by any Sentinel, Atlas, or SPEAR agent unless all of the following are true for the target number:

| Gate | Endpoint | Condition for PASS |
|------|----------|--------------------|
| **G1: DNC Scrub** | `POST /v1/compliance/dnc/check` | `isDNC === false` |
| **G2: PEWC Record** | `POST /v1/compliance/consent/check` | `hasConsent === true` **OR** prospect qualifies under an established business relationship (EBR) within 18 months |
| **G3: Calling Window** | `GET /v1/compliance/calling-window` | `open === true` (recipient local 8am–9pm, Mon–Sat) |
| **G4: Pre-Call Gate** | `POST /v1/compliance/pre-call-check` | `passed === true` — this is a single atomic check that rolls up G1–G3 |
| **G5: Audit Write** | `writeAudit(env, ctx, ...)` in `utils/audit.js` | Every attempt logged regardless of outcome |

**If the pre-call gate returns `passed === false`, the outbound attempt is aborted.** No override, no retry, no human-in-the-loop bypass. The gate is the law.

**If the pre-call gate is unavailable (500/503 or network error), the outbound attempt is aborted.** Fail-closed, not fail-open.

---

## IV. SCOPE OF THIS CLEARANCE

### Cleared — Permitted with gate enforcement
- Outbound SMS to leads with recorded PEWC or EBR
- Outbound voice calls to leads with recorded PEWC or EBR
- SMS/voice to partnership targets who have shared contact info publicly in a B2B commercial context (Real Estate Attorneys, Insurance Brokers, HOA Management Companies, Mortgage Lenders, Estate Attorneys) under the B2B exemption, subject to DNC and calling window compliance
- SPEAR SMS funnel for recipients who have opted in via web form, email reply, or verbal consent

### Not Cleared — Prohibited without additional written clearance
- Cold SMS to consumer cell phones without PEWC or EBR
- Pre-recorded voice messages (artificial/prerecorded voice) to residential lines without PEWC
- SMS to numbers listed on the federal DNC registry
- Contact outside the 8am–9pm recipient-local window
- Contact on federal holidays without explicit campaign-level approval
- Contact across state lines where state TCPA variants impose stricter rules (NY, WA, FL supplementary) until state-specific review is performed by L-02 State Law Agent

---

## V. RISK ACKNOWLEDGMENT

**Residual risk:** Even with all five gates enforced, the company retains residual exposure from:
1. Data-quality errors in the DNC cache (new additions not yet propagated)
2. Third-party list contamination (numbers sold to us that are consumer-flagged)
3. Recipient complaint to FTC/FCC even when compliant (defensible but costly)
4. State-law variation outside TCPA (not covered by this memo)

**Mitigation:**
- DNC cache refresh every 24 hours via scheduled job
- Every outbound action carries a `complianceCheckId` linking to the audit entry, enabling defense-in-depth on any dispute
- L-05 TCPA Agent (Sovereign Legal Division) operates continuous monitoring
- Maximum daily outbound ceiling: 2,400 SMS + 2,400 voice attempts per day. No bulk blasts above this without new written memo.

**Budget for compliance reserve:** $15,000 set aside for the first 90 days to cover any defensible incidents. If reserve is drawn upon, operations pause pending post-incident review.

---

## VI. REVIEW & RENEWAL

- **Weekly:** `GET /v1/compliance/audit` output reviewed by CEO during Friday 15:00 CEO Note (per Operating Discipline v2.0)
- **Monthly:** L-05 TCPA Agent produces compliance metrics; attached to Board Brief
- **Quarterly:** Memo reviewed and explicitly renewed or revoked
- **Immediate revocation conditions:**
  - Any single failure of the pre-call gate that results in a dial going through anyway
  - Any FCC/FTC inquiry or consumer complaint
  - Any breach of the 2,400/day ceiling

**Default renewal:** This clearance expires July 16, 2026 unless explicitly renewed by CEO in writing. Non-renewal is a revocation — Sentinel reverts to stand-down by default.

---

## VII. AUTHORIZATIONS SUPERSEDED / SUPPORTED

- **Supersedes:** CEO Override of April 11, 2026 (which authorized operation with documented risk but without a formal compliance gate specification)
- **Supports:** CEO-Q2-2026-OPERATIONAL-DIRECTIVES.md, Decision 2 ("SEN Division is the Tip of the Spear")
- **Supports:** CEO-GROUND-TRUTH-INTELLIGENCE-BRIEF.md, Blocker 1 ("TCPA Compliance Clearance")
- **Governed by:** CEO-OPERATING-DISCIPLINE.md (Quality Gates G1-G5, Decision Discipline)

---

## VIII. SIGNATURES

**CEO (Sovereign Authority):** David Hauer
**Date of Issue:** April 16, 2026
**Effective:** Immediate upon commit to `claude/ceo-operating-discipline-iRy1t` branch
**Memo ID:** TCPA-CLEAR-2026-04-16-001

**Distribution:**
- #exec-briefing (Slack)
- Airtable: Sovereign Legal Division / L-05 TCPA Agent record
- Airtable: Delegation Agent Ops (Protocol Day 43)
- Branch: `claude/ceo-operating-discipline-iRy1t`

---

*This memo is binding. It is the written record required to initiate irreversible outbound operations. No Sentinel, Atlas, or SPEAR agent may operate outside this framework. The compliance gate is the law.*
