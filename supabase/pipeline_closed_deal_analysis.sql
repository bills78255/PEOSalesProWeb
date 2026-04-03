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

alter table public.opportunities
  add column if not exists deal_name text,
  add column if not exists crm_link text not null default '',
  add column if not exists estimated_commission numeric(12,2),
  add column if not exists referral_source text not null default '';

update public.opportunities
set
  deal_name = coalesce(nullif(deal_name, ''), account_name),
  estimated_commission = coalesce(estimated_commission, estimated_value),
  referral_source = coalesce(nullif(referral_source, ''), source);

alter table public.opportunities
  alter column deal_name set not null;

alter table public.opportunities
  alter column stage set default 'new';

alter table public.opportunities
  drop constraint if exists opportunities_stage_check;

alter table public.opportunities
  add constraint opportunities_stage_check
  check (stage in ('new', 'qualified', 'proposal', 'closed_won', 'closed_lost'));

create table if not exists public.closed_deal_analysis (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid not null unique references public.opportunities(id) on delete cascade,
  industry text not null default '',
  company_size text not null default '',
  sales_cycle_days integer,
  number_of_meetings integer,
  number_of_stakeholders integer,
  competitors_involved text[] not null default '{}'::text[],
  winner text not null default 'us',
  primary_win_reason text not null default '',
  win_notes text not null default '',
  top_objections text[] not null default '{}'::text[],
  referral_type text not null default '',
  referral_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_closed_deal_analysis_deal_id
  on public.closed_deal_analysis(deal_id);

drop trigger if exists set_closed_deal_analysis_updated_at on public.closed_deal_analysis;
create trigger set_closed_deal_analysis_updated_at
before update on public.closed_deal_analysis
for each row execute function public.set_updated_at();

alter table public.closed_deal_analysis enable row level security;

drop policy if exists "closed deal analysis select owner or admin" on public.closed_deal_analysis;
create policy "closed deal analysis select owner or admin"
on public.closed_deal_analysis for select
to authenticated
using (
  exists (
    select 1
    from public.opportunities o
    where o.id = deal_id
      and (o.owner_id = auth.uid() or public.current_role_slug() = 'admin')
  )
);

drop policy if exists "closed deal analysis insert owner or admin" on public.closed_deal_analysis;
create policy "closed deal analysis insert owner or admin"
on public.closed_deal_analysis for insert
to authenticated
with check (
  exists (
    select 1
    from public.opportunities o
    where o.id = deal_id
      and (o.owner_id = auth.uid() or public.current_role_slug() = 'admin')
  )
);

drop policy if exists "closed deal analysis update owner or admin" on public.closed_deal_analysis;
create policy "closed deal analysis update owner or admin"
on public.closed_deal_analysis for update
to authenticated
using (
  exists (
    select 1
    from public.opportunities o
    where o.id = deal_id
      and (o.owner_id = auth.uid() or public.current_role_slug() = 'admin')
  )
)
with check (
  exists (
    select 1
    from public.opportunities o
    where o.id = deal_id
      and (o.owner_id = auth.uid() or public.current_role_slug() = 'admin')
  )
);

drop policy if exists "closed deal analysis delete owner or admin" on public.closed_deal_analysis;
create policy "closed deal analysis delete owner or admin"
on public.closed_deal_analysis for delete
to authenticated
using (
  exists (
    select 1
    from public.opportunities o
    where o.id = deal_id
      and (o.owner_id = auth.uid() or public.current_role_slug() = 'admin')
  )
);

commit;
