"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { AdminHeaderActions } from "@/components/AdminHeaderActions";

const TABS = [
  { href: "/admin", label: "Today" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/slots", label: "Slots" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  return (
    <>
      <BrandHeader variant="admin" rightSlot={<AdminHeaderActions />} />
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto max-w-md px-2 flex">
          {TABS.map((t) => {
            const active =
              t.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`flex-1 text-center py-3 text-sm font-semibold border-b-2 ${
                  active
                    ? "border-brand-blue text-brand-blue"
                    : "border-transparent text-gray-500"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
      <main className="mx-auto max-w-md px-4 py-5 pb-24">{children}</main>
    </>
  );
}
