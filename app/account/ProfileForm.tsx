"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  toggleFavoriteServiceAction,
  updateProfileAction,
} from "./actions";
import type { CustomerProfile, Service, TimeBand } from "@/lib/types";

export function ProfileForm({
  profile,
  services,
}: {
  profile: CustomerProfile;
  services: Service[];
}) {
  const router = useRouter();
  const [name, setName] = useState(profile.name ?? "");
  const [email, setEmail] = useState(profile.email ?? "");
  const [password, setPassword] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(profile.smsOptIn);
  const [emailOptIn, setEmailOptIn] = useState(profile.emailOptIn);
  const [timeBand, setTimeBand] = useState<TimeBand>(profile.preferredTimeBand);
  const [favorites, setFavorites] = useState<string[]>(
    profile.favoriteServiceIds
  );
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function save() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await updateProfileAction({
        name,
        email,
        preferredTimeBand: timeBand,
        smsOptIn,
        emailOptIn,
        password: password || undefined,
      });
      if ("error" in res) setError(res.error);
      else {
        setSaved(true);
        setPassword("");
        router.refresh();
      }
    });
  }

  function toggleFavorite(id: string) {
    const optimistic = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];
    setFavorites(optimistic);
    startTransition(async () => {
      const res = await toggleFavoriteServiceAction(id);
      if ("error" in res) {
        setFavorites(profile.favoriteServiceIds); // revert
        alert(res.error);
      } else {
        setFavorites(res.favoriteServiceIds);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-5">
      <Section title="Profile">
        <Field label="Full name">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Phone" hint="Your phone number is your login.">
          <input className="input bg-gray-50" value={profile.phone} disabled />
        </Field>
        <Field label="Email">
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Field
          label="New password"
          hint="Leave blank to keep your current password."
        >
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="••••••••"
            minLength={8}
          />
        </Field>
      </Section>

      <Section title="Preferences">
        <Field
          label="Preferred time"
          hint="Helps us prioritize slots that work for you."
        >
          <div className="flex gap-2">
            {(
              [
                { id: "any", label: "Any" },
                { id: "morning", label: "Morning" },
                { id: "afternoon", label: "Afternoon" },
                { id: "evening", label: "Evening" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTimeBand(opt.id)}
                className={`flex-1 rounded-xl py-2 text-xs font-bold ${
                  timeBand === opt.id
                    ? "bg-brand-blue text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field
          label="Favorite services"
          hint="Tap to mark — favorites stand out when you book."
        >
          <ul className="grid grid-cols-2 gap-2">
            {services.map((s) => {
              const fav = favorites.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => toggleFavorite(s.id)}
                    className={`w-full rounded-xl border-2 px-3 py-2 text-left text-xs font-semibold transition ${
                      fav
                        ? "border-brand-yellow bg-amber-50 text-brand-blue"
                        : "border-gray-200 text-gray-700"
                    }`}
                  >
                    <span className="block flex items-center gap-1">
                      {fav && <span className="text-brand-yellow">★</span>}
                      <span className="truncate">{s.name}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Field>
      </Section>

      <Section title="Notifications">
        <Toggle
          label="SMS reminders"
          description="Get a text 24 hours and 1 hour before your appointment."
          checked={smsOptIn}
          onChange={setSmsOptIn}
        />
        <Toggle
          label="Email confirmations"
          description="Receive booking confirmations and follow-ups by email."
          checked={emailOptIn}
          onChange={setEmailOptIn}
        />
      </Section>

      {error && <p className="text-sm text-red-600 font-semibold">{error}</p>}
      {saved && (
        <p className="text-sm text-green-700 font-semibold">
          ✓ Profile updated.
        </p>
      )}

      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="btn-primary w-full"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-blue">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full text-left flex items-center gap-3 py-1"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-brand-blue" : "bg-gray-300"
        }`}
        aria-hidden
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-[11px] text-gray-500 leading-snug">
          {description}
        </span>
      </span>
    </button>
  );
}
