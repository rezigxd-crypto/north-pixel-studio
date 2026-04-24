import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'royal' | 'gold';
}

const GlowCard = ({ children, className = '', variant = 'royal' }: GlowCardProps) => {
  const borderColor = variant === 'gold'
    ? 'hsl(41 51% 45% / 0.35)'
    : 'hsl(207 67% 40% / 0.32)';

  return (
    <div
      className={`np-glow-card rounded-[18px] overflow-hidden h-full flex flex-col ${variant} ${className}`}
      style={{
        background: 'hsl(222 40% 7% / 0.80)',
        border: `1.5px solid ${borderColor}`,
        // NO boxShadow, NO backdrop-blur — both cause GPU compositing lag on mobile
      }}
    >
      {children}
    </div>
  );
};

export { GlowCard };
