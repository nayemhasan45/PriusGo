# PriusGo Website Plan

Goal: Build a fast demo car rental website for PriusGo where users can see cars, login, request bookings, and Al-Amin can manage booking requests later.

## Recommended Tech Stack

### Frontend
- Next.js 15 with App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui for clean components
- Lucide React for icons
- Zod for form validation
- React Hook Form for forms

Why: SEO-friendly, modern, scalable, good for portfolio, easy deployment on Vercel.

### Backend
- Supabase
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Storage later for car images/documents
  - Edge Functions later if needed

Why: Fast to build, real scalable Postgres backend, auth included, no need to maintain a custom server now.

### Deployment
- Vercel for frontend
- Supabase hosted project for backend/database

### Future Scaling Path
Start with Supabase. If the business grows big, keep Supabase/Postgres and add a custom backend later using:
- NestJS or Fastify
- Prisma or Drizzle ORM
- Stripe/Paysera/PayPal integration if needed
- Admin dashboard
- Mobile app later using React Native or Expo

Do not build mobile app now.

## MVP Features

### Public pages
1. Home page
2. Cars page
3. Car details page
4. Pricing/rules section
5. FAQ section
6. Contact section
7. Booking request form

### User features
1. Register/login
2. View available cars
3. Request booking
4. See own booking requests

### Admin features for later MVP+1
1. View booking requests
2. Approve/reject requests
3. Manage cars
4. Change availability
5. Track payments manually

## Database Tables

### profiles
- id uuid primary key, linked to auth.users
- full_name text
- phone text
- role text default 'customer'
- created_at timestamp

### cars
- id uuid primary key
- name text
- brand text
- model text
- year int
- fuel_type text
- transmission text
- seats int
- price_per_day numeric
- image_url text
- status text: available, unavailable, maintenance
- created_at timestamp

### bookings
- id uuid primary key
- user_id uuid references profiles(id)
- car_id uuid references cars(id)
- start_date date
- end_date date
- pickup_location text
- phone text
- message text
- status text: pending, approved, rejected, cancelled, completed
- total_estimated_price numeric
- created_at timestamp

## Design Direction

Brand: PriusGo
Tagline: Affordable Toyota Prius rental in Šiauliai
Style: clean, modern, trustworthy, green/blue accent, mobile-first.

Suggested colors:
- Dark text: #0F172A
- Green accent: #16A34A
- Blue accent: #2563EB
- Light background: #F8FAFC
- White cards: #FFFFFF

## Build Phases

### Phase 1: Fast demo
- Landing page
- Two Prius car cards
- Booking form
- Login/register
- Store booking request in Supabase
- Deploy to Vercel

### Phase 2: Usable business version
- User booking dashboard
- Admin booking dashboard
- Availability status
- Better car details page
- Email notifications

### Phase 3: Scale version
- Online payments
- Contract generation
- Customer document upload
- Maintenance tracker
- Expense/income dashboard
- Multi-car support
- Optional mobile app

## First Build Order

1. Create Next.js project with TypeScript and Tailwind.
2. Install shadcn/ui, Supabase client, Zod, React Hook Form, Lucide icons.
3. Create basic layout and brand theme.
4. Create landing page sections.
5. Set up Supabase project and environment variables.
6. Create database tables.
7. Add auth pages.
8. Add booking form.
9. Add user booking page.
10. Deploy demo.

## One Clear Recommendation

Use Next.js + TypeScript + Tailwind + Supabase.

This gives the fastest demo now and a clean path to scale later without rebuilding everything.
