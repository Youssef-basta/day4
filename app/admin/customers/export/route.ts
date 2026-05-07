import { NextResponse } from "next/server";
import { getCurrentAdmin, getCustomers } from "@/lib/db/admin";

function csvEscape(v: string | number | undefined): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const session = await getCurrentAdmin();
  if (!session) {
    return NextResponse.redirect(new URL("/admin/login", "http://localhost"));
  }

  const customers = await getCustomers();

  const headers = [
    "phone",
    "name",
    "email",
    "has_account",
    "is_vip",
    "bookings_total",
    "bookings_done",
    "bookings_cancelled",
    "lifetime_spent_kwd",
    "last_visit",
    "notes",
  ];

  const rows = customers.map((c) =>
    [
      c.phone,
      c.displayName,
      c.email ?? "",
      c.hasAccount ? "yes" : "no",
      c.isVip ? "yes" : "no",
      c.bookingCount,
      c.doneCount,
      c.cancelledCount,
      c.totalSpentKwd,
      c.lastVisit ?? "",
      c.notes ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );

  const body = [headers.join(","), ...rows].join("\r\n");
  const filename = `joe-barber-customers-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
