'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Trophy,        // ← was ClipboardCheck
  Award,
  MessageCircle,
  Gamepad2,
  Map,
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview',    href: '/dashboard' },
  { icon: BookOpen,        label: 'Classes',     href: '/dashboard/classes' },
  { icon: Trophy,          label: 'Leaderboard', href: '/dashboard/leaderboard' },
  { icon: Award,           label: 'Grade',       href: '/dashboard/grade' },
  { icon: MessageCircle,   label: 'Community',       href: '/dashboard/community' },
  { icon: Gamepad2,        label: 'Games',       href: '/dashboard/games' },
  { icon: Map,             label: 'Visit City',  href: '/learn' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex fixed left-0 top-0 h-screen w-24 z-30
                 flex-col items-center py-6
                 bg-white border-r border-slate-200"
    >
      <Link href="/dashboard" className="mb-10">
        <Image
          src="/assets/logo.png"
          alt="Adaptiv fox mascot"
          width={50}
          height={50}
          priority
        />
      </Link>

      <nav className="flex flex-col gap-1 w-full px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center gap-1 py-3 px-2 rounded-xl
                transition-colors
                ${isActive
                  ? 'bg-brand-primary-bg text-brand-primary'
                  : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                }
              `}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
