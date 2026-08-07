"use client";

import LottieLoader from "@/components/shared/LottieLoader";
import Chat from "@/components/shared/OnboardingChat";
import Button from "@/components/shared/Button";
import { OnboardingScreenProps } from "@/types/onboarding";

export default function Screen1({
  onNext,
}: OnboardingScreenProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-10 px-6 py-16 bg-white">

      <div className="w-72 h-72">
        <LottieLoader url="https://assets9.lottiefiles.com/packages/lf20_jcikwtux.json" />
      </div>

      <div className="max-w-2xl">
        <Chat text="Legend tells of Arcade—a state of infinite wisdom where focus is as steady as the stars. I’m just a wanderer here... but I think we can reach it if we walk together." />
      </div>

      <Button onClick={onNext} className="px-12">
        Begin the Journey
      </Button>
    </div>
  );
}