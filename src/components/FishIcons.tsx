import { type SVGProps } from 'react';

type FishIconProps = SVGProps<SVGSVGElement> & { size?: number };

const defaults = (props: FishIconProps) => ({
  width: props.size ?? 48,
  height: props.size ?? 48,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className: `text-primary ${props.className ?? ''}`.trim(),
  ...props,
  size: undefined,
});

export function CarpIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Deep round body */}
      <ellipse cx="22" cy="24" rx="14" ry="10" />
      {/* Tail fin forked */}
      <path d="M36 24 L44 16 M36 24 L44 32" />
      {/* Dorsal fin */}
      <path d="M14 14 Q18 8 26 14" />
      {/* Pectoral fin */}
      <path d="M16 28 L12 34" />
      {/* Anal fin */}
      <path d="M26 34 L30 32" />
      {/* Eye */}
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
      {/* Barbels */}
      <path d="M8 24 L4 22 M8 25 L4 27" />
      {/* Scale suggestion */}
      <path d="M18 20 Q20 18 22 20 M20 24 Q22 22 24 24 M18 28 Q20 26 22 28" opacity="0.4" />
    </svg>
  );
}

export function GrassCarpIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Elongated torpedo body */}
      <ellipse cx="23" cy="24" rx="17" ry="7" />
      {/* Small head */}
      <path d="M6 24 Q6 20 10 22" />
      {/* Tail */}
      <path d="M40 24 L46 17 M40 24 L46 31" />
      {/* Dorsal fin */}
      <path d="M20 17 Q24 12 28 17" />
      {/* Pectoral */}
      <path d="M14 28 L10 33" />
      {/* Eye */}
      <circle cx="10" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SilverCarpIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Large head, deep body */}
      <path d="M6 24 Q6 12 16 12 Q28 10 34 16 Q40 20 40 24 Q40 28 34 32 Q28 38 16 36 Q6 36 6 24Z" />
      {/* Large head line */}
      <path d="M16 12 L16 36" opacity="0.3" />
      {/* Low-set eye */}
      <circle cx="11" cy="26" r="1.5" fill="currentColor" />
      {/* Tail */}
      <path d="M40 24 L46 16 M40 24 L46 32" />
      {/* Dorsal */}
      <path d="M22 12 Q26 6 30 12" />
      {/* Pectoral */}
      <path d="M18 30 L14 36" />
    </svg>
  );
}

export function CatfishIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Flat wide head tapering to tail */}
      <path d="M4 20 Q4 16 12 16 L36 20 Q42 22 42 24 Q42 26 36 28 L12 32 Q4 32 4 28Z" />
      {/* Flat head top */}
      <path d="M4 20 L16 18" opacity="0.3" />
      {/* Long whiskers */}
      <path d="M6 22 L2 14 M6 23 L2 18 M6 26 L2 30 M6 27 L2 34" />
      {/* Tapering tail */}
      <path d="M42 24 L47 18 M42 24 L47 30" />
      {/* Eye */}
      <circle cx="10" cy="22" r="1" fill="currentColor" />
      {/* Dorsal */}
      <path d="M18 16 L20 10 L22 16" />
    </svg>
  );
}

export function PikeIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Long narrow body, duck-bill snout */}
      <path d="M2 24 L6 21 Q14 18 28 18 Q38 18 40 22 L42 24 L40 26 Q38 30 28 30 Q14 30 6 27Z" />
      {/* Duck-bill snout */}
      <path d="M2 24 L6 23 M2 24 L6 25" />
      {/* Forked tail */}
      <path d="M42 24 L48 15 M42 24 L48 33" />
      {/* Dorsal fin set back */}
      <path d="M32 18 Q35 12 38 18" />
      {/* Anal fin */}
      <path d="M32 30 Q35 36 38 30" />
      {/* Eye */}
      <circle cx="8" cy="23" r="1.5" fill="currentColor" />
      {/* Jaw line */}
      <path d="M2 24 L10 25" opacity="0.3" />
    </svg>
  );
}

export function CrucianIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Small round deep body */}
      <ellipse cx="22" cy="24" rx="12" ry="10" />
      {/* Rounded fins */}
      <path d="M16 14 Q20 9 24 14" />
      <path d="M14 30 Q16 35 18 30" />
      {/* Tail */}
      <path d="M34 24 L42 18 M34 24 L42 30" />
      {/* Pectoral */}
      <path d="M16 27 L12 32" />
      {/* Eye */}
      <circle cx="14" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function BleakIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Slim silvery shape */}
      <ellipse cx="22" cy="24" rx="16" ry="5" />
      {/* Forked tail */}
      <path d="M38 24 L46 17 M38 24 L46 31" />
      {/* Dorsal */}
      <path d="M20 19 Q22 15 24 19" />
      {/* Anal */}
      <path d="M24 29 Q26 33 28 29" />
      {/* Eye */}
      <circle cx="9" cy="23" r="1.5" fill="currentColor" />
      {/* Lateral line */}
      <path d="M10 24 L36 24" opacity="0.2" />
    </svg>
  );
}

export function TroutIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Streamlined body */}
      <path d="M4 24 Q4 17 14 16 Q24 14 34 18 Q40 20 42 24 Q40 28 34 30 Q24 34 14 32 Q4 31 4 24Z" />
      {/* Adipose fin */}
      <path d="M34 18 Q36 15 38 18" />
      {/* Dorsal */}
      <path d="M18 16 Q22 9 26 16" />
      {/* Tail */}
      <path d="M42 24 L48 17 M42 24 L48 31" />
      {/* Eye */}
      <circle cx="9" cy="22" r="1.5" fill="currentColor" />
      {/* Spots suggestion */}
      <circle cx="16" cy="22" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="22" cy="20" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="20" cy="26" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="28" cy="23" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="26" cy="27" r="0.8" opacity="0.4" fill="currentColor" />
      {/* Pectoral */}
      <path d="M14 28 L10 34" />
    </svg>
  );
}

export function MulletIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Cylindrical body */}
      <ellipse cx="22" cy="24" rx="16" ry="7" />
      {/* Two separate dorsal fins */}
      <path d="M14 17 Q16 11 18 17" />
      <path d="M26 17 Q28 12 30 17" />
      {/* Tail */}
      <path d="M38 24 L46 18 M38 24 L46 30" />
      {/* Eye */}
      <circle cx="9" cy="22" r="1.5" fill="currentColor" />
      {/* Pectoral */}
      <path d="M14 28 L10 33" />
    </svg>
  );
}

export function BarbelIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Elongated body */}
      <ellipse cx="23" cy="24" rx="17" ry="7" />
      {/* Downward pointing mouth */}
      <path d="M6 24 Q6 26 8 27" />
      {/* 4 barbels */}
      <path d="M7 26 L3 30 M8 27 L5 32 M7 24 L3 22 M8 23 L5 20" />
      {/* Tail */}
      <path d="M40 24 L47 17 M40 24 L47 31" />
      {/* Dorsal */}
      <path d="M20 17 Q24 11 28 17" />
      {/* Eye */}
      <circle cx="10" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TenchIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Stocky rounded body */}
      <ellipse cx="22" cy="24" rx="14" ry="9" />
      {/* Small rounded fins */}
      <path d="M18 15 Q20 11 22 15" />
      <path d="M18 33 Q20 37 22 33" />
      {/* Rounded tail */}
      <path d="M36 24 Q42 18 44 22 Q44 26 42 30 Q40 26 36 24Z" />
      {/* Tiny pectoral */}
      <path d="M14 28 L11 32" />
      {/* Eye */}
      <circle cx="12" cy="21" r="1.2" fill="currentColor" />
      {/* Tiny scales suggestion */}
      <path d="M18 22 Q19 21 20 22 M20 26 Q21 25 22 26 M24 22 Q25 21 26 22" opacity="0.3" />
    </svg>
  );
}

/** Map fish name → icon component */
export const FISH_ICON_MAP: Record<string, (props: FishIconProps) => JSX.Element> = {
  'Шаран': CarpIcon,
  'Амур': GrassCarpIcon,
  'Толстолоб': SilverCarpIcon,
  'Сом': CatfishIcon,
  'Щука': PikeIcon,
  'Каракуда': CrucianIcon,
  'Бяла риба (Уклей)': BleakIcon,
  'Пъстърва': TroutIcon,
  'Кефал': MulletIcon,
  'Скобар': BarbelIcon,
  'Лин': TenchIcon,
};
