'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Lesson, Unit, LessonStatus } from '@/types/lessons-types';
import { useProgress } from '@/hooks/useProgress';
import LevelNode from './LevelNode';
import LevelPath from './LevelPath';
import LessonModal from './LessonModal';

interface Props {
  unit: Unit;
}

/**
 * Calculates a zigzag layout for lesson nodes.
 * Nodes alternate between left/center/right positions to create a fun path.
 */
function computeNodePositions(
  lessons: Lesson[],
  containerWidth: number
): Array<{ x: number; y: number; lesson: Lesson }> {
  const CENTER_X = containerWidth / 2;
  const AMPLITUDE = Math.min(containerWidth * 0.25, 120); // How far nodes swing
  const VERTICAL_SPACING = 130;                            // Distance between nodes
  const TOP_PADDING = 100;

  return lessons.map((lesson, i) => {
    // Sine wave for smooth zigzag
    // Every 4 nodes = one full wave cycle
    const wave = Math.sin((i / 2) * Math.PI);
    const x = CENTER_X + wave * AMPLITUDE;
    const y = TOP_PADDING + i * VERTICAL_SPACING;
    return { x, y, lesson };
  });
}

export default function LevelTree({ unit }: Props) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [containerWidth, setContainerWidth] = useState(400);
  const containerRef = useRef<HTMLDivElement>(null);

  const { getUnitProgress, hydrated } = useProgress();
  const progress = getUnitProgress(unit.id);
  const completedIds = progress.completedLessons;

  // Track container width for responsive layout
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute layout dynamically
  const positions = useMemo(
    () => computeNodePositions(unit.lessons, containerWidth),
    [unit.lessons, containerWidth]
  );

  // Determine status for each lesson
  const nodesWithStatus = useMemo(() => {
    return positions.map(({ lesson, x, y }) => {
      let status: LessonStatus = 'locked';
      if (completedIds.includes(lesson.id)) {
        status = 'completed';
      } else if (lesson.prerequisiteIds.every((id) => completedIds.includes(id))) {
        status = 'available';
      }
      return { lesson, x, y, status };
    });
  }, [positions, completedIds]);

  // Find the "current" lesson — first available (not completed) one
  const currentLessonId = useMemo(() => {
    const current = nodesWithStatus.find((n) => n.status === 'available');
    return current?.lesson.id ?? null;
  }, [nodesWithStatus]);

  // Total container height based on last node position
  const totalHeight = positions.length > 0
    ? positions[positions.length - 1].y + 150
    : 400;

  return (
    <>
      <div
        ref={containerRef}
        className="relative w-full mx-auto max-w-md"
        style={{ height: totalHeight }}
      >
        {/* Curved dotted path connecting nodes */}
        <LevelPath
          nodes={nodesWithStatus.map((n) => ({
            x: n.x,
            y: n.y,
            id: n.lesson.id,
            status: n.status,
          }))}
          unitColor={unit.color}
        />

        {/* Nodes on top of path */}
        {hydrated &&
          nodesWithStatus.map(({ lesson, x, y, status }) => (
            <LevelNode
              key={lesson.id}
              lesson={lesson}
              status={status}
              isCurrent={lesson.id === currentLessonId}
              unitColor={unit.color}
              unitAccentColor={unit.accentColor}
              onClick={setSelectedLesson}
              x={x}
              y={y}
            />
          ))}
      </div>

      {/* Lesson info modal */}
      <LessonModal
        lesson={selectedLesson}
        unitId={unit.id}
        status={
          selectedLesson
            ? nodesWithStatus.find((n) => n.lesson.id === selectedLesson.id)?.status ?? 'locked'
            : 'locked'
        }
        unitColor={unit.color}
        onClose={() => setSelectedLesson(null)}
      />
    </>
  );
}
