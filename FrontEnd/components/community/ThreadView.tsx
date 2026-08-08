'use client';

import { ArrowLeft, Flag, MessageSquare, Send } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import type { CommunityComment, CommunityPost } from './types';
import { scoreOf } from './types';
import PostCard from './PostCard';
import VoteControl from './VoteControl';

interface ThreadViewProps {
  post: CommunityPost;
  onBack: () => void;
  onToggleLike: () => void;
  onCommentVote: (commentId: string, vote: 'up' | 'down') => void;
  onAddComment: (body: string, parentId?: string) => void;
  onReport: () => void;
}

function CommentCard({ comment, depth = 0, onVote, onReply, onReport }: { comment: CommunityComment; depth?: number; onVote: (id: string, vote: 'up' | 'down') => void; onReply: (body: string, parentId: string) => void; onReport: () => void }) {
  const [replying, setReplying] = useState(false); const [body, setBody] = useState('');
  const orderedReplies = useMemo(() => [...(comment.replies ?? [])].sort((a, b) => scoreOf(b) - scoreOf(a)), [comment.replies]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (body.trim()) { onReply(body.trim(), comment.id); setBody(''); setReplying(false); } };
  return <div className={depth ? 'ml-5 border-l border-slate-200 pl-4 md:ml-8 md:pl-5' : ''}><div className="py-4"><div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-extrabold text-slate-600">{comment.author.initials}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-x-2"><span className="text-sm font-bold text-slate-800">{comment.author.name}</span>{comment.author.role === 'Mentor' && <span className="text-[10px] font-bold uppercase tracking-wide text-amber-700">Mentor</span>}<span className="text-xs text-slate-400">{comment.createdAt}</span></div><p className="mt-1.5 text-sm leading-6 text-slate-600">{comment.body}</p><div className="mt-3 flex items-center gap-2"><VoteControl compact score={scoreOf(comment)} vote={comment.vote} onVote={(vote) => onVote(comment.id, vote)} /><button onClick={() => setReplying(!replying)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-brand-primary-dark"><MessageSquare size={14} />Reply</button><button onClick={onReport} aria-label="Report comment" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Flag size={14} /></button></div>{replying && <form onSubmit={submit} className="mt-3 flex gap-2"><input autoFocus value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a reply..." className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-primary-light" /><button className="rounded-lg bg-brand-primary px-3 text-white hover:bg-brand-primary-light" aria-label="Post reply"><Send size={15} /></button></form>}</div></div></div>{orderedReplies.map((reply) => <CommentCard key={reply.id} comment={reply} depth={depth + 1} onVote={onVote} onReply={onReply} onReport={onReport} />)}</div>;
}

export default function ThreadView({ post, onBack, onToggleLike, onCommentVote, onAddComment, onReport }: ThreadViewProps) {
  const [body, setBody] = useState('');
  const orderedComments = useMemo(() => [...post.comments].sort((a, b) => scoreOf(b) - scoreOf(a)), [post.comments]);
  const submit = (event: FormEvent) => { event.preventDefault(); if (body.trim()) { onAddComment(body.trim()); setBody(''); } };
  return <div className="mx-auto max-w-3xl"><button onClick={onBack} className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-slate-500 hover:bg-white hover:text-brand-primary-dark"><ArrowLeft size={18} />Back to community</button><PostCard post={post} onOpen={() => undefined} onToggleLike={onToggleLike} onReport={onReport} /><section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><h2 className="text-base font-extrabold text-slate-800">Discussion <span className="text-slate-400">({post.comments.length})</span></h2><form onSubmit={submit} className="mt-4"><textarea value={body} onChange={(event) => setBody(event.target.value)} rows={3} placeholder="Add a helpful response..." className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-700 outline-none focus:border-brand-primary-light focus:ring-4 focus:ring-brand-primary-bg" /><div className="mt-2 flex justify-end"><button disabled={!body.trim()} className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-primary-light disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} />Post response</button></div></form><div className="mt-4 divide-y divide-slate-100">{orderedComments.length ? orderedComments.map((comment) => <CommentCard key={comment.id} comment={comment} onVote={onCommentVote} onReply={(reply, parentId) => onAddComment(reply, parentId)} onReport={onReport} />) : <p className="py-8 text-center text-sm text-slate-500">No replies yet. Start a thoughtful discussion.</p>}</div></section></div>;
}
