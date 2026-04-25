import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_TYPES } from "@/lib/offers";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
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

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100).regex(/[A-Z]/, "كلمة المرور يجب أن تحتوي على حرف كبير").regex(/[0-9]/, "كلمة المرور يجب أن تحتوي على رقم"),
  org: z.string().trim().max(100),
  type: z.string().min(1, "اختر نوع حسابك"),
  wilaya: z.string().min(1, "اختر ولايتك"),
  about: z.string().trim().max(500),
});

const ClientSignup = () => {
  const navigate = useNavigate();
  const { t, lang, registerClient, loginWithGoogle } = useApp();
  const [type, setType] = useState<string>("");
  const [wilaya, setWilaya] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleGoogle = async () => {
    if (!agreed) { toast.error(t("termsRequired")); return; }
    setGLoading(true);
    try {
      const res = await loginWithGoogle("client");
      if (res.status === "new") {
        toast.info("خطوة أخيرة لإكمال تسجيلك");
        navigate("/auth/signup/complete", { state: { role: "client", email: res.email, name: res.name } });
      } else {
        navigate("/portal/client");
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
      org: String(f.get("org") || ""),
      type, wilaya,
      about: String(f.get("about") || ""),
    };
    const r = schema.safeParse(data);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    setLoading(true);
    try {
      await registerClient(r.data.email, r.data.password, r.data.fullName, r.data.wilaya);
      toast.success("✓ " + t("createClientAccount"));
      navigate("/portal/client");
    } catch (err: any) {
      toast.error(err?.code === "auth/email-already-in-use" ? "هذا البريد الإلكتروني مسجل مسبقًا." : "فشل التسجيل. حاول مرة أخرى.");
    } finally { setLoading(false); }
  };

  const clientTypeLabel = (c: typeof CLIENT_TYPES[number]) => {
    if (lang === "ar") return c.labelAr;
    if (lang === "fr") return c.labelFr;
    return c.label;
  };

  const wilayaName = (w: typeof ALGERIA_WILAYAS[number]) =>
    lang === "ar" ? `${w.code}. ${w.name}` : `${w.code}. ${w.nameEn}`;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 pt-28 pb-12 max-w-3xl mx-auto w-full">
        <div className="glass rounded-3xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-royal p-8">
            <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80">{t("clientAccount")}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mt-2">{t("tellUs")}</h1>
            <p className="text-primary-foreground/80 text-sm mt-2">{t("matchTeam")}</p>
            {lang === "ar" && (
              <p className="text-primary-foreground/75 text-xs mt-3 italic">لا نحب أعمال الأوراق أيضًا، هذا لن يطول.</p>
            )}
          </div>

          <div className="p-8 space-y-6">
            {/* Google signup */}
            <Button type="button" variant="outline" className="w-full flex items-center gap-3 h-11"
              onClick={handleGoogle} disabled={gLoading}>
              <GoogleIcon />
              <span>{gLoading ? "..." : t("signInWithGoogle")}</span>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">{t("orContinueWith")}</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <Label className="mb-3 block">{t("iRepresent")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {CLIENT_TYPES.map((c) => {
                    const Icon = (Icons as any)[c.icon] ?? Icons.Sparkles;
                    const active = type === c.value;
                    return (
                      <button key={c.value} type="button" onClick={() => setType(c.value)}
                        className={`p-4 rounded-2xl border text-left transition-smooth ${active ? "border-accent bg-accent/10" : "border-border bg-secondary/40 hover:border-accent/40"}`}>
                        <Icon className={`w-5 h-5 mb-2 ${active ? "text-accent" : "text-muted-foreground"}`} />
                        <div className="text-xs font-medium">{clientTypeLabel(c)}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="fullName">{t("fullName")}</Label><Input id="fullName" name="fullName" required maxLength={100} /></div>
                <div><Label htmlFor="org">{t("organization")}</Label><Input id="org" name="org" maxLength={100} /></div>
                <div><Label htmlFor="email">{t("email")}</Label><Input id="email" name="email" type="email" required /></div>
                <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder="Aa1••••••" />
                <p className="text-xs text-muted-foreground mt-1">
                  {lang === "ar" ? "8 أحرف على الأقل، حرف كبير، ورقم — لا نحب أعمال الأوراق أيضًا، هذا لن يطول 😄" : "8+ chars, uppercase & number — we hate paperwork too, this won't take long 😄"}
                </p>
              </div>
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

              <div><Label htmlFor="about">{t("lookingFor")}</Label><Textarea id="about" name="about" maxLength={500} rows={3} placeholder={lang === "ar" ? "مثال: أريد إعلانًا سينمائيًا لمنتجي، وبودكاست لعلامتي التجارية..." : "e.g. I need a cinematic ad for my product and a podcast series..."} /></div>

              <TermsModal agreed={agreed} onChange={setAgreed} />

              <Button type="submit" variant="royal" size="lg" className="w-full" disabled={loading}>
                {loading ? "..." : t("createClientAccount")}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {t("areYouCreator")} <Link to="/auth/signup/creator" className="text-accent">{t("applyHere")}</Link>
              </p>
            </form>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ClientSignup;
