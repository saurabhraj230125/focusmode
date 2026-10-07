import React, { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';
import { trackPWAInstallPromptShown, trackPWAInstalled, trackPWADismissed } from './analytics.js';

const PWAInstallPrompt = () => {
  const MAX_SHOWS = 3;
  const [prompt, setPrompt] = useState(null); // beforeinstallprompt event
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showCount, setShowCount] = useState(1);

  useEffect(() => {
    // Don't show if currently running in standalone/fullscreen mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      localStorage.setItem('pwa_installed', 'true');
      return;
    }

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(ios);

    const alreadyInstalled = localStorage.getItem('pwa_installed');

    // We will show the prompt after a delay, regardless of beforeinstallprompt, 
    // to ensure they ALWAYS get reminded if not installed.
    const showTimer = setTimeout(() => {
      const prev = parseInt(localStorage.getItem('pwa_dismiss_count') || '0', 10);
      if (!alreadyInstalled && prev < MAX_SHOWS) {
        setShow(true);
        trackPWAInstallPromptShown(prev + 1);
      }
    }, 2500);

    const onInstalled = () => {
      localStorage.setItem('pwa_installed', 'true');
      setShow(false);
      setDismissed(true);
    };
    window.addEventListener('appinstalled', onInstalled);

    const handler = (e) => {
      e.preventDefault();
      
      // If we receive this event, it means the app is NOT installed right now.
      if (localStorage.getItem('pwa_installed') === 'true') {
        localStorage.removeItem('pwa_installed');
      }

      setPrompt(e);
      // We don't need to manually setShow here because the timeout above handles it, 
      // but we can make it immediate if it fires late.
      const prev = parseInt(localStorage.getItem('pwa_dismiss_count') || '0', 10);
      if (prev < MAX_SHOWS) {
        setShow(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      clearTimeout(showTimer);
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!prompt) {
      // If they somehow click install without prompt (shouldn't happen with updated UI)
      alert("Please install manually from your browser's menu (⋮) -> 'Install App' or 'Add to Home screen'");
      return;
    }
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      trackPWAInstalled();
      localStorage.setItem('pwa_installed', 'true');
      setShow(false);
      setDismissed(true);
    }
  };

  const dismiss = () => {
    const prev = parseInt(localStorage.getItem('pwa_dismiss_count') || '0', 10);
    const next = prev + 1;
    trackPWADismissed(next);
    localStorage.setItem('pwa_dismiss_count', String(next));
    setShow(false);
    setDismissed(true);
  };

  if (!show || dismissed) return null;

  return (
    <>
      <div className="pwa-backdrop" onClick={dismiss} />
      <div className="pwa-install-sheet">
        <div className="pwa-handle" />
        <div className="pwa-sheet-content">
          <button className="pwa-close-btn" onClick={dismiss} aria-label="Dismiss">
            <X size={18} />
          </button>

          <div className="pwa-app-info">
            <img src="/icon.jpg" alt="FocusMode App Icon" className="pwa-app-icon" />
            <div className="pwa-app-text">
              <h3 className="pwa-app-name">FocusMode</h3>
              <p className="pwa-app-desc">Install as an app for the best experience</p>
              <div className="pwa-badges" style={{marginTop: '4px'}}>
                <span className="pwa-badge">📴 Works Offline</span>
                <span className="pwa-badge">⚡ Fast</span>
                <span className="pwa-badge">🔔 Notifications</span>
              </div>
            </div>
          </div>

          {isIOS ? (
            <div className="pwa-ios-steps">
              <p className="pwa-ios-title">Add to Home Screen (iOS):</p>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">1</span>
                <span>Tap <strong><Share size={13} style={{display:'inline', verticalAlign:'middle'}} /> Share</strong> in Safari</span>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </div>
              <button className="pwa-dismiss-link" onClick={dismiss}>Maybe later</button>
            </div>
          ) : prompt ? (
            <div className="pwa-cta-row">
              <button className="pwa-install-btn" onClick={handleInstall}>
                <Download size={18} />
                Install App
              </button>
              <button className="pwa-dismiss-link" onClick={dismiss}>Not now</button>
            </div>
          ) : (
            <div className="pwa-ios-steps">
              <p className="pwa-ios-title">Install Manually (Android/Chrome):</p>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">1</span>
                <span>Tap the <strong>⋮ (3 dots)</strong> menu in your browser</span>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">2</span>
                <span>Select <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong></span>
              </div>
              <button className="pwa-dismiss-link" onClick={dismiss}>I'll do it later</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PWAInstallPrompt;
