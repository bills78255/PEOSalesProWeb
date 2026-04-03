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

create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null default '',
  category text not null default 'peo_basics',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trainings_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.trainings(id) on delete cascade,
  title text not null,
  body text not null default '',
  action_step text not null default '',
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_lessons_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.training_lessons(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quizzes_status_check check (status in ('draft', 'published', 'archived'))
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scripts
  add column if not exists script_type text not null default 'playbook',
  add column if not exists body text not null default '',
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists is_featured boolean not null default false,
  add column if not exists status text not null default 'draft',
  add column if not exists sort_order integer not null default 0,
  add column if not exists published_at timestamptz;

update public.scripts
set body = case
  when coalesce(body, '') <> '' then body
  else coalesce(content, '')
end;

alter table public.articles
  add column if not exists preview text not null default '',
  add column if not exists category text not null default 'sales_strategy';

update public.articles
set preview = case
  when coalesce(preview, '') <> '' then preview
  else coalesce(summary, '')
end;

create index if not exists idx_trainings_status_sort on public.trainings(status, sort_order);
create index if not exists idx_training_lessons_training_status_sort on public.training_lessons(training_id, status, sort_order);
create index if not exists idx_quizzes_lesson_status_sort on public.quizzes(lesson_id, status, sort_order);
create index if not exists idx_quiz_questions_quiz_sort on public.quiz_questions(quiz_id, sort_order);
create index if not exists idx_quiz_answers_question_sort on public.quiz_answers(question_id, sort_order);
create index if not exists idx_scripts_status_sort on public.scripts(status, sort_order);
create index if not exists idx_articles_status_published on public.articles(status, published_at desc);

drop trigger if exists set_trainings_updated_at on public.trainings;
create trigger set_trainings_updated_at
before update on public.trainings
for each row execute function public.set_updated_at();

drop trigger if exists set_training_lessons_updated_at on public.training_lessons;
create trigger set_training_lessons_updated_at
before update on public.training_lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

drop trigger if exists set_quiz_questions_updated_at on public.quiz_questions;
create trigger set_quiz_questions_updated_at
before update on public.quiz_questions
for each row execute function public.set_updated_at();

drop trigger if exists set_quiz_answers_updated_at on public.quiz_answers;
create trigger set_quiz_answers_updated_at
before update on public.quiz_answers
for each row execute function public.set_updated_at();

drop trigger if exists set_scripts_updated_at on public.scripts;
create trigger set_scripts_updated_at
before update on public.scripts
for each row execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

alter table public.trainings enable row level security;
alter table public.training_lessons enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.scripts enable row level security;
alter table public.articles enable row level security;

drop policy if exists "published trainings readable" on public.trainings;
create policy "published trainings readable"
on public.trainings for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "admin manages trainings" on public.trainings;
create policy "admin manages trainings"
on public.trainings for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published training lessons readable" on public.training_lessons;
create policy "published training lessons readable"
on public.training_lessons for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "admin manages training lessons" on public.training_lessons;
create policy "admin manages training lessons"
on public.training_lessons for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published quizzes readable" on public.quizzes;
create policy "published quizzes readable"
on public.quizzes for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "admin manages quizzes" on public.quizzes;
create policy "admin manages quizzes"
on public.quizzes for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published quiz questions readable" on public.quiz_questions;
create policy "published quiz questions readable"
on public.quiz_questions for select
to authenticated
using (
  exists (
    select 1
    from public.quizzes q
    where q.id = quiz_id
      and (q.status = 'published' or public.current_role_slug() = 'admin')
  )
);

drop policy if exists "admin manages quiz questions" on public.quiz_questions;
create policy "admin manages quiz questions"
on public.quiz_questions for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published quiz answers readable" on public.quiz_answers;
create policy "published quiz answers readable"
on public.quiz_answers for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    where qq.id = question_id
      and (q.status = 'published' or public.current_role_slug() = 'admin')
  )
);

drop policy if exists "admin manages quiz answers" on public.quiz_answers;
create policy "admin manages quiz answers"
on public.quiz_answers for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published scripts readable" on public.scripts;
create policy "published scripts readable"
on public.scripts for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "admin manages scripts" on public.scripts;
create policy "admin manages scripts"
on public.scripts for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

drop policy if exists "published articles readable" on public.articles;
create policy "published articles readable"
on public.articles for select
to authenticated
using (status = 'published' or public.current_role_slug() = 'admin');

drop policy if exists "admin manages articles" on public.articles;
create policy "admin manages articles"
on public.articles for all
to authenticated
using (public.current_role_slug() = 'admin')
with check (public.current_role_slug() = 'admin');

commit;
