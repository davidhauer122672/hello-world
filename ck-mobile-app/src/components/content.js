/**
 * Coastal Key Mobile App — Content Dominator
 * Social post creation, email campaigns, scheduling, analytics, luxury previews
 */

export function renderContent() {
  return `
    <div class="flex justify-between items-center mb-lg" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-lg);">
      <div>
        <h2 style="font-size:1.35rem;">Content Dominator</h2>
        <p class="text-sm text-dim" style="margin-top:4px;">Create, schedule, and optimize</p>
      </div>
      <button class="btn btn-primary" style="padding:8px 16px;font-size:0.78rem;">+ Create</button>
    </div>

    <!-- Content Metrics -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm);margin-bottom:var(--space-lg);">
      <div class="card" style="padding:var(--space-md);text-align:center;">
        <div class="metric-value green" style="font-size:1.3rem;">24</div>
        <div class="metric-label">Published</div>
      </div>
      <div class="card" style="padding:var(--space-md);text-align:center;">
        <div class="metric-value blue" style="font-size:1.3rem;">8</div>
        <div class="metric-label">Scheduled</div>
      </div>
      <div class="card" style="padding:var(--space-md);text-align:center;">
        <div class="metric-value gold" style="font-size:1.3rem;">12.4K</div>
        <div class="metric-label">Reach</div>
      </div>
    </div>

    <!-- Cinematic Property Preview -->
    <div class="section-header">
      <span class="section-title">Cinematic Previews</span>
      <button class="section-action">Create New</button>
    </div>
    <div class="cinematic-card mb-lg" style="margin-bottom:var(--space-lg);background:linear-gradient(135deg,#1a1a2e,#16213e);">
      <div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:var(--space-sm);">
        <div style="font-size:3rem;opacity:0.5;">&#127968;</div>
        <span style="color:#71717a;font-size:0.85rem;">Luxury Property Showcase</span>
        <span style="color:var(--ck-gold);font-size:0.75rem;">Stuart, FL &middot; $2.4M</span>
      </div>
      <div class="cinematic-overlay">
        <div style="font-size:0.85rem;font-weight:600;color:#fff;">Oceanfront Estate — 4BR/3BA</div>
        <div style="font-size:0.72rem;color:#a1a1aa;margin-top:4px;">AI-generated listing copy ready for review</div>
      </div>
    </div>

    <!-- Content Calendar -->
    <div class="section-header">
      <span class="section-title">This Week</span>
      <button class="section-action">Full Calendar</button>
    </div>
    ${renderContentItem('Mon', 'Market Monday — Treasure Coast Update', 'Instagram, LinkedIn', 'published', 'green')}
    ${renderContentItem('Tue', 'Client Success Story — Harrington Estate', 'Facebook, Email', 'published', 'green')}
    ${renderContentItem('Wed', 'Property Spotlight — Jensen Beach Condo', 'Instagram, TikTok', 'scheduled', 'blue')}
    ${renderContentItem('Thu', 'AI-Powered Home Watch Explainer', 'LinkedIn, YouTube', 'scheduled', 'blue')}
    ${renderContentItem('Fri', 'Weekend Open House Announcement', 'All Channels', 'draft', 'amber')}

    <div class="divider"></div>

    <!-- Email Campaign Builder -->
    <div class="section-header">
      <span class="section-title">Email Campaigns</span>
      <button class="section-action">New Campaign</button>
    </div>
    <div class="card mb-md" style="margin-bottom:var(--space-sm);">
      <div class="flex items-center gap-md" style="display:flex;align-items:center;gap:var(--space-md);">
        <div style="font-size:1.3rem;">&#128232;</div>
        <div style="flex:1;">
          <div style="font-size:0.85rem;font-weight:600;color:#fff;">Snowbird Welcome Sequence</div>
          <div style="font-size:0.72rem;color:#71717a;margin-top:2px;">5 emails &middot; 2,340 recipients &middot; 42% open rate</div>
        </div>
        <span class="tag tag-green" style="font-size:0.6rem;">Active</span>
      </div>
    </div>
    <div class="card">
      <div class="flex items-center gap-md" style="display:flex;align-items:center;gap:var(--space-md);">
        <div style="font-size:1.3rem;">&#128233;</div>
        <div style="flex:1;">
          <div style="font-size:0.85rem;font-weight:600;color:#fff;">Investor Quarterly Report</div>
          <div style="font-size:0.72rem;color:#71717a;margin-top:2px;">1 email &middot; 890 recipients &middot; Scheduled Apr 7</div>
        </div>
        <span class="tag tag-blue" style="font-size:0.6rem;">Queued</span>
      </div>
    </div>

    <div class="divider"></div>

    <!-- Auto-Optimization -->
    <div class="section-header">
      <span class="section-title">AI Optimization</span>
    </div>
    <div class="card" style="border-left:3px solid var(--ck-gold);">
      <div style="font-size:0.85rem;font-weight:600;color:#fff;margin-bottom:4px;">Auto-Optimization Active</div>
      <div style="font-size:0.75rem;color:#71717a;line-height:1.5;">AI continuously monitors content performance and adjusts posting times, hashtags, and copy for maximum engagement. Last optimization: 45 minutes ago.</div>
      <div style="display:flex;gap:var(--space-sm);margin-top:var(--space-md);">
        <span class="tag tag-green">+18% Engagement</span>
        <span class="tag tag-blue">+24% Reach</span>
      </div>
    </div>
  `;
}

function renderContentItem(day, title, platforms, status, color) {
  const statusLabels = { published: 'Published', scheduled: 'Scheduled', draft: 'Draft' };
  return `
    <div class="list-item" style="margin-bottom:var(--space-sm);">
      <div style="width:40px;text-align:center;">
        <div style="font-size:0.7rem;color:var(--ck-gold);font-weight:700;text-transform:uppercase;">${day}</div>
      </div>
      <div class="list-content">
        <div class="list-title" style="font-size:0.85rem;">${title}</div>
        <div class="list-subtitle">${platforms}</div>
      </div>
      <span class="tag tag-${color}" style="font-size:0.6rem;">${statusLabels[status]}</span>
    </div>
  `;
}
