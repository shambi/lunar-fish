import { useEffect, useState } from 'react';
import { getMoonData } from '@/lib/moon';
import { getWeatherInfo } from '@/hooks/use-weather';
import type { WeatherData } from '@/hooks/use-weather';
import { calculateFishingScore } from '@/lib/fishing-score';

interface DayForecast {
  date: Date;
  label: string;
  dateStr: string;
  tempMax: number;
  windMax: number;
  precipitation: number;
  weatherCode: number;
  pressure: number;
}

interface ScoredDay extends DayForecast {
  moonEmoji: string;
  moonPhaseNameBg: string;
  moonBaseScore: number;
  moonIllumination: number;
  finalScore: number;
  weatherIcon: string;
}

function FishScoreIcon({ filled, size = 16 }: { filled: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={filled ? 'text-primary' : 'text-muted-foreground/30'}
    >
      <ellipse cx="22" cy="24" rx="14" ry="10" />
      <path d="M36 24 L44 16 M36 24 L44 32" />
      <path d="M14 14 Q18 8 26 14" />
      <path d="M16 28 L12 34" />
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function ForecastCards({ weather }: { weather: WeatherData | null }) {
  const [days, setDays] = useState<ScoredDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!weather) return;
    const { latitude, longitude, pressure: todayPressure } = weather;

    (async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,wind_speed_10m_max,precipitation_sum,weather_code,surface_pressure_mean&forecast_days=3&timezone=auto`
        );
        if (!res.ok) return;
        const data = await res.json();
        const d = data.daily;

        // Skip index 0 (today), take 1 and 2
        const results: ScoredDay[] = [];
        for (let i = 1; i <= 2; i++) {
          const date = new Date(d.time[i]);
          const moon = getMoonData(date);
          const weatherCode = d.weather_code[i];
          const info = getWeatherInfo(weatherCode);
          const tempMax = Math.round(d.temperature_2m_max[i]);
          const windMax = Math.round(d.wind_speed_10m_max[i]);
          const precipitation = d.precipitation_sum[i];
          const pressure = Math.round(d.surface_pressure_mean?.[i] ?? 0);

          const pressureTrend: 'rising' | 'stable' | 'falling' =
            pressure > todayPressure ? 'rising' : pressure < todayPressure ? 'falling' : 'stable';
          const scoreResult = calculateFishingScore({
            moonScore: moon.fishingScore,
            moonIllumination: moon.illumination,
            temperature: tempMax,
            windSpeed: windMax,
            weatherCode,
            pressureTrend,
            pressureChangeRate: pressure - todayPressure,
            month: date.getMonth() + 1,
            hour: 12,
          });

          const dayNum = date.getDate().toString().padStart(2, '0');
          const monthNum = (date.getMonth() + 1).toString().padStart(2, '0');

          results.push({
            date,
            label: i === 1 ? 'Утре' : 'Вдругиден',
            dateStr: `${dayNum}.${monthNum}`,
            tempMax,
            windMax,
            precipitation,
            weatherCode,
            pressure,
            moonEmoji: moon.emoji,
            moonPhaseNameBg: moon.phaseNameBg,
            moonBaseScore: moon.fishingScore,
            moonIllumination: moon.illumination,
            finalScore: scoreResult.score,
            weatherIcon: info.icon,
          });
        }
        setDays(results);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, [weather]);

  if (!weather || loading || days.length === 0) return null;

  const bestIdx = days[0].finalScore >= days[1].finalScore ? 0 : 1;

  return (
    <section className="mb-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2 px-1">
        📅 Прогноза за следващите дни
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {days.map((day, idx) => {
          const isBest = idx === bestIdx && days[0].finalScore !== days[1].finalScore;
          const { label: scoreLabel, color: scoreColor } = calculateFishingScore({
            moonScore: day.moonBaseScore,
            moonIllumination: day.moonIllumination,
            temperature: day.tempMax,
            windSpeed: day.windMax,
            weatherCode: day.weatherCode,
            pressureTrend: day.pressure > weather.pressure ? 'rising' : day.pressure < weather.pressure ? 'falling' : 'stable',
            pressureChangeRate: day.pressure - weather.pressure,
            month: day.date.getMonth() + 1,
            hour: 12,
          });

          return (
            <div
              key={day.label}
              className={`rounded-lg border p-3 bg-secondary/30 backdrop-blur-md flex flex-col items-center gap-2 transition-all ${
                isBest
                  ? 'border-primary shadow-[0_0_12px_hsl(var(--glow)/0.3)]'
                  : 'border-border opacity-80'
              }`}
            >
              {/* Row 1: date label */}
              <span className="text-[11px] text-muted-foreground">
                {day.label} · {day.dateStr}
              </span>

              {/* Row 2: moon */}
              <div className="flex items-center gap-1.5">
                <span className="text-xl leading-none">{day.moonEmoji}</span>
                <span className="text-xs font-medium text-foreground">{day.moonPhaseNameBg}</span>
              </div>

              {/* Row 3: weather line */}
              <span className="text-[11px] text-muted-foreground">
                {day.weatherIcon} {day.tempMax}°С · {day.windMax} км/ч
              </span>

              {/* Row 4: fish score */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FishScoreIcon key={i} filled={i < day.finalScore} size={16} />
                  ))}
                </div>
                <span className="text-[11px] font-semibold" style={{ color: scoreColor }}>
                  {scoreLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
