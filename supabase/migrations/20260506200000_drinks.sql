-- ============================================================================
-- Drinks: a small refreshments menu (hot + cold) that customers can order
-- as part of their booking. Stored on bookings as a jsonb array of line items
-- so quantities and pricing are captured per booking without an extra junction.
-- ============================================================================

create type drink_temperature as enum ('hot', 'cold');

create table public.drinks (
  id           text primary key,
  name         text not null,
  description  text,
  price_kwd    int  not null check (price_kwd >= 0),
  temperature  drink_temperature not null,
  sort_order   int  not null default 0,
  is_active    boolean not null default true
);

create index drinks_active_temp_sort_idx
  on public.drinks (is_active, temperature, sort_order);

insert into public.drinks (id, name, description, price_kwd, temperature, sort_order) values
  -- HOT
  ('karak',      'Karak Tea',          'Strong cardamom milk tea.',          1,  'hot',  10),
  ('arabic',     'Arabic Coffee',      'Light, cardamom-forward.',           1,  'hot',  20),
  ('espresso',   'Espresso',           'Single shot, freshly pulled.',       1,  'hot',  30),
  ('cappuccino', 'Cappuccino',         'Espresso + steamed milk.',           2,  'hot',  40),
  ('hotchoc',    'Hot Chocolate',      'Rich and creamy.',                   2,  'hot',  50),
  -- COLD
  ('water',      'Water',              'Bottled, complimentary.',            0,  'cold', 10),
  ('soda',       'Soft Drink',         'Pepsi · 7Up · Mirinda.',             1,  'cold', 20),
  ('icedcoffee', 'Iced Coffee',        'Cold brew with ice.',                2,  'cold', 30),
  ('lemonade',   'Fresh Lemonade',     'Squeezed daily, lightly sweet.',     2,  'cold', 40),
  ('orange',     'Fresh Orange Juice', 'Hand-pressed, no added sugar.',      2,  'cold', 50);

-- ----------------------------------------------------------------------------
-- bookings.drink_orders: jsonb array of {id: string, qty: int}
-- ----------------------------------------------------------------------------

alter table public.bookings
  add column drink_orders jsonb not null default '[]'::jsonb;

-- ----------------------------------------------------------------------------
-- RLS — anon can read active drinks. Writes via service role only.
-- ----------------------------------------------------------------------------

alter table public.drinks enable row level security;

create policy "active drinks readable by anyone"
  on public.drinks for select
  to anon, authenticated
  using (is_active = true);

-- ----------------------------------------------------------------------------
-- Update create_booking RPC to accept drink orders. Existing callers without
-- the new arg get an empty array by default.
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

  v_status := case when p_payment_method = 'cash' then 'unpaid'::payment_status
                  else 'paid'::payment_status end;

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

grant execute on function public.create_booking(
  text, text, text, text[], text, text, payment_method, text, jsonb
) to anon, authenticated;
