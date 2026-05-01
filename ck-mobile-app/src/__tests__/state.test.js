import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { setState, getState, subscribe } from '../utils/state.js';

describe('State Management', () => {
  beforeEach(() => {
    setState('testKey', null);
  });

  it('stores and retrieves state values', () => {
    setState('testKey', 'hello');
    assert.equal(getState('testKey'), 'hello');
  });

  it('stores object values', () => {
    setState('testKey', { a: 1, b: 'two' });
    const val = getState('testKey');
    assert.equal(val.a, 1);
    assert.equal(val.b, 'two');
  });

  it('returns undefined for unset keys', () => {
    assert.equal(getState('nonexistent'), undefined);
  });

  it('notifies subscribers on state change', () => {
    let received = null;
    subscribe('testKey', (value) => { received = value; });
    setState('testKey', 42);
    assert.equal(received, 42);
  });

  it('supports multiple subscribers for same key', () => {
    let count = 0;
    subscribe('testKey', () => { count++; });
    subscribe('testKey', () => { count++; });
    setState('testKey', 'trigger');
    assert.equal(count, 2);
  });

  it('returns an unsubscribe function', () => {
    let callCount = 0;
    const unsub = subscribe('testKey', () => { callCount++; });
    setState('testKey', 'first');
    assert.equal(callCount, 1);
    unsub();
    setState('testKey', 'second');
    assert.equal(callCount, 1);
  });

  it('preserves default currentTab state', () => {
    assert.equal(getState('currentTab'), 'home');
  });
});
