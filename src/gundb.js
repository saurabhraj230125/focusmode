// ── FocusModePlayer — Real-time Community via Gun.js CDN ─────────────────────
// Gun.js is loaded via CDN script tag in index.html as window.Gun
// This avoids the Node.js compatibility crash from the npm package in browsers.

let gun = null;
let communityDb = null;

const initGun = () => {
  if (gun) return gun;
  
  // window.Gun is set by the CDN script tag in index.html
  if (typeof window !== 'undefined' && window.Gun) {
    gun = window.Gun({
      peers: [
        'https://gun-manhattan.herokuapp.com/gun',
        'https://gunjs.herokuapp.com/gun',
      ],
      localStorage: true,
    });
    communityDb = gun.get('focusmodeplayer-v2').get('community');
  }
  return gun;
};

export { initGun, communityDb };

export const getCommunityDb = () => {
  initGun();
  return communityDb;
};

export default { initGun, getCommunityDb };
