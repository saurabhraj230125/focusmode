import React, { useState, useEffect } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Lock, Unlock, Smartphone, 
  ExternalLink, Check, Copy, AlertTriangle, Flame, Zap, X, 
  RotateCcw, Sliders, Info, CheckCircle2
} from 'lucide-react';
import { playTaskCompleteChime, playShieldAlertSound } from '../utils/soundEffects.js';

export const DEFAULT_BLOCKED_TARGETS = [
  { id: 'instagram', name: 'Instagram & Reels', icon: '📸', desc: 'Blocks feed, reels, and stories addiction', defaultEnabled: true },
  { id: 'tiktok', name: 'TikTok & Shorts', icon: '🎵', desc: 'Stops short-form dopamine algorithmic loops', defaultEnabled: true },
  { id: 'snapchat', name: 'Snapchat & Streaks', icon: '👻', desc: 'Silences chat notifications & spotlight', defaultEnabled: true },
  { id: 'twitter', name: 'X / Twitter & Feeds', icon: '🐦', desc: 'Eliminates endless political and outrage feeds', defaultEnabled: true },
  { id: 'gaming', name: 'Gaming & Streams', icon: '🎮', desc: 'Twitch, Discord servers, and casual gaming', defaultEnabled: true },
  { id: 'reddit', name: 'Reddit & Endless Forums', icon: '💬', desc: 'Prevents rabbit hole browsing', defaultEnabled: false }
];

export const FocusShieldModal = ({
  isOpen,
  onClose,
  isShieldActive,
  setIsShieldActive,
  blockedTargets,
  setBlockedTargets,
  blockedCount,
  awardXP,
  sessionUser
}) => {
  const [activeTab, setActiveTab] = useState('status'); // 'status' | 'mobile' | 'apps'
  const [copiedKey, setCopiedKey] = useState(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const isMob = typeof window !== 'undefined' && (
      window.innerWidth <= 768 || /mobile|android|iphone|ipad/i.test(navigator.userAgent)
    );
    setIsMobileDevice(isMob);
  }, []);

  if (!isOpen) return null;

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    try { playTaskCompleteChime(); } catch {}
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleToggleTarget = (id) => {
    const updated = { ...blockedTargets, [id]: !blockedTargets[id] };
    setBlockedTargets(updated);
    try {
      localStorage.setItem('pm_focus_shield_targets', JSON.stringify(updated));
    } catch {}
  };

  const toggleShield = () => {
    const nextState = !isShieldActive;
    setIsShieldActive(nextState);
    try {
      localStorage.setItem('pm_focus_shield_enabled', nextState.toString());
      if (nextState) {
        playTaskCompleteChime();
        if (awardXP) awardXP(10, 'Activated Focus Shield');
      }
    } catch {}
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        className="glass"
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '24px',
          padding: '24px',
          background: '#090d16',
          border: isShieldActive ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: isShieldActive 
            ? '0 20px 60px rgba(0,0,0,0.8), 0 0 35px rgba(16, 185, 129, 0.2)' 
            : '0 20px 60px rgba(0,0,0,0.8), 0 0 35px rgba(139, 92, 246, 0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: isShieldActive ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.4))' : 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(99,102,241,0.3))',
              border: isShieldActive ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(139,92,246,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Shield size={24} color={isShieldActive ? '#10b981' : '#a78bfa'} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Focus Shield & App Blocker
              </h2>
              <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '3px 0 0' }}>
                Block Instagram, Reels & phone distractions while studying
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '100px' }}>
          {[
            { id: 'status', label: 'Shield Power 🛡️' },
            { id: 'apps', label: 'Blocked Apps 📵' },
            { id: 'mobile', label: 'Phone Setup 📲' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '7px 12px',
                borderRadius: '100px',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab.id ? '800' : '600',
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.id ? (isShieldActive ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #7c3aed, #6366f1)') : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Shield Status & Master Control */}
        {activeTab === 'status' && (
          <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
            {/* Master Toggle Card */}
            <div style={{
              background: isShieldActive ? 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(5,150,105,0.06))' : 'rgba(255,255,255,0.03)',
              border: isShieldActive ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
              padding: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.1rem' }}>{isShieldActive ? '🟢' : '⚪'}</span>
                  <strong style={{ fontSize: '1rem', color: '#fff' }}>
                    {isShieldActive ? 'Focus Shield is ACTIVE' : 'Focus Shield is OFF'}
                  </strong>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '4px 0 0' }}>
                  {isShieldActive 
                    ? 'Screen kept awake, tabs locked, and Instagram/Reels distraction breaches will be intercepted.'
                    : 'Turn on to lock down social media and keep your phone in deep work mode.'}
                </p>
              </div>

              <button
                onClick={toggleShield}
                style={{
                  background: isShieldActive ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 22px',
                  borderRadius: '100px',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: isShieldActive ? '0 4px 15px rgba(239,68,68,0.4)' : '0 4px 15px rgba(16,185,129,0.4)',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {isShieldActive ? 'Turn Off' : 'Turn ON 🛡️'}
              </button>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>🛑 Breaches Intercepted</span>
                <strong style={{ fontSize: '1.25rem', color: '#f87171' }}>{blockedCount || 0} attempts</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>⚡ Shield Reward</span>
                <strong style={{ fontSize: '1.25rem', color: '#fbbf24' }}>+25 XP / Session</strong>
              </div>
            </div>

            {/* What Happens While Studying */}
            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '14px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#fbbf24"/> How Focus Shield Protects Your Study:
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', color: '#cbd5e1', fontSize: '0.78rem', lineHeight: 1.6 }}>
                <li><strong>Screen Wake Lock:</strong> Prevents phone screen from dimming or going to sleep during Pomodoro sprints.</li>
                <li><strong>Distraction Interceptor:</strong> Detects if you leave FocusMode to open Instagram or Reels, prompting an emergency re-lock.</li>
                <li><strong>In-App Link Firewall:</strong> Blocks all outbound links and embeds to Instagram, TikTok, and social platforms.</li>
                <li><strong>Iron Will Streak:</strong> Earn a verified +25 XP discipline bonus upon completing sessions with Shield active.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: Configurable Blocked Apps List */}
        {activeTab === 'apps' && (
          <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 6px' }}>
              Choose which digital dopamine traps to intercept while your study timer is running:
            </p>
            {DEFAULT_BLOCKED_TARGETS.map(target => {
              const isEnabled = blockedTargets[target.id] !== false;
              return (
                <div
                  key={target.id}
                  onClick={() => handleToggleTarget(target.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '14px',
                    background: isEnabled ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: isEnabled ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.4rem' }}>{target.icon}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#fff' }}>{target.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{target.desc}</div>
                    </div>
                  </div>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: isEnabled ? '#10b981' : 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    transition: 'all 0.2s'
                  }}>
                    {isEnabled ? <Check size={14} strokeWidth={3} /> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Native Mobile Phone Auto-Blocker Setup */}
        {activeTab === 'mobile' && (
          <div className="custom-scrollbar" style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', padding: '12px 14px' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Smartphone size={15}/> 1-Tap Physical Phone Blocker Setup
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.76rem', margin: 0, lineHeight: 1.45 }}>
                To physically block Instagram & TikTok network connections on your Android or iPhone device while FocusMode is running:
              </p>
            </div>

            {/* Android Setup */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <strong style={{ fontSize: '0.88rem', color: '#fff' }}>🤖 Android Private DNS (1-Tap Block)</strong>
                <span style={{ fontSize: '0.68rem', background: '#10b981', color: '#fff', padding: '1px 6px', borderRadius: '100px', fontWeight: 800 }}>Instant</span>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 10px' }}>
                1. Open Phone <strong>Settings &gt; Network &gt; Private DNS</strong><br />
                2. Select <em>Private DNS provider hostname</em> and paste:
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.4)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <code style={{ fontSize: '0.78rem', color: '#38bdf8', flex: 1 }}>family.adguard-dns.com</code>
                <button
                  onClick={() => handleCopy('family.adguard-dns.com', 'android_dns')}
                  style={{ background: 'rgba(56, 189, 248, 0.15)', border: 'none', color: '#38bdf8', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {copiedKey === 'android_dns' ? <Check size={12}/> : <Copy size={12}/>}
                  {copiedKey === 'android_dns' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                ✓ Immediately blocks social media &amp; distracting advertising across the whole device.
              </div>
            </div>

            {/* iOS Setup */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '14px' }}>
              <strong style={{ fontSize: '0.88rem', color: '#fff', display: 'block', marginBottom: '6px' }}>
                🍎 Apple iOS (Focus Mode Automation)
              </strong>
              <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '0 0 6px', lineHeight: 1.5 }}>
                1. Open iOS <strong>Settings &gt; Focus &gt; Add "Study Focus"</strong><br />
                2. Under <em>Silence Notifications</em>, silence Instagram &amp; Snapchat.<br />
                3. Under <em>App Limits</em> (Screen Time), set Instagram to 0 min during study.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span>Shield Status:</span>
            <span style={{ color: isShieldActive ? '#10b981' : '#f87171', fontWeight: 800 }}>
              {isShieldActive ? 'PROTECTED' : 'UNGUARDED'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 22px',
              borderRadius: '100px',
              fontSize: '0.85rem',
              fontWeight: 800
            }}
          >
            Save &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Mobile Auto-Ask Prompt Banner when Installed / First Study ──
export const FocusShieldMobilePrompt = ({
  isOpen,
  onEnable,
  onDismiss
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      left: '16px',
      right: '16px',
      maxWidth: '480px',
      margin: '0 auto',
      zIndex: 999,
      background: 'rgba(15, 23, 42, 0.96)',
      border: '1px solid rgba(16, 185, 129, 0.5)',
      borderRadius: '22px',
      padding: '16px 18px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.8), 0 0 25px rgba(16, 185, 129, 0.25)',
      backdropFilter: 'blur(20px)',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.35))',
          border: '1px solid rgba(16,185,129,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShieldCheck size={20} color="#10b981" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: '0 0 3px' }}>
            Auto-Block Instagram on Mobile?
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.78rem', margin: 0, lineHeight: 1.4 }}>
            FocusMode can automatically block Instagram, Reels, TikTok, and phone distractions whenever you start studying.
          </p>
        </div>
        <button onClick={onDismiss} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '2px' }}>
          <X size={16} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            padding: '7px 14px',
            borderRadius: '100px',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Later
        </button>
        <button
          onClick={onEnable}
          style={{
            background: 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            color: '#fff',
            padding: '7px 18px',
            borderRadius: '100px',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(16,185,129,0.35)'
          }}
        >
          🛡️ Enable Focus Shield
        </button>
      </div>
    </div>
  );
};

// ── Emergency Distraction Breach Overlay Component ──
export const FocusShieldBreachAlert = ({
  isOpen,
  onResolve,
  onOpenSettings
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(10, 5, 20, 0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '20px',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{
        maxWidth: '460px',
        width: '100%',
        background: 'rgba(15, 23, 42, 0.95)',
        border: '2px solid rgba(239, 68, 68, 0.65)',
        borderRadius: '28px',
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: '0 25px 70px rgba(0,0,0,0.8), 0 0 50px rgba(239, 68, 68, 0.35)',
        position: 'relative'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '2px solid #ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          animation: 'pulse 1s infinite'
        }}>
          <ShieldAlert size={36} color="#ef4444" />
        </div>

        <span style={{ fontSize: '0.72rem', fontWeight: 900, letterSpacing: '1px', color: '#ef4444', textTransform: 'uppercase', background: 'rgba(239,68,68,0.15)', padding: '2px 10px', borderRadius: '100px' }}>
          Distraction Attempt Intercepted
        </span>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: '12px 0 8px' }}>
          Focus Shield Protected Your Session!
        </h2>

        <p style={{ color: '#cbd5e1', fontSize: '0.88rem', lineHeight: 1.5, margin: '0 0 24px' }}>
          You switched away from your study sprint (Instagram / App switch attempt detected). 
          Don't let algorithms break your momentum. Return to deep work now!
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            onClick={onResolve}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '100px',
              fontWeight: 800,
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(16, 185, 129, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Lock size={16}/>
            <span>Re-engage Focus Lock (+10 XP)</span>
          </button>

          <button
            onClick={onOpenSettings}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8',
              padding: '10px 18px',
              borderRadius: '100px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            ⚙️ Configure Shielded Apps
          </button>
        </div>
      </div>
    </div>
  );
};
