import type { BookingRequest } from "@/lib/types";
import { mapBookingRowToRequest, type BookingRow, type BookingStatus } from "./bookings";

export type AdminBooking = BookingRequest;

export type AdminBookingMetrics = {
  total: number;
  pending: number;
  approved: number;
  revenueEstimate: number;
};

export const adminBookingStatuses: BookingStatus[] = ["pending", "approved", "rejected", "cancelled", "completed"];

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
    { status: "completed", label: "Complete" },
    { status: "cancelled", label: "Cancel" },
    { status: "rejected", label: "Reject" },
  ],
  rejected: [
    { status: "pending", label: "Reopen" },
    { status: "approved", label: "Approve" },
  ],
  cancelled: [
    { status: "pending", label: "Reopen" },
    { status: "approved", label: "Approve" },
  ],
  completed: [
    { status: "approved", label: "Back to approved" },
  ],
};

export function getQuickStatusActions(status: BookingStatus): QuickStatusAction[] {
  return quickStatusActionsByStatus[status];
}

export function normalizeAdminBookingRows(rows: BookingRow[]): AdminBooking[] {
  return rows.map(mapBookingRowToRequest);
}

export function getAdminBookingMetrics(bookings: AdminBooking[]): AdminBookingMetrics {
  return bookings.reduce(
    (metrics, booking) => ({
      total: metrics.total + 1,
      pending: metrics.pending + (booking.status === "pending" ? 1 : 0),
      approved: metrics.approved + (booking.status === "approved" ? 1 : 0),
      revenueEstimate: metrics.revenueEstimate + booking.estimatedTotal,
    }),
    { total: 0, pending: 0, approved: 0, revenueEstimate: 0 },
  );
}

export function getStatusTone(status: BookingStatus) {
  const tones: Record<BookingStatus, string> = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    rejected: "bg-red-100 text-red-800",
    cancelled: "bg-slate-100 text-slate-700",
    completed: "bg-sky-100 text-sky-800",
  };

  return tones[status];
}
