import { useEffect, useState } from "react";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");

const useNow = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
};

type Props = {
  /** Target deadline as ms timestamp or YYYY-MM-DD string. */
  deadline: number | string | undefined;
  lang: "ar" | "en" | "fr";
  /** Optional label override (e.g. "Delivery" or "Deadline"). */
  label?: { ar: string; en: string; fr?: string };
  /** Compact pill style for inline use. */
  compact?: boolean;
  /** When less than this many ms remain, switch to red urgent style. */
  urgentMs?: number;
};

const defaultLabel = { ar: "الموعد النهائي", en: "Deadline", fr: "Échéance" };

export const Countdown = ({ deadline, lang, label, compact, urgentMs = 6 * 3600 * 1000 }: Props) => {
  const now = useNow();
  if (!deadline) return null;

  const target =
    typeof deadline === "number"
      ? deadline
      : new Date(`${deadline}T23:59:59`).getTime();

  if (Number.isNaN(target)) return null;

  const remaining = target - now;
  const lbl = (label || defaultLabel)[lang] || (label || defaultLabel).en;

  if (remaining <= 0) {
    return (
      <span
        className={`inline-flex items-center gap-1 ${compact ? "text-[11px]" : "text-xs"} text-destructive font-semibold`}
      >
        <AlertTriangle className="w-3.5 h-3.5" />
        {lang === "ar" ? `انقضى ${lbl}` : `${lbl} passed`}
      </span>
    );
  }

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);

  const urgent = remaining < urgentMs;
  const finishing = remaining < 60 * 60 * 1000; // < 1h
  const cls = urgent
    ? "text-destructive border-destructive/40 bg-destructive/10"
    : finishing
    ? "text-yellow-300 border-yellow-300/40 bg-yellow-300/10"
    : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";

  const Icon = urgent ? AlertTriangle : finishing ? Clock : CheckCircle2;

  const display =
    days > 0
      ? `${days}${lang === "ar" ? "ي" : "d"} ${pad(hours)}${lang === "ar" ? "س" : "h"} ${pad(minutes)}${lang === "ar" ? "د" : "m"}`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${compact ? "text-[11px]" : "text-xs"} font-semibold ${cls}`}
      title={`${lbl}: ${new Date(target).toLocaleString()}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="opacity-80 font-normal">{lbl}</span>
      <span className="font-mono">{display}</span>
    </span>
  );
};
