/**
 * Authentication utility for the Team Portal section.
 *
 * Stores session in localStorage.
 * Portal routes (/portal/*) require authentication.
 * Public routes (/, /services, /about, etc.) are open.
 */

const AUTH_KEY = 'ck_portal_session';
const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours

export function initAuth() {
  const saved = localStorage.getItem(AUTH_KEY);
  if (saved) {
    try {
      const session = JSON.parse(saved);
      // Expire sessions older than 8 hours
      if (session.loginAt && (Date.now() - new Date(session.loginAt).getTime()) > SESSION_MAX_AGE_MS) {
        localStorage.removeItem(AUTH_KEY);
        return;
      }
      window.__ckSession = session;
    } catch {
      localStorage.removeItem(AUTH_KEY);
    }
  }
}

export function isAuthenticated() {
  return !!window.__ckSession?.token;
}

export function getSession() {
  return window.__ckSession || null;
}

export function login(apiUrl, token) {
  const session = {
    apiUrl: apiUrl.replace(/\/+$/, ''),
    token,
    loginAt: new Date().toISOString(),
  };
  window.__ckSession = session;
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  window.__ckSession = null;
  localStorage.removeItem(AUTH_KEY);
}

/**
 * Make an authenticated API call to the CK Gateway.
 */
export async function apiCall(path, options = {}) {
  const session = getSession();
  if (!session) throw new Error('Not authenticated');

  const url = `${session.apiUrl}${path}`;
  const headers = {
    'Authorization': `Bearer ${session.token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `API error ${res.status}`);
  }

  return data;
}
