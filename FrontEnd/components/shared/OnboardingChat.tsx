"use client";
import { motion, type Variants } from "framer-motion";

export default function AdaptivChat({ text }: { text: string }) {
  const words = text.split(" ");

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: 0.2 * i },
    }),
  };

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    },
    hidden: { opacity: 0, y: 5 },
  };

  return (
    <motion.div
      style={{ overflow: "hidden" }}
      variants={container}
      initial="hidden"
      animate="visible"
      className="text-2xl md:text-3xl font-medium text-slate-800 leading-snug"
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="inline-block">
          <motion.span variants={child}>
            {word}
          </motion.span>
          {index < words.length - 1 ? "\u00A0" : null}
        </span>
      ))}
    </motion.div>
  );
}
