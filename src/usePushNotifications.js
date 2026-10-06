// usePushNotifications.js
// Handles Web Push subscription, permission requests, and re-engagement scheduling
// 100% Free: uses browser Web Push API + Firebase RTDB to store subscriptions

import { useState, useEffect, useCallback } from 'react';

const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';
const SUBS_PATH = `${FIREBASE_URL}/focusmodeplayer/push_subscriptions`;

// VAPID Public Key (generated once, safe to expose in client)
const VAPID_PUBLIC_KEY = 'BPS9sGE_QZvbXKRg0d-0Ue8xVByFUfa70QKxLnUo3k6sE3n9Nv0YIhA7Qzr79D5zDRcOpyjCLXgSVFI278YD6QU';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export function usePushNotifications(sessionUser) {
  const [permission, setPermission] = useState(() => {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default';
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Register and subscribe on mount if permission already granted
  useEffect(() => {
    if (!sessionUser) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    
    if (Notification.permission === 'granted') {
      subscribePush(sessionUser);
    }

    // Schedule re-engagement check every 30 minutes via SW message
    const interval = setInterval(() => {
      navigator.serviceWorker.ready.then(reg => {
        if (reg.active) {
          reg.active.postMessage({ type: 'CHECK_MESSAGES' });
        }
      });
    }, 30 * 60 * 1000);

    // 24-hour re-engagement: if user hasn't opened in 24h, show a nudge
    scheduleReEngagement();

    return () => clearInterval(interval);
  }, [sessionUser]);

  const scheduleReEngagement = () => {
    const last = parseInt(localStorage.getItem('fm_last_visit') || '0');
    const now = Date.now();
    localStorage.setItem('fm_last_visit', now.toString());

    // If more than 23 hours have passed since last visit, show a welcome back notification
    if (last && (now - last) > 23 * 60 * 60 * 1000) {
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('Welcome back to FocusMode! 🔥', {
              body: "Your study streak is waiting. Let's hit those goals today!",
              icon: '/icon.jpg',
              badge: '/icon.jpg',
              tag: 're-engagement',
              vibrate: [100, 50, 100],
              data: '/',
            });
          });
        }
      }, 2000);
    }
  };

  const subscribePush = useCallback(async (user) => {
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      setIsSubscribed(true);

      // Save subscription to Firebase indexed by user
      const key = btoa(sub.endpoint).slice(-30).replace(/[/+=]/g, '_');
      await fetch(`${SUBS_PATH}/${encodeURIComponent(user || 'anon')}/${key}.json`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          user: user || 'anon',
          updatedAt: Date.now(),
        }),
      });

      // Save session user to SW so it can filter own messages
      if (reg.active) {
        reg.active.postMessage({ type: 'SET_USER', user });
      }
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications.');
      return;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted' && sessionUser) {
      await subscribePush(sessionUser);
    }
    
    return result;
  }, [sessionUser, subscribePush]);

  // Trigger a local notification immediately (for testing / message alerts)
  const showLocalNotification = useCallback(async (title, body, tag = 'message') => {
    if (Notification.permission !== 'granted') return;
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      body,
      icon: '/icon.jpg',
      badge: '/icon.jpg',
      tag,
      vibrate: [100, 50, 100],
      data: '/',
    });
  }, []);

  return { permission, isSubscribed, requestPermission, showLocalNotification };
}
