'use client';
import { useParams, notFound } from 'next/navigation';
import { UNITS } from '@/data/lessons';
import LevelTreeHeader from '@/components/level-tree-page/LevelTreeHeader';
import LevelTree from '@/components/level-tree-page/level-tree/LevelTree';

export default function UnitPage() {
  const params = useParams();
  const unitId = params.unit as string;
  const unit = UNITS[unitId];

  if (!unit) {
    notFound();
  }

  return (
    <div
      className="min-h-screen"
      style={{
        // Subtle gradient using the unit's color
        background: `linear-gradient(to bottom, ${unit.color}08, #ffffff 30%, #ffffff)`,
      }}
    >
      <LevelTreeHeader unit={unit} />

      <main className="pb-24 pt-4">
        <LevelTree unit={unit} />
      </main>
    </div>
  );
}