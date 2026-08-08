"use client";

export default function QuizSkeletonContent() {
  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="h-4 w-32 rounded shimmer"></div>
        <div className="h-4 w-10 rounded shimmer"></div>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full shimmer"></div>

      {/* Question */}
      <div className="space-y-3 pt-4">
        <div className="h-6 w-3/4 rounded shimmer"></div>
        <div className="h-6 w-2/3 rounded shimmer"></div>
      </div>

      {/* Options */}
      <div className="space-y-4 pt-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl shimmer"
          />
        ))}
      </div>

      {/* Button */}
      <div className="flex justify-end pt-6">
        <div className="h-12 w-40 rounded-xl shimmer"></div>
      </div>
    </>
  );
}