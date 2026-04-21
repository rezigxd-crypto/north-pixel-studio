import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Sun, Moon, Globe } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useApp } from "@/lib/context";
import type { Lang } from "@/lib/i18n";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "fr", label: "FR" },
  { code: "ar", label: "ع" },
];

export const SiteHeader = () => {
  const [open, setOpen] = useState(false);
  const { t, lang, setLang, dark, toggleDark, auth, logout } = useApp();

  const links = [
    { to: "/#offers", label: t("services") },
    { to: "/#about", label: t("studio") },
    { to: "/portal/creator", label: t("forCreators") },
    { to: "/portal/client", label: t("forClients") },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center font-serif font-bold text-primary-foreground glow-royal">
            N
          </div>
          <div className="leading-tight">
            <div className="font-serif text-lg font-bold tracking-wide">North Pixel</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-accent">Studio</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground flex-1 justify-center">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className="hover:text-accent transition-smooth">
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-1 glass rounded-full px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-muted-foreground mx-1" />
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium transition-smooth ${
                  lang === l.code
                    ? "bg-gradient-royal text-primary-foreground"
                    : "text-muted-foreground hover:text-accent"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Dark/Light toggle */}
          <Button variant="ghost" size="icon" onClick={toggleDark} className="w-8 h-8">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {auth.role ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to={`/portal/${auth.role}`}>Portal</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth/login">{t("login")}</Link>
              </Button>
              <Button asChild variant="gold" size="sm">
                <Link to="/auth/signup">{t("join")}</Link>
              </Button>
            </>
          )}
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-border">
            <div className="flex flex-col gap-4 mt-10">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-lg">
                  {l.label}
                </Link>
              ))}
              <div className="flex gap-2 flex-wrap">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-smooth ${
                      lang === l.code ? "bg-gradient-royal text-primary-foreground border-transparent" : "border-border text-muted-foreground"
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
                <button onClick={toggleDark} className="px-3 py-1 rounded-full text-sm border border-border text-muted-foreground">
                  {dark ? "☀️" : "🌙"}
                </button>
              </div>
              <div className="border-t border-border pt-4 flex flex-col gap-3">
                {auth.role ? (
                  <>
                    <Button asChild variant="outline"><Link to={`/portal/${auth.role}`} onClick={() => setOpen(false)}>Portal</Link></Button>
                    <Button variant="outline" onClick={() => { logout(); setOpen(false); }}>Logout</Button>
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
