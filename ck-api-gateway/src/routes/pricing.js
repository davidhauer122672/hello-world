/**
 * Dynamic Pricing Engine — AI-driven pricing recommendations.
 *
 *   POST /v1/pricing/recommend — Generate pricing recommendation for a property
 *   GET  /v1/pricing/zones     — Get zone-level pricing benchmarks
 *
 * Uses Claude inference to analyze property attributes, market data,
 * and competitive positioning to recommend management fee structures.
 */

import { inference } from '../services/anthropic.js';
import { getRecord, listRecords, TABLES } from '../services/airtable.js';
import { writeAudit } from '../utils/audit.js';
import { jsonResponse, errorResponse } from '../utils/response.js';

// ── Zone-level base rates (monthly management fee %) ────────────────────────

const ZONE_BASE_RATES = {
  'Vero Beach':        { base: 10, range: [8, 14], avgPropertyValue: 650000 },
  'Sebastian':         { base: 9,  range: [7, 12], avgPropertyValue: 425000 },
  'Fort Pierce':       { base: 9,  range: [7, 12], avgPropertyValue: 380000 },
  'Port Saint Lucie':  { base: 8,  range: [6, 11], avgPropertyValue: 350000 },
  'Jensen Beach':      { base: 10, range: [8, 13], avgPropertyValue: 520000 },
  'Palm City':         { base: 10, range: [8, 14], avgPropertyValue: 580000 },
  'Stuart':            { base: 10, range: [8, 14], avgPropertyValue: 550000 },
  'Hutchinson Island': { base: 12, range: [9, 15], avgPropertyValue: 750000 },
  'Fellsmere':         { base: 8,  range: [6, 10], avgPropertyValue: 280000 },
  'Tradition':         { base: 8,  range: [6, 11], avgPropertyValue: 360000 },
};

/**
 * POST /v1/pricing/recommend — Generate dynamic pricing recommendation.
 *
 * Body:
 *   propertyId  (string, optional) — Airtable record ID from Properties table
 *   zone        (string, required if no propertyId) — Service zone name
 *   bedrooms    (number, optional)
 *   bathrooms   (number, optional)
 *   sqft        (number, optional)
 *   propertyValue (number, optional)
 *   rentalType  (string, optional) — "short_term" | "long_term" | "hybrid"
 *   amenities   (string[], optional) — e.g. ["pool", "waterfront", "gated"]
 */
export async function handlePricingRecommend(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body.', 400);
  }

  let propertyData = {};

  // If propertyId provided, fetch from Airtable
  if (body.propertyId) {
    try {
      const record = await getRecord(env, TABLES.PROPERTIES, body.propertyId);
      propertyData = record.fields;
    } catch (err) {
      return errorResponse(`Failed to fetch property: ${err.message}`, 502);
    }
  }

  const zone = body.zone || propertyData['Service Zone'] || null;
  if (!zone) {
    return errorResponse('"zone" is required (or provide a propertyId with a Service Zone).', 400);
  }

  const zoneRates = ZONE_BASE_RATES[zone] || { base: 9, range: [7, 13], avgPropertyValue: 400000 };
  const propertyValue = body.propertyValue || propertyData['Property Value'] || zoneRates.avgPropertyValue;
  const rentalType = body.rentalType || propertyData['Rental Type'] || 'long_term';
  const bedrooms = body.bedrooms || propertyData['Bedrooms'] || 'Unknown';
  const bathrooms = body.bathrooms || propertyData['Bathrooms'] || 'Unknown';
  const sqft = body.sqft || propertyData['Square Footage'] || 'Unknown';
  const amenities = body.amenities || [];

  const propertyContext = [
    `Zone: ${zone}`,
    `Property Value: $${Number(propertyValue).toLocaleString()}`,
    `Zone Base Rate: ${zoneRates.base}% (range: ${zoneRates.range[0]}-${zoneRates.range[1]}%)`,
    `Zone Avg Property Value: $${zoneRates.avgPropertyValue.toLocaleString()}`,
    `Rental Type: ${rentalType}`,
    `Bedrooms: ${bedrooms}`,
    `Bathrooms: ${bathrooms}`,
    `Square Footage: ${sqft}`,
    `Amenities: ${amenities.length > 0 ? amenities.join(', ') : 'None specified'}`,
  ].join('\n');

  let aiResult;
  try {
    aiResult = await inference(env, {
      system: `You are the Coastal Key Dynamic Pricing Engine. You analyze property attributes, market conditions, and competitive positioning on Florida's Treasure Coast to recommend optimal management fee structures. Your recommendations maximize client conversion while maintaining profitability. Always output valid JSON.`,
      prompt: `Generate a pricing recommendation for this property. Return a JSON object with these fields:
- recommendedRate (number, % monthly management fee)
- monthlyFee (number, estimated $ monthly fee)
- annualRevenue (number, projected annual revenue from this property)
- tier (string: "premium", "standard", or "value")
- rationale (string, 2-3 sentences explaining the recommendation)
- competitivePosition (string: "above_market", "at_market", "below_market")
- upsellOpportunities (string[], list of add-on services to recommend)
- confidenceScore (number, 0-100)

Property Data:
${propertyContext}

Consider: rental type premium (short-term commands higher fees), amenity premium (pool/waterfront add value), zone competition, and property value relative to zone average.`,
      tier: 'standard',
      maxTokens: 1500,
      cacheKey: `pricing:${zone}:${propertyValue}:${rentalType}`,
      cacheTtl: 3600,
    });
  } catch (err) {
    return errorResponse(`Pricing inference failed: ${err.message}`, 502);
  }

  // Parse AI response as JSON
  let recommendation;
  try {
    const jsonMatch = aiResult.content.match(/\{[\s\S]*\}/);
    recommendation = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: aiResult.content };
  } catch {
    recommendation = { raw: aiResult.content };
  }

  writeAudit(env, ctx, {
    route: '/v1/pricing/recommend',
    action: 'pricing_recommendation',
    zone,
    propertyValue,
    rentalType,
    model: aiResult.model,
    cached: aiResult.cached,
  });

  return jsonResponse({
    recommendation,
    zone,
    zoneRates,
    propertyValue,
    model: aiResult.model,
    cached: aiResult.cached,
  });
}

/**
 * GET /v1/pricing/zones — Return zone-level pricing benchmarks.
 */
export function handlePricingZones() {
  const zones = Object.entries(ZONE_BASE_RATES).map(([name, data]) => ({
    zone: name,
    baseRate: data.base,
    rateRange: data.range,
    avgPropertyValue: data.avgPropertyValue,
    estimatedMonthlyFee: Math.round(data.avgPropertyValue * (data.base / 100) / 12),
  }));

  return jsonResponse({ zones, count: zones.length });
}
