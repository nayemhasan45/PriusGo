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

## Google sign-in setup

PriusGo uses Supabase Auth for Google OAuth. The frontend button redirects users to Google and returns successful logins to `/dashboard`.

In Supabase Dashboard:

1. Go to Authentication -> URL Configuration.
2. Set Site URL for local development:

```text
http://localhost:3000
```

3. Add Redirect URLs:

```text
http://localhost:3000/**
http://localhost:3000/dashboard
```

4. Go to Authentication -> Providers -> Google.
5. Enable Google.
6. Paste the Google OAuth Client ID and Client Secret from Google Cloud.
7. Save.

In Google Cloud Console, the OAuth client must include this Authorized redirect URI:

```text
https://tiaoqvqshkwrvukvywzh.supabase.co/auth/v1/callback
```

Keep the downloaded Google client secret JSON private. Do not commit it to GitHub and do not paste the secret into chat.

When PriusGo is deployed, add the production domain to Supabase Redirect URLs, for example:

```text
https://your-vercel-domain.vercel.app/**
https://your-domain.com/**
```

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

## Admin dashboard

Admin booking management lives inside the same Next.js app:

```text
http://localhost:3000/admin/bookings
```

The admin page is protected by Supabase Auth and `profiles.role = 'admin'`.

After running the latest schema SQL, make one trusted user an admin from Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'your-admin-email@example.com'
);
```

Replace the email with your real admin login email. Do not hardcode admin emails in frontend code.

Admin capabilities:

- read all booking requests
- update booking status to `pending`, `approved`, `rejected`, `cancelled`, or `completed`
- see total requests, pending requests, approved requests, and estimated revenue
