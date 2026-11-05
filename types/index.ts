export type ContentStatus = "draft" | "published" | "archived";
export type ParticipationStatus =
  | "participant" | "finalist" | "winner" | "first_place" | "second_place" | "third_place" | "other";

interface Base { id: string; created_at: string; updated_at: string }
interface Orderable { sort_order: number; status: ContentStatus }

export interface Profile {
  id: number; name: string; tagline: string | null; intro: string | null; about: string | null;
  photo_path: string | null; email: string | null; location: string | null; updated_at: string;
}
export interface EducationResult extends Base { education_id: string; semester: number; sgpa: number; sort_order: number }
export interface Education extends Base, Orderable {
  institution: string; degree: string | null; branch: string | null; academic_year: string | null;
  start_date: string | null; end_date: string | null; is_ongoing: boolean; cgpa: number | null;
  description: string | null; education_results?: EducationResult[];
}
export interface Skill extends Base, Orderable { category_id: string; name: string }
export interface SkillCategory extends Base, Orderable { name: string; skills?: Skill[] }
export interface ProjectImage extends Base { project_id: string; path: string; caption: string | null; sort_order: number }
export interface Project extends Base, Orderable {
  slug: string; title: string; intro: string | null; description: string | null; category: string | null;
  problem: string | null; solution: string | null; features: string[]; technologies: string[];
  contribution: string | null; github_url: string | null; demo_url: string | null;
  thumbnail_path: string | null; featured: boolean; project_images?: ProjectImage[];
}
export interface HackathonCertificate extends Base { hackathon_id: string; path: string; title: string | null; sort_order: number }
export interface HackathonImage extends Base { hackathon_id: string; path: string; caption: string | null; sort_order: number }
export interface Hackathon extends Base, Orderable {
  name: string; organizer: string | null; event_date: string | null; venue: string | null;
  problem_statement: string | null; project_id: string | null; project_name: string | null;
  description: string | null; participation_status: ParticipationStatus; award: string | null; details: string | null;
  hackathon_certificates?: HackathonCertificate[]; hackathon_images?: HackathonImage[];
}
export interface Certification extends Base, Orderable {
  file_path: string; file_type: "image" | "pdf"; title: string | null; description: string | null;
  issuer: string | null; issued_date: string | null; verification_url: string | null; category: string | null;
}
export interface Interest extends Base, Orderable { title: string; description: string | null; category: string | null; image_path: string | null }
export interface SocialLink extends Base, Orderable { platform: string; label: string | null; url: string }
export interface Resume extends Base { file_path: string; label: string | null; is_current: boolean; status: ContentStatus }
export interface ContactMessage { id: string; name: string; email: string; message: string; is_read: boolean; created_at: string }

export interface PortfolioData {
  configured: boolean;
  profile: Profile;
  education: Education[];
  skillCategories: SkillCategory[];
  projects: Project[];
  hackathons: Hackathon[];
  certifications: Certification[];
  interests: Interest[];
  socialLinks: SocialLink[];
  resumePath: string | null;
  includesDrafts: boolean;
}
