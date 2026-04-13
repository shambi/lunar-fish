/**
 * Premium Bait & Tackle Icons Component
 * Реалистични визуализации за стръв и такъми
 */

// BAITS - Стръв
export function EarthwormsIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="35" ry="8" fill="rgba(0,0,0,0.15)" />
      
      {/* First worm - curved, more realistic */}
      <g>
        <path
          d="M 20 50 Q 35 40 50 50 Q 65 60 75 45"
          stroke="#C41E3A"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="22" cy="50" rx="5" ry="6" fill="#A01830" />
        {/* Segments */}
        <circle cx="35" cy="45" r="2" fill="#B81D37" />
        <circle cx="50" cy="50" r="2" fill="#B81D37" />
        <circle cx="65" cy="55" r="2" fill="#B81D37" />
      </g>
      
      {/* Second worm - wavy, more detailed */}
      <g>
        <path
          d="M 30 65 Q 45 60 60 70 Q 75 80 85 65"
          stroke="#E84856"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <ellipse cx="32" cy="64" rx="4" ry="5" fill="#C41E3A" />
        {/* Segments */}
        <circle cx="45" cy="67" r="1.5" fill="#D63447" />
        <circle cx="60" cy="72" r="1.5" fill="#D63447" />
        <circle cx="75" cy="75" r="1.5" fill="#D63447" />
      </g>
      
      {/* Third worm - coiled, more natural */}
      <g>
        <path
          d="M 45 80 Q 55 75 65 85 Q 75 95 65 100"
          stroke="#D63447"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Segments */}
        <circle cx="55" cy="78" r="1.5" fill="#C41E3A" />
        <circle cx="65" cy="85" r="1.5" fill="#C41E3A" />
      </g>
      
      {/* Wet shine effect - more realistic */}
      <defs>
        <linearGradient id="wormShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
      </defs>
      <path
        d="M 25 48 Q 40 42 55 50 Q 70 58 80 48"
        stroke="url(#wormShine)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function BoiliIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="40" ry="10" fill="rgba(0,0,0,0.15)" />
      
      {/* Boili 1 - Yellow - more realistic sphere */}
      <g>
        <circle cx="35" cy="45" r="18" fill="#FFD700" />
        <circle cx="35" cy="45" r="18" fill="url(#boiliYellow)" />
        {/* Highlight */}
        <ellipse cx="28" cy="38" rx="6" ry="8" fill="rgba(255,255,255,0.6)" />
        {/* Texture dots */}
        <circle cx="35" cy="35" r="1" fill="rgba(0,0,0,0.1)" />
        <circle cx="42" cy="40" r="0.8" fill="rgba(0,0,0,0.08)" />
      </g>
      
      {/* Boili 2 - Orange - more detailed */}
      <g>
        <circle cx="60" cy="50" r="20" fill="#FF8C42" />
        <circle cx="60" cy="50" r="20" fill="url(#boiliOrange)" />
        {/* Highlight */}
        <ellipse cx="50" cy="38" rx="7" ry="9" fill="rgba(255,255,255,0.5)" />
        {/* Texture */}
        <circle cx="60" cy="40" r="1.2" fill="rgba(0,0,0,0.12)" />
        <circle cx="68" cy="45" r="1" fill="rgba(0,0,0,0.1)" />
        <circle cx="55" cy="60" r="0.9" fill="rgba(0,0,0,0.08)" />
      </g>
      
      {/* Boili 3 - Pink - more glossy */}
      <g>
        <circle cx="80" cy="65" r="16" fill="#FF6B9D" />
        <circle cx="80" cy="65" r="16" fill="url(#boiliPink)" />
        {/* Highlight */}
        <ellipse cx="75" cy="56" rx="5" ry="6" fill="rgba(255,255,255,0.55)" />
        {/* Texture */}
        <circle cx="80" cy="58" r="0.8" fill="rgba(0,0,0,0.09)" />
        <circle cx="85" cy="62" r="0.7" fill="rgba(0,0,0,0.07)" />
      </g>
      
      <defs>
        <radialGradient id="boiliYellow">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="boiliOrange">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="boiliPink">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="70%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function DoughIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="100" rx="38" ry="10" fill="rgba(0,0,0,0.15)" />
      
      {/* Dough ball main - more realistic shape */}
      <g>
        <ellipse cx="60" cy="55" rx="26" ry="24" fill="#F5DEB3" />
        <ellipse cx="60" cy="55" rx="26" ry="24" fill="url(#doughGradient)" />
        
        {/* More detailed texture - irregular surface */}
        <circle cx="45" cy="42" r="2.5" fill="rgba(0,0,0,0.08)" />
        <circle cx="70" cy="38" r="2" fill="rgba(0,0,0,0.06)" />
        <circle cx="50" cy="65" r="1.8" fill="rgba(0,0,0,0.1)" />
        <circle cx="75" cy="60" r="2.2" fill="rgba(0,0,0,0.07)" />
        <circle cx="55" cy="48" r="1.5" fill="rgba(0,0,0,0.05)" />
        <circle cx="65" cy="52" r="1.2" fill="rgba(0,0,0,0.04)" />
        <circle cx="58" cy="62" r="1.8" fill="rgba(0,0,0,0.09)" />
      </g>
      
      {/* Fishing hook - more detailed */}
      <g>
        {/* Hook shank */}
        <path
          d="M 60 25 L 60 45"
          stroke="#C0C0C0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Hook eye */}
        <circle cx="60" cy="23" r="3" fill="#A9A9A9" />
        <circle cx="60" cy="23" r="2" fill="#C0C0C0" />
        {/* Hook bend and point */}
        <path
          d="M 60 45 Q 70 48 72 58"
          stroke="#C0C0C0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Barb */}
        <path
          d="M 72 58 L 69 54"
          stroke="#A9A9A9"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
      
      {/* Shine on dough */}
      <ellipse cx="48" cy="45" rx="6" ry="7" fill="rgba(255,255,255,0.25)" />
      
      <defs>
        <radialGradient id="doughGradient">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="60%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.08)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function CornIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="35" ry="10" fill="rgba(0,0,0,0.15)" />
      
      {/* Corn kernels arranged naturally */}
      {/* Row 1 */}
      <g>
        <circle cx="35" cy="35" r="9" fill="#FFD700" />
        <circle cx="35" cy="35" r="9" fill="url(#cornShine1)" />
        <ellipse cx="32" cy="32" rx="3" ry="4" fill="rgba(255,255,255,0.4)" />
      </g>
      
      <g>
        <circle cx="55" cy="30" r="9.5" fill="#FFC700" />
        <circle cx="55" cy="30" r="9.5" fill="url(#cornShine2)" />
        <ellipse cx="52" cy="27" rx="3.5" ry="4" fill="rgba(255,255,255,0.35)" />
      </g>
      
      <g>
        <circle cx="75" cy="35" r="9" fill="#FFE680" />
        <circle cx="75" cy="35" r="9" fill="url(#cornShine3)" />
        <ellipse cx="72" cy="32" rx="3" ry="4" fill="rgba(255,255,255,0.3)" />
      </g>
      
      {/* Row 2 */}
      <g>
        <circle cx="45" cy="55" r="10" fill="#FFD700" />
        <circle cx="45" cy="55" r="10" fill="url(#cornShine1)" />
        <ellipse cx="41" cy="51" rx="3.5" ry="4.5" fill="rgba(255,255,255,0.35)" />
      </g>
      
      <g>
        <circle cx="65" cy="60" r="9.5" fill="#FFC700" />
        <circle cx="65" cy="60" r="9.5" fill="url(#cornShine2)" />
        <ellipse cx="62" cy="57" rx="3.5" ry="4" fill="rgba(255,255,255,0.3)" />
      </g>
      
      {/* Row 3 */}
      <g>
        <circle cx="55" cy="80" r="9" fill="#FFE680" />
        <circle cx="55" cy="80" r="9" fill="url(#cornShine3)" />
        <ellipse cx="52" cy="77" rx="3" ry="4" fill="rgba(255,255,255,0.25)" />
      </g>
      
      <defs>
        <radialGradient id="cornShine1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="60%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cornShine2">
          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
          <stop offset="60%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="cornShine3">
          <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
          <stop offset="60%" stopColor="transparent" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// TACKLE - Такъми
export function HookIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="30" ry="8" fill="rgba(0,0,0,0.15)" />
      
      {/* Hook main body - more detailed */}
      <g>
        {/* Eye - more realistic */}
        <circle cx="60" cy="18" r="3.5" fill="#C0C0C0" stroke="#808080" strokeWidth="0.8" />
        <circle cx="60" cy="18" r="2" fill="#E8E8E8" />
        
        {/* Shank - tapered */}
        <path
          d="M 60 21.5 L 60 65"
          stroke="#B8B8B8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        
        {/* Point curve - more realistic bend */}
        <path
          d="M 60 65 Q 72 68 76 80 Q 78 85 76 90"
          stroke="#B8B8B8"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        
        {/* Sharp point */}
        <path
          d="M 76 90 L 78 92"
          stroke="#A0A0A0"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        
        {/* Barb - more detailed */}
        <path
          d="M 76 90 L 73 86"
          stroke="#808080"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M 73 86 L 71 88"
          stroke="#606060"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>
      
      {/* Metal shine - more realistic */}
      <defs>
        <linearGradient id="hookShine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="70%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </linearGradient>
      </defs>
      <path
        d="M 58 25 L 58 60 Q 65 65 70 75"
        stroke="url(#hookShine)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Size label - more prominent */}
      <text
        x="60"
        y="105"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#404040"
      >
        №12-14
      </text>
    </svg>
  );
}

export function FluorocarbonIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="35" ry="10" fill="rgba(0,0,0,0.15)" />
      
      {/* Spool of fluorocarbon line */}
      <g>
        {/* Spool base */}
        <circle cx="60" cy="55" r="32" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <circle cx="60" cy="55" r="30" fill="none" stroke="#333333" strokeWidth="1" />
        
        {/* Wrapped line coils - multiple rounds */}
        <circle cx="60" cy="55" r="28" fill="none" stroke="#4da6ff" strokeWidth="1.5" opacity="0.8" />
        <circle cx="60" cy="55" r="25" fill="none" stroke="#3d94ff" strokeWidth="1.5" opacity="0.8" />
        <circle cx="60" cy="55" r="22" fill="none" stroke="#2d82ff" strokeWidth="1.5" opacity="0.8" />
        
        {/* Center hub */}
        <circle cx="60" cy="55" r="8" fill="#404040" />
        <circle cx="60" cy="55" r="6" fill="#555555" />
      </g>
      
      {/* Highlight/shine effect */}
      <ellipse cx="45" cy="40" rx="12" ry="10" fill="rgba(255,255,255,0.15)" />
      
      {/* Diameter label */}
      <text
        x="60"
        y="100"
        textAnchor="middle"
        fontSize="12"
        fontWeight="bold"
        fill="#0066cc"
      >
        0.16mm
      </text>
    </svg>
  );
}

export function WeightIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="32" ry="10" fill="rgba(0,0,0,0.2)" />
      
      {/* Main weight body - olive shape */}
      <g>
        <ellipse cx="60" cy="50" rx="20" ry="28" fill="#2a2a2a" />
        <ellipse cx="60" cy="50" rx="20" ry="28" fill="url(#weightGradient)" />
        
        {/* Highlight on top */}
        <ellipse cx="52" cy="32" rx="6" ry="8" fill="rgba(255,255,255,0.15)" />
        
        {/* Split line (for olive weight appearance) */}
        <line x1="40" y1="50" x2="80" y2="50" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
      </g>
      
      {/* Hole through weight */}
      <g>
        <line x1="60" y1="25" x2="60" y2="75" stroke="#444444" strokeWidth="1" />
        <circle cx="60" cy="25" r="1.5" fill="#333333" />
        <circle cx="60" cy="75" r="1.5" fill="#333333" />
      </g>
      
      <defs>
        <radialGradient id="weightGradient">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="50%" stopColor="transparent" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function RigIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bait-icon"
      width="100%"
      height="100%"
    >
      {/* Background shadow */}
      <ellipse cx="60" cy="105" rx="33" ry="10" fill="rgba(0,0,0,0.15)" />
      
      {/* Main line - thin fluorocarbon */}
      <g>
        <path
          d="M 60 12 L 60 50"
          stroke="#4da6ff"
          strokeWidth="1.5"
          opacity="0.95"
          strokeLinecap="round"
        />
        {/* Line shine */}
        <path
          d="M 60 12 L 60 50"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="0.8"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* Professional knot at top */}
        <circle cx="60" cy="12" r="2.5" fill="#4da6ff" />
        <circle cx="60" cy="12" r="1.5" fill="#6bb8ff" />
      </g>
      
      {/* Small hook - finesse style */}
      <g>
        {/* Hook eye */}
        <circle cx="60" cy="50" r="1.5" fill="#C0C0C0" />
        {/* Hook shank */}
        <path
          d="M 60 51.5 L 60 58"
          stroke="#B8B8B8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Hook bend */}
        <path
          d="M 60 58 Q 65 60 66 68"
          stroke="#B8B8B8"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Sharp point */}
        <path
          d="M 66 68 L 67 70"
          stroke="#A0A0A0"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        {/* Micro barb */}
        <path
          d="M 66 68 L 64 66"
          stroke="#808080"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
      </g>
      
      {/* Small lead weight - finesse style */}
      <g>
        <ellipse cx="45" cy="60" rx="4" ry="6" fill="#2a2a2a" />
        <ellipse cx="45" cy="60" rx="4" ry="6" fill="url(#rigWeightGrad)" />
        {/* Weight hole */}
        <ellipse cx="45" cy="60" rx="1" ry="3" fill="#1a1a1a" />
        {/* Weight shine */}
        <ellipse cx="43" cy="57" rx="1.5" ry="2" fill="rgba(255,255,255,0.2)" />
      </g>
      
      {/* Technical details - swivel/connector */}
      <g>
        <circle cx="60" cy="50" r="2" fill="#C0C0C0" stroke="#808080" strokeWidth="0.5" />
        <circle cx="60" cy="50" r="1" fill="#E0E0E0" />
      </g>
      
      <defs>
        <radialGradient id="rigWeightGrad">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// Container component for displaying icon with label
interface BaitTackleDisplayProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function BaitTackleDisplay({ icon, label, className = '' }: BaitTackleDisplayProps) {
  return (
    <div className={`flex items-center gap-3 mb-2 ${className}`}>
      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium" style={{ color: '#E2E8F0' }}>{label}</span>
    </div>
  );
}

export const BAIT_ICONS = {
  earthworms: <EarthwormsIcon />,
  boili: <BoiliIcon />,
  dough: <DoughIcon />,
  corn: <CornIcon />,
};

export const TACKLE_ICONS = {
  hook: <HookIcon />,
  fluorocarbon: <FluorocarbonIcon />,
  weight: <WeightIcon />,
  rig: <RigIcon />,
};
