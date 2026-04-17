// ══════════════════════════════════════════════════════════════════════════
// Coastal Key Property Management — Production Reverse Proxy
//
// Serves the Manus-hosted website (coastalkey-awfopuqz.manus.space) on
// the coastalkey-pm.com domain via Cloudflare Pages Worker.
//
// Features:
//   - Full URL rewriting across HTML, CSS, JS responses
//   - Edge caching for static assets (images, fonts, CSS, JS)
//   - SEO canonical injection for search engine alignment
//   - Retry with backoff on upstream failures
//   - Custom robots.txt serving the canonical domain
//   - Graceful fallback on origin downtime
// ══════════════════════════════════════════════════════════════════════════

const MANUS_ORIGIN = 'https://coastalkey-awfopuqz.manus.space';
const MANUS_HOST = 'coastalkey-awfopuqz.manus.space';
const CANONICAL_DOMAIN = 'coastalkey-pm.com';
const CANONICAL_ORIGIN = 'https://coastalkey-pm.com';

// Cache TTLs (seconds)
const CACHE_HTML = 300;         // 5 min — pages refresh quickly
const CACHE_STATIC = 2592000;   // 30 days — versioned assets
const CACHE_FONT = 31536000;    // 1 year — fonts never change

// ── Helpers ──────────────────────────────────────────────────────────────

function isStaticAsset(pathname) {
  return /\.(css|js|png|jpg|jpeg|gif|svg|ico|webp|avif|woff|woff2|ttf|eot|otf|mp4|webm|pdf)(\?.*)?$/i.test(pathname);
}

function getCacheTTL(pathname, contentType) {
  if (/\.(woff2?|ttf|eot|otf)(\?.*)?$/i.test(pathname)) return CACHE_FONT;
  if (isStaticAsset(pathname)) return CACHE_STATIC;
  if (contentType?.includes('text/html')) return CACHE_HTML;
  return CACHE_HTML;
}

function isTextContent(contentType) {
  if (!contentType) return false;
  return contentType.includes('text/html')
    || contentType.includes('text/css')
    || contentType.includes('javascript')
    || contentType.includes('application/json')
    || contentType.includes('text/xml')
    || contentType.includes('application/xml');
}

function rewriteUrls(body, siteOrigin, siteHost) {
  return body
    .replaceAll(MANUS_ORIGIN, siteOrigin)
    .replaceAll(`//${MANUS_HOST}`, `//${siteHost}`)
    .replaceAll(`"${MANUS_HOST}"`, `"${siteHost}"`)
    .replaceAll(`'${MANUS_HOST}'`, `'${siteHost}'`)
    .replaceAll(MANUS_HOST, siteHost);
}

function injectSEO(html, pathname, siteOrigin) {
  const canonicalUrl = siteOrigin + pathname;
  const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
  const tailwindTag = `<link rel="stylesheet" href="/dist/tailwind-output.css">`;

  // Inject Tailwind CSS after any existing stylesheets (Phase 1 coexistence)
  if (!html.includes('tailwind-output.css')) {
    html = html.replace('</head>', `  ${tailwindTag}\n</head>`);
  }

  // Inject canonical if not already present
  if (!html.includes('rel="canonical"')) {
    html = html.replace('</head>', `  ${canonicalTag}\n</head>`);
  } else {
    // Replace any manus canonical with ours
    html = html.replace(
      /(<link\s+rel="canonical"\s+href=")([^"]*)(">)/i,
      `$1${canonicalUrl}$3`
    );
  }

  // Inject/fix og:url
  if (html.includes('og:url')) {
    html = html.replace(
      /(<meta\s+property="og:url"\s+content=")([^"]*)(">)/i,
      `$1${canonicalUrl}$3`
    );
  }

  return html;
}

async function fetchWithRetry(url, options, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && attempt < retries) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
        continue;
      }
      return response;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
    }
  }
}

// ── Custom Responses ─────────────────────────────────────────────────────

function robotsTxt() {
  return new Response(
    `User-agent: *\nAllow: /\nSitemap: ${CANONICAL_ORIGIN}/sitemap.xml\n\nHost: ${CANONICAL_DOMAIN}\n`,
    { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' } }
  );
}

function maintenancePage() {
  return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coastal Key Property Management</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0a1628 0%,#1a2942 50%,#0d1f3c 100%);color:#e2e8f0}
    .card{text-align:center;max-width:480px;padding:3rem 2rem;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;backdrop-filter:blur(20px)}
    .logo{font-size:2rem;font-weight:700;background:linear-gradient(135deg,#60a5fa,#38bdf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:.5rem}
    .sub{color:#94a3b8;font-size:.95rem;line-height:1.6;margin-bottom:1.5rem}
    .contact{font-size:.85rem;color:#64748b}
    .contact a{color:#60a5fa;text-decoration:none}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo">Coastal Key</div>
    <p class="sub">We're upgrading our systems to serve you better.<br>Please check back in a few minutes.</p>
    <p class="contact">Questions? <a href="mailto:david@coastalkey-pm.com">david@coastalkey-pm.com</a> | <a href="tel:+17722103343">(772) 210-3343</a></p>
  </div>
</body>
</html>`, {
    status: 503,
    headers: {
      'Content-Type': 'text/html;charset=UTF-8',
      'Retry-After': '120',
      'Cache-Control': 'no-store',
    },
  });
}

// ── Main Handler ─────────────────────────────────────────────────────────

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const siteOrigin = url.origin;
    const siteHost = url.hostname;

    // Serve our own robots.txt for the canonical domain
    if (url.pathname === '/robots.txt') return robotsTxt();

    // Build target URL
    const targetUrl = MANUS_ORIGIN + url.pathname + url.search;

    // Prepare forwarded headers
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('Host', MANUS_HOST);
    proxyHeaders.set('X-Forwarded-Host', siteHost);
    proxyHeaders.set('X-Forwarded-Proto', 'https');
    proxyHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');
    // Strip Cloudflare-specific headers that confuse upstream
    for (const h of ['cf-connecting-ip', 'cf-ray', 'cf-visitor', 'cf-ipcountry', 'cf-warp-tag-id']) {
      proxyHeaders.delete(h);
    }

    try {
      const response = await fetchWithRetry(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'manual',
      });

      const responseHeaders = new Headers(response.headers);

      // Rewrite Location headers for redirects
      const location = responseHeaders.get('location');
      if (location) {
        responseHeaders.set('location',
          location.replaceAll(MANUS_ORIGIN, siteOrigin).replaceAll(MANUS_HOST, siteHost)
        );
      }

      // Rewrite Set-Cookie domains
      const cookies = responseHeaders.getAll?.('set-cookie') || [];
      if (cookies.length) {
        responseHeaders.delete('set-cookie');
        for (const cookie of cookies) {
          responseHeaders.append('set-cookie',
            cookie.replaceAll(MANUS_HOST, siteHost)
          );
        }
      }

      // Strip upstream security headers we'll replace
      responseHeaders.delete('x-frame-options');
      responseHeaders.delete('content-security-policy');
      responseHeaders.delete('strict-transport-security');

      // Set production security headers
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      responseHeaders.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      responseHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

      // Set cache control
      const contentType = responseHeaders.get('content-type') || '';
      const ttl = getCacheTTL(url.pathname, contentType);
      if (isStaticAsset(url.pathname)) {
        responseHeaders.set('Cache-Control', `public, max-age=${ttl}, immutable`);
      } else if (contentType.includes('text/html')) {
        responseHeaders.set('Cache-Control', `public, max-age=${CACHE_HTML}, s-maxage=${CACHE_HTML}, stale-while-revalidate=60`);
      }

      // For text content, rewrite URLs
      if (isTextContent(contentType)) {
        let body = await response.text();
        body = rewriteUrls(body, siteOrigin, siteHost);

        // Inject SEO for HTML
        if (contentType.includes('text/html')) {
          body = injectSEO(body, url.pathname, siteOrigin);
        }

        // Correct content-length after rewriting
        responseHeaders.delete('content-length');
        responseHeaders.delete('content-encoding');

        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // Binary assets pass through
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (err) {
      return maintenancePage();
    }
  },
};
