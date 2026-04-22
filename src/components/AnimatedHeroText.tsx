import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface AnimatedHeroTextProps {
  prefix: string;
  words: string[];
  className?: string;
  wordClassName?: string;
}

export const AnimatedHeroText = ({ prefix, words, className = '', wordClassName = '' }: AnimatedHeroTextProps) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % words.length);
    }, 1600); // faster cycle
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className={`inline-flex flex-wrap items-end justify-center gap-x-2 gap-y-1 ${className}`}>
      <span>{prefix}</span>
      <span className="relative inline-flex overflow-hidden" style={{ height: '1.2em', verticalAlign: 'bottom' }}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={index}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }} // faster slide
            className={`inline-block ${wordClassName}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
};
