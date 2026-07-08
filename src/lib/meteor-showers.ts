// Static table of the 8 major annual meteor showers — no external API. Dates are
// month/day only (year-agnostic); none of these wrap across the Dec 31 -> Jan 1
// boundary, but getActiveMeteorShower() handles that case anyway for correctness.
//
// getActiveMeteorShower() only matches the PEAK window (typically 2 days), not
// the full multi-week activity range — the badge/streak effect is meant to flag
// "best night to look up", not the entire period the shower is technically active.
// rangeStart/rangeEnd (full activity period) are kept for future reference/tooltip
// use but are NOT consulted by getActiveMeteorShower().

export interface MeteorShower {
  name: string;
  rangeStart: { month: number; day: number };
  rangeEnd: { month: number; day: number };
  peakStart: { month: number; day: number };
  peakEnd: { month: number; day: number };
  peakLabel: string;
}

const METEOR_SHOWERS: MeteorShower[] = [
  { name: 'Квадрантиди', rangeStart: { month: 1, day: 1 }, rangeEnd: { month: 1, day: 5 }, peakStart: { month: 1, day: 3 }, peakEnd: { month: 1, day: 4 }, peakLabel: '3-4 януари' },
  { name: 'Лириди', rangeStart: { month: 4, day: 16 }, rangeEnd: { month: 4, day: 25 }, peakStart: { month: 4, day: 22 }, peakEnd: { month: 4, day: 23 }, peakLabel: '22-23 април' },
  { name: 'Ета Аквариди', rangeStart: { month: 4, day: 19 }, rangeEnd: { month: 5, day: 28 }, peakStart: { month: 5, day: 5 }, peakEnd: { month: 5, day: 6 }, peakLabel: '5-6 май' },
  { name: 'Персеиди', rangeStart: { month: 7, day: 17 }, rangeEnd: { month: 8, day: 24 }, peakStart: { month: 8, day: 12 }, peakEnd: { month: 8, day: 13 }, peakLabel: '12-13 август' },
  { name: 'Ориониди', rangeStart: { month: 10, day: 2 }, rangeEnd: { month: 11, day: 7 }, peakStart: { month: 10, day: 21 }, peakEnd: { month: 10, day: 22 }, peakLabel: '21-22 октомври' },
  { name: 'Леониди', rangeStart: { month: 11, day: 6 }, rangeEnd: { month: 11, day: 30 }, peakStart: { month: 11, day: 16 }, peakEnd: { month: 11, day: 17 }, peakLabel: '16-17 ноември' },
  { name: 'Геминиди', rangeStart: { month: 12, day: 4 }, rangeEnd: { month: 12, day: 17 }, peakStart: { month: 12, day: 13 }, peakEnd: { month: 12, day: 14 }, peakLabel: '13-14 декември' },
  { name: 'Урсиди', rangeStart: { month: 12, day: 17 }, rangeEnd: { month: 12, day: 26 }, peakStart: { month: 12, day: 21 }, peakEnd: { month: 12, day: 22 }, peakLabel: '21-22 декември' },
];

function monthDayValue(month: number, day: number): number {
  return month * 100 + day;
}

export function getActiveMeteorShower(date: Date = new Date()): MeteorShower | null {
  const md = monthDayValue(date.getMonth() + 1, date.getDate());
  for (const shower of METEOR_SHOWERS) {
    const start = monthDayValue(shower.peakStart.month, shower.peakStart.day);
    const end = monthDayValue(shower.peakEnd.month, shower.peakEnd.day);
    const active = start <= end ? (md >= start && md <= end) : (md >= start || md <= end);
    if (active) return shower;
  }
  return null;
}
