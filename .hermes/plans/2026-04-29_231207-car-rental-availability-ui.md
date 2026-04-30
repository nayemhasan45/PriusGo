# PriusGo car rental availability UI plan

## Goal

Plan the improved customer-facing car rental UI before building it.

The user wants the customer to clearly see separate rental options for each physical car, for example two cars right now. Each car should show its own availability status and available/unavailable dates in a visually clean way. If the car is available, the customer should be able to rent it directly from that car card.

## My understanding

Current desired experience:

1. The customer opens the PriusGo website.
2. They see two separate car options, one for each actual Prius.
3. Each car card should look professional and clear.
4. Each car card should show:
   - car name/details
   - price per day
   - status: Available or Not available
   - dates below showing which rental dates are unavailable/booked
   - a direct rent action if the car is available
5. If a car is available:
   - customer can click/select that specific car
   - the rental form should already know which car they selected
   - they can choose dates and request rent directly
6. If a car is not available:
   - customer can still see it maybe, but it should clearly say Not available
   - rent button should be disabled or replaced with something like “Unavailable”
   - unavailable dates should be visible below the card
7. Availability must be per car, not global.
   - If Prius Silver is rented from May 10–15, only Prius Silver is blocked for those dates.
   - Prius White can still be rented for those same dates if free.
8. The app wording should be car rental language, not service booking language.

## Proposed UI design

Customer homepage car section should become something like:

### Choose your Prius

Two car cards displayed side-by-side on desktop and stacked on mobile.

Each card:

- Top area:
  - car name: Toyota Prius Silver
  - car tag: Hybrid automatic
  - price: €XX/day
  - status pill:
    - green: Available
    - red/gray: Not available

- Middle area:
  - car features
  - maybe pickup city: Šiauliai

- Availability area below:
  - heading: Availability
  - if no blocked dates: “Available now” / “No unavailable dates yet”
  - if blocked dates exist:
    - “Unavailable dates”
    - May 10 – May 15
    - May 22 – May 25

- Bottom action:
  - if available: “Rent this car” button
  - if not available/maintenance: disabled “Not available” button

## Customer flow

When customer clicks “Rent this car” on a specific car:

1. The booking/rental form scrolls into view.
2. The selected car dropdown/form field is pre-selected with that car.
3. Customer selects rental dates.
4. Before submit, system checks if that specific car is free for those selected dates.
5. If free, request is saved.
6. If overlapping, show clear message:
   - “This car is already rented for those dates. Please choose another car or dates.”

## Admin flow

Admin page `/admin/cars` should support:

1. Show each car separately.
2. Admin can set car status:
   - Available
   - Not available
3. Optional extra later:
   - Maintenance
   - Sold/hidden
4. Admin can update price per day.
5. Admin can see unavailable/rented dates below each car.

For the current user request, keep the customer-facing UI simple with only two public status labels:
- Available
- Not available

Internally, we can still keep `maintenance` if already exists, but customers should simply see it as “Not available”.

## Files likely to change

Frontend:
- `/Users/al-amin/PriusGo/frontend/src/components/customer-cars.tsx`
  - improve layout and status logic
  - display all customer-visible cars with clear Available / Not available UI

- `/Users/al-amin/PriusGo/frontend/src/components/car-card.tsx`
  - redesign card UI
  - show availability block better
  - add direct rent button behavior

- `/Users/al-amin/PriusGo/frontend/src/components/booking-form.tsx`
  - support pre-selecting car from card click
  - maybe listen to selected car query/hash/custom event

- `/Users/al-amin/PriusGo/frontend/src/app/page.tsx`
  - connect car cards with rental form section
  - possibly add smooth scroll/select behavior

- `/Users/al-amin/PriusGo/frontend/src/lib/supabase/cars.ts`
  - maybe add helper to convert internal statuses to customer labels
  - maybe add helper for availability summary

Tests:
- `/Users/al-amin/PriusGo/frontend/src/lib/supabase/cars.test.ts`
  - add tests for Available / Not available customer labels
  - add tests for blocked date display grouping

Possibly admin:
- `/Users/al-amin/PriusGo/frontend/src/components/admin-cars.tsx`
  - if we simplify admin status UI to Available / Not available only

## Validation plan

After building, verify:

1. Homepage shows two separate car cards.
2. Each card shows Available or Not available clearly.
3. Unavailable dates are displayed under each car.
4. Clicking “Rent this car” selects that exact car in the rental form.
5. Unavailable car does not allow direct rent.
6. Overlapping dates are still blocked by Supabase RPC/RLS.
7. Run:
   - `npm test`
   - `npm run lint`
   - `npm run build`
8. Browser check:
   - homepage loads cleanly
   - `/admin/cars` still loads
   - no console errors

## Open questions for Al-Amin before building

1. Should customers see unavailable cars at all?
   - Option A: Show all cars, but unavailable cars have disabled button.
   - Option B: Hide unavailable cars completely.
   My recommendation: show all cars for trust/demo, but disable rent button.

2. Should “Not available” mean full car status only, or date-based status too?
   - Example: car is generally available, but rented May 10–15.
   - On today’s page, should it say Available because it can be rented on other dates, or Not available because some dates are blocked?
   My recommendation: show status as Available if the car is generally active, and below show specific unavailable dates.

3. Should the rent button open/scroll to the form, or should each car have its own mini date form directly on the card?
   My recommendation for MVP: button scrolls to the main rental form and pre-selects the car. Cleaner and faster.

4. Should admin status options be only Available / Not available, or keep Maintenance too?
   My recommendation: admin can keep Available / Not available / Maintenance, but customer only sees Available / Not available.
