"use client";

import LottieLoader from "@/components/shared/LottieLoader";
import Chat from "@/components/shared/OnboardingChat";
import Button from "@/components/shared/Button";
import { OnboardingScreenProps } from "@/types/onboarding";

export default function Screen2({
  onNext,
  updateData,
  data,
}: OnboardingScreenProps) {
  return (
    <div className="space-y-12 px-6 py-16 bg-white">

      <div className="w-40 h-40">
        <LottieLoader url="https://assets2.lottiefiles.com/packages/lf20_touohxv0.json" />
      </div>

      <Chat text="I'll be your companion on this path. First... what shall I call you?" />

      <input
        autoFocus
        type="text"
        placeholder="Your name..."
        value={data.userName}
        onChange={(e) => updateData({ userName: e.target.value })}
        className="w-full text-5xl font-bold text-slate-800 placeholder:text-slate-200 bg-transparent outline-none"
      />

      <div className="flex justify-end pt-8">
        <Button disabled={!data.userName} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}