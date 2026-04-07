import { useState, useEffect } from 'react';

import { getMoonTimes, getSolunarPeaks, type MoonTimes, type SolunarPeak } from '@/lib/moon-times';

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
  solunarPeaks: SolunarPeak[];
  waterTemp: number;
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

function getLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000
      }
    );
  });
}

async function fetchElevation(latitude: number, longitude: number, fallbackAltitude = 0): Promise<number> {
  try {
    const res = await fetch(
      `https://api.open-elevation.com/api/v1/lookup?locations=${latitude},${longitude}`
    );
    if (!res.ok) return fallbackAltitude;
    const data = await res.json();
    const elevation = data?.results?.[0]?.elevation;
    return Number.isFinite(elevation) ? Math.round(elevation) : fallbackAltitude;
  } catch {
    return fallbackAltitude;
  }
}

async function fetchWeatherData(latitude: number, longitude: number, altitude: number = 0) {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=surface_pressure&daily=sunrise,sunset&past_days=1&forecast_days=1&timezone=auto`
  );
  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  const current = data.current;
  const info = getWeatherInfo(current.weather_code);

  const hourlyPressure: number[] = data.hourly?.surface_pressure ?? [];
  const hourlyTimes: string[] = data.hourly?.time ?? [];
  const now = new Date();
  const currentHourStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}T${String(now.getHours()).padStart(2,'0')}:00`;
  let curIdx = hourlyTimes.findIndex(t => t >= currentHourStr);
  if (curIdx === -1) curIdx = hourlyTimes.length - 1;
  const startIdx = Math.max(0, curIdx - 5);
  const pressureHistory: { time: string; value: number }[] = [];
  for (let i = startIdx; i <= curIdx; i++) {
    const t = hourlyTimes[i];
    if (t && hourlyPressure[i] != null) {
      const d = new Date(t);
      pressureHistory.push({
        time: `${String(d.getHours()).padStart(2,'0')}:00`,
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

  const fmtTime = (iso: string) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const waterTemp = Math.round(current.temperature_2m * 0.85);

  let locationName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=bg&zoom=10`
    );
    if (geoRes.ok) {
      const geoData = await geoRes.json();
      const city = geoData.address?.city || geoData.address?.town || geoData.address?.village || geoData.address?.municipality;
      if (city) locationName = city;
    }
  } catch {
    // ignore
  }

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
    locationName,
    pressure: Math.round(current.surface_pressure),
    pressureTrend,
    pressureChangeRate,
    pressureHistory,
    sunrise: fmtTime(sunrise),
    sunset: fmtTime(sunset),
    moonrise: moonTimesData.moonrise ?? '--:--',
    moonset: moonTimesData.moonset ?? '--:--',
    moonTransit: moonTimesData.transit ?? '--:--',
    moonAntitransit: moonTimesData.antitransit ?? '--:--',
    solunarPeaks,
    waterTemp,
  };
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    async function initLocation() {
      try {
        const position = await getLocation();
        const { latitude, longitude, altitude: gpsAltitude } = position.coords;
        const altitude = await fetchElevation(latitude, longitude, gpsAltitude ?? 0);

        const weatherData = await fetchWeatherData(latitude, longitude, altitude);
        setWeather(weatherData);
        setLocationDenied(false);
        setLoading(false);
      } catch (err) {
        console.warn('Geolocation failed:', err);

        if (err instanceof GeolocationPositionError) {
          if (err.code === 1) {
            setLocationDenied(true);
            setError('Локацията е отказана. Използва се София като местоположение по подразбиране.');
          } else if (err.code === 2) {
            setError('Локацията не е достъпна. Използва се София като местоположение по подразбиране.');
          } else if (err.code === 3) {
            setError('Времето изтече. Използва се София като местоположение по подразбиране.');
          }
        } else {
          setError('Грешка при определяне на локацията. Използва се София като местоположение по подразбиране.');
        }

        try {
          const fallbackAltitude = await fetchElevation(42.70, 23.35, 550);
          const weatherData = await fetchWeatherData(42.70, 23.35, fallbackAltitude);
          weatherData.locationName = 'София (по подразбиране)';
          setWeather(weatherData);
        } catch (fetchErr) {
          console.error('Failed to fetch weather for fallback location:', fetchErr);
          setError('Неуспешно зареждане на метеорологичните данни.');
        }

        setLoading(false);
      }
    }

    initLocation();
  }, []);

  return { weather, loading, error, locationDenied };
}
