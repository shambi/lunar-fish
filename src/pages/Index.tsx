import { useMemo, useState, useEffect } from 'react';
import { getMoonData } from '@/lib/moon';
import { getSmartFishingTips, getTimePeriod } from '@/lib/fishing-expert';
import { calculateFishingScore } from '@/lib/fishing-score';
import { useWeather } from '@/hooks/use-weather';
import { Cloud, Wind, Droplets, ThermometerSun, Anchor, Fish, Loader as Loader2, Gauge, Mountain, LocateFixed } from 'lucide-react';
import { FishGuide } from '@/components/FishGuide';
import { ForecastCards } from '@/components/ForecastCards';
import { PerchIcon, CarpIcon, PikeIcon, BreamIcon, CatfishIcon } from '@/components/FishIcons';
import { AdviceIcon } from '@/components/AdviceIcon';
import { WindCompass } from '@/components/WindCompass';
const SolunarDial = ({ weather, moon }: { weather: any; moon: any }) => {
  const [now, setNow] = useState(() => new Date());
  const [openMoon, setOpenMoon] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const parseTime = (s: string) => {
    if (!s || s === '--:--') return -1;
    const [h, m] = s.split(':').map(Number);
    return h * 60 + m;
  };
  const timeToDeg = (h: number, m: number) => ((h * 60 + m) / 1440) * 360;
  const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const sr = (startDeg * Math.PI) / 180;
    const er = (endDeg * Math.PI) / 180;
    const x1 = cx + r * Math.sin(sr);
    const y1 = cy - r * Math.cos(sr);
    const x2 = cx + r * Math.sin(er);
    const y2 = cy - r * Math.cos(er);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2}`;
  };

  const peaks = [...(weather.solunarPeaks || [])].sort(
    (a: any, b: any) => parseTime(a.start) - parseTime(b.start)
  );
  const currentMin = now.getHours() * 60 + now.getMinutes();

  let active: any = null;
  for (const p of peaks) {
    const s = parseTime(p.start), e = parseTime(p.end);
    if (s < 0 || e < 0) continue;
    if (currentMin >= s && currentMin <= e) {
      active = { ...p, remaining: e - currentMin };
      break;
    }
  }
  let next: any = null;
  if (!active) {
    for (const p of peaks) {
      const s = parseTime(p.start);
      if (s > currentMin) { next = { ...p, diff: s - currentMin }; break; }
    }
  }

  const verdict = active ? 'Активен прозорец' : (next && next.diff <= 60 ? 'Следващ пик скоро' : 'Стабилни условия');
  const verdictColor = active ? '#C8E63C' : (next && next.diff <= 60 ? '#C8E63C' : '#7F93A8');
  const subtitle = active
    ? `Още ${active.remaining}м`
    : next
      ? `След ${next.diff < 60 ? next.diff + 'м' : Math.floor(next.diff / 60) + 'ч ' + (next.diff % 60) + 'м'}`
      : '';

  const handDeg = timeToDeg(now.getHours(), now.getMinutes());
  const handRad = (handDeg * Math.PI) / 180;
  const handX2 = 105 + 64 * Math.sin(handRad);
  const handY2 = 105 - 64 * Math.cos(handRad);
  const moonTipX = 105 + 68 * Math.sin(handRad);
  const moonTipY = 105 - 68 * Math.cos(handRad);

  const fullMoonName = (month: number) => {
    const names: Record<number, string> = {
      1: 'Вълча', 2: 'Снежна', 3: 'Червена', 4: 'Розова', 5: 'Цветна', 6: 'Ягодова',
      7: 'Еленска', 8: 'Осетрова', 9: 'Жътварска', 10: 'Ловна', 11: 'Боброва', 12: 'Студена'
    };
    return `${names[month]} луна`;
  };
  const monthNamesBg = ['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'];
  const currentMonth = now.getMonth();
  const monthNameBg = monthNamesBg[currentMonth];
  const year = now.getFullYear();
  const fmName = fullMoonName(currentMonth + 1);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const nowHHMM = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const ticks = [];
  for (let h = 0; h < 24; h++) {
    const deg = (h / 24) * 360;
    const rad = (deg * Math.PI) / 180;
    const isMajor = h % 6 === 0;
    const rOuter = 93;
    const rInner = isMajor ? 83 : 90;
    const x1 = 105 + rOuter * Math.sin(rad);
    const y1 = 105 - rOuter * Math.cos(rad);
    const x2 = 105 + rInner * Math.sin(rad);
    const y2 = 105 - rInner * Math.cos(rad);
    ticks.push(
      <line key={h} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={isMajor ? 'rgba(134,147,147,0.4)' : 'rgba(134,147,147,0.12)'}
        strokeWidth="1" />
    );
  }


  return (
    <section style={{
      background: 'rgba(255,255,255,0.03)',
      border: '0.5px solid rgba(46,181,183,0.25)',
      borderRadius: '20px',
      padding: '16px',
      marginBottom: '10px',
    }}>
      <div className="font-display text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#869393' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
        Солунарна активност
      </div>

      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '17px', fontWeight: 600, color: verdictColor, lineHeight: 1.2 }}>{verdict}</div>
        {subtitle && (
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#a8b4b4', marginTop: '2px' }}>{subtitle}</div>
        )}
      </div>

      <div style={{ position: 'relative', width: '210px', height: '210px', margin: '0 auto' }}>
        <svg width="210" height="210" viewBox="-15 -28 240 253" overflow="visible">
          <circle cx="105" cy="105" r="88" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <circle cx="105" cy="105" r="78" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

          {/* Day/Night semicircles - ден долу (06-18), нощ горе (18-06) */}
          <path d="M 17,105 A 88,88 0 0,0 193,105" fill="rgba(235,140,89,0.05)" />
          <path d="M 17,105 A 88,88 0 0,1 193,105" fill="rgba(46,181,183,0.03)" />
          {/* Sun icon at 12 (долу) */}
          <g transform="translate(98.5,163)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" x="0" y="0">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          </g>
          {/* Moon icon at 00 (горе) */}
          <g transform="translate(98.5,38)">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" x="0" y="0">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </g>

          {peaks.map((p: any, i: number) => {
            const s = parseTime(p.start), e = parseTime(p.end);
            if (s < 0 || e < 0 || p.type === 'major' || p.label?.includes('Период на активност')) return null;
            const sd = (s / 1440) * 360, ed = (e / 1440) * 360;
            return <path key={`mn${i}`} d={arcPath(105, 105, 78, sd, ed)} fill="none" stroke="#2eb5b7" strokeWidth="3" strokeLinecap="round" opacity="0.6" />;
          })}
          {peaks.map((p: any, i: number) => {
            const s = parseTime(p.start), e = parseTime(p.end);
            if (s < 0 || e < 0 || p.type !== 'major') return null;
            const sd = (s / 1440) * 360, ed = (e / 1440) * 360;
            return (
              <path 
                key={`mj${i}`} 
                d={arcPath(105, 105, 88, sd, ed)} 
                fill="none" 
                stroke="#C8E63C" 
                strokeWidth="6" 
                strokeLinecap="round" 
                opacity="0.85"
                style={{ filter: 'drop-shadow(0 0 4px rgba(200,230,60,0.8)) drop-shadow(0 0 8px rgba(200,230,60,0.4))' }}
              />
            );
          })}
          {(() => {
            const majorPositions: { bx: number; by: number }[] = [];
            return peaks.map((p: any, i: number) => {
              const s = parseTime(p.start), e = parseTime(p.end);
              if (s < 0 || e < 0) return null;
              const sd = (s / 1440) * 360;
              let ed = (e / 1440) * 360;
              if (ed < sd) ed += 360; // wrap-around през полунощ
              const midDeg = ((sd + ed) / 2) % 360;
              const isMajor = p.type === 'major';
              if (isMajor) {
                let bx = 105 + 118 * Math.sin((midDeg * Math.PI) / 180);
                let by = 105 - 118 * Math.cos((midDeg * Math.PI) / 180);
                for (const pos of majorPositions) {
                  const dx = bx - pos.bx, dy = by - pos.by;
                  if (Math.sqrt(dx * dx + dy * dy) < 25) by += 18;
                }
                if (by - 7 < -21) by = -14;
                majorPositions.push({ bx, by });
                const label = p.label?.includes('зенит') ? '🌙 ЗЕНИТ' : '🌙 НАДИР';
                return (
                  <g key={`pb${i}`}>
                    <rect x={bx - 26} y={by - 7} width="52" height="14" rx="7" fill="rgba(200,230,60,0.12)" stroke="#C8E63C" strokeWidth="0.5" />
                    <text x={bx} y={by} textAnchor="middle" dominantBaseline="middle" fontSize="6.5" fontWeight="600" letterSpacing="0.04em" fill="#C8E63C">{label}</text>
                  </g>
                );
              }
              if (p.label?.includes('Период на активност')) return null;
              const bx = 105 + 118 * Math.sin((midDeg * Math.PI) / 180);
              const by = 105 - 118 * Math.cos((midDeg * Math.PI) / 180);
              const isRise = p.label?.includes('Изгрев');
              const arrowD = isRise ? "M0 5V-3M-3 1l3-4 3 4" : "M0 -3v8M-3 1l3 4 3-4";
              return (
                <g key={`pb${i}`} transform={`translate(${bx},${by})`}>
                  <path d={arrowD} stroke="#2eb5b7" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  <g transform="translate(0,13)">
                    <circle cx="0" cy="0" r="4" fill="#2eb5b7" />
                    <circle cx="1.5" cy="0" r="3" fill="#0B0F1A" />
                  </g>
                </g>
              );
            });
          })()}

          {/* Sunrise arrow — citron, sun icon */}
          {(() => {
            const srMin = parseTime(weather.sunrise);
            if (srMin < 0) return null;
            const srDeg = (srMin / 1440) * 360;
            const bx = 105 + 118 * Math.sin((srDeg * Math.PI) / 180);
            const by = 105 - 118 * Math.cos((srDeg * Math.PI) / 180);
            return (
              <g transform={`translate(${bx},${by})`}>
                <path d="M0 5V-3M-3 1l3-4 3 4" stroke="#C8E63C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <g transform="translate(0,13)">
                  <circle cx="0" cy="0" r="3" stroke="#C8E63C" strokeWidth="0.8" fill="none" />
                  <path d="M0 -5v-2M0 5v2M-5 0h-2M5 0h2M-3.5 -3.5l-1.4-1.4M3.5 3.5l1.4 1.4M3.5 -3.5l1.4-1.4M-3.5 3.5l-1.4 1.4" stroke="#C8E63C" strokeWidth="0.6" strokeLinecap="round" />
                </g>
              </g>
            );
          })()}
          {/* Sunset arrow — citron, sun icon */}
          {(() => {
            const ssMin = parseTime(weather.sunset);
            if (ssMin < 0) return null;
            const ssDeg = (ssMin / 1440) * 360;
            const bx = 105 + 118 * Math.sin((ssDeg * Math.PI) / 180);
            const by = 105 - 118 * Math.cos((ssDeg * Math.PI) / 180);
            return (
              <g transform={`translate(${bx},${by})`}>
                <path d="M0 -3v8M-3 1l3 4 3-4" stroke="#C8E63C" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                <g transform="translate(0,-13)">
                  <circle cx="0" cy="0" r="3" stroke="#C8E63C" strokeWidth="0.8" fill="none" />
                  <path d="M0 -5v-2M0 5v2M-5 0h-2M5 0h2M-3.5 -3.5l-1.4-1.4M3.5 3.5l1.4 1.4M3.5 -3.5l1.4-1.4M-3.5 3.5l-1.4 1.4" stroke="#C8E63C" strokeWidth="0.6" strokeLinecap="round" />
                </g>
              </g>
            );
          })()}

          {ticks}

          <text x="105" y="10" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="rgba(134,147,147,0.55)" fontFamily="monospace">00</text>
          <text x="203" y="109" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="rgba(134,147,147,0.55)" fontFamily="monospace">06</text>
          <text x="105" y="206" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="rgba(134,147,147,0.55)" fontFamily="monospace">12</text>
          <text x="7" y="109" textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="rgba(134,147,147,0.55)" fontFamily="monospace">18</text>

          <line x1="105" y1="105" x2={handX2} y2={handY2} stroke="rgba(222,228,227,0.7)" strokeWidth="1" strokeLinecap="round" />
          <text x={moonTipX} y={moonTipY} textAnchor="middle" dominantBaseline="middle" fontSize="12">{moon.emoji}</text>

          <circle cx="105" cy="105" r="3" fill="#2eb5b7" />
          <circle cx="105" cy="105" r="1.5" fill="#0B0F1A" />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '100px',
          textAlign: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: 'monospace', fontSize: '26px', color: '#dee4e3', lineHeight: 1 }}>{nowHHMM}</div>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        borderTop: '0.5px solid rgba(255,255,255,0.05)',
        paddingTop: '10px',
        marginTop: '10px',
      }}>
        <div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px' }}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
            <span style={{ fontSize: '9px', color: '#a8b4b4' }}>ИЗГРЕВ</span>
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#fff', lineHeight: 1 }}>{weather.sunrise}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '9px', color: '#a8b4b4' }}>ЗАЛЕЗ</span>
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#fff', lineHeight: 1 }}>{weather.sunset}</span>
          </div>
        </div>
        <div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2eb5b7" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '6px', opacity: 1 }}>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
            <span style={{ fontSize: '9px', color: '#a8b4b4' }}>ИЗГРЕВ</span>
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#fff', lineHeight: 1 }}>{weather.moonrise}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: '9px', color: '#a8b4b4' }}>ЗАЛЕЗ</span>
            <span style={{ fontSize: '13px', fontWeight: 400, color: '#fff', lineHeight: 1 }}>{weather.moonset}</span>
          </div>
        </div>
      </div>

      {moon.illumination > 70 && (
        <>
          <div
            onClick={() => setOpenMoon(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '9px 12px',
              background: 'rgba(46,181,183,0.05)',
              border: '0.5px solid rgba(46,181,183,0.18)',
              borderRadius: '10px',
              cursor: 'pointer',
              marginTop: '10px',
            }}
          >
            <span style={{ fontSize: '18px' }}>{moon.emoji}</span>
            <span style={{ flex: 1, fontSize: '12px', color: 'rgba(222,228,227,0.85)' }}>
              {fmName} · {monthNameBg} {year}
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a8b4b4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ transform: openMoon ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
          {openMoon && (
            <div style={{
              fontSize: '12px',
              color: 'rgba(222,228,227,0.65)',
              lineHeight: 1.65,
              padding: '10px',
              borderRadius: '10px',
              border: '0.5px solid rgba(255,255,255,0.06)',
              marginTop: '6px',
            }}>
              <div style={{ marginBottom: '8px' }}>
                {moon.emoji} <strong>Защо „{fmName}"?</strong> Народното название идва от древни наблюдения на природата през този месец. Всяко пълнолуние носи името на сезонното явление, което го характеризира. Имената са запазени от поколения наблюдатели на луната.
              </div>
              <div style={{ marginBottom: '8px' }}>
                🎣 <strong>За риболова:</strong> Пълнолунието активира нощното хранене на хищниците. Часовете след залез са особено продуктивни.
              </div>
              <div>
                ⚠️ <strong>Внимавай:</strong> При пълнолуние денем рибата може да е по-пасивна. Разчитай на солунарните пикове.
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};


const Index = () => {
  const moon = useMemo(() => getMoonData(), []);
  const { weather, loading, error, locationDenied } = useWeather();
  const alertLevel: 'none' | 'yellow' | 'orange' | 'red' = weather?.meteoAlarmLevel ?? 'none';
  const [terrain, setTerrain] = useState<'river' | 'lake'>('lake');

  const today = new Date().toLocaleDateString('bg-BG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).replace(/\s*г\.?\s*$/i, '');

  const currentHour = new Date().getHours();
  const timePeriod = getTimePeriod(currentHour);
  const now = new Date();
  const fishingScore = useMemo(
    () =>
      calculateFishingScore({
        moonScore: moon.fishingScore,
        moonIllumination: moon.illumination,
        temperature: weather?.temperature ?? 15,
        windSpeed: weather?.windSpeed ?? 10,
        weatherCode: weather?.weatherCode ?? 1,
        pressureTrend: weather?.pressureTrend ?? 'stable',
        pressureChangeRate: weather?.pressureChangeRate ?? 0,
        altitude: weather?.altitude ?? 0,
        month: now.getMonth() + 1,
        hour: now.getHours(),
      }),
    [moon, weather],
  );

  // Detect if currently inside a solunar peak
  const solunarContext = useMemo(() => {
    if (!weather?.solunarPeaks) return { isInPeak: false, peakType: null as 'major' | 'minor' | null };
    const now = new Date();
    const currentMin = now.getHours() * 60 + now.getMinutes();
    for (const peak of weather.solunarPeaks) {
      const [sh, sm] = (peak.start || '').split(':').map(Number);
      const [eh, em] = (peak.end || '').split(':').map(Number);
      if (isNaN(sh) || isNaN(eh)) continue;
      const s = sh * 60 + sm;
      const e = eh * 60 + em;
      const inRange = s <= e ? (currentMin >= s && currentMin <= e) : (currentMin >= s || currentMin <= e);
      if (inRange) return { isInPeak: true, peakType: peak.type as 'major' | 'minor' };
    }
    return { isInPeak: false, peakType: null as 'major' | 'minor' | null };
  }, [weather]);

  const stripEmojis = (text: string) => {
    return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const tips = useMemo(() => {
    if (!weather) return null;
    const rawTips = getSmartFishingTips(moon, weather.temperature, weather.windSpeed, weather.weatherCode, {
      terrain,
      pressureTrend: weather.pressureTrend,
      waterTemp: weather.waterTemp,
      sunrise: weather.sunrise,
      sunset: weather.sunset,
      timePeriod,
      isInPeak: solunarContext.isInPeak,
      peakType: solunarContext.peakType,
    });

    return {
      ...rawTips,
      weatherTip: stripEmojis(rawTips.weatherTip),
      windTip: stripEmojis(rawTips.windTip),
      timingTip: stripEmojis(rawTips.timingTip),
      fishingStyleTip: stripEmojis(rawTips.fishingStyleTip),
    };
  }, [moon, weather, terrain, timePeriod, solunarContext]);

  const swimAnimations = ['fish-swim-1', 'fish-swim-2', 'fish-swim-3'];
  const iconSequence = [PerchIcon, CarpIcon, PikeIcon, BreamIcon, CatfishIcon];
  
  const fishIcons = Array.from({ length: Math.max(0, Math.min(5, Math.round(fishingScore.score))) }, (_, i) => {
    const Icon = iconSequence[i % iconSequence.length];
    return (
      <div
        key={i}
        className="drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]"
        style={{ animation: `${swimAnimations[i % 3]} ${7 + i * 1.2}s ease-in-out infinite` }}
      >
        <Icon size={24} className="text-primary" strokeWidth={2} />
      </div>
    );
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-b from-ocean/40 via-background to-background pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,hsl(190_70%_20%/0.3)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative z-10 max-w-md mx-auto px-3 pb-6">
        {/* Header */}
        <header className="pt-3 pb-0.5 text-center">
          <img src="/ribo-logo.svg" alt="РИБО" className="h-20 w-auto mx-auto block logo-breathing" />


          <p className="text-sm mt-1 capitalize" style={{ color: '#94A3B8' }}>{today}</p>
          <div className="flex items-center justify-center gap-1 mt-1 text-xs" style={{ color: '#94A3B8' }}>
            {loading ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Определяне на локация...</span>
              </>
            ) : weather ? (
              <span className="inline-flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                </svg>
                <span>{weather.locationName}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" />
                </svg>
                <span>София</span>
              </span>
            )}
          </div>
        </header>

        {/* Moon Phase Hero */}
        <section className="flex flex-col items-center mt-2 mb-3">
          <div
            className="text-8xl leading-none select-none"
            style={{
              animation: 'pulse-glow 4s ease-in-out infinite, moon-drift 10s ease-in-out infinite',
              borderRadius: '50%',
              filter: 'drop-shadow(0 0 20px hsl(180 80% 55% / 0.4))',
            }}
          >
            {moon.emoji}
          </div>
          <h2 className="font-display text-xl font-semibold mt-2" style={{ color: '#E2E8F0' }}>
            {moon.phaseNameBg}
          </h2>
          <p className="text-sm font-medium mt-1" style={{ color: '#2eb5b7' }}>
            {moon.illumination}% Осветеност
          </p>
        </section>

        {/* DECISION BANNER — Level 1 action */}
        {(() => {
          const score = fishingScore.score;
          const inPeak = solunarContext.isInPeak;
          let glow = false;
          let color = fishingScore.color;
          if (fishingScore.isOverride) {
            color = '#FF8C42';
          } else if (inPeak || score >= 4) {
            glow = true;
            color = '#2eb5b7';
          }

          const windSpeed = weather?.windSpeed ?? 0;
          const pressureTrend = weather?.pressureTrend ?? 'stable';
          const weatherCode = weather?.weatherCode ?? 1;
          const temperature = weather?.temperature ?? 15;
          const hour = currentHour;

          const getScoreReason = (): string => {
            if (fishingScore.isOverride) return stripEmojis(fishingScore.overrideReason || 'Опасни условия');
            if (windSpeed > 25) return 'Силен вятър намалява активността';
            if (fishingScore.score >= 5) return 'Отличен ден — всички фактори са благоприятни';
            if (solunarContext.isInPeak) return 'Солунарен пик сега — оптимален момент';
            if (pressureTrend === 'falling') return 'Падащо налягане — рибата е пасивна';
            if (temperature > 26 && hour >= 10 && hour <= 16) return 'Горещо — търси сенчести участъци';
            if (fishingScore.score <= 2) return 'Слаба лунна фаза — рибата е пасивна';
            if (fishingScore.score === 3) return 'Лунната фаза ограничава активността';
            if (fishingScore.score === 4) return 'Добри условия — луната подпомага';
            return 'Средни условия за риболов';
          };

          return (
            <section
              className="rounded-2xl backdrop-blur-md p-5 mb-2"
              style={{
                background: glow
                  ? 'linear-gradient(135deg, rgba(46,181,183,0.08), rgba(46,181,183,0.02))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${glow ? 'rgba(46,181,183,0.35)' : 'rgba(255,255,255,0.06)'}`,
                boxShadow: glow ? '0 0 32px rgba(46,181,183,0.25)' : 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {fishIcons.map((icon, i) => (
                    <div key={i} className="w-9 h-9 flex items-center justify-center">{icon}</div>
                  ))}
                  {score === 5 && (
                    <div
                      key="bonus"
                      className="w-9 h-9 flex items-center justify-center"
                      style={{
                        color: '#C8E63C',
                        animation: 'pulse 2s ease-in-out infinite',
                      }}
                    >
                      <PerchIcon size={24} strokeWidth={2} />
                    </div>
                  )}
                </div>
                <div className="text-lg font-bold" style={{ color }}>
                  {fishingScore.label}
                </div>
              </div>
              <p className="text-sm mt-3 leading-relaxed" style={{ color: 'rgba(234,247,255,0.65)' }}>
                {getScoreReason()}
              </p>
            </section>
          );
        })()}

        {/* УСЛОВИЯ ДНЕС — Premium redesign */}
        {tips && (
          <section
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '0.5px solid rgba(255,255,255,0.07)',
              borderRadius: '20px',
              padding: '16px',
              marginBottom: '10px',
            }}
          >
            <div className="font-display text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: '#869393', marginBottom: '14px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h20M2 6h20M2 18h20"/></svg>
              Условия днес
            </div>

            {fishingScore.isOverride && fishingScore.overrideReason && (
              <div style={{
                background: 'rgba(147,0,10,0.15)',
                border: '1px solid rgba(255,180,171,0.25)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '12px',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#ffb4ab" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/><path d="M12 17h.01"/>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em',
                    textTransform: 'uppercase', color: '#ffb4ab', marginBottom: '4px' }}>
                    Внимание
                  </div>
                  <div style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(255,180,171,0.9)' }}>
                    {stripEmojis(fishingScore.overrideReason)}
                  </div>
                </div>
              </div>
            )}

            {/* РЕД 1 — Времето */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start',
              paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
              <div style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#5cd8da" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'rgba(222,228,227,0.85)' }}>
                {tips.weatherTip}
              </div>
            </div>

            {/* РЕД 2 — Вятър */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start',
              paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
              <div style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#5cd8da" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/>
                  <path d="M9.6 4.6A2 2 0 1 1 11 8H2"/>
                  <path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: 'rgba(222,228,227,0.85)' }}>
                {tips.windTip}
              </div>
            </div>

            {/* РЕД 3 — Стил на риболов */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start',
              paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
              <div style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="#5cd8da" strokeWidth="1" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div style={{ fontSize: '14px', lineHeight: 1.55, color: '#5cd8da' }}>
                {tips.fishingStyleTip}
              </div>
            </div>

            {/* РЕД 4 — Светлина */}
            {(() => {
              const hour = new Date().getHours();
              const isCloudy = weather.weatherCode >= 2;
              const isNight = hour < 5 || hour >= 21;
              const isDawn = (hour >= 5 && hour < 7) || (hour >= 19 && hour < 21);

              let lightLabel = 'Добра';
              let lightDetail = 'Нормална видимост.';

              if (isNight) {
                lightLabel = moon.illumination > 60 ? 'Лунна' : 'Тъмна';
                lightDetail = moon.illumination > 60
                  ? 'Ярка луна — хищниците търсят сенките.'
                  : 'Тъмна нощ — хищниците ловуват смело.';
              } else if (isDawn) {
                lightLabel = 'Здрач';
                lightDetail = 'Преходна светлина — рибата е активна.';
              } else if (isCloudy) {
                lightLabel = 'Ниска';
                lightDetail = 'Облачно — рибата излиза от укрития.';
              }

              return (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center',
                  paddingTop: '12px', paddingBottom: '12px', borderBottom: '1px solid #252b2b' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#5cd8da" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="4"/>
                      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(222,228,227,0.75)' }}>Светлина</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                        fontWeight: 500, color: '#C8E63C' }}>
                        {lightLabel}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a8b4b4', textAlign: 'right', maxWidth: '150px' }}>
                        {lightDetail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* РЕД 5 — Търси рибата */}
            {(() => {
              const hour = new Date().getHours();
              const isHot = weather.temperature > 24;
              const isCold = weather.temperature < 8;
              const isActive = (hour >= 5 && hour < 10) || (hour >= 17 && hour < 21);

              let zoneLabel = 'Средна';
              let zoneDetail = terrain === 'river'
                ? 'Търси бавни участъци и ями.'
                : 'Средни дълбочини и край на водоема.';

              if (isCold) {
                zoneLabel = 'Дъното';
                zoneDetail = 'Студено — рибата търси топлите слоеве.';
              } else if (isHot && !isActive) {
                zoneLabel = 'Дъното';
                zoneDetail = 'Горещо — рибата е в хладните дълбини.';
              } else if (isActive) {
                zoneLabel = 'Повърхност';
                zoneDetail = terrain === 'river'
                  ? 'Активна зона край брега и вливащи се притоци.'
                  : 'Плитчините при изгрев и залез.';
              }

              return (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingTop: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="#5cd8da" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 8h20M2 12h20M2 16h20" opacity="0.35"/>
                      <circle cx="12" cy="14" r="2" fill="rgba(92,216,218,0.25)" stroke="#5cd8da" strokeWidth="1"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '14px', color: 'rgba(222,228,227,0.75)' }}>Търси рибата</div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px',
                        fontWeight: 500, color: '#C8E63C' }}>
                        {zoneLabel}
                      </div>
                      <div style={{ fontSize: '11px', color: '#a8b4b4', textAlign: 'right', maxWidth: '150px' }}>
                        {zoneDetail}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        )}

        {/* Weather Widget — Bento Grid */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.03] backdrop-blur-md p-3 mb-2">
          <h3 className="font-display text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: '#869393' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" /><path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" /><path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
            </svg>
            Условия
          </h3>
          {/* Interpretation lead — Level 2 */}
          {weather && (() => {
            const trend = weather.pressureTrend;
            const wind = weather.windSpeed;
            let title = 'Стабилно налягане';
            let effect = 'Рибата е спокойна — работи бавна презентация';
            let dot = '#7F93A8';
            if (trend === 'rising') {
              title = 'Покачващо налягане';
              effect = 'По-активна риба — увеличи темпото';
              dot = '#2eb5b7';
            } else if (trend === 'falling') {
              title = 'Падащо налягане';
              effect = 'Очаквай агресивни удари преди фронта';
              dot = '#C8E63C';
            }
            if (wind > 25) {
              title = 'Силен вятър';
              effect = 'Лови по подветрения бряг — мътна вода';
              dot = '#FF8C42';
            }
            return (
              <div className="mb-2 flex items-start gap-2">
                <span className="mt-1 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot, boxShadow: `0 0 6px ${dot}` }} />
                <div className="min-w-0">
                  <div className="text-[12px] font-medium leading-tight" style={{ color: '#EAF7FF' }}>{title}</div>
                  <div className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(127,147,168,0.95)' }}>→ {effect}</div>
                </div>
              </div>
            );
          })()}
          {loading && !weather ? (
            <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Зареждане на времето...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {/* TEMP */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <ThermometerSun strokeWidth={1} className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? `${weather.temperature}°` : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">ТЕМП.</div>
              </div>
              {/* WIND */}
             <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 flex items-center justify-center">
                {weather
                  ? <WindCompass degrees={weather.windDirection} speedKmh={weather.windSpeed} />
                  : <div className="text-sm font-bold text-white">—</div>
                }
              </div>
              {/* PRESSURE w/ sparkline */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Gauge strokeWidth={1} className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                {weather && weather.pressureHistory.length > 1 ? (() => {
                  const values = weather.pressureHistory.map(h => h.value);
                  const min = Math.min(...values);
                  const max = Math.max(...values);
                  const range = max - min || 1;
                  const w = 40, h = 8;
                  const d = values.map((v, i) => {
                    const x = (i / (values.length - 1)) * w;
                    const y = h - ((v - min) / range) * h;
                    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                  }).join(' ');
                  return (
                    <svg viewBox="0 0 40 8" className="w-full h-2 mb-0.5">
                      <path d={d} fill="none" stroke="#C8E63C" strokeWidth="1" />
                    </svg>
                  );
                })() : <div className="h-2 mb-0.5" />}
                <div className="text-xs font-bold leading-none text-white">{weather ? weather.pressure : '—'}</div>
                <div className="text-[7px] mt-0.5" style={{ color: '#C8E63C' }}>
                  {weather ? (weather.pressureTrend === 'rising' ? '↗ хПа' : weather.pressureTrend === 'falling' ? '↘ хПа' : '→ хПа') : 'хПа'}
                </div>
              </div>
              {/* HUMIDITY */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Droplets strokeWidth={1} className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? `${weather.humidity}%` : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">ВЛАГА</div>
              </div>
              {/* ALTITUDE */}
              <div className="rounded-lg bg-white/[0.03] border border-white/5 p-1.5 text-center">
                <Mountain strokeWidth={1} className="w-4 h-4 mx-auto mb-0.5" style={{ color: '#2eb5b7' }} />
                <div className="text-sm font-bold leading-none text-white">{weather ? Math.round(weather.altitude) : '—'}</div>
                <div className="text-[7px] mt-0.5 opacity-50">М. Н.В.</div>
              </div>
              {/* WEATHER ICON */}
              <div
                className="rounded-lg bg-white/[0.03] p-1.5 text-center flex flex-col justify-center"
                style={alertLevel === 'none' ? {
                  border: '0.5px solid rgba(255,255,255,0.07)'
                } : alertLevel === 'yellow' ? {
                  border: '0.5px solid rgba(200,230,60,0.6)',
                  animation: 'pulse-alert-yellow 2.5s ease-in-out infinite'
                } : alertLevel === 'orange' ? {
                  border: '0.5px solid rgba(255,140,66,0.6)',
                  animation: 'pulse-alert-orange 2.5s ease-in-out infinite'
                } : {
                  border: '0.5px solid rgba(220,60,60,0.6)',
                  animation: 'pulse-alert-red 2s ease-in-out infinite'
                }}
              >
                <span className="text-xl leading-none">{weather ? weather.weatherIcon : '—'}</span>
                <div className="text-[8px] mt-1 opacity-50 leading-tight whitespace-nowrap overflow-hidden text-ellipsis" title={weather?.weatherLabel}>
                  {weather?.weatherLabel ?? '...'}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Solunar Activity Section */}
        {weather && weather.solunarPeaks ? (
          <SolunarDial weather={weather} moon={moon} />
        ) : (
          <section style={{
            background: 'rgba(255,255,255,0.03)',
            border: '0.5px solid rgba(46,181,183,0.25)',
            borderRadius: '20px',
            padding: '16px',
            marginBottom: '10px',
          }}>
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Зареждане...
              </span>
            </div>
          </section>
        )}

        {/* Multi-day Forecast */}
        <ForecastCards weather={weather} />

        {/* Fish Guide */}
        <FishGuide
          moon={moon}
          weather={weather}
          terrain={terrain}
          onTerrainChange={setTerrain}
          solunarContext={solunarContext}
        />

        <footer className="text-center mt-4 space-y-0.5">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.8)' }}>Наслука!</p>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'РИБО риболовен гид', text: 'Кълве ли днес? Провери луната, времето и налягането!', url: 'https://lunar-fish.vercel.app' });
              } else {
                navigator.clipboard.writeText('https://lunar-fish.vercel.app');
              }
            }}
            style={{ marginTop: '8px', width: '32px', height: '32px', borderRadius: '50%', border: '0.5px solid rgba(46,181,183,0.4)', background: 'rgba(46,181,183,0.06)', color: '#2eb5b7', fontSize: '14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            title="Сподели РИБО"
          >↗</button>
          {weather && (
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
              Данните са базирани на текущата ви локация • <span className="text-white">Open-Meteo API</span>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Index;
