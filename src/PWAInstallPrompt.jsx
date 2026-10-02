import React, { useEffect, useState } from 'react';
import { X, Download, Share } from 'lucide-react';

const PWAInstallPrompt = () => {
  const [prompt, setPrompt] = useState(null); // beforeinstallprompt event
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed (running in standalone/fullscreen mode)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    // Don't show if user already dismissed once
    const alreadyDismissed = localStorage.getItem('pwa_install_dismissed');

    if (isStandalone || alreadyDismissed) return;

    // Detect iOS Safari (no beforeinstallprompt support)
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.MSStream;
    setIsIOS(ios);

    if (ios) {
      // Show iOS instructions after a short delay
      setTimeout(() => setShow(true), 2000);
      return;
    }

    // Android / Chrome — listen for the native prompt event
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 2000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      dismiss();
    }
  };

  const dismiss = () => {
    setShow(false);
    setDismissed(true);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  if (!show || dismissed) return null;

  return (
    <>
      {/* Backdrop blur overlay */}
      <div className="pwa-backdrop" onClick={dismiss} />

      {/* Bottom Sheet Install Banner */}
      <div className="pwa-install-sheet">
        {/* Handle bar */}
        <div className="pwa-handle" />

        <div className="pwa-sheet-content">
          {/* Close */}
          <button className="pwa-close-btn" onClick={dismiss} aria-label="Dismiss">
            <X size={18} />
          </button>

          {/* App icon + info */}
          <div className="pwa-app-info">
            <img src="/icon.jpg" alt="FocusMode App Icon" className="pwa-app-icon" />
            <div className="pwa-app-text">
              <h3 className="pwa-app-name">FocusModePlayer</h3>
              <p className="pwa-app-desc">Install as an app for the best experience</p>
              <div className="pwa-badges">
                <span className="pwa-badge">📴 Works Offline</span>
                <span className="pwa-badge">⚡ Fast</span>
                <span className="pwa-badge">🔔 Notifications</span>
              </div>
            </div>
          </div>

          {isIOS ? (
            // iOS instructions
            <div className="pwa-ios-steps">
              <p className="pwa-ios-title">Add to Home Screen:</p>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">1</span>
                <span>Tap the <strong><Share size={13} style={{display:'inline', verticalAlign:'middle'}} /> Share</strong> button in Safari</span>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">2</span>
                <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">3</span>
                <span>Tap <strong>"Add"</strong> — done! 🎉</span>
              </div>
              <button className="pwa-dismiss-link" onClick={dismiss}>Maybe later</button>
            </div>
          ) : (
            // Android / Chrome CTA
            <div className="pwa-cta-row">
              <button className="pwa-install-btn" onClick={handleInstall}>
                <Download size={18} />
                Install App
              </button>
              <button className="pwa-dismiss-link" onClick={dismiss}>Not now</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PWAInstallPrompt;
