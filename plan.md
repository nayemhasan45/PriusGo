# PriusGo Production Hardening Plan

> **For Claude Code / OpenCode:** Execute this plan as a production-quality hardening pass for a real rental business. Do not redesign from scratch. Improve the existing Next.js + Supabase app in controlled phases. Do not mark the project “10/10” until the completion gate at the end is satisfied.

**Goal:** Turn PriusGo from a strong MVP into a production-ready customer-facing rental site and admin tool that feels trustworthy, converts well, works cleanly on mobile/tablet/desktop, and has no obvious UX, quality, or operational gaps.

**Architecture:** Keep the current stack and route structure. Improve the system in layers: (1) business-critical booking flow and auth correctness, (2) responsive UX and conversion polish, (3) production safeguards and content trust, (4) QA automation and launch verification.

**Tech stack:** Next.js 16 app router, React 19, TypeScript, Tailwind 4, Supabase Auth/Postgres/RLS/Storage, Vitest, Vercel.

---

## 0. Verified current state

### Confirmed from codebase
- Public site exists in `frontend/src/app/page.tsx`.
- Auth page exists in `frontend/src/app/login/page.tsx` + `frontend/src/components/auth-form.tsx`.
- Customer dashboard exists in `frontend/src/app/dashboard/page.tsx` + `frontend/src/components/dashboard-bookings.tsx`.
- Admin dashboard exists in `frontend/src/app/admin/**` + admin components.
- Supabase schema/docs exist in `backend/supabase-schema.sql` and `backend/docs/SUPABASE.md`.
- Automated tests currently pass: `npm test` → 31 tests passed.
- Production build currently passes: `npm run build` → success.

### Confirmed from live site review
- Visual design is already strong.
- Responsive foundation exists, but tablet behavior and content density need work.
- Car cards are attractive but too dense.
- Booking section empty-state feels unfinished.
- The “select car → booking form” flow behaved incorrectly during live browser testing: clicking a car CTA scrolled to booking, but the booking area still showed “Choose a car from the fleet first.” This must be treated as a release blocker until disproven with local reproduction and fix.

### Current code quality gap
- `npm run lint` produced noisy output because ESLint is still traversing stale generated `.next.stale-*` artifacts. Treat lint configuration / generated-folder hygiene as part of production hardening.

---

## 1. Product standard for “10/10”

PriusGo should not be considered finished until all of these are true:

1. A first-time renter can land on the homepage, choose a car, pick dates, sign in if needed, submit a booking, and understand what happens next without confusion.
2. The site feels clean and intentional on:
   - small mobile (`360–430px`)
   - tablet (`768–1024px`)
   - laptop (`1280–1440px`)
   - large monitor (`1600px+`)
3. All core states are polished:
   - loading
   - empty
   - success
   - validation error
   - unauthorized
   - admin forbidden
4. Trust is obvious:
   - who runs the service
   - where pickup happens
   - what documents are needed
   - how payment/deposit work
   - what happens after request submission
5. Code quality is enforceable with repeatable checks.
6. Launch docs clearly tell the operator how to verify production.

---

## 2. Phase plan

## Phase 1 — Release blockers and business-critical correctness

### Objective
Fix anything that could directly lose bookings, confuse renters, or break operational trust.

### Files to inspect / modify
- `frontend/src/components/car-card.tsx`
- `frontend/src/components/booking-form.tsx`
- `frontend/src/components/customer-cars.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/header.tsx`
- `frontend/src/components/auth-form.tsx`
- `frontend/src/components/dashboard-bookings.tsx`
- `frontend/src/lib/supabase/client.ts`
- `frontend/src/components/*.test.tsx` (add missing tests)
- `frontend/src/lib/**/*.test.ts`

### Tasks

#### Task 1.1 — Reproduce and fix the selected-car booking flow
**Why:** This is the highest-risk issue found in the live review.

**Implementation notes:**
- Verify whether the bug is real in local dev and production, or a browser-automation edge case.
- If real, remove fragile event-only coupling.
- Prefer a more deterministic mechanism than a transient custom event alone.

**Recommended approach:**
- Keep the `CustomEvent` only if needed for progressive enhancement.
- Add one durable source of truth, such as:
  - query param (`/#booking?car=MJO146` style if workable), or
  - local/session state keyed as selected car, or
  - lifted state via shared client wrapper if you want tighter app control.
- Ensure “Rent this car,” plate badge CTA, and “Book Now” all produce predictable behavior.

**Add tests:**
- Create a component test for selecting a car and verifying booking form state updates.
- Create a regression test for scroll target + selected car visible.

**Acceptance criteria:**
- Clicking a car CTA always results in the booking section showing the selected car.
- No empty-state remains after a successful selection.
- Test coverage exists for this exact flow.

---

#### Task 1.2 — Audit the auth handoff around booking submission
**Why:** Real customers should never lose entered data or get stuck.

**Inspect carefully:**
- `frontend/src/components/booking-form.tsx`
- `frontend/src/components/auth-form.tsx`
- `frontend/src/lib/auth-redirect.ts`
- `frontend/src/app/login/page.tsx`

**What to verify/fix:**
- Draft booking survives login redirect reliably.
- After login, user returns to the correct section and sees retained data.
- Signup, login, Google sign-in, password reset, and redirect states have user-friendly messaging.
- Error messages are business-safe and non-technical.

**Add tests:**
- Booking draft survives redirect.
- Unsafe `redirectTo` inputs stay sanitized.
- Returning renter lands back in the intended booking flow.

**Acceptance criteria:**
- A non-logged-in user can begin a booking, sign in, and continue without re-entering everything.
- No confusing “why did my form disappear?” state remains.

---

#### Task 1.3 — Make loading/empty/error states business-polished
**Why:** Real business apps are judged heavily by edge states.

**Targets:**
- `frontend/src/components/customer-cars.tsx`
- `frontend/src/components/booking-form.tsx`
- `frontend/src/components/dashboard-bookings.tsx`
- admin overview / bookings / cars components

**What to improve:**
- Replace placeholder-feeling text with trust-building copy.
- Ensure every loading state feels intentional.
- Ensure empty states tell the user what to do next.
- Ensure error states include one clear next step.

**Acceptance criteria:**
- No core screen feels like a dev placeholder.
- Empty/error states are understandable by a normal customer, not a developer.

---

#### Task 1.4 — Fix lint hygiene and generated-folder handling
**Why:** You need reliable quality checks before launch.

**Files:**
- `frontend/eslint.config.mjs`
- optionally repo-level ignore files if needed

**What to do:**
- Confirm why `.next.stale-*` is still being linted.
- Update ignore patterns until `npm run lint` only scans real source files.
- Remove or document stale artifact directories from local workflow.

**Acceptance criteria:**
- `npm run lint` runs against source files only.
- Lint output is actionable and small enough to trust.

---

## Phase 2 — Responsive layout to true production standard

### Objective
Make the site feel deliberate on mobile, tablet, laptop, and large monitors.

### Files to inspect / modify
- `frontend/src/components/header.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/car-card.tsx`
- `frontend/src/components/booking-form.tsx`
- `frontend/src/components/booking-calendar.tsx`
- `frontend/src/components/booking-date-picker.tsx`
- `frontend/src/app/globals.css`

### Tasks

#### Task 2.1 — Rework header breakpoints for tablet
**Problem:** The current header shows full nav from `md`, which is likely too crowded on tablet.

**What to change:**
- Move desktop nav reveal from `md` to `lg` unless testing proves `md` is stable.
- Keep a compact mobile/tablet menu for medium widths.
- Verify sticky header behavior does not steal too much vertical space.

**Acceptance criteria:**
- Header never feels cramped at `768px`, `820px`, `912px`, or `1024px`.
- CTA remains visible and clear.

---

#### Task 2.2 — Simplify car cards for scanability
**Problem:** Car cards currently carry too much information at once.

**What to change:**
- Keep the primary business info above the fold:
  - car name
  - availability
  - price
  - 2–3 key specs
  - primary CTA
- Reduce visible clutter from secondary details.
- Review whether the plate badge should remain a primary interaction or become a label.
- Ensure the calendar presentation does not dominate the card visually.

**Acceptance criteria:**
- A renter can compare two cars in under 5 seconds.
- The CTA remains the most obvious action.

---

#### Task 2.3 — Strengthen booking section layout across breakpoints
**Problem:** The booking area currently feels sparse before selection and heavy after selection.

**What to change:**
- Improve the pre-selection state so it looks like part of a guided process.
- Tune form spacing and input grouping for tablet/mobile.
- Make the selected-car summary more premium and easier to scan.
- Ensure checkbox/rules area does not feel dense on small screens.

**Acceptance criteria:**
- Booking section feels like a guided funnel, not a placeholder.
- Mobile and tablet forms feel comfortable, not cramped.

---

#### Task 2.4 — Tune large-screen composition
**Problem:** The site is fine on large monitors, but not yet “premium wide-screen deliberate.”

**What to change:**
- Review section widths and negative space on `1440px–1728px` widths.
- Improve balance of hero, contact, and trust sections on large screens.
- Add stronger composition rhythm rather than simply centering a fixed-width stack.

**Acceptance criteria:**
- Large monitors feel premium, not just stretched desktop.

---

## Phase 3 — Trust, conversion, and real-business clarity

### Objective
Make renters feel safe enough to submit a real booking.

### Files to inspect / modify
- `frontend/src/app/page.tsx`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/rental-rules/page.tsx`
- `frontend/src/components/booking-form.tsx`
- `frontend/public/images/*` (only if needed for trust visuals)

### Tasks

#### Task 3.1 — Upgrade trust copy and contact clarity
**What to improve:**
- Clarify exactly how approval works.
- Clarify expected response time if known.
- Clarify required documents.
- Clarify pickup/handoff expectation.
- Clarify payment/deposit flow in customer language.

**Important:** Do not invent business promises. Use only what PriusGo can actually deliver.

**Acceptance criteria:**
- A new renter understands the process without contacting support first.

---

#### Task 3.2 — Add stronger social proof / operational proof
**Possible additions depending on available real data:**
- renter testimonials
- number of successful rentals
- “locally managed in Šiauliai” proof
- response speed promise
- clear operator identity
- handoff/check process reassurance

**If real testimonials do not exist yet:**
- add a placeholder section only if it can be honest, or skip until real data exists.
- prefer operational trust proof over fake-looking social proof.

**Acceptance criteria:**
- Trust section looks real and business-backed, not generic marketing filler.

---

#### Task 3.3 — Tighten CTA funnel
**Current issue:** Many CTAs compete with each other.

**What to do:**
- Make the primary path unmistakable:
  1. choose car
  2. choose dates
  3. sign in if required
  4. submit request
- Secondary CTAs should support that path, not distract from it.

**Acceptance criteria:**
- The page has one obvious primary journey.

---

#### Task 3.4 — SEO and metadata production pass
**Files:**
- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- route-level metadata files if added

**What to review:**
- metadata currently references Vercel URL directly
- confirm canonical strategy for real business domain
- improve local SEO quality for Šiauliai / Lithuania rental intent
- confirm OG image quality
- add any missing structured data only if correct and maintainable

**Acceptance criteria:**
- Metadata is aligned with final production domain, not temporary deployment identity.

---

## Phase 4 — Admin and operator workflow hardening

### Objective
Ensure the owner/admin side is reliable for day-to-day business use.

### Files to inspect / modify
- `frontend/src/components/admin-overview.tsx`
- `frontend/src/components/admin-bookings.tsx`
- `frontend/src/components/admin-cars.tsx`
- `frontend/src/components/admin-shell.tsx`
- `frontend/src/lib/supabase/admin-overview.ts`
- `frontend/src/lib/supabase/admin-bookings.ts`
- `frontend/src/lib/supabase/cars.ts`
- `backend/supabase-schema.sql`
- `backend/docs/SUPABASE.md`

### Tasks

#### Task 4.1 — Review admin journeys as real operator workflows
**Check flows:**
- review new booking
- approve/reject booking
- inspect customer details
- inspect time/date conflicts
- check deposit/payment state
- review pickups/returns today
- update fleet status
- confirm unavailable / maintenance behavior

**Acceptance criteria:**
- The admin panel supports daily work without guesswork.

---

#### Task 4.2 — Add missing guardrails for operational mistakes
**Ideas to assess:**
- stronger status-change confirmation for risky actions
- clearer payment/deposit labels
- more obvious car availability consequences after approval
- stronger empty-state guidance in admin pages
- clearer distinction between pending vs approved vs completed business logic

**Acceptance criteria:**
- Admin cannot easily make a silent business mistake.

---

#### Task 4.3 — Align schema/docs with real operations
**What to review:**
- does schema support all required booking/payment/deposit fields?
- do names in SQL, frontend mapping, and docs still match?
- is `backend/docs/SUPABASE.md` sufficient for a future operator/dev handoff?

**Acceptance criteria:**
- Schema, docs, and UI language are aligned.

---

## Phase 5 — Testing, QA, and launch discipline

### Objective
Move from “works on my machine” to repeatable release confidence.

### Files to inspect / modify
- `frontend/package.json`
- `frontend/vitest.config.ts`
- `frontend/src/test/setup.ts`
- component and lib test files
- optional new E2E setup if introduced
- `backend/docs/SUPABASE.md`
- this file: `plan.md`

### Tasks

#### Task 5.1 — Expand automated coverage where business risk is highest
**Add tests for:**
- selected car → booking form flow
- booking draft survives auth redirect
- booking form validation states
- header responsive behavior logic if practical
- admin critical mapping/summary logic

**Nice to have:**
- lightweight Playwright E2E for true production paths if you want stronger release safety

**Acceptance criteria:**
- The most important booking and auth flows have regression protection.

---

#### Task 5.2 — Create a production smoke-test checklist
**Document in repo:**
- homepage load
- fleet data visible
- select car works
- booking request submit works
- login/signup/reset works
- dashboard shows booking
- admin sees booking
- admin approval updates availability
- car image upload works
- mobile/tablet/desktop screenshots reviewed

**Files:**
- update `backend/docs/SUPABASE.md`
- optionally create `docs/launch-smoke-checklist.md`

**Acceptance criteria:**
- Any developer/operator can verify a deployment the same way every time.

---

#### Task 5.3 — Make quality commands mandatory before release
**Target commands:**
- `npm run lint`
- `npm test`
- `npm run build`

**If possible add:**
- a single `npm run check` script combining them

**Acceptance criteria:**
- There is one obvious pre-release validation workflow.

---

## 3. Exact priority order

### Must ship first
1. Selected-car booking flow correctness
2. Auth redirect + draft preservation verification
3. Lint hygiene / trusted checks
4. Tablet header breakpoint fix
5. Car card simplification
6. Booking section UX polish

### Next
7. Trust/copy/contact improvement
8. CTA funnel cleanup
9. Admin workflow hardening
10. SEO/canonical/domain pass

### Final polish
11. Large-monitor composition tuning
12. Expanded regression coverage
13. Launch smoke-test docs

---

## 4. Developer execution checklist

For each task completed, the developer must record:
- what changed
- exact files touched
- screenshots before/after for responsive/UI work
- test commands run
- any unresolved risk

Required verification after each meaningful UI phase:
- `npm test`
- `npm run build`
- manual review at `360px`, `390px`, `768px`, `820px`, `1024px`, `1280px`, `1440px`, `1728px`

Required manual booking-flow checks:
1. select first car
2. verify selected car appears in booking section
3. try unauthenticated booking
4. get redirected to login
5. log in
6. verify return to booking flow with preserved intent/data
7. submit request
8. verify dashboard record
9. verify admin visibility
10. verify approved booking blocks dates correctly

---

## 5. Recommended file additions

Create these if they help execution clarity:
- `docs/launch-smoke-checklist.md`
- `docs/responsive-qa-checklist.md`
- `frontend/src/components/booking-form.test.tsx`
- `frontend/src/components/car-card.test.tsx`
- `frontend/src/components/admin-*.test.tsx` where business logic is thinly covered

---

## 6. Completion gate — do not say “finished” until all pass

The project is only “10/10 production-ready” when all statements below are true:

- [ ] Booking flow bug is either fixed or disproven with solid local/prod evidence.
- [ ] Car selection always persists into the booking experience.
- [ ] Auth redirect flow preserves user progress cleanly.
- [ ] Mobile, tablet, laptop, and large-monitor layouts have been manually reviewed and polished.
- [ ] Header feels clean on tablet widths.
- [ ] Fleet cards are simpler and easier to scan.
- [ ] Booking section feels premium in both empty and active states.
- [ ] Trust/copy/contact information feels real-business ready.
- [ ] Admin workflow supports daily operations cleanly.
- [ ] `npm run lint` is trustworthy and source-only.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] Production smoke-test checklist exists and has been executed.
- [ ] Domain/canonical/SEO settings match the real business deployment.

---

## 7. Immediate next action

Start with **Phase 1 / Task 1.1** and do not move on until the selected-car booking flow is proven reliable by both automated and manual checks. when every phase is done ask approvel form user if he approves , then start the next phase 
