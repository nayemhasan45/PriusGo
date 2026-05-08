-- PriusGo Supabase backend schema
-- Safe to run more than once in Supabase SQL Editor.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.cars (
  id text primary key,
  name text not null,
  brand text not null default 'Toyota',
  model text not null default 'Prius',
  year int not null,
  fuel_type text not null default 'Hybrid petrol',
  transmission text not null default 'Automatic',
  seats int not null default 5,
  price_per_day numeric(10,2) not null,
  image_url text,
  status text not null default 'available' check (status in ('available', 'unavailable', 'maintenance')),
  maintenance_note text,
  next_available_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  car_id text not null references public.cars(id),
  full_name text,
  email text,
  phone text not null,
  start_date date not null,
  end_date date not null,
  pickup_location text not null,
  message text,
  driving_license_confirmed boolean not null default false,
  rental_rules_accepted boolean not null default false,
  booking_not_final_acknowledged boolean not null default false,
  license_check_status text not null default 'pending' check (license_check_status in ('pending', 'verified', 'rejected')),
  deposit_agreed boolean not null default false,
  pickup_time text,
  return_time text,
  admin_notes text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'picked_up', 'returned', 'completed', 'rejected', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'deposit_paid', 'paid', 'refunded')),
  deposit_amount numeric(10,2),
  payment_method text check (payment_method in ('cash', 'bank', 'card', 'other')),
  payment_notes text,
  rental_total numeric(10,2),
  discount_amount numeric(10,2),
  extra_charge numeric(10,2),
  total_estimated_price numeric(10,2),
  created_at timestamptz not null default now(),
  constraint bookings_date_order check (end_date >= start_date)
);

alter table public.bookings add column if not exists driving_license_confirmed boolean not null default false;
alter table public.bookings add column if not exists rental_rules_accepted boolean not null default false;
alter table public.bookings add column if not exists booking_not_final_acknowledged boolean not null default false;
alter table public.bookings add column if not exists license_check_status text not null default 'pending';
alter table public.bookings add column if not exists deposit_agreed boolean not null default false;
alter table public.bookings add column if not exists pickup_time text;
alter table public.bookings add column if not exists return_time text;
alter table public.bookings add column if not exists admin_notes text;
alter table public.bookings add column if not exists payment_status text not null default 'unpaid';
alter table public.bookings add column if not exists deposit_amount numeric(10,2);
alter table public.bookings add column if not exists payment_method text;
alter table public.bookings add column if not exists payment_notes text;
alter table public.bookings add column if not exists rental_total numeric(10,2);
alter table public.bookings add column if not exists discount_amount numeric(10,2);
alter table public.bookings add column if not exists extra_charge numeric(10,2);

do $$
begin
  alter table public.bookings drop constraint if exists bookings_status_check;
  alter table public.bookings
    add constraint bookings_status_check
    check (status in ('pending', 'approved', 'picked_up', 'returned', 'completed', 'rejected', 'cancelled'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.bookings drop constraint if exists bookings_payment_status_check;
  alter table public.bookings
    add constraint bookings_payment_status_check
    check (payment_status in ('unpaid', 'deposit_paid', 'paid', 'refunded'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.bookings drop constraint if exists bookings_payment_method_check;
  alter table public.bookings
    add constraint bookings_payment_method_check
    check (payment_method is null or payment_method in ('cash', 'bank', 'card', 'other'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.bookings
    add constraint bookings_license_check_status_check
    check (license_check_status in ('pending', 'verified', 'rejected'));
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.bookings
    add constraint bookings_pickup_time_format_check
    check (pickup_time is null or pickup_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  alter table public.bookings
    add constraint bookings_return_time_format_check
    check (return_time is null or return_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');
exception
  when duplicate_object then null;
end;
$$;

-- Keep reruns safe if an earlier draft schema already exists.
delete from public.bookings where user_id is null;
alter table public.bookings alter column user_id set not null;

alter table public.bookings drop constraint if exists bookings_user_id_fkey;
alter table public.bookings
  add constraint bookings_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bookings_car_id_fkey'
  ) then
    alter table public.bookings
      add constraint bookings_car_id_fkey
      foreign key (car_id) references public.cars(id);
  end if;
end;
$$;


alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

alter table public.cars add column if not exists maintenance_note text;
alter table public.cars add column if not exists next_available_date date;

create or replace function public.is_admin(user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = user_id
      and profiles.role = 'admin'
  );
$$;

create or replace function public.car_is_available(
  selected_car_id text,
  requested_start_date date,
  requested_end_date date
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.cars
    where cars.id = selected_car_id
      and cars.status = 'available'
  )
  and not exists (
    select 1
    from public.bookings
    where bookings.car_id = selected_car_id
      and bookings.status in ('approved', 'picked_up', 'returned', 'completed')
      and daterange(bookings.start_date, bookings.end_date, '[]') && daterange(requested_start_date, requested_end_date, '[]')
  );
$$;

create or replace function public.prevent_overlapping_confirmed_bookings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('approved', 'picked_up', 'returned', 'completed') and exists (
    select 1
    from public.bookings existing
    where existing.car_id = new.car_id
      and existing.id is distinct from new.id
      and existing.status in ('approved', 'picked_up', 'returned', 'completed')
      and daterange(existing.start_date, existing.end_date, '[]') && daterange(new.start_date, new.end_date, '[]')
  ) then
    raise exception 'Car % already has an active booking (approved/picked_up/returned/completed) overlapping % to %', new.car_id, new.start_date, new.end_date
      using errcode = '23P01';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_overlapping_confirmed_bookings on public.bookings;
create trigger prevent_overlapping_confirmed_bookings
  before insert or update of car_id, start_date, end_date, status on public.bookings
  for each row execute function public.prevent_overlapping_confirmed_bookings();

-- Race-safe database guard against double-booking confirmed rentals.
-- The trigger above gives a friendly error in normal flows; this exclusion constraint
-- is the final protection for concurrent admin approvals/inserts.
do $$
begin
  alter table public.bookings drop constraint if exists bookings_no_overlapping_confirmed;
  alter table public.bookings
    add constraint bookings_no_overlapping_confirmed
    exclude using gist (
      car_id with =,
      daterange(start_date, end_date, '[]') with &&
    )
        where (status in ('approved', 'picked_up', 'returned', 'completed'));
exception
  when duplicate_object then null;
end;
$$;

create or replace view public.car_booking_blocks as
select
  car_id,
  start_date,
  end_date,
  status
from public.bookings
where status in ('approved', 'picked_up', 'returned', 'completed');

create or replace function public.get_customer_bookings()
returns table (
  id uuid,
  user_id uuid,
  car_id text,
  full_name text,
  email text,
  phone text,
  start_date date,
  end_date date,
  pickup_location text,
  message text,
  driving_license_confirmed boolean,
  rental_rules_accepted boolean,
  booking_not_final_acknowledged boolean,
  pickup_time text,
  return_time text,
  status text,
  total_estimated_price numeric,
  created_at timestamptz
)
language sql
security definer
set search_path = public
stable
as $$
  select
    bookings.id,
    bookings.user_id,
    bookings.car_id,
    bookings.full_name,
    bookings.email,
    bookings.phone,
    bookings.start_date,
    bookings.end_date,
    bookings.pickup_location,
    bookings.message,
    bookings.driving_license_confirmed,
    bookings.rental_rules_accepted,
    bookings.booking_not_final_acknowledged,
    bookings.pickup_time,
    bookings.return_time,
    bookings.status,
    bookings.total_estimated_price,
    bookings.created_at
  from public.bookings
  where bookings.user_id = auth.uid()
  order by bookings.created_at desc;
$$;

grant usage on schema public to anon, authenticated;
grant select on public.cars to anon, authenticated;
grant insert, update, delete on public.cars to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.bookings to authenticated;
grant select on public.car_booking_blocks to anon, authenticated;
grant execute on function public.car_is_available(text, date, date) to anon, authenticated;
grant execute on function public.get_customer_bookings() to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.prevent_overlapping_confirmed_bookings() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('car-images', 'car-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Car images are publicly readable" on storage.objects;
create policy "Car images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'car-images');

drop policy if exists "Admins can upload car images" on storage.objects;
create policy "Admins can upload car images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'car-images' and (select public.is_admin(auth.uid())));

drop policy if exists "Admins can update car images" on storage.objects;
create policy "Admins can update car images"
  on storage.objects for update to authenticated
  using (bucket_id = 'car-images' and (select public.is_admin(auth.uid())))
  with check (bucket_id = 'car-images' and (select public.is_admin(auth.uid())));

drop policy if exists "Admins can delete car images" on storage.objects;
create policy "Admins can delete car images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'car-images' and (select public.is_admin(auth.uid())));

drop policy if exists "Cars are visible to everyone" on public.cars;
create policy "Cars are visible to everyone"
  on public.cars for select
  using (status = 'available' or auth.role() = 'authenticated' or public.is_admin(auth.uid()));

drop policy if exists "Admins can insert cars" on public.cars;
create policy "Admins can insert cars"
  on public.cars for insert
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can update cars" on public.cars;
create policy "Admins can update cars"
  on public.cars for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

drop policy if exists "Admins can delete cars" on public.cars;
create policy "Admins can delete cars"
  on public.cars for delete
  using (public.is_admin(auth.uid()));

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Admins can read all profiles" on public.profiles;
create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Users can create own profile" on public.profiles;
create policy "Users can create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'customer');

drop policy if exists "Users can create own booking requests" on public.bookings;
create policy "Users can create own booking requests"
  on public.bookings for insert
  with check (
    auth.uid() = user_id
    and driving_license_confirmed = true
    and rental_rules_accepted = true
    and booking_not_final_acknowledged = true
    and license_check_status = 'pending'
    and deposit_agreed = false
    and pickup_time is not null
    and return_time is not null
    and admin_notes is null
    and status = 'pending'
    and public.car_is_available(bookings.car_id, bookings.start_date, bookings.end_date)
  );

drop policy if exists "Users can read own bookings" on public.bookings;

drop policy if exists "Admins can read all bookings" on public.bookings;
create policy "Admins can read all bookings"
  on public.bookings for select
  using (public.is_admin(auth.uid()));

drop policy if exists "Admins can update booking statuses" on public.bookings;
create policy "Admins can update booking statuses"
  on public.bookings for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Create customer profile automatically when a new user registers.
-- This avoids login/signup breaking when email confirmation is enabled.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', ''),
    'customer'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
