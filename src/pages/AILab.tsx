/**
 * /ai — Full landing page for the AI Lab roadmap, expanding the brief
 * "Chapter 4" preview from the About page. The pipeline is intentionally
 * UI-only on this page too: actual generation will run on local Algerian
 * infrastructure under national data-sovereignty rules.
 */
import { Link } from "react-router-dom";
import { useApp } from "@/lib/context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import {
  Brain, Server, Sparkles, ArrowRight, Mic2, Image as ImageIcon, Film, PenTool,
  ShieldCheck, Languages, Cpu, Building2, Users,
} from "lucide-react";

type Trio = { ar: string; fr: string; en: string };
const tx = (t: Trio, lang: string) => (lang === "ar" ? t.ar : lang === "fr" ? t.fr : t.en);

const AI_TOOLS: { Icon: typeof Mic2; title: Trio; body: Trio }[] = [
  {
    Icon: Mic2,
    title: {
      ar: "استنساخ الصوت بالعربية الجزائرية",
      fr: "Clonage vocal en arabe algérien",
      en: "Voice cloning in Algerian Arabic",
    },
    body: {
      ar: "نماذج صوتية تتحدّث الدارجة، الفصحى والفرنسية بنبرات جزائرية. لتعليق صوتي للإعلانات، التعليم، البودكاست — في دقائق بدل أيام.",
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

// Roadmap milestones — gives the page a sense of "what's coming when".
const ROADMAP: { phase: Trio; deliverable: Trio }[] = [
  {
    phase: { ar: "المرحلة 1 — البنية", fr: "Phase 1 — Infrastructure", en: "Phase 1 — Infrastructure" },
    deliverable: {
      ar: "خادم محلّي بمعالج رسومي، نشر نموذج Whisper لنسخ الصوت ونموذج Llama للنصّ.",
      fr: "Serveur local avec GPU, déploiement de Whisper pour la transcription et Llama pour le texte.",
      en: "On-prem GPU server, Whisper deployed for transcription, Llama deployed for text.",
    },
  },
  {
    phase: { ar: "المرحلة 2 — الصوت", fr: "Phase 2 — Voix", en: "Phase 2 — Voice" },
    deliverable: {
      ar: "نموذج تعليق صوتي بالدارجة الجزائرية والعربية الفصحى والفرنسية، يدمج مع خدمة Voice-Over الحالية.",
      fr: "Modèle voix-off en darija, arabe standard et français, intégré au service Voice-Over actuel.",
      en: "Voice-over model in darija, MSA and French, integrated into the existing Voice-Over service.",
    },
  },
  {
    phase: { ar: "المرحلة 3 — المرئيّات", fr: "Phase 3 — Visuels", en: "Phase 3 — Visuals" },
    deliverable: {
      ar: "توليد صور SDXL/FLUX بأنماط جزائرية، توليد ريلز قصير من نصّ — مع مراجعة بشرية قبل التسليم.",
      fr: "Génération SDXL/FLUX aux esthétiques algériennes, Reels courts depuis brief texte — avec relecture humaine.",
      en: "SDXL/FLUX image generation in Algerian aesthetics, short reels from a text brief — with a human review pass.",
    },
  },
  {
    phase: { ar: "المرحلة 4 — التكامل", fr: "Phase 4 — Intégration", en: "Phase 4 — Integration" },
    deliverable: {
      ar: "زرّ \"AI Boost\" داخل لوحة العميل — يُسرِّع التسليم بنسبة 40-60٪ مع الحفاظ على ضمانة الاستوديو.",
      fr: "Bouton \"AI Boost\" dans le portail client — accélère les livraisons de 40-60 % avec la garantie studio.",
      en: "An \"AI Boost\" button inside the client portal — speeds delivery by 40-60% while keeping studio QA.",
    },
  },
];

const AILab = () => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const t = (x: Trio) => tx(x, lang);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-12 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-accent/15 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
            <Brain className="w-3.5 h-3.5" />
            {ar ? "ما القادم في المنصّة" : fr ? "Ce qui arrive dans la plateforme" : "What's coming next on the platform"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-5 leading-tight">
            {ar ? <>مختبر <span className="text-accent">الذكاء الاصطناعي</span> الجزائري</>
              : fr ? <>Le laboratoire <span className="text-accent">IA</span> algérien</>
              : <>The Algerian <span className="text-accent">AI Lab</span></>}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {ar
              ? "في الإصدار القادم نُدمج أدوات الذكاء الاصطناعي مباشرةً في المنصّة. لكن — وهذا هو المفتاح — كلّ شيء يعمل محلّيًا على بنية تحتية جزائرية، لا تُرفع بيانات الزبائن إلى أيّ خدمة أجنبية. هذه ليست قيدًا، بل التزام بالسيادة الرقمية."
              : fr
                ? "Dans la prochaine version, nous intégrons des outils IA directement dans la plateforme. Mais — et c'est crucial — tout tourne localement sur une infrastructure algérienne, sans aucun upload de données client vers un service étranger. Ce n'est pas une limite, c'est un engagement de souveraineté numérique."
                : "In the next release, we're integrating AI tools directly into the platform. But — and this is the point — everything runs locally on Algerian infrastructure, with no client data uploaded to any foreign service. It's not a limitation, it's a digital-sovereignty commitment."}
          </p>
        </div>
      </section>

      {/* SOVEREIGNTY BANNER */}
      <section className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
        <div className="glass rounded-3xl p-5 sm:p-6 border-accent/30 bg-accent/5">
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
      </section>

      {/* AI TOOLS */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            {ar ? "ما الذي تستطيع المنصّة فعله قريبًا" : fr ? "Ce que la plateforme saura bientôt faire" : "What the platform will soon be able to do"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {ar
              ? "أربعة أدوات أساسية — الصوت والصورة والفيديو والكتابة — مدمجة في رحلة العميل القائمة، لا منصّة منفصلة."
              : fr
                ? "Quatre outils fondamentaux — voix, image, vidéo, écriture — intégrés au parcours client existant, pas une plateforme à part."
                : "Four core tools — voice, image, video, writing — woven into the existing client journey, not a separate platform."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
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
      </section>

      {/* WHY THIS APPROACH */}
      <section className="px-4 sm:px-6 py-10 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">
            {ar ? "لماذا هذا النهج تحديدًا؟" : fr ? "Pourquoi cette approche ?" : "Why this specific approach?"}
          </h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              Icon: ShieldCheck,
              ar: { t: "بياناتك تبقى محلّية", d: "كلّ المعالجة على خوادم جزائرية. لا API خارجية، لا تسريب، لا قيود تصدير." },
              fr: { t: "Vos données restent locales", d: "Tout le traitement sur serveurs algériens. Aucune API étrangère, aucune fuite, aucune restriction d'export." },
              en: { t: "Your data stays local", d: "All processing on Algerian servers. No foreign API, no leaks, no export restrictions." },
            },
            {
              Icon: Languages,
              ar: { t: "مدرَّب على ثقافتنا", d: "نماذج تفهم الدارجة والمراجع الجزائرية، ليست نماذج عالمية لا تعرف الولايات." },
              fr: { t: "Formé à notre culture", d: "Des modèles qui comprennent la darija et les références algériennes, pas des modèles génériques qui ignorent les wilayas." },
              en: { t: "Tuned to our culture", d: "Models that understand darija and Algerian references — not generic global models that don't know wilayas." },
            },
            {
              Icon: Users,
              ar: { t: "مع البشر، لا بدلًا منهم", d: "الذكاء الاصطناعي يُسرِّع المسوّدة الأولى. المبدع البشري يصنع التسليم النهائي." },
              fr: { t: "Avec les humains, pas à leur place", d: "L'IA accélère le premier jet. Le créateur humain finalise la livraison." },
              en: { t: "With humans, not instead", d: "AI speeds the first draft. The human creator owns the final delivery." },
            },
          ].map((v, i) => {
            const x = ar ? v.ar : fr ? v.fr : v.en;
            return (
              <div key={i} className="np-hover-lift glass rounded-2xl p-5">
                <div className="w-9 h-9 rounded-lg bg-gradient-gold/20 border border-accent/30 flex items-center justify-center mb-3">
                  <v.Icon className="w-4 h-4 text-accent" />
                </div>
                <div className="font-serif text-base font-bold mb-1.5">{x.t}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{x.d}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="relative px-4 sm:px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-royal/8 pointer-events-none" />
        <div className="relative max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-5">
              <Cpu className="w-3.5 h-3.5" />
              {ar ? "خارطة الطريق" : fr ? "Feuille de route" : "Roadmap"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold leading-tight">
              {ar ? "كيف نصل إلى هذا التكامل" : fr ? "Comment on y arrive" : "How we get there"}
            </h2>
          </div>
          <ol className="space-y-4">
            {ROADMAP.map((r, i) => (
              <li key={i} className="glass rounded-2xl p-5 flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-royal flex items-center justify-center flex-shrink-0 font-serif font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="font-serif font-bold text-base mb-1">{t(r.phase)}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{t(r.deliverable)}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto text-center">
        <div className="glass rounded-3xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
          <Building2 className="w-10 h-10 text-accent mx-auto mb-4" />
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-3">
            {ar
              ? "تريد أن تُجرَّب الإصدار الأوّل أوّلاً؟"
              : fr
                ? "Vous voulez tester la première version en avant-première ?"
                : "Want early access to the first build?"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
            {ar
              ? "نختار شركاء أوائل من الجامعات والعلامات الكبرى لتجريب الأدوات قبل الإطلاق العام. سجّل حسابًا الآن، وسنتواصل معك عند بدء البرنامج."
              : fr
                ? "Nous sélectionnons des partenaires précoces parmi les universités et grandes marques pour tester les outils avant le lancement public. Créez un compte et nous vous contacterons à l'ouverture du programme."
                : "We're picking early partners among universities and large brands to trial the tools before public launch. Create an account and we'll reach out when the program opens."}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="lg">
              <Link to="/auth/signup?role=client">
                {ar ? "ابدأ مع AI Boost" : fr ? "Démarrer avec AI Boost" : "Start with AI Boost"}{" "}
                <ArrowRight className="ms-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">{ar ? "اقرأ القصّة كاملةً" : fr ? "Lire l'histoire complète" : "Read the full story"}</Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
};

export default AILab;
