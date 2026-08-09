'use client';

import { ArrowLeft, LoaderCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
  const { connect, close } = teach;
  const connectRef = useRef(connect);
  const closeRef = useRef(close);
  const topicTitleRef = useRef(topicTitle);
  const subjectRef = useRef(subject);
  const [topic, setTopic] = useState<TeachTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    connectRef.current = connect;
    closeRef.current = close;
    topicTitleRef.current = topicTitle;
    subjectRef.current = subject;
  }, [close, connect, subject, topicTitle]);

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
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      const selected = { id: lessonId, title: topicTitleRef.current || 'This lesson', description: 'Explain the lesson in your own words.', subject: subjectRef.current || 'Lesson', difficulty: 'All levels' } satisfies TeachTopic;
      setTopic(selected);
      void connectRef.current(lessonId);
      setLoading(false);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      closeRef.current();
    };
  }, [lessonId]);

  const retry = teach.retry;
  const goBack = () => {
    close('user leaving');
    router.back();
  };
  const primaryAction = () => {
    if (teach.phase === 'explaining' || teach.phase === 'qna') teach.toggleRecording();
  };

  if (loading || !topic) return <main className="flex h-[100dvh] items-center justify-center bg-orange-50"><LoaderCircle className="animate-spin text-brand-primary" aria-label="Loading teaching game" /></main>;
  return <main className="flex h-[100dvh] w-full flex-col overflow-hidden bg-orange-50"><header className="flex shrink-0 items-center justify-between border-b border-orange-100 bg-white px-4 py-3 sm:px-6"><button type="button" onClick={goBack} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50"><ArrowLeft size={17} /> Back to games</button><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-primary">{topic.subject}</p><p className="text-sm font-extrabold text-slate-800">Teach Your Companion</p></div></header><div className="flex min-h-0 flex-1 flex-col lg:flex-row"><section className="flex min-h-0 flex-[3] flex-col border-b border-orange-100 lg:border-b-0 lg:border-r"><GameStage topic={topic} phase={teach.phase} result={teach.result} error={teach.errorDetail} rawError={teach.rawError} retryCountdown={teach.retryCountdown} historyNotice={teach.historyNotice} companionName={companionName} isRecording={teach.isRecording} recordingSeconds={teach.recordingSeconds} commitNotice={teach.commitNotice} qnaReady={teach.qnaReady} qnaQuestionCount={teach.qnaQuestionCount} onMicToggle={primaryAction} onDoneExplaining={teach.endExplanation} onFinishTeaching={teach.endTeaching} onRetry={retry} onAnother={goBack} onBack={goBack} /></section><section className="flex min-h-0 max-h-[38dvh] lg:max-h-none flex-[2]"><ConversationPanel companionName={companionName} messages={teach.messages} qnaReady={teach.qnaReady} phase={teach.phase} /></section></div></main>;
}
