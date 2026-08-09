'use client';

import dynamic from 'next/dynamic';
import {
  Check,
  ChevronDown,
  CircleAlert,
  Code2,
  Copy,
  LoaderCircle,
  Play,
  Send,
  Timer,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { awardXp } from '@/lib/xp';
import type { DuelConnectionState, DuelGameResult, DuelLanguage, DuelOpponentState, DuelSubmissionResult } from '@/lib/duel/types';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export type DuelStatus = 'WAITING' | 'ACTIVE' | 'OVER';
export type DuelMessage =
  | { type: 'START_GAME' }
  | { type: 'OPPONENT_SUBMITTED' }
  | { type: 'GAME_OVER'; winner: boolean };

export interface DuelGameProps {
  roomCode?: string;
  status?: DuelStatus;
  problemTitle?: string;
  problemDescription?: string;
  targetOutput?: string;
  initialCode?: string;
  language?: DuelLanguage;
  buggyCode?: string;
  socket?: WebSocket | null;
  onSendMessage?: (message: DuelMessage | { type: 'RUN_TESTS' } | { type: 'SUBMIT_CODE'; code: string }) => void;
  onRunTests?: (code: string) => void | Promise<unknown>;
  onSubmit?: (code: string) => void | Promise<unknown>;
  onReady?: () => void | Promise<void>;
  readyPending?: boolean;
  isReady?: boolean;
  remainingSeconds?: number;
  opponentSubmitted?: boolean;
  submission?: DuelSubmissionResult | null;
  result?: DuelGameResult | null;
  didWin?: boolean;
  error?: string | null;
  notice?: string | null;
  connection?: DuelConnectionState;
  opponentState?: DuelOpponentState;
  onTyping?: (typing: boolean) => void;
  terminal?: boolean;
  playersReady?: boolean;
  onNextDuel?: () => void;
  onTryAgain?: () => void;
}

const defaultCode = `def find_first_duplicate(numbers):
    seen = set()
    for number in numbers:
        if number in seen:
            return number
        seen.add(number)
    return None`;

const languageMap: Record<DuelLanguage, { ext: string; monaco: string }> = {
  python: { ext: 'py', monaco: 'python' },
  c: { ext: 'c', monaco: 'c' },
  cpp: { ext: 'cpp', monaco: 'cpp' },
  javascript: { ext: 'js', monaco: 'javascript' },
  typescript: { ext: 'ts', monaco: 'typescript' },
};

export function useTimer(
  isActive: boolean,
  duration = 60,
  onExpire?: () => void,
): number {
  const [secondsLeft, setSecondsLeft] = useState(duration);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;
    intervalRef.current = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
          onExpire?.();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [isActive, onExpire]);

  return secondsLeft;
}

function StatusPill({ submitted, state }: { submitted: boolean; state: DuelOpponentState }) {
  const labels: Record<DuelOpponentState, string> = {
    joined: 'Opponent joined',
    typing: 'Opponent is typing',
    idle: 'Opponent is idle',
    ready: 'Opponent is ready',
    submitted: 'Opponent submitted',
    disconnected: 'Opponent disconnected',
    reconnecting: 'Opponent reconnecting',
    left: 'Opponent left',
  };
  const isPositive = submitted || state === 'ready';
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-slate-600">
      <span className={`h-2 w-2 rounded-full ${isPositive ? 'bg-emerald-400' : state === 'disconnected' || state === 'left' ? 'bg-red-400' : 'animate-pulse bg-amber-400'}`} />
      <span>{labels[state]}</span>
    </div>
  );
}

function ConnectionPill({ state }: { state: DuelConnectionState }) {
  const labels: Record<DuelConnectionState, string> = {
    connected: 'Connected',
    connecting: 'Connecting',
    reconnecting: 'Reconnecting',
    disconnected: 'Disconnected',
  };
  return <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500" role="status">{labels[state]}</span>;
}

function TimerBadge({ seconds }: { seconds: number }) {
  const urgent = seconds <= 10;
  return (
    <div className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm font-bold tabular-nums ${urgent ? 'border-red-300 bg-red-50 text-red-600' : 'border-[var(--border)] bg-[var(--surface)] text-slate-700'}`}>
      <Timer size={16} aria-hidden="true" className={urgent ? 'animate-pulse' : ''} />
      {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
    </div>
  );
}

export default function DuelGame({
  roomCode = 'A7K2Q9',
  status: initialStatus = 'WAITING',
  problemTitle = 'Find the first duplicate',
  problemDescription = 'The function should return the first value that appears more than once in the input list. If every value is unique, return `None`.',
  targetOutput = '[3, 1, 4, 3, 2]  →  3',
  initialCode = defaultCode,
  language = 'python',
  buggyCode = `def find_first_duplicate(numbers):\n    seen = []\n    for number in numbers:\n        if number in seen:\n            return number\n        seen.append(number)\n    return None`,
  socket,
  onSendMessage,
  onRunTests,
  onSubmit,
  onReady,
  readyPending = false,
  isReady = false,
  remainingSeconds,
  opponentSubmitted: serverOpponentSubmitted = false,
  submission,
  result,
  didWin,
  error,
  notice,
  connection = 'connected',
  opponentState = 'idle',
  onTyping,
  terminal = false,
  playersReady = false,
  onNextDuel,
  onTryAgain,
}: DuelGameProps) {
  const [gameStatus, setGameStatus] = useState<DuelStatus>(initialStatus);
  const [localOpponentSubmitted, setLocalOpponentSubmitted] = useState(false);
  const [winner, setWinner] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [consoleOutput, setConsoleOutput] = useState('Run your code to see test results here.');
  const [debugForceUnlock, setDebugForceUnlock] = useState(false);
  const languageInfo = languageMap[language] ?? languageMap.python;
  const debugEnabled = process.env.NEXT_PUBLIC_DEBUG_DUEL === 'true';

  useEffect(() => {
    if (winner === true) awardXp(80);
  }, [winner]);

  const endGame = useCallback((didWin: boolean) => {
    setGameStatus('OVER');
    setWinner(didWin);
  }, []);

  const handleMessage = useCallback((message: DuelMessage) => {
    if (message.type === 'START_GAME') {
      setGameStatus('ACTIVE');
      return;
    }
    if (message.type === 'OPPONENT_SUBMITTED') {
      setLocalOpponentSubmitted(true);
      setToast('Your opponent submitted their solution.');
      return;
    }
    endGame(message.winner);
  }, [endGame]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (event: MessageEvent<string>) => {
      try {
        handleMessage(JSON.parse(event.data) as DuelMessage);
      } catch {
        setToast('Received an invalid duel update.');
      }
    };
    socket.addEventListener('message', onMessage);
    return () => socket.removeEventListener('message', onMessage);
  }, [handleMessage, socket]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const effectiveStatus: DuelStatus = winner !== null
    ? 'OVER'
    : initialStatus === 'OVER'
      ? 'OVER'
      : gameStatus === 'ACTIVE' || initialStatus === 'ACTIVE'
        ? 'ACTIVE'
        : initialStatus;
  const localSecondsLeft = useTimer(effectiveStatus === 'ACTIVE', 60, () => endGame(false));
  const secondsLeft = remainingSeconds ?? localSecondsLeft;
  const editorReadOnly = !debugForceUnlock && effectiveStatus !== 'ACTIVE';
  const opponentSubmitted = serverOpponentSubmitted || localOpponentSubmitted;
  const resolvedWinner = terminal ? (result && didWin !== undefined ? didWin : false) : (result && didWin !== undefined ? didWin : winner);
  const submissionOutput = submission
    ? (submission.visible_tests?.length
      ? submission.visible_tests.map((test) => `${test.passed ? '✓' : '✗'} ${test.name}`).join('\n')
      : submission.error ?? `Submission ${submission.status.toLowerCase()}.`)
    : consoleOutput;
  const displayToast = toast ?? error ?? notice;

  useEffect(() => {
    if (debugEnabled) console.log('🎮 Editor readOnly:', editorReadOnly, 'gameState:', effectiveStatus);
  }, [debugEnabled, editorReadOnly, effectiveStatus]);

  useEffect(() => {
    if (!debugEnabled || !playersReady || connection !== 'connected' || effectiveStatus === 'ACTIVE') return;
    const timer = window.setTimeout(() => {
      console.log('🎮 Both players ready, but no game-start event received; enabling debug fallback unlock.');
      setDebugForceUnlock(true);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [connection, debugEnabled, effectiveStatus, playersReady]);

  const runTests = () => {
    setConsoleOpen(true);
    setConsoleOutput('Running hidden tests...\n\n✓ Test suite queued\n  Waiting for execution service.');
    onRunTests?.(code);
    onSendMessage?.({ type: 'RUN_TESTS' });
  };

  const submitCode = () => {
    onSubmit?.(code);
    onSendMessage?.({ type: 'SUBMIT_CODE', code });
  };

  return (
    <main className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
            <Code2 size={18} aria-hidden="true" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Room code</p>
            <button className="group flex items-center gap-1 font-mono text-sm font-bold tracking-[0.2em] text-slate-800" onClick={() => navigator.clipboard?.writeText(roomCode)} aria-label={`Copy room code ${roomCode}`}>
              {roomCode}<Copy size={13} className="text-slate-500 transition group-hover:text-brand-primary" aria-hidden="true" />
            </button>
          </div>
        </div>
          <div className="flex items-center gap-3"><ConnectionPill state={connection} /><TimerBadge seconds={secondsLeft} /></div>
        <div className="flex items-center gap-2">
          <Users size={16} className="hidden text-slate-500 sm:block" aria-hidden="true" />
          <StatusPill submitted={opponentSubmitted} state={opponentState} />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-4 sm:p-6 lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
        <article className="flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] lg:min-w-0">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">Challenge 01 · Debugging</p>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-2xl">{problemTitle}</h1>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 text-sm leading-7 text-slate-600 sm:px-8">
            <p>{problemDescription}</p>
            <h2 className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-800"><span className="h-5 w-1 rounded-full bg-brand-primary" />Buggy code</h2>
            <pre className={`language-${languageInfo.monaco} mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-slate-50 p-4 font-mono text-xs leading-6 text-slate-600`}><code>{buggyCode}</code></pre>
            <h2 className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-slate-800"><span className="h-5 w-1 rounded-full bg-emerald-500" />Target output</h2>
            <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-mono text-sm text-emerald-700">{targetOutput}</p>
            <p className="mt-6 text-xs text-slate-500">Fix the implementation while preserving the function signature. The solution should handle large inputs efficiently.</p>
          </div>
        </article>

        <section className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-slate-50 lg:min-w-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Code2 size={16} className="text-brand-primary" aria-hidden="true" />solution.{languageInfo.ext}</div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${editorReadOnly ? 'bg-slate-100 text-slate-500' : 'bg-orange-100 text-brand-primary'}`}>{editorReadOnly ? (effectiveStatus === 'OVER' ? 'Game over' : 'Waiting for start') : 'Live'}</span>
            {debugEnabled && <button type="button" onClick={() => setDebugForceUnlock((value) => !value)} className="ml-2 text-[10px] font-bold text-red-500">{debugForceUnlock ? 'Lock debug' : 'Force unlock (debug)'}</button>}
          </div>
          <div className="relative min-h-0 flex-1">
            <Editor
              height="100%"
              language={languageInfo.monaco}
              theme="vs-light"
              value={code}
              onChange={(value) => { setCode(value ?? ''); onTyping?.(true); }}
              options={{ automaticLayout: true, cursorBlinking: 'smooth', minimap: { enabled: false }, lineNumbers: 'on', fontSize: 14, padding: { top: 18, bottom: 18 }, readOnly: editorReadOnly, domReadOnly: editorReadOnly, smoothScrolling: true, tabSize: 4 }}
              loading={<div className="flex h-full items-center justify-center text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} />Loading editor…</div>}
            />
            {editorReadOnly && <div className="pointer-events-none absolute inset-0 bg-white/30" aria-hidden="true" />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <button onClick={() => setConsoleOpen((open) => !open)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" aria-expanded={consoleOpen}>
              <ChevronDown size={16} className={`transition-transform ${consoleOpen ? 'rotate-180' : ''}`} aria-hidden="true" />Console
            </button>
            <div className="flex gap-2">
              {gameStatus === 'WAITING' && onReady && !isReady && <button onClick={onReady} disabled={readyPending} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-4 text-sm font-bold text-white transition hover:bg-brand-primary-light active:translate-y-0.5 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40">{readyPending ? 'Ready…' : 'Ready'}</button>}
              <button onClick={runTests} disabled={editorReadOnly} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"><Play size={15} aria-hidden="true" />Run Tests</button>
              <button onClick={submitCode} disabled={editorReadOnly} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-4 text-sm font-bold text-white transition hover:bg-brand-primary-light active:translate-y-0.5 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} aria-hidden="true" />Submit Code</button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {consoleOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 150, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--border)] bg-white"><div className="flex items-center justify-between px-4 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"><span>Test console</span><span className="text-emerald-600">● Ready</span></div><pre className="px-4 py-2 font-mono text-xs leading-6 text-slate-600">{submissionOutput}</pre></motion.div>}
          </AnimatePresence>
        </section>
      </section>

      <AnimatePresence>
        {displayToast && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} role="status" className="fixed right-4 top-20 z-30 flex items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-2xl"><CircleAlert size={17} className="text-amber-500" aria-hidden="true" />{displayToast}<button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} className="text-slate-500" /></button></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {resolvedWinner !== null && <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="duel-result-title">
          <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className={`w-full max-w-md rounded-3xl border bg-white p-8 text-center shadow-2xl ${resolvedWinner ? 'border-emerald-200 shadow-emerald-500/10' : 'border-red-200 shadow-red-500/10'}`}>
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${resolvedWinner ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}><Trophy size={38} aria-hidden="true" /></div>
            <p className={`mb-2 text-xs font-bold uppercase tracking-[0.22em] ${resolvedWinner ? 'text-emerald-600' : 'text-red-600'}`}>{resolvedWinner ? 'Victory confirmed' : 'Duel concluded'}</p>
            <h2 id="duel-result-title" className={`text-3xl font-black tracking-tight ${resolvedWinner ? 'text-emerald-700 [text-shadow:0_0_18px_rgba(52,211,153,0.25)]' : 'text-red-700'}`}>{resolvedWinner ? 'MISSION ACCOMPLISHED' : 'SYSTEM FAILURE'}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-500">{resolvedWinner ? 'Your solution beat the clock and your opponent.' : 'The duel is over. Review your approach and get back in the arena.'}</p>
            <button onClick={resolvedWinner ? onNextDuel : onTryAgain} className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-b-4 px-6 font-bold text-white transition active:translate-y-0.5 active:border-b-0 ${resolvedWinner ? 'border-emerald-700 bg-emerald-500 hover:bg-emerald-400' : 'border-red-700 bg-red-500 hover:bg-red-400'}`}>{resolvedWinner ? <><Check size={17} aria-hidden="true" />Next Duel</> : <><Trophy size={17} aria-hidden="true" />Try Again</>}</button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
