"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { BrandHeader } from "@/components/BrandHeader";
import { loginAction } from "./actions";

export function LoginForm({ brandName }: { brandName: string }) {
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <>
      <BrandHeader variant="admin" brandName={brandName} hideAccountAction />
      <main className="mx-auto max-w-md px-4 py-10">
        <div className="card">
          <h1 className="text-xl font-bold text-brand-blue">Admin sign in</h1>
          <p className="text-sm text-gray-500 mt-1 mb-5">
            Enter the admin password to manage bookings.
          </p>

          <form action={formAction} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Password</label>
              <input
                name="password"
                type="password"
                className="input"
                autoComplete="current-password"
                required
                autoFocus
              />
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 font-semibold">{state.error}</p>
            )}

            <SubmitButton />
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          <Link href="/" className="underline">
            Back to customer site
          </Link>
        </p>
      </main>
    </>
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
