"use client";

import { motion } from "framer-motion";

export function GlossyOrb({ className = "" }: { className?: string }) {
  return (
    <motion.div
      animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      aria-hidden="true"
      className={`relative rounded-full bg-[radial-gradient(circle_at_30%_24%,#fff8ed_0_9%,#ffc38d_26%,#f27928_64%,#9d4f1a_100%)] shadow-[inset_-18px_-20px_30px_rgba(112,52,18,0.24),inset_14px_12px_18px_rgba(255,255,255,0.45),0_24px_55px_-20px_rgba(194,97,32,0.5)] ${className}`}
    >
      <span className="absolute left-[22%] top-[17%] h-[18%] w-[24%] rotate-[-28deg] rounded-full bg-white/70 blur-[2px]" />
    </motion.div>
  );
}

export function GradientBlob({ className = "" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 500 400"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: [0, 3, 0], scale: [1, 1.03, 1] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      className={className}
    >
      <defs>
        <linearGradient id="warmBlob" x1="40" y1="30" x2="430" y2="370" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8F1" />
          <stop offset="0.45" stopColor="#FBE0CC" />
          <stop offset="1" stopColor="#F27928" />
        </linearGradient>
        <filter id="blobShadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#C26120" floodOpacity="0.22" /></filter>
      </defs>
      <path filter="url(#blobShadow)" fill="url(#warmBlob)" d="M82 107C122 42 221 30 294 60c76 31 132 112 98 186-31 68-129 94-220 91-86-3-149-59-150-123-1-40 28-74 60-107Z" />
      <path fill="#fff" fillOpacity=".32" d="M125 106c44-43 108-48 163-25-35 12-70 31-91 64-20 32-25 70-20 109-43-22-81-54-83-91-2-20 10-39 31-57Z" />
    </motion.svg>
  );
}

export function FloatingCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -5, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-[0_24px_60px_-25px_rgba(194,97,32,0.35)] backdrop-blur-xl before:absolute before:inset-x-5 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-white/80 bg-white/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_18px_50px_-30px_rgba(157,79,26,0.45)] backdrop-blur-xl ${className}`}>{children}</div>;
}

export function StackedLayers({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-56 w-64 ${className}`}>
      <div className="absolute left-6 top-8 h-40 w-56 rotate-[-9deg] rounded-[2rem] border border-white/70 bg-brand-primary-tint/60 shadow-[0_18px_40px_-20px_rgba(157,79,26,0.42)]" />
      <div className="absolute left-3 top-4 h-40 w-56 rotate-[5deg] rounded-[2rem] border border-white/80 bg-white/60 shadow-[0_18px_40px_-20px_rgba(157,79,26,0.35)] backdrop-blur" />
      <div className="absolute left-0 top-0 h-40 w-56 rotate-[-3deg] rounded-[2rem] border border-brand-primary-tint bg-gradient-to-br from-white via-[#fff8f1] to-[#f6bd8d] p-5 shadow-[0_25px_50px_-22px_rgba(157,79,26,0.48)]">
        <div className="h-2 w-16 rounded-full bg-brand-primary/60" /><div className="mt-7 h-2 w-32 rounded-full bg-white/80" /><div className="mt-2 h-2 w-24 rounded-full bg-white/60" /><div className="absolute bottom-5 right-5 h-10 w-10 rounded-full bg-brand-primary/80 shadow-[inset_5px_5px_8px_rgba(255,255,255,0.4)]" />
      </div>
    </div>
  );
}
