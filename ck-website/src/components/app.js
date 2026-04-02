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
  registerRoute('/podcast', renderPodcast);
  registerRoute('/portal', renderPortalGate);
  registerRoute('/portal/dashboard', renderPortalDashboard);
  registerRoute('/portal/agents', renderPortalAgents);
  registerRoute('/portal/leads', renderPortalLeads);
  registerRoute('/portal/tasks', renderPortalTasks);
  registerRoute('/portal/content', renderPortalContent);
  registerRoute('/portal/vendors', renderPortalVendors);
  registerRoute('/portal/reports', renderPortalReports);
  registerRoute('/portal/podcast', renderPortalPodcast);
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
        <a href="/podcast" data-nav="/podcast">Podcast</a>
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
        <a href="/podcast">Podcast</a>
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
        <a href="/portal/podcast" data-nav="/portal/podcast">Podcast</a>
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
        <p>Coastal Key Property Management operates 250 AI agents across 8 specialized divisions — Executive, Sales, Operations, Intelligence, Marketing, Finance, Vendor Management, and Technology. Our AI fleet handles everything from inbound sales calls to hurricane preparation, from investor reporting to social media content creation.</p>
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
    <div class="filter-bar">
      <input type="search" placeholder="Search agents..." class="filter-search">
      <select class="filter-select"><option value="">All Statuses</option><option>active</option><option>standby</option><option>training</option><option>maintenance</option></select>
      <select class="filter-select"><option value="">All Divisions</option><option value="EXC">Executive</option><option value="SEN">Sentinel Sales</option><option value="OPS">Operations</option><option value="INT">Intelligence</option><option value="MKT">Marketing</option><option value="FIN">Finance</option><option value="VEN">Vendor Mgmt</option><option value="TEC">Technology</option><option value="WEB">Web Development</option></select>
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

// ── Podcast (Public) ───────────────────────────────────────────────────────

function renderPodcast(main) {
  const series = [
    { id: 'market-pulse', name: 'Market Pulse', icon: '📊', desc: 'Weekly Treasure Coast market data, trends, and forecasts.' },
    { id: 'owner-spotlight', name: 'Owner Spotlight', icon: '🎙', desc: 'Conversations with property owners about their investment journey.' },
    { id: 'ai-ops', name: 'AI & Operations', icon: '🤖', desc: 'How 290 AI agents power modern property management.' },
    { id: 'treasure-coast-living', name: 'Treasure Coast Living', icon: '🌴', desc: 'Lifestyle, neighborhoods, and what makes the Treasure Coast special.' },
    { id: 'investor-edge', name: 'Investor Edge', icon: '📈', desc: 'ROI strategies, portfolio analysis, and market opportunities.' },
  ];

  setPublicLayout(main, 'Podcast', `
    <section class="page-header">
      <h1>Coastal Key Insights</h1>
      <p>AI-Powered Property Management on the Treasure Coast — The Podcast</p>
    </section>

    <section class="podcast-hero">
      <div class="podcast-hero-content">
        <div class="podcast-cover">
          <div class="podcast-cover-placeholder">
            <span class="logo-mark lg">CK</span>
            <span class="podcast-cover-title">Coastal Key<br>Insights</span>
          </div>
        </div>
        <div class="podcast-info">
          <h2>Your Weekly Treasure Coast Real Estate Intelligence</h2>
          <p>Join the Coastal Key team for weekly episodes covering luxury property management, real estate investment strategies, market intelligence, and the future of AI-driven operations — from Vero Beach to Jupiter.</p>
          <div class="podcast-subscribe-row">
            <a href="/v1/podcast/feed.xml" class="btn btn-primary" target="_blank" rel="noopener">Subscribe via RSS</a>
            <a href="/contact" class="btn btn-secondary">Suggest a Topic</a>
          </div>
          <div class="podcast-meta">
            <span>New episodes weekly</span>
            <span>25-40 min per episode</span>
            <span>Free to listen</span>
          </div>
        </div>
      </div>
    </section>

    <section class="podcast-series">
      <h2>Episode Series</h2>
      <div class="series-grid">
        ${series.map(s => `
          <div class="series-card" data-series="${s.id}">
            <span class="series-icon">${s.icon}</span>
            <h3>${s.name}</h3>
            <p>${s.desc}</p>
          </div>
        `).join('')}
      </div>
    </section>

    <section class="podcast-episodes">
      <h2>Latest Episodes</h2>
      <div id="episode-list" class="episode-list">
        <p class="loading-text">Loading episodes...</p>
      </div>
    </section>

    <section class="cta-section">
      <h2>Want to Be a Guest?</h2>
      <p>We're always looking for Treasure Coast property owners, investors, and industry experts to share their stories.</p>
      <a href="/contact" class="btn btn-primary btn-lg">Get in Touch</a>
    </section>
  `);

  // Try to load episodes from API (gracefully falls back to placeholder)
  loadPublicEpisodes();
}

async function loadPublicEpisodes() {
  const container = document.getElementById('episode-list');
  if (!container) return;

  // Placeholder episodes shown while we try the API
  const placeholderEpisodes = [
    { num: 1, title: 'Welcome to Coastal Key Insights', series: 'AI & Operations', duration: '28:00', date: '2026-04-01', desc: 'Meet the team, learn about our 290 AI agents, and discover how technology is transforming luxury property management on the Treasure Coast.' },
    { num: 2, title: 'Treasure Coast Market Report — Q1 2026', series: 'Market Pulse', duration: '34:00', date: '2026-04-08', desc: 'A deep dive into Q1 numbers across Indian River, St. Lucie, and Martin counties. Price trends, inventory levels, and what to expect in Q2.' },
    { num: 3, title: 'Storm Season Prep: AI-Powered Hurricane Readiness', series: 'AI & Operations', duration: '26:00', date: '2026-04-15', desc: 'How Coastal Key uses predictive AI to prepare properties for hurricane season — from automated checklists to real-time vendor coordination.' },
    { num: 4, title: 'Investing in Stuart: The Sailfish Capital Opportunity', series: 'Investor Edge', duration: '31:00', date: '2026-04-22', desc: 'Why Stuart is attracting investor attention: downtown revitalization, waterfront appreciation, and short-term rental potential.' },
    { num: 5, title: 'Life on Hutchinson Island: A Local\'s Guide', series: 'Treasure Coast Living', duration: '25:00', date: '2026-04-29', desc: 'Exploring Hutchinson Island\'s barrier island lifestyle — oceanfront living, nature preserves, and the tight-knit community.' },
  ];

  try {
    const res = await fetch('/v1/podcast/feed.xml');
    if (res.ok) {
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      const items = xml.querySelectorAll('item');

      if (items.length > 0) {
        container.innerHTML = Array.from(items).map((item, i) => {
          const title = item.querySelector('title')?.textContent || 'Untitled';
          const desc = item.querySelector('description')?.textContent || '';
          const pubDate = item.querySelector('pubDate')?.textContent || '';
          const duration = item.querySelector('itunes\\:duration, duration')?.textContent || '';
          return episodeCardHtml(i + 1, title, '', duration, pubDate ? new Date(pubDate).toLocaleDateString() : '', desc);
        }).join('');
        return;
      }
    }
  } catch {
    // Fall through to placeholders
  }

  container.innerHTML = placeholderEpisodes.map(ep =>
    episodeCardHtml(ep.num, ep.title, ep.series, ep.duration, ep.date, ep.desc)
  ).join('');
}

function episodeCardHtml(num, title, series, duration, date, desc) {
  return `
    <article class="episode-card">
      <div class="episode-number">EP ${num}</div>
      <div class="episode-body">
        <div class="episode-header">
          <h3>${title}</h3>
          <div class="episode-meta">
            ${series ? `<span class="episode-series">${series}</span>` : ''}
            ${duration ? `<span class="episode-duration">${duration}</span>` : ''}
            ${date ? `<span class="episode-date">${date}</span>` : ''}
          </div>
        </div>
        <p>${desc}</p>
      </div>
    </article>
  `;
}

// ── Podcast (Portal Management) ────────────────────────────────────────────

function renderPortalPodcast(main) {
  setPortalLayout(main, 'Podcast', `
    <h1 class="portal-title">Podcast Channel — Coastal Key Insights</h1>

    <div class="portal-stats" id="podcast-stats">
      <div class="stat-card"><span class="stat-num" id="pc-total">--</span><span class="stat-label">Total Episodes</span></div>
      <div class="stat-card"><span class="stat-num" id="pc-published">--</span><span class="stat-label">Published</span></div>
      <div class="stat-card"><span class="stat-num" id="pc-draft">--</span><span class="stat-label">Drafts</span></div>
      <div class="stat-card"><span class="stat-num" id="pc-series">5</span><span class="stat-label">Series</span></div>
    </div>

    <div class="portal-grid">
      <div class="portal-card">
        <h3>Generate New Episode</h3>
        <div class="card-body">
          <form id="podcast-generate-form">
            <div class="form-group">
              <label>Episode Topic</label>
              <input type="text" id="pg-topic" required placeholder="e.g., Vero Beach luxury market trends Q1 2026">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Series</label>
                <select id="pg-series">
                  <option value="">No series</option>
                  <option value="market-pulse">Market Pulse</option>
                  <option value="owner-spotlight">Owner Spotlight</option>
                  <option value="ai-ops">AI & Operations</option>
                  <option value="treasure-coast-living">Treasure Coast Living</option>
                  <option value="investor-edge">Investor Edge</option>
                </select>
              </div>
              <div class="form-group">
                <label>Guest Name (optional)</label>
                <input type="text" id="pg-guest" placeholder="Guest name for interview episode">
              </div>
            </div>
            <div class="form-group">
              <label>Target Audience</label>
              <select id="pg-segment">
                <option value="">General</option>
                <option value="property_owners">Property Owners</option>
                <option value="investors">Real Estate Investors</option>
                <option value="luxury_buyers">Luxury Homebuyers</option>
                <option value="str_operators">STR Operators</option>
              </select>
            </div>
            <button type="submit" class="btn btn-primary" id="pg-submit">Generate Episode</button>
            <div id="pg-status" class="form-status"></div>
          </form>
        </div>
      </div>

      <div class="portal-card">
        <h3>Channel Info</h3>
        <div class="card-body">
          <p><strong>Coastal Key Insights</strong></p>
          <p>AI-Powered Property Management on the Treasure Coast</p>
          <div style="margin-top:16px">
            <p><strong>RSS Feed:</strong> <a href="/v1/podcast/feed.xml" target="_blank">/v1/podcast/feed.xml</a></p>
            <p><strong>Public Page:</strong> <a href="/podcast">/podcast</a></p>
            <p><strong>Episodes API:</strong> /v1/podcast/episodes</p>
          </div>
          <div style="margin-top:16px">
            <h4 style="margin-bottom:8px">Series</h4>
            <ul style="list-style:none;padding:0">
              <li style="padding:4px 0">📊 Market Pulse</li>
              <li style="padding:4px 0">🎙 Owner Spotlight</li>
              <li style="padding:4px 0">🤖 AI & Operations</li>
              <li style="padding:4px 0">🌴 Treasure Coast Living</li>
              <li style="padding:4px 0">📈 Investor Edge</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="portal-card" style="margin-top:20px">
      <h3>Recent Episodes</h3>
      <div class="card-body">
        <div id="portal-episode-list">Loading episodes...</div>
      </div>
    </div>

    <div class="portal-card" style="margin-top:20px" id="pg-result-card" hidden>
      <h3>Generated Episode</h3>
      <div class="card-body" id="pg-result"></div>
    </div>
  `);

  // Load stats
  (async () => {
    try {
      const data = await apiCall('/v1/podcast/stats');
      if (data?.stats) {
        const el = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
        el('pc-total', data.stats.totalEpisodes);
        el('pc-published', data.stats.published);
        el('pc-draft', data.stats.draft);
      }
    } catch { /* stats unavailable */ }
  })();

  // Load episode list
  (async () => {
    try {
      const data = await apiCall('/v1/podcast/episodes');
      const list = document.getElementById('portal-episode-list');
      if (!list) return;

      if (data?.episodes?.length) {
        list.innerHTML = data.episodes.map(ep => `
          <div style="padding:12px 0;border-bottom:1px solid var(--border)">
            <strong>${ep.title}</strong>
            <span style="color:var(--text-secondary);font-size:13px;margin-left:12px">${ep.status}</span>
            ${ep.series ? `<span style="color:var(--accent);font-size:12px;margin-left:8px">${ep.series}</span>` : ''}
            ${ep.duration ? `<span style="color:var(--text-secondary);font-size:12px;margin-left:8px">${ep.duration}</span>` : ''}
          </div>
        `).join('');
      } else {
        list.innerHTML = '<p>No episodes yet. Generate your first episode above.</p>';
      }
    } catch {
      const list = document.getElementById('portal-episode-list');
      if (list) list.innerHTML = '<p>Connect to the API to view episodes.</p>';
    }
  })();

  // Generate form handler
  document.getElementById('podcast-generate-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('pg-submit');
    const status = document.getElementById('pg-status');
    btn.disabled = true;
    btn.textContent = 'Generating...';
    status.textContent = '';

    try {
      const data = await apiCall('/v1/podcast/episodes', {
        method: 'POST',
        body: JSON.stringify({
          topic: document.getElementById('pg-topic').value,
          series: document.getElementById('pg-series').value || undefined,
          guest: document.getElementById('pg-guest').value || undefined,
          segment: document.getElementById('pg-segment').value || undefined,
        }),
      });

      if (data?.episode) {
        status.textContent = 'Episode generated successfully!';
        status.className = 'form-status success';

        const resultCard = document.getElementById('pg-result-card');
        const result = document.getElementById('pg-result');
        if (resultCard && result) {
          resultCard.hidden = false;
          result.innerHTML = `
            <h4 style="margin-bottom:8px">${data.episode.title}</h4>
            ${data.episode.subtitle ? `<p style="color:var(--accent);margin-bottom:12px">${data.episode.subtitle}</p>` : ''}
            <p style="margin-bottom:16px">${data.episode.description || ''}</p>
            ${data.episode.talkingPoints?.length ? `<h4 style="margin:16px 0 8px">Talking Points</h4><ul>${data.episode.talkingPoints.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}
            ${data.episode.introScript ? `<h4 style="margin:16px 0 8px">Intro Script</h4><p style="font-style:italic">${data.episode.introScript}</p>` : ''}
            ${data.episode.outroScript ? `<h4 style="margin:16px 0 8px">Outro Script</h4><p style="font-style:italic">${data.episode.outroScript}</p>` : ''}
            ${data.episode.guestQuestions?.length ? `<h4 style="margin:16px 0 8px">Guest Questions</h4><ol>${data.episode.guestQuestions.map(q => `<li>${q}</li>`).join('')}</ol>` : ''}
            ${data.episode.showNotes ? `<h4 style="margin:16px 0 8px">Show Notes</h4><div>${data.episode.showNotes}</div>` : ''}
            <p style="margin-top:16px;font-size:13px;color:var(--text-secondary)">Model: ${data.model || 'N/A'} | Cached: ${data.cached || false}${data.episode.id ? ` | Record: ${data.episode.id}` : ''}</p>
          `;
        }
      }
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.className = 'form-status error';
    }

    btn.disabled = false;
    btn.textContent = 'Generate Episode';
  });
}

function renderNotFound(main) {
  setPublicLayout(main, '404', `
    <section class="not-found"><h1>404</h1><p>Page not found.</p><a href="/" class="btn btn-primary">Return Home</a></section>
  `);
}
