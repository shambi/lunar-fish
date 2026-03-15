const SYNODIC_MONTH = 29.53058867;
const KNOWN_NEW_MOON = new Date('2000-01-06T18:14:00Z').getTime();

export interface BaitInfo {
  name: string;
  icon: string;
}

export interface TackleInfo {
  name: string;
  icon: string;
}

export interface TargetFish {
  name: string;
  icon: string;
}

export interface MoonData {
  phase: number;
  phaseName: string;
  phaseNameBg: string;
  illumination: number;
  emoji: string;
  fishingScore: number; // 1-5
  fishingLabel: string;
  fishingTip: string;
  fishingStyleTip: string;
  baits: BaitInfo[];
  tackle: TackleInfo[];
  targetFish: TargetFish[];
}

function getMoonAge(date: Date): number {
  const diff = date.getTime() - KNOWN_NEW_MOON;
  const days = diff / (1000 * 60 * 60 * 24);
  return ((days % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;
}

export function getMoonData(date: Date = new Date()): MoonData {
  const age = getMoonAge(date);
  const phase = age / SYNODIC_MONTH;

  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  let phaseName: string;
  let phaseNameBg: string;
  let emoji: string;
  if (phase < 0.0335) { phaseName = 'New Moon'; phaseNameBg = 'Новолуние'; emoji = '🌑'; }
  else if (phase < 0.215) { phaseName = 'Waxing Crescent'; phaseNameBg = 'Растящ сърп'; emoji = '🌒'; }
  else if (phase < 0.285) { phaseName = 'First Quarter'; phaseNameBg = 'Първа четвърт'; emoji = '🌓'; }
  else if (phase < 0.465) { phaseName = 'Waxing Gibbous'; phaseNameBg = 'Растяща луна'; emoji = '🌔'; }
  else if (phase < 0.535) { phaseName = 'Full Moon'; phaseNameBg = 'Пълнолуние'; emoji = '🌕'; }
  else if (phase < 0.715) { phaseName = 'Waning Gibbous'; phaseNameBg = 'Намаляваща луна'; emoji = '🌖'; }
  else if (phase < 0.785) { phaseName = 'Last Quarter'; phaseNameBg = 'Последна четвърт'; emoji = '🌗'; }
  else if (phase < 0.9665) { phaseName = 'Waning Crescent'; phaseNameBg = 'Намаляващ сърп'; emoji = '🌘'; }
  else { phaseName = 'New Moon'; phaseNameBg = 'Новолуние'; emoji = '🌑'; }

  let fishingScore: number;
  let fishingLabel: string;
  let fishingTip: string;
  let fishingStyleTip: string;
  let baits: BaitInfo[];
  let tackle: TackleInfo[];
  let targetFish: TargetFish[];

  if (phaseName === 'New Moon' || phaseName === 'Full Moon') {
    fishingScore = 5;
    fishingLabel = 'Отлично';
    fishingTip = phaseName === 'Full Moon'
      ? 'Силното приливно течение увеличава активността на рибата. Нощният риболов е идеален!'
      : 'Тъмнината при новолуние прави рибата по-смела — хапе по-агресивно.';
    fishingStyleTip = phaseName === 'Full Moon'
      ? '🎣 Нощен риболов с поплавък или фидер — перфектен избор!'
      : '🎣 Спининг с тъмни примамки — рибата е активна и агресивна.';
    baits = [
      { name: 'Червеи', icon: '🪱' },
      { name: 'Царевица', icon: '🌽' },
      { name: 'Бойли', icon: '🟤' },
      { name: 'Жива стръв', icon: '🦐' },
    ];
    tackle = [
      { name: 'Куки №6-8', icon: '🪝' },
      { name: 'Фидер монтаж', icon: '🎣' },
      { name: 'Флуорокарбон 0.20', icon: '🧵' },
      { name: 'Тежест 30-50г', icon: '⚓' },
    ];
    targetFish = [
      { name: 'Шаран', icon: '🐟' },
      { name: 'Каракуда', icon: '🐠' },
      { name: 'Сом', icon: '🐋' },
      { name: 'Бяла риба', icon: '🐡' },
    ];
  } else if (phaseName === 'Waxing Gibbous' || phaseName === 'Waning Gibbous') {
    fishingScore = 4;
    fishingLabel = 'Много добро';
    fishingTip = 'Високата осветеност поддържа рибата активна по изгрев и залез.';
    fishingStyleTip = '🎣 Поплавъчен риболов рано сутрин — златно време за клен и каракуда.';
    baits = [
      { name: 'Тесто', icon: '🍞' },
      { name: 'Пеле', icon: '🟡' },
      { name: 'Червеи', icon: '🪱' },
      { name: 'Царевица', icon: '🌽' },
    ];
    tackle = [
      { name: 'Куки №10-12', icon: '🪝' },
      { name: 'Поплавък 2-4г', icon: '🎣' },
      { name: 'Влакно 0.18', icon: '🧵' },
      { name: 'Лека тежест', icon: '⚓' },
    ];
    targetFish = [
      { name: 'Клен', icon: '🐟' },
      { name: 'Каракуда', icon: '🐠' },
      { name: 'Платика', icon: '🐡' },
    ];
  } else if (phaseName === 'First Quarter' || phaseName === 'Last Quarter') {
    fishingScore = 3;
    fishingLabel = 'Добро';
    fishingTip = 'Умерени приливи. Най-добри резултати около изгрев и залез.';
    fishingStyleTip = '🎣 Фидер риболов на дъно — стабилен и надежден подход за деня.';
    baits = [
      { name: 'Ларви', icon: '🪱' },
      { name: 'Хляб', icon: '🍞' },
      { name: 'Пеле', icon: '🟡' },
      { name: 'Миди', icon: '🦪' },
    ];
    tackle = [
      { name: 'Куки №8-10', icon: '🪝' },
      { name: 'Дънен монтаж', icon: '🎣' },
      { name: 'Влакно 0.22', icon: '🧵' },
      { name: 'Хранилка 40г', icon: '⚓' },
    ];
    targetFish = [
      { name: 'Костур', icon: '🐟' },
      { name: 'Бабушка', icon: '🐠' },
      { name: 'Мряна', icon: '🐡' },
    ];
  } else {
    fishingScore = 2;
    fishingLabel = 'Задоволително';
    fishingTip = 'По-тихи периоди на хранене. Опитайте по-дълбоки води и бавни презентации.';
    fishingStyleTip = '🎣 Риболов на дъно с търпение — използвайте финес техники.';
    baits = [
      { name: 'Фини червеи', icon: '🪱' },
      { name: 'Малки бойли', icon: '🟤' },
      { name: 'Тесто', icon: '🍞' },
      { name: 'Царевица', icon: '🌽' },
    ];
    tackle = [
      { name: 'Куки №12-14', icon: '🪝' },
      { name: 'Финес монтаж', icon: '🎣' },
      { name: 'Флуорокарбон 0.16', icon: '🧵' },
      { name: 'Лека тежест', icon: '⚓' },
    ];
    targetFish = [
      { name: 'Каракуда', icon: '🐠' },
      { name: 'Червеноперка', icon: '🐟' },
      { name: 'Уклей', icon: '🐡' },
    ];
  }

  return { phase, phaseName, phaseNameBg, illumination, emoji, fishingScore, fishingLabel, fishingTip, fishingStyleTip, baits, tackle, targetFish };
}
