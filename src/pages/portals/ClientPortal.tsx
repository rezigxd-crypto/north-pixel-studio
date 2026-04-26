import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus, FolderKanban, Clock, CheckCircle2, XCircle,
  Gavel, MapPin, Edit2, Save, Phone, CreditCard, Link2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OfferMap } from "@/components/OfferMap";
import { OFFERS, formatDZD, formatStartingPrice } from "@/lib/offers";
import { useOffers, useBids, updateUserProfile } from "@/lib/store";
import { PostProjectWizard } from "@/components/PostProjectWizard";
import { ProfilePicUpload } from "@/components/ProfilePicUpload";
import { Countdown } from "@/components/Countdown";
import { ProjectWorkspace } from "@/components/ProjectWorkspace";
import { useApp } from "@/lib/context";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const CLIENT_AVATARS = [
  { id: "brand", emoji: "🏢" }, { id: "university", emoji: "🎓" },
  { id: "store", emoji: "🛍️" }, { id: "realestate", emoji: "🏠" },
  { id: "film", emoji: "🎬" }, { id: "media", emoji: "📺" },
];

const StatusBadge = ({ status, lang }: { status: string; lang: string }) => {
  const map: Record<string, { label: string; labelAr: string; cls: string; Icon: any }> = {
    pending_admin: { label: "Pending review", labelAr: "في انتظار المراجعة", cls: "text-accent", Icon: Clock },
    open:          { label: "Live — receiving bids", labelAr: "مباشر — يستقبل عروضًا", cls: "text-emerald-400", Icon: CheckCircle2 },
    assigned:      { label: "Assigned to freelancer", labelAr: "تم تعيين عامل حر", cls: "text-blue-400", Icon: CheckCircle2 },
    delivered:     { label: "Delivered", labelAr: "تم التسليم", cls: "text-purple-400", Icon: CheckCircle2 },
    rejected:      { label: "Rejected", labelAr: "مرفوض", cls: "text-destructive", Icon: XCircle },
  };
  const s = map[status] || map.rejected;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${s.cls}`}>
      <s.Icon className="w-3.5 h-3.5" />
      {lang === "ar" ? s.labelAr : s.label}
    </span>
  );
};

const ClientPortal = () => {
  const { auth, lang, refreshAuth } = useApp();
  const navigate = useNavigate();
  const offers = useOffers();
  const bids = useBids();

  const [activeTab, setActiveTab] = useState<"projects" | "profile">("projects");
  const [editMode, setEditMode] = useState(false);
  const [profilePhone, setProfilePhone] = useState("");
  const [profileBariMob, setProfileBariMob] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("brand");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.role !== "client") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  useEffect(() => {
    if (auth.avatar) setSelectedAvatar(auth.avatar);
    if (auth.phone) setProfilePhone(auth.phone);
  }, [auth.avatar, auth.phone]);

  const myOffers = offers.filter((o) => o.clientEmail === auth.email);
  const pending  = myOffers.filter((o) => o.status === "pending_admin").length;
  const live     = myOffers.filter((o) => o.status === "open").length;
  const assigned = myOffers.filter((o) => o.status === "assigned" || o.status === "delivered").length;

  const saveProfile = async () => {
    if (!auth.uid) return;
    setSaving(true);
    try {
      await updateUserProfile(auth.uid, { phone: profilePhone, bariMobAccount: profileBariMob, avatar: selectedAvatar });
      await refreshAuth();
      toast.success(lang === "ar" ? "✓ تم الحفظ." : "✓ Saved.");
      setEditMode(false);
    } catch { toast.error(lang === "ar" ? "فشل الحفظ." : "Save failed."); }
    finally { setSaving(false); }
  };

  if (auth.loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-glow-pulse text-accent font-serif text-2xl">North Pixel</div>
    </div>
  );

  const TABS = [
    { id: "projects", label: lang === "ar" ? "مشاريعي" : "My Projects" },
    { id: "profile",  label: lang === "ar" ? "ملفي" : "My Profile" },
  ] as const;

  return (
    <PortalShell title={lang === "ar" ? "لوحة العميل" : "Client Dashboard"} subtitle="North Pixel Studio">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-royal flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
            {auth.profilePic
              ? <img src={auth.profilePic} alt="" className="w-full h-full object-cover" />
              : (CLIENT_AVATARS.find(a => a.id === selectedAvatar)?.emoji || "🏢")}
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold">{auth.name}</h1>
            <div className="text-sm text-muted-foreground">{auth.email}</div>
            {auth.wilaya && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="w-3 h-3 text-accent" />{auth.wilaya}
              </div>
            )}
          </div>
        </div>
        <PostProjectWizard
          trigger={
            <Button variant="royal">
              <Plus className="w-4 h-4 me-1" />
              {lang === "ar" ? "نشر مشروع جديد" : "Post a project"}
            </Button>
          }
          clientName={auth.name}
          clientEmail={auth.email}
          clientWilaya={auth.wilaya}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { icon: FolderKanban, k: String(myOffers.length), v: lang === "ar" ? "إجمالي المشاريع" : "Total projects" },
          { icon: Clock,        k: String(pending),          v: lang === "ar" ? "في الانتظار" : "Pending review" },
          { icon: Gavel,        k: String(live),             v: lang === "ar" ? "يستقبل عروضًا" : "Receiving bids" },
        ].map((s) => (
          <div key={s.v} className="glass rounded-2xl p-4 text-center">
            <s.icon className="w-4 h-4 text-accent mx-auto mb-2" />
            <div className="font-serif text-2xl font-bold">{s.k}</div>
            <div className="text-[11px] text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-2xl mb-8">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-medium transition-smooth ${activeTab === tab.id ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ PROJECTS ══ */}
      {activeTab === "projects" && (
        <div className="space-y-3">
          {myOffers.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-muted-foreground mb-4">{lang === "ar" ? "لم تنشر أي مشروع بعد." : "No projects posted yet."}</p>
              <PostProjectWizard
                trigger={<Button variant="gold"><Plus className="w-4 h-4 me-1" />{lang === "ar" ? "انشر مشروعك الأول" : "Post first project"}</Button>}
                clientName={auth.name} clientEmail={auth.email} clientWilaya={auth.wilaya}
              />
            </div>
          ) : (
            myOffers.map((p) => {
              const offerBids = bids.filter((b) => b.offerId === p.id);
              const acceptedBid = offerBids.find((b) => b.status === "accepted");
              const deliveredBid = offerBids.find((b) => b.status === "delivered");
              const pendingBidCount = offerBids.filter((b) => b.status === "pending").length;
              return (
                <div key={p.id} className="glass rounded-2xl p-5 hover:border-accent/20 transition-smooth">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold">{p.serviceTitle}</span>
                        {p.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {p.clientWilaya}</span>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.brief}</p>

                      {p.referenceLink && (
                        <a href={p.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 flex items-center gap-1">
                          <Link2 className="w-3 h-3" />{lang === "ar" ? "الرابط المرجعي" : "Reference link"}
                        </a>
                      )}

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <StatusBadge status={p.status} lang={lang} />
                        {p.status === "open" && pendingBidCount > 0 && (
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <Gavel className="w-3 h-3" />{pendingBidCount} {lang === "ar" ? "عرض مستلم" : "bids received"}
                          </span>
                        )}
                        {acceptedBid && (
                          <span className="text-xs text-blue-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {lang === "ar" ? `تم التعيين — ${acceptedBid.creatorName}` : `Assigned to ${acceptedBid.creatorName}`}
                          </span>
                        )}
                        {deliveredBid?.deliverableLink && (
                          <a href={deliveredBid.deliverableLink} target="_blank" rel="noreferrer"
                            className="text-xs text-purple-400 underline flex items-center gap-1">
                            📦 {lang === "ar" ? "عرض التسليم" : "View deliverable"}
                          </a>
                        )}
                        {p.deadline && (p.status === "open" || p.status === "assigned") && (
                          <Countdown
                            deadline={p.deadline}
                            lang={lang}
                            label={{ ar: "الموعد النهائي", en: "Deadline", fr: "Échéance" }}
                            urgentMs={24 * 3600 * 1000}
                          />
                        )}
                      </div>

                      {/* Workspace — appears once a creator is assigned. */}
                      {acceptedBid && (
                        <ProjectWorkspace
                          offer={p}
                          acceptedBid={acceptedBid}
                          viewer="client"
                          lang={lang}
                        />
                      )}

                      {/* Location map — shown for any project that has a wilaya, regardless of status */}
                      {p.clientWilaya && (
                        <div className="mt-3">
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
                            <MapPin className="w-3 h-3 text-accent" />
                            <span>{lang === "ar" ? "الموقع:" : "Location:"}</span>
                            <span className="text-foreground font-medium">{p.clientWilaya}</span>
                          </div>
                          <OfferMap wilaya={p.clientWilaya} className="border border-border/40" />
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {/* Only show total price — no cut breakdown */}
                      <div className="text-accent font-bold">{formatDZD(p.totalPrice)}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {p.deadline ? `📅 ${p.deadline}` : lang === "ar" ? "بلا موعد" : "No deadline"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ PROFILE ══ */}
      {activeTab === "profile" && (
        <div className="space-y-5 max-w-lg">
          {/* Profile picture upload */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-4">{lang === "ar" ? "الصورة الشخصية" : "Profile picture"}</h3>
            <ProfilePicUpload
              uid={auth.uid}
              currentUrl={auth.profilePic}
              fallback={<span>{CLIENT_AVATARS.find(a => a.id === selectedAvatar)?.emoji || "🏢"}</span>}
              onChange={refreshAuth}
              lang={lang}
              accent="royal"
            />
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">{lang === "ar" ? "رمز احتياطي (إيموجي)" : "Fallback emoji"}</h3>
              <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              {lang === "ar"
                ? "يُستخدم عندما لا تكون الصورة الشخصية مرفوعة."
                : "Shown when no profile picture is uploaded."}
            </p>
            <div className="flex gap-3 flex-wrap">
              {CLIENT_AVATARS.map((a) => (
                <button key={a.id} onClick={() => editMode && setSelectedAvatar(a.id)}
                  className={`w-12 h-12 rounded-xl text-2xl transition-smooth ${selectedAvatar === a.id ? "ring-2 ring-accent bg-accent/10 scale-110" : "bg-secondary/40"} ${!editMode ? "cursor-default" : "hover:scale-105"}`}>
                  {a.emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold">{lang === "ar" ? "معلوماتي" : "My Info"}</h3>
            <div className="text-sm space-y-2">
              <div><span className="text-muted-foreground">{lang === "ar" ? "الاسم: " : "Name: "}</span>{auth.name}</div>
              <div><span className="text-muted-foreground">{lang === "ar" ? "البريد: " : "Email: "}</span>{auth.email}</div>
              <div><span className="text-muted-foreground">{lang === "ar" ? "الولاية: " : "Wilaya: "}</span>{auth.wilaya || "—"}</div>
            </div>

            {editMode && (
              <div className="space-y-4 pt-3 border-t border-border">
                <div>
                  <Label className="flex items-center gap-1"><Phone className="w-3 h-3" />{lang === "ar" ? "رقم الهاتف" : "Phone"}</Label>
                  <Input value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+213 XXX XXX XXX" className="mt-1" />
                </div>
                <div>
                  <Label className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{lang === "ar" ? "حساب بريدي موب" : "Baridi Mob"}</Label>
                  <Input value={profileBariMob} onChange={(e) => setProfileBariMob(e.target.value)} placeholder="007999990XXXXXXXXX" className="mt-1" />
                </div>
                <Button variant="royal" className="w-full" onClick={saveProfile} disabled={saving}>
                  <Save className="w-4 h-4 me-1" />{saving ? "..." : lang === "ar" ? "حفظ" : "Save"}
                </Button>
              </div>
            )}

            {!editMode && (
              <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                <Edit2 className="w-3.5 h-3.5 me-1" />{lang === "ar" ? "تعديل البيانات" : "Edit details"}
              </Button>
            )}
          </div>

          {/* Browse services */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-semibold mb-3">{lang === "ar" ? "تصفح خدماتنا" : "Browse services"}</h3>
            <div className="grid grid-cols-2 gap-2">
              {OFFERS.map((o) => (
                <Link to={`/services/${o.slug}`} key={o.slug}
                  className="glass rounded-xl p-3 hover:border-accent/40 transition-smooth">
                  <div className="text-sm font-medium">{o.title[lang]}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatStartingPrice(o.startingPrice, lang)}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
};

export default ClientPortal;
