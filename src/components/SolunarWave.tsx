import { useId, useMemo } from 'react';

interface SolunarWavePeak {
  type: 'major' | 'minor';
  label: string;
  start: string;
  end: string;
  center: string;
}

interface SolunarWaveProps {
  peaks: SolunarWavePeak[];
  sunrise?: string | null;
  sunset?: string | null;
}

const parseTimeMin = (s?: string | null): number => {
  if (!s || s === '--:--') return -1;
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};

const VB_W = 280;
const VB_H = 88;
const PAD_X = 8;
const BASELINE_Y = 56;
const PEAK_Y = 16;
const CURVE_BOTTOM = 68;
const BASELINE_V = 0.12;

const xForMin = (min: number) => PAD_X + (min / 1440) * (VB_W - PAD_X * 2);
const yForValue = (v: number) => BASELINE_Y - v * (BASELINE_Y - PEAK_Y);

// Smooth Catmull-Rom spline through the given points, rendered as cubic beziers.
function catmullRomPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

function intervalsOverlapCircular(aS: number, aE: number, bS: number, bE: number): boolean {
  const norm = (s: number, e: number): [number, number][] => {
    s = ((s % 1440) + 1440) % 1440;
    e = ((e % 1440) + 1440) % 1440;
    return s <= e ? [[s, e]] : [[s, 1440], [0, e]];
  };
  const segsA = norm(aS, aE), segsB = norm(bS, bE);
  for (const [as, ae] of segsA) for (const [bs, be] of segsB) if (as < be && bs < ae) return true;
  return false;
}

export const SolunarWave = ({ peaks, sunrise, sunset }: SolunarWaveProps) => {
  const gradId = useId();
  const srMin = parseTimeMin(sunrise);
  const ssMin = parseTimeMin(sunset);

  const displayPeaks = useMemo(() => {
    return peaks
      .filter(p => p.type === 'major' || (p.type === 'minor' && !p.label?.includes('Период на активност')))
      .map(p => {
        const centerMin = parseTimeMin(p.center);
        const halfWidth = p.type === 'major' ? 60 : 30;
        return {
          ...p,
          centerMin,
          startMin: centerMin - halfWidth,
          endMin: centerMin + halfWidth,
          amplitude: p.type === 'major' ? 1 : 0.62,
        };
      })
      .filter(p => p.centerMin >= 0)
      .sort((a, b) => a.centerMin - b.centerMin);
  }, [peaks]);

  const curvePoints = useMemo(() => {
    // Knots sit only at peak centers and at the midpoints between them, so
    // consecutive knots are naturally hours apart — this is what gives the
    // Catmull-Rom spline its wide, rounded "hill" shape instead of a sharp
    // spike (which happens when a trough sits only ~30-60min from its peak).
    const knots: { t: number; v: number }[] = [{ t: 0, v: BASELINE_V }];
    let prevT = 0;
    for (const p of displayPeaks) {
      if (p.centerMin - prevT > 8) {
        knots.push({ t: (prevT + p.centerMin) / 2, v: BASELINE_V });
      }
      knots.push({ t: p.centerMin, v: p.amplitude });
      prevT = p.centerMin;
    }
    if (1440 - prevT > 8) {
      knots.push({ t: (prevT + 1440) / 2, v: BASELINE_V });
    }
    knots.push({ t: 1440, v: BASELINE_V });
    return knots.map(k => ({ x: xForMin(k.t), y: yForValue(k.v) }));
  }, [displayPeaks]);

  const pathD = catmullRomPath(curvePoints);

  const sunWindows = [
    srMin >= 0 ? { start: srMin - 30, end: srMin + 30, color: '#C8E63C', peakOpacity: 0.075, gradId: `${gradId}-sunrise` } : null,
    ssMin >= 0 ? { start: ssMin - 30, end: ssMin + 30, color: '#5cd8da', peakOpacity: 0.055, gradId: `${gradId}-sunset` } : null,
  ].filter(Boolean) as { start: number; end: number; color: string; peakOpacity: number; gradId: string }[];

  return (
    <div style={{
      marginTop: '10px',
      padding: '10px 10px 8px',
      borderRadius: '14px',
      border: '0.5px solid rgba(255,255,255,0.06)',
      background: 'rgba(255,255,255,0.02)',
    }}>
      <svg width="100%" height={VB_H} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" overflow="visible">
        <defs>
          {sunWindows.map((w, i) => (
            <linearGradient key={i} id={w.gradId} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={w.color} stopOpacity={0} />
              <stop offset="50%" stopColor={w.color} stopOpacity={w.peakOpacity} />
              <stop offset="100%" stopColor={w.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {sunWindows.map((w, i) => {
          const x1 = xForMin(Math.max(0, w.start));
          const x2 = xForMin(Math.min(1440, w.end));
          return (
            <rect
              key={i}
              x={Math.min(x1, x2)}
              y={0}
              width={Math.max(0, Math.abs(x2 - x1))}
              height={CURVE_BOTTOM}
              fill={`url(#${w.gradId})`}
            />
          );
        })}

        <path d={pathD} fill="none" stroke="#2eb5b7" strokeWidth="2.5" strokeLinecap="round" />

        {displayPeaks.map((p, i) => {
          const x = xForMin(p.centerMin);
          const y = yForValue(p.amplitude);
          const isGolden = sunWindows.some(w => intervalsOverlapCircular(p.startMin, p.endMin, w.start, w.end));
          return (
            <g key={i}>
              {isGolden && (
                <>
                  <line x1={x} y1={y} x2={x} y2={CURVE_BOTTOM} stroke="#C8E63C" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />
                  <svg x={x - 4.5} y={y - 16} width="9" height="9" viewBox="0 0 24 24" fill="#5cd8da" stroke="none">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  <svg x={x - 4.5} y={CURVE_BOTTOM + 2} width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#C8E63C" strokeWidth="1.6" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5" fill="#C8E63C" stroke="none" />
                    <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
                  </svg>
                </>
              )}
              <circle
                cx={x}
                cy={y}
                r="3"
                fill="#C8E63C"
                style={isGolden ? { animation: 'goldenPulse 1.8s ease-in-out infinite', transformOrigin: `${x}px ${y}px` } : undefined}
              />
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', padding: '0 2px' }}>
        <span style={{ fontSize: '8px', fontFamily: 'monospace', color: 'rgba(134,147,147,0.55)' }}>00:00</span>
        <span style={{ fontSize: '8px', fontFamily: 'monospace', color: 'rgba(134,147,147,0.55)' }}>12:00</span>
        <span style={{ fontSize: '8px', fontFamily: 'monospace', color: 'rgba(134,147,147,0.55)' }}>24:00</span>
      </div>
    </div>
  );
};
