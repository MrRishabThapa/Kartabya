"use client";

import { useRouter } from "next/navigation";
import LottieLoader from "@/components/shared/LottieLoader";
import Chat from "@/components/shared/OnboardingChat";
import Button from "@/components/shared/Button";
import { saveOnboardingDraft } from "@/lib/onboarding-draft";
import { OnboardingScreenProps } from "@/types/onboarding";

const GRADES = ["Class 11", "Class 12", "Engineering", "Medical"];
const SUBJECTS = ["Physics", "Math", "Computer Science", "Biology"];

export default function Screen6({
  data,
  updateData,
}: OnboardingScreenProps) {
  const router = useRouter();

  const handleFinish = () => {
    saveOnboardingDraft(data);
    router.push("/auth");
  };

  return (
    <div className="space-y-12 px-6 py-16 bg-white">

      {/* ✅ Mountain Animation */}
      <div className="w-72 h-72 mx-auto">
        <LottieLoader url="https://assets2.lottiefiles.com/packages/lf20_kkflmtur.json" />
      </div>

      <Chat text="Our bond is Secured. Now, which mountain are we conquering first?" />

      {/* ✅ Grade Selection */}
      <div>
        <p className="text-xs font-bold uppercase text-slate-400 mb-3">
          Select Grade
        </p>

        <div className="flex flex-wrap gap-3">
          {GRADES.map((grade) => {
            const selected = data.targetCourse.grade === grade;

            return (
              <button
                key={grade}
                onClick={() =>
                  updateData({
                    targetCourse: {
                      ...data.targetCourse,
                      grade,
                    },
                  })
                }
                className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-150
                  ${
                    selected
                      ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED] border-b-4 translate-y-[2px]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
              >
                {grade}
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ Subject Selection */}
      {data.targetCourse.grade && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-xs font-bold uppercase text-slate-400 mb-3">
            Select Subject
          </p>

          <div className="flex flex-wrap gap-3">
            {SUBJECTS.map((subject) => {
              const selected =
                data.targetCourse.subject === subject;

              return (
                <button
                  key={subject}
                  onClick={() =>
                    updateData({
                      targetCourse: {
                        ...data.targetCourse,
                        subject,
                      },
                    })
                  }
                  className={`px-6 py-3 rounded-xl border-2 font-semibold transition-all duration-150
                    ${
                      selected
                        ? "border-[#7C3AED] bg-purple-50 text-[#7C3AED] border-b-4 translate-y-[2px]"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                >
                  {subject}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Button
        disabled={!data.targetCourse.subject}
        onClick={handleFinish}
        className="w-full mt-6"
      >
        Save my path
      </Button>
    </div>
  );
}
