'use client';

import { useEffect, useRef } from 'react';
import type { TeachMessage } from '@/lib/games/teach/types';
import MessageBubble from './MessageBubble';

export default function ConversationPanel({ companionName, messages }: { companionName: string; messages: TeachMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const timer = window.setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 0); return () => window.clearTimeout(timer); }, [messages]);
  return <section className="flex min-h-0 flex-1 flex-col bg-[#fffaf4]" aria-label={`Conversation with ${companionName}`}><header className="border-b border-orange-100 px-5 py-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">Conversation</p><h2 className="mt-1 text-xl font-black text-slate-800">Talking with {companionName}</h2></header><div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-5" role="log" aria-live="polite">{messages.map((message) => <MessageBubble key={message.id} message={message} companionName={companionName} />)}<div ref={bottomRef} /></div></section>;
}
