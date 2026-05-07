-- ============================================================================
-- Optional customer accounts: extend the existing customers table (which
-- already keys on phone) with account fields. Guests still work — they have
-- a customers row created from their booking with password_hash NULL.
-- ============================================================================

alter table public.customers
  add column if not exists name              text,
  add column if not exists email             text,
  add column if not exists password_hash     text,
  add column if not exists favorite_service_ids text[] not null default '{}',
  add column if not exists preferred_time_band text default 'any'
    check (preferred_time_band in ('morning','afternoon','evening','any')),
  add column if not exists sms_opt_in        boolean not null default false,
  add column if not exists email_opt_in      boolean not null default false,
  add column if not exists avatar_url        text;

-- Case-insensitive unique email when present
create unique index if not exists customers_email_unique
  on public.customers (lower(email))
  where email is not null;
