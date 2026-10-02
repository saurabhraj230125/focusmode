// ── useCommunity — Real-time Community Feed Hook ─────────────────────────────
// Uses Gun.js loaded from CDN (window.Gun) for cross-user real-time sync

import { useState, useEffect, useCallback, useRef } from 'react';

const MAX_POSTS = 80;
const APP_KEY = 'focusmodeplayer-v2';

const getGunDb = () => {
  if (typeof window === 'undefined' || !window.Gun) return null;
  if (!window._fmpGun) {
    window._fmpGun = window.Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://gunjs.herokuapp.com/gun',
      ],
      localStorage: true,
    });
  }
  return window._fmpGun.get(APP_KEY).get('community');
};

export const useCommunity = (sessionUser, currentXP, prepType) => {
  const [posts, setPosts] = useState([]);
  const incomingRef = useRef({});
  const listenerRef = useRef(null);

  useEffect(() => {
    // Gun might not be ready instantly (CDN load), retry until available
    let retries = 0;
    const tryConnect = () => {
      const db = getGunDb();
      if (!db) {
        if (retries++ < 20) {
          setTimeout(tryConnect, 500);
        }
        return;
      }

      // Listen for new/updated posts
      listenerRef.current = db.map().on((data, key) => {
        if (!data || !key || !data.action) return;

        incomingRef.current[key] = {
          id: key,
          user: data.user || 'Anonymous',
          prep: data.prep || '',
          xp: data.xp || 0,
          action: data.action || '',
          time: data.time || 'just now',
          createdAt: data.createdAt || 0,
          likes: data.likes || 0,
          likedBy: (() => { try { return JSON.parse(data.likedBy || '[]'); } catch { return []; } })(),
          comments: (() => { try { return JSON.parse(data.comments || '[]'); } catch { return []; } })(),
        };

        const sorted = Object.values(incomingRef.current)
          .filter(p => p.action)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, MAX_POSTS);

        setPosts(sorted);
      });
    };

    tryConnect();

    return () => {
      try {
        const db = getGunDb();
        if (db) db.map().off();
      } catch (e) { /* ignore */ }
    };
  }, []);

  const postMessage = useCallback((text) => {
    if (!text?.trim()) return;
    const db = getGunDb();
    if (!db) return;

    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    db.get(id).put({
      user: sessionUser,
      prep: prepType || '',
      xp: currentXP || 0,
      action: text.trim(),
      time: 'just now',
      createdAt: Date.now(),
      likes: 0,
      likedBy: '[]',
      comments: '[]',
    });
    return id;
  }, [sessionUser, currentXP, prepType]);

  const toggleLike = useCallback((postId) => {
    const db = getGunDb();
    if (!db) return;

    db.get(postId).once((data) => {
      if (!data) return;
      let likedBy = [];
      try { likedBy = JSON.parse(data.likedBy || '[]'); } catch {}
      const hasLiked = likedBy.includes(sessionUser);
      const newLikedBy = hasLiked
        ? likedBy.filter(u => u !== sessionUser)
        : [...likedBy, sessionUser];
      db.get(postId).put({
        likes: newLikedBy.length,
        likedBy: JSON.stringify(newLikedBy),
      });
    });
  }, [sessionUser]);

  const addComment = useCallback((postId, text) => {
    if (!text?.trim()) return;
    const db = getGunDb();
    if (!db) return;

    db.get(postId).once((data) => {
      if (!data) return;
      let comments = [];
      try { comments = JSON.parse(data.comments || '[]'); } catch {}
      const newComments = [
        ...comments,
        { user: sessionUser, text: text.trim(), time: 'just now', ts: Date.now() },
      ];
      db.get(postId).put({ comments: JSON.stringify(newComments) });
    });
  }, [sessionUser]);

  return { posts, postMessage, toggleLike, addComment };
};
