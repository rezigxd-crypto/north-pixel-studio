import React, { useEffect, useRef, ReactNode } from 'react';

// North Pixel palette:
// Royal blue hue ≈ 207  (hsl 207 67% 35% → 207 75% 50%)
// Gold hue       ≈ 41   (hsl 41 51% 54%  → 41 67% 70%)

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'royal' | 'gold';
}

const variantMap = {
  royal: { base: 207, spread: 20 },
  gold:  { base: 41,  spread: 15 },
};

const GlowCard: React.FC<GlowCardProps> = ({
  children,
  className = '',
  variant = 'royal',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = variantMap[variant];

  const css = `
    [data-np-glow]::before,
    [data-np-glow]::after {
      pointer-events: none;
      content: "";
      position: absolute;
      inset: calc(var(--border-size) * -1);
      border: var(--border-size) solid transparent;
      border-radius: calc(var(--radius) * 1px);
      background-attachment: fixed;
      background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
      background-repeat: no-repeat;
      background-position: 50% 50%;
      mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
      mask-clip: padding-box, border-box;
      mask-composite: intersect;
    }
    [data-np-glow]::before {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
        calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
        hsl(${base} 85% 55% / 0.9),
        transparent 100%
      );
      filter: brightness(1.6);
    }
    [data-np-glow]::after {
      background-image: radial-gradient(
        calc(var(--spotlight-size) * 0.45) calc(var(--spotlight-size) * 0.45) at
        calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
        hsl(0 100% 100% / 0.22),
        transparent 100%
      );
    }
    [data-np-glow] > [data-np-glow-inner] {
      position: absolute;
      inset: 0;
      border-radius: 20px;
      pointer-events: none;
    }
  `;

  const bgSpot = variant === 'royal'
    ? `hsl(207 85% 62% / 0.13)`
    : `hsl(41 90% 65% / 0.13)`;

  const borderColor = variant === 'royal'
    ? 'hsl(207 67% 40% / 0.40)'
    : 'hsl(41 60% 50% / 0.38)';

  const backdropColor = variant === 'royal'
    ? 'hsl(222 47% 6% / 0.72)'
    : 'hsl(222 47% 6% / 0.68)';

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        ref={cardRef}
        data-np-glow
        className={`rounded-[20px] relative shadow-[0_1rem_2.5rem_-1rem_rgba(0,0,0,0.7)] backdrop-blur-md overflow-hidden ${className}`}
        style={{
          '--border-size': '1.5px',
          '--spotlight-size': '280px',
          '--radius': '20',
          backgroundImage: `radial-gradient(280px 280px at calc(var(--x,0)*1px) calc(var(--y,0)*1px), ${bgSpot}, transparent)`,
          backgroundColor: backdropColor,
          backgroundAttachment: 'fixed',
          border: `1.5px solid ${borderColor}`,
          position: 'relative',
          touchAction: 'none',
        } as React.CSSProperties}
      >
        <div data-np-glow-inner />
        {children}
      </div>
    </>
  );
};

export { GlowCard };
