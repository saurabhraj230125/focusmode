import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Circle, Sparkles, Award } from 'lucide-react';

export const DailyFocusQuests = ({
  completedTasksCount,
  pomodoroSessionsToday,
  notesOrJournalCount,
  awardXP,
  sessionUser
}) => {
  const [bonusClaimed, setBonusClaimed] = useState(() => {
    try {
      const today = new Date().toDateString();
      const saved = localStorage.getItem(`pm_daily_quest_bonus_${sessionUser}`);
      return saved === today;
    } catch {
      return false;
    }
  });

  const quest1Done = pomodoroSessionsToday >= 1;
  const quest2Done = completedTasksCount >= 2;
  const quest3Done = notesOrJournalCount >= 1;
  const allQuestsDone = quest1Done && quest2Done && quest3Done;

  useEffect(() => {
    if (allQuestsDone && !bonusClaimed) {
      setBonusClaimed(true);
      try {
        const today = new Date().toDateString();
        localStorage.setItem(`pm_daily_quest_bonus_${sessionUser}`, today);
      } catch {}
      if (awardXP) {
        awardXP(50, 'Mastered All Daily Focus Quests (Daily Champion)');
      }
    }
  }, [allQuestsDone, bonusClaimed, sessionUser]);

  const quests = [
    {
      id: 'q1',
      title: 'Complete 1 Deep Focus Sprint',
      progress: `${Math.min(1, pomodoroSessionsToday)}/1 Sprint`,
      completed: quest1Done,
      xp: 30,
      icon: '⏳'
    },
    {
      id: 'q2',
      title: 'Crush 2 Study Tasks',
      progress: `${Math.min(2, completedTasksCount)}/2 Tasks`,
      completed: quest2Done,
      xp: 30,
      icon: '🎯'
    },
    {
      id: 'q3',
      title: 'Study 1 Lecture or Journal Entry',
      progress: `${Math.min(1, notesOrJournalCount)}/1 Logged`,
      completed: quest3Done,
      xp: 30,
      icon: '📖'
    }
  ];

  return (
    <div className="glass" style={{
      padding: '1.25rem',
      borderRadius: '20px',
      border: allQuestsDone ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255,255,255,0.08)',
      background: allQuestsDone ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(15, 23, 42, 0.8))' : 'rgba(15, 23, 42, 0.6)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)'
          }}>
            <Target size={16} color="#fff" />
          </div>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff' }}>
            Daily Focus Quests
          </span>
        </div>

        {allQuestsDone ? (
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            background: 'rgba(245, 158, 11, 0.25)',
            color: '#f59e0b',
            padding: '3px 10px',
            borderRadius: '100px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(245, 158, 11, 0.4)'
          }}>
            <Sparkles size={13} /> Daily Champion (+50 XP Claimed)
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            {quests.filter(q => q.completed).length}/3 Completed
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {quests.map(quest => (
          <div
            key={quest.id}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              background: quest.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255,255,255,0.02)',
              border: quest.completed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>{quest.icon}</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: quest.completed ? '#e2e8f0' : 'var(--text-muted)',
                  textDecoration: quest.completed ? 'line-through' : 'none'
                }}>
                  {quest.title}
                </span>
                <span style={{ fontSize: '0.68rem', color: quest.completed ? '#10b981' : 'var(--text-muted)' }}>
                  {quest.progress}
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              color: quest.completed ? '#10b981' : 'var(--accent-physics)'
            }}>
              {quest.completed ? '✓ Done' : `+${quest.xp} XP`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

