// ── useEvents — Real-time Scheduled Study Events via Firebase ──────────────────
// Uses Firebase REST API + SSE to sync live study rooms and scheduled events.

import { useState, useEffect, useCallback, useRef } from 'react';

// Reusing the same Firebase URL provided earlier
const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';
const EVENTS_PATH = `${FIREBASE_URL}/focusmodeplayer/events`;

const fetchEvents = async () => {
  try {
    const res = await fetch(`${EVENTS_PATH}.json`);
    if (!res.ok) return {};
    const data = await res.json();
    return data || {};
  } catch {
    return {};
  }
};

const writeEvent = async (id, eventObj) => {
  await fetch(`${EVENTS_PATH}/${id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventObj),
  });
};

const patchEvent = async (id, patch) => {
  await fetch(`${EVENTS_PATH}/${id}.json`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
};

export const useEvents = (sessionUser) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sseRef = useRef(null);

  useEffect(() => {
    // Initial load
    fetchEvents().then(data => {
      if (data && typeof data === 'object') {
        const parsed = Object.entries(data).map(([key, val]) => ({ ...val, id: key }));
        // Filter out very old events (older than 24 hours)
        const now = Date.now();
        const active = parsed.filter(e => now - e.createdAt < 24 * 60 * 60 * 1000);
        setEvents(active.sort((a, b) => b.createdAt - a.createdAt));
      }
      setIsLoading(false);
    });

    const es = new EventSource(`${EVENTS_PATH}.json`);
    sseRef.current = es;

    const handleEvent = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.data === undefined) return;
        const path = payload.path;

        setEvents(prev => {
          const map = {};
          prev.forEach(p => { map[p.id] = p; });

          if (path === '/') {
            if (payload.data && typeof payload.data === 'object') {
              Object.entries(payload.data).forEach(([key, val]) => {
                if (val === null) delete map[key];
                else map[key] = { ...map[key], ...val, id: key };
              });
            }
          } else {
            const segments = path.split('/').filter(Boolean);
            const eventId = segments[0];

            if (segments.length === 1) {
              if (payload.data === null) delete map[eventId];
              else map[eventId] = { ...map[eventId], ...payload.data, id: eventId };
            } else if (segments.length > 1 && map[eventId]) {
               const field = segments[1];
               map[eventId][field] = payload.data;
            }
          }

          const now = Date.now();
          return Object.values(map)
            .filter(e => now - e.createdAt < 24 * 60 * 60 * 1000)
            .sort((a, b) => b.createdAt - a.createdAt);
        });
      } catch {}
    };

    es.addEventListener('put', handleEvent);
    es.addEventListener('patch', handleEvent);

    return () => es.close();
  }, []);

  const createEvent = useCallback(async (title, topic, scheduledTimeStr, durationStr) => {
    if (!title?.trim()) return;
    const id = `event_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const newEvent = {
      title: title.trim(),
      topic: topic || 'General Study',
      host: sessionUser,
      createdAt: Date.now(),
      scheduledTime: scheduledTimeStr || 'Now', // e.g. "Today at 8:00 PM"
      duration: durationStr || '1 hr',
      participants: [sessionUser],
    };
    
    setEvents(prev => [{ ...newEvent, id }, ...prev]);
    try { await writeEvent(id, newEvent); } catch (e) { console.error(e); }
  }, [sessionUser]);

  const joinEvent = useCallback(async (eventId) => {
    setEvents(prev => prev.map(e => {
      if (e.id !== eventId) return e;
      const parts = Array.isArray(e.participants) ? e.participants : [];
      if (!parts.includes(sessionUser)) {
        return { ...e, participants: [...parts, sessionUser] };
      }
      return e;
    }));

    try {
      const res = await fetch(`${EVENTS_PATH}/${eventId}.json`);
      if (!res.ok) return;
      const data = await res.json();
      const parts = Array.isArray(data?.participants) ? data.participants : [];
      if (!parts.includes(sessionUser)) {
        await patchEvent(eventId, { participants: [...parts, sessionUser] });
      }
    } catch (e) { console.error(e); }
  }, [sessionUser]);

  const deleteEvent = useCallback(async (eventId) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
    try {
      await fetch(`${EVENTS_PATH}/${eventId}.json`, { method: 'DELETE' });
    } catch (e) { console.error(e); }
  }, []);

  return { events, isLoading, createEvent, joinEvent, deleteEvent };
};
