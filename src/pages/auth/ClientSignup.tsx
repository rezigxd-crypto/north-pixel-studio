import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_TYPES } from "@/lib/offers";
import * as Icons from "lucide-react";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useApp } from "@/lib/context";
import { ALGERIA_WILAYAS } from "@/lib/i18n";

const schema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(100),
  org: z.string().trim().max(100),
  type: z.string().min(1, "Pick the type that represents you"),
  wilaya: z.string().min(1, "Please select your wilaya"),
  about: z.string().trim().max(500),
});

const ClientSignup = () => {
  const navigate = useNavigate();
  const { t, registerClient } = useApp();
  const [type, setType] = useState<string>("");
  const [wilaya, setWilaya] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      fullName: String(f.get("fullName") || ""),
      email: String(f.get("email") || ""),
      password: String(f.get("password") || ""),
      org: String(f.get("org") || ""),
      type,
      wilaya,
      about: String(f.get("about") || ""),
    };
    const r = schema.safeParse(data);
    if (!r.success) { toast.error(r.error.issues[0].message); return; }

    setLoading(true);
    try {
      await registerClient(r.data.email, r.data.password, r.data.fullName, r.data.wilaya);
      toast.success(t("createClientAccount") + " ✓");
      navigate("/portal/client");
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
          <div className="bg-gradient-royal p-8">
            <span className="text-xs uppercase tracking-[0.3em] text-primary-foreground/80">{t("clientAccount")}</span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground mt-2">{t("tellUs")}</h1>
            <p className="text-primary-foreground/80 text-sm mt-2">{t("matchTeam")}</p>
          </div>

          <form onSubmit={submit} className="p-8 space-y-6">
            <div>
              <Label className="mb-3 block">{t("iRepresent")}</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {CLIENT_TYPES.map((c) => {
                  const Icon = (Icons as any)[c.icon] ?? Icons.Sparkles;
                  const active = type === c.value;
                  return (
                    <button key={c.value} type="button" onClick={() => setType(c.value)}
                      className={`p-4 rounded-2xl border text-left transition-smooth ${active ? "border-accent bg-accent/10" : "border-border bg-secondary/40 hover:border-accent/40"}`}>
                      <Icon className={`w-5 h-5 mb-2 ${active ? "text-accent" : "text-muted-foreground"}`} />
                      <div className="text-sm font-medium">{c.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <Input id="fullName" name="fullName" required maxLength={100} placeholder="Sarah Adams" />
              </div>
              <div>
                <Label htmlFor="org">{t("organization")}</Label>
                <Input id="org" name="org" maxLength={100} placeholder="Acme Brand" />
              </div>
              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" name="email" type="email" required placeholder="you@brand.com" />
              </div>
              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <Input id="password" name="password" type="password" required minLength={8} placeholder="Min 8 characters" />
              </div>
            </div>

            <div>
              <Label htmlFor="wilaya">{t("wilaya")}</Label>
              <div className="relative mt-1">
                <select id="wilaya" value={wilaya} onChange={(e) => setWilaya(e.target.value)}
                  className="w-full appearance-none bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-ring" required>
                  <option value="">— {t("wilaya")} —</option>
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.name}>{w.code}. {w.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <Label htmlFor="about">{t("lookingFor")}</Label>
              <Textarea id="about" name="about" maxLength={500} placeholder="A 60-sec cinematic ad for our spring campaign…" rows={3} />
            </div>

            <Button type="submit" variant="royal" size="lg" className="w-full" disabled={loading}>
              {loading ? "..." : t("createClientAccount")}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {t("areYouCreator")} <Link to="/auth/signup/creator" className="text-accent">{t("applyHere")}</Link>
            </p>
          </form>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default ClientSignup;
