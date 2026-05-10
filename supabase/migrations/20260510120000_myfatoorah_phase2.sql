-- ============================================================================
-- MyFatoorah Phase 2: real hosted-payment redirect flow.
--
-- Visa / KNET bookings now start with payment_status = 'pending', the server
-- action calls MyFatoorah to mint a PaymentURL, and the customer is bounced
-- to MyFatoorah's hosted page. Our /api/payment/callback handler verifies
-- the result and either flips the booking to 'paid' or cancels it (reopens
-- the slot).
-- ============================================================================

-- 'pending' to payment_status (in-flight gateway state)
alter type payment_status add value if not exists 'pending';

-- MyFatoorah identifiers — used to verify on the callback and to recover a
-- payment URL if the customer closes the tab and tries again.
alter table public.bookings
  add column if not exists payment_intent_id  text,
  add column if not exists payment_invoice_id bigint,
  add column if not exists payment_url        text;

-- ----------------------------------------------------------------------------
-- create_booking RPC — visa / knet now start as pending so the callback can
-- flip them to paid. cash stays unpaid.
-- ----------------------------------------------------------------------------
create or replace function public.create_booking(
  p_customer_name  text,
  p_phone          text,
  p_service_id     text,
  p_addon_ids      text[],
  p_slot_id        text,
  p_notes          text,
  p_payment_method payment_method,
  p_card_last4     text,
  p_drink_orders   jsonb default '[]'::jsonb
)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_booking public.bookings;
  v_ref     text;
  v_status  payment_status;
  v_open    boolean;
begin
  if length(coalesce(trim(p_customer_name), '')) = 0 then
    raise exception 'customer_name required' using errcode = '22023';
  end if;
  if length(coalesce(trim(p_phone), '')) = 0 then
    raise exception 'phone required' using errcode = '22023';
  end if;

  select is_open into v_open
  from public.slots
  where id = p_slot_id
  for update;

  if not found then
    raise exception 'slot_not_found' using errcode = 'P0002';
  end if;
  if not v_open then
    raise exception 'slot_unavailable' using errcode = 'P0001';
  end if;

  for i in 1..5 loop
    v_ref := 'KB-' || lpad((1000 + floor(random() * 9000))::int::text, 4, '0');
    exit when not exists (select 1 from public.bookings where ref = v_ref);
  end loop;

  v_status := case
    when p_payment_method = 'cash'             then 'unpaid'::payment_status
    when p_payment_method in ('visa', 'knet')  then 'pending'::payment_status
    else                                            'paid'::payment_status
  end;

  insert into public.bookings (
    ref, customer_name, phone, service_id, addon_ids, slot_id, notes,
    payment_method, payment_status, card_last4, drink_orders
  ) values (
    v_ref, trim(p_customer_name), trim(p_phone), p_service_id,
    coalesce(p_addon_ids, '{}'), p_slot_id,
    nullif(trim(coalesce(p_notes, '')), ''),
    p_payment_method, v_status, p_card_last4,
    coalesce(p_drink_orders, '[]'::jsonb)
  )
  returning * into v_booking;

  update public.slots set is_open = false where id = p_slot_id;

  return v_booking;
end;
$$;

-- ----------------------------------------------------------------------------
-- Stuck-payment cleanup — bookings whose gateway payment hasn't completed
-- after 15 min are cancelled and the slot reopens. Customer abandoned mid-
-- redirect, browser closed, etc.
-- ----------------------------------------------------------------------------
create or replace function public.expire_pending_payments(
  p_minutes int default 15
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
    where b.payment_status = 'pending'
      and b.status = 'pending'
      and b.created_at < now() - (p_minutes * interval '1 minute')
    for update of b skip locked
  loop
    update public.bookings
    set    status = 'cancelled',
           cancellation_reason = 'payment_failed',
           payment_status = 'unpaid'
    where  id = v_row.id;

    update public.slots set is_open = true where id = v_row.slot_id;
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

grant execute on function public.expire_pending_payments(int) to service_role;

-- Schedule cleanup every 5 minutes (idempotent re-add)
do $$
begin
  perform cron.unschedule('expire-pending-payments')
  where exists (select 1 from cron.job where jobname = 'expire-pending-payments');
exception when others then null;
end$$;

select cron.schedule(
  'expire-pending-payments',
  '*/5 * * * *',
  $cron$select public.expire_pending_payments();$cron$
);
