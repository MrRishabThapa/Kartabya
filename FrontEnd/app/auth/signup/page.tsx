"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LottieLoader from "@/components/shared/LottieLoader";
import Button from "@/components/shared/Button";
import { signup } from "@/lib/auth-service";
import { ApiError } from "@/lib/api";
import {
  completeOnboardingDraft,
  hasOnboardingDraft,
} from "@/lib/onboarding-draft";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!hasOnboardingDraft()) {
      router.replace("/onboarding");
    }
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasOnboardingDraft()) {
      router.replace("/onboarding");
      return;
    }

    setLoading(true);
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      await signup(email.trim(), password, name.trim() || "User");
      if (await completeOnboardingDraft()) {
        router.replace("/dashboard");
      } else {
        router.replace("/onboarding");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          toast.error("Email already registered.");
        } else {
          const detail = err.body?.detail;
          const message = typeof detail === "string" ? detail : detail?.message ?? "Could not complete signup.";
          toast.error(message);
        }
      } else {
        toast.error("Network error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF2EA] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-lg space-y-8 px-6 py-8 sm:px-10">
        <div className="w-40 h-40 mx-auto">
          <LottieLoader url="https://assets9.lottiefiles.com/packages/lf20_kkflmtur.json" />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[#243247]">
            Begin your journey.
          </h1>
          <p className="text-slate-500">Create your Adaptiv account.</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-slate-500" htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-slate-500" htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint outline-none"
            />
          </div>

          <div className="space-y-2 flex gap-4 ">
            <div>
              <label className="text-sm text-slate-500" htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-slate-500" htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-primary-light focus:ring-2 focus:ring-brand-primary-tint outline-none"
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            {loading ? "Creating..." : "Start Adventure"}
          </Button>

        </form>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-brand-primary font-semibold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
