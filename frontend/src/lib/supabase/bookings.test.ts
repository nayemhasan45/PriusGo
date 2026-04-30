import { describe, expect, it } from "vitest";
import { buildBookingInsert, mapBookingRowToRequest } from "./bookings";

describe("Supabase booking helpers", () => {
  it("builds a Supabase booking insert with logged-in user id and customer contact metadata", () => {
    const insert = buildBookingInsert(
      {
        carId: "MJO146",
        fullName: "Al Amin",
        email: "al@example.com",
        phone: "+37060000000",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
        pickupLocation: "Šiauliai",
        message: "Need morning pickup",
        estimatedTotal: 105,
      },
      "user-123",
    );

    expect(insert).toEqual({
      user_id: "user-123",
      car_id: "MJO146",
      full_name: "Al Amin",
      email: "al@example.com",
      phone: "+37060000000",
      start_date: "2026-05-01",
      end_date: "2026-05-03",
      pickup_location: "Šiauliai",
      message: "Need morning pickup",
      status: "pending",
      total_estimated_price: 105,
    });
  });

  it("maps a Supabase booking row into dashboard booking shape", () => {
    const booking = mapBookingRowToRequest({
      id: "booking-1",
      user_id: "user-123",
      car_id: "MHP235",
      full_name: "Al Amin",
      email: "al@example.com",
      phone: "+37060000000",
      start_date: "2026-05-01",
      end_date: "2026-05-03",
      pickup_location: "Šiauliai",
      message: null,
      status: "approved",
      total_estimated_price: 114,
      created_at: "2026-04-29T12:00:00.000Z",
    });

    expect(booking).toMatchObject({
      id: "booking-1",
      carId: "MHP235",
      carName: "Toyota Prius MHP235",
      fullName: "Al Amin",
      email: "al@example.com",
      status: "approved",
      estimatedTotal: 114,
    });
  });
});
