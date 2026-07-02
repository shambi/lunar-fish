# Дизайн одит — Централен екран

Read-only одит на визуалния дизайн, реално използван в кода. Обхваща:
циферблата (`SolunarDial`), почасовата прогноза, лунната карта/hero,
солунарните индикатори, златния час, "Условия днес", времевия bento grid,
многодневната прогноза и вятърния компас.

**Извън обхват:** рибните карти (`src/components/FishGuide.tsx`).

Прегледани файлове:
- `src/pages/Index.tsx` (главен екран: `SolunarDial` + `Index`)
- `src/components/ForecastCards.tsx` (3-дневна прогноза)
- `src/components/WindCompass.tsx` (вятърен компас)
- `src/components/SolunarInfoModal.tsx` (модал "За солунарната теория")
- `src/index.css` (keyframes, CSS custom properties)
- `tailwind.config.ts` (font/radius токени)

---

## 1. ЦВЕТОВЕ

### 1.1 Основна палитра (hex, реално използвани)

| Цвят | Хекс | Употреба |
|---|---|---|
| Primary accent (teal) | `#2eb5b7` | иконки (слънце/луна на циферблата, времеви иконки, компас), border/glow акценти, точка на активния индикатор, централна точка на циферблата |
| Bright accent (light teal) | `#5cd8da` | вторични иконки в "Условия днес" (облак, вятър, лупа), текст на "Стил на риболов", компас посоки N/E/S/W |
| Accent highlight (citron) | `#C8E63C` | активни/наблегнати стойности — вердикт "Златен час"/"пик", major солунарна дъга, зенит/надир таг, sunrise/sunset стрелки, налягане (pressure sparkline + trend текст), "Светлина"/"Търси рибата" стойности, alert border (жълт код), bonus риба икона |
| Danger/alert red | `#DC3C3C` | текст на червен метео-код |
| Warning orange | `#FF8C42` | силен вятър — заглавие/ефект текст, wind-warning overlay icon, alert border (оранжев код) |
| Primary text | `#dee4e3` | час в центъра на циферблата, стрелка на часовника (rgba вариант), почасова температура, стойност в wind-compass tooltip, компас стрелка център |
| Secondary text | `#869393` | label-и "Солунарна активност"/"Условия"/"Прогноза" заглавия, info икона, почасов час label |
| Muted/dim text | `#a8b4b4` | subtitle под вердикта, ИЗГРЕВ/ЗАЛЕЗ label-и, "Светлина"/"Търси рибата" детайл текст, moon fact текст |
| Tile border/divider | `#3d4949` | dropdown chevron за почасова прогноза, wind arrow "опашка", divider над "За теорията" (модал) |
| Tile surface (dark) | `#0f1415`, `#0B0F1A` | tooltip фон (компас, метео alert), модал фон, точка в центъра на циферблата (`#0B0F1A`), wind-warning badge фон |
| Card surface variant | `#1b2121` | divider `borderTop` под лунния факт, divider в SolunarInfoModal |
| Divider (bento redes.) | `#252b2b` | border-bottom между редовете в "Условия днес" |
| Бяло / near-white | `#fff`, `#FFFFFF`, `#E2E8F0`, `#EAF7FF` | изгрев/залез стойности (`#fff`), фазово име на луната (`#E2E8F0`), заглавие "Условия" интерпретация (`#EAF7FF`), дата/temp/вятър стойности в прогнозата (`#FFFFFF`) |
| Мека сиво-синя (мета текст) | `#94A3B8` | дата под лога, локация текст, "утре/вдругиден" label, лунна фаза в прогнозата |
| Стабилно налягане dot | `#7F93A8` | неутрален индикатор (dot + вердикт цвят по подразбиране) |
| Overcast/danger text (light) | `#ffb4ab` | "Внимание" override блок — заглавие и текст |

### 1.2 RGBA стойности по предназначение

**Фонове на секции/контейнери:**
- `rgba(255,255,255,0.03)` — фон на секциите "Солунарна активност", "Условия днес", "Условия" (`bg-white/[0.03]`), плочки в bento grid
- `rgba(255,255,255,0.03)` (модал) — фон на кутийки с обяснителен текст в `SolunarInfoModal`

**Borders:**
- `rgba(46,181,183,0.25)` — border на "Солунарна активност" секция (0.5px)
- `rgba(255,255,255,0.07)` — border на "Условия днес" секция и bento плочки (`border-white/5`)
- `rgba(255,255,255,0.06)` — border на "Условия" bento контейнер, border на dropdown лунен факт панел
- `rgba(46,181,183,0.35)` — border на DECISION BANNER, когато `glow=true`
- `rgba(255,255,255,0.06)` — border на DECISION BANNER, когато `glow=false`
- `rgba(46,181,183,0.18)` — border на dropdown "лунна информация" pill
- `rgba(255,255,255,0.05)` — border на модалните кутии (SolunarInfoModal)
- `rgba(46,181,183,0.5)` — border на wind-compass tooltip
- `rgba(46,181,183,0.4)` — border на "Сподели" бутон (footer)
- `rgba(255,180,171,0.25)` — border на override "Внимание" блок

**Текстови rgba варианти (opacity-адаптиран основен цвят):**
- `rgba(222,228,227,0.85)` — телесен текст в "Условия днес" (времеви/вятър tip), лунна информация pill текст, модал текст (SolunarInfoModal)
- `rgba(222,228,227,0.75)` — label "Светлина"/"Търси рибата"
- `rgba(222,228,227,0.7)` — часовникова стрелка (SVG stroke)
- `rgba(234,247,255,0.65)` — обяснителен текст под DECISION BANNER (`getScoreReason`)
- `rgba(127,147,168,0.95)` — ефект текст под "Условия" интерпретация; времетраене на пиковете в модала
- `rgba(255,255,255,0.8)` — footer текст ("Наслука!", data source), loading текст за времето
- `rgba(255,255,255,0.4)` — loading текст за солунарен dial fallback
- `rgba(255,180,171,0.9)` — текст на override "Внимание" съдържание

**Функционални/сигнални rgba:**
- `rgba(200,230,60,0.4)` / `.6` / `.8` / `.12` / `.1` / `.08` — citron glow/фон варианти (major арка glow, зенит/надир таг фон, bonus риба fill, alert tooltip фон/border)
- `rgba(220,60,60,0.4)` / `.6` — червен alert border/tooltip
- `rgba(255,140,66,0.4)` / `.6` — оранжев alert border/tooltip
- `rgba(147,0,10,0.15)` — фон на override "Внимание" блок
- `rgba(235,140,89,0.05)` — ден полукръг фон на циферблата
- `rgba(46,181,183,0.03)` — нощ полукръг фон на циферблата
- `rgba(134,147,147,0.55)` / `.4` / `.12` — циферблатни щрихи (major/minor tick marks) и часови цифри (00/06/12/18)
- `rgba(92,216,218,0.25)` — точка в "Търси рибата" икона

---

## 2. ГРАДИЕНТИ

| Селектор/елемент | CSS |
|---|---|
| Fixed фонов слой №1 (цяло приложение, зад централния екран) | `background: linear-gradient(to bottom, hsl(var(--ocean)) 40%, hsl(var(--background)), hsl(var(--background)));` (Tailwind: `bg-gradient-to-b from-ocean/40 via-background to-background`) |
| Fixed фонов слой №2 (radial ambient glow) | `background: radial-gradient(ellipse at top, hsl(190 70% 20% / 0.3) 0%, transparent 60%);` (Tailwind arbitrary: `bg-[radial-gradient(ellipse_at_top,hsl(190_70%_20%/0.3)_0%,transparent_60%)]`) |
| DECISION BANNER фон, когато `glow === true` (активен пик / score ≥ 4) | `background: linear-gradient(135deg, rgba(46,181,183,0.08), rgba(46,181,183,0.02));` |
| DECISION BANNER фон, когато `glow === false` | `background: rgba(255,255,255,0.03);` (плосък цвят, не градиент) |

Няма открити `radial-gradient` извън фиксирания ambient слой №2. Няма градиенти в `ForecastCards.tsx`, `WindCompass.tsx`, `SolunarInfoModal.tsx`.

---

## 3. ШРИФТОВЕ

### 3.1 Font-family регистър

- **Space Grotesk** — регистриран в Tailwind като `font-display` (`tailwind.config.ts:18`), зареден през Google Fonts import в `src/index.css:1`. Приложен глобално на `h1–h6` (`src/index.css:74-76`) и explicit чрез `className="font-display"` на: секционните заглавия "Солунарна активност" (`Index.tsx:194`), "Условия днес" (`Index.tsx:732`), "Условия" (`Index.tsx:933`), "Прогноза" (`ForecastCards.tsx:129`), и на "Фаза на луната" heading (`Index.tsx:642`).
- **Outfit** — глобален body шрифт (`src/index.css:71`, `@apply` чрез `font-family: 'Outfit', sans-serif`), а също explicit в `SolunarInfoModal.tsx` за телесен текст (`fontFamily: "'Outfit', sans-serif"`, линии 49, 71, 96).
- **monospace** (системен) — час в центъра на циферблата (`Index.tsx:363`, `fontFamily: 'monospace'`), subtitle под вердикта (`Index.tsx:210`), часови цифри 00/06/12/18 на циферблата (`Index.tsx:344-347`, `fontFamily="monospace"` в SVG `<text>`), N/E/S/W букви на компаса (`WindCompass.tsx:66-72`).
- **JetBrains Mono, monospace** — стойностите "Светлина" и "Търси рибата" в "Условия днес" (`Index.tsx:863-864`, `916-917`).
- **VT323 / Orbitron** — не са открити никъде в централния екран (`Index.tsx`, `ForecastCards.tsx`, `WindCompass.tsx`, `SolunarInfoModal.tsx`, `index.css`, `tailwind.config.ts`). Тези шрифтове съществуват само в `FishGuide.tsx` (рибните карти, извън обхвата на този одит) и там вече не се ползва Orbitron (заменен по-рано с системен sans-serif stack).

### 3.2 Font-size / weight / letter-spacing по елемент

| Елемент | font-size | font-weight | letter-spacing | Файл:ред |
|---|---|---|---|---|
| Секционно заглавие ("Солунарна активност" и др.) | `11px` (`text-[11px]`) | 600 (`font-semibold`) | `tracking-wider` (Tailwind ≈ 0.05em) | Index.tsx:194 |
| Вердикт ("Златен час" / "Голям солунарен пик") | `17px` | 600 | — | Index.tsx:208 |
| Subtitle под вердикта | `11px` | inherit (400) | — | Index.tsx:210 |
| Час в центъра на циферблата | `26px` | inherit | — | Index.tsx:363 |
| ИЗГРЕВ/ЗАЛЕЗ label | `9px` | inherit | — | Index.tsx:381, 385, 394, 398 |
| ИЗГРЕВ/ЗАЛЕЗ стойност | `13px` | 400 | — | Index.tsx:382, 386, 395, 399 |
| Лунна инфо pill текст | `12px` | inherit | — | Index.tsx:419 |
| Moon fact текст | `13px` | inherit | line-height 1.5 | Index.tsx:435, 437 |
| Фаза на луната (heading) | `text-xl` (20px) | 600 (`font-semibold`) | — | Index.tsx:642 |
| Осветеност % | `text-sm` (14px) | 500 (`font-medium`) | — | Index.tsx:645 |
| DECISION BANNER — score label | `text-lg` (18px) | 700 (`font-bold`) | — | Index.tsx:710 |
| DECISION BANNER — обяснение | `text-sm` (14px) | inherit | leading-relaxed | Index.tsx:714 |
| "Условия днес" body текст (tip редове) | `14px` | inherit | line-height 1.55 | Index.tsx:783, 802, 819 |
| "Внимание" override заглавие | `14px`(текст) / `11px`(label) | 600 | `0.05em` (label) | Index.tsx:760-764 |
| "Светлина"/"Търси рибата" label | `14px` | inherit | — | Index.tsx:861, 914 |
| "Светлина"/"Търси рибата" стойност | `13px` | 500 | — | Index.tsx:863-864, 916-917 |
| "Светлина"/"Търси рибата" детайл | `11px` | inherit | — | Index.tsx:867, 920 |
| "Условия" интерпретация — заглавие | `12px` (`text-[12px]`) | 500 (`font-medium`) | leading-tight | Index.tsx:968 |
| "Условия" интерпретация — ефект | `11px` (`text-[11px]`) | inherit | leading-snug | Index.tsx:969 |
| Bento grid стойности (темп/влага/м.н.в.) | `text-sm` (14px) | 700 (`font-bold`) | — | Index.tsx:984, 1022, 1028 |
| Bento grid label (ТЕМП./ВЛАГА/М.Н.В.) | `7px` (`text-[7px]`) | inherit, opacity 0.5 | — | Index.tsx:985, 1023, 1029 |
| Налягане стойност | `text-xs` (12px) | 700 (`font-bold`) | — | Index.tsx:1014 |
| Alert tooltip badge текст | `11px` | 600 | — | Index.tsx:1100 |
| Почасова температура | `11px` | 500 | — | Index.tsx:1232 |
| Почасов час label | `10px` | inherit | — | Index.tsx:1233 |
| Циферблатни часови цифри (00/06/12/18) | `9px` (SVG) | inherit | — | Index.tsx:344-347 |
| Зенит/Надир таг текст (SVG) | `6.5px` | 600 | `0.04em` | Index.tsx:282 |
| Прогноза — дата label | `text-[11px]` | inherit | — | ForecastCards.tsx:159 |
| Прогноза — луна фаза | `text-xs` (12px) | 500 (`font-medium`) | — | ForecastCards.tsx:166 |
| Прогноза — score label | `text-[11px]` | 600 (`font-semibold`) | — | ForecastCards.tsx:183 |
| Wind compass — км/ч стойност | `text-sm` (14px) | 700 (`font-bold`) | — | WindCompass.tsx:29 |
| Wind compass — "КМ/Ч" label | `7px` (`text-[7px]`) | inherit, opacity 0.5 | `tracking-wider` | WindCompass.tsx:30 |
| Wind compass — tooltip | `11px` | inherit | — | WindCompass.tsx:47 |
| Wind compass — N/E/S/W (SVG) | `5px` | 700 | — | WindCompass.tsx:66-72 |
| Модал — pill заглавия (Голям/Малък пик, Златен час) | `12px` | 500 | — | SolunarInfoModal.tsx:45, 67, 92 |
| Модал — времетраене на пика | `11px` | inherit | — | SolunarInfoModal.tsx:46, 68, 93 |
| Модал — обяснителен текст | `14px` | 400 | line-height 1.55 | SolunarInfoModal.tsx:49, 71, 96 |
| Модал — "За теорията" label/текст | `12px` | inherit | — | SolunarInfoModal.tsx:115, 125, 131 |

---

## 4. GLOW / СИЯНИЕ ЕФЕКТИ

### 4.1 Inline `box-shadow` / `filter` в компонентите

| Ефект | Код | Приложение | Файл:ред |
|---|---|---|---|
| Major солунарна дъга glow | `filter: drop-shadow(0 0 4px rgba(200,230,60,0.8)) drop-shadow(0 0 8px rgba(200,230,60,0.4));` | Major солунарен арк (SVG path) на циферблата | Index.tsx:255 |
| Луна hero glow | `filter: drop-shadow(0 0 20px hsl(180 80% 55% / 0.4));` | Емоджи на луната в hero секцията | Index.tsx:637 |
| DECISION BANNER glow (активен) | `box-shadow: 0 0 32px rgba(46,181,183,0.25);` (иначе `none`) | Рамка на DECISION BANNER, когато `glow === true` | Index.tsx:690 |
| Статус dot glow | `` box-shadow: `0 0 6px ${dot}` `` (динамичен цвят: `#2eb5b7` / `#C8E63C` / `#FF8C42` / `#7F93A8`) | Малката точка до "Условия" интерпретацията | Index.tsx:966 |
| Риба икони glow (Tailwind arbitrary) | `filter: drop-shadow(0 0 8px hsl(var(--primary) / 0.4));` (`drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]`) | Плуващите риба-икони в DECISION BANNER | Index.tsx:564 |
| Прогноза "най-добър ден" glow (Tailwind arbitrary) | `box-shadow: 0 0 12px hsl(var(--glow) / 0.3);` (`shadow-[0_0_12px_hsl(var(--glow)/0.3)]`) | Карта на по-добрия от двата прогнозни дни | ForecastCards.tsx:154 |
| Alarm badge glow (текстов) | `text-shadow: 0 0 8px rgba(200,230,60,0.6);` | "Златен час" заглавие в SolunarInfoModal | SolunarInfoModal.tsx:92 |

### 4.2 Backdrop blur (не glow, но замъгляващ ефект от същото семейство)

- `backdrop-blur-md` — DECISION BANNER (Index.tsx:684), "Условия" секция (Index.tsx:932), прогнозни карти (ForecastCards.tsx:152).

### 4.3 CSS `@keyframes` за пулсиращи/сияещи ефекти (`src/index.css`)

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 30px 10px hsl(180 80% 55% / 0.15), 0 0 60px 20px hsl(180 80% 55% / 0.08); }
  50%      { box-shadow: 0 0 40px 15px hsl(180 80% 55% / 0.25), 0 0 80px 30px hsl(180 80% 55% / 0.12); }
}
/* приложено на луна hero: animation: pulse-glow 4s ease-in-out infinite (Index.tsx:635) */

@keyframes moon-drift {
  0%, 100% { transform: translateX(0) translateY(0); }
  25%      { transform: translateX(4px) translateY(-3px); }
  50%      { transform: translateX(-2px) translateY(-6px); }
  75%      { transform: translateX(-4px) translateY(-2px); }
}
/* приложено заедно с pulse-glow: moon-drift 10s ease-in-out infinite (Index.tsx:635) */

@keyframes goldenPulse {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%      { opacity: 1; transform: scale(1.15); }
}
/* приложено на слънце/луна иконите в центъра на циферблата, само при goldenHour.isActive:
   animation: goldenPulse 1.8s ease-in-out infinite (Index.tsx:223, 230) */

@keyframes pulse-alert-yellow {
  0%, 100% { border-color: rgba(200, 230, 60, 0.3); }
  50%      { border-color: rgba(200, 230, 60, 0.85); }
}
@keyframes pulse-alert-orange {
  0%, 100% { border-color: rgba(255, 140, 66, 0.3); }
  50%      { border-color: rgba(255, 140, 66, 0.9); }
}
@keyframes pulse-alert-red {
  0%, 100% { border-color: rgba(220, 60, 60, 0.25); }
  50%      { border-color: rgba(220, 60, 60, 0.95); }
}
/* приложени на времевата иконка бутон при активен метео-alert (Index.tsx:1041, 1044, 1047):
   animation: pulse-alert-{yellow|orange|red} {2.5s|2.5s|2s} ease-in-out infinite */

@keyframes logo-pulse {
  0%, 100% { filter: drop-shadow(0 0 2px rgba(46,181,183,0.1)); opacity: 0.85; }
  50%      { filter: drop-shadow(0 0 14px rgba(46,181,183,0.55)) drop-shadow(0 0 28px rgba(46,181,183,0.2)); opacity: 1; }
}
/* .logo-breathing { animation: logo-pulse 12s ease-in-out infinite; } — приложено на лога в header-а (Index.tsx:580) */
```

Допълнителни keyframes, дефинирани в `index.css`, но **не** приложени в текущия обхват на централния екран (използват се другаде или не се ползват изобщо тук): `float`, `pulse-active`, `dot-pulse`, `fish-swim-1/2/3` (използват се в DECISION BANNER върху рибните икони — `Index.tsx:565, 703` — гранично на "централен екран", включени за пълнота), `star-signal`, `title-glow`, `sonar-pulse`, `sonar-ripple`, `pulse-glow-citron`, `pulse-citron-bonus`, `pulse`, `modal-slide-in`.

```css
@keyframes fish-swim-1 { 0%,100% { transform: translateX(0) translateY(0) rotate(0deg); } 33% { transform: translateX(6px) translateY(-4px) rotate(2deg); } 66% { transform: translateX(2px) translateY(-6px) rotate(-1deg); } }
@keyframes fish-swim-2 { 0%,100% { transform: translateX(0) translateY(0) rotate(0deg); } 33% { transform: translateX(-5px) translateY(4px) rotate(-2deg); } 66% { transform: translateX(-2px) translateY(6px) rotate(1deg); } }
@keyframes fish-swim-3 { 0%,100% { transform: translateX(0) translateY(0) rotate(0deg); } 33% { transform: translateX(5px) translateY(-5px) rotate(1deg); } 66% { transform: translateX(-3px) translateY(3px) rotate(-2deg); } }
/* приложени на DECISION BANNER риба-иконите с динамична продължителност: `${5 + i * 0.8}s ease-in-out infinite` (Index.tsx:565) */
```

---

## 5. BORDER-RADIUS СКАЛА

| Стойност | Къде се използва |
|---|---|
| `50%` | кръгли елементи: dropdown "лунна информация" иконки, wind-warning overlay badge, "Сподели" бутон, avatar-кръгове в SolunarInfoModal, луна hero borderRadius (декоративен, без видим ефект без фон) |
| `20px` | главните секции: "Солунарна активност" (`SolunarDial`), "Условия днес", solunar fallback loader секция |
| `16px` | `rounded-2xl` (Tailwind, = 1rem = 16px): DECISION BANNER, "Условия" bento контейнер; модал контейнер (SolunarInfoModal) `borderRadius: '16px'` |
| `12px` | override "Внимание" блок |
| `10px` | dropdown "лунна информация" pill и панел, alert tooltip кутия (Index.tsx), wind-compass tooltip |
| `8px` | `rounded-lg` (Tailwind, = 0.5rem = 8px): bento плочки (темп/вятър/налягане/влага/височина/икона), прогнозни карти (`ForecastCards.tsx`); explicit `8px` кутии в SolunarInfoModal |
| `7px` | зенит/надир SVG таг (`rx="7"`) |

Забележка: Tailwind utility класове (`rounded-lg`, `rounded-2xl`, `rounded-full`) резолвират през `tailwind.config.ts` към `var(--radius)` = `0.75rem` (12px) за `lg`, но `rounded-2xl` е Tailwind default (1rem = 16px, не е предефиниран в config extend). `rounded-full` = 9999px (кръг).

---

## 6. SPACING

Няма формална spacing скала, дефинирана като токени/променливи — стойностите са ad-hoc inline `px`, но следват забележима стъпка от **~2px инкременти около база от 4px**, групирани главно около: `2, 4, 6, 8, 9, 10, 12, 14, 16, 18, 20` px.

### 6.1 Padding, наблюдаван по контейнери

| Стойност | Употреба |
|---|---|
| `16px` | основен padding на главните секции (солунарен блок, "Условия днес", loader fallback) |
| `12px` (`p-3`) | "Условия" bento контейнер |
| `20px` (`p-5`) | DECISION BANNER |
| `9px 12px` | dropdown "лунна информация" pill |
| `10px` | dropdown панел (лунен факт) |
| `8px 16px` | почасова прогноза scroll контейнер |
| `4px 12px` | почасов toggle бутон |
| `3px 8px` | alert badge (inline pill) |
| `10px 12px` / `12px` | alert tooltip кутия / override "Внимание" блок |
| `8px 10px` | обяснителни кутии в SolunarInfoModal |
| `14px 0` | редове в SolunarInfoModal (Голям пик/Малък пик/Златен час) |
| `16px 18px 0`, `14px 18px`, `0 18px 16px` | модал контейнер горна/долна секция и "За теорията" |
| `5px 11px` | wind-compass tooltip |
| `p-1.5` (6px) | bento плочки (Tailwind) |
| `p-2` (8px) | прогнозни карти (Tailwind) |

### 6.2 Gap / marginBottom (между секции и редове)

- Секция-до-секция: `marginBottom: '10px'` (солунарен блок, "Условия днес", loader fallback) и `mb-2` (8px, DECISION BANNER, "Условия", "Прогноза").
- Вътрешен ред-до-ред padding в "Условия днес": `paddingTop/paddingBottom: '12px'` с `borderBottom: '1px solid #252b2b'` между всеки ред (времето/вятър/стил/светлина/търсене).
- Bento grid gap: `gap-1` (4px, Tailwind).
- Прогнозни карти grid gap: `gap-2` (8px, Tailwind).
- Циферблат → долен grid (изгрев/залез): `gap: '10px'`.

---

## Обобщение

Централният екран следва последователна тъмна "sonar/marine electronics" естетика:
- **teal (`#2eb5b7`) + bright teal (`#5cd8da`) + citron (`#C8E63C`)** като единствената функционална тройка от акцентни цветове (citron = "важно сега", teal = неутрален/структурен акцент).
- Полупрозрачни бели/teal фонове (`rgba(255,255,255,0.03–0.07)`, `rgba(46,181,183,0.02–0.35)`) вместо плътни цветни повърхности — с изключение на модалите/tooltip-ите, които ползват плътен тъмен фон (`#0B0F1A` / `#0f1415`).
- Glow ефектите са резервирани за **сигнални** моменти: златен час, major солунарен пик, активен DECISION BANNER, метео-alert, лого "дишане" — не се прилагат декоративно навсякъде.
- Радиусите растат с йерархията на контейнера: малки плочки `8px` → секции `16–20px` → кръгли елементи `50%`.
