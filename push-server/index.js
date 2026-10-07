const express = require('express');
const webpush = require('web-push');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC  || 'BPS9sGE_QZvbXKRg0d-0Ue8xVByFUfa70QKxLnUo3k6sE3n9Nv0YIhA7Qzr79D5zDRcOpyjCLXgSVFI278YD6QU';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || 'ztF0Q7Jd44IJbcfMcGsL8a34bW7WBjOy90zrg23kAA0';
webpush.setVapidDetails('mailto:saurabhraj230125@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';
const SUBS_PATH = FIREBASE_URL + '/focusmode/push_subscriptions.json';

async function getAllSubscriptions() {
  const res = await fetch(SUBS_PATH);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data) return [];
  const subs = [];
  for (const username of Object.keys(data)) {
    for (const key of Object.keys(data[username])) {
      const entry = data[username][key];
      if (entry && entry.subscription) subs.push({ username, subscription: entry.subscription });
    }
  }
  return subs;
}

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/subscribers', async (req, res) => {
  const subs = await getAllSubscriptions();
  res.json({ count: subs.length, users: subs.map(s => s.username) });
});

app.post('/notify', async (req, res) => {
  const { title, body, secret, tag } = req.body;
  if (secret !== process.env.NOTIFY_SECRET) return res.status(403).json({ error: 'Unauthorized' });
  const subs = await getAllSubscriptions();
  const payload = JSON.stringify({ title, body, tag: tag || 'broadcast', url: '/' });
  let sent = 0;
  for (const { subscription } of subs) {
    try { await webpush.sendNotification(subscription, payload); sent++; } catch (e) {}
  }
  res.json({ sent, total: subs.length });
});

app.post('/notify-user', async (req, res) => {
  const { username, title, body, secret } = req.body;
  if (secret !== process.env.NOTIFY_SECRET) return res.status(403).json({ error: 'Unauthorized' });
  const subs = (await getAllSubscriptions()).filter(s => s.username === username);
  let sent = 0;
  for (const { subscription } of subs) {
    try { await webpush.sendNotification(subscription, JSON.stringify({ title, body, url: '/' })); sent++; } catch (e) {}
  }
  res.json({ sent });
});

let lastMsgTime = Date.now();
async function watchMessages() {
  try {
    const res = await fetch(FIREBASE_URL + '/focusmode/community.json?orderBy=%22createdAt%22&limitToLast=3');
    if (!res.ok) return;
    const data = await res.json();
    if (!data) return;
    const msgs = Object.values(data).filter(m => m.action && !m.action.startsWith('@DM_')).sort((a, b) => b.createdAt - a.createdAt);
    const latest = msgs[0];
    if (latest && latest.createdAt > lastMsgTime) {
      lastMsgTime = latest.createdAt;
      const subs = (await getAllSubscriptions()).filter(s => s.username !== latest.user);
      const payload = JSON.stringify({ title: latest.user + ' in Global Lounge', body: (latest.action || '').substring(0, 80), tag: 'msg', url: '/' });
      for (const { subscription } of subs) {
        try { await webpush.sendNotification(subscription, payload); } catch (e) {}
      }
      console.log('[Watcher] Notified', subs.length, 'users about message from', latest.user);
    }
  } catch (e) { console.error('[Watcher]', e.message); }
}

setInterval(watchMessages, 60000);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('FocusMode Push Server on port ' + PORT));
