import QuizContainer from "@/components/quiz/QuizContainer";

export default async function QuizPage({ searchParams }: { searchParams: Promise<{ subject?: string; content?: string }> }) {
  const params = await searchParams;
  const subject = params.subject || 'Computer Science';
  const content = params.content || 'mixed fundamentals';

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 md:py-12">
      <div className="mx-auto mb-5 max-w-6xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">Daily challenge</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-800">{subject} quiz</h1><p className="mt-1 text-sm text-slate-500">Focus: {content}</p></div>
      <QuizContainer subject={subject} content={content} />
    </div>
  );
}
