import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, FolderKanban, Clock, CheckCircle2, XCircle, Gavel, MapPin, User, Phone, CreditCard, Edit2, Save } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OFFERS, formatDZD } from "@/lib/offers";
import { useOffers, useBids, updateUserProfile } from "@/lib/store";
import { PostProjectWizard } from "@/components/PostProjectWizard";
import { useApp } from "@/lib/context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CLIENT_AVATARS = [
  { id: "brand", emoji: "🏢", label: "Brand" },
  { id: "university", emoji: "🎓", label: "University" },
  { id: "store", emoji: "🛍️", label: "Store" },
  { id: "realestate", emoji: "🏠", label: "Real Estate" },
  { id: "film", emoji: "🎬", label: "Film" },
  { id: "media", emoji: "📺", label: "Media" },
];

const statusBadge = (s: string, lang: string) => {
  if (s === "pending_admin") return { label: lang === "ar" ? "في انتظار المراجعة" : "Pending review", icon: Clock, cls: "text-accent" };
  if (s === "open") return { label: lang === "ar" ? "مباشر — يستقبل عروض" : "Live — receiving bids", icon: CheckCircle2, cls: "text-emerald-400" };
  if (s === "assigned") return { label: lang === "ar" ? "تم التعيين" : "Assigned", icon: CheckCircle2, cls: "text-blue-400" };
  if (s === "delivered") return { label: lang === "ar" ? "تم التسليم" : "Delivered", icon: CheckCircle2, cls: "text-purple-400" };
  return { label: lang === "ar" ? "مرفوض" : "Rejected", icon: XCircle, cls: "text-destructive" };
};

const ClientPortal = () => {
  const { t, auth, lang, refreshAuth } = useApp();
  const navigate = useNavigate();
  const offers = useOffers();
  const bids = useBids();
  const [editingProfile, setEditingProfile] = useState(false);
  const [phone, setPhone] = useState(auth.name ? "" : "");
  const [bariMob, setBariMob] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("brand");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.role !== "client") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  const myOffers = offers.filter((o) => o.clientEmail === auth.email);
  const pending = myOffers.filter((o) => o.status === "pending_admin").length;
  const live = myOffers.filter((o) => o.status === "open").length;
  const assigned = myOffers.filter((o) => o.status === "assigned").length;

  const saveProfile = async () => {
    if (!auth.uid) return;
    setSavingProfile(true);
    try {
      await updateUserProfile(auth.uid, { phone, bariMobAccount: bariMob, avatar: selectedAvatar });
      await refreshAuth();
      toast.success(lang === "ar" ? "تم حفظ الملف الشخصي." : "Profile saved.");
      setEditingProfile(false);
    } catch { toast.error("فشل الحفظ."); }
    finally { setSavingProfile(false); }
  };

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <PortalShell title={lang === "ar" ? "لوحة تحكم العميل" : t("clientCommandCenter")} subtitle="North Pixel Studio">

      {/* Profile card */}
      <div className="glass rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-royal flex items-center justify-center text-3xl">
              {CLIENT_AVATARS.find(a => a.id === selectedAvatar)?.emoji || "🏢"}
            </div>
            <div>
              <div className="font-serif text-xl font-bold">{auth.name}</div>
              <div className="text-sm text-muted-foreground">{auth.email}</div>
              {auth.wilaya && <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1"><MapPin className="w-3 h-3" />{auth.wilaya}</div>}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setEditingProfile(!editingProfile)}>
            <Edit2 className="w-4 h-4 me-1" />{lang === "ar" ? "تعديل" : "Edit"}
          </Button>
        </div>

        {editingProfile && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div>
              <Label className="mb-2 block">{lang === "ar" ? "اختر صورة رمزية" : "Choose avatar"}</Label>
              <div className="flex flex-wrap gap-2">
                {CLIENT_AVATARS.map((a) => (
                  <button key={a.id} type="button" onClick={() => setSelectedAvatar(a.id)}
                    className={`w-12 h-12 rounded-xl text-2xl transition-smooth ${selectedAvatar === a.id ? "ring-2 ring-accent bg-accent/10" : "bg-secondary/40 hover:bg-secondary/60"}`}>
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1"><Phone className="w-3 h-3" /> {lang === "ar" ? "رقم الهاتف" : "Phone number"}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213 X XX XX XX XX" />
              </div>
              <div>
                <Label className="flex items-center gap-1"><CreditCard className="w-3 h-3" /> {lang === "ar" ? "حساب بريدي موب" : "Baridi Mob account"}</Label>
                <Input value={bariMob} onChange={(e) => setBariMob(e.target.value)} placeholder="00799999XXXXXXXXXX" />
              </div>
            </div>
            <Button onClick={saveProfile} variant="royal" size="sm" disabled={savingProfile}>
              <Save className="w-4 h-4 me-1" />{savingProfile ? "..." : lang === "ar" ? "حفظ" : "Save"}
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <h1 className="font-serif text-2xl font-bold">{lang === "ar" ? "مشاريعك" : t("yourProjects")}</h1>
        <PostProjectWizard trigger={<Button variant="royal"><Plus /> {lang === "ar" ? "نشر مشروع" : t("postProject")}</Button>}
          clientName={auth.name} clientEmail={auth.email} clientWilaya={auth.wilaya} />
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FolderKanban, k: String(myOffers.length), v: lang === "ar" ? "المشاريع المنشورة" : t("projectsPosted") },
          { icon: Clock, k: String(pending), v: lang === "ar" ? "في انتظار المراجعة" : t("awaitingReview") },
          { icon: CheckCircle2, k: String(live), v: lang === "ar" ? "يستقبل عروضًا" : t("liveReceivingBids") },
          { icon: Gavel, k: String(assigned), v: lang === "ar" ? "تم التعيين" : "Assigned" },
        ].map((s) => (
          <div key={s.v} className="glass rounded-2xl p-5">
            <s.icon className="w-5 h-5 text-accent mb-3" />
            <div className="font-serif text-2xl font-bold">{s.k}</div>
            <div className="text-sm text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Projects list */}
      {myOffers.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center">
          <p className="text-muted-foreground mb-4">{t("noProjectsYet")}</p>
          <PostProjectWizard trigger={<Button variant="gold"><Plus /> {t("postFirstProject")}</Button>}
            clientName={auth.name} clientEmail={auth.email} clientWilaya={auth.wilaya} />
        </div>
      ) : (
        <div className="grid gap-3 mb-10">
          {myOffers.map((p) => {
            const s = statusBadge(p.status, lang);
            const offerBids = bids.filter((b) => b.offerId === p.id);
            const acceptedBid = offerBids.find((b) => b.status === "accepted");
            const deliveredBid = offerBids.find((b) => b.status === "delivered");
            return (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <div className="font-semibold">{p.serviceTitle}</div>
                    <div className="text-sm text-muted-foreground">{p.units} {p.unitLabel} · {p.brief.slice(0, 80)}{p.brief.length > 80 ? "…" : ""}</div>
                    {p.referenceLink && <a href={p.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 block">🔗 {lang === "ar" ? "الرابط المرجعي" : "Reference link"}</a>}
                    <div className={`text-xs mt-2 inline-flex items-center gap-1 ${s.cls}`}><s.icon className="w-3.5 h-3.5" /> {s.label}</div>
                    {acceptedBid && <div className="mt-1 text-xs text-blue-400 flex items-center gap-1"><Gavel className="w-3 h-3" /> {lang === "ar" ? `تم التعيين لـ ${acceptedBid.creatorName}` : `Assigned to ${acceptedBid.creatorName}`} · {formatDZD(acceptedBid.amount)}</div>}
                    {deliveredBid?.deliverableLink && (
                      <a href={deliveredBid.deliverableLink} target="_blank" rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-purple-400 underline">
                        📦 {lang === "ar" ? "عرض التسليم" : "View deliverable"}
                      </a>
                    )}
                    {p.status === "open" && offerBids.length > 0 && <div className="mt-1 text-xs text-emerald-400">🎯 {offerBids.length} {lang === "ar" ? "عرض مستلم" : "bids received"}</div>}
                  </div>
                  <div className="text-right">
                    <div className="text-accent font-semibold">{formatDZD(p.totalPrice)}</div>
                    <div className="text-xs text-muted-foreground">{p.deadline ? `📅 ${p.deadline}` : lang === "ar" ? "بلا موعد" : "no deadline"}</div>
                    {p.advancePaid && <div className="text-xs text-yellow-400 mt-1">✓ {lang === "ar" ? "الدفع المسبق مؤكد" : "Advance paid"}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Browse services */}
      <section>
        <h2 className="font-serif text-2xl font-bold mb-4">{t("browseServices")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFERS.map((o) => (
            <Link to={`/services/${o.slug}`} key={o.slug} className="glass rounded-2xl overflow-hidden hover:border-accent/40 transition-smooth">
              <div className="h-24 overflow-hidden"><img src={o.image} alt={o.title[lang]} className="w-full h-full object-cover" /></div>
              <div className="p-4"><div className="font-semibold text-sm">{o.title[lang]}</div><div className="text-xs text-muted-foreground mt-1">{o.startingPrice}</div></div>
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
  );
};

export default ClientPortal;
