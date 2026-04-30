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


alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.bookings enable row level security;

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
      and bookings.status in ('approved', 'completed')
      and daterange(bookings.start_date, bookings.end_date, '[]') && daterange(requested_start_date, requested_end_date, '[]')
  );
$$;

create or replace view public.car_booking_blocks as
select
  car_id,
  start_date,
  end_date,
  status
from public.bookings
where status in ('approved', 'completed');

grant usage on schema public to anon, authenticated;
grant select on public.cars to anon, authenticated;
grant insert, update, delete on public.cars to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.bookings to authenticated;
grant select on public.car_booking_blocks to anon, authenticated;
grant execute on function public.car_is_available(text, date, date) to anon, authenticated;
grant execute on function public.is_admin(uuid) to authenticated;

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
    and status = 'pending'
    and public.car_is_available(bookings.car_id, bookings.start_date, bookings.end_date)
  );

drop policy if exists "Users can read own bookings" on public.bookings;
create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);

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
