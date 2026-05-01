/**
 * /innovation — pitch-ready summary of what makes North Pixel Studio
 * structurally different. Designed to be the first link a ministerial
 * reviewer clicks before exploring the platform itself.
 *
 * Trilingual (AR / FR / EN). Read-only. No data fetching, no auth gate.
 */
import { Link } from "react-router-dom";
import { useApp } from "@/lib/context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Lightbulb, GraduationCap, Languages, MapPin, ShieldCheck, Wallet,
  Cloud, Workflow, Trophy, Building2, ArrowRight, Sparkles, Play, Copy,
} from "lucide-react";
import { toast } from "sonner";

type Trio = { ar: string; fr: string; en: string };
type Card = {
  Icon: typeof Lightbulb;
  title: Trio;
  body: Trio;
};

const CARDS: Card[] = [
  {
    Icon: Lightbulb,
    title: {
      ar: "أوّل سوق إبداعي مصمَّم للجزائر",
      fr: "Première marketplace créative native pour l'Algérie",
      en: "First creative marketplace built natively for Algeria",
    },
    body: {
      ar: "Upwork وFiverr وMalt لا تخدم الجزائر — لا تدعم وسائل الدفع المحلية، ولا تتحدث العربية بشكل أصيل، ولا تفهم جغرافية الولايات. North Pixel هي أول منصة تُبنى من الصفر للسوق الجزائري، لا أداة أجنبية مُترجَمة.",
      fr: "Upwork, Fiverr, Malt ne servent pas l'Algérie — ils ne supportent pas le paiement local, n'utilisent pas l'arabe nativement, et ignorent la géographie des wilayas. North Pixel est la première plateforme conçue depuis zéro pour le marché algérien, pas un outil étranger traduit.",
      en: "Upwork, Fiverr, and Malt don't serve Algeria — no local payment rails, no native Arabic, no understanding of wilaya geography. North Pixel is the first platform designed from scratch for the Algerian market, not a foreign tool that's been translated.",
    },
  },
  {
    Icon: GraduationCap,
    title: {
      ar: "باقة الجامعات — خدمة B2B لرقمنة التعليم العالي",
      fr: "Bundle Universités — un B2B aligné sur la digitalisation MESRS",
      en: "University Bundle — structured B2B service for academic digitalization",
    },
    body: {
      ar: "متوافقة مباشرة مع توجيهات وزارة التعليم العالي للرقمنة (بودكاست، أرشفة المحاضرات، تغطية الفعاليات، أفلام ترويجية). ثلاث باقات شهرية (80,000 / 140,000 / 200,000 دج) تتيح للجامعات تخصيص ميزانية للمحتوى الإبداعي مثل ما تخصصه لخدمات تقنية المعلومات.",
      fr: "Directement alignée avec le mandat de digitalisation du MESRS (podcasts, archivage de cours, couverture d'événements, films promotionnels). Trois paliers mensuels (80 000 / 140 000 / 200 000 DA) permettent aux universités de budgétiser le contenu créatif comme un service IT.",
      en: "Directly aligned with the MESRS digitalization mandate — podcasts, lecture archival, event coverage, promotional films. Three monthly tiers (80,000 / 140,000 / 200,000 DA) let universities budget for creative content the way they budget for IT services.",
    },
  },
  {
    Icon: Languages,
    title: {
      ar: "تجربة ثلاثية اللغة — العربية أوّلًا مع تدفق RTL كامل",
      fr: "Expérience trilingue — l'arabe en premier, RTL complet",
      en: "Trilingual Arabic-first experience with full RTL",
    },
    body: {
      ar: "معظم التكنولوجيا الجزائرية تُبنى بالفرنسية أوّلًا ثم تُلحَق بها العربية. North Pixel تبنى عربيةً وفرنسيةً وإنجليزيةً جنبًا إلى جنب، مع واجهات RTL تعكس اللغة لا تترجمها فقط. الواجهة العربية من الدرجة الأولى — وهذا نادر في التكنولوجيا الجزائرية.",
      fr: "La plupart de la tech algérienne est construite en français d'abord, l'arabe ajouté ensuite. North Pixel est conçu en arabe / français / anglais en parallèle, avec des flux RTL qui reflètent la langue — pas juste des chaînes traduites. L'interface arabe est de premier rang.",
      en: "Most Algerian tech is built French-first with Arabic tacked on. North Pixel was built in Arabic / French / English in lockstep, with RTL flows that mirror the language — not just translated strings. The Arabic UI is first-class, not a second-rate clone.",
    },
  },
  {
    Icon: MapPin,
    title: {
      ar: "محرّك مطابقة قائم على الولاية",
      fr: "Moteur de matching basé sur la wilaya",
      en: "Wilaya-aware matching engine",
    },
    body: {
      ar: "الولايات الـ 58 مُدمجة في نموذج البيانات. يُطابق المبدعون والعملاء ليس فقط بالمهارة والسعر بل بالموقع الجغرافي — أمر بالغ الأهمية لتصوير الفعاليات، الأعراس، العقارات، فعاليات الجامعات. منصات أجنبية لا تستطيع فعل ذلك.",
      fr: "Les 58 wilayas sont intégrées au modèle de données. Créateurs et clients sont matchés non seulement par compétence et prix, mais par localité physique — essentiel pour les événements, mariages, immobilier, événements universitaires. Les marketplaces étrangères en sont incapables.",
      en: "All 58 wilayas built into the data model. Creators and clients are matched not just by skill and price but by physical locality — critical for event photography, weddings, real-estate shoots, university events. Foreign marketplaces can't do this.",
    },
  },
  {
    Icon: ShieldCheck,
    title: {
      ar: "طبقة ثقة مُنظَّمة من الإدارة — لا تسجيل آلي أعمى",
      fr: "Couche de confiance curée par l'admin — pas d'inscription automatique",
      en: "Admin-curated trust layer — not blind automated onboarding",
    },
    body: {
      ar: "كلّ مبدع تُراجع ملفّه الإدارة قبل ظهوره. كلّ مشروع يُعتمَد قبل أن يُقدِّم المبدعون عروضهم. هذا النهج الهجين بشري + برمجي مُصمَّم للسوق الذي لا تزال الثقة الإلكترونية فيه في طور التشكُّل — يقي من مشكلة الحسابات الوهمية التي تُفسد الصفقات على Instagram.",
      fr: "Chaque créateur est revu par l'admin avant de devenir visible. Chaque offre est approuvée avant de recevoir des soumissions. Cette approche hybride humain + logiciel est conçue pour un marché où la confiance numérique se construit encore — elle empêche le problème des faux profils qui tue les deals sur Instagram.",
      en: "Every creator is reviewed by an admin before going live. Every offer is approved before bids open. This hybrid human + software approach is built for a market where online trust is still forming — it prevents the fake-profile problem that kills deals on Instagram.",
    },
  },
  {
    Icon: Wallet,
    title: {
      ar: "ضمان الدفع داخل المنصّة عبر بريدي موب",
      fr: "Escrow Baridi-Mob, sans processeur étranger",
      en: "On-platform Baridi-Mob escrow, no foreign processor",
    },
    body: {
      ar: "الجزائر لا تملك Stripe ولا PayPal ولا حسابات تجارية Visa/Mastercard متاحة لمؤسس فردي. صمّمنا ضمانًا يدويًا موثوقًا عبر لقطات بريدي موب وتأكيد الإدارة — متوافق تمامًا مع الواقع المصرفي المحلي. ابتكار برمجي تحديدًا لأنه يرفض استيراد حلّ أجنبي.",
      fr: "L'Algérie n'a ni Stripe, ni PayPal, ni comptes commerçants Visa/MC accessibles à un fondateur solo. Nous avons conçu un escrow manuel fiable via captures Baridi-Mob et confirmation admin — totalement conforme à la réalité bancaire locale. Une innovation logicielle précisément parce qu'elle refuse une solution étrangère.",
      en: "Algeria has no Stripe, no PayPal, no Visa/MC merchant accounts available to a solo founder. We designed a manual but reliable escrow using Baridi-Mob screenshots and admin confirmation — fully compliant with local banking reality. A software innovation precisely because it refuses to import a foreign solution.",
    },
  },
  {
    Icon: Cloud,
    title: {
      ar: "بنية إنتاج بصفر تكلفة متكرّرة",
      fr: "Architecture production-grade à coût récurrent zéro",
      en: "Zero-cost production-grade architecture",
    },
    body: {
      ar: "كامل المنصّة — المصادقة، قاعدة البيانات، الصور، الاستضافة، الإشعارات، التحديثات الفورية — تعمل على الطبقات المجانية لـ Firebase وVercel وCloudinary. يمكن للمنصّة استقبال آلاف المستخدمين دون تكلفة بنية تحتية متكرّرة. كل دينار من تمويل الوزارة يذهب إلى الإنتاج، لا إلى فواتير AWS.",
      fr: "Toute la plateforme — auth, base de données, images, hébergement, notifications, temps réel — tourne sur les niveaux gratuits de Firebase, Vercel et Cloudinary. La plateforme peut accueillir des milliers d'utilisateurs sans coût d'infrastructure récurrent. Chaque dinar de subvention va à la production, pas aux factures AWS.",
      en: "The entire platform — auth, database, images, hosting, notifications, real-time updates — runs on free tiers of Firebase, Vercel, and Cloudinary. North Pixel can onboard thousands of users with no recurring infrastructure cost. Every dinar of grant money goes to production, not to AWS bills.",
    },
  },
  {
    Icon: Workflow,
    title: {
      ar: "دورة حياة متكاملة — لا مجرّد لوحة إعلانات",
      fr: "Cycle de vie intégré — pas un simple tableau d'annonces",
      en: "Integrated lifecycle — not just a listing board",
    },
    body: {
      ar: "أغلب المنصّات تتوقّف عند «العميل يجد المبدع». North Pixel تدير الدورة كاملة: تسجيل المبدع → التحقّق من الإدارة → نشر المشروع → اعتماده → إدارة العروض → تسليم المُخرَجات → التقييم والسمعة → الإشعارات. نظام عمل كامل، أقرب إلى ERP إبداعي منه إلى لوحة مبوّبة.",
      fr: "La plupart des marketplaces s'arrêtent à « le client trouve le créateur ». North Pixel gère tout le cycle : inscription du créateur → vérification admin → publication du projet → approbation → gestion des soumissions → livraison → notation et réputation → notifications. Un système de workflow complet, plus proche d'un ERP créatif que d'un site de petites annonces.",
      en: "Most marketplaces stop at \"client finds freelancer.\" North Pixel handles the entire lifecycle: creator signup → admin verification → project posting → approval → bid management → deliverable submission → rating & reputation → notifications. A full workflow system, closer to a creative-project ERP than a classifieds site.",
    },
  },
  {
    Icon: Trophy,
    title: {
      ar: "تقدّم مراتب المبدعين — احتفاظ عبر التحفيز",
      fr: "Progression de rangs créateurs — fidélisation par la gamification",
      en: "Creator rank progression — retention through gamification",
    },
    body: {
      ar: "Bronze → Silver → Gold → Platinum → Diamond. كلّ مرتبة تفتح ظهورًا أعلى ومميّزات إضافية. هذا يحافظ على ولاء المبدعين للمنصّة ويحارب الالتفاف (أخذ المبدعين خارج المنصّة لتجنّب العمولة) — ابتكار هيكلي لا مجرّد لمسة واجهة.",
      fr: "Bronze → Silver → Gold → Platinum → Diamond. Chaque rang débloque visibilité et avantages. Cela fidélise les créateurs à la plateforme et combat la désintermédiation (clients qui sortent les créateurs hors-plateforme pour éviter la commission) — une innovation structurelle, pas un gadget UI.",
      en: "Bronze → Silver → Gold → Platinum → Diamond ranks unlock visibility and perks. This keeps creators loyal to the platform and fights disintermediation (clients pulling creators off-platform to avoid the commission) — a structural innovation, not just a UI gimmick.",
    },
  },
];

const Innovation = () => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";

  const tx = <T extends Trio>(t: T) => (ar ? t.ar : fr ? t.fr : t.en);

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
      toast.success(ar ? "✓ نُسخ" : fr ? "✓ Copié" : "✓ Copied");
    } catch {
      toast.error(ar ? "تعذّر النسخ" : fr ? "Échec" : "Copy failed");
    }
  };

  const SUMMARY = {
    ar: "North Pixel Studio هي أوّل سوق إبداعي مُصمَّم بشكل أصيل للجزائر. تجمع بين واجهة عربية أوّلًا ثلاثية اللغات، ومطابقة قائمة على الولاية بين المبدعين والعملاء عبر الـ 58 ولاية، وطبقة ثقة مُنظَّمة من الإدارة تُلغي مشكلة الحسابات الوهمية في المنصّات الأجنبية، ونظام ضمان يدوي عبر بريدي موب يتجاوز غياب معالجي الدفع الدوليين. تُقدّم باقة الجامعات شراكة شهرية مُنظَّمة (80,000–200,000 دج) متوافقة مع توجيهات وزارة التعليم العالي للرقمنة — تغطية فعاليات، أرشفة محاضرات، إنتاج بودكاست — عرض B2B لا تُقدّمه أيّ منصّة أخرى. تعمل المنظومة بالكامل على الطبقات المجانية، ممّا يثبت أنّ بإمكان مؤسس جزائري فردي التوسّع لآلاف المستخدمين بصفر تكلفة متكرّرة، فتغدو المنصّة رافعةً ذات كفاءة رأسمالية لخلق فرص عمل في القطاع الإبداعي وتشغيل الشباب.",
    fr: "North Pixel Studio est la première marketplace créative conçue nativement pour l'Algérie. Elle combine une interface trilingue arabe-en-premier, un matching basé sur la wilaya entre créateurs et clients à travers les 58 provinces, une couche de confiance curée par l'admin qui élimine le problème des faux profils des plateformes étrangères, et un système d'escrow manuel via Baridi-Mob qui contourne l'absence de processeurs de paiement internationaux. Son Bundle Universités fournit un partenariat mensuel structuré (80 000–200 000 DA) aligné avec le mandat de digitalisation du MESRS — couverture d'événements, archivage de cours, production de podcasts — une offre B2B qu'aucune plateforme existante ne propose. L'ensemble du système tourne sur des infrastructures gratuites, prouvant qu'un fondateur algérien solo peut atteindre des milliers d'utilisateurs sans coût récurrent, faisant de la plateforme un levier capital-efficient pour la création d'emplois dans le secteur créatif et l'emploi des jeunes.",
    en: "North Pixel Studio is the first creative marketplace designed natively for Algeria. It combines an Arabic-first trilingual interface, wilaya-aware matching of creators to clients across all 58 provinces, an admin-curated trust layer that eliminates the fake-profile problem of foreign platforms, and a manual Baridi-Mob escrow system that sidesteps the absence of international payment processors. Its University Bundle delivers a structured monthly partnership (80,000–200,000 DA) aligned with the MESRS digitalization mandate — event coverage, lecture archival, podcast production — a B2B offer no existing platform provides. The entire system runs on free-tier infrastructure, proving that a solo Algerian founder can scale to thousands of users with zero recurring cost, making the platform a capital-efficient lever for creative-sector job creation and youth employment.",
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {ar ? "الابتكار" : fr ? "Innovation" : "Innovation"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            {ar
              ? <>ما الذي يجعل <span className="text-accent">North Pixel</span> مختلفة فعلًا؟</>
              : fr
              ? <>Ce qui rend <span className="text-accent">North Pixel</span> vraiment différent</>
              : <>What makes <span className="text-accent">North Pixel</span> genuinely different</>}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {ar
              ? "ليست مجرّد منصّة. تسعة عناصر هيكلية مُصمَّمة للسوق الجزائري — من السيادة الرقمية إلى رقمنة الجامعات، مرورًا بالبنية صفرية التكلفة. كلّ نقطة قابلة للتجربة الآن على الموقع المباشر."
              : fr
              ? "Ce n'est pas qu'une plateforme. Neuf éléments structurels conçus pour le marché algérien — de la souveraineté numérique à la digitalisation universitaire, en passant par une infrastructure à coût zéro. Chaque point est testable dès maintenant sur le site en direct."
              : "Not just a platform. Nine structural elements designed for the Algerian market — from digital sovereignty to academic digitalization to a zero-cost infrastructure. Every point is testable right now on the live site."}
          </p>
        </div>
      </section>

      {/* 9 INNOVATION CARDS */}
      <section className="px-4 sm:px-6 pb-16 max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 gap-5">
          {CARDS.map((c, i) => (
            <article
              key={i}
              className="glass rounded-3xl p-6 sm:p-7 relative overflow-hidden group hover:border-accent/40 transition-smooth"
            >
              <div className="absolute -top-4 -end-4 font-serif text-7xl font-bold text-accent/10 pointer-events-none select-none">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-gold/15 border border-accent/30 flex items-center justify-center mb-4">
                  <c.Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-2 leading-snug">
                  {tx(c.title)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tx(c.body)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* GRANT-READY SUMMARY */}
      <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">
            {ar ? "ملخّص للمراجعة" : fr ? "Résumé synthèse" : "Application-ready summary"}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-3">
            {ar ? "فقرة جاهزة للنسخ في ملفّ الدعم" : fr ? "Paragraphe prêt-à-coller pour le dossier" : "One paragraph, ready to paste into your application"}
          </h2>
        </div>
        <div className="glass rounded-3xl p-6 sm:p-8 relative">
          <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
            {SUMMARY[lang as keyof typeof SUMMARY]}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-3 end-3"
            onClick={() => copy(SUMMARY[lang as keyof typeof SUMMARY])}
          >
            <Copy className="w-3.5 h-3.5" />
            <span className="ms-1.5">{ar ? "نسخ" : fr ? "Copier" : "Copy"}</span>
          </Button>
        </div>
      </section>

      {/* DEMO ACCOUNTS */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">
            {ar ? "جرّب المنصّة" : fr ? "Tester la plateforme" : "Test the platform"}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-3">
            {ar ? "ثلاثة حسابات تجريبية — انقر، سجّل الدخول، استكشف"
              : fr ? "Trois comptes de démo — cliquez, connectez-vous, explorez"
              : "Three demo accounts — click, sign in, explore"}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            {ar ? "كلّ حساب مُحمَّل مسبقًا ببيانات حقيقية لرؤية دورة حياة المشروع كاملة في جلسة واحدة."
              : fr ? "Chaque compte est pré-chargé avec de vraies données pour parcourir tout le cycle d'un projet en une session."
              : "Each account is pre-loaded with real data so you can walk the full project lifecycle in one session."}
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              role: "client",
              icon: Building2,
              email: "client@startupdz.dz",
              password: "StartupDZ2026!",
              ar: "عميل", fr: "Client", en: "Client",
              tip: { ar: "مشروع حيّ + عرض في الانتظار", fr: "Projet en cours + soumission en attente", en: "Live project with a waiting bid" },
            },
            {
              role: "creator",
              icon: Sparkles,
              email: "creator@startupdz.dz",
              password: "StartupDZ2026!",
              ar: "مبدع", fr: "Créateur", en: "Creator",
              tip: { ar: "ملف كامل + عرض على مشروع حقيقي", fr: "Profil complet + soumission active", en: "Complete profile + active bid" },
            },
            {
              role: "admin",
              icon: ShieldCheck,
              email: "rezig@admin.np",
              password: "admin123",
              ar: "إدارة", fr: "Admin", en: "Admin",
              tip: { ar: "لوحة الإدارة الكاملة", fr: "Tableau de bord admin complet", en: "Full backoffice dashboard" },
            },
          ].map((d) => (
            <div key={d.role} className="glass rounded-3xl p-5 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-gold/15 border border-accent/30 flex items-center justify-center">
                  <d.icon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <div className="font-serif text-base font-bold">
                    {ar ? d.ar : fr ? d.fr : d.en}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {ar ? d.tip.ar : fr ? d.tip.fr : d.tip.en}
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => copy(d.email)}
                  className="w-full flex items-center justify-between gap-2 rounded-xl bg-secondary/40 hover:bg-secondary/60 px-3 py-2 transition-smooth"
                  dir="ltr"
                >
                  <span className="font-mono truncate">{d.email}</span>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
                <button
                  onClick={() => copy(d.password)}
                  className="w-full flex items-center justify-between gap-2 rounded-xl bg-secondary/40 hover:bg-secondary/60 px-3 py-2 transition-smooth"
                  dir="ltr"
                >
                  <span className="font-mono truncate">{d.password}</span>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </button>
              </div>
              <Button asChild variant="outline" size="sm" className="mt-3">
                <Link to="/auth/login">
                  <Play className="w-3.5 h-3.5" />
                  <span className="ms-1.5">{ar ? "افتح صفحة الدخول" : fr ? "Ouvrir la connexion" : "Open sign-in"}</span>
                </Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 sm:px-6 py-20">
        <div className="relative max-w-4xl mx-auto text-center glass rounded-3xl p-8 sm:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-royal/10 pointer-events-none" />
          <div className="relative">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
              {ar ? "كلّ ما تقرؤه هنا — قابل للاختبار الآن" : fr ? "Tout ce qui est ici est testable dès maintenant" : "Every point above is testable right now"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              {ar
                ? "هذه ليست عرضًا تقديميًا. هي منصّة حيّة في الإنتاج، مدفوعة بقاعدة بيانات حقيقية، تخدم مستخدمين حقيقيين."
                : fr
                ? "Ce n'est pas un pitch deck. C'est une plateforme live en production, alimentée par une vraie base de données, servant de vrais utilisateurs."
                : "This isn't a pitch deck. It's a live platform in production, backed by a real database, serving real users."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="royal" size="lg">
                <Link to="/">
                  {ar ? "الصفحة الرئيسية" : fr ? "Page d'accueil" : "Home page"}
                  <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/#offers">{ar ? "تصفّح الخدمات" : fr ? "Voir les services" : "Browse services"}</Link>
              </Button>
              <Button asChild variant="gold" size="lg">
                <Link to="/#bundles">{ar ? "الباقات الشهرية" : fr ? "Bundles mensuels" : "Monthly bundles"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default Innovation;
