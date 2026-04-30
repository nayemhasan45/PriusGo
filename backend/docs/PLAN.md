# PriusGo MVP Completion Plan

> **For Hermes:** Use this as the main execution plan for finishing PriusGo. Do not rebuild from zero. Verify existing work first, then finish only what is missing.

**Goal:** Make PriusGo a working Toyota Prius rental website for Šiauliai where customers can view cars, log in, request bookings, and Al-Amin can manage bookings/cars as admin.

**Architecture:** PriusGo uses a Next.js frontend and Supabase backend. The frontend lives in `frontend/`; backend SQL/docs live in `backend/`. Supabase handles auth, database, RLS, customer profiles, cars, bookings, and admin role checks.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase Auth, Supabase PostgreSQL, Vitest, Vercel.

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
- Approved/completed bookings block overlapping bookings.
- Current MVP price:
  - €20/day
  - €100/week

**Success condition:** Booking appears in Supabase and on the customer dashboard.

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

## Phase 6: Polish Homepage and Trust Sections

**Objective:** Make the website trustworthy enough for real customers and portfolio/demo use.

**Files:**

- Modify: `frontend/src/app/page.tsx`
- Modify if needed: `frontend/src/components/customer-cars.tsx`
- Modify if needed: `frontend/src/components/car-card.tsx`

**Homepage sections should include:**

1. Hero

```text
Rent a Toyota Prius in Šiauliai
Affordable hybrid car rental for daily, weekly, and city use.
```

2. Car cards

Each car should show:

```text
name
year
fuel type
transmission
seats
price per day
availability status
blocked/unavailable date ranges
```

3. Pricing

```text
€20/day
€100/week
```

4. Rental rules

Add clear rules:

```text
Valid driving license required
ID/passport required
Pickup/return in Šiauliai
Fuel policy confirmed before pickup
Customer responsible for fines/damage during rental
No smoking unless allowed by owner
Late return must be reported early
```

5. FAQ

Questions:

```text
Do I pay online now?
Where is pickup?
What documents are needed?
Can I rent weekly?
Can I extend booking?
Can I drive outside Lithuania?
```

6. Contact

Add placeholders until real details are confirmed:

```text
Phone / WhatsApp
Email
Šiauliai, Lithuania
```

**Success condition:** A visitor understands the offer in 10 seconds and knows how to request a booking.

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
11. Polish homepage rules/contact.
12. Deploy to Vercel.
13. Package it as portfolio case study.

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
