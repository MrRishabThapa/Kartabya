/* eslint-disable react/no-unescaped-entities */
'use client';

import { LoaderCircle, Mic, Square } from 'lucide-react';
import { useState } from 'react';
import type { TeachPhase, TeachResult, TeachTopic } from '@/lib/games/teach/types';
import FoxMascot from '../parts/FoxMascot';
import Dartboard from '../parts/Dartboard';
import DartAnimation from '../parts/DartAnimation';
import AccuracyDisplay from '../parts/AccuracyDisplay';
import FeedbackCard from '../parts/FeedbackCard';

interface Props {
  topic: TeachTopic;
  phase: TeachPhase;
  result: TeachResult | null;
  error: string | null;
  rawError: string | null;
  retryCountdown: number | null;
  historyNotice?: boolean;
  companionName: string;
  isRecording: boolean;
  recordingSeconds: number;
  commitNotice: boolean;
  qnaReady: boolean;
  qnaQuestionCount: number;
  onMicToggle: () => void;
  onDoneExplaining: () => void;
  onFinishTeaching: () => void;
  onRetry: () => void;
  onAnother: () => void;
  onBack: () => void;
}

function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function ErrorPanel({ error, rawError, retryCountdown, onRetry }: { error: string; rawError: string | null; retryCountdown: number | null; onRetry: () => void }) {
  return <div className="mx-auto mt-4 max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-left text-red-600">
    <div className="font-medium">{error}</div>
    {rawError && rawError !== error && <div className="mt-1 text-xs text-red-400 opacity-70">Details: {rawError}</div>}
    <button type="button" onClick={onRetry} disabled={retryCountdown !== null} className="mt-3 min-h-12 rounded-xl border-b-4 border-red-800 bg-red-600 px-6 py-3 text-sm font-extrabold text-white shadow-sm hover:bg-red-700 disabled:cursor-wait disabled:opacity-70">
      {retryCountdown !== null ? `Retrying in ${retryCountdown}s…` : 'Try again'}
    </button>
  </div>;
}

export default function GameStage(props: Props) {
  const { topic, phase, result, error, rawError, retryCountdown, historyNotice, companionName, isRecording, recordingSeconds, commitNotice, qnaReady, qnaQuestionCount, onMicToggle, onDoneExplaining, onFinishTeaching, onRetry, onAnother, onBack } = props;
  const [showIdeal, setShowIdeal] = useState(false);
  const busy = phase === 'connecting' || phase === 'grading';
  const explaining = phase === 'explaining';
  const awaitingQna = phase === 'awaiting_qna';
  const qna = phase === 'qna';
  const micDisabled = busy || awaitingQna || phase === 'idle' || phase === 'failed';
  const micLabel = explaining ? (isRecording ? 'Stop microphone' : 'Start microphone') : qna ? (isRecording ? 'Stop answering' : 'Start answering') : 'Microphone unavailable';

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-5 sm:p-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col">
        <div className="relative flex min-h-52 items-center justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-brand-primary-bg px-5 py-4 sm:min-h-64 sm:px-12"><FoxMascot cheering={result?.band === 'bullseye'} /><Dartboard wobble={Boolean(result)} />{result && <DartAnimation accuracy={result.accuracy_percent} />}</div>
        <div className="mt-5 text-center"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Explain this topic</p><h1 className="mt-1 text-2xl font-black tracking-tight text-slate-800 sm:text-4xl">{topic.title}</h1><p className="mt-2 text-sm text-slate-500">Teach {companionName} in your own words.</p>{explaining && <span className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">🎧 {companionName} is listening…</span>}{awaitingQna && <span className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-500 shadow-sm">💬 {companionName} is preparing questions…</span>}</div>
        {result ? <div className="mt-5 space-y-5">{historyNotice && <p className="rounded-xl bg-slate-100 p-3 text-sm font-semibold text-slate-600">Loaded grade from history.</p>}<AccuracyDisplay accuracy={result.accuracy_percent} band={result.band} xp={result.xp_earned} /><FeedbackCard feedback={result.feedback} ideal={result.correct_answer} showIdeal={showIdeal} onToggle={() => setShowIdeal((value) => !value)} />{error && <ErrorPanel error={error} rawError={rawError} retryCountdown={retryCountdown} onRetry={onRetry} />}<div className="grid gap-3 sm:grid-cols-3"><button type="button" onClick={onRetry} className="rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-3 py-3 text-sm font-bold text-white">Try again</button><button type="button" onClick={onAnother} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-700">Pick another topic</button><button type="button" onClick={onBack} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-500">Back to games</button></div></div> : <div className="mt-6 text-center"><button type="button" onClick={onMicToggle} disabled={micDisabled} aria-pressed={isRecording} aria-label={micLabel} className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-8 border-orange-100 text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 ${isRecording ? 'bg-red-500' : 'bg-brand-primary'}`}>{busy ? <LoaderCircle size={30} className="animate-spin" /> : isRecording ? <Square size={27} fill="currentColor" /> : <Mic size={30} />}</button>{isRecording && <div className="mt-3 flex items-center justify-center gap-2 text-xs font-extrabold text-red-600"><span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Live · {formatDuration(recordingSeconds)}</div>}{commitNotice && <p className="mt-2 text-xs font-semibold text-emerald-600" role="status">Committed to companion</p>}<p className="mt-3 text-sm font-bold text-slate-600">{busy ? (phase === 'grading' ? 'Grading your explanation…' : 'Connecting…') : explaining ? (isRecording ? 'Tap to pause your microphone' : 'Tap to resume your microphone') : awaitingQna ? `Waiting for ${companionName}…` : qna ? (qnaReady ? `${companionName} is ready to grade your teaching.` : isRecording ? 'Tap to stop answering' : 'Tap to answer') : phase === 'failed' ? 'Session ended' : 'Ready'}</p>{explaining && <button type="button" onClick={onDoneExplaining} className="mx-auto mt-4 inline-flex min-h-12 items-center justify-center rounded-xl border border-brand-primary bg-white px-6 text-sm font-extrabold text-brand-primary hover:bg-brand-primary-bg">Done explaining</button>}{awaitingQna && <span className="mx-auto mt-4 inline-flex min-h-11 items-center rounded-full bg-white px-4 text-xs font-bold text-slate-500 shadow-sm">Waiting for {companionName}…</span>}{qna && qnaQuestionCount > 0 && <><p className="mx-auto mt-5 max-w-sm text-sm font-semibold text-slate-600">Answer {companionName}'s questions, then tap when you're ready to be graded.</p><button type="button" onClick={onFinishTeaching} disabled={isRecording || busy} title="You won't be able to answer more questions." className={`mx-auto mt-2 inline-flex min-h-14 items-center justify-center rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-8 text-base font-extrabold text-white shadow-md hover:bg-brand-primary-light disabled:cursor-not-allowed disabled:opacity-50 ${qnaReady ? 'animate-pulse' : ''}`}>End teaching session</button></>}{error && <ErrorPanel error={error} rawError={rawError} retryCountdown={retryCountdown} onRetry={onRetry} />}{phase === 'failed' && <div className="mx-auto mt-4 flex max-w-md gap-2"><button type="button" onClick={onAnother} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700">Pick another topic</button><button type="button" onClick={onBack} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-500">Back to games</button></div>}</div>}
      </div>
    </div>
  );
}
