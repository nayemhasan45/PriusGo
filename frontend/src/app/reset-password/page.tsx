import Link from "next/link";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { Header } from "@/components/header";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#fff7f4]">
      <Header />
      <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:py-20">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff3600]">Account access</p>
          <h1 className="mt-3 font-heading text-3xl font-black tracking-tight text-[#0b0b0b] sm:text-4xl lg:text-5xl">
            Reset your password
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#616161] sm:mt-5 sm:text-lg">
            Use the secure email link from PriusGo to create a new password for your customer account.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link href="/login" className="inline-flex items-center justify-center rounded-full bg-[#ff3600] px-7 py-3.5 font-semibold text-white transition hover:bg-[#cc2b00] sm:px-8 sm:py-4">
              Back to sign in
            </Link>
            <Link href="/#booking" className="inline-flex items-center justify-center rounded-full border border-[#e9e9e9] bg-white px-7 py-3.5 font-semibold text-[#0b0b0b] transition hover:border-[#ff3600] hover:text-[#ff3600] sm:px-8 sm:py-4">
              Book a car
            </Link>
          </div>
        </div>

        <ResetPasswordForm />
      </section>
    </main>
  );
}
