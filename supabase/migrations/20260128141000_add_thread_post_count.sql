-- Add denormalized post_count to support sorting (popular)

alter table public.forum_threads
  add column if not exists post_count integer not null default 0;

-- Backfill counts (exclude deleted posts)
update public.forum_threads t
set post_count = coalesce(p.cnt, 0)
from (
  select thread_id, count(*)::int as cnt
  from public.forum_posts
  where is_deleted = false
  group by thread_id
) p
where p.thread_id = t.id;

create or replace function public.forum_update_thread_post_count()
returns trigger as $$
declare
  delta int;
begin
  -- INSERT/DELETE always affects counts; UPDATE only if is_deleted flips.
  if (tg_op = 'INSERT') then
    if (new.is_deleted = false) then
      delta := 1;
    else
      delta := 0;
    end if;

    update public.forum_threads
      set post_count = greatest(post_count + delta, 0),
          last_post_at = greatest(coalesce(last_post_at, new.created_at), new.created_at)
    where id = new.thread_id;

    return new;
  elsif (tg_op = 'DELETE') then
    if (old.is_deleted = false) then
      delta := -1;
    else
      delta := 0;
    end if;

    update public.forum_threads
      set post_count = greatest(post_count + delta, 0)
    where id = old.thread_id;

    return old;
  elsif (tg_op = 'UPDATE') then
    if (old.is_deleted = false and new.is_deleted = true) then
      delta := -1;
    elsif (old.is_deleted = true and new.is_deleted = false) then
      delta := 1;
    else
      delta := 0;
    end if;

    if (delta <> 0) then
      update public.forum_threads
        set post_count = greatest(post_count + delta, 0)
      where id = new.thread_id;
    end if;

    return new;
  end if;

  return null;
end;
$$ language plpgsql;

drop trigger if exists forum_posts_update_thread_post_count on public.forum_posts;
create trigger forum_posts_update_thread_post_count
after insert or update or delete on public.forum_posts
for each row execute procedure public.forum_update_thread_post_count();

