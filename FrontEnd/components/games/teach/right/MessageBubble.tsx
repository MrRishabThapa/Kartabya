import Image from 'next/image';
import type { TeachMessage } from '@/lib/games/teach/types';

export default function MessageBubble({ message, companionName }: { message: TeachMessage; companionName: string }) {
  const companion = message.sender === 'companion';
  return <div className={`flex ${companion ? 'justify-start' : 'justify-end'}`}><div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${companion ? 'bg-orange-50 text-slate-700' : 'bg-brand-primary text-white'}`}><p className={`mb-1 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] ${companion ? 'text-brand-primary' : 'text-orange-100'}`}>{companion && <Image src="/assets/logo.png" alt="" width={16} height={16} className="object-contain" />}{companion ? companionName : 'You'}</p>{message.text}</div></div>;
}
