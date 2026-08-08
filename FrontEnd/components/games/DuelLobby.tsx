'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Copy, Gamepad2, LogIn, Plus, Users, X } from 'lucide-react';
import { useState } from 'react';

interface DuelLobbyProps {
  onClose?: () => void;
  onStartDuel: (roomCode: string) => void;
}

type LobbyMode = 'create' | 'join';

function generateRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function DuelLobby({ onClose, onStartDuel }: DuelLobbyProps) {
  const [mode, setMode] = useState<LobbyMode>('create');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState('');

  const createRoom = () => {
    setCreatedCode(generateRoomCode());
  };

  const switchMode = (nextMode: LobbyMode) => {
    setMode(nextMode);
    if (nextMode === 'join') setCreatedCode(null);
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-slate-900/25 backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        aria-hidden="true"
      />
      <motion.aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-slate-200 bg-white px-5 py-6 shadow-2xl sm:px-8 md:w-1/3 md:min-w-[390px]"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 32 }}
        aria-label="Duel room lobby"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-primary">Duel mode</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">Enter the arena</h1>
          </div>
          {onClose && <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="Close duel lobby"><X size={19} /></button>}
        </div>

        <div className="mt-8 rounded-2xl border border-brand-primary-tint bg-brand-primary-bg p-5">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-brand-primary shadow-sm"><Gamepad2 size={22} /></div>
          <h2 className="font-bold text-slate-800">A fast 1v1 coding battle</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Find and fix the bug before your opponent does. You have 60 seconds to submit a working solution.</p>
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><Users size={14} className="text-brand-primary" />1v1</span><span>60 sec</span><span>+80 XP</span></div>
        </div>

        <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist" aria-label="Room actions">
          <button onClick={() => switchMode('create')} role="tab" aria-selected={mode === 'create'} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${mode === 'create' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Plus size={16} />Create room</button>
          <button onClick={() => switchMode('join')} role="tab" aria-selected={mode === 'join'} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold transition ${mode === 'join' ? 'bg-white text-brand-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LogIn size={16} />Join room</button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {mode === 'create' ? (
            <motion.div key="create" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="mt-7">
              <h2 className="text-lg font-bold text-slate-800">Create a private room</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Create a room and share the code with a friend. Start when you are both ready.</p>
              {createdCode && <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Your room code</p><div className="mt-2 flex items-center justify-between"><span className="font-mono text-2xl font-extrabold tracking-[0.25em] text-emerald-800">{createdCode}</span><button onClick={() => navigator.clipboard?.writeText(createdCode)} className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-100" aria-label="Copy room code"><Copy size={17} /></button></div><p className="mt-2 text-xs text-emerald-700">Share this code, then join the duel when your opponent is ready.</p></div>}
            </motion.div>
          ) : (
            <motion.div key="join" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="mt-7">
              <h2 className="text-lg font-bold text-slate-800">Join a private room</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter the six-character code shared by your opponent.</p>
              <label htmlFor="room-code" className="mt-5 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Room code</label>
              <input id="room-code" value={roomCode} onChange={(event) => setRoomCode(event.target.value.replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase())} placeholder="e.g. A7K2Q9" maxLength={6} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-4 font-mono text-lg font-bold tracking-[0.2em] text-slate-800 outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-300 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint" />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto border-t border-slate-100 pt-5">
          <button onClick={mode === 'create' && !createdCode ? createRoom : () => onStartDuel(createdCode ?? roomCode.trim().toUpperCase())} disabled={mode === 'join' && roomCode.trim().length < 4} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-b-4 border-brand-primary-dark bg-brand-primary px-5 font-bold text-white transition hover:bg-brand-primary-light active:translate-y-0.5 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-40">
            {mode === 'create' && !createdCode ? <><Plus size={17} />Create room</> : <>{mode === 'create' ? 'Join duel' : 'Join duel'}<ArrowRight size={17} /></>}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">You can leave the room before the duel begins.</p>
        </div>
      </motion.aside>
    </>
  );
}
