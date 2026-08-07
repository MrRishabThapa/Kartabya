'use client';
import { District } from '@/data/districts-types';
import { motion } from 'framer-motion';

interface Props {
  district: District;
  isHovered: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export default function DistrictOverlay({
  district,
  isHovered,
  isSelected,
  isDimmed,
  onHover,
  onClick,
}: Props) {
  const active = isHovered || isSelected;

  return (
    <g
      style={{ cursor: 'pointer', pointerEvents: 'auto' }}
      onMouseEnter={() => onHover(district.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(district.id);
      }}
    >
      {/* Invisible hit area */}
      <polygon
        points={district.polygonPoints}
        fill="transparent"
        stroke="transparent"
      />

      {/* Glow layer — only visible on hover/select */}
      <motion.polygon
        points={district.polygonPoints}
        fill={district.color}
        stroke={district.color}
        strokeWidth="0.4"
        strokeLinejoin="round"
        initial={false}
        animate={{
          opacity: active ? 0.22 : isDimmed ? 0 : 0,
          filter: active
            ? `drop-shadow(0 0 1.2px ${district.color}) drop-shadow(0 0 2.5px ${district.color})`
            : 'none',
          y: active ? -0.6 : 0, // subtle "lift" in SVG units
        }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ pointerEvents: 'none' }}
      />
      {/* Debug outline — shows exactly where each polygon is */}


      {/* Debug outline — uncomment while calibrating polygons */}
      {/* <polygon points={district.polygonPoints} fill="none" stroke="red" strokeWidth="0.15" /> */}
    </g>
  );
}