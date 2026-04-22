import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import TrueFocus from "@/components/ui/true-focus";
import { AnimatedHeroText } from "@/components/AnimatedHeroText";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OFFERS, UNIVERSITY_BUNDLE } from "@/lib/offers";
import * as Icons from "lucide-react";
import hero from "@/assets/hero-cinematic.jpg";
import { ArrowRight, Sparkles, Award, Users, GraduationCap, Check } from "lucide-react";
import { useApp } from "@/lib/context";
import { useEffect } from "react";

// Arabic animated words — feelings you get working with us
const AR_ANIMATED_WORDS = ["احترافية", "إبداع", "براعة", "ابتكار", "تألّق", "جودة", "خبرة"];
const FR_ANIMATED_WORDS = ["professionnalisme", "créativité", "expertise", "innovation", "excellence"];
const EN_ANIMATED_WORDS = ["professionalism", "creativity", "expertise", "innovation", "excellence"];

const Index = () => {
  const { t, lang, auth } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && auth.role) {
      navigate(`/portal/${auth.role}`, { replace: true });
    }
  }, [auth.loading, auth.role]);

  const animatedWords =
    lang === "ar" ? AR_ANIMATED_WORDS :
    lang === "fr" ? FR_ANIMATED_WORDS :
    EN_ANIMATED_WORDS;

  const heroPrefix =
    lang === "ar"
      ? "أول منصة جزائرية في السمعي البصري تجمع بين الزبون والعامل الحر بكل"
      : lang === "fr"
      ? "La première plateforme audiovisuelle algérienne qui réunit clients et freelances avec"
      : "Algeria's first audio-visual platform connecting clients & freelancers with full";

  const ub = UNIVERSITY_BUNDLE;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-28 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center animate-fade-in">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-8">
            <Sparkles className="w-3.5 h-3.5" /> {t("heroTag")}
          </span>

          {/* TrueFocus on the platform name */}
          <div className="mb-6">
            <TrueFocus
              sentence={lang === "ar" ? "نورث بيكسل ستوديو" : lang === "fr" ? "North Pixel Studio" : "North Pixel Studio"}
              blurAmount={4}
              borderColor="hsl(41 67% 60%)"
              glowColor="hsl(41 67% 60% / 0.5)"
              animationDuration={0.6}
              pauseBetweenAnimations={1.5}
              className="font-serif text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-foreground"
            />
          </div>

          {/* Animated sliding tagline */}
          <div className={`text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed ${lang === "ar" ? "font-medium" : ""}`}>
            <AnimatedHeroText
              prefix={heroPrefix}
              words={animatedWords}
              wordClassName="text-gradient-gold font-bold"
            />
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Button asChild variant="gold" size="xl">
              <Link to="/auth/signup">{t("startProject")} <ArrowRight /></Link>
            </Button>
            <Button asChild variant="glass" size="xl">
              <Link to="/#offers">{t("exploreServices")}</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-xl mx-auto mt-16">
            {[
              { icon: Award, k: "0", v: lang === "ar" ? "إنتاجات مسلّمة" : lang === "fr" ? "Productions livrées" : "Productions delivered" },
              { icon: Users, k: "0", v: lang === "ar" ? "مبدعون موثّقون" : lang === "fr" ? "Créateurs vérifiés" : "Vetted creators" },
              { icon: Sparkles, k: "0", v: lang === "ar" ? "ترشيحات" : lang === "fr" ? "Nominations" : "Nominations" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl p-3 md:p-5 text-left">
                <s.icon className="w-4 h-4 md:w-5 md:h-5 text-accent mb-2 md:mb-3" />
                <div className="font-serif text-xl md:text-3xl font-bold">{s.k}</div>
                <div className="text-[10px] md:text-xs text-muted-foreground leading-tight">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SERVICES ─────────────────────────────────────────────────── */}
      <section id="offers" className="px-4 sm:px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("ourCraft")}</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-3">{t("servicesTitle")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm md:text-base">{t("servicesSub")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {OFFERS.map((o) => {
            const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
            const title = o.title[lang];
            const tagline = o.tagline[lang];
            return (
              <Link
                key={o.slug}
                to={`/services/${o.slug}`}
                className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[20px]"
              >
                <GlowCard
                  variant={o.accent === "gold" ? "gold" : "royal"}
                  className="h-full flex flex-col transition-transform duration-300 group-hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-36 sm:h-40 overflow-hidden rounded-t-[18px] flex-shrink-0">
                    <img src={o.image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className={`absolute top-3 ${lang === "ar" ? "right-3" : "left-3"} w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-lg ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className={`absolute bottom-2.5 ${lang === "ar" ? "left-2.5" : "right-2.5"} text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${o.accent === "gold" ? "bg-accent/20 text-accent border border-accent/30" : "bg-primary/20 text-primary-foreground border border-primary/30"}`}>
                      {o.startingPrice}
                    </div>
                  </div>
                  {/* Text */}
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-serif text-base sm:text-lg font-bold mb-1 leading-snug">{title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed flex-1 line-clamp-2">{tagline}</p>
                    <div className={`mt-3 flex items-center gap-1 text-xs sm:text-sm font-medium transition-colors ${o.accent === "gold" ? "text-accent" : "text-primary-foreground/70 group-hover:text-white"}`}>
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

      {/* ─── UNIVERSITY BUNDLE ────────────────────────────────────────── */}
      <section id="university" className="px-4 sm:px-6 py-20 max-w-6xl mx-auto">
        <div className="relative glass rounded-3xl overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img src={ub.image} alt="" className="w-full h-full object-cover opacity-15" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-background/80 to-accent/20" />
          </div>

          <div className="relative p-6 sm:p-10 md:p-14">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="glass px-4 py-1.5 rounded-full text-sm font-bold text-primary-foreground bg-gradient-royal">
                {ub.badge[lang]}
              </span>
            </div>

            {/* Slogan */}
            <p className="text-accent text-xs sm:text-sm uppercase tracking-widest mb-3 font-semibold">
              {ub.slogan[lang]}
            </p>

            {/* Headline */}
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-6 max-w-3xl leading-snug">
              {ub.headline[lang]}
            </h2>

            {/* Includes grid */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
              {ub.includes[lang].map((item, i) => (
                <div key={i} className="flex items-start gap-3 glass rounded-xl p-3 sm:p-4">
                  <div className="w-6 h-6 rounded-full bg-gradient-royal flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-foreground/90 leading-snug">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="royal" size="lg">
                <Link to="/auth/signup?role=client">
                  {lang === "ar" ? "طلب العرض الجامعي" : lang === "fr" ? "Demander l'offre" : "Request university offer"}
                  <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="mailto:hello@thealgerianstudio.com">
                  {lang === "ar" ? "تواصل معنا" : lang === "fr" ? "Nous contacter" : "Contact us"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <section id="about" className="px-4 sm:px-6 py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <div className="glass rounded-3xl p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary-glow/20 blur-3xl" />
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("forBrands")}</span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mt-3 mb-4">{t("briefUs")}</h3>
            <p className="text-muted-foreground mb-7 text-sm md:text-base">{t("brandSub")}</p>
            <Button asChild variant="royal" size="lg"><Link to="/auth/signup?role=client">{t("openClient")}</Link></Button>
          </div>
          <div className="glass rounded-3xl p-7 sm:p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("forCreatorsSection")}</span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mt-3 mb-4">{t("bringPortfolio")}</h3>
            <p className="text-muted-foreground mb-7 text-sm md:text-base">{t("creatorSub")}</p>
            <Button asChild variant="gold" size="lg"><Link to="/auth/signup?role=creator">{t("applyCreator")}</Link></Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
