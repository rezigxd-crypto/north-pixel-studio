import { PortalShell } from "@/components/PortalShell";
import { AdminBundles } from "@/components/AdminBundles";
import { Users, Camera, FolderKanban, DollarSign, Check, X, Bell, Clock, Gavel, Link2, UserSquare2, TrendingUp, AlertCircle, Eye, ChevronDown, ChevronUp, MapPin, Phone, Wallet, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreators, useOffers, useBids, useUserCounts, useAllUsers, setCreatorStatus, setOfferStatus, acceptBid, useClientTags, setClientTag, type ClientTagType } from "@/lib/store";
import { useAllSubscriptions } from "@/lib/bundles";
import { formatDZD, CREATOR_ROLE_AR, getRank, RANK_LEVELS } from "@/lib/offers";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

const StatCard = ({ icon: Icon, value, label, color = "accent" }: { icon: React.ElementType; value: string; label: string; color?: string }) => (
  <div className="glass rounded-2xl p-4 flex flex-col gap-2 hover:border-accent/40 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-12px_hsl(41_67%_60%/0.5)] transition-smooth">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ${color === "green" ? "bg-emerald-500/15 text-emerald-400 ring-emerald-400/20" : color === "yellow" ? "bg-yellow-400/15 text-yellow-400 ring-yellow-400/20" : color === "blue" ? "bg-primary/20 text-primary-foreground ring-primary/30" : color === "red" ? "bg-destructive/15 text-destructive ring-destructive/20" : "bg-accent/15 text-accent ring-accent/30"}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="font-serif text-xl md:text-2xl font-bold leading-none">{value}</div>
    <div className="text-[11px] text-muted-foreground">{label}</div>
  </div>
);

const SectionHeader = ({ title, count, color = "accent" }: { title: string; count?: number; color?: "accent" | "blue" | "green" }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <span className={`block w-1 h-5 rounded-full ${color === "blue" ? "bg-primary" : color === "green" ? "bg-emerald-400" : "bg-gradient-to-b from-accent to-accent/30"}`} />
      <h2 className="font-serif text-xl font-bold">{title}</h2>
    </div>
    {typeof count === "number" && count > 0 && <Pill color={color === "blue" ? "blue" : color === "green" ? "green" : "accent"}>{count}</Pill>}
  </div>
);

const Avatar = ({ src, fallback, ring = true }: { src?: string; fallback: string; ring?: boolean }) => (
  <div className={`w-11 h-11 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground flex-shrink-0 text-lg overflow-hidden ${ring ? "ring-1 ring-accent/30" : ""}`}>
    {src
      ? <img src={src} alt="" className="w-full h-full object-cover" />
      : (fallback || "?").trim().charAt(0).toUpperCase() || "?"}
  </div>
);

const Field = ({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value?: string; href?: string }) => {
  if (!value) return null;
  const inner = (
    <div className="flex items-center gap-2 text-xs">
      <Icon className="w-3.5 h-3.5 text-accent/80 flex-shrink-0" />
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium truncate">{value}</span>
    </div>
  );
  if (href) return <a href={href} className="hover:text-accent transition-smooth" dir="ltr">{inner}</a>;
  return inner;
};

const Pill = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color === "red" ? "bg-destructive/20 text-destructive" : color === "green" ? "bg-emerald-400/20 text-emerald-400" : color === "yellow" ? "bg-yellow-400/20 text-yellow-400" : color === "blue" ? "bg-primary/20 text-primary-foreground" : "bg-accent/20 text-accent"}`}>{children}</span>
);

// Admin-only B2B / B2G classification chip. Two distinct colors so the
// admin can scan the client list at a glance:
//   • #B2B — royal blue (private-sector business clients)
//   • #B2G — gold (public-sector / government clients)
const ClientTagChip = ({ tag }: { tag: ClientTagType }) => (
  <span
    className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
      tag === "b2b"
        ? "bg-primary/20 text-primary-foreground border-primary/40"
        : "bg-accent/20 text-accent border-accent/40"
    }`}
    title={tag === "b2b" ? "Business client" : "Government / institutional client"}
  >
    #{tag.toUpperCase()}
  </span>
);

const Empty = ({ msg }: { msg: string }) => (
  <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
    <Eye className="w-8 h-8 text-muted-foreground/30" />{msg}
  </div>
);

const AdminPortal = () => {
  const { auth, lang } = useApp();
  const navigate = useNavigate();
  const creators = useCreators();
  const offers = useOffers();
  const bids = useBids();
  const userCounts = useUserCounts();
  const allUsers = useAllUsers();
  const [activeTab, setActiveTab] = useState<"overview" | "offers" | "bids" | "creators" | "clients" | "bundles">("overview");
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const subscriptions = useAllSubscriptions();
  const pendingBundleRequests = subscriptions.filter((s) => s.status === "pending").length;
  const clientTags = useClientTags();

  const handleSetClientTag = async (uid: string, tag: ClientTagType | null) => {
    try {
      await setClientTag(uid, tag);
      toast.success(
        tag
          ? (lang === "ar" ? `تم تعيين #${tag.toUpperCase()}` : `Tagged as #${tag.toUpperCase()}`)
          : (lang === "ar" ? "تم مسح الوسم" : "Tag cleared")
      );
    } catch {
      toast.error(lang === "ar" ? "فشل تحديث الوسم" : "Failed to update tag");
    }
  };

  // Allow deep-linking to a tab via ?tab=bundles (from notifications).
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "bundles" || tab === "offers" || tab === "bids" || tab === "creators" || tab === "clients") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Auth guard. Only the admin may view this portal. Authenticated
  // non-admin users are rerouted to their own portal rather than bounced
  // to the login screen; unauthenticated visitors still go to /auth/login.
  //
  // `auth.loading` stays true throughout the async sign-in window (set by
  // onAuthStateChanged and cleared by loadUser), so a role-null state once
  // loading is false is a *terminal* state — the Firestore doc is genuinely
  // missing. Treat it as unauthenticated and redirect to /auth/login.
  useEffect(() => {
    if (auth.loading) return;
    if (!auth.uid || !auth.role) { navigate("/auth/login"); return; }
    if (auth.role !== "admin") navigate(`/portal/${auth.role}`);
  }, [auth.loading, auth.uid, auth.role, navigate]);

  const pendingCreators = creators.filter((c) => c.status === "pending");
  const approvedCreators = creators.filter((c) => c.status === "approved");
  const pendingOffers = offers.filter((o) => o.status === "pending_admin");
  const liveOffers = offers.filter((o) => o.status === "open");
  const assignedOffers = offers.filter((o) => o.status === "assigned");
  const revenue = [...liveOffers, ...assignedOffers].reduce((sum, o) => sum + o.adminCut, 0);
  const notifications = pendingCreators.length + pendingOffers.length;

  const clients = allUsers.filter((u) => u.role === "client");
  const userByEmail = (email: string) => allUsers.find((u) => u.email === email);
  const pendingBids = (offerId: string) => bids.filter((b) => b.offerId === offerId && b.status === "pending");
  const creatorJobs = (email: string) => bids.filter((b) => b.creatorEmail === email && b.status === "accepted").length;
  const creatorEarned = (email: string) => bids.filter((b) => b.creatorEmail === email && b.status === "accepted").reduce((s, b) => s + b.amount, 0);
  const clientOffers = (email: string) => offers.filter((o) => o.clientEmail === email).length;

  const approveCreator = async (id: string, name: string) => { await setCreatorStatus(id, "approved"); toast.success(`${name} — ${lang === "ar" ? "تمت الموافقة" : "approved"}`); };
  const rejectCreator = async (id: string, name: string) => { await setCreatorStatus(id, "rejected"); toast.error(`${name} — ${lang === "ar" ? "مرفوض" : "rejected"}`); };
  const acceptOffer = async (id: string, title: string) => { await setOfferStatus(id, "open"); toast.success(`${title} — ${lang === "ar" ? "مباشر" : "live"}`); };
  const rejectOffer = async (id: string) => { await setOfferStatus(id, "rejected"); toast.error(lang === "ar" ? "مرفوض" : "Rejected"); };
  const handleAcceptBid = async (bidId: string, offerId: string, name: string, amount: number) => { await acceptBid(bidId, offerId); toast.success(`${name} — ${formatDZD(amount)}`); };

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-glow-pulse text-accent font-serif text-2xl">North Pixel</div></div>;

  const TABS = [
    { id: "overview",  label: lang === "ar" ? "نظرة عامة" : "Overview" },
    { id: "offers",    label: lang === "ar" ? `العروض${pendingOffers.length > 0 ? ` (${pendingOffers.length})` : ""}` : `Offers${pendingOffers.length > 0 ? ` (${pendingOffers.length})` : ""}` },
    { id: "bids",      label: lang === "ar" ? "المزايدات" : "Bids" },
    { id: "bundles",   label: lang === "ar" ? `الباقات${pendingBundleRequests > 0 ? ` (${pendingBundleRequests})` : ""}` : `Bundles${pendingBundleRequests > 0 ? ` (${pendingBundleRequests})` : ""}` },
    { id: "creators",  label: lang === "ar" ? `العمال${pendingCreators.length > 0 ? ` (${pendingCreators.length})` : ""}` : `Creators${pendingCreators.length > 0 ? ` (${pendingCreators.length})` : ""}` },
    { id: "clients",   label: lang === "ar" ? `العملاء (${clients.length})` : `Clients (${clients.length})` },
  ] as const;

  return (
    <PortalShell title={lang === "ar" ? "لوحة الإدارة" : "Admin Panel"} subtitle="North Pixel Studio" accent="destructive">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-destructive uppercase tracking-widest mb-1">{lang === "ar" ? "العمليات" : "Operations"}</p>
          <h1 className="font-serif text-2xl md:text-3xl font-bold">{lang === "ar" ? "الاستوديو في لمحة" : "Studio at a glance"}</h1>
        </div>
        {notifications > 0 && (
          <div className="glass rounded-full px-4 py-2 inline-flex items-center gap-2 border border-destructive/30 animate-glow-pulse self-start">
            <Bell className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">{notifications} {lang === "ar" ? "إشعار" : "alerts"}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard icon={UserSquare2} value={String(Math.max(userCounts.clients, clients.length))} label={lang === "ar" ? "عملاء" : "Clients"} color="blue" />
        <StatCard icon={Users} value={String(approvedCreators.length)} label={lang === "ar" ? "عمال حرون" : "Freelancers"} color="accent" />
        <StatCard icon={Camera} value={String(pendingCreators.length)} label={lang === "ar" ? "بانتظار الموافقة" : "Pending"} color="yellow" />
        <StatCard icon={FolderKanban} value={String(liveOffers.length + assignedOffers.length)} label={lang === "ar" ? "مشاريع" : "Projects"} color="yellow" />
        <StatCard icon={DollarSign} value={formatDZD(revenue)} label={lang === "ar" ? "إيراداتي" : "Revenue"} color="green" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-2xl mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-smooth whitespace-nowrap ${activeTab === tab.id ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {pendingOffers.length > 0 && (
            <button onClick={() => setActiveTab("offers")} className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:border-yellow-400/40 transition-smooth text-start">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-4 h-4 text-yellow-400" /></div>
              <div className="flex-1"><div className="font-semibold text-sm">{pendingOffers.length} {lang === "ar" ? "عرض ينتظر" : "offer(s) waiting"}</div><div className="text-xs text-muted-foreground">{lang === "ar" ? "انقر للمراجعة" : "Click to review"}</div></div>
              <TrendingUp className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            </button>
          )}
          {pendingCreators.length > 0 && (
            <button onClick={() => setActiveTab("creators")} className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:border-accent/40 transition-smooth text-start">
              <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0"><Users className="w-4 h-4 text-accent" /></div>
              <div className="flex-1"><div className="font-semibold text-sm">{pendingCreators.length} {lang === "ar" ? "عامل ينتظر" : "creator(s) pending"}</div><div className="text-xs text-muted-foreground">{lang === "ar" ? "انقر للموافقة" : "Click to approve"}</div></div>
              <TrendingUp className="w-4 h-4 text-accent flex-shrink-0" />
            </button>
          )}
          {notifications === 0 && <div className="glass rounded-2xl p-8 text-center"><div className="text-3xl mb-2">&#x2714;</div><p className="text-muted-foreground text-sm">{lang === "ar" ? "لا إشعارات جديدة." : "All clear."}</p></div>}
          {offers.length > 0 && (
            <div>
              <h3 className="font-serif text-lg font-bold mb-3 mt-2">{lang === "ar" ? "آخر المشاريع" : "Recent projects"}</h3>
              <div className="space-y-2">
                {offers.slice(0, 6).map((o) => (
                  <div key={o.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0"><div className="font-medium text-sm truncate">{o.serviceTitle}</div><div className="text-xs text-muted-foreground">{o.clientName}{o.clientWilaya ? ` · ${o.clientWilaya}` : ""}</div></div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-accent font-semibold text-sm">{formatDZD(o.totalPrice)}</span>
                      <Pill color={o.status === "open" ? "green" : o.status === "assigned" ? "yellow" : o.status === "rejected" ? "red" : "accent"}>
                        {o.status === "pending_admin" ? (lang === "ar" ? "معلق" : "Pending") : o.status === "open" ? (lang === "ar" ? "مباشر" : "Live") : o.status === "assigned" ? (lang === "ar" ? "معيّن" : "Assigned") : lang === "ar" ? "مرفوض" : "Rejected"}
                      </Pill>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OFFERS */}
      {activeTab === "offers" && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl font-bold">{lang === "ar" ? "عروض معلقة" : "Pending"}</h2>{pendingOffers.length > 0 && <Pill color="yellow">{pendingOffers.length}</Pill>}</div>
            {pendingOffers.length === 0 ? <Empty msg={lang === "ar" ? "لا عروض معلقة." : "No pending offers."} /> : (
              <div className="space-y-3">
                {pendingOffers.map((o) => (
                  <div key={o.id} className="glass rounded-2xl p-5 border border-yellow-400/10">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold uppercase tracking-widest text-accent">{o.serviceTitle}</span>
                          {o.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {o.clientWilaya}</span>}
                          {o.advancePaid && <Pill color="green">{lang === "ar" ? "دفع مسبق" : "Advance paid"}</Pill>}
                        </div>
                        <p className="font-semibold">{o.clientName}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.brief}</p>
                        {o.referenceLink && <a href={o.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 flex items-center gap-1"><Link2 className="w-3 h-3" />{lang === "ar" ? "رابط مرجعي" : "Reference"}</a>}
                        {o.scriptUrl && (
                          <a href={o.scriptUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {lang === "ar" ? "السيناريو (PDF)" : lang === "fr" ? "Script (PDF)" : "Script (PDF)"}
                            {o.scriptName ? ` — ${o.scriptName}` : ""}
                          </a>
                        )}
                        {o.voiceGender && o.voiceGender !== "any" && (
                          <p className="text-xs text-muted-foreground mt-1">🎙️ <span className="text-foreground">{o.voiceGender === "male" ? (lang === "ar" ? "صوت ذكوري" : lang === "fr" ? "Voix masculine" : "Male voice") : (lang === "ar" ? "صوت أنثوي" : lang === "fr" ? "Voix féminine" : "Female voice")}</span></p>
                        )}
                        {o.deadline && <p className="text-xs text-muted-foreground mt-1">📅 {o.deadline}</p>}
                        <p className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "للأدوار:" : "For:"} <span className="text-foreground">{o.matchingRoles.join(", ")}</span></p>
                      </div>
                      <div className="glass rounded-xl p-3 bg-secondary/20 md:w-44 flex-shrink-0">
                        <div className="text-xs text-muted-foreground">{lang === "ar" ? "الإجمالي" : "Total"}</div>
                        <div className="font-serif text-lg font-bold">{formatDZD(o.totalPrice)}</div>
                        <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "حصتي:" : "My cut:"} <span className="text-accent font-semibold">{formatDZD(o.adminCut)}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button variant="destructive" size="sm" onClick={() => rejectOffer(o.id)}><X className="w-4 h-4 me-1" />{lang === "ar" ? "رفض" : "Reject"}</Button>
                      <Button variant="royal" size="sm" onClick={() => acceptOffer(o.id, o.serviceTitle)}><Check className="w-4 h-4 me-1" />{lang === "ar" ? "قبول ونشر" : "Accept"}</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {liveOffers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl font-bold">{lang === "ar" ? "مباشر" : "Live"}</h2><Pill color="green">{liveOffers.length}</Pill></div>
              <div className="space-y-2">
                {liveOffers.map((o) => (
                  <div key={o.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0"><div className="font-medium text-sm">{o.serviceTitle} · {o.clientName}</div><div className="text-xs text-muted-foreground">{pendingBids(o.id).length} {lang === "ar" ? "عروض" : "bids"}</div></div>
                    <div className="flex items-center gap-2"><span className="text-accent font-semibold text-sm">{formatDZD(o.totalPrice)}</span><Button size="sm" variant="ghost" onClick={() => setActiveTab("bids")}>{lang === "ar" ? "عروض" : "Bids"}</Button></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BIDS */}
      {activeTab === "bids" && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold mb-4">{lang === "ar" ? "المزايدات" : "Bidding"}</h2>
          {liveOffers.length === 0 ? <Empty msg={lang === "ar" ? "لا مشاريع مباشرة." : "No live projects."} /> :
            liveOffers.map((o) => {
              const ob = pendingBids(o.id);
              return (
                <div key={o.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0"><Gavel className="w-4 h-4 text-accent" /></div>
                    <span className="font-semibold">{o.serviceTitle}</span>
                    <span className="text-xs text-muted-foreground">· {o.clientName}</span>
                    {o.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {o.clientWilaya}</span>}
                    <span className="ms-auto text-accent font-bold text-sm">{formatDZD(o.totalPrice)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{lang === "ar" ? "النطاق:" : "Range:"} <span className="text-foreground font-medium">{formatDZD(o.bidMin)} – {formatDZD(o.bidMax)}</span></p>
                  {ob.length === 0 ? <p className="text-xs text-muted-foreground italic">{lang === "ar" ? "لا عروض بعد." : "No bids yet."}</p> : (
                    <div className="space-y-2">
                      {ob.map((b) => (
                        <div key={b.id} className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
                          <div><span className="font-semibold text-sm">{b.creatorName}</span><span className="text-xs text-muted-foreground ms-2">{b.creatorEmail}</span></div>
                          <div className="flex items-center gap-3">
                            <span className="text-accent font-bold">{formatDZD(b.amount)}</span>
                            <Button size="sm" variant="gold" onClick={() => handleAcceptBid(b.id, o.id, b.creatorName, b.amount)}><Check className="w-3 h-3 me-1" />{lang === "ar" ? "قبول" : "Accept"}</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      )}

      {/* BUNDLES */}
      {activeTab === "bundles" && (
        <div className="space-y-4">
          <SectionHeader
            title={lang === "ar" ? "اشتراكات الباقات" : "Bundle subscriptions"}
            count={pendingBundleRequests > 0 ? pendingBundleRequests : undefined}
            color="accent"
          />
          <AdminBundles adminUid={auth.uid} />
        </div>
      )}

      {/* CREATORS */}
      {activeTab === "creators" && (
        <div className="space-y-8">
          {/* Pending */}
          <div>
            <SectionHeader title={lang === "ar" ? "طلبات معلقة" : "Pending"} count={pendingCreators.length} color="accent" />
            {pendingCreators.length === 0 ? <Empty msg={lang === "ar" ? "لا طلبات معلقة." : "No pending."} /> : (
              <div className="space-y-3">
                {pendingCreators.map((p) => {
                  const u = userByEmail(p.email);
                  return (
                    <div key={p.id} className="glass rounded-2xl p-5 hover:border-accent/30 transition-smooth">
                      <div className="flex items-start gap-4">
                        <Avatar src={u?.profilePic} fallback={p.fullName} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{p.fullName}</div>
                          <div className="text-sm text-muted-foreground">{lang === "ar" ? (CREATOR_ROLE_AR[p.role] || p.role) : p.role} · {p.wilaya || "Algeria"} · {formatDZD(p.rate, lang)}/h</div>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>
                          <div className="grid sm:grid-cols-2 gap-2 mt-3">
                            <Field icon={Phone} label={lang === "ar" ? "الهاتف" : "Phone"} value={u?.phone} href={u?.phone ? `tel:${u.phone}` : undefined} />
                            <Field icon={Wallet} label="BaridiMob" value={u?.bariMobAccount} />
                          </div>
                          {p.portfolio.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {p.portfolio.map((l) => (
                                <a key={l} href={l} target="_blank" rel="noreferrer" className="text-xs text-accent hover:text-accent/80 underline-offset-2 hover:underline truncate max-w-[220px] inline-flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" /><span className="truncate">{l.replace(/^https?:\/\//, "")}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 justify-end">
                        <Button variant="destructive" size="sm" onClick={() => rejectCreator(p.id, p.fullName)}><X className="w-4 h-4 me-1" />{lang === "ar" ? "رفض" : "Reject"}</Button>
                        <Button variant="royal" size="sm" onClick={() => approveCreator(p.id, p.fullName)}><Check className="w-4 h-4 me-1" />{lang === "ar" ? "موافقة" : "Approve"}</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Approved */}
          {approvedCreators.length > 0 && (
            <div>
              <SectionHeader title={lang === "ar" ? "الموافق عليهم" : "Approved"} count={approvedCreators.length} color="green" />
              <div className="space-y-2">
                {approvedCreators.map((c) => {
                  const jobs = creatorJobs(c.email);
                  const earned = creatorEarned(c.email);
                  const rank = getRank(jobs);
                  const expanded = expandedCreator === c.id;
                  const u = userByEmail(c.email);
                  return (
                    <div key={c.id} className={`glass rounded-2xl overflow-hidden transition-smooth ${expanded ? "border-accent/50 shadow-[0_0_30px_-10px_hsl(41_67%_60%/0.4)]" : "hover:border-accent/30"}`}>
                      <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-smooth text-start" onClick={() => setExpandedCreator(expanded ? null : c.id)}>
                        <Avatar src={u?.profilePic} fallback={c.fullName} />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{c.fullName}</div>
                          <div className="text-xs text-muted-foreground">{lang === "ar" ? (CREATOR_ROLE_AR[c.role] || c.role) : c.role} · {c.wilaya || "Algeria"}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: rank.color, backgroundColor: rank.color + "20" }}>{lang === "ar" ? rank.labelAr : rank.label}</span>
                          <div className="text-right hidden sm:block"><div className="text-xs font-semibold text-accent">{jobs} {lang === "ar" ? "مهمة" : "jobs"}</div><div className="text-[10px] text-muted-foreground">{formatDZD(earned, lang)}</div></div>
                          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-4 pb-5 pt-3 border-t border-accent/15 space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="glass rounded-xl p-3 text-center ring-1 ring-accent/10"><div className="font-bold text-lg">{jobs}</div><div className="text-[11px] text-muted-foreground">{lang === "ar" ? "مهام" : "Jobs"}</div></div>
                            <div className="glass rounded-xl p-3 text-center ring-1 ring-accent/10"><div className="font-bold text-lg text-accent">{formatDZD(earned, lang)}</div><div className="text-[11px] text-muted-foreground">{lang === "ar" ? "مكتسبات" : "Earned"}</div></div>
                            <div className="glass rounded-xl p-3 text-center ring-1 ring-accent/10"><div className="font-bold text-lg">{c.rate > 0 ? formatDZD(c.rate, lang) : "—"}</div><div className="text-[11px] text-muted-foreground">{lang === "ar" ? "أجر/ساعة" : "Rate/h"}</div></div>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-2">
                            <Field icon={Phone} label={lang === "ar" ? "الهاتف" : "Phone"} value={u?.phone} href={u?.phone ? `tel:${u.phone}` : undefined} />
                            <Field icon={Wallet} label="BaridiMob" value={u?.bariMobAccount} />
                            <Field icon={MapPin} label={lang === "ar" ? "الولاية" : "Wilaya"} value={c.wilaya} />
                          </div>
                          {c.bio && <p className="text-sm text-muted-foreground leading-relaxed">{c.bio}</p>}
                          {c.portfolio.length > 0 && (
                            <div>
                              <div className="text-[10px] uppercase tracking-widest text-accent/80 mb-2">{lang === "ar" ? "أعماله" : lang === "fr" ? "Portfolio" : "Portfolio"}</div>
                              <div className="grid sm:grid-cols-2 gap-2">
                                {c.portfolio.map((l) => (
                                  <a key={l} href={l} target="_blank" rel="noreferrer" className="glass rounded-lg px-3 py-2 text-xs text-accent hover:text-accent/80 hover:border-accent/40 transition-smooth inline-flex items-center gap-2 truncate ring-1 ring-accent/10">
                                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{l.replace(/^https?:\/\//, "")}</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end"><Button variant="destructive" size="sm" onClick={() => rejectCreator(c.id, c.fullName)}><X className="w-3 h-3 me-1" />{lang === "ar" ? "إلغاء الموافقة" : "Revoke"}</Button></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CLIENTS */}
      {activeTab === "clients" && (
        <div>
          <SectionHeader title={lang === "ar" ? "جميع العملاء" : "All Clients"} count={clients.length} color="blue" />
          {clients.length === 0 ? <Empty msg={lang === "ar" ? "لا عملاء مسجلون بعد." : "No clients registered yet."} /> : (
            <div className="space-y-2">
              {clients.map((c) => {
                const numOffers = clientOffers(c.email);
                const expanded = expandedCreator === `client-${c.uid}`;
                const hasDetails = !!(c.phone || c.bariMobAccount);
                const tag = clientTags[c.uid];
                return (
                  <div key={c.uid} className={`glass rounded-2xl overflow-hidden transition-smooth ${expanded ? "border-accent/50 shadow-[0_0_30px_-10px_hsl(41_67%_60%/0.4)]" : "hover:border-accent/30"}`}>
                    <button
                      type="button"
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-smooth text-start"
                      onClick={() => setExpandedCreator(expanded ? null : `client-${c.uid}`)}
                    >
                      <Avatar src={c.profilePic} fallback={c.name || c.email} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate">
                            {c.name?.trim() ? c.name : (lang === "ar" ? "بدون اسم" : "No name")}
                          </span>
                          {tag && <ClientTagChip tag={tag} />}
                        </div>
                        <div className="text-xs text-muted-foreground truncate" dir="ltr">{c.email}</div>
                        {c.wilaya && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3 text-accent/80" />{c.wilaya}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0 flex items-center gap-2">
                        <div>
                          <div className="text-sm font-semibold text-accent">{numOffers}</div>
                          <div className="text-[10px] text-muted-foreground">{lang === "ar" ? "مشاريع" : "projects"}</div>
                        </div>
                        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>
                    {expanded && (
                      <div className="px-4 pb-4 pt-3 border-t border-accent/15 space-y-3">
                        {hasDetails ? (
                          <div className="grid sm:grid-cols-2 gap-2">
                            <Field icon={Phone} label={lang === "ar" ? "الهاتف" : "Phone"} value={c.phone} href={c.phone ? `tel:${c.phone}` : undefined} />
                            <Field icon={Wallet} label="BaridiMob" value={c.bariMobAccount} />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            {lang === "ar" ? "لم يضف العميل تفاصيل اتصال بعد." : lang === "fr" ? "Aucun détail de contact ajouté par ce client." : "This client hasn't added contact details yet."}
                          </p>
                        )}
                        <div className="flex items-center flex-wrap gap-2 pt-1">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground me-1">
                            {lang === "ar" ? "تصنيف الإدارة" : lang === "fr" ? "Classement admin" : "Admin tag"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSetClientTag(c.uid, tag === "b2b" ? null : "b2b"); }}
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-smooth ${
                              tag === "b2b"
                                ? "bg-primary/30 text-primary-foreground border-primary/60"
                                : "bg-primary/5 text-muted-foreground border-primary/20 hover:bg-primary/15 hover:text-primary-foreground"
                            }`}
                          >
                            #B2B
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleSetClientTag(c.uid, tag === "b2g" ? null : "b2g"); }}
                            className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border transition-smooth ${
                              tag === "b2g"
                                ? "bg-accent/30 text-accent border-accent/60"
                                : "bg-accent/5 text-muted-foreground border-accent/20 hover:bg-accent/15 hover:text-accent"
                            }`}
                          >
                            #B2G
                          </button>
                          {tag && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSetClientTag(c.uid, null); }}
                              className="text-[11px] px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground hover:text-foreground hover:border-border transition-smooth"
                            >
                              {lang === "ar" ? "مسح" : lang === "fr" ? "Effacer" : "Clear"}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </PortalShell>
  );
};

export default AdminPortal;
