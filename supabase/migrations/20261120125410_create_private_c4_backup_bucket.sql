insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('c4-project-backups', 'c4-project-backups', false, 52428800, array['application/zip','application/json'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users can read own C4 backups" on storage.objects;
create policy "Users can read own C4 backups"
on storage.objects for select to authenticated
using (bucket_id = 'c4-project-backups' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can upload own C4 backups" on storage.objects;
create policy "Users can upload own C4 backups"
on storage.objects for insert to authenticated
with check (bucket_id = 'c4-project-backups' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can update own C4 backups" on storage.objects;
create policy "Users can update own C4 backups"
on storage.objects for update to authenticated
using (bucket_id = 'c4-project-backups' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'c4-project-backups' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "Users can delete own C4 backups" on storage.objects;
create policy "Users can delete own C4 backups"
on storage.objects for delete to authenticated
using (bucket_id = 'c4-project-backups' and (storage.foldername(name))[1] = (select auth.uid())::text);
