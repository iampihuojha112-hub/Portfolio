export const BUCKET = "portfolio";

export function publicUrl(path: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!path || !base) return null;
  const safe = path.split("/").map(encodeURIComponent).join("/");
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/${safe}`;
}

export const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif", "application/pdf": "pdf",
};
const IMAGES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MB = 1024 * 1024;

export type UploadKind =
  | "profile" | "project" | "hackathon-certificate" | "hackathon-photo"
  | "certification" | "interest" | "resume";

export const UPLOAD_RULES: Record<UploadKind, { folder: string; mimes: string[]; maxBytes: number }> = {
  profile: { folder: "profile", mimes: IMAGES, maxBytes: 5 * MB },
  project: { folder: "projects", mimes: IMAGES, maxBytes: 8 * MB },
  "hackathon-certificate": { folder: "hackathon-certificates", mimes: [...IMAGES, "application/pdf"], maxBytes: 10 * MB },
  "hackathon-photo": { folder: "hackathon-photos", mimes: IMAGES, maxBytes: 8 * MB },
  certification: { folder: "certifications", mimes: [...IMAGES, "application/pdf"], maxBytes: 10 * MB },
  interest: { folder: "interests", mimes: IMAGES, maxBytes: 8 * MB },
  resume: { folder: "resume", mimes: ["application/pdf"], maxBytes: 10 * MB },
};

export const isPdfPath = (p: string) => p.toLowerCase().endsWith(".pdf");
// Paths are generated server-side as <folder>/<uuid>.<ext>; reject anything else.
export const STORAGE_PATH_RE = /^[a-z-]+\/[0-9a-f-]{36}\.(jpg|png|webp|avif|pdf)$/;
