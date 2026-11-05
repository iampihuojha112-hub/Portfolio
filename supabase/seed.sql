-- seed.sql : ONLY information you provided. Nothing here is invented.
-- Placeholders are drafts (hidden publicly) until you fill them in via /admin.

update public.profiles set
  name = 'Pihu Ojha',
  tagline = 'Engineering student building things that are useful before they are clever.',
  intro = 'I am an engineering student who enjoys turning problems into working software. This portfolio is a living record of what I am building and learning.',
  about = 'Edit this in the admin dashboard (Profile > About). Write it in your own voice: where you study, what pulls you towards software, how you learn, and what you want to do next.'
where id = 1;

-- Education placeholder (draft): fill in real details, then publish.
insert into public.education (institution, degree, branch, is_ongoing, status, sort_order)
values ('Add your institution', null, null, true, 'draft', 0);

-- Skills (the technologies you listed; edit or remove any in /admin)
with c as (
  insert into public.skill_categories (name, sort_order) values
    ('Programming Languages', 1), ('Frontend Development', 2), ('Backend Development', 3),
    ('Databases', 4), ('Frameworks & Libraries', 5), ('Developer Tools', 6), ('Design & Other', 7)
  returning id, name
)
insert into public.skills (category_id, name, sort_order)
select c.id, s.name, s.ord from c join (values
  ('Programming Languages','C++',1), ('Programming Languages','Python',2),
  ('Programming Languages','JavaScript',3), ('Programming Languages','TypeScript',4),
  ('Frontend Development','HTML',1), ('Frontend Development','CSS',2),
  ('Frontend Development','React',3), ('Frontend Development','Next.js',4),
  ('Frontend Development','Tailwind CSS',5),
  ('Backend Development','Node.js',1), ('Backend Development','FastAPI',2),
  ('Databases','PostgreSQL',1), ('Databases','SQLite',2), ('Databases','Firebase',3),
  ('Developer Tools','Git',1), ('Developer Tools','GitHub',2),
  ('Design & Other','Canva',1)
) as s(cat, name, ord) on s.cat = c.name;

-- Projects (no URLs: add real repository / demo links in /admin)
insert into public.projects (slug, title, intro, description, category, problem, solution, features, technologies, status, featured, sort_order) values
('wayfare', 'Wayfare / The Journey',
 'An AI-powered travel planning platform.',
 'A platform that helps users plan trips and generate personalised itineraries using AI, and helps them understand the safety of places for women before they travel.',
 'AI / Travel', null, null,
 array['Personalised AI itinerary generation','Women''s safety information for places you plan to visit'],
 array['Next.js','TypeScript','Google Gemini API'],
 'published', true, 1),
('threatlens', 'ThreatLens',
 'AI-powered cyber threat intelligence platform.',
 'A cybersecurity platform that helps analyse and assess cyber threats using trained models.',
 'AI / Cybersecurity', null, null,
 array['Threat analysis and assessment using trained models'],
 array['Next.js','TypeScript','Tailwind CSS','FastAPI','Python','PostgreSQL / SQLite'],
 'published', true, 2),
('crimetrack', 'CrimeTrack',
 'Crime reporting and management system.',
 'A crime management platform with secure reporting, live maps, analytics and role-based dashboards.',
 'Full-stack', null, null,
 array['Secure reporting','Live maps','Analytics','Role-based dashboards'],
 array['React.js','Vite','Tailwind CSS','Supabase','PostgreSQL','SQL','Leaflet.js','OpenStreetMap'],
 'published', false, 3),
('calmconnect', 'CalmConnect',
 'A project related to emotional well-being and support.',
 null, 'Well-being', null, null, '{}', '{}',
 'draft', false, 4);

-- Hackathons & competitions (confirmed entries only; dates/venues left blank)
insert into public.hackathons (name, organizer, venue, project_name, participation_status, award, status, sort_order) values
('College Hackathon', 'Dataverse Club, Sapthagiri NPS University', null, 'Wayfare', 'third_place', 'Third place', 'published', 1),
('Build for Bengaluru 2026 - Namma Parishkara', 'Organized at SKIT', null, null, 'other', 'Top 4', 'published', 2),
('Ascent - BuildFlowAI', 'Organized at Scalar School of Technology', null, null, 'participant', null, 'published', 3),
('College Expo', 'CSE department', null, 'Java project', 'first_place', '1st place in Java project among all 42 sections (CSE department)', 'published', 4);

-- Authorize your admin account AFTER creating the user in Supabase Auth (see README):
-- insert into public.admin_users (email) values ('you@example.com');
