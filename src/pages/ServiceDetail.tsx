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
  const { t, lang } = useApp();
  const offer = OFFERS.find((o) => o.slug === slug);

  useEffect(() => {
    if (offer) {
      document.title = `${offer.title} — North Pixel Studio`;
    }
  }, [offer]);

  if (!offer) return <Navigate to="/" replace />;
  const Icon = (Icons as any)[offer.icon] ?? Icons.Sparkles;
  const isGold = offer.accent === "gold";

  const processSteps = lang === "ar"
    ? ["الإحاطة والمكالمة الإبداعية", "التصور + عرض الأسعار", "الإنتاج / التسجيل", "ما بعد الإنتاج والتسليم"]
    : lang === "fr"
    ? ["Brief & appel créatif", "Traitement + devis", "Production / enregistrement", "Post-production & livraison"]
    : ["Brief & creative call", "Treatment + quote", "Production / recording", "Post & delivery"];

  const includedLabel = lang === "ar" ? "ما يشمله العرض" : lang === "fr" ? "Ce qui est inclus" : "What's included";
  const processLabel = lang === "ar" ? "العملية" : lang === "fr" ? "Processus" : "Process";
  const investmentLabel = lang === "ar" ? "الاستثمار" : lang === "fr" ? "Investissement" : "Investment";
  const allServicesLabel = lang === "ar" ? "جميع الخدمات" : lang === "fr" ? "Tous les services" : "All services";
  const customQuoteLabel = lang === "ar" ? "عرض سعر مخصص بناءً على النطاق والمواقع وحجم الطاقم." : lang === "fr" ? "Devis personnalisé selon la portée, les lieux et la taille de l'équipe." : "Custom quote based on scope, locations and crew size.";
  const requestQuoteLabel = lang === "ar" ? "طلب عرض سعر" : lang === "fr" ? "Demander un devis" : "Request a quote";
  const openPortalLabel = lang === "ar" ? "فتح بوابة العميل" : lang === "fr" ? "Ouvrir le portail client" : "Open client portal";

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="pt-28 pb-12 px-6 max-w-6xl mx-auto">
        <Link to="/#offers" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent mb-8">
          <ArrowLeft className="w-4 h-4" /> {allServicesLabel}
        </Link>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-10 items-start">
          <div className="animate-fade-in">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isGold ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
              <Icon className="w-7 h-7" />
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4">{offer.title}</h1>
            <p className="text-xl text-muted-foreground mb-8">{offer.tagline}</p>
            <p className="text-foreground/80 leading-relaxed mb-10">{offer.description}</p>

            <h2 className="font-serif text-2xl font-bold mb-4">{includedLabel}</h2>
            <ul className="grid sm:grid-cols-2 gap-3 mb-10">
              {offer.features.map((f) => (
                <li key={f} className="flex items-start gap-3 glass rounded-xl p-4">
                  <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant={isGold ? "gold" : "royal"} size="lg">
                <Link to={`/auth/signup?role=client&service=${offer.slug}`}>{requestQuoteLabel} <ArrowRight /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/portal/client">{openPortalLabel}</Link>
              </Button>
            </div>
          </div>

          <aside className="glass rounded-3xl p-8 sticky top-24 animate-fade-in">
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{investmentLabel}</span>
            <div className="font-serif text-4xl font-bold mt-2">{offer.startingPrice}</div>
            <p className="text-sm text-muted-foreground mt-2">{customQuoteLabel}</p>
            <div className="border-t border-border my-6" />
            <h3 className="font-semibold mb-3">{processLabel}</h3>
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
