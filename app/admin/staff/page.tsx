export const dynamic = "force-dynamic";

export default function AdminStaffPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-brand-blue mb-1">Staff</h1>
      <p className="text-xs text-gray-500 mb-5">
        Assign bookings to specific barbers and track per-barber availability.
      </p>

      <div className="card border-2 border-dashed border-brand-yellow/60 bg-amber-50/40">
        <div className="flex items-center gap-2 mb-2">
          <span className="chip bg-brand-yellow text-brand-blue px-2 py-0.5 text-[10px]">
            Coming next
          </span>
          <p className="text-sm font-bold text-brand-blue">
            Multi-barber support
          </p>
        </div>
        <p className="text-sm text-gray-700 mb-3">
          The shop currently runs as a single chair. When you're ready to
          expand to multiple barbers, this section will let you:
        </p>
        <ul className="space-y-2 text-sm">
          <Bullet>Add and manage staff (name, phone, services they offer)</Bullet>
          <Bullet>Assign each booking to a specific barber</Bullet>
          <Bullet>Show per-barber availability in the slot manager</Bullet>
          <Bullet>Filter bookings by staff member</Bullet>
          <Bullet>Per-barber commission reports</Bullet>
        </ul>
        <p className="text-[11px] text-gray-500 mt-4">
          Schema: a new <code className="font-mono">staff</code> table and a{" "}
          <code className="font-mono">bookings.staff_id</code> column.
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
