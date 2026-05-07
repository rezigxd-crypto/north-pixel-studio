import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, BookOpen, Calendar, Mic, Camera, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BundlePartnership } from "@/components/BundlePartnership";
import { BundleRequestModal } from "@/components/BundleRequestModal";
import { Button } from "@/components/ui/button";
import { UNIVERSITY_BUNDLE } from "@/lib/offers";
import { useApp } from "@/lib/context";

/**
 * Dedicated landing page for universities and academic institutions.
 * Pulls the same UNIVERSITY_BUNDLE as the /bundles page but adds richer
 * "why this matters for an Algerian university" framing on top.
 */
const University = () => {
  const { lang, auth } = useApp();
  const navigate = useNavigate();
  const ar = lang === "ar";
  const fr = lang === "fr";
  const isLoggedIn = !!auth.role && !auth.loading;

  const [open, setOpen] = useState(false);
  const [tierId, setTierId] = useState<string>("");

  const handleRequest = (id: string) => {
    if (!isLoggedIn) {
      navigate(`/auth/signup?role=client&next=/university#${UNIVERSITY_BUNDLE.slug}`);
      return;
    }
    if (auth.role && auth.role !== "client") {
      navigate("/portal/" + auth.role);
      return;
    }
    setTierId(id);
    setOpen(true);
  };

  // Concrete academic use-cases — explains *why* a university would sign a
  // monthly contract instead of ad-hoc gigs.
  const USE_CASES = [
    {
      Icon: Calendar,
      ar: { t: "الفعاليات والمؤتمرات", d: "تغطية متعددة الكاميرات للمؤتمرات العلمية وحفلات التخرّج وأيّام الجامعة المفتوحة." },
      fr: { t: "Événements & conférences", d: "Couverture multi-caméras pour les colloques, remises de diplômes et journées portes ouvertes." },
      en: { t: "Events & conferences", d: "Multi-camera coverage for academic conferences, graduations, open days." },
    },
    {
      Icon: BookOpen,
      ar: { t: "أرشفة المحاضرات", d: "تسجيل وأرشفة المحاضرات الأكاديمية بصيغة LMS جاهزة، مع ترجمة عربية/فرنسية." },
      fr: { t: "Archivage des cours", d: "Enregistrement et archivage des cours, prêts pour le LMS, avec sous-titres AR/FR." },
      en: { t: "Lecture archival", d: "Record and archive lectures in LMS-ready format with AR/FR captions." },
    },
    {
      Icon: Mic,
      ar: { t: "بودكاست الجامعة", d: "بودكاست شهري لإبراز أبحاث الأساتذة وقصص الطلبة والشراكات الصناعية." },
      fr: { t: "Podcast de l'université", d: "Podcast mensuel mettant en avant la recherche, les étudiants et les partenariats industriels." },
      en: { t: "University podcast", d: "Monthly podcast spotlighting faculty research, student stories, industry partners." },
    },
    {
      Icon: Camera,
      ar: { t: "محتوى الإعلام والقبول", d: "ريلز السوشيال، فيديوهات القبول، بكرة جلب الطلبة الدوليين — بهوية موحّدة." },
      fr: { t: "Communication & admissions", d: "Reels réseaux, vidéos admissions, showreel international — identité unifiée." },
      en: { t: "Media & admissions", d: "Social reels, admissions videos, international showreel — unified visual identity." },
    },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
            <GraduationCap className="w-3.5 h-3.5" />
            {ar ? "للجامعات والمؤسّسات الأكاديمية" : fr ? "Pour les universités & établissements" : "For universities & academic institutions"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            {ar ? <>قسم الإعلام الخاص بجامعتك — <span className="text-accent">دون توظيف</span></>
              : fr ? <>Le service média de votre université — <span className="text-accent">sans embauche</span></>
              : <>Your university's media department — <span className="text-accent">without the hires</span></>}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {ar
              ? "تغطية فعاليات، أرشفة محاضرات، بودكاست أبحاث، محتوى السوشيال — كلّها تحت عقد شهري واحد. الميزانية واضحة من البداية، التسليم منتظم، الجودة تحت إشراف الاستوديو."
              : fr
                ? "Couverture d'événements, archivage de cours, podcast recherche, contenu réseaux — sous un seul contrat mensuel. Budget visible dès le départ, livraisons régulières, qualité supervisée par le studio."
                : "Event coverage, lecture archival, research podcasts, social content — all under one monthly contract. Budget visible upfront, deliveries on a schedule, quality overseen by the studio."}
          </p>
        </div>
      </section>

      {/* ACADEMIC USE CASES */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            {ar ? "ماذا تنتج لكم كلّ شهر؟" : fr ? "Que produisons-nous chaque mois ?" : "What we produce every month"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ar
              ? "أربعة محاور أساسية، يمكن تخصيصها حسب احتياجات كلّ كلّية أو نيابة."
              : fr
                ? "Quatre axes principaux, ajustables selon chaque faculté ou vice-rectorat."
                : "Four core areas, tailored to each faculty or vice-rectorate."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {USE_CASES.map((u, i) => {
            const t = ar ? u.ar : fr ? u.fr : u.en;
            return (
              <article key={i} className="np-hover-lift glass rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-royal/15 border border-primary/30 flex items-center justify-center mb-3">
                  <u.Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-base mb-1.5">{t.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t.d}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* THE BUNDLE ITSELF */}
      <BundlePartnership
        bundle={UNIVERSITY_BUNDLE}
        onRequest={handleRequest}
        showCtas={!isLoggedIn || auth.role === "client"}
      />

      {/* SECONDARY CTA — link to other bundles */}
      <section className="px-4 sm:px-6 py-12 max-w-4xl mx-auto text-center">
        <p className="text-sm text-muted-foreground mb-3">
          {ar
            ? "هل تمثّل فندقًا، متجرًا، شركة ناشئة أو جمعية؟ لدينا باقات شهرية أخرى."
            : fr
              ? "Vous représentez un hôtel, un commerce, une startup ou une association ? D'autres formules mensuelles existent."
              : "Representing a hotel, a store, a startup or an NGO? Other monthly bundles fit you too."}
        </p>
        <Button asChild variant="outline">
          <Link to="/bundles">
            {ar ? "كلّ الباقات" : fr ? "Toutes les formules" : "See all bundles"} <ArrowRight className="ms-2 w-4 h-4" />
          </Link>
        </Button>
      </section>

      <BundleRequestModal
        bundle={UNIVERSITY_BUNDLE}
        initialTierId={tierId}
        open={open}
        onOpenChange={setOpen}
      />

      <SiteFooter />
    </div>
  );
};

export default University;
