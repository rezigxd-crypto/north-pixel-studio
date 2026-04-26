import { Link, useParams, Navigate } from "react-router-dom";
import { OFFERS, formatStartingPrice } from "@/lib/offers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";
import { useApp } from "@/lib/context";

const ServiceDetail = () => {
  const { slug } = useParams();
  const { lang, auth } = useApp();
  const offer = OFFERS.find((o) => o.slug === slug);

  // Scroll to top on mount — fixes landing at bottom of page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    if (offer) document.title = `${offer.title[lang]} — North Pixel Studio`;
  }, [offer, lang]);

  if (!offer) return <Navigate to="/" replace />;
  const Icon = (Icons as any)[offer.icon] ?? Icons.Sparkles;
  const isGold = offer.accent === "gold";

  const title = offer.title[lang];
  const tagline = offer.tagline[lang];
  const description = offer.description[lang];
  const features = offer.features[lang];
  const process = offer.process[lang];

  const labels = {
    allServices: lang === "ar" ? "جميع الخدمات" : lang === "fr" ? "Tous les services" : "All services",
    included: lang === "ar" ? "ما يشمله العرض" : lang === "fr" ? "Ce qui est inclus" : "What's included",
    process: lang === "ar" ? "كيف نعمل" : lang === "fr" ? "Notre processus" : "Our process",
    investment: lang === "ar" ? "الاستثمار" : lang === "fr" ? "Investissement" : "Investment",
    customQuote: lang === "ar" ? "السعر يُحدَّد حسب النطاق والتفاصيل." : lang === "fr" ? "Devis selon la portée et les détails." : "Price based on scope and details.",
    requestQuote: lang === "ar" ? "طلب هذه الخدمة" : lang === "fr" ? "Demander ce service" : "Request this service",
    openPortal: lang === "ar" ? "لوحة العميل" : lang === "fr" ? "Portail client" : "Client portal",
  };

  const ctaLink = auth.role === "client"
    ? "/portal/client"
    : `/auth/signup?role=client&service=${offer.slug}`;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-24 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">

        <Link to="/#offers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-6 transition-smooth">
          <ArrowLeft className="w-4 h-4" /> {labels.allServices}
        </Link>

        {/* Hero image */}
        <div className="relative h-52 sm:h-72 rounded-2xl overflow-hidden mb-8">
          <img src={offer.image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isGold ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold">{title}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div>
            <p className="text-lg text-muted-foreground mb-5 leading-relaxed">{tagline}</p>
            <p className="text-foreground/85 leading-relaxed mb-8">{description}</p>

            <h2 className="font-serif text-2xl font-bold mb-4">{labels.included}</h2>
            <ul className="grid sm:grid-cols-2 gap-3 mb-8">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 glass rounded-xl p-4">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant={isGold ? "gold" : "royal"} size="lg">
                <Link to={ctaLink}>{labels.requestQuote} <ArrowRight className="ms-2 w-4 h-4" /></Link>
              </Button>
              {auth.role !== "client" && (
                <Button asChild variant="outline" size="lg">
                  <Link to="/portal/client">{labels.openPortal}</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="glass rounded-2xl p-6 sticky top-24">
            <span className="text-xs uppercase tracking-widest text-accent">{labels.investment}</span>
            <div className="font-serif text-3xl font-bold mt-2 mb-1">{formatStartingPrice(offer.startingPrice, lang)}</div>
            <p className="text-xs text-muted-foreground mb-5">{labels.customQuote}</p>
            <div className="border-t border-border mb-5" />
            <h3 className="font-semibold mb-3">{labels.process}</h3>
            <ol className="space-y-3">
              {process.map((step, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${isGold ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    {i + 1}
                  </span>
                  <span className="text-sm text-muted-foreground leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ServiceDetail;
