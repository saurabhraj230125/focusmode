import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, ArrowRight, Headphones, BrainCircuit, Shield, 
  Trophy, Globe, BookOpen, MonitorPlay, Sparkles, Check, 
  RotateCcw, Compass, Target, Clock, Zap, ExternalLink, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Blog from '../Blog.jsx';
import { Footer } from './Footer.jsx';
import { PrivacyPolicy } from './PrivacyPolicy.jsx';
import { TermsOfService } from './TermsOfService.jsx';
import { AboutUs } from './AboutUs.jsx';
import { ContactUs } from './ContactUs.jsx';

export const WelcomeScreen = ({
  authMode,
  setAuthMode,
  authUsername,
  setAuthUsername,
  authPassword,
  setAuthPassword,
  authError,
  setAuthError,
  handleAuth,
  onQuickSetup,
  usersDb,
  setUsersDb
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const welcomeContainerRef = useRef(null);

  // 0: Home Hero, 2: Setup (Name & Aim), 3: Login/Register, 4: Blog, 5: About, 6: Mission, 7: Privacy, 8: Terms, 9: Contact
  const [step, setStep] = useState(() => {
    if (localStorage.getItem('planmaker_explicit_logout')) return 3;
    if (location.pathname === '/about') return 5;
    if (location.pathname === '/mission') return 6;
    if (location.pathname === '/blog') return 4;
    if (location.pathname === '/login') return 3;
    if (location.pathname === '/privacy-policy') return 7;
    if (location.pathname === '/terms-of-service') return 8;
    if (location.pathname === '/contact') return 9;
    return 0;
  });

  const [setupName, setSetupName] = useState('');
  const [setupAim, setSetupAim] = useState('JEE Advanced');
  const [setupPassword, setSetupPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (location.pathname === '/') {
      setStep(0);
      document.title = "FocusMode | Hyper-Focused Study Universe";
    } else if (location.pathname === '/about') {
      setStep(5);
      document.title = "About Us | FocusMode Player";
    } else if (location.pathname === '/mission') {
      setStep(6);
      document.title = "Our Mission | FocusMode Player";
    } else if (location.pathname === '/blog') {
      setStep(4);
      document.title = "Study Tips & Blog | FocusMode Player";
    } else if (location.pathname === '/login') {
      setStep(3);
      document.title = "Login | FocusMode Player";
    } else if (location.pathname === '/privacy-policy') {
      setStep(7);
      document.title = "Privacy Policy | FocusMode Player";
    } else if (location.pathname === '/terms-of-service') {
      setStep(8);
      document.title = "Terms of Service | FocusMode Player";
    } else if (location.pathname === '/contact') {
      setStep(9);
      document.title = "Contact Us | FocusMode Player";
    }
    welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleClearTestData = () => {
    if (window.confirm("Clear local test accounts and reset? Your device storage will be refreshed.")) {
      localStorage.removeItem('planmaker_users');
      localStorage.removeItem('planmaker_session');
      localStorage.removeItem('planmaker_explicit_logout');
      if (setUsersDb) setUsersDb({});
      setAuthError('Local test data cleared. You can now register or login cleanly!');
    }
  };

  const handleCompleteSetup = (e) => {
    e.preventDefault();
    if (!setupName.trim()) return;
    onQuickSetup(setupName.trim(), setupAim, setupPassword.trim());
  };

  return (
    <div 
      ref={welcomeContainerRef}
      className="welcome-container" 
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        zIndex: 1000,
        background: 'radial-gradient(circle at 50% 10%, #110d29 0%, #05040d 100%)',
        color: '#fff',
        boxSizing: 'border-box',
        padding: 0,
        margin: 0
      }}
    >
      
      {/* Background Animated Atmosphere */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: -1 }}>
        <div style={{ position: 'absolute', top: '-15%', left: '10%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '10%', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* ── TOP FLOATING HEADER ── */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '10px 14px', boxSizing: 'border-box', pointerEvents: 'none' }}>
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            pointerEvents: 'auto',
            padding: '8px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            maxWidth: '1040px',
            background: 'rgba(15, 23, 42, 0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '100px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            boxSizing: 'border-box',
            gap: '12px'
          }}
        >
          <div 
            onClick={() => { setStep(0); navigate('/'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
            style={{ fontWeight: 800, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139,92,246,0.4)',
              flexShrink: 0
            }}>
              <Headphones size={18} color="#fff" />
            </div>
            <span style={{
              background: 'linear-gradient(to right, #fff, #c4b5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
              whiteSpace: 'nowrap'
            }}>
              FocusMode <span style={{ color: '#ec4899', WebkitTextFillColor: '#ec4899' }}>Player</span>
            </span>
          </div>

          <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              className="welcome-nav-text-link"
              onClick={() => { setStep(6); navigate('/mission'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              style={{ background: 'none', border: 'none', color: step === 6 ? '#c4b5fd' : '#94a3b8', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            >
              Mission
            </button>
            <button 
              className="welcome-nav-text-link"
              onClick={() => { setStep(5); navigate('/about'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              style={{ background: 'none', border: 'none', color: step === 5 ? '#c4b5fd' : '#94a3b8', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            >
              About
            </button>
            <button 
              className="welcome-nav-text-link"
              onClick={() => { setStep(4); navigate('/blog'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              style={{ background: 'none', border: 'none', color: step === 4 ? '#c4b5fd' : '#94a3b8', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            >
              Blog
            </button>
            <button 
              className="welcome-nav-text-link"
              onClick={() => { setStep(9); navigate('/contact'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} 
              style={{ background: 'none', border: 'none', color: step === 9 ? '#c4b5fd' : '#94a3b8', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', transition: 'color 0.2s' }}
            >
              Contact
            </button>

            <div className="welcome-nav-text-link" style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.12)' }} />

            <button
              onClick={() => { setStep(3); setAuthMode('login'); navigate('/login'); }}
              style={{
                padding: '7px 18px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                border: 'none',
                color: '#fff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(139,92,246,0.35)',
                transition: 'transform 0.2s',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              Login
            </button>
          </nav>
        </motion.header>
      </div>

      {/* ── MAIN CONTENT WRAPPER ── */}
      <div style={{
        flex: '1 0 auto',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box'
      }}>
        <AnimatePresence mode="wait">
        
        {/* ── STEP 0: HERO & INTERACTIVE SHOWCASE ── */}
        {step === 0 && (
          <motion.main
            key="landing-hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6 }}
            style={{
              paddingTop: '110px',
              paddingBottom: '4rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              maxWidth: '1180px',
              margin: '0 auto',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem'
            }}
          >
            {/* Hero Heading */}
            <div style={{ textAlign: 'center', maxWidth: '820px', marginTop: '2rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '100px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                color: '#c4b5fd',
                fontSize: '0.82rem',
                fontWeight: 800,
                letterSpacing: '0.5px',
                marginBottom: '1.5rem'
              }}>
                <Sparkles size={14} /> AD-FREE STUDY THEATER & DEEP FOCUS ECOSYSTEM
              </div>

              <h1 style={{
                fontSize: 'clamp(2.4rem, 6vw, 4.8rem)',
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                marginBottom: '1.5rem',
                color: '#fff'
              }}>
                Conquer Your Exams Without The{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #a855f7, #ec4899, #f43f5e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Algorithmic Noise.
                </span>
              </h1>

              <p style={{
                fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
                color: '#94a3b8',
                lineHeight: 1.6,
                marginBottom: '2.5rem',
                maxWidth: '680px',
                margin: '0 auto 2.5rem'
              }}>
                Watch educational YouTube lectures ad-free with synchronized timestamp notes, procedural soundscapes, Pomodoro sprints, and daily quests engineered for serious aspirants.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 35px rgba(139,92,246,0.6)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setStep(2)}
                  style={{
                    padding: '16px 36px',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    borderRadius: '100px',
                    background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  Start Journey Free <ArrowRight size={20} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { setStep(3); setAuthMode('login'); }}
                  style={{
                    padding: '16px 32px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    borderRadius: '100px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  Sign In
                </motion.button>
              </div>
            </div>

            {/* ── 4 FEATURE PILLARS SHOWCASE ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.25rem',
              width: '100%',
              marginTop: '4rem'
            }}>
              <div className="glass" style={{
                padding: '1.75rem',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-physics)' }}>
                  <MonitorPlay size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Lecture Study Hall
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  Paste any YouTube URL or load curated presets. Blocks shorts, comments, and recommendations while enabling 1-click timestamp notes.
                </p>
              </div>

              <div className="glass" style={{
                padding: '1.75rem',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Headphones size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Offline Soundscapes
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  Procedural Web Audio sound generator for Rainfall, Ocean Waves, and 40Hz Gamma binaural waves. 100% offline with zero network lag.
                </p>
              </div>

              <div className="glass" style={{
                padding: '1.75rem',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <Trophy size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Quests & Gamification
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  Turn heavy syllabus study into an exciting progression loop. Earn XP, rank up scholar titles, protect streaks, and complete daily missions.
                </p>
              </div>

              <div className="glass" style={{
                padding: '1.75rem',
                borderRadius: '24px',
                background: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(236,72,153,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899' }}>
                  <BookOpen size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Mistake Vault
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                  Log formula slips and calculation traps after every mock test. Review them with 1 click to permanently boost your retention.
                </p>
              </div>
            </div>
          </motion.main>
        )}

        {/* ── STEP 2: ONBOARDING SETUP (NAME & AIM & OPTIONAL PASSWORD) ── */}
        {step === 2 && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', paddingTop: '100px' }}>
            <motion.div
              key="setup-screen"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '480px',
                padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                  boxShadow: '0 8px 20px rgba(139,92,246,0.4)'
                }}>
                  <User size={28} color="#fff" />
                </div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', margin: '0 0 6px' }}>
                  Welcome, Scholar!
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: 0 }}>
                  Set up your student profile in 10 seconds.
                </p>
              </div>

              <form onSubmit={handleCompleteSetup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Your Name or Alias *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex, Maya, Vikram..."
                    value={setupName}
                    onChange={e => setSetupName(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', marginTop: '6px', borderRadius: '12px', padding: '14px 16px', fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Primary Target / Exam Aim *
                  </label>
                  <select
                    value={setupAim}
                    onChange={e => setSetupAim(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', marginTop: '6px', borderRadius: '12px', padding: '14px 16px', fontSize: '0.95rem', cursor: 'pointer' }}
                  >
                    <option value="JEE Advanced">⚡ JEE Advanced & Main</option>
                    <option value="NEET UG">🩺 NEET UG (Medical)</option>
                    <option value="UPSC IAS">🏛️ UPSC Civil Services</option>
                    <option value="SAT / Global">🌍 SAT / ACT College Prep</option>
                    <option value="College Finals">📚 College & University Exams</option>
                    <option value="Software Dev">💻 Coding & Computer Science</option>
                    <option value="Deep Work">🎯 General Deep Work & Self-Study</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Account Password (Optional)</span>
                    <span style={{ fontSize: '0.72rem', color: '#38bdf8' }}>For logging back in</span>
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password (optional)"
                      value={setupPassword}
                      onChange={e => setSetupPassword(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', borderRadius: '12px', padding: '14px 44px 14px 16px', fontSize: '1rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    style={{
                      padding: '14px',
                      flex: 1,
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!setupName.trim()}
                    className="btn-primary"
                    style={{
                      padding: '14px',
                      flex: 2,
                      borderRadius: '12px',
                      fontWeight: 800,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    Enter Study Studio <ArrowRight size={18} />
                  </button>
                </div>
              </form>

              <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Already have an account?{' '}
                  <span
                    onClick={() => { setStep(3); setAuthMode('login'); }}
                    style={{ color: '#c4b5fd', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Log In Here
                  </span>
                </span>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── STEP 3: LOGIN & REGISTER MODAL (SMART AUTO-HEALING) ── */}
        {step === 3 && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', paddingTop: '100px' }}>
            <motion.div
              key="auth-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass"
              style={{
                width: '100%',
                maxWidth: '440px',
                padding: 'clamp(1.5rem, 5vw, 2.5rem)',
                borderRadius: '28px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem'
              }}
            >
              {/* Tab Selector: Login vs Register */}
              <div style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.3)',
                padding: '4px',
                borderRadius: '100px',
                border: '1px solid rgba(255,255,255,0.08)'
              }}>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: '100px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: authMode === 'login' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'transparent',
                    color: authMode === 'login' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setAuthError(''); }}
                  style={{
                    flex: 1,
                    padding: '10px 0',
                    borderRadius: '100px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    background: authMode === 'register' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'transparent',
                    color: authMode === 'register' ? '#fff' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}
                >
                  Create Account
                </button>
              </div>

              <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
                  {authMode === 'login' ? 'Welcome Back!' : 'Start Your Journey'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
                  {authMode === 'login' ? 'Enter your credentials to resume deep work.' : 'Create your free focus mode account.'}
                </p>
              </div>

              <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Username or Student Name
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="Username"
                      value={authUsername}
                      onChange={e => setAuthUsername(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '12px', fontSize: '0.95rem' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative', marginTop: '6px' }}>
                    <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Password"
                      value={authPassword}
                      onChange={e => setAuthPassword(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', padding: '14px 44px 14px 44px', borderRadius: '12px', fontSize: '0.95rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '0.85rem',
                      lineHeight: 1.4
                    }}
                  >
                    {authError}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '1rem',
                    marginTop: '6px',
                    boxShadow: '0 4px 18px rgba(139,92,246,0.4)'
                  }}
                >
                  {authMode === 'login' ? 'Log In to Studio' : 'Create Free Account'}
                </button>
              </form>

              {/* Utility Row: Clear Test Data & Back */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                paddingTop: '14px',
                fontSize: '0.82rem'
              }}>
                <button
                  onClick={() => setStep(0)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Home
                </button>

                <button
                  onClick={handleClearTestData}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                  title="Wipes local storage test data if you get stuck with an old test user"
                >
                  <RotateCcw size={12} /> Clear Test Data
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* ── STEP 6: OUR MISSION (INSPIRING & PROFESSIONAL) ── */}
        {step === 6 && (
          <motion.main
            key="mission-page"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              paddingTop: '110px',
              paddingBottom: '4rem',
              width: '100%',
              maxWidth: '920px',
              margin: '0 auto',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <BrainCircuit size={32} color="#c4b5fd" />
              </div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-1px', color: '#fff', margin: '0 0 1rem' }}>
                Our Mission
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '680px', margin: '0 auto' }}>
                We believe students shouldn't have to fight billion-dollar attention algorithms just to watch a physics lecture.
              </p>
            </div>

            <div className="glass" style={{
              padding: 'clamp(1.5rem, 4vw, 2.5rem)',
              borderRadius: '28px',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.75rem',
              lineHeight: 1.8,
              fontSize: '1.05rem',
              color: '#cbd5e1'
            }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  1. The Digital Distraction Crisis
                </h3>
                <p>
                  Today, YouTube holds the world's greatest educational content. But every time a student opens YouTube to study electrostatics or calculus, they are bombarded with algorithmic shorts, sensational clickbait, and endless recommendation rabbit holes. One minute of study turns into 45 minutes of wasted dopamine.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  2. A Distraction-Free Study Habitat
                </h3>
                <p>
                  Focus Mode Player strips away all the noise. No comments, no algorithmic feeds, no shorts. Instead, you get synchronized timestamped note-taking, procedural focus soundscapes, and an active recall mistake vault.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                  3. Deep Gamification That Builds Habits
                </h3>
                <p>
                  Unlike games that exploit your time, we use RPG leveling, daily quests, and streaks to reward you for real-world study hours. You earn XP when you solve problems, master modules, and review your mistakes.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary"
                  style={{ padding: '14px 32px', borderRadius: '100px', fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Join the Movement <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </motion.main>
        )}

        {/* ── STEP 5: ABOUT US (PROFESSIONAL & AUTHENTIC) ── */}
        {step === 5 && (
          <motion.main
            key="about-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ paddingTop: '80px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}
          >
            <AboutUs onBack={() => { setStep(0); navigate('/'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </motion.main>
        )}

        {/* ── STEP 7: PRIVACY POLICY (GOOGLE ADSENSE COMPLIANT) ── */}
        {step === 7 && (
          <motion.main
            key="privacy-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ paddingTop: '80px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}
          >
            <PrivacyPolicy onBack={() => { setStep(0); navigate('/'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </motion.main>
        )}

        {/* ── STEP 8: TERMS OF SERVICE ── */}
        {step === 8 && (
          <motion.main
            key="terms-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ paddingTop: '80px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}
          >
            <TermsOfService onBack={() => { setStep(0); navigate('/'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </motion.main>
        )}

        {/* ── STEP 9: CONTACT US ── */}
        {step === 9 && (
          <motion.main
            key="contact-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{ paddingTop: '80px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}
          >
            <ContactUs onBack={() => { setStep(0); navigate('/'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }} />
          </motion.main>
        )}

        {/* ── STEP 4: BLOG / STUDY TIPS ── */}
        {step === 4 && (
          <motion.main
            key="blog-page"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              paddingTop: '90px',
              paddingBottom: '4rem',
              width: '100%',
              maxWidth: '960px',
              margin: '0 auto',
              paddingLeft: '1.25rem',
              paddingRight: '1.25rem',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <button
                onClick={() => { setStep(0); navigate('/'); welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 600
                }}
              >
                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Home
              </button>
            </div>
            <Blog />
          </motion.main>
        )}

      </AnimatePresence>
      </div>

      {/* ── GLOBAL AD-SENSE COMPLIANT FOOTER ── */}
      {[0, 4, 5, 6, 7, 8, 9].includes(step) && (
        <Footer onNavigate={(path, stepNum) => {
          setStep(stepNum !== undefined ? stepNum : 0);
          navigate(path);
          welcomeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      )}
    </div>
  );
};
