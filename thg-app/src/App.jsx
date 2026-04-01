import React, { useState, useRef, useEffect } from 'react';
import { goldBarTexture, goldBarTextureReverse, goldShadow, goldBorder, goldText } from './goldTextures.js';
import { scoutBackground, compassBackground, scoutAvatar, compassAvatar } from './advisorImages.js';

// ─── Constants ───────────────────────────────────────────────────────
const NAVY = '#0a1628';
const NAVY_LIGHT = '#0f1d32';
const GOLD = '#d4a828';
const GOLD_LIGHT = '#f2d06b';
const WHITE = '#ffffff';
const GRAY = 'rgba(255,255,255,0.6)';

const SERVICE_AREAS = [
  'Stuart', 'Palm City', 'Jensen Beach', 'Port St. Lucie',
  'Hobe Sound', 'Indiantown', 'Hutchinson Island', 'Sewalls Point',
  'Jupiter Island', 'Tequesta', 'Fort Pierce', 'Vero Beach',
];

const MARKET_DATA = {
  fedRate: '4.25%',
  mortgage30yr: '6.65%',
  mortgage15yr: '5.89%',
  medianPrice: '$425,000',
  daysOnMarket: '34',
  inventoryMonths: '3.2',
};

const AI_AGENTS = {
  scout: {
    name: 'Scout',
    subtitle: 'Your CSR',
    role: 'Customer Service Representative',
    greeting: "Welcome to Tracey Hunter Group! I'm Scout, your dedicated customer service representative. How can I help you today? I can assist with property searches, schedule showings, answer questions about the Treasure Coast market, or connect you with Tracey directly.",
    avatar: scoutAvatar,
    bg: scoutBackground,
  },
  compass: {
    name: 'Compass',
    subtitle: 'Market Analyst',
    role: 'AI Market Intelligence Analyst',
    greeting: "Hello! I'm Compass, your AI market intelligence analyst. I provide real-time insights on the Treasure Coast real estate market including pricing trends, inventory levels, neighborhood analytics, and investment opportunities. What market data can I help you with?",
    avatar: compassAvatar,
    bg: compassBackground,
  },
  beacon: {
    name: 'Beacon',
    subtitle: 'Listing Specialist',
    role: 'AI Listing Presentation Specialist',
    greeting: "Hi there! I'm Beacon, your AI listing specialist. I help sellers understand their home's value, prepare compelling listing presentations, and develop marketing strategies that maximize sale price. Ready to explore what your property is worth?",
    avatar: `linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #388E3C 100%)`,
    bg: `linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(25,45,65,0.75) 100%)`,
  },
  harbor: {
    name: 'Harbor',
    subtitle: 'Transaction Coordinator',
    role: 'AI Transaction Coordinator',
    greeting: "Welcome! I'm Harbor, your AI transaction coordinator. I guide you through every step of the buying or selling process — from contract to closing. I track deadlines, coordinate inspections, and ensure nothing falls through the cracks. How can I assist your transaction?",
    avatar: `linear-gradient(135deg, #9C27B0 0%, #CE93D8 50%, #7B1FA2 100%)`,
    bg: `linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(35,30,60,0.75) 100%)`,
  },
};

// ─── Styles ──────────────────────────────────────────────────────────
const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY_LIGHT} 100%)`,
    color: WHITE,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    maxWidth: 480,
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 20px 16px',
    textAlign: 'center',
    borderBottom: `1px solid rgba(212,168,40,0.2)`,
  },
  goldButton: (texture, tiltDeg) => ({
    width: '100%',
    padding: '28px 20px',
    borderRadius: 16,
    border: goldBorder,
    background: texture,
    boxShadow: goldShadow,
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    transform: `perspective(800px) rotateY(${tiltDeg}deg)`,
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    marginBottom: 16,
  }),
  clickBadge: {
    display: 'inline-block',
    background: 'linear-gradient(180deg, #f2d06b 0%, #d4a828 100%)',
    color: NAVY,
    fontSize: 11,
    fontWeight: 700,
    padding: '4px 16px',
    borderRadius: 20,
    letterSpacing: 1,
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  chatContainer: {
    position: 'fixed',
    inset: 0,
    background: NAVY,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    maxWidth: 480,
    margin: '0 auto',
  },
  chatHeader: (bg) => ({
    padding: '16px 20px',
    background: bg,
    backgroundSize: 'cover',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    borderBottom: `1px solid rgba(212,168,40,0.3)`,
  }),
  chatBubble: (isUser) => ({
    maxWidth: '80%',
    padding: '12px 16px',
    borderRadius: 16,
    background: isUser
      ? 'linear-gradient(135deg, rgba(212,168,40,0.2) 0%, rgba(212,168,40,0.1) 100%)'
      : 'rgba(255,255,255,0.08)',
    border: isUser ? goldBorder : '1px solid rgba(255,255,255,0.1)',
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    fontSize: 14,
    lineHeight: 1.5,
  }),
};

// ─── Components ──────────────────────────────────────────────────────

function Header() {
  return (
    <div style={styles.header}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 10px',
        background: 'conic-gradient(from 0deg, #c5961e, #f2d06b, #d4a828, #f5d980, #c5961e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 30px rgba(212,168,40,0.2), 0 0 60px rgba(212,168,40,0.08)',
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

function GoldAgentButton({ agent, texture, tilt, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        ...styles.goldButton(texture, pressed ? 0 : tilt),
        ...(pressed ? {
          transform: 'perspective(800px) rotateY(0deg) scale(0.97)',
          boxShadow: '0 2px 10px rgba(212,168,40,0.3), 0 1px 4px rgba(0,0,0,0.4)',
        } : {}),
      }}
    >
      {/* Highlight overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 16,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <div style={{
          fontSize: 22, fontWeight: 900, color: NAVY, letterSpacing: 3,
          textShadow: '0 1px 0 rgba(255,255,255,0.3), 0 -1px 0 rgba(0,0,0,0.1)',
        }}>
          {agent.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(10,22,40,0.65)', marginTop: 3, fontWeight: 600, letterSpacing: 0.5 }}>
          {agent.role}
        </div>
        <div style={{ marginTop: 12 }}>
          <span style={styles.clickBadge}>CLICK HERE</span>
        </div>
      </div>
    </button>
  );
}

function ChatInterface({ agent, onClose }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: agent.greeting, time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEnd = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        `That's a great question! Based on current Treasure Coast market conditions, I'd recommend we schedule a consultation with Tracey to discuss this in detail. Would you like me to arrange that?`,
        `I understand your interest. The ${SERVICE_AREAS[Math.floor(Math.random() * SERVICE_AREAS.length)]} area has been particularly active. Let me connect you with Tracey for personalized guidance.`,
        `Excellent point! As your ${agent.role}, I can tell you that market trends are favorable. Shall I have Tracey reach out to discuss your specific needs?`,
        `Thank you for sharing that. I've noted your preferences. Tracey Hunter specializes in exactly this type of transaction on the Treasure Coast. Want me to schedule a call?`,
      ];
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date(),
      }]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div style={styles.chatContainer}>
      {/* Header */}
      <div style={styles.chatHeader(agent.bg)}>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: WHITE, fontSize: 24, cursor: 'pointer', padding: '0 4px',
        }}>&larr;</button>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', background: agent.avatar,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 700, color: WHITE,
        }}>{agent.name[0]}</div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{agent.name}</div>
          <div style={{ fontSize: 11, color: GOLD_LIGHT }}>{agent.subtitle}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            ...styles.chatBubble(msg.role === 'user'),
          }}>
            <div style={{ color: msg.role === 'user' ? GOLD_LIGHT : WHITE }}>{msg.text}</div>
            <div style={{ fontSize: 10, color: GRAY, marginTop: 4, textAlign: 'right' }}>
              {formatTime(msg.time)}
            </div>
          </div>
        ))}
        {isTyping && (
          <div style={{ ...styles.chatBubble(false), color: GRAY, fontStyle: 'italic' }}>
            {agent.name} is typing...
          </div>
        )}
        <div ref={messagesEnd} />
      </div>

      {/* AI Disclaimer */}
      <div style={{
        padding: '6px 16px', fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        AI-powered assistant. Responses are for informational purposes only and do not constitute professional real estate advice.
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px', display: 'flex', gap: 8,
        borderTop: '1px solid rgba(212,168,40,0.2)',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder={`Ask ${agent.name} anything...`}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 24, border: goldBorder,
            background: 'rgba(255,255,255,0.06)', color: WHITE, fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={sendMessage} style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'linear-gradient(135deg, #d4a828, #f2d06b)',
          border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: NAVY, fontWeight: 700,
        }}>&uarr;</button>
      </div>
    </div>
  );
}

function MortgageCalculator() {
  const [price, setPrice] = useState('400000');
  const [down, setDown] = useState('20');
  const [rate, setRate] = useState('6.65');
  const [term, setTerm] = useState('30');

  const calculate = () => {
    const principal = parseFloat(price) * (1 - parseFloat(down) / 100);
    const monthlyRate = parseFloat(rate) / 100 / 12;
    const payments = parseFloat(term) * 12;
    if (monthlyRate === 0) return (principal / payments).toFixed(2);
    const monthly = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) /
      (Math.pow(1 + monthlyRate, payments) - 1);
    return isNaN(monthly) ? '0.00' : monthly.toFixed(2);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid rgba(212,168,40,0.3)', background: 'rgba(255,255,255,0.06)',
    color: WHITE, fontSize: 14, outline: 'none',
  };

  return (
    <div style={{
      margin: '0 20px 20px', padding: 20, borderRadius: 16,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>
        Mortgage Calculator
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Home Price ($)</label>
          <input value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Down Payment (%)</label>
          <input value={down} onChange={e => setDown(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Interest Rate (%)</label>
          <input value={rate} onChange={e => setRate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: 11, color: GRAY, display: 'block', marginBottom: 4 }}>Term (Years)</label>
          <input value={term} onChange={e => setTerm(e.target.value)} style={inputStyle} />
        </div>
      </div>
      <div style={{
        marginTop: 16, padding: 16, borderRadius: 12, textAlign: 'center',
        background: 'rgba(212,168,40,0.1)', border: goldBorder,
      }}>
        <div style={{ fontSize: 12, color: GRAY }}>Estimated Monthly Payment</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: GOLD_LIGHT, marginTop: 4 }}>
          ${Number(calculate()).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
        Estimates only. Does not include taxes, insurance, or HOA. Consult a licensed mortgage professional for accurate quotes.
      </p>
    </div>
  );
}

function LeadCaptureForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: 'Buying', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Valid phone number required';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  };

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid rgba(212,168,40,0.3)', background: 'rgba(255,255,255,0.06)',
    color: WHITE, fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  if (submitted) {
    return (
      <div style={{
        margin: '0 20px 20px', padding: 32, borderRadius: 16, textAlign: 'center',
        background: 'rgba(212,168,40,0.08)', border: goldBorder,
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>&#10003;</div>
        <h3 style={{ color: GOLD_LIGHT, fontSize: 18, marginBottom: 8 }}>Thank You!</h3>
        <p style={{ color: GRAY, fontSize: 13 }}>
          Tracey Hunter will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{
      margin: '0 20px 20px', padding: 20, borderRadius: 16,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)',
    }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>
        Connect with Tracey
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <input placeholder="Full Name *" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            style={{ ...inputStyle, borderColor: errors.name ? '#ff6b6b' : 'rgba(212,168,40,0.3)' }} />
          {errors.name && <span style={{ fontSize: 11, color: '#ff6b6b' }}>{errors.name}</span>}
        </div>
        <div>
          <input placeholder="Phone Number *" value={form.phone} type="tel"
            onChange={e => setForm({ ...form, phone: e.target.value })}
            style={{ ...inputStyle, borderColor: errors.phone ? '#ff6b6b' : 'rgba(212,168,40,0.3)' }} />
          {errors.phone && <span style={{ fontSize: 11, color: '#ff6b6b' }}>{errors.phone}</span>}
        </div>
        <input placeholder="Email (optional)" value={form.email} type="email"
          onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        <select value={form.interest}
          onChange={e => setForm({ ...form, interest: e.target.value })}
          style={{ ...inputStyle, appearance: 'none' }}>
          <option value="Buying">Interested in Buying</option>
          <option value="Selling">Interested in Selling</option>
          <option value="Investing">Interested in Investing</option>
          <option value="Renting">Interested in Renting</option>
          <option value="General">General Inquiry</option>
        </select>
        <textarea placeholder="Tell us more (optional)" value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          rows={3} style={{ ...inputStyle, resize: 'none' }} />
      </div>
      <button type="submit" style={{
        width: '100%', marginTop: 16, padding: '14px 0', borderRadius: 12, border: 'none',
        background: 'linear-gradient(135deg, #d4a828, #f2d06b)', color: NAVY,
        fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: 1,
      }}>
        SEND TO TRACEY
      </button>
      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'center' }}>
        By submitting, you consent to being contacted by Tracey Hunter Group regarding real estate services.
        Your information is kept confidential and never sold to third parties.
      </p>
    </form>
  );
}

function MarketDataCards() {
  const cards = [
    { label: 'Fed Funds Rate', value: MARKET_DATA.fedRate, icon: '\u{1F3E6}' },
    { label: '30-Year Mortgage', value: MARKET_DATA.mortgage30yr, icon: '\u{1F4C8}' },
    { label: '15-Year Mortgage', value: MARKET_DATA.mortgage15yr, icon: '\u{1F4C9}' },
    { label: 'Median Home Price', value: MARKET_DATA.medianPrice, icon: '\u{1F3E0}' },
    { label: 'Avg Days on Market', value: MARKET_DATA.daysOnMarket, icon: '\u{1F4C5}' },
    { label: 'Inventory (Months)', value: MARKET_DATA.inventoryMonths, icon: '\u{1F4E6}' },
  ];

  return (
    <div style={{ margin: '0 20px 20px' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>
        Treasure Coast Market Data
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {cards.map(card => (
          <div key={card.label} style={{
            padding: '12px 8px', borderRadius: 12, textAlign: 'center',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.15)',
          }}>
            <div style={{ fontSize: 20 }}>{card.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginTop: 4 }}>{card.value}</div>
            <div style={{ fontSize: 9, color: GRAY, marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceAreas() {
  return (
    <div style={{ margin: '0 20px 20px' }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>
        Service Areas
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {SERVICE_AREAS.map(area => (
          <span key={area} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12,
            background: 'rgba(212,168,40,0.1)', border: '1px solid rgba(212,168,40,0.25)',
            color: GOLD_LIGHT,
          }}>{area}</span>
        ))}
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div style={{
      padding: '20px 20px 32px', textAlign: 'center',
      borderTop: '1px solid rgba(212,168,40,0.15)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: GOLD_LIGHT }}>Tracey Hunter Group</div>
      <div style={{ fontSize: 11, color: GRAY, marginTop: 4 }}>RE/MAX of Stuart</div>
      <div style={{ fontSize: 10, color: GRAY, marginTop: 4 }}>
        819 SW Federal Hwy, Ste 300, Stuart, FL 34994
      </div>
      <div style={{ fontSize: 10, color: GRAY, marginTop: 2 }}>
        (772) 210-3343 | tracey@traceyhuntergroup.com
      </div>
      <a href="https://traceyhuntergroup.com" target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 10, color: GOLD, marginTop: 2, display: 'inline-block' }}>
        traceyhuntergroup.com
      </a>

      {/* Fair Housing Disclosure */}
      <div style={{
        marginTop: 20, padding: 16, borderRadius: 12,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
          FAIR HOUSING DISCLOSURE
        </div>
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
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────
export default function App() {
  const [activeChat, setActiveChat] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  if (activeChat) {
    return <ChatInterface agent={AI_AGENTS[activeChat]} onClose={() => setActiveChat(null)} />;
  }

  const tabs = [
    { id: 'home', label: 'Home', icon: '\u{1F3E0}' },
    { id: 'agents', label: 'AI Agents', icon: '\u{1F916}' },
    { id: 'tools', label: 'Tools', icon: '\u{1F4CA}' },
    { id: 'contact', label: 'Contact', icon: '\u{1F4DE}' },
  ];

  return (
    <div style={styles.container}>
      <Header />

      {/* Tab Content */}
      <div style={{ paddingBottom: 70 }}>
        {activeTab === 'home' && (
          <>
            {/* Hero Agent Buttons */}
            <div style={{ padding: '20px 20px 0' }}>
              <GoldAgentButton
                agent={AI_AGENTS.scout}
                texture={goldBarTexture}
                tilt={3}
                onClick={() => setActiveChat('scout')}
              />
              <GoldAgentButton
                agent={AI_AGENTS.compass}
                texture={goldBarTextureReverse}
                tilt={-3}
                onClick={() => setActiveChat('compass')}
              />
            </div>
            <MarketDataCards />
            <ServiceAreas />
            <Footer />
          </>
        )}

        {activeTab === 'agents' && (
          <div style={{ padding: 20 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>
              AI Agent Fleet
            </h2>
            {Object.entries(AI_AGENTS).map(([key, agent]) => (
              <button key={key} onClick={() => setActiveChat(key)} style={{
                width: '100%', padding: 16, borderRadius: 12, marginBottom: 12,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', background: agent.avatar,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700, color: WHITE, flexShrink: 0,
                }}>{agent.name[0]}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: GOLD_LIGHT }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: GRAY }}>{agent.role}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === 'tools' && (
          <>
            <div style={{ padding: '20px 20px 0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>
                Real Estate Tools
              </h2>
            </div>
            <MortgageCalculator />
            <MarketDataCards />
          </>
        )}

        {activeTab === 'contact' && (
          <>
            <div style={{ padding: '20px 20px 0' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 16 }}>
                Get in Touch
              </h2>
            </div>
            <LeadCaptureForm />

            {/* Direct Contact Info */}
            <div style={{
              margin: '0 20px 20px', padding: 20, borderRadius: 16,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,168,40,0.2)',
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: GOLD_LIGHT, marginBottom: 12 }}>
                Tracey Hunter, REALTOR&reg;
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="tel:7722103343" style={{ color: WHITE, textDecoration: 'none', fontSize: 13 }}>
                  (772) 210-3343
                </a>
                <a href="mailto:tracey@traceyhuntergroup.com" style={{ color: WHITE, textDecoration: 'none', fontSize: 13 }}>
                  tracey@traceyhuntergroup.com
                </a>
                <div style={{ fontSize: 12, color: GRAY }}>
                  RE/MAX of Stuart<br />
                  819 SW Federal Hwy, Ste 300<br />
                  Stuart, FL 34994
                </div>
              </div>
            </div>
            <Footer />
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        display: 'flex', justifyContent: 'space-around',
        padding: '10px 0 20px',
        background: `linear-gradient(180deg, transparent 0%, ${NAVY} 20%)`,
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(212,168,40,0.15)',
      }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            opacity: activeTab === tab.id ? 1 : 0.5,
            transition: 'opacity 0.2s',
          }}>
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{
              fontSize: 10, fontWeight: activeTab === tab.id ? 700 : 400,
              color: activeTab === tab.id ? GOLD_LIGHT : GRAY,
            }}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
