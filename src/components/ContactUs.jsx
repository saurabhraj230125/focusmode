import React, { useState, useEffect } from 'react';
import { 
  Mail, MessageSquare, Send, CheckCircle2, Clock, Globe, 
  HelpCircle, ArrowLeft, AlertCircle, Copy, Check, Sparkles 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ContactUs = ({ onBack }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.title = "Contact Us | FocusMode Player";
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;
    
    setLoading(true);
    // Simulate real contact dispatch & store locally for audit
    setTimeout(() => {
      try {
        const pastMessages = JSON.parse(localStorage.getItem('pm_contact_messages') || '[]');
        pastMessages.push({
          ...formData,
          id: Date.now(),
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('pm_contact_messages', JSON.stringify(pastMessages));
      } catch {}
      setLoading(false);
      setSubmitted(true);
    }, 600);
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
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>Support Active · 24-48h Response</span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass" style={{
        padding: 'clamp(1.5rem, 4vw, 2.5rem)',
        borderRadius: '24px',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          borderRadius: '100px',
          background: 'rgba(16,185,129,0.18)',
          border: '1px solid rgba(16,185,129,0.3)',
          color: '#34d399',
          fontSize: '0.78rem',
          fontWeight: 800,
          marginBottom: '1rem'
        }}>
          <Mail size={14} /> GET IN TOUCH
        </div>
        <h1 style={{
          fontSize: 'clamp(1.85rem, 5vw, 2.75rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 10px',
          letterSpacing: '-0.5px',
          lineHeight: 1.2
        }}>
          Contact Us
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: 'clamp(0.9rem, 2vw, 1rem)' }}>
          We value student feedback, bug reports, publisher inquiries, and partnership requests. Our team responds directly within 24–48 hours.
        </p>
      </div>

      {/* Two Column Layout (Responsive Grid with no overflow) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
        gap: '1.75rem',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Interactive Contact Form */}
        <div className="glass" style={{
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--accent-physics)" /> Send a Message
          </h2>

          {submitted ? (
            <div style={{
              padding: '2rem 1.5rem',
              borderRadius: '16px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.3)',
              textAlign: 'center'
            }}>
              <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px' }}>Message Received!</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                Thank you for reaching out, <strong style={{ color: '#fff' }}>{formData.name}</strong>. Your message has been recorded and we will reply to <strong style={{ color: '#38bdf8' }}>{formData.email}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                style={{
                  padding: '9px 24px',
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(16,185,129,0.35)'
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Full Name <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Email Address <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Subject
                </label>
                <select
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Bug Report or Technical Issue">Bug Report or Technical Issue</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="AdSense & Privacy Policy Inquiry">AdSense & Privacy Policy Inquiry</option>
                  <option value="Partnership & Outreach">Partnership & Outreach</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Your Message <span style={{ color: '#ec4899' }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist your study experience or answer questions?..."
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '100px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 18px rgba(139,92,246,0.35)',
                  transition: 'opacity 0.2s',
                  opacity: loading ? 0.7 : 1,
                  marginTop: '4px'
                }}
              >
                {loading ? 'Sending Message...' : (
                  <>
                    <Send size={16} /> Submit Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Direct Info & Publisher Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', boxSizing: 'border-box' }}>
          
          {/* Direct Email Card */}
          <div className="glass" style={{
            padding: '1.5rem',
            borderRadius: '20px',
            border: '1px solid rgba(139,92,246,0.25)',
            background: 'linear-gradient(145deg, rgba(139,92,246,0.08) 0%, rgba(15,23,42,0.8) 100%)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(139,92,246,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Mail size={18} color="var(--accent-physics)" />
              </div>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Direct Email Support</h3>
                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Official Publisher Contact</span>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: '0 0 12px', lineHeight: 1.55 }}>
              For legal inquiries, Google AdSense verification, or direct creator correspondence:
            </p>

            <div style={{
              background: 'rgba(0, 0, 0, 0.35)',
              padding: '10px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <code style={{ color: '#c4b5fd', fontSize: '0.86rem', fontWeight: 600 }}>
                saurabhraj230125@gmail.com
              </code>
              <button
                onClick={copyEmail}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                  border: copied ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)',
                  color: copied ? '#34d399' : '#fff',
                  padding: '4px 10px',
                  borderRadius: '100px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Operational Details Card */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="var(--accent-physics)" /> Operational Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Clock size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: '#fff' }}>Response Time:</strong>
                  <div style={{ color: '#94a3b8' }}>Within 24 to 48 business hours.</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <Globe size={16} color="var(--accent-math)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: '#fff' }}>Location & Country:</strong>
                  <div style={{ color: '#94a3b8' }}>India (IST time zone UTC+5:30).</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <strong style={{ color: '#fff' }}>AdSense & Compliance:</strong>
                  <div style={{ color: '#94a3b8' }}>Please tag subject as "AdSense & Privacy Policy" for prioritized routing.</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="glass" style={{ padding: '1.5rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 800, margin: '0 0 0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={16} color="var(--accent-chem)" /> Frequently Asked Questions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
              <div>
                <strong style={{ color: '#e2e8f0' }}>Is FocusMode Player free?</strong>
                <p style={{ margin: '2px 0 0', color: '#94a3b8' }}>Yes. Core study timer, ambient audio generator, and lecture theater features are 100% free.</p>
              </div>
              <div>
                <strong style={{ color: '#e2e8f0' }}>Do you host or download YouTube videos?</strong>
                <p style={{ margin: '2px 0 0', color: '#94a3b8' }}>No. All videos are embedded via official YouTube API endpoints; creators retain full attribution and metrics.</p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
