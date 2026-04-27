import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu, Sun, Moon, Globe, LogOut, LayoutDashboard,
  Home, Sparkles, GraduationCap, Clapperboard, Users, UserCheck, User, ArrowRight, Mail,
} from "lucide-react";
import { useState, useRef } from "react";
import { Sheet, SheetContent, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useApp } from "@/lib/context";
import { toast } from "sonner";
import type { Lang } from "@/lib/i18n";
import { NotificationBell } from "@/components/NotificationBell";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "ar", label: "العربية", flag: "🇩🇿" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
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
      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

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

        {/* Parent-brand label (centered absolutely so it doesn't disturb the
            flex layout on either side). Pointer events disabled on the
            wrapper so the controls behind it stay clickable on tight screens. */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
          <span
            className="np-title-shimmer-gold font-serif font-bold uppercase tracking-[0.18em] text-[11px] sm:text-xs md:text-sm whitespace-nowrap select-none"
            aria-label="The Algerian Studio"
            title="The Algerian Studio"
          >
            The Algerian Studio
          </span>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-2 ms-auto">
          {/* Lang switcher */}
          <div className="flex items-center gap-1 glass rounded-full px-2 py-1">
            <Globe className="w-3.5 h-3.5 text-muted-foreground mx-1" />
            {LANGS.map((l) => (
              <button key={l.code} onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium uppercase transition-smooth ${lang === l.code ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground hover:text-accent"}`}>
                {l.code === "ar" ? "ع" : l.code}
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
              <NotificationBell />
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

        {/* Mobile-only notification bell + hamburger */}
        <div className="md:hidden flex items-center ms-auto">
          {isLoggedIn && <NotificationBell />}
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden"><Menu /></Button>
          </SheetTrigger>
          <SheetContent
            side={lang === "ar" ? "left" : "right"}
            className="bg-background border-border w-80 sm:w-96 p-0 overflow-hidden"
          >
            {/* Accessible (screen-reader-only) title + description — required by Radix Dialog */}
            <VisuallyHidden>
              <SheetTitle>
                {lang === "ar" ? "قائمة التنقّل" : lang === "fr" ? "Menu de navigation" : "Navigation menu"}
              </SheetTitle>
              <SheetDescription>
                {lang === "ar"
                  ? "تصفّح الأقسام، غيّر اللغة، أو سجّل الدخول."
                  : lang === "fr"
                  ? "Parcourez les sections, changez de langue ou connectez-vous."
                  : "Browse sections, switch language, or sign in."}
              </SheetDescription>
            </VisuallyHidden>

            {/* Decorative drifting orbs (transform-only animation, clipped by overflow-hidden above) */}
            <div
              className="np-orb np-orb-gold pointer-events-none"
              style={{ width: 220, height: 220, top: "-80px", right: "-60px", opacity: 0.28 }}
            />
            <div
              className="np-orb np-orb-royal pointer-events-none"
              style={{ width: 180, height: 180, bottom: "-60px", left: "-40px", opacity: 0.22, animationDelay: "-5s" }}
            />

            <div className="relative flex flex-col h-full px-5 py-6 gap-5 overflow-y-auto">
              {/* ── Identity / brand card ────────────────────────────────── */}
              {isLoggedIn ? (
                <Link
                  to={`/portal/${auth.role}`}
                  onClick={() => setOpen(false)}
                  className="np-hover-lift gold relative flex items-center gap-3 glass rounded-2xl p-3.5 border border-border/50 mt-2"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-royal flex items-center justify-center flex-shrink-0 ring-2 ring-accent/30">
                    {auth.profilePic ? (
                      <img src={auth.profilePic} alt={auth.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-serif font-bold text-white text-lg">
                        {(auth.name || auth.email || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-bold text-sm truncate">
                      {auth.name || (lang === "ar" ? "مرحبًا" : lang === "fr" ? "Bienvenue" : "Welcome")}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-gradient-gold text-accent-foreground font-bold">
                        {auth.role === "admin"   ? (lang === "ar" ? "إدارة"     : lang === "fr" ? "Admin"     : "Admin")
                         : auth.role === "client"  ? (lang === "ar" ? "عميل"     : lang === "fr" ? "Client"    : "Client")
                         : auth.role === "creator" ? (lang === "ar" ? "مبدع"     : lang === "fr" ? "Créateur"  : "Creator")
                         :                          (lang === "ar" ? "ضيف"     : lang === "fr" ? "Invité"    : "Guest")}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate mt-1">{auth.email}</div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-accent flex-shrink-0 ${lang === "ar" ? "rotate-180" : ""}`} />
                </Link>
              ) : (
                <div className="relative flex items-center gap-3 glass rounded-2xl p-3.5 border border-border/50 mt-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src="/logonp.png"
                      alt="NP"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        t.style.display = "none";
                        t.parentElement!.classList.add("bg-gradient-royal", "flex", "items-center", "justify-center");
                        t.parentElement!.innerHTML = '<span class="font-serif font-bold text-white text-lg">N</span>';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-serif font-bold text-base">North Pixel Studio</div>
                    <div className="text-[10px] uppercase tracking-widest text-accent">
                      {lang === "ar" ? "الجزائر — منصة سمعية بصرية" : lang === "fr" ? "Algérie — audio-visuel" : "Algeria — audio-visual"}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Navigate section ─────────────────────────────────────── */}
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 ms-1">
                  {lang === "ar" ? "تصفّح" : lang === "fr" ? "Naviguer" : "Navigate"}
                </div>
                <ul className="np-stagger flex flex-col gap-1.5">
                  {[
                    { Icon: Home,         to: "/",                                   ar: "الرئيسية",     fr: "Accueil",         en: "Home" },
                    { Icon: Sparkles,     to: "/#offers",                            ar: "الخدمات",      fr: "Services",        en: "Services" },
                    { Icon: GraduationCap, to: "/#university",                       ar: "عرض الجامعات", fr: "Universités",     en: "University" },
                    { Icon: Clapperboard, to: "/quest",                              ar: "MovieCollab",  fr: "MovieCollab",     en: "MovieCollab" },
                    { Icon: Users,        to: "/clients",                            ar: "العملاء",      fr: "Clients",         en: "Clients" },
                    { Icon: UserCheck,    to: "/freelancers",                        ar: "المبدعون",     fr: "Créateurs",       en: "Creators" },
                  ].map((n) => (
                    <li key={n.to}>
                      <Link
                        to={n.to}
                        onClick={() => setOpen(false)}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/85 hover:text-foreground hover:bg-accent/10 active:bg-accent/15 transition-smooth border border-transparent hover:border-accent/25"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-gold/15 border border-accent/25 flex items-center justify-center flex-shrink-0 group-hover:bg-gradient-gold/30 transition-smooth">
                          <n.Icon className="w-4 h-4 text-accent" />
                        </div>
                        <span className="flex-1">{lang === "ar" ? n.ar : lang === "fr" ? n.fr : n.en}</span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 text-muted-foreground group-hover:text-accent transition-smooth ${
                            lang === "ar" ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
                          }`}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Settings section ─────────────────────────────────────── */}
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 ms-1">
                  {lang === "ar" ? "إعدادات" : lang === "fr" ? "Préférences" : "Preferences"}
                </div>

                {/* Theme toggle row */}
                <button
                  onClick={toggleDark}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-foreground/85 hover:bg-accent/10 transition-smooth border border-border/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-royal/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    {dark ? <Sun className="w-4 h-4 text-accent" /> : <Moon className="w-4 h-4 text-primary-glow" />}
                  </div>
                  <span className="flex-1 text-start">
                    {dark
                      ? (lang === "ar" ? "الوضع الليلي" : lang === "fr" ? "Mode sombre" : "Dark mode")
                      : (lang === "ar" ? "الوضع النهاري" : lang === "fr" ? "Mode clair"  : "Light mode")}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-accent">
                    {lang === "ar" ? "تبديل" : lang === "fr" ? "Changer" : "Switch"}
                  </span>
                </button>

                {/* Language pills with flags */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code)}
                      className={`flex flex-col items-center justify-center py-2.5 rounded-xl text-[11px] font-medium transition-smooth ${
                        lang === l.code
                          ? "bg-gradient-gold text-accent-foreground border border-transparent shadow-[0_0_20px_-8px_hsl(41_67%_60%/0.6)]"
                          : "border border-border/60 text-muted-foreground hover:text-accent hover:border-accent/40"
                      }`}
                    >
                      <span className="text-base leading-none mb-1">{l.flag}</span>
                      <span className="leading-none">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Auth actions ─────────────────────────────────────────── */}
              <div className="border-t border-border/60 pt-4 flex flex-col gap-2">
                {isLoggedIn ? (
                  <>
                    <Button asChild variant="royal" size="lg" onClick={() => setOpen(false)}>
                      <Link to={`/portal/${auth.role}`}>
                        <LayoutDashboard className="w-4 h-4 me-2" />
                        {lang === "ar" ? "لوحتي" : lang === "fr" ? "Mon tableau" : "My dashboard"}
                      </Link>
                    </Button>
                    <Button variant="outline" size="lg" onClick={handleLogout}>
                      <LogOut className="w-4 h-4 me-2" />
                      {lang === "ar" ? "تسجيل الخروج" : lang === "fr" ? "Se déconnecter" : "Logout"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="gold" size="lg" onClick={() => setOpen(false)}>
                      <Link to="/auth/signup">
                        <User className="w-4 h-4 me-2" />
                        {lang === "ar" ? "انضم الآن" : lang === "fr" ? "Rejoindre" : "Join now"}
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" onClick={() => setOpen(false)}>
                      <Link to="/auth/login">
                        {lang === "ar" ? "تسجيل الدخول" : lang === "fr" ? "Connexion" : "Log in"}
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* ── Footer ───────────────────────────────────────────────── */}
              <div className="mt-auto pt-5 border-t border-border/40">
                <a
                  href="mailto:hello@thealgerianstudio.com"
                  className="flex items-center gap-2 text-[11px] text-muted-foreground hover:text-accent transition-smooth"
                >
                  <Mail className="w-3.5 h-3.5" />
                  hello@thealgerianstudio.com
                </a>
                <div className="text-[10px] text-muted-foreground/70 mt-2">
                  © {new Date().getFullYear()} North Pixel Studio · {lang === "ar" ? "صُنع لأجلك" : lang === "fr" ? "Créé pour vous" : "Created for you"}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};
