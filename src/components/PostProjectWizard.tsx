import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OFFERS, ADMIN_COMMISSION, formatDZD, type Offer } from "@/lib/offers";
import { addOffer } from "@/lib/store";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

type Step = "service" | "price" | "brief" | "done";

export const PostProjectWizard = ({
  trigger,
  clientName = "Client",
  clientEmail = "client@example.com",
  clientWilaya = "",
}: {
  trigger: React.ReactNode;
  clientName?: string;
  clientEmail?: string;
  clientWilaya?: string;
}) => {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("service");
  const [offer, setOffer] = useState<Offer | null>(null);
  const [units, setUnits] = useState(0);
  const [brief, setBrief] = useState("");
  const [deadline, setDeadline] = useState("");

  const total = offer ? units * offer.pricing.pricePerUnit : 0;
  const adminCut = Math.round(total * ADMIN_COMMISSION);
  const payout = total - adminCut;

  const reset = () => {
    setStep("service"); setOffer(null); setUnits(0); setBrief(""); setDeadline("");
  };

  const pickOffer = (o: Offer) => {
    setOffer(o);
    setUnits(o.pricing.minUnits);
    setStep("price");
  };

  const submit = () => {
    if (!offer) return;
    if (brief.trim().length < 10) { toast.error("Please describe your project (10+ chars)"); return; }
    addOffer({
      clientName, clientEmail,
      clientWilaya: clientWilaya || undefined,
      serviceSlug: offer.slug,
      serviceTitle: offer.title,
      units,
      unitLabel: units === 1 ? offer.pricing.unitLabel : offer.pricing.unitLabelPlural,
      totalPrice: total,
      adminCut,
      creatorPayout: payout,
      brief: brief.trim(),
      deadline: deadline || undefined,
      matchingRoles: offer.matchingRoles,
      wilayaFilter: clientWilaya || undefined,
    });
    setStep("done");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            {step === "service" && t("pickService")}
            {step === "price" && offer?.title}
            {step === "brief" && t("tellAboutProject")}
            {step === "done" && t("sentForReview")}
          </DialogTitle>
        </DialogHeader>

        {step === "service" && (
          <div className="grid sm:grid-cols-2 gap-3">
            {OFFERS.map((o) => {
              const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
              return (
                <button
                  key={o.slug}
                  onClick={() => pickOffer(o)}
                  className="text-left glass rounded-2xl p-4 hover:border-accent/50 transition-smooth"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="font-semibold">{o.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{o.startingPrice}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === "price" && offer && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">{t("estimatedTotal")}</span>
                <span className="text-xs text-muted-foreground">{formatDZD(offer.pricing.pricePerUnit)} / {offer.pricing.unit}</span>
              </div>
              <div className="font-serif text-4xl font-bold text-gradient-gold">{formatDZD(total)}</div>
              <div className="text-sm text-muted-foreground mt-1">{units} {units === 1 ? offer.pricing.unitLabel : offer.pricing.unitLabelPlural}</div>
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-muted-foreground">{t("yourCut")} (20%)</div>
                  <div className="font-semibold text-accent">{formatDZD(adminCut)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("bidRange")}</div>
                  <div className="font-semibold">{formatDZD(Math.round(payout * 0.83))} – {formatDZD(payout)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">{t("creatorPayout")}</div>
                  <div className="font-semibold">{formatDZD(payout)}</div>
                </div>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">{t("adjustQty")} ({offer.pricing.minUnits}–{offer.pricing.maxUnits} {offer.pricing.unitLabelPlural})</Label>
              <Slider
                min={offer.pricing.minUnits}
                max={offer.pricing.maxUnits}
                step={1}
                value={[units]}
                onValueChange={(v) => setUnits(v[0])}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{offer.pricing.minUnits} {offer.pricing.unitLabelPlural} (min)</span>
                <span>{offer.pricing.maxUnits} {offer.pricing.unitLabelPlural}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{t("finalPriceNote")}</p>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep("service")}><ArrowLeft className="w-4 h-4" /> {t("back")}</Button>
              <Button variant="royal" onClick={() => setStep("brief")}>{t("continue")} <ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        )}

        {step === "brief" && offer && (
          <div className="space-y-5">
            <div className="glass rounded-xl p-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{offer.title} · {units} {units === 1 ? offer.pricing.unitLabel : offer.pricing.unitLabelPlural}</span>
              <span className="font-semibold text-accent">{formatDZD(total)}</span>
            </div>

            <div>
              <Label htmlFor="brief">{t("projectBrief")}</Label>
              <Textarea id="brief" rows={5} value={brief} onChange={(e) => setBrief(e.target.value)} maxLength={1000}
                placeholder="What are you trying to create? Who is it for? Any references, tone, languages, locations…" />
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

        {step === "done" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-accent-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold">{t("sentForReview")}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">{t("adminReviewMsg")}</p>
            <Button variant="royal" onClick={() => { setOpen(false); reset(); }}>{t("gotIt")}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
