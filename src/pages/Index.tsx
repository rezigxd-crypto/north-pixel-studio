import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OFFERS } from "@/lib/offers";
import * as Icons from "lucide-react";
import hero from "@/assets/hero-cinematic.jpg";
import { ArrowRight, Sparkles, Award, Users } from "lucide-react";
import { useApp } from "@/lib/context";

const Index = () => {
  const { t, lang } = useApp();

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background pointer-events-none" />
        <div className="relative max-w-6xl mx-auto text-center animate-fade-in">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-8">
            <Sparkles className="w-3.5 h-3.5" /> {t("heroTag")}
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold leading-[1.05] mb-6">
            {t("heroTitle1")}<br />{t("heroTitle2")} <span className="text-gradient-gold">{t("heroCinema")}</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">{t("heroSub")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="gold" size="xl"><Link to="/auth/signup">{t("startProject")} <ArrowRight /></Link></Button>
            <Button asChild variant="glass" size="xl"><Link to="/#offers">{t("exploreServices")}</Link></Button>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-20 text-left">
            {[
              { icon: Award, k: "150+", v: t("stat1") },
              { icon: Users, k: "60+", v: t("stat2") },
              { icon: Sparkles, k: "12", v: t("stat3") },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl p-5">
                <s.icon className="w-5 h-5 text-accent mb-3" />
                <div className="font-serif text-2xl md:text-3xl font-bold">{s.k}</div>
                <div className="text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="offers" className="relative px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("ourCraft")}</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-3">{t("servicesTitle")}</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{t("servicesSub")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {OFFERS.map((o, i) => {
            const Icon = (Icons as any)[o.icon] ?? Icons.Sparkles;
            const title = o.title[lang];
            const tagline = o.tagline[lang];
            return (
              <Link key={o.slug} to={`/services/${o.slug}`}
                style={{ animationDelay: `${i * 60}ms` }}
                className="group relative glass rounded-3xl overflow-hidden transition-smooth hover:-translate-y-1 hover:border-accent/40 animate-fade-in">
                {/* Service image */}
                <div className="relative h-44 overflow-hidden">
                  <img src={o.image} alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className={`absolute top-4 ${lang === "ar" ? "right-4" : "left-4"} w-12 h-12 rounded-xl flex items-center justify-center ${o.accent === "gold" ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{tagline}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-accent">{o.startingPrice}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-foreground group-hover:text-accent transition">
                      {t("discover")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section id="about" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="glass rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary-glow/20 blur-3xl" />
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("forBrands")}</span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-4">{t("briefUs")}</h3>
            <p className="text-muted-foreground mb-8">{t("brandSub")}</p>
            <Button asChild variant="royal" size="lg"><Link to="/auth/signup?role=client">{t("openClient")}</Link></Button>
          </div>
          <div className="glass rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
            <span className="text-xs uppercase tracking-[0.3em] text-accent">{t("forCreatorsSection")}</span>
            <h3 className="font-serif text-3xl md:text-4xl font-bold mt-3 mb-4">{t("bringPortfolio")}</h3>
            <p className="text-muted-foreground mb-8">{t("creatorSub")}</p>
            <Button asChild variant="gold" size="lg"><Link to="/auth/signup?role=creator">{t("applyCreator")}</Link></Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Index;
