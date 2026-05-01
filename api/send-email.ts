/**
 * Vercel Serverless Function — sends transactional email via Resend.
 *
 * Why server-side: keeps RESEND_API_KEY secret. The browser POSTs to this
 * endpoint with the event type + meta; we render the localized HTML here
 * and forward to Resend.
 *
 * Required env vars (set in Vercel → Project Settings → Environment Variables):
 *   RESEND_API_KEY  — Resend API key (starts with `re_`)
 *   EMAIL_FROM      — sender address. Default: `onboarding@resend.dev`
 *                     (Resend's shared sandbox domain — works without DNS).
 *                     Switch to e.g. `noreply@northpixelstudio.dz` once your
 *                     domain is verified in the Resend dashboard.
 */

type Lang = "ar" | "fr" | "en";

type EmailPayload = {
  /** Event identifier — must match one of the keys in TEMPLATES below. */
  type: string;
  to: string;
  /** Display name for the recipient (e.g. "Ahmed Bakir"). Optional. */
  recipientName?: string;
  /** Free-form context (service title, amount, creator name, …). */
  meta?: Record<string, string>;
};

type TemplateRenderer = (
  meta: Record<string, string>,
  recipientName: string,
) => Record<Lang, { subject: string; lines: string[]; cta?: { label: string; href: string } }>;

const APP_URL = "https://north-pixel-studio.vercel.app";

const fmtDA = (raw: string): string => {
  const n = Number(raw || 0);
  if (!Number.isFinite(n) || n <= 0) return "";
  return n.toLocaleString("fr-DZ").replace(/\u202f/g, " ") + " DA";
};

const TEMPLATES: Record<string, TemplateRenderer> = {
  offer_approved: (m, name) => ({
    ar: {
      subject: `تم اعتماد مشروعك ✨ ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `أهلاً ${name || "بك"}،`,
        `أصبح مشروعك${m.serviceTitle ? ` "${m.serviceTitle}"` : ""} مفتوحًا الآن لاستقبال العروض من المبدعين.`,
        `الميزايدة تنتهي تلقائيًا بعد 3 ساعات من الاعتماد، ويفوز صاحب أقل عرض.`,
      ],
      cta: { label: "افتح لوحة التحكم", href: `${APP_URL}/portal/client` },
    },
    fr: {
      subject: `Projet approuvé ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Bonjour ${name || ""},`,
        `Votre projet${m.serviceTitle ? ` « ${m.serviceTitle} »` : ""} est en ligne et reçoit déjà des offres des créateurs.`,
        `La période d'enchères se ferme automatiquement après 3 h ; l'offre la plus basse l'emporte.`,
      ],
      cta: { label: "Ouvrir mon tableau de bord", href: `${APP_URL}/portal/client` },
    },
    en: {
      subject: `Project approved ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Hi ${name || ""},`,
        `Your project${m.serviceTitle ? ` "${m.serviceTitle}"` : ""} is live and accepting bids from creators.`,
        `Bidding auto-closes 3 h after approval; the lowest bid wins.`,
      ],
      cta: { label: "Open my dashboard", href: `${APP_URL}/portal/client` },
    },
  }),

  new_bid: (m, name) => ({
    ar: {
      subject: `عرض جديد على مشروعك ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `أهلاً ${name || "بك"}،`,
        `${m.creatorName || "أحد المبدعين"} قدّم عرضًا${m.amount ? ` بقيمة ${fmtDA(m.amount)}` : ""}${m.serviceTitle ? ` على مشروع "${m.serviceTitle}"` : ""}.`,
        `راجع كل العروض المقدّمة من لوحة التحكم لاختيار الأنسب.`,
      ],
      cta: { label: "عرض المزايدات", href: `${APP_URL}/portal/client` },
    },
    fr: {
      subject: `Nouvelle offre ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Bonjour ${name || ""},`,
        `${m.creatorName || "Un créateur"} a soumis une offre${m.amount ? ` de ${fmtDA(m.amount)}` : ""}${m.serviceTitle ? ` sur votre projet « ${m.serviceTitle} »` : ""}.`,
        `Comparez les offres dans votre tableau de bord et choisissez celle qui vous convient.`,
      ],
      cta: { label: "Voir les offres", href: `${APP_URL}/portal/client` },
    },
    en: {
      subject: `New bid ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Hi ${name || ""},`,
        `${m.creatorName || "A creator"} placed a bid${m.amount ? ` of ${fmtDA(m.amount)}` : ""}${m.serviceTitle ? ` on your project "${m.serviceTitle}"` : ""}.`,
        `Open your dashboard to compare bids and pick the one you want.`,
      ],
      cta: { label: "View bids", href: `${APP_URL}/portal/client` },
    },
  }),

  bid_accepted: (m, name) => ({
    ar: {
      subject: `تم قبول عرضك 🎉 ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `مبارك ${name || ""}،`,
        `تم اختيار عرضك${m.serviceTitle ? ` على مشروع "${m.serviceTitle}"` : ""}${m.amount ? ` بقيمة ${fmtDA(m.amount)}` : ""}.`,
        `يمكنك الآن الاطلاع على عقد التنفيذ ومعلومات التواصل مع العميل من بوابة المبدعين.`,
      ],
      cta: { label: "افتح بوابة المبدعين", href: `${APP_URL}/portal/creator` },
    },
    fr: {
      subject: `Offre acceptée 🎉 ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Félicitations ${name || ""},`,
        `Votre offre${m.serviceTitle ? ` sur le projet « ${m.serviceTitle} »` : ""}${m.amount ? ` (${fmtDA(m.amount)})` : ""} a été retenue.`,
        `Le contrat d'exécution et les coordonnées du client sont disponibles dans votre portail.`,
      ],
      cta: { label: "Ouvrir le portail créateur", href: `${APP_URL}/portal/creator` },
    },
    en: {
      subject: `Bid accepted 🎉 ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Congratulations ${name || ""},`,
        `Your bid${m.serviceTitle ? ` on "${m.serviceTitle}"` : ""}${m.amount ? ` (${fmtDA(m.amount)})` : ""} was accepted.`,
        `Open the creator portal to see the execution contract and the client's contact details.`,
      ],
      cta: { label: "Open creator portal", href: `${APP_URL}/portal/creator` },
    },
  }),

  advance_received: (m, name) => ({
    ar: {
      subject: `تأكيد استلام الدفعة المسبقة (10٪) ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `أهلاً ${name || "بك"}،`,
        `تأكّد لدينا استلام الدفعة المسبقة${m.amount ? ` بقيمة ${fmtDA(m.amount)}` : ""}${m.serviceTitle ? ` لمشروع "${m.serviceTitle}"` : ""}.`,
        `أصبح بإمكانك الاطلاع على عقد الالتزام في لوحة التحكم.`,
      ],
      cta: { label: "افتح لوحة التحكم", href: `${APP_URL}/portal/client` },
    },
    fr: {
      subject: `Avance (10 %) confirmée ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Bonjour ${name || ""},`,
        `Nous avons bien reçu l'avance de 10 %${m.amount ? ` (${fmtDA(m.amount)})` : ""}${m.serviceTitle ? ` pour le projet « ${m.serviceTitle} »` : ""}.`,
        `Le contrat d'engagement est disponible dans votre tableau de bord.`,
      ],
      cta: { label: "Voir le contrat", href: `${APP_URL}/portal/client` },
    },
    en: {
      subject: `10% advance received ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Hi ${name || ""},`,
        `We've received your 10% advance${m.amount ? ` (${fmtDA(m.amount)})` : ""}${m.serviceTitle ? ` for "${m.serviceTitle}"` : ""}.`,
        `The commitment contract is now available in your dashboard.`,
      ],
      cta: { label: "View contract", href: `${APP_URL}/portal/client` },
    },
  }),

  deliverable_submitted: (m, name) => ({
    ar: {
      subject: `تم تسليم العمل ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `أهلاً ${name || "بك"}،`,
        `${m.creatorName || "المبدع"} سلّم العمل${m.serviceTitle ? ` لمشروع "${m.serviceTitle}"` : ""}.`,
        `راجع التسليم وأكّد القبول أو اطلب تعديلات من لوحة التحكم.`,
      ],
      cta: { label: "افتح لوحة التحكم", href: `${APP_URL}/portal/client` },
    },
    fr: {
      subject: `Livraison reçue ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Bonjour ${name || ""},`,
        `${m.creatorName || "Le créateur"} a livré le travail${m.serviceTitle ? ` pour le projet « ${m.serviceTitle} »` : ""}.`,
        `Examinez la livraison puis acceptez-la ou demandez des révisions depuis votre tableau de bord.`,
      ],
      cta: { label: "Voir la livraison", href: `${APP_URL}/portal/client` },
    },
    en: {
      subject: `Deliverable submitted ${m.serviceTitle ? "— " + m.serviceTitle : ""}`,
      lines: [
        `Hi ${name || ""},`,
        `${m.creatorName || "The creator"} has submitted the deliverable${m.serviceTitle ? ` for "${m.serviceTitle}"` : ""}.`,
        `Review it from your dashboard, then accept or request revisions.`,
      ],
      cta: { label: "Review delivery", href: `${APP_URL}/portal/client` },
    },
  }),

  payment_released: (m, name) => ({
    ar: {
      subject: `تم تحرير دفعتك 💳`,
      lines: [
        `أهلاً ${name || "بك"}،`,
        `تم تحرير دفعتك${m.amount ? ` بقيمة ${fmtDA(m.amount)}` : ""} عبر بريدي موب.`,
        `قد تستغرق العملية بضع ساعات للظهور في حسابك. شكرًا على عملك المتميّز!`,
      ],
      cta: { label: "افتح بوابة المبدعين", href: `${APP_URL}/portal/creator` },
    },
    fr: {
      subject: `Paiement libéré 💳`,
      lines: [
        `Bonjour ${name || ""},`,
        `Votre paiement${m.amount ? ` (${fmtDA(m.amount)})` : ""} a été libéré via BaridiMob.`,
        `L'apparition sur votre compte peut prendre quelques heures. Merci pour votre excellent travail !`,
      ],
      cta: { label: "Ouvrir le portail créateur", href: `${APP_URL}/portal/creator` },
    },
    en: {
      subject: `Payment released 💳`,
      lines: [
        `Hi ${name || ""},`,
        `Your payment${m.amount ? ` (${fmtDA(m.amount)})` : ""} has been released via BaridiMob.`,
        `It may take a few hours to appear in your account. Thank you for the great work!`,
      ],
      cta: { label: "Open creator portal", href: `${APP_URL}/portal/creator` },
    },
  }),
};

const escape = (s: string): string =>
  String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!),
  );

const renderHtml = (
  bundle: Record<Lang, { subject: string; lines: string[]; cta?: { label: string; href: string } }>,
): string => {
  const block = (
    lang: Lang,
    dir: "ltr" | "rtl",
    accentBorder: boolean,
  ) => {
    const t = bundle[lang];
    const cta = t.cta
      ? `<p style="margin:16px 0 0;text-align:center;">
          <a href="${escape(t.cta.href)}" style="display:inline-block;background:#c9a14a;color:#0a0a0a;text-decoration:none;padding:11px 22px;border-radius:8px;font-weight:600;font-size:14px;letter-spacing:0.2px;">${escape(t.cta.label)}</a>
        </p>`
      : "";
    return `
      <div dir="${dir}" style="${accentBorder ? "border-top:1px solid #2a2a2a;margin-top:28px;padding-top:24px;" : ""}font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#e8e8e8;font-size:15px;line-height:1.65;">
        ${t.lines
          .map((line, i) => `<p style="margin:${i === 0 ? "0" : "12px"} 0 0;${i === 0 ? "font-size:16px;color:#fff;" : ""}">${escape(line)}</p>`)
          .join("")}
        ${cta}
      </div>
    `;
  };

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:linear-gradient(180deg,#141414 0%,#0d0d0d 100%);border:1px solid #1f1f1f;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px 8px;border-bottom:1px solid #1f1f1f;">
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#c9a14a;font-weight:700;letter-spacing:3px;font-size:13px;">NORTH PIXEL STUDIO</div>
                <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#888;font-size:11px;margin-top:2px;letter-spacing:0.5px;">ستوديو الإنتاج الإبداعي · الجزائر</div>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 32px;">
                ${block("ar", "rtl", false)}
                ${block("fr", "ltr", true)}
                ${block("en", "ltr", true)}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 24px;border-top:1px solid #1f1f1f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#666;font-size:11px;line-height:1.6;">
                <div>This is an automated transactional email from North Pixel Studio. You are receiving it because you have an active project or account with us.</div>
                <div style="margin-top:6px;"><a href="${APP_URL}" style="color:#888;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const renderText = (
  bundle: Record<Lang, { subject: string; lines: string[]; cta?: { label: string; href: string } }>,
): string =>
  ([
    bundle.ar.lines.join("\n"),
    bundle.ar.cta ? `${bundle.ar.cta.label}: ${bundle.ar.cta.href}` : "",
    "",
    "—".repeat(20),
    "",
    bundle.fr.lines.join("\n"),
    bundle.fr.cta ? `${bundle.fr.cta.label}: ${bundle.fr.cta.href}` : "",
    "",
    "—".repeat(20),
    "",
    bundle.en.lines.join("\n"),
    bundle.en.cta ? `${bundle.en.cta.label}: ${bundle.en.cta.href}` : "",
  ]
    .filter(Boolean)
    .join("\n"));

export default async function handler(req: { method?: string; body?: unknown }, res: {
  status: (n: number) => { json: (b: unknown) => unknown; end: () => unknown };
  setHeader: (k: string, v: string) => void;
}) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "method_not_allowed" });
    return;
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "missing_resend_api_key" });
    return;
  }

  const body =
    typeof req.body === "string"
      ? (JSON.parse(req.body) as EmailPayload)
      : ((req.body || {}) as EmailPayload);
  const { type, to, recipientName, meta } = body;
  if (!type || !to) {
    res.status(400).json({ error: "missing_fields" });
    return;
  }
  const tpl = TEMPLATES[type];
  if (!tpl) {
    res.status(400).json({ error: "unknown_type", type });
    return;
  }

  const bundle = tpl(meta || {}, recipientName || "");
  // Subject: AR primary, FR + EN appended in brackets so multi-lingual
  // recipients see all three at a glance in their inbox preview.
  const subject = `${bundle.ar.subject} · ${bundle.fr.subject} · ${bundle.en.subject}`.slice(0, 240);
  const html = renderHtml(bundle);
  const text = renderText(bundle);

  const from = process.env.EMAIL_FROM || "North Pixel Studio <onboarding@resend.dev>";

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });
    const out = await r.json().catch(() => ({}));
    if (!r.ok) {
      res.status(r.status).json({ error: "resend_failed", detail: out });
      return;
    }
    res.status(200).json({ ok: true, id: (out as { id?: string }).id });
  } catch (err) {
    res.status(500).json({ error: "send_threw", detail: String(err) });
  }
}
