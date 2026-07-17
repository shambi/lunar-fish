import type { AlertLevel } from './weather-service';

// Single source of truth for MeteoAlarm severity colors (citron/warning/danger).
// The RGB triplets here match the --alarm-yellow/--alarm-orange/--alarm-red
// custom properties in src/index.css, which the pulse-alert-* keyframes read
// from — CSS keyframes can't call into this module, so if a color ever needs
// to change, update both this file and the :root block in index.css.
const ALARM_RGB: Record<Exclude<AlertLevel, 'none'>, [number, number, number]> = {
  yellow: [200, 230, 60], // citron
  orange: [255, 140, 66], // warning
  red: [226, 69, 69],     // danger
};

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map(c => c.toString(16).padStart(2, '0')).join('')}`;
}

export function getAlarmColor(level: AlertLevel): string {
  return level === 'none' ? 'transparent' : toHex(ALARM_RGB[level]);
}

export function getAlarmColorRgba(level: AlertLevel, alpha: number): string {
  if (level === 'none') return 'transparent';
  const [r, g, b] = ALARM_RGB[level];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Appends an alpha channel as a 2-digit hex suffix (#RRGGBBAA), e.g.
// hexAlpha('#C8E63C', 31 / 255) -> '#C8E63C1f'.
export function hexAlpha(hex: string, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, '0');
  return `${hex}${a}`;
}
