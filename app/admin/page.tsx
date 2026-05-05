"use client";

import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { todayKey } from "@/lib/seed";
import { BookingRow } from "@/components/BookingRow";
import { EmptyState } from "@/components/EmptyState";

export default function AdminDashboardPage() {
  const { bookings, getService, getSlot } = useStore();
  const today = todayKey();

  const todays = useMemo(() => {
    return bookings
      .filter((b) => {
        const slot = getSlot(b.slotId);
        return slot?.date === today && b.status !== "cancelled";
      })
      .sort((a, b) => {
        const sa = getSlot(a.slotId)?.time ?? "";
        const sb = getSlot(b.slotId)?.time ?? "";
        return sa.localeCompare(sb);
      });
  }, [bookings, today, getSlot]);

  const pending = todays.filter((b) => b.status === "pending").length;
  const done = todays.filter((b) => b.status === "done").length;

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Today</h1>
      <p className="text-sm text-gray-500 mb-4">
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          month: "short",
          day: "numeric",
        })}
      </p>

      <div className="grid grid-cols-3 gap-3 mb-5">
        <Stat label="Total" value={todays.length} accent="blue" />
        <Stat label="Pending" value={pending} accent="yellow" />
        <Stat label="Done" value={done} accent="green" />
      </div>

      {todays.length === 0 ? (
        <EmptyState
          title="No bookings today"
          hint="New bookings will show up here automatically."
        />
      ) : (
        <ul className="space-y-3">
          {todays.map((b) => (
            <li key={b.id}>
              <BookingRow
                booking={b}
                service={getService(b.serviceId)}
                slot={getSlot(b.slotId)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "yellow" | "green";
}) {
  const colors = {
    blue: "bg-brand-blue text-white",
    yellow: "bg-brand-yellow text-brand-blue",
    green: "bg-green-100 text-green-800",
  } as const;
  return (
    <div className={`rounded-2xl p-4 ${colors[accent]}`}>
      <p className="text-2xl font-extrabold leading-none">{value}</p>
      <p className="text-xs uppercase tracking-wider mt-2 opacity-90">{label}</p>
    </div>
  );
}
