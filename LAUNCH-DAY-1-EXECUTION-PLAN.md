# LAUNCH DAY 1 — ACTIVATION EXECUTION PLAN

**Date:** April 16, 2026 (Day 13 of Launch Phase)
**Classification:** Reversible Operational Plan — CEO Directive
**Authority:** David Hauer, CEO
**Supports:** TCPA-CLEAR-2026-04-16-001 + CEO-GROUND-TRUTH-INTELLIGENCE-BRIEF
**Status:** ACTIVE — Execute Today

---

## I. THE TWO ACTIVATIONS

**Activation A — TCPA Clearance:** SMS/Voice outbound is cleared subject to the mandatory compliance gate (see TCPA-CLEARANCE-MEMO-2026-04-16.md). The gate is machine-enforced via `/v1/compliance/pre-call-check`. No gate pass → no dial. Not discretionary.

**Activation B — SPEAR-Email Outbound:** A new email variant of the SPEAR funnel is deployed (`routes/spear-email.js`). Email is out of TCPA scope and governed only by CAN-SPAM, which the system satisfies (physical address + unsubscribe footer). This is the fastest legally unencumbered path to first revenue.

**Today's first move is B. Not A.** Email reaches the 5 real partnership leads in the Airtable pipeline without touching TCPA. SMS/voice comes online once the compliance gate has run clean for 72 hours on a small test sample.

---

## II. THE 5 REAL LEADS (Airtable verified)

From Airtable `Leads` table, status `Lead`, Campaign Phase `Partnership Outreach`, created April 13, 2026:

| # | Lead | Target Role | Tier | Outreach Angle |
|---|------|-------------|------|----------------|
| 1 | Real Estate Attorney — Partner Target 1 | Estate closings referral partner | partner | Flat $250 referral on closed PM client |
| 2 | Property Insurance Broker — Partner Target 2 | Policy renewal referral partner | partner | Shared client base, co-marketed risk mitigation |
| 3 | HOA Management Company — Partner Target 3 | Complementary services partner | partner | White-label home watch inside HOA portfolio |
| 4 | Mortgage Lender — Partner Target 4 | Closing referral partner | partner | Home watch bundled at closing for out-of-state buyers |
| 5 | Estate Planning Attorney — Partner Target 5 | Absentee-owner referral partner | partner | Estate executor property oversight |

All five are B2B commercial contacts. All five receive `tier=partner` in SPEAR-Email. All five get the same opener structure — short, personal, one-sentence ask — personalized per role.

---

## III. TODAY'S EXECUTE SEQUENCE

### T+0 (now): Deploy
- Merge `spear-email.js` + `index.js` changes to `main` via the current branch
- CI/CD auto-deploys `ck-api-gateway` to Cloudflare Worker
- Verify live at `GET https://ck-api-gateway.david-e59.workers.dev/v1/spear-email/dashboard`

### T+1h: Verify Gmail OAuth
- `GET /v1/email/oauth/health` → confirm `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_FROM_ADDRESS` all present and healthy
- If any missing: halt. Secrets must be configured before any send attempt.

### T+2h: Pull Real Contact Info
Before any trigger can fire, each of the 5 leads needs a verified email address. Current Airtable records have `firstName` and role metadata but not necessarily full emails. Action:
- SEN Division Lead pulls email addresses into Airtable Leads table
- If a lead is missing an email: either research the firm's general inbox, or reclassify the lead for SMS SPEAR (requires Activation A) or manual outreach
- Do not trigger the funnel with a placeholder email

### T+3h: Fire the First 5 (one per partner)
For each lead, POST to `/v1/spear-email/trigger`:

```json
{
  "leadId": "<Airtable record ID>",
  "firstName": "<First name from record>",
  "lastName": "<Last name from record>",
  "email": "<Verified email>",
  "isPartner": true,
  "opener": "<Role-personalized opener — see templates below>",
  "subject": "<6 words max — see templates below>"
}
```

### T+4h through T+72h: Monitor
- `GET /v1/spear-email/status/:leadId` for each lead
- Inbound replies are routed via Gmail inbox → manual parse for Week 1, automation pipeline in Week 2
- On any reply: POST to `/v1/spear-email/reply` with the reply text. Funnel advances automatically.

---

## IV. THE 5 PERSONALIZED OPENERS

### Lead 1 — Real Estate Attorney
- **Subject:** Quick partner intro
- **Opener:** `{firstName} — your closings put me in front of the exact owners I serve. Coastal Key pays a flat $250 referral on any PM client that closes from your book. 15-minute call this week?`

### Lead 2 — Property Insurance Broker
- **Subject:** Policy renewals + home watch
- **Opener:** `{firstName} — your renewal conversations surface the absentee-owner risk Coastal Key is built to mitigate. Want to explore a co-marketing angle? 15 minutes this week?`

### Lead 3 — HOA Management Company
- **Subject:** White-label home watch
- **Opener:** `{firstName} — wondering if your board has ever looked at adding individual-unit home watch to the HOA offering. Coastal Key can white-label it. Quick call?`

### Lead 4 — Mortgage Lender
- **Subject:** Out-of-state buyer bundle
- **Opener:** `{firstName} — the out-of-state buyers you close need property oversight on Day 1. Coastal Key can bundle a home watch intro at closing. Worth a 15-minute conversation?`

### Lead 5 — Estate Planning Attorney
- **Subject:** Executor oversight
- **Opener:** `{firstName} — estate executors inherit properties in states they don't live in. Coastal Key is built exactly for that. Short call this week?`

---

## V. CAN-SPAM COMPLIANCE CHECK

The `spear-email.js` `composeBody()` helper automatically appends:

```
—
David Hauer | Coastal Key Property Management
Stuart, FL 34994
To stop receiving these messages, reply with "unsubscribe".
```

This satisfies all CAN-SPAM requirements:
- ✅ Accurate sender identification (David Hauer / Coastal Key)
- ✅ Physical address (Stuart, FL 34994 — update to actual street address if different)
- ✅ Clear opt-out mechanism (reply "unsubscribe")
- ✅ Opt-out honored within 10 business days (enforced by `isUnsubReply()` in `handleSpearEmailReply`)
- ✅ No deceptive subject lines
- ✅ Commercial intent clear from opener

**Action item for today:** CEO to confirm or correct the physical address in `spear-email.js:42`. If Coastal Key's registered business address is different from "Stuart, FL 34994", update before first send.

---

## VI. DAY 1 SUCCESS CRITERIA

At end of day April 16, 2026, the following must be true:

| Criterion | Target | Owner |
|-----------|--------|-------|
| Code deployed to production | `spear-email/dashboard` returns 200 | TEC |
| Gmail OAuth healthy | `oauth/health` returns all secrets present | TEC |
| 5 partner emails sent | 5 × `spear-email/trigger` returning success | SEN |
| 5 funnel states in KV | 5 × `spear-email/status/:id` returning stage 1 | SEN |
| Physical address confirmed | CAN-SPAM footer matches actual address | CEO |
| Audit log populated | KV audit entries for each send | AUTO |

Anything less is a YELLOW on Friday's CEO Note. Two or more missed is a RED for Monday's status review.

---

## VII. WHAT HAPPENS NEXT

- **T+72h (April 19):** If zero replies, SEN manually drafts stage-3 EXPERT follow-ups via `/v1/email/send` directly. The funnel's auto-advance only fires on inbound reply; silence is a separate track that requires manual nudge until a scheduled job is added in Week 2.
- **Week 2 (April 20-26):** TCPA gate has run 72 hours clean on test numbers → Activation A begins for Sentinel voice + SMS SPEAR. First 10 consumer-cell targets get pre-call-checked and dialed.
- **Week 3 (April 27 - May 3):** Scale to 20 outbound email partners + 20 outbound SMS to consented leads. First discovery call booked.
- **Week 4 (May 4-10):** First signed contract. First Stripe transaction. First dollar.

---

## VIII. FAIL-SAFES

If anything in today's execution returns an error:

| Failure | Response |
|---------|----------|
| Gmail OAuth unhealthy | Halt. Do not fall back to SMTP. Fix OAuth first. |
| `spear-email/trigger` returns 500 | Halt the remaining sends. Investigate before continuing. |
| Email bounces (hard) | Remove from Airtable Leads; do not retry. |
| Unsubscribe received | Funnel auto-handles (`stage=-1`). No further contact. Confirm in Airtable. |
| FTC complaint received | Stop all email outbound immediately. Pause Activation B until CEO + legal review. |

---

## IX. FIVE WRITTEN DECISIONS MADE TODAY

Per CEO Operating Discipline v2.0, Decision Discipline — these are recorded as part of today's reversible operational decisions:

1. **SPEAR-Email is deployed as a new, separate funnel.** The SMS SPEAR is not deprecated; it waits for TCPA gate burn-in.
2. **5 partnership leads are the first real-world test of the funnel.** Consumer lead outreach waits until partnership funnel returns signal (reply rate, conversion rate).
3. **Manual reply parsing for Week 1.** Automation is in the backlog but not blocking first sends.
4. **Stuart, FL 34994 is the placeholder CAN-SPAM address.** CEO to confirm or correct today.
5. **First send window: today (April 16).** Not Monday. Not after the weekly review. Today.

---

*Coastal Key Enterprise — Launch Day 1 Execution Plan*
*Written per CEO Operating Discipline v2.0, Quality Gate G1*
*Reversible decisions — executed within the hour per Decision Discipline.*
