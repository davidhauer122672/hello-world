# Operations Manager Workflow — Decision Logic & Accountability
**Version**: 1.0.0 | **Standard**: Ferrari Precision

## Master Workflow: Sales → Closeout
Sales Intake → Measurement & Scope → Order Process → Production → Install → QA → Closeout & Billing

## Stage 1: Sales Intake
- Owner: Sales Rep | Accountable: Sales Manager | KPI: 40% lead-to-qualified
- Qualify within 15 minutes (speed-to-lead non-negotiable)
- Decision: Qualified → advance | Maybe → follow-up 48h (max 3) | No → archive + drip

## Stage 2: Measurement & Scope
- Owner: Estimator | Accountable: Ops Manager | KPI: 95% scope accuracy
- Site visit within 48h, scope document within 24h of visit
- Decision: Standard → estimate | Complex → Ops Manager review 24h | Out of scope → refer

## Stage 3: Order Process
- Owner: Coordinator | Accountable: Ops Manager | KPI: 98% order accuracy
- Verify materials, check inventory, assign crew, confirm schedule
- Decision: Materials available → confirm | Partial → adjust | Missing → escalate

## Stage 4: Production Execute
- Owner: Lead Tech | Accountable: Ops Manager | KPI: 90% on-time, >75% billable hours
- Pre-production checklist, daily progress photos, no deviations without approval
- Scope change: Minor (<10%) → field approval | Major (>10%) → change order + signature

## Stage 5: Install / Delivery
- Owner: Lead Tech | Accountable: Ops Manager | KPI: 85% first-time completion
- Clean site, walk client through, obtain sign-off
- Decision: Accepted → QA | Minor issues → fix on-site or 48h return | Major → escalate

## Stage 6: QA Inspection
- Owner: QA Inspector | Accountable: GM | KPI: <5% defect rate, >4.5/5 satisfaction
- Inspect against scope, check workmanship, confirm satisfaction within 48h
- Decision: Pass → closeout | Minor defect → 24h fix | Major defect → halt billing + RCA

## Stage 7: Closeout & Billing
- Owner: Admin | Accountable: Ops Manager/Owner | KPI: <30 DSO, 100% invoice accuracy
- Invoice within 24h of QA pass, follow up 7/14/21/30 days
- No payment >30d: direct call → written demand → collections/lien

## RACI: R=Responsible, A=Accountable, I=Informed

## Scale Triggers
- >20 leads/mo → dedicated sales rep
- >15 site visits/mo → dedicated estimator
- >$50K monthly revenue → multiple crews
- >40 jobs/mo → dedicated QA role
