import type { MoonData } from './moon';

export interface FishTackle {
  hookSize: string;
  lineDiameter: string;
  lineType: string;
  groundbait: string;
}

export interface FishEntry {
  id: string;
  name: string;
  nameBg: string;
  icon: string;
  description: string;
  habitat: string;
  bestSeason: string;
  baseTackle: FishTackle;
  isPredator: boolean;
}

export const FISH_DATABASE: FishEntry[] = [
  {
    id: 'carp',
    name: 'Carp',
    nameBg: 'Шаран',
    icon: '🐟',
    description: 'Силна и издръжлива риба, обичаща топли и тихи води. Хапе най-добре при топло време.',
    habitat: 'Езера, язовири, бавно течащи реки',
    bestSeason: 'Май – Октомври',
    baseTackle: { hookSize: '4-8', lineDiameter: '0.25-0.30', lineType: 'Монофил', groundbait: 'Сладка смес с царевица и пелети' },
    isPredator: false,
  },
  {
    id: 'catfish',
    name: 'Catfish',
    nameBg: 'Сом',
    icon: '🐋',
    description: 'Най-големият хищник в сладките води. Активен предимно нощем и при пълнолуние.',
    habitat: 'Дълбоки ями в реки и язовири',
    bestSeason: 'Юни – Септември',
    baseTackle: { hookSize: '1/0-4/0', lineDiameter: '0.40-0.60', lineType: 'Плетено влакно', groundbait: 'Жива риба, черен дроб, калмари' },
    isPredator: true,
  },
  {
    id: 'pike',
    name: 'Pike',
    nameBg: 'Щука',
    icon: '🐊',
    description: 'Агресивен хищник с мощна челюст. Атакува бързо движещи се примамки.',
    habitat: 'Реки, язовири, заливи с водна растителност',
    bestSeason: 'Октомври – Март',
    baseTackle: { hookSize: '1/0-3/0', lineDiameter: '0.30-0.40', lineType: 'Плетено + стоманен повод', groundbait: 'Воблери, спинери, жива рибка' },
    isPredator: true,
  },
  {
    id: 'zander',
    name: 'Zander',
    nameBg: 'Бяла риба',
    icon: '🐡',
    description: 'Елегантен хищник, предпочитащ дълбоки и чисти води. Активен при здрач.',
    habitat: 'Дълбоки участъци на реки и язовири',
    bestSeason: 'Септември – Декември',
    baseTackle: { hookSize: '2-6', lineDiameter: '0.22-0.28', lineType: 'Флуорокарбон', groundbait: 'Джиг глави, силиконови примамки' },
    isPredator: true,
  },
  {
    id: 'chub',
    name: 'Chub',
    nameBg: 'Речен Кефал',
    icon: '🐟',
    description: 'Всеядна риба, обичаща бързо течащи води. Хапе на всякакви стръвки.',
    habitat: 'Реки с бързо течение, каменисто дъно',
    bestSeason: 'Април – Ноември',
    baseTackle: { hookSize: '6-12', lineDiameter: '0.18-0.22', lineType: 'Монофил', groundbait: 'Хляб, червеи, насекоми' },
    isPredator: false,
  },
  {
    id: 'trout',
    name: 'Trout',
    nameBg: 'Пъстърва',
    icon: '🐠',
    description: 'Бърза и красива риба от студените планински води. Изисква финес техника.',
    habitat: 'Планински реки и потоци с чиста вода',
    bestSeason: 'Март – Септември',
    baseTackle: { hookSize: '10-16', lineDiameter: '0.14-0.18', lineType: 'Флуорокарбон', groundbait: 'Мухи, спинери, червеи' },
    isPredator: true,
  },
  {
    id: 'crucian',
    name: 'Crucian Carp',
    nameBg: 'Каракуда',
    icon: '🐠',
    description: 'Малка, жилава риба. Идеална за начинаещи. Хапе активно на поплавък.',
    habitat: 'Тихи езера, канали, заливи',
    bestSeason: 'Април – Октомври',
    baseTackle: { hookSize: '14-18', lineDiameter: '0.12-0.16', lineType: 'Монофил', groundbait: 'Тесто, хляб, ларви' },
    isPredator: false,
  },
  {
    id: 'bream',
    name: 'Bream',
    nameBg: 'Платика',
    icon: '🐟',
    description: 'Дънна риба, обичаща меко дъно. Отличен обект за фидер риболов.',
    habitat: 'Езера и бавни реки с тинесто дъно',
    bestSeason: 'Май – Октомври',
    baseTackle: { hookSize: '10-14', lineDiameter: '0.16-0.20', lineType: 'Монофил', groundbait: 'Фидер смес с червеи и ларви' },
    isPredator: false,
  },
  {
    id: 'perch',
    name: 'Perch',
    nameBg: 'Костур',
    icon: '🐟',
    description: 'Малък, но агресивен хищник. Атакува на ято и обича движещи се примамки.',
    habitat: 'Езера, реки, язовири — близо до подводни структури',
    bestSeason: 'Цялата година',
    baseTackle: { hookSize: '8-14', lineDiameter: '0.16-0.20', lineType: 'Флуорокарбон', groundbait: 'Микро джиг, малки спинери, червеи' },
    isPredator: true,
  },
  {
    id: 'grass_carp',
    name: 'Grass Carp',
    nameBg: 'Амур',
    icon: '🐟',
    description: 'Голяма тревоядна риба с мощно тегло. Хапе на растителни стръвки.',
    habitat: 'Езера и язовири с водна растителност',
    bestSeason: 'Юни – Септември',
    baseTackle: { hookSize: '4-8', lineDiameter: '0.28-0.35', lineType: 'Монофил', groundbait: 'Царевица, пелети, тигрови ядки' },
    isPredator: false,
  },
  {
    id: 'nase',
    name: 'Nase',
    nameBg: 'Скобар',
    icon: '🐠',
    description: 'Речна риба, обичаща бързи течения. Хапе на дребни стръвки на дъното.',
    habitat: 'Бързи реки с каменисто дъно',
    bestSeason: 'Март – Ноември',
    baseTackle: { hookSize: '12-16', lineDiameter: '0.14-0.18', lineType: 'Монофил', groundbait: 'Ларви, тесто, дребни червеи' },
    isPredator: false,
  },
];

export interface SmartTackleResult {
  hookSize: string;
  lineDiameter: string;
  lineType: string;
  groundbait: string;
  proTip: string;
}

export function getSmartTackle(
  fish: FishEntry,
  moon: MoonData,
  temperature: number | null,
  weatherCode: number | null
): SmartTackleResult {
  const temp = temperature ?? 18;
  const code = weatherCode ?? 0;
  const activity = moon.fishingScore;
  const isClear = [0, 1].includes(code);
  const isFullOrNew = moon.phaseName === 'Full Moon' || moon.phaseName === 'New Moon';

  // Parse base hook range
  const hookParts = fish.baseTackle.hookSize.split('-');
  let hookSize = fish.baseTackle.hookSize;

  // If low activity or cold water, suggest smaller hooks
  if (activity < 3 || temp < 12) {
    const adjusted = hookParts.map(h => {
      if (h.includes('/0')) return h; // don't adjust predator hooks
      const num = parseInt(h);
      return isNaN(num) ? h : String(num + 2);
    });
    hookSize = adjusted.join('-') + ' (по-фин)';
  }

  // Line logic
  let lineDiameter = fish.baseTackle.lineDiameter;
  let lineType = fish.baseTackle.lineType;

  if (isClear && !fish.isPredator) {
    // Clear, sunny → thinner fluorocarbon
    const parts = lineDiameter.split('-');
    const thinner = parts.map(p => {
      const val = parseFloat(p);
      return isNaN(val) ? p : (val - 0.02).toFixed(2);
    });
    lineDiameter = thinner.join('-');
    lineType = 'Флуорокарбон (невидимо)';
  }

  if (isFullOrNew && fish.isPredator) {
    // Predator peak → stronger leaders
    lineType = 'Плетено + стоманен повод';
    const parts = lineDiameter.split('-');
    const stronger = parts.map(p => {
      const val = parseFloat(p);
      return isNaN(val) ? p : (val + 0.05).toFixed(2);
    });
    lineDiameter = stronger.join('-');
  }

  // Bait strategy
  let groundbait = fish.baseTackle.groundbait;

  if (temp < 12) {
    if (fish.isPredator) {
      groundbait = 'Бавни силиконови примамки, мъртва рибка';
    } else {
      groundbait = 'Протеинови стръвки: кръвен червей, ларви, дребни червеи';
    }
  } else if (temp > 25) {
    if (fish.isPredator) {
      groundbait = 'Повърхностни примамки, бързи спинери';
    } else {
      groundbait = 'Сладки стръвки: царевица, плодови бойли, пелети';
    }
  }

  // Pro tip
  let proTip: string;
  if (isFullOrNew && fish.isPredator) {
    proTip = `🌕 ${moon.phaseNameBg}: Хищниците като ${fish.nameBg} са изключително агресивни. Използвайте по-едри примамки и стоманен повод!`;
  } else if (isFullOrNew && !fish.isPredator) {
    proTip = `🌕 ${moon.phaseNameBg}: ${fish.nameBg} се храни активно. Използвайте повече захранка за задържане на ятото!`;
  } else if (temp < 12) {
    proTip = `❄️ Студена вода (${temp}°C): ${fish.nameBg} е по-бавна. Използвайте протеинови стръвки и бавна презентация.`;
  } else if (temp > 25) {
    proTip = `🌡️ Гореща вода (${temp}°C): ${fish.nameBg} търси сянка и дълбочина. Ловете рано сутрин или привечер.`;
  } else if (activity < 3) {
    proTip = `📉 Ниска активност: Бъдете търпеливи. Използвайте по-фини монтажи и по-малки куки за ${fish.nameBg}.`;
  } else {
    proTip = `✅ Добри условия: Стандартен подход за ${fish.nameBg} — ловете около изгрев и залез за най-добри резултати.`;
  }

  return { hookSize, lineDiameter, lineType, groundbait, proTip };
}
