import { useState, useEffect } from 'react';
import { fetchElevation, fetchWeatherData, reverseGeocode, getWeatherInfo, type WeatherData } from '@/lib/weather-service';
export { getWeatherInfo, type WeatherData } from '@/lib/weather-service';

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
        timeout: 15000,
        maximumAge: 300000
      }
    );
  });
}


export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);

  useEffect(() => {
    async function initLocation() {
      setLoading(true);
      setError(null);
      try {
        const position = await getLocation();
        const { latitude, longitude, altitude: gpsAltitude } = position.coords;
        const fallbackAltitude = gpsAltitude ?? 0;
        const altitude = await Promise.race<number>([
          fetchElevation(latitude, longitude, fallbackAltitude),
          new Promise<number>((resolve) => setTimeout(() => resolve(fallbackAltitude), 1500)),
        ]);

        // Reverse geocode to get location name
        setLocationLoading(true);
        const locationName = await reverseGeocode(latitude, longitude);
        setLocationLoading(false);

        const weatherData = await fetchWeatherData(latitude, longitude, altitude, locationName);
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
          const weatherData = await fetchWeatherData(42.70, 23.35, fallbackAltitude, 'София');
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

  return { weather, loading, locationLoading, error, locationDenied };
}
