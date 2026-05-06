export const dynamic = "force-dynamic";

export default function AdminRemindersPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Reminders</h1>
      <p className="text-xs text-gray-500 mb-5">
        Automatic SMS / email nudges to reduce no-shows.
      </p>

      <div className="card border-2 border-dashed border-brand-yellow/60 bg-amber-50/40">
        <div className="flex items-center gap-2 mb-2">
          <span className="chip bg-brand-yellow text-brand-blue px-2 py-0.5 text-[10px]">
            Coming next
          </span>
          <p className="text-sm font-bold text-brand-blue">
            Automated reminders
          </p>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          Plug a provider (Twilio for SMS, Resend for email) and the app will
          fire reminders on a schedule:
        </p>
        <ul className="space-y-2 text-sm">
          <Bullet>SMS 24 hours before the appointment</Bullet>
          <Bullet>SMS 1 hour before the appointment</Bullet>
          <Bullet>Confirmation email at booking time</Bullet>
          <Bullet>"We missed you" follow-up after a no-show</Bullet>
        </ul>
        <p className="text-[11px] text-gray-500 mt-4">
          Implementation: a Supabase Edge Function or pg_cron job calling the
          provider API; per-customer opt-out flag in the{" "}
          <code className="font-mono">customers</code> table.
        </p>
      </div>

      <div className="card mt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
          Manual nudge (today's pending)
        </h2>
        <p className="text-sm text-gray-600">
          Until the automated flow ships, you can tap the phone number on any
          booking to call or WhatsApp the customer directly.
        </p>
      </div>
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
