'use client';

interface Props {
  rank: 1 | 2 | 3;
  size?: number;
}

const MEDAL_COLORS = {
  1: {
    ribbon: '#7C3AED',       // violet ribbon
    ribbonDark: '#5B21B6',
    body: '#FBBF24',         // gold
    bodyDark: '#D97706',
    shine: '#FDE68A',
    text: '1',
  },
  2: {
    ribbon: '#7C3AED',
    ribbonDark: '#5B21B6',
    body: '#E5E7EB',         // silver
    bodyDark: '#9CA3AF',
    shine: '#F9FAFB',
    text: '2',
  },
  3: {
    ribbon: '#7C3AED',
    ribbonDark: '#5B21B6',
    body: '#D97706',         // bronze
    bodyDark: '#92400E',
    shine: '#FBBF24',
    text: '3',
  },
};

export default function Medal({ rank, size = 60 }: Props) {
  const c = MEDAL_COLORS[rank];

  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 60 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left ribbon */}
      <path
        d="M18 8 L10 40 L20 44 L28 30 Z"
        fill={c.ribbon}
      />
      <path
        d="M18 8 L10 40 L14 42 L22 12 Z"
        fill={c.ribbonDark}
        opacity="0.4"
      />

      {/* Right ribbon */}
      <path
        d="M42 8 L50 40 L40 44 L32 30 Z"
        fill={c.ribbon}
      />
      <path
        d="M42 8 L50 40 L46 42 L38 12 Z"
        fill={c.ribbonDark}
        opacity="0.4"
      />

      {/* Ribbon center knot */}
      <rect x="24" y="6" width="12" height="10" rx="1" fill={c.ribbonDark} />
      <rect x="26" y="6" width="8" height="10" fill={c.ribbon} />

      {/* Medal circle — outer ring */}
      <circle cx="30" cy="52" r="26" fill={c.bodyDark} />
      <circle cx="30" cy="52" r="24" fill={c.body} />

      {/* Inner star pattern */}
      <circle cx="30" cy="52" r="20" fill={c.bodyDark} opacity="0.2" />
      <circle cx="30" cy="52" r="18" fill={c.body} />

      {/* Shine highlight */}
      <ellipse
        cx="22"
        cy="44"
        rx="6"
        ry="8"
        fill={c.shine}
        opacity="0.5"
        transform="rotate(-30 22 44)"
      />

      {/* Rank number */}
      <text
        x="30"
        y="60"
        textAnchor="middle"
        fontSize="22"
        fontWeight="900"
        fill={c.bodyDark}
        fontFamily="system-ui, sans-serif"
      >
        {c.text}
      </text>
    </svg>
  );
}