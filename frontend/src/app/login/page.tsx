import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Header } from "@/components/header";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="font-black uppercase tracking-[0.3em] text-emerald-600">Customer access</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Real Supabase login</h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Customers can register, sign in, and keep their PriusGo booking requests connected to their account.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/#booking" className="inline-flex rounded-full bg-emerald-600 px-7 py-4 font-black text-white hover:bg-emerald-700">
              Book a car
            </Link>
            <Link href="/dashboard" className="inline-flex rounded-full border border-slate-200 bg-white px-7 py-4 font-black text-slate-800 hover:border-emerald-300 hover:text-emerald-700">
              Open dashboard
            </Link>
          </div>
        </div>

        <AuthForm />
      </section>
    </main>
  );
}
