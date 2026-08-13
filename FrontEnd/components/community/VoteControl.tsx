"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { Vote } from "./types";

interface VoteControlProps {
  score: number;
  vote: Vote;
  onVote: (vote: Exclude<Vote, null>) => void;
  compact?: boolean;
}

export default function VoteControl({
  score,
  vote,
  onVote,
  compact = false,
}: VoteControlProps) {
  return (
    <div
      className={`inline-flex items-center rounded-lg bg-slate-100 p-0.5 ${compact ? "gap-0.5" : "gap-1"}`}
    >
      <button
        aria-label="Upvote"
        onClick={() => onVote("up")}
        className={`rounded-md p-1 transition-colors ${vote === "up" ? "bg-brand-primary-tint text-brand-primary-dark" : "text-slate-500 hover:bg-white hover:text-brand-primary"}`}
      >
        <ChevronUp size={compact ? 16 : 18} strokeWidth={2.5} />
      </button>
      <span
        className={`min-w-7 text-center font-extrabold tabular-nums text-slate-700 ${compact ? "text-xs" : "text-sm"}`}
      >
        {score}
      </span>
      <button
        aria-label="Downvote"
        onClick={() => onVote("down")}
        className={`rounded-md p-1 transition-colors ${vote === "down" ? "bg-slate-300 text-slate-800" : "text-slate-500 hover:bg-white hover:text-slate-800"}`}
      >
        <ChevronDown size={compact ? 16 : 18} strokeWidth={2.5} />
      </button>
    </div>
  );
}
