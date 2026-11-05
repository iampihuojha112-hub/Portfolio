-- 0001_schema.sql : tables, constraints, indexes, triggers
create extension if not exists "pgcrypto";

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.participation_status as enum
  ('participant', 'finalist', 'winner', 'first_place', 'second_place', 'third_place', 'other');

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- Authorized administrators (email allowlist). No policies => unreadable by API clients.
create table public.admin_users (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

-- Single-row profile
create table public.profiles (
  id smallint primary key default 1 check (id = 1),
  name text not null default 'Pihu Ojha',
  tagline text,
  intro text,
  about text,
  photo_path text,
  email text,
  location text,
  updated_at timestamptz not null default now()
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text,
  branch text,
  academic_year text,
  start_date date,
  end_date date,
  is_ongoing boolean not null default true,
  cgpa numeric(4,2) check (cgpa is null or (cgpa >= 0 and cgpa <= 10)),
  description text,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.education_results (
  id uuid primary key default gen_random_uuid(),
  education_id uuid not null references public.education(id) on delete cascade,
  semester smallint not null check (semester between 1 and 12),
  sgpa numeric(4,2) not null check (sgpa >= 0 and sgpa <= 10),
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (education_id, semester)
);

create table public.skill_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status public.content_status not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.skill_categories(id) on delete cascade,
  name text not null,
  status public.content_status not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  intro text,
  description text,
  category text,
  problem text,
  solution text,
  features text[] not null default '{}',
  technologies text[] not null default '{}',
  contribution text,
  github_url text check (github_url is null or github_url ~* '^https?://'),
  demo_url text check (demo_url is null or demo_url ~* '^https?://'),
  thumbnail_path text,
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hackathons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  organizer text,
  event_date date,
  venue text,
  problem_statement text,
  project_id uuid references public.projects(id) on delete set null,
  project_name text,
  description text,
  participation_status public.participation_status not null default 'participant',
  award text,
  details text,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hackathon_certificates (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  path text not null,
  title text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hackathon_images (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons(id) on delete cascade,
  path text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  file_type text not null check (file_type in ('image', 'pdf')),
  title text,
  description text,
  issuer text,
  issued_date date,
  verification_url text check (verification_url is null or verification_url ~* '^https?://'),
  category text,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  image_path text,
  status public.content_status not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  label text,
  url text not null check (url ~* '^(https?://|mailto:)'),
  status public.content_status not null default 'published',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  label text,
  is_current boolean not null default false,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- At most one current resume
create unique index resumes_one_current on public.resumes (is_current) where is_current;

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 4000),
  ip_hash text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- indexes
create index on public.education (status, sort_order);
create index on public.education_results (education_id);
create index on public.skill_categories (status, sort_order);
create index on public.skills (category_id, sort_order);
create index on public.projects (status, sort_order);
create index on public.project_images (project_id, sort_order);
create index on public.hackathons (status, sort_order);
create index on public.hackathon_certificates (hackathon_id, sort_order);
create index on public.hackathon_images (hackathon_id, sort_order);
create index on public.certifications (status, sort_order);
create index on public.interests (status, sort_order);
create index on public.social_links (status, sort_order);
create index on public.contact_messages (created_at desc);
create index on public.contact_messages (ip_hash, created_at);

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['profiles','education','education_results','skill_categories','skills',
    'projects','project_images','hackathons','hackathon_certificates','hackathon_images',
    'certifications','interests','social_links','resumes']
  loop
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

insert into public.profiles (id) values (1) on conflict do nothing;
