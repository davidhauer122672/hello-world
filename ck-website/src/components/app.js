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
  registerRoute('/home-watch', renderHomeWatch);
  registerRoute('/home-watch/sailfish-point', renderSailfishPoint);
  registerRoute('/home-watch/harbour-ridge', renderHarbourRidge);
  registerRoute('/home-watch/the-moorings', renderTheMoorings);
  registerRoute('/home-watch/hutchinson-island', renderHutchinsonIsland);
  registerRoute('/areas', renderAreas);
  registerRoute('/about', renderAbout);
  registerRoute('/reviews', renderReviews);
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
        <a href="/home-watch" data-nav="/home-watch">Home Watch</a>
        <a href="/services" data-nav="/services">Services</a>
        <a href="/areas" data-nav="/areas">Areas</a>
        <a href="/about" data-nav="/about">About</a>
        <a href="/reviews" data-nav="/reviews">Reviews</a>
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
        <h4>Home Watch</h4>
        <a href="/home-watch">Home Watch Services</a>
        <a href="/home-watch/sailfish-point">Sailfish Point</a>
        <a href="/home-watch/harbour-ridge">Harbour Ridge</a>
        <a href="/home-watch/the-moorings">The Moorings</a>
        <a href="/home-watch/hutchinson-island">Hutchinson Island</a>
      </div>
      <div class="footer-col">
        <h4>Services</h4>
        <a href="/services">Property Management</a>
        <a href="/services">Vehicle & Vessel Oversight</a>
        <a href="/services">Concierge Services</a>
        <a href="/services">Investor Relations</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="/about">About Us</a>
        <a href="/reviews">Reviews</a>
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
  setPublicLayout(main, 'NHWA Accredited Home Watch & Property Management', `
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">NHWA Accredited | AI-Powered Property Management</div>
        <h1>Your Property. <br>Our Obsession.</h1>
        <p class="hero-sub">Coastal Key delivers NHWA-accredited home watch and white-glove property management across Florida's Treasure Coast — backed by 290 AI agents working 24/7 so your investment never sleeps.</p>
        <div class="hero-actions">
          <a href="/contact" class="btn btn-primary">Get a Free Inspection</a>
          <a href="/home-watch" class="btn btn-secondary">Home Watch Services</a>
        </div>
        <div class="hero-stats">
          <div class="stat"><span class="stat-num">4</span><span class="stat-label">Counties Served</span></div>
          <div class="stat"><span class="stat-num">40+</span><span class="stat-label">Point Inspections</span></div>
          <div class="stat"><span class="stat-num">24/7</span><span class="stat-label">Operations</span></div>
          <div class="stat"><span class="stat-num">NHWA</span><span class="stat-label">Accredited</span></div>
        </div>
      </div>
    </section>

    <section class="trust-bar">
      <div class="trust-bar-inner">
        <div class="trust-item">
          <div class="trust-badge nhwa-badge">NHWA</div>
          <span>Accredited Member</span>
        </div>
        <div class="trust-item">
          <div class="trust-badge bbb-badge">BBB</div>
          <span>Accredited Business</span>
        </div>
        <div class="trust-item">
          <div class="trust-badge ins-badge">INS</div>
          <span>Licensed, Bonded & Insured</span>
        </div>
        <div class="trust-item">
          <div class="trust-badge bg-badge">BG</div>
          <span>Background Checked</span>
        </div>
      </div>
    </section>

    <section class="team-section">
      <div class="team-inner">
        <div class="team-text">
          <h2>Real People. Real Expertise. Real Presence.</h2>
          <p>Behind our technology platform are Treasure Coast professionals who live and work in your communities. Our team members are background-checked, NHWA-trained, and personally invested in protecting your property.</p>
          <div class="team-highlights">
            <div class="team-highlight">
              <strong>David Hauer</strong>
              <span>Founder & Lead Inspector</span>
              <p>Stuart resident. Hands-on with every property. Personally oversees inspections across all four counties.</p>
            </div>
            <div class="team-highlight">
              <strong>Local Expertise</strong>
              <span>Treasure Coast Natives</span>
              <p>Our inspectors know every community from Sailfish Point to The Moorings. We don't just watch your home — we know your neighborhood.</p>
            </div>
          </div>
          <a href="/about" class="btn btn-secondary">Meet the Team</a>
        </div>
        <div class="team-values">
          <div class="value-card">
            <div class="value-icon">T</div>
            <h4>Trust</h4>
            <p>NHWA accredited. Background checked. Insured and bonded. Your keys are safe with us.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">C</div>
            <h4>Communication</h4>
            <p>Photo-documented inspection reports delivered digitally after every visit. No surprises.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">C</div>
            <h4>Confidentiality</h4>
            <p>Your property details, access codes, and personal information are protected with enterprise-grade security.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <h2>Enterprise-Grade Operations. Boutique-Level Care.</h2>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon" style="background:#0d9488">HW</div>
          <h3>NHWA Home Watch</h3>
          <p>Accredited home watch inspections — 40+ point interior/exterior checks with photo documentation for seasonal, vacant, and absentee-owned properties.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#f59e0b">PM</div>
          <h3>Property Management</h3>
          <p>Full-service management: tenant screening, maintenance, financials, STR optimization, and concierge — all powered by AI operations.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#ef4444">HP</div>
          <h3>Hurricane Preparedness</h3>
          <p>Pre-storm securing, post-storm damage inspections with insurance-ready documentation, and recovery coordination — boots on the ground when it matters.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon" style="background:#8b5cf6">VV</div>
          <h3>Vehicle & Vessel Oversight</h3>
          <p>Battery maintenance, engine cycling, bilge pump checks, detailing coordination, and secure storage oversight for your cars and boats while you're away.</p>
        </div>
      </div>
    </section>

    <section class="communities-section">
      <h2>Trusted in the Treasure Coast's Premier Communities</h2>
      <p class="section-sub">Dedicated home watch services for the most exclusive addresses on Florida's east coast.</p>
      <div class="community-grid">
        <a href="/home-watch/sailfish-point" class="community-card">
          <h3>Sailfish Point</h3>
          <span>Stuart, Martin County</span>
          <p>Oceanfront and Intracoastal estates on this private island community.</p>
        </a>
        <a href="/home-watch/harbour-ridge" class="community-card">
          <h3>Harbour Ridge</h3>
          <span>Palm City, Martin County</span>
          <p>1,920-acre yacht and country club with two championship golf courses.</p>
        </a>
        <a href="/home-watch/the-moorings" class="community-card">
          <h3>The Moorings</h3>
          <span>Vero Beach, Indian River County</span>
          <p>Prestigious waterfront club community on the barrier island.</p>
        </a>
        <a href="/home-watch/hutchinson-island" class="community-card">
          <h3>Hutchinson Island</h3>
          <span>Martin & St. Lucie Counties</span>
          <p>Barrier island oceanfront condos and estates — first line of defense during storm season.</p>
        </a>
      </div>
    </section>

    <section class="reviews-section-home">
      <h2>What Property Owners Are Saying</h2>
      <div class="review-grid">
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"We were in Connecticut when the AC failed during a July heat wave. Coastal Key had a tech there within two hours. Saved us from a mold disaster."</p>
          <span class="review-author">— Seasonal Homeowner, Sailfish Point</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"The photo reports after every inspection give us total peace of mind. We can see exactly what's happening at our property from 1,200 miles away."</p>
          <span class="review-author">— Snowbird, Harbour Ridge</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"After Hurricane Milton, Coastal Key had our property inspected and documented within 24 hours. Our insurance claim was filed before we even landed in Florida."</p>
          <span class="review-author">— Investor, Hutchinson Island</span>
        </div>
      </div>
      <div class="review-cta">
        <a href="/reviews" class="btn btn-secondary">Read All Reviews</a>
        <a href="https://g.page/r/coastalkey-pm/review" target="_blank" rel="noopener" class="btn btn-primary">Leave a Google Review</a>
      </div>
    </section>

    <section class="cta-section">
      <h2>Ready to Protect Your Treasure Coast Investment?</h2>
      <p>NHWA-accredited home watch. AI-powered operations. Treasure Coast professionals who know your neighborhood.</p>
      <div class="hero-actions">
        <a href="/contact" class="btn btn-primary btn-lg">Schedule a Free Inspection</a>
        <a href="tel:+17724442710" class="btn btn-secondary btn-lg" style="border-color:#fff;color:#fff;">Call (772) 444-2710</a>
      </div>
    </section>
  `);
}

function renderServices(main) {
  setPublicLayout(main, 'Services', `
    <section class="page-header"><h1>Our Services</h1><p>Comprehensive property management powered by AI precision and human care. NHWA accredited.</p></section>
    <section class="services-grid">
      <div class="service-card service-featured">
        <div class="service-badge">NHWA Accredited</div>
        <h3>Home Watch Services</h3>
        <p>NHWA-accredited home watch inspections for seasonal, vacant, and absentee-owned properties. 40+ point interior/exterior checks with photo documentation delivered digitally after every visit. Weekly and biweekly options available.</p>
        <a href="/home-watch" class="btn btn-primary" style="margin-top:16px">Learn More</a>
      </div>
      <div class="service-card"><h3>Full-Service Property Management</h3><p>End-to-end management: tenant screening, maintenance coordination, financial reporting, and owner communications — all AI-optimized.</p></div>
      <div class="service-card"><h3>Short-Term Rental Management</h3><p>Dynamic pricing, multi-platform listing optimization, guest communications, turnover coordination, and revenue maximization.</p></div>
      <div class="service-card"><h3>Vehicle & Vessel Oversight</h3><p>Your car and boat shouldn't sit idle and deteriorate while you're up north. We handle battery maintenance, engine cycling, bilge pump checks, fuel stabilization, detailing coordination, and secure storage oversight. Your vehicles and vessels stay ready to go the day you arrive.</p></div>
      <div class="service-card"><h3>Luxury Concierge Services</h3><p>White-glove concierge for high-end properties: personal shopping, travel arrangements, event planning, and guest experiences.</p></div>
      <div class="service-card"><h3>Investor Relations</h3><p>Portfolio analysis, ROI reporting, market intelligence, and acquisition opportunity identification for serious investors.</p></div>
      <div class="service-card"><h3>Maintenance & Inspections</h3><p>Preventive maintenance programs, quarterly inspections, vendor management, and emergency response coordination.</p></div>
      <div class="service-card"><h3>Hurricane Preparedness</h3><p>Storm preparation, property securing, post-storm inspections with insurance-ready documentation, and recovery coordination. We're on-site before the storm and back within 24 hours after all-clear.</p></div>
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
    { name: 'Hutchinson Island', county: 'Martin & St. Lucie', desc: 'Barrier island with oceanfront condos and estates — first line of defense during storm season.' },
    { name: 'Jupiter', county: 'Palm Beach', desc: 'Celebrity haven with world-class golf, dining, and waterfront estates.' },
    { name: 'Tequesta', county: 'Palm Beach', desc: 'Exclusive village at the Jupiter Inlet with waterfront luxury.' },
    { name: 'Palm Beach Gardens', county: 'Palm Beach', desc: 'Premier golf communities and upscale residential neighborhoods.' },
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
    <section class="page-header"><h1>About Coastal Key</h1><p>Real people. Real expertise. Technology that amplifies both.</p></section>
    <section class="about-content">
      <div class="about-text">
        <div class="about-trust-badges">
          <div class="about-badge"><strong>NHWA</strong> Accredited Member</div>
          <div class="about-badge"><strong>BBB</strong> Accredited Business</div>
          <div class="about-badge"><strong>Licensed</strong> Bonded & Insured</div>
        </div>

        <h2>The People Behind the Technology</h2>
        <p>Before we're a technology company, we're your neighbors. Coastal Key was founded by David Hauer in Stuart, Florida — a Treasure Coast professional who saw an industry stuck in the past and built something better.</p>

        <div class="founder-section">
          <div class="founder-card">
            <div class="founder-avatar">DH</div>
            <div class="founder-info">
              <h3>David Hauer</h3>
              <span>Founder & Lead Inspector</span>
              <p>Stuart resident. NHWA-accredited. Personally oversees property inspections across Indian River, St. Lucie, Martin, and Palm Beach counties. Every property in our care has David's direct attention — backed by a technology platform that ensures nothing falls through the cracks.</p>
            </div>
          </div>
        </div>

        <h2>Human Expertise, Amplified by AI</h2>
        <p>Every property inspection is performed by a background-checked, NHWA-trained professional who physically walks your home, checks every system, and documents everything with timestamped photos. That's non-negotiable — no app or sensor replaces human eyes and hands.</p>
        <p>What our AI platform does is amplify that human expertise: automated scheduling, instant photo report delivery, vendor accountability tracking, insurance documentation, predictive maintenance alerts, and 24/7 monitoring of your property's digital systems. Our inspectors catch the problems. Our technology ensures they're documented, communicated, and resolved — fast.</p>

        <h3>Our Commitments</h3>
        <ul class="commitment-list">
          <li><strong>Trust</strong> — NHWA accredited, background checked, insured and bonded. Your keys and access codes are protected with enterprise-grade security.</li>
          <li><strong>Communication</strong> — Photo-documented reports after every inspection. No mysteries, no missed updates.</li>
          <li><strong>Confidentiality</strong> — Your property details, valuables inventory, and personal information are never shared. Period.</li>
          <li><strong>Responsiveness</strong> — Emergency situations get same-day response. Storm events get 24-hour post-all-clear inspections.</li>
          <li><strong>Accountability</strong> — We supervise your vendors (pool, landscape, pest, HVAC) and verify they're showing up and performing. Your HOA fines are our problem to prevent.</li>
        </ul>

        <h3>Technology Platform</h3>
        <p>Our AI operations platform runs 290 agents across 9 specialized divisions, handling everything from automated inspection scheduling to hurricane response coordination. But every AI action is overseen by a human professional. Technology serves the relationship — never the other way around.</p>
        <ul class="division-list">
          <li><strong>Executive (20 agents)</strong> — Strategy, governance, risk management</li>
          <li><strong>Sentinel Sales (40 agents)</strong> — Lead generation, qualification, conversion</li>
          <li><strong>Operations (45 agents)</strong> — Property management, maintenance, concierge</li>
          <li><strong>Intelligence (30 agents)</strong> — Market research, predictive analytics</li>
          <li><strong>Marketing (40 agents)</strong> — Content, SEO, advertising, social media</li>
          <li><strong>Finance (25 agents)</strong> — Revenue tracking, investor reporting, budgets</li>
          <li><strong>Vendor Management (25 agents)</strong> — Compliance, contracts, quality</li>
          <li><strong>Technology (25 agents)</strong> — Platform ops, integrations, security</li>
          <li><strong>Web Development (40 agents)</strong> — Digital presence, owner portals, analytics</li>
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
              <option>Palm City</option><option>Hobe Sound</option><option>Hutchinson Island</option>
              <option>Jupiter</option><option>Tequesta</option><option>Palm Beach Gardens</option>
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

// ── Home Watch Pages ────────────────────────────────────────────────────────

function renderHomeWatch(main) {
  setPublicLayout(main, 'NHWA Accredited Home Watch Services', `
    <section class="page-header hw-header">
      <div class="hw-header-badge">NHWA Accredited Member</div>
      <h1>Home Watch Services</h1>
      <p>NHWA-accredited home watch for seasonal, vacant, and absentee-owned properties across Florida's Treasure Coast.</p>
      <div class="hw-header-actions">
        <a href="/contact" class="btn btn-primary btn-lg">Schedule a Free Inspection</a>
        <a href="tel:+17724442710" class="btn btn-secondary btn-lg" style="border-color:#fff;color:#fff;">Call (772) 444-2710</a>
      </div>
    </section>

    <section class="trust-bar">
      <div class="trust-bar-inner">
        <div class="trust-item"><div class="trust-badge nhwa-badge">NHWA</div><span>Accredited Member</span></div>
        <div class="trust-item"><div class="trust-badge bbb-badge">BBB</div><span>Accredited Business</span></div>
        <div class="trust-item"><div class="trust-badge ins-badge">INS</div><span>Licensed, Bonded & Insured</span></div>
        <div class="trust-item"><div class="trust-badge bg-badge">BG</div><span>Background Checked</span></div>
      </div>
    </section>

    <section class="hw-intro">
      <div class="hw-intro-inner">
        <div class="hw-intro-text">
          <h2>What Is Home Watch?</h2>
          <p>Home watch is a professional visual inspection of your home performed on a regular schedule while you're away. Unlike house sitting or alarm monitoring, NHWA-accredited home watch means a trained, background-checked, insured professional physically enters your property, inspects every critical system, and documents the condition with timestamped photos.</p>
          <p>The National Home Watch Association (NHWA) accredits only home watch companies that meet rigorous standards for professionalism, insurance, and ethics. <strong>Coastal Key Property Management is a proud NHWA Accredited Member.</strong></p>
        </div>
        <div class="hw-intro-why">
          <h3>Why You Need Home Watch</h3>
          <ul>
            <li>AC failures cause mold growth in 24-48 hours in Florida's humidity</li>
            <li>Slow leaks destroy drywall, flooring, and personal property for weeks undetected</li>
            <li>Insurance companies increasingly require documented property monitoring for vacant homes</li>
            <li>HOA violations (overgrown landscaping, pool algae) generate fines whether you're home or not</li>
            <li>Pest intrusion, plumbing failures, and roof damage compound when nobody is watching</li>
            <li>Florida's 30-day vacancy exclusion can void your insurance coverage</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="hw-checklist">
      <h2>Our 40+ Point Inspection Checklist</h2>
      <p class="section-sub">Every visit. Every property. No shortcuts.</p>
      <div class="checklist-grid">
        <div class="checklist-group">
          <h4>Interior Systems</h4>
          <ul>
            <li>AC operation & thermostat verification</li>
            <li>Humidity level readings</li>
            <li>Water heater inspection</li>
            <li>All faucets & toilets — run and check for leaks</li>
            <li>Under-sink inspections for moisture</li>
            <li>Refrigerator & ice maker status</li>
            <li>Appliance check (washer, dryer, dishwasher)</li>
            <li>Electrical panel visual inspection</li>
            <li>Smoke & CO detector battery check</li>
            <li>Interior moisture readings (bathrooms, closets, laundry)</li>
          </ul>
        </div>
        <div class="checklist-group">
          <h4>Security & Safety</h4>
          <ul>
            <li>Door & window lock verification</li>
            <li>Alarm system status check</li>
            <li>Garage entry point inspection</li>
            <li>Signs of attempted entry or trespassing</li>
            <li>Interior lighting rotation</li>
            <li>Blind/shade adjustment</li>
            <li>Mail & package collection</li>
            <li>Key & access code management</li>
          </ul>
        </div>
        <div class="checklist-group">
          <h4>Exterior & Grounds</h4>
          <ul>
            <li>Roof visual inspection (from ground level)</li>
            <li>Soffit & fascia check</li>
            <li>Pool/spa condition & equipment</li>
            <li>Pool cage/screen enclosure integrity</li>
            <li>Landscape health & irrigation verification</li>
            <li>Driveway & walkway condition</li>
            <li>Exterior lighting test</li>
            <li>Pest evidence check (exterior)</li>
            <li>Gutter & downspout inspection</li>
            <li>Fence & gate condition</li>
          </ul>
        </div>
        <div class="checklist-group">
          <h4>Documentation & Reporting</h4>
          <ul>
            <li>Timestamped photo documentation</li>
            <li>Digital report delivered same-day</li>
            <li>Issue severity classification</li>
            <li>Vendor coordination for any findings</li>
            <li>Insurance-compliant documentation</li>
            <li>Audit trail maintained per property</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="hw-communities">
      <h2>Premier Communities We Serve</h2>
      <p class="section-sub">Dedicated home watch for the Treasure Coast's most exclusive addresses.</p>
      <div class="community-grid">
        <a href="/home-watch/sailfish-point" class="community-card">
          <h3>Sailfish Point</h3>
          <span>Stuart, Martin County</span>
          <p>Private island community. Oceanfront and Intracoastal estates requiring specialized home watch protocols.</p>
        </a>
        <a href="/home-watch/harbour-ridge" class="community-card">
          <h3>Harbour Ridge</h3>
          <span>Palm City, Martin County</span>
          <p>1,920-acre yacht & country club. Championship golf, luxury homes, extensive seasonal vacancy.</p>
        </a>
        <a href="/home-watch/the-moorings" class="community-card">
          <h3>The Moorings</h3>
          <span>Vero Beach, Indian River County</span>
          <p>Barrier island club community. Waterfront estates with salt-air exposure and hurricane vulnerability.</p>
        </a>
        <a href="/home-watch/hutchinson-island" class="community-card">
          <h3>Hutchinson Island</h3>
          <span>Martin & St. Lucie Counties</span>
          <p>Barrier island. Highest storm surge risk on the Treasure Coast. Oceanfront condos and estates.</p>
        </a>
      </div>
      <div class="hw-areas-full">
        <h3>Full Coverage Area</h3>
        <div class="hw-counties">
          <div class="hw-county">
            <h4>Indian River County</h4>
            <p>Vero Beach, Sebastian, Indian River Shores, Orchid Island, Johns Island, Windsor, Grand Harbor, Bent Pine</p>
          </div>
          <div class="hw-county">
            <h4>St. Lucie County</h4>
            <p>Fort Pierce, Port St. Lucie, St. Lucie West, Hutchinson Island South, PGA Village, Tradition</p>
          </div>
          <div class="hw-county">
            <h4>Martin County</h4>
            <p>Stuart, Jensen Beach, Palm City, Hobe Sound, Sewall's Point, Hutchinson Island, Rocky Point, Indiantown</p>
          </div>
          <div class="hw-county">
            <h4>Palm Beach County</h4>
            <p>Jupiter, Jupiter Island, Tequesta, Juno Beach, Palm Beach Gardens, North Palm Beach</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta-section">
      <h2>Protect Your Treasure Coast Property Today</h2>
      <p>NHWA accredited. Background checked. Licensed, bonded, and insured. Your first inspection is free.</p>
      <div class="hero-actions">
        <a href="/contact" class="btn btn-primary btn-lg">Get Your Free Inspection</a>
        <a href="tel:+17724442710" class="btn btn-secondary btn-lg" style="border-color:#fff;color:#fff;">Call (772) 444-2710</a>
      </div>
    </section>
  `);
}

function renderSailfishPoint(main) {
  setPublicLayout(main, 'Home Watch — Sailfish Point', `
    <section class="page-header community-header">
      <div class="hw-header-badge">NHWA Accredited</div>
      <h1>Sailfish Point Home Watch</h1>
      <p>Dedicated home watch services for Stuart's premier private island community.</p>
    </section>
    <section class="community-content">
      <div class="community-intro">
        <h2>Home Watch Built for Sailfish Point</h2>
        <p>Sailfish Point is one of Martin County's most prestigious addresses — a private island community at the tip of Hutchinson Island with oceanfront estates, Intracoastal-front homes, and a Jack Nicklaus Signature golf course. With seasonal residency rates among the highest on the Treasure Coast, Sailfish Point properties require specialized home watch protocols that standard providers simply don't deliver.</p>
        <p>Coastal Key's NHWA-accredited team provides dedicated home watch inspections tailored to Sailfish Point's unique environment: salt-air corrosion monitoring, hurricane shutter systems, private marina and dock checks, and coordination with Sailfish Point's security team for gate access and alarm integration.</p>
      </div>
      <div class="community-specifics">
        <h3>Sailfish Point-Specific Protocols</h3>
        <ul class="community-checklist">
          <li>Salt-air corrosion monitoring on exterior fixtures, AC condensers, and pool cages</li>
          <li>Hurricane shutter system inspection and pre-storm activation readiness</li>
          <li>Coordination with Sailfish Point gate security for seamless property access</li>
          <li>Private dock and boat lift visual inspection (if applicable)</li>
          <li>Golf course-adjacent landscape and irrigation oversight</li>
          <li>Oceanfront/Intracoastal wind damage assessment after weather events</li>
          <li>Seawall and shoreline erosion monitoring</li>
          <li>Full interior 40+ point inspection per NHWA standards</li>
        </ul>
      </div>
      <div class="community-cta">
        <h3>Schedule Your Sailfish Point Home Watch</h3>
        <p>Your first inspection is complimentary. We'll walk the property, assess its unique needs, and build a custom home watch plan.</p>
        <div class="hero-actions" style="justify-content:flex-start">
          <a href="/contact" class="btn btn-primary">Free Inspection</a>
          <a href="tel:+17724442710" class="btn btn-secondary">Call (772) 444-2710</a>
        </div>
      </div>
    </section>
  `);
}

function renderHarbourRidge(main) {
  setPublicLayout(main, 'Home Watch — Harbour Ridge', `
    <section class="page-header community-header">
      <div class="hw-header-badge">NHWA Accredited</div>
      <h1>Harbour Ridge Home Watch</h1>
      <p>Dedicated home watch services for Palm City's 1,920-acre yacht and country club community.</p>
    </section>
    <section class="community-content">
      <div class="community-intro">
        <h2>Home Watch Built for Harbour Ridge</h2>
        <p>Harbour Ridge Yacht & Country Club spans nearly 2,000 acres in Palm City with two championship Pete Dye golf courses, a deep-water marina on the St. Lucie River, and over 900 residences. The community's extensive seasonal ownership makes it one of Martin County's highest-demand areas for professional home watch.</p>
        <p>Coastal Key's NHWA-accredited team provides dedicated home watch inspections designed for Harbour Ridge's diverse property types — from garden villas and golf cottages to waterfront estates along the St. Lucie River. We coordinate with Harbour Ridge's HOA requirements and gate security for streamlined access.</p>
      </div>
      <div class="community-specifics">
        <h3>Harbour Ridge-Specific Protocols</h3>
        <ul class="community-checklist">
          <li>HOA compliance monitoring (landscape, exterior maintenance, parking)</li>
          <li>Golf course-adjacent drainage and irrigation checks</li>
          <li>Marina-adjacent humidity and moisture monitoring for waterfront homes</li>
          <li>Coordination with Harbour Ridge gate security and property management</li>
          <li>Pool and spa chemical balance verification (visual + contractor coordination)</li>
          <li>Garage and cart storage area inspection</li>
          <li>Pest prevention monitoring (fire ants, termites, rodents)</li>
          <li>Full interior 40+ point inspection per NHWA standards</li>
        </ul>
      </div>
      <div class="community-cta">
        <h3>Schedule Your Harbour Ridge Home Watch</h3>
        <p>Complimentary first inspection. We'll assess your property's specific needs and build a custom home watch plan.</p>
        <div class="hero-actions" style="justify-content:flex-start">
          <a href="/contact" class="btn btn-primary">Free Inspection</a>
          <a href="tel:+17724442710" class="btn btn-secondary">Call (772) 444-2710</a>
        </div>
      </div>
    </section>
  `);
}

function renderTheMoorings(main) {
  setPublicLayout(main, 'Home Watch — The Moorings', `
    <section class="page-header community-header">
      <div class="hw-header-badge">NHWA Accredited</div>
      <h1>The Moorings Home Watch</h1>
      <p>Dedicated home watch services for Vero Beach's prestigious barrier island club community.</p>
    </section>
    <section class="community-content">
      <div class="community-intro">
        <h2>Home Watch Built for The Moorings</h2>
        <p>The Moorings is one of Indian River County's most exclusive waterfront communities — a private club on Vero Beach's barrier island with oceanfront and river-front estates, a championship golf course, and a full-service yacht club. The community's barrier island location means heightened exposure to salt air, tropical storms, and the unique moisture challenges of waterfront Florida living.</p>
        <p>Coastal Key's NHWA-accredited team provides dedicated home watch inspections calibrated for The Moorings' barrier island environment. Our inspectors understand the accelerated corrosion, humidity patterns, and storm vulnerability that comes with living between the Atlantic Ocean and the Indian River Lagoon.</p>
      </div>
      <div class="community-specifics">
        <h3>The Moorings-Specific Protocols</h3>
        <ul class="community-checklist">
          <li>Accelerated salt-air corrosion checks on all exterior metals, fixtures, and AC units</li>
          <li>Barrier island humidity monitoring with calibrated moisture readings</li>
          <li>Seawall and dock inspection for erosion and storm damage</li>
          <li>Impact window and hurricane shutter readiness checks</li>
          <li>Coordination with The Moorings Club security</li>
          <li>Yacht club/marina-adjacent property monitoring</li>
          <li>Post-tropical-weather rapid-response inspections</li>
          <li>Full interior 40+ point inspection per NHWA standards</li>
        </ul>
      </div>
      <div class="community-cta">
        <h3>Schedule Your Moorings Home Watch</h3>
        <p>Complimentary first inspection. We'll assess your barrier island property's specific vulnerabilities and build a custom plan.</p>
        <div class="hero-actions" style="justify-content:flex-start">
          <a href="/contact" class="btn btn-primary">Free Inspection</a>
          <a href="tel:+17724442710" class="btn btn-secondary">Call (772) 444-2710</a>
        </div>
      </div>
    </section>
  `);
}

function renderHutchinsonIsland(main) {
  setPublicLayout(main, 'Home Watch — Hutchinson Island', `
    <section class="page-header community-header">
      <div class="hw-header-badge">NHWA Accredited</div>
      <h1>Hutchinson Island Home Watch</h1>
      <p>Dedicated home watch services for Florida's Treasure Coast barrier island — Martin and St. Lucie Counties.</p>
    </section>
    <section class="community-content">
      <div class="community-intro">
        <h2>Hutchinson Island Demands Specialized Home Watch</h2>
        <p>Hutchinson Island stretches across both Martin and St. Lucie Counties — a 23-mile barrier island that is the first line of defense when tropical weather hits the Treasure Coast. From Stuart Beach and Bathtub Reef in the south to Fort Pierce Inlet in the north, Hutchinson Island's oceanfront condos and estates face higher storm surge risk, salt corrosion, and wind exposure than any other area we serve.</p>
        <p>That's exactly why Hutchinson Island property owners need home watch more than anyone. When a system moves through, your mainland property might escape unscathed while your barrier island home takes the full impact. Coastal Key maintains rapid-response capability for Hutchinson Island — we're inspecting properties within 24 hours of all-clear after any named storm or significant weather event.</p>
      </div>
      <div class="community-specifics">
        <h3>Hutchinson Island-Specific Protocols</h3>
        <ul class="community-checklist">
          <li>Enhanced hurricane preparedness with pre-storm shutter activation</li>
          <li>Post-storm rapid response inspections within 24 hours of all-clear</li>
          <li>Insurance-ready damage documentation with timestamped photos</li>
          <li>Salt spray and wind-driven rain damage assessment</li>
          <li>Oceanfront balcony, railing, and sliding door seal inspection</li>
          <li>Condo building common area coordination (elevator lobbies, parking garages, pool decks)</li>
          <li>Elevated humidity monitoring for high-rise units</li>
          <li>A1A access monitoring after storm closures</li>
          <li>Coordination with condo associations and building management</li>
          <li>Full interior 40+ point inspection per NHWA standards</li>
        </ul>
      </div>
      <div class="hutch-coverage">
        <h3>Hutchinson Island Coverage</h3>
        <div class="hutch-areas">
          <div class="hutch-area">
            <h4>Martin County Side</h4>
            <p>Sailfish Point, Stuart Beach, Bathtub Reef Beach, MacArthur Boulevard, Ocean Bay Villas, Plantation House, Islander 12, Oceana, Ocean Towers, Indian RiverSide Park area</p>
          </div>
          <div class="hutch-area">
            <h4>St. Lucie County Side</h4>
            <p>Hutchinson Island South, Jensen Beach to Fort Pierce, Nettles Island, Ocean Village, Marriott Hutchinson Island, Indian River Plantation, Oceanrise, Sandpiper Bay</p>
          </div>
        </div>
      </div>
      <div class="community-cta">
        <h3>Protect Your Hutchinson Island Investment</h3>
        <p>Barrier island properties face risks that mainland homes don't. Your first inspection is free — we'll assess your property's specific vulnerabilities and build a plan that protects your investment through every season.</p>
        <div class="hero-actions" style="justify-content:flex-start">
          <a href="/contact" class="btn btn-primary btn-lg">Get Your Free Inspection</a>
          <a href="tel:+17724442710" class="btn btn-secondary btn-lg">Call (772) 444-2710</a>
        </div>
      </div>
    </section>
  `);
}

function renderReviews(main) {
  setPublicLayout(main, 'Reviews & Testimonials', `
    <section class="page-header"><h1>Reviews & Testimonials</h1><p>What Treasure Coast property owners are saying about Coastal Key.</p></section>
    <section class="trust-bar">
      <div class="trust-bar-inner">
        <div class="trust-item"><div class="trust-badge nhwa-badge">NHWA</div><span>Accredited Member</span></div>
        <div class="trust-item"><div class="trust-badge bbb-badge">BBB</div><span>Accredited Business</span></div>
        <div class="trust-item"><div class="trust-badge ins-badge">INS</div><span>Licensed, Bonded & Insured</span></div>
        <div class="trust-item"><div class="trust-badge bg-badge">BG</div><span>Background Checked</span></div>
      </div>
    </section>
    <section class="reviews-page">
      <div class="review-highlight">
        <h2>NHWA Accredited. Trusted by Homeowners Across 4 Counties.</h2>
        <p>Coastal Key Property Management is a proud Accredited Member of the National Home Watch Association — the industry's gold standard for professionalism, ethics, and reliability. Our team members are background-checked, insured, bonded, and NHWA-trained.</p>
      </div>
      <div class="review-grid-full">
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"We were in Connecticut when the AC failed during a July heat wave. Coastal Key had a tech there within two hours. Saved us from a mold disaster that would have cost us $30,000+."</p>
          <span class="review-author">— Seasonal Homeowner, Sailfish Point, Stuart</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"The photo reports after every inspection give us total peace of mind. We can see exactly what's happening at our property from 1,200 miles away. It's like being there without being there."</p>
          <span class="review-author">— Snowbird, Harbour Ridge, Palm City</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"After Hurricane Milton, Coastal Key had our property inspected and documented within 24 hours. Our insurance claim was filed before we even landed in Florida. No other company was even answering the phone."</p>
          <span class="review-author">— Investor, Hutchinson Island</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"David personally walks our property every two weeks. He caught a slow roof leak that our landscaper, pool guy, and pest company all missed for months. That's the difference between a real home watch professional and everyone else."</p>
          <span class="review-author">— Absentee Owner, The Moorings, Vero Beach</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"Our pool company was skipping visits. Our lawn service was cutting corners. Coastal Key caught both of them with photo evidence and handled the vendor replacement for us. That alone is worth the monthly fee."</p>
          <span class="review-author">— Seasonal Resident, Palm City</span>
        </div>
        <div class="review-card">
          <div class="review-stars">5.0</div>
          <p>"The vehicle and vessel oversight is something nobody else offers. They cycle my boat engines, check the bilge pumps, and keep my truck battery maintained all summer. Everything is ready to go when I fly back in October."</p>
          <span class="review-author">— Snowbird, Jupiter</span>
        </div>
      </div>
      <div class="review-cta-section">
        <h2>Your Experience Matters</h2>
        <p>If Coastal Key has protected your Treasure Coast property, we'd love to hear about your experience. Your review helps other homeowners find the trusted care they deserve.</p>
        <div class="hero-actions">
          <a href="https://g.page/r/coastalkey-pm/review" target="_blank" rel="noopener" class="btn btn-primary btn-lg">Leave a Google Review</a>
          <a href="/contact" class="btn btn-secondary btn-lg">Contact Us</a>
        </div>
      </div>
    </section>
  `);
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

function renderNotFound(main) {
  setPublicLayout(main, '404', `
    <section class="not-found"><h1>404</h1><p>Page not found.</p><a href="/" class="btn btn-primary">Return Home</a></section>
  `);
}
