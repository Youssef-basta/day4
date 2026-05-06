-- ============================================================================
-- Move per-studio config and testimonials out of code and into the DB,
-- so the same skeleton can serve any barbershop with no code change.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- studio_settings — singleton row (id = 1) with all customer-facing copy.
-- ----------------------------------------------------------------------------

create table public.studio_settings (
  id               int  primary key default 1 check (id = 1),
  brand_name       text not null,
  hero_kicker      text,
  hero_headline_1  text,
  hero_headline_2  text,
  hero_subheading  text,
  feature_1_title  text,
  feature_1_hint   text,
  feature_2_title  text,
  feature_2_hint   text,
  feature_3_title  text,
  feature_3_hint   text,
  address_line_1   text,
  address_line_2   text,
  hours_line_1     text,
  hours_line_2     text,
  phone            text,
  phone_hint       text,
  phone_placeholder text,
  grace_min        int  not null default 30 check (grace_min >= 0),
  updated_at       timestamptz not null default now()
);

insert into public.studio_settings (
  id, brand_name, hero_kicker, hero_headline_1, hero_headline_2, hero_subheading,
  feature_1_title, feature_1_hint, feature_2_title, feature_2_hint,
  feature_3_title, feature_3_hint,
  address_line_1, address_line_2, hours_line_1, hours_line_2,
  phone, phone_hint, phone_placeholder
) values (
  1,
  'Joe Barber Studio',
  'Kuwait City · Est. 2019',
  'Sharp cuts.',
  'No waiting.',
  'Book a barber in under a minute. Walk in, sit down, walk out fresh.',
  '60-sec',  'booking',
  '4.9★',    'rated',
  'Salmiya', 'walk-ins ok',
  'Salmiya, Block 10',
  'Salem Al Mubarak St.',
  'Sat – Thu · 10:00 AM – 9:30 PM',
  'Friday · 2:00 PM – 9:30 PM',
  '+965 5000 0000',
  'WhatsApp & calls',
  '+965 5000 0000'
);

-- ----------------------------------------------------------------------------
-- testimonials — small list rendered on the home page.
-- ----------------------------------------------------------------------------

create table public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text not null,
  author      text not null,
  rating      int  not null default 5 check (rating between 1 and 5),
  sort_order  int  not null default 0,
  is_active   boolean not null default true
);

create index testimonials_active_sort_idx
  on public.testimonials (is_active, sort_order);

insert into public.testimonials (quote, author, rating, sort_order) values
  (
    'Cleanest fade in Kuwait. In and out in 30 minutes — and the booking app is instant.',
    'Faisal A., regular since 2022',
    5,
    10
  );

-- ----------------------------------------------------------------------------
-- RLS — anon can read both. Writes happen via service role only.
-- ----------------------------------------------------------------------------

alter table public.studio_settings enable row level security;
alter table public.testimonials    enable row level security;

create policy "studio_settings readable by anyone"
  on public.studio_settings for select
  to anon, authenticated
  using (true);

create policy "testimonials (active) readable by anyone"
  on public.testimonials for select
  to anon, authenticated
  using (is_active = true);

-- ----------------------------------------------------------------------------
-- expire_no_shows — read grace_min from studio_settings when no arg is passed.
-- ----------------------------------------------------------------------------

create or replace function public.expire_no_shows(
  p_grace_min int default null
)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_grace int;
  v_count int := 0;
  v_row   record;
begin
  v_grace := coalesce(
    p_grace_min,
    (select grace_min from public.studio_settings where id = 1),
    30
  );

  for v_row in
    select b.id, b.slot_id
    from public.bookings b
    join public.slots    s on s.id = b.slot_id
    where b.status = 'pending'
      and (s.date::timestamp + s."time") + (v_grace * interval '1 minute')
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
