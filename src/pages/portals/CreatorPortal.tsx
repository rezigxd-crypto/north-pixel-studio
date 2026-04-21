import { PortalShell } from "@/components/PortalShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, DollarSign, Star, Camera, Gavel, TrendingUp, MapPin } from "lucide-react";
import { useOffers, useBids, addBid } from "@/lib/store";
import { CREATOR_ROLES, formatDZD } from "@/lib/offers";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { useNavigate } from "react-router-dom";

const CreatorPortal = () => {
  const { t, auth } = useApp();
  const navigate = useNavigate();
  const [simulatedRole, setSimulatedRole] = useState<string>(CREATOR_ROLES[0]);
  const [bidAmounts, setBidAmounts] = useState<Record<string, number>>({});
  const [filterWilaya, setFilterWilaya] = useState(false);

  useEffect(() => {
    if (!auth.loading && auth.role !== "creator") navigate("/auth/login");
  }, [auth.loading, auth.role]);

  const offers = useOffers();
  const bids = useBids();
  const creatorWilaya = auth.wilaya || "";

  const open = offers.filter((o) => {
    if (o.status !== "open") return false;
    if (!o.matchingRoles.includes(simulatedRole)) return false;
    if (filterWilaya && creatorWilaya && o.clientWilaya && o.clientWilaya !== creatorWilaya) return false;
    return true;
  });

  const myBids = bids.filter((b) => b.creatorEmail === auth.email);
  const earned = myBids.filter((b) => b.status === "accepted").reduce((s, b) => s + b.amount, 0);
  const hasBid = (offerId: string) => bids.some((b) => b.offerId === offerId && b.creatorEmail === auth.email);

  const submitBid = async (offerId: string, min: number, max: number) => {
    const amount = bidAmounts[offerId];
    if (!amount || amount < min || amount > max) {
      toast.error(`${t("bidRange")}: ${formatDZD(min)} – ${formatDZD(max)}`);
      return;
    }
    try {
      await addBid({
        offerId,
        creatorId: auth.uid || auth.email,
        creatorName: auth.name,
        creatorEmail: auth.email,
        amount,
      });
      toast.success(`${t("bidSubmitted")} ${formatDZD(amount)}`);
    } catch {
      toast.error("Failed to submit bid. Try again.");
    }
  };

  if (auth.loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground">Loading…</div></div>;

  return (
    <PortalShell title={t("creatorStudio")} subtitle="North Pixel Network" accent="gold">
      <header className="mb-10">
        <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("helloCreator")}</span>
        <h1 className="font-serif text-3xl md:text-4xl font-bold mt-2">{t("briefsMatchCraft")}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t("showingBriefs")}</p>
        {creatorWilaya && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{creatorWilaya}</span>
            <button onClick={() => setFilterWilaya((f) => !f)}
              className={`text-xs px-3 py-1 rounded-full border transition-smooth ${filterWilaya ? "bg-accent/20 border-accent text-accent" : "border-border text-muted-foreground hover:border-accent/40"}`}>
              {filterWilaya ? t("sameWilaya") : t("allWilayas")}
            </button>
          </div>
        )}
      </header>

      <div className="glass rounded-2xl p-4 mb-8">
        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{t("yourSpeciality")}</div>
        <div className="flex flex-wrap gap-2">
          {CREATOR_ROLES.map((r) => (
            <button key={r} onClick={() => setSimulatedRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-smooth ${simulatedRole === r ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/40"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Briefcase, k: String(open.length), v: t("openBriefsFor") },
          { icon: DollarSign, k: formatDZD(earned), v: t("earnedMonth") },
          { icon: Star, k: "—", v: t("rating") },
          { icon: Camera, k: String(myBids.length), v: t("bidsSubmitted") },
        ].map((s) => (
          <div key={s.v} className="glass rounded-2xl p-5">
            <s.icon className="w-5 h-5 text-accent mb-2" />
            <div className="font-serif text-xl font-bold">{s.k}</div>
            <div className="text-xs text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </div>

      <h2 className="font-serif text-2xl font-bold mb-4">{t("openBriefs")}</h2>
      {open.length === 0 ? (
        <div className="glass rounded-2xl p-10 text-center text-sm text-muted-foreground">
          {t("noBriefs")} <span className="text-foreground">{simulatedRole}</span> {t("checkBack")}
        </div>
      ) : (
        <div className="grid gap-4">
          {open.map((b) => {
            const alreadyBid = hasBid(b.id);
            const currentBid = bidAmounts[b.id] ?? b.bidMin;
            return (
              <div key={b.id} className="glass rounded-2xl p-5">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs uppercase tracking-widest text-accent">{b.serviceTitle}</span>
                      {b.clientWilaya && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/60 text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {b.clientWilaya}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold">{b.units} {b.unitLabel} — {b.brief.slice(0, 100)}{b.brief.length > 100 ? "…" : ""}</div>
                    {b.deadline && <div className="text-xs text-muted-foreground mt-1">{t("deadline_label")} {b.deadline}</div>}

                    <div className="mt-3 glass rounded-xl p-3 bg-secondary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Gavel className="w-4 h-4 text-accent" />
                        <span className="text-xs font-semibold uppercase tracking-widest">{t("biddingSystem")}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                        <span>{t("minBid")}: <span className="text-foreground font-medium">{formatDZD(b.bidMin)}</span></span>
                        <span>{t("maxBid")}: <span className="text-foreground font-medium">{formatDZD(b.bidMax)}</span></span>
                      </div>
                      {alreadyBid ? (
                        <div className="text-xs text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> {t("bidSubmitted")}
                        </div>
                      ) : (
                        <div className="flex gap-2 items-center mt-1">
                          <Input type="number" min={b.bidMin} max={b.bidMax} step={100}
                            value={currentBid}
                            onChange={(e) => setBidAmounts((prev) => ({ ...prev, [b.id]: Number(e.target.value) }))}
                            className="h-8 text-sm max-w-[140px]" />
                          <span className="text-xs text-muted-foreground">DA</span>
                          <Button variant="gold" size="sm" onClick={() => submitBid(b.id, b.bidMin, b.bidMax)}>
                            <Gavel className="w-3 h-3" /> {t("submitBid")}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-accent font-semibold">{formatDZD(b.bidMax)}</div>
                    <div className="text-xs text-muted-foreground">{t("yourPayout")}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myBids.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-bold mb-4">{t("currentBids")}</h2>
          <div className="grid gap-2">
            {myBids.map((bid) => {
              const offer = offers.find((o) => o.id === bid.offerId);
              return (
                <div key={bid.id} className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">{offer?.serviceTitle || "Offer"}</span>
                    <span className="text-xs text-muted-foreground ms-2">{offer?.units} {offer?.unitLabel}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-accent font-semibold">{formatDZD(bid.amount)}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${bid.status === "accepted" ? "bg-emerald-400/20 text-emerald-400" : bid.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-secondary text-muted-foreground"}`}>
                      {bid.status}
                    </span>
                  </div>
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
