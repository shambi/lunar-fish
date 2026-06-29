import { useState, useMemo, useEffect } from 'react';
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

export function FishGuide({ moon, weather, terrain, onTerrainChange, solunarContext }: FishGuideProps) {
  const [selectedFish, setSelectedFish] = useState<ScoredFish | null>(null);
  const [calcLen, setCalcLen] = useState('');
  const [calcGirth, setCalcGirth] = useState('');
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  useEffect(() => {
    setCalcLen('');
    setCalcGirth('');
    setShowFormulaInfo(false);
  }, [selectedFish]);

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
        <DialogContent className="max-w-sm bg-card border-border transition-all duration-300 ease-out">
          {selectedFish && modalData && (
            <>
              {/* Тип риба */}
              <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b4b4', marginBottom: '4px' }}>
                {selectedFish.fishType ?? 'Сладководна риба'}
              </p>

              {/* Риба + Име */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                {FISH_ICON_MAP[selectedFish.name]
                  ? FISH_ICON_MAP[selectedFish.name]({ size: 44, strokeWidth: 1.5 })
                  : <span style={{ fontSize: '2.5rem' }}>{selectedFish.emoji}</span>
                }
                <h2 style={{ fontSize: '22px', fontWeight: 600, color: '#dee4e3', lineHeight: 1 }}>
                  {selectedFish.name}
                </h2>
              </div>

              {/* Латинско + характер */}
              {selectedFish.latinName && (
                <p style={{ fontSize: '11px', fontStyle: 'italic', color: '#a8b4b4', marginBottom: '2px' }}>
                  {selectedFish.latinName}
                </p>
              )}
              {selectedFish.character && (
                <p style={{ fontSize: '12px', color: 'rgba(222,228,227,0.65)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {selectedFish.character}
                </p>
              )}

              {/* Score кръг + Badge */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0px' }}>
                <div style={{ position: 'relative', width: '52px', height: '52px', flexShrink: 0 }}>
                  <svg width="52" height="52" viewBox="0 0 52 52" style={{ position: 'absolute', top: 0, left: 0 }}>
                    <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2"/>
                    <circle cx="26" cy="26" r="21" fill="none" stroke="#2eb5b7" strokeWidth="2"
                      strokeDasharray={`${(selectedFish.score / 100) * 131.9} 131.9`}
                      strokeLinecap="round"
                      transform="rotate(-90 26 26)"/>
                  </svg>
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#dee4e3', lineHeight: 1 }}>
                      {selectedFish.score}
                    </div>
                    <div style={{ fontSize: '7px', letterSpacing: '0.06em', color: '#a8b4b4', textTransform: 'uppercase' }}>
                      /100
                    </div>
                  </div>
                </div>

                {selectedFish.isRecommended && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', border: '0.5px solid rgba(200,230,60,0.5)', borderRadius: '20px', background: 'rgba(200,230,60,0.06)' }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#C8E63C" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                    <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.05em', color: '#C8E63C' }}>
                      Препоръчано днес
                    </span>
                  </div>
                )}
              </div>

              <div style={{ height: '0.5px', background: '#1b2121', margin: '12px 0' }} />

              {advice && (
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b4b4', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Съвет за днес
                  </div>
                  <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'rgba(222,228,227,0.85)' }}>{advice.tip}</p>
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b4b4', marginBottom: '8px' }}>
                  Такъми & Монтаж
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ background: '#1b2121', border: '0.5px solid #3d4949', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a8b4b4', marginBottom: '4px' }}>Стръв & Захранка</div>
                    <div style={{ fontSize: '12px', color: '#dee4e3', lineHeight: 1.5 }}>{modalData.groundbaitTip}<br/><span style={{ color: '#2eb5b7' }}>{modalData.baitTip}</span></div>
                  </div>
                  <div style={{ background: '#1b2121', border: '0.5px solid #3d4949', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a8b4b4', marginBottom: '4px' }}>Влакно</div>
                    <div style={{ fontSize: '12px', color: '#dee4e3', lineHeight: 1.5 }}><span style={{ color: '#2eb5b7' }}>{modalData.lineDiameter}</span></div>
                  </div>
                  <div style={{ background: '#1b2121', border: '0.5px solid #3d4949', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a8b4b4', marginBottom: '4px' }}>Куки</div>
                    <div style={{ fontSize: '12px', color: '#dee4e3', lineHeight: 1.5 }}>{modalData.hookTip}</div>
                  </div>
                  <div style={{ background: '#1b2121', border: '0.5px solid #3d4949', borderRadius: '12px', padding: '10px 12px' }}>
                    <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a8b4b4', marginBottom: '4px' }}>
                      {modalData.lureTip ? 'Воблери' : 'Монтаж'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#dee4e3', lineHeight: 1.5 }}>
                      <span style={{ color: '#2eb5b7' }}>{modalData.lureTip ?? modalData.rigTip}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a8b4b4', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1" strokeLinecap="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  Еко & Правила
                </div>

                {/* Min size ruler */}
                {selectedFish.minSize && (() => {
                  const pct = Math.min(100, (selectedFish.minSize / 100) * 100);
                  return (
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: 9, color: '#869393', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Мин. размер</div>
                      <div style={{ position: 'relative', height: 24 }}>
                        {/* baseline */}
                        <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, height: 1, background: '#3d4949' }} />
                        {/* filled portion */}
                        <div style={{ position: 'absolute', bottom: 4, left: 0, width: `${pct}%`, height: 1, background: '#2eb5b7' }} />
                        {/* marker */}
                        <div style={{ position: 'absolute', bottom: 2, left: `${pct}%`, transform: 'translateX(-50%)' }}>
                          <div style={{ width: 1, height: 8, background: '#2eb5b7', margin: '0 auto' }} />
                        </div>
                        {/* label */}
                        <div style={{ position: 'absolute', bottom: 12, left: `${pct}%`, transform: 'translateX(-50%)', fontSize: 10, fontWeight: 600, color: '#2eb5b7', whiteSpace: 'nowrap' }}>
                          {selectedFish.minSize} см
                        </div>
                        {/* scale ends */}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, fontSize: 9, color: '#3d4949' }}>0</div>
                        <div style={{ position: 'absolute', bottom: 0, right: 0, fontSize: 9, color: '#3d4949' }}>100 см</div>
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
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 9, color: '#869393', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Забранен период</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {activeZones.map(z => {
                          const ban = selectedFish.altitudeBans![z.key]!;
                          const isBanned = isInBanPeriod(ban.start, ban.end);
                          return (
                            <div key={z.key} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: isBanned ? '4px 8px' : '2px 0',
                              borderRadius: 6,
                              border: isBanned ? '1px solid rgba(220,60,60,0.6)' : 'none',
                            }}>
                              <span style={{ fontSize: 11, color: '#869393' }}>{z.label}</span>
                              <span style={{ fontSize: 11, color: isBanned ? '#DC3C3C' : '#869393' }}>{ban.start} – {ban.end}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                <a href="https://iara.government.bg" target="_blank" rel="noreferrer"
                  style={{ fontSize: 11, color: '#2eb5b7', textDecoration: 'none' }}>
                  iara.government.bg ↗
                </a>
              </div>

              <div style={{ borderTop: '0.5px solid #3d4949', padding: '14px 0', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: '#869393' }}>Калкулатор за тегло</span>
                </div>

                <style>{`input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}`}</style>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#a8b4b4', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Дължина</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" placeholder="0" value={calcLen}
                        onChange={e => setCalcLen(e.target.value)}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #a8b4b4', borderRadius: 0, outline: 'none', color: '#dee4e3', fontSize: 14, fontWeight: 500, width: '100%', minWidth: 0, padding: '4px 0', MozAppearance: 'textfield' } as React.CSSProperties} />
                      <span style={{ fontSize: 11, color: '#3d4949' }}>см</span>
                    </div>
                  </div>

                  <span style={{ fontSize: 16, color: '#3d4949', paddingBottom: 8 }}>×</span>

                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, color: '#a8b4b4', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Обиколка</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input type="number" placeholder="—" value={calcGirth}
                        onChange={e => setCalcGirth(e.target.value)}
                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #a8b4b4', borderRadius: 0, outline: 'none', color: '#dee4e3', fontSize: 14, fontWeight: 500, width: '100%', minWidth: 0, padding: '4px 0', MozAppearance: 'textfield' } as React.CSSProperties} />
                      <span style={{ fontSize: 11, color: '#3d4949' }}>см</span>
                    </div>
                  </div>

                  <span style={{ fontSize: 16, color: '#3d4949', paddingBottom: 8 }}>=</span>

                  <div style={{ minWidth: 70, textAlign: 'right', paddingBottom: 6 }}>
                    {calcLen ? (
                      <span style={{ fontSize: 18, fontWeight: 700, color: '#C8E63C' }}>
                        {calcWeight(selectedFish.name, parseFloat(calcLen), parseFloat(calcGirth))}
                      </span>
                    ) : (
                      <span style={{ fontSize: 18, color: '#3d4949' }}>—</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #3d4949' }}>
                  <span style={{ fontSize: 10, color: '#3d4949' }}>~85% точност</span>
                  <button onClick={() => setShowFormulaInfo(!showFormulaInfo)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3d4949" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                    <span style={{ fontSize: 10, color: '#3d4949' }}>за формулата</span>
                  </button>
                </div>

                {showFormulaInfo && (
                  <div style={{ fontSize: 11, color: '#869393', lineHeight: 1.5, marginTop: 8, paddingTop: 8, borderTop: '0.5px solid #3d4949' }}>
                    Формулата принадлежи на <span style={{ color: '#2eb5b7', fontWeight: 500 }}>Милко Георгиев</span> — легенда в българското сомарство. Проверена в практиката, с точност до ~85%.
                  </div>
                )}
              </div>

              {advice?.mistake && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'rgba(147,0,10,0.1)', border: '0.5px solid rgba(255,180,171,0.2)', borderRadius: '12px', padding: '10px 12px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'rgba(147,0,10,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '11px', fontWeight: 700, color: '#ffb4ab' }}>!</div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,180,171,0.8)', textTransform: 'uppercase', marginBottom: '3px' }}>Честа грешка</div>
                    <p style={{ fontSize: '12px', color: 'rgba(222,228,227,0.7)', lineHeight: 1.55 }}>{advice.mistake}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
