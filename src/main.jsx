import React from 'react'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

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
