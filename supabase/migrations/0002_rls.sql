-- 0002_rls.sql : admin check, Row Level Security, RPC functions

-- True only when the signed-in user's CONFIRMED email is on the allowlist.
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public, auth as $$
  select exists (
    select 1
    from auth.users u
    join public.admin_users a on a.email = lower(u.email)
    where u.id = auth.uid() and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users enable row level security;  -- no policies: invisible to API

-- Parent content tables with a status column
do $$
declare t text;
begin
  foreach t in array array['education','skill_categories','skills','projects','hackathons',
    'certifications','interests','social_links','resumes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format($p$create policy "public reads published" on public.%I
      for select to anon, authenticated using (status = 'published')$p$, t);
    execute format($p$create policy "admin full access" on public.%I
      for all to authenticated using (public.is_admin()) with check (public.is_admin())$p$, t);
  end loop;
end $$;

-- Profile: single public row
alter table public.profiles enable row level security;
create policy "public reads profile" on public.profiles for select to anon, authenticated using (true);
create policy "admin manages profile" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Child tables follow their parent's publication state
alter table public.education_results enable row level security;
create policy "public reads published results" on public.education_results for select to anon, authenticated
  using (exists (select 1 from public.education p where p.id = education_id and p.status = 'published'));
create policy "admin full access" on public.education_results for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.project_images enable row level security;
create policy "public reads published project images" on public.project_images for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id and p.status = 'published'));
create policy "admin full access" on public.project_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.hackathon_certificates enable row level security;
create policy "public reads published hackathon certificates" on public.hackathon_certificates for select to anon, authenticated
  using (exists (select 1 from public.hackathons p where p.id = hackathon_id and p.status = 'published'));
create policy "admin full access" on public.hackathon_certificates for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

alter table public.hackathon_images enable row level security;
create policy "public reads published hackathon images" on public.hackathon_images for select to anon, authenticated
  using (exists (select 1 from public.hackathons p where p.id = hackathon_id and p.status = 'published'));
create policy "admin full access" on public.hackathon_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Contact messages: nobody inserts directly; visitors go through submit_contact_message()
alter table public.contact_messages enable row level security;
create policy "admin full access" on public.contact_messages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.submit_contact_message(
  p_name text, p_email text, p_message text, p_ip_hash text
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_ip_hash is not null and (
    select count(*) from public.contact_messages
    where ip_hash = p_ip_hash and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  if (select count(*) from public.contact_messages where created_at > now() - interval '1 hour') >= 100 then
    raise exception 'rate_limited' using errcode = 'P0001';
  end if;
  insert into public.contact_messages (name, email, message, ip_hash)
  values (left(trim(p_name), 120), left(trim(p_email), 254), left(trim(p_message), 4000), p_ip_hash);
end $$;
revoke all on function public.submit_contact_message(text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text) to anon, authenticated;

-- Publish exactly one resume atomically (admin only)
create or replace function public.publish_resume(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.resumes set is_current = false where is_current;
  update public.resumes set is_current = true, status = 'published' where id = p_id;
end $$;
revoke all on function public.publish_resume(uuid) from public;
grant execute on function public.publish_resume(uuid) to authenticated;
