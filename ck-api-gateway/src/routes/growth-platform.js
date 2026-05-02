import { CERTIFICATION_TRACKS, RECRUITMENT_PIPELINE, REFERRAL_TIERS, getGrowthDashboard } from '../engines/growth-platform.js';
import { jsonResponse } from '../utils/response.js';

export function handleGrowthDashboard() {
  return jsonResponse(getGrowthDashboard());
}

export function handleGrowthCertifications(url) {
  const division = url.searchParams.get('division');
  const tracks = division
    ? CERTIFICATION_TRACKS.filter((t) => t.division === division.toUpperCase())
    : CERTIFICATION_TRACKS;
  return jsonResponse({ tracks, total: tracks.length });
}

export function handleGrowthRecruitment() {
  return jsonResponse(RECRUITMENT_PIPELINE);
}

export function handleGrowthReferrals() {
  return jsonResponse({ tiers: REFERRAL_TIERS, total: REFERRAL_TIERS.length });
}
