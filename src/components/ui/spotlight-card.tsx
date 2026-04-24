import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'royal' | 'gold';
}

// Neutral card — no colored border, no glow. Background + border adapt to light/dark theme.
const GlowCard = ({ children, className = '', variant = 'royal' }: GlowCardProps) => {
  return (
    <div
      className={`np-glow-card rounded-[18px] overflow-hidden h-full flex flex-col ${variant} ${className}`}
    >
      {children}
    </div>
  );
};

export { GlowCard };
