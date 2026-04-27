/**
 * Creator "Invitations" tab — inbox of private task invitations sent
 * directly from the studio admin (not public bids). Creator can accept
 * or decline; admin gets notified of the response.
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Check, X, Briefcase, Wallet, Clock } from "lucide-react";
import { useApp } from "@/lib/context";
import { formatDZD } from "@/lib/offers";
import {
  type TaskInvitation,
  type TaskInvitationStatus,
  useCreatorInvitations,
  respondToInvitation,
} from "@/lib/bundles";
import { toast } from "sonner";

const StatusBadge = ({ status, lang }: { status: TaskInvitationStatus; lang: string }) => {
  const map: Record<TaskInvitationStatus, { ar: string; en: string; fr: string; cls: string }> = {
    pending:   { ar: "بانتظار",  en: "Pending",   fr: "En attente",  cls: "bg-yellow-400/15 text-yellow-400 ring-yellow-400/30" },
    accepted:  { ar: "مقبولة",   en: "Accepted",  fr: "Acceptée",    cls: "bg-emerald-400/15 text-emerald-400 ring-emerald-400/30" },
    declined:  { ar: "مرفوضة",   en: "Declined",  fr: "Refusée",     cls: "bg-destructive/15 text-destructive ring-destructive/30" },
    completed: { ar: "مكتملة",   en: "Completed", fr: "Terminée",    cls: "bg-blue-400/15 text-blue-400 ring-blue-400/30" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${m.cls}`}>
      {lang === "ar" ? m.ar : lang === "fr" ? m.fr : m.en}
    </span>
  );
};

const InvitationCard = ({ inv, lang }: { inv: TaskInvitation; lang: string }) => {
  const ar = lang === "ar"; const fr = lang === "fr";
  const [responding, setResponding] = useState<"accept" | "decline" | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleRespond = async (status: "accepted" | "declined") => {
    setSubmitting(true);
    try {
      await respondToInvitation(inv.id, status, note.trim() || undefined);
      toast.success(
        status === "accepted"
          ? ar ? "✓ تم قبول الدعوة" : fr ? "✓ Invitation acceptée" : "✓ Invitation accepted"
          : ar ? "تم رفض الدعوة" : fr ? "Invitation refusée" : "Invitation declined",
      );
      setResponding(null);
      setNote("");
    } catch {
      toast.error(ar ? "فشل العملية" : fr ? "Échec" : "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`glass rounded-2xl p-5 space-y-3 ${inv.status === "pending" ? "border border-accent/40" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-xs uppercase tracking-widest text-accent font-bold">
              {inv.bundleTitle || (ar ? "مهمة خاصة" : fr ? "Mission privée" : "Private task")}
            </span>
            <StatusBadge status={inv.status} lang={lang} />
          </div>
          <h3 className="font-serif text-lg font-bold">{inv.title}</h3>
          {inv.description && (
            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{inv.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Wallet className="w-3.5 h-3.5 text-accent" />
          <span className="font-semibold text-accent">{formatDZD(inv.fee, lang)}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {new Date(inv.createdAt).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          {ar ? "دعوة من الاستوديو" : fr ? "Invitation studio" : "Studio invitation"}
        </span>
      </div>

      {inv.status === "pending" && responding === null && (
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="royal" className="flex-1" onClick={() => setResponding("accept")}>
            <Check className="w-4 h-4 mr-1" />
            {ar ? "قبول" : fr ? "Accepter" : "Accept"}
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setResponding("decline")}>
            <X className="w-4 h-4 mr-1" />
            {ar ? "رفض" : fr ? "Refuser" : "Decline"}
          </Button>
        </div>
      )}

      {inv.status === "pending" && responding !== null && (
        <div className="space-y-2 pt-2 border-t border-border/50">
          <Label className="text-xs">
            {responding === "accept"
              ? ar ? "ملاحظة (اختياري)" : fr ? "Note (optionnel)" : "Note (optional)"
              : ar ? "سبب الرفض (اختياري)" : fr ? "Raison (optionnel)" : "Reason (optional)"}
          </Label>
          <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="flex-1" onClick={() => { setResponding(null); setNote(""); }} disabled={submitting}>
              {ar ? "إلغاء" : fr ? "Annuler" : "Cancel"}
            </Button>
            <Button
              size="sm"
              variant={responding === "accept" ? "royal" : "outline"}
              className="flex-1"
              onClick={() => handleRespond(responding === "accept" ? "accepted" : "declined")}
              disabled={submitting}
            >
              {responding === "accept"
                ? ar ? "تأكيد القبول" : fr ? "Confirmer" : "Confirm accept"
                : ar ? "تأكيد الرفض" : fr ? "Confirmer le refus" : "Confirm decline"}
            </Button>
          </div>
        </div>
      )}

      {inv.responseNote && (
        <div className="text-xs bg-secondary/30 rounded-lg p-2 mt-2">
          <span className="text-muted-foreground">
            {ar ? "ردك: " : fr ? "Votre réponse: " : "Your response: "}
          </span>
          {inv.responseNote}
        </div>
      )}
    </div>
  );
};

export const CreatorInvitations = ({ creatorUid }: { creatorUid: string }) => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const invitations = useCreatorInvitations(creatorUid);

  if (invitations.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <Mail className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
        <h3 className="font-serif text-lg font-bold mb-2">
          {ar ? "لا دعوات بعد" : fr ? "Aucune invitation pour l'instant" : "No invitations yet"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {ar
            ? "حين يحتاج الاستوديو لمواهب إضافية ستصلك الدعوات هنا."
            : fr
            ? "Quand le studio aura besoin de talents supplémentaires, vous recevrez les invitations ici."
            : "When the studio needs extra talent, invitations will land here."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((inv) => (
        <InvitationCard key={inv.id} inv={inv} lang={lang} />
      ))}
    </div>
  );
};
