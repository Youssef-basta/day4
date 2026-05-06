"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateSettingsAction } from "@/app/admin/actions";
import type { StudioSettings } from "@/lib/types";

export function SettingsForm({ initial }: { initial: StudioSettings }) {
  const router = useRouter();
  const [form, setForm] = useState<StudioSettings>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function update<K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K]
  ) {
    setSaved(false);
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await updateSettingsAction(form);
        setSaved(true);
        router.refresh();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Could not save settings");
      }
    });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Settings</h1>
        <p className="text-xs text-gray-500 mt-1">
          Brand identity and operational settings. Changes are visible to
          customers immediately after saving.
        </p>
      </div>

      <Group title="Brand">
        <Field label="Brand name">
          <input
            className="input"
            value={form.brandName}
            onChange={(e) => update("brandName", e.target.value)}
          />
        </Field>
        <Field label="Tagline kicker" hint="Small label above the headline">
          <input
            className="input"
            value={form.heroKicker ?? ""}
            onChange={(e) => update("heroKicker", e.target.value || undefined)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Headline 1">
            <input
              className="input"
              value={form.heroHeadline1 ?? ""}
              onChange={(e) =>
                update("heroHeadline1", e.target.value || undefined)
              }
            />
          </Field>
          <Field label="Headline 2 (yellow)">
            <input
              className="input"
              value={form.heroHeadline2 ?? ""}
              onChange={(e) =>
                update("heroHeadline2", e.target.value || undefined)
              }
            />
          </Field>
        </div>
        <Field label="Subheading">
          <textarea
            className="input min-h-[64px]"
            value={form.heroSubheading ?? ""}
            onChange={(e) =>
              update("heroSubheading", e.target.value || undefined)
            }
          />
        </Field>
      </Group>

      <Group title="Why-us tiles">
        {([1, 2, 3] as const).map((i) => {
          const titleKey = `feature${i}Title` as
            | "feature1Title"
            | "feature2Title"
            | "feature3Title";
          const hintKey = `feature${i}Hint` as
            | "feature1Hint"
            | "feature2Hint"
            | "feature3Hint";
          return (
            <div key={i} className="grid grid-cols-2 gap-3">
              <Field label={`Tile ${i} title`}>
                <input
                  className="input"
                  value={form[titleKey] ?? ""}
                  onChange={(e) =>
                    update(titleKey, e.target.value || undefined)
                  }
                />
              </Field>
              <Field label={`Tile ${i} hint`}>
                <input
                  className="input"
                  value={form[hintKey] ?? ""}
                  onChange={(e) => update(hintKey, e.target.value || undefined)}
                />
              </Field>
            </div>
          );
        })}
      </Group>

      <Group title="Visit us">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Address line 1">
            <input
              className="input"
              value={form.addressLine1 ?? ""}
              onChange={(e) =>
                update("addressLine1", e.target.value || undefined)
              }
            />
          </Field>
          <Field label="Address line 2">
            <input
              className="input"
              value={form.addressLine2 ?? ""}
              onChange={(e) =>
                update("addressLine2", e.target.value || undefined)
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Hours line 1">
            <input
              className="input"
              value={form.hoursLine1 ?? ""}
              onChange={(e) =>
                update("hoursLine1", e.target.value || undefined)
              }
            />
          </Field>
          <Field label="Hours line 2">
            <input
              className="input"
              value={form.hoursLine2 ?? ""}
              onChange={(e) =>
                update("hoursLine2", e.target.value || undefined)
              }
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <input
              className="input"
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value || undefined)}
            />
          </Field>
          <Field label="Phone hint">
            <input
              className="input"
              value={form.phoneHint ?? ""}
              onChange={(e) => update("phoneHint", e.target.value || undefined)}
            />
          </Field>
        </div>
        <Field
          label="Phone placeholder"
          hint="Shown in the customer booking form"
        >
          <input
            className="input"
            value={form.phonePlaceholder ?? ""}
            onChange={(e) =>
              update("phonePlaceholder", e.target.value || undefined)
            }
          />
        </Field>
      </Group>

      <Group title="Operations">
        <Field
          label="No-show grace minutes"
          hint="A pending booking auto-cancels this many minutes after slot start."
        >
          <input
            className="input"
            type="number"
            min={0}
            max={180}
            value={form.graceMin}
            onChange={(e) => update("graceMin", Number(e.target.value))}
          />
        </Field>
      </Group>

      {error && (
        <p className="text-sm text-red-600 font-semibold">{error}</p>
      )}
      {saved && (
        <p className="text-sm text-green-700 font-semibold">
          ✓ Saved. The site picked up the changes.
        </p>
      )}

      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="btn-primary w-full sticky bottom-4"
      >
        {pending ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}

function Group({
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
