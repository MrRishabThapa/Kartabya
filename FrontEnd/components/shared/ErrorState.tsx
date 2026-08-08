"use client";

import { motion } from "framer-motion";
import LottieLoader from "@/components/shared/LottieLoader";
import Button from "@/components/shared/Button";

interface Props {
  title?: string;
  subtitle?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function ErrorState({
  title = "Something went wrong.",
  subtitle = "An unexpected error occurred.",
  onRetry,
  retryLabel = "Try Again",
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-[400px] flex flex-col items-center justify-center text-center px-6"
    >
      {/* Fox mascot */}
      <div className="w-48 h-48">
        <LottieLoader url="https://assets2.lottiefiles.com/packages/lf20_yr6zz3wv.json" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-3xl font-bold text-slate-900">{title}</h2>

        <p className="text-sm text-slate-500 leading-relaxed">{subtitle}</p>
      </div>

      {onRetry && (
        <div className="pt-6">
          <Button onClick={onRetry} className="px-8">
            {retryLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
