import React, { useState, useEffect } from 'react';
import { 
  Check, ChevronDown, BookOpen, FlaskConical, Calculator, 
  Play, Pause, RotateCcw, BrainCircuit, Target, Plus, 
  LayoutDashboard, BookHeart, Users, Trophy, Flame, 
  Stethoscope, Landmark, User, LogOut, Lock, Calendar, ArrowRight,
  Headphones, Send, Zap, MonitorPlay, Trash2, Video,
  Wifi, VideoOff, PhoneCall, Globe, X
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
  ]
};

const defaultCommunityFeed = [
  { id: 1, user: 'AmanRaj_07', action: 'completed a 4-hour study streak.', time: '10m ago', isChat: false },
  { id: 2, user: 'Sneha_24', action: 'scored in the top 1% of a mock test.', time: '1h ago', isChat: false },
  { id: 3, user: 'Rohan_Prep', action: 'cleared their daily backlog.', time: '3h ago', isChat: false },
  { id: 4, user: 'Priya_M', action: 'Does anyone have short notes for Organic Chem?', time: '4h ago', isChat: true }
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

  // Community State
  const [feed, setFeed] = useState(defaultCommunityFeed);
  const [newPostText, setNewPostText] = useState('');

  // Study Connect State
  const [connectRoom, setConnectRoom] = useState(null);
  const [customRoomName, setCustomRoomName] = useState('');
  const [inCall, setInCall] = useState(false);

  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('pomodoro');

  // UI Toast State
  const [toastMsg, setToastMsg] = useState(null);

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
    setFeed(prev => [{ id: Date.now(), user: sessionUser, action: newPostText, time: 'just now', isChat: true }, ...prev]);
    setNewPostText('');
    awardXP(2, 'Community Post');
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
              <div className="exam-options" style={{justifyContent: 'flex-start'}}>
                {['JEE', 'NEET', 'UPSC'].map(exam => (
                  <button key={exam} className={`exam-btn ${onboardPrep === exam ? 'selected' : ''}`} onClick={() => setOnboardPrep(exam)} style={{padding: '1rem', width: 'auto'}}>
                    {exam === 'JEE' ? <Calculator size={20}/> : exam === 'NEET' ? <Stethoscope size={20}/> : <Landmark size={20}/>}
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

  const renderCommunity = () => (
    <div className="community-layout animate-fade-in">
      <div className="glass feed-card" style={{display: 'flex', flexDirection: 'column', maxHeight: '80vh'}}>
        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem'}}>
          <Flame size={20} color="var(--accent-success)" /> Live Study Feed
        </h3>
        <form onSubmit={handlePostFeed} style={{display: 'flex', gap: '10px', marginBottom: '1.5rem'}}>
          <input type="text" className="input-field" placeholder="Share an update or ask a question (+2 XP)..." value={newPostText} onChange={(e) => setNewPostText(e.target.value)} />
          <button type="submit" className="btn-primary" style={{padding: '12px'}}><Send size={18}/></button>
        </form>
        <div style={{overflowY: 'auto', paddingRight: '10px', flex: 1}}>
          {feed.map(item => (
            <div key={item.id} className="feed-item" style={{background: item.isChat ? 'rgba(255,255,255,0.02)' : 'transparent', borderRadius: '8px'}}>
              <div className="feed-avatar" style={{background: item.isChat ? 'var(--accent-chem)' : 'var(--accent-physics)'}}>{item.user.charAt(0).toUpperCase()}</div>
              <div className="feed-content">
                <h4>{item.user} <span className="feed-time">{item.time}</span></h4>
                <p className="feed-action" style={{color: item.isChat ? 'white' : '#cbd5e1'}}>{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="glass leaderboard-card">
        <h3 style={{fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Trophy size={20} color="#fbbf24" /> Leaderboard (Weekly)
        </h3>
        <div className="leaderboard-list">
          {combinedLeaderboard.slice(0, 10).map(lb => (
            <div key={lb.name} className="leaderboard-item">
              <span className={`rank rank-${lb.rank}`}>#{lb.rank}</span>
              <span className="leaderboard-name" style={{color: lb.name.includes('(You)') ? 'white' : 'inherit'}}>{lb.name}</span>
              <span className="leaderboard-score">{lb.score} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudyConnect = () => {
    const examRooms = [
      { id: 'JEE', label: 'JEE Aspirants', color: 'var(--accent-physics)', desc: 'Physics · Chemistry · Maths', icon: <Calculator size={28}/> },
      { id: 'NEET', label: 'NEET Aspirants', color: 'var(--accent-chem)', desc: 'Physics · Chemistry · Biology', icon: <Stethoscope size={28}/> },
      { id: 'UPSC', label: 'UPSC Aspirants', color: 'var(--accent-math)', desc: 'History · Polity · Geography', icon: <Landmark size={28}/> },
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
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem'}}>
          {examRooms.map(room => (
            <div key={room.id} className="glass subject-card" style={{textAlign: 'center', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer', borderColor: room.id === currentUserProfile.prepType ? room.color : '', transition: 'all 0.25s ease'}} onClick={() => { setConnectRoom(room.id); setInCall(true); awardXP(10, 'Joined Study Connect Room'); }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${room.color}33`; }} onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
              <div style={{color: room.color, background: `${room.color}22`, border: `1px solid ${room.color}44`, borderRadius: '16px', padding: '16px'}}>{room.icon}</div>
              <h3 style={{fontSize: '1.25rem', fontWeight: 700}}>{room.label}</h3>
              <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>{room.desc}</p>
              {room.id === currentUserProfile.prepType && <span style={{background: `${room.color}33`, color: room.color, border: `1px solid ${room.color}55`, padding: '2px 12px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: 600}}>Your Exam ⭐</span>}
              <button className="btn-primary" style={{width: '100%', background: `${room.color}22`, borderColor: `${room.color}55`, color: room.color}}><PhoneCall size={16}/> Join Room</button>
            </div>
          ))}
        </div>
        <div className="glass" style={{padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem'}}><Wifi size={20} color="var(--accent-success)"/> Private Study Room</h3>
          <p style={{color: 'var(--text-muted)', fontSize: '0.95rem'}}>Create a private room with a custom name and share it with a friend to study 1-on-1.</p>
          <div style={{display: 'flex', gap: '1rem'}}>
            <input type="text" className="input-field" placeholder="Enter a custom room name (e.g. JEECrack-Batch2025)" value={customRoomName} onChange={e => setCustomRoomName(e.target.value)} />
            <button className="btn-primary" onClick={() => { if (customRoomName.trim()) { setConnectRoom(customRoomName.trim()); setInCall(true); awardXP(10, 'Joined Private Study Room'); } }} style={{whiteSpace: 'nowrap'}}><PhoneCall size={16}/> Start Private Call</button>
          </div>
        </div>
      </div>
    );
  };

  const renderLectures = () => (
    <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      {activeVideo ? (
        <div className="glass" style={{padding: '1rem', background: '#000', borderRadius: '20px', overflow: 'hidden'}}>
          <div style={{position: 'relative', paddingBottom: '56.25%', height: 0}}>
            <iframe src={`https://www.youtube-nocookie.com/embed/${activeVideo}?autoplay=1&rel=0&modestbranding=1`} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px'}}></iframe>
          </div>
        </div>
      ) : (
        <div className="glass" style={{padding: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'var(--text-muted)'}}>
          <MonitorPlay size={64} style={{opacity: 0.5}} />
          <p>Select a video from your playlist or add a new one to start watching ad-free.</p>
        </div>
      )}
      <form className="glass" style={{padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center'}} onSubmit={handleAddVideo}>
        <div className="input-group" style={{flex: 1}}>
          <Video size={18} className="input-icon" />
          <input type="text" className="input-field with-icon" placeholder="Paste YouTube Link (Normal or Live)..." value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} />
        </div>
        <input type="text" className="input-field" placeholder="Video Title (e.g. Thermodynamics Part 1)" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} style={{flex: 1}} />
        <button type="submit" className="btn-primary" style={{whiteSpace: 'nowrap'}}><Plus size={18} /> Add to Playlist (+5 XP)</button>
      </form>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem'}}>
        {playlist.map(video => (
          <div key={video.id} className="glass subject-card" style={{display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer', border: activeVideo === video.id ? '1px solid var(--accent-physics)' : ''}} onClick={() => { setActiveVideo(video.id); awardXP(10, 'Started a Lecture'); }}>
            <div style={{position: 'relative', paddingBottom: '56.25%', borderRadius: '10px', overflow: 'hidden', background: '#111'}}>
              <img src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`} alt="thumbnail" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8}} />
              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{background: 'rgba(0,0,0,0.6)', padding: '12px', borderRadius: '50%', color: 'white'}}><Play size={24} fill="white" /></div>
              </div>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
              <div>
                <h4 style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: '4px', lineHeight: 1.3}}>{video.title}</h4>
                <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Added {video.addedAt}</p>
              </div>
              <button onClick={(e) => removeVideo(video.id, e)} style={{background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px'}}><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="animate-fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px'}}>
      <div className="glass" style={{padding: '3rem', display: 'flex', alignItems: 'center', gap: '2rem'}}>
        <div style={{width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold'}}>
          {sessionUser.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="greeting" style={{fontSize: '2.5rem', margin: 0}}>{isGuest ? 'Guest Aspirant' : sessionUser}</h1>
          <p style={{color: 'var(--accent-success)', fontWeight: 'bold', fontSize: '1.2rem'}}>{currentXP} XP Earned</p>
          <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
            <span className="tag" style={{background: 'rgba(255,255,255,0.1)', fontSize: '0.9rem', padding: '4px 12px'}}>Lvl {level}: {title}</span>
            <span className="tag" style={{background: 'rgba(255,255,255,0.1)', fontSize: '0.9rem', padding: '4px 12px'}}>Target: {currentUserProfile.prepType} {currentUserProfile.targetYear}</span>
            {isGuest && <span className="tag" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)'}}>Unsaved Account</span>}
          </div>
        </div>
      </div>
      <div className="glass" style={{padding: '2rem'}}>
        <h2 style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem'}}><Target size={24} color="var(--accent-math)"/> Identified Weakness</h2>
        <p style={{fontSize: '1.1rem', lineHeight: '1.6', color: 'var(--text-muted)'}}>{currentUserProfile.weakness || "You haven't specified a weakness."}</p>
      </div>
      
      {isGuest ? (
        <button onClick={() => { setAuthWallMsg('Create a permanent account to save your XP and profile data.'); setShowAuthWall(true); }} className="btn-primary" style={{alignSelf: 'flex-start', padding: '12px 24px'}}>
          <User size={18} /> Create Permanent Account
        </button>
      ) : (
        <button onClick={handleLogout} className="btn-primary" style={{background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171', alignSelf: 'flex-start', padding: '12px 24px'}}>
          <LogOut size={18} /> Logout
        </button>
      )}
    </div>
  );

  return (
    <div className="app-layout">
      {/* Toast Overlay */}
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
        <div style={{position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)'}}>
          <div className="glass auth-card animate-fade-in" style={{position: 'relative'}}>
            <button onClick={() => setShowAuthWall(false)} style={{position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer'}}><X size={24} /></button>
            <Users size={48} color="var(--accent-math)" style={{marginBottom: '1rem'}} />
            <h2 style={{fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 'bold'}}>Join the Community</h2>
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

      <main className="main-content">
        <header className="page-header">
          <h1 className="greeting">
            {activeTab === 'dashboard' && `Mission ${currentUserProfile.prepType}`}
            {activeTab === 'journal' && 'Your Learning Journal'}
            {activeTab === 'lectures' && 'Ad-Free Lectures'}
            {activeTab === 'connect' && 'Study Connect'}
            {activeTab === 'community' && 'Aspirant Community'}
            {activeTab === 'profile' && 'Aspirant Profile'}
          </h1>
          <p className="subtitle">
            {activeTab === 'dashboard' && "Add your tasks for today and crush them."}
            {activeTab === 'journal' && "Log what you learned and the mistakes you won't repeat."}
            {activeTab === 'lectures' && "Paste YouTube links to watch live or recorded sessions completely ad-free."}
            {activeTab === 'connect' && "Jump into a live video room with aspirants from around India."}
            {activeTab === 'community' && "Compete, share, and grow with thousands of top aspirants."}
            {activeTab === 'profile' && "Review your stats and target goals."}
          </p>
        </header>
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'journal' && renderJournal()}
        {activeTab === 'lectures' && renderLectures()}
        {activeTab === 'connect' && renderStudyConnect()}
        {activeTab === 'community' && renderCommunity()}
        {activeTab === 'profile' && renderProfile()}
      </main>
    </div>
  );
};

export default App;
