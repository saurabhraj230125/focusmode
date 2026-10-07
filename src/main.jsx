import React from 'react'
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    r && setInterval(() => {
      r.update();
    }, 60 * 60 * 1000); // Check for updates hourly
  },
  onNeedRefresh() {
    updateSW(true); // Automatically refresh when a new update is ready
  }
})

import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import PWAInstallPrompt from './PWAInstallPrompt.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <PWAInstallPrompt />
  </React.StrictMode>,
)

// Force reload across all tabs when a new update is pushed
let refreshing = false;
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });
}
