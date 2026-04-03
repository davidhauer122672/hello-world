/**
 * AI Skills Execution Routes
 * Modular skill execution engine for the mobile app.
 */

import { jsonResponse, errorResponse } from '../utils/response.js';

const SKILL_CATALOG = [
  { id: 'lead-scorer', name: 'Lead Scorer', category: 'Lead Conversion', description: 'AI-powered lead scoring in under 60 seconds', tier: 'starter' },
  { id: 'battle-plan', name: 'SCAA-1 Battle Plan', category: 'Lead Conversion', description: 'Generate personalized sales battle plans', tier: 'starter' },
  { id: 'objection-handler', name: 'Objection Handler', category: 'Lead Conversion', description: 'Generate rebuttals for any objection', tier: 'pro' },
  { id: 'call-prep', name: 'Call Prep', category: 'Lead Conversion', description: 'Research and talking points pre-call', tier: 'pro' },
  { id: 'investor-escalation', name: 'Investor Escalation', category: 'Lead Conversion', description: 'WF-3 pipeline for high-value leads', tier: 'enterprise' },
  { id: 'property-showcase', name: 'Property Showcase', category: 'Content Generation', description: 'Cinematic listing descriptions', tier: 'starter' },
  { id: 'email-composer', name: 'Email Composer', category: 'Content Generation', description: 'AI-drafted personalized emails', tier: 'starter' },
  { id: 'social-post', name: 'Social Post', category: 'Content Generation', description: 'Platform-optimized social content', tier: 'starter' },
  { id: 'video-script', name: 'Video Script', category: 'Content Generation', description: 'Property tour narration scripts', tier: 'pro' },
  { id: 'market-brief', name: 'Market Brief', category: 'Market Intel', description: 'Daily AI-generated market analysis', tier: 'starter' },
  { id: 'comp-analysis', name: 'Comp Analysis', category: 'Market Intel', description: 'Automated comparable property analysis', tier: 'pro' },
  { id: 'price-optimizer', name: 'Price Optimizer', category: 'Market Intel', description: 'AI pricing recommendations by zone', tier: 'pro' },
  { id: 'trend-scanner', name: 'Trend Scanner', category: 'Market Intel', description: 'Regional and national trend detection', tier: 'enterprise' },
  { id: 'maintenance-ai', name: 'Maintenance AI', category: 'Operations', description: 'Predictive maintenance scheduling', tier: 'pro' },
  { id: 'vendor-match', name: 'Vendor Match', category: 'Operations', description: 'AI-matched vendor assignments', tier: 'pro' },
  { id: 'inspection-ai', name: 'Inspection AI', category: 'Operations', description: 'Automated inspection reports', tier: 'starter' },
  { id: 'concierge', name: 'Concierge', category: 'Operations', description: 'Guest service automation', tier: 'enterprise' }
];

export function handleSkillsList(url) {
  const category = url.searchParams.get('category');
  const tier = url.searchParams.get('tier');
  let skills = [...SKILL_CATALOG];
  if (category) skills = skills.filter((s) => s.category === category);
  if (tier) skills = skills.filter((s) => s.tier === tier);
  return jsonResponse({ skills, total: skills.length });
}

export async function handleSkillExecute(request, env, ctx) {
  const body = await request.json();
  const { skillId, params } = body;

  if (!skillId) return errorResponse('skillId is required', 400);

  const skill = SKILL_CATALOG.find((s) => s.id === skillId);
  if (!skill) return errorResponse(`Skill not found: ${skillId}`, 404);

  // Log execution to audit
  if (env.AUDIT_LOG) {
    const key = `skill:${Date.now()}`;
    ctx.waitUntil(
      env.AUDIT_LOG.put(key, JSON.stringify({
        skillId,
        skillName: skill.name,
        category: skill.category,
        params,
        timestamp: new Date().toISOString()
      }), { expirationTtl: 86400 * 30 })
    );
  }

  return jsonResponse({
    execution: {
      skillId: skill.id,
      skillName: skill.name,
      status: 'executed',
      result: `Skill "${skill.name}" executed successfully.`,
      timestamp: new Date().toISOString()
    }
  });
}
