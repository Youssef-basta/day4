import Link from "next/link";
import { customerLogoutAction } from "@/app/account/actions";
import type { CustomerSession } from "@/lib/customer-auth";

export function CustomerHeaderActions({
  session,
}: {
  session: CustomerSession | null;
}) {
  if (!session) {
    return (
      <Link
        href="/login"
        className="text-xs font-semibold text-brand-yellow underline-offset-2"
      >
        Sign in
      </Link>
    );
  }
  const first = session.name.split(" ")[0] || "Account";
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/account"
        className="text-xs font-semibold text-brand-yellow"
      >
        Hi, {first}
      </Link>
      <form action={customerLogoutAction}>
        <button
          type="submit"
          className="text-xs font-semibold text-white/80 underline"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
