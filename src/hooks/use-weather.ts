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

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Геолокацията не се поддържа от вашия браузър.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, altitude: gpsAltitude } = position.coords;
        const altitude = gpsAltitude ?? 0;
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&hourly=surface_pressure&daily=sunrise,sunset&past_days=1&forecast_days=1&timezone=auto`
          );
          if (!res.ok) throw new Error('API грешка');
          const data = await res.json();
          const current = data.current;
          const info = getWeatherInfo(current.weather_code);

          // Pressure history — last 6 hours from hourly data (includes past_days=1)
          const hourlyPressure: number[] = data.hourly?.surface_pressure ?? [];
          const hourlyTimes: string[] = data.hourly?.time ?? [];
          const now = new Date();
          // Find current hour index in the combined array
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
          // 6-hour trend
          const firstP = pressureHistory[0]?.value ?? 0;
          const lastP = pressureHistory[pressureHistory.length - 1]?.value ?? 0;
          const pDiff6h = lastP - firstP;
          const pressureChangeRate = pDiff6h / Math.max(pressureHistory.length - 1, 1);
          const pressureTrend: 'rising' | 'stable' | 'falling' = pDiff6h > 1.5 ? 'rising' : pDiff6h < -1.5 ? 'falling' : 'stable';

          // Sunrise/sunset
          const todayIdx = (data.daily?.sunrise?.length ?? 1) - 1;
          const sunrise = data.daily?.sunrise?.[todayIdx] ?? '';
          const sunset = data.daily?.sunset?.[todayIdx] ?? '';

          // Moon times from astronomical calculations
          const moonTimesData = getMoonTimes(new Date(), latitude, longitude);
          const solunarPeaks = getSolunarPeaks(moonTimesData);

          const fmtTime = (iso: string) => {
            if (!iso) return '--:--';
            const d = new Date(iso);
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
          };

          // Water temp approximation
          const waterTemp = Math.round(current.temperature_2m * 0.85);

          // Reverse geocode for location name
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
            // ignore — keep coordinates as fallback
          }

          setWeather({
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
          });
        } catch (err) {
          setError('Неуспешно зареждане на метеорологичните данни.');
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setLocationDenied(true);
        setError('Моля, разрешете достъп до локацията за точни данни.');
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }, []);

  return { weather, loading, error, locationDenied };
}
