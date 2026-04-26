import { useState } from "react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ALGERIA_WILAYAS } from "@/lib/i18n";
import { useApp } from "@/lib/context";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlowCard } from "@/components/ui/spotlight-card";
import {
  Sparkles, Users, Clapperboard, Mic, Scissors, PenTool, Camera,
  Music, Film, Vote, Calendar as CalendarIcon, Check, ArrowRight, Star,
} from "lucide-react";
import { toast } from "sonner";

const ROLES = [
  { id: "actor", icon: Clapperboard, ar: "ممثل", en: "Actor" },
  { id: "voice-over", icon: Mic, ar: "تعليق صوتي", en: "Voice-over Artist" },
  { id: "editor", icon: Scissors, ar: "مونتير", en: "Editor" },
  { id: "writer", icon: PenTool, ar: "كاتب سيناريو", en: "Screenwriter" },
  { id: "director", icon: Film, ar: "مخرج", en: "Director" },
  { id: "cinematographer", icon: Camera, ar: "مدير تصوير", en: "Cinematographer" },
  { id: "sound", icon: Music, ar: "مهندس صوت", en: "Sound Designer" },
  { id: "other", icon: Sparkles, ar: "أخرى", en: "Other" },
];

const PHASES = [
  {
    icon: Users,
    days: 10,
    ar: { t: "تجميع الفريق", d: "ندعو المبدعين الجزائريين للانضمام: ممثلين، مونتيرين، أصوات، كتّاب." },
    en: { t: "Gather the crew", d: "We call on Algerian creators: actors, editors, voices, writers." },
  },
  {
    icon: Vote,
    days: 1,
    ar: { t: "تصويت على العنوان", d: "نقترح موضوعًا، نوعًا، وعناوين. الجمهور يصوّت على العنوان الذي يريده." },
    en: { t: "Vote on the title", d: "We suggest a theme, genre, and titles. The public votes on the one they want to see." },
  },
  {
    icon: Clapperboard,
    days: 30,
    ar: { t: "الإنتاج", d: "30 يومًا من الكتابة، التصوير، المونتاج وتصميم الصوت — يدًا بيد كفريق واحد." },
    en: { t: "Production", d: "30 days of writing, shooting, editing and sound — shoulder to shoulder as one crew." },
  },
  {
    icon: Star,
    days: 0,
    ar: { t: "العرض والبيع", d: "عرض الفيلم. ثم نبيعه أو نوزّعه — العائد يموّل الجولة القادمة وكلّ من شارك." },
    en: { t: "Premiere & sell", d: "Screen it. Then sell or distribute — proceeds fund the next round and every contributor." },
  },
];

const Quest = () => {
  const { lang, auth } = useApp();
  const ar = lang === "ar";

  const [name, setName] = useState(auth.name || "");
  const [email, setEmail] = useState(auth.email || "");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState(auth.wilaya || "");
  const [roleId, setRoleId] = useState<string>("actor");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim() || !roleId) {
      toast.error(ar ? "املأ الحقول الأساسية." : "Fill the required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await addDoc(collection(db, "questApplications"), {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        wilaya: wilaya.trim(),
        role: roleId,
        bio: bio.trim(),
        portfolio: portfolio.trim(),
        uid: auth.uid || null,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setDone(true);
      toast.success(ar ? "✓ انضممت لطاقم المهمّة!" : "✓ Welcome to the crew!");
    } catch (err: any) {
      toast.error(err?.message || (ar ? "فشل الإرسال." : "Submission failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />

      {/* HERO */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6">
        <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full text-xs uppercase tracking-widest text-accent mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {ar ? "المهمّة الشهرية — مجانًا" : "Free Monthly Quest"}
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold mb-5">
            {ar ? "MovieCollab — اصنع السينما الجزائرية معنا" : "MovieCollab — make Algerian cinema with us"}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-3">
            {ar
              ? "كلّ شهر، نطلق مهمّة مفتوحة لكلّ مبدعي الجزائر. نجمعهم في 10 أيام، ونصنع فيلمًا قصيرًا في 30 يومًا. مجانًا تمامًا — الهدف ليس المال، بل أن نُسمِع صوت الفنان الجزائري."
              : "Every month, we launch an open quest for every Algerian creator. We gather a team in 10 days and make a short film in 30. Completely free — the goal isn't money, it's giving Algerian artists a voice."}
          </p>
          <p className="text-sm text-accent italic max-w-2xl mx-auto mb-8">
            {ar
              ? "«قد لا أكون كبيرًا مثلك… لكن الجمهور يعرف أنّني أفضل.»"
              : "“I might not be as big as you — but the public knows I'm better.”"}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold" size="xl">
              <a href="#join">
                {ar ? "انضمّ لطاقمنا الآن!" : "Join our crew now!"} <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="glass" size="xl">
              <a href="#how">{ar ? "كيف تعمل المهمّة" : "How it works"}</a>
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-10">
            {[
              { k: "40", v: ar ? "يوم" : "Days" },
              { k: "0DA", v: ar ? "تكلفة المشاركة" : "Cost to join" },
              { k: "1", v: ar ? "فيلم/شهر" : "Film / month" },
            ].map((s) => (
              <div key={s.v} className="glass rounded-2xl p-3 text-center">
                <div className="font-serif text-2xl font-bold text-accent">{s.k}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-4 sm:px-6 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{ar ? "الجدول الزمني" : "Timeline"}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3">
            {ar ? "أربعون يومًا. فيلم واحد. فريق واحد." : "Forty days. One film. One crew."}
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {PHASES.map((p, i) => {
            const Icon = p.icon;
            return (
              <GlowCard key={i} variant={i % 2 === 0 ? "gold" : "royal"}>
                <div className="p-5 flex flex-col gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${i % 2 === 0 ? "bg-gradient-gold text-accent-foreground" : "bg-gradient-royal text-primary-foreground"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-serif text-3xl font-bold text-accent">{p.days || "—"}</span>
                    {p.days > 0 && <span className="text-xs text-muted-foreground">{ar ? "يوم" : "days"}</span>}
                  </div>
                  <h3 className="font-semibold">{ar ? p.ar.t : p.en.t}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ar ? p.ar.d : p.en.d}</p>
                </div>
              </GlowCard>
            );
          })}
        </div>
      </section>

      {/* MISSION */}
      <section className="px-4 sm:px-6 py-16 max-w-5xl mx-auto">
        <div className="glass rounded-3xl p-8 sm:p-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <span className="text-xs uppercase tracking-widest text-accent">{ar ? "المهمّة" : "The mission"}</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold mt-3 mb-4 leading-snug">
              {ar
                ? "لكلّ مبدع لم يحظَ بفرصة. لكلّ صوتٍ بقي صامتًا."
                : "For every creator who never got a shot. For every voice that stayed quiet."}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {ar
                ? "نريد جمع المبدعين الذين يحبّون فنّهم — الذين يريدون أن يُروا، يُسمَعوا، ويُعرَفوا. نبدأ مجانًا، ثم نصل إلى التمويل عبر بيع وتوزيع الأفلام. هكذا نجعل السينما الجزائرية كبيرة."
                : "We want to gather the creators who love their craft — who want to be seen, heard, and known. We start for free, then earn funding by selling and distributing the films. That's how we make Algerian cinema great."}
            </p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                ar ? "نوع الفيلم وعنوانه يقترحه الفريق" : "Genre and title proposed by the crew",
                ar ? "الجمهور يصوّت على العنوان النهائي" : "Public votes on the final title",
                ar ? "كلّ من شارك يظهر اسمه على التترات" : "Everyone who joins gets credited",
                ar ? "العائد بعد البيع يُقسَم على المشاركين" : "Sale revenue is shared with contributors",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <div className="glass rounded-2xl p-5 border border-accent/20">
              <div className="text-xs uppercase tracking-widest text-accent">{ar ? "هذا الشهر" : "This month"}</div>
              <div className="font-serif text-2xl font-bold mt-1">
                {ar ? "موضوع: «الجزائر من الداخل»" : "Theme: \"Algeria from within\""}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {ar
                  ? "قصص يومية صادقة من ولاياتنا. تصويت العنوان مفتوح بعد اكتمال الفريق."
                  : "Honest, daily stories from our wilayas. Title vote opens once the crew is full."}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs">
                <CalendarIcon className="w-3.5 h-3.5 text-accent" />
                <span className="text-muted-foreground">
                  {ar ? "بداية المهمّة: مع كلّ شهر جديد" : "Quest starts: every first of the month"}
                </span>
              </div>
            </div>
            <div className="glass rounded-2xl p-5">
              <div className="text-xs text-muted-foreground mb-1">
                {ar ? "أمثلة على الأدوار التي نبحث عنها" : "Roles we're looking for"}
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                {ROLES.slice(0, 7).map((r) => (
                  <span key={r.id} className="text-xs px-2.5 py-1 rounded-full bg-secondary/40 text-foreground border border-border">
                    {ar ? r.ar : r.en}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* JOIN FORM */}
      <section id="join" className="px-4 sm:px-6 py-16 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">{ar ? "انضم الآن" : "Join now"}</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mt-3">
            {ar ? "انضمّ لطاقمنا الآن!" : "Join our crew now!"}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            {ar ? "املأ الاستمارة وسنتواصل معك خلال 48 ساعة." : "Fill the form — we'll reach out within 48h."}
          </p>
        </div>

        {done ? (
          <div className="glass rounded-3xl p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-gradient-gold mx-auto flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-accent-foreground" />
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2">
              {ar ? "أهلًا بك في الطاقم" : "Welcome to the crew"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">
              {ar
                ? "تم استلام طلبك. سنتواصل معك بمجرد افتتاح المهمّة الجديدة."
                : "We've received your application. We'll reach out as soon as the next quest opens."}
            </p>
            <Button asChild variant="royal" className="mt-6">
              <Link to="/">{ar ? "العودة للرئيسية" : "Back home"}</Link>
            </Button>
          </div>
        ) : (
          <div className="glass rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>{ar ? "الاسم الكامل *" : "Full name *"}</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{ar ? "البريد الإلكتروني *" : "Email *"}</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label>{ar ? "رقم الهاتف" : "Phone"}</Label>
                <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+213 XXX XXX XXX" className="mt-1" />
              </div>
              <div>
                <Label>{ar ? "الولاية" : "Wilaya"}</Label>
                <select value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                  className="w-full mt-1 bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">— {ar ? "اختر الولاية" : "Select wilaya"} —</option>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.nameEn}>{ar ? `${w.code}. ${w.name}` : `${w.code}. ${w.nameEn}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label>{ar ? "ما الدور الذي تريد لعبه؟ *" : "Which role do you want to play? *"}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = roleId === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => setRoleId(r.id)}
                      className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border text-xs transition-smooth ${active ? "border-accent bg-accent/10 text-foreground font-medium" : "border-border glass text-muted-foreground hover:border-accent/40"}`}>
                      <Icon className="w-4 h-4" />
                      <span>{ar ? r.ar : r.en}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label>{ar ? "نبذة قصيرة عنك / تجربتك" : "Short bio / experience"}</Label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={1000} className="mt-1"
                placeholder={ar
                  ? "مثال: ممثل مسرحي من قسنطينة، شاركت في 3 إنتاجات قصيرة..."
                  : "e.g. Theatre actor from Constantine, featured in 3 shorts..."} />
            </div>

            <div>
              <Label>{ar ? "روابط أعمالك (اختياري)" : "Portfolio links (optional)"}</Label>
              <Input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://instagram.com/..., https://youtube.com/..." className="mt-1" />
            </div>

            <Button variant="gold" size="lg" className="w-full" onClick={submit} disabled={submitting}>
              {submitting
                ? "..."
                : <>{ar ? "أرسل طلب الانضمام" : "Submit my application"} <ArrowRight className="ms-2 w-4 h-4" /></>}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              {ar
                ? "بإرسال هذا الطلب، أنت توافق على الانضمام إلى مجتمع المبدعين الجزائريين والعمل التعاوني الحرّ."
                : "By applying, you agree to join the Algerian creators community and free collaborative work."}
            </p>
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
};

export default Quest;
