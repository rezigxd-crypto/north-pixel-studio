import { Link, useLocation } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { useApp } from "@/lib/context";

const PendingReview = () => {
  const location = useLocation();
  const { name, email } = (location.state as any) || {};
  const { t } = useApp();

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-md glass rounded-3xl p-10 text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-gradient-gold flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-accent-foreground" />
          </div>
          <h1 className="font-serif text-3xl font-bold mb-3">{t("applicationUnderReview")}</h1>
          {name && <p className="text-accent font-medium mb-2">{name}</p>}
          <p className="text-muted-foreground mb-4">{t("pendingMsg")}</p>
          {email && (
            <p className="text-sm text-muted-foreground mb-8">
              {t("checkEmail")} <span className="text-accent">{email}</span>
            </p>
          )}
          <Button asChild variant="royal">
            <Link to="/">{t("returnHome")}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PendingReview;
