-- PriusGo Supabase backend schema
-- Safe to run more than once in Supabase SQL Editor.

create extension if not exists pgcrypto;

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
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled', 'completed')),
  total_estimated_price numeric(10,2),
  created_at timestamptz not null default now(),
  constraint bookings_date_order check (end_date >= start_date)
);

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

insert into public.cars (id, name, year, price_per_day, status)
values
  ('toyota-prius-white-2014', 'Toyota Prius White', 2014, 35, 'available'),
  ('toyota-prius-silver-2015', 'Toyota Prius Silver', 2015, 38, 'available')
on conflict (id) do update set
  name = excluded.name,
  year = excluded.year,
  price_per_day = excluded.price_per_day,
  status = excluded.status;

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Cars are visible to everyone" on public.cars;
create policy "Cars are visible to everyone"
  on public.cars for select
  using (status = 'available');

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

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
    and status = 'pending'
    and exists (
      select 1
      from public.cars
      where cars.id = bookings.car_id
        and cars.status = 'available'
    )
  );

drop policy if exists "Users can read own bookings" on public.bookings;
create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

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
