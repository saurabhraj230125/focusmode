// ── Supported Countries & Flags for FocusMode Aspirant Profiles ───────────

export const COUNTRIES = [
  { code: 'IN', name: 'India', flag: '🇮🇳' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
  { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿' },
  { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
  { code: 'OTHER', name: 'International / Global', flag: '🌍' }
];

export const detectUserCountry = () => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) return COUNTRIES.find(c => c.code === 'IN');
    if (tz.includes('New_York') || tz.includes('Los_Angeles') || tz.includes('Chicago') || tz.includes('Denver') || tz.startsWith('US/')) return COUNTRIES.find(c => c.code === 'US');
    if (tz.includes('London')) return COUNTRIES.find(c => c.code === 'GB');
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal')) return COUNTRIES.find(c => c.code === 'CA');
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane')) return COUNTRIES.find(c => c.code === 'AU');
    if (tz.includes('Berlin')) return COUNTRIES.find(c => c.code === 'DE');
    if (tz.includes('Paris')) return COUNTRIES.find(c => c.code === 'FR');
    if (tz.includes('Singapore')) return COUNTRIES.find(c => c.code === 'SG');
    if (tz.includes('Dubai')) return COUNTRIES.find(c => c.code === 'AE');
    if (tz.includes('Riyadh')) return COUNTRIES.find(c => c.code === 'SA');
    if (tz.includes('Tokyo')) return COUNTRIES.find(c => c.code === 'JP');
    if (tz.includes('Seoul')) return COUNTRIES.find(c => c.code === 'KR');
    if (tz.includes('Karachi')) return COUNTRIES.find(c => c.code === 'PK');
    if (tz.includes('Dhaka')) return COUNTRIES.find(c => c.code === 'BD');
    if (tz.includes('Kathmandu')) return COUNTRIES.find(c => c.code === 'NP');
    if (tz.includes('Colombo')) return COUNTRIES.find(c => c.code === 'LK');
  } catch {}
  return COUNTRIES[0]; // Default India 🇮🇳
};

export const getCountryData = (nameOrCode) => {
  if (!nameOrCode) return { code: 'IN', name: 'India', flag: '🇮🇳' };
  const match = COUNTRIES.find(c => 
    c.name.toLowerCase() === String(nameOrCode).toLowerCase() || 
    c.code.toLowerCase() === String(nameOrCode).toLowerCase()
  );
  return match || { code: 'OTHER', name: String(nameOrCode), flag: '🌍' };
};
