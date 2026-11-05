import Image from "next/image";
import { publicUrl } from "@/lib/storage";

/** Optimised Supabase Storage image that fills its (relatively positioned) parent. */
export default function Img({ path, alt, sizes, className, priority, fit = "cover" }:
  { path: string | null | undefined; alt: string; sizes: string; className?: string; priority?: boolean; fit?: "cover" | "contain" }) {
  const src = publicUrl(path);
  if (!src) return null;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority}
    className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className ?? ""}`} />;
}
