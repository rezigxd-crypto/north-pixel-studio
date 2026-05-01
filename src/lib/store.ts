import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp, where, getDoc, getDocs, setDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { generateUniqueUsername } from "./username";
import { addNotification } from "./notifications";
import { dispatchEmail } from "./email";
import { getAdminUid } from "./bundles";

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: "client" | "creator" | "admin";
  wilaya?: string;
  phone?: string;
  avatar?: string;
  bariMobAccount?: string;
  completedJobs?: number;
  roles?: string[];   // multiple roles for creators
  profilePic?: string;
  /** Public URL slug for creator profile pages (`/@username`). */
  username?: string;
  createdAt: string;
};

export type CreatorApplication = {
  id: string;
  fullName: string;
  email: string;
  country: string;
  wilaya?: string;
  city?: string;
  role: string;
  bio: string;
  rate: number;
  portfolio: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  uid?: string;
  /** Mirrors the `username` on the creator's user document. Optional because
   *  legacy applications written before the public-profile feature don't have it. */
  username?: string;
};

export type Bid = {
  id: string;
  offerId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  amount: number;
  deliverableLink?: string;
  status: "pending" | "accepted" | "rejected" | "delivered";
  /** ms timestamp when admin / client accepted the bid (used for 24h delivery countdown). */
  acceptedAt?: number;
  /** ms timestamp when creator must deliver by (acceptedAt + 24h by default). */
  deliveryDeadline?: number;
  /** ms timestamp when client approved the deliverable. Drives payout + rating reminder. */
  deliveryAcceptedAt?: number;
  /** ms timestamp when client requested revisions (overrides any prior accept). */
  revisionRequestedAt?: number;
  /** Free-form note the client left when requesting revisions. */
  revisionNote?: string;
  /** ms timestamp when admin marked the BaridiMob payout as released. */
  paymentReleasedAt?: number;
  /** ms timestamp when the deadline-approaching notification fired (idempotency). */
  deadlineNotifiedAt?: number;
  /** ms timestamp when the rating-reminder notification fired (idempotency). */
  ratingPromptedAt?: number;
  /** Cached client phone, copied at acceptBid so the creator sees it
   *  on their own bid card without needing a separate user-doc read. */
  clientPhone?: string;
  /** Cached client name + email mirrored at acceptBid. */
  clientName?: string;
  clientEmail?: string;
  createdAt: number;
};

export type ClientOffer = {
  id: string;
  /** UID of the client who posted the project. Optional because legacy offers
   *  written before notifications shipped don't have it. */
  clientUid?: string;
  clientName: string;
  clientEmail: string;
  clientWilaya?: string;
  /** Detailed shoot/meeting address inside the wilaya (street, neighborhood). */
  shootAddress?: string;
  /** Preferred shoot date (YYYY-MM-DD). Different from final deadline. */
  preferredShootDate?: string;
  /** Phone number the creator can use to coordinate. */
  clientPhone?: string;
  /** Number of final deliverables (e.g. number of edited videos). */
  deliverableCount?: number;
  /** Usage rights: personal | commercial | broadcast. */
  usageRights?: "personal" | "commercial" | "broadcast";
  /** Preferred voice gender for voice-over / dubbing offers. */
  voiceGender?: "male" | "female" | "any";
  /** Cloudinary URL for an attached script PDF (voice-over briefs). */
  scriptUrl?: string;
  /** Original filename of the script for display. */
  scriptName?: string;
  /** Optional video meeting URL (Google Meet / Zoom) for kickoff call. */
  meetingUrl?: string;
  /** Scheduled meeting time (ISO string). */
  meetingAt?: string;
  serviceSlug: string;
  serviceTitle: string;
  units: number;
  unitLabel: string;
  totalPrice: number;
  adminCut: number;
  creatorPayout: number;
  bidMin: number;
  bidMax: number;
  brief: string;
  referenceLink?: string;
  deadline?: string;
  matchingRoles: string[];
  wilayaFilter?: string;
  advancePaid?: boolean;
  advanceAmount?: number;
  status: "pending_admin" | "open" | "assigned" | "delivered" | "rejected";
  acceptedBidId?: string;
  /** ms timestamp when the offer-expired notification fired (idempotency). */
  expiredNotifiedAt?: number;
  /** Precise pin lat/lng inside the wilaya (drag-and-drop on the wizard map). */
  locationLat?: number;
  locationLng?: number;
  /** ms epoch — when bidding auto-closes. Stamped at admin approval
   *  (createdAt of "open" status + 3h). The portal-mount sweeper picks
   *  the lowest bid and auto-accepts it after this timestamp. */
  autoCloseAt?: number;
  /** Set true once the auto-close sweeper has run on this offer. Idempotent. */
  autoClosed?: boolean;
  /** Cached creator phone + BaridiMob, copied here at acceptBid so the
   *  client can contact them directly without an extra Firestore read. */
  acceptedCreatorPhone?: string;
  acceptedCreatorBariMob?: string;
  /** Cached creator name, mirrored for convenience in the client portal. */
  acceptedCreatorName?: string;
  createdAt: number;
};

const toTs = (v: any): number => {
  if (!v) return Date.now();
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return Date.now();
};

// ─── User profile ──────────────────────────────────────────────────────────
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, "users", uid), data as any);
};
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } as UserProfile : null;
};

// ─── Usernames ────────────────────────────────────────────────────────────
/** Fetch the set of usernames currently in use, for collision-free generation. */
export const fetchTakenUsernames = async (): Promise<Set<string>> => {
  const taken = new Set<string>();
  try {
    const snap = await getDocs(collection(db, "users"));
    snap.forEach((d) => {
      const u = (d.data() as UserDoc).username;
      if (u) taken.add(u.toLowerCase());
    });
  } catch {
    /* permission denied for anon — caller will retry post-auth */
  }
  return taken;
};

/**
 * Generate a unique username for a freshly-signed-up creator and write it on
 * the user document. Returns the username so the caller can also persist it
 * onto the matching creator-application doc.
 */
export const provisionUsernameForCreator = async (
  uid: string,
  fullName: string,
): Promise<string> => {
  const taken = await fetchTakenUsernames();
  const username = generateUniqueUsername(fullName, taken);
  await updateUserProfile(uid, { username });
  return username;
};

/** Look up a creator's full user doc by their public username. */
export const getUserByUsername = async (username: string): Promise<UserDoc | null> => {
  if (!username) return null;
  try {
    const snap = await getDocs(
      query(collection(db, "users"), where("username", "==", username.toLowerCase()))
    );
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { uid: d.id, ...d.data() } as UserDoc;
  } catch {
    return null;
  }
};

// ─── Client tags (admin-only B2B / B2G classification) ───────────────────
// Stored under /clientTags/{uid}. Read + write are gated to the admin email
// in firestore.rules — clients themselves never see these tags.
export type ClientTagType = "b2b" | "b2g";

export type ClientTag = {
  uid: string;
  tag: ClientTagType;
  updatedAt: number;
};

/** Set or clear a client's admin tag. Pass `null` to remove the tag. */
export const setClientTag = async (uid: string, tag: ClientTagType | null) => {
  const ref = doc(db, "clientTags", uid);
  if (tag === null) {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(ref);
    return;
  }
  await setDoc(ref, { tag, updatedAt: Date.now() }, { merge: true });
};

/** Live map of clientUid → tag, used by the admin dashboard. */
export function useClientTags(): Record<string, ClientTagType> {
  const [data, setData] = useState<Record<string, ClientTagType>>({});
  useEffect(() => {
    return onSnapshot(
      collection(db, "clientTags"),
      (snap) => {
        const next: Record<string, ClientTagType> = {};
        snap.forEach((d) => {
          const t = (d.data() as { tag?: ClientTagType }).tag;
          if (t === "b2b" || t === "b2g") next[d.id] = t;
        });
        setData(next);
      },
      () => { /* silent — non-admin readers are denied by rules */ }
    );
  }, []);
  return data;
}

// ─── Creators ─────────────────────────────────────────────────────────────
export const addCreator = async (c: Omit<CreatorApplication, "id" | "status" | "createdAt">) => {
  const ref = await addDoc(collection(db, "creators"), { ...c, status: "pending", createdAt: serverTimestamp() });
  // Notify the admin that a new creator is awaiting application review.
  try {
    const adminUid = await getAdminUid();
    if (adminUid) {
      await addNotification({
        recipientUid: adminUid,
        type: "new_creator_signup",
        meta: { creatorName: c.fullName || "", role: c.role || "", wilaya: c.wilaya || "" },
        link: "/portal/admin",
      });
    }
  } catch { /* silent */ }
  return ref.id;
};
export const setCreatorStatus = async (id: string, status: CreatorApplication["status"]) => {
  await updateDoc(doc(db, "creators", id), { status });
};

// ─── Offers ───────────────────────────────────────────────────────────────
export const addOffer = async (o: Omit<ClientOffer, "id" | "status" | "createdAt" | "bidMin" | "bidMax">) => {
  const bidMin = Math.round(o.creatorPayout * 0.83);
  const bidMax = o.creatorPayout;
  const ref = await addDoc(collection(db, "offers"), { ...o, bidMin, bidMax, status: "pending_admin", createdAt: serverTimestamp() });
  return ref.id;
};
/** 3 h auto-close window: bidding closes this long after admin approval. */
export const AUTO_CLOSE_WINDOW_MS = 3 * 60 * 60 * 1000;

export const setOfferStatus = async (id: string, status: ClientOffer["status"]) => {
  // Stamp the auto-close timer when the offer goes live so creators have a
  // hard deadline to bid against. The portal-mount sweeper picks the lowest
  // bid after this timestamp and auto-accepts it.
  const update: Record<string, unknown> = { status };
  if (status === "open") update.autoCloseAt = Date.now() + AUTO_CLOSE_WINDOW_MS;
  await updateDoc(doc(db, "offers", id), update);
  // Notify the client when admin approves or rejects their project.
  if (status === "open" || status === "rejected") {
    try {
      const snap = await getDoc(doc(db, "offers", id));
      if (snap.exists()) {
        const o = snap.data() as ClientOffer;
        if (o.clientUid) {
          await addNotification({
            recipientUid: o.clientUid,
            type: status === "open" ? "offer_approved" : "offer_rejected",
            meta: { serviceTitle: o.serviceTitle || "", offerId: id },
            link: "/portal/client",
          });
          // Email — only for the approval, skip the rejection (admins follow up manually).
          if (status === "open") {
            void dispatchEmail({
              type: "offer_approved",
              recipientUid: o.clientUid,
              meta: { serviceTitle: o.serviceTitle || "" },
            });
          }
        }
      }
    } catch { /* silent — notifications never block the main flow */ }
  }
};
export const markAdvancePaid = async (id: string, amount: number) => {
  await updateDoc(doc(db, "offers", id), { advancePaid: true, advanceAmount: amount });
  // Notify the assigned creator (advance_paid + contract_ready) AND the
  // client (advance_received + contract_ready) that the advance is confirmed.
  try {
    const offSnap = await getDoc(doc(db, "offers", id));
    if (!offSnap.exists()) return;
    const o = offSnap.data() as ClientOffer;
    const serviceTitle = o.serviceTitle || "";
    // Client side — close the receipt loop + nudge to the contract page.
    if (o.clientUid) {
      await addNotification({
        recipientUid: o.clientUid,
        type: "advance_received",
        meta: { serviceTitle, amount: String(amount), offerId: id },
        link: "/portal/client",
      });
      await addNotification({
        recipientUid: o.clientUid,
        type: "contract_ready",
        meta: { serviceTitle, offerId: id },
        link: `/contract/${id}/client`,
      });
      void dispatchEmail({
        type: "advance_received",
        recipientUid: o.clientUid,
        meta: { serviceTitle, amount: String(amount) },
      });
    }
    // Creator side — same two notifications, only fires once a bid is accepted.
    if (o.acceptedBidId) {
      const bidSnap = await getDoc(doc(db, "bids", o.acceptedBidId));
      if (bidSnap.exists()) {
        const b = bidSnap.data() as Bid;
        if (b.creatorId) {
          await addNotification({
            recipientUid: b.creatorId,
            type: "advance_paid",
            meta: { serviceTitle, amount: String(amount) },
            link: "/portal/creator",
          });
          await addNotification({
            recipientUid: b.creatorId,
            type: "contract_ready",
            meta: { serviceTitle, offerId: id },
            link: `/contract/${id}/creator`,
          });
          void dispatchEmail({
            type: "advance_received",
            recipientUid: b.creatorId,
            meta: { serviceTitle, amount: String(amount) },
          });
        }
      }
    }
  } catch { /* silent */ }
};

/**
 * Client accepts the deliverable. Notifies the creator and stamps the bid so
 * the post-delivery rating reminder can fire later.
 */
export const acceptDelivery = async (bidId: string) => {
  await updateDoc(doc(db, "bids", bidId), {
    deliveryAcceptedAt: Date.now(),
    revisionRequestedAt: 0,
  });
  try {
    const bidSnap = await getDoc(doc(db, "bids", bidId));
    if (!bidSnap.exists()) return;
    const b = bidSnap.data() as Bid;
    const offSnap = await getDoc(doc(db, "offers", b.offerId));
    const serviceTitle = offSnap.exists() ? (offSnap.data() as ClientOffer).serviceTitle || "" : "";
    if (b.creatorId) {
      await addNotification({
        recipientUid: b.creatorId,
        type: "deliverable_accepted",
        meta: { serviceTitle, offerId: b.offerId },
        link: "/portal/creator",
      });
    }
  } catch { /* silent */ }
};

/** Client sends the deliverable back for revisions with an optional note. */
export const requestRevisions = async (bidId: string, note: string) => {
  await updateDoc(doc(db, "bids", bidId), {
    revisionRequestedAt: Date.now(),
    revisionNote: note || "",
    deliveryAcceptedAt: 0,
    // Reset the bid back to "accepted" so the creator can re-submit.
    status: "accepted",
    deliverableLink: "",
  });
  try {
    const bidSnap = await getDoc(doc(db, "bids", bidId));
    if (!bidSnap.exists()) return;
    const b = bidSnap.data() as Bid;
    if (b.creatorId) {
      await addNotification({
        recipientUid: b.creatorId,
        type: "deliverable_revisions",
        meta: { offerId: b.offerId, note: (note || "").slice(0, 120) },
        link: "/portal/creator",
      });
    }
  } catch { /* silent */ }
};

/** Admin marks the BaridiMob payout as released. Notifies the creator. */
export const releasePayment = async (bidId: string) => {
  await updateDoc(doc(db, "bids", bidId), { paymentReleasedAt: Date.now() });
  try {
    const bidSnap = await getDoc(doc(db, "bids", bidId));
    if (!bidSnap.exists()) return;
    const b = bidSnap.data() as Bid;
    if (b.creatorId) {
      await addNotification({
        recipientUid: b.creatorId,
        type: "payment_released",
        meta: { amount: String(b.amount || 0), offerId: b.offerId },
        link: "/portal/creator",
      });
      void dispatchEmail({
        type: "payment_released",
        recipientUid: b.creatorId,
        meta: { amount: String(b.amount || 0) },
      });
    }
  } catch { /* silent */ }
};

// ─── Time-based notification triggers ────────────────────────────────────
//
// These are called from portal mounts (ClientPortal, CreatorPortal,
// AdminPortal). Each writes an idempotency timestamp on the source doc so
// the same event fires at most once per user per project.

/** 24 h-before-deadline notification for both client and creator. */
export const checkDeadlineNotifications = async (
  bids: Bid[],
  offers: ClientOffer[],
) => {
  const now = Date.now();
  const window = 24 * 60 * 60 * 1000;
  const dueSoon = bids.filter((b) =>
    b.status === "accepted" &&
    !b.deadlineNotifiedAt &&
    b.deliveryDeadline &&
    b.deliveryDeadline - now <= window &&
    b.deliveryDeadline - now > 0,
  );
  for (const b of dueSoon) {
    try {
      const o = offers.find((x) => x.id === b.offerId);
      const serviceTitle = o?.serviceTitle || "";
      if (o?.clientUid) {
        await addNotification({
          recipientUid: o.clientUid,
          type: "deadline_approaching",
          meta: { serviceTitle, offerId: b.offerId },
          link: "/portal/client",
        });
      }
      if (b.creatorId) {
        await addNotification({
          recipientUid: b.creatorId,
          type: "deadline_approaching",
          meta: { serviceTitle, offerId: b.offerId },
          link: "/portal/creator",
        });
      }
      await updateDoc(doc(db, "bids", b.id), { deadlineNotifiedAt: now });
    } catch { /* silent */ }
  }
};

/** "No bids in 14 days" → notify the client once with a relist nudge. */
export const checkExpiredOfferNotifications = async (offers: ClientOffer[], bids: Bid[]) => {
  const now = Date.now();
  const expiry = 14 * 24 * 60 * 60 * 1000;
  const expired = offers.filter((o) =>
    o.status === "open" &&
    !o.expiredNotifiedAt &&
    now - o.createdAt > expiry &&
    !bids.some((b) => b.offerId === o.id),
  );
  for (const o of expired) {
    try {
      if (o.clientUid) {
        await addNotification({
          recipientUid: o.clientUid,
          type: "offer_expired",
          meta: { serviceTitle: o.serviceTitle || "", offerId: o.id },
          link: "/portal/client",
        });
      }
      await updateDoc(doc(db, "offers", o.id), { expiredNotifiedAt: now });
    } catch { /* silent */ }
  }
};

/** 24 h after the client accepted delivery → prompt both sides for a rating. */
export const checkRatingReminders = async (bids: Bid[], offers: ClientOffer[]) => {
  const now = Date.now();
  const delay = 24 * 60 * 60 * 1000;
  const ready = bids.filter((b) =>
    b.deliveryAcceptedAt &&
    !b.ratingPromptedAt &&
    now - b.deliveryAcceptedAt >= delay,
  );
  for (const b of ready) {
    try {
      const o = offers.find((x) => x.id === b.offerId);
      const serviceTitle = o?.serviceTitle || "";
      if (o?.clientUid) {
        await addNotification({
          recipientUid: o.clientUid,
          type: "rating_reminder",
          meta: { serviceTitle, offerId: b.offerId, target: "creator" },
          link: "/portal/client",
        });
      }
      if (b.creatorId) {
        await addNotification({
          recipientUid: b.creatorId,
          type: "rating_reminder",
          meta: { serviceTitle, offerId: b.offerId, target: "client" },
          link: "/portal/creator",
        });
      }
      await updateDoc(doc(db, "bids", b.id), { ratingPromptedAt: now });
    } catch { /* silent */ }
  }
};

/**
 * Auto-close sweeper. After `autoCloseAt`, the lowest pending bid auto-wins.
 *
 * Rules:
 *   - Multiple bids → cheapest amount wins (ties → earliest createdAt).
 *   - Exactly 1 bid → that bid wins (still better than no answer).
 *   - 0 bids → leave the offer as `open`; the existing 14-day expiry sweeper
 *     will eventually fire `offer_expired` (handled in `checkExpiredOfferNotifications`).
 *
 * Idempotent — sets `autoClosed: true` on first sweep so we don't run twice.
 */
export const checkAutoCloseOffers = async (offers: ClientOffer[], bids: Bid[]) => {
  const now = Date.now();
  const due = offers.filter(
    (o) => o.status === "open" && !o.autoClosed && o.autoCloseAt && now >= o.autoCloseAt,
  );
  for (const o of due) {
    try {
      const candidates = bids.filter((b) => b.offerId === o.id && b.status === "pending");
      if (candidates.length === 0) {
        // No bids at all — just stamp autoClosed so we don't re-evaluate every
        // mount; the 14-day expiry sweeper still owns the "no bids" notification.
        await updateDoc(doc(db, "offers", o.id), { autoClosed: true });
        continue;
      }
      // Cheapest wins; ties broken by earliest bid.
      const winner = [...candidates].sort(
        (a, b) => a.amount - b.amount || a.createdAt - b.createdAt,
      )[0];
      await updateDoc(doc(db, "offers", o.id), { autoClosed: true });
      await acceptBid(winner.id, o.id);
      // Tell the client their offer was auto-assigned (they didn't pick).
      if (o.clientUid) {
        await addNotification({
          recipientUid: o.clientUid,
          type: "bid_accepted",
          meta: {
            serviceTitle: o.serviceTitle || "",
            creatorName: winner.creatorName || "",
            amount: String(winner.amount || 0),
            offerId: o.id,
            autoClosed: "1",
          },
          link: "/portal/client",
        });
      }
    } catch { /* silent — sweeper retries next mount */ }
  }
};

// ─── Bids ─────────────────────────────────────────────────────────────────
export const addBid = async (b: Omit<Bid, "id" | "status" | "createdAt">) => {
  const ref = await addDoc(collection(db, "bids"), { ...b, status: "pending", createdAt: serverTimestamp() });
  // Notify the project owner that someone bid.
  try {
    const snap = await getDoc(doc(db, "offers", b.offerId));
    if (snap.exists()) {
      const o = snap.data() as ClientOffer;
      if (o.clientUid) {
        await addNotification({
          recipientUid: o.clientUid,
          type: "new_bid",
          meta: {
            serviceTitle: o.serviceTitle || "",
            creatorName: b.creatorName || "",
            amount: String(b.amount || 0),
            offerId: b.offerId,
          },
          link: "/portal/client",
        });
        void dispatchEmail({
          type: "new_bid",
          recipientUid: o.clientUid,
          meta: {
            serviceTitle: o.serviceTitle || "",
            creatorName: b.creatorName || "",
            amount: String(b.amount || 0),
          },
        });
      }
    }
  } catch { /* silent */ }
  return ref.id;
};
export const submitDeliverable = async (bidId: string, link: string) => {
  await updateDoc(doc(db, "bids", bidId), { deliverableLink: link, status: "delivered" });
  // Notify the client that the work is ready for review.
  try {
    const bidSnap = await getDoc(doc(db, "bids", bidId));
    if (!bidSnap.exists()) return;
    const b = bidSnap.data() as Bid;
    const offSnap = await getDoc(doc(db, "offers", b.offerId));
    if (!offSnap.exists()) return;
    const o = offSnap.data() as ClientOffer;
    if (o.clientUid) {
      await addNotification({
        recipientUid: o.clientUid,
        type: "deliverable_submitted",
        meta: {
          serviceTitle: o.serviceTitle || "",
          creatorName: b.creatorName || "",
          offerId: b.offerId,
        },
        link: "/portal/client",
      });
      void dispatchEmail({
        type: "deliverable_submitted",
        recipientUid: o.clientUid,
        meta: {
          serviceTitle: o.serviceTitle || "",
          creatorName: b.creatorName || "",
        },
      });
    }
  } catch { /* silent */ }
};
export const acceptBid = async (bidId: string, offerId: string) => {
  const acceptedAt = Date.now();
  const deliveryDeadline = acceptedAt + 24 * 60 * 60 * 1000; // 24h to deliver

  // Auto-share contacts both ways: pull the creator's profile (phone +
  // BaridiMob) and the client's profile (phone) and mirror them onto the
  // offer + bid docs so each side sees the other's contact instantly.
  const acceptedBidSnap = await getDoc(doc(db, "bids", bidId));
  const acceptedBid = acceptedBidSnap.exists() ? (acceptedBidSnap.data() as Bid) : null;
  const offerSnapEarly = await getDoc(doc(db, "offers", offerId));
  const offerEarly = offerSnapEarly.exists() ? (offerSnapEarly.data() as ClientOffer) : null;

  let creatorPhone = "";
  let creatorBariMob = "";
  let creatorName = acceptedBid?.creatorName || "";
  let clientPhone = "";
  let clientName = offerEarly?.clientName || "";
  let clientEmail = offerEarly?.clientEmail || "";
  try {
    if (acceptedBid?.creatorId) {
      const cuSnap = await getDoc(doc(db, "users", acceptedBid.creatorId));
      if (cuSnap.exists()) {
        const cu = cuSnap.data() as UserProfile;
        creatorPhone = cu.phone || "";
        creatorBariMob = cu.bariMobAccount || "";
        creatorName = cu.name || creatorName;
      }
    }
    if (offerEarly?.clientUid) {
      const cuSnap = await getDoc(doc(db, "users", offerEarly.clientUid));
      if (cuSnap.exists()) {
        const cu = cuSnap.data() as UserProfile;
        clientPhone = cu.phone || offerEarly.clientPhone || "";
        clientName = cu.name || clientName;
        clientEmail = cu.email || clientEmail;
      }
    } else if (offerEarly?.clientPhone) {
      clientPhone = offerEarly.clientPhone;
    }
  } catch { /* silent — auto-share is a best-effort enhancement */ }

  await updateDoc(doc(db, "bids", bidId), {
    status: "accepted",
    acceptedAt,
    deliveryDeadline,
    clientPhone,
    clientName,
    clientEmail,
  });
  await updateDoc(doc(db, "offers", offerId), {
    status: "assigned",
    acceptedBidId: bidId,
    acceptedCreatorPhone: creatorPhone,
    acceptedCreatorBariMob: creatorBariMob,
    acceptedCreatorName: creatorName,
  });
  const { getDocs, query: q, collection: col, where: w } = await import("firebase/firestore");
  const snap = await getDocs(q(col(db, "bids"), w("offerId", "==", offerId), w("status", "==", "pending")));
  await Promise.all(snap.docs.filter((d) => d.id !== bidId).map((d) => updateDoc(doc(db, "bids", d.id), { status: "rejected" })));

  // Notify accepted creator + rejected creators.
  try {
    const offSnap = await getDoc(doc(db, "offers", offerId));
    const serviceTitle = offSnap.exists() ? (offSnap.data() as ClientOffer).serviceTitle || "" : "";
    const acceptedSnap = await getDoc(doc(db, "bids", bidId));
    if (acceptedSnap.exists()) {
      const ab = acceptedSnap.data() as Bid;
      if (ab.creatorId) {
        await addNotification({
          recipientUid: ab.creatorId,
          type: "bid_accepted",
          meta: { serviceTitle, offerId },
          link: "/portal/creator",
        });
        void dispatchEmail({
          type: "bid_accepted",
          recipientUid: ab.creatorId,
          meta: { serviceTitle, amount: String(ab.amount || 0) },
        });
      }
    }
    await Promise.all(
      snap.docs
        .filter((d) => d.id !== bidId)
        .map(async (d) => {
          const rb = d.data() as Bid;
          if (!rb.creatorId) return;
          await addNotification({
            recipientUid: rb.creatorId,
            type: "bid_not_selected",
            meta: { serviceTitle, offerId },
            link: "/portal/creator",
          });
        }),
    );
  } catch { /* silent */ }
};

/** Update workspace fields on an offer (meeting URL, meeting time, address). */
export const updateOfferWorkspace = async (
  offerId: string,
  data: Partial<Pick<ClientOffer, "meetingUrl" | "meetingAt" | "shootAddress" | "clientPhone">>,
) => {
  await updateDoc(doc(db, "offers", offerId), data as any);
};

// ─── Hooks ────────────────────────────────────────────────────────────────
export function useCreators(): CreatorApplication[] {
  const [data, setData] = useState<CreatorApplication[]>([]);
  useEffect(() => {
    const q = query(collection(db, "creators"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as CreatorApplication))));
  }, []);
  return data;
}
export function useOffers(): ClientOffer[] {
  const [data, setData] = useState<ClientOffer[]>([]);
  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as ClientOffer))));
  }, []);
  return data;
}
export function useBids(): Bid[] {
  const [data, setData] = useState<Bid[]>([]);
  useEffect(() => {
    const q = query(collection(db, "bids"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as Bid))));
  }, []);
  return data;
}
export function useBidsForOffer(offerId: string): Bid[] {
  const [data, setData] = useState<Bid[]>([]);
  useEffect(() => {
    if (!offerId) return;
    const q = query(collection(db, "bids"), where("offerId", "==", offerId), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as Bid))));
  }, [offerId]);
  return data;
}
export function useUserCounts(): { clients: number; creators: number } {
  const [counts, setCounts] = useState({ clients: 0, creators: 0 });
  useEffect(() => {
    // Listen to users collection for real-time counts
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const docs = snap.docs.map((d) => d.data());
        setCounts({
          clients: docs.filter((d) => d.role === "client").length,
          creators: docs.filter((d) => d.role === "creator").length,
        });
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("[v0] useUserCounts error:", err.code, err.message);
      }
    );
    return unsubUsers;
  }, []);
  return counts;
}

export type UserDoc = {
  uid: string;
  name: string;
  email: string;
  role: "client" | "creator" | "admin";
  wilaya?: string;
  phone?: string;
  bariMobAccount?: string;
  profilePic?: string;
  avatar?: string;
  username?: string;
  createdAt?: string;
};

export function useAllUsers(): UserDoc[] {
  const [data, setData] = useState<UserDoc[]>([]);
  useEffect(() => {
    return onSnapshot(
      collection(db, "users"),
      (snap) => {
        setData(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc)));
      },
      (err) => {
        // Surface Firestore errors (most common: permission-denied because
        // the deployed firestore.rules don't allow listing /users yet).
        // eslint-disable-next-line no-console
        console.error("[v0] useAllUsers error:", err.code, err.message);
      }
    );
  }, []);
  return data;
}


// ─── Public stats — works for visitors + logged in users ─────────────────
// Strategy:
//   • Logged-in users read /users directly (live, accurate).
//   • While reading, reconcile /public/stats so visitors see the same numbers.
//     This is what backfills users that signed up before bumpPublicStats existed.
//   • Anonymous visitors fall back to /public/stats (always readable).
export function usePublicStats(): { clients: number; creators: number } {
  const [stats, setStats] = useState({ clients: 0, creators: 0 });
  useEffect(() => {
    let unsub: (() => void) | undefined;
    let lastSync = "";
    unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const docs = snap.docs.map((d) => d.data());
        const next = {
          clients: docs.filter((d) => d.role === "client").length,
          creators: docs.filter((d) => d.role === "creator").length,
        };
        setStats(next);
        // Mirror the live count into /public/stats so anonymous visitors
        // see the same numbers. Only write when the snapshot actually changed
        // to avoid pointless churn.
        const sig = `${next.clients}:${next.creators}`;
        if (sig !== lastSync) {
          lastSync = sig;
          setDoc(doc(db, "public", "stats"), next, { merge: true }).catch(() => { /* silent */ });
        }
      },
      () => {
        // Anonymous visitor — read the mirror doc.
        unsub = onSnapshot(doc(db, "public", "stats"), (snap) => {
          if (snap.exists()) {
            const d = snap.data();
            setStats({ clients: d.clients || 0, creators: d.creators || 0 });
          }
        }, () => { /* silent */ });
      }
    );
    return () => { if (unsub) unsub(); };
  }, []);
  return stats;
}

// Call this after every successful registration to keep public stats in sync
export const bumpPublicStats = async (role: "client" | "creator") => {
  try {
    const { increment } = await import("firebase/firestore");
    const statsRef = doc(db, "public", "stats");
    await updateDoc(statsRef, { [role === "client" ? "clients" : "creators"]: increment(1) });
  } catch {
    // Doc might not exist yet — create it
    try {
      await setDoc(doc(db, "public", "stats"), { clients: 0, creators: 0 });
    } catch { /* silent */ }
  }
};
