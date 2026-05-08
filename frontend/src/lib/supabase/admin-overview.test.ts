import { describe, expect, it } from "vitest";
import { getAdminOverviewMetrics, getTodayReturnBookings } from "./admin-overview";

describe("admin overview metrics", () => {
  const bookings = [
    {
      id: "1",
      carId: "car-1",
      carName: "Toyota Prius MJO146",
      fullName: "A Person",
      email: "a@example.com",
      phone: "+37060000001",
      startDate: "2026-05-09",
      endDate: "2026-05-10",
      pickupLocation: "Šiauliai",
      message: undefined,
      pickupTime: null,
      returnTime: null,
      drivingLicenseConfirmed: true,
      rentalRulesAccepted: true,
      bookingNotFinalAcknowledged: true,
      estimatedTotal: 120,
      status: "approved" as const,
      createdAt: "2026-05-01T10:00:00.000Z",
      licenseCheckStatus: "verified" as const,
      depositAgreed: true,
      adminNotes: null,
      paymentStatus: "paid" as const,
      depositAmount: 40,
      paymentMethod: "cash" as const,
      paymentNotes: null,
      rentalTotal: 120,
      discountAmount: null,
      extraCharge: null,
    },
    {
      id: "2",
      carId: "car-2",
      carName: "Toyota Prius MHP235",
      fullName: "B Person",
      email: "b@example.com",
      phone: "+37060000002",
      startDate: "2026-05-10",
      endDate: "2026-05-10",
      pickupLocation: "Šiauliai",
      message: undefined,
      pickupTime: null,
      returnTime: null,
      drivingLicenseConfirmed: true,
      rentalRulesAccepted: true,
      bookingNotFinalAcknowledged: true,
      estimatedTotal: 61,
      status: "pending" as const,
      createdAt: "2026-05-02T10:00:00.000Z",
      licenseCheckStatus: "pending" as const,
      depositAgreed: false,
      adminNotes: null,
      paymentStatus: "unpaid" as const,
      depositAmount: null,
      paymentMethod: null,
      paymentNotes: null,
      rentalTotal: null,
      discountAmount: null,
      extraCharge: null,
    },
  ];

  const cars = [
    {
      id: "car-1",
      name: "Toyota Prius MJO146",
      brand: "Toyota",
      model: "Prius",
      year: 2015,
      fuel_type: "Hybrid",
      transmission: "Automatic",
      seats: 5,
      price_per_day: 20,
      image_url: null,
      status: "available" as const,
      maintenance_note: null,
      next_available_date: null,
      created_at: "2026-05-01T10:00:00.000Z",
    },
    {
      id: "car-2",
      name: "Toyota Prius MHP235",
      brand: "Toyota",
      model: "Prius",
      year: 2016,
      fuel_type: "Hybrid",
      transmission: "Automatic",
      seats: 5,
      price_per_day: 20,
      image_url: null,
      status: "maintenance" as const,
      maintenance_note: null,
      next_available_date: null,
      created_at: "2026-05-01T10:00:00.000Z",
    },
  ];

  it("counts overview metrics", () => {
    expect(getAdminOverviewMetrics(bookings, cars, "2026-05-10")).toMatchObject({
      pendingRequests: 1,
      activeRentals: 1,
      carsAvailable: 1,
      carsReturningToday: 1,
      revenueEstimate: 181,
    });
  });

  it("returns today's bookings", () => {
    expect(getTodayReturnBookings(bookings, "2026-05-10")).toHaveLength(1);
  });
});
