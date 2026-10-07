import { useId, type CSSProperties } from "react";

const PALETTES = {
  rose: ["#ffe3ee", "#f4a9c6", "#d784ab"],
  lilac: ["#f1eaff", "#c7b2f4", "#9c86e0"],
  peach: ["#fff1e4", "#f8c9b5", "#e8a1a6"],
  pearl: ["#ffffff", "#f3e3f4", "#d9bfe0"],
} as const;

export type ButterflyTone = keyof typeof PALETTES;

interface Props {
  size?: number;
  tone?: ButterflyTone;
  /** seconds per wing beat */
  flap?: number;
  className?: string;
  style?: CSSProperties;
}

/** Hand-drawn SVG butterfly with flapping wings (pure CSS, GPU-friendly). */
export default function Butterfly({ size = 40, tone = "rose", flap = 0.32, className = "", style }: Props) {
  const id = useId().replace(/:/g, "");
  const [a, b, c] = PALETTES[tone];
  const wing = (
    <>
      <path d="M50 37 C40 10 12 0 6 16 C1 30 22 41 50 41Z" fill={`url(#u${id})`} stroke={c} strokeOpacity=".35" strokeWidth=".8" />
      <path d="M50 43 C32 44 15 54 22 68 C28 79 45 64 50 46Z" fill={`url(#l${id})`} stroke={c} strokeOpacity=".35" strokeWidth=".8" />
      <circle cx="22" cy="20" r="3.4" fill="#fff" opacity=".7" />
      <circle cx="30" cy="61" r="2.4" fill="#fff" opacity=".6" />
    </>
  );
  return (
    <svg
      className={`butterfly ${className}`}
      width={size}
      height={size * 0.8}
      viewBox="0 0 100 80"
      style={{ ...style, ["--flap" as string]: `${flap}s` }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`u${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset=".55" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <linearGradient id={`l${id}`} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <g className="wing wing-l">{wing}</g>
      <g transform="translate(100 0) scale(-1 1)">
        <g className="wing wing-r">{wing}</g>
      </g>
      <ellipse cx="50" cy="42" rx="2.2" ry="15" fill="#6d4a62" />
      <path d="M49 28 C46 20 42 16 38 15 M51 28 C54 20 58 16 62 15" stroke="#6d4a62" strokeWidth="1.1" fill="none" strokeLinecap="round" />
    </svg>
  );
}
