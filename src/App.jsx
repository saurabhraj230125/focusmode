import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, ChevronDown, BookOpen, FlaskConical, Calculator, 
  Play, Pause, RotateCcw, BrainCircuit, Target, Plus, Clock,
  LayoutDashboard, BookHeart, Users, Trophy, Flame, 
  Stethoscope, Landmark, User, LogOut, Lock, Calendar, ArrowRight,
  Headphones, Send, Zap, MonitorPlay, Trash2, Video,
  Wifi, VideoOff, PhoneCall, Globe, X, Download, FileText, Save, Bot, Sparkles, Move, Columns, Rows, HelpCircle, ArrowUp, Search, MessageSquare, Shield
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
import { useCommunity, containsAbuse, useFirebaseUsers, syncUserToFirebase } from './useCommunity.js';
import { useEvents } from './useEvents.js';
import { usePushNotifications } from './usePushNotifications.js';

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

const App = () => {
  // Global States
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // Derived User State
  const currentUserProfile = usersDb[sessionUser]?.profile;
  const currentXP = currentUserProfile?.xp || 0;

  // ── Real-time Community (Gun.js) ──────────────────────────────────────────
  const {
    posts: feed,
    isLoading: isCommunityLoading,
    postMessage: gunPostMessage,
    toggleLike: gunToggleLike,
    addComment: gunAddComment,
    deletePost: gunDeletePost,
  } = useCommunity(sessionUser, currentXP, currentUserProfile?.prepType);
  
  const firebaseUsers = useFirebaseUsers();

  useEffect(() => {
    if (sessionUser && usersDb[sessionUser] && !usersDb[sessionUser].profile.isGuest) {
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
      return `Welcome to **FocusMode**! 🚀 This is the ultimate study dashboard for JEE, NEET & UPSC aspirants. Here's what you can do:\n\n1. **Plan:** Track daily tasks, study modules, and track your syllabus progress.\n2. **Journal:** Write daily reflections and download your notes.\n3. **Lectures:** Add YouTube links to watch ad-free without distractions.\n4. **Connect:** Join P2P video study rooms with other students.\n5. **Community:** Share updates and ask questions in real-time!\n\nI'm FocusBot, your AI guide. Let me know if you need help!`;
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
      return `**Memory & Retention Science** 🧠\n\nYour brain forgets 80% of new information within 24 hours (Ebbinghaus Forgetting Curve) — unless you actively fight it.\n\n**The 3 Most Powerful Techniques:**\n\n**1. Active Recall:** Don't re-read. Close the book and write/say everything you remember. Then check what you missed.\n\n**2. Spaced Repetition:** Review material at increasing intervals:\n• 1 day after learning → 3 days → 7 days → 21 days → 2 months\n• Use Anki app (free) for flashcards that auto-schedule this\n\n**3. The Feynman Technique:** Explain the concept in simple language as if teaching a child. Where you stumble = your gap.\n\n**Notes Strategy:** Don't copy textbook notes. Write in your own words. Use mind maps for interconnected topics.\n\n**For FocusMode:** Use the Journal tab to write what you learned today — this forces active recall! 📓`;
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

    // ── WEBSITE / APP FEATURE ALIGNMENT ─────────────────────────────────────
    
    if (t.match(/how to use|what is this website|what is focusmodeplayer|what is focusmode|guide|tutorial|how does this work|features/)) {
      return `**Welcome to FocusMode!** 🚀\n\nI am designed to be your ultimate study ecosystem. Here is how to use me for maximum productivity:\n\n**1. Dashboard (The Core):** Break your giant syllabus into Subjects → Modules → Subtasks. Check them off to earn XP.\n**2. Pomodoro Timer:** Use the 25-minute timer for intense focus sessions. Earning 50 XP per session builds a habit loop.\n**3. Community (Live):** Click the globe icon! It's a real-time feed of all aspirants worldwide. Share wins and tips.\n**4. Live Study Connect:** Join a virtual room to study silently with others (body doubling). It kills procrastination.\n**5. Journal & Mistakes:** At the end of the day, log what you learned and the mistakes you made. Active recall!\n**6. Lectures:** Paste any YouTube video URL. It blocks comments/recommendations and lets you take timestamped notes.\n\nStart by adding your first task on the Dashboard!`;
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

    } else if (!explicitLogout) {
      // Auto-create a Guest Session for first-timers
      const guestName = `Guest_${Math.floor(Math.random() * 90000 + 10000)}`;
      db = {
        ...db,
        [guestName]: {
          password: '',
          profile: { isGuest: true, prepType: '', targetYear: '', weakness: '', xp: 0, joined: new Date().toLocaleDateString() }
        }
      };
      setUsersDb(db);
      setSessionUser(guestName);
      localStorage.setItem('planmaker_session', guestName);
      syncUserToFirebase(guestName, db[guestName].profile);
      localStorage.setItem('planmaker_users', JSON.stringify(db));
      localStorage.setItem('planmaker_visits', '1');
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
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
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
    subjects.forEach(s => s.tasks.forEach(t => t.subtasks.forEach(sub => {
      total++; if (sub.completed) completed++;
    })));
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
    const isGuest = usersDb[sessionUser]?.profile?.isGuest;
    if ((tab === 'community' || tab === 'connect') && isGuest) {
      setAuthMode('register');
      setAuthWallMsg(`You need to create a free account to access ${tab === 'community' ? 'the Community' : 'Study Connect'}.`);
      setShowAuthWall(true);
      return;
    }
    trackTabChange(tab);
    setActiveTab(tab);
  };

  // Auth Functions
  const handleAuth = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authUsername.trim() || !authPassword.trim()) {
      setAuthError('Please fill all fields');
      return;
    }

    if (authMode === 'register' || (showAuthWall && usersDb[sessionUser]?.profile?.isGuest)) {
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
      // Normal Login
      const user = usersDb[authUsername];
      if (!user || user.password !== authPassword) {
        setAuthError('Invalid username or password'); return;
      }
      trackLogin();
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
  const submitOnboarding = () => {
    if (!onboardPrep || !onboardYear) return;
    trackOnboarding(onboardPrep, onboardYear);
    setUsersDb(prev => ({
      ...prev, [sessionUser]: { ...prev[sessionUser], profile: { ...prev[sessionUser].profile, prepType: onboardPrep, targetYear: onboardYear, weakness: onboardWeakness } }
    }));
    const initialSubjects = examTemplates[onboardPrep] || examTemplates['JEE'];
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
          subtasks: [ { id: Date.now() + '1', title: 'Theory / Notes', completed: false }, { id: Date.now() + '2', title: 'Practice Qs / PYQs', completed: false } ]
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
    
    setSubjects(prev => {
      let updatedSubjects = prev.map(subject => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          tasks: subject.tasks.map(task => {
            if (task.id !== taskId) return task;
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

    if (taskCompletedJustNow) { trackSubtaskCompleted(subjectId); awardXP(5, 'Completed Subtask'); updateStreak(); }
    if (allCompletedNow) {
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
    let content = `FocusMode — Lecture Notes\n${'='.repeat(40)}\nVideo: ${video.title}\nDate: ${dateStr}\n${'='.repeat(40)}\n\n`;
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
      <div className="auth-wrapper">
        <div className="glass auth-card animate-fade-in">
          <Headphones size={48} color="var(--accent-physics)" style={{marginBottom: '1rem'}} />
          <h1 className="greeting" style={{fontSize: '2rem'}}>FocusMode</h1>
          <p className="subtitle" style={{marginBottom: '2rem', textAlign: 'center'}}>Welcome back to your dashboard.</p>
          
          <form className="auth-form" onSubmit={handleAuth}>
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input type="text" placeholder="Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="input-field with-icon" />
            </div>
            <div className="input-group">
              <Lock size={18} className="input-icon" />
              <input type="password" placeholder="Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="input-field with-icon" />
            </div>
            {authError && <p className="auth-error">{authError}</p>}
            <button type="submit" className="btn-primary" style={{width: '100%', padding: '14px', marginTop: '10px'}}>
              {authMode === 'login' ? 'Login' : 'Create Account'}
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
    );
  }

  const isFullyOnboarded = !!currentUserProfile?.prepType;
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

  if (!isFullyOnboarded) {
    return (
      <div className="onboarding-wrapper">
        <div className="glass onboarding-card animate-fade-in" style={{maxWidth: '800px'}}>
          <h1 className="greeting" style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Let's build your profile, {sessionUser}</h1>
          <p className="subtitle" style={{marginBottom: '3rem', textAlign: 'center'}}>Answer a few questions to deeply customize your dashboard.</p>
          
          <div className="onboard-grid">
            <div className="onboard-step">
              <h3>1. What are you preparing for?</h3>
              <div className="exam-options" style={{justifyContent: 'flex-start', flexWrap: 'wrap'}}>
                {Object.keys(examTemplates).map(exam => (
                  <button key={exam} className={`exam-btn ${onboardPrep === exam ? 'selected' : ''}`} onClick={() => setOnboardPrep(exam)} style={{padding: '1rem', width: 'auto'}}>
                    {exam === 'JEE' || exam === 'SAT' || exam === 'GMAT' ? <Calculator size={20}/> : 
                     exam === 'NEET' || exam === 'MCAT' ? <Stethoscope size={20}/> : 
                     exam === 'GRE' || exam === 'AP' ? <BrainCircuit size={20}/> : 
                     exam === 'IB' ? <Globe size={20}/> : <Landmark size={20}/>}
                    {exam}
                  </button>
                ))}
              </div>
            </div>
            <div className="onboard-step">
              <h3>2. What is your target year?</h3>
              <div className="input-group">
                <Calendar size={18} className="input-icon" />
                <input type="number" placeholder="e.g. 2025" value={onboardYear} onChange={e => setOnboardYear(e.target.value)} className="input-field with-icon" />
              </div>
            </div>
            <div className="onboard-step">
              <h3>3. What is your biggest weakness right now?</h3>
              <textarea className="journal-textarea" style={{minHeight: '80px', marginTop: '10px'}} placeholder="e.g. Silly calculation mistakes in Physics, or struggling with Organic Chem memorization..." value={onboardWeakness} onChange={e => setOnboardWeakness(e.target.value)} />
            </div>
          </div>
          <button className="btn-primary" onClick={submitOnboarding} disabled={!onboardPrep || !onboardYear} style={{marginTop: '2rem', width: '100%', padding: '15px'}}>Complete Setup <ArrowRight size={18} /></button>
        </div>
      </div>
    );
  }

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

    // Syllabus topics by exam
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

    return (
      <div className="dashboard-grid animate-fade-in">
        <div className="left-col">

          {/* Streak + Stats Banner */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'1rem', marginBottom:'1rem'}}>
            <div className="glass" style={{padding:'1.25rem', textAlign:'center', background:'linear-gradient(135deg,rgba(239,68,68,0.12),rgba(251,146,60,0.08))', borderColor:'rgba(239,68,68,0.2)'}}>
              <div style={{fontSize:'2rem', marginBottom:'4px'}}>{'🔥'.repeat(Math.min(studyStreak,5)) || '🔥'}</div>
              <div style={{fontSize:'1.8rem', fontWeight:800, color:'#fb923c', lineHeight:1}}>{studyStreak}</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px', fontWeight:600}}>Day Streak</div>
            </div>
            <div className="glass" style={{padding:'1.25rem', textAlign:'center', background:'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(109,40,217,0.08))', borderColor:'rgba(139,92,246,0.2)'}}>
              <div style={{fontSize:'1.8rem', fontWeight:800, color:'var(--accent-physics)', lineHeight:1}}>{currentXP}</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px', fontWeight:600}}>Total XP</div>
            </div>
            <div className="glass" style={{padding:'1.25rem', textAlign:'center', background:'linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))', borderColor:'rgba(16,185,129,0.2)'}}>
              <div style={{fontSize:'1.8rem', fontWeight:800, color:'var(--accent-success)', lineHeight:1}}>{progress}%</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px', fontWeight:600}}>Today Done</div>
            </div>
            <div className="glass" style={{padding:'1.25rem', textAlign:'center', background:'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(37,99,235,0.08))', borderColor:'rgba(59,130,246,0.2)'}}>
              <div style={{fontSize:'1.8rem', fontWeight:800, color:'var(--accent-math)', lineHeight:1}}>{syllabusPct}%</div>
              <div style={{fontSize:'0.75rem', color:'var(--text-muted)', marginTop:'4px', fontWeight:600}}>Syllabus</div>
            </div>
          </div>

          {/* Syllabus Tracker */}
          <div className="glass" style={{padding:'1.5rem', marginBottom:'1rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{fontSize:'1rem', fontWeight:800, display:'flex', alignItems:'center', gap:'8px'}}><BookOpen size={16} color="var(--accent-math)"/> Syllabus Tracker</h3>
              <div style={{background:'rgba(59,130,246,0.1)', color:'var(--accent-math)', padding:'4px 12px', borderRadius:'100px', fontSize:'0.8rem', fontWeight:700}}>{doneCount}/{allSyllabusTopics.length} done</div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {Object.entries(syllabus).map(([subject, topics]) => {
                const subDone = topics.filter(t => syllabusChecked[`${subject}::${t}`]).length;
                const subPct = Math.round((subDone / topics.length) * 100);
                return (
                  <div key={subject}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'6px'}}>
                      <span style={{fontSize:'0.85rem', fontWeight:700, color:'white'}}>{subject}</span>
                      <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{subDone}/{topics.length}</span>
                    </div>
                    <div style={{height:'4px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', marginBottom:'8px'}}>
                      <div style={{height:'100%', width:`${subPct}%`, background:'linear-gradient(90deg, var(--accent-math), var(--accent-physics))', borderRadius:'4px', transition:'width 0.4s ease'}}></div>
                    </div>
                    <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                      {topics.map(topic => {
                        const key = `${subject}::${topic}`;
                        const done = syllabusChecked[key];
                        return (
                          <button key={topic} onClick={() => toggleSyllabus(key)} style={{padding:'4px 10px', borderRadius:'100px', fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.2s', background: done ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', color: done ? 'var(--accent-success)' : 'var(--text-muted)', border: done ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(255,255,255,0.08)', textDecoration: done ? 'line-through' : 'none'}}>
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

          <section className="glass progress-section">
            <div className="progress-header">
              <h2 className="progress-title">Today's Task Progress</h2>
              <span className="progress-percentage">{progress}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </section>
          <form className="glass add-task-form" onSubmit={handleAddTask}>
            <select className="input-field" value={newTaskSubject} onChange={(e) => setNewTaskSubject(e.target.value)}>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
            <input type="text" className="input-field" placeholder="E.g., Complete Chapter 4 Practice Qs" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
            <button type="submit" className="btn-primary"><Plus size={18} /> Add</button>
          </form>
          <div className="subjects-grid">
            {subjects.map(subject => {
              const isExpanded = expandedSubjects.includes(subject.id);
              let total = 0, comp = 0;
              subject.tasks.forEach(t => t.subtasks.forEach(s => { total++; if(s.completed) comp++; }));
              const subPct = total === 0 ? 0 : Math.round((comp / total) * 100);
              return (
                <div key={subject.id} className="glass subject-card">
                  <div className="subject-header" onClick={() => setExpandedSubjects(prev => prev.includes(subject.id) ? prev.filter(x => x !== subject.id) : [...prev, subject.id])}>
                    <div className="subject-info">
                      <div className="subject-icon" style={{background: 'rgba(255,255,255,0.1)'}}>
                        {getSubjectIcon(subject.icon)}
                      </div>
                      <div style={{flex:1}}>
                        <h3 className="subject-title">{subject.title}</h3>
                        <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}>
                          <div style={{flex:1, height:'3px', background:'rgba(255,255,255,0.08)', borderRadius:'3px'}}>
                            <div style={{height:'100%', width:`${subPct}%`, background:'var(--accent-success)', borderRadius:'3px', transition:'width 0.4s'}}></div>
                          </div>
                          <span style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{comp}/{total}</span>
                        </div>
                      </div>
                    </div>
                    <button className={`toggle-btn ${isExpanded ? 'expanded' : ''}`}><ChevronDown size={20} /></button>
                  </div>
                  {isExpanded && (
                    <div className="tasks-list">
                      {subject.tasks.length === 0 && <p className="text-muted" style={{color: '#94a3b8', fontSize: '0.9rem'}}>No tasks added yet.</p>}
                      {subject.tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <div style={{fontWeight: 600, marginBottom: '8px', fontSize:'0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span>{task.title}</span>
                            <button onClick={() => handleDeleteTask(subject.id, task.id)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.3)', cursor:'pointer', fontSize:'1rem'}}>&times;</button>
                          </div>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '24px'}}>
                            {task.subtasks.map(subtask => (
                              <label key={subtask.id} className="checkbox-wrapper">
                                <input type="checkbox" checked={subtask.completed} onChange={() => toggleSubtask(subject.id, task.id, subtask.id)} />
                                <div className="checkmark"><Check /></div>
                                <span className="checkbox-text" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                  {subtask.title}
                                  {!subtask.completed && <span style={{fontSize: '0.75rem', color: 'var(--accent-physics)'}}>+5 XP</span>}
                                  {subtask.completed && <span style={{fontSize:'0.75rem', color:'var(--accent-success)'}}>✓ Done</span>}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <aside className="right-sidebar">
          <div className="glass timer-card" style={{position: 'relative', overflow: 'hidden'}}>
            <div style={{position: 'absolute', top: '-50px', left: '-50px', width: '150px', height: '150px', background: 'var(--accent-physics)', filter: 'blur(80px)', opacity: 0.3}}></div>
            <div style={{position: 'absolute', bottom: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-chem)', filter: 'blur(80px)', opacity: 0.3}}></div>
            
            <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem', position: 'relative', zIndex: 1}}> ⏳ Focus Timer </h3>
            
            <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '2rem', flexWrap: 'wrap', position: 'relative', zIndex: 1}}>
              <button style={{padding: '6px 14px', borderRadius: '100px', background: sessionType === 'pomodoro' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)', color: sessionType === 'pomodoro' ? 'white' : '#94a3b8', border: sessionType === 'pomodoro' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}} onClick={() => setTimer('pomodoro')}>25m Focus</button>
              <button style={{padding: '6px 14px', borderRadius: '100px', background: sessionType === 'pomodoro50' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)', color: sessionType === 'pomodoro50' ? 'white' : '#94a3b8', border: sessionType === 'pomodoro50' ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}} onClick={() => setTimer('pomodoro50')}>50m Deep</button>
              <button style={{padding: '6px 14px', borderRadius: '100px', background: sessionType === 'shortBreak' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.2)', color: sessionType === 'shortBreak' ? '#34d399' : '#94a3b8', border: sessionType === 'shortBreak' ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}} onClick={() => setTimer('shortBreak')}>5m Break</button>
              <button style={{padding: '6px 14px', borderRadius: '100px', background: sessionType === 'longBreak' ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.2)', color: sessionType === 'longBreak' ? '#34d399' : '#94a3b8', border: sessionType === 'longBreak' ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s', fontWeight: 600, fontSize: '0.85rem'}} onClick={() => setTimer('longBreak')}>10m Chill</button>
            </div>
            
            <div className="timer-display" style={{fontSize: '4.5rem', fontWeight: 800, textShadow: '0 0 40px rgba(255,255,255,0.2)', letterSpacing: '-2px', position: 'relative', zIndex: 1, margin: '1rem 0'}}>{formatTime(timeLeft)}</div>
            
            <div style={{fontSize: '0.9rem', color: 'var(--accent-success)', marginBottom: '1.5rem', fontWeight: 'bold', background: 'rgba(16,185,129,0.1)', padding: '6px 16px', borderRadius: '100px', display: 'inline-block', position: 'relative', zIndex: 1}}> Reward: +{sessionType.includes('pomodoro') ? (sessionType === 'pomodoro50' ? '100' : '50') : '10'} XP </div>
            
            <div className="timer-controls" style={{position: 'relative', zIndex: 1}}>
              <button className="btn-primary" onClick={startTimer} style={{padding: '12px 32px', fontSize: '1.1rem', borderRadius: '100px', boxShadow: isActive ? '0 0 20px rgba(139,92,246,0.5)' : 'none'}}>
                {isActive ? <Pause size={20} /> : <Play size={20} />}
                {isActive ? 'Pause' : 'Start Grind'}
              </button>
              <button className="btn-icon" onClick={() => setTimer(sessionType)} style={{padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%'}}><RotateCcw size={20} /></button>
            </div>
          </div>

          {/* Weekly Mini Planner Preview */}
          <div className="glass" style={{padding:'1.5rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{fontSize:'1rem', fontWeight:800, display:'flex', alignItems:'center', gap:'6px'}}><Calendar size={16} color="var(--accent-chem)"/> This Week</h3>
              <button onClick={() => handleTabChange('planner')} style={{fontSize:'0.75rem', color:'var(--accent-physics)', background:'transparent', border:'none', cursor:'pointer', fontWeight:600}}>View All →</button>
            </div>
            <div style={{display:'flex', gap:'6px', justifyContent:'space-between'}}>
              {days.map(d => {
                const tasks = plannerTasks[d] || [];
                const done = tasks.filter(t => t.done).length;
                const isToday = d === todayStr;
                return (
                  <div key={d} style={{flex:1, textAlign:'center'}}>
                    <div style={{fontSize:'0.7rem', color: isToday ? 'var(--accent-physics)' : 'var(--text-muted)', fontWeight: isToday ? 800 : 500, marginBottom:'4px'}}>{d}</div>
                    <div style={{height:'36px', borderRadius:'8px', background: isToday ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', border: isToday ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'2px'}}>
                      {tasks.length > 0 ? (
                        <>
                          <div style={{fontSize:'0.7rem', fontWeight:700, color: done === tasks.length ? 'var(--accent-success)' : 'white'}}>{done}/{tasks.length}</div>
                          <div style={{width:'80%', height:'3px', background:'rgba(255,255,255,0.1)', borderRadius:'2px'}}>
                            <div style={{height:'100%', width:`${tasks.length ? (done/tasks.length)*100 : 0}%`, background:'var(--accent-success)', borderRadius:'2px'}}></div>
                          </div>
                        </>
                      ) : <div style={{fontSize:'0.65rem', color:'rgba(255,255,255,0.2)'}}>–</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streak card */}
          <div className="glass" style={{padding:'1.5rem', background:'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(251,146,60,0.05))', borderColor:'rgba(239,68,68,0.15)'}}>
            <h3 style={{fontSize:'0.95rem', fontWeight:800, display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.75rem'}}>
              🔥 Study Streak
            </h3>
            <div style={{display:'flex', gap:'6px', marginBottom:'10px'}}>
              {[...Array(7)].map((_,i) => (
                <div key={i} style={{flex:1, height:'28px', borderRadius:'6px', background: i < (studyStreak % 7 || (studyStreak > 0 ? 7 : 0)) ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'rgba(255,255,255,0.05)', boxShadow: i < (studyStreak % 7 || (studyStreak > 0 ? 7 : 0)) ? '0 4px 10px rgba(239,68,68,0.3)' : 'none', transition:'all 0.3s'}}></div>
              ))}
            </div>
            <p style={{fontSize:'0.82rem', color:'var(--text-muted)'}}>
              {studyStreak === 0 ? 'Start studying to build your streak!' : `${studyStreak} day${studyStreak > 1 ? 's' : ''} strong! Keep it up 💪`}
            </p>
          </div>
        </aside>
      </div>
    );
  };

  const renderJournal = () => (
    <div className="journal-layout animate-fade-in">
      <div>
        <div className="glass journal-card" style={{marginBottom: '2rem'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem'}}>😌 How was your study mood today?</h3>
          <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
            {['😭','😢','😐','🙂','🔥'].map(emoji => (
               <button key={emoji} onClick={() => setTodayMood(emoji)} style={{fontSize: '2rem', padding: '10px', background: todayMood === emoji ? 'rgba(255,255,255,0.1)' : 'transparent', border: todayMood === emoji ? '2px solid var(--accent-success)' : '2px solid transparent', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s', filter: todayMood === emoji ? 'drop-shadow(0 0 10px rgba(16,185,129,0.5))' : 'grayscale(0.5)'}}>{emoji}</button>
            ))}
          </div>
        </div>
        <div className="glass journal-card">
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}><BookHeart size={20} color="var(--accent-chem)" /> What I Learned Today</h3>
          <textarea className="journal-textarea" placeholder="Summarize the core concepts you grasped today..." value={learnedText} onChange={(e) => setLearnedText(e.target.value)}></textarea>
        </div>
        <div className="glass journal-card" style={{marginTop: '2rem'}}>
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}><Target size={20} color="var(--accent-math)" /> Mistakes & Weaknesses</h3>
          <textarea className="journal-textarea" placeholder="Jot down silly errors or weak spots from today's mocks/practice..." value={mistakesText} onChange={(e) => setMistakesText(e.target.value)}></textarea>
        </div>
        <button className="btn-primary" style={{marginTop: '1.5rem', width: '100%'}} onClick={saveJournalEntry}>Save Daily Log (+15 XP)</button>
      </div>
      <div>
        <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Past Logs</h2>
        {journalHistory.map((log, i) => (
          <div key={i} className="glass history-card">
            <div className="history-entry">
              <div className="history-date">{log.date}</div>
              <div className="history-text" style={{whiteSpace: 'pre-line'}}>{log.text}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPlanner = () => {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const todayStr = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()];
    const subjectColors = { Physics:'#8b5cf6', Chemistry:'#ec4899', Mathematics:'#3b82f6', Biology:'#10b981', History:'#f59e0b', Polity:'#06b6d4', Geography:'#8b5cf6', Economy:'#ef4444' };

    return (
      <div className="animate-fade-in" style={{display:'flex', flexDirection:'column', gap:'2rem', maxWidth:'1000px'}}>
        {/* Header */}
        <div className="glass" style={{padding:'2rem', background:'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(236,72,153,0.05))', borderColor:'rgba(139,92,246,0.2)'}}>
          <h2 style={{fontSize:'1.75rem', fontWeight:800, marginBottom:'0.5rem', display:'flex', alignItems:'center', gap:'12px'}}><Calendar size={28} color="var(--accent-physics)"/> Weekly Study Planner</h2>
          <p style={{color:'var(--text-muted)'}}>Plan your week topic by topic. Track what you complete each day.</p>
        </div>

        {/* Add Task Form */}
        <div className="glass" style={{padding:'1.5rem'}}>
          <h3 style={{fontSize:'1rem', fontWeight:700, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px'}}><Plus size={16} color="var(--accent-success)"/> Schedule a Study Block</h3>
          <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
            <select className="input-field" value={plannerDay} onChange={e => setPlannerDay(e.target.value)} style={{flex:'0 0 auto', minWidth:'80px'}}>
              {days.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" className="input-field" value={plannerTime} onChange={e => setPlannerTime(e.target.value)} style={{flex:'0 0 auto', width:'110px'}} />
            <select className="input-field" value={plannerSubject} onChange={e => setPlannerSubject(e.target.value)} style={{flex:'0 0 auto', minWidth:'120px'}}>
              <option value="">Subject...</option>
              {subjects.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
            </select>
            <input className="input-field" placeholder="What will you study? E.g. HC Verma Ch.12" value={plannerInput} onChange={e => setPlannerInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addPlannerTask()} style={{flex:'1 1 200px'}} />
            <button className="btn-primary" onClick={addPlannerTask} style={{flex:'0 0 auto', whiteSpace:'nowrap'}}><Plus size={16}/> Add Block</button>
          </div>
        </div>

        {/* Weekly Grid */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'1rem'}}>
          {days.map(day => {
            const tasks = plannerTasks[day] || [];
            const done = tasks.filter(t => t.done).length;
            const isToday = day === todayStr;
            return (
              <div key={day} className="glass" style={{padding:'1rem', borderColor: isToday ? 'rgba(139,92,246,0.4)' : 'var(--card-border)', background: isToday ? 'rgba(139,92,246,0.05)' : 'var(--card-bg)', minHeight:'160px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                  <div>
                    <div style={{fontSize:'0.9rem', fontWeight:800, color: isToday ? 'var(--accent-physics)' : 'white'}}>{day}</div>
                    {isToday && <div style={{fontSize:'0.65rem', color:'var(--accent-physics)', fontWeight:600}}>TODAY</div>}
                  </div>
                  {tasks.length > 0 && <div style={{fontSize:'0.7rem', color: done === tasks.length ? 'var(--accent-success)' : 'var(--text-muted)', fontWeight:700}}>{done}/{tasks.length}</div>}
                </div>
                {tasks.length === 0 ? (
                  <div style={{color:'rgba(255,255,255,0.15)', fontSize:'0.75rem', textAlign:'center', marginTop:'1.5rem'}}>No blocks yet</div>
                ) : (
                  <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                    {tasks.map(task => (
                      <div key={task.id} style={{display:'flex', gap:'6px', alignItems:'flex-start'}}>
                        <button onClick={() => togglePlannerTask(day, task.id)} style={{marginTop:'2px', width:'14px', height:'14px', minWidth:'14px', borderRadius:'3px', border:`2px solid ${task.done ? 'var(--accent-success)' : 'rgba(255,255,255,0.2)'}`, background: task.done ? 'var(--accent-success)' : 'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          {task.done && <Check size={8} color="white"/>}
                        </button>
                        <div style={{flex:1, minWidth:0}}>
                          {task.time && <div style={{fontSize:'0.62rem', color:'var(--accent-math)', fontWeight:700, marginBottom:'2px'}}>{task.time}</div>}
                          {task.subject && <div style={{fontSize:'0.62rem', padding:'1px 5px', borderRadius:'4px', background:`${subjectColors[task.subject] || '#8b5cf6'}22`, color:subjectColors[task.subject] || 'var(--accent-physics)', marginBottom:'2px', fontWeight:600}}>{task.subject}</div>}
                          <div style={{fontSize:'0.75rem', lineHeight:1.3, textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--text-muted)' : 'white', wordBreak:'break-word'}}>{task.text}</div>
                        </div>
                        <button onClick={() => deletePlannerTask(day, task.id)} style={{background:'transparent', border:'none', color:'rgba(255,255,255,0.2)', cursor:'pointer', fontSize:'0.7rem', marginTop:'2px', flexShrink:0, lineHeight:1}}>&times;</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Weekly Stats */}
        <div className="glass" style={{padding:'1.5rem'}}>
          <h3 style={{fontSize:'1rem', fontWeight:800, marginBottom:'1rem', display:'flex', alignItems:'center', gap:'8px'}}><Target size={16} color="var(--accent-chem)"/> Weekly Summary</h3>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem'}}>
            {[
              { label:'Total Blocks', val: days.reduce((s,d) => s + (plannerTasks[d]?.length || 0), 0), color:'var(--accent-physics)'},
              { label:'Completed', val: days.reduce((s,d) => s + (plannerTasks[d]?.filter(t=>t.done).length || 0), 0), color:'var(--accent-success)'},
              { label:'Remaining', val: days.reduce((s,d) => s + (plannerTasks[d]?.filter(t=>!t.done).length || 0), 0), color:'#f59e0b'},
              { label:'Active Days', val: days.filter(d => (plannerTasks[d]?.length || 0) > 0).length, color:'var(--accent-math)'},
            ].map(stat => (
              <div key={stat.label} style={{textAlign:'center', padding:'1rem', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontSize:'2rem', fontWeight:800, color:stat.color}}>{stat.val}</div>
                <div style={{fontSize:'0.8rem', color:'var(--text-muted)', marginTop:'4px'}}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };


﻿  const renderCommunity = () => {
    const getProfileData = (username) => {
      if (usersDb[username]) return usersDb[username].profile;
      const post = feed.find(f => f.user === username);
      return { prepType: post?.prep || "JEE", xp: post?.xp || 0 };
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
       .filter(f => !f.user.startsWith('Guest_'))
       .map(f => {
       const isOnline = f.createdAt ? (now - f.createdAt) < onlineThreshold : false;
       const { level } = getLevelData(f.xp || 0);
       return { name: f.user, xp: f.xp, level, isOnline };
    });

    allPeers = allPeers.sort((a,b) => b.isOnline - a.isOnline);

    const conversationNames = new Set();
    feed.forEach(message => {
      if (!message.action.startsWith('@DM_')) return;
      const messagePrefix = `@DM_${sessionUser}_`;
      const reversePrefix = '@DM_';
      if (message.action.startsWith(messagePrefix)) {
        const target = message.action.slice(messagePrefix.length).split(' ')[0];
        if (target) conversationNames.add(target);
      } else if (message.action.startsWith(reversePrefix)) {
        const header = message.action.slice(reversePrefix.length).split(' ')[0];
        const separator = header.lastIndexOf(`_${sessionUser}`);
        if (separator > 0) conversationNames.add(header.slice(0, separator));
      }
    });

    const conversationPeers = allPeers
      .filter(peer => conversationNames.has(peer.name))
      .sort((a, b) => b.isOnline - a.isOnline);
    const otherPeers = allPeers.filter(peer => !conversationNames.has(peer.name));

    const chatMessages = feed.filter(f => {
       if (activeChat === "global") return !f.action.startsWith("@DM_");
       const targetUser = activeChat.split(":")[1];
       return f.action.startsWith(`@DM_${sessionUser}_${targetUser}`) || f.action.startsWith(`@DM_${targetUser}_${sessionUser}`);
    });

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      
      let finalMsg = chatInput;
      setChatInput(""); // Clear immediately for snappy UX

      if (activeChat !== "global") {
        const targetUser = activeChat.split(":")[1];
        finalMsg = `@DM_${sessionUser}_${targetUser} ${finalMsg}`;
      }
      
      if (containsAbuse(finalMsg)) {
        alert("Restricted: Abusive language is not permitted.");
        return;
      }
      
      trackPostCreated();
      const id = await gunPostMessage(finalMsg);
      if (id) {
        awardXP(2, 'Community Post');
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
      <div className="community-wrapper animate-fade-in" style={{maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 100px)", gap: "1rem"}}>
        {/* Profile Modal */}
        {viewingProfile && (() => {
          const prof = getProfileData(viewingProfile);
          const { level: pL, title: pT } = getLevelData(prof?.xp || 0);
          return (
            <div style={{position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.8)", backdropFilter:"blur(10px)", padding:"1rem"}} onClick={() => setViewingProfile(null)}>
              <div className="glass" style={{maxWidth:"400px", width:"100%", padding:"2rem", borderRadius:"24px", position:"relative"}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewingProfile(null)} style={{position:"absolute", top:"16px", right:"16px", background:"transparent", border:"none", color:"var(--text-muted)", cursor:"pointer", zIndex: 10}}><X size={20}/></button>
                <div style={{height:"80px", borderRadius:"14px 14px 0 0", marginBottom:"-30px", background:`linear-gradient(135deg, ${getAvatarColor(viewingProfile)}, #1a1c29)`, marginLeft:"-2rem", marginRight:"-2rem", marginTop:"-2rem"}}></div>
                <div style={{width:"68px", height:"68px", borderRadius:"50%", background:getAvatarColor(viewingProfile), display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.8rem", fontWeight:"bold", border:"3px solid #0f1015", position:"relative", zIndex:1}}>{viewingProfile.charAt(0).toUpperCase()}</div>
                <h2 style={{fontSize:"1.25rem", fontWeight:800, marginTop:"8px"}}>{viewingProfile}</h2>
                <p style={{color:"var(--accent-success)", fontSize:"0.88rem", fontWeight:600, marginBottom:"12px"}}>⚡ Lvl {pL} · {pT}</p>
                <button className="btn-primary" style={{width: "100%", padding: "8px"}} onClick={() => { setActiveChat(`user:${viewingProfile}`); setActiveCommunityTab("chat"); setViewingProfile(null); }}>💬 Direct Message</button>
              </div>
            </div>
          );
        })()}

        {/* Top Navigation Tabs */}
        <div className="community-tabs" style={{display: "flex", flexWrap: "wrap", gap: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px", flexShrink: 0, alignItems: "center"}}>
           <button onClick={() => setActiveCommunityTab("chat")} style={{padding: "8px 16px", borderRadius: "100px", background: activeCommunityTab === "chat" ? "linear-gradient(135deg, var(--accent-physics), #c026d3)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s", boxShadow: activeCommunityTab === "chat" ? "0 4px 15px rgba(139, 92, 246, 0.4)" : "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem"}}><MessageSquare size={16}/> Live Lounge</button>
           <button onClick={() => setActiveCommunityTab("squads")} style={{padding: "8px 16px", borderRadius: "100px", background: activeCommunityTab === "squads" ? "linear-gradient(135deg, var(--accent-math), #2563eb)" : "rgba(255,255,255,0.05)", border: "none", color: "white", fontWeight: "bold", cursor: "pointer", transition: "all 0.3s", boxShadow: activeCommunityTab === "squads" ? "0 4px 15px rgba(59, 130, 246, 0.4)" : "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.9rem"}}><Target size={16}/> Squad Missions</button>
           
           {pushPermission === 'default' && (
             <button onClick={() => requestPushPermission()} style={{marginLeft: "auto", padding: "8px 16px", borderRadius: "100px", background: "rgba(16,185,129,0.1)", border: "1px solid var(--accent-success)", color: "var(--accent-success)", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s", fontSize: "0.9rem"}}>🔔 Alerts</button>
           )}
        </div>

        {/* Tab Content */}
        {activeCommunityTab === "chat" ? (
          <div className="community-chat-layout" style={{flex: 1, minHeight: 0, width: "100%", maxWidth: "100%"}}>
            {/* Left Peers List - Gamified Sidebar */}
            <div className="glass peers-sidebar" style={{borderRadius: "24px", overflowY: "auto", padding: "0", display: "flex", flexDirection: "column", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15, 23, 42, 0.6)"}}>
              <div style={{padding: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)", position: "sticky", top: 0, background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(10px)", zIndex: 10}}>
                 <h3 style={{fontSize: "0.9rem", color: "white", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", textTransform: "uppercase", letterSpacing: "1px"}}><Users size={16} color="var(--accent-physics)"/> Connect</h3>
              </div>
              
              <div style={{padding: "1rem"}}>
                <div className={`peer-item ${activeChat === "global" ? "active" : ""}`} onClick={() => setActiveChat("global")} style={{display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", background: activeChat === "global" ? "rgba(139, 92, 246, 0.15)" : "transparent", border: activeChat === "global" ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid transparent", marginBottom: "1rem"}}>
                  <div style={{width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0, boxShadow: "0 4px 10px rgba(139,92,246,0.3)"}}>🌍</div>
                  <div style={{display: "flex", flexDirection: "column"}}>
                     <span style={{fontWeight: "bold", fontSize: "0.95rem", color: "white"}}>Global Lounge</span>
                     <span style={{fontSize: "0.7rem", color: "var(--accent-success)", fontWeight: "600"}}>Public Chat</span>
                  </div>
                </div>

                <h3 style={{fontSize: "0.75rem", color: "var(--text-muted)", margin: "1rem 0 0.75rem 0", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold"}}>Your conversations ({conversationPeers.length})</h3>
                
                <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  {conversationPeers.map(peer => (
                    <div key={peer.name} className={`peer-item ${activeChat === `user:${peer.name}` ? "active" : ""}`} onClick={() => setActiveChat(`user:${peer.name}`)} style={{display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", background: activeChat === `user:${peer.name}` ? "rgba(255,255,255,0.05)" : "transparent"}}>
                      <div style={{position: "relative"}}>
                         <div style={{width: "38px", height: "38px", borderRadius: "12px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold", flexShrink: 0, border: peer.isOnline ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)"}}>{peer.name.charAt(0).toUpperCase()}</div>
                         {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                      </div>
                      <div style={{display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                         <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: peer.isOnline ? "white" : "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem"}}>{peer.name}</span>
                         <span style={{fontSize: "0.65rem", color: "var(--accent-physics)", fontWeight: "bold"}}>Lvl {peer.level}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <h3 style={{fontSize: "0.75rem", color: "var(--text-muted)", margin: "1rem 0 0.75rem 0", paddingLeft: "4px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "bold"}}>Students ({otherPeers.length})</h3>
                <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  {otherPeers.map(peer => (
                    <div key={peer.name} className={`peer-item ${activeChat === `user:${peer.name}` ? "active" : ""}`} onClick={() => setActiveChat(`user:${peer.name}`)} style={{display: "flex", alignItems: "center", gap: "12px", padding: "10px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", background: activeChat === `user:${peer.name}` ? "rgba(255,255,255,0.05)" : "transparent"}}>
                      <div style={{position: "relative"}}>
                        <div style={{width: "38px", height: "38px", borderRadius: "12px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold", flexShrink: 0, border: peer.isOnline ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)"}}>{peer.name.charAt(0).toUpperCase()}</div>
                        {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                      </div>
                      <div style={{display: "flex", flexDirection: "column", flex: 1, minWidth: 0}}>
                        <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: peer.isOnline ? "white" : "var(--text-muted)", fontWeight: "600", fontSize: "0.9rem"}}>{peer.name}</span>
                        <span style={{fontSize: "0.65rem", color: "var(--accent-physics)", fontWeight: "bold"}}>Lvl {peer.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area - Ultra Premium */}
            <div className="glass chat-main-area" style={{borderRadius: "24px", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15, 23, 42, 0.6)"}}>
              {/* Mobile Peers List */}
              <div className="mobile-peers-list custom-scrollbar" style={{display: "flex", gap: "10px", padding: "12px 1rem", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto", background: "rgba(15, 23, 42, 0.95)"}}>
                <div onClick={() => setActiveChat("global")} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", opacity: activeChat === "global" ? 1 : 0.4, transition: "opacity 0.2s", flexShrink: 0}}>
                  <div style={{width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", boxShadow: activeChat === "global" ? "0 0 10px rgba(59,130,246,0.5)" : "none"}}>🌍</div>
                  <span style={{fontSize: "0.65rem", fontWeight: "bold", color: "white"}}>Global</span>
                </div>
                {allPeers.map(peer => (
                  <div key={peer.name} onClick={() => setActiveChat(`user:${peer.name}`)} style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", cursor: "pointer", opacity: activeChat === `user:${peer.name}` ? 1 : 0.4, transition: "opacity 0.2s", flexShrink: 0}}>
                    <div style={{position: "relative"}}>
                       <div style={{width: "42px", height: "42px", borderRadius: "12px", background: getAvatarColor(peer.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold", border: peer.isOnline ? "2px solid #10b981" : "2px solid rgba(255,255,255,0.1)", boxShadow: activeChat === `user:${peer.name}` ? "0 0 10px rgba(255,255,255,0.2)" : "none"}}>{peer.name.charAt(0).toUpperCase()}</div>
                       {peer.isOnline && <div style={{position: "absolute", bottom: "-2px", right: "-2px", width: "12px", height: "12px", borderRadius: "50%", background: "#10b981", border: "2px solid #0f172a"}}></div>}
                    </div>
                    <span style={{fontSize: "0.65rem", fontWeight: "bold", color: "white", maxWidth: "48px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{peer.name}</span>
                  </div>
                ))}
              </div>

              {/* Chat Header */}
              <div className="chat-header" style={{padding: "1.25rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", gap: "16px", backdropFilter: "blur(10px)"}}>
                <div style={{width: "48px", height: "48px", borderRadius: "14px", background: activeChat === "global" ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : getAvatarColor(activeChat.split(":")[1]), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.3)"}}>{activeChat === "global" ? "🌍" : activeChat.split(":")[1].charAt(0).toUpperCase()}</div>
                <div>
                  <h2 style={{fontSize: "1.25rem", fontWeight: "800", margin: 0, letterSpacing: "0.5px"}}>{activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}</h2>
                  <span style={{fontSize: "0.8rem", color: "#10b981", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px"}}><span style={{display: "inline-block", width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", animation: "pulse 1.5s infinite"}}></span> Active Session</span>
                </div>
              </div>
              
              {/* Chat Messages Body */}
              <div className="chat-messages custom-scrollbar" style={{flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column-reverse", gap: "1rem", overflowX: "hidden", width: "100%", boxSizing: "border-box"}}>
                {chatMessages.length === 0 ? (
                  <div style={{textAlign: "center", color: "var(--text-muted)", margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px"}}>
                    <span style={{fontSize: "3rem"}}>👋</span>
                    <div style={{fontWeight: "bold", fontSize: "1.1rem", color: "white"}}>It's quiet here...</div>
                    <div style={{fontSize: "0.9rem"}}>Send a message to break the ice!</div>
                  </div>
                ) : (
                  chatMessages.map(msg => {
                    const isMe = msg.user === sessionUser;
                    const text = activeChat === "global" ? msg.action : msg.action.replace(/^@DM_[^\s]+\s/, "");
                    const { level: mLvl } = getLevelData(msg.xp || 0);
                    return (
                      <div key={msg.id} style={{display: "flex", gap: "8px", marginLeft: isMe ? "auto" : "0", marginRight: isMe ? "0" : "auto", maxWidth: "85%", animation: "slideUp 0.3s ease-out forwards"}}>
                        {!isMe && (
                          <div className="chat-avatar" style={{width: "36px", height: "36px", borderRadius: "12px", background: getAvatarColor(msg.user), flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", cursor: "pointer", border: "2px solid rgba(255,255,255,0.1)", fontWeight: "bold"}} onClick={() => setViewingProfile(msg.user)}>
                             {msg.user.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", minWidth: 0, maxWidth: "100%"}}>
                           {!isMe && activeChat === "global" && (
                              <div style={{display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", cursor: "pointer", maxWidth: "100%"}} onClick={() => setViewingProfile(msg.user)}>
                                 <span style={{fontSize: "0.8rem", color: "white", fontWeight: "700", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{msg.user}</span>
                                 <span style={{fontSize: "0.6rem", background: "rgba(139,92,246,0.2)", color: "var(--accent-physics)", padding: "2px 6px", borderRadius: "6px", fontWeight: "bold", whiteSpace: "nowrap"}}>Lvl {mLvl}</span>
                              </div>
                           )}
                           <div style={{display: "flex", alignItems: "center", gap: "8px", flexDirection: isMe ? "row-reverse" : "row", maxWidth: "100%"}} className="chat-msg-wrapper">
                             <div style={{background: isMe ? "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)" : "rgba(40, 48, 70, 0.95)", padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", border: isMe ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.15)", boxShadow: isMe ? "0 4px 15px rgba(168, 85, 247, 0.25)" : "0 4px 15px rgba(0,0,0,0.2)", backdropFilter: "blur(12px)", color: "white", wordBreak: "break-word"}}>
                               <div style={{fontSize: "0.95rem", lineHeight: 1.4, fontWeight: "500"}}>{text}</div>
                             </div>
                             {isMe && (
                                <button onClick={() => gunDeletePost(msg.id)} className="delete-msg-btn" title="Delete Message" style={{background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "#ef4444", cursor: "pointer", padding: "6px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
                                   <Trash2 size={14}/>
                                </button>
                             )}
                           </div>
                           <div style={{fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "4px", fontWeight: "600"}}><TimeAgo date={msg.createdAt} fallback={msg.time}/></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {/* Chat Input */}
              <div className="chat-composer" style={{padding: "1rem", background: "rgba(0,0,0,0.3)", borderTop: "1px solid rgba(255,255,255,0.05)", width: "100%", maxWidth: "100%", boxSizing: "border-box"}}>
                <form onSubmit={handleSendMessage} style={{display: "flex", gap: "8px", width: "100%"}}>
                  <input type="text" className="input-field" placeholder={`Message ${activeChat === "global" ? "Global Lounge" : activeChat.split(":")[1]}...`} value={chatInput} onChange={e => setChatInput(e.target.value)} style={{flex: 1, padding: "14px 16px", borderRadius: "100px", fontSize: "0.95rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", transition: "all 0.3s", boxShadow: "inset 0 2px 10px rgba(0,0,0,0.1)", outline: "none", minWidth: 0}} onFocus={(e) => e.target.style.boxShadow = "0 0 0 2px var(--accent-physics), inset 0 2px 10px rgba(0,0,0,0.1)"} onBlur={(e) => e.target.style.boxShadow = "inset 0 2px 10px rgba(0,0,0,0.1)"} />
                  <button type="submit" className="btn-primary" style={{borderRadius: "100px", padding: "0 16px", display: "flex", alignItems: "center", gap: "6px", fontWeight: "bold", fontSize: "0.95rem", boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)", transition: "all 0.2s", flexShrink: 0}} disabled={!chatInput.trim()}><Send size={16}/></button>
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

    if (inCall && connectRoom) {
      const jitsiRoom = buildJitsiRoom(connectRoom);
      return (
        <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse 1.5s infinite'}}></div>
            <span style={{color: '#10b981', fontWeight: 'bold'}}>Live — {connectRoom} Room</span>
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
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px'}}>
        <div className="glass" style={{padding: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(236,72,153,0.1) 100%)', borderColor: 'rgba(139,92,246,0.3)'}}>
          <Globe size={56} color="var(--accent-physics)" style={{marginBottom: '1rem', filter: 'drop-shadow(0 0 15px rgba(139,92,246,0.5))'}} />
          <h2 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem'}}>Study Connect</h2>
          <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto'}}>Jump into a live video room with other aspirants preparing for the same exam. Camera + mic enabled — totally free.</p>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
           <h3 style={{fontSize: '1.4rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px'}}><Calendar size={24} color="var(--accent-math)"/> Live Scheduled Events</h3>
           <button className="btn-primary" onClick={() => setShowEventModal(true)} style={{borderRadius: '100px', background: 'linear-gradient(90deg, var(--accent-math), var(--accent-physics))', border: 'none', boxShadow: '0 4px 15px rgba(139,92,246,0.4)'}}>+ Schedule Event</button>
        </div>
        
        {showEventModal && (
          <div className="animate-fade-in" style={{background: 'rgba(0,0,0,0.8)', position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)'}}>
            <div style={{background: '#0f172a', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid #334155', width: '90%', maxWidth: '450px', borderRadius: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'}}>
               <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--accent-math)', filter: 'blur(80px)', opacity: 0.3, zIndex: 0}}></div>
               
               <h4 style={{fontSize: '1.5rem', fontWeight: 800, position: 'relative', zIndex: 1, color: 'white'}}>Schedule a Drop-in</h4>
               <p style={{color: '#94a3b8', fontSize: '0.9rem', position: 'relative', zIndex: 1, marginTop: '-10px'}}>Host a study session and let the community join you.</p>
               
               <div style={{display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1}}>
                 <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0'}}>Event Title</label>
                 <input className="input-field" placeholder="e.g. 2hr HC Verma Grind 🚀" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} style={{background: '#1e293b', fontSize: '1rem', padding: '12px 16px', border: '1px solid #334155'}} />
               </div>
               
               <div style={{display: 'flex', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 1}}>
                 <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 150px'}}>
                   <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0'}}>Time</label>
                   <input className="input-field" placeholder="e.g. Tonight @ 9PM" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} style={{background: '#1e293b', fontSize: '1rem', padding: '12px 16px', border: '1px solid #334155'}} />
                 </div>
                 <div style={{display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 150px'}}>
                   <label style={{fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0'}}>Duration</label>
                   <input className="input-field" placeholder="e.g. 2 hours" value={newEventDuration} onChange={e => setNewEventDuration(e.target.value)} style={{background: '#1e293b', fontSize: '1rem', padding: '12px 16px', border: '1px solid #334155'}} />
                 </div>
               </div>
               
               <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem', position: 'relative', zIndex: 1}}>
                  <button className="btn-secondary" style={{borderRadius: '100px', padding: '10px 24px', background: '#334155', border: 'none', color: 'white'}} onClick={() => setShowEventModal(false)}>Cancel</button>
                  <button className="btn-primary" style={{borderRadius: '100px', padding: '10px 24px', background: 'white', color: 'black', fontWeight: 800}} onClick={() => { 
                    createEvent(newEventTitle, currentUserProfile?.prepType, newEventTime, newEventDuration); 
                    gunPostMessage(`Hey everyone! I just scheduled a live study event: "${newEventTitle}" for ${newEventTime}! Jump into the Study Connect tab to join me! 🚀`);
                    setShowEventModal(false); 
                    setNewEventTitle(''); 
                    setNewEventTime(''); 
                    setNewEventDuration('');
                    awardXP(15, 'Scheduled a Community Event');
                    setActiveTab('community'); // Redirect to community to see the autopost
                  }}>🚀 Publish</button>
               </div>
            </div>
          </div>
        )}

        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem'}}>
          {isEventsLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="glass" style={{padding: '1.5rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 1 - i * 0.2}}>
                <div style={{width: '60%', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', animation: 'pulse 1.5s infinite'}}></div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', animation: 'pulse 1.5s infinite'}}></div>
                  <div style={{width: '40%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite'}}></div>
                </div>
                <div style={{width: '80%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', animation: 'pulse 1.5s infinite'}}></div>
                <div style={{width: '100px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px', alignSelf: 'flex-end', animation: 'pulse 1.5s infinite'}}></div>
              </div>
            ))
          ) : studyEvents.length === 0 ? <p style={{color: 'var(--text-muted)'}}>No upcoming events. Be the first to schedule one!</p> : studyEvents.map(e => (
            <div key={e.id} className="glass" style={{padding: '1.5rem', borderRadius: '20px', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s'}} onMouseEnter={ev => ev.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={ev => ev.currentTarget.style.transform = 'none'}>
               <div style={{position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--accent-math), var(--accent-physics))'}}></div>
               <h4 style={{fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', lineHeight: 1.3}}>{e.title}</h4>
               
               <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.2rem'}}>
                 <div style={{width: '24px', height: '24px', borderRadius: '50%', background: getAvatarColor(e.host || 'Guest'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 'bold'}}>{(e.host || 'G').charAt(0).toUpperCase()}</div>
                 <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>{e.host || 'Guest'}</p>
               </div>
               
               <div style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '8px'}}>
                   <Clock size={14} color="var(--accent-math)" />
                   <p style={{fontSize: '0.85rem', color: 'var(--accent-math)', fontWeight: 700}}>{e.scheduledTime}</p>
                 </div>
                 {e.duration && (
                   <div style={{display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '6px 12px', borderRadius: '8px'}}>
                     <span style={{fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600}}>⏳ {e.duration}</span>
                   </div>
                 )}
               </div>
               
               <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem'}}>
                 <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                   <Users size={16} color="var(--text-muted)" />
                   <span style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600}}>{e.participants?.length || 1} joined</span>
                 </div>
                 <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                   <button onClick={() => deleteEvent(e.id)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '50%', transition: 'all 0.2s'}} onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'} title="Delete Event"><Trash2 size={16} /></button>
                   <button onClick={() => shareToWhatsApp(e.id, e.title)} style={{background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '50%', transition: 'all 0.2s'}} onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(16,185,129,0.1)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'} title="Share on WhatsApp"><Send size={16} /></button>
                   <button className="btn-primary" onClick={() => { joinEvent(e.id); setConnectRoom(e.id); setInCall(true); awardXP(10, 'Joined a Scheduled Event'); }} style={{padding: '8px 16px', fontSize: '0.85rem', borderRadius: '100px', fontWeight: 700, background: 'rgba(255,255,255,0.1)', color: 'white'}}>Join</button>
                 </div>
               </div>
            </div>
          ))}
        </div>

        <h3 style={{fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)'}}>Join an Exam Study Room</h3>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem'}}>
          {examRooms.map(room => (
            <div key={room.id} className="glass subject-card" style={{textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderColor: room.id === currentUserProfile?.prepType ? room.color : '', transition: 'all 0.25s ease'}} onClick={() => { setConnectRoom(room.id); setInCall(true); awardXP(10, 'Joined Study Connect Room'); }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${room.color}33`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{color: room.color, background: `${room.color}22`, border: `1px solid ${room.color}44`, borderRadius: '16px', padding: '16px'}}>{room.icon}</div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>{room.label}</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{room.desc}</p>
              {room.id === currentUserProfile?.prepType && <span style={{background: `${room.color}33`, color: room.color, border: `1px solid ${room.color}55`, padding: '2px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600}}>Your Exam ⭐</span>}
              <button className="btn-primary" style={{width: '100%', background: `${room.color}22`, borderColor: `${room.color}55`, color: room.color}}><PhoneCall size={16}/> Join Room</button>
            </div>
          ))}
        </div>
        <div className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem'}}><Wifi size={20} color="var(--accent-success)"/> Private Study Room</h3>
          <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Create a private room with a custom name and share it with a friend to study 1-on-1.</p>
          <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
            <input type="text" className="input-field" placeholder="Enter a custom room name (e.g. JEECrack-Batch2025)" value={customRoomName} onChange={e => setCustomRoomName(e.target.value)} style={{flex: '1 1 200px'}} />
            <button className="btn-primary" onClick={() => { if (customRoomName.trim()) { shareToWhatsApp(customRoomName.trim()); } }} style={{flex: '0 0 auto', whiteSpace: 'nowrap', background: '#10b981', color: 'white'}} disabled={!customRoomName.trim()}><Send size={16}/> Share Invite</button>
            <button className="btn-primary" onClick={() => { if (customRoomName.trim()) { setConnectRoom(customRoomName.trim()); setInCall(true); awardXP(10, 'Joined Private Study Room'); } }} style={{flex: '0 0 auto', whiteSpace: 'nowrap'}}><PhoneCall size={16}/> Start Private Call</button>
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
                <div id="youtube-player" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}></div>
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
    let totalTasksCompleted = 0;
    subjects.forEach(s => s.tasks.forEach(t => t.subtasks.forEach(st => { if(st.completed) totalTasksCompleted++; })));
    const totalNotes = Object.keys(videoNotes).filter(k => videoNotes[k]?.notes || videoNotes[k]?.mistakes).length;
    const totalJournals = journalHistory[journalHistory.length-1]?.date === 'Welcome' ? journalHistory.length - 1 : journalHistory.length;
    const userPosts = feed.filter(f => f.user === sessionUser);
    
    const xpForNextLevel = level * 100;
    const progressPercent = ((currentXP % 100) / 100) * 100;

    return (
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '900px'}}>
        
        {/* Profile Header Card */}
        <div className="glass" style={{padding: 'clamp(1.5rem, 4vw, 3rem)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2rem', background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(16,185,129,0.05))', position: 'relative', overflow: 'hidden'}}>
          <div style={{position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'var(--accent-physics)', opacity: '0.1', borderRadius: '50%', filter: 'blur(40px)'}}></div>
          
          <div style={{width: 'clamp(80px, 15vw, 120px)', height: 'clamp(80px, 15vw, 120px)', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 'bold', border: '4px solid rgba(255,255,255,0.1)', flexShrink: 0, boxShadow: '0 0 30px rgba(139,92,246,0.3)'}}>
            {sessionUser.charAt(0).toUpperCase()}
          </div>
          
          <div style={{flex: '1 1 300px'}}>
            <h1 className="greeting" style={{fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', margin: '0 0 4px', wordBreak: 'break-word'}}>{isGuest ? 'Guest Aspirant' : sessionUser}</h1>
            <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem'}}>
              {currentUserProfile?.prepType} Aspirant · Target {currentUserProfile?.targetYear}
            </p>
            
            <div style={{background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                <span style={{fontWeight: 'bold', color: 'var(--accent-success)'}}>Level {level}: {title}</span>
                <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{currentXP} / {xpForNextLevel} XP</span>
              </div>
              <div className="progress-bar-bg" style={{height: '10px', background: 'rgba(255,255,255,0.05)'}}>
                <div className="progress-bar-fill" style={{width: `${progressPercent}%`, background: 'var(--accent-success)'}}></div>
              </div>
            </div>
            
            {isGuest && (
              <div style={{marginTop: '1rem'}}>
                <span className="tag" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)'}}>Unsaved Account</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem'}}>
          <div className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px'}}>
            <div style={{padding: '12px', background: 'rgba(16,185,129,0.1)', borderRadius: '50%', color: 'var(--accent-success)'}}><Check size={24}/></div>
            <div style={{fontSize: '1.75rem', fontWeight: 800}}>{totalTasksCompleted}</div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Tasks Completed</div>
          </div>
          <div className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px'}}>
            <div style={{padding: '12px', background: 'rgba(139,92,246,0.1)', borderRadius: '50%', color: 'var(--accent-physics)'}}><Video size={24}/></div>
            <div style={{fontSize: '1.75rem', fontWeight: 800}}>{playlist.length}</div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Lectures Saved</div>
          </div>
          <div className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px'}}>
            <div style={{padding: '12px', background: 'rgba(236,72,153,0.1)', borderRadius: '50%', color: 'var(--accent-chem)'}}><FileText size={24}/></div>
            <div style={{fontSize: '1.75rem', fontWeight: 800}}>{totalNotes}</div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Lecture Notes</div>
          </div>
          <div className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px'}}>
            <div style={{padding: '12px', background: 'rgba(245,158,11,0.1)', borderRadius: '50%', color: '#f59e0b'}}><BookOpen size={24}/></div>
            <div style={{fontSize: '1.75rem', fontWeight: 800}}>{totalJournals}</div>
            <div style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Journal Entries</div>
          </div>
        </div>

        {/* Info & Activity Row */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem'}}>
          
          <div className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '0.5rem'}}><Target size={20} color="var(--accent-math)"/> Identified Weakness</h2>
            <div style={{background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', flex: 1}}>
              <p style={{fontSize: '1.05rem', lineHeight: '1.6', color: 'var(--text-muted)', fontStyle: currentUserProfile?.weakness ? 'normal' : 'italic'}}>
                {currentUserProfile?.weakness || "You haven't specified a weakness."}
              </p>
            </div>
          </div>

          <div className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <h2 style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.2rem', marginBottom: '0.5rem'}}><Flame size={20} color="#ef4444"/> Recent Community Activity</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1}}>
              {userPosts.length === 0 ? (
                <p style={{color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', textAlign: 'center'}}>No posts yet. Go to Community to share an update!</p>
              ) : (
                userPosts.slice(0, 3).map(post => (
                  <div key={post.id} style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>{post.time}</div>
                    <div style={{fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.4}}>"{post.action.length > 80 ? post.action.slice(0,80) + '...' : post.action}"</div>
                    <div style={{marginTop: '8px', fontSize: '0.8rem', color: 'var(--accent-physics)'}}>❤️ {post.likes||0} Likes · 💬 {(post.comments||[]).length} Comments</div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
        
        {/* Actions Row */}
        <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
          {isGuest ? (
            <button onClick={() => { setAuthWallMsg('Create a permanent account to save your XP and profile data.'); setShowAuthWall(true); }} className="btn-primary" style={{padding: '14px 24px'}}>
              <User size={18} /> Create Permanent Account
            </button>
          ) : (
            <button onClick={handleLogout} className="btn-primary" style={{background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '14px 24px'}}>
              <LogOut size={18} /> Logout
            </button>
          )}
        </div>

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
                <input type="text" placeholder="Choose a Username" value={authUsername} onChange={e => setAuthUsername(e.target.value)} className="input-field with-icon" />
              </div>
              <div className="input-group">
                <Lock size={18} className="input-icon" />
                <input type="password" placeholder="Create a Password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} className="input-field with-icon" />
              </div>
              {authError && <p className="auth-error">{authError}</p>}
              <button type="submit" className="btn-primary" style={{width: '100%', padding: '14px', marginTop: '10px'}}>
                Create Account & Save Progress
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <nav className="app-sidebar">
        <div className="brand"><Headphones size={24} color="var(--accent-physics)" /> FocusMode</div>
        {isFullyOnboarded && (
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
          <div className={`nav-item ${activeTab === 'community' ? 'active' : ''}`} onClick={() => handleTabChange('community')}><Users size={18} /> Community</div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => handleTabChange('profile')}><User size={18} /> My Profile</div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header">
          <div className="mobile-brand"><Headphones size={20} color="var(--accent-physics)" /> FocusMode</div>
          {isFullyOnboarded && <div className="mobile-xp-badge">⚡ {currentXP} XP</div>}
        </div>

        <header className="page-header" style={{paddingTop: '1rem'}}>
          <h1 className="greeting">
            {activeTab === 'dashboard' && `Mission ${currentUserProfile.prepType}`}
            {activeTab === 'planner' && 'Study Planner'}
            {activeTab === 'journal' && 'Learning Journal'}
            {activeTab === 'lectures' && 'Ad-Free Lectures'}
            {activeTab === 'connect' && 'Study Connect'}
            {activeTab === 'community' && 'Community'}
            {activeTab === 'profile' && 'My Profile'}
          </h1>
          <p className="subtitle">
            {activeTab === 'dashboard' && "Crush your tasks for today."}
            {activeTab === 'planner' && "Plan your weekly study schedule."}
            {activeTab === 'journal' && "Log your learnings and mistakes."}
            {activeTab === 'lectures' && "Watch lectures ad-free."}
            {activeTab === 'connect' && "Video rooms with fellow aspirants."}
            {activeTab === 'community' && "Compete, share, and grow."}
            {activeTab === 'profile' && "Your stats and progress."}
          </p>
        </header>
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
            boxShadow: '0 15px 35px rgba(168,85,247,0.6), inset 0 2px 5px rgba(255,255,255,0.5)', 
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
          <Users size={20} /><span>Community</span>
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

