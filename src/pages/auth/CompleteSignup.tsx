import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";
import { ALGERIA_WILAYAS } from "@/lib/i18n";

type LocState = {
  role?: "client" | "creator";
  email?: string;
  name?: string;
};

const strongPassword = (p: string) => {
  if (p.length < 8) return "كلمة مرور قصيرة — 8 أحرف على الأقل.";
  if (!/[A-Z]/.test(p)) return "يجب أن تحتوي على حرف كبير (A-Z).";
  if (!/[0-9]/.test(p)) return "يجب أن تحتوي على رقم (0-9).";
  return null;
};

const CompleteSignup = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const state = (loc.state || {}) as LocState;
  const { auth, completeGoogleSignup, lang, logout } = useApp();

  const [name, setName] = useState(state.name || auth.name || "");
  const [wilaya, setWilaya] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const role: "client" | "creator" = state.role || "client";
  const email = state.email || auth.email;

  // If the user isn't authenticated (hit this URL directly), redirect.
  useEffect(() => {
    if (!auth.loading && !auth.uid) navigate("/auth/signup", { replace: true });
  }, [auth.loading, auth.uid, navigate]);

  const wilayaName = (w: typeof ALGERIA_WILAYAS[number]) =>
    lang === "ar" ? `${w.code}. ${w.name}` : `${w.code}. ${w.nameEn}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) { toast.error("من فضلك أدخل اسمك."); return; }
    if (!wilaya) { toast.error("اختر ولايتك."); return; }
    const err = strongPassword(password);
    if (err) { toast.error(err); return; }
    if (password !== confirm) { toast.error("كلمتا المرور غير متطابقتين."); return; }

    setLoading(true);
    try {
      await completeGoogleSignup({ role, name: name.trim(), password, wilaya });
      toast.success("✓ تم إكمال التسجيل");
      navigate(role === "creator" ? "/auth/pending" : "/portal/client", { state: { email, name } });
    } catch {
      toast.error("فشل إكمال التسجيل. حاول مرة أخرى.");
    } finally { setLoading(false); }
  };

  const cancel = async () => {
    await logout();
    navigate("/auth/signup");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 pt-28 pb-12 max-w-xl mx-auto w-full">
        <div className="glass rounded-3xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-royal p-8">
            <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80">
              {role === "creator" ? "حساب عامل حر" : "حساب عميل"}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mt-2">
              خطوة أخيرة قبل الانطلاق
            </h1>
            <p className="text-primary-foreground/90 text-sm mt-3 flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>لا نحب أعمال الأوراق أيضًا، هذا لن يطول.</span>
            </p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-5">
            <div>
              <Label>البريد الإلكتروني</Label>
              <Input value={email} readOnly disabled className="mt-1 bg-secondary/30" />
              <p className="text-xs text-muted-foreground mt-1">هذا هو بريدك في حسابك معنا.</p>
            </div>

            <div>
              <Label htmlFor="name">الاسم الكامل *</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">استخدمنا اسمك من جوجل — يمكنك تعديله.</p>
            </div>

            <div>
              <Label htmlFor="wilaya">الولاية *</Label>
              <div className="relative mt-1">
                <select id="wilaya" value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-ring" required>
                  <option value="">— اختر الولاية —</option>
                  {ALGERIA_WILAYAS.map((w) => <option key={w.code} value={w.nameEn}>{wilayaName(w)}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="password">اختر كلمة مرور قوية *</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" minLength={8} required />
              <p className="text-xs text-muted-foreground mt-1">
                8 أحرف على الأقل، مع حرف كبير (A-Z) ورقم (0-9).
              </p>
            </div>

            <div>
              <Label htmlFor="confirm">تأكيد كلمة المرور *</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1" minLength={8} required />
            </div>

            <div className="glass rounded-xl p-3 text-xs text-muted-foreground">
              كلمة المرور هذه تتيح لك الدخول لاحقًا بالبريد الإلكتروني أيضًا، وليس فقط عبر جوجل.
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={cancel} disabled={loading}>
                إلغاء
              </Button>
              <Button type="submit" variant="royal" size="lg" className="flex-1" disabled={loading}>
                {loading ? "..." : "إكمال التسجيل"}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              <Link to="/" className="text-accent">العودة إلى الصفحة الرئيسية</Link>
            </p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default CompleteSignup;
