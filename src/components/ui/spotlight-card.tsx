import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'royal' | 'gold';
}

const GlowCard = ({ children, className = '', variant = 'royal' }: GlowCardProps) => (
  <div
    className={`np-service-card rounded-[18px] overflow-hidden h-full flex flex-col ${variant} ${className}`}
    style={{
      background: 'hsl(222 40% 7% / 0.82)',
      border: `1.5px solid ${variant === 'gold' ? 'hsl(41 51% 45% / 0.30)' : 'hsl(207 67% 40% / 0.28)'}`,
      // zero shadow, zero blur — pure border only, no GPU compositing
    }}
  >
    {children}
  </div>
);

export { GlowCard };
