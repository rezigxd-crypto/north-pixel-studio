import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OFFERS } from "@/lib/offers";
import * as Icons from "lucide-react";
import hero from "@/assets/hero-cinematic.jpg";
import { ArrowRight, Sparkles, Award, Users } from "lucide-react";
import { useApp } from "@/lib/context";
import { useEffect } from "react";

const Index = () => {
  const { t, lang, auth } = useApp();
  const navigate = useNavigate();

  // Redirect logged-in users straight to their portal
  useEffect(() => {
    if (!auth.loading && auth.role) {
      navigate(`/portal/${auth.role}`, { replace: true });
    }
  }, [auth.loading, auth.role]);

  const heroSub =
    lang === "ar"
      ? "أستوديو الجزائر نورث بيكسل ستوديو يربط العلامات التجارية و اصحاب المحتوى بشبكة منتقاة من المصورين السينمائيين والمحررين والمواهب الصوتية وغيرهم — تحت سقف احترافي واحد."
      : t("heroSub");

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <img
          src={hero}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-8">
            <Sparkles className="w-3.5 h-3.5" /> {t("heroTag")}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
            {t("heroTitle1")}
            <br />
            {t("heroTitle2")} <span className="text-gradient-gold">{t("heroCinema")}</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            {heroSub}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="gold" size="xl">
              <Link to="/auth/signup">
                {t("startProject")} <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/#offers">{t("exploreServices")}</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-6 max-w-2xl mx-auto mt-20">
            {[
              { icon: Award, k: "0", v: lang === "ar" ? "إنتاجات مسلّمة" : lang === "fr" ? "Productions livrées" : "Productions delivered" },
              { icon: Users, k: "0", v: lang === "ar" ? "مبدعون موثّقون" : lang === "fr" ? "Créateurs vérifiés" : "Vetted creators" },
              { icon: Sparkles, k: "0", v: lang === "ar" ? "ترشيحات للجوائز" : lang === "fr" ? "Nominations" : "Award nominations" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl p-4 md:p-5 text-left">
                <s.icon className="w-5 h-5 text-accent mb-3" />
                <div className="font-serif text-2xl md:text-3xl font-bold">{s.k}</div>
                <div className="text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────── */}
      <section id="offers" className="relative px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("ourCraft")}</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-3">{t("servicesTitle")}</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">{t("servicesSub")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {OFFERS.map((o, i) => {
            const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
            const title = o.title[lang];
            const tagline = o.tagline[lang];
            return (
              <Link
                key={o.slug}
                to={`/services/${o.slug}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="block animate-fade-in group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[20px]"
              >
                <GlowCard
                  variant={o.accent === "gold" ? "gold" : "royal"}
                  className="h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-40 sm:h-44 overflow-hidden rounded-t-[18px] flex-shrink-0">
                    <img
                      src={o.image}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Icon badge */}
                    <div
                      className={`absolute top-3 ${lang === "ar" ? "right-3" : "left-3"} w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shadow-lg ${
                        o.accent === "gold"
                          ? "bg-gradient-gold text-accent-foreground"
                          : "bg-gradient-royal text-primary-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>

                    {/* Price badge on image */}
                    <div
                      className={`absolute bottom-3 ${lang === "ar" ? "left-3" : "right-3"} text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                        o.accent === "gold"
                          ? "bg-accent/20 text-accent border border-accent/30"
                          : "bg-primary/20 text-primary-foreground border border-primary/30"
                      }`}
                    >
                      {o.startingPrice}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-4 sm:p-5">
                    <h3 className="font-serif text-lg sm:text-xl font-bold mb-1.5 leading-snug">
                      {title}
                    </h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed flex-1 line-clamp-3">
                      {tagline}
                    </p>

                    {/* Discover link */}
                    <div className={`mt-4 flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors ${
                      o.accent === "gold" ? "text-accent group-hover:text-accent/80" : "text-primary-foreground/70 group-hover:text-white"
                    }`}>
                      <span>{t("discover")}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </GlowCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section id="about" className="px-4 sm:px-6 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary-glow/20 blur-3xl" />
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("forBrands")}</span>
            <h3 className="font-serif text-2xl md:text-4xl font-bold mt-3 mb-4">{t("briefUs")}</h3>
            <p className="text-muted-foreground mb-8 text-sm md:text-base">{t("brandSub")}</p>
            <Button asChild variant="royal" size="lg">
              <Link to="/auth/signup?role=client">{t("openClient")}</Link>
            </Button>
          </div>
          <div className="glass rounded-3xl p-8 md:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("forCreatorsSection")}</span>
            <h3 className="font-serif text-2xl md:text-4xl font-bold mt-3 mb-4">{t("bringPortfolio")}</h3>
            <p className="text-muted-foreground mb-8 text-sm md:text-base">{t("creatorSub")}</p>
            <Button asChild variant="gold" size="lg">
              <Link to="/auth/signup?role=creator">{t("applyCreator")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
