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
  weatherCode: number,
  options?: {
    pressureTrend?: 'rising' | 'stable' | 'falling';
    pressureDiff?: number;
    waterTemp?: number;
    sunrise?: string;
    sunset?: string;
  }
): SmartTips {
  const isHot = temperature > 25;
  const isCold = temperature < 5;
  const isWindy = windSpeed > 20;
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode);
  const isStormy = [95, 96, 99].includes(weatherCode);

  const pressureTrend = options?.pressureTrend ?? 'stable';
  const pressureDiff = options?.pressureDiff ?? 0;
  const waterTemp = options?.waterTemp;
  const sunrise = options?.sunrise;
  const sunset = options?.sunset;

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

  // Barometer logic — append to weatherTip
  if (pressureTrend === 'rising') {
    weatherTip += '\n📈 Налягането се покачва — рибата е активна и хапе добре.';
  } else if (pressureTrend === 'falling') {
    weatherTip += '\n📉 Падащо налягане — рибата е пасивна. Очаквайте бавна хапка.';
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

  // Water temperature tip (appended to weatherTip)
  if (waterTemp != null) {
    if (waterTemp < 6) {
      weatherTip += '\n🌊 Студена вода — рибата е вяла. Ловете бавно и дълбоко.';
    } else if (waterTemp > 22) {
      weatherTip += '\n🌊 Топла вода — ловете рано сутринта или след залез.';
    }
  }

  // Timing tip — use real sunrise/sunset when available
  let timingTip: string;
  if (isHot) {
    timingTip = '🕐 Най-добро време: 05:00–08:00 и 19:00–22:00';
  } else if (isCold) {
    timingTip = '🕐 Най-добро време: 11:00–15:00 (по-топлата част на деня)';
  } else if (sunrise && sunset && sunrise !== '--:--' && sunset !== '--:--') {
    const addHour = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    const subHour = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return `${String(Math.max(h - 1, 0)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };
    timingTip = `🕐 Най-добро време: ${sunrise} — ${addHour(sunrise)} и ${subHour(sunset)} — ${sunset}`;
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

  // Cold water: suggest smaller lures, slow animation
  if (waterTemp != null && waterTemp < 6 && !isCold) {
    fishingStyleTip += ' Използвайте по-малки примамки и бавна анимация.';
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
