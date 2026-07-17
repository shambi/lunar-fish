import { useState, useEffect, useRef } from 'react';
import { fetchElevation, fetchWeatherData, reverseGeocode, getWeatherInfo, fetchWithTimeout, fetchMeteoAlarmLevel, type WeatherData, type AlertLevel, type MeteoAlarmData } from '@/lib/weather-service';
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


// meteoAlarm gets its own cache key with a much shorter TTL than the general weather
// blob — storm warnings are safety-critical and must not ride along on a 10-minute
// temperature/wind cache.
function getCachedMeteoAlarm(): MeteoAlarmData | null {
  const cached = localStorage.getItem(WEATHER_API_CONFIG.cacheKeys.meteoAlarm);
  if (!cached) return null;
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < WEATHER_API_CONFIG.cache.meteoAlarm) return data;
  } catch {
    localStorage.removeItem(WEATHER_API_CONFIG.cacheKeys.meteoAlarm);
  }
  return null;
}

async function getFreshMeteoAlarm(latitude?: number, longitude?: number): Promise<MeteoAlarmData> {
  const alarm = await fetchMeteoAlarmLevel(latitude, longitude);
  localStorage.setItem(WEATHER_API_CONFIG.cacheKeys.meteoAlarm, JSON.stringify({
    data: alarm,
    timestamp: Date.now(),
  }));
  return alarm;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationDenied, setLocationDenied] = useState(false);
  const isFetchingRef = useRef(false);
  const locationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    const refreshController = new AbortController();

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
            const cachedAlarm = getCachedMeteoAlarm();
            setWeather(cachedAlarm ? { ...data, meteoAlarm: cachedAlarm } : data);
            setLoading(false);

            // meteoAlarm has its own (shorter) TTL — if it's stale, refresh it right
            // away instead of waiting for the general weather cache to expire.
            if (!cachedAlarm) {
              getFreshMeteoAlarm(data.latitude, data.longitude)
                .then(alarm => setWeather(prev => (prev ? { ...prev, meteoAlarm: alarm } : prev)))
                .catch(() => {});
            }

            // Kick off one background refresh right away so a cache-hit mount
            // still catches up to the latest conditions quickly; the recurring
            // interval set up below keeps refreshing every cache.weather ms after that.
            silentBackgroundRefresh(refreshController.signal);
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
        // GPS altitude of exactly 0 almost always means "no altitude reading",
        // not a real sea-level position (Bulgaria has none) — don't trust it.
        const fallbackAltitude = (gpsAltitude && gpsAltitude !== 0) ? gpsAltitude : WEATHER_API_CONFIG.fallback.altitude;
        console.log('[useWeather] gpsAltitude from device:', gpsAltitude, '— fallbackAltitude resolved to:', fallbackAltitude);

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
        console.log('[useWeather] final resolved altitude:', altitude, '(race status:', altitudeResult.status, ')');

        const locationName = nameResult.status === 'fulfilled'
          ? nameResult.value
          : `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;

        // Merge the data
        weatherData.altitude = altitude;
        weatherData.locationName = locationName;
        weatherData.meteoAlarm = await getFreshMeteoAlarm(latitude, longitude);

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
          weatherData.meteoAlarm = await getFreshMeteoAlarm(
            WEATHER_API_CONFIG.fallback.latitude,
            WEATHER_API_CONFIG.fallback.longitude
          );
          setWeather(weatherData);
        } catch (fetchErr) {
          console.error('Failed to fetch fallback weather for Sofia:', fetchErr);
          setError('Неуспешно зареждане на метеорологичните данни.');
        }

        setLoading(false);
      }
    }

    // Refreshes weather data in the background without touching the loading
    // state. Called once immediately on a cache-hit mount, then repeatedly by
    // the recurring interval below for as long as the component stays mounted.
    async function silentBackgroundRefresh(signal: AbortSignal) {
      // Exit early if already aborted (component unmounted), or if a
      // previous refresh is still in flight — avoid overlapping fetches.
      if (signal.aborted || isFetchingRef.current) return;
      isFetchingRef.current = true;

      try {
        const position = await getLocation();
        const { latitude, longitude, altitude: gpsAltitude } = position.coords;
        // GPS altitude of exactly 0 almost always means "no altitude reading",
        // not a real sea-level position (Bulgaria has none) — don't trust it.
        const fallbackAltitude = (gpsAltitude && gpsAltitude !== 0) ? gpsAltitude : WEATHER_API_CONFIG.fallback.altitude;
        console.log('[useWeather:silentBackgroundRefresh] gpsAltitude:', gpsAltitude, '— fallbackAltitude resolved to:', fallbackAltitude);

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
        weatherData.meteoAlarm = await getFreshMeteoAlarm(latitude, longitude);

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
      } finally {
        isFetchingRef.current = false;
      }
    }

    initLocation();

    // Keep temperature/wind/humidity/weather code fresh for as long as the app
    // stays mounted, on the same cadence as the weather cache TTL — mirrors the
    // meteoAlarm interval below instead of refreshing only once per mount.
    const refreshInterval = setInterval(() => {
      silentBackgroundRefresh(refreshController.signal);
    }, WEATHER_API_CONFIG.cache.weather);

    // ✅ Cleanup: Cancel any in-flight refresh and stop the interval on unmount
    return () => {
      refreshController.abort();
      clearInterval(refreshInterval);
    };
  }, []);

  // Track the latest known coordinates so the meteoAlarm interval below (which
  // has no location in scope of its own) can still filter alerts regionally.
  useEffect(() => {
    if (weather) {
      locationRef.current = { latitude: weather.latitude, longitude: weather.longitude };
    }
  }, [weather]);

  // A tab left open (e.g. at the reservoir) would otherwise never see a storm
  // warning that appears mid-session — poll just the small meteoAlarm feed on
  // its own short TTL, independent of the full weather refresh above.
  useEffect(() => {
    const interval = setInterval(() => {
      getFreshMeteoAlarm(locationRef.current?.latitude, locationRef.current?.longitude)
        .then(alarm => setWeather(prev => (prev ? { ...prev, meteoAlarm: alarm } : prev)))
        .catch(() => {});
    }, WEATHER_API_CONFIG.cache.meteoAlarm);
    return () => clearInterval(interval);
  }, []);

  return { weather, loading, error, locationDenied };
}
