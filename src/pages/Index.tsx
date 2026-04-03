import { useMemo, useState, useEffect } from 'react';
import { getMoonData } from '@/lib/moon';
import { getSmartFishingTips } from '@/lib/fishing-expert';
import { useWeather } from '@/hooks/use-weather';
import { Cloud, Wind, Droplets, ThermometerSun, MapPin, Anchor, Fish, Loader2, MapPinOff, Gauge, Sunrise, Sunset, Thermometer, Moon, MoonStar } from 'lucide-react';
import { FishGuide } from '@/components/FishGuide';
import { ForecastCards } from '@/components/ForecastCards';

const Index = () => {
  const moon = useMemo(() => getMoonData(), []);
  const { weather, loading, error, locationDenied } = useWeather();

  const today = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const tips = useMemo(() => {
    if (!weather) return null;
    return getSmartFishingTips(moon, weather.temperature, weather.windSpeed, weather.weatherCode, {
      pressureTrend: weather.pressureTrend,
      waterTemp: weather.waterTemp,
      sunrise: weather.sunrise,
      sunset: weather.sunset,
    });
  }, [moon, weather]);

  const fishIcons = Array.from({ length: moon.fishingScore }, (_, i) => (
    <span key={i} className="text-2xl drop-shadow-[0_0_6px_hsl(180_80%_55%/0.6)]">
      {i % 2 === 0 ? '🐟' : '🐠'}
    </span>
  ));

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-ocean/40 via-background to-background pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_70%_20%/0.3)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 pb-8">
        {/* Header */}
        <header className="pt-6 pb-2 text-center">
          <img src="/logo-new.png" alt="Лунният Рибар лого" className="w-16 h-16 mx-auto mb-2 rounded-full drop-shadow-[0_0_12px_hsl(var(--primary)/0.5)]" />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Лунният Рибар
          </h1>
          <p className="text-sm text-muted-foreground mt-1 capitalize">{today}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Търсене на локация...</span>
              </>
            ) : locationDenied ? (
              <>
                <MapPinOff className="w-3 h-3" />
                <span>Локацията е отказана</span>
              </>
            ) : weather ? (
              <>
                <MapPin className="w-3 h-3" />
                <span>{weather.locationName}</span>
              </>
            ) : (
              <>
                <MapPinOff className="w-3 h-3" />
                <span>Няма данни за локация</span>
              </>
            )}
          </div>
        </header>

        {/* Moon Phase Hero */}
        <section className="flex flex-col items-center mt-6 mb-8">
          <div
            className="text-8xl leading-none select-none"
            style={{
              animation: 'pulse-glow 4s ease-in-out infinite, float 6s ease-in-out infinite',
              borderRadius: '50%',
              filter: 'drop-shadow(0 0 20px hsl(180 80% 55% / 0.4))',
            }}
          >
            {moon.emoji}
          </div>
          <h2 className="font-display text-xl font-semibold text-foreground mt-4">
            {moon.phaseNameBg}
          </h2>
          <p className="text-sm text-primary font-medium mt-1">
            {moon.illumination}% Осветеност
          </p>
        </section>

        {/* Fishing Forecast */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Fish className="w-4 h-4" />
            Прогноза за риболов
          </h3>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex gap-1">{fishIcons}</div>
            <span className="text-lg font-bold font-display text-foreground">
              {moon.fishingLabel}
            </span>
          </div>
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {moon.fishingTip}
          </p>
        </section>

        {/* Smart Weather Tips (only when weather is loaded) */}
        {tips && (
          <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-4 mb-4 space-y-2">
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              🧠 Умни съвети
            </h3>
            <p className="text-sm text-foreground leading-relaxed">{tips.weatherTip}</p>
            <p className="text-sm text-foreground leading-relaxed">{tips.windTip}</p>
            <p className="text-sm text-primary font-medium">{tips.timingTip}</p>
          </section>
        )}

        {/* Fishing Style Tip */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-4 mb-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <Anchor className="w-4 h-4" />
            Съвет за стил на риболов
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            {tips ? tips.fishingStyleTip : moon.fishingStyleTip}
          </p>
        </section>

        {/* Weather Widget */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Cloud className="w-4 h-4" />
            Метеорологични условия
          </h3>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Зареждане на времето...</span>
            </div>
          ) : error && !weather ? (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground mt-1">Показват се примерни данни</p>
            </div>
          ) : null}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <ThermometerSun className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? `${weather.temperature}°C` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">Темп.</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? `${weather.windSpeed} км/ч` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">Вятър</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? `${weather.humidity}%` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">Влажност</span>
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
                  <span className="text-lg font-bold font-display text-foreground">
                    {weather ? `${weather.pressure} хПа` : '—'}
                  </span>
                </div>
                {weather && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    weather.pressureTrend === 'rising' ? 'bg-green-500/20 text-green-400' :
                    weather.pressureTrend === 'falling' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {weather.pressureTrend === 'rising' ? '📈 Нарастващо' : weather.pressureTrend === 'falling' ? '📉 Падащо' : '➡️ Стабилно'}
                  </span>
                )}
              </div>
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

                // Fishing context line
                const pDiff6h = values[values.length - 1] - values[0];
                let contextText = '';
                let contextColor = '';
                if (pDiff6h > 3) { contextText = '🎣 Налягането скача — рибата се активира'; contextColor = '#4CAF50'; }
                else if (pDiff6h > 1.5) { contextText = '🎣 Бавно нарастване — добри условия'; contextColor = '#4CAF50'; }
                else if (pDiff6h < -3) { contextText = '🎣 Рязко падане — трудна хапка или сомът излиза от дупките'; contextColor = '#FF7043'; }
                else if (pDiff6h < -1.5) { contextText = '🎣 Леко падане — очаквай деликатна хапка'; contextColor = '#FFA726'; }
                else { contextText = '🎣 Стабилно налягане — рибата е комфортна'; contextColor = '#9CA3AF'; }

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
                    <div className="flex justify-between mt-1">
                      {hist.map((h, i) => (
                        <span key={i} className="text-[9px] text-muted-foreground">{h.time}</span>
                      ))}
                    </div>
                    <p className="text-xs mt-2 font-medium" style={{ color: contextColor }}>{contextText}</p>
                  </div>
                );
              })()}
            </div>
          </div>
          {/* Divider + Sun/Moon Row */}
          <div className="border-t border-border my-4" />
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Sunrise className="w-5 h-5 text-primary" />
                <Sunset className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? weather.sunrise : '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                {weather ? `Залез ${weather.sunset}` : 'Изгрев / Залез'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <Moon className="w-5 h-5 text-primary" />
                <MoonStar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? weather.moonrise : '—'}
              </span>
              <span className="text-xs text-muted-foreground">
                {weather ? `Залез 🌑 ${weather.moonset}` : 'Луна изгрев / залез'}
              </span>
            </div>
          </div>
          {/* Divider + Water Temp */}
          <div className="border-t border-border my-4" />
          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1">
              <Thermometer className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? `${weather.waterTemp}°C` : '—'}
              </span>
              <span className="text-xs text-muted-foreground">Вода</span>
            </div>
          </div>
          {weather && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
              <span className="text-xl">{weather.weatherIcon}</span>
              <span className="text-sm text-muted-foreground">{weather.weatherLabel}</span>
            </div>
          )}
        </section>

        {/* Solunar Activity Section */}
        {weather && weather.solunarPeaks && (
          <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              🌙 Солунарна активност
            </h3>

            {/* Moon rise/set times */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
                <Moon className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Изгрев на луната</p>
                  <p className="text-sm font-bold text-foreground">{weather.moonrise}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
                <MoonStar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Залез на луната</p>
                  <p className="text-sm font-bold text-foreground">{weather.moonset}</p>
                </div>
              </div>
            </div>

            {/* 24h Timeline */}
            {(() => {
              const parseTime = (t: string): number => {
                const [h, m] = t.split(':').map(Number);
                return h + m / 60;
              };
              const now = new Date();
              const currentHour = now.getHours() + now.getMinutes() / 60;
              const timelineW = 100; // percentage

              return (
                <div>
                  {/* Timeline bar */}
                  <div className="relative h-10 rounded-lg overflow-hidden bg-secondary/30 border border-border">
                    {/* Peak blocks */}
                    {weather.solunarPeaks.map((peak, i) => {
                      const startH = parseTime(peak.start);
                      const endH = parseTime(peak.end);
                      // Handle wrap-around midnight
                      const left = (startH / 24) * 100;
                      let width: number;
                      if (endH > startH) {
                        width = ((endH - startH) / 24) * 100;
                      } else {
                        width = ((24 - startH + endH) / 24) * 100;
                      }
                      const isMajor = peak.type === 'major';
                      return (
                        <div
                          key={i}
                          className="absolute top-0 h-full flex items-center justify-center"
                          style={{
                            left: `${left}%`,
                            width: `${Math.max(width, 2)}%`,
                            backgroundColor: isMajor ? 'hsl(var(--primary) / 0.35)' : 'hsl(var(--primary) / 0.15)',
                            borderLeft: `1px solid hsl(var(--primary) / ${isMajor ? '0.6' : '0.3'})`,
                            borderRight: `1px solid hsl(var(--primary) / ${isMajor ? '0.6' : '0.3'})`,
                          }}
                        >
                          <span className="text-[8px] font-medium text-primary truncate px-0.5">
                            {isMajor ? 'Главен' : 'Малък'}
                          </span>
                        </div>
                      );
                    })}
                    {/* Current time marker */}
                    <div
                      className="absolute top-0 h-full w-0.5"
                      style={{
                        left: `${(currentHour / 24) * 100}%`,
                        backgroundColor: 'hsl(var(--primary))',
                        boxShadow: '0 0 6px hsl(var(--primary))',
                      }}
                    />
                  </div>
                  {/* Time labels */}
                  <div className="flex justify-between mt-1 px-0.5">
                    {[0, 3, 6, 9, 12, 15, 18, 21].map(h => (
                      <span key={h} className="text-[9px] text-muted-foreground">
                        {String(h).padStart(2, '0')}
                      </span>
                    ))}
                  </div>
                  {/* Peak list */}
                  <div className="mt-3 space-y-1.5">
                    {weather.solunarPeaks.map((peak, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`w-2 h-2 rounded-full ${peak.type === 'major' ? 'bg-primary' : 'bg-primary/40'}`} />
                        <span className="text-muted-foreground">{peak.label}:</span>
                        <span className="font-medium text-foreground">{peak.start} — {peak.end}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          peak.type === 'major' 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {peak.type === 'major' ? 'Главен' : 'Малък'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </section>
        )}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            🎣 Дневни професионални съвети
          </h3>

          {/* Baits */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
              🪝 Стръв
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(tips?.baits ?? moon.baits).map((bait) => (
                <div
                  key={bait.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 transition-colors hover:bg-secondary"
                >
                  <span className="text-lg">{bait.icon}</span>
                  <span className="text-sm font-medium text-foreground">{bait.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tackle */}
          <div className="mb-4">
            <h4 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
              ⚓ Такъми
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {(tips?.tackle ?? moon.tackle).map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 transition-colors hover:bg-secondary"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* Multi-day Forecast */}
        <ForecastCards weather={weather} />

        {/* Fish Guide */}
        <FishGuide moon={moon} weather={weather} />

        <footer className="text-center mt-8 space-y-1">
          <p className="text-xs text-muted-foreground">Стегнати линии и чисто небе 🎣</p>
          {weather && (
            <p className="text-[10px] text-muted-foreground/60">
              📍 Данните са базирани на текущата ви локация • Open-Meteo API
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
