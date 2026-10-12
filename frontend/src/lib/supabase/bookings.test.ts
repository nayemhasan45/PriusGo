import { describe, expect, it } from "vitest";
import { buildBookingInsert, mapBookingRowToRequest } from "./bookings";

describe("Supabase booking helpers", () => {
  it("builds a booking insert with user and customer details", () => {
    const insert = buildBookingInsert(
      {
        carId: "MJO146",
        fullName: "Al Amin",
        email: "al@example.com",
        phone: "+37060000000",
        startDate: "2026-05-01",
        endDate: "2026-05-03",
        pickupLocation: "Šiauliai",
        pickupTime: "10:30",
        returnTime: "18:00",
        drivingLicenseConfirmed: true,
        rentalRulesAccepted: true,
        bookingNotFinalAcknowledged: true,
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
      driving_license_confirmed: true,
      rental_rules_accepted: true,
      booking_not_final_acknowledged: true,
      license_check_status: "pending",
      deposit_agreed: false,
      pickup_time: "10:30",
      return_time: "18:00",
      admin_notes: null,
      status: "pending",
      total_estimated_price: 105,
    });
  });

  it("maps a database row into dashboard booking data", () => {
    // A variable allows the row to contain additional database fields.
    const row = {
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
      driving_license_confirmed: true,
      rental_rules_accepted: true,
      booking_not_final_acknowledged: true,
      license_check_status: "verified",
      deposit_agreed: true,
      pickup_time: "10:30",
      return_time: "18:00",
      admin_notes: "Bring printed contract.",
      status: "approved",
      total_estimated_price: 114,
      created_at: "2026-04-29T12:00:00.000Z",
    } as const;

    const booking = mapBookingRowToRequest(row);

    expect(booking).toMatchObject({
      id: "booking-1",
      carId: "MHP235",
      carName: "Toyota Prius MHP235",
      fullName: "Al Amin",
      email: "al@example.com",
      status: "approved",
      estimatedTotal: 114,
      pickupTime: "10:30",
      returnTime: "18:00",
      drivingLicenseConfirmed: true,
      rentalRulesAccepted: true,
      bookingNotFinalAcknowledged: true,
    });

    expect(booking).not.toHaveProperty("adminNotes");
  });
});

describe("Booking helper boundary cases", () => {
  const formValues = {
    carId: "MJO146",
    fullName: "Al Amin",
    email: "al@example.com",
    phone: "+37060000000",
    startDate: "2026-05-01",
    endDate: "2026-05-03",
    pickupLocation: "Šiauliai",
    pickupTime: "10:30",
    returnTime: "18:00",
    drivingLicenseConfirmed: true,
    rentalRulesAccepted: true,
    bookingNotFinalAcknowledged: true,
    message: "Morning pickup",
    estimatedTotal: 105,
  };

  const bookingRow = {
    id: "booking-1",
    user_id: "user-123",
    car_id: "MJO146",
    full_name: "Al Amin",
    email: "al@example.com",
    phone: "+37060000000",
    start_date: "2026-05-01",
    end_date: "2026-05-03",
    pickup_location: "Šiauliai",
    message: null,
    driving_license_confirmed: true,
    rental_rules_accepted: true,
    booking_not_final_acknowledged: true,
    pickup_time: "10:30",
    return_time: "18:00",
    status: "pending" as const,
    total_estimated_price: 105,
    created_at: "2026-04-29T12:00:00.000Z",
  };

  it("trims whitespace from the message and pickup/return times", () => {
    const result = buildBookingInsert(
      {
        ...formValues,
        message: "  Morning pickup  ",
        pickupTime: "  10:30  ",
        returnTime: "  18:00  ",
      },
      "user-123",
    );

    expect(result.message).toBe("Morning pickup");
    expect(result.pickup_time).toBe("10:30");
    expect(result.return_time).toBe("18:00");
  });

  it("converts whitespace-only message and empty times to null", () => {
    const result = buildBookingInsert(
      {
        ...formValues,
        message: "   ",
        pickupTime: "",
        returnTime: "   ",
      },
      "user-123",
    );

    expect(result.message).toBeNull();
    expect(result.pickup_time).toBeNull();
    expect(result.return_time).toBeNull();
  });

  it("handles an omitted optional message", () => {
    const valuesWithoutMessage = {
      carId: formValues.carId,
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      pickupLocation: formValues.pickupLocation,
      pickupTime: formValues.pickupTime,
      returnTime: formValues.returnTime,
      drivingLicenseConfirmed: formValues.drivingLicenseConfirmed,
      rentalRulesAccepted: formValues.rentalRulesAccepted,
      bookingNotFinalAcknowledged: formValues.bookingNotFinalAcknowledged,
      estimatedTotal: formValues.estimatedTotal,
    };

    const result = buildBookingInsert(valuesWithoutMessage, "user-123");

    expect(result.message).toBeNull();
  });

  it("uses defaults when customer details and price are null", () => {
    const result = mapBookingRowToRequest({
      ...bookingRow,
      full_name: null,
      email: null,
      total_estimated_price: null,
    });

    expect(result.fullName).toBe("Customer");
    expect(result.email).toBe("");
    expect(result.estimatedTotal).toBe(0);
    expect(result.message).toBeUndefined();
  });

  it("converts a decimal price string into a number", () => {
    const result = mapBookingRowToRequest({
      ...bookingRow,
      total_estimated_price: "114.50",
    });

    expect(result.estimatedTotal).toBe(114.5);
  });

  it("preserves a zero price and missing pickup/return times", () => {
    const result = mapBookingRowToRequest({
      ...bookingRow,
      total_estimated_price: 0,
      pickup_time: null,
      return_time: null,
    });

    expect(result.estimatedTotal).toBe(0);
    expect(result.pickupTime).toBeNull();
    expect(result.returnTime).toBeNull();
  });
});