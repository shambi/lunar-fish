export type Habitat = 'river' | 'lake' | 'both';

export interface FishBaseData {
  groundbait: string;
  bait: string;
  line_mm: number;
  hook_size: string;
  lures?: string;
  rigs: string;
}

export interface FishSpecies {
  name: string;
  emoji: string;
  habitat: Habitat;
  isPredator: boolean;
  baseData: FishBaseData;
  spawnMonths: number[];
}

export const FISH_DATABASE: FishSpecies[] = [
  {
    name: 'Шаран',
    emoji: '🐟',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Сладка захранка с царевица и пеле',
      bait: 'Бойли, царевица, червеи',
      line_mm: 0.25,
      hook_size: '4-8',
      rigs: 'Косъм монтаж (Hair rig), фидер',
    },
    spawnMonths: [4, 5, 6],
  },
  {
    name: 'Амур',
    emoji: '🐠',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Растителна захранка с трева',
      bait: 'Тръстика, царевица, краставица, хляб',
      line_mm: 0.28,
      hook_size: '2-6',
      rigs: 'Поплавъчен монтаж, свободна линия',
    },
    spawnMonths: [5, 6, 7],
  },
  {
    name: 'Толстолоб',
    emoji: '🐡',
    habitat: 'lake',
    isPredator: false,
    baseData: {
      groundbait: 'Технопланктон, фитопланктон смес',
      bait: 'Технопланктон, тесто с планктон',
      line_mm: 0.30,
      hook_size: '2-6',
      rigs: 'Тремпел монтаж, плаващ монтаж',
    },
    spawnMonths: [5, 6, 7],
  },
  {
    name: 'Сом',
    emoji: '🐋',
    habitat: 'river',
    isPredator: true,
    baseData: {
      groundbait: 'Кървава захранка, рибно брашно',
      bait: 'Жива риба, черен дроб, пиявици',
      line_mm: 0.40,
      hook_size: '1/0-4/0',
      lures: 'Големи силиконови примамки, воблери 12-20см',
      rigs: 'Дънен монтаж с тежка тежест, буй монтаж',
    },
    spawnMonths: [5, 6],
  },
  {
    name: 'Щука',
    emoji: '🦈',
    habitat: 'both',
    isPredator: true,
    baseData: {
      groundbait: '',
      bait: 'Жива рибка, мъртва рибка',
      line_mm: 0.30,
      hook_size: '1/0-3/0',
      lures: 'Воблери 7-15см, спинери, блесни',
      rigs: 'Стоманен повод, спининг монтаж',
    },
    spawnMonths: [2, 3, 4],
  },
  {
    name: 'Каракуда',
    emoji: '🐠',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Лека сладка захранка, трохи',
      bait: 'Червеи, ларви, хляб, тесто',
      line_mm: 0.14,
      hook_size: '14-18',
      rigs: 'Лек поплавъчен монтаж',
    },
    spawnMonths: [4, 5, 6],
  },
  {
    name: 'Бяла риба (Уклей)',
    emoji: '🐟',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Облачна захранка, фина фракция',
      bait: 'Ларви, малки червеи, тесто',
      line_mm: 0.10,
      hook_size: '18-22',
      rigs: 'Ултралек поплавъчен монтаж',
    },
    spawnMonths: [4, 5, 6],
  },
  {
    name: 'Пъстърва',
    emoji: '🐟',
    habitat: 'river',
    isPredator: true,
    baseData: {
      groundbait: '',
      bait: 'Червеи, ларви, икра',
      line_mm: 0.18,
      hook_size: '8-14',
      lures: 'Малки воблери 3-7см, спинери №1-3, мухи',
      rigs: 'Спининг, муха, бомбарда монтаж',
    },
    spawnMonths: [10, 11, 12, 1],
  },
  {
    name: 'Кефал',
    emoji: '🐠',
    habitat: 'river',
    isPredator: false,
    baseData: {
      groundbait: 'Хлебна захранка, варено жито',
      bait: 'Хляб, тесто, червеи, водорасли',
      line_mm: 0.16,
      hook_size: '10-16',
      rigs: 'Поплавъчен монтаж, леко дъно',
    },
    spawnMonths: [4, 5, 6],
  },
  {
    name: 'Скобар',
    emoji: '🐟',
    habitat: 'river',
    isPredator: true,
    baseData: {
      groundbait: 'Каменна захранка, тежка смес',
      bait: 'Червеи, ларви, рачета',
      line_mm: 0.16,
      hook_size: '10-14',
      lures: 'Микро спинери, малки силиконови',
      rigs: 'Болонезе, проводка, лек фидер',
    },
    spawnMonths: [3, 4, 5],
  },
  {
    name: 'Лин',
    emoji: '🐠',
    habitat: 'lake',
    isPredator: false,
    baseData: {
      groundbait: 'Сладка захранка с ванилия',
      bait: 'Червеи, царевица, хляб, ларви',
      line_mm: 0.20,
      hook_size: '8-14',
      rigs: 'Поплавъчен монтаж, лек фидер',
    },
    spawnMonths: [5, 6, 7],
  },
];

export interface ScoredFish extends FishSpecies {
  score: number;
  isRecommended: boolean;
}

export function scoreFish(
  fish: FishSpecies,
  moonScore: number,
  temperature: number,
  windSpeed: number,
  currentMonth: number,
  terrain: 'river' | 'lake'
): number {
  let score = 0;

  // Moon influence (0-25)
  score += moonScore * 5;

  // Habitat match (0-20)
  if (fish.habitat === 'both' || fish.habitat === terrain) {
    score += 20;
  }

  // Temperature preference (0-20)
  if (fish.isPredator) {
    // Predators more active in moderate/cool temps
    if (temperature >= 10 && temperature <= 22) score += 20;
    else if (temperature >= 5 && temperature <= 28) score += 12;
    else score += 5;
  } else {
    // Peaceful fish prefer warmer water
    if (temperature >= 15 && temperature <= 28) score += 20;
    else if (temperature >= 8 && temperature <= 32) score += 12;
    else score += 5;
  }

  // Wind (0-15)
  if (windSpeed < 15) score += 15;
  else if (windSpeed < 25) score += 10;
  else score += 3;

  // Seasonal activity (0-20)
  const isSpawning = fish.spawnMonths.includes(currentMonth);
  if (isSpawning) {
    score -= 10; // Less desirable during spawn
  } else {
    // Peak months vary: summer fish score higher in summer, etc.
    const summerFish = ['Шаран', 'Амур', 'Толстолоб', 'Каракуда', 'Лин'];
    const isSummer = currentMonth >= 6 && currentMonth <= 9;
    const isWinter = currentMonth === 12 || currentMonth <= 2;
    if (summerFish.includes(fish.name) && isSummer) score += 20;
    else if (!summerFish.includes(fish.name) && !isSummer) score += 15;
    else score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

export function getScoredFish(
  moonScore: number,
  temperature: number,
  windSpeed: number,
  terrain: 'river' | 'lake'
): ScoredFish[] {
  const currentMonth = new Date().getMonth() + 1;
  const scored = FISH_DATABASE.map((fish) => {
    const score = scoreFish(fish, moonScore, temperature, windSpeed, currentMonth, terrain);
    return { ...fish, score, isRecommended: false };
  }).sort((a, b) => b.score - a.score);

  // Top 2-3 get recommended
  const topCount = scored[0].score - scored[2].score < 10 ? 3 : 2;
  for (let i = 0; i < topCount; i++) {
    scored[i].isRecommended = true;
  }

  return scored;
}

export interface FishModalData {
  groundbaitTip: string;
  baitTip: string;
  lineDiameter: string;
  lureTip: string | null;
  hookTip: string;
  rigTip: string;
  ecoWarning: string;
}

export function getFishModalData(
  fish: FishSpecies,
  temperature: number,
  weatherCode: number,
  terrain: 'river' | 'lake'
): FishModalData {
  const currentMonth = new Date().getMonth() + 1;
  const isSunny = [0, 1].includes(weatherCode);

  // Temperature-adjusted bait
  let groundbaitTip: string;
  let baitTip: string;
  if (temperature < 12) {
    groundbaitTip = fish.baseData.groundbait
      ? `${fish.baseData.groundbait} — по-малки порции, студена вода`
      : 'Не е необходима захранка за този вид';
    baitTip = `Натурални стръвки: червеи, ларви — малки порции. (${fish.baseData.bait})`;
  } else if (temperature > 25) {
    groundbaitTip = fish.baseData.groundbait
      ? `${fish.baseData.groundbait} — по-големи количества, повърхностен риболов`
      : 'Не е необходима захранка за този вид';
    baitTip = `По-едри стръвки, повърхностен монтаж. (${fish.baseData.bait})`;
  } else {
    groundbaitTip = fish.baseData.groundbait || 'Не е необходима захранка за този вид';
    baitTip = fish.baseData.bait;
  }

  // Line diameter adjusted for river
  let lineMM = fish.baseData.line_mm;
  if (terrain === 'river') lineMM += 0.05;
  const lineDiameter = `${lineMM.toFixed(2)} мм${terrain === 'river' ? ' (усилено за река)' : ''}`;

  // Lure tip for predators
  let lureTip: string | null = null;
  if (fish.isPredator && fish.baseData.lures) {
    const colorRec = isSunny
      ? 'натурални цветове (сребро, зелено)'
      : 'ярки цветове (оранжево, жълто, шартрьоз)';
    lureTip = `${fish.baseData.lures} — препоръчани цветове: ${colorRec}`;
  }

  // Hook size adjusted by temperature
  let hookTip: string;
  if (temperature < 12) {
    hookTip = `По-малки куки (1-2 номера по-малки от стандартните ${fish.baseData.hook_size})`;
  } else {
    hookTip = `Куки №${fish.baseData.hook_size}`;
  }
  const rigTip = fish.baseData.rigs;

  // Eco warning
  let ecoWarning: string;
  if (currentMonth === 4 || currentMonth === 5) {
    ecoWarning = '⚠️ Пролетна забрана! Ловете само на разрешени места.';
  } else if (fish.name === 'Щука' && currentMonth === 2) {
    ecoWarning = '⚠️ Щуката е в размножителен период!';
  } else if (fish.name === 'Пъстърва' && [10, 11, 12, 1].includes(currentMonth)) {
    ecoWarning = '⚠️ Пъстървата се размножава. Бъдете етични!';
  } else if (fish.spawnMonths.includes(currentMonth)) {
    ecoWarning = `⚠️ ${fish.name} е в размножителен период. Практикувайте "хвани и пусни"!`;
  } else {
    ecoWarning = '✅ Разрешен период. Хвани и пусни!';
  }

  return { groundbaitTip, baitTip, lineDiameter, lureTip, hookTip, rigTip, ecoWarning };
}
