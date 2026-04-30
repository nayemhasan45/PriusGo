import type { Car } from "./types";

const sharedPriusImage = "/images/prius-fleet.jpg";

export const cars: Car[] = [
  {
    id: "MJO146",
    plateNumber: "MJO146",
    name: "Toyota Prius MJO146",
    brand: "Toyota",
    model: "Prius",
    year: 2014,
    fuelType: "Hybrid petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 20,
    status: "available",
    imageGradient: "from-[#fff7f4] via-white to-sky-100",
    imageUrl: sharedPriusImage,
    features: ["Low fuel cost", "Automatic", "City friendly", "5 seats"],
  },
  {
    id: "MHP235",
    plateNumber: "MHP235",
    name: "Toyota Prius MHP235",
    brand: "Toyota",
    model: "Prius",
    year: 2015,
    fuelType: "Hybrid petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 20,
    status: "available",
    imageGradient: "from-slate-100 via-white to-[#fff7f4]",
    imageUrl: sharedPriusImage,
    features: ["Hybrid economy", "Comfortable", "Long trip ready", "5 seats"],
  },
];

const legacyCarIds: Record<string, string> = {
  "toyota-prius-white-2014": "MJO146",
  "toyota-prius-silver-2015": "MHP235",
};

export function getCarById(id: string) {
  const normalizedId = legacyCarIds[id] ?? id;
  return cars.find((car) => car.id === normalizedId);
}
