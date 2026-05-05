import Link from "next/link";
import { logoutAction } from "@/app/admin/login/actions";

export function AdminHeaderActions() {
  return (
    <div className="flex items-center gap-3">
      <Link
        href="/"
        className="text-xs font-semibold text-brand-yellow"
        target="_blank"
      >
        Site ↗
      </Link>
      <form action={logoutAction}>
        <button
          type="submit"
          className="text-xs font-semibold text-white/90 underline"
        >
          Log out
        </button>
      </form>
    </div>
  );
}
