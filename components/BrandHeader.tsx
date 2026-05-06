import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function BrandHeader({
  variant = "customer",
  brandName = "Joe Barber Studio",
  rightSlot,
  hideAccountAction = false,
}: {
  variant?: "customer" | "admin";
  brandName?: string;
  rightSlot?: ReactNode;
  hideAccountAction?: boolean;
}) {
  return (
    <header className="relative bg-brand-blue text-white">
      <div className="mx-auto max-w-md px-4 py-4 flex flex-col items-center gap-2">
        <Link
          href={variant === "admin" ? "/admin" : "/"}
          className="flex flex-col items-center gap-2"
        >
          <span className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white overflow-hidden ring-2 ring-brand-yellow shadow-md">
            <Image
              src="/logo.jpeg"
              alt={`${brandName} logo`}
              width={160}
              height={160}
              priority
              className="h-20 w-20 object-contain"
            />
          </span>
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-extrabold text-base uppercase tracking-[0.22em] text-center [font-feature-settings:'ss01']">
              {brandName}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="h-px w-5 bg-brand-yellow" aria-hidden />
              <span className="text-brand-yellow text-[10px] leading-none" aria-hidden>
                ✦
              </span>
              <span className="h-px w-5 bg-brand-yellow" aria-hidden />
            </div>
          </div>
        </Link>
      </div>
      {!hideAccountAction && rightSlot && (
        <div className="absolute top-3 right-4">{rightSlot}</div>
      )}
    </header>
  );
}
