## 🎨 AI Промпти за генериране на Premium Визуализации

### DALL-E / Midjourney / Stable Diffusion Промпти

---

## СТРЪВ (BAITS) 🐟

### 1. Фини червеи (Earthworms)
```
A close-up, macro photography of 3 wet, glistening earthworms coiled naturally on white background. 
Rich red and pink tones, moist texture, professional fishing bait imagery. 
High detail, realistic, glossy appearance. 
Transparent background. 
Size: 120x120px, 300 DPI.
Style: High-quality macro photography, professional catalog image.
```

### 2. Бойли (Boilies)
```
3-4 colorful fishery boilies (yellow, orange, pink) with glossy coating, 
arranged naturally with subtle shadows on white background.
Each boilie perfectly round with visible glossy surface shine.
Professional fishing bait presentation.
High detail, vibrant colors, translucent background.
Size: 120x120px, 300 DPI.
Style: Product photography, professional fishing catalog.
```

### 3. Тесто (Dough)
```
A single perfect ball of fishing dough on a fish hook against white background.
Pale yellow-white color, soft, slightly textured surface.
White dough with subtle shadows showing 3D form.
Professional fishing bait imagery, realistic macro shot.
Transparent background.
Size: 120x120px, 300 DPI.
Style: Professional catalog photography, high detail.
```

### 4. Царевица (Corn)
```
5-6 corn kernels arranged naturally, glistening with moisture.
Golden yellow and cream colors, glossy surface, macro photography style.
Bright, appetizing appearance, floating on white background.
Professional fishing bait image, high detail, vibrant.
Transparent background.
Size: 120x120px, 300 DPI.
Style: High-quality macro photography, professional presentation.
```

---

## ТАКЪМИ (TACKLE) 🎣

### 1. Куки (Fishing Hooks) №12-14
```
Two professional fishing hooks (silver/gold color), side view and rotated view.
Sharp bend, visible eye, detailed barb.
Macro photography quality, professional fishing equipment.
Shows size numbers clearly, realistic metal finish with highlights.
Transparent background, high contrast.
Size: 120x120px, 300 DPI.
Style: Professional fishing equipment photography, studio lighting.
```

### 2. Финес монтаж (Fine Rig Setup)
```
A professional fishing rig setup: thin fluorocarbon line, small hook, 
fine swivel, arranged against white background.
Clean, technical illustration with realism.
Shows each component clearly, professional fishing diagram quality.
Silver and transparent elements, high detail.
Size: 120x120px, 300 DPI.
Style: Technical illustration meets product photography.
```

### 3. Флуорокарбон 0.16mm (Fluorocarbon Line)
```
A spool of transparent blue-tinted fluorocarbon fishing line, 
wound tightly, professional appearance.
Show label "0.16mm" clearly visible.
Shiny, transparent-bluish color with highlights.
White background, professional fishing tackle photography.
Transparent background.
Size: 120x120px, 300 DPI.
Style: Product photography, professional fishing supplies catalog.
```

### 4. Лека тежест (Fishing Weight/Sinker)
```
A small olive or round lead fishing weight, dark gray/black color.
Macro photography, detailed metallic texture with subtle highlights.
Professional fishing tackle, positioned showing hole clearly.
Realistic metal appearance, matte finish.
Transparent background.
Size: 120x120px, 300 DPI.
Style: Professional fishing equipment macro photography.
```

---

## ТЕХНИЧЕСКИ ПАРАМЕТРИ ЗА ВСИЧКИ ИЗОБРАЖЕНИЯ:

✅ **ФОРМАТ**: PNG с прозрачен фон (или WebP за по-малък размер)
✅ **РАЗМЕР**: 120x120px (оптимално за 60x60px display с 2x retina)
✅ **ЦВЕТНОСТ**: RGBA с прозрачност
✅ **КАЧЕСТВО**: High DPI (300 DPI minimum)
✅ **ПОЗИЦИЯ**: Субект центриран в рамката
✅ **СТИЛ**: Реалистичен, професионален, детайлиран
✅ **СВЕТЛИНА**: Студийна светлина, дифузна, без твърди сенки

---

## 🎯 ПРИМЕРЕН WORKFLOW:

1. **Генериране през AI**:
   - Използвай един от промптите
   - Генерирай в 4K резолюция (512x512 или 1024x1024)
   - Избери най-добрата версия

2. **Обработка**:
   - Изрежи до точно 120x120px
   - Премахни белия фон или направи прозрачен
   - Оптимизирай за WebP (60-80% quality)
   - Пази оригинала като PNG backup

3. **Размещение в проект**:
   - Папка: `/public/assets/baits/`
   - Файлове:
     - earthworms.webp / earthworms.png
     - boili.webp / boili.png
     - dough.webp / dough.png
     - corn.webp / corn.png
     - hook.webp / hook.png
     - fluorocarbon.webp / fluorocarbon.png
     - weight.webp / weight.png
     - rig.webp / rig.png

---

## 📝 ПРЕПОРЪКИ:

### За **DALL-E 3**:
- Силен при детайли и реализъм
- Най-добър выбор за фотографски стил

### За **Midjourney**:
- По-консистентен стил
- Отлично качество на 4K
- Използвай `--niji` за anime/illustration вариант

### За **Stable Diffusion**:
- Безплатна алтернатива, локална или чрез API
- Използвай моделите: `realistic-vision`, `majic-mix`
- Добра оптимизация за файлов размер

---

## 🔄 ПЛАН ЗА ТРАНСФОРМИРАНО ПРИЛОЖЕНИЕ:

След генериране на изображения, могу да:
1. Обновя BaitTackleIcons.tsx да използва правите изображения вместо SVG
2. Добавя `<picture>` елементи за WebP + PNG fallback
3. Оптимизирам размера с современни image loaders
