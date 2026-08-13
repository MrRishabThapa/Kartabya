"use client";
import { motion } from "framer-motion";
import { PlayCircle, Gamepad2, BookOpen } from "lucide-react";
import { MOCK_ACTIVITIES } from "@/data/dashboard-mock";
import ActivityCard from "./ActivityCard";

const ACTIVITY_ICONS = {
  "next-lesson": PlayCircle,
  minigames: Gamepad2,
  practice: BookOpen,
};

export default function SuggestedActivities() {
  const smallActivities = MOCK_ACTIVITIES.filter((a) => a.size === "small");
  const wideActivities = MOCK_ACTIVITIES.filter((a) => a.size === "wide");

  return (
    <div className="space-y-3">
      <motion.h2
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-lg font-extrabold text-slate-800 tracking-tight px-1"
      >
        Suggested Activities
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {smallActivities.map((activity, i) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            index={i}
            Icon={ACTIVITY_ICONS[activity.id as keyof typeof ACTIVITY_ICONS]}
          />
        ))}
      </div>

      {wideActivities.map((activity, i) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          index={smallActivities.length + i}
          Icon={ACTIVITY_ICONS[activity.id as keyof typeof ACTIVITY_ICONS]}
        />
      ))}
    </div>
  );
}
