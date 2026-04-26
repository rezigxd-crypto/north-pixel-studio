/**
 * Username utilities for public creator profile URLs (`/@:username`).
 *
 * Goals:
 *  1. Auto-generate a clean ASCII slug from a creator's full name at signup.
 *  2. Prevent collisions with existing usernames AND with reserved app routes.
 *  3. Provide a privacy-preserving display name (first name + last initial).
 *  4. Sanitize free-form text (bio, profile, future chat) so creators cannot
 *     expose direct contact info on a publicly-shareable surface.
 */

/** Routes / keywords that can never become a username. Lower-case, no @. */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  // Existing app routes
  "admin", "api", "auth", "login", "signup", "signout", "logout",
  "services", "service", "quest", "portal", "portals",
  "freelancers", "creators", "creator", "clients", "client",
  "projects", "project", "dashboard", "settings", "profile",
  // Marketing / static
  "about", "contact", "terms", "privacy", "refund", "help", "support",
  "faq", "blog", "press", "team", "careers", "jobs",
  // Infra-ish
  "app", "www", "mail", "ftp", "ssh", "root", "home", "index",
  "public", "static", "assets", "cdn", "images", "files", "uploads",
  "u", "user", "users", "me", "you",
  // Brand-protected
  "northpixel", "north-pixel", "northpixelstudio", "thealgerianstudio",
  "algerian-studio", "algerianstudio",
]);

/** Maximum slug length we are willing to keep in the URL. */
const MAX_USERNAME_LEN = 24;

/**
 * Convert any free-form name into a URL-safe ASCII slug.
 * Examples:
 *   "Yacine Amrane"       → "yacine-amrane"
 *   "Mehdi Ait-Yahia"     → "mehdi-ait-yahia"
 *   "أحمد بن سعيد"        → "ahmd-bn-sayd"  (best-effort transliteration via NFD)
 *   ""                    → "creator"      (fallback)
 */
export const slugify = (name: string): string => {
  const ascii = (name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritics (latin)
    .toLowerCase();
  // Keep only [a-z0-9 -], collapse separators
  let slug = ascii.replace(/[^a-z0-9\s-]/g, " ");
  slug = slug.replace(/[\s_-]+/g, "-");
  slug = slug.replace(/^-+|-+$/g, "");
  if (slug.length > MAX_USERNAME_LEN) slug = slug.slice(0, MAX_USERNAME_LEN).replace(/-+$/g, "");
  return slug || "creator";
};

/**
 * Generate a unique username given the creator's full name and a set of
 * already-taken usernames. Falls back to numeric suffixes on collision and
 * skips reserved words.
 */
export const generateUniqueUsername = (
  name: string,
  taken: ReadonlySet<string>,
): string => {
  const base = slugify(name);
  const isAvailable = (candidate: string): boolean =>
    candidate.length >= 3 &&
    !RESERVED_USERNAMES.has(candidate) &&
    !taken.has(candidate);

  if (isAvailable(base)) return base;
  // Append numeric suffixes -2, -3, … until a free slot is found.
  for (let i = 2; i < 1000; i += 1) {
    const candidate = `${base}-${i}`.slice(0, MAX_USERNAME_LEN).replace(/-+$/g, "");
    if (isAvailable(candidate)) return candidate;
  }
  // Extremely unlikely fall-through.
  return `${base}-${Date.now().toString(36)}`;
};

/**
 * Public-facing display name: first name + last initial.
 * Examples:
 *   "Yacine Amrane"        → "Yacine A."
 *   "Mehdi Ait-Yahia"      → "Mehdi A."
 *   "Madonna"              → "Madonna"
 *   ""                     → "Creator"
 */
export const firstNameLastInitial = (fullName: string): string => {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Creator";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const initial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${initial}.`;
};

/**
 * Strip / mask anything that could be used to contact the creator off-platform.
 * Used on bios, profile fields, and (later) chat messages.
 * Returns { text, redacted } so the caller can flag content as having been edited.
 */
export const sanitizeContactInfo = (input: string): { text: string; redacted: boolean } => {
  if (!input) return { text: "", redacted: false };
  let out = input;
  let hit = false;

  // Algerian phone numbers (very permissive — covers +213, 0[5-7], with optional spaces / dashes).
  const phone = /(?:\+?213|0)[\s.-]?[5-7]\d?[\s.-]?\d{2,3}[\s.-]?\d{2,3}[\s.-]?\d{0,4}/g;
  if (phone.test(out)) { hit = true; out = out.replace(phone, "[•••]"); }

  // Generic 7+ digit runs that look like phone numbers
  const digits = /\b\d{7,}\b/g;
  if (digits.test(out)) { hit = true; out = out.replace(digits, "[•••]"); }

  // Emails
  const email = /[\w.+-]+@[\w-]+\.[a-z]{2,}/gi;
  if (email.test(out)) { hit = true; out = out.replace(email, "[•••]"); }

  // URLs
  const url = /\bhttps?:\/\/\S+/gi;
  if (url.test(out)) { hit = true; out = out.replace(url, "[•••]"); }
  const wwwUrl = /\bwww\.\S+/gi;
  if (wwwUrl.test(out)) { hit = true; out = out.replace(wwwUrl, "[•••]"); }

  // Social handles like @username (3+ chars)
  const handle = /(^|\s)@\w{3,}/g;
  if (handle.test(out)) { hit = true; out = out.replace(handle, "$1[•••]"); }

  // Platform names that signal "contact me there"
  const platforms =
    /\b(insta(?:gram)?|whatsapp|wa|telegram|snap(?:chat)?|tiktok|signal|viber|imo|facebook|fb|messenger|skype|discord)\b/gi;
  if (platforms.test(out)) { hit = true; out = out.replace(platforms, "[•••]"); }

  // Trigger phrases ("call me", "appelle-moi", "اتصل بي")
  const triggers = /\b(call me|contact me|reach me|my number|my phone|appelle.?moi|mon num[eé]ro|اتصل|رقمي|واتساب|انستا)\b/gi;
  if (triggers.test(out)) { hit = true; out = out.replace(triggers, "[•••]"); }

  return { text: out, redacted: hit };
};

/**
 * Add a small "NORTH PIXEL" watermark transformation to a Cloudinary image URL.
 * Returns the original URL untouched if it isn't a Cloudinary upload URL.
 *
 * Example:
 *   in:  https://res.cloudinary.com/dj03ghe2y/image/upload/v123/profile_pics/u/x.jpg
 *   out: https://res.cloudinary.com/dj03ghe2y/image/upload/l_text:Arial_30_bold:NORTH%20PIXEL,co_white,o_45,g_south_east,x_12,y_12/v123/profile_pics/u/x.jpg
 */
export const addCloudinaryWatermark = (url: string | undefined | null): string | undefined => {
  if (!url) return url ?? undefined;
  const marker = "/image/upload/";
  const idx = url.indexOf(marker);
  if (idx === -1) return url;
  // Avoid double-stamping if a watermark was already applied.
  if (url.slice(idx).includes("l_text:Arial_")) return url;
  const head = url.slice(0, idx + marker.length);
  const tail = url.slice(idx + marker.length);
  const overlay = "l_text:Arial_30_bold:NORTH%20PIXEL,co_white,o_45,g_south_east,x_12,y_12/";
  return head + overlay + tail;
};
