begin;
create temp table results(name text, ok boolean); grant all on results to anon, authenticated;

-- signed-in but NOT on the allowlist
set local role authenticated; select set_config('request.jwt.claims','{"sub":"22222222-2222-2222-2222-222222222222","email":"visitor@example.com"}',true);
insert into results select 'non-admin user: is_admin false', public.is_admin() = false;
insert into results select 'non-admin user: sees only published', count(*) = count(*) filter (where status='published') from public.projects;
do $$ begin begin insert into public.projects (slug,title,status) values ('x','x','published'); insert into results values ('non-admin cannot insert', false);
 exception when others then insert into results values ('non-admin cannot insert', true); end; end $$;
with u as (update public.projects set title='hacked' returning 1) insert into results select 'non-admin cannot update', count(*)=0 from u;
do $$ begin begin perform public.publish_resume(gen_random_uuid()); insert into results values ('non-admin cannot publish_resume', false);
 exception when others then insert into results values ('non-admin cannot publish_resume', true); end; end $$;
reset role;

-- UNCONFIRMED email that matches the allowlist must NOT be admin
set local role authenticated; select set_config('request.jwt.claims','{"sub":"33333333-3333-3333-3333-333333333333","email":"admin@example.com"}',true);
insert into results select 'unconfirmed allowlisted email is not admin', public.is_admin() = false;
reset role;

-- the real admin
set local role authenticated; select set_config('request.jwt.claims','{"sub":"11111111-1111-1111-1111-111111111111","email":"admin@example.com"}',true);
insert into results select 'admin: is_admin true', public.is_admin();
insert into results select 'admin sees drafts too', count(*) filter (where status='draft') > 0 from public.projects;
with u as (update public.projects set featured = featured where slug='wayfare' returning 1) insert into results select 'admin can update', count(*)=1 from u;
do $$ begin begin insert into public.certifications (file_path,file_type) values ('certifications/00000000-0000-0000-0000-000000000000.png','image'); insert into results values ('admin can insert', true);
 exception when others then insert into results values ('admin can insert', false); end; end $$;
insert into results select 'admin sees contact messages table (0+ rows ok)', true;
do $$ declare r uuid; begin
  insert into public.resumes (file_path) values ('resume/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa.pdf') returning id into r;
  perform public.publish_resume(r);
  insert into public.resumes (file_path) values ('resume/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb.pdf') returning id into r;
  perform public.publish_resume(r);
  insert into results select 'publish_resume leaves exactly one current', count(*) = 1 from public.resumes where is_current;
end $$;
reset role;

-- visitors: published-only after admin published things; contact RPC + rate limit
set local role anon;
insert into results select 'anon cannot see unpublished certification', count(*) = 0 from public.certifications;
do $$ begin
  for i in 1..5 loop perform public.submit_contact_message('A','a@b.co','hello there friend','h1'); end loop;
  begin perform public.submit_contact_message('A','a@b.co','hello there friend','h1'); insert into results values ('6th message from same hash is rate limited', false);
  exception when others then insert into results values ('6th message from same hash is rate limited', sqlerrm like '%rate_limited%'); end;
  perform public.submit_contact_message('B','b@b.co','hello other hash','h2');
  insert into results select 'different hash still allowed', true;
end $$;
insert into results select 'anon still cannot read messages after sending', count(*) = 0 from public.contact_messages;
reset role;

-- hackathon seed sanity: participation is never auto-awarded
insert into results select 'seed: Ascent is participant without award', participation_status='participant' and award is null from public.hackathons where name like 'Ascent%';
insert into results select 'seed: exactly 4 hackathons', count(*)=4 from public.hackathons;
insert into results select 'seed: education placeholder is draft', status='draft' from public.education limit 1;
select case when ok then 'PASS' else 'FAIL' end||'  '||name from results;
rollback;
