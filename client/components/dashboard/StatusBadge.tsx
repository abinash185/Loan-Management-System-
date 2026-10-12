const STYLES: Record<string, string> = {
  APPLIED: "bg-amber-100 text-amber-800",
  SANCTIONED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  DISBURSED: "bg-violet-100 text-violet-800",
  CLOSED: "bg-emerald-100 text-emerald-800",
  REGISTERED: "bg-slate-100 text-slate-700",
  DETAILS_SAVED: "bg-amber-100 text-amber-800",
  SLIP_UPLOADED: "bg-blue-100 text-blue-800",
};

const LABELS: Record<string, string> = {
  DETAILS_SAVED: "Details saved",
  SLIP_UPLOADED: "Slip uploaded",
};

export function StatusBadge({ status }: { status: string }) {
  const label = LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] ?? "bg-slate-100"}`}>
      {label}
    </span>
  );
}