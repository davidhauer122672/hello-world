// ══════════════════════════════════════════════════════════════════════════
// Coastal Key Website — Reverse Proxy to Manus Site
//
// Proxies all requests from coastalkey-pm.com to the Manus-hosted website
// while keeping the coastalkey-pm.com domain in the browser URL bar.
// ══════════════════════════════════════════════════════════════════════════

const MANUS_ORIGIN = 'https://coastalkey-awfopuqz.manus.space';
const MANUS_HOST = 'coastalkey-awfopuqz.manus.space';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const siteOrigin = url.origin;
    const siteHost = url.hostname;

    // Build target URL on Manus
    const targetUrl = MANUS_ORIGIN + url.pathname + url.search;

    // Forward headers, replacing host
    const proxyHeaders = new Headers(request.headers);
    proxyHeaders.set('Host', MANUS_HOST);
    proxyHeaders.set('X-Forwarded-Host', siteHost);
    proxyHeaders.set('X-Forwarded-Proto', 'https');
    proxyHeaders.delete('cf-connecting-ip');
    proxyHeaders.delete('cf-ray');
    proxyHeaders.delete('cf-visitor');
    proxyHeaders.delete('cf-ipcountry');

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        redirect: 'manual',
      });

      const responseHeaders = new Headers(response.headers);

      // Rewrite redirect locations to keep users on our domain
      const location = responseHeaders.get('location');
      if (location) {
        responseHeaders.set(
          'location',
          location
            .replace(MANUS_ORIGIN, siteOrigin)
            .replace(`//${MANUS_HOST}`, `//${siteHost}`)
        );
      }

      // Remove headers that conflict with our domain
      responseHeaders.delete('x-frame-options');
      responseHeaders.delete('content-security-policy');

      // Set our own security headers
      responseHeaders.set('X-Content-Type-Options', 'nosniff');
      responseHeaders.set('Referrer-Policy', 'strict-origin-when-cross-origin');

      const contentType = responseHeaders.get('content-type') || '';

      // For HTML responses, rewrite Manus URLs to our domain
      if (contentType.includes('text/html')) {
        let body = await response.text();
        body = body.replaceAll(MANUS_ORIGIN, siteOrigin);
        body = body.replaceAll(`//${MANUS_HOST}`, `//${siteHost}`);
        body = body.replaceAll(MANUS_HOST, siteHost);

        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // For CSS responses, rewrite any absolute Manus URLs
      if (contentType.includes('text/css')) {
        let body = await response.text();
        body = body.replaceAll(MANUS_ORIGIN, siteOrigin);
        body = body.replaceAll(MANUS_HOST, siteHost);

        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // For JS responses, rewrite any absolute Manus URLs
      if (contentType.includes('javascript')) {
        let body = await response.text();
        body = body.replaceAll(MANUS_ORIGIN, siteOrigin);
        body = body.replaceAll(MANUS_HOST, siteHost);

        return new Response(body, {
          status: response.status,
          statusText: response.statusText,
          headers: responseHeaders,
        });
      }

      // All other content types (images, fonts, etc.) pass through as-is
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      // If Manus origin is unreachable, show a maintenance page
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coastal Key Property Management</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0a1628; color: #e2e8f0; }
    .container { text-align: center; max-width: 500px; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Coastal Key Property Management</h1>
    <p>We're performing scheduled maintenance. Please check back shortly.</p>
  </div>
</body>
</html>`,
        {
          status: 503,
          headers: { 'Content-Type': 'text/html;charset=UTF-8', 'Retry-After': '60' },
        }
      );
    }
  },
};
