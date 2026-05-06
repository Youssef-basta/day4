-- ============================================================================
-- Multi-barber support: a staff catalog the admin manages, plus an optional
-- staff_id on bookings so admin can route each appointment to a specific
-- barber. Existing single-chair workflow keeps working — staff_id is
-- nullable and bookings created today have it as NULL until the admin
-- assigns one.
-- ============================================================================

create table public.staff (
  id          text primary key,
  name        text not null,
  phone       text,
  is_active   boolean not null default true,
  sort_order  int     not null default 100,
  created_at  timestamptz not null default now()
);

create index staff_active_sort_idx on public.staff (is_active, sort_order);

alter table public.staff enable row level security;

create policy "active staff readable by anyone"
  on public.staff for select
  to anon, authenticated
  using (is_active = true);

-- ----------------------------------------------------------------------------
-- bookings → staff link
-- ----------------------------------------------------------------------------
alter table public.bookings
  add column staff_id text references public.staff(id) on delete set null;

create index bookings_staff_id_idx on public.bookings (staff_id);

-- Seed one default barber so a single-chair shop reads naturally.
insert into public.staff (id, name, sort_order) values
  ('joe', 'Joe', 10);
