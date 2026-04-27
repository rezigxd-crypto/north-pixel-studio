import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const { t, lang, loginWithEmail, loginWithGoogle, resetPassword } = useApp();
  const [tab, setTab] = useState<"client" | "creator">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const isAdminMode = adminClicks >= 3;

  const navigateByRole = (role: string | null) => {
    // `replace: true` removes /auth/login from the history stack so the
    // native back button doesn't land the user back on the login screen
    // (which feels like an accidental logout).
    if (role === "admin") navigate("/portal/admin", { replace: true });
    else if (role === "creator") navigate("/portal/creator", { replace: true });
    else navigate("/portal/client", { replace: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = await loginWithEmail(email, password);
      toast.success(t("welcomeBack"));
      navigateByRole(role);
    } catch (err: any) {
      const c = err?.code;
      const wrongCred = c === "auth/invalid-credential" || c === "auth/wrong-password";
      const noUser = c === "auth/user-not-found";
      const msg = lang === "ar"
        ? (wrongCred ? "كلمة مرور أو بريد إلكتروني خاطئ." : noUser ? "لا يوجد حساب بهذا البريد." : "فشل تسجيل الدخول.")
        : lang === "fr"
        ? (wrongCred ? "E-mail ou mot de passe incorrect." : noUser ? "Aucun compte avec cet e-mail." : "Échec de la connexion.")
        : (wrongCred ? "Wrong email or password." : noUser ? "No account with this email." : "Login failed.");
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await loginWithGoogle(tab);
      if (res.status === "new") {
        toast.info(lang === "ar" ? "خطوة أخيرة لإكمال تسجيلك" : lang === "fr" ? "Une dernière étape pour terminer l'inscription" : "One last step to finish signing up");
        navigate("/auth/signup/complete", { state: { role: tab, email: res.email, name: res.name }, replace: true });
      } else {
        toast.success(t("welcomeBack"));
        navigateByRole(res.role);
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") toast.error(lang === "ar" ? "فشل تسجيل الدخول بجوجل." : lang === "fr" ? "Échec de la connexion Google." : "Google sign-in failed.");
    } finally { setGoogleLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error(lang === "ar" ? "أدخل بريدك الإلكتروني أولًا." : lang === "fr" ? "Entrez d'abord votre e-mail." : "Enter your email first.");
      return;
    }
    try {
      await resetPassword(email);
      toast.success(lang === "ar" ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني." : lang === "fr" ? "Lien de réinitialisation envoyé à votre e-mail." : "Reset link sent to your email.");
      setShowReset(false);
    } catch {
      toast.error(lang === "ar" ? "فشل الإرسال. تأكد من البريد الإلكتروني." : lang === "fr" ? "Échec de l'envoi. Vérifiez l'e-mail." : "Could not send. Check the email address.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-md glass rounded-3xl p-8 animate-fade-in">
          <h1 className="font-serif text-3xl font-bold mb-2 cursor-default select-none" onClick={() => setAdminClicks(c => c + 1)}>
            {t("welcomeBack")}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">{t("loginSub")}</p>

          {!isAdminMode && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary/60 rounded-full mb-6 text-xs">
              {(["client", "creator"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setTab(r)}
                  className={`py-2 rounded-full transition-smooth ${tab === r ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground"}`}>
                  {r === "client"
                    ? (lang === "ar" ? "أنا زبون" : lang === "fr" ? "Je suis client" : "I'm a client")
                    : (lang === "ar" ? "أنا عامل حر" : lang === "fr" ? "Je suis freelance" : "I'm a freelancer")}
                </button>
              ))}
            </div>
          )}

          {isAdminMode && <div className="glass rounded-xl p-3 mb-4 text-xs border border-destructive/30 text-destructive">🔐 {lang === "ar" ? "وضع المشرف" : lang === "fr" ? "Mode administrateur" : "Admin mode"}</div>}

          {!isAdminMode && (
            <>
              <Button type="button" variant="outline" className="w-full flex items-center gap-3 mb-4 h-11" onClick={handleGoogle} disabled={googleLoading}>
                <GoogleIcon /><span>{googleLoading ? "..." : t("signInWithGoogle")}</span>
              </Button>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">{t("orContinueWith")}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            </>
          )}

          {!showReset ? (
            <form onSubmit={submit} className="space-y-4">
              <div><Label>{t("email")}</Label>
                <Input type="text" required placeholder={isAdminMode ? "rezig@admin.np" : "you@example.com"} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div><Label>{t("password")}</Label>
                <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <button type="button" onClick={() => setShowReset(true)} className="text-xs text-accent hover:underline">
                {lang === "ar" ? "نسيت كلمة المرور؟" : lang === "fr" ? "Mot de passe oublié ?" : "Forgot password?"}
              </button>
              <Button type="submit" variant="royal" className="w-full" size="lg" disabled={loading}>
                {loading ? "..." : t("login")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-muted-foreground">{lang === "ar" ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور." : lang === "fr" ? "Saisissez votre e-mail et nous vous enverrons un lien de réinitialisation." : "Enter your email and we'll send you a reset link."}</p>
              <div><Label>{t("email")}</Label>
                <Input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" variant="royal" className="w-full">{lang === "ar" ? "إرسال رابط إعادة التعيين" : lang === "fr" ? "Envoyer le lien" : "Send reset link"}</Button>
              <button type="button" onClick={() => setShowReset(false)} className="text-xs text-muted-foreground hover:text-accent w-full text-center">{t("back")}</button>
            </form>
          )}

          <p className="text-sm text-center text-muted-foreground mt-6">
            {t("newHere")} <Link to="/auth/signup" className="text-accent font-medium">{t("createAccount")}</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Login;
