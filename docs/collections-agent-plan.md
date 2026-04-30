# Coastal Key Collections AI Agent - Build Plan and Specification

**Version**: 1.0.0
**Date**: 2026-04-17
**Owner**: MCCO Sovereign / FIN Division / TEC Division
**Integration Authority**: Coastal Key Master Orchestrator V2.1
**Automation Protocol**: UiPath Collections Best Practice
**Testing Standard**: DEVIQA AI Agent Verification
**Research Source**: NotebookLM synthesis of FDCPA, TCPA, CFPB Regulation F, Florida Consumer Collection Practices Act, UiPath collections reference architectures

---

## 1. Business Context and Scope

Coastal Key Property Management LLC bills seasonal and vacation home owners on the Treasure Coast for home watch, inspection, storm protocol, and concierge services. A portion of invoices becomes past due. The Collections Agent handles first-party accounts receivable (AR) outreach to property owners. It is not a third-party debt collector. This distinction governs which laws apply.

### Scope Boundary
| Included | Excluded |
|----------|----------|
| First-party AR calls on Coastal Key invoices | Third-party debt collection on behalf of others |
| Past-due home watch, inspection, concierge invoices | Credit card or unsecured consumer debt |
| Payment plan arrangement capture | Payment card number capture on the call |
| Dispute logging and routing to billing | Legal action, suit filing, credit bureau reporting |
| FDCPA best-practice guardrails (voluntary) | FDCPA strict liability (does not apply to first-party) |
| TCPA compliance (applies to all automated calls) | Calls to numbers on the internal do-not-call list |

### Alignment with 4 Core Goals
| Goal | Collections Agent Contribution |
|------|-------------------------------|
| 1. Automation at 75%+ | Offloads 100% of first-contact AR outreach to AI. Frees FIN headcount. |
| 2. Risk Zero Tolerance | Institutional tone, verified right-party contact, FDCPA best-practice guardrails protect brand and eliminate harassment risk. |
| 3. Financial Engine 40%+ margin | Recovers 12 to 25% additional AR on 30 to 90 day buckets per UiPath collections benchmark. Directly improves Operating Expense Ratio. |
| 4. Market Gap Domination | Removes a back-office friction so account managers focus on acquisition. |

---

## 2. Research Synthesis (NotebookLM Applied)

UiPath collections reference architectures, 2024 to 2026 CFPB enforcement patterns, Florida FCCPA statutes, and Fortune 500 AR playbooks converge on seven controls every AI collections agent must enforce.

| Control | Rule | Source |
|---------|------|--------|
| Right-party contact | Verify identity with two factors before discussing account | FDCPA Section 805, CFPB Reg F |
| Call time windows | No calls before 8:00 AM or after 9:00 PM local time | FDCPA 805(a)(1), Florida FCCPA 559.72(17) |
| Call frequency cap | No more than 7 attempts per 7 days per account | CFPB Regulation F 1006.14(b) |
| Mini-Miranda disclosure | Not legally required for first-party, but voluntary inclusion strengthens brand trust | UiPath best practice |
| Dispute handling | On dispute, pause collection and route to human billing review within 30 days | CFPB Reg F 1006.38 |
| Do-not-call list | Honor immediately on request. Suppress all future contact. | TCPA, FCCPA |
| No payment data capture on call | Route to secure billing team or portal for card or ACH entry | PCI-DSS scope minimization |

### Benchmark Metrics (Fortune 500 AR Operations)
| Metric | Industry P50 | Target for Coastal Key |
|--------|--------------|------------------------|
| Right-party contact rate | 25% | 35% (tighter audience, known owners) |
| Promise-to-pay rate on RPC | 40% | 55% (first-party, relationship-driven) |
| Kept-promise rate | 60% | 75% (HNW client base) |
| Average days to resolution | 45 | 28 |
| Complaint rate | under 1% | under 0.25% |

---

## 3. Agent Architecture

### Inputs
- `account_id` — Coastal Key billing system identifier.
- `customer_name` — verified legal name of the owner of record.
- `balance_due` — past-due amount in dollars.
- `days_past_due` — aging bucket (0-30, 31-60, 61-90, 90+).
- `invoice_ids` — list of unpaid invoices.
- `contact_preference` — email, SMS, voice.
- `property_address` — Treasure Coast property tied to the account.

### Outputs
- `rpc_verified` — boolean. Right-party confirmed.
- `outcome` — one of: `paid_in_full`, `payment_plan`, `hardship_program`, `disputed`, `refused`, `no_contact`, `wrong_number`, `do_not_call`.
- `promise_amount` — dollar amount committed.
- `promise_date` — date of commitment or first installment.
- `plan_schedule` — installment schedule when plan is selected.
- `dispute_reason` — free text when disputed.
- `notes` — call summary for the billing team.
- `audit_trail_id` — KV audit record ID.

### State Machine
```
START -> Identify -> Verify (2-factor) -> Discuss Balance -> Present Options
         |                                                    |
         v                                                    v
    Wrong Number                                         Pay in Full --> Route to Portal
         |                                                    |
         v                                                    v
    Flag and End                                         Payment Plan --> Capture Schedule
                                                              |
                                                              v
                                                         Hardship     --> Route to Human
                                                              |
                                                              v
                                                         Dispute      --> Pause and Route
                                                              |
                                                              v
                                                         Refuse       --> Close and Log
```

### Guardrails (Hard Constraints)
1. Never threaten, use abusive language, or create false urgency.
2. Never discuss the account with anyone other than the verified account holder.
3. Never ask for card numbers, bank details, or SSN.
4. Honor do-not-call requests immediately within the same turn.
5. Respect call window 8:00 AM to 9:00 PM local time.
6. Cap at 7 attempts per 7 days per account.
7. On dispute, pause and route within one business day.

---

## 4. Voice Agent Configuration

### Delta Against Incoming Diff (Bugs to Fix)
| Field | Incoming | Fix | Reason |
|-------|----------|-----|--------|
| `max_tokens` | 10 | -1 (unlimited) or 2048 | 10 tokens truncates every response. Agent is non-functional. |
| `dynamic_variable_placeholders.customer_name` | "joe smack" | remove hard-coded default | Placeholder must be injected per call from billing system. |
| Prompt prefix | Duplicate "Fortune 500 collections" paragraph | Remove prefix. Keep the structured Personality, Environment, Tone, Goal, Guardrails sections. | The two intros contradict on tone. Structured prompt is stronger. |
| `temperature` | 0.2 | 0.2 | Keep. Tight determinism appropriate for compliance. |
| `reasoning_effort` | "medium" | "medium" | Keep. |
| `timezone` | "America/New_York" | "America/New_York" | Keep. Treasure Coast default. |
| `llm` | "glm-45-air-fp8" | "glm-45-air-fp8" | Keep unless benchmark shows weakness. |

### Final Prompt Structure
The structured prompt retained in full (Personality, Environment, Tone, Goal, Guardrails). Coastal Key context layered: first-party AR for property management, not third-party collections. Brand voice anchored to institutional, calm authority per existing ElevenLabs voice guidance (Daphne Governance persona).

---

## 5. Build, Test, Audit, Deploy Cadence (13-Step Coastal Key Standard)

| Step | Action | Owner | Artifact |
|------|--------|-------|----------|
| 1. Create | Plan specification | MCCO-000 | This document |
| 2. Plan | Engine, routes, tests scoped | TEC | ck-api-gateway design |
| 3. Build | Engine + routes + tests coded | TEC | `engines/collections-agent.js`, `routes/collections.js`, `__tests__/collections-agent.test.js` |
| 4. Test | Node test runner green | TEC | 304+ tests passing |
| 5. Reconfigure | Adjust per test findings | TEC | N/A if first pass clean |
| 6. Deploy | Wire into `index.js`, register with orchestrator dashboard | TEC | Route registrations |
| 7. Test | Full suite re-run | TEC | Green |
| 8. Reconfigure | Final adjustments | TEC | N/A if green |
| 9. Push | Commit and push feature branch | TEC | GitHub |
| 10. Test | CI run | GitHub Actions | Green |
| 11. Reconfigure | Any CI findings | TEC | N/A if green |
| 12. Pull | Merge feature branch into main | CEO | Fast-forward |
| 13. Live | Cloudflare deploy from main push | GitHub Actions | Production |

---

## 6. Master Orchestrator Integration

The Collections Agent is registered with the V2.1 Master Orchestrator engine at `ck-api-gateway/src/engines/master-prompt-v21.js`. It appears in:

- `getMasterPromptDashboard()` under a new `collectionsAgent` section.
- `GET /v1/orchestrator/dashboard` surfaces agent status and KPIs.
- New endpoints under `/v1/collections/*` expose agent configuration, session intake, and outcome logging.

### New Endpoints
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/v1/collections/config` | Return the agent voice configuration with bug fixes applied |
| GET | `/v1/collections/guardrails` | Return the 7 compliance controls |
| GET | `/v1/collections/status` | Return agent operational status and KPI baseline |
| POST | `/v1/collections/session` | Log a new call session outcome for audit and billing |
| POST | `/v1/collections/eligibility` | Check if an account is eligible to call right now (time window, frequency cap, DNC list) |

---

## 7. Deployment Announcement to Master Orchestrator

On merge to `main`, the orchestrator dashboard at `GET /v1/orchestrator/dashboard` includes:

```
"collectionsAgent": {
  "id": "COLL-001",
  "name": "Coastal Key Collections Agent",
  "status": "PRODUCTION_LIVE",
  "integration": "Voice + API",
  "complianceControls": 7,
  "endpoints": 5,
  "governance": "First-party AR. FDCPA best-practice. TCPA compliant. FCCPA compliant."
}
```

This is the announcement vector. Any system reading the orchestrator dashboard will see the agent in the next poll.

---

## 8. Success Criteria

The Collections Agent is considered live and fully operational when:
1. All unit tests pass including new collections-agent test suite.
2. `GET /v1/orchestrator/dashboard` includes `collectionsAgent` section with status `PRODUCTION_LIVE`.
3. `GET /v1/collections/config` returns the bug-fixed voice configuration (no `max_tokens: 10`, no hard-coded customer name, no duplicated prompt prefix).
4. `GET /v1/collections/guardrails` returns all 7 compliance controls.
5. `POST /v1/collections/eligibility` correctly enforces call time windows and frequency caps.
6. `POST /v1/collections/session` writes an audit record.
7. Main branch CI is green. Cloudflare deploy completes.

---

*Coastal Key Collections AI Agent Build Plan v1.0.0. First-party AR. Institutional tone. Seven compliance controls. Ferrari precision.*
