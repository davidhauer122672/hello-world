const { Router } = require('express');
const crypto = require('crypto');

const router = Router();

// ── In-memory session store with TTL ─────────────────────────────────────
const sessions = new Map();
const SESSION_TTL = 4 * 60 * 60 * 1000; // 4 hours

// Cleanup expired sessions every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) sessions.delete(token);
  }
}, 15 * 60 * 1000).unref();

// ── POST /api/auth/login ─────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { code } = req.body || {};
  const validCode = process.env.TEAM_ACCESS_CODE;

  if (!validCode) {
    return res.status(500).json({ error: 'Server misconfiguration: team access code not set' });
  }

  if (!code || typeof code !== 'string' || !safeCompare(code, validCode)) {
    return res.status(401).json({ error: 'Invalid access code' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessions.set(token, {
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
  });

  res.json({ token, expiresIn: SESSION_TTL });
});

// ── POST /api/auth/logout ────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  const token = extractBearerToken(req);
  if (token) sessions.delete(token);
  res.json({ success: true });
});

// ── GET /api/auth/validate ───────────────────────────────────────────────
router.get('/validate', (req, res) => {
  const token = extractBearerToken(req);
  if (token && validateSession(token)) {
    return res.json({ valid: true });
  }
  res.status(401).json({ valid: false });
});

// ── Helpers ──────────────────────────────────────────────────────────────

function validateSession(token) {
  const session = sessions.get(token);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return false;
  }
  return true;
}

function extractBearerToken(req) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

/**
 * Timing-safe string comparison using Node.js crypto.
 * Compares HMAC digests to handle variable-length inputs safely.
 */
function safeCompare(a, b) {
  const key = crypto.randomBytes(32);
  const hmacA = crypto.createHmac('sha256', key).update(a).digest();
  const hmacB = crypto.createHmac('sha256', key).update(b).digest();
  return crypto.timingSafeEqual(hmacA, hmacB);
}

module.exports = { router, validateSession, extractBearerToken, safeCompare };
