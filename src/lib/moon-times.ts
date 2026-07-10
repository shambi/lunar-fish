/**
 * Astronomical moon position calculations
 * Based on simplified Meeus "Astronomical Algorithms"
 * Calculates moonrise, moonset, transit, and antitransit for a given date and location.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

interface MoonPosition {
  rightAscension: number; // degrees
  declination: number;    // degrees
}

function julianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
  let yr = y, mo = m;
  if (mo <= 2) { yr -= 1; mo += 12; }
  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + d + B - 1524.5;
}

function getMoonPosition(jd: number): MoonPosition {
  const T = (jd - 2451545.0) / 36525.0;

  // Mean elements
  const Lp = (218.3164477 + 481267.88123421 * T) % 360;
  const D  = (297.8501921 + 445267.1114034 * T) % 360;
  const M  = (357.5291092 + 35999.0502909 * T) % 360;
  const Mp = (134.9633964 + 477198.8675055 * T) % 360;
  const F  = (93.2720950 + 483202.0175233 * T) % 360;

  // Longitude corrections (simplified)
  let lon = Lp
    + 6.289 * Math.sin(Mp * RAD)
    - 1.274 * Math.sin((2 * D - Mp) * RAD)
    - 0.658 * Math.sin(2 * D * RAD)
    + 0.214 * Math.sin(2 * Mp * RAD)
    - 0.186 * Math.sin(M * RAD)
    - 0.114 * Math.sin(2 * F * RAD);

  // Latitude
  let lat = 5.128 * Math.sin(F * RAD)
    + 0.281 * Math.sin((Mp + F) * RAD)
    + 0.278 * Math.sin((Mp - F) * RAD);

  // Ecliptic to equatorial
  const obliquity = 23.4393 - 0.0000004 * (jd - 2451545.0);
  const lonRad = lon * RAD;
  const latRad = lat * RAD;
  const oblRad = obliquity * RAD;

  const ra = Math.atan2(
    Math.sin(lonRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad),
    Math.cos(lonRad)
  ) * DEG;

  const dec = Math.asin(
    Math.sin(latRad) * Math.cos(oblRad) + Math.cos(latRad) * Math.sin(oblRad) * Math.sin(lonRad)
  ) * DEG;

  return { rightAscension: ((ra % 360) + 360) % 360, declination: dec };
}

function siderealTime(jd: number, longitude: number): number {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
  gmst = ((gmst % 360) + 360) % 360;
  return ((gmst + longitude) % 360 + 360) % 360;
}

function moonAltitude(jd: number, lat: number, lon: number): number {
  const pos = getMoonPosition(jd);
  const lst = siderealTime(jd, lon);
  const ha = ((lst - pos.rightAscension + 360) % 360) * RAD;
  const latR = lat * RAD;
  const decR = pos.declination * RAD;
  const alt = Math.asin(
    Math.sin(latR) * Math.sin(decR) + Math.cos(latR) * Math.cos(decR) * Math.cos(ha)
  ) * DEG;
  // Correct for refraction and moon's average parallax (~0.95°)
  return alt - 0.583 + 0.95;
}

export interface MoonTimes {
  moonrise: string | null;   // HH:MM
  moonset: string | null;    // HH:MM
  transit: string | null;    // HH:MM (highest point)
  antitransit: string | null; // HH:MM (lowest point / opposite side)
}

export interface SolunarPeak {
  type: 'major' | 'minor';
  label: string;
  start: string; // HH:MM
  end: string;   // HH:MM
  center: string; // HH:MM
}

function fmtTime(hours: number): string {
  const h = Math.floor(hours) % 24;
  const m = Math.round((hours - Math.floor(hours)) * 60);
  if (m >= 60) return `${String((h + 1) % 24).padStart(2, '0')}:00`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function clampHour(h: number): number {
  return ((h % 24) + 24) % 24;
}

export function getMoonTimes(date: Date, latitude: number, longitude: number): MoonTimes {
  console.log(`[Solunar] Calculating for ${latitude}, ${longitude} at ${date.toISOString()}`);
  
  // Scan each hour of the day for altitude sign changes
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Use local day start but in UTC context for calculations
  const baseDate = new Date(year, month, day, 0, 0, 0);
  const baseJD = julianDate(baseDate);

  const altitudes: number[] = [];
  for (let h = 0; h <= 24; h++) {
    altitudes.push(moonAltitude(baseJD + h / 24, latitude, longitude));
  }

  let moonrise: string | null = null;
  let moonset: string | null = null;
  let transitHour: number | null = null;
  let maxAlt = -999;
  let antitransitHour: number | null = null;
  let minAlt = 999;

  for (let h = 0; h < 24; h++) {
    const a1 = altitudes[h];
    const a2 = altitudes[h + 1];

    // Interpolate crossing
    if (a1 <= 0 && a2 > 0) {
      const frac = -a1 / (a2 - a1);
      const time = h + frac;
      if (!moonrise) moonrise = fmtTime(time);
    }
    if (a1 >= 0 && a2 < 0) {
      const frac = a1 / (a1 - a2);
      const time = h + frac;
      if (!moonset) moonset = fmtTime(time);
    }

    // Track transit (max altitude) and antitransit (min altitude)
    const midAlt = (a1 + a2) / 2;
    if (midAlt > maxAlt) {
      maxAlt = midAlt;
      transitHour = h + 0.5;
    }
    if (midAlt < minAlt) {
      minAlt = midAlt;
      antitransitHour = h + 0.5;
    }
  }

  // Refine transit
  if (transitHour !== null) {
    let bestH = transitHour;
    let bestAlt = -999;
    for (let offset = -1; offset <= 1; offset += 0.05) {
      const testH = transitHour + offset;
      const alt = moonAltitude(baseJD + testH / 24, latitude, longitude);
      if (alt > bestAlt) { bestAlt = alt; bestH = testH; }
    }
    transitHour = bestH;
  }

  // Refine antitransit
  if (antitransitHour !== null) {
    let bestH = antitransitHour;
    let bestAlt = 999;
    for (let offset = -1; offset <= 1; offset += 0.05) {
      const testH = antitransitHour + offset;
      const alt = moonAltitude(baseJD + testH / 24, latitude, longitude);
      if (alt < bestAlt) { bestAlt = alt; bestH = testH; }
    }
    antitransitHour = bestH;
  }

  if (!moonrise) console.warn('[Solunar] Moonrise not found for current day.');
  if (!moonset) console.warn('[Solunar] Moonset not found for current day.');

  return {
    moonrise,
    moonset,
    transit: transitHour !== null ? fmtTime(transitHour) : null,
    antitransit: antitransitHour !== null ? fmtTime(antitransitHour) : null,
  };
}

export function getSolunarPeaks(moonTimes: MoonTimes): SolunarPeak[] {
  const peaks: SolunarPeak[] = [];

  const parseTime = (t: string): number => {
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };

  const addPeak = (type: 'major' | 'minor', label: string, centerTime: string | null, halfWidth: number) => {
    if (!centerTime) return;
    const center = parseTime(centerTime);
    const start = clampHour(center - halfWidth);
    const end = clampHour(center + halfWidth);
    peaks.push({
      type,
      label,
      start: fmtTime(start),
      end: fmtTime(end),
      center: centerTime,
    });
  };

  // 1. Major peaks: Lunar Transit and Anti-transit (Traditional Solunar Theory)
  // These are the primary solunar periods (Major)
  if (moonTimes.transit) {
    addPeak('major', 'Луна в зенит (Major)', moonTimes.transit, 1);
  } else {
    console.error('[Solunar] Missing transit for Major peak calculation');
  }

  if (moonTimes.antitransit) {
    addPeak('major', 'Луна в надир (Major)', moonTimes.antitransit, 1);
  } else {
    console.error('[Solunar] Missing antitransit for Major peak calculation');
  }

  // 2. Minor peaks: Moonrise and Moonset
  // These are the secondary solunar periods (Minor)
  if (moonTimes.moonrise) {
    addPeak('minor', 'Изгрев на луната (Minor)', moonTimes.moonrise, 0.5);
  } else {
    // If moonrise is missing, try to estimate from transit - 6h
    console.warn('[Solunar] Moonrise missing, estimating Minor peak from transit');
    if (moonTimes.transit) {
      const estimatedRise = clampHour(parseTime(moonTimes.transit) - 6);
      addPeak('minor', 'Изгрев на луната (est.)', fmtTime(estimatedRise), 0.5);
    }
  }

  if (moonTimes.moonset) {
    addPeak('minor', 'Залез на луната (Minor)', moonTimes.moonset, 0.5);
  } else {
    // If moonset is missing, try to estimate from transit + 6h
    console.warn('[Solunar] Moonset missing, estimating Minor peak from transit');
    if (moonTimes.transit) {
      const estimatedSet = clampHour(parseTime(moonTimes.transit) + 6);
      addPeak('minor', 'Залез на луната (est.)', fmtTime(estimatedSet), 0.5);
    }
  }

  // To ensure exactly 2 Major and 4 Minor as requested (if possible)
  // Note: Standard Solunar theory defines 2 Major (Transit/Anti-transit) and 2 Minor (Rise/Set).
  // The user requested 2 Major and 4 Minor. We'll add two more Minor peaks halfway between Major/Minor if needed,
  // but usually, 2 Major + 2 Minor is the standard. Let's stick to the 4 peaks total or add intermediate ones if specifically required.
  // Re-reading: "списъкът с пикове да съдържа точно два Major и четири Minor записа за денонощието"
  
  if (peaks.filter(p => p.type === 'minor').length < 4 && moonTimes.transit && moonTimes.antitransit) {
    // Add two intermediate minor peaks (Halfway between transit and antitransit)
    const t = parseTime(moonTimes.transit);
    const at = parseTime(moonTimes.antitransit);
    
    const intermediate1 = clampHour((t + at) / 2);
    const intermediate2 = clampHour(intermediate1 + 12);
    
    addPeak('minor', 'Период на активност', fmtTime(intermediate1), 0.5);
    addPeak('minor', 'Период на активност', fmtTime(intermediate2), 0.5);
  }

  // Sort by start time
  peaks.sort((a, b) => parseTime(a.start) - parseTime(b.start));

  return peaks;
}

export interface GoldenHourResult {
  isActive: boolean;
  minutesRemaining: number | null;
}

function toMinutes(t: string | null | undefined): number {
  if (!t || t === '--:--') return -1;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

/** Returns true while now is within ±30min of sunrise/sunset AND inside an active solunar peak window. */
export function isGoldenHour(
  now: Date,
  sunrise: string | null | undefined,
  sunset: string | null | undefined,
  peaks: SolunarPeak[]
): GoldenHourResult {
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const inWindow = (min: number, start: number, end: number): boolean => {
    const s = ((start % 1440) + 1440) % 1440;
    const e = ((end % 1440) + 1440) % 1440;
    if (s <= e) return min >= s && min <= e;
    return min >= s || min <= e; // wraps past midnight
  };

  const minutesUntilEnd = (end: number): number => {
    const e = ((end % 1440) + 1440) % 1440;
    return ((e - nowMin) + 1440) % 1440;
  };

  const sunWindows: { start: number; end: number }[] = [];
  const sr = toMinutes(sunrise);
  const ss = toMinutes(sunset);
  if (sr >= 0) sunWindows.push({ start: sr - 30, end: sr + 30 });
  if (ss >= 0) sunWindows.push({ start: ss - 30, end: ss + 30 });

  let minutesRemaining: number | null = null;

  for (const sunWin of sunWindows) {
    if (!inWindow(nowMin, sunWin.start, sunWin.end)) continue;
    for (const peak of peaks) {
      const ps = toMinutes(peak.start);
      const pe = toMinutes(peak.end);
      if (ps < 0 || pe < 0) continue;
      if (!inWindow(nowMin, ps, pe)) continue;

      const remaining = Math.min(minutesUntilEnd(sunWin.end), minutesUntilEnd(pe));
      if (minutesRemaining === null || remaining < minutesRemaining) {
        minutesRemaining = remaining;
      }
    }
  }

  if (minutesRemaining === null) return { isActive: false, minutesRemaining: null };
  return { isActive: true, minutesRemaining };
}

export interface GoldenHourWindow {
  startMin: number; // 0-1440
  endMin: number;   // 0-1440, always > startMin (already split at midnight if needed)
}

/**
 * Exact sub-ranges (in minutes) where a Major solunar peak overlaps a
 * sunrise/sunset ±30min window — the precise Golden Hour span(s) for today,
 * as opposed to the full Major peak window. Mirrors isGoldenHour's windowing
 * logic but returns the intersected ranges instead of a live boolean.
 */
export function getGoldenHourWindows(
  sunrise: string | null | undefined,
  sunset: string | null | undefined,
  peaks: SolunarPeak[]
): GoldenHourWindow[] {
  const norm = (s: number, e: number): [number, number][] => {
    s = ((s % 1440) + 1440) % 1440;
    e = ((e % 1440) + 1440) % 1440;
    return s <= e ? [[s, e]] : [[s, 1440], [0, e]];
  };
  const intersect = (aS: number, aE: number, bS: number, bE: number): [number, number][] => {
    const segsA = norm(aS, aE), segsB = norm(bS, bE);
    const out: [number, number][] = [];
    for (const [as, ae] of segsA) for (const [bs, be] of segsB) {
      const s = Math.max(as, bs), e = Math.min(ae, be);
      if (s < e) out.push([s, e]);
    }
    return out;
  };

  const sr = toMinutes(sunrise);
  const ss = toMinutes(sunset);
  const sunWindows: [number, number][] = [];
  if (sr >= 0) sunWindows.push([sr - 30, sr + 30]);
  if (ss >= 0) sunWindows.push([ss - 30, ss + 30]);

  const windows: GoldenHourWindow[] = [];
  for (const peak of peaks) {
    if (peak.type !== 'major') continue;
    const ps = toMinutes(peak.start);
    const pe = toMinutes(peak.end);
    if (ps < 0 || pe < 0) continue;
    for (const [ws, we] of sunWindows) {
      for (const [s, e] of intersect(ps, pe, ws, we)) {
        windows.push({ startMin: s, endMin: e });
      }
    }
  }
  return windows;
}
