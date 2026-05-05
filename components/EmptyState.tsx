export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="card text-center py-10">
      <p className="font-semibold text-gray-700">{title}</p>
      {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
