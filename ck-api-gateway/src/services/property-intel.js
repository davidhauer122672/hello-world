/**
 * Property Intelligence Service
 *
 * Queries the Florida Statewide Cadastral ArcGIS FeatureServer for
 * Saint Lucie County commercial parcels and imports them to Airtable.
 *
 * Data source: Florida Dept. of Revenue via ArcGIS REST API
 * Target use codes: Office (11-19), Retail (21-29), Medical (36-38),
 *   Institutional (70-79), Industrial (41-49)
 */

import { createRecord } from './airtable.js';

const ARCGIS_BASE = 'https://services9.arcgis.com/Gh9awoU677aKree0/arcgis/rest/services/Florida_Statewide_Cadastral/FeatureServer/0';
const PROPERTY_INTEL_TABLE = 'tblHxObVO2ldeSxDo';

// Florida DOR use code ranges for commercial properties
const USE_CODE_RANGES = {
  Office:       { min: 11, max: 19 },
  Retail:       { min: 21, max: 29 },
  Medical:      { min: 36, max: 38 },
  Industrial:   { min: 41, max: 49 },
  Institutional:{ min: 70, max: 79 },
};

// Saint Lucie County FIPS code
const COUNTY_CODE = '111'; // St. Lucie = 111 in FL DOR numbering

/**
 * Map a Florida DOR use code number to a category name.
 */
function classifyUseCode(code) {
  const num = parseInt(code, 10);
  if (isNaN(num)) return 'Other Commercial';
  for (const [label, range] of Object.entries(USE_CODE_RANGES)) {
    if (num >= range.min && num <= range.max) return label;
  }
  return 'Other Commercial';
}

/**
 * Map a city/address to a Coastal Key service zone.
 */
function mapServiceZone(city, address) {
  const text = `${city || ''} ${address || ''}`.toLowerCase();
  if (text.includes('port st') || text.includes('port saint') || text.includes('psl')) return 'Port St. Lucie';
  if (text.includes('fort pierce') || text.includes('ft pierce') || text.includes('ft. pierce')) return 'Fort Pierce';
  if (text.includes('vero')) return 'Vero Beach';
  if (text.includes('sebastian')) return 'Sebastian';
  if (text.includes('stuart')) return 'Stuart';
  if (text.includes('jensen')) return 'Jensen Beach';
  if (text.includes('palm city')) return 'Palm City';
  if (text.includes('hutchinson') || text.includes('hobe sound')) return text.includes('hutchinson') ? 'Hutchinson Island' : 'Hobe Sound';
  return 'Other';
}

/**
 * Score lead potential based on assessed value and use code.
 */
function scoreLead(assessedValue, useCode) {
  const category = classifyUseCode(useCode);
  if (assessedValue >= 1000000 || category === 'Medical' || category === 'Industrial') return 'High';
  if (assessedValue >= 300000 || category === 'Office') return 'Medium';
  return 'Low';
}

/**
 * Build ArcGIS REST API query URL for Saint Lucie commercial parcels.
 */
function buildQueryUrl(options = {}) {
  const {
    offset = 0,
    limit = 100,
    minValue = 0,
    useCodes = null,
  } = options;

  // Build the where clause for commercial use codes in Saint Lucie County
  const useCodeClauses = [];
  const ranges = useCodes
    ? Object.entries(USE_CODE_RANGES).filter(([k]) => useCodes.includes(k))
    : Object.entries(USE_CODE_RANGES);

  for (const [, range] of ranges) {
    useCodeClauses.push(`(DOR_UC >= ${range.min} AND DOR_UC <= ${range.max})`);
  }

  let where = `CO_NO = ${COUNTY_CODE} AND (${useCodeClauses.join(' OR ')})`;
  if (minValue > 0) {
    where += ` AND JV >= ${minValue}`;
  }

  const params = new URLSearchParams({
    where,
    outFields: 'PARCEL_ID,OWN_NAME,PHY_ADDR1,PHY_CITY,PHY_ZIPCD,DOR_UC,JV,LND_VAL,IMP_VAL,TOT_LVG_AREA,ACT_YR_BLT,GIS_ACRES',
    returnGeometry: 'false',
    resultOffset: String(offset),
    resultRecordCount: String(limit),
    orderByFields: 'JV DESC',
    f: 'json',
  });

  return `${ARCGIS_BASE}/query?${params}`;
}

/**
 * Fetch commercial property parcels from ArcGIS.
 */
export async function fetchParcels(options = {}) {
  const url = buildQueryUrl(options);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`ArcGIS query failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`ArcGIS error: ${data.error.message || JSON.stringify(data.error)}`);
  }

  return (data.features || []).map(f => {
    const a = f.attributes;
    return {
      parcelId: a.PARCEL_ID,
      ownerName: a.OWN_NAME,
      siteAddress: a.PHY_ADDR1,
      city: a.PHY_CITY,
      zipCode: a.PHY_ZIPCD,
      useCode: a.DOR_UC,
      useCategory: classifyUseCode(a.DOR_UC),
      assessedValue: a.JV || 0,
      landValue: a.LND_VAL || 0,
      buildingValue: a.IMP_VAL || 0,
      acreage: a.GIS_ACRES || 0,
      yearBuilt: a.ACT_YR_BLT || null,
      serviceZone: mapServiceZone(a.PHY_CITY, a.PHY_ADDR1),
      leadPotential: scoreLead(a.JV || 0, a.DOR_UC),
    };
  });
}

/**
 * Import parcels into the Property Intelligence Airtable table.
 * Returns count of records created.
 */
export async function importParcelsToAirtable(env, parcels) {
  const today = new Date().toISOString().split('T')[0];
  let created = 0;

  for (const p of parcels) {
    await createRecord(env, PROPERTY_INTEL_TABLE, {
      'Parcel ID': p.parcelId,
      'Owner Name': p.ownerName,
      'Site Address': p.siteAddress,
      'City': p.city,
      'Zip Code': p.zipCode,
      'Use Code': p.useCategory,
      'Assessed Value': p.assessedValue,
      'Land Value': p.landValue,
      'Building Value': p.buildingValue,
      'Acreage': p.acreage,
      'Year Built': p.yearBuilt,
      'Service Zone': p.serviceZone,
      'Lead Potential': p.leadPotential,
      'Status': 'New',
      'Data Source': 'FL Statewide Cadastral — ArcGIS REST API',
      'Import Date': today,
    });
    created++;
  }

  return created;
}

export { PROPERTY_INTEL_TABLE, USE_CODE_RANGES, classifyUseCode, mapServiceZone, scoreLead };
