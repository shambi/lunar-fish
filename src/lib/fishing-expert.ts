import type { MoonData, BaitInfo, TackleInfo, TargetFish } from './moon';

export interface SmartTips {
  weatherTip: string;
  windTip: string;
  timingTip: string;
  fishingStyleTip: string;
  baits: BaitInfo[];
  tackle: TackleInfo[];
  targetFish: TargetFish[];
}

export function getSmartFishingTips(
  moon: MoonData,
  temperature: number,
  windSpeed: number,
  weatherCode: number
): SmartTips {
  const isHot = temperature > 25;
  const isCold = temperature < 5;
  const isWindy = windSpeed > 20;
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);

  // Weather-based tip
  let weatherTip: string;
  if (isStormy) {
    weatherTip = '⚠️ Бурно време — избягвайте откритите водоеми. Безопасността е на първо място!';
  } else if (isHot) {
    weatherTip = '🌡️ Горещо време (над 25°C) — рибата търси по-дълбоки и хладни води. Опитайте рано сутрин или привечер.';
  } else if (isCold) {
    weatherTip = '❄️ Студено време — рибата е по-бавна. Използвайте бавни презентации и малки стръвки.';
  } else if (isRainy) {
    weatherTip = '🌧️ Дъждовно — дъждът насища водата с кислород. Отличен момент за риболов!';
  } else {
    weatherTip = '✅ Приятно време — добри условия за риболов през целия ден.';
  }

  // Wind-based tip
  let windTip: string;
  if (isWindy) {
    windTip = '💨 Силен вятър — използвайте по-тежки тежести (40-60г) и ловете от подветрената страна.';
  } else if (windSpeed > 10) {
    windTip = '🍃 Умерен вятър — лек бриз помага за разбъркване на водата. Добри условия.';
  } else {
    windTip = '🪶 Тихо — спокойна вода. Използвайте по-деликатни монтажи и по-тънко влакно.';
  }

  // Timing tip based on temperature + moon
  let timingTip: string;
  if (isHot) {
    timingTip = '🕐 Най-добро време: 05:00–08:00 и 19:00–22:00';
  } else if (isCold) {
    timingTip = '🕐 Най-добро време: 11:00–15:00 (по-топлата част на деня)';
  } else {
    timingTip = '🕐 Най-добро време: изгрев и залез';
  }

  // Smart fishing style based on conditions
  let fishingStyleTip: string;
  if (isStormy) {
    fishingStyleTip = '🎣 Не се препоръчва риболов при буря!';
  } else if (isWindy && isHot) {
    fishingStyleTip = '🎣 Фидер риболов на дъно в дълбоки участъци — вятърът и топлината карат рибата надолу.';
  } else if (isWindy) {
    fishingStyleTip = '🎣 Дънен риболов с тежък фидер монтаж от подветрената страна.';
  } else if (isHot) {
    fishingStyleTip = '🎣 Спининг рано сутрин или нощен риболов с поплавък — рибата е активна в хладните часове.';
  } else if (isRainy) {
    fishingStyleTip = '🎣 Поплавъчен риболов — дъждът активизира рибата в плитчините.';
  } else if (isCold) {
    fishingStyleTip = '🎣 Финес риболов с микро джиг или дроп-шот — бавни и деликатни движения.';
  } else {
    fishingStyleTip = moon.fishingStyleTip;
  }

  // Smart baits based on conditions and target fish
  let baits: BaitInfo[];
  let tackle: TackleInfo[];
  let targetFish: TargetFish[];

  if (isHot) {
    targetFish = [
      { name: 'Шаран', icon: '🐟' },
      { name: 'Сом', icon: '🐋' },
      { name: 'Амур', icon: '🐠' },
    ];
    baits = [
      { name: 'Царевица', icon: '🌽' },
      { name: 'Бойли', icon: '🟤' },
      { name: 'Пеле', icon: '🟡' },
      { name: 'Жива стръв', icon: '🦐' },
    ];
    tackle = [
      { name: 'Куки №4-8', icon: '🪝' },
      { name: 'Тежест 30-50г', icon: '⚓' },
      { name: 'Флуорокарбон 0.25', icon: '🧵' },
      { name: 'Фидер монтаж', icon: '🎣' },
    ];
  } else if (isCold) {
    targetFish = [
      { name: 'Пъстърва', icon: '🐟' },
      { name: 'Костур', icon: '🐠' },
      { name: 'Щука', icon: '🐡' },
    ];
    baits = [
      { name: 'Микро джиг', icon: '🪝' },
      { name: 'Червеи', icon: '🪱' },
      { name: 'Спинери', icon: '🔄' },
      { name: 'Ларви', icon: '🪱' },
    ];
    tackle = [
      { name: 'Куки №12-16', icon: '🪝' },
      { name: 'Лека тежест', icon: '⚓' },
      { name: 'Влакно 0.14-0.16', icon: '🧵' },
      { name: 'Дроп-шот', icon: '🎣' },
    ];
  } else if (isWindy) {
    targetFish = moon.targetFish;
    baits = moon.baits;
    tackle = [
      { name: 'Куки №6-10', icon: '🪝' },
      { name: 'Тежест 40-60г', icon: '⚓' },
      { name: 'Влакно 0.22-0.25', icon: '🧵' },
      { name: 'Тежък фидер', icon: '🎣' },
    ];
  } else {
    // Use moon-phase based defaults
    baits = moon.baits;
    tackle = moon.tackle;
    targetFish = moon.targetFish;
  }

  return { weatherTip, windTip, timingTip, fishingStyleTip, baits, tackle, targetFish };
}
