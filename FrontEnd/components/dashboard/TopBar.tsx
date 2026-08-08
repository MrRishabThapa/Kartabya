'use client';
import { Bell, ChevronDown, Search } from 'lucide-react';
import Image from 'next/image';
import { UserProfile } from '@/data/dashboard-types';

interface Props {
  user: UserProfile;
  notificationCount?: number;
}

export default function TopBar({ user, notificationCount = 0 }: Props) {
  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Search */}
      <div className="flex-1 relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          strokeWidth={2}
        />
        <input
          type="text"
          placeholder="Search lessons, quizzes, topics..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl
                     bg-white border border-slate-200
                     text-sm placeholder:text-slate-400
                     focus:outline-none focus:border-slate-300
                     transition-colors"
        />
      </div>

      {/* Notifications */}
      <button
        className="relative w-11 h-11 rounded-2xl bg-white border border-slate-200
                   flex items-center justify-center text-slate-500
                   hover:text-slate-700 hover:border-slate-300 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} strokeWidth={2} />
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1
                           rounded-full bg-red-500 border-2 border-white
                           flex items-center justify-center
                           text-[10px] font-bold text-white">
            {notificationCount}
          </span>
        )}
      </button>

      {/* Avatar */}
      <button
        className="flex items-center gap-2 p-1.5 pr-3 rounded-2xl
                   bg-white border border-slate-200
                   hover:border-slate-300 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden
                        flex items-center justify-center">
          {user.avatarUrl ? (
            <Image src={user.avatarUrl} alt={user.name} width={32} height={32} />
          ) : (
            <span className="text-sm font-bold text-slate-500">
              {user.name.charAt(0)}
            </span>
          )}
        </div>
        <ChevronDown size={14} className="text-slate-400" strokeWidth={2} />
      </button>
    </div>
  );
}