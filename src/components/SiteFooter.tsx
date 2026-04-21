import { Link } from "react-router-dom";
import { useApp } from "@/lib/context";

export const SiteFooter = () => {
  const { t, lang } = useApp();
  return (
    <footer className="border-t border-border mt-24 py-12 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-royal flex items-center justify-center font-serif font-bold">N</div>
            <span className="font-serif text-lg font-bold">North Pixel</span>
          </div>
          <p className="text-muted-foreground">
            {lang === "ar" ? "استوديو وشبكة للإنتاج الصوتي البصري المتميز." :
             lang === "fr" ? "Un studio + réseau pour la création audio-visuelle premium." :
             "A studio + network for premium audio-visual storytelling."}
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent">{t("studio")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/#offers" className="hover:text-foreground">{t("services")}</Link></li>
            <li><Link to="/#about" className="hover:text-foreground">{t("studio")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent">
            {lang === "ar" ? "البوابات" : lang === "fr" ? "Portails" : "Portals"}
          </h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/portal/client" className="hover:text-foreground">{t("forClients")}</Link></li>
            <li><Link to="/portal/creator" className="hover:text-foreground">{t("forCreators")}</Link></li>
            <li><Link to="/portal/admin" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent">
            {lang === "ar" ? "تواصل" : lang === "fr" ? "Contact" : "Contact"}
          </h4>
          <p className="text-muted-foreground">hello@thealgerianstudio.com</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-border text-xs text-muted-foreground flex justify-between">
        <span>© {new Date().getFullYear()} North Pixel Studio</span>
        <span>{lang === "ar" ? "صُنع بعناية." : lang === "fr" ? "Conçu avec soin." : "Crafted with care."}</span>
      </div>
    </footer>
  );
};
