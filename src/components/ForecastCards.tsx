import { useEffect, useState } from 'react';
import { getMoonData } from '@/lib/moon';
import { getWeatherInfo } from '@/hooks/use-weather';
import type { WeatherData } from '@/hooks/use-weather';
import { calculateFishingScore } from '@/lib/fishing-score';
import { Cloud } from 'lucide-react';

function ForecastWeatherIcon({ code }: { code: number }) {
  const s = { stroke: '#2eb5b7' as const };
  if (code === 0 || code === 1) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
    </svg>
  );
  if (code === 2) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <circle cx="10" cy="9" r="3"/><path d="M10 4v1M10 13v1M5 9H4M16 9h-1M6.76 6.76l-.7-.7M13.94 6.76l.7-.7"/>
      <path d="M7 16a4 4 0 0 1 7.87-1A3 3 0 1 1 17 22H7a4 4 0 0 1 0-8v2"/>
    </svg>
  );
  if (code === 3) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
    </svg>
  );
  if (code === 45 || code === 48) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <path d="M3 10h18M3 14h18M3 18h18"/>
    </svg>
  );
  if (code >= 51 && code <= 67) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      <path d="M8 19v2M8 13v2M12 21v2M12 15v2M16 19v2M16 13v2"/>
    </svg>
  );
  if (code >= 71 && code <= 77) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      <path d="M8 19l-1 2M10 19l-1 2M12 19l-1 2M14 19l-1 2M16 19l-1 2"/>
    </svg>
  );
  if (code >= 80 && code <= 82) return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      <path d="M8 19v2M12 19v2M16 19v2"/>
    </svg>
  );
  // thunderstorm / hail
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" {...s}>
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      <path d="M13 10l-4 6h5l-4 6"/>
    </svg>
  );
}

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
            altitude: weather.altitude || 0,
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
    <section className="mb-2">
      <h3 className="font-display text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5 px-1" style={{ color: '#869393' }}>
        <Cloud className="w-[14px] h-[14px]" strokeWidth={1.5} style={{ stroke: '#C8E63C', color: '#C8E63C' }} />
        Прогноза
      </h3>
      <div className="grid grid-cols-2 gap-2">
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
            altitude: weather.altitude || 0,
            month: day.date.getMonth() + 1,
            hour: 12,
          });

          return (
            <div
              key={day.label}
              className={`rounded-lg border p-2 bg-secondary/30 backdrop-blur-md flex flex-col items-center gap-1.5 transition-all ${
                isBest
                  ? 'border-primary shadow-[0_0_12px_hsl(var(--glow)/0.3)]'
                  : 'border-border opacity-80'
              }`}
            >
              {/* Row 1: date label */}
              <span className="text-[11px]" style={{ color: '#94A3B8' }}>
                {day.label} · <span style={{ color: '#FFFFFF' }}>{day.dateStr}</span>
              </span>

              {/* Row 2: moon */}
              <div className="flex items-center gap-1.5">
                <span className="text-xl leading-none">{day.moonEmoji}</span>
                <span className="text-xs font-medium" style={{ color: '#94A3B8' }}>{day.moonPhaseNameBg}</span>
              </div>

              {/* Row 3: weather line */}
              <span className="text-[11px] flex items-center gap-1" style={{ color: '#94A3B8' }}>
                <ForecastWeatherIcon code={day.weatherCode} />
                <span style={{ color: '#FFFFFF' }}>{day.tempMax}°С</span> · <span style={{ color: '#FFFFFF' }}>{day.windMax} км/ч</span>
              </span>

              {/* Row 4: fish score */}
              <div className="flex flex-col items-center gap-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <span key={i}>
                      <FishScoreIcon filled={i < day.finalScore} size={16} />
                    </span>
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
