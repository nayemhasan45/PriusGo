"use client";

import { Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { mapBookingRowToRequest, type BookingRow } from "@/lib/supabase/bookings";
import { createClient } from "@/lib/supabase/client";
import type { BookingRequest } from "@/lib/types";

function readSavedBookings(): BookingRequest[] {
  return JSON.parse(window.localStorage.getItem("priusgo-bookings") ?? "[]") as BookingRequest[];
}

export function DashboardBookings() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const supabaseReady = Boolean(createClient());

  useEffect(() => {
    async function loadBookings() {
      setIsLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        if (!supabase) {
          setBookings(readSavedBookings());
          return;
        }

        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!userData.user) {
          setNeedsLogin(true);
          setBookings([]);
          return;
        }

        setUserEmail(userData.user.email ?? null);
        const { data, error: bookingsError } = await supabase
          .from("bookings")
          .select("id,user_id,car_id,full_name,email,phone,start_date,end_date,pickup_location,message,status,total_estimated_price,created_at")
          .order("created_at", { ascending: false });

        if (bookingsError) throw bookingsError;
        setBookings(((data ?? []) as BookingRow[]).map(mapBookingRowToRequest));
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Could not load bookings.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadBookings();
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase?.auth.signOut();
    window.location.href = "/login";
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-slate-600">
        <Loader2 className="mr-3 size-5 animate-spin" /> Loading bookings...
      </div>
    );
  }

  if (error) {
    return <div className="rounded-3xl border border-red-200 bg-red-50 p-6 font-bold text-red-700">{error}</div>;
  }

  if (needsLogin) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-2xl font-black text-slate-950">Sign in to view your bookings</h2>
        <p className="mt-3 text-slate-600">Supabase is enabled, so bookings are protected by account login.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-full bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-700">
          Login / Register
        </Link>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
        {userEmail && <p className="mb-3 text-sm font-bold text-emerald-700">Signed in as {userEmail}</p>}
        <h2 className="text-2xl font-black text-slate-950">No booking requests yet</h2>
        <p className="mt-3 text-slate-600">
          {supabaseReady ? "Submit a booking request and it will appear here from Supabase." : "Submit a demo booking request first. Local bookings appear here."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/#booking" className="inline-flex rounded-full bg-emerald-600 px-6 py-3 font-black text-white hover:bg-emerald-700">
            Create booking
          </Link>
          {supabaseReady && (
            <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 font-black text-slate-700 hover:bg-slate-50">
              <LogOut className="size-4" /> Sign out
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {userEmail && (
        <div className="flex items-center justify-between rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
          <p className="text-sm font-bold text-emerald-800">Signed in as {userEmail}</p>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      )}
      {bookings.map((booking) => (
        <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <h2 className="text-xl font-black text-slate-950">{booking.carName}</h2>
              <p className="mt-1 text-sm text-slate-500">{booking.startDate} → {booking.endDate} • Pickup: {booking.pickupLocation}</p>
              <p className="mt-3 text-sm text-slate-600">{booking.fullName} • {booking.phone}</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase text-amber-700">{booking.status}</span>
              <p className="mt-3 text-2xl font-black text-emerald-600">€{booking.estimatedTotal}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
