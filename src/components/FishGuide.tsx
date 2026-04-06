import { useState, useMemo } from 'react';
import { getScoredFish, getFishModalData, type ScoredFish } from '@/lib/fish-guide';
import { getDailyAdvice } from '@/lib/fish-advice';
import type { MoonData } from '@/lib/moon';
import type { WeatherData } from '@/hooks/use-weather';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FISH_ICON_MAP } from '@/components/FishIcons';

interface FishGuideProps {
  moon: MoonData;
  weather: WeatherData | null;
  solunarContext?: { isInPeak: boolean; peakType: 'major' | 'minor' | null };
}

export function FishGuide({ moon, weather, solunarContext }: FishGuideProps) {
  const [terrain, setTerrain] = useState<'river' | 'lake'>('lake');
  const [selectedFish, setSelectedFish] = useState<ScoredFish | null>(null);

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
    return getFishModalData(selectedFish, temp, weatherCode, terrain);
  }, [selectedFish, temp, weatherCode, terrain]);

  const advice = useMemo(() => {
    if (!selectedFish) return null;
    return getDailyAdvice(selectedFish, moon, weather, terrain, solunarContext);
  }, [selectedFish, moon, weather, terrain, solunarContext]);

  return (
    <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        🐟 Рибо гид
      </h3>

      {/* Terrain toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTerrain('lake')}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            terrain === 'lake'
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          🏞️ Водоем
        </button>
        <button
          onClick={() => setTerrain('river')}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
            terrain === 'river'
              ? 'border-primary bg-primary/20 text-primary'
              : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          🌊 Река
        </button>
      </div>

      {/* Fish grid */}
      <div className="grid grid-cols-3 gap-2">
        {scoredFish.map((fish) => {
          const isGlow = fish.stars >= 4;
          const isDimmed = fish.stars <= 2;

          return (
            <button
              key={fish.name}
              onClick={() => setSelectedFish(fish)}
              className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 transition-all hover:scale-[1.03] active:scale-[0.98] ${
                isGlow
                  ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--glow)/0.3)]'
                  : isDimmed
                  ? 'border-border bg-secondary/30 opacity-45'
                  : 'border-border bg-secondary/30 hover:opacity-100'
              }`}
            >
              {isGlow && (
                <Badge
                  className="absolute -top-2 -right-1 text-[9px] px-1.5 py-0 bg-primary text-primary-foreground"
                  style={{ animation: 'star-signal 2.5s ease-in-out infinite' }}
                >
                  ⭐
                </Badge>
              )}
              {FISH_ICON_MAP[fish.name]
                ? FISH_ICON_MAP[fish.name]({ size: 40 })
                : <span className="text-2xl">{fish.emoji}</span>
              }
              <span className="text-xs font-medium text-foreground text-center leading-tight">
                {fish.name}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-muted-foreground/60 text-center mt-3">
        Натиснете риба за подробна информация • Изчислено според текущите условия
      </p>

      {/* Fish detail modal */}
      <Dialog open={!!selectedFish} onOpenChange={(open) => !open && setSelectedFish(null)}>
        <DialogContent className="max-w-sm bg-card border-border max-h-[85vh]">
          {selectedFish && modalData && (
            <>
              <DialogHeader>
                  <DialogTitle className="font-display flex items-center gap-2 text-foreground">
                    {FISH_ICON_MAP[selectedFish.name]
                      ? FISH_ICON_MAP[selectedFish.name]({ size: 40 })
                      : <span className="text-3xl">{selectedFish.emoji}</span>
                    }
                  {selectedFish.name}
                  {selectedFish.isRecommended && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      ⭐ Препоръчано днес
                    </Badge>
                  )}
                </DialogTitle>
                {selectedFish.subtitle && (
                  <p className="text-muted-foreground text-xs italic">{selectedFish.subtitle}</p>
                )}
                <DialogDescription className="text-muted-foreground text-xs">
                  Резултат: {selectedFish.score}/100 • {selectedFish.habitat === 'river' ? 'Река' : selectedFish.habitat === 'lake' ? 'Водоем' : 'Река & Водоем'}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[55vh] pr-2">
                <div className="space-y-4 text-sm">
                  {/* Daily Advice */}
                  {advice && (
                    <>
                      <div>
                        <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                          🎯 Съвет за днес
                        </h4>
                        <p className="text-foreground leading-relaxed whitespace-pre-line">{advice.tip}</p>
                      </div>
                      <div className="border-t border-border" />

                      {advice.mistake && (
                        <>
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider mb-1 flex items-center gap-1" style={{ color: '#FFA726' }}>
                              ⚠️ Честа грешка днес
                            </h4>
                            <p className="text-foreground leading-relaxed">{advice.mistake}</p>
                          </div>
                          <div className="border-t border-border" />
                        </>
                      )}
                    </>
                  )}

                  {/* Groundbait & Bait */}
                  <div>
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                      🪝 Захранка & Стръв
                    </h4>
                    <p className="text-foreground leading-relaxed">{modalData.groundbaitTip}</p>
                    <p className="text-secondary-foreground leading-relaxed mt-1">{modalData.baitTip}</p>
                  </div>

                  {/* Line */}
                  <div>
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                      🎣 Влакно & Монофил
                    </h4>
                    <p className="text-foreground">{modalData.lineDiameter}</p>
                  </div>

                  {/* Lures (predators only) */}
                  {modalData.lureTip && (
                    <div>
                      <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                        🎯 Воблери & Корди
                      </h4>
                      <p className="text-foreground leading-relaxed">{modalData.lureTip}</p>
                    </div>
                  )}

                  {/* Hooks & Tackle */}
                  <div>
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                      ⚓ Такъми & Куки
                    </h4>
                    <p className="text-foreground">{modalData.hookTip}</p>
                    <p className="text-secondary-foreground mt-1">{modalData.rigTip}</p>
                  </div>

                  {/* Eco warning */}
                  <div className="rounded-lg border border-border bg-secondary/30 p-3">
                    <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                      🌿 Еко-съвет
                    </h4>
                    <p className="text-foreground whitespace-pre-line">{modalData.ecoWarning}</p>
                  </div>

                  <p className="text-[10px] text-muted-foreground/60 text-center pt-2">
                    📊 Данните са синхронизирани с луната и прогнозата
                  </p>
                </div>
              </ScrollArea>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
