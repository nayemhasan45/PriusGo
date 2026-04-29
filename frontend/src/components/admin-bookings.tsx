"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  adminBookingStatuses,
  getAdminBookingMetrics,
  getQuickStatusActions,
  getStatusTone,
  normalizeAdminBookingRows,
  type AdminBooking,
} from "@/lib/supabase/admin-bookings";
import { type BookingRow, type BookingStatus } from "@/lib/supabase/bookings";
import { createClient } from "@/lib/supabase/client";

const bookingColumns = "id,user_id,car_id,full_name,email,phone,start_date,end_date,pickup_location,message,status,total_estimated_price,created_at";

export function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const metrics = useMemo(() => getAdminBookingMetrics(bookings), [bookings]);

  async function loadAdminBookings() {
    setIsLoading(true);
    setError(null);
    setNeedsLogin(false);
    setIsForbidden(false);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Supabase is not configured. Add .env.local first.");
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session?.user) {
        setNeedsLogin(true);
        setBookings([]);
        return;
      }

      const user = sessionData.session.user;
      setAdminEmail(user.email ?? null);

      const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profileError) throw profileError;

      if (profile?.role !== "admin") {
        setIsForbidden(true);
        setBookings([]);
        return;
      }

      const { data, error: bookingsError } = await supabase.from("bookings").select(bookingColumns).order("created_at", { ascending: false });
      if (bookingsError) throw bookingsError;

      setBookings(normalizeAdminBookingRows((data ?? []) as BookingRow[]));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not load admin bookings.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void Promise.resolve().then(loadAdminBookings);
  }, []);

  async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    setIsUpdatingId(bookingId);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const { data, error: updateError } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId)
        .select(bookingColumns)
        .single();

      if (updateError) throw updateError;

      const [updatedBooking] = normalizeAdminBookingRows([data as BookingRow]);
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updatedBooking : booking)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update booking status.");
    } finally {
      setIsUpdatingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-slate-600">
        <Loader2 className="mr-3 size-5 animate-spin" /> Loading admin bookings...
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-2xl font-black text-slate-950">Admin login required</h2>
        <p className="mt-3 text-slate-600">Sign in with the account that has the admin role.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 font-black text-white hover:bg-emerald-700">
          Sign in
        </Link>
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
        <h2 className="text-2xl font-black text-red-800">Admin access only</h2>
        <p className="mt-3 text-red-700">{adminEmail ?? "This account"} is signed in, but it is not marked as admin in Supabase profiles.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-5 font-bold text-red-700">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total requests" value={metrics.total} />
        <MetricCard label="Pending" value={metrics.pending} />
        <MetricCard label="Approved" value={metrics.approved} />
        <MetricCard label="Estimated revenue" value={`€${metrics.revenueEstimate}`} />
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
        <div className="flex items-center gap-3 text-emerald-900">
          <ShieldCheck className="size-5" />
          <p className="font-black">Admin mode active{adminEmail ? ` — ${adminEmail}` : ""}</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">No booking requests yet</h2>
          <p className="mt-3 text-slate-600">Customer bookings will appear here when they submit requests.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-950">{booking.carName}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getStatusTone(booking.status)}`}>{booking.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">
                    {booking.startDate} → {booking.endDate} • Pickup: {booking.pickupLocation}
                  </p>
                  <div className="mt-4 grid gap-1 text-sm text-slate-700">
                    <p><span className="font-black">Customer:</span> {booking.fullName}</p>
                    <p><span className="font-black">Email:</span> {booking.email || "Not provided"}</p>
                    <p><span className="font-black">Phone:</span> {booking.phone}</p>
                    {booking.message && <p><span className="font-black">Message:</span> {booking.message}</p>}
                  </div>
                </div>

                <div className="grid gap-3 lg:w-64">
                  <p className="text-3xl font-black text-emerald-600">€{booking.estimatedTotal}</p>
                  <div className="grid gap-2">
                    <p className="text-sm font-bold text-slate-700">Quick actions</p>
                    <div className="flex flex-wrap gap-2">
                      {getQuickStatusActions(booking.status).map((action) => (
                        <button
                          key={action.status}
                          type="button"
                          disabled={isUpdatingId === booking.id}
                          onClick={() => void updateBookingStatus(booking.id, action.status)}
                          className="rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdatingId === booking.id ? "Updating..." : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="grid gap-2 text-sm font-bold text-slate-700">
                    Manual status
                    <select
                      value={booking.status}
                      disabled={isUpdatingId === booking.id}
                      onChange={(event) => void updateBookingStatus(booking.id, event.target.value as BookingStatus)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {adminBookingStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}
