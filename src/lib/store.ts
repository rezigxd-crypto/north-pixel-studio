import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp, where, getDoc, getDocs, setDoc
} from "firebase/firestore";
import { db } from "./firebase";
import { generateUniqueUsername } from "./username";
import { addNotification } from "./notifications";

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
export const setOfferStatus = async (id: string, status: ClientOffer["status"]) => {
  await updateDoc(doc(db, "offers", id), { status });
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
        }
      }
    } catch { /* silent — notifications never block the main flow */ }
  }
};
export const markAdvancePaid = async (id: string, amount: number) => {
  await updateDoc(doc(db, "offers", id), { advancePaid: true, advanceAmount: amount });
  // Notify the assigned creator that the advance is confirmed.
  try {
    const offSnap = await getDoc(doc(db, "offers", id));
    if (!offSnap.exists()) return;
    const o = offSnap.data() as ClientOffer;
    if (!o.acceptedBidId) return;
    const bidSnap = await getDoc(doc(db, "bids", o.acceptedBidId));
    if (!bidSnap.exists()) return;
    const b = bidSnap.data() as Bid;
    if (b.creatorId) {
      await addNotification({
        recipientUid: b.creatorId,
        type: "advance_paid",
        meta: { serviceTitle: o.serviceTitle || "", amount: String(amount) },
        link: "/portal/creator",
      });
    }
  } catch { /* silent */ }
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
    }
  } catch { /* silent */ }
};
export const acceptBid = async (bidId: string, offerId: string) => {
  const acceptedAt = Date.now();
  const deliveryDeadline = acceptedAt + 24 * 60 * 60 * 1000; // 24h to deliver
  await updateDoc(doc(db, "bids", bidId), {
    status: "accepted",
    acceptedAt,
    deliveryDeadline,
  });
  await updateDoc(doc(db, "offers", offerId), { status: "assigned", acceptedBidId: bidId });
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
