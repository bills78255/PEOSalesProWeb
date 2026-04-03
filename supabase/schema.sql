create extension if not exists pgcrypto;

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);

insert into public.roles (slug, name, description)
values
  ('admin', 'Admin', 'Full access to users, content, and admin tools'),
  ('rep', 'Rep', 'Core sales enablement access'),
  ('franchisee', 'Franchisee', 'Core franchise access')
on conflict (slug) do nothing;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role_id uuid not null references public.roles(id),
  company_name text not null default '',
  title text not null default '',
  territory text not null default '',
  avatar_url text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_role_id uuid;
begin
  select id into default_role_id
  from public.roles
  where slug = 'rep'
  limit 1;

  insert into public.profiles (id, email, full_name, role_id)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    default_role_id
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(nullif(excluded.full_name, ''), public.profiles.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  summary text not null default '',
  content jsonb not null default '{}'::jsonb,
  quiz jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score numeric(5,2) not null default 0,
  total_questions integer not null default 0,
  correct_answers integer not null default 0,
  submitted_at timestamptz not null default now()
);

create table if not exists public.scripts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'general',
  summary text not null default '',
  content text not null default '',
  is_published boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null default '',
  body text not null default '',
  cover_image_url text not null default '',
  status text not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  title text not null,
  summary text not null default '',
  details text not null default '',
  opportunity_id uuid,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  account_name text not null,
  contact_name text not null default '',
  contact_email text not null default '',
  stage text not null default 'new',
  source text not null default '',
  estimated_payroll numeric(12,2),
  estimated_headcount integer,
  estimated_value numeric(12,2),
  close_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calculator_settings (
  id uuid primary key default gen_random_uuid(),
  calculator_type text not null,
  label text not null,
  settings jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (calculator_type, label)
);

alter table public.roles enable row level security;
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.quiz_results enable row level security;
alter table public.scripts enable row level security;
alter table public.articles enable row level security;
alter table public.wins enable row level security;
alter table public.opportunities enable row level security;
alter table public.calculator_settings enable row level security;

create or replace function public.current_role_slug()
returns text
language sql
stable
as $$
  select r.slug
  from public.profiles p
  join public.roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

create policy "roles readable by authenticated users"
on public.roles for select
to authenticated
using (true);

create policy "profiles readable by authenticated users"
on public.profiles for select
to authenticated
using (true);

create policy "profiles insert self"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles update self or admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.current_role_slug() = 'admin')
with check (id = auth.uid() or public.current_role_slug() = 'admin');

create policy "published modules readable"
on public.modules for select
to authenticated
using (is_published = true or public.current_role_slug() = 'admin');

create policy "admin manages modules"
on public.modules for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

create policy "published lessons readable"
on public.lessons for select
to authenticated
using (is_published = true or public.current_role_slug() = 'admin');

create policy "admin manages lessons"
on public.lessons for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

create policy "users manage own quiz results"
on public.quiz_results for select
to authenticated
using (user_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "users create own quiz results"
on public.quiz_results for insert
to authenticated
with check (user_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "published scripts readable"
on public.scripts for select
to authenticated
using (is_published = true or public.current_role_slug() = 'admin');

create policy "admin manages scripts"
on public.scripts for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

create policy "published articles readable"
on public.articles for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

create policy "admin manages articles"
on public.articles for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

create policy "wins readable by authenticated users"
on public.wins for select
to authenticated
using (is_published = true or public.current_role_slug() = 'admin');

create policy "authenticated users insert wins"
on public.wins for insert
to authenticated
with check (user_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "owner or admin updates wins"
on public.wins for update
to authenticated
using (user_id = auth.uid() or public.current_role_slug() = 'admin')
with check (user_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "opportunity read access"
on public.opportunities for select
to authenticated
using (owner_id = auth.uid() or public.current_role_slug() in ('admin', 'franchisee'));

create policy "opportunity insert access"
on public.opportunities for insert
to authenticated
with check (owner_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "opportunity update access"
on public.opportunities for update
to authenticated
using (owner_id = auth.uid() or public.current_role_slug() = 'admin')
with check (owner_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "opportunity delete access"
on public.opportunities for delete
to authenticated
using (owner_id = auth.uid() or public.current_role_slug() = 'admin');

create policy "calculator settings readable"
on public.calculator_settings for select
to authenticated
using (is_active = true or public.current_role_slug() = 'admin');

create policy "admin manages calculator settings"
on public.calculator_settings for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');
