import { useState } from 'react';

interface WindCompassProps {
  degrees: number;
  speedKmh: number;
}

const DIRS = [
  'северен', 'североизточен', 'източен', 'югоизточен',
  'южен', 'югозападен', 'западен', 'северозападен',
];

function dirName(deg: number): string {
  return DIRS[Math.round(((deg % 360) + 360) % 360 / 45) % 8];
}

export function WindCompass({ degrees, speedKmh }: WindCompassProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-row items-center justify-center gap-2.5 w-full">
      <div className="flex flex-col items-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#2eb5b7" strokeWidth="1.5" strokeLinecap="round">
          <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
          <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
          <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
        </svg>
        <div className="text-sm font-bold leading-none text-white mt-1">{speedKmh}</div>
        <div className="text-[7px] mt-0.5 opacity-50 tracking-wider">КМ/Ч</div>
      </div>

      <div className="relative flex items-center justify-center">
        {open && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0f1415',
              border: '0.5px solid rgba(46,181,183,0.5)',
              borderRadius: '8px',
              padding: '5px 11px',
              whiteSpace: 'nowrap',
              fontSize: '11px',
              color: '#dee4e3',
              zIndex: 20,
              pointerEvents: 'none',
            }}
          >
            {degrees}° — {dirName(degrees)}
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          onBlur={() => setOpen(false)}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'block' }}
          aria-label={`Посока на вятъра: ${degrees} градуса, ${dirName(degrees)}`}
        >
          <svg width="46" height="46" viewBox="0 0 46 46">
            <circle cx="23" cy="23" r="20" fill="none" stroke="#2eb5b7" strokeWidth="1.2" />
            <circle cx="23" cy="23" r="14" fill="none" stroke="rgba(46,181,183,0.12)" strokeWidth="0.5" />
            <text x="23" y="6" textAnchor="middle" dominantBaseline="middle"
              fill="#5cd8da" fontSize="5" fontWeight="700" fontFamily="monospace">N</text>
            <text x="40" y="23" textAnchor="middle" dominantBaseline="middle"
              fill="#5cd8da" fontSize="5" fontWeight="700" fontFamily="monospace">E</text>
            <text x="23" y="40" textAnchor="middle" dominantBaseline="middle"
              fill="#5cd8da" fontSize="5" fontWeight="700" fontFamily="monospace">S</text>
            <text x="6" y="23" textAnchor="middle" dominantBaseline="middle"
              fill="#5cd8da" fontSize="5" fontWeight="700" fontFamily="monospace">W</text>
            <g transform={`rotate(${degrees}, 23, 23)`}>
              <polygon points="23,8 21,17 23,15 25,17" fill="#C8E63C" />
              <polygon points="23,38 21,29 23,31 25,29" fill="#3d4949" />
              <circle cx="23" cy="23" r="2.5" fill="#dee4e3" />
              <circle cx="23" cy="23" r="1.2" fill="#0f1415" />
            </g>
          </svg>
        </button>
      </div>
    </div>
  );
}
