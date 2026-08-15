'use client';
import { motion, AnimatePresence } from 'framer-motion';

export default function AnimatedVoteCount({ count }: { count: number }) {
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={count}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="inline-block"
      >
        {count}
      </motion.span>
    </AnimatePresence>
  );
}