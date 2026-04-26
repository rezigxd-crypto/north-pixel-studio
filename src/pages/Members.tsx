import { Link } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context";
import { useAllUsers, useCreators, useOffers } from "@/lib/store";
import { CREATOR_ROLE_AR, formatDZD } from "@/lib/offers";
import { ArrowRight, ExternalLink, MapPin, UserCheck, Users } from "lucide-react";
import { useMemo } from "react";

type Mode = "clients" | "freelancers";

const Members = ({ mode }: { mode: Mode }) => {
  const { lang, auth } = useApp();
  const allUsers = useAllUsers();
  const creators = useCreators();
  const offers = useOffers();

  const clients = useMemo(() => allUsers.filter((u) => u.role === "client"), [allUsers]);
  const approvedCreators = useMemo(() => creators.filter((c) => c.status === "approved"), [creators]);
  // Username backfill for legacy creators happens in their own portal session
  // (CreatorPortal), since Firestore rules only let a user write their own doc.

  const headline = mode === "clients"
    ? (lang === "ar" ? "العملاء على نورث بيكسل" : lang === "fr" ? "Les clients sur North Pixel" : "Clients on North Pixel")
    : (lang === "ar" ? "العمال الأحرار" : lang === "fr" ? "Les freelances" : "Freelancers");

  const subheadline = mode === "clients"
    ? (lang === "ar" ? "علامات وفرق وصنّاع نشروا مشاريع على المنصة." : lang === "fr" ? "Marques, équipes et créateurs qui publient des projets ici." : "Brands, teams, and creators posting projects on the platform.")
    : (lang === "ar" ? "مبدعون موثّقون ومعتمدون. اضغط على أي ملف لرؤية أعمالهم." : lang === "fr" ? "Créateurs vérifiés et approuvés. Cliquez sur un profil pour voir leurs travaux." : "Verified, approved creators. Tap any profile to see their work.");

  if (!auth.role && !auth.loading) {
    // Not logged in — Firestore rules block /users + /creators read for anon.
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1 px-6 pt-32 pb-16 max-w-3xl mx-auto w-full">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="bg-gradient-royal p-8">
              <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80">{mode === "clients" ? (lang === "ar" ? "العملاء" : "Clients") : (lang === "ar" ? "العمال الأحرار" : "Freelancers")}</span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mt-2">{headline}</h1>
              <p className="text-primary-foreground/85 text-sm mt-2">{subheadline}</p>
            </div>
            <div className="p-8 text-center space-y-5">
              <p className="text-muted-foreground">
                {lang === "ar" ? "سجّل الدخول لتصفّح المجتمع." : lang === "fr" ? "Connectez-vous pour parcourir la communauté." : "Sign in to browse the community."}
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button asChild variant="royal"><Link to="/auth/login">{lang === "ar" ? "تسجيل الدخول" : lang === "fr" ? "Se connecter" : "Log in"}</Link></Button>
                <Button asChild variant="outline"><Link to="/auth/signup">{lang === "ar" ? "إنشاء حساب" : lang === "fr" ? "Créer un compte" : "Create account"}</Link></Button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 pt-28 pb-16 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <span className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-[11px] uppercase tracking-widest text-accent">
            {mode === "clients" ? <Users className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            {mode === "clients" ? (lang === "ar" ? "العملاء" : "Clients") : (lang === "ar" ? "العمال الأحرار" : "Freelancers")}
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-bold mt-4">{headline}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{subheadline}</p>
        </div>

        {mode === "clients" ? (
          clients.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              {lang === "ar" ? "لا عملاء بعد." : lang === "fr" ? "Aucun client pour l'instant." : "No clients yet."}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((c) => {
                const numOffers = offers.filter((o) => o.clientEmail === c.email).length;
                return (
                  <div key={c.uid} className="glass rounded-2xl p-5 transition-smooth hover:border-accent/40 hover:-translate-y-0.5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground text-lg flex-shrink-0 ring-1 ring-accent/30 overflow-hidden">
                        {(c as any).profilePic
                          ? <img src={(c as any).profilePic} alt="" className="w-full h-full object-cover" />
                          : (c.name || c.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{c.name?.trim() || (lang === "ar" ? "بدون اسم" : "No name")}</div>
                        {c.wilaya && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3 text-accent/80" />{c.wilaya}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/60">
                      <span className="text-xs text-muted-foreground">{lang === "ar" ? "مشاريع منشورة" : lang === "fr" ? "Projets publiés" : "Projects posted"}</span>
                      <span className="text-sm font-semibold text-accent">{numOffers}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          approvedCreators.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center text-muted-foreground">
              {lang === "ar" ? "لا عمال أحرار معتمدون بعد." : lang === "fr" ? "Aucun freelance approuvé pour l'instant." : "No approved freelancers yet."}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedCreators.map((c) => {
                const userMatch = allUsers.find((u) => u.email === c.email);
                const profilePic = (userMatch as any)?.profilePic;
                const username = userMatch?.username;
                const roleLabel = lang === "ar" ? (CREATOR_ROLE_AR[c.role] || c.role) : c.role;
                // Privacy: cards in the directory show first name + last initial
                // and link to the public profile page. Full name + portfolio
                // links are only revealed inside the profile page.
                const parts = (c.fullName || "").trim().split(/\s+/).filter(Boolean);
                const displayName = parts.length <= 1
                  ? (parts[0] || "Creator")
                  : `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`;
                const card = (
                  <div className="glass rounded-2xl p-5 transition-smooth hover:border-accent/40 hover:-translate-y-0.5 flex flex-col h-full">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-royal flex items-center justify-center font-bold text-primary-foreground text-lg flex-shrink-0 ring-1 ring-accent/30 overflow-hidden">
                        {profilePic
                          ? <img src={profilePic} alt="" className="w-full h-full object-cover" />
                          : (c.fullName || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{displayName}</div>
                        <div className="text-xs text-muted-foreground truncate">{roleLabel}</div>
                        {c.wilaya && (
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                            <MapPin className="w-3 h-3 text-accent/80" />{c.wilaya}
                          </div>
                        )}
                      </div>
                    </div>
                    {c.rate > 0 && (
                      <div className="text-[11px] text-muted-foreground mt-3">
                        <span className="font-semibold text-foreground">{formatDZD(c.rate, lang)}</span> / {lang === "ar" ? "ساعة" : lang === "fr" ? "heure" : "hr"}
                      </div>
                    )}
                    {c.portfolio.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5"><ExternalLink className="w-3 h-3 text-accent/80" />{c.portfolio.length} {lang === "ar" ? "أعمال في الملف" : lang === "fr" ? "éléments" : "portfolio items"}</span>
                        <span className="text-accent">{lang === "ar" ? "عرض الملف" : lang === "fr" ? "Voir le profil" : "View profile"} →</span>
                      </div>
                    )}
                  </div>
                );
                return username
                  ? <Link key={c.id} to={`/@${username}`} className="block">{card}</Link>
                  : <div key={c.id}>{card}</div>;
              })}
            </div>
          )
        )}

        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80">
            <ArrowRight className="w-4 h-4 rotate-180" />
            {lang === "ar" ? "العودة إلى الصفحة الرئيسية" : lang === "fr" ? "Retour à l'accueil" : "Back to homepage"}
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Members;
