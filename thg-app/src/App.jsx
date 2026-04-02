import React, { useState, useRef, useEffect, useCallback } from 'react';
import { goldBarTexture, goldBarTextureReverse, goldShadow, goldBorder, goldText } from './goldTextures.js';
import { AI_AGENTS, SERVICE_AREAS, MARKET_DATA_DEFAULTS } from './config/agents.js';
import { submitLead, logConversation, generateSessionId } from './services/airtable.js';

const NAVY = '#0a1628';
const NAVY_LIGHT = '#0f1d32';
const GOLD = '#d4a828';
const GOLD_LIGHT = '#f2d06b';
const WHITE = '#ffffff';
const GRAY = 'rgba(255,255,255,0.6)';
const ADMIN_PIN = '831929';

// ─── Error Boundary ──────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: GOLD_LIGHT }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>&#9888;</div>
          <h3 style={{ marginBottom: 8 }}>Something went wrong</h3>
          <button onClick={() => this.setState({ hasError: false })} style={{
            padding: '10px 24px', borderRadius: 8, border: goldBorder,
            background: 'rgba(212,168,40,0.15)', color: GOLD_LIGHT, cursor: 'pointer',
          }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Header ──────────────────────────────────────────────────────────
function Header({ onLogoTap }) {
  return (
    <div style={{ padding: '20px 20px 16px', textAlign: 'center', borderBottom: '1px solid rgba(212,168,40,0.2)' }}>
      <div onClick={onLogoTap} role="banner" style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px',
        background: 'conic-gradient(from 0deg, #c5961e, #f2d06b, #d4a828, #f5d980, #c5961e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 30px rgba(212,168,40,0.2)', cursor: 'pointer',
      }}>
        <span style={{ fontSize: 18, fontWeight: 900, color: NAVY, letterSpacing: 2 }}>THG</span>
      </div>
      <h1 style={{
        fontSize: 18, fontWeight: 700, letterSpacing: 3,
        background: goldText, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>TRACEY HUNTER GROUP</h1>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 4, marginTop: 4, fontWeight: 300 }}>RE/MAX OF STUART</p>
    </div>
  );
}

// ─── Quick Actions ───────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { label: 'Call', icon: '\u{1F4DE}', href: 'tel:7722103343' },
    { label: 'Text', icon: '\u{1F4AC}', href: 'sms:7722103343' },
    { label: 'Directions', icon: '\u{1F4CD}', href: 'https://maps.google.com/?q=819+SW+Federal+Hwy+Stuart+FL+34994' },
  ];
  return (
    <div style={{ display: 'flex', gap: 10, padding: '16px 20px 0' }}>
      {actions.map(a => (
        <a key={a.label} href={a.href} target={a.label === 'Directions' ? '_blank' : undefined}
          rel={a.label === 'Directions' ? 'noopener noreferrer' : undefined}
          aria-label={`${a.label} Tracey Hunter`}
          style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '12px 0', borderRadius: 12, textDecoration: 'none',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)',
            transition: 'background 0.2s',
          }}>
          <span style={{ fontSize: 20 }}>{a.icon}</span>
          <span style={{ fontSize: 11, color: GOLD_LIGHT, fontWeight: 600 }}>{a.label}</span>
        </a>
      ))}
    </div>
  );
}

// ─── Gold Agent Button ───────────────────────────────────────────────
function GoldAgentButton({ agent, texture, tilt, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button onClick={onClick} aria-label={`Chat with ${agent.name} - ${agent.role}`}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)} onPointerLeave={() => setPressed(false)}
      style={{
        width: '100%', padding: '28px 20px', borderRadius: 16, border: goldBorder,
        background: texture, boxShadow: goldShadow, cursor: 'pointer', position: 'relative', overflow: 'hidden',
        transform: pressed ? 'perspective(800px) rotateY(0deg) scale(0.97)' : `perspective(800px) rotateY(${tilt}deg)`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease', marginBottom: 16,
      }}>
      <div style={{ position: 'absolute', inset: 0, borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
        pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: NAVY, letterSpacing: 3,
          textShadow: '0 1px 0 rgba(255,255,255,0.3)' }}>{agent.name.toUpperCase()}</div>
        <div style={{ fontSize: 11, color: 'rgba(10,22,40,0.65)', marginTop: 3, fontWeight: 600 }}>{agent.role}</div>
        <div style={{ marginTop: 12 }}>
          <span style={{ display: 'inline-block', background: 'linear-gradient(180deg, #f2d06b, #d4a828)',
            color: NAVY, fontSize: 11, fontWeight: 700, padding: '4px 16px', borderRadius: 20,
            letterSpacing: 1, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>CLICK HERE</span>
        </div>
      </div>
    </button>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, padding: '12px 16px', alignSelf: 'flex-start',
      background: 'rgba(255,255,255,0.08)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%', background: GRAY,
          animation: `pulse 1.4s infinite ${i * 0.2}s`,
        }} />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100% { opacity:0.3; transform:scale(0.8); } 40% { opacity:1; transform:scale(1); } }`}</style>
    </div>
  );
}

// ─── Chat Interface ──────────────────────────────────────────────────
function ChatInterface({ agentKey, onClose }) {
  const agent = AI_AGENTS[agentKey];
  const [messages, setMessages] = useState([{ role: 'assistant', text: agent.greeting, time: new Date() }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => generateSessionId());
  const messagesEnd = useRef(null);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const sendMessage = useCallback(() => {
    if (!input.trim() || isTyping) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText, time: new Date() }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const response = agent.responses[Math.floor(Math.random() * agent.responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', text: response, time: new Date() }]);
      setIsTyping(false);
      logConversation({ agent: agent.name, userInput: userText, agentOutput: response, sessionId });
    }, 1200 + Math.random() * 800);
  }, [input, isTyping, agent, sessionId]);

  const fmt = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

  return (
    <div style={{ position: 'fixed', inset: 0, background: NAVY, zIndex: 1000,
      display: 'flex', flexDirection: 'column', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ padding: '16px 20px', background: agent.bg, display: 'flex', alignItems: 'center', gap: 12,
        borderBottom: '1px solid rgba(212,168,40,0.3)' }}>
        <button onClick={onClose} aria-label="Back" style={{
          background: 'none', border: 'none', color: WHITE, fontSize: 24, cursor: 'pointer', padding: '0 4px',
          minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center' }}>&larr;</button>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: agent.avatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: WHITE }}>{agent.name[0]}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: WHITE }}>{agent.name}</div>
          <div style={{ fontSize: 11, color: GOLD_LIGHT }}>{agent.subtitle}</div>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            maxWidth: '80%', padding: '12px 16px', borderRadius: 16,
            background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(212,168,40,0.2), rgba(212,168,40,0.1))' : 'rgba(255,255,255,0.08)',
            border: msg.role === 'user' ? goldBorder : '1px solid rgba(255,255,255,0.1)',
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{ color: msg.role === 'user' ? GOLD_LIGHT : WHITE, fontSize: 14, lineHeight: 1.5 }}>{msg.text}</div>
            <div style={{ fontSize: 10, color: GRAY, marginTop: 4, textAlign: 'right' }}>{fmt(msg.time)}</div>
          </div>
        ))}
        {isTyping && <TypingDots />}
        <div ref={messagesEnd} />
      </div>
      <div style={{ padding: '6px 16px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        AI-powered assistant. Responses are for informational purposes only and do not constitute professional real estate advice.
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8,
        borderTop: '1px solid rgba(212,168,40,0.2)', background: 'rgba(0,0,0,0.3)' }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Ask ${agent.name} anything...`} aria-label="Type your message"
          style={{ flex: 1, padding: '10px 16px', borderRadius: 24, border: goldBorder,
            background: 'rgba(255,255,255,0.06)', color: WHITE, fontSize: 14, outline: 'none' }} />
        <button onClick={sendMessage} aria-label="Send message" style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4a828, #f2d06b)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: NAVY, fontWeight: 700 }}>&uarr;</button>
      </div>
    </div>
  );
}

// ─── Mortgage Calculator (Hardened) ──────────────────────────────────
function MortgageCalculator() {
  const [price, setPrice] = useState('400000');
  const [down, setDown] = useState('20');
  const [rate, setRate] = useState('6.65');
  const [term, setTerm] = useState('30');

  const calculate = () => {
    const p = parseFloat(price), d = parseFloat(down), r = parseFloat(rate), t = parseFloat(term);
    if ([p, d, r, t].some(v => isNaN(v) || !isFinite(v))) return '0.00';
    if (p <= 0 || t <= 0) return '0.00';
    const clampedDown = Math.max(0, Math.min(100, d));
    const principal = p * (1 - clampedDown / 100);
    if (principal <= 0) return '0.00';
    const clampedRate = Math.max(0, Math.min(30, r));
    if (clampedRate === 0) return (principal / (t * 12)).toFixed(2);
    const mr = clampedRate / 100 / 12, n = t * 12;
    const monthly = principal * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
    return (isNaN(monthly) || !isFinite(monthly)) ? '0.00' : monthly.toFixed(2);
  };

  const iStyle = { width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid rgba(212,168,40,0.3)', background: 'rgba(255,255,255,0.06)',
    color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <ErrorBoundary>
      <div style={{ margin: '0 20px 20px', padding: 20, borderRadius: 16,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>Mortgage Calculator</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="mc-price" style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Home Price ($)</label>
            <input id="mc-price" type="number" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} style={iStyle} />
          </div>
          <div>
            <label htmlFor="mc-down" style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Down Payment (%)</label>
            <input id="mc-down" type="number" inputMode="decimal" value={down} onChange={e => setDown(e.target.value)} style={iStyle} />
          </div>
          <div>
            <label htmlFor="mc-rate" style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Interest Rate (%)</label>
            <input id="mc-rate" type="number" inputMode="decimal" value={rate} onChange={e => setRate(e.target.value)} style={iStyle} />
          </div>
          <div>
            <label htmlFor="mc-term" style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Term (Years)</label>
            <input id="mc-term" type="number" inputMode="decimal" value={term} onChange={e => setTerm(e.target.value)} style={iStyle} />
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 16, borderRadius: 12, textAlign: 'center',
          background: 'rgba(212,168,40,0.1)', border: goldBorder }}>
          <div style={{ fontSize: 12, color: GRAY }}>Estimated Monthly Payment</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: GOLD_LIGHT, marginTop: 4 }}>
            ${Number(calculate()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
          Estimates only. Does not include taxes, insurance, or HOA. Consult a licensed mortgage professional.
        </p>
      </div>
    </ErrorBoundary>
  );
}

// ─── Lead Capture Form ───────────────────────────────────────────────
function LeadCaptureForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: 'Buying', message: '' });
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name required (2+ characters)';
    const digits = form.phone.replace(/\D/g, '');
    if (!digits || digits.length < 10) errs.phone = 'Valid phone required (10+ digits)';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Invalid email format';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStatus('submitting');
    const result = await submitLead(form);
    setStatus(result.success ? 'success' : 'error');
  };

  const iStyle = { width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid rgba(212,168,40,0.3)', background: 'rgba(255,255,255,0.06)',
    color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  if (status === 'success') {
    return (
      <div style={{ margin: '0 20px 20px', padding: 32, borderRadius: 16, textAlign: 'center',
        background: 'rgba(212,168,40,0.08)', border: goldBorder }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>&#10003;</div>
        <h3 style={{ color: GOLD_LIGHT, fontSize: 18, marginBottom: 8 }}>Thank You!</h3>
        <p style={{ color: GRAY, fontSize: 13 }}>Tracey Hunter will be in touch within 24 hours.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <form onSubmit={handleSubmit} style={{ margin: '0 20px 20px', padding: 20, borderRadius: 16,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>Connect with Tracey</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <input placeholder="Full Name *" value={form.name} aria-label="Full Name"
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={{ ...iStyle, borderColor: errors.name ? '#ff6b6b' : 'rgba(212,168,40,0.3)' }} />
            {errors.name && <span style={{ fontSize: 11, color: '#ff6b6b' }}>{errors.name}</span>}
          </div>
          <div>
            <input placeholder="Phone Number *" value={form.phone} type="tel" aria-label="Phone Number"
              onChange={e => setForm({ ...form, phone: e.target.value })}
              style={{ ...iStyle, borderColor: errors.phone ? '#ff6b6b' : 'rgba(212,168,40,0.3)' }} />
            {errors.phone && <span style={{ fontSize: 11, color: '#ff6b6b' }}>{errors.phone}</span>}
          </div>
          <div>
            <input placeholder="Email (optional)" value={form.email} type="email" aria-label="Email"
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ ...iStyle, borderColor: errors.email ? '#ff6b6b' : 'rgba(212,168,40,0.3)' }} />
            {errors.email && <span style={{ fontSize: 11, color: '#ff6b6b' }}>{errors.email}</span>}
          </div>
          <select value={form.interest} aria-label="Interest type"
            onChange={e => setForm({ ...form, interest: e.target.value })} style={{ ...iStyle, appearance: 'none' }}>
            <option value="Buying">Interested in Buying</option>
            <option value="Selling">Interested in Selling</option>
            <option value="Investing">Interested in Investing</option>
            <option value="Renting">Interested in Renting</option>
            <option value="General">General Inquiry</option>
          </select>
          <textarea placeholder="Tell us more (optional)" value={form.message} aria-label="Message"
            onChange={e => setForm({ ...form, message: e.target.value })} rows={3} style={{ ...iStyle, resize: 'none' }} />
        </div>
        <button type="submit" disabled={status === 'submitting'} style={{
          width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 12, border: 'none',
          background: status === 'submitting' ? 'rgba(212,168,40,0.4)' : 'linear-gradient(135deg, #d4a828, #f2d06b)',
          color: NAVY, fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
        }}>{status === 'submitting' ? 'SENDING...' : 'SEND TO TRACEY'}</button>
        {status === 'error' && <p style={{ fontSize: 11, color: '#ff6b6b', marginTop: 8, textAlign: 'center' }}>
          Submission failed. Please try again or call (772) 210-3343 directly.</p>}
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
          By submitting, you consent to being contacted by Tracey Hunter Group regarding real estate services.
          Your information is kept confidential and never sold to third parties.
        </p>
      </form>
    </ErrorBoundary>
  );
}

// ─── Market Data Cards ───────────────────────────────────────────────
function MarketDataCards() {
  const cards = [
    { label: 'Fed Funds Rate', value: MARKET_DATA_DEFAULTS.fedRate, icon: '\u{1F3E6}' },
    { label: '30-Year Mortgage', value: MARKET_DATA_DEFAULTS.mortgage30yr, icon: '\u{1F4C8}' },
    { label: '15-Year Mortgage', value: MARKET_DATA_DEFAULTS.mortgage15yr, icon: '\u{1F4C9}' },
    { label: 'Median Home Price', value: MARKET_DATA_DEFAULTS.medianPrice, icon: '\u{1F3E0}' },
    { label: 'Avg Days on Market', value: MARKET_DATA_DEFAULTS.daysOnMarket, icon: '\u{1F4C5}' },
    { label: 'Inventory (Months)', value: MARKET_DATA_DEFAULTS.inventoryMonths, icon: '\u{1F4E6}' },
  ];
  return (
    <div style={{ margin: '0 20px 20px' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>Treasure Coast Market Data</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {cards.map(c => (
          <div key={c.label} style={{ padding: '12px 8px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.15)' }}>
            <div style={{ fontSize: 20 }}>{c.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginTop: 4 }}>{c.value}</div>
            <div style={{ fontSize: 9, color: GRAY, marginTop: 2 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Service Areas ───────────────────────────────────────────────────
function ServiceAreasList() {
  return (
    <div style={{ margin: '0 20px 20px' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>Service Areas</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SERVICE_AREAS.map(area => (
          <span key={area} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12,
            background: 'rgba(212,168,40,0.1)', border: '1px solid rgba(212,168,40,0.25)', color: GOLD_LIGHT }}>
            {area}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Admin Dashboard (Hidden, PIN-Protected) ────────────────────────
function AdminPinEntry({ onAuth }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) { onAuth(); }
    else { setError(true); setPin(''); }
  };
  return (
    <div style={{ padding: 40, textAlign: 'center', minHeight: '80vh', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>&#128274;</div>
      <h2 style={{ color: GOLD_LIGHT, fontSize: 20, marginBottom: 8 }}>Admin Access</h2>
      <p style={{ color: GRAY, fontSize: 12, marginBottom: 24 }}>Enter 6-digit PIN</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <input type="password" inputMode="numeric" maxLength={6} value={pin}
          onChange={e => { setPin(e.target.value.replace(/\D/g, '')); setError(false); }}
          aria-label="Admin PIN" autoFocus
          style={{ width: 180, padding: '14px 20px', borderRadius: 12, border: error ? '2px solid #ff6b6b' : goldBorder,
            background: 'rgba(255,255,255,0.06)', color: WHITE, fontSize: 24, textAlign: 'center',
            letterSpacing: 8, outline: 'none' }} />
        {error && <span style={{ fontSize: 12, color: '#ff6b6b' }}>Incorrect PIN</span>}
        <button type="submit" style={{ padding: '12px 40px', borderRadius: 12, border: 'none',
          background: 'linear-gradient(135deg, #d4a828, #f2d06b)', color: NAVY,
          fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>UNLOCK</button>
      </form>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const stats = [
    { label: 'Total Leads', value: '47', trend: '+5 this week' },
    { label: 'Active Chats', value: '12', trend: '3 today' },
    { label: 'Conversion', value: '18%', trend: '+2% vs last month' },
  ];
  const recentLeads = [
    { name: 'Sarah M.', type: 'Buying', time: '2h ago', status: 'New' },
    { name: 'James R.', type: 'Selling', time: '5h ago', status: 'Contacted' },
    { name: 'Maria L.', type: 'Investing', time: '1d ago', status: 'Qualified' },
    { name: 'Robert K.', type: 'Buying', time: '2d ago', status: 'Showing Scheduled' },
  ];

  return (
    <div style={{ padding: 20, paddingBottom: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: GOLD_LIGHT }}>Admin Dashboard</h2>
          <p style={{ fontSize: 11, color: GRAY }}>CEO View &mdash; Not visible to public</p>
        </div>
        <button onClick={onLogout} aria-label="Logout" style={{ padding: '8px 16px', borderRadius: 8,
          border: '1px solid rgba(255,100,100,0.3)', background: 'rgba(255,100,100,0.1)',
          color: '#ff6b6b', fontSize: 11, cursor: 'pointer' }}>Logout</button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ padding: 16, borderRadius: 12, textAlign: 'center',
            background: 'rgba(212,168,40,0.08)', border: goldBorder }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: GOLD_LIGHT }}>{s.value}</div>
            <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>{s.label}</div>
            <div style={{ fontSize: 9, color: 'rgba(76,175,80,0.8)', marginTop: 2 }}>{s.trend}</div>
          </div>
        ))}
      </div>

      {/* Recent Lead Activity */}
      <div style={{ padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(212,168,40,0.15)', marginBottom: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>Recent Lead Activity</h3>
        {recentLeads.map((lead, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: i < recentLeads.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            <div>
              <div style={{ fontSize: 13, color: WHITE, fontWeight: 600 }}>{lead.name}</div>
              <div style={{ fontSize: 10, color: GRAY }}>{lead.type} &middot; {lead.time}</div>
            </div>
            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 12,
              background: 'rgba(212,168,40,0.15)', color: GOLD_LIGHT }}>{lead.status}</span>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 4 }}>Quick Links</h3>
        {[
          { label: 'View Airtable Base', desc: 'THG Leads, AI Log, Market Data' },
          { label: 'Manage AI Agents', desc: 'Scout, Compass, Beacon, Harbor configs' },
          { label: 'Content Calendar', desc: 'Social media scheduling & approvals' },
          { label: 'Zapier Workflows', desc: '6 active automations' },
        ].map(link => (
          <div key={link.label} style={{ padding: 12, borderRadius: 10,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            cursor: 'pointer' }}>
            <div style={{ fontSize: 13, color: WHITE, fontWeight: 600 }}>{link.label}</div>
            <div style={{ fontSize: 10, color: GRAY }}>{link.desc}</div>
          </div>
        ))}
      </div>

      {/* Agent Performance */}
      <div style={{ marginTop: 20, padding: 16, borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,168,40,0.15)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>Agent Performance</h3>
        {Object.values(AI_AGENTS).map(agent => (
          <div key={agent.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: agent.avatar,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: WHITE, flexShrink: 0 }}>{agent.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: WHITE, fontWeight: 600 }}>{agent.name}</div>
              <div style={{ fontSize: 10, color: GRAY }}>{agent.subtitle}</div>
            </div>
            <div style={{ fontSize: 11, color: GOLD_LIGHT }}>Active</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ padding: '20px 20px 32px', textAlign: 'center', borderTop: '1px solid rgba(212,168,40,0.15)' }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GOLD_LIGHT }}>Tracey Hunter Group</div>
      <div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>RE/MAX of Stuart</div>
      <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>819 SW Federal Hwy, Ste 300, Stuart, FL 34994</div>
      <div style={{ fontSize: 10, color: GRAY, marginTop: 2 }}>(772) 210-3343 | tracey@traceyhuntergroup.com</div>
      <a href="https://traceyhuntergroup.com" target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 10, color: GOLD, marginTop: 2, display: 'inline-block' }}>traceyhuntergroup.com</a>
      <div style={{ marginTop: 20, padding: 16, borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>FAIR HOUSING DISCLOSURE</div>
        <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
          We are pledged to the letter and spirit of U.S. policy for the achievement of equal housing
          opportunity throughout the Nation. We encourage and support an affirmative advertising and
          marketing program in which there are no barriers to obtaining housing because of race, color,
          religion, sex, handicap, familial status, or national origin. Equal Housing Opportunity.
        </p>
      </div>
      <div style={{ marginTop: 12, fontSize: 9, color: 'rgba(255,255,255,0.25)' }}>
        &copy; {new Date().getFullYear()} Tracey Hunter Group. All rights reserved.
        <br />Powered by Coastal Key Treasure Coast Asset Management
      </div>
    </footer>
  );
}

// ─── Main App ────────────────────────────────────────────────────────
export default function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminAuth, setAdminAuth] = useState(false);
  const tapRef = useRef({ count: 0, timer: null });

  const handleLogoTap = useCallback(() => {
    const t = tapRef.current;
    t.count++;
    if (t.timer) clearTimeout(t.timer);
    if (t.count >= 5) {
      t.count = 0;
      setShowAdmin(true);
      return;
    }
    t.timer = setTimeout(() => { t.count = 0; }, 3000);
  }, []);

  const handleAdminLogout = useCallback(() => {
    setShowAdmin(false);
    setAdminAuth(false);
  }, []);

  // Admin views
  if (showAdmin && !adminAuth) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${NAVY}, ${NAVY_LIGHT})`,
        color: WHITE, maxWidth: 480, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(212,168,40,0.2)' }}>
          <button onClick={() => setShowAdmin(false)} aria-label="Back" style={{
            background: 'none', border: 'none', color: WHITE, fontSize: 24, cursor: 'pointer', padding: '0 8px 0 0',
            minWidth: 44, minHeight: 44 }}>&larr;</button>
          <h2 style={{ color: GOLD_LIGHT, fontSize: 16 }}>Admin Access</h2>
        </div>
        <AdminPinEntry onAuth={() => setAdminAuth(true)} />
      </div>
    );
  }

  if (showAdmin && adminAuth) {
    return (
      <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${NAVY}, ${NAVY_LIGHT})`,
        color: WHITE, maxWidth: 480, margin: '0 auto', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        <AdminDashboard onLogout={handleAdminLogout} />
      </div>
    );
  }

  // Chat view
  if (activeChat) {
    return <ChatInterface agentKey={activeChat} onClose={() => setActiveChat(null)} />;
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: '\u{1F3E0}' },
    { id: 'agents', label: 'AI Agents', icon: '\u{1F916}' },
    { id: 'tools', label: 'Tools', icon: '\u{1F4CA}' },
    { id: 'contact', label: 'Contact', icon: '\u{1F4DE}' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${NAVY}, ${NAVY_LIGHT})`,
      color: WHITE, maxWidth: 480, margin: '0 auto', position: 'relative', overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <Header onLogoTap={handleLogoTap} />

      <div style={{ paddingBottom: 70 }}>
        {activeTab === 'home' && (
          <ErrorBoundary>
            <QuickActions />
            <div style={{ padding: '16px 20px 0' }}>
              <GoldAgentButton agent={AI_AGENTS.scout} texture={goldBarTexture} tilt={3}
                onClick={() => setActiveChat('scout')} />
              <GoldAgentButton agent={AI_AGENTS.compass} texture={goldBarTextureReverse} tilt={-3}
                onClick={() => setActiveChat('compass')} />
            </div>
            <MarketDataCards />
            <ServiceAreasList />
            <Footer />
          </ErrorBoundary>
        )}

        {activeTab === 'agents' && (
          <ErrorBoundary>
            <div style={{ padding: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>AI Agent Fleet</h2>
              {Object.entries(AI_AGENTS).map(([key, agent]) => (
                <button key={key} onClick={() => setActiveChat(key)} aria-label={`Chat with ${agent.name}`}
                  style={{ width: '100%', padding: 16, borderRadius: 12, marginBottom: 12,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: agent.avatar,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, color: WHITE, flexShrink: 0 }}>{agent.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: GOLD_LIGHT }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: GRAY }}>{agent.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </ErrorBoundary>
        )}

        {activeTab === 'tools' && (
          <ErrorBoundary>
            <div style={{ padding: '20px 20px 0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>Real Estate Tools</h2>
            </div>
            <MortgageCalculator />
            <MarketDataCards />
          </ErrorBoundary>
        )}

        {activeTab === 'contact' && (
          <ErrorBoundary>
            <div style={{ padding: '20px 20px 0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>Get in Touch</h2>
            </div>
            <LeadCaptureForm />
            <div style={{ margin: '0 20px 20px', padding: 20, borderRadius: 16,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>
                Tracey Hunter, REALTOR&reg;</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="tel:7722103343" aria-label="Call Tracey Hunter"
                  style={{ color: WHITE, textDecoration: 'none', fontSize: 13 }}>(772) 210-3343</a>
                <a href="mailto:tracey@traceyhuntergroup.com" aria-label="Email Tracey Hunter"
                  style={{ color: WHITE, textDecoration: 'none', fontSize: 13 }}>tracey@traceyhuntergroup.com</a>
                <div style={{ fontSize: 12, color: GRAY }}>RE/MAX of Stuart<br />819 SW Federal Hwy, Ste 300<br />Stuart, FL 34994</div>
              </div>
            </div>
            <Footer />
          </ErrorBoundary>
        )}
      </div>

      {/* Bottom Tab Navigation */}
      <nav aria-label="Main navigation" style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480, display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 20px', background: `linear-gradient(180deg, transparent 0%, ${NAVY} 20%)`,
        backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(212,168,40,0.15)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            aria-label={tab.label} aria-current={activeTab === tab.id ? 'page' : undefined}
            style={{ background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              opacity: activeTab === tab.id ? 1 : 0.5, transition: 'opacity 0.2s',
              minWidth: 44, minHeight: 44, justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? GOLD_LIGHT : GRAY }}>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
