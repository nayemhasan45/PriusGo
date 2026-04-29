# PriusGo

PriusGo is split visually into two clear parts:

```text
PriusGo/
  frontend/   Next.js customer website, login, booking form, dashboard
  backend/    Supabase SQL schema, RLS policies, backend notes
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Supabase setup

1. Create a Supabase project.
2. Run the SQL in:

```text
backend/docs/SUPABASE.md
```

3. Create this file:

```text
frontend/.env.local
```

4. Add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

5. Restart frontend dev server.

## Current MVP features

- Customer registration/login with Supabase Auth
- Booking form
- Real bookings table integration when Supabase keys exist
- Local demo fallback when Supabase keys are missing
- Customer dashboard for own bookings
