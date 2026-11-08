import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Minimize2, Sparkles, Check, Headphones } from 'lucide-react';
import { AmbientSoundPlayer } from './AmbientSoundPlayer.jsx';

export const ZenStudyRoom = ({
  timeLeft,
  isActive,
  startTimer,
  setTimer,
  sessionType,
  formatTime,
  activeTaskTitle,
  onExit,
  currentXP,
  level
}) => {
  // ESC to exit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onExit]);

  return (
    <div className="animate-fade-in" style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'radial-gradient(circle at center, #110f24 0%, #05040d 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'clamp(1.5rem, 4vw, 3rem)',
      color: '#fff',
      overflow: 'hidden'
    }}>
      {/* Top Bar: Level/XP and Exit Button */}
      <div style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            background: 'rgba(139,92,246,0.2)',
            color: 'var(--accent-physics)',
            padding: '4px 12px',
            borderRadius: '100px',
            border: '1px solid rgba(139,92,246,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Sparkles size={13} /> Zen Study Chamber
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Level {level} · {currentXP} XP
          </span>
        </div>

        <button
          onClick={onExit}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: '#e2e8f0',
            borderRadius: '100px',
            padding: '6px 14px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          title="Press Esc to exit"
        >
          <Minimize2 size={14} /> Exit Zen (Esc)
        </button>
      </div>

      {/* Centerpiece: Giant Timer & Active Focus Focus */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1.25rem'
      }}>
        {/* Active Task Capsule */}
        {activeTaskTitle ? (
          <div style={{
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '8px 20px',
            borderRadius: '100px',
            color: '#c4b5fd',
            fontSize: '0.95rem',
            fontWeight: 700,
            maxWidth: '500px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            🎯 Focus: {activeTaskTitle}
          </div>
        ) : (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontWeight: 700
          }}>
            Deep Focus Sprint · Zero Distractions
          </div>
        )}

        {/* Big Monospace Timer Display */}
        <div style={{
          fontSize: 'clamp(4.5rem, 14vw, 8.5rem)',
          fontWeight: 900,
          fontFamily: "'Space Grotesk', monospace",
          letterSpacing: '-2px',
          lineHeight: 1,
          color: '#fff',
          textShadow: isActive ? '0 0 50px rgba(139,92,246,0.6)' : 'none',
          transition: 'text-shadow 0.3s'
        }}>
          {formatTime(timeLeft)}
        </div>

        {/* Session Type Switcher */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            onClick={() => setTimer('pomodoro')}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: sessionType === 'pomodoro' ? 'var(--accent-physics)' : 'rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            25m Focus
          </button>
          <button
            onClick={() => setTimer('pomodoro50')}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: sessionType === 'pomodoro50' ? 'var(--accent-physics)' : 'rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            50m Deep
          </button>
          <button
            onClick={() => setTimer('shortBreak')}
            style={{
              padding: '6px 14px',
              borderRadius: '100px',
              fontSize: '0.8rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              background: sessionType === 'shortBreak' ? 'var(--accent-success)' : 'rgba(255,255,255,0.06)',
              color: '#fff'
            }}
          >
            5m Break
          </button>
        </div>

        {/* Start / Pause / Reset */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '10px' }}>
          <button
            onClick={startTimer}
            className="btn-primary"
            style={{
              padding: '14px 36px',
              borderRadius: '100px',
              fontSize: '1.15rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isActive ? '0 0 30px rgba(139,92,246,0.6)' : '0 4px 20px rgba(139,92,246,0.4)'
            }}
          >
            {isActive ? <Pause size={22} /> : <Play size={22} fill="#fff" />}
            <span>{isActive ? 'Pause' : 'Start Focus'}</span>
          </button>

          <button
            onClick={() => setTimer(sessionType)}
            style={{
              padding: '14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '50%',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* Bottom Bar: Ambient Soundscape Control */}
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <AmbientSoundPlayer />
      </div>
    </div>
  );
};

