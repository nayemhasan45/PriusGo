"use client";

import { Copy, Loader2, Mail, Phone, Printer, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  bookingPaymentMethods,
  bookingPaymentStatuses,
  buildAdminBookingsCsv,
  adminBookingStatuses,
  defaultAdminBookingFilters,
  filterAdminBookings,
  getAdminPaymentMetrics,
  getAdminBookingMetrics,
  getQuickStatusActions,
  getPaymentStatusTone,
  getStatusTone,
  normalizeAdminBookingRows,
  type AdminBookingFilters,
  type AdminBooking,
} from "@/lib/supabase/admin-bookings";
import { type BookingLicenseCheckStatus, type BookingPaymentMethod, type BookingPaymentStatus, type BookingRow, type BookingStatus } from "@/lib/supabase/bookings";
import { createClient } from "@/lib/supabase/client";

const bookingColumns = "id,user_id,car_id,full_name,email,phone,start_date,end_date,pickup_location,message,driving_license_confirmed,rental_rules_accepted,booking_not_final_acknowledged,license_check_status,deposit_agreed,pickup_time,return_time,admin_notes,status,payment_status,deposit_amount,payment_method,payment_notes,rental_total,discount_amount,extra_charge,total_estimated_price,created_at";

type BookingUpdate = {
  status?: BookingStatus;
  licenseCheckStatus?: BookingLicenseCheckStatus;
  depositAgreed?: boolean;
  pickupTime?: string | null;
  returnTime?: string | null;
  adminNotes?: string | null;
  paymentStatus?: BookingPaymentStatus;
  depositAmount?: number | null;
  paymentMethod?: BookingPaymentMethod | null;
  paymentNotes?: string | null;
  rentalTotal?: number | null;
  discountAmount?: number | null;
  extraCharge?: number | null;
};

function buildContactSubject(booking: AdminBooking) {
  return `PriusGo booking: ${booking.carName}`;
}

function buildContactBody(booking: AdminBooking) {
  return [
    `Hi ${booking.fullName},`,
    "",
    `PriusGo booking: ${booking.carName}`,
    `Dates: ${booking.startDate} to ${booking.endDate}`,
    `Pickup: ${booking.pickupLocation}`,
    `Phone: ${booking.phone}`,
  ].join("\n");
}

function formatTelPhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function formatWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatSummaryMoney(value: number | null | undefined, fallback = 0) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Number.isInteger(amount) ? `€${amount}` : `€${amount.toFixed(2)}`;
}

function buildPrintableBookingSummaryHtml(booking: AdminBooking) {
  const rentalTotal = booking.rentalTotal ?? booking.estimatedTotal;
  const amountDue = rentalTotal - (booking.discountAmount ?? 0) + (booking.extraCharge ?? 0);

  return `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>PriusGo booking summary</title>
      <style>
        :root { color-scheme: light; }
        body { font-family: Arial, sans-serif; margin: 0; padding: 32px; color: #111827; background: #fff; }
        .sheet { max-width: 860px; margin: 0 auto; }
        h1 { margin: 0 0 8px; font-size: 28px; }
        .sub { color: #6b7280; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .card { border: 1px solid #e5e7eb; border-radius: 16px; padding: 14px 16px; }
        .label { font-size: 11px; text-transform: uppercase; letter-spacing: .14em; color: #6b7280; margin-bottom: 6px; }
        .value { font-size: 14px; font-weight: 700; white-space: pre-wrap; }
        .full { grid-column: 1 / -1; }
        .section { margin-top: 18px; }
        .section h2 { font-size: 16px; margin: 0 0 10px; }
        ul { margin: 0; padding-left: 18px; }
        li { margin: 5px 0; }
        .totals { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .footer { margin-top: 24px; color: #6b7280; font-size: 12px; }
        @media print { body { padding: 0; } .sheet { max-width: none; } }
      </style>
    </head>
    <body>
      <div class="sheet">
        <h1>PriusGo booking summary</h1>
        <div class="sub">Printable rental sheet / contract draft for pickup handoff</div>

        <div class="grid">
          <div class="card"><div class="label">Customer</div><div class="value">${escapeHtml(booking.fullName)}</div></div>
          <div class="card"><div class="label">Phone</div><div class="value">${escapeHtml(booking.phone)}</div></div>
          <div class="card"><div class="label">Email</div><div class="value">${escapeHtml(booking.email || "Not provided")}</div></div>
          <div class="card"><div class="label">Car</div><div class="value">${escapeHtml(booking.carName)}</div></div>
          <div class="card"><div class="label">Dates</div><div class="value">${escapeHtml(`${booking.startDate} → ${booking.endDate}`)}</div></div>
          <div class="card"><div class="label">Pickup location</div><div class="value">${escapeHtml(booking.pickupLocation)}</div></div>
          <div class="card"><div class="label">Pickup / return time</div><div class="value">${escapeHtml(`${booking.pickupTime ?? "not set"} → ${booking.returnTime ?? "not set"}`)}</div></div>
          <div class="card"><div class="label">Status</div><div class="value">${escapeHtml(booking.status)}</div></div>
          <div class="card"><div class="label">Payment status</div><div class="value">${escapeHtml(booking.paymentStatus.replaceAll("_", " "))}</div></div>
          <div class="card"><div class="label">Payment method</div><div class="value">${escapeHtml(booking.paymentMethod ?? "not set")}</div></div>
        </div>

        <div class="section">
          <h2>Money summary</h2>
          <div class="totals">
            <div class="card"><div class="label">Rental total</div><div class="value">${escapeHtml(formatSummaryMoney(rentalTotal, booking.estimatedTotal))}</div></div>
            <div class="card"><div class="label">Deposit</div><div class="value">${escapeHtml(formatSummaryMoney(booking.depositAmount))}</div></div>
            <div class="card"><div class="label">Discount</div><div class="value">${escapeHtml(formatSummaryMoney(booking.discountAmount))}</div></div>
            <div class="card"><div class="label">Extra charge</div><div class="value">${escapeHtml(formatSummaryMoney(booking.extraCharge))}</div></div>
          </div>
          <div class="card section full"><div class="label">Amount due</div><div class="value">${escapeHtml(formatSummaryMoney(amountDue))}</div></div>
        </div>

        <div class="section">
          <h2>Rental confirmation checklist</h2>
          <ul>
            <li>Valid driving license checked</li>
            <li>ID or passport checked</li>
            <li>Rental rules accepted</li>
            <li>Booking confirmed by admin before handoff</li>
            <li>Deposit and payment details agreed before handoff</li>
          </ul>
        </div>

        <div class="section grid">
          <div class="card full"><div class="label">Payment notes</div><div class="value">${escapeHtml(booking.paymentNotes ?? "None")}</div></div>
          <div class="card full"><div class="label">Admin notes</div><div class="value">${escapeHtml(booking.adminNotes ?? "None")}</div></div>
        </div>

        <div class="footer">PriusGo · Šiauliai, Lithuania · Generated ${escapeHtml(new Date().toLocaleString())}</div>
      </div>
      <script>window.print();</script>
    </body>
  </html>`;
}

function printBookingSummary(booking: AdminBooking) {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=900,height=1200");
  if (!printWindow) return false;

  printWindow.document.open();
  printWindow.document.write(buildPrintableBookingSummaryHtml(booking));
  printWindow.document.close();
  printWindow.focus();
  return true;
}

function formatMoney(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return Number.isInteger(value) ? `€${value}` : `€${value.toFixed(2)}`;
}

function parseOptionalMoney(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : null;
}

function downloadCsvFile(fileName: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function AdminBookings() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filters, setFilters] = useState<AdminBookingFilters>(defaultAdminBookingFilters);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const metrics = useMemo(() => getAdminBookingMetrics(bookings), [bookings]);
  const paymentMetrics = useMemo(() => getAdminPaymentMetrics(bookings), [bookings]);
  const visibleBookings = useMemo(() => filterAdminBookings(bookings, filters), [bookings, filters]);
  const bookingCarOptions = useMemo(() => {
    const seen = new Map<string, string>();
    bookings.forEach((booking) => {
      if (!seen.has(booking.carId)) seen.set(booking.carId, booking.carName);
    });
    return Array.from(seen.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([carId, carName]) => ({ carId, carName }));
  }, [bookings]);

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

  async function updateBooking(bookingId: string, updates: BookingUpdate) {
    setIsUpdatingId(bookingId);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) throw new Error("Supabase is not configured.");

      const updatePayload: Record<string, unknown> = {};
      if (updates.status !== undefined) updatePayload.status = updates.status;
      if (updates.licenseCheckStatus !== undefined) updatePayload.license_check_status = updates.licenseCheckStatus;
      if (updates.depositAgreed !== undefined) updatePayload.deposit_agreed = updates.depositAgreed;
      if (updates.pickupTime !== undefined) updatePayload.pickup_time = updates.pickupTime;
      if (updates.returnTime !== undefined) updatePayload.return_time = updates.returnTime;
      if (updates.adminNotes !== undefined) updatePayload.admin_notes = updates.adminNotes;

      const { data, error: updateError } = await supabase
        .from("bookings")
        .update(updatePayload)
        .eq("id", bookingId)
        .select(bookingColumns)
        .single();

      if (updateError) throw updateError;

      const [updatedBooking] = normalizeAdminBookingRows([data as BookingRow]);
      setBookings((current) => current.map((booking) => (booking.id === bookingId ? updatedBooking : booking)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Could not update booking.");
    } finally {
      setIsUpdatingId(null);
    }
  }

  async function copyPhoneNumber(bookingId: string, phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhoneId(bookingId);
      window.setTimeout(() => setCopiedPhoneId((current) => (current === bookingId ? null : current)), 1500);
    } catch {
      setError("Could not copy phone number.");
    }
  }

  function resetFilters() {
    setFilters(defaultAdminBookingFilters);
  }

  async function exportVisibleBookings() {
    setIsExportingCsv(true);
    try {
      const csv = buildAdminBookingsCsv(visibleBookings);
      const stamp = new Date().toISOString().slice(0, 10);
      downloadCsvFile(`priusgo-bookings-${stamp}.csv`, csv);
    } catch {
      setError("Could not export CSV.");
    } finally {
      setIsExportingCsv(false);
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
        <MetricCard label="Active rentals" value={metrics.active} />
        <MetricCard label="Estimated revenue" value={`€${metrics.revenueEstimate}`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Unpaid" value={paymentMetrics.unpaid} />
        <MetricCard label="Deposit paid" value={paymentMetrics.depositPaid} />
        <MetricCard label="Paid" value={paymentMetrics.paid} />
        <MetricCard label="Refunded" value={paymentMetrics.refunded} />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-5">
          <label className="grid gap-2 text-sm font-bold text-slate-700 lg:col-span-2">
            Search
            <input
              type="search"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
              placeholder="Name, phone, email, car, pickup, notes"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Status
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value as AdminBookingFilters["status"] }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All statuses</option>
              {adminBookingStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            Car
            <select
              value={filters.carId}
              onChange={(event) => setFilters((current) => ({ ...current, carId: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500"
            >
              <option value="all">All cars</option>
              {bookingCarOptions.map((car) => (
                <option key={car.carId} value={car.carId}>
                  {car.carName}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            From
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => setFilters((current) => ({ ...current, startDate: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-slate-700">
            To
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => setFilters((current) => ({ ...current, endDate: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-emerald-500"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing <span className="font-bold text-slate-900">{visibleBookings.length}</span> of <span className="font-bold text-slate-900">{bookings.length}</span> bookings.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={() => void exportVisibleBookings()}
              disabled={visibleBookings.length === 0 || isExportingCsv}
              className="rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isExportingCsv ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        </div>
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
      ) : visibleBookings.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">No bookings match those filters</h2>
          <p className="mt-3 text-slate-600">Try clearing the search, date range, or status filter.</p>
          <button type="button" onClick={resetFilters} className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 font-black text-white hover:bg-emerald-700">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {visibleBookings.map((booking) => (
            <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black text-slate-950">{booking.carName}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getStatusTone(booking.status)}`}>{booking.status}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${getPaymentStatusTone(booking.paymentStatus)}`}>{booking.paymentStatus.replaceAll("_", " ")}</span>
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

                  <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <a
                      href={`tel:${formatTelPhone(booking.phone)}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 sm:w-auto"
                    >
                      <Phone className="size-4" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${formatWhatsAppPhone(booking.phone)}?text=${encodeURIComponent(buildContactBody(booking))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 sm:w-auto"
                    >
                      <span className="text-base font-black">WA</span> WhatsApp
                    </a>
                    <a
                      href={`mailto:${booking.email}?subject=${encodeURIComponent(buildContactSubject(booking))}&body=${encodeURIComponent(buildContactBody(booking))}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 sm:w-auto"
                    >
                      <Mail className="size-4" /> Email
                    </a>
                    <button
                      type="button"
                      onClick={() => void copyPhoneNumber(booking.id, booking.phone)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700 sm:w-auto"
                    >
                      <Copy className="size-4" /> {copiedPhoneId === booking.id ? "Copied" : "Copy number"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const opened = printBookingSummary(booking);
                        if (!opened) setError("Could not open the printable booking summary.");
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                    >
                      <Printer className="size-4" /> Print summary
                    </button>
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
                          onClick={() => void updateBooking(booking.id, { status: action.status })}
                          className="w-full rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                        >
                          {isUpdatingId === booking.id ? "Updating..." : action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <form
                    className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      void updateBooking(booking.id, {
                        status: String(formData.get("status") ?? booking.status) as BookingStatus,
                        licenseCheckStatus: String(formData.get("licenseCheckStatus") ?? booking.licenseCheckStatus) as BookingLicenseCheckStatus,
                        depositAgreed: formData.get("depositAgreed") === "on",
                        pickupTime: normalizeOptionalString(formData.get("pickupTime")),
                        returnTime: normalizeOptionalString(formData.get("returnTime")),
                        adminNotes: normalizeOptionalString(formData.get("adminNotes")),
                        paymentStatus: String(formData.get("paymentStatus") ?? booking.paymentStatus) as BookingPaymentStatus,
                        depositAmount: parseOptionalMoney(formData.get("depositAmount")),
                        paymentMethod: normalizeOptionalPaymentMethod(formData.get("paymentMethod")),
                        paymentNotes: normalizeOptionalString(formData.get("paymentNotes")),
                        rentalTotal: parseOptionalMoney(formData.get("rentalTotal")),
                        discountAmount: parseOptionalMoney(formData.get("discountAmount")),
                        extraCharge: parseOptionalMoney(formData.get("extraCharge")),
                      });
                    }}
                  >
                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Manual status
                      <select
                        name="status"
                        value={booking.status}
                        disabled={isUpdatingId === booking.id}
                        onChange={(event) => void updateBooking(booking.id, { status: event.target.value as BookingStatus })}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {adminBookingStatuses.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      License check status
                      <select
                        name="licenseCheckStatus"
                        defaultValue={booking.licenseCheckStatus}
                        disabled={isUpdatingId === booking.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <option value="pending">pending</option>
                        <option value="verified">verified</option>
                        <option value="rejected">rejected</option>
                      </select>
                    </label>

                    <div className="grid gap-3 rounded-3xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-800">Money tracking</p>

                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        Payment status
                        <select
                          name="paymentStatus"
                          defaultValue={booking.paymentStatus}
                          disabled={isUpdatingId === booking.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {bookingPaymentStatuses.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-bold text-slate-700">
                          Deposit amount
                          <input
                            name="depositAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={booking.depositAmount ?? ""}
                            disabled={isUpdatingId === booking.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-bold text-slate-700">
                          Payment method
                          <select
                            name="paymentMethod"
                            defaultValue={booking.paymentMethod ?? ""}
                            disabled={isUpdatingId === booking.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <option value="">not set</option>
                            {bookingPaymentMethods.map((method) => (
                              <option key={method} value={method}>{method}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="grid gap-2 text-sm font-bold text-slate-700">
                          Rental total
                          <input
                            name="rentalTotal"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={booking.rentalTotal ?? booking.estimatedTotal ?? ""}
                            disabled={isUpdatingId === booking.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </label>
                        <label className="grid gap-2 text-sm font-bold text-slate-700">
                          Discount
                          <input
                            name="discountAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={booking.discountAmount ?? ""}
                            disabled={isUpdatingId === booking.id}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </label>
                      </div>

                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        Extra charge
                        <input
                          name="extraCharge"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={booking.extraCharge ?? ""}
                          disabled={isUpdatingId === booking.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>

                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        Payment notes
                        <textarea
                          name="paymentNotes"
                          defaultValue={booking.paymentNotes ?? ""}
                          rows={3}
                          disabled={isUpdatingId === booking.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                          placeholder="Cash / bank transfer details, reminders, follow-up"
                        />
                      </label>
                    </div>

                    <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700">
                      <input
                        name="depositAgreed"
                        type="checkbox"
                        defaultChecked={booking.depositAgreed}
                        disabled={isUpdatingId === booking.id}
                        className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      Deposit agreed
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        Pickup time
                        <input
                          name="pickupTime"
                          type="time"
                          defaultValue={booking.pickupTime ?? ""}
                          disabled={isUpdatingId === booking.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-bold text-slate-700">
                        Return time
                        <input
                          name="returnTime"
                          type="time"
                          defaultValue={booking.returnTime ?? ""}
                          disabled={isUpdatingId === booking.id}
                          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm font-bold text-slate-700">
                      Admin notes
                      <textarea
                        name="adminNotes"
                        defaultValue={booking.adminNotes ?? ""}
                        rows={4}
                        disabled={isUpdatingId === booking.id}
                        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Internal notes only"
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={isUpdatingId === booking.id}
                      className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdatingId === booking.id ? "Saving..." : "Save workflow"}
                    </button>
                  </form>
                </div>
              </div>

              <div className="mt-5 grid gap-3 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="License confirmed" value={booking.drivingLicenseConfirmed ? "Yes" : "No"} />
                <Detail label="Rules accepted" value={booking.rentalRulesAccepted ? "Yes" : "No"} />
                <Detail label="Booking acknowledged" value={booking.bookingNotFinalAcknowledged ? "Yes" : "No"} />
                <Detail label="Deposit agreed" value={booking.depositAgreed ? "Yes" : "No"} />
              </div>

              <div className="mt-4 grid gap-3 rounded-3xl border border-amber-100 bg-amber-50 p-4 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Payment status" value={booking.paymentStatus.replaceAll("_", " ")} />
                <Detail label="Deposit amount" value={formatMoney(booking.depositAmount)} />
                <Detail label="Rental total" value={formatMoney(booking.rentalTotal ?? booking.estimatedTotal)} />
                <Detail label="Amount due" value={formatMoney((booking.rentalTotal ?? booking.estimatedTotal) - (booking.discountAmount ?? 0) + (booking.extraCharge ?? 0))} />
              </div>

              <div className="mt-4 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 text-sm text-slate-700 sm:grid-cols-3">
                <Detail label="Payment method" value={booking.paymentMethod ?? "not set"} />
                <Detail label="Discount" value={formatMoney(booking.discountAmount)} />
                <Detail label="Extra charge" value={formatMoney(booking.extraCharge)} />
              </div>

              {booking.paymentNotes && (
                <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Payment notes</p>
                  <p className="mt-2 leading-relaxed">{booking.paymentNotes}</p>
                </div>
              )}
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function normalizeOptionalString(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text : null;
}

function normalizeOptionalPaymentMethod(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return null;
  if (bookingPaymentMethods.includes(text as BookingPaymentMethod)) return text as BookingPaymentMethod;
  return null;
}
