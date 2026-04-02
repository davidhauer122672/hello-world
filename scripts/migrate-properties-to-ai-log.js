#!/usr/bin/env node
/**
 * Migration Script: Properties Table Cleanup
 *
 * Problem: 17 records containing Airtable Automation scheduling metadata
 * (week_of_year, date_year, next_occurrence, etc.) were incorrectly written
 * to the Properties table (tblT0wq21qxU1KJNM) by a misconfigured automation.
 *
 * Solution: Transfer these records to AI_LOG (tblZ0bgRmH7KQiZyf) as
 * automation run logs, then delete them from Properties.
 *
 * Usage:
 *   AIRTABLE_API_KEY=pat... node scripts/migrate-properties-to-ai-log.js
 *
 * Add --dry-run to preview without making changes.
 */

const BASE_ID = 'appUSnNgpDkcEOzhN';
const PROPERTIES_TABLE = 'tblT0wq21qxU1KJNM';
const AI_LOG_TABLE = 'tblZ0bgRmH7KQiZyf';
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

// Scheduling metadata fields that indicate misplaced automation data
const SCHEDULING_FIELDS = [
  'week_of_year', 'date_year', 'date_month', 'date_day',
  'time_hour', 'time_minute', 'time_second',
  'day_of_week', 'pretty_day_of_week', 'pretty_date',
  'pretty_time', 'next_occurrence', 'pretty_next_occurrence',
];

async function listAllRecords(tableId) {
  const records = [];
  let offset = null;

  do {
    const params = new URLSearchParams({ pageSize: '100' });
    if (offset) params.set('offset', offset);

    const res = await fetch(`${API}/${BASE_ID}/${tableId}?${params}`, { headers });
    if (!res.ok) throw new Error(`List failed (${res.status}): ${await res.text()}`);

    const data = await res.json();
    records.push(...data.records);
    offset = data.offset;
  } while (offset);

  return records;
}

function isSchedulingRecord(record) {
  const fieldNames = Object.keys(record.fields);
  return SCHEDULING_FIELDS.some(f => fieldNames.includes(f));
}

async function createAiLogRecords(records) {
  // Airtable allows max 10 records per batch
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  const created = [];
  for (const batch of batches) {
    const payload = {
      records: batch.map(r => ({
        fields: {
          'Log Type': 'Automation Run - Migrated from Properties',
          'Timestamp': r.fields.id || r.fields.next_occurrence || new Date().toISOString(),
          'Details': JSON.stringify(r.fields, null, 2),
          'Source': 'properties-table-cleanup',
        },
      })),
      typecast: true,
    };

    const res = await fetch(`${API}/${BASE_ID}/${AI_LOG_TABLE}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`AI_LOG create failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    created.push(...data.records);
    console.log(`  Created ${data.records.length} AI_LOG records`);
  }

  return created;
}

async function deleteRecords(tableId, recordIds) {
  // Airtable allows max 10 deletes per request
  const batches = [];
  for (let i = 0; i < recordIds.length; i += 10) {
    batches.push(recordIds.slice(i, i + 10));
  }

  for (const batch of batches) {
    const params = batch.map(id => `records[]=${id}`).join('&');
    const res = await fetch(`${API}/${BASE_ID}/${tableId}?${params}`, {
      method: 'DELETE',
      headers,
    });

    if (!res.ok) throw new Error(`Delete failed (${res.status}): ${await res.text()}`);
    const data = await res.json();
    console.log(`  Deleted ${data.records.length} records from ${tableId}`);
  }
}

async function main() {
  console.log(DRY_RUN ? '=== DRY RUN ===' : '=== MIGRATION START ===');
  console.log();

  // Step 1: Read all Properties records
  console.log('Step 1: Reading Properties table...');
  const allRecords = await listAllRecords(PROPERTIES_TABLE);
  console.log(`  Found ${allRecords.length} total records`);

  // Step 2: Identify scheduling metadata records
  const schedulingRecords = allRecords.filter(isSchedulingRecord);
  const propertyRecords = allRecords.filter(r => !isSchedulingRecord(r));
  console.log(`  ${schedulingRecords.length} scheduling metadata records (to migrate)`);
  console.log(`  ${propertyRecords.length} legitimate property records (to keep)`);
  console.log();

  if (schedulingRecords.length === 0) {
    console.log('No scheduling records found. Nothing to migrate.');
    return;
  }

  // Show sample record
  console.log('Sample scheduling record fields:');
  console.log(JSON.stringify(schedulingRecords[0].fields, null, 2));
  console.log();

  if (DRY_RUN) {
    console.log('DRY RUN: No changes made. Remove --dry-run to execute.');
    return;
  }

  // Step 3: Create AI_LOG entries
  console.log('Step 2: Creating AI_LOG entries...');
  await createAiLogRecords(schedulingRecords);
  console.log();

  // Step 4: Delete from Properties
  console.log('Step 3: Deleting scheduling records from Properties...');
  const idsToDelete = schedulingRecords.map(r => r.id);
  await deleteRecords(PROPERTIES_TABLE, idsToDelete);
  console.log();

  // Step 5: Verify
  console.log('Step 4: Verifying...');
  const remaining = await listAllRecords(PROPERTIES_TABLE);
  console.log(`  Properties table now has ${remaining.length} records`);

  console.log();
  console.log('=== MIGRATION COMPLETE ===');
  console.log(`  Migrated: ${schedulingRecords.length} records → AI_LOG`);
  console.log(`  Remaining in Properties: ${remaining.length}`);
}

main().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
