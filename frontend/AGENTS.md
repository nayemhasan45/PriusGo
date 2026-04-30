<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This project uses Next.js 16 and React 19. APIs, routing behavior, build output, and conventions may differ from older training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing code when unsure. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# PriusGo Frontend Agent Guide

> **For Claude Code / coding agents:** Do not rebuild the frontend from zero. Preserve current Supabase auth, booking, admin, and storage behavior. Make small verified changes.

## Commands

Run from `frontend/`:

```bash
npm test
npm run lint
npm run build
```

Use these before reporting success.

## Current frontend architecture

- `src/app/page.tsx` is the main landing page.
- `src/components/customer-cars.tsx` loads customer fleet data from Supabase.
- `src/components/car-card.tsx` displays each car and its availability calendar.
- `src/components/booking-form.tsx` handles login-required booking requests.
- `src/components/booking-date-picker.tsx` handles interactive booking range selection.
- `src/components/booking-calendar.tsx` shows read-only blocked dates on car cards.
- `src/components/admin-bookings.tsx` manages admin booking actions.
- `src/components/admin-cars.tsx` manages fleet cars and photo uploads.
- `src/components/auth-form.tsx` uses `getSafeRedirectPath` for redirect safety.
- `src/lib/booking.ts` contains pure date/pricing helpers.
- `src/lib/supabase/*.ts` contains Supabase mapping/query helpers and tests.

## Rules

- Do not put cars into `src/lib/cars.ts`; it is intentionally an empty fallback. Real cars are admin-managed in Supabase.
- Do not expose service-role keys or private provider secrets in frontend code.
- Do not use raw `redirectTo` query values. Use `src/lib/auth-redirect.ts`.
- Do not use `date.toISOString().split("T")[0]` for local booking dates. Use `formatLocalDate` from `src/lib/booking.ts`.
- Do not rely only on UI for booking safety. Supabase RLS/SQL constraints are the real protection.
- When changing Supabase row shapes, update mapper tests.
- When changing booking/pricing/date logic, update `src/lib/booking.test.ts`.

## Version 2 frontend direction

The V2 roadmap is documented in:

```text
../backend/docs/VERSION_2_PLAN.md
```

Frontend V2 priorities:

1. Responsive polish for phone, tablet, laptop, and desktop.
2. Better admin operations and mobile-friendly admin pages.
3. Rental agreement acceptance and clearer customer trust flow.
4. Communication helpers for admin: phone, email, WhatsApp, copyable templates.
5. Deposit/payment tracking UI after the schema is planned.
6. SEO/trust/portfolio improvements.
