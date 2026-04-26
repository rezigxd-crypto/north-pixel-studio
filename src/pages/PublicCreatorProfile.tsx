import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import {
  useBids, useCreators, getUserByUsername,
  type CreatorApplication, type UserDoc,
} from "@/lib/store";
import { firstNameLastInitial, sanitizeContactInfo } from "@/lib/username";
import { CREATOR_ROLE_AR, formatDZD } from "@/lib/offers";
import {
  ArrowRight, CheckCircle2, ImageIcon, Lock, MapPin, ShieldCheck, Star, UserCheck,
} from "lucide-react";

/**
 * Public, shareable profile page for an approved creator.
 *
 * Privacy model (anti-disintermediation):
 *  • Display name is masked to first-name + last-initial (e.g. "Yacine A.").
 *  • Bio runs through `sanitizeContactInfo` so phone numbers, emails, social
 *    handles, URLs, and trigger phrases ("call me", "DM me on Insta") are
 *    masked with `[•••]` even if the creator typed them in.
 *  • No phone, email, last name, or external portfolio links are rendered for
 *    anonymous viewers — they get a "Sign in to view portfolio" gate.
 *  • Logged-in clients can see the portfolio links, but with a banner reminding
 *    them that contacting outside the platform violates the TOS.
 */
const PublicCreatorProfile = () => {
  const { username = "" } = useParams<{ username: string }>();
  const { lang, auth } = useApp();
  const allCreators = useCreators();
  const bids = useBids();

  // Resolve the user doc by username. We only run the lookup when the visitor
  // is authenticated, since Firestore rules currently restrict /users reads to
  // logged-in users. A public-mirror collection (so anon visitors can see a
  // sanitized profile) ships in a follow-up PR.
  const [user, setUser] = useState<UserDoc | null | "loading">("loading");
  useEffect(() => {
    if (!auth.role) {
      // Don't clear user state while auth is still hydrating — leave it on
      // "loading" so the spinner stays visible instead of flashing 404.
      if (!auth.loading) setUser(null);
      return;
    }
    let alive = true;
    setUser("loading");
    getUserByUsername(username).then((u) => { if (alive) setUser(u); });
    return () => { alive = false; };
  }, [username, auth.role, auth.loading]);

  // Find the matching creator application (by email or uid), filtered to approved-only.
  const creator: CreatorApplication | undefined = useMemo(() => {
    if (!user || user === "loading") return undefined;
    return allCreators.find(
      (c) => c.status === "approved" && (c.uid === user.uid || c.email === user.email),
    );
  }, [user, allCreators]);

  // Completed-jobs count = bids accepted by this creator.
  const completedJobs = useMemo(() => {
    if (!user || user === "loading") return 0;
    return bids.filter((b) => b.creatorId === user.uid && (b.status === "accepted" || b.status === "delivered")).length;
  }, [user, bids]);

  /* ── Login gate (anonymous visitors) ──────────────────────────────────── */
  if (!auth.role && !auth.loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 px-6 pt-32 pb-16 max-w-2xl mx-auto w-full">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="bg-gradient-royal p-8">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary-foreground/80">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lang === "ar" ? "مبدع موثَّق" : lang === "fr" ? "Créateur vérifié" : "Verified creator"}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mt-2">@{username}</h1>
              <p className="text-primary-foreground/85 text-sm mt-2">
                {lang === "ar"
                  ? "سجّل الدخول لعرض هذا الملف."
                  : lang === "fr"
                    ? "Connectez-vous pour voir ce profil."
                    : "Sign in to view this profile."}
              </p>
            </div>
            <div className="p-8 flex justify-center gap-3 flex-wrap">
              <Button asChild variant="royal">
                <Link to="/auth/login">{lang === "ar" ? "تسجيل الدخول" : lang === "fr" ? "Se connecter" : "Log in"}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/auth/signup">{lang === "ar" ? "إنشاء حساب" : lang === "fr" ? "Créer un compte" : "Create account"}</Link>
              </Button>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  /* ── Loading + 404 states ─────────────────────────────────────────────── */
  if (user === "loading") {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-glow-pulse text-accent font-serif text-2xl">North Pixel</div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!user || !creator) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 px-6 pt-32 pb-16 max-w-2xl mx-auto w-full">
          <div className="glass rounded-3xl p-10 text-center">
            <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-6 h-6 text-accent" />
            </div>
            <h1 className="font-serif text-2xl font-bold mb-2">
              {lang === "ar" ? "الملف غير موجود" : lang === "fr" ? "Profil introuvable" : "Profile not found"}
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              {lang === "ar"
                ? "هذا المبدع غير معتمد بعد، أو تم تغيير اسم المستخدم."
                : lang === "fr"
                  ? "Ce créateur n'est pas encore approuvé, ou son nom d'utilisateur a changé."
                  : "This creator isn't approved yet, or their username has changed."}
            </p>
            <Button asChild variant="royal">
              <Link to="/freelancers">
                {lang === "ar" ? "تصفّح المبدعين" : lang === "fr" ? "Parcourir les créateurs" : "Browse creators"}
              </Link>
            </Button>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  /* ── Render ──────────────────────────────────────────────────────────── */
  const displayName = firstNameLastInitial(creator.fullName);
  const { text: safeBio, redacted: bioRedacted } = sanitizeContactInfo(creator.bio || "");
  const roleLabel = lang === "ar" ? (CREATOR_ROLE_AR[creator.role] || creator.role) : creator.role;
  const profilePic = (user as UserDoc).profilePic;
  const isLoggedIn = !!auth.role;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 pt-28 pb-16 max-w-4xl mx-auto w-full">

        {/* Hero */}
        <section className="relative glass rounded-3xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-royal opacity-90" />
          <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl ring-2 ring-accent/40 overflow-hidden bg-white/10 flex items-center justify-center text-3xl font-bold text-primary-foreground flex-shrink-0">
              {profilePic
                ? <img src={profilePic} alt="" className="w-full h-full object-cover" />
                : displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary-foreground/80 mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                {lang === "ar" ? "مبدع موثَّق" : lang === "fr" ? "Créateur vérifié" : "Verified creator"}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary-foreground leading-tight truncate">
                {displayName}
              </h1>
              <div className="text-primary-foreground/85 text-sm mt-1">{roleLabel}</div>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-primary-foreground/80">
                {creator.wilaya && (
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{creator.wilaya}</span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {completedJobs} {lang === "ar" ? "عمل مكتمل" : lang === "fr" ? "missions terminées" : "completed"}
                </span>
                <span className="inline-flex items-center gap-1 text-accent">
                  <Star className="w-3.5 h-3.5 fill-accent" />
                  {/* Real ratings ship in a follow-up PR. */}
                  {lang === "ar" ? "قريبًا" : lang === "fr" ? "Bientôt" : "Coming soon"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bio */}
        {safeBio && (
          <section className="glass rounded-2xl p-5 sm:p-6 mb-6">
            <div className="text-[11px] uppercase tracking-widest text-accent/80 mb-2">
              {lang === "ar" ? "نبذة" : lang === "fr" ? "À propos" : "About"}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">{safeBio}</p>
            {bioRedacted && (
              <p className="text-[11px] text-muted-foreground italic mt-3">
                {lang === "ar"
                  ? "تم إخفاء معلومات الاتصال — التواصل يجب أن يتم عبر المنصة فقط."
                  : lang === "fr"
                    ? "Les coordonnées ont été masquées — la communication doit rester sur la plateforme."
                    : "Contact details have been hidden — keep all communication on the platform."}
              </p>
            )}
          </section>
        )}

        {/* Hourly rate */}
        {creator.rate > 0 && (
          <section className="glass rounded-2xl p-5 sm:p-6 mb-6 flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-widest text-accent/80">
                {lang === "ar" ? "سعر الساعة المرجعي" : lang === "fr" ? "Tarif horaire de référence" : "Reference hourly rate"}
              </div>
              <div className="font-serif text-2xl font-bold mt-1">
                {formatDZD(creator.rate, lang)} <span className="text-sm font-normal text-muted-foreground">/ {lang === "ar" ? "ساعة" : lang === "fr" ? "heure" : "hr"}</span>
              </div>
            </div>
            <Button asChild variant="gold" size="sm">
              <Link to={auth.role === "client" ? "/portal/client" : "/"}>
                {lang === "ar" ? "اطلب الآن" : lang === "fr" ? "Lancer un projet" : "Hire via project"}
                <ArrowRight className={`w-3.5 h-3.5 ms-1 ${lang === "ar" ? "rotate-180" : ""}`} />
              </Link>
            </Button>
          </section>
        )}

        {/* Portfolio — gated */}
        <section className="glass rounded-2xl p-5 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] uppercase tracking-widest text-accent/80 inline-flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {lang === "ar" ? "ملف الأعمال" : lang === "fr" ? "Portfolio" : "Portfolio"}
            </div>
            <span className="text-xs text-muted-foreground">
              {creator.portfolio.length} {lang === "ar" ? "عنصر" : lang === "fr" ? "éléments" : "items"}
            </span>
          </div>

          {creator.portfolio.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {lang === "ar" ? "لم يُرفع أي عمل بعد." : lang === "fr" ? "Aucun travail ajouté pour l'instant." : "No work published yet."}
            </p>
          ) : !isLoggedIn ? (
            <div className="rounded-xl border border-dashed border-accent/30 p-5 text-center bg-accent/5">
              <Lock className="w-5 h-5 text-accent mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">
                {lang === "ar" ? "سجّل الدخول لعرض ملف الأعمال" : lang === "fr" ? "Connectez-vous pour voir le portfolio" : "Sign in to view the portfolio"}
              </p>
              <p className="text-[11px] text-muted-foreground mb-4">
                {lang === "ar"
                  ? "نُخفي الروابط الخارجية لحماية المبدعين والعملاء على حد سواء."
                  : lang === "fr"
                    ? "Les liens externes sont protégés pour la sécurité des créateurs et des clients."
                    : "External links are protected for the safety of both creators and clients."}
              </p>
              <div className="flex justify-center gap-2 flex-wrap">
                <Button asChild size="sm" variant="royal">
                  <Link to="/auth/login">{lang === "ar" ? "دخول" : lang === "fr" ? "Connexion" : "Log in"}</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link to="/auth/signup">{lang === "ar" ? "إنشاء حساب" : lang === "fr" ? "Créer un compte" : "Create account"}</Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-yellow-400/10 border border-yellow-400/30 px-3 py-2 mb-3 text-[11px] text-yellow-200 leading-snug">
                {lang === "ar"
                  ? "للحماية: التواصل مع المبدع يجب أن يتم حصرًا داخل المنصة."
                  : lang === "fr"
                    ? "Pour votre protection : tout contact avec ce créateur doit rester sur la plateforme."
                    : "For your protection: all contact with this creator must stay on the platform."}
              </div>
              <ul className="grid sm:grid-cols-2 gap-2">
                {creator.portfolio.map((link) => (
                  <li key={link}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="block glass rounded-xl p-3 border border-border/40 hover:border-accent/40 transition-smooth text-xs text-accent hover:text-accent/80 truncate"
                    >
                      {link.replace(/^https?:\/\//, "").replace(/^www\./, "")}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <div className="text-center text-xs text-muted-foreground">
          {lang === "ar" ? "ملف عام على " : lang === "fr" ? "Profil public sur " : "Public profile on "}
          <span className="text-accent font-medium">North Pixel Studio</span>
          {" · "}
          <Link to="/freelancers" className="text-accent hover:text-accent/80 underline-offset-2 hover:underline">
            {lang === "ar" ? "عرض كل المبدعين" : lang === "fr" ? "Voir tous les créateurs" : "View all creators"}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default PublicCreatorProfile;
