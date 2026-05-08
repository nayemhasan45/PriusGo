import { describe, expect, it } from "vitest";
import { buildAdminBookingsCsv, filterAdminBookings, getAdminAccountingMetrics, getAdminBookingMetrics, getAdminPaymentMetrics, getQuickStatusActions, getStatusTone, normalizeAdminBookingRows } from "./admin-bookings";

describe("admin booking helpers", () => {
  const rows = [
    {
      id: "booking-1",
      user_id: "user-1",
      car_id: "MJO146",
      full_name: "Al Amin",
      email: "al@example.com",
      phone: "+37060000000",
      start_date: "2026-05-01",
      end_date: "2026-05-03",
      pickup_location: "Šiauliai",
      message: "Morning pickup",
      driving_license_confirmed: true,
      rental_rules_accepted: true,
      booking_not_final_acknowledged: true,
      license_check_status: "pending" as const,
      deposit_agreed: false,
      payment_status: "unpaid" as const,
      deposit_amount: null,
      payment_method: null,
      payment_notes: null,
      rental_total: 105,
      discount_amount: 0,
      extra_charge: 0,
      pickup_time: "10:30",
      return_time: "18:00",
      admin_notes: null,
      status: "pending" as const,
      total_estimated_price: 105,
      created_at: "2026-04-29T12:00:00.000Z",
    },
    {
      id: "booking-2",
      user_id: "user-2",
      car_id: "MHP235",
      full_name: "Second Customer",
      email: "second@example.com",
      phone: "+37061111111",
      start_date: "2026-05-05",
      end_date: "2026-05-06",
      pickup_location: "Vilnius",
      message: null,
      driving_license_confirmed: true,
      rental_rules_accepted: true,
      booking_not_final_acknowledged: true,
      license_check_status: "verified" as const,
      deposit_agreed: true,
      payment_status: "deposit_paid" as const,
      deposit_amount: 50,
      payment_method: "cash" as const,
      payment_notes: 'Paid cash, "receipt" signed.',
      rental_total: 76,
      discount_amount: 10,
      extra_charge: 5,
      pickup_time: "11:00",
      return_time: "17:30",
      admin_notes: "Call before pickup.",
      status: "picked_up" as const,
      total_estimated_price: 76,
      created_at: "2026-04-30T12:00:00.000Z",
    },
  ];

  it("normalizes admin booking rows with readable car names", () => {
    const bookings = normalizeAdminBookingRows(rows);

    expect(bookings[0]).toMatchObject({
      id: "booking-1",
      carName: "Toyota Prius MJO146",
      fullName: "Al Amin",
      status: "pending",
      estimatedTotal: 105,
      pickupTime: "10:30",
      returnTime: "18:00",
      drivingLicenseConfirmed: true,
      rentalRulesAccepted: true,
      bookingNotFinalAcknowledged: true,
      licenseCheckStatus: "pending",
      depositAgreed: false,
      paymentStatus: "unpaid",
      depositAmount: null,
      paymentMethod: null,
      paymentNotes: null,
      rentalTotal: 105,
      discountAmount: 0,
      extraCharge: 0,
    });
    expect(bookings[0]).toHaveProperty("adminNotes", null);
  });

  it("calculates admin booking metrics", () => {
    const metrics = getAdminBookingMetrics(normalizeAdminBookingRows(rows));

    expect(metrics).toEqual({
      total: 2,
      pending: 1,
      active: 1,
      revenueEstimate: 181,
    });
  });

  it("calculates payment metrics", () => {
    const metrics = getAdminPaymentMetrics(normalizeAdminBookingRows(rows));

    expect(metrics).toEqual({
      unpaid: 1,
      depositPaid: 1,
      paid: 0,
      refunded: 0,
    });
  });

  it("calculates accounting metrics", () => {
    const metrics = getAdminAccountingMetrics(normalizeAdminBookingRows(rows));

    expect(metrics).toEqual({
      rentalTotal: 181,
      depositAmount: 50,
      discountAmount: 10,
      extraCharge: 5,
      amountDue: 176,
    });
  });

  it("returns a clear style tone for each status", () => {
    expect(getStatusTone("pending")).toContain("amber");
    expect(getStatusTone("approved")).toContain("emerald");
    expect(getStatusTone("picked_up")).toContain("sky");
    expect(getStatusTone("rejected")).toContain("red");
  });

  it("returns quick actions that skip the booking current status", () => {
    expect(getQuickStatusActions("pending")).toEqual([
      { status: "approved", label: "Approve" },
      { status: "rejected", label: "Reject" },
      { status: "cancelled", label: "Cancel" },
    ]);

    expect(getQuickStatusActions("approved")).toEqual([
      { status: "picked_up", label: "Mark picked up" },
      { status: "cancelled", label: "Cancel" },
      { status: "rejected", label: "Reject" },
    ]);

    expect(getQuickStatusActions("picked_up")).toEqual([
      { status: "returned", label: "Mark returned" },
      { status: "completed", label: "Complete" },
      { status: "cancelled", label: "Cancel" },
    ]);
  });

  it("filters bookings by search, status, car, and date range", () => {
    const bookings = normalizeAdminBookingRows(rows);

    expect(filterAdminBookings(bookings, { query: "morning", status: "all", carId: "all", startDate: "", endDate: "" })).toHaveLength(1);
    expect(filterAdminBookings(bookings, { query: "", status: "picked_up", carId: "all", startDate: "", endDate: "" })).toHaveLength(1);
    expect(filterAdminBookings(bookings, { query: "", status: "all", carId: "MJO146", startDate: "2026-05-01", endDate: "2026-05-04" })).toHaveLength(1);
    expect(filterAdminBookings(bookings, { query: "", status: "all", carId: "all", startDate: "2026-05-06", endDate: "2026-05-08" })).toHaveLength(1);
  });

  it("builds a CSV export with payment fields", () => {
    const csv = buildAdminBookingsCsv(normalizeAdminBookingRows(rows));

    expect(csv).toContain("Payment status");
    expect(csv).toContain("deposit_paid");
    expect(csv).toContain('"Paid cash, ""receipt"" signed."');
  });
});
