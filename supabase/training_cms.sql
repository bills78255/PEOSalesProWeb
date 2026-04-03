begin;

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_role_slug()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select r.slug
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
  limit 1
$$;

create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text not null default '',
  category text not null default 'prospecting',
  cover_image_url text not null default '',
  content_url text not null default '',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainings_status_check check (status in ('draft', 'published'))
);

create table if not exists public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings(id) on delete cascade,
  title text not null,
  body text not null default '',
  video_url text,
  action_step text not null default '',
  sort_order integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_lessons_status_check check (status in ('draft', 'published'))
);

create index if not exists idx_trainings_status_sort
  on public.trainings(status, sort_order);

create index if not exists idx_training_lessons_training_status_sort
  on public.training_lessons(training_id, status, sort_order);

drop trigger if exists set_trainings_updated_at on public.trainings;
create trigger set_trainings_updated_at
before update on public.trainings
for each row execute function public.set_updated_at();

drop trigger if exists set_training_lessons_updated_at on public.training_lessons;
create trigger set_training_lessons_updated_at
before update on public.training_lessons
for each row execute function public.set_updated_at();

alter table public.trainings enable row level security;
alter table public.training_lessons enable row level security;

drop policy if exists "published trainings readable by authenticated" on public.trainings;
create policy "published trainings readable by authenticated"
on public.trainings for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "published trainings readable by anon" on public.trainings;
create policy "published trainings readable by anon"
on public.trainings for select
to anon
using (status = 'published');

drop policy if exists "admin manages trainings" on public.trainings;
create policy "admin manages trainings"
on public.trainings for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published training lessons readable by authenticated" on public.training_lessons;
create policy "published training lessons readable by authenticated"
on public.training_lessons for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "published training lessons readable by anon" on public.training_lessons;
create policy "published training lessons readable by anon"
on public.training_lessons for select
to anon
using (status = 'published');

drop policy if exists "admin manages training lessons" on public.training_lessons;
create policy "admin manages training lessons"
on public.training_lessons for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

commit;
