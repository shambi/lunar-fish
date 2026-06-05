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

  const currentMin = now.getHours() * 60 + now.getMinutes();
  const isInRange = (start: string, end: string) => {
    const s = parseTime(start), e = parseTime(end);
    if (s < 0 || e < 0) return false;
    return s <= e ? (currentMin >= s && currentMin <= e) : (currentMin >= s || currentMin <= e);
  };

  const peaks = [...(weather.solunarPeaks || [])].sort(
    (a: any, b: any) => parseTime(a.start) - parseTime(b.start)
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <tbody>
          {peaks.map((peak: any, idx: number) => {
            const isActive = isInRange(peak.start, peak.end);
            const isMajor = peak.type === 'major';

            return (
              <tr
                key={idx}
                className={`border-b border-white/5 transition-colors ${
                  isActive
                    ? 'bg-[#2eb5b7]/8'
                    : 'hover:bg-white/3'
                }`}
              >
                {/* Time */}
                <td className="px-2 py-1.5 whitespace-nowrap">
                  <div className="text-xs font-semibold text-white">
                    {peak.start} — {peak.end}
                  </div>
                </td>

                {/* Type */}
                <td className="px-2 py-1.5">
                  <div className={`text-[10px] font-bold uppercase tracking-wider inline-block ${
                    isMajor ? 'text-[#2eb5b7]' : 'text-[#94A3B8]'
                  }`}>
                    {isMajor ? '★ Главен' : 'Малък'}
                  </div>
                </td>

                {/* Status */}
                <td className="px-2 py-1.5 text-right">
                  {isActive ? (
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#2eb5b7] animate-pulse" />
                      <span className="text-[9px] font-bold text-[#2eb5b7] uppercase">Активен</span>
                    </div>
                  ) : (
                    <span className="text-[9px] text-white/50">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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

      <div className="relative z-10 max-w-md mx-auto px-3 pb-6">
        {/* Header */}
        <header className="pt-3 pb-0.5 text-center">
          <img src="/ribo-logo.svg" alt="РИБО" className="h-20 w-auto mx-auto block" />


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
        <section className="flex flex-col items-center mt-2 mb-3">
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
          <h2 className="font-display text-xl font-semibold mt-2" style={{ color: '#E2E8F0' }}>
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
          let glow = false;
          let color = fishingScore.color;
          if (fishingScore.isOverride) {
            color = '#FF8C42';
          } else if (inPeak || score >= 4) {
            glow = true;
            color = '#2eb5b7';
          }

          const windSpeed = weather?.windSpeed ?? 0;
          const pressureTrend = weather?.pressureTrend ?? 'stable';
          const weatherCode = weather?.weatherCode ?? 1;
          const temperature = weather?.temperature ?? 15;
          const hour = currentHour;

          const getScoreReason = (): string => {
            if (solunarContext.isInPeak) return 'Солунарен пик сега — оптимален момент';
            if (fishingScore.isOverride) return stripEmojis(fishingScore.overrideReason || 'Опасни условия');
            if (windSpeed > 25) return 'Силен вятър намалява активността';
            if (pressureTrend === 'rising' && weatherCode <= 2) return 'Стабилно налягане и ясно небе';
            if (pressureTrend === 'falling') return 'Падащо налягане — рибата е пасивна';
            if (temperature > 26 && hour >= 10 && hour <= 16) return 'Горещо — търси сенчести участъци';
            if (pressureTrend === 'stable' && windSpeed < 15) return 'Тихо и стабилно — добри условия';
            return 'Средни условия за риболов';
          };

          return (
            <section
              className="rounded-2xl backdrop-blur-md p-5 mb-2"
              style={{
                background: glow
                  ? 'linear-gradient(135deg, rgba(46,181,183,0.08), rgba(46,181,183,0.02))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${glow ? 'rgba(46,181,183,0.35)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: glow ? '0 0 32px rgba(46,181,183,0.25)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {fishIcons.map((icon, i) => (
                    <div key={i} className="w-9 h-9 flex items-center justify-center">{icon}</div>
                  ))}
                  {score === 5 && (
                    <div
                      key="bonus"
                      className="w-9 h-9 flex items-center justify-center"
                      style={{
                        color: '#E4FF00',
                        animation: 'pulse-citron-bonus 2s ease-in-out infinite',
                      }}
                    >
                      <PerchIcon size={24} strokeWidth={2} />
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold" style={{ color }}>
                  {fishingScore.label}
                </div>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(234,247,255,0.65)' }}>
                {getScoreReason()}
              </p>
            </section>
          );
        })()}

        {/* УСЛОВИЯ ДНЕС — Premium redesign */}
        {tips && (
          <section
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '16px',
              marginBottom: '10px',
            }}
          >
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#869393',
              marginBottom: '14px',
            }}>
              Условия днес
            </div>

            {fishingScore.isOverride && fishingScore.overrideReason && (
              <div style={{
                background: 'rgba(147,0,10,0.15)',
                border: '1px solid rgba(255,180,171,0.25)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(147,0,10,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#ffb4ab" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase', color: '#ffb4ab', marginBottom: '4px' }}>
                    Внимание
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(255,180,171,0.9)' }}>
                    {stripEmojis(fishingScore.overrideReason)}
                  </div>
                </div>
              </div>
            )}

            {/* РЕД 1 — Времето */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start',
              paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(46,181,183,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'rgba(222,228,227,0.85)' }}>
                {tips.weatherTip}
              </div>
            </div>

            {/* РЕД 2 — Вятър */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start',
              paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(46,181,183,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
                  <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
                  <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'rgba(222,228,227,0.85)' }}>
                {tips.windTip}
              </div>
            </div>

            {/* РЕД 3 — Стил на риболов */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start',
              paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(46,181,183,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 16.98h-5.99c-1.1 0-1.95.68-2.23 1.61A3 3 0 0 1 3 17c.01-.98.33-2.36 1.34-3.07.75-.52 1.2-1.37 1.2-2.29V8a6 6 0 0 1 10.56-3.88"/>
                  <path d="m15 9 3 3-3 3"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'rgba(46,181,183,0.75)' }}>
                {tips.fishingStyleTip}
              </div>
            </div>

            {/* РЕД 4 — Светлина */}
            {(() => {
              const hour = new Date().getHours();
              const isCloudy = weather.weatherCode >= 2;
              const isNight = hour < 5 || hour >= 21;
              const isDawn = (hour >= 5 && hour < 7) || (hour >= 19 && hour < 21);

              let lightLabel = 'Добра';
              let lightDetail = 'Нормална видимост.';

              if (isNight) {
                lightLabel = moon.illumination > 60 ? 'Лунна' : 'Тъмна';
                lightDetail = moon.illumination > 60
                  ? 'Ярка луна — хищниците търсят сенките.'
                  : 'Тъмна нощ — хищниците ловуват смело.';
              } else if (isDawn) {
                lightLabel = 'Здрач';
                lightDetail = 'Преходна светлина — рибата е активна.';
              } else if (isCloudy) {
                lightLabel = 'Ниска';
                lightDetail = 'Облачно — рибата излиза от укрития.';
              }

              return (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center',
                  paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(46,181,183,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '14px', color: 'rgba(222,228,227,0.55)' }}>Светлина</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                        fontWeight: 500, color: '#2eb5b7' }}>
                        {lightLabel}
                      </div>
                      <div style={{ fontSize: '11px', color: '#869393', textAlign: 'right', maxWidth: '150px' }}>
                        {lightDetail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* РЕД 5 — Търси рибата */}
            {(() => {
              const hour = new Date().getHours();
              const isHot = weather.temperature > 24;
              const isCold = weather.temperature < 8;
              const isActive = (hour >= 5 && hour < 10) || (hour >= 17 && hour < 21);

              let zoneLabel = 'Средна';
              let zoneDetail = terrain === 'river'
                ? 'Търси бавни участъци и ями.'
                : 'Средни дълбочини и край на водоема.';

              if (isCold) {
                zoneLabel = 'Дъното';
                zoneDetail = 'Студено — рибата търси топлите слоеве.';
              } else if (isHot && !isActive) {
                zoneLabel = 'Дъното';
                zoneDetail = 'Горещо — рибата е в хладните дълбини.';
              } else if (isActive) {
                zoneLabel = 'Повърхност';
                zoneDetail = terrain === 'river'
                  ? 'Активна зона край брега и вливащи се притоци.'
                  : 'Плитчините при изгрев и залез.';
              }

              return (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(46,181,183,0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 8h20M2 12h20M2 16h20" opacity="0.35"/>
                      <circle cx="12" cy="14" r="2" fill="rgba(46,181,183,0.25)" stroke="#2eb5b7" strokeWidth="1"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '14px', color: 'rgba(222,228,227,0.55)' }}>Търси рибата</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                        fontWeight: 500, color: '#2eb5b7' }}>
                        {zoneLabel}
                      </div>
                      <div style={{ fontSize: '11px', color: '#869393', textAlign: 'right', maxWidth: '150px' }}>
                        {zoneDetail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* Weather Widget — Bento Grid */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-3 mb-2">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
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
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-tight" style={{ color: '#EAF7FF' }}>{title}</div>
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
            <div className="grid grid-cols-3 gap-1">
              {/* TEMP */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <ThermometerSun className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? `${weather.temperature}°` : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">ТЕМП.</div>
              </div>
              {/* WIND */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Wind className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? weather.windSpeed : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">КМ/Ч</div>
              </div>
              {/* PRESSURE w/ sparkline */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Gauge className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
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
                <div className="text-xs font-bold leading-none text-white">{weather ? weather.pressure : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">
                  {weather ? (weather.pressureTrend === 'rising' ? '↗ хПа' : weather.pressureTrend === 'falling' ? '↘ хПа' : '→ хПа') : 'хПа'}
                </div>
              </div>
              {/* HUMIDITY */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Droplets className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? `${weather.humidity}%` : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">ВЛАГА</div>
              </div>
              {/* ALTITUDE */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Mountain className="w-3.5 h-3.5 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? Math.round(weather.altitude) : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">М. Н.В.</div>
              </div>
              {/* WEATHER ICON */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center flex flex-col justify-center">
                <span className="text-xl leading-none">{weather ? weather.weatherIcon : '—'}</span>
                <div className="text-[8px] mt-1 opacity-50 leading-tight whitespace-nowrap overflow-hidden text-ellipsis" title={weather?.weatherLabel}>
                  {weather?.weatherLabel ?? '...'}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Solunar Activity Section — Compact Timeline */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-3 mb-2">
          <h3 className="font-display text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#94A3B8' }}>
            <svg
              width="14"
              height="14"
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
                  <div className="mb-2">
                    <div className="font-display text-base font-medium tracking-tight leading-none"
                      style={{ color }}>
                      {verdict}
                    </div>
                    <div className="text-[10px] mt-1" style={{ color: 'rgba(127,147,168,0.85)' }}>{subtitle}</div>
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

        <footer className="text-center mt-4 space-y-0.5">
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
