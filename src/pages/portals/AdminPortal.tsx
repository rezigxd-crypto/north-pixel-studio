import { PortalShell } from "@/components/PortalShell";
import { Users, Camera, FolderKanban, DollarSign, Check, X, Bell, Clock, Gavel, Link2, UserSquare2, TrendingUp, AlertCircle, Eye, ChevronDown, ChevronUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreators, useOffers, useBids, useUserCounts, useAllUsers, setCreatorStatus, setOfferStatus, acceptBid } from "@/lib/store";
import { formatDZD, CREATOR_ROLE_AR, getRank, RANK_LEVELS } from "@/lib/offers";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

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

  const clients = allUsers.filter((u) => u.role === "client");
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

      {/* CREATORS */}
      {activeTab === "creators" && (
        <div className="space-y-6">
          {/* Pending */}
          <div>
            <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl font-bold">{lang === "ar" ? "طلبات معلقة" : "Pending"}</h2>{pendingCreators.length > 0 && <Pill color="accent">{pendingCreators.length}</Pill>}</div>
            {pendingCreators.length === 0 ? <Empty msg={lang === "ar" ? "لا طلبات معلقة." : "No pending."} /> : (
              <div className="space-y-3">
                {pendingCreators.map((p) => (
                  <div key={p.id} className="glass rounded-2xl p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground flex-shrink-0 text-lg">{p.fullName[0]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold">{p.fullName}</div>
                        <div className="text-sm text-muted-foreground">{lang === "ar" ? (CREATOR_ROLE_AR[p.role] || p.role) : p.role} · {p.wilaya || "Algeria"} · {formatDZD(p.rate)}/h</div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{p.bio}</p>
                        <div className="flex flex-wrap gap-2 mt-2">{p.portfolio.map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="text-xs text-accent underline truncate max-w-[200px]">{l}</a>)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button variant="destructive" size="sm" onClick={() => rejectCreator(p.id, p.fullName)}><X className="w-4 h-4 me-1" />{lang === "ar" ? "رفض" : "Reject"}</Button>
                      <Button variant="royal" size="sm" onClick={() => approveCreator(p.id, p.fullName)}><Check className="w-4 h-4 me-1" />{lang === "ar" ? "موافقة" : "Approve"}</Button>
                    </div>
                  </div>
                ))}
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
                  return (
                    <div key={c.id} className="glass rounded-2xl overflow-hidden">
                      <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/20 transition-smooth text-start" onClick={() => setExpandedCreator(expanded ? null : c.id)}>
                        <div className="w-9 h-9 rounded-xl bg-secondary/60 flex items-center justify-center text-lg flex-shrink-0">{["🎥","✂️","🎨","🎙️","🎧","📸","🎬","🎨","✨","✍️","📱"][["Cinematographer","Video Editor","Motion Designer","Voice-Over Artist","Sound Designer","Photographer","Director","Colorist","VFX Artist","Ghost Writer","UGC Creator"].indexOf(c.role)] || "🎬"}</div>
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
          <div className="flex items-center justify-between mb-4"><h2 className="font-serif text-xl font-bold">{lang === "ar" ? "جميع العملاء" : "All Clients"}</h2><Pill color="blue">{clients.length}</Pill></div>
          {clients.length === 0 ? <Empty msg={lang === "ar" ? "لا عملاء مسجلون بعد." : "No clients registered yet."} /> : (
            <div className="space-y-2">
              {clients.map((c) => {
                const numOffers = clientOffers(c.email);
                return (
                  <div key={c.uid} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground flex-shrink-0 text-sm">
                      {(c.name || c.email || "?")[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{c.name || lang === "ar" ? "بدون اسم" : "No name"}</div>
                      <div className="text-xs text-muted-foreground">{c.email}</div>
                      {c.wilaya && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3" />{c.wilaya}
                        </div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold text-accent">{numOffers}</div>
                      <div className="text-[10px] text-muted-foreground">{lang === "ar" ? "مشاريع" : "projects"}</div>
                    </div>
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
