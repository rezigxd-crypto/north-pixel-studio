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
  createdAt: number;
};

export type ClientOffer = {
  id: string;
  clientName: string;
  clientEmail: string;
  clientWilaya?: string;
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
  await updateDoc(doc(db, "bids", bidId), { status: "accepted" });
  await updateDoc(doc(db, "offers", offerId), { status: "assigned", acceptedBidId: bidId });
  const { getDocs, query: q, collection: col, where: w } = await import("firebase/firestore");
  const snap = await getDocs(q(col(db, "bids"), w("offerId", "==", offerId), w("status", "==", "pending")));
  await Promise.all(snap.docs.filter((d) => d.id !== bidId).map((d) => updateDoc(doc(db, "bids", d.id), { status: "rejected" })));
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
        const next = {
          clients: docs.filter((d) => d.role === "client").length,
          creators: docs.filter((d) => d.role === "creator").length,
        };
        setCounts(next);
        // Mirror to /public/stats so unauthenticated homepage visitors see
        // accurate counts (this also seeds counts for users who existed
        // before the public counter was introduced).
        setDoc(doc(db, "public", "stats"), next, { merge: true }).catch(() => {});
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
        const docs = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserDoc));
        setData(docs);
        // Whenever an admin (or any auth user with permission) loads /users,
        // mirror the live count to /public/stats so visitors / unauthed
        // homepage views see the correct number — this also backfills counts
        // for users who signed up BEFORE the public stats counter existed.
        const counts = {
          clients:  docs.filter((d) => d.role === "client").length,
          creators: docs.filter((d) => d.role === "creator").length,
        };
        setDoc(doc(db, "public", "stats"), counts, { merge: true }).catch(() => {});
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
//  • Always listen to /public/stats (readable by everyone, even visitors).
//  • Also try to listen to /users — if it succeeds (logged-in user with
//    permission), use the live count and MIRROR it back to /public/stats so
//    that visitors see fresh numbers next time.
// This guarantees the homepage never shows a stale 0 once any logged-in user
// has loaded the page.
export function usePublicStats(): { clients: number; creators: number } {
  const [stats, setStats] = useState({ clients: 0, creators: 0 });
  useEffect(() => {
    // Helper: coerce raw Firestore value to a positive integer, even if the
    // field was accidentally stored as a string ("5") or null.
    const num = (v: unknown): number => {
      const n = Number(v);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
    };

    // 1) /public/stats — always readable (visitors + auth)
    const pubUnsub = onSnapshot(
      doc(db, "public", "stats"),
      (snap) => {
        if (!snap.exists()) {
          // eslint-disable-next-line no-console
          console.warn("[v0] /public/stats document does not exist yet — homepage will show 0 until an admin loads the dashboard.");
          return;
        }
        const d = snap.data();
        const next = { clients: num(d.clients), creators: num(d.creators) };
        // eslint-disable-next-line no-console
        console.log("[v0] /public/stats →", next);
        setStats((prev) => ({
          clients:  Math.max(prev.clients,  next.clients),
          creators: Math.max(prev.creators, next.creators),
        }));
      },
      (err) => {
        // eslint-disable-next-line no-console
        console.error("[v0] /public/stats READ blocked — check Firestore rules:", err.code, err.message);
      }
    );

    // 2) /users — works for authenticated users; preferred source of truth.
    // When this works, we mirror back to /public/stats so visitors see fresh
    // numbers next time they open the homepage.
    const userUnsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const docs = snap.docs.map((d) => d.data());
        const counts = {
          clients:  docs.filter((d) => d.role === "client").length,
          creators: docs.filter((d) => d.role === "creator").length,
        };
        // eslint-disable-next-line no-console
        console.log("[v0] /users live count →", counts);
        setStats(counts);
        setDoc(doc(db, "public", "stats"), counts, { merge: true }).catch((err) => {
          // eslint-disable-next-line no-console
          console.error("[v0] mirror /public/stats WRITE blocked — check Firestore rules:", err.code, err.message);
        });
      },
      () => {
        // permission denied for visitors — fine, we still have pubUnsub
      }
    );

    return () => { pubUnsub(); userUnsub(); };
  }, []);
  return stats;
}

// Call this after every successful registration to keep public stats in sync.
// Uses setDoc + merge + increment so it works whether the doc exists or not —
// the previous version created a {clients:0, creators:0} doc on first run and
// never actually incremented, which is why the home page kept showing 0.
export const bumpPublicStats = async (role: "client" | "creator") => {
  try {
    const { increment } = await import("firebase/firestore");
    const statsRef = doc(db, "public", "stats");
    await setDoc(
      statsRef,
      { [role === "client" ? "clients" : "creators"]: increment(1) },
      { merge: true }
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[v0] bumpPublicStats failed:", err);
  }
};
