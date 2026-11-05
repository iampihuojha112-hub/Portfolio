import SceneCanvas from "@/components/3d/SceneCanvas";
import About from "@/components/sections/About";
import BeyondCoding from "@/components/sections/BeyondCoding";
import Certifications from "@/components/sections/Certifications";
import Contact from "@/components/sections/Contact";
import EducationSection from "@/components/sections/Education";
import Hackathons from "@/components/sections/Hackathons";
import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import BackToTop from "@/components/ui/BackToTop";
import Loader from "@/components/ui/Loader";
import Nav, { type NavItem } from "@/components/ui/Nav";
import ScrollProgress from "@/components/ui/ScrollProgress";
import SmoothScroll from "@/components/ui/SmoothScroll";
import { SECTION_LABELS } from "@/data/sections";
import { findSocial, safeHref } from "@/lib/utils";
import type { PortfolioData } from "@/types";

/** The single-page experience. Sections with nothing to show are omitted (and removed from the nav). */
export default function PortfolioView({ data }: { data: PortfolioData }) {
  const { profile } = data;
  const github = safeHref(findSocial(data.socialLinks, "github")?.url);
  const linkedin = safeHref(findSocial(data.socialLinks, "linkedin")?.url);
  const emailLink = findSocial(data.socialLinks, "mail")?.url.replace(/^mailto:/i, "") ?? null;
  const email = profile.email ?? emailLink;
  const hasResume = !!data.resumePath;

  const show = {
    education: data.education.length > 0,
    skills: data.skillCategories.length > 0,
    projects: data.projects.length > 0,
    hackathons: data.hackathons.length > 0,
    certifications: data.certifications.length > 0,
    beyond: data.interests.length > 0,
  };
  const nav: NavItem[] = ["home", "about", "education", "skills", "projects", "hackathons", "certifications", "beyond", "contact"]
    .filter((id) => show[id as keyof typeof show] ?? true)
    .map((id) => ({ id, label: SECTION_LABELS[id] }));

  return (
    <div className="grain">
      <Loader name={profile.name} />
      <SmoothScroll />
      <ScrollProgress />
      <SceneCanvas />
      <Nav items={nav} />
      <main className="relative z-10">
        <Hero profile={profile} github={github} linkedin={linkedin} hasResume={hasResume} />
        <About profile={profile} />
        {show.education && <EducationSection items={data.education} />}
        {show.skills && <Skills categories={data.skillCategories} />}
        {show.projects && <Projects projects={data.projects} />}
        {show.hackathons && <Hackathons items={data.hackathons} />}
        {show.certifications && <Certifications items={data.certifications} />}
        {show.beyond && <BeyondCoding items={data.interests} />}
        <Contact name={profile.name} email={email} github={github} linkedin={linkedin} hasResume={hasResume} />
      </main>
      <BackToTop />
    </div>
  );
}
