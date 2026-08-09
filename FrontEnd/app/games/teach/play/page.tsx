import GameSurface from '@/components/games/teach/GameSurface';

export default async function TeachPlayPage({ searchParams }: { searchParams: Promise<{ lesson_id?: string; topic_title?: string; subject?: string }> }) {
  const params = await searchParams;
  if (!params.lesson_id) {
    return <main className="flex min-h-screen items-center justify-center bg-orange-50 p-6 text-center text-slate-600">This teaching session is missing its lesson. Return to the lesson and try again.</main>;
  }
  return <GameSurface lessonId={params.lesson_id} topicTitle={params.topic_title} subject={params.subject} />;
}
