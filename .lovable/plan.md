

# Намаляване на секция "Солунарна активност"

## Промени в `src/pages/Index.tsx` (SolunarSection компонент)

### 1. Контейнер
- `space-y-3` → `space-y-2`

### 2. Pill badges (ред 78-91)
- `py-1.5 px-3` → `py-1 px-2`
- Без промяна на font-size (вече е `text-xs`)

### 3. Activity cards (ред 94-169)
- `space-y-2` → `space-y-1.5`
- Card padding: `p-3.5` → `p-2.5`
- Major time font: `text-[22px]` → `text-[16px]`
- Minor time font: `text-[18px]` → `text-[14px]`
- Center title font: `13px` → `11px`
- Subtitle font: `11px` → `10px`
- Fish icons: `size={16}` → `size={14}`
- Peak location text: остава `10px` → `9px`
- "СЕГА АКТИВНО" badge: запазва размер

### 4. Countdown (ред 172-186)
- Без промяна (вече е `text-xs`)

Нищо друго не се променя.

