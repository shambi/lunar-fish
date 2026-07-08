import { useState, useMemo, useEffect } from 'react';
import { getScoredFish, getFishModalData, type ScoredFish } from '@/lib/fish-guide';
import { getCommonMistake } from '@/lib/fish-advice';
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

  const mistake = useMemo(() => {
    if (!selectedFish) return null;
    return getCommonMistake(selectedFish, moon, weather, terrain, selectedFish.score, meteoAlert);
  }, [selectedFish, moon, weather, terrain, meteoAlert]);

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
              <div className="no-scrollbar" style={{ position: 'relative', overflowY: 'auto', flex: 1, minHeight: 0, scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '20px 18px' } as React.CSSProperties}>
              <style>{`
                input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}
              `}</style>

              {/* ═══════ SECTION 1 — HEADER (КАТЕГОРИЯ + SCORE + FISH) ═══════ */}
              <div style={{ marginBottom: 18 }}>
                {/* КАТЕГОРИЯ label — same section-title style as "Солунарна активност"/"Условия днес" in Index.tsx */}
                <div className="font-display text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#869393', textAlign: 'left', marginBottom: 10 }}>
                  {selectedFish.fishType ?? 'Сладководна риба'}
                </div>

                {/* Character line — moved above the name, right after the category */}
                {selectedFish.character && (
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, lineHeight: 1.5, color: '#a8b4b4', textAlign: 'left', margin: 0, marginBottom: 12, borderLeft: '1px solid rgba(46,181,183,0.3)', paddingLeft: 10 }}>
                    {selectedFish.character}
                  </p>
                )}

                {/* NAME + LATIN NAME group */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ textAlign: 'left', fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: '#dee4e3' }}>
                    {selectedFish.name}
                  </div>
                  {selectedFish.latinName && (
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#869393', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>
                      {selectedFish.latinName}
                    </div>
                  )}
                </div>

                {/* FISH SVG — unchanged illustration/glow, moderately wider than the original compact size, centered, not edge-to-edge */}
                <div style={{ width: 220, height: 110, margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center', filter: 'drop-shadow(0 0 12px rgba(46,181,183,0.4))', marginBottom: 12 }}>
                  {FISH_ICON_MAP[selectedFish.name]
                    ? FISH_ICON_MAP[selectedFish.name]({ style: { width: '100%', height: '100%' }, strokeWidth: 1.4, stroke: '#5cd8da' })
                    : <span style={{ fontSize: '4rem' }}>{selectedFish.emoji}</span>
                  }
                </div>

                {/* SCORE (compact ring) + ПРЕПОРЪЧАНО ДНЕС — one row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {(() => {
                    const score = Math.max(0, Math.min(100, selectedFish.score));
                    // Same 4-color palette/thresholds already used across the app (status dot in
                    // Index.tsx "Условия", ПРЕПОРЪЧАНО ДНЕС badge threshold of 61 in this file).
                    const scoreColor = score >= 86 ? '#C8E63C' : score >= 61 ? '#2eb5b7' : score >= 40 ? '#7F93A8' : '#FF8C42';

                    const size = 26, strokeWidth = 1.5;
                    const r = (size - strokeWidth) / 2;
                    const circumference = 2 * Math.PI * r;
                    const dashOffset = circumference * (1 - score / 100);

                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: 'transparent', overflow: 'visible' }}>
                          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f2a2e" strokeWidth={strokeWidth} />
                          <circle
                            cx={size / 2} cy={size / 2} r={r} fill="none"
                            stroke={scoreColor} strokeWidth={strokeWidth} strokeLinecap="round"
                            strokeDasharray={circumference} strokeDashoffset={dashOffset}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{ filter: `drop-shadow(0 0 3px ${scoreColor})` }}
                          />
                        </svg>
                        {/* Same class as the temp/humidity/pressure values in the "Условия" bento grid (Index.tsx) */}
                        <span className="text-sm font-bold text-white" style={{ lineHeight: 1 }}>
                          {selectedFish.score}
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#869393', marginLeft: 2 }}>/100</span>
                        </span>
                      </div>
                    );
                  })()}

                  {/* ПРЕПОРЪЧАНО ДНЕС — compact pill, same border/background/text color as the active technique buttons */}
                  {selectedFish.score >= 61 && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 12px',
                      borderRadius: 999,
                      border: '1px solid #2eb5b7',
                      background: 'rgba(46,181,183,0.15)',
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#5cd8da',
                      whiteSpace: 'nowrap',
                    }}>
                      Препоръчано днес
                    </div>
                  )}
                </div>
              </div>

              {/* ═══════ SECTION 2 — ТЕХНИКА БУТОНИ ═══════ */}
              {(() => {
                const techniques = selectedFish.techniques?.[terrain] ?? [];
                if (techniques.length === 0) return null;
                return (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="1.2" strokeLinecap="round">
                        <path d="M12 3 L12 14 Q12 20 7 20 Q3 20 3 16"/>
                        <path d="M2 17 L4 15"/>
                        <line x1="12" y1="3" x2="10" y2="4"/>
                        <line x1="12" y1="3" x2="14" y2="4"/>
                      </svg>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: '#869393' }}>
                        ТЕХНИКИ
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                    {techniques.map(t => {
                      const active = selectedTechnique === t;
                      return (
                        <button key={t}
                          onClick={() => setSelectedTechnique(t)}
                          style={{
                            flex: '0 0 auto',
                            padding: '8px 10px',
                            borderRadius: 12,
                            border: active ? '1px solid #2eb5b7' : '1px solid rgba(255,255,255,0.08)',
                            background: active ? 'rgba(46,181,183,0.15)' : 'rgba(255,255,255,0.03)',
                            color: active ? '#5cd8da' : '#a8b4b4',
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 12,
                            fontWeight: active ? 700 : 500,
                            letterSpacing: '0.04em',
                            cursor: 'pointer',
                            minHeight: 40,
                            transition: 'all 0.2s ease',
                            boxShadow: active ? '0 0 16px rgba(46,181,183,0.2)' : 'none',
                          }}
                        >{t}</button>
                      );
                    })}
                    </div>
                  </>
                );
              })()}

              {/* ═══════ SECTION 3 — ТАКЪМИ & МОНТАЖ (BENTO TILES) ═══════ */}
              {(() => {
                const td = selectedTechnique ? selectedFish.techniqueData?.[selectedTechnique] : null;
                const displayGroundbait = td?.groundbait ?? modalData.groundbaitTip;
                const displayBait = td?.bait ?? modalData.baitTip;
                const displayLine = td?.line_mm ? `${td.line_mm}мм` : modalData.lineDiameter;
                const displayBraid = td?.braid_mm ? `${td.braid_mm}мм` : null;
                const displayHook = td?.hook_size ?? modalData.hookTip;
                const displayLures = td ? (td.lures ?? null) : modalData.lureTip;
                const displayRigs = td?.rigs ?? modalData.rigTip;

                const tile: React.CSSProperties = {
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 16,
                  padding: '12px 12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  minHeight: 0,
                };
                const tileHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 };
                const tileTitle: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: '#dee4e3', letterSpacing: '0.06em' };
                const tileSubLabel: React.CSSProperties = { fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#869393', marginBottom: 6 };

                // Short numeric-like values get a big Space Grotesk figure with a • bullet,
                // plus an optional compact secondary badge inline next to it (e.g. mono diameter
                // alongside the primary braid value) instead of its own full-height row.
                const renderBigValue = (val: string, badge?: string) => (
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', rowGap: 3, columnGap: 8 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 400, color: '#5cd8da', lineHeight: 1, letterSpacing: '0.02em', textShadow: '0 0 4px rgba(92,216,218,0.18)', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: '#5cd8da', fontSize: 14 }}>●</span>{val}
                    </div>
                    {badge && (
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#869393', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '2px 6px', whiteSpace: 'nowrap' }}>
                        {badge}
                      </span>
                    )}
                  </div>
                );
                const renderTextValue = (val: string) => (
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 600, color: '#5cd8da', lineHeight: 1.25, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: '#5cd8da', fontSize: 9, lineHeight: 1.8 }}>●</span><span>{val}</span>
                  </div>
                );

                // Small tactical icons (thin stroke)
                const IconWorm = (
                  <svg width="28" height="22" viewBox="0 0 32 24" fill="none" stroke="#a8b4b4" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M2 12 Q6 6 10 12 T18 12 T26 12" />
                    <circle cx="27" cy="12" r="1.4" fill="#a8b4b4"/>
                    <ellipse cx="26" cy="16" rx="3" ry="2" opacity="0.5"/>
                  </svg>
                );
                const IconLine = (
                  <svg width="26" height="22" viewBox="0 0 24 24" fill="none" stroke="#a8b4b4" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M3 3 Q10 10 14 14 T21 21"/>
                    <path d="M18 16 L21 21 L16 20 Z" fill="none"/>
                  </svg>
                );
                const IconHook = (
                  <svg width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8b4b4" strokeWidth="1.2" strokeLinecap="round">
                    <path d="M12 3 L12 14 Q12 20 7 20 Q3 20 3 16"/>
                    <path d="M2 17 L4 15"/>
                    <line x1="12" y1="3" x2="10" y2="4"/>
                    <line x1="12" y1="3" x2="14" y2="4"/>
                  </svg>
                );
                const IconRig = (
                  <svg width="22" height="24" viewBox="0 0 24 24" fill="none" stroke="#a8b4b4" strokeWidth="1.2" strokeLinecap="round">
                    <line x1="12" y1="2" x2="12" y2="22"/>
                    <circle cx="12" cy="9" r="3"/>
                    <path d="M9 9 L15 9"/>
                    <path d="M12 18 Q9 20 9 22"/>
                  </svg>
                );

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18, alignItems: 'stretch' }}>
                    <div style={tile}>
                      <div style={tileHeader}>
                        <span style={tileTitle}>СТРЪВ</span>
                        {IconWorm}
                      </div>
                      <div style={tileSubLabel}>{displayGroundbait}</div>
                      {displayBait && renderTextValue(displayBait)}
                    </div>
                    <div style={tile}>
                      <div style={tileHeader}>
                        <span style={tileTitle}>ВЛАКНО</span>
                        {IconLine}
                      </div>
                      <div style={tileSubLabel}>{displayBraid ? 'Плетено' : 'Монофилно'}</div>
                      {renderBigValue(displayBraid ?? displayLine, displayBraid ? `моно ${displayLine}` : undefined)}
                    </div>
                    <div style={tile}>
                      <div style={tileHeader}>
                        <span style={tileTitle}>КУКИ</span>
                        {IconHook}
                      </div>
                      <div style={tileSubLabel}>Размер</div>
                      {renderBigValue(displayHook)}
                    </div>
                    <div style={tile}>
                      <div style={tileHeader}>
                        <span style={tileTitle}>{displayLures ? 'ВОБЛЕРИ' : 'МОНТАЖ'}</span>
                        {IconRig}
                      </div>
                      <div style={tileSubLabel}>Вид</div>
                      {renderTextValue(displayLures ?? displayRigs ?? '')}
                    </div>
                  </div>
                );
              })()}

              {/* ═══════ SECTION 4 — ЕКО & ПРАВИЛА ═══════ */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="8" width="18" height="8" rx="1"/>
                    <line x1="7" y1="8" x2="7" y2="11"/>
                    <line x1="11" y1="8" x2="11" y2="11"/>
                    <line x1="15" y1="8" x2="15" y2="11"/>
                    <line x1="19" y1="8" x2="19" y2="11"/>
                  </svg>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', color: '#869393', textTransform: 'uppercase' }}>Еко &amp; Правила</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '14px 16px' }}>
                  {selectedFish.minSize && (() => {
                    const pct = Math.min(100, (selectedFish.minSize / 100) * 100);
                    return (
                      <div style={{ marginBottom: (selectedFish.altitudeBans ? 12 : 0) }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(222,228,227,0.85)', textTransform: 'uppercase' }}>Мин. размер</span>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, color: '#5cd8da', lineHeight: 1 }}>{selectedFish.minSize} см</span>
                        </div>
                        <div style={{ position: 'relative', height: 5, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #2eb5b7, #5cd8da)', borderRadius: 3, boxShadow: '0 0 6px rgba(46,181,183,0.5)' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, color: '#869393' }}>
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
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(222,228,227,0.85)', textTransform: 'uppercase' }}>Забранен период</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {activeZones.map(z => {
                            const ban = selectedFish.altitudeBans![z.key]!;
                            return (
                              <div key={z.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontSize: 10, color: '#a8b4b4' }}>{z.label}</span>
                                <span style={{ fontSize: 13, fontWeight: 400, color: '#fff', lineHeight: 1 }}>{ban.start} – {ban.end}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {(() => {
                    const bans = selectedFish.altitudeBans;
                    const isCurrentlyBanned = bans
                      ? (['low', 'mid', 'high'] as const).some(k => bans[k] && isInBanPeriod(bans[k]!.start, bans[k]!.end))
                      : false;
                    return (
                      <div style={{ marginTop: (selectedFish.minSize || (bans && Object.keys(bans).length > 0)) ? 12 : 0, display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: isCurrentlyBanned ? 700 : 400, color: isCurrentlyBanned ? '#FF8C42' : 'rgba(222,228,227,0.85)' }}>
                          {isCurrentlyBanned ? 'Забранен период — само хвани и пусни' : 'Хвани и пусни, когато е възможно — опазва популацията'}
                        </span>
                      </div>
                    );
                  })()}

                  <a
                    href="https://iara.government.bg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)', fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#869393', textDecoration: 'none' }}
                  >
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#869393" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <path d="M15 3h6v6"/>
                      <path d="M10 14 21 3"/>
                    </svg>
                    Източник: ИАРА
                  </a>
                </div>
              </div>

              {/* ═══════ SECTION 6 — ТАКТИЧЕСКА БЕЛЕЖКА ═══════ */}
              {mistake && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 14, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ display: 'inline-flex', width: 18, height: 18, borderRadius: '50%', background: 'rgba(46,181,183,0.15)', color: '#5cd8da', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>ⓘ</span>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#dee4e3' }}>Тактическа бележка</span>
                  </div>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, lineHeight: 1.55, color: '#a8b4b4', margin: 0 }}>{mistake}</p>
                </div>
              )}

              {/* ═══════ SECTION 7 — КАЛКУЛАТОР ═══════ */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 16, marginBottom: 18 }}>

                {/* Ред 1 — заглавие + резултат */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="2" strokeLinecap="round">
                      <line x1="4" y1="20" x2="4" y2="14"/>
                      <line x1="12" y1="20" x2="12" y2="8"/>
                      <line x1="20" y1="20" x2="20" y2="4"/>
                    </svg>
                    <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 700, color: '#dee4e3', textTransform: 'uppercase', letterSpacing: '0.14em', whiteSpace: 'nowrap' }}>Калкулатор за тегло</span>
                  </div>
                  <div style={{ fontFamily: "'VT323', monospace", fontSize: 26, color: '#dee4e3', letterSpacing: '0.06em', lineHeight: 1 }}>
                    {calcLen
                      ? <>{calcWeight(selectedFish.name, parseFloat(calcLen), parseFloat(calcGirth))}<span style={{ fontSize: 14, color: 'rgba(222,228,227,0.45)', marginLeft: 4 }}>KG</span></>
                      : <>0.00<span style={{ fontSize: 14, color: 'rgba(222,228,227,0.45)', marginLeft: 4 }}>KG</span></>
                    }
                  </div>
                </div>

                {/* Ред 2 — inputs */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#869393', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>[ Дължина ]</div>
                    <input type="number" placeholder="0.00" value={calcLen} autoFocus={false} tabIndex={-1}
                      onChange={e => setCalcLen(e.target.value)}
                      style={{ fontFamily: "'VT323', monospace", fontSize: 26, fontWeight: 400, color: '#0B0F1A', background: 'linear-gradient(180deg, #5cd8da 0%, #2eb5b7 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, height: 56, padding: 0, width: '100%', textAlign: 'center', outline: 'none', display: 'block', boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 18px rgba(46,181,183,0.2)', MozAppearance: 'textfield', letterSpacing: '0.06em' } as React.CSSProperties} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 14, flexShrink: 0 }}>
                    <span style={{ fontFamily: "'VT323', monospace", fontSize: 22, color: '#5cd8da', letterSpacing: '0.06em' }}>X =</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, color: '#869393', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>[ Обиколка ]</div>
                    <input type="number" placeholder="000" value={calcGirth} autoFocus={false} tabIndex={-1}
                      onChange={e => setCalcGirth(e.target.value)}
                      style={{ fontFamily: "'VT323', monospace", fontSize: 26, fontWeight: 400, color: '#0B0F1A', background: 'linear-gradient(180deg, #5cd8da 0%, #2eb5b7 100%)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, height: 56, padding: 0, width: '100%', textAlign: 'center', outline: 'none', display: 'block', boxSizing: 'border-box', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 0 18px rgba(46,181,183,0.2)', MozAppearance: 'textfield', letterSpacing: '0.06em' } as React.CSSProperties} />
                  </div>
                </div>

                {/* Ред 3 — footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: '#869393' }}>Въведи размерите на улова</span>
                  <button onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#869393', fontSize: 14, lineHeight: 1 }}
                    title="За формулата">
                    ✦
                  </button>
                </div>

                {showFormulaInfo && (
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 11, color: '#869393', lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Формулата принадлежи на <span style={{ color: '#5cd8da', fontWeight: 600 }}>Милко Георгиев</span> — легенда в българското сомарство. Проверена в практиката, с точност до ~85%.
                  </div>
                )}
              </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
