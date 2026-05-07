"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setCustomerNotesAction,
  toggleVipAction,
} from "@/app/admin/actions";
import { EmptyState } from "@/components/EmptyState";
import type { CustomerSummary } from "@/lib/types";

type Filter = "all" | "vip" | "frequent";

export function CustomersList({
  customers,
}: {
  customers: CustomerSummary[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [editingNotesPhone, setEditingNotesPhone] = useState<string | null>(
    null
  );
  const [notesDraft, setNotesDraft] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return customers.filter((c) => {
      if (filter === "vip" && !c.isVip) return false;
      if (filter === "frequent" && c.bookingCount < 3) return false;
      if (q) {
        const hay = `${c.displayName} ${c.phone}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [customers, query, filter]);

  function toggleVip(c: CustomerSummary) {
    setPendingPhone(c.phone);
    startTransition(async () => {
      try {
        await toggleVipAction(c.phone, !c.isVip);
        router.refresh();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Could not update VIP");
      } finally {
        setPendingPhone(null);
      }
    });
  }

  function startEditNotes(c: CustomerSummary) {
    setEditingNotesPhone(c.phone);
    setNotesDraft(c.notes ?? "");
  }

  function saveNotes(phone: string) {
    setPendingPhone(phone);
    startTransition(async () => {
      try {
        await setCustomerNotesAction(phone, notesDraft);
        setEditingNotesPhone(null);
        router.refresh();
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Could not save notes");
      } finally {
        setPendingPhone(null);
      }
    });
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Customers</h1>
      <p className="text-xs text-gray-500 mb-4">
        Aggregated from booking phone numbers. {customers.length} unique
        customer{customers.length === 1 ? "" : "s"}.
      </p>

      <div className="card mb-4 space-y-3">
        <input
          type="search"
          className="input"
          placeholder="Search name or phone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2">
          {(
            [
              { id: "all", label: "All" },
              { id: "vip", label: "VIP only" },
              { id: "frequent", label: "Frequent (3+)" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`flex-1 rounded-xl py-2 text-sm font-bold ${
                filter === opt.id
                  ? "bg-brand-blue text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No customers found"
          hint={
            customers.length === 0
              ? "Customers will appear after their first booking."
              : "Try clearing your search or filter."
          }
        />
      ) : (
        <ul className="space-y-3">
          {filtered.map((c) => {
            const editing = editingNotesPhone === c.phone;
            const busy = pendingPhone === c.phone;
            return (
              <li key={c.phone} className="card">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={`/admin/customers/${encodeURIComponent(c.phone)}`}
                    className="min-w-0 flex-1"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold truncate">{c.displayName}</p>
                      {c.isVip && (
                        <span className="chip bg-brand-yellow text-brand-blue gap-1 px-2 py-0.5">
                          ⭐ VIP
                        </span>
                      )}
                      {c.bookingCount >= 3 && !c.isVip && (
                        <span className="chip bg-blue-100 text-brand-blue px-2 py-0.5 text-[10px]">
                          {c.bookingCount}× regular
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-brand-blue underline-offset-2 hover:underline">
                      {c.phone}
                    </span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleVip(c)}
                    disabled={busy}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold ${
                      c.isVip
                        ? "bg-gray-100 text-gray-700"
                        : "bg-brand-yellow text-brand-blue"
                    }`}
                  >
                    {c.isVip ? "Remove VIP" : "Make VIP"}
                  </button>
                </div>

                <dl className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <Stat label="Bookings" value={c.bookingCount} />
                  <Stat label="Done" value={c.doneCount} accent="green" />
                  <Stat
                    label="Spent"
                    value={`${c.totalSpentKwd} KWD`}
                    accent="yellow"
                  />
                </dl>

                {c.lastVisit && (
                  <p className="text-[11px] text-gray-500 mt-3">
                    Last visit:{" "}
                    {new Date(c.lastVisit).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                )}

                <div className="mt-3 border-t border-gray-100 pt-3">
                  {editing ? (
                    <div className="space-y-2">
                      <textarea
                        className="input min-h-[64px] text-sm"
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        placeholder="Internal notes (allergies, preferred barber, etc.)"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNotesPhone(null)}
                          className="flex-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-semibold py-2"
                          disabled={busy}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveNotes(c.phone)}
                          className="btn-primary flex-1 !py-2 text-sm"
                          disabled={busy}
                        >
                          Save notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditNotes(c)}
                      className="text-xs font-semibold text-brand-blue"
                    >
                      {c.notes ? `📝 ${c.notes}` : "+ Add note"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
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
  value: number | string;
  accent?: "green" | "yellow";
}) {
  const cls =
    accent === "green"
      ? "text-green-700"
      : accent === "yellow"
      ? "text-brand-blue"
      : "text-brand-blue";
  return (
    <div className="bg-gray-50 rounded-lg py-1.5">
      <p className={`text-sm font-extrabold leading-none ${cls}`}>{value}</p>
      <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </div>
  );
}
