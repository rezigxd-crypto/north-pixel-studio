import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlowCard } from "@/components/ui/spotlight-card";
import TrueFocus from "@/components/ui/true-focus";
import { AnimatedHeroText } from "@/components/AnimatedHeroText";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { OFFERS, BUNDLES, formatStartingPrice, formatDZD } from "@/lib/offers";
import { usePublicStats } from "@/lib/store";
import * as Icons from "lucide-react";
import hero from "@/assets/hero-cinematic.jpg";
import { ArrowRight, Sparkles, Users, UserCheck, GraduationCap, Check, Clapperboard, Vote, Heart, FileText, Search, Send, ShieldCheck, Wallet, MapPin, Building2, Globe, Award } from "lucide-react";
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

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity np-ken-burns" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background pointer-events-none" />

        {/* Floating accent orbs (transform-only animation) */}
        <div className="np-orb np-orb-gold pointer-events-none" style={{ width: 320, height: 320, top: "-100px", right: "-80px", opacity: 0.35 }} />
        <div className="np-orb np-orb-royal pointer-events-none" style={{ width: 260, height: 260, bottom: "-80px", left: "-60px", opacity: 0.28, animationDelay: "-4s" }} />

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

          {/* Trust chips (only when not logged in) */}
          {!isLoggedIn && (
            <div className="flex flex-wrap justify-center gap-2 mt-7">
              {[
                { Icon: Wallet,      ar: "بريدي موب\u00A0—\u00A0دفع جزائري",      fr: "Baridi Mob\u00A0\u00B7 paiement local", en: "Baridi Mob\u00A0\u00B7 local payments" },
                { Icon: ShieldCheck, ar: "مبدعون موثوقون",                          fr: "Cr\u00E9ateurs v\u00E9rifi\u00E9s",       en: "Verified creators" },
                { Icon: Building2,   ar: "استوديو\u00A0+\u00A0شبكة",               fr: "Studio\u00A0+\u00A0r\u00E9seau",         en: "Studio + network" },
                { Icon: Globe,       ar: "3 لغات\u00A0\u00B7\u00A0كل الولايات",   fr: "3 langues\u00A0\u00B7 toutes wilayas",   en: "3 languages \u00B7 all wilayas" },
              ].map((t, i) => (
                <span key={i} className="glass rounded-full px-3 py-1.5 inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-muted-foreground border border-border/50">
                  <t.Icon className="w-3.5 h-3.5 text-accent" />
                  <span>{lang === "ar" ? t.ar : lang === "fr" ? t.fr : t.en}</span>
                </span>
              ))}
            </div>
          )}

          {/* Stats — clickable directories */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mt-14">
            <Link
              to="/clients"
              className="glass rounded-2xl p-4 text-center transition-smooth hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-10px_hsl(41_67%_60%/0.5)] focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label={lang === "ar" ? "تصفّح العملاء" : lang === "fr" ? "Parcourir les clients" : "Browse clients"}
            >
              <Users className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold">{userCounts.clients}</div>
              <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "عميل مسجّل" : lang === "fr" ? "Clients" : "Clients"}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent/80 mt-2 inline-flex items-center gap-1">
                {lang === "ar" ? "تصفّح" : lang === "fr" ? "Voir" : "Browse"} <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
            <Link
              to="/freelancers"
              className="glass rounded-2xl p-4 text-center transition-smooth hover:border-accent/50 hover:-translate-y-0.5 hover:shadow-[0_0_30px_-10px_hsl(41_67%_60%/0.5)] focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label={lang === "ar" ? "تصفّح المبدعين" : lang === "fr" ? "Parcourir les créateurs" : "Browse freelancers"}
            >
              <UserCheck className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold">{userCounts.creators}</div>
              <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "عامل حر" : lang === "fr" ? "Freelances" : "Freelancers"}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent/80 mt-2 inline-flex items-center gap-1">
                {lang === "ar" ? "تصفّح" : lang === "fr" ? "Voir" : "Browse"} <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
            {/* Static premium stats — Services live + Wilayas covered */}
            <div className="glass rounded-2xl p-4 text-center border border-border/50">
              <Sparkles className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold">{OFFERS.length}</div>
              <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "خدمة احترافية" : lang === "fr" ? "Services pro" : "Services live"}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent/80 mt-2">
                {lang === "ar" ? "متاحة الآن" : lang === "fr" ? "Disponible" : "Available"}
              </div>
            </div>
            <div className="glass rounded-2xl p-4 text-center border border-border/50">
              <MapPin className="w-5 h-5 text-accent mx-auto mb-2" />
              <div className="font-serif text-3xl font-bold">58</div>
              <div className="text-xs text-muted-foreground mt-1">{lang === "ar" ? "ولاية مغطّاة" : lang === "fr" ? "Wilayas couvertes" : "Wilayas covered"}</div>
              <div className="text-[10px] uppercase tracking-widest text-accent/80 mt-2">
                {lang === "ar" ? "جميع الجزائر" : lang === "fr" ? "Toute l'Alg\u00E9rie" : "All Algeria"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — 3 step flow */}
      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{lang === "ar" ? "كيف تعمل المنصّة" : lang === "fr" ? "Comment \u00E7a marche" : "How it works"}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3">
            {lang === "ar" ? "ثلاث خطوات فقط." : lang === "fr" ? "Trois \u00E9tapes, c'est tout." : "Just three steps."}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-sm">
            {lang === "ar" ? "من الفكرة إلى التسليم بأفضل طريقة."
             : lang === "fr" ? "De l'id\u00E9e \u00E0 la livraison, simplement."
             : "From idea to delivery, the right way."}
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 np-stagger">
          {[
            {
              Icon: FileText,
              ar: { t: "اكتب الموجز", d: "صف مشروعك في دقائق، وحدد المدة والميزانية." },
              fr: { t: "R\u00E9digez le brief", d: "D\u00E9crivez le projet en quelques minutes : dur\u00E9e, livrables, budget." },
              en: { t: "Post your brief",      d: "Describe the project in minutes \u2014 timeline, deliverables, budget." },
            },
            {
              Icon: Search,
              ar: { t: "اختر المبدع", d: "تصلك عروض من مبدعين جزائريين موثوقين." },
              fr: { t: "Choisissez l'artiste", d: "Recevez des propositions de cr\u00E9ateurs alg\u00E9riens v\u00E9rifi\u00E9s." },
              en: { t: "Pick the creator",     d: "Receive proposals from verified Algerian creators \u2014 compare and pick." },
            },
            {
              Icon: Send,
              ar: { t: "استلم العمل", d: "متابعة لحظيّة، تسليم في الأجل المتّفق عليه." },
              fr: { t: "Recevez le rendu",     d: "Suivi en direct, livraison dans le d\u00E9lai convenu." },
              en: { t: "Receive delivery",     d: "Live progress tracking, delivery on the agreed deadline." },
            },
          ].map((s, i) => (
            <div key={i} className="np-hover-lift gold relative glass rounded-2xl p-6 border border-border/50">
              <div className="absolute -top-3 start-5 w-7 h-7 rounded-full bg-gradient-gold text-accent-foreground flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
              <div className="w-11 h-11 rounded-xl bg-gradient-gold/20 border border-accent/30 flex items-center justify-center mb-4">
                <s.Icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-bold mb-2">
                {(lang === "ar" ? s.ar : lang === "fr" ? s.fr : s.en).t}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {(lang === "ar" ? s.ar : lang === "fr" ? s.fr : s.en).d}
              </p>
            </div>
          ))}
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
                      {formatStartingPrice(o.startingPrice, lang)}
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

      {/* ABOUT / STUDIO IDENTITY */}
      <section id="about-studio" className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="relative glass rounded-3xl overflow-hidden border border-border/50">
          <div className="np-orb np-orb-gold pointer-events-none" style={{ width: 280, height: 280, top: "-80px", left: "-60px", opacity: 0.25 }} />
          <div className="np-orb np-orb-royal pointer-events-none" style={{ width: 240, height: 240, bottom: "-60px", right: "-60px", opacity: 0.22, animationDelay: "-5s" }} />

          <div className="relative grid md:grid-cols-[1fr_1.1fr] gap-8 p-6 sm:p-10 md:p-14">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-accent">
                {lang === "ar" ? "عن الاستوديو" : lang === "fr" ? "\u00C0 propos du studio" : "About the studio"}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3 mb-5 leading-tight">
                {lang === "ar"
                  ? "بُني للرواة الجزائريين."
                  : lang === "fr"
                  ? "Con\u00E7u pour les conteurs alg\u00E9riens."
                  : "Built for Algeria's storytellers."}
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                {lang === "ar"
                  ? "نورث بيكسل استوديو ليس مجرّد سوق، بل فريق إبداعي جزائري مدعوم بشبكة من أفضل المبدعين. نجمع الجودة الستوديويّة والثقة في مكان واحد."
                  : lang === "fr"
                  ? "North Pixel Studio n'est pas qu'une marketplace : c'est une \u00E9quipe cr\u00E9ative alg\u00E9rienne soutenue par un r\u00E9seau des meilleurs talents. Qualit\u00E9 studio et confiance, au m\u00EAme endroit."
                  : "North Pixel Studio isn't just a marketplace \u2014 it's an Algerian creative team backed by a network of vetted talent. Studio-grade quality and trust, in one place."}
              </p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                {lang === "ar"
                  ? "من حفلات الزفاف إلى التعليق الصوتي وتصوير 360°، نحوّل الفكرة إلى عمل جاهز للعرض."
                  : lang === "fr"
                  ? "Du mariage au voice-over en passant par les visites 360\u00B0, on transforme l'id\u00E9e en livrable pr\u00EAt-\u00E0-publier."
                  : "From weddings to voice-overs to 360\u00B0 tours, we turn the brief into a ready-to-publish asset."}
              </p>
              <Button asChild variant="glass" size="lg">
                <Link to="/#offers">{lang === "ar" ? "شاهد خدماتنا" : lang === "fr" ? "Voir nos services" : "See our services"} <ArrowRight className="ms-2 w-4 h-4" /></Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 self-stretch np-stagger">
              {[
                { Icon: ShieldCheck, ar: { t: "رسوم شفّافة",     d: "عمولة واحدة واضحة منذ البداية." }, fr: { t: "Frais transparents", d: "Une seule commission claire d\u00E8s le d\u00E9part." }, en: { t: "Transparent fees", d: "One clear commission from the start." } },
                { Icon: Wallet,      ar: { t: "بريدي موب جاهز",  d: "دفع جزائري 100\u066A، بلا رسوم دولية." }, fr: { t: "Baridi Mob pr\u00EAt", d: "Paiement local, z\u00E9ro frais internationaux." }, en: { t: "Baridi-Mob ready", d: "100% local payment \u2014 no FX fees." } },
                { Icon: Award,       ar: { t: "جودة استوديو",        d: "فريق داخلي\u00A0+\u00A0شبكة مختارة." },        fr: { t: "Qualit\u00E9 studio", d: "\u00C9quipe interne + r\u00E9seau s\u00E9lectionn\u00E9." }, en: { t: "Studio quality",   d: "In-house team + curated network." } },
                { Icon: Globe,       ar: { t: "3 لغات\u060c كل الولايات", d: "عربي وفرنسي وإنجليزي، 58 ولاية." }, fr: { t: "3 langues, 58 wilayas", d: "AR\u00A0\u00B7\u00A0FR\u00A0\u00B7\u00A0EN, partout en Alg\u00E9rie." }, en: { t: "3 langs, 58 wilayas", d: "AR \u00B7 FR \u00B7 EN, everywhere in Algeria." } },
              ].map((v, i) => (
                <div key={i} className="np-hover-lift gold glass rounded-2xl p-4 border border-border/50">
                  <div className="w-9 h-9 rounded-lg bg-gradient-gold/20 border border-accent/30 flex items-center justify-center mb-3">
                    <v.Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="font-serif text-sm font-bold mb-1">
                    {(lang === "ar" ? v.ar : lang === "fr" ? v.fr : v.en).t}
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-snug">
                    {(lang === "ar" ? v.ar : lang === "fr" ? v.fr : v.en).d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MONTHLY PARTNERSHIP BUNDLES (university, hospitality, SME) */}
      {BUNDLES.map((bundle) => {
        const BundleIcon = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[bundle.icon] ?? GraduationCap;
        return (
          <section key={bundle.slug} id={bundle.slug} className="px-4 sm:px-6 py-12 max-w-6xl mx-auto">
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
                  <span className="glass px-4 py-1.5 rounded-full text-sm font-bold text-primary-foreground bg-gradient-royal">{bundle.badge[lang]}</span>
                </div>
                <p className="text-accent text-xs uppercase tracking-widest mb-2 font-semibold">{bundle.slogan[lang]}</p>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 max-w-3xl leading-snug">{bundle.headline[lang]}</h2>
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
                          <span className="text-[11px] text-muted-foreground">/ {lang === "ar" ? "شهر" : lang === "fr" ? "mois" : "month"}</span>
                        </div>
                        <ul className="space-y-2">
                          {tier.includes[lang].map((line, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs">
                              <Check className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{line}</span>
                            </li>
                          ))}
                        </ul>
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

                {/* Hide CTA when logged in as non-client */}
                {(!isLoggedIn || auth.role === "client") && (
                  <div className="flex flex-wrap gap-3">
                    <Button asChild variant="royal" size="lg">
                      <Link to={isLoggedIn ? "/portal/client" : "/auth/signup?role=client"}>
                        {lang === "ar" ? "طلب العرض" : lang === "fr" ? "Demander l'offre" : "Request offer"} <ArrowRight className="ms-2 w-4 h-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <a href="mailto:hello@thealgerianstudio.com">{lang === "ar" ? "تواصل معنا" : lang === "fr" ? "Nous contacter" : "Contact us"}</a>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* MOVIECOLLAB QUEST */}
      <section id="quest" className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="relative glass rounded-3xl overflow-hidden border border-accent/30">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/15 via-background/85 to-primary/15 pointer-events-none" />
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/15 blur-3xl pointer-events-none" />

          <div className="relative p-6 sm:p-10 md:p-14">
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0">
                <Clapperboard className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent">
                {lang === "ar" ? "MovieCollab — مجانًا" : "MovieCollab — Free Quest"}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold mb-4 max-w-3xl leading-snug">
              {lang === "ar"
                ? "نجمع مبدعي الجزائر، نصنع فيلمًا قصيرًا في 40 يومًا — ونثبت أنّ السينما الجزائرية تستحقّ."
                : "We gather Algeria's creators and make a short film in 40 days — proving Algerian cinema is great."}
            </h2>

            <p className="text-muted-foreground text-sm mb-6 max-w-2xl leading-relaxed">
              {lang === "ar"
                ? "كلّ شهر تبدأ مهمّة جديدة: 10 أيام لتكوين الفريق، 30 يومًا للصنع. ممثلون، أصوات، مونتيرون، كتّاب — كلّ من يحبّ الفنّ مكانه هنا. الجمهور يصوّت على العنوان، ثم نبيع الفيلم — والعائد يُعيد تمويل المهمّة القادمة."
                : "Each month a new quest opens: 10 days to gather the crew, 30 days to make the film. Actors, voices, editors, writers — everyone who lives for art belongs. The public votes on the title, then we sell the film — and revenue funds the next quest."}
            </p>

            <div className="grid sm:grid-cols-3 gap-3 mb-7 max-w-3xl">
              {[
                { Icon: Users, ar: "10 أيام تجميع", en: "10 days gather" },
                { Icon: Vote, ar: "تصويت على العنوان", en: "Public title vote" },
                { Icon: Heart, ar: "كلّ المبدعين مرحَّب بهم", en: "Every creator welcome" },
              ].map((p) => (
                <div key={p.en} className="glass rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-gold flex items-center justify-center flex-shrink-0">
                    <p.Icon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <span className="text-sm">{lang === "ar" ? p.ar : p.en}</span>
                </div>
              ))}
            </div>

            <p className="text-sm italic text-accent mb-6 max-w-2xl">
              {lang === "ar"
                ? "«قد لا أكون كبيرًا مثلك… لكن الجمهور يعرف أنّني أفضل.»"
                : "“I might not be as big as you — but the public knows I'm better.”"}
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="gold" size="lg">
                <Link to="/quest#join">
                  {lang === "ar" ? "انضمّ لطاقمنا الآن!" : "Join our crew now!"} <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/quest">{lang === "ar" ? "اعرف أكثر" : "Learn more"}</Link>
              </Button>
            </div>
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
              <p className="text-muted-foreground mb-7 text-sm">{lang === "ar" ? "أخبرنا بقصتك. نربطك بالفريق المناسب." : "Tell us your story. We match you with the right team."}</p>
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
