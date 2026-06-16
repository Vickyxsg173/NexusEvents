-- 1. Create the Storage Bucket for avatars
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true);

-- 2. Set up RLS Policies for the avatars bucket
-- Allow public viewing of all avatars
create policy "Avatar images are publicly accessible" 
on storage.objects for select 
using ( bucket_id = 'avatars' );

-- Allow logged in users to upload an avatar
create policy "Users can upload their own avatar" 
on storage.objects for insert 
with check ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to update their own avatar
create policy "Users can update their own avatar" 
on storage.objects for update 
using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );

-- Allow users to delete their own avatar
create policy "Users can delete their own avatar" 
on storage.objects for delete 
using ( bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1] );
