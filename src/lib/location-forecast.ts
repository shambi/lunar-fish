import { calculateFishingScore } from '@/lib/fishing-score';
import { getMoonData } from '@/lib/moon';
import { fetchElevation, fetchWeatherData, type WeatherData } from '@/lib/weather-service';

export interface LocationForecastResult {
  weather: WeatherData;
  fishing: ReturnType<typeof calculateFishingScore>;
}

const forecastCache = new Map<string, LocationForecastResult>();

export async function getLocationForecast(latitude: number, longitude: number): Promise<LocationForecastResult> {
  const key = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  if (forecastCache.has(key)) {
    return forecastCache.get(key)!;
  }

  const altitude = await fetchElevation(latitude, longitude, 0);
  const weather = await fetchWeatherData(latitude, longitude, altitude);
  const moon = getMoonData(new Date());
  const now = new Date();

  const fishing = calculateFishingScore({
    moonScore: moon.fishingScore,
    moonIllumination: moon.illumination,
    temperature: weather.temperature,
    windSpeed: weather.windSpeed,
    weatherCode: weather.weatherCode,
    pressureTrend: weather.pressureTrend,
    pressureChangeRate: weather.pressureChangeRate,
    altitude: weather.altitude,
    month: now.getMonth() + 1,
    hour: now.getHours(),
  });

  const result = { weather, fishing };
  forecastCache.set(key, result);
  return result;
}
