# PriusGo MVP / Phase 8 / Version 2 Plan

> **For Hermes / Claude Code:** PriusGo is not a greenfield project. Do not rebuild it. Preserve the existing Next.js 16 + Supabase architecture, inspect current files first, make small verified changes, and run tests/lint/build before saying work is done.

**Current goal:** Finish Phase 8 deployment safely, then move PriusGo into Version 2 as a real car-rental business tool for Al-Amin’s Šiauliai Toyota Prius rental business.

**Architecture:** The frontend lives in `frontend/`. Supabase SQL/docs live in `backend/`. The app talks directly to Supabase from the browser using anon-safe client calls, with RLS and SQL constraints as the real backend protection.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth/Postgres/RLS/Storage, Vitest, Vercel.

---

## Current State as of 2026-05-01

The old MVP build is mostly complete. Current PriusGo has:

- Customer landing page
- Dynamic fleet from Supabase `cars` table
- No seed cars; cars are admin-managed only
- Supabase Auth with email/password and Google OAuth
- Login-required booking flow
- Booking draft restore after login
- Customer dashboard
- Admin bookings page
- Admin cars page
- Admin car photo uploads to Supabase Storage bucket `car-images`
- Availability calendars for customer and booking form
- Local date formatting to avoid timezone off-by-one bugs
- Auth redirect allowlist via `getSafeRedirectPath`
- Database-level availability check via `public.car_is_available`
- Friendly overlap trigger plus race-safe `bookings_no_overlapping_confirmed` exclusion constraint
- Tests/lint/build passing after the deployment-safety patch

Important files:

```text
frontend/src/app/page.tsx
frontend/src/components/booking-form.tsx
frontend/src/components/booking-date-picker.tsx
frontend/src/components/booking-calendar.tsx
frontend/src/components/customer-cars.tsx
frontend/src/components/car-card.tsx
frontend/src/components/admin-bookings.tsx
frontend/src/components/admin-cars.tsx
frontend/src/components/auth-form.tsx
frontend/src/lib/booking.ts
frontend/src/lib/auth-redirect.ts
frontend/src/lib/supabase/bookings.ts
frontend/src/lib/supabase/cars.ts
backend/supabase-schema.sql
backend/docs/SUPABASE.md
backend/docs/VERSION_2_PLAN.md
```

---

## Phase 8 Deployment Checklist

Before public production use:

1. Run the latest SQL once in Supabase SQL Editor:

```text
/Users/al-amin/PriusGo/backend/supabase-schema.sql
```

2. Confirm `car-images` storage bucket exists.
3. Confirm admin upload/update/delete policies work.
4. Confirm `bookings_no_overlapping_confirmed` exists.
5. Confirm no existing approved/completed bookings overlap before applying the exclusion constraint.
6. Configure Vercel env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

7. Never expose a Supabase service-role key in the frontend.
8. Add production URL to Supabase Auth redirect settings.
9. Test production Google OAuth.
10. Test admin and non-admin access.
11. Test booking request, approval, photo upload, and overlap rejection.

Quality gates:

```bash
cd /Users/al-amin/PriusGo/frontend
npm test
npm run lint
npm run build
```

---

## Version 2 Direction

The full Version 2 plan is here:

```text
/Users/al-amin/PriusGo/backend/docs/VERSION_2_PLAN.md
```

Version 2 priorities:

1. Responsive polish for phone, tablet, laptop, and desktop.
2. Production Vercel deployment and smoke-test checklist.
3. Rental agreement and business-safety workflow.
4. Admin operations dashboard and better booking filters.
5. Customer/admin communication helpers.
6. Deposit/payment tracking before online payment automation.
7. SEO, trust sections, and portfolio case study value.

---

## Coding Rules for Future Agents

- Do not add cars to `frontend/src/lib/cars.ts`; fleet data is dynamic and admin-managed.
- Do not bypass Supabase RLS or SQL constraints.
- Do not use `toISOString().split("T")[0]` for local booking dates.
- Do not use raw query `redirectTo` values without `getSafeRedirectPath`.
- Do not add service-role secrets to browser code or `NEXT_PUBLIC_*` env vars.
- Keep changes small and verified.
- Update docs whenever database schema, auth behavior, or deployment steps change.

---

## Recommended Next Sprint

Do later when Al-Amin is ready:

1. Commit current deployment-safety/docs changes.
2. Run Supabase SQL in production project.
3. Deploy to Vercel.
4. Do responsive audit for phone/tablet/laptop/desktop.
5. Start V2.1 from `backend/docs/VERSION_2_PLAN.md`.
