import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, DollarSign, Star, MapPin, Gavel, TrendingUp, Edit2, Save, Phone, CreditCard, Upload } from "lucide-react";
import { useOffers, useBids, addBid, submitDeliverable, updateUserProfile } from "@/lib/store";
import { CREATOR_ROLES, CREATOR_ROLE_AR, RANK_LEVELS, getRank, formatDZD } from "@/lib/offers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";

// Role-based avatars
const ROLE_AVATARS: Record<string, string> = {
  "Cinematographer": "🎥", "Video Editor": "✂️", "Motion Designer": "🎨",
  "Voice-Over Artist": "🎙️", "Sound Designer": "🎧", "Photographer": "📸",
  "Director": "🎬", "Colorist": "🎨", "VFX Artist": "✨",
  "Ghost Writer": "✍️", "UGC Creator": "📱",
};

const RankBadge = ({ jobs, lang }: { jobs: number; lang: string }) => {
  const rank = getRank(jobs);
  return (
    <div className="flex items-center gap-2 glass rounded-full px-3 py-1">
      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: rank.color }} />
      <span className="text-xs font-semibold" style={{ color: rank.color }}>
        {lang === "ar" ? rank.labelAr : rank.label}
      </span>
      <span className="text-xs text-muted-foreground">({jobs} {lang === "ar" ? "مهمة" : "jobs"})</span>
    </div>
  );
};

const CreatorPortal = () => {
  const { t, auth, lang, refreshAuth } = useApp();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<string>(CREATOR_ROLES[0]);
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
  const [filterWilaya, setFilterWilaya] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [phone, setPhone] = useState("");
  const [bariMob, setBariMob] = useState("");
  const [saving, setSaving] = useState(false);
  const [deliverableLinks, setDeliverableLinks] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!auth.loading && auth.role !== "creator") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  const offers = useOffers();
  const bids = useBids();
  const creatorWilaya = auth.wilaya || "";
  const completedJobs = bids.filter((b) => b.creatorEmail === auth.email && b.status === "accepted").length;
  const rank = getRank(completedJobs);

  const open = offers.filter((o) => {
    if (o.status !== "open") return false;
    if (!o.matchingRoles.includes(selectedRole)) return false;
    if (filterWilaya && creatorWilaya && o.clientWilaya && o.clientWilaya !== creatorWilaya) return false;
    return true;
  });

  const myBids = bids.filter((b) => b.creatorEmail === auth.email);
  const earned = myBids.filter((b) => b.status === "accepted").reduce((s, b) => s + b.amount, 0);
  const hasBid = (offerId: string) => myBids.some((b) => b.offerId === offerId);

  const submitBid = async (offerId: string, min: number, max: number) => {
    const amount = bidAmounts[offerId];
    if (!amount || amount < min || amount > max) { toast.error(`${lang === "ar" ? "يجب أن يكون العرض بين" : "Bid must be between"} ${formatDZD(min)} – ${formatDZD(max)}`); return; }
    try {
      await addBid({ offerId, creatorId: auth.uid || auth.email, creatorName: auth.name, creatorEmail: auth.email, amount });
      toast.success(`${lang === "ar" ? "تم تقديم عرضك!" : "Bid submitted!"} ${formatDZD(amount)}`);
    } catch { toast.error("حدث خطأ. حاول مرة أخرى."); }
  };

  const handleDeliverable = async (bidId: string) => {
    const link = deliverableLinks[bidId];
    if (!link) { toast.error(lang === "ar" ? "أدخل رابط التسليم." : "Enter delivery link."); return; }
    try {
      await submitDeliverable(bidId, link);
      toast.success(lang === "ar" ? "تم رفع رابط التسليم!" : "Deliverable submitted!");
    } catch { toast.error("حدث خطأ."); }
  };

  const saveProfile = async () => {
    if (!auth.uid) return;
    setSaving(true);
    try {
      await updateUserProfile(auth.uid, { phone, bariMobAccount: bariMob, avatar: selectedRole });
      await refreshAuth();
      toast.success(lang === "ar" ? "تم الحفظ." : "Saved.");
      setEditingProfile(false);
    } catch { toast.error("فشل الحفظ."); }
    finally { setSaving(false); }
  };

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <PortalShell title={lang === "ar" ? "لوحة العامل الحر" : t("creatorStudio")} subtitle="North Pixel Network" accent="gold">

      {/* Profile card */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center text-3xl">
              {ROLE_AVATARS[selectedRole] || "🎬"}
            </div>
            <div>
              <div className="font-serif text-xl font-bold">{auth.name}</div>
              <div className="text-sm text-muted-foreground">{auth.email}</div>
              <div className="mt-1"><RankBadge jobs={completedJobs} lang={lang} /></div>
              {creatorWilaya && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="w-3 h-3" />{creatorWilaya}</div>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
            <Edit2 className="w-4 h-4 me-1" />{lang === "ar" ? "تعديل" : "Edit"}
          </Button>
        </div>

        {/* Rank progress */}
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">{lang === "ar" ? "الرتب: " : "Ranks: "}
            {RANK_LEVELS.map((r, i) => (
              <span key={r.id} className="me-2" style={{ color: completedJobs >= r.min ? r.color : undefined, opacity: completedJobs >= r.min ? 1 : 0.3 }}>
                {lang === "ar" ? r.labelAr : r.label}{i < RANK_LEVELS.length - 1 ? " →" : ""}
              </span>
            ))}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ backgroundColor: rank.color, width: `${Math.min((completedJobs / 50) * 100, 100)}%` }} />
          </div>
        </div>

        {editingProfile && (
          <div className="space-y-4 pt-4 border-t border-border mt-4">
            <div>
              <Label className="mb-2 block">{lang === "ar" ? "تخصصك (يحدد صورتك الرمزية)" : "Your speciality (sets your avatar)"}</Label>
              <div className="flex flex-wrap gap-2">
                {CREATOR_ROLES.map((r) => (
                  <button key={r} type="button" onClick={() => setSelectedRole(r)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-smooth flex items-center gap-1 ${selectedRole === r ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border bg-secondary/40 text-muted-foreground"}`}>
                    {ROLE_AVATARS[r]} {lang === "ar" ? CREATOR_ROLE_AR[r] : r}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lang === "ar" ? "رقم الهاتف" : "Phone"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213 X XX XX XX XX" /></div>
              <div><Label className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {lang === "ar" ? "حساب بريدي موب" : "Baridi Mob"}</Label>
                <Input value={bariMob} onChange={(e) => setBariMob(e.target.value)} placeholder="00799999XXXXXXXXXX" /></div>
            </div>
            <Button onClick={saveProfile} variant="gold" size="sm" disabled={saving}><Save className="w-4 h-4 me-1" />{saving ? "..." : lang === "ar" ? "حفظ" : "Save"}</Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Briefcase, k: String(open.length), v: lang === "ar" ? "موجزات مفتوحة لك" : t("openBriefsFor") },
          { icon: DollarSign, k: formatDZD(earned), v: lang === "ar" ? "المكتسب" : t("earnedMonth") },
          { icon: Star, k: String(completedJobs), v: lang === "ar" ? "مهام مكتملة" : "Completed jobs" },
          { icon: Gavel, k: String(myBids.length), v: lang === "ar" ? "عروض مقدمة" : t("bidsSubmitted") },
        ].map((s) => (
          <div key={s.v} className="glass rounded-2xl p-5">
            <s.icon className="w-5 h-5 text-accent mb-2" />
            <div className="font-serif text-xl font-bold">{s.k}</div>
            <div className="text-xs text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Role filter + wilaya toggle */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{lang === "ar" ? "تخصصك" : t("yourSpeciality")}</div>
        <div className="flex flex-wrap gap-2 mb-3">
          {CREATOR_ROLES.map((r) => (
            <button key={r} onClick={() => setSelectedRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-smooth flex items-center gap-1 ${selectedRole === r ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/40"}`}>
              {ROLE_AVATARS[r]} {lang === "ar" ? CREATOR_ROLE_AR[r] : r}
            </button>
          ))}
        </div>
        {creatorWilaya && (
          <button onClick={() => setFilterWilaya((f) => !f)}
            className={`text-xs px-3 py-1 rounded-full border transition-smooth flex items-center gap-1 ${filterWilaya ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
            <MapPin className="w-3 h-3" /> {filterWilaya ? (lang === "ar" ? "نفس الولاية فقط" : t("sameWilaya")) : (lang === "ar" ? "جميع الولايات" : t("allWilayas"))}
          </button>
        )}
      </div>

      {/* Open briefs */}
      <h2 className="font-serif text-2xl font-bold mb-4">{lang === "ar" ? "الموجزات المفتوحة" : t("openBriefs")}</h2>
      {open.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          {lang === "ar" ? `لا توجد موجزات لـ ${CREATOR_ROLE_AR[selectedRole] || selectedRole} حاليًا.` : `${t("noBriefs")} ${selectedRole} ${t("checkBack")}`}
        </div>
      ) : (
        <div className="grid gap-4 mb-10">
          {open.map((b) => {
            const alreadyBid = hasBid(b.id);
            const currentBid = bidAmounts[b.id] ?? b.bidMin;
            return (
              <div key={b.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs uppercase tracking-widest text-accent">{b.serviceTitle}</span>
                      {b.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{b.clientWilaya}</span>}
                    </div>
                    <div className="font-semibold">{b.units} {b.unitLabel} — {b.brief.slice(0, 100)}{b.brief.length > 100 ? "…" : ""}</div>
                    {b.referenceLink && <a href={b.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 block">🔗 {lang === "ar" ? "رابط مرجعي" : "Reference link"}</a>}
                    {b.deadline && <div className="text-xs text-muted-foreground mt-1">📅 {b.deadline}</div>}
                    <div className="mt-3 glass rounded-xl p-3 bg-secondary/20">
                      <div className="flex items-center gap-2 mb-2"><Gavel className="w-4 h-4 text-accent" /><span className="text-xs font-semibold uppercase">{lang === "ar" ? "قدم عرضك" : t("biddingSystem")}</span></div>
                      <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                        <span>{lang === "ar" ? "الحد الأدنى" : t("minBid")}: <span className="text-foreground font-medium">{formatDZD(b.bidMin)}</span></span>
                        <span>{lang === "ar" ? "الحد الأقصى" : t("maxBid")}: <span className="text-foreground font-medium">{formatDZD(b.bidMax)}</span></span>
                      </div>
                      {alreadyBid ? (
                        <div className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {lang === "ar" ? "تم تقديم عرضك!" : t("bidSubmitted")}</div>
                      ) : (
                        <div className="flex gap-2 items-center mt-1">
                          <Input type="number" min={b.bidMin} max={b.bidMax} step={100} value={currentBid}
                            onChange={(e) => setBidAmounts((prev) => ({ ...prev, [b.id]: Number(e.target.value) }))}
                            className="h-8 text-sm max-w-[140px]" />
                          <span className="text-xs text-muted-foreground">دج</span>
                          <Button variant="gold" size="sm" onClick={() => submitBid(b.id, b.bidMin, b.bidMax)}>
                            <Gavel className="w-3 h-3" /> {lang === "ar" ? "قدّم" : t("submitBid")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-accent font-semibold">{formatDZD(b.bidMax)}</div>
                    <div className="text-xs text-muted-foreground">{lang === "ar" ? "مدفوعاتك" : t("yourPayout")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My bids + deliverable submission */}
      {myBids.length > 0 && (
        <section className="mt-4">
          <h2 className="font-serif text-2xl font-bold mb-4">{lang === "ar" ? "عروضي" : t("currentBids")}</h2>
          <div className="grid gap-3">
            {myBids.map((bid) => {
              const offer = offers.find((o) => o.id === bid.offerId);
              return (
                <div key={bid.id} className="glass rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-medium">{offer?.serviceTitle || "Offer"}</span>
                      <span className="text-xs text-muted-foreground ms-2">{offer?.units} {offer?.unitLabel}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-accent font-semibold">{formatDZD(bid.amount)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${bid.status === "accepted" ? "bg-emerald-400/20 text-emerald-400" : bid.status === "rejected" ? "bg-destructive/20 text-destructive" : bid.status === "delivered" ? "bg-purple-400/20 text-purple-400" : "bg-secondary text-muted-foreground"}`}>
                        {bid.status === "accepted" && (lang === "ar" ? "مقبول ✓" : "Accepted ✓")}
                        {bid.status === "rejected" && (lang === "ar" ? "مرفوض" : "Rejected")}
                        {bid.status === "delivered" && (lang === "ar" ? "تم التسليم" : "Delivered")}
                        {bid.status === "pending" && (lang === "ar" ? "في الانتظار" : "Pending")}
                      </span>
                    </div>
                  </div>
                  {/* Deliverable upload for accepted bids */}
                  {bid.status === "accepted" && (
                    <div className="flex gap-2 items-center mt-2 pt-2 border-t border-border">
                      <Input type="url" placeholder={lang === "ar" ? "https://drive.google.com/... رابط التسليم" : "https://drive.google.com/... delivery link"}
                        value={deliverableLinks[bid.id] || ""}
                        onChange={(e) => setDeliverableLinks((prev) => ({ ...prev, [bid.id]: e.target.value }))}
                        className="h-8 text-sm flex-1" />
                      <Button size="sm" variant="gold" onClick={() => handleDeliverable(bid.id)}>
                        <Upload className="w-3 h-3 me-1" />{lang === "ar" ? "رفع" : "Submit"}
                      </Button>
                    </div>
                  )}
                  {bid.deliverableLink && <div className="mt-1"><a href={bid.deliverableLink} target="_blank" rel="noreferrer" className="text-xs text-purple-400 underline">📦 {bid.deliverableLink}</a></div>}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </PortalShell>
  );
};

export default CreatorPortal;
