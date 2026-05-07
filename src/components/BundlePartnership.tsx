import * as Icons from "lucide-react";
import { Check, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { formatDZD, type Bundle } from "@/lib/offers";

/**
 * Renders a single B2B partnership bundle (university / hospitality / SME).
 * Extracted from Index.tsx so the homepage stays light and the dedicated
 * /bundles and /university pages can reuse the same layout.
 *
 * `onRequest(tierId)` is invoked by every "Request" CTA so the parent decides
 * how to handle auth-gating, modals, redirects, etc.
 */
type BundlePartnershipProps = {
  bundle: Bundle;
  onRequest: (tierId: string) => void;
  /** Optionally hide the CTAs (e.g. for visitors not allowed to subscribe). */
  showCtas?: boolean;
};

export const BundlePartnership = ({ bundle, onRequest, showCtas = true }: BundlePartnershipProps) => {
  const { lang } = useApp();
  const BundleIcon =
    (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[bundle.icon] ?? GraduationCap;

  return (
    <section id={bundle.slug} className="px-4 sm:px-6 py-12 max-w-6xl mx-auto">
      <div className="relative glass rounded-3xl overflow-hidden">
        <div className="absolute inset-0">
          <img src={bundle.image} alt="" loading="lazy" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background/85 to-accent/15" />
        </div>
        <div className="relative p-6 sm:p-10 md:p-14">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center flex-shrink-0">
              <BundleIcon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="glass px-4 py-1.5 rounded-full text-sm font-bold text-primary-foreground bg-gradient-royal">
              {bundle.badge[lang]}
            </span>
          </div>
          <p className="text-accent text-xs uppercase tracking-widest mb-2 font-semibold">{bundle.slogan[lang]}</p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 max-w-3xl leading-snug">
            {bundle.headline[lang]}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
            {bundle.includes[lang].map((item, i) => (
              <div key={i} className="flex items-start gap-3 glass rounded-xl p-3">
                <div className="w-6 h-6 rounded-full bg-gradient-royal flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
                <span className="text-sm leading-snug">{item}</span>
              </div>
            ))}
          </div>

          {/* Monthly partnership tiers */}
          <div className="mt-2 mb-8">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-[0.3em] text-accent font-semibold">
                {lang === "ar" ? "عقد شهري" : lang === "fr" ? "Contrat mensuel" : "Monthly partnership"}
              </span>
              <div className="flex-1 h-px bg-accent/20" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {bundle.monthlyTiers.map((tier, idx) => (
                <div
                  key={tier.id}
                  className={`relative glass rounded-2xl p-5 transition-smooth hover:-translate-y-0.5 hover:shadow-[0_0_30px_-12px_hsl(41_67%_60%/0.4)] ${
                    idx === 1 ? "border-2 border-accent/60 ring-1 ring-accent/20" : "border border-border/50"
                  }`}
                >
                  {idx === 1 && (
                    <span className="absolute -top-3 start-4 text-[10px] uppercase tracking-widest font-bold px-2.5 py-0.5 rounded-full bg-gradient-gold text-accent-foreground">
                      {lang === "ar" ? "الأكثر طلبًا" : lang === "fr" ? "Populaire" : "Most popular"}
                    </span>
                  )}
                  <div className="font-serif text-lg font-bold mb-1">{tier.title[lang]}</div>
                  <div className="text-[11px] text-muted-foreground mb-3">{tier.tagline[lang]}</div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="font-serif text-2xl font-bold text-accent">{formatDZD(tier.monthlyPrice, lang)}</span>
                    <span className="text-[11px] text-muted-foreground">
                      / {lang === "ar" ? "شهر" : lang === "fr" ? "mois" : "month"}
                    </span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {tier.includes[lang].map((line, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{line}</span>
                      </li>
                    ))}
                  </ul>
                  {showCtas && (
                    <Button
                      type="button"
                      size="sm"
                      variant={idx === 1 ? "royal" : "outline"}
                      className="w-full"
                      onClick={() => onRequest(tier.id)}
                    >
                      {lang === "ar" ? "اطلب هذه الباقة" : lang === "fr" ? "Demander cette formule" : "Request this tier"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-2 mt-4">
              {bundle.contractTerms[lang].map((term, i) => (
                <div key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <Check className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                  <span>{term}</span>
                </div>
              ))}
            </div>
          </div>

          {showCtas && (
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="royal"
                size="lg"
                onClick={() =>
                  onRequest(
                    bundle.monthlyTiers[Math.floor(bundle.monthlyTiers.length / 2)]?.id ||
                      bundle.monthlyTiers[0]?.id ||
                      "",
                  )
                }
              >
                {lang === "ar" ? "طلب العرض" : lang === "fr" ? "Demander l'offre" : "Request offer"}{" "}
                <ArrowRight className="ms-2 w-4 h-4" />
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="mailto:contact@thealgerianstudio.com">
                  {lang === "ar" ? "تواصل معنا" : lang === "fr" ? "Nous contacter" : "Contact us"}
                </a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
