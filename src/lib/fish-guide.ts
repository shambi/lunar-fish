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
  spawnWarning?: string;
  /** Terrain where the fish should be hidden (not shown) */
  hideOnTerrain?: 'river' | 'lake';
  /** Eco-warning texts for modal */
  ecoRed?: string;
  ecoGreen?: string;
  /** Subtitle shown in modal */
  subtitle?: string;
}

export interface ScoringOptions {
  weatherCode?: number;
  waterTemp?: number;
  pressureTrend?: 'rising' | 'stable' | 'falling';
  moonPhaseName?: string;
  sunrise?: string;
  timePeriod?: 'morning' | 'day' | 'evening' | 'night';
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
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер за задържане: 30 см.\nПо-малките — пусни обратно!',
  },
  {
    name: 'Амур',
    emoji: '🐠',
    habitat: 'lake',
    isPredator: false,
    baseData: {
      groundbait: 'Растителна захранка с трева',
      bait: 'Тръстика, царевица, краставица, хляб',
      line_mm: 0.28,
      hook_size: '2-6',
      rigs: 'Поплавъчен монтаж, свободна линия',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 40 см.',
  },
  {
    name: 'Толстолоб',
    emoji: '🐡',
    habitat: 'lake',
    isPredator: false,
    hideOnTerrain: 'river',
    baseData: {
      groundbait: 'Технопланктон, фитопланктон смес',
      bait: 'Технопланктон, тесто с планктон',
      line_mm: 0.30,
      hook_size: '2-6',
      rigs: 'Тремпел монтаж, плаващ монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 40 см.',
  },
  {
    name: 'Сом',
    emoji: '🐋',
    habitat: 'both',
    isPredator: true,
    baseData: {
      groundbait: 'Кървава захранка, рибно брашно',
      bait: 'Жива риба, черен дроб, пиявици',
      line_mm: 0.40,
      hook_size: '1/0-4/0',
      lures: 'Големи силиконови примамки, воблери 12-20см',
      rigs: 'Дънен монтаж с тежка тежест, буй монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 65 см —\nпо-малките задължително се пускат!',
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
    ecoRed: '⛔ Забранен период: 15 февруари — 30 април.\nВнимание — забраната започва по-рано\nот повечето видове!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 35 см.',
  },
  {
    name: 'Каракуда',
    emoji: '🐠',
    habitat: 'lake',
    isPredator: false,
    baseData: {
      groundbait: 'Лека сладка захранка, трохи',
      bait: 'Червеи, ларви, хляб, тесто',
      line_mm: 0.14,
      hook_size: '14-18',
      rigs: 'Лек поплавъчен монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 15 см.',
  },
  {
    name: 'Уклей',
    emoji: '🐟',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Ситна захранка с конопено семе и трохи — малки порции',
      bait: 'Опариш, малък червей, тесто, хляб',
      line_mm: 0.10,
      hook_size: '18',
      rigs: 'Ваглер с тънък повод, ултралек поплавъчен монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 15 см.',
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
    ecoRed: '⛔ Забранен период: 1 октомври — 31 януари.\nВнимание — забраната е есенно-зимна,\nразлична от другите видове!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 23 см.',
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
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 22 см.',
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
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 20 см.',
  },
  {
    name: 'Лин',
    emoji: '🐠',
    habitat: 'lake',
    isPredator: false,
    hideOnTerrain: 'river',
    baseData: {
      groundbait: 'Сладка захранка с ванилия',
      bait: 'Червеи, царевица, хляб, ларви',
      line_mm: 0.20,
      hook_size: '8-14',
      rigs: 'Поплавъчен монтаж, лек фидер',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 20 см.',
  },
  // ——— 9 NEW SPECIES ———
  {
    name: 'Костур',
    emoji: '🐟',
    habitat: 'both',
    isPredator: true,
    baseData: {
      groundbait: 'Малки живи рибки, червеи',
      bait: 'Малки воблери, туистери, живец',
      line_mm: 0.18,
      hook_size: '8',
      lures: 'Малки туистери 3-5см, джигове 5-10г, цветове: бяло/жълто при мътна вода, натурални при бистра',
      rigs: 'Лек джиг монтаж, каролина монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 12 см.',
  },
  {
    name: 'Платика',
    emoji: '🐟',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Фидер микс с трохи и червеи',
      bait: 'Червеи, опариш, царевица, тесто',
      line_mm: 0.16,
      hook_size: '10',
      rigs: 'Фидер монтаж, легер с повод 40-60см',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 20 см.',
  },
  {
    name: 'Бабушка',
    emoji: '🐟',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Ситна захранка с конопено семе',
      bait: 'Опариш, червей, малка царевица, тесто',
      line_mm: 0.12,
      hook_size: '14',
      rigs: 'Ваглер, фидер с тънък повод 0.08мм',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 15 см.',
  },
  {
    name: 'Червеноперка',
    emoji: '🐟',
    habitat: 'lake',
    isPredator: false,
    hideOnTerrain: 'river',
    baseData: {
      groundbait: 'Ситна повърхностна захранка',
      bait: 'Опариш, малки мухи, хляб, тесто',
      line_mm: 0.12,
      hook_size: '14',
      lures: 'Малки повърхностни примамки',
      rigs: 'Ваглер, повърхностен монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 15 см.',
  },
  {
    name: 'Мряна',
    emoji: '🐟',
    habitat: 'both',
    isPredator: false,
    baseData: {
      groundbait: 'Тежка дънна захранка, пелети',
      bait: 'Бойли, пелети, червеи, скариди',
      line_mm: 0.25,
      hook_size: '6',
      rigs: 'Тежък фидер 60-100г, кратък повод 10-15см',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 25 см.',
  },
  {
    name: 'Дъгова пъстърва',
    emoji: '🐟',
    habitat: 'river',
    isPredator: true,
    hideOnTerrain: 'lake',
    baseData: {
      groundbait: '',
      bait: 'Червеи, скариди, хайвер имитации',
      line_mm: 0.16,
      hook_size: '10',
      lures: 'Малки блесни 5-10г, воблери 4-7см, мухи — нимфи и мокри мухи',
      rigs: 'Нахлист, спининг с тънко влакно',
    },
    spawnMonths: [10, 11, 12, 1],
    ecoRed: '⛔ Забранен период: 1 октомври — 31 януари.\nВнимание — забраната е есенно-зимна!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 22 см.',
  },
  {
    name: 'Бибан',
    emoji: '🐟',
    habitat: 'both',
    isPredator: true,
    baseData: {
      groundbait: 'Не се захранва',
      bait: 'Малки червеи, личинки',
      line_mm: 0.14,
      hook_size: '12',
      lures: 'Микро джигове 1-3г, малки туистери',
      rigs: 'Ултралайт спининг, дроп-шот монтаж',
    },
    spawnMonths: [4, 5],
    ecoRed: '⛔ Забранен период: 15 април — 31 май.\nРиболовът е забранен!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 12 см.',
  },
  {
    name: 'Сулка',
    emoji: '🐟',
    habitat: 'both',
    isPredator: true,
    baseData: {
      groundbait: 'Не се захранва',
      bait: 'Живец (уклей, бабушка до 10см), мъртва рибка',
      line_mm: 0.22,
      hook_size: '6',
      lures: 'Воблери 7-12см, туистери, джигове 10-20г — бяло/сребристо нощем, натурални цветове денем',
      rigs: 'Джиг монтаж, живца монтаж, подводна плувка',
    },
    spawnMonths: [3, 4, 5],
    ecoRed: '⛔ Забранен период: 15 март — 15 май.\nВнимание — забраната започва\nпо-рано от повечето видове!\nМинимален размер: 45 см.',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 45 см —\nпо-малките задължително се пускат!',
  },
  {
    name: 'Распер',
    emoji: '🐟',
    habitat: 'river',
    isPredator: true,
    hideOnTerrain: 'lake',
    subtitle: 'Среща се в р. Дунав и долните течения на Марица, Тунджа и Арда.',
    baseData: {
      groundbait: '',
      bait: 'Малки рибки, живец',
      line_mm: 0.20,
      hook_size: '8',
      lures: 'Блесни 10-20г, повърхностни воблери, цветове: сребристо/бяло',
      rigs: 'Спининг, повърхностно водене',
    },
    spawnMonths: [3, 4],
    ecoRed: '⛔ Забранен период: 1 март — 30 април.\nВнимание — най-ранната забрана\nсред всички видове!',
    ecoGreen: '✅ Разрешен период.\nМинимален размер: 25 см.\nСреща се в р. Дунав и долните\nтечения на Марица, Тунджа и Арда.',
  },
];

export interface ScoredFish extends FishSpecies {
  score: number;
  stars: number;
  isRecommended: boolean;
}

export function scoreFish(
  fish: FishSpecies,
  moonScore: number,
  temperature: number,
  windSpeed: number,
  currentMonth: number,
  terrain: 'river' | 'lake',
  options?: ScoringOptions
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
    if (temperature >= 10 && temperature <= 22) score += 20;
    else if (temperature >= 5 && temperature <= 28) score += 12;
    else score += 5;
  } else {
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
    score -= 10;
  } else {
    const summerFish = ['Шаран', 'Амур', 'Толстолоб', 'Каракуда', 'Лин'];
    const isSummer = currentMonth >= 6 && currentMonth <= 9;
    const isWinter = currentMonth === 12 || currentMonth <= 2;
    if (summerFish.includes(fish.name) && isSummer) score += 20;
    else if (!summerFish.includes(fish.name) && !isSummer) score += 15;
    else score += 10;
  }

  // ——— Species-specific scoring boosts ———
  if (options) {
    const wc = options.weatherCode ?? 0;
    const wt = options.waterTemp;
    const pt = options.pressureTrend ?? 'stable';
    const isNewMoon = options.moonPhaseName?.toLowerCase().includes('new') ?? false;
    const isFullMoon = options.moonPhaseName?.toLowerCase().includes('full') ?? false;
    const isOvercast = wc > 2;
    const isSunny = wc < 2;

    switch (fish.name) {
      case 'Костур':
        if (wt != null && wt < 12) score += 10; // boost +2 equivalent
        if (isNewMoon) score += 5;
        break;
      case 'Платика':
        if (isOvercast) score += 5;
        if (pt === 'stable') score += 5;
        break;
      case 'Бабушка':
        if (options.sunrise && options.sunrise !== '--:--') score += 5; // active near sunrise
        if ((options.weatherCode ?? 0) >= 0 && windSpeed < 10) score += 5;
        break;
      case 'Червеноперка':
        if (temperature > 18) score += 10;
        if (isSunny) score += 5;
        break;
      case 'Мряна':
        if (pt === 'rising') score += 5;
        break;
      case 'Дъгова пъстърва':
        if (temperature < 14) score += 10;
        break;
      case 'Бибан':
        if (isFullMoon) score += 5;
        score += 3; // active year-round bonus
        break;
      case 'Уклей':
        if (options.sunrise && options.sunrise !== '--:--') score += 5; // boost near sunrise
        if (windSpeed < 10) score += 5; // boost calm wind
        if (isFullMoon) score += 5; // boost full moon
        break;
      case 'Сулка':
        if (isNewMoon) score += 10; // boost +2 during new moon
        if (isOvercast) score += 5;
        break;
      case 'Распер':
        if (temperature > 15) score += 10;
        if (isSunny) score += 5;
        break;
    }

    // Night-time scoring adjustments
    const tp = options.timePeriod;
    if (tp === 'night') {
      const nocturnalBoost2 = ['Сом', 'Сулка', 'Щука'];
      const nocturnalBoost1 = ['Мряна', 'Костур'];
      const dayOnly = ['Червеноперка', 'Уклей', 'Толстолоб', 'Амур'];
      if (nocturnalBoost2.includes(fish.name)) score += 10; // ~+2 stars
      else if (nocturnalBoost1.includes(fish.name)) score += 5; // ~+1 star
      else if (dayOnly.includes(fish.name)) score -= 5;
    }
  }

  return Math.max(0, Math.min(100, score));
}

export function getScoredFish(
  moonScore: number,
  temperature: number,
  windSpeed: number,
  terrain: 'river' | 'lake',
  options?: ScoringOptions
): ScoredFish[] {
  const currentMonth = new Date().getMonth() + 1;

  const scored = FISH_DATABASE
    // Show only fish compatible with selected terrain.
    .filter((fish) => (fish.habitat === 'both' || fish.habitat === terrain) && fish.hideOnTerrain !== terrain)
    .map((fish) => {
      const score = scoreFish(fish, moonScore, temperature, windSpeed, currentMonth, terrain, options);
      const stars = Math.min(5, Math.max(1, Math.round(score / 20)));
      return { ...fish, score, stars, isRecommended: stars >= 4 };
    })
    .sort((a, b) => b.score - a.score);

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
  const currentHour = new Date().getHours();
  const isSunHours = currentHour >= 5 && currentHour < 17;
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
    const colorRec = isSunny && isSunHours
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

  // Eco warning — use per-fish ecoRed/ecoGreen data
  const IARA_FOOTER = '\n\n📋 Проверете списъка на ИАРА за\nразрешени язовири и езера във вашия район.\niara.government.bg';
  let ecoWarning: string;
  const isBanned = fish.spawnMonths.includes(currentMonth);
  if (isBanned && fish.ecoRed) {
    ecoWarning = fish.ecoRed;
  } else if (fish.ecoGreen) {
    ecoWarning = fish.ecoGreen;
  } else {
    ecoWarning = '✅ Разрешен период.';
  }
  ecoWarning += IARA_FOOTER;

  return { groundbaitTip, baitTip, lineDiameter, lureTip, hookTip, rigTip, ecoWarning };
}
