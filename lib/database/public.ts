import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { PORTFOLIO_TAG } from "@/lib/actions/revalidate";
import { EMPTY_PORTFOLIO } from "@/data/fallback";
import { byOrder, safeHref } from "@/lib/utils";
import type {
  Certification, Education, Hackathon, Interest, PortfolioData, Profile, Project, Resume, SkillCategory, SocialLink,
} from "@/types";

/**
 * Loads everything the single page needs in parallel.
 * includeDrafts=false: explicit published filter on top of RLS (defence in depth).
 * includeDrafts=true : only ever called with the admin's client from /admin/preview.
 */
export async function fetchPortfolio(client: SupabaseClient, includeDrafts: boolean): Promise<PortfolioData> {
  type Filterable = { eq(c: string, v: string): unknown; in(c: string, v: string[]): unknown };
  const visible = <Q,>(q: Q): Q => {
    const f = q as unknown as Filterable;
    return (includeDrafts ? f.in("status", ["draft", "published"]) : f.eq("status", "published")) as Q;
  };

  const [profile, education, categories, projects, hackathons, certifications, interests, links, resume] = await Promise.all([
    client.from("profiles").select("*").eq("id", 1).maybeSingle(),
    visible(client.from("education").select("*, education_results(*)")),
    visible(client.from("skill_categories").select("*, skills(*)")),
    visible(client.from("projects").select("*, project_images(*)")),
    visible(client.from("hackathons").select("*, hackathon_certificates(*), hackathon_images(*)")),
    visible(client.from("certifications").select("*")),
    visible(client.from("interests").select("*")),
    visible(client.from("social_links").select("*")),
    client.from("resumes").select("*").eq("is_current", true).eq("status", "published").maybeSingle(),
  ]);

  const firstError = [profile, education, categories, projects, hackathons, certifications, interests, links].find((r) => r.error);
  if (firstError?.error) throw new Error(`Portfolio query failed: ${firstError.error.message}`);

  const keepStatus = <T extends { status: string }>(rows: T[] | null): T[] =>
    (rows ?? []).filter((r) => includeDrafts ? r.status !== "archived" : r.status === "published");

  const edu = ((education.data ?? []) as Education[]).sort(byOrder).map((e) => ({
    ...e, education_results: (e.education_results ?? []).sort((a, b) => a.semester - b.semester),
  }));
  const cats = (keepStatus(categories.data as SkillCategory[] | null)).sort(byOrder).map((c) => ({
    ...c, skills: keepStatus(c.skills ?? []).sort(byOrder),
  })).filter((c) => c.skills.length > 0);
  const projs = (projects.data as Project[] ?? []).sort(byOrder).map((p) => ({
    ...p, project_images: (p.project_images ?? []).sort(byOrder),
  }));
  const hacks = (hackathons.data as Hackathon[] ?? []).sort(byOrder).map((h) => ({
    ...h,
    hackathon_certificates: (h.hackathon_certificates ?? []).sort(byOrder),
    hackathon_images: (h.hackathon_images ?? []).sort(byOrder),
  }));

  return {
    configured: true,
    includesDrafts: includeDrafts,
    profile: (profile.data as Profile | null) ?? EMPTY_PORTFOLIO.profile,
    education: edu,
    skillCategories: cats,
    projects: projs,
    hackathons: hacks,
    certifications: ((certifications.data ?? []) as Certification[]).sort(byOrder),
    interests: ((interests.data ?? []) as Interest[]).sort(byOrder),
    // Never render empty or non-http(s)/mailto links.
    socialLinks: ((links.data ?? []) as SocialLink[]).filter((l) => safeHref(l.url)).sort(byOrder),
    resumePath: (resume.data as Resume | null)?.file_path ?? null,
  };
}

/** Public, cached read. Revalidated on demand when the admin saves (tag: portfolio) and hourly as a safety net. */
export const getPortfolio = unstable_cache(
  async (): Promise<PortfolioData> => {
    if (!hasSupabaseEnv()) return EMPTY_PORTFOLIO;
    return fetchPortfolio(createPublicClient(), false);
  },
  ["portfolio-v1"],
  { tags: [PORTFOLIO_TAG], revalidate: 3600 },
);

export const getResumePath = unstable_cache(
  async (): Promise<string | null> => {
    if (!hasSupabaseEnv()) return null;
    const { data } = await createPublicClient().from("resumes").select("file_path").eq("is_current", true).eq("status", "published").maybeSingle();
    return (data?.file_path as string | undefined) ?? null;
  },
  ["resume-path-v1"],
  { tags: [PORTFOLIO_TAG], revalidate: 3600 },
);
