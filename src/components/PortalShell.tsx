import { Link, useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useApp } from "@/lib/context";
import { toast } from "sonner";

export const PortalShell = ({
  title, subtitle, accent = "royal", children,
}: { title: string; subtitle: string; accent?: "royal" | "gold" | "destructive"; children: ReactNode }) => {
  const { logout, t } = useApp();
  const navigate = useNavigate();

  const grad =
    accent === "gold" ? "bg-gradient-gold text-accent-foreground" :
    accent === "destructive" ? "bg-destructive text-destructive-foreground" :
    "bg-gradient-royal text-primary-foreground";

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out.");
    navigate("/");
  };

  return (
    <div className="min-h-screen">
      <nav className="glass sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg ${grad} flex items-center justify-center font-serif font-bold`}>N</div>
            <div className="leading-tight">
              <div className="font-serif font-bold">{title}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{subtitle}</div>
            </div>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> {t("login") === "Log in" ? "Log out" : t("login")}
          </Button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
};
