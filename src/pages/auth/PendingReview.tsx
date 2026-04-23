import { Link, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useApp } from "@/lib/context";

const PendingReview = () => {
  const { state } = useLocation() as { state: { email?: string; name?: string } | null };
  const { lang } = useApp();
  const name = state?.name || "";
  const email = state?.email || "";
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-md glass rounded-3xl p-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3">
            {lang === "ar" ? "طلبك قيد المراجعة" : lang === "fr" ? "Candidature en cours" : "Application under review"}
          </h1>
          {name && <p className="text-accent font-medium mb-2">{name}</p>}
          <p className="text-muted-foreground mb-4 text-sm">
            {lang === "ar"
              ? "ملفك الشخصي يتم مراجعته من قِبل فريق نورث بيكسل. نرد عادةً خلال 24 إلى 48 ساعة."
              : lang === "fr"
              ? "Votre profil est en cours d'examen par l'équipe North Pixel. Nous répondons généralement sous 24–48h."
              : "Your profile is being reviewed by the North Pixel team. We typically respond within 24–48 hours."}
          </p>
          {email && (
            <p className="text-xs text-muted-foreground mb-8">
              {lang === "ar" ? "تحقق من بريدك:" : "Check email at:"} <span className="text-accent">{email}</span>
            </p>
          )}
          <Button asChild variant="royal">
            <Link to="/">{lang === "ar" ? "العودة للرئيسية" : lang === "fr" ? "Retour" : "Return home"}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};
export default PendingReview;
