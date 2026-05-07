"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  setCustomerNotesAction,
  toggleVipAction,
} from "@/app/admin/actions";

export function CustomerProfileActions({
  phone,
  isVip,
  initialNotes,
}: {
  phone: string;
  isVip: boolean;
  initialNotes: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [notes, setNotes] = useState(initialNotes);
  const [savedNote, setSavedNote] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = notes !== initialNotes;

  function toggleVip() {
    setError(null);
    startTransition(async () => {
      try {
        await toggleVipAction(phone, !isVip);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not update VIP");
      }
    });
  }

  function saveNotes() {
    setError(null);
    setSavedNote(false);
    startTransition(async () => {
      try {
        await setCustomerNotesAction(phone, notes);
        setSavedNote(true);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not save notes");
      }
    });
  }

  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleVip}
          disabled={pending}
          className={`flex-1 rounded-xl py-2 text-sm font-bold ${
            isVip
              ? "bg-gray-100 text-gray-700"
              : "bg-brand-yellow text-brand-blue"
          }`}
        >
          {isVip ? "Remove VIP" : "⭐ Make VIP"}
        </button>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
          Internal notes
        </label>
        <textarea
          className="input min-h-[80px] text-sm"
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setSavedNote(false);
          }}
          placeholder="Allergies, preferred barber, no small talk, etc."
        />
        <p className="text-[11px] text-gray-400 mt-1">
          Visible to admin only.
        </p>
      </div>

      {error && (
        <p className="text-xs text-red-600 font-semibold">{error}</p>
      )}
      {savedNote && !dirty && (
        <p className="text-xs text-green-700 font-semibold">✓ Notes saved.</p>
      )}

      <button
        type="button"
        onClick={saveNotes}
        disabled={!dirty || pending}
        className="btn-primary w-full"
      >
        {pending ? "Saving…" : "Save notes"}
      </button>
    </div>
  );
}
