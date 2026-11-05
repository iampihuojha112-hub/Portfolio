// Single source of truth for admin forms AND server-side validation.
import type { UploadKind } from "@/lib/storage";

export type FieldType =
  | "text" | "textarea" | "slug" | "url" | "date" | "number" | "select" | "tags" | "boolean" | "file" | "relation";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  max?: number;
  min?: number;
  step?: number;
  options?: { value: string; label: string }[];
  uploadKind?: UploadKind;
  relation?: { table: string; labelField: string };
  allowMailto?: boolean;
}

export interface ChildDef { table: string; label: string; fk: string }

export interface TableDef {
  table: string;
  title: string;
  singular: string;
  titleField: string;
  subtitleField?: string;
  fields: FieldDef[];
  hasStatus: boolean;
  fileFields: string[];
  children?: ChildDef[];
  parentFk?: string;
  /** sections shown in the admin sidebar route /admin/<section> */
}

const opt = (...v: [string, string][]) => v.map(([value, label]) => ({ value, label }));

export const PARTICIPATION_OPTIONS = opt(
  ["participant", "Participant"], ["finalist", "Finalist"], ["winner", "Winner"],
  ["first_place", "1st Place"], ["second_place", "2nd Place"], ["third_place", "3rd Place"], ["other", "Other"],
);

export const TABLES: Record<string, TableDef> = {
  education: {
    table: "education", title: "Education", singular: "education entry", titleField: "institution", subtitleField: "degree",
    hasStatus: true, fileFields: [],
    children: [{ table: "education_results", label: "Semester SGPA", fk: "education_id" }],
    fields: [
      { name: "institution", label: "College / University", type: "text", required: true },
      { name: "degree", label: "Degree", type: "text" },
      { name: "branch", label: "Branch / Specialization", type: "text" },
      { name: "academic_year", label: "Academic year", type: "text", help: "e.g. 2nd year" },
      { name: "start_date", label: "Start date", type: "date" },
      { name: "end_date", label: "End date", type: "date", help: "Leave empty while ongoing." },
      { name: "is_ongoing", label: "Still ongoing", type: "boolean" },
      { name: "cgpa", label: "Overall CGPA", type: "number", min: 0, max: 10, step: 0.01 },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  education_results: {
    table: "education_results", title: "Semester results", singular: "semester result", titleField: "semester",
    hasStatus: false, fileFields: [], parentFk: "education_id",
    fields: [
      { name: "semester", label: "Semester", type: "number", required: true, min: 1, max: 12, step: 1 },
      { name: "sgpa", label: "SGPA", type: "number", required: true, min: 0, max: 10, step: 0.01 },
    ],
  },
  skill_categories: {
    table: "skill_categories", title: "Skill categories", singular: "category", titleField: "name",
    hasStatus: true, fileFields: [],
    fields: [{ name: "name", label: "Category name", type: "text", required: true }],
  },
  skills: {
    table: "skills", title: "Skills", singular: "skill", titleField: "name",
    hasStatus: true, fileFields: [],
    fields: [
      { name: "name", label: "Skill", type: "text", required: true },
      { name: "category_id", label: "Category", type: "relation", required: true,
        relation: { table: "skill_categories", labelField: "name" } },
    ],
  },
  projects: {
    table: "projects", title: "Projects", singular: "project", titleField: "title", subtitleField: "category",
    hasStatus: true, fileFields: ["thumbnail_path"],
    children: [{ table: "project_images", label: "Screenshots", fk: "project_id" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", help: "Lowercase letters, numbers and dashes. Auto-generated from the title if empty." },
      { name: "category", label: "Category", type: "text" },
      { name: "intro", label: "Short introduction", type: "text", max: 300 },
      { name: "description", label: "Detailed description", type: "textarea" },
      { name: "problem", label: "Problem statement", type: "textarea" },
      { name: "solution", label: "Proposed solution", type: "textarea" },
      { name: "features", label: "Key features", type: "tags", help: "One per line." },
      { name: "technologies", label: "Technologies used", type: "tags", help: "One per line." },
      { name: "contribution", label: "My contribution", type: "textarea" },
      { name: "github_url", label: "GitHub repository URL", type: "url", help: "Leave empty if there is none. Nothing is shown for empty links." },
      { name: "demo_url", label: "Live demo URL (optional)", type: "url" },
      { name: "thumbnail_path", label: "Thumbnail", type: "file", uploadKind: "project" },
      { name: "featured", label: "Featured project", type: "boolean" },
    ],
  },
  project_images: {
    table: "project_images", title: "Screenshots", singular: "screenshot", titleField: "caption",
    hasStatus: false, fileFields: ["path"], parentFk: "project_id",
    fields: [
      { name: "path", label: "Image", type: "file", required: true, uploadKind: "project" },
      { name: "caption", label: "Caption", type: "text" },
    ],
  },
  hackathons: {
    table: "hackathons", title: "Hackathons", singular: "hackathon", titleField: "name", subtitleField: "organizer",
    hasStatus: true, fileFields: [],
    children: [
      { table: "hackathon_certificates", label: "Certificates", fk: "hackathon_id" },
      { table: "hackathon_images", label: "Event photographs", fk: "hackathon_id" },
    ],
    fields: [
      { name: "name", label: "Hackathon / event name", type: "text", required: true },
      { name: "organizer", label: "Organizer", type: "text" },
      { name: "event_date", label: "Event date", type: "date" },
      { name: "venue", label: "Venue", type: "text" },
      { name: "participation_status", label: "Participation status", type: "select", required: true, options: PARTICIPATION_OPTIONS,
        help: "Participation is never shown as an award. Pick a placement only if you actually earned one." },
      { name: "award", label: "Award / position (optional)", type: "text" },
      { name: "problem_statement", label: "Problem statement", type: "textarea" },
      { name: "project_id", label: "Linked project", type: "relation", relation: { table: "projects", labelField: "title" } },
      { name: "project_name", label: "Project name (if not in Projects)", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "details", label: "Additional details", type: "textarea" },
    ],
  },
  hackathon_certificates: {
    table: "hackathon_certificates", title: "Certificates", singular: "certificate", titleField: "title",
    hasStatus: false, fileFields: ["path"], parentFk: "hackathon_id",
    fields: [
      { name: "path", label: "Certificate (image or PDF)", type: "file", required: true, uploadKind: "hackathon-certificate" },
      { name: "title", label: "Title (optional)", type: "text" },
    ],
  },
  hackathon_images: {
    table: "hackathon_images", title: "Event photographs", singular: "photograph", titleField: "caption",
    hasStatus: false, fileFields: ["path"], parentFk: "hackathon_id",
    fields: [
      { name: "path", label: "Photograph", type: "file", required: true, uploadKind: "hackathon-photo" },
      { name: "caption", label: "Caption", type: "text" },
    ],
  },
  certifications: {
    table: "certifications", title: "Certifications & Recognition", singular: "certificate", titleField: "title", subtitleField: "issuer",
    hasStatus: true, fileFields: ["file_path"],
    fields: [
      { name: "file_path", label: "Certificate (image or PDF)", type: "file", required: true, uploadKind: "certification",
        help: "The file is all that is required. Everything below is optional." },
      { name: "title", label: "Title", type: "text" },
      { name: "issuer", label: "Issuing organization", type: "text" },
      { name: "issued_date", label: "Date", type: "date" },
      { name: "category", label: "Category", type: "text" },
      { name: "verification_url", label: "Verification URL", type: "url" },
      { name: "description", label: "Description", type: "textarea" },
    ],
  },
  interests: {
    table: "interests", title: "Beyond Coding", singular: "entry", titleField: "title", subtitleField: "category",
    hasStatus: true, fileFields: ["image_path"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "category", label: "Kind", type: "text", help: "e.g. Hobby, Creative interest, Inspiration" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image_path", label: "Image", type: "file", uploadKind: "interest" },
    ],
  },
  social_links: {
    table: "social_links", title: "Social links", singular: "link", titleField: "platform", subtitleField: "url",
    hasStatus: true, fileFields: [],
    fields: [
      { name: "platform", label: "Platform", type: "text", required: true, help: "e.g. GitHub, LinkedIn, Email, X" },
      { name: "label", label: "Display label (optional)", type: "text" },
      { name: "url", label: "URL", type: "url", required: true, allowMailto: true,
        help: "Use the full profile URL. For email use mailto:you@example.com." },
    ],
  },
};

export const SECTION_ROUTES: Record<string, string[]> = {
  education: ["education"],
  skills: ["skill_categories", "skills"],
  projects: ["projects"],
  hackathons: ["hackathons"],
  certifications: ["certifications"],
  "beyond-coding": ["interests"],
  "social-links": ["social_links"],
};

export function getTable(name: string): TableDef | null {
  return Object.prototype.hasOwnProperty.call(TABLES, name) ? TABLES[name] : null;
}
