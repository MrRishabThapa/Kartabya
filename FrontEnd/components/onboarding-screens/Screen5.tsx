"use client";

import LottieLoader from "@/components/shared/LottieLoader";
import Chat from "@/components/shared/OnboardingChat";
import Button from "@/components/shared/Button";
import { OnboardingScreenProps } from "@/types/onboarding";

export default function Screen5({
  onNext,
  onBack,
  data,
}: OnboardingScreenProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-10 px-6 py-16">

      <div className="w-64 h-64">
        <LottieLoader url="https://assets10.lottiefiles.com/packages/lf20_kyu7xb1v.json" />
      </div>

      <Chat
        text={`${data.hobbies.join(", ")}? Those are my favorites too! Ready to evolve, ${data.userName}?`}
      />

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button onClick={onNext}>Yes, let's continue</Button>

        {onBack && (
          <button onClick={onBack} className="text-slate-400 text-sm">
            Modify Hobbies
          </button>
        )}
      </div>
    </div>
  );
}
