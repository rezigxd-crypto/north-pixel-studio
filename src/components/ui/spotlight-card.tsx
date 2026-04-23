// Static card — royal blue / gold border + hover glow via pure CSS
// Zero JavaScript event listeners = zero lag on mobile
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'royal' | 'gold';
}

const GlowCard = ({ children, className = '', variant = 'royal' }: GlowCardProps) => {
  const borderColor = variant === 'gold'
    ? 'hsl(41 51% 45% / 0.40)'
    : 'hsl(207 67% 40% / 0.38)';
  const hoverBorder = variant === 'gold'
    ? 'var(--glow-gold-border)'
    : 'var(--glow-royal-border)';
  const bg = 'hsl(222 40% 7% / 0.75)';

  return (
    <div
      className={`np-glow-card rounded-[18px] overflow-hidden backdrop-blur-sm h-full flex flex-col ${variant} ${className}`}
      style={{
        background: bg,
        border: `1.5px solid ${borderColor}`,
        boxShadow: '0 8px 32px -8px rgba(0,0,0,0.6)',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
      }}
    >
      {children}
    </div>
  );
};

export { GlowCard };
