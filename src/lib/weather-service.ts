import { getMoonTimes, getSolunarPeaks } from '@/lib/moon-times';
import { WEATHER_API_CONFIG } from '@/config/weather-api';

export type AlertLevel = 'none' | 'yellow' | 'orange' | 'red';

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
  meteoAlarmLevel: AlertLevel;
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
  71: { label: 'Лек сняг', icon: '🌨️' },
  73: { label: 'Умерен сняг', icon: '🌨️' },
  75: { label: 'Силен сняг', icon: '❄️' },
  80: { label: 'Леки превалявания', icon: '🌦️' },
  81: { label: 'Умерени превалявания', icon: '🌧️' },
  82: { label: 'Силни превалявания', icon: '⛈️' },
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
    if (!res.ok) return fallbackAltitude;
    const data = await res.json();
    const elevation = data?.results?.[0]?.elevation;
    return Number.isFinite(elevation) ? Math.round(elevation) : fallbackAltitude;
  } catch {
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

export async function fetchMeteoAlarmLevel(): Promise<AlertLevel> {
  try {
    const res = await fetch('/api/meteoalarm');
    if (!res.ok) return 'none';
    const xml = await res.text();
    const levelPriority: Record<AlertLevel, number> = { none: 0, yellow: 1, orange: 2, red: 3 };
    let highest: AlertLevel = 'none';
    const severities = xml.matchAll(/<cap:severity>([\s\S]*?)<\/cap:severity>/gi);
    for (const match of severities) {
      const s = match[1].trim().toLowerCase();
      let found: AlertLevel = 'none';
      if (s === 'extreme') found = 'red';
      else if (s === 'severe') found = 'orange';
      else if (s === 'moderate' || s === 'minor') found = 'yellow';
      if (levelPriority[found] > levelPriority[highest]) highest = found;
    }
    return highest;
  } catch {
    return 'none';
  }
  }
export async function fetchWeatherData(latitude: number, longitude: number, altitude: number = 0, locationName?: string): Promise<WeatherData> {
  const res = await fetchWithTimeout(
    `${WEATHER_API_CONFIG.apis.weather}?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=surface_pressure&daily=sunrise,sunset&past_days=1&forecast_days=1&timezone=auto`,
    WEATHER_API_CONFIG.timeouts.weather
  );
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  const current = data.current;
  const info = getWeatherInfo(current.weather_code);

  const hourlyPressure: number[] = data.hourly?.surface_pressure ?? [];
  const hourlyTimes: string[] = data.hourly?.time ?? [];
  const now = new Date();
  const currentHourStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T${String(now.getHours()).padStart(2, '0')}:00`;
  let curIdx = hourlyTimes.findIndex(t => t >= currentHourStr);
  if (curIdx === -1) curIdx = hourlyTimes.length - 1;
  const startIdx = Math.max(0, curIdx - 5);
  const pressureHistory: { time: string; value: number }[] = [];
  for (let i = startIdx; i <= curIdx; i++) {
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

  const todayIdx = (data.daily?.sunrise?.length ?? 1) - 1;
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
    meteoAlarmLevel: 'none',
  };
}
