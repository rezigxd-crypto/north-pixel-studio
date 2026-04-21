export type Offer = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  startingPrice: string;      // display string (DZD)
  icon: string;               // lucide name
  accent: "royal" | "gold";
  // pricing rules (Algerian Dinar)
  pricing: {
    unit: string;             // e.g. "30 sec", "day", "edit", "shoot", "reel"
    pricePerUnit: number;     // DZD per unit
    minUnits: number;         // minimum
    maxUnits: number;         // slider max
    unitLabel: string;        // shown next to slider value (singular)
    unitLabelPlural: string;
  };
  // which creator roles can see / bid on this offer once approved
  matchingRoles: string[];
};

export const OFFERS: Offer[] = [
  {
    slug: "cinematic-ads",
    title: "Cinematic Ads",
    tagline: "Story-driven commercials that move people.",
    description:
      "From concept to final cut, we craft cinematic brand films and TVCs. Treatment, casting, direction, on-set production and color grading — all under one roof.",
    features: ["Creative direction & treatment", "Crew + equipment", "Color grading & sound mix", "Multi-format delivery"],
    startingPrice: "from 15,000 DA",
    icon: "Film",
    accent: "gold",
    pricing: { unit: "shoot day", pricePerUnit: 15000, minUnits: 1, maxUnits: 7, unitLabel: "day", unitLabelPlural: "days" },
    matchingRoles: ["Cinematographer", "Director", "Colorist"],
  },
  {
    slug: "event-coverage",
    title: "Event Coverage",
    tagline: "Live moments captured with cinema-grade craft.",
    description:
      "Conferences, weddings, launches, festivals — multi-cam crews, drone shots and same-day social cutdowns.",
    features: ["Multi-camera crews", "Drone & gimbal", "Same-day reels", "Highlight + full edit"],
    startingPrice: "from 8,000 DA",
    icon: "Calendar",
    accent: "royal",
    pricing: { unit: "event hour", pricePerUnit: 8000, minUnits: 1, maxUnits: 12, unitLabel: "hour", unitLabelPlural: "hours" },
    matchingRoles: ["Cinematographer", "Photographer"],
  },
  {
    slug: "voice-over",
    title: "Voice-Over & Sound Design",
    tagline: "Voices, music and sound that hit the right note.",
    description:
      "Studio-recorded voice-overs in multiple languages, custom music scoring, foley, and full audio mastering.",
    features: ["Native VO talent (AR/EN/FR)", "Custom score & SFX", "Mix & master", "Podcast production"],
    startingPrice: "from 2,000 DA",
    icon: "Mic",
    accent: "gold",
    // 500 DA / 30 sec, min 2 min = 4 units, max 10 min = 20 units
    pricing: { unit: "30s segment", pricePerUnit: 500, minUnits: 4, maxUnits: 20, unitLabel: "× 30s", unitLabelPlural: "× 30s" },
    matchingRoles: ["Voice-Over Artist", "Sound Designer"],
  },
  {
    slug: "editing-montage",
    title: "Editing & Motion Graphics",
    tagline: "Post-production with rhythm, taste and finish.",
    description:
      "Narrative editing, kinetic typography, 2D/3D motion design, VFX and color science.",
    features: ["Narrative editing", "Motion graphics & titles", "VFX compositing", "Color science"],
    startingPrice: "from 4,000 DA",
    icon: "Scissors",
    accent: "royal",
    pricing: { unit: "finished minute", pricePerUnit: 4000, minUnits: 1, maxUnits: 15, unitLabel: "minute", unitLabelPlural: "minutes" },
    matchingRoles: ["Video Editor", "Motion Designer", "VFX Artist", "Colorist"],
  },
  {
    slug: "photography",
    title: "Photography",
    tagline: "Frames worth framing.",
    description:
      "Editorial, product, real estate and portrait photography. Studio or on-location, with retouching included.",
    features: ["Studio + location", "Product & real estate", "Editorial portraits", "Pro retouching"],
    startingPrice: "from 3,000 DA",
    icon: "Camera",
    accent: "gold",
    pricing: { unit: "retouched photo", pricePerUnit: 3000, minUnits: 5, maxUnits: 100, unitLabel: "photo", unitLabelPlural: "photos" },
    matchingRoles: ["Photographer"],
  },
  {
    slug: "social-reels",
    title: "Social Media Reels",
    tagline: "Short-form content built to travel.",
    description:
      "Vertical-first content engineered for Reels, TikTok and Shorts — hooks, captions, trends and cadence.",
    features: ["Hook-first scripting", "Vertical 9:16 edits", "Captions + sound design", "Monthly content packs"],
    startingPrice: "from 3,000 DA",
    icon: "Smartphone",
    accent: "royal",
    pricing: { unit: "reel", pricePerUnit: 3000, minUnits: 1, maxUnits: 30, unitLabel: "reel", unitLabelPlural: "reels" },
    matchingRoles: ["Video Editor", "Motion Designer", "Cinematographer"],
  },
];

export const CLIENT_TYPES = [
  { value: "brand", label: "Brand / Company", icon: "Building2" },
  { value: "university", label: "University / School", icon: "GraduationCap" },
  { value: "real-estate", label: "Real Estate", icon: "Home" },
  { value: "store", label: "Store / E-commerce", icon: "ShoppingBag" },
  { value: "other", label: "Other", icon: "Sparkles" },
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

// Platform commission (admin cut) — 20% of every accepted offer
export const ADMIN_COMMISSION = 0.20;

export const formatDZD = (n: number) =>
  `${new Intl.NumberFormat("en-US").format(Math.round(n))} DA`;

export const getOffer = (slug: string) => OFFERS.find((o) => o.slug === slug);
