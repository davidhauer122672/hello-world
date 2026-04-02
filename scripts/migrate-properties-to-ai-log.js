#!/usr/bin/env node
/**
 * Properties Table Cleanup — Delete misplaced automation records
 *
 * Problem: 17 records containing Airtable Automation scheduling metadata
 * (week_of_year, date_year, next_occurrence, etc.) were incorrectly written
 * to the Properties table (tblT0wq21qxU1KJNM) by a misconfigured automation.
 *
 * The scheduling data has already been archived to AI_LOG (recowbUxmHyh2jBA7).
 * This script deletes the 17 junk records from Properties.
 *
 * Usage:
 *   AIRTABLE_API_KEY=pat... node scripts/migrate-properties-to-ai-log.js
 *
 * Add --dry-run to preview without making changes.
 */

const BASE_ID = 'appUSnNgpDkcEOzhN';
const PROPERTIES_TABLE = 'tblT0wq21qxU1KJNM';
const API = 'https://api.airtable.com/v0';

const API_KEY = process.env.AIRTABLE_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!API_KEY) {
  console.error('ERROR: Set AIRTABLE_API_KEY environment variable.');
  console.error('Usage: AIRTABLE_API_KEY=pat... node scripts/migrate-properties-to-ai-log.js');
  process.exit(1);
}

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
};

// All 17 junk record IDs confirmed via Airtable MCP on 2026-04-02
const RECORDS_TO_DELETE = [
  'rec2bIO1JGeJjp1ti',  // "2026 12:00:00 AM +00:00"
  'rec4axUGINtqksGmY',  // "week_of_year": 10
  'rec4dyNvo6NAyqtbT',  // "2026"
  'rec6YVaowvsMQRa73',  // {"id": "2026-03-05T02:22:51Z"
  'rec9e8uzsXepzFqJi',  // "pretty_date": "Mar 5"
  'recBqeFnedCLu8cZd',  // "date_year": "2026"
  'recElWCCtrGUfI6DN',  // "time_minute": "22"
  'recIT294JSRn1j1Fd',  // "date_day": "5"
  'recLLKtJZeq7olJr1',  // "next_occurrence": "2026-03-06T00:00:00Z"
  'recRGSMlIXkbN8kwX',  // "time_hour": "2"
  'recRnCUzucxb1jYUd',  // "pretty_next_occurrence": "Mar 06"
  'recTv9NgtYhtVhzf5',  // "pretty_time": "02:22:51 AM"
  'recWDU7OO99zWC96X',  // "time_second": "51"
  'recamXLOxedJoIIT4',  // "date_month": "3"
  'recd3gqQ0U51OgyJR',  // "pretty_day_of_week": "Thursday"
  'rece9O7IOjTODK0xC',  // "day_of_week": "3"
  'recvFuBxwIS89MV9f',  // Empty record — Status: Maintenance only
];

async function deleteRecords(recordIds) {
  // Airtable allows max 10 deletes per request
  const batches = [];
  for (let i = 0; i < recordIds.length; i += 10) {
    batches.push(recordIds.slice(i, i + 10));
  }

  let totalDeleted = 0;
  for (const batch of batches) {
    const params = batch.map(id => `records[]=${id}`).join('&');
    const url = `${API}/${BASE_ID}/${PROPERTIES_TABLE}?${params}`;

    if (DRY_RUN) {
      console.log(`  [DRY RUN] Would DELETE ${batch.length} records: ${batch.join(', ')}`);
      totalDeleted += batch.length;
      continue;
    }

    const res = await fetch(url, { method: 'DELETE', headers });
    if (!res.ok) throw new Error(`Delete failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    totalDeleted += data.records.length;
    console.log(`  Deleted batch of ${data.records.length} records`);
  }

  return totalDeleted;
}

async function verifyEmpty() {
  const url = `${API}/${BASE_ID}/${PROPERTIES_TABLE}?pageSize=1`;
  const res = await fetch(url, { method: 'GET', headers });
  if (!res.ok) throw new Error(`Verify failed (${res.status}): ${await res.text()}`);
  const data = await res.json();
  return data.records.length;
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== PROPERTIES TABLE CLEANUP ===');
  console.log(`  Target: ${RECORDS_TO_DELETE.length} junk records in Properties table`);
  console.log(`  AI_LOG archive: recowbUxmHyh2jBA7 (already created)`);
  console.log();

  console.log('Deleting records from Properties table...');
  const deleted = await deleteRecords(RECORDS_TO_DELETE);
  console.log(`  Total deleted: ${deleted}`);
  console.log();

  if (!DRY_RUN) {
    console.log('Verifying...');
    const remaining = await verifyEmpty();
    console.log(`  Properties table now has ${remaining} records`);
    console.log();
    console.log(remaining === 0
      ? '=== SUCCESS: Properties table is now empty ==='
      : `=== WARNING: ${remaining} records still remain ===`);
  } else {
    console.log('DRY RUN complete. Remove --dry-run to execute.');
  }
}

main().catch(err => {
  console.error('Cleanup failed:', err.message);
  process.exit(1);
});
