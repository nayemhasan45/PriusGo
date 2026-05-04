import { describe, expect, it } from "vitest";
import { getAdminBookingMetrics, getQuickStatusActions, getStatusTone, normalizeAdminBookingRows } from "./admin-bookings";

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
      pickup_time: "11:00",
      return_time: "17:30",
      admin_notes: "Call before pickup.",
      status: "approved" as const,
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
    });
    expect(bookings[0]).toHaveProperty("adminNotes", null);
  });

  it("calculates admin booking metrics", () => {
    const metrics = getAdminBookingMetrics(normalizeAdminBookingRows(rows));

    expect(metrics).toEqual({
      total: 2,
      pending: 1,
      approved: 1,
      revenueEstimate: 181,
    });
  });

  it("returns a clear style tone for each status", () => {
    expect(getStatusTone("pending")).toContain("amber");
    expect(getStatusTone("approved")).toContain("emerald");
    expect(getStatusTone("rejected")).toContain("red");
  });

  it("returns quick actions that skip the booking current status", () => {
    expect(getQuickStatusActions("pending")).toEqual([
      { status: "approved", label: "Approve" },
      { status: "rejected", label: "Reject" },
      { status: "cancelled", label: "Cancel" },
    ]);

    expect(getQuickStatusActions("approved")).toEqual([
      { status: "completed", label: "Complete" },
      { status: "cancelled", label: "Cancel" },
      { status: "rejected", label: "Reject" },
    ]);
  });
});
