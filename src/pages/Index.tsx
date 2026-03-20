import { useMemo } from 'react';
import { getMoonData } from '@/lib/moon';
import { getSmartFishingTips } from '@/lib/fishing-expert';
import { useWeather } from '@/hooks/use-weather';
import { Cloud, Wind, Droplets, ThermometerSun, MapPin, Anchor, Fish, Loader2, MapPinOff, Gauge, Sunrise, Sunset, Thermometer } from 'lucide-react';
import { FishGuide } from '@/components/FishGuide';

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
    return getSmartFishingTips(moon, weather.temperature, weather.windSpeed, weather.weatherCode);
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
            <div className="flex flex-col items-center gap-1">
              <Gauge className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">
                {weather ? `${weather.pressure} хПа` : '—'}
              </span>
              {weather ? (
                <span className={`text-xs font-medium ${weather.pressureTrend === 'rising' ? 'text-green-400' : weather.pressureTrend === 'falling' ? 'text-amber-400' : 'text-muted-foreground'}`}>
                  {weather.pressureTrend === 'rising' ? '📈 Нарастващо' : weather.pressureTrend === 'falling' ? '📉 Падащо' : '➡️ Стабилно'}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Барометър</span>
              )}
            </div>
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

        {/* Daily Pro Tips */}
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
