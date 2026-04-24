import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Globe, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/lib/context";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "ar", label: "ع" }, { code: "fr", label: "FR" }, { code: "en", label: "EN" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const { lang, setLang, dark, toggleDark, auth, logout } = useApp();
  const navigate = useNavigate();
  const isLoggedIn = !!auth.role && !auth.loading;
  const logoRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = async () => {
    await logout();
    toast.success(lang === "ar" ? "تم تسجيل الخروج." : "Logged out.");
    navigate("/");
    setOpen(false);
  };

  const flipLogo = () => {
    const el = logoRef.current;
    if (!el) return;
    el.classList.remove("np-logo-flip");
    // force reflow so animation restarts every click
    void el.offsetWidth;
    el.classList.add("np-logo-flip");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to={isLoggedIn ? `/portal/${auth.role}` : "/"} onClick={flipLogo} className="flex items-center gap-3 flex-shrink-0">
          <div ref={logoRef} className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0" style={{ perspective: "500px" }}>
            <img src="/logonp.png" alt="North Pixel Studio" className="w-full h-full object-cover" onError={(e) => {
              const t = e.target as HTMLImageElement;
              t.style.display = "none";
              t.parentElement!.classList.add("bg-gradient-royal", "flex", "items-center", "justify-center");
              t.parentElement!.innerHTML = '<span class="font-serif font-bold text-white text-lg">N</span>';
            }} />
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="font-serif text-base font-bold">North Pixel</div>
            <div className="text-[10px] uppercase tracking-widest text-accent">Studio</div>
          </div>
        </Link>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-2 ms-auto">
          {/* Lang switcher */}
          <div className="flex items-center gap-1 glass rounded-full px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-muted-foreground mx-1" />
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-smooth ${lang === l.code ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground hover:text-accent"}`}>
                {l.label}
              </button>
            ))}
          </div>
          {/* Dark/light */}
          <Button variant="ghost" size="icon" onClick={toggleDark} className="w-8 h-8">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          {/* Auth buttons */}
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
              <Button asChild variant="ghost" size="sm"><Link to="/auth/login">{lang === "ar" ? "دخول" : lang === "fr" ? "Connexion" : "Log in"}</Link></Button>
              <Button asChild variant="gold" size="sm"><Link to="/auth/signup">{lang === "ar" ? "انضم" : lang === "fr" ? "Rejoindre" : "Join"}</Link></Button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden"><Menu /></Button>
          </SheetTrigger>
          <SheetContent side={lang === "ar" ? "left" : "right"} className="bg-background border-border w-72">
            <div className="flex flex-col gap-5 mt-10">
              {/* Logo in sheet */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden">
                  <img src="/logonp.png" alt="NP" className="w-full h-full object-cover" />
                </div>
                <div className="font-serif font-bold">North Pixel Studio</div>
              </div>

              {/* Lang + dark */}
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
                    <Button asChild variant="royal" onClick={() => setOpen(false)}>
                      <Link to={`/portal/${auth.role}`}>{lang === "ar" ? "لوحتي" : "My Dashboard"}</Link>
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>{lang === "ar" ? "تسجيل الخروج" : "Logout"}</Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="outline" onClick={() => setOpen(false)}><Link to="/auth/login">{lang === "ar" ? "دخول" : "Log in"}</Link></Button>
                    <Button asChild variant="gold" onClick={() => setOpen(false)}><Link to="/auth/signup">{lang === "ar" ? "انضم" : "Join"}</Link></Button>
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
