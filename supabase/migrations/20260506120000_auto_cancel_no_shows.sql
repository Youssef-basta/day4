-- ============================================================================
-- Auto-cancel no-shows: pending bookings whose slot started 30+ minutes ago
-- get flipped to cancelled and their slot reopened. Runs every 5 minutes via
-- pg_cron. Cancellations are tagged with a reason so admin UI can distinguish
-- between admin-initiated cancels and no-shows.
-- ============================================================================

alter table public.bookings
  add column if not exists cancellation_reason text;

-- ----------------------------------------------------------------------------
-- expire_no_shows: scan pending bookings, cancel ones past their grace window,
-- reopen the corresponding slot. Returns the number of bookings cancelled.
-- ----------------------------------------------------------------------------

create or replace function public.expire_no_shows(
  p_grace_min int default 30
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int := 0;
  v_row   record;
begin
  for v_row in
    select b.id, b.slot_id
    from public.bookings b
    join public.slots    s on s.id = b.slot_id
    where b.status = 'pending'
      and (s.date::timestamp + s."time") + (p_grace_min * interval '1 minute')
            < (now() at time zone 'Asia/Kuwait')
    for update of b skip locked
  loop
    update public.bookings
    set    status = 'cancelled',
           cancellation_reason = 'no_show'
    where  id = v_row.id;

    update public.slots
    set    is_open = true
    where  id = v_row.slot_id;

    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

grant execute on function public.expire_no_shows(int) to service_role;

-- ----------------------------------------------------------------------------
-- Schedule it via pg_cron every 5 minutes.
-- ----------------------------------------------------------------------------

create extension if not exists pg_cron with schema extensions;

-- Idempotent reschedule: drop the job if it already exists, then add it.
do $$
begin
  perform cron.unschedule('expire-no-shows')
  where exists (select 1 from cron.job where jobname = 'expire-no-shows');
exception when others then null;
end$$;

select cron.schedule(
  'expire-no-shows',
  '*/5 * * * *',
  $cron$select public.expire_no_shows();$cron$
);
