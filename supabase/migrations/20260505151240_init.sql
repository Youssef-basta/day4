-- ============================================================================
-- Joe Barber Studio — initial schema
-- Migrating from in-memory store + localStorage to Supabase as the BaaS.
-- ============================================================================

create type booking_status as enum ('pending', 'done', 'cancelled');
create type payment_method as enum ('visa', 'knet', 'cash');
create type payment_status as enum ('paid', 'unpaid');
create type service_tier   as enum ('standard', 'premium', 'signature');

create table public.services (
  id           text primary key,
  name         text not null,
  duration_min int  not null check (duration_min > 0),
  price_kwd    int  not null check (price_kwd >= 0),
  description  text,
  tier         service_tier,
  sort_order   int  not null default 0
);

create table public.addons (
  id           text primary key,
  name         text not null,
  duration_min int  not null check (duration_min >= 0),
  price_kwd    int  not null check (price_kwd >= 0),
  description  text,
  sort_order   int  not null default 0
);

create table public.slots (
  id      text primary key,
  date    date    not null,
  "time"  time    not null,
  is_open boolean not null default true,
  unique (date, "time")
);

create index slots_date_idx on public.slots (date);

create table public.bookings (
  id              uuid primary key default gen_random_uuid(),
  ref             text not null unique,
  customer_name   text not null,
  phone           text not null,
  service_id      text not null references public.services(id),
  addon_ids       text[] not null default '{}',
  slot_id         text not null references public.slots(id),
  notes           text,
  status          booking_status not null default 'pending',
  payment_method  payment_method not null,
  payment_status  payment_status not null,
  card_last4      text,
  created_at      timestamptz not null default now()
);

create index bookings_created_at_idx on public.bookings (created_at desc);
create index bookings_slot_id_idx    on public.bookings (slot_id);
create index bookings_status_idx     on public.bookings (status);

-- ----------------------------------------------------------------------------
-- Seed catalog (mirrors lib/seed.ts)
-- ----------------------------------------------------------------------------

insert into public.services (id, name, duration_min, price_kwd, description, tier, sort_order) values
  ('haircut', 'Classic Haircut',       30,  5, 'Wash, scissor or clipper cut, and finish.',     null,        10),
  ('beard',   'Beard Trim',            20,  3, 'Tidy lines and a neat shape.',                  null,        20),
  ('kids',    'Kids Cut',              20,  3, 'Patient, friendly cuts for under-12s.',         null,        30),
  ('color',   'Hair Color',            60, 12, 'Full color or grey blending.',                  null,        40),
  ('shave',   'Hot Towel Shave',       30,  7, 'Straight razor with a steamed towel finish.',   'premium',   50),
  ('sculpt',  'Beard Sculpt',          30,  6, 'Detailed shaping with hot oil and balm.',       'premium',   60),
  ('lineup',  'Line-up / Hair Tattoo', 30,  8, 'Crisp edges or custom razor designs.',          'premium',   70),
  ('royal',   'Royal Package',         75, 18, 'Cut · Hot towel shave · Scalp massage · Style.','signature', 80);

insert into public.addons (id, name, duration_min, price_kwd, description, sort_order) values
  ('eyebrows','Eyebrow Trim',       5, 1, 'Quick clean-up.',        10),
  ('scalp',   'Scalp Massage',     10, 2, '5-min relax-down.',      20),
  ('hotoil',  'Hot Oil Treatment', 10, 3, 'Nourish and add shine.', 30),
  ('mask',    'Black Mask Facial', 15, 4, 'Deep-cleanse pores.',    40),
  ('wash',    'Wash & Blow-dry',   10, 2, 'Shampoo and finish.',    50);

-- ----------------------------------------------------------------------------
-- Slot generation: today + next 30 days, 10:00–21:00 every 30 min
-- ----------------------------------------------------------------------------

create or replace function public.ensure_slots(p_days int default 30)
returns void
language plpgsql
as $$
declare
  d date;
  hr int;
  m int;
  slot_time time;
begin
  for d in
    select generate_series(current_date, current_date + (p_days - 1), interval '1 day')::date
  loop
    for hr in 10..21 loop
      for m in 0..1 loop
        if hr = 21 and m = 1 then continue; end if;
        slot_time := make_time(hr, m * 30, 0);
        insert into public.slots (id, date, "time")
        values (
          to_char(d, 'YYYY-MM-DD') || '_' || to_char(slot_time, 'HH24:MI'),
          d,
          slot_time
        )
        on conflict (id) do nothing;
      end loop;
    end loop;
  end loop;
end;
$$;

select public.ensure_slots(30);

-- ----------------------------------------------------------------------------
-- Booking creation RPC — atomic insert + slot close (race-safe via row lock)
-- ----------------------------------------------------------------------------

create or replace function public.create_booking(
  p_customer_name  text,
  p_phone          text,
  p_service_id     text,
  p_addon_ids      text[],
  p_slot_id        text,
  p_notes          text,
  p_payment_method payment_method,
  p_card_last4     text
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
    payment_method, payment_status, card_last4
  ) values (
    v_ref, trim(p_customer_name), trim(p_phone), p_service_id,
    coalesce(p_addon_ids, '{}'), p_slot_id, nullif(trim(coalesce(p_notes, '')), ''),
    p_payment_method, v_status, p_card_last4
  )
  returning * into v_booking;

  update public.slots set is_open = false where id = p_slot_id;

  return v_booking;
end;
$$;

-- ----------------------------------------------------------------------------
-- RLS — anon can read catalog + open slots, and call the booking RPC.
-- Admin uses service_role (bypasses RLS) for everything else.
-- ----------------------------------------------------------------------------

alter table public.services enable row level security;
alter table public.addons   enable row level security;
alter table public.slots    enable row level security;
alter table public.bookings enable row level security;

create policy "services readable by anyone"
  on public.services for select
  to anon, authenticated
  using (true);

create policy "addons readable by anyone"
  on public.addons for select
  to anon, authenticated
  using (true);

create policy "open slots readable by anyone"
  on public.slots for select
  to anon, authenticated
  using (is_open = true);

-- Bookings: no public select/insert/update policies. Public flow uses RPC.

grant execute on function public.create_booking(text, text, text, text[], text, text, payment_method, text)
  to anon, authenticated;
