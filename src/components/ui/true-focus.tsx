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
  blurAmount = 5,
  borderColor = 'hsl(207 75% 50%)',
  glowColor = 'hsl(207 75% 50% / 0.6)',
  animationDuration = 0.5,
  pauseBetweenAnimations = 1.2,
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
    if (currentIndex === null || currentIndex === -1) return;
    if (!wordRefs.current[currentIndex] || !containerRef.current) return;
    const parentRect = containerRef.current.getBoundingClientRect();
    const activeRect = wordRefs.current[currentIndex].getBoundingClientRect();
    setFocusRect({
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height,
    });
  }, [currentIndex]);

  const handleMouseEnter = (index: number) => {
    if (manualMode) { setLastActiveIndex(index); setCurrentIndex(index); }
  };
  const handleMouseLeave = () => {
    if (manualMode) setCurrentIndex(lastActiveIndex ?? 0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex gap-3 md:gap-4 justify-center items-center flex-wrap ${className}`}
      style={{ outline: 'none', userSelect: 'none' }}
    >
      {words.map((word, index) => {
        const isActive = index === currentIndex;
        return (
          <span
            key={index}
            ref={el => { wordRefs.current[index] = el; }}
            className="relative cursor-default"
            style={{
              filter: isActive ? 'blur(0px)' : `blur(${blurAmount}px)`,
              transition: `filter ${animationDuration}s ease`,
              outline: 'none',
              userSelect: 'none',
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            {word}
          </span>
        );
      })}

      <motion.div
        className="absolute top-0 left-0 pointer-events-none"
        animate={{
          x: focusRect.x,
          y: focusRect.y,
          width: focusRect.width,
          height: focusRect.height,
          opacity: currentIndex >= 0 ? 1 : 0,
        }}
        transition={{ duration: animationDuration }}
        style={{ '--border-color': borderColor, '--glow-color': glowColor } as React.CSSProperties}
      >
        {/* 4 corner brackets */}
        {[
          'top-[-8px] left-[-8px] border-r-0 border-b-0',
          'top-[-8px] right-[-8px] border-l-0 border-b-0',
          'bottom-[-8px] left-[-8px] border-r-0 border-t-0',
          'bottom-[-8px] right-[-8px] border-l-0 border-t-0',
        ].map((cls, i) => (
          <span
            key={i}
            className={`absolute w-3.5 h-3.5 border-2 rounded-sm ${cls}`}
            style={{
              borderColor: 'var(--border-color)',
              filter: 'drop-shadow(0 0 5px var(--glow-color))',
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

export default TrueFocus;
