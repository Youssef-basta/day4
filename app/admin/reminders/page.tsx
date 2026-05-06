import { isEmailConfigured, isSmsConfigured } from "@/lib/reminders";
import { getAllBookings, getAllSlots } from "@/lib/db/admin";
import { todayKey } from "@/lib/seed";
import { formatDateLong, formatTime } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminRemindersPage() {
  const smsReady = isSmsConfigured();
  const emailReady = isEmailConfigured();

  const [bookings, slots] = await Promise.all([
    getAllBookings(),
    getAllSlots(),
  ]);
  const slotById = new Map(slots.map((s) => [s.id, s]));
  const today = todayKey();

  // Bookings due for a reminder: pending, today or tomorrow.
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  })();

  const upcoming = bookings
    .filter((b) => {
      if (b.status !== "pending") return false;
      const slot = slotById.get(b.slotId);
      if (!slot) return false;
      return slot.date === today || slot.date === tomorrow;
    })
    .map((b) => ({
      booking: b,
      slot: slotById.get(b.slotId)!,
    }))
    .sort((a, b) =>
      (a.slot.date + a.slot.time).localeCompare(b.slot.date + b.slot.time)
    );

  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Reminders</h1>
      <p className="text-xs text-gray-500 mb-5">
        SMS and email nudges to reduce no-shows.
      </p>

      {/* Provider status */}
      <section className="grid grid-cols-2 gap-3 mb-6">
        <ProviderCard
          name="SMS"
          subtitle="via Twilio"
          ready={smsReady}
          envHint="TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER"
        />
        <ProviderCard
          name="Email"
          subtitle="via Resend"
          ready={emailReady}
          envHint="RESEND_API_KEY, RESEND_FROM"
        />
      </section>

      {/* Upcoming bookings */}
      <section className="mb-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Today + tomorrow ({upcoming.length} pending)
        </h2>
        {upcoming.length === 0 ? (
          <div className="card text-sm text-gray-600 text-center py-6">
            Nothing pending in the next 24 hours.
          </div>
        ) : (
          <ul className="space-y-2">
            {upcoming.slice(0, 10).map(({ booking, slot }) => (
              <li
                key={booking.id}
                className="card !py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate text-sm">
                    {booking.customerName}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    {booking.phone}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-brand-blue">
                    {formatTime(slot.time)}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {formatDateLong(slot.date)}
                  </p>
                </div>
              </li>
            ))}
            {upcoming.length > 10 && (
              <li className="text-center text-xs text-gray-500 py-2">
                +{upcoming.length - 10} more
              </li>
            )}
          </ul>
        )}
      </section>

      {/* Phase 2 plan */}
      <section className="card border-2 border-dashed border-brand-yellow/60 bg-amber-50/40">
        <div className="flex items-center gap-2 mb-2">
          <span className="chip bg-brand-yellow text-brand-blue px-2 py-0.5 text-[10px]">
            Coming next
          </span>
          <p className="text-sm font-bold text-brand-blue">Automatic schedule</p>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          Once a provider is configured (above), Phase 2 will turn on a cron
          job that sends:
        </p>
        <ul className="space-y-1.5 text-sm text-gray-700">
          <Bullet>SMS 24 hours before the appointment</Bullet>
          <Bullet>SMS 1 hour before the appointment</Bullet>
          <Bullet>Email confirmation at booking time</Bullet>
          <Bullet>"We missed you" follow-up after a no-show</Bullet>
        </ul>
        <p className="text-[11px] text-gray-500 mt-3">
          Implementation: pg_cron job calls a Postgres function that picks
          due reminders, updates a <code className="font-mono">reminders_sent_at</code>{" "}
          jsonb on the booking, and dispatches via the API client (
          <code className="font-mono">lib/reminders.ts</code>).
        </p>
      </section>
    </div>
  );
}

function ProviderCard({
  name,
  subtitle,
  ready,
  envHint,
}: {
  name: string;
  subtitle: string;
  ready: boolean;
  envHint: string;
}) {
  return (
    <div
      className={`card !p-3 ${
        ready ? "ring-2 ring-green-400" : "ring-2 ring-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className="font-bold text-sm">{name}</p>
        <span
          className={`chip text-[10px] px-2 py-0.5 ${
            ready
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {ready ? "Ready" : "Not configured"}
        </span>
      </div>
      <p className="text-[11px] text-gray-500">{subtitle}</p>
      {!ready && (
        <p className="text-[10px] text-gray-400 mt-2 font-mono break-all">
          {envHint}
        </p>
      )}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="text-brand-blue">•</span>
      <span>{children}</span>
    </li>
  );
}
