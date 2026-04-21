import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Clock, CheckCircle2, XCircle, Gavel, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { OFFERS, formatDZD } from "@/lib/offers";
import { useOffers, useBids } from "@/lib/store";
import { PostProjectWizard } from "@/components/PostProjectWizard";
import { useApp } from "@/lib/context";
import { useEffect } from "react";

const statusBadge = (s: string, t: (k: any) => string) => {
  if (s === "pending_admin") return { label: t("pendingReview"), icon: Clock, cls: "text-accent" };
  if (s === "open") return { label: t("liveStatus"), icon: CheckCircle2, cls: "text-emerald-400" };
  if (s === "assigned") return { label: "Assigned to creator", icon: CheckCircle2, cls: "text-blue-400" };
  return { label: t("rejected"), icon: XCircle, cls: "text-destructive" };
};

const ClientPortal = () => {
  const { t, auth } = useApp();
  const navigate = useNavigate();
  const offers = useOffers();
  const bids = useBids();

  useEffect(() => {
    if (!auth.loading && auth.role !== "client") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  // Only show this client's offers
  const myOffers = offers.filter((o) => o.clientEmail === auth.email);
  const pending = myOffers.filter((o) => o.status === "pending_admin").length;
  const live = myOffers.filter((o) => o.status === "open").length;
  const assigned = myOffers.filter((o) => o.status === "assigned").length;

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading…</div></div>;

  return (
    <PortalShell title={t("clientCommandCenter")} subtitle="North Pixel Studio">
      <header className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("welcome")}</span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">{t("yourProjectsOneFrame")}</h1>
          {auth.wilaya && (
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-accent" /> {auth.wilaya}
            </div>
          )}
        </div>
        <PostProjectWizard
          trigger={<Button variant="royal" size="lg"><Plus /> {t("postProject")}</Button>}
          clientName={auth.name}
          clientEmail={auth.email}
          clientWilaya={auth.wilaya}
        />
      </header>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: FolderKanban, k: String(myOffers.length), v: t("projectsPosted") },
          { icon: Clock, k: String(pending), v: t("awaitingReview") },
          { icon: CheckCircle2, k: String(live), v: t("liveReceivingBids") },
          { icon: Gavel, k: String(assigned), v: "Assigned" },
        ].map((s) => (
          <div key={s.v} className="glass rounded-2xl p-6">
            <s.icon className="w-5 h-5 text-accent mb-3" />
            <div className="font-serif text-2xl font-bold">{s.k}</div>
            <div className="text-sm text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      <section className="mb-10">
        <h2 className="font-serif text-2xl font-bold mb-4">{t("yourProjects")}</h2>
        {myOffers.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-muted-foreground mb-4">{t("noProjectsYet")}</p>
            <PostProjectWizard
              trigger={<Button variant="gold"><Plus /> {t("postFirstProject")}</Button>}
              clientName={auth.name}
              clientEmail={auth.email}
              clientWilaya={auth.wilaya}
            />
          </div>
        ) : (
          <div className="grid gap-3">
            {myOffers.map((p) => {
              const s = statusBadge(p.status, t);
              const offerBids = bids.filter((b) => b.offerId === p.id);
              const acceptedBid = offerBids.find((b) => b.status === "accepted");
              return (
                <div key={p.id} className="glass rounded-2xl p-5">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="font-semibold">{p.serviceTitle}</div>
                      <div className="text-sm text-muted-foreground">{p.units} {p.unitLabel} · {p.brief.slice(0, 80)}{p.brief.length > 80 ? "…" : ""}</div>
                      <div className={`text-xs mt-2 inline-flex items-center gap-1 ${s.cls}`}>
                        <s.icon className="w-3.5 h-3.5" /> {s.label}
                      </div>
                      {acceptedBid && (
                        <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> Assigned to {acceptedBid.creatorName} for {formatDZD(acceptedBid.amount)}
                        </div>
                      )}
                      {p.status === "open" && offerBids.length > 0 && (
                        <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> {offerBids.length} bid{offerBids.length > 1 ? "s" : ""} received
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-accent font-semibold">{formatDZD(p.totalPrice)}</div>
                      <div className="text-xs text-muted-foreground">{p.deadline ? `by ${p.deadline}` : t("noDeadline")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-2xl font-bold mb-4">{t("browseServices")}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {OFFERS.map((o) => (
            <Link to={`/services/${o.slug}`} key={o.slug} className="glass rounded-2xl p-5 hover:border-accent/40 transition-smooth">
              <div className="font-semibold">{o.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{o.startingPrice}</div>
            </Link>
          ))}
        </div>
      </section>
    </PortalShell>
  );
};

export default ClientPortal;
