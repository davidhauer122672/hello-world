/**
 * Coastal Key Mobile App — State Management
 * Lightweight reactive state store for client-side data.
 */

const store = {};
const listeners = new Map();

export function setState(key, value) {
  store[key] = value;
  if (listeners.has(key)) {
    listeners.get(key).forEach((fn) => fn(value));
  }
}

export function getState(key) {
  return store[key];
}

export function subscribe(key, callback) {
  if (!listeners.has(key)) listeners.set(key, new Set());
  listeners.get(key).add(callback);
  return () => listeners.get(key).delete(callback);
}

// Pre-populate with defaults
setState('currentTab', 'home');
setState('notifications', []);
setState('user', null);
