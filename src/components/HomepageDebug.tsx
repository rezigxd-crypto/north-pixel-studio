// On-screen debug panel for the homepage stats — designed for mobile users
// who can't open Chrome DevTools. Activates only when the URL includes
// `?debug=1` (e.g. https://your-site.com/?debug=1). Safe to leave in
// production: invisible by default.

import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Check, AlertTriangle } from "lucide-react";

type State = {
  publicExists: boolean | null;
  publicData: { clients?: unknown; creators?: unknown } | null;
  publicError: string | null;
  usersCount: number | null;
  usersError: string | null;
  uid: string | null;
};

export function HomepageDebug() {
  // Only render when ?debug=1 is in the URL
  const enabled = typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";

  const [state, setState] = useState<State>({
    publicExists: null,
    publicData: null,
    publicError: null,
    usersCount: null,
    usersError: null,
    uid: null,
  });
  const [open, setOpen] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Track auth state
    const unsubAuth = auth.onAuthStateChanged((u) => {
      setState((s) => ({ ...s, uid: u?.uid || null }));
    });

    // Listen to /public/stats — readable by everyone
    const unsubPub = onSnapshot(
      doc(db, "public", "stats"),
      (snap) => {
        setState((s) => ({
          ...s,
          publicExists: snap.exists(),
          publicData: snap.exists() ? (snap.data() as State["publicData"]) : null,
          publicError: null,
        }));
      },
      (err) => {
        setState((s) => ({ ...s, publicError: `${err.code}: ${err.message}` }));
      }
    );

    // Listen to /users — only works for authed users with permission
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        setState((s) => ({ ...s, usersCount: snap.size, usersError: null }));
      },
      (err) => {
        setState((s) => ({ ...s, usersError: `${err.code}: ${err.message}` }));
      }
    );

    return () => { unsubAuth(); unsubPub(); unsubUsers(); };
  }, [enabled]);

  if (!enabled || !open) return null;

  // Manual "Sync now" — re-counts /users and writes to /public/stats
  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg(null);
    try {
      const { getDocs } = await import("firebase/firestore");
      const snap = await getDocs(collection(db, "users"));
      const docs = snap.docs.map((d) => d.data() as { role?: string });
      const counts = {
        clients:  docs.filter((d) => d.role === "client").length,
        creators: docs.filter((d) => d.role === "creator").length,
      };
      await setDoc(doc(db, "public", "stats"), counts, { merge: true });
      setSyncMsg(`OK → clients=${counts.clients}, creators=${counts.creators}`);
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      setSyncMsg(`FAIL → ${e.code || ""} ${e.message || String(err)}`);
    } finally {
      setSyncing(false);
    }
  };

  const Row = ({ label, value, ok }: { label: string; value: string; ok?: boolean | null }) => (
    <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border/30 last:border-b-0">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground flex-shrink-0">{label}</span>
      <span className={`text-xs font-mono break-all text-end ${ok === false ? "text-destructive" : ok === true ? "text-emerald-400" : "text-foreground"}`}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="fixed bottom-4 inset-x-4 z-[60] max-w-md mx-auto">
      <div className="glass rounded-2xl border border-accent/40 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-gradient-to-r from-accent/15 to-primary/15 border-b border-border/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-accent" />
            <span className="text-[11px] uppercase tracking-widest font-bold text-accent">Debug · /?debug=1</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-smooth"
            aria-label="Close debug panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-1">
          <Row label="Auth UID" value={state.uid || "(visitor — not logged in)"} ok={!!state.uid} />
          <Row
            label="/public/stats"
            value={
              state.publicError
                ? state.publicError
                : state.publicExists === null
                ? "loading…"
                : state.publicExists
                ? `clients=${String(state.publicData?.clients ?? "?")}  creators=${String(state.publicData?.creators ?? "?")}`
                : "DOC DOES NOT EXIST"
            }
            ok={state.publicError ? false : state.publicExists === true}
          />
          <Row
            label="Type check"
            value={
              !state.publicData
                ? "—"
                : `clients:${typeof state.publicData.clients}  creators:${typeof state.publicData.creators}`
            }
            ok={
              state.publicData
                ? typeof state.publicData.clients === "number" &&
                  typeof state.publicData.creators === "number"
                : null
            }
          />
          <Row
            label="/users (live)"
            value={
              state.usersError
                ? state.usersError
                : state.usersCount === null
                ? "loading… (or blocked for visitors)"
                : `count = ${state.usersCount}`
            }
            ok={state.usersError ? false : state.usersCount !== null}
          />

          {syncMsg && (
            <div className={`mt-3 rounded-lg p-2.5 text-[11px] font-mono ${syncMsg.startsWith("OK") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-400/30" : "bg-destructive/10 text-destructive border border-destructive/30"}`}>
              <div className="flex items-start gap-1.5">
                {syncMsg.startsWith("OK") ? <Check className="w-3 h-3 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />}
                <span className="break-all">{syncMsg}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 mt-3">
            <Button
              size="sm"
              variant="gold"
              onClick={handleSync}
              disabled={syncing || !state.uid}
              className="w-full"
            >
              <RefreshCw className={`w-3.5 h-3.5 me-1.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing…" : "Sync /public/stats now"}
            </Button>
            {!state.uid && (
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Log in as <strong className="text-accent">admin</strong> to enable manual sync.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
