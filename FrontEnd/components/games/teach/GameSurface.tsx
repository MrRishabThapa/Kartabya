'use client';

import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOnboarding } from '@/lib/auth-service';
import { useUser } from '@/context/UserContext';
import { useTeachSession } from '@/hooks/useTeachSession';
import type { TeachTopic } from '@/lib/games/teach/types';
import GameStage from './left/GameStage';
import ConversationPanel from './right/ConversationPanel';

export default function GameSurface({ lessonId, topicTitle, subject }: { lessonId: string; topicTitle?: string; subject?: string }) {
  const router = useRouter();
  const { onboarding, data } = useUser();
  const contextCompanionName = onboarding?.foxNickname?.trim() || data.foxNickname?.trim() || '';
  const [fetchedCompanionName, setFetchedCompanionName] = useState<string | null>(null);
  const companionName = contextCompanionName || fetchedCompanionName || 'your companion';
  const teach = useTeachSession();
  const { connect } = teach;
  const [topic, setTopic] = useState<TeachTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contextCompanionName) return;
    let active = true;
    void getOnboarding().then((profile) => {
      const name = typeof profile?.foxNickname === 'string' ? profile.foxNickname.trim() : '';
      if (active && name) setFetchedCompanionName(name);
    }).catch(() => undefined);
    return () => { active = false; };
  }, [contextCompanionName]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const selected = { id: lessonId, title: topicTitle || 'This lesson', description: 'Explain the lesson in your own words.', subject: subject || 'Lesson', difficulty: 'All levels' } satisfies TeachTopic;
      setTopic(selected);
      void connect(lessonId);
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [connect, lessonId, subject, topicTitle]);

  const retry = () => { if (topic) void connect(topic.id); };
  const goBack = () => router.back();
  const primaryAction = () => {
    if (teach.phase === 'explaining') teach.endExplanation();
    else if (teach.phase === 'qna') teach.endTeaching();
  };

  if (loading || !topic) return <main className="flex h-[100dvh] items-center justify-center bg-orange-50"><LoaderCircle className="animate-spin text-brand-primary" aria-label="Loading teaching game" /></main>;
  return <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-orange-50"><header className="flex shrink-0 items-center justify-between border-b border-orange-100 bg-white px-4 py-3 sm:px-6"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50"><ArrowLeft size={17} /> Back to games</button><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">{topic.subject}</p><p className="text-sm font-extrabold text-slate-800">Teach Your Companion</p></div></header><div className="flex min-h-0 flex-1 flex-col lg:flex-row"><section className="flex min-h-0 flex-[3] flex-col border-b border-orange-100 lg:border-b-0 lg:border-r"><GameStage topic={topic} phase={teach.phase} result={teach.result} error={teach.error} historyNotice={teach.historyNotice} companionName={companionName} onPrimary={primaryAction} onRetry={retry} onAnother={goBack} onBack={goBack} /></section><section className="flex min-h-0 max-h-[38dvh] flex-[2] lg:max-h-none"><ConversationPanel companionName={companionName} messages={teach.messages} /></section></div></main>;
}
