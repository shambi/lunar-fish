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
      <ellipse cx="22" cy="24" rx="14" ry="10" />
      <path d="M36 24 L44 16 M36 24 L44 32" />
      <path d="M14 14 Q18 8 26 14" />
      <path d="M16 28 L12 34" />
      <path d="M26 34 L30 32" />
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
      <path d="M8 24 L4 22 M8 25 L4 27" />
      <path d="M18 20 Q20 18 22 20 M20 24 Q22 22 24 24 M18 28 Q20 26 22 28" opacity="0.4" />
    </svg>
  );
}

export function GrassCarpIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <ellipse cx="23" cy="24" rx="17" ry="7" />
      <path d="M6 24 Q6 20 10 22" />
      <path d="M40 24 L46 17 M40 24 L46 31" />
      <path d="M20 17 Q24 12 28 17" />
      <path d="M14 28 L10 33" />
      <circle cx="10" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function SilverCarpIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <path d="M6 24 Q6 12 16 12 Q28 10 34 16 Q40 20 40 24 Q40 28 34 32 Q28 38 16 36 Q6 36 6 24Z" />
      <path d="M16 12 L16 36" opacity="0.3" />
      <circle cx="11" cy="26" r="1.5" fill="currentColor" />
      <path d="M40 24 L46 16 M40 24 L46 32" />
      <path d="M22 12 Q26 6 30 12" />
      <path d="M18 30 L14 36" />
    </svg>
  );
}

export function CatfishIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <path d="M4 20 Q4 16 12 16 L36 20 Q42 22 42 24 Q42 26 36 28 L12 32 Q4 32 4 28Z" />
      <path d="M4 20 L16 18" opacity="0.3" />
      <path d="M6 22 L2 14 M6 23 L2 18 M6 26 L2 30 M6 27 L2 34" />
      <path d="M42 24 L47 18 M42 24 L47 30" />
      <circle cx="10" cy="22" r="1" fill="currentColor" />
      <path d="M18 16 L20 10 L22 16" />
    </svg>
  );
}

export function PikeIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <path d="M2 24 L6 21 Q14 18 28 18 Q38 18 40 22 L42 24 L40 26 Q38 30 28 30 Q14 30 6 27Z" />
      <path d="M2 24 L6 23 M2 24 L6 25" />
      <path d="M42 24 L48 15 M42 24 L48 33" />
      <path d="M32 18 Q35 12 38 18" />
      <path d="M32 30 Q35 36 38 30" />
      <circle cx="8" cy="23" r="1.5" fill="currentColor" />
      <path d="M2 24 L10 25" opacity="0.3" />
    </svg>
  );
}

export function CrucianIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <ellipse cx="22" cy="24" rx="12" ry="10" />
      <path d="M16 14 Q20 9 24 14" />
      <path d="M14 30 Q16 35 18 30" />
      <path d="M34 24 L42 18 M34 24 L42 30" />
      <path d="M16 27 L12 32" />
      <circle cx="14" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function BleakIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <ellipse cx="22" cy="24" rx="16" ry="5" />
      <path d="M38 24 L46 17 M38 24 L46 31" />
      <path d="M20 19 Q22 15 24 19" />
      <path d="M24 29 Q26 33 28 29" />
      <circle cx="9" cy="23" r="1.5" fill="currentColor" />
      <path d="M10 24 L36 24" opacity="0.2" />
    </svg>
  );
}

export function TroutIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <path d="M4 24 Q4 17 14 16 Q24 14 34 18 Q40 20 42 24 Q40 28 34 30 Q24 34 14 32 Q4 31 4 24Z" />
      <path d="M34 18 Q36 15 38 18" />
      <path d="M18 16 Q22 9 26 16" />
      <path d="M42 24 L48 17 M42 24 L48 31" />
      <circle cx="9" cy="22" r="1.5" fill="currentColor" />
      <circle cx="16" cy="22" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="22" cy="20" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="20" cy="26" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="28" cy="23" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="26" cy="27" r="0.8" opacity="0.4" fill="currentColor" />
      <path d="M14 28 L10 34" />
    </svg>
  );
}

export function MulletIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <ellipse cx="22" cy="24" rx="16" ry="7" />
      <path d="M14 17 Q16 11 18 17" />
      <path d="M26 17 Q28 12 30 17" />
      <path d="M38 24 L46 18 M38 24 L46 30" />
      <circle cx="9" cy="22" r="1.5" fill="currentColor" />
      <path d="M14 28 L10 33" />
    </svg>
  );
}

export function BarbelIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <ellipse cx="23" cy="24" rx="17" ry="7" />
      <path d="M6 24 Q6 26 8 27" />
      <path d="M7 26 L3 30 M8 27 L5 32 M7 24 L3 22 M8 23 L5 20" />
      <path d="M40 24 L47 17 M40 24 L47 31" />
      <path d="M20 17 Q24 11 28 17" />
      <circle cx="10" cy="21" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function TenchIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      <ellipse cx="22" cy="24" rx="14" ry="9" />
      <path d="M18 15 Q20 11 22 15" />
      <path d="M18 33 Q20 37 22 33" />
      <path d="M36 24 Q42 18 44 22 Q44 26 42 30 Q40 26 36 24Z" />
      <path d="M14 28 L11 32" />
      <circle cx="12" cy="21" r="1.2" fill="currentColor" />
      <path d="M18 22 Q19 21 20 22 M20 26 Q21 25 22 26 M24 22 Q25 21 26 22" opacity="0.3" />
    </svg>
  );
}

// ——— 9 NEW SPECIES ICONS ———

export function PerchIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Round spiky body */}
      <ellipse cx="22" cy="24" rx="13" ry="9" />
      {/* Spiny dorsal fin */}
      <path d="M12 15 L14 8 L16 14 L18 7 L20 14 L22 8 L24 14 L26 9 L28 15" />
      {/* Soft dorsal */}
      <path d="M28 15 Q30 13 32 15" />
      {/* Tail forked */}
      <path d="M35 24 L43 17 M35 24 L43 31" />
      {/* Pectoral */}
      <path d="M14 28 L10 33" />
      {/* Anal fin */}
      <path d="M24 33 L26 37 L28 33" />
      {/* Eye */}
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
      {/* Stripes */}
      <path d="M16 17 L16 31 M20 16 L20 32 M24 16 L24 32 M28 17 L28 31" opacity="0.2" />
    </svg>
  );
}

export function BreamIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Deep tall body, small head */}
      <path d="M8 24 Q8 12 14 10 Q22 8 28 12 Q34 16 36 24 Q34 32 28 36 Q22 40 14 38 Q8 36 8 24Z" />
      {/* Forked tail */}
      <path d="M36 24 L44 16 M36 24 L44 32" />
      {/* Small dorsal */}
      <path d="M18 10 Q22 5 26 10" />
      {/* Anal fin */}
      <path d="M20 38 Q24 42 28 38" />
      {/* Pectoral */}
      <path d="M14 28 L10 34" />
      {/* Eye */}
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function RoachIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Slim streamlined body */}
      <ellipse cx="22" cy="24" rx="15" ry="6" />
      {/* Dorsal */}
      <path d="M20 18 Q22 13 24 18" />
      {/* Forked tail */}
      <path d="M37 24 L45 18 M37 24 L45 30" />
      {/* Pectoral */}
      <path d="M14 27 L10 32" />
      {/* Anal */}
      <path d="M26 30 Q28 34 30 30" />
      {/* Eye */}
      <circle cx="10" cy="23" r="1.5" fill="currentColor" />
      {/* Lateral line */}
      <path d="M10 24 L35 24" opacity="0.15" />
    </svg>
  );
}

export function RuddIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Deep body with rounded fins */}
      <ellipse cx="22" cy="24" rx="13" ry="9" />
      {/* Rounded dorsal */}
      <path d="M20 15 Q22 10 24 15" />
      {/* Large rounded anal fin (red fin hint) */}
      <path d="M18 33 Q22 40 26 33" />
      {/* Rounded pectoral */}
      <path d="M14 27 Q10 32 12 34" />
      {/* Rounded pelvic */}
      <path d="M18 30 Q16 35 18 36" />
      {/* Tail */}
      <path d="M35 24 L43 18 M35 24 L43 30" />
      {/* Eye */}
      <circle cx="12" cy="22" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function NaseIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Elongated body */}
      <ellipse cx="23" cy="24" rx="17" ry="7" />
      {/* Downward pointing mouth */}
      <path d="M6 25 Q6 27 8 28" />
      {/* 4 barbel lines at mouth */}
      <path d="M7 26 L3 30 M8 27 L5 32 M7 24 L3 22 M8 23 L4 20" />
      {/* Dorsal */}
      <path d="M20 17 Q24 11 28 17" />
      {/* Tail forked */}
      <path d="M40 24 L47 17 M40 24 L47 31" />
      {/* Eye */}
      <circle cx="10" cy="21" r="1.5" fill="currentColor" />
      {/* Pectoral */}
      <path d="M14 28 L10 33" />
    </svg>
  );
}

export function RainbowTroutIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Streamlined body */}
      <path d="M4 24 Q4 17 14 16 Q24 14 34 18 Q40 20 42 24 Q40 28 34 30 Q24 34 14 32 Q4 31 4 24Z" />
      {/* Adipose fin */}
      <path d="M34 18 Q36 14 38 18" />
      {/* Dorsal */}
      <path d="M18 16 Q22 9 26 16" />
      {/* Tail */}
      <path d="M42 24 L48 17 M42 24 L48 31" />
      {/* Eye */}
      <circle cx="9" cy="22" r="1.5" fill="currentColor" />
      {/* Spots — more and varied */}
      <circle cx="14" cy="21" r="0.7" opacity="0.5" fill="currentColor" />
      <circle cx="18" cy="25" r="0.9" opacity="0.4" fill="currentColor" />
      <circle cx="22" cy="19" r="0.7" opacity="0.5" fill="currentColor" />
      <circle cx="26" cy="24" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="30" cy="21" r="0.7" opacity="0.5" fill="currentColor" />
      <circle cx="24" cy="28" r="0.8" opacity="0.4" fill="currentColor" />
      <circle cx="32" cy="26" r="0.6" opacity="0.3" fill="currentColor" />
      {/* Rainbow stripe hint */}
      <path d="M8 24 Q20 22 34 24" opacity="0.2" strokeWidth="2" />
      {/* Pectoral */}
      <path d="M14 28 L10 34" />
    </svg>
  );
}

export function RuffIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Small round body */}
      <ellipse cx="22" cy="24" rx="11" ry="8" />
      {/* Two separate dorsal fins */}
      <path d="M14 16 L15 10 L17 15 L18 9 L20 16" />
      <path d="M24 16 Q26 12 28 16" />
      {/* Tail */}
      <path d="M33 24 L40 18 M33 24 L40 30" />
      {/* Pectoral */}
      <path d="M15 28 L11 33" />
      {/* Eye large */}
      <circle cx="14" cy="22" r="1.8" fill="currentColor" />
      {/* Speckles */}
      <path d="M18 20 L18.5 20.5 M22 22 L22.5 22.5 M20 26 L20.5 26.5" opacity="0.3" />
    </svg>
  );
}

export function ZanderIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Elongated predator body, pointed snout */}
      <path d="M4 24 L8 20 Q16 16 28 16 Q36 16 40 20 L42 24 L40 28 Q36 32 28 32 Q16 32 8 28Z" />
      {/* Pointed snout */}
      <path d="M4 24 L7 23 M4 24 L7 25" />
      {/* Spiny dorsal */}
      <path d="M14 16 L16 8 L18 15 L20 9 L22 16" />
      {/* Soft dorsal */}
      <path d="M26 16 Q30 11 34 16" />
      {/* Forked tail */}
      <path d="M42 24 L48 16 M42 24 L48 32" />
      {/* Eye — large, glassy */}
      <circle cx="10" cy="22" r="2" fill="currentColor" />
      {/* Pectoral */}
      <path d="M16 28 L12 34" />
      {/* Fangs hint */}
      <path d="M6 24 L8 25" opacity="0.3" />
    </svg>
  );
}

export function AspIcon(props: FishIconProps) {
  const p = defaults(props);
  return (
    <svg {...p}>
      {/* Torpedo body, large mouth, surface hunter */}
      <path d="M2 24 Q2 18 10 16 Q20 13 32 16 Q40 18 42 24 Q40 30 32 32 Q20 35 10 32 Q2 30 2 24Z" />
      {/* Large upward mouth */}
      <path d="M2 24 L6 20 M2 24 L6 22" />
      <path d="M4 22 L8 20" opacity="0.3" />
      {/* Dorsal */}
      <path d="M20 14 Q24 8 28 14" />
      {/* Forked tail */}
      <path d="M42 24 L48 16 M42 24 L48 32" />
      {/* Anal fin */}
      <path d="M30 32 Q34 37 38 32" />
      {/* Eye */}
      <circle cx="8" cy="21" r="1.5" fill="currentColor" />
      {/* Pectoral — large */}
      <path d="M14 28 L8 36" />
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
  'Костур': PerchIcon,
  'Платика': BreamIcon,
  'Бабушка': RoachIcon,
  'Червеноперка': RuddIcon,
  'Мряна': NaseIcon,
  'Дъгова пъстърва': RainbowTroutIcon,
  'Бибан': RuffIcon,
  'Сулка': ZanderIcon,
  'Распер': AspIcon,
};
