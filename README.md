# PriusGo

PriusGo is a Toyota Prius rental MVP for Šiauliai, Lithuania. It is split into two clear parts:

```text
PriusGo/
  frontend/   Next.js customer website, auth, booking form, dashboard, admin UI
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

Useful local pages:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/dashboard
http://localhost:3000/admin/bookings
```

## Supabase setup

1. Create a Supabase project.
2. Run the SQL schema in Supabase SQL Editor:

```text
backend/supabase-schema.sql
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

5. Enable Google login in Supabase Auth Providers and add the Google OAuth client ID/secret.
6. Restart the frontend dev server.

More details are in:

```text
backend/docs/SUPABASE.md
```

## Admin setup

Admin access is controlled by Supabase `profiles.role = 'admin'`.

After signing in once with Google, run this in Supabase SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'your-google-email@example.com'
);
```

Then open:

```text
http://localhost:3000/admin/bookings
```

## Current MVP features

- Customer registration/login with Supabase Auth
- Google sign-in/sign-out
- Booking form connected to Supabase
- Local demo fallback when Supabase keys are missing
- Customer dashboard for own bookings
- Admin booking dashboard
- Admin quick actions for approve/reject/cancel/complete/reopen
- Supabase Row Level Security for customer/admin access

## Verification

Run from `frontend/`:

```bash
npm test
npm run lint
npm run build
```

## Security notes

Do not commit:

```text
frontend/.env.local
Google OAuth client secret JSON files
Supabase keys or service role keys
```
