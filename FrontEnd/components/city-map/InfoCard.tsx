'use client';
import { District } from '@/data/districts-types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/hooks/useProgress';
import DuolingoButton from '@/components/shared/Button';

interface Props {
  district: District | null;
  onClose: () => void;
}

export default function InfoCard({ district, onClose }: Props) {
  const router = useRouter();
  const { getUnitProgress, hydrated } = useProgress();

  const completed = district && hydrated
    ? getUnitProgress(district.id).completedLessons.length
    : 0;
  const pct = district ? Math.round((completed / district.totalLessons) * 100) : 0;

  return (
    <AnimatePresence>
      {district && (
        <>
          {/* 🌫️ Mobile backdrop — tap to close, dims background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          />

          {/*
            📱 Responsive card:
            • Mobile: bottom sheet (slides up from bottom)
            • Desktop: floating side panel (slides in from right)
          */}
          <motion.aside
            key={district.id}
            // Animation from bottom on mobile, from right on desktop
            initial={{
              y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0,
              x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : '110%',
              opacity: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0,
            }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{
              y: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 0,
              x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : '110%',
              opacity: typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 0,
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            // Swipe-down-to-close on mobile
            drag={typeof window !== 'undefined' && window.innerWidth < 768 ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-50 bg-white shadow-xl shadow-slate-200/60 border border-slate-200
                       overflow-hidden
                       /* 📱 Mobile: bottom sheet */
                       bottom-0 left-0 right-0
                       rounded-t-3xl max-h-[85dvh]
                       /* 💻 Desktop: right side panel */
                       md:bottom-auto md:left-auto md:top-1/2 md:right-8
                       md:-translate-y-1/2
                       md:w-[92vw] md:max-w-sm
                       md:rounded-2xl"
          >
            {/* 📱 Mobile drag handle */}
            <div className="flex md:hidden justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 md:top-4 md:right-4
                         p-2 rounded-full
                         text-slate-400 hover:text-slate-700
                         hover:bg-slate-100
                         transition-colors z-10"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            {/* Scrollable content area (in case content is tall on mobile) */}
            <div className="px-6 md:px-8 pt-6 md:pt-10 pb-6 md:pb-8
                            overflow-y-auto max-h-[85dvh] md:max-h-none">
              {/* Icon */}
              <div className="flex justify-center mb-4 md:mb-6">
                <div
                  className="flex items-center justify-center
                             w-14 h-14 md:w-16 md:h-16 rounded-2xl"
                  style={{ backgroundColor: `${district.color}15` }}
                >
                  <district.Icon
                    size={28}
                    strokeWidth={2}
                    style={{ color: district.color }}
                    className="md:!w-8 md:!h-8"
                  />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-center text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                {district.name}.
              </h2>
              <p className="mt-1 md:mt-2 text-center text-slate-500 text-sm md:text-base">
                {district.courseTitle}
              </p>

              {/* Description */}
              <p className="mt-4 md:mt-6 text-center text-slate-500 text-sm leading-relaxed
                            px-2 md:px-0">
                {district.description}
              </p>

              {/* Stats row */}
              <div className="mt-6 md:mt-8 flex items-center justify-center
                              gap-6 md:gap-8
                              py-3 md:py-4 border-y border-slate-100">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <BookOpen size={14} className="text-slate-400 md:!w-4 md:!h-4" strokeWidth={2} />
                  <div className="text-xs md:text-sm">
                    <span className="font-bold text-slate-800">
                      {district.totalLessons}
                    </span>
                    <span className="text-slate-500 ml-1">lessons</span>
                  </div>
                </div>

                <div className="w-px h-4 bg-slate-200" />

                <div className="flex items-center gap-1.5 md:gap-2">
                  <Trophy size={14} className="text-slate-400 md:!w-4 md:!h-4" strokeWidth={2} />
                  <div className="text-xs md:text-sm">
                    <span className="font-bold text-slate-800">
                      {completed}/{district.totalLessons}
                    </span>
                    <span className="text-slate-500 ml-1">done</span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 md:mt-6">
                <div className="flex items-center justify-between mb-1.5 md:mb-2">
                  <span className="text-[11px] md:text-xs font-medium text-slate-500">
                    Progress
                  </span>
                  <span className="text-[11px] md:text-xs font-bold text-slate-800">
                    {pct}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: district.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* CTA */}
              <div className="mt-6 md:mt-8">
                <DuolingoButton
                  variant="primary"
                  onClick={() => router.push(district.route)}
                  className="!w-full !px-4"
                >
                  Explore
                </DuolingoButton>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}