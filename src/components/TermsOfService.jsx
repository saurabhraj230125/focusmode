import React, { useEffect, useState } from 'react';
import { 
  FileText, ArrowLeft, CheckCircle2, AlertTriangle, 
  ShieldCheck, ExternalLink, Copy, Check, Scale 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsOfService = ({ onBack }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "Terms of Service | FocusMode Player";
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText('saurabhraj230125@gmail.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
          <Scale size={14} color="#f472b6" />
          <span>Governing Terms · Updated November 2026</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass" style={{
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        borderRadius: '24px',
        border: '1px solid rgba(236, 72, 153, 0.25)',
        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          borderRadius: '100px',
          background: 'rgba(236, 72, 153, 0.18)',
          border: '1px solid rgba(236, 72, 153, 0.3)',
          color: '#f472b6',
          fontSize: '0.78rem',
          fontWeight: 800,
          marginBottom: '1rem'
        }}>
          <FileText size={14} /> TERMS & CONDITIONS OF USE
        </div>
        <h1 style={{
          fontSize: 'clamp(1.85rem, 5vw, 2.75rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 10px',
          letterSpacing: '-0.5px',
          lineHeight: 1.2
        }}>
          Terms of Service
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
          Effective Date: January 1, 2026 · Last Updated: November 9, 2026 · Applicable Worldwide
        </p>

        {/* Quick Jump Pills */}
        <div style={{
          marginTop: '1.5rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', alignSelf: 'center', marginRight: '4px' }}>Jump to:</span>
          {[
            { id: 'agreement', label: '1. Agreement' },
            { id: 'services', label: '2. Educational Features' },
            { id: 'youtube-api', label: '3. YouTube API Terms', highlight: true },
            { id: 'acceptable-use', label: '4. Acceptable Use' },
            { id: 'ip-rights', label: '5. IP Rights' },
            { id: 'disclaimer', label: '6. Disclaimer & Liability' },
            { id: 'contact', label: '7. Inquiries' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => scrollToSection(pill.id)}
              style={{
                background: pill.highlight ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: pill.highlight ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: pill.highlight ? '#f472b6' : '#cbd5e1',
                padding: '4px 12px',
                borderRadius: '100px',
                fontSize: '0.78rem',
                fontWeight: pill.highlight ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* 1. Agreement */}
        <section id="agreement" className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem' }}>
            1. Agreement to Terms
          </h2>
          <p>
            These Terms of Service constitute a legally binding agreement made between you ("User" or "you") and <strong>FocusMode Player</strong> ("we", "us", or "our"), regarding your access to and use of the FocusMode Player web application located at <span style={{ color: '#c4b5fd', fontWeight: 600 }}>https://focusmode.app</span>.
          </p>
          <p style={{ margin: 0 }}>
            By accessing or using our application, you acknowledge that you have read, understood, and agreed to be bound by all of these Terms of Service. If you do not agree with any of these terms, you are expressly prohibited from using the platform and must discontinue use immediately.
          </p>
        </section>

        {/* 2. Educational Service Description */}
        <section id="services" className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem' }}>
            2. Description of the Educational Service
          </h2>
          <p>
            FocusMode Player is an educational productivity application created to assist self-studying students and aspirants preparing for competitive examinations (including JEE, NEET, UPSC, SAT, and Board exams). Primary functionalities include:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
            <li>Distraction-reduced video lecture theater player with synchronized timestamp note-taking.</li>
            <li>Embedded study timers (custom Pomodoro study sprints and recovery intervals).</li>
            <li>Procedural web audio synthesis for offline ambient focus soundscapes (rain, binaural beats, study noise).</li>
            <li>Client-side study scheduling, syllabus tracking, and daily focus streak gamification.</li>
          </ul>
        </section>

        {/* 3. YouTube API Services Terms (CRITICAL COMPLIANCE) */}
        <section 
          id="youtube-api"
          className="glass" 
          style={{
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%)'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <ExternalLink size={13} /> THIRD-PARTY API COMPLIANCE
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f87171', marginTop: 0, marginBottom: '1rem' }}>
            3. YouTube API Services Terms of Service
          </h2>
          <p>
            FocusMode Player utilizes YouTube API Services to allow students to search and play educational video lectures from public content creators in an embedded theater player.
          </p>
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '1.25rem',
            borderRadius: '14px',
            borderLeft: '4px solid #ef4444',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
              Notice to All Users:
            </p>
            <p style={{ margin: '6px 0 0', color: '#e2e8f0', fontSize: '0.9rem' }}>
              By utilizing FocusMode Player's video lecture player, you are also bound by the{' '}
              <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 700 }}>
                YouTube Terms of Service
              </a>{' '}
              and the{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 700 }}>
                Google Privacy Policy
              </a>.
            </p>
          </div>
          <p style={{ margin: 0 }}>
            FocusMode Player respects intellectual property and does not download, re-host, scrape, or monetize copyrighted video lecture content. All video views and metrics attribute directly to the respective original creators on YouTube.
          </p>
        </section>

        {/* 4. Acceptable Use Policy */}
        <section id="acceptable-use" className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem' }}>
            4. Acceptable Use & User Conduct
          </h2>
          <p>You agree to use FocusMode Player solely for lawful educational purposes. You agree not to:</p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
            <li>Attempt to circumvent, disable, or tamper with security-related features of the platform.</li>
            <li>Post or transmit abusive, harassing, defamatory, or unlawful content in community channels.</li>
            <li>Deploy automated bots, spiders, or scrapers without express written permission.</li>
            <li>Engage in any activity that impairs server performance or interferes with other learners.</li>
          </ul>
        </section>

        {/* 5. Intellectual Property Rights */}
        <section id="ip-rights" className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem' }}>
            5. Intellectual Property Rights
          </h2>
          <p style={{ margin: 0 }}>
            The FocusMode Player web application, including its source code, UI designs, sound generator algorithms, graphics, and trademarks, is owned and operated by Saurabh Raj. All rights not expressly granted are reserved. You are granted a limited, revocable, non-transferable license to access the platform for individual, non-commercial educational study.
          </p>
        </section>

        {/* 6. Disclaimers & Limitation of Liability */}
        <section id="disclaimer" className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem' }}>
            6. Disclaimers & Limitation of Liability
          </h2>
          <p>
            FocusMode Player is provided on an "AS-IS" and "AS-AVAILABLE" basis. While we strive for 100% uptime and smooth learning utility, we make no express or implied warranties that the service will be uninterrupted, error-free, or meet every student's specific examination results.
          </p>
          <p style={{ margin: 0 }}>
            In no event shall FocusMode Player, its developers, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this platform.
          </p>
        </section>

        {/* 7. Governing Law & Publisher Contact */}
        <section 
          id="contact"
          className="glass" 
          style={{
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: '20px',
            border: '1px solid rgba(236, 72, 153, 0.25)',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem' }}>
            7. Governing Law & Legal Inquiries
          </h2>
          <p>
            These Terms shall be governed by and defined following the laws of India. Any legal disputes shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '1.25rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div><strong style={{ color: '#fff' }}>Publisher:</strong> FocusMode Player (Saurabh Raj)</div>
            <div><strong style={{ color: '#fff' }}>Official Legal Email:</strong></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <code style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', padding: '3px 8px', borderRadius: '6px', fontSize: '0.88rem' }}>
                saurabhraj230125@gmail.com
              </code>
              <button
                onClick={copyEmail}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: copied ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: copied ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: copied ? '#34d399' : '#cbd5e1',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied to Clipboard!' : 'Copy Email'}
              </button>
            </div>
            <div style={{ marginTop: '4px', color: '#94a3b8', fontSize: '0.85rem' }}>
              Legal notices and policy correspondence receive prompt review within 24–48 hours.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
