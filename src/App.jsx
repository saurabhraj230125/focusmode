import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, ChevronDown, BookOpen, FlaskConical, Calculator, 
  Play, Pause, RotateCcw, BrainCircuit, Target, Plus, Clock,
  LayoutDashboard, BookHeart, Users, Trophy, Flame, 
  Stethoscope, Landmark, User, LogOut, Lock, Calendar, ArrowRight,
  Headphones, Send, Zap, MonitorPlay, Trash2, Video,
  Wifi, VideoOff, PhoneCall, Globe, X, Download, FileText, Save, Bot, Sparkles, Move, Columns, Rows, HelpCircle, ArrowUp, Search, MessageSquare, Shield, Settings, UserX, CornerUpLeft, Heart, Smile, Maximize2, Minimize2, Radio, Award, Share2, Compass, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  trackSignUp, trackLogin, trackLogout, trackGuestSession,
  trackOnboarding, trackTabChange,
  trackTaskAdded, trackSubtaskCompleted, trackModuleCompleted,
  trackTimerStarted, trackTimerCompleted,
  trackVideoAdded, trackVideoPlayed, trackNoteDownloaded,
  trackJournalSaved, trackPostCreated, trackPostLiked, trackCommentPosted,
  trackRoomJoined, trackAIOpened, trackAIQuestion, trackXPEarned
} from './analytics.js';
import { useCommunity, containsAbuse, useFirebaseUsers, syncUserToFirebase, isDmBetween, getDmOtherUser, extractDmText } from './useCommunity.js';
import { useEvents } from './useEvents.js';
import { usePushNotifications } from './usePushNotifications.js';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Blog from './Blog.jsx';

// --- TIME AGO UTILITY ---
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'just now';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

const TimeAgo = ({ date, fallback }) => {
  const [display, setDisplay] = useState(date ? formatTimeAgo(date) : fallback);
  useEffect(() => {
    if (!date) return;
    const timer = setInterval(() => {
      setDisplay(formatTimeAgo(date));
    }, 60000);
    return () => clearInterval(timer);
  }, [date, fallback]);
  return <span>{display}</span>;
};
// ------------------------

// Default templates for different exams
const examTemplates = {
  General: [
    { id: 'focus', title: 'Deep Work', icon: 'physics', tasks: [] },
    { id: 'study', title: 'Study', icon: 'current', tasks: [] },
    { id: 'projects', title: 'Projects', icon: 'math', tasks: [] }
  ],
  JEE: [
    { id: 'physics', title: 'Physics', icon: 'physics', tasks: [] },
    { id: 'chem', title: 'Chemistry', icon: 'chem', tasks: [] },
    { id: 'math', title: 'Mathematics', icon: 'math', tasks: [] }
  ],
  NEET: [
    { id: 'physics', title: 'Physics', icon: 'physics', tasks: [] },
    { id: 'chem', title: 'Chemistry', icon: 'chem', tasks: [] },
    { id: 'bio', title: 'Biology', icon: 'bio', tasks: [] }
  ],
  UPSC: [
    { id: 'history', title: 'History & Art', icon: 'history', tasks: [] },
    { id: 'polity', title: 'Polity & Governance', icon: 'polity', tasks: [] },
    { id: 'geo', title: 'Geography', icon: 'geo', tasks: [] },
    { id: 'current', title: 'Current Affairs', icon: 'current', tasks: [] }
  ],
  NDA: [
    { id: 'math', title: 'Mathematics', icon: 'math', tasks: [] },
    { id: 'gat', title: 'General Ability Test', icon: 'current', tasks: [] }
  ],
  SAT: [
    { id: 'math', title: 'Mathematics', icon: 'math', tasks: [] },
    { id: 'reading', title: 'Reading & Writing', icon: 'current', tasks: [] }
  ],
  MCAT: [
    { id: 'bio', title: 'Biology & Biochem', icon: 'bio', tasks: [] },
    { id: 'chem', title: 'Chem & Physics', icon: 'chem', tasks: [] },
    { id: 'psych', title: 'Psychology & Soc', icon: 'history', tasks: [] }
  ],
  GRE: [
    { id: 'quant', title: 'Quantitative', icon: 'math', tasks: [] },
    { id: 'verbal', title: 'Verbal Reasoning', icon: 'current', tasks: [] }
  ],
  GMAT: [
    { id: 'quant', title: 'Quantitative', icon: 'math', tasks: [] },
    { id: 'verbal', title: 'Verbal', icon: 'current', tasks: [] }
  ],
  IB: [
    { id: 'hl', title: 'Higher Level Subjects', icon: 'physics', tasks: [] },
    { id: 'sl', title: 'Standard Level Subjects', icon: 'history', tasks: [] },
    { id: 'tok', title: 'Theory of Knowledge', icon: 'current', tasks: [] }
  ],
  AP: [
    { id: 'stem', title: 'STEM Subjects', icon: 'math', tasks: [] },
    { id: 'arts', title: 'Arts & Humanities', icon: 'history', tasks: [] }
  ]
};

const defaultCommunityFeed = [
  { id: 1, user: 'AmanRaj_07', prep: 'JEE', xp: 980, action: 'Just scored 95% in the JEE mock! Electrostatics finally clicked after 3 days of struggle. Keep going everyone 🔥 #JEE2025 #Physics', time: '10m ago', isChat: true, likes: 24, likedBy: [], comments: [] },
  { id: 2, user: 'Sneha_24', prep: 'NEET', xp: 1320, action: 'NEET tip: For Organic Chemistry, do reaction mechanisms first, not name reactions. Changed everything for me. #NEET2025 #OrganicChem', time: '1h ago', isChat: true, likes: 47, likedBy: [], comments: [] },
  { id: 3, user: 'Rohan_Prep', prep: 'JEE', xp: 760, action: 'Cleared entire Rotational Motion backlog today! Used the Pomodoro timer here — 6 sessions straight 💪 #JEE #StudyTips', time: '3h ago', isChat: true, likes: 15, likedBy: [], comments: [] },
  { id: 4, user: 'Priya_M', prep: 'UPSC', xp: 540, action: 'Does anyone have short notes for Indian Polity? Specifically Art. 52-78. Would really appreciate! #UPSC2025', time: '4h ago', isChat: true, likes: 9, likedBy: [], comments: [{user: 'AmanRaj_07', text: 'Check Laxmikant Chapter 17!', time: '3h ago'}] },
  { id: 5, user: 'Vikram_Singh', prep: 'JEE', xp: 1450, action: '200 days to JEE. No phone after 9pm. No excuses. Who is with me? Drop a 🔥 below! #Discipline #JEE2025', time: '6h ago', isChat: true, likes: 89, likedBy: [], comments: [] },
];

// Removed mockLeaderboard
const getLevelData = (xp) => {
  const level = Math.floor(xp / 100) + 1;
  let title = 'Novice Aspirant';
  if (level >= 5) title = 'Dedicated Scholar';
  if (level >= 10) title = 'Fierce Competitor';
  if (level >= 20) title = 'Elite Ranker';
  if (level >= 50) title = 'Focus Master';
  return { level, title };
};

const extractYouTubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const avatarColors = ['var(--accent-physics)','var(--accent-chem)','var(--accent-math)','var(--accent-success)','#f59e0b','#06b6d4'];
const getAvatarColor = (name) => { 
  if (!name) return avatarColors[0];
  let h = 0; 
  for (let c of name) h = c.charCodeAt(0) + ((h<<5)-h); 
  return avatarColors[Math.abs(h)%avatarColors.length]; 
};

const StudyUniverseBackground = () => {
  return (
    <div className="study-universe-bg" style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: -5, pointerEvents: 'none', background: 'radial-gradient(circle at center, #0f0b29 0%, #050212 100%)' }}>
      <div className="stars-container">
        <div className="stars" />
        <div className="stars2" />
      </div>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', top: '-10%', left: '-10%', width: '500px', height: '500px' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, transparent 70%)', bottom: '-20%', right: '-10%', width: '600px', height: '600px' }} />
    </div>
  );
};

const WelcomeScreen = ({ authMode, setAuthMode, authUsername, setAuthUsername, authPassword, setAuthPassword, authError, setAuthError, handleAuth, onQuickSetup }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [step, setStep] = useState(() => {
    if (localStorage.getItem('planmaker_explicit_logout')) return 3;
    if (location.pathname === '/about') return 5;
    if (location.pathname === '/mission') return 6;
    if (location.pathname === '/blog') return 4;
    if (location.pathname === '/login') return 3;
    return 0;
  }); 

  useEffect(() => {
    if (location.pathname === '/') {
      setStep(0);
      document.title = "FocusMode | Hyper-Focused Study Universe";
    }
    else if (location.pathname === '/about') {
      setStep(5);
      document.title = "About Us | FocusMode";
    }
    else if (location.pathname === '/mission') {
      setStep(6);
      document.title = "Our Mission | FocusMode";
    }
    else if (location.pathname === '/blog') {
      setStep(4);
      document.title = "Study Tips & Blog | FocusMode";
    }
    else if (location.pathname === '/login') {
      setStep(3);
      document.title = "Login | FocusMode";
    }
  }, [location.pathname]);

  const handleNav = (path) => {
    navigate(path);
  };

  const [guestName, setGuestName] = useState('');

  if (step === 3) {
    return (
      <div className="auth-wrapper" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050510', zIndex: 1000, overflow: 'hidden' }}>
        <StudyUniverseBackground />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="glass auth-card" 
          style={{ position: 'relative', zIndex: 10, padding: 'clamp(1.5rem, 5vw, 3rem)', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', width: '100%', maxWidth: '420px', overflow: 'hidden' }}
        >
          {/* Animated border glow */}
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }} style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'conic-gradient(transparent, transparent, transparent, #8b5cf6)', zIndex: -1, opacity: 0.2 }} />
          <div style={{ position: 'absolute', inset: '1px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '23px', zIndex: -1 }} />

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.5rem', background: 'linear-gradient(to right, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Welcome</h1>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: '2rem' }}>Sign in to continue your journey.</p>
          
          <form className="auth-form" onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-group" style={{ position: 'relative' }}>
              <User size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#8b5cf6'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            <div className="input-group" style={{ position: 'relative' }}>
              <Lock size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '16px 16px 16px 48px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '1rem', outline: 'none', transition: 'all 0.3s' }} onFocus={(e) => e.target.style.borderColor = '#ec4899'} onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>
            {authError && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', margin: 0 }}>{authError}</motion.p>}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" style={{ width: '100%', padding: '16px', marginTop: '10px', background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' }}>
              {authMode === 'login' ? 'Login' : 'Create Account'}
            </motion.button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: '#a855f7', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
              {authMode === 'login' ? 'Sign up' : 'Log in'}
            </span>
          </p>
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
             <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => setStep(0)}>
               <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Welcome
             </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="welcome-container" style={{ position: 'fixed', inset: 0, overflowY: 'auto', overflowX: 'hidden', zIndex: 1000, background: '#050510' }}>
      <StudyUniverseBackground />

      <AnimatePresence mode="wait">
        
        {/* Landing Page Header */}
        {[0, 4, 5, 6].includes(step) && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <motion.header 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              style={{ padding: '8px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1000px', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.6)' }}
            >
              <Link to="/" style={{ textDecoration: 'none', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(139,92,246,0.3)' }}>
                  <Headphones size={16} color="#fff" />
                </div>
                <span style={{ background: 'linear-gradient(to right, #fff, #c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>FocusMode</span>
              </Link>
              <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <Link to="/mission" style={{ background: 'transparent', border: 'none', color: step === 6 ? '#c4b5fd' : '#94a3b8', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>{if(step!==6)e.target.style.color='#94a3b8'}}>Mission</Link>
                <Link to="/about" style={{ background: 'transparent', border: 'none', color: step === 5 ? '#c4b5fd' : '#94a3b8', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>{if(step!==5)e.target.style.color='#94a3b8'}}>About Us</Link>
                <Link to="/blog" style={{ background: 'transparent', border: 'none', color: step === 4 ? '#c4b5fd' : '#94a3b8', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s', cursor: 'pointer', textDecoration: 'none' }} onMouseOver={e=>e.target.style.color='#fff'} onMouseOut={e=>{if(step!==4)e.target.style.color='#94a3b8'}}>Blog</Link>
                <div style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.1)' }}></div>
                <Link to="/login" style={{ padding: '6px 16px', borderRadius: '100px', background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', border: 'none', color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(139,92,246,0.4)', textDecoration: 'none' }} onMouseOver={e=>{e.target.style.transform='scale(1.05)'}} onMouseOut={e=>{e.target.style.transform='scale(1)'}}>Login</Link>
              </nav>
            </motion.header>
          </div>
        )}

        {step === 0 && (
          <motion.main key="landing-page" initial="hidden" animate="visible" exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }} transition={{ duration: 0.8 }} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            
            {/* Hero Section */}
            <div className="welcome-step" style={{ margin: '0 auto', paddingTop: '80px', minHeight: '100vh', paddingBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', zIndex: 10, paddingLeft: 'clamp(1rem, 5vw, 2rem)', paddingRight: 'clamp(1rem, 5vw, 2rem)' }}>
            
            <motion.h1 
              variants={{ hidden: { opacity: 0, y: 30, filter: 'blur(12px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{ fontSize: 'clamp(2.5rem, 6vw, 5.5rem)', fontWeight: '800', lineHeight: 1.2, marginBottom: '2rem', letterSpacing: '-2px', textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
            >
              <span style={{ background: 'linear-gradient(to right, #fff, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', whiteSpace: 'nowrap' }}>Focus Mode Player</span>
            </motion.h1>
            
            <motion.p 
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              style={{ fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', color: '#94a3b8', maxWidth: '700px', marginBottom: '3.5rem', lineHeight: 1.6 }}
            >
              Your hyper-focused study universe. Step into deep work, destroy distractions, and conquer your goals.
            </motion.p>
            
            <motion.div variants={{ hidden: { opacity: 0, y: 20, scale: 0.95 }, visible: { opacity: 1, y: 0, scale: 1 } }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.5 }} style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139,92,246,0.6)' }} whileTap={{ scale: 0.95 }} 
                style={{ padding: '18px 40px', fontSize: '1.2rem', fontWeight: '700', borderRadius: '50px', background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                onClick={() => setStep(2)}
              >
                Start Journey <ArrowRight size={24} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.1)' }} whileTap={{ scale: 0.95 }} 
                style={{ padding: '18px 40px', fontSize: '1.2rem', fontWeight: '700', borderRadius: '50px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                onClick={() => setStep(3)}
              >
                Login
              </motion.button>
            </motion.div>
            </div>
          </motion.main>
        )}

        {step === 4 && (
          <motion.main key="blog-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} style={{ width: '100%', minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem', zIndex: 10 }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
              <button onClick={() => handleNav('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer', marginBottom: '2rem', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'}}>
                <ArrowRight size={16} style={{ transform: 'rotate(180deg)' }} /> Back to Home
              </button>
              <article>
                <Blog />
              </article>
            </div>
          </motion.main>
        )}

        {step === 6 && (
          <motion.main key="mission-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} style={{ width: '100%', minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem', zIndex: 10 }}>
            <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                 <BrainCircuit size={40} color="#c4b5fd" />
              </div>
              
              <h2 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>The Mission</h2>
              
              <p style={{ color: '#e2e8f0', fontSize: '1.4rem', lineHeight: 1.6, maxWidth: '800px', margin: '0 auto 4rem auto' }}>
                We built Focus Mode Player to revolutionize how you study by eliminating distractions and fighting student isolation.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
                  <Shield size={32} color="#a78bfa" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Ad-Free Lectures</h3>
                  <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>Reclaim your time from algorithmic feeds. Watch your educational content with zero interruptions and unyielding clarity.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
                  <Trophy size={32} color="#f472b6" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Gamified Learning</h3>
                  <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>Step into a hyper-focused study universe. We turn heavy study sessions into an engaging experience where conquering your goals feels like leveling up.</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2rem', textAlign: 'left' }}>
                  <Globe size={32} color="#60a5fa" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Fight Isolation</h3>
                  <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.6 }}>Deep work shouldn't mean feeling completely alone. Connect with a focused community and build accountability without the noise.</p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleNav('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 32px', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'}}>
                  <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Home
                </button>
                <motion.button 
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} 
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '1.1rem', fontWeight: '700', borderRadius: '100px', background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', border: 'none', color: 'white', cursor: 'pointer', boxShadow: '0 8px 20px rgba(139,92,246,0.4)' }}
                  onClick={() => handleNav('/setup')}
                >
                  Start Your Journey <ArrowRight size={18} />
                </motion.button>
              </div>
            </article>
          </motion.main>
        )}

        {step === 5 && (
          <motion.main key="about-page" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} style={{ width: '100%', minHeight: '100vh', paddingTop: '120px', paddingBottom: '4rem', zIndex: 10 }}>
            <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(20px)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
              
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
                 <Users size={40} color="#c4b5fd" />
              </div>
              
              <h2 style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-1px' }}>About Us</h2>
              
              <p style={{ color: '#e2e8f0', fontSize: '1.3rem', lineHeight: 1.8, marginBottom: '2rem', textAlign: 'left' }}>
                Focus Mode Player is a community-driven open source project designed to help students, developers, and creatives maximize their output without the noise of modern social platforms.
              </p>
              
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1.7, marginBottom: '3rem', textAlign: 'left' }}>
                By integrating scientifically proven deep work timers (like the Pomodoro technique) directly alongside ad-free, minimal content delivery, we guarantee an environment where true focus is not just possible, but inevitable.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleNav('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '16px 32px', borderRadius: '100px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>{e.currentTarget.style.background='rgba(255,255,255,0.1)'}} onMouseOut={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'}}>
                  <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Home
                </button>
              </div>
            </article>
          </motion.main>
        )}



        {step === 2 && (
          <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div key="setup" initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }} className="welcome-step" style={{ zIndex: 10 }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(25px)', border: '1px solid rgba(255,255,255,0.1)', padding: 'clamp(2rem, 5vw, 4rem) clamp(1.5rem, 5vw, 3rem)', borderRadius: '32px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: -150, left: -150, right: -150, bottom: -150, background: 'conic-gradient(from 0deg, transparent, transparent, transparent, rgba(139,92,246,0.1), transparent)', zIndex: -1, borderRadius: '50%', pointerEvents: 'none' }} />

              <div style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', padding: '20px', borderRadius: '50%', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(139,92,246,0.5)' }}>
                <User size={40} color="#fff" />
              </div>
              
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome, Aspirant!</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.1rem', marginBottom: '3rem', textAlign: 'center' }}>What should we call you?</p>
              
              <div style={{ width: '100%', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Enter your hero name..." 
                  value={guestName} 
                  onChange={e => setGuestName(e.target.value)} 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px 24px', fontSize: '1.2rem', color: '#fff', outline: 'none', transition: 'all 0.3s', textAlign: 'center' }}
                  onFocus={(e) => { e.target.style.borderColor = '#8b5cf6'; e.target.style.background = 'rgba(0,0,0,0.5)'; e.target.style.boxShadow = '0 0 20px rgba(139,92,246,0.3)'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.background = 'rgba(0,0,0,0.3)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem', width: '100%' }}>
                <button 
                  onClick={() => setStep(0)} 
                  style={{ padding: '16px', flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                >
                  Back
                </button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} 
                  disabled={!guestName.trim()} 
                  onClick={() => onQuickSetup(guestName)}
                  style={{ padding: '16px', flex: 2, background: 'linear-gradient(45deg, #8b5cf6, #ec4899)', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '1.1rem', fontWeight: 700, cursor: guestName.trim() ? 'pointer' : 'not-allowed', opacity: guestName.trim() ? 1 : 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: guestName.trim() ? '0 10px 25px rgba(139,92,246,0.4)' : 'none' }}
                >
                  Dive In <ArrowRight size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  // Global States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bgTheme, setBgTheme] = useState(() => localStorage.getItem('pm_bgTheme') || 'solid-dark-bg');

  useEffect(() => {
    const bgElement = document.getElementById('app-background');
    if (bgElement) {
      bgElement.className = bgTheme;
      localStorage.setItem('pm_bgTheme', bgTheme);
      const nebulae = bgElement.querySelectorAll('.nebula');
      nebulae.forEach(n => {
        n.style.display = bgTheme === 'solid-dark-bg' || bgTheme === 'mesh-bg' ? 'none' : 'block';
      });
    }
  }, [bgTheme]);

  const [activeCommunityTab, setActiveCommunityTab] = useState('chat');
  const [squadMissions, setSquadMissions] = useState(() => { try { return JSON.parse(localStorage.getItem('pm_squads')) || [{ id: '1', admin: 'FocusMode', title: 'Complete Calculus Integration', desc: 'Solve all PYQs and read theory.', target: 100, members: [{user: 'FocusMode', progress: 85}, {user: 'TestUser', progress: 40}] }]; } catch { return []; } });
  const [activeChat, setActiveChat] = useState('global');
  const [chatInput, setChatInput] = useState('');
  const [activeSubreddit, setActiveSubreddit] = useState('All');
  const [communitySearch, setCommunitySearch] = useState('');
  const [joinedCommunities, setJoinedCommunities] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_communities') || '[]'); } catch { return []; }
  });
  const [usersDb, setUsersDb] = useState({});
  const [sessionUser, setSessionUser] = useState(null); 
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({ name: '', prepType: '', targetYear: '' });

  // Derived User State
  const currentUserProfile = usersDb[sessionUser]?.profile;
  const currentXP = currentUserProfile?.xp || 0;

  // ── Real-time Community (Gun.js) ──────────────────────────────────────────
  const {
    posts: feed,
    isLoading: isCommunityLoading,
    postMessage: gunPostMessage,
    toggleReaction: gunToggleReaction,
    toggleLike: gunToggleLike,
    addComment: gunAddComment,
    deletePost: gunDeletePost,
    bannedUsers,
    banUser,
    unbanUser,
    removeUser,
    purgeUserPosts,
    cleanupGuestUsers,
  } = useCommunity(sessionUser, currentXP, currentUserProfile?.prepType);

  const [profileActiveTab, setProfileActiveTab] = useState('badges'); // 'badges' | 'stats' | 'theme'
  const [lastCommunityVisit, setLastCommunityVisit] = useState(() => {
    try {
      const stored = localStorage.getItem('pm_last_community_visit');
      return stored ? Number(stored) : Date.now();
    } catch {
      return Date.now();
    }
  });

  // Calculate unread community messages for badge counter (shows 1 when someone messages)
  const unreadCommunityCount = useMemo(() => {
    if (!feed || !sessionUser || activeTab === 'community') return 0;
    const newMsgs = feed.filter(f => {
      if (!f.createdAt || f.user === sessionUser) return false;
      if (f.createdAt <= lastCommunityVisit) return false;
      if (!f.action?.startsWith('@DM_')) return true; // Global lounge post
      const otherUser = getDmOtherUser(f.action, sessionUser);
      return isDmBetween(f.action, sessionUser, otherUser);
    });
    return newMsgs.length;
  }, [feed, sessionUser, activeTab, lastCommunityVisit]);

  // Keep lastCommunityVisit fresh when activeTab is community
  useEffect(() => {
    if (activeTab === 'community') {
      const now = Date.now();
      setLastCommunityVisit(now);
      try { localStorage.setItem('pm_last_community_visit', now.toString()); } catch {}
    }
  }, [activeTab]);

  // Instagram Chat States
  const [replyingTo, setReplyingTo] = useState(null);
  const [heartBurstId, setHeartBurstId] = useState(null);
  const [activeEmojiBarId, setActiveEmojiBarId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userNote, setUserNote] = useState(() => {
    try { return localStorage.getItem('pm_user_note') || 'Deep Work ⚡'; } catch { return 'Deep Work ⚡'; }
  });

  const [showPeerPicker, setShowPeerPicker] = useState(false);
  const [peerSearchQuery, setPeerSearchQuery] = useState('');
  const [aspirantSearchQuery, setAspirantSearchQuery] = useState('');
  const [aspirantFilterExam, setAspirantFilterExam] = useState('all');
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [modSearch, setModSearch] = useState('');
  const [modFilterTab, setModFilterTab] = useState('all');
  const [customBanInput, setCustomBanInput] = useState('');
  
  // Deep Study & Zen Mode States
  const [isZenMode, setIsZenMode] = useState(false);
  const [showDoubtModal, setShowDoubtModal] = useState(false);
  const [doubtSubject, setDoubtSubject] = useState('Physics');
  const [doubtQuestion, setDoubtQuestion] = useState('');
  const [doubtHint, setDoubtHint] = useState('');

  // Dashboard Tab State ('overview' | 'syllabus' | 'week')
  const [dashboardTab, setDashboardTab] = useState('overview');

  // Planner Mobile Day Tab State
  const [selectedPlannerDay, setSelectedPlannerDay] = useState(() => {
    return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()] || 'Mon';
  });

  // Journal Tab State ('reflect' | 'mistakes' | 'history')
  const [journalTab, setJournalTab] = useState('reflect');
  const [mistakesList, setMistakesList] = useState(() => {
    try {
      const saved = localStorage.getItem(`pm_mistakes_${sessionUser}`);
      if (saved) return JSON.parse(saved);
      return [
        { id: 'm1', date: 'Yesterday', subject: 'Physics', category: 'Formula Slip 📐', problem: 'Forgot minus sign in Lenz law induced emf expression', fix: 'e = -dΦ/dt represents opposition to flux change. Always double check sign!', resolved: true },
        { id: 'm2', date: 'Today', subject: 'Mathematics', category: 'Calculation Mistake 🔢', problem: 'Arithmetic error when expanding (x-2)^3 in integration by parts', fix: 'Write intermediate expansion terms carefully on rough sheet before substituting', resolved: false }
      ];
    } catch {
      return [];
    }
  });
  const [newMistakeSubject, setNewMistakeSubject] = useState('Physics');
  const [newMistakeCategory, setNewMistakeCategory] = useState('Silly Error 🤦‍♂️');
  const [newMistakeProblem, setNewMistakeProblem] = useState('');
  const [newMistakeFix, setNewMistakeFix] = useState('');

  // Study Connect - Omegle Educational Matchmaker States
  const [isMatchingBuddy, setIsMatchingBuddy] = useState(false);
  const [matchedBuddy, setMatchedBuddy] = useState(null);
  const [buddyFilterTopic, setBuddyFilterTopic] = useState('All');
  const [peerMessages, setPeerMessages] = useState([]);
  const [peerChatInput, setPeerChatInput] = useState('');
  
  const firebaseUsers = useFirebaseUsers();

  useEffect(() => {
    if (sessionUser && usersDb[sessionUser]) {
      syncUserToFirebase(sessionUser, usersDb[sessionUser].profile);
    }
  }, [sessionUser, usersDb]);

  // ── Scheduled Events (Firebase) ──────────────────────────────────────────
  const { events: studyEvents, isLoading: isEventsLoading, createEvent, joinEvent, deleteEvent } = useEvents(sessionUser);
  const { permission: pushPermission, requestPermission: requestPushPermission, showLocalNotification } = usePushNotifications(sessionUser);

  const prevFeedLengthRef = useRef(0);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('');
  const [newEventDuration, setNewEventDuration] = useState('');

  // Auth Form State
  const [authMode, setAuthMode] = useState('login'); 
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Auth Wall State (For upgrading guests)
  const [showAuthWall, setShowAuthWall] = useState(false);
  const [authWallMsg, setAuthWallMsg] = useState('');

  // Onboarding State
  const [onboardPrep, setOnboardPrep] = useState('');
  const [onboardYear, setOnboardYear] = useState('');
  const [onboardWeakness, setOnboardWeakness] = useState('');

  // Dashboard State
  const [subjects, setSubjects] = useState([]);
  const [expandedSubjects, setExpandedSubjects] = useState([]);
  const [progress, setProgress] = useState(0);
  
  // Tasks/Journal

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [learnedText, setLearnedText] = useState('');
  const [mistakesText, setMistakesText] = useState('');
  const [journalHistory, setJournalHistory] = useState([]);
  const [todayMood, setTodayMood] = useState('😐'); // Default mood

  // Lectures State
  const [playlist, setPlaylist] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  

  // Community State (real-time feed is wired via useCommunity hook after render)
  const [newPostText, setNewPostText] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);
  const [commentingOn, setCommentingOn] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Study Connect State
  const [connectRoom, setConnectRoom] = useState(null);
  const [customRoomName, setCustomRoomName] = useState('');
  const [inCall, setInCall] = useState(false);
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  // Video Notes State
  const [videoNotes, setVideoNotes] = useState({}); // { videoId: noteText }
  const [activeNoteVideoId, setActiveNoteVideoId] = useState(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('pomodoro');

  // UI Toast State
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimeoutRef = useRef(null);

  // ── STUDY STREAK STATE ────────────────────────────────────────────────────
  const [studyStreak, setStudyStreak] = useState(0);
  const [lastStudyDate, setLastStudyDate] = useState(null);
  const [showStreakAnimation, setShowStreakAnimation] = useState(false);

  // ── STUDY PLANNER STATE ───────────────────────────────────────────────────
  const [plannerTasks, setPlannerTasks] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_planner') || '{}'); } catch { return {}; }
  });
  const [plannerTab, setPlannerTab] = useState('weekly');
  const [plannerInput, setPlannerInput] = useState('');
  const [plannerDay, setPlannerDay] = useState('Mon');
  const [plannerTime, setPlannerTime] = useState('09:00');
  const [plannerSubject, setPlannerSubject] = useState('');

  // ── VIDEO RESUME STATE ────────────────────────────────────────────────────
  const [videoProgress, setVideoProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_vidprogress') || '{}'); } catch { return {}; }
  });
  const videoIframeRef = useRef({});
  const videoTopRef = useRef(null);

  // ── SYLLABUS CHECKLIST STATE ──────────────────────────────────────────────
  const [syllabusChecked, setSyllabusChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pm_syllabus') || '{}'); } catch { return {}; }
  });

  // AI Assistant State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: "Hey! I am your AI Advisor. Struggling with a topic, feeling stressed, or need a study strategy? Let's talk!" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (activeTab === 'community' && activeCommunityTab === 'chat' && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [feed, activeChat, activeTab, activeCommunityTab]);



  // Push Notifications: fire local notification when a new message arrives in community
  useEffect(() => {
    if (!feed || !sessionUser) return;
    const globalMsgs = feed.filter(f => !f.action?.startsWith('@DM_'));
    if (prevFeedLengthRef.current === 0) {
      prevFeedLengthRef.current = globalMsgs.length;
      return;
    }
    if (globalMsgs.length > prevFeedLengthRef.current) {
      const newest = globalMsgs[globalMsgs.length - 1];
      if (newest && newest.user !== sessionUser && document.hidden) {
        showLocalNotification('New message in Global Lounge', `${newest.user}: ${newest.action?.substring(0, 60)}`, 'community-msg');
      }
    }
    prevFeedLengthRef.current = globalMsgs.length;
  }, [feed, sessionUser, showLocalNotification]);

  // Deep Linking for Study Rooms
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setConnectRoom(roomParam);
      setInCall(true);
      setActiveTab('connect');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const shareToWhatsApp = (roomId, eventTitle = null) => {
    const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomId)}`;
    const text = eventTitle 
      ? `Join my live study event "${eventTitle}" on Student Mesh! 🚀\n\nClick here to join the live video call: ${url}`
      : `Join my private Study Connect room on Student Mesh! 🚀\n\nClick here to join the live video call: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    if (aiOpen && aiEndRef.current) {
      aiEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, aiOpen, aiTyping]);

  // AI Drag State
  const [aiPosition, setAiPosition] = useState({ x: 0, y: 0 });
  const [isAiDragging, setIsAiDragging] = useState(false);
  const aiDragStart = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!aiDragStart.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      setAiPosition({
        x: clientX - aiDragStart.current.startX,
        y: clientY - aiDragStart.current.startY
      });
    };
    const handleMouseUp = () => { 
      aiDragStart.current = null; 
      setIsAiDragging(false);
    };
    if (aiOpen) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [aiOpen]);

  const handleAiDragStart = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    aiDragStart.current = { startX: clientX - aiPosition.x, startY: clientY - aiPosition.y };
    setIsAiDragging(true);
  };

  const askAIDoubt = (doubtText) => {
    if (!doubtText.trim()) return;
    setAiOpen(true);
    setAiInput(doubtText);
    setTimeout(async () => {
      setAiMessages(prev => [...prev, { role: 'user', text: doubtText }]);
      setAiInput('');
      setAiTyping(true);
      const response = await getAIAdvice(doubtText, currentUserProfile?.prepType);
      setTimeout(() => {
        setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
        setAiTyping(false);
      }, 500);
    }, 100);
  };

  const getAIAdvice = async (text, prepType, conversationHistory = []) => {
    const t = text.toLowerCase().trim();
    const ctx = conversationHistory.slice(-4).map(m => m.text?.toLowerCase()).join(' ');

    // ── GREETINGS ──────────────────────────────────────────────────────────────
    if (t.match(/^(hi|hello|hey|yo|sup|heyy|hiii|helloo|namaste|hola|what'?s up|good morning|good evening|good afternoon|gm|ge)[\s!?.]*$/)) {
      const greets = [
        `Hey! 👋 I'm FocusBot — your AI study partner. I'm trained on JEE, NEET, UPSC and general exam strategy. Ask me anything: a concept, a topic you're stuck on, study tips, or even just how to feel less overwhelmed. What's on your mind?`,
        `Hello! 🧠 Great to see you here. I can help you understand tough concepts, build better study habits, or just talk through what you're struggling with. What subject or problem can I help you crush today?`,
        `Namaste! 🙏 I'm your AI advisor. Whether it's Newton's laws, Organic Chemistry, Indian Polity, or just how to stay consistent — I've got you. What do you want to tackle first?`,
      ];
      return greets[Math.floor(Math.random() * greets.length)];
    }

    // ── HOW ARE YOU / SMALL TALK ───────────────────────────────────────────────
    if (t.match(/how are you|how r u|you ok|you good|what are you|who are you|tell me about yourself/)) {
      return `I'm FocusBot — always running at 100%, optimized for your success! 🤖⚡ I'm an AI built specifically for competitive exam aspirants. I know JEE Physics, Chemistry & Maths, NEET Biology, UPSC topics, study science, and general Q&A. I remember our conversation context too, so feel free to ask follow-up questions naturally. What do you need help with?`;
    }

    // ── THANKS / APPRECIATION ─────────────────────────────────────────────────
    if (t.match(/^(thank|thanks|thx|ty|great|awesome|nice|helpful|perfect|got it|okay|ok|understood|clear|makes sense)[\s!.]*$/)) {
      return `You're welcome! 😊 That's what I'm here for. Got another question? Ask away — whether it's a concept, a problem, or just study advice!`;
    }

    // ── ABOUT APP / FOCUSMODE ─────────────────────────────────────────────────
    if (t.match(/what is this (app|website)|about (planmaker|focusmodeplayer|focusmode)|who created (you|this)|how to use this|what can i do here/)) {
      return `Welcome to **Focus Mode Player**! 🚀 This is the ultimate study dashboard for JEE, NEET & UPSC aspirants. Here's what you can do:\n\n1. **Plan:** Track daily tasks, study modules, and track your syllabus progress.\n2. **Journal:** Write daily reflections and download your notes.\n3. **Lectures:** Add YouTube links to watch ad-free without distractions.\n4. **Connect:** Join P2P video study rooms with other students.\n5. **Community:** Share updates and ask questions in real-time!\n\nI'm FocusBot, your AI guide. Let me know if you need help!`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── PHYSICS TOPICS ────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (t.match(/newton'?s law|force and motion|inertia|momentum|impulse/)) {
      return `**Newton's Laws of Motion** 🎯\n\n**1st Law (Inertia):** An object stays at rest or moves with constant velocity unless acted upon by a net external force. Key: *inertia depends only on mass, not on speed.*\n\n**2nd Law:** F = ma. Net force = mass × acceleration. This is the most calculation-heavy law — practice drawing Free Body Diagrams (FBDs) for every problem.\n\n**3rd Law:** Every action has an equal and opposite reaction. Forces always act in *pairs* on *different objects*.\n\n**JEE Pro Tip:** Most Newton's law problems involve constraints — pulleys, wedges, and strings. Master constraint equations first. Practice: HC Verma Ch.5, 6.`;
    }

    if (t.match(/gravitat|gravity|kepler|satellite|orbital|escape velocity|g = |universal law/)) {
      return `**Gravitation** 🌍\n\nKey Formulas:\n• F = Gm₁m₂/r² (Newton's Law)\n• g = GM/R² (surface gravity)\n• Escape velocity = √(2gR) ≈ 11.2 km/s for Earth\n• Orbital velocity = √(GM/r)\n• T² ∝ r³ (Kepler's 3rd Law)\n\n**Common Mistakes:**\n❌ Confusing orbital velocity with escape velocity\n❌ Using g = 9.8 where they should use GM/r²\n\n**High-Yield for JEE:** Satellite energy (KE, PE, Total), geostationary orbits, variation of g with height/depth/latitude.\n\nPractice: NCERT + DC Pandey Chapter on Gravitation.`;
    }

    if (t.match(/electro(stat|magnet|dynamic)|coulomb|electric field|gauss|capacitor|current|resistance|ohm|kirchhoff|faraday|lenz|inductor|transformer/)) {
      return `**Electrostatics & Electromagnetism** ⚡\n\nThis is the **highest-weightage topic in JEE Physics** (15-20% of questions).\n\n**Key Concepts:**\n• Coulomb's Law: F = kq₁q₂/r²\n• Electric Field (E) — use superposition principle\n• Gauss's Law: ∮E·dA = q_enc/ε₀ — powerful for symmetric charge distributions\n• Capacitors: Series (1/C_eq = Σ1/C), Parallel (C_eq = ΣC)\n• Kirchhoff's Laws: KCL (currents), KVL (voltages)\n• Faraday's Law: EMF = -dΦ/dt\n\n**FocusBot Strategy:** Do all NCERT examples + H.C. Verma exercises for this chapter BEFORE any other resources. This one chapter can change your rank significantly. 🏆`;
    }

    if (t.match(/wave|sound|doppler|standing wave|resonan|superposit|diffract|interfer|young'?s|snell|refract|lens|mirror|optic/)) {
      return `**Waves & Optics** 🌊🔬\n\n**Sound Waves:**\n• Speed of sound in air ≈ 332 m/s (0°C); increases with temperature\n• Doppler Effect: f' = f(v ± v_observer)/(v ∓ v_source)\n• Standing Waves: nodes (zero amplitude) & antinodes (max amplitude)\n\n**Optics:**\n• Mirror formula: 1/f = 1/v + 1/u\n• Lens formula: 1/f = 1/v - 1/u\n• Snell's Law: n₁sinθ₁ = n₂sinθ₂\n• Young's Double Slit: fringe width β = λD/d\n\n**JEE Tip:** Ray optics problems often combine mirrors + lenses. Practice equivalent focal length problems. Refraction is very frequently tested.`;
    }

    if (t.match(/thermodynamic|heat|entropy|carnot|first law|second law|isothermal|adiabatic|isobaric|isochoric|pv diagram|kinetic theory|ideal gas/)) {
      return `**Thermodynamics & Kinetic Theory** 🔥\n\n**First Law:** ΔU = Q - W (Energy is conserved)\n**Second Law:** Heat flows from hot to cold; entropy of universe always increases.\n\n**Key Processes (PV diagrams are CRUCIAL!):**\n• Isothermal: T constant → PV = constant\n• Adiabatic: Q = 0 → PVᵞ = constant\n• Isobaric: P constant → W = PΔV\n• Isochoric: V constant → W = 0, Q = ΔU\n\n**Carnot Efficiency:** η = 1 - T_cold/T_hot (maximum possible)\n\n**KTM:** KE per molecule = (3/2)kT; rms speed = √(3RT/M)\n\n**JEE Tip:** Focus heavily on PV diagrams — recognize process shapes and calculate Work = area under curve.`;
    }

    if (t.match(/modern physics|photoelectric|einstein|de broglie|bohr|hydrogen|atomic|nuclear|radioact|half.?life|fission|fusion/)) {
      return `**Modern Physics** ⚛️\n\n**Photoelectric Effect (Einstein):**\n• KE_max = hν - φ (φ = work function)\n• Threshold frequency: ν₀ = φ/h\n\n**Bohr's Model (Hydrogen):**\n• Energy of nth orbit: Eₙ = -13.6/n² eV\n• Radius: rₙ = 0.529n² Å\n• For transitions: ΔE = 13.6(1/n₁² - 1/n₂²) eV\n\n**De Broglie Wavelength:** λ = h/mv = h/p\n\n**Nuclear Physics:**\n• Radioactive decay: N = N₀e^(-λt)\n• Half-life: t½ = 0.693/λ\n• Q-value = (mass of reactants - mass of products)c²\n\n**JEE Tip:** Bohr's model and Photoelectric effect together appear almost every year. Master the energy level diagram.`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── CHEMISTRY TOPICS ──────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (t.match(/organic chem|carbon compound|alkane|alkene|alkyne|aromatic|benzene|isomer|nomenclature|iupac|functional group/)) {
      return `**Organic Chemistry Fundamentals** 🧪\n\n**Strategy:** Don't memorize reactions — understand *why* they happen using electron pushing (curved arrow mechanism).\n\n**Key Functional Groups to master first:**\nAlcohols (-OH) → Aldehydes/Ketones (C=O) → Carboxylic Acids (-COOH) → Amines (-NH₂)\n\n**Most Important Reactions for JEE/NEET:**\n• SN1 vs SN2 (substitution) — depends on substrate & nucleophile strength\n• E1 vs E2 (elimination) — Zaitsev's rule\n• Addition to C=C (Markovnikov's rule)\n• Aldol condensation, Cannizzaro, Grignard reagent\n\n**Learning Method:** For each reaction, draw the mechanism step-by-step until you can do it from memory. Then solve 10 problems applying it.`;
    }

    if (t.match(/physical chem|mole concept|stoichiometr|equilibrium|le chatelier|acid.?base|ph|buffer|electrochemistry|electrode|nernst|colligative/)) {
      return `**Physical Chemistry** ⚗️\n\n**Mole Concept:** The foundation of all chemistry. Master mole-mole, mole-mass, limiting reagent problems first.\n\n**Chemical Equilibrium:**\n• Kc = [products]/[reactants] (molar concentrations)\n• Le Chatelier's Principle: system opposes any change to restore equilibrium\n• Q vs K: if Q < K → reaction proceeds forward\n\n**Acids & Bases:**\n• pH = -log[H⁺]; pOH = -log[OH⁻]; pH + pOH = 14\n• Buffer: resists pH change — Henderson-Hasselbalch: pH = pKa + log([A⁻]/[HA])\n\n**Electrochemistry:**\n• Nernst Equation: E = E° - (RT/nF)lnQ\n• Faraday's Laws: mass deposited ∝ charge passed\n\n**JEE Tip:** Physical Chemistry is the most formula-heavy. Make a formula sheet and revise daily.`;
    }

    if (t.match(/inorganic|periodic table|s block|p block|d block|f block|transition metal|coordination compound|crystal field|valence bond|hybridiz|vsepr/)) {
      return `**Inorganic Chemistry** 🔩\n\n**Periodic Table Trends (must memorize):**\n• Atomic radius: decreases → across period, increases ↓ group\n• Ionization Energy: increases →, decreases ↓\n• Electronegativity: F is highest (3.98)\n\n**Hybridization & VSEPR:**\n• sp: linear (180°) — CO₂, BeCl₂\n• sp²: trigonal planar (120°) — BF₃\n• sp³: tetrahedral (109.5°) — CH₄; bent if lone pairs (H₂O)\n\n**Coordination Compounds:**\n• Oxidation state, coordination number, ligand types (mono, bi, polydentate)\n• Crystal Field Theory: strong field = low spin; weak field = high spin\n\n**Inorganic Strategy:** Pure memory here. Use flashcards + mnemonics. Spend 15 mins every morning on one p-block group.`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── MATHS TOPICS ─────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (t.match(/calculus|differentiat|integrat|limit|continuity|derivative|rolle|lagrange|mvt/)) {
      return `**Calculus** 📐\n\n**Limits:** L'Hôpital's rule for 0/0 or ∞/∞ forms. Key limits: lim(sinx/x)=1, lim((1+1/n)^n)=e\n\n**Differentiation:**\n• Chain rule: d/dx[f(g(x))] = f'(g(x))·g'(x)\n• Product rule: (uv)' = u'v + uv'\n• Quotient rule: (u/v)' = (u'v - uv')/v²\n\n**Integration:**\n• Standard forms, substitution, integration by parts: ∫udv = uv - ∫vdu\n• Definite integrals: use LIATE rule for by-parts order\n• Area between curves: ∫|f(x) - g(x)|dx\n\n**JEE High-Yield:** Definite integrals with properties (∫₀ᵃ f(a-x)dx tricks), and application of derivatives (maxima/minima, tangent/normal).`;
    }

    if (t.match(/trigonometr|sin|cos|tan|cot|sec|cosec|inverse trig|arcsin|arccos|arctan|compound angle|multiple angle/)) {
      return `**Trigonometry** 📏\n\n**Fundamental Identities:**\n• sin²θ + cos²θ = 1\n• 1 + tan²θ = sec²θ\n• 1 + cot²θ = cosec²θ\n\n**Compound Angles:**\n• sin(A±B) = sinAcosB ± cosAsinB\n• cos(A±B) = cosAcosB ∓ sinAsinB\n• tan(A±B) = (tanA ± tanB)/(1 ∓ tanAtanB)\n\n**Key Values to memorize:** sin30°=½, sin45°=1/√2, sin60°=√3/2\n\n**Inverse Trig:** Domain restrictions are critical — sin⁻¹ is defined on [-π/2, π/2], cos⁻¹ on [0, π].\n\n**JEE Tip:** Trigonometric equations and inequalities appear frequently. Practice finding general solutions: sinx = k → x = nπ + (-1)ⁿ·sin⁻¹k.`;
    }

    if (t.match(/probability|permutation|combination|binomial|bayes|conditional|random variable/)) {
      return `**Probability, Permutation & Combination** 🎲\n\n**Counting:**\n• nPr = n!/(n-r)! (ordered arrangements)\n• nCr = n!/[r!(n-r)!] (unordered selections)\n• Key trick: identical objects → divide by repetition factorial\n\n**Probability:**\n• P(A∪B) = P(A) + P(B) - P(A∩B)\n• Conditional: P(A|B) = P(A∩B)/P(B)\n• Bayes' Theorem: P(A|B) = P(B|A)·P(A)/P(B)\n• Independent events: P(A∩B) = P(A)·P(B)\n\n**Binomial Distribution:** P(X=r) = nCr·pʳ·(1-p)^(n-r)\n\n**JEE Tip:** Always ask: "Is order important?" → Yes = Permutation, No = Combination. Most mistakes happen here.`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── BIOLOGY (NEET) ───────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (t.match(/cell (biology|division|cycle|organelle|membrane|wall)|mitosis|meiosis|prokaryot|eukaryot/)) {
      return `**Cell Biology** 🔬\n\n**Cell Types:**\n• Prokaryotic (bacteria): no membrane-bound nucleus, smaller (70S ribosomes)\n• Eukaryotic (plants, animals, fungi): membrane-bound nucleus (80S ribosomes)\n\n**Cell Division:**\n• **Mitosis** (PMAT): Prophase, Metaphase, Anaphase, Telophase → 2 identical daughter cells (growth & repair)\n• **Meiosis**: 2 rounds → 4 genetically unique cells (gametes); crossing-over in Prophase I creates genetic diversity\n\n**Key Organelles:**\n• Mitochondria: ATP production (powerhouse) — has own DNA\n• Chloroplast: Photosynthesis — has own DNA\n• Ribosome: Protein synthesis (site of translation)\n• ER: Rough (ribosomes, protein synthesis), Smooth (lipid synthesis)\n\n**NEET Tip:** Cell biology is ~10-15% of NEET. Focus on differences between plant and animal cells, and the stages of mitosis/meiosis.`;
    }

    if (t.match(/photosynthesis|light reaction|dark reaction|calvin cycle|chlorophyll|c3|c4|cam plant|transpiration|respiration|krebs|glycolysis|electron transport/)) {
      return `**Plant Physiology (Photosynthesis & Respiration)** 🌱\n\n**Photosynthesis:**\n• **Light Reactions** (Thylakoid): Water splits → O₂ released, ATP & NADPH produced\n• **Calvin Cycle/Dark Reactions** (Stroma): CO₂ fixed → Glucose (G3P)\n• C3 plants: first product = 3-PGA (e.g., wheat, rice)\n• C4 plants: first product = oxaloacetate (e.g., maize, sugarcane) — more efficient\n• CAM plants: open stomata at night (e.g., cacti) — water-saving\n\n**Cellular Respiration:**\n• Glycolysis (cytoplasm): Glucose → 2 Pyruvate + 2 ATP\n• Krebs Cycle (mitochondrial matrix): 2 ATP per glucose\n• ETC (inner membrane): 34 ATP per glucose\n• **Total aerobic: ~38 ATP**; Anaerobic (fermentation): 2 ATP only\n\n**NEET Tip:** Draw the full diagram of photosynthesis and respiration. Questions often ask about the location of specific steps.`;
    }

    if (t.match(/genetics|mendel|heredity|dna|rna|replication|transcription|translation|mutation|chromosome|punnett|allele|dominant|recessive|codominan/)) {
      return `**Genetics & Molecular Biology** 🧬\n\n**Mendel's Laws:**\n• Law of Segregation: alleles separate during gamete formation\n• Law of Independent Assortment: genes on different chromosomes assort independently\n\n**DNA Replication:** Semi-conservative — each new DNA has one old + one new strand. Enzyme: DNA Polymerase III (adds nucleotides 5'→3')\n\n**Central Dogma:** DNA → (Transcription) → mRNA → (Translation) → Protein\n\n**Codons:** 64 codons, 61 code amino acids, 3 are stop codons (UAA, UAG, UGA). Start codon: AUG (Methionine)\n\n**Punnett Square Tip:** For 2 genes: 9:3:3:1 ratio (dihybrid cross). Memorize deviations: Epistasis, Incomplete dominance, Codominance.\n\n**NEET Tip:** Genetics = 18+ questions. Master crosses, linkage, and sex-linked inheritance.`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── UPSC TOPICS ──────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (t.match(/indian constitution|polity|fundamental right|directive principle|dpsp|parliament|president|governor|article \d|judiciary|preamble/)) {
      return `**Indian Polity (UPSC)** ⚖️\n\n**Preamble:** Sovereign, Socialist, Secular, Democratic, Republic — (Socialist & Secular added by 42nd Amendment 1976)\n\n**Fundamental Rights (Part III, Art 12-35):**\n• Art 14: Equality before law\n• Art 19: 6 freedoms (speech, assembly, movement, etc.)\n• Art 21: Right to Life & Personal Liberty (most litigated)\n• Art 32: Right to Constitutional Remedies (Dr. Ambedkar called it the "heart & soul")\n\n**DPSP (Part IV, Art 36-51):** Non-justiciable but fundamental to governance. Key: Art 44 (Uniform Civil Code), Art 45 (Early childhood education)\n\n**Parliament:** Lok Sabha (max 552 members), Rajya Sabha (max 250). Money Bills only in Lok Sabha.\n\n**UPSC Tip:** Read Laxmikant cover-to-cover. Focus on Constitutional Amendments (42nd, 44th, 73rd, 74th, 86th, 91st) — they always appear in Prelims.`;
    }

    if (t.match(/history|ancient india|medieval|mughal|british|freedom struggle|independence|gandhi|nehru|revolt 1857|colonial/)) {
      return `**Indian History (UPSC)** 📜\n\n**Ancient India:**\n• Indus Valley Civilization (2600-1900 BCE): Harappa, Mohenjo-daro — urban planning, no iron\n• Vedic Period: Rig Veda (oldest), Varna system, Sabha & Samiti\n• Mauryan Empire: Chandragupta → Bindusara → Ashoka (Kalinga War, Dhamma)\n• Gupta Period: Golden Age — Aryabhata, Kalidasa, decimal system\n\n**Medieval India:**\n• Delhi Sultanate → Mughal Empire (Babur to Aurangzeb)\n• Bhakti & Sufi movements — social reform\n\n**Modern India / Freedom Struggle:**\n• 1857 Revolt → 1885 INC founded → Partition of Bengal 1905 → Non-Cooperation (1920) → Civil Disobedience (1930 Salt March) → Quit India (1942) → Independence 1947\n\n**UPSC Tip:** For Prelims, focus on art & culture, dynasties, and dates. For Mains, focus on causes, socio-economic impacts, and personalities.`;
    }

    if (t.match(/geography|climate|monsoon|river|mountain|soil|vegetation|natural resource|latitude|longitude|continent|ocean|plate tectonic|earthquake|volcano/)) {
      return `**Geography (UPSC/General)** 🌏\n\n**Indian Geography:**\n• 5 physiographic divisions: Himalayas, Northern Plains, Peninsular Plateau, Coastal Plains, Islands\n• Major Rivers: Himalayan (perennial — Ganga, Yamuna, Brahmaputra), Peninsular (seasonal — Godavari, Krishna)\n• Monsoon: SW Monsoon (Jun-Sep) — Arabian Sea + Bay of Bengal branches\n\n**Climate Zones:** Tropical Wet, Tropical Dry, Subtropical Humid, Mountain\n\n**World Geography:**\n• Largest continent: Asia; Smallest: Australia\n• Deepest ocean trench: Mariana Trench (Pacific)\n• Plate Tectonics: Convergent (mountains/trenches), Divergent (rifts/ridges), Transform (earthquakes)\n\n**UPSC Tip:** NCERTs (Class 6-12 Geography) are essential. Maps are critical — practice locating rivers, mountains, national parks, and passes on a blank map.`;
    }

    if (t.match(/economy|gdp|inflation|fiscal policy|monetary policy|rbi|budget|banking|poverty|agriculture|current account|balance of payment/)) {
      return `**Indian Economy (UPSC)** 💹\n\n**Key Concepts:**\n• GDP = C + I + G + (X-M) — Consumption + Investment + Government + Net Exports\n• Inflation measured by CPI (Consumer Price Index) — RBI target: 4% ±2%\n• Repo Rate: rate at which RBI lends to banks (tool to control inflation)\n• Fiscal Deficit = Total Expenditure - Total Revenue (excl. borrowings)\n\n**Key Bodies:**\n• RBI: Monetary policy, currency, banking regulation\n• SEBI: Stock market regulator\n• NITI Aayog: Policy think tank (replaced Planning Commission in 2015)\n\n**Agriculture:** ~14% of GDP but employs ~50% workforce. Green Revolution, MSP, PM-KISAN.\n\n**UPSC Tip:** Read Economic Survey + Union Budget summary every year. Follow The Hindu/Indian Express economy section for current events.`;
    }

    if (t.match(/current affairs|news|recent|2024|2025|2026|today|latest/)) {
      return `**Current Affairs Strategy (UPSC)** 📰\n\nI don't have real-time internet access, so I can't give today's news. But here's the *best strategy* for current affairs:\n\n**Daily Routine:**\n• Read **The Hindu** or **Indian Express** (30-45 min) — focus on editorial + national/international\n• Take notes on: Government schemes, SC judgments, international summits, awards, reports, indices\n\n**Monthly:**\n• Read **Vision IAS or Insights monthly current affairs PDF** (free online)\n• Focus: Economy, Environment, Science & Tech, IR, Governance\n\n**For UPSC Prelims:** Current affairs of the last 12-18 months before the exam are most relevant.\n\n**Tools:** Use the Community tab here to discuss news with fellow aspirants! 💬`;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ── STUDY SCIENCE & PRODUCTIVITY ─────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────

    if (t.match(/distract|phone|reel|tiktok|instagram|procrastinat|can't (study|focus)|lazy|keep (checking|scrolling)|doom.?scroll/)) {
      return `**Beating Distraction** 📵\n\nYour phone is engineered by billion-dollar companies to hijack your dopamine system. Here's how to fight back:\n\n**Immediate Actions:**\n1. Put your phone in another room (out of sight = out of mind)\n2. Use app blockers: **Freedom**, **Cold Turkey**, or simply enable "Focus Mode" in your phone settings\n3. Start with just 5 minutes of focused work — the brain will continue once started (Zeigarnik Effect)\n\n**Environment Design:**\n• Study in a boring, distraction-free space\n• Have water and snacks ready so you don't need to get up\n• Use the Pomodoro timer here — 25 min work, 5 min break\n\n**Mindset Shift:** Every time you pick up your phone during study, you lose 23 minutes of deep focus (research by Gloria Mark). One scroll = one chapter lost. 🔥`;
    }

    if (t.match(/stress|anxi|nervous|burnout|overwhelm|too much|can't cope|pressure|panic|mental health/)) {
      return `**Managing Exam Stress & Burnout** 💙\n\nFirst — what you're feeling is completely normal and you're not alone. Here's what actually works:\n\n**Immediate Relief (do this now):**\n• **Box breathing:** Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times. This activates your parasympathetic nervous system.\n• Take a 20-minute walk outside — sunlight + movement = natural cortisol reset\n\n**Structural Fixes:**\n• Break your syllabus into tiny daily tasks (Dashboard helps with this)\n• Celebrate small wins — every completed subtask is a win worth acknowledging\n• Sleep 7.5-8 hours non-negotiably — sleep consolidates memory and reduces anxiety\n\n**Mindset:** You are not behind. You are exactly where you need to be *right now*. Progress, not perfection. One chapter today > zero chapters because you're overwhelmed. 💪`;
    }

    if (t.match(/memor|forget|remember|retain|recall|revision|spaced repetition|flashcard|notes/)) {
      return `**Memory & Retention Science** 🧠\n\nYour brain forgets 80% of new information within 24 hours (Ebbinghaus Forgetting Curve) — unless you actively fight it.\n\n**The 3 Most Powerful Techniques:**\n\n**1. Active Recall:** Don't re-read. Close the book and write/say everything you remember. Then check what you missed.\n\n**2. Spaced Repetition:** Review material at increasing intervals:\n• 1 day after learning → 3 days → 7 days → 21 days → 2 months\n• Use Anki app (free) for flashcards that auto-schedule this\n\n**3. The Feynman Technique:** Explain the concept in simple language as if teaching a child. Where you stumble = your gap.\n\n**Notes Strategy:** Don't copy textbook notes. Write in your own words. Use mind maps for interconnected topics.\n\n**For Focus Mode Player:** Use the Journal tab to write what you learned today — this forces active recall! 📓`;
    }

    if (t.match(/sleep|tired|exhaust|sleep schedule|nap|wake up|morning|night study/)) {
      return `**Sleep & Study Optimization** 😴\n\n**Why sleep is non-negotiable:**\nDuring deep sleep (NREM stage 3), your brain replays and consolidates everything you studied. Cutting sleep doesn't give more study time — it erases what you already studied.\n\n**Optimal Schedule:**\n• Aim for **7.5 hours** (5 full 90-min sleep cycles)\n• Avoid studying complex material in the last 30 min before bed — do light review instead\n• A **20-minute power nap** (1-3pm) can restore 3 hours of cognitive performance\n\n**Night vs Morning Study:**\n• Morning (after waking): Best for new, difficult material — cortisol is high, alertness is peak\n• Evening: Good for revision and practice problems\n• Late night (post 11pm): Avoid unless you're a true night owl — diminishing returns\n\n**Practical tip:** Put your phone across the room before sleeping. Screens suppress melatonin by 50%.`;
    }

    if (t.match(/pomodoro|timer|focus session|25 min|break time|study session/)) {
      return `**Pomodoro Technique — Advanced Guide** ⏱️\n\nThe basic version: 25 min work → 5 min break. But here's how to make it even more powerful:\n\n**Before Each Session:**\n• Write exactly ONE specific task on paper: "Solve HC Verma Ch.5 Q.15-25"\n• Remove all distractions (phone away, notifications off)\n• Start the timer immediately — don't "prepare to start"\n\n**During Session:**\n• If a distraction thought comes, write it down quickly and return to work\n• Don't check the timer — trust it\n\n**After 4 Pomodoros:** Take a longer 20-30 min break. Walk, eat, hydrate.\n\n**XP Reward:** You earn +50 XP for every Pomodoro you complete here — that's not just a game, it's your brain getting a dopamine reward for discipline. Use it! 🎯\n\nGo start a session right now on the Dashboard tab.`;
    }

    if (t.match(/mock test|pyq|previous year|test series|analyze mock|score improve|rank|percentile/)) {
      return `**Mock Test Strategy — The Right Way** 📊\n\n**Most students do mocks wrong.** They take a test, feel bad about the score, and move on. Here's the elite approach:\n\n**Phase 1 — During Mock (Simulate Exam):**\n• Full exam conditions: same time, no phone, no breaks\n• Mark questions: ✓ (sure), ? (unsure), ✗ (guessed)\n\n**Phase 2 — Analysis (equally important as the test):**\n• Category every wrong answer: Silly mistake? Conceptual gap? Never studied? Time pressure?\n• Enter ALL mistakes into your Journal & Mistakes tab here\n• Calculate topic-wise accuracy — which topics are your "high-loss" areas?\n\n**Phase 3 — Targeted Revision:**\n• Spend 2 hours specifically on your weakest category from Phase 2\n• Re-solve the wrong questions (without looking at solutions) after 3 days\n\n**Frequency:** Take 1 full mock every week from 3 months before the exam. Analyze 2 days, revise 2 days, take the next mock.`;
    }

    if (t.match(/motivat|give up|quit|why study|what's the point|demotivat|no energy|depressed|lost|purpose/)) {
      return `**When You Feel Like Giving Up** 🔥\n\nThis feeling is not a sign of weakness — it's a sign you care deeply about your goal. Here's the truth:\n\n**The 2% Rule:** You don't need to be motivated. You need to be 2% better today than yesterday. That's it. Not 100% — just 2%.\n\n**Think about this:** The exam will happen whether you study or not. The only variable is how you show up. Future-you will either thank present-you or wish you had started.\n\n**Practical reset:**\n1. Write down your ONE reason for doing this (career, family, dream). Physically write it.\n2. Open ONE page/video of study material\n3. Set a timer for just 10 minutes\n4. You will rarely stop at 10 minutes — starting is the hardest part\n\n**Remember:** The people who "make it" are not smarter. They are the ones who got up one more time than they fell down. 💪\n\nYou've got this. Now go start the timer.`;
    }

    if (t.match(/time.?table|schedule|routine|plan|how many hours|study plan|study schedule|daily routine/)) {
      return `**Building an Effective Study Schedule** 📅\n\n**The Anti-Burnout Schedule (proven for JEE/NEET/UPSC):**\n\n**Daily Structure:**\n• 6:00-7:00 AM — Morning ritual (exercise, fresh air, breakfast)\n• 7:00-12:00 PM — Deep work block (hardest subjects first)\n• 12:00-1:00 PM — Lunch + rest\n• 1:00-4:00 PM — Second deep work block\n• 4:00-4:30 PM — Break (walk, light snack)\n• 4:30-7:00 PM — Practice problems + PYQs\n• 7:00-8:00 PM — Dinner + rest\n• 8:00-10:00 PM — Light revision, flashcards, notes\n• 10:00 PM — Wind down, NO screens, sleep by 10:30\n\n**Key Principles:**\n• Quality > Quantity. 6 hours of focused work beats 12 hours of distracted studying.\n• Rotate subjects — don't study the same subject >3 hours continuously\n• Add your daily tasks to the Dashboard here for accountability!\n\n**Pareto Rule:** 80% of your marks come from 20% of the syllabus. Identify those chapters.`;
    }

    if (t.match(/diet|food|eat|nutrition|brain food|what to eat|water|hydrat|caffeine|coffee|energy/)) {
      return `**Brain Nutrition for Exam Prep** 🍎\n\n**Foods that boost cognitive function:**\n• **Walnuts & Almonds:** Omega-3 + Vitamin E → improve memory and focus\n• **Blueberries:** Antioxidants → protect brain cells, improve learning\n• **Dark Chocolate (>70%):** Flavonoids + caffeine → attention and blood flow\n• **Eggs:** Choline → neurotransmitter production (memory)\n• **Green tea:** L-Theanine + caffeine → calm focus without jitteriness\n\n**What to AVOID:**\n• Heavy, oily food before study → blood goes to digestion, brain gets sluggish\n• Sugar spikes (chips, sweets) → energy crash after 30 min\n• Too much caffeine → anxiety, disrupts sleep\n\n**Hydration:** Your brain is 73% water. Even 1-2% dehydration reduces cognitive performance by 20%. Keep a water bottle on your desk. Drink 2.5-3L/day.\n\n**Caffeine timing:** Don't drink coffee for the first 90 min after waking (let natural cortisol peak first).`;
    }

    if (t.match(/how to use|what is this website|what is focusmodeplayer|what is focusmode|guide|tutorial|how does this work|features/)) {
      return `**Welcome to Focus Mode Player!** 🚀\n\nI am designed to be your ultimate study ecosystem. Here is how to use me for maximum productivity:\n\n**1. Dashboard (The Core):** Break your giant syllabus into Subjects → Modules → Subtasks. Check them off to earn XP.\n**2. Pomodoro Timer:** Use the 25-minute timer for intense focus sessions. Earning 50 XP per session builds a habit loop.\n**3. Community (Live):** Click the globe icon! It's a real-time feed of all aspirants worldwide. Share wins and tips.\n**4. Live Study Connect:** Join a virtual room to study silently with others (body doubling). It kills procrastination.\n**5. Journal & Mistakes:** At the end of the day, log what you learned and the mistakes you made. Active recall!\n**6. Lectures:** Paste any YouTube video URL. It blocks comments/recommendations and lets you take timestamped notes.\n\nStart by adding your first task on the Dashboard!`;
    }

    if (t.match(/community|chat|feed|other students|talk to|social/)) {
      return `**The Global Community Feed** 🌍\n\nStudying for competitive exams can feel lonely. That's why we built the real-time Community!\n\n• **Real-Time Sync:** Every post, like, and comment is instantly synced globally without refreshing.\n• **Accountability:** Post your daily targets: *"I will complete 50 Physics MCQs today."* When you declare it publicly, you are 3x more likely to do it.\n• **Help:** Stuck on a concept? Ask the community! Someone preparing for the same exam might have a great shortcut.\n\nHead over to the Community tab and drop a "Hello" right now!`;
    }

    if (t.match(/study connect|live room|jitsi|video call|body doubling|study together/)) {
      return `**Live Study Connect (Body Doubling)** 🎥\n\nProcrastinating? Join a Live Study Room!\n\n**The Psychology of Body Doubling:**\nWhen you see others working focused on camera, mirror neurons in your brain trigger your own focus state. It creates a subtle, powerful social pressure to not scroll Instagram.\n\n**How to use it:**\n1. Go to the Study Connect tab\n2. Click "Join Public Focus Room"\n3. Keep your camera on (audio is muted by default) angled at your desk/books\n4. Study for 1 hour straight\n\nYou earn 10 XP just for joining a room!`;
    }
    
    if (t.match(/journal|mistakes|log|diary/)) {
      return `**The Journal & Mistakes Log** 📓\n\nThis is your secret weapon. Most students solve problems, get them wrong, and move on. Elite students log them.\n\n**How to use the Journal:**\n• **Learned:** Briefly summarize the 2 most important concepts you learned today in your own words (Feynman Technique).\n• **Mistakes:** Every time you make a silly math error, misread a question, or apply the wrong formula — log it here.\n\nBefore your next mock test, read your Mistakes log. You will instantly boost your score by avoiding repeated errors.`;
    }
    
    if (t.match(/xp|level|score|points|gamification|gamify/)) {
      return `**XP & Leveling System** 🏆\n\nYour brain is wired to crave immediate rewards (like social media). We hijacked that system for studying!\n\n**How to earn XP:**\n• Complete a Pomodoro Session: **+50 XP**\n• Complete a full Subject Module: **+20 XP**\n• Log your Daily Journal: **+15 XP**\n• Join a Live Study Room: **+10 XP**\n• Complete a Subtask: **+5 XP**\n• Post in Community: **+2 XP**\n\nYour XP determines your Title (from Novice to Grandmaster). Treat this like an RPG game where *you* are the main character leveling up your real-life stats!`;
    }

    if (t.match(/video|lecture|youtube|notes|player/)) {
      return `**The Distraction-Free Video Player** 📺\n\nYouTube is great for learning, but terrible for focus (the algorithm wants you to watch memes).\n\n**The Solution:**\nPaste any YouTube URL into the Lectures tab. We strip away the comments, recommended videos, and shorts.\n\n**Smart Notes:** While watching, use the text area below the video. Your notes are saved automatically and tied directly to that specific video. You can export them to text later!`;
    }

    // ── GENERAL KNOWLEDGE CATCH-ALL + WIKIPEDIA ──────────────────────────────
    try {
      // Try multiple query extraction strategies
      const patterns = [
        /^(?:what is|what are|who is|who was|explain|define|tell me about|how does|how do|what does|describe|when was|where is|why is|why does)\s+(.+)/i,
        /^(.+?)\s+(?:explained?|meaning|definition|formula|concept|theory|law|principle|equation)$/i,
        /^(.+?)\?$/i,
      ];

      let query = null;
      for (const p of patterns) {
        const match = t.match(p);
        if (match) { query = match[1].trim(); break; }
      }
      if (!query) query = t.replace(/[?.,!]/g, '').trim();

      if (query && query.length > 3 && query.length < 100) {
        const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.extract && data.extract.length > 50) {
            const extract = data.extract.length > 600 ? data.extract.slice(0, 600) + '...' : data.extract;
            return `📚 **${data.title}**\n\n${extract}\n\n---\n💡 *Want a deeper explanation, practice problems, or study strategy for this topic? Just ask!*`;
          }
        }
      }
    } catch (err) {
      // silent fail — fall through to smart fallbacks
    }

    // ── SMART CONTEXTUAL FALLBACKS ────────────────────────────────────────────
    const smartFallbacks = [
      `Hmm, I want to give you a *really good* answer on this. Could you be a bit more specific? For example:\n• Which exam are you preparing for? (JEE/NEET/UPSC)\n• Is this a concept doubt, a formula question, or a strategy question?\n• Which chapter or topic does this relate to?\n\nThe more specific you are, the better I can help! 🎯`,
      `Great question! This might be outside my current topic library, but let me try to help. Could you rephrase it or give more context? For example: "Explain [concept] for JEE" or "How to solve [type of problem]". I cover Physics, Chemistry, Maths, Biology, Polity, History, Geography, and study strategy deeply. 💡`,
      `I'm processing that... I have deep knowledge in JEE, NEET, UPSC topics and study science. Try asking something like:\n• "Explain Newton's laws"\n• "How to study organic chemistry"\n• "Best strategy for mock tests"\n• "I'm feeling burned out"\n\nI'll give you a detailed, specific answer! 🧠`,
      `That's an interesting one! I may not have a pre-trained response for exactly that, but here's my best advice: break it down into the smallest possible question. What is the *one thing* you don't understand about this topic? Ask me that, and I'll give you the clearest possible explanation. 🎯`,
    ];
    return smartFallbacks[Math.floor(Math.random() * smartFallbacks.length)];
  };

  const handleAISend = async (e) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;
    const userText = aiInput.trim();
    trackAIQuestion(userText.length);
    setAiMessages(prev => [...prev, { role: 'user', text: userText }]);
    setAiInput('');
    setAiTyping(true);

    const response = await getAIAdvice(userText, currentUserProfile?.prepType);
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
      setAiTyping(false);
    }, 500);
  };

  // Initialization
  useEffect(() => {
    let savedUsersStr = localStorage.getItem('planmaker_users');
    let db = savedUsersStr ? JSON.parse(savedUsersStr) : {};
    if (savedUsersStr) {
      setUsersDb(db);
      // Sync all existing local users to Firebase so they appear globally
      Object.keys(db).forEach(username => {
        if (!db[username].profile?.isGuest) {
          syncUserToFirebase(username, db[username].profile);
        }
      });
    }

    const activeSession = localStorage.getItem('planmaker_session');
    const explicitLogout = localStorage.getItem('planmaker_explicit_logout');

    if (activeSession && db[activeSession]) {
      setSessionUser(activeSession);
      loadUserData(activeSession);
      
      // If they are a guest returning, maybe prompt them to save (optional)
      let visits = parseInt(localStorage.getItem('planmaker_visits') || '0');
      visits++;
      localStorage.setItem('planmaker_visits', visits.toString());
      
      syncUserToFirebase(activeSession, db[activeSession].profile);

    } else if (explicitLogout) {
      // If explicit logout was set, we do nothing and let the user stay logged out.
      // (We can just remove this block or leave it empty, but checking activeSession is enough)
    }
  }, []);

  // Sync users database
  useEffect(() => {
    if (Object.keys(usersDb).length > 0) {
      localStorage.setItem('planmaker_users', JSON.stringify(usersDb));
    }
  }, [usersDb]);

  // ── YOUTUBE IFRAME API INTEGRATION ──────────────────────────────────────────
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag) {
         firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
         document.head.appendChild(tag);
      }
    }
  }, []);

  const ytPlayerRef = useRef(null);
  const ytIntervalRef = useRef(null);

  useEffect(() => {
    if (!activeVideo) {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      return;
    }

    setIsVideoLoading(true);

    const startProgressTracking = (player) => {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
      ytIntervalRef.current = setInterval(() => {
        if (player && player.getCurrentTime) {
          const time = player.getCurrentTime();
          const duration = player.getDuration();
          if (time > 0 && duration > 0) {
            setVideoProgress(prev => {
              const newState = { ...prev, [activeVideo]: { time, duration, completed: (time / duration) > 0.95 } };
              localStorage.setItem('pm_vidprogress', JSON.stringify(newState));
              return newState;
            });
          }
        }
      }, 5000);
    };

    const initPlayer = () => {
      if (!document.getElementById('youtube-player')) {
        setTimeout(initPlayer, 100);
        return;
      }

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        setIsVideoLoading(true);
        ytPlayerRef.current.loadVideoById({
          videoId: activeVideo,
          startSeconds: Math.floor(videoProgress[activeVideo]?.time || 0)
        });
      } else {
        ytPlayerRef.current = new window.YT.Player('youtube-player', {
          videoId: activeVideo,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            start: Math.floor(videoProgress[activeVideo]?.time || 0)
          },
          events: {
            onReady: () => setIsVideoLoading(false),
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsVideoLoading(false);
                startProgressTracking(event.target);
              } else {
                if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
                if (event.target && event.target.getCurrentTime) {
                  const time = event.target.getCurrentTime();
                  const duration = event.target.getDuration();
                  setVideoProgress(prev => {
                    const newState = { ...prev, [activeVideo]: { time, duration, completed: (time / duration) > 0.95 } };
                    localStorage.setItem('pm_vidprogress', JSON.stringify(newState));
                    return newState;
                  });
                }
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
    };
  }, [activeVideo]); // Omit videoProgress to prevent reloading video on progress tick

  // Self-heal subjects if empty or if newTaskSubject is unselected
  useEffect(() => {
    if (sessionUser) {
      if (subjects.length === 0) {
        const prep = currentUserProfile?.prepType || 'JEE';
        const initialSubs = examTemplates[prep] || examTemplates.JEE;
        setSubjects(initialSubs);
        setExpandedSubjects(initialSubs.map(s => s.id));
        setNewTaskSubject(initialSubs[0].id);
        localStorage.setItem(`pm_sub_${sessionUser}`, JSON.stringify(initialSubs));
      } else if (!newTaskSubject || !subjects.some(s => s.id === newTaskSubject)) {
        setNewTaskSubject(subjects[0].id);
      }
    }
  }, [sessionUser, currentUserProfile?.prepType, subjects.length, newTaskSubject]);

  // Sync specific user data when they change
  useEffect(() => {
    if (sessionUser && usersDb[sessionUser]?.profile?.prepType) {
      localStorage.setItem(`pm_sub_${sessionUser}`, JSON.stringify(subjects));
    }
  }, [subjects, sessionUser]);

  useEffect(() => {
    if (sessionUser && usersDb[sessionUser]?.profile?.prepType) {
      localStorage.setItem(`pm_jour_${sessionUser}`, JSON.stringify(journalHistory));
    }
  }, [journalHistory, sessionUser]);

  useEffect(() => {
    if (sessionUser && usersDb[sessionUser]?.profile?.prepType) {
      localStorage.setItem(`pm_playlist_${sessionUser}`, JSON.stringify(playlist));
    }
  }, [playlist, sessionUser]);

  // Sync community feed — REMOVED: now handled by real-time Gun.js hook

  useEffect(() => {
    calculateProgress();
  }, [subjects]);

  // Timer logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      trackTimerCompleted(sessionType);
      if (sessionUser) {
        let xpGained = sessionType === 'pomodoro' ? 50 : 10;
        awardXP(xpGained, `Completed ${sessionType === 'pomodoro' ? 'Pomodoro Session' : 'Break'}`);
        gunPostMessage(`completed a ${sessionType === 'pomodoro' ? '25-minute Pomodoro' : 'short break'}.`);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Helper Functions
  const loadUserData = (username) => {
    const savedSubjects = localStorage.getItem(`pm_sub_${username}`);
    const savedJournal = localStorage.getItem(`pm_jour_${username}`);
    const savedPlaylist = localStorage.getItem(`pm_playlist_${username}`);
    
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
      setExpandedSubjects(JSON.parse(savedSubjects).map(s => s.id));
      if (JSON.parse(savedSubjects).length > 0) setNewTaskSubject(JSON.parse(savedSubjects)[0].id);
    }
    if (savedJournal) {
      setJournalHistory(JSON.parse(savedJournal));
    } else {
      setJournalHistory([{ date: 'Welcome', text: 'Start logging your daily learnings and mistakes here!' }]);
    }
    if (savedPlaylist) {
      setPlaylist(JSON.parse(savedPlaylist));
    }
    const savedNotes = localStorage.getItem(`pm_notes_${username}`);
    if (savedNotes) setVideoNotes(JSON.parse(savedNotes));

    // Load streak data
    const savedStreak = localStorage.getItem(`pm_streak_${username}`);
    const savedLastDate = localStorage.getItem(`pm_lastdate_${username}`);
    if (savedStreak) setStudyStreak(parseInt(savedStreak, 10));
    if (savedLastDate) setLastStudyDate(savedLastDate);

    // Load syllabus data
    const savedSyllabus = localStorage.getItem(`pm_syllabus_${username}`);
    if (savedSyllabus) setSyllabusChecked(JSON.parse(savedSyllabus));

    // Load planner data
    const savedPlanner = localStorage.getItem(`pm_planner_${username}`);
    if (savedPlanner) setPlannerTasks(JSON.parse(savedPlanner));
  };

  const awardXP = (amount, reason) => {
    setUsersDb(prev => ({
      ...prev,
      [sessionUser]: {
        ...prev[sessionUser],
        profile: {
          ...prev[sessionUser].profile,
          xp: (prev[sessionUser].profile.xp || 0) + amount
        }
      }
    }));
    trackXPEarned(amount, reason);
    setToastMsg({ id: Date.now() + Math.random(), amount, reason });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
  };

  const calculateProgress = () => {
    let total = 0; let completed = 0;
    subjects.forEach(s => s.tasks.forEach(t => {
      if (t.subtasks && t.subtasks.length > 0) {
        t.subtasks.forEach(sub => {
          total++; if (sub.completed) completed++;
        });
      } else {
        total++; if (t.completed) completed++;
      }
    }));
    setProgress(total === 0 ? 0 : Math.round((completed / total) * 100));
  };

  // ── STREAK MANAGEMENT ───────────────────────────────────────────────────
  const updateStreak = useCallback(() => {
    if (!sessionUser) return;
    const today = new Date().toDateString();
    const last = localStorage.getItem(`pm_lastdate_${sessionUser}`);
    let streak = parseInt(localStorage.getItem(`pm_streak_${sessionUser}`) || '0', 10);
    if (last === today) return; // already counted today
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (last === yesterday) {
      streak += 1;
    } else if (last !== today) {
      streak = 1; // reset streak if missed a day
    }
    localStorage.setItem(`pm_streak_${sessionUser}`, streak.toString());
    localStorage.setItem(`pm_lastdate_${sessionUser}`, today);
    setStudyStreak(streak);
    setLastStudyDate(today);
    if (streak > 1) {
      setToastMsg({ id: Date.now() + Math.random(), amount: 0, reason: `🔥 ${streak}-Day Streak! Keep grinding!` });
      setShowStreakAnimation(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setToastMsg(null);
        setShowStreakAnimation(false);
      }, 3500);
    }
  }, [sessionUser]);

  useEffect(() => {
    if (sessionUser) {
      updateStreak();
    }
  }, [sessionUser, updateStreak]);

  // ── PLANNER FUNCTIONS ───────────────────────────────────────────────────
  const addPlannerTask = () => {
    if (!plannerInput.trim()) return;
    const key = plannerDay;
    const task = { id: Date.now(), text: plannerInput.trim(), subject: plannerSubject || subjects[0]?.title || '', time: plannerTime, done: false };
    const updated = { ...plannerTasks, [key]: [...(plannerTasks[key] || []), task] };
    setPlannerTasks(updated);
    if (sessionUser) localStorage.setItem(`pm_planner_${sessionUser}`, JSON.stringify(updated));
    setPlannerInput('');
  };

  const togglePlannerTask = (day, id) => {
    const updated = {
      ...plannerTasks,
      [day]: (plannerTasks[day] || []).map(t => t.id === id ? { ...t, done: !t.done } : t)
    };
    setPlannerTasks(updated);
    if (sessionUser) localStorage.setItem(`pm_planner_${sessionUser}`, JSON.stringify(updated));
  };

  const deletePlannerTask = (day, id) => {
    const updated = {
      ...plannerTasks,
      [day]: (plannerTasks[day] || []).filter(t => t.id !== id)
    };
    setPlannerTasks(updated);
    if (sessionUser) localStorage.setItem(`pm_planner_${sessionUser}`, JSON.stringify(updated));
  };

  // ── SYLLABUS FUNCTIONS ──────────────────────────────────────────────────
  const toggleSyllabus = (key) => {
    const updated = { ...syllabusChecked, [key]: !syllabusChecked[key] };
    setSyllabusChecked(updated);
    if (sessionUser) localStorage.setItem(`pm_syllabus_${sessionUser}`, JSON.stringify(updated));
    if (!syllabusChecked[key]) awardXP(10, 'Syllabus Topic Completed!');
  };

  const handleTabChange = (tab) => {
    trackTabChange(tab);
    setActiveTab(tab);
    if (tab === 'community') {
      const now = Date.now();
      setLastCommunityVisit(now);
      try { localStorage.setItem('pm_last_community_visit', now.toString()); } catch {}
    }
  };

  // Auth Functions
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Please fill all fields');
      return;
    }

    if (authMode === 'register') {
      trackSignUp();
      if (usersDb[authUsername] && authUsername !== sessionUser) {
        setAuthError('Username already exists'); return;
      }

      if (showAuthWall && usersDb[sessionUser]?.profile?.isGuest) {
        // Upgrade Guest to Real User
        setUsersDb(prev => {
          const newDb = { ...prev };
          const guestData = newDb[sessionUser];
          delete newDb[sessionUser];
          newDb[authUsername] = {
            password: authPassword,
            profile: { ...guestData.profile, isGuest: false }
          };
          return newDb;
        });

        // Migrate local storage keys
        const pSub = localStorage.getItem(`pm_sub_${sessionUser}`);
        const pJour = localStorage.getItem(`pm_jour_${sessionUser}`);
        const pPlay = localStorage.getItem(`pm_playlist_${sessionUser}`);
        
        if(pSub) localStorage.setItem(`pm_sub_${authUsername}`, pSub);
        if(pJour) localStorage.setItem(`pm_jour_${authUsername}`, pJour);
        if(pPlay) localStorage.setItem(`pm_playlist_${authUsername}`, pPlay);
        
        localStorage.removeItem(`pm_sub_${sessionUser}`);
        localStorage.removeItem(`pm_jour_${sessionUser}`);
        localStorage.removeItem(`pm_playlist_${sessionUser}`);

        setSessionUser(authUsername);
        localStorage.setItem('planmaker_session', authUsername);
        setShowAuthWall(false);
        setToastMsg({ id: Date.now(), amount: 50, reason: 'Account Created Successfully!' });
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 3000);
      } else {
        // Normal register (e.g. they explicitly logged out and are creating a new account)
        setUsersDb(prev => ({
          ...prev,
          [authUsername]: { 
            password: authPassword, 
            profile: { isGuest: false, prepType: '', targetYear: '', weakness: '', xp: 0, joined: new Date().toLocaleDateString() } 
          }
        }));
        setSessionUser(authUsername);
        localStorage.setItem('planmaker_session', authUsername);
        localStorage.removeItem('planmaker_explicit_logout');
      }
    } else {
      // Login flow
      const user = usersDb[authUsername];
      if (!user || user.password !== authPassword) {
        setAuthError('Invalid username or password'); return;
      }
      trackLogin();
      
      // If logging in as an existing user from the Guest Auth Wall
      if (showAuthWall && usersDb[sessionUser]?.profile?.isGuest) {
        // Discard guest session and clean up
        localStorage.removeItem(`pm_sub_${sessionUser}`);
        localStorage.removeItem(`pm_jour_${sessionUser}`);
        localStorage.removeItem(`pm_playlist_${sessionUser}`);
        setUsersDb(prev => {
          const newDb = { ...prev };
          delete newDb[sessionUser];
          return newDb;
        });
        setShowAuthWall(false);
      }
      
      setSessionUser(authUsername);
      localStorage.setItem('planmaker_session', authUsername);
      localStorage.removeItem('planmaker_explicit_logout');
      loadUserData(authUsername);
    }
    setAuthUsername(''); setAuthPassword('');
  };

  const handleLogout = () => {
    trackLogout();
    setSessionUser(null);
    setSubjects([]); setJournalHistory([]); setPlaylist([]);
    setActiveTab('dashboard'); setActiveVideo(null);
    localStorage.removeItem('planmaker_session');
    localStorage.setItem('planmaker_explicit_logout', 'true');
  };

  // Onboarding Functions
  const submitOnboarding = (skip = false) => {
    let prep = onboardPrep;
    let year = onboardYear;
    let weakness = onboardWeakness;
    if (skip) {
       prep = 'General';
       year = new Date().getFullYear();
       weakness = 'None';
    } else if (!onboardPrep || !onboardYear) return;
    
    trackOnboarding(prep, year);
    setUsersDb(prev => ({
      ...prev, [sessionUser]: { ...prev[sessionUser], profile: { ...prev[sessionUser].profile, prepType: prep, targetYear: year, weakness: weakness } }
    }));
    const initialSubjects = examTemplates[prep] || examTemplates['General'];
    setSubjects(initialSubjects);
    setExpandedSubjects(initialSubjects.map(s => s.id));
    setNewTaskSubject(initialSubjects[0].id);
    localStorage.setItem(`pm_sub_${sessionUser}`, JSON.stringify(initialSubjects));
  };

  // Dashboard Functions
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskSubject) return;
    trackTaskAdded(newTaskSubject);
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== newTaskSubject) return sub;
      return {
        ...sub,
        tasks: [...sub.tasks, {
          id: Date.now().toString(), title: newTaskTitle,
          completed: false
        }]
      };
    }));
    setNewTaskTitle('');
  };

  const handleDeleteTask = (subjectId, taskId) => {
    setSubjects(prev => prev.map(sub => {
      if (sub.id !== subjectId) return sub;
      return { ...sub, tasks: sub.tasks.filter(t => t.id !== taskId) };
    }));
  };

  const toggleSubtask = (subjectId, taskId, subtaskId) => {
    let taskCompletedJustNow = false;
    let allCompletedNow = false;
    let isSingleTask = false;
    
    setSubjects(prev => {
      let updatedSubjects = prev.map(subject => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          tasks: subject.tasks.map(task => {
            if (task.id !== taskId) return task;
            
            if (!task.subtasks || task.subtasks.length === 0) {
              isSingleTask = true;
              if (!task.completed) taskCompletedJustNow = true;
              return { ...task, completed: !task.completed };
            }

            let completedCount = 0;
            const updatedSubtasks = task.subtasks.map(subtask => {
              if (subtask.id !== subtaskId) {
                if (subtask.completed) completedCount++;
                return subtask;
              }
              if (!subtask.completed) { taskCompletedJustNow = true; completedCount++; }
              return { ...subtask, completed: !subtask.completed };
            });
            if (completedCount === updatedSubtasks.length && taskCompletedJustNow) allCompletedNow = true;
            return { ...task, subtasks: updatedSubtasks };
          })
        };
      });
      return updatedSubjects;
    });

    if (taskCompletedJustNow) { 
      trackSubtaskCompleted(subjectId); 
      awardXP(isSingleTask ? 15 : 5, isSingleTask ? 'Completed Task!' : 'Completed Subtask'); 
      updateStreak(); 
    }
    if (allCompletedNow && !isSingleTask) {
       trackModuleCompleted(subjectId);
       awardXP(20, 'Completed Full Module!');
       gunPostMessage(`just finished a full task module! 🚀`);
    }
  };

  // Journal Functions
  const saveJournalEntry = () => {
    if (!learnedText.trim() && !mistakesText.trim()) return;
    trackJournalSaved();
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const entry = `Mood: ${todayMood}\nLearned: ${learnedText || 'N/A'}\nMistakes: ${mistakesText || 'N/A'}`;
    setJournalHistory(prev => [{ date: dateStr, text: entry }, ...prev]);
    setLearnedText(''); setMistakesText('');
    setTodayMood('😐');
    awardXP(15, 'Logged Daily Journal');
    updateStreak();
  };

  // Community Functions — delegated to real-time Gun.js (see useCommunity hook)
  // gunPostMessage, gunToggleLike, gunAddComment are injected below after hook call

  // Lecture Functions
  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!newVideoUrl.trim() || !newVideoTitle.trim()) return;
    
    const ytId = extractYouTubeId(newVideoUrl);
    if (!ytId) {
      alert("Please enter a valid YouTube URL (including live streams)");
      return;
    }

    trackVideoAdded(newVideoTitle);
    const newVideo = { id: ytId, title: newVideoTitle, addedAt: new Date().toLocaleDateString(), watched: false };
    setPlaylist(prev => [newVideo, ...prev]);
    setNewVideoUrl('');
    setNewVideoTitle('');
    awardXP(5, 'Added Lecture to Playlist');
  };

  const toggleVideoWatched = (e, videoId) => {
    e.stopPropagation();
    setPlaylist(prev => {
      let awarded = false;
      const updated = prev.map(v => {
        if (v.id === videoId) {
          if (!v.watched) awarded = true;
          return { ...v, watched: !v.watched };
        }
        return v;
      });
      if (awarded) awardXP(10, 'Finished Watching a Lecture!');
      return updated;
    });
  };

  const removeVideo = (id, e) => {
    e.stopPropagation();
    setPlaylist(prev => prev.filter(vid => vid.id !== id));
    if (activeVideo === id) setActiveVideo(null);
  };

  // Jitsi Study Connect
  const startJitsiCall = useCallback((roomId) => {
    trackRoomJoined(roomId);
    setConnectRoom(roomId);
    setInCall(true);
    awardXP(10, 'Joined Study Connect Room');
  }, []);

  const leaveJitsiCall = useCallback(() => {
    if (jitsiApiRef.current) {
      try { jitsiApiRef.current.dispose(); } catch(e) {}
      jitsiApiRef.current = null;
    }
    setInCall(false);
    setConnectRoom(null);
  }, []);

  useEffect(() => {
    if (!inCall || !connectRoom || !jitsiContainerRef.current) return;
    if (jitsiApiRef.current) return; // already initialized

    const roomName = `FocusMode-${connectRoom}-Study`.replace(/[^a-zA-Z0-9-]/g, '');

    const loadJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = () => initJitsi(roomName);
        document.body.appendChild(script);
      } else {
        initJitsi(roomName);
      }
    };

    const initJitsi = (room) => {
      if (!jitsiContainerRef.current) return;
      const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
        roomName: room,
        parentNode: jitsiContainerRef.current,
        width: '100%',
        height: '100%',
        configOverwrite: {
          startWithVideoMuted: false,
          startWithAudioMuted: false,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
          disableModeratorIndicator: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Aspirant',
          TOOLBAR_BUTTONS: ['microphone', 'camera', 'chat', 'desktop', 'tileview', 'hangup'],
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
          filmStripOnly: false,
        },
        userInfo: {
          displayName: sessionUser,
        },
      });

      api.addEventListeners({
        readyToClose: leaveJitsiCall,
        videoConferenceLeft: leaveJitsiCall,
      });

      jitsiApiRef.current = api;
    };

    loadJitsi();

    return () => {
      if (jitsiApiRef.current) {
        try { jitsiApiRef.current.dispose(); } catch(e) {}
        jitsiApiRef.current = null;
      }
    };
  }, [inCall, connectRoom]);

  // Video Notes
  // Video Notes
  const saveVideoNote = (videoId, type, text) => {
    const current = videoNotes[videoId] || { notes: '', mistakes: '', lastUpdated: '' };
    const updated = { 
      ...videoNotes, 
      [videoId]: { ...current, [type]: text, lastUpdated: new Date().toLocaleDateString() } 
    };
    setVideoNotes(updated);
    if (sessionUser) localStorage.setItem(`pm_notes_${sessionUser}`, JSON.stringify(updated));
  };

  const downloadNote = (video) => {
    trackNoteDownloaded(video.title);
    const data = videoNotes[video.id] || { notes: '', mistakes: '', lastUpdated: '' };
    const dateStr = data.lastUpdated || new Date().toLocaleDateString();
    let content = `Focus Mode Player — Lecture Notes\n${'='.repeat(40)}\nVideo: ${video.title}\nDate: ${dateStr}\n${'='.repeat(40)}\n\n`;
    if (data.notes) content += `[📝 NOTES]\n${data.notes}\n\n`;
    if (data.mistakes) content += `[⚠️ MISTAKES & DOUBTS]\n${data.mistakes}\n\n`;
    if (!data.notes && !data.mistakes) content += 'No notes written yet.';
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${video.title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60); const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const setTimer = (type) => {
    setIsActive(false);
    setSessionType(type);
    if (type === 'pomodoro') setTimeLeft(25 * 60);
    else if (type === 'pomodoro50') setTimeLeft(50 * 60);
    else if (type === 'shortBreak') setTimeLeft(5 * 60);
    else if (type === 'longBreak') setTimeLeft(10 * 60);
  };

  const startTimer = () => {
    if (!isActive) trackTimerStarted(sessionType);
    setIsActive(prev => !prev);
  };

  const getSubjectColor = (idOrTitle) => {
    const key = (idOrTitle || '').toLowerCase();
    if (key.includes('phys')) return 'var(--accent-physics)';
    if (key.includes('chem')) return 'var(--accent-chem)';
    if (key.includes('math') || key.includes('quant')) return 'var(--accent-math)';
    if (key.includes('bio')) return 'var(--accent-success)';
    if (key.includes('hist')) return '#f59e0b';
    if (key.includes('polit')) return '#06b6d4';
    if (key.includes('geo')) return '#14b8a6';
    if (key.includes('current')) return '#8b5cf6';
    if (key.includes('focus') || key.includes('deep')) return 'var(--accent-physics)';
    if (key.includes('study')) return 'var(--accent-chem)';
    if (key.includes('proj')) return 'var(--accent-math)';
    return 'var(--accent-physics)';
  };

  const getSubjectEmoji = (idOrTitle) => {
    const key = (idOrTitle || '').toLowerCase();
    if (key.includes('phys')) return '⚛️';
    if (key.includes('chem')) return '🧪';
    if (key.includes('math') || key.includes('quant')) return '📐';
    if (key.includes('bio')) return '🧬';
    if (key.includes('hist')) return '🏛️';
    if (key.includes('polit')) return '📜';
    if (key.includes('geo')) return '🌍';
    if (key.includes('current')) return '📰';
    if (key.includes('focus')) return '⚡';
    if (key.includes('study')) return '📚';
    return '📝';
  };

  const getSubjectIcon = (iconStr) => {
    switch(iconStr) {
      case 'physics': return <BrainCircuit size={20} />;
      case 'chem': return <FlaskConical size={20} />;
      case 'math': return <Calculator size={20} />;
      case 'bio': return <Stethoscope size={20} />;
      case 'history': return <Landmark size={20} />;
      case 'polity': return <Landmark size={20} />;
      case 'geo': return <Landmark size={20} />;
      case 'current': return <BookOpen size={20} />;
      default: return <BookOpen size={20} />;
    }
  };

  // Views
  if (!sessionUser) {
    return (
      <WelcomeScreen 
        authMode={authMode} setAuthMode={setAuthMode}
        authUsername={authUsername} setAuthUsername={setAuthUsername}
        authPassword={authPassword} setAuthPassword={setAuthPassword}
        authError={authError} setAuthError={setAuthError}
        handleAuth={handleAuth}
        onQuickSetup={(name) => {
           trackGuestSession();
           const guestId = name.trim() || 'Guest' + Math.floor(Math.random()*10000);
           setUsersDb(prev => ({
             ...prev, [guestId]: {
               password: 'none',
               profile: { isGuest: true, xp: 0, joined: new Date().toLocaleDateString() }
             }
           }));
           setSessionUser(guestId);
           localStorage.setItem('planmaker_session', guestId);
        }}
      />
    );
  }

  const isFullyOnboarded = true;
  const isGuest = currentUserProfile?.isGuest;
  const { level, title } = getLevelData(currentXP);

  const handlePostFeed = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    
    if (containsAbuse(newPostText)) {
      alert("⚠️ Restricted: Abusive language is not permitted. Please maintain a respectful community.");
      return;
    }

    trackPostCreated();
    const id = await gunPostMessage(newPostText);
    if (id) {
      setNewPostText('');
      awardXP(2, 'Community Post');
    }
  };

  const toggleLike = (postId) => {
    trackPostLiked();
    gunToggleLike(postId);
  };

  const submitComment = async (postId) => {
    if (!commentText.trim()) return;
    
    if (containsAbuse(commentText)) {
      alert("⚠️ Restricted: Abusive language is not permitted in comments.");
      return;
    }

    trackCommentPosted();
    await gunAddComment(postId, commentText);
    setCommentText('');
    setCommentingOn(null);
    awardXP(1, 'Commented on a Post');
  };

  // Generate dynamic leaderboard with real users (Global from feed + Local)
  const realUsersMap = {};
  feed.forEach(post => {
    if (!realUsersMap[post.user] || post.xp > realUsersMap[post.user]) {
      realUsersMap[post.user] = post.xp;
    }
  });
  Object.keys(usersDb).forEach(u => {
    const xp = usersDb[u]?.profile?.xp || 0;
    if (!realUsersMap[u] || xp > realUsersMap[u]) {
      realUsersMap[u] = xp;
    }
  });
  realUsersMap[sessionUser] = Math.max(realUsersMap[sessionUser] || 0, currentXP);

  const combinedLeaderboard = Object.entries(realUsersMap).map(([name, score]) => ({
    name: name === sessionUser ? name + " (You)" : name,
    score: score
  })).sort((a,b) => b.score - a.score);
  combinedLeaderboard.forEach((lb, i) => lb.rank = i + 1);

    const renderDashboard = () => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayStr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];

    const syllabusMap = {
      JEE: { Physics: ['Mechanics','Thermodynamics','Electrostatics','Magnetism','Modern Physics','Waves & Optics'], Chemistry: ['Mole Concept','Equilibrium','Organic Reactions','Electrochemistry','P-Block','D-Block'], Mathematics: ['Calculus','Algebra','Trigonometry','Coordinate Geometry','Probability','Vectors'] },
      NEET: { Physics: ['Mechanics','Thermodynamics','Optics','Modern Physics','Magnetism'], Chemistry: ['Organic Chem','Physical Chem','Inorganic Chem'], Biology: ['Cell Biology','Genetics','Ecology','Plant Physiology','Human Physiology'] },
      UPSC: { History: ['Ancient India','Medieval India','Modern India'], Polity: ['Constitution','Parliament','Judiciary'], Geography: ['Physical','Indian Geo','World Geo'], Economy: ['Macro Econ','Micro Econ','Govt Schemes'] },
      NDA: { Mathematics: ['Algebra', 'Calculus', 'Trigonometry', 'Statistics'], General_Ability: ['English', 'Physics', 'Chemistry', 'History & Geo'] },
    };
    const syllabus = syllabusMap[currentUserProfile?.prepType] || syllabusMap.JEE;
    const allSyllabusTopics = Object.entries(syllabus).flatMap(([sub, topics]) => topics.map(t => `${sub}::${t}`));
    const doneCount = allSyllabusTopics.filter(k => syllabusChecked[k]).length;
    const syllabusPct = allSyllabusTopics.length ? Math.round((doneCount / allSyllabusTopics.length) * 100) : 0;

    let totalTasks = 0;
    let completedTasks = 0;
    subjects.forEach(s => {
      s.tasks.forEach(t => {
        if (t.subtasks && t.subtasks.length > 0) {
          t.subtasks.forEach(st => { totalTasks++; if (st.completed) completedTasks++; });
        } else {
          totalTasks++; if (t.completed) completedTasks++;
        }
      });
    });

    return (
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
        
        {/* Executive Command Center (Hero + Focus Timer) */}
        <div className="dashboard-command-center">
          
          {/* Left Hero Card */}
          <div className="glass dashboard-hero-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px'}}>
              <div>
                <span style={{fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--accent-physics)', background: 'rgba(139,92,246,0.15)', padding: '4px 10px', borderRadius: '100px'}}>
                  ⚡ Daily Command Center
                </span>
                <h2 style={{fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 900, color: 'white', margin: '8px 0 4px', letterSpacing: '-0.5px'}}>
                  Crush Today's Targets, {sessionUser}!
                </h2>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0}}>
                  Targeting {currentUserProfile?.prepType || 'JEE'} {currentUserProfile?.targetYear || '2026'} · Consistent practice creates champions.
                </p>
              </div>

              <div style={{display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize: '2rem', lineHeight: 1}}>🔥</div>
                <div>
                  <div style={{fontSize: '1.3rem', fontWeight: 900, color: '#fb923c', lineHeight: 1}}>{studyStreak}</div>
                  <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700}}>Day Streak</div>
                </div>
              </div>
            </div>

            {/* Daily Progress Meter Bar */}
            <div style={{background: 'rgba(0,0,0,0.25)', padding: '14px 16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
                <span style={{fontSize: '0.85rem', fontWeight: 700, color: 'white'}}>Daily Task Completion</span>
                <span style={{fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-success)'}}>{progress}% ({completedTasks}/{totalTasks} subtasks)</span>
              </div>
              <div style={{height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '100px', overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #10b981, #06b6d4)', borderRadius: '100px', transition: 'width 0.4s ease'}}></div>
              </div>
            </div>

            {/* Quick Stat Capsules */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px'}}>
              <div style={{padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'}}>
                <div style={{fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-physics)'}}>{currentXP}</div>
                <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600}}>Total XP</div>
              </div>
              <div style={{padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'}}>
                <div style={{fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-success)'}}>Lvl {level}</div>
                <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600}}>Scholar Rank</div>
              </div>
              <div style={{padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'}}>
                <div style={{fontSize: '1.15rem', fontWeight: 900, color: 'var(--accent-math)'}}>{doneCount}/{allSyllabusTopics.length}</div>
                <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600}}>Syllabus ({syllabusPct}%)</div>
              </div>
              <div style={{padding: '10px 12px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'}}>
                <div style={{fontSize: '1.15rem', fontWeight: 900, color: '#f59e0b'}}>{isActive ? 'Active ⚡' : 'Idle'}</div>
                <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600}}>Timer Status</div>
              </div>
            </div>
          </div>

          {/* Right Timer Card */}
          <div className="glass dashboard-timer-box">
            <h3 style={{fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', color: 'white', margin: '0 0 10px'}}>
              ⏳ Deep Focus Timer
            </h3>

            {/* Timer Presets */}
            <div style={{display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '12px'}}>
              <button onClick={() => setTimer('pomodoro')} style={{padding: '5px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: sessionType === 'pomodoro' ? 'var(--accent-physics)' : 'rgba(255,255,255,0.06)', color: 'white'}}>25m Focus</button>
              <button onClick={() => setTimer('pomodoro50')} style={{padding: '5px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: sessionType === 'pomodoro50' ? 'var(--accent-physics)' : 'rgba(255,255,255,0.06)', color: 'white'}}>50m Deep</button>
              <button onClick={() => setTimer('shortBreak')} style={{padding: '5px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: sessionType === 'shortBreak' ? 'var(--accent-success)' : 'rgba(255,255,255,0.06)', color: 'white'}}>5m Break</button>
            </div>

            <div style={{fontSize: '3.6rem', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1, margin: '8px 0', fontFamily: "'Space Grotesk', monospace", color: 'white', textShadow: isActive ? '0 0 25px rgba(139,92,246,0.6)' : 'none'}}>
              {formatTime(timeLeft)}
            </div>

            <div style={{fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 'bold', marginBottom: '14px'}}>
              Reward: +{sessionType.includes('pomodoro') ? (sessionType === 'pomodoro50' ? '100' : '50') : '10'} XP
            </div>

            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
              <button className="btn-primary" onClick={startTimer} style={{padding: '10px 24px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: isActive ? '0 0 20px rgba(139,92,246,0.5)' : 'none'}}>
                {isActive ? <Pause size={17}/> : <Play size={17}/>}
                <span>{isActive ? 'Pause' : 'Start Focus'}</span>
              </button>
              <button onClick={() => setTimer(sessionType)} style={{padding: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'}} title="Reset Timer">
                <RotateCcw size={17}/>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Workspace View Tabs */}
        <div className="dashboard-tabs-bar">
          <button 
            onClick={() => setDashboardTab('overview')} 
            className="dashboard-tab-btn"
            style={{background: dashboardTab === 'overview' ? 'linear-gradient(135deg, var(--accent-physics), #c026d3)' : 'rgba(255,255,255,0.05)', color: 'white'}}
          >
            <LayoutDashboard size={15}/> Today's Tasks ({completedTasks}/{totalTasks})
          </button>
          <button 
            onClick={() => setDashboardTab('syllabus')} 
            className="dashboard-tab-btn"
            style={{background: dashboardTab === 'syllabus' ? 'linear-gradient(135deg, var(--accent-math), #2563eb)' : 'rgba(255,255,255,0.05)', color: 'white'}}
          >
            <BookOpen size={15}/> Syllabus Roadmap ({syllabusPct}%)
          </button>
          <button 
            onClick={() => setDashboardTab('week')} 
            className="dashboard-tab-btn"
            style={{background: dashboardTab === 'week' ? 'linear-gradient(135deg, var(--accent-chem), #db2777)' : 'rgba(255,255,255,0.05)', color: 'white'}}
          >
            <Calendar size={15}/> Week Flow ({todayStr})
          </button>
        </div>

        {/* View 1: Today's Tasks */}
        {dashboardTab === 'overview' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {/* Quick Add Task Form */}
            <form className="glass" onSubmit={handleAddTask} style={{padding: '1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {/* Subject Quick Pill Selectors */}
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                <span style={{fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700}}>Subject:</span>
                {subjects.map(s => {
                  const sColor = getSubjectColor(s.title || s.id);
                  const isSelected = (newTaskSubject || subjects[0]?.id) === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setNewTaskSubject(s.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '100px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isSelected ? `2px solid ${sColor}` : '1px solid rgba(255,255,255,0.1)',
                        background: isSelected ? `${sColor}26` : 'rgba(255,255,255,0.03)',
                        color: isSelected ? sColor : '#cbd5e1',
                        boxShadow: isSelected ? `0 0 14px ${sColor}44` : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span>{getSubjectEmoji(s.title || s.id)}</span>
                      <span>{s.title}</span>
                    </button>
                  );
                })}
              </div>

              {/* Input Row with Styled Dropdown & Add Button */}
              <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center'}}>
                <div style={{position: 'relative', flex: '0 0 auto', minWidth: '140px'}}>
                  <select 
                    className="input-field" 
                    value={newTaskSubject || (subjects[0]?.id || '')} 
                    onChange={(e) => setNewTaskSubject(e.target.value)} 
                    style={{
                      width: '100%',
                      borderRadius: '12px',
                      padding: '11px 14px',
                      fontWeight: 800,
                      color: getSubjectColor(subjects.find(s => s.id === (newTaskSubject || subjects[0]?.id))?.title || newTaskSubject),
                      border: `1.5px solid ${getSubjectColor(subjects.find(s => s.id === (newTaskSubject || subjects[0]?.id))?.title || newTaskSubject)}77`,
                      background: 'rgba(15,23,42,0.9)',
                      cursor: 'pointer'
                    }}
                  >
                    {subjects.map(s => {
                      const sColor = getSubjectColor(s.title || s.id);
                      return (
                        <option 
                          key={s.id} 
                          value={s.id} 
                          style={{
                            background: '#0f172a', 
                            color: sColor, 
                            fontWeight: 700,
                            padding: '10px'
                          }}
                        >
                          {getSubjectEmoji(s.title || s.id)} {s.title}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <input 
                  type="text" 
                  className="input-field" 
                  placeholder={`E.g., Complete 30 PYQs on ${subjects.find(s => s.id === (newTaskSubject || subjects[0]?.id))?.title || 'Physics'}...`} 
                  value={newTaskTitle} 
                  onChange={(e) => setNewTaskTitle(e.target.value)} 
                  style={{flex: '1 1 240px', borderRadius: '12px'}} 
                />
                
                <button 
                  type="submit" 
                  className="btn-primary" 
                  style={{
                    borderRadius: '12px', 
                    padding: '11px 22px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontWeight: 'bold',
                    background: `linear-gradient(135deg, ${getSubjectColor(subjects.find(s => s.id === (newTaskSubject || subjects[0]?.id))?.title || newTaskSubject)}, var(--accent-physics))`,
                    border: 'none',
                    boxShadow: `0 4px 15px ${getSubjectColor(subjects.find(s => s.id === (newTaskSubject || subjects[0]?.id))?.title || newTaskSubject)}33`
                  }} 
                  disabled={!newTaskTitle.trim()}
                >
                  <Plus size={16}/> Add Task
                </button>
              </div>
            </form>

            {/* Subject Task Cards */}
            <div className="subjects-grid">
              {subjects.map(subject => {
                const isExpanded = expandedSubjects.includes(subject.id);
                const subColor = getSubjectColor(subject.title || subject.id);
                let total = 0, comp = 0;
                subject.tasks.forEach(t => {
                  if (t.subtasks && t.subtasks.length > 0) {
                    t.subtasks.forEach(s => { total++; if(s.completed) comp++; });
                  } else {
                    total++; if(t.completed) comp++;
                  }
                });
                const subPct = total === 0 ? 0 : Math.round((comp / total) * 100);

                return (
                  <div 
                    key={subject.id} 
                    className="glass subject-card" 
                    style={{
                      borderRadius: '20px', 
                      border: `1px solid ${subColor}33`,
                      borderLeft: `4px solid ${subColor}`,
                      background: `linear-gradient(145deg, ${subColor}0c 0%, rgba(255,255,255,0.01) 100%)`,
                      boxShadow: `0 6px 20px ${subColor}10`
                    }}
                  >
                    <div className="subject-header" onClick={() => setExpandedSubjects(prev => prev.includes(subject.id) ? prev.filter(x => x !== subject.id) : [...prev, subject.id])} style={{cursor: 'pointer'}}>
                      <div className="subject-info" style={{flex: 1}}>
                        <div className="subject-icon" style={{background: `${subColor}22`, color: subColor, border: `1px solid ${subColor}44`, borderRadius: '12px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                          {getSubjectIcon(subject.icon)}
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 className="subject-title" style={{fontSize: '1rem', fontWeight: 800, margin: 0, color: '#fff'}}>{subject.title}</h3>
                            <span style={{fontSize: '0.78rem', color: comp === total && total > 0 ? 'var(--accent-success)' : subColor, fontWeight: 'bold'}}>{comp}/{total}</span>
                          </div>
                          <div style={{height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginTop: '6px'}}>
                            <div style={{height: '100%', width: `${subPct}%`, background: subColor, borderRadius: '4px', transition: 'width 0.4s'}}></div>
                          </div>
                        </div>
                      </div>
                      <button className={`toggle-btn ${isExpanded ? 'expanded' : ''}`} style={{background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px'}}>
                        <ChevronDown size={18}/>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="tasks-list" style={{marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px'}}>
                        {subject.tasks.length === 0 ? (
                          <p style={{color: 'var(--text-muted)', fontSize: '0.85rem', margin: '4px 0'}}>No tasks added yet. Add your first goal above!</p>
                        ) : (
                          subject.tasks.map(task => (
                            <div key={task.id} className="task-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', marginBottom: '6px'}}>
                              <label className="checkbox-wrapper" style={{flex: 1, margin: 0, display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'}}>
                                <input type="checkbox" checked={task.completed || false} onChange={() => toggleSubtask(subject.id, task.id)} />
                                <div className="checkmark"><Check size={13}/></div>
                                <span style={{fontSize: '0.9rem', fontWeight: 600, textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'white'}}>
                                  {task.title}
                                </span>
                              </label>
                              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                {!task.completed ? (
                                  <span style={{fontSize: '0.7rem', color: 'var(--accent-physics)', fontWeight: 'bold', background: 'rgba(139,92,246,0.15)', padding: '2px 6px', borderRadius: '4px'}}>+15 XP</span>
                                ) : (
                                  <span style={{fontSize: '0.7rem', color: 'var(--accent-success)', fontWeight: 'bold', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px'}}>Done</span>
                                )}
                                <button onClick={() => handleDeleteTask(subject.id, task.id)} style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', padding: '2px'}} title="Delete Task">&times;</button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 2: Syllabus Roadmap */}
        {dashboardTab === 'syllabus' && (
          <div className="glass" style={{padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '8px'}}>
              <div>
                <h3 style={{fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'white', margin: 0}}>
                  <BookOpen size={18} color="var(--accent-math)"/> {currentUserProfile?.prepType || 'JEE'} Syllabus Tracker
                </h3>
                <p style={{fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0'}}>Click any topic pill to mark it completed and level up your progress.</p>
              </div>
              <div style={{background: 'rgba(59,130,246,0.15)', color: 'var(--accent-math)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 800}}>
                {doneCount}/{allSyllabusTopics.length} Finished ({syllabusPct}%)
              </div>
            </div>

            <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
              {Object.entries(syllabus).map(([subject, topics]) => {
                const subDone = topics.filter(t => syllabusChecked[`${subject}::${t}`]).length;
                const subPct = Math.round((subDone / topics.length) * 100);
                return (
                  <div key={subject} style={{background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center'}}>
                      <span style={{fontSize: '0.92rem', fontWeight: 800, color: 'white'}}>{subject}</span>
                      <span style={{fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 'bold'}}>{subDone}/{topics.length} ({subPct}%)</span>
                    </div>
                    <div style={{height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden'}}>
                      <div style={{height: '100%', width: `${subPct}%`, background: 'linear-gradient(90deg, var(--accent-math), var(--accent-physics))', borderRadius: '4px', transition: 'width 0.4s ease'}}></div>
                    </div>
                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px'}}>
                      {topics.map(topic => {
                        const key = `${subject}::${topic}`;
                        const done = syllabusChecked[key];
                        return (
                          <button 
                            key={topic} 
                            onClick={() => toggleSyllabus(key)} 
                            style={{
                              padding: '5px 12px', borderRadius: '100px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                              background: done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                              color: done ? 'var(--accent-success)' : 'var(--text-muted)',
                              border: done ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)',
                              textDecoration: done ? 'line-through' : 'none'
                            }}
                          >
                            {done ? '✓ ' : ''}{topic}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View 3: Week Flow */}
        {dashboardTab === 'week' && (
          <div className="glass" style={{padding: '1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem'}}>
              <div>
                <h3 style={{fontSize: '1.15rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', color: 'white', margin: 0}}>
                  <Calendar size={18} color="var(--accent-chem)"/> Weekly Schedule Overview
                </h3>
                <p style={{fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0'}}>Stay consistent every day of the week.</p>
              </div>
              <button onClick={() => handleTabChange('planner')} className="btn-primary" style={{padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                Open Full Planner →
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px'}}>
              {days.map(d => {
                const tasks = plannerTasks[d] || [];
                const done = tasks.filter(t => t.done).length;
                const isToday = d === todayStr;
                return (
                  <div key={d} style={{padding: '12px 8px', borderRadius: '14px', textAlign: 'center', background: isToday ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{fontSize: '0.78rem', color: isToday ? 'var(--accent-physics)' : 'var(--text-muted)', fontWeight: isToday ? 900 : 700, marginBottom: '6px'}}>{d}</div>
                    <div style={{fontSize: '1rem', fontWeight: 900, color: done === tasks.length && tasks.length > 0 ? 'var(--accent-success)' : 'white'}}>
                      {tasks.length > 0 ? `${done}/${tasks.length}` : '–'}
                    </div>
                    <div style={{fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px'}}>
                      {isToday ? 'Today' : (tasks.length > 0 ? 'Blocks' : 'Rest')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderJournal = () => {
    return (
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '1000px', margin: '0 auto', width: '100%'}}>
        
        {/* Journal Navigation Switcher */}
        <div className="journal-tabs-bar">
          <button 
            onClick={() => setJournalTab('reflect')} 
            className="journal-tab-btn"
            style={{background: journalTab === 'reflect' ? 'linear-gradient(135deg, var(--accent-physics), #c026d3)' : 'rgba(255,255,255,0.05)', color: 'white'}}
          >
            <BookHeart size={15}/> Daily Reflection
          </button>
          <button 
            onClick={() => setJournalTab('mistakes')} 
            className="journal-tab-btn"
            style={{background: journalTab === 'mistakes' ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.05)', color: 'white'}}
          >
            <Target size={15}/> Mistake Log & Fixes ({mistakesList.length})
          </button>
          <button 
            onClick={() => setJournalTab('history')} 
            className="journal-tab-btn"
            style={{background: journalTab === 'history' ? 'linear-gradient(135deg, var(--accent-math), #2563eb)' : 'rgba(255,255,255,0.05)', color: 'white'}}
          >
            <Clock size={15}/> Past Logs ({journalHistory.length})
          </button>
        </div>

        {/* Tab 1: Daily Reflection */}
        {journalTab === 'reflect' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div className="glass" style={{padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 style={{fontSize: '1.05rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem'}}>
                😌 How was your study energy today?
              </h3>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
                {['😭','😢','😐','🙂','🔥'].map(emoji => (
                  <button 
                    key={emoji} 
                    onClick={() => setTodayMood(emoji)} 
                    style={{
                      fontSize: '2rem', padding: '10px 14px', background: todayMood === emoji ? 'rgba(255,255,255,0.12)' : 'transparent',
                      border: todayMood === emoji ? '2px solid var(--accent-success)' : '2px solid transparent',
                      borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s',
                      filter: todayMood === emoji ? 'drop-shadow(0 0 10px rgba(16,185,129,0.5))' : 'grayscale(0.4)'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass" style={{padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 style={{fontSize: '1.05rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <BookHeart size={18} color="var(--accent-chem)" /> What Core Concepts Did You Conquer Today?
              </h3>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px'}}>Summarizing forces active recall and moves concepts to long-term memory.</p>
              <textarea 
                className="input-field" 
                rows={4}
                placeholder="e.g. Mastered conservation of angular momentum about pivot. Solved 15 tricky center of mass problems..." 
                value={learnedText} 
                onChange={(e) => setLearnedText(e.target.value)}
                style={{width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.92rem', resize: 'vertical'}}
              />
            </div>

            <div className="glass" style={{padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(255,255,255,0.08)'}}>
              <h3 style={{fontSize: '1.05rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <Target size={18} color="var(--accent-math)" /> Quick Mistakes & Weak Spots
              </h3>
              <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px'}}>Silly calculation slips or conceptual confusion to avoid repeating tomorrow.</p>
              <textarea 
                className="input-field" 
                rows={3}
                placeholder="e.g. Made sign error in work done by non-conservative forces. Need to review chapter 6 notes." 
                value={mistakesText} 
                onChange={(e) => setMistakesText(e.target.value)}
                style={{width: '100%', padding: '12px', borderRadius: '14px', fontSize: '0.92rem', resize: 'vertical'}}
              />
            </div>

            <button 
              className="btn-primary" 
              style={{padding: '12px 24px', borderRadius: '100px', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} 
              onClick={saveJournalEntry}
              disabled={!learnedText.trim() && !mistakesText.trim()}
            >
              <Save size={16}/> Save Daily Log (+15 XP)
            </button>
          </div>
        )}

        {/* Tab 2: Mistake Notebook & Fixes */}
        {journalTab === 'mistakes' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            {/* Add Mistake Form */}
            <div className="glass" style={{padding: '1.5rem', borderRadius: '22px', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(15,23,42,0.8))'}}>
              <h3 style={{fontSize: '1.1rem', fontWeight: 800, color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px'}}>
                <AlertCircle size={18}/> Log a Problem Mistake & Key Takeaway
              </h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newMistakeProblem.trim()) return;
                const newM = {
                  id: `m_${Date.now()}`,
                  date: 'Today',
                  subject: newMistakeSubject,
                  category: newMistakeCategory,
                  problem: newMistakeProblem.trim(),
                  fix: newMistakeFix.trim() || 'Review fundamental theory and solve 3 similar practice problems.',
                  resolved: false
                };
                setMistakesList(prev => [newM, ...prev]);
                setNewMistakeProblem('');
                setNewMistakeFix('');
                awardXP(10, 'Logged Mistake');
              }}>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px'}}>
                  <select className="input-field" value={newMistakeSubject} onChange={e => setNewMistakeSubject(e.target.value)} style={{flex: '0 0 auto', minWidth: '120px', borderRadius: '10px'}}>
                    {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="input-field" value={newMistakeCategory} onChange={e => setNewMistakeCategory(e.target.value)} style={{flex: '0 0 auto', minWidth: '160px', borderRadius: '10px'}}>
                    {['Silly Error 🤦‍♂️', 'Formula Slip 📐', 'Concept Gap 🧠', 'Time Pressure ⏱️'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={{marginBottom: '8px'}}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="What question / concept went wrong? (e.g. Mixed up parallel & series resonance)" 
                    value={newMistakeProblem} 
                    onChange={e => setNewMistakeProblem(e.target.value)} 
                    style={{width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem'}} 
                  />
                </div>

                <div style={{marginBottom: '12px'}}>
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Key Takeaway / Trick to fix it: (e.g. In parallel circuit, impedance is maximum at resonance)" 
                    value={newMistakeFix} 
                    onChange={e => setNewMistakeFix(e.target.value)} 
                    style={{width: '100%', padding: '10px 14px', borderRadius: '12px', fontSize: '0.9rem'}} 
                  />
                </div>

                <button type="submit" className="btn-primary" style={{padding: '8px 20px', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 'bold'}} disabled={!newMistakeProblem.trim()}>
                  + Save to Mistake Notebook (+10 XP)
                </button>
              </form>
            </div>

            {/* Mistake Bank List */}
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h4 style={{fontSize: '0.95rem', fontWeight: 800, color: 'white', margin: 0}}>
                  Mistakes Review Bank ({mistakesList.length})
                </h4>
                <span style={{fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 'bold'}}>
                  {mistakesList.filter(m => m.resolved).length} Mastered
                </span>
              </div>

              {mistakesList.length === 0 ? (
                <div className="glass" style={{padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', borderRadius: '20px'}}>
                  <p>No mistakes logged yet! Log errors from your mocks or PYQs to track your learning.</p>
                </div>
              ) : (
                mistakesList.map(m => (
                  <div key={m.id} className="mistake-card" style={{borderLeft: m.resolved ? '4px solid var(--accent-success)' : '4px solid #ef4444'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px'}}>
                      <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                        <span style={{fontSize: '0.72rem', background: 'rgba(255,255,255,0.08)', color: 'white', padding: '2px 8px', borderRadius: '100px', fontWeight: 'bold'}}>
                          {m.subject}
                        </span>
                        <span style={{fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', padding: '2px 8px', borderRadius: '100px', fontWeight: 'bold'}}>
                          {m.category}
                        </span>
                      </div>
                      <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>{m.date}</span>
                    </div>

                    <div style={{fontSize: '0.92rem', fontWeight: 700, color: 'white', marginTop: '2px'}}>
                      {m.problem}
                    </div>

                    <div style={{fontSize: '0.82rem', color: '#93c5fd', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '8px', borderLeft: '2px solid #3b82f6'}}>
                      💡 <span style={{fontWeight: 600}}>Key Takeaway:</span> {m.fix}
                    </div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px'}}>
                      <button 
                        onClick={() => {
                          setMistakesList(prev => prev.map(x => x.id === m.id ? { ...x, resolved: !x.resolved } : x));
                        }}
                        style={{background: 'transparent', border: 'none', color: m.resolved ? 'var(--accent-success)' : 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}
                      >
                        <Check size={14}/> {m.resolved ? 'Mastered (Click to review)' : 'Mark as Mastered'}
                      </button>
                      <button 
                        onClick={() => {
                          setMistakesList(prev => prev.filter(x => x.id !== m.id));
                        }}
                        style={{background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', cursor: 'pointer'}}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Past History */}
        {journalTab === 'history' && (
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
            <h4 style={{fontSize: '1rem', fontWeight: 800, color: 'white', margin: 0}}>
              Past Reflections ({journalHistory.length})
            </h4>
            {journalHistory.map((log, i) => (
              <div key={i} className="glass" style={{padding: '1.25rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.06)'}}>
                <div style={{fontSize: '0.8rem', color: 'var(--accent-physics)', fontWeight: 'bold', marginBottom: '6px'}}>
                  {log.date}
                </div>
                <div style={{fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5, whiteSpace: 'pre-line'}}>
                  {log.text}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    );
  };

  const renderPlanner = () => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayStr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
    const subjectColors = { Physics:'#8b5cf6', Chemistry:'#ec4899', Mathematics:'#3b82f6', Biology:'#10b981', History:'#f59e0b', Polity:'#06b6d4', Geography:'#8b5cf6', Economy:'#ef4444' };

    const totalScheduled = days.reduce((s,d) => s + (plannerTasks[d]?.length || 0), 0);
    const totalDone = days.reduce((s,d) => s + (plannerTasks[d]?.filter(t=>t.done).length || 0), 0);
    const activeDayBlocks = selectedPlannerDay === 'all' ? days : [selectedPlannerDay];

    return (
      <div className="animate-fade-in" style={{display:'flex', flexDirection:'column', gap:'1.5rem', maxWidth:'1100px', margin: '0 auto', width: '100%'}}>
        
        {/* Header & Stats Banner */}
        <div className="glass" style={{padding:'1.75rem', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(15,23,42,0.8) 100%)', border: '1px solid rgba(139,92,246,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem'}}>
          <div>
            <h2 style={{fontSize:'clamp(1.3rem, 3vw, 1.8rem)', fontWeight:900, color: 'white', display:'flex', alignItems:'center', gap:'10px', margin: '0 0 6px'}}>
              <Calendar size={24} color="var(--accent-physics)"/> Weekly Study Masterplan
            </h2>
            <p style={{color:'var(--text-muted)', fontSize: '0.9rem', margin: 0}}>Schedule study blocks, hit daily targets, and stay ahead.</p>
          </div>
          <div style={{display: 'flex', gap: '8px'}}>
            <div style={{background: 'rgba(0,0,0,0.3)', padding: '8px 14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center'}}>
              <div style={{fontSize: '1.2rem', fontWeight: 900, color: 'var(--accent-success)'}}>{totalDone}/{totalScheduled}</div>
              <div style={{fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600}}>Blocks Done</div>
            </div>
          </div>
        </div>

        {/* Mobile & Desktop Day Strip Selector */}
        <div className="planner-day-strip">
          {days.map(d => {
            const isToday = d === todayStr;
            const isSelected = selectedPlannerDay === d;
            const tasksCount = (plannerTasks[d] || []).length;
            const doneCount = (plannerTasks[d] || []).filter(t => t.done).length;
            return (
              <div 
                key={d} 
                onClick={() => setSelectedPlannerDay(d)}
                className={`planner-day-pill ${isSelected ? 'active' : ''}`}
              >
                <div style={{fontSize: '0.85rem', fontWeight: 800}}>{d}</div>
                <div style={{fontSize: '0.65rem', marginTop: '2px', opacity: 0.85}}>
                  {isToday ? 'Today' : (tasksCount > 0 ? `${doneCount}/${tasksCount}` : '–')}
                </div>
              </div>
            );
          })}
          <div 
            onClick={() => setSelectedPlannerDay('all')}
            className={`planner-day-pill ${selectedPlannerDay === 'all' ? 'active' : ''}`}
          >
            <div style={{fontSize: '0.85rem', fontWeight: 800}}>All Days</div>
            <div style={{fontSize: '0.65rem', marginTop: '2px', opacity: 0.85}}>Overview</div>
          </div>
        </div>

        {/* Add Study Block Form - Mobile-Friendly */}
        <div className="glass" style={{padding:'1.25rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)'}}>
          <h3 style={{fontSize:'0.95rem', fontWeight:800, marginBottom:'12px', display:'flex', alignItems:'center', gap:'6px', color: 'var(--accent-success)'}}>
            <Sparkles size={16}/> Schedule a Study Block
          </h3>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap', alignItems: 'center'}}>
            <select className="input-field" value={plannerDay} onChange={e => setPlannerDay(e.target.value)} style={{flex:'0 0 auto', minWidth:'90px', borderRadius: '10px'}}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" className="input-field" value={plannerTime} onChange={e => setPlannerTime(e.target.value)} style={{flex:'0 0 auto', width:'120px', borderRadius: '10px'}} />
            <select className="input-field" value={plannerSubject} onChange={e => setPlannerSubject(e.target.value)} style={{flex:'0 0 auto', minWidth:'130px', borderRadius: '10px'}}>
              <option value="">Subject...</option>
              {subjects.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
            </select>
            <input className="input-field" placeholder="What will you conquer? (e.g. HC Verma Ch.12)" value={plannerInput} onChange={e => setPlannerInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlannerTask()} style={{flex:'1 1 200px', borderRadius: '10px'}} />
            <button className="btn-primary" onClick={addPlannerTask} style={{flex:'0 0 auto', borderRadius: '10px', padding: '10px 20px', fontWeight: 'bold'}} disabled={!plannerInput.trim()}>
              <Plus size={16}/> Add Block
            </button>
          </div>
        </div>

        {/* Days Display Grid */}
        <div style={{display:'grid', gridTemplateColumns:`repeat(auto-fit, minmax(${selectedPlannerDay === 'all' ? '280px' : '100%'}, 1fr))`, gap:'1rem'}}>
          {activeDayBlocks.map(day => {
            const tasks = plannerTasks[day] || [];
            const done = tasks.filter(t => t.done).length;
            const isToday = day === todayStr;
            const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

            return (
              <div key={day} className="glass" style={{padding:'1.25rem', borderRadius: '22px', border: isToday ? '1px solid rgba(139,92,246,0.45)' : '1px solid rgba(255,255,255,0.06)', background: isToday ? 'linear-gradient(180deg, rgba(139,92,246,0.08) 0%, rgba(15,23,42,0.8) 100%)' : 'rgba(15, 23, 42, 0.5)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontSize:'1.2rem', fontWeight:900, color: 'white'}}>{day}</span>
                    {isToday && <span style={{fontSize:'0.68rem', color:'var(--accent-physics)', background: 'rgba(139,92,246,0.2)', padding: '2px 8px', borderRadius: '100px', fontWeight: 800}}>TODAY</span>}
                  </div>
                  {tasks.length > 0 && (
                    <span style={{fontSize:'0.8rem', color: done === tasks.length ? 'var(--accent-success)' : 'white', fontWeight: 800}}>
                      {done}/{tasks.length} Done ({pct}%)
                    </span>
                  )}
                </div>

                {tasks.length === 0 ? (
                  <div style={{padding: '2rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.25)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                    <Calendar size={28} opacity={0.4}/>
                    <span style={{fontSize:'0.85rem'}}>No blocks scheduled for {day}. Enjoy rest or add a target!</span>
                  </div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                    {tasks.map(task => (
                      <div key={task.id} style={{display:'flex', gap:'10px', alignItems:'center', background: 'rgba(0,0,0,0.25)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)'}}>
                        <button onClick={() => togglePlannerTask(day, task.id)} style={{width:'20px', height:'20px', minWidth:'20px', borderRadius:'6px', border:`2px solid ${task.done ? 'var(--accent-success)' : 'rgba(255,255,255,0.2)'}`, background: task.done ? 'var(--accent-success)' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          {task.done && <Check size={13} color="white" strokeWidth={3}/>}
                        </button>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px', flexWrap: 'wrap'}}>
                            {task.time && <span style={{fontSize:'0.68rem', color:'white', background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px'}}>{task.time}</span>}
                            {task.subject && <span style={{fontSize:'0.68rem', padding:'1px 6px', borderRadius: '100px', background:`${subjectColors[task.subject] || '#8b5cf6'}22`, color: subjectColors[task.subject] || 'var(--accent-physics)', fontWeight: 800}}>{task.subject}</span>}
                          </div>
                          <div style={{fontSize:'0.88rem', textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text-muted)' : 'white', wordBreak: 'break-word'}}>
                            {task.text}
                          </div>
                        </div>
                        <button onClick={() => deletePlannerTask(day, task.id)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px'}} title="Delete">
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  const renderCommunity = () => {
    const getProfileData = (username) => {
      if (usersDb && usersDb[username]?.profile) return usersDb[username].profile;
      if (firebaseUsers && firebaseUsers[username]) {
        return {
          prepType: firebaseUsers[username].prepType || "JEE",
          xp: firebaseUsers[username].xp || 0,
          targetYear: firebaseUsers[username].targetYear || "2026",
          dreamCollege: firebaseUsers[username].dreamCollege || "Top National Institute",
          bio: firebaseUsers[username].bio || "Dedicated aspirant relentless on the daily grind.",
          motto: firebaseUsers[username].motto || "Champions do in practice what they expect to perform in the arena.",
          strengths: firebaseUsers[username].strengths || "Problem Solving, Consistency",
          weakness: firebaseUsers[username].weakness || "Time management in mocks",
          targetHours: firebaseUsers[username].targetHours || 8,
          lastActive: firebaseUsers[username].lastActive || 0
        };
      }
      const post = feed.find(f => f.user === username);
      return { 
        prepType: post?.prep || "JEE", 
        xp: post?.xp || 0,
        targetYear: "2026",
        dreamCollege: "Top National Institute",
        bio: "Dedicated aspirant relentless on the daily grind.",
        motto: "Hard work beats talent."
      };
    };

    const onlineThreshold = 5 * 60 * 1000;
    const now = Date.now();
    
    // Build unique users from feed and usersDb, and mark them online if active recently
    // Build unique users from feed and usersDb, and mark them online if active recently
    const recentUsersMap = new Map();

    // Merge in actual feed activity
    feed.forEach(f => {
       if (!recentUsersMap.has(f.user)) recentUsersMap.set(f.user, f);
       else if (f.createdAt > (recentUsersMap.get(f.user).createdAt || 0)) recentUsersMap.set(f.user, f);
    });

    // Also ensure all registered users (local) are in the list
    Object.keys(usersDb || {}).forEach(username => {
       if (!recentUsersMap.has(username)) {
          recentUsersMap.set(username, {
             user: username,
             xp: usersDb[username].profile?.xp || 0,
             createdAt: 0 // Default to offline if no recent activity
          });
       }
    });

    // Merge global firebase users
    Object.keys(firebaseUsers || {}).forEach(username => {
       const fbUser = firebaseUsers[username];
       if (!recentUsersMap.has(username) || fbUser.lastActive > (recentUsersMap.get(username).createdAt || 0)) {
          recentUsersMap.set(username, {
             user: username,
             xp: fbUser.xp || 0,
             createdAt: fbUser.lastActive || 0
          });
       }
    });
    
    let allPeers = Array.from(recentUsersMap.values())
       .map(f => {
       const isOnline = f.createdAt ? (now - f.createdAt) < onlineThreshold : false;
       const { level } = getLevelData(f.xp || 0);
       const prof = getProfileData(f.user);
       return { 
         name: f.user, 
         xp: f.xp || prof?.xp || 0, 
         level, 
         isOnline,
         prepType: prof?.prepType || 'JEE',
         targetYear: prof?.targetYear || '2026',
         dreamCollege: prof?.dreamCollege || 'Top National Institute',
         bio: prof?.bio || 'Dedicated aspirant relentless on the daily grind.',
         motto: prof?.motto || 'Consistency is the key.'
       };
    });

    allPeers = allPeers.sort((a,b) => b.isOnline - a.isOnline);

    const conversationMap = new Map();
    feed.forEach(message => {
      const otherUser = getDmOtherUser(message.action, sessionUser);
      if (otherUser) {
        const lastRead = Number(localStorage.getItem(`pm_last_read_dm_${otherUser}`)) || 0;
        const isFromOther = message.user !== sessionUser;
        const isUnread = isFromOther && (!message.createdAt || message.createdAt > lastRead);

        if (!conversationMap.has(otherUser)) {
          conversationMap.set(otherUser, {
            name: otherUser,
            lastMessage: message,
            hasUnread: isUnread,
            unreadCount: isUnread ? 1 : 0
          });
        } else {
          const prev = conversationMap.get(otherUser);
          if (isUnread) prev.unreadCount = (prev.unreadCount || 0) + 1;
          if (message.createdAt > (prev.lastMessage?.createdAt || 0)) {
            prev.lastMessage = message;
          }
          if (isUnread) prev.hasUnread = true;
        }
      }
    });

    const conversationPeers = Array.from(conversationMap.keys()).map(name => {
      const peerObj = allPeers.find(p => p.name.toLowerCase() === name.toLowerCase());
      const convData = conversationMap.get(name);
      return {
        name,
        xp: peerObj?.xp || 0,
        level: peerObj?.level || 1,
        isOnline: peerObj?.isOnline || false,
        lastMessage: convData?.lastMessage,
        hasUnread: convData?.hasUnread,
        unreadCount: convData?.unreadCount || 0
      };
    });

    const otherPeers = allPeers.filter(peer => 
      peer.name !== sessionUser && 
      !conversationPeers.some(cp => cp.name.toLowerCase() === peer.name.toLowerCase())
    );

    const chatMessages = feed.filter(f => {
       if (activeChat === "global") return !f.action?.startsWith("@DM_");
       const targetUser = activeChat.split(":")[1];
       return isDmBetween(f.action, sessionUser, targetUser);
    });

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      
      const currentInput = chatInput.trim();
      const currentReply = replyingTo;
      setChatInput(""); // Clear immediately for snappy UX
      setReplyingTo(null);

      let finalMsg = currentInput;
      if (activeChat !== "global") {
        const targetUser = activeChat.split(":")[1];
        finalMsg = `@DM_${sessionUser}_${targetUser} ${finalMsg}`;
      }
      
      trackPostCreated();
      try {
        const id = await gunPostMessage(finalMsg, currentReply);
        if (id) {
          awardXP(2, 'Community Post');
        }
      } catch (err) {
        console.error("Failed sending message:", err);
      }
    };

    const handleCreateMission = () => {
       const title = prompt("Enter Mission Title (e.g. Complete Mechanics):");
       if (!title) return;
       const desc = prompt("Enter short description:");
       const newMission = {
          id: Date.now().toString(),
          admin: sessionUser,
          title,
          desc: desc || "",
          target: 100,
          members: [{ user: sessionUser, progress: 0 }]
       };
       const updated = [...squadMissions, newMission];
       setSquadMissions(updated);
       localStorage.setItem("pm_squads", JSON.stringify(updated));
    };

    const handleJoinMission = (missionId) => {
       setSquadMissions(prev => {
          const updated = prev.map(m => {
             if (m.id === missionId && !m.members.find(x => x.user === sessionUser)) {
                return { ...m, members: [...m.members, { user: sessionUser, progress: 0 }] };
             }
             return m;
          });
          localStorage.setItem("pm_squads", JSON.stringify(updated));
          return updated;
       });
       alert("Joined the mission! Update your progress daily.");
    };

    const handleUpdateMissionProgress = (missionId) => {
       const prg = parseInt(prompt("Enter your progress percentage (0-100):"));
       if (isNaN(prg) || prg < 0 || prg > 100) return;
       setSquadMissions(prev => {
          const updated = prev.map(m => {
             if (m.id === missionId) {
                return {
                   ...m,
                   members: m.members.map(mbr => mbr.user === sessionUser ? { ...mbr, progress: prg } : mbr)
                };
             }
             return m;
          });
          localStorage.setItem("pm_squads", JSON.stringify(updated));
          return updated;
       });
    };

    return (
      <div className="community-wrapper animate-fade-in" style={{height: "100%", width: "100%", display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", gap: "6px", boxSizing: "border-box"}}>

        {/* Community Moderation Modal */}
        {showModerationModal && (() => {
          const allMemberNames = Array.from(new Set([
            ...Object.keys(firebaseUsers || {}),
            ...feed.map(f => f.user),
            ...Object.keys(usersDb || {})
          ])).filter(u => u && !u.startsWith('Guest_'));

          const filteredList = allMemberNames.filter(u => {
            if (modFilterTab === 'banned') return (bannedUsers || []).includes(u);
            return true;
          }).filter(u => !modSearch.trim() || u.toLowerCase().includes(modSearch.toLowerCase()));

          return (
            <div style={{position:"fixed", inset:0, zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)", padding:"1rem"}} onClick={() => setShowModerationModal(false)}>
              <div className="glass" style={{maxWidth:"740px", width:"100%", maxHeight:"88vh", display:"flex", flexDirection:"column", borderRadius:"24px", padding:"1.5rem", border:"1px solid rgba(255,255,255,0.12)", background:"#0f172a", position:"relative"}} onClick={e => e.stopPropagation()}>
                
                {/* Header */}
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem", borderBottom:"1px solid rgba(255,255,255,0.08)", paddingBottom:"10px"}}>
                  <div>
                    <h2 style={{fontSize:"1.2rem", fontWeight:800, color:"white", display:"flex", alignItems:"center", gap:"8px", margin:0}}>
                      <Shield color="#f87171" size={20}/> Community Moderation
                    </h2>
                    <p style={{color:"var(--text-muted)", fontSize:"0.82rem", marginTop:"3px", marginBottom:0}}>
                      Manage unwanted users, purge spam posts, or clean ghost accounts.
                    </p>
                  </div>
                  <button onClick={() => setShowModerationModal(false)} style={{background:"transparent", border:"none", color:"var(--text-muted)", cursor:"pointer", padding:"4px"}}><X size={18}/></button>
                </div>

                {/* Quick Actions Bar */}
                <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:"10px", marginBottom:"1rem"}}>
                  <div style={{background:"rgba(255,255,255,0.03)", padding:"10px 12px", borderRadius:"14px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"8px"}}>
                    <div>
                      <div style={{fontWeight:"bold", fontSize:"0.82rem", color:"white"}}>🧹 Ghost Cleaner</div>
                      <div style={{fontSize:"0.7rem", color:"var(--text-muted)"}}>Purge inactive temporary Guest accounts</div>
                    </div>
                    <button
                      onClick={async () => {
                        const cleaned = await cleanupGuestUsers();
                        alert(cleaned > 0 ? `Cleaned up ${cleaned} ghost accounts from Firebase database!` : 'Database is clean! No ghost accounts found.');
                      }}
                      style={{padding:"6px 12px", borderRadius:"10px", background:"rgba(59, 130, 246, 0.15)", border:"1px solid rgba(59, 130, 246, 0.3)", color:"#60a5fa", fontWeight:"bold", fontSize:"0.76rem", cursor:"pointer", whiteSpace:"nowrap"}}
                    >
                      Clean Database
                    </button>
                  </div>

                  <form 
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const target = customBanInput.trim();
                      if (!target) return;
                      if (window.confirm(`Permanently BAN @${target} and delete all their posts?`)) {
                        await banUser(target);
                        setCustomBanInput('');
                        alert(`@${target} is now banned.`);
                      }
                    }}
                    style={{background:"rgba(255,255,255,0.03)", padding:"10px 12px", borderRadius:"14px", border:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", gap:"8px"}}
                  >
                    <input 
                      type="text" 
                      placeholder="Username to ban..." 
                      value={customBanInput} 
                      onChange={e => setCustomBanInput(e.target.value)} 
                      style={{flex:1, minWidth:0, padding:"6px 10px", borderRadius:"8px", background:"rgba(0,0,0,0.3)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:"0.8rem", outline:"none"}}
                    />
                    <button type="submit" style={{padding:"6px 12px", borderRadius:"10px", background:"rgba(239, 68, 68, 0.15)", border:"1px solid rgba(239, 68, 68, 0.3)", color:"#f87171", fontWeight:"bold", fontSize:"0.76rem", cursor:"pointer", whiteSpace:"nowrap"}} disabled={!customBanInput.trim()}>
                      Ban & Purge
                    </button>
                  </form>
                </div>

                {/* Filter Tabs */}
                <div style={{display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:"8px", marginBottom:"10px"}}>
                  <div style={{display:"flex", gap:"6px"}}>
                    <button onClick={() => setModFilterTab('all')} style={{padding:"5px 12px", borderRadius:"100px", fontSize:"0.8rem", fontWeight:"bold", border:"none", cursor:"pointer", background: modFilterTab === 'all' ? "var(--accent-physics)" : "rgba(255,255,255,0.06)", color:"white"}}>
                      All Members ({allMemberNames.length})
                    </button>
                    <button onClick={() => setModFilterTab('banned')} style={{padding:"5px 12px", borderRadius:"100px", fontSize:"0.8rem", fontWeight:"bold", border:"none", cursor:"pointer", background: modFilterTab === 'banned' ? "#ef4444" : "rgba(255,255,255,0.06)", color:"white"}}>
                      Banned ({(bannedUsers || []).length})
                    </button>
                  </div>
                  
                  <div style={{position:"relative", flex:1, maxWidth:"200px"}}>
                    <input 
                      type="text" 
                      placeholder="Search member..." 
                      value={modSearch} 
                      onChange={e => setModSearch(e.target.value)} 
                      style={{width:"100%", padding:"5px 10px 5px 28px", borderRadius:"100px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"white", fontSize:"0.8rem", outline:"none"}}
                    />
                    <Search size={13} style={{position:"absolute", left:"9px", top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)"}}/>
                  </div>
                </div>

                {/* Member Directory List */}
                <div style={{flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"6px", paddingRight:"4px"}}>
                  {filteredList.length === 0 ? (
                    <div style={{textAlign:"center", padding:"2rem 1rem", color:"var(--text-muted)", fontSize:"0.85rem"}}>
                      No members found matching filter.
                    </div>
                  ) : (
                    filteredList.map(username => {
                      const isSelf = username === sessionUser;
                      const isBanned = (bannedUsers || []).includes(username);
                      const userPostsCount = feed.filter(f => f.user === username).length;

                      return (
                        <div 
                          key={username} 
                          style={{
                            display:"flex", alignItems:"center", justifyContent:"space-between", gap:"10px",
                            padding:"8px 12px", borderRadius:"12px", background:"rgba(255,255,255,0.02)",
                            border: isBanned ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255,255,255,0.05)"
                          }}
                        >
                          <div style={{display:"flex", alignItems:"center", gap:"8px", minWidth:0}}>
                            <div style={{width:"32px", height:"32px", borderRadius:"8px", background:getAvatarColor(username), display:"flex", alignItems:"center", justifyContent:"center", fontWeight:"bold", color:"white", flexShrink:0, fontSize:"0.85rem"}}>
                              {username.charAt(0).toUpperCase()}
                            </div>
                            <div style={{display:"flex", flexDirection:"column", minWidth:0}}>
                              <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                                <span style={{fontWeight:"bold", fontSize:"0.85rem", color:"white", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>{username}</span>
                                {isSelf && <span style={{fontSize:"0.62rem", background:"rgba(59, 130, 246, 0.2)", color:"#60a5fa", padding:"1px 5px", borderRadius:"4px", fontWeight:"bold"}}>You</span>}
                                {isBanned && <span style={{fontSize:"0.62rem", background:"rgba(239, 68, 68, 0.2)", color:"#f87171", padding:"1px 5px", borderRadius:"4px", fontWeight:"bold"}}>Banned</span>}
                              </div>
                              <span style={{fontSize:"0.68rem", color:"var(--text-muted)"}}>
                                {userPostsCount} message{userPostsCount !== 1 ? 's' : ''} in lounge
                              </span>
                            </div>
                          </div>

                          <div style={{display:"flex", alignItems:"center", gap:"6px", flexShrink:0}}>
                            {isBanned ? (
                              <button
                                onClick={async () => {
                                  await unbanUser(username);
                                  alert(`@${username} has been unbanned.`);
                                }}
                                style={{padding:"5px 10px", borderRadius:"8px", background:"rgba(16, 185, 129, 0.15)", border:"1px solid rgba(16, 185, 129, 0.3)", color:"#10b981", fontWeight:"bold", fontSize:"0.75rem", cursor:"pointer"}}
                              >
                                Unban
                              </button>
                            ) : !isSelf ? (
                              <>
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Remove @${username} from community users directory?`)) {
                                      await removeUser(username);
                                      alert(`@${username} removed.`);
                                    }
                                  }}
                                  title="Remove from users list"
                                  style={{padding:"5px 9px", borderRadius:"8px", background:"rgba(239, 68, 68, 0.1)", border:"1px solid rgba(239, 68, 68, 0.2)", color:"#ef4444", fontSize:"0.72rem", fontWeight:"600", cursor:"pointer", display:"flex", alignItems:"center", gap:"3px"}}
                                >
                                  <Trash2 size={11}/> Remove
                                </button>

                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Permanently BAN @${username} and wipe all their posts?`)) {
                                      await banUser(username);
                                      alert(`@${username} has been banned and posts purged.`);
                                    }
                                  }}
                                  title="Ban permanently and wipe all posts"
                                  style={{padding:"5px 9px", borderRadius:"8px", background:"rgba(220, 38, 38, 0.2)", border:"1px solid rgba(220, 38, 38, 0.35)", color:"#f87171", fontSize:"0.72rem", fontWeight:"bold", cursor:"pointer", display:"flex", alignItems:"center", gap:"3px"}}
                                >
                                  <UserX size={11}/> Ban
                                </button>
                              </>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>
            </div>
          );
        })()}

        {/* Study Doubt & Practice Question Modal */}
                {/* Direct Message Aspirant Picker Modal */}
        {showPeerPicker && (
          <div style={{position: "fixed", inset: 0, zIndex: 650, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", padding: "1rem"}} onClick={() => setShowPeerPicker(false)}>
            <div className="glass" style={{maxWidth: "460px", width: "100%", maxHeight: "80vh", display: "flex", flexDirection: "column", borderRadius: "24px", padding: "1.5rem", border: "1px solid rgba(236, 72, 153, 0.3)", background: "#0f172a", position: "relative"}} onClick={e => e.stopPropagation()}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px"}}>
                <h3 style={{fontSize: "1.1rem", fontWeight: "800", color: "white", display: "flex", alignItems: "center", gap: "8px", margin: 0}}>
                  <Users color="#ec4899" size={20}/> Message a Peer
                </h3>
                <button onClick={() => setShowPeerPicker(false)} style={{background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px"}}><X size={18}/></button>
              </div>

              <div style={{marginBottom: "12px"}}>
                <input
                  type="text"
                  placeholder="Search aspirants by name..."
                  value={peerSearchQuery}
                  onChange={e => setPeerSearchQuery(e.target.value)}
                  style={{width: "100%", padding: "10px 14px", borderRadius: "12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box"}}
                />
              </div>

              <div className="custom-scrollbar" style={{overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "6px", maxHeight: "350px"}}>
                {allPeers
                  .filter(p => p.name !== sessionUser && p.name.toLowerCase().includes((peerSearchQuery || '').toLowerCase()))
                  .map(peer => (
                    <div 
                      key={peer.name}
                      onClick={() => {
                        setActiveChat(`user:${peer.name}`);
                        setShowPeerPicker(false);
                      }}
                      style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", cursor: "pointer", border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.2s"}}
                    >
                      <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                        <div style={{position: "relative"}}>
                          <div style={{width: "36px", height: "36px", borderRadius: "10px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "white", fontSize: "0.95rem"}}>
                            {peer.name.charAt(0).toUpperCase()}
                          </div>
                          {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "9px", height: "9px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                        </div>
                        <div>
                          <div style={{fontWeight: "700", fontSize: "0.88rem", color: "white"}}>{peer.name}</div>
                          <div style={{fontSize: "0.68rem", color: peer.isOnline ? "#10b981" : "var(--text-muted)"}}>
                            {peer.isOnline ? "🟢 Active now" : `Lvl ${peer.level}`}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        style={{background: "linear-gradient(135deg, #ec4899, #8b5cf6)", border: "none", color: "white", padding: "6px 14px", borderRadius: "100px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer"}}
                      >
                        Chat
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

{showDoubtModal && (
          <div style={{position: "fixed", inset: 0, zIndex: 650, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", padding: "1rem"}} onClick={() => setShowDoubtModal(false)}>
            <div className="glass" style={{maxWidth: "520px", width: "100%", borderRadius: "24px", padding: "1.75rem", border: "1px solid rgba(168, 85, 247, 0.3)", background: "#0f172a", position: "relative"}} onClick={e => e.stopPropagation()}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "10px"}}>
                <h3 style={{fontSize: "1.15rem", fontWeight: "800", color: "white", display: "flex", alignItems: "center", gap: "8px", margin: 0}}>
                  <HelpCircle color="#c084fc" size={20}/> Ask Study Doubt / Quiz
                </h3>
                <button onClick={() => setShowDoubtModal(false)} style={{background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px"}}><X size={18}/></button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!doubtQuestion.trim()) return;
                const doubtPayload = `[DOUBT:${doubtSubject}${doubtHint.trim() ? `|HINT:${doubtHint.trim()}` : ''}] ${doubtQuestion.trim()}`;
                setShowDoubtModal(false);
                setDoubtQuestion('');
                setDoubtHint('');
                const id = await gunPostMessage(doubtPayload);
                if (id) awardXP(5, 'Shared Doubt');
              }}>
                <div style={{marginBottom: "12px"}}>
                  <label style={{fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px"}}>Select Subject</label>
                  <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
                    {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'General'].map(sub => (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => setDoubtSubject(sub)}
                        style={{
                          padding: "6px 14px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "bold", border: "none", cursor: "pointer",
                          background: doubtSubject === sub ? "linear-gradient(135deg, #9333ea, #c026d3)" : "rgba(255,255,255,0.06)",
                          color: "white", transition: "all 0.2s"
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{marginBottom: "12px"}}>
                  <label style={{fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px"}}>Question / Doubt Statement</label>
                  <textarea
                    rows={4}
                    placeholder="Type your question, concept confusion, or formula doubt here..."
                    value={doubtQuestion}
                    onChange={e => setDoubtQuestion(e.target.value)}
                    style={{width: "100%", padding: "12px", borderRadius: "14px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.92rem", resize: "none", outline: "none", boxSizing: "border-box"}}
                    autoFocus
                  />
                </div>

                <div style={{marginBottom: "18px"}}>
                  <label style={{fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600", display: "block", marginBottom: "6px"}}>Optional Hint or Key Clue</label>
                  <input
                    type="text"
                    placeholder="e.g. Hint: Conserve mechanical energy about hinge..."
                    value={doubtHint}
                    onChange={e => setDoubtHint(e.target.value)}
                    style={{width: "100%", padding: "10px 14px", borderRadius: "12px", background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.85rem", outline: "none", boxSizing: "border-box"}}
                  />
                </div>

                <div style={{display: "flex", justifyContent: "flex-end", gap: "8px"}}>
                  <button type="button" onClick={() => setShowDoubtModal(false)} style={{padding: "8px 18px", borderRadius: "100px", background: "rgba(255,255,255,0.08)", border: "none", color: "white", cursor: "pointer", fontSize: "0.85rem", fontWeight: "600"}}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{padding: "8px 20px", borderRadius: "100px", fontSize: "0.85rem", fontWeight: "bold"}} disabled={!doubtQuestion.trim()}>
                    🚀 Post Doubt (+5 XP)
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {viewingProfile && (() => {
          const prof = getProfileData(viewingProfile);
          const { level: pL, title: pT } = getLevelData(prof?.xp || 0);
          const isOnline = allPeers.find(p => p.name.toLowerCase() === viewingProfile.toLowerCase())?.isOnline || false;
          return (
            <div style={{position:"fixed", inset:0, zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.85)", backdropFilter:"blur(12px)", padding:"1rem"}} onClick={() => setViewingProfile(null)}>
              <div className="glass" style={{maxWidth:"440px", width:"100%", padding:"1.75rem", borderRadius:"24px", position:"relative", background: "#0f172a", border: "1px solid rgba(139,92,246,0.35)", boxShadow: "0 25px 60px rgba(0,0,0,0.7)"}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewingProfile(null)} style={{position:"absolute", top:"16px", right:"16px", background:"rgba(0,0,0,0.4)", border:"none", color:"#fff", cursor:"pointer", zIndex: 10, width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center"}}><X size={18}/></button>
                
                {/* Banner */}
                <div style={{height:"90px", borderRadius:"18px 18px 0 0", marginBottom:"-36px", background:`linear-gradient(135deg, ${getAvatarColor(viewingProfile)}, #1e1b4b)`, marginLeft:"-1.75rem", marginRight:"-1.75rem", marginTop:"-1.75rem"}}></div>
                
                {/* Avatar with Online Dot */}
                <div style={{display: "flex", alignItems: "flex-end", justifyContent: "space-between", position: "relative", zIndex: 1, marginBottom: "12px"}}>
                  <div style={{position: "relative"}}>
                    <div style={{width:"76px", height:"76px", borderRadius:"50%", background:getAvatarColor(viewingProfile), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"2.2rem", fontWeight:900, color:"#fff", border:"4px solid #0f172a", boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
                      {viewingProfile.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && <div style={{position: "absolute", bottom: "4px", right: "4px", width: "16px", height: "16px", borderRadius: "50%", background: "#10b981", border: "3px solid #0f172a"}} title="Online Now"></div>}
                  </div>
                  <div style={{display: "flex", gap: "6px"}}>
                    <span style={{fontSize: "0.75rem", padding: "3px 10px", borderRadius: "100px", background: "rgba(16,185,129,0.18)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 700}}>
                      {isOnline ? "🟢 Active Now" : "Offline"}
                    </span>
                    <span style={{fontSize: "0.75rem", padding: "3px 10px", borderRadius: "100px", background: "rgba(139,92,246,0.2)", color: "#c084fc", border: "1px solid rgba(139,92,246,0.35)", fontWeight: 700}}>
                      Lvl {pL} · {pT}
                    </span>
                  </div>
                </div>

                {/* User Details */}
                <h2 style={{fontSize:"1.4rem", fontWeight:900, margin:"0 0 4px 0", color:"#fff"}}>{viewingProfile}</h2>
                <div style={{fontSize:"0.84rem", color:"var(--accent-math)", fontWeight:700, marginBottom:"10px", display: "flex", alignItems: "center", gap: "6px"}}>
                  <Target size={14}/> {prof.prepType || "JEE"} {prof.targetYear || "2026"} · Aiming for: {prof.dreamCollege || "Top Institute"}
                </div>

                {/* Bio Quote */}
                <div style={{fontSize: "0.88rem", color: "#e2e8f0", background: "rgba(255,255,255,0.04)", padding: "10px 14px", borderRadius: "12px", borderLeft: "3px solid var(--accent-physics)", marginBottom: "12px", fontStyle: "italic"}}>
                  "{prof.bio || 'Dedicated aspirant grinding daily in Focus Mode.'}"
                </div>

                {/* Academic Highlights */}
                <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "16px"}}>
                  <div style={{background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)"}}>
                    <span style={{fontSize: "0.68rem", color: "var(--text-muted)", display: "block"}}>⚡ Lifetime XP</span>
                    <strong style={{fontSize: "0.95rem", color: "#fbbf24"}}>{prof.xp || 0} XP</strong>
                  </div>
                  <div style={{background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)"}}>
                    <span style={{fontSize: "0.68rem", color: "var(--text-muted)", display: "block"}}>💡 Key Strengths</span>
                    <strong style={{fontSize: "0.82rem", color: "#38bdf8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block"}}>{prof.strengths || "Physics & Math"}</strong>
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  className="btn-primary" 
                  style={{width: "100%", padding: "11px", borderRadius: "100px", fontSize: "0.92rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", boxShadow: "0 4px 15px rgba(236,72,153,0.4)"}} 
                  onClick={() => { setActiveChat(`user:${viewingProfile}`); setActiveCommunityTab("chat"); setViewingProfile(null); }}
                >
                  <MessageSquare size={16}/> Direct Message @${viewingProfile}
                </button>
              </div>
            </div>
          );
        })()}

                {/* Top Navigation Bar - Ultra Compact */}
        <div className="community-tabs">
           <div style={{display: "flex", alignItems: "center", gap: "6px", flexWrap: "nowrap", overflowX: "auto"}}>
             <button onClick={() => setActiveCommunityTab("chat")} style={{padding: "6px 14px", borderRadius: "100px", background: activeCommunityTab === "chat" ? "linear-gradient(135deg, var(--accent-physics), #c026d3)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", whiteSpace: "nowrap"}}>
               <MessageSquare size={14}/> Live Lounge
               {activeCommunityTab !== "chat" && unreadCommunityCount > 0 && (
                 <span style={{background: "#ef4444", color: "white", fontSize: "0.6rem", padding: "1px 6px", borderRadius: "100px", fontWeight: 900}}>
                   {unreadCommunityCount > 9 ? '9+' : unreadCommunityCount}
                 </span>
               )}
             </button>
             <button onClick={() => setActiveCommunityTab("peers")} style={{padding: "6px 14px", borderRadius: "100px", background: activeCommunityTab === "peers" ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", whiteSpace: "nowrap"}}>
               <Users size={14}/> Aspirants ({allPeers.length})
             </button>
             <button onClick={() => setActiveCommunityTab("squads")} style={{padding: "6px 14px", borderRadius: "100px", background: activeCommunityTab === "squads" ? "linear-gradient(135deg, var(--accent-math), #2563eb)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.82rem", whiteSpace: "nowrap"}}>
               <Target size={14}/> Squad Missions
             </button>
             <button onClick={() => setShowModerationModal(true)} style={{padding: "6px 12px", borderRadius: "100px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", fontWeight: "bold", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", whiteSpace: "nowrap"}}>
               <Shield size={13}/> Moderation
             </button>
           </div>

           <div style={{display: "flex", alignItems: "center", gap: "8px", flexShrink: 0}}>
             {/* Theme Switcher Pill */}
             <div style={{display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: "100px", padding: "2px", border: "1px solid rgba(255,255,255,0.08)", gap: "2px"}}>
               <button onClick={() => setBgTheme('universe-bg')} title="Universe Theme" style={{padding: "4px 8px", borderRadius: "100px", border: "none", background: bgTheme === 'universe-bg' ? 'var(--accent-physics)' : 'transparent', color: "white", fontSize: "0.72rem", cursor: "pointer"}}>🌌</button>
               <button onClick={() => setBgTheme('solid-dark-bg')} title="Dark Theme" style={{padding: "4px 8px", borderRadius: "100px", border: "none", background: bgTheme === 'solid-dark-bg' ? 'var(--accent-success)' : 'transparent', color: "white", fontSize: "0.72rem", cursor: "pointer"}}>🌑</button>
               <button onClick={() => setBgTheme('mesh-bg')} title="Mesh Theme" style={{padding: "4px 8px", borderRadius: "100px", border: "none", background: bgTheme === 'mesh-bg' ? 'var(--accent-math)' : 'transparent', color: "white", fontSize: "0.72rem", cursor: "pointer"}}>🕸️</button>
             </div>

             {/* Zen View Toggle (Desktop) */}
             <button 
               onClick={() => setIsZenMode(prev => !prev)}
               style={{background: isZenMode ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", borderRadius: "100px", padding: "5px 10px", cursor: "pointer", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px", fontWeight: "600", whiteSpace: "nowrap"}}
               title={isZenMode ? "Exit Zen Mode (Show Sidebar)" : "Enter Zen Mode (Full Width Chat)"}
             >
               {isZenMode ? <Minimize2 size={13}/> : <Maximize2 size={13}/>}
               <span className="zen-text">{isZenMode ? "Split" : "Zen"}</span>
             </button>
           </div>
        </div>

        {/* Tab Content */}
        {activeCommunityTab === "peers" ? (
          /* Aspirants Directory View */
          <div style={{display: "flex", flexDirection: "column", gap: "1rem", flex: 1, minHeight: 0, overflow: "hidden"}}>
            <div className="glass" style={{padding: "1rem 1.25rem", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "12px", flexShrink: 0, background: "rgba(15, 23, 42, 0.75)"}}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px"}}>
                <div>
                  <h2 style={{fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#fff", display: "flex", alignItems: "center", gap: "8px"}}>
                    <Users color="#10b981" size={20}/> Community Aspirants ({allPeers.length})
                  </h2>
                  <p style={{fontSize: "0.8rem", color: "var(--text-muted)", margin: "2px 0 0 0"}}>
                    Connect, exchange notes, and study with verified aspirants across India
                  </p>
                </div>
                <div style={{display: "flex", gap: "6px", flexWrap: "wrap"}}>
                  {['all', 'online', 'JEE', 'NEET', 'UPSC'].map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setAspirantFilterExam(f)}
                      style={{
                        padding: "5px 12px", borderRadius: "100px", fontSize: "0.78rem", fontWeight: "700", border: "none", cursor: "pointer",
                        background: aspirantFilterExam === f ? "linear-gradient(135deg, #10b981, #059669)" : "rgba(255,255,255,0.06)",
                        color: "white", transition: "all 0.2s"
                      }}
                    >
                      {f === 'all' ? `All (${allPeers.length})` : f === 'online' ? `🟢 Online (${allPeers.filter(p => p.isOnline).length})` : f}
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Search aspirants by name, dream college, or prep type..."
                value={aspirantSearchQuery}
                onChange={e => setAspirantSearchQuery(e.target.value)}
                style={{width: "100%", padding: "10px 16px", borderRadius: "12px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box"}}
              />
            </div>

            <div className="custom-scrollbar" style={{flex: 1, overflowY: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", paddingBottom: "1.5rem"}}>
              {allPeers
                .filter(p => {
                  const matchQuery = p.name.toLowerCase().includes(aspirantSearchQuery.toLowerCase()) || 
                                     (p.dreamCollege && p.dreamCollege.toLowerCase().includes(aspirantSearchQuery.toLowerCase())) ||
                                     (p.prepType && p.prepType.toLowerCase().includes(aspirantSearchQuery.toLowerCase()));
                  if (!matchQuery) return false;
                  if (aspirantFilterExam === 'online') return p.isOnline;
                  if (aspirantFilterExam !== 'all') return (p.prepType || '').toLowerCase() === aspirantFilterExam.toLowerCase();
                  return true;
                })
                .map(peer => (
                  <div
                    key={peer.name}
                    className="glass aspirant-card"
                    style={{
                      padding: "16px", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "12px",
                      background: "rgba(15, 23, 42, 0.65)", border: "1px solid rgba(255,255,255,0.08)", transition: "all 0.2s", position: "relative"
                    }}
                  >
                    <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                      <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                        <div style={{position: "relative", cursor: "pointer"}} onClick={() => setViewingProfile(peer.name)}>
                          <div style={{width: "46px", height: "46px", borderRadius: "14px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.2rem", color: "white", border: "2px solid rgba(255,255,255,0.12)"}}>
                            {peer.name.charAt(0).toUpperCase()}
                          </div>
                          {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}} title="Online"></div>}
                        </div>
                        <div>
                          <div style={{fontWeight: 800, fontSize: "0.98rem", color: "#fff", cursor: "pointer"}} onClick={() => setViewingProfile(peer.name)}>
                            {peer.name}
                          </div>
                          <div style={{fontSize: "0.74rem", color: "var(--accent-physics)", fontWeight: 700}}>
                            {peer.prepType || 'JEE'} {peer.targetYear || '2026'} · Lvl {peer.level}
                          </div>
                        </div>
                      </div>
                      <span style={{fontSize: "0.7rem", padding: "2px 8px", borderRadius: "100px", background: peer.isOnline ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.05)", color: peer.isOnline ? "#10b981" : "var(--text-muted)", fontWeight: 700}}>
                        {peer.isOnline ? "🟢 Online" : "Offline"}
                      </span>
                    </div>

                    <div style={{fontSize: "0.82rem", color: "#cbd5e1", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: "10px", lineHeight: 1.4, minHeight: "36px"}}>
                      🎯 Target: <strong style={{color: "#fff"}}>{peer.dreamCollege}</strong>
                    </div>

                    <div style={{display: "flex", gap: "8px", marginTop: "auto"}}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChat(`user:${peer.name}`);
                          setActiveCommunityTab("chat");
                        }}
                        style={{flex: 1, padding: "8px", borderRadius: "100px", background: "linear-gradient(135deg, #ec4899, #8b5cf6)", border: "none", color: "white", fontWeight: "bold", fontSize: "0.78rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px"}}
                      >
                        <MessageSquare size={14}/> Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setViewingProfile(peer.name)}
                        style={{padding: "8px 14px", borderRadius: "100px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "white", fontWeight: "600", fontSize: "0.78rem", cursor: "pointer"}}
                      >
                        Profile
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : activeCommunityTab === "chat" ? (
          <div className={`community-chat-layout ${isZenMode ? 'zen-mode' : ''}`}>
            
            {/* Left Peers List - Gamified Sidebar (Hidden in Zen Mode or on Mobile) */}
            {!isZenMode && (
              <div className="glass peers-sidebar custom-scrollbar">
                <div style={{padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                   <h3 style={{fontSize: "0.82rem", color: "white", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px", textTransform: "uppercase", letterSpacing: "1px", margin: 0}}>
                     <Users size={15} color="var(--accent-physics)"/> Connect
                   </h3>
                   <span style={{fontSize: "0.68rem", color: "#10b981", fontWeight: "bold"}}>🟢 {allPeers.filter(p => p.isOnline).length} Active</span>
                </div>
                
                {/* Instagram Notes & Status Stories (Sidebar Tray) */}
                <div style={{padding: "10px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(15, 23, 42, 0.4)", flexShrink: 0}}>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px"}}>
                    <span style={{fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold"}}>Study Notes</span>
                    <button 
                      onClick={() => {
                        const newN = prompt("Update your Instagram study note (e.g. Grinding Physics ⚡):", userNote);
                        if (newN !== null && newN.trim()) {
                          const cleanN = newN.trim().slice(0, 28);
                          setUserNote(cleanN);
                          localStorage.setItem('pm_user_note', cleanN);
                        }
                      }}
                      style={{background: "transparent", border: "none", color: "#f472b6", cursor: "pointer", fontSize: "0.72rem", fontWeight: "bold"}}
                    >
                      + Note
                    </button>
                  </div>
                  
                  <div className="custom-scrollbar" style={{display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "3px", scrollbarWidth: "none"}}>
                    {/* Self Note */}
                    <div 
                      onClick={() => {
                        const newN = prompt("Update your Instagram study note:", userNote);
                        if (newN !== null && newN.trim()) {
                          const cleanN = newN.trim().slice(0, 28);
                          setUserNote(cleanN);
                          localStorage.setItem('pm_user_note', cleanN);
                        }
                      }}
                      style={{display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0}}
                      title="Click to edit your note"
                    >
                      <div className="ig-story-avatar" style={{width: "40px", height: "40px"}}>
                        <div style={{width: "100%", height: "100%", borderRadius: "50%", background: getAvatarColor(sessionUser), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "2px solid #0f172a", fontSize: "0.95rem", color: "white"}}>
                          {sessionUser.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span style={{fontSize: "0.62rem", color: "#f472b6", marginTop: "3px", fontWeight: "bold", maxWidth: "52px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                        {userNote || "+ Note"}
                      </span>
                    </div>

                    {/* Peers Notes */}
                    {allPeers.slice(0, 10).map((peer, idx) => {
                      const peerNotes = ["Focus ⚡", "PYQs 🔥", "Quiz 💯", "Math 📐", "Mock 🎯", "Notes 🧪", "25m ⏱️", "Target ✨"];
                      const note = peerNotes[idx % peerNotes.length];
                      return (
                        <div 
                          key={peer.name} 
                          onClick={() => setActiveChat(`user:${peer.name}`)}
                          style={{display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0}}
                          title={`@${peer.name}: ${note}`}
                        >
                          <div className="ig-story-avatar" style={{width: "40px", height: "40px", background: peer.isOnline ? "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" : "rgba(255,255,255,0.2)"}}>
                            <div style={{width: "100%", height: "100%", borderRadius: "50%", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "2px solid #0f172a", fontSize: "0.95rem", color: "white"}}>
                              {peer.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <span style={{fontSize: "0.62rem", color: peer.isOnline ? "white" : "var(--text-muted)", marginTop: "3px", maxWidth: "52px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                            {peer.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sidebar Body */}
                <div style={{padding: "10px", flex: 1, overflowY: "auto"}}>
                  <div className={`peer-item ${activeChat === "global" ? "active" : ""}`} onClick={() => setActiveChat("global")} style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px", borderRadius: "14px", cursor: "pointer", transition: "all 0.2s", background: activeChat === "global" ? "rgba(139, 92, 246, 0.15)" : "transparent", border: activeChat === "global" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent", marginBottom: "0.75rem"}}>
                    <div style={{width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0, boxShadow: "0 4px 10px rgba(139,92,246,0.3)"}}>🌍</div>
                    <div style={{display: "flex", flexDirection: "column"}}>
                       <span style={{fontWeight: "bold", fontSize: "0.9rem", color: "white"}}>Global Lounge</span>
                       <span style={{fontSize: "0.68rem", color: "var(--accent-success)", fontWeight: "600"}}>Public Chat</span>
                    </div>
                  </div>

                  <h3 style={{fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.75rem 0 0.5rem 0", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold"}}>Direct Messages ({conversationPeers.length})</h3>
                  
                  <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                    {conversationPeers.map(peer => (
                      <div key={peer.name} className={`peer-item ${activeChat === `user:${peer.name}` ? "active" : ""}`} onClick={() => { setActiveChat(`user:${peer.name}`); try { localStorage.setItem(`pm_last_read_dm_${peer.name}`, Date.now().toString()); } catch {} }} style={{display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", background: activeChat === `user:${peer.name}` ? "rgba(255,255,255,0.08)" : "transparent"}}>
                        <div style={{position: "relative"}}>
                           <div style={{width: "34px", height: "34px", borderRadius: "10px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: "bold", flexShrink: 0, border: peer.isOnline ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)"}}>{peer.name.charAt(0).toUpperCase()}</div>
                           {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                        </div>
                        <div style={{display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                           <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", gap: "4px"}}>
                             <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: peer.isOnline ? "white" : "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem"}}>{peer.name}</span>
                             {peer.hasUnread && activeChat !== `user:${peer.name}` && (
                               <span style={{fontSize: "0.6rem", background: "#ef4444", color: "white", padding: "1px 6px", borderRadius: "100px", fontWeight: "900", display: "inline-flex", alignItems: "center", boxShadow: "0 0 6px rgba(239, 68, 68, 0.7)"}}>
                                 {peer.unreadCount > 9 ? '9+' : (peer.unreadCount || 1)}
                               </span>
                             )}
                           </div>
                           <span style={{fontSize: "0.62rem", color: "var(--accent-physics)", fontWeight: "bold"}}>Lvl {peer.level}</span>
                           {peer.lastMessage && (
                             <span style={{fontSize: "0.68rem", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                               {extractDmText(peer.lastMessage.action)}
                             </span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <h3 style={{fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.85rem 0 0.5rem 0", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold"}}>Aspirants ({otherPeers.length})</h3>
                  <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                    {otherPeers.map(peer => (
                      <div key={peer.name} className={`peer-item ${activeChat === `user:${peer.name}` ? "active" : ""}`} onClick={() => setActiveChat(`user:${peer.name}`)} style={{display: "flex", alignItems: "center", gap: "10px", padding: "8px 10px", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", background: activeChat === `user:${peer.name}` ? "rgba(255,255,255,0.08)" : "transparent"}}>
                        <div style={{position: "relative"}}>
                          <div style={{width: "34px", height: "34px", borderRadius: "10px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", fontWeight: "bold", flexShrink: 0, border: peer.isOnline ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)"}}>{peer.name.charAt(0).toUpperCase()}</div>
                          {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "10px", height: "10px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                        </div>
                        <div style={{display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                          <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: peer.isOnline ? "white" : "var(--text-muted)", fontWeight: "600", fontSize: "0.85rem"}}>{peer.name}</span>
                          <span style={{fontSize: "0.62rem", color: "var(--accent-physics)", fontWeight: "bold"}}>Lvl {peer.level}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Main Area - Ultra Spacious Instagram DM */}
            <div className="glass chat-main-area">
              
              {/* Compact Instagram Chat Header (Height: ~48-52px) */}
              <div className="chat-header">
                <div style={{display: "flex", alignItems: "center", gap: "10px", minWidth: 0}}>
                  {activeChat !== "global" && (
                    <button 
                      onClick={() => setActiveChat("global")} 
                      style={{background: "rgba(255,255,255,0.08)", border: "none", color: "white", padding: "5px 10px", borderRadius: "100px", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px", flexShrink: 0}}
                      title="Back to Global Lounge"
                    >
                      ← Global
                    </button>
                  )}
                  
                  <div 
                    className="ig-story-avatar" 
                    style={{width: "36px", height: "36px", cursor: "pointer", flexShrink: 0}}
                    onClick={() => { if (activeChat !== "global") setViewingProfile(activeChat.split(":")[1]); }}
                  >
                    <div style={{width: "100%", height: "100%", borderRadius: "50%", background: activeChat === "global" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : getAvatarColor(activeChat.split(":")[1]), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "2px solid #0f172a", fontSize: "0.95rem", color: "white"}}>
                      {activeChat === "global" ? "🌍" : activeChat.split(":")[1].charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div style={{minWidth: 0, overflow: "hidden"}}>
                    <h2 style={{fontSize: "0.98rem", fontWeight: "800", margin: 0, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                      {activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}
                    </h2>
                    <span style={{fontSize: "0.7rem", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px"}}>
                      <span style={{display: "inline-block", width: "5px", height: "5px", background: "#10b981", borderRadius: "50%"}}></span> Active Now
                    </span>
                  </div>
                </div>

                <div style={{display: "flex", alignItems: "center", gap: "6px", flexShrink: 0}}>
                  <button
                    onClick={() => setShowDoubtModal(true)}
                    style={{background: "rgba(168, 85, 247, 0.15)", border: "1px solid rgba(168, 85, 247, 0.35)", color: "#c084fc", borderRadius: "100px", padding: "4px 10px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"}}
                    title="Ask a Study Doubt or Practice Problem"
                  >
                    <HelpCircle size={13}/>
                    <span>Ask Doubt</span>
                  </button>

                  <span style={{fontSize: "0.72rem", color: "var(--accent-physics)", background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)", padding: "3px 8px", borderRadius: "100px", fontWeight: "bold"}}>
                    {activeChat === "global" ? `${allPeers.length} online` : 'DM'}
                  </span>
                </div>
              </div>

              
              {/* Quick Conversation Switcher Strip (Visible on Desktop & Mobile) */}
              <div style={{display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", background: "rgba(15, 23, 42, 0.55)", overflowX: "auto", scrollbarWidth: "none", flexShrink: 0}}>
                <button
                  type="button"
                  onClick={() => setActiveChat("global")}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap",
                    border: activeChat === "global" ? "1px solid rgba(139, 92, 246, 0.6)" : "1px solid rgba(255,255,255,0.08)",
                    background: activeChat === "global" ? "linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.35))" : "rgba(255,255,255,0.04)",
                    color: activeChat === "global" ? "#fff" : "var(--text-muted)", transition: "all 0.2s"
                  }}
                >
                  <span>🌍</span> Global Lounge
                </button>

                {conversationPeers.map(peer => {
                  const isActive = activeChat === `user:${peer.name}`;
                  return (
                    <button
                      key={peer.name}
                      type="button"
                      onClick={() => setActiveChat(`user:${peer.name}`)}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px", padding: "5px 12px", borderRadius: "100px", fontSize: "0.8rem", fontWeight: isActive ? "700" : "600", cursor: "pointer", whiteSpace: "nowrap",
                        border: isActive ? "1px solid rgba(236, 72, 153, 0.6)" : "1px solid rgba(255,255,255,0.08)",
                        background: isActive ? "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(168,85,247,0.25))" : "rgba(255,255,255,0.04)",
                        color: isActive ? "#fff" : "var(--text-muted)", transition: "all 0.2s"
                      }}
                    >
                      <span style={{width: "7px", height: "7px", borderRadius: "50%", background: peer.isOnline ? "#10b981" : "rgba(255,255,255,0.25)", display: "inline-block"}}></span>
                      <span>💬 {peer.name}</span>
                      {peer.hasUnread && !isActive && (
                        <span style={{background: "#ec4899", color: "white", borderRadius: "100px", fontSize: "0.58rem", padding: "1px 5px", fontWeight: "900", marginLeft: "2px", boxShadow: "0 0 8px rgba(236,72,153,0.8)"}}>NEW</span>
                      )}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowPeerPicker(true)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: "5px", padding: "5px 11px", borderRadius: "100px", fontSize: "0.78rem", fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
                    border: "1px dashed rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.02)", color: "var(--text-muted)", transition: "all 0.2s"
                  }}
                >
                  <Users size={12}/> + Peer DM
                </button>
              </div>

              {/* In-Lounge DM Alert Banner when receiving DMs */}
              {activeChat === "global" && conversationPeers.some(cp => cp.hasUnread) && (() => {
                const unreadPeer = conversationPeers.find(cp => cp.hasUnread);
                if (!unreadPeer) return null;
                return (
                  <div style={{margin: "8px 12px 0 12px", padding: "8px 14px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(139,92,246,0.3))", border: "1px solid rgba(236,72,153,0.45)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", flexShrink: 0}}>
                    <div style={{display: "flex", alignItems: "center", gap: "8px", minWidth: 0}}>
                      <span style={{fontSize: "1.05rem"}}>💬</span>
                      <span style={{fontSize: "0.82rem", color: "#fff", fontWeight: "600", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                        Direct message from <b style={{color: "#f472b6"}}>@{unreadPeer.name}</b>: "{extractDmText(unreadPeer.lastMessage?.action).slice(0, 40)}"
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveChat(`user:${unreadPeer.name}`)}
                      style={{background: "#ec4899", border: "none", color: "#fff", padding: "4px 12px", borderRadius: "100px", fontSize: "0.74rem", fontWeight: "bold", cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 2px 8px rgba(236,72,153,0.5)"}}
                    >
                      Open Chat →
                    </button>
                  </div>
                );
              })()}
{/* Mobile Instagram Notes Tray (Visible only on mobile screens) */}
              <div className="mobile-notes-tray">
                {/* Self Note */}
                <div 
                  onClick={() => {
                    const newN = prompt("Update your Instagram study note (e.g. Grinding Physics ⚡):", userNote);
                    if (newN !== null && newN.trim()) {
                      const cleanN = newN.trim().slice(0, 28);
                      setUserNote(cleanN);
                      localStorage.setItem('pm_user_note', cleanN);
                    }
                  }}
                  style={{display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0}}
                >
                  <div className="ig-story-avatar" style={{width: "38px", height: "38px"}}>
                    <div style={{width: "100%", height: "100%", borderRadius: "50%", background: getAvatarColor(sessionUser), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "2px solid #0f172a", fontSize: "0.9rem", color: "white"}}>
                      {sessionUser.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <span style={{fontSize: "0.6rem", color: "#f472b6", marginTop: "2px", fontWeight: "bold", maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                    {userNote || "+ Note"}
                  </span>
                </div>

                {/* Peers Notes */}
                {allPeers.slice(0, 10).map((peer, idx) => {
                  const peerNotes = ["Focus ⚡", "PYQs 🔥", "Quiz 💯", "Math 📐", "Mock 🎯", "Notes 🧪", "25m ⏱️", "Target ✨"];
                  const note = peerNotes[idx % peerNotes.length];
                  return (
                    <div 
                      key={peer.name} 
                      onClick={() => setActiveChat(`user:${peer.name}`)}
                      style={{display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", flexShrink: 0}}
                    >
                      <div className="ig-story-avatar" style={{width: "38px", height: "38px", background: peer.isOnline ? "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" : "rgba(255,255,255,0.2)"}}>
                        <div style={{width: "100%", height: "100%", borderRadius: "50%", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", border: "2px solid #0f172a", fontSize: "0.9rem", color: "white"}}>
                          {peer.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <span style={{fontSize: "0.6rem", color: peer.isOnline ? "white" : "var(--text-muted)", marginTop: "2px", maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                        {peer.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Chat Messages Body - Takes ALL Remaining Height! */}
              <div 
                className="chat-messages custom-scrollbar" 
              >
                <div ref={chatEndRef} style={{ height: 0, width: "100%" }} />
                {chatMessages.length === 0 ? (
                  <div style={{textAlign: "center", color: "var(--text-muted)", margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                    <span style={{fontSize: "2.8rem"}}>👋</span>
                    <div style={{fontWeight: "bold", fontSize: "1.05rem", color: "white"}}>It's quiet in the lounge...</div>
                    <div style={{fontSize: "0.85rem"}}>Post a study doubt, share your goal, or double-click to ❤️!</div>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    const isMe = msg.user === sessionUser;
                    let text = msg.action;
                    if (activeChat !== "global") {
                      text = extractDmText(msg.action);
                    }
                    const { level: mLvl } = getLevelData(msg.xp || 0);
                    const isShowingHeart = heartBurstId === msg.id;
                    const isShowingMenu = activeEmojiBarId === msg.id;

                    // Parse Deep Study Doubt Card
                    const isDoubtMsg = text.startsWith('[DOUBT:');
                    let doubtMeta = null;
                    let displayText = text;

                    if (isDoubtMsg) {
                      const endBracket = text.indexOf(']');
                      if (endBracket !== -1) {
                        const rawTag = text.slice(7, endBracket);
                        displayText = text.slice(endBracket + 1).trim();
                        const parts = rawTag.split('|HINT:');
                        doubtMeta = {
                          subject: parts[0] || 'Study Doubt',
                          hint: parts[1] || null
                        };
                      }
                    }

                    return (
                      <div 
                        key={msg.id} 
                        style={{display: "flex", gap: "8px", marginLeft: isMe ? "auto" : "0", marginRight: isMe ? "0" : "auto", maxWidth: isDoubtMsg ? "94%" : "84%", animation: "slideUp 0.25s ease-out forwards", position: "relative"}}
                      >
                        {!isMe && (
                          <div className="chat-avatar" style={{width: "34px", height: "34px", borderRadius: "50%", background: getAvatarColor(msg.user), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)", fontWeight: "bold"}} onClick={() => setViewingProfile(msg.user)}>
                             {msg.user.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", minWidth: 0, maxWidth: "100%"}}>
                           {!isMe && activeChat === "global" && (
                              <div style={{display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px", cursor: "pointer", maxWidth: "100%"}} onClick={() => setViewingProfile(msg.user)}>
                                 <span style={{fontSize: "0.78rem", color: "white", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{msg.user}</span>
                                 <span style={{fontSize: "0.6rem", background: "rgba(139,92,246,0.2)", color: "var(--accent-physics)", padding: "1px 5px", borderRadius: "6px", fontWeight: "bold", whiteSpace: "nowrap"}}>Lvl {mLvl}</span>
                              </div>
                           )}

                           {/* Message Bubble + Action Hover Wrapper */}
                           <div 
                             style={{position: "relative", display: "flex", alignItems: "center", gap: "6px", flexDirection: isMe ? "row-reverse" : "row", maxWidth: "100%"}} 
                             className="chat-msg-wrapper"
                             onMouseEnter={() => setActiveEmojiBarId(msg.id)}
                             onMouseLeave={() => setActiveEmojiBarId(null)}
                           >
                             {/* Double-Click Heart Pop Effect */}
                             {isShowingHeart && (
                               <div className="ig-heart-pop" style={{position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "2.8rem", pointerEvents: "none", zIndex: 30, filter: "drop-shadow(0 0 12px rgba(236,72,153,0.85))"}}>
                                 ❤️
                               </div>
                             )}

                             {/* Instagram Message Bubble or Doubt Card */}
                             {isDoubtMsg && doubtMeta ? (
                               <div 
                                 onDoubleClick={() => {
                                   setHeartBurstId(msg.id);
                                   setTimeout(() => setHeartBurstId(null), 850);
                                   gunToggleReaction(msg.id, '❤️');
                                 }}
                                 className="ig-doubt-card"
                                 style={{maxWidth: "100%", cursor: "pointer"}}
                                 title="Double-click to react ❤️"
                               >
                                 <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", gap: "8px"}}>
                                   <span style={{fontSize: "0.75rem", fontWeight: "800", color: "#c084fc", background: "rgba(168, 85, 247, 0.2)", padding: "2px 8px", borderRadius: "100px", display: "flex", alignItems: "center", gap: "4px"}}>
                                     🧠 {doubtMeta.subject} Doubt
                                   </span>
                                   <span style={{fontSize: "0.68rem", color: "var(--text-muted)"}}>Active Learning</span>
                                 </div>
                                 <div style={{fontSize: "0.95rem", fontWeight: "600", color: "white", lineHeight: 1.45, marginBottom: "8px", wordBreak: "break-word"}}>
                                   {displayText}
                                 </div>
                                 {doubtMeta.hint && (
                                   <details style={{fontSize: "0.78rem", color: "#93c5fd", background: "rgba(0,0,0,0.25)", padding: "6px 10px", borderRadius: "8px", marginBottom: "8px", cursor: "pointer"}}>
                                     <summary style={{fontWeight: "600"}}>💡 Hint</summary>
                                     <div style={{marginTop: "4px", color: "rgba(255,255,255,0.85)"}}>{doubtMeta.hint}</div>
                                   </details>
                                 )}
                                 <div style={{display: "flex", gap: "6px", alignItems: "center"}}>
                                   <button 
                                     onClick={() => {
                                       setReplyingTo({ id: msg.id, user: msg.user, text: displayText });
                                       setChatInput("Solution: ");
                                     }}
                                     style={{background: "rgba(139, 92, 246, 0.2)", border: "1px solid rgba(139, 92, 246, 0.4)", color: "#e9d5ff", borderRadius: "100px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px"}}
                                   >
                                     💡 Solve & Reply
                                   </button>
                                 </div>
                               </div>
                             ) : (
                               <div 
                                 onDoubleClick={() => {
                                   setHeartBurstId(msg.id);
                                   setTimeout(() => setHeartBurstId(null), 850);
                                   gunToggleReaction(msg.id, '❤️');
                                 }}
                                 className={isMe ? "ig-bubble-me" : "ig-bubble-peer"}
                                 style={{
                                   padding: "10px 15px", 
                                   maxWidth: "100%", 
                                   wordBreak: "break-word", 
                                   cursor: "pointer", 
                                   position: "relative",
                                   backdropFilter: "blur(12px)"
                                 }}
                                 title="Double-click to react ❤️"
                               >
                                 {/* Quoted Reply Banner */}
                                 {msg.replyTo && (
                                   <div style={{
                                     borderLeft: isMe ? "3px solid rgba(255,255,255,0.75)" : "3px solid #ec4899",
                                     paddingLeft: "8px",
                                     marginBottom: "6px",
                                     paddingTop: "2px",
                                     paddingBottom: "2px",
                                     background: "rgba(0,0,0,0.25)",
                                     borderRadius: "0 8px 8px 0",
                                     fontSize: "0.78rem"
                                   }}>
                                     <div style={{fontWeight: "bold", fontSize: "0.72rem", color: isMe ? "rgba(255,255,255,0.9)" : "#f472b6"}}>
                                       @{msg.replyTo.user}
                                     </div>
                                     <div style={{color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                                       {msg.replyTo.text}
                                     </div>
                                   </div>
                                 )}

                                 <div style={{fontSize: "0.93rem", lineHeight: 1.45, fontWeight: "500"}}>{displayText}</div>
                               </div>
                             )}

                             {/* Instagram Floating Hover Action Capsule */}
                             {isShowingMenu && (
                               <div 
                                 className="ig-reaction-capsule glass" 
                                 style={{
                                   position: "absolute",
                                   top: "-42px",
                                   [isMe ? "right" : "left"]: 0,
                                   display: "flex", alignItems: "center", gap: "3px", padding: "3px 8px",
                                   borderRadius: "100px", background: "rgba(15, 23, 42, 0.96)", border: "1px solid rgba(255,255,255,0.22)",
                                   boxShadow: "0 8px 25px rgba(0,0,0,0.65)", zIndex: 35, whiteSpace: "nowrap"
                                 }}
                               >
                                 {['❤️', '🔥', '😂', '😮', '👏', '💯'].map(emoji => (
                                   <button 
                                     key={emoji}
                                     onClick={() => {
                                       gunToggleReaction(msg.id, emoji);
                                       if (emoji === '❤️') {
                                         setHeartBurstId(msg.id);
                                         setTimeout(() => setHeartBurstId(null), 850);
                                       }
                                     }}
                                     className="ig-reaction-emoji-btn"
                                     title={`React ${emoji}`}
                                   >
                                     {emoji}
                                   </button>
                                 ))}

                                 {/* Reply Button */}
                                 <button 
                                   onClick={() => setReplyingTo({ id: msg.id, user: msg.user, text: displayText })}
                                   style={{background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px", borderRadius: "50%", display: "flex", alignItems: "center"}}
                                   title="Reply to message"
                                 >
                                   <CornerUpLeft size={13}/>
                                 </button>

                                 {/* Delete Button */}
                                 <button 
                                   onClick={() => {
                                     if (window.confirm("Delete this message?")) {
                                       gunDeletePost(msg.id);
                                     }
                                   }}
                                   style={{background: "transparent", border: "none", color: "#ef4444", cursor: "pointer", padding: "4px", borderRadius: "50%", display: "flex", alignItems: "center"}}
                                   title="Delete message"
                                 >
                                   <Trash2 size={13}/>
                                 </button>
                               </div>
                             )}
                           </div>

                           {/* Reaction Badges Below Bubble */}
                           {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                             <div style={{display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "3px", justifyContent: isMe ? "flex-end" : "flex-start"}}>
                               {Object.entries(msg.reactions).map(([emoji, users]) => {
                                 if (!users || users.length === 0) return null;
                                 const hasReacted = users.includes(sessionUser);
                                 return (
                                   <button
                                     key={emoji}
                                     onClick={() => gunToggleReaction(msg.id, emoji)}
                                     title={users.join(', ')}
                                     style={{
                                       background: hasReacted ? "rgba(236, 72, 153, 0.25)" : "rgba(255, 255, 255, 0.08)",
                                       border: hasReacted ? "1px solid rgba(236, 72, 153, 0.5)" : "1px solid rgba(255, 255, 255, 0.12)",
                                       borderRadius: "100px", padding: "2px 7px", fontSize: "0.75rem",
                                       cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", color: "white",
                                       transition: "transform 0.15s"
                                     }}
                                     onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                                     onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                                   >
                                     <span>{emoji}</span>
                                     <span style={{fontSize: "0.68rem", fontWeight: "bold"}}>{users.length}</span>
                                   </button>
                                 );
                               })}
                             </div>
                           )}

                           <div style={{fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "3px", fontWeight: "600"}}><TimeAgo date={msg.createdAt} fallback={msg.time}/></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Instagram Chat Composer */}
              <div className="chat-composer">
                
                {/* Quoted Reply Banner */}
                {replyingTo && (
                  <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", background: "rgba(255,255,255,0.06)", borderRadius: "12px", marginBottom: "8px", borderLeft: "3px solid #ec4899", animation: "slideUp 0.15s ease-out"}}>
                    <div style={{fontSize: "0.78rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                      <span style={{color: "#f472b6", fontWeight: "bold"}}>Replying to @{replyingTo.user}: </span>
                      <span style={{color: "var(--text-muted)"}}>{replyingTo.text}</span>
                    </div>
                    <button type="button" onClick={() => setReplyingTo(null)} style={{background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "2px"}} title="Cancel reply">
                      <X size={14}/>
                    </button>
                  </div>
                )}

                {/* Quick Emojis Drawer (Toggled by Smiley icon, does NOT eat screen space when closed!) */}
                {showEmojiPicker && (
                  <div style={{display: "flex", gap: "8px", alignItems: "center", padding: "6px 12px", background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "100px", marginBottom: "8px", width: "fit-content", animation: "slideUp 0.15s ease-out", boxShadow: "0 6px 20px rgba(0,0,0,0.4)"}}>
                    {['❤️', '🔥', '👏', '😂', '💯', '✨', '🚀', '📚', '⚡', '🙌'].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setChatInput(prev => prev + emoji)}
                        style={{background: "transparent", border: "none", cursor: "pointer", fontSize: "1.15rem", padding: "2px", transition: "transform 0.15s"}}
                        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Active Learning Study Prompt Chips */}
                <div style={{display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "6px", marginBottom: "4px", scrollbarWidth: "none"}}>
                  <button type="button" onClick={() => setShowDoubtModal(true)} className="study-icebreaker-pill">
                    ❓ Ask Doubt
                  </button>
                  <button type="button" onClick={() => setChatInput("🎯 Today's Target: ")} className="study-icebreaker-pill">
                    🎯 Today's Goal
                  </button>
                  <button type="button" onClick={() => setChatInput("⚡ Quick Quiz: ")} className="study-icebreaker-pill">
                    ⚡ Quick Quiz
                  </button>
                  <button type="button" onClick={() => setChatInput("⏱️ 25m Focus Sprint! Who is in?")} className="study-icebreaker-pill">
                    ⏱️ 25m Sprint
                  </button>
                </div>

                <form onSubmit={handleSendMessage} style={{display: "flex", alignItems: "center", gap: "8px", width: "100%"}}>
                  <div style={{position: "relative", flex: 1, display: "flex", alignItems: "center"}}>
                    <button 
                      type="button"
                      onClick={() => setShowEmojiPicker(prev => !prev)}
                      style={{position: "absolute", left: "12px", background: "transparent", border: "none", color: showEmojiPicker ? "#ec4899" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", transition: "color 0.2s"}}
                      title="Toggle quick emojis"
                    >
                      <Smile size={19}/>
                    </button>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder={activeChat === "global" ? "Message lounge or ask doubt..." : `Message ${activeChat.split(":")[1]}...`}
                      value={chatInput} 
                      onChange={e => setChatInput(e.target.value)} 
                      style={{width: "100%", padding: "11px 16px 11px 42px", borderRadius: "100px", fontSize: "0.93rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", transition: "all 0.25s"}}
                      onFocus={(e) => e.target.style.borderColor = "#ec4899"}
                      onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{borderRadius: "100px", padding: "11px 18px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "0.88rem", background: "linear-gradient(135deg, #7928ca, #ff0080)", boxShadow: "0 4px 15px rgba(255, 0, 128, 0.4)", transition: "all 0.2s", flexShrink: 0}} 
                    disabled={!chatInput.trim()}
                  >
                    <Send size={15}/>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div style={{display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto", paddingBottom: "2rem", flex: 1}}>
             <div className="glass" style={{display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", padding: "2rem", borderRadius: "24px", background: "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))", border: "1px solid rgba(139,92,246,0.2)"}}>
                <div>
                   <h2 style={{fontSize: "1.8rem", fontWeight: "800", marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px"}}><Target color="var(--accent-math)"/> Collaborative Squad Missions</h2>
                   <p style={{color: "var(--text-muted)", fontSize: "1rem", maxWidth: "600px"}}>Create dedicated study squads. Compete with your peers to finish chapters, solve PYQs, or hit daily targets. Peer pressure turned into a superpower!</p>
                </div>
                <button className="btn-primary" onClick={handleCreateMission} style={{padding: "12px 24px", fontSize: "1rem", borderRadius: "100px", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"}}><Plus size={18}/> Create Mission</button>
             </div>
             
             {squadMissions.length === 0 ? (
               <div className="glass" style={{textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)", borderRadius: "24px"}}>
                  <div style={{fontSize: "3rem", marginBottom: "1rem"}}>🚀</div>
                  <h3 style={{fontSize: "1.25rem", color: "white", marginBottom: "0.5rem"}}>No active missions found.</h3>
                  <p>Be the first to create a squad mission and invite your peers to compete!</p>
               </div>
             ) : (
               <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem"}}>
                 {squadMissions.map(mission => {
                    const isMember = mission.members.some(m => m.user === sessionUser);
                    return (
                      <div key={mission.id} className="glass" style={{padding: "1.75rem", borderRadius: "24px", display: "flex", flexDirection: "column", gap: "1.25rem", border: "1px solid rgba(255,255,255,0.08)", transition: "transform 0.2s"}} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                         <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                            <div>
                               <h3 style={{fontSize: "1.2rem", fontWeight: "800", color: "white", marginBottom: "4px"}}>{mission.title}</h3>
                               <span style={{fontSize: "0.75rem", color: "var(--accent-physics)", background: "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: "100px", fontWeight: "bold"}}>Admin: {mission.admin}</span>
                            </div>
                            <span style={{background: "rgba(16,185,129,0.15)", color: "var(--accent-success)", padding: "6px 12px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px"}}><Users size={14}/> {mission.members.length} Peers</span>
                         </div>
                         <p style={{fontSize: "0.95rem", color: "var(--text-muted)", minHeight: "48px", lineHeight: 1.5}}>{mission.desc}</p>
                         
                         <div style={{background: "rgba(0,0,0,0.25)", padding: "1.25rem", borderRadius: "16px"}}>
                            <h4 style={{fontSize: "0.85rem", color: "white", marginBottom: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px"}}>Squad Progress Tracker</h4>
                            {mission.members.map((member, i) => (
                               <div key={member.user} style={{marginBottom: i === mission.members.length-1 ? 0 : "12px"}}>
                                  <div style={{display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "6px"}}>
                                     <span style={{fontWeight: member.user === sessionUser ? "800" : "600", color: member.user === sessionUser ? "var(--accent-physics)" : "var(--text-muted)"}}>{member.user} {member.progress === 100 && "🏆"}</span>
                                     <span style={{fontWeight: "bold", color: member.progress === 100 ? "var(--accent-success)" : "white"}}>{member.progress}%</span>
                                  </div>
                                  <div style={{width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "100px", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)"}}>
                                     <div style={{width: `${member.progress}%`, height: "100%", background: member.user === sessionUser ? "linear-gradient(90deg, #8b5cf6, #c026d3)" : "var(--accent-chem)", borderRadius: "100px", transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)"}}></div>
                                  </div>
                               </div>
                            ))}
                         </div>
                         
                         <div style={{marginTop: "auto", paddingTop: "1rem"}}>
                            {!isMember ? (
                               <button className="btn-primary" style={{width: "100%", padding: "14px", background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", fontSize: "1rem", borderRadius: "14px", transition: "all 0.2s"}} onClick={() => handleJoinMission(mission.id)} onMouseEnter={e => {e.target.style.background = "var(--accent-physics)"; e.target.style.border = "none";}} onMouseLeave={e => {e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.border = "1px solid rgba(255,255,255,0.1)";}}>Join Squad</button>
                            ) : (
                               <button className="btn-primary" style={{width: "100%", padding: "14px", fontSize: "1rem", borderRadius: "14px", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)"}} onClick={() => handleUpdateMissionProgress(mission.id)}>Log Daily Progress</button>
                            )}
                         </div>
                      </div>
                    );
                 })}
               </div>
             )}
          </div>
        )}
      </div>
    );
  };

  const renderStudyConnect = () => {
    const examRooms = [
      { id: 'JEE', label: 'JEE Aspirants', color: 'var(--accent-physics)', desc: 'Physics · Chemistry · Maths', icon: <Calculator size={28}/> },
      { id: 'NEET', label: 'NEET Aspirants', color: 'var(--accent-chem)', desc: 'Physics · Chemistry · Biology', icon: <Stethoscope size={28}/> },
      { id: 'UPSC', label: 'UPSC Aspirants', color: 'var(--accent-math)', desc: 'History · Polity · Geography', icon: <Landmark size={28}/> },
      { id: 'NDA', label: 'NDA Aspirants', color: '#14b8a6', desc: 'Maths · General Ability', icon: <Shield size={28}/> },
      { id: 'SAT', label: 'SAT / ACT', color: '#3b82f6', desc: 'Global College Admissions', icon: <BookOpen size={28}/> },
      { id: 'MCAT', label: 'MCAT Prep', color: '#10b981', desc: 'Medical College Admissions', icon: <Stethoscope size={28}/> },
      { id: 'GRE', label: 'GRE / GMAT', color: '#f59e0b', desc: 'Grad School Admissions', icon: <BrainCircuit size={28}/> },
      { id: 'IB', label: 'IB / AP', color: '#ec4899', desc: 'Global High School Curriculum', icon: <Globe size={28}/> },
    ];
    const buildJitsiRoom = (roomId) => `FocusMode-${roomId}-Study`;

    const TOPIC_FILTERS = [
      { id: 'All', label: '🌐 All Exams' },
      { id: 'JEE', label: '⚡ JEE Advanced' },
      { id: 'NEET', label: '🩺 NEET UG' },
      { id: 'UPSC', label: '🏛️ UPSC IAS' },
      { id: 'Silent', label: '🤫 Silent Pomodoro' },
      { id: 'LateNight', label: '🌙 Late Night Shift' }
    ];

    const BUDDY_POOL = [
      { id: 'p1', name: 'Aarav Sharma', target: 'JEE Advanced 2026', college: 'IIT Bombay CSE', streak: 18, focus: 'Rotational Motion & Advanced Calculus', motto: 'Hard work beats talent when talent fails to work hard.' },
      { id: 'p2', name: 'Diya Patel', target: 'NEET UG 2025', college: 'AIIMS New Delhi', streak: 24, focus: 'Human Physiology & Organic Reactions', motto: 'Every NCERT line counts toward the white coat.' },
      { id: 'p3', name: 'Vikramaditya Roy', target: 'UPSC CSE 2026', college: 'LBSNAA Mussoorie', streak: 31, focus: 'Modern History & Laxmikanth Polity', motto: 'Consistency is the only superpower in UPSC.' },
      { id: 'p4', name: 'Sneha Kulkarni', target: 'JEE Main & Adv', college: 'IIT Delhi', streak: 12, focus: 'Electrostatics & Thermodynamics PYQs', motto: 'Daily 50 quality problems minimum.' },
      { id: 'p5', name: 'Rohan Deshmukh', target: 'NEET UG 2025', college: 'JIPMER Puducherry', streak: 15, focus: 'Genetics & Molecular Basis of Inheritance', motto: 'Precision over speed in Biology.' },
      { id: 'p6', name: 'Ananya Sengupta', target: 'SAT / Global', college: 'MIT / Stanford', streak: 28, focus: 'Advanced Math & Critical Reading', motto: 'Aim for the moon, land among the stars.' },
      { id: 'p7', name: 'Devansh Verma', target: 'Silent Library 🤫', college: 'BITS Pilani CS', streak: 42, focus: 'Silent Pomodoro Sprint (Zero Distractions)', motto: 'Silence in study, noise in results.' },
      { id: 'p8', name: 'Pooja Iyer', target: 'Late Night Grind 🌙', college: 'IIT Madras', streak: 19, focus: 'Night Shift Problem Solving', motto: 'The quiet hours belong to those who want it most.' },
    ];

    const handleStartMatching = (topic = buddyFilterTopic) => {
      setIsMatchingBuddy(true);
      setMatchedBuddy(null);
      setTimeout(() => {
        let candidates = BUDDY_POOL;
        if (topic !== 'All') {
          const matchSub = BUDDY_POOL.filter(b => 
            b.target.toLowerCase().includes(topic.toLowerCase()) || 
            b.focus.toLowerCase().includes(topic.toLowerCase())
          );
          if (matchSub.length > 0) candidates = matchSub;
        }
        const buddy = candidates[Math.floor(Math.random() * candidates.length)];
        const roomUnique = `FocusMode-Omegle-${buddy.id}-${Math.floor(Date.now() / 60000)}`;
        setMatchedBuddy({
          ...buddy,
          roomName: roomUnique,
          matchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setIsMatchingBuddy(false);
        setPeerMessages([
          { id: Date.now(), sender: buddy.name, text: `Hey ${sessionUser}! 👋 Ready for a 25-minute deep focus sprint? What problem or topic are you working on right now?`, time: 'Just now' }
        ]);
        awardXP(15, 'Matched with Study Partner on Omegle Connect');
      }, 1800);
    };

    const handleSkipPartner = () => {
      setIsMatchingBuddy(true);
      setMatchedBuddy(null);
      setTimeout(() => {
        const remaining = BUDDY_POOL.filter(b => b.id !== matchedBuddy?.id);
        const buddy = remaining[Math.floor(Math.random() * remaining.length)] || BUDDY_POOL[0];
        const roomUnique = `FocusMode-Omegle-${buddy.id}-${Math.floor(Date.now() / 60000)}`;
        setMatchedBuddy({
          ...buddy,
          roomName: roomUnique,
          matchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setIsMatchingBuddy(false);
        setPeerMessages([
          { id: Date.now(), sender: buddy.name, text: `Hey! Connected with you. Let's hit mute or discuss when needed and crush this session! 📚`, time: 'Just now' }
        ]);
        awardXP(5, 'Connected with Next Study Partner');
      }, 1200);
    };

    const handleLeaveBuddy = () => {
      setMatchedBuddy(null);
      setIsMatchingBuddy(false);
    };

    const handleSendPeerChat = (text) => {
      const msgText = (text || peerChatInput).trim();
      if (!msgText) return;
      const newMsg = { id: Date.now(), sender: sessionUser, text: msgText, time: 'Just now' };
      setPeerMessages(prev => [...prev, newMsg]);
      setPeerChatInput('');
      
      setTimeout(() => {
        const buddyName = matchedBuddy?.name || 'Partner';
        const dynamicReplies = [
          `Solid! Let's lock in for 25 minutes of silent problem-solving. Ping me if stuck!`,
          `Awesome plan! Keep up the momentum. Let's finish this block strong! 🚀`,
          `Great question! I'm reviewing that topic too. Let's solve 5 problems and compare answers!`,
          `Got it! Let's stay on camera for accountability and grind out this topic!`
        ];
        const rep = dynamicReplies[Math.floor(Math.random() * dynamicReplies.length)];
        setPeerMessages(prev => [...prev, { id: Date.now() + 1, sender: buddyName, text: rep, time: 'Just now' }]);
      }, 1400);
    };

    if (inCall && connectRoom) {
      const jitsiRoom = buildJitsiRoom(connectRoom);
      return (
        <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'}}>
            <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 1.5s infinite'}}></div>
            <span style={{color: '#10b981', fontWeight: 'bold'}}>Live Room — ${connectRoom}</span>
            <button onClick={() => { setInCall(false); setConnectRoom(null); }} className="btn-primary" style={{marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', padding: '8px 20px'}}>
              <VideoOff size={16}/> Leave Room
            </button>
          </div>
          <div className="glass" style={{padding: '0', overflow: 'hidden', borderRadius: '20px', height: '75vh'}}>
            <iframe
              src={`https://meet.jit.si/${jitsiRoom}#userInfo.displayName=${encodeURIComponent(sessionUser)}`}
              style={{width: '100%', height: '100%', border: 'none'}}
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              title="Study Connect Room"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto', width: '100%'}}>
        
        {/* Live Aspirant Ticker Header */}
        <div className="glass" style={{padding: '1.25rem 1.75rem', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(16,185,129,0.2)'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 12px #10b981', animation: 'pulse 1.5s infinite'}}></div>
            <div>
              <div style={{fontWeight: 800, fontSize: '1rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px'}}>
                <Radio size={16} /> 164 Aspirants Studying Live Right Now
              </div>
              <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Turn passive solo study into high-intensity active practice.</div>
            </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <span style={{fontSize: '0.8rem', padding: '6px 12px', borderRadius: '100px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', fontWeight: 600}}>
              ⚡ Instant 1-on-1 Matching
            </span>
          </div>
        </div>

        {/* Topic Filters Bar */}
        <div style={{display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none'}}>
          {TOPIC_FILTERS.map(tf => {
            const isActive = buddyFilterTopic === tf.id;
            return (
              <button
                key={tf.id}
                onClick={() => setBuddyFilterTopic(tf.id)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '100px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: isActive ? '1px solid var(--accent-physics)' : '1px solid rgba(255,255,255,0.08)',
                  background: isActive ? 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))' : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                {tf.label}
              </button>
            );
          })}
        </div>

        {/* ── OMEGLE EDUCATION MATCHMAKER SECTION ── */}
        {isMatchingBuddy ? (
          /* Radar Scanning View */
          <div className="omegle-match-hero" style={{minHeight: '340px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
            <div style={{position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem'}}>
              <div className="omegle-radar-circle" style={{width: '120px', height: '120px'}}></div>
              <div className="omegle-radar-circle" style={{width: '80px', height: '80px', animationDelay: '0.6s'}}></div>
              <div className="omegle-radar-circle" style={{width: '40px', height: '40px', animationDelay: '1.2s'}}></div>
              <div style={{width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, boxShadow: '0 0 20px rgba(139,92,246,0.6)'}}>
                <Radio size={28} color="#fff" style={{animation: 'spin 4s linear infinite'}} />
              </div>
            </div>
            <h3 style={{fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff'}}>Scanning For Study Partners...</h3>
            <p style={{color: '#cbd5e1', fontSize: '0.95rem', maxWidth: '450px', marginBottom: '1.5rem'}}>
              Searching active aspirants reviewing <strong>{buddyFilterTopic === 'All' ? 'All Subjects' : buddyFilterTopic}</strong>. Encrypting 1-on-1 peer room...
            </p>
            <button onClick={() => setIsMatchingBuddy(false)} className="btn-secondary" style={{padding: '8px 24px', fontSize: '0.85rem', borderRadius: '100px'}}>
              Cancel Search
            </button>
          </div>
        ) : matchedBuddy ? (
          /* Active 1-on-1 Omegle Matched Studio */
          <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            {/* Top Match Action Bar */}
            <div className="glass" style={{padding: '1.25rem 1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, rgba(88,28,135,0.25), rgba(15,23,42,0.8))', border: '1px solid rgba(168,85,247,0.3)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <div style={{width: '44px', height: '44px', borderRadius: '50%', background: getAvatarColor(matchedBuddy.name), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.1rem', color: '#fff', border: '2px solid rgba(255,255,255,0.2)'}}>
                  {matchedBuddy.name.charAt(0)}
                </div>
                <div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontWeight: 800, fontSize: '1.1rem', color: '#fff'}}>{matchedBuddy.name}</span>
                    <span style={{fontSize: '0.75rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(16,185,129,0.2)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700}}>🟢 Active Match</span>
                  </div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>
                    🎯 {matchedBuddy.target} · Aiming for {matchedBuddy.college} · 🔥 {matchedBuddy.streak}d streak
                  </div>
                </div>
              </div>

              {/* Omegle Action Controls */}
              <div style={{display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap'}}>
                <button
                  onClick={handleSkipPartner}
                  className="btn-primary"
                  style={{
                    background: 'linear-gradient(90deg, #ec4899, #8b5cf6)',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '100px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(236,72,153,0.3)'
                  }}
                  title="Skip to another study partner"
                >
                  <RefreshCw size={15} /> Next Partner (Skip ⏭️)
                </button>
                <button
                  onClick={handleLeaveBuddy}
                  style={{
                    background: 'rgba(239,68,68,0.15)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#f87171',
                    padding: '8px 16px',
                    borderRadius: '100px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <VideoOff size={15} /> End Session
                </button>
              </div>
            </div>

            {/* Dual Studio Layout: Jitsi Video Call + Shared Pod Chat */}
            <div className="omegle-dual-studio">
              {/* Left Column: Jitsi Live Video Call */}
              <div className="glass" style={{padding: '0', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.1)', background: '#0b0f19'}}>
                <div style={{padding: '10px 16px', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600}}>
                    <Video size={16} color="var(--accent-physics)" /> Peer Video & Audio Sync
                  </div>
                  <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Encrypted Room</span>
                </div>
                <div style={{flex: 1, minHeight: '380px'}}>
                  <iframe
                    src={`https://meet.jit.si/${matchedBuddy.roomName}#userInfo.displayName=${encodeURIComponent(sessionUser)}`}
                    style={{width: '100%', height: '100%', border: 'none'}}
                    allow="camera; microphone; fullscreen; display-capture; autoplay"
                    title="Omegle Study Partner Call"
                  />
                </div>
              </div>

              {/* Right Column: Shared Accountability Pod & Instant Chat */}
              <div className="glass" style={{padding: '1.25rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(180deg, rgba(30,27,75,0.3) 0%, rgba(15,23,42,0.6) 100%)'}}>
                
                {/* Partner Academic Goals Card */}
                <div style={{padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
                  <div style={{fontSize: '0.8rem', color: 'var(--accent-math)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px'}}>
                    Partner's Current Focus
                  </div>
                  <div style={{fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px'}}>
                    {matchedBuddy.focus}
                  </div>
                  <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic'}}>
                    "{matchedBuddy.motto}"
                  </div>
                </div>

                {/* Quick Prompts Bar */}
                <div style={{display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none'}}>
                  <button onClick={() => handleSendPeerChat("🔥 Let's lock in for a 25m silent sprint!")} style={{padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer', whiteSpace: 'nowrap'}}>
                    🔥 25m Silent Sprint
                  </button>
                  <button onClick={() => handleSendPeerChat("❓ Can you quiz me on quick formulas?")} style={{padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer', whiteSpace: 'nowrap'}}>
                    ❓ Quiz Me
                  </button>
                  <button onClick={() => handleSendPeerChat("✅ Solved 5 practice questions!")} style={{padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer', whiteSpace: 'nowrap'}}>
                    ✅ Solved 5 Qs
                  </button>
                  <button onClick={() => handleSendPeerChat("☕ Quick 3m water break!")} style={{padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', cursor: 'pointer', whiteSpace: 'nowrap'}}>
                    ☕ 3m Break
                  </button>
                </div>

                {/* Chat Messages Stream */}
                <div style={{flex: 1, minHeight: '160px', maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '14px'}}>
                  {peerMessages.map(msg => {
                    const isMe = msg.sender === sessionUser;
                    return (
                      <div key={msg.id} style={{alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%'}}>
                        <div style={{fontSize: '0.7rem', color: isMe ? 'var(--accent-physics)' : 'var(--accent-chem)', marginBottom: '2px', textAlign: isMe ? 'right' : 'left', fontWeight: 600}}>
                          {isMe ? 'You' : msg.sender} · {msg.time}
                        </div>
                        <div style={{padding: '8px 12px', borderRadius: '12px', fontSize: '0.85rem', lineHeight: 1.35, background: isMe ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(99,102,241,0.3))' : 'rgba(255,255,255,0.06)', border: isMe ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.08)', color: '#f8fafc'}}>
                          {msg.text}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <div style={{display: 'flex', gap: '8px'}}>
                  <input
                    type="text"
                    value={peerChatInput}
                    onChange={e => setPeerChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSendPeerChat(); }}
                    placeholder="Message study buddy..."
                    className="input-field"
                    style={{fontSize: '0.85rem', padding: '10px 14px'}}
                  />
                  <button onClick={() => handleSendPeerChat()} className="btn-primary" style={{padding: '0 16px', borderRadius: '12px'}}>
                    <Send size={15} />
                  </button>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* Idle Matchmaker Hero Card */
          <div className="omegle-match-hero">
            <div style={{display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '100px', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', color: '#c084fc', fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.25rem'}}>
              <Sparkles size={16} /> Omegle For Serious Education · 1-on-1 Instant Match
            </div>
            
            <h2 style={{fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', fontWeight: 900, marginBottom: '0.75rem', lineHeight: 1.2, color: '#fff'}}>
              Find a Random Serious Study Partner
            </h2>
            
            <p style={{color: '#cbd5e1', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', maxWidth: '620px', margin: '0 auto 2rem', lineHeight: 1.5}}>
              Skip the isolation. Get instantly connected on video + synchronized chat with an aspirant studying your exact target. Keep each other accountable for 25-minute deep work blocks.
            </p>

            <div style={{display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem'}}>
              <button
                onClick={() => handleStartMatching()}
                className="btn-primary"
                style={{
                  padding: '14px 32px',
                  borderRadius: '100px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                  border: 'none',
                  boxShadow: '0 8px 30px rgba(139,92,246,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  cursor: 'pointer'
                }}
              >
                <Radio size={20} /> Start 1-on-1 Matching Now
              </button>
            </div>

            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'clamp(1rem, 3vw, 2.5rem)', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <Shield size={16} color="var(--accent-success)" /> 100% Academic & Safe
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <RefreshCw size={16} color="var(--accent-physics)" /> Skip / Next Partner Anytime
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                <Clock size={16} color="var(--accent-math)" /> Shared 25m Pomodoro Accountability
              </div>
            </div>
          </div>
        )}

        {/* ── SCHEDULED LIVE STUDY EVENTS ── */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
           <h3 style={{fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px'}}><Calendar size={22} color="var(--accent-math)"/> Scheduled Group Sprints</h3>
           <button className="btn-primary" onClick={() => setShowEventModal(true)} style={{borderRadius: '100px', background: 'linear-gradient(90deg, var(--accent-math), var(--accent-physics))', border: 'none', padding: '8px 18px', fontSize: '0.85rem'}}>+ Schedule Sprint</button>
        </div>
        
        {showEventModal && (
          <div className="animate-fade-in" style={{background: 'rgba(0,0,0,0.8)', position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', padding: '1rem'}}>
            <div style={{background: '#0f172a', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', border: '1px solid #334155', width: '100%', maxWidth: '440px', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{fontSize: '1.25rem', fontWeight: 800}}>Schedule Study Sprint</h3>
                <button onClick={() => setShowEventModal(false)} style={{background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'}}><X size={20}/></button>
              </div>
              <input type="text" placeholder="Session Title (e.g. HC Verma Mechanics Sprint)" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} className="input-field" />
              <input type="text" placeholder="Time (e.g. Today 8:00 PM IST)" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} className="input-field" />
              <select value={newEventDuration} onChange={e => setNewEventDuration(e.target.value)} className="input-field">
                <option value="25 mins (1 Pomodoro)">25 mins (1 Pomodoro)</option>
                <option value="50 mins (2 Pomodoros)">50 mins (2 Pomodoros)</option>
                <option value="90 mins (Deep Grind)">90 mins (Deep Grind)</option>
                <option value="2 Hours (Mock Review)">2 Hours (Mock Review)</option>
              </select>
              <button className="btn-primary" onClick={() => {
                if (newEventTitle.trim()) {
                  createEvent(newEventTitle, currentUserProfile?.prepType, newEventTime, newEventDuration);
                  setShowEventModal(false);
                  setNewEventTitle('');
                  awardXP(20, 'Scheduled a Live Study Sprint');
                }
              }}>Publish Sprint</button>
            </div>
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem'}}>
          {studyEvents.length === 0 ? (
            <div className="glass" style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1', borderRadius: '18px'}}>
              No scheduled sprints yet. Click '+ Schedule Sprint' above to host one for fellow aspirants!
            </div>
          ) : (
            studyEvents.map(e => (
              <div key={e.id} className="glass" style={{padding: '1.25rem', borderRadius: '18px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.06)'}}>
                 <h4 style={{fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem', lineHeight: 1.3}}>{e.title}</h4>
                 <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.8rem'}}>
                   <div style={{width: '20px', height: '20px', borderRadius: '50%', background: getAvatarColor(e.host || 'Guest'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold'}}>{(e.host || 'G').charAt(0).toUpperCase()}</div>
                   <p style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{e.host || 'Host'}</p>
                 </div>
                 <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem', flexWrap: 'wrap'}}>
                   <span style={{fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px', color: 'var(--accent-math)', fontWeight: 700}}>⏰ {e.scheduledTime}</span>
                   {e.duration && <span style={{fontSize: '0.8rem', background: 'rgba(0,0,0,0.3)', padding: '4px 10px', borderRadius: '6px', color: '#cbd5e1'}}>⏳ {e.duration}</span>}
                 </div>
                 <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem'}}>
                   <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>👥 {e.participants?.length || 1} joined</span>
                   <div style={{display: 'flex', gap: '6px'}}>
                     <button onClick={() => deleteEvent(e.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px'}} title="Delete"><Trash2 size={15} /></button>
                     <button onClick={() => shareToWhatsApp(e.id, e.title)} style={{background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: '4px'}} title="Share on WhatsApp"><Send size={15} /></button>
                     <button className="btn-primary" onClick={() => { joinEvent(e.id); setConnectRoom(e.id); setInCall(true); awardXP(10, 'Joined a Scheduled Event'); }} style={{padding: '6px 14px', fontSize: '0.8rem', borderRadius: '100px'}}>Join</button>
                   </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* ── EXAM STUDY POD LOUNGES ── */}
        <h3 style={{fontSize: '1.3rem', fontWeight: 800, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Globe size={22} color="var(--accent-physics)" /> 24/7 Dedicated Exam Lounges
        </h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem'}}>
          {examRooms.map(room => (
            <div
              key={room.id}
              className="glass subject-card"
              style={{
                padding: '1.75rem 1.25rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                borderColor: room.id === currentUserProfile?.prepType ? room.color : '',
                transition: 'all 0.25s'
              }}
              onClick={() => { setConnectRoom(room.id); setInCall(true); awardXP(10, 'Joined Study Connect Room'); }}
            >
              <div style={{color: room.color, background: `${room.color}22`, border: `1px solid ${room.color}44`, borderRadius: '14px', padding: '12px'}}>
                {room.icon}
              </div>
              <h4 style={{fontSize: '1.1rem', fontWeight: 700}}>{room.label}</h4>
              <p style={{color: 'var(--text-muted)', fontSize: '0.8rem'}}>{room.desc}</p>
              {room.id === currentUserProfile?.prepType && (
                <span style={{background: `${room.color}33`, color: room.color, border: `1px solid ${room.color}55`, padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 700}}>Your Exam ⭐</span>
              )}
              <button className="btn-primary" style={{width: '100%', background: `${room.color}22`, borderColor: `${room.color}55`, color: room.color, marginTop: '4px', fontSize: '0.85rem', padding: '8px'}}>
                <PhoneCall size={14}/> Enter Lounge
              </button>
            </div>
          ))}
        </div>

        {/* ── PRIVATE STUDY ROOM ── */}
        <div className="glass" style={{padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', borderRadius: '20px'}}>
          <h4 style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem', fontWeight: 700}}>
            <Wifi size={18} color="var(--accent-success)"/> Create Private 1-on-1 Study Room
          </h4>
          <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Create an instant custom link and send to a study partner to practice together privately.</p>
          <div style={{display: 'flex', gap: '0.75rem', flexWrap: 'wrap'}}>
            <input type="text" className="input-field" placeholder="Enter custom room name (e.g. JEE-Crack-Batch-2025)" value={customRoomName} onChange={e => setCustomRoomName(e.target.value)} style={{flex: '1 1 200px'}} />
            <button className="btn-primary" onClick={() => { if (customRoomName.trim()) { shareToWhatsApp(customRoomName.trim()); } }} style={{background: '#10b981', color: 'white'}} disabled={!customRoomName.trim()}><Send size={15}/> Share Invite</button>
            <button className="btn-primary" onClick={() => { if (customRoomName.trim()) { setConnectRoom(customRoomName.trim()); setInCall(true); awardXP(10, 'Joined Private Study Room'); } }} disabled={!customRoomName.trim()}><PhoneCall size={15}/> Start Private Call</button>
          </div>
        </div>

      </div>
    );
  };


  const renderLectures = () => {
    const activeVideoObj = playlist.find(v => v.id === activeVideo);
    const activeData = videoNotes[activeVideo] || { notes: '', mistakes: '' };
    
    const isHorizontal = false;

    return (
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}} ref={videoTopRef}>
        {activeVideo ? (
          <div style={{display: 'grid', gap: '1.5rem', alignItems: 'start', gridTemplateColumns: `repeat(auto-fit, minmax(${isHorizontal ? '400px' : '100%'}, 1fr))`}}>
            <div className="glass lecture-video-container" style={{padding: '1rem', background: '#000', borderRadius: '20px', overflow: 'hidden', position: 'relative'}}>
              <button className="pip-close-btn" onClick={() => setActiveVideo(null)}><X size={14}/></button>
              <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, background: '#111', borderRadius: '12px', overflow: 'hidden'}}>
                {isVideoLoading && (
                  <div className="premium-loader-overlay">
                    <div className="premium-loader-container">
                      <div className="premium-loader-orb">
                         <BrainCircuit size={28} className="premium-loader-icon" />
                      </div>
                      <div className="premium-loader-text">Loading Lecture</div>
                      <div className="premium-loader-progress-container">
                        <div className="premium-loader-progress-bar"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}} dangerouslySetInnerHTML={{ __html: '<div id="youtube-player" style="width:100%;height:100%"></div>' }} />
                <div className="pip-expand-overlay" onClick={() => handleTabChange('lectures')}>
                   <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                     <Columns size={32} />
                     <span style={{fontWeight: 'bold'}}>Return to Lectures</span>
                   </div>
                </div>
              </div>
              <div className="video-header-controls" style={{display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0', color: '#fff', flexWrap: 'wrap', gap: '10px'}}>
                <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{activeVideoObj?.title}</span>
              </div>
            </div>
            
            <div className="glass lecture-notes-section" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxHeight: isHorizontal ? '600px' : 'auto'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3 style={{fontSize: '1.1rem', fontWeight: 'bold'}}>Lecture Notes</h3>
                <button className="btn-primary" onClick={() => downloadNote(activeVideoObj)} style={{padding: '6px 12px', fontSize: '0.8rem'}}><Download size={14}/> Export</button>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, overflowY: 'auto', paddingRight: '5px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                  <label style={{fontSize: '0.85rem', color: 'var(--accent-physics)', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between'}}>
                    <span>📝 Key Notes</span>
                    {activeData.lastUpdated && <span style={{color: 'var(--text-muted)', fontWeight: 'normal'}}>{activeData.lastUpdated}</span>}
                  </label>
                  <textarea 
                    className="input-field" 
                    style={{flex: 1, minHeight: '120px', resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.5, background: 'rgba(0,0,0,0.2)'}} 
                    placeholder="Jot down important formulas, concepts..."
                    value={activeData.notes}
                    onChange={(e) => saveVideoNote(activeVideo, 'notes', e.target.value)}
                  />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: 1}}>
                  <label style={{fontSize: '0.85rem', color: '#f87171', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>⚠️ Mistakes & Doubts</span>
                    <button className="btn-icon" onClick={() => askAIDoubt(activeData.mistakes)} title="Solve doubt with AI" style={{color: '#f87171', padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold'}}><HelpCircle size={14} /> Ask AI</button>
                  </label>
                  <textarea 
                    className="input-field" 
                    style={{flex: 1, minHeight: '100px', resize: 'vertical', fontSize: '0.9rem', lineHeight: 1.5, background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)'}} 
                    placeholder="Log mistakes or paste a doubt here, then click 'Ask AI'..."
                    value={activeData.mistakes}
                    onChange={(e) => saveVideoNote(activeVideo, 'mistakes', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass lecture-empty-state" style={{padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)'}}>
            <MonitorPlay size={64} style={{opacity: 0.5}} />
            <p>Select a video from your playlist or add a new one to start watching ad-free.</p>
          </div>
        )}
        
        <form className="glass lecture-add-form" style={{padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'}} onSubmit={handleAddVideo}>
          <div className="input-group" style={{flex: '1 1 250px'}}>
            <Video size={18} className="input-icon" />
            <input type="text" className="input-field with-icon" placeholder="Paste YouTube Link (Normal or Live)..." value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} style={{width: '100%'}} />
          </div>
          <input type="text" className="input-field" placeholder="Video Title (e.g. Thermodynamics Part 1)" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} style={{flex: '1 1 200px'}} />
          <button type="submit" className="btn-primary" style={{flex: '0 0 auto', whiteSpace: 'nowrap'}}><Plus size={18} /> Add to Playlist (+5 XP)</button>
        </form>
        
        <div className="lecture-playlist-section" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
          {playlist.map(video => {
            const prog = videoProgress[video.id];
            const percent = prog ? Math.min(100, (prog.time / prog.duration) * 100) : 0;
            return (
            <div key={video.id} className="glass subject-card" style={{display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', border: activeVideo === video.id ? '2px solid var(--accent-physics)' : ''}} onClick={() => { setActiveVideo(video.id); awardXP(10, 'Started a Lecture'); setTimeout(() => videoTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100); }}>
              <div style={{position: 'relative', paddingBottom: '56.25%', borderRadius: '10px', overflow: 'hidden', background: '#111'}}>
                <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt="thumbnail" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8}} />
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '50%', color: 'white', backdropFilter: 'blur(4px)'}}><Play size={24} fill="white" /></div>
                </div>
                {/* Premium Paid Batch Progress Bar */}
                {percent > 0 && (
                  <div style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)'}}>
                    <div style={{height: '100%', width: `${percent}%`, background: 'var(--accent-physics)', boxShadow: '0 0 10px var(--accent-physics)'}}></div>
                  </div>
                )}
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>

                <div>
                  <h4 style={{fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px', lineHeight: 1.3, textDecoration: video.watched || prog?.completed ? 'line-through' : 'none', color: video.watched || prog?.completed ? 'var(--text-muted)' : 'white'}}>{video.title}</h4>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{video.addedAt}</span>
                    {(videoNotes[video.id]?.notes || videoNotes[video.id]?.mistakes) && (
                      <span style={{fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-physics)', borderRadius: '100px', fontWeight: 'bold'}}>Has Notes</span>
                    )}
                    {prog && !prog.completed && percent > 0 && percent < 95 && (
                      <span style={{fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-physics)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>
                        {Math.round(percent)}% Watched
                      </span>
                    )}
                    {(video.watched || prog?.completed) && (
                      <span style={{fontSize: '0.7rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>
                        Completed
                      </span>
                    )}
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
                   <button onClick={(e) => { e.stopPropagation(); removeVideo(video.id, e); }} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex'}}><Trash2 size={16}/></button>
                   <label style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: video.watched || prog?.completed ? 'var(--accent-success)' : 'var(--text-muted)', cursor: 'pointer'}} onClick={e => e.stopPropagation()}>
                     <input type="checkbox" checked={!!(video.watched || prog?.completed)} onChange={(e) => toggleVideoWatched(e, video.id)} />
                     {video.watched || prog?.completed ? 'Watched' : 'Mark'}
                   </label>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderProfile = () => {
    const streak = studyStreak || 0;
    const safeUser = sessionUser || 'Aspirant';
    let totalTasksCompleted = 0;
    subjects.forEach(s => s.tasks.forEach(t => t.subtasks.forEach(st => { if(st.completed) totalTasksCompleted++; })));
    const totalNotes = Object.keys(videoNotes).filter(k => videoNotes[k]?.notes || videoNotes[k]?.mistakes).length;
    const totalJournals = journalHistory[journalHistory.length-1]?.date === 'Welcome' ? journalHistory.length - 1 : journalHistory.length;
    const userPosts = feed.filter(f => f.user === sessionUser);
    
    const xpForNextLevel = level * 100;
    const progressPercent = Math.min(100, Math.max(0, ((currentXP % 100) / 100) * 100));

    // Achievement Badges Configuration
    const ACHIEVEMENT_BADGES = [
      { id: 'b1', title: 'Velocity Starter', icon: '⚡', desc: 'Completed your first practice task', unlocked: totalTasksCompleted > 0, progress: totalTasksCompleted > 0 ? '1/1 Done' : '0/1 Task' },
      { id: 'b2', title: 'Active Recall Pro', icon: '🧠', desc: 'Generated lecture quizzes or logged mistakes', unlocked: (mistakesList && mistakesList.length > 0) || totalNotes > 0, progress: (mistakesList && mistakesList.length > 0) ? 'Active Master' : 'Log 1 Mistake' },
      { id: 'b3', title: 'Focus Titan', icon: '⏱️', desc: 'Completed 25m+ deep Pomodoro sessions', unlocked: streak > 0 || totalTasksCompleted >= 3, progress: streak > 0 ? `${streak}d Streak` : 'Start 1 Sprint' },
      { id: 'b4', title: 'Study Connector', icon: '🤝', desc: 'Connected on Omegle 1-on-1 study matching', unlocked: true, progress: 'Unlocked' },
      { id: 'b5', title: 'Streak Warrior', icon: '🔥', desc: 'Maintained consecutive daily study streak', unlocked: streak >= 2, progress: `${streak}/2 Days` },
      { id: 'b6', title: 'Grand Scholar', icon: '🏆', desc: 'Earned 100+ lifetime XP through practice', unlocked: currentXP >= 100, progress: `${currentXP}/100 XP` }
    ];

    const currentBio = currentUserProfile?.bio || "Dedicated aspirant relentless on the daily grind. Focus Mode 24/7.";
    const currentCollege = currentUserProfile?.dreamCollege || "IIT Bombay / AIIMS Delhi";
    const currentMotto = currentUserProfile?.motto || "Champions do in practice what they expect to perform in the arena.";
    const currentStrengths = currentUserProfile?.strengths || "Kinematics, Organic Reactions, Rapid Problem Solving";
    const currentWeakness = currentUserProfile?.weakness || "Time management in full-length mocks";
    const currentHours = currentUserProfile?.targetHours || 8;

    return (
      <div className="animate-fade-in ig-profile-wrapper">
        
        {/* ── TOP HEADER / USERNAME BAR ── */}
        <div className="ig-profile-top-bar">
          <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <span style={{fontWeight: 800, fontSize: '1.2rem', color: '#fff', letterSpacing: '-0.3px'}}>
              {safeUser}
            </span>
            <span className="ig-verified-badge" title="Verified FocusMode Aspirant">✓</span>
          </div>

          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <button 
              className="btn-secondary" 
              onClick={() => setProfileActiveTab('theme')} 
              style={{padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px'}}
              title="Appearance & Themes"
            >
              <Sparkles size={14} color="var(--accent-math)"/> Theme
            </button>
            {isGuest ? (
              <button 
                onClick={() => { setAuthWallMsg('Create an account to save your progress permanently.'); setShowAuthWall(true); }}
                style={{padding: '6px 12px', fontSize: '0.78rem', borderRadius: '8px', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer'}}
              >
                Sign Up
              </button>
            ) : (
              <button 
                onClick={handleLogout}
                style={{padding: '6px 10px', fontSize: '0.78rem', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'}}
                title="Logout"
              >
                <LogOut size={14}/>
              </button>
            )}
          </div>
        </div>

        {/* ── PROFILE HEADER: AVATAR & 3 STATS (INSTAGRAM STYLE) ── */}
        <div className="ig-header-layout">
          {/* Circular Story Avatar */}
          <div className="ig-avatar-ring" onClick={() => {
            setEditProfileData({
              name: sessionUser,
              prepType: currentUserProfile?.prepType || 'JEE',
              targetYear: currentUserProfile?.targetYear || new Date().getFullYear(),
              dreamCollege: currentCollege,
              bio: currentBio,
              motto: currentMotto,
              strengths: currentStrengths,
              weakness: currentWeakness,
              targetHours: currentHours
            });
            setIsEditingProfile(true);
          }} title="Click to edit profile">
            <div className="ig-avatar-inner" style={{background: getAvatarColor(safeUser)}}>
              {safeUser.charAt(0).toUpperCase()}
            </div>
            <div style={{position: 'absolute', bottom: '3px', right: '5px', width: '16px', height: '16px', borderRadius: '50%', background: '#10b981', border: '2.5px solid #0b0f19'}} title="Active Studying"/>
          </div>

          {/* 3 Horizontal Instagram Stats */}
          <div className="ig-stats-row">
            <div className="ig-stat-col" onClick={() => setProfileActiveTab('stats')}>
              <div className="ig-stat-num">{totalTasksCompleted}</div>
              <div className="ig-stat-label">Tasks Done</div>
            </div>
            <div className="ig-stat-col" onClick={() => setProfileActiveTab('stats')}>
              <div className="ig-stat-num">Lvl {level}</div>
              <div className="ig-stat-label">{currentXP} XP</div>
            </div>
            <div className="ig-stat-col" onClick={() => setProfileActiveTab('stats')}>
              <div className="ig-stat-num" style={{color: '#f97316'}}>{streak}d 🔥</div>
              <div className="ig-stat-label">Streak</div>
            </div>
          </div>
        </div>

        {/* ── BIO & ASPIRANT STATEMENT ── */}
        <div className="ig-bio-section">
          <div className="ig-username-title">
            <span>{isGuest ? 'Guest Aspirant' : safeUser}</span>
            <span style={{fontSize: '0.75rem', color: '#10b981', fontWeight: 700}}>• Online</span>
          </div>

          <div className="ig-category-tag">
            <span>🎓 {currentUserProfile?.prepType || 'JEE'} Aspirant</span>
            <span>· Class of {currentUserProfile?.targetYear || '2026'}</span>
          </div>

          <div className="ig-target-college">
            🎯 Target: <strong>{currentCollege}</strong>
          </div>

          <div className="ig-bio-description">
            {currentBio}
          </div>

          {currentMotto && (
            <div className="ig-bio-quote">
              💡 "{currentMotto}"
            </div>
          )}

          {currentStrengths && (
            <div className="ig-bio-meta">
              ⚡ Strengths: {currentStrengths}
            </div>
          )}

          {/* Action Buttons */}
          <div className="ig-action-bar">
            <button 
              className="ig-btn ig-btn-primary"
              onClick={() => {
                setEditProfileData({
                  name: sessionUser,
                  prepType: currentUserProfile?.prepType || 'JEE',
                  targetYear: currentUserProfile?.targetYear || new Date().getFullYear(),
                  dreamCollege: currentCollege,
                  bio: currentBio,
                  motto: currentMotto,
                  strengths: currentStrengths,
                  weakness: currentWeakness,
                  targetHours: currentHours
                });
                setIsEditingProfile(true);
              }}
            >
              Edit profile
            </button>
            <button 
              className="ig-btn ig-btn-secondary"
              onClick={() => setProfileActiveTab(profileActiveTab === 'stats' ? 'badges' : 'stats')}
            >
              {profileActiveTab === 'stats' ? 'Badges' : 'Stats & Goals'}
            </button>
            <button 
              className="ig-btn ig-btn-secondary"
              onClick={() => setProfileActiveTab('theme')}
            >
              Themes
            </button>
          </div>
        </div>

        {/* ── EDIT PROFILE INLINE CARD (WHEN ACTIVE) ── */}
        {isEditingProfile && (
          <div className="ig-edit-card animate-fade-in">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px'}}>
              <h3 style={{fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0}}>✏️ Edit Profile</h3>
              <button onClick={() => setIsEditingProfile(false)} style={{background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer'}}><X size={18}/></button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '6px'}}>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Username</label>
                <input type="text" value={editProfileData.name} onChange={e => setEditProfileData({...editProfileData, name: e.target.value})} className="input-field" placeholder="Username" />
              </div>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Exam Target</label>
                <select value={editProfileData.prepType} onChange={e => setEditProfileData({...editProfileData, prepType: e.target.value})} className="input-field">
                  <option value="JEE">JEE (Advanced & Main)</option>
                  <option value="NEET">NEET UG</option>
                  <option value="UPSC">UPSC CSE</option>
                  <option value="NDA">NDA</option>
                  <option value="SAT">SAT / Global</option>
                  <option value="General">General / Board Exams</option>
                </select>
              </div>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Target Year</label>
                <input type="number" value={editProfileData.targetYear} onChange={e => setEditProfileData({...editProfileData, targetYear: e.target.value})} className="input-field" placeholder="Target Year" />
              </div>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Dream College / Target</label>
                <input type="text" value={editProfileData.dreamCollege || ''} onChange={e => setEditProfileData({...editProfileData, dreamCollege: e.target.value})} className="input-field" placeholder="e.g. IIT Bombay / AIIMS Delhi" />
              </div>
            </div>

            <div>
              <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Bio / Aspirant Statement</label>
              <textarea rows="2" value={editProfileData.bio || ''} onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})} className="input-field" placeholder="Your study focus & goal..." style={{resize: 'none'}} />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px'}}>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Study Motto</label>
                <input type="text" value={editProfileData.motto || ''} onChange={e => setEditProfileData({...editProfileData, motto: e.target.value})} className="input-field" placeholder="Your driving quote..." />
              </div>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Key Strengths</label>
                <input type="text" value={editProfileData.strengths || ''} onChange={e => setEditProfileData({...editProfileData, strengths: e.target.value})} className="input-field" placeholder="e.g. Mechanics, Calculus" />
              </div>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Weak Area / Priority</label>
                <input type="text" value={editProfileData.weakness || ''} onChange={e => setEditProfileData({...editProfileData, weakness: e.target.value})} className="input-field" placeholder="e.g. Mock test time management" />
              </div>
              <div>
                <label style={{fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600}}>Daily Study Target (Hours)</label>
                <input type="number" value={editProfileData.targetHours || 8} onChange={e => setEditProfileData({...editProfileData, targetHours: Number(e.target.value)})} className="input-field" placeholder="8" />
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px', marginTop: '6px'}}>
              <button className="btn-primary" style={{flex: 1, padding: '10px'}} onClick={() => {
                let newName = editProfileData.name.trim();
                if (!newName) newName = sessionUser;
                setUsersDb(prev => {
                  const newDb = { ...prev };
                  const existingUser = newDb[sessionUser] || { profile: {} };
                  const updatedProfile = {
                    ...existingUser.profile,
                    prepType: editProfileData.prepType,
                    targetYear: editProfileData.targetYear,
                    dreamCollege: editProfileData.dreamCollege,
                    bio: editProfileData.bio,
                    motto: editProfileData.motto,
                    strengths: editProfileData.strengths,
                    weakness: editProfileData.weakness,
                    targetHours: editProfileData.targetHours
                  };

                  if (newName !== sessionUser) {
                    if (newDb[newName]) {
                      alert("Username already taken!");
                      return prev;
                    }
                    delete newDb[sessionUser];
                    newDb[newName] = { ...existingUser, profile: updatedProfile };
                    const keys = ['pm_sub_', 'pm_jour_', 'pm_playlist_', 'pm_planner_', 'pm_syllabus_', 'pm_notes_', 'pm_streak_', 'pm_lastdate_', 'pm_mistakes_'];
                    keys.forEach(k => {
                      const val = localStorage.getItem(`${k}${sessionUser}`);
                      if(val) localStorage.setItem(`${k}${newName}`, val);
                      localStorage.removeItem(`${k}${sessionUser}`);
                    });
                    setSessionUser(newName);
                    localStorage.setItem('planmaker_session', newName);
                  } else {
                    newDb[sessionUser] = { ...existingUser, profile: updatedProfile };
                  }
                  return newDb;
                });
                awardXP(20, 'Updated Profile Bio & Academic Goals');
                setIsEditingProfile(false);
              }}>Save Changes</button>
              <button className="btn-secondary" style={{padding: '10px 18px'}} onClick={() => setIsEditingProfile(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* ── INSTAGRAM STORY HIGHLIGHTS ── */}
        <div className="ig-highlights-scroll">
          <div className="ig-highlight-item" onClick={() => setProfileActiveTab('stats')}>
            <div className="ig-highlight-circle">
              <div className="ig-highlight-inner">🎯</div>
            </div>
            <span className="ig-highlight-label">{currentHours}h / day</span>
          </div>

          <div className="ig-highlight-item" onClick={() => setProfileActiveTab('stats')}>
            <div className="ig-highlight-circle">
              <div className="ig-highlight-inner">🔥</div>
            </div>
            <span className="ig-highlight-label">{streak}d Streak</span>
          </div>

          <div className="ig-highlight-item" onClick={() => setProfileActiveTab('stats')}>
            <div className="ig-highlight-circle">
              <div className="ig-highlight-inner">⚡</div>
            </div>
            <span className="ig-highlight-label">{currentXP} XP</span>
          </div>

          <div className="ig-highlight-item" onClick={() => setProfileActiveTab('badges')}>
            <div className="ig-highlight-circle">
              <div className="ig-highlight-inner">🏆</div>
            </div>
            <span className="ig-highlight-label">{ACHIEVEMENT_BADGES.filter(b => b.unlocked).length}/6 Badges</span>
          </div>

          <div className="ig-highlight-item" onClick={() => setProfileActiveTab('stats')}>
            <div className="ig-highlight-circle">
              <div className="ig-highlight-inner">📝</div>
            </div>
            <span className="ig-highlight-label">{totalNotes} Notes</span>
          </div>
        </div>

        {/* ── INSTAGRAM PROFILE TABS ── */}
        <div className="ig-tabs-nav">
          <button 
            className={`ig-tab-btn ${profileActiveTab === 'badges' ? 'active' : ''}`}
            onClick={() => setProfileActiveTab('badges')}
          >
            <Trophy size={15} /> Badges
          </button>
          <button 
            className={`ig-tab-btn ${profileActiveTab === 'stats' ? 'active' : ''}`}
            onClick={() => setProfileActiveTab('stats')}
          >
            <Award size={15} /> Study Stats
          </button>
          <button 
            className={`ig-tab-btn ${profileActiveTab === 'theme' ? 'active' : ''}`}
            onClick={() => setProfileActiveTab('theme')}
          >
            <Sparkles size={15} /> Appearance
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        {profileActiveTab === 'badges' && (
          <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div className="profile-badges-grid">
              {ACHIEVEMENT_BADGES.map(badge => (
                <div
                  key={badge.id}
                  className="achievement-badge-card"
                  style={{
                    border: badge.unlocked ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(255,255,255,0.06)',
                    background: badge.unlocked ? 'linear-gradient(145deg, rgba(16,185,129,0.09) 0%, rgba(255,255,255,0.02) 100%)' : 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{fontSize: '1.75rem', padding: '9px', background: badge.unlocked ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', borderRadius: '12px', flexShrink: 0}}>
                    {badge.icon}
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginBottom: '2px'}}>
                      <div style={{fontWeight: 800, fontSize: '0.88rem', color: badge.unlocked ? '#fff' : 'var(--text-muted)'}}>{badge.title}</div>
                      <span style={{fontSize: '0.62rem', padding: '2px 7px', borderRadius: '100px', fontWeight: 700, background: badge.unlocked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: badge.unlocked ? '#10b981' : 'var(--text-muted)'}}>
                        {badge.unlocked ? '✓ UNLOCKED' : 'LOCKED'}
                      </span>
                    </div>
                    <div style={{fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.3}}>{badge.desc}</div>
                    <div style={{fontSize: '0.72rem', color: badge.unlocked ? 'var(--accent-physics)' : 'var(--text-muted)', fontWeight: 600, marginTop: '3px'}}>
                      {badge.progress}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileActiveTab === 'stats' && (
          <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.25rem'}}>
            {/* 4 Metric Cards */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
              <div className="glass" style={{padding: '1.15rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', borderRadius: '16px'}}>
                <div style={{padding: '8px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', color: 'var(--accent-success)'}}><Check size={20}/></div>
                <div style={{fontSize: '1.6rem', fontWeight: 800, color: '#fff'}}>{totalTasksCompleted}</div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.78rem'}}>Tasks Completed</div>
              </div>
              <div className="glass" style={{padding: '1.15rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', borderRadius: '16px'}}>
                <div style={{padding: '8px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', color: 'var(--accent-physics)'}}><Video size={20}/></div>
                <div style={{fontSize: '1.6rem', fontWeight: 800, color: '#fff'}}>{playlist.length}</div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.78rem'}}>Active Lectures</div>
              </div>
              <div className="glass" style={{padding: '1.15rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', borderRadius: '16px'}}>
                <div style={{padding: '8px', background: 'rgba(236,72,153,0.1)', borderRadius: '50%', color: 'var(--accent-chem)'}}><FileText size={20}/></div>
                <div style={{fontSize: '1.6rem', fontWeight: 800, color: '#fff'}}>{mistakesList ? mistakesList.length : 0}</div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.78rem'}}>Mistakes Tracked</div>
              </div>
              <div className="glass" style={{padding: '1.15rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px', borderRadius: '16px'}}>
                <div style={{padding: '8px', background: 'rgba(245,158,11,0.1)', borderRadius: '50%', color: '#f59e0b'}}><BookOpen size={20}/></div>
                <div style={{fontSize: '1.6rem', fontWeight: 800, color: '#fff'}}>{totalJournals}</div>
                <div style={{color: 'var(--text-muted)', fontSize: '0.78rem'}}>Daily Study Journals</div>
              </div>
            </div>

            {/* Daily Commitment & Level Progress */}
            <div className="glass" style={{padding: '1.25rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>Level {level} Progress</span>
                <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#10b981'}}>{currentXP % 100} / 100 XP</span>
              </div>
              <div className="progress-bar-bg" style={{height: '8px', background: 'rgba(255,255,255,0.06)'}}>
                <div className="progress-bar-fill" style={{width: `${progressPercent}%`, background: 'linear-gradient(90deg, #10b981, #3b82f6)'}}/>
              </div>

              <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', marginTop: '4px'}}>
                <div>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Daily Grind Target</div>
                  <div style={{fontSize: '1.1rem', fontWeight: 800, color: '#10b981'}}>{currentHours} Hours / Day</div>
                </div>
                {currentWeakness && (
                  <div style={{textAlign: 'right', maxWidth: '55%'}}>
                    <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Priority Improvement</div>
                    <div style={{fontSize: '0.82rem', color: '#f59e0b', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{currentWeakness}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {profileActiveTab === 'theme' && (
          <div className="animate-fade-in glass" style={{padding: '1.5rem', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h4 style={{fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px'}}>
              <Sparkles size={16} color="var(--accent-math)"/> Workspace Theme & Appearance
            </h4>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px'}}>
              <button 
                onClick={() => setBgTheme('universe-bg')} 
                style={{padding: '12px', background: bgTheme === 'universe-bg' ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.3)', border: bgTheme === 'universe-bg' ? '2px solid var(--accent-physics)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}}>
                🌌 Deep Universe
              </button>
              <button 
                onClick={() => setBgTheme('solid-dark-bg')} 
                style={{padding: '12px', background: bgTheme === 'solid-dark-bg' ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.3)', border: bgTheme === 'solid-dark-bg' ? '2px solid var(--accent-physics)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}}>
                🌑 Solid Dark
              </button>
              <button 
                onClick={() => setBgTheme('mesh-bg')} 
                style={{padding: '12px', background: bgTheme === 'mesh-bg' ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.3)', border: bgTheme === 'mesh-bg' ? '2px solid var(--accent-physics)' : '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', color: 'white', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}}>
                🕸️ Grid Mesh
              </button>
            </div>
          </div>
        )}

      </div>
    );
  };


return (
    <div className="app-layout">


      {/* XP Toast */}
      {toastMsg && (
        <div key={toastMsg.id} className="xp-toast">
          <Zap size={24} color="var(--accent-success)" />
          <div>
            <div className="xp-amount">{toastMsg.amount > 0 ? `+${toastMsg.amount}` : ''} XP</div>
            <div className="xp-reason">{toastMsg.reason}</div>
          </div>
        </div>
      )}

      {/* Auth Wall Overlay for Guests */}
      {showAuthWall && (
        <div style={{position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '1rem'}}>
          <div className="glass auth-card animate-fade-in" style={{position: 'relative'}}>
            <button onClick={() => setShowAuthWall(false)} style={{position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}><X size={24} /></button>
            <Users size={48} color="var(--accent-math)" style={{marginBottom: '1rem'}} />
            <h2 style={{fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 'bold', textAlign: 'center'}}>Join the Community</h2>
            <p className="subtitle" style={{marginBottom: '2rem', textAlign: 'center'}}>{authWallMsg}</p>
            <form className="auth-form" onSubmit={handleAuth}>
              <div className="input-group">
                <User size={18} className="input-icon" />
                <input type="text" placeholder={authMode === 'login' ? "Username" : "Choose a Username"} value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="input-field with-icon" />
              </div>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder={authMode === 'login' ? "Password" : "Create a Password"} value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="input-field with-icon" />
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="btn-primary" style={{width: '100%', padding: '14px', marginTop: '10px'}}>
                {authMode === 'login' ? 'Log in & Join' : 'Create Account & Save Progress'}
              </button>
            </form>
            <p className="auth-toggle">
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <span onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
                {authMode === 'login' ? 'Sign up' : 'Log in'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="app-sidebar">
        <div className="brand"><Headphones size={24} color="var(--accent-physics)" /> <span>Focus Mode <span style={{background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800}}>Player</span></span></div>
        {true && (
           <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center'}}>
             <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Lvl {level}: {title}</div>
             <div style={{fontWeight: 'bold', color: 'var(--accent-success)', fontSize: '1.1rem', marginTop: '4px'}}>{currentXP} XP</div>
             {studyStreak > 0 && <div style={{fontSize:'0.78rem', color:'#fb923c', marginTop:'4px', fontWeight:700}}>🔥 {studyStreak}-Day Streak</div>}
           </div>
        )}
        <div className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}><LayoutDashboard size={18} /> Today's Plan</div>
          <div className={`nav-item ${activeTab === 'planner' ? 'active' : ''}`} onClick={() => handleTabChange('planner')}><Calendar size={18} /> Study Planner</div>
          <div className={`nav-item ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => handleTabChange('journal')}><BookOpen size={18} /> Journal & Mistakes</div>
          <div className={`nav-item ${activeTab === 'lectures' ? 'active' : ''}`} onClick={() => handleTabChange('lectures')}><MonitorPlay size={18} /> Video Lectures</div>
          <div className={`nav-item ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => handleTabChange('connect')}><PhoneCall size={18} /> Study Connect</div>
          <div className={`nav-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => handleTabChange('community')}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', width: '100%'}}>
              <Users size={18} />
              <span>Community</span>
              {unreadCommunityCount > 0 && (
                <span className="sidebar-unread-badge" title={`${unreadCommunityCount} new message`}>
                  {unreadCommunityCount > 9 ? '9+' : unreadCommunityCount}
                </span>
              )}
            </div>
          </div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}><User size={18} /> My Profile</div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`main-content ${activeTab === 'community' ? 'community-full-mode' : ''}`}>
        {/* Mobile Header (Hidden in community full-bleed mode) */}
        {activeTab !== 'community' && (
          <div className="mobile-header">
            <div className="mobile-brand"><Headphones size={20} color="var(--accent-physics)" /> <span>Focus Mode <span style={{background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800}}>Player</span></span></div>
            {true && <div className="mobile-xp-badge">⚡ {currentXP} XP</div>}
          </div>
        )}

        {/* Page Header (Hidden in community full-bleed mode for maximum spacious chat height) */}
        {activeTab !== 'community' && (
          <header className="page-header" style={{paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <h1 className="greeting">
                {activeTab === 'dashboard' && `Welcome, ${sessionUser}!` }
                {activeTab === 'planner' && 'Study Planner'}
                {activeTab === 'journal' && 'Learning Journal'}
                {activeTab === 'lectures' && 'Ad-Free Lectures'}
                {activeTab === 'connect' && 'Study Connect'}
                {activeTab === 'profile' && 'My Profile'}
              </h1>
              <p className="subtitle">
                {activeTab === 'dashboard' && "Crush your tasks for today."}
                {activeTab === 'planner' && "Plan your weekly study schedule."}
                {activeTab === 'journal' && "Log your learnings and mistakes."}
                {activeTab === 'lectures' && "Watch lectures ad-free."}
                {activeTab === 'connect' && "Video rooms with fellow aspirants."}
                {activeTab === 'profile' && "Your stats and progress."}
              </p>
            </div>
            
            {/* Global Theme Selector Pill */}
            <div className="glass" style={{
              display: 'flex', 
              alignItems: 'center', 
              padding: '6px', 
              borderRadius: '100px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.4)',
              gap: '4px'
            }}>
              <button 
                onClick={() => setBgTheme('universe-bg')} 
                style={{
                  padding: '8px 16px', fontSize: '0.85rem', borderRadius: '100px', fontWeight: '700', border: 'none',
                  background: bgTheme === 'universe-bg' ? 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))' : 'transparent', 
                  color: bgTheme === 'universe-bg' ? 'white' : 'var(--text-muted)', 
                  boxShadow: bgTheme === 'universe-bg' ? '0 4px 15px rgba(139,92,246,0.4)' : 'none',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >🌌 Universe</button>
              <button 
                onClick={() => setBgTheme('solid-dark-bg')} 
                style={{
                  padding: '8px 16px', fontSize: '0.85rem', borderRadius: '100px', fontWeight: '700', border: 'none',
                  background: bgTheme === 'solid-dark-bg' ? 'linear-gradient(135deg, var(--accent-success), #059669)' : 'transparent', 
                  color: bgTheme === 'solid-dark-bg' ? 'white' : 'var(--text-muted)', 
                  boxShadow: bgTheme === 'solid-dark-bg' ? '0 4px 15px rgba(16,185,129,0.4)' : 'none',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >🌑 Dark</button>
              <button 
                onClick={() => setBgTheme('mesh-bg')} 
                style={{
                  padding: '8px 16px', fontSize: '0.85rem', borderRadius: '100px', fontWeight: '700', border: 'none',
                  background: bgTheme === 'mesh-bg' ? 'linear-gradient(135deg, var(--accent-math), #2563eb)' : 'transparent', 
                  color: bgTheme === 'mesh-bg' ? 'white' : 'var(--text-muted)', 
                  boxShadow: bgTheme === 'mesh-bg' ? '0 4px 15px rgba(59,130,246,0.4)' : 'none',
                  cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >🕸️ Mesh</button>
            </div>
          </header>
        )}
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'planner' && renderPlanner()}
        {activeTab === 'journal' && renderJournal()}
        {activeTab === 'connect' && renderStudyConnect()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'profile' && renderProfile()}
        
        <div className={`lectures-wrapper ${activeTab !== 'lectures' ? (activeVideo ? 'pip-mode' : 'hidden-tab') : ''}`}>
           {renderLectures()}
        </div>
      </main>

      {/* Floating AI Assistant - Premium UI */}
      {activeTab !== 'community' && (
        <div className="floating-ai-wrapper" style={{position: 'fixed', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', transform: `translate(${aiPosition.x}px, ${aiPosition.y}px)`, transition: isAiDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>
        {aiOpen && (
          <div className="animate-fade-in floating-ai-chat" style={{
            width: 'clamp(300px, 92vw, 400px)', 
            height: 'clamp(400px, 60vh, 600px)', 
            maxHeight: 'calc(100vh - 120px)',
            marginBottom: '20px', 
            borderRadius: '28px', 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139, 92, 246, 0.2)', 
            border: '1px solid rgba(255,255,255,0.1)', 
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)'
          }}>
            <div onMouseDown={handleAiDragStart} onTouchStart={handleAiDragStart} style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.8))', 
              padding: '18px 24px', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'grab', 
              userSelect: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: 'white'}}>
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)'
                }}>
                  <Bot size={22}/>
                </div>
                <div>
                  <div style={{fontWeight: '800', fontSize: '1.15rem', letterSpacing: '-0.5px'}}>FocusBot AI</div>
                  <div style={{fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px'}}>
                    <span style={{width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #4ade80'}}></span> Online
                  </div>
                </div>
              </div>
              <button onClick={() => setAiOpen(false)} style={{background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'}} onMouseEnter={e => e.currentTarget.style.background='rgba(0,0,0,0.4)'} onMouseLeave={e => e.currentTarget.style.background='rgba(0,0,0,0.2)'}><X size={18}/></button>
            </div>
            
            <div style={{flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.2))'}}>
              <div style={{textAlign: 'center', margin: '10px 0 20px'}}>
                <span style={{background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '100px', fontSize: '0.75rem', color: 'var(--text-muted)'}}>Today</span>
              </div>
              
              {aiMessages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', 
                  display: 'flex',
                  flexDirection: msg.role === 'ai' ? 'row' : 'row-reverse',
                  gap: '12px',
                  maxWidth: '90%'
                }}>
                  {msg.role === 'ai' && (
                    <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto', boxShadow: '0 4px 10px rgba(139,92,246,0.3)'}}>
                      <Bot size={16} color="white"/>
                    </div>
                  )}
                  <div style={{
                    background: msg.role === 'ai' ? 'rgba(255,255,255,0.07)' : 'linear-gradient(135deg, var(--accent-physics), #6d28d9)', 
                    padding: '14px 18px', 
                    borderRadius: msg.role === 'ai' ? '20px 20px 20px 4px' : '20px 20px 4px 20px', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.6', 
                    color: 'white', 
                    border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    boxShadow: msg.role === 'ai' ? 'none' : '0 10px 20px rgba(109,40,217,0.3)'
                  }}>
                    {msg.text.split('\n').map((line, idx) => (
                      <span key={idx}>
                        {line.includes('**') ? (
                          <span dangerouslySetInnerHTML={{__html: line.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}} />
                        ) : line}
                        {idx !== msg.text.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div style={{alignSelf: 'flex-start', display: 'flex', gap: '12px', maxWidth: '85%'}}>
                   <div style={{width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 'auto'}}>
                      <Bot size={16} color="white"/>
                   </div>
                   <div style={{background: 'rgba(255,255,255,0.07)', padding: '16px 20px', borderRadius: '20px 20px 20px 4px', display: 'flex', gap: '6px', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)'}}>
                      <div className="typing-dot" style={{animationDelay: '0s'}}></div>
                      <div className="typing-dot" style={{animationDelay: '0.2s'}}></div>
                      <div className="typing-dot" style={{animationDelay: '0.4s'}}></div>
                   </div>
                </div>
              )}
              <div ref={aiEndRef} />
            </div>
            <form onSubmit={handleAISend} style={{padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)'}}>
              <input type="text" placeholder="Message FocusBot..." value={aiInput} onChange={e => setAiInput(e.target.value)} style={{
                flex: 1, 
                padding: '14px 20px', 
                borderRadius: '100px', 
                background: 'rgba(255,255,255,0.05)', 
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.95rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }} onFocus={e => e.target.style.borderColor = 'var(--accent-physics)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}/>
              <button type="submit" disabled={!aiInput.trim() || aiTyping} style={{
                borderRadius: '50%', 
                width: '48px', 
                height: '48px', 
                padding: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: (!aiInput.trim() || aiTyping) ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))',
                color: (!aiInput.trim() || aiTyping) ? 'rgba(255,255,255,0.3)' : 'white',
                border: 'none',
                cursor: (!aiInput.trim() || aiTyping) ? 'not-allowed' : 'pointer',
                boxShadow: (!aiInput.trim() || aiTyping) ? 'none' : '0 4px 15px rgba(139,92,246,0.4)',
                transition: 'all 0.2s'
              }}>
                <Send size={20} style={{marginLeft: '2px'}}/>
              </button>
            </form>
          </div>
        )}
        
        {!aiOpen && (
          <button onClick={() => { trackAIOpened(); setAiOpen(true); }} style={{
            width: '68px', 
            height: '68px', 
            borderRadius: '50%', 
            padding: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 8px 20px rgba(168,85,247,0.3), inset 0 1px 3px rgba(255,255,255,0.3)', 
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden'
          }} onMouseEnter={e => e.currentTarget.style.transform='scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform='scale(1)'}>
            <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)', borderRadius: '50%'}}></div>
            <Sparkles size={18} style={{position: 'absolute', top: '15px', right: '15px', opacity: 0.8}} className="spin-slow"/>
            <Bot size={32} style={{position: 'relative', zIndex: 1}}/>
          </button>
        )}
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className={`bottom-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}>
          <LayoutDashboard size={20} /><span>Plan</span>
        </div>
        <div className={`bottom-nav-item ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => handleTabChange('journal')}>
          <BookOpen size={20} /><span>Journal</span>
        </div>
        <div className={`bottom-nav-item ${activeTab === 'lectures' ? 'active' : ''}`} onClick={() => handleTabChange('lectures')}>
          <MonitorPlay size={20} /><span>Lectures</span>
        </div>
        <div className={`bottom-nav-item ${activeTab === 'connect' ? 'active' : ''}`} onClick={() => handleTabChange('connect')}>
          <PhoneCall size={20} /><span>Connect</span>
        </div>
        <div className={`bottom-nav-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => handleTabChange('community')}>
          <div style={{position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>
            <Users size={20} />
            {unreadCommunityCount > 0 && (
              <span className="mobile-unread-badge">
                {unreadCommunityCount > 9 ? '9+' : unreadCommunityCount}
              </span>
            )}
          </div>
          <span>Community</span>
        </div>
        <div className={`bottom-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}>
          <User size={20} /><span>Profile</span>
        </div>
      </nav>

      {/* STREAK ANIMATION OVERLAY */}
      {showStreakAnimation && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(10px)', color: 'white', animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            fontSize: '6rem', filter: 'drop-shadow(0 0 40px #fb923c)', animation: 'bounce-streak 1s infinite'
          }}>🔥</div>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, marginTop: '20px', color: '#fb923c', textShadow: '0 0 20px #fb923c', textAlign: 'center' }}>
            {studyStreak} DAY STREAK!
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#fca5a5', marginTop: '10px', textAlign: 'center' }}>You are on fire! Keep it up! 🚀</p>
        </div>
      )}
    </div>
  );
};

export default App;

