import { useState, useMemo } from 'react';
import { getScoredFish, getFishModalData, type ScoredFish } from '@/lib/fish-guide';
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
}

export function FishGuide({ moon, weather }: FishGuideProps) {
  const [terrain, setTerrain] = useState<'river' | 'lake'>('lake');
  const [selectedFish, setSelectedFish] = useState<ScoredFish | null>(null);

  const temp = weather?.temperature ?? 18;
  const wind = weather?.windSpeed ?? 5;
  const weatherCode = weather?.weatherCode ?? 0;

  const scoredFish = useMemo(
    () => getScoredFish(moon.fishingScore, temp, wind, terrain),
    [moon.fishingScore, temp, wind, terrain]
  );

  const modalData = useMemo(() => {
    if (!selectedFish) return null;
    return getFishModalData(selectedFish, temp, weatherCode, terrain);
  }, [selectedFish, temp, weatherCode, terrain]);

  return (
    <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
      <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
        🐟 Пълен гид за сладководни риби
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
          🏞️ Езеро
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
        {scoredFish.map((fish) => (
          <button
            key={fish.name}
            onClick={() => setSelectedFish(fish)}
            className={`relative flex flex-col items-center gap-1 rounded-lg border p-3 transition-all hover:scale-[1.03] active:scale-[0.98] ${
              fish.isRecommended
                ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--glow)/0.3)]'
                : 'border-border bg-secondary/30 opacity-70 hover:opacity-100'
            }`}
          >
            {fish.isRecommended && (
              <Badge className="absolute -top-2 -right-1 text-[9px] px-1.5 py-0 bg-primary text-primary-foreground">
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
            {fish.habitat !== 'both' && fish.habitat !== terrain && (
              <span className="text-[9px] text-muted-foreground">
                ({fish.habitat === 'river' ? 'река' : 'езеро'})
              </span>
            )}
          </button>
        ))}
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
                  <span className="text-3xl">{selectedFish.emoji}</span>
                  {selectedFish.name}
                  {selectedFish.isRecommended && (
                    <Badge className="bg-primary text-primary-foreground text-[10px]">
                      ⭐ Препоръчано днес
                    </Badge>
                  )}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-xs">
                  Резултат: {selectedFish.score}/100 • {selectedFish.habitat === 'river' ? 'Река' : selectedFish.habitat === 'lake' ? 'Езеро' : 'Река & Езеро'}
                </DialogDescription>
              </DialogHeader>

              <ScrollArea className="max-h-[55vh] pr-2">
                <div className="space-y-4 text-sm">
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
                    <p className="text-foreground">{modalData.ecoWarning}</p>
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
