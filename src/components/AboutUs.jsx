import React, { useEffect } from 'react';
import { 
  Headphones, Target, Sparkles, Award, Shield, Users, 
  ArrowLeft, CheckCircle2, Heart, Code2, Flame, ArrowRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AboutUs = ({ onBack }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "About Us | FocusMode Player";
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div 
      className="animate-fade-in" 
      style={{
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        padding: '1.5rem 1.25rem 4rem',
        color: '#cbd5e1',
        lineHeight: 1.75,
        fontSize: '0.95rem',
        boxSizing: 'border-box',
        overflowWrap: 'break-word',
        wordBreak: 'break-word'
      }}
    >
      {/* Top Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={handleBack}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#fff',
            padding: '8px 18px',
            borderRadius: '100px',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <ArrowLeft size={16} /> Back to FocusMode
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#94a3b8' }}>
          <Heart size={14} color="#ec4899" fill="#ec4899" />
          <span>Built for Aspirants Worldwide</span>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="glass" style={{
        padding: 'clamp(1.75rem, 5vw, 3rem) clamp(1.25rem, 3vw, 2.5rem)',
        borderRadius: '24px',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 24px rgba(139,92,246,0.4)'
        }}>
          <Headphones size={30} color="#fff" />
        </div>
        <h1 style={{
          fontSize: 'clamp(2rem, 5vw, 3rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 12px',
          letterSpacing: '-1px',
          lineHeight: 1.2
        }}>
          About FocusMode Player
        </h1>
        <p style={{
          maxWidth: '680px',
          margin: '0 auto',
          color: '#94a3b8',
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
          lineHeight: 1.6
        }}>
          An intentional, calm, distraction-free study sanctuary engineered to help students conquer competitive exams in an era of hyper-stimulating algorithmic feeds.
        </p>
      </div>

      {/* Main Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* Story Section */}
        <section className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--accent-physics)" /> Our Story & Why We Built This
          </h2>
          <p>
            Cracking high-stakes competitive examinations — whether <strong>JEE Advanced, NEET, UPSC Civil Services, SAT, GATE, or National Boards</strong> — demands hundreds of hours of uninterrupted cognitive immersion. Yet every major digital platform where world-class educators publish lectures is fundamentally designed to maximize ad views, scroll time, and click-through rates.
          </p>
          <p>
            A student opens a lecture to understand <em>Thermodynamics</em> or <em>Organic Chemistry</em>, and within minutes is ambushed by sensational recommendation thumbnails, viral gaming shorts, and heated comment debates. Every context switch shatters working memory and extends the study day.
          </p>
          <p style={{ margin: 0 }}>
            <strong>FocusMode Player was born out of firsthand exhaustion with this distraction economy.</strong> We asked: what if an online lecture room felt like an empty wooden desk in a quiet university library? No comments, no related videos, no notifications — only your video lecture, your timestamped thoughts, and deep ambient focus sound.
          </p>
        </section>

        {/* 4 Pillars Grid */}
        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--accent-chem)" /> The Four Pillars of FocusMode
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem'
          }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div style={{ color: 'var(--accent-physics)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Target size={18} /> 1. Theater Mode
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                Clean video lecture experience eliminating YouTube sidebars, autoplay traps, and comment sections while keeping playback controls pristine.
              </p>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(236,72,153,0.2)' }}>
              <div style={{ color: 'var(--accent-chem)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Headphones size={18} /> 2. Procedural Audio
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                Synthesized 40Hz gamma binaural beats, brown noise, and rain generator built directly via Web Audio API. 100% offline, lightweight, and calming.
              </p>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(59,130,246,0.2)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Flame size={18} /> 3. Timestamp Notes
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                One-click keypoint bookmarks tied to exact lecture seconds. Review difficult formula derivations without scrubbing through 2-hour videos.
              </p>
            </div>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: '18px', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ color: '#34d399', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={18} /> 4. Local-First Privacy
              </div>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                Your study schedules, streaks, and notebooks stay securely on your device. We do not track private browsing history or monetize personal records.
              </p>
            </div>
          </div>
        </section>

        {/* Founder & Publisher Info */}
        <section className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="var(--accent-physics)" /> Founder & Open Mission
          </h2>
          <p>
            FocusMode Player is founded and maintained by <strong>Saurabh Raj</strong>, an engineer and passionate advocate for accessible, calm educational technology based in India.
          </p>
          <p>
            Our commitment is to keep the core learning ecosystem freely accessible to every aspirant regardless of socioeconomic background. Non-intrusive advertisements (served transparently via Google AdSense) help fund server hosting, bandwidth, and ongoing software development without ever paywalling study tools.
          </p>

          <div style={{
            marginTop: '1.5rem',
            padding: '1.25rem',
            borderRadius: '16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>Want to collaborate or have an idea?</div>
              <div style={{ color: '#94a3b8', fontSize: '0.84rem' }}>We welcome feedback from students, teachers, and publishers.</div>
            </div>
            <button
              onClick={() => {
                if (onBack) onBack();
                navigate('/contact');
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 20px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(139,92,246,0.35)'
              }}
            >
              Contact Our Team <ArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* Educational Disclaimer */}
        <div style={{
          padding: '1.25rem',
          borderRadius: '16px',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          fontSize: '0.82rem',
          color: '#64748b',
          lineHeight: 1.6
        }}>
          <strong>Educational Disclaimer:</strong> FocusMode Player is an independent educational productivity software suite. Video lecture embeds are streamed via public YouTube API endpoints. All educational course materials, logos, and creator rights belong solely to their respective copyright holders.
        </div>

      </div>
    </div>
  );
};
