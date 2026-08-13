"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { Activity } from "@/data/dashboard-types";
import DuolingoButton from "@/components/shared/Button";

interface Props {
  activity: Activity;
  index: number;
  Icon: LucideIcon;
}

export default function ActivityCard({ activity, index, Icon }: Props) {
  const router = useRouter();
  const isWide = activity.size === "wide";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl border border-slate-200 p-6
                 hover:border-slate-300 transition-colors"
    >
      <div
        className={`flex ${isWide ? "flex-row items-center gap-6" : "flex-col"} h-full`}
      >
        {/* Icon badge */}
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0
                     ${isWide ? "" : "mb-4"}`}
          style={{ backgroundColor: `${activity.accentColor}15` }}
        >
          <Icon
            size={22}
            style={{ color: activity.accentColor }}
            strokeWidth={2}
          />
        </div>

        {/* Text + CTA */}
        <div className="flex-1 min-w-0">
          <h3 className="text-slate-800 font-extrabold text-lg tracking-tight">
            {activity.title}
          </h3>
          <p className="mt-1 text-slate-500 text-sm">{activity.subtitle}</p>

          {/* Optional meta info (for next-lesson card) */}
          {activity.meta && (
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">
                {activity.meta.unitName}
              </span>
              {activity.meta.lessonNumber && activity.meta.totalLessons && (
                <span
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                  style={{
                    backgroundColor: `${activity.accentColor}15`,
                    color: activity.accentColor,
                  }}
                >
                  Lesson {activity.meta.lessonNumber}/
                  {activity.meta.totalLessons}
                </span>
              )}
            </div>
          )}

          <div className="mt-4">
            <DuolingoButton
              variant="primary"
              onClick={() => router.push(activity.route)}
              className="!px-6 !py-2 !text-xs"
            >
              {activity.ctaLabel}
            </DuolingoButton>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
