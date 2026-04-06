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

export type TimePeriod = 'morning' | 'day' | 'evening' | 'night';

export function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

export function getTimePeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'morning': return 'тази сутрин';
    case 'day': return 'през деня';
    case 'evening': return 'тази вечер';
    case 'night': return 'през нощта';
  }
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
    timePeriod?: TimePeriod;
    isInPeak?: boolean;
    peakType?: 'major' | 'minor' | null;
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
  const sunrise = options?.sunrise ?? '06:00';
  const sunset = options?.sunset ?? '20:00';
  const timePeriod = options?.timePeriod ?? getTimePeriod(new Date().getHours());
  const isInPeak = options?.isInPeak ?? false;
  const peakType = options?.peakType ?? null;
  const timeLabel = isInPeak ? 'в момента' : getTimePeriodLabel(timePeriod);

  // Weather-based tip
  let weatherTip: string;
  if (isStormy) {
    weatherTip = '⚠️ Бурно време — избягвайте откритите водоеми. Безопасността е на първо място!';
  } else if (isHot) {
    weatherTip = timePeriod === 'morning'
      ? '🌡️ Горещо време — използвай сутрешния хлад, рибата е активна тази сутрин.'
      : timePeriod === 'evening'
      ? '🌡️ Горещо време — вечерната прохлада раздвижва рибата тази вечер.'
      : timePeriod === 'night'
      ? '🌡️ Горещо време — нощта е най-добрият момент, рибата е на повърхността.'
      : '🌡️ Горещо време (над 25°C) — рибата е на дълбочина през деня. Чакай вечерта.';
  } else if (isCold) {
    weatherTip = '❄️ Студено време — рибата е по-бавна. Използвайте бавни презентации и малки стръвки.';
  } else if (isRainy) {
    weatherTip = `🌧️ Дъждовно — дъждът насища водата с кислород. Отличен момент за риболов ${timeLabel}!`;
  } else {
    weatherTip = `✅ Приятно време — добри условия за риболов ${timeLabel}.`;
  }

  // Night-specific moon illumination additions
  if (timePeriod === 'night' && moon.illumination != null) {
    if (moon.illumination >= 70) {
      weatherTip += '\n🌕 Ярката луна прави хищниците по-предпазливи — търси ги в сянка.';
    } else if (moon.illumination <= 30) {
      weatherTip += '\n🌑 Тъмната нощ активира хищниците — сулката и сомът ловуват смело.';
    }
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
    windTip = `💨 Силен вятър ${timeLabel} — използвайте по-тежки тежести (40-60г) и ловете от подветрената страна.`;
  } else if (windSpeed > 10) {
    windTip = `🍃 Умерен вятър ${timeLabel} — лек бриз помага за разбъркване на водата. Добри условия.`;
  } else {
    windTip = `🪶 Тихо ${timeLabel} — спокойна вода. Използвайте по-деликатни монтажи и по-тънко влакно.`;
  }

  // Timing tip — solunar peak override first
  const addHourFn = (t: string, hours = 1) => {
    const [h, m] = t.split(':').map(Number);
    return `${String(Math.min(h + hours, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  const subHourFn = (t: string, hours = 1) => {
    const [h, m] = t.split(':').map(Number);
    return `${String(Math.max(h - hours, 0)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  const addMinFn = (t: string, mins: number) => {
    const [h, m] = t.split(':').map(Number);
    const total = h * 60 + m + mins;
    const nh = Math.min(23, Math.floor(total / 60));
    const nm = total % 60;
    return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
  };

  let timingTip: string;
  if (isInPeak && peakType === 'major') {
    timingTip = '🎣 Сега е главен солунарен пик! Рибата е максимално активна в момента. Хвърляй веднага — не губи време!';
  } else if (isInPeak && peakType === 'minor') {
    timingTip = '🎣 В момента тече малък солунарен пик. Активността е умерена — опитай но не очаквай агресивна хапка.';
  } else if (timePeriod === 'morning') {
    timingTip = `🕐 Сутрешният прозорец е сега — ${sunrise} до ${addMinFn(sunrise, 90)} е пиковото време. Не го пропускай.`;
  } else if (timePeriod === 'day') {
    timingTip = `🕐 През деня активността е намалена. Следващият добър прозорец е около залез — ${subHourFn(sunset)}.`;
  } else if (timePeriod === 'evening') {
    timingTip = `🕐 Вечерният прозорец е сега — ${subHourFn(sunset)} до ${addMinFn(sunset, 30)} е най-активното. Хвърляй сега!`;
  } else {
    // night
    timingTip = `🕐 Нощен риболов — активни са сом, сулка и щука. Следващият сутрешен прозорец е ${sunrise}.`;
  }

  // Smart fishing style based on conditions + time period
  let fishingStyleTip: string;
  if (isStormy) {
    fishingStyleTip = '🎣 Не се препоръчва риболов при буря!';
  } else if (timePeriod === 'night' && !isStormy) {
    fishingStyleTip = '🎣 Нощем хищниците излизат на лов. Използвай по-едри примамки с активна игра — тъмни цветове или фосфоресциращи. Сомът реагира на вибрация — опитай на кльонк или едра мъртва рибка.';
  } else if (isWindy && isHot) {
    fishingStyleTip = '🎣 Фидер риболов на дъно в дълбоки участъци — вятърът и топлината карат рибата надолу.';
  } else if (isWindy) {
    fishingStyleTip = '🎣 Дънен риболов с тежък фидер монтаж от подветрената страна.';
  } else if (timePeriod === 'morning') {
    fishingStyleTip = '🎣 Сутрешната активност е висока — използвай по-леки такъми и повърхностни примамки. Рибата се храни активно.';
  } else if (timePeriod === 'evening') {
    fishingStyleTip = '🎣 Вечерта хищниците излизат на лов — по-едри примамки с активна игра. Мирните риби се хранят на плитко.';
  } else if (isHot) {
    fishingStyleTip = '🎣 Спининг рано сутрин или нощен риболов с поплавък — рибата е активна в хладните часове.';
  } else if (isRainy) {
    fishingStyleTip = `🎣 Поплавъчен риболов — дъждът активизира рибата в плитчините ${timeLabel}.`;
  } else if (isCold) {
    fishingStyleTip = '🎣 Финес риболов с микро джиг или дроп-шот — бавни и деликатни движения.';
  } else if (timePeriod === 'day') {
    fishingStyleTip = '🎣 През деня рибата е по-дълбоко — по-бавни презентации и търпение. Търси сенчести участъци.';
  } else {
    fishingStyleTip = moon.fishingStyleTip;
  }

  // Smart baits based on conditions and target fish
  let baits: BaitInfo[];
  let tackle: TackleInfo[];
  let targetFish: TargetFish[];

  if (timePeriod === 'night') {
    targetFish = [
      { name: 'Сом', icon: '🐋' },
      { name: 'Сулка', icon: '🐟' },
      { name: 'Щука', icon: '🐡' },
    ];
    baits = [
      { name: 'Жива стръв', icon: '🦐' },
      { name: 'Мъртва рибка', icon: '🐟' },
      { name: 'Бойли', icon: '🟤' },
      { name: 'Фосфор. примамки', icon: '💡' },
    ];
    tackle = [
      { name: 'Куки №2-6', icon: '🪝' },
      { name: 'Тежест 40-60г', icon: '⚓' },
      { name: 'Влакно 0.30+', icon: '🧵' },
      { name: 'Кльонк монтаж', icon: '🎣' },
    ];
  } else if (isHot) {
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
