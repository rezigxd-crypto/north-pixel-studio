import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OFFERS, ADMIN_COMMISSION, CLIENT_ADVANCE_PCT, formatDZD, type Offer } from "@/lib/offers";
import { addOffer } from "@/lib/store";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Send, CheckCircle2, Link2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

type Step = "service" | "price" | "brief" | "payment" | "done";

export const PostProjectWizard = ({
  trigger, clientName = "Client", clientEmail = "client@example.com", clientWilaya = "",
}: { trigger: React.ReactNode; clientName?: string; clientEmail?: string; clientWilaya?: string }) => {
  const { t, lang } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("service");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [units, setUnits] = useState(0);
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");
  const [referenceLink, setReferenceLink] = useState("");

  const total = offer ? units * offer.pricing.pricePerUnit : 0;
  const adminCut = Math.round(total * ADMIN_COMMISSION);
  const payout = total - adminCut;
  const advance = Math.round(total * CLIENT_ADVANCE_PCT);

  const reset = () => { setStep("service"); setOffer(null); setUnits(0); setBrief(""); setDeadline(""); setReferenceLink(""); };

  const pickOffer = (o: Offer) => { setOffer(o); setUnits(o.pricing.minUnits); setStep("price"); };

  const submit = async () => {
    if (!offer) return;
    if (brief.trim().length < 10) { toast.error(lang === "ar" ? "صف مشروعك بشكل أكثر تفصيلًا." : "Describe your project in more detail."); return; }
    try {
      await addOffer({
        clientName, clientEmail, clientWilaya: clientWilaya || undefined,
        serviceSlug: offer.slug,
        serviceTitle: offer.title[lang],
        units,
        unitLabel: lang === "ar" ? offer.pricing.unitLabelAr : units === 1 ? offer.pricing.unitLabel : offer.pricing.unitLabelPlural,
        totalPrice: total, adminCut, creatorPayout: payout,
        brief: brief.trim(), referenceLink: referenceLink.trim() || undefined,
        deadline: deadline || undefined,
        matchingRoles: offer.matchingRoles,
        wilayaFilter: clientWilaya || undefined,
        advancePaid: false, advanceAmount: advance,
      });
      setStep("payment");
    } catch { toast.error("حدث خطأ. حاول مرة أخرى."); }
  };

  const titleStep = () => {
    if (step === "service") return lang === "ar" ? "اختر خدمة" : t("pickService");
    if (step === "price") return offer?.title[lang] || "";
    if (step === "brief") return lang === "ar" ? "صف مشروعك" : t("tellAboutProject");
    if (step === "payment") return lang === "ar" ? "الدفع المسبق" : "Advance Payment";
    return lang === "ar" ? "تم الإرسال" : t("sentForReview");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">{titleStep()}</DialogTitle>
        </DialogHeader>

        {/* STEP 1: pick service */}
        {step === "service" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {OFFERS.map((o) => {
              const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
              return (
                <button key={o.slug} onClick={() => pickOffer(o)} className="text-left glass rounded-2xl p-4 hover:border-accent/50 transition-smooth">
                  <div className="relative h-24 rounded-xl overflow-hidden mb-3">
                    <img src={o.image} alt={o.title[lang]} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
                    <div className={`absolute bottom-2 ${lang === "ar" ? "right-2" : "left-2"} w-8 h-8 rounded-lg flex items-center justify-center ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="font-semibold text-sm">{o.title[lang]}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.startingPrice}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2: price slider */}
        {step === "price" && offer && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("estimatedTotal")}</span>
                <span className="text-xs text-muted-foreground">{formatDZD(offer.pricing.pricePerUnit)} / {lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unit}</span>
              </div>
              <div className="font-serif text-4xl font-bold text-gradient-gold">{formatDZD(total)}</div>
              <div className="text-sm text-muted-foreground mt-1">{units} {lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unitLabel}</div>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-xs">
                <div><div className="text-muted-foreground">{t("yourCut")} (20%)</div><div className="font-semibold text-accent">{formatDZD(adminCut)}</div></div>
                <div><div className="text-muted-foreground">{lang === "ar" ? "دفع مسبق (10%)" : "Advance (10%)"}</div><div className="font-semibold text-yellow-400">{formatDZD(advance)}</div></div>
                <div><div className="text-muted-foreground">{t("creatorPayout")}</div><div className="font-semibold">{formatDZD(payout)}</div></div>
              </div>
            </div>
            <div>
              <Label className="mb-3 block">{t("adjustQty")} ({offer.pricing.minUnits}–{offer.pricing.maxUnits} {lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unitLabelPlural})</Label>
              <Slider min={offer.pricing.minUnits} max={offer.pricing.maxUnits} step={1} value={[units]} onValueChange={(v) => setUnits(v[0])} />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{offer.pricing.minUnits} ({lang === "ar" ? "الحد الأدنى" : "min"})</span>
                <span>{offer.pricing.maxUnits}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("service")}><ArrowLeft className="w-4 h-4" /> {t("back")}</Button>
              <Button variant="royal" onClick={() => setStep("brief")}>{t("continue")} <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {/* STEP 3: brief */}
        {step === "brief" && offer && (
          <div className="space-y-5">
            <div className="glass rounded-xl p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{offer.title[lang]} · {units} {lang === "ar" ? offer.pricing.unitLabelAr : offer.pricing.unitLabel}</span>
              <span className="font-semibold text-accent">{formatDZD(total)}</span>
            </div>
            <div>
              <Label htmlFor="brief">{lang === "ar" ? "صف لنا ما الذي تريده *" : t("projectBrief")}</Label>
              <Textarea id="brief" rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={1000}
                placeholder={lang === "ar" ? "ما الذي تريد إنتاجه؟ لمن؟ أي مراجع أو توجه أو لغات أو مواقع..." : "What are you trying to create? Who is it for? References, tone, languages…"} />
            </div>
            <div>
              <Label htmlFor="refLink" className="flex items-center gap-2"><Link2 className="w-4 h-4" /> {lang === "ar" ? "رابط مرجعي (اختياري)" : "Reference link (optional)"}</Label>
              <Input id="refLink" type="url" value={referenceLink} onChange={(e) => setReferenceLink(e.target.value)} placeholder="https://drive.google.com/... أو أي رابط" />
              <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "مشاركة مثال، رابط Google Drive، PDF، أو أي شيء يوضح ما تريد." : "Share an example, Google Drive link, PDF, or anything that clarifies your vision."}</p>
            </div>
            <div>
              <Label htmlFor="deadline">{t("deadline")}</Label>
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("price")}><ArrowLeft className="w-4 h-4" /> {t("back")}</Button>
              <Button variant="gold" onClick={submit}><Send className="w-4 h-4" /> {t("sendToNP")}</Button>
            </div>
          </div>
        )}

        {/* STEP 4: advance payment info */}
        {step === "payment" && (
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5 border border-yellow-400/30">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-6 h-6 text-yellow-400" />
                <div>
                  <div className="font-semibold">{lang === "ar" ? "ادفع 10% مسبقًا لتأكيد مشروعك" : "Pay 10% advance to confirm your project"}</div>
                  <div className="text-xs text-muted-foreground">{lang === "ar" ? "يضمن هذا جدية الطلب ويحفظ حقوق الطرفين." : "This secures the project and protects both parties."}</div>
                </div>
              </div>
              <div className="text-3xl font-serif font-bold text-yellow-400 mb-4">{formatDZD(advance)}</div>
              <div className="glass rounded-xl p-4 bg-secondary/30 space-y-2 text-sm">
                <div className="font-semibold text-accent">{lang === "ar" ? "طريقة الدفع — بريدي موب" : "Payment Method — Baridi Mob"}</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 font-bold text-xs">CCP</div>
                  <div>
                    <div className="font-mono text-sm">007999990029553196</div>
                    <div className="text-xs text-muted-foreground">{lang === "ar" ? "رقم الحساب — بريدي موب" : "Account number — Baridi Mob"}</div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  {lang === "ar" ? "المفتاح: 73 | بعد التحويل، أرسل لنا إشعار الدفع." : "Key: 73 | After transfer, send us the payment notification."}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                {lang === "ar" ? "* إذا لم يتم العثور على عامل حر في منطقتك، سيتم استرداد المبلغ كاملًا." : "* If no creator is found in your area, a full refund will be issued."}
              </p>
            </div>
            <Button variant="royal" className="w-full" onClick={() => setStep("done")}>
              {lang === "ar" ? "تم الدفع ✓" : "I have paid ✓"}
            </Button>
          </div>
        )}

        {/* STEP 5: done */}
        {step === "done" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold">{lang === "ar" ? "تم إرسال مشروعك!" : t("sentForReview")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{t("adminReviewMsg")}</p>
            <Button variant="royal" onClick={() => { setOpen(false); reset(); }}>{t("gotIt")}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
