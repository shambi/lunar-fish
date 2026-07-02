// Deterministic replacement for the old Groq-backed "AI ПОДХОД" advice — same
// field-knowledge templates the LLM system prompt used to enforce, now applied
// client-side with plain priority logic instead of a network round-trip.

export type PressureTrend = 'falling' | 'stable' | 'rising';

export interface FieldAdviceParams {
  fishName: string;
  windSpeed: number;
  recentRain: boolean;
  terrain: 'river' | 'lake';
  weatherCode: number;
  hour: number;
  month: number; // 1-12
  temperature: number;
  tempTrend: number; // delta °C over the next ~3h
  pressureTrend: PressureTrend;
  isInPeak: boolean;
  peakType: 'major' | 'minor' | null;
  overallScore: number;
  recommendedHookSize: string;
  recommendedLineThickness: string;
}

// Predators for which a bright leader would spook rather than help — same warning
// carried over from the original system prompt's МЪТНА ВОДА rule.
const DARK_LEADER_ONLY = new Set(['Сом', 'Щука', 'Сулка', 'Костур', 'Бибан']);

const PRESSURE_PHRASE: Record<PressureTrend, string> = {
  falling: 'налягането пада',
  stable: 'налягането е стабилно',
  rising: 'налягането расте',
};

type TempBucket = 'cooling' | 'stable' | 'warming';

function tempTrendBucket(tempTrend: number): TempBucket {
  if (tempTrend < -1) return 'cooling';
  if (tempTrend > 1) return 'warming';
  return 'stable';
}

// 3 (temp direction) × 3 (pressure trend) forecast templates — sentence 3's fallback
// when there's no active solunar peak and the fish isn't already scored as passive.
const FORECAST_TEMPLATES: Record<TempBucket, Record<PressureTrend, string>> = {
  cooling: {
    falling: 'Температурата ще спадне, а налягането продължава да пада — очаквай по-слабо кълване следващите часове, рибата се притаява.',
    stable: 'Температурата ще спадне при стабилно налягане — рибата остава активна, но приближаването ѝ към дъното ще се засили.',
    rising: 'Застудяване с покачващо се налягане — очаквай постепенно затихване на активността до края на деня.',
  },
  stable: {
    falling: 'Температурата остава стабилна, но налягането пада — рибата усеща промяната преди теб и обикновено засилва кълването в следващия час-два.',
    stable: 'Условията остават непроменени — добър момент за постоянство в тактиката, без резки промени.',
    rising: 'Налягането се покачва при стабилна температура — очаквай по-предпазливо поведение на рибата напред.',
  },
  warming: {
    falling: 'Затопля се, а налягането пада — комбинацията обикновено засилва апетита на рибата през следващите часове.',
    stable: 'Температурата ще се покачи при стабилно налягане — активността расте плавно до края на деня.',
    rising: 'Затопля се, но налягането расте — кълването може да отслабне въпреки по-топлата вода.',
  },
};

export function generateFieldAdvice(params: FieldAdviceParams): string {
  const {
    fishName,
    windSpeed,
    recentRain,
    terrain,
    weatherCode,
    hour,
    month,
    temperature,
    tempTrend,
    pressureTrend,
    isInPeak,
    peakType,
    overallScore,
    recommendedHookSize,
    recommendedLineThickness,
  } = params;

  const isClearSky = weatherCode <= 1;
  const isDay = hour >= 10 && hour < 17;
  const isStrongWind = windSpeed > 20;
  const isMuddyRiver = terrain === 'river' && recentRain === true;
  const isClearSunDay = isClearSky && isDay;
  const isClearCalm = windSpeed < 10 && recentRain === false;
  const needsDarkLeader = DARK_LEADER_ONLY.has(fishName);

  // ——— SENTENCE 1 + 2 share the same priority branch, for consistency ———
  let s1: string;
  let s2: string;

  if (isStrongWind) {
    s1 = `Днес духа силно (${windSpeed} км/ч) и това размества хранителните пластове по течението.`;
    s2 = `Вятърът нагнетява храна към подветрения бряг — целѝ тази зона; препоръчителна кука ${recommendedHookSize}, влакно ${recommendedLineThickness}.`;
  } else if (isMuddyRiver) {
    s1 = `Реката е мътна след скорошен дъжд, а нивото е леко покачено.`;
    s2 = needsDarkLeader
      ? `Затова рибата разчита повече на мирис, отколкото на зрение — използвай по-ароматна стръв, но поводът остава тъмен/незабележим, и целѝ тихите зони зад препятствия, не средата на течението; препоръчителна кука ${recommendedHookSize}, влакно ${recommendedLineThickness}.`
      : `Затова рибата разчита повече на мирис, отколкото на зрение — използвай сигнално влакно и по-ароматна стръв, но целѝ тихите зони зад препятствия, не средата на течението; препоръчителна кука ${recommendedHookSize}, влакно ${recommendedLineThickness}.`;
  } else if (isClearSunDay) {
    s1 = `Небето е ясно и слънцето грее силно над водата.`;
    s2 = `Затова рибата вижда по-добре менящите се цветове на влакното и търси по-хладни, по-дълбоки слоеве — избягвай крещящи цветове; препоръчителна кука ${recommendedHookSize}, влакно ${recommendedLineThickness}.`;
  } else if (isClearCalm) {
    s1 = `Водата е бистра, а вятърът е слаб — рибата вижда добре какво се случва на брега.`;
    s2 = `Затова използвай по-тънък повод, фино поднасяне и минимум движение край брега; препоръчителна кука ${recommendedHookSize}, влакно ${recommendedLineThickness}.`;
  } else {
    s1 = `Температурата е ${temperature}°, а ${PRESSURE_PHRASE[pressureTrend]}.`;
    const isAutumn = month >= 9 && month <= 11;
    const leader = isAutumn ? 'кафяв повод, имитиращ есенна растителност' : 'тъмен повод';
    s2 = `Използвай ${leader}; препоръчителна кука ${recommendedHookSize}, влакно ${recommendedLineThickness}.`;
  }

  // ——— SENTENCE 3 — forecast / troubleshooting ———
  let s3: string;
  if (isInPeak) {
    s3 = `Хвърляй сега — тече ${peakType === 'major' ? 'голям' : 'малък'} солунарен пик.`;
  } else if (overallScore < 40) {
    s3 = `Рибата в момента е по-пасивна — опитай по-фина стръв, по-тихо приближаване към водата и изчакай по-дълго между хвърлянията.`;
  } else {
    s3 = FORECAST_TEMPLATES[tempTrendBucket(tempTrend)][pressureTrend];
  }

  return `${s1} ${s2} ${s3}`;
}
