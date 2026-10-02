// ── useCommunity — Real-time Community Feed Hook ─────────────────────────────
// Syncs posts, likes and comments in real-time across ALL users via Gun.js

import { useState, useEffect, useCallback } from 'react';
import { communityDb } from './gundb.js';

const MAX_POSTS = 100;

/**
 * Returns { posts, postMessage, toggleLike, addComment }
 * All operations are immediately reflected for EVERY user on the site.
 */
export const useCommunity = (sessionUser, currentXP, prepType) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const seen = new Set();
    const incoming = {};

    // Listen for new / updated posts on the real-time feed
    communityDb.map().on((data, key) => {
      if (!data || !key) return;

      incoming[key] = {
        id: key,
        user: data.user || 'Anonymous',
        prep: data.prep || '',
        xp: data.xp || 0,
        action: data.action || '',
        time: data.time || 'just now',
        createdAt: data.createdAt || 0,
        isChat: data.isChat !== false,
        likes: data.likes || 0,
        likedBy: data.likedBy ? JSON.parse(data.likedBy) : [],
        comments: data.comments ? JSON.parse(data.comments) : [],
      };

      // Rebuild sorted list
      const sorted = Object.values(incoming)
        .filter(p => p.action)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, MAX_POSTS);

      setPosts(sorted);
    });

    return () => {
      communityDb.map().off();
    };
  }, []);

  /** Post a new message */
  const postMessage = useCallback((text) => {
    if (!text?.trim()) return;
    const id = `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = Date.now();
    communityDb.get(id).put({
      user: sessionUser,
      prep: prepType || '',
      xp: currentXP || 0,
      action: text.trim(),
      time: 'just now',
      createdAt: now,
      isChat: true,
      likes: 0,
      likedBy: JSON.stringify([]),
      comments: JSON.stringify([]),
    });
    return id;
  }, [sessionUser, currentXP, prepType]);

  /** Toggle like on a post */
  const toggleLike = useCallback((postId) => {
    communityDb.get(postId).once((data) => {
      if (!data) return;
      const likedBy = data.likedBy ? JSON.parse(data.likedBy) : [];
      const hasLiked = likedBy.includes(sessionUser);
      const newLikedBy = hasLiked
        ? likedBy.filter(u => u !== sessionUser)
        : [...likedBy, sessionUser];
      communityDb.get(postId).put({
        likes: newLikedBy.length,
        likedBy: JSON.stringify(newLikedBy),
      });
    });
  }, [sessionUser]);

  /** Add a comment to a post */
  const addComment = useCallback((postId, text) => {
    if (!text?.trim()) return;
    communityDb.get(postId).once((data) => {
      if (!data) return;
      const comments = data.comments ? JSON.parse(data.comments) : [];
      const newComments = [
        ...comments,
        { user: sessionUser, text: text.trim(), time: 'just now', ts: Date.now() },
      ];
      communityDb.get(postId).put({
        comments: JSON.stringify(newComments),
      });
    });
  }, [sessionUser]);

  return { posts, postMessage, toggleLike, addComment };
};
