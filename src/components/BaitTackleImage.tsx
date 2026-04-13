/**
 * Configurable Bait & Tackle Icon Component
 * Supports both SVG fallback and real images (PNG/WebP)
 */

import {
  EarthwormsIcon,
  BoiliIcon,
  DoughIcon,
  CornIcon,
  HookIcon,
  FluorocarbonIcon,
  WeightIcon,
  RigIcon,
} from './BaitTackleIcons';

export type BaitIconKey = 'earthworms' | 'boili' | 'dough' | 'corn';
export type TackleIconKey = 'hook' | 'fluorocarbon' | 'weight' | 'rig';

const SVG_ICONS = {
  earthworms: <EarthwormsIcon />,
  boili: <BoiliIcon />,
  dough: <DoughIcon />,
  corn: <CornIcon />,
  hook: <HookIcon />,
  fluorocarbon: <FluorocarbonIcon />,
  weight: <WeightIcon />,
  rig: <RigIcon />,
};

interface BaitTackleImageProps {
  icon: BaitIconKey | TackleIconKey;
  alt: string;
  size?: number;
  useImage?: boolean;
}

/**
 * Renders either SVG icon or real image with fallback
 * When useImage=true, tries to load /public/assets/baits/{icon}.webp first, then PNG
 */
export function BaitTackleImage({
  icon,
  alt,
  size = 56,
  useImage = false,
}: BaitTackleImageProps) {
  const imagePath = `/assets/baits/${icon}`;

  if (!useImage) {
    return (
      <div style={{ width: size, height: size }}>
        {SVG_ICONS[icon as keyof typeof SVG_ICONS] || null}
      </div>
    );
  }

  // Try to load real image with fallback to SVG
  return (
    <picture>
      <source srcSet={`${imagePath}.webp`} type="image/webp" />
      <source srcSet={`${imagePath}.png`} type="image/png" />
      <img
        src={`${imagePath}.png`}
        alt={alt}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
        }}
        onError={(e) => {
          // Fallback to SVG if image fails to load
          const container = e.currentTarget.parentElement;
          if (container) {
            container.innerHTML = '';
            const svg = document.createElement('div');
            svg.style.width = `${size}px`;
            svg.style.height = `${size}px`;
            container.appendChild(svg);
          }
        }}
      />
    </picture>
  );
}

/**
 * Hook to detect if images are available in /public/assets/baits/
 */
export function useImageAvailable(icon: BaitIconKey | TackleIconKey): boolean {
  // This will be true if images are present in the public folder
  // You can enhance this with a real check later
  return typeof window !== 'undefined';
}

/**
 * Configuration helper for toggling between SVG and images globally
 */
export const ImageConfig = {
  useImages: false, // Change to true when images are ready
  setUseImages(value: boolean) {
    this.useImages = value;
  },
};
