import { useMemo, useState, useEffect } from 'react';
import { getMoonData } from '@/lib/moon';
import { getSmartFishingTips, getTimePeriod } from '@/lib/fishing-expert';
import { calculateFishingScore } from '@/lib/fishing-score';
import { useWeather } from '@/hooks/use-weather';
import { Cloud, Wind, Droplets, ThermometerSun, Anchor, Fish, Loader as Loader2, Gauge, Mountain, LocateFixed } from 'lucide-react';
import { FishGuide } from '@/components/FishGuide';
import { ForecastCards } from '@/components/ForecastCards';
import { PerchIcon, CarpIcon, PikeIcon, BreamIcon, CatfishIcon } from '@/components/FishIcons';
import { AdviceIcon } from '@/components/AdviceIcon';

const SolunarTimeline = ({ weather }: { weather: any }) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const parseTime = (s: string) => {
    if (!s || s === '--:--') return -1;
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const timeToX = (s: string) => {
    const min = parseTime(s);
    if (min < 0) return -10;
    return 2 + (min / 1440) * 96;
  };
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const isInRange = (start: string, end: string) => {
    const s = parseTime(start), e = parseTime(end);
    if (s < 0 || e < 0) return false;
    return s <= e ? (currentMin >= s && currentMin <= e) : (currentMin >= s || currentMin <= e);
  };

  const peaks = [...(weather.solunarPeaks || [])].sort(
    (a: any, b: any) => parseTime(a.start) - parseTime(b.start)
  );

  const getCountdown = () => {
    for (const p of peaks) {
      if (isInRange(p.start, p.end)) {
        const eMin = parseTime(p.end);
        const remaining = eMin > currentMin ? eMin - currentMin : 1440 - currentMin + eMin;
        return { active: true as const, type: p.type, minutes: remaining };
      }
    }
    for (const p of peaks) {
      const sMin = parseTime(p.start);
      if (sMin > currentMin) {
        const diff = sMin - currentMin;
        return { active: false as const, type: p.type, hours: Math.floor(diff / 60), minutes: diff % 60 };
      }
    }
    if (peaks.length > 0) {
      const sMin = parseTime(peaks[0].start);
      const diff = 1440 - currentMin + sMin;
      return { active: false as const, type: peaks[0].type, hours: Math.floor(diff / 60), minutes: diff % 60 };
    }
    return null;
  };
  const countdown = getCountdown();

  const sunriseX = timeToX(weather.sunrise);
  const sunsetX = timeToX(weather.sunset);
  const nowX = 2 + (currentMin / 1440) * 96;

  return (
    <div className="space-y-2">
      {/* Sun/Moon pills */}
      <div className="flex justify-between text-[10px] opacity-80">
        <span>🌅 <span className="text-white">{weather.sunrise || '--:--'}</span></span>
        <span>🌙↑ <span className="text-white">{weather.moonrise || '--:--'}</span></span>
        <span>🌙↓ <span className="text-white">{weather.moonset || '--:--'}</span></span>
        <span>🌆 <span className="text-white">{weather.sunset || '--:--'}</span></span>
      </div>

      {/* Timeline SVG */}
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="w-full" style={{ height: 46 }}>
        <line x1="2" y1="12" x2="98" y2="12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.4" />
        {[0, 6, 12, 18, 24].map(h => {
          const x = 2 + (h / 24) * 96;
          return <line key={h} x1={x} y1="10.5" x2={x} y2="13.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.3" />;
        })}
        <line x1={nowX} y1="4" x2={nowX} y2="20" stroke="#E4FF00" strokeWidth="0.4" opacity="0.85" />
        {sunriseX > 0 && <circle cx={sunriseX} cy="12" r="1.5" fill="#FF8C42" />}
        {sunsetX > 0 && <circle cx={sunsetX} cy="12" r="1.5" fill="#FF8C42" />}
        {peaks.map((p: any, i: number) => {
          const x = timeToX(p.start);
          const isMajor = p.type === 'major';
          const active = isInRange(p.start, p.end);
          return (
            <g key={i}>
              <circle
                cx={x} cy="12" r={isMajor ? 2.2 : 1.6}
                fill={isMajor ? '#2eb5b7' : 'rgba(46,181,183,0.55)'}
                style={active ? { filter: 'drop-shadow(0 0 2px #2eb5b7)' } : {}}
              >
                {active && <animate attributeName="r" values={`${isMajor?2.2:1.6};${isMajor?3:2.2};${isMajor?2.2:1.6}`} dur="1.5s" repeatCount="indefinite" />}
              </circle>
              <text x={x} y="20" fontSize="2.6" fill="rgba(255,255,255,0.7)" textAnchor="middle">{p.start}</text>
            </g>
          );
        })}
        {sunriseX > 0 && <text x={sunriseX} y="7" fontSize="2.4" fill="rgba(255,140,66,0.85)" textAnchor="middle">изгрев</text>}
        {sunsetX > 0 && <text x={sunsetX} y="7" fontSize="2.4" fill="rgba(255,140,66,0.85)" textAnchor="middle">залез</text>}
      </svg>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 text-[9px] opacity-70">
        <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: '#2eb5b7' }} />Главен</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: 'rgba(46,181,183,0.55)' }} />Малък</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full" style={{ background: '#FF8C42' }} />Слънце</span>
      </div>

      {/* countdown is rendered as the section's verdict above the timeline */}
      {void countdown}
    </div>
  );
};


const Index = () => {
  const moon = useMemo(() => getMoonData(), []);
  const { weather, loading, error, locationDenied } = useWeather();
  const [terrain, setTerrain] = useState<'river' | 'lake'>('lake');

  const today = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).replace(/\s*г\.?\s*$/i, '');

  const currentHour = new Date().getHours();
  const timePeriod = getTimePeriod(currentHour);
  const now = new Date();
  const fishingScore = useMemo(
    () =>
      calculateFishingScore({
        moonScore: moon.fishingScore,
        moonIllumination: moon.illumination,
        temperature: weather?.temperature ?? 15,
        windSpeed: weather?.windSpeed ?? 10,
        weatherCode: weather?.weatherCode ?? 1,
        pressureTrend: weather?.pressureTrend ?? 'stable',
        pressureChangeRate: weather?.pressureChangeRate ?? 0,
        altitude: weather?.altitude ?? 0,
        month: now.getMonth() + 1,
        hour: now.getHours(),
      }),
    [moon, weather],
  );

  // Detect if currently inside a solunar peak
  const solunarContext = useMemo(() => {
    if (!weather?.solunarPeaks) return { isInPeak: false, peakType: null as 'major' | 'minor' | null };
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    for (const peak of weather.solunarPeaks) {
      const [sh, sm] = (peak.start || '').split(':').map(Number);
      const [eh, em] = (peak.end || '').split(':').map(Number);
      if (isNaN(sh) || isNaN(eh)) continue;
      const s = sh * 60 + sm;
      const e = eh * 60 + em;
      const inRange = s <= e ? (currentMin >= s && currentMin <= e) : (currentMin >= s || currentMin <= e);
      if (inRange) return { isInPeak: true, peakType: peak.type as 'major' | 'minor' };
    }
    return { isInPeak: false, peakType: null as 'major' | 'minor' | null };
  }, [weather]);

  const stripEmojis = (text: string) => {
    return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const tips = useMemo(() => {
    if (!weather) return null;
    const rawTips = getSmartFishingTips(moon, weather.temperature, weather.windSpeed, weather.weatherCode, {
      terrain,
      pressureTrend: weather.pressureTrend,
      waterTemp: weather.waterTemp,
      sunrise: weather.sunrise,
      sunset: weather.sunset,
      timePeriod,
      isInPeak: solunarContext.isInPeak,
      peakType: solunarContext.peakType,
    });

    return {
      ...rawTips,
      weatherTip: stripEmojis(rawTips.weatherTip),
      windTip: stripEmojis(rawTips.windTip),
      timingTip: stripEmojis(rawTips.timingTip),
      fishingStyleTip: stripEmojis(rawTips.fishingStyleTip),
    };
  }, [moon, weather, terrain, timePeriod, solunarContext]);

  const swimAnimations = ['fish-swim-1', 'fish-swim-2', 'fish-swim-3'];
  const iconSequence = [PerchIcon, CarpIcon, PikeIcon, BreamIcon, CatfishIcon];
  
  const fishIcons = Array.from({ length: Math.max(0, Math.min(5, Math.round(fishingScore.score))) }, (_, i) => {
    const Icon = iconSequence[i % iconSequence.length];
    return (
      <div
        key={i}
        className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
        style={{ animation: `${swimAnimations[i % 3]} ${7 + i * 1.2}s ease-in-out infinite` }}
      >
        <Icon size={24} className="text-primary" strokeWidth={2} />
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-ocean/40 via-background to-background pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_70%_20%/0.3)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 pb-8">
        {/* Header */}
        <header className="pt-4 pb-1 text-center">
          <h1
            className="font-display text-3xl font-medium tracking-wide flex items-center justify-center gap-1"
            style={{ color: '#E2E8F0', animation: 'title-glow 4s ease-in-out infinite' }}
          >
            РИБО
            <svg
              width="24"
              height="24"
              viewBox="0 0 48 48"
              fill="none"
              stroke="#2eb5b7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ 
                transform: 'translateY(0.5px)',
                filter: 'drop-shadow(0 0 6px #2eb5b7)'
              }}
            >
              <ellipse cx="22" cy="24" rx="14" ry="10" />
              <path d="M36 24 L44 16 M36 24 L44 32" />
              <circle cx="12" cy="22" r="1.5" fill="#2eb5b7" />
            </svg>
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: '#94A3B8' }}>{today}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs" style={{ color: '#94A3B8' }}>
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Определяне на локация...</span>
              </>
            ) : weather ? (
              <span className="inline-flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                </svg>
                <span>{weather.locationName}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                </svg>
                <span>София</span>
              </span>
            )}
          </div>
        </header>

        {/* Moon Phase Hero */}
        <section className="flex flex-col items-center mt-4 mb-4">
          <div
            className="text-8xl leading-none select-none"
            style={{
              animation: 'pulse-glow 4s ease-in-out infinite, moon-drift 10s ease-in-out infinite',
              borderRadius: '50%',
              filter: 'drop-shadow(0 0 20px hsl(180 80% 55% / 0.4))',
            }}
          >
            {moon.emoji}
          </div>
          <h2 className="font-display text-xl font-semibold mt-4" style={{ color: '#E2E8F0' }}>
            {moon.phaseNameBg}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#2eb5b7' }}>
            {moon.illumination}% Осветеност
          </p>
        </section>

        {/* DECISION BANNER — Level 1 action */}
        {(() => {
          const score = fishingScore.score;
          const inPeak = solunarContext.isInPeak;
          let verdict = 'Слаба активност';
          let context = 'Условията са слаби';
          let glow = false;
          let color = '#7F93A8';
          if (fishingScore.isOverride) {
            verdict = 'Не ловувай';
            context = stripEmojis(fishingScore.overrideReason || 'Опасни условия');
            color = '#FF8C42';
          } else if (inPeak) {
            verdict = 'Активен прозорец';
            context = solunarContext.peakType === 'major' ? 'Главен солунарен пик' : 'Малък солунарен пик';
            glow = true;
            color = '#2eb5b7';
          } else if (score >= 4) {
            verdict = 'Активен прозорец';
            context = 'Рибата е будна';
            glow = true;
            color = '#2eb5b7';
          } else if (score >= 3) {
            verdict = 'Следващ пик скоро';
            context = 'Подготви точката';
            color = '#E4FF00';
          } else if (score >= 2) {
            verdict = 'Стабилни условия';
            context = 'Активността е слаба';
            color = '#E4FF00';
          }
          return (
            <section
              className="rounded-2xl backdrop-blur-md p-4 mb-3"
              style={{
                background: glow
                  ? 'linear-gradient(135deg, rgba(46,181,183,0.08), rgba(46,181,183,0.02))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${glow ? 'rgba(46,181,183,0.35)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: glow ? '0 0 16px rgba(46,181,183,0.12)' : 'none',
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div
                    className="font-display text-lg font-medium tracking-tight leading-none"
                    style={{ color }}
                  >
                    {verdict}
                  </div>
                  <div className="text-[12px] mt-1.5 leading-snug" style={{ color: 'rgba(234,247,255,0.65)' }}>
                    {context}
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <div className="flex gap-0.5">{fishIcons}</div>
                  <div className="text-[9px] mt-1 uppercase tracking-wider" style={{ color: 'rgba(127,147,168,0.8)' }}>
                    {fishingScore.label}
                  </div>
                </div>
              </div>
              <p className="text-[11px] mt-3 pt-3 border-t border-white/5 leading-relaxed" style={{ color: 'rgba(234,247,255,0.5)' }}>
                {stripEmojis(moon.fishingTip)}
              </p>
            </section>
          );
        })()}

        {/* Smart Weather Tips (only when weather is loaded) */}
        {tips && (
          <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-4 mb-3">
            <h3 className="font-display text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#E4FF00"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ 
                  transform: 'translateY(0.5px)',
                  opacity: 0.85
                }}
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
              Анализ
            </h3>
            <div className="space-y-3">
              {fishingScore.isOverride && fishingScore.overrideReason && (
                <div className="flex gap-3">
                  <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF5350" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold leading-relaxed" style={{ color: '#EF5350' }}>
                    {stripEmojis(fishingScore.overrideReason)}
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                  <Cloud className="w-4 h-4" style={{ color: 'rgba(234,247,255,0.45)' }} strokeWidth={1.5} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{tips.weatherTip}</p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                  <Wind className="w-4 h-4" style={{ color: 'rgba(234,247,255,0.45)' }} strokeWidth={1.5} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{tips.windTip}</p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={solunarContext.isInPeak ? '#2eb5b7' : 'rgba(234,247,255,0.45)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{
                  color: solunarContext.isInPeak && solunarContext.peakType === 'major'
                    ? '#2eb5b7'
                    : solunarContext.isInPeak && solunarContext.peakType === 'minor'
                    ? 'rgba(46,181,183,0.6)'
                    : 'rgba(255, 255, 255, 0.8)'
                }}>
                  {tips.timingTip}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Fishing Style Tip */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-4 mb-3">
          <h3 className="font-display text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              fill="none"
              stroke="#E4FF00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ 
                transform: 'translateY(0.5px)',
                opacity: 0.85
              }}
            >
              <ellipse cx="22" cy="24" rx="16" ry="5" />
              <path d="M38 24 L46 17 M38 24 L46 31" />
              <path d="M20 19 Q22 15 24 19" />
              <path d="M24 29 Q26 33 28 29" />
              <circle cx="9" cy="23" r="1.5" fill="#E4FF00" />
              <path d="M10 24 L36 24" opacity="0.2" />
            </svg>
            Съвети за стил
          </h3>
          <div className="flex gap-3">
            <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
              <Anchor className="w-4 h-4" style={{ color: 'rgba(234,247,255,0.45)' }} strokeWidth={1.5} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {tips ? tips.fishingStyleTip : stripEmojis(moon.fishingStyleTip)}
            </p>
          </div>
        </section>

        {/* Weather Widget — Bento Grid */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-4 mb-3">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E4FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.85 }}>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" /><path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" /><path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </svg>
            Условия
          </h3>
          {/* Interpretation lead — Level 2 */}
          {weather && (() => {
            const trend = weather.pressureTrend;
            const wind = weather.windSpeed;
            let title = 'Стабилно налягане';
            let effect = 'Рибата е спокойна — работи бавна презентация';
            let dot = '#7F93A8';
            if (trend === 'rising') {
              title = 'Покачващо налягане';
              effect = 'По-активна риба — увеличи темпото';
              dot = '#2eb5b7';
            } else if (trend === 'falling') {
              title = 'Падащо налягане';
              effect = 'Очаквай агресивни удари преди фронта';
              dot = '#E4FF00';
            }
            if (wind > 25) {
              title = 'Силен вятър';
              effect = 'Лови по подветрения бряг — мътна вода';
              dot = '#FF8C42';
            }
            return (
              <div className="mb-3 flex items-start gap-2.5">
                <span className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold leading-tight" style={{ color: '#EAF7FF' }}>{title}</div>
                  <div className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(127,147,168,0.95)' }}>→ {effect}</div>
                </div>
              </div>
            );
          })()}
          {loading && !weather ? (
            <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Зареждане на времето...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              {/* TEMP */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                <ThermometerSun className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-base font-bold leading-none text-white">{weather ? `${weather.temperature}°` : '—'}</div>
                <div className="text-[8px] mt-0.5 opacity-50">ТЕМП.</div>
              </div>
              {/* WIND */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                <Wind className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-base font-bold leading-none text-white">{weather ? weather.windSpeed : '—'}</div>
                <div className="text-[8px] mt-0.5 opacity-50">КМ/Ч</div>
              </div>
              {/* PRESSURE w/ sparkline */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                <Gauge className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                {weather && weather.pressureHistory.length > 1 ? (() => {
                  const values = weather.pressureHistory.map(h => h.value);
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const range = max - min || 1;
                  const w = 40, h = 8;
                  const d = values.map((v, i) => {
                    const x = (i / (values.length - 1)) * w;
                    const y = h - ((v - min) / range) * h;
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ');
                  return (
                    <svg viewBox="0 0 40 8" className="w-full h-2 mb-0.5">
                      <path d={d} fill="none" stroke="#2eb5b7" strokeWidth="1" />
                    </svg>
                  );
                })() : <div className="h-2 mb-0.5" />}
                <div className="text-sm font-bold leading-none text-white">{weather ? weather.pressure : '—'}</div>
                <div className="text-[8px] mt-0.5 opacity-50">
                  {weather ? (weather.pressureTrend === 'rising' ? '↗ хПа' : weather.pressureTrend === 'falling' ? '↘ хПа' : '→ хПа') : 'хПа'}
                </div>
              </div>
              {/* HUMIDITY */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                <Droplets className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-base font-bold leading-none text-white">{weather ? `${weather.humidity}%` : '—'}</div>
                <div className="text-[8px] mt-0.5 opacity-50">ВЛАГА</div>
              </div>
              {/* ALTITUDE */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center">
                <Mountain className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-base font-bold leading-none text-white">{weather ? Math.round(weather.altitude) : '—'}</div>
                <div className="text-[8px] mt-0.5 opacity-50">М. Н.В.</div>
              </div>
              {/* WEATHER ICON */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-2 text-center flex flex-col justify-center">
                <span className="text-xl leading-none">{weather ? weather.weatherIcon : '—'}</span>
                <div className="text-[8px] mt-1 opacity-50 leading-tight whitespace-nowrap overflow-hidden text-ellipsis" title={weather?.weatherLabel}>
                  {weather?.weatherLabel ?? '...'}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Solunar Activity Section — Compact Timeline */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-4 mb-3">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E4FF00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ 
                transform: 'translateY(0.5px)',
                opacity: 0.85
              }}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            Солунарна активност
          </h3>
          {weather && weather.solunarPeaks ? (
            <>
              {(() => {
                const parse = (s: string) => { if (!s || s === '--:--') return -1; const [h,m]=s.split(':').map(Number); return h*60+m; };
                const nowMin = new Date().getHours()*60 + new Date().getMinutes();
                const peaks = [...weather.solunarPeaks].sort((a:any,b:any)=>parse(a.start)-parse(b.start));
                let active: any = null;
                for (const p of peaks) {
                  const s=parse(p.start), e=parse(p.end);
                  if (s<0||e<0) continue;
                  const inR = s<=e ? (nowMin>=s && nowMin<=e) : (nowMin>=s || nowMin<=e);
                  if (inR) { active = { ...p, remaining: (e>nowMin?e-nowMin:1440-nowMin+e) }; break; }
                }
                let next: any = null;
                if (!active) {
                  for (const p of peaks) {
                    const s=parse(p.start);
                    if (s>nowMin) { next = { ...p, diff: s-nowMin }; break; }
                  }
                  if (!next && peaks.length) { const s=parse(peaks[0].start); next = { ...peaks[0], diff: 1440-nowMin+s }; }
                }
                const verdict = active ? 'Активен прозорец' : (next && next.diff <= 60 ? 'Следващ пик скоро' : 'Стабилни условия');
                const subtitle = active
                  ? `${active.type === 'major' ? 'Главен' : 'Малък'} пик · още ${active.remaining}мин`
                  : next ? `Следващ ${next.type === 'major' ? 'главен' : 'малък'} пик след ${Math.floor(next.diff/60)}ч ${next.diff%60}м` : '';
                const color = active ? '#2eb5b7' : (next && next.diff <= 60 ? '#E4FF00' : '#7F93A8');
                return (
                  <div className="mb-3">
                    <div className="font-display text-lg font-medium tracking-tight leading-none"
                      style={{ color }}>
                      {verdict}
                    </div>
                    <div className="text-[11px] mt-1.5" style={{ color: 'rgba(127,147,168,0.85)' }}>{subtitle}</div>
                  </div>
                );
              })()}
              <SolunarTimeline weather={weather} />
            </>
          ) : (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Зареждане...
              </span>
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-4 mb-3">
          <h3 className="font-display text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 48 48"
              fill="none"
              stroke="#E4FF00"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ 
                transform: 'translateY(0.5px)',
                opacity: 0.85
              }}
            >
              <path d="M2 24 L6 21 Q14 18 28 18 Q38 18 40 22 L42 24 L40 26 Q38 30 28 30 Q14 30 6 27Z" />
              <path d="M2 24 L6 23 M2 24 L6 25" />
              <path d="M42 24 L48 15 M42 24 L48 33" />
              <path d="M32 18 Q35 12 38 18" />
              <path d="M32 30 Q35 36 38 30" />
              <circle cx="8" cy="23" r="1.5" fill="#E4FF00" />
              <path d="M2 24 L10 25" opacity="0.3" />
            </svg>
            Съвети
          </h3>

          {/* Baits */}
          <div className="mb-3">
            <h4 className="text-xs font-medium text-[#2eb5b7] uppercase tracking-wider mb-3 flex items-center gap-1">
              <Fish className="w-[14px] h-[14px]" strokeWidth={2} style={{ stroke: '#E4FF00', transform: 'translateY(0.5px)', opacity: 0.85 }} />
              Стръв
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {(tips?.baits ?? moon.baits).map((bait) => (
                <div
                  key={bait.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-2.5 py-2 min-w-0"
                >
                  <AdviceIcon name={bait.name} size={28} />
                  <span
                    className="text-[12px] font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1"
                    title={bait.name}
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {bait.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tackle */}
          <div>
            <h4 className="text-xs font-medium text-[#2eb5b7] uppercase tracking-wider mb-3 flex items-center gap-1">
              <Anchor className="w-[14px] h-[14px]" strokeWidth={2} style={{ stroke: '#E4FF00', transform: 'translateY(0.5px)', opacity: 0.85 }} />
              Такъми
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {(tips?.tackle ?? moon.tackle).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-2.5 py-2 min-w-0"
                >
                  <AdviceIcon name={item.name} size={28} />
                  <span
                    className="text-[12px] font-medium leading-tight whitespace-nowrap overflow-hidden text-ellipsis min-w-0 flex-1"
                    title={item.name}
                    style={{ color: 'rgba(255,255,255,0.85)' }}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multi-day Forecast */}
        <ForecastCards weather={weather} />

        {/* Fish Guide */}
        <FishGuide
          moon={moon}
          weather={weather}
          terrain={terrain}
          onTerrainChange={setTerrain}
          solunarContext={solunarContext}
        />

        <footer className="text-center mt-8 space-y-1">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Наслука!</p>
          {weather && (
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Данните са базирани на текущата ви локация • <span className="text-white">Open-Meteo API</span>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
