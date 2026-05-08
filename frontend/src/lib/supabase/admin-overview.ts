import type { CarRow } from "./cars";
import type { AdminBooking } from "./admin-bookings";

export type AdminOverviewMetrics = {
  pendingRequests: number;
  activeRentals: number;
  carsAvailable: number;
  carsReturningToday: number;
  revenueEstimate: number;
};

export function getAdminOverviewMetrics(bookings: AdminBooking[], cars: CarRow[], today: string): AdminOverviewMetrics {
  return {
    pendingRequests: bookings.filter((booking) => booking.status === "pending").length,
    activeRentals: bookings.filter((booking) => booking.status === "approved" || booking.status === "picked_up" || booking.status === "returned").length,
    carsAvailable: cars.filter((car) => car.status === "available").length,
    carsReturningToday: bookings.filter((booking) => isReturningToday(booking, today)).length,
    revenueEstimate: bookings.reduce((total, booking) => total + getBookingRevenueEstimate(booking), 0),
  };
}

export function getTodayReturnBookings(bookings: AdminBooking[], today: string) {
  return bookings.filter((booking) => isReturningToday(booking, today));
}

function isReturningToday(booking: Pick<AdminBooking, "endDate" | "status">, today: string) {
  return booking.endDate === today && (booking.status === "approved" || booking.status === "picked_up" || booking.status === "returned");
}

function getBookingRevenueEstimate(booking: AdminBooking) {
  const rentalTotal = typeof booking.rentalTotal === "number" && Number.isFinite(booking.rentalTotal)
    ? booking.rentalTotal
    : booking.estimatedTotal;
  return rentalTotal;
}
