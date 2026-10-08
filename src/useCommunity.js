// ── useCommunity — Real-time Community Feed via Firebase Realtime Database ────
// Uses Firebase REST API + Server-Sent Events (SSE) for true real-time sync.
// No SDK needed — just fetch() and EventSource.
// Replace FIREBASE_URL below with your Firebase Realtime Database URL.

import { useState, useEffect, useCallback, useRef } from 'react';

// ⚠️ REPLACE THIS with your Firebase Realtime Database URL
// Example: https://your-project-default-rtdb.firebaseio.com
const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';
const POSTS_PATH = `${FIREBASE_URL}/focusmode/community`;
const USERS_PATH = `${FIREBASE_URL}/focusmode/users`;

export const syncUserToFirebase = async (username, profile) => {
  if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;
  try {
    await fetch(`${USERS_PATH}/${username}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profile, lastActive: Date.now() }),
    });
  } catch (e) {
    console.error("Error syncing user to firebase", e);
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

const BAD_WORDS_LONG = [
  'madharchod', 'maderchod', 'randi', 'bsdk', 'gendu', 'gandu', 'chutiya', 
  'bhenchod', 'behenchod', 'bhosdike', 'bhosadi', 'laude', 'nigger', 'faggot',
  'muthiya', 'mutth', 'raand', 'bhosda', 'bhosada', 'machod', 'madarchod',
  'lawda', 'lond', 'loda', 'lode', 'lund', 'bhadwa', 'bhadwe', 'bhadwi',
  'bhand', 'chod', 'chut', 'chutiye', 'gaandu', 'haramkhor', 
  'harami', 'kuttiya', 'kameena', 'kaminey', 'kamine', 'machuda',
  'betichod', 'gand', 'gaand', 'gaande', 'gande', 'tatte', 'tatta', 'ullukepatthe',
  'chamar', 'bhangi', 'chinal', 'chinnal', 'bhosadike',
  'bhakchod', 'bakchod', 'bakchodi', 'bakaiti', 'chapri', 'chhapri', 'nibba', 'nibbi',
  'jhaat', 'jhatu', 'jhaatu', 'rand', 'dalal', 'kutta', 'kutti', 'chutiyapa'
];
const BAD_WORDS_STRICT = [
  'mc', 'bc', 'mkc', 'tmkc', 'fuck', 'shit', 'bitch', 'whore', 'slut', 'dick', 
  'pussy', 'cunt', 'loda', 'lode', 'bastard', 'asshole', 'chut', 'chooth', 'choot',
  'sexy', 'porn', 'nude', 'boobs', 'tits', 'cock', 'horny', 'lawda', 'lund', 'land',
  'bsdk', 'gandu', 'randi', 'bhenchod', 'madarchod'
];

const BAD_PHRASES = [
  'teri maa', 'teri ma', 'maa ka', 'ma ka', 'kutte',
  'teri behen', 'teri bahan', 'teri bhen', 'behen ki', 'bhen ki', 'bahan ki',
  'maa ki', 'ma ki', 'bhosdike', 'maa chuda', 'ma chuda', 'gand mara', 'gaand mara',
  'teri maka', 'teri maa ka', 'bhen ke lode', 'beti chod', 'maa ki chut', 'ma ki chut',
  'madar chod', 'bhen ki chut', 'ullu ke patthe', 'chutiya', 'teri keh ke', 'keh ke lunga',
  'muth maar', 'mutth maar'
];

export const containsAbuse = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  
  if (BAD_PHRASES.some(phrase => lowerText.includes(phrase))) return true;
  const normalized = lowerText.replace(/[^a-z0-9]/g, '');
  if (BAD_WORDS_LONG.some(bw => normalized.includes(bw))) return true;
  const words = lowerText.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
  return BAD_WORDS_STRICT.some(sw => words.includes(sw));
};

export const maskAbuse = (text) => {
  if (!text) return text;
  if (!containsAbuse(text)) return text;
  
  let maskedText = text;
  
  BAD_PHRASES.forEach(phrase => {
    const regex = new RegExp(phrase, 'gi');
    maskedText = maskedText.replace(regex, '***');
  });

  BAD_WORDS_STRICT.forEach(sw => {
    const regex = new RegExp(`\\b${sw}\\b`, 'gi');
    maskedText = maskedText.replace(regex, '***');
  });
  
  // For long words without boundaries, just return a fully masked string to be safe
  if (containsAbuse(maskedText)) {
      return "[Message hidden due to abusive content]";
  }

  return maskedText;
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
      comments: Array.isArray(val.comments) ? val.comments.map(c => ({...c, text: maskAbuse(c.text)})) : [],
    }))
    .filter(p => p.action && !p.user.startsWith('Guest_'))
    .map(p => ({...p, action: maskAbuse(p.action)}))
    .sort((a, b) => b.createdAt - a.createdAt);
};

export const useCommunity = (sessionUser, currentXP, prepType) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sseRef = useRef(null);

  useEffect(() => {
    if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') {
      console.warn('useCommunity: FIREBASE_URL not configured — community feed will be empty');
      return;
    }

    // Initial load
    fetchPosts().then(data => {
      setPosts(parsePostsMap(data));
      setIsLoading(false);
    });

    // SSE real-time listener — Firebase Realtime Database natively supports SSE
    const url = `${POSTS_PATH}.json`;
    let isComponentMounted = true;
    let es;

    const connectSSE = () => {
      if (!isComponentMounted) return;
      if (es) es.close();

      es = new EventSource(url);
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
              comments: Array.isArray(val.comments) ? val.comments.map(c => ({...c, text: maskAbuse(c.text)})) : [],
            }))
            .filter(p => p.action && !p.user.startsWith('Guest_'))
            .map(p => ({...p, action: maskAbuse(p.action)}))
            .sort((a, b) => b.createdAt - a.createdAt);
        });
      } catch {}
      };

      es.addEventListener('put', handleEvent);
      es.addEventListener('patch', handleEvent);

      es.onerror = () => {
        console.warn('SSE posts connection error, reconnecting...');
        es.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      isComponentMounted = false;
      if (es) es.close();
    };
  }, []);

  const postMessage = useCallback(async (text) => {
    if (!text?.trim() || !FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;
    
    // We don't block locally anymore, we just let it sync and it will be masked on display
    // but optionally we can mask it before sending to database.
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
    };
    
    // Optimistic UI update
    setPosts(prev => [{ ...newPost, id }, ...prev]);

    try {
      await writePost(id, newPost);
    } catch (err) {
      console.error("Failed to post message (Check Firebase Rules):", err);
    }
    return id;
  }, [sessionUser, currentXP, prepType]);

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
  }, [sessionUser]);

  const deletePost = useCallback(async (postId) => {
    // Optimistic UI update
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      await fetch(`${POSTS_PATH}/${postId}.json`, { method: 'DELETE' });
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  }, []);

  return { posts, isLoading, postMessage, toggleLike, addComment, deletePost };
};

export const useFirebaseUsers = () => {
  const [firebaseUsers, setFirebaseUsers] = useState({});
  const sseRef = useRef(null);

  useEffect(() => {
    if (!FIREBASE_URL || FIREBASE_URL === '__FIREBASE_URL__') return;

    fetch(`${USERS_PATH}.json`)
      .then(res => res.json())
      .then(data => {
        if (data && typeof data === 'object') {
          setFirebaseUsers(data);
        }
      })
      .catch(err => console.error("Error fetching users", err));

    let isComponentMounted = true;
    let es;

    const connectSSE = () => {
      if (!isComponentMounted) return;
      if (es) es.close();

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
              Object.entries(payload.data).forEach(([key, val]) => {
                if (val === null) delete updated[key];
                else updated[key] = { ...updated[key], ...val };
              });
            } else if (payload.data === null) {
              updated = {};
            }
          } else {
            const segments = path.split('/').filter(Boolean);
            const userId = segments[0];

            if (segments.length === 1) {
              if (payload.data === null) delete updated[userId];
              else updated[userId] = { ...updated[userId], ...payload.data };
            } else if (segments.length > 1 && updated[userId]) {
              const field = segments[1];
              updated[userId][field] = payload.data;
            }
          }
          return updated;
        });
      } catch {}
      };

      es.addEventListener('put', handleEvent);
      es.addEventListener('patch', handleEvent);

      es.onerror = () => {
        console.warn('SSE users connection error, reconnecting...');
        es.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      isComponentMounted = false;
      if (es) es.close();
    };
  }, []);

  return firebaseUsers;
};
