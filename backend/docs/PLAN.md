# PriusGo Current Plan — 2026-05-04

> **For Hermes / Claude Code:** PriusGo is already live. Do not rebuild it. Inspect current files first, preserve the Next.js 16 + Supabase structure, make small verified changes, and run `npm test && npm run lint && npm run build` from `frontend/` before calling work done.

**Goal:** Turn PriusGo from a working rental MVP into a practical day-to-day tool for Al-Amin’s 2-car Prius rental business in Šiauliai.

**Architecture:** Keep the current browser → Supabase model. Public/customer/admin UI stays in `frontend/`. Database rules, tables, storage, and RLS stay in `backend/supabase-schema.sql`.

**Tech stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth/Postgres/RLS/Storage, Vitest, Vercel.

---

## 1) Current verified status

Checked on **2026-05-04 13:34 EEST**.

### ✅ Done / working now
- Live site is up: `https://prius-go.vercel.app/`
- Homepage loads with no browser console errors.
- Public fleet shows **2 live cars**:
  - `Toyota Prius MJO146`
  - `Toyota Prius MHP235`
- Customer-facing flow already exists:
  - landing page
  - fleet cards
  - availability calendar
  - login/register
  - booking form
  - customer dashboard
- Admin flow already exists:
  - admin bookings page
  - admin cars page
  - add/update/delete cars
  - photo upload to Supabase Storage
  - booking approve/reject/cancel/complete actions
- Backend safety already exists:
  - Supabase auth
  - `profiles.role` admin/customer roles
  - RLS on cars/bookings/profiles
  - DB-level car availability check
  - overlap trigger + exclusion constraint for approved/completed bookings
- Code quality baseline is healthy:
  - `npm test` ✅ 21/21 tests passed
  - `npm run lint` ✅
  - `npm run build` ✅

### Workspace note
- Push product/docs changes only.
- Exclude temporary agent planning files like `.hermes/plans/` from commits.

---

## 2) What needs changing now

These are the **highest-value practical changes now**, in order.

### Priority A — Finish the real rental loop, not just the UI
**Why now:** The app looks good, but real business value comes from handling a booking from request → approval → pickup → return → payment tracking.

**Main gaps right now:**
- booking form does not collect license/contract-confirmation details
- admin cannot track pickup/return progress
- admin cannot store internal notes per booking
- payment/deposit status is missing
- no printable booking summary / rental sheet

### Priority B — Make admin faster for real daily use
**Why now:** With only 2 cars, speed and clarity matter more than fancy features.

**Main gaps right now:**
- no filters/search on admin bookings
- no quick WhatsApp / call / copy actions
- no maintenance note / next available date tracking
- no export for bookings/accounting

### Priority C — Improve trust and conversion on the public side
**Why now:** People rent cars when the site feels real, clear, and safe.

**Main gaps right now:**
- contact section still feels placeholder-like
- rental rules are visible, but not enforced inside booking submission
- no dedicated trust/legal section
- no stronger local SEO / trust signals

---

## 3) Best practical features to add

These are the best additions to make PriusGo more useful in the real world.

### Must-add practical features
1. **Rental rules acceptance checkbox** before booking submit
2. **Driver license check status** on each booking
3. **Deposit amount + payment status** tracking
4. **Admin-only notes** for each booking
5. **Pickup time / return time** fields
6. **Pickup status flow**: `pending → approved → picked_up → returned → completed`
7. **Quick contact buttons**: call / WhatsApp / email / copy number
8. **Printable booking summary / contract draft**
9. **Booking filters** by status, car, date, customer
10. **CSV export** for admin records

### Strong second-wave features
11. **Maintenance note + next available date** per car
12. **Damage / fuel / mileage checklist fields**
13. **Reminder message templates** for approve / pickup / return
14. **Public trust section**: valid documents required, transparent price, pickup area, process
15. **Responsive admin polish** for phone/tablet

### Later, not now
- online card payments
- refund automation
- full notification backend with secret APIs
- customer self-service cancellation logic with business rules
- multi-language support
- advanced analytics dashboard

---

## 4) Recommended implementation order

## Sprint 1 — Make bookings legally/operationally safer
**Outcome:** A booking request contains the minimum info needed for a real rental decision.

**Do:**
- add booking form acceptance checkboxes
- add booking fields for:
  - license confirmed
  - deposit agreed
  - pickup time
  - return time
  - admin notes
- show those fields in admin bookings
- keep admin notes hidden from customer view

**Files likely to change:**
- `backend/supabase-schema.sql`
- `frontend/src/components/booking-form.tsx`
- `frontend/src/components/admin-bookings.tsx`
- `frontend/src/components/dashboard-bookings.tsx`
- `frontend/src/lib/supabase/bookings.ts`
- `frontend/src/lib/supabase/bookings.test.ts`
- `frontend/src/lib/supabase/admin-bookings.ts`
- `frontend/src/lib/supabase/admin-bookings.test.ts`
- `frontend/src/lib/types.ts`

**Acceptance check:**
- customer can submit booking with the new required confirmations
- admin sees internal workflow fields
- customer does **not** see admin-only notes
- tests/lint/build pass

---

## Sprint 2 — Make admin usable as a real operations panel
**Outcome:** Al-Amin can manage bookings quickly without digging through every card.

**Do:**
- add filters/search on admin bookings:
  - status
  - car
  - date range
  - customer phone/email/name
- add quick actions:
  - call
  - WhatsApp
  - email
  - copy phone
- add richer booking status flow:
  - `pending`
  - `approved`
  - `picked_up`
  - `returned`
  - `completed`
  - `rejected`
  - `cancelled`
- improve empty/loading/error states

**Files likely to change:**
- `backend/supabase-schema.sql`
- `frontend/src/components/admin-bookings.tsx`
- `frontend/src/lib/supabase/admin-bookings.ts`
- `frontend/src/lib/supabase/admin-bookings.test.ts`
- `frontend/src/lib/supabase/bookings.ts`
- `frontend/src/lib/types.ts`

**Acceptance check:**
- admin can find a booking in seconds
- one booking card gives direct contact actions
- new statuses do not break overlap logic
- tests/lint/build pass

---

## Sprint 3 — Add money tracking without risky payment automation
**Outcome:** PriusGo can track who paid what, without jumping into Stripe/payment risk too early.

**Do:**
- add admin payment fields:
  - payment status
  - deposit amount
  - payment method
  - payment notes
- add price breakdown:
  - rental total
  - deposit
  - discount
  - extra charge
- add CSV export for bookings/accounting

**Files likely to change:**
- `backend/supabase-schema.sql`
- `frontend/src/components/admin-bookings.tsx`
- `frontend/src/lib/supabase/bookings.ts`
- `frontend/src/lib/supabase/admin-bookings.ts`
- `frontend/src/lib/types.ts`
- maybe new helper file: `frontend/src/lib/export.ts`

**Acceptance check:**
- admin can track unpaid / deposit-paid / paid / refunded
- export opens cleanly in spreadsheet apps
- tests/lint/build pass

---

## Sprint 4 — Make fleet management more practical
**Outcome:** Car status reflects real availability and maintenance reality.

**Do:**
- add maintenance note per car
- add next available date per car
- add optional odometer / service reminder fields later if useful
- make unavailable/maintenance explanation clearer in admin and public views

**Files likely to change:**
- `backend/supabase-schema.sql`
- `frontend/src/components/admin-cars.tsx`
- `frontend/src/components/car-card.tsx`
- `frontend/src/components/customer-cars.tsx`
- `frontend/src/lib/supabase/cars.ts`
- `frontend/src/lib/supabase/cars.test.ts`
- `frontend/src/lib/types.ts`

**Acceptance check:**
- admin can mark why a car is unavailable
- customer sees clearer availability messaging
- tests/lint/build pass

---

## Sprint 5 — Public trust + conversion polish
**Outcome:** Site feels more real and ready for strangers, not only friends.

**Do:**
- replace weak placeholder-style contact wording with real contact method(s)
- strengthen rules/trust section:
  - license required
  - ID required
  - booking not final until confirmed
  - deposit may be required
  - pickup/return policy
- add trust blocks:
  - transparent pricing
  - local pickup in Šiauliai
  - hybrid fuel saving
  - clear booking process
- improve local SEO metadata/copy
- smoke test phone + tablet layouts again

**Files likely to change:**
- `frontend/src/app/page.tsx`
- `frontend/src/components/header.tsx`
- `frontend/src/app/layout.tsx`
- possible metadata assets/docs

**Acceptance check:**
- homepage feels less demo-like
- user knows how renting works before messaging you
- tests/lint/build pass

---

## 5) What is already done vs not done

### DONE
- live deployment
- 2-car public fleet
- customer auth
- customer booking request flow
- dashboard for customer bookings
- admin bookings management
- admin cars management
- photo upload
- booking overlap protection
- test/lint/build green

### NOT DONE YET
- contract/rules acceptance enforcement inside booking submit
- driver screening workflow
- admin-only notes
- pickup/return workflow status
- deposit/payment tracking
- quick communication actions
- booking filters/search
- CSV export
- maintenance notes / next available date
- printable rental sheet
- stronger trust/SEO conversion polish

---

## 6) Best next action for you

If you want the **most practical next coding step**, do this first:

### Next task to work on now
**Implement Sprint 1 only:**
- rental rules acceptance checkbox
- license confirmation field
- deposit agreed field
- pickup time / return time
- admin-only notes

Why this first:
- biggest jump from demo → real rental workflow
- low feature count, high business value
- creates the data foundation for later admin/payment improvements

---

## 7) Verification commands for every coding sprint

Run from `frontend/`:

```bash
npm test
npm run lint
npm run build
```

For DB changes:
- update `backend/supabase-schema.sql`
- update related mapper/tests
- apply SQL in Supabase only after review
- manually confirm RLS behavior

---

## 8) Scope guard

Do **not** jump into these yet:
- Stripe or online card payments
- backend secret-heavy notification systems
- multi-language content
- large redesign from scratch
- complex analytics dashboards

PriusGo already has a good base. The smart move now is **practical business workflow**, not rebuilding visuals again.
