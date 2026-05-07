"use client";

import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { customerLoginAction } from "@/app/account/actions";

export function LoginForm() {
  const [state, formAction] = useFormState(customerLoginAction, undefined);

  return (
    <div className="card">
      <h1 className="text-xl font-bold text-brand-blue">Welcome back</h1>
      <p className="text-sm text-gray-500 mt-1 mb-5">
        Sign in to skip filling your details every time.
      </p>

      <form action={formAction} className="space-y-4">
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
              autoFocus
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="input"
            required
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 font-semibold">{state.error}</p>
        )}

        <SubmitButton />

        <p className="text-center text-xs text-gray-500 mt-2">
          New here?{" "}
          <Link href="/signup" className="text-brand-blue font-semibold">
            Create an account
          </Link>
        </p>
      </form>

      <p className="text-center text-[11px] text-gray-400 mt-6">
        Or just{" "}
        <Link href="/book" className="underline">
          book as a guest
        </Link>{" "}
        — no account needed.
      </p>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}
