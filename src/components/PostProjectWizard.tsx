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
import { ArrowLeft, Send, CheckCircle2, CreditCard, MapPin, ChevronDown, Check, Phone, Hash, Shield, CalendarClock, FileText, Loader2, Upload, X, Mic2 } from "lucide-react";
import { uploadProjectScript } from "@/lib/storage";
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
  {
    slug: "voice-over",
    icon: "Mic2",
    accent: "gold" as const,
    title: { ar: "تسجيل صوتي / تعليق", en: "Voice-Over", fr: "Voix-Off" },
    matchingRoles: ["Voice-Over Artist"],
    options: {
      useCase: {
        label: { ar: "نوع التسجيل", en: "Use case", fr: "Type" },
        choices: [
          { id: "ad", label: { ar: "إعلان (TVC / راديو)", en: "Ad (TVC / radio)", fr: "Pub (TVC / radio)" } },
          { id: "video", label: { ar: "تعليق على فيديو", en: "Video commentary", fr: "Commentaire vidéo" } },
          { id: "ugc", label: { ar: "محتوى UGC", en: "UGC content", fr: "Contenu UGC" } },
          { id: "explainer", label: { ar: "فيديو شرحي", en: "Explainer video", fr: "Vidéo explicative" } },
          { id: "documentary", label: { ar: "وثائقي / تعليق سرد", en: "Documentary narration", fr: "Narration documentaire" } },
          { id: "dubbing", label: { ar: "دبلجة", en: "Dubbing", fr: "Doublage" } },
          { id: "ivr", label: { ar: "نظام مكالمات (IVR)", en: "IVR / phone system", fr: "Serveur vocal (IVR)" } },
          { id: "audiobook", label: { ar: "كتاب صوتي", en: "Audiobook", fr: "Livre audio" } },
        ],
      },
      length: {
        label: { ar: "مدة / طول النص", en: "Length", fr: "Longueur" },
        choices: [
          { id: "30s", label: { ar: "حتى 30 ثانية", en: "Up to 30 seconds", fr: "Jusqu'à 30 sec" }, price: 3000 },
          { id: "60s", label: { ar: "حتى 60 ثانية", en: "Up to 60 seconds", fr: "Jusqu'à 60 sec" }, price: 5000 },
          { id: "2min", label: { ar: "حتى 2 دقيقة", en: "Up to 2 minutes", fr: "Jusqu'à 2 min" }, price: 8000 },
          { id: "5min", label: { ar: "حتى 5 دقائق", en: "Up to 5 minutes", fr: "Jusqu'à 5 min" }, price: 14000 },
          { id: "10min", label: { ar: "حتى 10 دقائق", en: "Up to 10 minutes", fr: "Jusqu'à 10 min" }, price: 22000 },
          { id: "long", label: { ar: "أكثر من 10 دقائق", en: "More than 10 minutes", fr: "Plus de 10 min" }, price: 35000 },
        ],
      },
      language: {
        label: { ar: "اللغة المطلوبة", en: "Language", fr: "Langue" },
        choices: [
          { id: "ar-fos7a", label: { ar: "العربية الفصحى", en: "Modern Standard Arabic", fr: "Arabe standard" } },
          { id: "ar-dz", label: { ar: "الدارجة الجزائرية", en: "Algerian Darija", fr: "Darija algérienne" } },
          { id: "fr", label: { ar: "الفرنسية", en: "French", fr: "Français" } },
          { id: "en", label: { ar: "الإنجليزية", en: "English", fr: "Anglais" } },
          { id: "tamazight", label: { ar: "الأمازيغية", en: "Tamazight", fr: "Tamazight" } },
          { id: "multi", label: { ar: "أكثر من لغة", en: "Multiple languages", fr: "Plusieurs langues" } },
        ],
      },
      tone: {
        label: { ar: "نبرة الأداء", en: "Tone", fr: "Ton" },
        choices: [
          { id: "energetic", label: { ar: "حماسية", en: "Energetic", fr: "Énergique" } },
          { id: "warm", label: { ar: "دافئة / ودودة", en: "Warm / friendly", fr: "Chaleureux" } },
          { id: "corporate", label: { ar: "رسمية", en: "Corporate / formal", fr: "Corporate" } },
          { id: "dramatic", label: { ar: "درامية", en: "Dramatic", fr: "Dramatique" } },
          { id: "narrator", label: { ar: "راوي / حكواتي", en: "Narrator", fr: "Narrateur" } },
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
  const [shootAddress, setShootAddress] = useState("");
  const [preferredShootDate, setPreferredShootDate] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [deliverableCount, setDeliverableCount] = useState(1);
  const [usageRights, setUsageRights] = useState<"personal" | "commercial" | "broadcast">("personal");
  const [voiceGender, setVoiceGender] = useState<"male" | "female" | "any">("any");
  const [scriptFile, setScriptFile] = useState<File | null>(null);
  const [scriptUploading, setScriptUploading] = useState(false);
  const [scriptUrl, setScriptUrl] = useState<string>("");
  const [scriptName, setScriptName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setStep("service"); setSelectedService(null); setSelections({});
    setBrief(""); setDeadline(""); setReferenceLink(""); setSubmitting(false);
    setWilaya(clientWilaya || "");
    setShootAddress(""); setPreferredShootDate(""); setClientPhone("");
    setDeliverableCount(1); setUsageRights("personal");
    setVoiceGender("any"); setScriptFile(null); setScriptUrl(""); setScriptName(""); setScriptUploading(false);
  };

  const needsVoice = !!selectedService && selectedService.matchingRoles.includes("Voice-Over Artist");

  const handleScriptUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error(lang === "ar" ? "جرب ملف PDF فقط." : lang === "fr" ? "Uniquement des fichiers PDF." : "Only PDF files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(lang === "ar" ? "حجم الملف يجب أن يكون أقل من 10 ميغا." : "PDF must be under 10 MB.");
      return;
    }
    setScriptFile(file);
    setScriptUploading(true);
    try {
      const result = await uploadProjectScript(clientEmail || "anon", file);
      setScriptUrl(result.url);
      setScriptName(result.fileName || file.name);
      toast.success(lang === "ar" ? "تم رفع السيناريو" : lang === "fr" ? "Script téléversé" : "Script uploaded");
    } catch (err: any) {
      console.error("Script upload error:", err);
      toast.error(err?.message || (lang === "ar" ? "فشل الرفع. حاول مرة أخرى." : "Upload failed. Try again."));
      setScriptFile(null);
    } finally {
      setScriptUploading(false);
    }
  };

  const removeScript = () => {
    setScriptFile(null);
    setScriptUrl("");
    setScriptName("");
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
      if (shootAddress.trim()) payload.shootAddress = shootAddress.trim();
      if (preferredShootDate) payload.preferredShootDate = preferredShootDate;
      if (clientPhone.trim()) payload.clientPhone = clientPhone.trim();
      if (deliverableCount > 0) payload.deliverableCount = deliverableCount;
      payload.usageRights = usageRights;
      if (needsVoice) {
        payload.voiceGender = voiceGender;
        if (scriptUrl) {
          payload.scriptUrl = scriptUrl;
          payload.scriptName = scriptName || "script.pdf";
        }
      }

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

            {/* Detailed shoot address */}
            <div>
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {lang === "ar" ? "عنوان التصوير الدقيق (اختياري)" : "Detailed shoot address (optional)"}
              </Label>
              <Input
                id="address"
                value={shootAddress}
                onChange={(e) => setShootAddress(e.target.value)}
                placeholder={lang === "ar" ? "الحي، الشارع، رقم العمارة…" : "Neighborhood, street, building number…"}
                className="mt-1"
              />
            </div>

            {/* Phone for direct coordination */}
            <div>
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {lang === "ar" ? "رقم هاتفك (يُشارُ فقط مع المبدع المختار)" : "Your phone (only shared with the chosen creator)"}
              </Label>
              <Input
                id="phone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+213 XXX XXX XXX"
                className="mt-1"
              />
            </div>

            {/* Preferred shoot date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="shootDate" className="flex items-center gap-1">
                  <CalendarClock className="w-3.5 h-3.5" />
                  {lang === "ar" ? "تاريخ التصوير المقترح" : "Preferred shoot date"}
                </Label>
                <Input id="shootDate" type="date" value={preferredShootDate} onChange={(e) => setPreferredShootDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="deadline">{lang === "ar" ? "الموعد النهائي للتسليم" : "Final delivery deadline"}</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
              </div>
            </div>

            {/* Deliverable count */}
            <div>
              <Label htmlFor="count" className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" />
                {lang === "ar" ? "عدد التسليمات المتوقعة" : "Number of expected deliverables"}
              </Label>
              <Input
                id="count" type="number" min={1} max={50} value={deliverableCount}
                onChange={(e) => setDeliverableCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="mt-1 max-w-[160px]"
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                {lang === "ar"
                  ? "مثال: 3 فيديوهات قصيرة، أو 10 صور معدّلة."
                  : "e.g. 3 short videos, or 10 edited photos."}
              </p>
            </div>

            {/* Usage rights */}
            <div>
              <Label className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                {lang === "ar" ? "حقوق الاستخدام" : "Usage rights"}
              </Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {([
                  { id: "personal", ar: "شخصي", en: "Personal" },
                  { id: "commercial", ar: "تجاري", en: "Commercial" },
                  { id: "broadcast", ar: "إذاعي", en: "Broadcast" },
                ] as const).map((u) => (
                  <button key={u.id} type="button" onClick={() => setUsageRights(u.id)}
                    className={`px-3 py-2 rounded-lg border text-xs transition-smooth ${usageRights === u.id ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border glass text-muted-foreground hover:border-accent/40"}`}>
                    {lang === "ar" ? u.ar : u.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice-over specific block */}
            {needsVoice && (
              <div className="glass rounded-2xl p-4 space-y-4 border border-accent/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-royal flex items-center justify-center ring-1 ring-accent/30">
                    <Mic2 className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{lang === "ar" ? "تفاصيل التسجيل الصوتي" : lang === "fr" ? "Détails de la voix-off" : "Voice-over details"}</div>
                    <div className="text-[11px] text-muted-foreground">{lang === "ar" ? "تساعد المؤديين على فهم احتياجاتك بدقة." : lang === "fr" ? "Aide les artistes à proposer le bon ton." : "Helps voice artists pitch the right tone."}</div>
                  </div>
                </div>

                {/* Voice gender */}
                <div>
                  <Label className="mb-2 block text-xs">{lang === "ar" ? "نوع الصوت المطلوب" : lang === "fr" ? "Genre de voix souhaité" : "Voice gender"}</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { id: "male", ar: "ذكر", en: "Male", fr: "Homme" },
                      { id: "female", ar: "أنثى", en: "Female", fr: "Femme" },
                      { id: "any", ar: "لا تفضيل", en: "No preference", fr: "Indifférent" },
                    ] as const).map((g) => (
                      <button key={g.id} type="button" onClick={() => setVoiceGender(g.id)}
                        className={`px-3 py-2 rounded-lg border text-xs transition-smooth ${voiceGender === g.id ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border glass text-muted-foreground hover:border-accent/40"}`}>
                        {lang === "ar" ? g.ar : lang === "fr" ? g.fr : g.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Script PDF */}
                <div>
                  <Label className="mb-2 block text-xs flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" />
                    {lang === "ar" ? "السيناريو (PDF — اختياري، 10 ميغا كحد أقصى)" : lang === "fr" ? "Script (PDF — optionnel, 10 Mo max)" : "Script (PDF — optional, 10 MB max)"}
                  </Label>
                  {!scriptUrl && !scriptUploading && (
                    <label className="block">
                      <div className="glass border border-dashed border-accent/30 rounded-xl p-5 text-center cursor-pointer hover:border-accent/60 hover:bg-accent/5 transition-smooth">
                        <Upload className="w-5 h-5 text-accent mx-auto mb-2" />
                        <div className="text-sm font-medium">{lang === "ar" ? "اضغط لرفع PDF" : lang === "fr" ? "Cliquez pour téléverser un PDF" : "Tap to upload a PDF"}</div>
                        <div className="text-[11px] text-muted-foreground mt-1">{lang === "ar" ? "يبقى خاصًا حتى يقبل المؤدي المختار" : lang === "fr" ? "Privé jusqu'à l'acceptation de l'artiste" : "Private until the chosen artist is accepted"}</div>
                      </div>
                      <input
                        type="file" accept="application/pdf" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleScriptUpload(f); e.target.value = ""; }}
                      />
                    </label>
                  )}
                  {scriptUploading && (
                    <div className="glass border border-accent/30 rounded-xl p-4 flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{scriptFile?.name || "script.pdf"}</div>
                        <div className="text-[11px] text-muted-foreground">{lang === "ar" ? "جارٍ الرفع…" : lang === "fr" ? "Téléversement…" : "Uploading…"}</div>
                      </div>
                    </div>
                  )}
                  {scriptUrl && !scriptUploading && (
                    <div className="glass border border-accent/30 rounded-xl p-3 flex items-center gap-3 bg-accent/5">
                      <div className="w-9 h-9 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a href={scriptUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent hover:text-accent/80 truncate block">{scriptName || "script.pdf"}</a>
                        <div className="text-[11px] text-muted-foreground">{lang === "ar" ? "تم الرفع — اضغط الاسم للمعاينة" : lang === "fr" ? "Téléversé — cliquez pour voir" : "Uploaded — tap name to preview"}</div>
                      </div>
                      <button type="button" onClick={removeScript} className="p-2 hover:bg-destructive/15 rounded-md text-muted-foreground hover:text-destructive transition-smooth flex-shrink-0">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("configure")}><ArrowLeft className="w-4 h-4 me-1" />{lang === "ar" ? "رجوع" : "Back"}</Button>
              <Button variant="gold" onClick={submit} disabled={submitting || scriptUploading}>
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
