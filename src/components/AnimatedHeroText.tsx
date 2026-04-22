// Animated sliding word component for the hero section
// The last word cycles through a list of words with slide-up animation
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedHeroTextProps {
  prefix: string;       // Static text before the animated word
  words: string[];      // Words to cycle through
  className?: string;
  wordClassName?: string;
}

export const AnimatedHeroText = ({ prefix, words, className = '', wordClassName = '' }: AnimatedHeroTextProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % words.length);
    }, 2200);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className={`inline-flex flex-wrap items-end justify-center gap-x-3 gap-y-1 ${className}`}>
      <span>{prefix}</span>
      <span className="relative inline-flex overflow-hidden h-[1.1em] align-bottom">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-110%', opacity: 0 }}
            transition={{ duration: 0.42, ease: [0.33, 1, 0.68, 1] }}
            className={`inline-block ${wordClassName}`}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};
