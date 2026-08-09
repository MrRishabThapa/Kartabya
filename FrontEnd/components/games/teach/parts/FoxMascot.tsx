'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function FoxMascot({ cheering = false }: { cheering?: boolean }) {
  return <motion.div className="relative h-32 w-32 sm:h-40 sm:w-40" animate={cheering ? { y: [0, -8, 0], rotate: [0, -3, 3, 0] } : { y: [0, -3, 0] }} transition={{ duration: cheering ? 0.7 : 3, repeat: cheering ? 2 : Infinity, ease: 'easeInOut' }}><Image src="/assets/fox-mascot.png" alt="Your fox companion" fill className="object-contain" priority /></motion.div>;
}
