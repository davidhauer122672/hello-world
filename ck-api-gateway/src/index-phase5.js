/**
 * CK API Gateway — Phase 5 Wrapper Entrypoint
 *
 * Composes the existing gateway (index.js) with Phase 5 dispatcher (franchise,
 * marketplace, retell-tuning) without modifying the 1457-line index.js file.
 *
 * Order of operations:
 *   1. CORS preflight → forward to gateway
 *   2. Public routes (/v1/health, /v1/leads/public) → forward to gateway
 *   3. Authenticated request + Phase 5 path → handle here
 *   4. Anything else → forward to gateway (gateway handles its own auth)
 *
 * Activated by setting `main = "src/index-phase5.js"` in wrangler.toml.
 */

import { authenticate } from './middleware/auth.js';
import { dispatchPhase5 } from './routes/phase5-router.js';
import gateway from './index.js';

const PUBLIC_PATHS = new Set(['/v1/health', '/v1/leads/public']);

export default {
  async fetch(request, env, ctx) {
    // CORS preflight — let the gateway handle (it already does)
    if (request.method === 'OPTIONS') {
      return gateway.fetch(request, env, ctx);
    }

    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Public routes — gateway handles without auth
    if (PUBLIC_PATHS.has(path)) {
      return gateway.fetch(request, env, ctx);
    }

    // Try Phase 5 with auth gate matching the gateway's policy
    const authError = authenticate(request, env);
    if (!authError) {
      const phase5 = await dispatchPhase5(path, method, request, env, ctx, url);
      if (phase5) return phase5;
    }

    // Fall through to existing gateway (it'll do its own auth/rate-limit)
    return gateway.fetch(request, env, ctx);
  },
};
