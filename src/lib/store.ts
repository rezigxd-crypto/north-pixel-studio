// Firebase Firestore store — replaces localStorage completely
import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, onSnapshot,
  query, orderBy, serverTimestamp, Timestamp, where
} from "firebase/firestore";
import { db } from "./firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

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
};

export type Bid = {
  id: string;
  offerId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  amount: number;
  status: "pending" | "accepted" | "rejected";
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
  deadline?: string;
  matchingRoles: string[];
  wilayaFilter?: string;
  status: "pending_admin" | "open" | "assigned" | "rejected";
  acceptedBidId?: string;
  createdAt: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toTs = (v: any): number => {
  if (!v) return Date.now();
  if (v instanceof Timestamp) return v.toMillis();
  if (typeof v === "number") return v;
  return Date.now();
};

// ─── Creators ─────────────────────────────────────────────────────────────────

export const addCreator = async (c: Omit<CreatorApplication, "id" | "status" | "createdAt">) => {
  const ref = await addDoc(collection(db, "creators"), {
    ...c,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const setCreatorStatus = async (id: string, status: CreatorApplication["status"]) => {
  await updateDoc(doc(db, "creators", id), { status });
};

// ─── Offers ───────────────────────────────────────────────────────────────────

export const addOffer = async (o: Omit<ClientOffer, "id" | "status" | "createdAt" | "bidMin" | "bidMax">) => {
  const bidMin = Math.round(o.creatorPayout * 0.83);
  const bidMax = o.creatorPayout;
  const ref = await addDoc(collection(db, "offers"), {
    ...o,
    bidMin,
    bidMax,
    status: "pending_admin",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const setOfferStatus = async (id: string, status: ClientOffer["status"]) => {
  await updateDoc(doc(db, "offers", id), { status });
};

// ─── Bids ─────────────────────────────────────────────────────────────────────

export const addBid = async (b: Omit<Bid, "id" | "status" | "createdAt">) => {
  const ref = await addDoc(collection(db, "bids"), {
    ...b,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const acceptBid = async (bidId: string, offerId: string) => {
  // Accept the chosen bid
  await updateDoc(doc(db, "bids", bidId), { status: "accepted" });
  // Mark offer as assigned
  await updateDoc(doc(db, "offers", offerId), {
    status: "assigned",
    acceptedBidId: bidId,
  });
  // Reject other bids for this offer — we fetch them via onSnapshot in the hook
  // so we just do it inline here too
  const { getDocs, query: q, collection: col, where: w } = await import("firebase/firestore");
  const snap = await getDocs(q(col(db, "bids"), w("offerId", "==", offerId), w("status", "==", "pending")));
  const updates = snap.docs
    .filter((d) => d.id !== bidId)
    .map((d) => updateDoc(doc(db, "bids", d.id), { status: "rejected" }));
  await Promise.all(updates);
};

// ─── Real-time hooks ──────────────────────────────────────────────────────────

export function useCreators(): CreatorApplication[] {
  const [data, setData] = useState<CreatorApplication[]>([]);
  useEffect(() => {
    const q = query(collection(db, "creators"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as CreatorApplication)));
    });
    return unsub;
  }, []);
  return data;
}

export function useOffers(): ClientOffer[] {
  const [data, setData] = useState<ClientOffer[]>([]);
  useEffect(() => {
    const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as ClientOffer)));
    });
    return unsub;
  }, []);
  return data;
}

export function useBids(): Bid[] {
  const [data, setData] = useState<Bid[]>([]);
  useEffect(() => {
    const q = query(collection(db, "bids"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as Bid)));
    });
    return unsub;
  }, []);
  return data;
}

export function useBidsForOffer(offerId: string): Bid[] {
  const [data, setData] = useState<Bid[]>([]);
  useEffect(() => {
    if (!offerId) return;
    const q = query(collection(db, "bids"), where("offerId", "==", offerId), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setData(snap.docs.map((d) => ({ id: d.id, ...d.data(), createdAt: toTs(d.data().createdAt) } as Bid)));
    });
    return unsub;
  }, [offerId]);
  return data;
}
