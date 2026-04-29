"use client";

import { Loader2, LogIn, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabaseReady = Boolean(createClient());

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        throw new Error("Supabase keys are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local first.");
      }

      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");
      const fullName = String(formData.get("fullName") ?? "").trim();
      const phone = String(formData.get("phone") ?? "").trim();

      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, phone } },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            full_name: fullName,
            phone,
            role: "customer",
          });
        }

        if (!data.session) {
          setMessage("Account created. Check your email to confirm, then sign in.");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
      <div className="flex rounded-full bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-black transition ${mode === "signin" ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-full px-4 py-2 text-sm font-black transition ${mode === "signup" ? "bg-slate-950 text-white" : "text-slate-600 hover:text-slate-950"}`}
        >
          Register
        </button>
      </div>

      <h2 className="mt-6 text-2xl font-black text-slate-950">
        {mode === "signin" ? "Sign in to PriusGo" : "Create customer account"}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {supabaseReady
          ? "Supabase Auth is enabled. Your bookings will be linked to your account."
          : "Supabase keys are not configured yet. Add .env.local to activate real login."}
      </p>

      {message && <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div>}
      {error && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        {mode === "signup" && (
          <>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Full name
              <input name="fullName" required placeholder="Al Amin" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              Phone
              <input name="phone" required placeholder="+370 ..." className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
            </label>
          </>
        )}
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Email
          <input name="email" required type="email" placeholder="you@email.com" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Password
          <input name="password" required type="password" minLength={6} placeholder="••••••••" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
        </label>
        <button disabled={isSubmitting || !supabaseReady} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : mode === "signin" ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>
    </div>
  );
}
