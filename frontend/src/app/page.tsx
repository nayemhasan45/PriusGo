import { ArrowRight, BadgeCheck, CarFront, Clock, Fuel, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { BookingForm } from "@/components/booking-form";
import { CarCard } from "@/components/car-card";
import { Header } from "@/components/header";
import { cars } from "@/lib/cars";

const steps = [
  "Choose your Prius",
  "Send booking request",
  "We confirm availability",
  "Pick up in Šiauliai",
];

const faqs = [
  ["Do I pay online now?", "Not in this demo. First version collects booking requests. Payment can be added later."],
  ["Where is pickup?", "Default pickup is Šiauliai. Exact place can be confirmed after booking."],
  ["Can this scale?", "Yes. The project uses Next.js and Supabase-ready structure, so bookings, auth, admin, payments, and mobile app can be added step by step."],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#ffffff_45%,#ecfeff_100%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm">
              <Sparkles className="size-4" /> Affordable hybrid rental in Šiauliai
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Rent a Toyota Prius without stress.
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-slate-600">
              PriusGo helps you book fuel-efficient Toyota Prius cars in Šiauliai for daily use, business trips, and city movement.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#booking" className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-7 py-4 font-black text-white shadow-xl shadow-emerald-600/20 transition hover:bg-emerald-700">
                Book a Prius <ArrowRight className="size-5" />
              </a>
              <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-4 font-black text-slate-800 transition hover:border-emerald-300 hover:text-emerald-700">
                Login / Register
              </Link>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <Stat icon={<Fuel />} label="Hybrid economy" />
              <Stat icon={<ShieldCheck />} label="Simple rules" />
              <Stat icon={<Clock />} label="Fast request" />
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white bg-white/70 p-4 shadow-2xl shadow-emerald-900/10 backdrop-blur">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-300">Featured car</p>
                  <h2 className="mt-2 text-3xl font-black">Toyota Prius</h2>
                </div>
                <CarFront className="size-10 text-emerald-300" />
              </div>
              <div className="my-10 rounded-[2rem] bg-gradient-to-br from-emerald-100 to-sky-100 p-8">
                <div className="mx-auto h-20 max-w-sm rounded-t-[5rem] bg-slate-800" />
                <div className="mx-auto h-12 max-w-md rounded-b-[2rem] bg-white shadow-inner" />
                <div className="mx-auto mt-[-20px] flex max-w-xs justify-between px-8">
                  <span className="size-12 rounded-full bg-slate-950" />
                  <span className="size-12 rounded-full bg-slate-950" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">€35+</p><p className="text-xs text-slate-300">per day</p></div>
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">5</p><p className="text-xs text-slate-300">seats</p></div>
                <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black">2</p><p className="text-xs text-slate-300">cars</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cars" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-black uppercase tracking-[0.3em] text-emerald-600">Available cars</p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">Choose your Prius</h2>
          </div>
          <p className="max-w-xl text-slate-600">Start with a simple booking request. Admin approval and payments can be added in the next version.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {cars.map((car) => <CarCard key={car.id} car={car} />)}
        </div>
      </section>

      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="font-black uppercase tracking-[0.3em] text-emerald-600">Simple process</p>
            <h2 className="mt-3 text-4xl font-black text-slate-950">Built for a fast demo, ready to scale.</h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">This first version proves the business. Later we connect real auth, admin approval, payments, contracts, and fleet management.</p>
          </div>
          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-4 rounded-3xl border border-slate-200 p-5">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100 font-black text-emerald-700">{index + 1}</span>
                <span className="font-black text-slate-800">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <BookingForm />
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {faqs.map(([question, answer]) => (
            <div key={question} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <BadgeCheck className="mb-4 size-6 text-emerald-600" />
              <h3 className="font-black text-slate-950">{question}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 font-black text-slate-700 shadow-sm">
      <span className="text-emerald-600 [&_svg]:size-5">{icon}</span>
      {label}
    </div>
  );
}
