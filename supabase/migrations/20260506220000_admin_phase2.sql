-- ============================================================================
-- Admin phase 2: customer management + soft-delete services so the admin
-- catalog can grow and shrink without breaking historical bookings.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- customers — keyed by phone (we don't have customer accounts). Holds the
-- VIP flag and any internal notes the admin keeps on a regular.
-- ----------------------------------------------------------------------------
create table public.customers (
  phone        text primary key,
  is_vip       boolean not null default false,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.customers enable row level security;
-- No anon read/write — the admin uses the service_role client.

-- ----------------------------------------------------------------------------
-- services.is_active for soft-delete: keeps historical bookings valid even
-- after the admin retires a service. Customer-facing queries filter on it.
-- ----------------------------------------------------------------------------
alter table public.services
  add column if not exists is_active boolean not null default true;
