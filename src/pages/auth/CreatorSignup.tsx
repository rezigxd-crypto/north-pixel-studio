import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CREATOR_ROLES } from "@/lib/offers";
import { addCreator } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, X, ChevronDown } from "lucide-react";
import { useApp } from "@/lib/context";
import { ALGERIA_WILAYAS } from "@/lib/i18n";
import { TermsModal } from "@/components/TermsModal";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const buildSchema = (t: (k: any) => string) => z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100).regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير").regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم"),
  wilaya: z.string().min(1, "اختر ولايتك"),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  role: z.string().min(1, "اختر تخصصك"),
  phone: z.string().trim().min(1, t("phoneRequired")).refine((v) => v.replace(/\D/g, "").length >= 8, { message: t("phoneInvalid") }),
  bio: z.string().trim().min(20, "أخبرنا أكثر (20 حرف على الأقل)").max(500),
  rate: z.coerce.number().min(1, "حدد أجرك بالساعة").max(1000000),
});

const CreatorSignup = () => {
  const navigate = useNavigate();
  const { t, lang, registerCreator, loginWithGoogle } = useApp();
  const [role, setRole] = useState<string>("");
  const [portfolio, setPortfolio] = useState<string[]>([""]);
  const [wilaya, setWilaya] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const updateLink = (i: number, v: string) => setPortfolio((p) => p.map((x, idx) => idx === i ? v : x));
  const addLink = () => setPortfolio((p) => [...p, ""]);
  const removeLink = (i: number) => setPortfolio((p) => p.filter((_, idx) => idx !== i));

  const handleGoogle = async () => {
    if (!agreed) { toast.error(t("termsRequired")); return; }
    setGLoading(true);
    try {
      const res = await loginWithGoogle("creator");
      if (res.status === "new") {
        toast.info("خطوة أخيرة لإكمال تسجيلك");
        navigate("/auth/signup/complete", { state: { role: "creator", email: res.email, name: res.name } });
      } else {
        navigate("/auth/pending", { state: { email: res.role === "creator" ? "" : "", name: "" } });
      }
    } catch { toast.error("فشل التسجيل بجوجل."); }
    finally { setGLoading(false); }
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed) { toast.error(t("termsRequired")); return; }
    const f = new FormData(e.currentTarget);
    const data = {
      fullName: String(f.get("fullName") || ""),
      email: String(f.get("email") || ""),
      password: String(f.get("password") || ""),
      wilaya, city: String(f.get("city") || ""),
      role, bio: String(f.get("bio") || ""), rate: f.get("rate"),
      phone: String(f.get("phone") || ""),
    };
    const r = buildSchema(t).safeParse(data);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    const validLinks = portfolio.map((l) => l.trim()).filter(Boolean);
    if (validLinks.length === 0) { toast.error("أضف رابط واحد على الأقل لأعمالك."); return; }
    setLoading(true);
    try {
      await registerCreator(r.data.email, r.data.password, r.data.fullName, r.data.wilaya, r.data.phone);
      await addCreator({
        fullName: r.data.fullName, email: r.data.email, country: "Algeria",
        wilaya: r.data.wilaya, city: r.data.city || undefined,
        role: r.data.role, bio: r.data.bio, rate: r.data.rate, portfolio: validLinks,
      });
      navigate("/auth/pending", { state: { email: r.data.email, name: r.data.fullName } });
    } catch (err: any) {
      toast.error(err?.code === "auth/email-already-in-use" ? "هذا البريد الإلكتروني مسجل مسبقًا." : "فشل التسجيل. حاول مرة أخرى.");
    } finally { setLoading(false); }
  };

  const wilayaName = (w: typeof ALGERIA_WILAYAS[number]) =>
    lang === "ar" ? `${w.code}. ${w.name}` : `${w.code}. ${w.nameEn}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 pt-28 pb-12 max-w-3xl mx-auto w-full">
        <div className="glass rounded-3xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-gold p-8">
            <span className="text-xs uppercase tracking-[0.3em] text-accent-foreground/80">{t("creatorNetwork")}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-accent-foreground mt-2">{t("buildProfile")}</h1>
            <p className="text-accent-foreground/80 text-sm mt-2">{t("portfolioMandatory")}</p>
            {lang === "ar" && (
              <p className="text-accent-foreground/75 text-xs mt-3 italic">لا نحب أعمال الأوراق أيضًا، هذا لن يطول.</p>
            )}
          </div>

          <div className="p-8 space-y-6">
            <Button type="button" variant="outline" className="w-full flex items-center gap-3 h-11"
              onClick={handleGoogle} disabled={gLoading}>
              <GoogleIcon /><span>{gLoading ? "..." : t("signInWithGoogle")}</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t("orContinueWith")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="fullName">{t("fullName")}</Label><Input id="fullName" name="fullName" required maxLength={100} /></div>
                <div><Label htmlFor="email">{t("email")}</Label><Input id="email" name="email" type="email" required /></div>
                <div><Label htmlFor="password">{t("password")}</Label><Input id="password" name="password" type="password" required minLength={8} /></div>
                <div><Label htmlFor="rate">{t("hourlyRate")}</Label><Input id="rate" name="rate" type="number" min={1} required /></div>
                <div className="md:col-span-2"><Label htmlFor="phone">{t("phone")}</Label><Input id="phone" name="phone" type="tel" required maxLength={20} placeholder={t("phonePlaceholder")} dir="ltr" /></div>
              </div>

              <div>
                <Label htmlFor="wilaya">{t("wilaya")}</Label>
                <div className="relative mt-1">
                  <select id="wilaya" value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                    className="w-full appearance-none bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-ring" required>
                    <option value="">— {t("wilaya")} —</option>
                    {ALGERIA_WILAYAS.map((w) => <option key={w.code} value={w.nameEn}>{wilayaName(w)}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div><Label htmlFor="city">{t("city")}</Label><Input id="city" name="city" /></div>

              <div>
                <Label className="mb-3 block">{t("speciality")}</Label>
                <div className="flex flex-wrap gap-2">
                  {CREATOR_ROLES.map((r) => (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`px-4 py-2 rounded-full text-sm border transition-smooth ${role === r ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/40"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div><Label htmlFor="bio">{t("shortBio")}</Label>
                <Textarea id="bio" name="bio" required maxLength={500} rows={3} placeholder={lang === "ar" ? "3 سنوات في تصوير الإعلانات عبر الجزائر..." : "3 years shooting commercials across Algeria…"} />
              </div>

              <div>
                <Label className="mb-2 block">{t("portfolioLinks")}</Label>
                <div className="space-y-2">
                  {portfolio.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={link} onChange={(e) => updateLink(i, e.target.value)} placeholder="https://vimeo.com/your-reel" type="url" />
                      {portfolio.length > 1 && <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}><X className="w-4 h-4" /></Button>}
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="w-4 h-4" /> {t("addAnotherLink")}</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{t("portfolioDrop")}</p>
              </div>

              <TermsModal agreed={agreed} onChange={setAgreed} />

              <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
                {loading ? "..." : t("submitApplication")}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("areYouClient")} <Link to="/auth/signup/client" className="text-accent">{t("openClient")}</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default CreatorSignup;
