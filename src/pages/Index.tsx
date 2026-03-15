import { useMemo } from 'react';
import { getMoonData } from '@/lib/moon';
import { Cloud, Wind, Droplets, ThermometerSun, MapPin, Star } from 'lucide-react';

const Index = () => {
  const moon = useMemo(() => getMoonData(), []);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-ocean/40 via-background to-background pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_70%_20%/0.3)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-4 pb-8">
        {/* Header */}
        <header className="pt-6 pb-2 text-center">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            🌙 The Lunar Fisherman
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{today}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>Your Location</span>
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
            {moon.phaseName}
          </h2>
          <p className="text-sm text-primary font-medium mt-1">
            {moon.illumination}% Illuminated
          </p>
        </section>

        {/* Fishing Forecast */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Fishing Forecast
          </h3>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i <= moon.fishingScore
                      ? 'text-primary fill-primary drop-shadow-[0_0_6px_hsl(180_80%_55%/0.6)]'
                      : 'text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-lg font-bold font-display text-foreground">
              {moon.fishingLabel}
            </span>
          </div>
          <p className="text-sm text-secondary-foreground leading-relaxed">
            {moon.fishingTip}
          </p>
        </section>

        {/* Weather Widget */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 mb-4">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Weather Conditions
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <ThermometerSun className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">72°F</span>
              <span className="text-xs text-muted-foreground">Temp</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">8 mph</span>
              <span className="text-xs text-muted-foreground">Wind</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Droplets className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold font-display text-foreground">65%</span>
              <span className="text-xs text-muted-foreground">Humidity</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-border">
            <Cloud className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Partly Cloudy — Placeholder Data</span>
          </div>
        </section>

        {/* Top Baits */}
        <section className="rounded-xl border border-border bg-card/60 backdrop-blur-md p-5">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Top Baits for Today
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {moon.baits.map((bait) => (
              <div
                key={bait.name}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/50 px-3 py-3 transition-colors hover:bg-secondary"
              >
                <span className="text-2xl">{bait.icon}</span>
                <span className="text-sm font-medium text-foreground">{bait.name}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center mt-8 text-xs text-muted-foreground">
          Tight lines & clear skies 🎣
        </footer>
      </div>
    </div>
  );
};

export default Index;
