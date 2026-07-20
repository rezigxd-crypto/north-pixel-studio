import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Hidden explainer page — intentionally NOT linked from any nav, footer,
 * or sitemap. Reachable only by typing /explainer directly. Used for
 * pitch decks, jury reviews, and partner conversations.
 */
const VIDEO_URL =
  "https://pub.hyperagent.com/api/published/pbf01KXYSEB54_T75JQABX8RFNP4PP/north_pixel_full_film_ar_v2.mp4";

const Explainer = () => {
  useEffect(() => {
    document.title = "North Pixel Studio — الفيلم التعريفي";
    const m = document.createElement("meta");
    m.name = "robots";
    m.content = "noindex, nofollow";
    document.head.appendChild(m);
    return () => {
      document.head.removeChild(m);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 px-4 sm:px-6 pt-28 pb-16 w-full max-w-5xl mx-auto">
        <div className="glass rounded-3xl p-6 md:p-10 animate-fade-in">
          <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">
            North Pixel Studio · The Algerian Studio
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4">
            الفيلم التعريفي للمنصة
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-8" dir="rtl">
            هذا الفيديو يشرح فكرتنا كاملة في أقلّ من أربع دقائق: مشكلة السوق السمعي البصري
            في الجزائر، الحلّ الذي نقدّمه، رحلة المشروع من النشر إلى العقد الرسمي القابل
            للطباعة، الباقات الشهرية للمؤسسات والجامعات، وطبقة الثقة في انضمام المبدعين.
          </p>
          <div className="rounded-2xl overflow-hidden border border-border/40 bg-black shadow-2xl">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <video
              controls
              preload="metadata"
              playsInline
              className="w-full aspect-video"
              src={VIDEO_URL}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-5" style={{ direction: "ltr" }}>
            A 3½-minute walkthrough of the full platform concept — market problem, solution,
            marketplace flow, institutional bundles, and the trust layer.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Explainer;
