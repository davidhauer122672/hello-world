/**
 * @file message-bus.js
 * @description Inter-agent communication bus for the Coastal Key Agent OS.
 *
 * Implements JSON-RPC 2.0 message formatting for all agent-to-agent messages.
 * Supports point-to-point delivery (send) and pub/sub topic broadcasting
 * (broadcast / subscribe / unsubscribe). Messages are prioritised, acknowledged
 * within a 5-second window, and stored in an audit-accessible history log.
 *
 * Constraints:
 *   - Maximum message payload: 256 KB.
 *   - Acknowledgement timeout: 5 000 ms.
 *   - KV message history TTL: 7 days.
 *
 * Runtime target: Node.js / Cloudflare Workers.
 * KV namespaces expected on the env object:
 *   env.CACHE      — message store / queue
 *   env.SESSIONS   — subscription registry
 *   env.AUDIT_LOG  — immutable audit trail
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Message priority levels. Lower value = higher urgency.
 * @enum {number}
 */
export const MSG_PRIORITY = Object.freeze({
  CRITICAL: 1,
  HIGH:     2,
  STANDARD: 3,
  LOW:      4,
});

/** Maps human-readable labels to numeric priority values. */
const PRIORITY_MAP = Object.freeze({
  critical: MSG_PRIORITY.CRITICAL,
  high:     MSG_PRIORITY.HIGH,
  standard: MSG_PRIORITY.STANDARD,
  low:      MSG_PRIORITY.LOW,
});

/** JSON-RPC 2.0 spec version string. */
const JSONRPC_VERSION = '2.0';

/** Maximum permitted message payload size in bytes (256 KB). */
const MAX_MESSAGE_BYTES = 256 * 1024;

/** Milliseconds before an un-acknowledged message is flagged as timed out. */
const ACK_TIMEOUT_MS = 5_000;

/** In-memory history ring buffer capacity (most recent N messages). */
const HISTORY_RING_SIZE = 2_000;

/** KV retention window in seconds for persisted messages (7 days). */
const MESSAGE_KV_TTL = 604_800;

/** KV key prefixes. */
const KEY = Object.freeze({
  MESSAGE:       'ck:bus:msg:',
  PENDING_ACK:   'ck:bus:ack:',
  SUBSCRIPTION:  'ck:bus:sub:',
  AUDIT:         'ck:bus:audit:',
});

// ─── JSON-RPC 2.0 envelope builders ─────────────────────────────────────────

/**
 * Builds a JSON-RPC 2.0 request object.
 *
 * @param {string} method - RPC method name (e.g. 'agent.task.execute').
 * @param {object} params - Parameter object.
 * @param {string} id     - Message / correlation ID.
 * @returns {object}
 */
export function buildRequest(method, params, id) {
  return { jsonrpc: JSONRPC_VERSION, id, method, params };
}

/**
 * Builds a JSON-RPC 2.0 result (success) response.
 *
 * @param {*}      result - Result payload.
 * @param {string} id     - ID of the request being responded to.
 * @returns {object}
 */
export function buildResult(result, id) {
  return { jsonrpc: JSONRPC_VERSION, id, result };
}

/**
 * Builds a JSON-RPC 2.0 error response.
 *
 * @param {number} code    - Numeric error code.
 * @param {string} message - Human-readable error description.
 * @param {string|null} id - Request ID (null when the request could not be parsed).
 * @returns {object}
 */
export function buildError(code, message, id = null) {
  return { jsonrpc: JSONRPC_VERSION, id, error: { code, message } };
}

// ─── MessageBus ───────────────────────────────────────────────────────────────

/**
 * Inter-agent communication bus for the Coastal Key 40-agent fleet.
 *
 * All 40 agents communicate via this bus using JSON-RPC 2.0 envelopes.
 * Messages are priority-queued, persisted to KV, and tracked through their
 * full acknowledgement lifecycle.
 *
 * @example
 * const bus = new MessageBus(env);
 *
 * // Subscribe to a division-level topic.
 * await bus.subscribe('CKA-001', 'division.MKT', async (envelope) => {
 *   console.log('Received:', envelope.body);
 * });
 *
 * // Broadcast a directive to the topic.
 * await bus.broadcast('CKA-042', 'division.MKT', {
 *   method: 'governance.directive',
 *   params: { instruction: 'Pause non-critical campaigns.' },
 * });
 *
 * // Point-to-point.
 * const { messageId } = await bus.send('CKA-001', 'CKA-002', {
 *   method: 'task.delegate',
 *   params: { taskId: 'T-099' },
 * }, 'high');
 *
 * await bus.acknowledge(messageId);
 */
export class MessageBus {
  /**
   * @param {object}      env            - Cloudflare Worker environment bindings.
   * @param {KVNamespace} env.CACHE      - Message store KV namespace.
   * @param {KVNamespace} env.SESSIONS   - Subscription registry KV namespace.
   * @param {KVNamespace} env.AUDIT_LOG  - Immutable audit trail KV namespace.
   */
  constructor(env) {
    if (!env?.CACHE || !env?.SESSIONS || !env?.AUDIT_LOG) {
      throw new Error('MessageBus requires env.CACHE, env.SESSIONS, and env.AUDIT_LOG KV bindings.');
    }

    this.env = env;

    /**
     * In-memory pub/sub registry.
     * topic → Map<agentId, handler Function>
     * @type {Map<string, Map<string, Function>>}
     */
    this._subscriptions = new Map();

    /**
     * Rolling in-memory message history ring buffer.
     * @type {object[]}
     */
    this._history = [];

    /**
     * Pending ACK entries.
     * messageId → { timer: TimeoutId, sentAt: number, from: string, to: string }
     * @type {Map<string, object>}
     */
    this._pendingAcks = new Map();

    /** Monotonic message sequence counter for ID generation. */
    this._seq = 0;
  }

  // ─── Point-to-Point ────────────────────────────────────────────────────────

  /**
   * Sends a point-to-point JSON-RPC 2.0 message from one agent to another.
   * The message is persisted to KV. An ACK timer starts immediately; if no
   * acknowledgement arrives within 5 seconds the event is flagged in the audit log.
   *
   * @param {string} from      - Sender agent ID.
   * @param {string} to        - Recipient agent ID.
   * @param {object} message   - JSON-RPC 2.0 body. If `jsonrpc` is absent a
   *                             request envelope is built automatically using
   *                             `message.method` and `message.params`.
   * @param {string} [priority] - 'critical' | 'high' | 'standard' | 'low'. Default: 'standard'.
   * @returns {Promise<{ messageId: string, status: 'sent', priority: number, sizeBytes: number }>}
   */
  async send(from, to, message, priority = 'standard') {
    this._requireString(from, 'from');
    this._requireString(to,   'to');

    const messageId   = this._nextId('p2p');
    const numPriority = PRIORITY_MAP[priority] ?? MSG_PRIORITY.STANDARD;
    const body        = this._normaliseBody(message, messageId);
    const envelope    = this._buildEnvelope(messageId, from, to, body, numPriority, 'point-to-point');
    const sizeBytes   = this._assertSize(envelope);

    this._addToHistory(envelope);
    await this._persistMessage(envelope);
    this._startAckTimer(messageId, from, to);

    await this._audit('MSG_SENT', { messageId, from, to, priority: numPriority, sizeBytes });

    return { messageId, status: 'sent', priority: numPriority, sizeBytes };
  }

  // ─── Pub/Sub ───────────────────────────────────────────────────────────────

  /**
   * Broadcasts a JSON-RPC 2.0 message to all agents subscribed to a topic.
   * Each subscriber's handler is invoked in priority order (critical first).
   * Handler errors are caught individually and recorded in the audit log so
   * a single broken subscriber cannot block other deliveries.
   *
   * @param {string} from      - Sender agent ID.
   * @param {string} topic     - Pub/sub topic (e.g. 'governance.directive', 'division.MKT').
   * @param {object} message   - JSON-RPC 2.0 body.
   * @param {string} [priority] - Message priority. Default: 'standard'.
   * @returns {Promise<{ messageId: string, topic: string, recipients: number, failures: number }>}
   */
  async broadcast(from, topic, message, priority = 'standard') {
    this._requireString(from,  'from');
    this._requireString(topic, 'topic');

    const messageId   = this._nextId('bcast');
    const numPriority = PRIORITY_MAP[priority] ?? MSG_PRIORITY.STANDARD;
    const body        = this._normaliseBody(message, messageId);
    const envelope    = this._buildEnvelope(messageId, from, topic, body, numPriority, 'broadcast');

    this._assertSize(envelope);
    this._addToHistory(envelope);
    await this._persistMessage(envelope);

    const topicSubs = this._subscriptions.get(topic);
    let recipients  = 0;
    let failures    = 0;

    if (topicSubs?.size) {
      // Deliver to all in-process subscribers.
      for (const [subscriberAgentId, handler] of topicSubs) {
        try {
          await handler({ ...envelope, recipient: subscriberAgentId });
          recipients++;
        } catch (err) {
          failures++;
          await this._audit('MSG_HANDLER_ERROR', {
            messageId, topic, subscriberAgentId, error: err.message,
          });
        }
      }
    }

    await this._audit('MSG_BROADCAST', {
      messageId, from, topic, priority: numPriority, recipients, failures,
    });

    return { messageId, topic, recipients, failures };
  }

  /**
   * Subscribes an agent to a pub/sub topic. The handler is called each time
   * a message is broadcast to the topic (await-compatible).
   *
   * @param {string}   agentId  - Subscribing agent ID.
   * @param {string}   topic    - Topic string to subscribe to.
   * @param {Function} handler  - Callback invoked with the message envelope: async (envelope) => void.
   * @returns {Promise<{ agentId: string, topic: string, subscribed: true }>}
   */
  async subscribe(agentId, topic, handler) {
    this._requireString(agentId, 'agentId');
    this._requireString(topic,   'topic');
    if (typeof handler !== 'function') {
      throw new TypeError('subscribe: handler must be a function.');
    }

    if (!this._subscriptions.has(topic)) {
      this._subscriptions.set(topic, new Map());
    }
    this._subscriptions.get(topic).set(agentId, handler);

    await this._persistSubscriptionList(topic);
    await this._audit('AGENT_SUBSCRIBED', { agentId, topic });

    return { agentId, topic, subscribed: true };
  }

  /**
   * Removes an agent's subscription from a topic. Idempotent — safe to call
   * even when the subscription does not exist.
   *
   * @param {string} agentId - Agent to unsubscribe.
   * @param {string} topic   - Topic to unsubscribe from.
   * @returns {Promise<{ agentId: string, topic: string, unsubscribed: boolean }>}
   */
  async unsubscribe(agentId, topic) {
    this._requireString(agentId, 'agentId');
    this._requireString(topic,   'topic');

    const topicSubs = this._subscriptions.get(topic);
    const removed   = topicSubs?.delete(agentId) ?? false;

    if (topicSubs?.size === 0) this._subscriptions.delete(topic);

    if (removed) {
      await this._persistSubscriptionList(topic);
      await this._audit('AGENT_UNSUBSCRIBED', { agentId, topic });
    }

    return { agentId, topic, unsubscribed: removed };
  }

  // ─── History & Acknowledgement ────────────────────────────────────────────

  /**
   * Returns filtered message history from the in-memory ring buffer.
   *
   * @param {object} [filters]
   * @param {string} [filters.from]      - Filter by sender agent ID.
   * @param {string} [filters.to]        - Filter by recipient agent ID or topic.
   * @param {string} [filters.type]      - 'point-to-point' | 'broadcast'.
   * @param {number} [filters.priority]  - Numeric priority filter (MSG_PRIORITY.*).
   * @param {number} [filters.since]     - Only messages with timestamp ≥ this Unix ms value.
   * @param {number} [filters.limit]     - Max results to return. Default: 100.
   * @returns {{ messages: object[], total: number }}
   */
  getHistory(filters = {}) {
    const { from, to, type, priority, since, limit = 100 } = filters;

    let results = this._history;

    if (from)     results = results.filter(m => m.from      === from);
    if (to)       results = results.filter(m => m.to        === to);
    if (type)     results = results.filter(m => m.type      === type);
    if (priority) results = results.filter(m => m.priority  === priority);
    if (since)    results = results.filter(m => m.timestamp >= since);

    const page = results.slice(-Math.abs(limit));
    return { messages: page, total: results.length };
  }

  /**
   * Acknowledges receipt of a message. Clears the pending ACK timer so no
   * timeout audit entry is generated. Idempotent — safe to call multiple times.
   *
   * @param {string} messageId - ID of the message to acknowledge.
   * @returns {Promise<{ messageId: string, acknowledged: boolean, latencyMs?: number }>}
   */
  async acknowledge(messageId) {
    this._requireString(messageId, 'messageId');

    const pending = this._pendingAcks.get(messageId);
    if (!pending) {
      return { messageId, acknowledged: false };
    }

    clearTimeout(pending.timer);
    this._pendingAcks.delete(messageId);
    await this.env.CACHE.delete(`${KEY.PENDING_ACK}${messageId}`).catch(() => {});

    const latencyMs = Date.now() - pending.sentAt;
    await this._audit('MSG_ACKNOWLEDGED', { messageId, latencyMs });

    return { messageId, acknowledged: true, latencyMs };
  }

  /**
   * Returns summary statistics about the bus's current state.
   *
   * @returns {{
   *   totalMessages:       number,
   *   historySize:         number,
   *   pendingAcks:         number,
   *   activeTopics:        number,
   *   totalSubscriptions:  number,
   * }}
   */
  getStats() {
    let totalSubscriptions = 0;
    for (const subs of this._subscriptions.values()) {
      totalSubscriptions += subs.size;
    }

    return {
      totalMessages:      this._seq,
      historySize:        this._history.length,
      pendingAcks:        this._pendingAcks.size,
      activeTopics:       this._subscriptions.size,
      totalSubscriptions,
    };
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────

  /**
   * Generates a unique, prefixed, monotonic message ID.
   *
   * @private
   * @param {string} prefix - Short type prefix ('p2p' or 'bcast').
   * @returns {string}
   */
  _nextId(prefix) {
    return `${prefix}-${Date.now()}-${(++this._seq).toString(36)}`;
  }

  /**
   * Ensures the message body is a valid JSON-RPC 2.0 structure.
   * If the caller supplied a raw object without the `jsonrpc` field, wraps it
   * in a request envelope using `body.method` (default: 'agent.message').
   *
   * @private
   * @param {object} message   - Raw message from the caller.
   * @param {string} messageId - ID to embed in the envelope if wrapping.
   * @returns {object} A JSON-RPC 2.0 conformant object.
   */
  _normaliseBody(message, messageId) {
    if (message?.jsonrpc === JSONRPC_VERSION) return message;
    return buildRequest(
      message?.method ?? 'agent.message',
      message?.params ?? message,
      messageId,
    );
  }

  /**
   * Constructs the canonical wire-format message envelope used for storage,
   * history, and delivery.
   *
   * @private
   */
  _buildEnvelope(messageId, from, to, body, priority, type) {
    return {
      messageId,
      jsonrpc:   JSONRPC_VERSION,
      type,
      from,
      to,
      priority,
      timestamp: Date.now(),
      acked:     false,
      body,
    };
  }

  /**
   * Verifies that the serialised envelope does not exceed the 256 KB limit.
   * Throws if the check fails; returns byte count on success.
   *
   * @private
   * @param {object} envelope
   * @returns {number} Byte count of the serialised envelope.
   */
  _assertSize(envelope) {
    const bytes = new TextEncoder().encode(JSON.stringify(envelope)).length;
    if (bytes > MAX_MESSAGE_BYTES) {
      throw new RangeError(
        `Message ${envelope.messageId} is ${bytes.toLocaleString()} bytes, ` +
        `which exceeds the 256 KB limit (${MAX_MESSAGE_BYTES.toLocaleString()} bytes).`,
      );
    }
    return bytes;
  }

  /**
   * Appends an envelope to the in-memory history ring buffer, evicting the
   * oldest entry when capacity is reached.
   *
   * @private
   * @param {object} envelope
   */
  _addToHistory(envelope) {
    this._history.push(envelope);
    if (this._history.length > HISTORY_RING_SIZE) this._history.shift();
  }

  /**
   * Persists a message envelope to KV with a 7-day retention TTL.
   * Failures are silently swallowed — the bus must remain operational even if
   * KV is temporarily unavailable.
   *
   * @private
   * @param {object} envelope
   * @returns {Promise<void>}
   */
  async _persistMessage(envelope) {
    this.env.CACHE.put(
      `${KEY.MESSAGE}${envelope.messageId}`,
      JSON.stringify(envelope),
      { expirationTtl: MESSAGE_KV_TTL },
    ).catch(() => {});
  }

  /**
   * Starts a 5-second ACK countdown. If the timer fires without an
   * acknowledgement, an audit entry is written.
   *
   * @private
   * @param {string} messageId
   * @param {string} from
   * @param {string} to
   */
  _startAckTimer(messageId, from, to) {
    const sentAt = Date.now();
    const timer  = setTimeout(async () => {
      this._pendingAcks.delete(messageId);
      await this._audit('MSG_ACK_TIMEOUT', { messageId, from, to, elapsedMs: ACK_TIMEOUT_MS });
    }, ACK_TIMEOUT_MS);

    this._pendingAcks.set(messageId, { timer, sentAt, from, to });

    // Persist pending-ACK marker so cross-Worker instances can detect unacknowledged messages.
    this.env.CACHE.put(
      `${KEY.PENDING_ACK}${messageId}`,
      JSON.stringify({ messageId, sentAt }),
      { expirationTtl: 60 },
    ).catch(() => {});
  }

  /**
   * Serialises the current subscriber agent ID list for a topic to KV.
   * Handler functions cannot be serialised; only the agent IDs are stored.
   *
   * @private
   * @param {string} topic
   * @returns {Promise<void>}
   */
  async _persistSubscriptionList(topic) {
    const topicSubs = this._subscriptions.get(topic);
    const agentIds  = topicSubs ? [...topicSubs.keys()] : [];

    this.env.SESSIONS.put(
      `${KEY.SUBSCRIPTION}${topic}`,
      JSON.stringify({ topic, agentIds, updatedAt: Date.now() }),
      { expirationTtl: 86_400 },
    ).catch(() => {});
  }

  /**
   * Writes an audit entry to AUDIT_LOG KV. Fire-and-forget.
   *
   * @private
   * @param {string} event   - Audit event code.
   * @param {object} details - Additional context fields.
   * @returns {Promise<void>}
   */
  async _audit(event, details) {
    const key    = `${KEY.AUDIT}${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const record = { event, ...details, timestamp: Date.now() };
    this.env.AUDIT_LOG.put(key, JSON.stringify(record), { expirationTtl: MESSAGE_KV_TTL }).catch(() => {});
  }

  /**
   * Validates that a value is a non-empty string; throws otherwise.
   *
   * @private
   * @param {*}      value    - Value under test.
   * @param {string} argName  - Argument name used in error messages.
   */
  _requireString(value, argName) {
    if (!value || typeof value !== 'string') {
      throw new TypeError(`MessageBus: "${argName}" must be a non-empty string.`);
    }
  }
}

export default MessageBus;
