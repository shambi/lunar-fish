import { useState, useEffect } from 'react';

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  humidity: number;
  weatherCode: number;
  weatherLabel: string;
  weatherIcon: string;
  latitude: number;
  longitude: number;
  locationName: string;
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

function getWeatherInfo(code: number) {
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
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
          );
          if (!res.ok) throw new Error('API грешка');
          const data = await res.json();
          const current = data.current;
          const info = getWeatherInfo(current.weather_code);

          // Reverse geocode for location name
          let locationName = `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
          try {
            const geoRes = await fetch(
              `https://geocoding-api.open-meteo.com/v1/search?name=&latitude=${latitude}&longitude=${longitude}&count=1&language=bg`
            );
            // Open-Meteo geocoding doesn't support reverse, so we use a simple fallback
          } catch {
            // ignore
          }

          setWeather({
            temperature: Math.round(current.temperature_2m),
            windSpeed: Math.round(current.wind_speed_10m),
            humidity: current.relative_humidity_2m,
            weatherCode: current.weather_code,
            weatherLabel: info.label,
            weatherIcon: info.icon,
            latitude,
            longitude,
            locationName,
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
