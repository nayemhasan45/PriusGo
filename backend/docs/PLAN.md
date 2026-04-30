# PriusGo MVP Completion Plan

> **For Hermes:** Use this as the main execution plan for finishing PriusGo. Do not rebuild from zero. Verify existing work first, then finish only what is missing.

**Goal:** Make PriusGo a working Toyota Prius rental website for Šiauliai where customers can view cars, log in, request bookings, and Al-Amin can manage bookings/cars as admin.

**Architecture:** PriusGo uses a Next.js frontend and Supabase backend. The frontend lives in `frontend/`; backend SQL/docs live in `backend/`. Supabase handles auth, database, RLS, customer profiles, cars, bookings, and admin role checks.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth, Supabase PostgreSQL, Vitest, Vercel.

---

## Completed Work (as of 2026-04-30)

- ✅ Phase 1: App verified, tests pass, build passes
- ✅ Phase 2: Supabase connected (env vars, schema applied, storage bucket created)
- ✅ Phase 3: Auth working — email/password + Google OAuth, profiles auto-created
- ✅ Phase 4: Customer booking flow works end-to-end with Supabase
- ✅ Phase 5: Admin role configured, admin pages protected by RLS
- ✅ Phase 6: Novaride-inspired homepage redesign complete
- ✅ Admin car image uploads via Supabase Storage (`car-images` bucket)
- ✅ Admin can add/delete cars (delete gated by booking check)
- ✅ Fleet is fully dynamic — no seed cars, admin-driven only
- ✅ Interactive availability calendars on car cards and booking form
- ✅ Live fleet count on homepage banner
- ⬜ Phase 7: Business/legal safety (non-code — insurance, contracts, payment policy)
- ⬜ Phase 8: Deploy to Vercel
- ⬜ Phase 9: Portfolio case study

---

## Current Project State

Main frontend app:

```text
/Users/al-amin/PriusGo/frontend
```

Backend/database files:

```text
/Users/al-amin/PriusGo/backend
```

Important files:

```text
/Users/al-amin/PriusGo/frontend/package.json
/Users/al-amin/PriusGo/frontend/src/app/page.tsx
/Users/al-amin/PriusGo/frontend/src/components/booking-form.tsx
/Users/al-amin/PriusGo/frontend/src/components/customer-cars.tsx
/Users/al-amin/PriusGo/frontend/src/components/admin-bookings.tsx
/Users/al-amin/PriusGo/frontend/src/components/admin-cars.tsx
/Users/al-amin/PriusGo/frontend/src/app/dashboard/page.tsx
/Users/al-amin/PriusGo/frontend/src/app/admin/bookings/page.tsx
/Users/al-amin/PriusGo/frontend/src/app/admin/cars/page.tsx
/Users/al-amin/PriusGo/backend/supabase-schema.sql
/Users/al-amin/PriusGo/backend/docs/SUPABASE.md
```

Already exists:

- Landing page
- Car cards/customer cars component
- Booking form component
- Login page
- Customer dashboard page
- Admin bookings page
- Admin cars page
- Supabase schema
- Supabase docs
- Vitest tests

Supabase project URL documented in `backend/docs/SUPABASE.md`:

```text
https://tiaoqvqshkwrvukvywzh.supabase.co
```

---

## MVP Success Criteria

PriusGo MVP is complete when:

1. Homepage loads cleanly.
2. Cars are visible with price/status.
3. Customer can sign up/login.
4. Customer can submit a booking request.
5. Booking is saved in Supabase.
6. Customer dashboard shows customer’s own bookings.
7. Admin can access admin pages.
8. Normal customers cannot access admin pages.
9. Admin can approve/reject/cancel/complete bookings.
10. Admin can update car status and price.
11. Tests pass.
12. Production build passes.
13. Vercel deployment works.

---

## Phase 1: Verify Existing App

**Objective:** Confirm what works before changing code.

**Files:**

- Read: `frontend/package.json`
- Read: `frontend/src/app/page.tsx`
- Read: `frontend/src/components/booking-form.tsx`
- Read: `frontend/src/components/customer-cars.tsx`
- Read: `frontend/src/components/admin-bookings.tsx`
- Read: `frontend/src/components/admin-cars.tsx`

**Steps:**

1. Go to frontend folder:

```bash
cd /Users/al-amin/PriusGo/frontend
```

2. Install dependencies if needed:

```bash
npm install
```

3. Run tests:

```bash
npm test
```

Expected:

```text
All tests pass
```

4. Run production build:

```bash
npm run build
```

Expected:

```text
Compiled successfully
```

5. Start local dev server:

```bash
npm run dev
```

6. Check pages:

```text
http://localhost:3000/
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/admin/bookings
http://localhost:3000/admin/cars
```

**Success condition:** App runs locally, tests pass, build passes, and pages load.

---

## Phase 2: Connect Supabase

**Objective:** Make the frontend talk to the real Supabase backend.

**Files:**

- Create/Modify: `frontend/.env.local`
- Use: `backend/supabase-schema.sql`
- Read: `backend/docs/SUPABASE.md`

**Steps:**

1. Open Supabase project:

```text
https://tiaoqvqshkwrvukvywzh.supabase.co
```

2. In Supabase Dashboard, copy:

```text
Project URL
Anon public key
```

3. Create `frontend/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tiaoqvqshkwrvukvywzh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Do not commit `.env.local`.

5. In Supabase SQL Editor, run:

```text
/Users/al-amin/PriusGo/backend/supabase-schema.sql
```

6. Confirm these tables exist:

```text
profiles
cars
bookings
```

7. Confirm seed cars exist:

```text
Toyota Prius White
Toyota Prius Silver
```

**Success condition:** Frontend no longer shows “Supabase is not configured,” and car/booking features can access Supabase.

---

## Phase 3: Configure Authentication

**Objective:** Customers can register/login and get a profile row.

**Files:**

- Check: `frontend/src/app/login/page.tsx`
- Check: `frontend/src/components/auth-form.tsx`
- Check: `backend/supabase-schema.sql`

**Steps:**

1. In Supabase Dashboard, go to Authentication → URL Configuration.

2. Set Site URL for local development:

```text
http://localhost:3000
```

3. Add Redirect URLs:

```text
http://localhost:3000/**
http://localhost:3000/dashboard
```

4. Use email/password auth first for MVP.

5. Optional later: enable Google OAuth.

6. Test signup with a normal customer email.

7. Check `profiles` table after signup.

Expected profile:

```text
role = customer
```

**Success condition:** User can sign up, log in, reach `/dashboard`, and automatically gets a `profiles` row.

---

## Phase 4: Test Customer Booking Flow

**Objective:** A logged-in customer can request a Prius rental.

**Files:**

- Check: `frontend/src/components/booking-form.tsx`
- Check: `frontend/src/lib/supabase/bookings.ts`
- Check: `frontend/src/lib/booking.ts`
- Test: `frontend/src/lib/booking.test.ts`
- Test: `frontend/src/lib/supabase/bookings.test.ts`

**Customer flow:**

1. Customer logs in.
2. Customer chooses a car.
3. Customer selects start date and end date.
4. Customer enters phone number.
5. Customer enters pickup location.
6. Customer submits booking request.
7. Booking is saved with:

```text
status = pending
```

**Business rules:**

- End date cannot be before start date.
- Booking must have a car.
- Booking must have a logged-in user.
- Booking must have phone number.
- Booking must have pickup location.
- Approved and completed bookings block overlapping bookings for the same car.
- Availability rule: after admin approves a booking request, that car becomes unavailable for the approved date range for all users.
- Rejected and cancelled bookings do not block availability.
- Pending requests do not block availability until admin approves them.
- Customer UI must clearly show unavailable date ranges per car from approved/completed bookings.
- If another customer selects the same car and overlapping dates, the form must show that the car is unavailable for those dates and prevent submission.
- Current MVP price:
  - €20/day
  - €100/week

**Success condition:** Booking appears in Supabase and on the customer dashboard. The selected car/date range becomes unavailable to other users only after admin approval.

---

## Phase 5: Configure Admin Role

**Objective:** Al-Amin can manage all bookings and cars.

**Files:**

- Check: `frontend/src/app/admin/bookings/page.tsx`
- Check: `frontend/src/app/admin/cars/page.tsx`
- Check: `frontend/src/components/admin-bookings.tsx`
- Check: `frontend/src/components/admin-cars.tsx`
- Check: `frontend/src/lib/supabase/admin-bookings.ts`
- Check: `frontend/src/lib/supabase/cars.ts`

**Steps:**

1. Log in with Al-Amin’s admin email.

2. In Supabase SQL Editor, run:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'your-admin-email@example.com'
);
```

3. Replace `your-admin-email@example.com` with the real admin email.

4. Open admin bookings page:

```text
http://localhost:3000/admin/bookings
```

5. Test status updates:

```text
pending
approved
rejected
cancelled
completed
```

6. Open admin cars page:

```text
http://localhost:3000/admin/cars
```

7. Test car updates:

```text
status
price_per_day
```

Allowed car statuses:

```text
available
unavailable
maintenance
```

**Success condition:** Admin can manage bookings/cars; normal customers cannot.

---

## Phase 6: Novaride-Inspired Homepage Redesign

**Objective:** Redesign PriusGo so it feels like the Novaride demo reference (`https://demo.awaikenthemes.com/novaride/`) while keeping PriusGo's real booking/auth/admin logic. Do not clone/copy Novaride assets or exact images; copy the visual language: typography, orange/black color system, rounded luxury car-rental sections, pill CTAs, car cards, and smooth reveal animations.

**Reference observed from Novaride:**

```text
Font stack: headings use Epilogue, body uses DM Sans
Google font URL: Epilogue + DM Sans
Primary color: #ff3600 / rgb(255, 54, 0)
Text black: #0b0b0b
Body text gray: #616161
Soft section background: #fff7f4 or #fff8f5
White cards: #ffffff
Borders: #e9e9e9
Hero heading: Epilogue, 74px desktop, weight 700, white
Body: DM Sans, 16px, gray
Layout: max-width around 1320px, large 30-40px border radius, big vertical spacing
Animations: fadeInUp reveal, car/testimonial carousel movement, hover lift, arrow icon movement, counter/odometer style stats
```

**Files:**

- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/app/page.tsx`
- Modify: `frontend/src/components/header.tsx`
- Modify: `frontend/src/components/car-card.tsx`
- Modify if needed: `frontend/src/components/customer-cars.tsx`
- Modify if needed: `frontend/src/components/booking-form.tsx`
- Add tests only for changed pure helpers; visual layout itself is verified by lint/build/browser.

### Task 6.1: Switch fonts to Novaride fonts

**Objective:** Use the same font feeling as Novaride.

**Steps:**

1. In `frontend/src/app/layout.tsx`, replace Geist imports with Next Google fonts:

```ts
import { DM_Sans, Epilogue } from "next/font/google";
```

2. Configure fonts:

```ts
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  display: "swap",
});
```

3. Apply both variables to `<body>`:

```tsx
<body className={`${dmSans.variable} ${epilogue.variable} antialiased`}>{children}</body>
```

4. In `frontend/src/app/globals.css`, set Tailwind theme fonts:

```css
@theme inline {
  --font-sans: var(--font-dm-sans);
  --font-heading: var(--font-epilogue);
}
```

5. Body should use DM Sans; headings should use Epilogue via utility classes or global selector.

**Verification:**

```bash
cd /Users/al-amin/PriusGo/frontend
npm run lint
npm run build
```

Expected: both pass.

### Task 6.2: Add Novaride design tokens and animation utilities

**Objective:** Make the project styling consistent and easy for Claude to reuse.

**Add to `frontend/src/app/globals.css`:**

```css
:root {
  --background: #ffffff;
  --foreground: #0b0b0b;
  --priusgo-orange: #ff3600;
  --priusgo-black: #0b0b0b;
  --priusgo-muted: #616161;
  --priusgo-border: #e9e9e9;
  --priusgo-soft: #fff7f4;
  --priusgo-soft-2: #f7f7f7;
  --priusgo-radius-lg: 36px;
  --priusgo-radius-md: 24px;
  --priusgo-shadow: 0 20px 50px rgba(0, 0, 0, 0.08);
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-dm-sans), Arial, Helvetica, sans-serif;
}

h1, h2, h3, .font-heading {
  font-family: var(--font-epilogue), var(--font-dm-sans), sans-serif;
  letter-spacing: -0.03em;
}

.reveal-up {
  animation: priusgoFadeInUp 0.75s ease both;
}

.reveal-up-delay-1 { animation-delay: 0.12s; }
.reveal-up-delay-2 { animation-delay: 0.24s; }
.reveal-up-delay-3 { animation-delay: 0.36s; }

@keyframes priusgoFadeInUp {
  from { opacity: 0; transform: translateY(34px); }
  to { opacity: 1; transform: translateY(0); }
}

.cta-arrow {
  transition: transform 0.25s ease;
}

.group:hover .cta-arrow {
  transform: translate(3px, -3px);
}

.card-lift {
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.card-lift:hover {
  transform: translateY(-6px);
  box-shadow: var(--priusgo-shadow);
  border-color: rgba(255, 54, 0, 0.24);
}
```

**Rules:**

- Use orange `#ff3600` for primary CTAs, arrows, stars, active badges, and highlights.
- Use black for premium footer/header dark areas.
- Use soft blush `#fff7f4` for large rounded sections.
- Do not mix old emerald-heavy branding except small eco badges if needed.

### Task 6.3: Redesign header like Novaride

**Objective:** Make header clean, premium, and CTA-focused.

**Implementation guidance for `frontend/src/components/header.tsx`:**

- Header background: white, sticky, no heavy gradient.
- Logo left: `PRIUS` in black and `GO` in orange or `PriusGo` with orange icon.
- Center/right nav items: Cars, Pricing, Book, FAQ, Dashboard/Admin when applicable.
- Primary CTA right: pill button `Book A Rental` or `Rent a Prius` with orange background and small circular arrow style.
- Desktop nav gap around 32-42px; nav text 14px, font-bold/black.
- Mobile: keep simple login/menu behavior; do not break auth state.

Suggested classes:

```tsx
<header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl">
  <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
```

CTA style:

```tsx
className="group inline-flex items-center gap-3 rounded-full bg-[#ff3600] px-6 py-3 text-sm font-black text-white transition hover:bg-black"
```

### Task 6.4: Build Novaride-style hero with booking overlay

**Objective:** Replace the current split hero with a luxury rounded hero section and an overlapping/attached booking search card.

**Implementation guidance for `frontend/src/app/page.tsx`:**

Hero layout:

```text
White page background
Header
Large rounded hero image-like panel with dark overlay
Centered eyebrow: Affordable Prius rental in Šiauliai
Huge white heading: Rent a Prius. Save fuel. Drive smarter.
Short white/gray paragraph
Two CTAs: Book A Rental orange, View Cars white/transparent
Booking/search panel overlaps bottom or sits directly below on mobile
```

Use CSS/Tailwind background instead of copied Novaride image until real photos exist:

```tsx
<section className="mx-3 mt-4 overflow-hidden rounded-[36px] bg-[#0b0b0b] text-white sm:mx-5">
  <div className="relative min-h-[680px] bg-[radial-gradient(circle_at_20%_20%,rgba(255,54,0,0.35),transparent_28%),linear-gradient(135deg,rgba(0,0,0,0.35),rgba(0,0,0,0.82)),url('/hero-prius.jpg')] bg-cover bg-center">
```

If `/hero-prius.jpg` does not exist, use gradient + CSS car silhouette; do not block the redesign.

Hero typography:

```text
h1 desktop: text-6xl to text-[74px], leading-[1.05], font-bold, Epilogue
h1 mobile: text-4xl/5xl
paragraph: max-w-2xl, text-base/large, white/80
```

Booking overlay options:

- Preferred: keep existing `BookingForm` functionality but restyle it as a white rounded card below hero/inside hero bottom.
- If current `BookingForm` is too large, create a compact top search strip that scrolls/selects into the existing full booking form.
- Must preserve actual Supabase booking submission logic.

Booking card fields should emphasize:

```text
Full name
Phone
Pickup location
Pickup date
Return date
Car selection
CTA: Send Booking Request / Search Availability
```

### Task 6.5: Redesign fleet/car cards like Novaride cards

**Objective:** Make Prius cards look like premium rental cards.

**Implementation guidance for `frontend/src/components/car-card.tsx`:**

Card pattern:

```text
White card
1px #e9e9e9 border
24px border radius
28px padding
Top car image/silhouette area
Small category pill: Hybrid Car / Toyota Prius
Bold car name
Spec rows with icons
Price bottom left
Orange circular arrow CTA bottom right
Unavailable date section remains visible but compact
```

Suggested visual classes:

```tsx
<article className="card-lift rounded-[24px] border border-[#e9e9e9] bg-white p-6">
```

Price style:

```tsx
<p className="font-heading text-2xl font-bold text-black">€{car.pricePerDay}<span className="text-sm font-semibold text-[#616161]">/Per Day</span></p>
```

CTA style:

```tsx
<button className="group flex size-12 items-center justify-center rounded-full bg-[#ff3600] text-white transition hover:bg-black">
  <ArrowRight className="cta-arrow size-5 -rotate-45" />
</button>
```

Keep required data:

```text
name, year, fuel type, transmission, seats, price/day, €100/week, availability status, approved/completed unavailable date ranges
```

### Task 6.6: Add Novaride-style trust/process/testimonial sections

**Objective:** Make the homepage trustworthy enough for real customers and agency demo use.

**Sections to build in `frontend/src/app/page.tsx`:**

1. About/trust section with oval/capsule image placeholders:

```text
Heading: Your trusted partner for reliable Prius rental
Text: fuel-efficient, easy pickup, transparent rules
Orange stat badge: 2 cars / €20 day / Šiauliai pickup / up to 56 MPG
```

2. Soft rounded process section:

```text
Background #fff7f4
Title: Streamlined process for a hassle-free experience
Steps:
1. Choose your Prius
2. Send booking request
3. Admin confirms/approves
4. Pick up in Šiauliai
```

3. Rental rules cards:

```text
Valid driving license required
ID/passport required
Pickup/return in Šiauliai
Fuel policy confirmed before pickup
Customer responsible for fines/damage during rental
No smoking unless allowed by owner
Late return must be reported early
```

4. Testimonials/trust cards, even with placeholder local-style testimonials:

```text
Clean car, low fuel cost, easy pickup
Good for city and family trips
Simple weekly rental
```

5. Black rounded footer section:

```text
PriusGo logo/description
Quick links
Rental policy links/placeholders
Contact placeholders: Phone / WhatsApp, Email, Šiauliai Lithuania
Newsletter/discount input placeholder if useful
```

### Task 6.7: Animation and interaction requirements

**Objective:** Match Novaride's polished motion without adding heavy libraries.

Use CSS-only animations first:

```text
Fade-up on hero title/buttons/cards using reveal-up classes
Hover lift on car cards, FAQ/rule cards, testimonial cards
CTA arrow moves diagonally on hover
Smooth scroll already enabled
Optional: simple CSS marquee/carousel for testimonials only if it does not complicate the app
```

Avoid:

```text
No Framer Motion unless really needed
No breaking server/client boundaries
No animation that hurts mobile usability
No copied template scripts
```

### Task 6.8: Responsive and accessibility checks

**Objective:** Make it work well on mobile and real users.

Requirements:

```text
Hero height reduces on mobile
Booking card stacks on mobile
Car cards 1 column mobile, 2 tablet, 3 desktop if enough cars
CTAs remain keyboard-focusable
Color contrast must be readable
Images/visual placeholders must have meaningful text or be decorative
No horizontal overflow
```

### Task 6.9: Verification commands

Run from frontend:

```bash
cd /Users/al-amin/PriusGo/frontend
npm test
npm run lint
npm run build
npm run dev
```

Browser verify:

```text
http://localhost:3000/
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/admin/bookings
http://localhost:3000/admin/cars
```

Homepage success condition:

```text
A visitor understands within 10 seconds: Prius rental in Šiauliai, price starts at €20/day, cars are fuel-efficient, how to request booking, and why to trust PriusGo.
The design clearly resembles Novaride's premium car-rental style: Epilogue/DM Sans, orange CTAs, large rounded hero, white cards, soft blush sections, black footer, fade-up motion, hover-lift cards, circular arrow CTAs.
All existing booking/auth/admin functionality still works.
```

---

## Phase 7: Business and Legal Safety

**Objective:** Reduce risk before real customers use the cars.

**Non-code tasks:**

1. Confirm insurance allows rental/commercial usage.
2. Prepare rental agreement template.
3. Prepare customer screening checklist.
4. Decide deposit amount.
5. Decide payment methods:

```text
cash
bank transfer
Revolut
card later
```

6. Decide driving area:

```text
Lithuania only
Baltics
EU
```

7. Decide damage/fine/late return policy.

**Islamic/business filter:** Keep it halal and clean. Avoid fraud, unclear terms, unfair charges, hidden manipulation, and riba-based financing where avoidable.

**Success condition:** PriusGo has clear rules before accepting strangers.

---

## Phase 8: Deploy to Vercel

**Objective:** Make PriusGo accessible online.

**Files:**

- Check: `frontend/package.json`
- Check: `frontend/.env.local`
- Configure: Vercel environment variables
- Configure: Supabase Auth redirect URLs

**Steps:**

1. Push project to GitHub.

2. Create Vercel project from:

```text
/Users/al-amin/PriusGo/frontend
```

3. Add Vercel env vars:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tiaoqvqshkwrvukvywzh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Deploy.

5. Add production domain to Supabase Redirect URLs:

```text
https://your-vercel-domain.vercel.app/**
https://your-domain.com/**
```

6. Test production:

```text
Homepage
Login
Booking form
Customer dashboard
Admin bookings
Admin cars
```

**Success condition:** Production website works with auth and bookings.

---

## Phase 9: Portfolio and Client Acquisition Use

**Objective:** Turn PriusGo into proof for the software agency.

**Tasks:**

1. Create 3 screenshots:

```text
Homepage
Customer dashboard
Admin booking dashboard
```

2. Write mini case study:

```text
Problem: Small car rental needs bookings and admin management.
Solution: Next.js + Supabase booking system.
Features: Auth, booking requests, admin dashboard, car management, availability.
Result: Real MVP that can be adapted for local businesses.
```

3. Create agency offer:

```text
I build booking websites for car rentals, salons, cleaning services, repair shops, and local service businesses.
```

4. Use PriusGo as demo when messaging local businesses.

**Success condition:** PriusGo helps both the car rental business and software agency client acquisition.

---

## Recommended Order From Now

1. Verify current app runs.
2. Run tests.
3. Run production build.
4. Add Supabase env keys.
5. Run Supabase schema.
6. Test signup/login.
7. Test one customer booking.
8. Make Al-Amin admin.
9. Test admin booking approval.
10. Test admin car status/price update.
11. Redesign homepage using the Novaride-inspired Phase 6 style guide.
12. Verify the redesigned homepage in browser on desktop and mobile width.
13. Deploy to Vercel.
14. Package it as portfolio case study.

---

## Today’s Priority

**One clear mission:** Make local PriusGo fully working with Supabase.

25-minute sprint:

1. Start app locally.
2. Add Supabase keys.
3. Run database schema.
4. Create one customer account.
5. Submit one booking.
6. Check that admin can see it.

If this works, PriusGo becomes a real MVP foundation, not just a design demo.
