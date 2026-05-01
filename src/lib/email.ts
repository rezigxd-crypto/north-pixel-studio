/**
 * Transactional email dispatcher.
 *
 * Looks up the recipient user's email + display name from `/users/{uid}` and
 * POSTs to the Vercel serverless endpoint at `/api/send-email`, which holds
 * the Resend API key and renders the HTML body server-side.
 *
 * Fire-and-forget: any failure is silenced so the main flow (notifications,
 * Firestore writes) is never blocked.
 *
 * Six event types are wired today (see TEMPLATES in /api/send-email.ts):
 *   - offer_approved        → client
 *   - new_bid               → client
 *   - bid_accepted          → creator
 *   - advance_received      → client (and creator via the same advance_paid hook)
 *   - deliverable_submitted → client
 *   - payment_released      → creator
 *
 * Other notification types stay in-app only to avoid inbox clutter.
 */
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export type EmailEventType =
  | "offer_approved"
  | "new_bid"
  | "bid_accepted"
  | "advance_received"
  | "deliverable_submitted"
  | "payment_released";

type DispatchArgs = {
  type: EmailEventType;
  /** Firebase uid of the recipient — used to look up their email + name. */
  recipientUid: string;
  /** Optional override if the recipient is not in the /users collection yet
   *  (e.g. anonymous client offer flow where only `clientEmail` is known). */
  recipientEmail?: string;
  recipientName?: string;
  meta?: Record<string, string>;
};

const isValidEmail = (e: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const dispatchEmail = async (args: DispatchArgs): Promise<void> => {
  try {
    let to = args.recipientEmail || "";
    let name = args.recipientName || "";
    if (!to && args.recipientUid) {
      const snap = await getDoc(doc(db, "users", args.recipientUid));
      if (snap.exists()) {
        const u = snap.data() as { email?: string; name?: string };
        to = u.email || "";
        name = name || u.name || "";
      }
    }
    if (!to || !isValidEmail(to)) return;

    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: args.type,
        to,
        recipientName: name,
        meta: args.meta || {},
      }),
    });
    // Response status is logged via Vercel; we don't block on it.
  } catch (err) {
    console.warn("[email] dispatch failed", err);
  }
};
