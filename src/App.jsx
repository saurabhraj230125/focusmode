import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, ChevronDown, BookOpen, FlaskConical, Calculator, 
  Play, Pause, RotateCcw, BrainCircuit, Target, Plus, Clock,
  LayoutDashboard, BookHeart, Users, Trophy, Flame, 
  Stethoscope, Landmark, User, LogOut, Lock, Calendar, ArrowRight,
  Headphones, Send, Zap, MonitorPlay, Trash2, Video,
  Wifi, VideoOff, PhoneCall, Globe, X, Download, FileText, Save, Bot, Sparkles, Move, Columns, Rows, HelpCircle
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
import { useCommunity } from './useCommunity.js';
import { useEvents } from './useEvents.js';

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

const mockLeaderboard = [
  { rank: 1, name: 'Vikram Singh', score: 1450 },
  { rank: 2, name: 'Sneha_24', score: 1320 },
  { rank: 3, name: 'AmanRaj_07', score: 980 },
];

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
  } = useCommunity(sessionUser, currentXP, currentUserProfile?.prepType);

  // ── Scheduled Events (Firebase) ──────────────────────────────────────────
  const { events: studyEvents, isLoading: isEventsLoading, createEvent, joinEvent, deleteEvent } = useEvents(sessionUser);
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
  const [lectureViewMode, setLectureViewMode] = useState('horizontal');

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

  // AI Assistant State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState([
    { role: 'ai', text: "Hey! I am your AI Advisor. Struggling with a topic, feeling stressed, or need a study strategy? Let's talk!" }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const aiEndRef = useRef(null);

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
      return `**Memory & Retention Science** 🧠\n\nYour brain forgets 80% of new information within 24 hours (Ebbinghaus Forgetting Curve) — unless you actively fight it.\n\n**The 3 Most Powerful Techniques:**\n\n**1. Active Recall:** Don't re-read. Close the book and write/say everything you remember. Then check what you missed.\n\n**2. Spaced Repetition:** Review material at increasing intervals:\n• 1 day after learning → 3 days → 7 days → 21 days → 2 months\n• Use Anki app (free) for flashcards that auto-schedule this\n\n**3. The Feynman Technique:** Explain the concept in simple language as if teaching a child. Where you stumble = your gap.\n\n**Notes Strategy:** Don't copy textbook notes. Write in your own words. Use mind maps for interconnected topics.\n\n**For FocusModePlayer:** Use the Journal tab to write what you learned today — this forces active recall! 📓`;
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
    
    if (t.match(/how to use|what is this website|what is focusmodeplayer|guide|tutorial|how does this work|features/)) {
      return `**Welcome to FocusModePlayer!** 🚀\n\nI am designed to be your ultimate study ecosystem. Here is how to use me for maximum productivity:\n\n**1. Dashboard (The Core):** Break your giant syllabus into Subjects → Modules → Subtasks. Check them off to earn XP.\n**2. Pomodoro Timer:** Use the 25-minute timer for intense focus sessions. Earning 50 XP per session builds a habit loop.\n**3. Community (Live):** Click the globe icon! It's a real-time feed of all aspirants worldwide. Share wins and tips.\n**4. Live Study Connect:** Join a virtual room to study silently with others (body doubling). It kills procrastination.\n**5. Journal & Mistakes:** At the end of the day, log what you learned and the mistakes you made. Active recall!\n**6. Lectures:** Paste any YouTube video URL. It blocks comments/recommendations and lets you take timestamped notes.\n\nStart by adding your first task on the Dashboard!`;
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
    if (savedUsersStr) setUsersDb(db);

    const activeSession = localStorage.getItem('planmaker_session');
    const explicitLogout = localStorage.getItem('planmaker_explicit_logout');

    if (activeSession && db[activeSession]) {
      setSessionUser(activeSession);
      loadUserData(activeSession);
      
      // If they are a guest returning, maybe prompt them to save (optional)
      let visits = parseInt(localStorage.getItem('planmaker_visits') || '0');
      visits++;
      localStorage.setItem('planmaker_visits', visits.toString());

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
    setToastMsg({ amount, reason });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const calculateProgress = () => {
    let total = 0; let completed = 0;
    subjects.forEach(s => s.tasks.forEach(t => t.subtasks.forEach(sub => {
      total++; if (sub.completed) completed++;
    })));
    setProgress(total === 0 ? 0 : Math.round((completed / total) * 100));
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
        setToastMsg({ amount: 50, reason: 'Account Created Successfully!' });
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

    if (taskCompletedJustNow) { trackSubtaskCompleted(subjectId); awardXP(5, 'Completed Subtask'); }
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

    const roomName = `FocusModePlayer-${connectRoom}-Study`.replace(/[^a-zA-Z0-9-]/g, '');

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
    let content = `FocusModePlayer — Lecture Notes\n${'='.repeat(40)}\nVideo: ${video.title}\nDate: ${dateStr}\n${'='.repeat(40)}\n\n`;
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
          <h1 className="greeting" style={{fontSize: '2rem'}}>FocusModePlayer</h1>
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

  const handlePostFeed = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    trackPostCreated();
    gunPostMessage(newPostText);
    setNewPostText('');
    awardXP(2, 'Community Post');
  };

  const toggleLike = (postId) => {
    trackPostLiked();
    gunToggleLike(postId);
  };

  const submitComment = (postId) => {
    if (!commentText.trim()) return;
    trackCommentPosted();
    gunAddComment(postId, commentText);
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

  // Generate dynamic leaderboard with current user
  const combinedLeaderboard = [...mockLeaderboard];
  const myRank = combinedLeaderboard.filter(lb => lb.score > currentXP).length + 1;
  combinedLeaderboard.push({ rank: myRank, name: sessionUser + " (You)", score: currentXP });
  combinedLeaderboard.sort((a,b) => b.score - a.score);
  combinedLeaderboard.forEach((lb, i) => lb.rank = i + 1);

  const renderDashboard = () => (
    <div className="dashboard-grid animate-fade-in">
      <div className="left-col">
        <section className="glass progress-section">
          <div className="progress-header">
            <h2 className="progress-title">Today's Progress</h2>
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
            return (
              <div key={subject.id} className="glass subject-card">
                <div className="subject-header" onClick={() => setExpandedSubjects(prev => prev.includes(subject.id) ? prev.filter(x => x !== subject.id) : [...prev, subject.id])}>
                  <div className="subject-info">
                    <div className="subject-icon" style={{background: 'rgba(255,255,255,0.1)'}}>
                      {getSubjectIcon(subject.icon)}
                    </div>
                    <div>
                      <h3 className="subject-title">{subject.title}</h3>
                      <p className="subject-stats">{comp}/{total} Tasks Completed</p>
                    </div>
                  </div>
                  <button className={`toggle-btn ${isExpanded ? 'expanded' : ''}`}><ChevronDown size={20} /></button>
                </div>
                {isExpanded && (
                  <div className="tasks-list">
                    {subject.tasks.length === 0 && <p className="text-muted" style={{color: '#94a3b8', fontSize: '0.9rem'}}>No tasks added yet.</p>}
                    {subject.tasks.map(task => (
                      <div key={task.id} className="task-item">
                        <div style={{fontWeight: 500, marginBottom: '8px'}}>{task.title}</div>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '24px'}}>
                          {task.subtasks.map(subtask => (
                            <label key={subtask.id} className="checkbox-wrapper">
                              <input type="checkbox" checked={subtask.completed} onChange={() => toggleSubtask(subject.id, task.id, subtask.id)} />
                              <div className="checkmark"><Check /></div>
                              <span className="checkbox-text" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                {subtask.title}
                                {!subtask.completed && <span style={{fontSize: '0.75rem', color: 'var(--accent-physics)'}}>+5 XP</span>}
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
        <div className="glass" style={{padding: '1.5rem'}}>
          <h3 style={{fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Daily Motivation</h3>
          <p style={{fontStyle: 'italic', fontSize: '0.95rem'}}>"Discipline is choosing between what you want now, and what you want most."</p>
        </div>
      </aside>
    </div>
  );

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

  const renderCommunity = () => {
    const trendingTags = ['#JEE2025','#NEET2025','#UPSC2025','#StudyTips','#OrganicChem','#Physics','#Discipline','#MockTest'];
    const tagCounts = [312, 284, 201, 178, 143, 129, 98, 87];
    const getProfileData = (username) => {
      if (usersDb[username]) return usersDb[username].profile;
      const post = feed.find(f => f.user === username);
      return { prepType: post?.prep || 'JEE', xp: post?.xp || 0 };
    };

    const renderPostCard = (item) => {
      const hasLiked = item.likedBy?.includes(sessionUser);
      const { level: pLvl, title: pTitle } = getLevelData(item.xp || 0);
      return (
        <div key={item.id} className="tweet-card">
          <div style={{display:'flex', gap:'12px', alignItems:'flex-start'}}>
            <div className="tweet-avatar" style={{background: getAvatarColor(item.user), cursor:'pointer', flexShrink:0}} onClick={() => setViewingProfile(item.user)}>
              {item.user.charAt(0).toUpperCase()}
            </div>
            <div style={{flex:1, minWidth:0}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'2px'}}>
                <span className="tweet-username" onClick={() => setViewingProfile(item.user)}>{item.user}</span>
                {item.prep && <span style={{fontSize:'0.7rem', padding:'1px 8px', borderRadius:'100px', background:'rgba(139,92,246,0.15)', color:'var(--accent-physics)', border:'1px solid rgba(139,92,246,0.25)', fontWeight:700}}>{item.prep}</span>}
                <span style={{fontSize:'0.75rem', color:'var(--text-muted)'}}>{item.time}</span>
              </div>
              {item.xp > 0 && <p style={{fontSize:'0.72rem', color:'var(--accent-success)', marginBottom:'8px'}}>⚡ Lvl {pLvl} · {pTitle}</p>}
              <p className="tweet-body">
                {(item.action||'').split(/(#\w+)/).map((part, i) =>
                  part.startsWith('#')
                    ? <span key={i} style={{color:'var(--accent-physics)', cursor:'pointer', fontWeight:600}} onClick={() => setNewPostText(part)}>{part}</span>
                    : part
                )}
              </p>
              <div className="tweet-actions">
                <button className={`tweet-action-btn${hasLiked?' liked':''}`} onClick={() => toggleLike(item.id)}>
                  <span>{hasLiked ? '❤️' : '🤍'}</span><span>{item.likes||0}</span>
                </button>
                <button className="tweet-action-btn" onClick={() => setCommentingOn(commentingOn===item.id ? null : item.id)}>
                  <span>💬</span><span>{(item.comments||[]).length}</span>
                </button>
                <button className="tweet-action-btn" onClick={() => { navigator.clipboard?.writeText(item.action); setToastMsg({amount:0, reason:'📋 Copied!'}); setTimeout(()=>setToastMsg(null),2000); }}>
                  <span>🔁</span><span>Share</span>
                </button>
              </div>
              {(item.comments||[]).length > 0 && (
                <div style={{borderTop:'1px solid var(--card-border)', paddingTop:'10px', display:'flex', flexDirection:'column', gap:'8px', marginTop:'8px'}}>
                  {item.comments.map((c,i) => (
                    <div key={i} style={{display:'flex', gap:'8px'}}>
                      <div style={{width:'26px', height:'26px', minWidth:'26px', borderRadius:'50%', background:getAvatarColor(c.user), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:'bold'}}>{c.user.charAt(0).toUpperCase()}</div>
                      <div style={{background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'6px 10px', flex:1}}>
                        <span style={{fontWeight:700, fontSize:'0.82rem', color:'var(--accent-physics)'}}>{c.user}</span>
                        <span style={{fontSize:'0.72rem', color:'var(--text-muted)', marginLeft:'6px'}}>{c.time}</span>
                        <p style={{fontSize:'0.88rem', marginTop:'2px'}}>{c.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {commentingOn === item.id && (
                <div style={{display:'flex', gap:'8px', marginTop:'10px'}}>
                  <input autoFocus className="input-field" placeholder="Write a reply..." value={commentText} onChange={e => setCommentText(e.target.value)} onKeyDown={e => e.key==='Enter' && submitComment(item.id)} style={{flex:1, padding:'8px 14px', fontSize:'0.88rem'}} />
                  <button className="btn-primary" style={{padding:'8px 14px'}} onClick={() => submitComment(item.id)}><Send size={14}/></button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="community-twitter-layout animate-fade-in">
        {/* Profile Modal */}
        {viewingProfile && (() => {
          const prof = getProfileData(viewingProfile);
          const { level: pL, title: pT } = getLevelData(prof?.xp || 0);
          const userPosts = feed.filter(f => f.user === viewingProfile);
          const totalLikes = userPosts.reduce((s,p) => s+(p.likes||0), 0);
          return (
            <div style={{position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)', padding:'1rem'}} onClick={() => setViewingProfile(null)}>
              <div className="glass" style={{maxWidth:'400px', width:'100%', padding:'clamp(1.25rem, 5vw, 2rem)', borderRadius:'24px', position:'relative', maxHeight: '90vh', overflowY: 'auto'}} onClick={e => e.stopPropagation()}>
                <button onClick={() => setViewingProfile(null)} style={{position:'absolute', top:'16px', right:'16px', background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', zIndex: 10}}><X size={20}/></button>
                <div style={{height:'80px', borderRadius:'14px 14px 0 0', marginBottom:'-30px', background:`linear-gradient(135deg, ${getAvatarColor(viewingProfile)}, #1a1c29)`, marginLeft:'-2rem', marginRight:'-2rem', marginTop:'-2rem'}}></div>
                <div style={{width:'68px', height:'68px', borderRadius:'50%', background:getAvatarColor(viewingProfile), display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', fontWeight:'bold', border:'3px solid #0f1015', position:'relative', zIndex:1}}>{viewingProfile.charAt(0).toUpperCase()}</div>
                <h2 style={{fontSize:'1.25rem', fontWeight:800, marginTop:'8px', wordBreak: 'break-word'}}>{viewingProfile}</h2>
                <p style={{color:'var(--accent-success)', fontSize:'0.88rem', fontWeight:600, marginBottom:'12px'}}>⚡ Lvl {pL} · {pT}</p>
                <div style={{display:'flex', gap:'0.75rem', flexWrap:'wrap', marginBottom:'1.25rem'}}>
                  {prof?.prepType && <span style={{background:'rgba(139,92,246,0.15)', color:'var(--accent-physics)', border:'1px solid rgba(139,92,246,0.3)', padding:'3px 12px', borderRadius:'100px', fontSize:'0.8rem', fontWeight:600}}>{prof.prepType}</span>}
                  {prof?.targetYear && <span style={{background:'rgba(255,255,255,0.05)', color:'var(--text-muted)', padding:'3px 12px', borderRadius:'100px', fontSize:'0.8rem'}}>Target {prof.targetYear}</span>}
                </div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(70px, 1fr))', gap:'1rem', textAlign:'center', padding:'1rem', background:'rgba(255,255,255,0.03)', borderRadius:'14px', marginBottom:'1rem'}}>
                  <div><div style={{fontWeight:800, fontSize:'1.2rem', color:'var(--accent-success)'}}>{prof?.xp||0}</div><div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>XP</div></div>
                  <div><div style={{fontWeight:800, fontSize:'1.2rem'}}>{userPosts.length}</div><div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>Posts</div></div>
                  <div><div style={{fontWeight:800, fontSize:'1.2rem', color:'#f87171'}}>{totalLikes}</div><div style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>Likes</div></div>
                </div>

                {userPosts.slice(0,2).map(p => (
                  <p key={p.id} style={{fontSize:'0.85rem', color:'#cbd5e1', padding:'8px 12px', background:'rgba(255,255,255,0.03)', borderRadius:'10px', marginBottom:'6px', lineHeight:1.4}}>"{p.action.slice(0,100)}{p.action.length>100?'...':''}"</p>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Feed Column */}
        <div className="community-feed-col">
          {/* Live badge */}
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'0.75rem', padding:'0 4px'}}>
            <span style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'0.8rem', color:'#10b981', fontWeight:700}}>
              <span style={{width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', boxShadow:'0 0 8px #10b981', animation:'pulse 1.5s infinite', display:'inline-block'}}></span>
              LIVE · Real-time
            </span>
            <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>— {feed.length} posts from all users worldwide</span>
          </div>

          <div className="tweet-compose glass">
            <div style={{display:'flex', gap:'12px'}}>
              <div className="tweet-avatar" style={{background:getAvatarColor(sessionUser), flexShrink:0}}>{sessionUser.charAt(0).toUpperCase()}</div>
              <form onSubmit={handlePostFeed} style={{flex:1, display:'flex', flexDirection:'column', gap:'10px'}}>
                <textarea className="tweet-compose-input" placeholder="What's on your study grind? Share tips, wins, questions... #JEE2025" value={newPostText} onChange={e=>setNewPostText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey))handlePostFeed(e);}} rows={3} maxLength={280} />
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{fontSize:'0.8rem', color:newPostText.length>240?'#ef4444':'var(--text-muted)'}}>{newPostText.length}/280</span>
                  <button type="submit" className="btn-primary" style={{padding:'8px 18px'}} disabled={!newPostText.trim()}><Send size={14}/> Post (+2 XP)</button>
                </div>
              </form>
            </div>
          </div>

          {isCommunityLoading ? (
            <div style={{display:'flex', flexDirection:'column', gap:'1.5rem', padding:'1rem 0'}}>
              {[1, 2, 3].map(i => (
                <div key={i} className="glass" style={{padding:'1.5rem', borderRadius:'20px', display:'flex', gap:'1rem', opacity: 1 - i * 0.2}}>
                  <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', flexShrink:0, animation:'pulse 1.5s infinite'}}></div>
                  <div style={{flex:1, display:'flex', flexDirection:'column', gap:'10px'}}>
                    <div style={{width:'150px', height:'16px', background:'rgba(255,255,255,0.1)', borderRadius:'8px', animation:'pulse 1.5s infinite'}}></div>
                    <div style={{width:'80%', height:'14px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', animation:'pulse 1.5s infinite'}}></div>
                    <div style={{width:'60%', height:'14px', background:'rgba(255,255,255,0.05)', borderRadius:'8px', animation:'pulse 1.5s infinite'}}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : feed.length === 0 ? (
            <div style={{textAlign:'center', padding:'3rem 1rem', color:'var(--text-muted)'}}>
              <span style={{fontSize:'2rem'}}>🌍</span>
              <p style={{marginTop:'0.75rem', fontWeight:600}}>No posts yet — be the first!</p>
              <p style={{fontSize:'0.85rem', marginTop:'0.25rem'}}>Your post will be visible to every user on the site in real-time.</p>
            </div>
          ) : (
            <div style={{display:'flex', flexDirection:'column'}}>{feed.map(item => renderPostCard(item))}</div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="community-sidebar-col">
          <div className="glass" style={{padding:'1.5rem', borderRadius:'20px'}}>
            <h3 style={{fontSize:'1rem', fontWeight:800, marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'8px'}}><Flame size={16} color="var(--accent-chem)"/> Trending Topics</h3>
            {trendingTags.map((tag, i) => (
              <div key={tag} style={{padding:'10px 0', borderBottom: i<trendingTags.length-1?'1px solid var(--card-border)':'none', cursor:'pointer'}} onClick={()=>setNewPostText(p=>p+(p?' ':'')+tag)}>
                <p style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>Aspirant Community · Trending</p>
                <p style={{fontWeight:700, color:'var(--accent-physics)', fontSize:'0.9rem'}}>{tag}</p>
                <p style={{fontSize:'0.72rem', color:'var(--text-muted)'}}>{tagCounts[i]} posts</p>
              </div>
            ))}
          </div>
          <div className="glass leaderboard-card" style={{borderRadius:'20px'}}>
            <h3 style={{fontSize:'1rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:'8px', marginBottom:'1rem'}}><Trophy size={16} color="#fbbf24"/> Top Scorers</h3>
            {combinedLeaderboard.slice(0,5).map(lb => (
              <div key={lb.name} className="leaderboard-item" style={{cursor:'pointer'}} onClick={()=>setViewingProfile(lb.name.replace(' (You)',''))}>
                <span className={`rank rank-${lb.rank}`}>#{lb.rank}</span>
                <span className="leaderboard-name" style={{color:lb.name.includes('(You)')?'white':'inherit'}}>{lb.name}</span>
                <span className="leaderboard-score">{lb.score} XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStudyConnect = () => {
    const examRooms = [
      { id: 'JEE', label: 'JEE Aspirants', color: 'var(--accent-physics)', desc: 'Physics · Chemistry · Maths', icon: <Calculator size={28}/> },
      { id: 'NEET', label: 'NEET Aspirants', color: 'var(--accent-chem)', desc: 'Physics · Chemistry · Biology', icon: <Stethoscope size={28}/> },
      { id: 'UPSC', label: 'UPSC Aspirants', color: 'var(--accent-math)', desc: 'History · Polity · Geography', icon: <Landmark size={28}/> },
      { id: 'SAT', label: 'SAT / ACT', color: '#3b82f6', desc: 'Global College Admissions', icon: <BookOpen size={28}/> },
      { id: 'MCAT', label: 'MCAT Prep', color: '#10b981', desc: 'Medical College Admissions', icon: <Stethoscope size={28}/> },
      { id: 'GRE', label: 'GRE / GMAT', color: '#f59e0b', desc: 'Grad School Admissions', icon: <BrainCircuit size={28}/> },
      { id: 'IB', label: 'IB / AP', color: '#ec4899', desc: 'Global High School Curriculum', icon: <Globe size={28}/> },
    ];
    const buildJitsiRoom = (roomId) => `FocusModePlayer-${roomId}-Study-${sessionUser.replace(/[^a-zA-Z0-9]/g, '')}`;

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
                   {e.host === sessionUser && (
                     <button onClick={() => deleteEvent(e.id)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', padding: '6px', borderRadius: '50%', transition: 'all 0.2s'}} onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'} title="Delete Event"><Trash2 size={16} /></button>
                   )}
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
            <button className="btn-primary" onClick={() => { if (customRoomName.trim()) { setConnectRoom(customRoomName.trim()); setInCall(true); awardXP(10, 'Joined Private Study Room'); } }} style={{flex: '0 0 auto', whiteSpace: 'nowrap'}}><PhoneCall size={16}/> Start Private Call</button>
          </div>
        </div>


      </div>
    );
  };

  const renderLectures = () => {
    const activeVideoObj = playlist.find(v => v.id === activeVideo);
    const activeData = videoNotes[activeVideo] || { notes: '', mistakes: '' };
    
    const isHorizontal = lectureViewMode === 'horizontal';

    return (
      <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
        {activeVideo ? (
          <div style={{display: 'grid', gap: '1.5rem', alignItems: 'start', gridTemplateColumns: `repeat(auto-fit, minmax(${isHorizontal ? '400px' : '100%'}, 1fr))`}}>
            <div className="glass" style={{padding: '1rem', background: '#000', borderRadius: '20px', overflow: 'hidden'}}>
              <div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
                <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px'}}></iframe>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', padding: '10px 10px 0', color: '#fff', flexWrap: 'wrap', gap: '10px'}}>
                <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{activeVideoObj?.title}</span>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button onClick={() => setLectureViewMode('horizontal')} style={{background: isHorizontal ? 'var(--accent-physics)' : 'rgba(255,255,255,0.1)', border: 'none', padding: '6px', borderRadius: '8px', color: 'white', cursor: 'pointer'}} title="Side-by-side view"><Columns size={16}/></button>
                  <button onClick={() => setLectureViewMode('vertical')} style={{background: !isHorizontal ? 'var(--accent-physics)' : 'rgba(255,255,255,0.1)', border: 'none', padding: '6px', borderRadius: '8px', color: 'white', cursor: 'pointer'}} title="Stacked view"><Rows size={16}/></button>
                </div>
              </div>
            </div>
            
            <div className="glass" style={{padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', maxHeight: isHorizontal ? '600px' : 'auto'}}>
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
          <div className="glass" style={{padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)'}}>
            <MonitorPlay size={64} style={{opacity: 0.5}} />
            <p>Select a video from your playlist or add a new one to start watching ad-free.</p>
          </div>
        )}
        
        <form className="glass" style={{padding: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center'}} onSubmit={handleAddVideo}>
          <div className="input-group" style={{flex: '1 1 250px'}}>
            <Video size={18} className="input-icon" />
            <input type="text" className="input-field with-icon" placeholder="Paste YouTube Link (Normal or Live)..." value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} style={{width: '100%'}} />
          </div>
          <input type="text" className="input-field" placeholder="Video Title (e.g. Thermodynamics Part 1)" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} style={{flex: '1 1 200px'}} />
          <button type="submit" className="btn-primary" style={{flex: '0 0 auto', whiteSpace: 'nowrap'}}><Plus size={18} /> Add to Playlist (+5 XP)</button>
        </form>
        
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem'}}>
          {playlist.map(video => (
            <div key={video.id} className="glass subject-card" style={{display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', border: activeVideo === video.id ? '2px solid var(--accent-physics)' : ''}} onClick={() => { setActiveVideo(video.id); awardXP(10, 'Started a Lecture'); }}>
              <div style={{position: 'relative', paddingBottom: '56.25%', borderRadius: '10px', overflow: 'hidden', background: '#111'}}>
                <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt="thumbnail" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8}} />
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <div style={{background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '50%', color: 'white', backdropFilter: 'blur(4px)'}}><Play size={24} fill="white" /></div>
                </div>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                <div>
                  <h4 style={{fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px', lineHeight: 1.3, textDecoration: video.watched ? 'line-through' : 'none', color: video.watched ? 'var(--text-muted)' : 'white'}}>{video.title}</h4>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{video.addedAt}</span>
                    {(videoNotes[video.id]?.notes || videoNotes[video.id]?.mistakes) && (
                      <span style={{fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-physics)', borderRadius: '100px', fontWeight: 'bold'}}>Has Notes</span>
                    )}
                  </div>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
                   <button onClick={(e) => { e.stopPropagation(); removeVideo(video.id, e); }} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex'}}><Trash2 size={16}/></button>
                   <label style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: video.watched ? 'var(--accent-success)' : 'var(--text-muted)', cursor: 'pointer'}} onClick={e => e.stopPropagation()}>
                     <input type="checkbox" checked={!!video.watched} onChange={(e) => toggleVideoWatched(e, video.id)} />
                     {video.watched ? 'Watched' : 'Mark'}
                   </label>
                </div>
              </div>
            </div>
          ))}
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
        <div className="xp-toast">
          <Zap size={24} color="var(--accent-success)" />
          <div>
            <div className="xp-amount">+{toastMsg.amount} XP</div>
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
        <div className="brand"><Headphones size={24} color="var(--accent-physics)" /> FocusModePlayer</div>
        {isFullyOnboarded && (
           <div style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', textAlign: 'center'}}>
             <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>Lvl {level}: {title}</div>
             <div style={{fontWeight: 'bold', color: 'var(--accent-success)', fontSize: '1.1rem', marginTop: '4px'}}>{currentXP} XP</div>
           </div>
        )}
        <div className="nav-links">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabChange('dashboard')}><LayoutDashboard size={18} /> Today's Plan</div>
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
          <div className="mobile-brand"><Headphones size={20} color="var(--accent-physics)" /> FocusModePlayer</div>
          {isFullyOnboarded && <div className="mobile-xp-badge">⚡ {currentXP} XP</div>}
        </div>

        <header className="page-header" style={{paddingTop: '1rem'}}>
          <h1 className="greeting">
            {activeTab === 'dashboard' && `Mission ${currentUserProfile.prepType}`}
            {activeTab === 'journal' && 'Learning Journal'}
            {activeTab === 'lectures' && 'Ad-Free Lectures'}
            {activeTab === 'connect' && 'Study Connect'}
            {activeTab === 'community' && 'Community'}
            {activeTab === 'profile' && 'My Profile'}
          </h1>
          <p className="subtitle">
            {activeTab === 'dashboard' && "Crush your tasks for today."}
            {activeTab === 'journal' && "Log your learnings and mistakes."}
            {activeTab === 'lectures' && "Watch lectures ad-free."}
            {activeTab === 'connect' && "Video rooms with fellow aspirants."}
            {activeTab === 'community' && "Compete, share, and grow."}
            {activeTab === 'profile' && "Your stats and progress."}
          </p>
        </header>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'journal' && renderJournal()}
        {activeTab === 'lectures' && renderLectures()}
        {activeTab === 'connect' && renderStudyConnect()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'profile' && renderProfile()}
      </main>

      {/* Floating AI Assistant */}
      <div style={{position: 'fixed', bottom: '80px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', transform: `translate(${aiPosition.x}px, ${aiPosition.y}px)`, transition: isAiDragging ? 'none' : 'transform 0.2s ease'}}>
        {aiOpen && (
          <div className="animate-fade-in" style={{width: 'clamp(300px, 90vw, 360px)', height: '450px', marginBottom: '16px', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.8)', border: '1px solid rgba(168,85,247,0.5)', background: '#0f172a'}}>
            <div onMouseDown={handleAiDragStart} onTouchStart={handleAiDragStart} style={{background: 'linear-gradient(90deg, var(--accent-physics), var(--accent-chem))', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'grab', userSelect: 'none'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'white'}}>
                <Move size={16} style={{opacity: 0.7}}/>
                <Bot size={24}/>
                <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>AI Advisor</span>
              </div>
              <button onClick={() => setAiOpen(false)} style={{background: 'rgba(0,0,0,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}><X size={16}/></button>
            </div>
            <div style={{flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {aiMessages.map((msg, i) => (
                <div key={i} style={{alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', background: msg.role === 'ai' ? 'rgba(255,255,255,0.1)' : 'var(--accent-physics)', padding: '12px 16px', borderRadius: msg.role === 'ai' ? '16px 16px 16px 4px' : '16px 16px 4px 16px', maxWidth: '85%', fontSize: '0.95rem', lineHeight: '1.5', color: 'white', border: msg.role === 'ai' ? '1px solid rgba(255,255,255,0.05)' : 'none'}}>
                  {msg.text}
                </div>
              ))}
              {aiTyping && (
                <div style={{alignSelf: 'flex-start', background: 'rgba(255,255,255,0.1)', padding: '12px 16px', borderRadius: '16px 16px 16px 4px', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'center'}}>
                  <Sparkles size={14} className="spin-slow"/> Thinking...
                </div>
              )}
              <div ref={aiEndRef} />
            </div>
            <form onSubmit={handleAISend} style={{padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)'}}>
              <input type="text" className="input-field" placeholder="Ask for advice..." value={aiInput} onChange={e => setAiInput(e.target.value)} style={{flex: 1, padding: '10px 16px', borderRadius: '100px'}} />
              <button type="submit" className="btn-primary" style={{borderRadius: '50%', width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}} disabled={!aiInput.trim() || aiTyping}><Send size={18}/></button>
            </form>
          </div>
        )}
        
        {!aiOpen && (
          <button onClick={() => { trackAIOpened(); setAiOpen(true); }} className="btn-primary" style={{width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(168,85,247,0.5)', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))'}}>
            <Bot size={28}/>
          </button>
        )}
      </div>

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
    </div>
  );
};

export default App;

