import type { ComponentProps } from "react";

type Props = ComponentProps<"select"> & { label: string; error?: string | undefined };

export function Select({ label, error, id, children, className = "", ...props }: Props) {
  const selectId = id ?? props.name;
  return (
    <div className="space-y-1.5">
      <label htmlFor={selectId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        id={selectId}
        className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 ${
          error ? "border-red-400" : "border-slate-300"
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}