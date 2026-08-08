'use client';
import { ChevronDown, LogOut, Search } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { logout } from '@/lib/auth-service';
import { useUser } from '@/context/UserContext';
import { UserProfile } from '@/data/dashboard-types';

interface Props {
  user: UserProfile;
}

export default function TopBar({ user }: Props) {
  const router = useRouter();
  const { setAuthUser } = useUser();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeProfile(event: MouseEvent) {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', closeProfile);
    return () => document.removeEventListener('mousedown', closeProfile);
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      setAuthUser(null);
      router.replace('/auth/login');
    }
  }

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

      {/* Avatar */}
      <div ref={profileRef} className="relative">
        <button
          type="button"
          onClick={() => setProfileOpen((open) => !open)}
          aria-expanded={profileOpen}
          aria-haspopup="menu"
          aria-label="Open profile menu"
          className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 pr-3
                     transition-colors hover:border-slate-300"
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt={user.name} width={32} height={32} />
            ) : (
              <span className="text-sm font-bold text-slate-500">{user.name.charAt(0)}</span>
            )}
          </div>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} strokeWidth={2} />
        </button>

        {profileOpen && (
          <div role="menu" className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            <div className="border-b border-slate-100 px-3 py-2">
              <p className="truncate text-sm font-bold text-slate-800">{user.name}</p>
              <p className="text-xs text-slate-400">Account</p>
            </div>
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="mt-1 flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-brand-primary-bg hover:text-brand-primary"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
