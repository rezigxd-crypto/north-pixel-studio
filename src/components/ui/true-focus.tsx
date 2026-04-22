import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';

interface TrueFocusProps {
  sentence?: string;
  separator?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  className?: string;
}

const TrueFocus = ({
  sentence = 'True Focus',
  separator = ' ',
  manualMode = false,
  blurAmount = 4,
  borderColor = 'hsl(41 67% 60%)',
  glowColor = 'hsl(41 67% 60% / 0.55)',
  animationDuration = 0.25,       // faster
  pauseBetweenAnimations = 0.8,   // shorter pause
  className = '',
}: TrueFocusProps) => {
  const words = sentence.split(separator);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastActiveIndex, setLastActiveIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [focusRect, setFocusRect] = useState({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    if (!manualMode) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % words.length);
      }, (animationDuration + pauseBetweenAnimations) * 1000);
      return () => clearInterval(interval);
    }
  }, [manualMode, animationDuration, pauseBetweenAnimations, words.length]);

  useEffect(() => {
    if (currentIndex === null) return;
    const el = wordRefs.current[currentIndex];
    const container = containerRef.current;
    if (!el || !container) return;
    const parentRect = container.getBoundingClientRect();
    const activeRect = el.getBoundingClientRect();
    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-3 md:gap-4 justify-center items-center flex-wrap ${className}`}
      style={{ userSelect: 'none' }}
    >
      {words.map((word, index) => (
        <span
          key={index}
          ref={el => { wordRefs.current[index] = el; }}
          style={{
            filter: index === currentIndex ? 'blur(0px)' : `blur(${blurAmount}px)`,
            transition: `filter ${animationDuration}s ease`,
            userSelect: 'none',
          }}
          onMouseEnter={() => manualMode && (setLastActiveIndex(index), setCurrentIndex(index))}
          onMouseLeave={() => manualMode && setCurrentIndex(lastActiveIndex ?? 0)}
        >
          {word}
        </span>
      ))}

      <motion.div
        className="absolute top-0 left-0 pointer-events-none"
        animate={{ x: focusRect.x, y: focusRect.y, width: focusRect.width, height: focusRect.height, opacity: 1 }}
        transition={{ duration: animationDuration, ease: 'easeOut' }}
        style={{ '--border-color': borderColor, '--glow-color': glowColor } as React.CSSProperties}
      >
        {[
          'top-[-7px] left-[-7px] border-r-0 border-b-0',
          'top-[-7px] right-[-7px] border-l-0 border-b-0',
          'bottom-[-7px] left-[-7px] border-r-0 border-t-0',
          'bottom-[-7px] right-[-7px] border-l-0 border-t-0',
        ].map((cls, i) => (
          <span key={i} className={`absolute w-3 h-3 border-2 rounded-sm ${cls}`}
            style={{ borderColor: 'var(--border-color)', filter: 'drop-shadow(0 0 4px var(--glow-color))' }} />
        ))}
      </motion.div>
    </div>
  );
};

export default TrueFocus;
