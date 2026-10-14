// ── Supported Countries & Flags for FocusMode Aspirant Profiles ───────────

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: 'OM', name: 'Oman', flag: '🇴🇲' },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'OTHER', name: 'International / Global', flag: '🌍' }
];

/** Convert 2-letter ISO country code to official emoji flag */
export const getFlagEmoji = (countryCode) => {
  if (!countryCode || countryCode === 'OTHER') return '🌍';
  const code = String(countryCode).trim().toUpperCase();
  if (code.length !== 2) return '🌍';
  return code.replace(/./g, char => String.fromCodePoint(char.charCodeAt(0) + 127397));
};

/** Get English country name from ISO code */
export const getCountryNameFromCode = (countryCode) => {
  if (!countryCode || countryCode === 'OTHER') return 'International / Global';
  const code = String(countryCode).trim().toUpperCase();
  const known = COUNTRIES.find(c => c.code === code);
  if (known) return known.name;
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
};

/** Lookup or create country object from name or 2-letter ISO code */
export const getCountryData = (nameOrCode) => {
  if (!nameOrCode) return { code: 'OTHER', name: 'International / Global', flag: '🌍' };
  const query = String(nameOrCode).trim();
  
  // Exact or case-insensitive match from COUNTRIES list
  const match = COUNTRIES.find(c => 
    c.name.toLowerCase() === query.toLowerCase() || 
    c.code.toLowerCase() === query.toLowerCase()
  );
  if (match) return match;

  // If 2-letter ISO code provided
  if (query.length === 2) {
    const code = query.toUpperCase();
    const name = getCountryNameFromCode(code);
    const flag = getFlagEmoji(code);
    return { code, name, flag };
  }

  return { code: 'OTHER', name: query, flag: '🌍' };
};

/** Extract 2-letter country code from browser locale */
const getLocaleCountryCode = () => {
  try {
    if (typeof navigator === 'undefined') return null;
    const languages = (navigator.languages && navigator.languages.length) 
      ? navigator.languages 
      : [navigator.language || ''];
    for (const lang of languages) {
      if (!lang) continue;
      const parts = lang.split(/[-_]/);
      if (parts.length >= 2) {
        const region = parts[parts.length - 1].toUpperCase();
        if (region.length === 2 && /^[A-Z]{2}$/.test(region)) {
          return region;
        }
      }
    }
  } catch {}
  return null;
};

/** Map timezone string to 2-letter country code */
const getTimezoneCountryCode = () => {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    if (!tz) return null;

    // Pakistan (Karachi, Islamabad, PKT)
    if (tz.includes('karachi') || tz.includes('islamabad') || tz === 'pkt' || tz.includes('pakistan')) return 'PK';

    // India (Calcutta, Kolkata, IST)
    if (tz.includes('calcutta') || tz.includes('kolkata') || tz.includes('india') || tz === 'ist') return 'IN';

    // South Asia & Middle East
    if (tz.includes('dhaka')) return 'BD';
    if (tz.includes('kathmandu')) return 'NP';
    if (tz.includes('colombo')) return 'LK';
    if (tz.includes('dubai') || tz.includes('abu_dhabi')) return 'AE';
    if (tz.includes('riyadh')) return 'SA';
    if (tz.includes('qatar') || tz.includes('doha')) return 'QA';
    if (tz.includes('kuwait')) return 'KW';
    if (tz.includes('muscat')) return 'OM';
    if (tz.includes('bahrain')) return 'BH';
    if (tz.includes('istanbul')) return 'TR';

    // North America
    if (
      tz.includes('new_york') || tz.includes('los_angeles') || tz.includes('chicago') || 
      tz.includes('denver') || tz.includes('phoenix') || tz.includes('detroit') || 
      tz.includes('anchorage') || tz.includes('honolulu') || tz.startsWith('us/')
    ) return 'US';
    if (tz.includes('toronto') || tz.includes('vancouver') || tz.includes('montreal') || tz.includes('edmonton')) return 'CA';

    // Europe
    if (tz.includes('london')) return 'GB';
    if (tz.includes('berlin') || tz.includes('frankfurt')) return 'DE';
    if (tz.includes('paris')) return 'FR';
    if (tz.includes('rome')) return 'IT';
    if (tz.includes('madrid')) return 'ES';
    if (tz.includes('amsterdam')) return 'NL';
    if (tz.includes('zurich')) return 'CH';
    if (tz.includes('stockholm')) return 'SE';

    // Asia & Pacific
    if (tz.includes('singapore')) return 'SG';
    if (tz.includes('tokyo')) return 'JP';
    if (tz.includes('seoul')) return 'KR';
    if (tz.includes('jakarta') || tz.includes('makassar')) return 'ID';
    if (tz.includes('kuala_lumpur')) return 'MY';
    if (tz.includes('bangkok')) return 'TH';
    if (tz.includes('manila')) return 'PH';
    if (tz.includes('saigon') || tz.includes('ho_chi_minh') || tz.includes('hanoi')) return 'VN';
    if (tz.includes('sydney') || tz.includes('melbourne') || tz.includes('brisbane') || tz.includes('perth')) return 'AU';
    if (tz.includes('auckland')) return 'NZ';

    // Africa & Americas
    if (tz.includes('cairo')) return 'EG';
    if (tz.includes('lagos')) return 'NG';
    if (tz.includes('johannesburg')) return 'ZA';
    if (tz.includes('sao_paulo')) return 'BR';
    if (tz.includes('mexico')) return 'MX';
    if (tz.includes('moscow')) return 'RU';
  } catch {}
  return null;
};

/** Synchronous country detection with local cache, timezone and locale */
export const detectUserCountry = () => {
  // 1. Check local storage cache (from verified previous IP lookup)
  try {
    const cached = localStorage.getItem('pm_user_country');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.code && parsed?.name && parsed?.flag && parsed.code !== 'OTHER') {
        return parsed;
      }
    }
  } catch {}

  // 2. Check timezone
  const tzCode = getTimezoneCountryCode();
  if (tzCode) {
    const data = getCountryData(tzCode);
    if (data && data.code !== 'OTHER') return data;
  }

  // 3. Check browser language locale
  const localeCode = getLocaleCountryCode();
  if (localeCode) {
    const data = getCountryData(localeCode);
    if (data && data.code !== 'OTHER') return data;
  }

  // Fallback: International / Global
  return { code: 'OTHER', name: 'International / Global', flag: '🌍' };
};

/**
 * Asynchronous IP-based Geolocation detection.
 * Fast, reliable multi-endpoint fallback identical to Google Analytics server-side IP lookup.
 * Updates localStorage, informs Google Analytics, and returns resolved country.
 */
let isFetchingCountry = false;

export const fetchUserCountryAsync = async () => {
  if (isFetchingCountry) return null;
  isFetchingCountry = true;

  const endpoints = [
    async (signal) => {
      const res = await fetch('https://api.country.is/', { signal });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data?.country;
    },
    async (signal) => {
      const res = await fetch('https://get.geojs.io/v1/ip/country.json', { signal });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data?.country;
    },
    async (signal) => {
      const res = await fetch('https://freeipapi.com/api/json', { signal });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      return data?.countryCode;
    }
  ];

  let resolvedCode = null;

  for (const endpoint of endpoints) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    try {
      const code = await endpoint(controller.signal);
      clearTimeout(timeout);
      if (code && typeof code === 'string' && code.trim().length === 2) {
        resolvedCode = code.trim().toUpperCase();
        break;
      }
    } catch {
      clearTimeout(timeout);
    }
  }

  isFetchingCountry = false;

  if (resolvedCode) {
    const countryData = getCountryData(resolvedCode);
    try {
      localStorage.setItem('pm_user_country', JSON.stringify(countryData));
    } catch {}

    // Dispatch event so React components can instantly react
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('focusmode:country_detected', { detail: countryData }));
      
      // Sync with Google Analytics
      if (typeof window.gtag === 'function') {
        window.gtag('set', 'user_properties', {
          user_country: countryData.name,
          user_country_code: countryData.code,
          user_country_flag: countryData.flag
        });
        window.gtag('event', 'user_country_detected', {
          country: countryData.name,
          country_code: countryData.code,
          method: 'ip_geolocation'
        });
      }
    }

    return countryData;
  }

  return null;
};
