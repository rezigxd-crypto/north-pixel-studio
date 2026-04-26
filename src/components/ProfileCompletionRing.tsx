import { type ReactNode } from "react";

/**
 * Animated SVG ring that sits behind / around an avatar showing how much of
 * the creator's public profile is filled out. Royal-blue at 0–99 %, flips to
 * the brand-gold gradient + a soft glow at 100 %.
 *
 * Used in CreatorPortal (header + profile tab). Layout-neutral: it just
 * absolutely-positions the SVG over the avatar, you pass the avatar as
 * `children` and we handle the rest.
 */
export const ProfileCompletionRing = ({
  pct,
  size = 64,
  stroke = 3,
  children,
  showLabel = false,
}: {
  /** Completion percentage, 0–100. */
  pct: number;
  /** Total ring diameter in px (must match the avatar). */
  size?: number;
  /** Ring thickness in px. */
  stroke?: number;
  /** The avatar (or any element) to wrap. */
  children: ReactNode;
  /** When true, render a small "%". chip below the ring. */
  showLabel?: boolean;
}) => {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const complete = clamped >= 100;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (clamped / 100) * c;

  return (
    <div className="relative inline-block flex-shrink-0" style={{ width: size, height: size }}>
      {/* Background ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 -rotate-90 pointer-events-none"
        aria-hidden
      >
        <defs>
          <linearGradient id="np-ring-royal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(225 85% 55%)" />
            <stop offset="100%" stopColor="hsl(245 90% 65%)" />
          </linearGradient>
          <linearGradient id="np-ring-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(38 92% 50%)" />
            <stop offset="100%" stopColor="hsl(48 96% 60%)" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-border/40"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={complete ? "url(#np-ring-gold)" : "url(#np-ring-royal)"}
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)",
            filter: complete
              ? "drop-shadow(0 0 6px hsl(45 95% 55% / 0.6))"
              : "drop-shadow(0 0 3px hsl(230 85% 55% / 0.3))",
          }}
        />
      </svg>

      {/* Avatar slot — leave a tiny inset so the ring isn't covered by the
          avatar's own bg. */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ padding: stroke + 2 }}
      >
        <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
          {children}
        </div>
      </div>

      {showLabel && (
        <span
          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none border ${
            complete
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-background text-foreground border-border"
          }`}
        >
          {clamped}%
        </span>
      )}
    </div>
  );
};
