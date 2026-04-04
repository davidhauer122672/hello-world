/**
 * Property Intelligence Routes
 *
 * GET  /v1/property-intel/search   — Query ArcGIS for Saint Lucie commercial parcels
 * POST /v1/property-intel/import   — Fetch parcels and import to Airtable
 * GET  /v1/property-intel/stats    — Summary stats of imported property data
 */

import { fetchParcels, importParcelsToAirtable } from '../services/property-intel.js';
import { listRecords } from '../services/airtable.js';
import { jsonResponse, errorResponse } from '../utils/response.js';
import { writeAudit } from '../utils/audit.js';

const PROPERTY_INTEL_TABLE = 'tblHxObVO2ldeSxDo';

/**
 * Search ArcGIS for commercial parcels (preview, no import).
 * Query params: limit, offset, minValue, useCodes (comma-separated)
 */
export async function handlePropertySearch(url, env) {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '25', 10), 100);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);
  const minValue = parseInt(url.searchParams.get('minValue') || '0', 10);
  const useCodesParam = url.searchParams.get('useCodes');
  const useCodes = useCodesParam ? useCodesParam.split(',').map(s => s.trim()) : null;

  const parcels = await fetchParcels({ limit, offset, minValue, useCodes });

  return jsonResponse({
    count: parcels.length,
    offset,
    limit,
    filters: { minValue, useCodes: useCodes || 'all' },
    parcels,
  });
}

/**
 * Fetch parcels from ArcGIS and import them into Airtable.
 * Body: { limit?, offset?, minValue?, useCodes?: string[] }
 */
export async function handlePropertyImport(request, env, ctx) {
  const body = await request.json();
  const {
    limit = 25,
    offset = 0,
    minValue = 200000,
    useCodes = null,
  } = body;

  const parcels = await fetchParcels({
    limit: Math.min(limit, 50), // Cap at 50 per import to stay within Airtable rate limits
    offset,
    minValue,
    useCodes,
  });

  if (parcels.length === 0) {
    return jsonResponse({ message: 'No parcels matched the given filters.', imported: 0 });
  }

  const imported = await importParcelsToAirtable(env, parcels);

  // Audit log
  writeAudit(env, ctx, '/v1/property-intel/import', {
    action: 'property_import',
    count: imported,
    filters: { limit, offset, minValue, useCodes },
  });

  return jsonResponse({
    message: `Successfully imported ${imported} commercial parcels into Property Intelligence.`,
    imported,
    sample: parcels.slice(0, 3).map(p => ({
      parcelId: p.parcelId,
      owner: p.ownerName,
      address: p.siteAddress,
      value: p.assessedValue,
      category: p.useCategory,
      potential: p.leadPotential,
    })),
  });
}

/**
 * Get summary stats from the Property Intelligence table.
 */
export async function handlePropertyStats(env) {
  const records = await listRecords(env, PROPERTY_INTEL_TABLE, {
    fields: ['Use Code', 'Assessed Value', 'Lead Potential', 'Service Zone', 'Status'],
    maxRecords: 1000,
  });

  const stats = {
    totalRecords: records.length,
    byUseCode: {},
    byLeadPotential: { High: 0, Medium: 0, Low: 0 },
    byServiceZone: {},
    byStatus: {},
    totalAssessedValue: 0,
  };

  for (const r of records) {
    const f = r.fields;
    const uc = f['Use Code'] || 'Unknown';
    const lp = f['Lead Potential'] || 'Low';
    const sz = f['Service Zone'] || 'Other';
    const st = f['Status'] || 'New';
    const val = f['Assessed Value'] || 0;

    stats.byUseCode[uc] = (stats.byUseCode[uc] || 0) + 1;
    stats.byLeadPotential[lp] = (stats.byLeadPotential[lp] || 0) + 1;
    stats.byServiceZone[sz] = (stats.byServiceZone[sz] || 0) + 1;
    stats.byStatus[st] = (stats.byStatus[st] || 0) + 1;
    stats.totalAssessedValue += val;
  }

  return jsonResponse(stats);
}
