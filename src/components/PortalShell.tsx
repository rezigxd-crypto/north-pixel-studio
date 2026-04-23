import { Link, useNavigate } from "react-router-dom";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, Sun, Moon } from "lucide-react";
import { useApp } from "@/lib/context";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "ع" }, { code: "fr", label: "FR" }, { code: "en", label: "EN" },
];

export const PortalShell = ({
  title, subtitle, accent = "royal", children,
}: { title: string; subtitle: string; accent?: "royal" | "gold" | "destructive"; children: ReactNode }) => {
  const { logout, lang, setLang, dark, toggleDark } = useApp();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success(lang === "ar" ? "تم تسجيل الخروج." : "Logged out.");
    navigate("/");
  };

  const accentClass = accent === "gold" ? "bg-gradient-gold text-accent-foreground" :
    accent === "destructive" ? "bg-destructive text-destructive-foreground" :
    "bg-gradient-royal text-primary-foreground";

  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
              <img src="/logonp.png" alt="NP" className="w-full h-full object-cover" onError={(e) => {
                const t = e.target as HTMLImageElement;
                t.parentElement!.innerHTML = `<div class="${accentClass} w-9 h-9 rounded-lg flex items-center justify-center font-serif font-bold">N</div>`;
              }} />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="font-serif font-bold text-sm">{title}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>
            </div>
          </Link>

          <div className="flex items-center gap-2 ms-auto">
            <div className="hidden sm:flex items-center gap-1 glass rounded-full px-2 py-1">
              <Globe className="w-3.5 h-3.5 text-muted-foreground mx-1" />
              {LANGS.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium transition-smooth ${lang === l.code ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground hover:text-accent"}`}>
                  {l.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={toggleDark} className="w-8 h-8">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              <LogOut className="w-4 h-4 me-1" />
              <span className="hidden sm:inline">{lang === "ar" ? "خروج" : "Logout"}</span>
            </Button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-10">{children}</main>
    </div>
  );
};
