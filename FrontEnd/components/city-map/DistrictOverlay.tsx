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
  isLocked?: boolean;
}

export default function DistrictOverlay({
  district,
  isHovered,
  isSelected,
  isDimmed,
  onHover,
  onClick,
  isLocked = false,
}: Props) {
  const active = !isLocked && (isHovered || isSelected);

  return (
    <g
      style={{ cursor: isLocked ? 'not-allowed' : 'pointer', pointerEvents: 'auto' }}
      onMouseEnter={() => { if (!isLocked) onHover(district.id); }}
      onMouseLeave={() => { if (!isLocked) onHover(null); }}
      onClick={(e) => {
        e.stopPropagation();
        if (!isLocked) onClick(district.id);
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
        strokeDasharray={undefined}
        initial={false}
        animate={{
          opacity: isLocked ? 0 : active ? 0.22 : isDimmed ? 0 : 0,
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
