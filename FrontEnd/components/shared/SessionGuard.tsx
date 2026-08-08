"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { getMe, getOnboarding } from "@/lib/auth-service";
import { useUser } from "@/context/UserContext";

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
  const { setAuthUser, setOnboarding } = useUser();

  useEffect(() => {
    let active = true;

    async function verifySession() {
      try {
        const user = await getMe();
        if (active) {
          setAuthUser(user);
          if (user.is_onboarded) {
            try {
              setOnboarding(await getOnboarding());
            } catch {
              setOnboarding(null);
            }
          }
          setAllowed(true);
        }
      } catch {
        router.replace("/auth/login");
      }
    }

    verifySession();

    return () => {
      active = false;
    };
  }, [router, setAuthUser, setOnboarding]);

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
