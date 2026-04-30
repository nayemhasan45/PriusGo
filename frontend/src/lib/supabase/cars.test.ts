import { describe, expect, it } from "vitest";
import { buildAdminCarInsert, buildCarImageObjectPath, getCarStatusTone, getCustomerCarAvailability, getSupabaseErrorMessage, groupBookingBlocksByCar, mapCarRowToCar } from "./cars";

describe("Supabase car helpers", () => {
  it("maps a Supabase car row into frontend car shape", () => {
    const car = mapCarRowToCar({
      id: "toyota-prius-black-2016",
      name: "Toyota Prius Black",
      brand: "Toyota",
      model: "Prius",
      year: 2016,
      fuel_type: "Hybrid petrol",
      transmission: "Automatic",
      seats: 5,
      price_per_day: 42,
      image_url: null,
      status: "maintenance",
      created_at: "2026-04-29T12:00:00.000Z",
    });

    expect(car).toMatchObject({
      id: "toyota-prius-black-2016",
      name: "Toyota Prius Black",
      year: 2016,
      fuelType: "Hybrid petrol",
      pricePerDay: 42,
      status: "maintenance",
    });
    expect(car.features).toContain("Hybrid economy");
  });

  it("builds an admin car insert row from a new car form", () => {
    expect(buildAdminCarInsert({
      plateNumber: " abc123 ",
      name: "City hybrid",
      brand: "Toyota",
      model: "Prius Plus",
      year: 2020,
      fuelType: "Hybrid petrol / LPG",
      transmission: "Automatic CVT",
      seats: 7,
      pricePerDay: 35,
      imageUrl: "",
      status: "maintenance",
    })).toEqual({
      id: "ABC123",
      name: "City hybrid",
      brand: "Toyota",
      model: "Prius Plus",
      year: 2020,
      fuel_type: "Hybrid petrol / LPG",
      transmission: "Automatic CVT",
      seats: 7,
      price_per_day: 35,
      image_url: "/images/prius-fleet.jpg",
      status: "maintenance",
    });
  });

  it("builds a safe Supabase Storage object path for uploaded car images", () => {
    expect(buildCarImageObjectPath(" mjo146 ", "My Prius Photo.JPG")).toBe("cars/MJO146/my-prius-photo.jpg");
    expect(buildCarImageObjectPath("abc123", "front view.png")).toBe("cars/ABC123/front-view.png");
  });

  it("turns plain Supabase error objects into useful admin messages", () => {
    expect(getSupabaseErrorMessage({ message: "new row violates row-level security policy", code: "42501" }, "Could not add car.")).toBe(
      "Database blocked this action: admin insert/update policy is missing or your profile is not admin. Run backend/supabase-schema.sql in Supabase and make sure your profile role is admin.",
    );
    expect(getSupabaseErrorMessage({ message: "duplicate key value violates unique constraint" }, "Could not add car.")).toBe("This plate number already exists in the fleet.");
  });

  it("groups booking calendar blocks by car id", () => {
    const grouped = groupBookingBlocksByCar([
      { car_id: "car-1", start_date: "2026-05-01", end_date: "2026-05-03", status: "approved" },
      { car_id: "car-2", start_date: "2026-05-04", end_date: "2026-05-05", status: "approved" },
      { car_id: "car-1", start_date: "2026-05-10", end_date: "2026-05-12", status: "completed" },
    ]);

    expect(grouped["car-1"]).toHaveLength(2);
    expect(grouped["car-2"]).toHaveLength(1);
  });

  it("returns car status color tones", () => {
    expect(getCarStatusTone("available")).toContain("emerald");
    expect(getCarStatusTone("unavailable")).toContain("amber");
    expect(getCarStatusTone("maintenance")).toContain("red");
  });

  it("converts internal car statuses into customer availability labels", () => {
    expect(getCustomerCarAvailability("available")).toEqual({
      label: "Available",
      description: "Ready to rent. Choose dates and request this car directly.",
      canRent: true,
      tone: "available",
    });

    expect(getCustomerCarAvailability("unavailable")).toMatchObject({
      label: "Not available",
      canRent: false,
      tone: "not-available",
    });

    expect(getCustomerCarAvailability("maintenance")).toMatchObject({
      label: "Not available",
      canRent: false,
      tone: "not-available",
    });
  });
});
