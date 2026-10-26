import type { CSSProperties } from "react";

type MascotProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
  wink?: boolean;
};

const ink = "#302a25";

function Eyes({ y = 56, gap = 20, cx = 60, scale = 1, wink = false }: { y?: number; gap?: number; cx?: number; scale?: number; wink?: boolean }) {
  return (
    <g>
      <ellipse cx={cx - gap / 2} cy={y} rx={7.4 * scale} ry={8.6 * scale} fill="white" stroke={ink} strokeWidth={1.4} />
      <ellipse cx={cx + gap / 2} cy={y} rx={7.4 * scale} ry={8.6 * scale} fill="white" stroke={ink} strokeWidth={1.4} />
      <circle cx={cx - gap / 2 + 1.6} cy={y + 1.4} r={3.1 * scale} fill={ink} />
      <circle cx={cx + gap / 2 + 1.6} cy={y + 1.4} r={3.1 * scale} fill={ink} />
      <circle cx={cx - gap / 2 + 0.4} cy={y - 0.6} r={1.1 * scale} fill="white" />
      <circle cx={cx + gap / 2 + 0.4} cy={y - 0.6} r={1.1 * scale} fill="white" />
      {wink ? (
        <path d={`M${cx + gap / 2 - 6} ${y - 2} q6 5 11 0`} fill="none" stroke={ink} strokeWidth={2.6} strokeLinecap="round" />
      ) : null}
    </g>
  );
}

function Smile({ y = 70, cx = 60, w = 15 }: { y?: number; cx?: number; w?: number }) {
  return (
    <g>
      <path
        d={`M${cx - w / 2} ${y} q${w / 2} ${w * 0.62} ${w} 0`}
        fill="none"
        stroke={ink}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <circle cx={cx - w / 2 - 8} cy={y - 2} r={4.2} fill="#ff8a8a" opacity={0.55} />
      <circle cx={cx + w / 2 + 8} cy={y - 2} r={4.2} fill="#ff8a8a" opacity={0.55} />
    </g>
  );
}

export function StarMascot({ size = 96, className, style, wink }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <path
        d="M60 9 L74 42 L110 45 L82.5 69 L91 104.5 L60 85 L29 104.5 L37.5 69 L10 45 L46 42 Z"
        fill="#FFC83B"
        stroke={ink}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Eyes y={55} gap={20} wink={wink} />
      <Smile y={68} w={14} />
      <path d="M22 34 q5 -5 10 -1" stroke="white" strokeWidth={3.4} strokeLinecap="round" opacity={0.7} fill="none" />
    </svg>
  );
}

export function AppleMascot({ size = 96, className, style, wink }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <path d="M60 33 C48 20 22 22 18 45 C13 72 34 100 60 109 C86 100 107 72 102 45 C98 22 72 20 60 33 Z" fill="#FF5252" stroke={ink} strokeWidth={4} strokeLinejoin="round" />
      <path d="M60 31 C60 21 63 14 70 10" fill="none" stroke={ink} strokeWidth={4.2} strokeLinecap="round" />
      <path d="M64 22 C75 10 90 13 87 24 C83 33 68 31 64 22 Z" fill="#9BB068" stroke={ink} strokeWidth={3.2} strokeLinejoin="round" />
      <Eyes y={55} gap={22} />
      <Smile y={70} w={16} />
      <ellipse cx={35} cy={48} rx={6} ry={3.4} fill="white" opacity={0.36} transform="rotate(-28 35 48)" />
    </svg>
  );
}

export function HeartMascot({ size = 96, className, style, wink }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <path
        d="M60 107 C24 82 10 60 19 40 C28 21 51 20 60 39 C69 20 92 21 101 40 C110 60 96 82 60 107 Z"
        fill="#CCA4DB"
        stroke={ink}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Eyes y={52} gap={22} wink={wink} />
      <Smile y={70} w={16} />
      <path d="M30 38 q6 -7 14 -4" stroke="white" strokeWidth={3.6} strokeLinecap="round" opacity={0.6} fill="none" />
    </svg>
  );
}

export function OctopusMascot({ size = 96, className, style, wink }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <path
        d="M21 56 C21 30 38 13 60 13 C82 13 99 30 99 56 L99 76 C99 82 94 86 88 83 L82 80 C78 89 68 90 61 82 C54 90 44 89 40 80 L32 84 C25 87 21 82 21 76 Z"
        fill="#9BB068"
        stroke={ink}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <path d="M30 80 C24 92 28 103 38 100 C33 93 36 86 42 82" fill="#9BB068" stroke={ink} strokeWidth={3.4} strokeLinejoin="round" />
      <path d="M90 80 C96 92 92 103 82 100 C87 93 84 86 78 82" fill="#9BB068" stroke={ink} strokeWidth={3.4} strokeLinejoin="round" />
      <Eyes y={50} gap={23} wink={wink} />
      <Smile y={67} w={17} />
      <path d="M33 31 q5 -6 12 -3" stroke="#e8f6dc" strokeWidth={3.4} strokeLinecap="round" opacity={0.8} fill="none" />
    </svg>
  );
}

export function SunMascot({ size = 96, className, style, wink }: MascotProps) {
  const rays = Array.from({ length: 12 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 12;
    const x1 = 60 + Math.cos(angle) * 42;
    const y1 = 60 + Math.sin(angle) * 42;
    const x2 = 60 + Math.cos(angle) * 51;
    const y2 = 60 + Math.sin(angle) * 51;
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FF5252" strokeWidth={5} strokeLinecap="round" />;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      {rays}
      <circle cx={60} cy={60} r={36} fill="#FFC83B" stroke={ink} strokeWidth={4} />
      <Eyes y={56} gap={19} />
      <Smile y={72} w={16} />
    </svg>
  );
}

export function CloudMascot({ size = 96, className, style, wink }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <path
        d="M28 86 C10 86 6 66 20 58 C16 40 36 27 50 37 C56 18 83 16 91 35 C111 36 115 62 100 71 C108 88 88 98 74 90 C66 102 44 101 38 88 Z"
        fill="#FFFDF8"
        stroke={ink}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <Eyes y={59} gap={21} wink={wink} />
      <Smile y={73} w={15} />
    </svg>
  );
}

export const MASCOTS = {
  star: StarMascot,
  apple: AppleMascot,
  heart: HeartMascot,
  octopus: OctopusMascot,
  sun: SunMascot,
  cloud: CloudMascot,
};
