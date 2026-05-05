/**
 * AdviceIcon — single premium icon renderer for all bait/tackle/technique advice.
 * - Inline SVGs with gradients, highlights and shadows (skeuomorphic / 3D-ish)
 * - Fixed 28x28 by default, centered
 * - Resolves Bulgarian advice text -> icon kind via keyword matching, so it
 *   covers all ~50 variations (hooks #X-Y, lines 0.NN, rigs, weights, etc.)
 *   without needing a 1:1 file for every label.
 */
import { memo } from 'react';

type Kind =
  | 'worm-small' | 'worm-large' | 'baitfish' | 'deadfish' | 'grasshopper'
  | 'maggot' | 'bloodworm' | 'crayfish'
  | 'corn' | 'dough' | 'bread' | 'pea' | 'potato'
  | 'boilie-small' | 'boilie-medium' | 'boilie-large' | 'boilie-popup' | 'pellet' | 'method'
  | 'soft-lure' | 'spinner' | 'spoon' | 'jig' | 'popper' | 'crank' | 'twister' | 'phosphor' | 'mussel'
  | 'hook' | 'treble-hook' | 'offset-hook'
  | 'line-fluoro' | 'line-braid' | 'line-mono'
  | 'weight-light' | 'weight-medium' | 'weight-heavy' | 'weight-none'
  | 'rig-finesse' | 'rig-carolina' | 'rig-texas' | 'rig-dropshot' | 'rig-leader'
  | 'rig-method' | 'rig-feeder' | 'rig-float' | 'rig-bottom' | 'rig-feeder-heavy' | 'rig-klonk'
  | 'tech-slow' | 'tech-fast' | 'tech-twitch' | 'tech-jig' | 'tech-troll' | 'tech-bottom'
  | 'loc-deep' | 'loc-mid' | 'loc-shallow' | 'loc-structure' | 'loc-open' | 'loc-shore'
  | 'time-dawn' | 'time-morning' | 'time-midday' | 'time-afternoon' | 'time-evening' | 'time-night'
  | 'cond-clear' | 'cond-murky' | 'cond-current' | 'cond-still' | 'cond-rain' | 'cond-wind'
  | 'default';

/** Resolve a Bulgarian advice label → icon kind + optional badge text. */
function resolve(name: string): { kind: Kind; badge?: string } {
  const s = name.trim();
  const low = s.toLowerCase();

  // Hooks: extract number range as badge (e.g. "Куки №8-10" → "8-10")
  if (low.startsWith('куки')) {
    const m = s.match(/[№#]?\s*([0-9]+(?:\s*-\s*[0-9]+)?)/);
    return { kind: 'hook', badge: m ? m[1].replace(/\s/g, '') : '' };
  }
  if (low.includes('тройни')) return { kind: 'treble-hook' };
  if (low.includes('офсет')) return { kind: 'offset-hook' };

  // Lines: detect type + diameter
  if (low.includes('флуорокарбон') || low.includes('флуоро')) {
    const m = s.match(/0\.\d{2}(?:-0\.\d{2})?\+?/);
    return { kind: 'line-fluoro', badge: m ? m[0] : '' };
  }
  if (low.includes('плет')) {
    const m = s.match(/0\.\d{2}\+?/);
    return { kind: 'line-braid', badge: m ? m[0] : '' };
  }
  if (low.includes('влакно') || low.includes('моноф')) {
    const m = s.match(/0\.\d{2}(?:-0\.\d{2})?\+?/);
    return { kind: 'line-mono', badge: m ? m[0] : '' };
  }

  // Weights
  if (low.includes('тежест') || low.includes('хранилка') || low.includes('олово')) {
    if (low.includes('без')) return { kind: 'weight-none' };
    if (low.includes('лек')) return { kind: 'weight-light' };
    if (low.includes('средн')) return { kind: 'weight-medium' };
    if (low.includes('тежк') || /[5-9]\dг|\d{3}г/.test(s)) return { kind: 'weight-heavy' };
    const m = s.match(/\d{1,3}(?:-\d{1,3})?\s*г/);
    return { kind: 'weight-medium', badge: m ? m[0].replace(/\s/g, '') : '' };
  }

  // Rigs
  if (low.includes('финес')) return { kind: 'rig-finesse' };
  if (low.includes('каролин')) return { kind: 'rig-carolina' };
  if (low.includes('тексас')) return { kind: 'rig-texas' };
  if (low.includes('дроп')) return { kind: 'rig-dropshot' };
  if (low.includes('повод')) return { kind: 'rig-leader' };
  if (low.includes('метод')) return { kind: 'rig-method' };
  if (low.includes('тежък фидер')) return { kind: 'rig-feeder-heavy' };
  if (low.includes('фидер')) return { kind: 'rig-feeder' };
  if (low.includes('поплав')) return { kind: 'rig-float' };
  if (low.includes('дънен')) return { kind: 'rig-bottom' };
  if (low.includes('кльонк')) return { kind: 'rig-klonk' };

  // Baits — natural
  if (low.includes('фини червеи')) return { kind: 'worm-small' };
  if (low.includes('едри червеи')) return { kind: 'worm-large' };
  if (low === 'червеи') return { kind: 'worm-small' };
  if (low.includes('живци') || low.includes('жива стръв')) return { kind: 'baitfish' };
  if (low.includes('мъртва')) return { kind: 'deadfish' };
  if (low.includes('скакал')) return { kind: 'grasshopper' };
  if (low.includes('личинк') || low.includes('ларв')) return { kind: 'maggot' };
  if (low.includes('мотил')) return { kind: 'bloodworm' };
  if (low.includes('раци')) return { kind: 'crayfish' };
  if (low.includes('миди')) return { kind: 'mussel' };

  // Vegetable
  if (low.includes('царевиц')) return { kind: 'corn' };
  if (low.includes('тесто')) return { kind: 'dough' };
  if (low.includes('хляб')) return { kind: 'bread' };
  if (low.includes('грах')) return { kind: 'pea' };
  if (low.includes('картоф')) return { kind: 'potato' };

  // Boilies / pellets
  if (low.includes('плуващи бойли')) return { kind: 'boilie-popup' };
  if (low.includes('малки бойли')) return { kind: 'boilie-small' };
  if (low.includes('средни бойли')) return { kind: 'boilie-medium' };
  if (low.includes('големи бойли')) return { kind: 'boilie-large' };
  if (low.includes('бойли')) return { kind: 'boilie-medium' };
  if (low.includes('пеле')) return { kind: 'pellet' };
  if (low.includes('method')) return { kind: 'method' };

  // Artificial lures
  if (low.includes('силикон')) return { kind: 'soft-lure' };
  if (low.includes('въртящ') || low.includes('спинер')) return { kind: 'spinner' };
  if (low.includes('колеблив')) return { kind: 'spoon' };
  if (low.includes('микро джиг')) return { kind: 'jig' };
  if (low.includes('джиг')) return { kind: 'jig' };
  if (low.includes('попер')) return { kind: 'popper' };
  if (low.includes('крънк')) return { kind: 'crank' };
  if (low.includes('туистер')) return { kind: 'twister' };
  if (low.includes('фосфор')) return { kind: 'phosphor' };

  // Techniques
  if (low.includes('бавно')) return { kind: 'tech-slow' };
  if (low.includes('бързо')) return { kind: 'tech-fast' };
  if (low.includes('twitch')) return { kind: 'tech-twitch' };
  if (low.includes('jig')) return { kind: 'tech-jig' };
  if (low.includes('тролинг') || low.includes('троллинг')) return { kind: 'tech-troll' };
  if (low.includes('дънна')) return { kind: 'tech-bottom' };

  // Locations
  if (low.includes('дълбок')) return { kind: 'loc-deep' };
  if (low.includes('средна дълбоч')) return { kind: 'loc-mid' };
  if (low.includes('плитк')) return { kind: 'loc-shallow' };
  if (low.includes('структур')) return { kind: 'loc-structure' };
  if (low.includes('открит')) return { kind: 'loc-open' };
  if (low.includes('брега')) return { kind: 'loc-shore' };

  // Timing
  if (low.includes('ранна сутрин')) return { kind: 'time-dawn' };
  if (low.includes('сутрин')) return { kind: 'time-morning' };
  if (low.includes('обяд') && !low.includes('след')) return { kind: 'time-midday' };
  if (low.includes('след обяд')) return { kind: 'time-afternoon' };
  if (low.includes('вечер')) return { kind: 'time-evening' };
  if (low.includes('нощ')) return { kind: 'time-night' };

  // Conditions
  if (low.includes('бистр')) return { kind: 'cond-clear' };
  if (low.includes('мътн')) return { kind: 'cond-murky' };
  if (low.includes('течен')) return { kind: 'cond-current' };
  if (low.includes('стояща')) return { kind: 'cond-still' };
  if (low.includes('дъжд')) return { kind: 'cond-rain' };
  if (low.includes('вятър')) return { kind: 'cond-wind' };

  return { kind: 'default' };
}

// ────────────────────────────────────────────────────────────────────────────
// SVG primitives. Every icon draws inside a 28x28 viewBox with shared defs.
// ────────────────────────────────────────────────────────────────────────────

const D = ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>;

function HookSvg({ badge }: { badge?: string }) {
  return (
    <>
      <D>
        <linearGradient id="ai-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4F7FB" />
          <stop offset="45%" stopColor="#9DB0C7" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </D>
      <circle cx="14" cy="6" r="2.4" fill="none" stroke="url(#ai-steel)" strokeWidth="1.6" />
      <path
        d="M14 8.4 V16 Q14 22 9 22 Q5 22 5 18.5"
        fill="none"
        stroke="url(#ai-steel)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M5 18.5 L3.6 20" stroke="#cbd5e1" strokeWidth="1.4" strokeLinecap="round" />
      {badge && (
        <g>
          <rect x="14.5" y="14" width="12.5" height="8" rx="2" fill="#0F172A" stroke="#E4FF00" strokeWidth="0.8" />
          <text x="20.7" y="19.7" textAnchor="middle" fontSize="5.4" fontWeight="700" fill="#E4FF00" fontFamily="ui-sans-serif,system-ui">№{badge}</text>
        </g>
      )}
    </>
  );
}

function TrebleHookSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-steel2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4F7FB" /><stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </D>
      <line x1="14" y1="3" x2="14" y2="14" stroke="url(#ai-steel2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 14 Q9 18 6 24" fill="none" stroke="url(#ai-steel2)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 14 Q19 18 22 24" fill="none" stroke="url(#ai-steel2)" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M14 14 V25" stroke="url(#ai-steel2)" strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function OffsetHookSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-steel3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F4F7FB" /><stop offset="100%" stopColor="#475569" />
        </linearGradient>
      </D>
      <circle cx="20" cy="5" r="2" fill="none" stroke="url(#ai-steel3)" strokeWidth="1.5" />
      <path d="M20 7 L20 11 L8 11 Q3 11 3 17 Q3 22 9 22" fill="none" stroke="url(#ai-steel3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function LineSvg({ color, glow, badge }: { color: string; glow?: boolean; badge?: string }) {
  const id = `ai-line-${color.replace('#', '')}`;
  return (
    <>
      <D>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E293B" /><stop offset="100%" stopColor="#0B1220" />
        </linearGradient>
        {glow && (
          <filter id="ai-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
      </D>
      {/* Spool body */}
      <rect x="3" y="9" width="22" height="10" rx="1.5" fill={`url(#${id})`} />
      <ellipse cx="14" cy="9" rx="11" ry="2.4" fill="#0B1220" />
      <ellipse cx="14" cy="19" rx="11" ry="2.4" fill="#06080F" />
      {/* Wound line */}
      {[10.5, 12, 13.5, 15, 16.5, 18].map((y, i) => (
        <ellipse key={i} cx="14" cy={y} rx={10 - i * 0.2} ry="1.1" fill="none" stroke={color} strokeWidth="0.5" opacity="0.85" filter={glow ? 'url(#ai-glow)' : undefined} />
      ))}
      {badge && (
        <g>
          <rect x="6" y="11" width="16" height="6" rx="1" fill="#FFFFFF" opacity="0.92" />
          <text x="14" y="15.6" textAnchor="middle" fontSize="4.6" fontWeight="700" fill="#0F172A" fontFamily="ui-sans-serif,system-ui">{badge}</text>
        </g>
      )}
    </>
  );
}

function WeightSvg({ size, badge }: { size: 'none' | 'light' | 'medium' | 'heavy'; badge?: string }) {
  if (size === 'none') {
    return (
      <>
        <circle cx="14" cy="14" r="10" fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="2 2" />
        <line x1="7" y1="7" x2="21" y2="21" stroke="#94A3B8" strokeWidth="1.5" />
      </>
    );
  }
  const r = size === 'light' ? 5 : size === 'medium' ? 7 : 9;
  return (
    <>
      <D>
        <radialGradient id="ai-w" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="55%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1E293B" />
        </radialGradient>
      </D>
      <line x1="14" y1="2" x2="14" y2={14 - r} stroke="#94A3B8" strokeWidth="1" />
      <ellipse cx="14" cy={14 - r + 0.5} rx="1.6" ry="0.8" fill="#1E293B" />
      <ellipse cx="14" cy={14 + r * 0.1} rx={r} ry={r * 1.1} fill="url(#ai-w)" />
      <ellipse cx={14 - r * 0.35} cy={14 - r * 0.3} rx={r * 0.4} ry={r * 0.25} fill="rgba(255,255,255,0.45)" />
      {badge && (
        <g>
          <rect x="14" y="20" width="13" height="6" rx="1.5" fill="#0F172A" stroke="#E4FF00" strokeWidth="0.6" />
          <text x="20.5" y="24.4" textAnchor="middle" fontSize="4.6" fontWeight="700" fill="#E4FF00" fontFamily="ui-sans-serif,system-ui">{badge}</text>
        </g>
      )}
    </>
  );
}

function BoilieSvg({ size, popup }: { size: number; popup?: boolean }) {
  return (
    <>
      <D>
        <radialGradient id="ai-b1" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFE9A8" /><stop offset="60%" stopColor="#D97706" /><stop offset="100%" stopColor="#7C2D12" />
        </radialGradient>
        <radialGradient id="ai-b2" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FECACA" /><stop offset="60%" stopColor="#DC2626" /><stop offset="100%" stopColor="#7F1D1D" />
        </radialGradient>
      </D>
      {popup && <line x1="14" y1="14" x2="14" y2="26" stroke="#475569" strokeWidth="0.6" />}
      <circle cx={10} cy={popup ? 10 : 16} r={size} fill="url(#ai-b1)" />
      <circle cx={18} cy={popup ? 8 : 13} r={size * 0.9} fill="url(#ai-b2)" />
      {/* texture grain */}
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx={8 + (i * 2) % 12} cy={(popup ? 7 : 13) + (i * 3) % 6} r="0.4" fill="rgba(0,0,0,0.35)" />
      ))}
      {/* highlights */}
      <ellipse cx={8.5} cy={popup ? 8 : 14} rx="2" ry="1.2" fill="rgba(255,255,255,0.55)" />
    </>
  );
}

function CornSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-corn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </D>
      <ellipse cx="14" cy="14" rx="6.5" ry="10" fill="url(#ai-corn)" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}${c}`} cx={10 + c * 4} cy={7 + r * 4} r="1.4" fill="#FBBF24" stroke="#92400E" strokeWidth="0.4" />
        ))
      )}
      <path d="M14 4 Q9 7 9 11" stroke="#65A30D" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M14 4 Q19 7 19 11" stroke="#65A30D" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  );
}

function WormSvg({ small }: { small?: boolean }) {
  const w = small ? 1.6 : 2.6;
  return (
    <>
      <D>
        <linearGradient id="ai-worm" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F472B6" /><stop offset="50%" stopColor="#BE185D" /><stop offset="100%" stopColor="#831843" />
        </linearGradient>
      </D>
      <path d="M3 18 Q8 10 14 16 Q20 22 25 12" stroke="url(#ai-worm)" strokeWidth={w * 2} fill="none" strokeLinecap="round" />
      <path d="M3 18 Q8 10 14 16 Q20 22 25 12" stroke="rgba(255,255,255,0.35)" strokeWidth="0.7" fill="none" strokeLinecap="round" />
      {!small && <path d="M5 22 Q11 16 17 22 Q22 26 25 22" stroke="url(#ai-worm)" strokeWidth={w} fill="none" strokeLinecap="round" opacity="0.6" />}
    </>
  );
}

function FishBaitSvg({ dead }: { dead?: boolean }) {
  const body = dead ? '#94A3B8' : '#60A5FA';
  return (
    <>
      <D>
        <linearGradient id="ai-fish" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DBEAFE" /><stop offset="100%" stopColor={body} />
        </linearGradient>
      </D>
      <ellipse cx="13" cy="14" rx="9" ry="5" fill="url(#ai-fish)" stroke="#1E40AF" strokeWidth="0.6" />
      <polygon points="22,14 27,9 27,19" fill={body} stroke="#1E40AF" strokeWidth="0.6" />
      <circle cx={dead ? 8 : 9} cy="13" r="1" fill="#0F172A" />
      {dead && <line x1="7" y1="12" x2="9" y2="14" stroke="#0F172A" strokeWidth="0.6" />}
      {dead && <line x1="9" y1="12" x2="7" y2="14" stroke="#0F172A" strokeWidth="0.6" />}
      <path d="M5 14 Q8 12 12 14" stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" fill="none" />
    </>
  );
}

function SpinnerSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-spin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F1F5F9" /><stop offset="100%" stopColor="#64748B" />
        </linearGradient>
      </D>
      <line x1="14" y1="3" x2="14" y2="22" stroke="#94A3B8" strokeWidth="1" />
      <ellipse cx="18" cy="11" rx="3.5" ry="5.5" fill="url(#ai-spin)" stroke="#475569" strokeWidth="0.5" />
      <circle cx="14" cy="6" r="1.5" fill="#EF4444" />
      <path d="M14 22 Q11 24 12 26" stroke="#475569" strokeWidth="1.4" fill="none" />
      <path d="M14 22 Q17 24 16 26" stroke="#475569" strokeWidth="1.4" fill="none" />
    </>
  );
}

function SpoonSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-sp" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </D>
      <ellipse cx="14" cy="13" rx="5" ry="9" fill="url(#ai-sp)" stroke="#7C2D12" strokeWidth="0.6" />
      <ellipse cx="12" cy="9" rx="1.5" ry="3" fill="rgba(255,255,255,0.5)" />
      <path d="M14 22 L14 26" stroke="#475569" strokeWidth="1" />
    </>
  );
}

function JigSvg() {
  return (
    <>
      <D>
        <radialGradient id="ai-jighead" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#CBD5E1" /><stop offset="100%" stopColor="#1E293B" />
        </radialGradient>
      </D>
      <circle cx="9" cy="11" r="4.5" fill="url(#ai-jighead)" />
      <circle cx="7.5" cy="10" r="1" fill="#E4FF00" />
      <path d="M11 14 Q16 18 14 23 Q12 25 10 23" fill="none" stroke="#64748B" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13 13 Q22 14 24 22" stroke="#A78BFA" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85" />
    </>
  );
}

function PopperSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-pop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCA5A5" /><stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
      </D>
      <ellipse cx="14" cy="14" rx="9" ry="4" fill="url(#ai-pop)" stroke="#450A0A" strokeWidth="0.6" />
      <circle cx="7" cy="14" r="2.4" fill="#0F172A" />
      <circle cx="6.5" cy="13.5" r="0.6" fill="#fff" />
      <circle cx="17" cy="13" r="1" fill="#fff" />
    </>
  );
}

function CrankSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-cr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#34D399" /><stop offset="100%" stopColor="#065F46" />
        </linearGradient>
      </D>
      <ellipse cx="13" cy="14" rx="8" ry="5" fill="url(#ai-cr)" stroke="#064E3B" strokeWidth="0.6" />
      <path d="M5 14 L1 10 L1 18 Z" fill="#94A3B8" stroke="#475569" strokeWidth="0.5" />
      <circle cx="17" cy="13" r="1" fill="#fff" />
      <path d="M19 18 L23 22" stroke="#475569" strokeWidth="1" />
    </>
  );
}

function TwisterSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-tw" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FB7185" /><stop offset="100%" stopColor="#831843" />
        </linearGradient>
      </D>
      <path d="M4 12 Q12 10 18 14 Q23 18 26 14 Q24 22 18 22 Q10 22 4 14 Z" fill="url(#ai-tw)" stroke="#500724" strokeWidth="0.5" />
      <path d="M22 18 Q26 22 22 26" fill="none" stroke="#831843" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function PhosphorSvg() {
  return (
    <>
      <D>
        <radialGradient id="ai-ph" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="40%" stopColor="#22D3EE" />
          <stop offset="100%" stopColor="#0E7490" />
        </radialGradient>
        <filter id="ai-phglow"><feGaussianBlur stdDeviation="1.4" /></filter>
      </D>
      <circle cx="14" cy="14" r="9" fill="#22D3EE" filter="url(#ai-phglow)" opacity="0.6" />
      <ellipse cx="14" cy="14" rx="6" ry="8" fill="url(#ai-ph)" />
      <ellipse cx="12" cy="11" rx="1.4" ry="2.4" fill="rgba(255,255,255,0.85)" />
    </>
  );
}

function SoftLureSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-soft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" /><stop offset="100%" stopColor="#4C1D95" />
        </linearGradient>
      </D>
      <path d="M3 14 Q8 9 14 13 Q20 17 24 12 Q26 18 22 22 Q14 24 8 20 Q3 17 3 14 Z" fill="url(#ai-soft)" stroke="#2E1065" strokeWidth="0.5" />
      <circle cx="22" cy="13" r="0.8" fill="#fff" />
    </>
  );
}

function DoughSvg() {
  return (
    <>
      <D>
        <radialGradient id="ai-dough" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="100%" stopColor="#A8956F" />
        </radialGradient>
      </D>
      <ellipse cx="14" cy="15" rx="9" ry="7" fill="url(#ai-dough)" stroke="#78684B" strokeWidth="0.4" />
      <circle cx="11" cy="13" r="0.8" fill="rgba(255,255,255,0.7)" />
      <circle cx="17" cy="14" r="0.6" fill="rgba(255,255,255,0.7)" />
      <circle cx="13" cy="17" r="0.5" fill="rgba(0,0,0,0.15)" />
    </>
  );
}

function BreadSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-br" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCD34D" /><stop offset="100%" stopColor="#92400E" />
        </linearGradient>
      </D>
      <path d="M4 12 Q4 7 14 7 Q24 7 24 12 L23 22 Q14 24 5 22 Z" fill="url(#ai-br)" stroke="#78350F" strokeWidth="0.5" />
      <path d="M6 12 H22" stroke="rgba(0,0,0,0.25)" strokeWidth="0.5" />
    </>
  );
}

function PeaSvg() {
  return (
    <>
      <D>
        <radialGradient id="ai-pea" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#A7F3D0" /><stop offset="100%" stopColor="#065F46" />
        </radialGradient>
      </D>
      {[
        [9, 12], [14, 10], [19, 13], [11, 17], [17, 18], [13, 20],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.6" fill="url(#ai-pea)" stroke="#064E3B" strokeWidth="0.4" />
      ))}
    </>
  );
}

function PotatoSvg() {
  return (
    <>
      <D>
        <radialGradient id="ai-pot" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FDE68A" /><stop offset="100%" stopColor="#854D0E" />
        </radialGradient>
      </D>
      <ellipse cx="14" cy="14" rx="10" ry="7" fill="url(#ai-pot)" stroke="#422006" strokeWidth="0.5" />
      <circle cx="10" cy="13" r="0.5" fill="#422006" />
      <circle cx="16" cy="15" r="0.5" fill="#422006" />
      <circle cx="19" cy="12" r="0.4" fill="#422006" />
    </>
  );
}

function PelletSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-pel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8845D" /><stop offset="100%" stopColor="#3F2A14" />
        </linearGradient>
      </D>
      {[[7, 10], [13, 9], [19, 11], [9, 16], [16, 17], [21, 16], [11, 21]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 2} y={y - 1.5} width="4" height="3" rx="1" fill="url(#ai-pel)" />
          <line x1={x - 1.5} y1={y} x2={x + 1.5} y2={y} stroke="rgba(0,0,0,0.4)" strokeWidth="0.3" />
        </g>
      ))}
    </>
  );
}

function MaggotSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-mag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFBEB" /><stop offset="100%" stopColor="#D6D3D1" />
        </linearGradient>
      </D>
      {[[7, 11], [14, 13], [10, 18], [18, 17], [21, 12]].map(([x, y], i) => (
        <ellipse key={i} cx={x} cy={y} rx="2.5" ry="1.4" fill="url(#ai-mag)" stroke="#78716C" strokeWidth="0.3" transform={`rotate(${i * 25} ${x} ${y})`} />
      ))}
    </>
  );
}

function BloodwormSvg() {
  return (
    <>
      {[3, 9, 15].map((y, i) => (
        <path key={i} d={`M3 ${y + 6} Q10 ${y + 2} 17 ${y + 6} Q22 ${y + 9} 25 ${y + 5}`} stroke="#B91C1C" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      ))}
    </>
  );
}

function CrayfishSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-cf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FCA5A5" /><stop offset="100%" stopColor="#7F1D1D" />
        </linearGradient>
      </D>
      <ellipse cx="14" cy="15" rx="6" ry="4" fill="url(#ai-cf)" />
      <path d="M9 12 L4 8 M9 12 L4 13" stroke="#7F1D1D" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M19 12 L24 8 M19 12 L24 13" stroke="#7F1D1D" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M14 19 Q14 23 11 24 M14 19 Q14 23 17 24" stroke="#7F1D1D" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="13" r="0.6" fill="#0F172A" />
      <circle cx="16" cy="13" r="0.6" fill="#0F172A" />
    </>
  );
}

function GrasshopperSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-gh" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#86EFAC" /><stop offset="100%" stopColor="#14532D" />
        </linearGradient>
      </D>
      <ellipse cx="14" cy="15" rx="8" ry="3.5" fill="url(#ai-gh)" />
      <circle cx="22" cy="13" r="2.5" fill="url(#ai-gh)" />
      <path d="M10 16 L4 22 L9 19" stroke="#14532D" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <line x1="22" y1="11" x2="26" y2="6" stroke="#14532D" strokeWidth="0.6" />
      <line x1="23" y1="11" x2="27" y2="8" stroke="#14532D" strokeWidth="0.6" />
    </>
  );
}

function MusselSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-mu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1F2937" /><stop offset="100%" stopColor="#0B1220" />
        </linearGradient>
      </D>
      <path d="M5 22 Q3 12 14 5 Q25 12 23 22 Z" fill="url(#ai-mu)" stroke="#0F172A" strokeWidth="0.5" />
      <path d="M14 5 L14 22" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6" />
    </>
  );
}

function MethodSvg() {
  return (
    <>
      <D>
        <linearGradient id="ai-me" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A8956F" /><stop offset="100%" stopColor="#3F2A14" />
        </linearGradient>
      </D>
      <rect x="6" y="9" width="16" height="12" rx="2" fill="url(#ai-me)" stroke="#1F1408" strokeWidth="0.6" />
      <line x1="6" y1="13" x2="22" y2="13" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
      <line x1="6" y1="17" x2="22" y2="17" stroke="rgba(0,0,0,0.4)" strokeWidth="0.5" />
      <line x1="14" y1="3" x2="14" y2="9" stroke="#94A3B8" strokeWidth="1" />
    </>
  );
}

// ── Rigs (schematic but distinctive) ─────────────────────────
function RigSvg({ kind }: { kind: Kind }) {
  return (
    <>
      <line x1="14" y1="2" x2="14" y2="26" stroke="#22D3EE" strokeWidth="1" opacity="0.7" />
      {kind === 'rig-finesse' && (
        <>
          <ellipse cx="14" cy="9" rx="2" ry="3" fill="#475569" />
          <path d="M14 22 Q18 23 19 26 Q17 28 14 26" fill="none" stroke="#CBD5E1" strokeWidth="1.4" />
        </>
      )}
      {kind === 'rig-carolina' && (
        <>
          <ellipse cx="14" cy="11" rx="3.5" ry="2.5" fill="#475569" />
          <circle cx="14" cy="16" r="1.2" fill="#94A3B8" />
          <path d="M14 22 Q18 23 19 26" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
        </>
      )}
      {kind === 'rig-texas' && (
        <>
          <path d="M11 8 L17 8 L14 14 Z" fill="#475569" />
          <path d="M14 16 Q20 18 21 24" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
        </>
      )}
      {kind === 'rig-dropshot' && (
        <>
          <path d="M9 12 Q11 14 14 12" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
          <path d="M9 18 Q11 20 14 18" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
          <ellipse cx="14" cy="25" rx="3" ry="2" fill="#475569" />
        </>
      )}
      {kind === 'rig-leader' && (
        <>
          <line x1="14" y1="6" x2="14" y2="20" stroke="#22D3EE" strokeWidth="1.2" />
          <circle cx="14" cy="20" r="1.4" fill="#94A3B8" />
          <path d="M14 22 Q18 24 18 27" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
        </>
      )}
      {kind === 'rig-method' && (
        <>
          <rect x="8" y="8" width="12" height="9" rx="2" fill="#A8956F" stroke="#3F2A14" strokeWidth="0.5" />
          <path d="M14 17 Q19 20 19 25" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
        </>
      )}
      {kind === 'rig-feeder' && (
        <>
          <rect x="9" y="8" width="10" height="10" rx="1" fill="none" stroke="#94A3B8" strokeWidth="1" />
          <line x1="9" y1="11" x2="19" y2="11" stroke="#94A3B8" strokeWidth="0.6" />
          <line x1="9" y1="14" x2="19" y2="14" stroke="#94A3B8" strokeWidth="0.6" />
          <path d="M14 18 Q18 21 19 25" stroke="#CBD5E1" strokeWidth="1.4" fill="none" />
        </>
      )}
      {kind === 'rig-feeder-heavy' && (
        <>
          <rect x="6" y="7" width="16" height="13" rx="2" fill="#475569" stroke="#0F172A" strokeWidth="0.6" />
          <line x1="6" y1="11" x2="22" y2="11" stroke="#0F172A" strokeWidth="0.6" />
          <line x1="6" y1="15" x2="22" y2="15" stroke="#0F172A" strokeWidth="0.6" />
        </>
      )}
      {kind === 'rig-float' && (
        <>
          <ellipse cx="14" cy="9" rx="3" ry="5" fill="#EF4444" />
          <ellipse cx="14" cy="11.5" rx="3" ry="2" fill="#FFF" />
          <line x1="14" y1="14" x2="14" y2="22" stroke="#22D3EE" />
          <ellipse cx="14" cy="23" rx="1.5" ry="1" fill="#475569" />
        </>
      )}
      {kind === 'rig-bottom' && (
        <>
          <ellipse cx="14" cy="11" rx="3" ry="2" fill="#475569" />
          <path d="M14 14 Q18 18 22 22" stroke="#CBD5E1" strokeWidth="1.2" fill="none" />
          <path d="M22 22 H6" stroke="#78350F" strokeWidth="1.6" />
        </>
      )}
      {kind === 'rig-klonk' && (
        <>
          <path d="M8 6 L20 6 L17 14 L11 14 Z" fill="#78350F" stroke="#3F1A06" strokeWidth="0.6" />
          <line x1="14" y1="14" x2="14" y2="24" stroke="#22D3EE" />
          <ellipse cx="14" cy="24" rx="3" ry="1.5" fill="#475569" />
        </>
      )}
    </>
  );
}

function TechSvg({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'tech-slow':
      return <><path d="M3 14 Q14 4 25 14" stroke="#22D3EE" strokeWidth="2" fill="none" strokeLinecap="round" /><polygon points="25,14 21,11 21,17" fill="#22D3EE" /></>;
    case 'tech-fast':
      return <><path d="M3 10 H22 M3 14 H22 M3 18 H22" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" /><polygon points="25,14 19,9 19,19" fill="#22D3EE" /></>;
    case 'tech-twitch':
      return <><path d="M3 14 L8 8 L13 20 L18 8 L23 20 L26 14" stroke="#22D3EE" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></>;
    case 'tech-jig':
      return <><path d="M3 22 Q8 6 14 22 Q20 6 25 22" stroke="#22D3EE" strokeWidth="2" fill="none" strokeLinecap="round" /></>;
    case 'tech-troll':
      return <><path d="M3 12 Q14 16 25 12" stroke="#22D3EE" strokeWidth="2" fill="none" /><circle cx="25" cy="12" r="2" fill="#475569" /><path d="M3 18 Q14 22 25 18" stroke="#22D3EE" strokeWidth="1" fill="none" opacity="0.5" /></>;
    case 'tech-bottom':
      return <><line x1="3" y1="22" x2="25" y2="22" stroke="#78350F" strokeWidth="2" /><path d="M14 4 L14 22" stroke="#22D3EE" /><circle cx="14" cy="22" r="2" fill="#475569" /></>;
  }
  return null;
}

function LocSvg({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'loc-deep':
      return <><path d="M2 8 Q14 12 26 8" stroke="#22D3EE" strokeWidth="1.4" fill="none" /><path d="M2 14 Q14 18 26 14" stroke="#22D3EE" strokeWidth="1.4" fill="none" opacity="0.7" /><path d="M2 20 Q14 24 26 20" stroke="#22D3EE" strokeWidth="1.4" fill="none" opacity="0.5" /><path d="M14 9 L14 24" stroke="#94A3B8" strokeDasharray="1 1" /></>;
    case 'loc-mid':
      return <><path d="M2 8 Q14 12 26 8" stroke="#22D3EE" strokeWidth="1.2" fill="none" opacity="0.6" /><path d="M2 16 Q14 20 26 16" stroke="#22D3EE" strokeWidth="2" fill="none" /><path d="M2 24 H26" stroke="#78350F" strokeWidth="1.4" /></>;
    case 'loc-shallow':
      return <><path d="M2 18 Q14 14 26 18" stroke="#22D3EE" strokeWidth="2" fill="none" /><path d="M2 22 H26" stroke="#78350F" strokeWidth="1.6" /></>;
    case 'loc-structure':
      return <><path d="M3 22 L7 12 L11 22 Z M11 22 L16 8 L21 22 Z M21 22 L25 14 L26 22 Z" fill="#475569" stroke="#0F172A" strokeWidth="0.4" /><path d="M2 24 H26" stroke="#22D3EE" strokeWidth="1.2" /></>;
    case 'loc-open':
      return <><circle cx="14" cy="14" r="10" fill="none" stroke="#22D3EE" strokeWidth="1.4" /><path d="M2 14 H26 M14 2 V26" stroke="#22D3EE" strokeWidth="0.6" opacity="0.5" /></>;
    case 'loc-shore':
      return <><path d="M2 16 H14 L18 12 L26 12 L26 24 L2 24 Z" fill="#78350F" stroke="#3F1A06" strokeWidth="0.5" /><path d="M2 16 H14" stroke="#22D3EE" strokeWidth="1.4" /></>;
  }
  return null;
}

function TimeSvg({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'time-dawn':
    case 'time-morning':
      return <><circle cx="14" cy="18" r="5" fill="#FBBF24" /><path d="M2 24 H26" stroke="#0F172A" strokeWidth="0.8" />{kind === 'time-dawn' && <path d="M14 12 V8 M8 14 L5 11 M20 14 L23 11" stroke="#FBBF24" strokeWidth="1.4" />}</>;
    case 'time-midday':
      return <><circle cx="14" cy="14" r="6" fill="#FDE047" /><path d="M14 4 V2 M14 26 V24 M4 14 H2 M26 14 H24 M6 6 L4 4 M22 6 L24 4 M6 22 L4 24 M22 22 L24 24" stroke="#FDE047" strokeWidth="1.4" /></>;
    case 'time-afternoon':
      return <><circle cx="14" cy="14" r="5" fill="#F97316" /><path d="M14 5 V3 M5 14 H3 M23 14 H25 M7 7 L5 5 M21 7 L23 5" stroke="#F97316" strokeWidth="1.2" /></>;
    case 'time-evening':
      return <><circle cx="14" cy="20" r="5" fill="#F97316" /><path d="M2 24 H26" stroke="#0F172A" strokeWidth="0.8" /><path d="M5 18 L3 16 M23 18 L25 16" stroke="#F97316" strokeWidth="1.2" /></>;
    case 'time-night':
      return <><path d="M20 6 A10 10 0 1 0 22 20 A8 8 0 1 1 20 6 Z" fill="#E2E8F0" /><circle cx="6" cy="8" r="0.8" fill="#fff" /><circle cx="22" cy="22" r="0.6" fill="#fff" /></>;
  }
  return null;
}

function CondSvg({ kind }: { kind: Kind }) {
  switch (kind) {
    case 'cond-clear':
      return <><circle cx="14" cy="14" r="9" fill="none" stroke="#22D3EE" strokeWidth="1.2" /><circle cx="14" cy="14" r="2" fill="#22D3EE" /></>;
    case 'cond-murky':
      return <><rect x="3" y="6" width="22" height="16" fill="#78684B" opacity="0.7" /><path d="M3 12 Q14 14 25 12 M3 17 Q14 19 25 17" stroke="#A8956F" strokeWidth="1.4" fill="none" /></>;
    case 'cond-current':
      return <><path d="M3 8 Q14 12 25 8 M3 14 Q14 18 25 14 M3 20 Q14 24 25 20" stroke="#22D3EE" strokeWidth="1.6" fill="none" /></>;
    case 'cond-still':
      return <><path d="M3 10 H25 M3 16 H25 M3 22 H25" stroke="#22D3EE" strokeWidth="1.4" /></>;
    case 'cond-rain':
      return <><path d="M5 10 Q5 5 12 5 Q20 5 20 11 Q24 11 24 14 Q24 17 20 17 H8 Q4 17 4 14 Q4 11 5 10 Z" fill="#94A3B8" /><line x1="8" y1="20" x2="7" y2="25" stroke="#22D3EE" strokeWidth="1.4" /><line x1="14" y1="20" x2="13" y2="25" stroke="#22D3EE" strokeWidth="1.4" /><line x1="20" y1="20" x2="19" y2="25" stroke="#22D3EE" strokeWidth="1.4" /></>;
    case 'cond-wind':
      return <><path d="M3 10 H18 Q22 10 22 7 Q22 4 19 4" stroke="#CBD5E1" strokeWidth="1.6" fill="none" strokeLinecap="round" /><path d="M3 16 H22 Q26 16 26 19 Q26 22 23 22" stroke="#CBD5E1" strokeWidth="1.6" fill="none" strokeLinecap="round" /></>;
  }
  return null;
}

function DefaultSvg() {
  return <><circle cx="14" cy="14" r="9" fill="none" stroke="#22D3EE" strokeWidth="1.4" /><path d="M9 14 Q14 9 19 14 Q14 19 9 14 Z" fill="#22D3EE" opacity="0.4" /></>;
}

function renderKind(kind: Kind, badge?: string): React.ReactNode {
  switch (kind) {
    case 'hook': return <HookSvg badge={badge} />;
    case 'treble-hook': return <TrebleHookSvg />;
    case 'offset-hook': return <OffsetHookSvg />;
    case 'line-fluoro': return <LineSvg color="#67E8F9" badge={badge} />;
    case 'line-braid': return <LineSvg color="#A78BFA" badge={badge} />;
    case 'line-mono': return <LineSvg color="#FDE68A" badge={badge} />;
    case 'weight-none': return <WeightSvg size="none" />;
    case 'weight-light': return <WeightSvg size="light" badge={badge} />;
    case 'weight-medium': return <WeightSvg size="medium" badge={badge} />;
    case 'weight-heavy': return <WeightSvg size="heavy" badge={badge} />;
    case 'boilie-small': return <BoilieSvg size={3.6} />;
    case 'boilie-medium': return <BoilieSvg size={4.5} />;
    case 'boilie-large': return <BoilieSvg size={5.5} />;
    case 'boilie-popup': return <BoilieSvg size={4.5} popup />;
    case 'corn': return <CornSvg />;
    case 'worm-small': return <WormSvg small />;
    case 'worm-large': return <WormSvg />;
    case 'baitfish': return <FishBaitSvg />;
    case 'deadfish': return <FishBaitSvg dead />;
    case 'spinner': return <SpinnerSvg />;
    case 'spoon': return <SpoonSvg />;
    case 'jig': return <JigSvg />;
    case 'popper': return <PopperSvg />;
    case 'crank': return <CrankSvg />;
    case 'twister': return <TwisterSvg />;
    case 'phosphor': return <PhosphorSvg />;
    case 'soft-lure': return <SoftLureSvg />;
    case 'dough': return <DoughSvg />;
    case 'bread': return <BreadSvg />;
    case 'pea': return <PeaSvg />;
    case 'potato': return <PotatoSvg />;
    case 'pellet': return <PelletSvg />;
    case 'method': return <MethodSvg />;
    case 'maggot': return <MaggotSvg />;
    case 'bloodworm': return <BloodwormSvg />;
    case 'crayfish': return <CrayfishSvg />;
    case 'grasshopper': return <GrasshopperSvg />;
    case 'mussel': return <MusselSvg />;
    case 'rig-finesse':
    case 'rig-carolina':
    case 'rig-texas':
    case 'rig-dropshot':
    case 'rig-leader':
    case 'rig-method':
    case 'rig-feeder':
    case 'rig-feeder-heavy':
    case 'rig-float':
    case 'rig-bottom':
    case 'rig-klonk':
      return <RigSvg kind={kind} />;
    case 'tech-slow':
    case 'tech-fast':
    case 'tech-twitch':
    case 'tech-jig':
    case 'tech-troll':
    case 'tech-bottom':
      return <TechSvg kind={kind} />;
    case 'loc-deep':
    case 'loc-mid':
    case 'loc-shallow':
    case 'loc-structure':
    case 'loc-open':
    case 'loc-shore':
      return <LocSvg kind={kind} />;
    case 'time-dawn':
    case 'time-morning':
    case 'time-midday':
    case 'time-afternoon':
    case 'time-evening':
    case 'time-night':
      return <TimeSvg kind={kind} />;
    case 'cond-clear':
    case 'cond-murky':
    case 'cond-current':
    case 'cond-still':
    case 'cond-rain':
    case 'cond-wind':
      return <CondSvg kind={kind} />;
    default:
      return <DefaultSvg />;
  }
}

export interface AdviceIconProps {
  /** Bulgarian advice label (e.g. "Куки №8-10", "Влакно 0.30+", "Method mix") */
  name: string;
  /** Pixel size of the icon (square). Default 28. */
  size?: number;
  /** Optional aria-label override. */
  alt?: string;
}

/**
 * Premium 3D-styled SVG icon for fishing advice items.
 * Resolves the icon kind from the label text — covers ~50 variations.
 */
export const AdviceIcon = memo(function AdviceIcon({ name, size = 28, alt }: AdviceIconProps) {
  const { kind, badge } = resolve(name);
  return (
    <span
      role="img"
      aria-label={alt ?? name}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg
        viewBox="0 0 28 28"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter:
            'drop-shadow(0 1px 1px rgba(0,0,0,0.45)) drop-shadow(0 0 2px rgba(34,211,238,0.15))',
        }}
      >
        {renderKind(kind, badge)}
      </svg>
    </span>
  );
});
