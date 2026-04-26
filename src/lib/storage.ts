import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import { updateUserProfile } from "./store";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult = { url: string; path: string };

export const uploadProfilePic = async (uid: string, file: File): Promise<UploadResult> => {
  if (!ALLOWED.includes(file.type)) {
    throw new Error("Only JPG / PNG / WEBP / GIF images are allowed.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 2 MB.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `profile_pics/${uid}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file, { contentType: file.type });
  const url = await getDownloadURL(storageRef);
  await updateUserProfile(uid, { profilePic: url });
  return { url, path };
};

export const removeProfilePic = async (uid: string, oldPath?: string) => {
  if (oldPath) {
    try { await deleteObject(ref(storage, oldPath)); } catch { /* silent */ }
  }
  await updateUserProfile(uid, { profilePic: "" });
};
