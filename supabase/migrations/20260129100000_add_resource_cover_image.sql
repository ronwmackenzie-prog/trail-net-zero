-- Add cover_image column to member_resources for cover images

alter table public.member_resources
  add column if not exists cover_image text;

comment on column public.member_resources.cover_image is 'URL or storage path to cover image';
