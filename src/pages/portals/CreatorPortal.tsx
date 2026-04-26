import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Gavel, TrendingUp, MapPin, Edit2, Save,
  Phone, CreditCard, Upload, Star, Trophy,
  ChevronRight, Briefcase, DollarSign, X, Check, Plus,
  ExternalLink,
} from "lucide-react";
import {
  useOffers, useBids, useCreators, useAllUsers,
  addBid, submitDeliverable, updateUserProfile, fetchTakenUsernames,
} from "@/lib/store";
import { generateUniqueUsername } from "@/lib/username";
import { CREATOR_ROLES, CREATOR_ROLE_AR, RANK_LEVELS, getRank, formatDZD } from "@/lib/offers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { OfferMap } from "@/components/OfferMap";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";
import { ProfileCompletionRing } from "@/components/ProfileCompletionRing";
import { Link } from "react-router-dom";
import { Countdown } from "@/components/Countdown";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
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
  const creators = useCreators();
  const allUsers = useAllUsers();

  // Find this creator's application doc (used for the public profile +
  // completion-ring computation).
  const myApp = creators.find((c) => c.uid === auth.uid || c.email === auth.email);
  const myUserDoc = allUsers.find((u) => u.uid === auth.uid);

  /* ── Self-service username backfill ─────────────────────────────────────
   * Creators who signed up before the public-profile feature land here
   * without a `username` on their /users doc. Generate one + write it back
   * (Firestore rules only allow a user to update their own doc, so this is
   * the only place a backfill can succeed). Runs once per session per uid. */
  useEffect(() => {
    if (auth.role !== "creator") return;
    if (!auth.uid) return;
    if (!myUserDoc) return;          // user doc still loading
    if (myUserDoc.username) return;  // already has one
    let cancelled = false;
    (async () => {
      const taken = await fetchTakenUsernames();
      if (cancelled) return;
      const username = generateUniqueUsername(auth.name || "creator", taken);
      try {
        await updateUserProfile(auth.uid!, { username });
      } catch {
        /* transient — will retry on next session */
      }
    })();
    return () => { cancelled = true; };
  }, [auth.role, auth.uid, auth.name, myUserDoc?.username]);

  /* ── Profile completion ───────────────────────────────────────────────
   * Six fields, equal weight. Hits the gold ring at 100 %. */
  const completion = (() => {
    if (!myApp) return { pct: 0, missing: [] as string[] };
    const checks: { ok: boolean; key: string }[] = [
      { ok: !!auth.profilePic, key: lang === "ar" ? "الصورة الشخصية" : lang === "fr" ? "Photo de profil" : "Profile picture" },
      { ok: (myApp.bio || "").trim().length >= 30, key: lang === "ar" ? "نبذة (30 حرفًا على الأقل)" : lang === "fr" ? "Bio (30+ caractères)" : "Bio (30+ chars)" },
      { ok: !!myApp.wilaya, key: lang === "ar" ? "الولاية" : "Wilaya" },
      { ok: !!myApp.role, key: lang === "ar" ? "التخصص" : lang === "fr" ? "Spécialité" : "Specialty" },
      { ok: (myApp.rate || 0) > 0, key: lang === "ar" ? "سعر الساعة" : lang === "fr" ? "Tarif horaire" : "Hourly rate" },
      { ok: (myApp.portfolio?.length || 0) > 0, key: lang === "ar" ? "رابط أعمال واحد على الأقل" : lang === "fr" ? "Au moins un lien portfolio" : "At least one portfolio link" },
    ];
    const filled = checks.filter((c) => c.ok).length;
    return {
      pct: Math.round((filled / checks.length) * 100),
      missing: checks.filter((c) => !c.ok).map((c) => c.key),
    };
  })();
  const username = myApp?.username;

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
  const bidCountForOffer = (offerId: string) => bids.filter((b) => b.offerId === offerId && b.status === "pending").length;

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
          <ProfileCompletionRing pct={completion.pct} size={64} stroke={3}>
            <div className="w-full h-full bg-gradient-gold flex items-center justify-center text-2xl">
              {auth.profilePic
                ? <img src={auth.profilePic} alt="" className="w-full h-full object-cover" />
                : (ROLE_AVATARS[primaryRole] || "🎬")}
            </div>
          </ProfileCompletionRing>
          <div className="min-w-0">
            <h1 className="font-serif text-xl md:text-2xl font-bold truncate">{auth.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <RankBadge jobs={completedJobs} lang={lang} />
              {creatorWilaya && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{creatorWilaya}
                </span>
              )}
            </div>
            {username && myApp?.status === "approved" && (
              <Link
                to={`/@${username}`}
                className="inline-flex items-center gap-1 text-[11px] text-accent hover:text-accent/80 mt-1.5 group"
              >
                <ExternalLink className="w-3 h-3" />
                <span className="font-mono">@{username}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity ms-1">
                  {lang === "ar" ? "عرض الملف العام" : lang === "fr" ? "Profil public" : "view public profile"}
                </span>
              </Link>
            )}
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
                const othersCount = bidCountForOffer(offer.id);
                const myBidAmt = bidAmounts[offer.id] || "";
                const isSubmitting = submittingBid === offer.id;

                return (
                  <div key={offer.id} className="glass rounded-2xl p-5 hover:border-accent/30 transition-smooth">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold uppercase tracking-widest text-accent">{offer.serviceTitle}</span>
                          {offer.clientWilaya && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />{offer.clientWilaya}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold mt-1">{offer.brief.slice(0, 120)}{offer.brief.length > 120 ? "…" : ""}</p>
                        {offer.voiceGender && offer.voiceGender !== "any" && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-accent/15 text-accent mt-2">
                            🎙️ {offer.voiceGender === "male"
                              ? (lang === "ar" ? "صوت ذكوري" : lang === "fr" ? "Voix masculine" : "Male voice")
                              : (lang === "ar" ? "صوت أنثوي" : lang === "fr" ? "Voix féminine" : "Female voice")}
                          </span>
                        )}
                        {offer.scriptUrl && (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground mt-2 ms-2">
                            📄 {lang === "ar" ? "السيناريو متوفر للمختار" : lang === "fr" ? "Script fourni à l'élu" : "Script provided after pick"}
                          </span>
                        )}
                        {offer.referenceLink && (
                          <a href={offer.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 block">
                            🔗 {lang === "ar" ? "رابط مرجعي" : "Reference"}
                          </a>
                        )}
                        {offer.deadline && <p className="text-xs text-muted-foreground mt-1">📅 {offer.deadline}</p>}
                      </div>
                    </div>

                    {/* Bid info — show range and competitor count only */}
                    <div className="glass rounded-xl p-4 bg-secondary/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">{lang === "ar" ? "نطاق السعر" : "Price range"}</div>
                          <div className="font-bold text-accent">{formatDZD(offer.bidMin)} – {formatDZD(offer.bidMax)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-0.5">{lang === "ar" ? "عدد المزايدين" : "Others bidding"}</div>
                          <div className="font-bold">{othersCount} <span className="text-muted-foreground text-xs">{lang === "ar" ? "منافس" : "competitor(s)"}</span></div>
                        </div>
                      </div>

                      {already ? (
                        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                          <TrendingUp className="w-4 h-4" />
                          {lang === "ar" ? "لقد قدّمت عرضك — انتظر قرار الإدارة." : "Bid submitted — waiting for admin decision."}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <Input
                              type="number"
                              min={offer.bidMin} max={offer.bidMax}
                              value={myBidAmt}
                              onChange={(e) => setBidAmounts((p) => ({ ...p, [offer.id]: e.target.value }))}
                              placeholder={lang === "ar" ? `أدخل سعرك (${formatDZD(offer.bidMin)} – ${formatDZD(offer.bidMax)})` : `Your price (${formatDZD(offer.bidMin)} – ${formatDZD(offer.bidMax)})`}
                              className="h-9 text-sm"
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
                      {bid.status === "accepted" && bid.deliveryDeadline && (
                        <div className="mt-2">
                          <Countdown
                            deadline={bid.deliveryDeadline}
                            lang={lang}
                            label={{ ar: "تسليم خلال", en: "Deliver in", fr: "Livrer dans" }}
                          />
                        </div>
                      )}
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

                  {/* Workspace appears as soon as the bid is accepted/delivered. */}
                  {(bid.status === "accepted" || bid.status === "delivered") && offer && (
                    <ProjectWorkspace offer={offer} acceptedBid={bid} viewer="creator" lang={lang} />
                  )}

                  {/* Deliverable upload for accepted bids */}
                  {bid.status === "accepted" && !bid.deliverableLink && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className="text-xs text-emerald-400 mb-2">🎉 {lang === "ar" ? "عرضك مقبول! ارفع رابط التسليم عند الانتهاء." : "Your bid was accepted! Upload deliverable when done."}</p>
                      <div className="flex gap-2">
                        <Input type="url" placeholder={lang === "ar" ? "https://drive.google.com/..." : "https://drive.google.com/..."}
                          value={deliverableLinks[bid.id] || ""}
                          onChange={(e) => setDeliverableLinks((p) => ({ ...p, [bid.id]: e.target.value }))}
                          className="h-8 text-sm flex-1" />
                        <Button size="sm" variant="gold" onClick={() => handleDeliverable(bid.id)}>
                          <Upload className="w-3.5 h-3.5 me-1" />{lang === "ar" ? "رفع" : "Submit"}
                        </Button>
                      </div>
                    </div>
                  )}
                  {bid.deliverableLink && (
                    <a href={bid.deliverableLink} target="_blank" rel="noreferrer" className="text-xs text-purple-400 underline mt-2 block">
                      📦 {bid.deliverableLink}
                    </a>
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
            <ProfileCompletionRing pct={completion.pct} size={72} stroke={3} showLabel>
              <div className="w-full h-full bg-gradient-gold flex items-center justify-center text-3xl">
                {auth.profilePic
                  ? <img src={auth.profilePic} alt="" className="w-full h-full object-cover" />
                  : (ROLE_AVATARS[primaryRole] || "🎬")}
              </div>
            </ProfileCompletionRing>
            <div className="flex-1 min-w-0">
              <div className="font-serif text-xl font-bold truncate">{auth.name}</div>
              <div className="text-sm text-muted-foreground truncate">{auth.email}</div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <RankBadge jobs={completedJobs} lang={lang} />
              </div>
              {username && myApp?.status === "approved" && (
                <Link to={`/@${username}`} className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 mt-2">
                  <ExternalLink className="w-3 h-3" /><span className="font-mono">@{username}</span>
                </Link>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
              {editMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            </Button>
          </div>

          {/* Profile completion checklist */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold">
                {lang === "ar" ? "اكتمال الملف الشخصي" : lang === "fr" ? "Profil complété" : "Profile completion"}
              </div>
              <span className={`text-sm font-bold ${completion.pct >= 100 ? "text-accent" : ""}`}>
                {completion.pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-border/50 overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-700 ${completion.pct >= 100 ? "bg-gradient-gold" : "bg-gradient-royal"}`}
                style={{ width: `${completion.pct}%` }}
              />
            </div>
            {completion.missing.length > 0 ? (
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {completion.missing.map((m) => (
                  <li key={m} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />{m}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-accent flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {lang === "ar" ? "ملفك مكتمل ١٠٠٪ — جاهز لجذب العملاء." : lang === "fr" ? "Profil 100 % complet — prêt à attirer des clients." : "100% complete — ready to attract clients."}
              </p>
            )}
          </div>

          {/* Profile picture upload */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-4">{lang === "ar" ? "الصورة الشخصية" : "Profile picture"}</h3>
            <ProfilePicUpload
              uid={auth.uid}
              currentUrl={auth.profilePic}
              fallback={<span>{ROLE_AVATARS[primaryRole] || "🎬"}</span>}
              onChange={refreshAuth}
              lang={lang}
              accent="gold"
            />
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
