"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandHeader } from "@/components/BrandHeader";
import { AdminHeaderActions } from "@/components/AdminHeaderActions";

const TABS = [
  { href: "/admin", label: "Today" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/slots", label: "Slots" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/reminders", label: "Reminders" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminChrome({
  brandName,
  children,
}: {
  brandName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) return <>{children}</>;

  return (
    <div className="admin-shell min-h-screen bg-slate-100">
      <BrandHeader
        variant="admin"
        brandName={brandName}
        rightSlot={<AdminHeaderActions />}
      />
      <div className="bg-slate-900 text-slate-100">
        <div className="mx-auto max-w-md px-4 py-1.5 flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] font-bold">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-yellow" />
          Admin Panel
        </div>
      </div>
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="mx-auto max-w-md overflow-x-auto no-scrollbar">
          <div className="flex px-2 min-w-max">
            {TABS.map((t) => {
              const active =
                t.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(t.href);
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition ${
                    active
                      ? "border-brand-yellow text-brand-yellow"
                      : "border-transparent text-slate-300 hover:text-white"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-md px-4 py-5 pb-24">{children}</main>
    </div>
  );
}
