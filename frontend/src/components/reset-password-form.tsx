"use client";

import { KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
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
      const password = String(formData.get("password") ?? "");
      const confirmPassword = String(formData.get("confirmPassword") ?? "");

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      event.currentTarget.reset();
      setMessage("Password updated. You can now sign in with your new password.");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Password update failed. Open the reset link again and retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-[#ff3600] text-white">
        <KeyRound className="size-7" />
      </div>

      <h2 className="mt-6 text-2xl font-black text-slate-950">Create a new password</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Enter a new password after opening the reset link from your email.
      </p>

      {message && <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">{message}</div>}
      {error && <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div>}

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          New password
          <input name="password" required type="password" minLength={6} placeholder="••••••••" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-slate-700">
          Confirm password
          <input name="confirmPassword" required type="password" minLength={6} placeholder="••••••••" className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-emerald-500" />
        </label>

        <button disabled={isSubmitting || !supabaseReady} className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-black text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : <KeyRound className="size-5" />}
          Update password
        </button>
      </form>

      <Link href="/login" className="mt-5 inline-flex text-sm font-black text-[#ff3600] underline underline-offset-4 transition hover:text-[#cc2b00]">
        Back to sign in
      </Link>
    </div>
  );
}
