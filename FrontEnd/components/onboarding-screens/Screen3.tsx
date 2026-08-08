"use client";

import LottieLoader from "@/components/shared/LottieLoader";
import Chat from "@/components/shared/OnboardingChat";
import Button from "@/components/shared/Button";
import { OnboardingScreenProps } from "@/types/onboarding";

export default function Screen3({
  onNext,
  onBack,
  updateData,
  data,
}: OnboardingScreenProps) {
  return (
    <div className="space-y-12 px-6 py-16">

      <div className="w-40 h-40">
        <LottieLoader url="https://assets3.lottiefiles.com/packages/lf20_w51pcehl.json" />
      </div>

      <Chat
        text={`Hi ${data.userName || "traveler"}, so... what are you calling me?`}
      />

      <input
        autoFocus
        type="text"
        placeholder="Fox nickname..."
        value={data.foxNickname}
        onChange={(e) => updateData({ foxNickname: e.target.value })}
        className="w-full text-5xl font-bold text-brand-primary placeholder:text-brand-primary-tint bg-transparent outline-none"
      />

      <div className="flex justify-between pt-8">
        {onBack && (
          <button onClick={onBack} className="text-slate-400 font-semibold">
            Back
          </button>
        )}

        <Button disabled={!data.foxNickname} onClick={onNext}>
          Perfect!
        </Button>
      </div>
    </div>
  );
}
