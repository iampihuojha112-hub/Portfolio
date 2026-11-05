-- 0003_storage.sql : one public-read bucket, admin-only writes.
-- Files use random UUID names. Draft assets are not listable, but anyone holding
-- the exact URL could fetch it (see README "Storage model").
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('portfolio', 'portfolio', true, 10485760,
  array['image/jpeg','image/png','image/webp','image/avif','application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No SELECT policy for anon => the bucket cannot be listed; public URLs still resolve.
create policy "admin read portfolio" on storage.objects for select to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());
create policy "admin insert portfolio" on storage.objects for insert to authenticated
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admin update portfolio" on storage.objects for update to authenticated
  using (bucket_id = 'portfolio' and public.is_admin())
  with check (bucket_id = 'portfolio' and public.is_admin());
create policy "admin delete portfolio" on storage.objects for delete to authenticated
  using (bucket_id = 'portfolio' and public.is_admin());
