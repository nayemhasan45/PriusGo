import type { BookingRequest } from "@/lib/types";
import { mapBookingRowToRequest, type BookingLicenseCheckStatus, type BookingRow, type BookingStatus } from "./bookings";

export type AdminBooking = BookingRequest & {
  licenseCheckStatus: BookingLicenseCheckStatus;
  depositAgreed: boolean;
  adminNotes: string | null;
};

export type AdminBookingMetrics = {
  total: number;
  pending: number;
  active: number;
  revenueEstimate: number;
};

export type AdminBookingFilters = {
  query: string;
  status: BookingStatus | "all";
  carId: string;
  startDate: string;
  endDate: string;
};

export const defaultAdminBookingFilters: AdminBookingFilters = {
  query: "",
  status: "all",
  carId: "all",
  startDate: "",
  endDate: "",
};

export const adminBookingStatuses: BookingStatus[] = ["pending", "approved", "picked_up", "returned", "completed", "rejected", "cancelled"];

export type QuickStatusAction = {
  status: BookingStatus;
  label: string;
};

const quickStatusActionsByStatus: Record<BookingStatus, QuickStatusAction[]> = {
  pending: [
    { status: "approved", label: "Approve" },
    { status: "rejected", label: "Reject" },
    { status: "cancelled", label: "Cancel" },
  ],
  approved: [
    { status: "picked_up", label: "Mark picked up" },
    { status: "cancelled", label: "Cancel" },
    { status: "rejected", label: "Reject" },
  ],
  picked_up: [
    { status: "returned", label: "Mark returned" },
    { status: "completed", label: "Complete" },
    { status: "cancelled", label: "Cancel" },
  ],
  returned: [
    { status: "completed", label: "Complete" },
    { status: "picked_up", label: "Back to picked up" },
  ],
  completed: [
    { status: "returned", label: "Back to returned" },
  ],
  rejected: [
    { status: "pending", label: "Reopen" },
    { status: "approved", label: "Approve" },
  ],
  cancelled: [
    { status: "pending", label: "Reopen" },
    { status: "approved", label: "Approve" },
  ],
};

export function getQuickStatusActions(status: BookingStatus): QuickStatusAction[] {
  return quickStatusActionsByStatus[status];
}

export function normalizeAdminBookingRows(rows: BookingRow[]): AdminBooking[] {
  return rows.map((row) => ({
    ...mapBookingRowToRequest(row),
    licenseCheckStatus: row.license_check_status,
    depositAgreed: row.deposit_agreed,
    adminNotes: row.admin_notes,
  }));
}

export function filterAdminBookings(bookings: AdminBooking[], filters: AdminBookingFilters) {
  const query = filters.query.trim().toLowerCase();
  const hasDateRange = Boolean(filters.startDate || filters.endDate);
  const invalidDateRange = Boolean(filters.startDate && filters.endDate && filters.startDate > filters.endDate);

  return bookings.filter((booking) => {
    if (filters.status !== "all" && booking.status !== filters.status) return false;
    if (filters.carId !== "all" && booking.carId !== filters.carId) return false;
    if (invalidDateRange) return false;

    if (hasDateRange) {
      if (filters.startDate && booking.endDate < filters.startDate) return false;
      if (filters.endDate && booking.startDate > filters.endDate) return false;
    }

    if (!query) return true;

    const haystack = [booking.carName, booking.carId, booking.fullName, booking.email, booking.phone, booking.pickupLocation, booking.message, booking.adminNotes]
      .filter((value): value is string => Boolean(value))
      .join(" ")
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function getAdminBookingMetrics(bookings: AdminBooking[]): AdminBookingMetrics {
  return bookings.reduce(
    (metrics, booking) => ({
      total: metrics.total + 1,
      pending: metrics.pending + (booking.status === "pending" ? 1 : 0),
      active: metrics.active + (booking.status === "approved" || booking.status === "picked_up" || booking.status === "returned" ? 1 : 0),
      revenueEstimate: metrics.revenueEstimate + booking.estimatedTotal,
    }),
    { total: 0, pending: 0, active: 0, revenueEstimate: 0 },
  );
}

export function getStatusTone(status: BookingStatus) {
  const tones: Record<BookingStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    picked_up: "bg-sky-100 text-sky-800",
    returned: "bg-cyan-100 text-cyan-800",
    completed: "bg-violet-100 text-violet-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-slate-100 text-slate-700",
  };

  return tones[status];
}
