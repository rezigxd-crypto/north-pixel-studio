import { PortalShell } from "@/components/PortalShell";
import {
  Users, Camera, FolderKanban, DollarSign, Check, X, Bell,
  Clock, Gavel, Link2, UserSquare2, TrendingUp, AlertCircle, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreators, useOffers, useBids, setCreatorStatus, setOfferStatus, acceptBid } from "@/lib/store";
import { formatDZD, ADMIN_COMMISSION } from "@/lib/offers";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Stat card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, color = "accent" }: {
  icon: React.ElementType; value: string; label: string; color?: string;
}) => (
  <div className="glass rounded-2xl p-5 flex flex-col gap-2 hover:border-accent/30 transition-smooth">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
      color === "green" ? "bg-emerald-500/15 text-emerald-400" :
      color === "yellow" ? "bg-yellow-400/15 text-yellow-400" :
      color === "blue" ? "bg-primary/15 text-primary-foreground" :
      color === "red" ? "bg-destructive/15 text-destructive" :
      "bg-accent/15 text-accent"
    }`}>
      <Icon className="w-4 h-4" />
    </div>
    <div className="font-serif text-2xl font-bold leading-none">{value}</div>
    <div className="text-xs text-muted-foreground">{label}</div>
  </div>
);

// ── Status pill ────────────────────────────────────────────────────────────
const Pill = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
    color === "red" ? "bg-destructive/20 text-destructive" :
    color === "green" ? "bg-emerald-400/20 text-emerald-400" :
    color === "yellow" ? "bg-yellow-400/20 text-yellow-400" :
    "bg-accent/20 text-accent"
  }`}>{children}</span>
);

// ── Section header ─────────────────────────────────────────────────────────
const SectionHeader = ({ title, count, color }: { title: string; count?: number; color?: string }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-serif text-xl md:text-2xl font-bold">{title}</h2>
    {count !== undefined && count > 0 && <Pill color={color || "accent"}>{count} جديد</Pill>}
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────
const Empty = ({ msg }: { msg: string }) => (
  <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
      <Eye className="w-4 h-4 text-muted-foreground" />
    </div>
    {msg}
  </div>
);

const AdminPortal = () => {
  const { auth, lang } = useApp();
  const navigate = useNavigate();
  const creators = useCreators();
  const offers = useOffers();
  const bids = useBids();
  const [totalClients, setTotalClients] = useState(0);
  const [activeTab, setActiveTab] = useState<"overview" | "offers" | "bids" | "creators">("overview");

  useEffect(() => {
    if (!auth.loading && auth.role !== "admin") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  useEffect(() => {
    return onSnapshot(collection(db, "users"), (snap) => {
      setTotalClients(snap.docs.filter((d) => d.data().role === "client").length);
    });
  }, []);

  const pendingCreators = creators.filter((c) => c.status === "pending");
  const approvedCreators = creators.filter((c) => c.status === "approved");
  const pendingOffers = offers.filter((o) => o.status === "pending_admin");
  const liveOffers = offers.filter((o) => o.status === "open");
  const assignedOffers = offers.filter((o) => o.status === "assigned");
  const revenue = [...liveOffers, ...assignedOffers].reduce((sum, o) => sum + o.adminCut, 0);
  const notifications = pendingCreators.length + pendingOffers.length;

  const pendingBids = (offerId: string) => bids.filter((b) => b.offerId === offerId && b.status === "pending");

  const approveCreator = async (id: string, name: string) => {
    await setCreatorStatus(id, "approved");
    toast.success(`✓ ${name} ${lang === "ar" ? "تمت الموافقة عليه" : "approved"}`);
  };
  const rejectCreator = async (id: string, name: string) => {
    await setCreatorStatus(id, "rejected");
    toast.error(`${name} ${lang === "ar" ? "مرفوض" : "rejected"}`);
  };
  const acceptOffer = async (id: string, title: string) => {
    await setOfferStatus(id, "open");
    toast.success(`🚀 ${title} ${lang === "ar" ? "أصبح مباشرًا!" : "is live!"}`);
  };
  const rejectOffer = async (id: string) => {
    await setOfferStatus(id, "rejected");
    toast.error(lang === "ar" ? "تم رفض العرض." : "Offer rejected.");
  };
  const handleAcceptBid = async (bidId: string, offerId: string, name: string, amount: number) => {
    await acceptBid(bidId, offerId);
    toast.success(`✓ ${name} — ${formatDZD(amount)}`);
  };

  if (auth.loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-glow-pulse text-accent font-serif text-2xl">North Pixel</div>
    </div>
  );

  const TABS = [
    { id: "overview", label: lang === "ar" ? "نظرة عامة" : "Overview" },
    { id: "offers", label: lang === "ar" ? `العروض ${pendingOffers.length > 0 ? `(${pendingOffers.length})` : ""}` : `Offers ${pendingOffers.length > 0 ? `(${pendingOffers.length})` : ""}` },
    { id: "bids", label: lang === "ar" ? "المزايدات" : "Bids" },
    { id: "creators", label: lang === "ar" ? `العمال ${pendingCreators.length > 0 ? `(${pendingCreators.length})` : ""}` : `Creators ${pendingCreators.length > 0 ? `(${pendingCreators.length})` : ""}` },
  ] as const;

  return (
    <PortalShell title={lang === "ar" ? "لوحة الإدارة" : "Admin Panel"} subtitle="North Pixel Studio" accent="destructive">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs text-destructive uppercase tracking-widest mb-1">{lang === "ar" ? "العمليات" : "Operations"}</p>
          <h1 className="font-serif text-2xl md:text-4xl font-bold">{lang === "ar" ? "الاستوديو في لمحة" : "Studio at a glance"}</h1>
        </div>
        {notifications > 0 && (
          <div className="glass rounded-full px-4 py-2 inline-flex items-center gap-2 border border-accent/30 animate-glow-pulse self-start">
            <Bell className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">{notifications} {lang === "ar" ? "إشعار جديد" : "new"}</span>
          </div>
        )}
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard icon={Users}      value={String(creators.length)}                         label={lang === "ar" ? "إجمالي العمال" : "Total creators"} color="blue" />
        <StatCard icon={Camera}     value={String(approvedCreators.length)}                  label={lang === "ar" ? "عمال موافق عليهم" : "Approved"}     color="green" />
        <StatCard icon={UserSquare2} value={String(totalClients)}                            label={lang === "ar" ? "إجمالي العملاء" : "Clients"}        color="accent" />
        <StatCard icon={FolderKanban} value={String(liveOffers.length + assignedOffers.length)} label={lang === "ar" ? "مشاريع نشطة" : "Active projects"} color="yellow" />
        <StatCard icon={DollarSign} value={formatDZD(revenue)}                              label={`${lang === "ar" ? "إيرادات" : "Revenue"} (20%)`}    color="green" />
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 glass rounded-2xl mb-8 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-max py-2.5 px-4 rounded-xl text-sm font-medium transition-smooth whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-gradient-royal text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ OVERVIEW TAB ══════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Quick alerts */}
          {(pendingOffers.length > 0 || pendingCreators.length > 0) && (
            <div className="space-y-2">
              {pendingOffers.length > 0 && (
                <button onClick={() => setActiveTab("offers")}
                  className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:border-yellow-400/40 transition-smooth text-start">
                  <div className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{pendingOffers.length} {lang === "ar" ? "عرض ينتظر مراجعتك" : "offer(s) awaiting review"}</div>
                    <div className="text-xs text-muted-foreground">{lang === "ar" ? "انقر للمراجعة والنشر" : "Click to review and publish"}</div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                </button>
              )}
              {pendingCreators.length > 0 && (
                <button onClick={() => setActiveTab("creators")}
                  className="w-full glass rounded-2xl p-4 flex items-center gap-3 hover:border-accent/40 transition-smooth text-start">
                  <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{pendingCreators.length} {lang === "ar" ? "عامل حر ينتظر الموافقة" : "creator(s) pending approval"}</div>
                    <div className="text-xs text-muted-foreground">{lang === "ar" ? "انقر للمراجعة والموافقة" : "Click to review and approve"}</div>
                  </div>
                  <TrendingUp className="w-4 h-4 text-accent flex-shrink-0" />
                </button>
              )}
            </div>
          )}

          {/* Recent activity */}
          <div>
            <SectionHeader title={lang === "ar" ? "آخر المشاريع" : "Recent projects"} />
            {offers.length === 0 ? <Empty msg={lang === "ar" ? "لا توجد مشاريع بعد." : "No projects yet."} /> : (
              <div className="space-y-2">
                {offers.slice(0, 5).map((o) => (
                  <div key={o.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{o.serviceTitle}</div>
                      <div className="text-xs text-muted-foreground">{o.clientName} {o.clientWilaya ? `· ${o.clientWilaya}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-accent font-semibold text-sm">{formatDZD(o.totalPrice)}</span>
                      <Pill color={o.status === "open" ? "green" : o.status === "assigned" ? "yellow" : o.status === "rejected" ? "red" : "accent"}>
                        {o.status === "pending_admin" ? (lang === "ar" ? "معلق" : "Pending") :
                         o.status === "open" ? (lang === "ar" ? "مباشر" : "Live") :
                         o.status === "assigned" ? (lang === "ar" ? "معيّن" : "Assigned") :
                         lang === "ar" ? "مرفوض" : "Rejected"}
                      </Pill>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ OFFERS TAB ════════════════════════════════════════════════════ */}
      {activeTab === "offers" && (
        <div className="space-y-8">
          {/* Pending */}
          <div>
            <SectionHeader title={lang === "ar" ? "عروض تنتظر المراجعة" : "Pending offers"} count={pendingOffers.length} color="yellow" />
            {pendingOffers.length === 0 ? <Empty msg={lang === "ar" ? "لا توجد عروض معلقة." : "No pending offers."} /> : (
              <div className="space-y-3">
                {pendingOffers.map((o) => (
                  <div key={o.id} className="glass rounded-2xl p-5 border border-yellow-400/10 hover:border-yellow-400/25 transition-smooth">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-xs font-bold uppercase tracking-widest text-accent">{o.serviceTitle}</span>
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {o.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {o.clientWilaya}</span>}
                          {o.advancePaid && <Pill color="green">✓ {lang === "ar" ? "دفع مسبق" : "Advance paid"}</Pill>}
                        </div>
                        <p className="font-semibold">{o.clientName} · {o.units} {o.unitLabel}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.brief}</p>
                        {o.referenceLink && (
                          <a href={o.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 flex items-center gap-1">
                            <Link2 className="w-3 h-3" />{lang === "ar" ? "رابط مرجعي" : "Reference link"}
                          </a>
                        )}
                        {o.deadline && <p className="text-xs text-muted-foreground mt-1">📅 {o.deadline}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {lang === "ar" ? "للأدوار:" : "For:"} <span className="text-foreground">{o.matchingRoles.join(", ")}</span>
                        </p>
                      </div>
                      <div className="glass rounded-xl p-4 bg-secondary/20 md:w-48 flex-shrink-0">
                        <div className="text-xs text-muted-foreground mb-1">{lang === "ar" ? "الإجمالي" : "Total"}</div>
                        <div className="font-serif text-xl font-bold mb-2">{formatDZD(o.totalPrice)}</div>
                        <div className="space-y-1 text-xs border-t border-border pt-2">
                          <div className="flex justify-between"><span className="text-muted-foreground">{lang === "ar" ? "حصتك" : "Your cut"}</span><span className="text-accent font-bold">{formatDZD(o.adminCut)}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">{lang === "ar" ? "نطاق العرض" : "Bid range"}</span><span className="text-foreground">{formatDZD(o.bidMin)}–{formatDZD(o.bidMax)}</span></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button variant="destructive" size="sm" onClick={() => rejectOffer(o.id)}>
                        <X className="w-4 h-4 me-1" />{lang === "ar" ? "رفض" : "Reject"}
                      </Button>
                      <Button variant="royal" size="sm" onClick={() => acceptOffer(o.id, o.serviceTitle)}>
                        <Check className="w-4 h-4 me-1" />{lang === "ar" ? "قبول ونشر" : "Accept & publish"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Live */}
          {liveOffers.length > 0 && (
            <div>
              <SectionHeader title={lang === "ar" ? "مشاريع مباشرة" : "Live projects"} count={liveOffers.length} color="green" />
              <div className="space-y-2">
                {liveOffers.map((o) => (
                  <div key={o.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{o.serviceTitle} · {o.clientName}</div>
                      <div className="text-xs text-muted-foreground">{pendingBids(o.id).length} {lang === "ar" ? "عرض مستلم" : "bids"}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-accent font-semibold text-sm">{formatDZD(o.totalPrice)}</span>
                      <Button size="sm" variant="ghost" onClick={() => setActiveTab("bids")}>
                        {lang === "ar" ? "المزايدات" : "View bids"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ BIDS TAB ══════════════════════════════════════════════════════ */}
      {activeTab === "bids" && (
        <div className="space-y-4">
          <SectionHeader title={lang === "ar" ? "نظام المزايدة" : "Bidding System"} />
          {liveOffers.length === 0 ? <Empty msg={lang === "ar" ? "لا توجد مشاريع مباشرة حاليًا." : "No live projects right now."} /> : (
            liveOffers.map((o) => {
              const ob = pendingBids(o.id);
              return (
                <div key={o.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center flex-shrink-0">
                      <Gavel className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold">{o.serviceTitle}</span>
                      <span className="text-xs text-muted-foreground ms-2">· {o.clientName}</span>
                    </div>
                    {o.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {o.clientWilaya}</span>}
                    <span className="text-accent font-bold text-sm">{formatDZD(o.totalPrice)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {lang === "ar" ? "نطاق العرض:" : "Bid range:"} <span className="text-foreground font-medium">{formatDZD(o.bidMin)} – {formatDZD(o.bidMax)}</span>
                  </p>
                  {ob.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{lang === "ar" ? "لا توجد عروض بعد." : "No bids yet."}</p>
                  ) : (
                    <div className="space-y-2">
                      {ob.map((b) => (
                        <div key={b.id} className="flex items-center justify-between glass rounded-xl px-4 py-2.5">
                          <div>
                            <span className="font-semibold text-sm">{b.creatorName}</span>
                            <span className="text-xs text-muted-foreground ms-2">{b.creatorEmail}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-accent font-bold">{formatDZD(b.amount)}</span>
                            <Button size="sm" variant="gold" onClick={() => handleAcceptBid(b.id, o.id, b.creatorName, b.amount)}>
                              <Check className="w-3 h-3 me-1" />{lang === "ar" ? "قبول" : "Accept"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ══ CREATORS TAB ══════════════════════════════════════════════════ */}
      {activeTab === "creators" && (
        <div className="space-y-8">
          {/* Pending */}
          <div>
            <SectionHeader title={lang === "ar" ? "طلبات تنتظر الموافقة" : "Pending approvals"} count={pendingCreators.length} color="accent" />
            {pendingCreators.length === 0 ? <Empty msg={lang === "ar" ? "لا توجد طلبات معلقة." : "No pending requests."} /> : (
              <div className="space-y-3">
                {pendingCreators.map((p) => (
                  <div key={p.id} className="glass rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-royal flex items-center justify-center font-serif text-lg font-bold text-primary-foreground flex-shrink-0">
                        {p.fullName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{p.fullName}</div>
                        <div className="text-sm text-muted-foreground mt-0.5">
                          {p.role} · {p.wilaya ? `${p.wilaya}, ` : ""}الجزائر · {formatDZD(p.rate)}/h
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.bio}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {p.portfolio.map((l) => (
                            <a key={l} href={l} target="_blank" rel="noreferrer"
                              className="text-xs text-accent underline truncate max-w-[200px] hover:text-accent/80">{l}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button variant="destructive" size="sm" onClick={() => rejectCreator(p.id, p.fullName)}>
                        <X className="w-4 h-4 me-1" />{lang === "ar" ? "رفض" : "Reject"}
                      </Button>
                      <Button variant="royal" size="sm" onClick={() => approveCreator(p.id, p.fullName)}>
                        <Check className="w-4 h-4 me-1" />{lang === "ar" ? "موافقة" : "Approve"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved list */}
          {approvedCreators.length > 0 && (
            <div>
              <SectionHeader title={lang === "ar" ? "العمال الموافق عليهم" : "Approved creators"} />
              <div className="space-y-2">
                {approvedCreators.map((c) => (
                  <div key={c.id} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-400/15 flex items-center justify-center text-sm font-bold text-emerald-400 flex-shrink-0">{c.fullName[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{c.fullName}</div>
                      <div className="text-xs text-muted-foreground">{c.role} · {c.wilaya || "Algeria"}</div>
                    </div>
                    <Pill color="green">✓ {lang === "ar" ? "موافق" : "Approved"}</Pill>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PortalShell>
  );
};

export default AdminPortal;
