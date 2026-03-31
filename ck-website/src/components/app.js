/**
 * Main Application Shell
 *
 * Renders the top-level layout and registers all routes.
 * Public pages get the marketing layout.
 * Portal pages get the dashboard layout with sidebar.
 */

import { registerRoute, navigate } from '../utils/router.js';
import { isAuthenticated, login, logout, apiCall } from '../utils/auth.js';
import {
  fetchAgents, fetchAgent, fetchAgentMetrics, executeAgentAction,
  fetchDashboard, createLead, enrichLead, generateContent,
  runScaa1, runWf3, runWf4, fetchAuditLog, getPricingZones,
} from '../utils/api.js';

// ── Route Registration ──────────────────────────────────────────────────────

export function renderApp() {
  document.getElementById('app').innerHTML = `
    <header id="site-header"></header>
    <main id="main-content"></main>
    <footer id="site-footer"></footer>
  `;

  registerRoute('/', renderHome);
  registerRoute('/services', renderServices);
  registerRoute('/areas', renderAreas);
  registerRoute('/about', renderAbout);
  registerRoute('/contact', renderContact);
  registerRoute('/portal', renderPortalGate);
  registerRoute('/portal/dashboard', renderPortalDashboard);
  registerRoute('/portal/agents', renderPortalAgents);
  registerRoute('/portal/leads', renderPortalLeads);
  registerRoute('/portal/tasks', renderPortalTasks);
  registerRoute('/portal/content', renderPortalContent);
  registerRoute('/portal/vendors', renderPortalVendors);
  registerRoute('/portal/reports', renderPortalReports);
  registerRoute('/404', renderNotFound);
}

// ── Shared Header ───────────────────────────────────────────────────────────

function setPublicLayout(main, title, content) {
  document.getElementById('site-header').innerHTML = `
    <nav class="public-nav">
      <a href="/" class="nav-logo">
        <span class="logo-mark">CK</span>
        <span class="logo-text">Coastal Key</span>
      </a>
      <div class="nav-links">
        <a href="/services" data-nav="/services">Services</a>
        <a href="/areas" data-nav="/areas">Areas</a>
        <a href="/about" data-nav="/about">About</a>
        <a href="/contact" data-nav="/contact">Contact</a>
        <a href="/portal" class="nav-portal-btn">Team Portal</a>
      </div>
      <button class="mobile-menu-btn" onclick="document.querySelector('.nav-links').classList.toggle('open')">
        <span></span><span></span><span></span>
      </button>
    </nav>
  `;
  document.getElementById('site-footer').innerHTML = `
    <div class="footer-grid">
      <div class="footer-brand">
        <div class="footer-logo"><span class="logo-mark">CK</span> Coastal Key Property Management</div>
        <p>Luxury property management on Florida's Treasure Coast. AI-powered operations delivering white-glove service.</p>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="/services">Property Management</a>
        <a href="/services">Concierge Services</a>
        <a href="/services">Investor Relations</a>
        <a href="/services">STR Management</a>
      </div>
      <div class="footer-col">
        <h4>Service Areas</h4>
        <a href="/areas">Vero Beach</a>
        <a href="/areas">Stuart</a>
        <a href="/areas">Jupiter</a>
        <a href="/areas">Port St. Lucie</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about">About Us</a>
        <a href="/contact">Contact</a>
        <a href="/portal">Team Portal</a>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} Coastal Key Property Management. All rights reserved.</p>
      <p>coastalkey-pm.com</p>
    </div>
  `;
  document.title = `${title} — Coastal Key Property Management`;
  main.innerHTML = content;
}

function setPortalLayout(main, title, content) {
  if (!isAuthenticated()) {
    navigate('/portal');
    return;
  }
  document.getElementById('site-header').innerHTML = `
    <nav class="portal-nav">
      <a href="/portal/dashboard" class="nav-logo">
        <span class="logo-mark">CK</span>
        <span class="logo-text">Command Center</span>
      </a>
      <div class="portal-nav-links">
        <a href="/portal/dashboard" data-nav="/portal/dashboard">Dashboard</a>
        <a href="/portal/agents" data-nav="/portal/agents">Agents</a>
        <a href="/portal/leads" data-nav="/portal/leads">Leads</a>
        <a href="/portal/tasks" data-nav="/portal/tasks">Tasks</a>
        <a href="/portal/content" data-nav="/portal/content">Content</a>
        <a href="/portal/vendors" data-nav="/portal/vendors">Vendors</a>
        <a href="/portal/reports" data-nav="/portal/reports">Reports</a>
      </div>
      <div class="portal-actions">
        <a href="/" class="portal-public-link">Public Site</a>
        <button class="portal-logout-btn" id="logout-btn">Logout</button>
      </div>
    </nav>
  `;
  document.getElementById('site-footer').innerHTML = '';
  document.title = `${title} — CK Command Center`;
  main.innerHTML = `<div class="portal-container">${content}</div>`;
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logout();
    navigate('/portal');
  });
}

// ── Public Pages ────────────────────────────────────────────────────────────

function renderHome(main) {
  setPublicLayout(main, 'Luxury Property Management', `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">AI-Powered Property Management</div>
        <h1>Your Property. <br>Our Obsession.</h1>
        <p class="hero-sub">Coastal Key delivers white-glove property management across Florida's Treasure Coast. 290 AI agents working 24/7 so your investment never sleeps.</p>
        <div class="hero-actions">
          <a href="/contact" class="btn btn-primary">Get a Proposal</a>
          <a href="/services" class="btn btn-secondary">Our Services</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">290</span><span class="stat-label">AI Agents Active</span></div>
          <div class="stat"><span class="stat-num">10</span><span class="stat-label">Service Zones</span></div>
          <div class="stat"><span class="stat-num">24/7</span><span class="stat-label">Operations</span></div>
          <div class="stat"><span class="stat-num">9</span><span class="stat-label">Divisions</span></div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Enterprise-Grade Operations. Boutique-Level Care.</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background:#ef4444">S</div>
          <h3>Sentinel AI Sales</h3>
          <p>40 AI agents handle inbound calls, qualify leads, and generate personalized battle plans — converting prospects into clients around the clock.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#f59e0b">O</div>
          <h3>Operations Fleet</h3>
          <p>45 agents manage maintenance, inspections, turnovers, concierge, and emergency response for every managed property.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#10b981">I</div>
          <h3>Market Intelligence</h3>
          <p>30 agents scan market data, competitor moves, and economic indicators to keep your investment strategy ahead of the curve.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#8b5cf6">M</div>
          <h3>Marketing Engine</h3>
          <p>40 agents create content, optimize SEO, manage social media, and run ad campaigns that keep your listings fully booked.</p>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to Experience the Difference?</h2>
      <p>Join the property owners on the Treasure Coast who've upgraded to AI-powered management.</p>
      <a href="/contact" class="btn btn-primary btn-lg">Schedule a Consultation</a>
    </section>
  `);
}

function renderServices(main) {
  setPublicLayout(main, 'Services', `
    <section class="page-header"><h1>Our Services</h1><p>Comprehensive property management powered by AI precision and human care.</p></section>
    <section class="services-grid">
      <div class="service-card"><h3>Full-Service Property Management</h3><p>End-to-end management: tenant screening, maintenance coordination, financial reporting, and owner communications — all AI-optimized.</p></div>
      <div class="service-card"><h3>Short-Term Rental Management</h3><p>Dynamic pricing, multi-platform listing optimization, guest communications, turnover coordination, and revenue maximization.</p></div>
      <div class="service-card"><h3>Luxury Concierge Services</h3><p>White-glove concierge for high-end properties: personal shopping, travel arrangements, event planning, and guest experiences.</p></div>
      <div class="service-card"><h3>Investor Relations</h3><p>Portfolio analysis, ROI reporting, market intelligence, and acquisition opportunity identification for serious investors.</p></div>
      <div class="service-card"><h3>Maintenance & Inspections</h3><p>Preventive maintenance programs, quarterly inspections, vendor management, and emergency response coordination.</p></div>
      <div class="service-card"><h3>Hurricane Preparedness</h3><p>Storm preparation, property securing, post-storm inspections, insurance claim support, and recovery coordination.</p></div>
    </section>
  `);
}

function renderAreas(main) {
  const zones = [
    { name: 'Vero Beach', county: 'Indian River', desc: 'Barrier island luxury, oceanfront estates, and premier golf communities.' },
    { name: 'Sebastian', county: 'Indian River', desc: 'Waterfront living along the Indian River Lagoon with coastal charm.' },
    { name: 'Fort Pierce', county: 'St. Lucie', desc: 'Historic downtown revival and emerging investment corridor.' },
    { name: 'Port St. Lucie', county: 'St. Lucie', desc: 'Florida\'s fastest-growing city with expanding residential communities.' },
    { name: 'Jensen Beach', county: 'Martin', desc: 'Quaint coastal village with pineapple heritage and beach access.' },
    { name: 'Stuart', county: 'Martin', desc: 'Sailfish Capital of the World with vibrant downtown and waterfront.' },
    { name: 'Palm City', county: 'Martin', desc: 'Equestrian estates, golf communities, and family-friendly living.' },
    { name: 'Hobe Sound', county: 'Martin', desc: 'Nature preserve proximity with exclusive residential enclaves.' },
    { name: 'Jupiter', county: 'Palm Beach', desc: 'Celebrity haven with world-class golf, dining, and waterfront estates.' },
    { name: 'North Palm Beach', county: 'Palm Beach', desc: 'Southern gateway to the Treasure Coast with upscale communities.' },
  ];
  setPublicLayout(main, 'Service Areas', `
    <section class="page-header"><h1>Service Areas</h1><p>Serving Florida's Treasure Coast — from Vero Beach to Jupiter.</p></section>
    <section class="areas-grid">
      ${zones.map(z => `
        <div class="area-card">
          <h3>${z.name}</h3>
          <span class="area-county">${z.county} County</span>
          <p>${z.desc}</p>
        </div>
      `).join('')}
    </section>
  `);
}

function renderAbout(main) {
  setPublicLayout(main, 'About', `
    <section class="page-header"><h1>About Coastal Key</h1><p>Technology meets hospitality on the Treasure Coast.</p></section>
    <section class="about-content">
      <div class="about-text">
        <h2>Built for the Future of Property Management</h2>
        <p>Coastal Key Property Management operates 290 AI agents across 9 specialized divisions — Executive, Sales, Operations, Intelligence, Marketing, Finance, Vendor Management, Technology, and Website Development. Our AI fleet handles everything from inbound sales calls to hurricane preparation, from investor reporting to social media content creation.</p>
        <p>But technology is only as good as the human vision behind it. Coastal Key was founded on a simple principle: property owners on the Treasure Coast deserve enterprise-grade operations with boutique-level personal care. Our AI systems amplify human expertise — they don't replace it.</p>
        <h3>Our Divisions</h3>
        <ul class="division-list">
          <li><strong>Executive (20 agents)</strong> — Strategy, governance, risk management</li>
          <li><strong>Sentinel Sales (40 agents)</strong> — Lead generation, qualification, conversion</li>
          <li><strong>Operations (45 agents)</strong> — Property management, maintenance, concierge</li>
          <li><strong>Intelligence (30 agents)</strong> — Market research, predictive analytics</li>
          <li><strong>Marketing (40 agents)</strong> — Content, SEO, advertising, social media</li>
          <li><strong>Finance (25 agents)</strong> — Revenue tracking, investor reporting, budgets</li>
          <li><strong>Vendor Management (25 agents)</strong> — Compliance, contracts, quality</li>
          <li><strong>Technology (25 agents)</strong> — Platform ops, integrations, security</li>
        </ul>
      </div>
    </section>
  `);
}

function renderContact(main) {
  setPublicLayout(main, 'Contact', `
    <section class="page-header"><h1>Get in Touch</h1><p>Let's discuss how Coastal Key can manage your Treasure Coast property.</p></section>
    <section class="contact-section">
      <form class="contact-form" id="contact-form">
        <div class="form-row">
          <div class="form-group"><label>Full Name</label><input type="text" name="name" required placeholder="Your name"></div>
          <div class="form-group"><label>Email</label><input type="email" name="email" required placeholder="you@example.com"></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Phone</label><input type="tel" name="phone" placeholder="(555) 123-4567"></div>
          <div class="form-group"><label>Property Location</label>
            <select name="zone"><option value="">Select area...</option>
              <option>Vero Beach</option><option>Sebastian</option><option>Fort Pierce</option>
              <option>Port St. Lucie</option><option>Jensen Beach</option><option>Stuart</option>
              <option>Palm City</option><option>Hobe Sound</option><option>Jupiter</option>
              <option>North Palm Beach</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label>How can we help?</label><textarea name="message" rows="4" placeholder="Tell us about your property and goals..."></textarea></div>
        <button type="submit" class="btn btn-primary btn-lg" id="contact-submit">Send Inquiry</button>
        <div id="contact-status" class="form-status"></div>
      </form>
    </section>
  `);
  document.getElementById('contact-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contact-submit');
    const status = document.getElementById('contact-status');
    const form = e.target;
    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = '';
    try {
      const data = Object.fromEntries(new FormData(form));
      // Direct Airtable write for public form (no auth required)
      const res = await fetch('/v1/leads/public', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          zone: data.zone || '',
          message: data.message || '',
          source: 'website'
        })
      });
      if (res.ok) {
        status.textContent = 'Thank you! We will be in touch within 24 hours.';
        status.className = 'form-status success';
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      status.textContent = 'Something went wrong. Please call us directly.';
      status.className = 'form-status error';
    }
    btn.disabled = false;
    btn.textContent = 'Send Inquiry';
  });
}

// ── Portal Pages ────────────────────────────────────────────────────────────

function renderPortalGate(main) {
  if (isAuthenticated()) {
    navigate('/portal/dashboard');
    return;
  }
  setPublicLayout(main, 'Team Portal', `
    <section class="portal-login">
      <div class="login-card">
        <div class="login-logo"><span class="logo-mark lg">CK</span></div>
        <h2>Team Portal</h2>
        <p>Connect to the CK Command Center API to access the operational dashboard.</p>
        <form id="portal-login-form">
          <div class="form-group"><label>API Gateway URL</label><input type="url" id="api-url" required placeholder="https://ck-api-gateway.your-domain.workers.dev"></div>
          <div class="form-group"><label>Bearer Token</label><input type="password" id="api-token" required placeholder="Your API token"></div>
          <button type="submit" class="btn btn-primary btn-full">Connect</button>
        </form>
        <p class="login-note">Access restricted to authorized Coastal Key team members.</p>
      </div>
    </section>
  `);
  document.getElementById('portal-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = document.getElementById('api-url').value;
    const token = document.getElementById('api-token').value;
    login(url, token);
    navigate('/portal/dashboard');
  });
}

function renderPortalDashboard(main) {
  // ── Static fallback data ──────────────────────────────────────────────────
  const fallbackDivisions = [
    { code: 'EXC', name: 'Executive',       agents: 20, color: '#6366f1' },
    { code: 'SEN', name: 'Sentinel Sales',  agents: 40, color: '#ef4444' },
    { code: 'OPS', name: 'Operations',       agents: 45, color: '#f59e0b' },
    { code: 'INT', name: 'Intelligence',     agents: 30, color: '#10b981' },
    { code: 'MKT', name: 'Marketing',        agents: 40, color: '#8b5cf6' },
    { code: 'FIN', name: 'Finance',          agents: 25, color: '#06b6d4' },
    { code: 'VEN', name: 'Vendor Mgmt',      agents: 25, color: '#f97316' },
    { code: 'TEC', name: 'Technology',        agents: 25, color: '#14b8a6' },
    { code: 'WEB', name: 'Web Development',    agents: 40, color: '#0ea5e9' },
  ];

  const fallbackStats = {
    totalAgents: 290,
    activeAgents: 273,
    divisions: 9,
    uptime: '99.9%',
  };

  const fallbackActivity = [
    { ts: 'Just now',   text: 'SEN-12 qualified inbound lead — Vero Beach oceanfront' },
    { ts: '2 min ago',  text: 'OPS-7 dispatched maintenance crew — Stuart condo unit 4B' },
    { ts: '8 min ago',  text: 'MKT-22 published social post — Instagram Reel #TreasureCoast' },
    { ts: '15 min ago', text: 'INT-3 generated market report — Indian River County Q1' },
    { ts: '22 min ago', text: 'FIN-9 processed owner distribution — Jupiter portfolio' },
  ];

  // ── Build the layout ──────────────────────────────────────────────────────
  setPortalLayout(main, 'Dashboard', `
    <h1 class="portal-title">Operational Dashboard</h1>

    <!-- Stat Cards -->
    <div class="portal-stats" id="dash-stats">
      <div class="stat-card"><span class="stat-num" id="stat-total">290</span><span class="stat-label">Total Agents</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-active">--</span><span class="stat-label">Active</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-divisions">9</span><span class="stat-label">Divisions</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-uptime">99.9%</span><span class="stat-label">Uptime</span></div>
    </div>

    <!-- Division Breakdown -->
    <div class="portal-card" id="dash-divisions">
      <h3>Division Breakdown</h3>
      <div class="card-body">
        <div class="division-grid" id="division-grid"></div>
      </div>
    </div>

    <div class="portal-grid">
      <!-- Recent Activity -->
      <div class="portal-card" id="dash-audit">
        <h3>Recent Activity</h3>
        <div class="card-body">
          <ul class="activity-feed" id="activity-feed"></ul>
        </div>
      </div>

      <!-- Owner Quick Actions -->
      <div class="portal-card" id="dash-owner-actions">
        <h3>Owner Quick Actions</h3>
        <div class="card-body">
          <div class="owner-actions-grid">
            <button class="btn btn-primary owner-action-btn" data-action="properties">View Properties</button>
            <button class="btn btn-secondary owner-action-btn" data-action="maintenance">Submit Maintenance Request</button>
            <button class="btn btn-secondary owner-action-btn" data-action="financials">View Financials</button>
            <button class="btn btn-secondary owner-action-btn" data-action="contact">Contact Team</button>
          </div>
        </div>
      </div>
    </div>
  `);

  // ── Populate with fallback data immediately ───────────────────────────────
  function applyStats(stats) {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
    el('stat-total', stats.totalAgents);
    el('stat-active', stats.activeAgents);
    el('stat-divisions', stats.divisions);
    el('stat-uptime', stats.uptime);
  }

  function applyDivisions(divisions) {
    const grid = document.getElementById('division-grid');
    if (!grid) return;
    grid.innerHTML = divisions.map(d => `
      <div class="division-card" style="border-left:4px solid ${d.color}">
        <span class="division-code">${d.code}</span>
        <span class="division-name">${d.name}</span>
        <span class="division-count">${d.agents} agents</span>
      </div>
    `).join('');
  }

  function applyActivity(items) {
    const feed = document.getElementById('activity-feed');
    if (!feed) return;
    feed.innerHTML = items.map(a => `
      <li class="activity-item"><span class="activity-ts">${a.ts}</span> ${a.text}</li>
    `).join('');
  }

  // Render static fallback right away so the dashboard is never empty
  applyStats(fallbackStats);
  applyDivisions(fallbackDivisions);
  applyActivity(fallbackActivity);

  // ── Wire up owner quick action buttons ────────────────────────────────────
  document.querySelectorAll('.owner-action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.getAttribute('data-action');
      if (action === 'properties')  navigate('/portal/reports');
      if (action === 'maintenance') navigate('/portal/tasks');
      if (action === 'financials')  navigate('/portal/reports');
      if (action === 'contact')     navigate('/contact');
    });
  });

  // ── Fetch live data from API and overwrite fallback when available ────────
  (async () => {
    try {
      const data = await apiCall('/v1/dashboard');
      if (data) {
        if (data.stats) {
          applyStats({
            totalAgents: data.stats.totalAgents ?? fallbackStats.totalAgents,
            activeAgents: data.stats.activeAgents ?? fallbackStats.activeAgents,
            divisions: data.stats.divisions ?? fallbackStats.divisions,
            uptime: data.stats.uptime ?? fallbackStats.uptime,
          });
        }
        if (Array.isArray(data.divisions) && data.divisions.length) {
          applyDivisions(data.divisions);
        }
        if (Array.isArray(data.activity) && data.activity.length) {
          applyActivity(data.activity);
        }
      }
    } catch (_) {
      // Fallback data is already rendered — nothing to do
    }
  })();
}

function renderPortalAgents(main) {
  setPortalLayout(main, 'Agent Fleet', `
    <h1 class="portal-title">AI Agent Fleet</h1>
    <div class="portal-stats" id="agent-stats">
      <div class="stat-card"><span class="stat-num" id="agent-total">--</span><span class="stat-label">Total Agents</span></div>
      <div class="stat-card"><span class="stat-num" id="agent-active" style="color:#22c55e">--</span><span class="stat-label">Active</span></div>
      <div class="stat-card"><span class="stat-num" id="agent-standby" style="color:#4f8fff">--</span><span class="stat-label">Standby</span></div>
      <div class="stat-card"><span class="stat-num" id="agent-training" style="color:#eab308">--</span><span class="stat-label">Training</span></div>
    </div>
    <div class="filter-bar">
      <input type="search" placeholder="Search agents..." class="filter-search" id="agent-search">
      <select class="filter-select" id="agent-status-filter"><option value="">All Statuses</option><option value="active">Active</option><option value="standby">Standby</option><option value="training">Training</option><option value="maintenance">Maintenance</option></select>
      <select class="filter-select" id="agent-division-filter"><option value="">All Divisions</option><option value="EXC">Executive</option><option value="SEN">Sentinel Sales</option><option value="OPS">Operations</option><option value="INT">Intelligence</option><option value="MKT">Marketing</option><option value="FIN">Finance</option><option value="VEN">Vendor Mgmt</option><option value="TEC">Technology</option><option value="WEB">Web Development</option></select>
    </div>
    <div class="agent-grid" id="agent-list"><div class="loading-spinner">Loading agents...</div></div>

    <!-- Agent Detail Overlay -->
    <div class="detail-overlay" id="agent-detail-overlay">
      <div class="detail-panel" id="agent-detail-panel"></div>
    </div>
  `);

  const divColors = { EXC:'#6366f1', SEN:'#ef4444', OPS:'#f59e0b', INT:'#10b981', MKT:'#8b5cf6', FIN:'#06b6d4', VEN:'#f97316', TEC:'#64748b', WEB:'#0ea5e9' };
  const statusColors = { active:'#22c55e', standby:'#4f8fff', training:'#eab308', maintenance:'#ef4444' };
  let allAgents = [];

  function renderAgentCards(agents) {
    const grid = document.getElementById('agent-list');
    if (!grid) return;
    if (!agents.length) { grid.innerHTML = '<p style="color:#9898b0;padding:20px">No agents match your filters.</p>'; return; }
    grid.innerHTML = agents.map(a => `
      <div class="agent-card" data-agent-id="${a.id}" style="border-top:3px solid ${divColors[a.division] || '#4f8fff'}">
        <div class="agent-header"><span class="agent-id">${a.id}</span><span class="status-badge ${a.status}"><span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${statusColors[a.status]};margin-right:4px"></span>${a.status}</span></div>
        <div class="agent-name">${a.name}</div>
        <div class="agent-role">${a.role || ''}</div>
        <div class="agent-desc">${a.description || ''}</div>
        <div class="agent-footer"><span class="tier-badge">${a.tier || 'standard'}</span>
          <div class="agent-actions">
            <button class="agent-action-btn" data-id="${a.id}" data-action="activate">Activate</button>
            <button class="agent-action-btn" data-id="${a.id}" data-action="pause">Pause</button>
          </div>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.agent-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('agent-action-btn')) return;
        showAgentDetail(card.dataset.agentId);
      });
    });

    grid.querySelectorAll('.agent-action-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        btn.textContent = '...';
        try {
          await executeAgentAction(btn.dataset.id, btn.dataset.action);
          loadAgents();
        } catch (err) { btn.textContent = 'Error'; }
      });
    });
  }

  async function showAgentDetail(agentId) {
    const overlay = document.getElementById('agent-detail-overlay');
    const panel = document.getElementById('agent-detail-panel');
    try {
      const data = await fetchAgent(agentId);
      const a = data.agent;
      panel.innerHTML = `
        <button class="detail-close" id="close-agent-detail">&times;</button>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <div style="width:48px;height:48px;border-radius:12px;background:${divColors[a.division] || '#4f8fff'};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:14px">${a.division}</div>
          <div><div style="font-size:18px;font-weight:700">${a.name}</div><div style="font-size:12px;color:#9898b0">${a.id} &middot; ${a.role || ''}</div></div>
        </div>
        <p style="color:#c8c8d8;margin-bottom:16px">${a.description || ''}</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <div class="stat-card" style="flex:1;min-width:100px"><span class="stat-num" style="color:${statusColors[a.status]}">${a.status}</span><span class="stat-label">Status</span></div>
          <div class="stat-card" style="flex:1;min-width:100px"><span class="stat-num">${a.tier || 'standard'}</span><span class="stat-label">Tier</span></div>
          <div class="stat-card" style="flex:1;min-width:100px"><span class="stat-num" style="color:${divColors[a.division]}">${a.division}</span><span class="stat-label">Division</span></div>
        </div>
        <div style="display:flex;gap:8px;margin-top:20px">
          <button class="btn btn-primary detail-action-btn" data-action="activate">Activate</button>
          <button class="btn btn-secondary detail-action-btn" data-action="pause">Pause</button>
          <button class="btn btn-secondary detail-action-btn" data-action="restart">Restart</button>
          <button class="btn btn-secondary detail-action-btn" data-action="train">Train</button>
        </div>
      `;
      overlay.classList.add('open');
      document.getElementById('close-agent-detail').addEventListener('click', () => overlay.classList.remove('open'));
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
      panel.querySelectorAll('.detail-action-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          btn.disabled = true; btn.textContent = '...';
          try { await executeAgentAction(agentId, btn.dataset.action); overlay.classList.remove('open'); loadAgents(); } catch { btn.textContent = 'Error'; }
        });
      });
    } catch { panel.innerHTML = '<p style="padding:20px;color:#ef4444">Failed to load agent details.</p>'; overlay.classList.add('open'); }
  }

  function applyFilters() {
    const search = (document.getElementById('agent-search')?.value || '').toLowerCase();
    const status = document.getElementById('agent-status-filter')?.value || '';
    const division = document.getElementById('agent-division-filter')?.value || '';
    let filtered = allAgents;
    if (search) filtered = filtered.filter(a => (a.name||'').toLowerCase().includes(search) || (a.description||'').toLowerCase().includes(search) || (a.id||'').toLowerCase().includes(search));
    if (status) filtered = filtered.filter(a => a.status === status);
    if (division) filtered = filtered.filter(a => a.division === division);
    renderAgentCards(filtered);
  }

  async function loadAgents() {
    try {
      const [agentData, metricsData] = await Promise.all([fetchAgents(), fetchAgentMetrics()]);
      allAgents = agentData.agents || [];
      const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
      el('agent-total', metricsData.totalAgents || allAgents.length);
      el('agent-active', metricsData.byStatus?.active || 0);
      el('agent-standby', metricsData.byStatus?.standby || 0);
      el('agent-training', metricsData.byStatus?.training || 0);
      applyFilters();
    } catch (err) {
      document.getElementById('agent-list').innerHTML = `<div class="portal-card"><div class="card-body"><p style="color:#ef4444">Failed to load agents: ${err.message}</p><p style="color:#9898b0;margin-top:8px">Verify your API connection in Settings.</p></div></div>`;
    }
  }

  document.getElementById('agent-search')?.addEventListener('input', applyFilters);
  document.getElementById('agent-status-filter')?.addEventListener('change', applyFilters);
  document.getElementById('agent-division-filter')?.addEventListener('change', applyFilters);
  loadAgents();
}

function renderPortalLeads(main) {
  setPortalLayout(main, 'Lead Pipeline', `
    <h1 class="portal-title">Lead Pipeline</h1>
    <div class="portal-actions-bar" style="margin-bottom:20px;display:flex;gap:10px;flex-wrap:wrap">
      <button class="btn btn-primary" id="new-lead-btn">+ New Lead</button>
      <button class="btn btn-secondary" id="refresh-leads-btn">Refresh</button>
    </div>

    <!-- New Lead Form (hidden by default) -->
    <div class="portal-card" id="lead-form-card" style="display:none;margin-bottom:20px">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Create New Lead</h3>
        <form id="lead-form">
          <div class="form-row">
            <div class="form-group"><label>Lead Name</label><input type="text" id="lead-name" required placeholder="Full name"></div>
            <div class="form-group"><label>Email</label><input type="email" id="lead-email" placeholder="email@example.com"></div>
          </div>
          <div class="form-row">
            <div class="form-group"><label>Phone</label><input type="tel" id="lead-phone" placeholder="(555) 123-4567"></div>
            <div class="form-group"><label>Service Zone</label>
              <select id="lead-zone"><option value="">Select zone...</option><option>Vero Beach</option><option>Sebastian</option><option>Fort Pierce</option><option>Port St. Lucie</option><option>Jensen Beach</option><option>Stuart</option><option>Palm City</option><option>Hobe Sound</option><option>Jupiter</option><option>North Palm Beach</option></select>
            </div>
          </div>
          <div class="form-group"><label>Notes</label><textarea id="lead-notes" rows="2" placeholder="Inquiry details..."></textarea></div>
          <div style="display:flex;gap:8px"><button type="submit" class="btn btn-primary">Create Lead</button><button type="button" class="btn btn-secondary" id="cancel-lead-btn">Cancel</button></div>
          <div id="lead-form-status" class="form-status" style="margin-top:8px"></div>
        </form>
      </div>
    </div>

    <!-- Lead Pipeline Display -->
    <div class="portal-card" id="lead-pipeline-card">
      <div class="card-body">
        <div id="lead-list"><div class="loading-spinner">Loading leads from API...</div></div>
      </div>
    </div>
  `);

  // Toggle new lead form
  document.getElementById('new-lead-btn')?.addEventListener('click', () => {
    const card = document.getElementById('lead-form-card');
    card.style.display = card.style.display === 'none' ? 'block' : 'none';
  });
  document.getElementById('cancel-lead-btn')?.addEventListener('click', () => {
    document.getElementById('lead-form-card').style.display = 'none';
  });

  // Create lead
  document.getElementById('lead-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('lead-form-status');
    status.textContent = 'Creating lead...';
    status.className = 'form-status';
    try {
      await createLead({
        fields: {
          'Lead Name': document.getElementById('lead-name').value,
          'Email': document.getElementById('lead-email').value,
          'Phone Number': document.getElementById('lead-phone').value,
          'Service Zone': document.getElementById('lead-zone').value,
          'Inquiry Notes': document.getElementById('lead-notes').value,
          'Lead Source': { name: 'Portal' },
        }
      });
      status.textContent = 'Lead created successfully!';
      status.className = 'form-status success';
      document.getElementById('lead-form').reset();
      setTimeout(() => { document.getElementById('lead-form-card').style.display = 'none'; }, 1500);
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.className = 'form-status error';
    }
  });

  // Load audit log as proxy for lead activity (leads endpoint is write-only)
  (async () => {
    try {
      const auditData = await fetchAuditLog(20);
      const entries = auditData.entries || [];
      const leadEntries = entries.filter(e => e.route?.includes('/leads'));
      const list = document.getElementById('lead-list');
      if (leadEntries.length) {
        list.innerHTML = `
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #2a2a3e"><th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">ACTION</th><th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">LEAD</th><th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">TIMESTAMP</th></tr>
            ${leadEntries.map(e => `<tr style="border-bottom:1px solid #1a1a28"><td style="padding:10px;font-size:13px">${e.action || e.enrichType || 'activity'}</td><td style="padding:10px;font-size:13px;color:#c9a84c">${e.leadName || e.recordId || '--'}</td><td style="padding:10px;font-size:12px;color:#9898b0">${e.timestamp ? new Date(e.timestamp).toLocaleString() : '--'}</td></tr>`).join('')}
          </table>`;
      } else {
        list.innerHTML = '<p style="color:#9898b0">No lead activity yet. Create your first lead above or use the AI Sales Agent in the mobile app.</p>';
      }
    } catch (err) {
      document.getElementById('lead-list').innerHTML = `<p style="color:#9898b0">Lead pipeline ready. Create leads via the form above or the mobile app's AI agents.</p>`;
    }
  })();

  document.getElementById('refresh-leads-btn')?.addEventListener('click', () => { renderPortalLeads(main); });
}

function renderPortalTasks(main) {
  setPortalLayout(main, 'Tasks', `
    <h1 class="portal-title">Task Management</h1>
    <div class="portal-stats" id="task-stats">
      <div class="stat-card"><span class="stat-num" style="color:#4f8fff" id="task-total">--</span><span class="stat-label">Total Tasks</span></div>
      <div class="stat-card"><span class="stat-num" style="color:#22c55e" id="task-complete">--</span><span class="stat-label">Completed</span></div>
      <div class="stat-card"><span class="stat-num" style="color:#eab308" id="task-pending">--</span><span class="stat-label">Pending</span></div>
    </div>

    <div class="portal-card" style="margin-bottom:16px">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Workflow Actions</h3>
        <p style="color:#9898b0;margin-bottom:16px">Execute automated workflow pipelines. Tasks are generated and tracked in Airtable.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-primary" id="run-scaa1-btn">SCAA-1 Battle Plan</button>
          <button class="btn btn-secondary" id="run-wf3-btn">WF-3 Investor Escalation</button>
          <button class="btn btn-secondary" id="run-wf4-btn">WF-4 Long-Tail Nurture</button>
        </div>
        <div id="workflow-status" class="form-status" style="margin-top:12px"></div>
      </div>
    </div>

    <div class="portal-card">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Recent Workflow Activity</h3>
        <div id="task-activity"><div class="loading-spinner">Loading activity...</div></div>
      </div>
    </div>
  `);

  // Workflow buttons
  async function runWorkflow(fn, name) {
    const status = document.getElementById('workflow-status');
    status.textContent = `Running ${name}...`;
    status.className = 'form-status';
    try {
      await fn({ recordId: 'latest' });
      status.textContent = `${name} completed successfully.`;
      status.className = 'form-status success';
    } catch (err) {
      status.textContent = `${name} requires a lead record ID. Use the Leads page to select a lead first.`;
      status.className = 'form-status error';
    }
  }

  document.getElementById('run-scaa1-btn')?.addEventListener('click', () => runWorkflow(runScaa1, 'SCAA-1 Battle Plan'));
  document.getElementById('run-wf3-btn')?.addEventListener('click', () => runWorkflow(runWf3, 'WF-3 Investor Escalation'));
  document.getElementById('run-wf4-btn')?.addEventListener('click', () => runWorkflow(runWf4, 'WF-4 Long-Tail Nurture'));

  // Load activity
  (async () => {
    try {
      const data = await fetchAuditLog(30);
      const entries = (data.entries || []).filter(e => e.route?.includes('/workflow') || e.action === 'create');
      const el = document.getElementById('task-activity');
      const total = entries.length;
      const complete = entries.filter(e => !e.error).length;
      document.getElementById('task-total').textContent = total;
      document.getElementById('task-complete').textContent = complete;
      document.getElementById('task-pending').textContent = total - complete;
      if (entries.length) {
        el.innerHTML = `<ul class="activity-feed">${entries.slice(0, 15).map(e => `<li class="activity-item"><span class="activity-ts">${e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : '--'}</span> ${e.route || ''} — ${e.action || e.enrichType || 'task'}</li>`).join('')}</ul>`;
      } else {
        el.innerHTML = '<p style="color:#9898b0">No workflow activity yet. Run a workflow above to get started.</p>';
      }
    } catch {
      document.getElementById('task-activity').innerHTML = '<p style="color:#9898b0">Connect to API to view workflow activity.</p>';
      document.getElementById('task-total').textContent = '0';
      document.getElementById('task-complete').textContent = '0';
      document.getElementById('task-pending').textContent = '0';
    }
  })();
}

function renderPortalContent(main) {
  setPortalLayout(main, 'Content Calendar', `
    <h1 class="portal-title">Content Calendar</h1>
    <div class="portal-card" style="margin-bottom:16px">
      <div class="card-body">
        <h3 style="margin-bottom:12px">AI Content Generator</h3>
        <p style="color:#9898b0;margin-bottom:16px">Generate marketing content powered by Claude AI. Output is saved to the Content Calendar in Airtable.</p>
        <form id="content-form">
          <div class="form-row">
            <div class="form-group"><label>Content Type</label>
              <select id="content-type" required>
                <option value="">Select type...</option>
                <option value="social">Social Media Post</option>
                <option value="email">Email Campaign</option>
                <option value="blog">Blog Article</option>
                <option value="video_script">Video Script</option>
                <option value="podcast_outline">Podcast Outline</option>
                <option value="listing">Property Listing</option>
              </select>
            </div>
            <div class="form-group"><label>Tone</label>
              <select id="content-tone">
                <option value="professional">Professional</option>
                <option value="luxury">Luxury / Aspirational</option>
                <option value="friendly">Friendly / Approachable</option>
                <option value="data-driven">Data-Driven / Analytical</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Topic / Brief</label><textarea id="content-topic" rows="3" required placeholder="e.g., Treasure Coast market update for Q1 2026, highlighting Jupiter and Stuart property trends..."></textarea></div>
          <button type="submit" class="btn btn-primary" id="content-submit">Generate Content</button>
          <div id="content-status" class="form-status" style="margin-top:8px"></div>
        </form>
      </div>
    </div>

    <div class="portal-card">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Generated Content</h3>
        <div id="content-output" style="white-space:pre-wrap;line-height:1.7;color:#c8c8d8;font-size:14px">
          <p style="color:#9898b0">Generate content above to see AI output here.</p>
        </div>
      </div>
    </div>
  `);

  document.getElementById('content-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('content-submit');
    const status = document.getElementById('content-status');
    const output = document.getElementById('content-output');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    status.textContent = 'AI is creating your content...';
    status.className = 'form-status';
    try {
      const result = await generateContent({
        type: document.getElementById('content-type').value,
        topic: document.getElementById('content-topic').value,
        tone: document.getElementById('content-tone').value,
      });
      output.textContent = result.content || result.output || JSON.stringify(result, null, 2);
      status.textContent = `Content generated. Model: ${result.model || 'claude'}. Saved to Airtable.`;
      status.className = 'form-status success';
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.className = 'form-status error';
      output.innerHTML = '<p style="color:#ef4444">Generation failed. Check your API connection.</p>';
    }
    btn.disabled = false;
    btn.textContent = 'Generate Content';
  });
}

function renderPortalVendors(main) {
  setPortalLayout(main, 'Vendor Compliance', `
    <h1 class="portal-title">Vendor Compliance</h1>
    <div class="portal-stats">
      <div class="stat-card"><span class="stat-num" style="color:#22c55e">25</span><span class="stat-label">VEN Agents</span></div>
      <div class="stat-card"><span class="stat-num" style="color:#4f8fff">Active</span><span class="stat-label">Division Status</span></div>
      <div class="stat-card"><span class="stat-num" style="color:#f97316">24/7</span><span class="stat-label">Monitoring</span></div>
    </div>

    <div class="portal-card" style="margin-bottom:16px">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Vendor Management AI Agents</h3>
        <div id="vendor-agents"><div class="loading-spinner">Loading vendor agents...</div></div>
      </div>
    </div>

    <div class="portal-card">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Compliance Tracking</h3>
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #2a2a3e">
            <th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">CATEGORY</th>
            <th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">STATUS</th>
            <th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">AI AGENT</th>
          </tr>
          <tr style="border-bottom:1px solid #1a1a28"><td style="padding:10px">Insurance Verification</td><td style="padding:10px"><span style="color:#22c55e">Automated</span></td><td style="padding:10px;color:#f97316">VEN-01 to VEN-05</td></tr>
          <tr style="border-bottom:1px solid #1a1a28"><td style="padding:10px">License Validation</td><td style="padding:10px"><span style="color:#22c55e">Automated</span></td><td style="padding:10px;color:#f97316">VEN-06 to VEN-10</td></tr>
          <tr style="border-bottom:1px solid #1a1a28"><td style="padding:10px">Contract Management</td><td style="padding:10px"><span style="color:#22c55e">Automated</span></td><td style="padding:10px;color:#f97316">VEN-11 to VEN-15</td></tr>
          <tr style="border-bottom:1px solid #1a1a28"><td style="padding:10px">Performance Scoring</td><td style="padding:10px"><span style="color:#22c55e">Automated</span></td><td style="padding:10px;color:#f97316">VEN-16 to VEN-20</td></tr>
          <tr><td style="padding:10px">Quality Assurance</td><td style="padding:10px"><span style="color:#22c55e">Automated</span></td><td style="padding:10px;color:#f97316">VEN-21 to VEN-25</td></tr>
        </table>
      </div>
    </div>
  `);

  // Load VEN division agents
  (async () => {
    try {
      const data = await fetchAgents({ division: 'VEN' });
      const agents = data.agents || [];
      const el = document.getElementById('vendor-agents');
      if (agents.length) {
        el.innerHTML = `<div class="agent-grid">${agents.slice(0, 12).map(a => `
          <div class="agent-card" style="border-top:3px solid #f97316">
            <div class="agent-header"><span class="agent-id">${a.id}</span><span class="status-badge ${a.status}">${a.status}</span></div>
            <div class="agent-name">${a.name}</div>
            <div class="agent-desc">${a.description || ''}</div>
          </div>
        `).join('')}</div>`;
      } else {
        el.innerHTML = '<p style="color:#9898b0">25 vendor management agents active. Connect API for live data.</p>';
      }
    } catch {
      document.getElementById('vendor-agents').innerHTML = '<p style="color:#9898b0">25 vendor management agents monitoring compliance, contracts, and performance 24/7.</p>';
    }
  })();
}

function renderPortalReports(main) {
  setPortalLayout(main, 'Reports', `
    <h1 class="portal-title">Reports & Analytics</h1>
    <div class="portal-stats" id="report-stats">
      <div class="stat-card"><span class="stat-num" style="color:#10b981">30</span><span class="stat-label">Intel Agents</span></div>
      <div class="stat-card"><span class="stat-num" style="color:#c9a84c" id="report-zones">--</span><span class="stat-label">Pricing Zones</span></div>
      <div class="stat-card"><span class="stat-num" style="color:#4f8fff" id="report-audit">--</span><span class="stat-label">Audit Entries</span></div>
    </div>

    <div class="portal-grid">
      <!-- Pricing Zones -->
      <div class="portal-card">
        <div class="card-body">
          <h3 style="margin-bottom:12px">Zone Pricing Benchmarks</h3>
          <div id="zone-pricing"><div class="loading-spinner">Loading pricing data...</div></div>
        </div>
      </div>

      <!-- System Audit Log -->
      <div class="portal-card">
        <div class="card-body">
          <h3 style="margin-bottom:12px">System Audit Log</h3>
          <div id="audit-log"><div class="loading-spinner">Loading audit log...</div></div>
        </div>
      </div>
    </div>

    <!-- Agent Metrics -->
    <div class="portal-card" style="margin-top:16px">
      <div class="card-body">
        <h3 style="margin-bottom:12px">Agent Performance Metrics</h3>
        <div id="agent-metrics"><div class="loading-spinner">Loading metrics...</div></div>
      </div>
    </div>
  `);

  // Load pricing zones
  (async () => {
    try {
      const data = await getPricingZones();
      const zones = data.zones || data;
      document.getElementById('report-zones').textContent = Array.isArray(zones) ? zones.length : '10';
      const el = document.getElementById('zone-pricing');
      if (Array.isArray(zones) && zones.length) {
        el.innerHTML = `<table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #2a2a3e"><th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">ZONE</th><th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">AVG RENT</th><th style="text-align:left;padding:8px;color:#9898b0;font-size:11px">MGMT FEE</th></tr>
          ${zones.map(z => `<tr style="border-bottom:1px solid #1a1a28"><td style="padding:10px">${z.name || z.zone || '--'}</td><td style="padding:10px;color:#c9a84c">${z.avgRent ? '$'+z.avgRent : '--'}</td><td style="padding:10px">${z.feeRange || z.fee || '--'}</td></tr>`).join('')}
        </table>`;
      } else {
        el.innerHTML = '<p style="color:#9898b0">Pricing data available via /v1/pricing/zones endpoint.</p>';
      }
    } catch {
      document.getElementById('zone-pricing').innerHTML = '<p style="color:#9898b0">Connect API to view zone pricing benchmarks.</p>';
      document.getElementById('report-zones').textContent = '10';
    }
  })();

  // Load audit log
  (async () => {
    try {
      const data = await fetchAuditLog(25);
      const entries = data.entries || [];
      document.getElementById('report-audit').textContent = entries.length;
      const el = document.getElementById('audit-log');
      if (entries.length) {
        el.innerHTML = `<ul class="activity-feed">${entries.slice(0, 15).map(e => `<li class="activity-item"><span class="activity-ts">${e.timestamp ? new Date(e.timestamp).toLocaleTimeString() : '--'}</span> <strong>${e.route || ''}</strong> ${e.action || ''} ${e.agentName || e.leadName || ''}</li>`).join('')}</ul>`;
      } else {
        el.innerHTML = '<p style="color:#9898b0">No audit entries yet.</p>';
      }
    } catch {
      document.getElementById('audit-log').innerHTML = '<p style="color:#9898b0">Connect API to view audit trail.</p>';
      document.getElementById('report-audit').textContent = '0';
    }
  })();

  // Load agent metrics
  (async () => {
    try {
      const data = await fetchAgentMetrics();
      const el = document.getElementById('agent-metrics');
      const byDiv = data.byDivision || [];
      if (byDiv.length) {
        el.innerHTML = `<div class="division-grid">${byDiv.map(d => `
          <div class="division-card" style="border-left:4px solid ${d.color || '#4f8fff'}">
            <span class="division-code">${d.id}</span>
            <span class="division-name">${d.name}</span>
            <span class="division-count">${d.agentCount} agents</span>
          </div>
        `).join('')}</div>`;
      } else {
        el.innerHTML = `<div style="display:flex;gap:16px;flex-wrap:wrap">
          <div class="stat-card"><span class="stat-num">${data.totalAgents || 290}</span><span class="stat-label">Total</span></div>
          <div class="stat-card"><span class="stat-num" style="color:#22c55e">${data.byStatus?.active || '--'}</span><span class="stat-label">Active</span></div>
          <div class="stat-card"><span class="stat-num" style="color:#4f8fff">${data.byStatus?.standby || '--'}</span><span class="stat-label">Standby</span></div>
          <div class="stat-card"><span class="stat-num" style="color:#eab308">${data.byStatus?.training || '--'}</span><span class="stat-label">Training</span></div>
        </div>`;
      }
    } catch {
      document.getElementById('agent-metrics').innerHTML = '<p style="color:#9898b0">Connect API to view agent performance metrics.</p>';
    }
  })();
}

function renderNotFound(main) {
  setPublicLayout(main, '404', `
    <section class="not-found"><h1>404</h1><p>Page not found.</p><a href="/" class="btn btn-primary">Return Home</a></section>
  `);
}
