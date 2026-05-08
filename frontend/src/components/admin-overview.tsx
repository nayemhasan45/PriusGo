"use client";

import Link from "next/link";
import { CalendarDays, CarFront, Loader2, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatLocalDate } from "@/lib/booking";
import { normalizeAdminBookingRows, type AdminBooking } from "@/lib/supabase/admin-bookings";
import { getAdminOverviewMetrics, getTodayReturnBookings } from "@/lib/supabase/admin-overview";
import { createClient } from "@/lib/supabase/client";
import { mapCarRowToCar, type CarRow } from "@/lib/supabase/cars";
import type { BookingRow } from "@/lib/supabase/bookings";
import type { ReactNode } from "react";

const bookingColumns = "id,user_id,car_id,full_name,email,phone,start_date,end_date,pickup_location,message,driving_license_confirmed,rental_rules_accepted,booking_not_final_acknowledged,license_check_status,deposit_agreed,pickup_time,return_time,admin_notes,status,payment_status,deposit_amount,payment_method,payment_notes,rental_total,discount_amount,extra_charge,total_estimated_price,created_at";
const carColumns = "id,name,brand,model,year,fuel_type,transmission,seats,price_per_day,image_url,status,maintenance_note,next_available_date,created_at";

export function AdminOverview() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [carRows, setCarRows] = useState<CarRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const today = useMemo(() => formatLocalDate(new Date()), []);
  const cars = useMemo(() => carRows.map(mapCarRowToCar), [carRows]);

  const metrics = useMemo(() => getAdminOverviewMetrics(bookings, carRows, today), [bookings, carRows, today]);
  const returnBookings = useMemo(() => getTodayReturnBookings(bookings, today), [bookings, today]);

  useEffect(() => {
    async function loadOverview() {
      setIsLoading(true);
      setError(null);
      setNeedsLogin(false);
      setIsForbidden(false);

      try {
        const supabase = createClient();
        if (!supabase) throw new Error("Supabase is not configured. Add .env.local first.");

        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!sessionData.session?.user) {
          setNeedsLogin(true);
          return;
        }

        const user = sessionData.session.user;
        setAdminEmail(user.email ?? null);

        const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
        if (profileError) throw profileError;
        if (profile?.role !== "admin") {
          setIsForbidden(true);
          return;
        }

        const [{ data: bookingRows, error: bookingsError }, { data: carRows, error: carsError }] = await Promise.all([
          supabase.from("bookings").select(bookingColumns).order("created_at", { ascending: false }),
          supabase.from("cars").select(carColumns).order("name", { ascending: true }),
        ]);

        if (bookingsError) throw bookingsError;
        if (carsError) throw carsError;

        setBookings(normalizeAdminBookingRows((bookingRows ?? []) as BookingRow[]));
        setCarRows((carRows ?? []) as CarRow[]);
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load admin overview.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-slate-600">
        <Loader2 className="mr-3 size-5 animate-spin" /> Loading admin overview...
      </div>
    );
  }

  if (needsLogin) {
    return <AccessCard title="Admin login required" description="Sign in with the account that has the admin role." />;
  }

  if (isForbidden) {
    return <AccessCard title="Admin access only" description={`${adminEmail ?? "This account"} is signed in, but it is not marked as admin.`} tone="danger" />;
  }

  return (
    <div className="grid gap-6">
      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<Users className="size-5" />} label="Pending requests" value={metrics.pendingRequests} />
        <MetricCard icon={<CarFront className="size-5" />} label="Active rentals" value={metrics.activeRentals} />
        <MetricCard icon={<CarFront className="size-5" />} label="Cars available" value={metrics.carsAvailable} />
        <MetricCard icon={<CalendarDays className="size-5" />} label="Returning today" value={metrics.carsReturningToday} />
        <MetricCard icon={<TrendingUp className="size-5" />} label="Revenue estimate" value={`€${metrics.revenueEstimate}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">Today</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Bookings returning today</h2>
            </div>
            <Link href="/admin/bookings" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
              Open bookings
            </Link>
          </div>

          <div className="mt-5 grid gap-3">
            {returnBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">No bookings are scheduled to return today.</div>
            ) : (
              returnBookings.map((booking) => (
                <article key={booking.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-black text-slate-950">{booking.carName}</p>
                  <p className="mt-1 text-sm text-slate-600">{booking.fullName} · {booking.phone}</p>
                  <p className="mt-1 text-sm text-slate-500">Return: {booking.endDate}</p>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-600">Fleet</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Car status summary</h2>
            </div>
            <Link href="/admin/cars" className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-emerald-200 hover:text-emerald-700">
              Open cars
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {cars.map((car) => (
              <article key={car.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-black text-slate-950">{car.name}</p>
                <p className="mt-1 text-sm text-slate-600">{car.status} · €{car.pricePerDay}/day</p>
                {car.maintenanceNote && <p className="mt-1 text-sm text-slate-500">{car.maintenanceNote}</p>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-500">
        {icon}
        <p className="text-sm font-bold">{label}</p>
      </div>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function AccessCard({ title, description, tone = "default" }: { title: string; description: string; tone?: "default" | "danger" }) {
  const danger = tone === "danger";
  return (
    <div className={`rounded-3xl border p-10 text-center ${danger ? "border-red-200 bg-red-50" : "border-dashed border-slate-300 bg-white"}`}>
      <h2 className={`text-2xl font-black ${danger ? "text-red-800" : "text-slate-950"}`}>{title}</h2>
      <p className={`mt-3 ${danger ? "text-red-700" : "text-slate-600"}`}>{description}</p>
      {!danger && <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 font-black text-white hover:bg-emerald-700">Sign in</Link>}
    </div>
  );
}
