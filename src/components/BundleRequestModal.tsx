/**
 * Modal that captures a bundle subscription request from a client.
 * Triggered from the home-page bundle tier cards. Writes a `pending`
 * /bundleSubscriptions doc; admin reviews + activates from the
 * "Bundles" tab in the admin dashboard.
 */
import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/context";
import { ALGERIA_WILAYAS } from "@/lib/i18n";
import { type Bundle, formatDZD } from "@/lib/offers";
import { requestBundleSubscription } from "@/lib/bundles";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Phone, Calendar, FileText, Loader2 } from "lucide-react";

type Props = {
  bundle: Bundle | null;
  /** Initial tier to pre-select. Falsy = pick the middle tier as a sensible default. */
  initialTierId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const BundleRequestModal = ({ bundle, initialTierId, open, onOpenChange }: Props) => {
  const { lang, auth } = useApp();
  const navigate = useNavigate();

  const ar = lang === "ar";
  const fr = lang === "fr";

  const tiers = bundle?.monthlyTiers || [];
  const defaultTierId =
    initialTierId || tiers[Math.floor(tiers.length / 2)]?.id || tiers[0]?.id || "";

  const [tierId, setTierId] = useState(defaultTierId);
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState(auth.name || "");
  const [contactPhone, setContactPhone] = useState(auth.phone || "");
  const [wilaya, setWilaya] = useState(auth.wilaya || "");
  const [kickoffDate, setKickoffDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Reset selected tier when the bundle changes (different bundle has different tier ids).
  useEffect(() => {
    if (!open) return;
    setTierId(defaultTierId);
  }, [open, defaultTierId]);

  // Refresh user-derived defaults when auth changes.
  useEffect(() => {
    if (!open) return;
    if (auth.name && !contactName) setContactName(auth.name);
    if (auth.phone && !contactPhone) setContactPhone(auth.phone);
    if (auth.wilaya && !wilaya) setWilaya(auth.wilaya);
  }, [open, auth.name, auth.phone, auth.wilaya]);

  if (!bundle) return null;

  const tier = tiers.find((t) => t.id === tierId) || tiers[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.uid) {
      toast.error(ar ? "يجب تسجيل الدخول أولًا" : fr ? "Connectez-vous d'abord" : "Sign in first");
      navigate("/auth/login");
      return;
    }
    if (!orgName.trim() || !contactName.trim() || !contactPhone.trim() || !wilaya || !tier) {
      toast.error(ar ? "أكمل جميع الحقول المطلوبة" : fr ? "Complétez les champs requis" : "Fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await requestBundleSubscription({
        clientUid: auth.uid,
        clientEmail: auth.email,
        orgName: orgName.trim(),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        wilaya,
        bundleSlug: bundle.slug,
        tierId: tier.id,
        monthlyPrice: tier.monthlyPrice,
        kickoffDate: kickoffDate || undefined,
        notes: notes.trim() || undefined,
      });
      toast.success(
        ar
          ? "✓ تم إرسال طلبك — سنتواصل معك قريبًا"
          : fr
          ? "✓ Demande envoyée — nous vous recontactons"
          : "✓ Request sent — we'll be in touch",
      );
      onOpenChange(false);
      // Reset for next time.
      setOrgName("");
      setKickoffDate("");
      setNotes("");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[bundle-request]", err);
      toast.error(ar ? "فشل إرسال الطلب" : fr ? "Échec de l'envoi" : "Failed to send");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {ar
              ? `طلب اشتراك — ${bundle.badge.ar}`
              : fr
              ? `Demande de bundle — ${bundle.badge.fr}`
              : `Request bundle — ${bundle.badge.en}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {ar
              ? "شاركنا تفاصيل مؤسستك وسنعود إليك خلال 24 ساعة لتأكيد الاشتراك."
              : fr
              ? "Donnez-nous quelques détails et nous reviendrons vers vous dans les 24h pour confirmer."
              : "Share a few details and we'll confirm your subscription within 24h."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Tier picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              {ar ? "اختر الباقة الشهرية" : fr ? "Choisissez votre formule" : "Choose your tier"}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {tiers.map((t) => {
                const active = t.id === tierId;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTierId(t.id)}
                    className={`text-left rounded-xl border p-3 transition-smooth ${
                      active
                        ? "border-accent bg-accent/10 shadow-[0_0_20px_-12px_hsl(41_67%_60%/0.6)]"
                        : "border-border/60 hover:border-accent/40"
                    }`}
                  >
                    <div className="text-sm font-bold">
                      {ar ? t.title.ar : fr ? t.title.fr : t.title.en}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatDZD(t.monthlyPrice, lang)}
                      <span className="opacity-70"> / {ar ? "شهر" : fr ? "mois" : "mo"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Org */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bundle-org" className="text-xs flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                {ar ? "اسم المؤسسة *" : fr ? "Organisation *" : "Organization *"}
              </Label>
              <Input
                id="bundle-org"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder={ar ? "جامعة قسنطينة 1" : fr ? "Université de Constantine 1" : "Constantine University"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bundle-contact" className="text-xs">
                {ar ? "اسم المسؤول *" : fr ? "Personne contact *" : "Contact person *"}
              </Label>
              <Input
                id="bundle-contact"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="bundle-phone" className="text-xs flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {ar ? "هاتف *" : fr ? "Téléphone *" : "Phone *"}
              </Label>
              <Input
                id="bundle-phone"
                required
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="0555 123 456"
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bundle-wilaya" className="text-xs flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {ar ? "الولاية *" : fr ? "Wilaya *" : "Wilaya *"}
              </Label>
              <select
                id="bundle-wilaya"
                required
                value={wilaya}
                onChange={(e) => setWilaya(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">{ar ? "اختر…" : fr ? "Choisir…" : "Select…"}</option>
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.nameEn}>
                    {ar ? `${w.code} — ${w.name}` : `${w.code} — ${w.nameEn}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bundle-kickoff" className="text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {ar ? "تاريخ بدء مقترح" : fr ? "Date de démarrage souhaitée" : "Preferred kickoff date"}
            </Label>
            <Input
              id="bundle-kickoff"
              type="date"
              value={kickoffDate}
              onChange={(e) => setKickoffDate(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bundle-notes" className="text-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {ar ? "ملاحظات / احتياجات إضافية" : fr ? "Notes / besoins spécifiques" : "Notes / special needs"}
            </Label>
            <Textarea
              id="bundle-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder={
                ar
                  ? "أحداث متوقعة، تواريخ مهمة، عدد المواقع…"
                  : fr
                  ? "Événements prévus, dates clés, nombre de sites…"
                  : "Expected events, key dates, number of sites…"
              }
            />
          </div>

          {/* Tier summary */}
          {tier && (
            <div className="glass rounded-xl p-4 border border-accent/20 text-sm">
              <div className="font-semibold mb-2">
                {ar ? "ملخص الباقة" : fr ? "Récapitulatif" : "Summary"}
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  <span className="opacity-70">{ar ? "الباقة:" : fr ? "Bundle:" : "Bundle:"}</span>{" "}
                  <span className="font-medium text-foreground">
                    {ar ? bundle.badge.ar : fr ? bundle.badge.fr : bundle.badge.en}
                  </span>
                </div>
                <div>
                  <span className="opacity-70">{ar ? "الفئة:" : fr ? "Formule:" : "Tier:"}</span>{" "}
                  <span className="font-medium text-foreground">
                    {ar ? tier.title.ar : fr ? tier.title.fr : tier.title.en}
                  </span>
                </div>
                <div>
                  <span className="opacity-70">{ar ? "السعر:" : fr ? "Prix:" : "Price:"}</span>{" "}
                  <span className="font-medium text-accent">
                    {formatDZD(tier.monthlyPrice, lang)} /{" "}
                    {ar ? "شهر" : fr ? "mois" : "month"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1"
            >
              {ar ? "إلغاء" : fr ? "Annuler" : "Cancel"}
            </Button>
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {ar ? "إرسال الطلب" : fr ? "Envoyer la demande" : "Send request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
