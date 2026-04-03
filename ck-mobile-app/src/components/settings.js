/**
 * Coastal Key Mobile App — Settings & Brand Control
 * Brand colors, roles, permissions, notification preferences, governance display
 */

export function renderSettings() {
  return `
    <div class="mb-lg" style="margin-bottom:var(--space-lg);">
      <h2 style="font-size:1.35rem;">Settings</h2>
      <p class="text-sm text-dim" style="margin-top:4px;">Configuration & governance</p>
    </div>

    <!-- Profile Card -->
    <div class="card-hero mb-lg" style="padding:var(--space-xl);text-align:center;">
      <div style="width:72px;height:72px;background:linear-gradient(135deg,var(--ck-gold),var(--ck-gold-light));border-radius:50%;margin:0 auto var(--space-md);display:flex;align-items:center;justify-content:center;">
        <span style="font-family:var(--font-display);font-size:1.5rem;font-weight:900;color:var(--ck-black);">CK</span>
      </div>
      <div style="font-size:1rem;font-weight:700;color:#fff;">Coastal Key Operations</div>
      <div style="font-size:0.78rem;color:var(--ck-gold);margin-top:4px;">Enterprise Administrator</div>
      <div style="font-size:0.7rem;color:#71717a;margin-top:8px;">360 AI Units &middot; 38 Airtable Tables &middot; 10 Service Zones</div>
    </div>

    <!-- Subscription Tier -->
    <div class="section-header">
      <span class="section-title">Subscription</span>
    </div>
    <div class="card mb-lg" style="margin-bottom:var(--space-lg);border-left:3px solid var(--ck-gold);">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:0.85rem;font-weight:600;color:#fff;">Enterprise Plan</div>
          <div style="font-size:0.72rem;color:#71717a;margin-top:2px;">200+ AI Agents &middot; Full Platform Access</div>
        </div>
        <span class="tag tag-gold">Active</span>
      </div>
    </div>

    <!-- Brand Configuration -->
    <div class="section-header">
      <span class="section-title">Brand Configuration</span>
    </div>
    <div class="card mb-lg" style="margin-bottom:var(--space-lg);">
      <div style="display:flex;flex-direction:column;gap:var(--space-md);">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:#d4d4d8;">Primary Color</span>
          <div style="display:flex;align-items:center;gap:var(--space-sm);">
            <div style="width:24px;height:24px;background:var(--ck-gold);border-radius:6px;border:2px solid var(--ck-border-strong);"></div>
            <span class="text-mono" style="font-size:0.72rem;color:#71717a;">#c4a35a</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:#d4d4d8;">Background</span>
          <div style="display:flex;align-items:center;gap:var(--space-sm);">
            <div style="width:24px;height:24px;background:var(--ck-black);border-radius:6px;border:2px solid var(--ck-border-strong);"></div>
            <span class="text-mono" style="font-size:0.72rem;color:#71717a;">#0a0a0a</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-size:0.82rem;color:#d4d4d8;">Logo</span>
          <span style="font-size:0.75rem;color:var(--ck-gold);">Coastal Key Mark</span>
        </div>
      </div>
    </div>

    <!-- Notification Preferences -->
    <div class="section-header">
      <span class="section-title">Notifications</span>
    </div>
    <div class="card mb-lg" style="margin-bottom:var(--space-lg);">
      ${renderToggle('Hot Lead Alerts', true)}
      ${renderToggle('System Health Warnings', true)}
      ${renderToggle('Content Published', true)}
      ${renderToggle('Fleet Scan Results', false)}
      ${renderToggle('Market Briefings', true)}
      ${renderToggle('Email Campaign Updates', false)}
    </div>

    <!-- Mission Statement -->
    <div class="section-header">
      <span class="section-title">Mission & Governance</span>
    </div>
    <div class="mission-block mb-lg" style="margin-bottom:var(--space-lg);">
      <p class="mission-text" style="font-size:0.82rem;">
        Coastal Key Property Management exists to protect, preserve, and elevate the properties
        and investments entrusted to our care. Founded on Truth, Liberty, and the Irrevocable
        Rights of Free Speech. Guided by Service, Stewardship, and Security.
      </p>
    </div>

    <!-- Governance Principles -->
    <div class="card mb-lg" style="margin-bottom:var(--space-lg);">
      <div style="font-size:0.78rem;font-weight:600;color:var(--ck-gold);margin-bottom:var(--space-md);letter-spacing:0.06em;text-transform:uppercase;">Sovereign Governance Principles</div>
      ${renderPrinciple('GOV-001', 'Truth Over Convenience')}
      ${renderPrinciple('GOV-002', 'Transparency Over Opacity')}
      ${renderPrinciple('GOV-003', 'Long-Term Reputation Over Short-Term Revenue')}
      ${renderPrinciple('GOV-004', 'Autonomous Excellence')}
      ${renderPrinciple('GOV-005', 'Client Sovereignty')}
      ${renderPrinciple('GOV-006', 'Data Sovereignty')}
      ${renderPrinciple('GOV-007', 'Ethical AI Operations')}
      ${renderPrinciple('GOV-008', 'Continuous Improvement')}
    </div>

    <!-- Three Moral Principals -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-sm);margin-bottom:var(--space-lg);">
      <div class="card" style="padding:var(--space-md);text-align:center;border-top:3px solid var(--ck-green);">
        <div style="font-size:1.2rem;margin-bottom:4px;">&#9829;</div>
        <div style="font-size:0.75rem;font-weight:700;color:#fff;">Service</div>
        <div style="font-size:0.6rem;color:#71717a;margin-top:4px;">OPS, SEN, VEN</div>
      </div>
      <div class="card" style="padding:var(--space-md);text-align:center;border-top:3px solid var(--ck-gold);">
        <div style="font-size:1.2rem;margin-bottom:4px;">&#9878;</div>
        <div style="font-size:0.75rem;font-weight:700;color:#fff;">Stewardship</div>
        <div style="font-size:0.6rem;color:#71717a;margin-top:4px;">EXC, FIN, INT</div>
      </div>
      <div class="card" style="padding:var(--space-md);text-align:center;border-top:3px solid var(--ck-blue);">
        <div style="font-size:1.2rem;margin-bottom:4px;">&#128737;</div>
        <div style="font-size:0.75rem;font-weight:700;color:#fff;">Security</div>
        <div style="font-size:0.6rem;color:#71717a;margin-top:4px;">TEC, MKT, WEB</div>
      </div>
    </div>

    <!-- System Info -->
    <div class="section-header">
      <span class="section-title">System Information</span>
    </div>
    <div class="card">
      <div style="display:flex;flex-direction:column;gap:var(--space-sm);">
        <div style="display:flex;justify-content:space-between;"><span style="font-size:0.78rem;color:#71717a;">Platform</span><span class="text-mono" style="font-size:0.72rem;color:#d4d4d8;">Cloudflare Workers + Pages</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:0.78rem;color:#71717a;">API Gateway</span><span class="text-mono" style="font-size:0.72rem;color:#d4d4d8;">43 endpoints</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:0.78rem;color:#71717a;">Airtable Base</span><span class="text-mono" style="font-size:0.72rem;color:#d4d4d8;">38 tables</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:0.78rem;color:#71717a;">Fleet Size</span><span class="text-mono" style="font-size:0.72rem;color:#d4d4d8;">360 units</span></div>
        <div style="display:flex;justify-content:space-between;"><span style="font-size:0.78rem;color:#71717a;">Compendium</span><span class="text-mono" style="font-size:0.72rem;color:#d4d4d8;">v1.0 — Ratified 2026-04-03</span></div>
      </div>
    </div>

    <div class="divider"></div>
    <div style="text-align:center;padding:var(--space-md) 0;">
      <div style="font-size:0.65rem;color:var(--ck-gold-dim);letter-spacing:0.1em;text-transform:uppercase;">
        Coastal Key Enterprise &middot; Treasure Coast &middot; Est. 2026
      </div>
    </div>
  `;
}

function renderToggle(label, enabled) {
  return `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-sm) 0;border-bottom:1px solid var(--ck-border);">
      <span style="font-size:0.82rem;color:#d4d4d8;">${label}</span>
      <div style="width:42px;height:24px;background:${enabled ? 'var(--ck-gold)' : 'var(--ck-surface-elevated)'};border-radius:12px;position:relative;cursor:pointer;transition:background var(--transition-fast);">
        <div style="width:20px;height:20px;background:#fff;border-radius:50%;position:absolute;top:2px;${enabled ? 'right:2px' : 'left:2px'};transition:all var(--transition-fast);box-shadow:0 1px 3px rgba(0,0,0,0.3);"></div>
      </div>
    </div>
  `;
}

function renderPrinciple(id, name) {
  return `
    <div style="display:flex;align-items:center;gap:var(--space-sm);padding:var(--space-xs) 0;">
      <span style="font-size:0.65rem;color:var(--ck-gold-dim);font-family:var(--font-mono);min-width:52px;">${id}</span>
      <span style="font-size:0.78rem;color:#d4d4d8;">${name}</span>
      <span class="status-dot active" style="margin-left:auto;"></span>
    </div>
  `;
}
