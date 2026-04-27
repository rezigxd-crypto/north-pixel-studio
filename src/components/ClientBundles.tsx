/**
 * Client "My Bundles" tab — read-only workspace showing the client's
 * bundle subscriptions and the deliverables the studio has scheduled
 * for each one. Clients cannot edit deliverables; only see status.
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import {
  ChevronLeft, Building2, Calendar, FileText, MapPin, Phone, User, Clock,
} from "lucide-react";
import {
  type BundleSubscription,
  type DeliverableStatus,
  type SubscriptionStatus,
  useClientSubscriptions,
  useDeliverables,
} from "@/lib/bundles";
import { getBundle, getBundleTier, formatDZD } from "@/lib/offers";

const StatusBadge = ({ status, lang }: { status: SubscriptionStatus; lang: string }) => {
  const map: Record<SubscriptionStatus, { ar: string; en: string; fr: string; cls: string }> = {
    pending:   { ar: "بانتظار",  en: "Pending",   fr: "En attente",  cls: "bg-yellow-400/15 text-yellow-400 ring-yellow-400/30" },
    active:    { ar: "نشطة",      en: "Active",    fr: "Active",      cls: "bg-emerald-400/15 text-emerald-400 ring-emerald-400/30" },
    paused:    { ar: "متوقفة",    en: "Paused",    fr: "En pause",    cls: "bg-blue-400/15 text-blue-400 ring-blue-400/30" },
    cancelled: { ar: "ملغاة",     en: "Cancelled", fr: "Annulée",     cls: "bg-destructive/15 text-destructive ring-destructive/30" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${m.cls}`}>
      {lang === "ar" ? m.ar : lang === "fr" ? m.fr : m.en}
    </span>
  );
};

const DeliverableStatusBadge = ({ status, lang }: { status: DeliverableStatus; lang: string }) => {
  const map: Record<DeliverableStatus, { ar: string; en: string; fr: string; cls: string }> = {
    "planned":      { ar: "مخطط",      en: "Planned",      fr: "Planifié",     cls: "bg-secondary/60 text-muted-foreground ring-border/40" },
    "in-progress":  { ar: "قيد التنفيذ", en: "In progress",  fr: "En cours",     cls: "bg-accent/15 text-accent ring-accent/30" },
    "delivered":    { ar: "مُسلَّم",     en: "Delivered",    fr: "Livré",         cls: "bg-emerald-400/15 text-emerald-400 ring-emerald-400/30" },
    "blocked":      { ar: "متوقف",      en: "Blocked",      fr: "Bloqué",        cls: "bg-destructive/15 text-destructive ring-destructive/30" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${m.cls}`}>
      {lang === "ar" ? m.ar : lang === "fr" ? m.fr : m.en}
    </span>
  );
};

const SubscriptionWorkspace = ({
  subscription, onBack,
}: { subscription: BundleSubscription; onBack: () => void }) => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const bundle = getBundle(subscription.bundleSlug);
  const tier = getBundleTier(subscription.bundleSlug, subscription.tierId);
  const deliverables = useDeliverables(subscription.id);

  const tierTitle = tier ? (ar ? tier.title.ar : fr ? tier.title.fr : tier.title.en) : subscription.tierId;
  const bundleLabel = bundle ? (ar ? bundle.badge.ar : fr ? bundle.badge.fr : bundle.badge.en) : subscription.bundleSlug;

  const grouped = useMemo(() => {
    const map = new Map<string, typeof deliverables>();
    deliverables.forEach((d) => {
      const key = d.monthLabel || (ar ? "غير مصنّف" : fr ? "Non daté" : "Undated");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(d);
    });
    return Array.from(map.entries());
  }, [deliverables, ar, fr]);

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ChevronLeft className="w-4 h-4" />
        {ar ? "رجوع" : fr ? "Retour" : "Back"}
      </Button>

      <div className="glass rounded-2xl p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{bundleLabel}</span>
            <StatusBadge status={subscription.status} lang={lang} />
          </div>
          <h2 className="font-serif text-xl font-bold">{subscription.orgName}</h2>
          <div className="text-xs text-muted-foreground mt-1">
            {tierTitle} · {formatDZD(subscription.monthlyPrice, lang)} / {ar ? "شهر" : fr ? "mois" : "mo"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{subscription.contactName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium" dir="ltr">{subscription.contactPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{subscription.wilaya}</span>
          </div>
          {subscription.kickoffDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-medium">{subscription.kickoffDate}</span>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-5 space-y-3">
        <h3 className="font-serif text-lg font-bold flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          {ar ? "المخرجات الشهرية" : fr ? "Livrables" : "Monthly deliverables"}
        </h3>

        {deliverables.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            {subscription.status === "pending"
              ? ar ? "سنبدأ التخطيط فور تفعيل اشتراكك."
                : fr ? "Nous planifierons dès l'activation de votre bundle."
                : "We'll plan deliverables once your bundle is activated."
              : ar ? "لم تُجدول مهام بعد." : fr ? "Aucun livrable planifié pour l'instant." : "No deliverables scheduled yet."}
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map(([month, items]) => (
              <div key={month}>
                <div className="text-xs font-bold uppercase tracking-widest text-accent mb-2">{month}</div>
                <div className="space-y-2">
                  {items.map((d) => (
                    <div key={d.id} className="rounded-xl border border-border/50 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm">{d.title}</div>
                          {d.description && (
                            <p className="text-xs text-muted-foreground mt-1">{d.description}</p>
                          )}
                          {d.dueDate && (
                            <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {d.dueDate}
                            </div>
                          )}
                        </div>
                        <DeliverableStatusBadge status={d.status} lang={lang} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const ClientBundles = ({ clientUid }: { clientUid: string }) => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const subs = useClientSubscriptions(clientUid);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = subs.find((s) => s.id === selectedId);
  if (selected) {
    return <SubscriptionWorkspace subscription={selected} onBack={() => setSelectedId(null)} />;
  }

  if (subs.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <div className="text-4xl mb-3">📦</div>
        <h3 className="font-serif text-lg font-bold mb-2">
          {ar ? "لا اشتراكات بعد" : fr ? "Aucun bundle pour l'instant" : "No bundles yet"}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {ar
            ? "اطلب باقة شهرية من الصفحة الرئيسية وسنعود إليك خلال 24 ساعة."
            : fr
            ? "Demandez une formule mensuelle depuis la page d'accueil — nous vous recontactons sous 24h."
            : "Request a monthly bundle from the home page — we'll be in touch within 24h."}
        </p>
        <Button asChild variant="royal">
          <a href="/#bundles">{ar ? "اكتشف الباقات" : fr ? "Voir les bundles" : "Explore bundles"}</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subs.map((s) => {
        const bundle = getBundle(s.bundleSlug);
        const tier = getBundleTier(s.bundleSlug, s.tierId);
        return (
          <button
            key={s.id}
            onClick={() => setSelectedId(s.id)}
            className="w-full glass rounded-2xl p-4 flex items-start gap-3 text-start hover:border-accent/40 transition-smooth"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-0.5">
                <span className="font-semibold text-sm truncate">{s.orgName}</span>
                <StatusBadge status={s.status} lang={lang} />
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {bundle ? (ar ? bundle.badge.ar : fr ? bundle.badge.fr : bundle.badge.en) : s.bundleSlug}
                {tier ? ` · ${ar ? tier.title.ar : fr ? tier.title.fr : tier.title.en}` : ""}
                · {formatDZD(s.monthlyPrice, lang)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {new Date(s.createdAt).toLocaleDateString()}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
