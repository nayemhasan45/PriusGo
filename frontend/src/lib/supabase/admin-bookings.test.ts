import { describe, expect, it } from "vitest";
import { getAdminBookingMetrics, getQuickStatusActions, getStatusTone, normalizeAdminBookingRows } from "./admin-bookings";

describe("admin booking helpers", () => {
  const rows = [
    {
      id: "booking-1",
      user_id: "user-1",
      car_id: "toyota-prius-white-2014",
      full_name: "Al Amin",
      email: "al@example.com",
      phone: "+37060000000",
      start_date: "2026-05-01",
      end_date: "2026-05-03",
      pickup_location: "Šiauliai",
      message: "Morning pickup",
      status: "pending" as const,
      total_estimated_price: 105,
      created_at: "2026-04-29T12:00:00.000Z",
    },
    {
      id: "booking-2",
      user_id: "user-2",
      car_id: "toyota-prius-silver-2015",
      full_name: "Second Customer",
      email: "second@example.com",
      phone: "+37061111111",
      start_date: "2026-05-05",
      end_date: "2026-05-06",
      pickup_location: "Vilnius",
      message: null,
      status: "approved" as const,
      total_estimated_price: 76,
      created_at: "2026-04-30T12:00:00.000Z",
    },
  ];

  it("normalizes admin booking rows with readable car names", () => {
    const bookings = normalizeAdminBookingRows(rows);

    expect(bookings[0]).toMatchObject({
      id: "booking-1",
      carName: "Toyota Prius White",
      fullName: "Al Amin",
      status: "pending",
      estimatedTotal: 105,
    });
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
