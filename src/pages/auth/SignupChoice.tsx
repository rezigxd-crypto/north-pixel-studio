import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Briefcase, Camera, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/context";

const SignupChoice = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t, lang } = useApp();
  const presetRole = params.get("role");
  if (presetRole === "client") navigate("/auth/signup/client", { replace: true });
  if (presetRole === "creator") navigate("/auth/signup/creator", { replace: true });

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 pt-28 pb-12 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12 animate-fade-in">
          <span className="text-xs uppercase tracking-[0.3em] text-accent">North Pixel Studio</span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold mt-3">
            {lang === "ar" ? "من أنت؟" : lang === "fr" ? "Qui êtes-vous ?" : "Who are you?"}
          </h1>
          <p className="text-muted-foreground mt-3">
            {lang === "ar" ? "اختر المسار المناسب لك." : lang === "fr" ? "Choisissez le chemin qui vous correspond." : "Pick the path that fits you."}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link to="/auth/signup/client" className="group glass rounded-3xl p-8 relative overflow-hidden transition-smooth hover:-translate-y-1 hover:border-primary-glow/50 animate-fade-in">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-primary-glow/20 blur-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-royal flex items-center justify-center mb-5">
                <Briefcase className="w-6 h-6 text-primary-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2">
                {lang === "ar" ? "أنا زبون" : lang === "fr" ? "Je suis un Client" : "I'm a Client"}
              </h2>
              <p className="text-muted-foreground mb-6">{t("brandSub")}</p>
              <span className="inline-flex items-center gap-1 text-accent font-medium">
                {t("openClient")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </Link>

          <Link to="/auth/signup/creator" className="group glass rounded-3xl p-8 relative overflow-hidden transition-smooth hover:-translate-y-1 hover:border-accent/50 animate-fade-in">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-gold flex items-center justify-center mb-5">
                <Camera className="w-6 h-6 text-accent-foreground" />
              </div>
              <h2 className="font-serif text-2xl font-bold mb-2">
                {lang === "ar" ? "أنا عامل حر" : lang === "fr" ? "Je suis un Créateur" : "I'm a Creator"}
              </h2>
              <p className="text-muted-foreground mb-6">{t("creatorSub")}</p>
              <span className="inline-flex items-center gap-1 text-accent font-medium">
                {t("applyCreator")} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </span>
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          {lang === "ar" ? "لديك حساب؟" : lang === "fr" ? "Vous avez déjà un compte ?" : "Already have an account?"}{" "}
          <Link to="/auth/login" className="text-accent">{t("login")}</Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
};

export default SignupChoice;
