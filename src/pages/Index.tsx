import { useMemo, useState, useEffect } from 'react';
import { getMoonData } from '@/lib/moon';
import { getSmartFishingTips, getTimePeriod } from '@/lib/fishing-expert';
import { calculateFishingScore } from '@/lib/fishing-score';
import { useWeather } from '@/hooks/use-weather';
import { Cloud, Wind, Droplets, ThermometerSun, Anchor, Fish, Loader as Loader2, Gauge, Mountain, LocateFixed } from 'lucide-react';
import { FishGuide } from '@/components/FishGuide';
import { ForecastCards } from '@/components/ForecastCards';
import { PerchIcon, CarpIcon, PikeIcon, BreamIcon, CatfishIcon } from '@/components/FishIcons';

const SolunarSection = ({ weather }: { weather: any }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  const parseTime = (t: string): number => {
    if (!t || t === '--:--') return -1;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const currentMin = now.getHours() * 60 + now.getMinutes();

  const isInRange = (start: string, end: string): boolean => {
    const s = parseTime(start);
    const e = parseTime(end);
    if (s < 0 || e < 0) return false;
    if (s <= e) return currentMin >= s && currentMin <= e;
    return currentMin >= s || currentMin <= e;
  };

  const peaks = [...(weather.solunarPeaks || [])].sort((a: any, b: any) => parseTime(a.start) - parseTime(b.start));

  // Find next peak or active peak for countdown
  const getCountdown = () => {
    for (const peak of peaks) {
      if (isInRange(peak.start, peak.end)) {
        const endMin = parseTime(peak.end);
        const remaining = endMin > currentMin ? endMin - currentMin : (1440 - currentMin + endMin);
        return { active: true, type: peak.type, minutes: remaining };
      }
    }
    // Find next upcoming
    for (const peak of peaks) {
      const startMin = parseTime(peak.start);
      if (startMin > currentMin) {
        const diff = startMin - currentMin;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        return { active: false, type: peak.type, hours: h, minutes: m };
      }
    }
    // Wrap to first peak tomorrow
    if (peaks.length > 0) {
      const startMin = parseTime(peaks[0].start);
      const diff = (1440 - currentMin) + startMin;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return { active: false, type: peaks[0].type, hours: h, minutes: m };
    }
    return null;
  };

  const countdown = getCountdown();

  const getPeakLocation = (peak: any): string => {
    if (peak.label?.includes('зенит')) return 'Луна в зенит';
    if (peak.label?.includes('надир')) return 'Луна в надир';
    if (peak.label?.includes('Изгрев') || peak.label?.includes('изгрев')) return 'Изгрев на луната';
    if (peak.label?.includes('Залез') || peak.label?.includes('залез')) return 'Залез на луната';
    return '';
  };

  // Feeding advice logic
  const getFeedingAdvice = (): { text: string; urgent: boolean } | null => {
    if (!countdown || !weather?.temperature) return null;
    const temp = weather.temperature;

    // Currently inside a peak
    if (countdown.active) {
      return { text: 'Рибата е активна — не захранвай повече, хвърляй стръв!', urgent: false };
    }

    const totalMin = (countdown.hours || 0) * 60 + countdown.minutes;

    // More than 60 min away — no advice
    if (totalMin > 60) return null;

    const isMajor = countdown.type === 'major';

    if (isMajor) {
      if (totalMin > 30) {
        // 60-30 min before major
        if (temp < 8) return { text: 'Захрани умерено — студената вода забавя рибата. По-малки порции.', urgent: false };
        if (temp <= 18) return { text: 'Захрани обилно — добри условия. Хвърли повече захранка на едно място.', urgent: false };
        return { text: 'Захрани умерено — топлата вода намалява апетита. По-малки порции.', urgent: false };
      } else {
        // 30-0 min before major
        if (temp < 8) return { text: 'Захрани сега! Малки порции — пикът започва скоро.', urgent: true };
        if (temp <= 18) return { text: 'Захрани сега! Хвърли обилно — пикът започва след малко!', urgent: true };
        return { text: 'Захрани сега! Умерено — пикът започва скоро.', urgent: true };
      }
    } else {
      // Minor peak 60-0 min
      if (temp < 8) return { text: 'Малък пик наближава — символично захранване.', urgent: false };
      return { text: 'Малък пик наближава — лека захранка.', urgent: false };
    }
  };

  const feedingAdvice = getFeedingAdvice();

  // Fish SVG for peak cards (same as Активност component)
  const PeakFishIcon = ({ glow, color }: { glow: boolean; color: string }) => (
    <svg width="13" height="13" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="22" cy="24" rx="14" ry="10" />
      <path d="M36 24 L44 16 M36 24 L44 32" />
      <circle cx="12" cy="22" r="1.5" fill={color} />
    </svg>
  );

  return (
    <div className="space-y-1.5">
      {/* PART 1 — Two pill badges */}
      <div className="flex gap-1.5">
        <div className="flex-1 text-center rounded-[20px] py-[4px] px-[10px]"
          style={{ background: 'rgba(255,140,66,0.12)', border: '1px solid rgba(255,140,66,0.4)' }}>
          <span style={{ fontSize: '11px', color: '#FF8C42' }}>
            <span className="text-white">{weather.sunrise || '--:--'}</span> • <span className="text-white">{weather.sunset || '--:--'}</span>
          </span>
        </div>
        <div className="flex-1 text-center rounded-[20px] py-[4px] px-[10px]"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.3)' }}>
          <span style={{ fontSize: '11px', color: '#00F5FF' }}>
            <span className="text-white">{weather.moonrise || '--:--'}</span> • <span className="text-white">{weather.moonset || '--:--'}</span>
          </span>
        </div>
      </div>

      {/* PART 2 — Activity cards */}
      <div className="space-y-1">
        {peaks.map((peak: any, i: number) => {
          const isMajor = peak.type === 'major';
          const active = isInRange(peak.start, peak.end);

          return (
            <div key={i} className="relative rounded-lg"
              style={{
                padding: '10px',
                ...(isMajor ? {
                  background: 'rgba(0,18,28,0.9)',
                  border: '1.5px solid #00D4D4',
                  boxShadow: '0 0 10px rgba(0,212,212,0.2)',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }),
              }}>
              {/* СЕГА АКТИВНО badge */}
              {active && (
                <div className="absolute -top-2 left-3 rounded-[10px] px-2 py-0.5 text-[9px] font-bold"
                  style={{
                    background: '#00D4D4', color: '#000',
                    animation: 'pulse-active 1.5s ease-in-out infinite',
                  }}>
                  СЕГА АКТИВНО
                </div>
              )}

              <div className="flex items-center">
                {/* LEFT — Time range */}
                <div className="w-[40%]">
                  <div className="font-bold leading-tight"
                    style={{
                      fontSize: isMajor ? '18px' : '15px',
                      color: isMajor ? '#fff' : 'rgba(255,255,255,0.7)',
                    }}>
                    {peak.start} —<br />{peak.end}
                  </div>
                  <div className="mt-0.5" style={{
                    fontSize: '9px',
                    color: isMajor ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.35)',
                  }}>
                    {getPeakLocation(peak)}
                  </div>
                </div>

                {/* CENTER — Title */}
                <div className="w-[40%]">
                  <div className="font-bold tracking-wider"
                     style={{
                      fontSize: '11px',
                      letterSpacing: '1px',
                      color: isMajor ? '#00D4D4' : 'rgba(0,212,212,0.5)',
                    }}>
                    {isMajor ? 'ГЛАВЕН ПИК' : 'МАЛЪК ПИК'}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: isMajor ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.35)',
                    marginTop: '1px',
                  }}>
                    {isMajor ? 'Най-висока вероятност за удар.' : 'Умерена активност.'}
                  </div>
                </div>

                {/* RIGHT — Fish icons */}
                <div className="w-[20%] flex flex-col items-center gap-0.5">
                  {Array.from({ length: isMajor ? 3 : 1 }).map((_, fi) => (
                    <span key={fi}>
                      <PeakFishIcon
                        glow={isMajor}
                        color={isMajor ? '#00D4D4' : 'rgba(0,212,212,0.3)'}
                      />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* PART 3 — Next peak countdown + feeding advice */}
      {countdown && (
        <div className="text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {countdown.active ? (
              <span style={{ color: '#00D4D4' }}>
                Активен пик още <strong>{countdown.minutes}мин.</strong>
              </span>
            ) : (
              <>
                Следващ <strong className="text-white">{countdown.type === 'major' ? 'Главен' : 'Малък'} пик</strong> след{' '}
                <strong className="text-white">{countdown.hours}ч. {countdown.minutes}мин.</strong>
              </>
            )}
          </p>
          {feedingAdvice && (
            <p className="mt-1" style={{
              fontSize: '11px',
              color: feedingAdvice.urgent ? '#00D4D4' : 'rgba(255,255,255,0.7)',
              fontWeight: feedingAdvice.urgent ? 600 : 400,
            }}>
              {feedingAdvice.text}
            </p>
          )}
        </div>
      )}
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
  const fishingScore = calculateFishingScore({
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
  });

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
            className="font-display text-3xl font-medium tracking-wide"
            style={{ color: '#CBD5E1', animation: 'title-glow 4s ease-in-out infinite' }}
          >
            РИБ
            <span className="relative inline-block">
              О
              {/* Fish hook integrated into О */}
              <svg
                className="absolute -bottom-1 -right-1.5 text-primary opacity-70"
                width="14" height="18" viewBox="0 0 14 18" fill="none"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              >
                <path d="M7 0 L7 10 Q7 15 4 15 Q1 15 1 12" />
                <circle cx="1" cy="11" r="1" fill="currentColor" />
              </svg>
            </span>
          </h1>
          <p className="text-sm mt-1 capitalize" style={{ color: 'rgba(255,255,255,0.8)' }}>{today}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Определяне на локация...</span>
              </>
            ) : weather ? (
              <span>{weather.locationName}</span>
            ) : (
              <span>София (по подразбиране)</span>
            )}
          </div>
        </header>

        {/* Moon Phase Hero */}
        <section className="flex flex-col items-center mt-4 mb-6">
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
          <h2 className="font-display text-xl font-semibold mt-4" style={{ color: '#CBD5E1' }}>
            {moon.phaseNameBg}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {moon.illumination}% Осветеност
          </p>
        </section>

        {/* Fishing Forecast */}
        <section 
          className="rounded-xl bg-card/60 backdrop-blur-md p-5 mb-4"
          style={{
            border: '1px solid #00D4D4',
            boxShadow: '0 0 10px rgba(0,212,212,0.2)',
          }}
        >
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
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
                filter: 'drop-shadow(0 0 6px #E4FF00)'
              }}
            >
              <ellipse cx="22" cy="24" rx="14" ry="10" />
              <path d="M36 24 L44 16 M36 24 L44 32" />
              <circle cx="12" cy="22" r="1.5" fill="#E4FF00" />
            </svg>
            РИБО ПРОГНОЗА
          </h3>
          {fishingScore.isOverride && fishingScore.overrideReason && (
            <div
              className="mb-3"
              style={{
                background: 'rgba(239, 83, 80, 0.15)',
                border: '1px solid #EF5350',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                color: '#EF5350',
              }}
            >
              ВНИМАНИЕ: {stripEmojis(fishingScore.overrideReason)}
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1">{fishIcons}</div>
            <span className="text-lg font-bold font-display text-white">
              {fishingScore.label}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {stripEmojis(moon.fishingTip)}
          </p>
        </section>

        {/* Smart Weather Tips (only when weather is loaded) */}
        {tips && (
          <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
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
                  filter: 'drop-shadow(0 0 6px #E4FF00)'
                }}
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
              УМНИ СЪВЕТИ
            </h3>
            <div className="space-y-5">
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
                  <Cloud className="w-4 h-4 text-[#00F5FF]" strokeWidth={1.5} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{tips.weatherTip}</p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                  <Wind className="w-4 h-4 text-[#00F5FF]" strokeWidth={1.5} />
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>{tips.windTip}</p>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00F5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{
                  color: solunarContext.isInPeak && solunarContext.peakType === 'major'
                    ? '#00F5FF'
                    : solunarContext.isInPeak && solunarContext.peakType === 'minor'
                    ? 'rgba(0,245,255,0.6)'
                    : 'rgba(255, 255, 255, 0.8)'
                }}>
                  {tips.timingTip}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Fishing Style Tip */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
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
                filter: 'drop-shadow(0 0 6px #E4FF00)'
              }}
            >
              <ellipse cx="22" cy="24" rx="16" ry="5" />
              <path d="M38 24 L46 17 M38 24 L46 31" />
              <path d="M20 19 Q22 15 24 19" />
              <path d="M24 29 Q26 33 28 29" />
              <circle cx="9" cy="23" r="1.5" fill="#E4FF00" />
              <path d="M10 24 L36 24" opacity="0.2" />
            </svg>
            СЪВЕТИ ЗА СТИЛ РИБОЛОВ
          </h3>
          <div className="flex gap-3">
            <div className="w-5 h-5 mt-0.5 shrink-0 flex items-center justify-center">
              <Anchor className="w-4 h-4 text-[#00F5FF]" strokeWidth={1.5} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {tips ? tips.fishingStyleTip : stripEmojis(moon.fishingStyleTip)}
            </p>
          </div>
        </section>

        {/* Weather Widget */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
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
                transform: 'translateY(0.5px)'
              }}
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </svg>
            МЕТЕОРОЛОГИЧНИ УСЛОВИЯ
          </h3>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Зареждане на времето...</span>
            </div>
          ) : error && !weather ? (
            <div className="text-center py-4">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{error}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Показват се примерни данни</p>
            </div>
          ) : null}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <ThermometerSun className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display" style={{ color: '#FFFFFF' }}>
                {weather ? `${weather.temperature}°C` : '—'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Темп.</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display" style={{ color: '#FFFFFF' }}>
                {weather ? `${weather.windSpeed} км/ч` : '—'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Вятър</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display" style={{ color: '#FFFFFF' }}>
                {weather ? `${weather.humidity}%` : '—'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Влажност</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Mountain className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display" style={{ color: '#FFFFFF' }}>
                {weather ? `${weather.altitude} м` : '—'}
              </span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Надморска</span>
            </div>
          </div>
          {/* Divider + Second Row */}
          <div className="border-t border-border my-4" />
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Enhanced Barometer */}
            <div className="col-span-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-primary" />
                  <span className="text-lg font-bold font-display" style={{ color: '#FFFFFF' }}>
                    {weather ? `${weather.pressure} хПа` : '—'}
                  </span>
                </div>
                {weather ? (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    weather.pressureTrend === 'rising' ? 'bg-green-500/20 text-green-400' :
                    weather.pressureTrend === 'falling' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <span className="inline-flex items-center gap-1">
                      {weather.pressureTrend === 'rising' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 19V5" />
                          <path d="M7 10L12 5L17 10" />
                        </svg>
                      ) : weather.pressureTrend === 'falling' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M12 5V19" />
                          <path d="M7 14L12 19L17 14" />
                        </svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M5 12H19" />
                          <path d="M15 8L19 12L15 16" />
                        </svg>
                      )}
                      <span>{weather.pressureTrend === 'rising' ? 'Нарастващо' : weather.pressureTrend === 'falling' ? 'Падащо' : 'Стабилно'}</span>
                    </span>
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Зареждане...</span>
                )}
              </div>
              {weather && (
                <div className="flex items-center gap-2 mb-2 rounded-md bg-secondary/30 px-2 py-1.5">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 48 48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/90 shrink-0"
                    aria-hidden="true"
                  >
                    <ellipse cx="22" cy="24" rx="14" ry="10" />
                    <path d="M36 24 L44 16 M36 24 L44 32" />
                    <circle cx="12" cy="22" r="1.5" fill="currentColor" />
                  </svg>
                  <p className="text-xs text-left" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {weather.pressureTrend === 'rising'
                      ? 'Налягането се покачва - чакай по-активна риба.'
                      : weather.pressureTrend === 'falling'
                      ? 'Налягането пада - кълването вероятно ще е по-плахо.'
                      : 'Стабилно налягане - добри условия за риболов.'}
                  </p>
                </div>
              )}
              {/* Mini pressure graph */}
              {weather && weather.pressureHistory.length > 1 && (() => {
                const hist = weather.pressureHistory;
                const values = hist.map(h => h.value);
                const minV = Math.min(...values) - 0.5;
                const maxV = Math.max(...values) + 0.5;
                const range = maxV - minV || 1;
                const w = 280;
                const h = 48;
                const padding = 4;
                const points = values.map((v, i) => ({
                  x: padding + (i / (values.length - 1)) * (w - padding * 2),
                  y: padding + (1 - (v - minV) / range) * (h - padding * 2),
                }));
                const pathD = points.map((p, i) => {
                  if (i === 0) return `M ${p.x} ${p.y}`;
                  const prev = points[i - 1];
                  const cx = (prev.x + p.x) / 2;
                  return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
                }).join(' ');
                const areaD = `${pathD} L ${points[points.length-1].x} ${h} L ${points[0].x} ${h} Z`;
                const lastP = points[points.length - 1];

                return (
                  <div>
                    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 48 }}>
                      <defs>
                        <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaD} fill="url(#pressureGradient)" />
                      <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                      <circle cx={lastP.x} cy={lastP.y} r={3} fill="hsl(var(--primary))" style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary)))' }} />
                    </svg>
                  </div>
                );
              })()}
              {!weather && (
                <div className="flex items-center justify-center py-4">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Зареждане...</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
            {weather ? (
              <>
                <span className="text-xl">{weather.weatherIcon}</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>{weather.weatherLabel}</span>
              </>
            ) : (
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>Зареждане...</span>
            )}
          </div>
        </section>

        {/* Solunar Activity Section — SVG Timeline */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
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
                transform: 'translateY(0.5px)'
              }}
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
            СОЛУНАРНА АКТИВНОСТ
          </h3>
          {weather && weather.solunarPeaks ? (
            <SolunarSection weather={weather} />
          ) : (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Зареждане...
              </span>
            </div>
          )}
        </section>
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: '#CBD5E1' }}>
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
                filter: 'drop-shadow(0 0 6px #E4FF00)'
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
            РИБО СЪВЕТИ
          </h3>

          {/* Baits */}
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-[#00F5FF] uppercase tracking-wider mb-3 flex items-center gap-1">
              СТРЪВ
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {(tips?.baits ?? moon.baits).map((bait) => (
                <div
                  key={bait.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{bait.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tackle */}
          <div>
            <h4 className="text-xs font-semibold text-[#00F5FF] uppercase tracking-wider mb-3 flex items-center gap-1">
              ТАКЪМИ
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {(tips?.tackle ?? moon.tackle).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2.5"
                >
                  <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>{item.name}</span>
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
