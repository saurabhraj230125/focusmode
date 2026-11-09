import React, { useEffect, useState } from 'react';
import { 
  Shield, Lock, Eye, Cookie, ArrowLeft, ExternalLink, 
  CheckCircle, Copy, Check, Info, FileText, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy = ({ onBack }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "Privacy Policy | FocusMode Player";
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
      {/* Top Navigation Bar */}
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
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>Google AdSense Compliant · 2026</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass" style={{
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        borderRadius: '24px',
        border: '1px solid rgba(139, 92, 246, 0.25)',
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          borderRadius: '100px',
          background: 'rgba(139,92,246,0.18)',
          border: '1px solid rgba(139,92,246,0.3)',
          color: '#c4b5fd',
          fontSize: '0.78rem',
          fontWeight: 800,
          marginBottom: '1rem'
        }}>
          <Shield size={14} /> OFFICIAL PUBLISHER LEGAL DISCLOSURE
        </div>
        <h1 style={{
          fontSize: 'clamp(1.85rem, 5vw, 2.75rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 10px',
          letterSpacing: '-0.5px',
          lineHeight: 1.2
        }}>
          Privacy Policy
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
          Effective Date: January 1, 2026 · Last Updated: November 9, 2026 · Publisher: FocusMode Player
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
            { id: 'adsense-cookies', label: '🍪 Google AdSense & Cookies', highlight: true },
            { id: 'data-collected', label: 'Data Collected' },
            { id: 'opt-out', label: 'Cookie Control & Opt-Out' },
            { id: 'ccpa-gdpr', label: 'CCPA & GDPR Rights' },
            { id: 'coppa', label: 'COPPA (Kids)' },
            { id: 'contact', label: 'Contact Us' }
          ].map(pill => (
            <button
              key={pill.id}
              onClick={() => scrollToSection(pill.id)}
              style={{
                background: pill.highlight ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: pill.highlight ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: pill.highlight ? '#fbbf24' : '#cbd5e1',
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

      {/* Content Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        
        {/* 1. Introduction */}
        <section className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>1.</span> Introduction & Scope
          </h2>
          <p>
            Welcome to <strong>FocusMode Player</strong> ("we", "our", or "us"), available at{' '}
            <span style={{ color: '#c4b5fd', fontWeight: 600 }}>https://focusmode.app</span>. FocusMode Player is an educational web platform engineered to help students, learners, and competitive exam aspirants (including JEE, NEET, UPSC, SAT, and Board examination students) achieve deep focus through synchronized lecture study, timestamped note-taking, and ambient focus soundscapes.
          </p>
          <p style={{ margin: 0 }}>
            We respect your privacy and are committed to safeguarding it through strict adherence to transparent policies. This Privacy Policy details our practices regarding information collection, cookie usage, third-party advertising disclosures, and your data protection rights.
          </p>
        </section>

        {/* 2. Google AdSense & Third-Party Cookies (CRITICAL MANDATORY POLICY SECTION) */}
        <section 
          id="adsense-cookies"
          className="glass" 
          style={{
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: '20px',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            background: 'linear-gradient(145deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.75) 100%)'
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '100px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontSize: '0.74rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            <Cookie size={13} /> MANDATORY GOOGLE ADSENSE DISCLOSURE
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            2. Google AdSense & Third-Party Advertising Vendors
          </h2>

          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '1.25rem',
            borderRadius: '14px',
            borderLeft: '4px solid #f59e0b',
            marginBottom: '1.25rem'
          }}>
            <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
              Standard Publisher Disclosure Required by Google:
            </p>
            <ul style={{ margin: '8px 0 0', paddingLeft: '1.25rem', color: '#e2e8f0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Third-Party Vendors:</strong> Third-party vendors, including <strong>Google</strong>, use cookies to serve advertisements based on a user's prior visits to FocusMode Player or other websites across the Internet.
              </li>
              <li>
                <strong>Advertising Cookies:</strong> Google's use of advertising cookies enables it and its partners to serve relevant advertisements to our users based on their visits to our site and/or other websites on the Internet.
              </li>
              <li>
                <strong>Personalized Ad Opt-Out:</strong> Users may opt out of personalized advertising at any time by visiting{' '}
                <a 
                  href="https://www.google.com/settings/ads" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{ color: '#38bdf8', textDecoration: 'underline', fontWeight: 700 }}
                >
                  Google Ads Settings <ExternalLink size={12} style={{ display: 'inline' }} />
                </a>.
              </li>
            </ul>
          </div>

          <p>
            Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting the Digital Advertising Alliance consumer choices portal at{' '}
            <a 
              href="https://www.aboutads.info/choices/" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#38bdf8', textDecoration: 'underline' }}
            >
              www.aboutads.info/choices
            </a>{' '}
            or the Network Advertising Initiative opt-out page at{' '}
            <a 
              href="https://optout.networkadvertising.org/" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#38bdf8', textDecoration: 'underline' }}
            >
              optout.networkadvertising.org
            </a>.
          </p>

          <p style={{ margin: 0 }}>
            These third-party ad networks and ad servers may employ technologies such as cookies, JavaScript, or Web Beacons within their advertisements to gauge campaign effectiveness and personalize promotional messaging. FocusMode Player maintains no access to, nor control over, cookies utilized by third-party advertising vendors.
          </p>
        </section>

        {/* 3. Log Files */}
        <section className="glass" style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>3.</span> Standard Log Files
          </h2>
          <p style={{ margin: 0 }}>
            FocusMode Player follows industry-standard server logging procedures. When visitors access our website, standard log files may capture information including Internet Protocol (IP) addresses, browser type, Internet Service Provider (ISP), date/time stamps, referring/exit pages, and click counts. These data points are not linked to personally identifiable information; they are utilized strictly for systems administration, diagnostic analysis, and performance monitoring.
          </p>
        </section>

        {/* 4. Information We Collect Directly */}
        <section 
          id="data-collected"
          className="glass" 
          style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>4.</span> Information We Collect & Privacy-First Architecture
          </h2>
          <p>
            Unlike traditional social study platforms that track every keystroke, FocusMode Player is built on a <strong>client-first, local-storage architecture</strong>:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={15} color="var(--accent-physics)" /> Local Study Data
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
                Your study schedules, lecture bookmarks, Pomodoro sprint counts, and mistake revision notes remain on your device's browser memory (`localStorage`).
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.25rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={15} color="var(--accent-chem)" /> Account Profiles
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.84rem', margin: 0 }}>
                When creating an optional profile, you provide a display username and examination aim (e.g. JEE, NEET, UPSC). We never request real government IDs or payment data.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Cookie Management */}
        <section 
          id="opt-out"
          className="glass" 
          style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>5.</span> How to Manage or Disable Cookies in Your Browser
          </h2>
          <p>
            You have full freedom to disable cookies via your browser settings. Instructions for standard browsers:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
            <li><strong>Google Chrome:</strong> Settings → Privacy and security → Third-party cookies</li>
            <li><strong>Mozilla Firefox:</strong> Settings → Privacy & Security → Enhanced Tracking Protection</li>
            <li><strong>Apple Safari:</strong> Settings → Safari → Advanced → Block All Cookies</li>
            <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies</li>
          </ul>
        </section>

        {/* 6. CCPA Privacy Rights */}
        <section 
          id="ccpa-gdpr"
          className="glass" 
          style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>6.</span> CCPA & GDPR Privacy Rights
          </h2>
          <p>
            Regardless of your geographical location, we afford you full transparency and control over your personal data:
          </p>
          <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li><strong>Do Not Sell My Personal Information:</strong> We do not sell, rent, or trade user data to third parties.</li>
            <li><strong>Right to Access & Portability:</strong> You may request an export of any stored account data.</li>
            <li><strong>Right to Deletion:</strong> You can erase your local test data or request complete account erasure at any time.</li>
          </ul>
        </section>

        {/* 7. COPPA Compliance */}
        <section 
          id="coppa"
          className="glass" 
          style={{ padding: 'clamp(1.25rem, 3vw, 2rem)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>7.</span> Children's Privacy (COPPA Compliance)
          </h2>
          <p style={{ margin: 0 }}>
            Protecting younger learners is critical. FocusMode Player does not intentionally collect personally identifiable information from children under the age of 13. If you believe your child has submitted personal details on our site, please contact our privacy representative immediately so we may promptly expunge such records.
          </p>
        </section>

        {/* 8. Contact Information */}
        <section 
          id="contact"
          className="glass" 
          style={{
            padding: 'clamp(1.25rem, 3vw, 2rem)',
            borderRadius: '20px',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)'
          }}
        >
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: 0, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: 'var(--accent-physics)' }}>8.</span> Privacy Officer & Publisher Contact
          </h2>
          <p>
            If you have questions regarding this Privacy Policy, cookie compliance, or advertising disclosures, reach out directly:
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
            <div><strong style={{ color: '#fff' }}>Platform:</strong> FocusMode Player</div>
            <div><strong style={{ color: '#fff' }}>Publisher & Developer:</strong> Saurabh Raj</div>
            <div><strong style={{ color: '#fff' }}>Jurisdiction:</strong> India</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
              <strong style={{ color: '#fff' }}>Official Privacy Email:</strong>
              <code style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', padding: '3px 8px', borderRadius: '6px', fontSize: '0.88rem' }}>
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
              <strong>Expected Turnaround:</strong> Inquiries addressed within 24–48 business hours.
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
