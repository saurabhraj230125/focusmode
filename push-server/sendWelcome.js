const webpush = require('web-push');
const fetch = require('node-fetch');

const VAPID_PUBLIC  = 'BPS9sGE_QZvbXKRg0d-0Ue8xVByFUfa70QKxLnUo3k6sE3n9Nv0YIhA7Qzr79D5zDRcOpyjCLXgSVFI278YD6QU';
const VAPID_PRIVATE = 'ztF0Q7Jd44IJbcfMcGsL8a34bW7WBjOy90zrg23kAA0';
webpush.setVapidDetails('mailto:saurabhraj230125@gmail.com', VAPID_PUBLIC, VAPID_PRIVATE);

const FIREBASE_URL = 'https://studentmesh-878b5-default-rtdb.asia-southeast1.firebasedatabase.app';

async function getSubs(path) {
  const res = await fetch(FIREBASE_URL + path);
  if (!res.ok) return [];
  const data = await res.json();
  if (!data) return [];
  const subs = [];
  for (const username of Object.keys(data)) {
    for (const key of Object.keys(data[username])) {
      const entry = data[username][key];
      if (entry && entry.subscription) subs.push(entry.subscription);
    }
  }
  return subs;
}

async function sendWelcome() {
  const subsOld = await getSubs('/focusmodeplayer/push_subscriptions.json');
  const subsNew = await getSubs('/focusmode/push_subscriptions.json');
  
  // Deduplicate subscriptions by endpoint
  const map = new Map();
  [...subsOld, ...subsNew].forEach(s => map.set(s.endpoint, s));
  const uniqueSubs = Array.from(map.values());
  
  console.log(`Found ${uniqueSubs.length} unique subscriptions.`);
  
  const payload = JSON.stringify({
    title: 'Welcome to FocusMode! 🚀',
    body: 'The app has been renamed and upgraded for a better mobile experience!',
    url: '/'
  });
  
  let sent = 0;
  for (const sub of uniqueSubs) {
    try {
      await webpush.sendNotification(sub, payload);
      sent++;
    } catch (e) {
      console.log('Failed to send to a sub:', e.message);
    }
  }
  console.log(`Sent ${sent} notifications.`);
}

sendWelcome();
