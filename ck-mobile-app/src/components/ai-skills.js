/**
 * Coastal Key Mobile App — AI Skills Marketplace
 * Modular, reusable automation modules with cinematic previews
 */

export function renderAISkills() {
  return `
    <!-- Skills Header -->
    <div class="flex justify-between items-center mb-lg" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
      <div>
        <h2 style="font-size:1.35rem;">AI Skills</h2>
        <p class="text-sm text-dim" style="margin-top:4px;">Modular automation at your command</p>
      </div>
      <span class="tag tag-gold">42 Skills</span>
    </div>

    <!-- Category Filter -->
    <div style="display:flex;gap:var(--space-xs);overflow-x:auto;padding-bottom:var(--space-sm);margin-bottom:var(--space-lg);-webkit-overflow-scrolling:touch;">
      <span class="tag tag-gold">All</span>
      <span class="tag tag-red">Lead Conversion</span>
      <span class="tag tag-purple">Content Gen</span>
      <span class="tag tag-blue">Market Intel</span>
      <span class="tag tag-green">Investor</span>
    </div>

    <!-- Featured Skill -->
    <div class="section-header">
      <span class="section-title">Featured</span>
      <button class="section-action">Favorites</button>
    </div>
    <div class="card-hero mb-lg" style="padding:var(--space-lg);">
      <div style="font-size:2rem;margin-bottom:var(--space-sm);">&#9889;</div>
      <h3 style="font-size:1.1rem;margin-bottom:4px;">SCAA-1 Battle Plan Generator</h3>
      <p style="font-size:0.78rem;color:#a1a1aa;margin-bottom:var(--space-md);line-height:1.5;">Generate personalized sales battle plans for qualified leads. Includes talking points, email drafts, and objection handling.</p>
      <div style="display:flex;gap:var(--space-sm);margin-bottom:var(--space-md);">
        <span class="tag tag-gold">Advanced</span>
        <span class="tag tag-green">97% Success Rate</span>
      </div>
      <button class="btn btn-execute w-full" style="width:100%;">Execute Skill</button>
    </div>

    <!-- Skill Grid -->
    <div class="section-header">
      <span class="section-title">Lead Conversion</span>
    </div>
    <div class="skill-grid mb-lg" style="margin-bottom:var(--space-lg);">
      ${renderSkillCard('&#127919;', 'Lead Scorer', 'AI-powered scoring in <60s', 'red')}
      ${renderSkillCard('&#128161;', 'Objection Handler', 'Generate rebuttals for any objection', 'amber')}
      ${renderSkillCard('&#128222;', 'Call Prep', 'Research + talking points pre-call', 'blue')}
      ${renderSkillCard('&#128640;', 'Investor Escalation', 'WF-3 pipeline for high-value leads', 'purple')}
    </div>

    <div class="section-header">
      <span class="section-title">Content Generation</span>
    </div>
    <div class="skill-grid mb-lg" style="margin-bottom:var(--space-lg);">
      ${renderSkillCard('&#128247;', 'Property Showcase', 'Cinematic listing descriptions', 'gold')}
      ${renderSkillCard('&#128232;', 'Email Composer', 'AI-drafted personalized emails', 'green')}
      ${renderSkillCard('&#128241;', 'Social Post', 'Platform-optimized social content', 'blue')}
      ${renderSkillCard('&#127909;', 'Video Script', 'Property tour narration scripts', 'purple')}
    </div>

    <div class="section-header">
      <span class="section-title">Market Intelligence</span>
    </div>
    <div class="skill-grid mb-lg" style="margin-bottom:var(--space-lg);">
      ${renderSkillCard('&#128200;', 'Market Brief', 'Daily AI-generated market analysis', 'cyan')}
      ${renderSkillCard('&#127968;', 'Comp Analysis', 'Automated comparable property analysis', 'amber')}
      ${renderSkillCard('&#128176;', 'Price Optimizer', 'AI pricing recommendations by zone', 'green')}
      ${renderSkillCard('&#128269;', 'Trend Scanner', 'Regional & national trend detection', 'red')}
    </div>

    <div class="section-header">
      <span class="section-title">Operations</span>
    </div>
    <div class="skill-grid" style="margin-bottom:var(--space-lg);">
      ${renderSkillCard('&#128295;', 'Maintenance AI', 'Predictive maintenance scheduling', 'amber')}
      ${renderSkillCard('&#128101;', 'Vendor Match', 'AI-matched vendor assignments', 'green')}
      ${renderSkillCard('&#128203;', 'Inspection AI', 'Automated inspection reports', 'blue')}
      ${renderSkillCard('&#127869;', 'Concierge', 'Guest service automation', 'purple')}
    </div>

    <!-- Recently Used -->
    <div class="divider"></div>
    <div class="section-header">
      <span class="section-title">Recently Used</span>
      <button class="section-action">Clear</button>
    </div>
    <div class="list-item" style="margin-bottom:var(--space-sm);">
      <div style="font-size:1.2rem;">&#9889;</div>
      <div class="list-content">
        <div class="list-title">SCAA-1 Battle Plan</div>
        <div class="list-subtitle">Executed 2 hours ago &middot; Lead: Victoria Harrington</div>
      </div>
      <span class="tag tag-green" style="font-size:0.6rem;">Success</span>
    </div>
    <div class="list-item">
      <div style="font-size:1.2rem;">&#128200;</div>
      <div class="list-content">
        <div class="list-title">Market Brief</div>
        <div class="list-subtitle">Executed today at 6:00 AM &middot; Treasure Coast</div>
      </div>
      <span class="tag tag-green" style="font-size:0.6rem;">Success</span>
    </div>
  `;
}

function renderSkillCard(icon, name, desc, color) {
  const colorVar = `var(--ck-${color === 'gold' ? 'gold' : color === 'cyan' ? 'cyan' : color})`;
  return `
    <div class="skill-card">
      <div class="skill-card-icon">${icon}</div>
      <div class="skill-card-name">${name}</div>
      <div class="skill-card-desc">${desc}</div>
      <div style="margin-top:8px;">
        <span class="tag" style="background:rgba(196,163,90,0.08);color:${colorVar};font-size:0.6rem;border:1px solid rgba(196,163,90,0.15);">Execute</span>
      </div>
    </div>
  `;
}
