// Rate limiter store
const hits = new Map();

function rateLimiter(max = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!hits.has(key)) hits.set(key, []);
    const timestamps = hits.get(key).filter(t => t > now - windowMs);

    if (timestamps.length >= max) {
      res.status(429).json({ error: 'Too many requests. Try again later.' });
      return;
    }

    timestamps.push(now);
    hits.set(key, timestamps);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - timestamps.length));
    next();
  };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 15 * 60 * 1000;
  for (const [key, timestamps] of hits.entries()) {
    const active = timestamps.filter(t => t > cutoff);
    if (active.length === 0) hits.delete(key);
    else hits.set(key, active);
  }
}, 5 * 60 * 1000).unref();

function securityHeaders() {
  return (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.removeHeader('X-Powered-By');
    next();
  };
}

function cors() {
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
    : [];
  return (req, res, next) => {
    const origin = req.get('origin');
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    if (req.method === 'OPTIONS') return res.status(204).end();
    next();
  };
}

module.exports = { rateLimiter, securityHeaders, cors };
