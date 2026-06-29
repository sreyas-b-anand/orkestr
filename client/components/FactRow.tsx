export function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-sm text-foreground leading-relaxed">{value}</p>
    </div>
  );
}