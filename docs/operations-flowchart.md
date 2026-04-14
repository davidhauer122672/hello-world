# Operations Manager Workflow — Decision Logic & Accountability Framework
**Version**: 1.0.0 | **Classification**: Operations-Grade | **Standard**: Ferrari Precision

> If a new operations manager can't run the department with this document alone, it fails the test.

---

## Master Workflow: Sales → Closeout

```
┌──────────┐    ┌─────────────┐    ┌──────────┐    ┌────────────┐
│  SALES   │───▶│ MEASUREMENT │───▶│  ORDER   │───▶│ PRODUCTION │
│  INTAKE  │    │   & SCOPE   │    │ PROCESS  │    │  EXECUTE   │
└──────────┘    └─────────────┘    └──────────┘    └────────────┘
                                                         │
┌──────────┐    ┌─────────────┐    ┌──────────┐         │
│ CLOSEOUT │◀───│     QA      │◀───│ INSTALL  │◀────────┘
│ & BILLING│    │ INSPECTION  │    │ DELIVERY │
└──────────┘    └─────────────┘    └──────────┘
```

---

## Stage 1: Sales Intake

**Owner**: Sales Representative
**Accountable**: Sales Manager
**KPI**: Lead-to-qualified conversion rate (target: 40%)

### Process
1. Inbound lead received (phone, web form, referral, walk-in)
2. Qualify within 15 minutes (speed-to-lead is non-negotiable)
3. Capture: Name, contact, property address, service type, timeline, budget range
4. Enter into CRM / Airtable pipeline

### Decision Node
```
Is the lead qualified?
├── YES → Advance to Measurement & Scope
├── MAYBE → Schedule follow-up within 48 hours
│           └── After 3 follow-ups with no response → Archive
└── NO → Log reason, archive, add to nurture drip (90-day sequence)
```

### Bottleneck Flags
- Lead response time >15 min = lost opportunity (Harvard study: 10x decay after 5 min)
- No CRM entry = invisible pipeline = no forecasting
- Qualification criteria undefined = garbage in, garbage out

---

## Stage 2: Measurement & Scope

**Owner**: Field Technician / Estimator
**Accountable**: Operations Manager
**KPI**: Scope accuracy rate (target: 95% — actual vs. estimated within 5%)

### Process
1. Schedule site visit within 48 hours of qualification
2. Document property conditions (photos, measurements, notes)
3. Identify scope of work with line-item detail
4. Flag any structural, access, or permitting issues
5. Deliver scope document to client within 24 hours of visit

### Decision Node
```
Is the scope achievable within standard parameters?
├── YES → Generate estimate, advance to Order
├── COMPLEX → Escalate to Operations Manager for review
│             └── Ops Manager approves or modifies within 24 hours
└── OUT OF SCOPE → Refer to partner vendor, log referral
```

### Bottleneck Flags
- Site visit backlog >5 days = capacity problem (hire or reallocate)
- Scope revisions >2 per job = estimator training needed
- Missing photos/measurements = rework guaranteed

---

## Stage 3: Order Process

**Owner**: Office Administrator / Order Coordinator
**Accountable**: Operations Manager
**KPI**: Order accuracy rate (target: 98%)

### Process
1. Convert approved estimate to work order
2. Verify all materials, quantities, and specifications
3. Check inventory / place supplier orders
4. Confirm delivery dates align with production schedule
5. Assign production crew and schedule start date
6. Send client confirmation with timeline

### Decision Node
```
Are all materials available for scheduled start?
├── YES → Confirm schedule, advance to Production
├── PARTIAL → Identify missing items
│             ├── Available within 3 days → Hold, adjust schedule
│             └── Backorder >7 days → Notify client, offer alternatives
└── NO → Escalate to Operations Manager immediately
```

### Bottleneck Flags
- Material shortages discovered after production starts = catastrophic
- No supplier backup list = single point of failure
- Order placed without client payment confirmation = financial risk

---

## Stage 4: Production Execute

**Owner**: Lead Technician / Crew Foreman
**Accountable**: Operations Manager
**KPI**: On-time completion rate (target: 90%), labor efficiency (billable hours / total hours >75%)

### Process
1. Pre-production checklist: materials on-site, tools verified, crew briefed
2. Execute work per scope document — no deviations without approval
3. Daily progress documentation (photos, notes, hours logged)
4. Flag any scope changes immediately — get written approval before proceeding
5. Complete punch list items same day, not next visit

### Decision Node
```
Is production on schedule?
├── YES → Continue to completion
├── DELAYED (weather/access) → Document, notify client, adjust timeline
├── DELAYED (labor) → Reallocate crew or authorize overtime
│                     └── If >2 days behind → Ops Manager intervention
└── SCOPE CHANGE REQUESTED
    ├── Minor (<10% cost impact) → Field approval, document, adjust invoice
    └── Major (>10% cost impact) → Full change order, client signature required
```

### Bottleneck Flags
- Crew arrives without materials = wasted labor day ($500–$1,500 loss)
- No daily progress photos = no proof of work, no dispute protection
- Scope creep without documentation = margin erosion
- Overtime >20% of total hours = scheduling or estimating problem

---

## Stage 5: Install / Delivery

**Owner**: Lead Technician
**Accountable**: Operations Manager
**KPI**: First-time completion rate (target: 85% — no return visits required)

### Process
1. Final installation per specifications
2. Clean job site — leave it better than you found it
3. Walk client through completed work
4. Document completion with timestamped photos
5. Obtain client sign-off (digital or physical)

### Decision Node
```
Does the client accept the completed work?
├── YES → Advance to QA Inspection
├── MINOR ISSUES → Address on-site within 2 hours if possible
│                   └── If not possible → Schedule return within 48 hours
└── MAJOR ISSUES → Escalate to Operations Manager
                   └── Root cause analysis within 24 hours
                   └── Remediation plan to client within 48 hours
```

### Bottleneck Flags
- No client sign-off = no proof of acceptance = liability exposure
- Return visits >15% of jobs = quality problem upstream
- Missing completion photos = no defense in disputes

---

## Stage 6: QA Inspection

**Owner**: QA Inspector (or Operations Manager if no dedicated QA)
**Accountable**: General Manager
**KPI**: Defect rate (target: <5%), client satisfaction score (target: >4.5/5)

### Process
1. Inspect completed work against original scope
2. Check workmanship standards (Ferrari standard — zero visible defects)
3. Verify all punch list items resolved
4. Confirm client satisfaction (call or survey within 48 hours)
5. Log inspection results

### Decision Node
```
Does the work meet quality standards?
├── PASS → Advance to Closeout
├── MINOR DEFECT → Return to Install for correction (24-hour SLA)
└── MAJOR DEFECT → Halt billing
                   └── Root cause analysis
                   └── Crew retraining if pattern detected
                   └── Remediate and re-inspect
```

### Bottleneck Flags
- No QA process = quality is accidental, not engineered
- Same defect type recurring >3 times = systemic training gap
- QA backlog >48 hours = billing delays cascade

---

## Stage 7: Closeout & Billing

**Owner**: Office Administrator
**Accountable**: Operations Manager / Owner
**KPI**: Days Sales Outstanding (target: <30 days), invoice accuracy (target: 100%)

### Process
1. Generate final invoice with line-item detail matching scope + any change orders
2. Attach completion photos and client sign-off
3. Send invoice within 24 hours of QA pass
4. Follow up: 7 days, 14 days, 21 days, 30 days (escalating)
5. Close job in system, archive documentation

### Decision Node
```
Is payment received within terms?
├── YES → Close job, trigger client review request, add to maintenance drip
├── PARTIAL → Apply payment, follow up on balance
└── NO PAYMENT >30 DAYS
    ├── Attempt 1: Direct call from Operations Manager
    ├── Attempt 2: Written demand (certified mail / email)
    └── Attempt 3: Collections process or lien filing (if applicable)
```

### Bottleneck Flags
- Invoice sent >72 hours after completion = money left on table
- No follow-up cadence = AR aging balloons
- Incomplete documentation = client disputes you can't win

---

## RACI Matrix

| Activity | Sales Rep | Estimator | Coordinator | Lead Tech | QA | Ops Manager | Owner |
|----------|:---------:|:---------:|:-----------:|:---------:|:--:|:-----------:|:-----:|
| Lead Qualification | **R** | | | | | **A** | I |
| Site Measurement | I | **R** | | | | **A** | |
| Estimate Creation | | **R** | | | | **A** | I |
| Order Processing | | | **R** | | | **A** | |
| Production | | | I | **R** | | **A** | |
| Installation | | | | **R** | | **A** | |
| QA Inspection | | | | | **R** | **A** | I |
| Invoicing | | | **R** | | | **A** | I |
| Collections | | | **R** | | | I | **A** |

**R** = Responsible (does the work) | **A** = Accountable (owns the outcome) | **I** = Informed

---

## KPI Dashboard

| Metric | Target | Frequency | Owner |
|--------|--------|-----------|-------|
| Lead response time | <15 min | Real-time | Sales Manager |
| Lead-to-qualified rate | 40% | Weekly | Sales Manager |
| Scope accuracy | 95% | Monthly | Operations Manager |
| Order accuracy | 98% | Monthly | Coordinator |
| On-time completion | 90% | Weekly | Operations Manager |
| Labor efficiency | >75% billable | Weekly | Operations Manager |
| First-time completion | 85% | Monthly | Operations Manager |
| Defect rate | <5% | Monthly | QA / GM |
| Client satisfaction | >4.5/5 | Monthly | Operations Manager |
| Days Sales Outstanding | <30 days | Monthly | Owner |
| Invoice accuracy | 100% | Monthly | Coordinator |

---

## Scalability Logic: Small → Mid-Size

| Stage | Small (1–3 crew) | Mid-Size (4–10 crew) | Scale Trigger |
|-------|-------------------|----------------------|---------------|
| Sales | Owner handles | Dedicated sales rep | >20 leads/month |
| Measurement | Owner/tech | Dedicated estimator | >15 site visits/month |
| Orders | Owner/admin | Order coordinator | >30 work orders/month |
| Production | 1 crew | Multiple crews + foremen | >$50K monthly revenue |
| QA | Owner spot-checks | Dedicated QA role | >40 jobs/month |
| Billing | Owner/bookkeeper | Office admin + AR specialist | >$100K monthly revenue |

**Rule**: When any single person is the bottleneck for >70% of a stage's throughput, it's time to hire. Not before, not after.

---

## Stress Test Scenarios

### Scenario: 2-Week Material Delay
- **Impact**: 4 jobs delayed, crew idle, client complaints
- **Response**: Activate backup supplier list, reassign crew to jobs with materials on-hand, notify affected clients within 4 hours
- **Prevention**: Maintain 2 approved suppliers per material category

### Scenario: Key Technician Quits
- **Impact**: Active jobs disrupted, institutional knowledge lost
- **Response**: Cross-training matrix ensures no single-person dependency. Redistribute jobs within 24 hours.
- **Prevention**: Document every process. No tribal knowledge.

### Scenario: Client Disputes Quality
- **Impact**: Payment withheld, reputation risk
- **Response**: QA photos + client sign-off = evidence. Offer remediation within 48 hours. Escalate to management if unresolved in 7 days.
- **Prevention**: Never skip the sign-off step.

### Scenario: Cash Crunch (AR >45 days)
- **Impact**: Can't fund next job's materials, payroll pressure
- **Response**: Accelerate collections, enforce deposit requirements on new jobs (50% upfront), pause non-essential spending
- **Prevention**: Invoice within 24 hours. Follow up on Day 7. No exceptions.
