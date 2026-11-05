import type { PortfolioData } from "@/types";

/** Shown only when Supabase is not configured yet or the profile row is empty. Contains no claims. */
export const EMPTY_PORTFOLIO: PortfolioData = {
  configured: false,
  includesDrafts: false,
  profile: {
    id: 1, name: "Pihu Ojha", tagline: null, intro: null, about: null,
    photo_path: null, email: null, location: null, updated_at: "",
  },
  education: [], skillCategories: [], projects: [], hackathons: [],
  certifications: [], interests: [], socialLinks: [], resumePath: null,
};
