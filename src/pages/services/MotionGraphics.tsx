import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { ArrowRight, Sparkles, Zap, Layers, Play, MonitorPlay, Film } from "lucide-react";

const LOTTIE_DEMOS = [
  { url: "https://assets10.lottiefiles.com/packages/lf20_v1yudlrx.json", label: { ar: "أنيميشن شخصية", en: "Character Animation", fr: "Animation personnage" }, desc: { ar: "حركة ناعمة للشخصيات والمشاهد", en: "Smooth character & scene motion", fr: "Mouvement fluide de personnages" } },
  { url: "https://assets5.lottiefiles.com/packages/lf20_myejiggj.json", label: { ar: "موشن جرافيك نصي", en: "Kinetic Typography", fr: "Typographie cinétique" }, desc: { ar: "نصوص متحركة احترافية للإعلانات", en: "Animated text for ads & titles", fr: "Textes animés pro pour pubs" } },
  { url: "https://assets3.lottiefiles.com/packages/lf20_UJNc2t.json", label: { ar: "أيقونات متحركة", en: "Animated Icons", fr: "Icônes animées" }, desc: { ar: "أيقونات وعناصر UI متحركة", en: "Animated UI icons & elements", fr: "Icônes UI et éléments animés" } },
  { url: "https://assets4.lottiefiles.com/packages/lf20_fcfjwiyb.json", label: { ar: "لوقو أنيميشن", en: "Logo Animation", fr: "Animation de logo" }, desc: { ar: "إحياء شعارك بحركة سينمائية", en: "Bring your logo to life", fr: "Donnez vie à votre logo" } },
  { url: "https://assets9.lottiefiles.com/packages/lf20_oyi9a8al.json", label: { ar: "انفوجرافيك", en: "Infographic Motion", fr: "Infographie animée" }, desc: { ar: "بيانات ومعلومات بشكل مرئي متحرك", en: "Data & info in animated visual form", fr: "Données visuelles animées" } },
  { url: "https://assets6.lottiefiles.com/packages/lf20_ysrn2iwp.json", label: { ar: "تأثيرات بصرية", en: "Visual Effects", fr: "Effets visuels" }, desc: { ar: "جزيئات وتأثيرات بصرية احترافية", en: "Particles & pro VFX elements", fr: "Particules & effets VFX pro" } },
];

const LottieCard = ({ url, label, desc }: { url: string; label: string; desc: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!customElements.get("lottie-player")) {
      const s = document.createElement("script");
      s.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
      s.async = true;
      document.head.appendChild(s);
    }
    if (ref.current) {
      ref.current.innerHTML = `<lottie-player src="${url}" background="transparent" speed="1" loop autoplay style="width:100%;height:180px;"></lottie-player>`;
    }
  }, [url]);
  return (
    <div className="glass rounded-2xl overflow-hidden hover:border-accent/40 transition-smooth">
      <div className="bg-secondary/30 p-2" ref={ref} />
      <div className="p-4">
        <div className="font-semibold text-sm mb-1">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
};

const MotionGraphicsPage = () => {
  const { lang, auth } = useApp();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); document.title = lang === "ar" ? "موشن جرافيك — North Pixel Studio" : "Motion Graphics — North Pixel Studio"; }, [lang]);
  const ctaLink = auth.role === "client" ? "/portal/client" : "/auth/signup?role=client&service=motion";
  const PROCESS_STEPS = lang === "ar"
    ? [{ icon: Layers, t: "الإحاطة الإبداعية", d: "نفهم هويتك البصرية وأهداف المحتوى" }, { icon: Zap, t: "التصميم والحركة", d: "نبني الأصول البصرية ونحركها بدقة وإبداع" }, { icon: MonitorPlay, t: "المراجعة والتعديل", d: "مراجعتان مجانيتان للوصول للنتيجة المثالية" }, { icon: Film, t: "التسليم بجميع الصيغ", d: "MP4، GIF، Lottie JSON — كل ما تحتاجه" }]
    : [{ icon: Layers, t: "Creative Brief", d: "We understand your visual identity and goals" }, { icon: Zap, t: "Design & Motion", d: "We build and animate with precision and creativity" }, { icon: MonitorPlay, t: "Review & Revise", d: "2 free revision rounds until you're fully satisfied" }, { icon: Film, t: "Delivery in All Formats", d: "MP4, GIF, Lottie JSON — whatever you need" }];

  const DELIVERABLES = lang === "ar"
    ? [{ e: "🎬", t: "إعلانات متحركة", d: "15 ث، 30 ث، 60 ث" }, { e: "✍️", t: "نصوص متحركة", d: "لتيك توك وإنستغرام" }, { e: "🔮", t: "لوقو أنيميشن", d: "إحياء شعارك بحركة" }, { e: "📊", t: "انفوجرافيك", d: "بيانات مرئية متحركة" }, { e: "🎭", t: "عروض تقديمية", d: "شرائح وانتقالات سينمائية" }, { e: "🌐", t: "أنيميشن ويب", d: "Lottie JSON للمواقع" }, { e: "📱", t: "ريلز متحركة", d: "9:16 لجميع المنصات" }, { e: "⚡", t: "تأثيرات بصرية", d: "جزيئات وتأثيرات سينمائية" }]
    : [{ e: "🎬", t: "Animated Ads", d: "15s, 30s, 60s formats" }, { e: "✍️", t: "Kinetic Text", d: "For TikTok, IG & YouTube" }, { e: "🔮", t: "Logo Animation", d: "Bring your logo to life" }, { e: "📊", t: "Infographics", d: "Animated data visuals" }, { e: "🎭", t: "Presentations", d: "Cinematic slides & transitions" }, { e: "🌐", t: "Web Animation", d: "Lottie JSON for websites" }, { e: "📱", t: "Animated Reels", d: "9:16 for all platforms" }, { e: "⚡", t: "VFX Elements", d: "Particles & cinematic FX" }];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <section className="pt-28 pb-16 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
          <Sparkles className="w-3.5 h-3.5" />{lang === "ar" ? "خدمة متخصصة" : "Specialized Service"}
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-4">{lang === "ar" ? "موشن جرافيك" : "Motion Graphics"}</h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-8">
          {lang === "ar" ? "نحوّل أفكارك إلى حركة — أنيميشن سينمائي للإعلانات والعروض والسوشيال ميديا. كل مقطع يُصمَّم من الصفر لعلامتك التجارية." : "We turn your ideas into motion — cinematic animation for ads, presentations and social media. Every piece is built from scratch for your brand."}
        </p>
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <Button asChild variant="gold" size="xl"><Link to={ctaLink}>{lang === "ar" ? "اطلب موشن جرافيك الآن" : "Request Motion Graphics"} <ArrowRight className="ms-2 w-4 h-4" /></Link></Button>
          <Button asChild variant="glass" size="lg"><a href="#examples"><Play className="me-2 w-4 h-4" />{lang === "ar" ? "شاهد الأمثلة" : "See Examples"}</a></Button>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
          {[{ k: "48h", v: lang === "ar" ? "وقت التسليم" : "Delivery" }, { k: "2×", v: lang === "ar" ? "مراجعات مجانية" : "Free revisions" }, { k: "4K", v: lang === "ar" ? "جودة التصدير" : "Export quality" }].map((s) => (
            <div key={s.v} className="glass rounded-2xl p-4 text-center"><div className="font-serif text-2xl font-bold text-accent">{s.k}</div><div className="text-xs text-muted-foreground mt-1">{s.v}</div></div>
          ))}
        </div>
      </section>

      <section id="examples" className="px-4 sm:px-6 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-3">{lang === "ar" ? "أمثلة حية — شاهد الحركة" : "Live Examples — See It Move"}</h2>
          <p className="text-muted-foreground text-sm">{lang === "ar" ? "هذه مجرد أمثلة — كل مشروعك يُصمَّم من الصفر." : "These are samples — every project is built from scratch for your brand."}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {LOTTIE_DEMOS.map((d) => <LottieCard key={d.url} url={d.url} label={d.label[lang as keyof typeof d.label] || d.label.en} desc={d.desc[lang as keyof typeof d.desc] || d.desc.en} />)}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center">{lang === "ar" ? "ما نقدمه لك" : "What We Deliver"}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {DELIVERABLES.map((item) => (
            <div key={item.t} className="glass rounded-2xl p-4 hover:border-accent/30 transition-smooth">
              <div className="text-3xl mb-2">{item.e}</div>
              <div className="font-semibold text-sm mb-0.5">{item.t}</div>
              <div className="text-xs text-muted-foreground">{item.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl font-bold mb-8 text-center">{lang === "ar" ? "كيف نعمل" : "Our Process"}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {PROCESS_STEPS.map((p, i) => (
            <div key={i} className="glass rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center flex-shrink-0"><p.icon className="w-5 h-5 text-accent-foreground" /></div>
              <div><div className="font-semibold mb-1">{p.t}</div><div className="text-sm text-muted-foreground">{p.d}</div></div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 sm:px-6 py-16 max-w-3xl mx-auto text-center">
        <div className="glass rounded-3xl p-10 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl" />
          <div className="relative">
            <h2 className="font-serif text-3xl font-bold mb-3">{lang === "ar" ? "جاهز تحرّك قصتك؟" : "Ready to bring your story to life?"}</h2>
            <p className="text-muted-foreground text-sm mb-6">{lang === "ar" ? "ابدأ مشروع موشن جرافيك الآن — نرد خلال 24 ساعة." : "Start your motion graphics project now — we reply within 24 hours."}</p>
            <Button asChild variant="gold" size="xl"><Link to={ctaLink}>{lang === "ar" ? "ابدأ مشروعك الآن" : "Start Your Project"} <ArrowRight className="ms-2 w-4 h-4" /></Link></Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
};

export default MotionGraphicsPage;
