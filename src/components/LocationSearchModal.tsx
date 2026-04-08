import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search, Wind, ThermometerSun, Gauge, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { buildLocationSuggestions, type LocationSuggestion } from '@/lib/location-search';
import { getLocationForecast, type LocationForecastResult } from '@/lib/location-forecast';
import type { LocationOverride } from '@/hooks/use-weather';

interface LocationSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyLocation: (location: LocationOverride) => void;
}

export function LocationSearchModal({ open, onOpenChange, onApplyLocation }: LocationSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selected, setSelected] = useState<LocationSuggestion | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [hideSuggestionsAfterPick, setHideSuggestionsAfterPick] = useState(false);
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
        const result = await buildLocationSuggestions(trimmed, abortController.signal);
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
    () => !loadingSuggestions && query.trim().length > 0 && suggestions.length === 0 && !hideSuggestionsAfterPick,
    [loadingSuggestions, query, suggestions.length, hideSuggestionsAfterPick]
  );
  const showDropdown = inputFocused && query.trim().length > 0 && !hideSuggestionsAfterPick;

  const handlePickLocation = async (item: LocationSuggestion) => {
    setSelected(item);
    setHideSuggestionsAfterPick(true);
    setInputFocused(false);
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

  const fishScoreFilled = Math.max(0, Math.min(5, Math.round(forecast?.fishing.score ?? 0)));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[96vw] max-w-md h-[86vh] p-0 border-border bg-card/95 backdrop-blur-xl overflow-hidden">
        <div className="flex h-full flex-col">
          <DialogHeader className="relative px-4 pt-4 pb-2 border-b border-border">
            <DialogTitle className="text-base font-display flex items-center gap-2 pr-20">
              <Search className="w-4 h-4 text-primary" />
              Търсене на локация
            </DialogTitle>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              disabled={!forecast}
              onClick={() => {
                if (!forecast) return;
                onApplyLocation({
                  latitude: forecast.weather.latitude,
                  longitude: forecast.weather.longitude,
                  locationName: forecast.weather.locationName,
                });
              }}
              className="absolute right-12 top-4 h-9 w-9 rounded-full border border-red-500/80 text-red-500 hover:text-red-400 hover:bg-red-500/10 disabled:text-muted-foreground disabled:border-muted-foreground/30 shadow-[0_0_0_1px_rgba(170,0,255,0.35),0_0_10px_rgba(170,0,255,0.5)]"
              aria-label="Задай за приложението"
            >
              <ArrowRight className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Input
                ref={inputRef}
                value={query}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setTimeout(() => setInputFocused(false), 120)}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHideSuggestionsAfterPick(false);
                }}
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
                    setHideSuggestionsAfterPick(false);
                    setForecast(null);
                    inputRef.current?.focus();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {showDropdown && (
                <div className="absolute z-20 left-0 right-0 mt-2 rounded-lg border border-border bg-card/95 shadow-lg backdrop-blur-md max-h-44 overflow-y-auto p-2 space-y-1 transition-all">
                  {loadingSuggestions && (
                    <div className="flex items-center justify-center py-4 text-muted-foreground text-sm gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Търсене...
                    </div>
                  )}
                  {!loadingSuggestions && suggestions.map((item) => (
                    <button
                      key={item.id}
                      className="w-full text-left rounded-md px-3 py-2 text-sm hover:bg-secondary transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handlePickLocation(item)}
                    >
                      {item.displayName}
                    </button>
                  ))}
                  {emptyState && (
                    <p className="text-sm text-center py-3 text-muted-foreground">Няма резултати</p>
                  )}
                </div>
              )}
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
                <section className="rounded-xl border border-border bg-card/60 p-3">
                  <h3 className="font-display text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                      <path d="M3 15a4 4 0 0 0 4 4h9a4 4 0 0 0 0-8 5 5 0 0 0-9.6-1.5A3.5 3.5 0 0 0 3 15z" />
                      <path d="M9 19l-1 2" />
                      <path d="M13 19l-1 2" />
                    </svg>
                    ПРОГНОЗА ЗА ВРЕМЕТО
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-foreground truncate pr-2">{forecast.weather.locationName}</p>
                    <span className="text-base">{forecast.weather.weatherIcon}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <ThermometerSun className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                      <p className="text-xs font-semibold">{forecast.weather.temperature}°C</p>
                      <p className="text-[10px] text-muted-foreground">Темп.</p>
                    </div>
                    <div>
                      <Wind className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                      <p className="text-xs font-semibold">{forecast.weather.windSpeed} км/ч</p>
                      <p className="text-[10px] text-muted-foreground">Вятър</p>
                    </div>
                    <div>
                      <Gauge className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
                      <p className="text-xs font-semibold">{forecast.weather.pressure} хПа</p>
                      <p className="text-[10px] text-muted-foreground">Налягане</p>
                    </div>
                  </div>
                </section>

                <section
                  className="rounded-xl bg-card/70 p-4"
                  style={{
                    border: '1.5px solid #00D4D4',
                    boxShadow: '0 0 10px rgba(0,212,212,0.2)',
                    background: 'rgba(0,18,28,0.72)',
                  }}
                >
                  <h3 className="font-display text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 48 48"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary/90"
                      aria-hidden="true"
                    >
                      <ellipse cx="22" cy="24" rx="14" ry="10" />
                      <path d="M36 24 L44 16 M36 24 L44 32" />
                      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
                    </svg>
                    РИБО ПРОГНОЗА
                  </h3>
                  <div className="mb-2 flex items-center gap-1.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={`modal-score-fish-${i}`}
                        width="16"
                        height="16"
                        viewBox="0 0 48 48"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={i < fishScoreFilled ? 'text-primary drop-shadow-[0_0_6px_hsl(var(--glow)/0.6)]' : 'text-muted-foreground/35'}
                        aria-hidden="true"
                      >
                        <ellipse cx="22" cy="24" rx="14" ry="10" />
                        <path d="M36 24 L44 16 M36 24 L44 32" />
                        <path d="M14 14 Q18 8 26 14" />
                        <path d="M16 28 L12 34" />
                        <circle cx="12" cy="22" r="1.5" fill="currentColor" />
                      </svg>
                    ))}
                  </div>
                  {forecast.fishing.isOverride && forecast.fishing.overrideReason && (
                    <div className="mb-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
                      {forecast.fishing.overrideReason}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
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
