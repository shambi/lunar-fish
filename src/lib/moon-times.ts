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
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m >= 60 ? 59 : m).padStart(2, '0')}`;
}

function clampHour(h: number): number {
  return ((h % 24) + 24) % 24;
}

export function getMoonTimes(date: Date, latitude: number, longitude: number): MoonTimes {
  // Scan each hour of the day for altitude sign changes
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const baseDate = new Date(Date.UTC(year, month, day, 0, 0, 0));
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
    if (a1 <= 0 && a2 > 0 && !moonrise) {
      const frac = -a1 / (a2 - a1);
      moonrise = fmtTime(h + frac);
    }
    if (a1 >= 0 && a2 < 0 && !moonset) {
      const frac = a1 / (a1 - a2);
      moonset = fmtTime(h + frac);
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

  // Refine transit by checking finer resolution around peak
  if (transitHour !== null) {
    let bestH = transitHour;
    let bestAlt = -999;
    for (let offset = -1; offset <= 1; offset += 0.1) {
      const testH = transitHour + offset;
      if (testH < 0 || testH > 24) continue;
      const alt = moonAltitude(baseJD + testH / 24, latitude, longitude);
      if (alt > bestAlt) { bestAlt = alt; bestH = testH; }
    }
    transitHour = bestH;
  }

  if (antitransitHour !== null) {
    let bestH = antitransitHour;
    let bestAlt = 999;
    for (let offset = -1; offset <= 1; offset += 0.1) {
      const testH = antitransitHour + offset;
      if (testH < 0 || testH > 24) continue;
      const alt = moonAltitude(baseJD + testH / 24, latitude, longitude);
      if (alt < bestAlt) { bestAlt = alt; bestH = testH; }
    }
    antitransitHour = bestH;
  }

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

  // Major peaks: ±1h around moonrise and moonset
  addPeak('major', 'Изгрев на луната', moonTimes.moonrise, 1);
  addPeak('major', 'Залез на луната', moonTimes.moonset, 1);

  // Minor peaks: ±30min around transit and antitransit
  addPeak('minor', 'Луна в зенит', moonTimes.transit, 0.5);
  addPeak('minor', 'Луна в надир', moonTimes.antitransit, 0.5);

  // Sort by start time
  peaks.sort((a, b) => parseTime(a.start) - parseTime(b.start));

  return peaks;
}
