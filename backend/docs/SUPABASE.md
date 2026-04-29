# PriusGo Supabase Backend

Run the SQL file in Supabase SQL Editor after creating the project:

```text
backend/supabase-schema.sql
```

The SQL is idempotent, so it is safe to run again if you update the schema.

## Environment variables for the frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For the current PriusGo project created in Supabase, the project URL is:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tiaoqvqshkwrvukvywzh.supabase.co
```

Do not commit `.env.local` to GitHub.

## What the SQL creates

- `profiles` table for customers/admin roles.
- `cars` table seeded with the Prius cars used by the frontend.
- `bookings` table for booking requests.
- Row Level Security policies:
  - everyone can read available cars only
  - users can read/update their own profile
  - logged-in users can create their own pending booking requests
  - booking requests can only target available cars
  - logged-in users can read their own bookings
- Auth trigger:
  - creates a `profiles` row automatically when a user registers
  - avoids signup/profile issues when email confirmation is enabled
- Rerun-safe cleanup for earlier draft schemas:
  - removes orphan bookings with no user
  - enforces non-null booking users
  - normalizes the booking foreign keys

## Admin later

For admin dashboard later, add policies that check `profiles.role = 'admin'`, then allow admins to read/update all bookings.
