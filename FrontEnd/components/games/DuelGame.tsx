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
  language?: 'python' | 'javascript' | 'typescript';
  socket?: WebSocket | null;
  onSendMessage?: (message: DuelMessage | { type: 'RUN_TESTS' } | { type: 'SUBMIT_CODE'; code: string }) => void;
  onRunTests?: (code: string) => void;
  onSubmit?: (code: string) => void;
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

function StatusPill({ submitted }: { submitted: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-xs font-semibold text-slate-300">
      <span className={`h-2 w-2 rounded-full ${submitted ? 'bg-emerald-400' : 'animate-pulse bg-amber-400'}`} />
      <span>{submitted ? 'Opponent Submitted!' : 'Opponent is typing...'}</span>
    </div>
  );
}

function TimerBadge({ seconds }: { seconds: number }) {
  const urgent = seconds <= 10;
  return (
    <div className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm font-bold tabular-nums ${urgent ? 'border-red-400/60 bg-red-400/10 text-red-300' : 'border-[var(--border)] bg-[var(--surface)] text-slate-100'}`}>
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
  socket,
  onSendMessage,
  onRunTests,
  onSubmit,
  onNextDuel,
  onTryAgain,
}: DuelGameProps) {
  const [gameStatus, setGameStatus] = useState<DuelStatus>(initialStatus);
  const [opponentSubmitted, setOpponentSubmitted] = useState(false);
  const [winner, setWinner] = useState<boolean | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [consoleOutput, setConsoleOutput] = useState('Run your code to see test results here.');

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
      setOpponentSubmitted(true);
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

  const secondsLeft = useTimer(gameStatus === 'ACTIVE', 60, () => endGame(false));
  const editorLocked = gameStatus !== 'ACTIVE';

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
            <button className="group flex items-center gap-1 font-mono text-sm font-bold tracking-[0.2em] text-slate-100" onClick={() => navigator.clipboard?.writeText(roomCode)} aria-label={`Copy room code ${roomCode}`}>
              {roomCode}<Copy size={13} className="text-slate-500 transition group-hover:text-brand-primary" aria-hidden="true" />
            </button>
          </div>
        </div>
        <TimerBadge seconds={secondsLeft} />
        <div className="flex items-center gap-2">
          <Users size={16} className="hidden text-slate-500 sm:block" aria-hidden="true" />
          <StatusPill submitted={opponentSubmitted} />
        </div>
      </header>

      <section className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-4 sm:p-6 lg:h-[calc(100vh-4rem)] lg:flex-row lg:overflow-hidden">
        <article className="flex min-h-[360px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] lg:min-w-0">
          <div className="border-b border-[var(--border)] px-5 py-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-primary">Challenge 01 · Debugging</p>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">{problemTitle}</h1>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 text-sm leading-7 text-slate-300 sm:px-8">
            <p>{problemDescription}</p>
            <h2 className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white"><span className="h-5 w-1 rounded-full bg-brand-primary" />Buggy code</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-[var(--border)] bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-400"><code>{`def find_first_duplicate(numbers):\n    seen = []\n    for number in numbers:\n        if number in seen:\n            return number\n        seen.append(number)\n    return None`}</code></pre>
            <h2 className="mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-white"><span className="h-5 w-1 rounded-full bg-emerald-400" />Target output</h2>
            <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 font-mono text-sm text-emerald-300">{targetOutput}</p>
            <p className="mt-6 text-xs text-slate-500">Fix the implementation while preserving the function signature. The solution should handle large inputs efficiently.</p>
          </div>
        </article>

        <section className="flex min-h-[500px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[#0b1220] lg:min-w-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300"><Code2 size={16} className="text-brand-primary" aria-hidden="true" />solution.{language === 'python' ? 'py' : 'js'}</div>
            <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${editorLocked ? 'bg-slate-800 text-slate-500' : 'bg-emerald-400/10 text-emerald-300'}`}>{editorLocked ? (gameStatus === 'OVER' ? 'Game over' : 'Waiting for start') : 'Editor unlocked'}</span>
          </div>
          <div className="relative min-h-0 flex-1">
            <Editor
              height="100%"
              language={language}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value ?? '')}
              options={{ automaticLayout: true, cursorBlinking: 'smooth', minimap: { enabled: false }, lineNumbers: 'on', fontSize: 14, padding: { top: 18, bottom: 18 }, readOnly: editorLocked, smoothScrolling: true, tabSize: 4 }}
              loading={<div className="flex h-full items-center justify-center text-sm text-slate-500"><LoaderCircle className="mr-2 animate-spin" size={18} />Loading editor…</div>}
            />
            {editorLocked && <div className="pointer-events-none absolute inset-0 bg-slate-950/20" aria-hidden="true" />}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <button onClick={() => setConsoleOpen((open) => !open)} className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white" aria-expanded={consoleOpen}>
              <ChevronDown size={16} className={`transition-transform ${consoleOpen ? 'rotate-180' : ''}`} aria-hidden="true" />Console
            </button>
            <div className="flex gap-2">
              <button onClick={runTests} disabled={editorLocked} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-bold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"><Play size={15} aria-hidden="true" />Run Tests</button>
              <button onClick={submitCode} disabled={editorLocked} className="inline-flex min-h-11 items-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-4 text-sm font-bold text-white transition hover:bg-brand-primary-light active:translate-y-0.5 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40"><Send size={15} aria-hidden="true" />Submit Code</button>
            </div>
          </div>
          <AnimatePresence initial={false}>
            {consoleOpen && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 150, opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-[var(--border)] bg-slate-950"><div className="flex items-center justify-between px-4 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500"><span>Test console</span><span className="text-emerald-400">● Ready</span></div><pre className="px-4 py-2 font-mono text-xs leading-6 text-slate-400">{consoleOutput}</pre></motion.div>}
          </AnimatePresence>
        </section>
      </section>

      <AnimatePresence>
        {toast && <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} role="status" className="fixed right-4 top-20 z-30 flex items-center gap-3 rounded-xl border border-amber-400/30 bg-[var(--surface)] px-4 py-3 text-sm text-slate-200 shadow-2xl"><CircleAlert size={17} className="text-amber-400" aria-hidden="true" />{toast}<button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} className="text-slate-500" /></button></motion.div>}
      </AnimatePresence>

      <AnimatePresence>
        {winner !== null && <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="duel-result-title">
          <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }} className={`w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl ${winner ? 'border-emerald-400/30 bg-[#071c18] shadow-emerald-500/10' : 'border-red-400/30 bg-[#1c0b12] shadow-red-500/10'}`}>
            <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full ${winner ? 'bg-emerald-400/15 text-emerald-300' : 'bg-red-400/15 text-red-300'}`}><Trophy size={38} aria-hidden="true" /></div>
            <p className={`mb-2 text-xs font-bold uppercase tracking-[0.22em] ${winner ? 'text-emerald-300' : 'text-red-300'}`}>{winner ? 'Victory confirmed' : 'Duel concluded'}</p>
            <h2 id="duel-result-title" className={`text-3xl font-black tracking-tight ${winner ? 'text-emerald-200 [text-shadow:0_0_18px_rgba(52,211,153,0.45)]' : 'text-red-200'}`}>{winner ? 'MISSION ACCOMPLISHED' : 'SYSTEM FAILURE'}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-400">{winner ? 'Your solution beat the clock and your opponent.' : 'The duel is over. Review your approach and get back in the arena.'}</p>
            <button onClick={winner ? onNextDuel : onTryAgain} className={`mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-b-4 px-6 font-bold text-white transition active:translate-y-0.5 active:border-b-0 ${winner ? 'border-emerald-700 bg-emerald-500 hover:bg-emerald-400' : 'border-red-700 bg-red-500 hover:bg-red-400'}`}>{winner ? <><Check size={17} aria-hidden="true" />Next Duel</> : <><Trophy size={17} aria-hidden="true" />Try Again</>}</button>
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </main>
  );
}
