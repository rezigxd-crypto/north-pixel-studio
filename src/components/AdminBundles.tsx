/**
 * Admin "Bundles" tab — review pending bundle subscription requests,
 * activate them, manage monthly deliverables, and send private task
 * invitations to platform freelancers if the in-house team is short-handed.
 */
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase, Building2, Calendar, Check, ChevronLeft, Clock, FileText, MapPin,
  Pause, Phone, Plus, Send, User, UserPlus, X,
} from "lucide-react";
import { useApp } from "@/lib/context";
import { getBundle, getBundleTier, formatDZD, CREATOR_ROLE_AR } from "@/lib/offers";
import { useCreators } from "@/lib/store";
import {
  type BundleSubscription,
  type DeliverableStatus,
  type SubscriptionStatus,
  useAllSubscriptions,
  useDeliverables,
  addDeliverable,
  updateDeliverable,
  updateSubscriptionStatus,
  updateSubscriptionAdminNotes,
  sendTaskInvitation,
} from "@/lib/bundles";
import { toast } from "sonner";

// Status pill helper
const StatusBadge = ({ status, lang }: { status: SubscriptionStatus; lang: string }) => {
  const map: Record<SubscriptionStatus, { ar: string; en: string; fr: string; cls: string }> = {
    pending:   { ar: "بانتظار",  en: "Pending",   fr: "En attente",  cls: "bg-yellow-400/15 text-yellow-400 ring-yellow-400/30" },
    active:    { ar: "نشطة",      en: "Active",    fr: "Active",      cls: "bg-emerald-400/15 text-emerald-400 ring-emerald-400/30" },
    paused:    { ar: "متوقفة",    en: "Paused",    fr: "En pause",    cls: "bg-blue-400/15 text-blue-400 ring-blue-400/30" },
    cancelled: { ar: "ملغاة",     en: "Cancelled", fr: "Annulée",     cls: "bg-destructive/15 text-destructive ring-destructive/30" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${m.cls}`}>
      {lang === "ar" ? m.ar : lang === "fr" ? m.fr : m.en}
    </span>
  );
};

const DeliverableStatusBadge = ({ status, lang }: { status: DeliverableStatus; lang: string }) => {
  const map: Record<DeliverableStatus, { ar: string; en: string; fr: string; cls: string }> = {
    "planned":      { ar: "مخطط",      en: "Planned",      fr: "Planifié",     cls: "bg-secondary/60 text-muted-foreground ring-border/40" },
    "in-progress":  { ar: "قيد التنفيذ", en: "In progress",  fr: "En cours",     cls: "bg-accent/15 text-accent ring-accent/30" },
    "delivered":    { ar: "مُسلَّم",     en: "Delivered",    fr: "Livré",         cls: "bg-emerald-400/15 text-emerald-400 ring-emerald-400/30" },
    "blocked":      { ar: "متوقف",      en: "Blocked",      fr: "Bloqué",        cls: "bg-destructive/15 text-destructive ring-destructive/30" },
  };
  const m = map[status];
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full ring-1 ${m.cls}`}>
      {lang === "ar" ? m.ar : lang === "fr" ? m.fr : m.en}
    </span>
  );
};

// ─── Subscription detail view (deliverables + invitations) ─────────────────
const SubscriptionDetail = ({
  subscription, onBack, adminUid,
}: { subscription: BundleSubscription; onBack: () => void; adminUid: string }) => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const bundle = getBundle(subscription.bundleSlug);
  const tier = getBundleTier(subscription.bundleSlug, subscription.tierId);
  const deliverables = useDeliverables(subscription.id);
  const creators = useCreators();
  const [adminNotes, setAdminNotes] = useState(subscription.adminNotes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  // New deliverable form
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMonthLabel, setNewMonthLabel] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // Invite freelancer modal state
  const [invitingFor, setInvitingFor] = useState<string | null>(null); // deliverable id
  const [inviteCreatorUid, setInviteCreatorUid] = useState("");
  const [inviteFee, setInviteFee] = useState<string>("");
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteDescription, setInviteDescription] = useState("");

  const approvedCreators = useMemo(
    () => creators.filter((c) => c.status === "approved" && c.uid),
    [creators],
  );

  const handleStatusChange = async (status: SubscriptionStatus) => {
    await updateSubscriptionStatus(subscription.id, status, adminUid);
    toast.success(ar ? "✓ تم التحديث" : fr ? "✓ Mis à jour" : "✓ Updated");
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await updateSubscriptionAdminNotes(subscription.id, adminNotes);
      toast.success(ar ? "✓ ملاحظات محفوظة" : fr ? "✓ Notes enregistrées" : "✓ Notes saved");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddDeliverable = async () => {
    if (!newTitle.trim()) {
      toast.error(ar ? "العنوان مطلوب" : fr ? "Titre requis" : "Title required");
      return;
    }
    await addDeliverable(subscription.id, {
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      monthLabel: newMonthLabel.trim() || undefined,
      dueDate: newDueDate || undefined,
      createdBy: adminUid,
    });
    setNewTitle("");
    setNewDescription("");
    setNewMonthLabel("");
    setNewDueDate("");
    toast.success(ar ? "✓ تمت إضافة المهمة" : fr ? "✓ Tâche ajoutée" : "✓ Deliverable added");
  };

  const handleSendInvite = async () => {
    if (!inviteCreatorUid) {
      toast.error(ar ? "اختر مبدعًا" : fr ? "Choisissez un créateur" : "Pick a creator");
      return;
    }
    const creator = approvedCreators.find((c) => c.uid === inviteCreatorUid);
    if (!creator) return;
    const fee = Number(inviteFee || 0);
    if (!fee || fee <= 0) {
      toast.error(ar ? "أدخل أجرًا صحيحًا" : fr ? "Indiquez un montant" : "Enter a valid fee");
      return;
    }
    if (!inviteTitle.trim()) {
      toast.error(ar ? "أدخل عنوان المهمة" : fr ? "Titre requis" : "Task title required");
      return;
    }
    await sendTaskInvitation({
      subscriptionId: subscription.id,
      deliverableId: invitingFor || undefined,
      fromAdminUid: adminUid,
      toCreatorUid: creator.uid!,
      toCreatorName: creator.fullName,
      toCreatorEmail: creator.email,
      bundleTitle: bundle ? (bundle.badge[lang as "ar" | "en" | "fr"] || bundle.badge.en) : "",
      title: inviteTitle.trim(),
      description: inviteDescription.trim(),
      fee,
    });
    setInvitingFor(null);
    setInviteCreatorUid("");
    setInviteFee("");
    setInviteTitle("");
    setInviteDescription("");
    toast.success(ar ? "✓ تم إرسال الدعوة" : fr ? "✓ Invitation envoyée" : "✓ Invitation sent");
  };

  const tierTitle = tier ? (ar ? tier.title.ar : fr ? tier.title.fr : tier.title.en) : subscription.tierId;
  const bundleLabel = bundle ? (ar ? bundle.badge.ar : fr ? bundle.badge.fr : bundle.badge.en) : subscription.bundleSlug;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1">
        <ChevronLeft className="w-4 h-4" />
        {ar ? "رجوع" : fr ? "Retour" : "Back"}
      </Button>

      {/* Header card */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-4 h-4 text-accent" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{bundleLabel}</span>
              <StatusBadge status={subscription.status} lang={lang} />
            </div>
            <h2 className="font-serif text-xl font-bold">{subscription.orgName}</h2>
            <div className="text-xs text-muted-foreground mt-1">
              {tierTitle} · {formatDZD(subscription.monthlyPrice, lang)} / {ar ? "شهر" : fr ? "mois" : "mo"}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {subscription.status === "pending" && (
              <Button size="sm" variant="royal" onClick={() => handleStatusChange("active")}>
                <Check className="w-4 h-4 mr-1" />
                {ar ? "تفعيل" : fr ? "Activer" : "Activate"}
              </Button>
            )}
            {subscription.status === "active" && (
              <Button size="sm" variant="outline" onClick={() => handleStatusChange("paused")}>
                <Pause className="w-4 h-4 mr-1" />
                {ar ? "إيقاف مؤقت" : fr ? "Pause" : "Pause"}
              </Button>
            )}
            {subscription.status === "paused" && (
              <Button size="sm" variant="royal" onClick={() => handleStatusChange("active")}>
                <Check className="w-4 h-4 mr-1" />
                {ar ? "استئناف" : fr ? "Reprendre" : "Resume"}
              </Button>
            )}
            {subscription.status !== "cancelled" && (
              <Button size="sm" variant="ghost" onClick={() => handleStatusChange("cancelled")}>
                <X className="w-4 h-4 mr-1" />
                {ar ? "إلغاء" : fr ? "Annuler" : "Cancel"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{ar ? "المسؤول" : fr ? "Contact" : "Contact"}:</span>
            <span className="font-medium">{subscription.contactName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
            <a href={`tel:${subscription.contactPhone}`} className="font-medium hover:text-accent" dir="ltr">
              {subscription.contactPhone}
            </a>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-medium">{subscription.wilaya}</span>
          </div>
          {subscription.kickoffDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">{ar ? "بدء:" : fr ? "Démarrage:" : "Kickoff:"}</span>
              <span className="font-medium">{subscription.kickoffDate}</span>
            </div>
          )}
        </div>

        {subscription.notes && (
          <div className="text-xs">
            <span className="text-muted-foreground">{ar ? "ملاحظات العميل: " : fr ? "Notes client: " : "Client notes: "}</span>
            <span>{subscription.notes}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">
            {ar ? "ملاحظات داخلية" : fr ? "Notes internes" : "Internal notes"}
          </Label>
          <Textarea
            rows={2}
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder={ar ? "ملاحظات للفريق فقط" : fr ? "Visible par l'équipe seulement" : "Visible to your team only"}
          />
          <Button size="sm" variant="outline" onClick={handleSaveNotes} disabled={savingNotes}>
            {ar ? "حفظ الملاحظات" : fr ? "Enregistrer" : "Save notes"}
          </Button>
        </div>
      </div>

      {/* Deliverables */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h3 className="font-serif text-lg font-bold flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          {ar ? "المهام والمخرجات" : fr ? "Livrables" : "Deliverables"}
        </h3>

        {/* Add new deliverable */}
        <div className="rounded-xl bg-secondary/30 p-3 space-y-2">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={ar ? "العنوان (مثال: تغطية افتتاح كلية الهندسة)" : fr ? "Titre (ex. Couverture événement)" : "Title (e.g. Engineering faculty opening coverage)"}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={newMonthLabel}
              onChange={(e) => setNewMonthLabel(e.target.value)}
              placeholder={ar ? "الشهر (أكتوبر 2026)" : fr ? "Mois (Octobre 2026)" : "Month (October 2026)"}
            />
            <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          </div>
          <Textarea
            rows={2}
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder={ar ? "تفاصيل" : fr ? "Détails" : "Details"}
          />
          <Button size="sm" onClick={handleAddDeliverable} className="gap-1">
            <Plus className="w-3.5 h-3.5" />
            {ar ? "أضف مهمة" : fr ? "Ajouter" : "Add deliverable"}
          </Button>
        </div>

        {/* List */}
        {deliverables.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">
            {ar ? "لا مهام بعد." : fr ? "Aucun livrable pour l'instant." : "No deliverables yet."}
          </div>
        ) : (
          <div className="space-y-2">
            {deliverables.map((d) => (
              <div key={d.id} className="rounded-xl border border-border/50 p-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-sm">{d.title}</div>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground mt-1">
                      <DeliverableStatusBadge status={d.status} lang={lang} />
                      {d.monthLabel && <span>{d.monthLabel}</span>}
                      {d.dueDate && <span>· {d.dueDate}</span>}
                      {d.assignedToName && (
                        <span className="text-accent">· {ar ? "مُسند إلى " : fr ? "Assigné à " : "Assigned to "}{d.assignedToName}</span>
                      )}
                    </div>
                    {d.description && <p className="text-xs text-muted-foreground mt-1">{d.description}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {d.status !== "in-progress" && (
                    <Button size="sm" variant="outline" className="text-[11px] h-7"
                      onClick={() => updateDeliverable(subscription.id, d.id, { status: "in-progress" })}>
                      {ar ? "بدء العمل" : fr ? "Démarrer" : "Start"}
                    </Button>
                  )}
                  {d.status !== "delivered" && (
                    <Button size="sm" variant="outline" className="text-[11px] h-7"
                      onClick={() => updateDeliverable(subscription.id, d.id, { status: "delivered", completedAt: Date.now() })}>
                      {ar ? "تم التسليم" : fr ? "Livré" : "Mark delivered"}
                    </Button>
                  )}
                  {d.status !== "blocked" && (
                    <Button size="sm" variant="ghost" className="text-[11px] h-7"
                      onClick={() => updateDeliverable(subscription.id, d.id, { status: "blocked" })}>
                      {ar ? "متوقف" : fr ? "Bloquer" : "Block"}
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="text-[11px] h-7 ms-auto gap-1"
                    onClick={() => {
                      setInvitingFor(d.id);
                      setInviteTitle(d.title);
                      setInviteDescription(d.description || "");
                    }}>
                    <UserPlus className="w-3 h-3" />
                    {ar ? "ادعُ مبدعًا" : fr ? "Inviter un créateur" : "Invite creator"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inline invitation modal-like card */}
      {invitingFor !== null && (
        <div className="glass rounded-2xl p-5 space-y-3 border border-accent/40">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold flex items-center gap-2">
              <Send className="w-4 h-4 text-accent" />
              {ar ? "دعوة عمل خاصة" : fr ? "Invitation privée" : "Private invitation"}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setInvitingFor(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">
              {ar ? "اختر مبدعًا (موافق عليه)" : fr ? "Choisir un créateur (validé)" : "Pick a creator (approved)"}
            </Label>
            <select
              value={inviteCreatorUid}
              onChange={(e) => setInviteCreatorUid(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{ar ? "اختر…" : fr ? "Choisir…" : "Select…"}</option>
              {approvedCreators.map((c) => (
                <option key={c.id} value={c.uid}>
                  {c.fullName} — {ar ? CREATOR_ROLE_AR[c.role] || c.role : c.role}
                  {c.wilaya ? ` (${c.wilaya})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{ar ? "عنوان المهمة" : fr ? "Titre" : "Task title"}</Label>
              <Input value={inviteTitle} onChange={(e) => setInviteTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{ar ? "أجر المبدع (دج)" : fr ? "Rémunération (DA)" : "Fee (DA)"}</Label>
              <Input type="number" value={inviteFee} onChange={(e) => setInviteFee(e.target.value)} placeholder="15000" dir="ltr" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">{ar ? "تفاصيل" : fr ? "Détails" : "Details"}</Label>
            <Textarea rows={3} value={inviteDescription} onChange={(e) => setInviteDescription(e.target.value)} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setInvitingFor(null)} className="flex-1">
              {ar ? "إلغاء" : fr ? "Annuler" : "Cancel"}
            </Button>
            <Button variant="royal" size="sm" onClick={handleSendInvite} className="flex-1">
              <Send className="w-3.5 h-3.5 mr-1" />
              {ar ? "إرسال الدعوة" : fr ? "Envoyer" : "Send invitation"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Top-level admin Bundles tab ──────────────────────────────────────────
export const AdminBundles = ({ adminUid }: { adminUid: string }) => {
  const { lang } = useApp();
  const ar = lang === "ar"; const fr = lang === "fr";
  const subscriptions = useAllSubscriptions();
  const [filter, setFilter] = useState<"all" | SubscriptionStatus>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === "all") return subscriptions;
    return subscriptions.filter((s) => s.status === filter);
  }, [subscriptions, filter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: subscriptions.length, pending: 0, active: 0, paused: 0, cancelled: 0 };
    subscriptions.forEach((s) => { c[s.status]++; });
    return c;
  }, [subscriptions]);

  const selected = subscriptions.find((s) => s.id === selectedId);

  if (selected) {
    return (
      <SubscriptionDetail
        subscription={selected}
        onBack={() => setSelectedId(null)}
        adminUid={adminUid}
      />
    );
  }

  const tabs: Array<{ id: "all" | SubscriptionStatus; label: string }> = [
    { id: "pending", label: ar ? `بانتظار (${counts.pending})` : fr ? `En attente (${counts.pending})` : `Pending (${counts.pending})` },
    { id: "active",  label: ar ? `نشطة (${counts.active})`     : fr ? `Actives (${counts.active})`     : `Active (${counts.active})` },
    { id: "paused",  label: ar ? `متوقفة (${counts.paused})`   : fr ? `En pause (${counts.paused})`     : `Paused (${counts.paused})` },
    { id: "all",     label: ar ? `الكل (${counts.all})`         : fr ? `Tout (${counts.all})`            : `All (${counts.all})` },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 glass rounded-2xl overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className={`flex-1 min-w-max py-2 px-3 rounded-xl text-xs sm:text-sm font-medium transition-smooth whitespace-nowrap ${
              filter === t.id ? "bg-gradient-royal text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          {ar ? "لا اشتراكات في هذه الفئة." : fr ? "Aucun bundle dans cette catégorie." : "No subscriptions in this category."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const bundle = getBundle(s.bundleSlug);
            const tier = getBundleTier(s.bundleSlug, s.tierId);
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className="w-full glass rounded-2xl p-4 flex items-start gap-3 text-start hover:border-accent/40 transition-smooth"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-royal flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <span className="font-semibold text-sm truncate">{s.orgName}</span>
                    <StatusBadge status={s.status} lang={lang} />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {bundle ? (ar ? bundle.badge.ar : fr ? bundle.badge.fr : bundle.badge.en) : s.bundleSlug}
                    {tier ? ` · ${ar ? tier.title.ar : fr ? tier.title.fr : tier.title.en}` : ""}
                    · {formatDZD(s.monthlyPrice, lang)}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-1 flex items-center flex-wrap gap-x-3 gap-y-0.5">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{s.contactName}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.contactPhone}</span>
                    {s.wilaya && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.wilaya}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
