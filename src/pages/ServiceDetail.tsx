import { Link, useParams, Navigate } from "react-router-dom";
import { OFFERS } from "@/lib/offers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import * as Icons from "lucide-react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useEffect } from "react";
import { useApp } from "@/lib/context";

const ServiceDetail = () => {
  const { slug } = useParams();
  const { lang } = useApp();
  const offer = OFFERS.find((o) => o.slug === slug);

  useEffect(() => {
    if (offer) document.title = `${offer.title[lang]} — North Pixel Studio`;
    // Always land on top of the page when opening a service
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [offer, lang, slug]);

  if (!offer) return <Navigate to="/" replace />;
  const Icon = (Icons as any)[offer.icon] ?? Icons.Sparkles;
  const isGold = offer.accent === "gold";

  const title = offer.title[lang];
  const tagline = offer.tagline[lang];
  const description = offer.description[lang];
  const features = offer.features[lang];
  const processSteps = offer.process[lang];

  const labels = {
    allServices: lang === "ar" ? "جميع الخدمات" : lang === "fr" ? "Tous les services" : "All services",
    included: lang === "ar" ? "ما يشمله العرض" : lang === "fr" ? "Ce qui est inclus" : "What's included",
    process: lang === "ar" ? "العملية" : lang === "fr" ? "Processus" : "Process",
    investment: lang === "ar" ? "الاستثمار" : lang === "fr" ? "Investissement" : "Investment",
    customQuote: lang === "ar" ? "عرض سعر مخصص بناءً على النطاق والمواقع وحجم الطاقم." : lang === "fr" ? "Devis personnalisé selon la portée, les lieux et la taille de l'équipe." : "Custom quote based on scope, locations and crew size.",
    requestQuote: lang === "ar" ? "طلب عرض سعر" : lang === "fr" ? "Demander un devis" : "Request a quote",
    openPortal: lang === "ar" ? "فتح بوابة العميل" : lang === "fr" ? "Ouvrir le portail client" : "Open client portal",
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-28 pb-12 px-6 max-w-6xl mx-auto">
        <Link to="/#offers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
          <ArrowLeft className="w-4 h-4" /> {labels.allServices}
        </Link>

        {/* Hero image */}
        <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-10">
          <img src={offer.image} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${isGold ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
              <Icon className="w-6 h-6" />
            </div>
            <h1 className="font-serif text-3xl md:text-5xl font-bold">{title}</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div className="animate-fade-in">
            <p className="text-xl text-muted-foreground mb-6">{tagline}</p>
            <p className="text-foreground/80 leading-relaxed mb-10">{description}</p>

            <h2 className="font-serif text-2xl font-bold mb-4">{labels.included}</h2>
            <ul className="grid sm:grid-cols-2 gap-3 mb-10">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-3 glass rounded-xl p-4">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant={isGold ? "gold" : "royal"} size="lg">
                <Link to={`/auth/signup?role=client&service=${offer.slug}`}>{labels.requestQuote} <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/portal/client">{labels.openPortal}</Link>
              </Button>
            </div>
          </div>

          <aside className="glass rounded-3xl p-8 sticky top-24 animate-fade-in">
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{labels.investment}</span>
            <div className="font-serif text-4xl font-bold mt-2">{offer.startingPrice}</div>
            <p className="text-sm text-muted-foreground mt-2">{labels.customQuote}</p>
            <div className="border-t border-border my-6" />
            <h3 className="font-semibold mb-3">{labels.process}</h3>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {processSteps.map((s, i) => (
                <li key={s} className="flex gap-3"><span className="text-accent font-bold">{i + 1}.</span> {s}</li>
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
