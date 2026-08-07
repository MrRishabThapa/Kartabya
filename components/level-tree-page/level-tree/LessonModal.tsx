'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Award, BookOpen, PlayCircle, FileText, HelpCircle, Lock } from 'lucide-react';
import { Lesson, LessonStatus } from '@/types/lessons-types';
import DuolingoButton from '@/components/shared/Button';

interface Props {
  lesson: Lesson | null;
  status: LessonStatus;
  unitColor: string;
  onClose: () => void;
}

export default function LessonModal({ lesson, status, unitColor, onClose }: Props) {
  if (!lesson) return null;

  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';

  return (
    <AnimatePresence>
      {lesson && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal card */}
          <motion.div
            key={lesson.id}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            className="fixed z-50
                       left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                       w-[92vw] max-w-md
                       bg-white rounded-3xl shadow-2xl
                       overflow-hidden"
          >
            {/* Colored header strip */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: isLocked ? '#CBD5E1' : unitColor }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 rounded-full
                         text-slate-400 hover:text-slate-700 hover:bg-slate-100
                         transition-colors z-10"
            >
              <X size={18} strokeWidth={2.5} />
            </button>

            <div className="px-6 md:px-8 pt-8 pb-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div
                  className="flex items-center justify-center w-14 h-14 rounded-2xl"
                  style={{
                    backgroundColor: isLocked ? '#F1F5F9' : `${unitColor}15`,
                  }}
                >
                  {isLocked ? (
                    <Lock size={26} className="text-slate-400" strokeWidth={2.5} />
                  ) : (
                    <BookOpen size={26} style={{ color: unitColor }} strokeWidth={2} />
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-center text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight">
                {lesson.title}
              </h2>

              {/* Lesson number */}
              <p className="mt-1 text-center text-slate-500 text-sm">
                Lesson {lesson.order}
                {lesson.type !== 'lesson' && (
                  <span className="ml-1 capitalize">· {lesson.type}</span>
                )}
              </p>

              {/* Description */}
              <p className="mt-4 text-center text-slate-500 text-sm leading-relaxed">
                {isLocked
                  ? 'Complete previous lessons to unlock this one.'
                  : lesson.description}
              </p>

              {/* Stats */}
              {!isLocked && (
                <div className="mt-6 flex items-center justify-center gap-6 py-3
                                border-y border-slate-100">
                  {lesson.estimatedMinutes && (
                    <>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-800">
                          {lesson.estimatedMinutes} min
                        </span>
                      </div>
                      <div className="w-px h-4 bg-slate-200" />
                    </>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Award size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-800">
                      +{lesson.xpReward} XP
                    </span>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {!isLocked && (
                <div className="mt-6 space-y-2">
                  <DuolingoButton
                    variant="primary"
                    onClick={() => console.log('Start lesson', lesson.id)}
                    className="!w-full !px-4"
                  >
                    {isCompleted ? 'Review Lesson' : 'Start Lesson'}
                  </DuolingoButton>

                  {/* Secondary actions */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {lesson.videoUrl && (
                      <button className="flex flex-col items-center gap-1 py-3 rounded-xl
                                         bg-slate-50 hover:bg-slate-100 transition-colors">
                        <PlayCircle size={20} className="text-slate-600" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          Video
                        </span>
                      </button>
                    )}
                    {lesson.notesUrl && (
                      <button className="flex flex-col items-center gap-1 py-3 rounded-xl
                                         bg-slate-50 hover:bg-slate-100 transition-colors">
                        <FileText size={20} className="text-slate-600" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          Notes
                        </span>
                      </button>
                    )}
                    {lesson.hasQuiz && (
                      <button className="flex flex-col items-center gap-1 py-3 rounded-xl
                                         bg-slate-50 hover:bg-slate-100 transition-colors">
                        <HelpCircle size={20} className="text-slate-600" />
                        <span className="text-[11px] font-semibold text-slate-600">
                          Quiz
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Locked message */}
              {isLocked && (
                <div className="mt-6">
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-100 text-slate-400
                               font-bold uppercase tracking-wider text-sm cursor-not-allowed"
                  >
                    Locked 🔒
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}