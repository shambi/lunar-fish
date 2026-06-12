import { useState, useEffect, useRef } from 'react';
import { fetchElevation, fetchWeatherData, reverseGeocode, getWeatherInfo, fetchWithTimeout, fetchMeteoAlarmLevel, type WeatherData, type AlertLevel } from '@/lib/weather-service';
import { WEATHER_API_CONFIG } from '@/config/weather-api';
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
      WEATHER_API_CONFIG.geolocation
    );
  });
}

/**
 * Fetch location name from reverse geocoding API
 * Used in parallel with other API calls for better performance
 */
async function fetchLocationName(latitude: number, longitude: number): Promise<string> {
  try {
    const res = await fetchWithTimeout(
      `${WEATHER_API_CONFIG.apis.geocoding}?lat=${latitude}&lon=${longitude}&format=json&accept-language=bg&zoom=14`,
      WEATHER_API_CONFIG.timeouts.geocoding
    );
    if (!res.ok) return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
    const data = await res.json();
    const city = data.address?.city 
      || data.address?.town 
      || data.address?.village 
      || data.address?.hamlet
      || data.address?.water
      || data.address?.reservoir
      || data.address?.leisure
      || data.address?.natural
      || data.address?.suburb
      || data.address?.municipality
      || data.address?.county
      || data.address?.state_district;
    return city || `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  } catch {
    return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
  }
}


export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const backgroundRefreshRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function initLocation() {
      setError(null);

      // ✅ FIX #1: Check cache freshness first
      const cached = localStorage.getItem(WEATHER_API_CONFIG.cacheKeys.weather);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          
          // Cache is fresh: use it immediately
          if (age < WEATHER_API_CONFIG.cache.weather) {
            setWeather(data);
            setLoading(false);
            
            // Schedule background refresh once (fire-and-forget)
            if (!backgroundRefreshRef.current) {
              backgroundRefreshRef.current = new AbortController();
              silentBackgroundRefresh(backgroundRefreshRef.current.signal);
            }
            return;
          }
        } catch {
          // Invalid cache data, remove it
          localStorage.removeItem(WEATHER_API_CONFIG.cacheKeys.weather);
        }
      }

      // Cache is missing or stale: perform full fetch
      setLoading(true);

      try {
        const position = await getLocation();
        const { latitude, longitude, altitude: gpsAltitude } = position.coords;
        const fallbackAltitude = gpsAltitude ?? WEATHER_API_CONFIG.fallback.altitude;

        // ✅ FIX #2: Use Promise.allSettled() for robust error handling
        // This allows partial success if one API fails
        const results = await Promise.allSettled([
          Promise.race<number>([
            fetchElevation(latitude, longitude, fallbackAltitude),
            new Promise<number>((resolve) => 
              setTimeout(() => resolve(fallbackAltitude), WEATHER_API_CONFIG.timeouts.elevation)
            ),
          ]),
          fetchWeatherData(latitude, longitude, fallbackAltitude),
          fetchLocationName(latitude, longitude),
        ]);

        // Extract results from allSettled
        const altitudeResult = results[0];
        const weatherResult = results[1];
        const nameResult = results[2];

        // Weather data is critical - if it fails, throw error
        if (weatherResult.status === 'rejected') {
          throw weatherResult.reason;
        }

        const weatherData = weatherResult.value;

        // Altitude and location are nice-to-have - use fallbacks if they fail
        const altitude = altitudeResult.status === 'fulfilled' 
          ? altitudeResult.value 
          : fallbackAltitude;

        const locationName = nameResult.status === 'fulfilled'
          ? nameResult.value
          : `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;

        // Merge the data
        weatherData.altitude = altitude;
        weatherData.locationName = locationName;
        weatherData.meteoAlarmLevel = await fetchMeteoAlarmLevel();

        setWeather(weatherData);
        setLocationDenied(false);

        // Cache the result
        localStorage.setItem(WEATHER_API_CONFIG.cacheKeys.weather, JSON.stringify({
          data: weatherData,
          timestamp: Date.now(),
        }));

        setLoading(false);

      } catch (err) {
        console.warn('Geolocation or fetch failed:', err);

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

        // Fallback to Sofia
        try {
          const fallbackAltitude = await fetchElevation(
            WEATHER_API_CONFIG.fallback.latitude,
            WEATHER_API_CONFIG.fallback.longitude,
            WEATHER_API_CONFIG.fallback.altitude
          );
          const weatherData = await fetchWeatherData(
            WEATHER_API_CONFIG.fallback.latitude,
            WEATHER_API_CONFIG.fallback.longitude,
            fallbackAltitude,
            WEATHER_API_CONFIG.fallback.name
          );
          setWeather(weatherData);
        } catch (fetchErr) {
          console.error('Failed to fetch fallback weather for Sofia:', fetchErr);
          setError('Неуспешно зареждане на метеорологичните данни.');
        }

        setLoading(false);
      }
    }

    // ✅ FIX #3: Background refresh runs ONCE per mount, not cyclically
    async function silentBackgroundRefresh(signal: AbortSignal) {
      // Exit early if already aborted (component unmounted)
      if (signal.aborted) return;

      try {
        const position = await getLocation();
        const { latitude, longitude, altitude: gpsAltitude } = position.coords;
        const fallbackAltitude = gpsAltitude ?? 0;

        // Parallelize the three API calls with graceful degradation
        const results = await Promise.allSettled([
          Promise.race<number>([
            fetchElevation(latitude, longitude, fallbackAltitude),
            new Promise<number>((resolve) => 
              setTimeout(() => resolve(fallbackAltitude), WEATHER_API_CONFIG.timeouts.elevation)
            ),
          ]),
          fetchWeatherData(latitude, longitude, fallbackAltitude),
          fetchLocationName(latitude, longitude),
        ]);

        // If aborted during fetch, don't update state
        if (signal.aborted) return;

        const altitudeResult = results[0];
        const weatherResult = results[1];
        const nameResult = results[2];

        // Weather is required for a meaningful refresh
        if (weatherResult.status === 'rejected') {
          console.warn('Background weather refresh failed, keeping cached data');
          return;
        }

        const weatherData = weatherResult.value;
        const altitude = altitudeResult.status === 'fulfilled' 
          ? altitudeResult.value 
          : fallbackAltitude;
        const locationName = nameResult.status === 'fulfilled'
          ? nameResult.value
          : `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;

        weatherData.altitude = altitude;
        weatherData.locationName = locationName;
        weatherData.meteoAlarmLevel = await fetchMeteoAlarmLevel();

        // Update state silently (no loading indicator change)
        setWeather(weatherData);

        // Update cache
        localStorage.setItem(WEATHER_API_CONFIG.cacheKeys.weather, JSON.stringify({
          data: weatherData,
          timestamp: Date.now(),
        }));

      } catch (err) {
        // Silent fail - user keeps cached data
        if (!signal.aborted) {
          console.warn('Background refresh error (silent):', err);
        }
      }
    }

    initLocation();

    // ✅ Cleanup: Cancel background refresh if component unmounts
    return () => {
      backgroundRefreshRef.current?.abort();
    };
  }, []);

  return { weather, loading, error, locationDenied };
}      
