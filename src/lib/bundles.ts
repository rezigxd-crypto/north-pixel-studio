/**
 * Bundle subscription + deliverable + task-invitation data layer.
 *
 * Architecture (different from the public OFFERS marketplace):
 *
 *   1. A B2B/B2G client requests a bundle tier  ── /bundleSubscriptions/{id}
 *      (status: pending → active → paused/cancelled)
 *
 *   2. Once active, the admin (rezigxd) creates monthly deliverables under
 *      that subscription                          ── /bundleSubscriptions/{id}/deliverables/{id}
 *      (status: planned → in-progress → delivered)
 *
 *   3. If admin's in-house team is short-handed, admin sends a private task
 *      invitation to a freelancer on the platform ── /taskInvitations/{id}
 *      (status: pending → accepted/declined → completed)
 *
 * All three lifecycles emit notifications via lib/notifications.ts.
 */
import { useEffect, useState } from "react";
import {
  collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy,
  onSnapshot, serverTimestamp, Timestamp, collectionGroup,
} from "firebase/firestore";
import { db } from "./firebase";
import { addNotification } from "./notifications";

// ─── Types ────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "pending" | "active" | "paused" | "cancelled";

export type BundleSubscription = {
  id: string;
  /** UID of the requesting client. May be empty if request was made before login (we now require auth). */
  clientUid: string;
  clientEmail: string;
  /** Display name used at request time (org name preferred, else contact name). */
  orgName: string;
  contactName: string;
  contactPhone: string;
  wilaya: string;
  /** Slug of the parent bundle (matches `Bundle.slug` in offers.ts). */
  bundleSlug: string;
  /** Tier id within the bundle (e.g. "essential" / "campus" / "flagship"). */
  tierId: string;
  /** Cached at request-time so historic price changes don't rewrite the contract. */
  monthlyPrice: number;
  status: SubscriptionStatus;
  kickoffDate?: string;
  notes?: string;
  /** Admin notes attached during review (visible to admin only). */
  adminNotes?: string;
  /** Admin UID that activated the subscription, for audit. */
  approvedBy?: string;
  createdAt: number;
  updatedAt: number;
};

export type DeliverableStatus = "planned" | "in-progress" | "delivered" | "blocked";

export type BundleDeliverable = {
  id: string;
  subscriptionId: string;
  title: string;
  description?: string;
  /** Calendar month label, e.g. "October 2026" — keeps the workspace organised by month. */
  monthLabel?: string;
  dueDate?: string;
  status: DeliverableStatus;
  assignedToUid?: string;
  assignedToName?: string;
  completedAt?: number;
  /** UID of admin who created the deliverable. */
  createdBy: string;
  createdAt: number;
  updatedAt: number;
};

export type TaskInvitationStatus = "pending" | "accepted" | "declined" | "completed";

export type TaskInvitation = {
  id: string;
  subscriptionId: string;
  /** Optional pointer to the specific deliverable this task fulfils. */
  deliverableId?: string;
  /** UID of the admin who sent the invitation. */
  fromAdminUid: string;
  /** UID of the creator who's being invited. */
  toCreatorUid: string;
  /** Cached at send-time for fast list rendering. */
  toCreatorName: string;
  toCreatorEmail: string;
  /** Bundle / deliverable context shown to the freelancer. */
  bundleTitle: string;
  title: string;
  description: string;
  /** One-time fee admin will pay creator if they accept (DA). */
  fee: number;
  status: TaskInvitationStatus;
  /** Optional creator note when accepting / declining. */
  responseNote?: string;
  createdAt: number;
  updatedAt: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────

const toMs = (v: unknown): number => {
  if (!v) return Date.now();
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return Date.now();
};

// ─── Subscriptions ────────────────────────────────────────────────────────

/**
 * Read the admin UID from the public config doc that the admin self-publishes
 * on login (see `src/lib/context.tsx`). Used to route the new-bundle-request
 * notification to the admin without needing admin-sdk access on the client.
 * Returns "" if the doc isn't there yet (admin has never signed in on this
 * project) — in that case the notification is silently skipped.
 */
export const getAdminUid = async (): Promise<string> => {
  try {
    const snap = await getDoc(doc(db, "publicConfig", "admin"));
    if (!snap.exists()) return "";
    const data = snap.data() as { uid?: string };
    return data.uid || "";
  } catch {
    return "";
  }
};

/** Create a new bundle subscription request. Triggers an admin notification. */
export const requestBundleSubscription = async (
  data: Omit<
    BundleSubscription,
    "id" | "status" | "createdAt" | "updatedAt" | "approvedBy" | "adminNotes"
  >,
  /**
   * UID of the admin to notify. Defaults to looking it up from
   * /publicConfig/admin (set by the admin on login). Pass an empty string
   * to explicitly skip the notification (e.g. tests).
   */
  adminUidToNotify?: string,
): Promise<string> => {
  const ref = await addDoc(collection(db, "bundleSubscriptions"), {
    ...data,
    status: "pending" as SubscriptionStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  // Resolve the admin UID lazily if the caller didn't pass one. Treat
  // `undefined` as "look it up", and an explicit empty string as "skip".
  const recipientUid =
    adminUidToNotify === undefined ? await getAdminUid() : adminUidToNotify;
  if (recipientUid) {
    await addNotification({
      recipientUid,
      type: "bundle_request_new",
      meta: {
        orgName: data.orgName,
        bundleSlug: data.bundleSlug,
        tierId: data.tierId,
        subscriptionId: ref.id,
      },
      link: "/portal/admin?tab=bundles",
    });
  }
  return ref.id;
};

/** Update subscription status. Notifies the client when activated/cancelled. */
export const updateSubscriptionStatus = async (
  id: string,
  status: SubscriptionStatus,
  approvedBy?: string,
): Promise<void> => {
  await updateDoc(doc(db, "bundleSubscriptions", id), {
    status,
    approvedBy: approvedBy || "",
    updatedAt: serverTimestamp(),
  });
  // Notify client.
  try {
    const snap = await getDoc(doc(db, "bundleSubscriptions", id));
    if (!snap.exists()) return;
    const sub = snap.data() as BundleSubscription;
    if (!sub.clientUid) return;
    if (status === "active") {
      await addNotification({
        recipientUid: sub.clientUid,
        type: "bundle_activated",
        meta: { orgName: sub.orgName || "", subscriptionId: id, bundleSlug: sub.bundleSlug },
        link: "/portal/client?tab=bundles",
      });
    } else if (status === "cancelled") {
      await addNotification({
        recipientUid: sub.clientUid,
        type: "bundle_cancelled",
        meta: { orgName: sub.orgName || "", subscriptionId: id, bundleSlug: sub.bundleSlug },
        link: "/portal/client?tab=bundles",
      });
    }
  } catch {
    /* silent */
  }
};

/** Update lightweight admin-only metadata on a subscription. */
export const updateSubscriptionAdminNotes = async (id: string, adminNotes: string): Promise<void> => {
  await updateDoc(doc(db, "bundleSubscriptions", id), {
    adminNotes,
    updatedAt: serverTimestamp(),
  });
};

/** Live feed of all subscriptions (admin view). */
export function useAllSubscriptions(): BundleSubscription[] {
  const [data, setData] = useState<BundleSubscription[]>([]);
  useEffect(() => {
    const q = query(collection(db, "bundleSubscriptions"), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setData(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...(d.data() as Omit<BundleSubscription, "id" | "createdAt" | "updatedAt">),
                createdAt: toMs(d.data().createdAt),
                updatedAt: toMs(d.data().updatedAt),
              }) as BundleSubscription,
          ),
        );
      },
      () => {
        /* silent — anon visitors don't have read access */
      },
    );
  }, []);
  return data;
}

/** Live feed of subscriptions belonging to a specific client. */
export function useClientSubscriptions(clientUid: string | null | undefined): BundleSubscription[] {
  const [data, setData] = useState<BundleSubscription[]>([]);
  useEffect(() => {
    if (!clientUid) {
      setData([]);
      return;
    }
    const q = query(
      collection(db, "bundleSubscriptions"),
      where("clientUid", "==", clientUid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setData(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...(d.data() as Omit<BundleSubscription, "id" | "createdAt" | "updatedAt">),
                createdAt: toMs(d.data().createdAt),
                updatedAt: toMs(d.data().updatedAt),
              }) as BundleSubscription,
          ),
        );
      },
      () => {
        /* silent */
      },
    );
  }, [clientUid]);
  return data;
}

// ─── Deliverables ─────────────────────────────────────────────────────────

const deliverablesCol = (subscriptionId: string) =>
  collection(db, "bundleSubscriptions", subscriptionId, "deliverables");

/** Add a new deliverable under a subscription. */
export const addDeliverable = async (
  subscriptionId: string,
  data: Omit<
    BundleDeliverable,
    "id" | "subscriptionId" | "createdAt" | "updatedAt" | "status"
  > & { status?: DeliverableStatus },
): Promise<string> => {
  const ref = await addDoc(deliverablesCol(subscriptionId), {
    ...data,
    status: data.status || ("planned" as DeliverableStatus),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

/** Update arbitrary fields on a deliverable. */
export const updateDeliverable = async (
  subscriptionId: string,
  deliverableId: string,
  data: Partial<Omit<BundleDeliverable, "id" | "subscriptionId" | "createdAt">>,
): Promise<void> => {
  await updateDoc(doc(db, "bundleSubscriptions", subscriptionId, "deliverables", deliverableId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
  // Bundle milestone notification: when admin marks a deliverable as
  // "delivered", count completed deliverables and ping the client at
  // the 3rd / 5th / 10th milestone (idempotent via `lastMilestoneNotified`
  // on the parent subscription).
  if (data.status !== "delivered") return;
  try {
    const subRef = doc(db, "bundleSubscriptions", subscriptionId);
    const subSnap = await getDoc(subRef);
    if (!subSnap.exists()) return;
    const sub = subSnap.data() as BundleSubscription & { lastMilestoneNotified?: number };
    const allSnap = await getDocs(deliverablesCol(subscriptionId));
    const delivered = allSnap.docs.filter(
      (d) => (d.data() as { status?: string }).status === "delivered",
    ).length;
    const milestones = [3, 5, 10, 25, 50, 100];
    if (!milestones.includes(delivered)) return;
    if (sub.lastMilestoneNotified === delivered) return;
    if (sub.clientUid) {
      await addNotification({
        recipientUid: sub.clientUid,
        type: "bundle_milestone",
        meta: {
          count: String(delivered),
          orgName: sub.orgName || "",
          subscriptionId,
        },
        link: "/portal/client",
      });
    }
    await updateDoc(subRef, { lastMilestoneNotified: delivered });
  } catch { /* silent */ }
};

/** Live feed of deliverables for a single subscription. */
export function useDeliverables(subscriptionId: string | null | undefined): BundleDeliverable[] {
  const [data, setData] = useState<BundleDeliverable[]>([]);
  useEffect(() => {
    if (!subscriptionId) {
      setData([]);
      return;
    }
    const q = query(deliverablesCol(subscriptionId), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        setData(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                subscriptionId,
                ...(d.data() as Omit<
                  BundleDeliverable,
                  "id" | "subscriptionId" | "createdAt" | "updatedAt"
                >),
                createdAt: toMs(d.data().createdAt),
                updatedAt: toMs(d.data().updatedAt),
              }) as BundleDeliverable,
          ),
        );
      },
      () => {
        /* silent */
      },
    );
  }, [subscriptionId]);
  return data;
}

// ─── Task invitations ─────────────────────────────────────────────────────

/** Send a private task invitation to a creator. Notifies the recipient. */
export const sendTaskInvitation = async (
  data: Omit<TaskInvitation, "id" | "status" | "createdAt" | "updatedAt" | "responseNote">,
): Promise<string> => {
  const ref = await addDoc(collection(db, "taskInvitations"), {
    ...data,
    status: "pending" as TaskInvitationStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await addNotification({
    recipientUid: data.toCreatorUid,
    type: "task_invitation_new",
    meta: {
      bundleTitle: data.bundleTitle || "",
      title: data.title || "",
      fee: String(data.fee || 0),
      invitationId: ref.id,
    },
    link: "/portal/creator?tab=invitations",
  });
  return ref.id;
};

/** Accept or decline an invitation (creator-side). Notifies the admin sender. */
export const respondToInvitation = async (
  invitationId: string,
  status: "accepted" | "declined",
  responseNote?: string,
): Promise<void> => {
  await updateDoc(doc(db, "taskInvitations", invitationId), {
    status,
    responseNote: responseNote || "",
    updatedAt: serverTimestamp(),
  });
  try {
    const snap = await getDoc(doc(db, "taskInvitations", invitationId));
    if (!snap.exists()) return;
    const inv = snap.data() as TaskInvitation;
    if (!inv.fromAdminUid) return;
    await addNotification({
      recipientUid: inv.fromAdminUid,
      type: status === "accepted" ? "task_invitation_accepted" : "task_invitation_declined",
      meta: {
        creatorName: inv.toCreatorName || "",
        title: inv.title || "",
        invitationId,
      },
      link: "/portal/admin?tab=bundles",
    });
  } catch {
    /* silent */
  }
};

/** Mark an accepted invitation as completed (admin-side, after work is done). */
export const completeInvitation = async (invitationId: string): Promise<void> => {
  await updateDoc(doc(db, "taskInvitations", invitationId), {
    status: "completed" as TaskInvitationStatus,
    updatedAt: serverTimestamp(),
  });
};

/** Live feed of invitations sent to a creator. */
export function useCreatorInvitations(creatorUid: string | null | undefined): TaskInvitation[] {
  const [data, setData] = useState<TaskInvitation[]>([]);
  useEffect(() => {
    if (!creatorUid) {
      setData([]);
      return;
    }
    const q = query(
      collection(db, "taskInvitations"),
      where("toCreatorUid", "==", creatorUid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setData(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...(d.data() as Omit<TaskInvitation, "id" | "createdAt" | "updatedAt">),
                createdAt: toMs(d.data().createdAt),
                updatedAt: toMs(d.data().updatedAt),
              }) as TaskInvitation,
          ),
        );
      },
      () => {
        /* silent */
      },
    );
  }, [creatorUid]);
  return data;
}

/** Live feed of invitations sent BY an admin (used in the admin workspace). */
export function useAdminInvitations(adminUid: string | null | undefined): TaskInvitation[] {
  const [data, setData] = useState<TaskInvitation[]>([]);
  useEffect(() => {
    if (!adminUid) {
      setData([]);
      return;
    }
    const q = query(
      collection(db, "taskInvitations"),
      where("fromAdminUid", "==", adminUid),
      orderBy("createdAt", "desc"),
    );
    return onSnapshot(
      q,
      (snap) => {
        setData(
          snap.docs.map(
            (d) =>
              ({
                id: d.id,
                ...(d.data() as Omit<TaskInvitation, "id" | "createdAt" | "updatedAt">),
                createdAt: toMs(d.data().createdAt),
                updatedAt: toMs(d.data().updatedAt),
              }) as TaskInvitation,
          ),
        );
      },
      () => {
        /* silent */
      },
    );
  }, [adminUid]);
  return data;
}

// Re-export the collectionGroup helper so callers can build cross-subscription
// queries without importing from firebase/firestore directly.
export { collectionGroup };
