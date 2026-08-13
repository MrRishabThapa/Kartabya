"use client";
import { motion } from "framer-motion";
import Image from "next/image";
// import { Flame, Zap } from 'lucide-react';
import { UserProfile } from "@/data/dashboard-types";

interface Props {
  user: UserProfile;
}

export default function ProfileCard({ user }: Props) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-white rounded-2xl border border-slate-200 p-6
                 overflow-hidden"
    >
      {/*
        🦊 Fox mascot — emerges from bottom-right corner.
        Absolutely positioned, bottom-aligned, so the "cut" of the image
        sits flush with the card's bottom edge creating the "peeking out" effect.
      */}
      <div
        className="absolute bottom-0 left-2 sm:left-4 w-42 h-50 sm:w-36 sm:h-48
                      pointer-events-none"
      >
        <Image
          src="/assets/fox-mascot.png"
          alt="Fox mascot"
          fill
          priority
          className="object-contain  object-bottom"
        />
      </div>

      <div className="relative z-10 pl-38 sm:pl-48">
        <p className="text-slate-500 text-xs">{greeting},</p>
        <h2 className="text-slate-800 text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
          {user.name}
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">{user.class}</p>
        {user.companionName && (
          <p className="text-brand-primary-dark text-xs mt-1">
            Fox companion: {user.companionName}
          </p>
        )}
      </div>

      {/* Stats row
      <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-around">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-orange-500" strokeWidth={2.5} />
          <div>
            <div className="text-sm font-extrabold text-slate-800 leading-none">
              {user.streakDays}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">day streak</div>
          </div>
        </div>

        <div className="w-px h-8 bg-slate-100" />

        <div className="flex items-center gap-2">
          <Zap size={16} className="text-brand-primary" strokeWidth={2.5} />
          <div>
            <div className="text-sm font-extrabold text-slate-800 leading-none">
              {user.totalXp.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">total XP</div>
          </div>
        </div>
      </div> */}
    </motion.div>
  );
}
