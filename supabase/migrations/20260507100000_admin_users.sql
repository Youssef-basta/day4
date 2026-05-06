-- ============================================================================
-- Multi-user admin auth: replaces the single shared password with named
-- accounts that have roles. The existing ADMIN_PASSWORD env var still works
-- as a backward-compat fallback so today's Vercel deploys don't break the
-- moment this migration applies.
-- ============================================================================

create type admin_role as enum ('owner', 'manager');

create table public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  password_hash text not null,
  role          admin_role not null default 'manager',
  is_active     boolean    not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.admin_users enable row level security;
-- No anon access. The admin client (service role) reads/writes via server
-- actions that enforce role checks.

-- Seed a default owner so first login works even if the operator never
-- creates a user. The password 'admin123' is just a placeholder — the app's
-- single-password fallback (ADMIN_PASSWORD env) also lets you in until you
-- set a real one. Hash is bcrypt of 'admin123' at cost 10, generated
-- offline so the migration doesn't need pgcrypto.
insert into public.admin_users (email, password_hash, role) values
  (
    'owner@joebarber.local',
    -- bcryptjs hash of "admin123" (cost 10)
    '$2b$10$CiKMPvnPUmwzDp/oKuMEquTCi8V/gLcfmKO3vgriYcahPR0InaQb6',
    'owner'
  );
