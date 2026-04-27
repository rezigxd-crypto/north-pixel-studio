import { Link } from "react-router-dom";
import { useApp } from "@/lib/context";

export const SiteFooter = () => {
  const { lang } = useApp();
  return (
    <footer className="border-t border-border mt-20 py-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/logonp.png" alt="NP" className="w-full h-full object-cover" />
            </div>
            <span className="font-serif font-bold">North Pixel</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            {lang === "ar" ? "أول منصة جزائرية في السمعي البصري." : lang === "fr" ? "La première plateforme audiovisuelle algérienne." : "Algeria's first audio-visual platform."}
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent">{lang === "ar" ? "الخدمات" : lang === "fr" ? "Services" : "Services"}</h4>
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li><Link to="/#offers" className="hover:text-foreground transition-smooth">{lang === "ar" ? "جميع الخدمات" : "All services"}</Link></li>
            <li><Link to="/#university" className="hover:text-foreground transition-smooth">{lang === "ar" ? "عرض الجامعات" : "University offer"}</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-smooth">{lang === "ar" ? "من نحن" : lang === "fr" ? "À propos" : "About us"}</Link></li>
            <li><Link to="/innovation" className="hover:text-foreground transition-smooth">{lang === "ar" ? "الابتكار" : lang === "fr" ? "Innovation" : "Innovation"}</Link></li>
            <li><Link to="/quest" className="hover:text-foreground transition-smooth">MovieCollab</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent">{lang === "ar" ? "البوابات" : "Portals"}</h4>
          <ul className="space-y-2 text-muted-foreground text-xs">
            <li><Link to="/auth/signup?role=client" className="hover:text-foreground transition-smooth">{lang === "ar" ? "أنا زبون" : "I'm a client"}</Link></li>
            <li><Link to="/auth/signup?role=creator" className="hover:text-foreground transition-smooth">{lang === "ar" ? "أنا عامل حر" : "I'm a freelancer"}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-accent">{lang === "ar" ? "تواصل" : "Contact"}</h4>
          <p className="text-muted-foreground text-xs">hello@thealgerianstudio.com</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-border text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
        <span>© {new Date().getFullYear()} North Pixel Studio</span>
        <span>{lang === "ar" ? "صُنع لأجلك." : lang === "fr" ? "Créé pour vous." : "Created for you."}</span>
      </div>
    </footer>
  );
};
