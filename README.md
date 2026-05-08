# PriusGo

PriusGo is a Toyota Prius rental app for Šiauliai, Lithuania.

Live site: https://prius-go.vercel.app/

It is split into two clear parts:

```text
PriusGo/
  frontend/   Next.js customer website, auth, booking form, dashboard, admin UI
  backend/    Supabase SQL schema, RLS policies, backend notes
```

## Current status

- V1 is complete.
- V2 is in progress.
- Responsive phone/tablet polish is done.
- Admin overview dashboard is live at `/admin`.

## Prerequisites

- Node.js 20+
- npm
- A Supabase project
- A Google Cloud OAuth client if you want Google sign-in

## Quick start

```bash
git clone https://github.com/nayemhasan45/PriusGo.git
cd PriusGo/frontend
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
http://localhost:3000/admin
http://localhost:3000/admin/bookings
```

## Supabase setup

1. Create a Supabase project.
2. Run the SQL schema in Supabase SQL Editor:

```text
backend/supabase-schema.sql
```

3. Create `frontend/.env.local`:

```text
frontend/.env.local
```

4. Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

6. Enable Google login in Supabase Auth Providers and add the Google OAuth client ID/secret.
7. Restart the frontend dev server.

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

## Google sign-in

Set these in Supabase Auth URL configuration:

```text
http://localhost:3000
http://localhost:3000/**
http://localhost:3000/dashboard
```

In Google Cloud Console, use this redirect URI:

```text
https://tiaoqvqshkwrvukvywzh.supabase.co/auth/v1/callback
```

For production, add your deployed domain to the Supabase redirect URLs.

## Deployment

For Vercel, set:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Do not add service role keys to the frontend.

### Production checklist

1. Deploy `frontend/` to Vercel.
2. Run `backend/supabase-schema.sql` in the production Supabase SQL Editor.
3. Confirm the `car-images` bucket exists and admin can upload photos.
4. Add your production domain to Supabase Auth redirect URLs.
5. Make sure one trusted login is marked `profiles.role = 'admin'`.
6. Smoke test:
   - homepage loads
   - login works
   - booking request submits
   - admin can approve a booking
   - admin can open `/admin`

## Current MVP features

- Customer registration/login with Supabase Auth
- Google sign-in/sign-out
- Booking form connected to Supabase
- Each physical car has its own customer-facing availability card with Available / Not available status.
- Customer car cards show per-car unavailable date ranges and a direct `Rent this car` action.
- Pricing supports €20/day and €100/week; extra days after full weeks are calculated daily.
- Customer dashboard for own bookings
- Admin overview dashboard
- Admin booking dashboard
- Admin car management for price/status updates and photo uploads
- Admin quick actions for approve/reject/cancel/complete/reopen
- Mobile-friendly layouts for public and admin screens
- Supabase Row Level Security for customer/admin access
- Database trigger/exclusion constraint prevents overlapping approved/completed bookings for the same car

## Verification

Run from `frontend/`:

```bash
npm test
npm run lint
npm run build
```

## Version 2 roadmap

PriusGo V2 is building out the app into a real small car-rental operating system, not just a demo.

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

## Portfolio case study

Short project write-up:

```text
backend/docs/CASE_STUDY.md
```

## Security notes

Do not commit:

```text
frontend/.env.local
Google OAuth client secret JSON files
Supabase keys or service role keys
```
