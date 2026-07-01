import { useState, useMemo, useEffect, useRef } from 'react';
import { getScoredFish, getFishModalData, type ScoredFish } from '@/lib/fish-guide';
import { getDailyAdvice } from '@/lib/fish-advice';
import type { MoonData } from '@/lib/moon';
import type { WeatherData } from '@/hooks/use-weather';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { FISH_ICON_MAP } from '@/components/FishIcons';

interface FishGuideProps {
  moon: MoonData;
  weather: WeatherData | null;
  terrain: 'river' | 'lake';
  onTerrainChange: (terrain: 'river' | 'lake') => void;
  solunarContext?: { isInPeak: boolean; peakType: 'major' | 'minor' | null };
  meteoAlert?: { level: 'yellow' | 'orange' | 'red' | null; event: string | null };
}

function degreesToCardinal(deg: number): string {
  const dirs = ['С', 'СИ', 'И', 'ЮИ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
  return dirs[Math.round(deg / 45) % 8];
}

const translateAlert = (event: string | null): string => {
  if (!event) return '';
  const map: Record<string, string> = {
    'Heat': 'Жега',
    'Thunderstorms': 'Гръмотевици',
    'Rain': 'Дъжд',
    'Wind': 'Силен вятър',
    'Snow': 'Сняг',
    'Fog': 'Мъгла',
    'Flood': 'Наводнение',
    'Forest fire': 'Горски пожар',
    'Coastal event': 'Крайбрежно събитие',
  };
  return map[event] ?? event;
};

function isInBanPeriod(start: string, end: string): boolean {
  const today = new Date();
  const year = today.getFullYear();
  const [startDay, startMonth] = start.split('.').map(Number);
  const [endDay, endMonth] = end.split('.').map(Number);
  let startDate = new Date(year, startMonth - 1, startDay);
  let endDate = new Date(year, endMonth - 1, endDay);
  if (endDate < startDate) {
    endDate = new Date(year + 1, endMonth - 1, endDay);
    if (today < startDate) {
      startDate = new Date(year - 1, startMonth - 1, startDay);
      endDate = new Date(year, endMonth - 1, endDay);
    }
  }
  return today >= startDate && today <= endDate;
}

function calcWeight(fishName: string, L: number, G: number): string {
  if (!L || L <= 0) return '';
  const g = G > 0 ? G : L * 0.58;
  let kg: number;
  if (fishName === 'Сом') {
    kg = Math.pow(L / 100, 3) * 6;
  } else if (fishName === 'Каракуда') {
    kg = (L * g * g) / 27100;
  } else if (fishName === 'Щука') {
    kg = (L * g * g) / 32500;
  } else {
    kg = (L * g * g) / 28900;
  }
  if (kg >= 1) return '~' + kg.toFixed(1) + ' кг';
  return '~' + Math.round(kg * 1000) + ' г';
}

export function FishGuide({ moon, weather, terrain, onTerrainChange, solunarContext, meteoAlert }: FishGuideProps) {
  const [selectedFish, setSelectedFish] = useState<ScoredFish | null>(null);
  const [calcLen, setCalcLen] = useState('');
  const [calcGirth, setCalcGirth] = useState('');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState<string | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiAdviceCache = useRef<Record<string, string>>({});
  const latestAiRequestKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedFish) {
      const techniques = selectedFish.techniques?.[terrain] ?? [];
      setSelectedTechnique(techniques[0] ?? null);
      setCalcLen('');
      setCalcGirth('');
      setShowFormulaInfo(false);
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl) activeEl.blur();
    }
  }, [selectedFish, terrain]);

  useEffect(() => {
    if (!selectedFish) return;

    // Guard against the sibling "reset technique on fish change" effect: in the same
    // render pass right after switching fish, selectedTechnique can still hold the
    // PREVIOUS fish's value (the reset's setState hasn't applied yet). If that stale
    // technique isn't valid for the newly selected fish, skip — the reset effect will
    // commit the correct technique and this effect will re-fire with the right value.
    const validTechniques = selectedFish.techniques?.[terrain] ?? [];
    const isStaleTechnique = selectedTechnique !== null && !validTechniques.includes(selectedTechnique);
    if (isStaleTechnique) return;

    const cacheKey = `${selectedFish.name}-${selectedTechnique ?? ''}-${terrain}`;
    latestAiRequestKeyRef.current = cacheKey;
    if (aiAdviceCache.current[cacheKey]) {
      setAiAdvice(aiAdviceCache.current[cacheKey]);
      setAiLoading(false);
      return;
    }
    setAiAdvice(null);
    setAiError(null);
    setAiLoading(true);

    // Same lookup logic used by the КУКИ/ВЛАКНО tiles in the modal — technique-specific
    // data first, falling back to the fish's general modal data, so the AI is fed the
    // exact same numbers the user already sees on screen.
    const tdForFetch = selectedTechnique ? selectedFish.techniqueData?.[selectedTechnique] : null;
    const modalDataForFetch = getFishModalData(
      selectedFish,
      weather?.temperature ?? 18,
      weather?.weatherCode ?? 0,
      terrain,
      weather?.altitude
    );
    const recommendedHookSize = tdForFetch?.hook_size ?? modalDataForFetch.hookTip;
    const recommendedLineThickness = tdForFetch?.line_mm ? `${tdForFetch.line_mm}мм` : modalDataForFetch.lineDiameter;

    // Derived from the hourlyForecast array (precipitation/temp per hour) — gives the
    // AI field knowledge a static tile can't show: has it rained recently, and where
    // are temp/pressure headed in the next few hours.
    const hourly = weather?.hourlyForecast ?? [];
    const currentHour = new Date().getHours();
    const currentIdx = hourly.findIndex(h => parseInt(h.hour, 10) === currentHour);
    const recentRain = currentIdx >= 0
      ? hourly.slice(Math.max(0, currentIdx - 2), currentIdx + 1).some(h => h.precipitation > 0)
      : false;
    let forecastTrend = 'няма данни за следващите часове';
    if (currentIdx >= 0) {
      const next3 = hourly.slice(currentIdx + 1, currentIdx + 4);
      if (next3.length > 0) {
        const tempDelta = next3[next3.length - 1].temp - hourly[currentIdx].temp;
        const tempDir = tempDelta > 1 ? 'температурата ще се покачи' : tempDelta < -1 ? 'температурата ще спадне' : 'температурата ще остане стабилна';
        const pressureDir = weather?.pressureTrend === 'rising' ? 'налягането расте' : weather?.pressureTrend === 'falling' ? 'налягането пада' : 'налягането е стабилно';
        forecastTrend = `${tempDir}, ${pressureDir}`;
      }
    }

    fetch('/api/fishing-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fish: selectedFish.name,
        fishBehavior: selectedFish.character ?? '',
        technique: selectedTechnique ?? '',
        terrain,
        month: new Date().getMonth() + 1,
        hour: new Date().getHours(),
        temperature: weather?.temperature ?? 20,
        windSpeed: weather?.windSpeed ?? 0,
        windDirection: weather?.windDirection != null ? degreesToCardinal(weather.windDirection) : '—',
        pressure: weather?.pressure ?? 1013,
        pressureTrend: weather?.pressureTrend ?? 'stable',
        moonPhase: moon.phaseName,
        moonIllumination: moon.illumination,
        fishingScore: moon.fishingScore,
        isInPeak: solunarContext?.isInPeak ?? false,
        peakType: solunarContext?.peakType ?? null,
        meteoAlert: meteoAlert ?? { level: null, event: null },
        recommendedHookSize,
        recommendedLineThickness,
        overallScore: selectedFish.score,
        isRecommended: selectedFish.isRecommended,
        recentRain,
        forecastTrend,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.advice) {
          aiAdviceCache.current[cacheKey] = data.advice;
          // Only apply if no newer request has superseded this one — prevents a
          // slow, stale-technique response from overwriting the correct advice.
          if (latestAiRequestKeyRef.current === cacheKey) {
            setAiAdvice(data.advice);
          }
        } else if (data.error && latestAiRequestKeyRef.current === cacheKey) {
          setAiError(`[debug] ${data.error}${data.detail ? ' ' + data.detail : ''}`);
        }
      })
      .catch((err: unknown) => {
        if (latestAiRequestKeyRef.current === cacheKey) {
          setAiError(`[debug] fetch error: ${String(err)}`);
        }
      })
      .finally(() => {
        if (latestAiRequestKeyRef.current === cacheKey) setAiLoading(false);
      });
  }, [selectedFish, selectedTechnique, terrain]);

  const temp = weather?.temperature ?? 18;
  const wind = weather?.windSpeed ?? 5;
  const weatherCode = weather?.weatherCode ?? 0;

  const timePeriod = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 5 && h < 10) return 'morning' as const;
    if (h >= 10 && h < 17) return 'day' as const;
    if (h >= 17 && h < 21) return 'evening' as const;
    return 'night' as const;
  }, []);

  const scoredFish = useMemo(
    () => getScoredFish(moon.fishingScore, temp, wind, terrain, {
      weatherCode,
      waterTemp: weather?.waterTemp,
      pressureTrend: weather?.pressureTrend,
      moonPhaseName: moon.phaseName,
      sunrise: weather?.sunrise,
      timePeriod,
    }),
    [moon.fishingScore, moon.phaseName, temp, wind, terrain, weatherCode, weather?.waterTemp, weather?.pressureTrend, weather?.sunrise, timePeriod]
  );

  const modalData = useMemo(() => {
    if (!selectedFish) return null;
    return getFishModalData(selectedFish, temp, weatherCode, terrain, weather?.altitude);
  }, [selectedFish, temp, weatherCode, terrain, weather?.altitude]);

  const advice = useMemo(() => {
    if (!selectedFish) return null;
    return getDailyAdvice(selectedFish, moon, weather, terrain, solunarContext);
  }, [selectedFish, moon, weather, terrain, solunarContext]);

  return (
    <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-3 mb-2">
      <h3 className="font-display text-[11px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#869393' }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 48 48"
          fill="none"
          stroke="#C8E63C"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <ellipse cx="22" cy="24" rx="14" ry="10" />
          <path d="M36 24 L44 16 M36 24 L44 32" />
          <circle cx="12" cy="22" r="1.5" fill="#C8E63C" />
        </svg>
        Рибо гид
      </h3>

      {/* Terrain toggle */}
      <div className="flex gap-1.5 mb-2">
        <button
          onClick={() => onTerrainChange('lake')}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
            terrain === 'lake'
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-border bg-secondary/30 hover:bg-secondary/50'
          }`}
          style={terrain !== 'lake' ? { color: 'rgba(255,255,255,0.8)' } : undefined}
        >
          Водоем
        </button>
        <button
          onClick={() => onTerrainChange('river')}
          className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
            terrain === 'river'
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-border bg-secondary/30 hover:bg-secondary/50'
          }`}
          style={terrain !== 'river' ? { color: 'rgba(255,255,255,0.8)' } : undefined}
        >
          Река
        </button>
      </div>

      {/* Fish grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {scoredFish.map((fish) => {
          const isGlow = fish.stars >= 4;
          const isDimmed = fish.stars <= 2;

          return (
            <button
              key={fish.name}
              onClick={() => setSelectedFish(fish)}
              className={`relative flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-all hover:scale-[1.03] active:scale-[0.98] ${
                isGlow
                  ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--glow)/0.3)]'
                  : isDimmed
                  ? 'border-border bg-secondary/30 opacity-45'
                  : 'border-border bg-secondary/30 hover:opacity-100'
              }`}
            >
              {isGlow && (
                <div
                  className="absolute -top-1 -right-1 text-[9px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground font-bold flex items-center gap-0.5"
                  style={{ animation: 'star-signal 2.5s ease-in-out infinite' }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="#E4FF00"
                    stroke="#E4FF00"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse-glow-citron"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              )}
              {FISH_ICON_MAP[fish.name]
                ? FISH_ICON_MAP[fish.name]({ size: 32, strokeWidth: 2 })
                : <span className="text-xl">{fish.emoji}</span>
              }
              <span className="text-[10px] font-medium text-center leading-tight" style={{ color: '#CBD5E1' }}>
                {fish.name}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[9px] text-center mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
        Натиснете риба за подробна информация • Изчислено според текущите условия
      </p>

      {/* Fish detail modal */}
      <Dialog open={!!selectedFish} onOpenChange={(open) => !open && setSelectedFish(null)}>
        <DialogContent
          className="max-w-sm border-border transition-all duration-300 ease-out"
          style={{ background: '#0B0F1A', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {selectedFish && modalData && (
            <>
              {/* Static brightness vignette — anchored to the fixed modal frame (DialogContent), stays put while the scroll wrapper below moves. */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 50%, rgba(255,255,255,0) 100%)',
              }} />

              {/* Scroll wrapper — only this div scrolls; the overlay above is a sibling, outside its scroll context. */}
              <div style={{ position: 'relative', overflowY: 'auto', flex: 1, minHeight: 0 }}>
              <style>{`
                @keyframes riboPulse { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
                @keyframes riboFade  { 0%,100%{opacity:.4} 50%{opacity:.85} }
                @keyframes riboShimmer { 0%{opacity:.3} 50%{opacity:.7} 100%{opacity:.3} }
                @keyframes aiGlow { 0%,100%{box-shadow:0 0 0 1px rgba(200,230,60,0.25), 0 0 18px rgba(200,230,60,0.08)} 50%{box-shadow:0 0 0 1px rgba(200,230,60,0.4), 0 0 24px rgba(200,230,60,0.16)} }
                input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
              `}</style>

              {/* ═══════ HEADER: name + score side-by-side ═══════ */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                {/* Icon + name block */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#869393', marginBottom: 6 }}>
                    {selectedFish.fishType ?? 'Сладководна риба'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ flexShrink: 0 }}>
                      {FISH_ICON_MAP[selectedFish.name]
                        ? FISH_ICON_MAP[selectedFish.name]({ size: 42, strokeWidth: 1.5 })
                        : <span style={{ fontSize: '2.4rem' }}>{selectedFish.emoji}</span>
                      }
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 600, color: '#dee4e3', lineHeight: 1.05, letterSpacing: '-0.01em' }}>
                        {selectedFish.name}
                      </h2>
                      {selectedFish.latinName && (
                        <p style={{ fontSize: 11, fontStyle: 'italic', color: '#869393', marginTop: 2 }}>
                          {selectedFish.latinName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score arc */}
                <div style={{ position: 'relative', width: 68, height: 68, flexShrink: 0 }}>
                  <svg width="68" height="68" viewBox="0 0 68 68" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3"/>
                    <circle cx="34" cy="34" r="28" fill="none" stroke="#2eb5b7" strokeWidth="3"
                      strokeDasharray={`${(selectedFish.score / 100) * 175.9} 175.9`}
                      strokeLinecap="round"
                      transform="rotate(-90 34 34)"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(46,181,183,0.5))' }}/>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: '#dee4e3', lineHeight: 1 }}>
                      {selectedFish.score}
                    </div>
                    <div style={{ fontSize: 8, letterSpacing: '0.1em', color: '#869393', textTransform: 'uppercase', marginTop: 2 }}>
                      / 100
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended badge — full width for punch */}
              {selectedFish.isRecommended && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '6px 10px',
                  border: '1px solid rgba(200,230,60,0.4)',
                  borderRadius: 8,
                  background: 'rgba(200,230,60,0.08)',
                  marginBottom: 10,
                }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#C8E63C" stroke="none" className="animate-pulse-glow-citron">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#C8E63C', textTransform: 'uppercase' }}>
                    Препоръчано днес
                  </span>
                </div>
              )}

              {/* Character description */}
              {selectedFish.character && (
                <p style={{ fontSize: 12.5, color: '#a8b4b4', lineHeight: 1.5, marginBottom: 14 }}>
                  {selectedFish.character}
                </p>
              )}

              {/* ═══════ AI ADVICE — premium block ═══════ */}
              <div style={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(200,230,60,0.06) 0%, rgba(46,181,183,0.04) 100%)',
                border: '1px solid rgba(200,230,60,0.25)',
                borderRadius: 10,
                padding: '12px 14px',
                marginBottom: 14,
                animation: 'aiGlow 4s ease-in-out infinite',
              }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#869393', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Съвет за днес
                  <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#0B0F1A', background: '#C8E63C', borderRadius: 3, padding: '2px 6px' }}>AI</span>
                </div>

                {aiLoading && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2eb5b7', animation: 'riboPulse 1.2s ease-in-out infinite' }} />
                      <span style={{ fontSize: 12, color: '#869393', animation: 'riboFade 1.8s ease-in-out infinite' }}>Анализирам условията...</span>
                    </div>
                    {[80, 65, 90, 50].map((w, i) => (
                      <div key={i} style={{ height: 9, borderRadius: 4, background: 'rgba(255,255,255,0.04)', width: `${w}%`, marginBottom: 6, animation: `riboShimmer 1.6s ease-in-out ${i * 0.2}s infinite` }} />
                    ))}
                  </div>
                )}

                {!aiLoading && aiError && (
                  <p style={{ fontSize: 11, color: '#DC3C3C', fontFamily: 'monospace', wordBreak: 'break-all' }}>{aiError}</p>
                )}

                {!aiLoading && aiAdvice && (
                  <>
                    {meteoAlert?.level && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,140,66,0.1)', border: '1px solid rgba(255,140,66,0.35)', borderRadius: 6, padding: '5px 9px', marginBottom: 8, fontSize: 11, fontWeight: 500, color: '#FF8C42' }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#FF8C42" strokeWidth="2" strokeLinecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        {meteoAlert.level === 'red' ? 'Червен' : meteoAlert.level === 'orange' ? 'Оранжев' : 'Жълт'} код{meteoAlert.event ? ` · ${translateAlert(meteoAlert.event)}` : ''}
                      </div>
                    )}
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: '#dee4e3' }}>{aiAdvice}</p>
                  </>
                )}
              </div>

              {/* ═══════ Technique pills ═══════ */}
              {(() => {
                const techniques = selectedFish.techniques?.[terrain] ?? [];
                if (techniques.length === 0) return null;
                return (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                    {techniques.map(t => {
                      const active = selectedTechnique === t;
                      return (
                        <button key={t}
                          onClick={() => setSelectedTechnique(t === selectedTechnique ? null : t)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: active ? '1px solid #2eb5b7' : '1px solid rgba(255,255,255,0.05)',
                            background: active ? 'rgba(46,181,183,0.15)' : 'rgba(255,255,255,0.03)',
                            color: active ? '#5cd8da' : '#a8b4b4',
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.02em',
                            cursor: 'pointer',
                            boxShadow: active ? '0 0 12px rgba(46,181,183,0.25)' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >{t}</button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ═══════ ТАКЪМИ & МОНТАЖ — 2x2 grid ═══════ */}
              {(() => {
                const td = selectedTechnique ? selectedFish.techniqueData?.[selectedTechnique] : null;
                const displayGroundbait = td?.groundbait ?? modalData.groundbaitTip;
                const displayBait = td?.bait ?? modalData.baitTip;
                const displayLine = td?.line_mm ? `${td.line_mm}мм` : modalData.lineDiameter;
                const displayHook = td?.hook_size ?? modalData.hookTip;
                const displayLures = td ? (td.lures ?? null) : modalData.lureTip;
                const displayRigs = td?.rigs ?? modalData.rigTip;

                const tileBase: React.CSSProperties = {
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                };
                const labelStyle: React.CSSProperties = { fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#869393' };
                const valueStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: '#dee4e3', lineHeight: 1.4 };
                const accentStyle: React.CSSProperties = { color: '#5cd8da', fontWeight: 600 };

                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#869393', marginBottom: 8 }}>
                      Такъми & Монтаж
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      <div style={tileBase}>
                        <div style={labelStyle}>Стръв</div>
                        <div style={valueStyle}>{displayGroundbait}</div>
                        <div style={{ ...valueStyle, ...accentStyle, fontSize: 12 }}>{displayBait}</div>
                      </div>
                      <div style={tileBase}>
                        <div style={labelStyle}>Влакно</div>
                        <div style={{ ...valueStyle, ...accentStyle, fontSize: 15 }}>{displayLine}</div>
                      </div>
                      <div style={tileBase}>
                        <div style={labelStyle}>Куки</div>
                        <div style={{ ...valueStyle, color: '#C8E63C', fontSize: 15, fontWeight: 600 }}>{displayHook}</div>
                      </div>
                      <div style={tileBase}>
                        <div style={labelStyle}>{displayLures ? 'Воблери' : 'Монтаж'}</div>
                        <div style={{ ...valueStyle, ...accentStyle }}>{displayLures ?? displayRigs}</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ═══════ ЕКО & ПРАВИЛА ═══════ */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#869393', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  Еко & Правила
                </div>

                {/* Min size ruler */}
                {selectedFish.minSize && (() => {
                  const pct = Math.min(100, (selectedFish.minSize / 100) * 100);
                  return (
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 8,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#869393', textTransform: 'uppercase' }}>Мин. размер</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#5cd8da' }}>{selectedFish.minSize} см</span>
                      </div>
                      <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #2eb5b7, #5cd8da)', borderRadius: 3, boxShadow: '0 0 8px rgba(46,181,183,0.5)' }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 9, color: '#869393' }}>
                        <span>0</span><span>100 см</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Ban periods */}
                {selectedFish.altitudeBans && (() => {
                  const zones: { key: 'low' | 'mid' | 'high'; label: string }[] = [
                    { key: 'low',  label: 'До 500м' },
                    { key: 'mid',  label: '500–1500м' },
                    { key: 'high', label: 'Над 1500м' },
                  ];
                  const activeZones = zones.filter(z => selectedFish.altitudeBans![z.key]);
                  if (activeZones.length === 0) return null;
                  return (
                    <div style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.05)',
                      borderRadius: 8,
                      padding: '10px 12px',
                      marginBottom: 8,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#869393', textTransform: 'uppercase', marginBottom: 8 }}>Забранен период</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {activeZones.map(z => {
                          const ban = selectedFish.altitudeBans![z.key]!;
                          const isBanned = isInBanPeriod(ban.start, ban.end);
                          return (
                            <div key={z.key} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: isBanned ? 'rgba(220,60,60,0.1)' : 'transparent',
                              border: isBanned ? '1px solid rgba(220,60,60,0.5)' : '1px solid transparent',
                            }}>
                              <span style={{ fontSize: 11, fontWeight: 500, color: isBanned ? '#dee4e3' : '#a8b4b4' }}>{z.label}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: isBanned ? '#DC3C3C' : '#a8b4b4' }}>{ban.start} – {ban.end}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <a href="https://iara.government.bg" target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: '#2eb5b7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  iara.government.bg ↗
                </a>
              </div>

              {/* ═══════ КАЛКУЛАТОР ═══════ */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '12px 14px',
                marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#869393' }}>Калкулатор за тегло</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#869393', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4, fontWeight: 600 }}>Дължина</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" placeholder="0" value={calcLen} autoFocus={false} tabIndex={-1}
                        onChange={e => setCalcLen(e.target.value)}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #3d4949', borderRadius: 0, outline: 'none', color: '#dee4e3', fontSize: 15, fontWeight: 600, width: '100%', minWidth: 0, padding: '4px 0', MozAppearance: 'textfield' } as React.CSSProperties} />
                      <span style={{ fontSize: 11, color: '#869393' }}>см</span>
                    </div>
                  </div>

                  <span style={{ fontSize: 14, color: '#3d4949', paddingBottom: 8 }}>×</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#869393', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4, fontWeight: 600 }}>Обиколка</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" placeholder="—" value={calcGirth} autoFocus={false} tabIndex={-1}
                        onChange={e => setCalcGirth(e.target.value)}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #3d4949', borderRadius: 0, outline: 'none', color: '#dee4e3', fontSize: 15, fontWeight: 600, width: '100%', minWidth: 0, padding: '4px 0', MozAppearance: 'textfield' } as React.CSSProperties} />
                      <span style={{ fontSize: 11, color: '#869393' }}>см</span>
                    </div>
                  </div>

                  <span style={{ fontSize: 14, color: '#3d4949', paddingBottom: 8 }}>=</span>

                  <div style={{ minWidth: 72, textAlign: 'right', paddingBottom: 4 }}>
                    {calcLen ? (
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#C8E63C', textShadow: '0 0 12px rgba(200,230,60,0.3)' }}>
                        {calcWeight(selectedFish.name, parseFloat(calcLen), parseFloat(calcGirth))}
                      </span>
                    ) : (
                      <span style={{ fontSize: 20, color: '#3d4949' }}>—</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 10, color: '#869393' }}>~85% точност</span>
                  <button onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#869393" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <span style={{ fontSize: 10, color: '#869393' }}>за формулата</span>
                  </button>
                </div>

                {showFormulaInfo && (
                  <div style={{ fontSize: 11, color: '#a8b4b4', lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Формулата принадлежи на <span style={{ color: '#5cd8da', fontWeight: 600 }}>Милко Георгиев</span> — легенда в българското сомарство. Проверена в практиката, с точност до ~85%.
                  </div>
                )}
              </div>

              {/* ═══════ ЧЕСТА ГРЕШКА ═══════ */}
              {advice?.mistake && (
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(220,60,60,0.08)', border: '1px solid rgba(220,60,60,0.3)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(220,60,60,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 700, color: '#ff8080' }}>!</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#ff8080', textTransform: 'uppercase', marginBottom: 3 }}>Честа грешка</div>
                    <p style={{ fontSize: 12.5, color: '#dee4e3', lineHeight: 1.5 }}>{advice.mistake}</p>
                  </div>
                </div>
              )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
