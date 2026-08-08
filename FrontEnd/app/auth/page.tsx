import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";


export default function AuthenticationChoicePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 px-6 py-12 grid place-items-center">
      <section className="w-full max-w-lg rounded-3xl border border-violet-100 bg-white/90 p-8 shadow-xl shadow-violet-100/60 backdrop-blur sm:p-10">
       
          <img src="/assets/logo.png" alt="Arcademia Logo" className="h-20 w-15" />
       
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Your path is ready</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">One last step before Arcade.</h1>
        <p className="mt-3 text-slate-600">Create an account to save your personalized learning journey, or sign in to continue.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link href="/auth/signup" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
            Create account <ArrowRight className="size-4" />
          </Link>
          <Link href="/auth/login" className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-violet-200 px-5 font-semibold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2">
            <LogIn className="size-4" /> I have an account
          </Link>
        </div>

        <Link href="/onboarding" className="mt-7 block text-center text-sm font-medium text-slate-500 hover:text-violet-700">
          Back to edit my choices
        </Link>
      </section>
    </main>
  );
}
