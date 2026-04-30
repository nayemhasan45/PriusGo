# PriusGo Version 2 Implementation Plan

> **For Hermes / Claude Code:** Use `subagent-driven-development` or small verified tasks to implement this plan. Do not rebuild PriusGo from zero. Preserve the existing Next.js + Supabase architecture and keep every change tested.

**Goal:** Turn PriusGo from a deployable MVP into a real small car-rental operating system for Al-Amin’s Šiauliai Prius rental business.

**Architecture:** Keep the current browser-to-Supabase model. Version 2 should add stronger business workflows, better admin operations, mobile-first UX, legal/contract support, notifications, and production monitoring without introducing a custom backend unless a feature truly requires server-side secrets.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth/Postgres/RLS/Storage, Vitest, Vercel.

---

## Current MVP Baseline

Version 1 already has:

- Customer landing page and dynamic fleet display
- Supabase Auth with email/password and Google OAuth
- Login-required booking request flow
- Customer dashboard
- Admin booking dashboard
- Admin car management
- Admin car photo upload to Supabase Storage bucket `car-images`
- Dynamic admin-managed fleet; no seeded cars
- Availability calendars and blocked booking ranges
- Race-safe database protection against overlapping `approved`/`completed` bookings
- Redirect allowlist for login redirect safety
- Local-date formatting to avoid timezone day-shift bugs
- Tests/lint/build passing as of 2026-05-01

Before starting V2, run:

```bash
cd /Users/al-amin/PriusGo/frontend
npm test
npm run lint
npm run build
```

Also run the latest SQL once in Supabase SQL Editor:

```text
/Users/al-amin/PriusGo/backend/supabase-schema.sql
```

---

## Version 2 Strategy

Build V2 in this order:

1. Responsive polish for phone/tablet/laptop/desktop
2. Production deployment and smoke testing
3. Business/legal rental workflow
4. Admin operations and fleet maintenance
5. Notifications and customer communication
6. Payments/deposit tracking without rushing into risky payment automation
7. Analytics, SEO, and portfolio/case-study polish

Do not add online payments until insurance, contract, refund, deposit, and tax handling are clear.

---

## Phase V2.1 — Responsive UX Polish

**Objective:** Make PriusGo feel trustworthy and usable on phone, tablet, laptop, and desktop.

**Files to inspect first:**

```text
frontend/src/app/page.tsx
frontend/src/components/header.tsx
frontend/src/components/customer-cars.tsx
frontend/src/components/car-card.tsx
frontend/src/components/booking-form.tsx
frontend/src/components/booking-date-picker.tsx
frontend/src/components/booking-calendar.tsx
frontend/src/components/admin-bookings.tsx
frontend/src/components/admin-cars.tsx
frontend/src/app/dashboard/page.tsx
```

**Tasks:**

1. Audit homepage at widths 390, 768, 1024, 1440.
2. Fix header/mobile navigation if links or CTAs crowd.
3. Ensure car cards stack cleanly on mobile.
4. Ensure booking date picker is touch-friendly.
5. Ensure admin tables/cards are usable on phone; prefer card layout on narrow screens if tables overflow.
6. Check all forms have readable labels, large tap targets, and clear error states.
7. Browser smoke test each major page.

**Verification:**

```bash
cd frontend
npm test
npm run lint
npm run build
```

Manual browser checks:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/admin/bookings
http://localhost:3000/admin/cars
```

---

## Phase V2.2 — Production Deployment Readiness

**Objective:** Deploy safely to Vercel with Supabase configured correctly.

**Tasks:**

1. Confirm `backend/supabase-schema.sql` has been run in production Supabase.
2. Confirm `car-images` bucket exists and public read/admin write policies work.
3. Set Vercel env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

4. Never set a service-role key in `NEXT_PUBLIC_*`.
5. Add production domain to Supabase Auth URL configuration.
6. Test Google OAuth callback in production.
7. Test admin login and non-admin denial.
8. Test booking creation and admin approval.
9. Test overlapping booking rejection.

**Acceptance criteria:**

- Production homepage loads.
- Booking request works for logged-in customer.
- Admin can approve a valid booking.
- Admin cannot approve overlapping confirmed bookings.
- Photo upload works from admin cars page.

---

## Phase V2.3 — Rental Agreement and Business Safety

**Objective:** Add practical rental-business safety without pretending the app replaces legal advice.

**Important Islamic/business rule:** Avoid fraud, hidden fees, exploitation, riba-heavy workflows when avoidable, and unclear contract terms.

**Tasks:**

1. Add rental rules page or section with clear terms.
2. Add admin-editable pickup/return instructions later if needed.
3. Add booking fields for:
   - driver license check status
   - deposit amount agreed
   - pickup time
   - return time
   - notes about fuel/cleanliness/damage
4. Add admin-only booking notes.
5. Create a printable booking summary/contract draft.
6. Add checkbox confirmation before customer submits booking request:
   - customer confirms valid driving license
   - customer accepts rental rules
   - customer agrees booking is not final until admin confirms

**Files likely affected:**

```text
backend/supabase-schema.sql
frontend/src/components/booking-form.tsx
frontend/src/components/admin-bookings.tsx
frontend/src/app/dashboard/page.tsx
frontend/src/lib/supabase/bookings.ts
frontend/src/lib/types.ts
```

**Verification:**

- Add tests for new booking insert/mapping fields.
- Confirm RLS does not expose admin notes to customers.

---

## Phase V2.4 — Admin Operations Dashboard

**Objective:** Help Al-Amin run the rental business day to day.

**Tasks:**

1. Add admin dashboard summary page:
   - active rentals
   - pending requests
   - cars available today
   - cars returning today
   - estimated revenue
2. Add filters/search on admin bookings:
   - status
   - car
   - date range
   - customer phone/email
3. Add maintenance status workflow:
   - mark car as maintenance
   - maintenance note
   - next available date
4. Add simple export CSV for bookings.
5. Improve empty/loading/error states.

**Files likely affected:**

```text
frontend/src/app/admin/bookings/page.tsx
frontend/src/app/admin/cars/page.tsx
frontend/src/components/admin-bookings.tsx
frontend/src/components/admin-cars.tsx
frontend/src/lib/supabase/bookings.ts
frontend/src/lib/supabase/cars.ts
```

---

## Phase V2.5 — Notifications and Communication

**Objective:** Make it harder to miss bookings and easier to contact customers.

**Recommended path:** Start with manual/contact helpers first. Do not add secret API keys to the frontend.

**Tasks:**

1. Add WhatsApp/tel/mailto quick actions in admin booking cards.
2. Add copyable customer message templates:
   - booking received
   - booking approved
   - booking rejected
   - pickup reminder
   - return reminder
3. Later, add email notifications using a server-safe route or provider only if secrets can be kept server-side.
4. Consider Telegram/admin notification only if secure and useful.

**Security note:** Notification provider secrets must not be exposed in browser code.

---

## Phase V2.6 — Deposits, Payments, and Accounting Prep

**Objective:** Track money safely before automating payments.

**Tasks:**

1. Add admin fields:
   - payment status: unpaid/deposit-paid/paid/refunded
   - deposit amount
   - payment method: cash/bank/card/other
   - payment notes
2. Add booking total breakdown:
   - rental total
   - deposit
   - discount
   - extra charges
3. Add admin-only accounting export.
4. Decide legal/tax handling before online payments.

**Do not implement card payments until:**

- rental terms are clear
- refund/deposit rules are clear
- business registration/tax workflow is clear
- payment provider fees and chargeback risks are understood

---

## Phase V2.7 — SEO, Trust, and Portfolio Value

**Objective:** Make PriusGo useful for customers and strong as a software-agency demo.

**Tasks:**

1. Add metadata and OpenGraph image.
2. Add local SEO copy for Šiauliai, Lithuania.
3. Add FAQ schema if appropriate.
4. Add trust sections:
   - hybrid fuel economy
   - pickup location
   - driver requirements
   - transparent pricing
5. Add portfolio case study documentation:
   - problem
   - solution
   - tech stack
   - screenshots
   - business impact

---

## Version 2 Quality Gates

Every V2 coding task must finish with:

```bash
cd /Users/al-amin/PriusGo/frontend
npm test
npm run lint
npm run build
```

For database changes:

1. Update `backend/supabase-schema.sql`.
2. Update `backend/docs/SUPABASE.md`.
3. Add/adjust mapping tests in `frontend/src/lib/supabase/*.test.ts`.
4. Run SQL in Supabase SQL Editor only after review.
5. Confirm RLS manually.

For auth/security changes:

1. No secrets in frontend.
2. No unsafe redirect from URL query.
3. No service-role key in `NEXT_PUBLIC_*`.
4. RLS must be the real protection, not only client-side UI.

---

## V2 First Sprint Recommendation

Start with this sprint:

1. Responsive audit and fixes for phone/tablet/laptop/desktop.
2. Production Vercel deploy checklist.
3. Manual smoke test checklist.
4. Add rental rules acceptance checkbox.
5. Add admin notes/payment status fields only after DB plan is reviewed.

This keeps the app safe, useful, and close to real business needs without overbuilding.
