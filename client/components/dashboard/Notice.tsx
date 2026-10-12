import { CheckCircle2, XCircle, X } from "lucide-react";

export interface NoticeState {
  type: "success" | "error";
  message: string;
}

export function Notice({ notice, onClose }: { notice: NoticeState | null; onClose: () => void }) {
  if (!notice) return null;
  const ok = notice.type === "success";
  return (
    <div
      role="status"
      className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${
        ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {ok ? <CheckCircle2 size={16} className="mt-0.5" /> : <XCircle size={16} className="mt-0.5" />}
      <span className="flex-1">{notice.message}</span>
      <button onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}