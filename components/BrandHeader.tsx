import Link from "next/link";
import type { ReactNode } from "react";

export function BrandHeader({
  variant = "customer",
  rightSlot,
  hideAccountAction = false,
}: {
  variant?: "customer" | "admin";
  rightSlot?: ReactNode;
  hideAccountAction?: boolean;
}) {
  return (
    <header className="bg-brand-blue text-white">
      <div className="mx-auto max-w-md px-4 py-4 flex items-center justify-between">
        <Link
          href={variant === "admin" ? "/admin" : "/"}
          className="flex items-center gap-2"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-yellow text-brand-blue font-black">
            K
          </span>
          <div className="leading-tight">
            <div className="font-bold text-sm">Joe Barber Studio</div>
            <div className="text-[11px] uppercase tracking-wider text-brand-yellow">
              {variant === "admin" ? "Admin" : "Bookings"}
            </div>
          </div>
        </Link>
        {!hideAccountAction && rightSlot}
      </div>
    </header>
  );
}
