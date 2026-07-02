import type { FishSpecies } from './fish-guide';
import type { MoonData } from './moon';
import type { WeatherData } from '@/hooks/use-weather';

export interface DailyAdvice {
  tip: string; // 3 sentences
  mistake: string | null; // 1 sentence or null
}

// Grammar helper: Get appropriate pronoun based on fish gender
export const getPronoun = (fish: FishSpecies): string => {
  return fish.gender === 'f' ? 'я' : 'го';
};

const CARP_FAMILY = ['Шаран', 'Амур', 'Толстолоб', 'Каракуда', 'Лин'];

// Per-species tackle specs (line diameter, hook size, lure/bait size)
interface FishSpecs {
  line: string;
  hooks: string;
  lure?: string;
  bait?: string;
}
const FISH_SPECS: Record<string, FishSpecs> = {
  // Predators
  'Костур':         { line: '0.25-0.35мм', hooks: '№4-8',     lure: 'воблери 7-12см' },
  'Щука':           { line: '0.30-0.40мм', hooks: '№2-6',     lure: 'воблери 10-15см' },
  'Сом':            { line: '0.50-0.80мм', hooks: '№2/0-8/0', lure: 'пеле, живец 15см+' },
  'Сулка':          { line: '0.28-0.35мм', hooks: '№2-4',     lure: 'воблери 8-12см' },
  'Распер':         { line: '0.20-0.28мм', hooks: '№6-10',    lure: 'блесни 5-8см' },
  // Peaceful
  'Пъстърва':       { line: '0.14-0.18мм', hooks: '№10-14',   bait: 'червей, паста' },
  'Дъгова пъстърва':{ line: '0.16-0.20мм', hooks: '№8-12',    bait: 'царевица, паста' },
  'Шаран':          { line: '0.28-0.40мм', hooks: '№4-8',     bait: 'царевица, бойли' },
  'Амур':           { line: '0.30-0.45мм', hooks: '№4-6',     bait: 'царевица, тесто' },
  'Толстолоб':      { line: '0.25-0.35мм', hooks: '№6-10',    bait: 'технопланктон' },
  'Каракуда':       { line: '0.22-0.30мм', hooks: '№8-12',    bait: 'царевица, пелети' },
  'Лин':            { line: '0.20-0.28мм', hooks: '№8-14',    bait: 'червей, царевица' },
  'Мряна':          { line: '0.16-0.22мм', hooks: '№10-16',   bait: 'червей, бял червей' },
  'Платика':        { line: '0.14-0.18мм', hooks: '№14-18',   bait: 'тесто, червей' },
  'Бабушка':        { line: '0.12-0.16мм', hooks: '№16-20',   bait: 'тесто, хлебна' },
  'Уклей':          { line: '0.08-0.12мм', hooks: '№18-22',   bait: 'бял червей, хлебна' },
  'Кефал':          { line: '0.16-0.20мм', hooks: '№10-14',   bait: 'хляб, тесто' },
};

// Grammatical gender for pronouns
const FEMININE = new Set(['Пъстърва','Дъгова пъстърва','Мряна','Платика','Бабушка','Каракуда','Сулка','Щука']);
function pronounAcc(name: string): string { return FEMININE.has(name) ? 'я' : 'го'; } // "makes it..."
function pronounDat(name: string): string { return FEMININE.has(name) ? 'ѝ' : 'му'; } // "to it"
function adjSuspicious(name: string): string { return FEMININE.has(name) ? 'подозрителна' : 'подозрителен'; }

function tackleHint(name: string, isPredator: boolean): string {
  const s = FISH_SPECS[name];
  if (s) return `влакно ${s.line}, куки ${s.hooks}`;
  return isPredator ? 'влакно 0.25-0.40мм, куки №4-8' : 'влакно 0.14-0.25мм, куки №10-16';
}

function windDirLabel(deg: number): string {
  if (deg >= 337.5 || deg < 22.5) return 'N';
  if (deg < 67.5) return 'NE';
  if (deg < 112.5) return 'E';
  if (deg < 157.5) return 'SE';
  if (deg < 202.5) return 'S';
  if (deg < 247.5) return 'SW';
  if (deg < 292.5) return 'W';
  return 'NW';
}

function isEastWind(deg: number): boolean {
  const d = windDirLabel(deg);
  return d === 'E' || d === 'NE' || d === 'SE';
}

function isSouthWind(deg: number): boolean {
  const d = windDirLabel(deg);
  return d === 'S' || d === 'SE' || d === 'SW';
}

function addHour(t: string): string {
  const [h, m] = t.split(':').map(Number);
  return `${String(Math.min(h + 1, 23)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function subHour(t: string): string {
  const [h, m] = t.split(':').map(Number);
  return `${String(Math.max(h - 1, 0)).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function wasRaining(weatherCode: number): boolean {
  return [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(weatherCode);
}

export function getDailyAdvice(
  fish: FishSpecies,
  moon: MoonData,
  weather: WeatherData | null,
  terrain: 'river' | 'lake',
  solunarContext?: { isInPeak: boolean; peakType: 'major' | 'minor' | null }
): DailyAdvice {
  const name = fish.name;
  const temp = weather?.temperature ?? 18;
  const wind = weather?.windSpeed ?? 5;
  const windDir = weather?.windDirection ?? 0;
  const wc = weather?.weatherCode ?? 0;
  const pt = weather?.pressureTrend ?? 'stable';
  const pRate = weather?.pressureChangeRate ?? 0;
  const sunrise = weather?.sunrise ?? '06:00';
  const sunset = weather?.sunset ?? '20:00';
  const altitude = weather?.altitude ?? 0;
  const month = new Date().getMonth() + 1;
  const illum = moon.illumination;
  const isFullMoon = illum >= 90;
  const isNewMoon = illum <= 10;
  const isWaxing = moon.phaseName.toLowerCase().includes('waxing');
  const isWaning = moon.phaseName.toLowerCase().includes('waning');
  const isCrescent = illum > 10 && illum < 40;
  const isPredator = fish.isPredator;
  const isOvercast = wc > 2;
  const isSunny = wc <= 1;
  const isRaining = wasRaining(wc);
  const hour = new Date().getHours();
  const isNight = hour >= 21 || hour < 5;
  const isMorning = hour >= 5 && hour < 10;
  const isEvening = hour >= 17 && hour < 21;
  const isDay = hour >= 10 && hour < 17;
  const isSunHours = isMorning || isDay;

  // Count negative factors
  const negatives: boolean[] = [
    pt === 'falling',
    temp < 5,
    isEastWind(windDir),
    isWaning,
  ];
  const negCount = negatives.filter(Boolean).length;

  // ——— SENTENCE 1: WHY ———
  let s1 = '';

  if (negCount >= 3) {
    s1 = `Днес условията са трудни — ${name} почти не се храни. Ако настояваш, пробвай`;
  } else if (Math.abs(pRate) > 3) {
    // Fast pressure change dominates
    if (pRate > 3) {
      s1 = `Налягането скача след бурята — ${name} е все още объркан, изчакай 2-3 часа преди да започне нормално да се храни.`;
    } else {
      if (name === 'Сом') {
        s1 = `Рязкото падане на налягането е изкарало сома от дупките — ловува агресивно, подготви се за сериозен удар.`;
      } else if (isPredator) {
        s1 = `Рязкото падане на налягането активира ${name} за кратко — действай бързо.`;
      } else {
        s1 = `Рязкото падане на налягането е притиснало ${name} — трудна и бавна хапка, захрани с малки порции.`;
      }
    }
  } else if (pt === 'rising' && pRate > 0) {
    s1 = `${name} усеща покачването на налягането и се активира.`;
  } else if (pt === 'falling') {
    s1 = `Падащото налягане притиска ${name} надолу — очаквай деликатна и бавна хапка.`;
  } else if (isNewMoon) {
    s1 = `${name} е в тъмнина и ловува смело — хапе по-агресивно от обичайното.`;
  } else if (isFullMoon) {
    if (name === 'Сом') {
      s1 = `При пълнолуние сомът се крие по-дълбоко — лови в облачна нощ или преди изгрев, не на открито при лунна светлина.`;
    } else if (isPredator) {
      s1 = `Пълнолунието е пик на активност за ${name} — използвай ${FISH_SPECS[name]?.lure ?? 'по-едри примамки'} с активна игра.`;
    } else {
      s1 = `Пълнолунието е активирало ${name} — захрани обилно и изчакай.`;
    }
  } else if (isCrescent && isWaxing) {
    s1 = `Растящият сърп вдига активността — условията се подобряват с всяка нощ.`;
  } else if (isWaning) {
    s1 = `Намаляващата луна успокоява ${name} — по-деликатен и търпелив риболов.`;
  } else if (temp < 5) {
    s1 = `${name} е в зимна апатия — движи се минимално, ${tackleHint(name, isPredator)}, малка стръв.`;
  } else if (temp >= 5 && temp <= 12) {
    s1 = `Хладната вода забавя ${name} но не го спира — по-малки порции, по-бавно водене.`;
  } else if (temp > 22 && !isPredator) {
    s1 = `${name} се е оттеглил на дълбочина и в сянка. При водоем — нощен риболов с царевица на косъм монтаж.`;
  } else if (temp > 22 && isPredator) {
    s1 = `Топлата вода е изкарала ${name} на дълбочина. Търси го в сянката на крайбрежната растителност рано сутринта.`;
  } else {
    // Use seasonal logic as fallback
    if (month >= 3 && month <= 4) {
      s1 = `Предпролетното раздвижване — ${name} излиза от зимния застой и започва активно да се храни.`;
    } else if (month >= 5 && month <= 6) {
      s1 = `Размножителният период разсейва ${name} — внимавай с местата, рибата пази гнездата си. Хапката може да е защитна реакция, не истинско хранене.`;
    } else if (month >= 7 && month <= 8) {
      s1 = `Летните жеги са изкарали ${name} на дълбочина и в сянка — рано сутринта е единственият добър прозорец.`;
    } else if (month >= 9 && month <= 10) {
      s1 = `Есенното хранене преди зимата — ${name} е активен и агресивен, яде почти всичко.`;
    } else {
      s1 = `Зимният студ е вкарал ${name} в минимална активност — бавен и деликатен риболов.`;
    }
  }

  // ——— ONE secondary addition to s1 (pick the most impactful) ———
  // Wind >40 overrides everything
  if (wind > 40) {
    s1 = `При такъв вятър ${name} е дезориентиран и почти не хапе — потърси защитено място зад завет.`;
  } else {
    // Pick at most ONE secondary factor to append
    let secondary = '';

    if (isEastWind(windDir) && !s1.includes('Източ')) {
      secondary = ` Източният вятър е капризен — ${name} може неочаквано да спре да се храни. Не сменяй постоянно местата, изчакай.`;
    } else if (wind > 20 && terrain === 'lake') {
      secondary = ` Вълните вкарват кислород и храна към брега — търси ${name} точно там, където вятърът бие в брега.`;
    } else if (wind > 25 && terrain === 'river') {
      secondary = ` Силният вятър разбърква водата — хвърляй по посока на течението.`;
    } else if (wind < 10 && !s1.includes('тихо') && !s1.includes('Тихо')) {
      secondary = ` Тихото огледално време ${pronounAcc(name)} прави по-${adjSuspicious(name)} — ${tackleHint(name, isPredator)}.`;
    } else if (isSouthWind(windDir)) {
      if (CARP_FAMILY.includes(name)) {
        secondary = ` Южният топъл вятър раздвижва шарановите — добър знак за деня.`;
      } else if (isPredator) {
        secondary = name === 'Сом'
          ? ` Южният топъл вятър раздвижва мустакатия — търси го в по-плитките зони вечер.`
          : ` Южният вятър активира ${name} — търси го в по-плитките зони.`;
      }
    } else if (terrain === 'river' && isRaining) {
      secondary = isPredator
        ? ` Мътната вода след дъжда е предимство — използвай силно вибриращи блесни и ярки цветове (оранжево, жълто).`
        : ` Мътната вода след дъжда е намалила видимостта — захрани по-обилно за да привлечеш ${name} към стръвта.`;
    } else if (isPredator && !s1.includes('цвет')) {
      if (isOvercast) {
        secondary = ` Облачното небе е твой съюзник — използвай ярки цветове: оранжево, жълто, шартрьоз.`;
      } else if (isSunny && isSunHours && name !== 'Распер') {
        secondary = ` Силното слънце е скрило ${name} в сянката на крайбрежните дървета и тръстиката — заложи на естествени цветове: сребристо, кафяво, зелено и търси го там.`;
      }
    } else if (altitude > 500 && altitude <= 1000) {
      secondary = ` На тази височина сезонът е малко по-закъснял — рибата е по-активна отколкото очакваш за месеца.`;
    }

    if (secondary) {
      s1 += secondary;
    }
  }

  // ——— SENTENCE 2: WHAT (technique) ———
  let s2 = '';

  // Specific fish with terrain logic
  if (name === 'Сом') {
    s2 = terrain === 'lake'
      ? `Опитай на кльонк с едра стръв — черен дроб или попово прасе.`
      : `От брега заложи на тежко с подводна плувка и едра стръв.`;
  }
  else if (name === 'Мряна') {
    s2 = terrain === 'river'
      ? `Търси го в бързеите и затишията зад камъните с тежък монтаж на изтичане.`
      : `Във водоема търси мряната по дъното близо до каменисти участъци с червей и по-тежко олово.`;
  }
  else if (name === 'Костур') {
    s2 = terrain === 'river'
      ? `Води малък туистер (3-5см) срещу течението с агресивни потрепвания — хапката е рязка.`
      : `Във водоема търси костура по ръба на дълбочината с джиг монтаж и бяло/жълто при мътна вода.`;
  }
  else if (name === 'Платика') {
    s2 = terrain === 'river'
      ? `Лови с фидер на течение — 40-50г кошница, червей или царевица, повод 40-60см.`
      : `Във водоема заложи на метод фийдър с царевица или пелети — търси платиката край тръстиката.`;
  }
  else if (name === 'Бабушка') {
    s2 = terrain === 'river'
      ? `Лови на ваглер в по-тихите участъци на реката с малко бял червей — хапката е деликатна.`
      : `Във водоема търси бабушката сутрин край повърхността с ваглер и бял червей на № 18 кука.`;
  }
  else if (name === 'Червеноперка') {
    s2 = terrain === 'river'
      ? `Лови с поплавък в затишията и заливите на реката — хляб и тесто работят отлично.`
      : `Във водоема търси червеноперката в тръстиката с червей или хляб на лек поплавъчен монтаж.`;
  }
  else if (name === 'Дъгова пъстърва') {
    s2 = terrain === 'river'
      ? `Води воблер срещу течението с кратки рипки — пъстървата атакува рязко и бързо.`
      : `В платен водоем хвърли спинер № 2-3 или паста на въдица — дъговата атакува агресивно.`;
  }
  else if (name === 'Бибан') {
    s2 = terrain === 'river'
      ? `Лови с малък джиг или туистер (5-7см) в затишията — биванът е агресивен но внимателен.`
      : `Във водоема търси бибана с джиг монтаж край дъното — активен е целогодишно.`;
  }
  else if (name === 'Скобар') {
    if (terrain === 'river') {
      s2 = `Търси го в бързеите и затишията зад камъните с тежък монтаж на изтичане.`;
      if (month >= 11 || month <= 2) {
        s2 = `Скобарът е групиран в бързеите — търси го на троха в течението.`;
      }
    } else {
      s2 = `Във водоема скобарът е рядкост — търси го по каменистото дъно с червей.`;
    }
  }
  else if (name === 'Кефал') {
    s2 = terrain === 'river'
      ? `Търси го в бързеите с хляб или тесто — кефалът обича кислородна вода.`
      : `Във водоема кефалът е рядък — опитай с хляб край брега в топли дни.`;
  }

  // Specific fish WITHOUT terrain logic
  else if (name === 'Уклей') {
    s2 = `Уклеят се държи в горния воден слой — търси го на повърхността с ваглер и бял червей при тихо време.`;
    if (wind < 10) s2 += ` Влакно 0.08-0.12мм и куки №18-22 са задължителни.`;
  }
  else if (name === 'Сулка') {
    if (isFullMoon || illum >= 80) {
      s2 = `Пълнолунието активира сулката — хвърли воблер 10см край дълбоките брегове след залез. Бяло или сребристо при тъмнина.`;
    } else if (isNewMoon) {
      s2 = `Новолунието е златно време за сулка — лови с джиг на дъното в пълна тъмнина, бяло или фосфоресциращо.`;
    } else {
      s2 = `Търси сулката на дълбочина с джиг монтаж — живец или воблер 7-12см край стръмните брегове.`;
    }
  }
  else if (name === 'Распер') {
    s2 = `Използвай кастмастер или попер и води изключително бързо — хвърляй точно в центъра на плясъка веднага щом го видиш.`;
    if (isSunny && terrain === 'river') {
      s2 += ` При силно слънце търси го в бързеите където водата е богата на кислород.`;
    }
    s2 += ` Среща се в р. Дунав и долните течения на Марица, Тунджа и Арда.`;
  }
  else if ((name === 'Шаран' || name === 'Амур') && temp > 25) {
    s2 = `Лови през нощта или на много голяма дълбочина с царевица на косъм монтаж.`;
  }
  else if ((name === 'Пъстърва' || name === 'Дъгова пъстърва')) {
    s2 = `Бистрата вода разкрива всичко — застани срещу течението, бавни движения, без сянка.`;
  }
  else if ((name === 'Костур' || name === 'Щука') && (month >= 9 && month <= 10)) {
    s2 = `Есента е времето на хищника — ${name} полудява, агресивен е и атакува всяка примамка с активна игра.`;
  }
  else if ((name === 'Платика' || name === 'Бабушка') && wind > 20 && terrain === 'lake') {
    s2 = `Вълните от вятъра вкарват храна към брега — търси ${name} точно там.`;
  }

  // Generic fallback based on terrain
  else if (terrain === 'lake') {
    if (isPredator) {
      s2 = `Хвърли воблер с активна игра край водната растителност като заложиш на ${
        isSunny && isSunHours
          ? 'естествени цветове заради силното слънце'
          : 'по-контрастни цветове при ниска светлина или облачно небе'
      }.`;
    } else {
      if (temp < 12) {
        s2 = `В студена вода на водоем дръж стръвта близо до дъното и захранвай на малки порции с по-фина смес.`;
      } else {
        s2 = `На по-топъл водоем търси ${name} по ръба на плиткото и храни по-ритмично с царевица или пелети на пружина.`;
      }
    }
  } else {
    // River
    if (isPredator) {
      s2 = `Води ${fish.baseData.lures ? 'примамката' : 'стръвта'} бързо срещу течението — ${name} атакува само бърза и точна примамка.`;
    } else {
      s2 = `При течение лови на тежко — 40-50г олово, кратък повод с торен червей или царевица.`;
    }
  }

  // ——— SENTENCE 3: WHEN (time-period aware) ———
  let s3 = '';
  // Solunar peak override
  if (solunarContext?.isInPeak) {
    const pLabel = solunarContext.peakType === 'major' ? 'главен' : 'малък';
    s3 = `🎣 Хвърляй веднага — в момента тече ${pLabel} солунарен пик!`;
  } else if (isNight && !isPredator) {
    s3 = `Мирните риби са неактивни през нощта. Опитай утре от ${sunrise}.`;
  } else if (isNight && isPredator) {
    s3 = `Нощем ${name} е в своята стихия — хвърляй сега, активността е висока.`;
  } else if (isMorning) {
    s3 = `Най-добрият прозорец е сега — между ${sunrise} и ${addHour(sunrise)}.`;
  } else if (isEvening) {
    const sunsetPlus30 = (() => {
      const [h, m] = sunset.split(':').map(Number);
      const total = h * 60 + m + 30;
      return `${String(Math.min(23, Math.floor(total / 60))).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    })();
    s3 = `Вечерният прозорец е сега — активността ще се засили до ${sunsetPlus30}.`;
  } else if (isDay) {
    if (temp > 25) {
      s3 = `Най-добрият прозорец е минал. Следващият добър момент е около ${subHour(sunset)}.`;
    } else if (temp < 5) {
      s3 = `Най-топлите часове около обяд са единственият шанс днес.`;
    } else {
      s3 = `През деня чакай търпеливо. Следващият добър момент е около ${subHour(sunset)}.`;
    }
  } else {
    s3 = `Около залез (${subHour(sunset)} — ${sunset}) активността ще се засили.`;
  }

  const tip = `${s1}\n${s2}\n${s3}`;

  // ——— SECTION 2: COMMON MISTAKE ———
  const mistake = getCommonMistake(fish, moon, weather, terrain);

  return { tip, mistake };
}

function getCommonMistake(
  fish: FishSpecies,
  moon: MoonData,
  weather: WeatherData | null,
  terrain: 'river' | 'lake'
): string | null {
  const name = fish.name;
  const isPredator = fish.isPredator;
  const illum = moon.illumination;
  const isFullMoon = illum >= 90;
  const isWaning = moon.phaseName.toLowerCase().includes('waning');
  const wc = weather?.weatherCode ?? 0;
  const isSunny = wc <= 1;
  const temp = weather?.temperature ?? 18;
  const wind = weather?.windSpeed ?? 5;
  const windDir = weather?.windDirection ?? 0;
  const hour = new Date().getHours();
  const isSunHours = hour >= 5 && hour < 17;
  const pRate = weather?.pressureChangeRate ?? 0;
  const isRaining = wasRaining(wc);
  const month = new Date().getMonth() + 1;

  // Condition 7 — Full moon + Сом (higher priority, check first)
  if (isFullMoon && name === 'Сом') {
    return `При пълнолуние много рибари търсят сома на плитко — грешка. Мустакатият се е скрил на дълбочина, търси го там.`;
  }

  // Condition 1 — Full moon + sunny
  if (isFullMoon && isSunny) {
    return `Пълнолунието и бистрата вода правят ${name} изключително подозрителна — дебело влакно и ярки цветове ще я изплашат преди да хапе.`;
  }

  // Condition 2 — Pressure falling fast + non-predator
  if (pRate < -3 && !isPredator) {
    return `При рязко падащо налягане много рибари захранват обилно — грешка. Рибата е пасивна и малките порции работят по-добре.`;
  }

  // Condition 11 — Rising fast pressure after storm
  if (pRate > 3) {
    return `Налягането скача след бурята — много рибари бързат да хвърлят. Изчакай 2-3 часа докато рибата се ориентира.`;
  }

  // Condition 3 — East wind
  if (isEastWind(windDir)) {
    return `Източният вятър кара рибарите да сменят постоянно местата — грешка. Изчакай търпеливо на едно място.`;
  }

  // Condition 4 — Cold + predator
  if (temp < 5 && isPredator) {
    return `В студена вода едрите примамки са грешка — ${name} не преследва нищо. Мини на ${tackleHint(name, isPredator)} с малка стръв.`;
  }

  // Condition 5 — Sunny + predator
  if (isSunny && isSunHours && isPredator) {
    return `В слънчево време много рибари хвърлят на открито — грешка. ${name} е в сянката на крайбрежните дървета и тръстиката.`;
  }

  // Condition 6 — Rain + Водоем
  if (isRaining && terrain === 'lake') {
    return `След дъжд много рибари очакват мътна вода във водоема — тя остава бистра. Не сменяй примамките към ярки цветове.`;
  }

  // Condition 8 — Wind >20 + non-predator + Река
  if (wind > 20 && !isPredator && terrain === 'river') {
    return `При силен вятър на река захранката се разнася от течението — хвърляй по-тежка захранка или смени на по-тихо място.`;
  }

  // Condition 9 — Spawning months
  if (month >= 5 && month <= 6) {
    return `В размножителния период рибата пази гнездата си — не тълкувай хапката като хранене, може да е защитна реакция.`;
  }

  // Condition 10 — Waning moon + predator
  if (isWaning && isPredator) {
    return `Намаляващата луна успокоява ${name} — ярките и шумни примамки са грешка днес, мини на деликатни и естествени цветове.`;
  }

  return null;
}
