import React, { useState } from 'react';
import { 
  User, Trophy, Flame, Target, Calendar, Clock, Award, 
  Sparkles, CheckCircle2, BookOpen, MonitorPlay, Edit3, 
  X, LogOut, Zap, Shield, ChevronRight
} from 'lucide-react';

export const ProfileView = ({
  sessionUser,
  setSessionUser,
  usersDb,
  setUsersDb,
  currentXP,
  level,
  title,
  studyStreak,
  subjects,
  videoNotes,
  journalHistory,
  playlist,
  awardXP,
  handleLogout,
  isGuest,
  setShowAuthWall,
  setAuthWallMsg,
  setBgTheme,
  bgTheme
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const currentUserProfile = usersDb[sessionUser]?.profile || {};

  const currentAim = currentUserProfile?.aim || currentUserProfile?.prepType || 'JEE Advanced';
  const targetYear = currentUserProfile?.targetYear || (new Date().getFullYear() + 1);
  const targetDateStr = currentUserProfile?.targetDate || `${targetYear}-05-20`;
  const dailyTargetHours = currentUserProfile?.targetHours || 6;

  // Simple form state
  const [editName, setEditName] = useState(sessionUser || '');
  const [editAim, setEditAim] = useState(currentAim);
  const [editDate, setEditDate] = useState(targetDateStr);
  const [editHours, setEditHours] = useState(dailyTargetHours);

  // Compute countdown to target date
  const calculateDaysLeft = () => {
    try {
      const target = new Date(editDate || targetDateStr).getTime();
      const now = new Date().getTime();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    } catch {
      return 120;
    }
  };
  const daysRemaining = calculateDaysLeft();

  // Calculate student achievements
  let totalTasksCompleted = 0;
  (subjects || []).forEach(s => {
    (s?.tasks || []).forEach(t => {
      if (Array.isArray(t?.subtasks) && t.subtasks.length > 0) {
        t.subtasks.forEach(st => { if (st?.completed) totalTasksCompleted++; });
      } else if (t?.completed) {
        totalTasksCompleted++;
      }
    });
  });

  const totalNotesCount = Object.keys(videoNotes || {}).filter(k => videoNotes[k]?.notes || videoNotes[k]?.mistakes).length;
  const totalLecturesCount = (playlist || []).filter(v => v.watched).length;
  const totalJournalsCount = Array.isArray(journalHistory) ? journalHistory.length : 0;

  // XP progress to next level
  const currentLvlFloor = (level - 1) * 100;
  const nextLvlCeil = level * 100;
  const xpInCurrentLvl = Math.max(0, currentXP - currentLvlFloor);
  const xpProgressPercent = Math.min(100, Math.max(0, (xpInCurrentLvl / 100) * 100));

  // Gamified Badges
  const BADGES = [
    {
      id: 'first_task',
      title: 'First Step',
      desc: 'Completed your first study task',
      icon: '⚡',
      color: '#38bdf8',
      unlocked: totalTasksCompleted >= 1,
      progress: `${Math.min(1, totalTasksCompleted)}/1 Done`
    },
    {
      id: 'century_xp',
      title: 'Century Club',
      desc: 'Earned 100+ XP in focus mode',
      icon: '💯',
      color: '#a855f7',
      unlocked: currentXP >= 100,
      progress: `${Math.min(100, currentXP)}/100 XP`
    },
    {
      id: 'streak_3',
      title: 'Streak Keeper',
      desc: 'Maintained 3 consecutive study days',
      icon: '🔥',
      color: '#f97316',
      unlocked: studyStreak >= 3,
      progress: `${Math.min(3, studyStreak)}/3 Days`
    },
    {
      id: 'lecture_scholar',
      title: 'Lecture Scholar',
      desc: 'Watched educational lectures & saved notes',
      icon: '📺',
      color: '#ec4899',
      unlocked: totalNotesCount >= 1 || totalLecturesCount >= 1,
      progress: totalNotesCount >= 1 ? 'Unlocked' : 'Save 1 Note'
    },
    {
      id: 'task_crusher',
      title: 'Task Crusher',
      desc: 'Crushed 10 study tasks or subtasks',
      icon: '🎯',
      color: '#10b981',
      unlocked: totalTasksCompleted >= 10,
      progress: `${Math.min(10, totalTasksCompleted)}/10 Tasks`
    },
    {
      id: 'reflection_pro',
      title: 'Active Thinker',
      desc: 'Wrote learning reflections in the journal',
      icon: '🧠',
      color: '#f59e0b',
      unlocked: totalJournalsCount >= 1,
      progress: totalJournalsCount >= 1 ? 'Unlocked' : 'Log 1 Reflection'
    },
    {
      id: 'focus_titan',
      title: 'Focus Titan',
      desc: 'Ascended to Level 5 Dedicated Scholar',
      icon: '👑',
      color: '#c084fc',
      unlocked: level >= 5,
      progress: `Level ${level}/5`
    },
    {
      id: 'grandmaster',
      title: 'Zen Grandmaster',
      desc: 'Achieved elite Level 10 mastery',
      icon: '🌌',
      color: '#6366f1',
      unlocked: level >= 10,
      progress: `Level ${level}/10`
    }
  ];

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const sanitizedName = (editName || sessionUser || 'Scholar').trim().replace(/[.#$[\]/]/g, '_');
    
    setUsersDb(prev => {
      const newDb = { ...prev };
      const existing = (sessionUser && newDb[sessionUser]) ? newDb[sessionUser] : { profile: {} };
      const updatedProfile = {
        ...(existing.profile || {}),
        name: sanitizedName,
        aim: editAim.trim() || 'JEE Advanced',
        prepType: editAim.trim() || 'JEE',
        targetDate: editDate,
        targetYear: new Date(editDate).getFullYear() || targetYear,
        targetHours: Math.max(1, Math.min(24, Number(editHours) || 6)),
        lastActive: Date.now()
      };

      if (sanitizedName !== sessionUser && sessionUser) {
        delete newDb[sessionUser];
      }
      newDb[sanitizedName] = { ...existing, profile: updatedProfile };
      return newDb;
    });

    if (sanitizedName !== sessionUser) {
      setSessionUser(sanitizedName);
      localStorage.setItem('planmaker_session', sanitizedName);
    }

    if (awardXP) awardXP(25, 'Locked in Academic Focus Target');
    setIsEditing(false);
  };

  return (
    <div className="animate-fade-in" style={{
      maxWidth: '820px',
      margin: '0 auto',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      paddingBottom: '3rem'
    }}>
      
      {/* ── HERO PROFILE HEADER ── */}
      <div className="glass" style={{
        padding: 'clamp(1.25rem, 4vw, 2rem)',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(15, 23, 42, 0.85))',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow backdrop blob */}
        <div style={{
          position: 'absolute',
          top: '-30%',
          right: '-10%',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Avatar + User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 'clamp(64px, 12vw, 84px)',
              height: 'clamp(64px, 12vw, 84px)',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 900,
              color: '#fff',
              boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4)',
              border: '2px solid rgba(255,255,255,0.2)',
              flexShrink: 0
            }}>
              {(sessionUser || 'A').charAt(0).toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
                  {sessionUser || 'Aspirant'}
                </h2>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#10b981',
                  padding: '3px 10px',
                  borderRadius: '100px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> In Deep Focus
                </span>
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent-physics)', fontWeight: 700 }}>Level {level}</span>
                <span>•</span>
                <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{title}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Edit Aim & Logout */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary"
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Edit3 size={15} /> Edit Aim & Goals
            </button>

            {isGuest ? (
              <button
                onClick={() => { setAuthWallMsg('Save your progress permanently by registering.'); setShowAuthWall(true); }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #06b6d4)',
                  color: '#fff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            ) : (
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 12px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
                title="Logout"
              >
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>
        </div>

        {/* ── CORE ACADEMIC AIM & COUNTDOWN TICKER ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '12px',
          padding: '14px 18px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              🎯 Current Focus Aim
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginTop: '2px' }}>
              {currentAim}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⏳ Target Countdown
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>
              {daysRemaining} Days Left
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⏱️ Daily Target
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
              {dailyTargetHours} Hours / Day
            </div>
          </div>
        </div>

        {/* XP Level Progress Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700 }}>
            <span style={{ color: '#fff' }}>Level {level} Progress</span>
            <span style={{ color: 'var(--accent-success)' }}>{currentXP} / {nextLvlCeil} XP ({xpProgressPercent}%)</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '100px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${xpProgressPercent}%`,
              background: 'linear-gradient(90deg, var(--accent-physics), #ec4899)',
              borderRadius: '100px',
              transition: 'width 0.4s ease'
            }} />
          </div>
        </div>
      </div>

      {/* ── EDIT AIM MODAL (SUPER SIMPLE, NO JUNK) ── */}
      {isEditing && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <form
            onSubmit={handleSaveProfile}
            className="glass animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '2rem',
              borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                🎯 Update Study Aim & Goals
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Your Name / Alias</label>
              <input
                type="text"
                className="input-field"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="e.g. Alex"
                style={{ width: '100%', marginTop: '4px', borderRadius: '12px' }}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Target Exam or Focus Aim</label>
              <input
                type="text"
                className="input-field"
                value={editAim}
                onChange={e => setEditAim(e.target.value)}
                placeholder="e.g. JEE 2026, NEET UG, UPSC, College Finals..."
                style={{ width: '100%', marginTop: '4px', borderRadius: '12px' }}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Exam / Goal Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={editDate}
                  onChange={e => setEditDate(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', borderRadius: '12px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>Daily Hours Goal</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="input-field"
                  value={editHours}
                  onChange={e => setEditHours(e.target.value)}
                  style={{ width: '100%', marginTop: '4px', borderRadius: '12px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  flex: 2,
                  padding: '12px',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.95rem'
                }}
              >
                Save Focus Aim (+25 XP)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── 4 KEY STUDY STATS ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '1rem'
      }}>
        <div className="glass" style={{
          padding: '1.25rem',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '4px'
        }}>
          <div style={{ fontSize: '2rem' }}>🔥</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fb923c', lineHeight: 1 }}>
            {studyStreak} Days
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Active Streak
          </div>
        </div>

        <div className="glass" style={{
          padding: '1.25rem',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '4px'
        }}>
          <div style={{ fontSize: '2rem' }}>✅</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-success)', lineHeight: 1 }}>
            {totalTasksCompleted}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Tasks Completed
          </div>
        </div>

        <div className="glass" style={{
          padding: '1.25rem',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '4px'
        }}>
          <div style={{ fontSize: '2rem' }}>📺</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--accent-physics)', lineHeight: 1 }}>
            {totalNotesCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Lecture Notes Saved
          </div>
        </div>

        <div className="glass" style={{
          padding: '1.25rem',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '4px'
        }}>
          <div style={{ fontSize: '2rem' }}>⚡</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
            {currentXP}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            Total Focus XP
          </div>
        </div>
      </div>

      {/* ── GAMIFIED BADGES & MASTERY ACHIEVEMENTS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="#f59e0b" /> Focus Achievements & Badges
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {BADGES.filter(b => b.unlocked).length} of {BADGES.length} Unlocked
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}>
          {BADGES.map(badge => (
            <div
              key={badge.id}
              className="glass"
              style={{
                padding: '1.1rem 1.25rem',
                borderRadius: '18px',
                border: badge.unlocked ? `1.5px solid ${badge.color}55` : '1px solid rgba(255,255,255,0.06)',
                background: badge.unlocked ? `${badge.color}0f` : 'rgba(255,255,255,0.02)',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                opacity: badge.unlocked ? 1 : 0.65,
                boxShadow: badge.unlocked ? `0 4px 20px ${badge.color}22` : 'none',
                transition: 'transform 0.2s'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: badge.unlocked ? `linear-gradient(135deg, ${badge.color}33, ${badge.color}66)` : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.4rem',
                flexShrink: 0,
                border: badge.unlocked ? `1px solid ${badge.color}` : '1px solid rgba(255,255,255,0.1)'
              }}>
                {badge.icon}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.92rem', color: badge.unlocked ? '#fff' : 'var(--text-muted)' }}>
                    {badge.title}
                  </span>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '100px',
                    background: badge.unlocked ? `${badge.color}26` : 'rgba(255,255,255,0.05)',
                    color: badge.unlocked ? badge.color : 'var(--text-muted)'
                  }}>
                    {badge.progress}
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                  {badge.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

