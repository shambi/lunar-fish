import { useMemo, useState, useEffect } from 'react';
import { getMoonData } from '@/lib/moon';
import { getSmartFishingTips } from '@/lib/fishing-expert';
import { useWeather } from '@/hooks/use-weather';
import { Cloud, Wind, Droplets, ThermometerSun, MapPin, Anchor, Fish, Loader2, MapPinOff, Gauge, Sunrise, Sunset, Thermometer, Moon, MoonStar } from 'lucide-react';
import { FishGuide } from '@/components/FishGuide';
import { ForecastCards } from '@/components/ForecastCards';

const SolunarTimeline = ({ weather }: { weather: any }) => {
  const [currentPct, setCurrentPct] = useState(() => {
    const now = new Date();
    return ((now.getHours() + now.getMinutes() / 60) / 24) * 100;
  });
  const [tooltip, setTooltip] = useState<{ text: string; x: number } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentPct(((now.getHours() + now.getMinutes() / 60) / 24) * 100);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-hide tooltip on mobile
  useEffect(() => {
    if (!tooltip) return;
    const timer = setTimeout(() => setTooltip(null), 2000);
    return () => clearTimeout(timer);
  }, [tooltip]);

  const parseTime = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };
  const timeToPercent = (t: string) => (parseTime(t) / 24) * 100;
  const hourToPercent = (h: number) => (h / 24) * 100;

  const sunriseH = weather.sunrise && weather.sunrise !== '--:--' ? parseTime(weather.sunrise) : 7;
  const sunsetH = weather.sunset && weather.sunset !== '--:--' ? parseTime(weather.sunset) : 20;
  const moonriseH = weather.moonrise && weather.moonrise !== '--:--' ? parseTime(weather.moonrise) : null;
  const moonsetH = weather.moonset && weather.moonset !== '--:--' ? parseTime(weather.moonset) : null;

  const svgW = 400;
  const barH = 56;
  const barY = 0;
  const toX = (pct: number) => (pct / 100) * svgW;

  const sunriseP = hourToPercent(sunriseH);
  const sunsetP = hourToPercent(sunsetH);
  const transW = (15 / 1440) * 100; // 15 min

  const fishPath = "M0 3 Q2 0 5 1 L9 0 L8 1.5 L9 3 L5 2 Q2 5 0 3Z";

  return (
    <div className="space-y-1">
      {/* PART A — Sun Row */}
      <div className="relative h-8" style={{ marginLeft: 0, marginRight: 0 }}>
        {/* Sunrise */}
        <div className="absolute flex flex-col items-center" style={{ left: `${sunriseP}%`, transform: 'translateX(-50%)' }}>
          <Sunrise size={16} color="#FFD700" />
          <span className="text-[10px] font-medium" style={{ color: '#FFD700' }}>{weather.sunrise}</span>
        </div>
        {/* Sunset */}
        <div className="absolute flex flex-col items-center" style={{ left: `${sunsetP}%`, transform: 'translateX(-50%)' }}>
          <Sunset size={16} color="#FF8C42" />
          <span className="text-[10px] font-medium" style={{ color: '#FF8C42' }}>{weather.sunset}</span>
        </div>
      </div>

      {/* PART B — Timeline Bar (SVG) */}
      <div className="relative">
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-20 bg-card border border-primary rounded-lg px-2 py-1 text-xs shadow-lg pointer-events-none"
            style={{ left: `${tooltip.x}%`, transform: 'translateX(-50%)', top: -32 }}
          >
            {tooltip.text}
          </div>
        )}
        <svg viewBox={`0 0 ${svgW} ${barH}`} className="w-full rounded-lg overflow-hidden" style={{ height: 56 }} preserveAspectRatio="none">
          <defs>
            <linearGradient id="srGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0a1628" />
              <stop offset="100%" stopColor="hsl(45 80% 55%)" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="ssGrad2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(45 80% 55%)" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0a1628" />
            </linearGradient>
            <linearGradient id="majGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4D4" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#00D4D4" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="minGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D4D4" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00D4D4" stopOpacity="0" />
            </linearGradient>
            <filter id="cursorGlow2">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Layer 1: Day/Night background */}
          <rect x={0} y={0} width={toX(sunriseP - transW)} height={barH} fill="#0a1628" />
          <rect x={toX(sunriseP - transW)} y={0} width={toX(transW * 2)} height={barH} fill="url(#srGrad2)" />
          <rect x={toX(sunriseP + transW)} y={0} width={toX(sunsetP - sunriseP - transW * 2)} height={barH} fill="hsl(45 80% 55%)" fillOpacity="0.15" />
          <rect x={toX(sunsetP - transW)} y={0} width={toX(transW * 2)} height={barH} fill="url(#ssGrad2)" />
          <rect x={toX(sunsetP + transW)} y={0} width={svgW - toX(sunsetP + transW)} height={barH} fill="#0a1628" />

          {/* Layer 2: Solunar peaks */}
          {weather.solunarPeaks.map((peak: any, i: number) => {
            const startH = parseTime(peak.start);
            const endH = parseTime(peak.end);
            const isMajor = peak.type === 'major';
            const x = toX(hourToPercent(startH));
            let w = endH > startH ? toX(hourToPercent(endH)) - x : toX(hourToPercent(24 - startH + endH));
            w = Math.max(w, 8);
            const peakH = isMajor ? barH : barH * 0.6;
            const peakY = 0;

            return (
              <g key={i} style={{ cursor: 'pointer' }} onClick={() => {
                const label = isMajor ? 'Главен пик' : 'Малък пик';
                setTooltip({ text: `🎣 ${label} · ${peak.start} – ${peak.end}`, x: hourToPercent(startH) + (hourToPercent(endH > startH ? endH : 24) - hourToPercent(startH)) / 2 });
              }}>
                <rect x={x} y={peakY} width={w} height={peakH} fill={isMajor ? 'url(#majGrad2)' : 'url(#minGrad2)'} />
                <line x1={x} y1={peakY} x2={x} y2={peakY + peakH} stroke="#00D4D4" strokeWidth="1" strokeOpacity={isMajor ? 0.8 : 0.4} />

                {/* Fish silhouettes */}
                {isMajor ? (
                  <>
                    <g transform={`translate(${x + w / 2 - 10}, ${barH / 2 - 6}) scale(1)`} opacity="0.7"><path d={fishPath} fill="#00D4D4" /></g>
                    <g transform={`translate(${x + w / 2 - 2}, ${barH / 2 - 1}) scale(0.8)`} opacity="0.5"><path d={fishPath} fill="#00D4D4" /></g>
                    <g transform={`translate(${x + w / 2 + 5}, ${barH / 2 + 4}) scale(0.9)`} opacity="0.6"><path d={fishPath} fill="#00D4D4" /></g>
                  </>
                ) : (
                  <g transform={`translate(${x + w / 2 - 4}, ${peakH / 2 - 2}) scale(0.8)`} opacity="0.5"><path d={fishPath} fill="#00D4D4" /></g>
                )}
              </g>
            );
          })}

          {/* Layer 3: Hour labels */}
          {[0, 6, 12, 18, 24].map(h => (
            <text key={h} x={toX(hourToPercent(h === 24 ? 23.99 : h))} y={barH - 4} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.35)">{String(h === 24 ? 24 : h).padStart(2, '0')}</text>
          ))}

          {/* Layer 4: "Сега" cursor */}
          <line x1={toX(currentPct)} y1={0} x2={toX(currentPct)} y2={barH} stroke="#00D4D4" strokeWidth="2" filter="url(#cursorGlow2)">
            <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
          </line>
          {/* Triangle above */}
          <polygon points={`${toX(currentPct) - 4},-1 ${toX(currentPct) + 4},-1 ${toX(currentPct)},5`} fill="#00D4D4" />
        </svg>
      </div>

      {/* PART C — Moon Row */}
      <div className="relative h-6">
        {moonriseH !== null && (
          <div className="absolute flex items-center gap-0.5" style={{ left: `${hourToPercent(moonriseH)}%`, transform: 'translateX(-50%)' }}>
            <span className="text-[10px]" style={{ color: '#00D4D4' }}>↑</span>
            <Moon size={14} color="#00D4D4" />
            <span className="text-[10px] font-medium" style={{ color: '#00D4D4', opacity: 0.8 }}>{weather.moonrise}</span>
          </div>
        )}
        {moonsetH !== null && (
          <div className="absolute flex items-center gap-0.5" style={{ left: `${hourToPercent(moonsetH)}%`, transform: 'translateX(-50%)' }}>
            <span className="text-[10px]" style={{ color: '#00D4D4', opacity: 0.5 }}>↓</span>
            <Moon size={14} color="#00D4D4" opacity={0.5} />
            <span className="text-[10px] font-medium" style={{ color: '#00D4D4', opacity: 0.5 }}>{weather.moonset}</span>
          </div>
        )}
        {moonriseH === null && weather.moonrise && weather.moonrise !== '--:--' && (
          <div className="absolute flex items-center gap-0.5" style={{ left: '2%' }}>
            <span className="text-[10px]" style={{ color: '#00D4D4' }}>↑</span>
            <Moon size={14} color="#00D4D4" />
            <span className="text-[10px] font-medium" style={{ color: '#00D4D4', opacity: 0.8 }}>{weather.moonrise} (+1д)</span>
          </div>
        )}
      </div>

      {/* PART D — Legend */}
      <div className="flex items-center justify-center gap-4 text-[10px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(0,212,212,0.7)' }} />
          Главен пик — засилена активност
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: 'rgba(0,212,212,0.3)' }} />
          Малък пик — умерена активност
        </span>
        <span className="flex items-center gap-1">
          <span className="w-0.5 h-3 rounded-full" style={{ backgroundColor: '#00D4D4', boxShadow: '0 0 4px #00D4D4' }} />
          Сега
        </span>
      </div>
    </div>
  );
};


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
          {/* Water Temp */}
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

        {/* Solunar Activity Section — SVG Timeline */}
        {weather && weather.solunarPeaks && (() => {
          const parseTime = (t: string): number => {
            const [h, m] = t.split(':').map(Number);
            return h + m / 60;
          };
          const pct = (t: string) => (parseTime(t) / 24) * 100;
          const pctH = (h: number) => (h / 24) * 100;

          const sunriseH = weather.sunrise ? parseTime(weather.sunrise) : 7;
          const sunsetH = weather.sunset ? parseTime(weather.sunset) : 20;
          const moonriseH = weather.moonrise && weather.moonrise !== '--:--' ? parseTime(weather.moonrise) : null;
          const moonsetH = weather.moonset && weather.moonset !== '--:--' ? parseTime(weather.moonset) : null;

          const transitionMin = 20 / 60; // 20 minutes in hours

          // Fish silhouette path (small, ~12x6 viewbox scaled)
          const fishPath = "M0 3 Q2 0 5 1 L9 0 L8 1.5 L9 3 L5 2 Q2 5 0 3Z";

          return (
            <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
              <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                🌙 Солунарна активност
              </h3>

              <SolunarTimeline
                weather={weather}
                parseTime={parseTime}
                pct={pct}
                pctH={pctH}
                sunriseH={sunriseH}
                sunsetH={sunsetH}
                moonriseH={moonriseH}
                moonsetH={moonsetH}
                transitionMin={transitionMin}
                fishPath={fishPath}
              />

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                  Главен пик
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--primary) / 0.4)' }} />
                  Малък пик
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-0.5 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))', boxShadow: '0 0 4px hsl(var(--primary))' }} />
                  Сега
                </span>
              </div>
            </section>
          );
        })()}
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
