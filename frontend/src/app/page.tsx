import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { CustomerCars } from "@/components/customer-cars";
import { FleetCount } from "@/components/fleet-count";
import { Header } from "@/components/header";

const steps = [
  { num: "01", title: "Choose your Prius", desc: "Browse available cars with live dates, pricing, and full specs." },
  { num: "02", title: "Send booking request", desc: "Submit your rental dates, contact info, and pickup location." },
  { num: "03", title: "We confirm availability", desc: "Al-Amin reviews and approves your request within hours." },
  { num: "04", title: "Pick up in Šiauliai", desc: "Collect the car at the confirmed pickup point." },
];

const rules = [
  "Valid driving license required",
  "ID or passport required",
  "Pickup and return in Šiauliai",
  "Fuel policy confirmed before pickup",
  "Customer responsible for fines and damage during rental",
  "No smoking in the car",
  "Late return must be reported early",
];

const faqs = [
  { q: "Do I pay online now?", a: "No online payment in this first version. We collect booking requests and confirm payment details — cash, bank transfer, or Revolut — directly with you after approval." },
  { q: "Where is the pickup point?", a: "Default pickup is in Šiauliai, Lithuania. The exact location is confirmed with you after your booking is approved." },
  { q: "What documents do I need?", a: "A valid driving license and ID or passport. Both are required at pickup without exception." },
  { q: "Can I rent for a full week?", a: "Yes. Weekly rentals are available at €100/week — saving you versus the standard €20/day daily rate." },
  { q: "Can I extend my booking?", a: "Yes, if the car is still available. Contact us before your rental period ends to arrange an extension." },
  { q: "Can I drive outside Lithuania?", a: "Please discuss your travel plans when booking. Cross-border arrangements depend on your destination and insurance coverage." },
];

const trustItems = [
  { title: "Transparent pricing", desc: "€20/day or €100/week, shown before booking." },
  { title: "Manual approval", desc: "Every request is reviewed before the rental becomes final." },
  { title: "Šiauliai pickup", desc: "Pickup and return are arranged locally in Šiauliai." },
  { title: "License + ID check", desc: "Valid driving license and ID or passport required at pickup." },
  { title: "Deposit agreed first", desc: "Deposit and payment details are confirmed before handoff." },
  { title: "No online payment risk", desc: "No card capture or hidden checkout flow in this version." },
];

const contactMethods = [
  { title: "Booking request form", desc: "Fastest way to contact PriusGo and reserve a car." },
  { title: "Approval follow-up", desc: "After approval, you receive the pickup details and direct contact for the rental." },
  { title: "Customer dashboard", desc: "Signed-in customers can track requests and rental status in one place." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />

      {/* ── HERO ── */}
      <section className="bg-[#0b0b0b]">
        <div
          className="relative w-full overflow-hidden bg-[#0b0b0b] bg-cover bg-center px-5 pt-14 pb-0 sm:px-6 sm:pt-20 lg:grid lg:min-h-[720px] lg:grid-cols-2 lg:items-end lg:gap-16 lg:px-10 lg:pt-28 xl:px-[calc((100vw-1320px)/2+2.5rem)]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(11,11,11,0.95) 0%, rgba(11,11,11,0.78) 44%, rgba(11,11,11,0.32) 100%), url('/images/prius-hero.jpg')",
            backgroundPosition: "center 56%",
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(255,54,0,0.22),transparent_32%)]" />
          <div className="relative z-10 pb-14 sm:pb-20 lg:pb-28">
            <div className="fade-up fade-up-1 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/70 backdrop-blur sm:text-sm">
              <span className="size-2 animate-pulse rounded-full bg-[#ff3600]" />
              Available now · Šiauliai, Lithuania
            </div>

            <h1 className="fade-up fade-up-2 mt-6 font-heading text-[2.5rem] font-black leading-[1.04] tracking-tight text-white sm:mt-8 sm:text-5xl md:text-6xl lg:text-[4.5rem]">
              Rent a Toyota<br />
              <span className="text-[#ff3600]">Prius</span> in<br />
              Šiauliai.
            </h1>

            <p className="fade-up fade-up-3 mt-5 max-w-md text-base leading-relaxed text-white/65 sm:mt-6 sm:text-lg">
              Affordable hybrid car rental for daily use, business trips, and city movement. Simple booking, direct contact, no hassle.
            </p>

            <div className="fade-up fade-up-4 mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row">
              <a
                href="#cars"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#ff3600] px-7 py-3.5 font-semibold text-white transition hover:bg-[#cc2b00] sm:px-8 sm:py-4"
              >
                Choose a car
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1 8L8 1M8 1H2.5M8 1V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
              <a
                href="#cars"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3.5 font-semibold text-white/80 backdrop-blur transition hover:border-white/30 hover:text-white sm:px-8 sm:py-4"
              >
                View fleet
              </a>
            </div>

            <div className="fade-up fade-up-5 mt-10 grid grid-cols-3 gap-3 border-t border-white/15 pt-8 sm:mt-12 sm:gap-4 sm:pt-10">
              <div>
                <p className="font-heading text-2xl font-black text-white sm:text-3xl">€20</p>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">per day</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-black text-white sm:text-3xl">€100</p>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">per week</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-black text-white sm:text-3xl"><FleetCount /></p>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">cars in fleet</p>
              </div>
            </div>
          </div>

          {/* Hero car info */}
          <div className="fade-up fade-up-3 relative z-10 hidden lg:flex lg:justify-end lg:pb-10">
            <div className="w-full max-w-md rounded-[2.25rem] border border-white/15 bg-black/35 p-6 text-white shadow-2xl backdrop-blur-md">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-white/50">Featured car</p>
                  <h3 className="mt-1.5 font-heading text-2xl font-black text-white">Toyota Prius</h3>
                </div>
                <span className="rounded-full bg-[#ff3600] px-3 py-1 text-xs font-semibold text-white">Available</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[["Hybrid", "fuel"], ["Auto", "gearbox"], ["5", "seats"]].map(([val, label]) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-3 text-center ring-1 ring-white/10">
                    <p className="font-heading text-lg font-black text-white">{val}</p>
                    <p className="text-xs text-white/45">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLEET ── */}
      <section id="cars" className="bg-[#fff7f4] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Available fleet</p>
              <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
                Choose your car
              </h2>
            </div>
            <p className="max-w-sm text-[#616161]">
              Each car shown with real-time availability, pricing, and blocked rental dates.
            </p>
          </div>
          <CustomerCars />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="process" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="mb-10 max-w-lg sm:mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Simple process</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
              How it works
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-[2rem] border border-[#e9e9e9] bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-[#ff3600]/20 hover:shadow-xl hover:shadow-[#ff3600]/5 sm:p-8"
              >
                <p className="font-heading text-4xl font-black text-[#ff3600] opacity-50">{step.num}</p>
                <h3 className="mt-5 font-heading text-lg font-black text-[#0b0b0b]">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#616161]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-[#fff7f4] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="mb-10 max-w-lg sm:mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Transparent rates</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
              Simple pricing
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#e9e9e9] sm:p-8">
              <p className="text-sm font-medium text-[#616161]">Daily rate</p>
              <p className="mt-3 font-heading text-5xl font-black text-[#0b0b0b]">€20</p>
              <p className="mt-1 text-sm text-[#616161]">per day</p>
              <ul className="mt-8 space-y-3 text-sm text-[#616161]">
                {["Hybrid fuel economy", "5 seats", "Automatic transmission"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-[#ff3600]" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-[#0b0b0b] p-6 shadow-xl sm:p-8">
              <div className="mb-5 inline-flex rounded-full bg-[#ff3600]/10 px-3 py-1 text-xs font-semibold text-[#ff3600]">
                Best value
              </div>
              <p className="text-sm font-medium text-white/55">Weekly rate</p>
              <p className="mt-3 font-heading text-5xl font-black text-white">€100</p>
              <p className="mt-1 text-sm text-white/50">per week</p>
              <ul className="mt-8 space-y-3 text-sm text-white/55">
                {["Save vs daily rate", "Extra days at daily rate", "Flexible pickup & return"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-[#ff3600]" />{f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#e9e9e9] sm:col-span-2 sm:p-8 lg:col-span-1">
              <p className="text-sm font-medium text-[#616161]">Payment options</p>
              <p className="mt-3 font-heading text-2xl font-black text-[#0b0b0b]">Flexible payment</p>
              <ul className="mt-8 space-y-3 text-sm text-[#616161]">
                {["Cash on pickup", "Bank transfer", "Revolut"].map((f) => (
                  <li key={f} className="flex items-center gap-2.5">
                    <span className="size-1.5 shrink-0 rounded-full bg-[#ff3600]" />{f}
                  </li>
                ))}
              </ul>
              <a
                href="#cars"
                className="mt-8 inline-flex items-center gap-1.5 text-sm font-semibold text-[#ff3600] transition hover:gap-2.5"
              >
                Choose car →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST ── */}
      <section id="trust" className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="mb-10 max-w-xl sm:mb-14">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Trust first</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
              Why renters trust PriusGo
            </h2>
            <p className="mt-4 text-[#616161]">
              Clear pricing, manual approval, and local handoff keep the process simple and safe for both sides.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trustItems.map((item, index) => (
              <div key={item.title} className="rounded-[2rem] border border-[#e9e9e9] bg-[#fff7f4] p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 sm:p-8">
                <p className="font-heading text-5xl font-black text-[#ff3600] opacity-20">0{index + 1}</p>
                <h3 className="mt-4 font-heading text-xl font-black text-[#0b0b0b]">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#616161]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOCAL SEO ── */}
      <section id="siauliai" className="bg-[#fff7f4] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-start lg:gap-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Šiauliai car rental</p>
              <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
                Local Prius rental for Šiauliai, Lithuania
              </h2>
              <p className="mt-5 max-w-2xl text-[#616161]">
                PriusGo is built for drivers in Šiauliai who want a reliable Toyota Prius for daily movement, business travel, airport runs, or weekend plans.
                Pickup is arranged locally in Šiauliai, and every request is reviewed before the rental is confirmed.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-[#e9e9e9] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Pickup area</p>
                <p className="mt-2 font-heading text-xl font-black text-[#0b0b0b]">Šiauliai, Lithuania</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#e9e9e9] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Rental type</p>
                <p className="mt-2 font-heading text-xl font-black text-[#0b0b0b]">Toyota Prius hybrid</p>
              </div>
              <div className="rounded-[1.5rem] border border-[#e9e9e9] bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Best for</p>
                <p className="mt-2 font-heading text-xl font-black text-[#0b0b0b]">City and business trips</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING ── */}
      <section className="bg-[#0b0b0b] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="mb-10 sm:mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Request a rental</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Book your Prius
            </h2>
          </div>
          <BookingForm />
        </div>
      </section>

      {/* ── RULES ── */}
      <section className="bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="grid gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Before you rent</p>
              <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
                Rental rules
              </h2>
              <p className="mt-5 leading-relaxed text-[#616161]">
                Please read these before submitting a booking. Clear rules protect both you and the car owner.
              </p>
              <a
                href="/rental-rules"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#ff3600] px-8 py-4 font-semibold text-white transition hover:bg-[#cc2b00]"
              >
                Read rental rules
                <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1 8L8 1M8 1H2.5M8 1V6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </a>
            </div>
            <ul className="grid gap-3">
              {rules.map((rule) => (
                <li key={rule} className="flex items-start gap-4 rounded-2xl border border-[#e9e9e9] bg-[#fff7f4] px-5 py-4">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ff3600] text-white">
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  <span className="text-sm font-medium text-[#0b0b0b]">{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-[#fff7f4] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="mb-10 sm:mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Common questions</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">FAQ</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group rounded-[1.5rem] border border-[#e9e9e9] bg-white">
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5">
                  <span className="font-heading font-bold text-[#0b0b0b]">{q}</span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e9e9e9] text-lg text-[#616161] transition group-open:rotate-45 group-open:border-[#ff3600] group-open:text-[#ff3600]">
                    +
                  </span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-[#616161]">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="bg-[#0b0b0b] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-[1320px] px-5 sm:px-6 lg:px-10">
          <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center lg:gap-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Get in touch</p>
              <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">How to reach PriusGo</h2>
              <p className="mt-5 leading-relaxed text-white/55">
                Use the booking form to contact us fastest. After approval, you receive the exact pickup details and direct follow-up for the rental.
              </p>
            </div>
            <div className="grid gap-4">
              {contactMethods.map(({ title, desc }) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/5 p-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/35">{title}</p>
                  <p className="mt-1.5 font-medium text-white">{desc}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-white/8 bg-white/5 p-5">
                <p className="text-xs font-medium uppercase tracking-wider text-white/35">Location</p>
                <p className="mt-1.5 font-medium text-white">Šiauliai, Lithuania</p>
              </div>
              <a
                href="#booking"
                className="mt-1 inline-flex items-center justify-center gap-3 rounded-full bg-[#ff3600] px-8 py-4 font-semibold text-white transition hover:bg-[#cc2b00]"
              >
                Submit booking request →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5 bg-[#0b0b0b] py-8">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-5 text-center text-sm text-white/30 sm:flex-row sm:px-6 sm:text-left lg:px-10">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-[#ff3600] text-[9px] font-black text-white">P</span>
            <span className="font-heading font-bold text-white/55">PriusGo</span>
          </div>
          <p>© {new Date().getFullYear()} PriusGo · Toyota Prius rental in Šiauliai, Lithuania</p>
          <Link href="/login" className="transition hover:text-white/55">Login / Register</Link>
        </div>
      </footer>

      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
