import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CREATOR_ROLES } from "@/lib/offers";
import { addCreator } from "@/lib/store";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Plus, X, ChevronDown } from "lucide-react";
import { useApp } from "@/lib/context";
import { ALGERIA_WILAYAS } from "@/lib/i18n";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100),
  wilaya: z.string().min(1, "Please select your wilaya"),
  city: z.string().trim().max(60).optional().or(z.literal("")),
  role: z.string().min(1, "Pick your speciality"),
  bio: z.string().trim().min(20, "Tell us a bit more (20+ chars)").max(500),
  rate: z.coerce.number().min(1, "Set an hourly rate").max(1000000),
});

const CreatorSignup = () => {
  const navigate = useNavigate();
  const { t, registerCreator } = useApp();
  const [role, setRole] = useState<string>("");
  const [portfolio, setPortfolio] = useState<string[]>([""]);
  const [wilaya, setWilaya] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const updateLink = (i: number, v: string) => setPortfolio((p) => p.map((x, idx) => (idx === i ? v : x)));
  const addLink = () => setPortfolio((p) => [...p, ""]);
  const removeLink = (i: number) => setPortfolio((p) => p.filter((_, idx) => idx !== i));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      fullName: String(f.get("fullName") || ""),
      email: String(f.get("email") || ""),
      password: String(f.get("password") || ""),
      wilaya,
      city: String(f.get("city") || ""),
      role,
      bio: String(f.get("bio") || ""),
      rate: f.get("rate"),
    };
    const r = schema.safeParse(data);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }
    const validLinks = portfolio.map((l) => l.trim()).filter(Boolean);
    if (validLinks.length === 0) {
      toast.error("Portfolio is mandatory — add at least one link.");
      return;
    }

    setLoading(true);
    try {
      // Create Firebase Auth user + Firestore user doc
      await registerCreator(r.data.email, r.data.password, r.data.fullName, r.data.wilaya);
      // Save creator application to Firestore
      await addCreator({
        fullName: r.data.fullName,
        email: r.data.email,
        country: "Algeria",
        wilaya: r.data.wilaya,
        city: r.data.city || undefined,
        role: r.data.role,
        bio: r.data.bio,
        rate: r.data.rate,
        portfolio: validLinks,
      });
      navigate("/auth/pending", { state: { email: r.data.email, name: r.data.fullName } });
    } catch (err: any) {
      const msg = err?.code === "auth/email-already-in-use"
        ? "This email is already registered."
        : "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-6 pt-28 pb-12 max-w-3xl mx-auto w-full">
        <div className="glass rounded-3xl overflow-hidden animate-fade-in">
          <div className="bg-gradient-gold p-8">
            <span className="text-xs uppercase tracking-[0.3em] text-accent-foreground/80">{t("creatorNetwork")}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-accent-foreground mt-2">{t("buildProfile")}</h1>
            <p className="text-accent-foreground/80 text-sm mt-2">{t("portfolioMandatory")}</p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input id="fullName" name="fullName" required maxLength={100} placeholder="Amine Benali" />
              </div>
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" name="email" type="email" required placeholder="you@studio.com" />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder="Min 8 characters" />
              </div>
              <div>
                <Label htmlFor="rate">{t("hourlyRate")}</Label>
                <Input id="rate" name="rate" type="number" min={1} required placeholder="2000" />
              </div>
            </div>

            <div>
              <Label htmlFor="wilaya">{t("wilaya")}</Label>
              <div className="relative mt-1">
                <select
                  id="wilaya"
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">— {t("wilaya")} —</option>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.name}>{w.code}. {w.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="city">{t("city")}</Label>
              <Input id="city" name="city" placeholder="Algiers" />
            </div>

            <div>
              <Label className="mb-3 block">{t("speciality")}</Label>
              <div className="flex flex-wrap gap-2">
                {CREATOR_ROLES.map((r) => {
                  const active = role === r;
                  return (
                    <button key={r} type="button" onClick={() => setRole(r)}
                      className={`px-4 py-2 rounded-full text-sm border transition-smooth ${active ? "bg-gradient-gold text-accent-foreground border-transparent" : "border-border bg-secondary/40 text-muted-foreground hover:border-accent/40"}`}>
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">{t("shortBio")}</Label>
              <Textarea id="bio" name="bio" required maxLength={500} rows={3} placeholder="3 years shooting commercials across Algeria…" />
            </div>

            <div>
              <Label className="mb-2 block">{t("portfolioLinks")}</Label>
              <div className="space-y-2">
                {portfolio.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={link} onChange={(e) => updateLink(i, e.target.value)} placeholder="https://vimeo.com/your-reel" type="url" />
                    {portfolio.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeLink(i)}><X className="w-4 h-4" /></Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addLink}><Plus className="w-4 h-4" /> {t("addAnotherLink")}</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{t("portfolioDrop")}</p>
            </div>

            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
              {loading ? "..." : t("submitApplication")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("areYouClient")} <Link to="/auth/signup/client" className="text-accent">{t("openClient")}</Link>
            </p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default CreatorSignup;
