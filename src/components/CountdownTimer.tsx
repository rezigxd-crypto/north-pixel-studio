import { useEffect, useState, memo } from "react";
import { Clock3, Hourglass, Flame } from "lucide-react";

type Tone = "gold" | "royal" | "danger" | "muted";
type Size = "sm" | "md" | "lg";

interface CountdownTimerProps {
  /** Target timestamp in ms (Date.now() compatible). */
  target: number;
  lang: string;
  label?: string;
  tone?: Tone;
  size?: Size;
  /** Compact = single chip with one big duration string, no animated digits. */
  compact?: boolean;
  className?: string;
}

const TONE_MAP: Record<Tone, { ring: string; chip: string; bg: string; text: string; icon: string }> = {
  gold:   { ring: "ring-accent/30",       chip: "bg-accent/15 text-accent",       bg: "from-accent/10 via-accent/5",       text: "text-accent",       icon: "text-accent" },
  royal:  { ring: "ring-primary/30",      chip: "bg-primary/20 text-primary-foreground", bg: "from-primary/15 via-primary/5", text: "text-primary-foreground", icon: "text-primary-foreground" },
  danger: { ring: "ring-destructive/30",  chip: "bg-destructive/15 text-destructive", bg: "from-destructive/10 via-destructive/5", text: "text-destructive", icon: "text-destructive" },
  muted:  { ring: "ring-border",          chip: "bg-secondary/40 text-foreground", bg: "from-secondary/20 via-secondary/5", text: "text-foreground", icon: "text-muted-foreground" },
};

const SIZE_MAP: Record<Size, { digit: string; cell: string; sep: string; padding: string; gap: string; legend: string }> = {
  sm: { digit: "text-base font-bold", cell: "min-w-[28px] h-7 px-1.5", sep: "text-sm", padding: "p-2.5", gap: "gap-1", legend: "text-[8px]" },
  md: { digit: "text-xl font-bold", cell: "min-w-[36px] h-9 px-2",   sep: "text-base", padding: "p-3",   gap: "gap-1.5", legend: "text-[9px]" },
  lg: { digit: "font-serif text-3xl font-bold", cell: "min-w-[52px] h-12 px-2", sep: "text-2xl", padding: "p-4", gap: "gap-2", legend: "text-[10px]" },
};

function timeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days  = Math.floor(diff / (24 * 3600 * 1000));
  const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
  const mins  = Math.floor((diff % (3600 * 1000)) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);
  return { diff, days, hours, mins, secs };
}

/**
 * Single rolling digit that smoothly slides between values.
 * Pure CSS transform — no heavy animation lib, won't lag.
 */
const RollingDigit = memo(({ value, className }: { value: number; className: string }) => {
  // value is 0-9
  return (
    <span className={`relative inline-block overflow-hidden tabular-nums ${className}`} style={{ height: "1em" }}>
      <span
        className="block transition-transform duration-300 ease-out will-change-transform"
        style={{ transform: `translateY(-${value * 10}%)` }}
        aria-hidden="true"
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} className="block leading-[1em]">{i}</span>
        ))}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
});
RollingDigit.displayName = "RollingDigit";

const Pair = ({ value, size }: { value: number; size: Size }) => {
  const [tens, ones] = [Math.floor(value / 10), value % 10];
  const styles = SIZE_MAP[size];
  return (
    <div className={`flex items-center justify-center rounded-lg bg-background/60 border border-border/50 ${styles.cell}`}>
      <span className={`flex items-center ${styles.digit}`}>
        <RollingDigit value={tens} className="" />
        <RollingDigit value={ones} className="" />
      </span>
    </div>
  );
};

export const CountdownTimer = memo(function CountdownTimer({
  target,
  lang,
  label,
  tone = "gold",
  size = "md",
  compact = false,
  className = "",
}: CountdownTimerProps) {
  const [tick, setTick] = useState(() => timeLeft(target));

  useEffect(() => {
    setTick(timeLeft(target));
    const id = setInterval(() => setTick(timeLeft(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const isOver = tick.diff <= 0;
  // Switch to danger tone when under 1 hour to draw attention.
  const effectiveTone: Tone = isOver ? "muted" : (tick.diff < 3600 * 1000 && tone !== "muted" ? "danger" : tone);
  const colors = TONE_MAP[effectiveTone];
  const sizes = SIZE_MAP[size];

  // Compact mode — used in tight spaces (e.g. project rows)
  if (compact) {
    const text = isOver
      ? (lang === "ar" ? "انتهى" : "Ended")
      : tick.days > 0
        ? `${tick.days}${lang === "ar" ? "ي " : "d "}${tick.hours}${lang === "ar" ? "س" : "h"}`
        : tick.hours > 0
          ? `${tick.hours}${lang === "ar" ? "س " : "h "}${String(tick.mins).padStart(2, "0")}${lang === "ar" ? "د" : "m"}`
          : `${String(tick.mins).padStart(2, "0")}:${String(tick.secs).padStart(2, "0")}`;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${colors.chip} ${className}`}>
        {effectiveTone === "danger" ? <Flame className="w-3 h-3 animate-pulse-soft" /> : <Clock3 className="w-3 h-3" />}
        <span dir="ltr" className="tabular-nums">{text}</span>
      </span>
    );
  }

  // Full mode
  return (
    <div
      className={`rounded-2xl border border-border/40 bg-gradient-to-br ${colors.bg} to-transparent ${sizes.padding} ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold ${colors.text}`}>
          {effectiveTone === "danger"
            ? <Flame className="w-3 h-3 animate-pulse-soft" />
            : <Hourglass className={`w-3 h-3 ${isOver ? "" : "animate-pulse-soft"}`} />}
          {label || (lang === "ar" ? "الوقت المتبقي" : "Time remaining")}
        </div>
      </div>

      {isOver ? (
        <div className={`flex items-center gap-2 ${colors.text} font-semibold text-sm`}>
          <Clock3 className="w-4 h-4" />
          {lang === "ar" ? "انتهى الوقت" : "Time ended"}
        </div>
      ) : (
        <div className={`flex items-center justify-center ${sizes.gap}`} dir="ltr">
          {tick.days > 0 && (
            <>
              <div className="flex flex-col items-center gap-0.5">
                <Pair value={tick.days} size={size} />
                <span className={`${sizes.legend} uppercase tracking-widest text-muted-foreground font-semibold`}>
                  {lang === "ar" ? "يوم" : "DAY"}
                </span>
              </div>
              <span className={`${sizes.sep} ${colors.text} font-bold opacity-50 -mt-3`}>:</span>
            </>
          )}
          <div className="flex flex-col items-center gap-0.5">
            <Pair value={tick.hours} size={size} />
            <span className={`${sizes.legend} uppercase tracking-widest text-muted-foreground font-semibold`}>
              {lang === "ar" ? "س" : "HRS"}
            </span>
          </div>
          <span className={`${sizes.sep} ${colors.text} font-bold opacity-50 -mt-3`}>:</span>
          <div className="flex flex-col items-center gap-0.5">
            <Pair value={tick.mins} size={size} />
            <span className={`${sizes.legend} uppercase tracking-widest text-muted-foreground font-semibold`}>
              {lang === "ar" ? "د" : "MIN"}
            </span>
          </div>
          <span className={`${sizes.sep} ${colors.text} font-bold opacity-50 -mt-3`}>:</span>
          <div className="flex flex-col items-center gap-0.5">
            <Pair value={tick.secs} size={size} />
            <span className={`${sizes.legend} uppercase tracking-widest text-muted-foreground font-semibold`}>
              {lang === "ar" ? "ث" : "SEC"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});
