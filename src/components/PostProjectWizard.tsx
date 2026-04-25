import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { OFFERS, ADMIN_COMMISSION, CLIENT_ADVANCE_PCT, formatDZD, type Offer } from "@/lib/offers";
import { addOffer } from "@/lib/store";
import { OfferMap } from "@/components/OfferMap";
import * as Icons from "lucide-react";
import { ArrowLeft, Send, CheckCircle2, Link2, CreditCard, Minus, Plus, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

type Step = "service" | "describe" | "payment" | "done";

const SUGGESTIONS: Record<string, { ar: string[]; en: string[]; fr: string[] }> = {
  "voice-over":      { ar: ["ما اللغة؟", "ما نبرة الصوت؟", "هل تحتاج موسيقى خلفية؟"], en: ["Which language?", "What tone?", "Background music needed?"], fr: ["Quelle langue?", "Quel ton?", "Musique de fond?"] },
  "editing-montage": { ar: ["المنصة المستهدفة؟", "هل تحتاج موشن جرافيك؟", "أي أسلوب مونتاج؟"], en: ["Target platform?", "Motion graphics needed?", "Editing style?"], fr: ["Plateforme cible?", "Motion graphics?", "Style de montage?"] },
  "social-reels":    { ar: ["ما المنتج أو الخدمة؟", "نوع المحتوى (ريل أم UGC)؟", "كم منشور أسبوعيًا؟"], en: ["What product?", "Reel or UGC style?", "Posts per week?"], fr: ["Quel produit?", "Reel ou UGC?", "Posts/semaine?"] },
  "cinematic-ads":   { ar: ["ما المنتج أو القصة؟", "هل لديك نص؟", "داخلي أم خارجي؟"], en: ["Product or story?", "Script ready?", "Indoor or outdoor?"], fr: ["Produit ou histoire?", "Script prêt?", "Intérieur/extérieur?"] },
  "event-coverage":  { ar: ["نوع الفعالية؟", "كم كاميرا؟", "هل تحتاج مقطعًا في نفس اليوم؟"], en: ["Event type?", "How many cameras?", "Same-day edit needed?"], fr: ["Type d'événement?", "Combien de caméras?", "Montage le jour même?"] },
  "photography":     { ar: ["داخلي أم خارجي؟", "ما الغرض؟", "كم جلسة؟"], en: ["Indoor or outdoor?", "Purpose?", "Sessions count?"], fr: ["Intérieur/extérieur?", "Objectif?", "Sessions?"] },
  "ghost-writing":   { ar: ["ما المنصة؟", "ما الأسلوب؟", "هل تحتاج SEO؟"], en: ["Platform?", "Writing style?", "SEO needed?"], fr: ["Plateforme?", "Style?", "SEO requis?"] },
};

export const PostProjectWizard = ({
  trigger, clientName = "Client", clientEmail = "client@example.com", clientWilaya = "",
}: { trigger: React.ReactNode; clientName?: string; clientEmail?: string; clientWilaya?: string }) => {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("service");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [units, setUnits] = useState(1);
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceLink, setReferenceLink] = useState("");

  const pricePerUnit = offer?.pricing.pricePerUnit || 0;
  const minUnits = offer?.pricing.minUnits || 1;
  const maxUnits = offer?.pricing.maxUnits || 20;
  const total = units * pricePerUnit;
  const adminCut = Math.round(total * ADMIN_COMMISSION);
  const payout = total - adminCut;
  const advance = Math.round(total * CLIENT_ADVANCE_PCT);

  const reset = () => { setStep("service"); setOffer(null); setUnits(1); setBrief(""); setDeadline(""); setReferenceLink(""); };

  const pickOffer = (o: Offer) => { setOffer(o); setUnits(o.pricing.minUnits); setStep("describe"); };

  const submit = async () => {
    if (!offer) return;
    if (brief.trim().length < 10) { toast.error(lang === "ar" ? "صف مشروعك أكثر." : "Describe your project more."); return; }

    // Build payload — only include optional fields when they have a value.
    // Firestore (now configured with ignoreUndefinedProperties) tolerates undefined,
    // but we still build a clean object for clarity and to keep clientWilaya tied to a real string.
    const payload: Parameters<typeof addOffer>[0] = {
      clientName,
      clientEmail,
      serviceSlug: offer.slug,
      serviceTitle: offer.title[lang],
      units,
      unitLabel: lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unitLabel,
      totalPrice: total,
      adminCut,
      creatorPayout: payout,
      brief: brief.trim(),
      matchingRoles: offer.matchingRoles,
      advancePaid: false,
      advanceAmount: advance,
    };
    const trimmedRef = referenceLink.trim();
    if (trimmedRef) payload.referenceLink = trimmedRef;
    if (deadline) payload.deadline = deadline;
    if (clientWilaya && clientWilaya.trim()) {
      payload.clientWilaya = clientWilaya.trim();
      payload.wilayaFilter = clientWilaya.trim();
    }

    try {
      await addOffer(payload);
      setStep("payment");
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("[v0] addOffer failed:", err?.code, err?.message, err);
      const detail = err?.message ? ` (${err.code || err.message})` : "";
      toast.error((lang === "ar" ? "حدث خطأ — " : "Error — ") + (err?.code === "permission-denied"
        ? (lang === "ar" ? "صلاحيات Firestore" : "Firestore permissions")
        : (lang === "ar" ? "تعذّر إرسال المشروع" : "could not submit")) + detail);
    }
  };

  const suggestions = offer ? (SUGGESTIONS[offer.slug]?.[lang] || []) : [];
  const unitLabelDisplay = offer ? (lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unitLabel) : "";

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {step === "service" && (lang === "ar" ? "اختر خدمة" : "Pick a service")}
            {step === "describe" && offer?.title[lang]}
            {step === "payment" && (lang === "ar" ? "الدفع المسبق" : "Advance Payment")}
            {step === "done" && (lang === "ar" ? "تم الإرسال" : "Submitted")}
          </DialogTitle>
        </DialogHeader>

        {/* SERVICE PICKER */}
        {step === "service" && (
          <div className="grid grid-cols-2 gap-2">
            {OFFERS.map((o) => {
              const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
              return (
                <button key={o.slug} onClick={() => pickOffer(o)}
                  className="text-left glass rounded-xl p-3 hover:border-accent/50 transition-smooth">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-sm leading-tight">{o.title[lang]}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{o.startingPrice}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* DESCRIBE + DURATION SLIDER */}
        {step === "describe" && offer && (
          <div className="space-y-5">
            {/* Price summary bar */}
            <div className="glass rounded-xl p-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{offer.title[lang]}</span>
              <div className="text-right">
                <div className="text-accent font-bold text-lg">{formatDZD(total)}</div>
                <div className="text-xs text-muted-foreground">{units} {unitLabelDisplay}</div>
              </div>
            </div>

            {/* Duration slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="font-semibold">
                  {lang === "ar" ? `المدة / الكمية` : `Duration / Quantity`}
                </Label>
                <div className="flex items-center gap-2">
                  <button onClick={() => setUnits(u => Math.max(minUnits, u - 1))}
                    className="w-7 h-7 rounded-full glass flex items-center justify-center hover:border-accent/50 transition-smooth">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-bold text-accent min-w-[3rem] text-center">{units} {unitLabelDisplay}</span>
                  <button onClick={() => setUnits(u => Math.min(maxUnits, u + 1))}
                    className="w-7 h-7 rounded-full glass flex items-center justify-center hover:border-accent/50 transition-smooth">
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <Slider
                min={minUnits} max={maxUnits} step={1}
                value={[units]}
                onValueChange={(v) => setUnits(v[0])}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatDZD(minUnits * pricePerUnit)}</span>
                <span className="text-accent font-semibold">{formatDZD(pricePerUnit)} / {unitLabelDisplay}</span>
                <span>{formatDZD(maxUnits * pricePerUnit)}</span>
              </div>
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {lang === "ar" ? "أجب عن هذه الأسئلة في وصفك:" : "Answer these in your description:"}
                </p>
                {suggestions.map((s, i) => (
                  <div key={i} className="text-xs glass rounded-lg px-3 py-1.5 text-muted-foreground">• {s}</div>
                ))}
              </div>
            )}

            {/* Brief */}
            <div>
              <Label htmlFor="brief">{lang === "ar" ? "صف مشروعك *" : "Project description *"}</Label>
              <Textarea id="brief" rows={4} value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={1500} className="mt-1"
                placeholder={lang === "ar" ? "كن تفصيليًا — المنتج، الجمهور، الأسلوب، المراجع..." : "Be detailed — product, audience, style, references..."} />
            </div>

            {/* Reference link */}
            <div>
              <Label htmlFor="refLink" className="flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" />{lang === "ar" ? "رابط مرجعي (اختياري)" : "Reference link (optional)"}
              </Label>
              <Input id="refLink" type="url" value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://drive.google.com/..." className="mt-1" />
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline">{lang === "ar" ? "الموعد النهائي (اختياري)" : "Deadline (optional)"}</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
            </div>

            {/* Location map preview */}
            <div>
              <Label className="flex items-center gap-1 mb-2">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                {lang === "ar" ? "موقع المشروع" : "Project location"}
              </Label>
              {clientWilaya ? (
                <>
                  <div className="text-xs text-muted-foreground mb-2">
                    {lang === "ar" ? "📍 سيُعرض المشروع للعمال في" : "📍 Visible to creators in"}{" "}
                    <span className="text-accent font-semibold">{clientWilaya}</span>
                  </div>
                  <OfferMap wilaya={clientWilaya} className="border border-border/40" />
                </>
              ) : (
                <div className="glass rounded-xl p-3 text-xs text-muted-foreground border border-yellow-400/20">
                  {lang === "ar"
                    ? "لم تحدد ولايتك في ملفك الشخصي — سيُنشر المشروع بدون موقع. يمكنك إضافة الولاية من تبويب «ملفي»."
                    : "No wilaya on your profile — the project will be posted without a location. Add your wilaya from the Profile tab."}
                </div>
              )}
            </div>

            <div className="flex justify-between pt-1">
              <Button variant="ghost" onClick={() => setStep("service")}><ArrowLeft className="w-4 h-4 me-1" />{lang === "ar" ? "رجوع" : "Back"}</Button>
              <Button variant="gold" onClick={submit}><Send className="w-4 h-4 me-1" />{lang === "ar" ? "إرسال" : "Send"}</Button>
            </div>
          </div>
        )}

        {/* PAYMENT */}
        {step === "payment" && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-5 border border-yellow-400/25">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{lang === "ar" ? "ادفع 10% مسبقًا لتأكيد مشروعك" : "Pay 10% advance to confirm"}</div>
                  <div className="text-xs text-muted-foreground">{lang === "ar" ? "يحمي حقوق الطرفين." : "Protects both parties."}</div>
                </div>
              </div>
              {total > 0 && <div className="text-3xl font-serif font-bold text-yellow-400 mb-4">{formatDZD(advance)}</div>}
              <div className="glass rounded-xl p-3 bg-secondary/20 space-y-2">
                <div className="text-xs font-semibold text-accent">{lang === "ar" ? "الدفع عبر بريدي موب" : "Pay via Baridi Mob"}</div>
                <div className="font-mono text-sm font-bold">007999990029553196</div>
                <div className="text-xs text-muted-foreground">{lang === "ar" ? "المفتاح: 73" : "Key: 73"}</div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {lang === "ar" ? "* استرداد كامل إذا لم يتوفر عامل." : "* Full refund if no freelancer found."}
              </p>
            </div>
            <Button variant="royal" className="w-full" onClick={() => setStep("done")}>
              {lang === "ar" ? "تم الدفع — متابعة" : "Payment sent — Continue"}
            </Button>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-gold flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="font-serif text-xl font-bold">{lang === "ar" ? "تم إرسال مشروعك" : "Project submitted!"}</h3>
            <p className="text-muted-foreground text-sm">{lang === "ar" ? "مشروعك في يد الإدارة وسيُرسل لعمال في منطقتك." : "Your project is with our team and will be sent to freelancers in your area."}</p>
            <Button variant="royal" onClick={() => { setOpen(false); reset(); }}>{lang === "ar" ? "فهمت" : "Got it"}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
