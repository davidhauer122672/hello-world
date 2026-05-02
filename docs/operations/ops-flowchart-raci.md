# Ops Flowchart & RACI Matrix

**Version**: 1.0.0
**Last Updated**: 2026-04-15
**Owner**: OPS Division / AI CEO
**Update Cadence**: Weekly

---

## Operations Flowchart

### Property Onboarding Flow

```
New Client Signed
    │
    ├─→ SEN Division: Lead converted, contract executed
    │
    ├─→ OPS Division: Property intake
    │   ├─→ OPS-002: Initial 47-point inspection
    │   ├─→ OPS-003: Sensor deployment (water, humidity, temperature)
    │   ├─→ OPS-004: Photo documentation (GPS-timestamped)
    │   └─→ OPS-005: Insurance compliance verification
    │
    ├─→ TEC Division: System provisioning
    │   ├─→ Airtable: Property record created
    │   ├─→ Client portal: Account provisioned
    │   └─→ Monitoring: Sensor alerts configured
    │
    ├─→ VEN Division: Vendor assignment
    │   ├─→ HVAC contractor assigned
    │   ├─→ Plumbing contractor assigned
    │   └─→ Landscaping contractor assigned
    │
    └─→ FIN Division: Billing setup
        ├─→ Stripe subscription created
        └─→ Revenue tracking initialized
```

### Inspection Workflow

```
Scheduled Inspection (Weekly/Bi-Weekly/Monthly)
    │
    ├─→ OPS Agent: Execute 47-point checklist
    │   ├─→ Exterior: Roof, gutters, landscaping, pool, security
    │   ├─→ Interior: HVAC, plumbing, electrical, appliances, pests
    │   └─→ Documentation: Photos, readings, notes
    │
    ├─→ AI Analysis: Anomaly detection
    │   ├─→ Normal: Report generated, client notified
    │   └─→ Anomaly Detected:
    │       ├─→ LOW: Log + next inspection flag
    │       ├─→ MEDIUM: VEN dispatch + client notification
    │       ├─→ HIGH: Immediate VEN dispatch + CEO alert
    │       └─→ CRITICAL: Emergency protocol + all channels
    │
    └─→ Client Report: Auto-generated, emailed within 2 hours
```

### Storm Protocol Flow

```
Hurricane/Tropical Storm Watch Issued
    │
    ├─→ PRE-STORM (72-24 hours before)
    │   ├─→ OPS: Secure all properties (shutters, furniture, utilities)
    │   ├─→ INT: Weather intelligence continuous monitoring
    │   ├─→ MKT: Client communication series (3 updates)
    │   └─→ VEN: Emergency vendor network activated
    │
    ├─→ DURING STORM
    │   ├─→ INT: Real-time monitoring via sensors
    │   ├─→ OPS: Standby for immediate response
    │   └─→ EXC: Client hotline staffed
    │
    └─→ POST-STORM (0-48 hours after)
        ├─→ OPS: Rapid assessment all properties
        ├─→ OPS: Photo documentation (insurance-grade)
        ├─→ VEN: Emergency repairs dispatched
        ├─→ FIN: Insurance claim support initiated
        └─→ MKT: Client status reports distributed
```

### Lead-to-Close Pipeline

```
Inbound Lead (Sentinel/Website/Referral)
    │
    ├─→ SEN Division: Speed-to-lead (<5 min)
    │   ├─→ AI qualification scoring
    │   ├─→ Segment assignment (Absentee/Luxury/Investor/Snowbird/STR)
    │   └─→ Drip enrollment (90-day sequence)
    │
    ├─→ Sentinel Voice AI: Outbound follow-up
    │   ├─→ Call attempt 1: Day 0
    │   ├─→ Call attempt 2: Day 1
    │   └─→ Call attempt 3: Day 3
    │
    ├─→ Appointment Set
    │   ├─→ Property walkthrough scheduled
    │   └─→ Proposal auto-generated
    │
    ├─→ Proposal Delivered
    │   ├─→ Follow-up sequence activated
    │   └─→ Objection handling via AI
    │
    └─→ Contract Signed → Onboarding Flow (above)
```

---

## RACI Matrix

**R** = Responsible | **A** = Accountable | **C** = Consulted | **I** = Informed

### Core Operations

| Activity | AI CEO | CEO/Founder | OPS | SEN | FIN | TEC | VEN | MKT | INT |
|----------|--------|-------------|-----|-----|-----|-----|-----|-----|-----|
| Property Onboarding | A | I | R | C | R | R | R | I | I |
| Weekly Inspections | A | I | R | — | — | C | C | — | I |
| Storm Protocol | A | C | R | — | R | R | R | R | R |
| Maintenance Dispatch | A | I | R | — | C | — | R | — | — |
| Client Reporting | A | I | R | — | — | C | — | — | — |
| Insurance Documentation | A | C | R | — | R | — | — | — | — |

### Sales & Marketing

| Activity | AI CEO | CEO/Founder | OPS | SEN | FIN | TEC | VEN | MKT | INT |
|----------|--------|-------------|-----|-----|-----|-----|-----|-----|-----|
| Lead Generation | A | I | — | R | — | C | — | R | R |
| Lead Qualification | A | I | — | R | — | — | — | — | C |
| Outbound Campaigns | A | C | — | R | — | — | — | C | — |
| Content Creation | A | C | — | — | — | — | — | R | C |
| Social Publishing | A | I | — | — | — | C | — | R | — |
| Market Intelligence | A | I | — | C | — | — | — | C | R |

### Finance & Administration

| Activity | AI CEO | CEO/Founder | OPS | SEN | FIN | TEC | VEN | MKT | INT |
|----------|--------|-------------|-----|-----|-----|-----|-----|-----|-----|
| Revenue Tracking | A | I | — | — | R | — | — | — | C |
| Billing & Collections | A | I | — | — | R | C | — | — | — |
| Budget Management | A | C | — | — | R | — | — | — | — |
| Vendor Payments | A | I | — | — | R | — | C | — | — |
| Financial Reporting | A | R | — | — | R | — | — | — | C |
| Capital Allocation (>$5K) | C | R | — | — | A | — | — | — | — |

### Technology & Infrastructure

| Activity | AI CEO | CEO/Founder | OPS | SEN | FIN | TEC | VEN | MKT | INT |
|----------|--------|-------------|-----|-----|-----|-----|-----|-----|-----|
| Platform Deployment | A | I | — | — | — | R | — | — | — |
| Fleet Monitoring | A | I | — | — | — | R | — | — | R |
| Security Audits | A | C | — | — | — | R | — | — | R |
| API Development | A | I | — | — | — | R | — | — | — |
| CI/CD Pipeline | A | I | — | — | — | R | — | — | — |
| Data Backup & Recovery | A | I | — | — | — | R | — | — | C |

---

## Escalation Matrix

| Severity | Response Time | Notification | Authority |
|----------|-------------- |-------------- |-----------|
| LOW | 48 hours | Slack #ops-alerts | AI CEO autonomous |
| MEDIUM | 24 hours | Slack #ops-alerts + email | AI CEO autonomous |
| HIGH | 4 hours | Slack #exec-briefing + SMS | AI CEO + CEO/Founder notified |
| CRITICAL | Immediate | All channels + phone call | CEO/Founder decision required |

---

*Updated by AI CEO. RACI reviewed quarterly by CEO/Founder.*
