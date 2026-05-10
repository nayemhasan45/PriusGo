"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarDays, CarFront, CheckCircle2, Clock, CreditCard, Gauge, Loader2, Sparkles, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatLocalDate } from "@/lib/booking";
import { normalizeAdminBookingRows, type AdminBooking } from "@/lib/supabase/admin-bookings";
import { getAdminControlBoard, getAdminOperations, getAdminOverviewMetrics } from "@/lib/supabase/admin-overview";
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
  const operations = useMemo(() => getAdminOperations(bookings, carRows, today), [bookings, carRows, today]);
  const controlBoard = useMemo(() => getAdminControlBoard(bookings, carRows, today), [bookings, carRows, today]);

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
      <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-white/60">
        <Loader2 className="mr-3 size-5 animate-spin text-[#ff6a3d]" /> Loading admin overview...
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
    <div className="grid gap-5">
      {error && <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-5 font-bold text-red-200">{error}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={<Users className="size-5" />} label="Pending" value={metrics.pendingRequests} tone="amber" />
        <MetricCard icon={<CarFront className="size-5" />} label="Active rentals" value={metrics.activeRentals} tone="green" />
        <MetricCard icon={<CheckCircle2 className="size-5" />} label="Fleet ready" value={`${metrics.carsAvailable}/${cars.length}`} tone="blue" />
        <MetricCard icon={<CalendarDays className="size-5" />} label="Returns today" value={metrics.carsReturningToday} tone="orange" />
        <MetricCard icon={<TrendingUp className="size-5" />} label="Revenue" value={`€${metrics.revenueEstimate}`} tone="white" />
      </div>

      <section className="overflow-hidden rounded-[1.6rem] border border-[#ff6a3d]/20 bg-[linear-gradient(135deg,rgba(255,106,61,0.18),rgba(255,255,255,0.045)_42%,rgba(16,185,129,0.08))] shadow-2xl shadow-black/20">
        <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)] xl:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-[#ff6a3d] text-white shadow-lg shadow-[#ff6a3d]/20">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ffb199]">Client pitch board</p>
                <h2 className="mt-1 font-heading text-2xl font-black tracking-tight text-white sm:text-3xl">From request to rental handoff</h2>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/58 sm:text-base">
              Show the customer the full operating loop: renters choose a Prius, booking requests arrive here, deposits stay visible, and today&apos;s pickups and returns stay organized.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <PitchStat label="Booking conversion" value={`${controlBoard.conversionRate}%`} />
              <PitchStat label="Open actions" value={controlBoard.openActionCount} />
              <PitchStat label="Fleet status" value={controlBoard.availableFleetLabel} />
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-white/10 bg-[#080b10]/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6a3d]">Business proof</p>
                <h3 className="mt-1 text-lg font-black text-white">Why it sells</h3>
              </div>
              <Gauge className="size-5 text-white/35" />
            </div>
            <div className="mt-4 grid gap-2">
              {controlBoard.businessProof.map((proof) => (
                <div key={proof} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-200" />
                  <p className="text-sm font-semibold leading-5 text-white/68">{proof}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.9fr)]">
        <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20">
          <div className="border-b border-white/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6a3d]">Daily operations</p>
                <h2 className="mt-2 font-heading text-2xl font-black tracking-tight text-white">Needs attention today</h2>
              </div>
              <Link href="/admin/bookings" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-black text-[#090b10] transition hover:bg-[#ff6a3d] hover:text-white">
                Open bookings <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 p-4 sm:p-5">
            <OperationGroup icon={<AlertTriangle className="size-5" />} title="Pending approvals" count={operations.pendingApprovals.length} tone="amber">
              {operations.pendingApprovals.slice(0, 4).map((booking) => <BookingRow key={booking.id} booking={booking} action="Approve or reject" />)}
            </OperationGroup>
            <OperationGroup icon={<Clock className="size-5" />} title="Pickups today" count={operations.pickupsToday.length} tone="green">
              {operations.pickupsToday.slice(0, 4).map((booking) => <BookingRow key={booking.id} booking={booking} action={booking.pickupTime ?? "Time not set"} />)}
            </OperationGroup>
            <OperationGroup icon={<CalendarDays className="size-5" />} title="Returns today" count={operations.returnsToday.length} tone="blue">
              {operations.returnsToday.slice(0, 4).map((booking) => <BookingRow key={booking.id} booking={booking} action={booking.returnTime ?? "Return pending"} />)}
            </OperationGroup>
          </div>
        </section>

        <aside className="grid gap-5">
          <section className="rounded-[1.6rem] border border-white/10 bg-[#10141c] p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6a3d]">Next handoffs</p>
                <h2 className="mt-2 text-xl font-black text-white">Customer movement</h2>
              </div>
              <Clock className="size-5 text-white/35" />
            </div>
            <div className="mt-4 grid gap-2">
              {controlBoard.nextHandoffs.length === 0 ? (
                <EmptyLine label="No handoffs scheduled today." />
              ) : controlBoard.nextHandoffs.map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-black text-white">{booking.fullName}</p>
                    <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-black uppercase text-white/55">{booking.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-white/42">{booking.carName} · {booking.startDate === today ? "pickup" : "return"} today</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/10 bg-[#10141c] p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6a3d]">Payment</p>
                <h2 className="mt-2 text-xl font-black text-white">Deposit attention</h2>
              </div>
              <CreditCard className="size-5 text-white/35" />
            </div>
            <div className="mt-4 grid gap-2">
              {operations.paymentAttention.length === 0 ? (
                <EmptyLine label="No payment issues open." />
              ) : operations.paymentAttention.slice(0, 4).map((booking) => (
                <div key={booking.id} className="rounded-2xl border border-amber-400/15 bg-amber-400/8 p-3">
                  <p className="truncate text-sm font-black text-white">{booking.fullName}</p>
                  <p className="mt-1 text-xs text-amber-100/70">{booking.paymentStatus.replaceAll("_", " ")} · deposit {booking.depositAgreed ? "agreed" : "not agreed"}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[1.6rem] border border-white/10 bg-[#10141c] p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6a3d]">Fleet</p>
                <h2 className="mt-2 text-xl font-black text-white">Readiness board</h2>
              </div>
              <Link href="/admin/cars" className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/60 hover:text-white">Open</Link>
            </div>
            <div className="mt-4 grid gap-2">
              {cars.slice(0, 5).map((car) => (
                <div key={car.id} className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">{car.name}</p>
                    <p className="mt-1 text-xs text-white/42">€{car.pricePerDay}/day {car.nextAvailableDate ? `· next ${car.nextAvailableDate}` : ""}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase ${car.status === "available" ? "bg-emerald-400/12 text-emerald-200" : car.status === "maintenance" ? "bg-red-400/12 text-red-200" : "bg-amber-400/12 text-amber-200"}`}>
                    {car.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, tone }: { icon: ReactNode; label: string; value: number | string; tone: "amber" | "green" | "blue" | "orange" | "white" }) {
  const tones = {
    amber: "text-amber-200 bg-amber-400/10 border-amber-400/18",
    green: "text-emerald-200 bg-emerald-400/10 border-emerald-400/18",
    blue: "text-sky-200 bg-sky-400/10 border-sky-400/18",
    orange: "text-[#ffb199] bg-[#ff3600]/10 border-[#ff3600]/20",
    white: "text-white bg-white/[0.06] border-white/10",
  };

  return (
    <div className={`rounded-[1.35rem] border p-4 shadow-xl shadow-black/10 ${tones[tone]}`}>
      <div className="flex items-center gap-3 opacity-80">
        {icon}
        <p className="text-sm font-bold text-white/60">{label}</p>
      </div>
      <p className="mt-3 font-heading text-3xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function PitchStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.055] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-white/38">{label}</p>
      <p className="mt-2 font-heading text-2xl font-black tracking-tight text-white">{value}</p>
    </div>
  );
}

function AccessCard({ title, description, tone = "default" }: { title: string; description: string; tone?: "default" | "danger" }) {
  const danger = tone === "danger";
  return (
    <div className={`rounded-3xl border p-10 text-center ${danger ? "border-red-500/25 bg-red-500/10" : "border-dashed border-white/15 bg-white/[0.04]"}`}>
      <h2 className={`text-2xl font-black ${danger ? "text-red-200" : "text-white"}`}>{title}</h2>
      <p className={`mt-3 ${danger ? "text-red-100/70" : "text-white/55"}`}>{description}</p>
      {!danger && <Link href="/login" className="mt-6 inline-flex rounded-2xl bg-white px-6 py-3 font-black text-[#090b10] hover:bg-[#ff6a3d] hover:text-white">Sign in</Link>}
    </div>
  );
}

function OperationGroup({ icon, title, count, tone, children }: { icon: ReactNode; title: string; count: number; tone: "amber" | "green" | "blue"; children: ReactNode }) {
  const tones = {
    amber: "text-amber-200 bg-amber-400/10",
    green: "text-emerald-200 bg-emerald-400/10",
    blue: "text-sky-200 bg-sky-400/10",
  };

  return (
    <div className="rounded-3xl border border-white/8 bg-[#0d1118] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-2xl ${tones[tone]}`}>{icon}</span>
          <h3 className="font-black text-white">{title}</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#090b10]">{count}</span>
      </div>
      <div className="mt-3 grid gap-2">
        {count === 0 ? <EmptyLine label="Nothing needs action." /> : children}
      </div>
    </div>
  );
}

function BookingRow({ booking, action }: { booking: AdminBooking; action: string }) {
  return (
    <Link href="/admin/bookings" className="grid gap-3 rounded-2xl border border-white/8 bg-white/[0.035] p-3 transition hover:border-[#ff6a3d]/35 hover:bg-white/[0.06] sm:grid-cols-[1.2fr_1fr_auto] sm:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm font-black text-white">{booking.fullName}</p>
        <p className="mt-1 truncate text-xs text-white/42">{booking.phone}</p>
      </div>
      <p className="truncate text-sm font-semibold text-white/70">{booking.carName}</p>
      <span className="rounded-full bg-white/8 px-3 py-1.5 text-xs font-black text-white/60">{action}</span>
    </Link>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.025] p-3 text-sm font-semibold text-white/38">{label}</div>;
}
