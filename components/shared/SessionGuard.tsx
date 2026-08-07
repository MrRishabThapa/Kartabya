"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMe } from "@/lib/auth-service";

interface SessionGuardProps {
  children: ReactNode;
}

/**
 * Protects authenticated product pages from unauthenticated access.
 */
export default function SessionGuard({
  children,
}: SessionGuardProps) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        await getMe();
        if (active) setAllowed(true);
      } catch {
        router.replace("/auth/login");
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div
        className="min-h-screen grid place-items-center bg-white text-sm text-slate-500"
        role="status"
      >
        Loading your journey…
      </div>
    );
  }

  return <>{children}</>;
}
