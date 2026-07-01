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
              {/* Static brightness vignette */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 50%, rgba(255,255,255,0) 100%)',
              }} />

              {/* Scroll wrapper */}
              <div className="no-scrollbar" style={{ position: 'relative', overflowY: 'auto', flex: 1, minHeight: 0, scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '24px 20px' } as React.CSSProperties}>
              <style>{`
                @keyframes riboPulse { 0%,100%{opacity:.4;transform:scale(.85)} 50%{opacity:1;transform:scale(1.15)} }
                @keyframes riboFade  { 0%,100%{opacity:.4} 50%{opacity:.85} }
                @keyframes riboShimmer { 0%{opacity:.3} 50%{opacity:.7} 100%{opacity:.3} }
                input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
              `}</style>

              {/* ═══════ SECTION 1 — HEADER ═══════ */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>

                {/* SCORE */}
                <div style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", fontSize: '48px', fontWeight: '700', color: '#dee4e3', lineHeight: '1.1', letterSpacing: '-0.02em', marginBottom: '14px', textAlign: 'center', textShadow: '0 0 10px rgba(46,181,183,0.3)' }}>
                  {selectedFish.score} <span style={{ color: '#2eb5b7', fontSize: '28px', fontWeight: '400' }}>/ 100</span>
                </div>

                {/* КАТЕГОРИЯ + ИМЕ + ЛАТИНСКО */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginBottom: '14px' }}>
                  <div style={{ fontFamily: "Inter, -apple-system, sans-serif", fontSize: '11px', fontWeight: '300', letterSpacing: '0.25em', color: '#869393', textTransform: 'uppercase' }}>
                    {selectedFish.fishType ?? 'Сладководна риба'}
                  </div>
                  <div style={{ fontFamily: "Inter, -apple-system, sans-serif", fontSize: '48px', fontWeight: '700', letterSpacing: '-0.01em', color: '#dee4e3', textTransform: 'uppercase', lineHeight: '1.1' }}>
                    {selectedFish.name}
                  </div>
                  {selectedFish.latinName && (
                    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", fontSize: '15px', fontWeight: '400', fontStyle: 'italic', color: '#a8b4b4' }}>
                      {selectedFish.latinName}
                    </div>
                  )}
                </div>

                {/* РИБА SVG */}
                <div style={{ width: '180px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px', filter: 'drop-shadow(0 0 12px rgba(46,181,183,0.5))' }}>
                  {FISH_ICON_MAP[selectedFish.name]
                    ? FISH_ICON_MAP[selectedFish.name]({ style: { width: '100%', height: '100%' }, strokeWidth: 1.5, stroke: '#2eb5b7' })
                    : <span style={{ fontSize: '4rem' }}>{selectedFish.emoji}</span>
                  }
                </div>

                {/* ОПИСАНИЕ */}
                {selectedFish.character && (
                  <div style={{ textAlign: 'center', fontFamily: "'Space Grotesk', sans-serif", fontSize: '14px', lineHeight: '1.4', color: '#a8b4b4', padding: '0 12px', marginBottom: selectedFish.score >= 61 ? '16px' : '0px' }}>
                    {selectedFish.character}
                  </div>
                )}

                {/* BADGE */}
                {selectedFish.score >= 61 && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(27,33,33,0.4)', color: '#2eb5b7', padding: '6px 16px', borderRadius: '100px', fontFamily: "'Space Grotesk', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.02em' }}>
                    <span style={{ color: '#2eb5b7' }}>★</span> ПРЕПОРЪЧАНО ДНЕС
                  </div>
                )}

              </div>

              {/* ═══════ SECTION 2 — ТЕХНИКА БУТОНИ ═══════ */}
              {(() => {
                const techniques = selectedFish.techniques?.[terrain] ?? [];
                if (techniques.length === 0) return null;
                return (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                    {techniques.map(t => {
                      const active = selectedTechnique === t;
                      return (
                        <button key={t}
                          onClick={() => setSelectedTechnique(t === selectedTechnique ? null : t)}
                          style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: 10,
                            border: active ? '1px solid #2eb5b7' : '1px solid rgba(255,255,255,0.1)',
                            background: active ? '#2eb5b7' : 'transparent',
                            color: active ? '#0B0F1A' : '#a8b4b4',
                            fontSize: 13,
                            fontWeight: active ? 700 : 500,
                            cursor: 'pointer',
                            minHeight: 44,
                            transition: 'all 0.2s ease',
                          }}
                        >{t}</button>
                      );
                    })}
                  </div>
                );
              })()}

              {/* ═══════ SECTION 3 — AI ПОДХОД ═══════ */}
              <div style={{
                background: '#1b2121',
                border: '1px solid rgba(46,181,183,0.15)',
                borderRadius: 16,
                padding: 16,
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeDasharray="3 3"/>
                    <circle cx="12" cy="12" r="6"/>
                    <circle cx="12" cy="12" r="1" fill="#2eb5b7"/>
                    <line x1="12" y1="12" x2="20" y2="6" strokeLinecap="round"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#2eb5b7' }}>AI ПОДХОД</span>
                  <span style={{ marginLeft: 'auto', background: 'rgba(200,230,60,0.1)', border: '1px solid rgba(200,230,60,0.25)', borderRadius: 4, padding: '2px 6px', fontSize: 10, fontWeight: 600, color: '#C8E63C' }}>AI</span>
                </div>

                {meteoAlert?.level && (
                  <div style={{ background: 'rgba(255,160,50,0.08)', border: '1px solid rgba(255,160,50,0.25)', borderRadius: 8, padding: '8px 10px', color: '#ffaa33', fontSize: 12, marginBottom: 10 }}>
                    {meteoAlert.level === 'red' ? 'Червен' : meteoAlert.level === 'orange' ? 'Оранжев' : 'Жълт'} код{meteoAlert.event ? ` · ${translateAlert(meteoAlert.event)}` : ''}
                  </div>
                )}

                {aiLoading && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#2eb5b7', animation: 'riboPulse 1.2s ease-in-out infinite' }} />
                      <span style={{ fontSize: 12, color: '#5cd8da', animation: 'riboFade 1.8s ease-in-out infinite' }}>Анализирам условията...</span>
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
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: '#dee4e3', margin: 0 }}>{aiAdvice}</p>
                )}
              </div>

              {/* ═══════ SECTION 4 — ТАКЪМИ & МОНТАЖ ═══════ */}
              {(() => {
                const td = selectedTechnique ? selectedFish.techniqueData?.[selectedTechnique] : null;
                const displayGroundbait = td?.groundbait ?? modalData.groundbaitTip;
                const displayBait = td?.bait ?? modalData.baitTip;
                const displayLine = td?.line_mm ? `${td.line_mm}мм` : modalData.lineDiameter;
                const displayHook = td?.hook_size ?? modalData.hookTip;
                const displayLures = td ? (td.lures ?? null) : modalData.lureTip;
                const displayRigs = td?.rigs ?? modalData.rigTip;

                const tile: React.CSSProperties = {
                  background: '#1b2121',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 14,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                };
                const tileLabel: React.CSSProperties = { fontSize: 10, textTransform: 'uppercase', color: '#869393', letterSpacing: '0.05em', marginBottom: 8 };

                const renderTileValue = (val: string, forceSm?: boolean) => {
                  const isLong = forceSm || (val?.length ?? 0) > 14;
                  return isLong
                    ? <div style={{ fontSize: 16, fontWeight: 600, color: '#2eb5b7', lineHeight: 1.3 }}>{val}</div>
                    : <div style={{ fontSize: 22, fontWeight: 700, color: '#2eb5b7', marginBottom: 4 }}><span style={{ color: '#2eb5b7', marginRight: 4 }}>●</span>{val}</div>;
                };

                return (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#869393', marginBottom: 10 }}>
                      Такъми & Монтаж
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div style={tile}>
                        <div style={tileLabel}>Стръв</div>
                        {renderTileValue(displayGroundbait)}
                        {displayBait && <div style={{ fontSize: 12, color: '#a8b4b4', lineHeight: 1.4 }}>{displayBait}</div>}
                      </div>
                      <div style={tile}>
                        <div style={tileLabel}>Влакно</div>
                        {renderTileValue(displayLine)}
                      </div>
                      <div style={tile}>
                        <div style={tileLabel}>Куки</div>
                        {renderTileValue(displayHook)}
                      </div>
                      <div style={tile}>
                        <div style={tileLabel}>{displayLures ? 'Воблери' : 'Монтаж'}</div>
                        {renderTileValue(displayLures ?? displayRigs ?? '')}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* ═══════ SECTION 5 — ЕКО & ПРАВИЛА ═══════ */}
              <div style={{ background: '#1b2121', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#869393', marginBottom: 12 }}>
                  Еко & Правила
                </div>

                {selectedFish.minSize && (() => {
                  const pct = Math.min(100, (selectedFish.minSize / 100) * 100);
                  return (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#869393', textTransform: 'uppercase' }}>Мин. размер</span>
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

                {selectedFish.altitudeBans && (() => {
                  const zones: { key: 'low' | 'mid' | 'high'; label: string }[] = [
                    { key: 'low',  label: 'До 500м' },
                    { key: 'mid',  label: '500–1500м' },
                    { key: 'high', label: 'Над 1500м' },
                  ];
                  const activeZones = zones.filter(z => selectedFish.altitudeBans![z.key]);
                  if (activeZones.length === 0) return null;
                  return (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', color: '#869393', textTransform: 'uppercase', marginBottom: 8 }}>Забранен период</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {activeZones.map(z => {
                          const ban = selectedFish.altitudeBans![z.key]!;
                          const isBanned = isInBanPeriod(ban.start, ban.end);
                          return (
                            <div key={z.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                              <span style={{ color: isBanned ? '#ff6b6b' : '#dee4e3' }}>{z.label}</span>
                              <span style={{ color: isBanned ? '#ff6b6b' : '#dee4e3', fontFamily: 'monospace' }}>{ban.start} – {ban.end}</span>
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

              {/* ═══════ SECTION 6 — КАЛКУЛАТОР ═══════ */}
              <div style={{ background: '#1b2121', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 16, marginBottom: 20 }}>

                {/* Ред 1 — заглавие + резултат */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="2.5">
                      <line x1="18" y1="20" x2="18" y2="10"/>
                      <line x1="12" y1="20" x2="12" y2="4"/>
                      <line x1="6" y1="20" x2="6" y2="14"/>
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#dee4e3', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Калкулатор за тегло</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#dee4e3' }}>
                    {calcLen
                      ? <>{calcWeight(selectedFish.name, parseFloat(calcLen), parseFloat(calcGirth))} <span style={{ fontSize: 11, color: '#869393', fontWeight: 400 }}>КГ</span></>
                      : <span style={{ fontSize: 14, color: '#3d4949' }}>—</span>
                    }
                  </div>
                </div>

                {/* Ред 2 — inputs */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#869393', textAlign: 'center', marginBottom: 6 }}>Дължина</div>
                    <input type="number" placeholder="0" value={calcLen} autoFocus={false} tabIndex={-1}
                      onChange={e => setCalcLen(e.target.value)}
                      onFocus={e => { (e.target as HTMLInputElement).style.background = '#5cd8da'; }}
                      onBlur={e => { (e.target as HTMLInputElement).style.background = '#2eb5b7'; }}
                      style={{ background: '#2eb5b7', border: 'none', borderRadius: 10, padding: '12px 0', width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#0B0F1A', outline: 'none', MozAppearance: 'textfield', display: 'block' } as React.CSSProperties} />
                  </div>

                  <span style={{ fontSize: 28, fontWeight: 700, color: '#C8E63C', paddingBottom: 10, flexShrink: 0 }}>×</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#869393', textAlign: 'center', marginBottom: 6 }}>Обиколка</div>
                    <input type="number" placeholder="—" value={calcGirth} autoFocus={false} tabIndex={-1}
                      onChange={e => setCalcGirth(e.target.value)}
                      onFocus={e => { (e.target as HTMLInputElement).style.background = '#5cd8da'; }}
                      onBlur={e => { (e.target as HTMLInputElement).style.background = '#2eb5b7'; }}
                      style={{ background: '#2eb5b7', border: 'none', borderRadius: 10, padding: '12px 0', width: '100%', textAlign: 'center', fontSize: 22, fontWeight: 700, color: '#0B0F1A', outline: 'none', MozAppearance: 'textfield', display: 'block' } as React.CSSProperties} />
                  </div>
                </div>

                {/* Ред 3 — помощен текст */}
                <div style={{ fontSize: 11, color: '#869393', marginBottom: 12 }}>
                  Въведи размерите на улова
                </div>

                {/* Ред 4 — footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 10, fontSize: 11 }}>
                  <span style={{ color: '#869393' }}>~85% точност</span>
                  <button onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#2eb5b7', fontSize: 11 }}>
                    ⓘ за формулата
                  </button>
                </div>

                {showFormulaInfo && (
                  <div style={{ fontSize: 11, color: '#a8b4b4', lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Формулата принадлежи на <span style={{ color: '#5cd8da', fontWeight: 600 }}>Милко Георгиев</span> — легенда в българското сомарство. Проверена в практиката, с точност до ~85%.
                  </div>
                )}
              </div>

              {/* ═══════ SECTION 7 — ТАКТИЧЕСКА БЕЛЕЖКА ═══════ */}
              {advice?.mistake && (
                <div style={{ background: 'rgba(27,33,33,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#869393' }}>ⓘ</span>
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#869393' }}>Тактическа бележка</span>
                  </div>
                  <p style={{ fontSize: 12, lineHeight: 1.6, color: '#a8b4b4', margin: 0 }}>{advice.mistake}</p>
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
