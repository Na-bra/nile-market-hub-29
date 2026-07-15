export function Rating({ value, count }: { value: number; count?: number }) {
  const rounded = Math.round(value * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full === 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(full)}
        {half ? "☆" : ""}
        {"·".repeat(empty)}
      </span>
      <span className="text-foreground">{value ? value.toFixed(1) : "—"}</span>
      {typeof count === "number" && (
        <span className="text-muted-foreground">({count})</span>
      )}
    </span>
  );
}
