import { useEffect, useState } from "react";
import {
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot,
  query, orderBy, getDocs, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { OFFERS, type Offer } from "./offers";

/**
 * Admin-managed Services catalog.
 *
 * The public Services pages (homepage grid + /services/:slug) render from
 * this layer. Data lives in the Firestore `services` collection so the admin
 * can add / edit / delete services and prices at runtime. If the collection
 * is empty or unreadable, we FALL BACK to the hardcoded OFFERS list — so the
 * marketing site renders identically before the admin ever seeds it, and can
 * never end up blank.
 */

export type ServiceDoc = Offer & {
  id: string;
  order: number;
};

const LANGS = ["ar", "en", "fr"] as const;
export type Lang = (typeof LANGS)[number];

/** Firestore doc → Offer (defensive: fills any missing tri-lingual field). */
const toOffer = (id: string, d: any): ServiceDoc => {
  const tri = (v: any) => ({ ar: v?.ar || "", en: v?.en || "", fr: v?.fr || "" });
  const triArr = (v: any) => ({
    ar: Array.isArray(v?.ar) ? v.ar : [],
    en: Array.isArray(v?.en) ? v.en : [],
    fr: Array.isArray(v?.fr) ? v.fr : [],
  });
  return {
    id,
    slug: d.slug || id,
    title: tri(d.title),
    tagline: tri(d.tagline),
    description: tri(d.description),
    features: triArr(d.features),
    process: triArr(d.process),
    startingPrice: Number(d.startingPrice) || 0,
    icon: d.icon || "Sparkles",
    accent: d.accent === "gold" ? "gold" : "royal",
    image: d.image || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    pricing: {
      unit: d.pricing?.unit || "",
      pricePerUnit: Number(d.pricing?.pricePerUnit) || 0,
      minUnits: Number(d.pricing?.minUnits) || 1,
      maxUnits: Number(d.pricing?.maxUnits) || 10,
      unitLabel: d.pricing?.unitLabel || "unit",
      unitLabelPlural: d.pricing?.unitLabelPlural || "units",
      unitLabelAr: d.pricing?.unitLabelAr || "وحدة",
    },
    matchingRoles: Array.isArray(d.matchingRoles) ? d.matchingRoles : [],
    order: Number(d.order) || 0,
  };
};

/** Hardcoded OFFERS mapped to the ServiceDoc shape (used as fallback + seed). */
const DEFAULTS: ServiceDoc[] = OFFERS.map((o, i) => ({ ...o, id: `default-${o.slug}`, order: i }));

/**
 * Live services catalog. Returns Firestore docs when the collection has any,
 * otherwise the hardcoded defaults. `isFallback` lets the admin UI know
 * whether a one-time import is still needed.
 */
export function useServices(): { services: ServiceDoc[]; loading: boolean; isFallback: boolean } {
  const [services, setServices] = useState<ServiceDoc[]>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(true);
  useEffect(() => {
    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) { setServices(DEFAULTS); setIsFallback(true); }
        else { setServices(snap.docs.map((dd) => toOffer(dd.id, dd.data()))); setIsFallback(false); }
        setLoading(false);
      },
      () => { setServices(DEFAULTS); setIsFallback(true); setLoading(false); },
    );
    return unsub;
  }, []);
  return { services, loading, isFallback };
}

// ─── CRUD (admin-only via firestore.rules) ──────────────────────────────────
export const addService = async (s: Omit<ServiceDoc, "id">) => {
  const { id: _omit, ...rest } = s as any;
  const ref = await addDoc(collection(db, "services"), { ...rest, createdAt: serverTimestamp() });
  return ref.id;
};
export const updateService = async (id: string, patch: Partial<ServiceDoc>) => {
  const { id: _omit, ...rest } = patch as any;
  await updateDoc(doc(db, "services", id), rest);
};
export const deleteService = async (id: string) => {
  await deleteDoc(doc(db, "services", id));
};

/** One-time import of the current hardcoded catalog into Firestore. No-op if
 *  the collection already has documents (won't duplicate). */
export const seedServicesFromDefaults = async (): Promise<number> => {
  const existing = await getDocs(collection(db, "services"));
  if (!existing.empty) return 0;
  let n = 0;
  for (const o of OFFERS) {
    const { ...rest } = o;
    await addDoc(collection(db, "services"), { ...rest, order: n, createdAt: serverTimestamp() });
    n++;
  }
  return n;
};

// ─── Slug ────────────────────────────────────────────────────────────────
export const slugify = (text: string): string =>
  (text || "")
    .toLowerCase()
    .replace(/[^\w؀-ۿ\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60) || `service-${Date.now().toString(36)}`;

// ─── Smart translation (MyMemory — free, no key, CORS-enabled) ──────────────
// The admin types each field ONCE in a source language; we auto-fill the other
// two. If the API fails (offline / rate-limited), we gracefully fall back to
// the source text so no field is ever left empty — the admin can still edit.
const _cache = new Map<string, string>();
export const autoTranslate = async (text: string, from: Lang, to: Lang): Promise<string> => {
  const t = (text || "").trim();
  if (!t || from === to) return text;
  const key = `${from}|${to}|${t}`;
  if (_cache.has(key)) return _cache.get(key)!;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(t)}&langpair=${from}|${to}&de=contact@thealgerianstudio.com`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    const json = await res.json();
    const out = json?.responseData?.translatedText;
    if (typeof out === "string" && out.trim() && !/^(MYMEMORY|INVALID|QUERY)/i.test(out)) {
      _cache.set(key, out);
      return out;
    }
  } catch { /* fall through to source */ }
  return text; // graceful fallback: keep source text
};

/** Fill all three languages from a single source-language string. */
export const translateTri = async (text: string, from: Lang): Promise<{ ar: string; en: string; fr: string }> => {
  const others = LANGS.filter((l) => l !== from) as Lang[];
  const [a, b] = await Promise.all(others.map((l) => autoTranslate(text, from, l)));
  const out: any = { [from]: text };
  out[others[0]] = a; out[others[1]] = b;
  return { ar: out.ar || "", en: out.en || "", fr: out.fr || "" };
};

/** Translate an array of lines (features/process) across all three languages. */
export const translateTriArray = async (lines: string[], from: Lang): Promise<{ ar: string[]; en: string[]; fr: string[] }> => {
  const clean = (lines || []).map((l) => l.trim()).filter(Boolean);
  const tri = await Promise.all(clean.map((l) => translateTri(l, from)));
  return {
    ar: tri.map((t) => t.ar),
    en: tri.map((t) => t.en),
    fr: tri.map((t) => t.fr),
  };
};
