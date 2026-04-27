import { useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, doc, query, where, orderBy, onSnapshot,
  serverTimestamp, getDocs, writeBatch, Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Lang } from "./i18n";

/**
 * Per-user, in-app notifications. Free-tier safe: pure Firestore reads/writes,
 * no Cloud Functions required. Each user gets a real-time `onSnapshot` feed of
 * their own `notifications` documents.
 *
 * Documents are created client-side by the actor that triggers the event
 * (e.g. when a creator places a bid, *their* client writes a `new_bid`
 * notification for the project owner). Firestore security rules pin the
 * recipientUid to the right user and block non-recipients from reading.
 */
export type NotificationType =
  | "offer_approved"            // admin → client: your project is live and accepting bids
  | "offer_rejected"            // admin → client: your project was rejected
  | "new_bid"                   // creator → client: someone bid on your project
  | "bid_accepted"              // admin → creator: your bid was accepted
  | "bid_not_selected"          // admin → creator: another creator was picked
  | "deliverable_submitted"     // creator → client: the deliverable is ready
  | "advance_paid"              // client → creator: 10 % advance confirmed
  | "bundle_request_new"        // client → admin: new bundle subscription request
  | "bundle_activated"          // admin → client: bundle subscription activated
  | "bundle_cancelled"          // admin → client: bundle subscription cancelled
  | "task_invitation_new"       // admin → creator: private task invitation
  | "task_invitation_accepted"  // creator → admin: task invitation accepted
  | "task_invitation_declined"; // creator → admin: task invitation declined

export type AppNotification = {
  id: string;
  recipientUid: string;
  type: NotificationType;
  /** Free-form context used to render the localized title (service title, creator name, …). */
  meta?: Record<string, string>;
  /** Where to navigate when the user clicks the notification. */
  link?: string;
  read: boolean;
  createdAt: number;
};

/**
 * Localized labels for each notification type. Kept here so triggers can stay
 * data-only; the bell component renders the right copy at view-time.
 */
export const NOTIFICATION_COPY: Record<
  NotificationType,
  { title: Record<Lang, string>; body?: (meta: Record<string, string>, lang: Lang) => string }
> = {
  offer_approved: {
    title: {
      ar: "تم اعتماد مشروعك ✨",
      fr: "Projet approuvé",
      en: "Project approved",
    },
    body: (m, lang) => {
      const s = m.serviceTitle ? ` (${m.serviceTitle})` : "";
      return lang === "ar"
        ? `أصبح مشروعك${s} مفتوحًا للعروض.`
        : lang === "fr"
        ? `Votre projet${s} est en ligne et reçoit des offres.`
        : `Your project${s} is live and accepting bids.`;
    },
  },
  offer_rejected: {
    title: {
      ar: "لم نتمكن من نشر مشروعك",
      fr: "Projet refusé",
      en: "Project rejected",
    },
    body: (_m, lang) =>
      lang === "ar"
        ? "تواصل مع الدعم لمزيد من التفاصيل."
        : lang === "fr"
        ? "Contactez le support pour plus de détails."
        : "Contact support for details.",
  },
  new_bid: {
    title: {
      ar: "عرض جديد على مشروعك",
      fr: "Nouvelle offre sur votre projet",
      en: "New bid on your project",
    },
    body: (m, lang) => {
      const who = m.creatorName || (lang === "ar" ? "مبدع" : "A creator");
      const s = m.serviceTitle ? ` — ${m.serviceTitle}` : "";
      return lang === "ar"
        ? `${who} قدّم عرضًا${s}.`
        : lang === "fr"
        ? `${who} a soumis une offre${s}.`
        : `${who} placed a bid${s}.`;
    },
  },
  bid_accepted: {
    title: {
      ar: "تم قبول عرضك 🎉",
      fr: "Offre acceptée",
      en: "Your bid was accepted",
    },
    body: (m, lang) => {
      const s = m.serviceTitle ? ` (${m.serviceTitle})` : "";
      return lang === "ar"
        ? `بدأ العمل على المشروع${s}.`
        : lang === "fr"
        ? `Le projet${s} démarre — bonne réalisation !`
        : `The project${s} is now yours — get to work!`;
    },
  },
  bid_not_selected: {
    title: {
      ar: "لم يُختر عرضك هذه المرة",
      fr: "Offre non retenue",
      en: "Bid not selected",
    },
    body: (m, lang) => {
      const s = m.serviceTitle ? ` (${m.serviceTitle})` : "";
      return lang === "ar"
        ? `تم اختيار مبدع آخر للمشروع${s}.`
        : lang === "fr"
        ? `Un autre créateur a été choisi pour ce projet${s}.`
        : `Another creator was picked for this project${s}.`;
    },
  },
  deliverable_submitted: {
    title: {
      ar: "تم تسليم العمل",
      fr: "Livraison reçue",
      en: "Deliverable received",
    },
    body: (m, lang) => {
      const who = m.creatorName || (lang === "ar" ? "المبدع" : "the creator");
      return lang === "ar"
        ? `سلّم ${who} المشروع — تحقّق منه.`
        : lang === "fr"
        ? `${who} a livré le projet — vérifiez-le.`
        : `${who} submitted the deliverable — review it now.`;
    },
  },
  advance_paid: {
    title: {
      ar: "تم تأكيد الدفعة المقدّمة",
      fr: "Acompte confirmé",
      en: "Advance confirmed",
    },
    body: (_m, lang) =>
      lang === "ar"
        ? "تم تأكيد دفع 10 ٪ — يمكنك بدء العمل."
        : lang === "fr"
        ? "L'acompte de 10 % est confirmé — vous pouvez démarrer."
        : "The 10 % advance is confirmed — you can start.",
  },
  bundle_request_new: {
    title: {
      ar: "طلب اشتراك جديد في باقة",
      fr: "Nouvelle demande de bundle",
      en: "New bundle subscription request",
    },
    body: (m, lang) => {
      const who = m.orgName || (lang === "ar" ? "عميل" : "A client");
      return lang === "ar"
        ? `طلب ${who} الاشتراك في باقة شهرية — راجع الطلب.`
        : lang === "fr"
        ? `${who} demande à souscrire à un bundle mensuel — à examiner.`
        : `${who} requested a monthly bundle subscription — review it.`;
    },
  },
  bundle_activated: {
    title: {
      ar: "تم تفعيل باقتك ✨",
      fr: "Votre bundle est actif",
      en: "Your bundle is active",
    },
    body: (_m, lang) =>
      lang === "ar"
        ? "بدأت الشراكة الشهرية — افتح مساحة العمل."
        : lang === "fr"
        ? "Le partenariat mensuel a démarré — ouvrez votre espace."
        : "Your monthly partnership has started — open the workspace.",
  },
  bundle_cancelled: {
    title: {
      ar: "تم إلغاء الاشتراك",
      fr: "Bundle annulé",
      en: "Bundle subscription cancelled",
    },
    body: (_m, lang) =>
      lang === "ar"
        ? "تم إلغاء اشتراكك في الباقة. تواصل مع الدعم لمزيد من التفاصيل."
        : lang === "fr"
        ? "Votre bundle a été annulé. Contactez le support pour plus de détails."
        : "Your bundle subscription was cancelled. Contact support for details.",
  },
  task_invitation_new: {
    title: {
      ar: "دعوة عمل خاصة",
      fr: "Invitation à une mission privée",
      en: "Private task invitation",
    },
    body: (m, lang) => {
      const t = m.title ? ` (${m.title})` : "";
      return lang === "ar"
        ? `الإدارة تدعوك لمهمة${t} — افتح صندوق الوارد.`
        : lang === "fr"
        ? `L'équipe vous invite à une mission${t} — voir votre boîte.`
        : `The studio invited you to a task${t} — open your inbox.`;
    },
  },
  task_invitation_accepted: {
    title: {
      ar: "تم قبول الدعوة",
      fr: "Invitation acceptée",
      en: "Task invitation accepted",
    },
    body: (m, lang) => {
      const who = m.creatorName || (lang === "ar" ? "المبدع" : "the creator");
      return lang === "ar"
        ? `${who} قبل دعوة المهمة — جهّز التفاصيل.`
        : lang === "fr"
        ? `${who} a accepté l'invitation — préparez les détails.`
        : `${who} accepted the task invitation — prep the details.`;
    },
  },
  task_invitation_declined: {
    title: {
      ar: "تم رفض الدعوة",
      fr: "Invitation refusée",
      en: "Task invitation declined",
    },
    body: (m, lang) => {
      const who = m.creatorName || (lang === "ar" ? "المبدع" : "the creator");
      return lang === "ar"
        ? `${who} رفض دعوة المهمة — يمكنك دعوة شخص آخر.`
        : lang === "fr"
        ? `${who} a décliné — vous pouvez inviter quelqu'un d'autre.`
        : `${who} declined — invite someone else.`;
    },
  },
};

/** Fire-and-forget helper. Failures are silenced — notifications never break the main flow. */
export const addNotification = async (
  n: Omit<AppNotification, "id" | "read" | "createdAt"> & { read?: boolean },
): Promise<void> => {
  if (!n.recipientUid) return;
  try {
    await addDoc(collection(db, "notifications"), {
      recipientUid: n.recipientUid,
      type: n.type,
      meta: n.meta || {},
      link: n.link || "",
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[notifications] addNotification failed", err);
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await updateDoc(doc(db, "notifications", id), { read: true });
  } catch {
    /* silent */
  }
};

export const markAllNotificationsRead = async (uid: string): Promise<void> => {
  try {
    const snap = await getDocs(
      query(
        collection(db, "notifications"),
        where("recipientUid", "==", uid),
        where("read", "==", false),
      ),
    );
    if (snap.empty) return;
    const batch = writeBatch(db);
    snap.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch {
    /* silent */
  }
};

const toMs = (v: unknown): number => {
  if (!v) return Date.now();
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return Date.now();
};

/** Live feed of notifications for the given user, newest first. */
export function useNotifications(uid: string | null | undefined): AppNotification[] {
  const [items, setItems] = useState<AppNotification[]>([]);
  useEffect(() => {
    if (!uid) {
      setItems([]);
      return;
    }
    const q = query(
      collection(db, "notifications"),
      where("recipientUid", "==", uid),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(
          snap.docs.map((d) => {
            const data = d.data() as Record<string, unknown>;
            return {
              id: d.id,
              recipientUid: String(data.recipientUid || ""),
              type: data.type as NotificationType,
              meta: (data.meta as Record<string, string>) || {},
              link: (data.link as string) || undefined,
              read: Boolean(data.read),
              createdAt: toMs(data.createdAt),
            };
          }),
        );
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.warn("[notifications] feed error", err.code, err.message);
      },
    );
    return unsub;
  }, [uid]);
  return items;
}

/** Format a unix-ms timestamp as a short relative label ("2 m", "3 h", "yesterday", "12 Apr"). */
export const relativeTime = (ms: number, lang: Lang): string => {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return lang === "ar" ? "الآن" : lang === "fr" ? "à l'instant" : "just now";
  if (min < 60) return lang === "ar" ? `قبل ${min} د` : `${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return lang === "ar" ? `قبل ${h} س` : `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return lang === "ar" ? `قبل ${d} ي` : `${d}d`;
  const date = new Date(ms);
  return date.toLocaleDateString(
    lang === "ar" ? "ar-DZ" : lang === "fr" ? "fr-FR" : "en-GB",
    { day: "numeric", month: "short" },
  );
};
