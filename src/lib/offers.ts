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
  {
    slug: "government-institutional",
    title: { en: "Government & Institutional", fr: "Gouvernement & Institutionnel", ar: "الإنتاج الحكومي والمؤسسي" },
    tagline: { en: "Sovereign creative production for Algerian institutions.", fr: "Production créative souveraine pour les institutions algériennes.", ar: "إنتاج إعلامي سيادي للمؤسسات الجزائرية." },
    description: {
      en: "End-to-end audio-visual production for ministries, public agencies, public-sector campaigns and institutional events — annual reports on film, citizen-awareness campaigns, parliamentary archives, ministerial communication films and official ceremony coverage. Compliant with Algerian administrative and procurement standards.",
      fr: "Production audiovisuelle complète pour les ministères, agences publiques, campagnes de service public et événements institutionnels — rapports annuels filmés, campagnes de sensibilisation, archives parlementaires, films de communication ministérielle et couverture de cérémonies officielles. Conforme aux normes administratives algériennes.",
      ar: "إنتاج سمعي بصري متكامل للوزارات والهيئات العمومية والحملات الحكومية والفعاليات المؤسسية — تقارير سنوية مصوّرة، حملات توعية للمواطنين، أرشفة جلسات برلمانية، أفلام التواصل الوزاري وتغطية المراسم الرسمية. مع التزام تام بالمعايير الإدارية الجزائرية.",
    },
    features: {
      en: ["Annual-report film production", "Citizen-awareness campaigns", "Ministerial communication films", "Parliamentary & policy archives", "Official-event coverage with protocol crew"],
      fr: ["Films de rapport annuel", "Campagnes de sensibilisation citoyenne", "Films de communication ministérielle", "Archives parlementaires & politiques", "Couverture protocolaire d'événements officiels"],
      ar: ["إنتاج أفلام التقارير السنوية", "حملات توعية للمواطنين", "أفلام التواصل الوزاري", "أرشفة الجلسات البرلمانية والسياسات العامة", "تغطية الفعاليات الرسمية مع فريق ملتزم بالبروتوكول"],
    },
    process: {
      en: ["Briefing with the institutional cabinet", "Treatment & legal compliance review", "On-site production with protocol team", "Editorial review, AR/FR delivery + official invoice"],
      fr: ["Briefing avec le cabinet institutionnel", "Traitement & conformité juridique", "Production sur site avec équipe protocolaire", "Révision éditoriale, livraison AR/FR + facture officielle"],
      ar: ["جلسة عمل مع الديوان", "كتابة المعالجة ومراجعة المطابقة القانونية", "الإنتاج في الموقع مع فريق ملتزم بالبروتوكول", "المراجعة التحريرية والتسليم بالعربية/الفرنسية مع فاتورة رسمية"],
    },
    startingPrice: 25000,
    icon: "Landmark", accent: "royal",
    image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&q=80",
    pricing: { unit: "يوم تصوير", pricePerUnit: 25000, minUnits: 1, maxUnits: 10, unitLabel: "day", unitLabelPlural: "days", unitLabelAr: "يوم" },
    matchingRoles: ["Cinematographer", "Director", "Photographer", "Video Editor", "Motion Designer"],
  },
  {
    slug: "elearning-production",
    title: { en: "E-Learning & MOOC Production", fr: "Production E-Learning & MOOC", ar: "إنتاج التعليم الرقمي والمساقات" },
    tagline: { en: "Filmed lectures, animated explainers and MOOC-ready courses.", fr: "Cours filmés, explainers animés et MOOCs clé en main.", ar: "محاضرات مصوّرة وفيديوهات شرحية ومساقات إلكترونية كاملة." },
    description: {
      en: "Full e-learning production for universities, training centres and edtech startups — filmed lectures with chroma-key, animated explainers, course thumbnails, AR/FR/EN subtitling, course intros and final exam recap clips. Aligned with the MESRS digitalization mandate.",
      fr: "Production e-learning complète pour universités, centres de formation et startups edtech — cours filmés avec fond vert, explainers animés, miniatures, sous-titres AR/FR/EN, intros de cours et capsules récapitulatives. Alignée avec la mission de numérisation du MESRS.",
      ar: "إنتاج متكامل للتعليم الرقمي للجامعات ومراكز التكوين وشركات التيكنولوجيا التعليمية — محاضرات مصوّرة بتقنية الكروما، فيديوهات شرحية متحركة، صور مصغّرة، ترجمات بالعربية/الفرنسية/الإنجليزية، مقدّمات للمساقات وكبسولات مراجعة. متوافق مع مهمة الرقمنة الجامعية.",
    },
    features: {
      en: ["Studio-grade lecture filming (chroma-key)", "Animated explainer videos", "AR / FR / EN subtitling", "Course thumbnails & branding", "MOOC-ready packaging"],
      fr: ["Cours filmés en studio (fond vert)", "Vidéos explainer animées", "Sous-titres AR / FR / EN", "Miniatures & branding du cours", "Packaging prêt pour MOOC"],
      ar: ["تصوير المحاضرات في الاستوديو (كروما)", "فيديوهات شرحية متحركة", "ترجمات بالعربية والفرنسية والإنجليزية", "صور مصغّرة وتصميم العلامة", "تجهيز نهائي جاهز للمنصّات"],
    },
    process: {
      en: ["Curriculum review with the educator", "Studio recording session", "Animation & graphics layer", "Subtitles, packaging & platform-ready export"],
      fr: ["Revue du programme avec l'enseignant", "Session studio", "Couche animation & motion design", "Sous-titres, packaging & export prêt-plateforme"],
      ar: ["مراجعة المنهاج مع الأستاذ", "جلسة تصوير في الاستوديو", "إضافة الرسوم المتحركة والتصميم", "الترجمات والتجهيز والتصدير الجاهز للمنصّات"],
    },
    startingPrice: 5000,
    icon: "MonitorPlay", accent: "gold",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    pricing: { unit: "دقيقة فيديو نهائية", pricePerUnit: 5000, minUnits: 5, maxUnits: 240, unitLabel: "minute of finished video", unitLabelPlural: "minutes of finished video", unitLabelAr: "دقيقة" },
    matchingRoles: ["Cinematographer", "Video Editor", "Motion Designer", "Voice-Over Artist"],
  },
  {
    slug: "live-streaming",
    title: { en: "Live Streaming", fr: "Diffusion en direct", ar: "البث المباشر" },
    tagline: { en: "Multi-camera live coverage of conferences, ceremonies and university events.", fr: "Diffusion multi-caméras de conférences, cérémonies et événements universitaires.", ar: "تغطية مباشرة متعددة الكاميرات للمؤتمرات والمراسم والفعاليات الجامعية." },
    description: {
      en: "Real-time multi-camera streaming with live switching, lower thirds, sponsor overlays and simulcast to YouTube, Facebook, LinkedIn or a private link — purpose-built for conferences, ministerial events, university openings and graduation ceremonies. On-site directed by an experienced broadcast crew.",
      fr: "Streaming multi-caméras en temps réel avec régie live, lower thirds, habillage sponsors et simulcast YouTube/Facebook/LinkedIn ou lien privé — pensé pour les conférences, événements ministériels, ouvertures universitaires et cérémonies de remise de diplômes.",
      ar: "بث مباشر متعدد الكاميرات مع تبديل لحظي، شارات سفلية، علامات الرعاة، وبث متزامن على يوتيوب وفيسبوك ولينكدإن أو رابط خاص — مصمّم للمؤتمرات والفعاليات الوزارية والافتتاحات الجامعية وحفلات التخرج. يديره فريق ميداني متخصّص في البث المباشر.",
    },
    features: {
      en: ["3+ camera live switching", "Branded lower thirds & overlays", "Simulcast to YouTube / Facebook / LinkedIn", "Recorded archive (4K)", "On-site stream director"],
      fr: ["Régie live 3+ caméras", "Lower thirds & habillage marque", "Simulcast YouTube / Facebook / LinkedIn", "Archive enregistrée (4K)", "Directeur de stream sur site"],
      ar: ["تبديل مباشر بين 3 كاميرات أو أكثر", "شارات سفلية وعناصر تصميم بالعلامة", "بث متزامن على يوتيوب وفيسبوك ولينكدإن", "أرشيف مسجّل بدقة 4K", "مدير بث ميداني"],
    },
    process: {
      en: ["Pre-event tech walkthrough", "Cameras & encoder setup", "Live event direction", "Archive delivery + highlight cutdown"],
      fr: ["Repérage technique pré-événement", "Installation caméras & encodeurs", "Direction live", "Livraison de l'archive + best-of"],
      ar: ["زيارة تقنية قبل الفعالية", "تركيب الكاميرات والمشفّرات", "إدارة البث المباشر", "تسليم الأرشيف وملخّص اللحظات"],
    },
    startingPrice: 12000,
    icon: "Radio", accent: "royal",
    image: "https://images.unsplash.com/photo-1540304453527-62f979142a17?w=800&q=80",
    pricing: { unit: "ساعة بث مباشر", pricePerUnit: 12000, minUnits: 1, maxUnits: 12, unitLabel: "live hour", unitLabelPlural: "live hours", unitLabelAr: "ساعة" },
    matchingRoles: ["Cinematographer", "Director", "Sound Designer"],
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
 * Studio's BaridiMob account where clients send the 10% advance and the
 * remaining balance. Hardcoded here so it's the single source of truth
 * across the wizard, the client portal, and the printed contract.
 */
export const STUDIO_BARIMOB = {
  account: "007999990029553196",
  key: "73",
  holder: "North Pixel Studio",
} as const;

/**
 * Compute the bid-savings discount the client gets back when they pay the
 * 10% advance up-front and a creator wins the bid below the headline max.
 *
 * Discount = max(0, bidMax - winningBid), but only if `advancePaid` is true.
 * Otherwise zero.
 */
export const bidSavingsDiscount = (
  bidMax: number,
  winningBidAmount: number,
  advancePaid: boolean,
): number => {
  if (!advancePaid) return 0;
  return Math.max(0, Math.round(bidMax - winningBidAmount));
};

/**
 * Final amount the client owes for the project, after subtracting the
 * advance already paid and any bid-savings discount they unlocked.
 *
 * Returned in absolute DA. If no bid is accepted yet, `winningBidAmount`
 * should be passed as `null` and only the advance is subtracted.
 */
export const computeClientRemaining = (
  totalPrice: number,
  advancePaid: boolean,
  advanceAmount: number,
  winningBidAmount: number | null,
  bidMax: number,
): number => {
  const advance = advancePaid ? advanceAmount : 0;
  const discount = winningBidAmount !== null ? bidSavingsDiscount(bidMax, winningBidAmount, advancePaid) : 0;
  return Math.max(0, Math.round(totalPrice - advance - discount));
};

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

/** Bundle lookup by slug. Returns `undefined` if the slug doesn't match a known
 *  bundle (e.g. legacy data referencing a removed bundle). */
export const getBundle = (slug: string) => BUNDLES.find((b) => b.slug === slug);

/** Find a tier within a bundle. Returns `undefined` if either lookup fails. */
export const getBundleTier = (bundleSlug: string, tierId: string) => {
  const b = getBundle(bundleSlug);
  if (!b) return undefined;
  return b.monthlyTiers.find((t) => t.id === tierId);
};

// ─── Monthly partnership bundles ───────────────────────────────────────────
// Each bundle is a sustained B2B retainer (vs. one-off project posts) for
// a target industry vertical. Rendered side-by-side on the home page.
export type Bundle = {
  slug: string;
  /** Lucide icon name used as the bundle's visual sigil. */
  icon: string;
  /** Audience tag shown above the headline. */
  badge: { ar: string; en: string; fr: string };
  /** Short slogan / mission statement. */
  slogan: { ar: string; en: string; fr: string };
  /** Hero headline for the bundle section. */
  headline: { ar: string; en: string; fr: string };
  /** High-level deliverables ("what's included") shown above the tier grid. */
  includes: { ar: string[]; en: string[]; fr: string[] };
  /** Background image (Unsplash, lazy-loaded). */
  image: string;
  /** 3 monthly tiers — middle one is highlighted as "most popular". */
  monthlyTiers: Array<{
    id: string;
    monthlyPrice: number;
    title: { ar: string; en: string; fr: string };
    tagline: { ar: string; en: string; fr: string };
    includes: { ar: string[]; en: string[]; fr: string[] };
  }>;
  /** Contract / billing fine-print bullets. */
  contractTerms: { ar: string[]; en: string[]; fr: string[] };
};

export const UNIVERSITY_BUNDLE: Bundle = {
  // Slug kept as "university" so existing /#university nav links in
  // SiteHeader and SiteFooter continue to anchor here after the refactor.
  slug: "university",
  icon: "GraduationCap",
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

// ─── Hospitality & tourism bundle ───────────────────────────────────────────
// Targets hotels, riads, restaurants and tour operators — aligns with the
// national tourism push and is one of the highest-demand creative verticals
// in Algeria.
export const HOSPITALITY_BUNDLE: Bundle = {
  slug: "hospitality-bundle",
  icon: "Hotel",
  badge: { ar: "عرض الفنادق والسياحة", en: "Hospitality & Tourism Offer", fr: "Offre Hôtellerie & Tourisme" },
  slogan: { ar: "تعزيز الحضور الرقمي للفنادق والمطاعم والوكالات السياحية الجزائرية", en: "Powering the digital presence of Algerian hotels, restaurants and tour operators", fr: "Pour renforcer la présence digitale des hôtels, restaurants et agences touristiques algériens" },
  headline: { ar: "نقدّم لكم باقة شهرية من المحتوى البصري الفاخر — صور وريلز وجولات افتراضية ترفع من قيمة منشأتكم وتجذب المزيد من النزلاء.", en: "A monthly premium-content package — photos, reels and virtual tours that lift your venue's prestige and bring in more guests.", fr: "Un package mensuel de contenu premium — photos, reels et visites virtuelles qui élèvent le prestige de votre établissement et attirent plus de clients." },
  includes: {
    ar: ["جلسات تصوير دورية للغرف والقاعات والمطاعم", "ريلز شهرية لشبكات التواصل", "جولة افتراضية 360°", "أفلام ترويجية فصلية", "تغطية الفعاليات الخاصة"],
    en: ["Recurring shoots for rooms, halls and restaurants", "Monthly reels for social media", "360° virtual tour", "Quarterly promotional films", "Coverage of private events"],
    fr: ["Séances photo régulières (chambres, salles, restaurants)", "Reels mensuels pour les réseaux sociaux", "Visite virtuelle 360°", "Films promotionnels trimestriels", "Couverture des événements privés"],
  },
  image: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=800&q=80",
  monthlyTiers: [
    {
      id: "boutique",
      monthlyPrice: 60000,
      title: { ar: "باقة بوتيك", en: "Boutique", fr: "Boutique" },
      tagline: { ar: "للفنادق الصغيرة والمطاعم", en: "For boutique hotels & restaurants", fr: "Pour hôtels boutique & restaurants" },
      includes: {
        ar: ["جلسة تصوير شهرية واحدة", "4 ريلز للسوشيال", "20 صورة معدّلة", "تسليم في 72 ساعة"],
        en: ["1 monthly photoshoot", "4 social reels", "20 retouched photos", "72-hour delivery"],
        fr: ["1 séance photo mensuelle", "4 reels social", "20 photos retouchées", "Livraison 72h"],
      },
    },
    {
      id: "standard",
      monthlyPrice: 110000,
      title: { ar: "باقة قياسية", en: "Standard", fr: "Standard" },
      tagline: { ar: "الأكثر طلبًا — حضور رقمي ثابت", en: "Most popular — full digital presence", fr: "Le plus populaire" },
      includes: {
        ar: ["جلستا تصوير شهريتان", "8 ريلز للسوشيال", "50 صورة معدّلة", "فيلم ترويجي مصغّر شهريًا", "تسليم في 48 ساعة"],
        en: ["2 monthly photoshoots", "8 social reels", "50 retouched photos", "Monthly mini promo film", "48-hour delivery"],
        fr: ["2 séances photo mensuelles", "8 reels social", "50 photos retouchées", "Mini film promo mensuel", "Livraison 48h"],
      },
    },
    {
      id: "premier",
      monthlyPrice: 180000,
      title: { ar: "باقة بريمير", en: "Premier", fr: "Premier" },
      tagline: { ar: "غرفة محتوى داخل المنشأة", en: "Your in-house content room", fr: "Votre salle contenu intégrée" },
      includes: {
        ar: ["4 جلسات تصوير شهريًا", "16 ريلز للسوشيال", "100 صورة معدّلة", "جولة افتراضية 360° سنوية", "فيلم ترويجي فصلي", "مدير حساب مخصص"],
        en: ["4 monthly photoshoots", "16 social reels", "100 retouched photos", "Annual 360° virtual tour", "Quarterly hero film", "Dedicated account manager"],
        fr: ["4 séances photo mensuelles", "16 reels social", "100 photos retouchées", "Visite 360° annuelle", "Film phare trimestriel", "Chargé de compte dédié"],
      },
    },
  ],
  contractTerms: {
    ar: ["عقد شهري قابل للتجديد", "إمكانية الإيقاف بإشعار 30 يومًا", "خصم 10% للالتزام السنوي", "فاتورة رسمية"],
    en: ["Renewable monthly contract", "Cancel with 30-day notice", "10% off for an annual commitment", "Official invoice"],
    fr: ["Contrat mensuel renouvelable", "Résiliation avec préavis 30 jours", "-10% pour un engagement annuel", "Facture officielle"],
  },
};

// ─── SME / startup starter bundle ──────────────────────────────────────────
// Targets small Algerian businesses, shops, e-commerce and indie pros looking
// to professionalize their content with a low entry-point. Job-creation lever:
// every SME on the platform = sustained work for creators across all wilayas.
export const SME_STARTER_BUNDLE: Bundle = {
  slug: "sme-starter-bundle",
  icon: "Rocket",
  badge: { ar: "عرض المؤسسات الصغيرة والشركات الناشئة", en: "SME & Startup Offer", fr: "Offre PME & Startups" },
  slogan: { ar: "بداية احترافية للأعمال الصغيرة والمشاريع الناشئة في الجزائر", en: "A professional launchpad for Algerian small businesses and startups", fr: "Un tremplin professionnel pour les PME et startups algériennes" },
  headline: { ar: "نمنح المشاريع الناشئة بداية بصرية احترافية — هوية واضحة ومحتوى منتظم بأسعار في متناول الجميع.", en: "A professional visual launch for early-stage businesses — clean identity and steady content at an entry-level price.", fr: "Un démarrage visuel professionnel — identité claire et contenu régulier à un tarif accessible." },
  includes: {
    ar: ["تصميم الشعار ودليل الهوية البصرية", "صور المنتجات / الخدمات", "ريلز شهرية للسوشيال", "حملات إعلانية قصيرة", "متابعة استشارية"],
    en: ["Logo & brand book", "Product / service photography", "Monthly social reels", "Short ad campaigns", "Strategic content advisory"],
    fr: ["Logo & charte graphique", "Photos produits / services", "Reels mensuels", "Campagnes pub courtes", "Conseil contenu stratégique"],
  },
  image: "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80",
  monthlyTiers: [
    {
      id: "launch",
      monthlyPrice: 40000,
      title: { ar: "باقة الإطلاق", en: "Launch", fr: "Lancement" },
      tagline: { ar: "كل ما تحتاجه للانطلاق", en: "Everything to get started", fr: "Tout pour démarrer" },
      includes: {
        ar: ["تصميم شعار ودليل بسيط للهوية", "10 صور للمنتجات / الخدمة", "ريلز واحد للسوشيال", "تسليم في 7 أيام"],
        en: ["Logo + light brand guide", "10 product / service photos", "1 social reel", "7-day delivery"],
        fr: ["Logo + mini charte", "10 photos produit / service", "1 reel social", "Livraison 7 jours"],
      },
    },
    {
      id: "growth",
      monthlyPrice: 85000,
      title: { ar: "باقة النمو", en: "Growth", fr: "Croissance" },
      tagline: { ar: "الأكثر طلبًا — محتوى منتظم", en: "Most popular — regular content", fr: "Le plus populaire" },
      includes: {
        ar: ["جلسة تصوير شهرية", "20 صورة معدّلة", "4 ريلز للسوشيال", "إعلان قصير شهري", "تسليم في 5 أيام"],
        en: ["1 monthly photoshoot", "20 retouched photos", "4 social reels", "1 short monthly ad", "5-day delivery"],
        fr: ["1 séance photo mensuelle", "20 photos retouchées", "4 reels social", "1 pub courte mensuelle", "Livraison 5 jours"],
      },
    },
    {
      id: "scale",
      monthlyPrice: 150000,
      title: { ar: "باقة التوسّع", en: "Scale", fr: "Scale" },
      tagline: { ar: "للنمو السريع وحملات السوشيال", en: "For fast growth & paid campaigns", fr: "Croissance rapide & campagnes" },
      includes: {
        ar: ["جلستا تصوير شهريتان", "40 صورة معدّلة", "8 ريلز للسوشيال", "حملة إعلانية شهرية", "تقرير أداء شهري", "تسليم في 3 أيام"],
        en: ["2 monthly photoshoots", "40 retouched photos", "8 social reels", "1 ad campaign / month", "Monthly performance report", "3-day delivery"],
        fr: ["2 séances photo mensuelles", "40 photos retouchées", "8 reels social", "1 campagne pub / mois", "Rapport mensuel", "Livraison 3 jours"],
      },
    },
  ],
  contractTerms: {
    ar: ["عقد شهري قابل للتجديد", "إمكانية الإيقاف بإشعار 14 يومًا", "خصم 10% للالتزام السنوي", "فاتورة رسمية"],
    en: ["Renewable monthly contract", "Cancel with 14-day notice", "10% off for an annual commitment", "Official invoice"],
    fr: ["Contrat mensuel renouvelable", "Résiliation avec préavis 14 jours", "-10% pour un engagement annuel", "Facture officielle"],
  },
};

/** All monthly bundles, in display order. The home page renders these
 *  side-by-side, each with the same layout as the original university bundle. */
export const BUNDLES: Bundle[] = [UNIVERSITY_BUNDLE, HOSPITALITY_BUNDLE, SME_STARTER_BUNDLE];
