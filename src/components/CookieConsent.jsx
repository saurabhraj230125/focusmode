import React, { useState, useEffect } from 'react';
import { Cookie, Shield, Check, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CookieConsent = ({ onNavigate }) => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('pm_cookie_consent');
    if (!consent) {
      // Short delay for smooth appearance
      const timer = setTimeout(() => {
        setVisible(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for custom trigger to re-open consent settings from Footer
  useEffect(() => {
    const handleReopen = () => setVisible(true);
    window.addEventListener('pm_open_cookie_settings', handleReopen);
    return () => window.removeEventListener('pm_open_cookie_settings', handleReopen);
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('pm_cookie_consent', 'accepted');
    localStorage.setItem('pm_cookie_consent_date', new Date().toISOString());
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem('pm_cookie_consent', 'essential_only');
    localStorage.setItem('pm_cookie_consent_date', new Date().toISOString());
    setVisible(false);
  };

  const handleOpenPrivacy = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('/privacy-policy', 7);
    } else {
      navigate('/privacy-policy');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}
    >
      <div
        className="animate-slide-up"
        style={{
          pointerEvents: 'auto',
          width: '100%',
          maxWidth: '940px',
          background: 'rgba(15, 23, 42, 0.94)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '20px',
          padding: '18px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 25px rgba(245, 158, 11, 0.15)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          boxSizing: 'border-box'
        }}
      >
        {/* Left: Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: '1 1 340px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(217, 119, 6, 0.3))',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Cookie size={22} color="#fbbf24" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '0.98rem', letterSpacing: '-0.3px' }}>
                Cookie & AdSense Consent
              </span>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '100px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', fontWeight: 700 }}>
                Transparent
              </span>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.84rem', lineHeight: 1.55 }}>
              FocusMode Player and third-party advertising partners (such as <strong>Google AdSense</strong>) use cookies to analyze study traffic, maintain offline session data, and display non-intrusive educational advertisements. Learn more in our{' '}
              <button
                onClick={handleOpenPrivacy}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#fbbf24',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: 'inherit',
                  fontWeight: 600
                }}
              >
                Privacy Policy
              </button>.
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
          <button
            onClick={handleEssentialOnly}
            style={{
              padding: '9px 18px',
              borderRadius: '100px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#cbd5e1',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
          >
            Essential Only
          </button>
          <button
            onClick={handleAcceptAll}
            style={{
              padding: '9px 22px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              color: '#0f172a',
              fontSize: '0.84rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(245, 158, 11, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(245, 158, 11, 0.35)';
            }}
          >
            <Check size={16} strokeWidth={3} /> Accept All Cookies
          </button>
        </div>
      </div>
    </aside>
  );
};
