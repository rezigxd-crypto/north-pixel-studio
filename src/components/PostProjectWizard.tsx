import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addOffer } from "@/lib/store";
import { ADMIN_COMMISSION, CLIENT_ADVANCE_PCT, formatDZD } from "@/lib/offers";
import { ALGERIA_WILAYAS } from "@/lib/i18n";
import * as Icons from "lucide-react";
import { ArrowLeft, Send, CheckCircle2, CreditCard, MapPin, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

type Step = "service" | "configure" | "brief" | "payment" | "done";

// ─── Service definitions with professional options ─────────────────────────

const SERVICES = [
  {
    slug: "cinematic-ad",
    icon: "Film",
    accent: "gold" as const,
    title: { ar: "إعلان سينمائي", en: "Cinematic Ad", fr: "Publicité Cinématique" },
    matchingRoles: ["Cinematographer", "Director", "Colorist"],
    options: {
      adType: {
        label: { ar: "نوع الإعلان", en: "Ad Type", fr: "Type de pub" },
        choices: [
          { id: "tvc", label: { ar: "إعلان تلفزيوني (TVC)", en: "TV Commercial (TVC)", fr: "Spot TV (TVC)" } },
          { id: "online", label: { ar: "إعلان رقمي (يوتيوب / إنستغرام)", en: "Digital Ad (YouTube / Instagram)", fr: "Pub digitale (YouTube / Instagram)" } },
          { id: "brand-film", label: { ar: "فيلم العلامة التجارية", en: "Brand Film", fr: "Film de marque" } },
          { id: "product", label: { ar: "إعلان منتج", en: "Product Ad", fr: "Pub produit" } },
        ],
      },
      duration: {
        label: { ar: "مدة الإعلان", en: "Ad Duration", fr: "Durée du spot" },
        choices: [
          { id: "15s", label: { ar: "15 ثانية", en: "15 seconds", fr: "15 secondes" }, price: 8000 },
          { id: "30s", label: { ar: "30 ثانية", en: "30 seconds", fr: "30 secondes" }, price: 15000 },
          { id: "60s", label: { ar: "60 ثانية", en: "60 seconds", fr: "60 secondes" }, price: 25000 },
          { id: "2min", label: { ar: "2 دقيقة", en: "2 minutes", fr: "2 minutes" }, price: 40000 },
          { id: "custom", label: { ar: "مدة مخصصة", en: "Custom duration", fr: "Durée personnalisée" }, price: 0 },
        ],
      },
    },
  },
  {
    slug: "podcast",
    icon: "Mic",
    accent: "royal" as const,
    title: { ar: "بودكاست", en: "Podcast", fr: "Podcast" },
    matchingRoles: ["Voice-Over Artist", "Sound Designer"],
    options: {
      format: {
        label: { ar: "شكل البودكاست", en: "Podcast Format", fr: "Format du podcast" },
        choices: [
          { id: "audio-only", label: { ar: "صوتي فقط (MP3)", en: "Audio only (MP3)", fr: "Audio uniquement (MP3)" } },
          { id: "video-podcast", label: { ar: "بودكاست مرئي (يوتيوب / TV)", en: "Video Podcast (YouTube / TV)", fr: "Podcast vidéo (YouTube / TV)" } },
          { id: "studio-setup", label: { ar: "جلسة استوديو كاملة", en: "Full studio session", fr: "Session studio complète" } },
        ],
      },
      episodeLength: {
        label: { ar: "مدة الحلقة", en: "Episode Length", fr: "Durée de l'épisode" },
        choices: [
          { id: "15min", label: { ar: "15 دقيقة", en: "15 min", fr: "15 min" }, price: 3000 },
          { id: "30min", label: { ar: "30 دقيقة", en: "30 min", fr: "30 min" }, price: 5000 },
          { id: "45min", label: { ar: "45 دقيقة", en: "45 min", fr: "45 min" }, price: 7000 },
          { id: "60min", label: { ar: "ساعة كاملة", en: "1 hour", fr: "1 heure" }, price: 9000 },
          { id: "90min", label: { ar: "ساعة ونصف", en: "90 min", fr: "90 min" }, price: 13000 },
        ],
      },
      episodes: {
        label: { ar: "عدد الحلقات", en: "Number of Episodes", fr: "Nombre d'épisodes" },
        isNumber: true,
        min: 1,
        max: 52,
        defaultVal: 1,
        unitAr: "حلقة",
        unitEn: "episode(s)",
      },
    },
  },
  {
    slug: "event-coverage",
    icon: "Calendar",
    accent: "royal" as const,
    title: { ar: "تغطية فعالية", en: "Event Coverage", fr: "Couverture Événement" },
    matchingRoles: ["Cinematographer", "Photographer"],
    options: {
      eventType: {
        label: { ar: "نوع الفعالية", en: "Event Type", fr: "Type d'événement" },
        choices: [
          { id: "conference", label: { ar: "مؤتمر / ندوة", en: "Conference / Seminar", fr: "Conférence / Séminaire" } },
          { id: "wedding", label: { ar: "حفل زفاف", en: "Wedding", fr: "Mariage" } },
          { id: "launch", label: { ar: "إطلاق منتج / مشروع", en: "Product / Project Launch", fr: "Lancement produit" } },
          { id: "concert", label: { ar: "حفل موسيقي / فني", en: "Concert / Show", fr: "Concert / Spectacle" } },
          { id: "graduation", label: { ar: "حفل تخرج", en: "Graduation Ceremony", fr: "Cérémonie de remise des diplômes" } },
          { id: "corporate", label: { ar: "فعالية شركة", en: "Corporate Event", fr: "Événement d'entreprise" } },
          { id: "other", label: { ar: "أخرى", en: "Other", fr: "Autre" } },
        ],
      },
      duration: {
        label: { ar: "مدة الفعالية", en: "Event Duration", fr: "Durée de l'événement" },
        choices: [
          { id: "2h", label: { ar: "حتى ساعتين", en: "Up to 2 hours", fr: "Jusqu'à 2h" }, price: 8000 },
          { id: "4h", label: { ar: "نصف يوم (4 ساعات)", en: "Half day (4 hours)", fr: "Demi-journée (4h)" }, price: 14000 },
          { id: "8h", label: { ar: "يوم كامل (8 ساعات)", en: "Full day (8 hours)", fr: "Journée complète (8h)" }, price: 25000 },
          { id: "multiday", label: { ar: "متعدد الأيام", en: "Multi-day", fr: "Plusieurs jours" }, price: 40000 },
        ],
      },
    },
  },
  {
    slug: "social-content",
    icon: "Smartphone",
    accent: "royal" as const,
    title: { ar: "محتوى سوشيال ميديا", en: "Social Media Content", fr: "Contenu Réseaux Sociaux" },
    matchingRoles: ["Video Editor", "Motion Designer", "Cinematographer"],
    options: {
      contentType: {
        label: { ar: "نوع المحتوى", en: "Content Type", fr: "Type de contenu" },
        choices: [
          { id: "reels", label: { ar: "ريلز (إنستغرام / تيك توك)", en: "Reels (Instagram / TikTok)", fr: "Reels (Instagram / TikTok)" } },
          { id: "youtube-shorts", label: { ar: "يوتيوب شورتس", en: "YouTube Shorts", fr: "YouTube Shorts" } },
          { id: "stories", label: { ar: "ستوريز", en: "Stories", fr: "Stories" } },
          { id: "ugc", label: { ar: "محتوى UGC (أصيل)", en: "UGC Content (authentic)", fr: "Contenu UGC (authentique)" } },
          { id: "motion", label: { ar: "موشن جرافيك", en: "Motion Graphics", fr: "Motion Graphics" } },
        ],
      },
      quantity: {
        label: { ar: "عدد المقاطع", en: "Number of Pieces", fr: "Nombre de pièces" },
        isNumber: true,
        min: 1,
        max: 60,
        defaultVal: 4,
        unitAr: "مقطع",
        unitEn: "piece(s)",
      },
      reelLength: {
        label: { ar: "مدة كل مقطع", en: "Length per piece", fr: "Durée par pièce" },
        choices: [
          { id: "15s", label: { ar: "15 ثانية", en: "15 sec", fr: "15 sec" }, price: 2000 },
          { id: "30s", label: { ar: "30 ثانية", en: "30 sec", fr: "30 sec" }, price: 3000 },
          { id: "60s", label: { ar: "60 ثانية", en: "60 sec", fr: "60 sec" }, price: 4500 },
          { id: "90s", label: { ar: "90 ثانية", en: "90 sec", fr: "90 sec" }, price: 6000 },
        ],
      },
    },
  },
  {
    slug: "photography",
    icon: "Camera",
    accent: "gold" as const,
    title: { ar: "تصوير فوتوغرافي", en: "Photography", fr: "Photographie" },
    matchingRoles: ["Photographer"],
    options: {
      photoType: {
        label: { ar: "نوع التصوير", en: "Photography Type", fr: "Type de photo" },
        choices: [
          { id: "product", label: { ar: "تصوير منتجات", en: "Product Photography", fr: "Photo produit" } },
          { id: "portrait", label: { ar: "بورتريه / شخصي", en: "Portrait / Personal", fr: "Portrait / Personnel" } },
          { id: "real-estate", label: { ar: "عقارات / ديكور", en: "Real Estate / Interior", fr: "Immobilier / Intérieur" } },
          { id: "editorial", label: { ar: "تحريري / فني", en: "Editorial / Art", fr: "Éditorial / Art" } },
          { id: "event-photo", label: { ar: "تصوير فعالية", en: "Event Photography", fr: "Photo événement" } },
          { id: "corporate", label: { ar: "مؤسسي / شركات", en: "Corporate / Business", fr: "Corporate / Entreprise" } },
        ],
      },
      quantity: {
        label: { ar: "عدد الصور المعدّلة", en: "Edited Photos Count", fr: "Photos retouchées" },
        isNumber: true,
        min: 5,
        max: 200,
        defaultVal: 20,
        unitAr: "صورة",
        unitEn: "photo(s)",
      },
    },
  },
  {
    slug: "short-film",
    icon: "Clapperboard",
    accent: "gold" as const,
    title: { ar: "فيلم قصير", en: "Short Film", fr: "Court Métrage" },
    matchingRoles: ["Director", "Cinematographer", "Video Editor"],
    options: {
      filmType: {
        label: { ar: "نوع الفيلم", en: "Film Type", fr: "Type de film" },
        choices: [
          { id: "narrative", label: { ar: "روائي / قصصي", en: "Narrative / Story", fr: "Narratif / Histoire" } },
          { id: "documentary", label: { ar: "وثائقي", en: "Documentary", fr: "Documentaire" } },
          { id: "brand-story", label: { ar: "قصة العلامة التجارية", en: "Brand Story", fr: "Histoire de marque" } },
        ],
      },
      duration: {
        label: { ar: "مدة الفيلم", en: "Film Duration", fr: "Durée du film" },
        choices: [
          { id: "3min", label: { ar: "3 دقائق", en: "3 minutes", fr: "3 minutes" }, price: 20000 },
          { id: "5min", label: { ar: "5 دقائق", en: "5 minutes", fr: "5 minutes" }, price: 30000 },
          { id: "10min", label: { ar: "10 دقائق", en: "10 minutes", fr: "10 minutes" }, price: 50000 },
          { id: "15min", label: { ar: "15 دقيقة", en: "15 minutes", fr: "15 minutes" }, price: 70000 },
          { id: "30min", label: { ar: "30 دقيقة", en: "30 minutes", fr: "30 minutes" }, price: 120000 },
        ],
      },
    },
  },
] as const;

type ServiceSlug = typeof SERVICES[number]["slug"];

// ─── Component ────────────────────────────────────────────────────────────

export const PostProjectWizard = ({
  trigger, clientName = "Client", clientEmail = "", clientWilaya = "",
}: { trigger: React.ReactNode; clientName?: string; clientEmail?: string; clientWilaya?: string }) => {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<typeof SERVICES[number] | null>(null);
  const [selections, setSelections] = useState<Record<string, string | number>>({});
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [wilaya, setWilaya] = useState(clientWilaya || "");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("service"); setSelectedService(null); setSelections({});
    setBrief(""); setDeadline(""); setReferenceLink(""); setSubmitting(false);
    setWilaya(clientWilaya || "");
  };

  // ── Calculate price from selections ──────────────────────────────────────
  const calcTotal = (): number => {
    if (!selectedService) return 0;
    let base = 0;
    const opts = selectedService.options as Record<string, any>;

    for (const [key, opt] of Object.entries(opts)) {
      if (opt.isNumber) continue;
      const chosen = selections[key] as string;
      if (!chosen) continue;
      const found = opt.choices?.find((c: any) => c.id === chosen);
      if (found?.price) base = Math.max(base, found.price);
    }
    if (base === 0) base = 5000; // fallback minimum

    // Multiply by quantity fields
    for (const [key, opt] of Object.entries(opts)) {
      if (!opt.isNumber) continue;
      const qty = (selections[key] as number) || opt.defaultVal || 1;
      base = base * qty;
    }

    return base;
  };

  const total = calcTotal();
  const adminCut = Math.round(total * ADMIN_COMMISSION);
  const payout = total - adminCut;
  const advance = Math.round(total * CLIENT_ADVANCE_PCT);

  // ── Build human-readable summary ─────────────────────────────────────────
  const buildSummary = (): string => {
    if (!selectedService) return "";
    const opts = selectedService.options as Record<string, any>;
    const parts: string[] = [];
    for (const [key, opt] of Object.entries(opts)) {
      if (opt.isNumber) {
        const qty = (selections[key] as number) || opt.defaultVal || 1;
        parts.push(`${qty} ${lang === "ar" ? opt.unitAr : opt.unitEn}`);
      } else {
        const chosen = selections[key] as string;
        if (!chosen) continue;
        const found = opt.choices?.find((c: any) => c.id === chosen);
        if (found) parts.push(found.label[lang] || found.label.en);
      }
    }
    return parts.join(" · ");
  };

  const submit = async () => {
    if (!selectedService) return;
    if (brief.trim().length < 10) { toast.error(lang === "ar" ? "صف مشروعك بتفصيل أكثر." : "Describe your project more."); return; }
    if (!clientEmail) { toast.error(lang === "ar" ? "يجب تسجيل الدخول أولًا." : "Please log in first."); return; }

    setSubmitting(true);
    const summary = buildSummary();
    const fullBrief = summary ? `[${summary}]\n${brief.trim()}` : brief.trim();

    try {
      const payload: Record<string, any> = {
        clientName: clientName || "Client",
        clientEmail,
        serviceSlug: selectedService.slug,
        serviceTitle: selectedService.title[lang],
        units: 1,
        unitLabel: summary,
        totalPrice: total,
        adminCut,
        creatorPayout: payout,
        brief: fullBrief,
        matchingRoles: [...selectedService.matchingRoles],
        advancePaid: false,
        advanceAmount: advance,
        serviceOptions: selections,
      };
      if (wilaya) { payload.clientWilaya = wilaya; payload.wilayaFilter = wilaya; }
      if (referenceLink.trim()) payload.referenceLink = referenceLink.trim();
      if (deadline) payload.deadline = deadline;

      await addOffer(payload as any);
      setStep("payment");
    } catch (err: any) {
      console.error("Offer error:", err);
      toast.error(lang === "ar" ? `فشل الإرسال: ${err?.message || ""}` : `Failed: ${err?.message || ""}`);
    } finally {
      setSubmitting(false);
    }
  };

  const l = (obj: any) => obj?.[lang] ?? obj?.en ?? "";
  const opts = selectedService?.options as Record<string, any> | undefined;
  const allSelected = opts ? Object.entries(opts).every(([k, opt]) => opt.isNumber ? true : !!selections[k]) : false;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {step === "service" && (lang === "ar" ? "ما الذي تريد إنتاجه؟" : "What do you want to produce?")}
            {step === "configure" && selectedService && l(selectedService.title)}
            {step === "brief" && (lang === "ar" ? "أخبرنا أكثر" : "Tell us more")}
            {step === "payment" && (lang === "ar" ? "الدفع المسبق" : "Advance Payment")}
            {step === "done" && (lang === "ar" ? "تم الإرسال" : "Submitted")}
          </DialogTitle>
        </DialogHeader>

        {/* ── STEP 1: Service picker ─────────────────────────────────────── */}
        {step === "service" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SERVICES.map((s) => {
              const Icon = (Icons as any)[s.icon] ?? Icons.Sparkles;
              return (
                <button key={s.slug}
                  onClick={() => {
                    setSelectedService(s as any);
                    // init number fields with defaults
                    const initSel: Record<string, string | number> = {};
                    Object.entries(s.options as any).forEach(([k, opt]: any) => {
                      if (opt.isNumber) initSel[k] = opt.defaultVal ?? 1;
                    });
                    setSelections(initSel);
                    setStep("configure");
                  }}
                  className={`text-left glass rounded-2xl p-4 hover:border-accent/50 transition-smooth flex flex-col gap-2 ${s.accent === "gold" ? "hover:border-accent/50" : "hover:border-primary/50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-semibold text-sm leading-tight">{l(s.title)}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ── STEP 2: Configure options ─────────────────────────────────── */}
        {step === "configure" && selectedService && opts && (
          <div className="space-y-6">
            {Object.entries(opts).map(([key, opt]: [string, any]) => (
              <div key={key}>
                <Label className="font-semibold mb-3 block">{l(opt.label)}</Label>

                {/* Number spinner */}
                {opt.isNumber ? (
                  <div className="flex items-center gap-4">
                    <button onClick={() => setSelections(p => ({ ...p, [key]: Math.max(opt.min, ((p[key] as number) || opt.defaultVal) - 1) }))}
                      className="w-9 h-9 rounded-full glass flex items-center justify-center text-xl font-bold hover:border-accent/50 transition-smooth">−</button>
                    <div className="text-center min-w-[6rem]">
                      <div className="font-serif text-3xl font-bold text-accent">{(selections[key] as number) ?? opt.defaultVal}</div>
                      <div className="text-xs text-muted-foreground">{lang === "ar" ? opt.unitAr : opt.unitEn}</div>
                    </div>
                    <button onClick={() => setSelections(p => ({ ...p, [key]: Math.min(opt.max, ((p[key] as number) || opt.defaultVal) + 1) }))}
                      className="w-9 h-9 rounded-full glass flex items-center justify-center text-xl font-bold hover:border-accent/50 transition-smooth">+</button>
                    <div className="text-xs text-muted-foreground ms-2">{lang === "ar" ? `(${opt.min}–${opt.max})` : `(${opt.min}–${opt.max})`}</div>
                  </div>
                ) : (
                  /* Choice grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {opt.choices.map((c: any) => {
                      const active = selections[key] === c.id;
                      return (
                        <button key={c.id}
                          onClick={() => setSelections(p => ({ ...p, [key]: c.id }))}
                          className={`flex items-center justify-between text-left px-4 py-3 rounded-xl border text-sm transition-smooth ${active ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border glass text-muted-foreground hover:border-accent/40"}`}>
                          <span>{l(c.label)}</span>
                          <div className="flex items-center gap-2 flex-shrink-0 ms-2">
                            {c.price > 0 && <span className={`text-xs font-semibold ${active ? "text-accent" : "text-muted-foreground"}`}>{formatDZD(c.price)}</span>}
                            {active && <Check className="w-4 h-4 text-accent" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}

            {/* Price preview */}
            {total > 0 && (
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">{lang === "ar" ? "التكلفة التقديرية" : "Estimated cost"}</div>
                  <div className="font-serif text-2xl font-bold text-accent">{formatDZD(total)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{buildSummary()}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{lang === "ar" ? "دفع مسبق (10%)" : "Advance (10%)"}</div>
                  <div className="font-semibold text-yellow-400">{formatDZD(advance)}</div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("service")}><ArrowLeft className="w-4 h-4 me-1" />{lang === "ar" ? "رجوع" : "Back"}</Button>
              <Button variant={selectedService.accent === "gold" ? "gold" : "royal"} disabled={!allSelected} onClick={() => setStep("brief")}>
                {lang === "ar" ? "متابعة" : "Continue"} →
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Brief + details ───────────────────────────────────── */}
        {step === "brief" && selectedService && (
          <div className="space-y-5">
            {/* Summary bar */}
            <div className="glass rounded-xl p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground truncate">{l(selectedService.title)} · {buildSummary()}</span>
              <span className="text-accent font-bold flex-shrink-0 ms-2">{formatDZD(total)}</span>
            </div>

            {/* Wilaya */}
            <div>
              <Label className="flex items-center gap-1 mb-1"><MapPin className="w-3.5 h-3.5" />{lang === "ar" ? "موقع المشروع (الولاية) *" : "Project location (Wilaya) *"}</Label>
              <div className="relative">
                <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">— {lang === "ar" ? "اختر الولاية" : "Select wilaya"} —</option>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.nameEn}>{lang === "ar" ? `${w.code}. ${w.name}` : `${w.code}. ${w.nameEn}`}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Brief */}
            <div>
              <Label htmlFor="brief">{lang === "ar" ? "صف مشروعك بتفصيل *" : "Describe your project in detail *"}</Label>
              <Textarea id="brief" rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={2000} className="mt-1"
                placeholder={lang === "ar"
                  ? "مثال: نريد بودكاست مرئي لبرنامج أسبوعي عن ريادة الأعمال في الجزائر. يضم ضيفًا من المجال مع مقدم. أسلوب المحتوى: حواري وتحليلي..."
                  : "e.g. We want a weekly video podcast about entrepreneurship in Algeria, with a guest and host, conversational style..."} />
            </div>

            {/* Reference */}
            <div>
              <Label htmlFor="ref">{lang === "ar" ? "رابط مرجعي (اختياري)" : "Reference link (optional)"}</Label>
              <Input id="ref" type="url" value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)} placeholder="https://..." className="mt-1" />
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline">{lang === "ar" ? "الموعد النهائي (اختياري)" : "Deadline (optional)"}</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("configure")}><ArrowLeft className="w-4 h-4 me-1" />{lang === "ar" ? "رجوع" : "Back"}</Button>
              <Button variant="gold" onClick={submit} disabled={submitting}>
                <Send className="w-4 h-4 me-1" />{submitting ? "..." : lang === "ar" ? "إرسال المشروع" : "Submit Project"}
              </Button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Payment ───────────────────────────────────────────── */}
        {step === "payment" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border border-yellow-400/25">
              <div className="flex items-start gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">{lang === "ar" ? "ادفع 10% مسبقًا لتأكيد مشروعك" : "Pay 10% advance to confirm"}</div>
                  <div className="text-xs text-muted-foreground">{lang === "ar" ? "يضمن جدية الطلب ويحمي حقوق الطرفين." : "Secures your project and protects both parties."}</div>
                </div>
              </div>
              {total > 0 && (
                <div className="mb-4">
                  <div className="text-3xl font-serif font-bold text-yellow-400">{formatDZD(advance)}</div>
                  <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? `من إجمالي ${formatDZD(total)}` : `of total ${formatDZD(total)}`}</div>
                </div>
              )}
              <div className="glass rounded-xl p-4 bg-secondary/20 space-y-1">
                <div className="text-xs font-semibold text-accent">{lang === "ar" ? "الدفع عبر بريدي موب" : "Pay via Baridi Mob"}</div>
                <div className="font-mono text-base font-bold">007999990029553196</div>
                <div className="text-xs text-muted-foreground">{lang === "ar" ? "المفتاح: 73" : "Key: 73"}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {lang === "ar" ? "* يُسترد المبلغ كاملًا إذا لم يتوفر عامل حر في منطقتك." : "* Full refund if no freelancer is found in your area."}
              </p>
            </div>
            <Button variant="royal" className="w-full" onClick={() => setStep("done")}>
              {lang === "ar" ? "تم الدفع — متابعة" : "Payment sent — Continue"}
            </Button>
          </div>
        )}

        {/* ── STEP 5: Done ─────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-18 h-18 w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold">{lang === "ar" ? "تم إرسال مشروعك" : "Project submitted!"}</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {lang === "ar"
                ? "مشروعك في يد الإدارة. بمجرد الموافقة سيُرسل للعمال المتخصصين في ولايتك."
                : "Your project is with our team. Once approved it'll be sent to specialists in your area."}
            </p>
            <Button variant="royal" onClick={() => { setOpen(false); reset(); }}>{lang === "ar" ? "فهمت" : "Got it"}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
