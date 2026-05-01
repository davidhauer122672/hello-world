/**
 * Main Application Shell
 *
 * Renders the top-level layout and registers all routes.
 * Public pages get the marketing layout.
 * Portal pages get the dashboard layout with sidebar.
 */

import { registerRoute, navigate } from '../utils/router.js';
import { isAuthenticated, login, logout, apiCall } from '../utils/auth.js';

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
        <p class="hero-sub">Coastal Key delivers white-glove property management across Florida's Treasure Coast. 330 AI agents working 24/7 so your investment never sleeps.</p>
        <div class="hero-actions">
          <a href="/contact" class="btn btn-primary">Get a Proposal</a>
          <a href="/services" class="btn btn-secondary">Our Services</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">330</span><span class="stat-label">AI Agents Active</span></div>
          <div class="stat"><span class="stat-num">10</span><span class="stat-label">Service Zones</span></div>
          <div class="stat"><span class="stat-num">24/7</span><span class="stat-label">Operations</span></div>
          <div class="stat"><span class="stat-num">11</span><span class="stat-label">Divisions</span></div>
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
        <p>Coastal Key Property Management operates 330 AI agents across 11 specialized divisions — Executive, Sales, Operations, Intelligence, Marketing, Finance, Vendor Management, Technology, Website Development, Business Forecast, and Social Campaign Marketing. Our AI fleet handles everything from inbound sales calls to hurricane preparation, from investor reporting to social media content creation.</p>
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
          <li><strong>Website Development (40 agents)</strong> — Website architecture, frontend dev, deployment</li>
          <li><strong>Business Forecast (20 agents)</strong> — Market forecasting, demand modeling, CEO briefings</li>
          <li><strong>Social Campaign Marketing (20 agents)</strong> — Revenue-generating social media, content campaigns</li>
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
    { code: 'BFR', name: 'Business Forecast',  agents: 20, color: '#dc2626' },
    { code: 'SCM', name: 'Social Campaigns',   agents: 20, color: '#e11d48' },
  ];

  const fallbackStats = {
    totalAgents: 330,
    activeAgents: 312,
    divisions: 11,
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
      <div class="stat-card"><span class="stat-num" id="stat-total">330</span><span class="stat-label">Total Agents</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-active">--</span><span class="stat-label">Active</span></div>
      <div class="stat-card"><span class="stat-num" id="stat-divisions">11</span><span class="stat-label">Divisions</span></div>
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
    <div class="filter-bar">
      <input type="search" placeholder="Search agents..." class="filter-search">
      <select class="filter-select"><option value="">All Statuses</option><option>active</option><option>standby</option><option>training</option><option>maintenance</option></select>
      <select class="filter-select"><option value="">All Divisions</option><option value="EXC">Executive</option><option value="SEN">Sentinel Sales</option><option value="OPS">Operations</option><option value="INT">Intelligence</option><option value="MKT">Marketing</option><option value="FIN">Finance</option><option value="VEN">Vendor Mgmt</option><option value="TEC">Technology</option><option value="WEB">Web Development</option><option value="BFR">Business Forecast</option><option value="SCM">Social Campaigns</option></select>
    </div>
    <div class="agent-grid" id="agent-list">Loading agents...</div>
  `);
}

function renderPortalLeads(main) {
  setPortalLayout(main, 'Lead Pipeline', `
    <h1 class="portal-title">Lead Pipeline</h1>
    <div class="portal-card"><div class="card-body"><p>Connected to Airtable Leads table. Use the API to create, enrich, and manage leads.</p>
    <div class="portal-actions-bar">
      <button class="btn btn-primary" onclick="alert('Create lead via /v1/leads POST')">New Lead</button>
      <button class="btn btn-secondary" onclick="alert('Run SCAA-1 via /v1/workflows/scaa1')">Generate Battle Plan</button>
    </div></div></div>
  `);
}

function renderPortalTasks(main) {
  setPortalLayout(main, 'Tasks', `
    <h1 class="portal-title">Task Management</h1>
    <div class="portal-card"><div class="card-body"><p>Tasks are created automatically by workflows (SCAA-1, WF-3, WF-4) and linked to leads in Airtable.</p></div></div>
  `);
}

function renderPortalContent(main) {
  setPortalLayout(main, 'Content Calendar', `
    <h1 class="portal-title">Content Calendar</h1>
    <div class="portal-card"><div class="card-body"><p>Generate content via the /v1/content/generate endpoint. Supports social posts, emails, video scripts, and podcast outlines.</p>
    <div class="portal-actions-bar">
      <button class="btn btn-primary" onclick="alert('Generate via /v1/content/generate POST')">Generate Content</button>
    </div></div></div>
  `);
}

function renderPortalVendors(main) {
  setPortalLayout(main, 'Vendor Compliance', `
    <h1 class="portal-title">Vendor Compliance</h1>
    <div class="portal-card"><div class="card-body"><p>25 vendor management AI agents monitor compliance, contracts, insurance, and performance across all vendors.</p></div></div>
  `);
}

function renderPortalReports(main) {
  setPortalLayout(main, 'Reports', `
    <h1 class="portal-title">Reports & Analytics</h1>
    <div class="portal-card"><div class="card-body"><p>Intelligence division (30 agents) generates market reports, forecasts, and operational analytics.</p></div></div>
  `);
}

function renderNotFound(main) {
  setPublicLayout(main, '404', `
    <section class="not-found"><h1>404</h1><p>Page not found.</p><a href="/" class="btn btn-primary">Return Home</a></section>
  `);
}
