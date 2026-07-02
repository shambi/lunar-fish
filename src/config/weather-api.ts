/**
 * Weather API Configuration
 * 
 * Centralized configuration for all external API calls.
 * Update here if API endpoints or timeouts change.
 */

export const WEATHER_API_CONFIG = {
  // API Endpoints
  apis: {
    elevation: 'https://api.open-elevation.com/api/v1/lookup',
    weather: 'https://api.open-meteo.com/v1/forecast',
    geocoding: 'https://nominatim.openstreetmap.org/reverse',
  },

  // Request Timeouts (milliseconds)
  timeouts: {
    elevation: 1000,      // Reduced from 3500ms - most queries <1s
    weather: 8000,        // 8 seconds for weather data
    geocoding: 2000,      // 2 seconds for reverse geocoding
    geolocation: 15000,   // 15 seconds for browser geolocation
  },

  // Cache Durations (milliseconds)
  cache: {
    weather: 600000,      // 10 minutes - reload weather data frequently
    meteoAlarm: 300000,   // 5 minutes - storm/severe-weather alerts are safety-critical, must stay fresher than general weather
    geocoding: 86400000,  // 24 hours - location names don't change often
  },

  // HTTP Headers
  headers: {
    geocoding: {
      'User-Agent': 'RiboFishingApp/1.0', // Required by Nominatim terms
    },
  },

  // Geolocation Options
  geolocation: {
    enableHighAccuracy: false,  // Standard accuracy sufficient, better battery
    timeout: 15000,             // 15 second timeout
    maximumAge: 300000,         // 5 minutes - reuse cached position if available
  },

  // Sofia (Bulgaria) Fallback Location
  fallback: {
    latitude: 42.70,
    longitude: 23.35,
    altitude: 550, // meters
    name: 'София',
  },

  // Cache Keys
  cacheKeys: {
    weather: 'lunar-fish-weather-cache',
    meteoAlarm: 'lunar-fish-meteoalarm-cache',
    geocoding: (lat: number, lon: number) => `geocode_${lat.toFixed(3)}_${lon.toFixed(3)}`,
  },
} as const;
