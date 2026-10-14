// ── useCommunity — Real-time Community Feed via Firebase Realtime Database ────
// Uses Firebase REST API + Server-Sent Events (SSE) for true real-time sync.
// No SDK needed — just fetch() and EventSource.
// Replace FIREBASE_URL below with your Firebase Realtime Database URL.

import { useState, useEffect, useCallback, useRef } from 'react';
import { detectUserCountry, getCountryData } from './countries.js';

// ⚠️ REPLACE THIS with your Firebase Realtime Database URL
// Example: https://your-project-default-rtdb.firebaseio.com
const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';
const POSTS_PATH = `${FIREBASE_URL}/focusmode/community`;
const USERS_PATH = `${FIREBASE_URL}/focusmode/users`;
const BANNED_PATH = `${FIREBASE_URL}/focusmode/bannedUsers`;

export const syncUserToFirebase = async (username, profile) => {
  if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;
  if (!username) return;
  try {
    const safeUsername = String(username).replace(/[.#$[\]/]/g, '_').trim();
    if (!safeUsername) return;
    
    // Accurately determine country
    const detected = detectUserCountry();
    const explicitCountry = profile?.country ? getCountryData(profile.country) : null;
    const countryObj = explicitCountry || (detected && detected.code !== 'OTHER' ? detected : getCountryData('OTHER'));

    const safeProfile = {
      ...(profile || {}),
      country: countryObj.name,
      countryFlag: countryObj.flag,
      countryCode: countryObj.code,
      lastActive: Date.now()
    };
    await fetch(`${USERS_PATH}/${safeUsername}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safeProfile),
    });
  } catch (e) {
    console.error("Error syncing user to firebase", e);
  }
};

/**
 * Moderation API: Ban, Unban, Remove user and purge posts
 */
export const fetchBannedUsers = async () => {
  if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return [];
  try {
    const res = await fetch(`${BANNED_PATH}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    return data && typeof data === 'object' ? Object.keys(data) : [];
  } catch {
    return [];
  }
};

export const banUserInFirebase = async (username, reason = 'Banned by moderator') => {
  if (!FIREBASE_URL || !username) return;
  try {
    await fetch(`${BANNED_PATH}/${username}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bannedAt: Date.now(), reason }),
    });
    await fetch(`${USERS_PATH}/${username}.json`, { method: 'DELETE' });
    await purgeUserPostsFromFirebase(username);
  } catch (err) {
    console.error("Error banning user in Firebase:", err);
  }
};

export const unbanUserInFirebase = async (username) => {
  if (!FIREBASE_URL || !username) return;
  try {
    await fetch(`${BANNED_PATH}/${username}.json`, { method: 'DELETE' });
  } catch (err) {
    console.error("Error unbanning user in Firebase:", err);
  }
};

export const removeUserFromFirebase = async (username) => {
  if (!FIREBASE_URL || !username) return;
  try {
    const safeUsername = String(username).replace(/[.#$[\]/]/g, '_').trim();
    if (!safeUsername) return;
    await fetch(`${USERS_PATH}/${safeUsername}.json`, { method: 'DELETE' });
    await purgeUserPostsFromFirebase(safeUsername);
  } catch (err) {
    console.error("Error removing user from Firebase:", err);
  }
};

export const purgeUserPostsFromFirebase = async (username) => {
  if (!FIREBASE_URL || !username) return 0;
  try {
    const posts = await fetchPosts();
    const deletePromises = [];
    Object.entries(posts || {}).forEach(([id, val]) => {
      if (val && val.user === username) {
        deletePromises.push(fetch(`${POSTS_PATH}/${id}.json`, { method: 'DELETE' }));
      }
    });
    await Promise.allSettled(deletePromises);
    return deletePromises.length;
  } catch (err) {
    console.error("Error purging user posts:", err);
    return 0;
  }
};

export const cleanupGuestUsersFromFirebase = async () => {
  if (!FIREBASE_URL) return 0;
  try {
    const res = await fetch(`${USERS_PATH}.json`);
    const users = await res.json();
    if (!users || typeof users !== 'object') return 0;
    const guestKeys = Object.keys(users).filter(k => k.startsWith('Guest_'));
    const deletePromises = guestKeys.map(k => fetch(`${USERS_PATH}/${k}.json`, { method: 'DELETE' }));
    await Promise.allSettled(deletePromises);
    return guestKeys.length;
  } catch (err) {
    console.error("Error cleaning up guest accounts:", err);
    return 0;
  }
};

/**
 * Reads all posts once via REST GET
 */
const fetchPosts = async () => {
  try {
    const res = await fetch(`${POSTS_PATH}.json`);
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

const ABUSIVE_WORDS = new Set([
  'madharchod', 'maderchod', 'randi', 'bsdk', 'gendu', 'gandu', 'chutiya', 
  'bhenchod', 'behenchod', 'bhosdike', 'bhosadi', 'laude', 'nigger', 'faggot',
  'muthiya', 'mutth', 'raand', 'bhosda', 'bhosada', 'machod', 'madarchod',
  'lawda', 'lond', 'loda', 'lode', 'lund', 'bhadwa', 'bhadwe', 'bhadwi',
  'bhand', 'chod', 'chut', 'chutiye', 'gaandu', 'haramkhor', 
  'harami', 'kuttiya', 'kameena', 'kaminey', 'kamine', 'machuda',
  'betichod', 'tatte', 'tatta', 'ullukepatthe',
  'chamar', 'bhangi', 'chinal', 'chinnal', 'bhosadike',
  'bhakchod', 'bakchod', 'bakchodi',
  'jhaat', 'jhatu', 'jhaatu', 'dalal', 'chutiyapa',
  'fuck', 'shit', 'bitch', 'whore', 'slut', 'dick', 
  'pussy', 'cunt', 'bastard', 'asshole', 'boobs', 'tits'
]);

const BAD_PHRASES = [
  'teri maa ki chut', 'teri ma ki chut', 'maa ki chut', 'ma ki chut',
  'bhen ke lode', 'bhen ki chut', 'behen ki chut', 'madar chod', 'madarchod',
  'maderchod', 'ullu ke patthe', 'gand mara', 'gaand mara', 'maa chuda', 'ma chuda',
  'beti chod', 'bhosadike'
];

export const containsAbuse = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  if (BAD_PHRASES.some(phrase => lowerText.includes(phrase))) return true;
  const words = lowerText.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean);
  return words.some(w => ABUSIVE_WORDS.has(w));
};

export const maskAbuse = (text) => {
  if (!text) return text;
  let maskedText = text;
  BAD_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    maskedText = maskedText.replace(regex, '***');
  });
  ABUSIVE_WORDS.forEach(badWord => {
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    maskedText = maskedText.replace(regex, '***');
  });
  return maskedText;
};

// DM utility functions for reliable community chat messaging
export const isDmBetween = (action, userA, userB) => {
  if (!action || !action.startsWith('@DM_')) return false;
  const firstSpace = action.indexOf(' ');
  const header = (firstSpace !== -1 ? action.slice(4, firstSpace) : action.slice(4)).toLowerCase();
  const uA = (userA || '').toLowerCase();
  const uB = (userB || '').toLowerCase();
  return header === `${uA}_${uB}` || header === `${uB}_${uA}`;
};

export const extractDmText = (action) => {
  if (!action || !action.startsWith('@DM_')) return action;
  const firstSpace = action.indexOf(' ');
  return firstSpace !== -1 ? action.slice(firstSpace + 1) : '';
};

export const getDmOtherUser = (action, currentUser) => {
  if (!action || !action.startsWith('@DM_')) return null;
  const firstSpace = action.indexOf(' ');
  const header = firstSpace !== -1 ? action.slice(4, firstSpace) : action.slice(4);
  const cur = (currentUser || '').toLowerCase();
  const lowerHeader = header.toLowerCase();
  
  if (lowerHeader.startsWith(cur + '_')) {
    return header.slice(currentUser.length + 1);
  }
  const idx = lowerHeader.lastIndexOf('_' + cur);
  if (idx > 0) {
    return header.slice(0, idx);
  }
  return null;
};

const parsePostsMap = (data, banned = []) => {
  if (!data || typeof data !== 'object') return [];
  const bannedSet = new Set(banned);
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
      comments: Array.isArray(val.comments) ? val.comments.map(c => ({...c, text: maskAbuse(c.text)})) : [],
      reactions: val.reactions && typeof val.reactions === 'object' ? val.reactions : {},
      replyTo: val.replyTo || null,
    }))
    .filter(p => p.action && !bannedSet.has(p.user))
    .map(p => ({...p, action: maskAbuse(p.action)}))
    .sort((a, b) => b.createdAt - a.createdAt);
};

const POSTS_CACHE_KEY = 'pm_community_posts_cache_v2';

export const useCommunity = (sessionUser, currentXP, prepType) => {
  const [posts, setPosts] = useState(() => {
    try {
      const cached = localStorage.getItem(POSTS_CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [bannedUsers, setBannedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(() => {
    try {
      const cached = localStorage.getItem(POSTS_CACHE_KEY);
      return cached ? JSON.parse(cached).length === 0 : true;
    } catch {
      return true;
    }
  });
  const sseRef = useRef(null);
  const bannedSseRef = useRef(null);
  const bannedUsersRef = useRef([]);

  // Sync Banned Users
  useEffect(() => {
    if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;

    fetchBannedUsers().then(users => {
      const list = users || [];
      bannedUsersRef.current = list;
      setBannedUsers(list);
    });

    let es;
    try {
      es = new EventSource(`${BANNED_PATH}.json`);
      bannedSseRef.current = es;
      const handleBanned = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.data === undefined) return;
          if (payload.path === '/') {
            const list = payload.data && typeof payload.data === 'object' ? Object.keys(payload.data) : [];
            bannedUsersRef.current = list;
            setBannedUsers(list);
          } else {
            const user = payload.path.split('/').filter(Boolean)[0];
            if (user) {
              if (payload.data === null) {
                setBannedUsers(prev => {
                  const updated = prev.filter(u => u !== user);
                  bannedUsersRef.current = updated;
                  return updated;
                });
              } else {
                setBannedUsers(prev => {
                  const updated = prev.includes(user) ? prev : [...prev, user];
                  bannedUsersRef.current = updated;
                  return updated;
                });
              }
            }
          }
        } catch {}
      };
      es.addEventListener('put', handleBanned);
      es.addEventListener('patch', handleBanned);
    } catch {}

    return () => {
      if (es) es.close();
    };
  }, []);

  // When banned users list updates, immediately purge any banned user's posts from active state
  useEffect(() => {
    if (bannedUsers.length > 0) {
      const bannedSet = new Set(bannedUsers.map(u => u.toLowerCase().trim()));
      setPosts(prev => prev.filter(p => !bannedSet.has(p.user?.toLowerCase()?.trim())));
    }
  }, [bannedUsers]);

  // Main Posts Sync & SSE Listener — Stable, does not tear down on bannedUsers change
  useEffect(() => {
    if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') {
      console.warn('useCommunity: FIREBASE_URL not configured — community feed will be empty');
      setIsLoading(false);
      return;
    }

    let isComponentMounted = true;
    let es;
    let reconnectTimer = null;

    const saveCache = (freshPosts) => {
      try {
        localStorage.setItem(POSTS_CACHE_KEY, JSON.stringify(freshPosts.slice(0, 100)));
      } catch {}
    };

    // Heartbeat sync fallback: guarantees incoming updates even if SSE sleeps or drops on mobile
    const syncPosts = async () => {
      if (!isComponentMounted) return;
      try {
        const data = await fetchPosts();
        if (!isComponentMounted) return;
        const fresh = parsePostsMap(data, bannedUsersRef.current);
        setPosts(fresh);
        saveCache(fresh);
        setIsLoading(false);
      } catch (err) {
        console.warn('Community sync fallback error:', err);
      }
    };

    // Initial load — fire immediately so new users see messages right away
    syncPosts();
    // Poll every 3.5s as a reliable fallback when SSE sleeps
    const pollInterval = setInterval(syncPosts, 3500);

    // SSE real-time listener — Firebase Realtime Database natively supports SSE
    const url = `${POSTS_PATH}.json`;

    const connectSSE = () => {
      if (!isComponentMounted) return;
      if (es) { try { es.close(); } catch {} }

      try {
        es = new EventSource(url);
        sseRef.current = es;

        const handleEvent = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.data === undefined) return;
            const path = payload.path;

            if (path === '/') {
              // Full snapshot from Firebase — parse properly with bannedUsers filter
              if (payload.data === null) {
                setPosts([]);
                saveCache([]);
                setIsLoading(false);
              } else if (payload.data && typeof payload.data === 'object') {
                const fresh = parsePostsMap(payload.data, bannedUsersRef.current);
                setPosts(fresh);
                saveCache(fresh);
                setIsLoading(false);
              }
              return;
            }

            // Incremental update for a specific post or field
            setPosts(prev => {
              const map = {};
              prev.forEach(p => { map[p.id] = p; });

              const segments = path.split('/').filter(Boolean);
              const postId = segments[0];

              if (segments.length === 1) {
                if (payload.data === null) {
                  delete map[postId];
                } else {
                  map[postId] = { ...(map[postId] || {}), ...payload.data, id: postId };
                }
              } else if (segments.length > 1) {
                if (!map[postId]) {
                  syncPosts();
                  return prev;
                }
                const field = segments[1];
                map[postId] = { ...map[postId], [field]: payload.data };
              }

              const bannedSet = new Set((bannedUsersRef.current || []).map(u => u.toLowerCase().trim()));
              const updated = Object.values(map)
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
                  comments: Array.isArray(val.comments) ? val.comments.map(c => ({...c, text: maskAbuse(c.text)})) : [],
                  reactions: val.reactions && typeof val.reactions === 'object' ? val.reactions : {},
                  replyTo: val.replyTo || null,
                }))
                .filter(p => p.action && !bannedSet.has(p.user?.toLowerCase()?.trim()))
                .map(p => ({...p, action: maskAbuse(p.action)}))
                .sort((a, b) => b.createdAt - a.createdAt);

              saveCache(updated);
              return updated;
            });
          } catch {}
        };

        es.addEventListener('put', handleEvent);
        es.addEventListener('patch', handleEvent);

        es.onerror = () => {
          try { es.close(); } catch {}
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            if (isComponentMounted) connectSSE();
          }, 3000);
        };
      } catch {}
    };

    connectSSE();

    return () => {
      isComponentMounted = false;
      clearInterval(pollInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { if (es) es.close(); } catch {}
    };
  }, []);

  const postMessage = useCallback(async (text, replyTo = null) => {
    if (!text?.trim() || !FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;
    if (bannedUsers.includes(sessionUser)) {
      alert("Access restricted: This account has been suspended from the community.");
      return;
    }
    
    const cleanText = maskAbuse(text);

    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newPost = {
      user: sessionUser,
      prep: prepType || '',
      xp: currentXP || 0,
      action: cleanText.trim(),
      time: 'just now',
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
      comments: [],
      reactions: {},
      replyTo: replyTo ? {
        id: replyTo.id,
        user: replyTo.user,
        text: replyTo.text?.slice(0, 140) || '',
      } : null,
    };
    
    // Optimistic UI update
    setPosts(prev => [{ ...newPost, id }, ...prev]);

    try {
      await writePost(id, newPost);
    } catch (err) {
      console.error("Failed to post message (Check Firebase Rules):", err);
    }
    return id;
  }, [sessionUser, currentXP, prepType, bannedUsers]);


  const toggleReaction = useCallback(async (postId, emoji = '❤️') => {
    if (!sessionUser || !postId) return;

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const reactions = { ...(p.reactions || {}) };
      const users = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
      const hasReacted = users.includes(sessionUser);
      if (hasReacted) {
        reactions[emoji] = users.filter(u => u !== sessionUser);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, sessionUser];
      }
      return { ...p, reactions };
    }));

    try {
      const res = await fetch(`${POSTS_PATH}/${postId}.json`);
      if (!res.ok) return;
      const data = await res.json();
      const reactions = { ...(data?.reactions || {}) };
      const users = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
      const hasReacted = users.includes(sessionUser);
      if (hasReacted) {
        reactions[emoji] = users.filter(u => u !== sessionUser);
        if (reactions[emoji].length === 0) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, sessionUser];
      }
      await patchPost(postId, { reactions });
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    }
  }, [sessionUser]);

  const toggleLike = useCallback(async (postId) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const hasLiked = p.likedBy.includes(sessionUser);
      const newLikedBy = hasLiked ? p.likedBy.filter(u => u !== sessionUser) : [...p.likedBy, sessionUser];
      return { ...p, likes: newLikedBy.length, likedBy: newLikedBy };
    }));

    try {
      const res = await fetch(`${POSTS_PATH}/${postId}.json`);
      if (!res.ok) throw new Error('Database read failed');
      const data = await res.json();
      const likedBy = Array.isArray(data?.likedBy) ? data.likedBy : [];
      const hasLiked = likedBy.includes(sessionUser);
      const newLikedBy = hasLiked
        ? likedBy.filter(u => u !== sessionUser)
        : [...likedBy, sessionUser];
      await patchPost(postId, { likes: newLikedBy.length, likedBy: newLikedBy });
    } catch (err) {
      console.error("Failed to like post (Check Firebase Rules):", err);
    }
  }, [sessionUser]);

  const addComment = useCallback(async (postId, text) => {
    if (!text?.trim()) return;
    if (bannedUsers.includes(sessionUser)) {
      alert("Access restricted: This account has been suspended.");
      return;
    }

    const cleanText = maskAbuse(text);
    
    // Optimistic UI update
    const newComment = { user: sessionUser, text: cleanText.trim(), time: 'just now', ts: Date.now() };
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...(p.comments || []), newComment] };
    }));

    try {
      const res = await fetch(`${POSTS_PATH}/${postId}.json`);
      if (!res.ok) throw new Error('Database read failed');
      const data = await res.json();
      const comments = Array.isArray(data?.comments) ? data.comments : [];
      await patchPost(postId, { comments: [...comments, newComment] });
    } catch (err) {
      console.error("Failed to add comment (Check Firebase Rules):", err);
    }
  }, [sessionUser, bannedUsers]);

  const deletePost = useCallback(async (postId) => {
    // Optimistic UI update
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await fetch(`${POSTS_PATH}/${postId}.json`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  }, []);

  const banUser = useCallback(async (username, reason) => {
    if (!username) return;
    setBannedUsers(prev => prev.includes(username) ? prev : [...prev, username]);
    setPosts(prev => prev.filter(p => p.user !== username));
    await banUserInFirebase(username, reason);
  }, []);

  const unbanUser = useCallback(async (username) => {
    if (!username) return;
    setBannedUsers(prev => prev.filter(u => u !== username));
    await unbanUserInFirebase(username);
  }, []);

  const removeUser = useCallback(async (username) => {
    if (!username) return;
    setPosts(prev => prev.filter(p => p.user !== username));
    await removeUserFromFirebase(username);
  }, []);

  const purgeUserPosts = useCallback(async (username) => {
    if (!username) return;
    setPosts(prev => prev.filter(p => p.user !== username));
    await purgeUserPostsFromFirebase(username);
  }, []);

  const cleanupGuestUsers = useCallback(async () => {
    return await cleanupGuestUsersFromFirebase();
  }, []);

  return {
    posts,
    isLoading,
    postMessage,
    toggleReaction,
    toggleLike,
    addComment,
    deletePost,
    bannedUsers,
    banUser,
    unbanUser,
    removeUser,
    purgeUserPosts,
    cleanupGuestUsers,
  };
};

const USERS_CACHE_KEY = 'pm_firebase_users_cache';

export const useFirebaseUsers = () => {
  const [firebaseUsers, setFirebaseUsers] = useState(() => {
    try {
      const cached = localStorage.getItem(USERS_CACHE_KEY);
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });
  const sseRef = useRef(null);

  useEffect(() => {
    if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;

    let isComponentMounted = true;

    const saveUsersCache = (data) => {
      try {
        localStorage.setItem(USERS_CACHE_KEY, JSON.stringify(data));
      } catch {}
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch(`${USERS_PATH}.json`);
        if (!res.ok || !isComponentMounted) return;
        const data = await res.json();
        if (data && typeof data === 'object') {
          setFirebaseUsers(data);
          saveUsersCache(data);
        }
      } catch (err) {
        console.error("Error fetching users from Firebase:", err);
      }
    };

    fetchUsers();
    // 3.5-second polling keeps the community directory and online statuses live
    const pollInterval = setInterval(fetchUsers, 3500);

    let es;
    let reconnectTimer = null;

    const connectSSE = () => {
      if (!isComponentMounted) return;
      if (es) { try { es.close(); } catch {} }

      try {
        es = new EventSource(`${USERS_PATH}.json`);
        sseRef.current = es;

        const handleEvent = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.data === undefined) return;
            const path = payload.path;

            setFirebaseUsers(prev => {
              let updated = { ...prev };
              if (path === '/') {
                if (payload.data && typeof payload.data === 'object') {
                  saveUsersCache(payload.data);
                  return payload.data;
                } else if (payload.data === null) {
                  saveUsersCache({});
                  return {};
                }
              } else {
                const segments = path.split('/').filter(Boolean);
                const userId = segments[0];

                if (userId) {
                  if (segments.length === 1) {
                    if (payload.data === null) delete updated[userId];
                    else updated[userId] = { ...updated[userId], ...payload.data };
                  } else if (segments.length > 1) {
                    const field = segments[1];
                    updated[userId] = { ...(updated[userId] || {}), [field]: payload.data };
                  }
                }
              }
              saveUsersCache(updated);
              return updated;
            });
          } catch {}
        };

        es.addEventListener('put', handleEvent);
        es.addEventListener('patch', handleEvent);

        es.onerror = () => {
          try { es.close(); } catch {}
          if (reconnectTimer) clearTimeout(reconnectTimer);
          reconnectTimer = setTimeout(() => {
            if (isComponentMounted) connectSSE();
          }, 4000);
        };
      } catch {}
    };

    connectSSE();

    return () => {
      isComponentMounted = false;
      clearInterval(pollInterval);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { if (es) es.close(); } catch {}
    };
  }, []);

  return firebaseUsers;
};
