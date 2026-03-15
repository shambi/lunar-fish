const SYNODIC_MONTH = 29.53058867;
// Known new moon reference: Jan 6, 2000 18:14 UTC
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

export interface MoonData {
  phase: number; // 0-1
  phaseName: string;
  illumination: number; // 0-100
  emoji: string;
  fishingScore: number; // 1-5
  fishingLabel: string;
  fishingTip: string;
  baits: { name: string; icon: string }[];
}

function getMoonAge(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

export function getMoonData(date: Date = new Date()): MoonData {
  const age = getMoonAge(date);
  const phase = age / SYNODIC_MONTH; // 0-1

  // Illumination (approximate cosine curve)
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  // Phase name & emoji
  let phaseName: string;
  let emoji: string;
  if (phase < 0.0335) { phaseName = 'New Moon'; emoji = '🌑'; }
  else if (phase < 0.215) { phaseName = 'Waxing Crescent'; emoji = '🌒'; }
  else if (phase < 0.285) { phaseName = 'First Quarter'; emoji = '🌓'; }
  else if (phase < 0.465) { phaseName = 'Waxing Gibbous'; emoji = '🌔'; }
  else if (phase < 0.535) { phaseName = 'Full Moon'; emoji = '🌕'; }
  else if (phase < 0.715) { phaseName = 'Waning Gibbous'; emoji = '🌖'; }
  else if (phase < 0.785) { phaseName = 'Last Quarter'; emoji = '🌗'; }
  else if (phase < 0.9665) { phaseName = 'Waning Crescent'; emoji = '🌘'; }
  else { phaseName = 'New Moon'; emoji = '🌑'; }

  // Fishing score
  let fishingScore: number;
  let fishingLabel: string;
  let fishingTip: string;

  if (phaseName === 'New Moon' || phaseName === 'Full Moon') {
    fishingScore = 5;
    fishingLabel = 'Excellent';
    fishingTip = phaseName === 'Full Moon'
      ? 'Strong tidal pull increases fish activity. Night fishing is prime!'
      : 'New moon darkness makes fish less cautious — they bite more aggressively.';
  } else if (phaseName === 'Waxing Gibbous' || phaseName === 'Waning Gibbous') {
    fishingScore = 4;
    fishingLabel = 'Very Good';
    fishingTip = 'High illumination keeps fish active during dawn and dusk.';
  } else if (phaseName === 'First Quarter' || phaseName === 'Last Quarter') {
    fishingScore = 3;
    fishingLabel = 'Good';
    fishingTip = 'Moderate tidal movements. Best results around sunrise and sunset.';
  } else {
    fishingScore = 2;
    fishingLabel = 'Fair';
    fishingTip = 'Quieter feeding periods. Try deeper waters and slower presentations.';
  }

  // Baits based on phase category
  const baitSets: Record<string, { name: string; icon: string }[]> = {
    'New Moon': [
      { name: 'Dark Jigs', icon: '🎣' },
      { name: 'Black Worms', icon: '🪱' },
      { name: 'Spinnerbaits', icon: '✨' },
      { name: 'Live Shrimp', icon: '🦐' },
    ],
    'Full Moon': [
      { name: 'Topwater Lures', icon: '🐟' },
      { name: 'Silver Spoons', icon: '🥄' },
      { name: 'Live Bait', icon: '🪱' },
      { name: 'Glow Jigs', icon: '💡' },
    ],
    gibbous: [
      { name: 'Crankbaits', icon: '🐟' },
      { name: 'Soft Plastics', icon: '🎣' },
      { name: 'Swimbaits', icon: '🐠' },
      { name: 'Cut Bait', icon: '🔪' },
    ],
    quarter: [
      { name: 'Jerkbaits', icon: '🎣' },
      { name: 'Drop Shots', icon: '🎯' },
      { name: 'Worms', icon: '🪱' },
      { name: 'Crawfish', icon: '🦞' },
    ],
    crescent: [
      { name: 'Finesse Worms', icon: '🪱' },
      { name: 'Ned Rigs', icon: '🎣' },
      { name: 'Small Jigs', icon: '🎯' },
      { name: 'Dough Bait', icon: '🍞' },
    ],
  };

  let baits: { name: string; icon: string }[];
  if (phaseName === 'New Moon') baits = baitSets['New Moon'];
  else if (phaseName === 'Full Moon') baits = baitSets['Full Moon'];
  else if (phaseName.includes('Gibbous')) baits = baitSets.gibbous;
  else if (phaseName.includes('Quarter')) baits = baitSets.quarter;
  else baits = baitSets.crescent;

  return { phase, phaseName, illumination, emoji, fishingScore, fishingLabel, fishingTip, baits };
}
