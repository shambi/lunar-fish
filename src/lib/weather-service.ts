import { getMoonTimes, getSolunarPeaks } from '@/lib/moon-times';
import { WEATHER_API_CONFIG } from '@/config/weather-api';

export type AlertLevel = 'none' | 'yellow' | 'orange' | 'red';

export interface MeteoAlarmData {
  level: AlertLevel;
  event: string;
  expires: string;
  headline: string;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string;
  latitude: number;
  longitude: number;
  altitude: number;
  locationName: string;
  pressure: number;
  pressureTrend: 'rising' | 'stable' | 'falling';
  pressureChangeRate: number;
  pressureHistory: { time: string; value: number }[];
  sunrise: string;
  sunset: string;
  moonrise: string;
  moonset: string;
  moonTransit: string;
  moonAntitransit: string;
  solunarPeaks: ReturnType<typeof getSolunarPeaks>;
  waterTemp: number;
  meteoAlarm: MeteoAlarmData;
  hourlyForecast: { hour: string; temp: number; code: number; precipitation: number; windSpeed: number }[];
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: 'Ясно небе', icon: '☀️' },
  1: { label: 'Предимно ясно', icon: '🌤️' },
  2: { label: 'Частично облачно', icon: '⛅' },
  3: { label: 'Облачно', icon: '☁️' },
  45: { label: 'Мъгла', icon: '🌫️' },
  48: { label: 'Мъгла с скреж', icon: '🌫️' },
  51: { label: 'Лек ръмеж', icon: '🌦️' },
  53: { label: 'Умерен ръмеж', icon: '🌦️' },
  55: { label: 'Гъст ръмеж', icon: '🌧️' },
  61: { label: 'Лек дъжд', icon: '🌧️' },
  63: { label: 'Умерен дъжд', icon: '🌧️' },
  65: { label: 'Силен дъжд', icon: '🌧️' },
  56: { label: 'Лек заледяващ ръмеж', icon: '🌨️' },
  57: { label: 'Гъст заледяващ ръмеж', icon: '🌨️' },
  66: { label: 'Лек заледяващ дъжд', icon: '🌨️' },
  67: { label: 'Силен заледяващ дъжд', icon: '🌨️' },
  71: { label: 'Лек сняг', icon: '🌨️' },
  73: { label: 'Умерен сняг', icon: '🌨️' },
  75: { label: 'Силен сняг', icon: '❄️' },
  77: { label: 'Снежни зърна', icon: '🌨️' },
  80: { label: 'Леки превалявания', icon: '🌦️' },
  81: { label: 'Умерени превалявания', icon: '🌧️' },
  82: { label: 'Силни превалявания', icon: '⛈️' },
  85: { label: 'Леки снежни превалявания', icon: '🌨️' },
  86: { label: 'Силни снежни превалявания', icon: '❄️' },
  95: { label: 'Гръмотевична буря', icon: '⛈️' },
  96: { label: 'Буря с градушка', icon: '⛈️' },
  99: { label: 'Силна буря с градушка', icon: '⛈️' },
};

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { label: 'Неизвестно', icon: '🌡️' };
}

export async function fetchWithTimeout(input: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchElevation(latitude: number, longitude: number, fallbackAltitude = 0): Promise<number> {
  try {
    const res = await fetchWithTimeout(
      `${WEATHER_API_CONFIG.apis.elevation}?locations=${latitude},${longitude}`,
      WEATHER_API_CONFIG.timeouts.elevation
    );
    if (!res.ok) {
      console.log('[fetchElevation] response not ok, status:', res.status, '— using fallback:', fallbackAltitude);
      return fallbackAltitude;
    }
    const data = await res.json();
    const elevation = data?.results?.[0]?.elevation;
    console.log('[fetchElevation] raw API response elevation:', elevation, 'full data:', data);
    // Treat 0/null/undefined/non-finite as invalid — Bulgaria has no sea-level
    // locations, so a 0 reading almost always means the API returned junk,
    // not a real measurement. Fall back instead of showing a bogus 0.
    if (!Number.isFinite(elevation) || elevation === 0) {
      console.log('[fetchElevation] elevation invalid or zero — using fallback:', fallbackAltitude);
      return fallbackAltitude;
    }
    return Math.round(elevation);
  } catch (err) {
    console.log('[fetchElevation] fetch failed/timed out:', err, '— using fallback:', fallbackAltitude);
    return fallbackAltitude;
  }
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const cacheKey = WEATHER_API_CONFIG.cacheKeys.geocoding(lat, lon);
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > WEATHER_API_CONFIG.cache.geocoding;
      if (!isExpired) return parsed.name;
    } catch {
      // invalid cache, proceed
    }
  }

  try {
    const response = await fetchWithTimeout(
      `${WEATHER_API_CONFIG.apis.geocoding}` +
      `?lat=${lat}&lon=${lon}` +
      `&format=json` +
      `&accept-language=bg` +
      `&zoom=10`,
      WEATHER_API_CONFIG.timeouts.geocoding
    );

    if (!response.ok) throw new Error('Geocoding failed');

    const data = await response.json();

    const address = data.address;

    const placeName =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.municipality ||
      address?.county ||
      address?.state ||
      null;

    if (placeName) {
      const cacheData = {
        name: placeName,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      return placeName;
    }

    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

// --- Regional filtering for MeteoAlarm CAP entries -------------------------
//
// The Bulgaria feed was empty at the time this was written (verified via
// /api/debug-meteoalarm — no active warnings), so we couldn't inspect a real
// entry to confirm whether MeteoAlarm identifies Bulgarian areas by EMMA_ID
// geocode, by <cap:polygon>, or both. CAP requires at least one area
// sub-element (geocode, polygon, or circle), so we support both of the two
// documented possibilities and fall through between them per entry.

interface CapGeocode { valueName: string; value: string }

function parseAttrs(attrString: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of attrString.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) {
    out[m[1].toLowerCase()] = m[2];
  }
  return out;
}

// Handles all three CAP geocode shapes seen in the wild:
//   <geocode valueName="EMMA_ID" value="BG001"/>          (attribute-style)
//   <geocode valueName="EMMA_ID">BG001</geocode>           (attribute + text)
//   <geocode><valueName>EMMA_ID</valueName><value>BG001</value></geocode> (element-style)
// with or without a "cap:" namespace prefix on any tag.
function parseGeocodes(entryXml: string): CapGeocode[] {
  const geocodes: CapGeocode[] = [];
  const blockRe = /<(?:cap:)?geocode\b([^>]*?)(?:\/>|>([\s\S]*?)<\/(?:cap:)?geocode>)/gi;
  for (const m of entryXml.matchAll(blockRe)) {
    const attrs = parseAttrs(m[1] ?? '');
    const inner = m[2] ?? '';

    let valueName = attrs['valuename'];
    let value = attrs['value'];

    if (!valueName) {
      valueName = inner.match(/<(?:cap:)?valueName>([\s\S]*?)<\/(?:cap:)?valueName>/i)?.[1]?.trim();
    }
    if (!value) {
      value = inner.match(/<(?:cap:)?value>([\s\S]*?)<\/(?:cap:)?value>/i)?.[1]?.trim();
    }
    if (!value && valueName && inner.trim() && !inner.includes('<')) {
      value = inner.trim();
    }

    if (valueName && value) geocodes.push({ valueName, value });
  }
  return geocodes;
}

// CAP polygon = whitespace-delimited "lat,lon" pairs, e.g. "45.0,10.0 45.0,11.0 44.0,10.0".
function parsePolygon(entryXml: string): [number, number][] | null {
  const match = entryXml.match(/<(?:cap:)?polygon>([\s\S]*?)<\/(?:cap:)?polygon>/i);
  if (!match) return null;
  const points: [number, number][] = [];
  for (const pair of match[1].trim().split(/\s+/)) {
    const [latStr, lonStr] = pair.split(',');
    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);
    if (Number.isFinite(lat) && Number.isFinite(lon)) points.push([lat, lon]);
  }
  return points.length >= 3 ? points : null;
}

// Standard ray-casting point-in-polygon test.
function isPointInPolygon(lat: number, lon: number, polygon: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lonI] = polygon[i];
    const [latJ, lonJ] = polygon[j];
    const intersects = (latI > lat) !== (latJ > lat)
      && lon < ((lonJ - lonI) * (lat - latI)) / (latJ - latI) + lonI;
    if (intersects) inside = !inside;
  }
  return inside;
}

// ⚠️ UNVERIFIED: candidate EMMA_ID codes for Bulgaria's 28 oblasts, derived from
// ISO 3166-2:BG's alphabetical numbering (BG-01..BG-28) formatted as "BG0XX" —
// this mirrors the plain sequential convention MeteoAlarm uses for some other
// countries (e.g. Denmark's DK001-DK005), but has NOT been confirmed against a
// real MeteoAlarm entry for Bulgaria. The official metadata endpoint that would
// confirm it (api.meteoalarm.org/metadata/v1) requires member authentication
// we don't have, and the live BG feed had no active warnings to inspect.
// Re-check via /api/debug-meteoalarm next time a real alert fires, and correct
// any codes below that don't match what's actually in the feed.
const BG_OBLAST_EMMA_IDS: Record<string, string> = {
  'благоевград': 'BG001',
  'бургас': 'BG002',
  'варна': 'BG003',
  'велико търново': 'BG004',
  'видин': 'BG005',
  'враца': 'BG006',
  'габрово': 'BG007',
  'добрич': 'BG008',
  'кърджали': 'BG009',
  'кюстендил': 'BG010',
  'ловеч': 'BG011',
  'монтана': 'BG012',
  'пазарджик': 'BG013',
  'перник': 'BG014',
  'плевен': 'BG015',
  'пловдив': 'BG016',
  'разград': 'BG017',
  'русе': 'BG018',
  'силистра': 'BG019',
  'сливен': 'BG020',
  'смолян': 'BG021',
  'софия-град': 'BG022',
  'столична': 'BG022',
  'софийска': 'BG023', // "Софийска област" — Sofia Province, distinct from Sofia City above
  'стара загора': 'BG024',
  'търговище': 'BG025',
  'хасково': 'BG026',
  'шумен': 'BG027',
  'ямбол': 'BG028',
};

// Reverse-geocodes to oblast level (zoom=8) and matches the returned name
// against BG_OBLAST_EMMA_IDS. Only called lazily, and only when an entry
// actually carries an EMMA_ID geocode — most of the time (polygon-only
// entries, or an empty feed) this never fires.
async function resolveUserEmmaId(latitude: number, longitude: number): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(
      `${WEATHER_API_CONFIG.apis.geocoding}?lat=${latitude}&lon=${longitude}&format=json&accept-language=bg&zoom=8`,
      WEATHER_API_CONFIG.timeouts.geocoding
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = (data.address?.state || data.address?.county || data.address?.city || '').toLowerCase();
    for (const [name, id] of Object.entries(BG_OBLAST_EMMA_IDS)) {
      if (raw.includes(name)) return id;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchMeteoAlarmLevel(latitude?: number, longitude?: number): Promise<MeteoAlarmData> {
  const none: MeteoAlarmData = { level: 'none', event: '', expires: '', headline: '' };
  try {
    const res = await fetch('/api/meteoalarm');
    if (!res.ok) return none;
    const xml = await res.text();
    const levelPriority: Record<AlertLevel, number> = { none: 0, yellow: 1, orange: 2, red: 3 };
    let highest: AlertLevel = 'none';
    let bestEvent = '', bestExpires = '', bestHeadline = '';
    // Split into <entry> blocks and process each
    const entries = [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map(m => m[0]);

    const hasLocation = Number.isFinite(latitude) && Number.isFinite(longitude);
    let userEmmaId: string | null | undefined; // undefined = not resolved yet (lazy + memoized)
    const getUserEmmaId = async () => {
      if (userEmmaId === undefined) {
        userEmmaId = hasLocation ? await resolveUserEmmaId(latitude!, longitude!) : null;
      }
      return userEmmaId;
    };

    for (const entry of entries) {
      if (hasLocation) {
        const geocodes = parseGeocodes(entry);
        const emmaGeocode = geocodes.find(g => g.valueName.toUpperCase() === 'EMMA_ID' && g.value);

        if (emmaGeocode) {
          // EMMA_ID present with a concrete value — match it against the user's region.
          const userId = await getUserEmmaId();
          if (!userId || emmaGeocode.value.toUpperCase() !== userId.toUpperCase()) continue;
        } else {
          // EMMA_ID missing/empty — fall through to point-in-polygon.
          const polygon = parsePolygon(entry);
          if (polygon && !isPointInPolygon(latitude!, longitude!, polygon)) continue;
          // No polygon either: can't determine coverage — don't silently drop
          // a potentially relevant alert just because we lack area data for it.
        }
      }

      const sevMatch = entry.match(/<cap:severity>([\s\S]*?)<\/cap:severity>/i);
      if (!sevMatch) continue;
      const s = sevMatch[1].trim().toLowerCase();
      let found: AlertLevel = 'none';
      if (s === 'extreme') found = 'red';
      else if (s === 'severe') found = 'orange';
      else if (s === 'moderate' || s === 'minor') found = 'yellow';
      if (levelPriority[found] > levelPriority[highest]) {
        highest = found;
        bestEvent = (entry.match(/<cap:event>([\s\S]*?)<\/cap:event>/i)?.[1] ?? '').trim();
        bestExpires = (entry.match(/<cap:expires>([\s\S]*?)<\/cap:expires>/i)?.[1] ?? '').trim();
        const hl = (entry.match(/<cap:headline>([\s\S]*?)<\/cap:headline>/i)?.[1] ?? '').trim();
        bestHeadline = hl || bestEvent;
      }
    }
    return { level: highest, event: bestEvent, expires: bestExpires, headline: bestHeadline };
  } catch {
    return none;
  }
}
export async function fetchWeatherData(latitude: number, longitude: number, altitude: number = 0, locationName?: string): Promise<WeatherData> {
  const res = await fetchWithTimeout(
    `${WEATHER_API_CONFIG.apis.weather}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=surface_pressure,temperature_2m,weather_code,precipitation,wind_speed_10m&daily=sunrise,sunset&past_days=1&forecast_days=2&timezone=auto`,
    WEATHER_API_CONFIG.timeouts.weather
  );
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  const current = data.current;
  const info = getWeatherInfo(current.weather_code);

  const hourlyPressure: number[] = data.hourly?.surface_pressure ?? [];
  const hourlyTimes: string[] = data.hourly?.time ?? [];
  const hourlyTemp: number[] = data.hourly?.temperature_2m ?? [];
  const hourlyCode: number[] = data.hourly?.weather_code ?? [];
  const hourlyPrecipitation: number[] = data.hourly?.precipitation ?? [];
  const hourlyWindSpeed: number[] = data.hourly?.wind_speed_10m ?? [];
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const currentHourStr = `${todayStr}T${String(now.getHours()).padStart(2, '0')}:00`;
  let curIdx = hourlyTimes.findIndex(t => t >= currentHourStr);
  if (curIdx === -1) curIdx = hourlyTimes.length - 1;

  // Rolling 24h window starting at the current hour — crosses into tomorrow's
  // data once forecast_days=2 makes it available, instead of stopping at
  // today's 23:00.
  const hourlyForecast: { hour: string; temp: number; code: number; precipitation: number; windSpeed: number }[] = [];
  for (let i = curIdx; i < curIdx + 24 && i < hourlyTimes.length; i++) {
    hourlyForecast.push({
      hour: String(new Date(hourlyTimes[i]).getHours()).padStart(2, '0'),
      temp: Math.round(hourlyTemp[i] ?? 0),
      code: hourlyCode[i] ?? 0,
      precipitation: hourlyPrecipitation[i] ?? 0,
      windSpeed: Math.round(hourlyWindSpeed[i] ?? 0),
    });
  }

  const pressureStartIdx = Math.max(0, curIdx - 5);
  const pressureHistory: { time: string; value: number }[] = [];
  for (let i = pressureStartIdx; i <= curIdx; i++) {
    const t = hourlyTimes[i];
    if (t && hourlyPressure[i] != null) {
      const d = new Date(t);
      pressureHistory.push({
        time: `${String(d.getHours()).padStart(2, '0')}:00`,
        value: hourlyPressure[i],
      });
    }
  }
  const firstP = pressureHistory[0]?.value ?? 0;
  const lastP = pressureHistory[pressureHistory.length - 1]?.value ?? 0;
  const pDiff6h = lastP - firstP;
  const pressureChangeRate = pDiff6h / Math.max(pressureHistory.length - 1, 1);
  const pressureTrend: 'rising' | 'stable' | 'falling' = pDiff6h > 1.5 ? 'rising' : pDiff6h < -1.5 ? 'falling' : 'stable';

  // With forecast_days=2 (needed for the rolling hourly window), data.daily
  // now spans [yesterday, today, tomorrow] — "last entry" no longer means
  // "today", so match it by date instead.
  const dailyTimes: string[] = data.daily?.time ?? [];
  let todayIdx = dailyTimes.findIndex(t => t === todayStr);
  if (todayIdx === -1) todayIdx = (data.daily?.sunrise?.length ?? 1) - 1;
  const sunrise = data.daily?.sunrise?.[todayIdx] ?? '';
  const sunset = data.daily?.sunset?.[todayIdx] ?? '';

  const moonTimesData = getMoonTimes(new Date(), latitude, longitude);
  const solunarPeaks = getSolunarPeaks(moonTimesData);

  const formatIsoTime = (iso: string) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const waterTemp = Math.round(current.temperature_2m * 0.85);

  return {
    temperature: Math.round(current.temperature_2m),
    windSpeed: Math.round(current.wind_speed_10m),
    windDirection: Math.round(current.wind_direction_10m ?? 0),
    humidity: current.relative_humidity_2m,
    weatherCode: current.weather_code,
    weatherLabel: info.label,
    weatherIcon: info.icon,
    latitude,
    longitude,
    altitude: Math.round(altitude),
    locationName: locationName || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    pressure: Math.round(current.surface_pressure),
    pressureTrend,
    pressureChangeRate,
    pressureHistory,
    sunrise: formatIsoTime(sunrise),
    sunset: formatIsoTime(sunset),
    moonrise: moonTimesData.moonrise ?? '--:--',
    moonset: moonTimesData.moonset ?? '--:--',
    moonTransit: moonTimesData.transit ?? '--:--',
    moonAntitransit: moonTimesData.antitransit ?? '--:--',
    solunarPeaks,
    waterTemp,
    meteoAlarm: { level: 'none', event: '', expires: '', headline: '' },
    hourlyForecast,
  };
}
