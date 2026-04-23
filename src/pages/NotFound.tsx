import { Link } from "react-router-dom";
import { useApp } from "@/lib/context";
const NotFound = () => {
  const { lang } = useApp();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-background">
      <div className="font-serif text-9xl font-bold text-gradient-gold mb-4">404</div>
      <h1 className="font-serif text-2xl font-bold mb-2">
        {lang === "ar" ? "الصفحة غير موجودة" : lang === "fr" ? "Page introuvable" : "Page not found"}
      </h1>
      <p className="text-muted-foreground mb-8 text-sm">
        {lang === "ar" ? "الرابط الذي طلبته غير موجود." : lang === "fr" ? "Le lien que vous avez demandé n'existe pas." : "The link you requested doesn't exist."}
      </p>
      <Link to="/" className="px-6 py-3 rounded-full bg-gradient-royal text-primary-foreground font-semibold text-sm hover:-translate-y-0.5 transition-transform">
        {lang === "ar" ? "العودة للرئيسية" : lang === "fr" ? "Retour à l'accueil" : "Back to home"}
      </Link>
    </div>
  );
};
export default NotFound;
