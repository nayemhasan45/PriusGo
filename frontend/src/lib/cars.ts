import type { Car } from "./types";

export const cars: Car[] = [
  {
    id: "toyota-prius-white-2014",
    name: "Toyota Prius White",
    brand: "Toyota",
    model: "Prius",
    year: 2014,
    fuelType: "Hybrid petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 35,
    status: "available",
    imageGradient: "from-emerald-100 via-white to-sky-100",
    features: ["Low fuel cost", "Automatic", "City friendly", "5 seats"],
  },
  {
    id: "toyota-prius-silver-2015",
    name: "Toyota Prius Silver",
    brand: "Toyota",
    model: "Prius",
    year: 2015,
    fuelType: "Hybrid petrol",
    transmission: "Automatic",
    seats: 5,
    pricePerDay: 38,
    status: "available",
    imageGradient: "from-slate-100 via-white to-emerald-100",
    features: ["Hybrid economy", "Comfortable", "Long trip ready", "5 seats"],
  },
];

export function getCarById(id: string) {
  return cars.find((car) => car.id === id);
}
