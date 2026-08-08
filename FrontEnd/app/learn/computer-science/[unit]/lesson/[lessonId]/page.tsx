import { notFound } from 'next/navigation';
import LessonWorkspace from '@/components/lesson-workspace/LessonWorkspace';
import { UNITS } from '@/data/lessons';

export default async function LessonPage({ params }: { params: Promise<{ unit: string; lessonId: string }> }) {
  const resolvedParams = await params;
  const unit = UNITS[resolvedParams.unit];
  const lesson = unit?.lessons.find((item) => item.id === resolvedParams.lessonId);

  if (!unit || !lesson) notFound();

  return <LessonWorkspace unit={unit} lesson={lesson} />;
}
