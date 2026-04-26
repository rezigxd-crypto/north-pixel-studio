import { updateUserProfile } from "./store";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Cloudinary cloud name. The cloud name is public (it appears in every asset URL),
// so it's safe to commit as a default. Override at build time via the env var if
// you ever migrate to a different Cloudinary account.
const DEFAULT_CLOUD_NAME = "dj03ghe2y";
const CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined)?.trim() ||
  DEFAULT_CLOUD_NAME;
const UPLOAD_PRESET = "profile_pics";

export type UploadResult = { url: string; path: string };

/**
 * Upload a profile picture to Cloudinary (unsigned upload preset).
 * Cloudinary free tier covers 25 GB storage + 25 GB bandwidth, no card required.
 * The resulting secure URL is persisted on the user's Firestore document under `profilePic`.
 *
 * Auth, Firestore, and the rest of the app remain on Firebase — only the image
 * blob lives on Cloudinary.
 */
export const uploadProfilePic = async (uid: string, file: File): Promise<UploadResult> => {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Only JPG / PNG / WEBP / GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 2 MB.");
  }
  if (!CLOUD_NAME) {
    throw new Error("Cloudinary is not configured (missing VITE_CLOUDINARY_CLOUD_NAME).");
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", `profile_pics/${uid}`);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}). ${body.slice(0, 160)}`);
  }

  const data = (await res.json()) as { secure_url?: string; public_id?: string };
  if (!data.secure_url || !data.public_id) {
    throw new Error("Cloudinary returned an unexpected response.");
  }

  await updateUserProfile(uid, { profilePic: data.secure_url });
  return { url: data.secure_url, path: data.public_id };
};

/**
 * Remove the user's profile picture reference.
 * Note: deletion of the actual Cloudinary asset requires a server-signed call
 * which we deliberately do not add (no API). The file becomes orphaned on
 * Cloudinary; the free tier is large enough that this is fine in practice.
 */
export const removeProfilePic = async (uid: string, _oldPath?: string) => {
  await updateUserProfile(uid, { profilePic: "" });
};
