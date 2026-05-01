import { useMemo, useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { DollarSign, CreditCard, TrendingUp, Gavel, ChevronDown, Download, AlertCircle, Users, Bell, Trophy } from "lucide-react";
import { useApp } from "@/lib/context";
import { useOffers, useBids, useAllUsers, type Bid, type ClientOffer, type UserDoc } from "@/lib/store";
import { formatDZD } from "@/lib/offers";

type Range = "7d" | "30d" | "90d";
type Metric = "revenue" | "projects" | "bids" | "payouts";

const RANGE_DAYS: Record<Range, number> = { "7d": 7, "30d": 30, "90d": 90 };

/** Compact full-DA formatter for chart axis ticks (no "k" / "M" shorthand —
 *  user prefers explicit DA values everywhere on the platform). Uses spaces
 *  as thousand separators to keep the tick narrow. */
const fmtShort = (n: number): string => {
  const rounded = Math.round(n);
  // Insert a thin no-break space between thousands so ticks stay tight.
  return rounded.toLocaleString("fr-DZ").replace(/\u202f/g, " ");
};

const Delta = ({ pct, lang }: { pct: number | null; lang: string }) => {
  if (pct === null || !isFinite(pct)) {
    return <span className="text-muted-foreground">{lang === "ar" ? "—" : "—"}</span>;
  }
  const positive = pct >= 0;
  return (
    <span className={positive ? "text-emerald-400" : "text-destructive"}>
      {positive ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%
    </span>
  );
};

const KpiCard = ({
  icon: Icon,
  label,
  ringClass,
  iconClass,
  children,
  sparkColor,
  sparkValues,
}: {
  icon: React.ElementType;
  label: string;
  ringClass: string;
  iconClass: string;
  children: React.ReactNode;
  sparkColor: string;
  sparkValues: number[];
}) => {
  const max = Math.max(1, ...sparkValues.map(Math.abs));
  const points = sparkValues
    .map((v, i) => `${(i / Math.max(1, sparkValues.length - 1)) * 80},${28 - (Math.max(0, v) / max) * 24}`)
    .join(" ");
  return (
    <div className={`glass rounded-2xl p-5 relative overflow-hidden ${ringClass}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${iconClass}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>
        {label}
      </div>
      {children}
      {sparkValues.length > 1 && (
        <svg className="absolute right-3 bottom-3 opacity-60" width="80" height="28" viewBox="0 0 80 28" fill="none">
          <polyline points={points} stroke={sparkColor} strokeWidth="1.5" fill="none" />
        </svg>
      )}
    </div>
  );
};

const PerformerCard = ({
  rank,
  user,
  jobs,
  earned,
  fallbackName,
  fallbackEmail,
  lang,
}: {
  rank: number;
  user?: UserDoc;
  jobs: number;
  earned: number;
  fallbackName: string;
  fallbackEmail: string;
  lang: string;
}) => {
  const rankColors = [
    "from-accent to-accent/40 text-background",
    "from-primary to-primary/40 text-white",
    "from-emerald-400 to-emerald-400/40 text-background",
    "from-muted-foreground to-muted-foreground/40 text-background",
  ];
  const name = user?.name || fallbackName || fallbackEmail;
  const wilaya = user?.wilaya;
  const subtitle = user?.username
    ? `@${user.username}${wilaya ? ` · ${wilaya}` : ""}`
    : (wilaya || fallbackEmail);
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 hover:border-accent/40 transition-smooth relative overflow-hidden">
      <div className={`absolute -top-2 -left-2 w-9 h-9 rounded-full bg-gradient-to-br ${rankColors[rank - 1]} ring-2 ring-background flex items-center justify-center font-bold text-sm`}>
        {rank}
      </div>
      <div className="flex items-center gap-3 mt-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-royal flex items-center justify-center text-white font-bold ring-1 ring-accent/30 overflow-hidden flex-shrink-0">
          {user?.profilePic
            ? <img src={user.profilePic} alt="" className="w-full h-full object-cover" />
            : (name || "?").trim().charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm truncate">{name}</div>
          <div className="text-[11px] text-muted-foreground truncate" dir="ltr">{subtitle}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="rounded-xl bg-muted/40 p-2.5">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{lang === "ar" ? "أعمال" : "Jobs"}</div>
          <div className="font-serif font-bold text-lg">{jobs}</div>
        </div>
        <div className="rounded-xl bg-muted/40 p-2.5">
          <div className="text-[10px] uppercase text-muted-foreground tracking-wider">{lang === "ar" ? "أرباح" : "Earned"}</div>
          <div className="font-serif font-bold text-lg text-accent">{fmtShort(earned)}</div>
        </div>
      </div>
    </div>
  );
};

export const AdminOverview = ({
  pendingOffers,
  pendingCreators,
  onJumpToOffers,
  onJumpToCreators,
}: {
  pendingOffers: ClientOffer[];
  pendingCreators: { id: string; fullName: string }[];
  onJumpToOffers: () => void;
  onJumpToCreators: () => void;
}) => {
  const { lang } = useApp();
  const offers = useOffers();
  const bids = useBids();
  const allUsers = useAllUsers();

  const [range, setRange] = useState<Range>("30d");
  const [metric, setMetric] = useState<Metric>("revenue");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [serviceMenuOpen, setServiceMenuOpen] = useState(false);

  const services = useMemo(() => {
    const set = new Map<string, string>();
    offers.forEach((o) => set.set(o.serviceSlug, o.serviceTitle));
    return Array.from(set.entries());
  }, [offers]);

  const days = RANGE_DAYS[range];
  const now = Date.now();
  const rangeEnd = now;
  const rangeStart = now - days * 86_400_000;
  const prevStart = rangeStart - days * 86_400_000;

  // Filter offers/bids by service + range. Inlined into useMemo bodies to
  // keep React's exhaustive-deps lint happy (no closure over a fresh fn).
  const offersInRange = useMemo(() => {
    const matches = (slug: string) => serviceFilter === "all" || slug === serviceFilter;
    return offers.filter((o) => matches(o.serviceSlug) && o.createdAt >= rangeStart && o.createdAt <= rangeEnd);
  }, [offers, serviceFilter, rangeStart, rangeEnd]);
  const offersPrevRange = useMemo(() => {
    const matches = (slug: string) => serviceFilter === "all" || slug === serviceFilter;
    return offers.filter((o) => matches(o.serviceSlug) && o.createdAt >= prevStart && o.createdAt < rangeStart);
  }, [offers, serviceFilter, prevStart, rangeStart]);

  const offerSlugById = useMemo(() => {
    const m = new Map<string, string>();
    offers.forEach((o) => m.set(o.id, o.serviceSlug));
    return m;
  }, [offers]);

  const bidsInRange = useMemo(() => {
    const matches = (b: Bid) => serviceFilter === "all" || offerSlugById.get(b.offerId) === serviceFilter;
    return bids.filter((b) => matches(b) && b.createdAt >= rangeStart && b.createdAt <= rangeEnd);
  }, [bids, serviceFilter, rangeStart, rangeEnd, offerSlugById]);

  const acceptedBidsInRange = useMemo(() => {
    const matches = (b: Bid) => serviceFilter === "all" || offerSlugById.get(b.offerId) === serviceFilter;
    return bids.filter((b) => b.status === "accepted" && matches(b) && (b.acceptedAt ?? b.createdAt) >= rangeStart && (b.acceptedAt ?? b.createdAt) <= rangeEnd);
  }, [bids, serviceFilter, rangeStart, rangeEnd, offerSlugById]);
  const acceptedBidsPrev = useMemo(() => {
    const matches = (b: Bid) => serviceFilter === "all" || offerSlugById.get(b.offerId) === serviceFilter;
    return bids.filter((b) => b.status === "accepted" && matches(b) && (b.acceptedAt ?? b.createdAt) >= prevStart && (b.acceptedAt ?? b.createdAt) < rangeStart);
  }, [bids, serviceFilter, prevStart, rangeStart, offerSlugById]);

  // KPI 1 — Revenue (sum of adminCut on non-rejected offers in range)
  const revenue = offersInRange.filter((o) => o.status !== "rejected").reduce((s, o) => s + (o.adminCut || 0), 0);
  const revenuePrev = offersPrevRange.filter((o) => o.status !== "rejected").reduce((s, o) => s + (o.adminCut || 0), 0);

  // KPI 2 — Creator payouts
  const payouts = acceptedBidsInRange.reduce((s, b) => s + (b.amount || 0), 0);
  const payoutsPrev = acceptedBidsPrev.reduce((s, b) => s + (b.amount || 0), 0);

  // KPI 3 — Avg project value + fill rate
  const billable = offersInRange.filter((o) => o.status !== "rejected" && o.status !== "pending_admin");
  const avgProject = billable.length ? billable.reduce((s, o) => s + o.totalPrice, 0) / billable.length : 0;
  const billablePrev = offersPrevRange.filter((o) => o.status !== "rejected" && o.status !== "pending_admin");
  const avgPrev = billablePrev.length ? billablePrev.reduce((s, o) => s + o.totalPrice, 0) / billablePrev.length : 0;
  const fillNumerator = offersInRange.filter((o) => o.status === "assigned" || o.status === "delivered").length;
  const fillDenominator = offersInRange.filter((o) => o.status === "open" || o.status === "assigned" || o.status === "delivered").length;
  const fillRate = fillDenominator ? (fillNumerator / fillDenominator) * 100 : 0;

  // KPI 4 — bids / accepted
  const totalBids = bidsInRange.length;
  const acceptedCount = acceptedBidsInRange.length;
  const acceptRate = totalBids ? (acceptedCount / totalBids) * 100 : 0;
  const bidsPrevCount = useMemo(() => {
    const matches = (b: Bid) => serviceFilter === "all" || offerSlugById.get(b.offerId) === serviceFilter;
    return bids.filter((b) => matches(b) && b.createdAt >= prevStart && b.createdAt < rangeStart).length;
  }, [bids, serviceFilter, prevStart, rangeStart, offerSlugById]);
  const acceptRatePrev = bidsPrevCount > 0 ? (acceptedBidsPrev.length / bidsPrevCount) * 100 : 0;

  const pctChange = (cur: number, prev: number): number | null => {
    if (prev <= 0) return cur > 0 ? 100 : null;
    return ((cur - prev) / prev) * 100;
  };

  // ─── Chart data ──────────────────────────────────────────────────────────
  const buckets = useMemo(() => {
    const arr: { ts: number; date: string; value: number }[] = [];
    const bucketSize = days <= 7 ? 1 : days <= 30 ? 1 : 3; // daily for 7/30d, 3-day buckets for 90d
    const bucketCount = Math.ceil(days / bucketSize);
    for (let i = bucketCount - 1; i >= 0; i--) {
      const ts = rangeEnd - i * bucketSize * 86_400_000;
      const d = new Date(ts);
      arr.push({
        ts,
        date: `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`,
        value: 0,
      });
    }
    const inBucketIdx = (ts: number) => {
      const elapsed = rangeEnd - ts;
      const idx = arr.length - 1 - Math.floor(elapsed / (bucketSize * 86_400_000));
      return idx;
    };
    if (metric === "revenue") {
      offersInRange.filter((o) => o.status !== "rejected").forEach((o) => {
        const i = inBucketIdx(o.createdAt);
        if (i >= 0 && i < arr.length) arr[i].value += o.adminCut || 0;
      });
    } else if (metric === "projects") {
      offersInRange.filter((o) => o.status !== "rejected").forEach((o) => {
        const i = inBucketIdx(o.createdAt);
        if (i >= 0 && i < arr.length) arr[i].value += 1;
      });
    } else if (metric === "bids") {
      bidsInRange.forEach((b) => {
        const i = inBucketIdx(b.createdAt);
        if (i >= 0 && i < arr.length) arr[i].value += 1;
      });
    } else {
      acceptedBidsInRange.forEach((b) => {
        const i = inBucketIdx(b.acceptedAt ?? b.createdAt);
        if (i >= 0 && i < arr.length) arr[i].value += b.amount || 0;
      });
    }
    return arr;
  }, [metric, days, rangeEnd, offersInRange, bidsInRange, acceptedBidsInRange]);

  const chartTotal = buckets.reduce((s, b) => s + b.value, 0);
  const chartTotalLabel = metric === "revenue" || metric === "payouts"
    ? `${formatDZD(chartTotal)}`
    : `${chartTotal}`;
  const chartTotalSuffix =
    metric === "revenue" ? (lang === "ar" ? "إيرادات" : lang === "fr" ? "revenus" : "revenue")
    : metric === "payouts" ? (lang === "ar" ? "مدفوعات للعمال" : lang === "fr" ? "paiements" : "payouts")
    : metric === "projects" ? (lang === "ar" ? "مشاريع" : "projects")
    : (lang === "ar" ? "مزايدات" : "bids");

  // ─── Top performers ──────────────────────────────────────────────────────
  const performers = useMemo(() => {
    const map = new Map<string, { email: string; name: string; jobs: number; earned: number }>();
    acceptedBidsInRange.forEach((b) => {
      const cur = map.get(b.creatorEmail) || { email: b.creatorEmail, name: b.creatorName, jobs: 0, earned: 0 };
      cur.jobs += 1;
      cur.earned += b.amount || 0;
      map.set(b.creatorEmail, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.earned - a.earned).slice(0, 4);
  }, [acceptedBidsInRange]);

  const userByEmail = (email: string) => allUsers.find((u) => u.email === email);

  // ─── Sparkline values for KPIs ───────────────────────────────────────────
  const sparkRevenue = useMemo(() => {
    const arr = new Array(7).fill(0);
    offersInRange.filter((o) => o.status !== "rejected").forEach((o) => {
      const idx = 6 - Math.min(6, Math.floor((rangeEnd - o.createdAt) / (days / 7 * 86_400_000)));
      if (idx >= 0 && idx < 7) arr[idx] += o.adminCut || 0;
    });
    return arr;
  }, [offersInRange, days, rangeEnd]);
  const sparkPayouts = useMemo(() => {
    const arr = new Array(7).fill(0);
    acceptedBidsInRange.forEach((b) => {
      const ts = b.acceptedAt ?? b.createdAt;
      const idx = 6 - Math.min(6, Math.floor((rangeEnd - ts) / (days / 7 * 86_400_000)));
      if (idx >= 0 && idx < 7) arr[idx] += b.amount || 0;
    });
    return arr;
  }, [acceptedBidsInRange, days, rangeEnd]);
  const sparkBids = useMemo(() => {
    const arr = new Array(7).fill(0);
    bidsInRange.forEach((b) => {
      const idx = 6 - Math.min(6, Math.floor((rangeEnd - b.createdAt) / (days / 7 * 86_400_000)));
      if (idx >= 0 && idx < 7) arr[idx] += 1;
    });
    return arr;
  }, [bidsInRange, days, rangeEnd]);

  const exportCsv = () => {
    const rows = [
      ["metric", "value"],
      ["revenue_dzd", String(Math.round(revenue))],
      ["payouts_dzd", String(Math.round(payouts))],
      ["avg_project_dzd", String(Math.round(avgProject))],
      ["fill_rate_pct", fillRate.toFixed(1)],
      ["bids_total", String(totalBids)],
      ["bids_accepted", String(acceptedCount)],
      ["accept_rate_pct", acceptRate.toFixed(1)],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `north-pixel-overview-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rangeLabel = (r: Range) =>
    lang === "ar" ? (r === "7d" ? "٧ أيام" : r === "30d" ? "٣٠ يوم" : "٩٠ يوم") : r;

  return (
    <div className="space-y-6">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Service dropdown */}
        <div className="relative">
          <button
            onClick={() => setServiceMenuOpen((v) => !v)}
            className="glass rounded-full px-3.5 py-2 flex items-center gap-2 text-xs hover:border-accent/40 transition-smooth"
          >
            <span className="text-muted-foreground">{lang === "ar" ? "الخدمة:" : "Service:"}</span>
            <span className="font-semibold">
              {serviceFilter === "all"
                ? (lang === "ar" ? "الكل" : "All")
                : services.find(([s]) => s === serviceFilter)?.[1] || serviceFilter}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          {serviceMenuOpen && (
            <div className="absolute top-full mt-1 z-20 glass rounded-xl p-1.5 min-w-[200px] shadow-elevated">
              <button
                onClick={() => { setServiceFilter("all"); setServiceMenuOpen(false); }}
                className={`w-full text-start px-3 py-1.5 rounded-lg text-xs transition-smooth ${serviceFilter === "all" ? "bg-accent/20 text-accent" : "hover:bg-muted/40"}`}
              >
                {lang === "ar" ? "الكل" : "All services"}
              </button>
              {services.map(([slug, title]) => (
                <button
                  key={slug}
                  onClick={() => { setServiceFilter(slug); setServiceMenuOpen(false); }}
                  className={`w-full text-start px-3 py-1.5 rounded-lg text-xs transition-smooth ${serviceFilter === slug ? "bg-accent/20 text-accent" : "hover:bg-muted/40"}`}
                >
                  {title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Range pills */}
        <div className="glass rounded-full p-1 flex items-center gap-1 text-xs">
          {(Object.keys(RANGE_DAYS) as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 rounded-full transition-smooth ${range === r ? "bg-accent/20 text-accent border border-accent/40" : "text-muted-foreground hover:text-foreground"}`}
            >
              {rangeLabel(r)}
            </button>
          ))}
        </div>

        <button
          onClick={exportCsv}
          className="glass rounded-full px-3.5 py-2 text-xs flex items-center gap-1.5 hover:border-accent/40 transition-smooth"
        >
          <Download className="w-3.5 h-3.5" />
          {lang === "ar" ? "تصدير" : "Export"}
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={DollarSign}
          label={lang === "ar" ? "إيراداتي" : lang === "fr" ? "Revenus" : "Revenue"}
          ringClass="border border-accent/20 shadow-[0_0_30px_-8px_hsl(41_67%_60%/0.35)]"
          iconClass="bg-accent/15 text-accent"
          sparkColor="hsl(41 67% 60%)"
          sparkValues={sparkRevenue}
        >
          <div className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-accent">
            {fmtShort(revenue)} <span className="text-sm font-normal text-muted-foreground">DZD</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <Delta pct={pctChange(revenue, revenuePrev)} lang={lang} />
            <span className="text-muted-foreground">{lang === "ar" ? "مقارنة بالفترة السابقة" : "vs prev. period"}</span>
          </div>
        </KpiCard>

        <KpiCard
          icon={CreditCard}
          label={lang === "ar" ? "مدفوعات العمال" : lang === "fr" ? "Paiements créateurs" : "Creator payouts"}
          ringClass="border border-primary/20 shadow-[0_0_30px_-8px_hsl(207_75%_60%/0.35)]"
          iconClass="bg-primary/20 text-white"
          sparkColor="hsl(207 75% 60%)"
          sparkValues={sparkPayouts}
        >
          <div className="font-serif text-2xl md:text-3xl font-bold tracking-tight">
            {fmtShort(payouts)} <span className="text-sm font-normal text-muted-foreground">DZD</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <Delta pct={pctChange(payouts, payoutsPrev)} lang={lang} />
            <span className="text-muted-foreground">
              {acceptedCount} {lang === "ar" ? "تم الدفع" : "paid"}
            </span>
          </div>
        </KpiCard>

        <KpiCard
          icon={TrendingUp}
          label={lang === "ar" ? "متوسط مشروع · معدل الإنجاز" : lang === "fr" ? "Projet moy · Taux" : "Avg project · Fill rate"}
          ringClass="border border-emerald-400/20 shadow-[0_0_30px_-8px_hsl(150_60%_55%/0.35)]"
          iconClass="bg-emerald-400/15 text-emerald-400"
          sparkColor="hsl(150 60% 55%)"
          sparkValues={sparkRevenue}
        >
          <div className="flex items-baseline gap-3">
            <div className="font-serif text-xl md:text-2xl font-bold">
              {fmtShort(avgProject)} <span className="text-xs font-normal text-muted-foreground">DZD</span>
            </div>
            <div className="font-serif text-xl md:text-2xl font-bold text-emerald-400">
              {Math.round(fillRate)}<span className="text-base">%</span>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <Delta pct={pctChange(avgProject, avgPrev)} lang={lang} />
            <span className="text-muted-foreground">
              {fillNumerator} / {fillDenominator} {lang === "ar" ? "مكتمل" : "filled"}
            </span>
          </div>
        </KpiCard>

        <KpiCard
          icon={Gavel}
          label={lang === "ar" ? "مزايدات / مقبولة" : lang === "fr" ? "Offres / acceptées" : "Bids / accepted"}
          ringClass="border border-destructive/20 shadow-[0_0_30px_-8px_hsl(0_75%_55%/0.35)]"
          iconClass="bg-destructive/15 text-destructive"
          sparkColor="hsl(0 75% 65%)"
          sparkValues={sparkBids}
        >
          <div className="flex items-baseline gap-2">
            <div className="font-serif text-2xl md:text-3xl font-bold tracking-tight">{totalBids}</div>
            <div className="text-muted-foreground">/</div>
            <div className="font-serif text-xl md:text-2xl font-bold text-emerald-400">{acceptedCount}</div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="text-muted-foreground">{lang === "ar" ? "نسبة القبول" : "Accept rate"}</span>
            <Delta pct={pctChange(acceptRate, acceptRatePrev)} lang={lang} />
            <span className="text-emerald-400 font-semibold">{acceptRate.toFixed(1)}%</span>
          </div>
        </KpiCard>
      </div>

      {/* Big chart */}
      <div className="glass rounded-3xl p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
              {serviceFilter === "all"
                ? (lang === "ar" ? "كل الخدمات" : "All services")
                : services.find(([s]) => s === serviceFilter)?.[1]}
            </p>
            <h3 className="font-serif text-2xl md:text-3xl font-bold">
              {chartTotalLabel} <span className="text-sm font-normal text-muted-foreground align-middle">{chartTotalSuffix}</span>
            </h3>
          </div>
          <div className="glass rounded-full p-1 flex items-center gap-0.5 text-xs flex-wrap">
            {(["revenue", "projects", "bids", "payouts"] as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1.5 rounded-full transition-smooth ${metric === m ? "bg-accent/20 text-accent border border-accent/30" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "revenue" ? (lang === "ar" ? "إيرادات" : lang === "fr" ? "Revenus" : "Revenue")
                  : m === "projects" ? (lang === "ar" ? "مشاريع" : lang === "fr" ? "Projets" : "Projects")
                  : m === "bids" ? (lang === "ar" ? "مزايدات" : "Bids")
                  : (lang === "ar" ? "مدفوعات" : lang === "fr" ? "Paiements" : "Payouts")}
              </button>
            ))}
          </div>
        </div>

        <div className="h-56 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={buckets} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="overviewGold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(41 67% 60%)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(41 67% 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(222 30% 18%)" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(215 16% 65%)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                tick={{ fill: "hsl(215 16% 65%)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => fmtShort(v)}
                width={40}
              />
              <Tooltip
                cursor={{ stroke: "hsl(41 67% 60%)", strokeWidth: 1, strokeDasharray: "3 6" }}
                contentStyle={{ background: "hsl(222 40% 8%)", border: "1px solid hsl(222 30% 18%)", borderRadius: 12, fontSize: 12 }}
                labelStyle={{ color: "hsl(215 16% 65%)" }}
                formatter={(v: number) => metric === "revenue" || metric === "payouts" ? formatDZD(v) : v}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(41 67% 65%)"
                strokeWidth={2.5}
                fill="url(#overviewGold)"
                activeDot={{ r: 5, fill: "hsl(41 67% 65%)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top performers */}
      <div className="glass rounded-3xl p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="block w-1 h-5 rounded-full bg-gradient-to-b from-accent to-accent/30" />
            <h2 className="font-serif text-xl font-bold flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" />
              {lang === "ar" ? "أفضل العمال" : lang === "fr" ? "Top créateurs" : "Top performers"}
            </h2>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent uppercase">
              {rangeLabel(range)}
            </span>
          </div>
        </div>

        {performers.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            {lang === "ar" ? "لا أعمال مقبولة في هذه الفترة." : "No accepted work in this period."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {performers.map((p, i) => (
              <PerformerCard
                key={p.email}
                rank={i + 1}
                user={userByEmail(p.email)}
                jobs={p.jobs}
                earned={p.earned}
                fallbackName={p.name}
                fallbackEmail={p.email}
                lang={lang}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alerts (kept from original Overview) */}
      {(pendingOffers.length > 0 || pendingCreators.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {pendingOffers.length > 0 && (
            <button onClick={onJumpToOffers} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-yellow-400/40 transition-smooth text-start">
              <div className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{pendingOffers.length} {lang === "ar" ? "عرض ينتظر" : "offer(s) waiting"}</div>
                <div className="text-xs text-muted-foreground">{lang === "ar" ? "انقر للمراجعة" : "Click to review"}</div>
              </div>
              <Bell className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            </button>
          )}
          {pendingCreators.length > 0 && (
            <button onClick={onJumpToCreators} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-accent/40 transition-smooth text-start">
              <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-accent" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{pendingCreators.length} {lang === "ar" ? "عامل ينتظر" : "creator(s) pending"}</div>
                <div className="text-xs text-muted-foreground">{lang === "ar" ? "انقر للموافقة" : "Click to approve"}</div>
              </div>
              <Bell className="w-4 h-4 text-accent flex-shrink-0" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
