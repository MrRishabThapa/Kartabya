"use client";

import { Check } from "lucide-react";
import Chat from "@/components/shared/OnboardingChat";
import Button from "@/components/shared/Button";
import { OnboardingScreenProps } from "@/types/onboarding";

const HOBBIES = ["Football", "Minecraft", "Anime", "Coding", "Music", "Art", "Chess"];

export default function Screen4({
  onNext,
  onBack,
  updateData,
  data,
}: OnboardingScreenProps) {

  const toggleHobby = (hobby: string) => {
    const current = data.hobbies || [];

    if (current.includes(hobby)) {
      updateData({ hobbies: current.filter((h) => h !== hobby) });
    } else if (current.length < 3) {
      updateData({ hobbies: [...current, hobby] });
    }
  };

  return (
    <div className="space-y-10 px-6 py-16 bg-white">

      <Chat text="Pick up to 3 hobbies." />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {HOBBIES.map((hobby) => {
          const selected = data.hobbies.includes(hobby);

          return (
            <button
              key={hobby}
              onClick={() => toggleHobby(hobby)}
              className={`relative p-4 rounded-xl border-2 font-semibold transition-all
                ${
                  selected
                    ? "border-brand-primary-light bg-brand-primary-bg text-brand-primary border-b-4"
                    : "border-slate-200 text-slate-600"
                }`}
            >
              {hobby}
              {selected && (
                <Check className="absolute top-2 right-2 w-4 h-4" />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex justify-between pt-6">
        {onBack && <button onClick={onBack}>Back</button>}
        <Button disabled={!data.hobbies.length} onClick={onNext}>
          Continue
        </Button>
      </div>
    </div>
  );
}
