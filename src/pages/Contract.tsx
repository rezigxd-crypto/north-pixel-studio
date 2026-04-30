import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useApp } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import {
  Bid,
  ClientOffer,
  UserDoc,
  getUserProfile,
} from "@/lib/store";
import {
  CLIENT_ADVANCE_PCT,
  STUDIO_BARIMOB,
  bidSavingsDiscount,
  computeClientRemaining,
} from "@/lib/offers";

/**
 * Auto-generated A4 contract for the 10% advance + bid-savings discount
 * mechanic. Two views: `client` and `creator`. The page is print-styled to
 * an A4 sheet so anyone can hit Ctrl+P and save a real PDF identical to
 * what an Algerian administrative bureau would issue.
 */

type Role = "client" | "creator";

const todayInArabic = (): string => {
  try {
    return new Intl.DateTimeFormat("ar-DZ-u-ca-gregory", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const todayInLatin = (): string =>
  new Intl.DateTimeFormat("fr-DZ", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

/** Six-character contract number derived from the offer id. */
const contractNumber = (offerId: string, role: Role): string => {
  const tail = offerId.slice(-6).toUpperCase();
  const prefix = role === "client" ? "CL" : "CR";
  const year = new Date().getFullYear();
  return `NPS-${year}-${prefix}-${tail}`;
};

const arabicNumeral = (n: number): string =>
  Number.isFinite(n)
    ? new Intl.NumberFormat("ar-DZ").format(Math.round(n))
    : "—";

const formatAr = (n: number): string => `${arabicNumeral(n)} دج`;

const Contract = () => {
  const { offerId = "", role: rawRole = "client" } = useParams<{ offerId: string; role: string }>();
  const role: Role = rawRole === "creator" ? "creator" : "client";
  const { auth } = useApp();
  const navigate = useNavigate();

  const [offer, setOffer] = useState<ClientOffer | null>(null);
  const [bid, setBid] = useState<Bid | null>(null);
  const [client, setClient] = useState<UserDoc | null>(null);
  const [creator, setCreator] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Subscribe to the offer doc — keeps the contract live as state changes
  // (advance gets confirmed, a bid gets accepted, etc.).
  useEffect(() => {
    if (!offerId) return;
    const unsub = onSnapshot(
      doc(db, "offers", offerId),
      (snap) => {
        if (!snap.exists()) {
          setErr("not_found");
          setLoading(false);
          return;
        }
        setOffer({ id: snap.id, ...snap.data() } as ClientOffer);
        setLoading(false);
      },
      () => {
        setErr("denied");
        setLoading(false);
      },
    );
    return unsub;
  }, [offerId]);

  // Load the accepted bid + the creator user doc, if any.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!offer?.acceptedBidId) {
        setBid(null);
        setCreator(null);
        return;
      }
      try {
        const bidSnap = await getDoc(doc(db, "bids", offer.acceptedBidId));
        if (!bidSnap.exists() || cancelled) return;
        const b = { id: bidSnap.id, ...bidSnap.data() } as Bid;
        setBid(b);
        if (b.creatorId) {
          const cu = await getUserProfile(b.creatorId);
          if (!cancelled) setCreator(cu);
        }
      } catch {
        /* silent — contract still renders without creator details */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offer?.acceptedBidId]);

  // Load the client user doc for the BaridiMob account number on the contract
  // body (we show the studio's account, not the client's, but we still want
  // the client's wilaya/phone if missing on the offer doc).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!offer?.clientUid) return;
      try {
        const cu = await getUserProfile(offer.clientUid);
        if (!cancelled) setClient(cu);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offer?.clientUid]);

  // Auth gate: the viewer must be the relevant party or admin. Anyone else
  // is redirected. Admin-email check is intentionally string-based to mirror
  // the existing admin guard pattern in this codebase.
  const isAdmin = auth.email === "rezig@admin.np";
  const isClientOwner = !!offer && !!auth.uid && auth.uid === offer.clientUid;
  const isAcceptedCreator =
    !!bid && !!auth.uid && auth.uid === bid.creatorId;

  const allowed = useMemo(() => {
    if (loading || !offer) return true; // don't bounce while loading
    if (isAdmin) return true;
    if (role === "client") return isClientOwner;
    if (role === "creator") return isAcceptedCreator;
    return false;
  }, [loading, offer, isAdmin, isClientOwner, isAcceptedCreator, role]);

  useEffect(() => {
    if (!loading && !allowed) {
      navigate("/", { replace: true });
    }
  }, [loading, allowed, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (err === "not_found" || !offer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-muted-foreground">Contract not found.</p>
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 me-1" /> Back
        </Button>
      </div>
    );
  }

  // ── Compute the numbers shown on the contract ────────────────────────────
  const advanceAmount = offer.advanceAmount || Math.round(offer.totalPrice * CLIENT_ADVANCE_PCT);
  const advancePaid = !!offer.advancePaid;
  const winningBidAmount = bid?.amount ?? null;
  const discount = winningBidAmount !== null ? bidSavingsDiscount(offer.bidMax, winningBidAmount, advancePaid) : 0;
  const remaining = computeClientRemaining(
    offer.totalPrice,
    advancePaid,
    advanceAmount,
    winningBidAmount,
    offer.bidMax,
  );

  const clientName = offer.clientName || client?.name || "—";
  const clientWilaya = offer.clientWilaya || client?.wilaya || "—";
  const clientPhone = offer.clientPhone || client?.phone || "—";
  const creatorName = bid?.creatorName || creator?.name || "—";
  const creatorWilaya = creator?.wilaya || "—";
  const creatorPhone = creator?.phone || "—";

  const ref = contractNumber(offer.id, role);

  return (
    <div className="contract-page min-h-screen bg-neutral-200 print:bg-white">
      {/* Print-only stylesheet sets A4 paper + clean margins. */}
      <style>{`
        @media print {
          /* Single-page A4: tighter margins + reduced font scale + force page
             breaks off of cards so the signature block can't orphan onto a
             second sheet. */
          @page { size: A4; margin: 8mm 10mm 10mm 10mm; }
          body { background: white !important; }
          .contract-toolbar { display: none !important; }
          .contract-sheet {
            box-shadow: none !important;
            margin: 0 !important;
            padding: 6mm 6mm 8mm 6mm !important;
            width: 100% !important;
            min-height: auto !important;
            border: none !important;
            font-size: 9.5pt !important;
            line-height: 1.32 !important;
            page-break-after: avoid;
          }
          .contract-sheet h1 { font-size: 13pt !important; }
          .contract-sheet h2 { font-size: 11pt !important; }
          .contract-sheet header { margin-bottom: 4mm !important; }
          .contract-sheet section,
          .contract-sheet table,
          .contract-sheet article > div {
            page-break-inside: avoid;
          }
          .contract-watermark { font-size: 70pt !important; }
        }
        .contract-sheet {
          /* A4 at 96dpi ≈ 794×1123. We use mm so print + screen match. */
          width: 210mm;
          min-height: 297mm;
          background: #fdfbf5;
          color: #1a1a1a;
          font-family: 'Amiri', 'Noto Naskh Arabic', 'Times New Roman', serif;
          padding: 18mm 18mm 22mm 18mm;
          margin: 12mm auto;
          box-shadow: 0 8px 30px rgba(0,0,0,0.18);
          position: relative;
        }
        .contract-sheet::before {
          content: "";
          position: absolute;
          inset: 6mm;
          border: 0.6mm double #8a6d3b;
          pointer-events: none;
        }
        .contract-watermark {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          opacity: 0.05;
          font-size: 88pt;
          font-weight: 900;
          letter-spacing: 0.3em;
          color: #1a3a8f;
          transform: rotate(-22deg);
          font-family: 'Amiri', serif;
        }
      `}</style>

      <div className="contract-toolbar sticky top-0 z-20 bg-background/90 backdrop-blur border-b border-border/40">
        <div className="max-w-[210mm] mx-auto flex items-center justify-between px-4 py-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 me-1" /> Back
          </Button>
          <div className="text-xs text-muted-foreground">
            {role === "client" ? "Client copy" : "Freelancer copy"} · {ref}
          </div>
          <Button variant="gold" size="sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4 me-1" /> Print / Save as PDF
          </Button>
        </div>
      </div>

      <article className="contract-sheet" dir="rtl" lang="ar">
        <div className="contract-watermark">NPS</div>

        {/* ── Government-style header ─────────────────────────────────── */}
        <header className="text-center mb-6 relative">
          <div className="text-[10pt] font-semibold tracking-wide text-[#1a3a8f]" style={{ direction: "ltr" }}>
            République Algérienne Démocratique et Populaire
          </div>
          <h1 className="font-bold text-[16pt] leading-tight mt-1">
            الجمهورية الجزائرية الديمقراطية الشعبية
          </h1>
          <div className="text-[11pt] mt-1 text-[#3a3a3a]">
            مؤسسة <span className="font-semibold">North&nbsp;Pixel&nbsp;Studio</span>{" "}
            — استوديو نورث بكسل
          </div>
          <div className="text-[9pt] text-[#6a6a6a]" style={{ direction: "ltr" }}>
            Studio audio-visuel agréé · contact@thealgerianstudio.com
          </div>
          <div className="mt-3 mx-auto w-32 h-px bg-[#8a6d3b]" />
        </header>

        {/* ── Reference + date strip ──────────────────────────────────── */}
        <div className="flex items-center justify-between text-[10.5pt] mb-5 border-y border-[#cfc6a8] py-2">
          <div>
            <span className="text-[#6a6a6a]">المرجع:</span>{" "}
            <span className="font-mono font-semibold">{ref}</span>
          </div>
          <div className="text-left" style={{ direction: "ltr" }}>
            <span className="text-[#6a6a6a]">Alger, le </span>
            <span className="font-semibold">{todayInLatin()}</span>
            <span className="mx-1 text-[#6a6a6a]">·</span>
            <span dir="rtl">حُرر بتاريخ {todayInArabic()}</span>
          </div>
        </div>

        {/* ── Title ───────────────────────────────────────────────────── */}
        <h2 className="text-center font-bold text-[14pt] mb-1">
          {role === "client"
            ? "عقد دفع مسبق وتعهد بالدفع عبر المنصة"
            : "عقد التزام التنفيذ والدفع الحصري عبر المنصة"}
        </h2>
        <p className="text-center text-[10pt] text-[#6a6a6a] mb-5">
          {role === "client"
            ? "نسخة العميل · Client copy"
            : "نسخة العامل الحر · Freelancer copy"}
        </p>

        {/* ── Parties block ───────────────────────────────────────────── */}
        <section className="text-[11pt] leading-[1.9] mb-5">
          <p className="mb-2">
            <span className="font-semibold">بين الموقّعَين أدناه:</span>
          </p>
          <p className="mb-1">
            <span className="font-semibold">الطرف الأول:</span> مؤسسة{" "}
            <span className="font-semibold">North Pixel Studio</span>،
            ممثَّلة بمديرها، الكائن مقرها بالجزائر، يُشار إليها فيما يلي
            بـ«المنصة».
          </p>
          <p>
            <span className="font-semibold">الطرف الثاني:</span>{" "}
            {role === "client" ? (
              <>
                السيد/ة <span className="font-semibold">{clientName}</span>،
                المقيم/ة بولاية <span className="font-semibold">{clientWilaya}</span>،
                رقم الهاتف <span className="font-mono">{clientPhone}</span>،
                يُشار إليه/ها فيما يلي بـ«العميل».
              </>
            ) : (
              <>
                السيد/ة <span className="font-semibold">{creatorName}</span>،
                المقيم/ة بولاية <span className="font-semibold">{creatorWilaya}</span>،
                رقم الهاتف <span className="font-mono">{creatorPhone}</span>،
                يُشار إليه/ها فيما يلي بـ«العامل الحر».
              </>
            )}
          </p>
        </section>

        {/* ── Subject ─────────────────────────────────────────────────── */}
        <section className="text-[11pt] leading-[1.9] mb-5">
          <p className="mb-1">
            <span className="font-semibold">الموضوع:</span> خدمة{" "}
            <span className="font-semibold">{offer.serviceTitle}</span>
            {offer.unitLabel ? <> — {offer.unitLabel}</> : null}.
          </p>
          {offer.deadline && (
            <p>
              <span className="font-semibold">الموعد النهائي للتسليم:</span>{" "}
              <span className="font-mono">{offer.deadline}</span>
            </p>
          )}
        </section>

        {/* ── Body — client copy ──────────────────────────────────────── */}
        {role === "client" && (
          <section className="text-[11.5pt] leading-[2] mb-5 text-justify">
            <p className="mb-3">
              نحن مؤسسة <span className="font-semibold">North Pixel Studio</span> نُصرّح
              بأن العميل المذكور أعلاه قد دفع نسبة{" "}
              <span className="font-semibold">10%</span> من المبلغ المستحق،
              المتمثلة في مبلغ{" "}
              <span className="font-semibold">{formatAr(advanceAmount)}</span>
              {" "}من المبلغ الإجمالي للخدمة المنشورة على المنصة، والمحدد بـ{" "}
              <span className="font-semibold">{formatAr(offer.totalPrice)}</span>.
            </p>
            <p className="mb-3">
              وأنه ملزم بدفع المبلغ المتبقي المتمثل في{" "}
              <span className="font-semibold">{formatAr(remaining)}</span>
              {discount > 0 ? (
                <>
                  {" "}بعد تطبيق{" "}
                  <span className="font-semibold">خصم الالتزام المسبق</span>{" "}
                  المُقدَّر بـ{" "}
                  <span className="font-semibold">{formatAr(discount)}</span>{" "}
                  لصالح العميل
                </>
              ) : advancePaid ? (
                <>
                  {" "}(يحقّ للعميل خصم الالتزام المسبق عند تأكيد العرض النهائي)
                </>
              ) : (
                <>
                  {" "}(يُمنح خصم الالتزام المسبق فور تأكيد الدفعة المسبقة)
                </>
              )}.
            </p>
            <p className="mb-3">
              شريطة أن يتم ذلك حصراً هنا في المنصة، عبر الحساب البريدي المذكور:{" "}
              <span className="font-mono font-semibold whitespace-nowrap">
                {STUDIO_BARIMOB.account}
              </span>
              {" "}— مفتاح: {STUDIO_BARIMOB.key}.
            </p>
            <p>
              ويُقرّ العميل بأنه لن يقوم بأي دفعة خارج المنصة، تحت طائلة فقدان
              حقه في خصم الالتزام المسبق وفي ضمان حسن التنفيذ الذي توفره المؤسسة.
            </p>
          </section>
        )}

        {/* ── Body — freelancer copy ──────────────────────────────────── */}
        {role === "creator" && (
          <section className="text-[11.5pt] leading-[2] mb-5 text-justify">
            <p className="mb-3">
              نحن مؤسسة <span className="font-semibold">North Pixel Studio</span> نُصرّح
              بأن العامل الحر المذكور أعلاه قد قبِل تنفيذ الخدمة الموصوفة أعلاه،
              مقابل أجرة صافية قدرها{" "}
              <span className="font-semibold">
                {formatAr(bid?.amount ?? offer.creatorPayout)}
              </span>
              ، تُدفع له حصراً عبر المنصة بعد التسليم والتحقق من الجودة.
            </p>
            {advancePaid && (
              <p className="mb-3">
                وقد أكّد العميل التزامه المسبق تجاه المنصة، مما يضمن جدية
                المشروع وانطلاق التنفيذ في آجاله.
              </p>
            )}
            <p className="mb-3">
              ويلتزم العامل الحر بعدم تلقي أي مبلغ من العميل خارج المنصة، تحت
              طائلة الإقصاء النهائي من قاعدة المتعاونين، وفقدان كل حق في
              المطالبة بالأجرة المحددة في هذا العقد.
            </p>
            <p className="mb-3">
              تُحوَّل الأجرة عبر الحساب البريدي للعامل الحر بعد قبول التسليم من
              قِبَل العميل والمنصة، وذلك خلال آجال معقولة لا تتجاوز سبعة أيام.
            </p>
            <p>
              يُقرّ العامل الحر بأنه قرأ هذا العقد وفهم محتواه، ويوقّع عليه
              قبولاً بالشروط المنصوص عليها أعلاه.
            </p>
          </section>
        )}

        {/* ── Money breakdown table (always shown for transparency) ───── */}
        <section className="text-[10.5pt] mb-6">
          <table className="w-full border-collapse" dir="rtl">
            <thead>
              <tr className="bg-[#f3eed3]">
                <th className="border border-[#8a6d3b] px-3 py-1.5 text-right font-semibold">
                  البيان
                </th>
                <th className="border border-[#8a6d3b] px-3 py-1.5 text-left font-semibold">
                  المبلغ
                </th>
              </tr>
            </thead>
            <tbody>
              {role === "client" && (
                <>
                  <tr>
                    <td className="border border-[#8a6d3b] px-3 py-1.5">
                      المبلغ الإجمالي للخدمة
                    </td>
                    <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono">
                      {formatAr(offer.totalPrice)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#8a6d3b] px-3 py-1.5">
                      الدفعة المسبقة (10%) {advancePaid ? "— مدفوعة ✓" : "— غير مؤكدة"}
                    </td>
                    <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono">
                      {formatAr(advanceAmount)}
                    </td>
                  </tr>
                  {discount > 0 && (
                    <>
                      <tr className="bg-[#eef6ee]">
                        <td className="border border-[#8a6d3b] px-3 py-1.5 font-semibold">
                          خصم الالتزام المسبق
                        </td>
                        <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono font-semibold">
                          − {formatAr(discount)}
                        </td>
                      </tr>
                      <tr>
                        <td className="border border-[#8a6d3b] px-3 py-1.5">
                          السعر النهائي للخدمة
                        </td>
                        <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono">
                          {formatAr(offer.totalPrice - discount)}
                        </td>
                      </tr>
                    </>
                  )}
                  <tr className="bg-[#fdf6e0]">
                    <td className="border border-[#8a6d3b] px-3 py-1.5 font-bold">
                      المبلغ المتبقي على العميل
                    </td>
                    <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono font-bold">
                      {formatAr(remaining)}
                    </td>
                  </tr>
                </>
              )}
              {role === "creator" && (
                <>
                  <tr>
                    <td className="border border-[#8a6d3b] px-3 py-1.5">
                      الخدمة
                    </td>
                    <td className="border border-[#8a6d3b] px-3 py-1.5 text-left">
                      {offer.serviceTitle}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-[#8a6d3b] px-3 py-1.5">
                      قيمة عرضك المقبول
                    </td>
                    <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono">
                      {formatAr(bid?.amount ?? offer.creatorPayout)}
                    </td>
                  </tr>
                  <tr className="bg-[#fdf6e0]">
                    <td className="border border-[#8a6d3b] px-3 py-1.5 font-bold">
                      صافي ما يستحقه العامل الحر
                    </td>
                    <td className="border border-[#8a6d3b] px-3 py-1.5 text-left font-mono font-bold">
                      {formatAr(bid?.amount ?? offer.creatorPayout)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>

        {/* ── Platform-only clause ────────────────────────────────────── */}
        <section className="text-[10.5pt] leading-[1.9] mb-6 bg-[#fbf3d9] border-r-4 border-[#8a6d3b] px-4 py-3">
          <p className="font-semibold mb-1">شرط الدفع الحصري عبر المنصة</p>
          <p>
            يُقرّ كلا الطرفين بأن جميع المبالغ المتعلقة بهذا العقد تُدفَع
            حصراً عبر منصة <span className="font-semibold">North Pixel Studio</span>،
            وعبر الحساب البريدي{" "}
            <span className="font-mono font-semibold">{STUDIO_BARIMOB.account}</span>{" "}
            (مفتاح {STUDIO_BARIMOB.key}). أي دفعة خارج المنصة تُلغي تلقائياً
            ضمانات هذا العقد، ولا تنشئ التزاماً على المؤسسة تجاه أي طرف.
          </p>
        </section>

        {/* ── Signature blocks ────────────────────────────────────────── */}
        <section className="grid grid-cols-2 gap-8 text-[10.5pt] mt-10">
          <div className="text-center">
            <div className="font-semibold mb-1">
              {role === "client" ? "إمضاء العميل" : "إمضاء العامل الحر"}
            </div>
            <div className="text-[#6a6a6a] mb-2">
              {role === "client" ? clientName : creatorName}
            </div>
            <div className="border-b border-[#1a1a1a] h-12" />
          </div>
          <div className="text-center">
            <div className="font-semibold mb-1">إمضاء المؤسسة</div>
            <div className="text-[#6a6a6a] mb-2">North Pixel Studio</div>
            <div className="border-b border-[#1a1a1a] h-12" />
            <div className="mt-1 text-[9pt] text-[#6a6a6a]">الختم الرسمي</div>
          </div>
        </section>

        {/* ── Footer strip ────────────────────────────────────────────── */}
        <footer className="absolute bottom-[14mm] left-[18mm] right-[18mm] flex items-center justify-between text-[8.5pt] text-[#6a6a6a] border-t border-[#cfc6a8] pt-2">
          <span>الجمهورية الجزائرية الديمقراطية الشعبية</span>
          <span style={{ direction: "ltr" }}>
            North Pixel Studio · {ref} · page 1/1
          </span>
        </footer>
      </article>

      {/* On-screen-only secondary toolbar */}
      <div className="contract-toolbar max-w-[210mm] mx-auto px-4 pb-12 text-center text-xs text-muted-foreground">
        <p>
          Press <kbd className="px-1 py-0.5 rounded bg-secondary text-foreground">Ctrl</kbd>+
          <kbd className="px-1 py-0.5 rounded bg-secondary text-foreground">P</kbd> (or use the
          Print button above) and choose <em>Save as PDF</em> for an A4 PDF copy.
        </p>
        <p className="mt-2">
          <Link to={role === "client" ? "/portal/client" : "/portal/creator"} className="underline">
            Back to portal
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Contract;
