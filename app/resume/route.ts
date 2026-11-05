import { NextResponse } from "next/server";
import { getResumePath } from "@/lib/database/public";
import { publicUrl } from "@/lib/storage";

// Stable link that always points at the currently published resume.
export async function GET() {
  const url = publicUrl(await getResumePath());
  if (!url) return new NextResponse("No resume has been published yet.", { status: 404 });
  return NextResponse.redirect(url, 307);
}
