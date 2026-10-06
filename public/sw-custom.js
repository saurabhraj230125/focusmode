// FocusMode Custom Service Worker
// Handles: Push Notifications + Offline Caching

// Required placeholder for vite-plugin-pwa injectManifest strategy
import { precacheAndRoute } from 'workbox-precaching';

const MANIFEST = self.__WB_MANIFEST || [];
precacheAndRoute(MANIFEST);

const CACHE_NAME = 'focusmode-v2';
const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';

// ==================== PUSH NOTIFICATIONS ====================

self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'FocusMode', body: event.data.text() };
  }

  const title = payload.title || 'FocusMode 📚';
  const options = {
    body: payload.body || 'You have a new notification!',
    icon: '/icon.jpg',
    badge: '/icon.jpg',
    tag: payload.tag || 'focusmode-notification',
    data: payload.url || '/',
    actions: [
      { action: 'open', title: '👀 View' },
      { action: 'dismiss', title: '✖ Dismiss' }
    ],
    vibrate: [100, 50, 100],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ==================== BACKGROUND SYNC (Re-engagement) ====================
// Polls Firebase every 30 minutes to detect new messages and show notification

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-messages') {
    event.waitUntil(checkForNewMessages());
  }
});

// Fallback: use message from main thread to schedule re-engagement
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CHECK_MESSAGES') {
    checkForNewMessages();
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function checkForNewMessages() {
  try {
    const lastCheck = await getFromDB('lastMessageCheck') || 0;
    const lastSeenUser = await getFromDB('sessionUser') || '';

    const res = await fetch(`${FIREBASE_URL}/focusmodeplayer/community.json?orderBy="createdAt"&limitToLast=5`);
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;

    const msgs = Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
    const latest = msgs[0];

    if (latest && latest.createdAt > lastCheck && latest.user !== lastSeenUser) {
      const appIsFocused = await isAppFocused();
      if (!appIsFocused) {
        await self.registration.showNotification('New message in FocusMode 💬', {
          body: `${latest.user}: ${latest.action.substring(0, 80)}`,
          icon: '/icon.jpg',
          badge: '/icon.jpg',
          tag: 'new-message',
          data: '/',
          vibrate: [200, 100, 200],
        });
      }
    }

    await saveToDB('lastMessageCheck', Date.now());
  } catch (e) {
    console.error('[SW] checkForNewMessages error:', e);
  }
}

async function isAppFocused() {
  const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  return allClients.some(c => c.focused);
}

// ==================== SIMPLE INDEXEDDB FOR SW STATE ====================

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('focusmode-sw', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('state');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToDB(key, value) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('state', 'readwrite');
    tx.objectStore('state').put(value, key);
    tx.oncomplete = resolve;
  });
}

async function getFromDB(key) {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction('state', 'readonly');
    const req = tx.objectStore('state').get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

// ==================== INSTALL / ACTIVATE ====================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
