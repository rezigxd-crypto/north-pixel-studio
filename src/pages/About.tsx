/**
 * /about — pitch-ready "About us" page.
 *
 * Mirrors the standard ministerial-review questions:
 *   1. What problem did you see in the market?
 *   2. How do you fix it?
 *   3. What do you offer?
 *   4. Where are you going?  (AI Lab — UI only, locally-hosted by design)
 *
 * Trilingual (AR / FR / EN). Read-only. No data fetching, no auth gate.
 *
 * The AI Lab section is intentionally UI-only — the actual generation
 * pipeline will run locally on Algerian infrastructure (own LLM stack)
 * to comply with national data-sovereignty rules forbidding the upload
 * of user content to foreign third-party AI services.
 */
import { Link } from "react-router-dom";
import { useApp } from "@/lib/context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, ShieldCheck, Sparkles, Compass, Globe2,
  Wrench, Heart, ArrowRight, Mic2, Image as ImageIcon, Film, PenTool,
  Lock, Server, Brain, Languages, Users, ChevronRight,
} from "lucide-react";

type Trio = { ar: string; fr: string; en: string };
const tx = (t: Trio, lang: string) =>
  lang === "ar" ? t.ar : lang === "fr" ? t.fr : t.en;

/* ────────────────────────────────────────────────────────────────────── */
/*  PROBLEMS — fragmented Algerian creative market                         */
/* ────────────────────────────────────────────────────────────────────── */

const PROBLEMS: { Icon: typeof AlertTriangle; title: Trio; body: Trio }[] = [
  {
    Icon: AlertTriangle,
    title: {
      ar: "السوق متشتّت في رسائل Instagram",
      fr: "Marché fragmenté sur les DM Instagram",
      en: "Market fragmented in Instagram DMs",
    },
    body: {
      ar: "صفقات الإبداع في الجزائر تُعقد في رسائل خاصّة، بلا عقد، بلا ضمان، بلا تقييم. الزبون لا يعرف من أمامه، والمبدع يخشى عدم الدفع.",
      fr: "Les deals créatifs en Algérie se font en DM, sans contrat, sans garantie, sans évaluation. Le client ignore à qui il parle, le créateur craint de ne pas être payé.",
      en: "Creative deals in Algeria happen in DMs — no contract, no guarantee, no review system. Clients don't know who they're talking to, creators fear not getting paid.",
    },
  },
  {
    Icon: Globe2,
    title: {
      ar: "المنصّات الأجنبية لا تخدم الجزائر",
      fr: "Les plateformes étrangères ignorent l'Algérie",
      en: "Foreign platforms ignore Algeria",
    },
    body: {
      ar: "Upwork وFiverr وMalt لا تدعم بريدي موب، لا تتحدث العربية بشكل أصيل، ولا تفهم الولايات. الجزائري يدفع ضريبة لغة وعملة وثقافة لمجرّد العمل.",
      fr: "Upwork, Fiverr, Malt ne supportent pas Baridi-Mob, n'utilisent pas l'arabe nativement, ignorent les wilayas. L'Algérien paie une taxe de langue, de devise et de culture juste pour travailler.",
      en: "Upwork, Fiverr, Malt — none support Baridi-Mob, none speak Arabic natively, none understand wilayas. The Algerian pays a tax in language, currency and culture just to work.",
    },
  },
  {
    Icon: Lock,
    title: {
      ar: "لا توجد بنية ثقة محلّية",
      fr: "Aucune infrastructure de confiance locale",
      en: "No local trust infrastructure",
    },
    body: {
      ar: "لا حسابات مُحقَّق منها، لا تقييمات مُعتمَدة، لا ضمان دفع. المنصّات الأجنبية تستخدم Stripe وPayPal — غير متاحة لمؤسّس جزائري فردي.",
      fr: "Pas de comptes vérifiés, pas d'avis attestés, pas de garantie de paiement. Les plateformes étrangères utilisent Stripe et PayPal — inaccessibles à un fondateur algérien solo.",
      en: "No verified accounts, no certified reviews, no payment guarantee. Foreign platforms run on Stripe and PayPal — neither is accessible to a solo Algerian founder.",
    },
  },
  {
    Icon: Users,
    title: {
      ar: "الجامعات والمؤسّسات بلا حلّ مُنظَّم",
      fr: "Universités et institutions sans solution structurée",
      en: "Universities and institutions with no structured solution",
    },
    body: {
      ar: "تحتاج الجامعات إلى تغطية فعاليات، أرشفة محاضرات، إنتاج بودكاست — لكن لا توجد منصّة B2B تتيح لها التعاقد شهريًا مثل أيّ خدمة تقنية معلومات.",
      fr: "Les universités ont besoin de couvrir des événements, archiver des cours, produire des podcasts — mais aucune plateforme B2B ne leur permet de contracter mensuellement comme un service IT.",
      en: "Universities need event coverage, lecture archival, podcast production — but no B2B platform lets them contract monthly the way they would for IT services.",
    },
  },
];

/* ────────────────────────────────────────────────────────────────────── */
/*  SOLUTIONS — concrete, mappable to PROBLEMS                             */
/* ────────────────────────────────────────────────────────────────────── */

const SOLUTIONS: { Icon: typeof ShieldCheck; title: Trio; body: Trio }[] = [
  {
    Icon: ShieldCheck,
    title: {
      ar: "سوق مُحقَّق ومنظَّم من الإدارة",
      fr: "Marketplace vérifiée et curée par l'admin",
      en: "Verified, admin-curated marketplace",
    },
    body: {
      ar: "كلّ مبدع يُراجَع قبل ظهوره. كلّ مشروع يُعتمَد قبل قبول العروض. لا حسابات وهمية، لا غشّ، لا صفقات على الهامش.",
      fr: "Chaque créateur est revu avant publication. Chaque offre est validée avant ouverture des soumissions. Pas de faux profils, pas d'arnaque, pas de deals parallèles.",
      en: "Every creator is reviewed before going live. Every offer is approved before bids open. No fake profiles, no scams, no side deals.",
    },
  },
  {
    Icon: Compass,
    title: {
      ar: "مطابقة قائمة على الولاية",
      fr: "Matching basé sur la wilaya",
      en: "Wilaya-aware matching",
    },
    body: {
      ar: "الولايات الـ 58 مُدمَجة في المنصّة. مبدع في وهران يُطابَق مع زبون في وهران لتغطية فعالية في وهران — بدلاً من إرسال طاقم من العاصمة بتكلفة مضاعفة.",
      fr: "Les 58 wilayas sont intégrées. Un créateur à Oran est matché avec un client à Oran pour un événement à Oran — au lieu d'envoyer une équipe d'Alger au coût double.",
      en: "All 58 wilayas built in. A creator in Oran is matched to a client in Oran for an event in Oran — instead of dispatching a crew from Algiers at double the cost.",
    },
  },
  {
    Icon: Wrench,
    title: {
      ar: "ضمان دفع عبر بريدي موب",
      fr: "Escrow Baridi-Mob",
      en: "Baridi-Mob escrow",
    },
    body: {
      ar: "العميل يدفع عربونًا 10% مُقدَّمًا، يُحجَز حتى يقبل التسليم. الإدارة تتحقّق من اللقطات يدويًا. متوافق مع الواقع المصرفي الجزائري الذي لا تخدمه Stripe.",
      fr: "Le client verse une avance de 10% bloquée jusqu'à validation de la livraison. L'admin valide manuellement les captures. Conforme à la réalité bancaire algérienne que Stripe ne sert pas.",
      en: "Client pays a 10% advance held until delivery is accepted. The admin manually verifies the screenshots. Compliant with the Algerian banking reality Stripe doesn't serve.",
    },
  },
  {
    Icon: Languages,
    title: {
      ar: "ثلاث لغات، العربية أوّلًا",
      fr: "Trilingue, l'arabe en premier",
      en: "Trilingual, Arabic-first",
    },
    body: {
      ar: "العربية والفرنسية والإنجليزية مبنية جنبًا إلى جنب، مع تدفّق RTL كامل — لا ترجمات لاحقة. الواجهة العربية من الدرجة الأولى — وهذا نادر في التكنولوجيا الجزائرية.",
      fr: "Arabe, français, anglais construits en parallèle avec RTL complet — pas de traductions tardives. Une interface arabe de premier rang, rare dans la tech algérienne.",
      en: "Arabic, French, and English built in lockstep with full RTL — not afterthought translations. A first-class Arabic UI, rare in Algerian tech.",
    },
  },
];

/* ────────────────────────────────────────────────────────────────────── */
/*  WHAT WE OFFER — three tracks                                           */
/* ────────────────────────────────────────────────────────────────────── */

const TRACKS: { Icon: typeof Sparkles; title: Trio; body: Trio; cta: Trio; href: string }[] = [
  {
    Icon: Sparkles,
    title: {
      ar: "السوق العامّ",
      fr: "Marketplace publique",
      en: "Public marketplace",
    },
    body: {
      ar: "تصوير، إخراج، مونتاج، تعليق صوتي، تصميم، فعاليات، بثّ مباشر، تعليم رقمي، خدمات حكومية. الزبون ينشر، المبدع يقدّم عرضًا، الإدارة تضمن.",
      fr: "Photo, réalisation, montage, voix-off, design, événements, live streaming, e-learning, services gouvernementaux. Le client publie, le créateur soumet, l'admin garantit.",
      en: "Photo, directing, editing, voice-over, design, events, live streaming, e-learning, government services. Client posts, creator bids, admin guarantees.",
    },
    cta: { ar: "تصفّح الخدمات", fr: "Voir les services", en: "Browse services" },
    href: "/#offers",
  },
  {
    Icon: ShieldCheck,
    title: {
      ar: "باقات B2B شهرية",
      fr: "Bundles B2B mensuels",
      en: "Monthly B2B bundles",
    },
    body: {
      ar: "الجامعات، الفنادق، المؤسّسات الصغيرة. اشتراك شهري ثابت، تنفيذ من فريق الاستوديو + الحرّيين عند الحاجة. ميزانية واضحة، تسليم منتظم.",
      fr: "Universités, hôtellerie, PME. Abonnement mensuel fixe, exécution par l'équipe studio + freelances en renfort. Budget lisible, livraisons régulières.",
      en: "Universities, hospitality, SMEs. Fixed monthly subscription, executed by the studio team + freelancers as needed. Clear budget, regular deliveries.",
    },
    cta: { ar: "اطّلع على الباقات", fr: "Voir les bundles", en: "View bundles" },
    href: "/#bundles",
  },
  {
    Icon: Heart,
    title: {
      ar: "MovieCollab — مهمّة شهرية مجانية",
      fr: "MovieCollab — quête mensuelle gratuite",
      en: "MovieCollab — free monthly quest",
    },
    body: {
      ar: "كلّ شهر، ندعو مبدعي الجزائر لصنع فيلم قصير معًا. مجانًا. الهدف: أن يُسمَع صوت الفنّان الجزائري، وأن نبني مجتمعًا حقيقيًا حول المنصّة.",
      fr: "Chaque mois, nous appelons les créateurs algériens à faire un court-métrage ensemble. Gratuitement. Le but : faire entendre la voix de l'artiste algérien et bâtir une vraie communauté autour de la plateforme.",
      en: "Every month, we rally Algerian creators to make a short film together. Free. The goal: give the Algerian artist a voice and build a real community around the platform.",
    },
    cta: { ar: "اعرف المزيد", fr: "En savoir plus", en: "Learn more" },
    href: "/quest",
  },
];

/* ────────────────────────────────────────────────────────────────────── */
/*  AI LAB — UI-only roadmap, sovereignty-first                            */
/* ────────────────────────────────────────────────────────────────────── */

const AI_TOOLS: { Icon: typeof Mic2; title: Trio; body: Trio }[] = [
  {
    Icon: Mic2,
    title: {
      ar: "استنساخ الصوت بالعربية الجزائرية",
      fr: "Clonage vocal en arabe algérien",
      en: "Voice cloning in Algerian Arabic",
    },
    body: {
      ar: "نماذج صوتية تتحدث الدارجة، الفصحى والفرنسية بنبرات جزائرية. لتعليق صوتي للإعلانات، التعليم، البودكاست — في دقائق بدل أيام.",
      fr: "Modèles vocaux maîtrisant la darija, l'arabe standard et le français avec accents algériens. Pour voix-off de pubs, e-learning, podcasts — en minutes, plus en jours.",
      en: "Voice models speaking darija, standard Arabic and French with Algerian accents. For ad voice-overs, e-learning, podcasts — in minutes, not days.",
    },
  },
  {
    Icon: ImageIcon,
    title: {
      ar: "توليد الصور لوسائل التواصل",
      fr: "Génération d'images pour réseaux sociaux",
      en: "AI image generation for social media",
    },
    body: {
      ar: "منشورات Instagram وFacebook وLinkedIn بعلامة العميل التجارية. أنماط جزائرية أصيلة، لا مرئيّات عامّة من الإنترنت.",
      fr: "Posts Instagram, Facebook, LinkedIn aux couleurs de la marque cliente. Esthétiques algériennes authentiques, pas de visuels génériques d'internet.",
      en: "Branded Instagram, Facebook, LinkedIn posts. Authentic Algerian aesthetics — not generic stock visuals.",
    },
  },
  {
    Icon: Film,
    title: {
      ar: "توليد الفيديوهات القصيرة",
      fr: "Génération de vidéos courtes",
      en: "Short-video generation",
    },
    body: {
      ar: "ريلز، إعلانات سريعة، عروض ترويجية مولَّدة من نصّ بسيط — ثمّ تُسلَّم لمونتير بشري لإضافة اللمسات الأخيرة. تقنية + إبداع، لا تقنية بدل إبداع.",
      fr: "Reels, pubs courtes, teasers générés depuis un brief texte — puis livrés à un monteur humain pour les finitions. Tech + créativité, pas tech à la place de la créativité.",
      en: "Reels, snap ads, teasers generated from a text brief — then handed to a human editor for finishing. Tech + creativity, not tech instead of creativity.",
    },
  },
  {
    Icon: PenTool,
    title: {
      ar: "كتابة السيناريو والمحتوى",
      fr: "Scénarios et copywriting assistés",
      en: "AI-assisted scripts & copywriting",
    },
    body: {
      ar: "نماذج سيناريو، نسخ إعلانية، أوصاف منتجات بالعربية والفرنسية. مدرَّبة على نسق وثقافة السوق الجزائري.",
      fr: "Modèles de scripts, copies publicitaires, descriptions produits en arabe et français. Entraînés au registre et à la culture du marché algérien.",
      en: "Script templates, ad copy, product descriptions in Arabic and French. Tuned to the register and culture of the Algerian market.",
    },
  },
];

/* ────────────────────────────────────────────────────────────────────── */
/*  Component                                                              */
/* ────────────────────────────────────────────────────────────────────── */

const About = () => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const t = (x: Trio) => tx(x, lang);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
            <Compass className="w-3.5 h-3.5" />
            {ar ? "من نحن" : fr ? "À propos" : "About us"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            {ar ? <>استوديو إبداعي رقمي مصنوع <span className="text-accent">للجزائر</span></>
              : fr ? <>Un studio créatif numérique conçu <span className="text-accent">pour l'Algérie</span></>
              : <>A digital creative studio built <span className="text-accent">for Algeria</span></>}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {ar
              ? "North Pixel Studio هي الواجهة الرقمية لـ The Algerian Studio — منصّة جزائرية تربط المؤسّسات والعلامات والجامعات بأفضل المبدعين في 58 ولاية، بشروط ثقة، وبلغة الجزائريين."
              : fr
              ? "North Pixel Studio est la vitrine numérique de The Algerian Studio — une plateforme algérienne qui connecte institutions, marques et universités aux meilleurs créateurs des 58 wilayas, sous des règles de confiance, dans la langue des Algériens."
              : "North Pixel Studio is the digital arm of The Algerian Studio — an Algerian platform connecting institutions, brands and universities to the best creators across all 58 wilayas, under rules of trust, in the language of Algerians."}
          </p>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="px-4 sm:px-6 pb-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{ar ? "الفصل الأوّل" : fr ? "Chapitre 1" : "Chapter 1"}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3 leading-tight">
            {ar ? "ما الذي رأيناه في السوق؟" : fr ? "Le problème que nous avons vu" : "The problem we saw in the market"}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            {ar
              ? "اقتصاد إبداعي بأكمله يعمل في الظلّ — صفقات في الـ DM، بلا عقد، بلا ضمان، بلا أدوات مصمَّمة للجزائر."
              : fr
              ? "Toute une économie créative dans l'ombre — des deals en DM, sans contrat, sans garantie, sans outils conçus pour l'Algérie."
              : "An entire creative economy operating in the shadows — DM deals, no contracts, no guarantees, no tools designed for Algeria."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROBLEMS.map((p, i) => (
            <article key={i} className="glass rounded-2xl p-5 sm:p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center flex-shrink-0">
                <p.Icon className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-base sm:text-lg mb-1.5">{t(p.title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(p.body)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{ar ? "الفصل الثاني" : fr ? "Chapitre 2" : "Chapter 2"}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3 leading-tight">
            {ar ? "كيف نُصلِح ذلك؟" : fr ? "Comment nous le réparons" : "How we fix it"}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            {ar
              ? "بناء بنية تحتية رقمية للسوق الإبداعي الجزائري — مع ثقة قابلة للقياس، ضمانات مدفوعة، ومحرّك مطابقة يفهم الجغرافيا."
              : fr
              ? "Construire l'infrastructure numérique du marché créatif algérien — avec une confiance mesurable, des garanties payées, un matching qui comprend la géographie."
              : "Building digital infrastructure for the Algerian creative market — with measurable trust, paid guarantees, and a matching engine that understands geography."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {SOLUTIONS.map((s, i) => (
            <article key={i} className="glass rounded-2xl p-5 sm:p-6 flex gap-4 hover:border-accent/40 transition-smooth">
              <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <s.Icon className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-base sm:text-lg mb-1.5">{t(s.title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(s.body)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WHAT WE OFFER */}
      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{ar ? "الفصل الثالث" : fr ? "Chapitre 3" : "Chapter 3"}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3 leading-tight">
            {ar ? "ما الذي نُقدِّمه؟" : fr ? "Ce que nous offrons" : "What we offer"}
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-2xl mx-auto">
            {ar
              ? "ثلاثة مسارات في منصّة واحدة — سوق عامّ مفتوح، باقات شهرية للمؤسّسات، ومجتمع إبداعي مجاني."
              : fr
              ? "Trois pistes sur une seule plateforme — marketplace publique, bundles mensuels pour institutions, et communauté créative gratuite."
              : "Three tracks on one platform — open public marketplace, monthly bundles for institutions, and a free creative community."}
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TRACKS.map((trk, i) => (
            <article key={i} className="glass rounded-3xl p-6 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-gradient-gold/15 border border-accent/30 flex items-center justify-center mb-4">
                <trk.Icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl mb-2 leading-snug">{t(trk.title)}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{t(trk.body)}</p>
              <Button asChild variant="ghost" size="sm" className="mt-4 self-start">
                <Link to={trk.href}>
                  {t(trk.cta)}
                  <ChevronRight className={`w-3.5 h-3.5 ms-1 ${ar ? "rotate-180" : ""}`} />
                </Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      {/* AI LAB — FUTURE */}
      <section className="relative px-4 sm:px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-royal/8 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-5">
              <Brain className="w-3.5 h-3.5" />
              {ar ? "الفصل الرابع — أين نتّجه" : fr ? "Chapitre 4 — Où nous allons" : "Chapter 4 — Where we're going"}
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-4 leading-tight">
              {ar ? <>مختبر <span className="text-accent">الذكاء الاصطناعي</span> الجزائري</>
                : fr ? <>Le laboratoire <span className="text-accent">IA</span> algérien</>
                : <>The Algerian <span className="text-accent">AI Lab</span></>}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {ar
                ? "في الإصدار القادم، نُدمج أدوات الذكاء الاصطناعي مباشرةً في المنصّة. لكن — وهذا هو المفتاح — كلّ شيء يعمل محلّيًا على بنية تحتية جزائرية، لا تُرفع بيانات الزبائن إلى أيّ خدمة أجنبية. هذه ليست قيدًا، بل التزام بالسيادة الرقمية."
                : fr
                ? "Dans la prochaine version, nous intégrons des outils IA directement dans la plateforme. Mais — et c'est crucial — tout tourne localement sur une infrastructure algérienne, sans aucun upload de données client vers un service étranger. Ce n'est pas une limite, c'est un engagement de souveraineté numérique."
                : "In the next release, we're integrating AI tools directly into the platform. But — and this is the point — everything runs locally on Algerian infrastructure, with no client data uploaded to any foreign service. It's not a limitation, it's a digital-sovereignty commitment."}
            </p>
          </div>

          {/* Sovereignty banner */}
          <div className="glass rounded-3xl p-5 sm:p-6 mb-8 border-accent/30 bg-accent/5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0">
                <Server className="w-5 h-5 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-base sm:text-lg mb-1.5">
                  {ar ? "السيادة الرقمية أوّلًا" : fr ? "Souveraineté numérique d'abord" : "Digital sovereignty first"}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ar
                    ? "القانون الجزائري يقيّد رفع محتوى الزبائن إلى تطبيقات خارجية. لذلك نختار أن نُشغِّل نماذج الذكاء الاصطناعي على خوادم محلّية بنماذج مفتوحة المصدر (Llama، Whisper، Stable Diffusion، فلوريّون). الزبون يحتفظ بملكيّة بياناته — والمنصّة تبقى متوافقة مع التشريع الوطني."
                    : fr
                    ? "La loi algérienne restreint l'upload de contenu client vers des apps étrangères. Nous choisissons donc d'exécuter les modèles IA sur des serveurs locaux avec des modèles open-source (Llama, Whisper, Stable Diffusion, FLUX). Le client garde la propriété de ses données — la plateforme reste conforme à la législation nationale."
                    : "Algerian law restricts uploading client content to foreign apps. So we run our AI models on local servers using open-source weights (Llama, Whisper, Stable Diffusion, FLUX). The client retains ownership of their data — the platform stays compliant with national legislation."}
                </p>
              </div>
            </div>
          </div>

          {/* AI tools — disabled cards */}
          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            {AI_TOOLS.map((a, i) => (
              <article
                key={i}
                className="glass rounded-3xl p-6 relative overflow-hidden opacity-90 hover:opacity-100 transition-smooth"
              >
                <span className="absolute top-4 end-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-[10px] uppercase tracking-widest text-accent">
                  <Sparkles className="w-3 h-3" />
                  {ar ? "قريبًا" : fr ? "Bientôt" : "Coming soon"}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-gradient-royal/15 border border-primary/30 flex items-center justify-center mb-4">
                  <a.Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-base sm:text-lg mb-2 leading-snug pe-20">{t(a.title)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(a.body)}</p>
              </article>
            ))}
          </div>

          {/* Mock UI preview block */}
          <div className="glass rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-accent/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
              <span className="ms-3 text-[11px] text-muted-foreground font-mono">
                ai.thealgerianstudio.com — {ar ? "معاينة" : fr ? "aperçu" : "preview"}
              </span>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { Icon: Mic2, l: { ar: "أنشئ تعليقًا صوتيًا", fr: "Générer une voix", en: "Generate voice-over" } },
                { Icon: ImageIcon, l: { ar: "أنشئ منشور Instagram", fr: "Créer un post Instagram", en: "Create Instagram post" } },
                { Icon: Film, l: { ar: "أنشئ ريلز", fr: "Générer un Reel", en: "Generate a Reel" } },
              ].map((m, i) => (
                <button
                  key={i}
                  type="button"
                  disabled
                  className="group relative w-full text-start glass rounded-2xl p-4 cursor-not-allowed border-dashed border-accent/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                      <m.Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{tx(m.l, lang)}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        {ar ? "غير مُفعَّل بعد" : fr ? "Pas encore actif" : "Not active yet"}
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 text-muted-foreground/50 ${ar ? "rotate-180" : ""}`} />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-5 leading-relaxed text-center">
              {ar
                ? "هذه واجهات معاينة. يبدأ التشغيل الفعلي عند تركيب البنية المحلّية لنماذج الذكاء الاصطناعي. التمويل الوزاري يُسرِّع هذه المرحلة."
                : fr
                ? "Ces interfaces sont des aperçus. L'activation réelle démarre une fois l'infrastructure locale des modèles IA en place. Le financement ministériel accélère cette phase."
                : "These are preview interfaces. Actual activation starts once the local AI-model infrastructure is in place. Ministerial funding accelerates this phase."}
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="px-4 sm:px-6 py-16 max-w-3xl mx-auto">
        <div className="glass rounded-3xl p-6 sm:p-8 relative">
          <div className="absolute top-6 end-6 text-6xl font-serif text-accent/20 leading-none select-none pointer-events-none">”</div>
          <div className="relative">
            <p className="text-sm sm:text-base leading-relaxed text-foreground/90 italic">
              {ar
                ? "بنيت North Pixel وحدي لأنّني لم أجد منصّة تخدم المبدع الجزائري كما يستحقّ. كلّ سطر كود، كلّ صفحة، كلّ ولاية، وكلّ دينار في الميزانية الصفرية المتكرّرة — مصمَّم لخدمة الجزائر أوّلًا. هذا ليس مشروعًا تقنيًا فحسب، بل التزام بأن يكون لصوتنا الفنّي أداة من صنع أيدينا."
                : fr
                ? "J'ai construit North Pixel seul parce que je n'ai pas trouvé de plateforme qui serve le créateur algérien à la hauteur. Chaque ligne de code, chaque page, chaque wilaya, et chaque dinar dans le budget récurrent zéro — pensés pour servir l'Algérie d'abord. Ce n'est pas qu'un projet tech : c'est l'engagement que notre voix artistique ait un outil bâti par nos mains."
                : "I built North Pixel alone because I couldn't find a platform that served the Algerian creator the way they deserve. Every line of code, every page, every wilaya, and every dinar in the zero-recurring-cost budget — designed to serve Algeria first. This isn't just a tech project; it's a commitment that our artistic voice deserves a tool built with our own hands."}
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold/20 border border-accent/30 flex items-center justify-center font-serif font-bold text-accent">
                R
              </div>
              <div>
                <div className="font-serif font-bold text-sm">Rezig — {ar ? "المؤسّس" : fr ? "Fondateur" : "Founder"}</div>
                <div className="text-[11px] text-muted-foreground">North Pixel Studio · The Algerian Studio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-20">
        <div className="relative max-w-4xl mx-auto text-center glass rounded-3xl p-8 sm:p-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-royal/10 pointer-events-none" />
          <div className="relative">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4">
              {ar ? "هل تريد رؤية المنصّة في العمل؟" : fr ? "Envie de voir la plateforme en action ?" : "Want to see the platform in action?"}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              {ar
                ? "اقرأ النقاط التسع للابتكار، أو سجّل دخولك بحساب تجريبي وجرّب دورة مشروع كاملة."
                : fr
                ? "Lisez les 9 points d'innovation, ou connectez-vous avec un compte démo pour parcourir un cycle de projet complet."
                : "Read the 9 innovation points, or sign in with a demo account and walk through a full project cycle."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild variant="royal" size="lg">
                <Link to="/innovation">
                  {ar ? "الابتكار" : fr ? "Innovation" : "Innovation"}
                  <ArrowRight className="ms-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="gold" size="lg">
                <Link to="/auth/login">
                  {ar ? "دخول تجريبي" : fr ? "Démo connexion" : "Demo sign-in"}
                </Link>
              </Button>
              <Button asChild variant="glass" size="lg">
                <Link to="/">{ar ? "الصفحة الرئيسية" : fr ? "Accueil" : "Home"}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default About;
