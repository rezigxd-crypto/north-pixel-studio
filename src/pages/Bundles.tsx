import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BundlePartnership } from "@/components/BundlePartnership";
import { BundleRequestModal } from "@/components/BundleRequestModal";
import { BUNDLES, type Bundle } from "@/lib/offers";
import { useApp } from "@/lib/context";

/**
 * Dedicated B2B partnership bundles page. The homepage now only links here
 * with a compact teaser to keep the index light, while this page shows the
 * full pricing tables for all three bundles (university, hospitality, SME)
 * side by side.
 */
const Bundles = () => {
  const { lang, auth } = useApp();
  const navigate = useNavigate();
  const ar = lang === "ar";
  const isLoggedIn = !!auth.role && !auth.loading;

  const [bundleModalOpen, setBundleModalOpen] = useState(false);
  const [bundleModalBundle, setBundleModalBundle] = useState<Bundle | null>(null);
  const [bundleModalTier, setBundleModalTier] = useState<string>("");

  const handleRequest = (bundle: Bundle, tierId: string) => {
    if (!isLoggedIn) {
      navigate(`/auth/signup?role=client&next=/bundles#${bundle.slug}`);
      return;
    }
    if (auth.role && auth.role !== "client") {
      navigate("/portal/" + auth.role);
      return;
    }
    setBundleModalBundle(bundle);
    setBundleModalTier(tierId);
    setBundleModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
            <Briefcase className="w-3.5 h-3.5" />
            {ar ? "باقات شهرية B2B" : lang === "fr" ? "Formules mensuelles B2B" : "Monthly B2B Bundles"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            {ar ? (
              <>
                عقد شهري واحد. <span className="text-accent">إنتاج بلا توقّف.</span>
              </>
            ) : lang === "fr" ? (
              <>
                Un contrat mensuel. <span className="text-accent">La production sans interruption.</span>
              </>
            ) : (
              <>
                One monthly contract. <span className="text-accent">Production never stops.</span>
              </>
            )}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {ar
              ? "بدلًا من المساومة على كلّ مشروع، تختار باقة شهرية ثابتة. فريق الاستوديو يخطّط وينفّذ. أنت تستلم عملًا منتظمًا بميزانية واضحة — كأنّ لديك قسم وسائط داخلي بدون توظيف."
              : lang === "fr"
                ? "Au lieu de négocier chaque projet, vous prenez une formule mensuelle fixe. L'équipe studio planifie et livre. Vous recevez du contenu régulier, dans un budget clair — comme un service média interne, sans embauche."
                : "Instead of haggling per project, you pick a fixed monthly bundle. Our studio team plans and delivers. You get steady content on a clear budget — like an in-house media department without the hires."}
          </p>
        </div>
      </section>

      {BUNDLES.map((bundle) => (
        <BundlePartnership
          key={bundle.slug}
          bundle={bundle}
          onRequest={(tierId) => handleRequest(bundle, tierId)}
          showCtas={!isLoggedIn || auth.role === "client"}
        />
      ))}

      <BundleRequestModal
        bundle={bundleModalBundle}
        initialTierId={bundleModalTier}
        open={bundleModalOpen}
        onOpenChange={setBundleModalOpen}
      />

      <SiteFooter />
    </div>
  );
};

export default Bundles;
