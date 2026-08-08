"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LottieLoader from "@/components/shared/LottieLoader";
import Button from "@/components/shared/Button";
import GoogleIcon from "@/components/shared/GoogleIcon";
import { login } from "@/lib/auth-service";
import { ApiError } from "@/lib/api";
import { completeOnboardingDraft } from "@/lib/onboarding-draft";
import { googleAuthUrl } from "@/lib/google-auth";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      await completeOnboardingDraft();
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError("Incorrect email or password.");
        } else {
          setError("Something went wrong.");
        }
      } else {
        setError("Network error — try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF2EA] flex items-center justify-center px-6 py-10">
  
      <div className="w-full max-w-lg space-y-8 px-6 py-8 sm:px-10">
        <div className="w-40 h-40 mx-auto">
          <LottieLoader url="https://assets3.lottiefiles.com/packages/lf20_wnqlfojb.json" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[#243247]">Welcome back.</h1>
          <p className="text-slate-500">
            Let’s continue your journey with Adaptiv.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="text-sm text-red-500 text-center">{error}</div>
          )}

          <div className="space-y-2">
            <label className="text-sm text-slate-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint outline-none"
            />
          </div>

          <Button type="submit" className="w-full">
            {loading ? "Entering..." : "Get back in"}
          </Button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              or
            </span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <a
            href={googleAuthUrl}
            className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border-2 border-[#FBE0CC] bg-white px-4 py-3 font-semibold text-[#C26120] shadow-sm transition hover:border-[#FF8D48] hover:bg-[#FEF2EA] focus:outline-none focus:ring-2 focus:ring-[#FBBF24] focus:ring-offset-2"
          >
            <GoogleIcon className="size-5" />
            Continue with Google
          </a>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don’t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-brand-primary font-semibold hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
