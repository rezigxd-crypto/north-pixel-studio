import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp, where, getDoc, setDoc
} from "firebase/firestore";
import { db } from "./firebase";

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
};
export const markAdvancePaid = async (id: string, amount: number) => {
  await updateDoc(doc(db, "offers", id), { advancePaid: true, advanceAmount: amount });
};

// ─── Bids ─────────────────────────────────────────────────────────────────
export const addBid = async (b: Omit<Bid, "id" | "status" | "createdAt">) => {
  const ref = await addDoc(collection(db, "bids"), { ...b, status: "pending", createdAt: serverTimestamp() });
  return ref.id;
};
export const submitDeliverable = async (bidId: string, link: string) => {
  await updateDoc(doc(db, "bids", bidId), { deliverableLink: link, status: "delivered" });
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
// Reads from users/ if authenticated, falls back to public/stats doc
export function usePublicStats(): { clients: number; creators: number } {
  const [stats, setStats] = useState({ clients: 0, creators: 0 });
  useEffect(() => {
    let unsub: (() => void) | undefined;
    // Try users collection first (works when logged in)
    unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const docs = snap.docs.map((d) => d.data());
        setStats({
          clients: docs.filter((d) => d.role === "client").length,
          creators: docs.filter((d) => d.role === "creator").length,
        });
      },
      () => {
        // Permission denied (visitor not logged in) — try public stats doc
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
