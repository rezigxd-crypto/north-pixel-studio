import { Link, useNavigate } from "react-router-dom";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "@/lib/context";

const Login = () => {
  const navigate = useNavigate();
  const { t, loginWithEmail } = useApp();
  const [role, setRole] = useState<"client" | "creator" | "admin">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithEmail(email, password, role);
      toast.success(t("welcomeBack"));
      if (role === "admin") navigate("/portal/admin");
      else if (role === "creator") navigate("/portal/creator");
      else navigate("/portal/client");
    } catch (err: any) {
      const msg = err?.code === "auth/invalid-credential" || err?.code === "auth/wrong-password"
        ? "Invalid email or password."
        : err?.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Login failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-6 pt-28 pb-12">
        <div className="w-full max-w-md glass rounded-3xl p-8 animate-fade-in">
          <h1 className="font-serif text-3xl font-bold mb-2">{t("welcomeBack")}</h1>
          <p className="text-muted-foreground text-sm mb-6">{t("loginSub")}</p>

          <div className="grid grid-cols-3 gap-2 p-1 bg-secondary/60 rounded-full mb-6 text-xs">
            {(["client", "creator", "admin"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-2 rounded-full capitalize transition-smooth ${role === r ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground"}`}
              >{r}</button>
            ))}
          </div>

          {role === "admin" && (
            <div className="glass rounded-xl p-3 mb-4 text-xs text-muted-foreground border border-accent/20">
              {t("email")}: <span className="text-accent">rezig@admin.np</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>{t("email")}</Label>
              <Input
                type="text"
                required
                placeholder={role === "admin" ? "rezig@admin.np" : "you@studio.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <Label>{t("password")}</Label>
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button type="submit" variant="royal" className="w-full" size="lg" disabled={loading}>
              {loading ? "..." : t("login")}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {t("newHere")} <Link to="/auth/signup" className="text-accent font-medium">{t("createAccount")}</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Login;
