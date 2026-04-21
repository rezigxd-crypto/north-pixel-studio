import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Globe, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/lib/context";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "ع" },
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

// NP Logo SVG
const NPLogo = () => (
  <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center glow-royal flex-shrink-0">
    <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
      <text x="4" y="28" fontFamily="serif" fontSize="22" fontWeight="bold" fill="white">N</text>
      <text x="18" y="28" fontFamily="serif" fontSize="14" fontWeight="bold" fill="#c9a84c">P</text>
    </svg>
  </div>
);

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const { t, lang, setLang, dark, toggleDark, auth, logout } = useApp();
  const navigate = useNavigate();
  const isLoggedIn = !!auth.role && !auth.loading;

  const publicLinks = [
    { to: "/#offers", label: t("services") },
    { to: "/#about", label: t("studio") },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success(lang === "ar" ? "تم تسجيل الخروج." : "Logged out.");
    navigate("/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to={isLoggedIn ? `/portal/${auth.role}` : "/"} className="flex items-center gap-3 group flex-shrink-0">
          <NPLogo />
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold tracking-wide">North Pixel</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Studio</div>
          </div>
        </Link>

        {/* Nav links — only shown when NOT logged in */}
        {!isLoggedIn && (
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground flex-1 justify-center">
            {publicLinks.map((l) => (
              <NavLink key={l.to} to={l.to} className="hover:text-accent transition-smooth">{l.label}</NavLink>
            ))}
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 ms-auto">
          {/* Language */}
          <div className="flex items-center gap-1 glass rounded-full px-2 py-1">
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

          {isLoggedIn ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/portal/${auth.role}`}><LayoutDashboard className="w-4 h-4 me-1" />{lang === "ar" ? "لوحتي" : "Dashboard"}</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 me-1" />{lang === "ar" ? "خروج" : "Logout"}
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth/login">{t("login")}</Link></Button>
              <Button asChild variant="gold" size="sm"><Link to="/auth/signup">{t("join")}</Link></Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side={lang === "ar" ? "left" : "right"} className="bg-background border-border">
            <div className="flex flex-col gap-4 mt-10">
              {!isLoggedIn && publicLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-lg">{l.label}</Link>
              ))}
              <div className="flex gap-2 flex-wrap">
                {LANGS.map((l) => (
                  <button key={l.code} onClick={() => setLang(l.code)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-smooth ${lang === l.code ? "bg-gradient-royal text-primary-foreground border-transparent" : "border-border text-muted-foreground"}`}>
                    {l.label}
                  </button>
                ))}
                <button onClick={toggleDark} className="px-3 py-1 rounded-full text-sm border border-border text-muted-foreground">
                  {dark ? "☀️" : "🌙"}
                </button>
              </div>
              <div className="border-t border-border pt-4 flex flex-col gap-3">
                {isLoggedIn ? (
                  <>
                    <Button asChild variant="outline"><Link to={`/portal/${auth.role}`} onClick={() => setOpen(false)}>{lang === "ar" ? "لوحتي" : "Dashboard"}</Link></Button>
                    <Button variant="outline" onClick={() => { handleLogout(); setOpen(false); }}>{lang === "ar" ? "خروج" : "Logout"}</Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline"><Link to="/auth/login" onClick={() => setOpen(false)}>{t("login")}</Link></Button>
                    <Button asChild variant="gold"><Link to="/auth/signup" onClick={() => setOpen(false)}>{t("join")}</Link></Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};
