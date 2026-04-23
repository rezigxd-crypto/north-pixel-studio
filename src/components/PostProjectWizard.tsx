import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OFFERS, ADMIN_COMMISSION, CLIENT_ADVANCE_PCT, formatDZD, type Offer } from "@/lib/offers";
import { addOffer } from "@/lib/store";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Send, CheckCircle2, Link2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

type Step = "service" | "describe" | "payment" | "done";

// Suggestion prompts per service slug
const SUGGESTIONS: Record<string, { ar: string[]; en: string[]; fr: string[] }> = {
  "voice-over":     { ar: ["كم دقيقة التعليق الصوتي؟", "ما اللغة المطلوبة؟", "ما نبرة الصوت؟ (رسمي / ودي / مثير)"], en: ["How many minutes?", "Which language?", "Tone? (formal / friendly / exciting)"], fr: ["Combien de minutes?", "Quelle langue?", "Ton? (formel / amical / dynamique)"] },
  "editing-montage":{ ar: ["كم دقيقة الفيديو النهائي؟", "هل تحتاج موشن جرافيك؟", "ما المنصة المستهدفة؟"], en: ["How long is the final video?", "Need motion graphics?", "Target platform?"], fr: ["Durée de la vidéo finale?", "Motion graphics requis?", "Plateforme cible?"] },
  "social-reels":   { ar: ["كم ريل تحتاج؟", "ما المنتج أو الخدمة؟", "نوع المحتوى؟ (كوميدي / تعليمي / إعلاني)"], en: ["How many reels?", "What product/service?", "Style? (comedy / educational / ads)"], fr: ["Combien de reels?", "Quel produit?", "Style?"] },
  "photography":    { ar: ["كم صورة تحتاج؟", "داخلي أم خارجي؟", "ما الغرض من الصور؟"], en: ["How many photos?", "Indoor or outdoor?", "Purpose of photos?"], fr: ["Combien de photos?", "Intérieur ou extérieur?", "Objectif des photos?"] },
  "cinematic-ads":  { ar: ["كم يوم تصوير تحتاج؟", "ما المنتج أو الخدمة المراد الإعلان عنها؟", "هل لديك نص إعلاني؟"], en: ["How many shoot days?", "What product to advertise?", "Do you have a script?"], fr: ["Combien de jours de tournage?", "Quel produit?", "Avez-vous un script?"] },
  "event-coverage": { ar: ["كم ساعة الفعالية؟", "نوع الفعالية؟ (مؤتمر / عرس / معرض)", "هل تحتاج طائرة مسيّرة؟"], en: ["Event duration?", "Type? (conference / wedding / expo)", "Need drone shots?"], fr: ["Durée?", "Type d'événement?", "Drone requis?"] },
  "ghost-writing":  { ar: ["كم مقال أو سيناريو؟", "ما الأسلوب المطلوب؟", "ما المنصة؟ (إنستغرام / لينكدإن / يوتيوب)"], en: ["How many pieces?", "What writing style?", "Platform?"], fr: ["Combien de pièces?", "Style d'écriture?", "Plateforme?"] },
  "ugc-content":    { ar: ["كم مقطع تحتاج؟", "ما المنتج؟", "أسلوب؟ (تجريب / شهادة / أنباكسينج)"], en: ["How many clips?", "What product?", "Style? (review / testimonial / unboxing)"], fr: ["Combien de clips?", "Quel produit?", "Style?"] },
  "short-movie":    { ar: ["كم دقيقة الفيلم؟", "ما نوع القصة؟", "هل لديك سيناريو؟"], en: ["How long is the film?", "What genre?", "Do you have a script?"], fr: ["Durée?", "Genre?", "Vous avez un script?"] },
  "political-coverage": { ar: ["نوع الفعالية؟", "كم يوم التغطية؟", "هل تحتاج مونتاج في نفس اليوم؟"], en: ["Event type?", "Coverage days?", "Same-day edit?"], fr: ["Type d'événement?", "Jours de couverture?", "Montage le jour même?"] },
};

export const PostProjectWizard = ({
  trigger, clientName = "Client", clientEmail = "client@example.com", clientWilaya = "",
}: { trigger: React.ReactNode; clientName?: string; clientEmail?: string; clientWilaya?: string }) => {
  const { lang } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("service");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [duration, setDuration] = useState("");       // free-form duration text
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceLink, setReferenceLink] = useState("");

  // We compute an estimated total based on a sensible parse of duration
  // But we don't show the admin cut to the client at all
  const parsedUnits = Math.max(1, parseInt(duration) || 1);
  const pricePerUnit = offer?.pricing.pricePerUnit || 0;
  const total = parsedUnits * pricePerUnit;
  const adminCut = Math.round(total * ADMIN_COMMISSION);
  const payout = total - adminCut;
  const advance = Math.round(total * CLIENT_ADVANCE_PCT);

  const reset = () => { setStep("service"); setOffer(null); setDuration(""); setBrief(""); setDeadline(""); setReferenceLink(""); };

  const submit = async () => {
    if (!offer) return;
    if (brief.trim().length < 10) { toast.error(lang === "ar" ? "صف مشروعك بتفصيل أكثر." : "Describe your project in more detail."); return; }
    try {
      await addOffer({
        clientName, clientEmail, clientWilaya: clientWilaya || undefined,
        serviceSlug: offer.slug,
        serviceTitle: offer.title[lang],
        units: parsedUnits,
        unitLabel: lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unitLabel,
        totalPrice: total, adminCut, creatorPayout: payout,
        brief: (duration ? `[${duration}]\n` : "") + brief.trim(),
        referenceLink: referenceLink.trim() || undefined,
        deadline: deadline || undefined,
        matchingRoles: offer.matchingRoles,
        wilayaFilter: clientWilaya || undefined,
        advancePaid: false, advanceAmount: advance,
      });
      setStep("payment");
    } catch { toast.error(lang === "ar" ? "حدث خطأ. حاول مرة أخرى." : "Error. Please try again."); }
  };

  const suggestions = offer ? (SUGGESTIONS[offer.slug]?.[lang] || []) : [];

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {step === "service" && (lang === "ar" ? "اختر خدمة" : "Pick a service")}
            {step === "describe" && offer?.title[lang]}
            {step === "payment" && (lang === "ar" ? "الدفع المسبق" : "Advance Payment")}
            {step === "done" && (lang === "ar" ? "تم الإرسال ✓" : "Submitted ✓")}
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1 — pick service */}
        {step === "service" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {OFFERS.map((o) => {
              const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
              return (
                <button key={o.slug} onClick={() => { setOffer(o); setStep("describe"); }}
                  className="text-left glass rounded-2xl p-4 hover:border-accent/50 transition-smooth">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-sm">{o.title[lang]}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.startingPrice}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2 — describe project */}
        {step === "describe" && offer && (
          <div className="space-y-5">
            <div className="glass rounded-xl px-4 py-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{offer.title[lang]}</span>
              <span className="text-xs text-accent">{offer.startingPrice}</span>
            </div>

            {/* Duration — free form */}
            <div>
              <Label htmlFor="duration">
                {lang === "ar" ? "المدة / الكمية (مثال: 3 دقائق، يومان، 5 صور)" :
                 lang === "fr" ? "Durée / Quantité (ex: 3 minutes, 2 jours, 5 photos)" :
                 "Duration / Quantity (e.g. 3 minutes, 2 days, 5 photos)"}
              </Label>
              <Input id="duration" value={duration} onChange={(e) => setDuration(e.target.value)}
                placeholder={lang === "ar" ? "اكتب ما تريد بدون قيود..." : "Describe duration freely..."}
                className="mt-1" />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  {lang === "ar" ? "💡 أسئلة مقترحة — أجب عنها في وصفك:" : "💡 Suggested questions — answer in your description:"}
                </p>
                <div className="flex flex-col gap-1">
                  {suggestions.map((s, i) => (
                    <div key={i} className="text-xs glass rounded-lg px-3 py-2 text-muted-foreground">• {s}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Brief */}
            <div>
              <Label htmlFor="brief">
                {lang === "ar" ? "صف لنا ما الذي تريده *" : lang === "fr" ? "Décrivez votre projet *" : "Describe what you want *"}
              </Label>
              <Textarea id="brief" rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={1500}
                placeholder={lang === "ar" ? "كن تفصيليًا قدر الإمكان — المنتج، الجمهور، الأسلوب، المراجع..." : "Be as detailed as possible — product, audience, style, references..."} />
            </div>

            {/* Reference link */}
            <div>
              <Label htmlFor="refLink" className="flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" />
                {lang === "ar" ? "رابط مرجعي (اختياري)" : "Reference link (optional)"}
              </Label>
              <Input id="refLink" type="url" value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://drive.google.com/... or YouTube link" className="mt-1" />
            </div>

            {/* Deadline */}
            <div>
              <Label htmlFor="deadline">{lang === "ar" ? "الموعد النهائي (اختياري)" : "Deadline (optional)"}</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("service")}><ArrowLeft className="w-4 h-4" /> {lang === "ar" ? "رجوع" : "Back"}</Button>
              <Button variant="gold" onClick={submit}><Send className="w-4 h-4" /> {lang === "ar" ? "إرسال" : "Send"}</Button>
            </div>
          </div>
        )}

        {/* STEP 3 — advance payment (no 20% mention) */}
        {step === "payment" && (
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5 border border-yellow-400/25">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="font-semibold">
                    {lang === "ar" ? "ادفع 10% مسبقًا لتأكيد مشروعك" : "Pay 10% advance to confirm your project"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "ar" ? "يضمن هذا جدية الطلب ويحفظ حق الطرفين." : "This secures your project and protects both parties."}
                  </div>
                </div>
              </div>
              {total > 0 && <div className="text-3xl font-serif font-bold text-yellow-400 mb-3">{formatDZD(advance)}</div>}
              <div className="glass rounded-xl p-4 bg-secondary/20 space-y-2 text-sm">
                <div className="font-semibold text-accent">{lang === "ar" ? "الدفع عبر بريدي موب" : "Pay via Baridi Mob"}</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/25 flex items-center justify-center text-yellow-400 font-bold text-xs flex-shrink-0">CCP</div>
                  <div>
                    <div className="font-mono text-sm font-semibold">007999990029553196</div>
                    <div className="text-xs text-muted-foreground">{lang === "ar" ? "المفتاح: 73" : "Key: 73"}</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {lang === "ar" ? "* إذا لم يتوفر عامل حر في منطقتك، يُسترد المبلغ كاملًا." : "* Full refund if no freelancer is found in your area."}
              </p>
            </div>
            <Button variant="royal" className="w-full" onClick={() => setStep("done")}>
              {lang === "ar" ? "تم الدفع — المتابعة ✓" : "Payment sent — Continue ✓"}
            </Button>
          </div>
        )}

        {/* STEP 4 — done */}
        {step === "done" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold">{lang === "ar" ? "تم إرسال مشروعك!" : "Project submitted!"}</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {lang === "ar" ? "مشروعك في يد الإدارة. بمجرد الموافقة سيُرسل لعمال حرين متخصصين في ولايتك." : "Your project is with our team. Once approved it'll be sent to matching freelancers in your area."}
            </p>
            <Button variant="royal" onClick={() => { setOpen(false); reset(); }}>{lang === "ar" ? "فهمت" : "Got it"}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
