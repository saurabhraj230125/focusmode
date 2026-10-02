import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, ChevronDown, BookOpen, FlaskConical, Calculator, 
  Play, Pause, RotateCcw, BrainCircuit, Target, Plus, 
  LayoutDashboard, BookHeart, Users, Trophy, Flame, 
  Stethoscope, Landmark, User, LogOut, Lock, Calendar, ArrowRight,
  Headphones, Send, Zap, MonitorPlay, Trash2, Video,
  Wifi, VideoOff, PhoneCall, Globe, X, Download, FileText, Save, Bot, Sparkles, Move, Columns, Rows, HelpCircle
} from 'lucide-react';

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

const App = () => {
  // Global States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [usersDb, setUsersDb] = useState({});
  const [sessionUser, setSessionUser] = useState(null); 
  
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

  // Lectures State
  const [playlist, setPlaylist] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [lectureViewMode, setLectureViewMode] = useState('horizontal');

  // Community State
  const [feed, setFeed] = useState(defaultCommunityFeed);
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
    const handleMouseUp = () => { aiDragStart.current = null; };
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
  };

  const askAIDoubt = (doubtText) => {
    if (!doubtText.trim()) return;
    setAiOpen(true);
    setAiInput(doubtText);
    setTimeout(() => {
      setAiMessages(prev => [...prev, { role: 'user', text: doubtText }]);
      setAiInput('');
      setAiTyping(true);
      setTimeout(() => {
        const response = getAIAdvice(doubtText, currentUserProfile?.prepType);
        setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
        setAiTyping(false);
      }, 1000);
    }, 100);
  };

  const getAIAdvice = (text, prepType) => {
    const t = text.toLowerCase();
    
    // GREETINGS & INTRO
    if (t.match(/\b(hi|hello|hey|yo|sup|help|start)\b/)) return `Hello! I am FocusBot, your deeply trained AI Advisor. I have analyzed terabytes of study data. Since you are studying for ${prepType || 'your exams'}, what specific topic, subject, or problem can I help you conquer today?`;
    
    // PROCRASTINATION, DISTRACTION, PHONE
    if (t.match(/distract|phone|reel|tiktok|instagram|focus|procrastinat|can't study|lazy|youtube/)) return "Distraction is a dopamine trap. The internet is engineered to steal your attention. Solution: Do a 'Dopamine Detox'. Lock your phone in a drawer. Start a 25-minute Pomodoro timer here on the Dashboard. Tell your brain you only have to work for 5 minutes. The friction to start is always higher than the friction to continue. 🚀";
    
    // BURNOUT, TIRED, SLEEP, STRESS
    if (t.match(/stress|anxi|nervous|burnout|tired|exhaust|sleep|depress|sad|cry|overwhelm/)) return "Listen closely: Chronic stress destroys your hippocampus (the memory center). If you are burned out, studying is literally useless because your brain can't consolidate memory without REM sleep. Take a mandatory 2-hour break, go outside, hydrate, and ensure you get 7.5 to 8 hours of sleep tonight. Your brain needs to heal. 💙";
    
    // MEMORY, ACTIVE RECALL, BIOLOGY, HISTORY
    if (t.match(/memor|forget|remember|biology|history|retain|learn|cram/)) return "Rereading and highlighting are the lowest-yield study methods. You need 'Active Recall' and 'Spaced Repetition' (based on the Ebbinghaus Forgetting Curve). Close the book and write down everything you know on a blank page. Whatever you miss is your weak point. Review it today, in 3 days, and in 7 days. 🧠";
    
    // PROBLEM SOLVING, MATH, PHYSICS, QUANT
    if (t.match(/physics|math|numerical|quant|solve|hard problem|calculus|mechanic/)) return "For analytical subjects, reading the solution ruins your brain's struggle phase (which is where neural pathways actually form). Try a problem for 10-15 minutes. If stuck, look at ONLY the first step of the solution. Hide it, and try to finish. The 'struggle' is the learning. ⚡";
    
    // CHEMISTRY (ORGANIC / INORGANIC)
    if (t.match(/chem|organic|inorganic|reaction|mechanism/)) return "Chemistry is divided: Physical needs daily numerical practice. Organic requires understanding electron flow and mechanisms, NOT pure memorization—draw them out repeatedly. Inorganic is pure memory: use flashcards, mnemonics, and review a small chunk every morning for 15 minutes. 🧪";
    
    // MOCK TESTS, PYQS, PREVIOUS YEAR QUESTIONS
    if (t.match(/mock|pyq|test|score|marks|improv|negative|exam/)) return "Mock tests are useless without Analysis. Spend as much time analyzing the mock as you did taking it. Put every single mistake into your 'Journal & Mistakes' tab. Categorize them: Silly mistake? Conceptual gap? Time pressure? Fix the root cause, and your score will naturally jump. 📈";
    
    // UNDERSTANDING CONCEPTS / FEYNMAN TECHNIQUE
    if (t.match(/don't understand|confus|concept|theory|hard to grasp/)) return "Use the Feynman Technique: Try to explain this concept out loud as if you were teaching a 10-year-old. When you stumble or use complex jargon, that's your knowledge gap. Go back to the book just for that gap, then try explaining it again. 🗣️";
    
    // TIME MANAGEMENT, ROUTINE, TIMETABLE
    if (t.match(/plan|timetable|schedule|routine|time|late|manage|hours/)) return "Stop planning 14-hour days—that leads to burnout. Use the Pareto Principle (80/20 rule): 80% of your marks come from 20% of the syllabus. Identify those high-yield topics. Pick 3 'Non-Negotiable' tasks daily and put them in your Dashboard. Complete them first thing in the morning. 📅";
    
    // MOTIVATION, DISCIPLINE, FEELING LIKE GIVING UP
    if (t.match(/motivat|give up|hard|tough|fail|demotivat|quit|competi/)) return `Motivation is a feeling, and feelings change. Discipline is a choice. You are studying for ${prepType || 'your future'}. Every single time you sit down to study when you feel like quitting, you are beating 90% of the competition. The pain of discipline is less than the pain of regret. Start right now. 🔥`;
    
    // DIET, NUTRITION, HYDRATION
    if (t.match(/food|diet|eat|drink|water|coffee|caffeine/)) return "Your brain consumes 20% of your calories. Avoid heavy carbs or sugar before studying—they cause insulin spikes and crashes (brain fog). Drink water constantly. If using caffeine, wait 90-120 minutes after waking up so you don't crash in the afternoon. 🍎";
    
    // FALLBACKS (If no keyword matches)
    const fallbacks = [
      "I've scanned my database, and the best approach here is to break this down into smaller pieces. What is the absolute smallest, easiest step you can take on this right now?",
      "That's an interesting challenge. Have you tried logging this in your Learning Journal? Formulating the problem in writing often reveals the solution to your brain automatically.",
      "Based on top performers' data, my best advice here is consistency. Don't look for a magic bullet; just put in 45 minutes of deep, uninterrupted work right now.",
      "Got it. Whenever you feel stuck like this, I highly recommend jumping into a Study Connect room. Co-working silently with others triggers 'body doubling', which massively boosts focus!"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  };

  const handleAISend = (e) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;
    const userText = aiInput.trim();
    
    setAiMessages(prev => [...prev, { role: 'user', text: userText }]);
    setAiInput('');
    setAiTyping(true);

    setTimeout(() => {
      const response = getAIAdvice(userText, currentUserProfile?.prepType);
      setAiMessages(prev => [...prev, { role: 'ai', text: response }]);
      setAiTyping(false);
    }, 1000);
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

    const savedFeed = localStorage.getItem('planmaker_feed');
    if (savedFeed) setFeed(JSON.parse(savedFeed));
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

  // Sync community feed
  useEffect(() => {
    if (feed !== defaultCommunityFeed) {
      localStorage.setItem('planmaker_feed', JSON.stringify(feed));
    }
  }, [feed]);

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
      if (sessionUser) {
        let xpGained = sessionType === 'pomodoro' ? 50 : 10;
        awardXP(xpGained, `Completed ${sessionType === 'pomodoro' ? 'Pomodoro Session' : 'Break'}`);
        
        const post = {
          id: Date.now(), user: sessionUser,
          action: `completed a ${sessionType === 'pomodoro' ? '25-minute Pomodoro' : 'short break'}.`,
          time: 'just now', isChat: false
        };
        setFeed(prev => [post, ...prev]);
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
      setSessionUser(authUsername);
      localStorage.setItem('planmaker_session', authUsername);
      localStorage.removeItem('planmaker_explicit_logout');
      loadUserData(authUsername);
    }
    setAuthUsername(''); setAuthPassword('');
  };

  const handleLogout = () => {
    setSessionUser(null);
    setSubjects([]); setJournalHistory([]); setPlaylist([]);
    setActiveTab('dashboard'); setActiveVideo(null);
    localStorage.removeItem('planmaker_session');
    localStorage.setItem('planmaker_explicit_logout', 'true');
  };

  // Onboarding Functions
  const submitOnboarding = () => {
    if (!onboardPrep || !onboardYear) return;
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

    if (taskCompletedJustNow) awardXP(5, 'Completed Subtask');
    if (allCompletedNow) {
       awardXP(20, 'Completed Full Module!');
       setFeed(prev => [{ id: Date.now(), user: sessionUser, action: `just finished a full task module! 🚀`, time: 'just now', isChat: false }, ...prev]);
    }
  };

  // Journal Functions
  const saveJournalEntry = () => {
    if (!learnedText.trim() && !mistakesText.trim()) return;
    const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const entry = `Learned: ${learnedText || 'N/A'}\nMistakes: ${mistakesText || 'N/A'}`;
    setJournalHistory(prev => [{ date: dateStr, text: entry }, ...prev]);
    setLearnedText(''); setMistakesText('');
    awardXP(15, 'Logged Daily Journal');
  };

  // Community Functions
  const handlePostFeed = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    setFeed(prev => [{
      id: Date.now(),
      user: sessionUser,
      prep: currentUserProfile?.prepType,
      xp: currentXP,
      action: newPostText,
      time: 'just now',
      isChat: true,
      likes: 0,
      likedBy: [],
      comments: [],
    }, ...prev]);
    setNewPostText('');
    awardXP(2, 'Community Post');
  };

  const toggleLike = (postId) => {
    setFeed(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const hasLiked = p.likedBy?.includes(sessionUser);
      return {
        ...p,
        likes: hasLiked ? (p.likes - 1) : (p.likes + 1),
        likedBy: hasLiked ? p.likedBy.filter(u => u !== sessionUser) : [...(p.likedBy || []), sessionUser],
      };
    }));
  };

  const submitComment = (postId) => {
    if (!commentText.trim()) return;
    setFeed(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...(p.comments || []), { user: sessionUser, text: commentText, time: 'just now' }] };
    }));
    setCommentText('');
    setCommentingOn(null);
    awardXP(1, 'Commented on a Post');
  };

  // Lecture Functions
  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!newVideoUrl.trim() || !newVideoTitle.trim()) return;
    
    const ytId = extractYouTubeId(newVideoUrl);
    if (!ytId) {
      alert("Please enter a valid YouTube URL (including live streams)");
      return;
    }

    const newVideo = { id: ytId, title: newVideoTitle, addedAt: new Date().toLocaleDateString() };
    setPlaylist(prev => [newVideo, ...prev]);
    setNewVideoUrl('');
    setNewVideoTitle('');
    awardXP(5, 'Added Lecture to Playlist');
  };

  const removeVideo = (id, e) => {
    e.stopPropagation();
    setPlaylist(prev => prev.filter(vid => vid.id !== id));
    if (activeVideo === id) setActiveVideo(null);
  };

  // Jitsi Study Connect
  const startJitsiCall = useCallback((roomId) => {
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
    setTimeLeft(type === 'pomodoro' ? 25 * 60 : 5 * 60);
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

  const currentUserProfile = usersDb[sessionUser]?.profile;
  const isFullyOnboarded = !!currentUserProfile?.prepType;
  const isGuest = currentUserProfile?.isGuest;
  const currentXP = currentUserProfile?.xp || 0;
  const { level, title } = getLevelData(currentXP);

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
        <div className="glass timer-card">
          <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem'}}> Focus Timer </h3>
          <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '8px'}}>
            <button style={{padding: '4px 12px', borderRadius: '100px', background: sessionType === 'pomodoro' ? 'rgba(255,255,255,0.1)' : 'transparent', color: sessionType === 'pomodoro' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer'}} onClick={() => setTimer('pomodoro')}>Pomodoro</button>
            <button style={{padding: '4px 12px', borderRadius: '100px', background: sessionType === 'shortBreak' ? 'rgba(255,255,255,0.1)' : 'transparent', color: sessionType === 'shortBreak' ? 'white' : '#94a3b8', border: 'none', cursor: 'pointer'}} onClick={() => setTimer('shortBreak')}>Break</button>
          </div>
          <div className="timer-display">{formatTime(timeLeft)}</div>
          <div style={{fontSize: '0.85rem', color: 'var(--accent-success)', marginBottom: '1rem', fontWeight: 'bold'}}> Reward: +{sessionType === 'pomodoro' ? '50' : '10'} XP </div>
          <div className="timer-controls">
            <button className="btn-primary" onClick={() => setIsActive(!isActive)}>
              {isActive ? <Pause size={18} /> : <Play size={18} />}
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button className="btn-icon" onClick={() => setTimer(sessionType)}><RotateCcw size={18} /></button>
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
    const avatarColors = ['var(--accent-physics)','var(--accent-chem)','var(--accent-math)','var(--accent-success)','#f59e0b','#06b6d4'];
    const getAvatarColor = (name) => { let h = 0; for (let c of name) h = c.charCodeAt(0) + ((h<<5)-h); return avatarColors[Math.abs(h)%avatarColors.length]; };
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
          <div style={{display:'flex', flexDirection:'column'}}>{feed.map(item => renderPostCard(item))}</div>
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
                  <h4 style={{fontWeight: 600, fontSize: '1.05rem', marginBottom: '6px', lineHeight: 1.3}}>{video.title}</h4>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <span style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{video.addedAt}</span>
                    {(videoNotes[video.id]?.notes || videoNotes[video.id]?.mistakes) && (
                      <span style={{fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-physics)', borderRadius: '100px', fontWeight: 'bold'}}>Has Notes</span>
                    )}
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); removeVideo(video.id, e); }} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex'}}><Trash2 size={16}/></button>
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
      <div style={{position: 'fixed', bottom: '80px', right: '20px', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', transform: `translate(${aiPosition.x}px, ${aiPosition.y}px)`, transition: aiDragStart.current ? 'none' : 'transform 0.2s ease'}}>
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
          <button onClick={() => setAiOpen(true)} className="btn-primary" style={{width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 25px rgba(168,85,247,0.5)', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))'}}>
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

