import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import {
  useNotifications, markNotificationRead, markAllNotificationsRead,
  NOTIFICATION_COPY, relativeTime,
} from "@/lib/notifications";

/**
 * Header bell with an unread badge + dropdown of recent notifications.
 * Logged-in users only. Real-time via Firestore `onSnapshot`. The dropdown
 * is purely client-side (no portal/dialog) so it's keyboard-friendly and
 * cheap to render.
 */
export const NotificationBell = () => {
  const { auth, lang } = useApp();
  const navigate = useNavigate();
  const items = useNotifications(auth.uid || null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close the dropdown on outside click.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!auth.uid || auth.loading) return null;

  const unread = items.filter((n) => !n.read).length;
  const recent = items.slice(0, 12);

  const handleClick = async (id: string, link?: string) => {
    setOpen(false);
    await markNotificationRead(id);
    if (link) navigate(link);
  };

  const labels = {
    title: lang === "ar" ? "الإشعارات" : lang === "fr" ? "Notifications" : "Notifications",
    empty: lang === "ar"
      ? "لا توجد إشعارات بعد."
      : lang === "fr"
      ? "Aucune notification pour l'instant."
      : "No notifications yet.",
    markAll: lang === "ar"
      ? "تعليم الكل كمقروء"
      : lang === "fr"
      ? "Tout marquer comme lu"
      : "Mark all as read",
  };

  return (
    <div ref={wrapRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="w-8 h-8 relative"
        onClick={() => setOpen((v) => !v)}
        aria-label={labels.title}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-accent-foreground flex items-center justify-center ring-2 ring-background"
            aria-label={`${unread} unread`}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>

      {open && (
        <div
          className="absolute end-0 mt-2 w-[320px] sm:w-[360px] glass rounded-2xl border border-border/60 shadow-xl z-50 overflow-hidden"
          role="dialog"
          aria-label={labels.title}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
            <div className="font-serif font-bold text-sm">{labels.title}</div>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAllNotificationsRead(auth.uid)}
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent/80"
              >
                <CheckCheck className="w-3 h-3" />
                {labels.markAll}
              </button>
            )}
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                {labels.empty}
              </div>
            ) : (
              <ul className="divide-y divide-border/40">
                {recent.map((n) => {
                  const copy = NOTIFICATION_COPY[n.type];
                  if (!copy) return null;
                  const title = copy.title[lang];
                  const body = copy.body ? copy.body(n.meta || {}, lang) : "";
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(n.id, n.link)}
                        className={`w-full text-start px-4 py-3 transition-smooth hover:bg-accent/5 flex gap-3 ${
                          n.read ? "opacity-70" : ""
                        }`}
                      >
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                            n.read ? "bg-muted-foreground/30" : "bg-accent"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="font-semibold text-xs truncate">{title}</div>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">
                              {relativeTime(n.createdAt, lang)}
                            </span>
                          </div>
                          {body && (
                            <div className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                              {body}
                            </div>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
