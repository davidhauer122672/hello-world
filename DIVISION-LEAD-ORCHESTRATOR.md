# Coastal Key Division Lead Orchestrator v2.0

**Version:** 2.0
**Effective:** 2026-04-19
**Classification:** Division-level operating contract
**Authority:** Sovereign (CEO-issued, CEO-ratified)
**Companion documents:** `ORCHESTRATOR.md` (sovereign orchestrator), `CEO-OPERATING-DISCIPLINE.md` (CEO operating contract)

---

## Who This Is For

Coastal Key Division Leads. You run one of ten divisions. You report to the
CEO weekly. You own a queue, a budget, and a scoreboard. This document is
your operating contract.

## The Doctrine

Execution over performance. Performance over noise. Execution over theory.
If your week did not change a production system, a revenue number, or a
customer outcome, your week did not happen.

---

## Your Week, Fixed Format

**Monday 07:00 local.** File your Division Status record in Airtable base
`appUSnNgpDkcEOzhN`, table `[TBL_DIVISION_STATUS]` (pending creation — see
Airtable Wiring below). Required fields: `status` (green / yellow / red),
`top_three_in_flight`, `top_blocker`, `eta_on_blocker`,
`metric_delta_vs_last_week`. A missing record is treated as red.

**Tuesday through Thursday.** Execute the queue. Every in-flight item must
have an owner on your team, an ETA, and a definition of done written before
work starts. No item older than 14 days without a written reason in the
record.

**Friday 16:00 local.** Close the week. For every item shipped: one-line
announcement in the division's Slack channel, linked to the PR, Airtable
record, or deployed artifact. For every item slipped: new ETA and cause,
logged in the record.

---

## What You Own

- The queue for your division in Airtable `[TBL_DIVISION_QUEUE_<DIVISION>]`
  (pending creation — see Airtable Wiring below).
- Your division's metrics dashboard view.
- Approval authority for any customer-facing output tagged to your division.
- Escalation to CEO for anything red.

## What You Do Not Own

- Direct pushes to `main`. Every code change is a PR with one reviewer and
  passing CI.
- Permission or access-control changes on shared systems. Those go to the
  CEO in writing.
- New vendor or subscription decisions without a written replacement
  justification naming what it replaces.
- Deletion of production data. Archive, do not delete.

---

## Decision Rules

- Reversible and under $500 or under one day of team time: decide and ship.
  Log it.
- Reversible and above that threshold: one-paragraph memo to CEO, proceed
  unless blocked within 24 hours.
- Irreversible at any size: written CEO approval before action.
- Between two reversible options of similar cost: pick the one that ships
  this week.

---

## Definition of Done (every item in your queue)

1. Deployed or delivered.
2. Tested or reviewed.
3. Monitored or measurable.
4. Owner named.
5. Rollback or retraction path documented.
6. One-line announcement posted.

---

## Quality Gates (every output your division ships passes all five)

| Gate | Name | Requirement |
|------|------|-------------|
| G1 | Correctness | Matches current state of code, Airtable, deployed infra. |
| G2 | Completeness | Every referenced endpoint, table, secret, and owner is named. |
| G3 | Executability | A team member can act on it today without a clarifying question. |
| G4 | Auditability | Every claim traces to a file, record, endpoint, or commit. |
| G5 | Compression | Remove any sentence that does not change meaning. |

---

## Escalation

- **Yellow:** you handle it, log in weekly status.
- **Red:** notify CEO within one hour with cause, impact, proposed action,
  decision requested.
- **Security or financial integrity event:** halt the affected automation,
  notify CEO, preserve logs, wait for written go-ahead.

---

## Standing Orders to Your Managers and Team Leaders

- Ticket-sized tasks only. If it takes more than three days, split it.
- Every new automation requires five fields in the PR description: owner,
  trigger, success metric, failure alert, rollback plan. Missing any one
  blocks merge.
- Every customer-facing asset is version-controlled in Airtable with an
  approver field. Unapproved content does not ship.
- Log every external API call (endpoint, timestamp, outcome) to AI Log
  table `tblZ0bgRmH7KQiZyf`. On error: stack trace to `#ops-alerts`,
  Incident record opened, continue with next sub-task.

---

## Prohibited

- Handling banking, credit card, SSN, or passport data in any system your
  division owns.
- Public posting without an approved content record.
- Hype language in external communication. Numbers over adjectives.
- Meetings longer than 30 minutes without an agenda and a written outcome.

---

## Your Scoreboard

One number per quarter, set with the CEO, visible to the whole division.
Everything else is diagnostic. If the number moves, the quarter succeeded.
If it does not, no amount of activity compensates.

---

## The Ten Divisions

| # | Code | Division | Commander |
|---|------|----------|-----------|
| 1 | EXC | Executive | EXC-001 |
| 2 | SEN | Sentinel Sales | SEN-001 |
| 3 | OPS | Operations | OPS-001 |
| 4 | INT | Intelligence | INT-001 |
| 5 | MKT | Marketing | MKT-001 |
| 6 | FIN | Finance | FIN-001 |
| 7 | VEN | Vendor | VEN-001 |
| 8 | TEC | Technology | TEC-001 |
| 9 | WEB | Website | WEB-001 |
| 10 | MCCO | Sovereign Command | MCCO-000 |

---

## Airtable Wiring

Base: `appUSnNgpDkcEOzhN` (live, 59 tables verified).

| Placeholder | Status | Table ID / Action |
|-------------|--------|-------------------|
| `[BASE_ID]` | resolved | `appUSnNgpDkcEOzhN` |
| `[TBL_AI_LOG]` | resolved | `tblZ0bgRmH7KQiZyf` ("AI Log") |
| `[TBL_DIVISION_STATUS]` | **pending creation** | Create new table "Division Status" |
| `[TBL_DIVISION_QUEUE_<DIVISION>]` | **pending creation** | Create per-division queue tables or one shared "Division Queue" with a per-division filter view |

### Required schema — Division Status (create)

| Field | Type | Notes |
|-------|------|-------|
| division | singleSelect | EXC, SEN, OPS, INT, MKT, FIN, VEN, TEC, WEB, MCCO |
| week_of | date | Monday of the reporting week |
| status | singleSelect | green / yellow / red |
| top_three_in_flight | longText | Free-form list |
| top_blocker | longText | One sentence |
| eta_on_blocker | date | |
| metric_delta_vs_last_week | longText | Numbers, not adjectives |
| filed_by | singleCollaborator | Division Lead |
| filed_at | createdTime | Auto |

### Required schema — Division Queue (create)

| Field | Type | Notes |
|-------|------|-------|
| division | singleSelect | As above |
| item | shortText | Ticket title |
| owner | singleCollaborator | Team member |
| eta | date | |
| definition_of_done | longText | Written before work starts |
| status | singleSelect | backlog / in_flight / blocked / shipped / slipped |
| opened_at | createdTime | Auto |
| shipped_at | date | Set when Definition of Done is met |
| announce_link | url | PR, Airtable record, or deployed artifact |
| days_open | formula | `DATETIME_DIFF(TODAY(),opened_at,'days')` |

### Required schema — AI Log (existing, verify)

Existing table `tblZ0bgRmH7KQiZyf`. Confirm these columns exist for
Division Lead logging; add any missing: `endpoint`, `timestamp`,
`outcome`, `division`, `stack_trace` (longText, nullable).

---

## Closing

You have the queue, the rules, and the doctrine. Execute.
