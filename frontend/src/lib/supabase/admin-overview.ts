import type { CarRow } from "./cars";
import type { AdminBooking } from "./admin-bookings";

export type AdminOverviewMetrics = {
  pendingRequests: number;
  activeRentals: number;
  carsAvailable: number;
  carsReturningToday: number;
  revenueEstimate: number;
};

export type AdminOperations = {
  pendingApprovals: AdminBooking[];
  pickupsToday: AdminBooking[];
  returnsToday: AdminBooking[];
  paymentAttention: AdminBooking[];
  fleetAttention: CarRow[];
};

export type AdminControlBoard = {
  conversionRate: number;
  expectedRevenue: number;
  openActionCount: number;
  availableFleetLabel: string;
  nextHandoffs: AdminBooking[];
  businessProof: string[];
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

export function getAdminControlBoard(bookings: AdminBooking[], cars: CarRow[], today: string): AdminControlBoard {
  const metrics = getAdminOverviewMetrics(bookings, cars, today);
  const operations = getAdminOperations(bookings, cars, today);
  const completedLikeBookings = bookings.filter((booking) => (
    booking.status === "approved" ||
    booking.status === "picked_up" ||
    booking.status === "returned" ||
    booking.status === "completed"
  )).length;
  const conversionRate = bookings.length === 0 ? 0 : Math.round((completedLikeBookings / bookings.length) * 100);
  const openActionCount = operations.pendingApprovals.length + operations.pickupsToday.length + operations.returnsToday.length;

  return {
    conversionRate,
    expectedRevenue: metrics.revenueEstimate,
    openActionCount,
    availableFleetLabel: `${metrics.carsAvailable} of ${cars.length} ready`,
    nextHandoffs: [...operations.pickupsToday, ...operations.returnsToday].slice(0, 4),
    businessProof: [
      "Live availability prevents double-booking",
      "Admin can approve, reject, or complete rentals",
      "Deposits and payment status stay visible before pickup",
    ],
  };
}

export function getAdminOperations(bookings: AdminBooking[], cars: CarRow[], today: string): AdminOperations {
  return {
    pendingApprovals: bookings.filter((booking) => booking.status === "pending"),
    pickupsToday: bookings.filter((booking) => booking.startDate === today && booking.status !== "rejected" && booking.status !== "cancelled" && booking.status !== "completed"),
    returnsToday: bookings.filter((booking) => isReturningToday(booking, today)),
    paymentAttention: bookings.filter((booking) => booking.status !== "rejected" && booking.status !== "cancelled" && (booking.paymentStatus === "unpaid" || !booking.depositAgreed)),
    fleetAttention: cars.filter((car) => car.status !== "available" || Boolean(car.maintenance_note) || Boolean(car.next_available_date)),
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
