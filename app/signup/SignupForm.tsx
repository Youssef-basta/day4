"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { signupAction } from "@/app/account/actions";

export function SignupForm() {
  const [state, formAction] = useFormState(signupAction, undefined);

  return (
    <div className="card">
      <h1 className="text-xl font-bold text-brand-blue">Create an account</h1>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Save your details, see your booking history, and book faster next time.
      </p>

      <form action={formAction} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Full name</label>
          <input
            name="name"
            type="text"
            autoComplete="name"
            className="input"
            placeholder="Ahmed Al-Sabah"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Phone number
          </label>
          <div className="flex items-stretch rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-brand-blue overflow-hidden">
            <span className="px-3 py-3 bg-gray-50 text-gray-600 text-sm font-semibold border-r border-gray-300 select-none">
              +965
            </span>
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              maxLength={8}
              pattern="[0-9]{8}"
              className="flex-1 px-4 py-3 text-base focus:outline-none"
              placeholder="50001234"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">
            Email{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="input"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="input"
            minLength={8}
            required
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Minimum 8 characters.
          </p>
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 font-semibold">{state.error}</p>
        )}

        <SubmitButton />

        <p className="text-center text-xs text-gray-500 mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-blue font-semibold">
            Sign in
          </Link>
        </p>
      </form>

      <p className="text-center text-[11px] text-gray-400 mt-6">
        Don't want an account? You can still{" "}
        <Link href="/book" className="underline">
          book as a guest
        </Link>
        .
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Creating account…" : "Create account"}
    </button>
  );
}
