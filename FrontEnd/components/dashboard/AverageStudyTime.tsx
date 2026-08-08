'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { MOCK_STUDY_TIME } from '@/data/dashboard-mock';

type Period = 'day' | 'week' | 'month';

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold shadow-lg">
      {payload[0].value} min
    </div>
  );
};

export default function AverageStudyTime() {
  const [period, setPeriod] = useState<Period>('week');
  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
  ];

  const todayMinutes = MOCK_STUDY_TIME.find((d:any) => d.isToday)?.minutes ?? 0;
  const avgMinutes = Math.round(
    MOCK_STUDY_TIME.filter((d:any) => d.minutes > 0).reduce((sum:any, d:any) => sum + d.minutes, 0) /
    MOCK_STUDY_TIME.filter((d:any) => d.minutes > 0).length || 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 }}
      className="bg-white rounded-2xl border border-slate-200 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">
          Study Time
        </h2>

        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`
                px-3 py-1 rounded-md text-xs font-semibold transition-colors
                ${period === p.value
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }
              `}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary numbers */}
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-3xl font-extrabold text-slate-800 tabular-nums">
          {todayMinutes}
        </span>
        <span className="text-sm text-slate-500 font-medium">min today</span>
        <span className="text-xs text-slate-400 ml-auto">
          Avg {avgMinutes} min/day
        </span>
      </div>

      {/* Chart */}
      <div className="h-52 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={MOCK_STUDY_TIME} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#CBD5E1', fontSize: 10 }}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
            <Bar
              dataKey="minutes"
              radius={[8, 8, 8, 8]}
              animationDuration={600}
            >
              {MOCK_STUDY_TIME.map((entry:any, i:any) => (
                <Cell key={i} fill={entry.isToday ? '#F27928' : '#FBE0CC'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
