import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, Wind, ThermometerSun, Gauge, X, Fish } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { searchLocationsInBg, type LocationSuggestion } from '@/lib/location-search';
import { getLocationForecast, type LocationForecastResult } from '@/lib/location-forecast';

interface LocationSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LocationSearchModal({ open, onOpenChange }: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selected, setSelected] = useState<LocationSuggestion | null>(null);
  const [forecast, setForecast] = useState<LocationForecastResult | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastError, setForecastError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }

    const abortController = new AbortController();
    const requestId = ++requestRef.current;
    const timeout = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const result = await searchLocationsInBg(trimmed, abortController.signal);
        if (requestId === requestRef.current) {
          setSuggestions(result);
        }
      } catch {
        if (requestId === requestRef.current) {
          setSuggestions([]);
        }
      } finally {
        if (requestId === requestRef.current) {
          setLoadingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      abortController.abort();
    };
  }, [query, open]);

  const emptyState = useMemo(
    () => !loadingSuggestions && query.trim().length > 0 && suggestions.length === 0,
    [loadingSuggestions, query, suggestions.length]
  );

  const handlePickLocation = async (item: LocationSuggestion) => {
    setSelected(item);
    setForecastLoading(true);
    setForecastError(null);
    try {
      const result = await getLocationForecast(item.latitude, item.longitude);
      result.weather.locationName = item.displayName;
      setForecast(result);
    } catch {
      setForecast(null);
      setForecastError('Неуспешно зареждане на прогнозата. Опитай отново.');
    } finally {
      setForecastLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-md h-[86vh] p-0 border-border bg-card/95 backdrop-blur-xl overflow-hidden">
        <div className="flex h-full flex-col">
          <DialogHeader className="px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="text-base font-display flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" />
              Търсене на локация
            </DialogTitle>
          </DialogHeader>

          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Търси локация (напр. язовир Батак)"
                className="pr-9"
              />
              {query && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => {
                    setQuery('');
                    setSuggestions([]);
                    setSelected(null);
                    setForecast(null);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="px-4 pb-2">
            <div className="rounded-lg border border-border bg-secondary/20">
              <div className="max-h-44 overflow-y-auto p-2 space-y-1">
                {loadingSuggestions && (
                  <div className="flex items-center justify-center py-5 text-muted-foreground text-sm gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Търсене...
                  </div>
                )}
                {!loadingSuggestions && suggestions.map((item) => (
                  <button
                    key={item.id}
                    className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    onClick={() => handlePickLocation(item)}
                  >
                    {item.displayName}
                  </button>
                ))}
                {emptyState && (
                  <p className="text-sm text-center py-4 text-muted-foreground">Няма резултати</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {!selected && !forecastLoading && !forecast && (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Избери локация, за да видиш прогноза
              </div>
            )}

            {forecastLoading && (
              <div className="space-y-3 mt-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            )}

            {forecastError && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive mt-2">
                {forecastError}
              </div>
            )}

            {forecast && (
              <div className="space-y-3 mt-2">
                <section className="rounded-xl border border-border bg-card/60 p-4">
                  <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider mb-3">🌦️ Прогноза за времето</h3>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-foreground">{forecast.weather.locationName}</p>
                    <span className="text-xl">{forecast.weather.weatherIcon}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <ThermometerSun className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-semibold">{forecast.weather.temperature}°C</p>
                      <p className="text-[11px] text-muted-foreground">Темп.</p>
                    </div>
                    <div>
                      <Wind className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-semibold">{forecast.weather.windSpeed} км/ч</p>
                      <p className="text-[11px] text-muted-foreground">Вятър</p>
                    </div>
                    <div>
                      <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
                      <p className="text-sm font-semibold">{forecast.weather.pressure} хПа</p>
                      <p className="text-[11px] text-muted-foreground">Налягане</p>
                    </div>
                  </div>
                </section>

                <section className="rounded-xl border border-border bg-card/60 p-4">
                  <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider mb-3">🎣 Прогноза за риболов</h3>
                  {forecast.fishing.isOverride && forecast.fishing.overrideReason && (
                    <div className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {forecast.fishing.overrideReason}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <Fish className="w-4 h-4 text-primary" />
                    <p className="text-sm font-semibold" style={{ color: forecast.fishing.color }}>
                      {forecast.fishing.label}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Оценка: {forecast.fishing.score}/5 • Барометър: {forecast.weather.pressureTrend === 'rising' ? 'Нарастващо' : forecast.weather.pressureTrend === 'falling' ? 'Падащо' : 'Стабилно'}
                  </p>
                </section>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
