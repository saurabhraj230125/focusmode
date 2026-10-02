// ── FocusModePlayer — Real-time Community via Gun.js ─────────────────────────
// Gun.js is a decentralized, peer-to-peer real-time database.
// Posts sync instantly across ALL browsers with zero backend setup.

import Gun from 'gun';

// Use public Gun relay peers so data syncs across different users/devices
const gun = Gun({
  peers: [
    'https://gun-manhattan.herokuapp.com/gun',
    'https://gunjs.herokuapp.com/gun',
  ],
  localStorage: true, // also keep local copy as offline cache
});

// Namespace all data under this app key
const DB = gun.get('focusmodeplayer-v2');

export const communityDb = DB.get('community');

export default gun;
