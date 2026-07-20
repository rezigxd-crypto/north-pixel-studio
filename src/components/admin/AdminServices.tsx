import { useState } from "react";
import * as Icons from "lucide-react";
import { Plus, Pencil, Trash2, Save, X, Sparkles, Download, Languages, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useServices, addService, updateService, deleteService, seedServicesFromDefaults,
  slugify, translateTri, translateTriArray, type ServiceDoc, type Lang,
} from "@/lib/services";
import { CREATOR_ROLES, CREATOR_ROLE_AR, formatStartingPrice } from "@/lib/offers";

const ICON_HINTS = ["Film", "Camera", "Mic", "Video", "Music", "Palette", "Sparkles", "Clapperboard", "Radio", "PenLine", "Building2", "GraduationCap", "Home", "ShoppingBag", "Megaphone", "Wand2"];

type Draft = {
  slug: string; src: Lang;
  title: string; tagline: string; description: string;
  features: string; process: string;
  startingPrice: string; unitLabel: string; pricePerUnit: string; minUnits: string; maxUnits: string;
  icon: string; accent: "gold" | "royal"; image: string;
  matchingRoles: string[];
};

const blankDraft = (): Draft => ({
  slug: "", src: "ar",
  title: "", tagline: "", description: "", features: "", process: "",
  startingPrice: "8000", unitLabel: "", pricePerUnit: "8000", minUnits: "1", maxUnits: "10",
  icon: "Sparkles", accent: "gold", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
  matchingRoles: [],
});

const draftFromService = (s: ServiceDoc, src: Lang): Draft => ({
  slug: s.slug, src,
  title: s.title[src] || s.title.en || s.title.ar || "",
  tagline: s.tagline[src] || "",
  description: s.description[src] || "",
  features: (s.features[src] || []).join("\n"),
  process: (s.process[src] || []).join("\n"),
  startingPrice: String(s.startingPrice || 0),
  unitLabel: src === "ar" ? (s.pricing.unitLabelAr || "") : (s.pricing.unitLabel || ""),
  pricePerUnit: String(s.pricing.pricePerUnit || 0),
  minUnits: String(s.pricing.minUnits || 1),
  maxUnits: String(s.pricing.maxUnits || 10),
  icon: s.icon || "Sparkles", accent: s.accent, image: s.image,
  matchingRoles: [...(s.matchingRoles || [])],
});

export const AdminServices = ({ lang }: { lang: string }) => {
  const { services, isFallback } = useServices();
  const [editing, setEditing] = useState<ServiceDoc | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft());
  const [busy, setBusy] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const t = (ar: string, en: string) => (lang === "ar" ? ar : en);

  const openNew = () => { setDraft(blankDraft()); setEditing("new"); };
  const openEdit = (s: ServiceDoc) => { setDraft(draftFromService(s, "ar")); setEditing(s); };
  const set = (k: keyof Draft, v: any) => setDraft((d) => ({ ...d, [k]: v }));

  // Re-pull the source-language text when the admin switches source language
  // while editing an existing service (so they edit real per-language values).
  const switchSrc = (src: Lang) => {
    if (editing && editing !== "new") setDraft(draftFromService(editing, src));
    else set("src", src);
  };

  const seed = async () => {
    setSeeding(true);
    try {
      const n = await seedServicesFromDefaults();
      toast.success(n > 0 ? t(`تم استيراد ${n} خدمة`, `Imported ${n} services`) : t("الخدمات موجودة مسبقًا", "Services already imported"));
    } catch (e: any) {
      toast.error(e?.code === "permission-denied" ? t("صلاحيات غير كافية — انشر قواعد Firestore", "Permission denied — publish the Firestore rules") : t("فشل الاستيراد", "Import failed"));
    } finally { setSeeding(false); }
  };

  const remove = async (s: ServiceDoc) => {
    if (!confirm(t(`حذف الخدمة "${s.title[lang] || s.slug}"؟`, `Delete service "${s.title.en || s.slug}"?`))) return;
    try { await deleteService(s.id); toast.success(t("تم الحذف", "Deleted")); }
    catch (e: any) { toast.error(e?.code === "permission-denied" ? t("صلاحيات غير كافية", "Permission denied") : t("فشل الحذف", "Delete failed")); }
  };

  const save = async () => {
    if (!draft.title.trim()) { toast.error(t("أدخل اسم الخدمة", "Enter a service name")); return; }
    setBusy(true);
    try {
      // Smart translation: fan the single source-language text out to all three.
      const [title, tagline, description] = await Promise.all([
        translateTri(draft.title, draft.src),
        translateTri(draft.tagline, draft.src),
        translateTri(draft.description, draft.src),
      ]);
      const [features, process] = await Promise.all([
        translateTriArray(draft.features.split("\n"), draft.src),
        translateTriArray(draft.process.split("\n"), draft.src),
      ]);
      const unitTri = await translateTri(draft.unitLabel || title.en || "unit", draft.src);
      const price = Number(draft.startingPrice) || 0;
      const payload = {
        slug: draft.slug.trim() || slugify(title.en || draft.title),
        title, tagline, description, features, process,
        startingPrice: price,
        icon: draft.icon.trim() || "Sparkles",
        accent: draft.accent,
        image: draft.image.trim(),
        pricing: {
          unit: unitTri.ar || draft.unitLabel,
          pricePerUnit: Number(draft.pricePerUnit) || price,
          minUnits: Number(draft.minUnits) || 1,
          maxUnits: Number(draft.maxUnits) || 10,
          unitLabel: unitTri.en || draft.unitLabel,
          unitLabelPlural: unitTri.en || draft.unitLabel,
          unitLabelAr: unitTri.ar || draft.unitLabel,
        },
        matchingRoles: draft.matchingRoles,
      };
      if (editing === "new") {
        await addService({ ...(payload as any), order: services.length });
        toast.success(t("تمت إضافة الخدمة", "Service added"));
      } else if (editing) {
        await updateService(editing.id, payload as any);
        toast.success(t("تم حفظ التعديلات", "Service updated"));
      }
      setEditing(null);
    } catch (e: any) {
      toast.error(e?.code === "permission-denied"
        ? t("صلاحيات غير كافية — انشر قواعد Firestore", "Permission denied — publish the Firestore rules")
        : t("فشل الحفظ", "Save failed"));
    } finally { setBusy(false); }
  };

  const PreviewIcon = (Icons as any)[draft.icon] || Sparkles;

  // ── Editor form ──
  if (editing) {
    return (
      <div className="glass rounded-2xl p-5 md:p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => setEditing(null)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />{t("رجوع", "Back")}
          </button>
          <h3 className="font-serif text-lg font-bold">{editing === "new" ? t("خدمة جديدة", "New service") : t("تعديل الخدمة", "Edit service")}</h3>
        </div>

        {/* Source language selector */}
        <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-secondary/40 border border-border/40">
          <Languages className="w-4 h-4 text-accent" />
          <span className="text-xs text-muted-foreground">{t("لغة الإدخال (تُترجم تلقائيًا للباقي):", "Input language (auto-translated to the rest):")}</span>
          {(["ar", "en", "fr"] as Lang[]).map((l) => (
            <button key={l} onClick={() => switchSrc(l)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-smooth ${draft.src === l ? "bg-gradient-gold text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>
              {l === "ar" ? "العربية" : l === "en" ? "English" : "Français"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>{t("اسم الخدمة", "Service name")}</Label>
            <Input value={draft.title} onChange={(e) => set("title", e.target.value)} className="mt-1"
              placeholder={draft.src === "ar" ? "مثال: تصوير فوتوغرافي" : "e.g. Photography"} />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("الوصف المختصر (سطر واحد)", "Tagline (one line)")}</Label>
            <Input value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("الوصف الكامل", "Full description")}</Label>
            <Textarea value={draft.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" />
          </div>
          <div>
            <Label>{t("المميزات (سطر لكل ميزة)", "Features (one per line)")}</Label>
            <Textarea value={draft.features} onChange={(e) => set("features", e.target.value)} rows={4} className="mt-1" />
          </div>
          <div>
            <Label>{t("خطوات العمل (سطر لكل خطوة)", "Process (one per line)")}</Label>
            <Textarea value={draft.process} onChange={(e) => set("process", e.target.value)} rows={4} className="mt-1" />
          </div>

          <div>
            <Label>{t("السعر الابتدائي (دج)", "Starting price (DA)")}</Label>
            <Input type="number" value={draft.startingPrice} onChange={(e) => set("startingPrice", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("اسم الوحدة (مثال: ساعة، إعلان)", "Unit label (e.g. hour, spot)")}</Label>
            <Input value={draft.unitLabel} onChange={(e) => set("unitLabel", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>{t("سعر الوحدة (دج)", "Price per unit (DA)")}</Label>
            <Input type="number" value={draft.pricePerUnit} onChange={(e) => set("pricePerUnit", e.target.value)} className="mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>{t("أدنى", "Min")}</Label><Input type="number" value={draft.minUnits} onChange={(e) => set("minUnits", e.target.value)} className="mt-1" /></div>
            <div><Label>{t("أقصى", "Max")}</Label><Input type="number" value={draft.maxUnits} onChange={(e) => set("maxUnits", e.target.value)} className="mt-1" /></div>
          </div>

          <div>
            <Label className="flex items-center gap-2">{t("الأيقونة", "Icon")} <PreviewIcon className="w-4 h-4 text-accent" /></Label>
            <Input list="icon-hints" value={draft.icon} onChange={(e) => set("icon", e.target.value)} className="mt-1" placeholder="Film" />
            <datalist id="icon-hints">{ICON_HINTS.map((n) => <option key={n} value={n} />)}</datalist>
          </div>
          <div>
            <Label>{t("اللون", "Accent")}</Label>
            <div className="flex gap-2 mt-1">
              {(["gold", "royal"] as const).map((a) => (
                <button key={a} onClick={() => set("accent", a)}
                  className={`flex-1 py-2 rounded-md text-xs font-semibold border ${draft.accent === a ? (a === "gold" ? "bg-gradient-gold text-accent-foreground border-transparent" : "bg-gradient-royal text-primary-foreground border-transparent") : "border-border text-muted-foreground"}`}>
                  {a === "gold" ? t("ذهبي", "Gold") : t("ملكي", "Royal")}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Label>{t("رابط الصورة", "Image URL")}</Label>
            <Input value={draft.image} onChange={(e) => set("image", e.target.value)} className="mt-1" dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <Label>{t("التخصصات المطابِقة (لأي مبدعين تظهر)", "Matching specialities (which creators see it)")}</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {CREATOR_ROLES.map((r) => {
                const on = draft.matchingRoles.includes(r);
                return (
                  <button key={r} type="button"
                    onClick={() => set("matchingRoles", on ? draft.matchingRoles.filter((x) => x !== r) : [...draft.matchingRoles, r])}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-smooth ${on ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                    {lang === "ar" ? CREATOR_ROLE_AR[r] : r}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="gold" className="flex-1" onClick={save} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 me-1 animate-spin" />{t("جارٍ الترجمة والحفظ…", "Translating & saving…")}</> : <><Save className="w-4 h-4 me-1" />{t("حفظ", "Save")}</>}
          </Button>
          <Button variant="ghost" onClick={() => setEditing(null)} disabled={busy}><X className="w-4 h-4 me-1" />{t("إلغاء", "Cancel")}</Button>
        </div>
      </div>
    );
  }

  // ── List view ──
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold">{t("إدارة الخدمات", "Manage services")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("تظهر هذه الخدمات في صفحات الموقع العامة.", "These appear on the public Services pages.")}</p>
        </div>
        <div className="flex gap-2">
          {isFallback && (
            <Button variant="outline" size="sm" onClick={seed} disabled={seeding}>
              {seeding ? <Loader2 className="w-4 h-4 me-1 animate-spin" /> : <Download className="w-4 h-4 me-1" />}
              {t("استيراد الخدمات الحالية", "Import current services")}
            </Button>
          )}
          <Button variant="gold" size="sm" onClick={openNew}><Plus className="w-4 h-4 me-1" />{t("خدمة جديدة", "New service")}</Button>
        </div>
      </div>

      {isFallback && (
        <div className="glass rounded-xl p-3 text-xs text-muted-foreground border border-accent/30">
          {t("يتم الآن عرض القائمة الافتراضية. اضغط \"استيراد الخدمات الحالية\" مرة واحدة لتفعيل التعديل.",
             "Showing the built-in default list. Click \"Import current services\" once to enable editing.")}
        </div>
      )}

      <div className="space-y-2">
        {services.map((s) => {
          const Icon = (Icons as any)[s.icon] || Sparkles;
          return (
            <div key={s.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{s.title[lang] || s.title.en || s.slug}</div>
                <div className="text-[11px] text-muted-foreground truncate">{formatStartingPrice(s.startingPrice, lang)} · {(s.matchingRoles || []).length} {t("تخصص", "roles")}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => openEdit(s)} disabled={isFallback} title={isFallback ? t("استورد أولًا", "Import first") : ""}>
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => remove(s)} disabled={isFallback}>
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
