import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Headphones, Shield, FileText, Mail, Info, Compass, Heart, ArrowUpRight, Cookie } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  const navigate = useNavigate();

  const handleLinkClick = (path, stepNumber) => {
    if (onNavigate) {
      onNavigate(path, stepNumber);
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openCookiePreferences = () => {
    window.dispatchEvent(new Event('pm_open_cookie_settings'));
  };

  return (
    <footer 
      role="contentinfo"
      style={{
        width: '100%',
        maxWidth: '100vw',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(5, 4, 13, 0.98) 100%)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '3.5rem 1.25rem 2.5rem',
        color: '#94a3b8',
        fontSize: '0.88rem',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        overflowX: 'hidden'
      }}
    >
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
        gap: '2.5rem',
        marginBottom: '2.5rem',
        boxSizing: 'border-box'
      }}>
        {/* Column 1: Brand & Mission */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div 
            onClick={() => handleLinkClick('/', 0)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', width: 'fit-content' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(139,92,246,0.35)'
            }}>
              <Headphones size={18} color="#fff" />
            </div>
            <span style={{
              fontWeight: 900,
              fontSize: '1.2rem',
              color: '#fff',
              letterSpacing: '-0.5px'
            }}>
              FocusMode <span style={{ color: '#ec4899' }}>Player</span>
            </span>
          </div>

          <p style={{ lineHeight: 1.6, color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>
            The hyper-focused study theater and cognitive productivity ecosystem. Engineered to help serious aspirants defeat algorithmic distraction and conquer competitive examinations.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.8rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
            <span>AdSense & Privacy Policy Compliant</span>
          </div>
        </div>

        {/* Column 2: Legal & Publisher Policies (Mandatory for AdSense) */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} color="var(--accent-physics)" /> Legal & Policies
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <button
                onClick={() => handleLinkClick('/privacy-policy', 7)}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer',
                  fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <span>Privacy Policy</span> <ArrowUpRight size={13} opacity={0.6} />
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('/terms-of-service', 8)}
                style={{
                  background: 'none', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer',
                  fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '4px'
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <span>Terms of Service</span> <ArrowUpRight size={13} opacity={0.6} />
              </button>
            </li>
            <li>
              <button
                onClick={openCookiePreferences}
                style={{
                  background: 'none', border: 'none', color: '#fbbf24', padding: 0, cursor: 'pointer',
                  fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Cookie size={14} color="#fbbf24" />
                <span>Cookie Preferences</span>
              </button>
            </li>
            <li>
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <span>Google Ad Choices / Opt-Out</span> <ArrowUpRight size={12} opacity={0.6} />
              </a>
            </li>
            <li>
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                <span>AboutAds Consumer Choices</span> <ArrowUpRight size={12} opacity={0.6} />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Platform Resources */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Compass size={16} color="var(--accent-math)" /> FocusMode
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li>
              <button
                onClick={() => handleLinkClick('/about', 5)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                About FocusMode Player
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('/mission', 6)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                Our Mission & Vision
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('/blog', 4)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                Study Techniques & Blog
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('/contact', 9)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', padding: 0, cursor: 'pointer', fontSize: '0.88rem', textAlign: 'left', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
              >
                Contact & Support Desk
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Verification */}
        <div>
          <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mail size={16} color="var(--accent-chem)" /> Publisher Contact
          </h4>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1rem', color: '#94a3b8' }}>
            Have questions regarding our publisher terms, educational resources, or advertising disclosures?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem' }}>
            <div style={{ color: '#cbd5e1' }}>
              <strong>Email:</strong>{' '}
              <a href="mailto:saurabhraj230125@gmail.com" style={{ color: '#c4b5fd', textDecoration: 'none' }}>
                saurabhraj230125@gmail.com
              </a>
            </div>
            <div style={{ color: '#94a3b8' }}>
              <strong>Support:</strong> 24–48 hours turnaround
            </div>
            <div style={{ color: '#94a3b8' }}>
              <strong>Location:</strong> India
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Google AdSense & Third-Party Vendor Cookie Notice Bar */}
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '2rem',
        fontSize: '0.8rem',
        lineHeight: 1.6,
        color: '#64748b',
        boxSizing: 'border-box'
      }}>
        <strong style={{ color: '#94a3b8' }}>AdSense & Third-Party Vendor Notice:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to FocusMode Player and/or other sites on the Internet. Users may opt out of personalized advertising by visiting{' '}
        <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', textDecoration: 'underline' }}>
          Google Ads Settings
        </a>
        .
      </div>

      {/* Bottom Copyright Strip */}
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        paddingTop: '1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.8rem',
        color: '#64748b',
        boxSizing: 'border-box'
      }}>
        <div>
          © {new Date().getFullYear()} FocusMode Player. All rights reserved. Built for student focus.
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
            onClick={() => handleLinkClick('/privacy-policy', 7)} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
          >
            Privacy
          </button>
          <span>·</span>
          <button 
            onClick={() => handleLinkClick('/terms-of-service', 8)} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
          >
            Terms
          </button>
          <span>·</span>
          <button 
            onClick={() => handleLinkClick('/contact', 9)} 
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.8rem', padding: 0 }}
          >
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
};
