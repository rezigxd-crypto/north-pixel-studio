export type Offer = {
  slug: string;
  title: { en: string; fr: string; ar: string };
  tagline: { en: string; fr: string; ar: string };
  description: { en: string; fr: string; ar: string };
  features: { en: string[]; fr: string[]; ar: string[] };
  startingPrice: string;
  icon: string;
  accent: "royal" | "gold";
  image: string; // Unsplash URL
  pricing: {
    unit: string;
    pricePerUnit: number;
    minUnits: number;
    maxUnits: number;
    unitLabel: string;
    unitLabelPlural: string;
  };
  matchingRoles: string[];
};

export const OFFERS: Offer[] = [
  {
    slug: "cinematic-ads",
    title: { en: "Cinematic Ads", fr: "Publicités Cinématiques", ar: "إعلانات سينمائية" },
    tagline: { en: "Story-driven commercials that move people.", fr: "Des publicités narratives qui touchent les gens.", ar: "إعلانات تجارية تحرك المشاعر وتروي القصص." },
    description: {
      en: "From concept to final cut, we craft cinematic brand films and TVCs. Treatment, casting, direction, on-set production and color grading — all under one roof.",
      fr: "Du concept à la coupe finale, nous créons des films de marque cinématiques et des spots TV. Traitement, casting, direction, production sur plateau et étalonnage — tout sous un même toit.",
      ar: "من الفكرة إلى المونتاج النهائي، نصنع أفلام العلامات التجارية السينمائية والإعلانات التلفزيونية. المعالجة والإخراج والتصوير وتدرج الألوان — كل شيء تحت سقف واحد.",
    },
    features: {
      en: ["Creative direction & treatment", "Crew + equipment", "Color grading & sound mix", "Multi-format delivery"],
      fr: ["Direction créative & traitement", "Équipe + équipement", "Étalonnage & mixage son", "Livraison multi-format"],
      ar: ["الإخراج الإبداعي والمعالجة", "الطاقم والمعدات", "تدرج الألوان ومزج الصوت", "تسليم متعدد الصيغ"],
    },
    startingPrice: "من 15,000 دج",
    icon: "Film",
    accent: "gold",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    pricing: { unit: "shoot day", pricePerUnit: 15000, minUnits: 1, maxUnits: 7, unitLabel: "day", unitLabelPlural: "days" },
    matchingRoles: ["Cinematographer", "Director", "Colorist"],
  },
  {
    slug: "event-coverage",
    title: { en: "Event Coverage", fr: "Couverture d'Événements", ar: "تغطية الفعاليات" },
    tagline: { en: "Live moments captured with cinema-grade craft.", fr: "Des moments en direct capturés avec un savoir-faire cinématique.", ar: "لحظات حية مصوَّرة بجودة سينمائية." },
    description: {
      en: "Conferences, weddings, launches, festivals — multi-cam crews, drone shots and same-day social cutdowns.",
      fr: "Conférences, mariages, lancements, festivals — équipes multi-caméras, prises de drone et montages sociaux le jour même.",
      ar: "مؤتمرات وأعراس وإطلاقات ومهرجانات — طواقم متعددة الكاميرات وطائرات مسيّرة ومقاطع سريعة لوسائل التواصل.",
    },
    features: {
      en: ["Multi-camera crews", "Drone & gimbal", "Same-day reels", "Highlight + full edit"],
      fr: ["Équipes multi-caméras", "Drone & cardan", "Reels le jour même", "Highlight + montage complet"],
      ar: ["طواقم متعددة الكاميرات", "طائرة مسيّرة وجيمبال", "مقاطع في نفس اليوم", "مقطع مميز + مونتاج كامل"],
    },
    startingPrice: "من 8,000 دج",
    icon: "Calendar",
    accent: "royal",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    pricing: { unit: "event hour", pricePerUnit: 8000, minUnits: 1, maxUnits: 12, unitLabel: "hour", unitLabelPlural: "hours" },
    matchingRoles: ["Cinematographer", "Photographer"],
  },
  {
    slug: "voice-over",
    title: { en: "Voice-Over & Sound Design", fr: "Voice-Over & Design Sonore", ar: "التعليق الصوتي وتصميم الصوت" },
    tagline: { en: "Voices, music and sound that hit the right note.", fr: "Des voix, de la musique et des sons qui touchent juste.", ar: "أصوات وموسيقى ومؤثرات تصل إلى القلب." },
    description: {
      en: "Studio-recorded voice-overs in multiple languages, custom music scoring, foley, and full audio mastering.",
      fr: "Voice-overs enregistrés en studio en plusieurs langues, composition musicale sur mesure, foley et mastering audio complet.",
      ar: "تعليقات صوتية مسجلة في الاستوديو بلغات متعددة، تأليف موسيقى مخصصة، مؤثرات صوتية وإتقان صوتي كامل.",
    },
    features: {
      en: ["Native VO talent (AR/EN/FR)", "Custom score & SFX", "Mix & master", "Podcast production"],
      fr: ["Talents VO natifs (AR/EN/FR)", "Score & SFX sur mesure", "Mix & master", "Production podcast"],
      ar: ["مواهب تعليق صوتي (عربي/إنجليزي/فرنسي)", "موسيقى ومؤثرات مخصصة", "مزج وإتقان", "إنتاج البودكاست"],
    },
    startingPrice: "من 2,000 دج",
    icon: "Mic",
    accent: "gold",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&q=80",
    pricing: { unit: "30s segment", pricePerUnit: 500, minUnits: 4, maxUnits: 20, unitLabel: "× 30s", unitLabelPlural: "× 30s" },
    matchingRoles: ["Voice-Over Artist", "Sound Designer"],
  },
  {
    slug: "editing-montage",
    title: { en: "Editing & Motion Graphics", fr: "Montage & Motion Graphics", ar: "المونتاج والجرافيك المتحرك" },
    tagline: { en: "Post-production with rhythm, taste and finish.", fr: "Post-production avec rythme, goût et finition.", ar: "ما بعد الإنتاج بإيقاع وذوق واحترافية." },
    description: {
      en: "Narrative editing, kinetic typography, 2D/3D motion design, VFX and color science.",
      fr: "Montage narratif, typographie cinétique, motion design 2D/3D, VFX et science des couleurs.",
      ar: "مونتاج سردي، طباعة متحركة، تصميم حركة ثنائي وثلاثي الأبعاد، مؤثرات بصرية وعلم الألوان.",
    },
    features: {
      en: ["Narrative editing", "Motion graphics & titles", "VFX compositing", "Color science"],
      fr: ["Montage narratif", "Motion graphics & titres", "Compositing VFX", "Science des couleurs"],
      ar: ["مونتاج سردي", "جرافيك متحرك وعناوين", "دمج المؤثرات البصرية", "علم الألوان"],
    },
    startingPrice: "من 4,000 دج",
    icon: "Scissors",
    accent: "royal",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80",
    pricing: { unit: "finished minute", pricePerUnit: 4000, minUnits: 1, maxUnits: 15, unitLabel: "minute", unitLabelPlural: "minutes" },
    matchingRoles: ["Video Editor", "Motion Designer", "VFX Artist", "Colorist"],
  },
  {
    slug: "photography",
    title: { en: "Photography", fr: "Photographie", ar: "التصوير الفوتوغرافي" },
    tagline: { en: "Frames worth framing.", fr: "Des clichés qui méritent d'être encadrés.", ar: "لقطات تستحق أن تُعلَّق على الجدار." },
    description: {
      en: "Editorial, product, real estate and portrait photography. Studio or on-location, with retouching included.",
      fr: "Photographie éditoriale, produit, immobilier et portrait. Studio ou en extérieur, avec retouche incluse.",
      ar: "تصوير تحريري ومنتجات وعقارات وبورتريه. في الاستوديو أو خارجه، مع تعديل الصور.",
    },
    features: {
      en: ["Studio + location", "Product & real estate", "Editorial portraits", "Pro retouching"],
      fr: ["Studio + extérieur", "Produit & immobilier", "Portraits éditoriaux", "Retouche pro"],
      ar: ["استوديو وخارجه", "المنتجات والعقارات", "بورتريه تحريري", "تعديل احترافي"],
    },
    startingPrice: "من 3,000 دج",
    icon: "Camera",
    accent: "gold",
    image: "https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=800&q=80",
    pricing: { unit: "retouched photo", pricePerUnit: 3000, minUnits: 5, maxUnits: 100, unitLabel: "photo", unitLabelPlural: "photos" },
    matchingRoles: ["Photographer"],
  },
  {
    slug: "social-reels",
    title: { en: "Social Media Reels", fr: "Reels Réseaux Sociaux", ar: "ريلز وسائل التواصل الاجتماعي" },
    tagline: { en: "Short-form content built to travel.", fr: "Du contenu court format conçu pour voyager.", ar: "محتوى قصير مصمم للانتشار السريع." },
    description: {
      en: "Vertical-first content engineered for Reels, TikTok and Shorts — hooks, captions, trends and cadence.",
      fr: "Contenu vertical conçu pour les Reels, TikTok et Shorts — accroche, légendes, tendances et cadence.",
      ar: "محتوى رأسي مصمم لريلز وتيك توك وشورتس — خطاف، تعليقات، توجهات وإيقاع.",
    },
    features: {
      en: ["Hook-first scripting", "Vertical 9:16 edits", "Captions + sound design", "Monthly content packs"],
      fr: ["Script axé sur l'accroche", "Montages verticaux 9:16", "Légendes + design sonore", "Packs mensuels de contenu"],
      ar: ["كتابة سيناريو جذاب", "مونتاج رأسي 9:16", "تعليقات وتصميم صوتي", "حزم محتوى شهرية"],
    },
    startingPrice: "من 3,000 دج",
    icon: "Smartphone",
    accent: "royal",
    image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80",
    pricing: { unit: "reel", pricePerUnit: 3000, minUnits: 1, maxUnits: 30, unitLabel: "reel", unitLabelPlural: "reels" },
    matchingRoles: ["Video Editor", "Motion Designer", "Cinematographer"],
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
  "Cinematographer",
  "Video Editor",
  "Motion Designer",
  "Voice-Over Artist",
  "Sound Designer",
  "Photographer",
  "Director",
  "Colorist",
  "VFX Artist",
] as const;

export const ADMIN_COMMISSION = 0.20;

export const formatDZD = (n: number) =>
  `${new Intl.NumberFormat("ar-DZ").format(Math.round(n))} دج`;

export const getOffer = (slug: string) => OFFERS.find((o) => o.slug === slug);
