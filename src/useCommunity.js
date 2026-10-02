// ── useCommunity — Real-time Community Feed via Firebase Realtime Database ────
// Uses Firebase REST API + Server-Sent Events (SSE) for true real-time sync.
// No SDK needed — just fetch() and EventSource.
// Replace FIREBASE_URL below with your Firebase Realtime Database URL.

import { useState, useEffect, useCallback, useRef } from 'react';

// ⚠️ REPLACE THIS with your Firebase Realtime Database URL
// Example: https://your-project-default-rtdb.firebaseio.com
const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';
const POSTS_PATH = `${FIREBASE_URL}/focusmodeplayer/community`;

const MAX_POSTS = 80;

/**
 * Reads all posts once via REST GET
 */
const fetchPosts = async () => {
  try {
    const res = await fetch(`${POSTS_PATH}.json?orderBy="createdAt"&limitToLast=80`);
    if (!res.ok) return {};
    const data = await res.json();
    return data || {};
  } catch {
    return {};
  }
};

/**
 * Writes a new post via REST PUT
 */
const writePost = async (id, post) => {
  await fetch(`${POSTS_PATH}/${id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(post),
  });
};

/**
 * Patches specific fields on an existing post
 */
const patchPost = async (id, patch) => {
  await fetch(`${POSTS_PATH}/${id}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
};

const parsePostsMap = (data) => {
  if (!data || typeof data !== 'object') return [];
  return Object.entries(data)
    .map(([key, val]) => ({
      id: key,
      user: val.user || 'Anonymous',
      prep: val.prep || '',
      xp: val.xp || 0,
      action: val.action || '',
      time: val.time || 'just now',
      createdAt: val.createdAt || 0,
      likes: val.likes || 0,
      likedBy: Array.isArray(val.likedBy) ? val.likedBy : [],
      comments: Array.isArray(val.comments) ? val.comments : [],
    }))
    .filter(p => p.action)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, MAX_POSTS);
};

export const useCommunity = (sessionUser, currentXP, prepType) => {
  const [posts, setPosts] = useState([]);
  const sseRef = useRef(null);

  useEffect(() => {
    if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') {
      console.warn('useCommunity: FIREBASE_URL not configured — community feed will be empty');
      return;
    }

    // Initial load
    fetchPosts().then(data => setPosts(parsePostsMap(data)));

    // SSE real-time listener — Firebase Realtime Database natively supports SSE
    const url = `${POSTS_PATH}.json`;
    const es = new EventSource(url);
    sseRef.current = es;

    const handleEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.data === undefined) return;
        const path = payload.path;

        setPosts(prev => {
          const map = {};
          prev.forEach(p => { map[p.id] = p; });

          if (path === '/') {
            if (payload.data && typeof payload.data === 'object') {
              Object.entries(payload.data).forEach(([key, val]) => {
                if (val === null) delete map[key];
                else map[key] = { ...map[key], ...val, id: key };
              });
            } else if (payload.data === null) {
              return [];
            }
          } else {
            const segments = path.split('/').filter(Boolean);
            const postId = segments[0];

            if (segments.length === 1) {
              if (payload.data === null) {
                delete map[postId];
              } else {
                map[postId] = { ...map[postId], ...payload.data, id: postId };
              }
            } else if (segments.length > 1 && map[postId]) {
               const field = segments[1];
               map[postId][field] = payload.data;
            }
          }

          // Format all mapped posts safely
          return Object.values(map)
            .map(val => ({
              id: val.id,
              user: val.user || 'Anonymous',
              prep: val.prep || '',
              xp: val.xp || 0,
              action: val.action || '',
              time: val.time || 'just now',
              createdAt: val.createdAt || 0,
              likes: val.likes || 0,
              likedBy: Array.isArray(val.likedBy) ? val.likedBy : [],
              comments: Array.isArray(val.comments) ? val.comments : [],
            }))
            .filter(p => p.action)
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_POSTS);
        });
      } catch {}
    };

    es.addEventListener('put', handleEvent);
    es.addEventListener('patch', handleEvent);

    return () => {
      es.close();
    };
  }, []);

  const postMessage = useCallback(async (text) => {
    if (!text?.trim() || !FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;
    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    await writePost(id, {
      user: sessionUser,
      prep: prepType || '',
      xp: currentXP || 0,
      action: text.trim(),
      time: 'just now',
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
      comments: [],
    });
    return id;
  }, [sessionUser, currentXP, prepType]);

  const toggleLike = useCallback(async (postId) => {
    // Read current likedBy, then patch
    try {
      const res = await fetch(`${POSTS_PATH}/${postId}.json`);
      const data = await res.json();
      const likedBy = Array.isArray(data?.likedBy) ? data.likedBy : [];
      const hasLiked = likedBy.includes(sessionUser);
      const newLikedBy = hasLiked
        ? likedBy.filter(u => u !== sessionUser)
        : [...likedBy, sessionUser];
      await patchPost(postId, { likes: newLikedBy.length, likedBy: newLikedBy });
    } catch {}
  }, [sessionUser]);

  const addComment = useCallback(async (postId, text) => {
    if (!text?.trim()) return;
    try {
      const res = await fetch(`${POSTS_PATH}/${postId}.json`);
      const data = await res.json();
      const comments = Array.isArray(data?.comments) ? data.comments : [];
      const newComments = [
        ...comments,
        { user: sessionUser, text: text.trim(), time: 'just now', ts: Date.now() },
      ];
      await patchPost(postId, { comments: newComments });
    } catch {}
  }, [sessionUser]);

  return { posts, postMessage, toggleLike, addComment };
};
