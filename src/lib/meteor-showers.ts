// Static table of the 8 major annual meteor showers — no external API. Dates are
// month/day only (year-agnostic); none of these 8 wrap across the Dec 31 -> Jan 1
// boundary, but getActiveMeteorShower() handles that case anyway for correctness.

export interface MeteorShower {
  name: string;
  rangeStart: { month: number; day: number };
  rangeEnd: { month: number; day: number };
  peakLabel: string;
}

const METEOR_SHOWERS: MeteorShower[] = [
  { name: 'Квадрантиди', rangeStart: { month: 1, day: 1 }, rangeEnd: { month: 1, day: 5 }, peakLabel: '3-4 януари' },
  { name: 'Лириди', rangeStart: { month: 4, day: 16 }, rangeEnd: { month: 4, day: 25 }, peakLabel: '22-23 април' },
  { name: 'Ета Аквариди', rangeStart: { month: 4, day: 19 }, rangeEnd: { month: 5, day: 28 }, peakLabel: '5-6 май' },
  { name: 'Персеиди', rangeStart: { month: 7, day: 17 }, rangeEnd: { month: 8, day: 24 }, peakLabel: '12-13 август' },
  { name: 'Ориониди', rangeStart: { month: 10, day: 2 }, rangeEnd: { month: 11, day: 7 }, peakLabel: '21-22 октомври' },
  { name: 'Леониди', rangeStart: { month: 11, day: 6 }, rangeEnd: { month: 11, day: 30 }, peakLabel: '16-17 ноември' },
  { name: 'Геминиди', rangeStart: { month: 12, day: 4 }, rangeEnd: { month: 12, day: 17 }, peakLabel: '13-14 декември' },
  { name: 'Урсиди', rangeStart: { month: 12, day: 17 }, rangeEnd: { month: 12, day: 26 }, peakLabel: '21-22 декември' },
];

function monthDayValue(month: number, day: number): number {
  return month * 100 + day;
}

export function getActiveMeteorShower(date: Date = new Date()): MeteorShower | null {
  const md = monthDayValue(date.getMonth() + 1, date.getDate());
  for (const shower of METEOR_SHOWERS) {
    const start = monthDayValue(shower.rangeStart.month, shower.rangeStart.day);
    const end = monthDayValue(shower.rangeEnd.month, shower.rangeEnd.day);
    const active = start <= end ? (md >= start && md <= end) : (md >= start || md <= end);
    if (active) return shower;
  }
  return null;
}
