import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, RotateCcw, MonitorPlay, Plus, Trash2, Download, 
  HelpCircle, Sparkles, BookOpen, Clock, Tag, ExternalLink, 
  CheckCircle2, Bookmark, Flame, Headphones, Volume2, ChevronRight
} from 'lucide-react';
import { AmbientSoundPlayer } from './AmbientSoundPlayer.jsx';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const formatSeconds = (sec) => {
  if (!sec || isNaN(sec)) return '00:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export const LectureRoom = ({
  playlist,
  setPlaylist,
  activeVideo,
  setActiveVideo,
  videoNotes,
  saveVideoNote,
  downloadNote,
  awardXP,
  askAIDoubt,
  videoProgress,
  setVideoProgress,
  sessionUser
}) => {
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoSubject, setNewVideoSubject] = useState('Physics');
  const [activeNoteTab, setActiveNoteTab] = useState('notes'); // 'notes' | 'doubts' | 'timestamps'
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [playlistFilter, setPlaylistFilter] = useState('All');

  // Mini Focus Sprint inside Lecture Room (25m / 50m)
  const [lectureTimerSecs, setLectureTimerSecs] = useState(25 * 60);
  const [isLectureTimerActive, setIsLectureTimerActive] = useState(false);
  const [lectureTimerType, setLectureTimerType] = useState('25m');
  const timerIntervalRef = useRef(null);

  // YouTube player references
  const ytPlayerRef = useRef(null);
  const ytIntervalRef = useRef(null);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isPlayerBuffering, setIsPlayerBuffering] = useState(false);

  // Curated educational study presets
  const CURATED_PRESETS = [
    {
      id: 'jfKfPfyJRdk',
      title: 'Lofi Girl — 24/7 Deep Study Beats (Live)',
      subject: 'Study Beats',
      author: 'Lofi Girl'
    },
    {
      id: 'fNk_zzaMoSs',
      title: 'Essence of Linear Algebra — 3Blue1Brown',
      subject: 'Mathematics',
      author: '3Blue1Brown'
    },
    {
      id: 'WUvTyaaNkzM',
      title: 'Essence of Calculus — 3Blue1Brown',
      subject: 'Mathematics',
      author: '3Blue1Brown'
    },
    {
      id: 'bhiCXO12w10',
      title: 'Electromagnetism & Faraday Law Concepts',
      subject: 'Physics',
      author: 'Physics Galaxy'
    },
    {
      id: 'FSyAehMdpyI',
      title: 'Organic Chemistry Reactions Summary',
      subject: 'Chemistry',
      author: 'Khan Academy'
    }
  ];

  // Self-seed playlist if completely empty
  useEffect(() => {
    if ((!playlist || playlist.length === 0) && CURATED_PRESETS.length > 0) {
      const initial = CURATED_PRESETS.map((p, i) => ({
        ...p,
        addedAt: 'Preset Lecture',
        watched: false
      }));
      setPlaylist(initial);
      try {
        localStorage.setItem(`pm_playlist_${sessionUser}`, JSON.stringify(initial));
      } catch {}
    }
  }, [playlist, sessionUser]);

  // Mini lecture timer effect
  useEffect(() => {
    if (isLectureTimerActive) {
      timerIntervalRef.current = setInterval(() => {
        setLectureTimerSecs(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsLectureTimerActive(false);
            if (awardXP) awardXP(50, 'Completed Lecture Focus Sprint');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isLectureTimerActive]);

  const handleStartLectureTimer = (type) => {
    setLectureTimerType(type);
    setLectureTimerSecs(type === '50m' ? 50 * 60 : 25 * 60);
    setIsLectureTimerActive(true);
  };

  // YouTube Iframe API initialization & tracking
  useEffect(() => {
    if (!activeVideo) {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
      return;
    }

    setIsPlayerBuffering(true);

    const startProgressTracking = (player) => {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
      ytIntervalRef.current = setInterval(() => {
        try {
          if (player && typeof player.getCurrentTime === 'function') {
            const time = player.getCurrentTime();
            const dur = player.getDuration();
            setCurrentPlayTime(time);
            setVideoDuration(dur);
            if (time > 0 && dur > 0) {
              setVideoProgress(prev => {
                const isComp = (time / dur) > 0.92;
                const newState = { ...prev, [activeVideo]: { time, duration: dur, completed: isComp } };
                try { localStorage.setItem('pm_vidprogress', JSON.stringify(newState)); } catch {}
                return newState;
              });
            }
          }
        } catch {}
      }, 2000);
    };

    const initPlayer = () => {
      if (!document.getElementById('lecture-youtube-iframe-target')) {
        setTimeout(initPlayer, 150);
        return;
      }

      const startTime = Math.floor(videoProgress[activeVideo]?.time || 0);

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        ytPlayerRef.current.loadVideoById({
          videoId: activeVideo,
          startSeconds: startTime
        });
        setIsPlayerBuffering(false);
      } else if (window.YT && window.YT.Player) {
        ytPlayerRef.current = new window.YT.Player('lecture-youtube-iframe-target', {
          videoId: activeVideo,
          playerVars: {
            autoplay: 1,
            modestbranding: 1,
            rel: 0,
            start: startTime
          },
          events: {
            onReady: (e) => {
              setIsPlayerBuffering(false);
              startProgressTracking(e.target);
            },
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlayerBuffering(false);
                startProgressTracking(event.target);
              }
            }
          }
        });
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      if (ytIntervalRef.current) clearInterval(ytIntervalRef.current);
    };
  }, [activeVideo]);

  const setPlayerSpeed = (speed) => {
    setPlaybackSpeed(speed);
    try {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
        ytPlayerRef.current.setPlaybackRate(speed);
      }
    } catch {}
  };

  const seekPlayerTo = (seconds) => {
    try {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(seconds, true);
      }
    } catch {}
  };

  const handleAddTimestampBookmark = () => {
    if (!activeVideo) return;
    const currentStamp = formatSeconds(currentPlayTime);
    const existing = videoNotes[activeVideo]?.notes || '';
    const updated = existing ? `${existing}\n\n[${currentStamp}] ` : `[${currentStamp}] `;
    saveVideoNote(activeVideo, 'notes', updated);
    if (awardXP) awardXP(5, 'Bookmarked Lecture Timestamp');
  };

  const handleAddVideo = (e) => {
    e.preventDefault();
    if (!newVideoUrl.trim()) return;

    const vId = extractYouTubeId(newVideoUrl.trim());
    if (!vId) {
      alert("Invalid YouTube Link. Please paste a valid YouTube video URL or ID.");
      return;
    }

    if (playlist.some(v => v.id === vId)) {
      alert("This video is already in your study playlist!");
      return;
    }

    const title = newVideoTitle.trim() || `Lecture #${playlist.length + 1}`;
    const newVid = {
      id: vId,
      title,
      subject: newVideoSubject,
      addedAt: new Date().toLocaleDateString(),
      watched: false
    };

    const updated = [newVid, ...playlist];
    setPlaylist(updated);
    try {
      localStorage.setItem(`pm_playlist_${sessionUser}`, JSON.stringify(updated));
    } catch {}

    setNewVideoUrl('');
    setNewVideoTitle('');
    setActiveVideo(vId);
    if (awardXP) awardXP(15, 'Added New Lecture to Study Hall');
  };

  const removeVideo = (vId, e) => {
    e.stopPropagation();
    if (!window.confirm("Remove this lecture from playlist?")) return;
    const updated = playlist.filter(v => v.id !== vId);
    setPlaylist(updated);
    try {
      localStorage.setItem(`pm_playlist_${sessionUser}`, JSON.stringify(updated));
    } catch {}
    if (activeVideo === vId) {
      setActiveVideo(null);
    }
  };

  const toggleVideoWatched = (vId, e) => {
    e.stopPropagation();
    const updated = playlist.map(v => v.id === vId ? { ...v, watched: !v.watched } : v);
    setPlaylist(updated);
    try {
      localStorage.setItem(`pm_playlist_${sessionUser}`, JSON.stringify(updated));
    } catch {}
    if (awardXP) awardXP(30, 'Completed Video Lecture');
  };

  const activeVideoObj = playlist.find(v => v.id === activeVideo);
  const activeData = videoNotes[activeVideo] || { notes: '', mistakes: '' };

  // Filtered playlist
  const filteredPlaylist = playlistFilter === 'All' 
    ? playlist 
    : playlist.filter(v => (v.subject || 'Physics').toLowerCase() === playlistFilter.toLowerCase());

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* ── TOP ROOM COMMAND BAR (Ambient Sound + Mini Sprint Timer) ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(15, 23, 42, 0.7))',
        border: '1px solid rgba(139, 92, 246, 0.25)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent-physics), var(--accent-chem))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
          }}>
            <MonitorPlay size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px' }}>
              Study Lecture Hall
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Distraction-free educational theater · Timestamped notes · Ambient focus
            </div>
          </div>
        </div>

        {/* Right side: Mini Pomodoro & Ambient Player */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <AmbientSoundPlayer compact={true} />

          {/* Mini Sprint Timer Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.3)',
            padding: '5px 12px',
            borderRadius: '100px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <Clock size={14} color="var(--accent-physics)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, fontFamily: "'Space Grotesk', monospace", color: '#fff' }}>
              {formatSeconds(lectureTimerSecs)}
            </span>
            <button
              onClick={() => setIsLectureTimerActive(!isLectureTimerActive)}
              style={{
                background: isLectureTimerActive ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                color: isLectureTimerActive ? '#f87171' : '#10b981',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
              title={isLectureTimerActive ? "Pause Sprint" : "Start 25m Focus Sprint"}
            >
              {isLectureTimerActive ? <Pause size={12} /> : <Play size={12} />}
            </button>
            <button
              onClick={() => handleStartLectureTimer(lectureTimerType === '25m' ? '50m' : '25m')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.7rem',
                cursor: 'pointer',
                fontWeight: 700
              }}
              title="Toggle 25m / 50m sprint"
            >
              {lectureTimerType}
            </button>
          </div>
        </div>
      </div>

      {/* ── THEATER VIEW: DUAL SPLIT WORKSPACE ── */}
      {activeVideo ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(320px, 1fr)',
          gap: '1.25rem',
          alignItems: 'start'
        }} className="lecture-theater-grid">
          
          {/* LEFT: VIDEO PLAYER & CONTROLS */}
          <div className="glass" style={{
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            background: '#090a10',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}>
            {/* 16:9 Video Embed */}
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
              <div
                id="lecture-youtube-iframe-target"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
              {isPlayerBuffering && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.7)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  gap: '8px'
                }}>
                  <div className="typing-dot" /> Loading Lecture Stream...
                </div>
              )}
            </div>

            {/* Video Controls & Header */}
            <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>
                    {activeVideoObj?.title || 'Lecture Stream'}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.72rem', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--accent-physics)', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                      {activeVideoObj?.subject || 'Education'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ⏱️ {formatSeconds(currentPlayTime)} / {formatSeconds(videoDuration)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setActiveVideo(null)}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'var(--text-muted)',
                    borderRadius: '8px',
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Close Theater
                </button>
              </div>

              {/* Action Toolbar: Timestamp Bookmark, Speed, Mark Completed */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <button
                  onClick={handleAddTimestampBookmark}
                  style={{
                    background: 'linear-gradient(135deg, var(--accent-physics), #9333ea)',
                    border: 'none',
                    color: '#fff',
                    padding: '7px 14px',
                    borderRadius: '100px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
                  }}
                >
                  <Bookmark size={14} /> Bookmark [{formatSeconds(currentPlayTime)}]
                </button>

                {/* Playback speed buttons */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: '2px' }}>Speed:</span>
                  {[1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlayerSpeed(speed)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: playbackSpeed === speed ? 'var(--accent-physics)' : 'rgba(255,255,255,0.06)',
                        color: playbackSpeed === speed ? '#fff' : 'var(--text-muted)'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={(e) => toggleVideoWatched(activeVideo, e)}
                  style={{
                    background: activeVideoObj?.watched ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.06)',
                    color: activeVideoObj?.watched ? '#10b981' : 'var(--text-muted)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '6px 12px',
                    borderRadius: '100px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <CheckCircle2 size={14} /> {activeVideoObj?.watched ? 'Completed (+30 XP)' : 'Mark Finished'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: SMART STUDY NOTEBOOK & DOUBTS */}
          <div className="glass" style={{
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            minHeight: '480px'
          }}>
            {/* Note Tabs & Export Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setActiveNoteTab('notes')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeNoteTab === 'notes' ? 'rgba(139,92,246,0.2)' : 'transparent',
                    color: activeNoteTab === 'notes' ? 'var(--accent-physics)' : 'var(--text-muted)'
                  }}
                >
                  📝 Notes
                </button>
                <button
                  onClick={() => setActiveNoteTab('doubts')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: activeNoteTab === 'doubts' ? 'rgba(239,68,68,0.2)' : 'transparent',
                    color: activeNoteTab === 'doubts' ? '#f87171' : 'var(--text-muted)'
                  }}
                >
                  ⚠️ Doubts & AI
                </button>
              </div>

              <button
                className="btn-primary"
                onClick={() => downloadNote(activeVideoObj)}
                style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}
                title="Export this note to .txt"
              >
                <Download size={13} /> Export
              </button>
            </div>

            {/* Note Tab Content */}
            <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
              {activeNoteTab === 'notes' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      💡 Tip: Click "[00:00]" timestamps to jump directly in the lecture.
                    </span>
                    {activeData.lastUpdated && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Saved {activeData.lastUpdated}
                      </span>
                    )}
                  </div>
                  <textarea
                    value={activeData.notes || ''}
                    onChange={(e) => saveVideoNote(activeVideo, 'notes', e.target.value)}
                    placeholder="Write key equations, derivations, theory takeaways here...&#10;&#10;Use the Bookmark button to save timestamps!"
                    style={{
                      width: '100%',
                      flex: 1,
                      minHeight: '340px',
                      background: 'rgba(0,0,0,0.25)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '14px',
                      padding: '14px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 700 }}>
                      Mistakes & Unclear Topics
                    </span>
                    <button
                      onClick={() => askAIDoubt(activeData.mistakes)}
                      disabled={!activeData.mistakes?.trim()}
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: activeData.mistakes?.trim() ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <HelpCircle size={14} /> Ask FocusBot AI
                    </button>
                  </div>
                  <textarea
                    value={activeData.mistakes || ''}
                    onChange={(e) => saveVideoNote(activeVideo, 'mistakes', e.target.value)}
                    placeholder="Did something confuse you? Write the formula or timestamp here.&#10;&#10;Then click 'Ask FocusBot AI' to get an instant breakdown!"
                    style={{
                      width: '100%',
                      flex: 1,
                      minHeight: '340px',
                      background: 'rgba(239, 68, 68, 0.03)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '14px',
                      padding: '14px',
                      color: '#f8fafc',
                      fontSize: '0.92rem',
                      lineHeight: 1.6,
                      resize: 'none',
                      outline: 'none',
                      fontFamily: 'inherit'
                    }}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Empty State / Theater Welcome */
        <div className="glass" style={{
          padding: '3rem 1.5rem',
          borderRadius: '24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(15,23,42,0.8))',
          border: '1px dashed rgba(139,92,246,0.3)',
          gap: '12px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(236,72,153,0.2))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-physics)'
          }}>
            <MonitorPlay size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Ready for Deep Video Study?
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: '500px', margin: 0 }}>
            Select any lecture below to launch ad-free cinema mode with synchronized timestamp note-taking, or paste any YouTube URL to add it.
          </p>
        </div>
      )}

      {/* ── ADD NEW LECTURE FORM ── */}
      <form
        onSubmit={handleAddVideo}
        className="glass"
        style={{
          padding: '1.25rem',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)'
        }}
      >
        <div style={{ flex: '2 1 240px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Paste YouTube Link (e.g., https://youtu.be/...)"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            style={{ width: '100%', borderRadius: '12px', padding: '12px 14px' }}
          />
        </div>

        <div style={{ flex: '1.5 1 180px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Lecture Title (e.g. Thermodynamics Part 1)"
            value={newVideoTitle}
            onChange={(e) => setNewVideoTitle(e.target.value)}
            style={{ width: '100%', borderRadius: '12px', padding: '12px 14px' }}
          />
        </div>

        <div style={{ flex: '0 0 auto', minWidth: '130px' }}>
          <select
            className="input-field"
            value={newVideoSubject}
            onChange={(e) => setNewVideoSubject(e.target.value)}
            style={{ width: '100%', borderRadius: '12px', padding: '12px 14px', cursor: 'pointer' }}
          >
            <option value="Physics">⚡ Physics</option>
            <option value="Chemistry">🧪 Chemistry</option>
            <option value="Mathematics">📐 Mathematics</option>
            <option value="Biology">🧬 Biology</option>
            <option value="General">📚 General</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flex: '0 0 auto'
          }}
          disabled={!newVideoUrl.trim()}
        >
          <Plus size={16} /> Add to Study Hall (+15 XP)
        </button>
      </form>

      {/* ── PLAYLIST & CURATED STREAMS ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Your Lecture Library ({playlist.length})
            </h3>
          </div>

          {/* Subject Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {['All', 'Physics', 'Chemistry', 'Mathematics', 'Study Beats'].map(filter => (
              <button
                key={filter}
                onClick={() => setPlaylistFilter(filter)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '100px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: playlistFilter === filter ? 'var(--accent-physics)' : 'rgba(255,255,255,0.06)',
                  color: playlistFilter === filter ? '#fff' : 'var(--text-muted)'
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Video Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredPlaylist.map((video) => {
            const prog = videoProgress[video.id];
            const percent = prog ? Math.min(100, (prog.time / prog.duration) * 100) : 0;
            const isPlayingThis = activeVideo === video.id;
            const hasNotes = !!(videoNotes[video.id]?.notes || videoNotes[video.id]?.mistakes);

            return (
              <div
                key={video.id}
                onClick={() => {
                  setActiveVideo(video.id);
                  if (awardXP) awardXP(10, 'Started Lecture in Study Hall');
                }}
                className="glass"
                style={{
                  borderRadius: '18px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isPlayingThis ? '2px solid var(--accent-physics)' : '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(15, 23, 42, 0.5)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isPlayingThis ? '0 0 25px rgba(139,92,246,0.3)' : 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Thumbnail */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={video.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)'
                  }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: 'rgba(139, 92, 246, 0.85)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                    }}>
                      <Play size={20} fill="#fff" color="#fff" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>

                  {/* Progress Line */}
                  {percent > 0 && (
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)' }}>
                      <div style={{ height: '100%', width: `${percent}%`, background: 'var(--accent-physics)' }} />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      lineHeight: 1.35,
                      color: video.watched ? 'var(--text-muted)' : '#fff',
                      textDecoration: video.watched ? 'line-through' : 'none',
                      margin: '0 0 6px'
                    }}>
                      {video.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {video.subject || 'Lecture'}
                      </span>
                      {hasNotes && (
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '100px', background: 'rgba(139,92,246,0.15)', color: 'var(--accent-physics)', fontWeight: 700 }}>
                          📝 Notes
                        </span>
                      )}
                      {(video.watched || prog?.completed) && (
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '100px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>
                          ✓ Done
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <label
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: video.watched ? '#10b981' : 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={!!video.watched}
                        onChange={(e) => toggleVideoWatched(video.id, e)}
                      />
                      {video.watched ? 'Completed' : 'Mark Done'}
                    </label>

                    <button
                      onClick={(e) => removeVideo(video.id, e)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                      title="Remove from playlist"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

