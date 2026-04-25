import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Gavel, TrendingUp, MapPin, Edit2, Save,
  Phone, CreditCard, Upload, Star, Trophy,
  ChevronRight, Briefcase, DollarSign, X, Check, Plus
} from "lucide-react";
import { useOffers, useBids, addBid, submitDeliverable, updateUserProfile } from "@/lib/store";
import { CREATOR_ROLES, CREATOR_ROLE_AR, RANK_LEVELS, getRank, formatDZD } from "@/lib/offers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { OfferMap } from "@/components/OfferMap";
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";

const ROLE_AVATARS: Record<string, string> = {
  "Cinematographer": "🎥", "Video Editor": "✂️", "Motion Designer": "🎨",
  "Voice-Over Artist": "🎙️", "Sound Designer": "🎧", "Photographer": "📸",
  "Director": "🎬", "Colorist": "🎨", "VFX Artist": "✨",
  "Ghost Writer": "✍️", "UGC Creator": "📱",
};

const RankBadge = ({ jobs, lang }: { jobs: number; lang: string }) => {
  const rank = getRank(jobs);
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border"
      style={{ color: rank.color, borderColor: rank.color + "44", backgroundColor: rank.color + "15" }}>
      <Trophy className="w-3 h-3" />
      {lang === "ar" ? rank.labelAr : rank.label}
    </span>
  );
};

const CreatorPortal = () => {
  const { auth, lang, refreshAuth } = useApp();
  const navigate = useNavigate();

  // ── Auth guard
  useEffect(() => {
    if (!auth.loading && auth.role !== "creator") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  const offers = useOffers();
  const bids = useBids();

  // ── State
  const [activeTab, setActiveTab] = useState<"home" | "bids" | "profile">("home");
  const [filterWilaya, setFilterWilaya] = useState(true); // default: same wilaya
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});
  const [deliverableLinks, setDeliverableLinks] = useState<Record<string, string>>({});
  const [submittingBid, setSubmittingBid] = useState<string | null>(null);

  // ── Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [profileName, setProfileName] = useState(auth.name || "");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBariMob, setProfileBariMob] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileRoles, setProfileRoles] = useState<string[]>([auth.name ? "" : CREATOR_ROLES[0]]);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Sync edit fields with the latest auth profile so opening the form shows
  // the user's actual phone / Baridi Mob — and saving doesn't blank them out.
  useEffect(() => {
    setProfileName(auth.name || "");
    setProfilePhone(auth.phone || "");
    setProfileBariMob(auth.bariMobAccount || "");
  }, [auth.name, auth.phone, auth.bariMobAccount]);

  // ── Computed
  const creatorEmail = auth.email;
  const creatorWilaya = auth.wilaya || "";
  const myBids = bids.filter((b) => b.creatorEmail === creatorEmail);
  const completedJobs = myBids.filter((b) => b.status === "accepted").length;
  const earned = myBids.filter((b) => b.status === "accepted").reduce((s, b) => s + b.amount, 0);
  const rank = getRank(completedJobs);

  // ── Available offers — filter by wilaya and role match
  const primaryRole = profileRoles[0] || CREATOR_ROLES[0];
  const allRoles = profileRoles.filter(Boolean);

  const availableOffers = offers.filter((o) => {
    if (o.status !== "open") return false;
    const roleMatch = allRoles.some((r) => o.matchingRoles.includes(r));
    if (!roleMatch) return false;
    if (filterWilaya && creatorWilaya && o.clientWilaya && o.clientWilaya !== creatorWilaya) return false;
    return true;
  });

  const hasBid = (offerId: string) => myBids.some((b) => b.offerId === offerId);

  const handleBid = async (offerId: string, min: number, max: number) => {
    const raw = bidAmounts[offerId];
    const amount = parseInt(raw);
    if (!raw || isNaN(amount) || amount < min || amount > max) {
      toast.error(`${lang === "ar" ? "العرض يجب أن يكون بين" : "Bid must be between"} ${formatDZD(min)} – ${formatDZD(max)}`);
      return;
    }
    setSubmittingBid(offerId);
    try {
      await addBid({ offerId, creatorId: auth.uid || creatorEmail, creatorName: auth.name, creatorEmail, amount });
      toast.success(lang === "ar" ? `✓ تم تقديم عرضك بـ ${formatDZD(amount)}` : `✓ Bid submitted: ${formatDZD(amount)}`);
      setBidAmounts((p) => ({ ...p, [offerId]: "" }));
    } catch { toast.error(lang === "ar" ? "فشل تقديم العرض." : "Failed to submit bid."); }
    finally { setSubmittingBid(null); }
  };

  const handleDeliverable = async (bidId: string) => {
    const link = deliverableLinks[bidId]?.trim();
    if (!link) { toast.error(lang === "ar" ? "أدخل رابط التسليم." : "Enter delivery link."); return; }
    try {
      await submitDeliverable(bidId, link);
      toast.success(lang === "ar" ? "✓ تم رفع رابط التسليم!" : "✓ Deliverable submitted!");
    } catch { toast.error(lang === "ar" ? "فشل الرفع." : "Upload failed."); }
  };

  const saveProfile = async () => {
    if (!auth.uid) return;
    setSavingProfile(true);
    try {
      await updateUserProfile(auth.uid, {
        name: profileName || auth.name,
        phone: profilePhone,
        bariMobAccount: profileBariMob,
      });
      // Update Firebase Auth display name
      const fbUser = (await import("@/lib/firebase")).auth.currentUser;
      if (fbUser && profileName) {
        await updateProfile(fbUser, { displayName: profileName });
      }
      // Change password if provided
      const firebaseUser = (await import("@/lib/firebase")).auth.currentUser;
      if (newPassword && currentPassword && firebaseUser?.email) {
        const cred = EmailAuthProvider.credential(firebaseUser.email, currentPassword);
        await reauthenticateWithCredential(firebaseUser, cred);
        await updatePassword(firebaseUser, newPassword);
        toast.success(lang === "ar" ? "✓ تم تغيير كلمة المرور." : "✓ Password updated.");
      }
      await refreshAuth();
      toast.success(lang === "ar" ? "✓ تم حفظ الملف الشخصي." : "✓ Profile saved.");
      setEditMode(false);
      setNewPassword(""); setCurrentPassword("");
    } catch (err: any) {
      toast.error(err?.message || (lang === "ar" ? "فشل الحفظ." : "Save failed."));
    } finally { setSavingProfile(false); }
  };

  if (auth.loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-glow-pulse text-accent font-serif text-2xl">North Pixel</div>
    </div>
  );

  const TABS = [
    { id: "home", label: lang === "ar" ? "العروض المتاحة" : "Available Offers" },
    { id: "bids", label: lang === "ar" ? `عروضي${myBids.length > 0 ? ` (${myBids.length})` : ""}` : `My Bids${myBids.length > 0 ? ` (${myBids.length})` : ""}` },
    { id: "profile", label: lang === "ar" ? "ملفي" : "My Profile" },
  ] as const;

  return (
    <PortalShell title={lang === "ar" ? "لوحة العامل الحر" : "Freelancer Dashboard"} subtitle="North Pixel Studio" accent="gold">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center text-2xl flex-shrink-0">
            {ROLE_AVATARS[primaryRole] || "🎬"}
          </div>
          <div>
            <h1 className="font-serif text-xl md:text-2xl font-bold">{auth.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RankBadge jobs={completedJobs} lang={lang} />
              {creatorWilaya && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{creatorWilaya}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Stats strip */}
        <div className="sm:ms-auto flex gap-3">
          {[
            { icon: Briefcase, k: String(availableOffers.length), v: lang === "ar" ? "عروض متاحة" : "Open offers" },
            { icon: DollarSign, k: formatDZD(earned), v: lang === "ar" ? "مكتسبات" : "Earned" },
            { icon: Star, k: String(completedJobs), v: lang === "ar" ? "مهام" : "Jobs" },
          ].map((s) => (
            <div key={s.v} className="glass rounded-xl p-3 text-center min-w-[80px]">
              <s.icon className="w-4 h-4 text-accent mx-auto mb-1" />
              <div className="font-bold text-sm">{s.k}</div>
              <div className="text-[10px] text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 glass rounded-2xl mb-8">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-smooth ${activeTab === tab.id ? "bg-gradient-gold text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ HOME — available offers ══════════════════════════════════ */}
      {activeTab === "home" && (
        <div>
          {/* Wilaya filter */}
          {creatorWilaya && (
            <div className="flex items-center gap-3 mb-5">
              <button onClick={() => setFilterWilaya((f) => !f)}
                className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-smooth ${filterWilaya ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                <MapPin className="w-3 h-3" />
                {filterWilaya ? (lang === "ar" ? `نفس الولاية: ${creatorWilaya}` : `Same area: ${creatorWilaya}`) : (lang === "ar" ? "جميع الولايات" : "All wilayas")}
              </button>
              <span className="text-xs text-muted-foreground">
                {availableOffers.length} {lang === "ar" ? "عرض" : "offer(s)"}
              </span>
            </div>
          )}

          {availableOffers.length === 0 ? (
            <div className="glass rounded-3xl p-16 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="font-serif text-xl font-bold mb-2">
                {lang === "ar" ? "لا توجد عروض متاحة حاليًا" : "No offers available right now"}
              </h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                {lang === "ar"
                  ? filterWilaya
                    ? `لا توجد عروض في ${creatorWilaya} حاليًا. جرب عرض جميع الولايات.`
                    : "لم يُنشر أي عرض يتوافق مع تخصصك. سنُعلمك عند ورود عرض جديد."
                  : filterWilaya
                    ? `No offers in ${creatorWilaya} right now. Try showing all wilayas.`
                    : "No offers matching your speciality yet. You'll be notified when one arrives."}
              </p>
              {filterWilaya && (
                <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilterWilaya(false)}>
                  {lang === "ar" ? "عرض جميع الولايات" : "Show all wilayas"}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {availableOffers.map((offer) => {
                const already = hasBid(offer.id);
                const myBidAmt = bidAmounts[offer.id] || "";
                const isSubmitting = submittingBid === offer.id;

                const closed = offer.bidsCloseAt ? Date.now() >= offer.bidsCloseAt : false;
                return (
                  <div key={offer.id} className="glass rounded-2xl p-5 hover:border-accent/40 transition-smooth animate-fade-in-up">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-widest text-accent">{offer.serviceTitle}</span>
                          {offer.clientWilaya && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />{offer.clientWilaya}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold mt-1">{offer.brief.slice(0, 120)}{offer.brief.length > 120 ? "…" : ""}</p>
                        {offer.referenceLink && (
                          <a href={offer.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 inline-flex items-center gap-1">
                            <Link2 className="w-3 h-3" />{lang === "ar" ? "رابط مرجعي" : "Reference"}
                          </a>
                        )}
                        {offer.deadline && (
                          <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                            <CalendarClock className="w-3 h-3" />{offer.deadline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Countdown — admin-set bidding window */}
                    {offer.bidsCloseAt && (
                      <div className="mb-3">
                        <CountdownTimer
                          target={offer.bidsCloseAt}
                          lang={lang}
                          label={lang === "ar" ? "ينتهي تقديم العروض خلال" : "Bidding closes in"}
                          tone="gold"
                        />
                      </div>
                    )}

                    {/* Bid info — price range only (no competitor count) */}
                    <div className="rounded-xl p-4 bg-gradient-to-br from-accent/8 via-secondary/15 to-transparent border border-accent/15">
                      <div className="text-[10px] uppercase tracking-widest text-accent mb-1 font-bold">
                        {lang === "ar" ? "نطاق السعر المتاح" : "Available price range"}
                      </div>
                      <div className="font-serif text-xl font-bold text-accent mb-3">{formatDZD(offer.bidMin)} – {formatDZD(offer.bidMax)}</div>

                      {already ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium rounded-lg bg-emerald-400/10 border border-emerald-400/20 px-3 py-2">
                          <CheckCircle2 className="w-4 h-4" />
                          {lang === "ar" ? "تم استلام عرضك — في المراجعة." : "Bid received — under review."}
                        </div>
                      ) : closed ? (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm rounded-lg bg-secondary/30 px-3 py-2">
                          <Clock3 className="w-4 h-4" />
                          {lang === "ar" ? "أُغلق تقديم العروض على هذا المشروع." : "Bidding has closed on this project."}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <Input
                              type="number"
                              min={offer.bidMin} max={offer.bidMax}
                              value={myBidAmt}
                              onChange={(e) => setBidAmounts((p) => ({ ...p, [offer.id]: e.target.value }))}
                              placeholder={lang === "ar" ? `سعرك (${formatDZD(offer.bidMin)} – ${formatDZD(offer.bidMax)})` : `Your price (${formatDZD(offer.bidMin)} – ${formatDZD(offer.bidMax)})`}
                              className="h-10 text-sm bg-background/60"
                              dir="ltr"
                            />
                          </div>
                          <Button variant="gold" size="sm" disabled={isSubmitting}
                            onClick={() => handleBid(offer.id, offer.bidMin, offer.bidMax)}>
                            <Gavel className="w-3.5 h-3.5 me-1" />
                            {isSubmitting ? "..." : lang === "ar" ? "قدّم" : "Bid"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══ MY BIDS ══════════════════════════════════════════════════ */}
      {activeTab === "bids" && (
        <div className="space-y-3">
          {myBids.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-muted-foreground">{lang === "ar" ? "لم تقدّم أي عرض بعد." : "No bids submitted yet."}</p>
            </div>
          ) : (
            myBids.map((bid) => {
              const offer = offers.find((o) => o.id === bid.offerId);
              return (
                <div key={bid.id} className="glass rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="font-semibold">{offer?.serviceTitle || "—"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{offer?.brief?.slice(0, 80)}…</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-accent font-bold">{formatDZD(bid.amount)}</div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        bid.status === "accepted" ? "bg-emerald-400/20 text-emerald-400" :
                        bid.status === "rejected" ? "bg-destructive/20 text-destructive" :
                        bid.status === "delivered" ? "bg-purple-400/20 text-purple-400" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {bid.status === "pending" && (lang === "ar" ? "في الانتظار" : "Pending")}
                        {bid.status === "accepted" && (lang === "ar" ? "✓ مقبول" : "✓ Accepted")}
                        {bid.status === "rejected" && (lang === "ar" ? "مرفوض" : "Rejected")}
                        {bid.status === "delivered" && (lang === "ar" ? "تم التسليم" : "Delivered")}
                      </span>
                    </div>
                  </div>

                  {/* Deliverable upload for accepted bids */}
                  {bid.status === "accepted" && !bid.deliverableLink && (
                    <div className="mt-4 pt-4 border-t border-emerald-400/20">
                      <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-500/10 via-accent/5 to-transparent border border-emerald-400/20">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-4 h-4 text-emerald-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-emerald-400">
                              {lang === "ar" ? "تم قبول عرضك" : "Bid accepted"}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {lang === "ar"
                                ? "ارفع ملفك على Google Drive أو WeTransfer ثم الصق الرابط هنا."
                                : "Upload your file to Google Drive or WeTransfer, then paste the link below."}
                            </div>
                          </div>
                        </div>

                        <Label htmlFor={`del-${bid.id}`} className="text-[11px] uppercase tracking-widest text-accent font-bold mb-1.5 flex items-center gap-1">
                          <Upload className="w-3 h-3" />
                          {lang === "ar" ? "رابط التسليم" : "Delivery link"}
                        </Label>
                        <div className="relative">
                          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                            <Upload className="w-4 h-4" />
                          </div>
                          <Input
                            id={`del-${bid.id}`}
                            type="url"
                            placeholder="https://drive.google.com/..."
                            value={deliverableLinks[bid.id] || ""}
                            onChange={(e) => setDeliverableLinks((p) => ({ ...p, [bid.id]: e.target.value }))}
                            className="ps-10 h-11 text-sm bg-background/60 focus-visible:ring-emerald-400/40 focus-visible:border-emerald-400/40"
                            dir="ltr"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2 mt-3">
                          <span className="text-[10px] text-muted-foreground">
                            {lang === "ar" ? "تأكد أن الرابط مفتوح للجميع." : "Make sure the link is publicly accessible."}
                          </span>
                          <Button
                            size="sm"
                            variant="gold"
                            disabled={!deliverableLinks[bid.id]?.trim()}
                            onClick={() => handleDeliverable(bid.id)}
                          >
                            <Upload className="w-3.5 h-3.5 me-1" />
                            {lang === "ar" ? "إرسال التسليم" : "Submit deliverable"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {bid.deliverableLink && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="rounded-2xl p-3 bg-purple-400/10 border border-purple-400/25 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-400/20 flex items-center justify-center flex-shrink-0">
                          <Check className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] uppercase tracking-widest text-purple-400 font-bold">
                            {lang === "ar" ? "تم التسليم" : "Delivered"}
                          </div>
                          <a
                            href={bid.deliverableLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-foreground/90 hover:text-purple-400 transition-smooth truncate block"
                            dir="ltr"
                          >
                            {bid.deliverableLink}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ PROFILE ══════════════════════════════════════════════════ */}
      {activeTab === "profile" && (
        <div className="space-y-6 max-w-xl">
          {/* Avatar + name header */}
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center text-3xl flex-shrink-0">
              {ROLE_AVATARS[primaryRole] || "🎬"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-xl font-bold">{auth.name}</div>
              <div className="text-sm text-muted-foreground">{auth.email}</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <RankBadge jobs={completedJobs} lang={lang} />
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
              {editMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Rank progress */}
          <div className="glass rounded-2xl p-5">
            <div className="text-sm font-semibold mb-3">{lang === "ar" ? "مسار الرتب" : "Rank Progress"}</div>
            <div className="flex gap-1 mb-2">
              {RANK_LEVELS.map((r) => (
                <div key={r.id} className="flex-1 h-2 rounded-full" style={{ backgroundColor: completedJobs >= r.min ? r.color : r.color + "30" }} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {RANK_LEVELS.map((r) => (
                <span key={r.id} style={{ color: completedJobs >= r.min ? r.color : undefined }}>
                  {lang === "ar" ? r.labelAr : r.label}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {lang === "ar" ? `أنجزت ${completedJobs} مهمة` : `${completedJobs} jobs completed`}
            </p>
          </div>

          {/* Edit form */}
          {editMode && (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold">{lang === "ar" ? "تعديل الملف الشخصي" : "Edit Profile"}</h3>

              <div>
                <Label>{lang === "ar" ? "الاسم الكامل" : "Full name"}</Label>
                <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label className="flex items-center gap-1"><Phone className="w-3 h-3" />{lang === "ar" ? "رقم الهاتف" : "Phone"}</Label>
                <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+213 XXX XXX XXX" className="mt-1" />
              </div>

              <div>
                <Label className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{lang === "ar" ? "حساب بريدي موب" : "Baridi Mob account"}</Label>
                <Input value={profileBariMob} onChange={(e) => setProfileBariMob(e.target.value)} placeholder="007999990XXXXXXXXX" className="mt-1" />
              </div>

              {/* Roles — multi-select */}
              <div>
                <Label>{lang === "ar" ? "تخصصاتك (يمكن اختيار أكثر من واحد)" : "Your specialities (multiple allowed)"}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {CREATOR_ROLES.map((r) => {
                    const selected = profileRoles.includes(r);
                    return (
                      <button key={r} type="button"
                        onClick={() => setProfileRoles(prev =>
                          selected ? prev.filter(x => x !== r) : [...prev, r]
                        )}
                        className={`px-3 py-1.5 rounded-full text-xs border transition-smooth flex items-center gap-1 ${selected ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
                        {ROLE_AVATARS[r]} {lang === "ar" ? CREATOR_ROLE_AR[r] : r}
                        {selected && <Check className="w-3 h-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Password change */}
              <div className="pt-3 border-t border-border space-y-3">
                <p className="text-sm font-semibold">{lang === "ar" ? "تغيير كلمة المرور (اختياري)" : "Change password (optional)"}</p>
                <div>
                  <Label>{lang === "ar" ? "كلمة المرور الحالية" : "Current password"}</Label>
                  <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>{lang === "ar" ? "كلمة المرور الجديدة" : "New password"}</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={lang === "ar" ? "8 أحرف على الأقل" : "Min 8 characters"} className="mt-1" />
                </div>
              </div>

              <Button variant="gold" className="w-full" onClick={saveProfile} disabled={savingProfile}>
                <Save className="w-4 h-4 me-1" />{savingProfile ? "..." : lang === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </div>
          )}

          {/* Read-only info when not editing */}
          {!editMode && (
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="font-semibold mb-3">{lang === "ar" ? "معلوماتي" : "My Info"}</h3>
              <div className="text-sm"><span className="text-muted-foreground">{lang === "ar" ? "الولاية: " : "Wilaya: "}</span>{creatorWilaya || "—"}</div>
              <div className="text-sm"><span className="text-muted-foreground">{lang === "ar" ? "المهام المكتملة: " : "Completed jobs: "}</span>{completedJobs}</div>
              <div className="text-sm"><span className="text-muted-foreground">{lang === "ar" ? "المكتسبات: " : "Total earned: "}</span><span className="text-accent font-semibold">{formatDZD(earned)}</span></div>
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="mt-2">
                <Edit2 className="w-3.5 h-3.5 me-1" />{lang === "ar" ? "تعديل البيانات" : "Edit details"}
              </Button>
            </div>
          )}
        </div>
      )}
    </PortalShell>
  );
};

export default CreatorPortal;
