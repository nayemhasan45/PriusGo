export function calculateRentalDays(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Invalid booking dates");
  }

  if (end < start) {
    throw new Error("End date cannot be before start date");
  }

  const dayInMs = 1000 * 60 * 60 * 24;
  return Math.floor((end.getTime() - start.getTime()) / dayInMs) + 1;
}

export function estimateBookingPrice(
  pricePerDay: number,
  startDate: string,
  endDate: string,
  options: { pricePerWeek?: number } = {},
): number {
  const rentalDays = calculateRentalDays(startDate, endDate);
  if (!options.pricePerWeek) return rentalDays * pricePerDay;

  const fullWeeks = Math.floor(rentalDays / 7);
  const remainingDays = rentalDays % 7;
  return fullWeeks * options.pricePerWeek + remainingDays * pricePerDay;
}
