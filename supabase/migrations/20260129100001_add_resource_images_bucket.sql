-- Create storage bucket for resource images (cover images, inline images)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'resource-images',
  'resource-images',
  true,
  5242880, -- 5MB limit
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do nothing;

-- Allow admins to upload images
create policy "Admins can upload resource images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'resource-images'
    and public.is_forum_admin()
  );

-- Allow admins to update/delete their uploaded images
create policy "Admins can update resource images"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'resource-images'
    and public.is_forum_admin()
  )
  with check (
    bucket_id = 'resource-images'
    and public.is_forum_admin()
  );

create policy "Admins can delete resource images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'resource-images'
    and public.is_forum_admin()
  );

-- Anyone can view public resource images (bucket is public)
create policy "Public can view resource images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'resource-images');
