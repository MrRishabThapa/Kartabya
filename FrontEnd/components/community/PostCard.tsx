"use client";

import { Flag, Heart, MessageSquare, Share2 } from "lucide-react";
import Image from "next/image";
import type { CommunityPost } from "./types";

export default function PostCard({
  post,
  onOpen,
  onToggleLike,
  onReport,
}: {
  post: CommunityPost;
  onOpen: () => void;
  onToggleLike: () => void;
  onReport: () => void;
}) {
  const share = async () => {
    if (navigator.share)
      await navigator.share({ title: post.title, text: post.body });
    else
      await navigator.clipboard?.writeText(
        `${window.location.origin}/dashboard/community#${post.id}`,
      );
  };
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-tint text-xs font-extrabold text-brand-primary-dark">
            {post.author.initials}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold text-slate-800">
                {post.author.name}
              </p>
              {post.author.role === "Mentor" && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Mentor
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              @{post.author.handle} · {post.createdAt}
            </p>
          </div>
          <span className="ml-auto rounded-full bg-brand-primary-bg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary-dark">
            {post.topic}
          </span>
        </div>
        <button onClick={onOpen} className="mt-4 block text-left">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-800 transition-colors hover:text-brand-primary-dark">
            {post.title}
          </h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
            {post.body}
          </p>
        </button>
        {post.imageUrl && (
          <button
            onClick={onOpen}
            className="mt-4 block w-full overflow-hidden rounded-xl"
          >
            <Image
              src={post.imageUrl}
              alt="Post attachment"
              width={960}
              height={416}
              unoptimized
              className="h-52 w-full object-cover"
            />
          </button>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleLike}
            aria-label={post.liked ? "Unlike post" : "Like post"}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold ${post.liked ? "bg-red-50 text-red-600" : "text-slate-500 hover:bg-red-50 hover:text-red-600"}`}
          >
            <Heart size={18} className={post.liked ? "fill-current" : ""} />
            {post.likes}
          </button>
          <button
            onClick={onOpen}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-brand-primary-dark"
          >
            <MessageSquare size={17} />
            {post.commentCount ?? post.comments.length} replies
          </button>
          <button
            onClick={share}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-brand-primary-dark"
          >
            <Share2 size={17} />
            Share
          </button>
          <button
            aria-label="Report post"
            onClick={onReport}
            className="ml-auto rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
          >
            <Flag size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
