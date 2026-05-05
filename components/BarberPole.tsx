export function BarberPole({
  className = "",
  orientation = "vertical",
}: {
  className?: string;
  orientation?: "vertical" | "horizontal";
}) {
  const base =
    orientation === "vertical"
      ? "w-2 h-full rounded-full"
      : "h-2 w-full rounded-full";
  return (
    <div
      aria-hidden
      className={`barber-pole ring-1 ring-black/10 shadow-inner ${base} ${className}`}
    />
  );
}
