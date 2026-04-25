import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import TrueFocus from "@/components/ui/true-focus";
import { AnimatedHeroText } from "@/components/AnimatedHeroText";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OFFERS, UNIVERSITY_BUNDLE } from "@/lib/offers";
import { usePublicStats } from "@/lib/store";
import * as Icons from "lucide-react";
import hero from "@/assets/hero-cinematic.jpg";
import { ArrowRight, Sparkles, Users, UserCheck, GraduationCap, Check } from "lucide-react";
import { useApp } from "@/lib/context";

const AR_WORDS = ["احترافية", "إبداع", "براعة", "ابتكار", "تألّق", "جودة", "خبرة"];
const FR_WORDS = ["professionnalisme", "créativité", "expertise", "innovation", "excellence"];
const EN_WORDS = ["professionalism", "creativity", "expertise", "innovation", "excellence"];

const Index = () => {
  const { lang, auth } = useApp();
  const userCounts = usePublicStats();
  const isLoggedIn = !!auth.role && !auth.loading;

  const animatedWords = lang === "ar" ? AR_WORDS : lang === "fr" ? FR_WORDS : EN_WORDS;
  const heroPrefix =
    lang === "ar" ? "أول منصة جزائرية في السمعي البصري تجمع بين الزبون والعامل الحر بكل"
    : lang === "fr" ? "La première plateforme audiovisuelle algérienne réunissant clients et freelances avec"
    : "Algeria's first audio-visual platform connecting clients & freelancers with full";

  const ub = UNIVERSITY_BUNDLE;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-8">
            <Sparkles className="w-3.5 h-3.5" /> {lang === "ar" ? "استوديو صوتي بصري + شبكة مبدعين" : lang === "fr" ? "Studio Audio-Visuel + Réseau" : "Audio-Visual Studio + Network"}
          </span>

          <div className="mb-5">
            <TrueFocus
              sentence={lang === "ar" ? "نورث بيكسل ستوديو" : "North Pixel Studio"}
              blurAmount={4}
              borderColor="hsl(41 67% 60%)"
              glowColor="hsl(41 67% 60% / 0.5)"
              animationDuration={0.25}
              pauseBetweenAnimations={0.8}
              className="font-serif text-4xl sm:text-6xl md:text-8xl font-bold"
            />
          </div>

          <div className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
            <AnimatedHeroText prefix={heroPrefix} words={animatedWords} wordClassName="text-gradient-gold font-bold" />
          </div>

          {/* Only show CTAs when NOT logged in */}
          {!isLoggedIn && (
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold" size="xl">
                <Link to="/auth/signup">{lang === "ar" ? "ابدأ مشروعًا" : lang === "fr" ? "Démarrer" : "Start a project"} <ArrowRight /></Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/#offers">{lang === "ar" ? "استكشف الخدمات" : lang === "fr" ? "Explorer" : "Explore services"}</Link>
              </Button>
            </div>
          )}

          {/* When logged in — show dashboard shortcut */}
          {isLoggedIn && (
            <Button asChild variant="royal" size="lg">
              <Link to={`/portal/${auth.role}`}>
                {lang === "ar" ? "الذهاب للوحة التحكم" : "Go to my dashboard"} <ArrowRight className="ms-2 w-4 h-4" />
              </Link>
            </Button>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mt-14">
            <div className="glass rounded-2xl p-4 text-center">
              <Users className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold">{userCounts.clients}</div>
              <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "عميل مسجّل" : "Clients"}</div>
            </div>
            <div className="glass rounded-2xl p-4 text-center">
              <UserCheck className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold">{userCounts.creators}</div>
              <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "عامل حر" : "Freelancers"}</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="offers" className="px-4 sm:px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{lang === "ar" ? "حرفتنا" : "Our craft"}</span>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold mt-3">{lang === "ar" ? "خدمات تصيب الإطار." : "Services that hit the frame."}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">{lang === "ar" ? "انقر على أي خدمة لاستكشاف التفاصيل." : "Click any service to explore."}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OFFERS.map((o) => {
            const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
            const title = o.title[lang];
            const tagline = o.tagline[lang];
            return (
              <Link key={o.slug} to={o.slug === "motion-graphics" ? "/services/motion-graphics" : `/services/${o.slug}`} className="block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[18px]">
                <GlowCard variant={o.accent === "gold" ? "gold" : "royal"} className="group-hover:-translate-y-0.5 transition-transform duration-200">
                  <div className="relative h-36 sm:h-40 overflow-hidden flex-shrink-0">
                    <img src={o.image} alt={title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
                    <div className={`absolute top-3 ${lang === "ar" ? "right-3" : "left-3"} w-9 h-9 rounded-xl flex items-center justify-center ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className={`absolute bottom-2.5 ${lang === "ar" ? "left-2.5" : "right-2.5"} text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm ${o.accent === "gold" ? "bg-accent/25 text-accent border border-accent/30" : "bg-primary/25 text-primary-foreground border border-primary/30"}`}>
                      {o.startingPrice}
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-4">
                    <h3 className="font-serif text-base sm:text-lg font-bold mb-1">{title}</h3>
                    <p className="text-muted-foreground text-xs leading-relaxed flex-1 line-clamp-2">{tagline}</p>
                    <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${o.accent === "gold" ? "text-accent" : "text-primary-foreground/70 group-hover:text-white"} transition-colors`}>
                      {lang === "ar" ? "اكتشف" : "Discover"} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </GlowCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* UNIVERSITY */}
      <section id="university" className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="relative glass rounded-3xl overflow-hidden">
          <div className="absolute inset-0">
            <img src={ub.image} alt="" loading="lazy" className="w-full h-full object-cover opacity-10" />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/25 via-background/85 to-accent/15" />
          </div>
          <div className="relative p-6 sm:p-10 md:p-14">
            <div className="inline-flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="glass px-4 py-1.5 rounded-full text-sm font-bold text-primary-foreground bg-gradient-royal">{ub.badge[lang]}</span>
            </div>
            <p className="text-accent text-xs uppercase tracking-widest mb-2 font-semibold">{ub.slogan[lang]}</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 max-w-3xl leading-snug">{ub.headline[lang]}</h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
              {ub.includes[lang].map((item, i) => (
                <div key={i} className="flex items-start gap-3 glass rounded-xl p-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-royal flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-sm leading-snug">{item}</span>
                </div>
              ))}
            </div>
            {/* Hide CTA when logged in as non-client */}
            {(!isLoggedIn || auth.role === "client") && (
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="royal" size="lg">
                  <Link to={isLoggedIn ? "/portal/client" : "/auth/signup?role=client"}>
                    {lang === "ar" ? "طلب العرض الجامعي" : "Request offer"} <ArrowRight className="ms-2 w-4 h-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="mailto:hello@thealgerianstudio.com">{lang === "ar" ? "تواصل معنا" : "Contact us"}</a>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA — only when not logged in */}
      {!isLoggedIn && (
        <section id="about" className="px-4 sm:px-6 py-16 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass rounded-3xl p-7 sm:p-10 relative overflow-hidden">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary-glow/15 blur-3xl" />
              <span className="text-xs uppercase tracking-widest text-accent">{lang === "ar" ? "للعلامات التجارية" : "For Brands"}</span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold mt-3 mb-4">{lang === "ar" ? "زوّدنا بالموجز. نحن نجمع الفريق." : "Brief us. We assemble the team."}</h3>
              <p className="text-muted-foreground mb-7 text-sm">{lang === "ar" ? "أخبرنا بقصتك. نر��طك بالفريق المناسب." : "Tell us your story. We match you with the right team."}</p>
              <Button asChild variant="royal" size="lg"><Link to="/auth/signup?role=client">{lang === "ar" ? "فتح حساب عميل" : "Open client account"}</Link></Button>
            </div>
            <div className="glass rounded-3xl p-7 sm:p-10 relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl" />
              <span className="text-xs uppercase tracking-widest text-accent">{lang === "ar" ? "للمبدعين" : "For Creators"}</span>
              <h3 className="font-serif text-2xl sm:text-4xl font-bold mt-3 mb-4">{lang === "ar" ? "أحضر ملف أعمالك. نحن نجلب الموجزات." : "Bring your portfolio. We bring the briefs."}</h3>
              <p className="text-muted-foreground mb-7 text-sm">{lang === "ar" ? "انضم وقدّم عروضًا على مشاريع متميزة." : "Join and bid on premium projects."}</p>
              <Button asChild variant="gold" size="lg"><Link to="/auth/signup?role=creator">{lang === "ar" ? "التقدم كمبدع" : "Apply as creator"}</Link></Button>
            </div>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
};

export default Index;
