# ReTell AI — Custom Function Framework
**Version**: 1.0.0 | **Standard**: Red Bull Racing Optimization

## Architecture
ReTell Voice Agent → call_analyzed event → sentinel-webhook (primary) + ck-api-gateway (backup)
→ Router → Airtable (records) + Slack (alerts) + Atlas AI (revival)

## Function 1: transfer_call_to_tracey
Transfer to +17727638900 when prospect meets 2+ qualification criteria:
1. Owns property in Treasure Coast
2. Property vacant or seasonally occupied
3. Interest in property management/home watch
4. Dissatisfied with current oversight
5. Investment property $500K+

## Function 2: end_call
Dispositions: booked, callback_requested, not_interested, wrong_number, voicemail, do_not_call, no_answer
Routing: booked/callback → Leads + #sales-alerts | not_interested → 90-day drip | DNC → permanent suppression

## Function 3: classify_objection (Claude-powered)
Keyword fast-path (<50ms) + Claude API fallback (<500ms)
Types: competition_neighbor, price, urgency_absence, delay_think, delay_next_season, competition_pm_company

## Webhook: call_analyzed only
Failed (inactivity_timeout, machine_hangup, error) → Missed/Failed table + QA
Engaged (user_hangup, agent_hangup, call_transfer) → Leads table + #sales-alerts + Atlas sync

## Campaign: 40 concurrent agents, Mon-Sat 10AM-3PM ET, 2400 daily calls, claude-sonnet model
Targets: 480 connections (20%), 24 qualified (5%), 8 transfers (33%), 4 appointments (50%)
TCPA: DNC scrub, disclosure, recording consent enabled
