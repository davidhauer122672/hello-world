import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// ─── Service Worker Registration ─────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('SW registered:', reg.scope);
      })
      .catch((err) => {
        console.warn('SW registration failed:', err);
      });
  });
}

// ─── Splash Screen ───────────────────────────────────────────────
function SplashScreen({ onFinish }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 2800);
    const t3 = setTimeout(() => onFinish(), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onFinish]);

  const visible = phase >= 1;
  const exiting = phase === 2;

  return (
    <div
      role="presentation"
      aria-label="Loading Tracey Hunter Group"
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 40%, #12243d 0%, #0a1628 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        opacity: exiting ? 0 : 1,
        transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{
        position: 'absolute', top: '35%', left: '50%', width: 300, height: 300,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(212,168,40,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: 110, height: 110, borderRadius: '50%',
        background: 'conic-gradient(from 0deg, #c5961e, #f2d06b, #d4a828, #f5d980, #c5961e)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 60px rgba(212,168,40,0.25), 0 0 120px rgba(212,168,40,0.1)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.85)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        marginBottom: 28,
      }}>
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'conic-gradient(from 180deg, #d4a828, #f2d06b, #c5961e, #f5d980, #d4a828)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: 36, fontWeight: 900, color: '#0a1628',
            letterSpacing: 4, textShadow: '0 1px 2px rgba(255,255,255,0.2)',
          }}>THG</span>
        </div>
      </div>

      <h1 style={{
        fontSize: 26, fontWeight: 700, letterSpacing: 4,
        background: 'linear-gradient(180deg, #f5d980 0%, #d4a828 40%, #c5961e 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s',
      }}>TRACEY HUNTER</h1>

      <h2 style={{
        fontSize: 14, fontWeight: 300, letterSpacing: 8, marginTop: 4,
        color: 'rgba(212,168,40,0.55)', textAlign: 'center',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.25s',
      }}>GROUP</h2>

      <div style={{
        width: visible ? 60 : 0, height: 1, marginTop: 20,
        background: 'linear-gradient(90deg, transparent, rgba(212,168,40,0.6), transparent)',
        transition: 'width 1s cubic-bezier(0.16, 1, 0.3, 1) 0.4s',
      }} />

      <p style={{
        marginTop: 16, fontSize: 10, letterSpacing: 4, textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.3)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 1s ease 0.6s',
      }}>AI-Powered Real Estate</p>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────
function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const handleFinish = useCallback(() => setShowSplash(false), []);

  return showSplash ? <SplashScreen onFinish={handleFinish} /> : <App />;
}

createRoot(document.getElementById('root')).render(<Root />);
