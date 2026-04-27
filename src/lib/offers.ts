export type Offer = {
  slug: string;
  title: { en: string; fr: string; ar: string };
  tagline: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  features: { en: string[]; fr: string[]; ar: string[] };
  process: { en: string[]; fr: string[]; ar: string[] };
  startingPrice: number;
  icon: string;
  accent: "royal" | "gold";
  image: string;
  pricing: {
    unit: string;
    pricePerUnit: number;
    minUnits: number;
    maxUnits: number;
    unitLabel: string;
    unitLabelPlural: string;
    unitLabelAr: string;
  };
  matchingRoles: string[];
};

export const OFFERS: Offer[] = [
  {
    slug: "cinematic-ads",
    title: { en: "Cinematic Ads & Films", fr: "Publicités & Films Cinématiques", ar: "إعلانات وأفلام سينمائية" },
    tagline: { en: "Story-driven commercials and short films that move people.", fr: "Publicités narratives et courts-métrages qui touchent les gens.", ar: "إعلانات وأفلام قصيرة تصنع الأثر وتروي القصص." },
    description: { en: "From concept to final cut — TV commercials, brand films and narrative shorts. Treatment, casting, direction, on-set production and color grading, all in one place.", fr: "Du concept à la coupe finale — spots TV, films de marque et courts-métrages. Traitement, casting, réalisation, tournage et étalonnage.", ar: "من الفكرة إلى النسخة النهائية — إعلانات تلفزيونية وأفلام للعلامات التجارية وأفلام قصيرة. معالجة السيناريو، اختيار الممثلين، الإخراج، التصوير، وتدرّج الألوان." },
    features: {
      en: ["Creative direction & treatment", "Crew + cinema-grade cameras", "Color grading & sound mix", "Multi-format delivery (TV, web, social)"],
      fr: ["Direction créative & traitement", "Équipe + caméras cinéma", "Étalonnage & mixage son", "Livraison multi-format"],
      ar: ["إخراج إبداعي ومعالجة سينمائية", "طاقم متكامل وكاميرات احترافية", "تدرّج الألوان ومزج الصوت", "تسليم بصيغ متعددة للتلفزيون والويب"],
    },
    process: {
      en: ["Creative briefing call", "Treatment, casting & quote", "Shooting days", "Editing, color, sound & delivery"],
      fr: ["Appel de briefing créatif", "Traitement, casting & devis", "Journées de tournage", "Montage, étalonnage, son & livraison"],
      ar: ["جلسة تعارف وتحديد الفكرة", "كتابة المعالجة والكاستنغ مع عرض السعر", "أيام التصوير", "المونتاج وتدرّج الألوان والصوت ثم التسليم"],
    },
    startingPrice: 15000,
    icon: "Film", accent: "gold",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    pricing: { unit: "يوم تصوير", pricePerUnit: 15000, minUnits: 1, maxUnits: 7, unitLabel: "day", unitLabelPlural: "days", unitLabelAr: "يوم" },
    matchingRoles: ["Cinematographer", "Director", "Colorist"],
  },
  {
    slug: "event-coverage",
    title: { en: "Event & Institutional Coverage", fr: "Couverture Événements & Institutionnels", ar: "تغطية الفعاليات والمؤسسات" },
    tagline: { en: "Conferences, weddings, launches, rallies — captured with a cinema eye.", fr: "Conférences, mariages, lancements, rassemblements — capturés avec un œil cinéma.", ar: "مؤتمرات وأعراس وإطلاقات وتجمّعات — تُلتقط بعين سينمائية." },
    description: { en: "Multi-camera coverage for public and private events — from weddings and launches to press conferences, association events and official ceremonies. Same-day social cutdowns plus a full highlight edit.", fr: "Couverture multi-caméras pour tous événements — mariages, lancements, conférences de presse, événements associatifs. Montages sociaux le jour même et un film résumé complet.", ar: "تغطية متعددة الكاميرات للفعاليات العامة والخاصة — من الأعراس والإطلاقات إلى المؤتمرات الصحفية وفعاليات الجمعيات والحفلات الرسمية. مقاطع للسوشيال في نفس اليوم ومونتاج تذكاري كامل." },
    features: {
      en: ["Multi-camera crews", "Gimbal & stabilized shots", "Same-day social reels", "Full highlight film + multi-angle edit"],
      fr: ["Équipes multi-caméras", "Cardan & prises stabilisées", "Reels sociaux le jour même", "Film résumé + montage multi-angles"],
      ar: ["طواقم تصوير متعددة الكاميرات", "جيمبال ولقطات ثابتة ومتحركة", "مقاطع للسوشيال في نفس اليوم", "فيلم ملخّص كامل ومونتاج متعدد الزوايا"],
    },
    process: {
      en: ["Walkthrough & shot list", "Crew & gear plan", "Event-day coverage", "Same-day reel + full edit"],
      fr: ["Repérage & liste de plans", "Plan d'équipe & matériel", "Couverture le jour J", "Reel du jour + montage complet"],
      ar: ["زيارة الموقع ووضع قائمة اللقطات", "تجهيز الطاقم والمعدات", "التصوير يوم الفعالية", "مقطع سريع في نفس اليوم ثم المونتاج الكامل"],
    },
    startingPrice: 8000,
    icon: "Calendar", accent: "royal",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    pricing: { unit: "ساعة", pricePerUnit: 8000, minUnits: 1, maxUnits: 12, unitLabel: "hour", unitLabelPlural: "hours", unitLabelAr: "ساعة" },
    matchingRoles: ["Cinematographer", "Photographer", "Video Editor"],
  },
  {
    slug: "voice-over",
    title: { en: "Voice-Over & Sound Design", fr: "Voice-Over & Design Sonore", ar: "التعليق الصوتي وتصميم الصوت" },
    tagline: { en: "Voices, music and sound that hit the right note.", fr: "Des voix, de la musique et des sons qui touchent juste.", ar: "أصوات وموسيقى ومؤثرات تصل إلى القلب." },
    description: { en: "Studio-recorded voice-overs in multiple languages, custom music scoring, foley, and full audio mastering.", fr: "Voice-overs enregistrés en studio en plusieurs langues, composition musicale sur mesure.", ar: "تعليقات صوتية مسجّلة في الاستوديو بعدّة لغات، وتأليف موسيقى خاصة، ومؤثرات صوتية، وماسترينغ كامل." },
    features: {
      en: ["Native VO talent (AR/EN/FR)", "Custom score & SFX", "Mix & master", "Podcast production"],
      fr: ["Talents VO natifs (AR/EN/FR)", "Score & SFX sur mesure", "Mix & master", "Production podcast"],
      ar: ["مواهب تعليق صوتي أصلية (عربي/فرنسي/إنجليزي)", "موسيقى ومؤثرات مخصّصة", "مزج وإتقان صوتي", "إنتاج بودكاست متكامل"],
    },
    process: {
      en: ["Script & voice casting", "Studio recording", "Mix, music & SFX", "Master & delivery"],
      fr: ["Script & casting voix", "Enregistrement studio", "Mix, musique & SFX", "Master & livraison"],
      ar: ["تحضير النص واختيار الصوت", "التسجيل في الاستوديو", "المزج مع الموسيقى والمؤثرات", "الماسترينغ والتسليم"],
    },
    startingPrice: 2000,
    icon: "Mic", accent: "gold",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    pricing: { unit: "30 ثانية", pricePerUnit: 500, minUnits: 4, maxUnits: 20, unitLabel: "× 30s", unitLabelPlural: "× 30s", unitLabelAr: "× 30 ث" },
    matchingRoles: ["Voice-Over Artist", "Sound Designer"],
  },
  {
    slug: "editing-montage",
    title: { en: "Editing & Motion Graphics", fr: "Montage & Motion Graphics", ar: "المونتاج والجرافيك المتحرّك" },
    tagline: { en: "Post-production with rhythm, taste and finish.", fr: "Post-production avec rythme, goût et finition.", ar: "ما بعد إنتاج بإيقاع وذوق واحتراف." },
    description: { en: "Narrative editing, kinetic typography, 2D/3D motion design, VFX and color science — starting from your raw footage.", fr: "Montage narratif, typographie cinétique, motion design 2D/3D, VFX.", ar: "مونتاج سردي، كتابة متحرّكة، تصميم حركة ثنائي وثلاثي الأبعاد، مؤثرات بصرية، وعلم الألوان — انطلاقًا من لقطاتك الخام." },
    features: {
      en: ["Narrative editing", "Motion graphics & titles", "VFX compositing", "Color science"],
      fr: ["Montage narratif", "Motion graphics & titres", "Compositing VFX", "Science des couleurs"],
      ar: ["مونتاج سردي متقن", "جرافيك متحرّك وعناوين", "دمج المؤثرات البصرية", "ضبط ألوان احترافي"],
    },
    process: {
      en: ["Review your footage", "First cut & feedback", "Motion + VFX + color", "Final mix & delivery"],
      fr: ["Revue des rushes", "Premier montage & retours", "Motion + VFX + couleur", "Mix final & livraison"],
      ar: ["مراجعة اللقطات الخام", "مونتاج أولي مع تعديلات", "إضافة الحركة والمؤثرات وضبط الألوان", "المزج النهائي والتسليم"],
    },
    startingPrice: 4000,
    icon: "Scissors", accent: "royal",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    pricing: { unit: "دقيقة منتهية", pricePerUnit: 4000, minUnits: 1, maxUnits: 15, unitLabel: "minute", unitLabelPlural: "minutes", unitLabelAr: "دقيقة" },
    matchingRoles: ["Video Editor", "Motion Designer", "VFX Artist", "Colorist"],
  },
  {
    slug: "photography",
    title: { en: "Photography", fr: "Photographie", ar: "التصوير الفوتوغرافي" },
    tagline: { en: "Frames worth framing.", fr: "Des clichés qui méritent d'être encadrés.", ar: "لقطات تستحق أن تُعلَّق على الجدار." },
    description: { en: "Editorial, product, real estate and portrait photography. Studio or on-location, with retouching included.", fr: "Photographie éditoriale, produit, immobilier et portrait. Studio ou en extérieur.", ar: "تصوير تحريري ومنتجات وعقارات وبورتريه — في الاستوديو أو في الموقع، مع تعديل الصور." },
    features: {
      en: ["Studio + location", "Product & real estate", "Editorial portraits", "Pro retouching"],
      fr: ["Studio + extérieur", "Produit & immobilier", "Portraits éditoriaux", "Retouche pro"],
      ar: ["استوديو أو موقع خارجي", "تصوير المنتجات والعقارات", "بورتريه احترافي", "تعديل (ريتوش) احترافي"],
    },
    process: {
      en: ["Mood board & shot list", "Shoot day", "Selection & retouching", "Final gallery delivery"],
      fr: ["Mood board & liste de plans", "Jour de shooting", "Sélection & retouche", "Livraison galerie"],
      ar: ["تحضير لوحة إلهام وقائمة اللقطات", "يوم التصوير", "اختيار الصور وتعديلها", "تسليم المعرض النهائي"],
    },
    startingPrice: 3000,
    icon: "Camera", accent: "gold",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    pricing: { unit: "صورة معدّلة", pricePerUnit: 3000, minUnits: 5, maxUnits: 100, unitLabel: "photo", unitLabelPlural: "photos", unitLabelAr: "صورة" },
    matchingRoles: ["Photographer"],
  },
  {
    slug: "social-reels",
    title: { en: "Social Content & UGC", fr: "Contenu Social & UGC", ar: "محتوى السوشيال و UGC" },
    tagline: { en: "Short-form content built to travel.", fr: "Du contenu court format conçu pour voyager.", ar: "محتوى قصير مصمّم للانتشار السريع." },
    description: { en: "Vertical-first content engineered for Reels, TikTok and Shorts — hooks, captions, trends and cadence. Plus authentic UGC-style videos: unboxings, testimonials, lifestyle and review clips that convert.", fr: "Contenu vertical pour Reels, TikTok et Shorts, plus des vidéos UGC authentiques — unboxings, témoignages, lifestyle et avis.", ar: "محتوى رأسي مصمّم للريلز وتيك توك وشورتس — جاذب الانتباه، تعليقات، ومواكبة التوجّهات. بالإضافة إلى مقاطع بأسلوب UGC طبيعي: فتح العلب، شهادات، مقاطع نمط الحياة، ومقاطع المراجعة التي ترفع المبيعات." },
    features: {
      en: ["Hook-first scripting", "Vertical 9:16 edits", "UGC-style unboxings & testimonials", "Monthly content packs"],
      fr: ["Script axé sur l'accroche", "Montages verticaux 9:16", "UGC — unboxings & témoignages", "Packs mensuels"],
      ar: ["كتابة سيناريو جذّاب", "مونتاج رأسي 9:16", "فيديوهات UGC (فتح العلب والشهادات)", "باقات محتوى شهرية"],
    },
    process: {
      en: ["Content strategy call", "Scripts & hooks", "Filming & editing", "Monthly delivery & iteration"],
      fr: ["Appel stratégie contenu", "Scripts & accroches", "Tournage & montage", "Livraison & itérations mensuelles"],
      ar: ["جلسة استراتيجية للمحتوى", "كتابة السيناريوهات والجذابات", "التصوير والمونتاج", "تسليم شهري وتحسين مستمر"],
    },
    startingPrice: 3000,
    icon: "Smartphone", accent: "royal",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    pricing: { unit: "ريل", pricePerUnit: 3000, minUnits: 1, maxUnits: 30, unitLabel: "reel", unitLabelPlural: "reels", unitLabelAr: "ريل" },
    matchingRoles: ["Video Editor", "Motion Designer", "Cinematographer", "UGC Creator"],
  },
  {
    slug: "ghost-writing",
    title: { en: "Ghost Writing", fr: "Ghost Writing", ar: "كتابة المحتوى الخفية" },
    tagline: { en: "Your voice, written by professionals.", fr: "Votre voix, rédigée par des professionnels.", ar: "صوتك، تكتبه أقلام محترفة." },
    description: { en: "Scripts, captions, blog posts, newsletters and brand copy — written in your voice, ready to publish.", fr: "Scripts, légendes, articles de blog, newsletters et textes de marque — écrits dans votre voix.", ar: "سيناريوهات، تعليقات، مقالات مدوّنات، نشرات بريدية، ونصوص للعلامات التجارية — مكتوبة بأسلوبك، جاهزة للنشر." },
    features: {
      en: ["Script writing", "Social media captions", "Blog & newsletter copy", "Brand voice guide"],
      fr: ["Rédaction de scripts", "Légendes réseaux sociaux", "Articles & newsletters", "Guide de voix de marque"],
      ar: ["كتابة السيناريوهات", "تعليقات السوشيال ميديا", "مقالات ونشرات بريدية", "دليل أسلوب العلامة التجارية"],
    },
    process: {
      en: ["Discovery of your voice & tone", "Outline & research", "Writing & revisions", "Final copy delivery"],
      fr: ["Découverte de votre voix & ton", "Plan & recherches", "Rédaction & révisions", "Livraison finale"],
      ar: ["التعرّف على أسلوبك ونبرتك", "تحضير الخطة والأبحاث", "الكتابة والتعديلات", "تسليم النص النهائي"],
    },
    startingPrice: 2500,
    icon: "PenLine", accent: "royal",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    pricing: { unit: "مقال", pricePerUnit: 2500, minUnits: 1, maxUnits: 30, unitLabel: "piece", unitLabelPlural: "pieces", unitLabelAr: "مقال" },
    matchingRoles: ["Ghost Writer"],
  },
  {
    slug: "wedding",
    title: { en: "Wedding Day", fr: "Mariage", ar: "يوم العرس" },
    tagline: { en: "50 photos + signature wedding films, 4K. Make great memories.", fr: "50 photos + films signature, en 4K. Créez de grands souvenirs.", ar: "50 صورة + أفلام مميزة ليوم زفافك بدقة 4K. اصنعوا ذكريات عظيمة." },
    description: {
      en: "Cinematic wedding coverage by a dedicated team — 4K photo + video, signature edits, drone shots and a same-day reel for sharing. Built around your day, not a checklist.",
      fr: "Couverture de mariage cinématique par une équipe dédiée — photo + vidéo 4K, montage signature, prises de drone, et un reel le jour même.",
      ar: "تغطية سينمائية لحفل الزفاف بفريق مخصص — صور وفيديو بدقة 4K، مونتاج مميز، لقطات بالطائرة، ومقطع للسوشيال في نفس اليوم.",
    },
    features: {
      en: ["50 retouched 4K photos", "Cinematic 4K wedding film", "Drone aerial shots", "Same-day social reel", "Optional second shooter & engagement session"],
      fr: ["50 photos 4K retouchées", "Film de mariage 4K cinématique", "Prises de drone", "Reel le jour même", "2e photographe & séance fiançailles en option"],
      ar: ["50 صورة بدقة 4K مع تعديل احترافي", "فيلم زفاف سينمائي بدقة 4K", "لقطات جوية بالدرون", "مقطع للسوشيال في نفس اليوم", "مصور ثاني وجلسة خطوبة (اختياري)"],
    },
    process: {
      en: ["Discovery call & shot list", "Engagement / save-the-date (optional)", "Wedding-day coverage", "Editing, color, sound & full delivery"],
      fr: ["Appel de découverte & liste de plans", "Séance fiançailles (optionnel)", "Couverture le jour J", "Montage, étalonnage & livraison"],
      ar: ["جلسة تعارف ووضع قائمة اللقطات", "جلسة خطوبة (اختياري)", "التصوير يوم الزفاف", "المونتاج وتدرّج الألوان والتسليم الكامل"],
    },
    startingPrice: 35000,
    icon: "Heart", accent: "gold",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
    pricing: { unit: "حزمة", pricePerUnit: 35000, minUnits: 1, maxUnits: 3, unitLabel: "package", unitLabelPlural: "packages", unitLabelAr: "حزمة" },
    matchingRoles: ["Photographer", "Cinematographer", "Video Editor"],
  },
  {
    slug: "real-estate-360",
    title: { en: "360° Real Estate Shots", fr: "Prises Immobilières à 360°", ar: "لقطات عقارية بزاوية 360°" },
    tagline: { en: "Virtual tours, drone exteriors and listing-grade photos.", fr: "Visites virtuelles, vues drone et photos de qualité agence.", ar: "جولات افتراضية ولقطات جوية وصور بمستوى وكالات العقار." },
    description: {
      en: "Sell or rent faster — immersive 360° walkthroughs, drone exteriors and HDR interior photography. Hosted virtual-tour links you can drop straight into your listing.",
      fr: "Louez ou vendez plus vite — visites 360° immersives, drones d'extérieur et photos HDR. Lien de visite virtuelle prêt pour votre annonce.",
      ar: "بيع أو تأجير أسرع — جولات تفاعلية 360°، لقطات جوية، وصور داخلية بتقنية HDR. رابط جولة افتراضية جاهز للنشر مع إعلانك.",
    },
    features: {
      en: ["360° interior walkthrough", "HDR listing photos", "Drone exterior shots", "Virtual tour link (Matterport-style)", "Floor plan render (optional)"],
      fr: ["Visite intérieure 360°", "Photos HDR pour annonces", "Prises drone d'extérieur", "Lien de visite virtuelle", "Plan d'étage (optionnel)"],
      ar: ["جولة داخلية 360°", "صور إعلانية بتقنية HDR", "لقطات خارجية بالدرون", "رابط جولة افتراضية", "مخطط طابقي (اختياري)"],
    },
    process: {
      en: ["Property walkthrough & shot plan", "On-site shoot (interior + drone)", "Stitching & HDR processing", "Virtual tour link delivery"],
      fr: ["Repérage du bien & plan de prise", "Tournage sur site", "Stitching & HDR", "Livraison du lien de visite"],
      ar: ["زيارة العقار ووضع الخطة", "التصوير في الموقع (داخلي + درون)", "تجميع اللقطات ومعالجة HDR", "تسليم رابط الجولة الافتراضية"],
    },
    startingPrice: 12000,
    icon: "Home", accent: "royal",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    pricing: { unit: "عقار", pricePerUnit: 12000, minUnits: 1, maxUnits: 20, unitLabel: "property", unitLabelPlural: "properties", unitLabelAr: "عقار" },
    matchingRoles: ["Photographer", "Cinematographer"],
  },
];

export const CLIENT_TYPES = [
  { value: "brand", label: "Brand / Company", labelAr: "علامة تجارية / شركة", labelFr: "Marque / Entreprise", icon: "Building2" },
  { value: "university", label: "University / School", labelAr: "جامعة / مدرسة", labelFr: "Université / École", icon: "GraduationCap" },
  { value: "real-estate", label: "Real Estate", labelAr: "عقارات", labelFr: "Immobilier", icon: "Home" },
  { value: "store", label: "Store / E-commerce", labelAr: "متجر / تجارة إلكترونية", labelFr: "Boutique / E-commerce", icon: "ShoppingBag" },
  { value: "other", label: "Other", labelAr: "أخرى", labelFr: "Autre", icon: "Sparkles" },
] as const;

export const CREATOR_ROLES = [
  "Cinematographer", "Video Editor", "Motion Designer", "Voice-Over Artist",
  "Sound Designer", "Photographer", "Director", "Colorist", "VFX Artist",
  "Ghost Writer", "UGC Creator",
] as const;

export const CREATOR_ROLE_AR: Record<string, string> = {
  "Cinematographer": "مصور سينمائي",
  "Video Editor": "مونتير فيديو",
  "Motion Designer": "مصمم حركة",
  "Voice-Over Artist": "فنان تعليق صوتي",
  "Sound Designer": "مصمم صوت",
  "Photographer": "مصور فوتوغرافي",
  "Director": "مخرج",
  "Colorist": "فنان تدرج ألوان",
  "VFX Artist": "فنان مؤثرات بصرية",
  "Ghost Writer": "كاتب محتوى",
  "UGC Creator": "منشئ محتوى UGC",
};

export const RANK_LEVELS = [
  { id: "bronze", label: "Bronze", labelAr: "برونزي", min: 0, max: 2, color: "#cd7f32" },
  { id: "silver", label: "Silver", labelAr: "فضي", min: 3, max: 9, color: "#c0c0c0" },
  { id: "gold", label: "Gold", labelAr: "ذهبي", min: 10, max: 24, color: "#ffd700" },
  { id: "platinum", label: "Platinum", labelAr: "بلاتيني", min: 25, max: 49, color: "#e5e4e2" },
  { id: "diamond", label: "Diamond", labelAr: "ألماسي", min: 50, max: 999, color: "#b9f2ff" },
];

export const getRank = (completedJobs: number) =>
  RANK_LEVELS.find((r) => completedJobs >= r.min && completedJobs <= r.max) || RANK_LEVELS[0];

export const ADMIN_COMMISSION = 0.20;
export const CLIENT_ADVANCE_PCT = 0.10; // 10% advance from client

/**
 * Format a DZD price with the suffix in the user's current language.
 * Reads the language preference from localStorage (set by AppProvider).
 * Pass `lang` explicitly when calling outside a React render path.
 */
export const formatDZD = (n: number, lang?: "ar" | "en" | "fr"): string => {
  const resolved =
    lang ||
    ((typeof localStorage !== "undefined" && (localStorage.getItem("np.lang") as "ar" | "en" | "fr")) || "ar");
  const locale = resolved === "ar" ? "ar-DZ" : resolved === "fr" ? "fr-DZ" : "en-DZ";
  const suffix = resolved === "ar" ? "دج" : "DA";
  return `${new Intl.NumberFormat(locale).format(Math.round(n))} ${suffix}`;
};

/**
 * Localised "from X DA" label used on service cards.
 */
export const formatStartingPrice = (n: number, lang: "ar" | "en" | "fr"): string => {
  const price = formatDZD(n, lang);
  if (lang === "ar") return `من ${price}`;
  if (lang === "fr") return `à partir de ${price}`;
  return `from ${price}`;
};

export const getOffer = (slug: string) => OFFERS.find((o) => o.slug === slug);

// ─── University bundle (special offer) ─────────────────────────────────────
export const UNIVERSITY_BUNDLE = {
  slug: "university-bundle",
  badge: { ar: "عرض خاص للجامعات", en: "Special University Offer", fr: "Offre Spéciale Universités" },
  slogan: { ar: "دعم للرقمنة والبحث العلمي وتعزيز العلاقة بين الطالب والمؤسسة الجامعية", en: "Supporting digitalization, scientific research, and student-institution relations", fr: "Pour la numérisation, la recherche scientifique et le lien étudiant-université" },
  headline: { ar: "نطرح عليكم عرضًا يتضمن ما يلي — ويتيح لكم الحصول على مادة سمعية بصرية ترقى بمستوى جامعتكم بين الجامعات.", en: "We offer you a package that includes the following — giving you audio-visual content that elevates your university among peers.", fr: "Nous vous proposons un package qui comprend ce qui suit — pour vous offrir un contenu audiovisuel qui élève le niveau de votre université." },
  includes: {
    ar: ["تغطية فعاليات الجامعة (مؤتمرات، أيام مفتوحة، حفلات تخرج)", "حلقات بودكاست (طلاب، أساتذة، باحثون)", "تصوير المحاضرات وأرشفتها رقميًا", "إنتاج مقاطع دعائية للجامعة"],
    en: ["University event coverage (conferences, open days, graduations)", "Podcast episodes (students, professors, researchers)", "Lecture recording & digital archiving", "Promotional video production"],
    fr: ["Couverture événements universitaires", "Épisodes podcast (étudiants, profs, chercheurs)", "Enregistrement de cours & archivage numérique", "Production de vidéos promotionnelles"],
  },
  image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&q=80",
  // Monthly partnership — for universities that prefer a continuous engagement
  // rather than a per-event quote. Each tier is a flat monthly retainer for
  // the deliverables listed.
  monthlyTiers: [
    {
      id: "essential",
      monthlyPrice: 80000,
      title: { ar: "الباقة الأساسية", en: "Essential", fr: "Essentielle" },
      tagline: { ar: "بداية مثالية للجامعات", en: "Ideal entry tier", fr: "Idéal pour démarrer" },
      includes: {
        ar: ["تغطية فعاليتين في كل كلية شهريًا", "+100 صورة احترافية", "5 حلقات بودكاست شهريًا", "تسليم في 72 ساعة"],
        en: ["2 events covered per faculty / month", "100+ professional photos", "5 podcast episodes / month", "72-hour delivery"],
        fr: ["2 événements couverts par faculté / mois", "100+ photos professionnelles", "5 épisodes de podcast / mois", "Livraison 72h"],
      },
    },
    {
      id: "campus",
      monthlyPrice: 140000,
      title: { ar: "باقة الحرم", en: "Campus", fr: "Campus" },
      tagline: { ar: "الأكثر طلبًا — حضور رقمي ثابت", en: "Most popular — full digital presence", fr: "Le plus populaire" },
      includes: {
        ar: ["تغطية 4 فعاليات في كل كلية شهريًا", "200 صورة احترافية", "12 حلقة بودكاست شهريًا", "تصوير محاضرة كل أسبوع", "تسليم في 24 ساعة للريلز"],
        en: ["4 events covered per faculty / month", "200 professional photos", "12 podcast episodes / month", "Weekly lecture recording", "24-hour reel turnaround"],
        fr: ["4 événements couverts par faculté / mois", "200 photos professionnelles", "12 épisodes de podcast / mois", "Cours filmé chaque semaine", "Reels en 24h"],
      },
    },
    {
      id: "flagship",
      monthlyPrice: 200000,
      title: { ar: "الباقة الرائدة", en: "Flagship", fr: "Flagship" },
      tagline: { ar: "غرفة إعلام داخل الجامعة", en: "Your in-house media room", fr: "Votre salle média intégrée" },
      includes: {
        ar: ["تغطية أي فعالية خلال الشهر — بلا حدود", "300 صورة احترافية", "20 حلقة بودكاست شهريًا", "أرشفة كاملة للمحاضرات", "فيلم ترويجي فصلي", "مدير حساب مخصص"],
        en: ["Any event during the month — unlimited", "300 professional photos", "20 podcast episodes / month", "Full lecture archive", "Quarterly hero film", "Dedicated account manager"],
        fr: ["Tout événement durant le mois — illimité", "300 photos professionnelles", "20 épisodes de podcast / mois", "Archive complète des cours", "Film phare trimestriel", "Chargé de compte dédié"],
      },
    },
  ],
  contractTerms: {
    ar: ["عقد شهري قابل للتجديد", "إمكانية الإيقاف بإشعار 30 يومًا", "خصم 10% للالتزام السنوي", "فاتورة رسمية مطابقة لمعايير الإدارة الجزائرية"],
    en: ["Renewable monthly contract", "Cancel with 30-day notice", "10% off for an annual commitment", "Official invoice compliant with Algerian admin standards"],
    fr: ["Contrat mensuel renouvelable", "Résiliation avec préavis 30 jours", "-10% pour un engagement annuel", "Facture officielle conforme à l'administration algérienne"],
  },
};
