import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Phone, Video, Calendar, MapPin, Save, ExternalLink,
  CheckCircle2, Circle, MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Countdown } from "@/components/Countdown";
import { updateOfferWorkspace, type Bid, type ClientOffer } from "@/lib/store";

type Props = {
  offer: ClientOffer;
  acceptedBid: Bid;
  /** "client" or "creator" — drives which fields are editable. */
  viewer: "client" | "creator";
  /** Phone of the creator (read from their user profile, optional). */
  creatorPhone?: string;
  lang: "ar" | "en" | "fr";
};

const t = (lang: string, ar: string, en: string) => (lang === "ar" ? ar : en);

const STAGES = [
  { id: "brief", ar: "الملخص", en: "Brief" },
  { id: "meeting", ar: "اجتماع التحضير", en: "Kickoff Meeting" },
  { id: "shoot", ar: "التصوير", en: "Shoot / Production" },
  { id: "delivery", ar: "التسليم", en: "Delivery" },
  { id: "review", ar: "المراجعة", en: "Review & Close" },
] as const;

const computeStage = (offer: ClientOffer, bid: Bid): string => {
  if (bid.status === "delivered") return "review";
  if (bid.deliverableLink) return "delivery";
  if (offer.meetingAt && new Date(offer.meetingAt).getTime() < Date.now()) return "shoot";
  if (offer.meetingAt) return "meeting";
  return "brief";
};

const waLink = (phone: string) => {
  const digits = phone.replace(/[^\d]/g, "");
  return digits ? `https://wa.me/${digits}` : "";
};

export const ProjectWorkspace = ({ offer, acceptedBid, viewer, creatorPhone, lang }: Props) => {
  const [meetingUrl, setMeetingUrl] = useState(offer.meetingUrl || "");
  const [meetingAt, setMeetingAt] = useState(offer.meetingAt ? offer.meetingAt.slice(0, 16) : "");
  const [shootAddress, setShootAddress] = useState(offer.shootAddress || "");
  const [clientPhone, setClientPhone] = useState(offer.clientPhone || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMeetingUrl(offer.meetingUrl || "");
    setMeetingAt(offer.meetingAt ? offer.meetingAt.slice(0, 16) : "");
    setShootAddress(offer.shootAddress || "");
    setClientPhone(offer.clientPhone || "");
  }, [offer.id, offer.meetingUrl, offer.meetingAt, offer.shootAddress, offer.clientPhone]);

  const canEdit = viewer === "client";
  const currentStage = computeStage(offer, acceptedBid);

  const save = async () => {
    setSaving(true);
    try {
      await updateOfferWorkspace(offer.id, {
        meetingUrl: meetingUrl.trim(),
        meetingAt: meetingAt ? new Date(meetingAt).toISOString() : "",
        shootAddress: shootAddress.trim(),
        clientPhone: clientPhone.trim(),
      });
      toast.success(t(lang, "✓ تم حفظ تفاصيل الاتصال.", "✓ Workspace saved."));
    } catch {
      toast.error(t(lang, "فشل الحفظ.", "Save failed."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 pt-4 border-t border-border space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-accent" />
          {t(lang, "مساحة العمل المشتركة", "Project Workspace")}
        </h4>
        {acceptedBid.deliveryDeadline && acceptedBid.status === "accepted" && viewer === "creator" && (
          <Countdown
            deadline={acceptedBid.deliveryDeadline}
            lang={lang}
            label={{ ar: "تسليم خلال", en: "Deliver in", fr: "Livrer dans" }}
          />
        )}
      </div>

      {/* Stage tracker */}
      <div className="flex items-center justify-between gap-1">
        {STAGES.map((s, i) => {
          const idx = STAGES.findIndex((x) => x.id === currentStage);
          const reached = i <= idx;
          const isCurrent = i === idx;
          return (
            <div key={s.id} className="flex-1 flex flex-col items-center text-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  reached
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-secondary border-border text-muted-foreground"
                } ${isCurrent ? "ring-2 ring-accent/40" : ""}`}
              >
                {reached ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              </div>
              <div className={`text-[10px] mt-1 ${reached ? "text-foreground" : "text-muted-foreground"}`}>
                {lang === "ar" ? s.ar : s.en}
              </div>
              {i < STAGES.length - 1 && (
                <div className={`hidden sm:block h-px w-full ${reached ? "bg-accent/50" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Contact / meeting / address */}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Phones / contact */}
        <div className="glass rounded-xl p-3 space-y-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3 h-3" />{t(lang, "وسائل الاتصال", "Contact")}
          </div>
          {canEdit ? (
            <div>
              <Label className="text-xs">{t(lang, "هاتف العميل (يُشارَك مع المبدع)", "Your phone (shared with creator)")}</Label>
              <Input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="+213 XXX XXX XXX"
                className="h-8 text-sm mt-1"
              />
            </div>
          ) : (
            offer.clientPhone ? (
              <div className="text-sm">
                <span className="text-muted-foreground me-1">{t(lang, "هاتف العميل:", "Client phone:")}</span>
                <a href={`tel:${offer.clientPhone}`} className="text-accent font-semibold">{offer.clientPhone}</a>
                {waLink(offer.clientPhone) && (
                  <a
                    href={waLink(offer.clientPhone)}
                    target="_blank"
                    rel="noreferrer"
                    className="ms-2 text-emerald-400 underline text-xs"
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                {t(lang, "لم يضف العميل رقمه بعد.", "Client hasn't shared a phone yet.")}
              </div>
            )
          )}
          {viewer === "client" && creatorPhone && (
            <div className="text-sm">
              <span className="text-muted-foreground me-1">{t(lang, "هاتف المبدع:", "Creator phone:")}</span>
              <a href={`tel:${creatorPhone}`} className="text-accent font-semibold">{creatorPhone}</a>
            </div>
          )}
          <div className="text-sm">
            <span className="text-muted-foreground me-1">{t(lang, "البريد:", "Email:")}</span>
            <a
              href={`mailto:${viewer === "creator" ? offer.clientEmail : acceptedBid.creatorEmail}`}
              className="underline"
            >
              {viewer === "creator" ? offer.clientEmail : acceptedBid.creatorEmail}
            </a>
          </div>
        </div>

        {/* Meeting */}
        <div className="glass rounded-xl p-3 space-y-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Video className="w-3 h-3" />{t(lang, "اجتماع التحضير", "Kickoff meeting")}
          </div>
          {canEdit ? (
            <>
              <div>
                <Label className="text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />{t(lang, "موعد الاجتماع", "Meeting time")}
                </Label>
                <Input
                  type="datetime-local"
                  value={meetingAt}
                  onChange={(e) => setMeetingAt(e.target.value)}
                  className="h-8 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">{t(lang, "رابط Google Meet / Zoom", "Google Meet / Zoom URL")}</Label>
                <Input
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="h-8 text-sm mt-1"
                />
              </div>
            </>
          ) : (
            <>
              <div className="text-sm">
                {offer.meetingAt ? (
                  <>
                    <span className="text-muted-foreground me-1">{t(lang, "الموعد:", "When:")}</span>
                    <span className="font-semibold">{new Date(offer.meetingAt).toLocaleString()}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground italic text-xs">
                    {t(lang, "لم يُحدَّد بعد.", "Not scheduled yet.")}
                  </span>
                )}
              </div>
              {offer.meetingUrl && (
                <a
                  href={offer.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent text-sm underline"
                >
                  <Video className="w-3.5 h-3.5" />
                  {t(lang, "انضمّ للاجتماع", "Join meeting")}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </>
          )}
        </div>

        {/* Address */}
        <div className="glass rounded-xl p-3 space-y-2 sm:col-span-2">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />{t(lang, "موقع التصوير", "Shoot address")}
          </div>
          {canEdit ? (
            <Input
              value={shootAddress}
              onChange={(e) => setShootAddress(e.target.value)}
              placeholder={t(lang, "الحي، الشارع، نقطة بارزة…", "Neighborhood, street, landmark…")}
              className="h-8 text-sm"
            />
          ) : (
            <div className="text-sm">
              {offer.shootAddress ? (
                <>
                  <span className="font-semibold">{offer.shootAddress}</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${offer.shootAddress} ${offer.clientWilaya || "Algeria"}`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ms-2 text-accent underline text-xs"
                  >
                    {t(lang, "افتح في الخرائط", "Open in Maps")}
                  </a>
                </>
              ) : (
                <span className="text-muted-foreground italic text-xs">
                  {t(lang, "لم يُضَف عنوان دقيق بعد.", "No detailed address yet.")}
                </span>
              )}
            </div>
          )}
          {offer.preferredShootDate && (
            <div className="text-xs text-muted-foreground">
              {t(lang, "تاريخ التصوير المقترح:", "Preferred shoot date:")}{" "}
              <span className="text-foreground font-semibold">{offer.preferredShootDate}</span>
            </div>
          )}
          {offer.deliverableCount && (
            <div className="text-xs text-muted-foreground">
              {t(lang, "عدد التسليمات:", "Deliverables:")}{" "}
              <span className="text-foreground font-semibold">{offer.deliverableCount}</span>
            </div>
          )}
          {offer.usageRights && (
            <div className="text-xs text-muted-foreground">
              {t(lang, "حقوق الاستخدام:", "Usage rights:")}{" "}
              <span className="text-foreground font-semibold">
                {offer.usageRights === "personal"
                  ? t(lang, "شخصي", "Personal")
                  : offer.usageRights === "commercial"
                    ? t(lang, "تجاري", "Commercial")
                    : t(lang, "بث / إذاعة", "Broadcast")}
              </span>
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <Button variant="royal" size="sm" onClick={save} disabled={saving} className="w-full sm:w-auto">
          <Save className="w-3.5 h-3.5 me-1" />
          {saving ? "..." : t(lang, "حفظ تفاصيل الاتصال", "Save workspace details")}
        </Button>
      )}
    </div>
  );
};
