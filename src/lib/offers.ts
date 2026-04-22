export type Offer = {
  slug: string;
  title: { en: string; fr: string; ar: string };
  tagline: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  features: { en: string[]; fr: string[]; ar: string[] };
  startingPrice: string;
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
    title: { en: "Cinematic Ads", fr: "Publicités Cinématiques", ar: "إعلانات سينمائية" },
    tagline: { en: "Story-driven commercials that move people.", fr: "Des publicités narratives qui touchent les gens.", ar: "إعلانات تجارية تحرك المشاعر وتروي القصص." },
    description: { en: "From concept to final cut, we craft cinematic brand films and TVCs. Treatment, casting, direction, on-set production and color grading — all under one roof.", fr: "Du concept à la coupe finale, nous créons des films de marque cinématiques et des spots TV.", ar: "من الفكرة إلى المونتاج النهائي، نصنع أفلام العلامات التجارية السينمائية والإعلانات التلفزيونية." },
    features: { en: ["Creative direction & treatment", "Crew + equipment", "Color grading & sound mix", "Multi-format delivery"], fr: ["Direction créative & traitement", "Équipe + équipement", "Étalonnage & mixage son", "Livraison multi-format"], ar: ["الإخراج الإبداعي والمعالجة", "الطاقم والمعدات", "تدرج الألوان ومزج الصوت", "تسليم متعدد الصيغ"] },
    startingPrice: "من 15,000 دج",
    icon: "Film", accent: "gold",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    pricing: { unit: "يوم تصوير", pricePerUnit: 15000, minUnits: 1, maxUnits: 7, unitLabel: "day", unitLabelPlural: "days", unitLabelAr: "يوم" },
    matchingRoles: ["Cinematographer", "Director", "Colorist"],
  },
  {
    slug: "event-coverage",
    title: { en: "Event Coverage", fr: "Couverture d'Événements", ar: "تغطية الفعاليات" },
    tagline: { en: "Live moments captured with cinema-grade craft.", fr: "Des moments en direct capturés avec un savoir-faire cinématique.", ar: "لحظات حية مصوَّرة بجودة سينمائية." },
    description: { en: "Conferences, weddings, launches, festivals — multi-cam crews, drone shots and same-day social cutdowns.", fr: "Conférences, mariages, lancements, festivals — équipes multi-caméras, prises de drone.", ar: "مؤتمرات وأعراس وإطلاقات ومهرجانات — طواقم متعددة الكاميرات وطائرات مسيّرة." },
    features: { en: ["Multi-camera crews", "Drone & gimbal", "Same-day reels", "Highlight + full edit"], fr: ["Équipes multi-caméras", "Drone & cardan", "Reels le jour même", "Highlight + montage complet"], ar: ["طواقم متعددة الكاميرات", "طائرة مسيّرة وجيمبال", "مقاطع في نفس اليوم", "مقطع مميز + مونتاج كامل"] },
    startingPrice: "من 8,000 دج",
    icon: "Calendar", accent: "royal",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    pricing: { unit: "ساعة", pricePerUnit: 8000, minUnits: 1, maxUnits: 12, unitLabel: "hour", unitLabelPlural: "hours", unitLabelAr: "ساعة" },
    matchingRoles: ["Cinematographer", "Photographer"],
  },
  {
    slug: "voice-over",
    title: { en: "Voice-Over & Sound Design", fr: "Voice-Over & Design Sonore", ar: "التعليق الصوتي وتصميم الصوت" },
    tagline: { en: "Voices, music and sound that hit the right note.", fr: "Des voix, de la musique et des sons qui touchent juste.", ar: "أصوات وموسيقى ومؤثرات تصل إلى القلب." },
    description: { en: "Studio-recorded voice-overs in multiple languages, custom music scoring, foley, and full audio mastering.", fr: "Voice-overs enregistrés en studio en plusieurs langues, composition musicale sur mesure.", ar: "تعليقات صوتية مسجلة في الاستوديو بلغات متعددة، تأليف موسيقى مخصصة." },
    features: { en: ["Native VO talent (AR/EN/FR)", "Custom score & SFX", "Mix & master", "Podcast production"], fr: ["Talents VO natifs (AR/EN/FR)", "Score & SFX sur mesure", "Mix & master", "Production podcast"], ar: ["مواهب تعليق صوتي (عربي/إنجليزي/فرنسي)", "موسيقى ومؤثرات مخصصة", "مزج وإتقان", "إنتاج البودكاست"] },
    startingPrice: "من 2,000 دج",
    icon: "Mic", accent: "gold",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    pricing: { unit: "30 ثانية", pricePerUnit: 500, minUnits: 4, maxUnits: 20, unitLabel: "× 30s", unitLabelPlural: "× 30s", unitLabelAr: "× 30 ث" },
    matchingRoles: ["Voice-Over Artist", "Sound Designer"],
  },
  {
    slug: "editing-montage",
    title: { en: "Editing & Motion Graphics", fr: "Montage & Motion Graphics", ar: "المونتاج والجرافيك المتحرك" },
    tagline: { en: "Post-production with rhythm, taste and finish.", fr: "Post-production avec rythme, goût et finition.", ar: "ما بعد الإنتاج بإيقاع وذوق واحترافية." },
    description: { en: "Narrative editing, kinetic typography, 2D/3D motion design, VFX and color science.", fr: "Montage narratif, typographie cinétique, motion design 2D/3D, VFX.", ar: "مونتاج سردي، طباعة متحركة، تصميم حركة ثنائي وثلاثي الأبعاد، مؤثرات بصرية." },
    features: { en: ["Narrative editing", "Motion graphics & titles", "VFX compositing", "Color science"], fr: ["Montage narratif", "Motion graphics & titres", "Compositing VFX", "Science des couleurs"], ar: ["مونتاج سردي", "جرافيك متحرك وعناوين", "دمج المؤثرات البصرية", "علم الألوان"] },
    startingPrice: "من 4,000 دج",
    icon: "Scissors", accent: "royal",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    pricing: { unit: "دقيقة منتهية", pricePerUnit: 4000, minUnits: 1, maxUnits: 15, unitLabel: "minute", unitLabelPlural: "minutes", unitLabelAr: "دقيقة" },
    matchingRoles: ["Video Editor", "Motion Designer", "VFX Artist", "Colorist"],
  },
  {
    slug: "photography",
    title: { en: "Photography", fr: "Photographie", ar: "التصوير الفوتوغرافي" },
    tagline: { en: "Frames worth framing.", fr: "Des clichés qui méritent d'être encadrés.", ar: "لقطات تستحق أن تُعلَّق على الجدار." },
    description: { en: "Editorial, product, real estate and portrait photography. Studio or on-location, with retouching included.", fr: "Photographie éditoriale, produit, immobilier et portrait. Studio ou en extérieur.", ar: "تصوير تحريري ومنتجات وعقارات وبورتريه. في الاستوديو أو خارجه، مع تعديل الصور." },
    features: { en: ["Studio + location", "Product & real estate", "Editorial portraits", "Pro retouching"], fr: ["Studio + extérieur", "Produit & immobilier", "Portraits éditoriaux", "Retouche pro"], ar: ["استوديو وخارجه", "المنتجات والعقارات", "بورتريه تحريري", "تعديل احترافي"] },
    startingPrice: "من 3,000 دج",
    icon: "Camera", accent: "gold",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
    pricing: { unit: "صورة معدّلة", pricePerUnit: 3000, minUnits: 5, maxUnits: 100, unitLabel: "photo", unitLabelPlural: "photos", unitLabelAr: "صورة" },
    matchingRoles: ["Photographer"],
  },
  {
    slug: "social-reels",
    title: { en: "Social Media Reels", fr: "Reels Réseaux Sociaux", ar: "ريلز وسائل التواصل الاجتماعي" },
    tagline: { en: "Short-form content built to travel.", fr: "Du contenu court format conçu pour voyager.", ar: "محتوى قصير مصمم للانتشار السريع." },
    description: { en: "Vertical-first content engineered for Reels, TikTok and Shorts — hooks, captions, trends and cadence.", fr: "Contenu vertical conçu pour les Reels, TikTok et Shorts.", ar: "محتوى رأسي مصمم لريلز وتيك توك وشورتس — خطاف، تعليقات، توجهات." },
    features: { en: ["Hook-first scripting", "Vertical 9:16 edits", "Captions + sound design", "Monthly content packs"], fr: ["Script axé sur l'accroche", "Montages verticaux 9:16", "Légendes + design sonore", "Packs mensuels"], ar: ["كتابة سيناريو جذاب", "مونتاج رأسي 9:16", "تعليقات وتصميم صوتي", "حزم محتوى شهرية"] },
    startingPrice: "من 3,000 دج",
    icon: "Smartphone", accent: "royal",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    pricing: { unit: "ريل", pricePerUnit: 3000, minUnits: 1, maxUnits: 30, unitLabel: "reel", unitLabelPlural: "reels", unitLabelAr: "ريل" },
    matchingRoles: ["Video Editor", "Motion Designer", "Cinematographer"],
  },
  {
    slug: "ugc-content",
    title: { en: "UGC Content", fr: "Contenu UGC", ar: "محتوى UGC" },
    tagline: { en: "Authentic user-generated style content for brands.", fr: "Contenu au style UGC authentique pour les marques.", ar: "محتوى أصيل بأسلوب المستخدمين للعلامات التجارية." },
    description: { en: "Raw, authentic content that looks organic — unboxings, testimonials, lifestyle videos and review-style clips that convert.", fr: "Contenu brut et authentique — unboxings, témoignages, vidéos lifestyle et clips de type avis qui convertissent.", ar: "محتوى خام وأصيل يبدو طبيعيًا — فتح العلب والشهادات ومقاطع أسلوب الحياة." },
    features: { en: ["Organic-style filming", "Testimonials & unboxing", "Lifestyle & review clips", "Multi-platform formats"], fr: ["Tournage style organique", "Témoignages & unboxing", "Clips lifestyle & avis", "Formats multi-plateformes"], ar: ["تصوير بأسلوب طبيعي", "شهادات وفتح العلب", "مقاطع نمط الحياة", "صيغ متعددة المنصات"] },
    startingPrice: "من 5,000 دج",
    icon: "Video", accent: "gold",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
    pricing: { unit: "مقطع", pricePerUnit: 5000, minUnits: 1, maxUnits: 20, unitLabel: "clip", unitLabelPlural: "clips", unitLabelAr: "مقطع" },
    matchingRoles: ["Video Editor", "Cinematographer"],
  },
  {
    slug: "ghost-writing",
    title: { en: "Ghost Writing", fr: "Ghost Writing", ar: "كتابة المحتوى الخفي" },
    tagline: { en: "Your voice, written by professionals.", fr: "Votre voix, rédigée par des professionnels.", ar: "صوتك، كتبه المحترفون." },
    description: { en: "Scripts, captions, blog posts, newsletters and brand copy — written in your voice, ready to publish.", fr: "Scripts, légendes, articles de blog, newsletters et textes de marque — écrits dans votre voix.", ar: "سيناريوهات وتعليقات ومقالات ونشرات إخبارية ونصوص العلامة التجارية — مكتوبة بأسلوبك." },
    features: { en: ["Script writing", "Social media captions", "Blog & newsletter copy", "Brand voice guide"], fr: ["Rédaction de scripts", "Légendes réseaux sociaux", "Articles & newsletters", "Guide de voix de marque"], ar: ["كتابة السيناريو", "تعليقات وسائل التواصل", "مقالات ونشرات إخبارية", "دليل صوت العلامة التجارية"] },
    startingPrice: "من 2,500 دج",
    icon: "PenLine", accent: "royal",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    pricing: { unit: "مقال", pricePerUnit: 2500, minUnits: 1, maxUnits: 30, unitLabel: "piece", unitLabelPlural: "pieces", unitLabelAr: "مقال" },
    matchingRoles: ["Ghost Writer"],
  },
  {
    slug: "short-movie",
    title: { en: "Short Film", fr: "Court Métrage", ar: "الفيلم القصير" },
    tagline: { en: "Cinematic short films with full production.", fr: "Courts métrages cinématiques avec production complète.", ar: "أفلام قصيرة سينمائية بإنتاج كامل." },
    description: { en: "Narrative short films, mini-documentaries and branded content films with full script-to-screen production.", fr: "Courts métrages narratifs, mini-documentaires et films de contenu de marque avec production complète.", ar: "أفلام قصيرة سردية ووثائقيات مصغرة وأفلام محتوى العلامة التجارية بإنتاج كامل من السيناريو إلى الشاشة." },
    features: { en: ["Script & storyboard", "Full crew production", "Sound & music", "Festival-ready deliverables"], fr: ["Script & storyboard", "Production équipe complète", "Son & musique", "Livrables prêts pour festivals"], ar: ["سيناريو ولوحة قصة", "طاقم إنتاج كامل", "صوت وموسيقى", "نتائج جاهزة للمهرجانات"] },
    startingPrice: "من 50,000 دج",
    icon: "Clapperboard", accent: "gold",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80",
    pricing: { unit: "دقيقة فيلم", pricePerUnit: 50000, minUnits: 1, maxUnits: 15, unitLabel: "min", unitLabelPlural: "mins", unitLabelAr: "دقيقة" },
    matchingRoles: ["Director", "Cinematographer", "Video Editor"],
  },
  {
    slug: "political-coverage",
    title: { en: "Political & Association Coverage", fr: "Couverture Politique & Associative", ar: "تغطية الأحزاب السياسية والجمعيات" },
    tagline: { en: "Professional coverage for parties, NGOs and associations.", fr: "Couverture professionnelle pour partis, ONG et associations.", ar: "تغطية احترافية للأحزاب السياسية والمنظمات غير الحكومية والجمعيات." },
    description: { en: "Press conferences, political rallies, association events and official ceremonies — covered with discretion and professionalism.", fr: "Conférences de presse, rassemblements politiques, événements associatifs — couverts avec discrétion et professionnalisme.", ar: "مؤتمرات صحفية وتجمعات سياسية وفعاليات الجمعيات والحفلات الرسمية — مغطاة بحرفية ودقة." },
    features: { en: ["Press conference coverage", "Rally & event filming", "Official ceremony docs", "Multi-angle editing"], fr: ["Couverture conférence de presse", "Tournage rassemblements", "Documentation cérémonie officielle", "Montage multi-angles"], ar: ["تغطية المؤتمرات الصحفية", "تصوير التجمعات والفعاليات", "توثيق الحفلات الرسمية", "مونتاج متعدد الزوايا"] },
    startingPrice: "من 20,000 دج",
    icon: "Landmark", accent: "royal",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80",
    pricing: { unit: "يوم تغطية", pricePerUnit: 20000, minUnits: 1, maxUnits: 10, unitLabel: "day", unitLabelPlural: "days", unitLabelAr: "يوم" },
    matchingRoles: ["Cinematographer", "Photographer", "Video Editor"],
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

export const formatDZD = (n: number) =>
  `${new Intl.NumberFormat("ar-DZ").format(Math.round(n))} دج`;

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
};
