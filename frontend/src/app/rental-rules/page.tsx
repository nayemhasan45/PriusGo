import Link from "next/link";
import { Header } from "@/components/header";

const rules = [
  "Valid driving license and ID or passport are required at pickup.",
  "Booking requests are not final until PriusGo confirms them.",
  "A deposit may be required before handoff.",
  "Pickup and return are arranged in Šiauliai unless agreed otherwise.",
  "Fuel level, cleanliness, mileage, and visible damage are checked at handoff and return.",
  "Smoking in the car is not allowed.",
  "Late return should be communicated as early as possible.",
  "The customer is responsible for fines, damage, and misuse during the rental period.",
];

export default function RentalRulesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      <section className="bg-[#0b0b0b] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Rental rules</p>
          <h1 className="mt-3 font-heading text-4xl font-black tracking-tight text-white sm:text-5xl">
            Clear rules before pickup
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            These rules keep the rental process clear for both sides. They are practical operating terms, not legal advice.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#booking" className="inline-flex items-center justify-center rounded-full bg-[#ff3600] px-7 py-3.5 font-semibold text-white transition hover:bg-[#cc2b00]">
              Request a booking
            </Link>
            <Link href="/" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white/80 transition hover:border-white/30 hover:text-white">
              Back to homepage
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto grid max-w-4xl gap-4 px-5 sm:px-6 lg:px-10">
          {rules.map((rule) => (
            <div key={rule} className="flex items-start gap-4 rounded-[1.5rem] border border-[#e9e9e9] bg-[#fff7f4] px-5 py-4">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ff3600] text-white">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                  <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm leading-relaxed text-[#0b0b0b] sm:text-base">{rule}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#e9e9e9] bg-[#fff7f4] py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6 lg:px-10">
          <h2 className="font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl">Questions?</h2>
          <p className="mt-4 max-w-2xl text-[#616161]">
            If anything is unclear before booking, use the booking form or contact PriusGo after approval for pickup details.
          </p>
        </div>
      </section>
    </main>
  );
}
