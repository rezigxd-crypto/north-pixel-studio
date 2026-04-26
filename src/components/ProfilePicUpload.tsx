import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { uploadProfilePic, removeProfilePic } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Props = {
  uid?: string;
  currentUrl?: string;
  /** Fallback emoji or text shown when there is no picture. */
  fallback: React.ReactNode;
  /** Tailwind classes for the avatar container. */
  className?: string;
  /** Called after a successful upload/removal so the parent can refresh auth state. */
  onChange?: () => Promise<void> | void;
  lang: "ar" | "en" | "fr";
  /** Visual accent for the camera button. */
  accent?: "gold" | "royal";
};

export const ProfilePicUpload = ({
  uid, currentUrl, fallback, className = "", onChange, lang, accent = "gold",
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const trigger = () => inputRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !uid) return;
    setBusy(true);
    try {
      await uploadProfilePic(uid, file);
      toast.success(lang === "ar" ? "✓ تم تحديث الصورة." : "✓ Profile picture updated.");
      await onChange?.();
    } catch (err: any) {
      toast.error(err?.message || (lang === "ar" ? "فشل رفع الصورة." : "Upload failed."));
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!uid) return;
    setBusy(true);
    try {
      await removeProfilePic(uid);
      toast.success(lang === "ar" ? "✓ تم إزالة الصورة." : "✓ Picture removed.");
      await onChange?.();
    } catch (err: any) {
      toast.error(err?.message || (lang === "ar" ? "فشل الحذف." : "Remove failed."));
    } finally {
      setBusy(false);
    }
  };

  const accentBg = accent === "gold" ? "bg-gradient-gold" : "bg-gradient-royal";

  return (
    <div className="flex items-center gap-4">
      <div className={`relative ${className}`}>
        <div
          className={`w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl flex-shrink-0 ${currentUrl ? "bg-secondary" : accentBg}`}
        >
          {currentUrl ? (
            <img src={currentUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            fallback
          )}
        </div>
        <button
          type="button"
          onClick={trigger}
          disabled={busy}
          className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full ${accentBg} text-accent-foreground flex items-center justify-center shadow-md ring-2 ring-background hover:scale-110 transition-smooth disabled:opacity-60`}
          title={lang === "ar" ? "تغيير الصورة" : "Change picture"}
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" size="sm" onClick={trigger} disabled={busy}>
          <Camera className="w-3.5 h-3.5 me-1" />
          {currentUrl
            ? lang === "ar" ? "تغيير الصورة" : "Change picture"
            : lang === "ar" ? "رفع صورة" : "Upload picture"}
        </Button>
        {currentUrl && (
          <Button type="button" variant="ghost" size="sm" onClick={handleRemove} disabled={busy}>
            <Trash2 className="w-3.5 h-3.5 me-1" />
            {lang === "ar" ? "إزالة" : "Remove"}
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground">
          {lang === "ar" ? "JPG / PNG / WEBP — أقصى 2 ميغابايت" : "JPG / PNG / WEBP — max 2 MB"}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
};
