export const adviceIconMap = {
  // СТРЪВ - Естествена
  "Фини червеи": "earthworms-small.svg",
  "Едри червеи": "earthworms-large.svg",
  "Живци": "live-baitfish.svg",
  "Мъртва рибка": "dead-fish.svg",
  "Скакалци": "grasshopper.svg",
  "Личинки": "maggots.svg",
  "Мотил": "bloodworm.svg",
  "Раци": "crayfish.svg",
  "Червеи": "earthworms-small.svg",
  "Жива стръв": "live-baitfish.svg",
  "Ларви": "maggots.svg",

  // СТРЪВ - Растителна
  "Царевица": "corn.svg",
  "Тесто": "dough.svg",
  "Хляб": "bread.svg",
  "Грахова каша": "pea-mash.svg",
  "Картоф": "potato.svg",

  // СТРЪВ - Бойли/Пелети
  "Малки бойли": "boilies-small.svg",
  "Средни бойли": "boilies-medium.svg",
  "Големи бойли": "boilies-large.svg",
  "Плуващи бойли": "boilies-popup.svg",
  "Пелети": "pellets.svg",
  "Method mix": "method-mix.svg",
  "Бойли": "boilies-small.svg",

  // СТРЪВ - Изкуствена
  "Силиконови примамки": "soft-lure.svg",
  "Въртящи блесни": "spinner.svg",
  "Колебливи блесни": "spoon.svg",
  "Джигове": "jig.svg",
  "Попери": "popper.svg",
  "Крънкбейт": "crankbait.svg",
  "Туистери": "twister.svg",
  "Микро джиг": "micro-jig.svg",
  "Спинери": "spinner.svg",
  "Фосфор. примамки": "phosphor-lure.svg",

  // ТАКЪМИ - Куки
  "Куки №12-14": "hook-12-14.svg",
  "Куки №8-10": "hook-8-10.svg",
  "Куки №4-6": "hook-4-6.svg",
  "Куки №1-2": "hook-1-2.svg",
  "Тройни куки": "treble-hook.svg",
  "Офсетни куки": "offset-hook.svg",
  "Куки №6-8": "hook-6-8.svg",
  "Куки №10-12": "hook-10-12.svg",
  "Куки №8-10": "hook-8-10.svg",
  "Куки №2-6": "hook-2-6.svg",
  "Куки №4-8": "hook-4-8.svg",
  "Куки №12-16": "hook-12-16.svg",
  "Куки №6-10": "hook-6-10.svg",

  // ТАКЪМИ - Влакна
  "Флуорокарбон 0.16": "fluoro-016.svg",
  "Флуорокарбон 0.20": "fluoro-020.svg",
  "Плетено влакно 0.12": "braid-012.svg",
  "Плетено влакно 0.18": "braid-018.svg",
  "Монофилно влакно": "mono-line.svg",
  "Влакно 0.18": "mono-018.svg",
  "Влакно 0.22": "mono-022.svg",
  "Влакно 0.30+": "mono-030.svg",
  "Флуорокарбон 0.25": "fluoro-025.svg",
  "Влакно 0.14-0.16": "mono-014-016.svg",
  "Влакно 0.22-0.25": "mono-022-025.svg",

  // ТАКЪМИ - Тежести
  "Лека тежест": "weight-light.svg",
  "Средна тежест": "weight-medium.svg",
  "Тежка тежест": "weight-heavy.svg",
  "Без тежест": "weight-none.svg",
  "Тежест 30-50г": "weight-30-50g.svg",
  "Тежест 40-60г": "weight-40-60g.svg",

  // ТАКЪМИ - Монтажи
  "Финес монтаж": "finesse-rig.svg",
  "Каролина риг": "carolina-rig.svg",
  "Тексас риг": "texas-rig.svg",
  "Дроп шот": "dropshot-rig.svg",
  "Поводков монтаж": "leader-rig.svg",
  "Метод фидер": "method-feeder.svg",
  "Фидер монтаж": "feeder-rig.svg",
  "Поплавък 2-4г": "float-2-4g.svg",
  "Дънен монтаж": "bottom-rig.svg",
  "Хранилка 40г": "feeder-40g.svg",
  "Кльонк монтаж": "quivertip-rig.svg",
  "Дроп-шот": "dropshot-rig.svg",
  "Тежък фидер": "heavy-feeder.svg",

  // ТЕХНИКИ
  "Бавно теглене": "slow-retrieve.svg",
  "Бързо теглене": "fast-retrieve.svg",
  "Twitching": "twitching.svg",
  "Jigging": "jigging.svg",
  "Троллинг": "trolling.svg",
  "Дънна риба": "bottom-fishing.svg",

  // ЛОКАЦИИ
  "Дълбока вода": "deep-water.svg",
  "Средна дълбочина": "mid-depth.svg",
  "Плитка вода": "shallow-water.svg",
  "При структури": "structure.svg",
  "Открита вода": "open-water.svg",
  "При брега": "shore.svg",

  // ВРЕМЕ
  "Ранна сутрин": "dawn.svg",
  "Сутрин": "morning.svg",
  "Обяд": "midday.svg",
  "След обяд": "afternoon.svg",
  "Вечер": "evening.svg",
  "Нощ": "night.svg",

  // УСЛОВИЯ
  "Бистра вода": "clear-water.svg",
  "Мътна вода": "murky-water.svg",
  "Течение": "current.svg",
  "Стояща вода": "still-water.svg",
  "След дъжд": "after-rain.svg",
  "Вятър": "windy.svg",

  // FALLBACK
  "default": "fishing-default.svg"
};

// Helper function
export const getAdviceIcon = (adviceText) => {
  return adviceIconMap[adviceText] || adviceIconMap.default;
};