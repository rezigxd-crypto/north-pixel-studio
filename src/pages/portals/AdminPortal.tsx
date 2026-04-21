import { PortalShell } from "@/components/PortalShell";
import { Users, Camera, FolderKanban, DollarSign, Check, X, Bell, Clock, Gavel, Link2, UserSquare2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCreators, useOffers, useBids, setCreatorStatus, setOfferStatus, acceptBid } from "@/lib/store";
import { formatDZD, ADMIN_COMMISSION } from "@/lib/offers";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const AdminPortal = () => {
  const { t, auth, lang } = useApp();
  const navigate = useNavigate();
  const creators = useCreators();
  const offers = useOffers();
  const bids = useBids();
  const [totalClients, setTotalClients] = useState(0);

  useEffect(() => {
    if (!auth.loading && auth.role !== "admin") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  // Live count of clients from users collection
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

  const pendingBidsForOffer = (offerId: string) => bids.filter((b) => b.offerId === offerId && b.status === "pending");

  const approveCreator = async (id: string, name: string) => { await setCreatorStatus(id, "approved"); toast.success(`${name} ${lang === "ar" ? "تمت الموافقة عليه" : "approved"}`); };
  const rejectCreator = async (id: string, name: string) => { await setCreatorStatus(id, "rejected"); toast(`${name} ${lang === "ar" ? "مرفوض" : "rejected"}`); };
  const acceptOffer = async (id: string, title: string) => { await setOfferStatus(id, "open"); toast.success(`${title} ${lang === "ar" ? "أصبح مباشرًا!" : "is live!"}`); };
  const rejectOffer = async (id: string, title: string) => { await setOfferStatus(id, "rejected"); toast(`${title} ${lang === "ar" ? "مرفوض" : "rejected"}`); };
  const handleAcceptBid = async (bidId: string, offerId: string, creatorName: string, amount: number) => {
    await acceptBid(bidId, offerId);
    toast.success(`${lang === "ar" ? "تم قبول عرض" : "Bid accepted"} ${creatorName} — ${formatDZD(amount)}`);
  };

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <PortalShell title={lang === "ar" ? "لوحة الإدارة" : t("adminPanel")} subtitle="North Pixel Studio" accent="destructive">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-destructive">{lang === "ar" ? "العمليات" : t("operations")}</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">{lang === "ar" ? "الاستوديو في لمحة" : t("studioAtGlance")}</h1>
        </div>
        {notifications > 0 && (
          <div className="glass rounded-full px-5 py-2 inline-flex items-center gap-2 border-accent/40 animate-glow-pulse">
            <Bell className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">{notifications} {lang === "ar" ? "إشعارات جديدة" : t("newNotifications")}</span>
          </div>
        )}
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { icon: Users, k: String(creators.length), v: lang === "ar" ? "إجمالي العمال" : t("totalCreators") },
          { icon: Camera, k: String(approvedCreators.length), v: lang === "ar" ? "عمال موافق عليهم" : t("approvedCreators") },
          { icon: UserSquare2, k: String(totalClients), v: lang === "ar" ? "إجمالي العملاء" : "Total Clients" },
          { icon: FolderKanban, k: String(liveOffers.length + assignedOffers.length), v: lang === "ar" ? "مشاريع نشطة" : t("liveProjects") },
          { icon: DollarSign, k: formatDZD(revenue), v: `${lang === "ar" ? "الإيرادات" : t("revenue")} (20%)` },
        ].map((s) => (
          <div key={s.v} className="glass rounded-2xl p-5">
            <s.icon className="w-5 h-5 text-accent mb-2" />
            <div className="font-serif text-2xl font-bold">{s.k}</div>
            <div className="text-xs text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Pending client offers */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold">{lang === "ar" ? "عروض العملاء المعلقة" : t("pendingClientOffers")}</h2>
          {pendingOffers.length > 0 && <span className="text-xs px-3 py-1 rounded-full bg-destructive/20 text-destructive">{pendingOffers.length} {lang === "ar" ? "جديد" : "new"}</span>}
        </div>
        {pendingOffers.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">{lang === "ar" ? "لا توجد عروض في انتظار المراجعة." : t("noClientOffers")}</div>
        ) : (
          <div className="grid gap-3">
            {pendingOffers.map((o) => (
              <div key={o.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs uppercase tracking-widest text-accent">{o.serviceTitle}</span>
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {o.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {o.clientWilaya}</span>}
                      {o.advancePaid && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400">✓ دفع مسبق</span>}
                    </div>
                    <div className="font-semibold">{o.clientName} · {o.units} {o.unitLabel}</div>
                    <p className="text-sm text-muted-foreground mt-2">{o.brief}</p>
                    {o.referenceLink && <a href={o.referenceLink} target="_blank" rel="noreferrer" className="text-xs text-accent underline mt-1 flex items-center gap-1"><Link2 className="w-3 h-3" />{o.referenceLink}</a>}
                    {o.deadline && <div className="text-xs text-muted-foreground mt-1">📅 {o.deadline}</div>}
                    <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "للأدوار:" : t("willBeVisible")} <span className="text-foreground">{o.matchingRoles.join(", ")}</span></div>
                  </div>
                  <div className="md:w-52 glass rounded-xl p-4 bg-secondary/30">
                    <div className="text-xs text-muted-foreground">{lang === "ar" ? "الإجمالي" : t("total")}</div>
                    <div className="font-serif text-2xl font-bold">{formatDZD(o.totalPrice)}</div>
                    <div className="mt-2 pt-2 border-t border-border space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-muted-foreground">{lang === "ar" ? "حصتك (20%)" : t("yourCut")}</span><span className="text-accent font-semibold">{formatDZD(o.adminCut)}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{lang === "ar" ? "نطاق العرض" : t("bidRange")}</span><span>{formatDZD(o.bidMin)} – {formatDZD(o.bidMax)}</span></div>
                      {o.advanceAmount && <div className="flex justify-between"><span className="text-muted-foreground">{lang === "ar" ? "دفع مسبق (10%)" : "Advance (10%)"}</span><span className="text-yellow-400">{formatDZD(o.advanceAmount)}</span></div>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <Button variant="destructive" size="sm" onClick={() => rejectOffer(o.id, o.serviceTitle)}><X className="w-4 h-4" /> {lang === "ar" ? "رفض" : t("delete")}</Button>
                  <Button variant="royal" size="sm" onClick={() => acceptOffer(o.id, o.serviceTitle)}><Check className="w-4 h-4" /> {lang === "ar" ? "قبول ونشر" : t("accept")}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live offers — bidding */}
      {liveOffers.length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">{lang === "ar" ? "نظام المزايدة" : t("biddingSystem")}</h2>
          <div className="grid gap-3">
            {liveOffers.map((o) => {
              const offerBids = pendingBidsForOffer(o.id);
              return (
                <div key={o.id} className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Gavel className="w-5 h-5 text-accent" />
                    <span className="font-semibold">{o.serviceTitle}</span>
                    <span className="text-xs text-muted-foreground">· {o.clientName}</span>
                    {o.clientWilaya && <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground">📍 {o.clientWilaya}</span>}
                    <span className="ms-auto text-xs text-accent font-semibold">{formatDZD(o.totalPrice)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">{lang === "ar" ? "نطاق العرض:" : t("bidRange")} <span className="text-foreground font-medium">{formatDZD(o.bidMin)} – {formatDZD(o.bidMax)}</span></div>
                  {offerBids.length === 0 ? (
                    <div className="text-xs text-muted-foreground italic">{lang === "ar" ? "لا توجد عروض بعد." : t("noBidsYet")}</div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{lang === "ar" ? "العروض الواردة" : t("currentBids")}</div>
                      {offerBids.map((b) => (
                        <div key={b.id} className="flex items-center justify-between glass rounded-xl px-4 py-2">
                          <div><span className="font-semibold text-sm">{b.creatorName}</span><span className="text-xs text-muted-foreground ms-2">{b.creatorEmail}</span></div>
                          <div className="flex items-center gap-3">
                            <span className="text-accent font-bold">{formatDZD(b.amount)}</span>
                            <Button size="sm" variant="gold" onClick={() => handleAcceptBid(b.id, o.id, b.creatorName, b.amount)}>
                              <Check className="w-3 h-3" /> {lang === "ar" ? "قبول" : t("acceptBid")}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Delivered offers */}
      {assignedOffers.filter(o => bids.some(b => b.offerId === o.id && b.status === "delivered")).length > 0 && (
        <section className="mb-12">
          <h2 className="font-serif text-2xl font-bold mb-4">{lang === "ar" ? "مشاريع منجزة — في انتظار المراجعة" : "Delivered — Awaiting review"}</h2>
          <div className="grid gap-3">
            {assignedOffers.map((o) => {
              const deliveredBid = bids.find((b) => b.offerId === o.id && b.status === "delivered");
              if (!deliveredBid) return null;
              return (
                <div key={o.id} className="glass rounded-2xl p-5 border border-purple-400/30">
                  <div className="flex items-center gap-3 mb-2"><span className="font-semibold">{o.serviceTitle}</span><span className="text-xs text-muted-foreground">· {o.clientName}</span></div>
                  <div className="text-sm text-muted-foreground mb-2">{lang === "ar" ? "العامل الحر:" : "Creator:"} <span className="text-foreground">{deliveredBid.creatorName}</span> · {formatDZD(deliveredBid.amount)}</div>
                  {deliveredBid.deliverableLink && (
                    <a href={deliveredBid.deliverableLink} target="_blank" rel="noreferrer" className="text-sm text-purple-400 underline flex items-center gap-1"><Link2 className="w-4 h-4" />{lang === "ar" ? "عرض التسليم" : "View deliverable"}</a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Pending creator approvals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-bold">{lang === "ar" ? "طلبات الموافقة على العمال" : t("pendingCreatorApprovals")}</h2>
          {pendingCreators.length > 0 && <span className="text-xs px-3 py-1 rounded-full bg-accent/20 text-accent">{pendingCreators.length} {lang === "ar" ? "جديد" : "new"}</span>}
        </div>
        {pendingCreators.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">{lang === "ar" ? "لا يوجد عمال في انتظار المراجعة." : t("noCreatorsWaiting")}</div>
        ) : (
          <div className="grid gap-3">
            {pendingCreators.map((p) => (
              <div key={p.id} className="glass rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-royal flex items-center justify-center font-bold flex-shrink-0">{p.fullName[0]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{p.fullName}</div>
                    <div className="text-sm text-muted-foreground">{p.role} · {p.wilaya ? `${p.wilaya}, ` : ""}Algeria · {formatDZD(p.rate)}/h</div>
                    <p className="text-sm mt-2 text-muted-foreground">{p.bio}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {p.portfolio.map((l) => <a key={l} href={l} target="_blank" rel="noreferrer" className="text-xs text-accent underline truncate max-w-xs">{l}</a>)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-end">
                  <Button variant="destructive" size="sm" onClick={() => rejectCreator(p.id, p.fullName)}><X className="w-4 h-4" /></Button>
                  <Button variant="royal" size="sm" onClick={() => approveCreator(p.id, p.fullName)}><Check className="w-4 h-4" /> {lang === "ar" ? "موافقة" : t("approve")}</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </PortalShell>
  );
};

export default AdminPortal;
