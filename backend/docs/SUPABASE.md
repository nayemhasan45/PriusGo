# PriusGo Supabase Backend

Run this in Supabase SQL Editor when you create the project.

## Environment variables for the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database schema + RLS

```sql
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
  user_id uuid references public.profiles(id) on delete set null,
  car_id text not null,
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

create policy "Cars are visible to everyone"
  on public.cars for select
  using (true);

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'customer');

create policy "Users can create own booking requests"
  on public.bookings for insert
  with check (user_id is null or auth.uid() = user_id);

create policy "Users can read own bookings"
  on public.bookings for select
  using (auth.uid() = user_id);
```

## Admin later

For admin dashboard later, add policies that check `profiles.role = 'admin'`, then allow admins to read/update all bookings.
