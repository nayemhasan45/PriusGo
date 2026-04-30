# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

PriusGo is a Toyota Prius rental MVP for Šiauliai, Lithuania. Customers browse cars, log in, and submit booking requests. The admin (Al-Amin) approves, rejects, or manages bookings and car status through a separate admin UI.

## Repository layout

```
PriusGo/
  frontend/          Next.js 16 app — all customer and admin UI
  backend/
    supabase-schema.sql   Single source of truth for all DB tables, RLS, and seed data
    docs/SUPABASE.md      Supabase project notes and Vercel env setup guide
```

All code lives under `frontend/`. Run every command from `frontend/`.

## Commands

```bash
cd frontend

npm run dev       # local dev server at http://localhost:3000
npm test          # run all Vitest tests (no watch)
npm run lint      # ESLint
npm run build     # production build (must pass before any PR)
```

Run a single test file:
```bash
npx vitest run src/lib/booking.test.ts
```

## Architecture

### Data flow

The frontend talks directly to Supabase from the browser via `@supabase/ssr`. There is no custom API server. `src/lib/supabase/client.ts` returns `null` when env vars are missing — callers must guard against this.

Car data has two sources that must stay in sync:
- **`src/lib/cars.ts`** — static TypeScript array; used for display, pricing, and mapping `car_id` back to a name.
- **`backend/supabase-schema.sql`** — seed `INSERT` for the same cars in the `cars` table; used for RLS and availability checks.

When adding a new car, update both.

### Type conventions

Supabase column names use `snake_case`; the application uses `camelCase`. The mapping functions `buildBookingInsert` and `mapBookingRowToRequest` in `src/lib/supabase/bookings.ts` handle the translation. Raw DB row types (`BookingRow`, `BookingInsert`) live in that same file; domain types (`BookingRequest`, `Car`) live in `src/lib/types.ts`.

### Auth and roles

Supabase Auth is used for both email/password and Google OAuth. On first sign-in, a database trigger (`handle_new_user`) automatically inserts a row into `public.profiles` with `role = 'customer'`.

Admin access is granted by setting `profiles.role = 'admin'` directly in Supabase SQL Editor — there is no UI for this. The `public.is_admin(user_id)` SQL function is used in every admin RLS policy.

Admin pages (`/admin/bookings`, `/admin/cars`) check the role client-side and redirect non-admins. The RLS policies on Supabase enforce the same rules server-side.

### Availability logic

Car availability is enforced at the DB level via the `public.car_is_available()` function, which is called inside the `bookings` insert RLS policy. Only `approved` and `completed` bookings block date ranges. The `car_booking_blocks` view surfaces these blocked ranges to the frontend for display.

### Pricing

`src/lib/booking.ts` contains `calculateRentalDays` and `estimateBookingPrice`. Pricing is €20/day or €100/week (with leftover days charged daily). These are pure functions — tests are in `src/lib/booking.test.ts`.

### Novaride-inspired visual direction

The active homepage redesign should follow `backend/docs/PLAN.md` Phase 6. Reference: `https://demo.awaikenthemes.com/novaride/`.

Use the same visual language, not copied assets:
- Fonts: Epilogue for headings, DM Sans for body via `next/font/google`.
- Primary accent: `#ff3600` orange for CTAs, circular arrows, highlights, stars, active states.
- Core palette: black `#0b0b0b`, muted text `#616161`, border `#e9e9e9`, soft section `#fff7f4`, white cards.
- Layout: rounded 30-40px hero/sections, max width around 1320px, large spacing, premium car-rental landing page style.
- Motion: CSS fade-up reveal, hover-lift cards, diagonal CTA arrow movement, smooth scroll. Avoid heavy animation libraries unless necessary.
- Keep all existing Supabase booking/auth/admin behavior intact while changing visuals.

## Next.js version note

This project uses Next.js 16 with React 19. APIs and conventions may differ from earlier versions. Read `frontend/node_modules/next/dist/docs/` when in doubt rather than relying on older training data.

## Environment variables

Required in `frontend/.env.local` (never commit this file):

```env
NEXT_PUBLIC_SUPABASE_URL=https://tiaoqvqshkwrvukvywzh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The app degrades gracefully when Supabase is not configured (client returns `null`, UI shows a "not configured" message).
