/**
 * Coastal Key Mobile App — Authentication
 */

import { setToken, clearToken, getToken } from './api.js';
import { setState } from './state.js';

export function isAuthenticated() {
  return !!getToken();
}

export function login(token) {
  setToken(token);
  setState('user', { authenticated: true });
}

export function logout() {
  clearToken();
  setState('user', null);
}
