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
  avatar?: string; // URL or avatar key
  bariMobAccount?: string;
  completedJobs?: number;
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
};

export type Bid = {
  id: string;
  offerId: string;
  creatorId: string;
  creatorName: string;
  creatorEmail: string;
  amount: number;
  deliverableLink?: string; // uploaded by creator when done
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
  referenceLink?: string; // client can attach a link
  deadline?: string;
  matchingRoles: string[];
  wilayaFilter?: string;
  advancePaid?: boolean; // 10% advance
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

// ─── User profile ─────────────────────────────────────────────────────────────
export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, "users", uid), data);
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { uid: snap.id, ...snap.data() } as UserProfile : null;
};

// ─── Creators ─────────────────────────────────────────────────────────────────
export const addCreator = async (c: Omit<CreatorApplication, "id" | "status" | "createdAt">) => {
  const ref = await addDoc(collection(db, "creators"), { ...c, status: "pending", createdAt: serverTimestamp() });
  return ref.id;
};
export const setCreatorStatus = async (id: string, status: CreatorApplication["status"]) => {
  await updateDoc(doc(db, "creators", id), { status });
};

// ─── Offers ───────────────────────────────────────────────────────────────────
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

// ─── Bids ─────────────────────────────────────────────────────────────────────
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

// ─── Hooks ────────────────────────────────────────────────────────────────────
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
