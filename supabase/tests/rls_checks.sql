-- rls_checks.sql : run in the Supabase SQL editor (or any Postgres with the schema applied) AFTER
-- creating your admin user. Every line should print "PASS". Uses a temporary non-admin identity.
-- NOTE: runs inside a transaction that is rolled back; no data is changed.
begin;
create temp table results(name text, ok boolean);
grant all on results to anon, authenticated;

-- ---------- anonymous visitor ----------
set local role anon;
insert into results select 'anon sees only published projects', count(*) = count(*) filter (where status = 'published') and count(*) > 0 from public.projects;
insert into results select 'anon cannot see draft education', count(*) = 0 from public.education;
insert into results select 'anon cannot read contact messages', count(*) = 0 from public.contact_messages;
do $$ begin
  begin insert into public.projects (slug, title, status) values ('hax', 'x', 'published'); insert into results values ('anon cannot insert project', false);
  exception when others then insert into results values ('anon cannot insert project', true); end;
end $$;
insert into results select 'anon cannot read admin_users', count(*) = 0 from public.admin_users;
with u as (update public.projects set title = 'hacked' returning 1) insert into results select 'anon cannot update projects', count(*) = 0 from u;
with d as (delete from public.hackathons returning 1) insert into results select 'anon cannot delete hackathons', count(*) = 0 from d;
insert into results select 'anon is not admin', public.is_admin() = false;
reset role;
commit;
select name, case when ok then 'PASS' else 'FAIL' end from results;
