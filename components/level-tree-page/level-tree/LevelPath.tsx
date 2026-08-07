'use client';
import { motion } from 'framer-motion';

interface NodePosition {
  x: number;
  y: number;
  id: string;
  status: 'locked' | 'available' | 'completed';
}

interface Props {
  nodes: NodePosition[];
  unitColor: string;
}

/**
 * Generates a smooth Bézier curve path connecting all nodes.
 * Uses quadratic curves for a fun, wavy zigzag feel.
 */
function buildPath(nodes: NodePosition[]): string {
  if (nodes.length < 2) return '';

  let d = `M ${nodes[0].x} ${nodes[0].y}`;

  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];

    // Control point creates the curve — offset horizontally from midpoint
    // Alternating direction gives the "wavy" candy-crush feel
    const midX = (prev.x + curr.x) / 2;
    const midY = (prev.y + curr.y) / 2;

    // Wave offset — creates the S-curve feel
    const controlOffsetX = (curr.x - prev.x) * 0.5;
    const controlOffsetY = (curr.y - prev.y) * 0.2;

    // Two control points for cubic Bézier — creates smoother S-curves
    const cp1x = prev.x + controlOffsetX;
    const cp1y = prev.y + Math.abs(curr.y - prev.y) * 0.3;
    const cp2x = curr.x - controlOffsetX;
    const cp2y = curr.y - Math.abs(curr.y - prev.y) * 0.3;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return d;
}

export default function LevelPath({ nodes, unitColor }: Props) {
  if (nodes.length < 2) return null;

  const pathData = buildPath(nodes);

  // Find how far along the path is "completed" (for solid line)
  const lastCompletedIndex = nodes.reduce(
    (acc, node, i) => (node.status === 'completed' ? i : acc),
    -1
  );

  // Build "completed" portion of path (from first node to last completed)
  const completedNodes = nodes.slice(0, lastCompletedIndex + 1);
  const completedPathData = buildPath(completedNodes);

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {/* Locked / upcoming path — dotted gray */}
      <motion.path
        d={pathData}
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="5"
        strokeDasharray="2 12"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />

      {/* Completed path — solid colored, drawn on top */}
      {completedNodes.length > 1 && (
        <motion.path
          d={completedPathData}
          fill="none"
          stroke={unitColor}
          strokeWidth="6"
          strokeDasharray="2 12"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.3 }}
          style={{
            filter: `drop-shadow(0 0 4px ${unitColor}80)`,
          }}
        />
      )}
    </svg>
  );
}