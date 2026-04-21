import { Link, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Globe, Sun, Moon } from "lucide-react";
import { useApp } from "@/lib/context";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "ع" }, { code: "fr", label: "FR" }, { code: "en", label: "EN" },
];

const NPLogo = () => (
  <div className="w-9 h-9 rounded-lg bg-gradient-royal flex items-center justify-center">
    <svg viewBox="0 0 36 36" className="w-5 h-5" fill="none">
      <text x="2" y="26" fontFamily="serif" fontSize="20" fontWeight="bold" fill="white">N</text>
      <text x="16" y="26" fontFamily="serif" fontSize="13" fontWeight="bold" fill="#c9a84c">P</text>
    </svg>
  </div>
);

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

  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <NPLogo />
            <div className="leading-tight">
              <div className="font-serif font-bold">{title}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>
            </div>
          </Link>
          <div className="flex items-center gap-2">
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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 me-1" />{lang === "ar" ? "خروج" : "Logout"}
            </Button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
};
