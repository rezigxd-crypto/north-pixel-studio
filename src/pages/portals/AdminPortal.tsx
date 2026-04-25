import { PortalShell } from "@/components/PortalShell";
import { Users, Camera, FolderKanban, DollarSign, Check, X, Bell, Clock, Gavel, Link2, UserSquare2, TrendingUp, AlertCircle, Eye, ChevronDown, ChevronUp, MapPin, Phone, CreditCard, Mail, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { CountdownTimer } from "@/components/CountdownTimer";
import { useCreators, useOffers, useBids, useUserCounts, useAllUsers, setCreatorStatus, setOfferStatus, acceptBid, approveOfferForBidding, type UserDoc, type ClientOffer } from "@/lib/store";
import { formatDZD, CREATOR_ROLE_AR, getRank, RANK_LEVELS } from "@/lib/offers";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

const StatCard = ({ icon: Icon, value, label, color = "accent" }: { icon: React.ElementType; value: string; label: string; color?: string }) => (
  <div className="glass rounded-2xl p-4 flex flex-col gap-2 hover:border-accent/30 transition-smooth">
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color === "green" ? "bg-emerald-500/15 text-emerald-400" : color === "yellow" ? "bg-yellow-400/15 text-yellow-400" : color === "blue" ? "bg-primary/20 text-primary-foreground" : color === "red" ? "bg-destructive/15 text-destructive" : "bg-accent/15 text-accent"}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="font-serif text-xl md:text-2xl font-bold leading-none">{value}</div>
    <div className="text-[11px] text-muted-foreground">{label}</div>
  </div>
);

const Pill = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color === "red" ? "bg-destructive/20 text-destructive" : color === "green" ? "bg-emerald-400/20 text-emerald-400" : color === "yellow" ? "bg-yellow-400/20 text-yellow-400" : color === "blue" ? "bg-primary/20 text-primary-foreground" : "bg-accent/20 text-accent"}`}>{children}</span>
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
  const [activeTab, setActiveTab] = useState<"overview" | "offers" | "bids" | "creators" | "clients">("overview");
  const [expandedCreator, setExpandedCreator] = useState<string | null>(null);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);

  // ── Approval dialog: admin chooses how long bidding stays open
  const [approveTarget, setApproveTarget] = useState<ClientOffer | null>(null);
  const [approveHours, setApproveHours] = useState<string>("24");
  const [approving, setApproving] = useState(false);

  // Quick presets in hours
  const HOUR_PRESETS = [
    { v: 1,   ar: "ساعة",   en: "1 hour"  },
    { v: 6,   ar: "6 ساعات", en: "6 hours" },
    { v: 24,  ar: "يوم",    en: "1 day"   },
    { v: 72,  ar: "3 أيام", en: "3 days"  },
    { v: 168, ar: "أسبوع",  en: "1 week"  },
  ];

  useEffect(() => {
    if (!auth.loading && auth.role !== "admin") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  const pendingCreators = creators.filter((c) => c.status === "pending");
  const approvedCreators = creators.filter((c) => c.status === "approved");
  const pendingOffers = offers.filter((o) => o.status === "pending_admin");
  const liveOffers = offers.filter((o) => o.status === "open");
  const assignedOffers = offers.filter((o) => o.status === "assigned");
  const revenue = [...liveOffers, ...assignedOffers].reduce((sum, o) => sum + o.adminCut, 0);
  const notifications = pendingCreators.length + pendingOffers.length;

  // Merge two sources of clients so the dashboard works even if /users
  // listing is blocked by stale Firestore rules:
  //   1. /users docs with role === "client" (full profile incl. phone, Baridi Mob)
  //   2. clients derived from /offers (every offer has clientName/Email/Wilaya)
  // Keyed by email to deduplicate; user-doc fields take priority over offer fields.
  const clients: UserDoc[] = useMemo(() => {
    const map = new Map<string, UserDoc>();

    // From offers — guarantees we always show a client once they post a project
    for (const o of offers) {
      const email = (o.clientEmail || "").trim().toLowerCase();
      if (!email) continue;
      if (!map.has(email)) {
        map.set(email, {
          uid: email,
          email: o.clientEmail,
          name: o.clientName || "",
          role: "client",
          wilaya: o.clientWilaya,
        });
      }
    }

    // From /users — overlay richer profile fields (phone, Baridi Mob, avatar…)
    for (const u of allUsers) {
      if (u.role !== "client") continue;
      const email = (u.email || "").trim().toLowerCase();
      if (!email) continue;
      const existing = map.get(email);
      map.set(email, {
        ...(existing || {}),
        ...u,
        // keep richest values in case one source is missing fields
        name: u.name || existing?.name || "",
        wilaya: u.wilaya || existing?.wilaya,
      });
    }

    return Array.from(map.values()).sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email)
    );
  }, [allUsers, offers]);

  const pendingBids = (offerId: string) => bids.filter((b) => b.offerId === offerId && b.status === "pending");
  const creatorJobs = (email: string) => bids.filter((b) => b.creatorEmail === email && b.status === "accepted").length;
  const creatorEarned = (email: string) => bids.filter((b) => b.creatorEmail === email && b.status === "accepted").reduce((s, b) => s + b.amount, 0);

  // Look up a creator's full UserDoc (which carries phone + Baridi Mob) by
  // their email. The `creators` collection only stores application data —
  // contact details live in the /users collection.
  const userByEmail: Record<string, UserDoc> = useMemo(() => {
    const map: Record<string, UserDoc> = {};
    for (const u of allUsers) {
      const e = (u.email || "").trim().toLowerCase();
      if (e) map[e] = u;
    }
    return map;
  }, [allUsers]);
  const creatorProfile = (email: string): UserDoc | undefined =>
    userByEmail[(email || "").trim().toLowerCase()];
  const clientOffersList = (email: string): ClientOffer[] => {
    const e = (email || "").trim().toLowerCase();
    return offers
      .filter((o) => (o.clientEmail || "").trim().toLowerCase() === e)
      .sort((a, b) => b.createdAt - a.createdAt);
  };
  const clientOffers = (email: string) => clientOffersList(email).length;
  const offerStatusLabel = (s: ClientOffer["status"]) =>
    s === "pending_admin" ? (lang === "ar" ? "معلق" : "Pending")
      : s === "open" ? (lang === "ar" ? "مباشر" : "Live")
      : s === "assigned" ? (lang === "ar" ? "معيّن" : "Assigned")
      : s === "delivered" ? (lang === "ar" ? "مُسلَّم" : "Delivered")
      : (lang === "ar" ? "مرفوض" : "Rejected");
  const offerStatusColor = (s: ClientOffer["status"]) =>
    s === "open" ? "green" : s === "assigned" ? "yellow" : s === "delivered" ? "blue" : s === "rejected" ? "red" : "accent";

  const approveCreator = async (id: string, name: string) => { await setCreatorStatus(id, "approved"); toast.success(`${name} — ${lang === "ar" ? "تمت الموافقة" : "approved"}`); };
  const rejectCreator = async (id: string, name: string) => { await setCreatorStatus(id, "rejected"); toast.error(`${name} — ${lang === "ar" ? "مرفوض" : "rejected"}`); };
  // Open the approval dialog so admin must pick a bidding-window duration
  // before the project goes live. Defaults to 24h.
  const openApproveDialog = (o: ClientOffer) => { setApproveTarget(o); setApproveHours("24"); };

  const confirmApprove = async () => {
    if (!approveTarget) return;
    const hours = Number(approveHours);
    if (!Number.isFinite(hours) || hours <= 0) {
      toast.error(lang === "ar" ? "أدخل مدة صحيحة." : "Enter a valid duration.");
      return;
    }
    setApproving(true);
    try {
      await approveOfferForBidding(approveTarget.id, hours);
      toast.success(
        lang === "ar"
          ? `${approveTarget.serviceTitle} — مباشر · ${hours < 24 ? `${hours}س` : `${Math.round(hours/24)}ي`}`
          : `${approveTarget.serviceTitle} — live · ${hours < 24 ? `${hours}h` : `${Math.round(hours/24)}d`}`
      );
      setApproveTarget(null);
    } catch {
      toast.error(lang === "ar" ? "تعذّر الاعتماد." : "Approval failed.");
    } finally {
      setApproving(false);
    }
  };

  const rejectOffer = async (id: string) => { await setOfferStatus(id, "rejected"); toast.error(lang === "ar" ? "مرفوض" : "Rejected"); };
  const handleAcceptBid = async (bidId: string, offerId: string, name: string, amount: number) => { await acceptBid(bidId, offerId); toast.success(`${name} — ${formatDZD(amount)}`); };

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-glow-pulse text-accent font-serif text-2xl">North Pixel</div></div>;

  const TABS = [
    { id: "overview",  label: lang === "ar" ? "نظرة عامة" : "Overview" },
    { id: "offers",    label: lang === "ar" ? `العروض${pendingOffers.length > 0 ? ` (${pendingOffers.length})` : ""}` : `Offers${pendingOffers.length > 0 ? ` (${pendingOffers.length})` : ""}` },
    { id: "bids",      label: lang === "ar" ? "المزايدات" : "Bids" },
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
          {notifications === 0 && (
            <div className="glass rounded-2xl p-8 text-center animate-fade-in-up">
              <div className="w-12 h-12 rounded-2xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto mb-3">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-muted-foreground text-sm">{lang === "ar" ? "لا إشعارات جديدة." : "All clear."}</p>
            </div>
          )}
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
                          {o.clientWilaya && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground inline-flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />{o.clientWilaya}
                            </span>
                          )}
                          {o.advancePaid && <Pill color="green">{lang === "ar" ? "دفع مسبق" : "Advance paid"}</Pill>}
                        </div>
                        <p className="font-semibold">{o.clientName}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.brief}</p>
                        {o.referenceLink && <a href={o.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 flex items-center gap-1"><Link2 className="w-3 h-3" />{lang === "ar" ? "رابط مرجعي" : "Reference"}</a>}
                        {o.deadline && (
                          <p className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />{o.deadline}
                          </p>
                        )}
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
                      <Button variant="royal" size="sm" onClick={() => openApproveDialog(o)}>
                        <Check className="w-4 h-4 me-1" />{lang === "ar" ? "قبول ونشر" : "Accept & set timer"}
                      </Button>
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
                  <div key={o.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{o.serviceTitle} · {o.clientName}</div>
                      <div className="text-xs text-muted-foreground">{pendingBids(o.id).length} {lang === "ar" ? "عروض" : "bids"}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {o.bidsCloseAt && (
                        <CountdownTimer target={o.bidsCloseAt} lang={lang} compact tone="gold" />
                      )}
                      <span className="text-accent font-semibold text-sm">{formatDZD(o.totalPrice)}</span>
                      <Button size="sm" variant="ghost" onClick={() => setActiveTab("bids")}>{lang === "ar" ? "عروض" : "Bids"}</Button>
                    </div>
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

      {/* CREATORS */}
      {activeTab === "creators" && (
        <div className="space-y-6">
          {/* Pending */}
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl font-bold">{lang === "ar" ? "طلبات معلقة" : "Pending"}</h2>{pendingCreators.length > 0 && <Pill color="accent">{pendingCreators.length}</Pill>}</div>
            {pendingCreators.length === 0 ? <Empty msg={lang === "ar" ? "لا طلبات معلقة." : "No pending."} /> : (
              <div className="space-y-3">
                {pendingCreators.map((p) => {
                  const prof = creatorProfile(p.email);
                  return (
                    <div key={p.id} className="glass rounded-2xl p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground flex-shrink-0 text-lg">{p.fullName[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold">{p.fullName}</div>
                          <div className="text-sm text-muted-foreground">{lang === "ar" ? (CREATOR_ROLE_AR[p.role] || p.role) : p.role} · {p.wilaya || "Algeria"} · {formatDZD(p.rate)}/h</div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1 truncate">
                            <Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{p.email}</span>
                          </div>
                          {(prof?.phone || prof?.bariMobAccount) && (
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                              {prof.phone && (
                                <a href={`tel:${prof.phone}`} dir="ltr" className="text-xs text-foreground/90 hover:text-accent transition-smooth flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-accent flex-shrink-0" />{prof.phone}
                                </a>
                              )}
                              {prof.bariMobAccount && (
                                <span className="text-xs text-foreground/90 flex items-center gap-1">
                                  <CreditCard className="w-3 h-3 text-accent flex-shrink-0" />
                                  <span dir="ltr">{prof.bariMobAccount}</span>
                                  <span className="text-[9px] uppercase tracking-wider text-accent">{lang === "ar" ? "بريدي" : "Baridi"}</span>
                                </span>
                              )}
                            </div>
                          )}
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>
                          <div className="flex flex-wrap gap-2 mt-2">{p.portfolio.map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="text-xs text-accent underline truncate max-w-[200px]">{l}</a>)}</div>
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
              <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl font-bold">{lang === "ar" ? "الموافق عليهم" : "Approved"}</h2><Pill color="green">{approvedCreators.length}</Pill></div>
              <div className="space-y-2">
                {approvedCreators.map((c) => {
                  const jobs = creatorJobs(c.email);
                  const earned = creatorEarned(c.email);
                  const rank = getRank(jobs);
                  const expanded = expandedCreator === c.id;
                  const prof = creatorProfile(c.email);
                  return (
                    <div key={c.id} className="glass rounded-2xl overflow-hidden">
                      <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-smooth text-start" onClick={() => setExpandedCreator(expanded ? null : c.id)}>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/25 to-accent/5 border border-accent/20 flex items-center justify-center flex-shrink-0">
                          <Camera className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm">{c.fullName}</div>
                          <div className="text-xs text-muted-foreground">{lang === "ar" ? (CREATOR_ROLE_AR[c.role] || c.role) : c.role} · {c.wilaya || "Algeria"}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: rank.color, backgroundColor: rank.color + "20" }}>{lang === "ar" ? rank.labelAr : rank.label}</span>
                          <div className="text-right hidden sm:block"><div className="text-xs font-semibold text-accent">{jobs} {lang === "ar" ? "مهمة" : "jobs"}</div><div className="text-[10px] text-muted-foreground">{formatDZD(earned)}</div></div>
                          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </button>
                      {expanded && (
                        <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="glass rounded-xl p-3 text-center"><div className="font-bold text-lg">{jobs}</div><div className="text-[11px] text-muted-foreground">{lang === "ar" ? "مهام" : "Jobs"}</div></div>
                            <div className="glass rounded-xl p-3 text-center"><div className="font-bold text-lg text-accent">{formatDZD(earned)}</div><div className="text-[11px] text-muted-foreground">{lang === "ar" ? "مكتسبات" : "Earned"}</div></div>
                            <div className="glass rounded-xl p-3 text-center"><div className="font-bold text-lg">{c.rate > 0 ? formatDZD(c.rate) : "—"}</div><div className="text-[11px] text-muted-foreground">{lang === "ar" ? "أجر/ساعة" : "Rate/h"}</div></div>
                          </div>
                          {/* Contact card — phone + Baridi Mob from /users profile */}
                          <div className="glass rounded-xl p-3 bg-secondary/15 space-y-1.5">
                            <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent font-bold">
                              <UserSquare2 className="w-3 h-3" />
                              {lang === "ar" ? "بيانات التواصل" : "Contact"}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{c.email}</span>
                            </div>
                            {prof?.phone ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <Phone className="w-3 h-3 text-accent flex-shrink-0" />
                                <a href={`tel:${prof.phone}`} dir="ltr" className="hover:text-accent transition-smooth">{prof.phone}</a>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 italic">
                                <Phone className="w-3 h-3 flex-shrink-0" />
                                {lang === "ar" ? "لم يضف رقم هاتف بعد" : "No phone added yet"}
                              </div>
                            )}
                            {prof?.bariMobAccount ? (
                              <div className="flex items-center gap-1.5 text-xs">
                                <CreditCard className="w-3 h-3 text-accent flex-shrink-0" />
                                <span dir="ltr">{prof.bariMobAccount}</span>
                                <span className="text-[9px] uppercase tracking-wider text-accent ms-1">{lang === "ar" ? "بريدي موب" : "Baridi Mob"}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 italic">
                                <CreditCard className="w-3 h-3 flex-shrink-0" />
                                {lang === "ar" ? "لم يضف حساب بريدي موب" : "No Baridi Mob added"}
                              </div>
                            )}
                          </div>
                          {c.bio && <p className="text-sm text-muted-foreground">{c.bio}</p>}
                          <div className="flex flex-wrap gap-2">{c.portfolio.map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="text-xs text-accent underline truncate max-w-xs">{l}</a>)}</div>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold">{lang === "ar" ? "جميع العملاء" : "All Clients"}</h2>
            <Pill color="blue">{clients.length}</Pill>
          </div>
          {clients.length === 0 ? (
            <Empty msg={lang === "ar" ? "لا عملاء مسجلون بعد." : "No clients registered yet."} />
          ) : (
            <div className="space-y-2">
              {clients.map((c) => {
                const clientId = c.uid || c.email;
                const expanded = expandedClient === clientId;
                const list = clientOffersList(c.email);
                const numOffers = list.length;
                const totalSpent = list
                  .filter((o) => o.status === "assigned" || o.status === "delivered")
                  .reduce((s, o) => s + o.totalPrice, 0);
                const initial = (c.name || c.email || "?")[0]?.toUpperCase() || "?";
                return (
                  <div key={clientId} className={`glass rounded-2xl overflow-hidden transition-smooth ${expanded ? "border-accent/40" : "hover:border-accent/30"}`}>
                    <button
                      type="button"
                      onClick={() => setExpandedClient(expanded ? null : clientId)}
                      className="w-full px-4 py-3 flex items-start gap-3 text-start"
                      aria-expanded={expanded}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground flex-shrink-0 text-sm">
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="font-semibold text-sm truncate">
                          {c.name?.trim() ? c.name : (lang === "ar" ? "بدون اسم" : "No name")}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{c.email}</span>
                        </div>
                        {c.wilaya && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3 flex-shrink-0" />{c.wilaya}
                          </div>
                        )}
                      </div>
                      <div className="text-end flex-shrink-0 flex items-center gap-2">
                        <div>
                          <div className="text-sm font-semibold text-accent">{numOffers}</div>
                          <div className="text-[10px] text-muted-foreground">{lang === "ar" ? "مشاريع" : "projects"}</div>
                        </div>
                        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {expanded && (
                      <div className="border-t border-border/40 bg-background/40 px-4 py-3 space-y-3 animate-fade-in-up">
                        {/* Contact card */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 hover:border-accent/40 transition-smooth">
                              <Phone className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span className="text-foreground" dir="ltr">{c.phone}</span>
                            </a>
                          )}
                          {c.bariMobAccount && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(c.bariMobAccount || ""); toast.success(lang === "ar" ? "نُسخ" : "Copied"); }}
                              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-accent/10 border border-accent/20 hover:border-accent/40 transition-smooth text-start"
                            >
                              <CreditCard className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                              <span className="flex-1 truncate" dir="ltr">{c.bariMobAccount}</span>
                              <span className="text-[9px] uppercase tracking-wider text-accent">{lang === "ar" ? "نسخ" : "copy"}</span>
                            </button>
                          )}
                          {!c.phone && !c.bariMobAccount && (
                            <div className="text-xs text-muted-foreground italic px-1 py-2 col-span-full">
                              {lang === "ar" ? "العميل لم يضف هاتفاً أو حساب بريدي موب بعد." : "Client has not added a phone or Baridi Mob account yet."}
                            </div>
                          )}
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-secondary/30 p-2">
                            <div className="font-serif font-bold text-accent text-base leading-tight">{numOffers}</div>
                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "إجمالي" : "Total"}</div>
                          </div>
                          <div className="rounded-lg bg-secondary/30 p-2">
                            <div className="font-serif font-bold text-emerald-400 text-base leading-tight">
                              {list.filter((o) => o.status === "assigned" || o.status === "delivered").length}
                            </div>
                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "نشط" : "Active"}</div>
                          </div>
                          <div className="rounded-lg bg-secondary/30 p-2">
                            <div className="font-serif font-bold text-foreground text-sm leading-tight">{formatDZD(totalSpent)}</div>
                            <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "أنفق" : "Spent"}</div>
                          </div>
                        </div>

                        {/* Project history */}
                        {list.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic text-center py-3">
                            {lang === "ar" ? "لا مشاريع بعد." : "No projects yet."}
                          </div>
                        ) : (
                          <div>
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                              {lang === "ar" ? "سجلّ المشاريع" : "Project history"}
                            </div>
                            <div className="space-y-1.5">
                              {list.slice(0, 8).map((o) => (
                                <div key={o.id} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg bg-background/60 border border-border/30">
                                  <div className="min-w-0 flex-1">
                                    <div className="text-xs font-semibold truncate">{o.serviceTitle}</div>
                                    <div className="text-[10px] text-muted-foreground truncate">{o.brief.slice(0, 60)}{o.brief.length > 60 ? "…" : ""}</div>
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <span className="text-xs text-accent font-semibold">{formatDZD(o.totalPrice)}</span>
                                    <Pill color={offerStatusColor(o.status)}>{offerStatusLabel(o.status)}</Pill>
                                  </div>
                                </div>
                              ))}
                              {list.length > 8 && (
                                <div className="text-[10px] text-center text-muted-foreground pt-1">
                                  +{list.length - 8} {lang === "ar" ? "أخرى" : "more"}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Approval dialog: admin picks bidding-window duration before publishing */}
      <Dialog open={!!approveTarget} onOpenChange={(o) => !o && setApproveTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Hourglass className="w-5 h-5 text-accent" />
              {lang === "ar" ? "اعتماد المشروع — مدة المزايدة" : "Approve project — bidding window"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "اختر المدة التي يبقى فيها المشروع مفتوحاً لتقديم العروض. سيرى العمال عدّاداً تنازلياً."
                : "Pick how long this project stays open for bids. Creators will see a live countdown."}
            </DialogDescription>
          </DialogHeader>

          {approveTarget && (
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/30 p-3">
                <div className="text-[10px] uppercase tracking-widest text-accent font-bold">{approveTarget.serviceTitle}</div>
                <div className="text-sm font-semibold mt-0.5">{approveTarget.clientName}</div>
                <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{approveTarget.brief}</div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {lang === "ar" ? "مدة سريعة" : "Quick presets"}
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {HOUR_PRESETS.map((p) => {
                    const active = Number(approveHours) === p.v;
                    return (
                      <button
                        key={p.v}
                        type="button"
                        onClick={() => setApproveHours(String(p.v))}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-smooth ${
                          active
                            ? "bg-accent text-accent-foreground border-accent"
                            : "border-border/60 hover:border-accent/40 bg-background/40"
                        }`}
                      >
                        {lang === "ar" ? p.ar : p.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {lang === "ar" ? "أو مدة مخصّصة (بالساعات)" : "Or custom duration (hours)"}
                </label>
                <Input
                  type="number" min={1} step={1}
                  value={approveHours}
                  onChange={(e) => setApproveHours(e.target.value)}
                  className="mt-2 h-10"
                  dir="ltr"
                />
                {Number.isFinite(Number(approveHours)) && Number(approveHours) > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {lang === "ar" ? "ينتهي تقديم العروض بعد" : "Bidding closes in"}{" "}
                    <span className="text-accent font-semibold">
                      {Number(approveHours) < 24
                        ? `${approveHours} ${lang === "ar" ? "ساعة" : "hour(s)"}`
                        : `${(Number(approveHours) / 24).toFixed(Number(approveHours) % 24 === 0 ? 0 : 1)} ${lang === "ar" ? "يوم" : "day(s)"}`}
                    </span>
                    .
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setApproveTarget(null)} disabled={approving}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </Button>
            <Button variant="royal" onClick={confirmApprove} disabled={approving}>
              <Check className="w-4 h-4 me-1" />
              {approving
                ? (lang === "ar" ? "جارٍ النشر..." : "Publishing...")
                : (lang === "ar" ? "نشر وبدء العدّاد" : "Publish & start countdown")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PortalShell>
  );
};

export default AdminPortal;
