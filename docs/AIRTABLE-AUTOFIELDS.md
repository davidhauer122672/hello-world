# Airtable Auto-Fields — Division Lead Orchestrator v2.0

**Why this file exists.** The Airtable Create Table API does not support
`createdTime` or `formula` field types. Those fields have to be added in
the Airtable web UI after the table is created. This runbook covers the
three fields that are missing and the exact click path for each.

Base: `appUSnNgpDkcEOzhN`

Tables affected:
- Division Status — `tblZGLkgQ2qsGXNyJ`
- Division Queue — `tblloR93chkzuBGON`

---

## Field 1 — Division Status · `filed_at` (createdTime)

1. Open the base, open the **Division Status** table.
2. Click the `+` at the right end of the column header row.
3. **Field name:** `filed_at`
4. **Field type:** Created time
5. Leave **Include time** on. Time zone: `America/New_York`.
6. Click **Create field**.

Done-check: open any existing record. `filed_at` shows an ISO timestamp
matching when the record was created.

---

## Field 2 — Division Queue · `opened_at` (createdTime)

1. Open the **Division Queue** table.
2. Click the `+` at the right end of the column header row.
3. **Field name:** `opened_at`
4. **Field type:** Created time
5. Leave **Include time** on. Time zone: `America/New_York`.
6. Click **Create field**.

Done-check: the ten seeded records all show `opened_at` populated with
the time the seed ran.

---

## Field 3 — Division Queue · `days_open` (formula)

Must be added **after** Field 2, because the formula references
`opened_at`.

1. Open the **Division Queue** table.
2. Click the `+` at the right end of the column header row.
3. **Field name:** `days_open`
4. **Field type:** Formula
5. **Formula body:**
   ```
   DATETIME_DIFF(TODAY(), {opened_at}, 'days')
   ```
6. **Formatting:** Number, 0 decimal places.
7. Click **Create field**.

Done-check: each record shows an integer count of days since
`opened_at`. Seeded records created on 2026-04-21 should read `0`.

---

## Verification Checklist

After all three fields are added, verify:

- [ ] Division Status has 9 authored fields + 1 auto field (`filed_at`).
- [ ] Division Queue has 8 authored fields + 2 auto fields (`opened_at`,
      `days_open`).
- [ ] Opening any seeded Division Queue record shows `opened_at`
      populated and `days_open` computed.
- [ ] The `days_open` formula returns an integer (not an error string).

---

## What Not to Do

- Do not rename `opened_at` or `filed_at` later. Any downstream
  automation referencing the field name will break silently.
- Do not change `days_open` to return a non-integer. The Division Lead
  Orchestrator relies on integer-day comparison in the "no item older
  than 14 days without a written reason" rule.
- Do not delete records from either table. The operating contract
  requires archive, not delete.
