# PriusGo

PriusGo is a Toyota Prius rental MVP for Šiauliai, Lithuania.

Live site: https://prius-go.vercel.app/

It is split into two clear parts:

```text
PriusGo/
  frontend/   Next.js customer website, auth, booking form, dashboard, admin UI
  backend/    Supabase SQL schema, RLS policies, backend notes
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful local pages:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/admin/bookings
```

## Supabase setup

1. Create a Supabase project.
2. Run the SQL schema in Supabase SQL Editor:

```text
backend/supabase-schema.sql
```

3. Create this file:

```text
frontend/.env.local
```

4. Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Enable Google login in Supabase Auth Providers and add the Google OAuth client ID/secret.
6. Restart the frontend dev server.

More details are in:

```text
backend/docs/SUPABASE.md
```

## Admin setup

Admin access is controlled by Supabase `profiles.role = 'admin'`.

After signing in once with Google, run this in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'your-google-email@example.com'
);
```

Then open:

```text
http://localhost:3000/admin/bookings
```

## Current MVP features

- Customer registration/login with Supabase Auth
- Google sign-in/sign-out
- Booking form connected to Supabase
- Each physical car has its own customer-facing availability card with Available / Not available status.
- Customer car cards show per-car unavailable date ranges and a direct `Rent this car` action.
- Pricing supports €20/day and €100/week; extra days after full weeks are calculated daily.
- Customer dashboard for own bookings
- Admin booking dashboard
- Admin car management for price/status updates and photo uploads
- Admin quick actions for approve/reject/cancel/complete/reopen
- Supabase Row Level Security for customer/admin access
- Database trigger/exclusion constraint prevents overlapping approved/completed bookings for the same car

## Version 2 plan

PriusGo V2 is planned as a real small car-rental operating system, not just a demo.

Main plan:

```text
backend/docs/VERSION_2_PLAN.md
```

V2 priorities:

- responsive polish for phone, tablet, laptop, and desktop
- production deployment and smoke testing
- rental agreement/business safety workflow
- admin operations dashboard
- customer/admin communication helpers
- deposit/payment tracking before online payment automation
- SEO, trust sections, and portfolio case-study polish

## Verification

Run from `frontend/`:

```bash
npm test
npm run lint
npm run build
```

## Security notes

Do not commit:

```text
frontend/.env.local
Google OAuth client secret JSON files
Supabase keys or service role keys
```
